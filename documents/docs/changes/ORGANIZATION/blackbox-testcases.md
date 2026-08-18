# Black-box Test Cases

**Ticket ID**: ORGANIZATION
**Create date**: 2026-06-10
**Author**:  nk_trung
**Update date**: 2026-06-11

## Test Case Summary

| case ID | AC ID | priority | category | title | Status
|---|---|---|---|---|---|
| BB-ORG-001 | AC-ORGANIZATION-1 | P0 | Permission / Normal | ADMIN opens Organization list and sees active records by default | Pass |
| BB-ORG-002 | AC-ORGANIZATION-1, AC-ORGANIZATION-10 | P1 | Normal / Empty state | ADMIN opens Organization list when no active records exist | Pass |
| BB-ORG-003 | AC-ORGANIZATION-2 | P1 | Normal | Search by Organization code | Pass |
| BB-ORG-004 | AC-ORGANIZATION-2 | P1 | Normal | Search by Organization name | Pass |
| BB-ORG-005 | AC-ORGANIZATION-2 | P2 | Boundary / Character type input | Search with partial, case-variant, and no-match keywords | Pass |
| BB-ORG-006 | AC-ORGANIZATION-3 | P1 | State | Filter Active, Deleted, and All statuses | Pass |
| BB-ORG-007 | AC-ORGANIZATION-4 | P0 | Normal | Create valid Organization with required fields | Pass |
| BB-ORG-008 | AC-ORGANIZATION-4 | P1 | Normal | Create valid Organization with optional description | Pass |
| BB-ORG-009 | AC-ORGANIZATION-4 | P1 | Error / Empty | Create fails when Organization code is empty or whitespace | Pass |
| BB-ORG-010 | AC-ORGANIZATION-4 | P1 | Error / Empty | Create fails when Organization name is empty or whitespace | Pass |
| BB-ORG-011 | AC-ORGANIZATION-4 | P1 | Boundary | Create accepts maximum valid field lengths | Pass |
| BB-ORG-012 | AC-ORGANIZATION-4 | P1 | Boundary | Create rejects over-maximum field lengths | Pass |
| BB-ORG-013 | AC-ORGANIZATION-5 | P0 | Duplicate | Create rejects duplicate code from an active/non-deleted Organization | Pass |
| BB-ORG-014 | AC-ORGANIZATION-6 | P0 | Duplicate | Create rejects duplicate name from an active/non-deleted Organization | Pass |
| BB-ORG-015 | AC-ORGANIZATION-5, AC-ORGANIZATION-6 | P1 | Deleted data / Duplicate | Create allows code/name reuse from a soft-deleted Organization | Pass |
| BB-ORG-016 | AC-ORGANIZATION-7 | P0 | Normal / State | Update Organization code with valid version succeeds | Pass |
| BB-ORG-017 | AC-ORGANIZATION-7 | P0 | Duplicate / Error | Update Organization code to duplicate active code fails | Pass |
| BB-ORG-018 | AC-ORGANIZATION-8 | P0 | Normal / State | Update Organization name with valid version succeeds | Pass |
| BB-ORG-019 | AC-ORGANIZATION-8 | P0 | Duplicate / Error | Update Organization name to duplicate active name fails | Pass |
| BB-ORG-020 | AC-ORGANIZATION-7, AC-ORGANIZATION-8 | P1 | Boundary | Update accepts maximum valid field lengths | Pass |
| BB-ORG-021 | AC-ORGANIZATION-7, AC-ORGANIZATION-8 | P1 | Boundary | Update rejects over-maximum field lengths | Pass |
| BB-ORG-022 | AC-ORGANIZATION-13 | P0 | Conflict / State | Update with stale numeric version fails with conflict | Pass |
| BB-ORG-023 | AC-ORGANIZATION-9 | P0 | State | Soft delete active Organization succeeds without physical deletion | Pass |
| BB-ORG-024 | AC-ORGANIZATION-9, AC-ORGANIZATION-13 | P0 | Conflict / State | Soft delete with stale numeric version fails with conflict | Pass |
| BB-ORG-025 | AC-ORGANIZATION-10 | P1 | Deleted data | Soft-deleted Organization is excluded from default list and visible in Deleted filter | Pass |
| BB-ORG-026 | AC-ORGANIZATION-10 | P1 | Deleted data / Permission | Soft-deleted Organization detail is read-only | Pass |
| BB-ORG-027 | AC-ORGANIZATION-11 | P0 | Permission | Authenticated non-ADMIN opening Organization screen is logged out and redirected | Pass |
| BB-ORG-028 | AC-ORGANIZATION-11 | P0 | Permission | Authenticated non-ADMIN direct API call returns 403 | Pass |
| BB-ORG-029 | AC-ORGANIZATION-11 | P0 | Permission | Unauthenticated Organization API call returns 401 or existing unauthenticated response | Pass |
| BB-ORG-030 | AC-ORGANIZATION-12 | P2 | Operation / Log | Existing traceId/error logging behavior remains observable on Organization API error | Pass |
| BB-ORG-031 | AC-ORGANIZATION-12 | P2 | Operation / Audit | Dedicated audit-log storage is not expected for this release | Pass |
| BB-ORG-032 | AC-ORGANIZATION-4, AC-ORGANIZATION-7, AC-ORGANIZATION-8 | P1 | Double submit / Duplicate | Double submit does not create duplicate active Organizations or apply duplicate updates | Pass |
| BB-ORG-033 | AC-ORGANIZATION-1, AC-ORGANIZATION-2, AC-ORGANIZATION-3 | P2 | Back/reload | Reload/back navigation preserves safe list behavior without unauthorized data exposure | Pass |

