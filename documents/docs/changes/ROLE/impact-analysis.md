# Impact Analysis - ROLE Phase 3

**Ticket ID**: ROLE  
**Feature**: CRUD Role Management  
**Phase**: Phase 3 - Impact Analysis / Impl Plan  
**Updated**: 2026-06-12  
**Status**: Phase 3 artifact updated; implementation has DB Stop/Ask

## 1. Change Content

Implement Role Management for `/roles` with:

- Role list/detail/create/update/delete.
- Role-based authorization only.
- Logical delete, not physical delete.
- Raw list API with FE-side pagination.
- `RoleDto` FE DTO/list/detail naming.
- Standard `ErrorResponse`.

Accepted decisions to preserve:

- `ADMIN`: view/create/update/delete.
- `EDITOR`: view/create/update.
- `VIEWER`: view only.
- Delete sets `delete_flag = 1`, updates `updated_at` and `updated_by`.
- Restore, hard delete, cascade delete, permission-based RBAC, and seed creation are out of scope.
- Duplicate `role_name` is HTTP 400.
- BE returns `createdAt`/`updatedAt` from DB `TIMESTAMPTZ`; FE displays `DD/MM/YYYY HH:mm:ss`.

## 2. Directly Affected Files

| area | file/group | expected change | evidence |
|---|---|---|---|
| FE route | `EDCAP_FE/src/App.tsx` | Add `/roles` route under current `<Routes>` | Source review: runtime routes are defined in `App.tsx` |
| FE runtime routing | `EDCAP_FE/src/main.tsx` | No route definition change expected; confirms `HashRouter` wrapper | `main.tsx` renders `<HashRouter><App /></HashRouter>` |
| FE API/types | `EDCAP_FE/src/lib/api.ts` | Add `RoleDto` typing and role endpoint helpers through existing API wrapper | Existing `api` and `endpoints` pattern |
| FE page | new Role page under FE pages | Add list/search/sort/client pagination/dialog/action UI | Organization page is nearest example |
| FE UI components | server table/search/pagination/form/button/card | Reuse existing components | Components exist |
| FE i18n/date | `i18n`, locale JSON, `src/lib/utils.ts` | Add labels and `DD/MM/YYYY HH:mm:ss` date-time display | Existing i18n and date helper pattern |
| BE controller/DTO | new Role controller/DTO | Add REST surface for role CRUD | No existing Role controller/DTO found |
| BE service/port | new service and repository port | Add validation, auth matrix, logical delete business rules | Organization service is nearest pattern |
| BE adapter/mapper | new repository adapter and MyBatis mapper/XML | Query/update `tbl_dim_role` | No existing role mapper found |
| DB migration | new migration if needed | Add/verify `delete_flag` and optional uniqueness/index support | V4 lacks `delete_flag`; V90 exists but is empty |
| Tests | FE/BE unit/integration/contract tests | Add coverage for ACs and contract | Existing org tests provide patterns |

## 3. Indirectly Affected Files

| area | impact | risk |
|---|---|---|
| Auth/current user | FE display control and BE authorization use `VIEWER/EDITOR/ADMIN` | Medium |
| Layout/navigation | Admin menu must expose `/roles` for allowed users | Medium |
| Error handling | Duplicate/validation/not-found/forbidden must flow through `ErrorResponse` | Medium |
| Timestamp display | FE helper may need date-time formatting with seconds instead of date-only formatting | Medium |
| Existing DB references | Logical delete preserves FK references to `tbl_dim_role.role_id` | Medium |
| Architecture tests | New BE layers must satisfy package/layer rules | Medium |

## 4. Caller / Callee

| caller | callee | expected contract |
|---|---|---|
| Role page | FE role endpoint helpers | `RoleDto[]`, create/update/delete responses |
| FE endpoint helpers | BE `/api/v1/roles` API | Session cookie, JSON, standard `ApiError` on failure |
| BE RoleController | RoleService | Current user passed through `@CurrentUser` |
| RoleService | RoleRepositoryPort | Business validation, auth matrix, duplicate checks |
| Repository adapter | MyBatis mapper/XML | SQL against `tbl_dim_role` |
| Mapper/XML | Database | Filter `delete_flag <> 1` once column exists |

## 5. FE Impact

- Add Role Management screen at `/roles`.
- Use `App.tsx` as the current runtime route source; earlier `router.tsx` route-source decision is superseded by source review.
- Add `RoleDto` typing; do not reuse auth `Role`.
- Use `src/lib/api.ts` endpoint helpers; do not call `fetch` directly.
- Receive raw list array and implement client-side pagination/count using array length.
- Support search/sort per accepted spec; no `totalCount` field expected from BE.
- Show create/update/delete controls according to authenticated user role.
- Treat FE control as UX only; BE remains enforcement point.
- Format `createdAt`/`updatedAt` as `DD/MM/YYYY HH:mm:ss`.
- Add i18n labels under the established locale pattern.

## 6. BE Impact

- Add Role REST API for list/detail/create/update/delete.
- Add Role DTOs using `roleId`, `roleName`, `description`, `createdAt`, `updatedAt`.
- Enforce authorization matrix:
  - view: `ADMIN`, `EDITOR`, `VIEWER`
  - create/update: `ADMIN`, `EDITOR`
  - delete: `ADMIN`
- Validate trim/non-blank/max length/case-insensitive duplicate for `roleName` against active rows only (`delete_flag != 1`).
- Trim `description`; keep empty string as empty string.
- Use `BusinessRuleException` or equivalent path that maps duplicate to HTTP 400 `ErrorResponse`.
- Delete is an update, not `DELETE FROM`: set `delete_flag = 1`, set `updated_by`, rely on/update `updated_at`.
- List/search/detail must exclude deleted records.

