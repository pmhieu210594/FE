# Impact Analysis

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung / ChatGPT  
**Update date**: 2026-06-15  

## 1. Change Content

Implement the TEAM management feature described in `docs/changes/TEAM/spec-pack.md`.

The change covers:

- ADMIN-only Team list/search/create/detail/update/soft-delete.
- Team Code and Team Name validation.
- Editable Team Code with active-scope uniqueness.
- Team detail with active member list.
- Add existing member to Team with required Role from `tbl_dim_role`.
- Update member role without creating a new active membership.
- Remove member by inactive/soft-delete membership.
- Delete Team by inactive/soft-delete Team and inactive all active memberships in the same transaction.
- New `tbl_team_member` relation table.
- i18n keys for `ja`, `vi`, `en`.
- No Team-Project assignment, no member-master creation, no Team-specific audit module, no legacy migration from `tbl_dim_member_pseudonym.team_id/role_id`.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V113__team_management.sql` | Add `tbl_team_member`; add/adjust Team columns/indexes/constraints needed for AC; handle `tbl_dim_team.project_id` per spec after dependency check | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Team.java` | Domain model for Team master | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/TeamMember.java` | Domain model for Team-Member-Role relation | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TeamRepositoryPort.java` | Persistence port for Team and TeamMember operations | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/TeamRepositoryAdapter.java` | Adapter from service to MyBatis mapper | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/TeamMapper.java` | SQL for Team search/detail/create/update/delete/member operations | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/TeamService.java` | Core business rules, authorization, validation, transaction boundaries | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/TeamDtos.java` | Request/response contract for Team and TeamMember APIs | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` | REST endpoints under `/api/v1/teams` | add |
| `EDCAP_FE/src/lib/api.ts` | Add Team/TeamMember types and `endpoints.teams.*` | modify |
| `EDCAP_FE/src/pages/TeamPage.tsx` | New Team management screen | add |
| `EDCAP_FE/src/App.tsx` | Add `/:lang/teams` route protected by `RequireAdmin` | modify |
| `EDCAP_FE/src/components/Layout.tsx` | Add navigation item for Teams | modify |
| `EDCAP_FE/public/locales/en/locale.json` | Add English Team labels, placeholders, validation and business error messages | modify |
| `EDCAP_FE/public/locales/vi/locale.json` | Add Vietnamese Team labels, placeholders, validation and business error messages | modify |
| `EDCAP_FE/public/locales/ja/locale.json` | Add Japanese Team labels, placeholders, validation and business error messages | modify |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/TeamServiceTest.java` | Unit coverage for business rules and validation | add |
| `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/TeamControllerIntegrationTest.java` | API/security integration coverage | add |
| `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/infrastructure/persistence/migration/TeamMigrationIntegrationTest.java` | Migration/constraint/index coverage | add |
| `EDCAP_FE/src/__ tests __/team/team-api.test.ts` | FE API helper coverage | add |
| `EDCAP_FE/src/__ tests __/team/TeamPage.test.tsx` | FE page behavior/i18n/security routing coverage | add |
| `docs/changes/TEAM/test-plan.md` | Later phases must align tests to final implementation | modify later |
| `docs/changes/TEAM/test-results.md` | Later phases must record executed command results | modify later |
| `docs/changes/TEAM/self-review.md` | Later phases must record implementation self-review | modify later |
| `docs/changes/TEAM/report.md` | Later phases must record final status and residual risks | modify later |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | TEAM endpoints will be authenticated by default. Usually no route-specific change is required because service-level ADMIN guard is planned. | Low if unchanged; high if implementer relies only on `anyRequest().authenticated()`. |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/*` | TEAM will reuse standard business/not-found/forbidden/optimistic-lock exceptions. | Low; avoid new exception framework. |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing schema defines `tbl_dim_team`, `tbl_dim_role`, `tbl_dim_member_pseudonym`, legacy `team_id/role_id`, and `idx_team_project`. | Medium/high if historical migration is edited; do not edit historical migrations unless project policy explicitly allows it. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/*` | Some existing mappers may reference `tbl_dim_team.project_id` or Team/member fields indirectly. | Medium; grep before dropping/deprecating columns. |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/*` | Some metric/project models may reference Team IDs. | Low/medium; do not change unrelated models unless compile proves necessary. |
| `EDCAP_FE/src/pages/OrganizationPage.tsx` | Organization page may conceptually relate to Teams, but spec does not require embedding Teams there. | Low; avoid scope creep. |
| `EDCAP_FE/src/pages/CustomerPage.tsx` | Existing admin CRUD pattern only; no direct TEAM feature dependency. | Low; avoid accidental regression. |
| `EDCAP_FE/src/i18n.ts` | Locale infrastructure should not need change if adding keys only. | Low; change only if Team key loading fails. |
| `EDCAP_FE/src/router.ts`, `EDCAP_FE/src/router.tsx` | Legacy/unwired routing may confuse implementation. | Low if not touched. |
| `EDCAP_FE/src/services/crud/*`, `EDCAP_FE/src/services/global/*` | Legacy/global store code may look reusable but is not the active Organization/Customer pattern. | Medium if used accidentally. |
| `EDCAP_BE/src/test/UnitTest/java/.../OrganizationServiceTest.java` | Pattern reference for Team tests. | Low. |
| `EDCAP_FE/src/__ tests __/organization/*` | Pattern reference for Team tests. | Low. |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| Browser route `/:lang/teams` | `TeamPage` | New ADMIN-only page route. |
| `Layout` navigation | `/:lang/teams` | New Teams menu item visible to ADMIN. |
| `TeamPage` | `endpoints.teams.list` | Search/list Teams by keyword/status/page/size. |
| `TeamPage` | `endpoints.teams.get` | Load Team detail and active members. |
| `TeamPage` | `endpoints.teams.create` | Create Team. |
| `TeamPage` | `endpoints.teams.update` | Update Team basic info and editable Team Code. |
| `TeamPage` | `endpoints.teams.softDelete` | Soft delete/inactive Team. |
| `TeamPage` | `endpoints.teams.listMembers` | Show active Team members. |
| `TeamPage` | `endpoints.teams.addMember` | Add existing member with role. |
| `TeamPage` | `endpoints.teams.updateMemberRole` | Update role on existing active membership. |
| `TeamPage` | `endpoints.teams.removeMember` | Inactive/remove membership. |
| FE API client | `/api/v1/teams*` | New typed API contract. |
| `TeamController` | `TeamService` | Thin REST layer; all rules remain in service. |
| `TeamService` | `TeamRepositoryPort` | Business logic calls persistence and existence checks. |
| `TeamRepositoryAdapter` | `TeamMapper` | Persistence adapter delegates SQL. |
| `TeamMapper` | `tbl_dim_team`, `tbl_team_member`, `tbl_dim_member_pseudonym`, `tbl_dim_role` | SQL reads/writes Team and Team membership data. |
| `TeamService` | `AppUser` / `CurrentUser` caller | ADMIN authorization and actor metadata resolution. |

## 5. FE Impact

- Add new `TeamPage.tsx` following active Organization/Customer patterns rather than legacy router/global CRUD service.
- Add route in `App.tsx` under `RequireAdmin`.
- Add navigation entry in `Layout.tsx`; place under the same admin/system-admin group unless final UX says otherwise.
- Add Team API types and endpoint methods in `src/lib/api.ts`, including minimal member/role lookup helpers for Team member forms.
- Add UI for list/search, create/edit, detail, member list, add member, update role, remove member, and soft delete Team.
- Add i18n keys to all three locale JSON files: `en`, `vi`, `ja`.
- Add handling for business error codes such as `TEAM_CODE_DUPLICATED`, `TEAM_MEMBER_ALREADY_EXISTS`, `TEAM_NOT_ACTIVE`, `TEAM_MEMBER_NOT_FOUND`, and required-role validation. Final key names should match backend error keys.
- Do not hard-code visible strings in Team UI.
- Do not implement Team-Project assignment UI.
- Do not add member-master creation UI from Team detail.

## 6. BE Impact

- Add Team REST controller, DTOs, service, domain models, repository port, adapter, and mapper.
- Add minimal read-only lookup support for existing active members and roles within TEAM scope; this is limited to selection options for Team member forms.
- Reuse current Spring Boot / MyBatis / hexagonal layering.
- Enforce ADMIN for every Team use case in service, because current `SecurityConfig` authenticates but does not authorize by role for arbitrary paths.
- Implement transactions for create/update/delete/member operations; Team delete and membership inactive cascade must be a single transaction.
- Use existing exception style: `BusinessRuleException`, `NotFoundException`, `ForbiddenException`, `OptimisticLockingException`.
- Normalize input with trim and max-length validation following Organization/Customer service pattern.
- Ensure duplicate active Team Code check and duplicate active Team member check.
- Ensure role exists in `tbl_dim_role` and member exists in `tbl_dim_member_pseudonym` before creating/updating membership.
- Avoid changing unrelated connector, webhook, batch, or evidence ingestion services.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `GET /api/v1/teams` | New query params: `keyword`, `status`, `page`, `size`; optional `sort` only if whitelisted | New paged Team list DTO with `memberCount` | Yes, new endpoint |
| `GET /api/v1/teams/{teamId}` | New path param `teamId` | New Team detail DTO including basic Team info and member list or linkable members | Yes, new endpoint |
| `POST /api/v1/teams` | New create request: `teamCode`, `teamName`, optional `description`, optional/default `status` | New Team DTO; recommended `201 Created` following Organization | Yes, new endpoint |
| `PUT /api/v1/teams/{teamId}` | New update request: editable `teamCode`, `teamName`, optional `description`, optional `status`, `version` if used | Updated Team DTO | Yes, new endpoint |
| `PATCH /api/v1/teams/{teamId}/delete` | New delete request with `version` if used | Soft-deleted/inactive Team DTO | Yes, new endpoint |
| `GET /api/v1/teams/{teamId}/members` | New path param; optional status if needed | Active Team member list DTO | Yes, new endpoint |
| `POST /api/v1/teams/{teamId}/members` | New request: `memberKey`, `roleId` | New TeamMember DTO | Yes, new endpoint |
| `PUT /api/v1/teams/{teamId}/members/{teamMemberId}` | New request: `roleId`, optional `version` | Updated TeamMember DTO | Yes, new endpoint |
| `PATCH /api/v1/teams/{teamId}/members/{teamMemberId}/delete` | New delete/inactive request, optional `version` | Inactive TeamMember DTO or no-content by final convention | Yes, new endpoint |

Contract notes:

- Use current project DTO/wrapper style, not a new response framework.
- Business errors should be returned as existing exception mechanism supports; FE maps message keys/error codes to locale text.
- Status code for Team create should be decided intentionally. Recommendation: `201 Created` following Organization rather than Customer's current `200 OK` drift.

## 8. DTO / Schema / Validation Impact

| target | impact |
|---|---|
| Team DTO | Add page/list/detail/create/update/delete DTOs. Include `teamId`, `teamCode`, `teamName`, `description`, `status`, `memberCount`, metadata/version where available. |
| TeamMember DTO | Add member relation DTOs. Include `teamMemberId`, `teamId`, `memberKey`, display pseudonym/name if available, `roleId`, `roleName`, `status`, metadata/version where available. |
| Team create validation | `teamCode` required/trim/max length; `teamName` required/trim/max length; `description` optional/max length; unique active code. |
| Team update validation | Existing active Team required; `teamCode` editable and unique; `version` check if optimistic locking used. |
| Team delete validation | Existing non-deleted Team required; inactive memberships in same transaction. |
| Add member validation | Active Team required; existing member required; existing role required; no active duplicate `(team_id, member_key)`. |
| Update role validation | Active Team/member relation required; role required/existing; must update same relation, not insert new active row. |
| Remove member validation | Active Team/member relation required; inactive/soft delete only. |
| Error message mapping | Need FE i18n keys for required fields, duplicate code, duplicate member, not found, not active, conflict, forbidden. |

## 9. DB / Migration Impact

- Current latest observed migration is `V112__alter_tbl_dim_customer_global_customer_code_unique.sql`; candidate new migration is `V113__team_management.sql`, but implementation must confirm latest before writing.
- Reuse `tbl_dim_team` for Team master.
- Reuse `tbl_dim_role` as role source.
- Reuse `tbl_dim_member_pseudonym` as selectable existing member source.
- Add `tbl_team_member` with relation ID, `team_id`, `member_key`, `role_id`, status/inactive metadata, version and standard timestamps/actor fields where consistent with existing schema.
- Add FK constraints to Team/member/role tables where compatible with existing seed/test data.
- Add a partial unique index/constraint for one active membership per `(team_id, member_key)`.
- Add indexes for Team member list and reverse lookup: `(team_id, status)` and `(member_key, status)` or project-equivalent deleted/status fields.
- Add/adjust `tbl_dim_team` columns for Team Code, description, status, soft-delete/version metadata if not already present.
- Check all dependencies before removing or deprecating `tbl_dim_team.project_id` and `idx_team_project`.
- Do not migrate legacy data from `tbl_dim_member_pseudonym.team_id/role_id`.
- Do not use `tbl_dim_member_pseudonym.team_id/role_id` as the new source of Team membership.

## 10. Batch / Job / Event Impact

No direct batch/job/event implementation is required for TEAM.

| area | impact | rationale |
|---|---|---|
| GitHub webhook | none | TEAM CRUD does not change GitHub ingestion/webhook flow. |
| CircleCI webhook | none | TEAM CRUD does not change CircleCI ingestion/webhook flow. |
| Jira connector | none | TEAM CRUD does not change Jira connector flow. |
| Evidence collection jobs | none | TEAM CRUD does not change connector scheduling or collection. |
| Notification/event tables | none planned | Spec does not require Team operation event publication. |
| Audit log | none planned beyond standard metadata | Spec says no Team-specific audit log module in this phase. |

## 11. Test Impact

| test type | expected new/updated coverage |
|---|---|
| BE unit | `TeamServiceTest` for admin guard, create/update validation, duplicate code, soft delete, add/update/remove member, duplicate membership, role/member existence. |
| BE integration/API | `TeamControllerIntegrationTest` for authenticated/unauthenticated/non-admin/admin, endpoint status, request/response mapping, business errors. |
| BE migration | `TeamMigrationIntegrationTest` for `tbl_team_member`, FK/index/unique active constraint, no legacy migration requirement. |
| FE API | `team-api.test.ts` for path/query/body mapping and error handling. |
| FE page | `TeamPage.test.tsx` for list/search/form/detail/member operations and i18n placeholders/messages. |
| Blackbox | Update `blackbox-testcases.md` later with executable scenarios mapped to AC-TEAM-1..20. |
| Regression | Re-run Organization/Customer/Auth tests because TEAM touches shared route/layout/API/i18n areas. |

## 12. Operation / Monitoring Impact

- Migration must be included in rollout checklist.
- Pre-migration checks should detect duplicate Team Codes if unique index is added and any dependency on `tbl_dim_team.project_id` if removal is attempted.
- Post-migration checks should verify table/index/FK existence and sample active/inactive membership behavior.
- Application logs should include operation context and trace ID if existing infrastructure provides it.
- Do not log tokens, secrets, raw auth header, or unnecessary member/personally identifying details.
- No new dashboard/alert is required by spec; operational monitoring is limited to migration success, API errors, and standard application logs.

## 13. Rollout / Rollback Impact

| area | rollout impact | rollback impact |
|---|---|---|
| DB migration | Must apply before BE code that reads/writes `tbl_team_member`. | Rollback requires dropping new table/indexes and reverting Team column changes; destructive rollback must be reviewed. |
| Backend API | New endpoints can be deployed after DB migration. | Revert Team source files and remove route exposure; existing endpoints unaffected. |
| Frontend UI | New route/menu can be deployed after backend API is available. | Remove Team route/menu/page/API calls; existing pages unaffected. |
| i18n | New keys are additive. | Removing keys is optional; unused keys are low risk. |
| Data | Soft-deleted/inactive records may remain if rollback occurs after use. | Manual cleanup may be needed if rollback is required after production writes. |
| Feature visibility | ADMIN-only route/menu reduces accidental exposure. | Disable menu/route or block backend endpoint if emergency rollback needed. |

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| Team-Project assignment | Unaffected / out of scope | `spec-pack.md` sections 1, 2.2, 6.1 and AC-TEAM-17 explicitly exclude it. |
| Project management UI/API | Unaffected | TEAM spec says Team-Project relation is another screen/function. |
| Member master create/edit | Unaffected | Scope says Team detail only adds existing members. |
| `tbl_dim_member_pseudonym.team_id/role_id` as membership source | Unaffected / do not use | BR-TEAM-8, BR-TEAM-13, AC-TEAM-20 require not using/migrating legacy fields. |
| Legacy data migration from member table | Unaffected / do not do | AC-TEAM-20 and HD-TEAM-9 resolve no migration. |
| Team-specific audit log module/table | Unaffected / do not add | Scope out item and AC-TEAM-19 exclude it. |
| GitHub/Jira/CircleCI connectors | Unaffected | Spec contains no connector/external sync requirements. |
| Import/export | Unaffected | Out-of-scope item 5 excludes CSV/Excel import/export. |
| Team hierarchy | Unaffected | Out-of-scope item 6 excludes parent-child Team. |
| Dashboard/KPI analytics | Unaffected | Out-of-scope item 7 excludes dashboard analysis by Team. |
| Login/auth core implementation | Unaffected | TEAM uses existing bearer/current-user pattern and must not rework global auth. |
| Organization/Customer CRUD business behavior | Unaffected except regression risk | TEAM only uses these as reference patterns; no AC requires changing their business rules. |
| Hard delete behavior | Unaffected / prohibited | Scope and business rules require soft delete/inactive only. |

## 15. Required Options

| option | decision needed | recommendation | status |
|---|---|---|---|
| Team create HTTP status | Choose `201 Created` or follow Customer `200 OK` drift. | Use `201 Created` following Organization and REST convention. | Planned |
| Unique Team Code scope | Global active Team Code vs scoped by another parent. | Use global active Team Code unless product/data owner changes it before implementation. | Planned, confirm if needed |
| Member/Role lookup design | Team-specific read endpoints vs generic lookup endpoints. | Decision: implement minimal read-only lookup endpoints needed by Team UI; do not create broad master management. | Resolved by project owner |
| `tbl_dim_team.project_id` handling | Drop column/index vs deprecate unused field. | Prefer safe deprecation/additive migration unless dependency review proves drop is safe. | Needs DB dependency check |
| Team detail response | Single detail endpoint includes members vs separate member endpoint only. | Support candidate APIs from spec; detail may include members and member list endpoint can reload after operations. | Planned |

## 16. Human Decision Required

| ID | decision | why | status |
|---|---|---|---|
| HD-TEAM-11-IMPL | Whether destructive removal of `tbl_dim_team.project_id` is allowed in current migration strategy. | Spec says remove it, but existing migration/index references it and dependency impact must be verified. | Stop/Ask if dependency risk is found |
| HD-TEAM-LOOKUP-001 | Whether to add generic member/role lookup endpoints or Team-specific lookup support. | Team UI needs selectable existing members and roles; no existing endpoint was confirmed. | Resolved: implement minimal lookup endpoints within TEAM scope |
| HD-TEAM-CODE-SCOPE-001 | Final unique scope for Team Code if not global active uniqueness. | Spec says unique by defined scope but does not define parent scope. | Ask only if stakeholders reject global active uniqueness |

## 17. Risk Summary

| risk | severity | mitigation |
|---|---|---|
| DB destructive migration around `project_id` breaks existing references | High | Dependency grep/query first; prefer additive deprecation unless approved. |
| Member/role lookup scope creep | Medium | Implement minimal read-only TEAM lookup endpoints only; stop/ask before broad member/role master API work. |
| ADMIN authorization missed on one endpoint | High | Centralize `requireAdmin(caller)` in service and cover all methods with tests. |
| Duplicate active membership not DB-enforced | High | Add service check and DB partial unique index. |
| FE i18n missing/error keys hard-coded | Medium | Add keys in `en/vi/ja`; component tests check visible labels/messages. |
| Contract mismatch between FE and BE | Medium | Add `team-api.test.ts` and API integration tests before final report. |
| Existing test environment instability | Medium | Document exact commands and environment blockers; do not claim pass until rerun. |