## Test Cases

### BB-ORG-001: ADMIN opens Organization list and sees active records by default

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-1 |
| Priority | P0 |
| Category | Permission / Normal |
| Preconditions | ADMIN user is logged in. At least one active Organization and one soft-deleted Organization exist. |
| Input | Open Organization Management screen for the current language, for example `/:lang/organizations` if this is the final route. |
| Steps | 1. Login as ADMIN. 2. Open Organization Management. 3. Observe initial list and status filter. |
| Expected Result | Organization list is displayed. Active Organizations are displayed by default. Soft-deleted Organizations are not displayed in the default list. |
| Note | Route name may follow final FE routing, but behavior must remain ADMIN-only. |

### BB-ORG-002: ADMIN opens Organization list when no active records exist

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-1, AC-ORGANIZATION-10 |
| Priority | P1 |
| Category | Normal / Empty state |
| Preconditions | ADMIN user is logged in. Test environment has no active Organizations, or the search/status filter returns no active records. |
| Input | Open Organization Management default list. |
| Steps | 1. Login as ADMIN. 2. Open Organization Management. 3. Keep status filter as Active/default. |
| Expected Result | Screen loads normally and shows a clear empty state or empty table. No deleted record appears in the default list. No unexpected error is shown. |
| Note | This is black-box observable UI behavior. |

### BB-ORG-003: Search by Organization code

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-2 |
| Priority | P1 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Active Organizations exist with distinct codes, for example `ORG_BVN_ACTIVE` and `ORG_TOKYO_ACTIVE`. |
| Input | Keyword matching one Organization code, for example `BVN`. |
| Steps | 1. Open Organization list. 2. Enter code keyword. 3. Execute search. |
| Expected Result | Organizations whose code matches the keyword are displayed. Non-matching Organizations are excluded. Status filtering rules still apply. |
| Note | Do not assert internal query implementation. |

### BB-ORG-004: Search by Organization name

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-2 |
| Priority | P1 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Active Organizations exist with distinct names, for example `Brycen Vietnam Test` and `Brycen Japan Test`. |
| Input | Keyword matching Organization name, for example `Vietnam`. |
| Steps | 1. Open Organization list. 2. Enter name keyword. 3. Execute search. |
| Expected Result | Organizations whose name matches the keyword are displayed. Non-matching Organizations are excluded. |
| Note | Expected result is based on visible Organization name, not DB column names. |

### BB-ORG-005: Search with partial, case-variant, and no-match keywords

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-2 |
| Priority | P2 |
| Category | Boundary / Character type input |
| Preconditions | ADMIN user is logged in. Search target data exists. |
| Input | Partial keyword, case-variant keyword, full-width or multi-byte keyword if supported by data, and no-match keyword. |
| Steps | 1. Search with a partial keyword. 2. Search with a case-variant keyword. 3. Search with a no-match keyword. |
| Expected Result | Matching records are displayed for supported partial/case behavior. No-match search shows empty state or empty table without error. No unauthorized/deleted data is exposed unexpectedly. |
| Note | If case-insensitive search is not explicitly finalized, record observed behavior during execution. |

