# Source Inventory

**Ticket ID**: ADMIN-AUDIT-LOG  
**Create date**: 2026-07-09  
**Author**: Claude (Phase 1 Investigation)  
**Update date**: 2026-07-09  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket spec | `docs/changes/ADMIN-AUDIT-LOG/spec-pack.md` | document | Ticket owner | read | Single source of truth; 18 sections, 10 AC, complexity classification |
| Ticket context | `docs/changes/ADMIN-AUDIT-LOG/context.md` | document | Ticket owner | read | Maps APIs, services, patterns, DTOs, tables involved |
| Ticket brainstorm | `docs/changes/ADMIN-AUDIT-LOG/00_brainstorm.md` | document | Ticket owner | read | Phase 1 observations, tensions, risks, open questions |
| Raw requirement | `docs/changes/ADMIN-AUDIT-LOG/raw/requirement.md` | markdown | BA/Owner | read | Canonical source for AC, 8 modules, FR/SC groups, open points |
| Raw database design | `docs/changes/ADMIN-AUDIT-LOG/raw/database_design.md` | markdown | DB/Backend | read | Canonical source for table schema, immutability, masking, write path, indexes |
| Raw wireframe | `docs/changes/ADMIN-AUDIT-LOG/raw/wireframe.md` | markdown | Designer/Owner | read | Screen layout, filters, search, detail drawer, summary cards |
| Architecture overview | `docs/architecture/overview.md` | markdown | Architecture | read | Hexagonal layers, confirms 7 CRUD services exist |
| Security standards | `docs/standards/security.md` | markdown | Security | read | Error response shape, pseudonym display rule, no PII in logs |
| Logging standards | `docs/standards/logging.md` | markdown | Standards | read | SLF4J + Logback, traceId via MDC, parameterized logging, log levels |
| Database standards | `docs/standards/database.md` | markdown | Standards | read | Flyway migrations, table naming (tbl_* prefix), MyBatis conventions |
| Testing standards | `docs/standards/testing.md` | markdown | Standards | read | Unit/integration/black-box test patterns, ArchUnit rules |
| Backend standards | `docs/standards/backend.md` | markdown (referenced in CLAUDE.md) | Standards | read | Layer/package/adapter/controller conventions, exception hierarchy |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | markdown | Architecture | read | Response shape pattern, error handling, pagination DTO pattern (PageResult) |
| Role CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/RoleController.java` | java | Backend | read | Controller for role management; candidate for audit logging interception |
| Role service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/RoleService.java` | java | Backend | read | Service with create/update/delete logic; where audit logging will be wired |
| Organization CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | java | Backend | read | Controller for organization management |
| Organization service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java` | java | Backend | read | Service with CRUD logic |
| Customer CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` | java | Backend | read | Controller for customer management |
| Customer service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CustomerService.java` | java | Backend | read | Service with CRUD logic |
| Project CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` | java | Backend | read | Controller for project management |
| Project service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/ProjectService.java` | java | Backend | read | Service with CRUD logic |
| Repository CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/RepositoryController.java` | java | Backend | read | Controller for repository management |
| Repository service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/RepositoryService.java` | java | Backend | read | Service with CRUD logic |
| Team CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` | java | Backend | read | Controller for team management |
| Team service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/TeamService.java` | java | Backend | read | Service with CRUD logic |
| Member/User CRUD | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/UserAccountAdminController.java` | java | Backend | read | Controller for member/user management |
| Member/User service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/UserAccountAdminService.java` | java | Backend | read | Service with CRUD logic |
| Auth controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` | java | Backend | read | Login/logout endpoints; where login audit will be wired |
| Auth service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java` | java | Backend | read | Login/logout logic; where login success/failure/logout audit will be wired |
| Bearer token filter | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilter.java` | java | Backend | read | Captures WebAuthenticationDetails with remoteAddress; will be used for IP capture |
| Security config | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | java | Backend | read | Spring Security setup; stateless token auth |
| Exception handling | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | java | Backend | read | Exception → HTTP status mapping; ErrorResponse shape |
| Pagination pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/common/PageResult.java` | java | Backend | read | Generic `PageResult<T>` record; will be used for audit log list |
| User account list DTO | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/UserAccountAdminDtos.java` | java | Backend | read | `UserAccountPageDto` + filter pattern; template for audit log list DTO |
| Persistence adapter pattern | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | java | Backend | read | MyBatis + JDBC adapter; template for audit log persistence |
| MyBatis mapper pattern | `EDCAP_BE/src/main/resources/mapper/*.xml` | xml | Backend | read | Parameterized queries, reusable column lists, pagination queries; template for audit log mapper |
| Base schema v2 | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | sql | DB | read | Contains all 6 dimension tables; confirms `tbl_auth_user_account` exists (user identity table) |
| Dimension tables confirmed | V4 migrations | reference | DB | confirmed | `tbl_dim_organization`, `tbl_dim_customer`, `tbl_dim_project`, `tbl_dim_repository`, `tbl_dim_team`, `tbl_dim_role` all exist |
| User identity table | V4 migrations | reference | DB | **critical** | Actual user table is `tbl_auth_user_account` (line 1226), not `tbl_dim_member`/`tbl_dim_user`; mismatch with requirement's assumption |
| Controller integration tests | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/...` | java | QA | partial | Existing @WebMvcTest slices; pattern for audit log list/detail endpoint tests |
| Service unit tests | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/...` | java | QA | partial | Service tests with mocked ports; pattern for audit log service tests |
| Auth tests | `EDCAP_BE/src/test/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilterTest.java` | java | QA | partial | Token validation; pattern for login audit event tests |

## Important Files

| file | purpose | criticality |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/RoleService.java` (and all 6 similar service files) | Where audit logging calls will be inserted for CRUD operations | Critical |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java` | Where login/logout/failure audit logging will be inserted | Critical |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Confirms all 6 dimension tables and the user identity table `tbl_auth_user_account` | Critical |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Exception handling pattern and error response shape | Important |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/UserAccountAdminDtos.java` | DTO and factory pattern for paginated list screens | Important |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/common/PageResult.java` | Generic pagination record | Important |
| `docs/standards/logging.md` | Logging standard including traceId and parameterized logging | Important |
| `docs/standards/database.md` | MyBatis conventions and migration patterns | Important |

## Generated / Excluded Files

- `EDCAP_BE/target/` — build output; not a source
- `EDCAP_FE/dist/` — FE build output; not a source
- `EDCAP_FE/node_modules/` — dependency cache; not a source
- `EDCAP_FE/coverage/` — generated report; not a source
- `.env`, `*.key`, `*.pem` — secrets; not read
- Raw logs, transcripts — irrelevant to spec

## Missing Files

- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/AdminAuditLogService.java` — audit logging service (new)
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/AuditLogMaskingHelper.java` — masking helper (new)
- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/AdminAuditLogPersistencePort.java` — port interface (new)
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/AdminAuditLogJdbcAdapter.java` — persistence adapter (new)
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/AdminAuditLogMapper.java` — MyBatis mapper (new)
- `EDCAP_BE/src/main/resources/mapper/AdminAuditLogMapper.xml` — MyBatis SQL (new)
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminAuditLogController.java` — read-only endpoints (new)
- `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/AdminAuditLogDtos.java` — response DTOs (new)
- `EDCAP_BE/src/main/resources/db/migration/V5__admin_audit_log.sql` — new table migration (new)
- Test files (to be created in Phase 3)
- FE component (optional MVP, can be deferred)