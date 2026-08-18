# Spec Pack

**Ticket ID**: CI-RUN-METADATA  
**Create date**: 2026-06-17  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## 1. Context / Purpose

The SDD Evidence MVP needs CI evidence to support traceability from ticket and PR to CI execution.

This ticket defines the minimum CI metadata collector for GitHub Actions. The collector stores job-level CI metadata so that PM, QA, Developer, and Data Ops users can confirm whether CI ran, which job ran, what the result was, when it ran, and where to open the original GitHub Actions evidence.

This ticket is metadata-first. It does not collect raw CI logs, full artifacts, raw command output, or sensitive data.

## 2. Scope

### 2.1. Within range

- Collect GitHub Actions job-level metadata.
- Persist one row per GitHub Actions job into `tbl_fact_ci_run`.
- Store workflow run ID as `external_run_id`.
- Store job ID as `external_job_id`.
- Store workflow name, job name, status, started time, completed time, and CI URL.
- Link CI job to repository.
- Link CI job to PR when PR metadata is available.
- Link CI job to ticket when ticket ID can be inferred.
- Record collector execution in `tbl_connector_run`.
- Expose stored metadata for dashboard and ticket evidence detail.

### 2.2. Out of range

- Raw CI log storage.
- Full CI artifact storage.
- Test result parsing.
- Coverage parsing.
- Failure category classification.
- Flaky test detection.
- Secret / SAST / SCA summary collection.
- Security finding detail.
- Re-run button or manual refresh button.
- High-risk human approval.
- Using `_ticket-template` as runtime CI evidence.

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| GitHub Actions | CI/CD provider used as source of truth for CI metadata. | Provider for this MVP. |
| Workflow | A GitHub Actions workflow definition, for example `CI` or `Security Evidence Scan`. | Usually defined by YAML under `.github/workflows/`. |
| Workflow run | One execution of a workflow. | Stored as `external_run_id`. |
| Job | A unit of work inside a workflow run. | This ticket stores one row per job. |
| Job URL | GitHub URL that opens a specific job. | Preferred value for `ci_url`. |
| Workflow run URL | GitHub URL that opens a workflow run. | Fallback value for `ci_url`. |
| CI status | Normalized result/status stored in DB. | `SUCCESS`, `FAILURE`, `CANCELLED`, `SKIPPED`, `IN_PROGRESS`, `QUEUED`, `UNKNOWN`. |
| Idempotency | Re-running the collector must not create duplicate rows. | Enforced by unique key. |

## 4. As-Is

- CI results exist in GitHub Actions.
- Users may need to manually open GitHub Actions to check CI status and job details.
- Traceability from Ticket / PR to CI job is not guaranteed in the evidence platform.
- CI job URL is not consistently available in the dashboard or ticket evidence detail.
- There is a risk that an API response reports handled data while actual DB insert/update did not happen unless ingest counters and idempotency are explicit.

## 5. To-Be

- The system collects GitHub Actions job metadata and stores it in `tbl_fact_ci_run`.
- Each GitHub Actions job is represented by one DB row.
- Users can see workflow name, job name, status, started/completed time, and URL from dashboard or ticket evidence detail.
- Re-running the collector updates existing job rows instead of creating duplicates.
- Raw logs and sensitive content are never persisted.

## 6. Detailed specification

### 6.1. Business Rules

