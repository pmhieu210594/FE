# Test Plan

**Ticket ID**: DATA-OPS-DASHBOARD
**Create date**: 2026-07-02
**Author**: OpenAI
**Update date**: 2026-07-02 (Phase 6 test plan/test code by Claude)

## 1. Purpose

Implementation (impl-plan.md, self-review.md) is functionally complete: 5 KPIs, filtering,
connector drill-down, read-only enforcement. This phase closes the two residual risks self-review
flagged as not yet independently verified — (1) the BE API was only unit-tested with a standalone
MockMvc that has **no security filter at all**, so unauthorized-access behavior (AC-DATAOPS-10)
was never actually exercised end-to-end, and (2) no E2E/manual UI verification was performed — and
formalizes which test type covers which AC, what is reused vs. added, and what is intentionally
left untested with a documented reason.

## 2. AC Matrix ↔ Test Type

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-DATAOPS-1 (Dashboard displayed) | Yes (existing) | — | — | — | — | Yes (new) | Yes |
| AC-DATAOPS-2 (Connector Status) | Yes (existing) | Yes (existing) | — | — | — | Yes (new) | Yes |
| AC-DATAOPS-3 (Parse Errors) | Yes (existing) | Yes (existing) | — | — | — | Yes (new) | Yes |
| AC-DATAOPS-4 (Missing Evidence) | Yes (existing) | Yes (existing) | — | — | — | Yes (new) | Yes |
| AC-DATAOPS-5 (Freshness) | Yes (existing) | Yes (existing) | — | — | — | Yes (new) | Yes |
| AC-DATAOPS-6 (Broken Traceability) | Yes (existing) | Yes (existing) | — | — | — | Yes (new) | Yes |
| AC-DATAOPS-7 (Filtering) | Yes (existing) | Yes (existing) | — | — | — | Yes (new) | Yes |
| AC-DATAOPS-8 (Connector drill-down) | Yes (existing) | — | — | — | — | Yes (new) | Yes |
| AC-DATAOPS-9 (V4 table reuse only) | — | — | — | — | No (see §6) | — | Yes (code review evidence) |
| AC-DATAOPS-10 (Read-only) | Yes (existing) | Yes (existing, route has no write verb) | Yes (new) | — | — | Yes (new) | Yes |

Notes:
- "FE UT / BE UT (existing)" = written during implementation, reused as-is this phase (§4).
- "API IT (new)" and "E2E (new)" = added this phase to close the two residual risks in §1 (§5).
- Contract Test: not applicable — no external contract/consumer beyond this app's own FE, which is
  covered by FE UT + E2E against the same DTO shapes.
- DB/Migration: no migration exists for this ticket (BR-5); "DB/Migration test" here means a
  live-database integration test of `DataOpsDashboardJdbcAdapter`'s SQL, which is intentionally
  skipped — see §6.

## 3. Priority

| test item | priority | reason |
|---|---|---|
| API IT — unauthorized/unauthenticated access rejected | P0 | AC-DATAOPS-10 is a Blocker-severity review item (review-checklist.md §1); the only prior coverage (DataOpsDashboardControllerTest) uses a standalone MockMvc with zero security filters, so this was never actually proven |
| E2E — dashboard loads with 5 KPIs + connector table | P0 | AC-DATAOPS-1..6 are Blocker/Major review items; no manual or automated full-stack UI verification existed before this phase |
| E2E — connector drill-down opens read-only drawer | P1 | AC-DATAOPS-8, drives the primary interactive feature of the dashboard |
| E2E — filter triggers a new request | P1 | AC-DATAOPS-7 |
| E2E — zero-state (all KPIs 0, empty table) | P1 | Spec-pack §8.3 boundary case; explicitly called out in spec-pack examples |
| E2E — read-only verification (no write controls) | P0 | AC-DATAOPS-10, Blocker severity |
| E2E — unauthenticated direct API call returns 401 | P1 | Reinforces AC-DATAOPS-10 from the browser network layer |

## 4. Reuse Existing Test

