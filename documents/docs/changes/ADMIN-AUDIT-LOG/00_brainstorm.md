# 00_brainstorm

**Ticket ID**: ADMIN-AUDIT-LOG  
**Create date**: 2026-07-09  
**Author**: Claude (Phase 1 Investigation)  
**Update date**: 2026-07-09  

---

## Purpose

Record Phase 1 observations, discovered facts, risks, and decision points before locking `spec-pack.md` as the single source of truth. This file is for reasoning and assumptions only; the official contract lives in `spec-pack.md`.

---

## Known Information

- All 7 CRUD audit modules (Role, Organization, Customer, Project, Repository, Team, Member/User) have existing controllers and services under `application/usecase/governance/` following hexagonal architecture.
- Login/logout/login-failure events are handled by `AuthService.java` and `AuthController.java` using Bearer token authentication (not OAuth2 as initially expected).
- One new table `tbl_admin_audit_log` is required, with append-only immutability enforced at the database level (no UPDATE/DELETE grants).
- All 6 dimension tables (`tbl_dim_organization`, `tbl_dim_customer`, `tbl_dim_project`, `tbl_dim_repository`, `tbl_dim_team`, `tbl_dim_role`) exist in V4 migrations.
- Data masking rule is clear: passwords, tokens, secrets are never stored; only the fact that the field changed is recorded.
- Pagination and list-screen DTO patterns exist via `PageResult<T>` and `UserAccountAdminController.list()`.
- Global exception handling via `GlobalExceptionHandler` and `ErrorResponse` record is already in place.
- SLF4J logging with traceId via MDC is the standard; parameterized logging is enforced.

---

## Discovered Tensions

### User Identity Table Naming Divergence

The database design document (`raw/database_design.md`) assumes a table called `tbl_dim_member` or `tbl_dim_user` for the Member/User master data.

**Reality**: The actual user/account table is named `tbl_auth_user_account` (found at line 1226 of `V4__init_shema_v2.sql`), not `tbl_dim_member` or `tbl_dim_user`.

There is also `tbl_dim_member_pseudonym` (line 158), which is for **pseudonymized member references**, not the primary user identity table.

**Impact**: The audit log table's foreign key to the actor user must reference `tbl_auth_user_account`, not the assumed `tbl_dim_member`. This is a critical specification divergence that needs human confirmation before implementation.

### Authentication Model Mismatch

The security standards document (`docs/standards/security.md`) describes OAuth2 with Google and session cookies. However, the actual `AuthController` and `AuthService` implement **Bearer token authentication** (stateless, token-based), not OAuth2 sessions.

**Investigation needed**: Are there two separate auth paths? Is OAuth2 used elsewhere, or is the security standards doc out of sync with implementation?

---

## Undetermined Points

### Q1: Which user identity table should audit log reference?

