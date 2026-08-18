# Source Inventory

**Ticket ID**: ORGANIZATION    
**Create date**: 2026-06-10    
**Author**:  nk_trung     
**Update date**: 2026-06-10  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket spec | `docs/changes/ORGANIZATION/spec-pack.md` | Markdown | PM / Tech Lead | read | AC-ORGANIZATION-1..13, API, DB, validation, i18n, security decisions |
| Ticket context | `docs/changes/ORGANIZATION/context.md` | Markdown | PM / Tech Lead | read | Phase 2 source/context decisions and existing/non-existing method lists |
| Ticket rules | `docs/changes/ORGANIZATION/ticket-rules.md` | Markdown | PM / Tech Lead | read | Ticket-specific do/don't and stop/ask conditions |
| Architecture | `docs/architecture/overview.md` | Markdown | Architect | read | Hexagonal BE, FE architecture, DB/Flyway overview |
| Architecture | `docs/architecture/fe-be-contract-map.md` | Markdown | Architect / Tech Lead | read | Current FE/BE contracts and known AdminController 403 mismatch |
| Architecture | `docs/architecture/route-api-map.md` | Markdown | Architect / Tech Lead | read | Current route/API map; no Organization route/API yet |
| Architecture | `docs/architecture/repository-db-map.md` | Markdown | Architect / BE Lead | read | Existing repository/mapper/DB mapping; no Organization repository yet |
| Architecture | `docs/architecture/service-layer-map.md` | Markdown | Architect / BE Lead | read | Current use case/service style |
| Architecture | `docs/architecture/test-map.md` | Markdown | QA / Tech Lead | read | Existing test gap and known weak FE tests |
| Standards | `docs/standards/database.md` | Markdown | DBA / Tech Lead | read | Flyway rule: new versioned migration, no ad-hoc SQL |
| Standards | `docs/standards/error-handling.md` | Markdown | BE Lead | read | Standard error envelope; known AdminController violation |
| Standards | `docs/standards/security.md` | Markdown | Security / Tech Lead | read | Auth/authz and no sensitive logs |
| Standards | `docs/standards/testing.md` | Markdown | QA / Tech Lead | read | Test expectations and review focus |
| Template | `docs/standards/templates/_ticket-template/source-availability.md` | Markdown | Tech Lead | read | Phase 3 output structure |
| Template | `docs/standards/templates/_ticket-template/source-inventory.md` | Markdown | Tech Lead | read | Phase 3 output structure |
| Template | `docs/standards/templates/_ticket-template/impact-analysis.md` | Markdown | Tech Lead | read | Phase 3 output structure |
| Template | `docs/standards/templates/_ticket-template/impl-plan.md` | Markdown | Tech Lead | read | Phase 3 output structure |
| BE controller reference | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Java | BE Lead | read | Existing REST controller and current admin role check; do not copy its bad error-body pattern |
| BE controller reference | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | Java | BE Lead | read | `/api/v1/me` controller pattern |
| BE DTO reference | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | Java | BE Lead | read | Existing DTO wrapper class with nested records |
| BE security | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Java | BE Lead / Security | read | `/api/**` authenticated by default; no Organization role matcher yet |
| BE current user | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentAppUserResolver.java` | Java | BE Lead | read | Existing resolver for `@CurrentUser AppUser` |
| BE domain user | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Java | BE Lead | read | `AppUser.Role` values include `ADMIN` |
| BE error response | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Java record | BE Lead | read | Standard error shape with `timestamp`, `status`, `error`, `message`, `traceId` |
| BE error handler | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Java | BE Lead | read | Existing exception mapping; lacks specific authorization handler |
| BE domain exception | `EDCAP_BE/src/main/java/com/sdd/platform/domain/exception/DomainException.java` | Java | BE Lead | read | Candidate for business-rule validation errors if message is i18n key |
| BE not found exception | `EDCAP_BE/src/main/java/com/sdd/platform/domain/exception/NotFoundException.java` | Java | BE Lead | read | Candidate for Organization not-found |
| BE application exception | `EDCAP_BE/src/main/java/com/sdd/platform/application/exception/ApplicationException.java` | Java | BE Lead | read | Currently maps to 409; use carefully for version conflict only |
| BE repository reference | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/*RepositoryPort.java` | Java interface | BE Lead | read | Existing output-port pattern |
| BE adapter reference | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/*RepositoryAdapter.java` | Java | BE Lead | read | Existing MyBatis adapter pattern |
| BE mapper reference | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/*Mapper.java` | Java interface | BE Lead | read | Existing mapper annotation pattern |
| BE mapper XML reference | `EDCAP_BE/src/main/resources/mapper/*Mapper.xml` | XML | BE Lead | read | Existing SQL mapping pattern |
| BE DB schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | SQL | DBA / BE Lead | read | Existing `tbl_dim_organization` definition and seed data |
| BE architecture test | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | Java test | QA / BE Lead | read | Enforces layer/package rules |
| BE unit tests | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/ArtifactNormalizerTest.java` | Java test | QA / BE Lead | read | Domain unit-test style reference |
| BE unit tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` | Java test | QA / BE Lead | read | Application use-case test style reference |
| FE app routes | `EDCAP_FE/src/App.tsx` | TSX | FE Lead | read | Current `/:lang/login`, `/:lang/admin`, `RequireAuth`, `HomeRedirect` |
| FE layout | `EDCAP_FE/src/components/Layout.tsx` | TSX | FE Lead | read | Sidebar/nav language/admin nav pattern |
| FE page reference | `EDCAP_FE/src/pages/AdminPage.tsx` | TSX | FE Lead | read | TanStack Query + mutation + `useTranslation("locale")` pattern |
| FE API selected | `EDCAP_FE/src/lib/api.ts` | TypeScript | FE Lead | read | Selected typed endpoint helper for Organization per ticket rule |
| FE API legacy | `EDCAP_FE/src/utils/api.ts` | TypeScript | FE Lead | read | Legacy/general API wrapper; translates `res.message`, but not selected for new Organization endpoint helpers |
| FE auth | `EDCAP_FE/src/hooks/useAuth.ts` | TypeScript | FE Lead | read | `useAuth()`, `loginWithGoogle()`, `logout()`; logout redirects to `/#/{lang}/login` |
| FE i18n | `EDCAP_FE/src/i18n.ts` | TypeScript | FE Lead | read | Loads `/locales/{language}/{namespace}.json`, supported `en`, `vi`, `ja` |
| FE UI components | `EDCAP_FE/src/components/ui/` | TSX/TS | FE Lead | read | Reusable `Button`, `Card`, `Badge`, `table`, `data-table`, form/search/pagination/server-table components |
| FE locale | `EDCAP_FE/public/locales/en/locale.json` | JSON | FE Lead | read | Existing Layout/Admin/Login keys; no Organization keys |
| FE locale | `EDCAP_FE/public/locales/ja/locale.json` | JSON | FE Lead | read | Existing Layout/Admin/Login keys; no Organization keys |
| FE locale | `EDCAP_FE/public/locales/vi/locale.json` | JSON | FE Lead | read | Existing Layout/Admin/Login keys; no Organization keys |
| FE E2E | `EDCAP_FE/e2e_tests/tests/smoke.spec.ts` | Playwright test | QA / FE Lead | read | Weak smoke test only |
| FE unit placeholder | `EDCAP_FE/src/__ tests __/README.md` | Markdown | QA / FE Lead | read | Placeholder only: `UT FE` |

## Important Files

### Backend important existing files

| file | current role | Organization relevance |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Configures OAuth2/session and authenticates `/api/**` | Organization endpoints will be authenticated by default; ADMIN role still must be enforced in controller/service/security layer |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentAppUserResolver.java` | Resolves local `AppUser` for `@CurrentUser` | Recommended way for Organization controller to know caller role/actor |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | User domain model and role enum | Source of `AppUser.Role.ADMIN` |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Standard error response record | Organization error responses should use this shape |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Maps exceptions to HTTP responses | May need extension or careful exception selection for 403 and 409 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | REST controller reference | Use controller structure, but do not copy `Map.of("error", "ADMIN role required")` |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | Existing DTO nested records | Candidate place/pattern for Organization DTOs, or create dedicated DTO class if project standard allows |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Current schema source | Existing `tbl_dim_organization` table; must not be edited |
| `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | ArchUnit layer guard | New Organization classes must pass package/layer rules |

### Frontend important existing files

| file | current role | Organization relevance |
|---|---|---|
| `EDCAP_FE/src/App.tsx` | React Router routes and `RequireAuth` | Add Organization route and ADMIN guard later |
| `EDCAP_FE/src/components/Layout.tsx` | Sidebar/nav + language switch | Add Organization nav item later; adminOnly pattern already exists |
| `EDCAP_FE/src/hooks/useAuth.ts` | Auth query and logout flow | Non-ADMIN Organization screen access must call `logout()` |
| `EDCAP_FE/src/lib/api.ts` | Fetch wrapper + typed endpoint helpers | New Organization endpoint helpers must be added here per ticket rule |
| `EDCAP_FE/src/pages/AdminPage.tsx` | Existing page using TanStack Query and i18n | Best current reference for page-level server state and i18n |
| `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Translation resources | Add `Pages.Organization` and related keys later |
| `EDCAP_FE/src/components/ui/button.tsx` | Button component | Use for actions if suitable |
| `EDCAP_FE/src/components/ui/card.tsx` | Card components | Use for page/form containers if suitable |
| `EDCAP_FE/src/components/ui/badge.tsx` | Badge component | Use for status display if suitable |
| `EDCAP_FE/src/components/ui/table.tsx` / `data-table` / `server-table` | Table components | Candidate for Organization list; verify component fit during implementation |

### Existing DB inventory

| table/type | current definition | Organization relevance |
|---|---|---|
| `record_status` | ENUM includes `ACTIVE`, `INACTIVE`, `ARCHIVED`, `DELETED` | Use `ACTIVE` and `DELETED` for Organization; `All` is filter only |
| `tbl_dim_organization` | `organization_id UUID PK`, `name_masked VARCHAR(255) NOT NULL`, `status record_status NOT NULL DEFAULT 'ACTIVE'`, timestamps/actors | Existing target table; add missing columns later |
| `tbl_dim_customer` | References `tbl_dim_organization(organization_id)` | Indirect dependency; Organization soft delete cascades to this table |
| trigger `trg_dim_organization_updated_at` | BEFORE UPDATE sets `updated_at` | Organization updates should account for existing timestamp trigger |
| V4 seed data | Inserts into `tbl_dim_organization (name_masked, status, created_by, updated_by)` | Migration must backfill `organization_code` for existing seed rows |

## Generated / Excluded Files

| path/pattern | status | reason |
|---|---|---|
| `EDCAP_FE/node_modules/` | excluded | Generated dependency directory; not read for ticket logic |
| `EDCAP_FE/coverage/` | excluded | Generated/stale test coverage output |
| Build output directories | excluded | Not source of truth |
| Runtime OpenAPI output | not generated in Phase 3 | No running BE; source/spec used instead |
| New Organization source files | not generated in Phase 3 | Phase 3 is analysis/planning only |
| New Organization FE tests | not generated in Phase 3 | User decided FE test implementation is deferred |

## Missing Files

### Missing Organization-specific backend files/classes

These are not present in the current source and must not be referenced as existing:

| missing item | expected later role | note |
|---|---|---|
| `OrganizationController` | REST API handler under `web.rest` | Candidate new file in implementation phase |
| `OrganizationService` / use case | Application business rules | Candidate new file under `application.usecase` |
| `OrganizationRepositoryPort` | Application output port | Candidate new file under `application.port.out.persistence` |
| `OrganizationRepositoryAdapter` | Infrastructure persistence adapter | Candidate new file under `infrastructure.persistence.adapter` |
| `OrganizationMapper` | MyBatis mapper interface | Candidate new file under `infrastructure.persistence.mapper` |
| `OrganizationMapper.xml` | MyBatis SQL mapping | Candidate new file under `src/main/resources/mapper` |
| `Organization` domain model | Domain representation | Candidate new file under `domain.model` |
| Organization request/response DTOs | API contract | Candidate records/classes in `web.dto` or dedicated package |
| Authorization exception/handler | Standard 403 error handling | Candidate if existing exception mapping is insufficient |

### Missing Organization-specific frontend files/components

| missing item | expected later role | note |
|---|---|---|
| Organization route | `/:lang/organizations` or agreed route path | Candidate update in `App.tsx` |
| Organization nav item | Sidebar link | Candidate update in `Layout.tsx` |
| `OrganizationPage` / list page | List/search/filter and actions | Candidate new file under `src/pages` |
| Organization form/detail components | Create/edit/detail/read-only deleted state | Candidate new files under `src/pages` or `src/components` |
| Organization API helpers/types | Typed endpoint helpers | Candidate update in `src/lib/api.ts` |
| `Pages.Organization` locale keys | i18n UI/error messages | Candidate update in all three locale JSON files |
| Organization tests | FE automated tests | Deferred unless decision changes |

### Missing DB / test support

| missing item | impact | note |
|---|---|---|
| Flyway migration after V4 | Required DB change | Candidate file like `V5__alter_tbl_dim_organization_for_management.sql`; exact version depends on current migration chain |
| DB test configuration | Needed for integration/migration tests | No `application-test.yml` or Testcontainers setup found |
| BE controller/API tests for Organization | Needed for AC verification | Add later in implementation/test phase |
| Contract tests | Needed to lock FE/BE API shape | No current contract test framework found |

