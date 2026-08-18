# Test Plan

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-30

---

## 1. Purpose

Verify that the QA Dashboard BE endpoints and FE wire-up satisfy all 12 AC items. Dashboard is read-only; test focus is on aggregation correctness, null-safety, filter behavior, access control, and zero-state handling.

---

## 2. AC Matrix ↔ Test Type

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-QA-DASHBOARD-1 (access) | tab visible | 401 unauthenticated | — | — | — | login + navigate | permission BB |
| AC-QA-DASHBOARD-2 (AC coverage) | card render + 0 state | BR-2 unit | DB query | — | No migration | — | normal + boundary BB |
| AC-QA-DASHBOARD-3 (not-tested list) | table render | NOT_TESTED filter unit | DB query | — | — | — | normal BB |
| AC-QA-DASHBOARD-4 (blackbox %) | card render + 0 state | BR-3 unit (denom=8) | DB query | — | — | — | boundary BB |
| AC-QA-DASHBOARD-5 (test results) | card render + 0 state | test run sum unit | DB query | — | — | — | normal + 0 BB |
| AC-QA-DASHBOARD-6 (defect leakage) | card render + 0 state | defect count unit | DB query | — | — | — | normal BB |
| AC-QA-DASHBOARD-7 (release readiness) | badge render | BR-4 unit (7 conditions) | DB query | — | — | — | boundary + state BB |
| AC-QA-DASHBOARD-8 (filter) | filter param binding | filter pass-through unit | filter IT | — | — | E2E filter flow | normal + error BB |
| AC-QA-DASHBOARD-9 (drill-down) | drawer render | controller unit | — | — | — | E2E drill-down | normal BB |
| AC-QA-DASHBOARD-10 (read-only) | no edit elements | no-write assertion | DB audit | — | No write in SQL | E2E visual | permission BB |
| AC-QA-DASHBOARD-11 (from DB) | — | query-only check | DB audit | — | No new table | — | — |
| AC-QA-DASHBOARD-12 (no manual entry) | no input forms | — | — | — | — | E2E visual | — |

---

## 3. Priority

| test item | priority | reason |
|---|---|---|
| BR-2: AC coverage % (zero-denominator) | P0 | Core KPI; divide-by-zero must not reach prod |
| BR-3: Blackbox coverage % (zero-denominator) | P0 | Core KPI; same risk |
| BR-4: Release Readiness 7-condition | P0 | Core KPI; most complex logic |
| 401 unauthenticated | P0 | Security gate |
| `defectLeakageCount` formula | P0 | Confirmed formula uses `status != 'RESOLVED'`; no root_cause_phase |
| Filter params narrowing results | P1 | Filter correctness; regression risk |
| Zero-state for all metrics | P1 | Common state when parser has not yet run |
| DTO field name exact match with FE types | P1 | Contract breakage risk |
| E2E: QA tab loads real data | P1 | Integration smoke test |
| No write SQL in any mapper | P1 | Read-only invariant |
| ArchUnit layer test stays green | P1 | Architecture guard |
| `acceptanceReadyCount = 0` for PoC | P2 | Placeholder; formula Deferred |

---

## 4. Reuse Existing Test

