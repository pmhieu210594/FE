# Implementation Plan

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26

---

## 1. Principles

- Follow **PM Dashboard** as the sibling pattern for all BE and FE code.
- FE is already pre-built — the main FE work is replacing `QA_MOCK_DATA` with real `useQuery` calls.
- BE: create a new hexagonal stack (controller → service → port → JDBC adapter) with no mapper XML.
- Read first, write later: **column names fully confirmed** from `V4__init_shema_v2.sql` (Phase 3).
- Dashboard is completely read-only. No write path, no migration, no new tables.
- `acceptanceReadyCount` returns hardcoded `0` until H-QA-DASHBOARD-4 is resolved.
- Blackbox coverage denominator = 8 (named constant, not a magic number).
- All numeric DTO fields default to `0` (not null).
- No role guard — all authenticated users = access (unlike PM Dashboard).
- Adapter uses `NamedParameterJdbcTemplate` (JDBC) following the `PmDashboardJdbcAdapter` pattern.

---

## 2. Alternatives Considered and Decision

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A: JDBC Adapter (NamedParameterJdbcTemplate) | One `QaDashboardJdbcAdapter` with inline SQL, following `PmDashboardJdbcAdapter` | Matches actual sibling pattern; complex JOINs are straightforward; fewer files (no XML) | Inline SQL harder to refactor if complexity grows | **Chosen** |
| B: MyBatis mapper XML | `QaXxxMapper.java` + `.xml` following `OrganizationMapper` | Consistent with context.md description | PM Dashboard (closest sibling) does not use it; 10 files instead of 1; unnecessary for dashboard | Rejected |
| C: One port + adapter per table | Separate port/adapter pair per V4 fact table | Fine-grained | Over-engineered for a PoC read-only dashboard; 5–6 adapters | Rejected |
| D: Spring Data / JPQL | Spring Data repositories | Less boilerplate | Codebase uses JDBC/MyBatis; mixing would break consistency | Rejected |

---

## 3. Reason for Choosing Option A

PM Dashboard is the actual sibling pattern used as the reference in `context.md`. `PmDashboardJdbcAdapter` uses `NamedParameterJdbcTemplate` for complex dashboard queries with multiple JOINs. Option A allows following this pattern exactly, reduces the number of new files (1 adapter instead of 5+), and allows writing complex SQL clearly. Facade-per-bounded-context (ADR-001 §6) is maintained: 1 service + 1 port + 1 adapter for all QA Dashboard reads.

---

## 4. List of Changed Files

| file | change summary | reason | related AC |
|---|---|---|---|
| `web/rest/QaDashboardController.java` | New — 3 GET endpoints: `/summary`, `/acceptance-criteria`, `/coverage-trend`; thin; constructor injection; no role guard | New BE API surface | All |
| `web/dto/QaDashboardDtos.java` | New — 3 Java records: `QaDashboardSummaryDto`, `AcceptanceCriteriaRowDto`, `AcCoverageTrendPointDto`; static `from(model)` mapper | Response DTO definitions; field names match types.ts | All |
| `application/usecase/qadashboard/QaDashboardService.java` | New — aggregation logic BR-2, BR-3, BR-4; filter normalize/validate; `@Transactional(readOnly=true)` | Business rules in service layer | AC-2,3,4,5,6,7 |
| `application/usecase/qadashboard/QaDashboardModels.java` | New — all domain record types: `QaFilter`, `QaSummaryModel`, `AcCoverageRow`, `TrendPoint` | Domain models separate from DTO | All |
| `application/port/out/persistence/QaDashboardRepositoryPort.java` | New — port interface; all methods return plain Java types; no JDBC type leakage | Port abstracts DB from use case | All BE |
| `infrastructure/persistence/adapter/QaDashboardJdbcAdapter.java` | New — implements port; `NamedParameterJdbcTemplate`; inline SQL with named params `:paramName`; `MapSqlParameterSource`; SELECT only | Adapter pattern following PmDashboardJdbcAdapter | All BE |
| `EDCAP_FE/src/lib/api.ts` | Update — add `qaDashboard.summary()`, `.acceptanceCriteria()`, `.coverageTrend()` following `pmDashboard.*` pattern | FE API endpoint definitions | All |
| `EDCAP_FE/src/pages/qa-dashboard/QADashboardPage.tsx` | Update — replace `QA_MOCK_DATA` with 3 `useQuery` calls; add loading/error states | FE wire-up | All |

