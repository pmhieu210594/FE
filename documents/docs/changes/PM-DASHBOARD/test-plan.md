# Test Plan

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: Codex
**Update date**: 2026-06-26

## 1. Purpose

- Map every AC to a concrete test decision (run / skip+reason).
- Record what was already tested, what was added this phase, and what is intentionally deferred.
- Keep tests aligned to read-only dashboard behavior, permission gates, and summary/list/detail flows.

## 2. AC Matrix ↔ Test Type

| AC ID | FE UT (utils.test) | FE Component | BE UT | BE Web (slice) | API IT | E2E | Decision |
|---|---|---|---|---|---|---|---|
| AC-PM-DASHBOARD-1 | — | `PMDashboardPage.test` ✓ | — | Existing ✓ (`summary 200`) | Skip | E2E-1, E2E-4 ✓ | Page load + empty state covered in E2E. |
| AC-PM-DASHBOARD-2 | `scoreBandClasses`, `formatScore`, `buildEvidenceBottleneck` ✓ | `PMDashboardPage.test` ✓ | `summary_normalizesFilters` ✓ | Existing ✓ (`summary_returnsDashboardSummaryDto`) | Skip | E2E-1 ✓ | Full coverage. |
| AC-PM-DASHBOARD-3 | New ✓ (`parseFilters`, `buildSearchParams`) | — | Existing ✓ (`tickets_normalizesFilters`) | Existing ✓ (`tickets_returnsPageDto`) | Skip | E2E-4 ✓ | Filter param parsing + serialization verified at FE utils layer and E2E empty state. |
| AC-PM-DASHBOARD-4 | New ✓ (`parseFilters` — search param) | — | Existing ✓ (`tickets_normalizesFilters` — search trimmed) | Existing ✓ (`ticketsPassesSearchParamToService`) | Skip | E2E-2 ✓ | Search forwarded; E2E asserts `search=` param reaches mock API. |
| AC-PM-DASHBOARD-5 | `buildEvidenceBottleneck` ✓ | — | — | Existing ✓ (`detailReturns200WithEqsAndScoreBreakdown` — `missingEvidenceCount`) | Skip | Skip | Missing evidence field mapping verified. |
| AC-PM-DASHBOARD-6 | `riskClasses` ✓ | — | — | Existing ✓ (`detailReturns200WithEqsAndScoreBreakdown` — `riskCount`, `highestRiskSeverity`) | Skip | Skip | Risk badge colours + field mapping verified. Exception badge deferred (OI-5 open). |
| AC-PM-DASHBOARD-7 | `scoreBandClasses`, `formatScore`, `scoreBandLabel` (New ✓) | — | — | Existing ✓ (`detailReturns200WithEqsAndScoreBreakdown` — `evidenceQualityScore`, `scoreBand`) | Skip | Skip | Score display utilities + field mapping verified. Formula (OI-1) and threshold (H-2) tests deferred. |
| AC-PM-DASHBOARD-8 | — | `TicketDetailDrawer.test` ✓ | — | Existing ✓ (`detailReturns200WithEqsAndScoreBreakdown` — `specScore`, `planScore`) | Skip | Skip | Sub-score field presence verified via controller + drawer component. |
| AC-PM-DASHBOARD-9 | — | `PMDashboardPage.test` ✓ (click row → detail fetch), `TicketDetailDrawer.test` ✓ | Existing ✓ (`detail_returnsNotFound`) | Existing ✓ (`detailReturns200WithEqsAndScoreBreakdown` + `detail_returns404`) | Skip | E2E-3 ✓ | Both 200 and 404 paths covered; E2E verifies drawer opens and shows ticket key. |
| AC-PM-DASHBOARD-10 | — | — | Existing ✓ (owner via pseudonym snapshot) | — | Skip | Skip | No PII confirmed via service logic. |
| AC-PM-DASHBOARD-11 | — | — | Existing ✓ (`tickets_requiresPmRole`, `detail_requiresPmRole`) | Existing ✓ (`summary_mapsForbidden`) | Skip | Skip | Role gate tested on all non-refresh endpoints. |
| AC-PM-DASHBOARD-12 | — | — | Existing ✓ (`refresh_requiresPmRole`) | Existing ✓ (`refreshMapsForbidden`) | Skip | Skip | Refresh role gate and 403 shape covered. |
| AC-PM-DASHBOARD-13 | — | — | — | Existing ✓ (no PUT/DELETE/PATCH route registered) | Skip | E2E-5 ✓ | E2E confirms no edit/delete/upload button rendered. |