| rule ID | rule | note |
|---|---|---|
| BR-CI-RUN-METADATA-1 | The data grain is `1 row = 1 GitHub Actions job`. | A workflow run with N jobs creates N rows. |
| BR-CI-RUN-METADATA-2 | `external_run_id` is required and stores the workflow run ID. | Parent run reference. |
| BR-CI-RUN-METADATA-3 | `external_job_id` is required and stores the GitHub Actions job ID. | Job-level external identifier. |
| BR-CI-RUN-METADATA-4 | `ci_url` must prefer job URL if available. | Fallback to workflow run URL. |
| BR-CI-RUN-METADATA-5 | Repository linkage is mandatory. | No orphan CI job record. |
| BR-CI-RUN-METADATA-6 | PR linkage is optional. | Store nullable when unresolved. |
| BR-CI-RUN-METADATA-7 | Ticket linkage is optional. | Store nullable when unresolved. |
| BR-CI-RUN-METADATA-8 | Collector persistence must be idempotent. | Unique key: provider + repository + external run ID + external job ID. |
| BR-CI-RUN-METADATA-9 | Collector execution result must be recorded in `tbl_connector_run`. | Include received/inserted/updated/skipped/error counters. |
| BR-CI-RUN-METADATA-10 | Raw CI logs, full artifacts, raw command output, secret values, tokens, and private keys must not be stored. | Security/privacy rule. |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| repository identifier | string / UUID | Yes | Must resolve to `tbl_dim_repository`. | Source repo. |
| project identifier | UUID | Yes | Must resolve to `tbl_dim_project`. | Usually from repository. |
| workflow run ID | string | Yes | Non-empty. | GitHub Actions run ID. |
| job ID | string | Yes | Non-empty. | GitHub Actions job ID. |
| workflow name | string | Yes | Non-empty, max length according to DB. | Example: `CI`. |
| job name | string | Yes | Non-empty, max length according to DB. | Example: `build`. |
| status/conclusion | string | Yes | Must map to normalized status. | Unknown values map to `UNKNOWN`. |
| started time | timestamp | No | Must be valid timestamp. | Nullable if provider does not return it. |
| completed time | timestamp | No | Must be valid timestamp and not before started time. | Nullable for running jobs. |
| job URL | URL | No | Must be URL if present. | Preferred `ci_url`. |
| workflow run URL | URL | No | Must be URL if present. | Fallback `ci_url`. |
| PR number/reference | string/number | No | Best-effort match. | Used for PR linkage. |
| branch / commit / PR title | string | No | Best-effort parse. | Used for ticket inference if available. |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| `ci_run_id` | UUID | UUID | Internal primary key; one row represents one CI job. |
| `project_id` | UUID | UUID | FK to project. |
| `repository_id` | UUID | UUID | FK to repository. |
| `ticket_id` | UUID | UUID/null | Nullable if unresolved. |
| `pull_request_id` | UUID | UUID/null | Nullable if unresolved. |
| `connector_run_id` | UUID | UUID/null | FK to connector run. |
| `ci_provider` | string | `GITHUB_ACTIONS` | Provider. |
| `external_run_id` | string | provider ID | Workflow run ID. |
| `external_job_id` | string | provider ID | Job ID. |
| `workflow_name` | string | text | Workflow name. |
| `job_name` | string | text | Job name. |
| `status` | string | enum | Normalized CI job status. |
| `started_at` | timestamp | timestamptz | Job started time. |
| `completed_at` | timestamp | timestamptz/null | Job completed time. |
| `ci_url` | text | URL | Job URL or workflow run URL fallback. |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| GitHub API authentication fails | Collector run fails and logs error in `tbl_connector_run`. | `GITHUB_AUTH_FAILED` | No CI rows inserted. |
| GitHub API rate limit / unavailable | Collector run fails or partially fails with error logged. | `GITHUB_API_UNAVAILABLE` | Retry strategy is implementation detail. |
| Repository cannot be resolved | Do not insert orphan CI row; log error. | `REPOSITORY_NOT_FOUND` | Repository is mandatory. |
| PR cannot be resolved | Insert CI row with null `pull_request_id`. | `PR_UNRESOLVED` warning | Not blocking. |
| Ticket cannot be inferred | Insert CI row with null `ticket_id`. | `TICKET_UNRESOLVED` warning | Not blocking. |
| Unknown provider status | Store `UNKNOWN`. | `UNKNOWN_STATUS` warning | Do not fail collector. |
| Missing job URL | Use workflow run URL if available. | `JOB_URL_MISSING` warning | If no URL is available, fail validation. |
| Completed time before started time | Reject or skip invalid row and log parse/validation error. | `INVALID_TIME_RANGE` | Prevent invalid DB state. |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| jobs per workflow run | 1 | Provider-dependent | Workflow with many jobs | Store one row per job. |
| completed_at | null allowed | Valid timestamp | Running job | Store null and status `IN_PROGRESS`/`QUEUED`. |
| status | allowed enum | allowed enum | Unknown provider status | Store `UNKNOWN`. |
| URL | non-empty URL | TEXT limit | Job URL missing | Use workflow run URL fallback. |
| duplicate collection | 1 same job | repeated runs | Same provider/repo/run/job | Update existing row, no duplicate. |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Collector should handle MVP repository scale. | 1-2 repos, recent workflow runs/jobs. | Integration test. | No real-time requirement in Phase 1. |
| Security | Do not store raw logs, artifacts, secrets, tokens, private keys, raw command output. | 0 forbidden persistence. | Security checklist and code review. | Metadata only. |
| Availability / Reliability | Collector failure must be visible. | `tbl_connector_run` contains failure status/error. | Integration test. | No silent failure. |
| Maintainability | Status mapping and provider mapping should be isolated. | Mapper unit testable. | Unit tests. | GitHub-only in MVP. |
| Observability / Logging | Collector records received/inserted/updated/skipped/error counts. | All runs tracked. | Connector run log validation. | Prevent misleading `handled` responses. |
| Compatibility | Use only approved `tbl_` tables. | No non-`tbl_` tables. | DB review. | Matches project convention. |

