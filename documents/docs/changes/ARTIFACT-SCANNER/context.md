# Context

**Ticket ID**: ARTIFACT-SCANNER   
**Create date**: 2026-06-16   
**Author**: nk_trung   
**Update date**: 2026-06-16   

## Screen / API / Batch / Related Job

| type | existing / expected name | path | note |
|---|---|---|---|
| Existing client/manual test screen | AdminPage | `EDCAP_FE/src/pages/AdminPage.tsx` | Existing screen for manual connector runs. Use only as a pattern reference; do not consider it part of the scanner functional scope. |
| Existing client/manual route | `/:lang/admin` | `EDCAP_FE/src/App.tsx` | Existing ADMIN-only route. Use only as a reference for test/operation placement if needed. |
| Existing client/manual API helper | `availableConnectors`, `runConnector`, `connectorRuns` | `EDCAP_FE/src/lib/api.ts` | Refer to the endpoint helper pattern instead of calling `fetch` directly. |
| Existing BE Controller | `AdminController` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Existing endpoints are available for connector run history and connector trigger. It can be extended, or a dedicated controller can be created for the artifact scanner. |
| Existing BE Orchestration | `ConnectorOrchestrator` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/collection/ConnectorOrchestrator.java` | Provides the standard flow for available connectors and run lifecycle. |
| Existing BE Port | `EvidenceConnectorPort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/EvidenceConnectorPort.java` | Provides the `name()` and `sync(Long projectId)` contract. |
| Existing connector (As-Is reference only) | `GitLocalConnector` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/gitlocal/GitLocalConnector.java` | Currently mixes scanner + parser + AC sync + legacy tables. Do not use it as the target design; use it only to reference the local path scan pattern. |
| Target DB migration | `V4__init_shema_v2.sql` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Use only V4 tables for this ticket. |
| Related Batch / Job | Connector run orchestration | `ConnectorOrchestrator` + future scheduled/manual trigger | MVP v1 prioritizes manual/full/ticket-scoped scan. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Client endpoint wrapper | `EDCAP_FE/src/lib/api.ts` | Create typed endpoint helpers; do not call `fetch` directly inside pages/components. |
| Admin test page pattern | `EDCAP_FE/src/pages/AdminPage.tsx` | Use `useQuery`/`useMutation`, query invalidation, status badges, and a run history table. |
| Route guard pattern | `EDCAP_FE/src/App.tsx` | Use `RequireAdmin` for the scanner operation screen if needed. |
| BE orchestration | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/collection/ConnectorOrchestrator.java` | Create a run, set RUNNING/SUCCESS/FAILED, and record timestamps and error messages. |
| BE connector port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/EvidenceConnectorPort.java` | Keep the connector contract simple; the scanner can be wrapped in a new connector implementation. |
| V4 snapshot model | `tbl_fact_artifact_snapshot` in `V4__init_shema_v2.sql` | Use a snapshot/history model instead of creating a new inventory table. |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `ConnectorOrchestrator` | `EDCAP_BE/.../application/usecase/collection/ConnectorOrchestrator.java` | Can be used as the run orchestration pattern or extended if connector-based execution is retained. |
| `EvidenceConnectorPort` | `EDCAP_BE/.../application/port/out/integration/EvidenceConnectorPort.java` | Can be used if the Artifact Scanner is implemented as a standard connector. |
| `AdminController` pattern | `EDCAP_BE/.../web/rest/AdminController.java` | Can be used as a template for the manual run endpoint and run history. |
| `endpoints` helper | `EDCAP_FE/src/lib/api.ts` | Can be used as a reference for the manual test API helper pattern. |
| `AdminPage` UI pattern | `EDCAP_FE/src/pages/AdminPage.tsx` | Can be used as a template to render run summary, trigger button, and loading/error state. |
| V4 dimension/fact tables | `V4__init_shema_v2.sql` | Used as the only target schema for this ticket. |

## Forbidden common components

