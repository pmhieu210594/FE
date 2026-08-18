# Black-box Test Cases

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: OpenAI
**Update date**: 2026-06-29

---

## Test Case Summary

| Case ID | AC ID              | Priority | Category   | Title                                                     |
| ------- | ------------------ | -------- | ---------- | --------------------------------------------------------- |
| BB-001  | AC-QA-DASHBOARD-1  | P0       | Normal     | Authenticated user opens QA Dashboard successfully        |
| BB-002  | AC-QA-DASHBOARD-1  | P0       | Permission | Unauthenticated user receives HTTP 401                    |
| BB-003  | AC-QA-DASHBOARD-2  | P0       | Normal     | AC-Test Coverage KPI displays correct percentage          |
| BB-004  | AC-QA-DASHBOARD-2  | P0       | Boundary   | AC Coverage when total AC = 0                             |
| BB-005  | AC-QA-DASHBOARD-3  | P1       | Normal     | AC Not Tested list displays uncovered Acceptance Criteria |
| BB-006  | AC-QA-DASHBOARD-4  | P0       | Normal     | Black-box Coverage KPI displays correct percentage        |
| BB-007  | AC-QA-DASHBOARD-4  | P0       | Boundary   | Black-box Coverage when no viewpoints are covered         |
| BB-008  | AC-QA-DASHBOARD-5  | P0       | Normal     | Test Results KPI displays PASS / FAIL / NOT_RUN correctly |
| BB-009  | AC-QA-DASHBOARD-5  | P1       | Boundary   | Test Results when no execution data exists                |
| BB-010  | AC-QA-DASHBOARD-6  | P1       | Normal     | Defect Leakage excludes resolved findings                 |
| BB-011  | AC-QA-DASHBOARD-7  | P0       | State      | Release Readiness = READY                                 |
| BB-012  | AC-QA-DASHBOARD-7  | P1       | State      | Release Readiness = PARTIAL                               |
| BB-013  | AC-QA-DASHBOARD-7  | P1       | State      | Release Readiness = NOT_READY                             |
| BB-014  | AC-QA-DASHBOARD-8  | P1       | Normal     | Filter by Project                                         |
| BB-015  | AC-QA-DASHBOARD-8  | P1       | Normal     | Filter by Repository                                      |
| BB-016  | AC-QA-DASHBOARD-8  | P1       | Error      | Invalid filter parameter                                  |
| BB-017  | AC-QA-DASHBOARD-8  | P1       | Boundary   | Empty filter returns all tickets                          |
| BB-018  | AC-QA-DASHBOARD-9  | P1       | Normal     | Open Ticket Detail drawer                                 |
| BB-019  | AC-QA-DASHBOARD-10 | P0       | Permission | Dashboard remains read-only                               |
| BB-020  | AC-QA-DASHBOARD-11 | P0       | Operation  | Dashboard performs SELECT only                            |
| BB-021  | AC-QA-DASHBOARD-12 | P2       | Normal     | Dashboard automatically derives all values                |

---

## Test Cases

### BB-001: Authenticated user opens QA Dashboard successfully

| Item            | Content                                                                         |
| --------------- | ------------------------------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-1                                                               |
| Priority        | P0                                                                              |
| Category        | Normal                                                                          |
| Preconditions   | User is authenticated. Dashboard contains at least one ticket.                  |
| Input           | Navigate to QA Dashboard                                                        |
| Steps           | 1. Login.<br>2. Open Dashboard.<br>3. Select QA tab.                            |
| Expected Result | Dashboard loads successfully. KPI cards, filters and ticket list are displayed. |
| Note            | Read-only dashboard.                                                            |

---

### BB-002: Unauthenticated user receives HTTP 401

| Item            | Content                                             |
| --------------- | --------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-1                                   |
| Priority        | P0                                                  |
| Category        | Permission                                          |
| Preconditions   | No authenticated session                            |
| Input           | GET `/api/v1/qa/dashboard/summary`                  |
| Steps           | Execute API without authentication.                 |
| Expected Result | HTTP 401 is returned. No dashboard data is exposed. |
| Note            | Spring Security default behavior.                   |

---

### BB-003: AC-Test Coverage KPI displays correct percentage

| Item            | Content                                               |
| --------------- | ----------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-2                                     |
| Priority        | P0                                                    |
| Category        | Normal                                                |
| Preconditions   | Ticket contains 5 AC, 3 covered, 2 uncovered.         |
| Input           | Load dashboard.                                       |
| Steps           | Open QA Dashboard and inspect KPI.                    |
| Expected Result | Coverage displayed = 60%. Covered = 3. Uncovered = 2. |
| Note            | Formula verified against BR-2.                        |

---

### BB-004: AC Coverage when total AC = 0

