# Spec Pack

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  
**Status**: Go for Phase 3, with one technical DB alignment note  

## 1. Context / Purpose

The **Team Management** function is added to administer Teams in the EDCAP system. Users with the appropriate permissions need to be able to perform CRUD operations on Teams and manage members within the Team detail screen.

The scope of this screen includes only:

- Creating, listing, viewing details, updating, and soft-deleting Teams.
- Adding existing members to a Team.
- Updating the role of a member within a Team.
- Removing a member from a Team via soft delete/inactive status.

Assigning a Team to a Project or managing the Team-Project relationship is **out of scope for this screen** and will be handled by another screen/function.

A member's role within a Team is an attribute of the Team-Member relationship, so an intermediate table `tbl_team_member` is required. A member can belong to multiple Teams, but within the same Team, a member can have only one active role.

## 2. Scope

### 2.1. Within range

| No | scope item |
|---:|---|
| 1 | Display the Team list based on the user's access permissions |
| 2 | Search Teams by Team Code and Team Name |
| 3 | Create a new Team |
| 4 | View Team details |
| 5 | Update basic Team information |
| 6 | Allow Team Code to be edited after creation |
| 7 | Check Team Code uniqueness on create/update |
| 8 | Soft delete/inactivate a Team |
| 9 | When deleting a Team, automatically inactivate all active memberships of that Team |
| 10 | Display the member list in Team detail |
| 11 | Add an existing member to a Team from Team detail |
| 12 | Select a role when adding a member to a Team |
| 13 | Update a member's role within a Team |
| 14 | Remove a member from a Team via soft delete/inactive |
| 15 | A member can belong to multiple Teams |
| 16 | Within the same Team, a member can have only one active role |
| 17 | The role within a Team uses the existing `tbl_dim_role` |
| 18 | Create the intermediate table `tbl_team_member` to manage Team-Member-Role |
| 19 | Do not migrate old data from `tbl_dim_member_pseudonym.team_id/role_id` because there is no legacy data |
| 20 | Support multilingual `ja`, `vi`, `en` for labels, buttons, placeholders, validation messages, and business error messages |

### 2.2. Out of range

| No | out-of-scope item | reason |
|---:|---|---|
| 1 | Add Team to Project / manage the Team-Project relationship | Belongs to another screen/function |
| 2 | Create a new member master from Team detail | Team detail only adds existing members |
| 3 | Manage detailed role permissions | Use the existing role master; no deep RBAC expansion in this ticket |
| 4 | Dedicated audit log for Team actions | This phase does not require a dedicated audit log |
| 5 | Import/export members via CSV/Excel | No mandatory requirement yet |
| 6 | Team hierarchy/parent-child Team | No requirement yet |
| 7 | Team analytics dashboard | This ticket only covers CRUD and member assignment |
| 8 | Hard delete Team or hard delete Team-Member records | Not aligned with the soft delete/inactive approach |
| 9 | Synchronize Team with external systems | No confirmed external source yet |
| 10 | Migrate legacy data from `tbl_dim_member_pseudonym.team_id/role_id` | Not needed because there is no old data |

## 3. Terminology

| term | meaning | note |
|---|---|---|
| Team | A working group managed in the system | This screen only handles Team CRUD, not Team-Project management |
| Team Code | The business code of a Team | Can be edited after creation, but must be unique |
| Member | A member who already exists in the system | Added to a Team from the existing member source |
| Role | The role assigned to a member within a Team | Uses the existing `tbl_dim_role` |
| Team Member | The relationship between Team and Member | Stored in `tbl_team_member` |
| Active membership | A currently effective Team-Member relationship | Each Team has only one active role for a member |
| Inactive membership | A Team-Member relationship that has been removed or inactivated because the Team was deleted | No hard delete |
| Soft delete | Soft deletion by status/deletion timestamp | Applied to Team and Team Member |
| i18n | Internationalization | Supports `ja`, `vi`, `en` |

## 4. As-Is

