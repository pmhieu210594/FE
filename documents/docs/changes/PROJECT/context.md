# Context

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16

## Screen / API / Batch / Related Job

| category | related item | current source status | Phase 2 decision / note |
|---|---|---|---|
| FE screen | Project Management list | Not implemented | Planned by `spec-pack.md`. Default list shows active Projects only. |
| FE screen | Project create | Not implemented | Planned. Required: `customerId`, `projectAlias`; `projectType`, `riskLevel`, `teamIds` optional. |
| FE screen | Project detail | Not implemented | Planned. Must show current Team assignments, audit fields, and status. |
| FE screen | Project edit | Not implemented | Planned. No `version` in request contract for this ticket. |
| FE screen | Project soft-delete confirmation dialog | Not implemented | Planned. Must call `PUT /api/v1/projects/{id}/delete` only after user confirmation. |
| FE route | `/:lang/projects` | Not implemented | Existing `App.tsx` already has governance routes such as `/organizations`, `/customers`, `/teams`, `/roles`; Project route should align with that route family in later implementation. |
| BE API | `GET /api/v1/projects` | Not implemented | Candidate/fixed by spec for list with page response. |
| BE API | `GET /api/v1/projects/{projectId}` | Not implemented | Candidate/fixed by spec for detail. |
| BE API | `POST /api/v1/projects` | Not implemented | Candidate/fixed by spec for create. |
| BE API | `PUT /api/v1/projects/{projectId}` | Not implemented | Candidate/fixed by spec for update without optimistic-lock `version`. |
| BE API | `PUT /api/v1/projects/{projectId}/delete` | Not implemented | Human-confirmed Project-specific soft-delete route. |
| Batch / Job | Project batch/job | Not found | No Project batch/job is in scope. Do not add batch/job in this ticket. |
| External IF | GitHub/Jira/CircleCI connectors | Existing but unrelated | Out of scope. Do not touch connector collection flows. |
| Dependent domain | Customer / Team / Role | Tables and implemented modules exist | Project depends on Customer selection, Team assignment, and role-based authorization context. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| FE authenticated admin route pattern | `EDCAP_FE/src/App.tsx` -> `RequireAdmin`, `ForceLogoutAndRedirect` | Use current route-guard and logout redirect style. Project route should align with governance pages. |
| FE auth/user source | `EDCAP_FE/src/hooks/useAuth.ts` -> `useAuth()`, `logout()` | Use current authenticated-user source and logout behavior. |
| FE API helper pattern | `EDCAP_FE/src/lib/api.ts` -> `api`, `endpoints`, `ApiError` | New Project endpoints should be added as typed endpoint helpers. Do not call `fetch` directly from page/components. |
| FE governance page pattern | `EDCAP_FE/src/pages/OrganizationPage.tsx`, `CustomerPage.tsx`, `TeamPage.tsx` | Use as the nearest governance implementation examples instead of older admin connector pages where possible. |
| FE query/mutation pattern | `EDCAP_FE/src/pages/AdminPage.tsx` | Shows React Query invalidation/loading/error handling and `useTranslation("locale")` use. Copy style, not connector-specific behavior. |
| FE i18n usage | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Use `useTranslation("locale")`; add Project keys consistently in all three locale files later. |
| FE base table/search/form pattern | `EDCAP_FE/src/components/ui/table.tsx`, `server-table`, `search`, `form` | Reuse common table/search/form primitives if they fit the Project contract. |
| BE REST controller style | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java`, `CustomerController.java`, `TeamController.java` | Use `@RestController`, `/api/v1` routes, request/response records, and thin controllers that call application services. |
| BE DTO style | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/OrganizationDtos.java`, `CustomerDtos.java`, `TeamDtos.java` | Use Java records with `from(...)` mapping methods and page DTO shape `items/page/size/totalElements/totalPages`. |
| BE role/actor pattern | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentUser`, `CurrentAppUserResolver` | Use `@CurrentUser AppUser caller` for actor and authorization context. |
| BE exception envelope | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java`, `GlobalExceptionHandler.java` | Use standard `ErrorResponse(timestamp,status,error,message,traceId)`. |
| BE mapper/query pattern | `EDCAP_BE/src/main/resources/mapper/TeamMapper.xml`, `OrganizationMapper.xml`, `CustomerMapper.xml` | Use explicit MyBatis SQL, active/deleted filters, and controlled update/soft-delete logic. |
| DB Project schema source | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`, `V120__project_management.sql` | Use existing `tbl_dim_project` and `tbl_project_team`; do not rename/recreate them. |
| DB Team schema source | `EDCAP_BE/src/main/resources/db/migration/V140__team_management.sql` | Confirms Team module dropped `project_id` from `tbl_dim_team`, reinforcing Project-Team many-to-many via bridge table. |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `Layout` | `EDCAP_FE/src/components/Layout.tsx` | Existing authenticated layout. Add Project nav/menu support only if required by later implementation. |
| `Button` | `EDCAP_FE/src/components/ui/button.tsx` | Safe for Project buttons if using the newer UI primitives. |
| `CButton` | `EDCAP_FE/src/components/ui/button/index.tsx` | Allowed only when following the `C*` component family already used by governance pages. |
| `Table` primitives | `EDCAP_FE/src/components/ui/table.tsx` | Safe for a simple Project list/detail rendering. |
| `CServerTable` | `EDCAP_FE/src/components/ui/server-table/index.tsx` | Allowed if Project list needs server-side paging/filter UI and the API params fit. |
| `CSearch` | `EDCAP_FE/src/components/ui/search/index.tsx` | Allowed for keyword or filter search if query params match Project API contract. |
| `CForm` | `EDCAP_FE/src/components/ui/form/index.tsx` | Allowed if its validation model fits Project fields and error mapping. |
| `Badge` | `EDCAP_FE/src/components/ui/badge.tsx` | Allowed for `ACTIVE` / `DELETED` / risk/status display. |
| `Card` components | `EDCAP_FE/src/components/ui/card.tsx` | Allowed for detail/create/edit layout. |
| `useAuth`, `logout` | `EDCAP_FE/src/hooks/useAuth.ts` | Required reference for authenticated user and redirect behavior. |
| `api`, `endpoints`, `ApiError` | `EDCAP_FE/src/lib/api.ts` | Preferred API helper for new Project calls. |
| `formatDateTime` | `EDCAP_FE/src/lib/utils.ts` | Allowed for created/updated timestamps if null-safety is preserved. |

## Forbidden common components

| component | reason |
|---|---|
| Direct `fetch` inside Project page/component | `.claude/rules/20-architecture.md` says API access must go through `lib/api.ts`; direct fetch bypasses shared credentials/error behavior. |
| `EDCAP_FE/src/utils/api.ts` for new Project endpoint helpers | This legacy wrapper uses a different auth/envelope expectation; current governance pages use `src/lib/api.ts`. |
| `routerLinks()` generated API map | Current route/api maps are incomplete/empty in older helper paths; Project should use explicit typed `endpoints` in `lib/api.ts`. |
| New Ant Design `Table`/`Form` introduction | Avoid introducing new UI stack if existing governance/common components already fit. |
| `AdminController` ad-hoc error body pattern | Known contract violation in older admin flows; Project must use standard error shape. |
| Physical SQL delete for Project | Spec forbids physical delete. Use soft delete only. |
| Governance optimistic-lock `version` copy-paste | This ticket explicitly does **not** use `version` in the Project contract. |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `endpoints.authMe()` / `endpoints.me()` | `EDCAP_FE/src/lib/api.ts` | Current authenticated user source. `useAuth()` uses `authMe()`. |
| `api.get<T>(path)` | `EDCAP_FE/src/lib/api.ts` | Preferred GET helper for future Project endpoint helper. |
| `api.post<T>(path, body)` | `EDCAP_FE/src/lib/api.ts` | Preferred POST helper. |
| `api.put<T>(path, body)` | `EDCAP_FE/src/lib/api.ts` | Preferred PUT helper. This is important because Project delete uses `PUT`, not `PATCH`. |
| `api.patch<T>(path, body)` | `EDCAP_FE/src/lib/api.ts` | Exists now, but Project delete must not use it. |
| `api.del<T>(path)` | `EDCAP_FE/src/lib/api.ts` | Existing DELETE helper; not the chosen Project delete contract. |
| `endpoints.organizations.*` | `EDCAP_FE/src/lib/api.ts` | Good example of governance typed endpoint helpers and page response shape. |
| `endpoints.customers.*` | `EDCAP_FE/src/lib/api.ts` | Good example for parent selection list/detail/create/update/delete helpers. |
| `endpoints.teams.*` | `EDCAP_FE/src/lib/api.ts` | Good example for Team list/detail/member flows and soft-delete helper. |
| `useAuth()` | `EDCAP_FE/src/hooks/useAuth.ts` | Provides `{ user, isAuthenticated, isLoading }`. |
| `logout()` | `EDCAP_FE/src/hooks/useAuth.ts` | Clears auth state and redirects to language login route. |
| `RequireAdmin` | `EDCAP_FE/src/App.tsx` | Existing route guard pattern for governance pages. |
| `OrganizationPage`, `CustomerPage`, `TeamPage`, `RolePage` | `EDCAP_FE/src/pages/*.tsx` | Existing governance page references. |
| `OrganizationController.*` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | Governance REST pattern with list/get/create/update/softDelete. |
| `CustomerController.*` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` | Governance REST pattern and page DTO use. |
| `TeamController.*` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` | Governance REST pattern for Team and related sub-resource flows. |
| `CurrentAppUserResolver` / `@CurrentUser` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/` | Existing resolver for current local `AppUser`. |
| `AppUser.Role` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Existing enum for authenticated role context. |
| `GlobalExceptionHandler` methods | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Existing exception-to-HTTP mapping. |
| `ErrorResponse` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Current standard error envelope. |
| `OrganizationMapper` / `CustomerMapper` / `TeamMapper` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/` and `src/main/resources/mapper/` | Existing MyBatis mapper pattern for governance modules. |
| `trg_dim_project_updated_at` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing trigger updates `updated_at` for `tbl_dim_project`. |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `ProjectController` | Not found in current BE source. | Add in later implementation under `web.rest` after Phase 2. |
| `ProjectService` / `ProjectUseCase` | Not found in current BE source. | Add application-layer use case/service later. |
| `ProjectRepositoryPort` | Not found in current BE source. | Add port under application persistence package later. |
| `ProjectRepositoryAdapter` | Not found in current BE source. | Add adapter under infrastructure later. |
| `ProjectMapper` / `ProjectMapper.xml` for governance `tbl_dim_project` | Not found in current BE governance source. | Add MyBatis mapper later if repository implementation uses MyBatis. |
| Governance `Project` domain model/entity | Not found in current BE governance domain model package. | Add domain model later if needed. |
| `ProjectDtos` / request records | Not found in current `web.dto` package. | Add Project DTOs later. |
| `endpoints.projects.*` | Not found in `EDCAP_FE/src/lib/api.ts`. | Add typed endpoint helpers later. |
| `ProjectPage`, `ProjectListPage`, `ProjectFormPage` | Not found in FE source. | Add page/components later. |
| `/:lang/projects` route | Not registered in `App.tsx`. | Add route later with chosen auth behavior. |
| `DELETE /api/v1/projects/{id}` | Not the approved contract. | Use `PUT /api/v1/projects/{id}/delete`. |
| `PATCH /api/v1/projects/{id}/delete` | Governance pattern, but not this ticket’s contract. | Use `PUT /api/v1/projects/{id}/delete`. |
| `version` in Project create/update/delete requests | Explicitly not part of the approved Project contract. | Do not add hidden optimistic-lock behavior unless the ticket changes. |
| `tbl_dim_team.project_id` ownership assumption | `V140__team_management.sql` drops `project_id` from `tbl_dim_team`. | Use `tbl_project_team` as the Project-Team relation source. |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| FE route | Project route | `EDCAP_FE/src/App.tsx` | Not implemented. Add later under `/:lang/projects` or the final approved governance route. |
| FE API helper | Project endpoint helpers | `EDCAP_FE/src/lib/api.ts` | Not implemented. Add typed list/detail/create/update/delete helpers later. |
| FE types | `Project`, `ProjectPage`, `ProjectDetail`, `CreateProjectRequest`, `UpdateProjectRequest` | TBD / `src/lib/api.ts` or nearby | Not implemented. Must match BE DTO fields from spec. |
| FE locale | `Pages.Project.*` | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Project keys not currently present. Add later in UTF-8. |
| BE controller | Project REST controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/` | Not implemented. Must not call infrastructure directly. |
| BE request DTO | Project create/update/delete request records | TBD / `web.dto` | Not implemented. No `version` field for this ticket. |
| BE response DTO | Project response/list/detail DTO | TBD / `web.dto` | Must return enough data for list/detail/edit prefill. |
| BE application service/use case | Project use case | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/...` | Not implemented. Owns business rules, duplicate checks, Team sync, soft delete, role-based authorization. |
| BE persistence port | Project repository port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/` | Not implemented. Application depends on port. |
| BE domain model | Project | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/` | Not implemented as governance model. Add if needed. |
| BE adapter | Project repository adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/` | Not implemented. Implements port using mapper. |
| BE mapper | Project MyBatis mapper | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/` and `src/main/resources/mapper/` | Not implemented. Keep SQL explicit and safe. |
| DB table | `tbl_dim_project` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing Project table. Do not rename or recreate. |
| DB bridge table | `tbl_project_team` | `EDCAP_BE/src/main/resources/db/migration/V120__project_management.sql` | Existing many-to-many bridge with active uniqueness on `(project_id, team_id)`. |
| DB related table | `tbl_dim_customer` | `V4__init_shema_v2.sql` | Parent selection source for Project. |
| DB related table | `tbl_dim_team` | `V4__init_shema_v2.sql`, `V140__team_management.sql` | Team master table; no longer owns `project_id` directly after V140. |
| DB related table | `tbl_dim_role` | `V4__init_shema_v2.sql` | Role metadata source referenced by ticket authorization rule. |
| DB enum | `record_status` | `V4__init_shema_v2.sql` | Includes `ACTIVE`, `INACTIVE`, `ARCHIVED`, `DELETED`. |
| DB enum | `severity_level` | `V4__init_shema_v2.sql` | Source value set for `risk_level`. `project_type` remains `VARCHAR(100)`. |
| DB migration | `V120__project_management.sql` | Existing Project management migration | Adds `delete_flag`, `deleted_at`, `deleted_by`, active uniqueness index, and `tbl_project_team`. |
| DB migration | `V140__team_management.sql` | Existing Team management migration | Drops `tbl_dim_team.project_id`; confirms bridge-table relation is the current source of truth. |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| Project name | `projectAlias` / `project_alias` | `spec-pack.md`, `01_raw-input.md`, V4 | UI label is “Project name”; DB field remains `project_alias`. |
| Customer | `customerId` / `customer_id` | `spec-pack.md`, V4 | Required parent reference. |
| Team | `teamIds` -> `tbl_project_team` | `spec-pack.md`, `V120__project_management.sql` | Many-to-many relation via bridge table. |
| Project type | `projectType` / `project_type` | ticket decision + V4 schema | Free-text nullable field entered by the user, trimmed, and bounded by `VARCHAR(100)`. |
| Risk level | `riskLevel` / `risk_level` | V4 `severity_level` | Expected values: `INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. |
| Status | `ACTIVE`, `DELETED` | `record_status` enum + spec | Default active list excludes soft-deleted rows. |
| Deleted flag | `delete_flag` | `V120__project_management.sql` | Internal soft-delete support field; not necessarily surfaced directly in UI. |
| `formItemNm` | N/A | Source inspection | No Project-specific `formItemNm` mapping found. Do not invent one. |
| `SEQNO` | N/A | Source inspection | No Project-specific sequence/order display field found. Do not add one. |
| Master Data table | `tbl_dim_customer`, `tbl_dim_team`, `tbl_dim_role` | schema + implemented modules | Use actual tables/modules rather than inventing a generic master-data source. |
| Code Value | `severity_level`, `record_status` | `V4__init_shema_v2.sql` | Use enum/constant/master source instead of scattered magic strings. |

## Multilingual Note

- FE translation resources are fixed at `EDCAP_FE/public/locales/{en,ja,vi}/locale.json`.
- Project user-facing labels/messages must be translated through `useTranslation("locale")`; do not hard-code English/Japanese/Vietnamese UI text in components.
- Backend currently exposes `ErrorResponse.message`, not a dedicated `messageKey` field. For this repo, FE `ApiError` already translates message keys coming from `message`.
- `docs/changes/PROJECT/01_raw-input.md` shows mojibake in terminal output. Treat it as a content warning and normalize visible wording carefully when creating locale keys or user-facing copy.

## Encoding / Mojibake Note

- Preserve valid UTF-8 when editing docs and locale files.
- Avoid propagating mojibake from `01_raw-input.md` into new artifacts or later implementation strings.
- Do not convert locale files to Shift-JIS or other encodings.
- Verify Vietnamese diacritics and Japanese punctuation render correctly.

## Log / Audit / Operation Note

- Dedicated audit-log storage is not part of this ticket scope unless explicitly added later by another ticket.
- Use existing request trace behavior: `TraceIdFilter` sets MDC `traceId` and response header `X-Trace-Id`; `ErrorResponse` includes `traceId`.
- Create/update/soft-delete should remain traceable through normal logs and actor fields such as `created_by`, `updated_by`, `deleted_by`.
- Do not log secrets, tokens, or unnecessary PII.
- `tbl_dim_project` already has `updated_at` trigger behavior from V4. Soft-delete/update logic should account for DB-managed timestamp updates while still setting actor fields explicitly.

## Ticket-Specific Constraints

- Phase 2 creates context/rules/planning/skeleton artifacts only. No Project source implementation in this phase.
- Use existing `tbl_dim_project` and `tbl_project_team`; do not rename, drop, or recreate them.
- Do not reintroduce `version` into Project request contracts.
- Project soft delete contract is `PUT /api/v1/projects/{id}/delete`, not `PATCH`.
- Project-Team relation must use `tbl_project_team`, not a direct `project_id` field on `tbl_dim_team`.
- Authorization guidance for this ticket is role-based and tied to `tbl_dim_role`; do not invent a separate permission-role model in docs.
- `project_type` is not enum-backed in this ticket; FE/BE must treat it as user-entered free text with trim-to-null behavior.
- FE tests, BE tests, and final execution evidence are not implemented in Phase 2; only planning and skeleton artifacts are prepared.
