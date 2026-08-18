# Sources

**Ticket ID**: ADMIN-AUDIT-LOG  
**Create date**: 2026-07-09  
**Author**: Claude (Phase 1 Investigation)  
**Update date**: 2026-07-09  

---

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Ticket folder | `docs/changes/ADMIN-AUDIT-LOG/` | Active | Single source of truth for Phase 1 |
| Raw requirement | `docs/changes/ADMIN-AUDIT-LOG/raw/requirement.md` | Reviewed | Primary source for scope, AC, 8 audit modules, login audit, masking rules |
| Raw database design | `docs/changes/ADMIN-AUDIT-LOG/raw/database_design.md` | Reviewed | New table `tbl_admin_audit_log`, immutability rules, data masking, write path |
| Raw wireframe | `docs/changes/ADMIN-AUDIT-LOG/raw/wireframe.md` | Reviewed | Screen layout, filters, search, detail drawer, empty state, status indicators |

---

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement definition | `docs/changes/ADMIN-AUDIT-LOG/raw/requirement.md` | Reviewed | Primary | 8 modules (Login + 7 management screens), 10 AC, FR-AUD/FR-LGN/FR-MSK/FR-SCR groups |
| Database design | `docs/changes/ADMIN-AUDIT-LOG/raw/database_design.md` | Reviewed | Primary | 1 new table, append-only, masking rules, write path, idempotency via txn scope, indexes, migration checklist |
| Wireframe | `docs/changes/ADMIN-AUDIT-LOG/raw/wireframe.md` | Reviewed | Primary | List view, filters, search, summary cards, detail drawer CRUD/Login, empty state |
| Architecture overview | `docs/architecture/overview.md` | Reviewed | Supporting | Hexagonal layers (domain ← application ← web/infrastructure); confirms existing 7 CRUD controllers exist |
| Security standards | `docs/standards/security.md` | Reviewed | Supporting | Session-based auth (OAuth2 Google), error response shape, no PII in logs, pseudonym display rule |
| Logging standards | `docs/standards/logging.md` | Reviewed | Supporting | SLF4J + Logback, traceId via MDC, parameterized logging, log levels, no sensitive data |
| Database standards | `docs/standards/database.md` | Reviewed | Supporting | Flyway migration V5+ uses `tbl_*` prefix, ENUM types, MyBatis conventions, HikariCP pool |
| Testing standards | `docs/standards/testing.md` | Reviewed | Supporting | Unit (mock ports) / web layer (@WebMvcTest) / integration / ArchUnit architecture tests |
| Backend standards | `docs/standards/backend.md` | Reviewed (referenced via CLAUDE.md) | Supporting | Layer/package/adapter/exception conventions |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | Reviewed | Supporting | Confirms existing endpoints and error response shape; Team/Organization/Customer examples |

---

## Existing Source Code

