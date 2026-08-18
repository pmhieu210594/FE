# Implementation Plan - ROLE Phase 3

**Ticket ID**: ROLE  
**Feature**: CRUD Role Management  
**Phase**: Phase 3 - Impact Analysis / Impl Plan  
**Updated**: 2026-06-12  
**Status**: Executable plan draft; DB Stop/Ask before code implementation

## 1. Principle

- Follow the existing FE API wrapper and BE Spring REST/service/port/adapter/MyBatis layering.
- Implement role-based authorization only.
- Do not add permission fields, permission APIs, permission tables, permission checkboxes, or restore behavior.
- Use logical delete only; never physically delete from `tbl_dim_role`.
- Keep implementation in small, reviewable steps with tests per step.

## 2. Alternatives and Decision

| alternative | decision | reason |
|---|---|---|
| Server-side pagination | Rejected for this ticket | Accepted contract says BE returns raw list; FE paginates |
| FE-side pagination over raw list | Selected | Matches accepted Pack 26 decision |
| Physical hard delete | Rejected | FK risk and accepted logical delete decision |
| Logical delete | Selected | Preserves FK references |
| FE DTO named `Role` | Rejected | Conflicts with auth `Role` enum |
| FE DTO named `RoleDto` | Selected | Accepted naming decision |
| Permission-based RBAC | Rejected | Out of scope |

## 3. Implementation Steps

| step | action | target area | verification | stop condition |
|---|---|---|---|---|
| 1 | Confirm DB alignment | Migration/schema | Verify `delete_flag`, `updated_at`, `updated_by` | `delete_flag` missing without approved migration |
| 2 | Add BE role model/DTO/port/mapper/adapter | BE domain/web/persistence | Compile + mapper tests | Layer rule violation |
| 3 | Add RoleService rules | BE application | Unit tests for validation/auth/duplicate/delete | Error/status cannot match spec |
| 4 | Add RoleController | BE web | Web/integration tests for endpoints/status/body | Contract drift from Pack 26 |
| 5 | Add FE `RoleDto` typing and endpoint helpers | FE API layer | API helper tests/mocks | Direct `fetch` needed |
| 6 | Add `/roles` route | FE routing/layout | Route smoke/component test | Route edit targets a non-mounted router source |
| 7 | Add Role page UI | FE page/components | Component tests for list/dialog/actions | UI needs out-of-scope permission/restore |
| 8 | Add i18n and timestamp display | FE locale/utils/page | Date/i18n tests | Missing locale convention |
| 9 | Add contract and regression tests | FE/BE tests | Contract scenarios pass | Critical test infra unavailable |
| 10 | Record results | SDD artifacts | `test-results.md` updated after tests | Required tests skipped without reason |

## 4. BE Implementation Details

- Add REST endpoints under `/api/v1/roles`.
- Use current-user injection with `@CurrentUser`.
- Enforce authorization matrix in service or a shared helper:
  - view: `ADMIN`, `EDITOR`, `VIEWER`
  - create/update: `ADMIN`, `EDITOR`
  - delete: `ADMIN`
- Normalize `roleName` by trim; reject blank.
- Normalize `description` by trim; keep empty string as empty string.
- Check duplicate `roleName` case-insensitively among active roles, excluding self on update.
- Duplicate should throw an exception path mapped to HTTP 400 `ErrorResponse`.
- Delete endpoint should be `PUT /api/v1/roles/{roleId}/delete`; BE controller should use `@PutMapping("/{id}/delete")`.
- Delete should update `delete_flag = 1` and `updated_by`; `updated_at` may be set explicitly or by existing trigger, but test must prove it changes.
- List/detail/search should exclude `delete_flag = 1`.
- Do not add restore endpoints.

## 5. FE Implementation Details