### BB-ORG-006: Filter Active, Deleted, and All statuses

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-3 |
| Priority | P1 |
| Category | State |
| Preconditions | ADMIN user is logged in. At least one active and one soft-deleted Organization exist. |
| Input | Status filter values: Active, Deleted, All. |
| Steps | 1. Open list. 2. Select Active. 3. Select Deleted. 4. Select All. |
| Expected Result | Active filter shows only active Organizations. Deleted filter shows only soft-deleted Organizations. All filter shows both active and deleted Organizations. |
| Note | Status filter itself is UI/query state and must not change persisted Organization status. |

### BB-ORG-007: Create valid Organization with required fields

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Input code and name are unique among non-deleted Organizations. |
| Input | `organizationCode=ORG_BB_CREATE_001`, `organizationName=Organization Blackbox Create 001`, description empty. |
| Steps | 1. Open create form. 2. Enter valid required fields. 3. Save. |
| Expected Result | New active Organization is created. Screen returns to Organization List. The created Organization is visible in Active/default list. |
| Note | Expected result must be verified via UI and/or public API response only. |

### BB-ORG-008: Create valid Organization with optional description

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-4 |
| Priority | P1 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Input code and name are unique. |
| Input | Valid code/name and a description within 500 characters, including multi-line text if UI allows. |
| Steps | 1. Open create form. 2. Enter required fields and description. 3. Save. 4. Open created detail if available. |
| Expected Result | Organization is created as active. Description is saved and displayed without truncation or unexpected escaping. Screen returns to Organization List after save. |
| Note | Description is optional and must not be required. |

### BB-ORG-009: Create fails when Organization code is empty or whitespace

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-4 |
| Priority | P1 |
| Category | Error / Empty |
| Preconditions | ADMIN user is logged in. |
| Input | Empty code, whitespace-only code, valid unique name. |
| Steps | 1. Open create form. 2. Leave code empty or enter spaces. 3. Enter valid name. 4. Save. |
| Expected Result | Organization is not created. User sees the code-required validation message, expected key `Pages.Organization.Code.Required` or localized equivalent. |
| Note | Verify both UI behavior and no new record in list/API. |

### BB-ORG-010: Create fails when Organization name is empty or whitespace

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-4 |
| Priority | P1 |
| Category | Error / Empty |
| Preconditions | ADMIN user is logged in. |
| Input | Valid unique code, empty name or whitespace-only name. |
| Steps | 1. Open create form. 2. Enter valid code. 3. Leave name empty or enter spaces. 4. Save. |
| Expected Result | Organization is not created. User sees the name-required validation message, expected key `Pages.Organization.Name.Required` or localized equivalent. |
| Note | Verify no new record is created. |

### BB-ORG-011: Create accepts maximum valid field lengths

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-4 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | ADMIN user is logged in. Generated values are unique among non-deleted Organizations. |
| Input | Code length 50, name length 255, description length 500. |
| Steps | 1. Open create form. 2. Enter maximum valid length values. 3. Save. |
| Expected Result | Organization is created successfully if all values are otherwise valid and unique. Saved values are displayed correctly. |
| Note | Include ASCII and multi-byte variants when feasible. |

### BB-ORG-012: Create rejects over-maximum field lengths

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-4 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | ADMIN user is logged in. |
| Input | Code length 51, name length 256, description length 501. |
| Steps | 1. Open create form. 2. Try each over-limit field. 3. Save. |
| Expected Result | Organization is not created. Over-limit field is rejected with the corresponding localized validation message. Description over-limit uses `Pages.Organization.Description.MaxLength` or localized equivalent. |
| Note | Execute as separate sub-checks if the UI stops at the first validation error. |

### BB-ORG-013: Create rejects duplicate code from an active/non-deleted Organization

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-5 |
| Priority | P0 |
| Category | Duplicate |
| Preconditions | ADMIN user is logged in. An active Organization exists with code `ORG_BVN_ACTIVE`. |
| Input | New Organization with code `ORG_BVN_ACTIVE` or case variant `org_bvn_active`, and unique name. |
| Steps | 1. Open create form. 2. Enter duplicate active code and unique name. 3. Save. |
| Expected Result | Organization is not created. Duplicate-code error is shown, expected key `Pages.Organization.Code.Duplicate` or localized equivalent. Existing Organization remains unchanged. |
| Note | Duplicate scope is non-deleted Organizations. |