| area | path | status | purpose | note |
|---|---|---|---|---|
| Role CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/RoleController.java` → `application/usecase/governance/RoleService.java` | Reviewed | Existing controller/service layer for Role management | Candidate for audit logging interception |
| Organization CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` → `application/usecase/governance/OrganizationService.java` | Reviewed | Existing controller/service for Organization management | Candidate for audit logging interception |
| Customer CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` → `application/usecase/governance/CustomerService.java` | Reviewed | Existing controller/service for Customer management | Candidate for audit logging interception |
| Project CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` → `application/usecase/governance/ProjectService.java` | Reviewed | Existing controller/service for Project management | Candidate for audit logging interception |
| Repository CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/RepositoryController.java` → `application/usecase/governance/RepositoryService.java` | Reviewed | Existing controller/service for Repository management | Candidate for audit logging interception |
| Team CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` → `application/usecase/governance/TeamService.java` | Reviewed | Existing controller/service for Team management | Candidate for audit logging interception |
| Member/User CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/UserAccountAdminController.java` → `application/usecase/governance/UserAccountAdminService.java` | Reviewed | Existing controller/service for Member/User management | Candidate for audit logging interception |
| Auth / Login | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` → `application/usecase/governance/AuthService.java` | Reviewed | Existing login/logout paths via Bearer token auth | No success/failure handlers currently; must wire audit logging |
| Bearer token filter | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilter.java` | Reviewed | Builds `WebAuthenticationDetails` with remoteAddress; unused currently | Candidate for IP address capture |
| Security config | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Reviewed | Spring Security setup, `STATELESS` sessions, token auth | Filter chain and auth entry points |
| Exception handling | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Reviewed | Exception → HTTP status mapping via `ErrorResponse` record | Consistent error handling pattern |
| Pagination pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/common/PageResult.java` | Reviewed | Generic `PageResult<T>` record with page/size/totalElements/totalPages | Used by `UserAccountAdminController.list()` |
| User account list DTO | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/UserAccountAdminDtos.java` | Reviewed | `UserAccountPageDto` + filter params (keyword/status/roleIds/page/size) | Template for Admin Audit Log list screen DTO |
| MyBatis adapter pattern | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Reviewed | MyBatis + JDBC adapter pattern for persistence | Template for audit log persistence adapter |

---

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Controller integration | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/...` | Partial | Existing @WebMvcTest slices for other controllers; pattern to follow for audit log screen API tests |
| Service unit tests | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/...` | Partial | Existing service tests with mocked ports; pattern to follow |
| Auth / login tests | `EDCAP_BE/src/test/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilterTest.java` | Partial | Token validation tests; no login success/failure audit tests found |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| External office docs, PDFs, slides | Local workspace attachment | Use only if attached to ticket | None found in folder; requirement + database design are sufficient |
| Public web sources | Web | Not used in Phase 1 | Internal documents are sufficient |

---

## Excluded Sources

| source/path | reason |
|---|---|
| `EDCAP_BE/target/`, `EDCAP_FE/dist/`, `node_modules/`, `coverage/` | Generated artifacts |
| `.env`, `*.key`, `*.pem`, credentials | Sensitive; unnecessary for Phase 1 |
| Raw logs, transcripts | Irrelevant to spec |

---

## Source Limitations

- All 7 CRUD controllers + login/auth endpoints exist and are confirmed. No audit logging framework currently exists (no AOP, no event publisher, no handlers).
- All 6 dimension tables for the 7 audit modules exist **EXCEPT** the user/member identity table is named `tbl_auth_user_account` instead of `tbl_dim_member`/`tbl_dim_user` — this diverges from the database design document's assumption and requires clarification.
- No existing IP address / User-Agent capture mechanism is wired; `BearerTokenAuthenticationFilter` captures `remoteAddress` but it is unused currently.
- No existing login success/failure handlers; auth failures throw exceptions, not events. Must wire into `AuthService` and `AuthController`.
- Pagination pattern and DTO factory pattern exist via `UserAccountAdminController` and `PageResult`; can be reused.
- Test infrastructure (JUnit 5, Mockito, ArchUnit) is in place; prior test patterns available for reference.

---

## Assumptions from Sources

- The 7 CRUD audit modules (Role, Organization, Customer, Project, Repository, Team, Member/User) will use existing controllers/services as interception points for logging.
- Login audit will be wired into `AuthService.login()` and `AuthService.logout()`, plus exception handling for login failures.
- User identity in the audit log will reference one of: `tbl_auth_user_account` (confirmed table), or a different approach TBD.
- Immutable append-only log table (`tbl_admin_audit_log`) will be created in a new migration file (`V5__admin_audit_log.sql` or similar).
- Masking of sensitive fields (passwords, tokens, secrets) will use a helper utility before persistence.
- HTTP request context (IP, User-Agent) will be captured via a filter or interceptor before logging.

---

## Human Confirmation Required

1. **User Identity Table (CRITICAL)**: The database design assumes `tbl_dim_member` exists, but the actual user table is `tbl_auth_user_account`. Should audit log reference `tbl_auth_user_account.id` and `tbl_auth_user_account.username`, or is there a different intended user table? Is `tbl_dim_member` planned but not yet created?
2. **Logging Interception Strategy**: Should audit logging be implemented via AOP/aspect decorator, explicit logging in each service, or controller-level cross-cutting concern? Current codebase does not have an audit aspect, so we will author a new pattern.
3. **READ Logging Scope**: The requirement mentions "READ only for record-level detail views of Role, Member/User, and Organization (sensitive entities), not for every list view." Should we implement this distinction, or audit all reads uniformly?