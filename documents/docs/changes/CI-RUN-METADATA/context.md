# Context

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17 
**Author**: ChatGPT
**Update date**: 2026-06-17 

## Screen / API / Batch / Related Job

| type | name | status | note |
|---|---|---|---|
| Batch / Connector Job | GitHub Actions CI Job Metadata Collector | Planned | Collects GitHub Actions job-level metadata. |
| Internal API | CI metadata ingest / query API | TBD | Exact endpoint path must be confirmed from existing backend API conventions. |
| Dashboard | PM Dashboard | Planned downstream | Shows latest CI status by ticket / PR. |
| Dashboard | Dev / Data Ops Dashboard | Planned downstream | Shows CI job status and connector errors. |
| Detail View | Ticket Evidence Detail | Planned downstream | Shows workflow/job/status/time/URL. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Existing Spring Boot controller/service/repository package pattern | TBD after source inspection | Follow existing controller -> service -> repository adapter pattern. Do not invent a new architecture. |
| Existing entity naming / UUID handling pattern | TBD after source inspection | Use existing project UUID generation and persistence pattern. |
| Existing `tbl_` migration pattern | TBD after migration folder confirmation | Use existing Flyway/Liquibase/plain SQL convention. |
| Existing connector run logging pattern | `tbl_connector_run` usage, exact implementation TBD | Reuse existing connector run model if already implemented. |

## Allowed common components

| component | path | usage note |
|---|---|---|
| Spring Security authenticated context | Existing BE security package, TBD | Use existing auth context if API is protected. |
| Existing repository/entity infrastructure | Existing BE persistence package, TBD | Use the established JPA/JdbcTemplate/MyBatis style already used by the project. |
| Existing clock/time utility | TBD | Prefer existing UTC/timestamptz handling utility if present. |
| Existing error response / traceId utility | TBD | Reuse existing API error format. |
| Existing connector run logger | TBD | Use for records received/inserted/updated/skipped/error counters. |

## Forbidden common components

| component | reason |
|---|---|
| Raw CI log parser as primary source | This ticket stores CI metadata only and must not persist raw CI logs. |
| `_ticket-template` as runtime CI evidence source | Template files are not source of truth for CI execution. GitHub Actions is the source of truth. |
| Secret/SAST/SCA finding parser | Security scan summary is out of scope for this ticket. |
| Ad-hoc table without `tbl_` prefix | Ticket persistence rule allows only `tbl_` table names. |
| Direct storage of GitHub token or raw API response containing sensitive fields | Violates metadata-first and security rules. |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| TBD | TBD | Must be confirmed by reading source before implementation. |

> Phase 2 rule: no implementation may call a method/class not confirmed from the current source tree. If a required method does not exist, add it explicitly in `impl-plan.md` before implementation.

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `getLatestCiRunByTicket()` | Not confirmed to exist. | Confirm existing query method or define a new repository method in Phase 3. |
| `saveCiRun()` | Not confirmed to exist and may hide insert/update behavior. | Define explicit idempotent upsert behavior. |
| `parseCiRawLog()` | Out of scope and forbidden for this ticket. | Use GitHub Actions workflow/job metadata APIs only. |
| Any method that stores raw CI log / raw command output | Security/privacy violation. | Store only normalized metadata fields. |
| Any method that stores GitHub token in DB | Security violation. | Use secret manager / environment configuration outside evidence DB. |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| Table | `tbl_fact_ci_run` | DB migration TBD | Main persistence table. Data grain: 1 row = 1 GitHub Actions job. |
| Table | `tbl_connector_run` | Existing table | Connector execution tracking. |
| Table | `tbl_dim_repository` | Existing table | Mandatory repository FK. |
| Table | `tbl_dim_project` | Existing table | Mandatory project FK. |
| Table | `tbl_fact_pull_request` | Existing table | Optional PR FK. |
| Table | `tbl_dim_ticket` | Existing table | Optional ticket FK. |
| Entity | `CiRun` / `CiRunEntity` | TBD | Naming must follow existing source convention. Despite name, row represents one CI job. |
| DTO | `CiJobMetadataDto` | TBD | Suggested DTO for normalized GitHub job metadata. Confirm naming convention. |
| DTO | `CiRunMetadataResponse` | TBD | Suggested response for dashboard/detail query. Confirm naming convention. |
| Migration | `tbl_fact_ci_run` DDL | TBD | Add/confirm columns: `external_run_id`, `external_job_id`, `workflow_name`, `job_name`, `status`, `started_at`, `completed_at`, `ci_url`. |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| CI Provider | `GITHUB_ACTIONS` | Ticket rule | MVP provider fixed to GitHub Actions. |
| CI Status | `SUCCESS` | Status mapper | GitHub conclusion `success`. |
| CI Status | `FAILURE` | Status mapper | GitHub conclusion `failure`, `timed_out`, `action_required` may map here if approved. |
| CI Status | `CANCELLED` | Status mapper | GitHub conclusion `cancelled`. |
| CI Status | `SKIPPED` | Status mapper | GitHub conclusion `skipped`. |
| CI Status | `IN_PROGRESS` | Status mapper | GitHub status `in_progress`. |
| CI Status | `QUEUED` | Status mapper | GitHub status `queued`, `waiting`, or `pending` if approved. |
| CI Status | `UNKNOWN` | Status mapper | Unknown or unmapped provider status/conclusion. |
| URL | Job URL preferred | GitHub Actions job metadata | Fallback to workflow run URL. |

## Multilingual Note

- UI labels may be displayed in Vietnamese/Japanese/English depending on existing application convention.
- Stored CI metadata should preserve GitHub workflow/job names as returned by GitHub Actions.
- Do not translate workflow/job names before persistence.

## Encoding / Mojibake Note

- Store workflow/job names as UTF-8.
- Do not assume ASCII-only job names.
- Dashboard rendering must not corrupt full-width, Vietnamese, Japanese, or emoji characters if present in workflow/job names.

## Log / Audit / Operation Note

- `tbl_connector_run` must record collector execution status.
- Required counters: records received, inserted, updated, skipped, error count.
- Do not log GitHub tokens.
- Do not log raw CI logs or raw command output.
- Error messages should be safe and should include enough information for Data Ops to identify repository/run/job scope.
- A successful API/collector response must not be considered valid unless DB insert/update counters are correct.

## Ticket-Specific Constraints

- Data grain is `1 row = 1 GitHub Actions job`.
- `external_run_id` stores GitHub Actions workflow run ID.
- `external_job_id` stores GitHub Actions job ID and is required.
- `ci_url` stores job URL if available; otherwise workflow run URL.
- Repository linkage is mandatory.
- PR and ticket linkage are best-effort and nullable.
- Do not persist raw CI logs, full artifacts, raw command output, tokens, secrets, private keys, or raw GitHub API response.
- Do not implement test result parsing, coverage parsing, failure classification, flaky detection, Secret/SAST/SCA summary, or rerun/manual refresh in this ticket.