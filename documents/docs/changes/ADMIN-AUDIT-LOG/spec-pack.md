# Spec Pack

**Ticket ID**: ADMIN-AUDIT-LOG  
**Create date**: 2026-07-09  
**Author**: Claude (Phase 1 Investigation)  
**Update date**: 2026-07-09  

---

## 1. Context / Purpose

The Admin Audit Log feature provides a complete, tamper-evident audit trail of every Create, Read, Update, Delete (CRUD) operation performed on the platform's 7 administrative/master-data screens (Role, Organization, Customer, Project, Repository, Team, Member/User), plus every Login, Logout, and Login-failure event on the Login screen. This immutable log enables compliance, incident investigation, and access review without requiring direct database access.

**Goal**: Capture every CRUD operation and login event, store it as an immutable log entry, and expose a read-only Admin Audit Log screen to authorized users (Administrators and Security/Audit personnel) to view, filter, search, and drill into individual entries.

**Business Value**:
- Compliance and audit trail for regulatory requirements
- Incident investigation: who changed what, when, and from where
- Access control review: track role and permission changes
- Security monitoring: login success/failure pattern analysis

---

## 2. Scope

### 2.1. Within Range

**Audit capture**:
- Every CREATE, UPDATE, DELETE (CRUD) operation on Role, Organization, Customer, Project, Repository, Team, Member/User management screens
- Every successful login (`LOGIN_SUCCESS`), failed login attempt (`LOGIN_FAILED`), and logout (`LOGOUT`) event on the Login screen
- Before/after value snapshots for UPDATE operations (masked for sensitive fields)
- Actor (username), IP address, User-Agent, and timestamp for every entry
- Immutable, append-only log table — no application role has UPDATE/DELETE permissions

**Screen / UI**:
- Admin Audit Log read-only screen: list, filter, search, detail drawer
- Filters: Module (Login / Role / Organization / Customer / Project / Repository / Team / Member-User), Operation Type, Actor, Date Range
- Search: Actor (username), Entity name/ID, IP address
- Summary cards: counts by module and operation type for the current filter
- Detail view: before/after diff for CRUD, login context (IP, User-Agent, error message) for login events

**Integration**:
- All 7 CRUD services (Role, Organization, Customer, Project, Repository, Team, Member/User) are modified to log audit entries
- Login/logout/login-failure paths in `AuthService` and `AuthController` are modified to log entries

### 2.2. Out of Range

- Audit logging for connector/parser ingest data (separate feature)
- Automated alerting on suspicious activity (e.g., brute-force login) — future phase
- Log export (CSV/JSON) — future phase
- Editing or deleting audit log entries
- Session/token management (this feature only logs the events)
- Log retention policies / automated purge — future phase candidate
- Extends READ logging to all list views (limited to detail views of sensitive entities only)

---

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| Audit Log Entry | Single record in `tbl_admin_audit_log` | Immutable once written |
| Module | Administrative screen or auth flow affected by the operation | One of: LOGIN, ROLE, ORGANIZATION, CUSTOMER, PROJECT, REPOSITORY, TEAM, MEMBER_USER |
| Entity Type | Logical entity type affected | One of: LOGIN_SESSION, ROLE, ORGANIZATION, CUSTOMER, PROJECT, REPOSITORY, TEAM, MEMBER, USER |
| Operation Type | Type of operation performed | CREATE, READ, UPDATE, DELETE, LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT |
| Actor | User who performed the operation | Username and optional user ID |
| Before Value | Masked state of the entity before the operation | NULL for CREATE and LOGIN; omitted for DELETE |
| After Value | Masked state of the entity after the operation | NULL for DELETE and LOGIN; omitted for CREATE |
| Masking | Stripping sensitive fields from before/after values | Passwords, tokens, secrets never stored; only fact of change recorded |
| IP Address | Source IP address of the HTTP request | Captured from request context |
| User-Agent | Browser/client identification string | Device and browser info |
| Occurred At | Timestamp of the operation in UTC | `TIMESTAMPTZ` in database |
| Draft / Official | Parse phases (not applicable to audit log; used in other features) | Audit log has no draft state; all entries are final upon write |

---

## 4. As-Is

- Administrators create, update, delete Roles, Organizations, Customers, Projects, Repositories, Teams, and Members/Users directly through their respective management screens, but **no centralized record exists of who changed what, when, or what the previous value was**.
- Users authenticate via Bearer token auth, but **login attempts (success/failure) are not tracked in a queryable, permanent way**.
- If a role, permission, or member's access is changed incorrectly, **there is no way to see the change history or who made it**.
- Compliance/security review of admin activity requires **direct database access**, which violates the principle of least privilege.
- All 7 CRUD management screens and the auth flow exist and are confirmed, but **no audit logging framework is in place**.

