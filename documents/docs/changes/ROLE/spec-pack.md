# Spec Pack

**Ticket ID**: ROLE  
**Feature**: CRUD Role Management  
**Phase**: Phase 1 - Investigation / Spec Pack  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-12  
**Status**: Canonical Draft / Pack 26 Decisions Applied / Phase 3 Planning Allowed  
**Canonical location**: `EDCAP_BE/documents/docs/changes/ROLE/spec-pack.md`

## 1. Context / Purpose

ROLE covers CRUD Role Management for roles used by RBAC.
The feature includes a frontend management screen, backend APIs, persistence in `tbl_dim_role`, backend role-based authorization enforcement, frontend role-based display control, and tests in later phases.

This file is the canonical Phase 1 specification draft after Human Decisions dated 2026-06-11.
Implementation is not permitted from this file alone because Pack 26 A-6 is still required for FE/BE contract and impact analysis.

## 2. Scope

### 2.1. In Scope

1. List roles from `tbl_dim_role`.
2. View role detail.
3. Create role with `role_name` and `description`.
4. Update role `role_name` and `description`.
5. Delete role by logical delete.
6. Validate role input on FE and BE.
7. Enforce backend authorization per API/action.
8. Control FE screen/button visibility by role.
9. Support search, sort, and FE-side pagination on the role list.
10. Add tests for FE, BE, API contract, DB behavior, and RBAC behavior in later phases.

### 2.2. Out of Scope

1. User management.
2. Assigning roles to users.
3. General authorization-code management.
4. Import/export.
5. Advanced audit log beyond existing audit columns.
6. New seed data for ROLE.
7. Living-doc updates; candidates go to `promotion-candidates.md`.
8. CI/settings changes.
9. Source code, migration, controller, service, UI, or test implementation in this artifact update step.
10. Physical hard delete and cascade delete for roles.
11. Restoring deleted Role in this ticket.

## 3. Terminology

| term | meaning | notes |
|---|---|---|
| Role | Named access role | Stored in `tbl_dim_role` |
| `tbl_dim_role` | Official ROLE table | Human Decision 2026-06-11 |
| `dim_role` | Superseded draft table name | Present in older raw input only; not the current specification |
| RBAC | Role-Based Access Control | User has role; role determines allowed actions |
| Role-based authorization | Authorization model where allowed actions are determined from the authenticated user's role | Matrix accepted for `ADMIN`, `EDITOR`, `VIEWER` |
| Logical delete | Non-physical delete | Delete updates `delete_flag = 1`, `updated_at`, and `updated_by`; FK references are preserved |
| Restore | Undo logical delete | Out of scope for this ticket |
| Hard delete | Physical delete | Superseded by `HD-ROLE-DELETE-001`; out of scope |

## 4. As-Is

1. Authentication uses Spring Security OAuth2 session cookies.
2. FE API calls use `credentials: "include"` through `EDCAP_FE/src/lib/api.ts`.
3. FE current user type has role enum `"VIEWER" | "EDITOR" | "ADMIN"`.
4. BE domain `AppUser.Role` has `VIEWER`, `EDITOR`, `ADMIN`.
5. Existing admin mutation uses inline ADMIN check in `AdminController`.
6. V4 DB migration creates `tbl_dim_role` and RBAC-related tables.
7. Architecture docs state V4 tables do not yet have Java mappers/adapters.
8. No Role CRUD controller/service/mapper was found in the source slices read.
9. No FE unit/component tests and no FE/BE contract tests were found.

## 5. To-Be

The system provides Role Management based on `tbl_dim_role`.
Users have roles; roles determine allowed actions.
FE uses role-based authorization to show or hide the Role Management screen and action buttons.
BE enforces authorization for each API/action using the authenticated user's role.
Role list supports search, sort, and FE-side pagination over a raw list returned by BE.

## 6. Detailed Specification

### 6.1. Database Specification

Official table: `tbl_dim_role`.

`dim_role` from earlier requirement drafts is superseded and kept only for traceability.

