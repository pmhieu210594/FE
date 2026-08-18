# Context

**Ticket ID**: REPOSITORY-CRUD
**Create date**: 2026-06-19
**Author**: Codex
**Update date**: 2026-06-19

## Screen / API / Batch / Related Job

| category | related item | source state | note |
|---|---|---|---|
| FE screen | Repository list | Not implemented | Planned admin CRUD list. Default list excludes soft-deleted rows. |
| FE screen | Repository create | Not implemented | Planned create drawer/form. Requires project, repository name, host type. |
| FE screen | Repository detail | Not implemented | Planned read-only drawer. Detail visibility for deleted rows stays as spec-pack states. |
| FE screen | Repository edit | Not implemented | Planned edit drawer. Must not guess optimistic-lock behavior unless later source confirms it. |
| FE screen | Repository delete confirm | Not implemented | Soft delete only. No hard delete UI. |
| FE route | `/:lang/...` repository route | Not implemented | Add in Phase 3 only if implementation starts. |
| BE API | `GET /api/v1/repositories` | Not implemented | Active-row list endpoint. |
| BE API | `GET /api/v1/repositories/{repository_id}` | Not implemented | Detail endpoint. |
| BE API | `POST /api/v1/repositories` | Not implemented | Create endpoint. |
| BE API | `PUT /api/v1/repositories/{repository_id}` | Not implemented | Update endpoint. |
| BE API | `PUT /api/v1/repositories/{repository_id}/delete` | Not implemented | Soft delete endpoint. |
| Batch / Job | Repository batch/job | Not found | No batch/job is in scope for this ticket. |
| Dependent domain | Project | Existing | Repository belongs to exactly one project. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| FE route/auth | `EDCAP_FE/src/components/Layout.tsx` | Language-first routing and auth-aware navigation. |
| FE API helper | `EDCAP_FE/src/lib/api.ts` | Use typed helpers, `credentials: "include"`, `ApiError`, and no direct `fetch` in pages. |
| FE CRUD page | `EDCAP_FE/src/pages/ProjectPage.tsx` | TanStack Query, drawer flow, mutation invalidation, and success/error messaging. |
| FE deleted-row UX | `EDCAP_FE/src/pages/OrganizationPage.tsx` | Read-only detail for deleted rows and disabled edit/delete controls. |
| FE form/table stack | `EDCAP_FE/src/components/ui/drawer/index.tsx`, `.../search/index.tsx`, `.../server-table/index.tsx`, `.../button/index.tsx` | Use the current shared UI primitives instead of inventing a new stack. |
| FE i18n | `EDCAP_FE/src/pages/ProjectPage.tsx` and locale bundles | Use `useTranslation("locale")`; keep UTF-8 locale files. |
| BE REST controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` | Thin controller, `/api/v1` route, `@CurrentUser` caller, DTO return types. |
| BE DTO mapping | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ProjectDtos.java` | Record-based DTOs with `from(...)` mapping. |
| BE domain background reference | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Repository.java` | Legacy V1-style entity only; not the ticket target. |
| BE error handling | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Standard error body with traceId. |
| DB migration pattern | `EDCAP_BE/src/main/resources/db/migration/V130__repository_management.sql` | Additive migration, partial unique index, soft-delete columns. |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `Layout` | `EDCAP_FE/src/components/Layout.tsx` | App shell and navigation. |
| `CButton` / `Button` | `EDCAP_FE/src/components/ui/button/index.tsx`, `EDCAP_FE/src/components/ui/button.tsx` | Button family already used by current pages. |
| `Badge` | `EDCAP_FE/src/components/ui/badge.tsx` | Status display. |
| `CDrawerForm` | `EDCAP_FE/src/components/ui/drawer/index.tsx` | Create/edit/detail drawer flow. |
| `CSearch` | `EDCAP_FE/src/components/ui/search/index.tsx` | Keyword search. |
| `CServerTable` | `EDCAP_FE/src/components/ui/server-table/index.tsx` | Server-side list rendering and paging. |
| `Popconfirm` | Ant Design | Delete confirmation. |
| `api`, `endpoints`, `ApiError` | `EDCAP_FE/src/lib/api.ts` | Only supported FE API surface. |
| `formatDateTime` | `EDCAP_FE/src/lib/utils.ts` | Audit timestamp display. |
| `@CurrentUser` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentUser.java` | Caller injection for controllers. |

