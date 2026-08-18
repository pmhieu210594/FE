# Wireframe - Admin Audit Log

**Ticket ID**: ADMIN-AUDIT-LOG
**Create date**: 2026-07-09
**Author**: Claude
**Update date**: 2026-07-09

---

# 1. Screen Objective

The Admin Audit Log screen provides a searchable, record-level audit trail of every CRUD operation performed on the platform's administrative/master-data screens, plus every login event.

Primary objectives:

- View every CREATE/READ/UPDATE/DELETE event on Role, Organization, Customer, Project, Repository, Team, Member/User.
- View every LOGIN_SUCCESS / LOGIN_FAILED / LOGOUT event from the Login screen.
- Filter by module, operation type, actor and date range.
- Search by Actor, Entity, or IP address.
- Drill into a single event to see the before/after diff and login context.

The screen is **read-only**.

It is intended for **Administrators** and read-only **Security/Audit** users.

---

# 2. Screen Layout

```text
+----------------------------------------------------------------------------------------------------------------+
| Admin Audit Log                                                                                                |
+----------------------------------------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------------------+
| Search (Actor / Entity / IP Address) __________________________________________  [Refresh]    |
+-----------------------------------------------------------------------------------------------+

+---------------------+ +---------------------+ +---------------------+
| Module               | | Operation             | | Date Range            |
| All                  | | All                    | | Last 7 days           |
+---------------------+ +---------------------+ +---------------------+

+----------------------+ +----------------------+ +----------------------+ +----------------------+
| Login Success         | | Login Failed          | | CRUD Success           | | CRUD Failed            |
| 312                    | | 7                      | | 148                     | | 4                       |
+----------------------+ +----------------------+ +----------------------+ +----------------------+

+--------------------------------------------------------------------------------------------------------------+
| Audit Entries                                                                                                  |
+--------------------------------------------------------------------------------------------------------------+
| Time | Actor | Module | Entity | Operation | IP Address | Detail                                           |
+--------------------------------------------------------------------------------------------------------------+
```

---

# 3. Summary Cards

## Login Success / Login Failed / CRUD Success / CRUD Failed

Displays counts for the current filter selection.

Clicking a card applies the matching Module / Operation filter to the table below.

---

# 4. Audit Entries Table

```text
+----------------------------------------------------------------------------------------------------------------------+
| Audit Entries                                                                                                           |
+----------------------------------------------------------------------------------------------------------------------+
| Time       | Actor      | Module        | Entity           | Operation       | IP Address     | Detail              |
|--------------------------------------------------------------------------------------------------------------------- |
| 10:31:02   | admin.hoa  | LOGIN         | -                 | LOGIN_SUCCESS   | 10.1.2.31      | View                |
| 10:31:40   | admin.hoa  | MEMBER_USER   | member #882       | UPDATE          | 10.1.2.31      | View                |
| 10:32:05   | admin.linh | ROLE          | role #12          | CREATE          | 10.1.2.44      | View                |
| 10:33:12   | j.smith    | LOGIN         | -                 | LOGIN_FAILED    | 203.0.113.9    | View                |
| 10:35:50   | admin.hoa  | REPOSITORY    | repo #45          | DELETE          | 10.1.2.31      | View                |
+----------------------------------------------------------------------------------------------------------------------+
```

Default sorting:

1. Most recent `occurred_at` first

Pagination: standard page size with page controls.

---

# 5. Audit Detail Drawer

## 5.1 CRUD Event Example

```text
+--------------------------------------------------------------------------------------------------------------+
| Audit Detail                                                                                              [Close] |
+--------------------------------------------------------------------------------------------------------------+

Actor

admin.hoa (Administrator)

Module / Entity

MEMBER_USER / member #882

Operation

UPDATE

Occurred At

2026-07-09 10:31:40

------------------------------------------------------

Changed Fields

role, status

Before

role: Viewer
status: ACTIVE

After

role: Admin
status: ACTIVE

------------------------------------------------------

IP Address

10.1.2.31

Error Message

(none)

------------------------------------------------------

[Open Member]
```

## 5.2 Login Event Example

```text
+--------------------------------------------------------------------------------------------------------------+
| Audit Detail                                                                                              [Close] |
+--------------------------------------------------------------------------------------------------------------+

Actor (attempted)

j.smith

Module

LOGIN

Operation

LOGIN_FAILED

Occurred At

2026-07-09 10:33:12

------------------------------------------------------

IP Address

203.0.113.9

Device

Chrome / Windows

Error Message

Invalid credentials

------------------------------------------------------
```

Drawer is read-only. `Before` / `After` values shown are the masked representation stored in the log; passwords, tokens and secrets are never displayed because they are never stored.

---

# 6. Empty State

```text
+--------------------------------------------------------------------------------------+
| Admin Audit Log                                                                      |
+--------------------------------------------------------------------------------------+

No audit entries found.

Try changing:

- Module
- Operation
- Date Range

[Reset Filters]
```

---

# 7. Filters

Supported filters:

- Module (Login / Role / Organization / Customer / Project / Repository / Team / Member-User)
- Operation Type (Create / Read / Update / Delete / Login Success / Login Failed / Logout)
- Date Range

Search supports:

- Actor (username)
- Entity name/ID
- IP address

---

# 8. Status Indicators

> **Removed**: the Operation Status indicator/column and its SUCCESS/FAILED display mapping have been removed from this screen (status column/filter dropped from the feature). Only the Operation Type indicator below remains.

## Operation Type

| Operation | Display |
|---|---|
| CREATE | Green |
| READ | Gray |
| UPDATE | Blue |
| DELETE | Amber |
| LOGIN_SUCCESS | Green |
| LOGIN_FAILED | Red |
| LOGOUT | Gray |

---

# 9. Navigation

Screen links to:

- Entity Detail (Role / Organization / Customer / Project / Repository / Team / Member-User), where applicable
- Actor's Member/User profile

Screen never modifies source data or log entries.

---

# 10. Out of Scope

The following features are not included:

- Editing or deleting audit entries
- Automated alerting on suspicious activity (e.g. repeated login failures)
- Log export (CSV/JSON) — candidate for a later phase
- Session/token administration (revoke session, force logout) — separate feature
- Ingest/connector CRUD logging — tracked as a separate feature (ADMIN-AUDIT-LOG covers admin/master-data screens and Login only)