---

## 5. To-Be

- Every CRUD operation on the 7 management screens is **written to an append-only audit log** at the moment it happens, in the same transaction as the business operation.
- Every login/logout/login-failure event is **written to the audit log** at authentication time (outside entity write transactions for login failures).
- An authorized user (Administrator or Security/Audit read-only user) opens the **Admin Audit Log screen** and can:
  - See a chronological, paginated list of all logged events across all screens
  - Filter by Module, Operation Type, Actor, and date range
  - Search by Actor (username), Entity name/ID, or IP address
  - Drill into a single event to see the before/after value diff, actor, IP/device, and any error message
  - Trust that the log itself **cannot be altered after the fact** (immutable, append-only)

---

## 6. Detailed Specification

### 6.1. Business Rules

- The system logs exactly one entry per CRUD operation (one CREATE, one UPDATE, one DELETE).
- For UPDATE operations, the system records which fields changed, plus the before and after values (masked).
- For DELETE operations, the system records the operation but does not store after values (the entity is deleted).
- For CREATE operations, the system does not store before values (the entity did not exist).
- Passwords, API keys, session tokens, and other secrets are **never stored** in before/after values, even masked. Only the fact that the field changed is recorded (e.g., `changed_fields: password_hash`, with value omitted).
- READ operations are logged **only for record-level detail views** of Role, Member/User, and Organization (sensitive entities), not for every list view.
- If a CRUD operation fails (e.g., validation error, unique constraint violation), the system logs the attempt with an error message.
- Login failures are logged even if the username is invalid (no matching user found); in such cases, `actor_user_id` is NULL, but `actor_username` (the attempted username) is stored.
- All log entries are written in UTC timestamps.
- Log entries are immutable: no application role has UPDATE or DELETE permissions on the audit log table; the table is append-only at the database level.

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| operation_context | object | Yes | Must contain actor, module, entity_type, entity_id, operation_type, http_request_context | Passed from service/controller to audit service |
| actor_user_id | long | Conditional | NULL for failed logins; otherwise FK to user identity table | The user who performed the action |
| actor_username | string | Yes | Non-empty, max 128 chars | Display name for the actor |
| module | string | Yes | Enum: LOGIN, ROLE, ORGANIZATION, CUSTOMER, PROJECT, REPOSITORY, TEAM, MEMBER_USER | The screen/flow affected |
| entity_type | string | Yes | Enum: LOGIN_SESSION, ROLE, ORGANIZATION, CUSTOMER, PROJECT, REPOSITORY, TEAM, MEMBER, USER | Logical entity type |
| entity_id | string | Conditional | NULL for LOGIN_FAILED (no valid entity); otherwise PK of the affected entity | Business identifier or numeric ID |
| operation_type | string | Yes | Enum: CREATE, READ, UPDATE, DELETE, LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT | Type of operation |
| changed_fields | string | Conditional | Comma-separated field names; UPDATE only | Which fields changed; sensitive field names included, values omitted |
| before_value | JSONB | Conditional | Masked snapshot; no passwords/tokens/secrets; NULL for CREATE/LOGIN | Snapshot of entity before the operation |
| after_value | JSONB | Conditional | Masked snapshot; no passwords/tokens/secrets; NULL for DELETE/LOGIN | Snapshot of entity after the operation |
| user_agent | string | No | Max 256 chars | Browser/client identification |
| error_message | string | Conditional | Human-readable error text; NULL if the operation succeeded | Failure reason, if any |
| trace_id | string | Yes | Non-empty, format `trc_*`; read from MDC | Correlation ID from the request |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| admin_audit_log_id | long | Bigint PK, auto-increment | Database primary key |
| actor_user_id | long | FK or NULL | Reference to user identity; NULL for LOGIN_FAILED |
| actor_username | string | Non-empty | Display name of the actor |
| actor_role | string | Role enum or NULL | Optional: actor's role at the time (cached for audit) |
| module | string | Enum | The affected screen/flow |
| entity_type | string | Enum | Logical entity type |
| entity_id | string | PK or identifier | NULL for LOGIN_FAILED |
| operation_type | string | Enum | Type of operation |
| changed_fields | string | CSV or NULL | Field names changed (UPDATE only) |
| before_value | JSONB or NULL | Masked snapshot or NULL | Pre-operation state (nullable per operation type) |
| after_value | JSONB or NULL | Masked snapshot or NULL | Post-operation state (nullable per operation type) |
| user_agent | string or NULL | Browser string or NULL | Device/client info |
| occurred_at | TIMESTAMPTZ | UTC timestamp | When the operation happened |
| error_message | string or NULL | Human-readable text or NULL | Failure reason |
| created_at | TIMESTAMPTZ | UTC timestamp; DEFAULT NOW() | When the log entry was written (always = occurred_at) |