| area | current state | issue |
|---|---|---|
| Team DB | `tbl_dim_team` already exists | Need to re-check existing columns and add any missing columns if necessary |
| Member DB | `tbl_dim_member_pseudonym` already exists and may contain `team_id`/`role_id` | Not used as the primary source for the new Team membership |
| Role DB | `tbl_dim_role` already exists | Used as the role source for members within a Team |
| Team-Member relation | No appropriate intermediate table yet | Need to create `tbl_team_member` |
| Backend | No complete Team CRUD module found yet | Need to add API/service/repository/dto |
| Frontend | No complete Teams screen yet | Need to add list/detail/form/member area |
| i18n | The system already has multilingual support guidance | Do not hard-code text in the Teams screen |

## 5. To-Be

| area | expected state |
|---|---|
| Team CRUD | Authorized users can list/search/create/detail/update/soft-delete Teams |
| Team Code | Can be edited after creation, but uniqueness must be checked |
| Team Detail | Displays Team information and the list of members belonging to the Team |
| Add Member | Users select an existing member and role to add to a Team |
| Update Member Role | Users can change a member's role within a Team |
| Remove Member | Remove by inactive membership; do not delete the member master |
| Delete Team | Soft delete/inactivate the Team and inactivate all active memberships of that Team |
| Multi-Team | A member can belong to multiple Teams |
| One Role per Team | Within a Team, a member can have only one active role |
| DB | Reuse existing tables and create `tbl_team_member` |
| Audit | No dedicated audit log in this phase; only use basic metadata if standard tables already have it |
| i18n | UI/message/error supports `ja`, `vi`, `en` |

## 6. Detailed specification

### 6.1. Business Rules

| ID | rule | detail |
|---|---|---|
| BR-TEAM-1 | The Teams screen does not manage Team-Project relationships | Adding a Team to a Project belongs to another screen/function |
| BR-TEAM-2 | Team Code is required | A Team must have a Team Code for search and administration |
| BR-TEAM-3 | Team Code can be edited | When editing, uniqueness must be checked the same way as on create |
| BR-TEAM-4 | Team Code is unique | Two active Teams with the same Team Code are not allowed within the unique scope enforced by DB/API |
| BR-TEAM-5 | Team Name is required | Must not be blank after trimming |
| BR-TEAM-6 | Deleting a Team is soft delete/inactive | Do not hard delete the Team |
| BR-TEAM-7 | Deleting a Team inactivates memberships | When a Team is deleted, all active memberships of that Team are changed to inactive |
| BR-TEAM-8 | A member can belong to multiple Teams | Do not store a primary Team directly in the member master for this function |
| BR-TEAM-9 | A member can have only one active role within a Team | Do not allow duplicate active memberships with the same `team_id` + `member_key` |
| BR-TEAM-10 | Role is required when adding a member | The role is taken from the existing `tbl_dim_role` |
| BR-TEAM-11 | Updating a role does not create a new membership | Only update the role of the existing active membership |
| BR-TEAM-12 | Removing a member means inactivating the membership | Do not physically delete the record in `tbl_team_member` |
| BR-TEAM-13 | Do not migrate old data | Do not migrate from `tbl_dim_member_pseudonym.team_id/role_id` because there is no legacy data |
| BR-TEAM-14 | This phase does not require a dedicated audit log | Do not create a dedicated Team audit log module in this ticket |
| BR-TEAM-15 | Multilingual support is mandatory | All UI text and messages for Teams use i18n keys for `ja`, `vi`, `en` |

### 6.2. Input

#### Team create/update input

| item | type | required | validation | note |
|---|---|---:|---|---|
| `teamCode` | string | Yes | Trim, max length per standard, unique | Can be edited after creation |
| `teamName` | string | Yes | Trim, not blank | Display name |
| `description` | string | No | Max length per standard | Optional |
| `status` | enum | No | ACTIVE/INACTIVE if the UI allows status editing | Default ACTIVE on create |
| `version` | number | Update only | Optimistic locking if applied by the system | Optional depending on the current pattern |

#### Team list/search input