**Total: 9 new/modified files** (6 new BE + 3 FE)

---

## 5. Classes / Functions / Methods to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| `QaDashboardController.getSummary` | Add | `projectId` (UUID), `repositoryId` (UUID), `periodKey` (String), `search` (String) — all optional | `QaDashboardDtos.QaDashboardSummaryDto` | 200 / 401 |
| `QaDashboardController.getAcceptanceCriteria` | Add | Same params | `List<QaDashboardDtos.AcceptanceCriteriaRowDto>` | 200 / 401 |
| `QaDashboardController.getCoverageTrend` | Add | Same params | `List<QaDashboardDtos.AcCoverageTrendPointDto>` | 200 / 401 |
| `QaDashboardService.getSummary` | Add | `QaDashboardModels.QaFilter` | `QaDashboardModels.QaSummaryModel` | BR-2, BR-3, defect leakage; `acceptanceReadyCount = 0` |
| `QaDashboardService.getAcceptanceCriteria` | Add | `QaDashboardModels.QaFilter` | `List<QaDashboardModels.AcCoverageRow>` | AC rows with status PASSED / PARTIAL / NOT_TESTED |
| `QaDashboardService.getCoverageTrend` | Add | `QaDashboardModels.QaFilter` | `List<QaDashboardModels.TrendPoint>` | Period-grouped AC coverage data |
| `QaDashboardService.normalize` | Add (private) | raw params | `QaFilter` | Trim + validate (UUID, search length, periodKey format) |
| `QaDashboardRepositoryPort.findAcCoverageSummary` | Add | `QaFilter` | coverage counts map | COVERED / NOT_TESTED counts from `tbl_fact_ac_test_coverage` |
| `QaDashboardRepositoryPort.findFindingCount` | Add | `QaFilter` | `int` | COUNT `tbl_fact_finding` WHERE `status != 'RESOLVED'` |
| `QaDashboardRepositoryPort.findTestRunSummary` | Add | `QaFilter` | PASS/FAIL/SKIP counts | SUM `passed_count`, `failed_count`, `skipped_count` from `tbl_fact_test_run` |
| `QaDashboardRepositoryPort.findBlackboxViewpoints` | Add | `ticketId` | `Set<String>` | Present viewpoint names from `tbl_fact_artifact_parsed_section` |
| `QaDashboardRepositoryPort.findAcRows` | Add | `QaFilter` | `List<AcCoverageRow>` | Raw AC rows for acceptance-criteria endpoint |
| `QaDashboardRepositoryPort.findCoverageTrendPoints` | Add | `QaFilter` | `List<TrendPoint>` | Grouped by period/started_at |
| `api.ts — qaDashboard.summary` | Add | `Partial<QaFilters>` | `Promise<QaSummary>` | GET /api/v1/qa/dashboard/summary |
| `api.ts — qaDashboard.acceptanceCriteria` | Add | `Partial<QaFilters>` | `Promise<AcceptanceCriteriaRow[]>` | GET /api/v1/qa/dashboard/acceptance-criteria |
| `api.ts — qaDashboard.coverageTrend` | Add | `Partial<QaFilters>` | `Promise<AcCoverageTrendPoint[]>` | GET /api/v1/qa/dashboard/coverage-trend |
| `QADashboardPage.tsx` | Modify | — | — | Replace `QA_MOCK_DATA` with 3 `useQuery`; add loading/error states |

---

## 6. SQL / Query / Repository Policy

**Adapter: `QaDashboardJdbcAdapter` uses `NamedParameterJdbcTemplate`**

