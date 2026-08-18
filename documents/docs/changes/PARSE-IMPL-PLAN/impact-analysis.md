# Impact Analysis

**Ticket ID**: PARSE-IMPL-PLAN
**Create date**: 2026-06-18
**Author**: ChatGPT
**Update date**: 2026-06-19

## 1. Change Content

- Add parser support for `docs/changes/{{TICKET}}/impl-plan.md`.
- Extract only the fields defined in the `impl-plan.md` template.
- Persist parsed output in existing artifact snapshot and parsed-section tables.
- Detect missing sections, malformed tables, and parse errors early.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `docs/changes/PARSE-IMPL-PLAN/impl-plan.md` | Target file to parse | input source |
| `docs/changes/PARSE-IMPL-PLAN/source-availability.md` | Records what sources are available | planning artifact |
| `docs/changes/PARSE-IMPL-PLAN/source-inventory.md` | Records source inventory and gaps | planning artifact |
| `docs/changes/PARSE-IMPL-PLAN/impact-analysis.md` | This artifact itself | planning artifact |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | Needs field extraction logic | new feature |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/ImplPlanParseJdbcAdapter.java` | Maps output to existing DB tables | new feature |
| `docs/changes/PARSE-IMPL-PLAN/test-plan.md` | Needs tests for parsing and error handling | planning artifact |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| Shared markdown parsing utilities | May be reused or extended | low |
| Common validation helpers | May be reused for section checks | low |
| Audit / log helper | May record parse runs | low |
| UI list/detail components for parsed results | If result viewer is exposed | medium |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| Parser orchestration job | impl-plan parser | Parse source file into structured output |
| Parser | markdown section extractor | Extract headings and table data |
| Parser | result persistence layer | Store parsed output and status in existing snapshot tables |
| UI query screen | parsed result API | Display parsed fields and parse status |

## 5. FE Impact

- If a UI is exposed, it should show the parsed `impl-plan.md` result and parse status.
- The UI does not need to display raw source file content by default.
- Filter by ticket and parse status may be added for review convenience.

## 6. BE Impact

- Add a parser module dedicated to `impl-plan.md`.
- Add validation for required sections in the template.
- Add parse status normalization.
- Add safe error summary generation.
- Add idempotent storage for re-parse cases using the existing snapshot unique key.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| parse trigger / query endpoint | May accept ticket id or source path | Returns parse status, extracted fields, and error summary | yes if additive |

## 8. DTO / Schema / Validation Impact

- A normalized DTO is needed for the parsed `impl-plan.md` content.
- Validation must ensure the source file contains the expected template sections.
- Missing required sections must be reported explicitly rather than silently ignored.

## 9. DB / Migration Impact

- Reuse `tbl_fact_artifact_snapshot` for the main parse result.
- Reuse `tbl_fact_artifact_parsed_section` for section-level values and warnings.
- Store ticket reference, repository reference, artifact type, source path, content hash, parse status metadata, and safe summary JSON.
- Do not add `tbl_fact_doc_parse_*` tables.

## 10. Batch / Job / Event Impact

- A parser job or batch step is needed to process the source file.
- Re-parse should be possible when the source file changes.

## 11. Test Impact

- Unit tests for field extraction.
- Unit tests for missing section handling.
- Integration tests for parsing and persistence.
- Negative tests for malformed markdown and table shapes.

## 12. Operation / Monitoring Impact

- Parse runs should be traceable by ticket and traceId.
- Parse error summaries should be safe and non-sensitive.
- Operators should be able to distinguish parse success, partial parse, and parse failure.

## 13. Rollout / Rollback Impact

- Roll out parser logic in a small step.
- If parsing causes incorrect extraction, disable the parser and revert to previous parser behavior.
- Keep source data unchanged during rollback.

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| Non-impl-plan ticket templates | unaffected | This ticket parses only `impl-plan.md` |
| Business logic execution | unaffected | Parser only, no business action execution |
| Raw source mutation | unaffected | Parser is read-only |
| Secret / credential storage | unaffected | No secret storage in parser output |

## 15. Required Options

- Confirm whether missing optional sections should be `PARTIAL` or `PARSE_ERROR`.
- Confirm whether renamed headings should be accepted as aliases.
- Confirm whether the UI is in scope for the PoC.

## 16. Human Decision Required

- Parse behavior for missing sections.
- Alias handling policy.
- UI exposure scope.

## 17. Risk Summary

- Risk of section mismatch with the template.
- Risk of inconsistent headings or table formats.
- Risk of over-parsing content that is not part of the template.