| item | type | required | validation | note |
|---|---|---:|---|---|
| `keyword` | string | No | Search Team Code/Team Name | Trim |
| `status` | enum | No | ACTIVE/INACTIVE/DELETED or according to the existing enum | Default ACTIVE |
| `page` | number | No | According to the current standard | Paging |
| `size` | number | No | According to the current standard | Paging |
| `sort` | string | No | Allow only whitelisted fields | Avoid SQL injection |

#### Add member input

| item | type | required | validation | note |
|---|---|---:|---|---|
| `teamId` | UUID | Yes | Team exists and is active | Path parameter |
| `memberKey` | UUID | Yes | Member exists and can be selected | Do not create a new member |
| `roleId` | UUID | Yes | Role exists in `tbl_dim_role` | Required |

#### Update member role input

| item | type | required | validation | note |
|---|---|---:|---|---|
| `teamId` | UUID | Yes | Team exists and is active | Path parameter |
| `teamMemberId` | UUID | Yes | Active membership exists | Prefer using the relation id |
| `roleId` | UUID | Yes | Role exists in `tbl_dim_role` | New role |
| `version` | number | No | Optimistic locking if applied | Optional |

### 6.3. Output

#### Team list item

| item | type | note |
|---|---|---|
| `teamId` | UUID | Team identifier |
| `teamCode` | string | Business code |
| `teamName` | string | Display name |
| `description` | string/null | Optional |
| `memberCount` | number | Active member count |
| `status` | enum | Team status |
| `createdAt` | datetime | If available in the standard table |
| `updatedAt` | datetime | If available in the standard table |
| `version` | number | If optimistic locking is applied |

#### Team detail

| item | type | note |
|---|---|---|
| `team` | object | Team basic info |
| `members` | array | Active members by default |
| `traceId` | string | According to the current API standard |

#### Team member item

| item | type | note |
|---|---|---|
| `teamMemberId` | UUID | Relation id |
| `teamId` | UUID | Team id |
| `memberKey` | UUID | Member id/pseudonym key |
| `pseudonym` | string | Minimum display value |
| `roleId` | UUID | Role id |
| `roleName` | string | Role display |
| `status` | enum | ACTIVE/INACTIVE |
| `createdAt` | datetime | If available in the standard table |
| `updatedAt` | datetime | If available in the standard table |
| `version` | number | If optimistic locking is applied |

### 6.4. Error / Exception

| case | expected behavior | code candidate |
|---|---|---|
| Missing required field | Field-level validation error | `VALIDATION_REQUIRED` |
| Team Code duplicated | Reject create/update | `TEAM_CODE_DUPLICATED` |
| Team not found | Return not found | `TEAM_NOT_FOUND` |
| Team inactive/deleted | Block update/member operations | `TEAM_NOT_ACTIVE` |
| Member not found | Reject add member | `MEMBER_NOT_FOUND` |
| Role not found | Reject add/update role | `ROLE_NOT_FOUND` |
| Member already active in Team | Reject add member | `TEAM_MEMBER_ALREADY_EXISTS` |
| Membership not found | Reject update/remove | `TEAM_MEMBER_NOT_FOUND` |
| Version conflict | Reject update | `VERSION_CONFLICT` |
| Non-ADMIN user | Reject access to Team screen/API | `FORBIDDEN` |

### 6.5. Boundary Value

| item | boundary | expected behavior |
|---|---|---|
| Team Code empty/blank | Blank after trim | Reject with validation error |
| Team Code duplicated | Same active Team Code in the unique scope | Reject create/update |
| Team Name empty/blank | Blank after trim | Reject with validation error |
| Add the same member twice | Existing active `(team_id, member_key)` | Reject as already exists |
| Update role for inactive membership | Membership inactive | Reject as not found or invalid status |
| Delete Team with active members | Active memberships exist | Inactivate the Team and all active memberships in the same transaction |
| Member belongs to another Team | Existing membership in a different Team | Allow adding to the current Team |

### 6.6. Non-functional

