# Requirement Document - Admin Audit Log

**Ticket ID**: ADMIN-AUDIT-LOG
**Create date**: 2026-07-09
**Author**: Claude
**Update date**: 2026-07-09

---

# 1. Screen Overview

- **Screen name:** Admin Audit Log
- **Business purpose:** Provide a complete, tamper-evident audit trail of every Create, Read, Update, Delete (CRUD) operation performed on the platform's administrative/master-data screens, plus every login attempt, and let authorized users view and search that trail.
- **Primary users:** Administrator.
- **Authorized users:** Administrator, Security/Audit (read-only).
- **Reason:** The platform's admin screens (Login, Role, Organization, Customer, Project, Repository, Team, Member/User) change data that affects access control and org structure. Without a centralized, immutable log of who did what, when, from where, incident investigation, access reviews and compliance requests require manual DB inspection or are not possible at all.
- **Goal of this version:** Capture every CRUD operation performed on the 7 management screens below, capture every login attempt on the Login screen, store both as an immutable audit log, and expose a read-only screen to view, filter, search and drill into individual entries.

---

# 2. Scope

## 2.1 In Scope

Audit logging for the following screens:

- Login screen — login success, login failure, logout
- Role management screen — CRUD on roles and role-permission assignment
- Organization management screen — CRUD on organizations
- Customer management screen — CRUD on customers
- Project management screen — CRUD on projects
- Repository management screen — CRUD on repositories
- Team management screen — CRUD on teams
- Member / User management screen — CRUD on members/users, including role assignment

Plus:

- Before/after value capture for UPDATE (masked, see 6.2)
- Actor, IP address and timestamp capture for every event
- Admin Audit Log screen: list, filter, search, detail drawer
- Immutability of stored log entries (append-only)

## 2.2 Out of Scope

- CRUD logging for connector/parser ingest data (tracked separately, not part of this ticket)
- Editing or deleting audit log entries
- Automated alerting on suspicious activity (e.g. brute-force login) — candidate for a later phase
- Log export (CSV/JSON) — candidate for a later phase
- Session/token management itself (this screen only logs the events, it does not manage sessions)

---

# 3. Current State Summary

Administrators create, update and delete Roles, Organizations, Customers, Projects, Repositories, Teams and Members/Users directly through their respective management screens, and users authenticate through the Login screen, but:

- No centralized record exists of who changed what, when, or what the previous value was.
- Login attempts (success/failure) are not tracked in a queryable, permanent way.
- If a role permission or a member's access is changed incorrectly, there is no way to see the change history or who made it.
- Compliance/security review of admin activity requires direct database access.

---

# 4. Target State Summary

Every CRUD operation on the 7 management screens, and every login/logout/login-failure event on the Login screen, is written to an append-only audit log at the moment it happens.

An authorized user opens the Admin Audit Log screen and can:

- See a chronological list of all logged events across all screens.
- Filter by Module (screen), Operation Type, Actor, and date range.
- Search by Actor (username), Entity name/ID, or IP address.
- Drill into a single event to see the before/after value diff and login context (IP, device).
- Trust that the log itself cannot be altered after the fact.

---

# 5. Change Requirements

| Section | Current State | Target State | Requirement | Keep / Change / New | Notes |
|---|---|---|---|---|---|
| Login Audit | Not captured | Captured (success/failure/logout) | New | New | |
| Role CRUD Audit | Not captured | Captured | New | New | Includes permission assignment |
| Organization CRUD Audit | Not captured | Captured | New | New | |
| Customer CRUD Audit | Not captured | Captured | New | New | |
| Project CRUD Audit | Not captured | Captured | New | New | |
| Repository CRUD Audit | Not captured | Captured | New | New | |
| Team CRUD Audit | Not captured | Captured | New | New | |
| Member/User CRUD Audit | Not captured | Captured | New | New | Includes role assignment change |
| Audit Log Screen | None | Dashboard-style screen | New | New | Read-only |
| Audit Log Immutability | N/A | Append-only, no edit/delete | New | New | Enforced at DB level |

---

# 6. Functional Requirements

## 6.1 CRUD Audit Capture (Role / Organization / Customer / Project / Repository / Team / Member-User)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-AUD-001 | The system records one log entry for every CREATE performed on Role, Organization, Customer, Project, Repository, Team or Member/User | Must | Creating a new Team produces exactly 1 CREATE log entry |
| FR-AUD-002 | The system records one log entry for every UPDATE, including the list of changed fields | Must | Renaming an Organization produces 1 UPDATE entry listing `name` in `changed_fields` |
| FR-AUD-003 | The system records one log entry for every DELETE (including soft-delete/deactivate) | Must | Deactivating a Member produces 1 DELETE (or DEACTIVATE) log entry |
| FR-AUD-004 | The system records READ only for record-level detail views of Role, Member/User and Organization (sensitive entities), not for every list view | Should | Opening a Member detail page produces 1 READ entry; opening the Member list does not |
| FR-AUD-005 | Each log entry stores the acting user, screen/module, entity type, entity ID, operation type, before/after value (masked), IP address and timestamp | Must | All fields populated except nullable ones (e.g. before_value on CREATE) |
| FR-AUD-006 | Role and permission changes on a Member/User record additionally log the old and new role/permission set | Must | Changing a Member's role from `Viewer` to `Admin` shows both values in the diff |
| FR-AUD-007 | Log entries are immutable once written; no UPDATE or DELETE is permitted on the log table itself | Must | Attempting to modify a log row is rejected at the database level |
| FR-AUD-008 | If a CRUD operation fails (e.g. validation error), the system logs the attempt with an error message | Must | A failed Role creation produces a log entry with an error message describing the failure |

