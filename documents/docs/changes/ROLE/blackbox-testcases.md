# Black-box Testcases

**Ticket ID**: ROLE  
**Feature**: CRUD Role Management  
**Phase**: Phase 7 - Black-box Test / Test Data  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-15  
**Status**: Updated from skeleton using canonical spec only

## Scope

This document defines black-box testcases for ROLE using only externally observable behavior from:

- `EDCAP_BE/documents/docs/changes/ROLE/spec-pack.md`
- `EDCAP_BE/documents/docs/changes/ROLE/test-plan.md`
- `EDCAP_BE/documents/docs/changes/ROLE/impact-analysis.md`
- `EDCAP_BE/documents/docs/standards/testing.md`

The suite does not depend on service names, mapper names, exception classes, or any other implementation detail.

## Priority Rule

- `P0`: core business correctness, RBAC/security, logical delete, duplicate handling
- `P1`: important UX-visible behavior and boundary handling
- `P2`: operational/review-oriented checks that are useful but not release-blocking by default

## AC To Black-box Mapping

| AC | summary | black-box cases |
|---|---|---|
| AC-1 | `ADMIN` / `EDITOR` / `VIEWER` can open `/roles` and load raw list | `BB-ROLE-001`, `BB-ROLE-002`, `BB-ROLE-003` |
| AC-2 | Disallowed actor cannot view roles | `BB-ROLE-004`, `BB-ROLE-005` |
| AC-3 | `ADMIN` / `EDITOR` can create valid unique role | `BB-ROLE-006`, `BB-ROLE-007` |
| AC-4 | Create duplicate active role is rejected | `BB-ROLE-008`, `BB-ROLE-009` |
| AC-5 | Blank or whitespace role name is rejected | `BB-ROLE-010`, `BB-ROLE-011` |
| AC-6 | `ADMIN` / `EDITOR` can update role | `BB-ROLE-012`, `BB-ROLE-013` |
| AC-7 | Update duplicate active role is rejected | `BB-ROLE-014` |
| AC-8 | `ADMIN` logical delete returns updated `RoleDto` and preserves row logically | `BB-ROLE-015`, `BB-ROLE-016` |
| AC-9 | Deleted roles are excluded from list/search/query and duplicate-check candidate set | `BB-ROLE-009`, `BB-ROLE-017`, `BB-ROLE-018` |
| AC-10 | `EDITOR` / `VIEWER` cannot delete | `BB-ROLE-019`, `BB-ROLE-020` |
| AC-11 | `VIEWER` cannot create/update | `BB-ROLE-021`, `BB-ROLE-022` |
| AC-12 | Search by `role_name` works and excludes deleted rows | `BB-ROLE-023`, `BB-ROLE-024` |
| AC-13 | Sort by `role_name` works | `BB-ROLE-025` |
| AC-14 | FE paginates client-side over raw list | `BB-ROLE-026`, `BB-ROLE-027` |
| AC-15 | Screen shows search, table, pagination, and allowed controls | `BB-ROLE-002`, `BB-ROLE-003`, `BB-ROLE-028` |
| AC-16 | Detail view shows role fields | `BB-ROLE-029` |
| AC-17 | Edit view exposes editable fields | `BB-ROLE-013`, `BB-ROLE-030` |
| AC-18 | Delete shows confirmation before API effect | `BB-ROLE-031` |
| AC-19 | Delete confirmation identifies target role | `BB-ROLE-031` |
| AC-20 | Create entry opens with required inputs and controls | `BB-ROLE-007`, `BB-ROLE-032` |
| AC-21 | FE displays timestamps as `DD/MM/YYYY HH:mm:ss` | `BB-ROLE-033`, `BB-ROLE-034` |
| AC-22 | ROLE labels use i18n keys/content | `BB-ROLE-035` |

## Testcase Inventory

### P0 Cases

#### `BB-ROLE-001` - ADMIN can open role list

- Priority: `P0`
- Viewpoints: `normal`, `permission`
- Objective: Confirm an authenticated `ADMIN` can access the ROLE screen and receive role data.
- Preconditions:
  - Persona `TD-ROLE-USER-ADMIN` is authenticated.
  - Baseline dataset `TD-ROLE-DATA-BASELINE` exists.
- Test data: `TD-ROLE-USER-ADMIN`, `TD-ROLE-DATA-BASELINE`
- Steps / Input:
  1. Open `/roles`.
  2. Wait for the screen to load.
