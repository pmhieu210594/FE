# Black-box Test Cases

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-TEAM-001 | AC-TEAM-1 | P0 | Permission / Normal | ADMIN opens Team list and sees active Teams |
| BB-TEAM-002 | AC-TEAM-1 | P0 | Permission | Non-ADMIN cannot access Team Management screen |
| BB-TEAM-003 | AC-TEAM-1 | P0 | Permission | Unauthenticated user cannot access Team APIs or screen |
| BB-TEAM-004 | AC-TEAM-2 | P1 | Normal | Search Team by exact Team Code |
| BB-TEAM-005 | AC-TEAM-2 | P1 | Normal | Search Team by partial Team Name |
| BB-TEAM-006 | AC-TEAM-2 | P2 | Boundary / Empty state | Empty and no-match search behaves safely |
| BB-TEAM-007 | AC-TEAM-3 | P0 | Normal | Create Team with valid Team Code and Team Name |
| BB-TEAM-008 | AC-TEAM-3 | P1 | Normal | Create Team with optional description |
| BB-TEAM-009 | AC-TEAM-3 | P1 | Error / Empty | Create fails when Team Code is empty or whitespace |
| BB-TEAM-010 | AC-TEAM-3 | P1 | Error / Empty | Create fails when Team Name is empty or whitespace |
| BB-TEAM-011 | AC-TEAM-3 | P1 | Boundary | Create accepts maximum valid Team field lengths |
| BB-TEAM-012 | AC-TEAM-3 | P1 | Boundary | Create rejects over-maximum Team field lengths |
| BB-TEAM-013 | AC-TEAM-4 | P0 | Normal / State | Update Team Code after creation |
| BB-TEAM-014 | AC-TEAM-5 | P0 | Duplicate / Error | Create rejects duplicate active Team Code |
| BB-TEAM-015 | AC-TEAM-5 | P0 | Duplicate / Error | Update rejects duplicate active Team Code |
| BB-TEAM-016 | AC-TEAM-6 | P0 | Normal | View Team detail with basic information |
| BB-TEAM-017 | AC-TEAM-6 | P0 | Normal / Empty state | View Team detail with empty member list |
| BB-TEAM-018 | AC-TEAM-7 | P0 | Normal / State | Update Team basic information |
| BB-TEAM-019 | AC-TEAM-7 | P1 | Conflict / State | Update Team with stale version is rejected if version is exposed |
| BB-TEAM-020 | AC-TEAM-8 | P0 | State | Soft delete active Team |
| BB-TEAM-021 | AC-TEAM-8 | P1 | Deleted data | Deleted Team is excluded from default active list |
| BB-TEAM-022 | AC-TEAM-9 | P0 | State | Deleting Team inactivates all active memberships |
| BB-TEAM-023 | AC-TEAM-10, AC-TEAM-11 | P0 | Normal | Add existing member with selected role |
| BB-TEAM-024 | AC-TEAM-10 | P1 | Error | Add non-existing or inactive member is rejected |
| BB-TEAM-025 | AC-TEAM-11 | P1 | Error / Empty | Add member without role is rejected |
| BB-TEAM-026 | AC-TEAM-11 | P1 | Master data | Role choices come from available role master data |
| BB-TEAM-027 | AC-TEAM-12 | P0 | Normal | Same member can belong to multiple Teams |
| BB-TEAM-028 | AC-TEAM-13, AC-TEAM-14 | P0 | Duplicate / Error | Duplicate active member in same Team is rejected |
| BB-TEAM-029 | AC-TEAM-15 | P0 | State | Update member role without creating new membership |
| BB-TEAM-030 | AC-TEAM-15 | P1 | Error | Update role with invalid role is rejected |
| BB-TEAM-031 | AC-TEAM-16 | P0 | State | Remove member by inactivating membership |
| BB-TEAM-032 | AC-TEAM-16 | P1 | Deleted data | Removed member is excluded from active member list after reload |
| BB-TEAM-033 | AC-TEAM-17 | P1 | Scope | Team screen does not provide Team-Project assignment |
| BB-TEAM-034 | AC-TEAM-18 | P1 | Locale | Team page labels/buttons/placeholders are available in en/vi/ja |
| BB-TEAM-035 | AC-TEAM-18 | P1 | Locale / Error | Team validation and business errors are localized |
| BB-TEAM-036 | AC-TEAM-19 | P2 | Audit / Scope | Dedicated audit-log storage is not required for Team operations |
| BB-TEAM-037 | AC-TEAM-19 | P2 | Operation / Log | Existing error trace/log behavior remains observable |
| BB-TEAM-038 | AC-TEAM-20 | P0 | Migration / Compatibility | Legacy member team/role fields are not migrated into Team memberships |
| BB-TEAM-039 | AC-TEAM-20 | P1 | Compatibility | Existing member master data remains available without implicit Team membership |
| BB-TEAM-040 | AC-TEAM-1, AC-TEAM-2 | P2 | Back/reload | Reload/back navigation keeps Team list safe and authorized |
| BB-TEAM-041 | AC-TEAM-3, AC-TEAM-7 | P1 | Double submit | Double submit does not create duplicate Teams or apply duplicate updates |
| BB-TEAM-042 | AC-TEAM-8, AC-TEAM-16 | P1 | Double submit / State | Double delete/remove is handled safely without inconsistent state |

