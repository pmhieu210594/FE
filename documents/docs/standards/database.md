# Database Standards

## Migration Tool (Confirmed)

Flyway 10.x. All schema changes go through versioned migration files — never ad-hoc SQL.

Config (`application.yml`):
```yaml
spring.flyway:
  enabled: true
  baseline-on-migrate: true
  locations: classpath:db/migration
```

---

## Migration File Naming (Confirmed)

```
V{n}__{snake_case_description}.sql
```

Examples:
```
V1__init_schema.sql
V4__init_schema_v2.sql
V5__add_tbl_finding.sql      ← new tables use tbl_ prefix (PJ1)
```

Rules:
- Two underscores between version and description
- Descriptions in `snake_case`
- Never edit a committed migration — write a new one
- `V2__seed_demo_data.sql` pattern is acceptable for initial dev data; remove before production

---

## Table Naming (Confirmed)

| Era | Pattern | Example |
|-----|---------|---------|
| V1–V4 legacy | `snake_case`, no prefix | `ticket`, `app_user`, `pull_request` |
| V5+ new tables | `tbl_<category>_<name>` | `tbl_dim_finding`, `tbl_fact_score`, `tbl_auth_scope` |

V4 category prefixes:
- `tbl_dim_*` — dimension / master tables (org, project, team, member, ticket, artifact, phase)
- `tbl_fact_*` — fact / event tables (snapshots, events, runs, PRs, CI, test, security, findings)
- `tbl_auth_*` — authorization (permissions, roles, access scopes, user accounts)

**Do not rename V1–V4 legacy tables.** Refer to them as-is in new queries.

---

## Primary Keys (Confirmed)

| Era | PK type |
|-----|---------|
| V1–V4 | `id BIGSERIAL PRIMARY KEY` |
| V5+ | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |

Requires `pgcrypto` extension (already enabled in V4).

---

## Timestamps (Confirmed)

All tables must have:

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

For tables that need automatic `updated_at` maintenance, attach the trigger:

```sql
CREATE TRIGGER trg_<table>_updated_at
    BEFORE UPDATE ON <table>
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

`set_updated_at()` is defined in V4 and applies to all new tables.
`SET TIME ZONE 'UTC'` is enforced via HikariCP `connection-init-sql`.

---

## Naming Conventions for Constraints and Indexes (Confirmed)

| Object | Prefix | Example |
|--------|--------|---------|
| Index | `idx_` | `idx_ticket_project_status` |
| Unique constraint | `uq_` | `uq_ticket_per_project` |
| Check constraint | `ck_` | `ck_ci_time` |
| Trigger | `trg_<table>_` | `trg_dim_project_updated_at` |
| Foreign keys | No prefix (implicit REFERENCES) | — |

Multi-column indexes: list the most selective column first.
Status + parent FK composites are common: `(project_id, status)`.

---

## ENUM Types (Confirmed — from V4)

Defined as PostgreSQL native ENUMs:

| Type | Values |
|------|--------|
| `record_status` | ACTIVE, INACTIVE, ARCHIVED, DELETED |
| `ticket_status` | OPEN, IN_PROGRESS, IN_REVIEW, DONE, CLOSED, CANCELLED |
| `pr_status` | OPEN, MERGED, CLOSED, DRAFT |
| `run_status` | SUCCESS, FAILED, CANCELLED, SKIPPED, RUNNING, PENDING, UNKNOWN |
| `review_state` | REQUESTED, COMMENTED, CHANGES_REQUESTED, APPROVED, DISMISSED |
| `finding_status` | OPEN, ACCEPTED, REJECTED, RESOLVED, FALSE_POSITIVE, WONT_FIX |
| `severity_level` | INFO, LOW, MEDIUM, HIGH, CRITICAL |
| `score_band` | EXCELLENT, GOOD, WARNING, RISKY, CRITICAL |
| `link_confidence_level` | HIGH, MEDIUM, LOW |
| `access_result` | SUCCESS, DENIED, FAILED |

Adding a new ENUM value requires a migration (`ALTER TYPE … ADD VALUE`).

---

## MyBatis Conventions (Confirmed)

Config:
```yaml
mybatis:
  map-underscore-to-camel-case: true   # snake_case DB ↔ camelCase Java auto-mapping
  default-fetch-size: 100
  default-statement-timeout: 30
```

Mapper rules:
- Use `<sql id="columns">` for reusable SELECT column lists
- `useGeneratedKeys="true" keyProperty="id"` on all INSERT statements
- `#{param}` for all value bindings (prepared statement)
- `${param}` only for whitelisted ORDER BY identifiers — validate the whitelist in Java before passing
- No `<if>`, `<foreach>` unless unavoidable — keep dynamic SQL minimal
- No complex `<resultMap>` nesting — rely on `map-underscore-to-camel-case` auto-mapping

Pagination pattern:
```xml
<select id="findPaged" resultType="Entity">
    SELECT <include refid="columns"/>
    FROM tbl_fact_<name>
    WHERE parent_id = #{parentId}
    ORDER BY ${orderBy} ${direction}
    LIMIT #{limit} OFFSET #{offset}
</select>
```

---

## Connection Pool — HikariCP (Confirmed)

```yaml
spring.datasource.hikari:
  maximum-pool-size: 10
  minimum-idle: 2
  connection-timeout: 30000
  connection-init-sql: "SET TIME ZONE 'UTC'"
```

Rule: External HTTP calls (GitHub, Jira, CircleCI) must happen **outside** DB transactions
to avoid holding a pool connection during network I/O.

---

## Append-Only Table Enforcement (Confirmed — ADMIN-AUDIT-LOG 2026-07-10)

For a table that must be immutable after insert (e.g. an audit log), prefer a `BEFORE UPDATE OR DELETE` trigger that raises an exception over a `REVOKE UPDATE, DELETE` grant. `REVOKE`/`GRANT` only works when a distinct, lower-privileged DB role is used for the application connection; this codebase's application connects with a single DB role that owns and must be able to migrate every table, so a role-level `REVOKE` would also block the app itself. A trigger enforces immutability regardless of which role issues the statement.

```sql
CREATE OR REPLACE FUNCTION fn_<table>_append_only() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION '<table> is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_<table>_append_only
BEFORE UPDATE OR DELETE ON <table>
FOR EACH ROW EXECUTE FUNCTION fn_<table>_append_only();
```

---

## Candidate Rules

> The following require evidence or decisions not yet available.

- **[Candidate]** JSONB columns: use GIN index (`idx_*_gin`) for any field searched by key
- **[Candidate]** Soft delete: use `record_status = 'DELETED'`; never `DELETE` fact rows in production
- **[Candidate]** Partitioning: large fact tables (>10M rows) should use range partitioning on `created_at`
- **[Candidate]** Testcontainers: integration tests use PostgreSQL 16 container to verify migrations

→ See [backend.md](backend.md) for the adapter + transaction pattern.