## 7. Acceptance Criteria

| ACID | description | testable? | notes |
|---|---|---|---|
| AC-CI-RUN-METADATA-1 | Given a GitHub Actions workflow run with multiple jobs, when the collector runs, then the system stores one row per job in `tbl_fact_ci_run`. | Yes | Data grain validation. |
| AC-CI-RUN-METADATA-2 | Given a GitHub Actions job, when persisted, then the row stores workflow run ID, job ID, workflow name, job name, status, started time, completed time, and CI URL. | Yes | Minimum fields. |
| AC-CI-RUN-METADATA-3 | Given a job URL is available, when persisted, then `ci_url` stores the job URL. | Yes | URL preference. |
| AC-CI-RUN-METADATA-4 | Given a job URL is not available but workflow run URL is available, when persisted, then `ci_url` stores the workflow run URL. | Yes | URL fallback. |
| AC-CI-RUN-METADATA-5 | Given the repository is known, when the CI job is persisted, then the row links to `tbl_dim_repository`. | Yes | Mandatory repository linkage. |
| AC-CI-RUN-METADATA-6 | Given PR metadata is available, when the CI job is persisted, then the row links to `tbl_fact_pull_request`. | Yes | Optional PR linkage. |
| AC-CI-RUN-METADATA-7 | Given ticket ID can be inferred, when the CI job is persisted, then the row links to `tbl_dim_ticket`. | Yes | Optional ticket linkage. |
| AC-CI-RUN-METADATA-8 | Given the same provider/repository/workflow run/job is collected twice, when the second collection runs, then the existing row is updated and no duplicate row is inserted. | Yes | Idempotency. |
| AC-CI-RUN-METADATA-9 | Given a running job, when persisted, then `completed_at` may be null and status is normalized to `IN_PROGRESS` or `QUEUED`. | Yes | Running job support. |
| AC-CI-RUN-METADATA-10 | Given GitHub API fails, when the collector runs, then failure is recorded in `tbl_connector_run`. | Yes | Data Ops visibility. |
| AC-CI-RUN-METADATA-11 | Given CI metadata is collected, when data is stored, then no raw CI log, token, secret, private key, full artifact, or raw command output is persisted. | Yes | Security gate. |
| AC-CI-RUN-METADATA-12 | Given a ticket detail page is opened, when CI rows exist, then workflow name, job name, status, started/completed time, and CI URL are displayed. | Yes | UI/API downstream. |

## 8. Examples

### 8.1. Normal Case

A workflow run has two jobs.

```text
Workflow: CI
Workflow Run ID: 27660577827
Job 1: build, Job ID: 77123456789, Status: SUCCESS
Job 2: test, Job ID: 77123456790, Status: SUCCESS
```

Expected result:

- Two rows are stored in `tbl_fact_ci_run`.
- Both rows have the same `external_run_id`.
- Each row has a different `external_job_id`.
- Each row has a job-specific `ci_url` if available.

### 8.2. Error Case

GitHub Actions API authentication fails.

Expected result:

- No orphan CI job rows are inserted.
- `tbl_connector_run` records failure status.
- Error message indicates authentication failure without exposing token value.

### 8.3. Boundary Case

A GitHub Actions job is still running.

Expected result:

- The job row is stored with status `IN_PROGRESS` or `QUEUED`.
- `completed_at` is null.
- `ci_url` is stored if available.
- A later collector run updates the same row when the job completes.

## 9. Source Availability Summary