- All queries: SELECT only. No INSERT / UPDATE / DELETE.
- All filter params use JDBC named params `:paramName` with `MapSqlParameterSource`. No string concatenation.
- Optional filters applied in Java (build query conditionally) or using COALESCE pattern in SQL.

**Main queries:**

```sql
-- AC coverage summary (tbl_fact_ac_test_coverage)
SELECT coverage_status, COUNT(*) AS cnt
FROM tbl_fact_ac_test_coverage atc
JOIN tbl_dim_ticket t ON t.ticket_id = atc.ticket_id
WHERE (:projectId IS NULL OR t.project_id = :projectId)
  AND (:repositoryId IS NULL OR atc.ticket_id IN (SELECT ticket_id FROM tbl_dim_ticket WHERE ...))
  AND (:search IS NULL OR t.external_ticket_key ILIKE :search OR t.title ILIKE :search)
GROUP BY coverage_status
```

```sql
-- Defect leakage count (tbl_fact_finding)
SELECT COUNT(*) FROM tbl_fact_finding f
JOIN tbl_dim_ticket t ON t.ticket_id = f.ticket_id
WHERE f.status != 'RESOLVED'
  AND (:projectId IS NULL OR t.project_id = :projectId)
```

```sql
-- Test run summary (tbl_fact_test_run)
SELECT SUM(passed_count), SUM(failed_count), SUM(skipped_count)
FROM tbl_fact_test_run tr
JOIN tbl_dim_ticket t ON t.ticket_id = tr.ticket_id
WHERE (:projectId IS NULL OR t.project_id = :projectId)
```

```sql
-- Blackbox viewpoints (tbl_fact_artifact_parsed_section)
-- ⚠️ section_type value not confirmed — see Stop Condition §12
SELECT section_key, present_flag
FROM tbl_fact_artifact_parsed_section
WHERE ticket_id = :ticketId
  AND section_type = :blackboxSectionType  -- must confirm value from parser
  AND section_key IS NOT NULL
```

**`periodKey` filter:** Parse `"2026-W23"` → `startDate` / `endDate` in service; SQL: `AND t.started_at BETWEEN :startDate AND :endDate`.

**`search` filter:** `'%' + search.trim() + '%'` → `:search`; SQL: `ILIKE :search`.

---

## 7. Validation / Error / Logging Policy

**Server-side validation (service `normalize()`):**
- `projectId` / `repositoryId`: if non-empty → UUID format (try `UUID.fromString()`); invalid → `IllegalArgumentException` → `GlobalExceptionHandler` → 400
- `search`: trim; if > 200 chars after trim → throw `IllegalArgumentException` → 400
- `periodKey`: if non-empty → must match pattern `^\d{4}-W\d{1,2}$`; invalid → 400

**Error responses:**
- 401: Unauthenticated (Spring Security standard)
- 400: Invalid filter param
- 500: DB query failure → `GlobalExceptionHandler` → `ErrorResponse` with traceId; no stack trace

**Do not return null for KPI fields:** All `double` / `int` DTO fields = `0` / `0.0` when no data.

**Logging:**
- Do NOT log AC text, finding summaries, or ticket content at INFO level
- Filter params: DEBUG level only when troubleshooting
- TraceId included automatically via existing `TraceIdFilter`

---

## 8. Migration / Rollback Policy

**Migration:** None. QA Dashboard does not create new tables and does not change the schema.

**Rollback:** Revert 6 new BE files + 2 modified FE files. No DB rollback needed.

Interim rollback to keep UI: restore `QA_MOCK_DATA` import in `QADashboardPage.tsx` → QA tab continues to display mock data while BE is being fixed.

---

## 9. Step Implementation