- Expected result:
  - The Role Management screen is shown.
  - A role list is visible.
  - Returned data is usable as a plain list without server-side paging metadata being required by the UI.

#### `BB-ROLE-002` - EDITOR can view but cannot delete

- Priority: `P0`
- Viewpoints: `permission`, `normal`
- Objective: Confirm `EDITOR` has view access and only non-delete action visibility.
- Preconditions:
  - Persona `TD-ROLE-USER-EDITOR` is authenticated.
  - Dataset `TD-ROLE-DATA-BASELINE` exists.
- Test data: `TD-ROLE-USER-EDITOR`, `TD-ROLE-DATA-BASELINE`
- Steps / Input:
  1. Open `/roles`.
  2. Observe available actions on a role row.
- Expected result:
  - Screen and list are visible.
  - Create and edit entry points are available.
  - Delete entry point is not available to the user.

#### `BB-ROLE-003` - VIEWER can view only

- Priority: `P0`
- Viewpoints: `permission`, `normal`
- Objective: Confirm `VIEWER` can open the screen but cannot mutate data.
- Preconditions:
  - Persona `TD-ROLE-USER-VIEWER` is authenticated.
  - Dataset `TD-ROLE-DATA-BASELINE` exists.
- Test data: `TD-ROLE-USER-VIEWER`, `TD-ROLE-DATA-BASELINE`
- Steps / Input:
  1. Open `/roles`.
  2. Observe visible actions.
- Expected result:
  - Screen and list are visible.
  - View/detail is allowed.
  - Create, edit, and delete entry points are not available.

#### `BB-ROLE-004` - Unauthenticated user cannot open `/roles`

- Priority: `P0`
- Viewpoints: `permission`, `error`
- Objective: Confirm the screen is protected from unauthenticated access.
- Preconditions:
  - Persona `TD-ROLE-USER-ANON` is not authenticated.
- Test data: `TD-ROLE-USER-ANON`
- Steps / Input:
  1. Open `/roles` directly.
- Expected result:
  - The user is not allowed to use Role Management.
  - No role data is displayed.

#### `BB-ROLE-005` - Disallowed direct role-view API request is denied

- Priority: `P0`
- Viewpoints: `permission`, `error`, `operation`
- Objective: Confirm disallowed direct API access does not expose role data.
- Preconditions:
  - Use a caller context that is not permitted to view roles by the approved matrix.
- Test data: `TD-ROLE-REQ-DENIED-VIEW`
- Steps / Input:
  1. Call `GET /api/v1/roles`.
- Expected result:
  - Request is rejected with the standard error contract.
  - No role list data is returned.

#### `BB-ROLE-006` - Create valid unique role as ADMIN

- Priority: `P0`
- Viewpoints: `normal`
- Objective: Confirm a valid unique role can be created.
- Preconditions:
  - Persona `TD-ROLE-USER-ADMIN` is authenticated.
  - Name in `TD-ROLE-NAME-VALID-NEW` does not already exist among active roles.
- Test data: `TD-ROLE-USER-ADMIN`, `TD-ROLE-NAME-VALID-NEW`, `TD-ROLE-DESC-VALID`
- Steps / Input:
  1. Open create role.
  2. Submit a valid role name and description.
- Expected result:
  - Create succeeds.
  - Success behavior follows application convention.
  - The created item is visible in the role list.

#### `BB-ROLE-007` - Create valid unique role as EDITOR

- Priority: `P0`
- Viewpoints: `normal`, `permission`
- Objective: Confirm `EDITOR` can create roles.
- Preconditions:
  - Persona `TD-ROLE-USER-EDITOR` is authenticated.
  - Name in `TD-ROLE-NAME-VALID-EDITOR` is unique among active roles.
- Test data: `TD-ROLE-USER-EDITOR`, `TD-ROLE-NAME-VALID-EDITOR`, `TD-ROLE-DESC-VALID`
- Steps / Input:
  1. Open create role.
  2. Submit valid inputs.
- Expected result:
  - Create succeeds.
  - The new role is visible afterward.

#### `BB-ROLE-008` - Create duplicate active role is rejected

- Priority: `P0`
- Viewpoints: `error`, `boundary`
- Objective: Confirm duplicate detection is case-insensitive among active rows.
- Preconditions:
  - Active role `PM` exists in `TD-ROLE-DATA-BASELINE`.
  - Persona `TD-ROLE-USER-ADMIN` or `TD-ROLE-USER-EDITOR` is authenticated.
