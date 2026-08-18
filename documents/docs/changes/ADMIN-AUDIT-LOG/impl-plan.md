# Implementation Plan

**Ticket ID**: ADMIN-AUDIT-LOG  
**Create date**: 2026-07-09  
**Author**: Claude  
**Update date**: 2026-07-09  

## 1. Implementation Principle

- Keep the audit feature backend-first and read-only on the consumer side.
- Use explicit, source-backed service hooks rather than speculative APIs.
- Keep CRUD audit writes transaction-bound and login-failure writes best-effort.
- Centralize masking so secrets never reach the database.
- Use current schema names from source, and treat unresolved table mismatches as open issues instead of guessing.

## 2. Alternative Plan
| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Add a centralized `AdminAuditLogService`, a persistence port/adapter, and read-only list/detail APIs; call it explicitly from existing CRUD/auth services | Matches current service/controller layering; easier to test; audit rules stay centralized | Requires touching each audited service | **Chosen — confirmed by human decision, 2026-07-09** |
| B | Use AOP/aspect interception around CRUD methods | Less explicit call-site change | Harder to reason about transaction boundaries and masking; not present in current codebase | Not chosen |
| C | Log audit rows from controllers directly | Easy to start | Violates layering and makes business/audit logic mixed together | Not chosen |

## 3. Reason for Choosing the Alternative Plan

Option A matches the current backend structure: thin controllers, service-layer transactions, adapter-based persistence, and centralized exception handling. It keeps the audit contract explicit, makes masking easier to review, and avoids speculative infrastructure that the codebase does not already have.

## 4. Expected Change File
| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/.../AdminAuditLogService.java` | New audit capture/query service | Central point for write/read orchestration | AC-ADMIN-AUDIT-LOG-1..10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/AdminAuditLogPersistencePort.java` | New persistence contract | Keep service decoupled from SQL | AC-ADMIN-AUDIT-LOG-1..10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/.../AdminAuditLogJdbcAdapter.java` | New SQL adapter | Insert/query `tbl_admin_audit_log` | AC-ADMIN-AUDIT-LOG-1..10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminAuditLogController.java` | New read-only audit-log API | Expose list/detail to authorized users | AC-ADMIN-AUDIT-LOG-8..10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/AdminAuditLogDtos.java` | New DTO factory bundle | Follow current DTO factory style | AC-ADMIN-AUDIT-LOG-8..10 |
| `EDCAP_BE/src/main/resources/db/migration/V500__admin_audit_log.sql` | New migration | Alter existing `tbl_fact_access_log` (rename/add columns, add indexes, add append-only trigger) instead of creating a new table | AC-ADMIN-AUDIT-LOG-1..7 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/*.java` | Add audit hooks to audited CRUD services | Capture create/update/delete/read events | AC-ADMIN-AUDIT-LOG-1..5 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java` | Add login/logout audit hooks | Capture login/logout/failure | AC-ADMIN-AUDIT-LOG-6..7 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilter.java` | Optional request-context capture support | Capture IP/user-agent context safely | AC-ADMIN-AUDIT-LOG-1..10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Optional login-failure audit hook coordination | Ensure failures are logged without leaking secrets | AC-ADMIN-AUDIT-LOG-5..7 |

**FE scope — added 2026-07-09 (human decision, pulled forward from deferred MVP scope in spec-pack.md §10/§11):**

| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_FE/src/lib/api.ts` | Add `endpoints.adminAuditLogs.list()` / `.detail()` | Follow existing `endpoints.<feature>` pattern (dataOpsDashboard/organizations style) | AC-ADMIN-AUDIT-LOG-8..10 |
| `EDCAP_FE/src/pages/admin-audit-log/types.ts` | New: `AuditLogFilters`, `AuditLogListItem`, `AuditLogPage`, `AuditLogDetail` | Folder-per-feature convention (matches dashboard pages) | AC-ADMIN-AUDIT-LOG-8..10 |
| `EDCAP_FE/src/pages/admin-audit-log/utils.ts` | New: `parseFilters`/`buildSearchParams` for URL-synced filters | Matches `useDataOpsDashboardFilters` pattern | AC-ADMIN-AUDIT-LOG-9 |
| `EDCAP_FE/src/pages/admin-audit-log/hooks/useAuditLogFilters.ts` | New: URL-synced filter state hook | Matches `useDataOpsDashboardFilters` pattern | AC-ADMIN-AUDIT-LOG-9 |
| `EDCAP_FE/src/pages/admin-audit-log/components/AuditLogFilterBar.tsx` | New: pill/select filter bar (Module, Operation Type, Actor) + antd `RangePicker` for Date Range | Matches `DataOpsFilterBar` pattern | AC-ADMIN-AUDIT-LOG-9 |
| `EDCAP_FE/src/pages/admin-audit-log/components/AuditLogSummaryCards.tsx` | New: summary cards computed client-side from the current page (no dedicated BE summary endpoint — see self-review.md §8) | Matches `DataOpsSummaryCards` pattern | AC-ADMIN-AUDIT-LOG-9 |
| `EDCAP_FE/src/pages/admin-audit-log/components/AuditLogTable.tsx` | New: `CServerTable`-based paginated list (Time, Actor, Module, Entity, Operation, IP, Detail button) | Matches `DataOpsConnectorTable` pattern | AC-ADMIN-AUDIT-LOG-8 |
| `EDCAP_FE/src/pages/admin-audit-log/components/AuditLogDetailDrawer.tsx` | New: read-only antd `Drawer` + `Card` showing before/after diff and login context; no edit/delete controls | Matches `DataOpsConnectorDetailDrawer` pattern | AC-ADMIN-AUDIT-LOG-10 |
| `EDCAP_FE/src/pages/admin-audit-log/AuditLogPage.tsx` | New: page composing filter bar + summary cards + table + detail drawer | Top-level page | AC-ADMIN-AUDIT-LOG-8..10 |
| `EDCAP_FE/src/App.tsx` | Add `admin/audit-logs` route, `RequireAdmin`-gated | Admin-only, matches Organization/Project/Repository/Customer/Team gating | Ticket-rules: read-only, admin-restricted |
| `EDCAP_FE/src/components/Layout.tsx` | Add nav item under "System Administration" submenu | Discoverability | AC-ADMIN-AUDIT-LOG-8 |
| `EDCAP_FE/public/locales/{en,vi,ja}/locale.json` | Add `Layout.auditLogs` + `Pages.AdminAuditLog.*` keys | Preserve UTF-8/Vietnamese diacritics per ticket-rules.md | N/A |

## 5. Class / Function / Method to Add or Modify
| target | action | input | output | note |
|---|---|---|---|---|
| `AdminAuditLogService.logCreate(...)` | Add | operation context + masked payload | audit row | Same transaction as CRUD write |
| `AdminAuditLogService.logUpdate(...)` | Add | before/after + changed fields | audit row | Omit secrets, keep field names |
| `AdminAuditLogService.logDelete(...)` | Add | entity snapshot + delete context | audit row | `after_value` should be null |
| `AdminAuditLogService.logLoginSuccess(...)` | Add | login success context | audit row | Use auth flow only |
| `AdminAuditLogService.logLoginFailure(...)` | Add | attempted username + failure reason | audit row | Best-effort, do not expose credential values |
| `AdminAuditLogService.logLogout(...)` | Add | logout context | audit row | User/session end event |
| `AdminAuditLogController.list(...)` | Add | filters + paging | paged response | GET only |
| `AdminAuditLogController.detail(...)` | Add | log id | detail response | GET only |
| `AuditMaskingHelper.mask(...)` | Add | entity snapshot | redacted snapshot | Centralized masking helper |

## 6. SQL / Query / Repository Policy

- **Revised 2026-07-09 (human decision)**: reuse `tbl_fact_access_log` (extended via `ALTER TABLE` in `V500__admin_audit_log.sql`) instead of a new `tbl_admin_audit_log` table — see `spec-pack.md` §12 for the full column-mapping/rename plan. Do not overload any other existing master/dimension table beyond this one, already-dormant, access-log table.
- Keep the table append-only via a `BEFORE UPDATE OR DELETE` trigger, not `REVOKE`/`GRANT` — the single app DB role (`sdd`) owns the table, and Postgres table owners bypass `REVOKE`.
- Use parameterized SQL for all filters and search fields.
- Use indexes on actor (`actor_user_id`), entity (`entity_type`, `entity_id`), module/operation, and IP address; `occurred_at` index already exists (`idx_access_log_time`).
- Do not use ad-hoc SQL in controllers.

## 7. Validation / Error / Logging Policy

- Validate all enum-like values from the spec-pack against explicit constants (module, operation_type — `operation_status`/status is no longer part of this feature's data model or validation surface).
- Validate filter inputs against whitelists before reaching SQL.
- Mask passwords, tokens, secrets, and any other sensitive fields before persistence.
- Log audit-service failures with SLF4J, but do not expose raw sensitive values in error logs.
- Keep CRUD business success/failure and audit success/failure logically separate where the spec requires it.

## 8. Migration / Rollback Policy

- Add a new migration only; do not edit `V4__init_shema_v2.sql`.
- If the audit log table is created, rollback should be a new revert migration in a later version, not a patch to old migrations.
- If the user identity FK target remains ambiguous, stop before writing the migration and resolve the table reference first.

## 9. Step Implementation
| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Lock context and rules from source and standards | `context.md`, `ticket-rules.md` | Existing code paths and schema names are captured | Stop if a path/table is guessed |
| 2 | Finalize the plan and target endpoints | `impl-plan.md` | GET-only audit endpoints and service hooks are selected | Stop if write endpoints appear on the audit screen |
| 3 | Prepare review checklist | `review-checklist.md` | Each AC has a review row | Stop if any AC is missing |
| 4 | Prepare skeleton test artifacts | `test-plan.md`, `blackbox-testcases.md`, `test-data.md` | Every AC has at least one test path | Stop if audit masking or immutability is not testable |
| 5 | Prepare implementation evidence artifacts | `self-review.md`, `test-results.md`, `report.md` | Phase 3-8 skeletons exist | Stop if template structure changes |

## 10. How to Verify Each Step

- Check every referenced method/class against the current source tree.
- Check every referenced table against the current migration file.
- Check every planned endpoint against the read-only screen requirement.
- Check that masking and traceability are explicitly included before implementation.
- Check that the ticket still aligns with the template headings.

## 11. Corresponding AC Table
| AC ID | implementation point | verification |
|---|---|---|
| AC-ADMIN-AUDIT-LOG-1 | CREATE audit hook in each audited CRUD service | One audit row written for each successful create |
| AC-ADMIN-AUDIT-LOG-2 | UPDATE audit hook in each audited CRUD service | One audit row written with before/after and changed fields |
| AC-ADMIN-AUDIT-LOG-3 | DELETE audit hook in each audited CRUD service | One audit row written with null `after_value` |
| AC-ADMIN-AUDIT-LOG-4 | Masking helper | Secrets absent from stored snapshots |
| AC-ADMIN-AUDIT-LOG-5 | Failure-path audit hook | FAILED row written with safe error message |
| AC-ADMIN-AUDIT-LOG-6 | Login success hook in `AuthService.login()` | Successful login produces one audit row |
| AC-ADMIN-AUDIT-LOG-7 | Login failure hook in auth failure path | Failed login produces one audit row |
| AC-ADMIN-AUDIT-LOG-8 | `GET /api/v1/admin/audit-logs` | Paginated list renders and sorts correctly |
| AC-ADMIN-AUDIT-LOG-9 | Filters/search + summary fields | Filtered list and counts match stored data |
| AC-ADMIN-AUDIT-LOG-10 | `GET /api/v1/admin/audit-logs/{id}` | Detail view is read-only and shows diff/context |

## 12. Stop / Ask Condition

- Stop if the actor identity table cannot be confirmed before migration or FK design.
- Stop if a method or endpoint name is not found in the source tree.
- Stop if any audit payload would need to include a raw secret or password.
- Stop if Phase 3 work would widen the API beyond GET-only audit browsing.

## 13. Do Not Do This Ticket

- Do not turn the audit screen into a mutation API.
- Do not invent audit log methods that bypass the service layer.
- Do not log raw credentials or raw request bodies.
- Do not assume the missing member/user table exists without checking the schema.
- Do not change existing CRUD response contracts.

## 14. Open Related Issues

| issue | status | note |
|---|---|---|
| Actor identity table reference (`tbl_auth_user_account` vs `tbl_dim_member` / `tbl_dim_user`) | **Resolved 2026-07-09**: `tbl_auth_user_account` confirmed present in `V80__auth_token_session.sql` (PK `user_account_id`); `tbl_dim_member` does not exist in any migration | `actor_user_id` FK references `tbl_auth_user_account(user_account_id)` |
| READ logging scope (detail views only vs. all list views) | **Resolved 2026-07-09 (human decision)**: detail views only | Applies to Role, Member/User, Organization detail-view reads only; list-view reads are not logged |
| FK nullability (`actor_user_id` strict NOT NULL vs nullable) | **Resolved 2026-07-09 (human decision)**: nullable | Consistent across all operation types, including `LOGIN_FAILED` and post-deletion referential safety |
| Migration version collision | **Found during Phase 5**: `V5` is already used by `V5__alter_tbl_dim_organization_for_management.sql`; highest existing version is `V495` | Use `V500__admin_audit_log.sql` instead of the originally planned `V5__admin_audit_log.sql` |
