# Impact Analysis

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-17 
**Author**: nk_trung
**Update date**: 2026-06-17 

## 1. Change Content

Implement an MVP GitHub-only Git/PR metadata collector that reuses the existing GitHub webhook endpoint, adds an admin-only manual collection API, collects authoritative PR/commit/changed-file metadata from GitHub, infers `linked_ticket_id`, persists PR-level traceability data, and records connector run results without breaking existing Artifact Scanner Evidence Inventory behavior.

The change is intentionally additive. It must preserve the current scanner behavior while adding a new development-activity metadata path that supports `Ticket -> PR -> Commit -> Changed Files` traceability.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | Reuse fixed webhook entrypoint and keep response behavior compatible with extended collector flow. | modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | Main orchestration target; must delegate to PR collector flow while keeping HMAC verification and supported webhook actions. | modify / refactor |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/GithubPullRequestFilesPort.java` | Current port is too narrow for full MVP PR metadata needs. | modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubPullRequestFilesAdapter.java` | Existing adapter must expand from file-path-only access to authoritative PR/commit/review/file metadata access. | modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/` new manual collector controller | Required for admin-only manual collection by repository and by PR number. | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/` new manual collector DTO(s) | Required request/response contract for manual collection. | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/` new PR collector use case/service | Required to keep business logic out of controller and avoid overgrowing `GithubWebhookService`. | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/` new or expanded collector persistence port | Required for upsert of PR/commit/traceability/PR-file/run data. | add / modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/` collector adapter / mapper / SQL | Required DB persistence implementation for the collector graph. | add |
| `EDCAP_BE/src/main/resources/db/migration/Vxxx__git_pr_metadata_collector.sql` | Required additive schema change, especially PR-level changed-file storage and indexes/constraints for idempotency. | add |
| `EDCAP_BE/src/test/UnitTest/...` and `EDCAP_BE/src/test/IntegrationTest/...` new collector tests | Required AC coverage, especially permission, webhook, idempotency, run logging, and regression. | add |

## 3. Indirectly Affected Files
| file | reason | risk |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Webhook integration currently routes into scanner flow; regression risk if orchestration is not isolated cleanly. | medium |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java` | Existing repository lookup and run persistence may be reused or shared. | medium |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Existing connector run SQL pattern may be reused or mirrored. | medium |
| `EDCAP_BE/src/main/java/com/sdd/platform/config/TraceIdFilter.java` | Error and API responses should continue to surface trace IDs where applicable. | low |
| `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` | Existing scanner assumptions must remain compatible. | medium |
| `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | Risk of semantic collision if new collector accidentally reuses ticket status. | high |
| Existing dashboards or report queries reading `tbl_fact_pull_request` | New columns/indexes/semantics may affect future query assumptions, even if no FE change is in scope now. | low |

## 4. Caller / Callee
| caller | callee | impact |
|---|---|---|
| `GithubWebhookController.receive(...)` | `GithubWebhookService.handle(...)` | Existing caller remains unchanged but downstream behavior expands to full PR metadata collection. |
| `GithubWebhookService.handle(...)` | new PR collector orchestration use case | Introduce delegation boundary so HMAC parsing and collector orchestration stay testable. |
| New manual collector controller | new PR collector orchestration use case | New admin-only caller for repository-level or PR-level manual runs. |
| PR collector orchestration use case | GitHub integration port | New authoritative metadata reads for PR details, commits, review state, changed files. |
| PR collector orchestration use case | collector persistence port | New upsert flow for PR, commits, PR-commit links, PR changed files, traceability links, and run records. |
| PR collector orchestration use case | ticket inference helper | New deterministic ticket matching path with ambiguity handling. |
| PR collector orchestration use case | existing repository lookup and run logging support | Reuse existing repository scope and connector run patterns where appropriate. |

## 5. FE Impact

Committed FE impact is effectively none for MVP.

- No production FE screen, dashboard, or route is in scope.
- A temporary local/manual UI may exist for developer testing only, but it must not be committed and therefore is not part of the affected committed files.
- Existing FE screens should remain unaffected because this feature is backend/data collection oriented.

## 6. BE Impact

BE impact is significant and is the core of the ticket.

- Webhook handling logic changes from scanner-only PR interpretation to PR metadata collection orchestration.
- A new manual admin API is required.
- New application service/use case(s) are required to keep orchestration, ticket inference, provider fetch, and persistence responsibilities separated.
- GitHub integration must be widened beyond changed file paths and last commit timestamp.
- Persistence must support additive upsert logic for PR metadata graph and run/audit records.
- Existing scanner compatibility must be preserved.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `POST /api/v1/webhooks/github` | No contract change expected in inbound GitHub webhook shape; internal behavior expands. | Response should stay small and safe (`handled`, `recordsAffected`, error codes for invalid payload/signature). | Yes |
| New manual collector endpoint under `/api/v1/...` | New request DTO needed for repository-level and PR-level manual collection. | New run/result DTO needed, likely aligned with existing run response style and traceId expectations. | Additive |
| Existing scanner endpoints | No contract change intended. | No contract change intended. | Yes |

## 8. DTO / Schema / Validation Impact

- New request DTO(s) are required for manual collection.
- Validation is required for repository ID and optional PR number mode selection.
- Existing role enforcement must use the real `AppUser.Role.ADMIN` enum.
- GitHub webhook validation remains: HMAC first, then payload parsing.
- New internal normalized DTO/domain model is likely required for PR details, commit details, review summary, changed-file details, and ticket inference result.
- Validation must explicitly support the resolved branch policy and ambiguity handling rules.

## 9. DB / Migration Impact

- `tbl_fact_pull_request` is directly impacted and may need additive columns or a stricter upsert path.
- `tbl_fact_pull_request_commit` is directly impacted for PR-to-commit link persistence.
- `tbl_fact_commit_changed_file` remains commit-level only and must not be repurposed for PR-level changed-file storage.
- A new PR-level changed-file table is required.
- `tbl_connector_run` is directly impacted because every webhook/manual execution must create/update a run record.
- `tbl_dim_ticket` reuse logic is required, but its `status` column must not become PR status.
- New indexes/constraints are likely needed for idempotency and lookup efficiency.
- Migration must be additive and rollback-safe at the application level.

## 10. Batch / Job / Event Impact

- GitHub `pull_request` webhook handling is directly impacted.
- `ping` and `push` webhook handling should remain compatible.
- No new batch or queue job is introduced in MVP.
- Manual collection acts like an on-demand administrative operation, not a background scheduler.
- Synchronous execution means provider/API latency and pagination behavior affect request execution time and logs.

## 11. Test Impact

- New unit tests are required for ticket inference priority, PR status normalization, review-state fallback, branch policy, and error mapping.
- New integration tests are required for webhook happy path, invalid signature, unknown repo, missing branch/PR number, duplicate delivery, manual admin authorization, and regression of existing scanner behavior.
- DB integration tests are required for idempotent upsert and correct run logging.
- Regression tests are required to prove Artifact Scanner Evidence Inventory still works after integration changes.

## 12. Operation / Monitoring Impact

- Every execution must create/update a connector run record.
- Logs must remain safe: no raw payload, no secret, no token, no raw diff, no source content.
- Operational triage should be possible using trigger source, delivery ID, repo, PR number, target branch, run ID, status, and traceId.
- Synchronous webhook execution makes timeout/rate-limit/error logging more important.
- Manual runs should capture requester identity in the run metadata.

## 13. Rollout / Rollback Impact

- Rollout should be additive: deploy migration first, then code that uses the new tables/columns.
- Existing webhook endpoint remains the same, which reduces rollout surface.
- If rollback is needed, operational rollback should prefer disabling the new collector path or withholding the manual endpoint rather than destructive schema rollback.
- Because scanner compatibility is a hard requirement, rollback planning must focus on restoring existing webhook-to-scanner behavior if a regression is detected.

## 14. Areas Determined to be Unaffected and Based on
| area | judgment | evidence |
|---|---|---|
| Production FE dashboards and routes | Unaffected in committed scope | Spec and ticket rules explicitly mark FE production UI as out of scope. |
| Multi-provider abstraction | Unaffected in MVP | GitHub-only decision already closed in spec. |
| CI metadata collector | Unaffected | Explicitly out of scope in `spec-pack.md`. |
| Raw source code / raw diff persistence | Unaffected | Explicitly prohibited by spec and rules. |
| Artifact evidence snapshot semantics | Must remain unaffected | Artifact Scanner remains source of truth for Evidence Inventory. |
| User role model expansion | Unaffected in MVP | Existing `AppUser.Role` only has `VIEWER`, `EDITOR`, `ADMIN`; spec chose `ADMIN` for manual collect. |
| Queue / background processing infrastructure | Unaffected in MVP | Synchronous webhook processing explicitly retained for MVP. |

## 15. Required Options

- Manual API path naming under existing REST conventions.
- Final naming for the new PR-level changed-file table and unique/index strategy.
- Whether to widen the existing GitHub port or add a new collector-specific GitHub port.
- Whether review state is persisted directly on the PR fact row, in a minimal summary row, or by partially reusing `tbl_fact_review` in a constrained way.

## 16. Human Decision Required

None. Human decisions required for MVP scope, role policy, branch policy, ticket inference order, review fallback, provider choice, and run logging policy are already closed in the current ticket documentation.

## 17. Risk Summary

Main implementation risks are technical, not business-definition risks:

- accidental regression of existing scanner webhook behavior;
- overloading `GithubWebhookService` instead of extracting a testable orchestration boundary;
- schema misuse, especially around `tbl_dim_ticket.status` and commit-level versus PR-level changed-file storage;
- insufficient idempotency constraints;
- synchronous provider/API latency and pagination causing fragile webhook handling.