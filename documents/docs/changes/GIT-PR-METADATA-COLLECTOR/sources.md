# Sources

**Ticket ID**: GIT-PR-METADATA-COLLECTOR  
**Create date**: 2026-06-17  
**Author**: nk_trung  
**Update date**: 2026-06-17  

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Ticket body | User request in conversation | read | Phase 1 request: create `sources.md`, `00_brainstorm.md`, and `spec-pack.md` for Git/PR Metadata Collector. |
| Ticket ID | `GIT-PR-METADATA-COLLECTOR` | read | Used as canonical ticket/change unit. |
| MVP scope clarification | User clarification | read | Git metadata and PR metadata are implemented together for MVP; CI metadata collector is out of scope. |
| Artifact Scanner clarification | User clarification and source check | read | Artifact Scanner is considered sufficient for MVP Evidence Inventory and must not be replaced by this collector. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement definition | `docs/changes/GIT-PR-METADATA-COLLECTOR/raw/requirement.md` | read | high | Main requirement for Git/PR Metadata Collector. Includes in-scope/out-of-scope, webhook/manual trigger, data requirements, API requirements, AC, and DoD. |
| Database design draft | `docs/changes/GIT-PR-METADATA-COLLECTOR/raw/database-design.md` | read | high | Database design for reusing existing tables and adding columns/indexes if needed. Notes impact with Artifact Scanner. |
| Ticket template | `docs/standards/templates/_ticket-template/spec-pack.md` | read | high | Defines required structure for `spec-pack.md`. |
| Source template | `docs/standards/templates/_ticket-template/sources.md` | read | high | Defines required structure for this file. |
| Brainstorm template | `docs/standards/templates/_ticket-template/00_brainstorm.md` | read | high | Defines required structure for investigation notes. |
| Architecture overview | `docs/architecture/overview.md` | partial | medium | Used for high-level platform layering and source system context. |
| Data flow map | `docs/architecture/data-flow-map.md` | partial | medium | Used for collector/data-flow positioning. |
| Repository DB map | `docs/architecture/repository-db-map.md` | partial | medium | Used to identify DB mapping conventions. |
| Route/API map | `docs/architecture/route-api-map.md` | partial | medium | Used to confirm API route style. |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | partial | medium | Used to assess contract impact. |
| API contract standard | `docs/standards/api-contract.md` | partial | medium | Used for API response/error/traceId expectations. |
| Backend standard | `docs/standards/backend.md` | partial | medium | Used for backend layering expectations. |
| Database standard | `docs/standards/database.md` | partial | medium | Used for migration/idempotency expectations. |
| Security standard | `docs/standards/security.md` | partial | high | Used for token, webhook, secret, and privacy handling. |
| Logging standard | `docs/standards/logging.md` | partial | medium | Used for traceId and ingest run logging expectations. |
| Testing standard | `docs/standards/testing.md` | partial | medium | Used for test strategy summary. |
| Claude safety rule | `.claude/rules/00-safety.md` | partial | high | Used for no raw secret/source/prompt/chat handling. |
| Claude architecture rule | `.claude/rules/20-architecture.md` | partial | medium | Used for layering and source-first implementation policy. |
| Claude security rule | `.claude/rules/30-security.md` | partial | high | Used for security/privacy restrictions. |
| Claude testing rule | `.claude/rules/40-testing.md` | partial | medium | Used for test expectations. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| Artifact Scanner service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | read | Confirms existing scanner scans `docs/changes/<TICKET>/` and writes artifact snapshots. |
| Artifact Scanner models | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | partial | Confirms scanner request/run/snapshot model style. |
| Artifact Scanner persistence port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java` | read | Confirms repository/ticket/run/snapshot persistence responsibilities and `upsertMinimalTicket`. |
| Artifact Scanner source port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/ArtifactScannerSourcePort.java` | partial | Confirms source adapter boundary pattern. |
| Artifact Scanner JDBC adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | partial | Confirms current DB access style for scanner. |
| Artifact Scanner controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | partial | Confirms current manual scan API style. |
| GitHub webhook service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | read | Confirms existing GitHub webhook signature verification, supported PR actions, target branch check, PR changed-file reading, and Artifact Scanner trigger. |
| GitHub webhook controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | read | Confirms current webhook endpoint `POST /api/v1/webhooks/github`. |
| GitHub PR files port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/GithubPullRequestFilesPort.java` | partial | Confirms existing port for PR changed paths and last commit time. |
| GitHub PR files adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubPullRequestFilesAdapter.java` | partial | Confirms existing provider adapter pattern. |
| Repository domain model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Repository.java` | partial | Used to understand repository concept. |
| Pull request domain model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/PullRequest.java` | partial | Used to understand existing PR domain concept. |
| Commit domain model | No dedicated detailed model confirmed beyond migration/domain scan | partial | Requires Phase 3 confirmation before implementation. |
| DB migration V4 | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | Confirms existing `tbl_dim_ticket`, `tbl_fact_pull_request`, `tbl_fact_commit`, `tbl_fact_commit_changed_file`, `tbl_fact_pull_request_commit`, `tbl_fact_traceability_link`, and `tbl_connector_run`. |
| DB migration V160 | `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` | read | Confirms Artifact Scanner-specific columns/view and ARTIFACT_SCANNER connector seed. |
| DB migration V161 | `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | read | Confirms PR-like status is currently moved into `tbl_dim_ticket.status` for Artifact Scanner view. Needs careful handling for new PR metadata. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Artifact Scanner service tests | `EDCAP_BE/src/test/...` matching Artifact Scanner | partial | Existing scanner tests can guide run/idempotency style but do not cover Git/PR metadata collector. |
| GitHub webhook tests | `EDCAP_BE/src/test/...` matching webhook if present | partial | Need deeper Phase 3 check before implementation. |
| DB/migration tests | Backend integration tests / Flyway startup tests | partial | Need Phase 3 verification for migration impact. |
| Git/PR collector tests | New tests required | unavailable | This feature has no dedicated tests yet. |
| FE tests | Not required for Phase 1 | not-read | MVP may not require new FE for manual collect. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| External GitHub/GitLab documentation | Web reference | not-read in Phase 1 | Provider API details must be checked in Phase 3 if implementation needs exact endpoint fields. |
| Office/PDF documents | N/A | not used | No Office/PDF input is needed for this Phase 1 pack. |

## Excluded Sources

| source/path | reason |
|---|---|
| Full `.git/` history | Not needed for Phase 1; Git history mining is out of scope. |
| `node_modules`, `target`, build output, coverage output | Generated/high-noise artifacts; not needed for spec. |
| Raw source code content from provider API | Explicitly out of scope for collector; do not collect or persist source content. |
| Raw diff / raw patch | Explicitly out of scope due security and data minimization. |
| Secrets, tokens, passwords, private keys | Security exclusion. Never copy into evidence artifacts. |
| Raw AI prompt / raw AI chat log | Explicitly out of scope for the platform's metadata-first policy. |
| Full source tree unrelated to scanner/webhook/repository/schema | Phase 1 reads only minimum necessary source for As-Is and impact. |

## Source Limitations

- Requirement and database design are available and consistent on MVP direction: Git and PR metadata are collected together, CI metadata collector is out of scope, and both webhook and manual collection are needed.
- Existing source already has a GitHub webhook endpoint and service, but the current webhook behavior is oriented to Artifact Scanner triggering and minimal ticket status update, not full PR/commit metadata persistence.
- Existing DB schema already has major target tables for PR, commit, PR-commit link, commit changed file, traceability link, and connector run. However, exact column sufficiency for MVP fields must be validated in Phase 3.
- Existing Artifact Scanner is sufficient for MVP Evidence Inventory but does not replace Git/PR Metadata Collector.
- Provider API field availability and pagination still need implementation verification in Phase 3, but this is no longer a human-decision blocker.
- This Phase 1 pack does not execute build/test/lint.

## Assumptions from Sources

- `GIT-PR-METADATA-COLLECTOR` is the canonical ticket ID.
- MVP provider is GitHub.
- Existing `POST /api/v1/webhooks/github` is reused; collector logic is extended or delegated behind the same endpoint/service boundary.
- Target branch is controlled in two layers: GitHub webhook configuration should prioritize PR events for the target branches, and backend must still validate `target_branch` against repository configuration. MVP default target branches are `main` and `develop`; other branches are `SKIPPED` or ignored.
- Ticket ID inference must support both `[A-Z][A-Z0-9]+-[A-Z0-9-]+` and existing folder IDs under `docs/changes/<TICKET>`.
- `tbl_dim_ticket` stores ticket/change-unit metadata, not Pull Request metadata.
- One ticket usually has one main PR in MVP operation, but DB/spec must not hard-code `1 ticket = 1 PR`.
- PR changed files are stored at PR level in a new table.
- Basic review state is collected from GitHub when API support is available; otherwise `UNKNOWN` is stored.
- Manual collect UI may exist only as a local/test-only aid and will not be committed as an MVP deliverable.
- Existing `tbl_connector_run` is reused for Git/PR collector run logging for both webhook-triggered and manual runs.
- PR status/state is stored in PR metadata storage and must not reuse `tbl_dim_ticket.status`.
- MVP retry/rate-limit handling uses `FAILED` plus safe `error_code`/reason rather than introducing a separate `FAILED_RETRYABLE` status enum.
- Ticket inference priority is fixed as: PR title first, source branch second, changed file path folder inference third, and commit message last. If multiple candidates remain at the same priority, the collector does not auto-pick a winner; it stores the ambiguity for review and records a warning outcome.
- MVP keeps synchronous webhook processing with no numeric large-PR threshold. The collector paginates provider data within the same request; if rate-limit/timeout/transient failures occur on large PRs, the run follows the standard failure/partial-success policy.

## Human Confirmation Required

- None. All previously identified human confirmations were resolved on 2026-06-17.