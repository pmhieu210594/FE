# Review Checklist

**Ticket ID**: CI-RUN-METADATA  
**Create date**: 2026-06-17  
**Author**: ChatGPT  
**Update date**: 2026-06-18  

## 1. Specification/AC Matching
| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-CI-RUN-METADATA-1 | GitHub Actions job metadata can be collected | Blocker | PASS |
| AC-CI-RUN-METADATA-2 | One row is stored per GitHub Actions job | Blocker | PASS |
| AC-CI-RUN-METADATA-3 | Required metadata is stored | Blocker | PASS |
| AC-CI-RUN-METADATA-4 | Only approved `tbl_` tables are used | Blocker | PASS |
| AC-CI-RUN-METADATA-5 | Repository linkage is mandatory | Blocker | PASS |
| AC-CI-RUN-METADATA-6 | PR linkage works when PR metadata is available | Major | PASS |
| AC-CI-RUN-METADATA-7 | Ticket linkage works when ticket ID can be inferred | Major | PASS |
| AC-CI-RUN-METADATA-8 | Duplicate collection updates existing row, not duplicate insert | Blocker | PASS |
| AC-CI-RUN-METADATA-9 | Running job can be stored with `completed_at = null` | Major | PASS |
| AC-CI-RUN-METADATA-10 | GitHub API failure is recorded in `tbl_connector_run` | Major | PASS |
| AC-CI-RUN-METADATA-11 | Forbidden data is not stored or logged | Blocker | PASS |
| AC-CI-RUN-METADATA-12 | PM dashboard CI display if FE/query scope is approved | Major | N/A |
| AC-CI-RUN-METADATA-13 | Ticket evidence detail CI display if FE/query scope is approved | Major | N/A |

## 2. General System Review

### 2.1. Number/Input Check
- [x] GitHub workflow run ID is not truncated.
- [x] GitHub job ID is not truncated.
- [x] Empty / null workflow run ID is rejected or skipped with safe connector error.
- [x] Empty / null job ID is rejected or skipped with safe connector error.
- [x] `started_at <= completed_at` is enforced when both values exist.
- [x] `completed_at = null` is allowed for running / queued jobs.

### 2.2. Character Type / Encoding / Locale
- [x] Workflow name and job name support UTF-8.
- [x] Workflow/job names with spaces, slash, hyphen, underscore, emoji, or non-English characters do not break persistence.
- [x] Error messages and logs are readable and do not contain mojibake.

### 2.3. Literal / Magic Number
- [x] CI provider value is centralized.
- [x] CI status values are centralized and test-covered.
- [x] Status mapping does not treat unknown GitHub conclusion as success.

### 2.4. Operation / Maintainability
- [x] Sufficient logs for incident investigation.
- [x] Correlation ID/request ID is persisted when available.
- [x] Retry/double execution considered via idempotent upsert.
- [x] Clear rollback/manual recovery posture is documented.
- [x] Configuration is not hard-coded.

## 3. FE Review
FE/query scope was not confirmed for this ticket, so FE items are recorded as N/A.

## 4. BE/API Review
- [x] Collector accepts normalized GitHub Actions job metadata.
- [x] Collector validates repository linkage before writing CI data.
- [x] Collector does not create orphan CI rows when repository cannot be resolved.
- [x] Status normalization is deterministic and tested.
- [x] URL resolver prefers job URL and falls back to workflow run URL.
- [x] Error response does not expose provider tokens or raw GitHub payload.

## 5. DB/Migration Review
- [x] `tbl_fact_ci_run` uses `tbl_` prefix.
- [x] No non-`tbl_` table is introduced.
- [x] `external_run_id` stores GitHub Actions workflow run ID.
- [x] `external_job_id` stores GitHub Actions job ID and is NOT NULL.
- [x] `workflow_name` is NOT NULL.
- [x] `job_name` is NOT NULL.
- [x] `ci_url` is NOT NULL.
- [x] `ticket_id` and `pull_request_id` are nullable.
- [x] Unique key exists for `ci_provider + repository_id + external_run_id + external_job_id`.
- [x] Migration is additive where possible.
- [x] Existing `tbl_connector_run` counter mismatch is explicitly resolved or mapped.

## 6. Security/Privacy Review
- [x] No raw CI logs are persisted.
- [x] No raw GitHub API payload is persisted.
- [x] No full CI artifact is persisted.
- [x] No tokens, secrets, private keys, or passwords are persisted.
- [x] Sensitive values are not logged.
- [x] The implementation does not expand into security scan ingestion scope.

## 7. Operation/Maintenance Review
- [x] Each collector execution records `tbl_connector_run`.
- [x] Connector run includes records received / inserted / updated / skipped / error, or a documented mapping to existing fields.
- [x] Partial failure is not reported as full success.
- [x] Repository resolution failure is visible and safe.
- [x] GitHub API failure is visible and safe.

## 8. Test Review
- [x] Unit test for status normalization.
- [x] Unit test for URL preference and fallback.
- [x] Unit test for missing repository resolution.
- [x] Unit test for invalid timestamp order.
- [x] Repository / mapper test for idempotent upsert.
- [x] Integration test: re-ingesting same job updates existing row.
- [x] Failure-path test: GitHub API failure updates connector run log.
- [x] Security test/checklist: raw logs, tokens, secrets, raw payloads are not persisted.

## 9. Documentation/Traceability Review
- [x] `spec-pack.md` and `impl-plan.md` agree on job-level data grain.
- [x] `context.md` lists related API / batch / job / DB mapping.
- [x] `ticket-rules.md` includes forbidden implementation rules.
- [x] `impact-analysis.md` documents schema mismatch and human decisions required.
- [x] Test plan maps to all AC.
- [x] Final report includes implementation, review, test, risk, rollback, and remaining issue summary.

## 10. Release/Rollback Review
- [x] Schema reconciliation has human approval before migration is applied.
- [x] Migration does not destructively remove existing data without approval.
- [x] Failed collector does not corrupt existing evidence data.
- [x] Rollback path is documented as disable collector + forward repair / DB restore if needed.
- [x] Release notes mention job-level grain and out-of-scope items.

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect Report | Record Reason for Rejection |
| Accepted Risk | Accepted Risk | Record Impact/Owner/Deadline |
