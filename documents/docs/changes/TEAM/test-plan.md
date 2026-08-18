# Test Plan

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  

## 1. Purpose

Define Phase 6 and Phase 7 verification strategy for TEAM CRUD and Team-Member-Role management. This plan maps each acceptance criterion to automated test type and black-box test case coverage, separates reused coverage from new tests, documents intentionally skipped areas, defines test data policy, and records the commands/results to execute.

Scope in this phase:

- Backend unit tests for Team service authorization, validation, duplicate checks, optimistic locking, soft delete, and membership handling.
- Backend integration/API tests for Team REST API contract, status codes, DTO mapping, and error mapping.
- Frontend unit tests for Team page UI behavior, Team API helper paths/methods, member operations, and i18n-safe rendering.
- Frontend Playwright E2E tests that operate the real browser UI step by step. API calls are allowed only for login, seed, cleanup, or backend evidence after the UI action.
- Phase 7 black-box tests from specification/AC viewpoint, including normal cases, error cases, boundary values, permission, operation/audit viewpoint, migration/schema viewpoint, and i18n.
- Documentation update for this `test-plan.md` and `test-results.md` without changing the existing template structure.

## 2. AC Matrix ↔ Test Type

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-TEAM-1 | Added | Added | Added | Added | N/A | Added | Added |
| AC-TEAM-2 | Added | Added | Added | Added | N/A | Added | Added |
| AC-TEAM-3 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-4 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-5 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-6 | Added | Added | Added | Added | N/A | Added | Added |
| AC-TEAM-7 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-8 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-9 | Partial | Added | Added | Added | Added | Added | Added |
| AC-TEAM-10 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-11 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-12 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-13 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-14 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-15 | Partial | Added | Added | Added | Added | Added | Added |
| AC-TEAM-16 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-17 | Added | Added | Added | Added | Added | Added | Added |
| AC-TEAM-18 | N/A | N/A | Added | Added | Added | N/A | Added |
| AC-TEAM-19 | N/A | N/A | Added | Added | Added | N/A | Added |
| AC-TEAM-20 | Added | N/A | N/A | N/A | N/A | Added | Added |


## 3. Priority

| test item | priority | reason |
|---|---|---|
| ADMIN-only access | P0 | Security requirement. |
| Team Code required/unique/update | P0 | Core master data integrity. |
| Delete Team inactive memberships transactionally | P0 | Data consistency. |
| Add duplicate member in same Team rejected | P0 | Core Team-Member-Role rule. |
| Same member in multiple Teams allowed | P0 | Confirm multi-Team requirement. |
| Update role does not create duplicate membership | P0 | Core role relation rule. |
| E2E real browser coverage | P0 | User explicitly requires real UI E2E, not API-only tests. |
| i18n en/vi/ja | P1 | User-facing quality and spec requirement. |
| Project assignment absent | P1 | Prevent scope creep. |
| Migration indexes/FKs | P1 | Reliability and data integrity. |
| Boundary characters/blank/full-width | P2 | Input robustness. |

## 4. Reuse Existing Test