### 6.4. Error / Exception

| error scenario | handling |
|---|---|
| CRUD operation fails (validation, constraint, etc.) | Operation is rolled back; separate FAILED log entry is written outside the transaction (best-effort) to record the failure |
| Login attempt fails (invalid credentials, account locked, etc.) | Failure is logged immediately at auth time; actor_user_id is NULL if username is invalid; error_message contains failure reason |
| Audit log write fails (DB connectivity, permissions, etc.) | Log the exception; do not fail the business operation itself (audit log insertion is best-effort; losing an audit entry is a DB failure, not a business failure) |
| IP address cannot be extracted from request context | Log NULL or empty string; do not fail the operation |
| Masking helper encounters an unknown field type | Use conservative masking (omit value if uncertain); log a WARNING if needed |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| Username length | 1 char | 128 chars | Empty/whitespace | Reject; log with error |
| Entity ID length | 0 (NULL for LOGIN_FAILED) | 64 chars | Very long PK (UUID as string) | Store as-is; truncate if exceeds 64 |
| IP address format | IPv4 or IPv6 | Max 64 chars | Multiple proxies (X-Forwarded-For) | Use rightmost IP or first in the header; log as-is |
| User-Agent length | 0 (NULL) | 256 chars | Very long user-agent string | Truncate to 256 if needed; or use NULL if too long |
| Before/After JSONB | Minimal {} | No fixed upper bound | Very large entity (>1MB) | Store as-is; assume DB can handle; test with realistic data sizes |
| Number of changed fields | 0 (rare) | Many (e.g., 20+ in bulk update) | All fields changed | Count accurately; comma-separate field names |
| Occurred At timestamp | Any valid timestamp | Any valid timestamp | Millisecond precision vs. second precision | Use TIMESTAMPTZ precision (microseconds); compare and verify |
| Multilingual content | English field names + values in any language | Mixed Vietnamese, English, Japanese | Unicode diacritics in entity values | Store and retrieve as UTF-8; no encoding errors |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Audit log write must not noticeably block business operations | <10ms overhead per CRUD operation | Unit + integration smoke tests | Insert is synchronous in the same txn; no async queue |
| Availability / Reliability | Failed audit log write must not fail the business operation | Audit log insert is best-effort (catch and log, not propagate) | Black-box test: CRUD succeeds even if audit fails | Resilience pattern: log failure but don't break the feature |
| Security | No secrets, passwords, tokens, or PII stored in before/after values | 100% masking compliance; zero plaintext credentials | Manual code review + unit tests for masking helper | Masking whitelist approach (enumerate safe fields) |
| Immutability | No application role can UPDATE or DELETE log entries | REVOKE UPDATE, DELETE on the table; GRANT INSERT, SELECT only | DB-level permission check; black-box test: attempt UPDATE/DELETE fails | Enforced at SQL DDL, not application logic |
| Compliance / Auditability | Log entries correlate with business operations via traceId | Every entry has traceId; every business operation has traceId in logs | Log aggregation query: join audit + app logs by traceId | Support incident investigation |
| Consistency | Log entries are written atomically with business operations (CRUD) | Same transaction; all-or-nothing | Unit test: log and entity written together or both rolled back | Exception: login failures are written outside txn (best-effort) |
| Maintainability | Masking logic is centralized; easy to add new sensitive field types | Single masking helper; whitelist of safe fields | Code review; add new field test when new entity type added | Avoid scattered mask() calls; consolidate in one service |
| Observability | Audit log insertion is logged with traceId, entity, operation type | SLF4J log: `"Audit log entry written for {entity} {operation_type} {traceId}"` | Log aggregate for audit service; metrics on write volume | Support monitoring and troubleshooting |

---

## 7. Acceptance Criteria

