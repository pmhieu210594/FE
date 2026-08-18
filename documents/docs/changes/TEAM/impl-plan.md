# Implementation Plan

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung / ChatGPT  
**Update date**: 2026-06-15  

## 1. Implementation Principle

- Implement TEAM as a normal admin CRUD feature following the current Organization/Customer implementation pattern.
- Keep the architecture layered: REST controller -> application service/use case -> port -> infrastructure adapter/mapper -> DB.
- Put authorization and business rules in `TeamService`, not only in routing/security config.
- Use `tbl_dim_team` as Team master, `tbl_dim_role` as role source, `tbl_dim_member_pseudonym` as existing member source, and new `tbl_team_member` as the source of Team-Member-Role membership.
- Enforce one active membership per `(team_id, member_key)` in both application logic and DB where possible.
- Use soft delete/inactive behavior for Team and TeamMember. Do not hard delete user-facing data.
- Keep Team-Project assignment out of scope.
- Keep member-master creation/edit out of scope.
- Keep Team-specific audit log module out of scope.
- Keep legacy `tbl_dim_member_pseudonym.team_id/role_id` migration out of scope.
- Add i18n keys for all visible Team UI text and business/validation messages in `en`, `vi`, and `ja`.
- Do not claim tests are passed until actual commands are executed and recorded in later phases.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Implement standalone TEAM CRUD + Team-Member management following Organization/Customer patterns. | Matches AC, isolates scope, aligns with current architecture, reviewable/testable. | Requires new BE/FE module and migration. | Selected |
| B | Embed Team management inside Organization page only. | Smaller navigation footprint. | Does not match spec requiring Team list/detail management; increases coupling. | Rejected |
| C | Reuse legacy FE CRUD/global Redux service. | Potentially less new UI code. | Current active Organization/Customer pages do not use it; risk of dead/legacy pattern. | Rejected |
| D | Store membership in `tbl_dim_member_pseudonym.team_id/role_id`. | Fewer DB changes. | Violates AC: member can belong to multiple Teams and role belongs to membership relation. | Rejected |
| E | Create `tbl_team_member` but enforce duplicate membership only in service. | Simpler migration. | Race condition/data integrity risk; fails robust AC-TEAM-13/14 enforcement. | Rejected |
| F | Add Team-specific audit log table/module. | More traceability. | Explicitly out of scope in AC-TEAM-19. | Rejected |
| G | Drop `tbl_dim_team.project_id` immediately in migration. | Aligns strictly with spec wording. | Destructive/compatibility risk because current schema/index references it. | Conditional: only after dependency check/approval |
| H | Deprecate/ignore `tbl_dim_team.project_id` and do not use it in TEAM UI/API. | Safer rollout; avoids destructive DB risk. | Leaves unused legacy column until separate cleanup. | Preferred unless drop is confirmed safe |

## 3. Reason for Choosing the Alternative Plan

Option A is selected because it satisfies all TEAM AC while staying within current project architecture. Existing Organization/Customer source already provides the closest patterns for admin-only CRUD, page/search responses, soft delete, validation, `@CurrentUser`, repository port/adapter/mapper layering, FE API helper, route/menu structure, and i18n.

The selected plan uses a new `tbl_team_member` because the AC requires a member to belong to multiple Teams and to have exactly one active role per Team. That cannot be represented correctly by a single `team_id` and `role_id` on the member master table.

