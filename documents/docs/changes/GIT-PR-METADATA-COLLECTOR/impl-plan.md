# Implementation Plan

**Ticket ID**: GIT-PR-METADATA-COLLECTOR  
**Create date**: 2026-06-17  
**Author**: nk_trung  
**Update date**: 2026-06-17  

## 1. Implementation Principle

- Reuse the existing layering and flow as much as possible: thin controller, business logic in use case/service, integration behind ports, persistence behind ports/adapters.
- Keep the existing GitHub webhook endpoint as the webhook entrypoint. Add a separate manual collection API for operational use.
- Implement only what is necessary to satisfy the MVP ACs. Do not expand to multi-provider support or production FE features.
- Keep the internal orchestration clean enough that the flow can be moved to queue/background execution later, while the MVP remains synchronous.
- Keep Artifact Scanner compatibility. The new collector must extend traceability coverage without breaking existing scanner behavior.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Reuse the existing webhook endpoint/service and extend the orchestration with a dedicated PR metadata collector flow plus a manual admin API | Small API surface change, aligned with current architecture, lower delivery risk | The service layer can become bloated unless orchestration is extracted cleanly | Selected |
| B | Create a separate webhook endpoint/service dedicated to Git/PR metadata collection | Clear separation of the new concern | Conflicts with the agreed decision to reuse the existing endpoint; increases API surface | Rejected |
| C | Introduce queue/background processing from the MVP | Better scalability for large PRs and retries | Adds operational and implementation complexity too early | Rejected |

## 3. Reason for Choosing the Alternative Plan

