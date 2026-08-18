# Repository DB Map

## 1. Purpose

Maps every Java repository adapter and MyBatis mapper to the database tables, columns,
and migration files they depend on. Use this file to:

- Verify column names before writing SQL or mappers
- Identify which tables exist in the live schema vs. which were dropped
- Understand query risks (dynamic ORDER BY, nullable FKs, missing upsert atomicity)
- Track the gap between V4 schema tables and the adapters/mappers that do NOT yet exist

**Scope:** EDCAP_BE as of Phase 0-B. V1–V4 Flyway migrations read directly.

---

## 2. DB Source Availability

| Source | Path | Status | Trust Level | Note |
|--------|------|--------|-------------|------|
| V1 migration | `db/migration/V1__init_schema.sql` | Confirmed | High | Full DDL with 14 tables, 28 indexes |
| V2 migration | `db/migration/V2__seed_demo_data.sql` | Confirmed | High | INSERT seed; ON CONFLICT DO NOTHING |
| V3 migration | `db/migration/V3__drop_unused_tables.sql` | Confirmed | **Critical** | Drops 5 V1 tables permanently — see §7 |
| V4 migration | `db/migration/V4__init_shema_v2.sql` | Confirmed | High | 1815-line warehouse schema; 40+ new tbl_dim_/tbl_fact_/tbl_auth_ tables |
| AppUser XML | `mapper/AppUserMapper.xml` | Confirmed | High | Full CRUD on `app_user` |
| AcceptanceCriterion XML | `mapper/AcceptanceCriterionMapper.xml` | Confirmed | High | SELECT/INSERT/DELETE on `acceptance_criterion` |
| Artifact XML | `mapper/ArtifactMapper.xml` | Confirmed | High | SELECT/INSERT/UPDATE on `artifact` |
| CiRun XML | `mapper/CiRunMapper.xml` | Confirmed | High | SELECT/INSERT/UPDATE on `ci_run` |
| ConnectorRun XML | `mapper/ConnectorRunMapper.xml` | Confirmed | High | SELECT/INSERT/UPDATE on `connector_run` |
| Project XML | `mapper/ProjectMapper.xml` | Confirmed | High | Full CRUD on `project` |
| PullRequest XML | `mapper/PullRequestMapper.xml` | Confirmed | High | SELECT/INSERT/UPDATE on `pull_request` |
| Repository XML | `mapper/RepositoryMapper.xml` | Confirmed | High | SELECT-only on `repository` |
| Ticket XML | `mapper/TicketMapper.xml` | Confirmed | High | Full CRUD + paginated SELECT on `ticket` |
| V4 table mappers | — | **Partial** | — | Most `tbl_dim_*` / `tbl_fact_*` / `tbl_auth_*` tables still have no XML or Java mapper; implemented Organization and Team snapshots are documented below |
| ER diagram | — | **Missing** | — | No `.erd`, `.dbml`, or diagram file found |
| Rollback scripts | — | **Missing** | — | Flyway Community does not support down-migrations |
| application.yml | `src/main/resources/application.yml` | Confirmed | High | DB URL, HikariCP, Flyway, MyBatis config |

---

## 3. Repository / DAO List

| Repository / Adapter | Path | Responsibility | Related Entity |
|----------------------|------|----------------|----------------|
| `AppUserRepositoryAdapter` | `infrastructure/persistence/adapter/AppUserRepositoryAdapter.java` | Find by provider+uid; upsert user on OAuth login | `AppUser` |
| `ArtifactRepositoryAdapter` | `infrastructure/persistence/adapter/ArtifactRepositoryAdapter.java` | Find artifacts by ticket; upsert artifact snapshot | `Artifact` |
| `CiRunRepositoryAdapter` | `infrastructure/persistence/adapter/CiRunRepositoryAdapter.java` | Find CI runs by provider+repository+run+job; upsert by identity | `CiRun` |
| `ConnectorRunRepositoryAdapter` | `infrastructure/persistence/adapter/ConnectorRunRepositoryAdapter.java` | Save connector execution log; find recent by name | `ConnectorRun` |
| `DataOpsDashboardJdbcAdapter` | `infrastructure/persistence/adapter/DataOpsDashboardJdbcAdapter.java` | Read-only KPI aggregation for operational dashboard | `DataOpsDashboard` read model |
| `ProjectRepositoryAdapter` | `infrastructure/persistence/adapter/ProjectRepositoryAdapter.java` | Find project by ID only (read-only in adapter; insert via mapper) | `Project` |
| `PullRequestRepositoryAdapter` | `infrastructure/persistence/adapter/PullRequestRepositoryAdapter.java` | Find PRs by ticket; upsert by repo+PR number | `PullRequest` |
| `RepositoryRepositoryAdapter` | `infrastructure/persistence/adapter/RepositoryRepositoryAdapter.java` | Find repositories by project; find by repoKey+hostType for webhook routing | `Repository` |
| `TicketRepositoryAdapter` | `infrastructure/persistence/adapter/TicketRepositoryAdapter.java` | Paginated list; find by key; count; upsert | `Ticket` |
| `AcceptanceCriterionRepositoryAdapter` | `infrastructure/persistence/adapter/AcceptanceCriterionRepositoryAdapter.java` | Bulk save (delete + re-insert); count tested | `AcceptanceCriterion` |
| `OrganizationRepositoryAdapter` | `infrastructure/persistence/adapter/OrganizationRepositoryAdapter.java` | Search, get, create, update, soft-delete, and cleanup helpers | `Organization` |
| `TeamRepositoryAdapter` | `infrastructure/persistence/adapter/TeamRepositoryAdapter.java` | Team master CRUD, membership, and lookup operations | `Team`, `TeamMember` |