## 3. Priority

| test item | priority | reason |
|---|---|---|
| Landing page load | P0 | Core entry point |
| KPI area render | P0 | Core summary visibility |
| Filter and search behavior | P0 | Main dashboard utility |
| Read-only detail drawer | P0 | Core drill-down flow |
| Permission gating | P0 | Security boundary |
| No personal ranking / no PII | P0 | Privacy boundary |
| EQS and score band mapping | P1 | Central dashboard metric |
| Export / refresh entry points | P1 | Permission dependent |

## 4. Reuse Existing Test

| existing test | path | covers | gap |
|---|---|---|---|
| `ProjectControllerTest` | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/web/rest/ProjectControllerTest.java` | Thin controller, error envelope, current-user handling | Not dashboard-specific |
| `ProjectServiceTest` | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ProjectServiceTest.java` | Service authorization, normalization, not-found behavior | Not dashboard-specific |
| `AuthApiUnitTest` | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/web/rest/AuthApiUnitTest.java` | Auth controller patterns | No dashboard coverage |
| `AuthApiIntegrationTest` | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/AuthApiIntegrationTest.java` | Security and current-user route behavior | No dashboard coverage |
| `TraceabilityPage.tsx` pattern | `EDCAP_FE/src/pages/traceability/TraceabilityPage.tsx` | Read-only detail composition | Not dashboard-specific |
| `CustomerPage.tsx` pattern | `EDCAP_FE/src/pages/CustomerPage.tsx` | Query + table + drawer + messages | Not dashboard-specific |

## 5. Tests added this phase

### BE UT — `PmDashboardServiceTest` (10 cases total; 4 new in impl phase, carried forward)

| test | type | target | related AC |
|---|---|---|---|
| `summary_requiresPmRole` | BE UT | `PmDashboardService.summary()` | AC-PM-DASHBOARD-11 |
| `insights_requiresPmRole` | BE UT | `PmDashboardService.insights()` | AC-PM-DASHBOARD-11 |
| `summary_normalizesFiltersAndDelegatesToRepository` | BE UT | `PmDashboardService.summary()` normalize | AC-PM-DASHBOARD-2/3 |
| `insights_normalizesFiltersAndDelegatesToRepository` | BE UT | `PmDashboardService.insights()` normalize | AC-PM-DASHBOARD-2 |
| `detail_returnsNotFoundWhenSnapshotMissing` | BE UT | `PmDashboardService.detail()` | AC-PM-DASHBOARD-9 |
| `exportDelegatesWithMaxPageSizeForCsv` | BE UT | `PmDashboardService.exportCsv()` | AC-PM-DASHBOARD-11 |
| `tickets_requiresPmRole` | BE UT | `PmDashboardService.tickets()` | AC-PM-DASHBOARD-11 |
| `detail_requiresPmRole` | BE UT | `PmDashboardService.detail()` | AC-PM-DASHBOARD-11 |
| `refresh_requiresPmRole` | BE UT | `PmDashboardService.refresh()` | AC-PM-DASHBOARD-12 |
| `tickets_normalizesFiltersAndDelegatesToRepository` | BE UT | `PmDashboardService.tickets()` normalize | AC-PM-DASHBOARD-3/4 |

