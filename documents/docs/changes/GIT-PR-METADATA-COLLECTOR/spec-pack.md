# Spec Pack

**Ticket ID**: GIT-PR-METADATA-COLLECTOR  
**Create date**: 2026-06-17  
**Author**: nk_trung  
**Update date**: 2026-06-17  

## 1. Context / Purpose

Git/PR Metadata Collector is an MVP backend/data collection function for connecting SDD evidence files with real development activity in Git and Pull Request systems.

The EDCAP platform already has Artifact Scanner for Evidence Inventory. Artifact Scanner scans `docs/changes/<TICKET>/` and records whether required SDD evidence files such as `spec-pack.md`, `impl-plan.md`, `test-plan.md`, `test-results.md`, and `report.md` exist.

However, Evidence Inventory alone only proves that a ticket has evidence files. It does not prove which Pull Request, commit, branch, or changed files are connected to that ticket. This ticket fills that gap by collecting minimal PR metadata, commit metadata, changed file metadata, and inferred `linked_ticket_id`.

This `spec-pack.md` is the single source of truth for Phase 1 output for the `GIT-PR-METADATA-COLLECTOR` ticket.

## 2. Scope

### 2.1. Within range

- Implement one MVP collector function that combines Git metadata collection and PR metadata collection.
- Treat Pull Request as the main collection unit.
- Support webhook-based collection when the Git provider sends PR events to the backend.
- Support manual collection by Admin/Data Ops:
  - by repository;
  - by a specific Pull Request number.
- Collect Pull Request metadata for the MVP target repository.
- Collect commit metadata related to the Pull Request.
- Collect changed file metadata related to the Pull Request or related commits.
- Infer `linked_ticket_id` from source branch, PR title, commit message, and changed file path.
- Persist PR metadata, commit metadata, changed file metadata, traceability links, and ingest run log.
- Reuse existing DB tables where they fit the data meaning.
- Add columns/indexes only when current tables do not sufficiently support MVP fields or idempotency.
- Add a new table only when an existing table cannot represent the data with correct granularity and clear meaning.
- Reuse existing ticket records created by Artifact Scanner when the same `ticket_id` exists.
- Store PR/commit metadata even if no evidence folder exists yet, so dashboards can later show development activity without evidence.
- Do not replace or modify the purpose of Artifact Scanner.
- Do not write Git/PR metadata into artifact snapshot tables.
- Do not store source code content, raw diff, raw patch, secret value, raw AI prompt, or raw AI chat log.

### 2.2. Out of range

- CI metadata collector as an independent collector.
- Parser for `test-results.md` or CI status extraction.
- Evidence Quality Score calculation.
- AC-Test Coverage calculation.
- Full Git history scanning unrelated to Pull Requests.
- Real-time streaming ingestion using a complex event bus/streaming platform.
- Detailed review comment analysis.
- AI review finding analysis.
- Security scan result collection.
- Source code content collection.
- Raw diff or raw patch persistence.
- Multiple Git providers with full abstraction complexity in MVP. GitHub is the only in-scope provider for MVP.
- Advanced ticket matching using NLP.
- FE dashboard implementation unless separately planned. A temporary local/manual test UI may be created for developer testing but is not part of the committed deliverable.
- Personal ranking or individual productivity evaluation.

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| Git/PR Metadata Collector | MVP collector that stores PR, commit, and changed file metadata. | Git and PR collection are implemented together in this ticket. |
| Pull Request / PR | Change request in Git provider such as GitHub/GitLab. | Main collection unit for MVP. |
| Git Provider | External Git hosting provider. | MVP provider is GitHub. |
| Webhook-based collection | Collection triggered by provider event. | Example: GitHub sends `pull_request` event. |
| Manual collection | Collection triggered by Admin/Data Ops API call. | By repository or by PR number. |
| Artifact Scanner | Existing MVP function that scans evidence files under `docs/changes/<TICKET>/`. | Not replaced by this ticket. |
| Ticket | SDD change unit stored in `tbl_dim_ticket`. | Usually maps to `docs/changes/<TICKET>/`. It is not the PR table. |
| linked_ticket_id | Ticket key inferred from PR/Git metadata. | Example: `ABC-123`, `LOGIN-001`, `ARTIFACT-SCANNER-01`, `ORGANIZATION`. |
| PR metadata | Metadata of a Pull Request. | PR number, title, status, branches, timestamps, review state, URL. |
| Commit metadata | Metadata of commits related to a PR. | Commit hash, message, author pseudonym, committed time, URL. |
| Changed file metadata | Metadata of files changed by PR/commit. | File path, change status, additions, deletions; no file content. |
| Traceability Link | Link connecting Ticket, PR, Commit, and Changed File. | Stored in traceability table. |
| Ingest Run Log | Run record for collection execution. | Webhook-triggered and manual collection both create connector run records for observability. |
| Idempotency | Running the same collector more than once does not create duplicates. | Required for webhook retries and manual reruns. |
| Author pseudonym | Pseudonym/hash/mapped member ID for author. | Do not use for personal ranking. |

