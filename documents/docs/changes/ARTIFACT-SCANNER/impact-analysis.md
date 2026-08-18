# Impact Analysis

**Ticket ID**: ARTIFACT-SCANNER   
**Create date**: 2026-06-16   
**Author**: nk_trung  
**Update date**: 2026-06-16 

## 1. Change Content

This ticket adds the Artifact Scanner feature with a V4-only and metadata-only approach. The main changes include:

- add a scanner service/use case that is independent from the parser
- add persistence logic to write to `tbl_connector_run` and `tbl_fact_artifact_snapshot`
- add the finalized snapshot columns: `size_bytes`, `scan_status`, `scan_message`, `need_parse`
- seed additional artifact types for the fixed file set in `docs/maintenance/phase0/`
- create a read model as the `vw_artifact_inventory_current` view
- add APIs to run scans and view scan results
- add the ability to test/verify through API or manual queries

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` and `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | add snapshot columns, phase0 seed, current inventory view | modify / add migration |
| `EDCAP_BE/.../ArtifactScannerService.*` | new core scanner logic | add |
| `EDCAP_BE/.../ArtifactSnapshotRepository*` | V4 persistence for snapshot/current inventory | add |
| `EDCAP_BE/.../ArtifactScannerController*` or an extended controller | scanner run/result API | add / modify |
| `docs/changes/ARTIFACT-SCANNER/impl-plan.md` | update according to the actual impact | modify |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | may be referenced or extended for the run history pattern | medium |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/collection/ConnectorOrchestrator*` | may need to register the scanner connector | medium |
| `EDCAP_BE/src/main/resources/mapper/ConnectorRunMapper.xml` | may be affected if the old run history pattern is kept | medium |
| Manual/API test scripts | need to add/update tests for the new endpoint | low |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| Manual/API verification | scanner REST endpoints | direct |
| scanner REST controller | scanner use case/service | direct |
| scanner service | source adapter / repository adapter | direct |
| scanner service | `tbl_dim_repository`, `tbl_dim_ticket`, `tbl_dim_artifact_type` lookup | direct |
| scanner service | `tbl_connector_run` write | direct |
| scanner service | `tbl_fact_artifact_snapshot` write | direct |
| parser orchestration in a later phase | `vw_artifact_inventory_current` or latest snapshot query | indirect |
| dashboards in a later phase | current inventory view | indirect |

## 5. API / Manual Verification Impact

- A minimal API is needed to trigger a scan and read the scan result.
- Verification can be performed using an API client, curl, or manual queries.
- A large analytical dashboard is not required in this ticket.

## 6. BE Impact

- A new core scanner service must be added, without directly reusing `GitLocalConnector` as the main implementation.
- A new V4 adapter/persistence layer is needed for snapshots and the current inventory view.
- A new API layer is needed, or the existing layer must be extended for run/result.
- Clear boundaries must be maintained:
  - the scanner scans metadata
  - the parser parses content
  - other collectors are outside the scope of this ticket

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `POST /api/v1/data-ops/artifact-scans` | new endpoint, accepts repository/ref/mode/ticketIds | returns the run summary and artifacts of the run | yes |
| `GET /api/v1/data-ops/artifact-scans/{runId}` | new endpoint | returns the run summary | yes |
| `GET /api/v1/data-ops/artifact-scans/{runId}/artifacts` | new endpoint | returns artifact snapshots of the run | yes |
| `GET /api/v1/data-ops/artifact-scans/current?repositoryId=...` | new endpoint | returns the latest inventory from the view | yes |

There was no scanner-specific contract before, so most of the changes are additive.

## 8. DTO / Schema / Validation Impact

- A request DTO for running a scan is needed (`repository_id`, `branch_or_ref`, `scan_mode`, `ticket_ids` if any).
- Response DTOs for the run summary and artifact result are needed.
- Main validation:
  - repository exists
  - ref is not empty
  - mode is valid (`FULL`, `TICKET_SCOPED`)
  - `ticket_ids` is required only for `TICKET_SCOPED`
- The scanner does not validate Markdown sections.

## 9. DB / Migration Impact

- Only V4 tables are used.
- phase0 artifact types must be seeded in `tbl_dim_artifact_type`.
- The following fields must be added to `tbl_fact_artifact_snapshot`:
  - `size_bytes`
  - `scan_status`
  - `scan_message`
  - `need_parse`
- `vw_artifact_inventory_current` must be created.
- No new physical inventory table is created.
- Legacy tables are not used as the main write target.

## 10. Batch / Job / Event Impact

- The scanner can be called by a manual UI/API or by a connector-run-style orchestration pattern.
- MVP v1 prioritizes `FULL` and `TICKET_SCOPED`.
- `CHANGED_FILES_SCOPED` is not included in MVP v1.
- There is no requirement for a new event bus in this ticket.

## 11. Test Impact

Tests need to be added/adjusted for:

- full scan with all 8 required files
- missing required artifact
- unknown ticket = auto-create minimal ticket
- phase0 metadata-only scan
- hash changed -> `need_parse = true`
- current inventory view returns the correct latest snapshot
- API/manual verification runs the scan and renders the result correctly

## 12. Operation / Monitoring Impact

- The run id, trace id, repository, mode, ticket scope, and result of each artifact must be logged.
- `scan_status`/`scan_message` help Data Ops debug faster.
- API/manual verification helps confirm scan results without manual DB queries.
- No large new monitoring platform is required in this ticket, but run history and error visibility must be sufficient for use.

## 13. Rollout / Rollback Impact

- Rollout can follow this order: migration -> BE API -> manual verification.
- The BE scanner can still be tested through API/manual verification.
- Rollback is mainly at the level of migration rollback/forward-fix and code revert.
- Because the scanner is an additive function, rollout risk is relatively low if the legacy path is not reused.

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| Markdown content parser | Not directly affected | Ticket rules/spec confirm that the scanner does not parse content |
| Git/PR/CI collector | Not directly affected | Scanner scope excludes collector metadata |
| KPI engine | Not directly affected | Ticket scope does not include KPI |
| Traceability logic | Not directly affected | Ticket scope does not include traceability matching |
| `.claude/*` scanner | Not directly affected | Current ticket scope excludes `.claude/*` |
| `CHANGED_FILES_SCOPED` MVP v1 | Not directly affected | The decision has been made not to prioritize it in MVP v1 |
| Legacy persistence as final target | Not used | V4-only decision |

## 15. Required Options

- There are no major open multiple product options. The finalized approach is V4-only + current inventory view + API/manual verification.
- During implementation, only small technical decisions are needed at the level of specific naming/package/route choices to fit the codebase.

## 16. Human Decision Required

- There are no remaining major business blockers for Phase 3.
- If the actual code route/menu has no suitable slot, it does not affect the BE scope.

## 17. Risk Summary

- The biggest risk is accidentally reusing legacy logic and causing the scanner boundary to drift.
- The second risk is a V4 migration conflict with newer DB changes on the actual branch.
- The risks mainly lie in the API contract, DB, and source scope, not the UI.