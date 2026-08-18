# Context

**Ticket ID**: ORGANIZATION        
**Create date**: 2026-06-10        
**Author**: nk_trung             
**Update date**: 2026-06-10 

## Screen / API / Batch / Related Job

| category | related item | current source status | Phase 2 decision / note |
|---|---|---|---|
| FE screen | Organization Management list | Not implemented | Planned by `spec-pack.md`. Default list shows `ACTIVE` Organizations only. |
| FE screen | Organization create | Not implemented | Planned. Required fields: `organizationCode`, `organizationName`; `description` optional max 500. |
| FE screen | Organization detail | Not implemented | Planned. Deleted Organization can be viewed read-only when opened from Deleted filter. |
| FE screen | Organization edit | Not implemented | Planned. Must include numeric `version`; soft-deleted records are not editable. |
| FE screen | Soft-delete confirmation dialog | Not implemented | Planned. Must call soft-delete API only after user confirmation. |
| FE route | `/:lang/...` Organization route | Not implemented | Existing `App.tsx` supports `/:lang/login`, `/:lang/admin`; Organization route must be added in later implementation phase. |
| BE API | `GET /api/v1/organizations` | Not implemented | Candidate/fixed by spec for list/search/status filter. |
| BE API | `GET /api/v1/organizations/{organizationId}` | Not implemented | Candidate/fixed by spec for detail. |
| BE API | `POST /api/v1/organizations` | Not implemented | Candidate/fixed by spec for create. |
| BE API | `PUT /api/v1/organizations/{organizationId}` | Not implemented | Candidate/fixed by spec for update with `version`. |
| BE API | `PATCH /api/v1/organizations/{organizationId}/delete` | Not implemented | Human decision: use PATCH because deletion is logical/soft delete. |
| Batch / Job | Organization batch/job | Not found | No Organization batch/job is in scope. Do not add batch/job in this ticket. |
| External IF | GitHub/Jira/CircleCI connectors | Existing but unrelated | Out of scope. Do not touch connector collection flows. |
| Dependent domain | Customer / Project / Repository | Tables exist and are affected by Organization soft delete | Organization ticket cascades soft delete to the child tree; no restore flow is included. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| FE authenticated route pattern | `EDCAP_FE/src/App.tsx` -> `RequireAuth` | Use route-level guard pattern and current-language redirect style. Organization must add ADMIN-specific behavior on top: non-ADMIN logout + redirect to `/:lang/login`. |
| FE auth/user source | `EDCAP_FE/src/hooks/useAuth.ts` -> `useAuth()`, `logout()` | Use `/api/v1/me` through `endpoints.me()` to determine authenticated user and role. Reuse `logout()` behavior for non-ADMIN Organization screen access. |
| FE API helper pattern | `EDCAP_FE/src/lib/api.ts` -> `api`, `endpoints`, `ApiError` | New Organization endpoints should be added as typed endpoint helpers; use `credentials: "include"`; do not call `fetch` directly from page/components. |
| FE page/query/mutation style | `EDCAP_FE/src/pages/AdminPage.tsx` | Shows React Query `useQuery`, `useMutation`, invalidation, and `useTranslation("locale")`; copy style only, not connector-specific role bug or raw error display behavior. |
| FE i18n usage | `EDCAP_FE/src/pages/AdminPage.tsx`, `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Use `useTranslation("locale")` and add Organization keys to all three locale files with UTF-8 encoding. |
| FE base table component | `EDCAP_FE/src/components/ui/table.tsx` | Small composable table primitives; safe for simple Organization list if custom table is enough. |
| FE existing server table | `EDCAP_FE/src/components/ui/server-table/index.tsx` | Can be referenced for server-side sorting/filter UI, but verify fit before use; it depends on existing `CDataTable`, Ant Design dropdown/date picker, and internal data-table interfaces. |
| BE REST controller style | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java`, `HealthController.java` | Use `@RestController`, `/api/v1` base route, DTO return types. Controllers must call application services, not infrastructure. |
| BE admin role reference | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Demonstrates `@CurrentUser AppUser caller` and `AppUser.Role.ADMIN` check, but do not copy its current ad-hoc `Map.of("error", ...)` 403 handling. |
| BE DTO style | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | Existing DTOs are Java records with static `from(...)`. Organization may follow this style or split DTOs if size grows. |
| BE exception envelope | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java`, `GlobalExceptionHandler.java` | Use standard `ErrorResponse(timestamp,status,error,message,traceId)`. For Organization, `message` should carry the i18n key unless/until `messageKey` is formally added. |
| BE hexagonal layering test | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | New Organization classes must keep web -> application -> domain and infrastructure -> ports boundaries green. |
| DB existing table/migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | `tbl_dim_organization` already exists. Do not rename/recreate; later migration only adds/updates required columns/indexes. |
| DB updated_at trigger | `V4__init_shema_v2.sql` -> `trg_dim_organization_updated_at` | Existing trigger updates `updated_at` before update. Future soft-delete/update logic must account for it. |

## Allowed common components
| component | path | usage note |
|---|---|---|
| `Layout` | `EDCAP_FE/src/components/Layout.tsx` | Existing authenticated layout. Add navigation/menu support only if required by Organization route implementation. |
| `Button` | `EDCAP_FE/src/components/ui/button.tsx` | Tailwind/Radix-style button used by `AdminPage`; suitable for new page buttons. |
| `CButton` | `EDCAP_FE/src/components/ui/button/index.tsx` | Existing custom button used by internal components such as `CServerTable`; use only when following the `C*` component family. |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | `EDCAP_FE/src/components/ui/table.tsx` | Safe simple table primitives for Organization list. |
| `CServerTable` | `EDCAP_FE/src/components/ui/server-table/index.tsx` | Allowed if Organization list needs built-in server sort/filter UI and implementation confirms API param compatibility. |
| `CSearch` | `EDCAP_FE/src/components/ui/search/index.tsx` | Allowed for keyword search; it trims and debounces input. Ensure param maps to Organization `keyword`/search contract. |
| `CForm` | `EDCAP_FE/src/components/ui/form/index.tsx` | Allowed for form scaffolding if its validation model fits Organization. Confirm field-level error mapping before use. |
| `Badge` | `EDCAP_FE/src/components/ui/badge.tsx` | Allowed for `ACTIVE` / `DELETED` display. |
| `Card` components | `EDCAP_FE/src/components/ui/card.tsx` | Allowed for detail/create/edit layout, following `AdminPage` style. |
| `useAuth`, `logout` | `EDCAP_FE/src/hooks/useAuth.ts` | Required reference for authenticated user and non-ADMIN logout behavior. |
| `api`, `endpoints`, `ApiError` | `EDCAP_FE/src/lib/api.ts` | Preferred API helper for Organization. Add typed endpoint helpers here in later implementation. |
| `formatDateTime` | `EDCAP_FE/src/lib/utils.ts` | Allowed for timestamps if it handles null safely or caller guards null values. |

## Forbidden common components
| component | reason |
|---|---|
| Direct `fetch` inside Organization page/component | `.claude/rules/20-architecture.md` says all API calls must go through `lib/api.ts`; direct fetch bypasses common credentials/error behavior. |
| `EDCAP_FE/src/utils/api.ts` for new Organization endpoint helpers | This legacy wrapper expects `IResponses<T>` envelope, bearer token localStorage, and `LINK_API`; current React Query/Auth path uses `src/lib/api.ts` and session cookies. Use only if the project lead explicitly decides to align Organization to that legacy stack. |
| `routerLinks()` generated API map | `EDCAP_FE/src/router-links.ts` currently has empty `array` and `apis` maps; Organization routes/APIs must not rely on undefined generated entries. |
| New Ant Design `Table`/`Form` introduction | `docs/standards/frontend.md` says Ant Design is for existing usages only; do not introduce new AntD Table/Form for Organization unless explicitly approved. |
| `AdminController` ad-hoc error body pattern | Current `Map.of("error", "ADMIN role required")` is documented as a known contract violation. Organization must return HTTP 403 with standard error shape. |
| Physical SQL delete for Organization | Spec forbids physical delete. Use update to `status='DELETED'`, `deleted_at`, `deleted_by`, `updated_by`, and version increment. |
| Customer/Project/Repository cascade logic | In scope for this release. Organization soft delete must cascade to the child tree; restore is out of scope. |

## List of methods that actually exist
| method/class | path | usage |
|---|---|---|
| `endpoints.me()` | `EDCAP_FE/src/lib/api.ts` | Calls `GET /api/v1/me`; source of current user and role through `useAuth()`. |
| `endpoints.health()` | `EDCAP_FE/src/lib/api.ts` | Calls `GET /api/v1/health`; not Organization-related. |
| `endpoints.availableConnectors()` | `EDCAP_FE/src/lib/api.ts` | Connector admin reference only. |
| `endpoints.runConnector(name, projectId)` | `EDCAP_FE/src/lib/api.ts` | Connector admin reference only; do not use for Organization. |
| `endpoints.connectorRuns(name, limit)` | `EDCAP_FE/src/lib/api.ts` | Connector admin reference only. |
| `api.get<T>(path)` | `EDCAP_FE/src/lib/api.ts` | Preferred GET helper for new Organization endpoint helper. |
| `api.post<T>(path, body)` | `EDCAP_FE/src/lib/api.ts` | Preferred POST helper. |
| `api.put<T>(path, body)` | `EDCAP_FE/src/lib/api.ts` | Preferred PUT helper. |
| `api.del<T>(path)` | `EDCAP_FE/src/lib/api.ts` | Existing DELETE helper; Organization soft delete needs PATCH, so add `api.patch` or use `request` extension in later implementation. |
| `useAuth()` | `EDCAP_FE/src/hooks/useAuth.ts` | Provides `{ user, isAuthenticated, isLoading, ... }`. |
| `logout()` | `EDCAP_FE/src/hooks/useAuth.ts` | POSTs `/logout`, clears React Query `me`, redirects to `/#/{lang}/login`. |
| `RequireAuth` | `EDCAP_FE/src/App.tsx` | Local component, not exported; protects current `/admin` route. Organization route may need a new exported/shared guard or local guard. |
| `AdminPage()` | `EDCAP_FE/src/pages/AdminPage.tsx` | Page pattern for React Query + i18n only; not a reusable Organization component. |
| `HealthController.health()` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/HealthController.java` | REST + DTO pattern. |
| `MeController.me(OAuth2User principal)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | REST + application service pattern for current user. |
| `AdminController.connectors()` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Admin endpoint reference; lacks role check on GET. |
| `AdminController.runConnector(String, Long, AppUser)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Shows `@CurrentUser` role check but has known error-shape violation. |
| `AdminController.runHistory(String, int)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Admin history endpoint reference; no Organization use. |
| `CurrentAppUserResolver` / `@CurrentUser` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/` | Existing way to resolve local `AppUser` for role/actor metadata. |
| `AppUserService.upsertFromOAuth(OAuth2User)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AppUserService.java` | Current user bootstrap; first user becomes ADMIN, later users VIEWER. |
| `AppUser.Role` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Existing enum: `VIEWER`, `EDITOR`, `ADMIN`. Organization authorization uses `ADMIN`. |
| `GlobalExceptionHandler.handleNotFound/handleDomain/handleApplication/handleValidation/handleIllegalArg/handleUnknown` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Existing exception-to-HTTP mapping. Organization should integrate with it rather than ad-hoc try/catch. |
| `LayerEnforcementTest` | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | Existing architecture test that future Organization code must satisfy. |
| `trg_dim_organization_updated_at` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing DB trigger for `updated_at` on Organization updates. |

## Forbidden methods / methods that do not exist
| method/API | reason | alternative |
|---|---|---|
| `OrganizationController` | Not found in current BE source. | Add in later implementation phase under `web.rest` after Phase 2. |
| `OrganizationService` / `OrganizationUseCase` | Not found in current BE source. | Add application-layer use case/service later, following hexagonal rules. |
| `OrganizationRepositoryPort` | Not found in current BE source. | Add port under `application.port.out.persistence` later. |
| `OrganizationRepositoryAdapter` | Not found in current BE source. | Add adapter under `infrastructure.persistence.adapter` later. |
| `OrganizationMapper` / `OrganizationMapper.xml` | Not found in current BE source/resources. | Add MyBatis mapper later if repository implementation uses MyBatis. |
| `Organization` domain model/entity | Not found in current BE domain model package. | Add domain model later if needed by use case/repository. |
| `Dtos.OrganizationDto` / request records | Not found in `Dtos.java`. | Add Organization DTOs later; decide nested vs separate DTO files in Phase 3. |
| `endpoints.organizations.*` | Not found in `EDCAP_FE/src/lib/api.ts`. | Add typed endpoint helpers later. |
| `OrganizationPage`, `OrganizationListPage`, `OrganizationFormPage` | Not found in FE source. | Add pages/components later. |
| `/:lang/organizations` route | Not registered in `App.tsx` or `router.tsx`. | Add route later with ADMIN guard. |
| `routerLinks('Organization', 'api')` | `router-links.ts` has empty maps. | Use explicit typed `endpoints` in `lib/api.ts` unless routing generator is implemented. |
| `api.patch` in `EDCAP_FE/src/lib/api.ts` | Not currently implemented. | Add `patch` helper or a dedicated request wrapper extension before calling soft-delete PATCH endpoint. |
| `tbl_dim_organization.organization_code` | Column not present in current V4 table. | Add via new migration; do not rename table. |
| `tbl_dim_organization.description` | Column not present in current V4 table. | Add via new migration. |
| `tbl_dim_organization.deleted_at` / `deleted_by` | Columns not present in current V4 table. | Add via new migration for soft delete metadata. |
| `tbl_dim_organization.version` | Column not present in current V4 table. | Add `BIGINT NOT NULL DEFAULT 0` via migration. |
| `DELETE /api/v1/organizations/{id}` | Spec decision uses PATCH soft delete, not physical/delete verb. | Use `PATCH /api/v1/organizations/{id}/delete` with `version`. |

## DTO / Entity / Table / Migration mapping
| layer | name | path | Note |
|---|---|---|---|
| FE route | Organization route | `EDCAP_FE/src/App.tsx` | Not implemented. Add later under `/:lang/...`; must keep current language and ADMIN logout behavior. |
| FE API helper | Organization endpoint helpers | `EDCAP_FE/src/lib/api.ts` | Not implemented. Add typed list/detail/create/update/soft-delete helpers later. |
| FE types | `Organization`, `OrganizationCreateRequest`, `OrganizationUpdateRequest`, `OrganizationDeleteRequest` | TBD | Not implemented. Must match BE DTO fields from spec. |
| FE locale | `Pages.Organization.*` | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Organization keys not currently present. Add in later implementation with UTF-8. |
| BE controller | Organization REST controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/` | Not implemented. Must not call infrastructure directly. |
| BE request DTO | Create/update/delete request records | TBD / `web.dto` | Not implemented. Create: code/name/description. Update/delete: include `version`. |
| BE response DTO | Organization response/list/detail DTO | TBD / `web.dto` | Must return id/code/name/description/status/audit timestamps/actors/version. |
| BE application service/use case | Organization use case | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/...` | Not implemented. Owns business rules, transactions, duplicate checks, optimistic locking. |
| BE persistence port | Organization repository port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/` | Not implemented. Application depends on port. |
| BE domain model | Organization | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/` | Not implemented. Add if needed for use case/repository. |
| BE adapter | Organization repository adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/` | Not implemented. Implements port using mapper. |
| BE mapper | Organization MyBatis mapper | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/` and `src/main/resources/mapper/` | Not implemented. Keep SQL explicit and safe. |
| DB table | `tbl_dim_organization` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Already exists; do not rename or recreate. Current columns: `organization_id`, `name_masked`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`. |
| DB column | `organization_code` | New migration later | Required `VARCHAR(50)` business code; case-insensitive active-scope unique. Must handle existing seed/backfill. |
| DB column | `name_masked` | Existing V4 column | Maps to `organizationName`; do not rename in this ticket. |
| DB column | `description` | New migration later | Optional `TEXT`; enforce max 500 in FE/BE. |
| DB columns | `deleted_at`, `deleted_by` | New migration later | Required for soft delete metadata and partial unique predicate. |
| DB column | `version` | New migration later | `BIGINT NOT NULL DEFAULT 0`; required for optimistic locking. |
| DB enum | `record_status` | Existing V4 type | Already includes `ACTIVE`, `INACTIVE`, `ARCHIVED`, `DELETED`; Organization uses `ACTIVE` and `DELETED`. |
| DB indexes | `ux_tbl_dim_organization_code_active`, `ux_tbl_dim_organization_name_active` | New migration later | Partial unique indexes on `LOWER(...) WHERE deleted_at IS NULL`. |
| DB trigger | `trg_dim_organization_updated_at` | Existing V4 trigger | Updates `updated_at`; update/delete logic must set actor/version explicitly. |

