# Implementation Plan

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung  
**Update date**: 2026-06-23  

## 1. Implementation Principle

- Keep the parser strict and template-driven.
- Reuse `MarkdownParserCore` for shared Markdown mechanics and keep self-review-specific rules inside `SelfReviewMarkdownParser`.
- Preserve the legacy 11-section template and normalize only through a fixed alias map.
- Keep the file endpoint internal and path-guarded.
- Reuse existing scan persistence if the parser output is written downstream.
- Avoid new tables, migrations, or FE work for this ticket.

## 2. Alternative Plan
| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Dedicated self-review parser envelope on top of the shared core, with internal parse endpoints and optional scanner hook | Clear separation, easier to test, strict template control, reuse-first | Requires a dedicated parser class and tests | Chosen |
| B | Extend the spec-pack parser to also handle self-review | Less new code | Mixes two templates and increases regression risk | Rejected |
| C | Generic heuristic Markdown parser for all ticket docs | Flexible for future documents | Violates the rule-based requirement and is hard to audit | Rejected |

## 3. Reason for Choosing the Alternative Plan

Option A is the safest choice because the self-review template has its own fixed 11-section structure, its own verdict normalization rules, and its own path guard requirements. A dedicated envelope keeps the implementation auditable and prevents accidental drift from the spec-pack parser.

