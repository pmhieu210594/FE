# Black-box Test Cases

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-07-01
**Author**: OpenAI
**Update date**: 2026-07-01

---

## Test Case Summary

| case ID | AC ID              | priority | category      | title                                   |
| ------- | ------------------ | -------- | ------------- | --------------------------------------- |
| BB-001  | AC-DEV-DASHBOARD-1 | P0       | Normal        | Dashboard loads successfully            |
| BB-002  | AC-DEV-DASHBOARD-2 | P0       | Normal        | CI Failure card displays correctly      |
| BB-003  | AC-DEV-DASHBOARD-3 | P0       | Normal        | Review Findings card displays correctly |
| BB-004  | AC-DEV-DASHBOARD-4 | P0       | Normal        | Parser Error card displays correctly    |
| BB-005  | AC-DEV-DASHBOARD-5 | P1       | Normal        | Dashboard filtering                     |
| BB-006  | AC-DEV-DASHBOARD-6 | P1       | Normal        | Ticket detail drill-down                |
| BB-007  | AC-DEV-DASHBOARD-7 | P0       | Permission    | Dashboard is read-only                  |
| BB-008  | AC-DEV-DASHBOARD-8 | P0       | Compatibility | Existing data reused                    |
| BB-009  | AC-DEV-DASHBOARD-1 | P1       | Boundary      | Empty dashboard                         |
| BB-010  | AC-DEV-DASHBOARD-5 | P2       | Error         | Invalid filter values                   |

---

## Test Cases

### BB-001: Dashboard loads successfully

| item            | content                                                 |
| --------------- | ------------------------------------------------------- |
| Related AC      | AC-DEV-DASHBOARD-1                                      |
| Priority        | P0                                                      |
| Category        | Normal                                                  |
| Preconditions   | Dashboard data exists                                   |
| Input           | Open Developer Dashboard                                |
| Steps           | Navigate to Developer Dashboard                         |
| Expected Result | Dashboard page, KPI cards and ticket list are displayed |
| Note            | Initial dashboard verification                          |

---

### BB-002: CI Failure card displays correctly

| item            | content                                   |
| --------------- | ----------------------------------------- |
| Related AC      | AC-DEV-DASHBOARD-2                        |
| Priority        | P0                                        |
| Category        | Normal                                    |
| Preconditions   | CI failures exist                         |
| Input           | Open Dashboard                            |
| Steps           | Observe CI Failure KPI                    |
| Expected Result | CI Failure count matches existing CI data |
| Note            | Read-only verification                    |

---

### BB-003: Review Findings card displays correctly

| item            | content                                           |
| --------------- | ------------------------------------------------- |
| Related AC      | AC-DEV-DASHBOARD-3                                |
| Priority        | P0                                                |
| Category        | Normal                                            |
| Preconditions   | Review findings exist                             |
| Input           | Open Dashboard                                    |
| Steps           | Observe Review Findings KPI                       |
| Expected Result | Review Finding count matches existing review data |
| Note            | Existing review only                              |

---

### BB-004: Parser Error card displays correctly

| item            | content                                |
| --------------- | -------------------------------------- |
| Related AC      | AC-DEV-DASHBOARD-4                     |
| Priority        | P0                                     |
| Category        | Normal                                 |
| Preconditions   | Parser errors exist                    |
| Input           | Open Dashboard                         |
| Steps           | Observe Parser Error KPI               |
| Expected Result | Parser Error count matches parser data |
| Note            | Existing parser only                   |

---

### BB-005: Dashboard filtering

| item            | content                           |
| --------------- | --------------------------------- |
| Related AC      | AC-DEV-DASHBOARD-5                |
| Priority        | P1                                |
| Category        | Normal                            |
| Preconditions   | Multiple tickets exist            |
| Input           | Select Project / Repository       |
| Steps           | Apply filters                     |
| Expected Result | Ticket list is filtered correctly |
| Note            | Existing filter component         |

---

### BB-006: Ticket detail drill-down

| item            | content                              |
| --------------- | ------------------------------------ |
| Related AC      | AC-DEV-DASHBOARD-6                   |
| Priority        | P1                                   |
| Category        | Normal                               |
| Preconditions   | Ticket exists                        |
| Input           | Click ticket                         |
| Steps           | Open Ticket Detail                   |
| Expected Result | Read-only ticket detail is displayed |
| Note            | Drawer or detail page                |

---

### BB-007: Dashboard is read-only

| item            | content                                   |
| --------------- | ----------------------------------------- |
| Related AC      | AC-DEV-DASHBOARD-7                        |
| Priority        | P0                                        |
| Category        | Permission                                |
| Preconditions   | Dashboard loaded                          |
| Input           | Browse dashboard                          |
| Steps           | Inspect available actions                 |
| Expected Result | No Create/Edit/Delete operation available |
| Note            | Read-only verification                    |

---

### BB-008: Existing V4 data reused

| item            | content                                         |
| --------------- | ----------------------------------------------- |
| Related AC      | AC-DEV-DASHBOARD-8                              |
| Priority        | P0                                              |
| Category        | Compatibility                                   |
| Preconditions   | Existing V4 data available                      |
| Input           | Open Dashboard                                  |
| Steps           | Compare displayed values with existing database |
| Expected Result | Dashboard values match existing data            |
| Note            | No duplicated persistence                       |

---

### BB-009: Empty dashboard

| item            | content                             |
| --------------- | ----------------------------------- |
| Related AC      | AC-DEV-DASHBOARD-1                  |
| Priority        | P1                                  |
| Category        | Boundary                            |
| Preconditions   | No matching ticket                  |
| Input           | Apply restrictive filters           |
| Steps           | Execute search                      |
| Expected Result | Empty state displayed with no error |
| Note            | Boundary case                       |

---

### BB-010: Invalid filter values

| item            | content                              |
| --------------- | ------------------------------------ |
| Related AC      | AC-DEV-DASHBOARD-5                   |
| Priority        | P2                                   |
| Category        | Error                                |
| Preconditions   | Dashboard available                  |
| Input           | Invalid filter                       |
| Steps           | Submit invalid value                 |
| Expected Result | Validation message or ignored filter |
| Note            | Input validation                     |

---

## Viewpoints Covered

* [x] Normal case
* [x] Error case
* [x] Boundary value
* [x] Permission difference
* [ ] State transition
* [ ] Character type input
* [ ] Numeric input
* [ ] Full-width number
* [ ] Empty/null
* [ ] Duplicate
* [ ] Non-existing ID
* [ ] Deleted data
* [ ] External IF failure
* [ ] Timeout/retry
* [ ] Double submit
* [ ] Back/reload
* [ ] Session expired
* [x] Existing data compatibility
* [x] Log/audit/notification/report output