## 4. As-Is

- Artifact Scanner exists and scans ticket evidence folders under `docs/changes/<TICKET>/`.
- Artifact Scanner records artifact existence, path, hash, size, scan status, and scan message into artifact snapshot data.
- Artifact Scanner auto-creates minimal ticket records when a ticket folder is found.
- Artifact Scanner is sufficient for MVP Evidence Inventory.
- Existing GitHub webhook endpoint exists at `POST /api/v1/webhooks/github`.
- Existing GitHub webhook service verifies `X-Hub-Signature-256` before parsing payload.
- Existing GitHub webhook service currently handles `ping`, ignores `push`, and supports `pull_request` actions `opened`, `synchronize`, `reopened`, and `closed`.
- Existing GitHub webhook service currently reads PR changed file paths to find `docs/changes/<TICKET>/` scopes and trigger Artifact Scanner for target branch events.
- Existing GitHub webhook service updates or creates minimal ticket status/last commit time through Artifact Scanner persistence flow.
- Existing DB schema already contains core tables for tickets, PRs, commits, changed files, traceability links, and connector runs.
- Current system does not yet persist full MVP PR metadata, commit metadata, changed file metadata, PR review state, or traceability links required by this ticket.
- Current system cannot yet show reliable `Ticket -> PR -> Commit -> Changed Files` traceability.
- Current system cannot yet detect PR activity that has no evidence folder, except through limited webhook ticket-scope behavior.

## 5. To-Be

- Add Git/PR Metadata Collector as a backend/data collection capability.
- Collector supports two trigger types:
  - webhook-triggered collection from Git provider PR events;
  - manual collection by Admin/Data Ops API.
- Collector fetches authoritative PR/commit/changed-file data from GitHub API instead of trusting webhook payload alone.
- Collector infers `linked_ticket_id` using deterministic MVP rules.
- Collector persists PR metadata, commit metadata, changed file metadata, and traceability links.
- Collector records each webhook-triggered or manual execution in ingest run log with status and counts.
- Collector is idempotent for PR, commit, changed file, and traceability link records.
- Collector reuses existing ticket records when Artifact Scanner already created them.
- Collector does not create duplicate ticket records.
- Collector stores PR/commit data even when the corresponding evidence folder is missing.
- Artifact Scanner remains the source for Evidence Inventory.
- Git/PR Metadata Collector becomes the source for development activity metadata.

Target combined view:

```text
Ticket
├─ Evidence Files
│  ├─ spec-pack.md
│  ├─ impl-plan.md
│  ├─ test-plan.md
│  ├─ test-results.md
│  └─ report.md
└─ Development Activity
   ├─ Pull Request
   ├─ Commit
   └─ Changed Files
```

## 6. Detailed specification

### 6.1. Business Rules