Option A is the best fit for the agreed Phase 1 decisions and the current codebase. It preserves the existing webhook entrypoint, minimizes unnecessary surface changes, keeps the MVP scope small, and concentrates change in the orchestration, integration, persistence, and traceability layers rather than introducing new infrastructure.

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | Keep the existing endpoint and adjust dispatch/logging only if needed | Reuse the current webhook entrypoint | AC-GIT-PR-METADATA-COLLECTOR-4, AC-GIT-PR-METADATA-COLLECTOR-5 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | Extend or delegate to a collector orchestration use case | Existing webhook flow must trigger PR metadata collection | AC-GIT-PR-METADATA-COLLECTOR-4, AC-GIT-PR-METADATA-COLLECTOR-5, AC-GIT-PR-METADATA-COLLECTOR-6 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/...` (new manual collect controller) | Add a manual collect API for admins | Required for operational/manual collection | AC-GIT-PR-METADATA-COLLECTOR-1, AC-GIT-PR-METADATA-COLLECTOR-2, AC-GIT-PR-METADATA-COLLECTOR-3 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/...` | Add manual collect request/response DTOs | Define the manual API contract | AC-GIT-PR-METADATA-COLLECTOR-1, AC-GIT-PR-METADATA-COLLECTOR-2, AC-GIT-PR-METADATA-COLLECTOR-3 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/...` (new collector use case) | Add orchestration for PR/review/commit/file collection and ticket inference | Keep business logic separate from controller/webhook glue code | AC-GIT-PR-METADATA-COLLECTOR-6 to AC-GIT-PR-METADATA-COLLECTOR-23 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/...` | Extend GitHub integration port | Provider-authoritative fetch for PR details, reviews, commits, and files | AC-GIT-PR-METADATA-COLLECTOR-6, AC-GIT-PR-METADATA-COLLECTOR-8, AC-GIT-PR-METADATA-COLLECTOR-9, AC-GIT-PR-METADATA-COLLECTOR-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/...` | Implement GitHub adapter changes | Actual GitHub API integration | AC-GIT-PR-METADATA-COLLECTOR-6, AC-GIT-PR-METADATA-COLLECTOR-8, AC-GIT-PR-METADATA-COLLECTOR-9, AC-GIT-PR-METADATA-COLLECTOR-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/...` | Add/adjust collector persistence ports | Upsert PR, commit, file, link, ticket relation, and run log data | AC-GIT-PR-METADATA-COLLECTOR-6, AC-GIT-PR-METADATA-COLLECTOR-9 to AC-GIT-PR-METADATA-COLLECTOR-20 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/...` | Add/update JDBC/MyBatis adapter, mapper, and SQL | Persist metadata and traceability safely | AC-GIT-PR-METADATA-COLLECTOR-6 to AC-GIT-PR-METADATA-COLLECTOR-20 |
| `EDCAP_BE/src/main/resources/db/migration/Vxxx__*.sql` | Add migration(s) for PR-level changed files and any supporting constraints/indexes | Persist changed files at PR granularity with idempotency | AC-GIT-PR-METADATA-COLLECTOR-10, AC-GIT-PR-METADATA-COLLECTOR-17, AC-GIT-PR-METADATA-COLLECTOR-18 |
| `EDCAP_BE/src/test/...` | Add unit/integration tests | Validate AC coverage, authorization, idempotency, fallback, and regression | AC-GIT-PR-METADATA-COLLECTOR-1 to AC-GIT-PR-METADATA-COLLECTOR-23 |

## 5. Class / Function / Method to Add or Modify

| Target | Action | Input | Output | Note |
|---|---|---|---|---|
| `GithubWebhookService.handle(...)` | Modify | Raw body, signature, event name, delivery id | Handling result | Must preserve HMAC validation and delegate supported PR events into the collector flow |
| `GithubWebhookService.handlePullRequest(...)` or dedicated collector use case | Modify / Extract | Parsed payload, delivery id | Collector result | Extract orchestration to keep the webhook service maintainable |
| Manual collect controller | Add | Request DTO + authenticated user | Run/result DTO | `ADMIN`-only for the MVP |
| Manual collect request DTO | Add | Repository id/key, optional PR number, optional mode | Typed validated request | Use validation annotations consistent with existing controller patterns |
| GitHub integration port methods | Add / Modify | Repo key, PR number, identifiers from webhook payload | PR details, review summary/state, commits, files | Use provider-authoritative fetch for final persisted metadata |
| Collector persistence port | Add | Normalized metadata graph | Upsert result / ids / run data | Keep persistence logic out of orchestration |
| Ticket inference helper | Add | PR title, source branch, changed file paths, commit messages | Resolved ticket match / ambiguous / unknown | Must follow the fixed MVP priority order |
| Run log updater | Add / Modify | Trigger source, repo, PR, status, counts, error information | Updated run log record | Must support success, partial success, skipped, and failed states |

## 6. SQL / Query / Repository Policy

- Reuse existing fact/link tables where their semantics already match PR, commit, ticket, and run-log needs.
- Add a new PR-level changed-file table. Do not force PR changed files into a commit-level changed-file table if the granularity does not match.
- Enforce idempotency through stable lookup and unique keys, such as repository + external PR number, repository + commit hash, and a stable PR + file identity.
- Do not use `tbl_dim_ticket.status` as the storage location for PR state.
- Keep migrations additive and rollback-friendly within the existing Flyway migration strategy.
- Avoid destructive migration changes for Artifact Scanner-related tables unless absolutely necessary.

## 7. Validation / Error / Logging Policy

- Webhook path: validate signature before processing payload content. Missing or invalid signature must be rejected.
- Manual API path: require authenticated `ADMIN` role.
- Unsupported repository / unsupported event / unsupported branch must be handled as skipped or ignored with explicit run-log evidence.
- GitHub API `429`, `5xx`, timeout, or transient I/O failures must result in safe failure recording. If a safe subset of data was persisted already, allow `PARTIAL_SUCCESS`.
- Always record at least: trigger source, delivery id or manual caller, repository, PR number if known, target branch, run id, final status, and safe error reason/code if applicable.
- Never persist prohibited raw content such as patch bodies, source code blobs, secrets, or AI log content.

## 8. Migration / Rollback Policy

- Use additive migrations only.
- Do not destructively modify existing Artifact Scanner tables as part of this ticket.
- If an index or constraint is added to an existing table, verify compatibility with existing data first.
- Operational rollback should primarily be achieved by disabling the new manual entrypoint and/or bypassing the new collector path, not by destructive data rollback.
- The data model should support safe re-run after rollback/re-enable without creating duplicates.

## 9. Step Implementation

| Step | Action | Target File / Area | Verification | Stop Condition |
|---|---|---|---|---|
| 1 | Finalize the PR collector data model and persistence mapping | Design + migration files + persistence interfaces | Mapping is consistent with `spec-pack.md`, `context.md`, and current schema | Existing tables are semantically insufficient and additive design becomes unclear |
| 2 | Extract/implement dedicated collector orchestration from the webhook flow | Use case/service classes | Existing webhook happy path still works; supported PR events enter collector flow | The current service becomes too coupled to test safely |
| 3 | Extend GitHub integration port/adapter to fetch PR details, review state, commits, and files | Integration port + GitHub adapter | Adapter/service unit tests with mocked provider responses pass | Required provider fields are unavailable or pagination assumptions break |
| 4 | Implement persistence upsert logic, ticket inference integration, traceability links, and run logging | Persistence port/adapter/mapper/SQL | Integration tests prove idempotency and correct relation persistence | Unique key / relation design cannot be stabilized |
| 5 | Add the manual collect admin API | Controller + DTO + authorization | API permission and request validation tests pass | A new role model beyond `ADMIN` becomes mandatory |
| 6 | Add tests for happy path, error path, boundary path, idempotency, and regression | Unit/integration tests | AC-backed tests pass | Major conflict appears between spec and code reality |
| 7 | Update downstream ticket artifacts with implementation evidence | Self-review, test artifacts, report | Traceability from AC to evidence is complete | Evidence is insufficient to prove coverage |

## 10. How to Verify Each Step

- **Step 1**: Re-check schema and traceability against `spec-pack.md` and existing migrations.
- **Step 2**: Validate that the existing webhook happy path still works and signature verification behavior is unchanged.
- **Step 3**: Mock GitHub responses for opened, reopened, synchronize, and closed/merged events; verify review-state fallback to `UNKNOWN`.
- **Step 4**: Re-run the same PR input and confirm no duplicate PR, commit, changed-file, ticket, or link records are created.
- **Step 5**: Confirm `ADMIN` can invoke the manual API while `VIEWER` and `EDITOR` cannot.
- **Step 6**: Run unit/integration tests for normal, error, boundary, and regression scenarios.
- **Step 7**: Confirm every implemented AC has evidence in test artifacts and/or self-review/report artifacts.

## 11. Corresponding AC Table

| AC ID | Implementation Point | Verification |
|---|---|---|
| AC-GIT-PR-METADATA-COLLECTOR-1 | Add manual collection API for a valid active repository and restrict it to `ADMIN` for the MVP. | API integration test for manual start with a valid repository. |
| AC-GIT-PR-METADATA-COLLECTOR-2 | Support manual collection API for a specific PR number. | API integration test for repository + PR number input. |
| AC-GIT-PR-METADATA-COLLECTOR-3 | Enforce authorization on the manual collection API and reject non-admin users. | Permission test with `VIEWER`/`EDITOR` denied and `ADMIN` allowed. |
| AC-GIT-PR-METADATA-COLLECTOR-4 | Reuse the existing GitHub webhook endpoint and dispatch supported PR events into the collector flow. | Webhook integration test with valid signature and supported PR event. |
| AC-GIT-PR-METADATA-COLLECTOR-5 | Reject webhook requests with missing or invalid signature before payload processing. | Security test for invalid signature and missing signature. |
| AC-GIT-PR-METADATA-COLLECTOR-6 | Persist PR core metadata including number/ID, title, normalized status, branches, timestamps, and URL. | DB integration test asserting persisted PR core fields. |
| AC-GIT-PR-METADATA-COLLECTOR-7 | Normalize provider PR state into `OPEN`, `MERGED`, `CLOSED`, or `UNKNOWN`. | Unit/integration test for state normalization cases. |
| AC-GIT-PR-METADATA-COLLECTOR-8 | Derive and persist basic review state from GitHub when available; otherwise persist `UNKNOWN`. | Integration test for review-supported and review-unavailable cases. |
| AC-GIT-PR-METADATA-COLLECTOR-9 | Persist PR commit metadata using safe representation rules. | DB integration test plus data-safety assertion for commit fields. |
| AC-GIT-PR-METADATA-COLLECTOR-10 | Persist changed-file metadata at PR level with additions/deletions/status, without storing file content, diff, or patch. | DB integration test plus negative assertion that raw content/diff is not stored. |
| AC-GIT-PR-METADATA-COLLECTOR-11 | Implement ticket inference from branch/title/commit/path using the MVP priority order. | Unit test covering each evidence source and the defined priority ordering. |
| AC-GIT-PR-METADATA-COLLECTOR-12 | Allow null/unknown ticket link when inference fails without failing the whole run. | Boundary/error test for PRs with no inferable ticket ID. |
| AC-GIT-PR-METADATA-COLLECTOR-13 | Reuse an existing ticket created by Artifact Scanner instead of creating duplicates. | Integration test with a pre-existing ticket record. |
| AC-GIT-PR-METADATA-COLLECTOR-14 | Persist PR/commit metadata even when the evidence folder does not yet exist. | Integration test with ticket-like activity but missing evidence folder. |
| AC-GIT-PR-METADATA-COLLECTOR-15 | Create or update the `Ticket -> PR` traceability link when a ticket is inferred or matched. | DB integration test for ticket-to-PR link creation/update. |
| AC-GIT-PR-METADATA-COLLECTOR-16 | Create or update the `PR -> Commit` traceability link. | DB integration test for PR-to-commit link creation/update. |
| AC-GIT-PR-METADATA-COLLECTOR-17 | Create or update the `PR -> Changed File` traceability relation or equivalent persisted relation. | DB integration test for PR-to-file relation persistence. |
| AC-GIT-PR-METADATA-COLLECTOR-18 | Make collector re-runs idempotent for PR, commit, changed file, ticket, and traceability records. | Idempotency test by re-running the same repository/PR input. |
| AC-GIT-PR-METADATA-COLLECTOR-19 | Create/update ingest run log for each manual collector run with final status and counts. | Integration test asserting `tbl_connector_run` lifecycle and counters. |
| AC-GIT-PR-METADATA-COLLECTOR-20 | Record provider/config errors safely in the run log and expose `traceId` where applicable. | Error-path integration test verifying safe error capture and traceId propagation. |
| AC-GIT-PR-METADATA-COLLECTOR-21 | Ensure the collector never persists prohibited raw content such as source code, diff, patch, secrets, or AI logs. | Code review checklist plus integration assertion on stored fields. |
| AC-GIT-PR-METADATA-COLLECTOR-22 | Keep existing Artifact Scanner Evidence Inventory behavior compatible after integration. | Regression test for existing scanner flows. |
| AC-GIT-PR-METADATA-COLLECTOR-23 | Ensure collected data supports basic `Ticket -> PR -> Commit -> Changed Files` traceability display. | Data verification test across persisted links and query path. |

## 12. Stop / Ask Condition

- Existing PR-related tables are not sufficient for the required semantics and additive design becomes unclear.
- GitHub API integration requires scopes, tokens, or permissions that are not currently available.
- Manual collection requires a new role model beyond `ADMIN`.
- The manual test-only UI is suddenly required to be committed as an official feature.
- The provider response shape materially differs from the assumptions used in the collector design.

## 13. Do Not Do This Ticket

- Do not build a production FE dashboard or a committed FE feature for manual collection.
- Do not introduce full multi-provider abstraction.
- Do not parse or report CI metadata.
- Do not collect raw diff or raw source code content.
- Do not convert Artifact Scanner into a generic Git/PR collector replacement.

## 14. Open Related Issues

- Verify the exact GitHub API field mapping when implementing the adapter.
- Finalize the exact table/column/index/constraint names for PR-level changed files.
- Decide how much review-summary detail should be stored in the MVP if the existing review table model is heavier than the MVP needs.