| component | reason |
|---|---|
| Legacy tables `artifact`, `ticket`, old `connector_run` | Does not match the document requirements; this ticket must use only V4 tables. |
| Current parsing logic in `GitLocalConnector` | This scanner ticket does not parse Markdown and does not sync AC. |
| Direct `fetch` in client pages/components | Does not follow the current codebase pattern. |
| Creating a new inventory table outside V4 | The decision is to use `vw_artifact_inventory_current` instead of a new table. |
| Storing full Markdown content in the scanner DB | Violates the principle that the repo is the SSOT and is outside the scanner scope. |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `EvidenceConnectorPort.name()` | `.../EvidenceConnectorPort.java` | Displayed connector name and used for triggering. |
| `EvidenceConnectorPort.sync(Long projectId)` | `.../EvidenceConnectorPort.java` | Existing sync contract. An adapter may be needed if the scanner requires more input than `projectId`. |
| `ConnectorOrchestrator.availableConnectors()` | `.../ConnectorOrchestrator.java` | Retrieves the list of runnable connectors. |
| `ConnectorOrchestrator.runOne(String connectorName, Long projectId)` | `.../ConnectorOrchestrator.java` | Existing manual run lifecycle. |
| `AdminController.connectors()` | `.../AdminController.java` | GET connector list. |
| `AdminController.runConnector(...)` | `.../AdminController.java` | POST trigger connector run. |
| `AdminController.runHistory(...)` | `.../AdminController.java` | GET run history. |
| `endpoints.availableConnectors()` | `EDCAP_FE/src/lib/api.ts` | Client/manual test calls the connector list. |
| `endpoints.runConnector(name, projectId)` | `EDCAP_FE/src/lib/api.ts` | Client/manual test triggers a run. |
| `endpoints.connectorRuns(name, limit)` | `EDCAP_FE/src/lib/api.ts` | Client/manual test retrieves run history. |
| `GitLocalConnector.sync(Long projectId)` | `.../GitLocalConnector.java` | Use only as an As-Is reference; do not directly reuse legacy parse/save logic. |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| Legacy `ArtifactRepositoryAdapter` / `ArtifactMapper` | Tied to legacy tables; not compliant with V4-only requirements. | Create a new adapter/mapper for V4 tables. |
| Current `GitLocalConnector.upsertArtifact(...)` | Mixes scanner + parser + AC sync + legacy persistence. | Separate the new logic into an Artifact Scanner service / V4 adapter. |
| Dedicated scanner endpoint for Artifact Scanner currently | Does not exist yet. | Create a new endpoint or extend an admin/data-ops endpoint according to the spec-pack. |
| Method to query current inventory in the current source | Does not exist yet. | Create the `vw_artifact_inventory_current` view + API to read the view. |
| Parse handoff orchestration method for the new scanner | Does not exist yet. | Create it in a later phase; Phase 2 only finalizes context/rules/skeleton. |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| API / manual test entrypoint | Artifact Scan Result (to be added) | Expected `EDCAP_FE/src/pages/...` or client test subview | Only for testing/operation; the exact placement should be finalized based on the existing route if truly needed. |
| API helper | artifact scanner endpoints (to be added) | `EDCAP_FE/src/lib/api.ts` | Add typed helpers to run scan, get run detail, and get artifact result/current inventory. |
| BE Controller | Artifact Scanner controller (to be added or extend Admin) | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/...` | Should follow the Admin/Data Ops pattern. |
| BE Use case | Artifact scanner orchestration (to be added) | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/...` | Orchestrates full/ticket-scoped runs and writes connector runs/snapshots. |
| BE Port/Adapter | V4 snapshot persistence (to be added) | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/...` | Do not use the legacy adapter. |
| DB Table | `tbl_dim_repository` | V4 | Repo scan scope. |
| DB Table | `tbl_dim_ticket` | V4 | Maps `ticket_id` from the path. Unknown ticket => auto-create a minimal ticket. |
| DB Table | `tbl_dim_phase` | V4 | Maps phase for artifact type. |
| DB Table | `tbl_dim_artifact_type` | V4 | Maps file name -> artifact type and required_flag. Phase0 artifact types use the fixed file set. |
| DB Table | `tbl_source_connector` | V4 | Requires seeding a connector row for the Artifact Scanner. |
| DB Table | `tbl_connector_run` | V4 | Stores the scanner run lifecycle. |
| DB Table | `tbl_fact_artifact_snapshot` | V4 | Main table for writing scan snapshots. Need to add `size_bytes`, `scan_status`, `scan_message`, and `need_parse`. |
| DB View | `vw_artifact_inventory_current` | to be added in migration | Read model for retrieving the latest snapshot for the API/manual test and parser queue. |
| DB Not in scope | `tbl_fact_artifact_parsed_section` | V4 | Belongs to the parser and is not written directly by the scanner. |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| Scan Mode | `FULL`, `TICKET_SCOPED` | ticket decisions | MVP v1 does not prioritize `CHANGED_FILES_SCOPED`. |
| Trigger Type | `MANUAL`, `BATCH`, `WEBHOOK` | requirement/spec-pack | The API/manual test currently uses `MANUAL`. |
| Scan Status | `FOUND`, `MISSING`, `INACCESSIBLE`, `ERROR`, `SKIPPED` (candidate set) | spec-pack | Must finalize enum/constant values and avoid hard-coding them across client/BE layers. |
| Need Parse | `true/false` | spec-pack | Handoff flag for the parser. |
| Artifact Type Code | `SPEC_PACK`, `IMPL_PLAN`, `REVIEW_CHECKLIST`, `SELF_REVIEW`, `TEST_PLAN`, `TEST_RESULTS`, `REPORT`, `BLACKBOX_TESTCASES`, phase0 codes | `tbl_dim_artifact_type` | Must use the master table; do not use a fixed magic filename map across multiple layers. |
| Required Artifact | `required_flag=true` | `tbl_dim_artifact_type` | This ticket has finalized 8 required scanner targets for the MVP. |
| Unknown ticket policy | `SKIP_WARNING` (conceptual) | ticket decisions | Do not create placeholder tickets. |
| `formItemNm` | no existing standard scanner item found | source inspection | If a form schema is needed for manual testing, use simple field names: `repositoryId`, `branchOrRef`, `scanMode`, `ticketIds`. |
| `SEQNO` | not applicable | source inspection | The scanner uses UUID/PK from V4 and has no separate business SEQNO. |
| Master Data | Artifact type / phase / connector | V4 dims | These are the scanner's main master data. |

## Multilingual Note

- The client currently supports `en`, `vi`, and `ja` in `EDCAP_FE/src/App.tsx` and `src/i18n.ts`; if test labels/messages are added, they should use i18n keys.
- Do not hard-code Vietnamese/English/Japanese text in components.
- Business errors from the BE should return stable message keys; the client/manual test can translate them through the existing helper in `api.ts`.
- The scanner is mainly an internal operation feature, but key naming must still remain consistent so that adding Japanese/English later does not break anything.

## Encoding / Mojibake Note

- Markdown, SQL migration, locale JSON, and Java source must remain UTF-8.
- Artifact paths may contain standard English; avoid inserting full-width slashes/spaces in rule/path examples.
- When displaying file/path names on the client, preserve the original source encoding and do not normalize paths incorrectly.
- Do not copy/paste from documents that may contain full-width punctuation into enum/code values.

## Log / Audit / Operation Note

- The scanner must record the run lifecycle through `tbl_connector_run`.
- Do not log secrets, tokens, raw file content, or unnecessary data.
- `unknown ticket` must log a warning with enough information for Data Ops/dev to handle, but must not fail the entire run.
- The API/manual test must show at minimum: run status, summary, artifact result, and scan message.
- `phase0` in this ticket is metadata-only; it does not write parsed content.

## Ticket-Specific Constraints

| constraint | detail |
|---|---|
| V4-only | Use only the tables created in `V4__init_shema_v2.sql`. |
| Scanner boundary | The scanner only performs inventory metadata; it does not parse Markdown. |
| Parser handoff | The parser reads the original file from the repo using scanner metadata; the scanner does not store full Markdown content. |
| Required files | The scanner must ensure inventory for 8 files: `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `report.md`, `blackbox-testcases.md`. |
| Phase0 scope | The fixed file set in `docs/maintenance/phase0/` only scans basic metadata. |
| Unknown ticket | `auto-create minimal ticket`. |
| Current inventory | Use the `vw_artifact_inventory_current` view; do not create a new inventory table. |
| Test placement | Manual test view if a UI is needed for manual verification. |
| MVP v1 modes | `FULL`, `TICKET_SCOPED`; `CHANGED_FILES_SCOPED` is not prioritized yet. |