## Test Cases

### BB-TEAM-001: ADMIN opens Team list and sees active Teams

| item | content |
|---|---|
| Related AC | AC-TEAM-1 |
| Priority | P0 |
| Category | Permission / Normal |
| Preconditions | ADMIN user is logged in. At least one active Team exists. |
| Input | Open Team Management screen for the current language, for example `/:lang/teams`. |
| Steps | 1. Login as ADMIN. 2. Open Team Management. 3. Observe initial list. |
| Expected Result | Team list is displayed. Active Teams are visible. Create/search/edit/delete actions that belong to Team Management are available to ADMIN. |
| Note | This is black-box behavior; do not assert internal service or mapper names. |

### BB-TEAM-002: Non-ADMIN cannot access Team Management screen

| item | content |
|---|---|
| Related AC | AC-TEAM-1 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Authenticated non-ADMIN user exists. |
| Input | Open `/:lang/teams` and/or call Team APIs as non-ADMIN. |
| Steps | 1. Login as non-ADMIN. 2. Open Team Management screen. 3. Attempt direct Team list API call if API testing is included. |
| Expected Result | Non-ADMIN is blocked according to current authentication standard, for example redirect/logout on UI and 403 for direct API. No Team data is exposed. |
| Note | FE guard alone is not sufficient; direct API behavior must also be checked in black-box/API execution. |

### BB-TEAM-003: Unauthenticated user cannot access Team APIs or screen

| item | content |
|---|---|
| Related AC | AC-TEAM-1 |
| Priority | P0 |
| Category | Permission |
| Preconditions | No active login session/token. |
| Input | Open Team Management screen or call Team API without authentication. |
| Steps | 1. Clear authentication state. 2. Open `/:lang/teams`. 3. Call Team list API without token/session. |
| Expected Result | User is redirected to login or receives the existing unauthenticated response. Team data and mutation actions are not available. |
| Note | Exact status/message follows project-wide authentication standard. |

### BB-TEAM-004: Search Team by exact Team Code

| item | content |
|---|---|
| Related AC | AC-TEAM-2 |
| Priority | P1 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Active Teams exist with distinct Team Codes. |
| Input | Keyword matching one Team Code, for example `TEAM_BB_ALPHA`. |
| Steps | 1. Open Team list. 2. Enter Team Code keyword. 3. Execute search. |
| Expected Result | Matching Team is displayed. Non-matching Teams are excluded from the visible search result. |
| Note | Search behavior should be verified from visible result, not by internal query implementation. |

### BB-TEAM-005: Search Team by partial Team Name

| item | content |
|---|---|
| Related AC | AC-TEAM-2 |
| Priority | P1 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Active Teams exist with distinct Team Names. |
| Input | Partial Team Name keyword, for example `Alpha`. |
| Steps | 1. Open Team list. 2. Enter partial Team Name. 3. Execute search. |
| Expected Result | Teams whose Team Name matches the keyword are displayed. Non-matching Teams are excluded. |
| Note | If case-insensitive search is not explicitly specified, record observed behavior during execution. |

### BB-TEAM-006: Empty and no-match search behaves safely

| item | content |
|---|---|
| Related AC | AC-TEAM-2 |
| Priority | P2 |
| Category | Boundary / Empty state |
| Preconditions | ADMIN user is logged in. Team list contains searchable data. |
| Input | Empty keyword, whitespace keyword, and no-match keyword such as `NO_SUCH_TEAM_BB_999`. |
| Steps | 1. Search with no-match keyword. 2. Clear search keyword or enter empty keyword. 3. Search with whitespace if UI allows. |
| Expected Result | No-match search shows a clear empty state or empty table without error. Empty/cleared search returns safe default list behavior. No unauthorized/deleted data is exposed. |
| Note | This covers boundary and operation safety. |

