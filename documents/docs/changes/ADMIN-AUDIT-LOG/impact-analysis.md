# Impact Analysis

**Ticket ID**: ADMIN-AUDIT-LOG
**Create date**: 2026-07-09
**Author**: Claude (Phase 3)
**Update date**: 2026-07-09

## 1. Change Content

Add a centralized, append-only Admin Audit Log capability: a new `AdminAuditLogService` (Option A: explicit service-layer calls, confirmed) writes one audit row per CREATE/UPDATE/DELETE on the 7 admin/master-data services (Role, Organization, Customer, Project, Repository, Team, Member/User) and per LOGIN_SUCCESS/LOGIN_FAILED/LOGOUT event in `AuthService`. A new read-only `AdminAuditLogController` exposes list/detail GET endpoints backed by a new `tbl_admin_audit_log` table. No existing CRUD/auth endpoint contract changes; no FE implementation in this MVP.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/.../AdminAuditLogService.java` | New: `logCreate/logUpdate/logDelete/logLoginSuccess/logLoginFailure/logLogout` | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/AdminAuditLogPersistencePort.java` | New persistence port contract | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/AdminAuditLogJdbcAdapter.java` | New adapter: insert + paginated/filtered query against `tbl_admin_audit_log` | add |
| `EDCAP_BE/src/main/resources/mapper/AdminAuditLogMapper.xml` + `AdminAuditLogMapper.java` | New MyBatis mapper/SQL | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/AuditLogMaskingHelper.java` | New centralized masking helper (whitelist safe fields, omit secrets) | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminAuditLogController.java` | New GET-only `list`/`detail` endpoints | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/AdminAuditLogDtos.java` | New `AdminAuditLogListDto`/`AdminAuditLogEntryDto`/`AdminAuditLogDetailDto` | add |
| `EDCAP_BE/src/main/resources/db/migration/V5__admin_audit_log.sql` | New table + indexes + REVOKE/GRANT immutability DDL | add |
| `RoleService.java`, `OrganizationService.java`, `CustomerService.java`, `ProjectService.java`, `RepositoryService.java`, `TeamService.java`, `UserAccountAdminService.java` (`application/usecase/governance/`) | Add explicit `adminAuditLogService.log*()` calls in each create/update/delete (and detail-read for Role/Member-User/Organization only, per §6.1) method, same transaction | modify |
| `AuthService.java` (`application/usecase/governance/`) | Add `logLoginSuccess`/`logLoginFailure`/`logLogout` calls in `login()`/`logout()` and the failure path | modify |
| Test files for all files above (`src/test/UnitTest/...`, `src/test/IntegrationTest/...`) | New unit/integration coverage per AC | add |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `BearerTokenAuthenticationFilter.java` | May need to make IP/User-Agent request context reachable to `AdminAuditLogService` if not already accessible via request-scoped bean | medium |
| `GlobalExceptionHandler.java` | Coordinates the FAILED-path audit write for CRUD/login failures without leaking sensitive error detail | medium |
| `SecurityConfig.java` | Must restrict `/api/v1/admin/audit-logs/**` to `AUDIT_READ` permission / ADMIN role | medium |
| `PageResult.java` | Reused as-is for the new paginated audit-log list response; no change expected unless filter shape needs a new generic | low |
| `UserAccountAdminDtos.java` (pattern reference only) | Not modified; only used as the DTO-factory pattern to copy for `AdminAuditLogDtos` | very low |
| `EDCAP_FE/src/**` | No FE caller exists for any admin-audit-log endpoint; no FE change in this MVP | very low |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| `RoleController` / `OrganizationController` / `CustomerController` / `ProjectController` / `RepositoryController` / `TeamController` / `UserAccountAdminController` (create/update/delete/detail) | corresponding `*Service` → `AdminAuditLogService.log*()` | Each existing CRUD write now also produces one audit row in the same transaction |
| `AuthController.login/logout` | `AuthService.login/logout` → `AdminAuditLogService.logLoginSuccess/logLoginFailure/logLogout` | Auth flow gains audit hooks; login failure write is best-effort, outside the main transaction |
| `AdminAuditLogController.list/detail` (new) | `AdminAuditLogService.query/getDetail` (new) → `AdminAuditLogPersistencePort` (new) | New read-only path; no dependency on existing CRUD read paths |
| `AdminAuditLogService.log*()` (new) | `AuditLogMaskingHelper.mask()` (new) | Every write passes through masking before persistence |
| `AdminAuditLogJdbcAdapter` (new) | `tbl_admin_audit_log` (new) | Insert (append-only) + filtered/paginated select only; no update/delete SQL exists |

