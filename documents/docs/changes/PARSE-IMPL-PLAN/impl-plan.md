# Implementation Plan

**Ticket ID**: PARSE-IMPL-PLAN
**Create date**: 2026-06-18
**Author**: ChatGPT
**Update date**: 2026-06-19

## 1. Implementation Principle

- Parse only the `impl-plan.md` template fields.
- Treat the template headings as the contract for extraction.
- Preserve source text, but store parsed output as structured data.
- Fail safely when required sections are missing or malformed.

## 2. Alternative Plan
| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Parse `impl-plan.md` with a generic markdown parser and infer fields heuristically | Quick start | High risk of wrong mapping and template drift | Rejected |
| B | Parse by explicit template heading contract and section mapping | Accurate and testable | Slightly more implementation work | Selected |
| C | Parse multiple ticket documents in the same run | Broader coverage | Out of scope for this ticket | Rejected |

## 3. Reason for Choosing the Alternative Plan

- The ticket requires predictable extraction from a known template.
- Explicit field mapping reduces false positives and template drift.
- It is easier to test and maintain than heuristic parsing.

## 4. Expected Change File
| file | change summary | reason | related AC |
|---|---|---|---|
| `docs/changes/PARSE-IMPL-PLAN/impl-plan.md` | Source to be parsed | Input target | AC-1 to AC-7 |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing artifact snapshot / parsed section tables | Persistence | AC-4 to AC-6 |
| `docs/changes/PARSE-IMPL-PLAN/impact-analysis.md` | Change impact summary | Planning | AC-1 to AC-7 |
| `docs/changes/PARSE-IMPL-PLAN/source-availability.md` | Source availability tracking | Planning | AC-1 to AC-7 |
| `docs/changes/PARSE-IMPL-PLAN/source-inventory.md` | Source inventory tracking | Planning | AC-1 to AC-7 |
| parser implementation files | parse and persist impl-plan fields | Feature implementation | AC-1 to AC-7 |
| parser tests | verify success / partial / error cases | Verification | AC-1 to AC-7 |

## 5. Class / Function / Method to Add or Modify
| target | action | input | output | note |
|---|---|---|---|---|
| impl-plan parser service | Add | source path / source text | structured parse result | Parses explicit template sections |
| heading extractor | Add | markdown text | section index / section content | Must follow template headings |
| section validator | Add | extracted sections | validation status | Detect missing / malformed sections |
| persistence adapter | Add | parse result DTO | stored record | Idempotent by source hash |
| parse result query API | Add if needed | ticket id / status | parse records | Optional for PoC UI |

## 6. SQL / Query / Repository Policy

- Reuse `tbl_fact_artifact_snapshot` and `tbl_fact_artifact_parsed_section`.
- Enforce idempotency with the existing unique key on repository + source path + content hash.
- Keep queries parameterized.
- Avoid storing raw secret data or unrelated source fragments.

## 7. Validation / Error / Logging Policy

- Validate required template sections.
- Record parse status as `SUCCESS`, `PARTIAL`, `NOT_FOUND`, or `PARSE_ERROR`.
- Keep error summaries safe and non-sensitive.
- Include traceId in logs when available.

## 8. Migration / Rollback Policy

- Prefer additive migration for parse-result storage.
- If parser mapping is wrong, roll back by disabling the parser job and restoring the previous parser version.
- Do not modify the source `impl-plan.md` file during parsing.

## 9. Step Implementation
| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Confirm template heading map for `impl-plan.md` | parser config / rule file | field map review | Stop if headings are ambiguous |
| 2 | Implement heading-based extraction | parser service | unit test for each section | Stop if required sections cannot be detected |
| 3 | Implement validation and status mapping | validator | missing-section tests | Stop if status mapping is unclear |
| 4 | Add persistence for parse results | DB + adapter | idempotency test | Stop if unique key cannot be enforced |
| 5 | Add query surface if needed | API/controller | API response test | Stop if UI is out of scope |
| 6 | Add tests for malformed markdown | test files | negative test pass | Stop if parser is too heuristic |

## 10. How to Verify Each Step

- Verify each expected section is extracted correctly.
- Verify missing sections trigger partial or error status.
- Verify the same source hash updates the same record.
- Verify parse error summaries are safe.
- Verify no unrelated template sections are pulled into the result.

## 11. Corresponding AC Table
| AC ID | implementation point | verification |
|---|---|---|
| AC-PARSE-IMPL-PLAN-1 | source file parsing | unit test |
| AC-PARSE-IMPL-PLAN-2 | explicit field extraction | section extraction test |
| AC-PARSE-IMPL-PLAN-3 | validation for required sections | missing-section test |
| AC-PARSE-IMPL-PLAN-4 | parse status normalization | status mapping test |
| AC-PARSE-IMPL-PLAN-5 | idempotent persistence | duplicate re-parse test |
| AC-PARSE-IMPL-PLAN-6 | query / UI display if enabled | API / UI test |
| AC-PARSE-IMPL-PLAN-7 | safe error summary | negative test |

## 12. Stop / Ask Condition

- Template headings are changed or inconsistent.
- Required sections cannot be mapped deterministically.
- Missing-section policy is not confirmed.
- UI scope is not confirmed.
- Persistence schema cannot guarantee idempotency.

## 13. Do Not Do This Ticket

- Do not parse unrelated ticket documents.
- Do not guess missing fields as fact.
- Do not store secrets or raw logs.
- Do not mutate the source file.
- Do not use heuristic field names that conflict with the template.

## 14. Open Related Issues

- Confirm alias policy for renamed headings.
- Confirm missing-section status behavior.
- Confirm UI scope for the PoC.