### BB-TEAM-007: Create Team with valid Team Code and Team Name

| item | content |
|---|---|
| Related AC | AC-TEAM-3 |
| Priority | P0 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Team Code is unique among active Teams. |
| Input | `teamCode=TEAM_BB_CREATE_001`, `teamName=Team Blackbox Create 001`, description empty. |
| Steps | 1. Open create form. 2. Enter valid required fields. 3. Save. 4. Return to list or observe created result. |
| Expected Result | Team is created as active. Created Team is visible in Team list/search/detail. |
| Note | Use synthetic data only. |

### BB-TEAM-008: Create Team with optional description

| item | content |
|---|---|
| Related AC | AC-TEAM-3 |
| Priority | P1 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Team Code is unique. |
| Input | Valid Team Code/Name and optional description within allowed length. |
| Steps | 1. Open create form. 2. Enter required fields and description. 3. Save. 4. Open detail. |
| Expected Result | Team is created. Description is saved and displayed if the UI/API exposes it. |
| Note | If description is not displayed in UI, verify through public detail response if available. |

### BB-TEAM-009: Create fails when Team Code is empty or whitespace

| item | content |
|---|---|
| Related AC | AC-TEAM-3 |
| Priority | P1 |
| Category | Error / Empty |
| Preconditions | ADMIN user is logged in. |
| Input | Empty Team Code, whitespace-only Team Code, valid Team Name. |
| Steps | 1. Open create form. 2. Leave Team Code empty or enter whitespace. 3. Enter valid Team Name. 4. Save. |
| Expected Result | Required-field validation is shown. Team is not created. User can correct input and continue. |
| Note | Message should be localized per AC-TEAM-18. |

### BB-TEAM-010: Create fails when Team Name is empty or whitespace

| item | content |
|---|---|
| Related AC | AC-TEAM-3 |
| Priority | P1 |
| Category | Error / Empty |
| Preconditions | ADMIN user is logged in. |
| Input | Valid Team Code, empty or whitespace-only Team Name. |
| Steps | 1. Open create form. 2. Enter Team Code. 3. Leave Team Name empty or whitespace. 4. Save. |
| Expected Result | Required-field validation is shown. Team is not created. |
| Note | Do not accept whitespace-only value as a valid Team Name. |

### BB-TEAM-011: Create accepts maximum valid Team field lengths

| item | content |
|---|---|
| Related AC | AC-TEAM-3 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | ADMIN user is logged in. Boundary values follow the current product specification or shared validation standard. |
| Input | Team Code at maximum valid length, Team Name at maximum valid length, description at maximum valid length if supported. |
| Steps | 1. Open create form. 2. Enter maximum valid values. 3. Save. 4. Verify created data. |
| Expected Result | Team is created successfully with maximum valid values. Values are displayed without corruption. |
| Note | If exact length is not finalized in spec, record the implemented limit used for execution evidence. |

### BB-TEAM-012: Create rejects over-maximum Team field lengths

| item | content |
|---|---|
| Related AC | AC-TEAM-3 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | ADMIN user is logged in. Over-limit values follow the current product specification or shared validation standard. |
| Input | Team Code just over max length, Team Name just over max length, description just over max length if supported. |
| Steps | 1. Open create form. 2. Enter over-limit values. 3. Save. |
| Expected Result | Validation error is shown. Team is not created. No server error or broken UI occurs. |
| Note | Expected message should be localized where visible. |

### BB-TEAM-013: Update Team Code after creation

| item | content |
|---|---|
| Related AC | AC-TEAM-4 |
| Priority | P0 |
| Category | Normal / State |
| Preconditions | ADMIN user is logged in. Active Team exists. New Team Code is unique. |
| Input | Change Team Code from `TEAM_BB_ALPHA` to `TEAM_BB_ALPHA_NEW`. |
| Steps | 1. Open Team edit form. 2. Change Team Code. 3. Save. 4. Search using old and new code. |
| Expected Result | Update succeeds. New Team Code is displayed and searchable. Old Team Code no longer identifies the updated Team as active current code. |
| Note | This confirms Team Code is editable after creation. |

### BB-TEAM-014: Create rejects duplicate active Team Code

| item | content |
|---|---|
| Related AC | AC-TEAM-5 |
| Priority | P0 |
| Category | Duplicate / Error |
| Preconditions | ADMIN user is logged in. Active Team with code `TEAM_BB_DUP` already exists. |
| Input | Create another Team with `teamCode=TEAM_BB_DUP`. |
| Steps | 1. Open create form. 2. Enter duplicate Team Code and different Team Name. 3. Save. |
| Expected Result | Duplicate-code error is shown. No second active Team with the same Team Code is created. |
| Note | Error text or key should be translated/mapped by UI. |

