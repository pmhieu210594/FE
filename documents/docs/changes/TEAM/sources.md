# Sources

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  

## Ticket / Issue

| source | status | note |
|---|---|---|
| Initial request for CRUD Teams documents | Available | Request to create `wireframe.md`, `requirement.md`, and `database.md` for CRUD Teams |
| Phase 1 execution request | Available | Request to create `sources.md`, `00_brainstorm.md`, and `spec-pack.md` based on the template |
| Human decision: screen scope | Confirmed | The Teams screen only covers CRUD Teams and add/remove/update member in Team |
| Human decision: Team-Project assignment | Confirmed | Adding Team to Project belongs to another screen/function |
| Human decision: member multi-team | Confirmed | One member can belong to multiple Teams |
| Human decision: one role per Team | Confirmed | In one Team, one member can have only one active role |
| Human decision: role source | Confirmed | Team role uses the existing `tbl_dim_role` |
| Human decision: Team-Member table | Confirmed | Create the intermediate table `tbl_team_member` |
| Human decision: soft delete/inactive | Confirmed | Deleting a Team and removing a member from a Team are soft delete/inactive operations |
| Human decision: Team Code update | Confirmed | Allow Team Code to be edited after creation, but uniqueness must be checked |
| Human decision: delete Team side effect | Confirmed | Deleting a Team will inactive all active memberships |
| Human decision: old data migration | Confirmed | Do not migrate `tbl_dim_member_pseudonym.team_id/role_id` because there is no existing legacy data |
| Human decision: audit log | Confirmed | A separate audit log is not required in this phase |
| Human decision: i18n | Confirmed | Support `ja`, `vi`, and `en` |
| Human decision: remove `tbl_dim_team.project_id` | Confirmed | Remove the `project_id` column from `tbl_dim_team`; Team-Project belongs to another function |
| Human decision: Team access control | Confirmed | Only the `ADMIN` role can access the Teams screen/API in this phase |
| Human decision: API/error/i18n handling | Confirmed | BE returns business error codes; FE translates messages using the existing i18n mechanism |

## Requirement / Design Documents

| source | path | status | note |
|---|---|---|---|
| Requirement draft | `/mnt/data/team_crud_docs/requirement.md` | Available | Functional requirement foundation for CRUD Teams |
| Wireframe draft | `/mnt/data/team_crud_docs/wireframe.md` | Available | UI foundation for list/detail/member management |
| Database draft | `/mnt/data/team_crud_docs/database.md` | Available | DB proposal foundation and intermediate Team-Member table |
| Ticket template - Spec Pack | `docs/standards/templates/_ticket-template/spec-pack.md` | Available | Mandatory template for Spec Pack |
| Ticket template - Sources | `docs/standards/templates/_ticket-template/sources.md` | Available | Mandatory template for the Sources file |
| Ticket template - Brainstorm | `docs/standards/templates/_ticket-template/00_brainstorm.md` | Available | Mandatory template for Brainstorm |
| Requirement definition platform document | Uploaded requirement definition | Available | Defines SDD Evidence, File Evidence First, Repo as SSOT, and Metadata First |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| DB migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Available | Confirms that `tbl_dim_team`, `tbl_dim_member_pseudonym`, and `tbl_dim_role` exist |
| Existing CRUD backend pattern | `EDCAP_BE/src/main/java/com/sdd/platform/**` | Available | Reference for layering/controller/service/repository/dto pattern |
| Existing frontend pattern | `EDCAP_FE/src/**` | Available | Reference for route/page/form/table/i18n pattern |
| Existing i18n setup | `EDCAP_FE/src/i18n.ts` | Available | Confirms the i18n requirement to use keys and not hard-code text |

## Existing Tests

| area | status | note |
|---|---|---|
| Backend existing tests | Available partially | Used as a reference for CRUD/API/service/repository test patterns if available |
| Frontend existing tests | Available partially | Used as a reference for unit/e2e test patterns for page/form/table if available |
| Team-specific tests | Not available | No Team-specific tests yet; they will be created in a later phase |

## External / Office / PDF / Web References

| source | status | note |
|---|---|---|
| External references | Not used | Web/external references are not required in this phase |
| Office/PDF references | Not used | No related Office/PDF files were provided |

## Excluded Sources

| source/path | reason |
|---|---|
| `EDCAP_FE/node_modules/` | Dependency cache; not a requirement source |
| `EDCAP_FE/dist/` | Build output; not a requirement source |
| `EDCAP_FE/coverage/` | Generated report; not a requirement source |
| `EDCAP_BE/target/` | Build output; not a requirement source |
| `.git/` directories | VCS metadata; not required for requirement definition |
| `EDCAP_BE/.env` | Sensitive local configuration; not used as a requirement source |

## Source Limitations

- `tbl_dim_team.project_id` will be removed from the Team DB schema/migration because the Teams screen does not manage adding Team to Project.
- `tbl_dim_member_pseudonym.team_id/role_id` is not used as the primary source for the new Team membership.
- There is no existing legacy data that needs to be migrated from `tbl_dim_member_pseudonym.team_id/role_id`.
- A separate audit log for Team is outside the scope of this phase.

## Assumptions from Sources

| ID | assumption | basis | status |
|---|---|---|---|
| AS-TEAM-1 | Team master continues to use `tbl_dim_team`. | Existing DB table | Active |
| AS-TEAM-2 | Members are selected from the existing member master; new members are not created in Team detail. | User decision and current scope | Active |
| AS-TEAM-3 | Team roles use `tbl_dim_role`. | User decision | Confirmed |
| AS-TEAM-4 | `tbl_team_member` is the primary source for Team-Member-Role. | User decision | Confirmed |
| AS-TEAM-5 | Do not migrate old data. | User confirmed there is no old data | Confirmed |

## Human Confirmation Required

| ID | question | owner | status |
|---|---|---|---|
| HC-TEAM-1 | How to handle `tbl_dim_team.project_id`. | BE/Data/PM | Resolved: remove the column from `tbl_dim_team` |
| HC-TEAM-2 | Final permission names/RBAC mapping. | Security/BE | Resolved: detailed permissions are not required; only the `ADMIN` role can access |
| HC-TEAM-3 | Final API response wrapper/error code naming. | BE | Resolved: same as existing administration functions |
| HC-TEAM-4 | i18n resource/error message translation. | FE | Resolved: BE returns error codes, and FE translates messages using the existing i18n mechanism |