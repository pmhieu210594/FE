# Wireframe - Developer Dashboard

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-06-30
**Author**: OpenAI
**Update date**: 2026-06-30

---

# 1. Screen Objective

The Developer Dashboard provides a single operational view for developers.

Primary objectives:

* Monitor CI Failures.
* Monitor Review Findings.
* Monitor Parser Errors.
* Quickly identify tickets requiring developer action.

The dashboard is **read-only**.

---

# 2. Dashboard Layout

```text
+----------------------------------------------------------------------------------------------------------------+
| Developer Dashboard                                                                                            |
+----------------------------------------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------------------+
| Search ________________________________________________      [Refresh] [Export]              |
+-----------------------------------------------------------------------------------------------+

+---------------------------+ +---------------------------+ +---------------------------+
| Project                   | | Repository                | | Updated                   |
| All                       | | All                       | | 2026-06-30 10:00          |
+---------------------------+ +---------------------------+ +---------------------------+

+---------------------------+ +---------------------------+ +---------------------------+
| CI Status                 | | Review Status             | | Parser Status             |
| All                       | | All                       | | All                       |
+---------------------------+ +---------------------------+ +---------------------------+

+----------------------+ +----------------------+ +----------------------+
| CI Failures          | | Review Findings     | | Parser Errors        |
| 5                    | | 18                  | | 3                    |
+----------------------+ +----------------------+ +----------------------+

+--------------------------------------------------------------------------------------------------------------+
| Ticket List                                                                                                  |
+--------------------------------------------------------------------------------------------------------------+
| Ticket | Repository | CI | Review | Parser | Updated | Detail                                               |
+--------------------------------------------------------------------------------------------------------------+

+----------------------------------------------+
| CI Failure Trend                             |
+----------------------------------------------+
```

---

# 3. Dashboard Cards

## CI Failures

Displays:

* Failed CI count.
* Failed workflows.
* Latest failure.

Clicking opens the filtered ticket list.

---

## Review Findings

Displays:

* Open Review Findings.
* Severity summary.
* Open ticket count.

Clicking opens related tickets.

---

## Parser Errors

Displays:

* Parser Error count.
* Failed artifacts.
* Parse failures.

Clicking opens affected tickets.

---

# 4. Ticket List

```text
+--------------------------------------------------------------------------------------------------------------------+
| Ticket List                                                                                                        |
+--------------------------------------------------------------------------------------------------------------------+
| Ticket | Repository | CI Status | Review Findings | Parser Status | Updated | Detail                             |
|--------------------------------------------------------------------------------------------------------------------|
| DEV-101 | Repo A    | FAIL       | 3               | SUCCESS       | Today   | View                               |
| DEV-102 | Repo B    | PASS       | 2               | ERROR         | Today   | View                               |
| DEV-103 | Repo C    | FAIL       | 0               | SUCCESS       | Today   | View                               |
+--------------------------------------------------------------------------------------------------------------------+
```

### Notes

Default sorting:

1. CI Failures
2. Parser Errors
3. Review Findings

Clicking **View** opens Ticket Detail.

---

# 5. Ticket Detail Drawer

```text
+--------------------------------------------------------------------------------------------------------------+
| Ticket Detail                                                                                         [Close] |
+--------------------------------------------------------------------------------------------------------------+

Ticket ID             DEV-101
Repository            EDCAP_BE
Project               EDCAP

---------------------------------------------------------

CI

Workflow              Backend CI
Status                FAIL
Failure Category      Unit Test
Executed              2026-06-30 09:20

---------------------------------------------------------

Review Findings

Open Findings         3

Major
Minor

Reviewer

Developer

---------------------------------------------------------

Parser Errors

Artifact              report.md

Status                ERROR

Summary

Required section missing

---------------------------------------------------------

Actions

Open CI Run

Open Review

Open Artifact
```

### Notes

* Drawer is read-only.
* No editing.
* Links navigate to existing system pages.

---

# 6. Empty State

```text
+--------------------------------------------------------------------------------------+
| Developer Dashboard                                                                  |
+--------------------------------------------------------------------------------------+

No tickets match the current filter.

Try changing:

- Project
- Repository
- CI Status
- Review Status
- Parser Status

[Reset Filters]
```

---

# 7. Filters

Supported filters:

* Project
* Repository
* Ticket
* CI Status
* Review Status
* Parser Status

Search supports:

* Ticket ID
* Ticket Title
* Repository

---

# 8. Status Indicators

## CI Status

| Status  | Display |
| ------- | ------- |
| PASS    | Green   |
| FAIL    | Red     |
| RUNNING | Blue    |

---

## Review Status

| Status   | Display |
| -------- | ------- |
| OPEN     | Red     |
| RESOLVED | Green   |

---

## Parser Status

| Status  | Display |
| ------- | ------- |
| SUCCESS | Green   |
| WARNING | Amber   |
| ERROR   | Red     |

---

# 9. Navigation

The dashboard provides navigation to:

* CI Run
* Review Detail
* Ticket Detail
* Parsed Artifact

The dashboard never modifies data.

---

# 10. Out of Scope

The following features are not included:

* CI execution
* Review editing
* Parser retry
* AI Review Analytics
* Personal developer ranking
* Evidence Quality Dashboard
* PM Dashboard
* QA Dashboard
* Security Dashboard
* Executive Dashboard
