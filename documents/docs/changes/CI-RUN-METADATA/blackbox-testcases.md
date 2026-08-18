# Black-box Test Cases

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17  
**Author**: ChatGPT
**Update date**: 2026-06-18  

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-CI-RUN-METADATA-1 | P0 | Normal | Workflow run with multiple jobs creates one row per job |
| BB-002 | AC-CI-RUN-METADATA-1 | P1 | Boundary | Workflow run with exactly one job still creates one row |
| BB-003 | AC-CI-RUN-METADATA-2 | P0 | Normal | Required job metadata fields are stored on the CI row |
| BB-004 | AC-CI-RUN-METADATA-2 | P1 | Error | Completed time before started time is rejected or skipped |
| BB-005 | AC-CI-RUN-METADATA-3 | P1 | Normal | Job URL is stored when available |
| BB-006 | AC-CI-RUN-METADATA-4 | P1 | Boundary | Workflow run URL fallback is used when job URL is missing |
| BB-007 | AC-CI-RUN-METADATA-5 | P0 | Error | Repository unresolved case does not create an orphan CI row |
| BB-008 | AC-CI-RUN-METADATA-6 | P1 | Normal | PR metadata available links the CI row to the pull request |
| BB-009 | AC-CI-RUN-METADATA-7 | P2 | Boundary | Ticket linkage is nullable when ticket inference is unavailable |
| BB-010 | AC-CI-RUN-METADATA-8 | P0 | Duplicate | Same job collected twice does not create duplicate row |
| BB-011 | AC-CI-RUN-METADATA-9 | P1 | State | Running or queued job keeps completed time null |
| BB-012 | AC-CI-RUN-METADATA-10 | P0 | External IF | GitHub API failure is recorded in connector run |
| BB-013 | AC-CI-RUN-METADATA-10 | P1 | Operation | Connector run counters are visible and do not report success on failure |
| BB-014 | AC-CI-RUN-METADATA-11 | P0 | Security | Raw CI log and secrets are not persisted |
| BB-015 | AC-CI-RUN-METADATA-12 | P1 | Permission | Authorized user can see CI job metadata, unauthorized user cannot |
| BB-016 | AC-CI-RUN-METADATA-12 | P1 | Evidence Display | Ticket evidence detail displays CI job metadata |

## AC Mapping

| AC ID | black-box case ID |
|---|---|
| AC-CI-RUN-METADATA-1 | BB-001, BB-002 |
| AC-CI-RUN-METADATA-2 | BB-003, BB-004 |
| AC-CI-RUN-METADATA-3 | BB-005 |
| AC-CI-RUN-METADATA-4 | BB-006 |
| AC-CI-RUN-METADATA-5 | BB-007 |
| AC-CI-RUN-METADATA-6 | BB-008 |
| AC-CI-RUN-METADATA-7 | BB-009 |
| AC-CI-RUN-METADATA-8 | BB-010 |
| AC-CI-RUN-METADATA-9 | BB-011 |
| AC-CI-RUN-METADATA-10 | BB-012, BB-013 |
| AC-CI-RUN-METADATA-11 | BB-014 |
| AC-CI-RUN-METADATA-12 | BB-015, BB-016 |

## Test Cases

### BB-001: Workflow run with multiple jobs creates one row per job

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Repository is registered. A dummy workflow run contains two jobs. |
| Input | Workflow run ID `27660577827`, job IDs `77123456789` and `77123456790`. |
| Steps | Run CI metadata collector. Query `tbl_fact_ci_run` by external run ID. |
| Expected Result | Two rows exist. Both share `external_run_id`; each has a different `external_job_id`. |
| Note | Validates job-level grain. |

### BB-002: Workflow run with exactly one job still creates one row

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-1 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Repository is registered. A dummy workflow run contains exactly one job. |
| Input | Workflow run ID `27660577828`, job ID `77123456791`. |
| Steps | Run CI metadata collector. Query `tbl_fact_ci_run` by external run ID. |
| Expected Result | Exactly one row exists for the workflow run. |
| Note | Validates minimum job count. |

### BB-003: Required job metadata fields are stored on the CI row

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Repository is registered. Provider returns a completed job with all required metadata. |
| Input | Workflow run ID `27660577827`, job ID `77123456789`, workflow name `CI`, job name `build`, status `success`, started time `2026-06-17T01:00:00Z`, completed time `2026-06-17T01:10:00Z`. |
| Steps | Run collector and query stored row. |
| Expected Result | The stored row includes `external_run_id`, `external_job_id`, `workflow_name`, `job_name`, `status`, `started_at`, `completed_at`, and `ci_url`. |
| Note | Verifies minimum persisted field set. |

### BB-004: Completed time before started time is rejected or skipped

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-2 |
| Priority | P1 |
| Category | Error |
| Preconditions | Repository is registered. Provider returns inconsistent timestamps. |
| Input | Started time `2026-06-17T02:00:00Z`, completed time `2026-06-17T01:59:59Z`. |
| Steps | Run collector and inspect persisted rows and error handling. |
| Expected Result | Invalid row is not persisted, or it is skipped with a validation error recorded safely. |
| Note | Protects timestamp ordering rule. |