For `tbl_dim_team.project_id`, the implementation should not expose or use Project assignment in TEAM. However, physical removal from DB must be gated by a dependency check. A safe implementation can ignore/deprecate `project_id` first, then remove it only if no source/schema dependency remains and the migration owner approves.

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V113__team_management.sql` | Add Team management migration: `tbl_team_member`, missing Team fields/indexes, uniqueness constraints, dependency-safe handling for `project_id`. | Required DB/schema support. | AC-TEAM-5,9,10,11,13,14,16,18,20 |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Team.java` | Add Team domain model. | Required BE domain layer. | AC-TEAM-1..9 |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/TeamMember.java` | Add TeamMember domain model. | Required relation model. | AC-TEAM-10..16 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TeamRepositoryPort.java` | Add repository interface methods. | Hexagonal persistence port. | AC-TEAM-2..16 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/TeamRepositoryAdapter.java` | Add repository adapter. | Infrastructure implementation. | AC-TEAM-2..16 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/TeamMapper.java` | Add SQL mapper for Team and membership queries. | DB access. | AC-TEAM-2..16 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/TeamService.java` | Add business logic, validation, transactions and ADMIN guard. | Core TEAM implementation. | AC-TEAM-1..16,19,20 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/TeamDtos.java` | Add Team/TeamMember request/response DTOs. | API contract. | AC-TEAM-1..18 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` | Add REST API endpoints. | FE/BE contract. | AC-TEAM-1..16 |
| `EDCAP_FE/src/lib/api.ts` | Add Team/TeamMember types and endpoint helpers. | FE typed API access. | AC-TEAM-1..18 |
| `EDCAP_FE/src/pages/TeamPage.tsx` | Add Team list/detail/form/member management page. | Main UI. | AC-TEAM-1..18 |
| `EDCAP_FE/src/App.tsx` | Add `/:lang/teams` route with `RequireAdmin`. | Route exposure and FE access control. | AC-TEAM-1 |
| `EDCAP_FE/src/components/Layout.tsx` | Add Teams navigation item. | Discoverability. | AC-TEAM-1 |
| `EDCAP_FE/public/locales/en/locale.json` | Add English Team i18n keys. | Required i18n. | AC-TEAM-18 |
| `EDCAP_FE/public/locales/vi/locale.json` | Add Vietnamese Team i18n keys. | Required i18n. | AC-TEAM-18 |
| `EDCAP_FE/public/locales/ja/locale.json` | Add Japanese Team i18n keys. | Required i18n. | AC-TEAM-18 |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/TeamServiceTest.java` | Add service unit tests. | Business rule verification. | AC-TEAM-1..16 |
| `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/TeamControllerIntegrationTest.java` | Add API integration tests. | Contract/security verification. | AC-TEAM-1..16 |
| `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/infrastructure/persistence/migration/TeamMigrationIntegrationTest.java` | Add migration tests. | DB constraints/index verification. | AC-TEAM-5,13,14 |
| `EDCAP_FE/src/__ tests __/team/team-api.test.ts` | Add FE API tests. | API helper verification. | AC-TEAM-1..18 |
| `EDCAP_FE/src/__ tests __/team/TeamPage.test.tsx` | Add FE component tests. | UI behavior/i18n verification. | AC-TEAM-1..18 |
| `docs/changes/TEAM/*` | Update review/test/report artifacts in later phases. | Traceability. | All AC |

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| `TeamService#search` | add | `keyword`, `status`, `page`, `size`, `caller` | `PageResult<Team>` | ADMIN-only; default active; trim keyword. |
| `TeamService#get` | add | `teamId`, `caller` | Team detail or Team | ADMIN-only; non-deleted Team by default. |
| `TeamService#create` | add | `teamCode`, `teamName`, `description`, optional `status`, `caller` | `Team` | Validate required fields and unique active code. |
| `TeamService#update` | add | `teamId`, request fields, `version`, `caller` | `Team` | Team Code editable; unique check; optimistic lock if version used. |
| `TeamService#softDelete` | add | `teamId`, `version`, `caller` | `Team` | Transactionally inactive Team and active memberships. |
| `TeamService#listMembers` | add | `teamId`, `caller` | `List<TeamMember>` | Active members by default; validate Team. |
| `TeamService#addMember` | add | `teamId`, `memberKey`, `roleId`, `caller` | `TeamMember` | Validate Team/member/role, no duplicate active membership. |
| `TeamService#updateMemberRole` | add | `teamId`, `teamMemberId`, `roleId`, `version`, `caller` | `TeamMember` | Update existing active membership only. |
| `TeamService#removeMember` | add | `teamId`, `teamMemberId`, `version`, `caller` | `TeamMember` or status result | Inactive only; no hard delete. |
| `TeamService#requireAdmin` | add private | `AppUser caller` | none | Same intent as Organization/Customer service. |
| `TeamRepositoryPort#findPage` | add | normalized filters/offset/limit | `List<Team>` | SQL excludes deleted/inactive by default. |
| `TeamRepositoryPort#count` | add | normalized filters | `long` | Page total. |
| `TeamRepositoryPort#findById` | add | `teamId` | `Optional<Team>` | Detail/update/delete lookup. |
| `TeamRepositoryPort#existsActiveCode` | add | code, optional exclude ID | `boolean` | Unique Team Code. |
| `TeamRepositoryPort#insert` | add | `Team` | `Team` | Create Team. |
| `TeamRepositoryPort#update` | add | `Team` | affected rows | Optimistic locking. |
| `TeamRepositoryPort#softDelete` | add | ID/version/actor/timestamp | affected rows | Team soft delete. |
| `TeamRepositoryPort#inactiveActiveMembersByTeam` | add | teamId/actor/timestamp | affected rows | Cascade membership inactive. |
| `TeamRepositoryPort#findMembers` | add | teamId/status | `List<TeamMember>` | Team detail/member list. |
| `TeamRepositoryPort#existsActiveMembership` | add | teamId/memberKey/exclude ID | `boolean` | Duplicate active member check. |
| `TeamRepositoryPort#insertMember` | add | `TeamMember` | `TeamMember` | Add member. |
| `TeamRepositoryPort#updateMemberRole` | add | member relation/version/role/actor | affected rows | Update role only. |
| `TeamRepositoryPort#inactiveMember` | add | teamMemberId/version/actor/time | affected rows | Remove member. |
| `TeamRepositoryPort#existsMember` | add | memberKey | `boolean` | Validate existing member. |
| `TeamRepositoryPort#existsRole` | add | roleId | `boolean` | Validate existing role. |
| `TeamController#list/get/create/update/softDelete/listMembers/addMember/updateMember/removeMember` | add | HTTP request data | DTO response | Thin controller; no business logic. |
| `endpoints.teams.list/get/create/update/softDelete/listMembers/addMember/updateMember/removeMember` | add | typed FE params/body | typed FE DTO | Names must match final BE contract. |