### BB-TEAM-015: Update rejects duplicate active Team Code

| item | content |
|---|---|
| Related AC | AC-TEAM-5 |
| Priority | P0 |
| Category | Duplicate / Error |
| Preconditions | ADMIN user is logged in. Team A and Team B are active with different Team Codes. |
| Input | Update Team A Code to Team B Code. |
| Steps | 1. Open Team A edit form. 2. Enter Team B's active Team Code. 3. Save. |
| Expected Result | Duplicate-code error is shown. Team A keeps its previous value. Team B remains unchanged. |
| Note | This covers create/update uniqueness. |

### BB-TEAM-016: View Team detail with basic information

| item | content |
|---|---|
| Related AC | AC-TEAM-6 |
| Priority | P0 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Active Team exists. |
| Input | Open Team detail from list/search result. |
| Steps | 1. Open Team list. 2. Select target Team detail. 3. Observe basic information area. |
| Expected Result | Team detail displays Team Code, Team Name, status and other exposed basic information consistently with list/search result. |
| Note | Only visible/API contract fields are asserted. |

### BB-TEAM-017: View Team detail with empty member list

| item | content |
|---|---|
| Related AC | AC-TEAM-6 |
| Priority | P0 |
| Category | Normal / Empty state |
| Preconditions | ADMIN user is logged in. Active Team exists with no active memberships. |
| Input | Open Team detail. |
| Steps | 1. Open Team detail. 2. Observe member list area. |
| Expected Result | Detail opens successfully and shows an empty member list or translated empty state. No error is shown. |
| Note | This validates member-list area even before members are added. |

### BB-TEAM-018: Update Team basic information

| item | content |
|---|---|
| Related AC | AC-TEAM-7 |
| Priority | P0 |
| Category | Normal / State |
| Preconditions | ADMIN user is logged in. Active Team exists. Input values are valid and unique where required. |
| Input | New Team Name and description. Team Code may remain unchanged. |
| Steps | 1. Open edit form. 2. Update Team Name/description. 3. Save. 4. Reopen detail/list. |
| Expected Result | Update succeeds. Updated values are shown in list/detail. No duplicate Team is created. |
| Note | If numeric version is visible, verify it changes only after successful update. |

### BB-TEAM-019: Update Team with stale version is rejected if version is exposed

| item | content |
|---|---|
| Related AC | AC-TEAM-7 |
| Priority | P1 |
| Category | Conflict / State |
| Preconditions | ADMIN user is logged in. Same Team is opened in two sessions/tabs or stale version can be simulated through public API. |
| Input | Update Team from stale state after another update has already succeeded. |
| Steps | 1. Open same Team in two contexts. 2. Save update in context A. 3. Save different update in context B using stale state. |
| Expected Result | Stale update is rejected according to current conflict standard and does not overwrite the latest data. |
| Note | Execute only if version/conflict is observable from public UI/API. |

### BB-TEAM-020: Soft delete active Team

| item | content |
|---|---|
| Related AC | AC-TEAM-8 |
| Priority | P0 |
| Category | State |
| Preconditions | ADMIN user is logged in. Active Team exists and is safe to delete in test environment. |
| Input | Delete Team action and confirmation. |
| Steps | 1. Open Team list or detail. 2. Click delete. 3. Confirm. 4. Search default/active list. |
| Expected Result | Team is logically deleted/inactivated. It is no longer shown as active. Operation does not physically remove unrelated data. |
| Note | This is a destructive-state test; use isolated synthetic data. |

### BB-TEAM-021: Deleted Team is excluded from default active list

| item | content |
|---|---|
| Related AC | AC-TEAM-8 |
| Priority | P1 |
| Category | Deleted data |
| Preconditions | ADMIN user is logged in. A Team has been soft-deleted. |
| Input | Open default Team list and search deleted Team Code. |
| Steps | 1. Open default Team list. 2. Search deleted Team Code. 3. Use deleted/all filter if UI/API exposes it. |
| Expected Result | Deleted Team does not appear in active/default list. If deleted/all filter exists, deleted Team is shown with deleted/inactive state and cannot be modified as active data. |
| Note | If no deleted filter is provided for Teams, verify only default active-list exclusion. |

### BB-TEAM-022: Deleting Team inactivates all active memberships