| ID | rule | source / note |
|---|---|---|
| BR-GIT-PR-METADATA-COLLECTOR-1 | Git metadata and PR metadata are collected in one MVP function. | Requirement / user clarification. |
| BR-GIT-PR-METADATA-COLLECTOR-2 | PR is the primary collection unit. | PR provides branch, commit, and changed file context. |
| BR-GIT-PR-METADATA-COLLECTOR-3 | The collector supports webhook-based collection and manual collection. Manual UI used only for developer testing is out of committed scope. | Requirement / human clarification. |
| BR-GIT-PR-METADATA-COLLECTOR-4 | Webhook payload must not be treated as full trusted source. Backend must call GitHub API for authoritative details. | Security/consistency requirement. |
| BR-GIT-PR-METADATA-COLLECTOR-5 | Artifact Scanner is not replaced by this collector. | Integration rule. |
| BR-GIT-PR-METADATA-COLLECTOR-6 | Artifact Scanner owns `Ticket -> Evidence Files`; Git/PR Collector owns `Ticket -> PR -> Commit -> Changed Files`. | Integration rule. |
| BR-GIT-PR-METADATA-COLLECTOR-7 | Both Artifact Scanner and Git/PR Collector must use the same canonical ticket key. | Prevent duplicate tickets. |
| BR-GIT-PR-METADATA-COLLECTOR-8 | If ticket already exists, collector must reuse it. | Idempotency and Artifact Scanner compatibility. |
| BR-GIT-PR-METADATA-COLLECTOR-9 | If inferred ticket does not exist, collector may store detected ticket key and PR metadata for later reconciliation. | Allows activity-without-evidence detection. |
| BR-GIT-PR-METADATA-COLLECTOR-10 | One ticket can be linked to one or more PRs. | Do not hard-code `1 ticket = 1 PR`. |
| BR-GIT-PR-METADATA-COLLECTOR-11 | PR, commit, changed file, and traceability records must be idempotent. | Required for webhook retries and manual reruns. |
| BR-GIT-PR-METADATA-COLLECTOR-12 | The collector must not store source code content, raw diff, raw patch, secret, raw prompt, or raw AI chat log. | Security/privacy. |
| BR-GIT-PR-METADATA-COLLECTOR-13 | Author must be stored as pseudonym/hash/mapped member ID if stored. | Privacy. |
| BR-GIT-PR-METADATA-COLLECTOR-14 | Manual collection can be executed only by Admin/Data Ops or equivalent authorized role. | Access control. |
| BR-GIT-PR-METADATA-COLLECTOR-15 | CI metadata collector is out of scope. | MVP boundary. |
| BR-GIT-PR-METADATA-COLLECTOR-16 | GitHub API errors must be recorded safely without leaking token/secret/payload details. | Error handling/security. |
| BR-GIT-PR-METADATA-COLLECTOR-17 | A collector run may end as `PARTIAL_SUCCESS` when some records fail but useful data is collected. `429`, `5xx`, timeout, or transient I/O failures must be treated as retryable failures; business/client validation failures must not be retried automatically in MVP. | Operation / human clarification. |
| BR-GIT-PR-METADATA-COLLECTOR-18 | Git/PR metadata must not be written into artifact snapshot tables. | Artifact Scanner separation. |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| repositoryId | UUID | Yes | Must exist and be active. | Required for manual collection and provider config lookup. |
| prNumber | Integer | No | Must be positive when provided. | Used for PR-specific manual collection. |
| fromDate | Date | No | If provided, valid date and `fromDate <= toDate`. | Repository manual scan filter. |
| toDate | Date | No | If provided, valid date. | Repository manual scan filter. |
| includeClosed | Boolean | No | Boolean. | Manual repository scan option. |
| provider webhook body | byte[] | Yes for webhook | Must pass signature validation before parsing. | Existing GitHub webhook pattern uses raw bytes. |
| provider event type | String | Yes for webhook | Supported event type for MVP: `pull_request`; `ping` may be accepted. | Provider-specific header. |
| provider delivery id | String | No | Used for log/trace/idempotency if available. | Must not be trusted as business key alone. |
| provider signature | String | Yes for webhook | Must match configured webhook secret. | For GitHub: `X-Hub-Signature-256`. |
| repository config | DB/config | Yes | Must have provider, repo name, access token/config, branch policy. | Token must not be logged. |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| runId | UUID/String | Existing connector run ID format | Returned by manual collect API and used for operation check. |
| repositoryId | UUID | Existing repository ID | Output of collect request. |
| prNumber | Integer | Provider PR number | Returned when PR-specific collect is used. |
| status | Enum/String | `RUNNING`, `SUCCESS`, `PARTIAL_SUCCESS`, `FAILED` | Run status. |
| processedPrCount | Integer | >= 0 | Ingest run result. |
| processedCommitCount | Integer | >= 0 | Ingest run result. |
| processedChangedFileCount | Integer | >= 0 | Ingest run result. |
| failureCount | Integer | >= 0 | Ingest run result. |
| traceId | String | Existing trace ID style | Returned/logged for troubleshooting. |
| PR metadata rows | DB rows | Provider-normalized | Persisted in PR table. |
| Commit metadata rows | DB rows | Provider-normalized | Persisted in commit table. |
| Changed file metadata rows | DB rows | Provider-normalized | Persisted in changed-file table. |
| Traceability links | DB rows | Source/target links | Used by Traceability Map and Ticket Evidence Detail. |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| Missing repository | Manual API rejects request or run fails safely. | `REPOSITORY_NOT_FOUND` / safe error response | Must include traceId. |
| Inactive repository | Reject request or fail safely. | `REPOSITORY_NOT_ACTIVE` | Manual API validation. |
| Unsupported provider | Reject request or fail safely. | `PROVIDER_NOT_SUPPORTED` | MVP supports GitHub only. |
| Missing provider token/config | Fail safely and write run log. | `PROVIDER_CONFIG_INVALID` | Do not log token value. |
| Webhook signature invalid | Reject before parsing payload. | `signature_invalid` or equivalent | Existing controller returns 401 for GitHub signature failure. |
| Webhook payload malformed | Reject safely. | `bad_payload` or equivalent | Do not echo raw payload. |
| Unsupported webhook action | Ignore safely. | handled result such as `ignored:<action>` | No run required unless design chooses to log ignored events. |
| Provider API rate limit | Run becomes `FAILED` or `PARTIAL_SUCCESS` depending on collected records. Retryable failure must be logged safely. | Safe provider error | MVP does not require automatic background retry. |
| PR not found | PR-specific run fails safely. | `PULL_REQUEST_NOT_FOUND` | No duplicate records. |
| No PR in repository scan | Run succeeds with processed count 0. | `SUCCESS` | Empty state. |
| Ticket ID cannot be inferred | Store PR/commit metadata with null/unknown ticket link. | No fatal error | Supports later reconciliation. |
| Duplicate webhook delivery | Upsert/update existing rows. | No user-facing error | Idempotency required. |
| Traceability link duplicate | Upsert/ignore existing link. | No user-facing error | Unique constraint expected. |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| prNumber | 1 | Provider max | Missing, zero, negative, non-numeric | Invalid request for PR-specific manual collect. |
| fromDate/toDate | Valid date | Valid date | `fromDate > toDate` | Invalid request. |
| PR count per repository scan | 0 | Provider/API dependent | 0 PRs | Run success with processed count 0. |
| Commit count per PR | 0 | Provider/API dependent | 0 commits if provider returns unusual data | PR metadata may still be stored; run partial/success based on policy. |
| Changed file count per PR | 0 | Provider/API dependent | Very large PR | Must not store file content; may need pagination. |
| Multiple ticket IDs | 0 | Many | Branch has one ID and title has another | Use priority order and record ambiguity if supported. |
| Missing ticket evidence folder | N/A | N/A | PR inferred to ticket but no `docs/changes/<TICKET>/` | Store PR/commit metadata; later dashboard can warn. |
| Repeated execution | 1 | Many | Same webhook/manual run repeated | No duplicate records. |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | PR-specific collection should finish quickly for normal PR size. | MVP target: complete within practical API timeout for small/medium PRs. | Integration/manual test. | Large PR pagination may be handled in Phase 3 detail. |
| Security | Webhook signature must be validated before payload parsing. | 100% of webhook requests. | Unit/integration test. | Existing GitHub endpoint is reused for MVP. |
| Security | Provider tokens/secrets must not be logged or returned. | 0 leakage. | Log review/test. | Error messages must be safe. |
| Security | Do not persist raw source, raw diff, raw patch, secret, raw prompt, raw chat. | 0 persisted prohibited content. | Code review/test. | Core metadata-first requirement. |
| Availability / Reliability | Repeated collector execution must be safe. | Idempotent for PR, commit, changed file, and traceability link. | Integration test. | Needed for webhook retry. |
| Maintainability | Provider access should be behind adapter/port boundary. | GitHub MVP adapter. Future providers remain out of MVP scope. | Code review. | Avoid provider-specific logic in controller. |
| Observability / Logging | Every manual and webhook-triggered collect run must have ingest run log. | 100% runs. | Integration test. | Webhook-triggered runs create connector run records. |
| Observability / Logging | Error output must include traceId where applicable. | 100% API errors. | API test. | Follow existing error handling. |
| Compatibility | Artifact Scanner behavior must remain compatible. | Existing scanner tests remain pass. | Regression test. | Do not break evidence inventory. |
| Privacy | Author is pseudonym/hash/mapped member ID. | No direct personal ranking use. | Data review. | Aggregation by team/process only. |