## 6. SQL / Query / Repository Policy

- Confirm latest migration version before creating the TEAM migration. Current observed latest is `V112`; candidate next file is `V113__team_management.sql`.
- Do not edit historical migrations in normal implementation. Add a new Flyway migration.
- Reuse `tbl_dim_team` as Team master.
- Reuse `tbl_dim_role` for Team member roles.
- Reuse `tbl_dim_member_pseudonym` only as selectable existing member source.
- Create `tbl_team_member` as the only source for Team-Member-Role membership in this ticket.
- Do not use `tbl_dim_member_pseudonym.team_id/role_id` for membership and do not migrate legacy values.
- Add a service check and DB-level unique active constraint for `(team_id, member_key)`.
- Add indexes for Team list/search and Team member list operations.
- Exclude inactive/deleted data by default unless the API explicitly supports status filtering.
- If any dynamic sort is implemented, whitelist sortable fields; never concatenate raw user input into `ORDER BY`.
- Validate `roleId` and `memberKey` existence before insert/update, even if FK also exists, to return controlled business errors.
- Do not physically delete Team or TeamMember from user-facing flows.
- For `tbl_dim_team.project_id`, first run dependency checks. Prefer not using/deprecating it over dropping it unless approved.

## 7. Validation / Error / Logging Policy

| case | policy |
|---|---|
| Caller unauthenticated | Standard 401 via existing auth filter/security. |
| Caller not ADMIN | Throw existing forbidden exception/message pattern from Team service. |
| Missing Team Code | Business/validation error key for Team Code required. |
| Missing Team Name | Business/validation error key for Team Name required. |
| Team Code too long | Business/validation error key for max length. |
| Team Name too long | Business/validation error key for max length. |
| Duplicate active Team Code | Return business error key/code equivalent to `TEAM_CODE_DUPLICATED`. |
| Updating deleted/inactive Team | Reject with Team not active/edit not allowed message. |
| Deleting already deleted Team | Reject with already deleted message or idempotent behavior only if project standard says so. |
| Missing Role on add/update member | Required role validation error. |
| Member does not exist | Business/not-found error. |
| Role does not exist | Business/not-found error. |
| Duplicate active Team member | Return business error key/code equivalent to `TEAM_MEMBER_ALREADY_EXISTS`. |
| Updating inactive membership | Return `TEAM_MEMBER_NOT_FOUND` or final project message key. |
| Add member to inactive Team | Return `TEAM_NOT_ACTIVE` or final project message key. |
| Optimistic lock conflict | Use existing `OptimisticLockingException` pattern. |
| Logging | Log operation context and trace ID if available. Do not log tokens/secrets/auth headers. Minimize member/person data. |

## 8. Migration / Rollback Policy

