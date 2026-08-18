# Spec Pack

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung  
**Update date**: 2026-06-22

## 1. Context / Purpose

`self-review.md` is the final structured evidence document in the ticket flow. This document records the implementation summary, AC mapping, changed files, commands and results, checklist status, tests, bugs, risks, human review, AI prediction, and the final verdict. A dedicated parser is needed so Data Ops, QA, and PM can read this file consistently without having to interpret free-form Markdown on their own.

The parser is designed to be strict. It must adhere to the fixed 11-section template and must not behave like a free-form natural-language parser for any document type.

Nested subsections are allowed only up to 1 child level under a heading; anything deeper must trigger a warning and must not be parsed into structure.

Missing required sections should default to a partial parse with warning/incomplete status; it should not hard fail if the issue is only ordinary missing or incomplete content.

The parser endpoint is internal by default and must not be publicly exposed in production unless separately approved.

## 2. Scope

### 2.1. Within range

- Parse `docs/changes/<TICKET>/self-review.md` files that follow the standard 4-line header and the 11-section template.
- Read metadata from the header: Ticket ID, Create date, Author, Update date.
- Correctly identify all 11 template sections in the proper order.
- Classify sections as required, recommended, or optional.
- Parse the tables in sections 2, 3, 4, 5, 7, and 8.
- Preserve free-text sections as structured text blocks.
- Normalize the final verdict to `PASS`, `NEEDS_UPDATE`, or `BLOCKED`.
- Detect placeholders, empty sections, missing sections, malformed tables, and other quality issues.
- Evaluate completeness according to the subtree rule in the requirement.
- Produce structured output for downstream evidence, review, and traceability.

### 2.2. Out of range

- General-purpose Markdown understanding for all document types.
- Parsing `spec-pack.md`, requirement documents, or design documents with the same parser.
- Ticket planning, estimation, or writing human review content.
- Rendering UI or creating a dedicated frontend screen.
- Ingesting GitHub webhooks, PR metadata, or CI runs.
- General-purpose NLP summarization beyond the template fields.
- Storing secrets, raw prompts, raw chat, or raw source code.

## 3. Terminology
| terms | meaning | notes |
|---|---|---|
| Self review | Ticket-level evidence document that reports implementation status and verification. | The current target file is `self-review.md`. |
| Header metadata | The four lines at the top of the file: Ticket ID, Create date, Author, Update date. | Treated as structured metadata. |
| Required section | A section that must exist for the parse to be considered complete. | Missing required sections make the parse incomplete and trigger a warning; only a serious structural failure should hard-fail. |
| Recommended section | A section that improves evidence quality but is not always blocking. | Should not be silently ignored if missing. |
| Optional section | A section that is useful for analytics but not yet required for the MVP. | Section 9 is the main example and is confirmed as optional. |
| Subtree completeness | A section is considered to have content if any child section or descendant contains real content. | Prevents false empty detection when content is nested deeper. |
| Verdict | The final self-review result. | Must be normalized to `PASS`, `NEEDS_UPDATE`, or `BLOCKED`. |
| Placeholder | Temporary text such as `---`, `TBD`, `TODO`, `<...>`, or `N/A`. | Must not be counted as complete evidence. |

## 4. As-Is

- The repository already contains the `self-review.md` template in the raw pack.
- There is already a Markdown parser pattern in the backend, but no dedicated self-review parser has been found yet.
- The current source also shows an artifact scanner flow and a strict parser pattern for spec-pack-like documents.
- Commands, checklist status, risks, and verdict still need to be read manually today.
- There is no dedicated test fixture for the self-review parser yet.

## 5. To-Be

- The parser reads a standard self-review file and returns stable structured output.
- Each required section has a clear presence/content status.
- Table sections are extracted into records in their original order.
- Free-text sections are preserved without losing evidentiary value.
- The final verdict is normalized and validated.
- Placeholders and malformed content are reported clearly.
- The parser output is suitable for downstream quality checks and review dashboards.

## 6. Detailed specification

### 6.1. Business Rules

- The parser must accept the standard 4-line header and all 11 headings in the template.
- Section order matters; the parser should warn when the order is significantly different.
- Section completeness must be evaluated by subtree, not just by whether a heading exists.
- Sections 1, 6, 9, 10, and 11 are free-text sections, but section 11 must still be normalized to a supported verdict.
- Sections 2, 3, 4, 5, 7, and 8 are table-based sections and must be parsed row by row.
- If a required section is missing, the file must be marked incomplete; a partial parse with warnings is the default behavior.
- If a recommended section is missing, a warning must be emitted; it must not be treated as an unqualified success.
- Section 9 is optional; it may be empty without failing the entire parse, but the parser must record that it is missing.
- Nested subsections are allowed only up to 1 child level under a heading; anything deeper must trigger a warning and must not be parsed into structure.
- Placeholder values must never be counted as complete evidence.
- The parser must not infer commands, tests, bugs, or risks that are not present in the file.

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| markdown content | string | Yes | Non-empty UTF-8 Markdown | Main parser input. |
| source path | string | No | When present, must match `docs/changes/<TICKET>/self-review.md` | Used to infer the ticket and validate the path. |
| ticket id hint | string | No | If present, it should match the path or header | Useful for indirect ingestion. |
| template version hint | string | No | If versioning exists later, it must map to a supported template | Only needed if versioning is added later. |