## 7. Acceptance Criteria

| ACID | description | testable? | notes |
|---|---|---|---|
| AC-GIT-PR-METADATA-COLLECTOR-1 | Admin/Data Ops can start manual Git/PR metadata collection for a valid active repository. | Yes | API-level test. |
| AC-GIT-PR-METADATA-COLLECTOR-2 | Admin/Data Ops can start manual Git/PR metadata collection for a specific PR number. | Yes | API-level test. |
| AC-GIT-PR-METADATA-COLLECTOR-3 | Unauthorized users cannot start manual collector runs. | Yes | Permission/API test. |
| AC-GIT-PR-METADATA-COLLECTOR-4 | When a supported PR webhook event is received with a valid signature, the system triggers collection for the target repository/PR or delegates to the collector flow. | Yes | Webhook integration test. |
| AC-GIT-PR-METADATA-COLLECTOR-5 | Webhook requests with missing or invalid signature are rejected before payload processing. | Yes | Security test. |
| AC-GIT-PR-METADATA-COLLECTOR-6 | The system stores PR number/ID, title, normalized status, source branch, target branch, created/opened time, updated time if available, merged time if available, closed time if available, and PR URL. | Yes | DB integration test. |
| AC-GIT-PR-METADATA-COLLECTOR-7 | The system normalizes PR status to `OPEN`, `MERGED`, `CLOSED`, or `UNKNOWN`. | Yes | Unit/integration test. |
| AC-GIT-PR-METADATA-COLLECTOR-8 | The system stores review state as `APPROVED`, `CHANGES_REQUESTED`, `REVIEW_REQUIRED`, or `UNKNOWN` using basic review state from GitHub when API support is available; otherwise `UNKNOWN` is stored. | Yes | Human decision closed. |
| AC-GIT-PR-METADATA-COLLECTOR-9 | The system stores commit hash, commit message hash or safe message representation according to DB design, committed time, author pseudonym/hash/mapped member ID, branch if available, and commit URL for commits belonging to the PR. | Yes | Must not store prohibited data. |
| AC-GIT-PR-METADATA-COLLECTOR-10 | The system stores changed file path or file path hash according to DB design, additions, deletions, and change status when provider supports it. | Yes | No file content/raw diff/raw patch. |
| AC-GIT-PR-METADATA-COLLECTOR-11 | The system infers `linked_ticket_id` from source branch, PR title, commit message, and changed file path using the MVP priority order. | Yes | Unit test for inference. |
| AC-GIT-PR-METADATA-COLLECTOR-12 | If ticket ID cannot be inferred, the collector still stores PR/commit metadata with unknown or null ticket link and does not fail the whole run. | Yes | Error/boundary test. |
| AC-GIT-PR-METADATA-COLLECTOR-13 | If the inferred ticket already exists because Artifact Scanner created it, the collector reuses that ticket and does not create a duplicate ticket. | Yes | Integration test with pre-existing ticket. |
| AC-GIT-PR-METADATA-COLLECTOR-14 | If a PR has inferred ticket activity but no evidence folder exists yet, the collector still stores PR/commit metadata so the missing evidence state can be detected later. | Yes | Integration test. |
| AC-GIT-PR-METADATA-COLLECTOR-15 | The system creates or updates traceability link `Ticket -> PR` when a ticket can be inferred or matched. | Yes | DB integration test. |
| AC-GIT-PR-METADATA-COLLECTOR-16 | The system creates or updates traceability link `PR -> Commit`. | Yes | DB integration test. |
| AC-GIT-PR-METADATA-COLLECTOR-17 | The system creates or updates traceability link `PR -> Changed File` or equivalent link based on final DB design. | Yes | DB integration test. |
| AC-GIT-PR-METADATA-COLLECTOR-18 | Re-running the collector for the same repository/PR does not create duplicate PR, commit, changed file, ticket, or traceability records. | Yes | Idempotency test. |
| AC-GIT-PR-METADATA-COLLECTOR-19 | Each manual collector run creates and updates an ingest run log with final status and processed/failure counts. | Yes | Integration test. |
| AC-GIT-PR-METADATA-COLLECTOR-20 | Provider API error or repository config error is recorded safely in ingest run log and API response includes traceId where applicable. | Yes | Error test. |
| AC-GIT-PR-METADATA-COLLECTOR-21 | The collector does not persist source code content, raw diff, raw patch, secret value, raw AI prompt, or raw AI chat log. | Yes | Code review / data assertion test. |
| AC-GIT-PR-METADATA-COLLECTOR-22 | Existing Artifact Scanner Evidence Inventory behavior remains compatible after Git/PR collector integration. | Yes | Regression test for scanner. |
| AC-GIT-PR-METADATA-COLLECTOR-23 | Data collected by this feature is sufficient to display basic traceability `Ticket -> PR -> Commit -> Changed Files`. | Yes | Data verification test. |

