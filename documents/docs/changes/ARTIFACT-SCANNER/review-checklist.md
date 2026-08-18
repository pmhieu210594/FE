# Review Checklist

**Ticket ID**: ARTIFACT-SCANNER   
**Create date**: 2026-06-16   
**Author**: nk_trung      
**Update date**: 2026-06-16    

## 1. Specification/AC Matching
| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-ARTIFACT-SCANNER-01 | The scanner correctly identifies the 8 required files for each ticket, including `blackbox-testcases.md`. | Blocker | TODO |
| AC-ARTIFACT-SCANNER-02 | The scanner correctly infers `ticket_id` from a valid path and does not incorrectly infer it from an invalid path. | Blocker | TODO |
| AC-ARTIFACT-SCANNER-03 | The scanner correctly maps `artifact_type` based on the artifact type configuration/seed. | Blocker | TODO |
| AC-ARTIFACT-SCANNER-04 | The scanner correctly reflects whether required artifacts exist or are missing for each ticket. | Blocker | TODO |
| AC-ARTIFACT-SCANNER-05 | The snapshot stores all minimum required metadata, including path, hash, size, updated time, scan status, and scan message. | Major | TODO |
| AC-ARTIFACT-SCANNER-06 | The scanner correctly detects new artifacts or hash changes. | Major | TODO |
| AC-ARTIFACT-SCANNER-07 | `need_parse` is set correctly when a file is new/changed and is not set incorrectly when there is no change. | Major | TODO |
| AC-ARTIFACT-SCANNER-08 | Phase0 only scans basic metadata and does not parse content. | Major | TODO |
| AC-ARTIFACT-SCANNER-09 | Each scan correctly writes a run log to the V4 connector run mechanism. | Major | TODO |
| AC-ARTIFACT-SCANNER-10 | The scanner does not store full Markdown content in the DB; the parser rereads the source file from the repository using scanner metadata. | Blocker | TODO |
| AC-ARTIFACT-SCANNER-11 | The API/manual test view can display the scan summary and artifact result for review/operation purposes. | Major | TODO |

## 2. General System Review

### 2.1. Number/Input Check
- [X] Clear Numeric Validation
- [X] Full-width Numbers are Processed or Clearly Not Supported
- [X] Half-width/Full-width Mixed Numbers are Considered
- [X] Empty String/Null are Processed
- [X] Clear Digit/Precision/Scale/Rounding
- [X] No Overflow/Underflow

### 2.2. Character Type / Encoding / Locale

- [X] Full-width/half-width/emoji/surrogate pair considered
- [X] Clear trim rule
- [X] Unicode normalization if needed
- [X] No mojibake Shift-JIS/UTF-8
- [X] Japanese/Vietnamese/English messages are not misspelled

### 2.3. Literal / Magic Number

- [X] No hard-coded business code value
- [X] Enum/constant/master used correctly
- [X] Clear mapping display/internal value

### 2.4. Operation / Maintainability

- [X] Sufficient logs for incident investigation
- [X] Correlation ID/request ID if needed
- [X] Retry/double execution considered
- [X] Clear rollback/manual recovery
- [X] Configuration not hard-coded

## 3. API / Manual Review

- [X] API/manual view is placed in the appropriate test/operation flow.
- [X] Only the `endpoints` helper is used; no direct `fetch` calls.
- [X] Minimum loading/error/empty states are available.
- [X] Run summary and artifact result are displayed correctly.
- [X] i18n keys are used for labels/messages if a UI exists.

## 4. BE/API Review

- [X] Scanner boundary is not mixed with parser behavior.
- [X] API does not depend on legacy tables.
- [X] DTO/API response is sufficient for the manual test view.
- [X] `FULL` and `TICKET_SCOPED` are supported correctly for MVP v1.
- [X] `CHANGED_FILES_SCOPED` is not pulled into the main implementation scope.

## 5. DB/Migration Review

- [X] Only V4 tables are used.
- [X] Phase0 artifact types are seeded.
- [X] `size_bytes`, `scan_status`, `scan_message`, and `need_parse` are added.
- [X] `vw_artifact_inventory_current` is created.
- [X] No new inventory table is created.

## 6. Security/Privacy Review

- [X] Full Markdown content is not stored.
- [X] Secrets/tokens/raw content are not logged.
- [X] Manual scanner run/view permissions are appropriate for internal use.
- [X] Unnecessary data is not exposed through the API/manual test.

## 7. Operation/Maintenance Review

- [X] `unknown ticket` is only a warning and does not fail the entire run.
- [X] Run history is sufficient for debugging.
- [X] `scan_message` is clear enough for Data Ops/dev to understand.
- [X] Current inventory can be queried easily through the view.

## 8. Test Review

- [X] There are tests for all 8 required files.
- [X] There is a test for missing artifacts.
- [X] There is a test for unknown tickets.
- [X] There is a test for hash change -> `need_parse`.
- [X] There is a test for Phase0 metadata-only behavior.
- [X] There is a test for run/result rendering.

## 9. Documentation/Traceability Review

- [X] Context/rules/impl-plan match the spec-pack.
- [X] Self-review/test-plan/test-results/report have appropriate skeletons.
- [X] No open blocker decision remains for Phase 2.

## 10. Release/Rollback Review

- [X] Migration has a clear forward-fix/rollback plan.
- [X] If the scanner has a local error, the run can still be partial.
- [X] Existing collectors/parsers outside the ticket scope are not affected.

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect Report | Record Reason for Rejection |
| Accepted Risk | Accepted Risk | Record Impact/Owner/Deadline |