| existing test | path | covers | gap | status |
|---|---|---|---|---|
| `LayerEnforcementTest` (ArchUnit) | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/` | Layer dependency rules for all packages | Must stay green; new QA packages must comply | **PASS** — `mvn clean verify` 2026-06-29 |
| `EvidenceQualityScoreServiceTest` | `EDCAP_BE/src/test/.../quality/` | Service unit test pattern | Pattern followed for `QaDashboardServiceTest` | Existing — unchanged |
| `CiRunMetadataControllerTest` / `EvidenceQualityScoreControllerTest` | `EDCAP_BE/src/test/.../rest/` | Plain unit controller pattern (no `@WebMvcTest`) | Pattern followed for `QaDashboardControllerTest` | Existing — unchanged |
| FE unit tests | `EDCAP_FE/src/__ tests __/qa-dashboard/` | FE unit test structure | 5 test files added covering all QA Dashboard components + page | **PASS — 43 tests (2026-06-30)** |

---

## 5. Additional Tests This Ticket

| test | type | target | related AC | status |
|---|---|---|---|---|
| `QaDashboardServiceTest` — BR-2 AC coverage % normal (3/5=60.0) | BE Unit (JUnit 5 + Mockito) | `QaDashboardService.getSummary` | AC-2 | **PASS** |
| `QaDashboardServiceTest` — BR-2 zero-denominator → 0.0 | BE Unit | `getSummary` when total AC = 0 | AC-2 | **PASS** |
| `QaDashboardServiceTest` — BR-2 rounding (2/3=66.7) | BE Unit | `getSummary` | AC-2 | **PASS** |
| `QaDashboardServiceTest` — BR-3 blackbox placeholder = 0.0 | BE Unit | `blackboxCoveragePercent` | AC-4 | **PASS** |
| `QaDashboardServiceTest` — BR-4 (Release Readiness) | BE Unit | Not yet in service (formula deferred) | AC-7 | **SKIP — not implemented** |
| `QaDashboardServiceTest` — test pass % normal (4/5=80.0) | BE Unit | `testResultsPassPercent` | AC-5 | **PASS** |
| `QaDashboardServiceTest` — test pass % zero-denominator | BE Unit | `testResultsPassPercent` when no test runs | AC-5 | **PASS** |
| `QaDashboardServiceTest` — defect leakage count | BE Unit | `defectLeakageCount` formula | AC-6 | **PASS** |
| `QaDashboardServiceTest` — all KPI = 0 when no data | BE Unit | All metrics zero-state | AC-5, AC-6 | **PASS** |
| `QaDashboardServiceTest` — acceptanceReadyCount = 0 for PoC | BE Unit | Placeholder behavior | AC-7 | **PASS** |
| `QaDashboardServiceTest` — normalize: search > 200 chars → throws | BE Unit | Input validation | AC-8 | **PASS** |
| `QaDashboardServiceTest` — normalize: invalid periodKey → throws | BE Unit | Input validation | AC-8 | **PASS** |
| `QaDashboardServiceTest` — normalize: blank search → null | BE Unit | Input normalization | AC-8 | **PASS** |
| `QaDashboardServiceTest` — normalize: valid periodKey accepted | BE Unit | Input validation | AC-8 | **PASS** |
| `QaDashboardServiceTest` — normalize: page/size clamped | BE Unit | Pagination bounds | AC-8 | **PASS** |
| `QaDashboardControllerTest` — summary() delegates + maps DTO | BE Unit (no `@WebMvcTest`) | Controller thin mapping | AC-1 | **PASS** |
| `QaDashboardControllerTest` — acceptanceCriteria() hasNext=false | BE Unit | Pagination mapping | AC-8 | **PASS** |
| `QaDashboardControllerTest` — acceptanceCriteria() hasNext=true | BE Unit | Multi-page case | AC-8 | **PASS** |
| `QaDashboardControllerTest` — coverageTrend() maps list | BE Unit | Trend DTO mapping | AC-2 | **PASS** |
| DB mapper integration — AC coverage count | API IT (TestContainers) | Adapter queries vs real DB | AC-2 | **NOT_RUN — deferred post-PoC** |
| DB mapper integration — finding count | API IT | `tbl_fact_finding` WHERE status != 'RESOLVED' | AC-6 | **NOT_RUN — deferred post-PoC** |
| DB mapper integration — filter narrows results | API IT | projectId / periodKey SQL filter | AC-8 | **NOT_RUN — deferred post-PoC** |
| No write SQL assertion | Code review | All adapter SQL is SELECT only | AC-10, AC-11 | **PASS — verified by code review in Phase 5** |
| `npx tsc --noEmit` | FE static | `api.ts` + `QADashboardPage.tsx` + all FE files | All | **PASS** (after QaFilterBar bug fix) |
| `utils.test.ts` — buildRecentPeriodOptions (count, format, order) | FE Unit (Vitest) | `buildRecentPeriodOptions`, `acStatusClasses`, `acStatusLabel` | AC-8 | **PASS — 9 tests (2026-06-30)** |
| `QaSummaryCards.test.tsx` — 3 cards render + zero-state | FE Unit (Vitest + RTL) | `QaSummaryCards` component | AC-2, AC-3, AC-5 | **PASS — 6 tests (2026-06-30)** |
| `AcceptanceCriteriaTable.test.tsx` — rows, empty, loading, pagination | FE Unit (Vitest + RTL) | `AcceptanceCriteriaTable` component | AC-3, AC-8 | **PASS — 9 tests (2026-06-30)** |
| `CoverageTrendChart.test.tsx` — title, empty, bars, tooltip | FE Unit (Vitest + RTL) | `CoverageTrendChart` component | AC-5 | **PASS — 7 tests (2026-06-30)** |
| `QADashboardPage.test.tsx` — full page integration | FE Unit (Vitest + RTL) | `QADashboardPage` (API calls, rendering, read-only) | AC-1, AC-2, AC-3, AC-5, AC-8, AC-10, AC-12 | **PASS — 11 tests (2026-06-30)** |
| E2E: S-E2E-1 Dashboard loads — KPI cards and AC table | Playwright (mock-based) | Navigate authenticated → QA Dashboard | AC-1, AC-2 | **IMPL — requires `npm run dev`** |
| E2E: S-E2E-2 Project filter triggers filtered AC request | Playwright (mock-based) | Apply projectId filter → AC query params updated | AC-8 | **IMPL — requires `npm run dev`** |
| E2E: S-E2E-3 Zero-state — empty AC table shows no-data message | Playwright (mock-based) | ZERO_SUMMARY + empty AC response | AC-5, AC-7 | **IMPL — requires `npm run dev`** |
| E2E: S-E2E-4 Read-only — no write controls visible | Playwright (mock-based) | Inspect all elements | AC-10, AC-12 | **IMPL — requires `npm run dev`** |
| E2E: S-E2E-5 Unauthenticated API call returns 401 | Playwright (mock-based) | Direct fetch without auth header | AC-1 | **IMPL — requires `npm run dev`** |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| S-E2E-1: QA Dashboard loads | User authenticated (any role); V4 data exists for ≥1 ticket | 1. Navigate to dashboard area. 2. Click QA tab. 3. Wait for cards to load. | KPI cards show non-zero values; ticket list shows ≥1 row; no error banner | AC-1, AC-2 |
| S-E2E-2: Apply project filter | Same as S-E2E-1; ≥2 projects have ticket data | 1. Open Project filter dropdown. 2. Select a specific project. 3. Wait for update. | Ticket list shows only tickets from that project; KPI cards reflect filtered set | AC-8 |
| S-E2E-3: Zero-state ticket | Ticket exists in `tbl_dim_ticket`; no rows in any fact table for that ticket | 1. Apply filter to show only that ticket. 2. Observe KPI cards. | AC coverage: 0%, blackbox: 0%, PASS: 0, FAIL: 0, defect: 0; no error thrown | AC-5, AC-7 |
| S-E2E-4: Read-only verification | User authenticated | 1. Load QA Dashboard. 2. Inspect all cards, table, and drawer. | No input fields, no edit buttons, no create/delete controls visible | AC-10 |
| S-E2E-5: Unauthenticated direct API call | No session cookie | 1. Call `GET /api/v1/qa/dashboard/summary` directly without auth cookie | HTTP 401 returned; no data in response body | AC-1 |

---

## 6. Areas Intentionally Left Untested This Ticket

| area | reason | risk |
|---|---|---|
| `acceptanceReadyCount` real formula | H-QA-DASHBOARD-4 Deferred; returns `0` for PoC | Low for PoC; medium when formula implemented |
| Export button functionality | Out of scope for PoC (inert button follows PM Dashboard pattern) | Low |
| Coverage Trend chart data accuracy | Trend data grouping by period requires real multi-period data in V4 tables | Medium; track as gap |
| Performance under load (P95 < 2s) | Load test deferred post-PoC (spec §6.6) | Medium; revisit after PoC acceptance |
| Browser compatibility (Firefox, Edge) | Manual testing only on Chrome for PoC | Low |
| Ticket Detail drawer full data accuracy | Drawer reads from same endpoints; full data accuracy test deferred | Medium |

---

## 7. Data Testing Principles

- Use synthetic/test data only — no production database.
- Seed V4 tables with known counts to verify aggregation formulas:
  - e.g., 5 AC rows: 3 COVERED, 2 NOT_TESTED → expect `acTestCoveragePercent = 60.0`, `acNotTestedCount = 2`.
  - e.g., 4 of 8 viewpoints covered → expect `blackboxCoveragePercent = 50.0`.
  - e.g., 2 findings: 1 RESOLVED, 1 OPEN → expect `defectLeakageCount = 1`.
- Test zero-state: no rows in fact tables → all KPI = 0.
- Test filter: seed data for 2 projects; verify each project filter returns only its data.
- Do not use personal identifiable information in test data.
- Do not commit test credentials or seed passwords to repository.

---

## 8. Execution Commands

| command | purpose | result (2026-06-30) |
|---|---|---|
| `mvn test -Dtest=QaDashboardServiceTest,QaDashboardControllerTest` | BE unit tests for new classes | **PASS — 19 tests** |
| `mvn clean verify` (inside `EDCAP_BE/`) | Full BE build + ArchUnit + all tests | **PASS — 79 tests** |
| `npx tsc --noEmit` (inside `EDCAP_FE/`) | FE type checking | **PASS — 0 errors** |
| `npm run test:unit` (inside `EDCAP_FE/`) | FE unit tests — all 28 files | **PASS — 198 tests (43 new QA Dashboard tests)** |
| `npx playwright test e2e_tests/tests/qa-dashboard/` | QA Dashboard E2E (mock-based) | NOT_RUN — requires `npm run dev` |

---

## 9. Stop Condition

- Stop if `mvn clean verify` fails on ArchUnit — fix layer violation before proceeding.
- Stop if `npm run typecheck` shows DTO field name mismatch — surface as open issue.
- Stop if integration test shows a V4 column name does not exist — do not mock around it; fix the mapper.
- Stop if any mapper XML contains INSERT/UPDATE/DELETE — remove immediately; this is a Blocker.

---

## 10. Required Human Decision

| decision | impact on tests | status |
|---|---|---|
| H-QA-DASHBOARD-4: `acceptanceReadyCount` formula (Deferred) | Once decided, add dedicated unit test for the formula; E2E test must verify non-zero value | **Open — Deferred** |
| Manual browser smoke test before merge | Required: load QA tab, apply filter, verify 0-state for ticket with no parsed data | **Pending human action** |