- Test data: `TD-ROLE-NAME-DUP-CASE`, `TD-ROLE-DATA-BASELINE`
- Steps / Input:
  1. Create a role with input `pm`.
- Expected result:
  - Create is rejected.
  - Response uses the standard error contract with HTTP 400.
  - No new role is added.

#### `BB-ROLE-009` - Create name matching only logically deleted role is allowed

- Priority: `P0`
- Viewpoints: `boundary`, `normal`, `audit`
- Objective: Confirm logically deleted rows are excluded from duplicate-candidate checks.
- Preconditions:
  - Dataset `TD-ROLE-DATA-DELETED-DUPLICATE` exists with a logically deleted role whose name matches the test input.
  - No active role has the same normalized name.
- Test data: `TD-ROLE-DATA-DELETED-DUPLICATE`, `TD-ROLE-NAME-DELETED-MATCH`
- Steps / Input:
  1. Create a role using the same normalized name as the logically deleted role.
- Expected result:
  - Create succeeds.
  - The newly created active role appears in the list.

#### `BB-ROLE-010` - Create blank role name is rejected

- Priority: `P0`
- Viewpoints: `error`, `boundary`
- Objective: Confirm blank role name is rejected.
- Preconditions:
  - Persona `TD-ROLE-USER-ADMIN` or `TD-ROLE-USER-EDITOR` is authenticated.
- Test data: `TD-ROLE-NAME-BLANK`
- Steps / Input:
  1. Submit create with an empty role name.
- Expected result:
  - The request is rejected before persistence.
  - The user sees validation failure per application convention.

#### `BB-ROLE-011` - Create whitespace-only role name is rejected

- Priority: `P0`
- Viewpoints: `error`, `boundary`
- Objective: Confirm whitespace-only role name is rejected.
- Preconditions:
  - Persona `TD-ROLE-USER-ADMIN` or `TD-ROLE-USER-EDITOR` is authenticated.
- Test data: `TD-ROLE-NAME-WHITESPACE`
- Steps / Input:
  1. Submit create with `"   "` as the role name.
- Expected result:
  - The request is rejected before persistence.
  - No new role is created.

#### `BB-ROLE-012` - Update existing role as ADMIN

- Priority: `P0`
- Viewpoints: `normal`
- Objective: Confirm `ADMIN` can update role name and description.
- Preconditions:
  - Persona `TD-ROLE-USER-ADMIN` is authenticated.
  - Target role from `TD-ROLE-DATA-BASELINE` exists.
- Test data: `TD-ROLE-USER-ADMIN`, `TD-ROLE-UPDATE-VALID`
- Steps / Input:
  1. Open edit for an existing role.
  2. Submit valid changed values.
- Expected result:
  - Update succeeds.
  - The changed values are visible afterward.

#### `BB-ROLE-013` - Update existing role as EDITOR

- Priority: `P0`
- Viewpoints: `normal`, `permission`
- Objective: Confirm `EDITOR` can update an existing role.
- Preconditions:
  - Persona `TD-ROLE-USER-EDITOR` is authenticated.
  - Target role exists.
- Test data: `TD-ROLE-USER-EDITOR`, `TD-ROLE-UPDATE-VALID`
- Steps / Input:
  1. Open edit for a target role.
  2. Submit valid changed values.
- Expected result:
  - Update succeeds.
  - Update action is available to the user.

#### `BB-ROLE-014` - Update to duplicate active role is rejected

- Priority: `P0`
- Viewpoints: `error`, `boundary`
- Objective: Confirm update cannot collide with another active role by case-insensitive comparison.
- Preconditions:
  - Two active roles exist with different names.
  - Persona `TD-ROLE-USER-ADMIN` or `TD-ROLE-USER-EDITOR` is authenticated.
- Test data: `TD-ROLE-UPDATE-DUPLICATE-ACTIVE`
- Steps / Input:
  1. Edit one role.
  2. Change its name to a normalized value matching another active role.
- Expected result:
  - Update is rejected with standard HTTP 400 error behavior.
  - Target role remains unchanged.

#### `BB-ROLE-015` - ADMIN logical delete succeeds and returns updated role

- Priority: `P0`
- Viewpoints: `normal`, `permission`, `audit`
- Objective: Confirm delete uses the logical delete contract and returns updated `RoleDto`.
- Preconditions:
  - Persona `TD-ROLE-USER-ADMIN` is authenticated.
  - Target active role exists and is deletable.