## 8. Examples

### 8.1. Normal Case

#### Example 1: Webhook-triggered collection

```text
Developer creates PR:
source branch: feature/ABC-123-stock-error
target branch: main
PR title: ABC-123 Improve stock shortage error
```

Expected:

- Git provider sends `pull_request opened` webhook.
- Backend verifies webhook signature.
- Backend resolves repository and PR number.
- Backend fetches PR metadata, commits, and changed files from provider API.
- Ticket inference returns `ABC-123` from source branch or PR title.
- PR metadata is stored.
- Commit metadata is stored.
- Changed file metadata is stored.
- Traceability links are created:

```text
Ticket ABC-123 -> PR #<number> -> Commit(s) -> Changed File(s)
```

#### Example 2: Manual PR-specific collection

```http
POST /api/v1/repositories/{repositoryId}/pull-requests/123/git-pr-metadata/collect
```

Expected:

- Request is accepted for authorized Admin/Data Ops user.
- Ingest run log is created with `RUNNING`.
- PR #123 metadata is collected.
- Run log ends as `SUCCESS` or `PARTIAL_SUCCESS` with counts.

### 8.2. Error Case

#### Example 1: Invalid webhook signature

Input:

```text
POST /api/v1/webhooks/github
X-Hub-Signature-256: invalid
```

Expected:

- Backend rejects request before parsing payload.
- Response is unauthorized or equivalent safe error.
- Raw payload and secret are not logged.

#### Example 2: Repository config lacks provider token

Input:

```http
POST /api/v1/repositories/{repositoryId}/git-pr-metadata/collect
```

Expected:

- Run is marked `FAILED` or request is rejected safely.
- Error message does not contain token/secret.
- Response/log includes traceId.

#### Example 3: Ticket ID cannot be inferred

Input:

```text
PR title: Refactor service layer
branch: feature/refactor-service
commit message: cleanup
```

Expected:

- PR and commit metadata are still stored.
- `linked_ticket_id` is null/unknown.
- No Ticket -> PR link is created.
- PR remains available for later reconciliation.

### 8.3. Boundary Case

#### Example 1: Multiple ticket IDs

Input:

```text
source branch: feature/ABC-123-main-fix
PR title: XYZ-999 related adjustment
commit message: ABC-123 update implementation
```

Expected:

- Source branch has highest priority.
- `linked_ticket_id = ABC-123`.
- Ambiguity is recorded if final design supports it.

#### Example 2: PR exists but evidence folder does not

Input:

```text
branch: feature/LOGIN-001-auth-fix
no docs/changes/LOGIN-001/ folder yet
```

Expected:

- PR/commit metadata is stored.
- Ticket may be stored as detected key or linked if ticket exists.
- Artifact snapshot is not created by Git/PR Collector.
- Later dashboard can show activity without evidence.

#### Example 3: Same webhook delivered twice

Expected:

- Existing PR/commit/changed file/traceability records are updated or ignored according to upsert rules.
- No duplicate records are created.

## 9. Source Availability Summary

| source | status | trust level | summary |
|---|---|---|---|
| Requirement definition | available/read | high | Defines MVP scope, two trigger types, data requirements, API requirements, AC, and DoD. |
| Database design | available/read | high | Defines reuse-first DB strategy and Artifact Scanner impact. |
| Ticket templates | available/read | high | Used to keep this pack structure consistent. |
| Artifact Scanner source | available/read | high | Confirms existing Evidence Inventory behavior. |
| GitHub webhook source | available/read | high | Confirms current webhook endpoint and signature verification. |
| DB migration source | available/read | high | Confirms existing tables for ticket, PR, commit, changed file, traceability, and connector run. |
| Architecture/standards | partially read | medium | Used for contract, security, DB, and testing impact. |
| Provider API documentation | not read in Phase 1 | medium | Must be verified in Phase 3 for exact API fields and pagination. |
| Existing Git/PR collector tests | unavailable | N/A | New tests are required. |

## 10. Complexity Classification

```text
- Complexity: Complex
- System shape: BE + DB + External IF + Batch/Collector + Webhook
- Primary risk: Source / Contract / DB / Security / Operation / Test
- Review mode: Heavy
- Required options: Source Analysis / BE Contract / DB Migration / Full Security / External IF / Operation Logging
```

Reason:

- The feature touches provider API integration, webhook security, DB persistence, idempotency, traceability, and interaction with existing Artifact Scanner.
- FE production impact is out of committed MVP scope because manual collect UI is test-only and not part of the committed deliverable.

## 11. FE/BE Contract Impact

- BE impact is required.
- FE production impact is out of committed MVP scope.
- A temporary local/dev-only manual collect UI may exist for testing, but it must not be treated as a committed deliverable.
- Proposed manual APIs from requirement:

```http
POST /api/v1/repositories/{repositoryId}/git-pr-metadata/collect
POST /api/v1/repositories/{repositoryId}/pull-requests/{prNumber}/git-pr-metadata/collect
GET /api/v1/ingest-runs/{runId}
```

- Existing webhook endpoint reused for MVP:

```http
POST /api/v1/webhooks/github
```

- Existing webhook endpoint `POST /api/v1/webhooks/github` is reused for MVP. Collector logic may be delegated behind the same endpoint/service boundary.
- API responses must include run ID/status/traceId for manual requests.
- Error responses must not leak token, secret, or raw provider payload.

## 12. DB/Migration Impact

Existing tables that should be reused where possible:

| table | expected use |
|---|---|
| `tbl_dim_ticket` | Ticket/change-unit master. Not a PR table. |
| `tbl_fact_pull_request` | PR metadata. |
| `tbl_fact_commit` | Commit metadata. |
| `tbl_fact_pull_request_commit` | PR-commit relationship. |
| `tbl_fact_commit_changed_file` | Commit-level changed file metadata if used. |
| `tbl_fact_traceability_link` | Ticket/PR/Commit/Changed File links. |
| `tbl_connector_run` | Ingest run log. |
| `tbl_source_connector` | Connector definition, likely needs `GIT_PR_METADATA_COLLECTOR`. |