| ID | requirement | note |
|---|---|---|
| NFR-TEAM-1 | CRUD operations should follow existing API/UI response time standards. | Apply the current backend/frontend baseline. |
| NFR-TEAM-2 | UI text and messages must support `ja`, `vi`, `en`. | Do not hard-code label/button/validation/business error text. |
| NFR-TEAM-3 | Team/member operations must not expose unnecessary personal information. | Display only the minimum member information needed for selection and management. |
| NFR-TEAM-4 | Delete Team and inactive memberships must be transactionally consistent. | Avoid leaving a Team inactive while active memberships still remain. |
| NFR-TEAM-5 | This phase does not require a dedicated audit log. | Use only standard metadata if the existing table pattern already has it. |
| NFR-TEAM-6 | Only role `ADMIN` can access the Teams function in this phase. | No dedicated detailed permission for Teams is required. |

## 7. Acceptance Criteria

| ACID | description | testable? |
|---|---|---|
| AC-TEAM-1 | Only users with role ADMIN can view the Team list. | Yes |
| AC-TEAM-2 | Users can search Teams by Team Code or Team Name. | Yes |
| AC-TEAM-3 | Users with role ADMIN can create a Team with a valid Team Code and Team Name. | Yes |
| AC-TEAM-4 | Users can edit the Team Code after creation. | Yes |
| AC-TEAM-5 | The system does not allow creating/updating a duplicate Team Code within the defined unique scope. | Yes |
| AC-TEAM-6 | Users can view Team details including basic information and the list of members in the Team. | Yes |
| AC-TEAM-7 | Users with role ADMIN can update the basic information of a Team. | Yes |
| AC-TEAM-8 | Users with role ADMIN can soft delete/inactivate a Team. | Yes |
| AC-TEAM-9 | When deleting a Team, the system automatically inactivates all active memberships of that Team. | Yes |
| AC-TEAM-10 | Users can add an existing member to a Team from the Team detail screen. | Yes |
| AC-TEAM-11 | When adding a member to a Team, users must select a role from `tbl_dim_role`. | Yes |
| AC-TEAM-12 | A member can be added to multiple different Teams. | Yes |
| AC-TEAM-13 | Within the same Team, a member can have only one active membership and one active role. | Yes |
| AC-TEAM-14 | The system does not allow adding the same active member twice in the same Team. | Yes |
| AC-TEAM-15 | Users can update the role of a member in a Team without creating a new membership. | Yes |
| AC-TEAM-16 | Users can remove a member from a Team by inactivating the membership without deleting the member from the system. | Yes |
| AC-TEAM-17 | The Teams function does not perform adding a Team to a Project. | Yes |
| AC-TEAM-18 | The system supports multilingual `ja`, `vi`, `en` for the Teams screen, labels, buttons, placeholders, validation messages, and business error messages. | Yes |
| AC-TEAM-19 | This phase does not require a dedicated audit log for Team actions. | Yes |
| AC-TEAM-20 | No legacy data migration is performed from `tbl_dim_member_pseudonym.team_id/role_id`. | Yes |

## 8. Examples

### 8.1. Normal Case

| case | input/action | expected |
|---|---|---|
| Create Team | Enter a new Team Code and a valid Team Name | The Team is created with status ACTIVE |
| Update Team Code | Change the Team Code to a non-duplicate value | Update succeeds |
| Add Member | Select member A and role Developer | Member A appears in the Team with role Developer |
| Update Role | Change member A's role from Developer to QA | The existing membership is updated with the new role; no new row is created |
| Remove Member | Remove member A from the Team | The membership changes to INACTIVE |
| Delete Team | Delete a Team with 3 active members | The Team becomes inactive/deleted and the 3 active memberships change to INACTIVE |

### 8.2. Error Case

| case | expected |
|---|---|
| Create Team with a duplicate Team Code | Return error `TEAM_CODE_DUPLICATED` |
| Add the same member to the same Team a second time | Return error `TEAM_MEMBER_ALREADY_EXISTS` |
| Add a member without selecting a role | Return required role error |
| Update role for an inactive membership | Return error `TEAM_MEMBER_NOT_FOUND` or invalid status |
| Add a member to an inactive Team | Return error `TEAM_NOT_ACTIVE` |

### 8.3. Boundary Case

