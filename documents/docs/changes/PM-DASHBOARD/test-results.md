# Test Results

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: claude-sonnet-4-6
**Update date**: 2026-06-26 (Phase 6 — Test Plan / Test Code)

---

## 1. Execution Environment

| item | value |
|---|---|
| Phase | 6 — Test Plan / Test Code |
| BE test runtime | JUnit 5 + Mockito via Maven Surefire 3.5.4 |
| FE test runtime | Vitest v3.2.6 (jsdom environment) |
| E2E test runtime | Playwright (Chromium) — mock-based, no live backend |
| Java | OpenJDK 21 (HotSpot) |
| Node | project-local (EDCAP_FE) |
| DB | Not run (API IT deferred) |

---

## 2. Executed Commands

| # | command | cwd | result | tests |
|---|---|---|---|---|
| 1 | `mvn test -Dtest="PmDashboardServiceTest,PmDashboardControllerTest" -DskipITs` | `EDCAP_BE/` | PASS | 20 |
| 2 | `npx vitest run "src/__ tests __/pm-dashboard/utils.test.ts"` | `EDCAP_FE/` | PASS | 20 |
| 3 | `npx vitest run "src/__ tests __/pm-dashboard/PMDashboardPage.test.tsx"` | `EDCAP_FE/` | PASS | 1 |
| 4 | `npx vitest run "src/pages/pm-dashboard/components/TicketDetailDrawer.test.tsx"` | `EDCAP_FE/` | PASS | 1 |
| 5 | `npx playwright test e2e_tests/tests/pm-dashboard/pm-dashboard.spec.ts --reporter=line` | `EDCAP_FE/` | PASS | 5 |

---

## 3. Summary of Results

| layer | tests run | passed | failed | skipped | verdict |
|---|---|---|---|---|---|
| BE UT — PmDashboardServiceTest | 10 | 10 | 0 | 0 | PASS |
| BE Web slice — PmDashboardControllerTest | 10 | 10 | 0 | 0 | PASS |
| FE UT — utils.test.ts | 20 | 20 | 0 | 0 | PASS |
| FE Component — PMDashboardPage.test.tsx | 1 | 1 | 0 | 0 | PASS |
| FE Component — TicketDetailDrawer.test.tsx | 1 | 1 | 0 | 0 | PASS |
| E2E — pm-dashboard.spec.ts | 5 | 5 | 0 | 0 | PASS |
| API IT | 0 | 0 | 0 | 0 | SKIPPED |
| **Total** | **47** | **47** | **0** | **0** | **PASS** |

---

## 4. List of Passes

### BE — PmDashboardServiceTest (10 tests)

| test name | AC covered |
|---|---|
| `summary_requiresPmRole` | AC-11 |
| `insights_requiresPmRole` | AC-11 |
| `summary_normalizesFiltersAndDelegatesToRepository` | AC-2/3 |
| `insights_normalizesFiltersAndDelegatesToRepository` | AC-2 |
| `detail_returnsNotFoundWhenSnapshotMissing` | AC-9 |
| `exportDelegatesWithMaxPageSizeForCsv` | export |
| `tickets_requiresPmRole` | AC-11 |
| `detail_requiresPmRole` | AC-11 |
| `refresh_requiresPmRole` | AC-12 |
| `tickets_normalizesFiltersAndDelegatesToRepository` | AC-3/4 |

### BE — PmDashboardControllerTest (10 tests)

| test name | AC covered |
|---|---|
| `summary_returnsDashboardSummaryDto` | AC-1/2 |
| `insights_returnsInsightsDto` | AC-2 |
| `tickets_returnsPageDto` | AC-3 |
| `detail_returns404WhenServiceRejectsMissingTicket` | AC-9 |
| `export_returnsCsvAttachment` | export |
| `refresh_returnsPayload` | AC-12 |
| `summary_mapsForbidden` | AC-11 |
| `detailReturns200WithEqsAndScoreBreakdown` | AC-7/8/9 |
| `ticketsPassesSearchParamToService` | AC-4 |
| `refreshMapsForbidden` | AC-11/12 |