### BB-ORG-014: Create rejects duplicate name from an active/non-deleted Organization

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-6 |
| Priority | P0 |
| Category | Duplicate |
| Preconditions | ADMIN user is logged in. An active Organization exists with name `Brycen Vietnam Active Test`. |
| Input | New Organization with unique code and duplicate name `Brycen Vietnam Active Test` or case variant. |
| Steps | 1. Open create form. 2. Enter unique code and duplicate active name. 3. Save. |
| Expected Result | Organization is not created. Duplicate-name error is shown, expected key `Pages.Organization.Name.Duplicate` or localized equivalent. Existing Organization remains unchanged. |
| Note | Duplicate scope is non-deleted Organizations. |

### BB-ORG-015: Create allows code/name reuse from a soft-deleted Organization

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-5, AC-ORGANIZATION-6 |
| Priority | P1 |
| Category | Deleted data / Duplicate |
| Preconditions | ADMIN user is logged in. A soft-deleted Organization exists with code/name. No active Organization uses the same code/name. |
| Input | New Organization using the same code and/or name as the soft-deleted Organization. |
| Steps | 1. Confirm target code/name exists only in Deleted filter. 2. Open create form. 3. Enter same code/name. 4. Save. |
| Expected Result | Organization is created successfully as active. The soft-deleted Organization remains deleted. Active list shows the newly created Organization. |
| Note | This verifies deleted records do not block reuse. |

### BB-ORG-016: Update Organization code with valid version succeeds

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-7 |
| Priority | P0 |
| Category | Normal / State |
| Preconditions | ADMIN user is logged in. Active Organization exists and current numeric version is available to the client. New code is unique among non-deleted Organizations. |
| Input | New unique code and current numeric version. |
| Steps | 1. Open edit form for active Organization. 2. Change code to a unique value. 3. Save. 4. Reopen list/detail. |
| Expected Result | Code is updated. Version increments after successful save. No other Organization is changed. |
| Note | Verify observable version only if shown in response/detail; otherwise verify successful update and no conflict. |

### BB-ORG-017: Update Organization code to duplicate active code fails

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-7 |
| Priority | P0 |
| Category | Duplicate / Error |
| Preconditions | ADMIN user is logged in. Two active Organizations exist with different codes. |
| Input | Update Organization A code to Organization B's active code, using current version. |
| Steps | 1. Open edit for Organization A. 2. Enter Organization B's code or case variant. 3. Save. |
| Expected Result | Update is rejected. Duplicate-code error is shown. Organization A keeps its original code and version is not incremented by the rejected update. |
| Note | Duplicate code from a soft-deleted Organization is covered by BB-ORG-015. |

### BB-ORG-018: Update Organization name with valid version succeeds

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-8 |
| Priority | P0 |
| Category | Normal / State |
| Preconditions | ADMIN user is logged in. Active Organization exists and current numeric version is available to the client. New name is unique among non-deleted Organizations. |
| Input | New unique name and current numeric version. |
| Steps | 1. Open edit form for active Organization. 2. Change name to a unique value. 3. Save. 4. Reopen list/detail. |
| Expected Result | Name is updated. Version increments after successful save. No other Organization is changed. |
| Note | Keep code unchanged unless testing code and name together intentionally. |

### BB-ORG-019: Update Organization name to duplicate active name fails

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-8 |
| Priority | P0 |
| Category | Duplicate / Error |
| Preconditions | ADMIN user is logged in. Two active Organizations exist with different names. |
| Input | Update Organization A name to Organization B's active name, using current version. |
| Steps | 1. Open edit for Organization A. 2. Enter Organization B's name or case variant. 3. Save. |
| Expected Result | Update is rejected. Duplicate-name error is shown. Organization A keeps its original name and version is not incremented by the rejected update. |
| Note | Duplicate name from a soft-deleted Organization is allowed per AC and covered by reuse data. |