## 5. FE Impact

- No new FE components in this MVP (per spec-pack §11 and context.md "Do not widen the scope to FE implementation in this phase").
- `EDCAP_FE/src/**` has no existing caller for `/api/v1/admin/audit-logs*`; confirmed absent via source-inventory.md.
- No FE regression risk: this ticket does not touch any existing FE-consumed endpoint or DTO shape.

## 6. BE Impact

- Hexagonal layering preserved: new port in `application/port/out/persistence`, new adapter in `infrastructure/persistence/adapter`, new service in `application/usecase`, new thin controller in `web/rest` (per ADR-001-clean-hexagonal.md and `20-architecture.md`).
- All 7 CRUD services and `AuthService` gain one new dependency (`AdminAuditLogService`) injected via constructor; no change to their existing public method signatures or return types.
- CRUD audit writes are transaction-bound (`@Transactional`, same as the business write); login-failure writes are explicitly best-effort/outside transaction per spec-pack §6.4.
- Masking is centralized in one helper — no per-service scattered masking logic (per spec-pack §6.6 Maintainability requirement).

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `GET /api/v1/admin/audit-logs` (new) | New: filters (module, operation type, actor, date range) + search (actor, entity, IP) + pagination | New: `PageResult<AdminAuditLogEntryDto>` | N/A (new endpoint) |
| `GET /api/v1/admin/audit-logs/{id}` (new) | New: path param `id` | New: `AdminAuditLogDetailDto` (before/after diff, login context) | N/A (new endpoint) |
| All 7 existing CRUD endpoints (Role/Org/Customer/Project/Repository/Team/Member-User) | No request shape change | No response shape change | Yes — fully unchanged, audit logging is transparent server-side |
| `POST /api/v1/auth/login`, `POST /api/v1/auth/logout` | No request shape change | No response shape change | Yes — fully unchanged |

## 8. DTO / Schema / Validation Impact

- New DTOs only: `AdminAuditLogListDto`, `AdminAuditLogEntryDto`, `AdminAuditLogDetailDto` (factory-from-`PageResult<T>` pattern, following `UserAccountAdminDtos` style).
- No existing DTO (`RoleDtos`, `CustomerDtos`, `ProjectDtos`, etc.) changes shape.
- New validation surface: enum whitelists for `module`, `entity_type`, `operation_type` (reject unknown values on filter input); `operation_status`/status is no longer part of this feature's data model, filters, or validation surface; masking whitelist in `AuditLogMaskingHelper` (reject/omit unknown-safe fields conservatively per spec-pack §6.4).

## 9. DB / Migration Impact

- **One new table**: `tbl_admin_audit_log` (see spec-pack §12 for full column list).
- **New indexes**: actor, entity, module/operation, `occurred_at` (per database design doc, referenced via spec-pack §12).
- **Immutability enforced at DDL level**: `REVOKE UPDATE, DELETE ON tbl_admin_audit_log FROM app_write_role; GRANT INSERT, SELECT ON tbl_admin_audit_log TO app_write_role;`
- **No existing migration modified** — new file only: `V5__admin_audit_log.sql`, additive.
- **Open / not yet finalized**: `actor_user_id` FK target. Working assumption for this phase is `tbl_auth_user_account.id` (only confirmed identity table in source — `tbl_dim_member`/`tbl_dim_user` do not exist). This assumption must be **re-confirmed before the migration file is actually written** in Phase 4 (Stop/Ask condition per ticket-rules.md).
- **Open**: FK nullability strictness (`NOT NULL` vs nullable `actor_user_id` for deleted-user resilience) — spec-pack §16 item 4, unresolved.
- No changes to the 6 existing dimension tables.

## 10. Batch / Job / Event Impact

- None. Audit capture is fully request-driven/synchronous (per context.md: "No batch/job in scope for Phase 2"; ticket-rules.md forbids moving audit writes to an async queue without a specific architecture decision).
- No new scheduled job, no event bus, no background executor.

## 11. Test Impact