| step | action | target file(s) | verification | stop condition |
|---|---|---|---|---|
| 1 | **Confirm section_type**: Read parser source or check DB data to confirm `section_type` value for blackbox viewpoints in `tbl_fact_artifact_parsed_section` | Parser source code or DB data sample | `section_type` value confirmed and recorded | **Stop if not confirmed — do not guess** |
| 2 | **Models**: Create `QaDashboardModels.java` with all domain records (`QaFilter`, `QaSummaryModel`, `AcCoverageRow`, `TrendPoint`) | `application/usecase/qadashboard/QaDashboardModels.java` | `mvn compile` — zero errors; ArchUnit green | Stop if placed in wrong layer |
| 3 | **Port interface**: Create `QaDashboardRepositoryPort.java` | `application/port/out/persistence/QaDashboardRepositoryPort.java` | `mvn compile`; ArchUnit green | |
| 4 | **JDBC Adapter**: Create `QaDashboardJdbcAdapter.java` using `NamedParameterJdbcTemplate`; implement all port methods; SQL with named params `:param` | `infrastructure/persistence/adapter/QaDashboardJdbcAdapter.java` | `mvn compile`; ArchUnit green | Stop if `section_type` not confirmed (step 1); stop if any column name must be guessed |
| 5 | **Service**: Create `QaDashboardService.java` with aggregation logic BR-2, BR-3; normalize/validate filter; `acceptanceReadyCount = 0` | `application/usecase/qadashboard/QaDashboardService.java` | Unit test `QaDashboardServiceTest` passes (BR-2 zero-denom, BR-3 zero-denom, defect count) | Stop if `acceptanceReadyCount` requires real logic — use `0` |
| 6 | **DTOs + Controller**: Create `QaDashboardDtos.java` (field names must match `types.ts`) and `QaDashboardController.java` (3 GET endpoints; thin; no role guard) | `web/dto/QaDashboardDtos.java`, `web/rest/QaDashboardController.java` | `@WebMvcTest` passes: 200 authenticated, 401 unauthenticated; DTO field names verified against `types.ts` | Stop if field names do not match — surface open issue |
| 7 | **FE wire-up**: Add `qaDashboard.*` to `api.ts`; update `QADashboardPage.tsx` to replace `QA_MOCK_DATA` with 3 `useQuery` calls; add loading/error states | `EDCAP_FE/src/lib/api.ts`, `QADashboardPage.tsx` | `npm run typecheck` — zero errors; browser: open QA tab, data loads from API | Stop if FE `types.ts` conflicts with BE DTO — surface open issue |
| 8 | **Full test suite**: Run all tests; manual E2E | All | `mvn clean verify` green; `npm run typecheck` green; manual: load QA tab, apply filter, 0-state for empty data, VIEWER → 200 (not 403) | Stop if ArchUnit fails — fix layer violation first |

---

## 10. Verification Method for Each Step

| step | verification command / method |
|---|---|
| 1 (section_type) | Read parser source + record value in a comment in the adapter |
| 2 (models) | `mvn compile` — zero errors |
| 3 (port) | `mvn compile` — zero errors |
| 4 (adapter) | `mvn compile`; manual: run `NamedParameterJdbcTemplate` query against dev DB; verify row count is reasonable |
| 5 (service) | `mvn test -pl EDCAP_BE -Dtest=QaDashboardServiceTest` — all pass |
| 6 (controller) | `mvn test -pl EDCAP_BE -Dtest=QaDashboardControllerTest` — 200 and 401 pass; VIEWER (no role guard) → 200 |
| 7 (FE) | `npm run typecheck`; `npm run dev` → browser → /qa-dashboard → data loads; filter apply → data changes |
| 8 (full) | `mvn clean verify` (includes ArchUnit); `npm run typecheck`; manual smoke test (load, filter, empty state, 0-state ticket) |

---