- Test data: `TD-ROLE-DELETE-TARGET`
- Steps / Input:
  1. Confirm delete for the target role.
  2. Observe API result and post-action list behavior.
- Expected result:
  - Delete succeeds.
  - Response body is the updated `RoleDto`.
  - The role no longer appears in normal visible list/search results.

#### `BB-ROLE-016` - Logical delete preserves row for operational traceability

- Priority: `P0`
- Viewpoints: `audit`, `operation`
- Objective: Confirm delete is logical rather than physical from an externally observable perspective.
- Preconditions:
  - Persona `TD-ROLE-USER-ADMIN` is authenticated.
  - Target role exists.
- Test data: `TD-ROLE-DELETE-TARGET`
- Steps / Input:
  1. Delete the target role.
  2. Re-query the same role through supported post-delete observation paths used by QA/ops for this environment.
- Expected result:
  - The role is treated as deleted for normal active usage.
  - Behavior is consistent with logical delete and not with hard physical removal.

#### `BB-ROLE-017` - Deleted role is excluded from list/search

- Priority: `P0`
- Viewpoints: `audit`, `normal`
- Objective: Confirm logically deleted roles are excluded from active result sets.
- Preconditions:
  - Dataset `TD-ROLE-DATA-DELETED-DUPLICATE` exists.
- Test data: `TD-ROLE-DATA-DELETED-DUPLICATE`
- Steps / Input:
  1. Load role list.
  2. Search explicitly for the deleted role name.
- Expected result:
  - The logically deleted role does not appear in list results.
  - The logically deleted role does not appear in search results.

#### `BB-ROLE-018` - Update after logical delete does not restore visible active presence

- Priority: `P0`
- Viewpoints: `audit`, `operation`
- Objective: Confirm delete semantics stay stable after deletion.
- Preconditions:
  - A role has already been logically deleted in the current test environment.
- Test data: `TD-ROLE-DATA-DELETED-DUPLICATE`
- Steps / Input:
  1. Perform a normal active list/query flow after delete.
- Expected result:
  - The deleted role remains excluded from active result sets.
  - No implicit restore behavior occurs.

#### `BB-ROLE-019` - EDITOR direct delete API call is rejected

- Priority: `P0`
- Viewpoints: `permission`, `error`
- Objective: Confirm `EDITOR` cannot delete even by direct API call.
- Preconditions:
  - Persona `TD-ROLE-USER-EDITOR` is authenticated.
  - Target active role exists.
- Test data: `TD-ROLE-USER-EDITOR`, `TD-ROLE-DELETE-TARGET`
- Steps / Input:
  1. Call `PUT /api/v1/roles/{role_id}/delete`.
- Expected result:
  - Request is rejected with the standard error contract.
  - Target role remains unchanged.

#### `BB-ROLE-020` - VIEWER direct delete API call is rejected

- Priority: `P0`
- Viewpoints: `permission`, `error`
- Objective: Confirm `VIEWER` cannot delete by direct API call.
- Preconditions:
  - Persona `TD-ROLE-USER-VIEWER` is authenticated.
  - Target active role exists.
- Test data: `TD-ROLE-USER-VIEWER`, `TD-ROLE-DELETE-TARGET`
- Steps / Input:
  1. Call `PUT /api/v1/roles/{role_id}/delete`.
- Expected result:
  - Request is rejected with the standard error contract.
  - Target role remains unchanged.

#### `BB-ROLE-021` - VIEWER direct create API call is rejected

- Priority: `P0`
- Viewpoints: `permission`, `error`
- Objective: Confirm `VIEWER` cannot create roles.
- Preconditions:
  - Persona `TD-ROLE-USER-VIEWER` is authenticated.
- Test data: `TD-ROLE-USER-VIEWER`, `TD-ROLE-NAME-VALID-NEW`
- Steps / Input:
  1. Call `POST /api/v1/roles` with valid payload.
- Expected result:
  - Request is rejected with the standard error contract.
  - No role is created.

#### `BB-ROLE-022` - VIEWER direct update API call is rejected

- Priority: `P0`
- Viewpoints: `permission`, `error`
- Objective: Confirm `VIEWER` cannot update roles.
- Preconditions:
  - Persona `TD-ROLE-USER-VIEWER` is authenticated.
  - Target role exists.
- Test data: `TD-ROLE-USER-VIEWER`, `TD-ROLE-UPDATE-VALID`
- Steps / Input:
  1. Call `PUT /api/v1/roles/{role_id}` with valid payload.
