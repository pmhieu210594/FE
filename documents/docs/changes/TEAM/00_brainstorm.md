# 00_brainstorm

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  

## Purpose

Organize the finalized requirements for the **Teams Management** feature before moving to Phase 3.

The goal of this brainstorm is to record the initial business decisions and risks, but the **Spec Pack is the single source of truth** for moving forward.

## Known Information

| ID | known information | result |
|---|---|---|
| KI-TEAM-1 | Scope of the Teams screen | Only CRUD Teams and add/remove/update member roles in Team detail |
| KI-TEAM-2 | Team-Project assignment | Out of scope; handled by another screen/function |
| KI-TEAM-3 | Multi-Team membership | One member can belong to multiple Teams |
| KI-TEAM-4 | Role cardinality | Within one Team, one member can have only one active role |
| KI-TEAM-5 | Role source | Use the existing `tbl_dim_role` |
| KI-TEAM-6 | Team-Member storage | Create an intermediate table `tbl_team_member` |
| KI-TEAM-7 | Team delete | Soft delete/inactivate Team |
| KI-TEAM-8 | Delete Team side effect | Inactivate all active memberships of the Team |
| KI-TEAM-9 | Remove member | Soft delete/inactivate membership; do not delete the member master |
| KI-TEAM-10 | Team Code update | Allow updates after creation, but uniqueness must be checked |
| KI-TEAM-11 | Migration of old member.team_id/role_id | Not needed because there is no existing old data |
| KI-TEAM-12 | Audit log | A separate audit log is not required in this phase |
| KI-TEAM-13 | i18n | Support `ja`, `vi`, `en` |

Design direction:

- Reuse the existing `tbl_dim_team` for the Team master.
- Do not use `tbl_dim_member_pseudonym.team_id/role_id` as the main source for the new Team membership.
- Do not use `tbl_auth_member_project_role` as Team membership.
- Create `tbl_team_member` with `team_id`, `member_key`, `role_id`, `status`, and standard metadata if available.
- Use a unique active constraint/index on `(team_id, member_key)` to ensure that one member has only one active role in one Team.
- Team detail is where the member list and roles in the Team are managed.
- Delete Team must run in a transaction: inactivate Team + inactivate active memberships.
- Removing a member from a Team only inactivates the record in `tbl_team_member`.
- Do not implement a separate audit log in this phase.
- Do not implement adding Team to Project in this phase.
- Do not migrate old data from the member master.

## Undetermined Points

| ID | point | impact |
|---|---|---|
| UP-TEAM-1 | `tbl_dim_team.project_id` will be removed from the Team DB schema/migration because the Teams screen does not manage Team-Project assignment. | Affects migration/model/mapper related to Team |
| UP-TEAM-2 | Detailed permissions specifically for Teams are not required in this phase; only the `ADMIN` role can access it. | Security tests focus on ADMIN/non-ADMIN |
| UP-TEAM-3 | The API wrapper/error format follows the same approach as the existing administration functions. | BE implements according to the current standard |
| UP-TEAM-4 | BE returns business error codes; FE translates messages according to the existing i18n setup. | FE needs to map error codes for `ja`, `vi`, `en` |

## Expected Risks

| ID | risk | mitigation |
|---|---|---|
| R-TEAM-1 | Accidentally using `tbl_dim_member_pseudonym.team_id/role_id` as the main membership source will not correctly support multi-team membership. | Create and use `tbl_team_member` as the main source. |
| R-TEAM-2 | Team Code can be updated, so there is a risk of duplicate data. | Check uniqueness in both API/service and DB constraint/index where appropriate. |
| R-TEAM-3 | Delete Team only inactivates the Team but misses memberships. | Use a transaction to inactivate both Team and memberships. |
| R-TEAM-4 | A member is added twice to the same Team. | Unique active `(team_id, member_key)`. |
| R-TEAM-5 | Hard-coded UI text causes i18n failures. | Use i18n keys for `ja`, `vi`, `en`. |
| R-TEAM-6 | Confusing Team role with authorization role. | The spec clearly states that Team role is used for membership; access to the Teams screen in this phase is only for the `ADMIN` role. |

## What AI Needs to Investigate

| ID | investigation item | timing |
|---|---|---|
| AI-TEAM-1 | Update DB/migration to remove `tbl_dim_team.project_id`. | Phase 3 |
| AI-TEAM-2 | Check the existing backend CRUD pattern to design API/service/repository consistently. | Phase 3 |
| AI-TEAM-3 | Check the existing frontend route/page/form/table/i18n pattern. | Phase 3 |
| AI-TEAM-4 | Check the existing validation/error response standard. | Phase 3 |

## What Humans Need to Ask

| ID | question | owner | status |
|---|---|---|---|
| HQ-TEAM-1 | How should `tbl_dim_team.project_id` be handled? | PM/BE/Data | Resolved: remove the column from the Team DB schema/migration |
| HQ-TEAM-2 | Are detailed permissions specifically for Teams required? | Security/BE | Resolved: not required; only the `ADMIN` role can access it |
| HQ-TEAM-3 | Should inactive members be displayed in Team detail, or only active members by default? | PM/FE/QA | To be aligned |

## Conditions Under Which Implementation Is Not Permitted

Do not proceed with implementation if any of the following conditions occur:

| ID | condition |
|---|---|
| STOP-TEAM-1 | Migration/model/mapper has not been updated to remove the dependency on `tbl_dim_team.project_id`. |
| STOP-TEAM-2 | The implementation intends to use `tbl_dim_member_pseudonym.team_id/role_id` as the main membership source instead of `tbl_team_member`. |
| STOP-TEAM-3 | The implementation allows one member to have multiple active roles in the same Team. |
| STOP-TEAM-4 | Delete Team does not inactivate active memberships. |
| STOP-TEAM-5 | UI hard-codes text or does not translate business error codes returned by BE for `ja`, `vi`, `en`. |