# Wireframe - Security Dashboard

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

# 1. Screen Objective

The Security Dashboard provides Security, Admin and Data Ops users with a centralized operational view of repository and ticket security posture.

Primary objectives:

- Monitor Safety Pack readiness.
- Monitor Secret Scan results.
- Monitor SAST / SCA results.
- Monitor Security Checklist results.
- Monitor Security Exceptions.
- Quickly identify tickets requiring security attention.

The dashboard is **read-only**.

---

# 2. Dashboard Layout

```text
+--------------------------------------------------------------------------------------------------------------------+
| Security Dashboard                                                                                                 |
+--------------------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------------+
| Search _____________________________________________                                      [Export CSV]            |
+--------------------------------------------------------------------------------------------------------------------+

+----------------------------+ +----------------------------+ +----------------------------+ +----------------------------+
| Project                    | | Repository                 | | Security Status            | | Exception Status           |
| All                        | | All                        | | All                        | | All                        |
+----------------------------+ +----------------------------+ +----------------------------+ +----------------------------+

+----------------------+ +----------------------+ +----------------------+ +----------------------+
| Safety Pack          | | Secret Scan          | | SAST / SCA           | | Open Exception       |
| READY : 18           | | FAIL : 3            | | WARNING : 5          | | OPEN : 4             |
+----------------------+ +----------------------+ +----------------------+ +----------------------+

+--------------------------------------------------------------------------------------------------------------------+
| Security Review                                                                                                    |
+--------------------------------------------------------------------------------------------------------------------+
| Repository | Ticket | Safety | Secret | SAST | SCA | Checklist | Exception | Verdict | Updated | Detail         |
+--------------------------------------------------------------------------------------------------------------------+
```

---

# 3. Dashboard Cards

## Safety Pack

Displays

- READY
- WARNING
- MISSING
- PARSE_ERROR

Clicking filters the table.

---

## Secret Scan

Displays

- PASS
- FAIL
- NOT_AVAILABLE

Clicking filters failed tickets.

---

## SAST / SCA

Displays

- PASS
- WARNING
- FAIL

Aggregated from Security Scan metadata.

---

## Open Exception

Displays

- OPEN
- EXPIRED

Clicking filters affected tickets.

---

# 4. Ticket Table

```text
+------------------------------------------------------------------------------------------------------------------------------------+
| Ticket | Repository | Safety | Secret | SAST | SCA | Checklist | Exception | Verdict | Updated | Detail                      |
|------------------------------------------------------------------------------------------------------------------------------------|
| PARSER-SPEC         | EDCAP_BE | READY | PASS | WARNING | PASS | WARNING | OPEN     | WARNING | Today | View              |
| REPORT-PARSER       | EDCAP_BE | READY | PASS | PASS    | PASS | PASS    | NONE     | PASS    | Today | View              |
| TEST-PLAN           | EDCAP_BE | READY | FAIL | PASS    | PASS | FAIL    | OPEN     | FAIL    | Today | View              |
+------------------------------------------------------------------------------------------------------------------------------------+
```

### Default Sort

1. FAIL
2. WARNING
3. PASS

Repository may contain multiple tickets.

Each row represents **one ticket**.

---

# 5. Ticket Detail Drawer

```text
+-----------------------------------------------------------------------------------------------------------+
| Ticket Detail                                                                                     [Close] |
+-----------------------------------------------------------------------------------------------------------+

Ticket

PARSER-SPEC

Repository

EDCAP_BE

------------------------------------------------------------------------------------------------------------

Safety Pack

CLAUDE.md             ✓

settings.json         ✓

rules                 ✓

allow / ask / deny    4 / 2 / 11

------------------------------------------------------------------------------------------------------------

Secret Scan

PASS

------------------------------------------------------------------------------------------------------------

SAST

WARNING

Critical      0

High          2

------------------------------------------------------------------------------------------------------------

SCA

PASS

------------------------------------------------------------------------------------------------------------

Security Checklist

Permission Review     PASS

Privacy Review        PASS

High Risk Review      Pending

------------------------------------------------------------------------------------------------------------

Security Exception

OPEN

Reason

Temporary Semgrep suppression

Expiry

2026-08-01

------------------------------------------------------------------------------------------------------------

Final Security Verdict

WARNING
```

The drawer is **read-only**.

No edit operation is available.

---

# 6. Empty State

```text
+------------------------------------------------------------------------------------------------------+
| Security Dashboard                                                                                   |
+------------------------------------------------------------------------------------------------------+

No ticket matches the selected criteria.

Try changing:

- Project
- Repository
- Security Status
- Exception Status

[Reset Filters]
```

---

# 7. Filters

Supported filters

- Project
- Repository
- Ticket
- Safety Pack Status
- Secret Scan Status
- SAST Status
- SCA Status
- Exception Status
- Final Verdict

Search supports

- Ticket
- Repository
- Project

---

# 8. Status Indicators

## Safety Pack

| Status | Display |
|---|---|
| READY | Green |
| WARNING | Amber |
| MISSING | Red |
| PARSE_ERROR | Purple |

---

## Secret Scan

| Status | Display |
|---|---|
| PASS | Green |
| FAIL | Red |
| NOT_AVAILABLE | Gray |

---

## SAST / SCA

| Status | Display |
|---|---|
| PASS | Green |
| WARNING | Amber |
| FAIL | Red |

---

## Final Verdict

| Status | Display |
|---|---|
| PASS | Green |
| WARNING | Amber |
| FAIL | Red |

---

# 9. Navigation

The dashboard provides navigation to

- Safety Pack Detail
- Security Checklist
- Security Scan
- Security Exception
- Ticket Detail

No navigation modifies any source data.

---

# 10. Out of Scope

The following are intentionally excluded

- Secret Scan execution
- SAST execution
- SCA execution
- Exception editing
- Approval workflow
- AI Security Analysis
- Security Score
- Manual Retry
- CRUD operations
- Dashboard administration