| existing test | path | covers | gap/status |
|---|---|---|---|
| Existing Team service tests | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/TeamServiceTest.java` | Existing Team search/create/delete/member basics | Expanded in Phase 6 and passed as 18/18 BE unit tests. |
| Existing Team controller tests | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/TeamControllerIntegrationTest.java` | Existing Team API happy/error paths | Expanded in Phase 6 and passed as 11/11 BE integration/API tests. TEAM migration/schema coverage is added separately in `TeamMigrationIntegrationTest`. |
| Organization tests | `EDCAP_FE/src/__ tests __/organization/*` | FE CRUD/API helper pattern | Not Team-specific; used only as style reference. |
| Customer tests | `EDCAP_FE/src/__ tests __/customer/*` | FE CRUD/API helper with detail patterns | Not Team member management; used only as style reference. |
| Organization Playwright E2E | `EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Login token setup, UI locator strategy, cleanup pattern | Not Team-specific; used as E2E style reference. |
| Login tests | `EDCAP_FE/e2e_tests/tests/login.spec.ts`, `EDCAP_FE/src/__tests__/auth/*` | Internal login and auth behavior | TEAM E2E reuses admin login setup only. |

## 5. Additional Test This Time

### 5.1 Test count

| test type | file/suite | count | result | note |
|---|---|---:|---|---|
| BE Unit Test | `TeamServiceTest` | 18 | PASS | Service authorization, validation, duplicate, optimistic locking, soft delete, member/role rules. |
| BE Integration/API Test | `TeamControllerIntegrationTest` | 11 | PASS | REST contract, DTO mapping, status/error mapping, Team member endpoints. |
| BE Migration/Schema Integration Test | `TeamMigrationIntegrationTest` | 1 | PASS | Flyway migration verifies `tbl_team_member` schema and no legacy membership backfill. |
| FE Unit Test | `team-api.test.ts` | 4 | PASS | Team API helper URL/method/body/auth contract. |
| FE Unit Test | `TeamPage.test.tsx` | 9 | PASS | Team page list/search/create/edit/detail/member/delete/filter behavior. |
| FE Unit Test total | `team-api.test.ts` + `TeamPage.test.tsx` | 13 | PASS | Total Team FE unit/component coverage. |
| FE E2E Test | `team.spec.ts` | 10 | PASS | Real Playwright browser UI scenarios. |
| Phase 6 automated test total | BE UT + BE IT/API + BE Migration IT + FE UT + FE E2E | 53 | PASS | Automated regression coverage for TEAM. |
| Phase 7 black-box test total | `blackbox-testcases.md` | 42 | PASS | Specification/AC-based black-box cases executed successfully. |
| Combined TEAM verification total | Phase 6 automated + Phase 7 black-box | 95 | PASS | 95/95 TEAM verification items passed. |

### 5.2 Backend Unit Tests

| test | type | target | related AC |
|---|---|---|---|
| `search_requiresAdminAndNormalizesFilterAndPagination` | BE UT | Search authorization and filter normalization | AC-TEAM-1, AC-TEAM-2 |
| `nonAdminIsDeniedForTeamAndMemberEntryPoints` | BE UT | ADMIN-only service entry points | AC-TEAM-1 |
| `create_trimsValuesAndPersistsActiveTeam` | BE UT | Create Team happy path | AC-TEAM-3 |
| `create_rejectsRequiredFieldsAndDuplicateCode` | BE UT | Required fields and duplicate Team Code | AC-TEAM-3, AC-TEAM-7 |
| `update_allowsCodeChangeAndReloadsUpdatedTeam` | BE UT | Update basic info and editable Team Code | AC-TEAM-5, AC-TEAM-6 |
| `update_rejectsDuplicateCodeDeletedTeamAndOptimisticConflict` | BE UT | Duplicate/update conflict/deleted edit rejection | AC-TEAM-5, AC-TEAM-7, AC-TEAM-8 |
| `softDelete_marksTeamDeletedThroughRepositoryAndReturnsReloadedTeam` | BE UT | Soft delete repository call | AC-TEAM-8, AC-TEAM-9 |
| `softDelete_rejectsAlreadyDeletedAndStaleVersion` | BE UT | Deleted/stale delete rejection | AC-TEAM-8 |
| `listMembers_returnsActiveMembershipsOnly` | BE UT | Active member list | AC-TEAM-10 |
| `addMember_validatesMasterDataAndPersistsActiveMembership` | BE UT | Add existing member with role | AC-TEAM-11, AC-TEAM-12, AC-TEAM-17 |
| `addMember_rejectsMissingMemberMissingRoleInactiveTeamAndDuplicateSameTeam` | BE UT | Add member validation and duplicate same Team rule | AC-TEAM-11, AC-TEAM-12, AC-TEAM-16 |
| `addMember_allowsSameMemberInDifferentTeamsWhenSameTeamDuplicateCheckIsFalse` | BE UT | Same member in different Teams | AC-TEAM-15 |
| `updateMemberRole_updatesExistingActiveMembershipWithoutCreatingDuplicate` | BE UT | Update role only | AC-TEAM-13 |
| `updateMemberRole_rejectsMissingRoleWrongTeamInactiveMembershipAndConflict` | BE UT | Role update validation and conflict | AC-TEAM-13, AC-TEAM-16, AC-TEAM-17 |
| `removeMember_marksMembershipInactiveThroughRepository` | BE UT | Remove member as inactive | AC-TEAM-14 |
| `removeMember_rejectsInactiveMembershipAndConflict` | BE UT | Remove member validation/conflict | AC-TEAM-14 |
| `listOptions_returnsMemberAndRoleMasterData` | BE UT | Member/role master data options | AC-TEAM-11, AC-TEAM-12, AC-TEAM-17 |
| `get_throwsNotFoundWhenMissing` | BE UT | Detail not found behavior | AC-TEAM-4 |

### 5.3 Backend Integration/API Tests

| test | type | target | related AC |
|---|---|---|---|
| `list_returnsPagedTeamsAndPassesSearchParameters` | API IT | `GET /api/v1/teams` | AC-TEAM-1, AC-TEAM-2 |
| `get_returnsDetailWithMembersAndLookupOptions` | API IT | `GET /api/v1/teams/{teamId}` | AC-TEAM-4, AC-TEAM-10, AC-TEAM-17 |
| `create_returns201CreatedTeam` | API IT | `POST /api/v1/teams` | AC-TEAM-3 |
| `update_allowsTeamCodeChangeAndReturnsUpdatedTeam` | API IT | `PUT /api/v1/teams/{teamId}` | AC-TEAM-5, AC-TEAM-6 |
| `softDelete_returnsDeletedTeam` | API IT | `PATCH /api/v1/teams/{teamId}/delete` | AC-TEAM-8, AC-TEAM-9 |
| `listMembers_returnsOnlyMemberDtos` | API IT | `GET /api/v1/teams/{teamId}/members` | AC-TEAM-10 |
| `addMember_returnsCreatedMembershipBody` | API IT | `POST /api/v1/teams/{teamId}/members` | AC-TEAM-11, AC-TEAM-12, AC-TEAM-17 |
| `updateMemberRole_returnsUpdatedMembershipBody` | API IT | `PUT /api/v1/teams/{teamId}/members/{teamMemberId}` | AC-TEAM-13 |
| `removeMember_returnsInactiveMembershipBody` | API IT | `PATCH /api/v1/teams/{teamId}/members/{teamMemberId}/delete` | AC-TEAM-14 |
| `serviceBusinessErrorsAreMappedToHttpStatusCodes` | API IT | Error mapping | AC-TEAM-1, AC-TEAM-3, AC-TEAM-5, AC-TEAM-8 |
| `addMemberDuplicateErrorIsReturnedAs400` | API IT | Duplicate active membership error | AC-TEAM-16 |

| `flywayMigratesTeamMemberSchemaWithoutLegacyBackfill` | DB/Migration IT | Flyway migration creates `tbl_team_member` with required columns, indexes, FKs, and no legacy backfill rows | AC-TEAM-18, AC-TEAM-19 |

### 5.4 Frontend Unit Tests

| test | type | target | related AC |
|---|---|---|---|
| `team-api.test.ts` 4 cases | FE UT | API helper endpoint/method/body/auth contract | AC-TEAM-2..17 |
| `TeamPage.test.tsx` 9 cases | FE UT | Team page list/search/create/edit/detail/member/delete/filter behavior | AC-TEAM-1..17, AC-TEAM-20 |

### 5.5 E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| Non-ADMIN access guard | VIEWER mocked through `/auth/me` | 1. Open `/#/en/teams`; 2. Return non-admin from auth endpoint; 3. Verify redirect to login and logout call | Non-admin cannot use Team Management UI | AC-TEAM-1 |
| Create Team and view detail | Logged in ADMIN | 1. Open Teams; 2. Click Create; 3. Input Team Code/Name/Description; 4. Save; 5. Verify row; 6. Open detail | Team is created and detail displays correct values | AC-TEAM-1, AC-TEAM-3, AC-TEAM-4 |
| Search Team | Logged in ADMIN, Team exists | 1. Search by code; 2. Verify row; 3. Search non-existing keyword; 4. Verify row disappears | Search filters by Team Code/Name keyword | AC-TEAM-2 |
| Edit Team Code/Name | Logged in ADMIN, Team exists | 1. Click Edit; 2. Change Team Code; 3. Change Team Name; 4. Save; 5. Search new code | Team Code is editable and persisted | AC-TEAM-5, AC-TEAM-6 |
| Duplicate Team Code rejected | Existing active Team Code | 1. Create duplicate code from UI; 2. Submit; 3. Verify error toast; 4. Verify API still has one active row | Duplicate active Team Code is rejected | AC-TEAM-7 |
| Add/update/remove member | Team, member, role exist | 1. Open detail; 2. Add member; 3. Select member/role; 4. Save; 5. Edit role; 6. Save; 7. Remove member | Member list updates through real UI | AC-TEAM-10, AC-TEAM-11, AC-TEAM-12, AC-TEAM-13, AC-TEAM-14, AC-TEAM-17 |
| Same member in two Teams | Two Teams exist | 1. Add member to Team A by setup API; 2. Add same member to Team B through UI; 3. Verify both details by API | Same member can belong to multiple Teams | AC-TEAM-15 |
| Duplicate member same Team rejected | Member already active in Team | 1. Open detail; 2. Add same member again; 3. Submit; 4. Verify error toast; 5. Verify one active membership by API | Same member cannot have two active memberships in same Team | AC-TEAM-16 |
| Delete Team cascades memberships | Team has active member | 1. Delete Team from UI; 2. Verify row removed from Active; 3. Filter Deleted; 4. Verify deleted row; 5. Verify no active members by API evidence | Team is soft deleted and active memberships are inactive | AC-TEAM-8, AC-TEAM-9 |
| Locale switch | Logged in ADMIN | 1. Open `/en/teams`; 2. Open `/vi/teams`; 3. Open `/ja/teams`; 4. Verify page and action labels render | Team labels are available in en/vi/ja | AC-TEAM-20 |

### 5.6 Black-box Test Cases

Phase 7 black-box tests were designed from `spec-pack.md`, `test-plan.md`, `impact-analysis.md`, and `docs/standards/testing.md` without relying on internal implementation details.

| artifact | count/status | coverage |
|---|---:|---|
| `docs/changes/TEAM/blackbox-testcases.md` | 42/42 PASS | Normal, error, boundary, permission, audit/operation, migration/schema, and i18n viewpoints. |
| `docs/changes/TEAM/test-data.md` | PASS | Synthetic test data policy, users, Teams, members, roles, negative/boundary data, locale data, cleanup policy. |
| `docs/changes/TEAM/blackbox-review-checklist.md` | PASS | AC coverage, priority, expected result quality, test data quality, permission/security, operation/audit, and regression viewpoint reviewed. |

Black-box result summary:

| result | count |
|---|---:|
| PASS | 42 |
| FAIL | 0 |
| BLOCKED | 0 |
| SKIPPED | 0 |
| Total | 42 |

## 6. Areas intentionally left untested this time

| area | reason | risk |
|---|---|---|
| Team-Project assignment | Out of scope for TEAM AC. | Must ensure no accidental UI/API is introduced in this change. |
| Creating a new member master from Team detail | Requirement says add existing member only. | Users may expect create-new-member, but it is not this ticket. |
| CSV import/export | Out of scope. | None for current TEAM AC. |
| Hard delete | Spec requires soft delete/inactive behavior. | Hard delete would be data loss; tests assert soft delete instead. |
| Full production migration run | Requires DB-backed release environment. | Migration execution must be confirmed before release. |
| Audit trail/log export | Not specified as TEAM AC. | Revisit if audit/log becomes release gate. |

## 7. Test Data Policy

- Use only synthetic test data with prefixes: `UT_TEAM_`, `IT_TEAM_`, `E2E_TEAM_`.
- Do not use production customer, organization, member, or user data.
- Unit tests use deterministic in-memory/mock data.
- Integration tests use deterministic seeded Team/member/role fixtures where possible.
- E2E uses unique suffixes to allow repeatable execution against a shared dev DB.
- E2E may use API for login, setup, cleanup, and backend evidence after UI actions. The user journey itself must be performed through browser UI interactions.
- Cleanup must soft delete only the synthetic `E2E_TEAM_` rows created by the test run.
- Tests must not depend on execution order.
- Member/Role options must come from the app's test/dev master data through Team detail lookup. If no role/member seed exists, E2E should fail with a clear setup error rather than invent data.
- Do not assert private data, production data, or unstable timestamps.

## 8. Execution command

| command | purpose | result |
|---|---|---|
| `cd EDCAP_BE && mvn test -Dtest=TeamServiceTest` | Run TEAM backend unit tests. | PASS, 18/18 |
| `cd EDCAP_BE && mvn verify "-Dit.test=TeamControllerIntegrationTest"` | Run TEAM backend integration/API tests. | PASS, 11/11 |
| `cd EDCAP_BE && mvn verify "-Dit.test=TeamMigrationIntegrationTest"` | Run TEAM DB migration/schema integration test for AC-TEAM-18/19. | PASS, 1/1 |
| `cd EDCAP_FE && .\node_modules\.bin\vitest.cmd run "src/__ tests __/team/team-api.test.ts" "src/__ tests __/team/TeamPage.test.tsx"` | Run TEAM frontend unit/component/API helper tests. | PASS, 13/13 |
| `cd EDCAP_FE && node ./node_modules/@playwright/test/cli.js test e2e_tests/tests/team/team.spec.ts` | Run TEAM real browser Playwright E2E tests. | PASS, 10/10 |
| Execute Phase 7 black-box checklist using `docs/changes/TEAM/blackbox-testcases.md` and `docs/changes/TEAM/test-data.md` | Run specification/AC-based black-box verification. | PASS, 42/42 |

## 9. Stop Condition

- P0 security/business-rule test fails.
- P0 black-box case fails or is blocked without accepted workaround.
- Duplicate active Team Code or duplicate active membership can be created.
- Team delete leaves active memberships behind.
- E2E interacts with API instead of UI for the main scenario actions.
- Locale JSON fails to parse or missing en/vi/ja Team keys break page rendering.
- BE/FE build or test commands fail.

## 10. Required Human Decision

| decision | owner | status |
|---|---|---|
| Live DB apply for TEAM migration before release | BE/Data | Recommended before release |
| Whether to add `data-testid` attributes for more stable E2E selectors | FE | Optional; current E2E passed without blocking Phase 6 |
| Whether Playwright should run against mocked seed API or shared dev DB | QA/FE/BE | Local run completed; standardize before CI |
| Whether to include Phase 7 black-box checklist in release sign-off | QA/PM | Completed for this phase; keep as release evidence |
