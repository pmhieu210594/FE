# Implementation Plan

**Ticket ID**: ARTIFACT-SCANNER   
**Create date**: 2026-06-16 
**Author**: nk_trung   
**Update date**: 2026-06-16 

## 1. Implementation Principle

- Implement Artifact Scanner as a backend metadata inventory component independent from the parser.
- Use only the tables belonging to `V4__init_shema_v2.sql`.
- Do not directly reuse legacy logic that mixes scanner + parser + legacy persistence.
- All scanner output must be sufficient for the parser to reread the original file from repo/path/ref in a later phase.
- Client/manual test should only provide a minimal test/operation view if truly needed.
- Scanner in MVP v1 only supports `FULL` and `TICKET_SCOPED`.

## 2. Alternative Plan
| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Reuse the existing `GitLocalConnector` and gradually patch it | Seems fast at first | Mixed boundaries, deviates from V4-only, pulls parser into scanner | Reject |
| B | Create a new scanner but still write to legacy tables | Requires fewer changes to old code | Incorrect according to documentation and the V4-only decision | Reject |
| C | Create a new scanner based on V4, using run/snapshot/view, and add minimal API/manual test | Clean boundary, matches spec, easy to extend | Requires new migration and adapter | Accept |

## 3. Reason for Choosing the Alternative Plan

Option C is the only option that satisfies all of the following:
- correct scanner boundary
- V4-only schema
- current inventory through a view
- correct metadata-first parser handoff principle
- unknown ticket auto-create minimal ticket so the scan can continue
- feasible API/manual test without expanding the scope

## 4. Expected Change File
| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` and `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | add phase0 seed, snapshot columns, current inventory view | satisfy the finalized DB design | AC-ARTIFACT-SCANNER-03, AC-ARTIFACT-SCANNER-06, AC-ARTIFACT-SCANNER-07, AC-ARTIFACT-SCANNER-08 |
| `EDCAP_BE/.../ArtifactScannerService.*` | artifact scan service/use case | core scanner logic | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-02, AC-ARTIFACT-SCANNER-03, AC-ARTIFACT-SCANNER-04 |
| `EDCAP_BE/.../ArtifactSnapshotRepository*` | V4 persistence for run/snapshot/view | V4-only persistence | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-09 |
| `EDCAP_BE/.../ArtifactScannerController*` or extended controller | API for run/result/current inventory | needed for manual test | AC-ARTIFACT-SCANNER-011 |
| `EDCAP_FE/src/lib/api.ts` | typed endpoints for scanner | follows existing client pattern | AC-ARTIFACT-SCANNER-011 |
| `EDCAP_FE/src/pages/...ArtifactScanResult*.tsx` | scanner test view | manual test | AC-ARTIFACT-SCANNER-011 |
| `EDCAP_FE/src/router.tsx` / `Layout.tsx` | route/menu placement if needed | expose test view | AC-ARTIFACT-SCANNER-011 |

## 5. Class / Function / Method to Add or Modify
| target | action | input | output | note |
|---|---|---|---|---|
| `ArtifactScannerService` | add | repository, ref, mode, ticketIds | scan summary + artifact snapshots | core business logic |
| `ArtifactScannerSourceAdapter` | add | repository/ref/path scope | file metadata/content hash | source reading only |
| `ArtifactSnapshotRepositoryPort` | add | snapshot/current inventory request | persisted/read model data | V4-only port |
| `ArtifactSnapshotRepositoryAdapter` | add | V4 queries | DB results | do not use legacy mapper |
| `ArtifactScannerController` or extended controller | add/modify | REST request | DTO response | API for manual test |
| client scanner endpoint helpers | modify | request params | typed response | no ad-hoc fetch |
| `ArtifactScanResult` page/component | add | run/result/current inventory | rendered UI | Data Ops placement if needed |

## 6. SQL / Query / Repository Policy

- Write each scan lifecycle to `tbl_connector_run`.
- Write artifact scan results to `tbl_fact_artifact_snapshot`.
- Look up artifact type and required flag through `tbl_dim_artifact_type`.
- Look up ticket through `tbl_dim_ticket`; if the ticket is not found, auto-create a minimal ticket.
- Look up repository through `tbl_dim_repository`.
- Read current inventory through `vw_artifact_inventory_current`.
- Do not create a new physical inventory table.
- Do not use legacy tables as the main read/write target.

## 7. Validation / Error / Logging Policy

- Validate that the repository exists before scanning.
- Validate that `branch_or_ref` is not empty.
- Validate that `scan_mode` is only `FULL` or `TICKET_SCOPED` in MVP v1.
- For `TICKET_SCOPED`, `ticket_ids` must be provided.
- Unknown ticket path: auto-create a minimal ticket; do not fail the entire run.
- Local file read error: set `scan_status` and `scan_message`; the run may be partial.
- Do not log raw Markdown content.
- Minimum logs include `connector_run_id`, `trace_id`, repository, mode, source_path, ticket mapping result, and scan status.

## 8. Migration / Rollback Policy

- Migration only touches the V4 path.
- Add columns to `tbl_fact_artifact_snapshot`:
  - `size_bytes`
  - `scan_status`
  - `scan_message`
  - `need_parse`