### BB-ORG-020: Update accepts maximum valid field lengths

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-7, AC-ORGANIZATION-8 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | ADMIN user is logged in. Active Organization exists. Generated values are unique. |
| Input | Code length 50, name length 255, description length 500, current numeric version. |
| Steps | 1. Open edit form. 2. Enter maximum valid length values. 3. Save. |
| Expected Result | Update succeeds. Saved values are displayed correctly. Version increments after successful save. |
| Note | Execute separately from create-boundary case to confirm edit form behavior. |

### BB-ORG-021: Update rejects over-maximum field lengths

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-7, AC-ORGANIZATION-8 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | ADMIN user is logged in. Active Organization exists. |
| Input | Code length 51, name length 256, description length 501, current numeric version. |
| Steps | 1. Open edit form. 2. Try each over-limit value. 3. Save. |
| Expected Result | Update is rejected. Corresponding localized validation message is shown. Existing Organization values are unchanged and version is not incremented by the rejected update. |
| Note | Execute as separate sub-checks if UI stops at the first invalid field. |

### BB-ORG-022: Update with stale numeric version fails with conflict

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-13 |
| Priority | P0 |
| Category | Conflict / State |
| Preconditions | ADMIN user is logged in. Same active Organization is opened in two sessions/tabs/API clients at version N. |
| Input | Session A submits valid update first. Session B submits another update using stale version N. |
| Steps | 1. Open Organization in two sessions. 2. Save valid update in session A. 3. Save update in session B without refreshing. |
| Expected Result | Session B update fails with HTTP 409 or equivalent UI conflict response. Message key `Pages.Organization.Conflict.Version` or localized equivalent is shown. No overwrite occurs. |
| Note | This is a release-blocking lost-update check. |

### BB-ORG-023: Soft delete active Organization succeeds without physical deletion

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-9 |
| Priority | P0 |
| Category | State |
| Preconditions | ADMIN user is logged in. Active Organization exists and current numeric version is available. |
| Input | Confirm delete for active Organization using current version. |
| Steps | 1. Open active Organization from list/detail. 2. Click delete. 3. Confirm deletion. 4. Check Active/default list and Deleted filter. |
| Expected Result | Organization is soft-deleted. It disappears from Active/default list and appears in Deleted filter. Direct verification confirms the record still exists logically and is not physically deleted. |
| Note | API endpoint expected by spec is `PATCH /api/v1/organizations/{id}/delete`; UI may hide endpoint details. |

### BB-ORG-024: Soft delete with stale numeric version fails with conflict

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-9, AC-ORGANIZATION-13 |
| Priority | P0 |
| Category | Conflict / State |
| Preconditions | ADMIN user is logged in. Same active Organization is opened in two sessions at version N. |
| Input | Session A updates or deletes the Organization first. Session B submits delete with stale version N. |
| Steps | 1. Open Organization in two sessions. 2. Change/delete it in session A. 3. Submit delete in session B without refreshing. |
| Expected Result | Session B delete fails with 409 conflict and `Pages.Organization.Conflict.Version` or localized equivalent. Organization state is not overwritten by stale request. |
| Note | If session A already deleted the record, stale delete must not be treated as a successful fresh delete. |

### BB-ORG-025: Soft-deleted Organization is excluded from default list and visible in Deleted filter

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-10 |
| Priority | P1 |
| Category | Deleted data |
| Preconditions | ADMIN user is logged in. Soft-deleted Organization exists. |
| Input | Default list, Active filter, Deleted filter. |
| Steps | 1. Open default list. 2. Search for deleted Organization. 3. Select Deleted filter. 4. Search again if needed. |
| Expected Result | Deleted Organization is not displayed in default/Active list. It is displayed when Deleted filter is selected. |
| Note | Child-data flows are cascade-soft-deleted when Organization is deleted; restore is not supported. |

### BB-ORG-026: Soft-deleted Organization detail is read-only

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-10 |
| Priority | P1 |
| Category | Deleted data / Permission |
| Preconditions | ADMIN user is logged in. Soft-deleted Organization exists and is visible through Deleted filter. |
| Input | Open deleted Organization detail. |
| Steps | 1. Select Deleted filter. 2. Open deleted Organization detail. 3. Check whether edit/save/delete controls are available. |
| Expected Result | Detail is viewable but read-only. Edit/save controls are disabled or hidden. User cannot update the deleted Organization. |
| Note | If direct API update is attempted for deleted record, it should be rejected according to validation/error behavior. |