| item | content |
|---|---|
| Related AC | AC-TEAM-9 |
| Priority | P0 |
| Category | State |
| Preconditions | ADMIN user is logged in. Active Team has at least two active memberships. |
| Input | Delete Team action. |
| Steps | 1. Open Team detail and verify active members exist. 2. Delete Team. 3. Reopen active member view or check public member API for the deleted Team if accessible. |
| Expected Result | Team is inactive/deleted and all active memberships of that Team are inactive/not shown as active. No active membership remains attached to an inactive Team. |
| Note | If UI cannot reopen deleted Team detail, verify via public API/test execution evidence in lower environment. |

### BB-TEAM-023: Add existing member with selected role

| item | content |
|---|---|
| Related AC | AC-TEAM-10, AC-TEAM-11 |
| Priority | P0 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Active Team exists. Existing active member and active role are available. |
| Input | Select member `MEMBER_BB_ALPHA` and role `Developer`. |
| Steps | 1. Open Team detail. 2. Open Add Member dialog/form. 3. Select member. 4. Select role. 5. Save. |
| Expected Result | Member is added to Team and appears in member list with selected role. |
| Note | Member must be existing master/member data; Team screen must not create a new member master record. |

### BB-TEAM-024: Add non-existing or inactive member is rejected

| item | content |
|---|---|
| Related AC | AC-TEAM-10 |
| Priority | P1 |
| Category | Error |
| Preconditions | ADMIN user is logged in. Active Team and valid role exist. |
| Input | Non-existing member identifier or inactive member if selectable/API-callable. |
| Steps | 1. Open Add Member. 2. Attempt to select/submit invalid member. 3. Save. |
| Expected Result | Invalid member cannot be selected or submission is rejected with clear error. No membership is created. |
| Note | UI may prevent invalid input; API black-box can cover direct invalid member submission. |

### BB-TEAM-025: Add member without role is rejected

| item | content |
|---|---|
| Related AC | AC-TEAM-11 |
| Priority | P1 |
| Category | Error / Empty |
| Preconditions | ADMIN user is logged in. Active Team and existing member exist. |
| Input | Member selected, role empty/null. |
| Steps | 1. Open Add Member. 2. Select member. 3. Leave role unselected. 4. Save. |
| Expected Result | Role-required validation is shown. Membership is not created. |
| Note | Message should be localized per AC-TEAM-18. |

### BB-TEAM-026: Role choices come from available role master data

| item | content |
|---|---|
| Related AC | AC-TEAM-11 |
| Priority | P1 |
| Category | Master data |
| Preconditions | ADMIN user is logged in. Role master data has active roles. |
| Input | Open role selector during add/update member flow. |
| Steps | 1. Open Team detail. 2. Open Add Member. 3. Open role selector. 4. Submit with selected active role. |
| Expected Result | Available active roles can be selected. Selected role is saved and displayed. Invalid/inactive role is not accepted if attempted through public API. |
| Note | Do not assert internal table name in black-box except as spec wording; observable behavior is role choices and validation. |

### BB-TEAM-027: Same member can belong to multiple Teams

| item | content |
|---|---|
| Related AC | AC-TEAM-12 |
| Priority | P0 |
| Category | Normal |
| Preconditions | ADMIN user is logged in. Team A, Team B, member Alpha and role exist. |
| Input | Add same member Alpha to Team A and Team B. |
| Steps | 1. Add member Alpha to Team A. 2. Add member Alpha to Team B. 3. Open both Team details. |
| Expected Result | Both Teams show member Alpha as active membership. No global duplicate error is shown. |
| Note | Business uniqueness is scoped to the same Team only. |

### BB-TEAM-028: Duplicate active member in same Team is rejected

| item | content |
|---|---|
| Related AC | AC-TEAM-13, AC-TEAM-14 |
| Priority | P0 |
| Category | Duplicate / Error |
| Preconditions | ADMIN user is logged in. Team A already has member Alpha active with one role. |
| Input | Add member Alpha again to the same Team with same or different role. |
| Steps | 1. Open Team A detail. 2. Open Add Member. 3. Select member Alpha again. 4. Select any valid role. 5. Save. |
| Expected Result | Duplicate active membership is rejected. Same member still has only one active membership and one active role in that Team. |
| Note | This covers both one-active-membership rule and duplicate-add rejection. |

### BB-TEAM-029: Update member role without creating new membership