| Item            | Content                                                           |
| --------------- | ----------------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-2                                                 |
| Priority        | P0                                                                |
| Category        | Boundary                                                          |
| Preconditions   | Ticket has no Acceptance Criteria.                                |
| Input           | Load dashboard.                                                   |
| Steps           | Open QA Dashboard for the ticket.                                 |
| Expected Result | Coverage = 0%. No divide-by-zero error. No null values displayed. |
| Note            | Boundary verification.                                            |

---

### BB-005: AC Not Tested list displays uncovered Acceptance Criteria

| Item            | Content                                                                         |
| --------------- | ------------------------------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-3                                                               |
| Priority        | P1                                                                              |
| Category        | Normal                                                                          |
| Preconditions   | Ticket contains uncovered AC.                                                   |
| Input           | Load dashboard.                                                                 |
| Steps           | Open "AC Not Tested".                                                           |
| Expected Result | Only uncovered Acceptance Criteria are listed with Ticket ID, AC ID and Status. |
| Note            | Verify mapping from parsed data.                                                |
### BB-006: Black-box Coverage KPI displays correct percentage

| Item            | Content                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-4                                                                           |
| Priority        | P0                                                                                          |
| Category        | Normal                                                                                      |
| Preconditions   | Ticket contains 8 required viewpoints, 6 covered.                                           |
| Input           | Load QA Dashboard.                                                                          |
| Steps           | Open dashboard and inspect Black-box Coverage KPI.                                          |
| Expected Result | Coverage displayed = 75%. Covered viewpoints and missing viewpoints are clearly identified. |
| Note            | Formula follows BR-3.                                                                       |

---

### BB-007: Black-box Coverage when no viewpoints are covered

| Item            | Content                                                       |
| --------------- | ------------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-4                                             |
| Priority        | P0                                                            |
| Category        | Boundary                                                      |
| Preconditions   | Ticket contains no completed viewpoints.                      |
| Input           | Load QA Dashboard.                                            |
| Steps           | Open dashboard.                                               |
| Expected Result | Coverage = 0%. No divide-by-zero or application error occurs. |
| Note            | Boundary verification.                                        |

---

### BB-008: Test Results KPI displays PASS / FAIL / NOT_RUN correctly

| Item            | Content                                                     |
| --------------- | ----------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-5                                           |
| Priority        | P0                                                          |
| Category        | Normal                                                      |
| Preconditions   | Test execution data exists.                                 |
| Input           | Load dashboard.                                             |
| Steps           | View Test Results KPI.                                      |
| Expected Result | PASS, FAIL and NOT_RUN values exactly match execution data. |
| Note            | Verify aggregation.                                         |

---

### BB-009: Test Results when no execution data exists

| Item            | Content                                                    |
| --------------- | ---------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-5                                          |
| Priority        | P1                                                         |
| Category        | Boundary                                                   |
| Preconditions   | Ticket has no execution records.                           |
| Input           | Load dashboard.                                            |
| Steps           | View Test Results KPI.                                     |
| Expected Result | PASS = 0, FAIL = 0, NOT_RUN = 0. Dashboard remains stable. |
| Note            | Zero-state verification.                                   |

---

### BB-010: Defect Leakage excludes resolved findings

| Item            | Content                                   |
| --------------- | ----------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-6                         |
| Priority        | P1                                        |
| Category        | Normal                                    |
| Preconditions   | Three findings exist: 2 OPEN, 1 RESOLVED. |
| Input           | Load dashboard.                           |
| Steps           | View Defect Leakage KPI.                  |
| Expected Result | Only OPEN findings are counted. KPI = 2.  |
| Note            | Verify BR-5.                              |

---

### BB-011: Release Readiness = READY

| Item            | Content                                    |
| --------------- | ------------------------------------------ |
| Related AC      | AC-QA-DASHBOARD-7                          |
| Priority        | P0                                         |
| Category        | State                                      |
| Preconditions   | Ticket satisfies all readiness conditions. |
| Input           | Load dashboard.                            |
| Steps           | Inspect Release Readiness.                 |
| Expected Result | READY badge displayed.                     |
| Note            | Happy path.                                |

---

### BB-012: Release Readiness = PARTIAL

| Item            | Content                                                    |
| --------------- | ---------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-7                                          |
| Priority        | P1                                                         |
| Category        | State                                                      |
| Preconditions   | Ticket misses one required readiness condition.            |
| Input           | Load dashboard.                                            |
| Steps           | Inspect Release Readiness.                                 |
| Expected Result | PARTIAL badge displayed. Missing conditions are explained. |
| Note            | State transition verification.                             |

---

### BB-013: Release Readiness = NOT_READY

| Item            | Content                      |
| --------------- | ---------------------------- |
| Related AC      | AC-QA-DASHBOARD-7            |
| Priority        | P1                           |
| Category        | State                        |
| Preconditions   | Ticket contains no evidence. |
| Input           | Load dashboard.              |
| Steps           | Inspect Release Readiness.   |
| Expected Result | NOT_READY badge displayed.   |
| Note            | Initial state verification.  |

