# Implementation Plan

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02 (refined by Claude — concrete paths + Developer Dashboard precedent)

## 1. Implementation Principle

- Reuse the existing Dashboard implementation pattern — specifically **Developer Dashboard**
  (`DevDashboardController` / `DevDashboardService` / `DevDashboardRepositoryPort` /
  `DevDashboardJdbcAdapter`), which performs live JDBC aggregation over V4 fact/dim tables
  with no snapshot table and no migration. **Do not** copy PM Dashboard's pattern, which reads
  from `tbl_fact_ticket_dashboard_snapshot`, a materialized table created via Flyway migration —
  incompatible with this ticket's "no migration / no new persistence" constraint.
- Dashboard is strictly read-only.
- Aggregate existing Connector, Parser and Traceability metadata.
- Reuse existing V4 database tables.
- No duplicated persistence.
- No migration.
- No Connector execution.
- No Parser execution.
- Existing Dashboard UI components should be reused whenever possible (Dev/QA Dashboard FE
  component split: SummaryCards / FilterBar / Table / DetailDrawer).
- Security Alerts and Cost Summary KPIs (spec-pack scope 2.1) have no defined data source in
  spec-pack Output (6.3) / AC (7). These 2 KPIs are implemented in a later, separate step gated
  by Human Decision (H-DATAOPS-3, H-DATAOPS-4) — not part of the initial 5-KPI delivery.

---

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Aggregate metadata in Service layer using existing V4 tables | Reuses existing architecture, no duplicated persistence | Aggregation logic required | **Selected** |
| B | Create DataOps dashboard snapshot tables | Faster dashboard query | Additional persistence, migration required | Rejected |
| C | Query Connector and Parser modules directly from FE | Simpler FE implementation | Tight coupling, inconsistent architecture | Rejected |

---

## 3. Reason for Choosing the Alternative Plan

The Data Ops Dashboard is an operational dashboard.

All required metadata already exists in Connector, Parser and Traceability modules.

Reusing existing metadata avoids duplicated persistence and keeps the architecture aligned with the metadata-first design.

