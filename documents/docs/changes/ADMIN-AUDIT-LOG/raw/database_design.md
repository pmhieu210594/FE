# Database Design - Admin Audit Log

**Ticket ID**: ADMIN-AUDIT-LOG
**Create date**: 2026-07-09
**Author**: Claude
**Update date**: 2026-07-09

---

# 1. Purpose

The Admin Audit Log captures an immutable, record-level history of every CRUD operation performed on the platform's administrative/master-data screens — Role, Organization, Customer, Project, Repository, Team, Member/User — plus every Login/Logout/Login-failure event.

This feature **introduces one new table**. No existing table captures per-record change history or login events.

The Admin Audit Log screen is **read-only**. The underlying log table is **append-only**.

---

# 2. New Table

| Table | Purpose |
|---|---|
| `tbl_admin_audit_log` | Immutable, record-level audit trail for CRUD on admin/master-data screens and for Login/Logout/Login-failure events |

---

# 3. Referenced / Assumed Existing Tables

The audit log references the master-data entities it logs against. These are assumed to already exist (or to be created together with their respective management screens) — this ticket does not redefine them, it only logs against them:

| Table | Purpose |
|---|---|
| `tbl_dim_organization` | Organization master data |
| `tbl_dim_customer` | Customer master data |
| `tbl_dim_project` | Project master data |
| `tbl_dim_repository` | Repository master data |
| `tbl_dim_team` | Team master data |
| `tbl_dim_member` (or `tbl_dim_user`) | Member/User master data |
| `tbl_dim_role` | Role master data |

> If any of the above do not yet exist, confirm ownership before this ticket starts — see Open Points in the requirement document.

---

# 4. Table Definition: `tbl_admin_audit_log`

```sql
CREATE TABLE tbl_admin_audit_log (
    admin_audit_log_id   BIGSERIAL PRIMARY KEY,

    actor_user_id          BIGINT       REFERENCES tbl_dim_member(member_id),
    actor_username         VARCHAR(128) NOT NULL,
    actor_role             VARCHAR(64),

    module                 VARCHAR(32)  NOT NULL,
    -- 'LOGIN' | 'ROLE' | 'ORGANIZATION' | 'CUSTOMER' | 'PROJECT'
    -- | 'REPOSITORY' | 'TEAM' | 'MEMBER_USER'

    entity_type             VARCHAR(32)  NOT NULL,
    -- 'LOGIN_SESSION' | 'ROLE' | 'ORGANIZATION' | 'CUSTOMER' | 'PROJECT'
    -- | 'REPOSITORY' | 'TEAM' | 'MEMBER' | 'USER'
    entity_id               VARCHAR(64),   -- NULL for LOGIN_FAILED (no valid user matched)

    operation_type           VARCHAR(24)  NOT NULL,
    -- 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
    -- | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT'
    -- NOTE: 'operation_status' (SUCCESS/FAILED) column removed — status is no longer
    -- part of the Admin Audit Log feature's stored/filterable/displayed fields.

    changed_fields           TEXT,                    -- comma-separated field names, UPDATE only
    before_value              JSONB,                   -- masked snapshot, NULL for CREATE/LOGIN
    after_value                JSONB,                   -- masked snapshot, NULL for DELETE

    ip_address                 VARCHAR(64),
    user_agent                 VARCHAR(256),

    occurred_at                 TIMESTAMPTZ  NOT NULL,
    error_message                TEXT,

    created_at                   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

## 4.1 Immutability

The log is append-only. No application role is granted `UPDATE` or `DELETE` on this table:

```sql
REVOKE UPDATE, DELETE ON tbl_admin_audit_log FROM app_write_role;
GRANT  INSERT, SELECT  ON tbl_admin_audit_log TO app_write_role;
```

Only `INSERT` is permitted by the application write path; the audit-screen read role gets `SELECT` only.

---

# 5. Data Masking Rule

`before_value` / `after_value` never store:

- Plaintext passwords or password hashes
- Session tokens, API keys, secrets
- Any credential value

Password/secret field changes are logged as `changed_fields: password_hash` (or similar) with the value itself **omitted** from both `before_value` and `after_value`. Non-sensitive fields (name, status, email, role assignment, dates) are stored as-is.

---

# 6. Mapping Between UI and Database

| UI Field | Source |
|---|---|
| Actor | `tbl_admin_audit_log.actor_username` |
| Module | `tbl_admin_audit_log.module` |
| Entity Type | `tbl_admin_audit_log.entity_type` |
| Entity ID | `tbl_admin_audit_log.entity_id` |
| Operation | `tbl_admin_audit_log.operation_type` |
| Changed Fields | `tbl_admin_audit_log.changed_fields` |
| Before / After | `tbl_admin_audit_log.before_value` / `after_value` |
| IP Address | `tbl_admin_audit_log.ip_address` |
| Device | `tbl_admin_audit_log.user_agent` |
| Occurred At | `tbl_admin_audit_log.occurred_at` |
| Error Message | `tbl_admin_audit_log.error_message` |

---

# 7. Suggested Queries

### 7.1 List audit entries by module

```sql
SELECT *
FROM tbl_admin_audit_log
WHERE module = :module
ORDER BY occurred_at DESC;
```

### 7.2 History of a single entity

```sql
SELECT operation_type, occurred_at, changed_fields, before_value, after_value, actor_username
FROM tbl_admin_audit_log
WHERE entity_type = :entity_type
  AND entity_id = :entity_id
