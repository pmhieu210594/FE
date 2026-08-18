# Test Plan

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-07-01
**Author**: Claude (Phase 6 Test Plan)
**Update date**: 2026-07-01

## 1. Purpose

Decide the test type required per AC, implement the minimum test code needed to close the
"no test file exists yet for DevDashboard" gap flagged in `self-review.md` §8, and record
execution results. This round covers **FE Unit Tests and FE E2E Tests only**, per explicit
scope instruction. BE UT / API IT / DB test items are judged and listed for completeness but
are **not implemented in this round** — tracked as pending, not silently dropped.

## 2. AC Matrix ↔ Test Type

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-DEV-DASHBOARD-1 Dashboard displayed | Yes (done) | Judged needed — pending | — | — | — | Yes (done) | Yes |
| AC-DEV-DASHBOARD-2 CI Failures displayed | Yes (done) | Judged needed — pending | — | — | — | Yes (done) | Yes |
| AC-DEV-DASHBOARD-3 Review Findings displayed | Yes (done) | Judged needed — pending | — | — | — | Yes (done) | Yes |
| AC-DEV-DASHBOARD-4 Parser Errors displayed | Yes (done) | Judged needed — pending | — | — | — | Yes (done) | Yes |
| AC-DEV-DASHBOARD-5 Dashboard filtering works | Yes (done) | Judged needed — pending | Judged needed — pending | — | — | Yes (done) | Yes |
| AC-DEV-DASHBOARD-6 Ticket drill-down | Yes (done) | Judged needed — pending | Judged needed — pending | — | — | Yes (done) | Yes |
| AC-DEV-DASHBOARD-7 Dashboard is read-only | Yes (done) | Judged needed — pending | Judged needed — pending | — | — | Yes (done) | Yes |
| AC-DEV-DASHBOARD-8 Existing DB tables reused | Not applicable (FE) | Not applicable | — | — | Judged needed — pending | — | Code Review only |

## 3. Priority

| test item | priority | reason |
|---|---|---|
| DevSummaryCards FE UT | Blocker | Directly verifies AC-2/3/4 KPI rendering incl. zero-state (spec-pack §8.3) |
| DevFilterBar FE UT | Major | Verifies AC-5 filter wiring at component level |
| DevTicketTable FE UT | Blocker | Verifies AC-1 rendering, AC-6 row-click contract, empty-state |
| DevTicketDetailDrawer FE UT | Major | Verifies AC-6 drill-down content and AC-7 read-only (no inputs) |
| DevelopmentDashboardPage FE UT | Blocker | End-to-end FE integration: AC-1/2/3/4/5/6/7 wired through real API layer (mocked) |
| dev-dashboard E2E (Playwright) | Blocker | Black-box confirmation across the full rendered app for AC-1/2/3/4/5/6/7 and boundary case |
| BE Service/Controller/Repository tests | Blocker (deferred) | Required by impact-analysis.md §11 but out of this round's scope; tracked as pending, not skipped |

## 4. Reuse Existing Test

| existing test | path | covers | gap |
|---|---|---|---|
| QaSummaryCards.test.tsx | `src/__ tests __/qa-dashboard/QaSummaryCards.test.tsx` | Pattern reused for DevSummaryCards (KPI card rendering, zero-state) | None — pattern only, no shared assertions |
| QADashboardPage.test.tsx | `src/__ tests __/qa-dashboard/QADashboardPage.test.tsx` | Pattern reused for DevelopmentDashboardPage (QueryClientProvider + MemoryRouter + vi.spyOn on `endpoints`) | None — pattern only |
| qa-dashboard.spec.ts / PmDashboardPage.ts / QaDashboardPage.ts | `e2e_tests/tests/qa-dashboard/`, `e2e_tests/pages/` | Pattern reused for DevDashboardPage.ts + dev-dashboard.spec.ts (route mocking, LIFO route order, antd Drawer locators) | None — pattern only |
| 382 existing BE tests + `ArchitectureTest` | `EDCAP_BE/src/test/**` | Regression safety net; confirmed green in self-review.md | Contains no DevDashboard-specific assertions (expected — different scope) |

## 5. Additional Test This Time

| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| AC-DEV-DASHBOARD-1-FE-1 | Renders 3 KPI cards + i18n title keys | FE UT | DevSummaryCards.tsx | AC-1 |
| AC-DEV-DASHBOARD-2-FE-1 | CI Failure count renders from summary prop | FE UT | DevSummaryCards.tsx | AC-2 |
| AC-DEV-DASHBOARD-3-FE-1 | Review Finding count renders from summary prop | FE UT | DevSummaryCards.tsx | AC-3 |
| AC-DEV-DASHBOARD-4-FE-1 | Parser Error count renders from summary prop | FE UT | DevSummaryCards.tsx | AC-4 |
| AC-DEV-DASHBOARD-1-FE-2 | Zero-state: all 3 cards show 0 | FE UT | DevSummaryCards.tsx | AC-1 (boundary) |
| AC-DEV-DASHBOARD-5-FE-1 | Project/Repository/CI-status selects render options and fire onChange with correct partial filter | FE UT | DevFilterBar.tsx | AC-5 |
| AC-DEV-DASHBOARD-1-FE-3 | Ticket rows render; total count badge; column values | FE UT | DevTicketTable.tsx | AC-1 |
| AC-DEV-DASHBOARD-1-FE-4 | Empty ticket list shows empty-state text | FE UT | DevTicketTable.tsx | AC-1 (boundary) |
| AC-DEV-DASHBOARD-6-FE-1 | Row click invokes `onRowClick(ticketId)` | FE UT | DevTicketTable.tsx | AC-6 |
| AC-DEV-DASHBOARD-5-FE-2 | Pagination Prev/Next call `onPageChange` correctly, hidden on single page | FE UT | DevTicketTable.tsx | AC-5 |
| AC-DEV-DASHBOARD-6-FE-2 | Drawer renders ticket key, CI runs, review comments, parser broken-links | FE UT | DevTicketDetailDrawer.tsx | AC-6 |
| AC-DEV-DASHBOARD-4-FE-2 | Drawer shows "No parser errors" when traceability has no broken links | FE UT | DevTicketDetailDrawer.tsx | AC-4 |
| AC-DEV-DASHBOARD-7-FE-1 | Drawer and full page contain no `<input>`/`<textarea>` write controls | FE UT | DevTicketDetailDrawer.tsx, DevelopmentDashboardPage.tsx | AC-7 |
| AC-DEV-DASHBOARD-1-FE-5 | Full page: summary/options/tickets APIs called on mount, KPI + ticket row rendered | FE UT | DevelopmentDashboardPage.tsx | AC-1 |
| AC-DEV-DASHBOARD-5-FE-3 | Changing CI status filter re-issues `tickets` call with `ciStatus` param | FE UT | DevelopmentDashboardPage.tsx | AC-5 |
| AC-DEV-DASHBOARD-6-FE-3 | Clicking a row calls `detail(ticketId)` and opens drawer | FE UT | DevelopmentDashboardPage.tsx | AC-6 |
| S-E2E-1 | Dashboard loads, 3 KPI cards + ticket row visible | E2E | Full app (mock-based) | AC-1, AC-2, AC-3, AC-4 |
| S-E2E-2 | Project filter → tickets request carries `projectId` | E2E | Full app | AC-5 |
| S-E2E-3 | CI status filter → tickets request carries `ciStatus` | E2E | Full app | AC-5 |
| S-E2E-4 | Row click opens drawer with ticket key + CI run + no editable inputs | E2E | Full app | AC-6, AC-7 |
| S-E2E-5 | Zero-state: 0 KPI values + empty ticket table | E2E | Full app | Boundary (spec-pack §8.3) |
| S-E2E-6 | No edit/delete/create buttons, no free-text inputs, Export button present | E2E | Full app | AC-7 |
| S-E2E-7 | Unauthenticated direct API call → 401 | E2E | Full app | AC-1 (existing auth reused) |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| S-E2E-1 | Mocked auth + dashboard APIs return non-empty data | Navigate to `/en/development-dashboard` | Title, 3 KPI card titles, and ≥1 ticket row visible | AC-1, AC-2, AC-3, AC-4 |
| S-E2E-2 | S-E2E-1 loaded | Select `proj-1` in project filter | New `tickets` request fired with `projectId=proj-1` | AC-5 |
| S-E2E-3 | S-E2E-1 loaded | Select `FAIL` in CI status filter | New `tickets` request fired with `ciStatus=FAIL` | AC-5 |
| S-E2E-4 | S-E2E-1 loaded | Click first ticket row | Drawer opens, title shows ticket key, CI run visible, 0 `input`/`textarea` inside drawer | AC-6, AC-7 |
| S-E2E-5 | Mocked APIs return zero summary + empty ticket page | Navigate to dashboard | Empty-state text shown, 0 ticket rows, "0" KPI value visible | Boundary |
| S-E2E-6 | S-E2E-1 loaded | Inspect DOM | 0 edit/delete/create buttons, 0 free-text inputs, Export button visible | AC-7 |
| S-E2E-7 | No auth token | Direct `fetch` to summary endpoint | HTTP 401 | AC-1 |

