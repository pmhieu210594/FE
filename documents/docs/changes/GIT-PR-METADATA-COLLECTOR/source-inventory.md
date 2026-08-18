# Source Inventory

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-17  
**Author**:  nk_trung
**Update date**: 2026-06-17  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket spec | `docs/changes/GIT-PR-METADATA-COLLECTOR/spec-pack.md` | markdown | Ticket author | read | Primary AC and scope source of truth. |
| Ticket context | `docs/changes/GIT-PR-METADATA-COLLECTOR/context.md` | markdown | Ticket author | read | Existing touchpoints, allowed components, role and DB mapping. |
| Ticket rules | `docs/changes/GIT-PR-METADATA-COLLECTOR/ticket-rules.md` | markdown | Ticket author | read | Must-follow and must-not-do implementation rules. |
| Standards template | `docs/standards/templates/_ticket-template/source-availability.md` | markdown template | Standards | read | Phase 3 template basis. |
| Standards template | `docs/standards/templates/_ticket-template/source-inventory.md` | markdown template | Standards | read | Phase 3 template basis. |
| Standards template | `docs/standards/templates/_ticket-template/impact-analysis.md` | markdown template | Standards | read | Phase 3 template basis. |
| Standards template | `docs/standards/templates/_ticket-template/impl-plan.md` | markdown template | Standards | read | Phase 3 template basis. |
| Webhook entrypoint | `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | java | BE | read | Existing endpoint that must be reused. |
| Webhook orchestration | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | java | BE | read | Current PR event handling, signature verification, scanner handoff. |
| Existing GitHub port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/GithubPullRequestFilesPort.java` | java interface | BE | read | Current integration contract is too narrow for full collector needs. |
| Existing GitHub adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubPullRequestFilesAdapter.java` | java | BE | read | Existing WebClient and pagination pattern to extend. |
| Scanner manual API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | java | BE | read | Best existing example for authenticated admin-only manual operation. |
| Scanner DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ArtifactScannerDtos.java` | java | BE | read | Request/run response DTO pattern. |
| Generic DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | java | BE | read | Connector run DTO and API style references. |
| Scanner service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | java | BE | read | Existing run lifecycle and persistence interaction pattern. |
| Scanner models | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | java | BE | read | Existing `ArtifactScanTriggerType` enum and run model. |
| Scanner persistence port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java` | java interface | BE | read | Existing repository lookup and connector run persistence contract. |
| Scanner JDBC adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | java | BE | read | Existing SQL/run persistence implementation to mirror or extend. |
| Auth/role model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | java | BE | read | Confirms real roles are `VIEWER`, `EDITOR`, `ADMIN`. |
| Trace ID filter | `EDCAP_BE/src/main/java/com/sdd/platform/config/TraceIdFilter.java` | java | BE | read | Existing trace/correlation behavior for error reporting. |
| Current DB schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | SQL migration | DB/BE | read | Current fact/dimension tables, enums, indexes. |
| Scanner migration | `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` | SQL migration | DB/BE | read | Scanner-added compatibility context. |
| Ticket status migration | `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | SQL migration | DB/BE | read | Important warning that ticket status was reused historically. |
| Legacy cleanup migration | `EDCAP_BE/src/main/resources/db/migration/V162__drop_legacy_non_tbl_tables.sql` | SQL migration | DB/BE | read | Confirms legacy non-`tbl_` tables are being dropped. |
| Legacy schema | `EDCAP_BE/src/main/resources/db/migration/V1__init_schema.sql` | SQL migration | DB/BE | read | Historical only; not the active target schema. |
| Scanner integration test | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/ArtifactScannerControllerIntegrationTest.java` | test | QA/BE | read | Best permission/API regression example. |
| Scanner persistence integration test | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/infrastructure/persistence/ArtifactScannerPersistenceIntegrationTest.java` | test | QA/BE | read | Confirms connector run SQL path. |
| Governance role tests | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/*.java` | test | QA/BE | partial | Examples of admin enforcement pattern. |
| FE application | `EDCAP_FE/src/` | frontend source | FE | partial | No committed feature impact for MVP. |

## Important Files

- `spec-pack.md`: authoritative acceptance criteria and scope.
- `context.md`: concrete code/db/table/role mapping already confirmed against source.
- `ticket-rules.md`: implementation and review guardrails.
- `GithubWebhookController.java`: fixed webhook endpoint that must be reused.
- `GithubWebhookService.java`: current synchronous webhook flow and main refactoring target.
- `GithubPullRequestFilesPort.java` / `GithubPullRequestFilesAdapter.java`: existing integration seam for new GitHub API expansion.
- `ArtifactScannerController.java` / `ArtifactScannerDtos.java`: best manual API pattern to follow.
- `ArtifactScannerJdbcAdapter.java`: best existing run persistence reference.
- `V4__init_shema_v2.sql`: current schema baseline including `tbl_connector_run`, `tbl_fact_pull_request`, `tbl_fact_pull_request_commit`, and `tbl_fact_commit_changed_file`.

## Generated / Excluded Files

- `EDCAP_FE/node_modules/`, `EDCAP_FE/dist/`, `EDCAP_FE/coverage/`, `EDCAP_FE/test-results/`: generated outputs, not implementation sources.
- `EDCAP_BE/target/`: generated output, not implementation source.
- ZIP packaging artifacts and uploaded translated review files under `vi/`: helpful for review but not implementation source of truth.
- Any temporary local manual test UI: explicitly excluded from committed deliverable.

## Missing Files

- No existing `GitPrMetadataCollectorController` or equivalent manual collector API class yet.
- No dedicated PR metadata collector use case/service yet.
- No persistence port/adapter dedicated to upserting PR metadata graph yet.
- No migration for PR-level changed-file storage yet.
- No dedicated unit/integration test suite for PR collector yet.