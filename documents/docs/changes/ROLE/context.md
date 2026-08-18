# Context

**Ticket ID**: ROLE  
**Feature**: CRUD Role Management  
**Phase**: Phase 2 - Ticket Context / Rules  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  
**Status**: Draft / Phase 2 / Pack 26 Decisions Applied / Phase 3 Planning Allowed

## Source Basis

| source | status | note |
|---|---|---|
| `spec-pack.md` | Read | Canonical ROLE specification |
| `sources.md` | Read | Phase 1 source ledger |
| `open-issues.md` | Read | Phase 1/Pack 26 issue ledger |
| `EDCAP_BE/documents/docs/architecture/` | Read narrowly | FE/BE contract, route/API, repository/DB, service, test maps |
| `EDCAP_BE/documents/docs/standards/` | Read narrowly | API, backend, frontend, security, logging, testing |
| `EDCAP_BE/documents/.claude/rules/` | Read | Safety, architecture, security, testing rules exist under `EDCAP_BE/documents` |
| Representative FE/BE source | Read earlier / verified by search | Used only to identify existing methods and missing ROLE-specific code |

## Screen / API / Batch / Related Job

| surface | item | status | note |
|---|---|---|---|
| FE screen | `/roles` | Approved in spec | Role Management route |
| FE i18n | `Pages.RoleManagement.*` | Proposed | Follows existing locale JSON shape; final wording review deferred |
| API candidate | `GET /api/v1/roles` | Accepted candidate | Raw `RoleDto[]`; FE handles pagination; no `totalCount` |
| API candidate | `GET /api/v1/roles/{role_id}` | Candidate | Detail role |
| API candidate | `POST /api/v1/roles` | Candidate | Create role |
| API candidate | `PUT /api/v1/roles/{role_id}` | Candidate | Update role |
| API candidate | `PUT /api/v1/roles/{role_id}/delete` | Accepted candidate | HTTP 200 logical delete; sets `delete_flag = 1`, updates `updated_at` / `updated_by`, and returns the updated `RoleDto` |
| API candidate | Restore endpoint | Out of scope | Do not implement restore in this ticket |
| Batch / Job | ROLE-specific batch/job | Not found | No ROLE batch/job or scheduled surface identified |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| FE API wrapper | `EDCAP_FE/src/lib/api.ts` | API calls through `api.get/post/put/delete`; `credentials: "include"`; `ApiError` on non-2xx |
| FE auth | `EDCAP_FE/src/hooks/useAuth.ts` | Use existing auth/session pattern and 401 handling |
| FE route/layout | `EDCAP_FE/src/main.tsx`, `EDCAP_FE/src/App.tsx`, `EDCAP_FE/src/components/Layout.tsx` | Current runtime route source: `main.tsx` mounts `HashRouter`; `App.tsx` defines `<Routes>` |
| FE page pattern | `EDCAP_FE/src/pages/AdminPage.tsx` | TanStack Query, loading/error/empty handling, i18n usage |
| FE i18n | `EDCAP_FE/src/i18n.ts`, `EDCAP_FE/public/locales/*/locale.json` | `react-i18next`, namespace `locale`, `Pages.<Feature>.*` keys |
| BE controller | `MeController`, `AdminController` | Thin controller; map request/response; delegate business logic |
| BE DTO | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | Java record DTO pattern |
| BE service | `AppUserService` | Application use case with constructor injection and transaction where mutating |
| BE error | `GlobalExceptionHandler`, `ErrorResponse` | Single error mapping and standard response shape |
| BE security | `SecurityConfig`, `CurrentUser` | Session auth and controller-level current user access |
| BE persistence | Existing mapper/adapter pairs | MyBatis mapper + infrastructure adapter + application port |
| BE tests | `GithubWebhookServiceTest`, `ArtifactNormalizerTest`, `LayerEnforcementTest` | Service tests mock ports; domain tests instantiate real objects; ArchUnit keeps layers green |
| FE E2E | `EDCAP_FE/e2e_tests/tests/smoke.spec.ts` | Existing smoke only; weak example, not sufficient coverage |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `Button` | `EDCAP_FE/src/components/ui/button.tsx` | Source-confirmed base button |
| `Card` | `EDCAP_FE/src/components/ui/card.tsx` | Use only where a framed item/tool is needed; avoid nested cards |
| `Table` | `EDCAP_FE/src/components/ui/table.tsx` | Source-confirmed base table |
| `CSearch` | `EDCAP_FE/src/components/ui/search/index.tsx` | Candidate for search UI if compatible with ROLE needs |
| `CPagination` | `EDCAP_FE/src/components/ui/pagination/index.tsx` | Candidate for pagination UI if compatible with ROLE contract |
| `CForm` | `EDCAP_FE/src/components/ui/form/index.tsx` | Candidate form wrapper; validate source fit before use |
| `CServerTable` | `EDCAP_FE/src/components/ui/server-table/index.tsx` | Candidate server table; validate source fit before use |
| Radix primitive Dialog | Dependency/pattern to confirm in Phase 3 | No local common Dialog wrapper was found; use only after FE source/dependency confirmation |