> **Most V4 tables still have no adapters.** The `tbl_dim_*`, `tbl_fact_*`, and `tbl_auth_*`
> tables defined in V4 have only a few implemented snapshots in the workspace; the remaining
> tables still have no corresponding Java mapper or adapter yet.

---

## 4. Entity / Model / Table Mapping

| Entity / Model | Path | Table | Note |
|----------------|------|-------|------|
| `AppUser` | `domain/model/AppUser.java` | `app_user` | V1 table; active |
| `Project` | `domain/model/Project.java` | `project` | V1 table; active |
| `Repository` | `domain/model/Repository.java` | `repository` | V1 table; active |
| `Ticket` | `domain/model/Ticket.java` | `ticket` | V1 table; active |
| `Artifact` | `domain/model/Artifact.java` | `artifact` | V1 table; active |
| `PullRequest` | `domain/model/PullRequest.java` | `pull_request` | V1 table; active |
| `CiRun` | `domain/model/CiRun.java` | `ci_run` | V1 table; active |
| `ConnectorRun` | `domain/model/ConnectorRun.java` | `connector_run` | V1 table; active |
| `DataOpsDashboardJdbcAdapter` | `infrastructure/persistence/adapter/DataOpsDashboardJdbcAdapter.java` | Read-only KPI aggregation for operational dashboard | `DataOpsDashboard` read model |
| `AcceptanceCriterion` | `domain/model/AcceptanceCriterion.java` | `acceptance_criterion` | V1 table; active |
| `DataOpsDashboard` | `web/dto` / `application/usecase` read model | `tbl_source_connector`, `tbl_connector_run`, `tbl_fact_data_quality`, `tbl_fact_artifact_snapshot`, `tbl_fact_traceability_link`, `tbl_dim_project`, `tbl_dim_repository` | Read-only dashboard view model backed by existing V4 tables |
| _(no entity)_ | — | `audit_log` | **Dropped in V3** — no longer in schema |
| _(no entity)_ | — | `traceability_link` | **Dropped in V3** |
| _(no entity)_ | — | `evidence_quality_score` | **Dropped in V3** |
| _(no entity)_ | — | `exception_log` | **Dropped in V3** |
| _(no entity)_ | — | `finding` | **Dropped in V3** |
| `Organization` | `domain/model/Organization.java` | `tbl_dim_organization` | Implemented Organization master table with code/name, status, delete metadata, and `version` |
| `Team` | `domain/model/Team.java` | `tbl_dim_team` | Implemented Team master table with code/name and Team-member relation support |
| `TeamMember` | `domain/model/TeamMember.java` | `tbl_team_member` | Implemented Team-member relation table with role assignment |
| _(no entity)_ | — | `tbl_dim_project`, `tbl_dim_repository`, `tbl_dim_ticket`, etc. | **V4 only — most tables still have no Java entity yet** |
| _(no entity)_ | — | `tbl_fact_artifact_snapshot`, `tbl_fact_pull_request`, etc. | **V4 only — no Java entity yet** |
| _(no entity)_ | — | `tbl_auth_user_account` | **V4 only — no Java entity yet** |

---

## 5. Table / Column Summary

### Active V1 Tables (post-V3 drop)

#### `app_user`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `id BIGSERIAL PK` | `provider VARCHAR(32)`, `provider_uid VARCHAR(128)` | UNIQUE(provider, provider_uid) |
| | `email VARCHAR(255)`, `display_name`, `avatar_url` | nullable |
| | `role VARCHAR(32) DEFAULT 'VIEWER'` | Values: VIEWER, EDITOR, ADMIN |
| | `active BOOLEAN DEFAULT TRUE` | |
| | `created_at`, `updated_at TIMESTAMPTZ` | `idx_user_email(email)` |

#### `project`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `id BIGSERIAL PK` | `project_key VARCHAR(64) UNIQUE` | Business key |
| | `name VARCHAR(255)`, `description TEXT` | |
| | `risk_level VARCHAR(16) DEFAULT 'NORMAL'` | Values: LOW, NORMAL, HIGH |
| | `created_at`, `updated_at TIMESTAMPTZ` | |

#### `repository`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `id BIGSERIAL PK` | `project_id BIGINT FK → project(id) CASCADE` | |
| | `repo_key VARCHAR(255)` | UNIQUE(project_id, repo_key) |
| | `host_type VARCHAR(32)` | Values: GITHUB, LOCAL |
| | `default_branch VARCHAR(128) DEFAULT 'main'` | |
| | `created_at TIMESTAMPTZ` | `idx_repo_host(host_type)` |