- Migration should be additive where possible.
- Add `tbl_team_member` with normal metadata/version fields consistent with existing schema.
- Add unique active index/constraint after checking for duplicates if any seed/test data is inserted.
- Add missing Team Code/status/metadata fields only if current `tbl_dim_team` does not already have them.
- Do not drop `tbl_dim_team.project_id` until dependency check confirms it is safe and migration owner approves it.
- If dropping `project_id`, migration must also handle `idx_team_project` and FK constraints safely.
- Rollback before production use: revert BE/FE code and drop newly added table/index/columns if no writes happened.
- Rollback after production use: disable route/menu/API first; decide whether to preserve `tbl_team_member` data for future recovery. Manual data cleanup may be required.
- Every migration decision must be reflected in `test-results.md` and `report.md` in later phases.

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Confirm final source/schema state and latest migration version. | `db/migration/`, source grep | Latest version and DB dependencies recorded. | Latest version differs or `project_id` dependency is unclear. |
| 2 | Decide safe `tbl_dim_team.project_id` handling. | DB migration plan | Decision recorded: ignore/deprecate or drop with approval. | Destructive drop needed but not approved. |
| 3 | Add TEAM DB migration. | `V113__team_management.sql` or actual next version | Migration applies locally/test; table/index/FK exists. | Migration fails or duplicate/pre-check risk found. |
| 4 | Add domain models. | `Team.java`, `TeamMember.java` | Backend compile. | Field/schema mismatch. |
| 5 | Add repository port/adapter/mapper. | `TeamRepositoryPort.java`, `TeamRepositoryAdapter.java`, `TeamMapper.java` | Backend compile and mapper tests if available. | SQL fails against migrated schema. |
| 6 | Add Team service. | `TeamService.java` | Unit tests for validation/auth/business rules. | Business rule conflict. |
| 7 | Add controller and DTOs. | `TeamController.java`, `TeamDtos.java` | API integration tests/manual HTTP calls. | Contract mismatch with spec/FE. |
| 8 | Add minimal member/role lookup support. | Team controller/service/repository or dedicated lookup DTOs/methods | FE can select existing active members and active roles. | Lookup work expands into member/role master management. |
| 9 | Add FE API types/helpers. | `EDCAP_FE/src/lib/api.ts` | Typecheck/API helper tests. | Endpoint/DTO mismatch with BE. |
| 10 | Add Team page UI. | `EDCAP_FE/src/pages/TeamPage.tsx` | Component tests/manual UI flow. | UI requires out-of-scope Team-Project/member-master features. |
| 11 | Add route and navigation. | `App.tsx`, `Layout.tsx` | ADMIN can access; non-admin redirected/blocked. | Route conflicts or i18n route issue. |
| 12 | Add i18n keys. | `public/locales/en/vi/ja/locale.json` | JSON parse/build; locale switch check. | Missing translation/key naming conflict. |
| 13 | Add/update automated tests. | BE/FE test files | Unit/API/migration/component tests pass or failures documented. | Environment blocker or critical failing regression. |
| 14 | Run full verification. | BE/FE commands | Commands recorded in `test-results.md` later. | Security/data integrity failure. |
| 15 | Update ticket artifacts. | `self-review.md`, `test-results.md`, `report.md`, checklist files | AC traceability complete. | Evidence missing for any completed claim. |

## 10. How to Verify Each Step

| step | verification | expected result |
|---|---|---|
| 1 | `find`/`grep` migrations and source references | Correct latest migration version and dependencies known. |
| 2 | Review `tbl_dim_team.project_id` references in SQL/mappers/tests/docs | No unsafe drop proceeds without approval. |
| 3 | Run Flyway/migration test or backend integration test profile | `tbl_team_member` and constraints/indexes exist. |
| 4 | Run BE compile/test command | Domain models compile with Lombok/project settings. |
| 5 | Run mapper/repository tests or API integration through repository | SQL maps correctly and returns expected Team/TeamMember data. |
| 6 | Run `TeamServiceTest` | ADMIN guard, validation, duplicate checks, inactive rules, and transaction decisions behave as planned. |
| 7 | Run `TeamControllerIntegrationTest` | HTTP status, request/response, 401/403, and error mappings are correct. |
| 8 | Manual/API test member/role lookup endpoints | Team UI has valid existing active member/role options without out-of-scope master management. |
| 9 | Run FE API helper tests/typecheck | API paths/body/query mapping match BE contract. |
| 10 | Run FE component tests | Team list/detail/form/member interactions behave correctly. |
| 11 | Manual route test and component test | ADMIN sees Teams route; non-admin cannot use it. |
| 12 | Run FE build or JSON parse check | Locale JSON is valid UTF-8 and all keys resolve. |
| 13 | Run targeted BE/FE tests | New tests pass or blockers documented. |
| 14 | Run regression suite where environment allows | Existing Organization/Customer/Auth behavior remains intact. |
| 15 | Review docs | No artifact claims PASS/DONE without evidence. |

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-TEAM-1 | FE `RequireAdmin` route/menu and BE `TeamService#requireAdmin` | Security/API/route tests: non-admin blocked, ADMIN allowed. |
| AC-TEAM-2 | `TeamService#search`, `GET /api/v1/teams`, keyword filter in mapper/UI | Search by Team Code and Team Name tests. |
| AC-TEAM-3 | `TeamService#create`, `POST /api/v1/teams`, create form | Create success and validation tests. |
| AC-TEAM-4 | `TeamService#update` allows `teamCode` change | Update Team Code test. |
| AC-TEAM-5 | `existsActiveCode` plus DB unique active constraint/index | Duplicate create/update tests and DB constraint test. |
| AC-TEAM-6 | Detail endpoint/page/member list | Detail UI/API tests for basic info and members. |
| AC-TEAM-7 | Update endpoint/page | ADMIN update tests. |
| AC-TEAM-8 | Soft delete endpoint/page | Delete/inactive Team tests. |
| AC-TEAM-9 | `softDelete` transaction calls inactive memberships | Integration test confirms active memberships become inactive. |
| AC-TEAM-10 | `addMember` endpoint/form | Add existing member test. |
| AC-TEAM-11 | Role required and role existence validation against `tbl_dim_role` | Missing/invalid role tests. |
| AC-TEAM-12 | No cross-Team uniqueness for member | Same member added to two Teams test. |
| AC-TEAM-13 | Unique active `(team_id, member_key)` and one active role | Service and DB duplicate active membership tests. |
| AC-TEAM-14 | Duplicate active add rejected with business error | API/service error test. |
| AC-TEAM-15 | `updateMemberRole` updates existing relation only | Test relation ID unchanged and role changes. |
| AC-TEAM-16 | `removeMember` inactive membership only | Test member master remains and relation inactive. |
| AC-TEAM-17 | No Project selector/API/repository behavior in TEAM | Code review checklist and absence tests/manual review. |
| AC-TEAM-18 | Locale keys in `en`, `vi`, `ja` | FE build/i18n/component tests. |
| AC-TEAM-19 | No Team-specific audit module/table | Review migration/source diff. |
| AC-TEAM-20 | No migration from `tbl_dim_member_pseudonym.team_id/role_id` | Migration review and grep. |

