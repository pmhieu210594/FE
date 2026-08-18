# Context

**Ticket ID**: ADMIN-AUDIT-LOG  
**Create date**: 2026-07-09  
**Author**: Claude (Phase 1 Investigation)  
**Update date**: 2026-07-09  

## Screen / API / Batch / Related Job

| area | detail |
|---|---|
| Screen | Admin Audit Log, read-only list + detail drawer for authorized users |
| Screen | Login, Role, Organization, Customer, Project, Repository, Team, Member/User screens are audit sources |
| API | `GET /api/v1/admin/audit-logs` |
| API | `GET /api/v1/admin/audit-logs/{id}` |
| API | Existing CRUD APIs remain the source of audit events and must not change contract |
| API | `POST /api/v1/auth/login` and `POST /api/v1/auth/logout` are the auth audit sources |
| Batch / Job | No batch/job in scope for Phase 2; audit capture is request-driven |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Thin controller with current-user injection | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/UserAccountAdminController.java` | Controller only maps request/response and delegates to service; uses `@CurrentUser AppUser caller` |
| CRUD service with transaction boundary | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/RoleService.java` | `@Transactional` on write methods; business rules stay in service layer |
| Read/query service pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java` | `@Transactional(readOnly = true)` for searches and details; `PageResult<T>` for paging |
| Login/logout flow | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` and `.../AuthService.java` | `login()` and `logout()` are the only auth entry points; login failures throw exceptions handled centrally |
| Request context carrier | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilter.java` | Existing filter already has access to request details and `WebAuthenticationDetailsSource` |
| Central exception response | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Safe `ErrorResponse` shape + `traceId` from MDC |
| Persistence adapter style | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Adapter layer does SQL work and keeps controller/service thin |
| Page DTO factory pattern | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/CustomerDtos.java` | `.from(PageResult<T>)` factory is the current DTO pattern |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `@CurrentUser AppUser caller` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentUser.java` and `CurrentAppUserResolver.java` | Use for admin CRUD sources and audit screen access checks |
| `PageResult<T>` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/common/PageResult.java` | Use for paged audit-log list responses |
| `ErrorResponse` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Use for safe error responses only |
| `GlobalExceptionHandler` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Keep exception-to-HTTP mapping centralized |
| `MDC.get("traceId")` | Logging standard / `GlobalExceptionHandler` | Read traceId from MDC; never generate manually |
| `@Transactional` / `@Transactional(readOnly = true)` | Service layer | Follow current service pattern for write/read paths |
| `ResponseEntity.status(HttpStatus.CREATED)` | Controller layer | Use the same response style as existing CRUD controllers |
| `NamedParameterJdbcTemplate` / MyBatis adapter pattern | Infrastructure layer | Keep persistence out of controllers |

## Forbidden common components