---

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/DataOpsDashboardController.java` | Dashboard REST API, prefix `/api/v1/dataops/dashboard` (verify no collision in `docs/architecture/route-api-map.md` before finalizing) | Dashboard endpoints | AC-DATAOPS-1 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/dataopsdashboard/DataOpsDashboardService.java` | Dashboard aggregation, `@Transactional(readOnly=true)` | Business logic | AC-DATAOPS-2~10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/DataOpsDashboardRepositoryPort.java` | Port interface | Read-only contract | AC-DATAOPS-9 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/DataOpsDashboardJdbcAdapter.java` | Live JDBC aggregation over the 6 existing V4 tables — follow `DevDashboardJdbcAdapter.java`, **not** `PmDashboardJdbcAdapter.java` | Read-only | AC-DATAOPS-9 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/DataOpsDashboardDtos.java` | Dashboard DTO | REST response | All |
| `EDCAP_FE/src/pages/data-ops-dashboard/DataOpsDashboardPage.tsx` | Dashboard UI | FE implementation | All |
| `EDCAP_FE/src/pages/data-ops-dashboard/components/{SummaryCards,FilterBar,ConnectorTable,ConnectorDetailDrawer}.tsx` | FE components, following Dev/QA Dashboard split | FE implementation | AC-DATAOPS-2~8 |
| `EDCAP_FE/src/lib/api.ts` | Add `endpoints.dataOpsDashboard` | Existing API integration | All |
| `EDCAP_FE/src/components/dashboard/RoleTabs.tsx` | Add Data Ops tab | Dashboard navigation | AC-DATAOPS-1 |

---

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| `DataOpsDashboardController` | Add | Filter | Dashboard DTO | REST, thin controller |
| `DataOpsDashboardService` | Add | Filter | Dashboard Model | Aggregation logic, filter validation |
| `DataOpsDashboardRepositoryPort` / `DataOpsDashboardJdbcAdapter` | Add | Filter | Existing metadata rows | Read-only, `NamedParameterJdbcTemplate`, no MyBatis XML |
| `DataOpsDashboardDtos` (mapper method) | Add | Domain model | DTO | Mapping, done in Service per `10-style.md` |
| `DataOpsDashboardPage` | Add | API response | UI | FE, TanStack Query hooks |

---

## 6. SQL / Query / Repository Policy

- Existing V4 tables only.
- Read-only SQL.
- Existing Repository pattern.
- Parameterized queries.
- Existing indexes reused.
- No duplicated metadata.
- No temporary dashboard tables.

---

## 7. Validation / Error / Logging Policy

- Validate dashboard filter parameters.
- Existing GlobalExceptionHandler reused.
- Existing TraceId reused.
- Existing logging reused.
- Empty metadata returns zero-value KPIs instead of exceptions.
- Existing authentication reused.

---

## 8. Migration / Rollback Policy

- No Flyway migration.
- No schema modification.
- Rollback by removing Dashboard implementation only.
- Existing metadata remains unchanged.

---

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Create Dashboard DTO (5 defined KPIs only: Connector Status, Parse Errors, Missing Evidence, Freshness, Broken Links) | `DataOpsDashboardDtos` | Compile | FE contract unavailable |
| 2 | Create Repository Port + JDBC Adapter, following `DevDashboardJdbcAdapter` pattern | `DataOpsDashboardRepositoryPort`, `DataOpsDashboardJdbcAdapter` | Existing metadata returned for the 6 confirmed V4 tables | Missing/changed schema |
| 3 | Create Service (aggregation + filter validation) | `DataOpsDashboardService` | Unit Test | Repository unavailable |
| 4 | Create REST Controller | `DataOpsDashboardController` | API Test | Service unavailable; endpoint prefix collides with `route-api-map.md` |
| 5 | Create Dashboard Page + components + `endpoints.dataOpsDashboard`, register tab in `RoleTabs.tsx` | FE | UI Test | API unavailable |
| 6 | Integration Testing (steps 1–5, 5-KPI scope) | All | Dashboard complete | Blocking issue |
| 7 | Security Alerts + Cost Summary KPIs — **only after** H-DATAOPS-4 / H-DATAOPS-3 are resolved by PM | DTO/Service/Adapter/FE extension | Unit + UI Test | H-DATAOPS-3 or H-DATAOPS-4 still Open |

---

## 10. How to Verify Each Step

- Project compiles successfully.
- Repository reads existing metadata.
- Dashboard Service aggregates correctly.
- REST API returns expected DTO.
- Dashboard renders correctly.
- KPI cards display correct values.
- Filters work.
- Connector Detail drawer opens.
- Empty-state behaves correctly.

---

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-DATAOPS-1 | Dashboard page | UI Test |
| AC-DATAOPS-2 | Connector Status aggregation | Unit Test |
| AC-DATAOPS-3 | Parser Health aggregation | Unit Test |
| AC-DATAOPS-4 | Missing Evidence aggregation | Unit Test |
| AC-DATAOPS-5 | Freshness calculation | Unit Test |
| AC-DATAOPS-6 | Broken Traceability aggregation | Unit Test |
| AC-DATAOPS-7 | Dashboard filtering | Integration Test |
| AC-DATAOPS-8 | Connector Detail drawer | UI Test |
| AC-DATAOPS-9 | Existing V4 table reuse | Code Review |
| AC-DATAOPS-10 | Read-only behavior | Code Review |

---

## 12. Stop / Ask Condition

- Stop if Connector metadata schema changes.
- Stop if Parser metadata schema changes.
- Stop if Traceability metadata schema changes.
- Stop if existing Dashboard architecture cannot be reused.
- Stop if implementation requires additional persistence.
- Stop if migration becomes necessary.
- Stop if Dashboard API contract conflicts with existing implementations.
- Stop before implementing Security Alerts KPI until H-DATAOPS-4 is resolved.
- Stop before implementing Cost Summary KPI until H-DATAOPS-3 is resolved.
- Stop if endpoint prefix `/api/v1/dataops/dashboard` collides with an existing route in `docs/architecture/route-api-map.md`.
- Ask which BE test source root to use (`src/test/java` vs `src/test/UnitTest/java`) before adding new test classes.

---

## 13. Do Not Do This Ticket

- Do not create new database tables.
- Do not create Flyway migrations.
- Do not duplicate Connector metadata.
- Do not duplicate Parser metadata.
- Do not duplicate Traceability metadata.
- Do not implement Connector execution.
- Do not implement Parser execution.
- Do not implement CRUD.
- Do not implement manual retry.
- Do not implement AI Analytics.
- Do not introduce write operations.

---

## 14. Open Related Issues

| ID | issue | status |
|---|---|---|
| OI-DATAOPS-1 | Freshness threshold | Open |
| OI-DATAOPS-2 | Connector Health calculation | Open |
| OI-DATAOPS-3 | Cost calculation | Open |
| OI-DATAOPS-4 | Export capability | Open |
| OI-DATAOPS-5 | Security Alert calculation | Open |