## Forbidden common components

| component | reason |
|---|---|
| Direct `fetch` in Repository page/component | All FE API calls must go through `src/lib/api.ts`. |
| Legacy `EDCAP_FE/src/utils/api.ts` | Not the platform API contract. |
| `routerLinks()` as source of truth | Existing maps are not authoritative. |
| New ad-hoc API envelope | Platform contract uses raw DTO / raw list on success. |
| Physical SQL delete for repository rows | Spec requires soft delete only. |
| Ad-hoc error maps like `Map.of("error", ...)` | Use `ErrorResponse` + `GlobalExceptionHandler`. |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `ProjectController.list/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` | Closest live CRUD controller shape. |
| `ProjectDtos.ProjectDto.from(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ProjectDtos.java` | DTO mapping pattern. |
| `ProjectDtos.ProjectPageDto.from(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ProjectDtos.java` | Page response pattern. |
| `ProjectPage()` | `EDCAP_FE/src/pages/ProjectPage.tsx` | Live CRUD page pattern. |
| `OrganizationPage()` | `EDCAP_FE/src/pages/OrganizationPage.tsx` | Deleted-row UX and drawer flow. |
| `CustomerPage()` | `EDCAP_FE/src/pages/CustomerPage.tsx` | Another live CRUD page pattern. |
| `endpoints.projects.list/get/create/update/softDelete` | `EDCAP_FE/src/lib/api.ts` | Current typed endpoint helper example. |
| `endpoints.organizations.list/get/create/update/softDelete` | `EDCAP_FE/src/lib/api.ts` | Current soft-delete API helper example. |
| `endpoints.customers.list/get/create/update/softDelete` | `EDCAP_FE/src/lib/api.ts` | Current CRUD helper example. |
| `api.get/post/put/patch/del` | `EDCAP_FE/src/lib/api.ts` | Low-level request helpers. |
| `useAuth()` | `EDCAP_FE/src/hooks/useAuth.ts` | Auth/session hook pattern. |
| `logout()` | `EDCAP_FE/src/hooks/useAuth.ts` | Logout pattern. |
| `GlobalExceptionHandler.handleNotFound/handleDomain/handleApplication/handleValidation/handleIllegalArg/handleUnknown` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Standard error mapping. |
| `trg_tbl_dim_repository_updated_at` style migration logic | `EDCAP_BE/src/main/resources/db/migration/V130__repository_management.sql` | Active-row soft-delete index pattern. |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `RepositoryController` | Not present in current BE source. | Add later in `web.rest`. |
| `RepositoryService` | Not present in current BE source. | Add later in application layer. |
| `RepositoryRepositoryPort` | Not present in current BE source. | Add later under application ports. |
| `RepositoryRepositoryAdapter` | Not present in current BE source. | Add later under infrastructure persistence. |
| `RepositoryMapper` / `RepositoryMapper.xml` for CRUD | No live CRUD mapper exists yet. | Add later only if final implementation uses MyBatis. |
| `endpoints.repositories.*` | Not present in `EDCAP_FE/src/lib/api.ts`. | Add typed helpers later. |
| `RepositoryPage` | Not present in FE source. | Add later under `src/pages/`. |
| `/:lang/repositories` route | Not registered in current router/app. | Add later with auth guard. |
| `DELETE /api/v1/repositories/{id}` | Spec uses soft delete route, not physical delete. | Use `PUT /api/v1/repositories/{id}/delete`. |

## DTO / Entity / Table / Migration mapping