| ACID | description | testable? | notes |
|---|---|---|---|
| AC-ADMIN-AUDIT-LOG-1 | When a CREATE operation succeeds on any of the 7 management screens (Role, Organization, Customer, Project, Repository, Team, Member/User), exactly one log entry is written with `operation_type = CREATE` | Yes | Verify via query to `tbl_admin_audit_log` after each entity creation |
| AC-ADMIN-AUDIT-LOG-2 | When an UPDATE operation succeeds, exactly one log entry is written with `operation_type = UPDATE`, `changed_fields` listing the fields that changed, and `before_value` / `after_value` containing masked snapshots | Yes | Verify via query after update; inspect `changed_fields` and JSONB values |
| AC-ADMIN-AUDIT-LOG-3 | When a DELETE operation succeeds, exactly one log entry is written with `operation_type = DELETE` and `after_value = NULL` | Yes | Verify after soft-delete or hard-delete (as used) |
| AC-ADMIN-AUDIT-LOG-4 | Passwords, API keys, session tokens, and other secrets are never stored in `before_value` or `after_value`, even in masked form; only the fact that the field changed is recorded | Yes | Manual inspection of stored JSONB; grep for known secret fields; unit test masking helper |
| AC-ADMIN-AUDIT-LOG-5 | When a CRUD operation fails (e.g., validation error, constraint violation), a log entry is written and `error_message` contains the failure reason | Yes | Trigger a validation error and verify a log entry exists with the error message populated |
| AC-ADMIN-AUDIT-LOG-6 | When a login succeeds, exactly one log entry is written with `module = LOGIN`, `operation_type = LOGIN_SUCCESS`, `actor_username` = logged-in user, and `actor_user_id` populated | Yes | Verify after successful login |
| AC-ADMIN-AUDIT-LOG-7 | When a login fails, exactly one log entry is written with `module = LOGIN`, `operation_type = LOGIN_FAILED`, `actor_username` = attempted username, and `error_message` contains the failure reason | Yes | Trigger failed login and verify log entry exists |
| AC-ADMIN-AUDIT-LOG-8 | Admin Audit Log screen displays a paginated list of audit entries, sorted by `occurred_at DESC` (most recent first), with columns: Time, Actor, Module, Entity, Operation, IP Address, and a Detail button | Yes | Open the screen; verify layout and pagination; click through pages |
| AC-ADMIN-AUDIT-LOG-9 | Screen supports filtering by Module, Operation Type, Actor, and Date Range; search by Actor (username), Entity name/ID, and IP address; and displays summary cards (count by module and operation type) for the current filter | Yes | Apply each filter and search; verify results narrow correctly; verify summary card counts match the filtered list |
| AC-ADMIN-AUDIT-LOG-10 | Detail view shows before/after diff for CRUD operations and login context (IP, User-Agent, error message) for login events; the screen is read-only (no edit or delete controls) | Yes | Click a row to open detail drawer; verify diff is shown correctly; verify no edit/delete buttons exist |

---

## 8. Examples

### 8.1. Normal Case: Role UPDATE

A user with ADMIN role updates a Role entity, changing its description and permissions.

**Operation**:
```
PUT /api/v1/roles/42
{
  "roleName": "Editor",
  "description": "Can edit tickets",   // changed
  "permissions": ["READ_TICKET", "EDIT_TICKET"]  // changed
}
```

**Expected Audit Log Entry**:
```
{
  "admin_audit_log_id": 1001,
  "actor_user_id": 5,
  "actor_username": "admin.khoa",
  "actor_role": "ADMIN",
  "module": "ROLE",
  "entity_type": "ROLE",
  "entity_id": "42",
  "operation_type": "UPDATE",
  "changed_fields": "description, permissions",
  "before_value": {
    "roleName": "Editor",
    "description": "Can edit tickets only",
    "permissions": ["READ_TICKET"]
  },
  "after_value": {
    "roleName": "Editor",
    "description": "Can edit tickets",
    "permissions": ["READ_TICKET", "EDIT_TICKET"]
  },
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
  "occurred_at": "2026-07-09T10:31:40Z",
  "error_message": null,
  "created_at": "2026-07-09T10:31:40Z"
}
```

Admin opens the Admin Audit Log screen, filters by Module = ROLE, and sees this entry. Clicking the detail button shows the before/after diff side-by-side.

### 8.2. Error Case: LOGIN_FAILED

A user attempts to log in with an invalid password.

**Operation**:
```
POST /api/v1/auth/login
{
  "username": "j.smith",
  "password": "wrongpassword"
}
```

**Expected Audit Log Entry**:
```
{
  "admin_audit_log_id": 1002,
  "actor_user_id": null,  // login will fetch user; invalid password means we don't auth
  "actor_username": "j.smith",
  "actor_role": null,
  "module": "LOGIN",
  "entity_type": "LOGIN_SESSION",
  "entity_id": null,  // no session created for failed login
  "operation_type": "LOGIN_FAILED",
  "changed_fields": null,
  "before_value": null,
  "after_value": null,
  "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) ...",
  "occurred_at": "2026-07-09T10:33:12Z",
  "error_message": "Invalid credentials",
  "created_at": "2026-07-09T10:33:12Z"
}
```

Security team opens the Admin Audit Log screen, filters by Operation Type = LOGIN_FAILED, and reviews failed login attempts to identify potential brute-force attacks.

### 8.3. Boundary Case: Password Field UPDATE (Masking)