### 6.3. Output
| item | type | format | notes |
|---|---|---|---|
| `ticket_id` | string | identifier like `PARSER-SELF-REVIEW` | Inferred from the header or source path. |
| `header_metadata` | object | key/value map | Contains the 4 header fields. |
| `sections` | array/object | ordered section tree | Preserves section order and subtree relationships. |
| `table_sections` | array | row records | Sections 2, 3, 4, 5, 7, and 8. |
| `free_text_sections` | array | structured text blocks | Sections 1, 6, 9, 10, and 11. |
| `final_verdict` | string | `PASS` / `NEEDS_UPDATE` / `BLOCKED` | Must contain only normalized values. |
| `required_sections_missing` | array | section identifiers | Empty when all required sections are present. |
| `warnings` | array | warning records | Used for missing recommended sections, placeholders, or format drift. |
| `errors` | array | error records | Used for broken structure or invalid file/path conditions. |
| `content_hash` | string | SHA-256 | Supports idempotent rerun detection. |
| `parser_version` | string | semantic/version tag | Helps with regression traceability. |
| `completeness_status` | string | `COMPLETE` / `PARTIAL` / `FAILED` | Aggregate status for downstream consumers. |

### 6.4. Error / Exception
| case | expected behavior | message/code | notes |
|---|---|---|---|
| File missing | Report missing artifact or file-not-found condition | `artifact_missing` | Do not fabricate content. |
| Wrong path | Reject files outside the allowed ticket directory | `path_guard_failed` | Prevents generic file-read behavior. |
| Missing required header field | Mark parse as incomplete and emit warning or error depending on severity | `header_missing` | Severity depends on how many fields are missing. |
| Missing required section | Mark file incomplete and emit warning | `section_missing` | Partial parse is the default; only severe structural failure should hard-fail. |
| Malformed table | Keep the readable part and emit a table parse error | `table_invalid` | Do not remove surrounding content. |
| Invalid verdict | Emit an error and keep raw text for review | `verdict_invalid` | Only supported values may be normalized. |
| Placeholder-only section | Warn and mark as incomplete | `placeholder_detected` | A placeholder is not real evidence. |
| Duplicate / conflicting AC-style row content | Warn and keep the original order | `row_duplicate_or_conflict` | Useful for manual correction. |

### 6.5. Boundary Value
| item | min | max | special cases | expected |
|---|---|---|---|---|
| Header fields | 4/4 present | 4/4 present | one or more fields missing | Missing fields reduce completeness. |
| Section count | 0 | 11 + nested subsections | duplicate headings | Count by subtree and order, not by heading text alone. Nested subsections beyond 1 child level must warn. |
| Table rows | 0 | Many rows | bullet list instead of markdown table | Parse what can be read and warn about the format drift. |
| Verdict text | 1 token | short sentence | mixed case / extra spaces | Only supported values may be normalized. |
| File size | Empty file | Very large ticket file | long command lists or long risk text | Must not crash on large content. |
| Charset / line endings | ASCII/UTF-8 | UTF-8 with mixed CRLF/LF | multilingual content | Text must remain safe. |

### 6.6. Non-functional
| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Parse normal ticket files fast enough for batch use | No obvious slowdown on repository-sized Markdown | Unit + integration smoke tests | The raw pack does not define a numeric SLO. |
| Security | Must not become a generic file-read primitive | Only parse allowed ticket paths or sanitized input | Path-guard tests + code review | Do not log secrets, prompts, or chat. |
| Availability / Reliability | Partial or malformed input must not crash the job | Return warnings/errors and preserve valid evidence where possible | Negative tests + rerun tests | Important for Data Ops stability. |
| Maintainability | Section mapping should be easy to update | Mapping should be data-driven or clearly isolated | Code review + regression tests | Avoid repeated hard-coded logic. |
| Observability / Logging | Parse runs must be auditable | Trace by ticket, path, hash, parser version, and status | Log review + integration tests | Use traceId when available. |
| Compatibility | Support the current template and UTF-8 Markdown | Backward compatible with the 11-section template | Fixture-based regression tests | Mixed line endings are acceptable. |