| component | reason |
|---|---|
| `System.out.println` | Violates logging standard; use SLF4J only |
| Generic file-read controller | Audit APIs are read-only queries, not file IO |
| Async queue/event bus for audit persistence | Audit writes need deterministic, request-bound behavior for this ticket |
| JPA entities for the new audit table | Current backend uses service + adapter + SQL patterns for these flows |
| `@AuthenticationPrincipal` for local `AppUser` injection | Current codebase uses `@CurrentUser`; `@AuthenticationPrincipal` resolves the wrong principal type here |
| Invented table names such as `tbl_dim_member` or `tbl_dim_user` | Current schema has `tbl_auth_user_account`; do not assume missing tables exist |
| Controller-level direct SQL | Persistence must stay in adapter/repository layer |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `RoleController.list/get/create/update/logicalDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/RoleController.java` | Existing admin CRUD controller pattern |
| `OrganizationController.list/get/create/update/softDelete/purgeTestDataByCodePrefix` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | Existing admin CRUD + test-support pattern |
| `CustomerController.search/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` | Existing paged CRUD controller pattern |
| `ProjectController.search/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` | Existing CRUD with nested team assignments |
| `RepositoryController.search/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/RepositoryController.java` | Existing CRUD controller for repository management |
| `TeamController.search/get/create/update/listMembers/addMember/updateMemberRole/removeMember/listMemberOptions/listRoleOptions` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` | Existing complex CRUD controller pattern |
| `UserAccountAdminController.list/get/create/update/activate/deactivate/resetPassword/roles` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/UserAccountAdminController.java` | Existing admin member/user management controller |
| `AuthController.login/logout` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` | Existing auth entry points for login/logout audit |
| `AuthService.login/currentUser/logout` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java` | Existing auth use case methods |
| `PageResult<T>` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/common/PageResult.java` | Reusable page envelope |
| `BearerTokenAuthenticationFilter.doFilterInternal(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilter.java` | Request context capture point |
| `CurrentAppUserResolver.supportsParameter/resolveArgument` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentAppUserResolver.java` | Resolves `@CurrentUser AppUser` and `AuthUserContext` |
| `GlobalExceptionHandler.handleAuthenticationFailed/handleUnknown/error` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Central error handling and traceId population |
| `ArtifactScannerJdbcAdapter.findRepository/upsertMinimalTicket/insertRun` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Good example of adapter-layer SQL handling |
| `UserAccountAdminDtos.UserAccountPageDto.from(PageResult<UserAccountAdminView>)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/UserAccountAdminDtos.java` | Existing DTO factory pattern for paged responses |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `GET /api/v1/admin/audit-log` | Singular path does not match ticket scope | Use `GET /api/v1/admin/audit-logs` |
| `AdminAuditLogController.update(...)` | Audit log is read-only | Expose only list/detail GET endpoints |
| `AdminAuditLogController.delete(...)` | Append-only log must never be deleted by application code | Use DB append-only rule and read-only API only |
| `AdminAuditLogService.logSuccessOnly(...)` | Overly specific and not a confirmed method in source | Create explicit create/update/delete/read/login/logout methods if Phase 3 needs them |
| `AuthService.loginSuccess(...)` | Does not exist in the current source | Keep login handling in `AuthService.login()` and add audit hook there |
| `AuthService.loginFailure(...)` | Does not exist in the current source | Capture failure in the exception path or dedicated audit helper |
| `@AuthenticationPrincipal AppUser caller` | Wrong principal type for current project | Use `@CurrentUser AppUser caller` |
| `tbl_dim_member` / `tbl_dim_user` | These tables are not confirmed in source; current schema shows `tbl_auth_user_account` | Confirm table reference before writing FK or mapping code |
| `new Thread(...)` or background executor for audit write | Breaks request/transaction determinism | Keep write path synchronous and transaction-bound |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| DTO (new in Phase 3+) | `AdminAuditLogDtos` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/AdminAuditLogDtos.java` | Planned list/detail DTOs for audit-log screen |
| DTO pattern reference | `UserAccountAdminDtos`, `CustomerDtos`, `ProjectDtos` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/*.java` | Existing factory pattern to follow |
| Use case (new in Phase 3+) | `AdminAuditLogService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/...` | Planned audit-log capture/query service |
| Port (new in Phase 3+) | `AdminAuditLogPersistencePort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/...` | Planned persistence contract |
| Persistence adapter (new in Phase 3+) | `AdminAuditLogJdbcAdapter` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/...` | Planned adapter, likely SQL/MyBatis style |
| Reused table (found in Phase 5, missed by Phase 1-2 source discovery) | `tbl_fact_access_log` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing, currently unused (zero Java references) access-log table; extended via `ALTER TABLE` instead of creating a new `tbl_admin_audit_log`. As-is it does not fit: `actor_member_key` FK targets `tbl_dim_member_pseudonym` (unrelated pseudonym dimension), `ip_hash`/`user_agent_hash` are one-way hashes (spec needs raw IP/UA displayed). See `spec-pack.md` §12 for the full rename/add-column plan. |
| New migration | `V500__admin_audit_log.sql` | `EDCAP_BE/src/main/resources/db/migration/` | `ALTER TABLE tbl_fact_access_log` only; additive/renaming, does not touch `V4__init_shema_v2.sql`. `V5` was already taken by `V5__alter_tbl_dim_organization_for_management.sql`; highest existing version is `V495`. |
| Existing master table | `tbl_dim_organization` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing source of organization data |
| Existing master table | `tbl_dim_customer` | same | Existing source of customer data |
| Existing master table | `tbl_dim_project` | same | Existing source of project data |
| Existing master table | `tbl_dim_repository` | same | Existing source of repository data |
| Existing master table | `tbl_dim_team` | same | Existing source of team data |
| Existing master table | `tbl_dim_role` | same | Existing source of role data |
| Existing identity table | `tbl_auth_user_account` | same | Current confirmed user/account table in source; use this as the current reference candidate |
| Existing permission code | `AUDIT_READ` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Confirmed permission code for audit-log read access |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| formItemNm | N/A | N/A | This ticket does not use `formItemNm` in the current backend schema |
| SEQNO | N/A | N/A | No current `SEQNO` mapping is defined for the audit log |
| Module - Login | `LOGIN` | spec-pack / wireframe | Audit source for login/logout/failure |
| Module - Role | `ROLE` | spec-pack / wireframe | Audit source for role CRUD |
| Module - Organization | `ORGANIZATION` | spec-pack / wireframe | Audit source for organization CRUD |
| Module - Customer | `CUSTOMER` | spec-pack / wireframe | Audit source for customer CRUD |
| Module - Project | `PROJECT` | spec-pack / wireframe | Audit source for project CRUD |
| Module - Repository | `REPOSITORY` | spec-pack / wireframe | Audit source for repository CRUD |
| Module - Team | `TEAM` | spec-pack / wireframe | Audit source for team CRUD |
| Module - Member/User | `MEMBER_USER` | spec-pack / wireframe | Audit source for member/user CRUD |
| Operation type | `CREATE`, `READ`, `UPDATE`, `DELETE`, `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT` | spec-pack | Keep values as enum-like strings |
| Audit access permission | `AUDIT_READ` | V4 migration | Use for read-only access to audit-log screen/API |

## Multilingual Note

- Keep all enum/code values in English and stable across the backend, database, and UI contracts.
- Preserve user-entered text in `before_value` / `after_value` as-is, including Vietnamese diacritics and mixed-language content.
- Do not translate stored audit payloads when writing them to the database.

## Encoding / Mojibake Note

- Use UTF-8 end-to-end for markdown, source notes, and audit payloads.
- Avoid Windows code-page conversions that can turn Vietnamese text into mojibake.
- When reading or writing JSON/text snapshots, preserve diacritics and punctuation exactly as provided.

## Log / Audit / Operation Note

- Use `traceId` from MDC for every audit entry and every supporting log line.
- Audit persistence must be append-only and should not expose raw secrets, passwords, tokens, or API keys.
- CRUD audit entries should be written in the same transaction as the business write.
- Login failure audit entries are best-effort and must not leak credential material.
- Access to audit-log APIs should be read-only and restricted to admin/audit permissions.

## Ticket-Specific Constraints

- Keep the template structure unchanged.
- Do not assume a missing table exists; `tbl_auth_user_account` is the current confirmed user/account table and the `tbl_dim_member` vs `tbl_dim_user` mismatch remains an open issue.
- Do not add non-read endpoints for the audit-log screen.
- Do not widen the scope to FE implementation in this phase.