- Expected result:
  - Request is rejected with the standard error contract.
  - The target role remains unchanged.

### P1 Cases

#### `BB-ROLE-023` - Search filters role list by role name

- Priority: `P1`
- Viewpoints: `normal`
- Objective: Confirm search filters visible roles by `role_name`.
- Preconditions:
  - Dataset `TD-ROLE-DATA-SEARCH` exists with multiple active roles.
- Test data: `TD-ROLE-DATA-SEARCH`
- Steps / Input:
  1. Open `/roles`.
  2. Search for `PM`.
- Expected result:
  - Results are filtered to matching role names according to the approved contract.

#### `BB-ROLE-024` - Search excludes logically deleted match

- Priority: `P1`
- Viewpoints: `error`, `audit`
- Objective: Confirm search does not surface deleted rows.
- Preconditions:
  - Dataset includes a logically deleted role whose name matches the search term.
- Test data: `TD-ROLE-DATA-DELETED-DUPLICATE`
- Steps / Input:
  1. Search using the deleted role name.
- Expected result:
  - The deleted role is not returned.

#### `BB-ROLE-025` - Sort by role name

- Priority: `P1`
- Viewpoints: `normal`
- Objective: Confirm users can sort visible results by `role_name`.
- Preconditions:
  - Dataset `TD-ROLE-DATA-SORT` exists with names that make sort order observable.
- Test data: `TD-ROLE-DATA-SORT`
- Steps / Input:
  1. Open `/roles`.
  2. Apply sort by role name.
- Expected result:
  - Visible order follows the chosen role-name sort direction.

#### `BB-ROLE-026` - Client-side pagination changes visible slice

- Priority: `P1`
- Viewpoints: `normal`, `operation`
- Objective: Confirm page navigation changes the visible subset without requiring BE paging metadata.
- Preconditions:
  - Dataset `TD-ROLE-DATA-PAGINATION` has more rows than one page.
- Test data: `TD-ROLE-DATA-PAGINATION`
- Steps / Input:
  1. Open `/roles`.
  2. Move to another page.
- Expected result:
  - A different visible slice is shown.
  - Paging works from the raw role list behavior approved for this ticket.

#### `BB-ROLE-027` - Visible role list contract does not depend on server paging wrapper

- Priority: `P1`
- Viewpoints: `operation`
- Objective: Confirm ROLE list usage follows the raw `RoleDto[]` contract.
- Preconditions:
  - ROLE list API is available in the test environment.
- Test data: `TD-ROLE-REQ-LIST`
- Steps / Input:
  1. Call `GET /api/v1/roles`.
- Expected result:
  - Response body is a raw role list contract.
  - No `totalCount`, `totalPages`, `page`, or `size` fields are required for normal usage.

#### `BB-ROLE-028` - Screen shows allowed controls by user role

- Priority: `P1`
- Viewpoints: `permission`
- Objective: Confirm screen-level controls match the approved role matrix.
- Preconditions:
  - Personas `TD-ROLE-USER-ADMIN`, `TD-ROLE-USER-EDITOR`, and `TD-ROLE-USER-VIEWER` are available.
- Test data: `TD-ROLE-USER-ADMIN`, `TD-ROLE-USER-EDITOR`, `TD-ROLE-USER-VIEWER`
- Steps / Input:
  1. Open `/roles` as each persona.
  2. Compare visible create/edit/delete controls.
- Expected result:
  - ADMIN: view/create/update/delete controls are available.
  - EDITOR: view/create/update available; delete not available.
  - VIEWER: only view-related behavior is available.

#### `BB-ROLE-029` - Detail view shows role fields

- Priority: `P1`
- Viewpoints: `normal`
- Objective: Confirm a user allowed to view roles can open role detail.
- Preconditions:
  - Any allowed viewer persona is authenticated.
  - Target role exists.
- Test data: `TD-ROLE-DATA-BASELINE`
- Steps / Input:
  1. Open detail for a role.
- Expected result:
  - Detail view shows role name and description.

#### `BB-ROLE-030` - Edit view exposes editable fields

- Priority: `P1`
- Viewpoints: `normal`
- Objective: Confirm allowed users can see editable fields before update.
- Preconditions:
  - Persona `TD-ROLE-USER-ADMIN` or `TD-ROLE-USER-EDITOR` is authenticated.
- Test data: `TD-ROLE-DATA-BASELINE`
- Steps / Input:
  1. Open edit for a role.