#### `ticket`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `id BIGSERIAL PK` | `project_id BIGINT FK → project(id) CASCADE` | |
| | `ticket_key VARCHAR(64)` | UNIQUE(project_id, ticket_key) |
| | `title VARCHAR(512)` | |
| | `ticket_type VARCHAR(32) DEFAULT 'TASK'` | Values: FEATURE, BUG, TASK |
| | `status VARCHAR(32) DEFAULT 'OPEN'` | Values: OPEN, IN_PROGRESS, DONE, CLOSED |
| | `priority VARCHAR(16)` | nullable |
| | `sdd_phase SMALLINT DEFAULT 0` | 0–9 |
| | `ac_count INTEGER DEFAULT 0` | Denormalized; updated when AC changes |
| | `opened_at`, `closed_at TIMESTAMPTZ` | nullable |
| | `created_at`, `updated_at TIMESTAMPTZ` | `idx_ticket_status`, `idx_ticket_phase` |

#### `artifact`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `id BIGSERIAL PK` | `ticket_id BIGINT FK → ticket(id) CASCADE` | |
| | `artifact_type VARCHAR(64)` | Values: SPEC_PACK, SOURCES, IMPL_PLAN, REVIEW_CHECKLIST, SELF_REVIEW, TEST_PLAN, TEST_RESULTS, BLACKBOX_TESTCASES, TEST_DATA, REPORT |
| | `file_path VARCHAR(1024)` | UNIQUE(ticket_id, artifact_type, file_path) |
| | `content_hash VARCHAR(128)`, `schema_version INTEGER` | nullable; starts at `1` and increments when the file content changes in a pull request |
| | `is_template_only BOOLEAN DEFAULT FALSE` | Mapped as `templateOnly` in Java |
| | `required_fields_missing TEXT` | JSON array as text, e.g. `["scope","ac"]` |
| | `last_collected_at`, `updated_at TIMESTAMPTZ` | |

#### `pull_request`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `id BIGSERIAL PK` | `repository_id BIGINT FK → repository(id) CASCADE` | |
| | `ticket_id BIGINT FK → ticket(id) SET NULL` | nullable — PR may not be linked to ticket |
| | `external_pr_number INTEGER` | UNIQUE(repository_id, external_pr_number) |
| | `state VARCHAR(32)` | Values: OPEN, MERGED, CLOSED |
| | `author_login VARCHAR(128)` | nullable |
| | `base_branch`, `head_branch VARCHAR(255)` | nullable |
| | `opened_at`, `merged_at`, `closed_at TIMESTAMPTZ` | nullable |
| | `review_count`, `comments_count INTEGER DEFAULT 0` | |
| | `additions`, `deletions`, `changed_files INTEGER` | nullable |
| | `link_url VARCHAR(1024)` | nullable |
| | `created_at`, `updated_at TIMESTAMPTZ` | `idx_pr_ticket`, `idx_pr_state` |

#### `ci_run`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `id BIGSERIAL PK` | `repository_id BIGINT FK → repository(id) CASCADE` | |
| | `pull_request_id BIGINT FK → pull_request(id) SET NULL` | nullable |
| | `external_run_id VARCHAR(128)` | UNIQUE(provider, external_run_id) |
| | `provider VARCHAR(32)` | Values: CIRCLECI, GITHUB_ACTIONS |
| | `status VARCHAR(32)` | Values: SUCCESS, FAILED, RUNNING, CANCELLED |
| | `started_at`, `finished_at TIMESTAMPTZ` | nullable |
| | `duration_seconds INTEGER` | nullable |
| | `failure_category VARCHAR(64)` | nullable |
| | `is_first_attempt BOOLEAN DEFAULT TRUE` | Mapped as `firstAttempt` |
| | `link_url VARCHAR(1024)` | nullable |
| | `created_at TIMESTAMPTZ` | `idx_ci_status`, `idx_ci_pr` |

#### `acceptance_criterion`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `id BIGSERIAL PK` | `ticket_id BIGINT FK → ticket(id) CASCADE` | |
| | `ac_number VARCHAR(16)` | UNIQUE(ticket_id, ac_number) |
| | `description TEXT` | |
| | `is_tested BOOLEAN DEFAULT FALSE` | Mapped as `tested` via alias |
| | `test_reference VARCHAR(512)` | nullable |

#### `connector_run`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `id BIGSERIAL PK` | `connector_name VARCHAR(64)` | `idx_connector_run_name` |
| | `project_id BIGINT FK → project(id) CASCADE` | nullable |
| | `status VARCHAR(16)` | Values: RUNNING, SUCCESS, FAILED |
| | `records_ingested INTEGER DEFAULT 0` | |
| | `error_message TEXT`, `trace_id VARCHAR(64)` | nullable |
| | `started_at`, `finished_at TIMESTAMPTZ` | |

#### `tbl_dim_organization`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `organization_id UUID PK` | `organization_code`, `name_masked` | Active rows enforced by partial unique indexes |
| | `description`, `status` | Status values include ACTIVE and DELETED |
| | `created_at`, `created_by`, `updated_at`, `updated_by` | Audit metadata |
| | `deleted_at`, `deleted_by` | Soft-delete metadata |
| | `version` | Optimistic locking counter |