| column | specification | status |
|---|---|---|
| `role_id` | Role identifier | Source shows `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `role_name` | Role display/name key | Source shows `VARCHAR(100) NOT NULL UNIQUE`; spec requires trim + case-insensitive duplicate check against active rows only (`delete_flag != 1`) |
| `description` | Role description | In scope; source shows `TEXT`; type/length/nullable/default must be confirmed in Pack 26 / Phase 3 source analysis |
| `delete_flag` | Logical delete marker | Accepted; delete sets `1`; restore is out of scope for this ticket |

Source-observed supporting columns:

| column | source-observed behavior | notes |
|---|---|---|
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Audit column |
| `created_by` | `VARCHAR(100) NOT NULL DEFAULT 'SYSTEM'` | Audit column |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Maintained by trigger |
| `updated_by` | `VARCHAR(100) NOT NULL DEFAULT 'SYSTEM'` | Audit column |

Accepted logical delete decision uses `delete_flag`, `updated_at`, and `updated_by`.

API response timestamp fields approved by Human Decision:

| API field | display rule | status |
|---|---|---|
| `createdAt` | BE serializes from DB `TIMESTAMPTZ`; FE displays as `DD/MM/YYYY HH:mm:ss`; value always exists | Approved |
| `updatedAt` | BE serializes from DB `TIMESTAMPTZ`; FE displays as `DD/MM/YYYY HH:mm:ss`; value always exists | Approved |

### 6.2. RBAC Specification

Approved model:

1. User has role.
2. Role determines allowed actions.
3. FE controls screen/button visibility by role.
4. BE enforces authorization for every API/action.
5. FE display control must never be treated as sufficient security.

Separate action authorization labels are not used in the current ROLE specification.

Accepted role authorization matrix:

| role | view | create | update | delete |
|---|---|---|---|---|
| `ADMIN` | yes | yes | yes | yes |
| `EDITOR` | yes | yes | yes | no |
| `VIEWER` | yes | no | no | no |

Source uses `AppUser.Role VIEWER/EDITOR/ADMIN`; implementation must enforce this matrix on BE and use it for FE display control.

### 6.3. Delete Policy

Accepted policy: logical delete. Restore is out of scope for this ticket.

1. Delete Role does not physically delete records from `tbl_dim_role`.
2. Delete updates `delete_flag = 1`.
3. Delete updates `updated_at` and `updated_by`.
4. List/search/query APIs exclude records where `delete_flag = 1` unless explicitly specified otherwise.
5. Duplicate-check candidates for create/update exclude rows where `delete_flag = 1`.
6. Existing FK references to `tbl_dim_role.role_id` must be preserved.
7. Physical hard delete, cascade delete, and restore are out of scope.

Stop/Ask before implementation:

1. Do not implement restore in this ticket.
2. Do not implement physical delete or cascade delete.
3. Do not bypass DB constraints or rewrite referenced data as part of delete.

### 6.4. Seed Policy

No new seed data is in scope for ROLE.
The list screen displays roles already present in the DB.

Reference/expected existing role names only:

```text
PO
PM
Engineer
QA
Security
```

Source-observed existing seed data includes:

```text
PM
DEV
QA
ADMIN
```

This source/expectation difference does not require a migration in this ticket.

### 6.5. List Screen Requirement

Role list must support:

1. FE-side pagination.
2. Search.
3. Sort.

Minimum search field:

```text
role_name
```

Minimum sort field:

```text
role_name
```

Accepted list response and pagination policy:

1. BE returns a raw list/array directly.
2. BE does not implement server-side pagination for this API in the current ticket.
3. FE receives the full raw list and performs pagination client-side.
4. FE computes total count from `rawList.length`.
5. BE response does not include `totalCount`, `totalPages`, `page`, or `size`.
6. No `page`, `size`, or sort query parameters are added only for pagination in this scope.

Deferred to Phase 3 source analysis:

1. FE default page size and page origin.
2. Whether `description` is searchable.
3. Whether sorting also supports `role_id`, `createdAt`, `updatedAt`, or other fields.

Official FE route:

```text
/roles
```

### 6.6. Business Rules

| ID | rule | status |
|---|---|---|
| BR-ROLE-001 | User must be authenticated before accessing role APIs | Approved |
| BR-ROLE-002 | `ADMIN`, `EDITOR`, and `VIEWER` can view list/detail | Approved |
| BR-ROLE-003 | `ADMIN` and `EDITOR` can create | Approved |
| BR-ROLE-004 | `ADMIN` and `EDITOR` can update | Approved |
| BR-ROLE-005 | Only `ADMIN` can delete | Approved |
| BR-ROLE-006 | FE action visibility is controlled by role | Approved |
| BR-ROLE-007 | BE authorization is enforced per API/action | Approved |
| BR-ROLE-008 | `role_name` is required for create/update | Approved |
| BR-ROLE-009 | `role_name` is trimmed before validation/persistence | Approved |
| BR-ROLE-010 | `role_name` must not be empty or whitespace-only after trim | Approved |
| BR-ROLE-011 | `role_name` duplicate check is case-insensitive after trim and only considers active rows (`delete_flag != 1`) | Approved |
| BR-ROLE-012 | `PM` and `pm` are duplicates when the compared existing row is active | Approved |
| BR-ROLE-013 | No seed data is created by this ticket | Approved |
| BR-ROLE-014 | Delete is logical delete: set `delete_flag = 1` and update `updated_at` / `updated_by` | Approved |
| BR-ROLE-015 | Restore is out of scope for this ticket | Approved |
| BR-ROLE-016 | List/search/query APIs exclude `delete_flag = 1` by default | Approved by `HD-ROLE-DELETE-001` |

### 6.7. Input

| item | type | required | validation | status |
|---|---|---|---|---|
| `role_id` | UUID | path param for detail/update/delete | Must parse as UUID and exist | Source-aligned |
| `role_name` | string | yes for create/update | trim, non-blank, max 100 if source constraint remains, case-insensitive unique among active rows (`delete_flag != 1`) | Approved |
| `description` | string | no | Trim before persistence; empty string after trim is allowed and stored as empty string | Approved |
| search query | string | optional | Minimum search target is `role_name` | Approved minimum |
| sort field | string | optional | Minimum supported field is `role_name` | Approved minimum |

### 6.8. Output / Contract Candidate

Candidate API shape for Pack 26 validation:

| API | method/path | authorization | success response | notes |
|---|---|---|---|---|
| List roles | `GET /api/v1/roles` | `ADMIN`, `EDITOR`, `VIEWER` | Raw `RoleDto[]` | BE returns raw list; FE handles pagination; no total count fields |
| Get role | `GET /api/v1/roles/{role_id}` | Role allowed to view roles | `RoleDto` | UUID path |
| Create role | `POST /api/v1/roles` | `ADMIN`, `EDITOR` | `RoleDto` | Request includes `roleName`, `description` |
| Update role | `PUT /api/v1/roles/{role_id}` | `ADMIN`, `EDITOR` | `RoleDto` | Request includes `roleName`, `description` |
| Delete role | `PUT /api/v1/roles/{role_id}/delete` | `ADMIN` | `RoleDto` | Logical delete endpoint: set `delete_flag = 1`, update `updated_at` / `updated_by`, and return the updated role |

Candidate `RoleDto` fields for Pack 26 validation:

| field | type | source/spec basis |
|---|---|---|
| `roleId` | string UUID | `tbl_dim_role.role_id` |
| `roleName` | string | `tbl_dim_role.role_name` |
| `description` | string | `tbl_dim_role.description`, trim and preserve empty string |
| `createdAt` | TIMESTAMPTZ-derived serialized value | Human Decision says field exists and FE displays `DD/MM/YYYY HH:mm:ss` |
| `updatedAt` | TIMESTAMPTZ-derived serialized value | Human Decision says field exists and FE displays `DD/MM/YYYY HH:mm:ss` |

FE DTO/list item naming is `RoleDto`.

### 6.9. Error Handling

ROLE must follow existing project error conventions.
This spec does not introduce a new error format.

Pack 26 / source analysis must confirm exact response body and status mapping for:

1. 400 validation error.
2. 401 unauthenticated.
3. 403 unauthorized.
4. 404 role not found.
5. Duplicate `role_name`: HTTP 400 with `ErrorResponse`.
6. Delete target already logically deleted or otherwise not available by project convention.

### 6.10. Boundary Values

| item | boundary | expected |
|---|---|---|
| `role_name` empty | `""` | Reject |
| `role_name` whitespace | `"   "` | Trim then reject |
| `role_name` leading/trailing spaces | `"  QA  "` | Treat as `"QA"` |
| `role_name` length 100 | exactly 100 chars | Accept if source constraint remains and unique |
| `role_name` length 101 | 101 chars | Reject if source max remains 100 |
| duplicate exact role name | existing active exact value | Reject with HTTP 400 `ErrorResponse` |
| duplicate case variant | `pm` when active `PM` exists | Reject with HTTP 400 `ErrorResponse` |
| duplicate against logically deleted role | active input matches row with `delete_flag = 1` | Allow; logically deleted rows are excluded from duplicate-check candidate set |
| `role_id` invalid UUID | non-UUID string | Reject by project convention |
| `role_id` not found | valid UUID absent | Not found by project convention |

### 6.11. Non-functional

| item | requirement | verification |
|---|---|---|
| Security | Backend enforces role-based authorization for every action | BE security/API tests |
| Privacy | No secrets, credentials, raw production logs, or PII in artifacts | Review |
| API compatibility | Follow existing project convention; finalize in Pack 26 | Contract review/tests |
| DB safety | Do not edit committed migrations in this step | Review |
| Maintainability | Follow hexagonal backend layers and FE API/hook patterns | ArchUnit/code review |
| Testability | AC maps to FE/BE/API/DB/RBAC tests | Test plan |
| Observability | Errors do not expose stack traces or SQL/internal class details | Error tests/review |

### 6.12. UI Wireframe Interpretation

Reference source: `02_reference-extracts.md`.
The wireframe is human-authored draft input, not canonical specification by itself.
Only the items below are promoted into this spec.

Promoted UI requirements:

1. Role Management has a list screen.
2. The list screen provides search by `role_name`.
3. The list screen provides pagination.
4. The list screen provides a table with role name and action controls.
5. The list screen provides an entry point to open a create role dialog.
6. The create role dialog contains `role_name` and description inputs plus create and close/cancel controls.
7. Action controls include view detail, edit/update, and delete.
8. View detail and edit/update use a dialog-style UI.
9. The detail/edit dialog contains `role_name` and `description`.
10. Delete uses a confirmation dialog before executing the delete action.
11. Delete confirmation displays the target `role_name` and explains the delete action according to the final UI copy.
12. Role Management route is `/roles`.
13. Timestamp display uses API fields `createdAt` and `updatedAt`, formatted as `DD/MM/YYYY HH:mm:ss` in the user's local timezone.
14. `updatedAt` is always present in API response and display data.

Reference-only wireframe details not promoted as final specification:

1. Exact visual layout, ASCII positioning, and color treatment.
2. Example role rows and dates.
3. Exact final translated wording if it differs from existing FE i18n convention.
4. Exact field names `create_day`, `update_day`, and `descript`; canonical source/spec terms remain `createdAt`, `updatedAt`, and `description`.
5. Exact create dialog visual layout and final copy.

### 6.13. UI Labels / i18n Mapping Candidate

FE i18n source uses `react-i18next`, namespace `locale`, and nested JSON keys such as `Layout.*` and `Pages.Admin.*`.
ROLE should follow the same pattern and add keys under `Pages.RoleManagement.*` during implementation, unless Pack 26 / FE source analysis finds a stronger convention.

Wireframe labels/copy to map:

| wireframe label/copy | proposed i18n key | note |
|---|---|---|
| Role Management screen title | `Pages.RoleManagement.title` | Route `/roles` |
| Search placeholder by role name | `Pages.RoleManagement.searchPlaceholder` | From wireframe search box |
| Search button | `Pages.RoleManagement.search` | Draft copy from wireframe |
| Add role button | `Pages.RoleManagement.addRole` | Opens create dialog |
| Role name column/field | `Pages.RoleManagement.roleName` | Maps to canonical `roleName` / `role_name` |
| Created date column/field | `Pages.RoleManagement.createdAt` | Displays `createdAt` as `DD/MM/YYYY HH:mm:ss` |
| Updated date field | `Pages.RoleManagement.updatedAt` | Displays `updatedAt` as `DD/MM/YYYY HH:mm:ss` |
| Action column | `Pages.RoleManagement.action` | List row actions |
| View detail action | `Pages.RoleManagement.viewDetail` | Opens detail dialog |
| Edit action | `Pages.RoleManagement.edit` | Opens edit dialog |
| Delete action | `Pages.RoleManagement.delete` | Opens delete confirmation |
| Create dialog title | `Pages.RoleManagement.createTitle` | From create dialog |
| Detail dialog title | `Pages.RoleManagement.detailTitle` | From detail dialog |
| Delete confirmation title | `Pages.RoleManagement.deleteConfirmTitle` | From delete dialog |
| Delete warning copy | `Pages.RoleManagement.deleteWarning` | Must include target role context |
| Create submit button | `Pages.RoleManagement.create` | Submit create |
| Update submit button | `Pages.RoleManagement.update` | Submit update |
| Close button | `Pages.RoleManagement.close` | Dialog close |
| Cancel button | `Pages.RoleManagement.cancel` | Delete cancel |

Final localized wording is deferred to Phase 3 implementation review if FE owners require copy changes beyond the wireframe draft.

## 7. Acceptance Criteria

| ACID | Given | When | Then | Coverage |
|---|---|---|---|---|
| AC-1 | Authenticated `ADMIN`, `EDITOR`, or `VIEWER` | Opens `/roles` | Raw role list is loaded from `tbl_dim_role`; FE paginates the raw list and displays role name and description | FE/API/BE/DB/RBAC |
| AC-2 | Authenticated user does not have a role allowed to view roles | Opens screen or calls list/detail API | Access is denied by BE using `ErrorResponse` and role data is not exposed | FE/API/BE/RBAC |
| AC-3 | `ADMIN` or `EDITOR` submits valid unique role name after trim | Creates role | Role is persisted in `tbl_dim_role`; FE shows success per convention | FE/API/BE/DB/RBAC |
| AC-4 | `ADMIN` or `EDITOR` submits duplicate by case-insensitive check against an active role | Creates role with `pm` when active `PM` exists | Role is not created and duplicate error is HTTP 400 `ErrorResponse` | FE/API/BE/DB |
| AC-5 | `ADMIN` or `EDITOR` submits blank or whitespace role name | Submits form | Request is rejected before persistence | FE/API/BE |
| AC-6 | `ADMIN` or `EDITOR` updates an existing target role | Updates `role_name` or trimmed `description` | Role is updated; duplicate/name validation still applies; empty description is allowed after trim | FE/API/BE/DB/RBAC |
| AC-7 | `ADMIN` or `EDITOR` submits duplicate target name by case-insensitive check against another active role | Updates role | Role is not updated and duplicate error is HTTP 400 `ErrorResponse` | API/BE/DB |
| AC-8 | `ADMIN` targets an active role | Confirms delete | API returns updated `RoleDto`; `delete_flag` becomes `1`, `updated_at` and `updated_by` are updated, and the row is not physically deleted | FE/API/BE/DB/RBAC |
| AC-9 | A role has `delete_flag = 1` | List/search/query APIs or duplicate checks are performed | The logically deleted role is excluded from result sets and from duplicate-check candidate sets | API/BE/DB |
| AC-10 | `EDITOR` or `VIEWER` calls delete API directly | Calls API directly | BE rejects request with `ErrorResponse` and data remains unchanged | API/BE/RBAC/DB |
| AC-11 | `VIEWER` calls create/update API directly | Calls API directly | BE rejects request with `ErrorResponse` and data remains unchanged | API/BE/RBAC/DB |
| AC-12 | User searches by `role_name` | Enters search term | Result set is filtered by `role_name` according to approved contract and excludes `delete_flag = 1` | FE/API/BE/DB |
| AC-13 | User sorts by `role_name` | Changes sort | Result set order changes by `role_name` according to approved contract | FE/API/BE/DB |
| AC-14 | User changes FE pagination | Requests another page/size | FE slices the raw list client-side; BE response has no `totalCount`, `totalPages`, `page`, or `size` fields | FE/API/BE |
| AC-15 | `ADMIN`, `EDITOR`, or `VIEWER` opens Role Management | Opens screen | Role list screen shows search, table, FE pagination, and permitted action controls | FE/RBAC |
| AC-16 | User has a role allowed to view roles | Selects view detail for a role | Detail dialog opens and displays `role_name` and `description` | FE/API |
| AC-17 | `ADMIN` or `EDITOR` opens edit/update dialog | Opens edit/update dialog | Editable fields include `role_name` and `description`; update action is available | FE/API/RBAC |
| AC-18 | `ADMIN` selects delete for a role | Selects delete | Confirmation dialog appears before any delete API call | FE/RBAC |
| AC-19 | User confirms delete in confirmation dialog | Delete proceeds | Dialog includes target `role_name` and copy aligned with logical delete | FE/API |
| AC-20 | `ADMIN` or `EDITOR` and the Role Management list screen is displayed | Selects the create role entry point | Create dialog opens with `role_name` and description inputs plus create and close/cancel controls | FE/RBAC |
| AC-21 | API returns `createdAt` and `updatedAt` from DB `TIMESTAMPTZ` values | FE renders role timestamps | FE displays dates as `DD/MM/YYYY HH:mm:ss`; both values are present | FE/API |
| AC-22 | FE implements Role Management labels | FE renders list/dialog/delete UI | Labels use the existing i18n namespace pattern with ROLE keys mapped from the wireframe draft | FE/i18n |

## 8. Examples

### 8.1. Normal Cases

Existing/source examples:

```text
PM
QA
ADMIN
```

Reference/expected existing examples, not seed requirements:

```text
PO
PM
Engineer
QA
Security
```

### 8.2. Error Cases

```text
<empty>
"   "
"PM" when PM already exists
"pm" when PM already exists
invalid UUID path parameter
delete role referenced by active member/project/access-scope data
```

### 8.3. Boundary Cases

```text
" QA " -> validate/save as "QA"
100-character role name -> accept if source max remains 100 and unique
101-character role name -> reject if source max remains 100
"pm" when active "PM" exists -> reject as duplicate
"pm" when only logically deleted "PM" exists -> allow
description "  note  " -> trim to "note"
description "   " -> trim and store as empty string
```

## 9. Source Availability Summary

See `sources.md`.

Key Phase 1 availability:

1. Human Decisions dated 2026-06-11 are the source for closed product/spec blockers.
2. Raw ROLE input is read but contains superseded `dim_role` wording.
3. `.claude/rules/` is unavailable in workspace root.
4. FE API/auth/layout/admin source slices were read.
5. BE security/controller/DTO/user/error source slices were read.
6. V4 DB migration role/RBAC slices were read.
7. Architecture and standards docs were read narrowly.
8. No FE unit tests and no FE/BE contract tests were found.

## 10. Complexity Classification

```text
- Complexity: Complex
- System shape: FE+BE / API / DB / RBAC / Multi-repo
- Primary risk: Contract / DB / Security / Source integration / Test
- Review mode: Heavy
- Required options: Pack 26 FE/BE Contract and Impact Analysis, DB/Migration analysis, RBAC/Security review, Test/Contract coverage planning
```

## 11. FE/BE Contract Impact

1. FE must use role-based authorization for display control.
2. BE must enforce role-based authorization for API/action authorization.
3. API shape must be finalized in Pack 26 A-6.
4. FE wrapper uses session cookie and throws `ApiError` on non-2xx.
5. Role list requires pagination/search/sort.
6. Minimum search/sort field is `role_name`.
7. Exact error response shape follows current project convention and must be source-confirmed.
8. Current source role checks must be reviewed and mapped to the ROLE action matrix during Pack 26.
9. Wireframe-derived UI flows require contract confirmation for list, detail, create, update, and delete operations.
10. If created/updated timestamp fields are displayed, Pack 26 must confirm DTO field names and date serialization/display handling.
11. Route/menu placement is `/roles`.

Contract is ready to enter Pack 26 A-6.
Contract blockers from Pack 26 have been resolved by Human Decisions dated 2026-06-12 and later source-alignment decisions for role matrix, pagination/list response, delete response, ErrorResponse policy, timestamp behavior, description behavior, FE route placement, FE DTO naming, and mapper/adapter/entity planning. Later Phase 3 source review superseded the earlier `router.tsx` route-source decision: current runtime routing uses `main.tsx` + `App.tsx`.

## 12. DB/Migration Impact

`tbl_dim_role` already exists in V4 source.
No migration is created in this step.
No new seed data is in scope.

Pack 26 / Phase 3 must analyze:

1. Whether source `description TEXT` is the final required type.
2. DB default behavior for `description` if omitted.
3. Case-insensitive uniqueness strategy for `role_name`.
4. Logical delete columns: `delete_flag`, `updated_at`, `updated_by`.
5. Missing Java mapper/adapter/entity for V4 `tbl_dim_role`; this is Phase 3 implementation planning, not a business decision.
6. Whether existing RBAC tables affect role-based authorization for ROLE APIs.

## 13. Security/Privacy Impact

Approved security model:

1. Role-based RBAC.
2. FE display control by role.
3. BE authorization enforcement per API/action.

Security implementation notes for Phase 3:

1. Current source uses `AppUser.Role VIEWER/EDITOR/ADMIN`.
2. Existing admin flow contains inline ADMIN checks.
3. V4 RBAC tables exist, but this ticket uses role-based authorization only and does not add permission-based mapping.

No secrets, credentials, keys, `.env`, or raw production logs may be read or copied.

## 14. Operation/Maintenance Impact

No CI/settings/living-doc changes are part of this artifact update.
If implementation later adds migrations or RBAC data changes, rollback/data preservation notes are required.
Living-doc updates must remain candidates until human approval.

## 15. Test Strategy Summary

Required later-phase test scenarios:

1. BE service tests for create/update validation, trim, case-insensitive duplicate, not-found, and logical delete behavior.
2. BE web/security tests for role-based authorization on view, create, update, and delete actions.
3. BE mapper/integration tests for `tbl_dim_role`, `delete_flag`, audit updates, list/search exclusion, and FK preservation.
4. FE API wrapper/hook tests for list/create/update/delete and error handling.
5. FE page/component tests for loading, empty, error, role-gated actions, form validation.
6. Contract tests or source-verified snapshot tests for `RoleDto`, raw list response, search/sort, error response, and status codes.
7. E2E happy path only after auth/test-user strategy is approved.
8. FE component tests for list screen search/table/pagination/action controls.
9. FE component tests for detail/edit dialog and delete confirmation dialog.
10. FE tests must verify delete API is not called before confirmation.
14. Contract/API tests must verify delete returns `RoleDto` and does not physically remove the row.
11. FE component tests for create dialog opening and presence of `role_name`, description, create, and close/cancel controls.
12. FE component or utility tests for timestamp display as `DD/MM/YYYY HH:mm:ss` in user local timezone.
13. FE i18n tests or review checks for `Pages.RoleManagement.*` keys.

## 16. Phase 1 Gate Judgment

| item | judgment |
|---|---|
| Phase 1 Gate Status | PASS |
| Can proceed to Pack 26 A-6 | No |
| Can proceed to Phase 3 directly | Yes |
| Reason | Pack 26 blocker decisions have been accepted; remaining items are Phase 3 implementation details and tests |

## 17. Human Decisions

| ID | decision item | decision | owner/date | status |
|---|---|---|---|---|
| HD-ROLE-001 | Table name | Use `tbl_dim_role`; `dim_role` is superseded draft wording | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-002 | RBAC model | Use role-based RBAC | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-003 | Action authorization labels | Do not define separate action authorization labels in the ROLE specification | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-004 | Delete policy | Superseded by `HD-ROLE-DELETE-001`; previous hard-delete policy is no longer current | Human Owner / 2026-06-11 | Superseded |
| HD-ROLE-005 | Seed policy | No new seed in ROLE scope; display existing DB data only | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-006 | Error shape | Follow existing project convention | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-007 | Description | Include `description` in role specification | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-008 | Case sensitivity | Trim + case-insensitive duplicate check | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-009 | Pagination/search/sort | Required for role list | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-010 | Role Management route/menu placement | FE route is `/roles` | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-011 | Timestamp display | BE returns `createdAt` and `updatedAt`; FE displays `DD/MM/YYYY HH:mm:ss` in user local timezone; `updatedAt` always exists | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-012 | Create dialog fields | Wireframe defines create dialog with `role_name` and description fields; final copy/layout remains under HD-ROLE-013 and Phase 3 FE convention. | Human Owner / 2026-06-11 | Closed |
| HD-ROLE-013 | Wireframe labels/copy | Use wireframe label/copy inventory as source; FE convention is `react-i18next` namespace `locale`; proposed keys use `Pages.RoleManagement.*` | Human Owner / 2026-06-11 | Closed for Phase 1 |
| HD-ROLE-DELETE-001 | Delete behavior | Delete uses logical delete (`delete_flag = 1`); list/search/query and duplicate-check candidate sets exclude deleted rows; physical hard delete and cascade delete are out of scope; restore portion is superseded by `HD-ROLE-P26-002` | Human Owner / 2026-06-12 | Accepted / partially superseded |
| HD-ROLE-P26-001 | Role authorization matrix | `ADMIN`: view/create/update/delete; `EDITOR`: view/create/update; `VIEWER`: view only | Human Owner / 2026-06-12 | Accepted |
| HD-ROLE-P26-002 | Restore API contract | Restore is removed from this ticket scope | Human Owner / 2026-06-12 | Accepted |
| HD-ROLE-P26-003 | Logical delete columns | Use `delete_flag`, `updated_at`, `updated_by` | Human Owner / 2026-06-12 | Accepted |
| HD-ROLE-P26-004 | Pagination/list response | BE returns raw list; FE paginates client-side; no `totalCount` | Human Owner / 2026-06-12 | Accepted |
| HD-ROLE-P26-005 | Error response policy | ROLE APIs use standard `ErrorResponse`; duplicate role name returns HTTP 400 | Human Owner / 2026-06-12 | Accepted |
| HD-ROLE-P26-006 | Timestamp serialization/display | BE returns `createdAt`/`updatedAt` from DB `TIMESTAMPTZ`; FE displays `DD/MM/YYYY HH:mm:ss`; values always exist | Human Owner / 2026-06-12 | Accepted |
| HD-ROLE-P26-007 | Description behavior | Trim `description`; empty string after trim is stored as empty string | Human Owner / 2026-06-12 | Accepted |
| HD-ROLE-P26-008 | FE route integration | Use `router.tsx` as route source | Human Owner / 2026-06-12 | Superseded by `HD-ROLE-P3-002` |
| HD-ROLE-P26-009 | FE DTO naming | Use `RoleDto` | Human Owner / 2026-06-15 | Accepted |
| HD-ROLE-P6-001 | Delete response contract alignment | Align spec to source code: delete API returns `RoleDto` instead of success message | Human Owner / 2026-06-15 | Accepted |
| HD-ROLE-P26-010 | V4 mapper/adapter/entity missing | Carry into Phase 3 implementation planning; not a business decision | Human Owner / 2026-06-12 | Accepted |
| HD-ROLE-P3-001 | Logical delete endpoint method | Use `PUT /api/v1/roles/{role_id}/delete`; do not use HTTP `DELETE` for logical delete | Human Owner / 2026-06-12 | Accepted |
| HD-ROLE-P3-002 | FE route implementation source | Current source mounts `HashRouter` in `main.tsx` and defines routes in `App.tsx`; implement `/roles` in `App.tsx` unless source is migrated later | Source review / 2026-06-12 | Accepted |

## 18. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| ASM-ROLE-001 | BE artifact path is canonical | Prior human selection | Low | No |
| ASM-ROLE-002 | Role CRUD targets `tbl_dim_role` | Human Decision | Low | No |
| ASM-ROLE-003 | `role_id` should be UUID in API | Source `tbl_dim_role.role_id` | Low | Pack 26 confirms DTO |
| ASM-ROLE-004 | API likely uses `/api/v1/roles` | API standards | Medium | Pack 26 |
| ASM-ROLE-005 | Raw duplicated `created_by` meant `updated_by` | Source has `updated_by` | Low | No for current spec |
| ASM-ROLE-006 | FE should use existing `api.ts` wrapper | Existing FE standards/source | Low | Pack 26 confirms calls |
| ASM-ROLE-007 | Wireframe detail and edit flows can share a dialog pattern | Wireframe says detail/edit open dialog-style UI | Medium | Human / Phase 3 |
| ASM-ROLE-008 | Wireframe `descript` means canonical `description` | Wireframe label says Description | Low | Pack 26 / Phase 3 |
| ASM-ROLE-009 | Wireframe `create_day` and `update_day` correspond to `createdAt` and `updatedAt` display values | Human Decision confirms API fields | Low | Pack 26 confirms serialization |
| ASM-ROLE-010 | Create dialog description field maps to canonical `description` | Wireframe label says Description while draft field wording may differ; canonical spec uses `description` | Medium | Pack 26 / Phase 3 |
| ASM-ROLE-011 | ROLE i18n keys should live under `Pages.RoleManagement.*` | Existing locale JSON groups page labels under `Pages.<PageName>` | Medium | Pack 26 / Phase 3 |

## 19. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-ROLE-P3-004 | FE default page size/page origin for client-side pagination | Needed for FE implementation consistency | FE owner | Open for Phase 3 |
| OI-ROLE-P3-005 | Search/sort query behavior for BE raw list endpoint | Needed for exact API implementation | FE/BE owners | Open for Phase 3 |
| OI-ROLE-P3-009 | Missing Java mapper/adapter/entity for V4 `tbl_dim_role` | Affects implementation path | Tech Lead / BE owner | Open for Phase 3 implementation planning |
| OI-ROLE-P3-006 | Confirm DB default for `description` if omitted | Needed for mapper/insert behavior | BE owner / DB owner | Open for Phase 3 |
| OI-ROLE-P3-001 | Case-insensitive uniqueness implementation strategy | Requires BE validation and possible DB index/query strategy | BE owner / DB owner | Open for Phase 3 |
| OI-ROLE-P3-002 | Whether `description` search is supported | Minimum search is `role_name`; description search needs confirmation | PO / PM / Tech Lead | Open for Phase 3 |
| OI-ROLE-P3-003 | Whether sort supports `role_id`, `createdAt`, or `updatedAt` | Minimum sort is `role_name`; extra fields need convention/source confirmation | PO / PM / Tech Lead | Open for Phase 3 |
| OI-ROLE-P3-007 | Final localized wording review | Wireframe labels are source input and i18n keys are proposed; final wording may need FE/PO review during implementation | PO / PM / FE owner | Open for Phase 3 |
| OI-ROLE-P3-008 | Exact table columns in list | Wireframe shows role name, created date, and action; Pack 26 / Phase 3 should confirm whether `updatedAt` also appears in list or detail only | PO / PM / FE owner | Open for Phase 3 |

## 20. Resolved Issues

| ID | resolved issue | resolution |
|---|---|---|
| RI-ROLE-001 | Table naming conflict | `tbl_dim_role` is official; `dim_role` superseded |
| RI-ROLE-002 | RBAC model undecided | Role-based RBAC |
| RI-ROLE-003 | Action authorization label naming undecided | Separate action authorization labels are not used in the ROLE specification |
| RI-ROLE-004 | Hard vs soft/logical delete undecided | Logical delete approved by `HD-ROLE-DELETE-001`; previous hard-delete decision superseded |
| RI-ROLE-014 | Hard delete FK blocker | Resolved by logical delete preserving existing FK references and excluding deleted rows by query |
| RI-ROLE-015 | Restore endpoint blocker | Restore removed from ticket scope |
| RI-ROLE-016 | Role authorization matrix blocker | Matrix accepted for `ADMIN`, `EDITOR`, `VIEWER` |
| RI-ROLE-017 | Pagination response blocker | BE raw list and FE-side pagination accepted |
| RI-ROLE-018 | Error response blocker | Standard `ErrorResponse`; duplicate HTTP 400 accepted |
| RI-ROLE-019 | Timestamp serialization blocker | DB `TIMESTAMPTZ` source and FE `DD/MM/YYYY HH:mm:ss` display accepted |
| RI-ROLE-020 | Delete endpoint method | Resolved by `HD-ROLE-P3-001`: logical delete uses `PUT /api/v1/roles/{role_id}/delete` |
| RI-ROLE-005 | Seed policy undecided | No new seed in ROLE scope |
| RI-ROLE-006 | Description scope undecided | `description` is included |
| RI-ROLE-007 | Case sensitivity undecided | Duplicate check is trim + case-insensitive |
| RI-ROLE-008 | Pagination/search/sort undecided | All required for role list |
| RI-ROLE-009 | Create dialog missing/incomplete | Wireframe now includes create dialog with `role_name` and description fields |
| RI-ROLE-010 | Role Management route/menu placement | FE route is `/roles` |
| RI-ROLE-021 | FE route source conflict | Earlier `router.tsx` decision superseded; current runtime route source is `App.tsx` under `main.tsx` `HashRouter` |
| RI-ROLE-011 | Timestamp display fields/date format | API fields are `createdAt`, `updatedAt`; FE displays `DD/MM/YYYY HH:mm:ss` in user local timezone; `updatedAt` always exists |
| RI-ROLE-013 | Wireframe label/copy handling | Wireframe label/copy inventory is mapped to proposed `Pages.RoleManagement.*` i18n keys |