A user updates a Member entity, changing the password hash.

**Operation**:
```
PUT /api/v1/admin/user-accounts/882
{
  "username": "user.name",
  "email": "user@example.com",
  "password_hash": "$2b$12$newhashedpassword...",  // field changed
  "status": "ACTIVE"
}
```

**Expected Audit Log Entry (Password is NOT stored)**:
```
{
  "admin_audit_log_id": 1003,
  "actor_user_id": 5,
  "actor_username": "admin.hoa",
  "module": "MEMBER_USER",
  "entity_type": "USER",
  "entity_id": "882",
  "operation_type": "UPDATE",
  "changed_fields": "password_hash",  // field name listed; value omitted
  "before_value": {
    "username": "user.name",
    "email": "user@example.com",
    "status": "ACTIVE"
    // password_hash NOT included; omitted by masking helper
  },
  "after_value": {
    "username": "user.name",
    "email": "user@example.com",
    "status": "ACTIVE"
    // password_hash NOT included; omitted by masking helper
  },
  "occurred_at": "2026-07-09T10:35:50Z",
  "error_message": null
}
```

The `changed_fields` includes `password_hash`, but the value itself is never stored. Security review can see that a password changed without exposing the hash.

### 8.4. Boundary Case: Empty List (No Audit Entries for Filter)

Admin opens the Admin Audit Log screen, filters by Module = CUSTOMER and Date Range = Last 7 days. No entries match the filter.

**Expected Screen Behavior**:
```
No audit entries found.

Try changing:
- Module
- Operation
- Date Range

[Reset Filters]
```

---

## 9. Source Availability Summary

- `raw/requirement.md`: Primary source for AC, 8 modules, login audit, FR-AUD/FR-LGN/FR-MSK/FR-SCR groups. High trust.
- `raw/database_design.md`: Primary source for 1 new table, append-only immutability, masking rules, write path, indexes, migration checklist. High trust.
- `raw/wireframe.md`: Primary source for screen layout, filters, search, detail drawer, summary cards. High trust. (Status indicators section has since been removed along with the operation-status column/filter.)
- `docs/architecture/overview.md`, `security.md`, `logging.md`: Supporting; confirm hexagonal layers, error response shape, traceId + SLF4J standards. Medium-high trust.
- `docs/standards/database.md`, `testing.md`: Supporting; confirm Flyway migration conventions, MyBatis patterns, test patterns. Medium-high trust.
- Existing source code (7 CRUD controllers/services, `AuthService`, `AuthController`, `GlobalExceptionHandler`, `PageResult`, pagination pattern): High trust; confirmed to exist and ready for audit logging integration.
- **Critical gap**: The user identity table is named `tbl_auth_user_account`, not `tbl_dim_member`/`tbl_dim_user` as the database design assumed. Requires confirmation on which table audit log should reference.

---

## 10. Complexity Classification

```text
Complexity: Complex
System shape: BE + DB + FE (scope expanded 2026-07-09, human decision — FE originally deferred, now pulled into this ticket)
Primary risk: User table reference mismatch, audit logging interception strategy, masking completeness, FE read-only enforcement
Review mode: Heavy (security, masking, immutability must be verified)
Required options: Security Review, DB Migration, Data Masking Verification, Source Code Audit, FE Review
Effort estimate: ~3-4 weeks (assuming 2-3 engineers: 1 backend, 1 DB/migration, 1 FE, 1 testing)
Test coverage: Unit (masking, service logic) + Integration (CRUD + audit capture) + Black-box (screen + filter/search) + Security (immutability, masking compliance)
```

---

## 11. FE/BE Contract Impact

- **Backend new endpoints** (implemented, Phase 5):
  - `GET /api/v1/admin/audit-logs` (list, paginated, with filters and search)
  - `GET /api/v1/admin/audit-logs/{id}` (detail view)
  
- **Backend response DTOs** (implemented, Phase 5):
  - `AdminAuditLogPageDto` (paginated list with `PageResult<AdminAuditLogListItemDto>`)
  - `AdminAuditLogListItemDto` (id, actorUsername, module, entityType, entityId, operationType, occurredAt)
  - `AdminAuditLogDetailDto` (full entry with before/after JSON strings, changedFields, errorMessage, traceId)