| layer | name | path | note |
|---|---|---|---|
| FE route | Repository route | `EDCAP_FE/src/App.tsx` / router files | Not implemented yet. |
| FE API helper | Repository endpoint helpers | `EDCAP_FE/src/lib/api.ts` | Not implemented yet. |
| FE types | Repository DTOs | TBD | Must mirror BE contract when implemented. |
| FE locale | `Pages.Repository.*` | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Not present yet. |
| BE controller | Repository REST controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/` | Not implemented yet. |
| BE request DTO | Create/update/delete request records | TBD | Must validate project, name, host type, and route ID. |
| BE response DTO | Repository response/list/detail DTO | TBD | Must include project display name and audit fields. |
| BE application service/use case | Repository use case | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/...` | Not implemented yet. |
| BE persistence port | Repository repository port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/` | Not implemented yet. |
| BE domain model | `Repository` legacy model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Repository.java` | Background context only. |
| BE table | `tbl_dim_repository` | `EDCAP_BE/src/main/resources/db/migration/V130__repository_management.sql` | Authoritative table for this ticket. |
| BE migration | `V130__repository_management.sql` | `EDCAP_BE/src/main/resources/db/migration/` | Existing migration; future changes need new migrations. |
| DB columns | `repository_id`, `project_id`, `repo_name_masked`, `host_type`, `default_branch`, `repo_url_hash`, `status`, `delete_flag`, `deleted_at`, `deleted_by`, `created_at`, `created_by`, `updated_at`, `updated_by` | `tbl_dim_repository` | Current schema evidence and migration notes. |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| Repository name | `repo_name_masked` | `spec-pack.md`, `V130__repository_management.sql` | Displayed raw in UI, persisted as canonical name. |
| Project alias | `project_alias` | `spec-pack.md`, `tbl_dim_project` | Human-readable project label joined from `tbl_dim_project` using `project_id`. |
| Host type | `host_type` | `spec-pack.md`, `Repository.java` | Existing enum values: `GITHUB`,  `LOCAL`. |
| Default branch | `default_branch` | `spec-pack.md`, `Repository.java` | Optional. |
| Repository URL | `repo_url_hash` | `spec-pack.md` | UI displays raw URL; DB stores encoded form per spec. |
| Status | `ACTIVE`, `DELETED` | `spec-pack.md`, `V130__repository_management.sql` | Soft-delete state. |
| `formItemNm` | N/A | Source inspection | No Repository-specific mapping found. |
| `SEQNO` | N/A | Source inspection | No Repository-specific mapping found. |
| Master Data | N/A | Source inspection | No separate master table confirmed. |
| Code Value | `GITHUB`, `LOCAL`, `ACTIVE`, `DELETED` | Domain model + migration/spec | Use constants or enum mapping, not magic strings. |

## Multilingual Note

- Locale files are UTF-8 JSON bundles under `EDCAP_FE/public/locales/{en,ja,vi}/locale.json`.
- No Repository locale keys exist yet.
- Use `useTranslation("locale")` for user-facing strings.
- Keep BE `ErrorResponse.message` compatible with current FE error handling.

## Encoding / Mojibake Note

- Preserve UTF-8 in docs and locale files.
- Avoid mojibake in Vietnamese and Japanese text.
- Keep locale JSON valid across all language bundles.

## Log / Audit / Operation Note

- Dedicated audit-log storage is out of scope.
- Preserve `traceId` propagation through the existing filter/exception flow.
- Log enough context to debug create/update/delete failures without exposing secrets or unnecessary PII.
- Use actor fields from the caller where the future implementation needs them.
- Soft delete should remain reversible only through a later approved business process.

## Ticket-Specific Constraints

- Phase 2 produces documentation artifacts only.
- Use `tbl_dim_repository` as the authoritative target.
- Treat the legacy `Repository` domain model as background context only.
- Keep the same raw-DTO, session-cookie, `/api/v1/...` contract style used elsewhere.
- Soft delete only; no restore flow in this ticket.
- Any unresolved business decision stays open in `ticket-rules.md`.