ORDER BY occurred_at ASC;
```

### 7.3 Search by actor / entity / IP

```sql
SELECT *
FROM tbl_admin_audit_log
WHERE (:actor_username IS NULL OR actor_username ILIKE '%' || :actor_username || '%')
  AND (:entity_id IS NULL OR entity_id = :entity_id)
  AND (:ip_address IS NULL OR ip_address = :ip_address)
ORDER BY occurred_at DESC;
```

### 7.4 Login failures (for security review)

```sql
SELECT actor_username, ip_address, occurred_at, error_message
FROM tbl_admin_audit_log
WHERE module = 'LOGIN'
  AND operation_type = 'LOGIN_FAILED'
ORDER BY occurred_at DESC;
```

### 7.5 Operation summary for current filter

```sql
SELECT module, operation_type, COUNT(*)
FROM tbl_admin_audit_log
WHERE occurred_at BETWEEN :date_from AND :date_to
GROUP BY module, operation_type;
```

---

# 8. Index Recommendation

```sql
CREATE INDEX idx_admin_audit_log_actor      ON tbl_admin_audit_log(actor_user_id);
CREATE INDEX idx_admin_audit_log_entity     ON tbl_admin_audit_log(entity_type, entity_id);
CREATE INDEX idx_admin_audit_log_module_op  ON tbl_admin_audit_log(module, operation_type);
CREATE INDEX idx_admin_audit_log_occurred   ON tbl_admin_audit_log(occurred_at DESC);
CREATE INDEX idx_admin_audit_log_ip         ON tbl_admin_audit_log(ip_address);
```

---

# 9. Write Path

Every write made through a management screen (Role, Organization, Customer, Project, Repository, Team, Member/User) is wrapped so that the business write and the log INSERT happen in the **same transaction**:

```text
BEGIN
  1. Perform CREATE/UPDATE/DELETE on target entity table
  2. INSERT matching row into tbl_admin_audit_log
COMMIT
```

Login events are written immediately at authentication time (success or failure), outside of any entity-write transaction, since a failed login has no entity to update.

If a business write fails, both the write and its log entry are rolled back together, and a FAILED log entry is written outside the transaction (best-effort) so the failure itself is not silently lost.

---

# 10. Refresh Rules

The Admin Audit Log screen queries `tbl_admin_audit_log` directly; there is no separate aggregation/cache table for the PoC. The screen refreshes:

- On manual Refresh
- On new entries arriving that match the current filter (near-real-time, e.g. short polling interval)

---

# 11. Implementation Notes

- One new table only: `tbl_admin_audit_log`.
- Table is append-only; no update/delete grants.
- Business write and log write occur in the same transaction (except Login, written at auth time).
- Passwords, tokens and secrets are never stored, even masked — only the fact that they changed.
- Existing/assumed master-data tables (`tbl_dim_organization`, `tbl_dim_customer`, `tbl_dim_project`, `tbl_dim_repository`, `tbl_dim_team`, `tbl_dim_member`, `tbl_dim_role`) are referenced, not duplicated.

---

# 12. Migration Checklist

| No | Task | Required |
|---:|---|---:|
| 1 | Create `tbl_admin_audit_log` table | Yes |
| 2 | Create indexes listed in Section 8 | Yes |
| 3 | Revoke UPDATE/DELETE grants on the log table | Yes |
| 4 | Confirm existence/ownership of `tbl_dim_organization`, `tbl_dim_customer`, `tbl_dim_team`, `tbl_dim_member`, `tbl_dim_role` | Yes |
| 5 | Wrap Role/Organization/Customer/Project/Repository/Team/Member-User write paths to insert log rows in the same transaction | Yes |
| 6 | Wire Login/Logout/Login-failure events into the log at authentication time | Yes |
| 7 | Implement masking helper to strip password/token/secret values before storage | Yes |
| 8 | Performance review after implementation | Recommended |
