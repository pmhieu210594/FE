# Wireframe - Data Ops Dashboard

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

# 1. Screen Objective

The Data Ops Dashboard provides operational monitoring for the SDD Evidence Platform.

Primary objectives:

- Monitor connector executions.
- Monitor parser health.
- Detect missing evidence.
- Monitor evidence freshness.
- Detect broken traceability.
- Monitor overall data quality.

The dashboard is **read-only**.

It is intended for **Data Ops** and **Administrators**.

---

# 2. Dashboard Layout

```text
+----------------------------------------------------------------------------------------------------------------+
| Data Ops Dashboard                                                                                             |
+----------------------------------------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------------------+
| Search ________________________________________________      [Export] [Refresh]              |
+-----------------------------------------------------------------------------------------------+

+---------------------------+ +---------------------------+ +---------------------------+
| Project                   | | Repository                | | Updated                   |
| All                       | | All                       | | 2026-07-02 10:30          |
+---------------------------+ +---------------------------+ +---------------------------+

+---------------------------+ +---------------------------+ +---------------------------+
| Connector                 | | Parser                    | | Status                    |
| All                       | | All                       | | All                       |
+---------------------------+ +---------------------------+ +---------------------------+

+----------------------+ +----------------------+ +----------------------+
| Connector Status     | | Parse Errors        | | Missing Evidence     |
| PASS 24              | | ERROR 3            | | 12                   |
+----------------------+ +----------------------+ +----------------------+

+----------------------+ +----------------------+ +----------------------+
| Freshness            | | Broken Links        | | Security Alerts      |
| 8 Outdated           | | 6                  | | 1                    |
+----------------------+ +----------------------+ +----------------------+

+--------------------------------------------------------------------------------------------------------------+
| Connector Runs                                                                                               |
+--------------------------------------------------------------------------------------------------------------+
| Connector | Project | Status | Success | Warning | Error | Last Run | Detail                               |
+--------------------------------------------------------------------------------------------------------------+

+------------------------------------------------------+
| Parser Error Trend                                   |
+------------------------------------------------------+
```

---

# 3. Dashboard Cards

## Connector Status

Displays:

- Successful Runs
- Failed Runs
- Running
- Last Execution

Clicking opens Connector Run Detail.

---

## Parse Errors

Displays:

- Successful Parses
- Parser Warnings
- Parser Errors

Clicking opens Parser Detail.

---

## Missing Evidence

Displays:

- Missing Artifacts
- Placeholder Artifacts
- Invalid Templates

Clicking opens Artifact Detail.

---

## Freshness

Displays:

- Updated Today
- Outdated
- Never Parsed

Clicking opens affected repositories.

---

## Broken Links

Displays:

- Broken Traceability
- Missing Ticket Link
- Missing Report Link
- Missing CI Link

---

## Security Alerts

Displays:

- Sensitive Data Detection
- Parser Security Errors
- DLP Findings

---

# 4. Connector Run Table

```text
+----------------------------------------------------------------------------------------------------------------------+
| Connector Runs                                                                                                       |
+----------------------------------------------------------------------------------------------------------------------+
| Connector | Project | Repository | Status | Success | Warning | Error | Last Run | Detail                         |
|----------------------------------------------------------------------------------------------------------------------|
| Git       | EDCAP   | BE         | PASS   | 120     | 2       | 0     | Today    | View                          |
| Parser    | EDCAP   | BE         | ERROR  | 98      | 1       | 5     | Today    | View                          |
| CI        | EDCAP   | FE         | PASS   | 52      | 0       | 0     | Today    | View                          |
+----------------------------------------------------------------------------------------------------------------------+
```

Default sorting:

1. ERROR
2. WARNING
3. PASS

---

# 5. Connector Detail Drawer

```text
+--------------------------------------------------------------------------------------------------------------+
| Connector Detail                                                                                       [Close] |
+--------------------------------------------------------------------------------------------------------------+

Connector

Markdown Parser

Project

EDCAP

Repository

EDCAP_BE

------------------------------------------------------

Execution

Started

10:10

Finished

10:11

Status

ERROR

------------------------------------------------------

Parser Summary

Successful

98

Warnings

1

Errors

5

------------------------------------------------------

Error Summary

Missing Section

Broken Markdown

Invalid Template

------------------------------------------------------

Affected Artifacts

spec-pack.md

review-checklist.md

report.md

------------------------------------------------------

[Open Artifact]

[Open Log]
```

Drawer is read-only.

---

# 6. Empty State

```text
+--------------------------------------------------------------------------------------+
| Data Ops Dashboard                                                                   |
+--------------------------------------------------------------------------------------+

No connector execution found.

Try changing:

- Project
- Repository
- Connector
- Status

[Reset Filters]
```

---

# 7. Filters

Supported filters:

- Project
- Repository
- Connector
- Parser
- Status

Search supports:

- Ticket ID
- Repository
- Connector Name
- Artifact Name

---

# 8. Status Indicators

## Connector

| Status | Display |
|---|---|
| PASS | Green |
| RUNNING | Blue |
| WARNING | Amber |
| FAIL | Red |

---

## Parser

| Status | Display |
|---|---|
| SUCCESS | Green |
| WARNING | Amber |
| ERROR | Red |

---

## Freshness

| Status | Display |
|---|---|
| Fresh | Green |
| Warning | Amber |
| Outdated | Red |

---

# 9. Navigation

Dashboard links to:

- Connector Detail
- Artifact Detail
- Traceability
- Parser Error
- Repository

Dashboard never modifies source data.

---

# 10. Out of Scope

The following features are not included:

- Connector Configuration
- Connector Execution
- Parser Execution
- Manual Retry
- Artifact Editing
- Dashboard Administration
- AI Analytics
- PM Dashboard
- QA Dashboard
- Developer Dashboard
- Security Dashboard