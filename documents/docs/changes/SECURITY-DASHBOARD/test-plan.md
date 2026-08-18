# Test Plan

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-03

---

## 1. Purpose

Define the test coverage for the Security Dashboard and record which ACs are
covered by which test type.

This phase focuses on the FE behavior needed to keep the Security dashboard
filter state synchronized with the default project/repository selection.

---

## 2. AC Matrix -> Test Type

| AC ID | FE UT | BE UT | API IT | E2E | Black-box | Decision |
|---|---|---|---|---|---|---|
| AC-SECURITY-DASHBOARD-1 | Y | N | N | Y | N | Page render is verified in FE UT and E2E |
| AC-SECURITY-DASHBOARD-2 | Y | N | N | N | N | Summary card rendering is verified in FE UT |
| AC-SECURITY-DASHBOARD-3 | Y | N | N | N | N | Summary card rendering is verified in FE UT |
| AC-SECURITY-DASHBOARD-4 | Y | N | N | N | N | Summary card rendering is verified in FE UT |
| AC-SECURITY-DASHBOARD-5 | Y | N | N | N | N | Summary card rendering is verified in FE UT |
| AC-SECURITY-DASHBOARD-6 | Y | N | N | N | N | Summary card rendering is verified in FE UT |
| AC-SECURITY-DASHBOARD-7 | Y | N | N | Y | N | Filter auto-select and change sync are verified in FE UT and E2E |
| AC-SECURITY-DASHBOARD-8 | Y | N | N | Y | N | Ticket table and drawer wiring are verified in FE UT and E2E |
| AC-SECURITY-DASHBOARD-9 | N | N | N | N | N | Code review only; no DB/test execution needed for this FE change |
| AC-SECURITY-DASHBOARD-10 | Y | N | N | Y | N | Read-only controls are verified in FE UT and E2E |

---

## 3. Reused Assurances

| existing assurance | what it tells us | how it was reused |
|---|---|---|
| Data Ops dashboard page tests | Project/repository default-selection pattern | Used as the reference for Security dashboard auto-select behavior |
| Dev dashboard page tests | Dashboard page render and ticket detail wiring | Used as the reference for Security dashboard page layout expectations |
| QA dashboard page tests | Read-only dashboard test style | Used as the reference for filter/render assertions |

---

## 4. Additional Tests This Time

| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-SEC-01 | Auto-select the first project and repository after options load | FE UT | `SecurityDashboardPage.test.tsx` | AC-SECURITY-DASHBOARD-7 |
| TC-SEC-02 | Render summary cards and dashboard shell | FE UT | `SecurityDashboardPage.test.tsx` | AC-SECURITY-DASHBOARD-1..6 |
| TC-SEC-03 | Changing project resets repository and syncs the new default repository | FE UT | `SecurityDashboardPage.test.tsx` | AC-SECURITY-DASHBOARD-7 |
| TC-SEC-04 | No edit/delete/create controls are exposed | FE UT | `SecurityDashboardPage.test.tsx` | AC-SECURITY-DASHBOARD-10 |

---

## 5. E2E Scenarios

| scenario | steps | expected | related AC |
|---|---|---|---|
| E2E-SEC-01 | Open Security Dashboard with mocked auth and dashboard APIs | Dashboard renders, default project/repository are selected, and summary cards are visible | AC-SECURITY-DASHBOARD-1, AC-SECURITY-DASHBOARD-7 |
| E2E-SEC-02 | Change the project filter from `proj-1` to `proj-2` | Repository syncs to the new project's first repository and dashboard queries refresh | AC-SECURITY-DASHBOARD-7 |
| E2E-SEC-03 | Open the first ticket detail drawer | Read-only drawer opens and displays scans/checklist/exceptions | AC-SECURITY-DASHBOARD-8 |
| E2E-SEC-04 | Inspect available actions on the dashboard | No edit/delete/create/add/remove/upload controls are present | AC-SECURITY-DASHBOARD-10 |

---

## 6. Intentionally Skipped This Time

| area | reason | risk |
|---|---|---|
| BE UT | This pass only adds FE behavior coverage for the filter-sync change | Low |
| API IT | No backend endpoint changes were made in this pass | Low |
| Black-box | Not required for the narrow FE-only change in this phase | Low |

---

## 7. Test Data Policy

- Use mocked endpoints only.
- Do not use production data.
- Keep project/repository fixtures minimal and deterministic.
- Use one project with at least two repositories to verify filter reset behavior.
- Use read-only fixtures only.

---

## 8. Execution Command

| command | purpose |
|---|---|
| `cd EDCAP_FE; npx vitest run "src/__ tests __/security-dashboard/SecurityDashboardPage.test.tsx" --reporter=dot` | Verify the Security dashboard FE behavior, especially default filter synchronization |
| `cd EDCAP_FE; npx playwright test e2e_tests/tests/security-dashboard/security-dashboard.spec.ts --reporter=dot` | Verify the Security dashboard end-to-end browser flow with mocked APIs |

---

## 9. Completion Gate

- [x] `test-plan.md` maps AC to test type
- [x] FE UT / BE UT / API IT / E2E decision is recorded
- [x] Skipped tests include reason
- [x] `test-results.md` contains command execution and result
- [x] Any failed test has cause / fix / remaining risk recorded
