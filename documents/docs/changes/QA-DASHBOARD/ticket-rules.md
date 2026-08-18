# Ticket Rules

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26

---

## Must Follow

- Do not add specifications not included in `spec-pack.md`.
- Ambiguous points must remain as Open Issues or Human Decision items — do not silently resolve them in code.
- Before writing any implementation file, re-read `context.md`, `spec-pack.md`, and the target source files (PM Dashboard controller/service, V4 SQL, `QADashboardPage.tsx`, `types.ts`).
- Follow hexagonal architecture: `web/rest` controller → `application/usecase` service → `application/port/out/persistence` port → `infrastructure/persistence/adapter` → `infrastructure/persistence/mapper` → DB.
- Web layer (`web/`) must not import from infrastructure (`infrastructure/`) directly. Call the application service only.
- All DB queries use MyBatis named parameters (`#{param}`) — never string concatenation in SQL.
- All SQL in mapper XML is SELECT only — no INSERT, UPDATE, or DELETE.
- All numeric fields in BE response DTOs must default to `0` (never `null`) when no data exists.
- BE DTO field names must exactly match FE `types.ts` field names (`acTestCoveragePercent`, `acNotTestedCount`, `blackboxCoveragePercent`, `testResultsPassPercent`, `defectLeakageCount`, `acceptanceReadyCount`, `updatedAt`).
- Divide-by-zero must be handled in service: if total count is 0, return `0.0` for percentage fields.
- Filter params (`projectId`, `repositoryId`, `periodKey`, `search`) must be validated server-side before use in query.
- `search` field must be trimmed and max-length validated (200 chars) before use as SQL parameter.
- `acceptanceReadyCount`: return hardcoded `0` for PoC — H-QA-DASHBOARD-4 is Deferred. Do not invent a formula.
- Blackbox coverage denominator = 8 viewpoints (fixed constant — confirmed by user 2026-06-26).
- Use `@Transactional(readOnly = true)` on service methods.
- Use constructor injection; no `@Autowired` field injection.
- Use `@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor` on domain models; never `@Data`.
- Use `GlobalExceptionHandler` as the single exception-to-HTTP mapping point; no ad-hoc `ResponseEntity` status in controllers.
- Return 401 for unauthenticated requests (Spring Security standard); do not expose dashboard data without authentication.
- `ArchUnit` `LayerEnforcementTest` must stay green — do not add new `allowedPackage` exceptions.
- Trace every implementation item back to an AC ID (`AC-QA-DASHBOARD-1` through `AC-QA-DASHBOARD-12`).

---

## Must Not Do

- Do not write any source code during Phase 2.
- Do not execute INSERT, UPDATE, or DELETE on any table — QA Dashboard is entirely read-only (BR-1).
- Do not create a new Flyway migration for QA Dashboard PoC — no schema changes required.
- Do not reference `tbl_fact_finding.root_cause_phase` — column does not exist in V4 SQL.
- Do not reference a Sprint column in `tbl_dim_ticket` — column does not exist; use `periodKey` with `started_at` date range.
- Do not add a new `AppUser.Role` enum value (QA, PM, etc.) — all authenticated users can access the QA Dashboard.
- Do not implement role-based tab hiding on the FE — `RoleTabs.tsx` already shows all tabs to all authenticated users; match PM Dashboard behavior.
- Do not use DB views, materialized views, or stored procedures — aggregation belongs in the service layer.
- Do not call `fetch` directly in FE components — all API calls go through `api.ts`.
- Do not use `@Data` on domain models.
- Do not implement `acceptanceReadyCount` logic until H-QA-DASHBOARD-4 is resolved.
- Do not modify `V4__init_shema_v2.sql` (committed migration).
- Do not modify existing endpoints, controllers, or services outside the QA Dashboard scope.
- Do not display null values for KPI card numeric fields — show 0 instead.
- Do not expose stack traces in API error responses.

---

## Stop / Ask Conditions

- **Stop** if `acceptanceReadyCount` must be implemented with real logic before H-QA-DASHBOARD-4 is decided — use `0` as placeholder.
- **Stop** if any V4 column name read from `V4__init_shema_v2.sql` differs from what spec-pack §12 describes — report discrepancy before writing mappers.
- **Stop** if `tbl_fact_test_run` or `tbl_fact_artifact_parsed_section` columns cannot be confirmed from V4 SQL — do not guess column names.
- **Stop** if PM Dashboard controller/service file paths differ from what is described in `context.md` — verify before using as pattern.
- **Stop** if any new write path is required to make the dashboard work — no write operations are in scope.
- **Stop** if ArchUnit test fails after adding new classes — fix layer violation before proceeding.
- **Stop** if the FE `types.ts` shape differs from `QaDashboardSummaryDto` fields as designed — surface as an open issue before implementing.

---

## Review Focus

- **Read-only enforcement**: Verify no INSERT/UPDATE/DELETE appears in any mapper XML or adapter class (BR-1).
- **DTO field name exactness**: BE DTO field names must match FE `types.ts` field names character-for-character.
- **Null-safety**: All numeric DTO fields default to `0`; no `null` in API response for KPI fields.
- **Divide-by-zero guards**: AC coverage % and blackbox coverage % handle zero-denominator in service (BR-2, BR-3).
- **Parameterized SQL**: Every filter value uses `#{param}` in mapper XML — no dynamic string concatenation.
- **Layer compliance**: `web` → `application` → `infrastructure` flow; no imports crossing in wrong direction; ArchUnit green.
- **Authentication**: 401 for unauthenticated access (Spring Security default); no dashboard data leaked without auth.
- **No new role enum**: No `QA` or `PM` role value added — access is open to all authenticated users.
- **`acceptanceReadyCount` is `0` for PoC**: Field is present in response but fixed to `0`; no formula logic until H-QA-DASHBOARD-4 resolved.
- **Blackbox denominator constant**: `8` is a named constant — not a magic number inline in service code.
- **No new migration**: Verify no Flyway migration file was added.
- **PM Dashboard pattern followed**: QA Dashboard controller/service structure matches PM Dashboard structure.

---

## Test Focus

- Phase 2 creates test planning artifacts only. No test code in Phase 2.
- **BE unit tests (Phase 5)**:
  - `QaDashboardService` — BR-2 (AC coverage % including zero-denominator), BR-3 (blackbox % including zero-denominator), BR-4 (Release Readiness 7-condition checklist), `defectLeakageCount` formula (status != RESOLVED).
  - `QaDashboardController` — unauthenticated returns 401; valid request returns 200 with correct DTO shape.
- **BE integration tests (Phase 5)**:
  - Mapper XML queries execute correctly against real V4 table data (TestContainers or H2 if supported).
  - Filter params narrow results correctly (projectId, repositoryId, periodKey, search).
- **FE tests (Phase 7)**:
  - `useQaDashboardSummary`, `useQaTicketList` with MSW-mocked API — loading / success / error states.
  - `QaSummaryCards` renders correct values including 0 states.
- **E2E (Phase 8)**:
  - Navigate to QA Dashboard → KPI cards load.
  - Apply project filter → ticket list updates.
  - VIEWER/EDITOR navigates to `/qa-dashboard` → still accessible (no role gate for PoC).
  - Ticket with no parsed data → all metrics show 0 (no error state).
- **AC-QA-DASHBOARD-10 (read-only)**: Verify no edit/create/delete UI elements appear in any dashboard or drawer state.
- **AC-QA-DASHBOARD-11 (from DB)**: Verify via DB query log that only SELECT statements are executed during dashboard load.