- Add `RoleDto` type in the FE API/types area.
- Add role endpoint helpers through `src/lib/api.ts`.
- Logical delete helper must use `api.put`, not `api.del`, because the accepted endpoint method is PUT.
- Use `/roles` route in `App.tsx`, because current source mounts `HashRouter` in `main.tsx` and defines runtime routes in `App.tsx`.
- Use existing Role auth enum only for current-user authorization checks; do not reuse it as role DTO.
- Use existing UI components for table/search/pagination/form/buttons where compatible.
- Paginate the raw list client-side and compute total from `rawList.length`.
- Show create/update/delete controls according to the current user's role.
- Hide disallowed controls for UX, but rely on BE for enforcement.
- Format `createdAt` and `updatedAt` as `DD/MM/YYYY HH:mm:ss`.

## 6. DB / Migration Plan

Implementation must start here:

1. Confirm whether `delete_flag` exists in the actual target database schema outside V4.
2. If not present, create an approved Flyway migration for `tbl_dim_role.delete_flag`.
3. Confirm default value and not-null policy for `delete_flag`.
4. Confirm whether case-insensitive uniqueness is enforced by BE only or backed by DB index/constraint.
5. Do not modify old committed migrations.
6. Do not use cascade delete or physical delete.

Current source finding:

- V4 `tbl_dim_role` has `updated_at` and `updated_by`.
- V4 `tbl_dim_role` does not show `delete_flag`.
- V90 role management migration exists but is empty.

## 7. Verification By Step

| step | minimum checks |
|---|---|
| DB alignment | Migration review or DB integration test confirms `delete_flag` behavior |
| BE model/mapper | Mapper test can insert/find/update logical delete fields |
| BE service | Unit tests cover role matrix, trim, duplicate 400 path, logical delete |
| BE controller | Integration tests cover status codes, `ErrorResponse`, delete 200 `RoleDto` |
| FE API | Mocked helper tests cover raw list and errors |
| FE UI | Component tests cover list/search/client pagination/dialog/action visibility |
| Timestamp | FE test confirms `DD/MM/YYYY HH:mm:ss` display |
| Contract | No `totalCount`/pagination wrapper; no restore; no permission fields |

## 8. Rollback

- Revert added FE role page/route/API/type/i18n changes.
- Revert added BE role controller/service/port/adapter/mapper/model/DTO changes.
- If a migration is added, provide a rollback note that preserves existing rows and FK references.
- Never rollback by hard-deleting `tbl_dim_role` records.

## 9. AC Mapping

| AC range | implementation focus | verification |
|---|---|---|
| AC-1, AC-2 | List/detail and denied view | FE + BE auth tests |
| AC-3..AC-7 | Create/update validation and duplicate | Service/web/FE tests |
| AC-8..AC-11 | Logical delete and unauthorized mutations | BE integration + DB tests |
| AC-12..AC-14 | Search/sort/client pagination | FE + contract tests |
| AC-15..AC-20 | UI screen/dialog/actions | FE component tests |
| AC-21 | Timestamp display | FE utility/component + contract tests |
| AC-22 if present | i18n/copy | FE i18n review/tests |

## 10. Stop / Ask Conditions

- Stop if `delete_flag` is not available and no migration approval exists.
- Stop if implementation requires restore.
- Stop if implementation requires permission-based RBAC.
- Stop if implementation attempts to add the ROLE route only in `router.tsx` while `main.tsx` still renders `App.tsx` routes.
- Stop if duplicate HTTP 400 cannot be represented via existing `ErrorResponse` convention.
- Stop if case-insensitive uniqueness needs DB constraint/index work without DB owner approval.
- Stop if `VIEW` is discovered to be a distinct role from `VIEWER`.

## 11. Do Not Do

- Do not create role seed data.
- Do not update living docs directly.
- Do not read or write secrets, credentials, `.env*`, or production logs.
- Do not introduce direct `fetch` calls outside the FE API layer.
- Do not add server-side pagination wrapper or `totalCount`.
- Do not implement restore.
- Do not add permission fields/API/DB/UI mapping.