- **Frontend impact — Revised 2026-07-09 (human decision)**: FE scope pulled into this ticket.
  - New read-only "Admin Audit Log" screen in `EDCAP_FE`, admin-only route, consuming the two endpoints above.
  - List: paginated table (Time, Actor, Module, Entity, Operation, IP Address, Detail button), filters (Module, Operation Type, Actor, Date Range), search (Actor/Entity/IP), summary cards (count by module/operation type for the current filter — computed client-side from the returned page for MVP; no dedicated summary endpoint was added on BE, see `self-review.md` §8).
  - Detail: drawer/modal showing before/after diff (rendered from the JSON string fields) and login context (IP, User-Agent, error message).
  - No mutation controls (edit/delete) anywhere on this screen, per AC-10 and `ticket-rules.md`.
  - FE should follow the existing admin-screen pattern (API client, routing, admin-role gating, table/filter/detail components) already used by the Role/Organization/Customer/Project/Repository/Team/User-Account admin screens — see `impl-plan.md` for the exact files once confirmed against the FE codebase.

- **No FE/BE contract changes to existing endpoints**. All 7 CRUD endpoints and auth endpoints remain unchanged from the caller's perspective; audit logging is transparent (wired on the BE side only).

---

## 12. DB/Migration Impact

- **Revised 2026-07-09 (human decision)**: reuse the existing, currently-unused `tbl_fact_access_log` table (created in `V4__init_shema_v2.sql`) instead of creating a new `tbl_admin_audit_log` table. This table was missed by earlier source-discovery phases (`context.md`, `impact-analysis.md`, `source-inventory.md` did not mention it) — logged as a documentation gap.
- **Why reuse is feasible**: `tbl_fact_access_log` already provides `access_log_id` (PK, UUID), `target_type`/`target_id` (→ renamed `entity_type`/`entity_id`), `action` (→ renamed `operation_type`), `trace_id`, `occurred_at`, and an existing `idx_access_log_time` index. It does **not** fit as-is: `actor_member_key` references `tbl_dim_member_pseudonym` (a pseudonym dimension for the workbench's own project/team tracking, unrelated to login identity), `ip_hash`/`user_agent_hash` are one-way hashes (spec requires displaying raw IP/UA on the screen), and there are no diff/module/error columns. These gaps are closed by `ALTER TABLE` in the new migration, not by editing `V4__init_shema_v2.sql`.
  - **Status/`result` no longer used by this feature**: the Admin Audit Log feature no longer stores, filters, or displays an operation-status column. `tbl_fact_access_log.result` (`access_result` enum SUCCESS/DENIED/FAILED) is **left in place, unused by this feature** — it is not renamed to `operation_status` and not exposed by the audit-log API/DTOs/UI. The column continues to exist in the table for whatever other purpose it originally served; only this feature's use of it as a filterable "status" is removed.
- **ALTER plan** (new migration, table renamed columns + additive columns):
  - Rename: `target_type` → `entity_type`, `target_id` → `entity_id`, `action` → `operation_type`.
  - Reuse as-is: `access_log_id` (PK), `trace_id`, `occurred_at`, `actor_role_id` (FK → `tbl_dim_role`, kept for join convenience).
  - Add: `actor_user_id` (UUID, nullable, FK → `tbl_auth_user_account(user_account_id)`), `actor_username` (VARCHAR NOT NULL), `actor_role_name` (VARCHAR, point-in-time snapshot so historical rows don't shift if a role is renamed), `module` (VARCHAR + CHECK enum), `changed_fields` (TEXT, comma-separated), `before_value` (JSONB), `after_value` (JSONB),  `user_agent` (VARCHAR, raw), `error_message` (TEXT).
  - Add CHECK constraints for `module` and `operation_type` enum values.
  - Leave `result`, `ip_hash`, `user_agent_hash`, `actor_member_key`, `purpose`, `project_id`, `repository_id` in place, unused by this feature (no destructive drop of an existing, if dormant, column).
- **Indexes**: add `idx_access_log_actor_user`, `idx_access_log_entity` (entity_type, entity_id), `idx_access_log_module_operation` (module, operation_type). `occurred_at` index already exists.
- **Immutability — revised approach**: `REVOKE UPDATE, DELETE` is ineffective here because the single application DB role (`sdd`, see `application.yml`) owns the table and Postgres table owners bypass `REVOKE`. Use a `BEFORE UPDATE OR DELETE` trigger that raises an exception instead, which applies regardless of role/ownership.
- **New migration file**: `V500__admin_audit_log.sql` (verified next-free version; `V5` is already used by `V5__alter_tbl_dim_organization_for_management.sql`, and the highest existing version is `V495`).
- **No existing migrations modified**. New migration only alters `tbl_fact_access_log` via `ALTER TABLE`/new trigger; it does not touch `V4__init_shema_v2.sql` or any other file.
- **Seed data**: No new seed data needed for the MVP.

---

## 13. Security / Privacy Impact

- **Masking compliance**: No passwords, API keys, session tokens, or secrets are stored, even masked. Only the field name and the fact that a change occurred is logged.
- **PII minimization**: `before_value` and `after_value` JSONB may contain PII (names, emails); access to audit log query results must follow role permissions (Administrators and Security/Audit users only).
- **Immutable log**: The log table is append-only; no application role can modify or delete entries. Forensic integrity is guaranteed at the DB level.
- **IP address logging**: IP is captured from HTTP request context; helps identify source of unauthorized operations (e.g., lateral movement, account takeover).
- **No raw auth details stored**: Session tokens, OAuth bearer tokens, webhook secrets, and API keys are never logged, not even in error messages.
- **Error message handling**: Error messages logged for failed operations must not expose sensitive details (e.g., "Duplicate username" is OK; "Duplicate username john.smith@example.com" is not). Requires sanitization at the point of logging.
- **Access control**: The `/api/v1/admin/audit-logs` endpoint and `tbl_admin_audit_log` table queries must be restricted to Administrators and Security/Audit read-only roles. Spring Security `@PreAuthorize` and row-level filters (if future phases add multi-tenant support) enforce this.

---

## 14. Operation / Maintenance Impact

- **Log growth**: The audit log will grow continuously. For a platform with ~100 admin/management operations per day, expect ~3,000 entries per month. Performance of list queries depends on index strategy (see database design).
- **Idempotency**: Each CRUD or login operation is logged once. If an operation is retried (e.g., network timeout), the retry creates a separate log entry. This is correct behavior (both attempts are recorded).
- **Traceability**: Every log entry has a `trace_id` (read from MDC) that correlates with application and infrastructure logs. Support teams can investigate an audit entry and cross-reference the full request context via the trace ID.
- **Data retention**: The MVP does not include log purge/archival. Retention policy is a future phase decision (see Section 18 Open Issues).
- **Masking helper maintenance**: When a new entity type is added to the audit log scope, the masking helper's whitelist must be updated to include the new safe fields. Test coverage for masking must expand correspondingly.
- **Screen refresh**: The Admin Audit Log screen queries `tbl_admin_audit_log` directly (no cache/view). Manual refresh button triggers a fresh query. The FE may implement polling or WebSocket-based near-real-time updates in future phases.

---

## 15. Test Strategy Summary

### Unit Tests
- Masking helper: Test that passwords, tokens, secrets are omitted from before/after snapshots; test that safe fields (username, email, status) are preserved.
- Audit logging service: Test log entry creation with correct actor, module, entity, operation type, status.
- Controller logging interceptor (if AOP/aspect is chosen): Test that CREATE/UPDATE/DELETE operations trigger log calls; test that log creation failures don't fail the operation (best-effort).

### Integration Tests
- Each of the 7 CRUD services (Role, Organization, Customer, Project, Repository, Team, Member/User): Execute a CREATE, UPDATE, DELETE, READ operation; verify one log entry per operation is written to the database.
- Auth service / AuthController: Execute successful login, failed login, logout; verify log entries are written correctly.
- Data masking in context: Update a Member entity with password field changed; verify the JSONB before/after snapshots do not contain the password hash.
- Failed operation logging: Trigger a validation error (e.g., duplicate name) on a CREATE operation; verify a FAILED log entry is written with error message.

### Black-Box / End-to-End Tests
- Admin Audit Log screen list view: Open the screen; verify paginated list of entries is displayed.
- Filters: Apply each filter (Module, Operation Type, Actor, Date Range); verify list narrows correctly.
- Search: Search by username, entity ID, IP address; verify matching entries are returned.
- Summary cards: Verify count cards (Login Success, Login Failed, CRUD Success, CRUD Failed) match the filtered list.
- Detail view: Click an entry; open detail drawer; verify before/after diff is correct; verify no edit/delete buttons exist.
- Immutability verification: Attempt to UPDATE or DELETE a log entry via raw SQL or API; verify it fails (permissions denied).

### Regression Tests
- Existing CRUD endpoint performance: Measure response time with audit logging enabled; ensure overhead is <10ms per operation.
- Existing login flow: Verify login/logout still works correctly with audit logging wired in.

---

## 16. Human Decision Required

1. **User Identity Table Reference**: The requirement assumes `tbl_dim_member` or `tbl_dim_user` exists, but the actual user table is `tbl_auth_user_account`. Should `actor_user_id` foreign key reference `tbl_auth_user_account.id`? Or is there a different intended user table?

2. **Audit Logging Interception Strategy**: Should audit logging be implemented via:
   - A) Explicit `auditLogService.logCreate()` calls in each service method?
   - B) AOP/aspect interceptor on `@Transactional` service methods (decorator pattern)?
   - C) Controller-level cross-cutting concern via a filter/interceptor?