### FE — utils.test.ts (20 tests)

| group | test | AC covered |
|---|---|---|
| scoreBandClasses | maps all 5 bands to non-empty class string | AC-7 |
| scoreBandClasses | EXCELLENT→emerald, CRITICAL→rose | AC-7 |
| riskClasses | HIGH→orange, CRITICAL→rose | AC-6 |
| riskClasses | INFO→slate, LOW→sky (new) | AC-6 |
| formatScore | integer 0, 100, 68 → string without decimals | AC-7 boundary |
| formatScore | decimal 78.25 → "78.25" | AC-7 boundary |
| formatScore | null → "-" | AC-7 boundary |
| ageLabel | 0 and negative → "0d" | spec boundary |
| ageLabel | 1 → "1d", 14 → "14d" | spec boundary |
| buildEvidenceBottleneck | excludes rows with missingEvidenceCount = 0 | AC-2/5 |
| buildEvidenceBottleneck | groups by repositoryId and sums counts | AC-2/5 |
| buildEvidenceBottleneck | sorts by descending missing evidence count | AC-2/5 |
| parseFilters (new) | all params parsed correctly from URLSearchParams | AC-3/4 |
| parseFilters (new) | absent params → empty-string defaults, page=1, size=20 | AC-3/4 |
| parseFilters (new) | page=0/negative/non-numeric → clamped to 1 | AC-3 boundary |
| parseFilters (new) | size=0→1, size=150→100, size=50→50 | AC-3 boundary |
| buildSearchParams (new) | default values (empty, page=1, size=20) omitted from output | AC-3 |
| buildSearchParams (new) | non-default values included in output | AC-3 |
| scoreBandLabel (new) | returns band string when provided | AC-7 |
| scoreBandLabel (new) | returns "-" for null | AC-7 |

### FE Component — PMDashboardPage.test.tsx (1 test)

| test | AC covered |
|---|---|
| `loads dashboard data first and fetches detail only after clicking a ticket` | AC-1/9 |

### FE Component — TicketDetailDrawer.test.tsx (1 test)

| test | AC covered |
|---|---|
| `shows only the missing sections summary for parser traceability errors` | AC-8/9 |

### E2E — pm-dashboard.spec.ts (5 tests, mock-based)

| test | AC covered |
|---|---|
| `1. Dashboard loads with KPI cards and ticket table visible` | AC-1, AC-2 |
| `2. Search updates the ticket table` | AC-4 |
| `3. Clicking a ticket row opens the read-only detail drawer` | AC-9 |
| `4. Empty state is shown when no tickets match filters` | AC-1, AC-3 |
| `5. Dashboard exposes no write action` | AC-13 |

Key implementation notes:
- All API calls intercepted via `page.route()` — Playwright LIFO route ordering applied (more-specific globs registered last)
- `EvidenceQualityScoreResponse` and `TraceabilityResponse` endpoints mocked so the drawer renders without network errors
- Drawer title ("EC-42") asserted via `.ant-drawer-title` locator; drawer body via `.ant-drawer-body`
- Bug found during E2E authoring: `TicketDetailDrawer` fires two sub-queries (`evidenceQualityScores.getLatest`, `traceability.get`) not mocked by the initial helper — added to `mockDashboardApis`

---

## 5. Warnings (non-blocking)

Both FE component test suites emit two known jsdom/ant-design warnings. Tests pass regardless.

| warning | source | action |
|---|---|---|
| `[antd: Drawer] width is deprecated. Please use size instead.` | Drawer component uses deprecated `width` prop | Note for future Drawer prop migration; no test impact |
| `Error: Not implemented: window.getComputedStyle(elt, pseudoElt)` | antd Drawer's scroll-bar measurement (`useScrollLocker`) calls `getComputedStyle` on a pseudo-element which jsdom does not implement | Known jsdom limitation; tests pass regardless; no action needed |