## Forbidden common components

| component/method | reason |
|---|---|
| New Ant Design components | Frontend standards allow existing usage only; do not introduce new Ant Design Table/Form/etc. |
| Direct `fetch` in components/hooks | All API calls must go through `EDCAP_FE/src/lib/api.ts` |
| No-op Redux CRUD/global actions | Source map says reducers are no-ops; do not treat them as working ROLE implementation |
| ROLE-specific controller/service/mapper names not found in source | Do not call or document as existing before implementation |
| Separate action authorization labels | Canonical spec says ROLE uses role-based RBAC and no separate action authorization labels |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `api.get`, `api.post`, `api.put`, `api.del` | `EDCAP_FE/src/lib/api.ts` | HTTP helpers; ROLE logical delete must use `api.put` because endpoint method is PUT |
| `endpoints.me` | `EDCAP_FE/src/lib/api.ts` | Current user fetch |
| `useAuth` | `EDCAP_FE/src/hooks/useAuth.ts` | Current session/user |
| `loginWithGoogle` | `EDCAP_FE/src/hooks/useAuth.ts` | OAuth2 redirect |
| `logout` | `EDCAP_FE/src/hooks/useAuth.ts` | Spring logout and FE redirect |
| `formatDateTime` | `EDCAP_FE/src/lib/utils` | Existing date/time display helper; exact ROLE `DD/MM/YYYY HH:mm:ss` formatting must be confirmed |
| `HashRouter` mount | `EDCAP_FE/src/main.tsx` | Current runtime router wrapper |
| `<Routes>` definitions | `EDCAP_FE/src/App.tsx` | Current runtime route mechanism |
| `useTranslation("locale")` / `t()` | FE pages/components | i18n pattern |
| `MeController.me()` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | Current user API |
| `AdminController.connectors()` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Existing admin list pattern |
| `AdminController.runConnector()` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Existing admin mutation pattern with role gate risk |
| `AdminController.runHistory()` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Existing admin list/history pattern |
| `AppUserService.upsertFromOAuth()` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AppUserService.java` | Current user provisioning |
| `AppUser.Role` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Existing roles: `VIEWER`, `EDITOR`, `ADMIN` |
| Existing mapper/adapter pairs | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/` | Persistence pattern for V1 tables |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `RoleController` | Not found in source | Add only in Phase 3 after Pack 26 finalizes contract |
| `RoleService` | Not found in source | Add application use case only after Pack 26 |
| `RoleRepositoryPort` / `RoleRepositoryAdapter` | Not found in source | Add with MyBatis mapper/adaptor pattern after Pack 26 |
| `RoleMapper` | Not found in source | Add mapper only after DB/FK/query strategy is finalized |
| `RoleDto` | Not found in source | Accepted FE DTO/list/detail name; add only during Phase 3 implementation |
| FE Role page/component | Not found in source | Add page under existing router/page pattern after Pack 26 |
| FE role endpoint helpers | Not found in `src/lib/api.ts` | Add through API wrapper only after contract is finalized |
| `SCrud` as working ROLE implementation | Redux CRUD reducers are no-ops | Use TanStack Query + `lib/api.ts` |