## 11. AC Correspondence Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-QA-DASHBOARD-1 | Spring Security 401 unauthenticated; all authenticated roles → 200 (no role guard) | `@WebMvcTest` without auth → 401; with auth → 200; VIEWER auth → 200 |
| AC-QA-DASHBOARD-2 | `QaDashboardService.getSummary` → `acTestCoveragePercent`, `acNotTestedCount` from `tbl_fact_ac_test_coverage` | Service unit test; DB integration |
| AC-QA-DASHBOARD-3 | `/acceptance-criteria` endpoint returns rows WHERE `coverage_status = 'NOT_TESTED'` | Service unit test; manual API call |
| AC-QA-DASHBOARD-4 | `blackboxCoveragePercent` from `tbl_fact_artifact_parsed_section`; denominator = 8 (constant) | Service unit test zero-denom; manual |
| AC-QA-DASHBOARD-5 | `testResultsPassPercent` from SUM `passed_count` / SUM `test_count` in `tbl_fact_test_run`; 0 when no data | Service unit test; 0-state manual |
| AC-QA-DASHBOARD-6 | `defectLeakageCount` = COUNT `tbl_fact_finding` WHERE `status != 'RESOLVED'` | Service unit test |
| AC-QA-DASHBOARD-7 | Release Readiness 7-condition BR-4 in service; READY / PARTIAL / NOT_READY | Service unit test for each condition |
| AC-QA-DASHBOARD-8 | Filter params bound in controller; passed → service normalize → adapter WHERE clause | Controller unit test filter binding; integration filter test |
| AC-QA-DASHBOARD-9 | 3 `useQuery` calls in `QADashboardPage` with real data | FE manual; browser drill-down |
| AC-QA-DASHBOARD-10 | No edit/create/delete UI; no write SQL in adapter | Code review: no INSERT/UPDATE/DELETE in `QaDashboardJdbcAdapter` |
| AC-QA-DASHBOARD-11 | All data from V4 SELECT; ArchUnit + manual verify no write | ArchUnit green; DB query log review |
| AC-QA-DASHBOARD-12 | No input form needed to populate data; all KPI values auto-derived | Manual E2E visual inspection |

---

## 12. Stop / Ask Conditions

- **Stop** if `section_type` value for blackbox viewpoints in `tbl_fact_artifact_parsed_section` has not been confirmed — do not guess; read parser source or ask the team before writing SQL.
- **Stop** if `acceptanceReadyCount` needs real logic implementation — use `0` as placeholder.
- **Stop** if any V4 column name differs from what was confirmed in Phase 3 — report the discrepancy.
- **Stop** if `QADashboardPage.tsx` or `types.ts` structure differs from Phase 3 analysis — surface open issue.
- **Stop** if ArchUnit fails after adding new classes — fix layer violation; do not add `allowedPackage` exceptions without team review.
- **Stop** if any write path (INSERT/UPDATE/DELETE) is required for the dashboard to function — no write path is in scope.

---

## 13. Out of Scope for This Ticket

- No INSERT / UPDATE / DELETE in any query.
- No Flyway migration.
- No new `AppUser.Role` enum values.
- No DB views / materialized views.
- No changes to existing controllers / services / ports / adapters outside QA Dashboard scope.
- No `acceptanceReadyCount` logic implementation until H-QA-DASHBOARD-4 is decided.
- Do not hardcode `8` inline in service — must be a named constant `BLACKBOX_VIEWPOINT_COUNT = 8`.
- No role guard (no `requireQa()` equivalent) — all authenticated = access.
- No mapper XML (JDBC decision).
- No `@Data` on domain models — use `@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor`.
- No `@Autowired` field injection — constructor injection only.

---

## 14. Open / Related Issues

| ID | issue | status | blocking? |
|---|---|---|---|
| H-QA-DASHBOARD-4 | `acceptanceReadyCount` formula | **Deferred** | No — return `0` for PoC |
| H-QA-DASHBOARD-9 | Zero-AC ticket readiness | **Deferred** | No |
| **H-QA-DASHBOARD-SECTION-TYPE** | `section_type` value for blackbox viewpoints in `tbl_fact_artifact_parsed_section` | **Open — must resolve before Step 4** | **Yes — Stop condition** |
| Adapter JDBC pattern | Decided JDBC per Phase 3 Stop/Ask resolution | **Closed — JDBC** | No |