## 7. Acceptance Criteria
| ACID | description | testable? | notes |
|---|---|---|---|
| AC-PARSER-SELF-REVIEW-1 | The parser reads a standard `self-review.md` file and correctly identifies the ticket ID. | Yes | The ticket ID can come from the header or the path. |
| AC-PARSER-SELF-REVIEW-2 | The parser reads all 4 header fields and keeps them in structured form. | Yes | Ticket ID, Create date, Author, Update date. |
| AC-PARSER-SELF-REVIEW-3 | The parser correctly identifies all 11 canonical sections in the proper order. | Yes | Order drift must be reported. |
| AC-PARSER-SELF-REVIEW-4 | The parser classifies sections as required, recommended, or optional. | Yes | Required sections must be strict; section 9 is optional. |
| AC-PARSER-SELF-REVIEW-5 | The parser extracts table rows from sections 2, 3, 4, 5, 7, and 8. | Yes | Row order must be preserved. |
| AC-PARSER-SELF-REVIEW-6 | The parser preserves free-text evidence from sections 1, 6, 9, 10, and 11. | Yes | Evidence must not be silently dropped. |
| AC-PARSER-SELF-REVIEW-7 | The parser normalizes the verdict to `PASS`, `NEEDS_UPDATE`, or `BLOCKED`. | Yes | Mixed case and extra spaces must be accepted. |
| AC-PARSER-SELF-REVIEW-8 | The parser marks required fields that are empty or placeholder-only as incomplete. | Yes | Placeholders must not count as complete evidence. |
| AC-PARSER-SELF-REVIEW-9 | The parser reports missing required sections and malformed tables with clear warnings/errors. | Yes | Severity must reflect the level of impact. |
| AC-PARSER-SELF-REVIEW-10 | Re-parsing the same content must produce the same content hash and must not create duplicate logical output. | Yes | Rerun behavior must be idempotent. |

## 8. Examples

### 8.1. Normal Case

A ticket file contains the 4-line header, all 11 sections, fully populated tables in sections 2, 3, 4, 5, 7, and 8, and the final verdict is `PASS`. The parser returns structured rows, section completeness flags, the normalized verdict, a content hash, and no blocking errors.

### 8.2. Error Case

A ticket file is missing section 4, section 7 is written as a broken bullet list, and section 11 says `done` instead of a supported verdict. The parser still preserves the readable content, warns about the missing/broken content, and reports an invalid verdict error.

### 8.3. Boundary Case

A very short ticket file contains only the title and one placeholder line, or a very long file contains many nested subsections under a free-text area. The parser must still preserve the available content, mark placeholder content as incomplete, and must not crash while traversing the section tree. If a nested subsection goes beyond 1 child level under a heading, the parser must warn and must not build a node structure for that deeper part.

## 9. Source Availability Summary

