# Source Inventory

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung  
**Update date**: 2026-06-10  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket spec | `docs/changes/CUSTOMER/spec-pack.md` | markdown | Ticket | read | AC/business/API/DB/i18n source of truth |
| Ticket context | `docs/changes/CUSTOMER/context.md` | markdown | Ticket | read | Phase 2 source context and rules |
| Ticket rules | `docs/changes/CUSTOMER/ticket-rules.md` | markdown | Ticket | read | Ticket-specific implementation guardrails |
| Template | `docs/standards/templates/_ticket-template/source-availability.md` | markdown | Standards | read | Source availability structure |
| Template | `docs/standards/templates/_ticket-template/source-inventory.md` | markdown | Standards | read | Source inventory structure |
| Template | `docs/standards/templates/_ticket-template/impact-analysis.md` | markdown | Standards | read | Impact analysis structure |
| Template | `docs/standards/templates/_ticket-template/impl-plan.md` | markdown | Standards | read | Implementation plan structure |
| Architecture | `docs/architecture/fe-be-contract-map.md` | markdown | Architecture | read | Confirms `tbl_dim_customer` table name decision and implementation gap |
| Architecture | `docs/architecture/repository-db-map.md` | markdown | Architecture | read | Confirms many V4-only dimension tables have no Java entity yet |
| DB migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | SQL | DB | read | Existing Customer/Organization/Project schema |
| BE app | `EDCAP_BE/src/main/java/com/sdd/platform/SddPlatformApplication.java` | Java | BE | read | Spring Boot app root |
| BE security | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Java | BE | read | Auth/session/global API security pattern |
| BE exception | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Java record | BE | read | Error fields: timestamp/status/error/message/traceId |
| BE exception | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Java | BE | read | Current exception-to-HTTP mapping |
| BE admin reference | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Java | BE | read | Admin endpoint pattern; do not copy ad-hoc error body |
| BE current user | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentUser.java` | Java | BE | read | Controller injection annotation pattern |
| BE current user resolver | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentAppUserResolver.java` | Java | BE | read | Local `AppUser` resolver pattern |
| BE user model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Java | BE | read | Role enum includes `ADMIN` |
| BE persistence ref | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ProjectRepositoryPort.java` | Java | BE | read | Existing repository port pattern |
| BE persistence ref | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/ProjectRepositoryAdapter.java` | Java | BE | read | Existing repository adapter pattern |
| BE persistence ref | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/ProjectMapper.java` | Java | BE | read | Existing mapper pattern |
| FE app/router | `EDCAP_FE/src/App.tsx`, `EDCAP_FE/src/router.tsx`, `EDCAP_FE/src/router.ts`, `EDCAP_FE/src/router-links.ts` | TS/TSX | FE | read | Route/navigation pattern source |
| FE auth | `EDCAP_FE/src/hooks/useAuth.ts` | TS | FE | read | Auth/session source |
| FE layout | `EDCAP_FE/src/components/Layout.tsx` | TSX | FE | read | Layout/menu/sidebar candidate |
| FE admin ref | `EDCAP_FE/src/pages/AdminPage.tsx` | TSX | FE | read | Existing admin page reference |
| FE login ref | `EDCAP_FE/src/pages/LoginPage.tsx` | TSX | FE | read | Login route/redirect reference |
| FE API | `EDCAP_FE/src/lib/api.ts` | TS | FE | read | Current API helper has get/post/put/del; no patch |
| FE legacy API | `EDCAP_FE/src/utils/api.ts` | TS | FE | read | Older i18n-aware helper; avoid mixing without decision |
| FE UI components | `EDCAP_FE/src/components/ui/data-table`, `form`, `search`, `pagination`, `button`, `table` | TSX/LESS | FE | read | Candidate common components for Customer UI |
| FE locales | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | JSON | FE | partial | Target for Customer keys; preserve UTF-8/BOM |
| FE tests | `EDCAP_FE/src/__ tests __/README.md` | markdown | FE | partial | Automated FE tests currently weak/deferred |

## Important Files

| path | current status | relevance | use / avoid |
|---|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | exists | Shows admin-only endpoint with `@CurrentUser AppUser caller` | Use role-check intent, but do not copy `Map.of("error", ...)` error body |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | exists | Central exception handling and status mapping | Extend/align for CUSTOMER-specific `403`, `409`, and message key behavior |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | exists | Current error DTO | Ticket keeps `message` as the translated key |
| `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | exists | Authenticated API security; CORS allows PATCH | Keep global auth; add endpoint-level ADMIN enforcement |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentUser.java` | exists | Method argument resolver annotation | Use for current user/audit fields if implementation follows current controller style |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | exists | Role enum | Use `AppUser.Role.ADMIN` for authorization logic |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | exists | Current schema and seed | Do not edit; create new migration |

## Generated / Excluded Files

| path/pattern | status | reason |
|---|---|---|
| Build output directories | excluded | Not source of truth for implementation planning |
| `node_modules`, Gradle build output | excluded | Generated/dependency content |
| Old migration `V4__init_shema_v2.sql` | read-only for this ticket | Must not edit during implementation; create a new Flyway migration |
| Connector integration source | excluded from Customer impact | No Customer AC changes GitHub/Jira/CircleCI ingestion/webhooks |
| Metrics/calculation source | excluded from Customer impact | Customer CRUD does not change metric calculations |

## Missing Files

| missing source | expected future location/pattern | reason |
|---|---|---|
| Customer controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` or equivalent | New REST API required |
| Customer use case/service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/...` | Business rule orchestration required |
| Customer domain model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Customer.java` or equivalent | Domain model not found |
| Customer repository port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/CustomerRepositoryPort.java` | Persistence abstraction required |
| Customer repository adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CustomerRepositoryAdapter.java` | DB implementation required |
| Customer mapper | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/CustomerMapper.java` | SQL row mapping required |
| Customer request/response DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/...` or `Dtos.java` | API contract required |
| Customer migration | `EDCAP_BE/src/main/resources/db/migration/V*__*.sql` | Add `deleted_at`, `deleted_by`, `version`; replace unique strategy |
| Customer FE route/page | `EDCAP_FE/src/pages/...` and router files | Customer UI required |
| Customer FE API/types | `EDCAP_FE/src/lib/api.ts` endpoints or dedicated service file | FE typed API calls required |
| Customer locale keys | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | i18n required |
| Customer tests | BE/FE test folders | Verification required in later phase; FE automated implementation currently deferred |