## formItemNm / SEQNO / Master Data / Code Value Mapping
| display/item | internal value | source | note |
|---|---|---|---|
| Organization Code | `organizationCode` / `organization_code` | `spec-pack.md` 6.2, 12 | Required, max 50, editable, unique among records where `deleted_at IS NULL`. No `formItemNm` source found. |
| Organization Name | `organizationName` / `name_masked` | `spec-pack.md` 3, 6.2, 12 | Required, max 255, maps to existing `name_masked`. Do not rename column. |
| Description | `description` | `spec-pack.md` 6.2, 12 | Optional, max 500. |
| Status filter: All | Query/filter value only | `spec-pack.md` 2.1, 6.2 | UI/search option, not persisted DB value. Includes Active + Deleted. |
| Status: Active | `ACTIVE` | `record_status` enum in V4 | Persisted status for usable records; default for new Organization. |
| Status: Deleted | `DELETED` | `record_status` enum in V4 | Persisted status for soft-deleted records. |
| Version | `version` | `spec-pack.md` 6.2, 12 | Numeric optimistic locking token; create response `0`; update/delete increments once. |
| `formItemNm` | N/A | Source inspection | No Organization-specific `formItemNm` mapping found in spec/source. Do not invent one. |
| `SEQNO` | N/A | Source inspection | No Organization-specific SEQNO/order field found. Do not add one. |
| Master Data table | N/A for this ticket | Source inspection | Status values come from DB enum `record_status`, not a separate master table in this ticket. |
| Code Value | `ACTIVE`, `DELETED` | DB enum + spec | Use constants/enum in application code, not magic strings scattered across logic. |