## 7. API Contract Impact

| endpoint | method | response | status / error |
|---|---|---|---|
| `/api/v1/roles` | GET | raw `RoleDto[]` | 200 or `ErrorResponse` |
| `/api/v1/roles/{roleId}` | GET | `RoleDto` detail | 200, 404, 403 |
| `/api/v1/roles` | POST | created role DTO | 201 expected unless source convention decides 200 |
| `/api/v1/roles/{roleId}` | PUT | updated role DTO | 200 |
| `/api/v1/roles/{roleId}/delete` | PUT | message body with `Đã xóa role thành công!` | 200 |

No pagination wrapper, no `totalCount`, no permission fields, no restore endpoint. Logical delete uses PUT, not HTTP DELETE.

## 8. DTO / Schema / Validation Impact

| item | impact |
|---|---|
| FE role DTO typing | Add `RoleDto` and avoid conflict with auth `Role` |
| `roleId` | UUID string from `role_id` |
| `roleName` | Trimmed, required, case-insensitive duplicate check against active rows only |
| `description` | Trimmed; empty string remains empty string |
| `createdAt` / `updatedAt` | TIMESTAMPTZ-derived serialized values; FE displays `DD/MM/YYYY HH:mm:ss` |
| duplicate error | HTTP 400 `ErrorResponse` |

## 9. DB / Migration Impact

- `tbl_dim_role` exists in V4 with `role_id UUID`, `role_name VARCHAR(100) UNIQUE`, `description TEXT`, audit columns.
- `updated_at` trigger exists for `tbl_dim_role`.
- Many tables reference `tbl_dim_role.role_id`; logical delete avoids FK breakage.
- Source search did not find `delete_flag` on V4 `tbl_dim_role`.
- `V90__alter_tbl_role_for_management.sql` exists but is empty.
- Phase 3 implementation must resolve the DB alignment before coding delete/list filtering:
  - add `delete_flag` via new/approved migration, or
  - confirm an existing migration/source not yet read provides it.
- Case-insensitive uniqueness may need BE query checks and possibly a DB index/constraint migration.

## 10. Batch / Job / Event Impact

No batch/job/event impact found from current architecture/source review. Recheck only if Phase 3 discovers a job/event consumer of `tbl_dim_role`.

## 11. Test Impact

- BE service tests: trim, blank, max length, duplicate HTTP 400 path, not-found, authorization matrix, logical delete.
- BE web/integration tests: endpoints, `ErrorResponse`, status codes, current-user roles.
- BE mapper/integration tests: active list excludes deleted, delete sets `delete_flag`, audit fields update, FK references remain.
- FE component/API tests: list load, raw list client pagination, role-based action visibility, create/update/delete flows, error display.
- Contract tests: `RoleDto[]`, no pagination wrapper, no `totalCount`, duplicate 400 ignoring deleted rows, delete 200 `RoleDto`, timestamp fields.
- E2E/smoke tests only if existing auth/test user strategy supports role switching.

## 12. Operation / Monitoring Impact

- Use existing SLF4J and traceId conventions.
- No secrets, credentials, PII, or raw production logs in docs/tests.
- No new operational job or monitoring surface is required.
- Errors must not leak stack traces; use `traceId` correlation.

## 13. Rollout / Rollback Impact

- Feature is additive at API/UI layer.
- Any DB migration must be forward-safe and documented before implementation.
- Rollback of code should remove new FE/BE ROLE sources.
- Rollback of DB changes must preserve existing `tbl_dim_role` rows and FK references.
- No rollback path may physically delete role records.

## 14. No-Impact Areas With Evidence

| area | judgment | evidence |
|---|---|---|
| Permission-based RBAC | No impact | Explicitly out of scope |
| Restore API/UI | No impact | Accepted decision removed restore from ticket |
| Role seed data | No impact | Seed creation out of scope |
| CI/settings | No impact | User prohibited changes; no need found |
| Batch/job/event | No impact found | Architecture/source search found no ROLE job surface |
| Existing Organization behavior | No behavior change intended | Used only as implementation pattern |
| Production logs/secrets | No impact | Excluded from reading/writing |

## 15. Stop / Ask Conditions

| ID | condition | action |
|---|---|---|
| IA-ROLE-001 | `delete_flag` remains missing from DB schema/migration | Stop implementation; confirm migration plan |
| IA-ROLE-002 | Route implementation attempts to edit only `router.tsx` while runtime still uses `App.tsx` routes | Stop route edit; implement in `App.tsx` or first approve a routing migration |
| IA-ROLE-003 | Error convention cannot produce duplicate HTTP 400 `ErrorResponse` | Stop; confirm exception mapping |
| IA-ROLE-004 | Case-insensitive uniqueness requires DB change but migration policy is unclear | Stop; ask Tech Lead/DB owner |
| IA-ROLE-005 | Requirement reintroduces restore or permission-based RBAC | Stop; out of scope |

## 16. Phase 3 Gate Judgment

| gate | status | reason |
|---|---|---|
| Artifact completion | PASS after this file and `impl-plan.md` are updated | Required Phase 3 artifacts exist |
| Implementation readiness | NEEDS SOURCE/DB ALIGNMENT | `delete_flag` is accepted but not present in V4; V90 is empty |
| Human decision blocker | None currently recorded | Remaining items are implementation/source verification |
