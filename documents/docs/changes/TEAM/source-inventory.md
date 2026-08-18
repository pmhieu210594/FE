# Source Inventory

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung / ChatGPT  
**Update date**: 2026-06-15  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket | `docs/changes/TEAM/spec-pack.md` | Markdown spec | Product / PM | read | Primary AC and scope source. |
| Ticket | `docs/changes/TEAM/context.md` | Markdown context | Ticket author / AI | read | Phase 2 context and source decisions. |
| Ticket | `docs/changes/TEAM/ticket-rules.md` | Markdown rules | Ticket author / AI | read | Phase 2 rules for TEAM implementation. |
| Template | `docs/standards/templates/_ticket-template/source-availability.md` | Markdown template | Standards | read | Structure reference for this file set. |
| Template | `docs/standards/templates/_ticket-template/source-inventory.md` | Markdown template | Standards | read | Structure reference for inventory. |
| Template | `docs/standards/templates/_ticket-template/impact-analysis.md` | Markdown template | Standards | read | Structure reference for impact analysis. |
| Template | `docs/standards/templates/_ticket-template/impl-plan.md` | Markdown template | Standards | read | Structure reference for implementation plan. |
| BE API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | Java controller | BE | read | Reference CRUD controller and `@CurrentUser` style. |
| BE API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` | Java controller | BE | read | Reference CRUD controller with parent relation; note create returns `200 OK`. |
| BE API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` | Java controller | BE | missing | To be created for TEAM. |
| BE DTO | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/OrganizationDtos.java` | Java DTO | BE | partial | Reference page/request/response DTO style. |
| BE DTO | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/CustomerDtos.java` | Java DTO | BE | partial | Reference page/request/response DTO style. |
| BE DTO | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/TeamDtos.java` | Java DTO | BE | missing | To be created for Team and TeamMember DTOs. |
| BE service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java` | Java service | BE | read | Reference `requireAdmin`, normalization, uniqueness, soft delete, optimistic lock. |
| BE service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CustomerService.java` | Java service | BE | read | Reference parent validation, active entity lookup, uniqueness and delete rules. |
| BE service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/TeamService.java` | Java service | BE | missing | To be created; must contain all TEAM business rules. |
| BE domain | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Organization.java` | Java domain | BE | partial | Reference status/version/metadata model style. |
| BE domain | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Customer.java` | Java domain | BE | partial | Reference status/version/metadata model style. |
| BE domain | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Team.java` | Java domain | BE | missing | To be created or mapped to existing DB fields. |
| BE domain | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/TeamMember.java` | Java domain | BE | missing | To be created for `tbl_team_member`. |
| BE port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/OrganizationRepositoryPort.java` | Java port | BE | partial | Reference repository interface shape. |
| BE port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/CustomerRepositoryPort.java` | Java port | BE | partial | Reference repository interface shape. |
| BE port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TeamRepositoryPort.java` | Java port | BE | missing | To be created. |
| BE adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/OrganizationRepositoryAdapter.java` | Java adapter | BE | partial | Reference MyBatis adapter pattern. |
| BE adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CustomerRepositoryAdapter.java` | Java adapter | BE | partial | Reference MyBatis adapter pattern. |
| BE adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/TeamRepositoryAdapter.java` | Java adapter | BE | missing | To be created. |
| BE mapper | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/OrganizationMapper.java` | MyBatis Java mapper | BE | partial | Reference annotation-based SQL style. |
| BE mapper | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/CustomerMapper.java` | MyBatis Java mapper | BE | partial | Reference annotation-based SQL style. |
| BE mapper | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/TeamMapper.java` | MyBatis Java mapper | BE | missing | To be created with Team and TeamMember queries. |
| BE security | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Java config | BE | read | Authenticated-by-default; TEAM must add service-level ADMIN guard. |
| BE security | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Java domain | BE | read | Role enum includes `VIEWER`, `EDITOR`, `ADMIN`. |
| BE exceptions | `BusinessRuleException`, `NotFoundException`, `ForbiddenException`, `OptimisticLockingException` | Java exceptions | BE | partial | Use existing exception/message-key pattern. |
| DB migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | SQL migration | Data/BE | read / partial | Defines `tbl_dim_team`, `tbl_dim_role`, `tbl_dim_member_pseudonym`, legacy `team_id/role_id`, `idx_team_project`. |
| DB migration | `EDCAP_BE/src/main/resources/db/migration/V112__alter_tbl_dim_customer_global_customer_code_unique.sql` | SQL migration | Data/BE | read / partial | Current latest version observed. TEAM migration candidate starts after V112. |
| DB migration | `EDCAP_BE/src/main/resources/db/migration/V113__team_management.sql` | SQL migration | Data/BE | missing | Candidate new migration name; confirm latest before implementation. |
| FE route | `EDCAP_FE/src/App.tsx` | React route | FE | read | Add `/:lang/teams` under `RequireAdmin`. |
| FE layout | `EDCAP_FE/src/components/Layout.tsx` | React layout | FE | read | Add Team nav under admin/system-admin if required by UI pattern. |
| FE page | `EDCAP_FE/src/pages/OrganizationPage.tsx` | React page | FE | partial | Reference list/form/CRUD UI pattern. |
| FE page | `EDCAP_FE/src/pages/CustomerPage.tsx` | React page | FE | partial | Reference parent selection/search pattern. |
| FE page | `EDCAP_FE/src/pages/TeamPage.tsx` | React page | FE | missing | To be created. |
| FE API | `EDCAP_FE/src/lib/api.ts` | TypeScript API client | FE | read / partial | Add Team DTO types and `endpoints.teams.*`. |
| FE i18n | `EDCAP_FE/public/locales/en/locale.json` | JSON locale | FE | partial | Add Team keys. |
| FE i18n | `EDCAP_FE/public/locales/vi/locale.json` | JSON locale | FE | partial | Add Team keys; preserve UTF-8. |
| FE i18n | `EDCAP_FE/public/locales/ja/locale.json` | JSON locale | FE | partial | Add Team keys; preserve UTF-8. |
| FE legacy | `EDCAP_FE/src/router.ts`, `EDCAP_FE/src/router.tsx`, `EDCAP_FE/src/services/crud/*`, `EDCAP_FE/src/services/global/*` | TypeScript legacy/template code | FE | read / partial | Do not use for TEAM unless current app imports prove it is active. |
| BE tests | `EDCAP_BE/src/test/UnitTest/java/.../OrganizationServiceTest.java` | Java unit test | QA/BE | partial | Reference service test pattern. |
| BE tests | `EDCAP_BE/src/test/IntegrationTest/java/.../OrganizationControllerIntegrationTest.java` | Java integration test | QA/BE | partial | Reference API integration test pattern. |
| BE tests | `EDCAP_BE/src/test/IntegrationTest/java/.../OrganizationMigrationIntegrationTest.java` | Java migration test | QA/BE | partial | Reference DB migration test style. |
| FE tests | `EDCAP_FE/src/__ tests __/organization/OrganizationPage.test.tsx` | React test | QA/FE | partial | Reference page test pattern. |
| FE tests | `EDCAP_FE/src/__ tests __/organization/organization-api.test.ts` | TypeScript test | QA/FE | partial | Reference API helper test pattern. |
| TEAM tests | `EDCAP_BE/src/test/**/Team*.java`, `EDCAP_FE/src/**/team/*.test.tsx` | Tests | QA | missing | To be created in implementation/test phases. |

## Important Files

| file | why important for TEAM |
|---|---|
| `docs/changes/TEAM/spec-pack.md` | Defines 20 AC items and resolved human decisions. |
| `docs/changes/TEAM/context.md` | Defines existing/missing methods, DTO/table mapping, components to use/not use. |
| `docs/changes/TEAM/ticket-rules.md` | Defines ticket-specific implementation constraints. |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing Team/member/role tables and legacy columns live here. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java` | Best service-level ADMIN/validation/soft-delete pattern. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CustomerService.java` | Best parent-entity validation/active lookup pattern. |
| `EDCAP_FE/src/App.tsx` | Actual active route configuration. |
| `EDCAP_FE/src/components/Layout.tsx` | Actual active navigation. |
| `EDCAP_FE/src/lib/api.ts` | Actual active API client/types. |
| `EDCAP_FE/public/locales/*/locale.json` | Required for TEAM i18n. |

## Generated / Excluded Files

| path/pattern | judgment | reason |
|---|---|---|
| `EDCAP_BE/target/` | excluded | Build output, not source. |
| `EDCAP_FE/node_modules/` | excluded | Dependency output, not source. |
| `EDCAP_FE/dist/` | excluded | Build output, not source. |
| `.git/` | excluded | VCS metadata. |
| `.env`, `.env.*` | excluded from content review | May contain secrets; do not read or copy into artifacts. |
| `EDCAP_FE/src/router.ts`, `EDCAP_FE/src/router.tsx` | do-not-use by default | Current active routing is in `App.tsx` with `Routes`; these files appear legacy/unwired unless proven otherwise. |
| `EDCAP_FE/src/services/crud/*`, `EDCAP_FE/src/services/global/*` | do-not-use by default | Existing Organization/Customer pages use current hooks/API patterns instead of legacy/global CRUD service. |

## Missing Files

| missing path | required? | related AC | note |
|---|---:|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` | Yes | AC-TEAM-1..16 | Exposes Team APIs. |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/TeamDtos.java` | Yes | AC-TEAM-1..16,18 | Request/response DTOs and page/detail/member DTOs. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/TeamService.java` | Yes | AC-TEAM-1..16 | Business rules, transactions, authorization. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TeamRepositoryPort.java` | Yes | AC-TEAM-2..16 | Persistence port. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/TeamRepositoryAdapter.java` | Yes | AC-TEAM-2..16 | Persistence adapter. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/TeamMapper.java` | Yes | AC-TEAM-2..16 | SQL mapper. |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Team.java` | Yes | AC-TEAM-2..9 | Team domain model. |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/TeamMember.java` | Yes | AC-TEAM-10..16 | Team membership domain model. |
| `EDCAP_BE/src/main/resources/db/migration/V113__team_management.sql` | Yes | AC-TEAM-5,9,13,16,18,20 | Candidate migration name; confirm latest version first. |
| `EDCAP_FE/src/pages/TeamPage.tsx` | Yes | AC-TEAM-1..18 | Main UI. |
| `EDCAP_FE/src/__ tests __/team/TeamPage.test.tsx` | Yes for test phase | AC-TEAM-1..18 | Candidate FE component test path. |
| `EDCAP_FE/src/__ tests __/team/team-api.test.ts` | Yes for test phase | AC-TEAM-1..18 | Candidate FE API helper test path. |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/TeamServiceTest.java` | Yes for test phase | AC-TEAM-1..16 | Candidate BE service test. |
| `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/TeamControllerIntegrationTest.java` | Yes for test phase | AC-TEAM-1..16 | Candidate BE API/security test. |
| `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/infrastructure/persistence/migration/TeamMigrationIntegrationTest.java` | Yes for test phase | AC-TEAM-5,13 | Candidate migration/constraint test. |