| source area | availability | decision |
|---|---|---|
| Ticket requirement | Available | Use as primary functional source. |
| User decision on data grain | Available | Use job-level grain. |
| Documentation templates | Available | Use template structure. |
| GitHub Actions API details | Partially available | Need authentication and exact API usage confirmation. |
| Existing DB schema | Unknown | Must confirm before implementation. |
| Existing backend source | Unknown | Inspect during implementation phase. |

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: BE + DB + Batch/Connector + Dashboard API
- Primary risk: Source / Contract / Operation / Test
- Review mode: Standard
- Required options: Source Analysis / FE-BE Contract / DB Migration
```

Rationale:

- The feature is not algorithmically complex.
- It requires external API integration, DB idempotency, status normalization, and traceability linkage.
- The main implementation risks are API authentication, schema compatibility, and avoiding duplicate rows.

## 11. FE/BE Contract Impact

Expected BE output for dashboard / ticket evidence detail:

| field | description |
|---|---|
| `externalRunId` | GitHub Actions workflow run ID. |
| `externalJobId` | GitHub Actions job ID. |
| `workflowName` | Workflow name. |
| `jobName` | Job name. |
| `status` | Normalized CI job status. |
| `startedAt` | Job start time. |
| `completedAt` | Job completion time; nullable. |
| `ciUrl` | Job URL or workflow run URL fallback. |

UI should avoid implying that workflow run and job are the same thing. Displaying both `workflowName` and `jobName` is required.

## 12. DB/Migration Impact

Expected table:

- `tbl_fact_ci_run`

Expected key design:

```text
Unique key = ci_provider + repository_id + external_run_id + external_job_id
```

Expected required columns:

- `ci_run_id`
- `project_id`
- `repository_id`
- `ci_provider`
- `external_run_id`
- `external_job_id`
- `workflow_name`
- `job_name`
- `status`
- `ci_url`

Nullable columns:

- `ticket_id`
- `pull_request_id`
- `connector_run_id`
- `started_at`
- `completed_at`

Migration must not introduce non-`tbl_` tables.

## 13. Security/Privacy Impact

Security/privacy rule:

- Do not store raw CI logs.
- Do not store full CI artifacts.
- Do not store raw command output.
- Do not store secret values.
- Do not store tokens.
- Do not store private keys.
- Do not log authentication credentials.

The stored URL is a reference to GitHub Actions source of truth. Access control to the URL is handled by GitHub permissions, but the application should still enforce its own project/repository authorization before showing the URL.

## 14. Operation/Maintenance Impact

- Data Ops needs connector run visibility.
- Each collector execution should record status and counters in `tbl_connector_run`.
- Important counters:
  - records received
  - records inserted
  - records updated
  - records skipped
  - error count
- Failures should not look successful just because input payload was handled.
- Re-running the collector must be safe due to idempotent persistence.

## 15. Test Strategy Summary

| test type | target |
|---|---|
| Unit test | Status normalization from GitHub status/conclusion to MVP enum. |
| Unit test | URL selection: job URL preferred, workflow run URL fallback. |
| Unit test | Idempotency key generation. |
| Integration test | Collector -> DB insert for multiple jobs in one workflow run. |
| Integration test | Re-running collector updates existing rows and does not duplicate. |
| Integration test | Repository unresolved case logs error and skips row. |
| Security test/checklist | Confirm forbidden raw data is not persisted. |
| UI/API test | Ticket evidence detail displays workflow/job/status/time/URL. |

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| H-CI-RUN-METADATA-1 | Confirm GitHub Actions authentication method. | Required before implementation. | Admin / Backend lead | Open |
| H-CI-RUN-METADATA-2 | Confirm exact existing DB schema and migration tool. | Prevent schema conflict. | DB owner / Backend lead | Open |
| H-CI-RUN-METADATA-3 | Confirm ticket ID matching rule. | Needed for ticket linkage. | PM / Backend lead | Open |
| H-CI-RUN-METADATA-4 | Confirm dashboard default display: all jobs, failed jobs, or latest jobs. | UI behavior. | PM / UX | Open |

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-CI-RUN-METADATA-1 | GitHub Actions is the CI/CD provider. | User discussion and existing MVP direction. | Low | Yes |
| A-CI-RUN-METADATA-2 | GitHub Actions job ID is available to the backend collector. | Job-level data grain decision. | Medium | Yes |
| A-CI-RUN-METADATA-3 | Existing `tbl_fact_ci_run` may be adapted to job-level grain. | Approved table set includes `tbl_fact_ci_run`. | Medium | Yes |
| A-CI-RUN-METADATA-4 | Job URL can be stored as `ci_url`, with workflow run URL fallback. | User clarification and GitHub Actions model. | Low | Yes |
| A-CI-RUN-METADATA-5 | PR/ticket linkage can be nullable for MVP. | Traceability can be improved incrementally. | Low | Yes |

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-CI-RUN-METADATA-1 | GitHub Actions authentication method is not confirmed. | Blocks connector implementation. | Admin / Backend lead | Open |
| OI-CI-RUN-METADATA-2 | Existing DB schema is not confirmed. | Blocks final migration design. | DB owner | Open |
| OI-CI-RUN-METADATA-3 | Ticket ID matching rule is not confirmed. | Ticket linkage may be incomplete. | PM / Backend lead | Open |
| OI-CI-RUN-METADATA-4 | Dashboard default filter is not confirmed. | UI may need adjustment. | PM / UX | Open |