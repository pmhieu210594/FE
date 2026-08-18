# Wireframe - QA Dashboard

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: OpenAI
**Update date**: 2026-06-26

---

## 1. Screen Objective

The QA Dashboard allows QA members to monitor testing readiness for all tickets.

Main objectives:

* Review AC-Test Coverage.
* Identify Acceptance Criteria that are not yet tested.
* Review Black-box Coverage.
* Monitor Test Results.
* Monitor Defect Leakage.
* Determine Release Readiness.

This dashboard is **read-only**.

It does not replace Test Management tools.

---

## 2. Dashboard Layout

```text
+----------------------------------------------------------------------------------------------------------------+
| QA Dashboard                                                                                                   |
+----------------------------------------------------------------------------------------------------------------+
| Search _______________________________________________                              [Export] [Refresh]        |
+----------------------------------------------------------------------------------------------------------------+

+---------------------------+ +---------------------------+ +---------------------------+
| Project                   | | Sprint / Period           | | Repository                |
| All Projects              | | Current Sprint            | | All                       |
+---------------------------+ +---------------------------+ +---------------------------+

+---------------------------+ +---------------------------+ +---------------------------+
| Coverage Status           | | Test Status               | | Updated                   |
| All                       | | All                       | | 2026-06-26 09:30          |
+---------------------------+ +---------------------------+ +---------------------------+

+----------------------+ +----------------------+ +----------------------+
| AC Coverage          | | AC Not Tested        | | Black-box Coverage   |
| 84%                  | | 12                   | | 73%                  |
+----------------------+ +----------------------+ +----------------------+

+----------------------+ +----------------------+ +----------------------+
| Test Results         | | Defect Leakage       | | Release Readiness    |
| PASS 128             | | 4                    | | 15 Ready             |
| FAIL 8               | |                      | | 6 Partial            |
+----------------------+ +----------------------+ +----------------------+

+---------------------------------------------------------------------------------------------+
| Ticket List                                                                                |
+---------------------------------------------------------------------------------------------+
| Ticket | Repository | AC | Covered | Black-box | PASS | FAIL | Readiness | Detail         |
+---------------------------------------------------------------------------------------------+

+-------------------------------------------+
| Coverage Trend                            |
+-------------------------------------------+
```

---

## 3. Dashboard Cards

### AC-Test Coverage

Displays:

* Total Acceptance Criteria
* Covered Acceptance Criteria
* Coverage percentage

Clicking the card opens the uncovered AC list.

---

### Acceptance Criteria Not Tested

Displays:

* Number of uncovered AC
* Highest priority tickets
* Related repository

Clicking opens ticket detail.

---

### Black-box Coverage

Displays:

Coverage of:

* Normal
* Error
* Boundary
* Permission
* State
* Audit
* Operation

---

### Test Results

Displays:

* PASS
* FAIL
* NOT_RUN

Latest execution date is shown.

---

### Defect Leakage

Displays:

* QA defects
* Production defects

Grouped by:

* Severity
* Root Cause Phase

---

### Release Readiness

Displays:

* READY
* PARTIAL
* NOT_READY

Calculated from existing evidence.

---

## 4. Ticket List

```text
+----------------------------------------------------------------------------------------------------------------+
| Ticket List                                                                                                    |
+----------------------------------------------------------------------------------------------------------------+
| Ticket | Repository | AC | Covered | Black-box | PASS | FAIL | Readiness | Updated | Detail                 |
|---------------------------------------------------------------------------------------------------------------|
| ABC-123| Repo A     | 12 | 12      | 100%      | 34   | 0    | READY      | Today   | View                  |
| ABC-124| Repo B     | 15 | 11      | 63%       | 28   | 4    | PARTIAL    | Today   | View                  |
| ABC-125| Repo C     | 10 | 7       | 40%       | 14   | 8    | NOT_READY  | Today   | View                  |
+----------------------------------------------------------------------------------------------------------------+
```

### Notes

* Default sorting is by Release Readiness.
* Tickets with FAIL tests appear first.
* Clicking **View** opens Ticket Detail.

---

## 5. Ticket Detail Drawer

```text
+---------------------------------------------------------------------------------------------+
| Ticket Detail                                                                       [Close] |
+---------------------------------------------------------------------------------------------+

Ticket ID             ABC-124
Repository            Repo B
Project               Project Alpha
Current Phase         Test

-------------------------------------------------------

Acceptance Criteria

AC-01    Tested
AC-02    Tested
AC-03    Missing Test
AC-04    Failed

-------------------------------------------------------

Black-box Coverage

Normal          ✓
Error           ✓
Boundary        ✗
Permission      ✓
State           ✗
Audit           ✓

-------------------------------------------------------

Test Results

PASS            28
FAIL            4
NOT_RUN         2

Latest CI

PASS
2026-06-26 08:30

-------------------------------------------------------

Release Readiness

PARTIAL

Reasons

- Missing Boundary tests
- AC-03 not covered
- 4 failed tests

-------------------------------------------------------

[Open Test Plan]
[Open Test Results]
[Open Report]
```

### Notes

* Drawer is read-only.
* No editing is allowed.
* Links navigate to existing artifacts.

---

## 6. Empty State

```text
+-------------------------------------------------------------------------------------------+
| QA Dashboard                                                                              |
+-------------------------------------------------------------------------------------------+

No tickets match the current filter.

Try changing:

- Project
- Repository
- Sprint
- Coverage Status
- Test Status

[Reset Filters]
```

---

## 7. Filter Panel

Supported filters:

* Project
* Repository
* Sprint / Period
* Ticket
* Coverage Status
* Test Status
* Release Readiness

Search supports:

* Ticket ID
* Ticket Title
* Repository

---

## 8. Release Readiness Indicators

| Status    | Display     |
| --------- | ----------- |
| READY     | Green badge |
| PARTIAL   | Amber badge |
| NOT_READY | Red badge   |

---

## 9. Navigation

Dashboard links to:

* Ticket Detail
* Test Plan
* Test Results
* Report
* CI Run
* Traceability

No navigation modifies source data.

---

## 10. Out of Scope UI

The following UI items are not included in this ticket:

* PM Dashboard
* Executive Dashboard
* Security Dashboard
* Test Case Editing
* Test Result Editing
* CI Management
* PR Review Management
* Manual Test Execution
* Personal QA Ranking
* AI Quality Analytics