- `docs/changes/PARSER-SELF-REVIEW/raw/requirement.md`: primary requirement source. High reliability.
- `docs/changes/PARSER-SELF-REVIEW/raw/self-review-template.md`: canonical template source. High reliability.
- `docs/changes/PARSER-SELF-REVIEW/raw/database-design.md`: storage design and reuse-first source. High reliability.
- `docs/architecture/overview.md`, `source-inventory.md`, `service-layer-map.md`, `repository-db-map.md`, `test-map.md`: supporting system context. Medium-to-high reliability.
- `docs/standards/backend.md`, `logging.md`, `security.md`, `testing.md`: implementation constraints. Medium-to-high reliability.
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java`: existing Markdown parser baseline. High reliability for current implementation state.
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java`: strict parser reference pattern. High reliability for design similarity, but not the same template.
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java`: confirms the scanner flow and the expected `self-review.md` filename. High reliability.
- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`: confirms that `SELF_REVIEW` is already a recognized artifact type in the schema seed. High reliability.
- Current gap: no dedicated self-review parser class or test fixture has been found yet.

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: BE only / DB / Batch
- Primary risk: Spec / Source / Contract / Test
- Review mode: Standard
- Required options: Source Analysis / Full Security
```

## 11. FE/BE Contract Impact

- In Phase 1, this parser does not require a new FE screen.
- The parser serves the backend and must be compatible with any internal endpoint that consumes structured parse results.
- If a dev or QA endpoint is kept, its response must be stable and must expose normalized section data, warnings, errors, verdict, and content hash.
- If FE consumes it later, the FE must rely on stable keys for header metadata, section structure, table rows, verdict, and completeness flags.

## 12. DB/Migration Impact

- The MVP does not need a new table.
- Reuse existing tables for artifact snapshot, parsed section, acceptance criteria, decision, risk, evidence event, and data quality.
- `SELF_REVIEW` already exists as an artifact type seed in the current schema, so if the target branch matches the current repo, no new seed is needed.
- If the target branch is missing the artifact-type seed, fix it with seed data only; do not introduce schema churn for Phase 1.

## 13. Security/Privacy Impact

- The parser may only read allowed `docs/changes/<TICKET>/self-review.md` content or equivalent sanitized input.
- It must not become a generic file-read primitive.
- It must not log secrets, raw prompts, raw chat, or the full raw content when only a short trace is needed.
- Path-guard behavior must block traversal attempts and paths outside the ticket scope.
- Placeholder content must be treated as incomplete; it must not be guessed or auto-filled.

## 14. Operation/Maintenance Impact

- Parsing should be idempotent by content hash so repeated runs do not create duplicate logical output.
- Logs should record the ticket ID, source path, hash, parser version, parse status, and issue count.
- Section mapping should be isolated so that template changes do not require rewriting the whole parser.
- When the template changes, old tickets must still be readable unless a clearly approved migration says otherwise.

## 15. Test Strategy Summary

- Unit tests for header parsing, section detection, subtree completeness, verdict normalization, placeholder detection, and table parsing.
- Negative tests for missing sections, broken tables, invalid verdicts, and path-guard failures.
- Regression tests using the canonical self-review fixture plus intentionally broken variants.
- Integration tests for any controller or service entry point that exposes the parser result.
- Idempotency tests to confirm the same content hash is produced when parsing again.

## 16. Human Decision Required
| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
|H-PARSER-SELF-REVIEW-1|Confirm the production exposure of the parser.|Default is internal, and it should not be publicly exposed without separate approval.|Architecture / Security|Closed (internal default)|
|H-PARSER-SELF-REVIEW-2|Confirm the tolerance for nested subsections.|Already decided: at most 1 child level under a heading; anything deeper triggers a warning.|PM / QA|Closed|
|H-PARSER-SELF-REVIEW-3|Confirm how missing required sections should be handled.|Already decided: partial parse with warning/incomplete.|PM / QA|Closed|
|H-PARSER-SELF-REVIEW-4|Confirm whether aliases outside canonical text are supported.|Already decided: only aliases in the parser's fixed map are supported; no free-form inference.|PM / QA|Closed|
|H-PARSER-SELF-REVIEW-5|Confirm whether raw text should be stored alongside normalized output.|Already decided: raw text is not stored separately in normalized output.|Architecture / Data Ops|Closed|
|H-PARSER-SELF-REVIEW-6|Confirm whether a separate audit record is needed beyond the existing reuse tables.|Already decided: no separate audit record; use existing warnings/errors/summary for tracing.|Architecture / Data Ops|Closed|

## 17. Assumptions and Inference Log
| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
|A-PARSER-SELF-REVIEW-1|The parser should preserve backward compatibility with the 11-section template instead of inventing a new format.|The raw template is described as canonical in the requirement.|Low|No|
|A-PARSER-SELF-REVIEW-2|Sections 2, 3, 4, 5, 7, and 8 are the only sections that must be parsed as row-oriented tables.|The template and requirement clearly describe these sections as tabular.|Low|No|
|A-PARSER-SELF-REVIEW-3|Free-text sections should be preserved even when they are short or partially incomplete.|The requirement emphasizes not losing existing evidence.|Low|No|
|A-PARSER-SELF-REVIEW-4|The existing reuse-first schema is sufficient for the MVP output.|The database design source says no new table is needed for v1.|Low|No|
|A-PARSER-SELF-REVIEW-5|The `SELF_REVIEW` artifact type can reuse the current storage/scanner pattern.|The repo already has a seeded artifact type and related scanner model shape.|Low|No|
|A-PARSER-SELF-REVIEW-6|Heading aliases are supported only through the parser's fixed map, not through free-form inference.|Phase 1 decision is already closed.|Low|No|
|A-PARSER-SELF-REVIEW-7|The parser does not store raw text alongside normalized output.|Phase 1 decision is already closed.|Low|No|
|A-PARSER-SELF-REVIEW-8|The parser does not create a separate audit record; tracing uses the existing warnings/errors/summary fields.|Phase 1 decision is already closed.|Low|No|

## 18. Open Issues
| ID | issue | impact | owner | status |
|---|---|---|---|---|
|OI-PARSER-SELF-REVIEW-1|Whether heading aliases outside the canonical text should be supported.|Closed: only aliases in the parser's fixed map are supported.|PM / QA|Closed|
|OI-PARSER-SELF-REVIEW-2|Whether raw text should be stored alongside normalized output.|Closed: raw text is not stored separately in normalized output.|Architecture / Data Ops|Closed|
|OI-PARSER-SELF-REVIEW-3|Whether a separate audit record is needed beyond the existing reuse tables.|Closed: no separate audit record is needed; use existing warnings/errors/summary.|Architecture / Data Ops|Closed|
|OI-PARSER-SELF-REVIEW-4|Whether the canonical heading map needs to be expanded in the future when the template changes.|No requirement yet; monitor this when valid template variants appear.|PM / QA|Closed|