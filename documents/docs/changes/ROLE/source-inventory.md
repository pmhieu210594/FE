# Source Inventory - ROLE Phase 3

**Ticket ID**: ROLE  
**Phase**: Phase 3 - Impact Analysis / Impl Plan  
**Updated**: 2026-06-12  
**Status**: Initial inventory for implementation planning

## 1. FE Inventory

| surface | current source | status | Phase 3 action |
|---|---|---|---|
| Router candidate | `EDCAP_FE/src/router.tsx` | Exists; `createHashRouter` with empty children; not observed as mounted | Do not use as sole route source unless routing is migrated |
| Runtime wrapper/source | `EDCAP_FE/src/main.tsx`, `EDCAP_FE/src/App.tsx` | Exists; `main.tsx` uses `HashRouter`, `App.tsx` defines `<Routes>` | Add `/roles` in `App.tsx` |
| Layout/menu | `EDCAP_FE/src/components/Layout.tsx` | Exists | Add Role menu/action if pattern supports |
| Auth role | `EDCAP_FE/src/lib/api.ts` | `Role = "VIEWER" | "EDITOR" | "ADMIN"` | Use for current-user action visibility only |
| API wrapper | `EDCAP_FE/src/lib/api.ts` | `api.get/post/put/patch/del`, `ApiError`, `endpoints` | Add role endpoint helpers here |
| Role DTO | not found | Missing | Add `RoleDto`; do not name it `Role` |
| Role page | not found | Missing | Add page for `/roles` |
| UI components | `server-table`, `search`, `pagination`, `form`, `button`, `card` | Existing candidates | Reuse when compatible |
| Date formatting | `EDCAP_FE/src/lib/utils.ts` | `formatDateTime` exists | Add/adjust date-only display if needed |
| Tests | `EDCAP_FE/src/__ tests __/*` | Existing org/app/utils tests | Add ROLE tests in same style |

## 2. BE Inventory

| surface | current source | status | Phase 3 action |
|---|---|---|---|
| Controller pattern | `OrganizationController.java` | Exists | Follow REST style |
| Current user | `@CurrentUser`, `CurrentUser` resolver | Exists | Pass caller into service |
| Error response | `GlobalExceptionHandler`, `ErrorResponse` | Exists | Use standard envelope |
| Auth roles | `AppUser.Role` | `VIEWER`, `EDITOR`, `ADMIN` | Enforce accepted matrix |
| Service pattern | `OrganizationService.java` | Exists | Follow service/validation style |
| Repository port pattern | Organization repository port | Exists | Add role port |
| Adapter/mapper pattern | Organization adapter/MyBatis mapper | Exists | Add role adapter/mapper/XML |
| Role controller/service/port/adapter/mapper | targeted search | Missing | Add in Phase 3 |
| Role DTO | targeted search | Missing | Add request/response DTOs |
| Tests | org unit/integration tests, architecture tests | Existing examples | Add ROLE coverage |

## 3. DB Inventory

| table / column | source fact | Phase 3 action |
|---|---|---|
| `tbl_dim_role` | Exists in V4 | Use official table |
| `role_id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` | Map to `roleId` |
| `role_name` | `VARCHAR(100) NOT NULL UNIQUE` | Map to `roleName`; add case-insensitive duplicate handling |
| `description` | `TEXT` | Trim; empty string remains empty string |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Map to `createdAt` |
| `created_by` | `VARCHAR(100) NOT NULL DEFAULT 'SYSTEM'` | Maintain on insert |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` + trigger | Map to `updatedAt`; update on logical delete |
| `updated_by` | `VARCHAR(100) NOT NULL DEFAULT 'SYSTEM'` | Maintain on update/delete |
| `delete_flag` | Not found in V4 role table; V90 is empty | Stop/Ask before implementation; migration likely needed |
| FK references | Multiple references to `tbl_dim_role.role_id` | Preserve via logical delete |

## 4. API / Contract Inventory

| contract item | accepted shape |
|---|---|
| list | `GET /api/v1/roles` returns raw `RoleDto[]` |
| detail | `GET /api/v1/roles/{roleId}` returns role DTO/detail |
| create | `POST /api/v1/roles` with `roleName`, `description` |
| update | `PUT /api/v1/roles/{roleId}` with `roleName`, `description` |
| delete | `PUT /api/v1/roles/{roleId}/delete` returns HTTP 200 and deleted `RoleDto` |
| errors | Standard `ErrorResponse`; duplicate is HTTP 400 |
| auth | Role-based only; no permission fields |
| pagination | FE-side only; no server pagination object or `totalCount` |

## 5. Caller / Callee Inventory

| caller | callee | notes |
|---|---|---|
| User | `/roles` FE page | Route via `App.tsx` under `main.tsx` `HashRouter` |
| Role page | FE role endpoints | Use `src/lib/api.ts` |
| FE API helper | BE RoleController | Session cookie, JSON |
| RoleController | RoleService | Inject current user |
| RoleService | RoleRepositoryPort | Validation/auth/business rules |
| Repository adapter | MyBatis mapper/XML | Persistence |
| Mapper/XML | `tbl_dim_role` | Filter logical deletes |

## 6. Missing Source To Add In Phase 3

- FE Role page.
- FE `RoleDto` typing and endpoint helpers.
- FE i18n keys for Role Management.
- BE RoleController.
- BE Role DTOs.
- BE RoleService.
- BE Role domain/model if needed.
- BE RoleRepositoryPort.
- BE RoleRepositoryAdapter.
- BE RoleMapper interface and XML.
- DB migration for `delete_flag` if confirmed missing.
- FE/BE/contract tests.

## 7. Not In Scope / Not To Add

- Restore endpoint or UI.
- Permission-based RBAC.
- Permission DTO/API/DB/UI fields.
- Role seed data.
- Physical delete or cascade delete.
- Server pagination wrapper or `totalCount`.

## 8. Inventory Risks

| risk | severity | action |
|---|---|---|
| `delete_flag` not present in read migration source | High | Resolve DB migration before implementation |
| Router source split between `router.tsx` and `main.tsx`/`App` | Medium | Current implementation should use `App.tsx`; do not edit only `router.tsx` |
| Organization pattern uses server pagination and ADMIN-only auth | Medium | Do not copy these parts blindly; ROLE contract differs |
| Existing FE `Role` type conflicts with role master DTO naming | Medium | Use accepted `RoleDto` |