Expected migration direction:

- Prefer `ALTER TABLE` / indexes / unique constraints over new tables except where PR-level changed file granularity requires a dedicated table.
- Add columns only where current schema lacks required MVP fields such as PR URL, commit URL, review state summary, match confidence, processed counts, or provider identifiers.
- Do not overload `tbl_dim_ticket.status` as the authoritative PR status if PR metadata is persisted in `tbl_fact_pull_request`.
- Use `tbl_fact_pull_request.status` for PR status.
- Keep Artifact Scanner view compatibility in mind because `vw_artifact_inventory_current` currently exposes ticket status as `pr_status` alias.

Confirmed DB design decision:

- Add a new PR-level changed file table for MVP, for example `tbl_fact_pull_request_changed_file`, because changed files are collected and stored at `PR x File` granularity.
- `tbl_fact_commit_changed_file` remains commit-level and must not be overloaded to represent PR-level summaries.
- PR status/state must remain in PR metadata storage and must not reuse `tbl_dim_ticket.status`.

## 13. Security/Privacy Impact

- Webhook signature must be verified before payload parsing.
- Provider token/config must be stored and used according to platform security policy.
- Error messages and logs must not include token, secret, raw payload, raw diff, raw patch, or source content.
- Collector must not persist source code content.
- Collector must not persist raw diff or raw patch.
- Collector must not persist secret/token/password/private key values.
- Collector must not persist raw AI prompt or raw AI chat log.
- Author data must be pseudonymized, hashed, or mapped to internal member ID.
- Data must not be used for personal ranking or individual productivity evaluation.
- Manual collector APIs must require Admin/Data Ops or equivalent authorization.

## 14. Operation/Maintenance Impact

- Collector must write ingest run logs for manual runs and webhook-triggered runs.
- Webhook-triggered collection must create connector run records for observability and troubleshooting.
- Run statuses should include `RUNNING`, `SUCCESS`, `PARTIAL_SUCCESS`, `FAILED`, and retryable failure semantics according to implementation detail.
- Run log should include processed PR count, processed commit count, processed changed file count, failure count, safe error message, and traceId.
- Webhook retry and manual rerun must be safe due to idempotency.
- Provider API failure should not corrupt existing records.
- Unknown ticket matching must not block PR metadata persistence.
- Artifact Scanner regression must be monitored because existing webhook currently triggers scanner.
- MVP uses synchronous webhook processing through the existing GitHub webhook endpoint. Service boundaries should stay separable so a future queue/background job can be introduced without changing the external endpoint contract.

## 15. Test Strategy Summary