## Multilingual Note

- FE translation resources are fixed at `EDCAP_FE/public/locales/{en,ja,vi}/locale.json`.
- Current locale files exist and contain `Layout`, `Pages.Login`, and `Pages.Admin`; no `Pages.Organization` section exists yet.
- User-facing Organization labels/messages must be translated through `useTranslation("locale")`; do not hard-code English/Japanese/Vietnamese UI text in components.
- BE currently has `ErrorResponse.message`, not a dedicated `messageKey` field. For this ticket, treat `message` as the i18n key unless the contract is formally changed in a later phase.
- Spec inconsistency to fix before/during implementation: error table/examples use typo/case variants such as `Pages.Organization.Name.Eequired`, `Pages.Organization.conflict.version`, and `common.permission.denied`; the normalized keys should align to section 6.4.1, e.g. `Pages.Organization.Name.Required`, `Pages.Organization.Conflict.Version`, `Component.Permission.Denied`.
- Vietnamese translations in the current spec contain typos such as `Organizationc`; verify copy before adding to locale files.

## Encoding / Mojibake Note

- Existing locale files start with UTF-8 BOM. Preserve valid UTF-8 and avoid mojibake for Japanese and Vietnamese text.
- Do not convert locale files to Shift-JIS or other encodings.
- When editing translations, verify Japanese punctuation and Vietnamese diacritics render correctly.
- Keep JSON valid; do not leave trailing commas or duplicate keys.