### BE Web — `PmDashboardControllerTest` (10 cases total; 3 new in impl phase, carried forward)

| test | type | target | related AC |
|---|---|---|---|
| `summary_returnsDashboardSummaryDto` | BE Web slice | `GET /summary` | AC-PM-DASHBOARD-1/2 |
| `insights_returnsInsightsDto` | BE Web slice | `GET /insights` | AC-PM-DASHBOARD-2 |
| `tickets_returnsPageDto` | BE Web slice | `GET /tickets` | AC-PM-DASHBOARD-3 |
| `detail_returns404WhenServiceRejectsMissingTicket` | BE Web slice | `GET /tickets/{id}/detail` → 404 | AC-PM-DASHBOARD-9 |
| `export_returnsCsvAttachment` | BE Web slice | `POST /export` → CSV | AC-PM-DASHBOARD-11 |
| `refresh_returnsPayload` | BE Web slice | `POST /refresh` | AC-PM-DASHBOARD-12 |
| `summary_mapsForbidden` | BE Web slice | `GET /summary` → 403 | AC-PM-DASHBOARD-11 |
| `detailReturns200WithEqsAndScoreBreakdown` | BE Web slice | `GET /tickets/{id}/detail` | AC-PM-DASHBOARD-7/8/9 |
| `ticketsPassesSearchParamToService` | BE Web slice | `GET /tickets?search=` | AC-PM-DASHBOARD-4 |
| `refreshMapsForbidden` | BE Web slice | `POST /refresh` → 403 | AC-PM-DASHBOARD-11/12 |

### FE Component — `PMDashboardPage.test.tsx` (1 case; discovered this phase, not in prior plan)

| test | type | target | related AC |
|---|---|---|---|
| `loads dashboard data first and fetches detail only after clicking a ticket` | FE Component | `PMDashboardPage` full render + interaction | AC-PM-DASHBOARD-1/9 |

### FE Component — `TicketDetailDrawer.test.tsx` (1 case; discovered this phase, not in prior plan)

| test | type | target | related AC |
|---|---|---|---|
| `shows only the missing sections summary for parser traceability errors` | FE Component | `TicketDetailDrawer` broken-link rendering | AC-PM-DASHBOARD-8/9 |

### FE UT — `utils.test.ts` (20 test cases across 8 groups)

| group | tests | related AC |
|---|---|---|
| `scoreBandClasses` | maps all 5 bands; EXCELLENT→emerald, CRITICAL→rose | AC-PM-DASHBOARD-7 |
| `riskClasses` | HIGH→orange, CRITICAL→rose; INFO→slate, LOW→sky (new) | AC-PM-DASHBOARD-6 |
| `formatScore` | integer, decimal, null | AC-PM-DASHBOARD-7 boundary |
| `ageLabel` | 0d/negative → "0d"; positive → "Nd" | spec boundary |
| `buildEvidenceBottleneck` | excludes clean rows; groups+sums by repo; sorts by count desc | AC-PM-DASHBOARD-2/5 |
| `parseFilters` (new) | all params present; absent → defaults; page clamp; size clamp | AC-PM-DASHBOARD-3/4 |
| `buildSearchParams` (new) | default values omitted; non-default values included | AC-PM-DASHBOARD-3 |
| `scoreBandLabel` (new) | returns band string; returns "-" for null | AC-PM-DASHBOARD-7 |

### E2E — `pm-dashboard.spec.ts` (5 tests, mock-based, DONE)

All API calls intercepted via `page.route()`; no live backend required. Routes follow Playwright LIFO ordering (more-specific patterns registered last).

| test ID | scenario | AC covered |
|---|---|---|
| E2E-1 | Dashboard loads — KPI cards and ticket table visible | AC-1, AC-2 |
| E2E-2 | Search keyword sent to API with correct `search=` query param | AC-4 |
| E2E-3 | Click ticket row → drawer opens; title shows `externalTicketKey` | AC-9 |
| E2E-4 | Empty state shown when tickets response is empty | AC-1, AC-3 |
| E2E-5 | No edit/delete/upload button on dashboard | AC-13 |