## 12. Stop / Ask Condition

- Stop if final Team Code unique scope is not accepted as global active uniqueness.
- Stop if `tbl_dim_team.project_id` removal is required but dependencies remain or migration owner approval is missing.
- Stop if member/role lookup implementation would require creating a full member/role master management feature; minimal read-only lookup endpoints are approved in scope.
- Stop if implementation discovers existing Team source not captured here that conflicts with this plan.
- Stop if DB migration requires destructive data changes beyond adding `tbl_team_member` and safe Team metadata/indexes.
- Stop if API error/response wrapper cannot be matched to existing project conventions.
- Stop if security change would require global auth redesign rather than TEAM-only authorization.
- Stop before production migration, destructive rollback, or hard delete operation.

## 13. Do Not Do This Ticket

- Do not implement Team-Project assignment.
- Do not add a Project selector to Team create/update/detail.
- Do not create/edit/delete member master records from Team detail.
- Do not add import/export.
- Do not add Team hierarchy/parent-child Team.
- Do not add dashboard/KPI analytics by Team.
- Do not add external sync for Team.
- Do not add Team-specific audit log table/module.
- Do not hard delete Team or TeamMember in user-facing flows.
- Do not migrate legacy `tbl_dim_member_pseudonym.team_id/role_id` data.
- Do not use legacy FE router/global CRUD service unless current app wiring proves it is required.
- Do not change Login/auth core for TEAM.
- Do not change Organization/Customer business behavior except unavoidable compile-safe shared updates.

## 14. Open Related Issues

| ID | issue | impact | proposed action | status |
|---|---|---|---|---|
| OI-TEAM-P3-001 | `tbl_dim_team.project_id` exists in current schema/index but TEAM scope excludes Team-Project. | DB compatibility/migration risk. | Prefer ignore/deprecate; drop only after dependency check and approval. | Open for implementation check |
| OI-TEAM-P3-002 | No confirmed member/role lookup endpoint for FE selection. | Team detail add-member form needs options. | Implement minimal read-only lookup endpoints for selectable active members and roles within TEAM scope. | Resolved: option A selected by project owner |
| OI-TEAM-P3-003 | Team create HTTP status differs between Organization pattern (`201`) and Customer pattern (`200`). | API consistency decision. | Use `201 Created` for Team create unless project owner says to mimic Customer. | Planned |
| OI-TEAM-P3-004 | Auth documentation drift: some docs mention session cookie but source uses bearer token/localStorage. | Security documentation drift. | Follow current source for TEAM; do not redesign auth in this ticket. | Documented |
| OI-TEAM-P3-005 | Existing test environment may need dependency/tool setup before command verification. | Later test phase may be blocked. | Record exact failures in `test-results.md`; do not claim pass without rerun. | Open for test phase |