## 6. Areas intentionally left untested this time

| area | reason | risk |
|---|---|---|
| BE Service/Controller/Repository unit & integration tests | Out of scope for this round per explicit user instruction ("FE UT và e2e FE"); already tracked as Accepted Risk in self-review.md §8 | Medium — BE aggregation logic (AC-2/3/4 counts, AC-7 read-only at code level, AC-8 table reuse) remains unverified by automated test until BE round runs |
| `parserStatus` per-ticket filter behavior | `tbl_fact_data_quality` has no `ticket_id` — pre-existing Accepted Risk in self-review.md | Medium, owner PM |
| CI Failure grouping/categorization | Open Issue OI-DEV-DASHBOARD-3; flat count implemented, grouping not in scope | Low |
| Parser Warning KPI | Open Issue OI-DEV-DASHBOARD-4; not counted this ticket | Low |
| CSV export content correctness (column values, encoding) | Only button-presence is verified in FE UT/E2E; byte-level CSV content not asserted | Low |
| Performance / load testing | NFR table marks verification = "Manual"; no dedicated perf test this ticket | Low |
| Locale coverage for `vi` / `ja` | Tests run against `en` fixtures only (i18next mocked or fallback-key rendering) | Low |

## 7. Data testing principles

* FE Unit Tests (Vitest): static, in-memory fixture objects matching `DevDashboardSummary` /
  `DevDashboardOptions` / `DevTicketRow` / `DevTicketDetail` types; no network, no DB. `react-i18next`
  is mocked to return the raw key so assertions are independent of locale JSON content.
* FE E2E (Playwright): `page.route()` intercepts every `**/api/v1/dev/dashboard/**` and
  `**/api/v1/traceability/**` call with fixture JSON bodies; no live backend or DB required.
  Auth is mocked via a fake bearer token in `localStorage` + intercepted `/api/v1/auth/me`.
* No production data, no PII, no real credentials are used anywhere in these tests.
* Zero-record fixture sets (`ZERO_SUMMARY`, `TICKETS_EMPTY_RESPONSE`) are used to cover the
  spec-pack §8.3 boundary case (no CI/Review/Parser data → dashboard still renders, KPIs show 0).

## 8. Execution command

| command | purpose |
|---|---|
| `npm run test:unit -- development-dashboard` (or `npx vitest run "src/__ tests __/dev-dashboard"`) | Run the 5 new FE UT files |
| `npm run test:e2e -- dev-dashboard` | Run the new Playwright E2E spec (auto-starts Vite dev server per `playwright.config.ts`) |

## 9. Stop Condition

* Stop and ask if a FE UT requires a locale/translation key that doesn't exist in
  `public/locales/en/locale.json` (would indicate a spec/implementation gap, not a test gap).
* Stop if Playwright cannot resolve `/#/en/development-dashboard` (routing regression).
* Stop if BE round is later required and existing 382 BE tests regress — do not silently
  extend scope to fix BE code from a test-writing task.

## 10. Required Human Decision

* Confirm whether BE UT / API IT / DB test round (AC matrix column "Judged needed — pending")
  should be scheduled as a follow-up Phase 6 pass, given impact-analysis.md §11 lists Dashboard
  Service/Repository/API tests as required.
* H-DEV-DASHBOARD-1 / H-DEV-DASHBOARD-2 (CI Failure categorization, Parser Error severity) remain
  Open per spec-pack.md — no test added for hypothetical future categorization behavior.
