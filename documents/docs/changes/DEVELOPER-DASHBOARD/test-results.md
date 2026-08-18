# Test Results

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-07-01
**Author**: Claude (Phase 6 Test Execution)
**Update date**: 2026-07-01

## 1. Execution Environment

| item | value |
|---|---|
| Scope this round | FE Unit Tests (Vitest) + FE E2E Tests (Playwright) only |
| OS | Windows 10 Pro |
| Node / package manager | project-local `npm` (see `EDCAP_FE/package.json`) |
| Test runner (UT) | Vitest, jsdom environment |
| Test runner (E2E) | Playwright, Chromium, `webServer` auto-starts Vite dev server at `http://127.0.0.1:5173` |
| Backend | Not running — all `/api/v1/dev/dashboard/**` and `/api/v1/traceability/**` calls intercepted via `page.route()` / `vi.spyOn` |

## 2. Executed Command

| command | result | log/evidence | note |
|---|---|---|---|
| `npx vitest run "src/__ tests __/dev-dashboard"` | PASS | 5 files, 41 tests, 0 failed | New DevDashboard FE UT only |
| `npx vitest run` (full FE suite) | PASS | 33 files, 239 tests, 0 failed | Regression check — confirms `data-testid` additions to `DevFilterBar.tsx` / `DevTicketTable.tsx` did not break anything |
| `npx playwright test dev-dashboard` (1st run) | FAIL | 6/7 failed | Root cause found: mock user `role: "DEVELOPER"` did not match FE route guard `RequireDashboard` (`App.tsx:83`), which only accepts `PM \| QA \| DEV \| ADMIN` → app force-logged-out to `/login` |
| `npx playwright test dev-dashboard` (2nd run, after fixing fixture role to `"DEV"`) | PARTIAL | 6/7 passed, 1 strict-mode violation | `getByText("Review comments")` matched both the KPI card title and the ticket-table column header |
| `npx playwright test dev-dashboard` (3rd run, after scoping locator with `.first()`) | PASS | 7/7 passed | All scenarios green |
| `npx playwright test qa-dashboard --grep "S-E2E-1"` | PASS | 1/1 passed | Baseline sanity check — confirms the mock-auth/route pattern still works for an untouched dashboard, isolating the two failures above to this ticket's new files |

## 3. Summary of Results

* **41/41 new FE unit tests pass** across `DevSummaryCards`, `DevFilterBar`, `DevTicketTable`, `DevTicketDetailDrawer`, `DevelopmentDashboardPage`.
* **239/239 total FE unit tests pass** (no regression from the two small `data-testid` additions).
* **7/7 new E2E scenarios pass** after two fixes made during this test round (see §6 Bugs Fixed).
* BE UT / API IT / DB test round is **out of scope this round** (see test-plan.md §6) — not executed, not claimed as passing.

## 4. List of Passes

| TC ID | test | result | note |
|---|---|---|---|
| AC-DEV-DASHBOARD-1-FE-1..5 | DevSummaryCards / DevelopmentDashboardPage rendering | PASS | KPI cards, i18n keys, zero-state |
| AC-DEV-DASHBOARD-2-FE-1 | CI Failure count rendering | PASS | Unit + E2E |
| AC-DEV-DASHBOARD-3-FE-1 | Review Finding count rendering | PASS | Unit + E2E |
| AC-DEV-DASHBOARD-4-FE-1, FE-2 | Parser Error count + drawer parser-error section | PASS | Unit + E2E |
| AC-DEV-DASHBOARD-5-FE-1..3 | DevFilterBar behavior + page-level filter wiring | PASS | Unit + E2E (project & CI-status filters) |
| AC-DEV-DASHBOARD-6-FE-1..3 | Row click → drawer → detail API call | PASS | Unit + E2E |
| AC-DEV-DASHBOARD-7-FE-1 | No write controls / inputs in drawer or full page | PASS | Unit + E2E |
| S-E2E-1..7 | All 7 Playwright scenarios | PASS | See §2 |

## 5. List of Fails

| TC ID | test | cause | action | status |
|---|---|---|---|---|
| S-E2E-1 (1st run, all 6 dependent scenarios) | Dashboard failed to load — redirected to `/login` | Mock fixture used `role: "DEVELOPER"`; FE route guard `RequireDashboard` in `App.tsx:83` only allows `PM \| QA \| DEV \| ADMIN` | Changed fixture `DEV_USER.role` to `"DEV"` in `dev-dashboard.spec.ts` | RESOLVED |
| S-E2E-1 (2nd run) | Strict-mode violation on `getByText("Review comments")` | Text is reused for both the KPI card title and the ticket-table column header (component behavior, not a bug) | Scoped `DevDashboardPage.reviewCommentCardTitle` locator with `.first()` | RESOLVED |

## 6. Bugs Fixed

| bug | fix | evidence |
|---|---|---|
| E2E fixture used non-existent FE role value `"DEVELOPER"` instead of the recognized `"DEV"` | Updated `DEV_USER.role` in `e2e_tests/tests/dev-dashboard/dev-dashboard.spec.ts` | 3rd Playwright run: 7/7 passed |
| Page Object locator ambiguity on duplicated "Review comments" text | Added `.first()` to `DevDashboardPage.reviewCommentCardTitle` in `e2e_tests/pages/DevDashboardPage.ts` | 3rd Playwright run: 7/7 passed |

Note: both fixes were in **test code**, not in application source — no production behavior was changed to make tests pass.

## 7. Not yet fixed / Pending

* BE UT (`DevDashboardServiceTest`), API IT (`DevDashboardControllerTest`), and Repository/JdbcAdapter integration test are judged necessary (impact-analysis.md §11) but not implemented this round — explicit scope was FE UT + FE E2E only. Tracked as a follow-up decision in test-plan.md §10.
* CSV export byte-level content is not asserted (button-presence only).

## 8. Test cannot be executed and reason

| TC ID | reason | risk | alternative evidence |
|---|---|---|---|
| — | Not applicable this round — all planned FE UT/E2E tests were executable without a live backend (fully mocked) | — | — |

## 9. Remaining risk

* AC-8 ("Existing V4 tables reused") has no automated test coverage of any kind yet (FE cannot verify DB schema reuse) — remains a Code Review–only control until the BE round runs.
* AC-2/3/4 aggregation *correctness* (i.e., that the BE actually computes the right counts from `tbl_fact_ci_run`/`tbl_fact_finding`/`tbl_fact_data_quality`) is verified only at the FE contract level (FE trusts whatever the mocked/real API returns) — real aggregation logic is unverified by automated test until `DevDashboardServiceTest` exists.
* Discovered during this round: the FE role-guard convention (`"DEV"`, not `"DEVELOPER"`) was undocumented outside `App.tsx`; future fixtures/tests referencing this role should reuse `"DEV"`.

## 10. Final Test Verdict

**PASS** — for the declared scope (FE Unit Tests + FE E2E Tests). 41/41 new unit tests, 239/239 total unit tests, and 7/7 E2E scenarios pass. BE-side test round remains open per test-plan.md §10 and is not covered by this verdict.