## 6.2 Login Audit Capture

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-LGN-001 | The system logs every successful login with actor, IP address, device/user agent and timestamp | Must | A successful login produces 1 LOGIN_SUCCESS entry |
| FR-LGN-002 | The system logs every failed login attempt with the attempted username, IP address and timestamp | Must | A failed login produces 1 LOGIN_FAILED entry |
| FR-LGN-003 | The system logs logout events | Should | A logout produces 1 LOGOUT entry |
| FR-LGN-004 | Passwords or password hashes are never stored in the audit log | Must | A manual check of LOGIN_FAILED entries finds no password value |

## 6.3 Data Masking

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-MSK-001 | Before/after values never contain plaintext passwords, tokens, secrets or full credential data | Must | A manual check of stored `before_value`/`after_value` finds no password/token/secret |
| FR-MSK-002 | Password change events log only the fact that the password changed (boolean), not the value | Must | A password reset entry shows `changed_fields: password_hash` with no value in before/after |

## 6.4 Admin Audit Log Screen

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-SCR-001 | Display a chronological, paginated list of audit entries | Must | Newest entries appear first |
| FR-SCR-002 | Support filtering by Module (Login / Role / Organization / Customer / Project / Repository / Team / Member-User), Operation Type, Actor, Date range | Must | Selecting a filter narrows the list accordingly |
| FR-SCR-003 | Support search by Actor (username), Entity name/ID, IP address | Must | Typing a username returns matching entries |
| FR-SCR-004 | Support drill-down to a Detail view showing before/after diff, actor, IP/device (for login) and error message (if any) | Must | Clicking a row opens the detail drawer |
| FR-SCR-005 | Screen is strictly read-only; no action modifies underlying data | Must | No edit/delete controls exist on screen |
| FR-SCR-006 | Show a summary of counts by module and operation type for the current filter | Should | Summary cards update when filters change |

---

# 7. Data Items

| Field | Meaning |
|---|---|
| Actor | User who performed the action |
| Module | Screen: Login / Role / Organization / Customer / Project / Repository / Team / Member-User |
| Entity Type | Logical entity affected (e.g. ROLE, ORGANIZATION, MEMBER) |
| Entity ID | Primary key / identifier of the affected record |
| Operation Type | CREATE / READ / UPDATE / DELETE / LOGIN_SUCCESS / LOGIN_FAILED / LOGOUT |
| Changed Fields | Field names changed (UPDATE only) |
| Before Value | Masked snapshot before the change |
| After Value | Masked snapshot after the change |
| IP Address | Source IP of the request |
| User Agent | Client/device info |
| Occurred At | Timestamp of the event |
| Error Message | Failure reason, if any |

---

# 8. Acceptance Criteria

- AC-AUDIT-1 Every CREATE/UPDATE/DELETE on Role, Organization, Customer, Project, Repository, Team, Member/User produces a log entry.
- AC-AUDIT-2 Every login success, login failure and logout on the Login screen produces a log entry.
- AC-AUDIT-3 Log entries store before/after values with sensitive content (passwords, tokens, secrets) masked or excluded.
- AC-AUDIT-4 Log entries are immutable after creation.
- AC-AUDIT-5 Failed operations are logged with an error message.
- AC-AUDIT-6 Admin Audit Log screen is displayed.
- AC-AUDIT-7 Screen supports filtering by Module, Operation Type, Actor and date range.
- AC-AUDIT-8 Screen supports search by Actor, Entity, IP address.
- AC-AUDIT-9 Screen supports drill-down to a log detail view with before/after diff.
- AC-AUDIT-10 Screen is read-only.

---

# 9. Open Points

- Log retention period (e.g. 1 year for security audit vs indefinite).
- Whether failed-login threshold should trigger account lockout / alerting (separate ticket candidate).
- Export capability for compliance/audit requests (CSV/JSON).
- Whether READ logging should extend to Organization/Customer/Project/Repository/Team detail views, or stay limited to Role and Member/User (higher-sensitivity entities).
- Confirm whether `tbl_dim_organization`, `tbl_dim_customer`, `tbl_dim_team`, `tbl_dim_member`, `tbl_dim_role` already exist elsewhere in the schema or need to be created as part of this ticket.