---

## 6. Bug Found and Fixed During Test Phase

### Bug: `parseFilters` treated `size=0` as absent — returned default 20 instead of clamping to 1

**File**: `EDCAP_FE/src/pages/pm-dashboard/utils.ts`

**Root cause**: The expression `Number(searchParams.get("size") ?? "20") || 20` uses the `||` idiom to fall back to the default value. Because `Number("0") = 0` is falsy, `0 || 20` evaluates to `20`, so an explicit `?size=0` in the URL was treated as "no size provided" rather than being clamped to the minimum.

**Spec expectation** (spec-pack §6.2): `size` — Min 1, max 100; default 20.

**Fix applied** — explicit null check before numeric coercion:

```typescript
// Before
size: Math.min(
  Math.max(Number(searchParams.get("size") ?? "20") || 20, 1),
  100,
),

// After
size: (() => {
  const raw = searchParams.get("size");
  if (raw === null) return 20;           // absent param → default
  const n = Number(raw);
  return Math.min(Math.max(Number.isNaN(n) ? 20 : n, 1), 100);
})(),
```

**Behaviour table after fix**:

| input | before | after | correct? |
|---|---|---|---|
| absent | 20 | 20 | ✓ |
| `"0"` | 20 | 1 | ✓ |
| `"abc"` | 20 | 20 | ✓ |
| `"150"` | 100 | 100 | ✓ |
| `"50"` | 50 | 50 | ✓ |

**Fail history for this bug**:

| run | test | result | reason |
|---|---|---|---|
| Run 1 | `parseFilters > clamps size to range 1–100` | FAIL | `size=0` returned `20` — `|| 20` idiom treats `0` as falsy |
| Run 2 (first fix attempt) | `parseFilters > defaults to empty strings and page=1 size=20 when params are absent` | FAIL | `Number(null) = 0`, absent-param case incorrectly returned `1` instead of `20` |
| Run 3 (correct fix) | all 20 | PASS | Explicit `raw === null` guard before coercion |

---

## 7. Tests Not Executed and Reason

| test / area | reason | risk | alternative evidence |
|---|---|---|---|
| API Integration (DB) | No test DB or snapshot fixture configured; `tbl_fact_ticket_dashboard_snapshot` not in any test seed | KPI count correctness against real rows unverified | Service mocks cover logic path |
| Score band boundary | H-PM-DASHBOARD-2: thresholds 90/75/60/40 unconfirmed | Wrong band possible at exact threshold boundary | Deferred to post-confirmation |
| EQS formula sub-score computation | OI-PM-DASHBOARD-1: no formula defined in `tbl_dim_metric_definition` | Sub-score values unverifiable end-to-end | DTO field presence tested in `detailReturns200WithEqsAndScoreBreakdown` |
| `buildAttentionItems` | Function not implemented in utils.ts (JSDoc comment only; no body) | AC-5/6 partial — covered via `buildEvidenceBottleneck` and controller tests | Track as tech-debt if PM attention items view is added |
| Export file content beyond header | OI-PM-DASHBOARD-7: CSV is PoC; column list not formally signed off | Column list may change | `export_returnsCsvAttachment` verifies content-type and header row |
| Waiting Review KPI count | OI-PM-DASHBOARD-4: definition pending | KPI card may show 0 or incorrect value | `waitingReviewFlag` field exists in snapshot schema |
| Exception badge | OI-PM-DASHBOARD-5: no DB concept defined | Badge always 0 | `exceptionCount` field present in model |
| E2E against live backend | E2E suite uses mock API routes; no real Spring Boot instance exercised | Real DB joins, auth middleware, and network not validated end-to-end | Mock-based E2E covers UI rendering and route params; BE tested via unit + slice |

---

## 8. Remaining Risk