### BB-005: Job URL is stored when available

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-3 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Job metadata contains job `html_url`. |
| Input | Job URL `https://github.com/org/repo/actions/runs/27660577827/job/77123456789`. |
| Steps | Run collector and query stored row. |
| Expected Result | `ci_url` equals the job URL. |
| Note | Preferred URL rule. |

### BB-006: Workflow run URL fallback is used when job URL is missing

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-4 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Job URL is missing, workflow run URL exists. |
| Input | Workflow run URL `https://github.com/org/repo/actions/runs/27660577827`. |
| Steps | Run collector and query stored row. |
| Expected Result | `ci_url` equals workflow run URL. |
| Note | Fallback rule. |

### BB-007: Repository unresolved case does not create an orphan CI row

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-5 |
| Priority | P0 |
| Category | Error |
| Preconditions | Provider returns job metadata, but repository lookup fails. |
| Input | Unknown repository identifier. |
| Steps | Run collector. Inspect `tbl_fact_ci_run` and `tbl_connector_run`. |
| Expected Result | No orphan CI row is inserted. Connector run records an error safely. |
| Note | Repository linkage is mandatory. |

### BB-008: PR metadata available links the CI row to the pull request

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-6 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Repository and matching PR are registered. |
| Input | Dummy PR reference that maps to a known pull request. |
| Steps | Run collector and query stored CI row. |
| Expected Result | `pull_request_id` is populated with the matched PR row. |
| Note | Optional PR linkage works when metadata is available. |

### BB-009: Ticket linkage is nullable when ticket inference is unavailable

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-7 |
| Priority | P2 |
| Category | Boundary |
| Preconditions | Repository and PR are registered, but ticket inference inputs are missing or ambiguous. |
| Input | Job metadata without recognizable ticket reference. |
| Steps | Run collector and query stored row. |
| Expected Result | CI row is persisted and `ticket_id` remains null. |
| Note | Best-effort linkage only. |

### BB-010: Same job collected twice does not create duplicate row

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-8 |
| Priority | P0 |
| Category | Duplicate |
| Preconditions | Repository is registered. Same dummy job metadata is available. |
| Input | Same provider/repository/run/job twice. |
| Steps | Run collector twice. Count rows by unique key. |
| Expected Result | Row count remains 1 for the same job. Second run updates or skips instead of duplicate insert. |
| Note | Validates idempotency. |

### BB-011: Running or queued job keeps completed time null

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-9 |
| Priority | P1 |
| Category | State |
| Preconditions | Job status is running or queued. |
| Input | Status `in_progress` or `queued`, completed time null. |
| Steps | Run collector and query stored row. |
| Expected Result | Status is normalized to `IN_PROGRESS` or `QUEUED`; `completed_at` is null. |
| Note | Running job state. |

### BB-012: GitHub API failure is recorded in connector run

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-10 |
| Priority | P0 |
| Category | External IF |
| Preconditions | GitHub API failure can be simulated. |
| Input | API returns auth failure or unavailable. |
| Steps | Run collector. Query `tbl_connector_run`. |
| Expected Result | Connector run status is failed and error message is recorded safely. |
| Note | Data Ops visibility. |

### BB-013: Connector run counters are visible and do not report success on failure

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-10 |
| Priority | P1 |
| Category | Operation |
| Preconditions | Connector failure path is triggered. |
| Input | Same failure fixture as BB-012. |
| Steps | Run collector. Inspect connector run counters. |
| Expected Result | Received / inserted / updated / skipped / error counters are consistent with the failed run and do not imply a successful execution. |
| Note | Operational viewpoint. |

### BB-014: Raw CI log and secrets are not persisted

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-11 |
| Priority | P0 |
| Category | Security |
| Preconditions | Dummy raw log value and dummy secret-like string are present in provider-side test data but not required by metadata. |
| Input | Dummy provider response. |
| Steps | Run collector. Inspect evidence DB and log output. |
| Expected Result | No raw CI log, token, secret, private key, full artifact, or raw command output is persisted. |
| Note | Use safe dummy values only. |

### BB-015: Authorized user can see CI job metadata, unauthorized user cannot

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-12 |
| Priority | P1 |
| Category | Permission |
| Preconditions | CI rows exist for a ticket. One user has project/repository access, one user does not. |
| Input | Authorized and unauthorized dummy users. |
| Steps | Open the ticket evidence detail as both users. |
| Expected Result | Authorized user sees CI metadata; unauthorized user is denied or sees no CI data. |
| Note | Enforces access control before showing the GitHub URL. |

### BB-016: Ticket evidence detail displays CI job metadata

| item | content |
|---|---|
| Related AC | AC-CI-RUN-METADATA-12 |
| Priority | P1 |
| Category | Evidence Display |
| Preconditions | Ticket is linked to CI job rows. |
| Input | Ticket ID `CI-RUN-METADATA`. |
| Steps | Open or query ticket evidence detail. |
| Expected Result | Workflow name, job name, status, started/completed time, and CI URL are displayed. |
| Note | Dashboard/detail integration. |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [ ] Character type input
- [ ] Numeric input
- [ ] Full-width number
- [x] Empty/null
- [x] Duplicate
- [x] Non-existing ID
- [ ] Deleted data
- [x] External IF failure
- [ ] Timeout/retry
- [ ] Double submit
- [ ] Back/reload
- [ ] Session expired
- [ ] Existing data compatibility
- [x] Log/audit/notification/report output
