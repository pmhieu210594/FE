# Implementation Plan

**Ticket ID**: PARSER-SPEC-PACK
**Create date**: 2026-06-19 
**Author**: Codex
**Update date**: 2026-06-19 

## 1. Implementation Principle

- Prioritize reuse-first in line with the requirement/database design.
- Do not add new tables for the MVP.
- The parser must be resilient: missing optional sections should generate warnings; only serious structural issues should be errors.
- Every AC must have a clear trace path to tests and review.
- Do not turn the parser into a general-purpose NLP tool; parse only according to the confirmed template and aliases.

## 2. Alternative Plan
| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Reuse `ARTIFACT_SCANNER` as the ingest flow, using a rule-based Markdown parser and the existing schema | No schema change, low risk, aligned with requirement/database design | Alias/normalize rules must be kept strict | Chosen |
| B | Create a dedicated `MARKDOWN_PARSER` runner from the start | Clear operational separation | Increases seed/ops cost, not needed for the MVP | Not chosen |
| C | Build a generic parser for many markdown types | Flexible later on | Risk of spec-pack drift and hard-to-control AC mapping | Not chosen |

## 3. Reason for Choosing the Alternative Plan

Option A was selected because the requirement has already fixed draft/official parsing on the existing ingest flow, and the database design requires reusing the current schema. This approach stays true to the MVP spirit, reduces operational changes, and helps downstream consumers receive normalized data faster.

## 4. Expected Change File
| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | If Phase 3 is implemented, add a specialized spec-pack parser or a normalize wrapper | The existing Markdown parsing foundation must be extended for the spec-pack template | AC-1..AC-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Connect the parser to the scan / idempotent run flow | Reuse the ingest and audit workflow | AC-1, AC-2, AC-8, AC-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Map parse output into snapshot/section/AC tables | Reuse the existing persistence layer | AC-4..AC-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | If a new operational endpoint is needed, wrap the service following the existing pattern | Protect the admin-only boundary | AC-1, AC-9, AC-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Keep only the spec-pack parse endpoint and do not expand it into a production API | Safe guard for parser preview | AC-1, AC-2 |
| `docs/changes/PARSER-SPEC-PACK/context.md` | Technical context for Phase 2 | Required by the ticket workflow | All ACs |
| `docs/changes/PARSER-SPEC-PACK/ticket-rules.md` | Rules for this ticket | Required by the ticket workflow | All ACs |
| `docs/changes/PARSER-SPEC-PACK/test-plan.md` | Test plan aligned to ACs | Required | All ACs |
| `docs/changes/PARSER-SPEC-PACK/blackbox-testcases.md` | Black-box test cases aligned to ACs | Required | All ACs |

## 5. Class / Function / Method to Add or Modify
| target | action | input | output | note |
|---|---|---|---|---|
| `ArtifactNormalizer.parse(String)` | Extend / wrap it to parse spec-pack according to the template | Markdown content | Structured parsed artifact | Must remain pure logic |
| `ArtifactNormalizer.hasSection(...)` | Use as an alias helper, not as the sole validation mechanism | ParsedArtifact + alias list | boolean | Detection only |
| `ArtifactScannerService.scan(...)` | Drive parse + persistence orchestration | ArtifactScanRequest | ScanRun / snapshot | Reuse the existing lifecycle |
| `ArtifactScannerController.run(...)` | Expose the operation only when needed | Request DTO + current user | Result DTO | ADMIN-only |
| `SpecPackMarkdownParserController.parseInline(...)` | Try parsing spec-pack content | Markdown content | JSON response | Not for production use |
| `SpecPackMarkdownParserController.parseFile(...)` | Parse a file with guards | File path | JSON response | Block path traversal |

## 6. SQL / Query / Repository Policy

- Do not create new migrations/tables in Phase 2 / Phase 3 MVP unless the DB design requires it.
- Use the existing tables: `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section`, `tbl_fact_acceptance_criteria`, `tbl_fact_decision`, `tbl_fact_risk`, `tbl_fact_evidence_event`, `tbl_fact_data_quality`.
- Upsert/idempotency must rely on `content_hash`, `ticket_id`, `source_path`, and run metadata.
- Do not write full raw content into the database; store only the required metadata, summaries, and JSONB payloads.
- If expansion is needed, prefer seed/config changes over new DDL.