| test area | test type | target |
|---|---|---|
| Ticket ID inference | BE unit test | Branch/title/message/path priority, no match, multiple matches. |
| PR status normalization | BE unit test | Provider status/action to `OPEN`/`MERGED`/`CLOSED`/`UNKNOWN`. |
| Review state normalization | BE unit test | Review data to `APPROVED`/`CHANGES_REQUESTED`/`REVIEW_REQUIRED`/`UNKNOWN`. |
| Manual repository collect | API integration test | Authorized user starts run and records are persisted. |
| Manual PR collect | API integration test | Specific PR metadata/commit/changed file persisted. |
| Webhook signature | Security/integration test | Invalid signature rejected before parsing. |
| Webhook collect | Integration test | Supported PR event triggers collector or delegated collection flow. |
| Idempotency | Integration test | Running same PR twice creates no duplicates. |
| Artifact Scanner compatibility | Regression test | Existing artifact scan still works and artifact snapshots are not polluted. |
| Error handling | Integration test | Provider/config error writes safe run log and traceId. |
| Prohibited data | Code review / data assertion | No source content/raw diff/raw patch/secret/raw prompt/chat persisted. |

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| H-GIT-PR-METADATA-COLLECTOR-1 | MVP provider is GitHub. | Closed per human clarification on 2026-06-17. | PM/Tech Lead | Closed |
| H-GIT-PR-METADATA-COLLECTOR-2 | Reuse existing `POST /api/v1/webhooks/github` endpoint and extend/delegate collector logic behind it. | Keeps current Artifact Scanner integration path while avoiding a second public webhook endpoint. | Tech Lead | Closed |
| H-GIT-PR-METADATA-COLLECTOR-3 | Target branch is controlled in two layers: GitHub webhook config should prioritize PR events for target branches, and backend must validate `target_branch` against repository config. MVP default is `main` and `develop`; other branches are `SKIPPED`/ignored. | Defines deterministic scope and skip behavior. | PM/Tech Lead | Closed |
| H-GIT-PR-METADATA-COLLECTOR-4 | Changed files are stored at PR level using a new table. | Confirms migration direction and persistence granularity. | Tech Lead/DB Owner | Closed |
| H-GIT-PR-METADATA-COLLECTOR-5 | Ticket ID inference must support both patterns: `[A-Z][A-Z0-9]+-[A-Z0-9-]+` and existing folder-based IDs under `docs/changes/<TICKET>`. | Required for deterministic inference and tests. | PM/BA | Closed |
| H-GIT-PR-METADATA-COLLECTOR-6 | Manual collect UI may exist only as a local/test-only aid and will not be committed as an MVP deliverable. | FE production scope remains out of committed MVP scope. | PM | Closed |
| H-GIT-PR-METADATA-COLLECTOR-7 | Basic review state is collected from GitHub when API support is available; otherwise `UNKNOWN` is stored. | Keeps review-state scope minimal but deterministic. | Tech Lead | Closed |
| H-GIT-PR-METADATA-COLLECTOR-8 | MVP retry/rate-limit policy: no complex automatic background retry is required; `429`, `5xx`, timeout, and transient I/O failures are treated as retryable failures, while business/client validation failures are not retried automatically. | Defines safe operation behavior for MVP. | Tech Lead/Data Ops | Closed |
| H-GIT-PR-METADATA-COLLECTOR-9 | Webhook-triggered collection must create connector run records. | Required for auditability and troubleshooting. | BE/Data Ops | Closed |
| H-GIT-PR-METADATA-COLLECTOR-10 | MVP uses synchronous webhook processing via the existing endpoint/service boundary; future queue/background processing remains a later enhancement. | Minimizes moving parts in MVP while keeping extension path open. | Tech Lead | Closed |
| H-GIT-PR-METADATA-COLLECTOR-11 | PR status/state must be stored in PR metadata storage and must not reuse `tbl_dim_ticket.status`. | Prevents semantic confusion between ticket lifecycle and PR lifecycle. | DB/BE | Closed |

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-GIT-PR-METADATA-COLLECTOR-1 | GitHub is the confirmed MVP provider. | Human clarification on 2026-06-17. | Low. | No |
| A-GIT-PR-METADATA-COLLECTOR-2 | Existing `POST /api/v1/webhooks/github` will be reused/extended. | Human clarification on 2026-06-17. | Low/Medium; coupling with Artifact Scanner still needs careful implementation. | No |
| A-GIT-PR-METADATA-COLLECTOR-3 | `tbl_dim_ticket` is ticket/change-unit master, not PR table. | Existing schema and Artifact Scanner usage. | Low. | No |
| A-GIT-PR-METADATA-COLLECTOR-4 | One ticket may have multiple PRs even if MVP usually has one main PR. | Practical development workflow. | Low; safer DB design. | No |
| A-GIT-PR-METADATA-COLLECTOR-5 | Existing `tbl_connector_run` will be reused for collector run logging for both webhook and manual runs. | Existing connector/run schema plus human clarification. | Low/Medium; may need extra count columns or evidence JSON. | No |
| A-GIT-PR-METADATA-COLLECTOR-6 | Existing PR/commit tables can be reused with additive columns/indexes, but PR-level changed files require a new table. | V4 schema plus human clarification. | Medium; exact field mapping must be checked in Phase 3. | No |
| A-GIT-PR-METADATA-COLLECTOR-7 | Artifact Scanner does not need major changes for this feature. | Existing scanner already satisfies Evidence Inventory. | Low unless webhook refactor breaks it. | No |
| A-GIT-PR-METADATA-COLLECTOR-8 | Manual collect UI is test-only and not part of the committed MVP deliverable. | Human clarification on 2026-06-17. | Low. | No |

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-GIT-PR-METADATA-COLLECTOR-1 | Provider-specific GitHub API field mapping and pagination limits are not yet verified in code detail. | Could affect implementation detail and performance tuning. | BE | Open |
| OI-GIT-PR-METADATA-COLLECTOR-2 | Exact DB migration columns, indexes, and constraints are not finalized yet even though PR-level changed file table direction is confirmed. | Could affect implementation sequencing. | DB/BE | Open |
| OI-GIT-PR-METADATA-COLLECTOR-3 | Final run status enum naming for retryable failure is not finalized (`FAILED` with error code vs separate `FAILED_RETRYABLE`). | Affects operation vocabulary and API contract detail. | BE/Data Ops | Open |
| OI-GIT-PR-METADATA-COLLECTOR-4 | Detailed ticket ID inference priority and ambiguity recording rules are not finalized in implementation detail. | Wrong matching may create bad traceability. | BE/PM/BA | Open |
| OI-GIT-PR-METADATA-COLLECTOR-5 | Large-PR performance threshold and the trigger point for future queue/background adoption are not yet quantified. | Could affect reliability for very large PRs. | Tech Lead | Open |