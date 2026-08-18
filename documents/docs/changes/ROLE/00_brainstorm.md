# 00 Brainstorm

**Ticket ID**: ROLE  
**Phase**: Phase 1 - Investigation / Spec Pack  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  
**Status**: Draft / Investigation Notes

## Purpose

Collect investigation findings, conflicts, risks, and questions before freezing ROLE behavior in `spec-pack.md`.
This file is not an implementation plan and must not override `spec-pack.md`.

## Known Information

### Source-Verified Facts

1. FE and BE are separate repositories in the same workspace.
2. Canonical ROLE artifacts are in `EDCAP_BE/documents/docs/changes/ROLE/`.
3. FE API wrapper sends `credentials: "include"` and throws `ApiError` on non-2xx.
4. Current FE `User.role` is `"VIEWER" | "EDITOR" | "ADMIN"`.
5. Current FE layout only shows the Admin nav item when `user.role === "ADMIN"`.
6. BE security uses OAuth2 session cookies; most `/api/**` routes require authentication.
7. Current BE domain user role enum is `VIEWER`, `EDITOR`, `ADMIN`.
8. Current BE `AdminController` uses an inline ADMIN check for one mutation endpoint.
9. V4 migration creates `tbl_dim_role`, not `dim_role`.
10. `tbl_dim_role.role_id` is `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
11. `tbl_dim_role.role_name` is `VARCHAR(100) NOT NULL UNIQUE`.
12. `tbl_dim_role` has `description`, `created_at`, `created_by`, `updated_at`, `updated_by`.
13. V4 migration seeds `PM`, `DEV`, `QA`, `ADMIN`.
14. V4 RBAC tables include `tbl_auth_permission`, `tbl_auth_role_permission`, `tbl_auth_member_project_role`, and `tbl_auth_member_access_scope`.
15. Architecture docs state no Java mappers/adapters exist for V4 tables yet.
16. Standards say errors should use `ErrorResponse`; source `ErrorResponse` has `timestamp`, `status`, `error`, `message`, `traceId`.

### Raw Input Claims

1. Feature name is CRUD Role Management.
2. Raw input table name is `dim_role`.
3. Raw input role examples are `PO`, `PM`, `Engineer`, `QA`, `Security`.
4. Raw input proposes permissions `role.view`, `role.create`, `role.update`, `role.delete`.
5. Raw input requires backend RBAC enforcement, not FE-only hiding.
6. Raw input asks AI/humans to confirm delete behavior for roles assigned to users.

## Conflicts / Tensions

| ID | conflict | source A | source B | impact |
|---|---|---|---|---|
| C-ROLE-001 | Table name mismatch | Raw input: `dim_role` | Migration: `tbl_dim_role` | Blocks DB/API naming unless resolved |
| C-ROLE-002 | Seed role mismatch | Raw input: `PO`, `PM`, `Engineer`, `QA`, `Security` | Migration: `PM`, `DEV`, `QA`, `ADMIN` | Blocks seed/data expectation |
| C-ROLE-003 | Authorization model mismatch | Raw input: permission codes | Current app: `AppUser.Role` enum + ADMIN checks | Blocks RBAC design |
| C-ROLE-004 | Error shape mismatch | Standards mention `errorCode` | Source `ErrorResponse` has no `errorCode` | Blocks exact contract wording |
| C-ROLE-005 | V4 schema vs Java access | V4 tables exist | No V4 mapper/adapter exists | Blocks implementation path |
| C-ROLE-006 | Delete expectation unclear | CRUD requires delete | `tbl_dim_role` has many FK references | Blocks delete behavior |

## Undetermined Points

| ID | point | type | current handling |
|---|---|---|---|
| U-ROLE-001 | Canonical table/resource name | Human Decision Required | Keep as Open Issue |
| U-ROLE-002 | RBAC model for Phase 3 | Human Decision Required | Keep as Stop/Ask |
| U-ROLE-003 | Permission names | Human Decision Required | Keep as Stop/Ask |
| U-ROLE-004 | Delete policy for referenced roles | Human Decision Required | Keep as Stop/Ask |
| U-ROLE-005 | Seed policy | Human Decision Required | Keep as Open Issue |
| U-ROLE-006 | Case sensitivity for role name uniqueness | Human Decision Required | Keep as Open Issue |
| U-ROLE-007 | API response/error shape after source/standard mismatch | Human Decision Required | Keep as Open Issue |
| U-ROLE-008 | Whether search/sort/pagination is required for v1 | Human Decision Required | Keep as Open Issue |

## Expected Risks

| ID | risk | severity | why |
|---|---|---|---|
| R-ROLE-001 | Implementing against `dim_role` instead of `tbl_dim_role` | Major | Source schema uses `tbl_dim_role` |
| R-ROLE-002 | Treating FE button hiding as authorization | Major | Security requires backend enforcement |
| R-ROLE-003 | Deleting referenced roles | Major | Multiple V4 tables reference `tbl_dim_role` |
| R-ROLE-004 | Adding APIs with wrong error shape | Medium | Standards/source mismatch |
| R-ROLE-005 | Building mapper/service against V4 without deciding integration with V1 auth | Major | V1 `app_user.role` and V4 RBAC are disconnected |
| R-ROLE-006 | Adding tests that pass without checking meaningful behavior | Medium | FE currently has no unit tests and minimal E2E |

## What AI Needs to Investigate

1. Whether V4 tables are intended for active application features or future warehouse schema only.
2. Whether any permission-code enforcement exists outside the searched source slices.
3. Existing route/menu pattern for adding a Role Management page.
4. Existing mapper style for UUID IDs if any.
5. Current OpenAPI generation availability if contract tests are planned.
6. Exact source behavior of DB constraints and FK delete behavior before implementation.

## What Humans Need to Ask

1. Should Phase 3 implement against `tbl_dim_role`?
2. Should role CRUD be ADMIN-only for now, or use `role.*` permission-code RBAC?
3. Should permission codes be seeded and assigned in `tbl_auth_permission` / `tbl_auth_role_permission`?
4. Should deleting a referenced role be rejected with 409, converted to soft delete, or disallowed entirely in v1?
5. Should initial seed roles be changed, extended, or left as-is?
6. Should `Engineer` map to existing `DEV`, or are they separate roles?
7. Should ROLE list include pagination/search/sort in v1?

## Conditions Under Which Implementation Is Not Permitted

1. Canonical table/resource name remains undecided.
2. RBAC model remains undecided.
3. Delete policy for referenced roles remains undecided.
4. API request/response/error contract remains unapproved.
5. Seed role conflict remains unresolved if implementation includes data migration.
6. `spec-pack.md` remains unapproved by human owner.
