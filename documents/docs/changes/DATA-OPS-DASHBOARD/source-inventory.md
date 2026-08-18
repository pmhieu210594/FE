# Source Inventory

**Ticket ID**: DATA-OPS-DASHBOARD
**Create date**: 2026-07-02
**Author**: Claude
**Update date**: 2026-07-02

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Spec Pack | `docs/changes/DATA-OPS-DASHBOARD/spec-pack.md` | Markdown | Internal | Read – full | AC / scope / BR |
| Context | `docs/changes/DATA-OPS-DASHBOARD/context.md` | Markdown | Internal | Read – full | Allowed/forbidden components, table mapping |
| Ticket Rules | `docs/changes/DATA-OPS-DASHBOARD/ticket-rules.md` | Markdown | Internal | Read – full | Must/must-not, stop conditions |
| Reference Impl – Dev Dashboard Controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/DevDashboardController.java` | Java | Internal | Read | REST pattern, `/api/v1/dev/dashboard` prefix |
| Reference Impl – Dev Dashboard Service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/devdashboard/DevDashboardService.java` | Java | Internal | Read (partial – signature/pattern) | Aggregation, `@Transactional(readOnly=true)` |
| Reference Impl – Dev Dashboard Repository Port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/DevDashboardRepositoryPort.java` | Java | Internal | Read (partial) | Port interface pattern |
| Reference Impl – Dev Dashboard JDBC Adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/DevDashboardJdbcAdapter.java` | Java | Internal | Read (partial – SQL grep) | Live aggregation over V4 fact/dim tables, NamedParameterJdbcTemplate, no snapshot table |
| Reference Impl – Dev Dashboard DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/DevDashboardDtos.java` | Java | Internal | Not yet read | Response DTO pattern |
| Reference Impl – PM Dashboard (alt. pattern, uses snapshot) | `EDCAP_BE/src/main/java/com/sdd/platform/**/pmdashboard/*`, `PmDashboardJdbcAdapter.java` | Java | Internal | Read (partial) | Reads `tbl_fact_ticket_dashboard_snapshot` (materialized via Flyway) — **not** the pattern to follow (requires migration) |
| Reference Impl – QA Dashboard | `EDCAP_BE/src/main/java/com/sdd/platform/**/qadashboard/*`, `QaDashboardJdbcAdapter.java` | Java | Internal | Not yet read | Secondary reference |
| Reference Impl – Dev Dashboard Page (FE) | `EDCAP_FE/src/pages/development-dashboard/DevelopmentDashboardPage.tsx` | TSX | Internal | Read (partial) | Page composition, useQuery usage |
| Reference Impl – Dev Dashboard components (FE) | `EDCAP_FE/src/pages/development-dashboard/components/{DevSummaryCards,DevFilterBar,DevTicketTable,CiFailureChart}.tsx` | TSX | Internal | Not yet read | KPI cards / filter / table pattern |
| Reference Impl – API helper (FE) | `EDCAP_FE/src/lib/api.ts` (`endpoints.devDashboard` / `endpoints.pmDashboard`) | TS | Internal | Read (partial) | Central API endpoint registry |
| Reference Impl – Dashboard shared components (FE) | `EDCAP_FE/src/components/dashboard/{RoleTabs,DashboardFilterPill,SummaryCard}.tsx` | TSX | Internal | Not yet read | Shared dashboard shell — tab registration point |
| Reference Impl – Route registration (FE) | `EDCAP_FE/src/components/Layout.tsx` | TSX | Internal | Not yet read | Where dashboard routes/tabs are wired |
| V4 Database Schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | SQL | Internal | Read (grep – table+column names) | Confirmed: `tbl_connector_run`, `tbl_fact_data_quality`, `tbl_fact_artifact_snapshot`, `tbl_fact_traceability_link`, `tbl_dim_repository`, `tbl_dim_project` all exist |
| Existing BE Test pattern | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/qadashboard/QaDashboardServiceTest.java`, `EDCAP_BE/src/test/UnitTest/java/.../pmdashboard/PmDashboardServiceTest.java` | Java | Internal | Not yet read | Two different test source roots in use — confirm which applies before adding new test |
| Existing FE Test pattern | `EDCAP_FE/src/__ tests __/dev-dashboard/*.test.tsx`, `EDCAP_FE/src/__ tests __/qa-dashboard/*.test.tsx` | TSX | Internal | Not yet read | Vitest + Testing Library pattern |
| Architecture – FE/BE contract | `docs/architecture/fe-be-contract-map.md` | Markdown | Internal | Not yet read | Verify before finalizing endpoint contract |
| Architecture – Route/API map | `docs/architecture/route-api-map.md` | Markdown | Internal | Not yet read | Verify endpoint prefix does not collide |
| Architecture – Repository/DB map | `docs/architecture/repository-db-map.md` | Markdown | Internal | Not yet read | Verify repository layering conventions |
| Standards | `docs/standards/{backend,frontend,api-contract,testing,security,error-handling,logging}.md` | Markdown | Internal | Not yet read | Apply during implementation, not required to fully read for planning |

---

## Important Files

Files that must be confirmed before implementation.

| priority | file | reason |
|---|---|---|
| P0 | `DevDashboardJdbcAdapter.java` (full read) | Confirms live-aggregation SQL pattern to copy — this is the chosen precedent (no snapshot table) |
| P0 | `DevDashboardController.java` / `DevDashboardService.java` (full read) | Confirms layering, transaction boundary, filter validation pattern |
| P0 | `V4__init_shema_v2.sql` (targeted section read) | Exact column names for the 6 reused tables — already grep-confirmed, re-verify at implementation time for drift |
| P0 | `RoleTabs.tsx` / `Layout.tsx` | Confirms how a new dashboard tab/route is registered on FE |
| P1 | `DevDashboardDtos.java`, `PmDashboardDtos.java` | Existing DTO/response shape convention |
| P1 | `lib/api.ts` | Existing `endpoints.*Dashboard` convention to extend |
| P1 | `docs/architecture/route-api-map.md`, `fe-be-contract-map.md` | Confirm endpoint prefix `/api/v1/dataops/dashboard` does not collide with an existing route |
| P1 | `QaDashboardServiceTest.java` vs `PmDashboardServiceTest.java` test-root split | Confirm correct test source root (`src/test/java` vs `src/test/UnitTest/java`) before adding new tests |

---

## Generated / Excluded Files

| path | reason |
|---|---|
| `.env` | Secret |
| `target/` | Generated |
| `dist/` | Generated |
| `node_modules/` | Dependency |
| Build output | Generated |
| Runtime log | Runtime only |

---

## Missing Files

Files expected to be created during implementation (none exist yet — confirmed by absence of `DataOps` matches in `EDCAP_BE/src` and `EDCAP_FE/src`).

| file | layer | note |
|---|---|---|
| `DataOpsDashboardController.java` | BE | REST Controller, proposed prefix `/api/v1/dataops/dashboard` |
| `DataOpsDashboardService.java` | BE | Aggregation, `@Transactional(readOnly=true)` |
| `DataOpsDashboardRepositoryPort.java` | BE | Port interface |
| `DataOpsDashboardJdbcAdapter.java` | BE | Live read-only aggregation over the 6 existing V4 tables |
| `DataOpsDashboardDtos.java` | BE | Response DTOs |
| `DataOpsDashboardPage.tsx` | FE | Dashboard page under `pages/data-ops-dashboard/` |
| `DataOpsSummaryCards.tsx`, `DataOpsFilterBar.tsx`, `DataOpsConnectorTable.tsx`, `ConnectorDetailDrawer.tsx` | FE | Following Dev/QA dashboard component split |
| `endpoints.dataOpsDashboard` entry | FE | Added to `lib/api.ts` |
| BE/FE test files | BE/FE | Following existing per-dashboard test folder pattern |