3. **READ Logging Scope**: Should READ logging include all list views (`GET /api/v1/roles`), or only record-level detail views (`GET /api/v1/roles/{id}`)? The requirement says "detail views only", but confirmation is needed.

4. **Foreign Key Strictness**: Should `actor_user_id` have a strict `NOT NULL` foreign key constraint, or should it be nullable (resilience if a user is deleted from `tbl_auth_user_account`)? Current design allows NULL for LOGIN_FAILED; should it also allow NULL for other operations if user is deleted?

---

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-ADMIN-AUDIT-LOG-1 | All 7 CRUD services will log entries via a centralized `AdminAuditLogService` | Requirement + source code investigation confirmed all 7 services exist | Low | No |
| A-ADMIN-AUDIT-LOG-2 | Login/logout/login-failure events will be logged in `AuthService.login()`, `AuthService.logout()`, and exception handlers in `AuthController` | Requirement + source code investigation confirmed `AuthService` exists | Low | No |
| A-ADMIN-AUDIT-LOG-3 | Masking will use a whitelist of safe fields (e.g., name, email, status) and omit any field name matching a secret pattern (e.g., *password*, *token*, *secret*) | Database design specifies masking rule; security standard recommends whitelist approach | Medium | No (design locked) |
| A-ADMIN-AUDIT-LOG-4 | The audit log table will be append-only; application role has no UPDATE/DELETE permissions; enforced at SQL DDL level | Database design Section 4.1 locks in REVOKE/GRANT strategy | Low | No |
| A-ADMIN-AUDIT-LOG-5 | HTTP request IP and User-Agent will be captured via `BearerTokenAuthenticationFilter` or a new request context filter | Source code investigation found `BearerTokenAuthenticationFilter` builds `WebAuthenticationDetails`; currently unused | Medium | No (implementation detail) |
| A-ADMIN-AUDIT-LOG-6 | The `tbl_auth_user_account` table (not `tbl_dim_member`) is the correct reference for actor user identity | Source code investigation found `tbl_auth_user_account` exists; `tbl_dim_member` does not exist | High | **YES — CRITICAL** |
| A-ADMIN-AUDIT-LOG-7 | Pagination and list-screen DTO patterns are reusable from `UserAccountAdminController.list()` and `PageResult<T>` | Source code investigation confirmed patterns exist and are in use | Low | No |
| A-ADMIN-AUDIT-LOG-8 | TraceId correlation will be enforced via MDC; every log entry and every audit entry will have matching trace IDs | Logging standards document confirms traceId via MDC; `TraceIdFilter` injects it | Low | No |
| A-ADMIN-AUDIT-LOG-9 | The screen is read-only; the `/api/v1/admin/audit-logs` endpoint will support GET (list and detail) only, no POST/PUT/DELETE | Requirement specifies read-only screen; database design specifies append-only log | Low | No |
| A-ADMIN-AUDIT-LOG-10 | Spring Security `@PreAuthorize` will restrict audit log endpoints to ADMIN role | Architecture follows hexagonal layer pattern; existing `AdminController` uses inline role checks | Medium | No (can follow existing pattern) |