## DTO / Entity / Table / Migration mapping

| layer | name | path | note |
|---|---|---|---|
| DB table | `tbl_dim_role` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Official ROLE table |
| DB columns | `role_id`, `role_name`, `description`, `created_at`, `created_by`, `updated_at`, `updated_by` | V4 migration | Source-observed columns |
| API candidate DTO | `roleId`, `roleName`, `description`, `createdAt`, `updatedAt` | `spec-pack.md` | Candidate; serialization finalized in Pack 26 |
| BE entity/model | ROLE model | Not found | Must be created only after Pack 26 |
| BE mapper/adapter | ROLE mapper/adapter | Not found | V4 table has no Java mapper/adapter yet |
| Migration | V4 existing schema | `V4__init_shema_v2.sql` | Do not edit committed migration; new migration only if Phase 3 needs one and is approved |
| FK references | `tbl_dim_role.role_id` | V4 migration / `HD-ROLE-DELETE-001` | Multiple references are preserved because physical hard delete and cascade delete are out of scope |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| `formItemNm` | Not found | Source/docs search | Not applicable unless Phase 3 source reveals form framework requirement |
| `SEQNO` | Not found | Source/docs search | Not applicable unless Phase 3 source reveals ordering convention |
| Role master data | `tbl_dim_role` | `spec-pack.md`, V4 migration | ROLE is master data |
| Role enum values | `VIEWER`, `EDITOR`, `ADMIN` | `AppUser.Role` | Accepted matrix: ADMIN view/create/update/delete; EDITOR view/create/update; VIEWER view |
| Sample role names | `PM`, `QA`, `ADMIN`, etc. | V4 migration / spec examples | Existing/sample data only; no new seed in ROLE scope |

## Multilingual Note

- FE uses `react-i18next`.
- Namespace is `locale`.
- Locale files are `public/locales/en/locale.json`, `vi/locale.json`, `ja/locale.json`.
- Proposed ROLE keys are `Pages.RoleManagement.*`.
- All user-visible ROLE strings should use `t()`; no hardcoded UI strings in Phase 3.

## Encoding / Mojibake Note

- `02_reference-extracts.md` contains mojibake risk in shell output.
- Canonical wording is in `spec-pack.md`.
- Use UTF-8-safe editing and avoid copying corrupted wireframe text into implementation.

## Log / Audit / Operation Note

- Use SLF4J with class logger; no `System.out.println`.
- `TraceIdFilter` supplies MDC `traceId` and `X-Trace-Id`.
- Do not log secrets, credentials, tokens, raw production logs, full request/response bodies, or PII.
- `tbl_dim_role` has audit columns; no custom audit log implementation is in scope for ROLE Phase 2.
- Logical delete operation must be operationally reviewed; use `delete_flag`, `updated_at`, `updated_by`.

## Ticket-Specific Constraints

- `spec-pack.md` is the only canonical specification.
- Pack 26 blocker decisions have been applied; proceed to Phase 3 planning/source verification.
- Do not implement from Phase 2 artifacts alone.
- Do not create seed role data.
- Do not physically delete role rows, cascade delete referenced data, or bypass FK constraints.
- Do not invent a new error shape.

## Assumptions

| ID | assumption | basis | risk |
|---|---|---|---|
| CTX-ASM-001 | ROLE should follow existing FE `Pages.<Feature>.*` i18n shape | Locale JSON source | Low |
| CTX-ASM-002 | ROLE APIs likely use `/api/v1/roles` | API standard + spec candidate | Medium; Pack 26 confirms |
| CTX-ASM-003 | Existing `formatDateTime` may not satisfy exact `DD/MM/YYYY HH:mm:ss` ROLE display | Source only confirms method name | Medium; Phase 3 confirms implementation |

## Pack 26 Deferred Items

- Endpoint contract and exact DTO field types.
- Pagination default/max/response shape for ROLE.
- Timestamp serialization type for `createdAt` and `updatedAt`.
- Role authorization matrix using `AppUser.Role`.
- FE default page size/page origin for client-side pagination.
- Search/sort query names and supported fields beyond minimum.
- Error message text stability for tests; status/body shape is already decided.