| risk | severity | owner | deadline |
|---|---|---|---|
| EQS formula undefined → sub-score validation impossible | Medium | Product / Architect | Pending (OI-1) |
| Score band thresholds unconfirmed → boundary mismatch possible | Medium | Product | Pending (H-2) |
| E2E mock-only → live auth/DB path not covered | Low | QA | Pre-release live smoke test |
| No API IT → DB query correctness unverified | Medium | Dev | Next sprint |
| `buildAttentionItems` not implemented → attention-item view not fully covered | Low | Dev | If PM attention panel is added |
| Export column list not signed off → CSV content may change silently | Low | Product | Pending (OI-7) |

---

## 9. Final Test Verdict

**PASS** — 47 / 47 tests pass. One bug found (parseFilters size clamp) and fixed during this phase.
E2E suite (5 tests, mock-based) added and fully passing.
Skipped areas have documented reasons and accepted risks.

Surefire report path: `EDCAP_BE/target/surefire-reports/`
- `TEST-com.sdd.platform.application.usecase.pmdashboard.PmDashboardServiceTest.xml`
- `TEST-com.sdd.platform.web.rest.PmDashboardControllerTest.xml`

---

## 10. Blackbox Test Case Execution Status

Legend:
- **COVERED-AUTO** — directly validated by the automated test suite (unit / slice / E2E mock)
- **PARTIAL-AUTO** — logic or DTO path tested by automation; full scenario requires live backend + DB
- **NOT-EXECUTED** — requires live environment, real auth middleware, or DB fixtures; deferred to manual smoke test
- **BLOCKED** — test cannot be written or run until a named open issue / human decision is resolved

