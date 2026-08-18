# Implementation Plan - PARSE-TEST-PLAN-RESULTS

**Ticket ID**: PARSE-TEST-PLAN-RESULTS  
**Create date**: 2026-06-19  
**Author**: OpenAI  
**Update date**: 2026-06-19  

## 1. Implementation Principle

- Keep the parser metadata-first and snapshot-oriented.
- Parse `test-plan.md` and `test-results.md` independently.
- Persist snapshot rows immediately after parse.
- Keep parser output deterministic and idempotent.
- Do not couple parser execution to CI status.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Parse each file independently and store snapshots in existing artifact tables | Simple, aligns with PoC, easy to query and display | Requires careful mapping of two separate templates | Selected |
| B | Merge both files into one combined parse record | Simplifies pairing logic | Loses independent history and violates template separation | Rejected |
| C | Add a new parser-specific table family | Flexible | Duplicates existing artifact storage and increases schema sprawl | Rejected |

## 3. Reason for Choosing the Alternative Plan

- The ticket requires two artifacts with different template fields.
- Independent snapshots preserve each file's history and source hash.
- A paired UI can still be built by joining on `ticket_id` and repository metadata.

## 4. Expected Change File

## 4. Expected Change File

| file                       | change summary                                     | reason               | related AC                                                 |
| -------------------------- | -------------------------------------------------- | -------------------- | ---------------------------------------------------------- |
| TestPlanParseService       | Parse `test-plan.md`                               | Independent parser   | AC-PARSE-TEST-PLAN-RESULTS-1, AC-PARSE-TEST-PLAN-RESULTS-3 |
| TestResultsParseService    | Parse `test-results.md`                            | Independent parser   | AC-PARSE-TEST-PLAN-RESULTS-2, AC-PARSE-TEST-PLAN-RESULTS-3 |
| Snapshot persistence layer | Persist parse snapshots                            | Source of truth      | AC-PARSE-TEST-PLAN-RESULTS-4                               |
| Validation layer           | Missing section, placeholder, structure validation | Quality control      | AC-PARSE-TEST-PLAN-RESULTS-5                               |
| AC Coverage Validation     | Validate AC Matrix coverage                        | Test completeness    | AC-PARSE-TEST-PLAN-RESULTS-5                               |
| Pair View service          | Show both artifacts for one ticket                 | User review          | AC-PARSE-TEST-PLAN-RESULTS-7                               |
| Test fixtures              | Parser verification                                | Automated validation | AC-PARSE-TEST-PLAN-RESULTS-1..7                            |

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| Parser service | Add | source path / source hash / markdown | snapshot + parsed sections | Parse each file independently |
| Section mapper | Add | markdown headings | canonical field keys | Map template section names to keys |
| Snapshot upsert adapter | Add / modify | parsed DTO | persisted snapshot | Must be idempotent |
| Pair-view query service | Add | ticket_id | paired result view | For UI only |

## 6. SQL / Query / Repository Policy

- Reuse existing artifact snapshot tables if available.
- Use a deterministic unique key by ticket, path, hash, and parser version.
- Keep queries parameterized.
- Avoid raw text search when a structured section key is available.

## 7. Validation / Error / Logging Policy

- Reject missing required sections when they cannot be recovered.
- Mark placeholder-only content explicitly.
- Emit safe error summaries only.
- Log `traceId`, parser version, source path, and parse status.

## 8. Migration / Rollback Policy

- Prefer additive schema changes only.
- Do not alter historical snapshots destructively.
- Roll back by disabling parser entrypoint or reverting the parser service, not by deleting valid snapshots.

## 9. Step Implementation

## 9. Step Implementation

| step | action                                    | target file       | verification                                    | stop condition                                |
| ---- | ----------------------------------------- | ----------------- | ----------------------------------------------- | --------------------------------------------- |
| 1    | Implement `test-plan.md` field mapping    | Parser module     | Canonical field assertions                      | Required headings cannot be mapped            |
| 2    | Implement `test-results.md` field mapping | Parser module     | Canonical field assertions                      | Output schema is ambiguous                    |
| 3    | Implement validation layer                | Parser module     | Missing section / placeholder / structure tests | Validation rules unclear                      |
| 4    | Persist snapshot rows                     | Persistence layer | Snapshot assertions                             | Idempotency cannot be guaranteed              |
| 5    | Persist parsed sections                   | Persistence layer | Section assertions                              | Section replacement not atomic                |
| 6    | Implement AC coverage validation          | Validation layer  | AC_NOT_COVERED / UNKNOWN_AC_REFERENCE tests     | AC source cannot be determined                |
| 7    | Implement Pair View retrieval             | Query service     | Pair View API assertions                        | Join keys unavailable                         |
| 8    | Add test fixtures and automated tests     | Tests             | Test suite passes                               | Fixtures do not represent templates correctly |


## 10. How to Verify Each Step

- Verify `test-plan.md` headings map to the expected canonical keys.
- Verify `test-results.md` headings map to the expected canonical keys.
- Verify the same file hash does not create duplicate snapshots.
- Verify paired UI query returns both artifacts for one ticket.
- Verify parse failures produce safe error summaries.

## 11. Corresponding AC Table

| AC ID                        | implementation point                                                                        | verification                      |
| ---------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| AC-PARSE-TEST-PLAN-RESULTS-1 | Independent `test-plan.md` parser                                                           | Unit tests and fixture parsing    |
| AC-PARSE-TEST-PLAN-RESULTS-2 | Independent `test-results.md` parser                                                        | Unit tests and fixture parsing    |
| AC-PARSE-TEST-PLAN-RESULTS-3 | Canonical template section extraction                                                       | Parsed field assertions           |
| AC-PARSE-TEST-PLAN-RESULTS-4 | Immediate snapshot persistence                                                              | Snapshot persistence assertions   |
| AC-PARSE-TEST-PLAN-RESULTS-5 | Missing section, placeholder, duplicate heading, structure validation, parse error handling | Validation and warning assertions |
| AC-PARSE-TEST-PLAN-RESULTS-6 | Idempotent re-parse using source hash and parser version                                    | Same-hash re-parse tests          |
| AC-PARSE-TEST-PLAN-RESULTS-7 | Pair View retrieval for one ticket                                                          | Pair View API assertions          |

## 12. Stop / Ask Condition

- If template headings are missing or ambiguous, ask before implementing fallback logic.
- If the existing DB tables are unavailable or incompatible, confirm the storage plan.
- If pair-view requirements conflict with artifact independence, clarify the UI behavior.
- If any parser method does not exist in source, do not invent it.

## 13. Do Not Do This Ticket

- Do not couple parser execution to CI.
- Do not create draft/official branches.
- Do not store raw markdown as the primary data model.
- Do not introduce non-`tbl_` parse-specific tables.
- Do not infer template sections that are not present.

## 14. Open Related Issues

- Confirm whether existing artifact snapshot tables are already available in the current branch.
- Confirm whether the paired UI is list-only or list + detail.
- Confirm whether list values should be stored as JSON or normalized child rows.