| item | content |
|---|---|
| Related AC | AC-TEAM-15 |
| Priority | P0 |
| Category | State |
| Preconditions | ADMIN user is logged in. Team member Alpha exists with role Developer. Another active role QA exists. |
| Input | Change role from Developer to QA. |
| Steps | 1. Open Team detail. 2. Edit member Alpha role. 3. Select QA. 4. Save. 5. Reload detail. |
| Expected Result | Member Alpha remains active in Team with role QA. There is still only one active membership for member Alpha in that Team. |
| Note | Verify via visible member list count and role value. |

### BB-TEAM-030: Update role with invalid role is rejected

| item | content |
|---|---|
| Related AC | AC-TEAM-15 |
| Priority | P1 |
| Category | Error |
| Preconditions | ADMIN user is logged in. Active Team member exists. |
| Input | Invalid, inactive, or non-existing role value if public API can submit it. |
| Steps | 1. Attempt to update member role with invalid role. 2. Observe response/UI. |
| Expected Result | Update is rejected with clear error. Existing member role remains unchanged. |
| Note | UI selector may prevent invalid value; API black-box should cover invalid submission where possible. |

### BB-TEAM-031: Remove member by inactivating membership

| item | content |
|---|---|
| Related AC | AC-TEAM-16 |
| Priority | P0 |
| Category | State |
| Preconditions | ADMIN user is logged in. Team has an active member. |
| Input | Remove member action and confirmation. |
| Steps | 1. Open Team detail. 2. Remove member. 3. Confirm. 4. Observe member list. |
| Expected Result | Member disappears from active member list. Member master data is not deleted from the system. |
| Note | This is membership removal, not member deletion. |

### BB-TEAM-032: Removed member is excluded from active member list after reload

| item | content |
|---|---|
| Related AC | AC-TEAM-16 |
| Priority | P1 |
| Category | Deleted data |
| Preconditions | A member was removed from Team by BB-TEAM-031 or equivalent setup. |
| Input | Reload Team detail or refetch member list. |
| Steps | 1. Reload Team detail. 2. Observe member list. 3. Try to add the same member again if allowed. |
| Expected Result | Removed membership is not shown as active. The same member can be added again only as a new valid active membership according to current business behavior. |
| Note | Ensure inactive membership does not block valid future membership if the spec allows re-add. |

### BB-TEAM-033: Team screen does not provide Team-Project assignment

| item | content |
|---|---|
| Related AC | AC-TEAM-17 |
| Priority | P1 |
| Category | Scope |
| Preconditions | ADMIN user is logged in. Team list/create/edit/detail screens are available. |
| Input | Inspect visible Team UI and public Team operation requests. |
| Steps | 1. Open Team list. 2. Open create form. 3. Open edit form. 4. Open detail. 5. Observe available fields/actions. |
| Expected Result | No Project selector, Team-to-Project add action, or Team-Project assignment operation is provided by the Team feature. |
| Note | This prevents scope creep; Project assignment is out of scope for this phase. |

### BB-TEAM-034: Team page labels/buttons/placeholders are available in en/vi/ja

| item | content |
|---|---|
| Related AC | AC-TEAM-18 |
| Priority | P1 |
| Category | Locale |
| Preconditions | ADMIN user is logged in. Localized routes or language switcher are available. |
| Input | Languages: English, Vietnamese, Japanese. |
| Steps | 1. Open Team page in English. 2. Open Team page in Vietnamese. 3. Open Team page in Japanese. 4. Check visible labels, buttons, placeholders and table headers. |
| Expected Result | Team UI text is localized for en/vi/ja. No raw i18n key, missing text, or mojibake appears. |
| Note | Include list, create/edit form, detail and member area. |

### BB-TEAM-035: Team validation and business errors are localized

| item | content |
|---|---|
| Related AC | AC-TEAM-18 |
| Priority | P1 |
| Category | Locale / Error |
| Preconditions | ADMIN user is logged in. Languages en/vi/ja are available. |
| Input | Required-field error, duplicate Team Code error, duplicate member error, role-required error. |
| Steps | 1. Trigger representative validation/business errors in each language. 2. Observe error message area/toast/form helper text. |
| Expected Result | Error messages are understandable and localized/mapped in each supported language. No raw backend code is exposed as final user-facing text unless project standard explicitly allows code display. |
| Note | At least one validation error and one business error should be checked per language. |

### BB-TEAM-036: Dedicated audit-log storage is not required for Team operations