- **Unit**: `AuditLogMaskingHelper` (secret omission + safe-field preservation), `AdminAuditLogService` (log entry construction per operation type, best-effort failure handling).
- **Integration**: each of the 7 CRUD services × {CREATE, UPDATE, DELETE, sensitive-detail READ} produces exactly one audit row; `AuthService` × {login success, login failure, logout}; masking verified end-to-end on a password-hash update case.
- **Black-box**: `AdminAuditLogController` list/detail screen behavior — pagination, filters, search, summary counts, read-only (no edit/delete controls); DB-level immutability check (attempted UPDATE/DELETE via raw SQL must fail).
- **Regression**: existing 7 CRUD + auth flow must still pass all current tests unchanged; overhead of audit write must stay <10ms per operation (spec-pack §6.6).
- No FE test impact (no FE code in this MVP).

## 12. Operation / Monitoring Impact

- SLF4J log line on every audit write: `"Audit log entry written for {entity} {operation_type} {traceId}"` (per spec-pack §6.6 Observability).
- `trace_id` read from MDC on every audit row for cross-correlation with application logs (never generated manually, per `logging.md` / ticket-rules.md).
- No raw entity payload or secret is ever logged, even in error/warning lines.
- Expected volume: ~3,000 entries/month at current usage (spec-pack §14); no special monitoring dashboard required for MVP.

## 13. Rollout / Rollback Impact

- Rollout is additive: new table + new endpoints + new service-layer calls; no existing behavior changes visibly to callers.
- Fastest rollback: revert the code changes that call `AdminAuditLogService.log*()` (or disable via a follow-up patch) — this does not require touching business logic beyond removing the added calls.
- No migration rollback needed for MVP: since `V5__admin_audit_log.sql` is additive-only, rollback of the migration (if ever required) would be a new forward migration, never an edit to `V4` or `V5`.
- Data already written to `tbl_admin_audit_log` before a rollback remains for audit purposes (append-only, never purged as part of rollback).

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| FE app / router / components | Unaffected | source-inventory.md confirms no FE caller exists for any audit-log endpoint; spec-pack §11 explicitly excludes FE from MVP |
| Existing 7 CRUD API contracts (request/response shape) | Unaffected | Audit logging is a side-effect write inside the service method; no DTO field added/removed on existing endpoints |
| Existing auth API contract (`/api/v1/auth/login`, `/logout`) | Unaffected | Same reasoning; audit hook is an internal side-effect only |
| 6 existing dimension tables (`tbl_dim_organization/customer/project/repository/team/role`) | Unaffected | New table is fully separate; no FK from dimension tables into the audit table |
| Connector/parser ingest audit logging | Unaffected | Explicitly out of scope per spec-pack §2.2, tracked as a separate feature |
| Batch/Job/Event infrastructure | Unaffected | Audit capture is request-driven only; ticket-rules.md forbids introducing an async queue for this ticket |
| Session/token management | Unaffected | Spec-pack §2.2 explicitly excludes session/token administration; only the fact of login/logout/failure is logged |

## 15. Required Options

- Option A only: explicit service-layer `adminAuditLogService.log*()` calls; no interceptor/AOP-based capture.
- Append-only table, immutability enforced at DDL level (`REVOKE UPDATE, DELETE`).
- No new FE surface in this MVP.
- No new async/batch/event-queue path; audit capture stays request-driven/synchronous.
- Masking centralized in one helper only; no per-service masking logic.
- No existing CRUD/auth endpoint contract change; audit writes are additive/transparent.
- Same-transaction write for CRUD audit rows; login-failure write stays best-effort/outside transaction.

## 16. Human Decision Required

1. **READ logging scope**: confirm limited to record-level detail views of Role, Member/User, Organization only (per spec-pack §6.1), not all list views. Working assumption: detail-views-only, per current spec-pack wording.
2. **FK nullability**: whether `actor_user_id` should be nullable beyond the LOGIN_FAILED case (e.g., if a user is later deleted from `tbl_auth_user_account`).

Already resolved this phase (see source-availability.md Human Decision Log):
- Interception strategy → **Option A confirmed** (explicit `AdminAuditLogService` calls).
- Actor identity FK target → **`tbl_auth_user_account` working assumption confirmed**, pending final re-confirmation before Phase 4 migration write.

## 17. Risk Summary

- **High**: if `tbl_auth_user_account` is not re-confirmed as the final FK target before the migration is written, the FK column/constraint may need rework post-migration.
- **Medium**: masking helper must be reviewed carefully — any gap in the secret-field whitelist could leak credentials into JSONB snapshots (spec-pack §13 Security/Privacy Impact).
- **Medium**: if READ logging scope is not finalized, over-logging (all list views) could bloat the table and skew the <10ms overhead target.
- **Low**: rollout risk overall — additive migration, no existing contract touched, no FE surface, no batch/async complexity introduced.