| case | expected |
|---|---|
| Team has no members | Detail displays the correct empty state in the appropriate language |
| One member belongs to 2 Teams | Both Teams display that member if the memberships are active |
| Team Code has leading/trailing spaces | Trim before validate/save according to policy |
| Locale is `ja`, `vi`, `en` | UI/messages display in the corresponding language |

## 9. Source Availability Summary

| source | status | usage |
|---|---|---|
| User decisions on Team scope/member/role/delete/migration | Available | Finalize core business rules |
| Current DB schema | Available | Identify existing tables and the table that needs to be created |
| Existing CRUD pattern | Available | Reference layering/API/UI style |
| Existing i18n infrastructure | Available | Enforce no hard-coded text |
| Audit log requirement | Available | Finalize as out of scope for this phase |

## 10. Complexity Classification

| item | value |
|---|---|
| Classification | Medium |
| Reason | Standard Team CRUD, but includes Team-Member-Role relation, soft delete with membership cascade, i18n, and DB migration |

## 11. FE/BE Contract Impact

API candidate:

```text
GET    /api/v1/teams
GET    /api/v1/teams/{teamId}
POST   /api/v1/teams
PUT    /api/v1/teams/{teamId}
PATCH  /api/v1/teams/{teamId}/delete
GET    /api/v1/teams/{teamId}/members
POST   /api/v1/teams/{teamId}/members
PUT    /api/v1/teams/{teamId}/members/{teamMemberId}
PATCH  /api/v1/teams/{teamId}/members/{teamMemberId}/delete
```

Notes:

- The API is not responsible for adding a Team to a Project in this phase.
- Request/response wrappers follow the current backend standard.
- Error code naming follows the current backend standard. The BE returns business error codes such as `TEAM_MEMBER_ALREADY_EXISTS`; the FE is responsible for translating messages according to locale.

## 12. DB/Migration Impact

### 12.1. Existing tables to reuse

| table | usage |
|---|---|
| `tbl_dim_team` | Team master |
| `tbl_dim_member_pseudonym` | Member source |
| `tbl_dim_role` | Role source for Team member role |

### 12.2. New table required

The intermediate table `tbl_team_member` must be created.

Suggested columns:

| column | purpose |
|---|---|
| `team_member_id` | Primary key |
| `team_id` | FK to `tbl_dim_team` |
| `member_key` | FK to `tbl_dim_member_pseudonym` |
| `role_id` | FK to `tbl_dim_role` |
| `status` | ACTIVE/INACTIVE |
| `joined_at` | Time when added to Team, if needed |
| `removed_at` | Time when inactivated/removed, if needed |
| `version` | Optimistic locking if used by the current standard |
| `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` | Basic metadata if used by the existing standard table pattern |

### 12.3. Constraints / indexes

| constraint/index | purpose |
|---|---|
| Unique active `(team_id, member_key)` | Ensure a member has only one active role within a Team |
| Index `team_id, status` | Retrieve active members of a Team |
| Index `member_key, status` | Look up the Teams of a member if needed |
| FK `team_id` | Ensure the Team exists |
| FK `member_key` | Ensure the Member exists |
| FK `role_id` | Ensure the Role exists |

### 12.4. Migration note

- Remove the column `tbl_dim_team.project_id` from the current DB schema/migration because the Teams screen does not manage adding a Team to a Project.
- Do not migrate old data from `tbl_dim_member_pseudonym.team_id/role_id` because there is no legacy data.
- Do not create a Project selection UI on the Teams screen. If the Team-Project relationship is needed later, it will belong to another screen/function.

## 13. Security/Privacy Impact

| item | policy |
|---|---|
| Authentication | All Teams APIs require login |
| Authorization | Only role `ADMIN` can access the Teams screen and Teams APIs in this phase; no dedicated detailed permission definition for Teams is required |
| Privacy | Member display should prioritize pseudonym/minimal display |
| Personal ranking | Do not design the UI in a way that ranks/monitors individuals |
| Audit log | This phase does not require a dedicated audit log |

## 14. Operation/Maintenance Impact

| item | impact |
|---|---|
| Migration | Need to create table `tbl_team_member` and add indexes/constraints |
| Data consistency | Deleting a Team must inactivate active memberships in the same transaction |
| i18n | Need to add resource keys for `ja`, `vi`, `en` |
| Backward compatibility | Does not depend on old data migration |