#### `tbl_dim_team`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `team_id UUID PK` | `team_code`, `team_name` | Active rows enforced by unique active code rule |
| | `description`, `status` | Team status values follow `record_status` |
| | `created_at`, `created_by`, `updated_at`, `updated_by` | Audit metadata |
| | `deleted_at`, `deleted_by` | Soft-delete metadata |
| | `version` | Optimistic locking counter |

#### `tbl_team_member`
| Key Columns | Important Columns | Notes |
|-------------|-------------------|-------|
| `team_member_id UUID PK` | `team_id`, `member_key`, `role_id` | Source of Team-member-role relation |
| | `status` | Active/inactive membership state |
| | `created_at`, `created_by`, `updated_at`, `updated_by` | Audit metadata |
| | `deleted_at`, `deleted_by` | Inactivation metadata |
| | `version` | Optimistic locking counter |

### V4 Tables (schema only — no mappers)

> Full DDL in `V4__init_shema_v2.sql`. Table list below is representative, not exhaustive.
> All V4 tables use `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `tbl_dim_organization` | Org master | `org_id UUID`, `org_name`, `country` |
| `tbl_dim_project` | Project dimension | `project_id UUID`, `project_code`, `org_id FK` |
| `tbl_dim_repository` | Repository dimension | `repository_id UUID`, `project_id FK`, `repo_url` |
| `tbl_dim_team` | Team dimension | `team_id UUID`, `team_name` |
| `tbl_dim_member_pseudonym` | Pseudonymized members | `member_key UUID`, `pseudonym VARCHAR(255)`, `active_from DATE`, `active_to DATE` |
| `tbl_dim_ticket` | Ticket with UUID | `ticket_id UUID`, `external_ticket_key VARCHAR(100)`, `status ticket_status ENUM` |
| `tbl_dim_artifact_type` | Artifact type master | `type_code`, `display_name` |
| `tbl_fact_artifact_snapshot` | Full snapshot | `snapshot_id UUID`, `required_fields_missing JSONB`, `parsed_summary JSONB`, `contains_secret_detected BOOLEAN` |
| `tbl_fact_pull_request` | PR with UUID | `pr_id UUID`, `external_pr_id VARCHAR(100)`, `labels JSONB` |
| `tbl_fact_ci_run` | CI run fact | `ci_run_id UUID, repository_id UUID, project_id UUID, pull_request_id UUID, connector_run_id UUID, ci_provider VARCHAR(50), external_run_id VARCHAR(100), external_job_id VARCHAR(100), workflow_name VARCHAR(255), job_name VARCHAR(255), ci_url TEXT, status VARCHAR(50), started_at, completed_at` |
| `tbl_connector_run` | Connector run fact | `connector_run_id UUID, provider VARCHAR(50), repository_id UUID, records_received INT, records_inserted INT, records_updated INT, records_skipped INT, records_error INT, trace_id VARCHAR(64)` |
| `tbl_fact_test_run` | Test execution | `coverage_percent NUMERIC(5,2)` |
| `tbl_fact_test_case` | Individual test | `flaky_candidate_flag BOOLEAN` |
| `tbl_fact_security_scan` | Scanner results | `scanner_name`, `critical_count`, `high_count` |
| `tbl_fact_evidence_quality_score` | Scores | `score NUMERIC(5,2)`, `score_band score_band ENUM`, `spec_score`, `plan_score`, `review_score`, `ci_score`, etc. |
| `tbl_fact_metric_value` | Metric time-series | `value NUMERIC(18,4)`, `period_type`, `breakdown JSONB` |
| `tbl_auth_user_account` | Login account | `member_key UUID FK`, `username VARCHAR(100) UNIQUE`, `email_hash VARCHAR(128) UNIQUE`, `password_hash TEXT`, `password_algo VARCHAR(50) DEFAULT 'bcrypt'` |
| `tbl_data_retention_policy` | Retention rules | `retention_days INT`, `deletion_method VARCHAR(100)` |

---

## 6. Query Mapping

| Query / Method | Path | Table | Purpose | Risk |
|----------------|------|-------|---------|------|
| `AppUserMapper.findByProviderAndProviderUid` | `AppUserMapper.xml` | `app_user` | OAuth login lookup | None — two-col exact match |
| `AppUserMapper.insert` / `update` | `AppUserMapper.xml` | `app_user` | Upsert on OAuth login | No `ON CONFLICT` — upsert logic is in adapter; concurrent logins could race |
| `TicketMapper.findByProjectIdPaged` | `TicketMapper.xml` | `ticket` | Paginated ticket list | `${orderBy}` / `${direction}` — guarded by `TicketMapper.SORTABLE_COLUMNS` whitelist; safe if whitelist stays up-to-date |
| `TicketMapper.findByStatus` | `TicketMapper.xml` | `ticket` | Batch sync: all tickets with status | Full table scan if project scope is not added — `idx_ticket_status` only |
| `ArtifactMapper.findByTicketIdAndArtifactType` | `ArtifactMapper.xml` | `artifact` | Find specific artifact | Returns `Optional`; safe |
| `ArtifactMapper.insert` / `update` | `ArtifactMapper.xml` | `artifact` | Upsert artifact | No `ON CONFLICT` — race risk on concurrent webhooks for same ticket+type+path |
| `AcceptanceCriterionMapper.deleteByTicketId` + `saveAll` | `AcceptanceCriterionMapper.xml` | `acceptance_criterion` | Bulk replace AC | DELETE then re-INSERT in same transaction; safe but loses original row IDs |
| `CiRunRepositoryPort.findCiRunIdByIdentity` | `CiRunJdbcAdapter` | `tbl_fact_ci_run` | Idempotency check | Safe — unique index on `(ci_provider, repository_id, external_run_id, external_job_id)` guarantees dedup |
| `PullRequestMapper.findByRepositoryIdAndExternalPrNumber` | `PullRequestMapper.xml` | `pull_request` | Webhook idempotency | Safe — UNIQUE(repository_id, external_pr_number) |
| `RepositoryMapper.findFirstByRepoKeyAndHostType` | `RepositoryMapper.xml` | `repository` | Webhook → project routing | `ORDER BY id LIMIT 1` — returns first if multiple repos share repo_key+host_type |
| `ConnectorRunMapper.findByConnectorNameOrderByStartedAtDesc` | `ConnectorRunMapper.xml` | `connector_run` | Recent run history | Paginated with LIMIT/OFFSET |
| `ProjectMapper.findAll` | `ProjectMapper.xml` | `project` | Admin dashboard | No pagination; safe for small project counts |
| `OrganizationMapper.findPage` | `OrganizationMapper.xml` | `tbl_dim_organization` | Organization list/search | Active-scope filtering must respect deleted rows |
| `TeamMapper.findPage` | `TeamMapper.xml` | `tbl_dim_team` | Team list/search | Active-scope filtering must respect deleted rows and code uniqueness |
| `TeamMapper.findMembers` | `TeamMapper.xml` | `tbl_team_member` | Team detail active members | Must exclude inactive memberships by default |
| `DataOpsDashboardJdbcAdapter.*` | `DataOpsDashboardJdbcAdapter` | `tbl_source_connector`, `tbl_connector_run`, `tbl_fact_data_quality`, `tbl_fact_artifact_snapshot`, `tbl_fact_traceability_link`, `tbl_dim_project`, `tbl_dim_repository` | Read-only aggregation for connector status, parse errors, missing evidence, freshness, and broken traceability | Provisional KPI formulas and source joins must stay aligned with Product decisions |

---

## 7. Migration Mapping

| Migration | Path | Tables Changed | Rollback Available? |
|-----------|------|----------------|---------------------|
| `V1__init_schema.sql` | `db/migration/` | Creates: `app_user`, `project`, `repository`, `ticket`, `artifact`, `pull_request`, `ci_run`, `finding`, `exception_log`, `acceptance_criterion`, `evidence_quality_score`, `traceability_link`, `connector_run`, `audit_log` (14 tables) | **No** — Flyway Community has no down-migration |
| `V2__seed_demo_data.sql` | `db/migration/` | INSERTs into `project`, `repository` with `ON CONFLICT DO NOTHING` | **No** — idempotent by design |
| `V3__drop_unused_tables.sql` | `db/migration/` | **DROPS:** `audit_log`, `traceability_link`, `evidence_quality_score`, `exception_log`, `finding` | **No — IRREVERSIBLE**. Data and DDL are gone. Re-introducing any of these tables requires a new `V5__re_add_*.sql` migration. |
| `V4__init_shema_v2.sql` | `db/migration/` | Creates 40+ `tbl_dim_*`, `tbl_fact_*`, `tbl_auth_*` tables; defines 10 ENUM types; creates `set_updated_at()` function and triggers | **No** — but additive only; V1 tables are unmodified |
| `V113__team_management.sql` | `db/migration/` | Adds Team management columns, relation table, and active-scope constraints | **No** — additive only |

> **Warning — V3 is destructive with no rollback.** The following data is permanently removed
> from schema: `audit_log`, `traceability_link`, `evidence_quality_score`, `exception_log`, `finding`.
> If business logic ever needs these again, a new migration must recreate the table from scratch.

---

## 8. Transaction / Lock / Concurrency Notes

**Transaction boundary:** `@Transactional` is on `@Service` methods only. Adapters and
mappers are never annotated with `@Transactional`.

**Connector sync:** Each external upsert (GitHub PR, CI run, Jira ticket) uses its own
`TransactionTemplate` so a failure on one item does not roll back the entire batch.

**Upsert pattern:** All adapters implement upsert as: `if (entity.getId() == null) → insert; else → update`.
There is **no `ON CONFLICT DO UPDATE`** in any mapper. This means:
- Two concurrent threads inserting the same entity (same business key) will violate the UNIQUE
  constraint and throw a `DataAccessException`. The adapter catches this and throws `DomainException`.
- For write-heavy paths (webhook delivery), the caller should check existence with `findBy...`
  inside the same transaction before saving.

**No pessimistic locking:** No `SELECT … FOR UPDATE` is used. Optimistic concurrency
is implicit via `updated_at` stamp (not enforced by `@Version`).

**`AcceptanceCriterion` bulk replace:** `deleteByTicketId` + `saveAll` runs in one service
transaction. Row IDs change on every update — any external reference to old AC `id` values
becomes stale.

---

## 9. Data Compatibility / Backfill Notes

| Concern | Detail |
|---------|--------|
| V1 vs V4 tables | V1 tables (`app_user`, `ticket`, etc.) use `BIGSERIAL` PKs. V4 tables use `UUID`. No FK relationships exist between V1 and V4 tables — they are separate schema generations. |
| `app.jwt.secret` in config | `application.yml` contains a `jwt.secret` / `jwt.expiration-hours` property. The security standards document session-cookie-only auth (no JWT). Verify whether this config is active or a leftover. |
| `springdoc` is configured | `api-docs.path: /api/v1/openapi` and `swagger-ui.path` are set in `application.yml`. The source availability doc listed OpenAPI as "not present" — this should be confirmed. |
| `Artifact.requiredFieldsMissing` | Stored as `TEXT` in V1 (`artifact` table), but as `JSONB` in V4 (`tbl_fact_artifact_snapshot`). If data moves from V1 to V4 tables, a type conversion migration is required. |
| `AppUser.Role` vs V4 RBAC | V1 `app_user.role` is a plain `VARCHAR(32)` with values VIEWER/EDITOR/ADMIN. V4 has a full `tbl_dim_role` table and `tbl_auth_user_account`. There is no join or migration linking them. |
| Dropped tables re-use risk | V4 introduces `tbl_fact_evidence_quality_score` and other tables that duplicate the purpose of V1 tables dropped in V3. No data migration script exists to carry V1 data into V4 tables. |

---

## 10. Unknown / Need Confirmation

| Item | Reason | Risk | Required Action |
|------|--------|------|-----------------|
| Is JWT actually used? | `application.yml` defines `app.jwt.secret` and `app.jwt.expiration-hours`; security docs describe session-cookie only | Medium — security model may be inconsistent | Read JWT config class if it exists; confirm or remove the config |
| V4 tables — are any queries running against them? | No Java mapper or adapter exists for any V4 table, yet V4 was migrated. The tables exist but are unreachable from Java code. | Low now, High when V4 features start | Create mappers and adapters before writing service code that targets V4 tables |
| `RepositoryMapper.findFirstByRepoKeyAndHostType` LIMIT 1 | Multiple repositories in different projects can share the same `repo_key` + `host_type`. Returning `LIMIT 1` silently routes webhook to the first project. | Medium — webhooks may land in the wrong project | Add project-scoping or confirm the expectation that repo_key+host_type is globally unique |
| `TicketMapper.findByStatus` — full scan scope | Fetches all tickets with a given status across all projects. For large datasets, this is unbounded. | Medium — performance issue at scale | Add `project_id` filter or confirm batch sync always scopes by project |
| `AcceptanceCriterion.acNumber` sort | `findByTicketId` orders by `ac_number VARCHAR` lexicographically (`'AC-10'` sorts before `'AC-9'`). | Low — display order may be unexpected | Confirm AC numbering scheme; switch to numeric sort if needed |
| Rollback for V3 DROP | Five V1 tables were dropped with no data archive. If `finding` or `audit_log` data is needed for compliance, it cannot be recovered from the DB. | High if compliance audit is required | Confirm data was backed up before V3 was applied; document disposition |
| `tbl_auth_user_account.password_hash` | V4 introduces a password-based login table (`bcrypt`). Current auth is OAuth2 only. These appear to be two parallel auth models. | Medium — unclear if password login is planned or experimental | Confirm whether `tbl_auth_user_account` is intended for future use or should be removed |

---

## 11. Source Files Read

| File | Purpose |
|------|---------|
| `EDCAP_BE/src/main/resources/db/migration/V1__init_schema.sql` | V1 DDL — 14 tables, all active except 5 dropped by V3 |
| `EDCAP_BE/src/main/resources/db/migration/V2__seed_demo_data.sql` | Demo seed data |
| `EDCAP_BE/src/main/resources/db/migration/V3__drop_unused_tables.sql` | Destructive: drops 5 V1 tables |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | V4 warehouse schema — 40+ new tables |
| `EDCAP_BE/src/main/resources/mapper/AcceptanceCriterionMapper.xml` | XML SQL for `acceptance_criterion` |
| `EDCAP_BE/src/main/resources/mapper/AppUserMapper.xml` | XML SQL for `app_user` |
| `EDCAP_BE/src/main/resources/mapper/ArtifactMapper.xml` | XML SQL for `artifact` |
| `EDCAP_BE/src/main/resources/mapper/CiRunMapper.xml` | XML SQL for `ci_run` |
| `EDCAP_BE/src/main/resources/mapper/ConnectorRunMapper.xml` | XML SQL for `connector_run` |
| `EDCAP_BE/src/main/resources/mapper/ProjectMapper.xml` | XML SQL for `project` |
| `EDCAP_BE/src/main/resources/mapper/PullRequestMapper.xml` | XML SQL for `pull_request` |
| `EDCAP_BE/src/main/resources/mapper/RepositoryMapper.xml` | XML SQL for `repository` |
| `EDCAP_BE/src/main/resources/mapper/TicketMapper.xml` | XML SQL for `ticket` |
| `EDCAP_BE/src/main/java/.../mapper/AcceptanceCriterionMapper.java` | Java interface |
| `EDCAP_BE/src/main/java/.../mapper/AppUserMapper.java` | Java interface |
| `EDCAP_BE/src/main/java/.../mapper/ArtifactMapper.java` | Java interface |
| `EDCAP_BE/src/main/java/.../mapper/CiRunMapper.java` | Java interface |
| `EDCAP_BE/src/main/java/.../mapper/ConnectorRunMapper.java` | Java interface |
| `EDCAP_BE/src/main/java/.../mapper/ProjectMapper.java` | Java interface |
| `EDCAP_BE/src/main/java/.../mapper/PullRequestMapper.java` | Java interface |
| `EDCAP_BE/src/main/java/.../mapper/RepositoryMapper.java` | Java interface |
| `EDCAP_BE/src/main/java/.../mapper/TicketMapper.java` | Java interface (includes `SORTABLE_COLUMNS` whitelist) |
| `EDCAP_BE/src/main/java/.../adapter/AppUserRepositoryAdapter.java` | Adapter with upsert logic |
| `EDCAP_BE/src/main/java/.../adapter/ArtifactRepositoryAdapter.java` | Adapter with upsert logic |
| `EDCAP_BE/src/main/java/.../adapter/CiRunRepositoryAdapter.java` | Adapter with upsert logic |
| `EDCAP_BE/src/main/java/.../adapter/ConnectorRunRepositoryAdapter.java` | Adapter |
| `EDCAP_BE/src/main/java/.../adapter/ProjectRepositoryAdapter.java` | Adapter (read-only port) |
| `EDCAP_BE/src/main/java/.../adapter/PullRequestRepositoryAdapter.java` | Adapter with upsert + null-safe defaults |
| `EDCAP_BE/src/main/java/.../adapter/RepositoryRepositoryAdapter.java` | Adapter (select-only) |
| `EDCAP_BE/src/main/java/.../adapter/TicketRepositoryAdapter.java` | Adapter with defaults on insert |
| `EDCAP_BE/src/main/java/.../adapter/AcceptanceCriterionRepositoryAdapter.java` | Adapter with bulk-replace |
| `EDCAP_BE/src/main/java/...domain/model/*.java` | 9 domain entities |
| `EDCAP_BE/src/main/resources/application.yml` | DB URL, HikariCP, Flyway, MyBatis, logging config |

---

## 12. Organization Management Snapshot

This snapshot records the implemented Organization table/mapper state.

### Repository / DAO

| Repository / Adapter | Path | Responsibility | Related Entity |
|---|---|---|---|
| `OrganizationRepositoryAdapter` | `infrastructure/persistence/adapter/OrganizationRepositoryAdapter.java` | Search, get, create, update, soft-delete, and cleanup helpers for Organization | `Organization` |

### Entity / Model / Table mapping

| Entity / Model | Path | Table | Note |
|---|---|---|---|
| `Organization` | `domain/model/Organization.java` | `tbl_dim_organization` | Implemented Organization master table with code/name, status, delete metadata, and `version` |

### Table / Column summary

#### `tbl_dim_organization`

| Key Columns | Important Columns | Notes |
|---|---|---|
| `organization_id UUID PK` | `organization_code`, `name_masked` | Active rows enforced by partial unique indexes |
| | `description`, `status` | Status values include ACTIVE and DELETED |
| | `created_at`, `created_by`, `updated_at`, `updated_by` | Audit metadata |
| | `deleted_at`, `deleted_by` | Soft-delete metadata |
| | `version` | Optimistic locking counter |

### Migration mapping

| Migration | Path | Tables Changed | Rollback Available? |
|---|---|---|---|
| `V5__alter_tbl_dim_organization_for_management.sql` | `db/migration/` | Adds Organization management columns and partial unique indexes | No — additive only |

### Query mapping

| Query / Method | Path | Table | Purpose | Risk |
|---|---|---|---|---|
| `OrganizationMapper.findPage` | `OrganizationMapper.xml` | `tbl_dim_organization` | Keyword/status filtered paginated list | Needs `deleted_at IS NULL` / `IS NOT NULL` alignment |
| `OrganizationMapper.update` | `OrganizationMapper.xml` | `tbl_dim_organization` | Update with optimistic lock | Update must include `version` and active-row guard |
| `OrganizationMapper.softDelete` | `OrganizationMapper.xml` | `tbl_dim_organization` | Soft delete with optimistic lock | Delete must preserve reuse of code/name for deleted rows |

### Compatibility / backfill note

- `tbl_dim_organization` uses additive changes and partial unique indexes for active rows.
- Reuse of code/name is allowed after soft delete because uniqueness is scoped to `deleted_at IS NULL`.

---

## 13. Team Management Snapshot

This snapshot records the implemented Team table/mapper state.

### Repository / DAO

| Repository / Adapter | Path | Responsibility | Related Entity |
|---|---|---|---|
| `TeamRepositoryAdapter` | `infrastructure/persistence/adapter/TeamRepositoryAdapter.java` | Search, get, create, update, soft-delete, membership list/add/update/remove, and lookup helpers | `Team`, `TeamMember` |

### Entity / Model / Table mapping

| Entity / Model | Path | Table | Note |
|---|---|---|---|
| `Team` | `domain/model/Team.java` | `tbl_dim_team` | Implemented Team master table with code/name, status, delete metadata, and `version` |
| `TeamMember` | `domain/model/TeamMember.java` | `tbl_team_member` | Implemented Team-member relation table with role assignment and active/inactive membership state |

### Table / Column summary

#### `tbl_dim_team`

| Key Columns | Important Columns | Notes |
|---|---|---|---|
| `team_id UUID PK` | `team_code`, `team_name` | Active rows use unique Team Code |
| | `description`, `status` | Status values follow `record_status` |
| | `created_at`, `created_by`, `updated_at`, `updated_by` | Audit metadata |
| | `deleted_at`, `deleted_by` | Soft-delete metadata |
| | `version` | Optimistic locking counter |

#### `tbl_team_member`

| Key Columns | Important Columns | Notes |
|---|---|---|---|
| `team_member_id UUID PK` | `team_id`, `member_key`, `role_id` | Unique active membership per `(team_id, member_key)` |
| | `status` | Active/inactive membership state |
| | `created_at`, `created_by`, `updated_at`, `updated_by` | Audit metadata |
| | `deleted_at`, `deleted_by` | Inactivation metadata |
| | `version` | Optimistic locking counter |

### Migration mapping

| Migration | Path | Tables Changed | Rollback Available? |
|---|---|---|---|
| `V113__team_management.sql` | `db/migration/` | Adds Team management columns and `tbl_team_member` relation table | No — additive only |

### Query mapping

| Query / Method | Path | Table | Purpose | Risk |
|---|---|---|---|---|
| `TeamMapper.findPage` | `TeamMapper.xml` | `tbl_dim_team` | Team list/search | Must keep active/deleted filtering aligned |
| `TeamMapper.findById` | `TeamMapper.xml` | `tbl_dim_team` | Team detail | Must return active row for edit/update/delete checks |
| `TeamMapper.findMembers` | `TeamMapper.xml` | `tbl_team_member` | Team member list | Must exclude inactive memberships by default |
| `TeamMapper.existsActiveCode` | `TeamMapper.xml` | `tbl_dim_team` | Unique Team Code check | Must scope to active rows |
| `TeamMapper.existsActiveMembership` | `TeamMapper.xml` | `tbl_team_member` | Duplicate active member check | Must scope to active memberships only |

### Compatibility / backfill note

- `tbl_dim_team` and `tbl_team_member` use additive changes and active-scope uniqueness.
- Membership role data lives on `tbl_team_member`, not on `tbl_dim_member_pseudonym`.
- Legacy `tbl_dim_member_pseudonym.team_id/role_id` values are not migrated into Team memberships.

## 14. Admin Audit Log Snapshot

This snapshot records the ADMIN-AUDIT-LOG (2026-07) reuse of a previously dormant table instead of a new table.

### Repository / DAO

| Repository / Adapter | Path | Responsibility | Related Entity |
|---|---|---|---|
| `AdminAuditLogJdbcAdapter` | `infrastructure/persistence/adapter/AdminAuditLogJdbcAdapter.java` | Insert audit entries, paginated search, detail lookup | `AdminAuditLogModels` records |

### Entity / Model / Table mapping

| Entity / Model | Path | Table | Note |
|---|---|---|---|
| `AdminAuditLogModels` (entry/filter/list-item/detail records) | `application/usecase/governance/AdminAuditLogModels.java` | `tbl_fact_access_log` | **Reused an existing, previously-unused table** discovered during Phase 5 source verification — do not create a new `tbl_admin_audit_log`; earlier source-discovery phases missed that this table already existed for this purpose (see `failure-mode-index.md` note on dormant-table discovery timing) |

### Table / Column summary

#### `tbl_fact_access_log` (altered by `V500`)

| Key Columns | Important Columns | Notes |
|---|---|---|
| `access_log_id UUID PK` | `actor_user_id` (nullable), `module`, `operation_type` | `actor_user_id` is nullable by human decision — some events (e.g. failed login with unknown username) have no resolvable actor |
| | `before_value`, `after_value` (JSONB) | Masked via whitelist-drop (see `docs/standards/security.md`) before persistence; `after_value` is null for DELETE by design |
| | `occurred_at` | Sort key for list queries (`DESC`) |
| | append-only trigger | Enforced via `BEFORE UPDATE OR DELETE`, not `REVOKE`/`GRANT` (see `docs/standards/database.md`) |

### Migration mapping

| Migration | Path | Tables Changed | Rollback Available? |
|---|---|---|---|
| `V500__admin_audit_log.sql` | `db/migration/` | Alters `tbl_fact_access_log` (renames, new columns, indexes, append-only trigger); does not touch `V4__init_schema_v2.sql` | No — additive/alter only |

### Compatibility / backfill note

- Confirm the target table against the current schema (not just requirement text) before adding a new fact/dim table for a similar purpose — the original requirement text referenced `tbl_dim_member`/`tbl_dim_user`, which do not match the confirmed schema (`tbl_auth_user_account`).