## 7. Validation / Error / Logging Policy

- `AC-<TICKET>-<n>` is the standard format; invalid AC format must generate a warning while preserving the content.
- Placeholders in required fields must be marked incomplete.
- Missing optional sections: warning; severe structural breakage: error.
- Logs must include `ticket_id`, `content_hash`, `parse_mode`, `parse_status`, `trace_id`, and warning/error counts.
- Do not log raw secrets, raw prompts, raw chats, or raw source code.

## 8. Migration / Rollback Policy

- Phase 2 is documentation only; it does not generate migrations.
- If the implementation phase needs additional code values seeded, rollback by removing the seed or disabling the new connector type, not by rolling back large schema changes.
- No DDL rollback is needed because the MVP does not add new tables.

## 9. Step Implementation
| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Lock context/rules based on the requirement and DB design | `context.md`, `ticket-rules.md` | AC 1..10 are explicitly referenced | Stop if any AC is missing |
| 2 | Lock the implementation plan and selected option | `impl-plan.md` | Full AC matrix, Option A selected | Stop if the plan drifts from reuse-first |
| 3 | Lock review criteria by AC | `review-checklist.md` | Each AC has a review point | Stop if the checklist misses any AC |
| 4 | Build black-box test cases by AC | `blackbox-testcases.md` | 10 ACs each have corresponding test cases | Stop if test cases do not map fully |
| 5 | Build the test plan and test data | `test-plan.md`, `test-data.md` | Test types are correctly tied to ACs | Stop if any AC still lacks a test |
| 6 | Draft the report / self-review skeleton | `self-review.md`, `report.md`, `test-results.md` | A framework exists for the next phase | Stop if the template breaks |

## 10. How to Verify Each Step

- Compare AC 1..10 against the mapping table in every artifact.
- Cross-check methods/paths against the existing source to avoid incorrect method names.
- Cross-check the DB mapping against the database design to avoid adding new tables.
- Re-read the `_ticket-template` to ensure the header/section/table names remain unchanged.
- Make sure no fake open issues are introduced through speculation.

## 11. Corresponding AC Table
| AC ID | implementation point | verification |
|---|---|---|
| AC-SPEC-PARSER-1 | Read `spec-pack.md` from the standard path / synchronized input | Verify the file path exists and can be parsed |
| AC-SPEC-PARSER-2 | Identify `ticket_id` from path / front matter / header | Parsed `ticket_id` matches the input |
| AC-SPEC-PARSER-3 | Prefer front matter when present | Front matter wins when there is a valid conflict |
| AC-SPEC-PARSER-4 | Extract all core sections | Section map is complete according to the template |
| AC-SPEC-PARSER-5 | Extract Terminology, Scope, Detailed Spec, Examples, and Impact sections | Tables are converted into correct records |
| AC-SPEC-PARSER-6 | Separate In Scope / Out of Scope | The two fields are split and not merged |
| AC-SPEC-PARSER-7 | Parse Business Rules / Input / Output / Error / Boundary / Non-functional | Records are structured correctly |
| AC-SPEC-PARSER-8 | Extract ACs and count the number of ACs | AC list and count are accurate |
| AC-SPEC-PARSER-9 | Validate AC format and warn when invalid | Invalid ACs still preserve content and generate warnings |
| AC-SPEC-PARSER-10 | Detect placeholders and rerun idempotently by hash | Placeholders are flagged; identical hashes do not create duplicate snapshots |

## 12. Stop / Ask Condition

- Stop if the real template changes but the raw requirement/database design has not been updated.
- Stop if a new schema is required to map ACs or sections.
- Stop if any AC cannot be clearly mapped to a test case.

## 13. Do Not Do This Ticket

- Do not add behavior beyond the requirement.
- Do not add new tables or migrations for the MVP.
- Do not store full raw content in the database.
- Do not expand this into a generic parser outside the spec-pack template.
- Do not leave any AC without traceability in the Phase 2 artifact.

## 14. Open Related Issues

- There are no mandatory open issues in Phase 2 after aligning with the requirement and database design.