## 4. Expected Change File
| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | Add the dedicated parser envelope and verdict / section / placeholder rules | Core implementation for self-review parsing | AC-1..AC-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SelfReviewMarkdownParserController.java` | Add guarded parse-inline / parse-file endpoints | Manual / QA verification entrypoint | AC-1, AC-2, AC-9 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Hook the parser into the scan flow when self-review artifacts are processed | Persist structured parse output through the existing scan flow | AC-5..AC-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Reuse the existing snapshot / section / evidence persistence methods | No new schema or repository layer required | AC-5..AC-10 |
| `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SelfReviewMarkdownParserTest.java` | Parser unit tests and regression cases | Protect the parser contract | AC-1..AC-10 |
| `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SelfReviewMarkdownParserControllerTest.java` | Path-guard and response-shape tests | Protect the boundary and internal API contract | AC-1, AC-9 |
| `docs/changes/PARSER-SELF-REVIEW/source-availability.md` | Source availability summary for the phase | Traceability for the next phase | All ACs |
| `docs/changes/PARSER-SELF-REVIEW/source-inventory.md` | Inventory of relevant files and missing files | Traceability for the next phase | All ACs |
| `docs/changes/PARSER-SELF-REVIEW/impact-analysis.md` | Impact boundaries and unaffected areas | Traceability for the next phase | All ACs |

## 5. Class / Function / Method to Add or Modify
| target | action | input | output | note |
|---|---|---|---|---|
| `SelfReviewMarkdownParser` | Add / modify | Markdown content, sourcePath, parseMode | ParsedArtifact envelope with warnings / errors / summary | Dedicated rule-based parser |
| `SelfReviewMarkdownParser.parse(...)` | Add / modify | content + sourcePath + parseMode | Parsed artifact | Must stay deterministic and template-driven |
| `SelfReviewMarkdownParser.hasSection(...)` | Add / modify | ParsedArtifact + aliases | boolean | Fixed alias map only |
| `SelfReviewMarkdownParserController.parseInline(...)` | Add / modify | ParseRequest | JSON response | Internal parse preview |
| `SelfReviewMarkdownParserController.parseFile(...)` | Add / modify | ParseFileRequest | JSON response | Path guard is mandatory |
| `ArtifactScannerService.scan(...)` | Modify if scanner hook is enabled | ArtifactScanRequest | ScanRun / snapshot / evidence | Reuse existing orchestration |
| `ArtifactScannerJdbcAdapter` persistence methods | Reuse / modify if needed | Parsed summary and detail records | Inserted / updated rows | No new schema should be introduced |

## 6. SQL / Query / Repository Policy

- Do not add a new migration for the parser itself.
- Reuse existing scan persistence patterns if the downstream storage path is enabled.
- Do not store raw content separately just to make the parser easier to debug.
- Keep idempotency anchored on source path and content hash.
- If a query is needed for verification, prefer existing lookup / upsert patterns instead of new repository abstractions.

## 7. Validation / Error / Logging Policy

- Reject blank content and invalid paths early.
- Warn on missing required sections, malformed tables, placeholders, or nested subsections beyond the allowed depth.
- Normalize verdict values only to `PASS`, `NEEDS_UPDATE`, or `BLOCKED`.
- Log ticket ID, source path, parse mode, content hash, parse status, warning count, and error count.
- Do not log raw content, secrets, or any sensitive source text.

## 8. Migration / Rollback Policy

- No new migration is expected.
- If scanner integration is enabled and causes issues, disable the hook first; do not touch schema.
- Keep rollback narrow and feature-scoped so the rest of the scanner flow remains intact.

## 9. Step Implementation
| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Lock the parser contract against the canonical template and fixed alias map | `spec-pack.md`, `raw/self-review-template.md`, `ticket-rules.md` | AC mapping is complete and stable | Stop if the canonical template or alias map changes |
| 2 | Finalize the parser envelope on top of the shared core | `SelfReviewMarkdownParser.java` | Canonical fixture parses and verdict normalizes | Stop if section order or subtree rules drift |
| 3 | Add the internal controller with path guard | `SelfReviewMarkdownParserController.java` | Path-guard tests pass for file and inline requests | Stop if the endpoint must become generic or public |
| 4 | Wire parser output into scanner persistence when enabled | `ArtifactScannerService.java`, `ArtifactScannerJdbcAdapter.java` | Parsed summary, section rows, and evidence rows are persisted | Stop if persistence requires a new schema |
| 5 | Add parser and controller regression tests | `SelfReviewMarkdownParserTest.java`, `SelfReviewMarkdownParserControllerTest.java` | Canonical, boundary, and negative cases pass | Stop if expected outputs are still unstable |
| 6 | Record source inventory and impact analysis | `source-availability.md`, `source-inventory.md`, `impact-analysis.md` | Artifact docs are complete and reviewable | Stop if the phase cannot be traced back to the source inventory |

## 10. How to Verify Each Step

- Parse the canonical `self-review.md` fixture and verify all 11 sections are recognized.
- Verify header metadata, verdict normalization, and placeholder detection.
- Verify missing required sections produce a partial parse / warning state rather than a silent success.
- Verify nested subsections beyond one child level are warned and not structurally expanded.
- Verify the file endpoint rejects paths outside `docs/changes/<TICKET>/self-review.md`.
- Verify re-parsing the same content yields the same content hash.
- If scanner integration is enabled, verify that parsed summary, section rows, and evidence rows are persisted through the existing adapter.

## 11. Corresponding AC Table
| AC ID | implementation point | verification |
|---|---|---|
| AC-PARSER-SELF-REVIEW-1 | Parse canonical file and infer ticket ID | Canonical fixture test |
| AC-PARSER-SELF-REVIEW-2 | Header metadata parsing | Header field regression test |
| AC-PARSER-SELF-REVIEW-3 | Section detection and order handling | Shuffled / boundary heading test |
| AC-PARSER-SELF-REVIEW-4 | Required / recommended / optional classification | Missing section and completeness test |
| AC-PARSER-SELF-REVIEW-5 | Table extraction | Row-by-row table parsing test |
| AC-PARSER-SELF-REVIEW-6 | Free-text preservation | Free-text regression test |
| AC-PARSER-SELF-REVIEW-7 | Verdict normalization | PASS / NEEDS_UPDATE / BLOCKED test |
| AC-PARSER-SELF-REVIEW-8 | Placeholder / incomplete marking | Placeholder fixture test |
| AC-PARSER-SELF-REVIEW-9 | Missing section and malformed table warnings | Negative parsing tests |
| AC-PARSER-SELF-REVIEW-10 | Idempotent content hash | LF / CRLF and rerun hash test |

## 12. Stop / Ask Condition

- Stop if the canonical template changes.
- Stop if aliases outside the fixed map are requested.
- Stop if raw content persistence or a new audit table becomes mandatory.
- Stop if the parser must be exposed publicly rather than kept internal-only.
- Stop if scanner persistence needs a new schema instead of reuse-first storage.

## 13. Do Not Do This Ticket

- Do not convert the parser into a generic file reader.
- Do not add NLP heuristics to infer missing sections or verdicts.
- Do not add new schema just for convenience.
- Do not expose the parser publicly without explicit approval.
- Do not log raw content or sensitive values.

## 14. Open Related Issues

- No blocking open issue remains after choosing the dedicated self-review envelope, the internal path-guarded controller, and the reuse-first persistence approach.