- Seed additional phase0 artifact types.
- Create `vw_artifact_inventory_current`.
- Rollback should follow migration rollback or forward-fix; do not create a separate business rollback mechanism for the scanner.

## 9. Step Implementation
| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Create V4 migration to add columns/seed/view | migration sql | migration applies successfully | schema conflict |
| 2 | Create persistence port/adapter for V4 run/snapshot/view | BE persistence | query/integration passes | query does not map correctly to V4 |
| 3 | Create scanner source adapter and core service | BE service/usecase | full scan and ticket-scoped scan can run | boundary gets mixed with parser |
| 4 | Create API for run/result/current inventory | BE controller/dto | API tested by manual call | contract is not stable |
| 5 | Create client endpoint helpers | `EDCAP_FE/src/lib/api.ts` | typed call OK | API shape changes significantly |
| 6 | Create `Artifact Scan Result` test view | page/router/layout | can render run summary + artifact table | route/menu placement is unclear |
| 7 | Add unit/integration/manual verification tests | test files/docs | main cases pass | AC coverage is insufficient |
| 8 | Update self-review/test-results/report after implementation | ticket docs files | evidence is complete | missing test results |

## 10. How to Verify Each Step

### Step 1
- Run migration locally/dev.
- Check that the new snapshot columns exist.
- Check that phase0 artifact types were seeded.
- Check that `vw_artifact_inventory_current` can be queried.

### Step 2
- Check that writing to `tbl_connector_run` succeeds.
- Check that writing to `tbl_fact_artifact_snapshot` succeeds.
- Check that reading current inventory from the view returns the correct latest snapshot.

### Step 3
- Run a `FULL` scan with a repo that has all 8 required files.
- Run a `TICKET_SCOPED` scan with one specific ticket.
- Change the content of one file and scan again to see `need_parse = true`.
- Check that unknown tickets are auto-created as minimal tickets.
- Check that phase0 only scans metadata and does not parse content.

### Step 4
- Verify that the API response contains sufficient run summary and artifact result data.
- Verify that scan status/message are returned correctly to the client/manual test.

### Step 5
- Verify that the client endpoint helper compiles and calls the typed API correctly.

### Step 6
- Verify that the test view can run a scan.
- Verify that the run summary can be viewed.
- Verify that the artifact result table can be viewed.
- Verify that missing required artifacts and `need_parse` are displayed.

### Step 7
- Verify that unit/integration/manual cases map to all ACs.

## 11. Corresponding AC Table
| AC ID | implementation point | verification |
|---|---|---|
| AC ID | AC content | Verification method |
|---|---|---|
| AC-ARTIFACT-SCANNER-01 | Scanner can scan artifact files under `docs/changes/<TICKET>/` for the target repository | sample ticket scan |
| AC-ARTIFACT-SCANNER-02 | Scanner can identify `ticket_id` from the path structure `docs/changes/<TICKET>/` | valid ticket scan / invalid path |
| AC-ARTIFACT-SCANNER-03 | Scanner can identify `artifact_type` from filename/path according to artifact type configuration | filename mapping test |
| AC-ARTIFACT-SCANNER-04 | Scanner reflects whether required artifacts exist or are missing per ticket | missing required artifact test |
| AC-ARTIFACT-SCANNER-05 | Scanner stores minimum artifact metadata including path, hash, size, updated time, scan status, and scan message | DB query / API response assertion |
| AC-ARTIFACT-SCANNER-06 | Scanner detects new or changed artifacts based on `content_hash` | repeated scan test |
| AC-ARTIFACT-SCANNER-07 | Scanner marks `need_parse = true` for new artifacts or artifacts whose `content_hash` changed | parser handoff assertion |
| AC-ARTIFACT-SCANNER-08 | Scanner can scan basic metadata for the fixed file set under `docs/maintenance/phase0/` | phase0 sample scan |
| AC-ARTIFACT-SCANNER-09 | Scanner writes a run log for each execution into the V4 connector run mechanism | integration / DB query |
| AC-ARTIFACT-SCANNER-010 | Parser does not need full content stored by the scanner in DB; it can reread the original file from the repo using scanner metadata | design + integration verification |
| AC-ARTIFACT-SCANNER-011 | Scan summary and artifact result can be viewed from API or manual test view for review/operation | manual API verification |

## 12. Stop / Ask Condition

- Stop if the V4 migration conflicts with a newer migration on the actual branch.
- Stop if the actual source package/route differs significantly from the existing context.
- Stop if test view placement is not feasible in the current route/menu and a new test view decision is needed.
- Stop if the implementation shows signs of pulling parser logic into the scanner.
- Stop if `CHANGED_FILES_SCOPED` becomes mandatory for MVP v1.

## 13. Do Not Do This Ticket

- Do not parse Markdown sections in the scanner.
- Do not sync AC in the scanner.
- Do not collect Git/PR/CI metadata in the scanner.
- Do not scan `.claude/*` in this ticket.
- Do not use legacy tables/mappers as the baseline for the new design.
- Do not store full Markdown content in the scanner DB.
- Do not create a new physical inventory table.
- Do not include `CHANGED_FILES_SCOPED` in MVP v1.

## 14. Open Related Issues

- The final package/class/controller names need to follow the actual naming convention after checking the code.
- The final route/menu of the client test view may need slight adjustment if the current state only has the Admin page.