Files: `e2e_tests/pages/PmDashboardPage.ts` (POM), `e2e_tests/tests/pm-dashboard/pm-dashboard.spec.ts`

## 6. Areas intentionally left untested this phase

| area | reason | risk |
|---|---|---|
| `buildAttentionItems` | Function does not exist in utils.ts (JSDoc comment present but implementation was never created) | No false-positive test to remove; AC-5/6 covered by `buildEvidenceBottleneck` and controller tests |
| Exact EQS formula | Not defined in spec-pack (OI-PM-DASHBOARD-1 open) | Score computation cannot be final |
| Score band boundary logic | Thresholds 90/75/60/40 unconfirmed (H-PM-DASHBOARD-2 open) | Boundary behavior may change |
| Export file content (beyond CSV header) | Format not formally signed off (OI-PM-DASHBOARD-7 PoC only) | Export column list may change |
| Refresh job strategy E2E | Refresh mechanism design not finalized | Refresh E2E cannot be finalized |
| Snapshot table DB migration test | No test DB fixture; no integration test runner configured | DB migration correctness unverified |
| E2E against live backend | E2E suite is mock-based; auth middleware, DB, and real API not exercised end-to-end | Manual smoke test against live stack required pre-release |
| `waiting_review` KPI count | Definition pending (OI-PM-DASHBOARD-4) | KPI card may show 0 or wrong value |
| Exception badge | No DB concept defined (OI-PM-DASHBOARD-5) | Badge always 0 |

## 7. Data testing principles

- Use only synthetic or anonymized test data.
- BE: in-memory mocks only; hardcoded UUIDs (`90000000-0000-0000-0000-00000000000x`).
- FE: inline TypeScript fixture objects; zero network calls.
- Boundary values included in stubs:
  - `evidenceQualityScore = 0` → expected band `CRITICAL`
  - `evidenceQualityScore = 100` → expected band `EXCELLENT`
  - `ageDays = 0` → expected label `"0d"`
  - `missingEvidenceCount = 0` → row excluded from bottleneck chart
  - `size = 0` → clamped to `1` (parseFilters boundary)
  - `size = 150` → clamped to `100` (parseFilters boundary)
  - `page = 0` → clamped to `1` (parseFilters boundary)
- All `ownerDisplay` stubs use pseudonyms (e.g. `"Backend Role"`).

## 8. Execution commands

| command | purpose |
|---|---|
| `mvn test -Dtest="PmDashboardServiceTest,PmDashboardControllerTest" -DskipITs` | BE unit tests only |
| `npx vitest run "src/__ tests __/pm-dashboard/utils.test.ts"` | FE utils unit tests |
| `npx vitest run "src/__ tests __/pm-dashboard/PMDashboardPage.test.tsx"` | FE page component test |
| `npx vitest run "src/pages/pm-dashboard/components/TicketDetailDrawer.test.tsx"` | FE drawer component test |
| `npx playwright test e2e_tests/tests/pm-dashboard/pm-dashboard.spec.ts` | E2E mock-based tests (Vite dev server only) |

## 9. Stop Condition

- Stop if a test would require guessing the EQS formula, permission matrix, or read-model strategy.
- Stop if a test would require a helper, endpoint, or migration that does not exist in source.

## 10. Required Human Decision

- Confirm the EQS formula and score rule version (OI-PM-DASHBOARD-1).
- Confirm score band thresholds (H-PM-DASHBOARD-2).
- Confirm permission matrix for export/refresh (OI-PM-DASHBOARD-6, partially closed).
- Confirm open issues and exception definitions (OI-PM-DASHBOARD-4, OI-PM-DASHBOARD-5).
- Confirm export format sign-off (OI-PM-DASHBOARD-7).
