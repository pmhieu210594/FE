# Impact Analysis

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26

---

## 1. Change Content

Add a **QA Dashboard** as a new tab in the existing dashboard area of the EDCAP platform.

**BE**: Create a complete new hexagonal stack for QA Dashboard:
- 3 GET endpoints: `/api/v1/qa/dashboard/summary`, `/acceptance-criteria`, `/coverage-trend`
- 1 Controller (thin), 1 DTOs file (3 records), 1 Service (aggregation logic), 1 Models file (domain records), 1 Port interface, 1 JDBC Adapter (`NamedParameterJdbcTemplate`)
- No write operations. No migration. No mapper XML.

**FE**: Wire up pre-built components to real API:
- `QADashboardPage.tsx`: replace `QA_MOCK_DATA` with 3 `useQuery` calls; add loading/error states
- `api.ts`: add `qaDashboard.summary`, `.acceptanceCriteria`, `.coverageTrend`

**DB**: Read-only from existing V4 tables. All SELECT. No INSERT/UPDATE/DELETE.

---

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_FE/src/lib/api.ts` | Add `qaDashboard.*` endpoint helpers following the pmDashboard pattern | Modify |
| `EDCAP_FE/src/pages/qa-dashboard/QADashboardPage.tsx` | Replace `QA_MOCK_DATA` with 3 `useQuery` calls; add loading/error states | Modify |
| `web/rest/QaDashboardController.java` | New — 3 GET endpoints; thin; constructor injection; no role guard | Create |
| `web/dto/QaDashboardDtos.java` | New — 3 Java record DTOs; `static from(model)` mapper; field names match FE types.ts | Create |
| `application/usecase/qadashboard/QaDashboardService.java` | New — aggregation logic BR-2, BR-3, BR-4; `@Transactional(readOnly=true)` | Create |
| `application/usecase/qadashboard/QaDashboardModels.java` | New — domain record types (filter, summary, AC row, trend point) | Create |
| `application/port/out/persistence/QaDashboardRepositoryPort.java` | New — port interface; all read-only methods | Create |
| `infrastructure/persistence/adapter/QaDashboardJdbcAdapter.java` | New — implements port; `NamedParameterJdbcTemplate`; named params `:paramName`; SELECT only | Create |

---

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `ArchitectureTest.java` / `LayerEnforcementTest.java` | New classes must comply with hexagonal rules; ArchUnit will verify | Low — must run and confirm green after each step |
| Spring SecurityConfig | No change needed — all authenticated users = access; Spring Security standard 401 for unauthenticated | None |
| `RoleTabs.tsx` | Already includes qa-dashboard route; no change needed | None |
| `DashboardSearchHeader.tsx` | Export/Refresh button already wired (inert); no change needed for PoC | None |
| `GlobalExceptionHandler.java` | Handles exceptions from QaDashboardController — no change to handler; only relies on existing behavior | None |
| `TraceIdFilter.java` | Automatically covers `/api/v1/qa/dashboard/**` via existing `/api/**` pattern | None |

---

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| Browser / QADashboardPage.tsx | `api.ts → qaDashboard.summary()` | GET /api/v1/qa/dashboard/summary |
| Browser / QADashboardPage.tsx | `api.ts → qaDashboard.acceptanceCriteria()` | GET /api/v1/qa/dashboard/acceptance-criteria |
| Browser / QADashboardPage.tsx | `api.ts → qaDashboard.coverageTrend()` | GET /api/v1/qa/dashboard/coverage-trend |
| `QaDashboardController.summary` | `QaDashboardService.getSummary` | aggregate BR-2, BR-3, defect leakage |
| `QaDashboardController.acceptanceCriteria` | `QaDashboardService.getAcceptanceCriteria` | AC rows per ticket |
| `QaDashboardController.coverageTrend` | `QaDashboardService.getCoverageTrend` | period-grouped AC coverage |
| `QaDashboardService` | `QaDashboardRepositoryPort` | port interface calls |
| `QaDashboardJdbcAdapter` | `NamedParameterJdbcTemplate` → PostgreSQL V4 tables | SELECT only |
| `QaDashboardJdbcAdapter` | `tbl_fact_ac_test_coverage` | AC coverage counts |
| `QaDashboardJdbcAdapter` | `tbl_fact_test_run` | PASS/FAIL counts |
| `QaDashboardJdbcAdapter` | `tbl_fact_finding` | defect leakage count |
| `QaDashboardJdbcAdapter` | `tbl_fact_artifact_parsed_section` | blackbox viewpoints |
| `QaDashboardJdbcAdapter` | `tbl_dim_ticket` | ticket filter; started_at for periodKey |
| `QaDashboardJdbcAdapter` | `tbl_dim_project`, `tbl_dim_repository` | filter join |

---

## 5. FE Impact

**Changes:**
- `QADashboardPage.tsx`: Replace `QA_MOCK_DATA` with 3 independent `useQuery` calls (summary, acceptanceCriteria, coverageTrend). Add loading and error state for each. Filters state already exists — only need to pass into `queryKey` to trigger refetch.
- `api.ts`: Add `qaDashboard` object with 3 methods (`summary`, `acceptanceCriteria`, `coverageTrend`) following the exact `pmDashboard.*` pattern (URLSearchParams; optional params; `api.get<T>`).

**No changes to:**
- `QaSummaryCards.tsx`, `QaFilterBar.tsx`, `AcceptanceCriteriaTable.tsx`, `CoverageTrendChart.tsx` — already built; receive typed props; no changes needed.
- `RoleTabs.tsx` — already includes `qa-dashboard` route; no changes.
- `types.ts` — authoritative FE types; no changes; BE DTO must match.
- Route registration — already exists; no new routes needed.
- i18n keys — already in locale files; no additions.

---

## 6. BE Impact

**New classes/packages:**
- New package: `application/usecase/qadashboard/` (QaDashboardService, QaDashboardModels)
- New port: `application/port/out/persistence/QaDashboardRepositoryPort`
- New adapter: `infrastructure/persistence/adapter/QaDashboardJdbcAdapter` — JDBC, not MyBatis
- New controller: `web/rest/QaDashboardController`
- New DTOs: `web/dto/QaDashboardDtos`

**Key characteristics:**
- No role guard in service (unlike PM Dashboard `requirePm()`) — all authenticated = access
- `@Transactional(readOnly = true)` on all service methods
- Constructor injection; no `@Autowired`
- Adapter uses `NamedParameterJdbcTemplate` with named params `:paramName` and `MapSqlParameterSource`
- `acceptanceReadyCount` hardcoded `0` for PoC (H-QA-DASHBOARD-4 deferred)
- Blackbox denominator = 8 (named constant)
- All numeric fields default to `0` when no data

**No changes to:**
- Existing controllers, services, ports, adapters — not touched
- `AppUser.Role` enum — no new values added

---

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `GET /api/v1/qa/dashboard/summary` | New — query params: `projectId`, `repositoryId`, `periodKey`, `search` (all optional) | `QaDashboardSummaryDto` — 7 fields matching `QaSummary` FE type | N/A (new endpoint) |
| `GET /api/v1/qa/dashboard/acceptance-criteria` | New — same query params | `List<AcceptanceCriteriaRowDto>` — 5 fields matching `AcceptanceCriteriaRow` FE type | N/A (new endpoint) |
| `GET /api/v1/qa/dashboard/coverage-trend` | New — same query params | `List<AcCoverageTrendPointDto>` — 2 fields matching `AcCoverageTrendPoint` FE type | N/A (new endpoint) |
| All existing endpoints | No change | No change | ✅ Not affected |

**Auth behavior on new endpoints:**
- Unauthenticated → 401 (Spring Security standard)
- Authenticated (any role) → 200
- No 403 for QA Dashboard (unlike PM Dashboard)

---

## 8. DTO / Schema / Validation Impact

**New DTOs** (`web/dto/QaDashboardDtos.java`):

| DTO record | fields | must match FE type |
|---|---|---|
| `QaDashboardSummaryDto` | `acTestCoveragePercent` (double), `acNotTestedCount` (int), `blackboxCoveragePercent` (double), `testResultsPassPercent` (double), `defectLeakageCount` (int), `acceptanceReadyCount` (int = 0), `updatedAt` (OffsetDateTime) | `QaSummary` in types.ts ✅ |
| `AcceptanceCriteriaRowDto` | `acId` (String), `ticketKey` (String), `status` (String: PASSED/PARTIAL/NOT_TESTED), `blackbox` (String: Yes/No/Partial), `gap` (String) | `AcceptanceCriteriaRow` in types.ts ✅ |
| `AcCoverageTrendPointDto` | `label` (String), `coveragePercent` (double) | `AcCoverageTrendPoint` in types.ts ✅ |

**Server-side validation (service layer):**
- `projectId` / `repositoryId`: UUID format validation if non-empty
- `search`: trim; reject or truncate if > 200 chars
- `periodKey`: format pattern `\d{4}-W\d{1,2}` if non-empty

**No DTO changes:**
- Existing `OrganizationDtos.java`, `PmDashboardDtos.java` and all other DTOs — not touched

---

## 9. DB / Migration Impact

**Migration: Not required.** No new tables, no ALTER TABLE, no Flyway migration.

**V4 tables read (SELECT only) — all columns confirmed from `V4__init_shema_v2.sql`:**

| table | columns used | query purpose |
|---|---|---|
| `tbl_fact_ac_test_coverage` | `ticket_id`, `ac_key`, `coverage_status` | AC coverage count (COVERED / NOT_TESTED) |
| `tbl_fact_acceptance_criteria` | `ticket_id`, `ac_key`, `ac_summary` | AC rows for acceptance-criteria endpoint |
| `tbl_fact_test_run` | `ticket_id`, `passed_count`, `failed_count`, `skipped_count`, `test_count` | Test results PASS/FAIL/NOT_RUN |
| `tbl_fact_finding` | `ticket_id`, `status` | defectLeakageCount: COUNT WHERE `status != 'RESOLVED'` |
| `tbl_fact_artifact_parsed_section` | `ticket_id`, `section_type`, `section_key`, `present_flag` | Blackbox viewpoints; `section_key` nullable — see Risk §17 |
| `tbl_fact_artifact_snapshot` | `ticket_id`, `artifact_type_id`, `exists_flag` | Artifact existence check for Release Readiness |
| `tbl_dim_ticket` | `ticket_id`, `project_id`, `external_ticket_key`, `title`, `started_at`, `status` | Main join key; filter on project; periodKey → started_at |
| `tbl_dim_project` | `project_id` | Filter join |
| `tbl_dim_repository` | `repository_id` | Filter join |

**Existing indexes (no new indexes needed):**
- `tbl_fact_ac_test_coverage`: index on `(ticket_id, coverage_status)` ✅
- `tbl_dim_ticket`: index on `project_id` ✅
- `tbl_fact_finding`: index on `ticket_id`, `status` ✅

---

## 10. Batch / Job / Event Impact

**Not affected.**

- QA Dashboard is pure read-only; does not trigger any jobs or events
- No new background jobs
- Dashboard reads live data on each request (no dedicated cache for PoC)
- CI/GitHub/Jira connectors are not involved — dashboard only reads from V4 tables that have already been parsed

---

## 11. Test Impact

**New tests to create (Phase 5):**

| test type | class | scope | framework |
|---|---|---|---|
| Unit — service | `QaDashboardServiceTest` | BR-2 (AC coverage % + zero-denom), BR-3 (blackbox % + zero-denom), BR-4 (Release Readiness 7 conditions), defectLeakageCount formula | JUnit 5 + Mockito |
| Unit — controller | `QaDashboardControllerTest` | 200 authenticated, 401 unauthenticated, filter binding | @WebMvcTest + MockMvc |
| Integration — adapter | `QaDashboardJdbcAdapterIntegrationTest` | Adapter queries vs real DB; filter params narrow results | TestContainers (PostgreSQL) |
| FE unit | `QaSummaryCards.test.tsx` | Renders correct values; 0-state; error state | Vitest |
| FE integration | `QADashboardPage.test.tsx` | useQuery loading/success/error with MSW mock | Vitest + MSW |
| E2E | `qa-dashboard.spec.ts` | Navigate → KPI load; apply filter; empty state; VIEWER access (200, not 403) | Playwright |

**Existing tests not affected:**
- `PmDashboardControllerTest` — not touched
- `OrganizationServiceUnitTest` — not touched
- `LayerEnforcementTest` — must stay green; verify after adding new classes

---

## 12. Operation / Monitoring Impact

**No infrastructure changes.**

- `TraceIdFilter` automatically covers all `/api/**` → `/api/v1/qa/dashboard/**` is covered without additional config
- Dashboard is read-only → no audit log needed
- Error: `GlobalExceptionHandler` handles; returns `ErrorResponse(timestamp, status, errorCode, message, traceId)`; no stack trace exposed
- DB unavailable → standard 500 `ErrorResponse`
- V4 fact table empty → service returns 0 values (no exception)

**Logging constraint:**
- Do NOT log AC text, finding summaries, or ticket content at INFO level
- Only log filter params at DEBUG level if needed for troubleshooting
- Log DB errors at ERROR level with traceId

---

## 13. Rollout / Rollback Impact

**Rollout:**
- Standard deployment — no migration; no pre-deploy DB step needed
- QA tab already visible in `RoleTabs.tsx` (route already registered) → after deployment, QA Dashboard automatically displays real data instead of mock data
- No feature flag needed

**Rollback:**
- Revert ~9 new BE files + 2 modified FE files (`api.ts`, `QADashboardPage.tsx`)
- No DB rollback needed (no migration)
- Interim rollback to keep UI: restore `QA_MOCK_DATA` in `QADashboardPage.tsx` and revert `api.ts` — QA tab continues to display mock data

**Rollback risk:**
- Low: all changes are additive (new files + small modifications to 2 existing files)
- No data loss possible (read-only feature)

---

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| Existing REST endpoints | Not affected | No existing controller/service/DTO files modified |
| PM Dashboard feature | Not affected | Separate bounded context; `QaDashboardService` does not call `PmDashboardService` or vice versa |
| Organization feature | Not affected | Separate bounded context |
| CI/GitHub/Jira connectors | Not affected | QA Dashboard reads from already-parsed V4 tables; does not trigger connectors |
| `tbl_fact_finding.root_cause_phase` | Not referenced | Column does not exist in V4 SQL — verified from `V4__init_shema_v2.sql` |
| Sprint column in `tbl_dim_ticket` | Not referenced | Column does not exist — uses `periodKey` → `started_at` date range |
| `AppUser.Role` enum | Not changed | All authenticated users = access; no new role needed |
| `RoleTabs.tsx` | Not changed | Already includes `qa-dashboard` route; QA + PM both functional |
| Flyway migrations | No new migration | No new tables created; spec-pack §12 confirms "no migration" |
| DB write paths | Not affected | BR-1: read-only constraint; all SQL is SELECT; adapter class has no INSERT/UPDATE/DELETE |
| ArchUnit layer rules | Not violated if implemented correctly | New classes follow hexagonal: `web → application → infrastructure`; no reverse imports |

---

## 15. Required Options

**Option A (Chosen): JDBC Adapter**

Adapter class `QaDashboardJdbcAdapter` uses `NamedParameterJdbcTemplate` with inline SQL and `MapSqlParameterSource`. Pattern identical to `PmDashboardJdbcAdapter` (actual sibling pattern).

**Reason for not using MyBatis:**
- PM Dashboard (closest sibling) uses JDBC
- Complex dashboard JOIN queries are easier to maintain with raw JDBC
- No XML mapper needed → fewer files

---

## 16. Human Decision Required

| ID | decision item | owner | status |
|---|---|---|---|
| H-QA-DASHBOARD-4 | `acceptanceReadyCount` formula | Product / QA Lead | **Deferred — return 0 for PoC** |
| H-QA-DASHBOARD-9 | Zero-AC ticket: how does readiness count it? | Product / QA Lead | **Deferred** |
| **H-QA-DASHBOARD-SECTION-TYPE** | `section_type` value used for blackbox viewpoints in `tbl_fact_artifact_parsed_section` — parser stores viewpoint name in `section_key`; what is `section_type`? (e.g., `'BLACKBOX_VIEWPOINT'`, `'TEST_VIEWPOINT'`, `'VIEWPOINT'`?) | Dev / Parser owner | **Must resolve before Step 4 (adapter)** — Stop condition if unknown |

---

## 17. Risk Summary

| # | risk | severity | mitigation |
|---|---|---|---|
| R-1 | `section_type` value for blackbox viewpoints not confirmed from parser code — if wrong, blackbox coverage will always be 0% | **High** | Stop/Ask before writing SQL in adapter; read parser source code or check sample data |
| R-2 | `acceptanceReadyCount` formula deferred (H-QA-DASHBOARD-4) | Low | Return hardcoded `0`; does not block PoC |
| R-3 | PM Dashboard `requirePm()` check — if accidentally copied, QA Dashboard will block non-PM users | Medium | Service unit test must confirm VIEWER → 200 (not 403) |
| R-4 | JDBC inline SQL is hard to detect if string concatenation is used — injection risk | Medium | Code review checklist; all dynamic values must use `MapSqlParameterSource` with named params `:param` |
| R-5 | `tbl_fact_ac_test_coverage` feature may have no data if parser has not run | Low | Dashboard returns 0 values gracefully — covered by spec |