| BB case | title (abbreviated) | status | automated coverage | blocking reason |
|---|---|---|---|---|
| BB-001 | PM loads dashboard — KPI cards visible | COVERED-AUTO | E2E-1, BE web `summary_returnsDashboardSummaryDto` | — |
| BB-002 | Unauthenticated → HTTP 401 | PARTIAL-AUTO | BE web `summary_mapsForbidden` validates 403 shape; 401 path handled by Spring Security config, not in PM Dashboard test suite | Live auth middleware not exercised |
| BB-003 | Non-PM → HTTP 403 | COVERED-AUTO | BE UT `summary_requiresPmRole`; BE web `summary_mapsForbidden` | — |
| BB-004 | No snapshot data → HTTP 200 empty | COVERED-AUTO | E2E-4 (empty state); BE web `tickets_returnsPageDto` empty stub | — |
| BB-005 | All 8 KPI cards with numeric values | PARTIAL-AUTO | E2E-1 checks card visibility; numeric values against real DB rows not verified | No API IT |
| BB-006 | KPI cards all 0 when filter matches nothing | PARTIAL-AUTO | E2E-4 checks empty state; KPI 0 from real DB not verified | No API IT |
| BB-007 | Phase bottleneck chart visible + populated | PARTIAL-AUTO | E2E-1 checks UI section; real bottleneck data not verified | No API IT |
| BB-008 | Each individual filter narrows ticket list | PARTIAL-AUTO | BE UT `tickets_normalizesFilters`; FE UT `parseFilters`, `buildSearchParams` — DB filter correctness not verified | No API IT |
| BB-009 | Multiple filters AND intersection | PARTIAL-AUTO | BE UT covers filter forwarding; AND logic at DB level not verified | No API IT |
| BB-010 | Invalid scoreBand → HTTP 400 VALIDATION_ERROR | NOT-EXECUTED | No explicit 400 validation test in PM Dashboard suite | Manual test required |
| BB-011 | 0-result filter → empty state + reset prompt | COVERED-AUTO | E2E-4 | — |
| BB-012 | Search by ticket ID — case-insensitive | PARTIAL-AUTO | BE UT `tickets_normalizesFilters` (search trimmed), `ticketsPassesSearchParamToService`; DB ILIKE not verified | No API IT |
| BB-013 | Search by title — case-insensitive | PARTIAL-AUTO | Same as BB-012; title search at DB level not verified | No API IT |
| BB-014 | Search by repository name | PARTIAL-AUTO | Same as BB-012; repository search at DB level not verified | No API IT |
| BB-015 | Empty search → unfiltered list | COVERED-AUTO | FE UT `parseFilters` (absent param → default); BE UT `tickets_normalizesFilters` | — |
| BB-016 | Whitespace search → no filter | COVERED-AUTO | BE UT `tickets_normalizesFilters` (search trimmed to empty) | — |
| BB-017 | 255-char search accepted (no HTTP 400) | NOT-EXECUTED | No explicit max-length test in suite | Manual test required |
| BB-018 | Ticket with missing evidence shows signal | PARTIAL-AUTO | BE web `detailReturns200WithEqsAndScoreBreakdown` (missingEvidenceCount field); FE UT `buildEvidenceBottleneck` | Real DB join not verified |
| BB-019 | 0 missing evidence — row present, no signal | PARTIAL-AUTO | FE UT `buildEvidenceBottleneck` (excludes 0-count rows from bottleneck chart); row presence in list not verified against DB | No API IT |
| BB-020 | All evidence missing — count = total required | PARTIAL-AUTO | BE web `detailReturns200WithEqsAndScoreBreakdown`; T-ZERO fixture values not verified against real `tbl_dim_artifact_type` | No API IT |
| BB-021 | Single OPEN risk → severity badge in drawer | PARTIAL-AUTO | BE web `detailReturns200WithEqsAndScoreBreakdown` (riskCount, highestRiskSeverity fields present) | Real DB join not verified |
| BB-022 | Multiple OPEN risks → badge shows highest severity | NOT-EXECUTED | No explicit multi-risk highest-severity test in suite | Manual test required |
| BB-023 | No OPEN risks → badge absent or shows None | PARTIAL-AUTO | FE UT `riskClasses` covers all severity classes; riskCount = 0 in some fixtures | UI rendering of "None" not verified in E2E |
| BB-024 | EQS numeric + score_band both visible | COVERED-AUTO | FE UT `scoreBandClasses`, `formatScore`, `scoreBandLabel`; BE web `detailReturns200WithEqsAndScoreBreakdown` | — |
| BB-025 | EQS = 0 → score_band = CRITICAL | PARTIAL-AUTO | FE UT `scoreBandClasses` (CRITICAL→rose); T-ZERO fixture; DB row not verified end-to-end | No API IT |
| BB-026 | EQS = 100 → score_band = EXCELLENT | PARTIAL-AUTO | FE UT `scoreBandClasses` (EXCELLENT→emerald); T-ALL-OK fixture | No API IT |
| BB-027 | EQS on exact band boundary | BLOCKED | — | H-PM-DASHBOARD-2 (thresholds 90/75/60/40 unconfirmed) |
| BB-028 | Detail drawer shows all sub-score labels + values | COVERED-AUTO | BE web `detailReturns200WithEqsAndScoreBreakdown` (specScore, planScore fields); FE `TicketDetailDrawer.test` | — |
| BB-029 | All sub-scores = 0 — all fields present | PARTIAL-AUTO | T-ZERO fixture; `detailReturns200WithEqsAndScoreBreakdown` covers field presence; all-zero rendered in UI not verified | No E2E for T-ZERO |
| BB-030 | Click row → drawer opens with metadata | COVERED-AUTO | E2E-3; `PMDashboardPage.test` (click → detail fetch) | — |
| BB-031 | Drawer has evidence list, risk, breakdown, link | COVERED-AUTO | BE web `detailReturns200WithEqsAndScoreBreakdown`; `TicketDetailDrawer.test` | — |
| BB-032 | Unknown ticket UUID → HTTP 404 NOT_FOUND | COVERED-AUTO | BE UT `detail_returnsNotFoundWhenSnapshotMissing`; BE web `detail_returns404WhenServiceRejectsMissingTicket` | — |
| BB-033 | owner_display is pseudonym — no real name | COVERED-AUTO | BE UT (`owner via pseudonym snapshot` assertion); self-review bug fix confirmed | — |
| BB-034 | No email / user ID / ranking anywhere | PARTIAL-AUTO | Service logic tested for pseudonym; no DOM scan or full JSON scan in E2E | Manual DOM inspection required |
| BB-035 | No export button without export permission | NOT-EXECUTED | UI permission rendering not tested against real auth | Manual test required |
| BB-036 | Export button rendered with export permission | NOT-EXECUTED | UI permission rendering not tested against real auth | Manual test required |
| BB-037 | POST /export without permission → HTTP 403 | PARTIAL-AUTO | BE UT role gate (`exportDelegatesWithMaxPageSizeForCsv` tests happy path; role check tested for other endpoints); fine-grained export-permission 403 not explicitly tested | Fine-grained permission not confirmed |
| BB-038 | Export creates audit log entry | BLOCKED | — | OI-PM-DASHBOARD-7 (export format and audit policy not finalized) |
| BB-039 | No refresh button without refresh permission | NOT-EXECUTED | UI permission rendering not tested against real auth | Manual test required |
| BB-040 | Refresh button rendered with refresh permission | NOT-EXECUTED | UI permission rendering not tested against real auth | Manual test required |
| BB-041 | POST /refresh without permission → HTTP 403 | COVERED-AUTO | BE UT `refresh_requiresPmRole`; BE web `refreshMapsForbidden` | — |
| BB-042 | No edit / upload / delete control anywhere | COVERED-AUTO | E2E-5 (no write button); no PUT/DELETE/PATCH routes registered | — |
| BB-043 | 4xx/5xx responses include traceId | PARTIAL-AUTO | Standard `ErrorResponse` shape used; traceId field verified in existing auth tests; not explicitly in PM Dashboard suite | Manual verification recommended |
| BB-044 | Upstream failure during refresh → HTTP 503 | NOT-EXECUTED | Upstream failure scenario not mocked in test suite | Manual test required |
| BB-045 | Last updated timestamp visible on dashboard | NOT-EXECUTED | `lastUpdatedAt` field in DTO; UI rendering not verified in E2E | Manual test required |
| BB-046 | Stale snapshot → staleness warning; no blank page | NOT-EXECUTED | T-STALE fixture defined; no staleness logic tested in E2E | Manual test required |
| BB-047 | age_days = 0 displayed as "0d" or "Today" | COVERED-AUTO | FE UT `ageLabel` (0 and negative → "0d") | — |
| BB-048 | Pagination last page — correct rows, has_next=false | PARTIAL-AUTO | FE UT `parseFilters` (page/size clamp); BE service forwards pagination; DB pagination not verified | No API IT |
| BB-049 | Page beyond last → empty list, totalCount unchanged | PARTIAL-AUTO | FE UT `parseFilters` boundary; DB behavior not verified | No API IT |
| BB-050 | Waiting Review KPI count | BLOCKED | — | OI-PM-DASHBOARD-4 (waiting_review definition pending) |
| BB-051 | Exception badge in drawer | BLOCKED | — | OI-PM-DASHBOARD-5 (exception concept has no DB backing) |

### BB Coverage Summary

| status | count | % |
|---|---|---|
| COVERED-AUTO | 15 | 29% |
| PARTIAL-AUTO | 22 | 43% |
| NOT-EXECUTED | 10 | 20% |
| BLOCKED | 4 | 8% |
| **Total** | **51** | **100%** |

Pre-release actions required:
1. Manual smoke test against live stack for all NOT-EXECUTED cases (BB-010, BB-017, BB-022, BB-035, BB-036, BB-039, BB-040, BB-044, BB-045, BB-046).
2. Re-run PARTIAL-AUTO cases via API IT once a test DB fixture is configured for `tbl_fact_ticket_dashboard_snapshot`.
3. Re-activate BLOCKED cases after OI-PM-DASHBOARD-4, OI-PM-DASHBOARD-5, OI-PM-DASHBOARD-7, and H-PM-DASHBOARD-2 are resolved.