- Expected result:
  - Editable `role_name` and description inputs are shown.
  - Update and close/cancel controls are available.

#### `BB-ROLE-031` - Delete requires explicit confirmation and identifies target role

- Priority: `P1`
- Viewpoints: `permission`, `audit`
- Objective: Confirm delete does not happen until explicit confirmation and that the user sees which role is targeted.
- Preconditions:
  - Persona `TD-ROLE-USER-ADMIN` is authenticated.
  - Target active role exists.
- Test data: `TD-ROLE-DELETE-TARGET`
- Steps / Input:
  1. Start delete from the role list.
  2. Observe confirmation state before confirming.
  3. Cancel once, then repeat and confirm.
- Expected result:
  - A confirmation step appears before deletion is applied.
  - The confirmation identifies the target role.
  - Cancel leaves data unchanged.
  - Confirm applies the logical delete.

#### `BB-ROLE-032` - Create entry opens with required controls

- Priority: `P1`
- Viewpoints: `normal`
- Objective: Confirm create entry point opens the expected inputs and controls.
- Preconditions:
  - Persona `TD-ROLE-USER-ADMIN` or `TD-ROLE-USER-EDITOR` is authenticated.
- Test data: `TD-ROLE-USER-ADMIN`
- Steps / Input:
  1. Open create role.
- Expected result:
  - `role_name` input is present.
  - Description input is present.
  - Create and close/cancel controls are present.

#### `BB-ROLE-033` - Timestamp fields are shown in `DD/MM/YYYY HH:mm:ss`

- Priority: `P1`
- Viewpoints: `normal`, `boundary`
- Objective: Confirm timestamp display format matches the approved rule.
- Preconditions:
  - Dataset `TD-ROLE-DATA-TIMESTAMP` exists with known `createdAt` and `updatedAt`.
- Test data: `TD-ROLE-DATA-TIMESTAMP`
- Steps / Input:
  1. Open a role list row or detail view containing visible timestamps.
- Expected result:
  - `createdAt` and `updatedAt` are displayed in `DD/MM/YYYY HH:mm:ss`.
  - Both values are present.

#### `BB-ROLE-034` - Timestamp near timezone boundary remains user-local

- Priority: `P1`
- Viewpoints: `boundary`, `operation`
- Objective: Confirm displayed timestamps remain correct near a local date boundary.
- Preconditions:
  - Dataset `TD-ROLE-DATA-TIMEZONE-EDGE` exists.
  - Tester knows the local timezone used for the session.
- Test data: `TD-ROLE-DATA-TIMEZONE-EDGE`
- Steps / Input:
  1. Open a role with timestamps near midnight UTC.
- Expected result:
  - Displayed value still follows `DD/MM/YYYY HH:mm:ss`.
  - Date/time reflects the user's local timezone view.

### P2 Cases

#### `BB-ROLE-035` - ROLE labels are consistent with approved UI text/i18n behavior

- Priority: `P2`
- Viewpoints: `operation`
- Objective: Confirm screen labels are consistent and not missing/broken from the user viewpoint.
- Preconditions:
  - Any allowed viewing persona is authenticated.
- Test data: `TD-ROLE-DATA-BASELINE`
- Steps / Input:
  1. Open `/roles`.
  2. Inspect major labels and action text.
- Expected result:
  - Labels are present and understandable.
  - No broken or unresolved label content is visible to the user.

## Additional Boundary And Error Coverage

The following external scenarios are intentionally represented in this suite:

- exact duplicate active role name
- case-variant duplicate active role name
- same name as logically deleted role
- blank and whitespace-only role name
- visible role slice change across pages
- direct unauthorized API calls
- timestamp display near timezone boundary

## Assumptions

| ID | assumption | reason |
|---|---|---|
| BB-ROLE-ASM-001 | For logical delete operational review, QA may use the environment's approved observation path to confirm the record remains logically present without requiring direct DB inspection in this document | Phase 7 is black-box and should stay implementation-independent |
| BB-ROLE-ASM-002 | Search matching behavior follows the approved contract already accepted in the spec, and this document does not restate internal normalization logic beyond what is externally observable | Prevents leaking implementation detail into expected results |

## Human Decisions Required

| ID | decision | reason |
|---|---|---|
| BB-ROLE-HDR-001 | None currently identified for Phase 7 artifact completion | Canonical spec already resolves RBAC, delete response, timestamp, and pagination decisions |