| item | content |
|---|---|
| Related AC | AC-TEAM-19 |
| Priority | P2 |
| Category | Audit / Scope |
| Preconditions | Team create/update/delete/member operations are executed in a test environment. |
| Input | Team operation results and project audit/log expectations. |
| Steps | 1. Execute create/update/delete/member operations. 2. Check release expectation for dedicated Team audit-log storage. |
| Expected Result | Absence of a dedicated Team audit-log storage feature is not treated as a failure for this phase. Normal metadata or existing logs may still be present according to existing standards. |
| Note | This is a scope confirmation AC, not a requirement to build new audit storage. |

### BB-TEAM-037: Existing error trace/log behavior remains observable

| item | content |
|---|---|
| Related AC | AC-TEAM-19 |
| Priority | P2 |
| Category | Operation / Log |
| Preconditions | Team API error can be triggered safely, for example duplicate Team Code or permission error. |
| Input | Invalid Team operation that produces a controlled error. |
| Steps | 1. Trigger a controlled Team error. 2. Observe user-facing error response. 3. Check lower-environment application log/trace if available. |
| Expected Result | Error is handled consistently with project standard. No stack trace or secret is exposed to the user. Existing trace/log behavior remains usable for operation support. |
| Note | This does not require a new dedicated audit log. |

### BB-TEAM-038: Legacy member team/role fields are not migrated into Team memberships

| item | content |
|---|---|
| Related AC | AC-TEAM-20 |
| Priority | P0 |
| Category | Migration / Compatibility |
| Preconditions | Fresh lower-environment database can be migrated from baseline/schema using official migration path. Legacy member master data may exist. |
| Input | Execute official migration path and inspect observable Team membership state through DB/API in lower environment. |
| Steps | 1. Prepare fresh test DB. 2. Run migration. 3. Check Team membership list/state after migration. |
| Expected Result | Migration does not auto-create Team memberships from legacy `tbl_dim_member_pseudonym.team_id/role_id` values. Team memberships exist only when explicitly created by Team membership operation or test fixture. |
| Note | This is black-box from migration output/state; it does not depend on migration SQL implementation details. |

### BB-TEAM-039: Existing member master data remains available without implicit Team membership

| item | content |
|---|---|
| Related AC | AC-TEAM-20 |
| Priority | P1 |
| Category | Compatibility |
| Preconditions | Existing member master data exists after migration. No explicit Team membership has been created for a member. |
| Input | Open Team detail member list and Add Member flow. |
| Steps | 1. Verify member master can be selected as existing member. 2. Verify the member does not appear in Team member list before explicit add. 3. Add member explicitly. |
| Expected Result | Member master data remains usable for selection. No implicit membership appears before explicit add. Explicit add creates visible Team membership. |
| Note | This ensures no hidden migration/backfill behavior leaks into user behavior. |

### BB-TEAM-040: Reload/back navigation keeps Team list safe and authorized

| item | content |
|---|---|
| Related AC | AC-TEAM-1, AC-TEAM-2 |
| Priority | P2 |
| Category | Back/reload |
| Preconditions | ADMIN user is logged in. Team list/search has been used. |
| Input | Browser reload/back/forward actions after list/search/detail navigation. |
| Steps | 1. Search Team. 2. Open detail. 3. Use browser back. 4. Reload page. 5. Repeat after session expiration if possible. |
| Expected Result | UI remains usable, does not expose unauthorized data, and handles session expiration according to authentication standard. |
| Note | This is operation viewpoint and regression safety. |

### BB-TEAM-041: Double submit does not create duplicate Teams or apply duplicate updates

| item | content |
|---|---|
| Related AC | AC-TEAM-3, AC-TEAM-7 |
| Priority | P1 |
| Category | Double submit |
| Preconditions | ADMIN user is logged in. Valid unique create/update input is prepared. |
| Input | Double-click Save or submit same request twice quickly. |
| Steps | 1. Open create or edit form. 2. Submit twice quickly. 3. Observe result/list/detail. |
| Expected Result | Only one Team is created or one update result is applied consistently. No duplicate active Team appears. UI remains recoverable. |
| Note | This is black-box resilience around user operation. |

### BB-TEAM-042: Double delete/remove is handled safely without inconsistent state

| item | content |
|---|---|
| Related AC | AC-TEAM-8, AC-TEAM-16 |
| Priority | P1 |
| Category | Double submit / State |
| Preconditions | ADMIN user is logged in. Active Team and/or active membership exists. |
| Input | Double-click delete/remove or retry same operation after first success. |
| Steps | 1. Execute delete Team or remove member. 2. Immediately attempt same operation again or refresh and retry. |
| Expected Result | State remains consistent. Team/member is inactive once. User sees success or safe already-processed/not-found behavior without broken UI. |
| Note | This guards destructive operation resilience. |

## AC Coverage Matrix