---

### BB-014: Filter by Project

| Item            | Content                                        |
| --------------- | ---------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-8                              |
| Priority        | P1                                             |
| Category        | Normal                                         |
| Preconditions   | Multiple projects exist.                       |
| Input           | Select Project A.                              |
| Steps           | Apply Project filter.                          |
| Expected Result | Only Project A tickets and KPIs are displayed. |
| Note            | Filter verification.                           |

---

### BB-015: Filter by Repository

| Item            | Content                          |
| --------------- | -------------------------------- |
| Related AC      | AC-QA-DASHBOARD-8                |
| Priority        | P1                               |
| Category        | Normal                           |
| Preconditions   | Multiple repositories exist.     |
| Input           | Select Repository B.             |
| Steps           | Apply Repository filter.         |
| Expected Result | Only Repository B data is shown. |
| Note            | Repository filtering.            |
---

### BB-016: Invalid filter parameter

| Item            | Content                                           |
| --------------- | ------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-8                                 |
| Priority        | P1                                                |
| Category        | Error                                             |
| Preconditions   | User authenticated.                               |
| Input           | `projectId=invalid-uuid`                          |
| Steps           | Execute API request with invalid UUID.            |
| Expected Result | HTTP 400 is returned with standard ErrorResponse. |
| Note            | Input validation.                                 |

---

### BB-017: Empty filter returns all tickets

| Item            | Content                                                                |
| --------------- | ---------------------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-8                                                      |
| Priority        | P1                                                                     |
| Category        | Boundary                                                               |
| Preconditions   | Dashboard contains multiple projects and repositories.                 |
| Input           | Leave all filters empty.                                               |
| Steps           | Open dashboard without selecting any filter.                           |
| Expected Result | All available tickets are displayed. KPI cards show portfolio summary. |
| Note            | Default behavior.                                                      |

---

### BB-018: Ticket Detail drawer

| Item            | Content                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-9                                                                                                |
| Priority        | P1                                                                                                               |
| Category        | Normal                                                                                                           |
| Preconditions   | Dashboard contains at least one ticket.                                                                          |
| Input           | Click **View** on a ticket row.                                                                                  |
| Steps           | Open Ticket Detail.                                                                                              |
| Expected Result | Drawer displays AC list, Black-box Coverage, Test Results, CI information, Release Readiness and artifact links. |
| Note            | Drawer is read-only.                                                                                             |

---

### BB-019: Dashboard remains read-only

| Item            | Content                                                |
| --------------- | ------------------------------------------------------ |
| Related AC      | AC-QA-DASHBOARD-10                                     |
| Priority        | P0                                                     |
| Category        | Permission                                             |
| Preconditions   | User authenticated.                                    |
| Input           | Navigate through dashboard.                            |
| Steps           | Inspect every screen component.                        |
| Expected Result | No Create, Edit, Delete or Save actions are available. |
| Note            | Read-only verification.                                |

---

### BB-020: Dashboard performs SELECT only

| Item            | Content                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-11                                                        |
| Priority        | P0                                                                        |
| Category        | Operation                                                                 |
| Preconditions   | SQL logging enabled.                                                      |
| Input           | Open dashboard, apply filters, open Ticket Detail.                        |
| Steps           | Review SQL log.                                                           |
| Expected Result | Only SELECT statements are executed. No INSERT, UPDATE or DELETE appears. |
| Note            | Operational verification.                                                 |

---

### BB-021: Dashboard automatically derives all values

| Item            | Content                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------- |
| Related AC      | AC-QA-DASHBOARD-12                                                                           |
| Priority        | P2                                                                                           |
| Category        | Normal                                                                                       |
| Preconditions   | Parsed evidence already exists.                                                              |
| Input           | Open QA Dashboard.                                                                           |
| Steps           | Review all KPI cards and ticket rows.                                                        |
| Expected Result | All values are calculated automatically from existing evidence. No manual input is required. |
| Note            | Auto-derived dashboard.                                                                      |

---

## Viewpoints Covered

* [x] Normal case
* [x] Error case
* [x] Boundary value
* [x] Permission difference
* [x] State transition
* [ ] Character type input (not applicable)
* [ ] Numeric input (covered by KPI boundary tests)
* [ ] Full-width number (not applicable)
* [x] Empty / null
* [ ] Duplicate (not applicable)
* [ ] Non-existing ID
* [ ] Deleted data (out of scope)
* [ ] External IF failure (out of scope)
* [ ] Timeout / retry (post-PoC)
* [ ] Double submit (read-only)
* [x] Back / reload
* [ ] Session expired
* [x] Existing data compatibility
* [x] Log / Audit / Operation output