## 15. Test Strategy Summary

| test type | focus |
|---|---|
| Unit test | Validate Team Code, duplicate member, one role per member per Team |
| Integration test | Create/update/delete Team, add/update/remove member, delete Team and inactivate memberships |
| API test | Status code/error code/wrapper according to standard |
| FE test | List/detail/form/add member/update role/remove member/i18n |
| DB migration test | Table creation, FK, unique active membership, index |
| Security test | No operation when not logged in or not ADMIN |

## 16. Human Decision Required

| ID | decision | result | status |
|---|---|---|---|
| HD-TEAM-1 | Does the Teams screen manage adding a Team to a Project? | No. Adding a Team to a Project belongs to another screen/function. | Resolved |
| HD-TEAM-2 | Can a member belong to multiple Teams? | Yes. | Resolved |
| HD-TEAM-3 | How many active roles can a member have within a Team? | A member can have only one active role within a Team. | Resolved |
| HD-TEAM-4 | Which table is used for roles within a Team? | Use the existing `tbl_dim_role`. | Resolved |
| HD-TEAM-5 | Is an intermediate Team-Member table required? | Yes, create `tbl_team_member`. | Resolved |
| HD-TEAM-6 | How should Team deletion/member removal be handled? | Soft delete/inactive. | Resolved |
| HD-TEAM-7 | Can Team Code be edited after creation? | Yes, but uniqueness must be checked. | Resolved |
| HD-TEAM-8 | Does deleting a Team inactivate memberships? | Yes, inactivate all active memberships of the Team. | Resolved |
| HD-TEAM-9 | Should legacy data from member.team_id/role_id be migrated? | No, because there is no legacy data. | Resolved |
| HD-TEAM-10 | Is a dedicated audit log needed in this phase? | No. | Resolved |
| HD-TEAM-11 | How should `tbl_dim_team.project_id` be handled? | Remove the `project_id` column from `tbl_dim_team`; Team-Project belongs to another function. | Resolved |
| HD-TEAM-12 | Is a dedicated detailed permission for Teams required? | No. Only role `ADMIN` can access the Teams screen/APIs in this phase. | Resolved |
| HD-TEAM-13 | Where are business error messages translated? | The BE returns error codes; the FE translates messages via i18n like other admin screens. | Resolved |

## 17. Assumptions and Inference Log

| ID | assumption/inference | basis | status |
|---|---|---|---|
| AI-TEAM-1 | `tbl_team_member` is necessary | A member can belong to multiple Teams and role belongs to the Team-Member relationship | Confirmed |
| AI-TEAM-2 | Unique active membership uses `(team_id, member_key)` | A member can have only one active role within a Team | Confirmed |
| AI-TEAM-3 | `tbl_dim_role` is used for Team member role | User decision | Confirmed |
| AI-TEAM-4 | No legacy data migration | User decision: there is no old data | Confirmed |
| AI-TEAM-5 | Dedicated audit log is out of scope for this phase | User decision | Confirmed |
| AI-TEAM-6 | `tbl_dim_team.project_id` must be removed from the Team DB schema/migration | User decision: the Teams screen does not manage Team-Project | Confirmed |

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-TEAM-1 | `tbl_dim_team.project_id` will be removed from the Team DB schema/migration. | Affects migration and mapper/model related to `tbl_dim_team`. | BE/Data | Resolved |
| OI-TEAM-2 | No dedicated detailed permission for Teams is required because only role `ADMIN` can access it in this phase. | Simplifies security testing; verify ADMIN/non-ADMIN. | Security/BE | Resolved |
| OI-TEAM-3 | Request/response wrapper and error format follow the existing admin functions. | BE implementation follows the current standard. | BE | Resolved |
| OI-TEAM-4 | The BE returns business error codes such as `TEAM_MEMBER_ALREADY_EXISTS`; the FE is responsible for translating messages using the current i18n. | FE needs to map error codes to `ja`, `vi`, `en` messages. | FE/BE | Resolved |