**Option A**: `tbl_auth_user_account` (the actual existing table)  
**Option B**: Create/use a `tbl_dim_member` or `tbl_dim_user` table (aligns with dimension naming but doesn't exist)  
**Option C**: Reference `tbl_dim_member_pseudonym` (but it's for pseudonymized refs, not primary identity)  

**Decision needed**: Human confirmation on the intended user identity table before implementation.

### Q2: How should CRUD audit logging be triggered?

**Option A**: Explicit logging calls in each service (`service.create()` logs via `auditLogService.logCreate()`)  
**Option B**: AOP/aspect interceptor on `@Transactional` service methods (decouples logging from business logic)  
**Option C**: Controller-level cross-cutting concern via a filter/interceptor before the service layer  

**Decision needed**: Which pattern fits the project's architecture best. Current codebase has no audit aspect, so we will author the first pattern seen.

### Q3: Should READ logging include list views or only detail views?

The requirement says "READ only for record-level detail views of Role, Member/User, and Organization (sensitive entities), not for every list view." 

**Decision needed**: Clarify the exact scope—does `GET /api/v1/roles/{id}` trigger READ logging, but `GET /api/v1/roles` does not?

### Q4: What is the shape of the `actor_user_id` foreign key constraint?

If we use `tbl_auth_user_account`, should `actor_user_id` reference `tbl_auth_user_account.id`? Or should we store the username (`actor_username`) without a FK for resilience (in case the user is deleted from `tbl_auth_user_account`)?

**Decision needed**: Confirm the foreign key strategy (strict referential integrity vs. loose logging resilience).

---

## Expected Risks

1. **User table divergence**: If `tbl_dim_member` is planned but not yet created, the implementation strategy changes. We will assume `tbl_auth_user_account` is correct unless told otherwise.
2. **No existing audit framework**: All 7 services will need audit logging wired in. If audit logging is not carefully placed, some CRUD operations could be missed (e.g., role assignment changes within a Member update must be logged).
3. **IP address capture**: The `BearerTokenAuthenticationFilter` builds `WebAuthenticationDetails` but it is unused. We must ensure HTTP request context (IP, User-Agent) is captured before logging.
4. **Idempotency**: The requirement states writes should be in the same transaction as the business operation, plus draft/official states. We must verify that idempotency is enforced correctly (based on `content_hash` or a similar unique key, not just timestamp).
5. **Masking helper robustness**: Any field in a CRUD entity could potentially contain a password or token. The masking helper must use a whitelist of known-safe fields rather than a blacklist of dangerous ones, to avoid accidental secret exposure.
6. **Login failures**: If a login fails before authentication (invalid username), there is no user entity to attach to the log. We must handle this gracefully (store attempted username, NULL user_id).

---

## What AI Needs to Investigate (Done in Phase 1)

- ✅ Confirmed all 7 CRUD controllers/services exist and are ready for audit logging integration.
- ✅ Confirmed login/logout/login-failure endpoints exist via `AuthService`.
- ✅ Confirmed all 6 dimension tables exist (except user table naming mismatch).
- ✅ Confirmed global exception handling and error response shape.
- ✅ Confirmed pagination and list-screen DTO patterns exist.
- ✅ Confirmed traceId and logging standards are in place.

---

## What Humans Need to Ask

1. **User identity table**: Is `tbl_auth_user_account` the correct table, or should we reference `tbl_dim_member` (which does not exist yet)?
2. **Audit logging pattern**: Explicit service calls, AOP aspect, or filter-level interception?
3. **READ logging scope**: Detail views only, or include list views as well?
4. **Foreign key strategy**: Should `actor_user_id` have a strict FK to `tbl_auth_user_account`, or should it be nullable (resilience if user is deleted)?

---

## Conditions Under Which Implementation Is Not Permitted

- Do not implement audit logging without confirming the user identity table reference (Q1).
- Do not add new tables or change existing migrations unless explicitly approved (database design locks in `tbl_admin_audit_log` only).
- Do not store raw passwords, tokens, or secrets, even masked — only the fact that a field changed.
- Do not log full request/response bodies or raw authentication details.
- Do not use soft delete for audit log entries — only hard inserts, no updates/deletes.
- Do not implement automated alerting on suspicious activity in this ticket (out of scope; future phase).

---

## Expected Architecture Impact

- **New table**: `tbl_admin_audit_log` (append-only, no UPDATE/DELETE grants to app role).
- **New migration file**: `V5__admin_audit_log.sql` (or next available version).
- **New service(s)**: Audit logging service(s) to encapsulate logging logic (e.g., `AdminAuditLogService`).
- **Modified services**: All 7 CRUD services + auth service will call audit logging (either directly or via aspect).
- **New controller(s)**: `AdminAuditLogController` for the read-only screen (list, filter, search, detail).
- **New DTOs**: `AdminAuditLogListDto`, `AdminAuditLogDetailDto`, filter/search request DTOs.
- **New persistence adapter/mapper**: MyBatis adapter for audit log queries (list, detail, count).
- **New tests**: Unit tests for audit service logic, integration tests for CRUD audit capture, black-box tests for screen functionality.
- **No FE work in MVP**: The screen is read-only query-based; a simple FE component consuming the new controller API is deferred or minimal.

---

## Phase 1 Readiness Checkpoint

✅ Scope locked (8 audit modules, 10 AC, immutable log, masking rules)  
✅ Database design finalized (1 new table, append-only, no new schemas)  
✅ All existing CRUD endpoints confirmed  
⚠️ **User identity table reference NEEDS CONFIRMATION** (critical blocker)  
⚠️ **Audit logging pattern NEEDS DECISION** (architectural choice)  
⚠️ **READ logging scope NEEDS CLARIFICATION** (requirement ambiguity)  

Once the above 3 decisions are made, Phase 2 (detailed implementation plan) and Phase 3 (implementation) can proceed without further blockers.