| existing test | path | covers | gap |
|---|---|---|---|
| `DataOpsDashboardServiceTest` (9 tests) | `EDCAP_BE/src/test/UnitTest/java/.../dataopsdashboard/DataOpsDashboardServiceTest.java` | Auth guard (null caller), filter normalization, invalid parser status, search-too-long, not-found, zero-value KPIs, options delegation | None for its own scope |
| `DataOpsDashboardControllerTest` (5 tests) | `EDCAP_BE/src/test/UnitTest/java/.../rest/DataOpsDashboardControllerTest.java` | Route → DTO mapping for summary/connectors/detail/options | Standalone MockMvc has **no Spring Security filter chain** — cannot prove AC-DATAOPS-10's "unauthorized access denied" (closed by new API IT, §5) |
| `DataOpsDashboardJdbcAdapterTest` (SQL-construction tests) | `EDCAP_BE/src/test/UnitTest/java/.../adapter/DataOpsDashboardJdbcAdapterTest.java` | SQL string construction against a mocked `NamedParameterJdbcTemplate` | Never executed against a real database (§6, intentionally not closed this phase) |
| `DataOpsSummaryCards.test.tsx`, `DataOpsFilterBar.test.tsx`, `DataOpsConnectorTable.test.tsx`, `DataOpsConnectorDetailDrawer.test.tsx`, `DataOpsDashboardPage.test.tsx` (38 tests) | `EDCAP_FE/src/__ tests __/data-ops-dashboard/` | Component rendering, KPI values, filter wiring, drill-down, read-only assertions — all at the React-component level | Never driven through the real app shell/router/auth guard (closed by new E2E, §5). Two pre-existing failures found while re-running this suite this phase are **not** related to this ticket's AC coverage — see test-results.md §5 |

## 5. Additional Test This Time

| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| AC-DATAOPS-10-a | `summary_withoutBearerToken_returns401` | API IT | `DataOpsDashboardController` behind the real `SecurityConfig` + `BearerTokenAuthenticationFilter` chain | AC-DATAOPS-10 |
| AC-DATAOPS-10-b | `summary_withInvalidBearerToken_returns401` | API IT | same | AC-DATAOPS-10 |
| AC-DATAOPS-10-c | `summary_withAuthenticatedUser_returnsOkThroughFullSecurityChain` | API IT | same | AC-DATAOPS-1, AC-DATAOPS-10 |
| AC-DATAOPS-10-d | `options_withAuthenticatedUser_returnsOk` | API IT | same | AC-DATAOPS-7, AC-DATAOPS-10 |
| AC-DATAOPS-10-e | `dashboard_hasNoWriteEndpoint_postToSummaryIsNotAccepted` | API IT | same | AC-DATAOPS-10 |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| S-E2E-1: Dashboard loads | Mocked auth (`DATA_OPS` role) + mocked API responses (5 non-zero KPIs, 1 connector row) | 1. Navigate to `#/en/data-ops-dashboard`. 2. Wait for page render. | Title visible; all 5 KPI values visible in `data-ops-summary-cards`; connector row visible in table | AC-1..6 |
| S-E2E-2: Connector filter | Same as above | 1. Navigate. 2. Select `conn-1` in the connector dropdown. | A new `connectors` request fires with `connectorName=conn-1` | AC-7 |
| S-E2E-3: Connector drill-down | Same as above | 1. Navigate. 2. Click "View repository" on the row. | Drawer opens titled with the connector name; data-quality error summary visible; drawer contains no `input`/`textarea` | AC-8, AC-10 |
| S-E2E-4: Zero-state | Mocked API returns all-zero summary + empty connector page | 1. Navigate. | All 5 KPI cards show `0`; no "View repository" actions rendered | Spec-pack §8.3 boundary |
| S-E2E-5: Read-only | Same as S-E2E-1 | 1. Navigate. | No edit/delete/create/add/remove/upload buttons; no `input[type=number]`/`textarea`; no "export" text anywhere on the page | AC-9, AC-10 |
| S-E2E-6: Unauthenticated | No token | 1. `fetch()` the summary endpoint directly with no Authorization header. | Response status is 401 | AC-10 |

## 6. Areas intentionally left untested this time