## Log / Audit / Operation Note

- Dedicated audit log implementation is explicitly out of scope for this release. Do not add audit-log storage/table integration for Organization in this ticket.
- Use existing request trace behavior: `TraceIdFilter` sets MDC `traceId` and `X-Trace-Id`; `ErrorResponse` includes `traceId`.
- Create/update/soft-delete should be traceable through normal application logs and actor fields (`created_by`, `updated_by`, `deleted_by`) after migration adds missing delete columns.
- Do not log secrets, OAuth attributes beyond what is necessary, raw stack traces to clients, or PII-like data unnecessarily.
- For operation recovery, later migration must include rollback/manual recovery notes because Flyway Community does not provide down migrations.

## Ticket-Specific Constraints

- Phase 2 creates context/rules/skeleton artifacts only. No Organization/Customer implementation in this phase.
- Use existing table `tbl_dim_organization`; do not rename, drop, or recreate it.
- `tbl_dim_customer` is acknowledged as an existing/current-schema table for future Customer work, but Customer implementation is out of scope here.
- FE tests are not implemented now. Only skeleton test artifacts are prepared.
- Organization is ADMIN-only. FE non-ADMIN screen access must logout and redirect to `/:lang/login`; BE direct API access must return HTTP 403.
- Physical delete is forbidden. Soft delete only.
- Optimistic locking with numeric `version` is required in later implementation.
