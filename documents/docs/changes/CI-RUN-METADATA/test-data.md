# Test Data

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17  
**Author**: ChatGPT
**Update date**: 2026-06-18  

## Data Policy

- Use dummy GitHub Actions metadata.
- Do not use production GitHub tokens.
- Do not store raw CI logs.
- Do not store secrets, private keys, passwords, or PII.
- Use deterministic IDs for repeatable idempotency tests.
- Use UTC timestamps.
- Keep any dummy secret-looking text clearly fake and non-sensitive.

## Master Data

| name | value | purpose |
|---|---|---|
| CI Provider | `GITHUB_ACTIONS` | Provider code value. |
| Status | `SUCCESS` | Completed successful job. |
| Status | `FAILURE` | Completed failed job. |
| Status | `CANCELLED` | Cancelled job. |
| Status | `SKIPPED` | Skipped job. |
| Status | `IN_PROGRESS` | Running job. |
| Status | `QUEUED` | Queued job. |
| Status | `UNKNOWN` | Unknown or unmapped provider status. |
| Connector Run Status | `SUCCESS` | Successful connector execution. |
| Connector Run Status | `FAILED` | Failed connector execution. |
| Connector Run Status | `PARTIAL_SUCCESS` | Partial ingest with recorded errors. |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| admin_dummy | ADMIN | Can run/query collector if admin restriction exists | Admin/API test |
| pm_dummy | PM | Can view PM dashboard if configured | Dashboard view test |
| dev_dummy | DEV | Can view Dev dashboard if configured | Dashboard view test |
| dataops_dummy | DATA_OPS | Can view connector run status if configured | Data Ops test |
| outsider_dummy | NONE | No repository or ticket access | Permission denial test |

## Normal Data

| ID | data | purpose |
|---|---|---|
| REPO-001 | Existing repository row in `tbl_dim_repository` | Mandatory repository linkage |
| PR-001 | Existing PR row in `tbl_fact_pull_request` | Optional PR linkage |
| TICKET-001 | Existing ticket row in `tbl_dim_ticket` for `CI-RUN-METADATA` | Optional ticket linkage |
| RUN-001 | `external_run_id = 27660577827`, workflow `CI` | Parent workflow run |
| JOB-001 | `external_job_id = 77123456789`, job `build`, status `SUCCESS` | Normal success job |
| JOB-002 | `external_job_id = 77123456790`, job `test`, status `FAILURE` | Normal failed job |
| JOB-003 | `external_job_id = 77123456791`, job `lint`, status `IN_PROGRESS` | Running job case |
| URL-001 | `https://github.com/org/repo/actions/runs/27660577827/job/77123456789` | Job URL preferred case |
| URL-002 | `https://github.com/org/repo/actions/runs/27660577827` | Workflow run URL fallback case |
| USER-001 | Authorized user with repository access | Permission positive case |
| USER-002 | Unauthorized user without repository access | Permission negative case |

## Error Data

| ID | data | expected error |
|---|---|---|
| ERR-001 | repository cannot be resolved | Do not insert CI row; log connector error |
| ERR-002 | missing `external_run_id` | Skip or reject row; validation error |
| ERR-003 | missing `external_job_id` | Skip or reject row; validation error |
| ERR-004 | missing both job URL and workflow run URL | Skip or reject row; validation error |
| ERR-005 | GitHub API auth failure | Connector run failed |
| ERR-006 | dummy raw CI log included in provider-side fixture | Must not be persisted |
| ERR-007 | dummy secret-like value included in provider-side fixture | Must not be persisted |
| ERR-008 | completed time earlier than started time | Invalid timestamp range |
| ERR-009 | unauthorized user tries to view ticket CI detail | Access denied or no CI data visible |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| BND-001 | completed time | null | Accepted for `IN_PROGRESS` or `QUEUED` |
| BND-002 | completed time | before started time | Rejected or skipped and logged |
| BND-003 | job URL | null, workflow run URL present | Fallback to workflow run URL |
| BND-004 | unknown provider status | `startup_failure` or unknown dummy value | Store `UNKNOWN` or approved mapping |
| BND-005 | duplicate job | same provider/repo/run/job | Update existing row, no duplicate |
| BND-006 | workflow/job name | non-ASCII dummy text | Stored and displayed without mojibake |
| BND-007 | workflow run size | exactly 1 job | Still store one row |
| BND-008 | workflow run size | multiple jobs | Store one row per job |

## Existing Data Compatibility

- Existing repository/project/ticket/PR rows must not be modified by collector except through FK linkage.
- Duplicate ingest must not create additional rows for the same provider/repository/run/job.
- Existing `tbl_connector_run` conventions must be followed.
- CI job rows must remain compatible with dashboard and ticket detail reads that expect workflow name, job name, status, timestamps, and URL.

## Data Setup Procedure

1. Prepare dummy project row in `tbl_dim_project`.
2. Prepare dummy repository row in `tbl_dim_repository`.
3. Prepare dummy ticket row in `tbl_dim_ticket` if ticket linkage test is required.
4. Prepare dummy PR row in `tbl_fact_pull_request` if PR linkage test is required.
5. Prepare GitHub Actions job metadata fixture with at least two jobs under one workflow run.
6. Run collector against dummy fixture or mocked GitHub client.
7. Prepare one fixture with a missing job URL and another with invalid timestamp order.

## Data Cleanup Procedure

1. Delete rows from `tbl_fact_ci_run` for dummy run/job IDs.
2. Delete connector run logs created by the test if test environment requires cleanup.
3. Delete dummy PR/ticket/repository/project rows only if they were created exclusively for the test.
4. Do not delete shared master data without approval.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets to artifacts.
- Do not save real GitHub token in test files.
- Do not save raw CI logs.
- Dummy secret-like values, if used for negative test, must be clearly fake and must not be persisted.