---

## 18. Open Issues

1. **User Identity Table Mismatch**: The database design assumes `tbl_dim_member` or `tbl_dim_user`, but the actual table is `tbl_auth_user_account`. Clarification needed on which table to reference and whether a `tbl_dim_member` table is planned but not yet created.

2. **Log Retention Policy** (candidate for future phase): What is the retention period for audit log entries? (e.g., 1 year for security audit, 7 years for compliance, indefinite). Should old entries be archived or purged automatically?

3. **Automated Alerting on Suspicious Activity** (out of scope; candidate for future phase): Should the system alert administrators on repeated failed logins from the same IP, or permission changes to sensitive roles? This is a security monitoring feature, not part of the MVP.

4. **Log Export / Reporting** (out of scope; candidate for future phase): Should the screen support CSV/JSON export for compliance/audit requests? Currently MVP is view-only.

5. **Session / Token Administration** (out of scope): Should there be a companion feature to revoke sessions or force logout based on audit findings? Currently, audit log is read-only; action-based response is future.

6. **Ingest / Connector Audit Logging** (separate feature, out of scope): Audit logging for connector/parser CRUD operations (e.g., artifact scanner runs) is tracked separately, not in this ticket.

7. **Audit Log Performance at Scale**: The MVP has no partitioning or archival strategy. If the log grows to >100M entries, query performance on the list/filter screen may degrade. A future phase should evaluate range partitioning on `occurred_at` or archival to a separate table.

8. **Multi-Tenant Isolation** (future phase): If EDCAP becomes multi-tenant, audit log entries must be scoped to the tenant. Currently, no tenant column is defined. This is deferred pending a multi-tenant architecture decision.