| area | reason | risk |
|---|---|---|
| Live-database integration test of `DataOpsDashboardJdbcAdapter` SQL (executed against a real PostgreSQL instance) | No Testcontainers/live-DB test infrastructure exists anywhere in this repository today — confirmed by repo-wide search. Neither of this ticket's own reference implementations (QA Dashboard, PM Dashboard) has one either, so this is a pre-existing project-wide gap, not a regression introduced by this ticket. Building that infra is a separate, larger initiative than this ticket's test-writing scope. | Medium — a column name/type mismatch between the SQL and `V4__init_shema_v2.sql` would only surface at runtime. Mitigated partially by `DataOpsDashboardJdbcAdapterTest`'s SQL-construction unit tests and by manual review against the migration file (self-review §8). Recommend as a follow-up backlog item, not a blocker for this ticket. |
| Direct unit tests for `DataOpsKpiChart.tsx`, `DataOpsSearchHeader.tsx`, `useDataOpsDashboardFilters.ts` | These are thin presentational/derived-state pieces with no independent business logic; already exercised indirectly through `DataOpsDashboardPage.test.tsx` (renders the whole tree) and the new E2E suite (drives the real rendered output). Adding isolated unit tests for them would test implementation details, not behavior. | Low |
| Parser Status filter dropdown E2E/API coverage | `DataOpsFilterBar.tsx` and `DataOpsSearchHeader.tsx` do not render a `parser-status-select` control at all, even though spec-pack §6.2 lists Parser Status as a filter input and the BE service already validates it. This is a pre-existing FE gap (not introduced this phase — confirmed by reverting all of this phase's changes and reproducing the same failure), caught by two already-existing FE unit tests (`DataOpsFilterBar.test.tsx`) that fail against the current component. Not fixed in this phase because building a new filter UI control is implementation work outside this test-writing ticket's scope. | Medium — AC-DATAOPS-7 (filtering) is only partially exercisable end-to-end (project/repository/connector filters work; parser status does not). Logged as a Fail in test-results.md with recommendation to open a follow-up ticket. |
| Manual/exploratory QA pass in a real browser against a running backend | Out of scope for this automated-test phase; the new E2E suite is fully mocked (no live backend/DB), consistent with the existing `dev-dashboard`/`qa-dashboard`/`pm-dashboard` E2E suites in this repo. | Low — mocked E2E already exercises the full render/route/auth-guard path that a manual pass would additionally check visually. |

## 7. Data testing principles

- No production data. All fixtures are synthetic, matching the shapes already used in
  `DataOpsDashboardServiceTest`/`DataOpsDashboardControllerTest` (BE) and
  `DataOpsDashboardPage.test.tsx` (FE) so intent stays consistent across test layers.
- Boundary set: zero-data (all KPIs 0, empty connector page) and a mixed pass/fail single-row
  case, matching spec-pack §8.3's own boundary example.
- E2E uses fully mocked API responses via Playwright `page.route()` — no backend/DB dependency,
  matching this repo's existing `dev-dashboard.spec.ts` / `qa-dashboard.spec.ts` pattern.
- API IT uses Mockito-mocked `AuthTokenService` / `AuthTokenSessionRepositoryPort` /
  `DataOpsDashboardService` beans behind the **real** Spring Security filter chain — no database
  connection is opened.
- See `test-data.md` for the full data policy (master data, user/permission data, sensitive-data
  handling).

## 8. Execution command

| command | purpose |
|---|---|
| `mvn -o test -Dtest=DataOpsDashboard*` | Run existing BE unit tests (Service/Controller/JdbcAdapter, 14 tests) |
| `mvn -o verify -Dit.test=DataOpsDashboardApiIntegrationTest -Dsurefire.skip=true` | Run the new BE API integration test only |
| `mvn -o test` | Full BE unit-test regression |
| `mvn -o verify -Dsurefire.skip=true` | Full BE integration-test regression (failsafe phase) |
| `npm run test:unit -- data-ops-dashboard` | Run existing FE unit/integration tests for this feature (38 tests) |
| `npm run test:unit` | Full FE unit-test regression |
| `npx playwright test data-ops-dashboard` | Run the new E2E suite only |
| `npx playwright test` | Full E2E regression (all dashboards + management pages) |

## 9. Stop Condition

- Stop and escalate if the API IT reveals that unauthenticated/unauthorized requests reach the
  controller (would mean `SecurityConfig`'s `anyRequest().authenticated()` regressed).
- Stop and escalate if E2E reveals data corruption or a write request fired against a read-only
  endpoint.
- A pre-existing, unrelated test failure (confirmed by reverting this phase's changes and
  reproducing the same failure) is logged in test-results.md but does **not** block this phase's
  completion, per §6.

## 10. Required Human Decision

- Whether to schedule a follow-up ticket to add the missing Parser Status filter UI control
  (§6) — currently 0 of this feature's 4 documented filter inputs beyond parser status are
  missing from the UI; this one is.
- Whether building live-database (Testcontainers) integration test infrastructure is worth
  prioritizing project-wide, given it is currently absent for every dashboard ticket, not just
  this one.