### BB-ORG-027: Authenticated non-ADMIN opening Organization screen is logged out and redirected

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-11 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Authenticated non-ADMIN user exists, for example VIEWER or EDITOR. Current language is known, for example `vi`, `en`, or `ja`. |
| Input | Open Organization Management URL directly as non-ADMIN. |
| Steps | 1. Login as non-ADMIN. 2. Enter Organization Management URL directly. |
| Expected Result | FE logs out the user and redirects to `/:lang/login`, preserving current language when possible. Organization data is not displayed. |
| Note | Real provider-backed login can be replaced by an approved test session in automated E2E. |

### BB-ORG-028: Authenticated non-ADMIN direct API call returns 403

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-11 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Authenticated non-ADMIN user/session exists. |
| Input | Direct calls to Organization list/detail/create/update/delete APIs. |
| Steps | 1. Call Organization API as non-ADMIN. 2. Repeat for read and write endpoints if available. |
| Expected Result | BE returns `403 Forbidden` with permission-denied message key such as `Component.Permission.Denied`. No Organization data is returned and no write occurs. |
| Note | This must hold even if FE route guard is bypassed. |

### BB-ORG-029: Unauthenticated Organization API call returns 401 or existing unauthenticated response

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-11 |
| Priority | P0 |
| Category | Permission |
| Preconditions | No valid authenticated session/cookie/token is present. |
| Input | Direct calls to Organization APIs. |
| Steps | 1. Clear authentication. 2. Call Organization list/detail/create/update/delete APIs. |
| Expected Result | Request is rejected by existing authentication behavior, normally `401 Unauthorized`. No Organization data is returned and no write occurs. |
| Note | No Organization-specific unauthenticated override is required unless project contract defines one. |

### BB-ORG-030: Existing traceId/error logging behavior remains observable on Organization API error

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-12 |
| Priority | P2 |
| Category | Operation / Log |
| Preconditions | Test environment can trigger an Organization API error safely, for example validation error, not-found, duplicate, or conflict. Existing global error response behavior is known. |
| Input | Invalid or conflicting Organization request. |
| Steps | 1. Trigger a controlled Organization API error. 2. Inspect response and application log/trace output if available to tester. |
| Expected Result | Existing error response shape and traceId/error logging behavior are not broken. User-facing response does not expose secrets or stack traces. |
| Note | Dedicated audit-log storage is not part of this release. |

### BB-ORG-031: Dedicated audit-log storage is not expected for this release

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-12 |
| Priority | P2 |
| Category | Operation / Audit |
| Preconditions | QA/reviewer has access to release scope and expected audit behavior. |
| Input | Create, update, and soft-delete Organization. |
| Steps | 1. Execute one successful create. 2. Execute one successful update. 3. Execute one successful soft delete. 4. Check release expectation for dedicated audit-log storage. |
| Expected Result | No failure is raised for absence of dedicated audit-log records because dedicated audit log is out of scope. Existing trace/error behavior remains intact. |
| Note | This prevents false failure from expecting a feature explicitly excluded by spec. |

### BB-ORG-032: Double submit does not create duplicate active Organizations or apply duplicate updates

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-4, AC-ORGANIZATION-7, AC-ORGANIZATION-8 |
| Priority | P1 |
| Category | Double submit / Duplicate |
| Preconditions | ADMIN user is logged in. Unique create/update input is prepared. |
| Input | Rapid double click on Save or two near-simultaneous identical API submissions. |
| Steps | 1. Open create or edit form. 2. Submit twice rapidly. 3. Check resulting list/detail and response/errors. |
| Expected Result | At most one successful create/update is applied. Duplicate active code/name is not created. If one request fails, it returns a safe duplicate/conflict/validation response. |
| Note | DB unique constraint race protection is implementation-level; black-box expected result is no duplicate active data. |

### BB-ORG-033: Reload/back navigation preserves safe list behavior without unauthorized data exposure

| item | content |
|---|---|
| Related AC | AC-ORGANIZATION-1, AC-ORGANIZATION-2, AC-ORGANIZATION-3 |
| Priority | P2 |
| Category | Back/reload |
| Preconditions | ADMIN user is logged in. Active and deleted Organizations exist. |
| Input | Browser reload/back after list/search/filter operations. |
| Steps | 1. Open list. 2. Apply search and status filter. 3. Reload page and/or navigate back/forward. |
| Expected Result | Screen remains stable and authorized. It either preserves or safely resets search/filter state according to FE design. Deleted records are not exposed by default after reset. No reload loop occurs. |
| Note | Record actual state preservation behavior if not specified. |

