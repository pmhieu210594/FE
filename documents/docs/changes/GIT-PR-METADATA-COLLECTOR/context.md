# Context

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-17 
**Author**: nk_trung
**Update date**: 2026-06-17 
## Screen / API / Batch / Related Job

| type | name | path / endpoint | current state | note |
|---|---|---|---|---|
| API | GitHub webhook endpoint | `POST /api/v1/webhooks/github` | Existing | This is the existing webhook entrypoint. It accepts raw bytes so HMAC can be verified before JSON parsing. |
| API | Artifact Scanner manual run | `POST /api/v1/data-ops/artifact-scans` | Existing | Existing admin-only manual API pattern to reference for the new manual collect API. |
| API | Artifact Scanner run detail | `GET /api/v1/data-ops/artifact-scans/{runId}` | Existing | Existing admin-only run detail API pattern. |
| API | Artifact Scanner inventory | `GET /api/v1/data-ops/artifact-scans/current` | Existing | Existing admin-only inventory query API pattern. |
| Batch/Job | Queue/background job | Not available for this ticket | Not used in MVP | MVP stays synchronous in webhook/manual API processing. |
| Screen | Official manual collect UI | None | Out of committed scope | A local/test-only UI may exist, but it must not be committed. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Thin webhook controller delegating business logic to service | `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | Keep the controller limited to HTTP plumbing, header/body handling, and status codes. Do not place collector business logic in the controller. |
| Verify HMAC before parsing payload | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | Always verify `X-Hub-Signature-256` before parsing JSON. Do not log the raw payload on failure. |
| Manual admin API role check with `@CurrentUser` + `assertAdmin` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | The real manual collect API must follow the authenticated + authorized role pattern and must not be public. |
| Usecase layer calling ports instead of depending directly on adapters | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | The new collector should follow the existing layering: usecase -> port -> adapter. |
| Run logging via `tbl_connector_run` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Create a run record at start and update it at finish, including `traceId`, status, counts, and error message. |

## Allowed common components
| component | path | usage note |
|---|---|---|
| `GithubWebhookController` pattern | `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | Reuse the existing endpoint. Extending the service behind it is allowed, but creating a new webhook endpoint is not allowed in MVP. |
| `GithubWebhookService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | Reuse or extend the existing flow for webhook-triggered collection. |
| `ArtifactScannerPersistencePort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java` | Reuse it for repository/ticket lookup and run persistence patterns. |
| `GithubPullRequestFilesPort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/GithubPullRequestFilesPort.java` | Reuse the adapter boundary with GitHub API. If more fields are needed, extend the port instead of calling the adapter directly from a controller. |
| `@CurrentUser AppUser` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentUser.java` and existing controllers | Use this for the manual API to check the `ADMIN` role. |
| DTO record pattern | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ArtifactScannerDtos.java` | New manual collect DTOs should use Java records plus validation annotations consistently. |

## Forbidden common components
| component | reason |
|---|---|
| Manual test-only UI code | It is outside the committed MVP deliverable. It may be used locally for testing but must not be committed to the official repository. |
| Direct storage of source code, diff, patch, or raw payload in DB | It violates the spec-pack and data minimization/security policy. |
| Reusing `tbl_dim_ticket.status` as PR status | It has different semantics. PR status must live in PR metadata storage, not in ticket status. |
| Placing collector business logic in a controller | It violates layering and makes testing and maintenance harder. |

## List of methods that actually exist
| method/class | path | usage |
|---|---|---|
| `GithubWebhookController.receive(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | Existing GitHub webhook entrypoint. |
| `GithubWebhookService.handle(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | Existing webhook service entrypoint. |
| `GithubWebhookService.handlePullRequest(...)` | same service file | Existing `pull_request` event flow. |
| `ArtifactScannerService.scan(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Existing usecase example that returns `ScanRun`; can be referenced for collector execution patterns. |
| `ArtifactScannerController.run(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | Existing admin-only manual trigger API pattern. |
| `ArtifactScannerPersistencePort.findRepositoryByMaskedName(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java` | Can be reused to resolve a repository from webhook payload. |
| `ArtifactScannerPersistencePort.upsertMinimalTicket(...)` | same port file | Reuse an existing ticket if it already exists; do not create duplicate tickets by external key. |
| `GithubPullRequestFilesPort.listChangedFilePaths(...)` | existing GitHub port | Already exists for changed file paths. |
| `GithubPullRequestFilesPort.resolveLastCommitAt(...)` | existing GitHub port | Already exists for last commit time lookup. |

## Forbidden methods / methods that do not exist
| method/API | reason | alternative |
|---|---|---|
| Manual collect API without role check | It violates the security policy for data-ops operations | Follow the `ArtifactScannerController.assertAdmin(...)` pattern. |
| Webhook flow checking the currently logged-in EDCAP user role | Wrong authorization model for a machine-to-machine webhook | Verify GitHub signature plus repository/branch/config rules instead. |
| `DATA_OPS` role enum | It does not exist in the current `AppUser.Role` | MVP uses `ADMIN` for manual collect. |
| Separate endpoint such as `/api/v1/webhooks/git-pr-metadata` | It conflicts with the ticket decision | Reuse `POST /api/v1/webhooks/github`. |
| Dedicated queue worker/job for this ticket in MVP | Required infrastructure is not part of this ticket | Keep processing synchronous and isolate services well enough to queue later if needed. |
| Storing PR changed files in `tbl_fact_commit_changed_file` at PR granularity | That table is for commit-level changed files, not PR-level changed files | Add a new table for PR changed files as defined in the spec-pack. |

## DTO / Entity / Table / Migration mapping
| layer | name | path | Note |
|---|---|---|---|
| Web DTO | `ArtifactScanRequestDto` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ArtifactScannerDtos.java` | Existing record + validation DTO pattern to reference for the new manual collect API. |
| Domain/User | `AppUser` / `AppUser.Role` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Actual roles are `VIEWER`, `EDITOR`, `ADMIN`; `DATA_OPS` does not exist. |
| Domain | `Repository` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Repository.java` | Use to understand the existing repository concept. |
| Domain | `PullRequest` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/PullRequest.java` | A basic PR domain model already exists; field sufficiency must be checked during implementation. |
| Persistence port | `ArtifactScannerPersistencePort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java` | Reuse point for repository/ticket/run persistence patterns. |
| Integration port | `GithubPullRequestFilesPort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/GithubPullRequestFilesPort.java` | Extend it if metadata beyond changed paths / last commit time is required. |
| DB table | `tbl_dim_ticket` | `V4__init_shema_v2.sql`, `V161__artifact_scanner_ticket_status.sql` | Holds ticket/change-unit data; it must not become the source of truth for the new PR status. |
| DB table | `tbl_fact_pull_request` | `V4__init_shema_v2.sql` | Core PR table already exists; evaluate whether its fields and idempotency keys are sufficient for MVP. |
| DB table | `tbl_fact_commit` | `V4__init_shema_v2.sql` | Core commit metadata table already exists. |
| DB table | `tbl_fact_commit_changed_file` | `V4__init_shema_v2.sql` | Commit-level changed file table only; it does not replace PR-level changed files. |
| DB table | `tbl_fact_pull_request_commit` | `V4__init_shema_v2.sql` | Existing PR-to-commit link table. |
| DB table | `tbl_fact_traceability_link` | `V4__init_shema_v2.sql` | Existing traceability link table; the exact link type must be confirmed during implementation. |
| DB table | `tbl_connector_run` | `V4__init_shema_v2.sql` | Reuse for webhook/manual collector runs. |
| Migration note | `V160__artifact_scanner.sql` | Flyway migration | Previously added `pr_status` for Artifact Scanner views. |
| Migration note | `V161__artifact_scanner_ticket_status.sql` | Flyway migration | Moved `pr_status` into `tbl_dim_ticket.status`; this must not be reused incorrectly for the new PR collector. |

## formItemNm / SEQNO / Master Data / Code Value Mapping
| display/item | internal value | source | note |
|---|---|---|---|
| Trigger source: webhook | `WEBHOOK` | `ArtifactScanTriggerType` / spec-pack | Used for run/audit metadata. |
| Trigger source: manual | `MANUAL` or equivalent existing enum | `ArtifactScanTriggerType` / spec-pack | Manual collect API should map the source explicitly. |
| App user role admin | `ADMIN` | `AppUser.Role` | MVP manual collect uses `ADMIN`; there is no actual `DATA_OPS` enum. |
| PR open state | `OPEN` | existing PR/ticket status usage + spec-pack | Used for PR metadata, not stored in `tbl_dim_ticket.status`. |
| PR closed/merged state | `CLOSED`, `MERGED` | webhook logic + DB enum | Existing webhook logic already maps actions to `OPEN/CLOSED/MERGED`. |
| Review state fallback | `UNKNOWN` | spec-pack | Used when GitHub API cannot provide a reliable review state. |
| MVP default branches | `main`, `develop` | human decision in spec-pack | Other branches are `SKIPPED` / ignored according to repo config. |
| Ticket inference regex | `[A-Z][A-Z0-9]+-[A-Z0-9-]+` | spec-pack | Used alongside folder inference from `docs/changes/<TICKET>`. |
| Ticket inference priority | `PR title` > `source branch` > `changed file path folder` > `commit message` | spec-pack | If multiple candidates remain at the same priority, do not auto-pick. |

## Multilingual Note

- Artifact and ticket content may contain English, Vietnamese, or Japanese. The collector should only process identifying metadata and must not depend on free-text language.
- Do not hard-code user-facing messages in only one language if the API response needs a message. Reuse existing error codes such as `Component.Permission.Denied` where possible.
- Ticket keys, branch names, file paths, commit hashes, and PR numbers are technical data and must not be translated or locale-normalized.

## Encoding / Mojibake Note

- The webhook controller currently accepts `byte[]` so HMAC can be verified against the raw bytes; do not parse JSON before verification.
- JSON parsing after verification should use Jackson/Spring UTF-8 defaults; do not re-encode the payload.
- Do not log the raw payload when verification fails, to avoid exposing secrets, paths, or actor information.
- File paths from GitHub API must be preserved exactly as application strings; do not lowercase or normalize them in a way that breaks path matching.

## Log / Audit / Operation Note

- Webhook-triggered collection does not check any EDCAP user role; audit it by `trigger_source=WEBHOOK`, `deliveryId`, `repo`, `prNumber`, and `targetBranch`.
- Manual collect must check `ADMIN` and should record `requestedBy` / caller information in the run record.
- Every execution must create a connector run record in `tbl_connector_run`.
- For GitHub API failures such as `429/5xx/timeout`, MVP stores `FAILED` with `error_code` / `reason`; `PARTIAL_SUCCESS` may be used if a safe subset of metadata was already persisted.
- Because webhook processing is synchronous, logs must be sufficient to debug duplicate delivery, branch skip, unknown repo, missing PR number, and pagination failure.
- Do not log secrets, tokens, raw diffs, raw payloads, source content, or unnecessary PII.

## Ticket-Specific Constraints

- Reuse `POST /api/v1/webhooks/github`; do not create a separate webhook endpoint in MVP.
- The manual collect API is a real backend API and must be `ADMIN`-only. A local test UI, if any, must not be committed.
- GitHub is the only provider in MVP.
- PR is the primary collection unit. Changed files must be stored at PR level using a new table, not forced into a commit-only table.
- PR status and review state belong to the PR collector metadata model; do not reuse `tbl_dim_ticket.status` as the source of truth.
- Branch policy has two layers: GitHub webhook configuration should filter first, and backend must still validate the branch against repository config. MVP defaults to `main` and `develop`.
- If multiple ticket candidates remain at the same priority, the collector must not pick a winner automatically; it must persist ambiguity or warning information for manual review.