| AC ID | Summary | Black-box cases | Coverage |
|---|---|---|---|
| AC-TEAM-1 | ADMIN-only Team list access | BB-TEAM-001, BB-TEAM-002, BB-TEAM-003, BB-TEAM-040 | Full |
| AC-TEAM-2 | Search by Team Code or Team Name | BB-TEAM-004, BB-TEAM-005, BB-TEAM-006, BB-TEAM-040 | Full |
| AC-TEAM-3 | ADMIN creates Team with valid Code/Name | BB-TEAM-007, BB-TEAM-008, BB-TEAM-009, BB-TEAM-010, BB-TEAM-011, BB-TEAM-012, BB-TEAM-041 | Full |
| AC-TEAM-4 | Team Code can be edited after creation | BB-TEAM-013 | Full |
| AC-TEAM-5 | Duplicate Team Code rejected on create/update | BB-TEAM-014, BB-TEAM-015 | Full |
| AC-TEAM-6 | View Team detail with basic info and members | BB-TEAM-016, BB-TEAM-017 | Full |
| AC-TEAM-7 | ADMIN updates Team basic information | BB-TEAM-018, BB-TEAM-019, BB-TEAM-041 | Full |
| AC-TEAM-8 | ADMIN soft deletes Team | BB-TEAM-020, BB-TEAM-021, BB-TEAM-042 | Full |
| AC-TEAM-9 | Delete Team inactivates active memberships | BB-TEAM-022 | Full |
| AC-TEAM-10 | Add existing member from Team detail | BB-TEAM-023, BB-TEAM-024 | Full |
| AC-TEAM-11 | Role is required and selected from role master | BB-TEAM-023, BB-TEAM-025, BB-TEAM-026 | Full |
| AC-TEAM-12 | Same member can belong to multiple Teams | BB-TEAM-027 | Full |
| AC-TEAM-13 | One active membership/role per member in same Team | BB-TEAM-028 | Full |
| AC-TEAM-14 | Duplicate active member in same Team rejected | BB-TEAM-028 | Full |
| AC-TEAM-15 | Update member role without new membership | BB-TEAM-029, BB-TEAM-030 | Full |
| AC-TEAM-16 | Remove member by inactivating membership | BB-TEAM-031, BB-TEAM-032, BB-TEAM-042 | Full |
| AC-TEAM-17 | No Team-to-Project assignment in this phase | BB-TEAM-033 | Full |
| AC-TEAM-18 | i18n en/vi/ja for Teams | BB-TEAM-034, BB-TEAM-035 | Full |
| AC-TEAM-19 | Dedicated audit log not required | BB-TEAM-036, BB-TEAM-037 | Full / Scope confirmed |
| AC-TEAM-20 | Do not migrate legacy member team/role data | BB-TEAM-038, BB-TEAM-039 | Full |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [x] Character type input
- [ ] Numeric input
- [ ] Full-width number
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
- [x] Migration/output-state compatibility
- [x] i18n/messages

## Out of Scope

| item | reason | handling |
|---|---|---|
| Team-to-Project assignment operation | AC-TEAM-17 explicitly excludes it from this phase. | Confirm absence through BB-TEAM-033. |
| Dedicated Team audit-log storage | AC-TEAM-19 says it is not required for this phase. | Confirm scope through BB-TEAM-036; keep existing error/log observability through BB-TEAM-037. |
| Creating new member master data from Team detail | AC-TEAM-10 says add existing member. | Test only existing-member selection/add flow. |
| Production data migration execution | Black-box design targets local/lower test environment. | Use fresh lower DB and synthetic data only. |
| External connector failure/timeout | Team feature has no external IF dependency in the current AC. | Not applicable for Phase 7. |

## Open Questions / Assumptions

| item | resolved assumption | impact |
|---|---|---|
| Team field max lengths | Use the same validation rule currently applied by Team UI/API. If Organization/Customer shared validation standard is stricter, align Team validation separately in a future change. | Boundary cases are executable with current product behavior. |
| Deleted Team visibility | Team deletion is verified from the active/default Team list. If no Deleted/All filter exists, lower-environment API or DB evidence may be used only to confirm inactive state. | Does not block black-box validation of soft delete behavior. |
| Stale version conflict | Version conflict is treated as API/manual evidence only when the version value is not exposed in the UI. | Core Team CRUD AC remains covered by normal UI/API black-box cases. |
| Error message display | Test execution accepts either localized business message or stable backend error code mapped by UI, as long as the user receives a clear actionable error. | Avoids brittle test failure caused only by wording differences. |