## AC to Black-box Case Mapping

| AC ID | AC summary | Black-box case IDs | Coverage note |
|---|---|---|---|
| AC-ORGANIZATION-1 | ADMIN sees Organization list with active records by default | BB-ORG-001, BB-ORG-002, BB-ORG-033 | Covers normal, empty/default, reload behavior. |
| AC-ORGANIZATION-2 | Search by code/name shows matching records only | BB-ORG-003, BB-ORG-004, BB-ORG-005, BB-ORG-033 | Covers code, name, no-match/character viewpoint. |
| AC-ORGANIZATION-3 | All/Active/Deleted filter displays matching statuses | BB-ORG-006, BB-ORG-033 | Covers status-state behavior and safe reload/back. |
| AC-ORGANIZATION-4 | Valid unique code/name create creates active Organization and returns to list | BB-ORG-007, BB-ORG-008, BB-ORG-009, BB-ORG-010, BB-ORG-011, BB-ORG-012, BB-ORG-032 | Covers success, optional description, required, boundary, double submit. |
| AC-ORGANIZATION-5 | Duplicate active/non-deleted code on create is rejected; deleted reuse allowed | BB-ORG-013, BB-ORG-015 | Covers active duplicate and soft-deleted reuse. |
| AC-ORGANIZATION-6 | Duplicate active/non-deleted name on create is rejected; deleted reuse allowed | BB-ORG-014, BB-ORG-015 | Covers active duplicate and soft-deleted reuse. |
| AC-ORGANIZATION-7 | Editable code updates with valid version; duplicate/stale rejected | BB-ORG-016, BB-ORG-017, BB-ORG-020, BB-ORG-021, BB-ORG-022, BB-ORG-032 | Covers success, duplicate, boundary, stale conflict, double submit. |
| AC-ORGANIZATION-8 | Editable name updates with valid version; duplicate/stale rejected | BB-ORG-018, BB-ORG-019, BB-ORG-020, BB-ORG-021, BB-ORG-022, BB-ORG-032 | Covers success, duplicate, boundary, stale conflict, double submit. |
| AC-ORGANIZATION-9 | Confirmed deletion soft deletes via API and does not physically delete | BB-ORG-023, BB-ORG-024 | Covers success and stale-version conflict. |
| AC-ORGANIZATION-10 | Deleted excluded from default list and viewable read-only via Deleted filter | BB-ORG-002, BB-ORG-025, BB-ORG-026 | Covers default exclusion, deleted visibility, read-only detail. |
| AC-ORGANIZATION-11 | Non-ADMIN screen access logs out/redirects; direct API returns 403 | BB-ORG-027, BB-ORG-028, BB-ORG-029 | Covers FE route guard, BE 403, unauthenticated request. |
| AC-ORGANIZATION-12 | Dedicated audit log out of scope; existing traceId/error logging not broken | BB-ORG-030, BB-ORG-031 | Covers operation/log and audit expectation. |
| AC-ORGANIZATION-13 | Stale version returns 409 and does not overwrite/delete | BB-ORG-022, BB-ORG-024 | Covers stale update and stale delete. |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [x] Character type input
- [x] Numeric input
- [x] Full-width number
- [x] Empty/null
- [x] Duplicate
- [x] Non-existing ID
- [x] Deleted data
- [ ] External IF failure
- [ ] Timeout/retry
- [x] Double submit
- [x] Back/reload
- [x] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output

## Out of Scope / Not Covered by Black-box Cases

| area | reason | follow-up |
|---|---|---|
| External IF failure | Organization management does not require GitHub/Jira/CircleCI calls per current spec. | Cover in connector/webhook tickets. |
| Timeout/retry | No explicit retry/timeout requirement is defined for Organization CRUD. | Add if operation SLA or retry UX is specified. |
| Dedicated audit-log persistence | Explicitly out of scope by AC-ORGANIZATION-12. | Cover in a future audit-log ticket if introduced. |
| Child Customer/Project cascade-soft-delete flows | Covered by Organization soft delete behavior. | Verify child rows move to deleted/inactive state together with the Organization. |

