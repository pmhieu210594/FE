# Database Design - Teams Management Feature

**Ticket ID**: TEAM  
**Created Date**: 2026-06-15  
**Created By**: nk_trung  
**Updated Date**: 2026-06-15  

---

## 1. Purpose

This document describes the database changes for the Teams management feature.

Design principles:

- Do not recreate existing master tables unless necessary.
- Update existing tables when appropriate.
- Only create new tables when truly necessary.
- A member's role in a Team is data of the Team-Member relationship, so an intermediate table is required.
- The Teams screen does not manage Team assignment to Projects.

---

## 2. Finalized Database Decisions

| No | Decision |
|---:|---|
| 1 | Remove the `tbl_dim_team.project_id` column |
| 2 | Create the intermediate table `tbl_team_member` |
| 3 | Use the existing `tbl_dim_role` for member roles in a Team |
| 4 | One member can belong to multiple Teams |
| 5 | Within one Team, one member can have only one active role |
| 6 | Deleting a Team is a soft delete/inactivation |
| 7 | Removing a member from a Team means inactivating the membership |
| 8 | Deleting a Team automatically inactivates all active memberships of that Team |
| 9 | Do not migrate old data from `tbl_dim_member_pseudonym.team_id/role_id` |
| 10 | A separate audit log is not required in this phase |

---

## 3. Existing Tables to Use

### 3.1 `tbl_dim_team`

The existing Team master table will continue to be used, but it needs to be updated:

- Remove `project_id`.
- Ensure the columns required for CRUD exist, such as `team_code`, `team_name`, `description`, `status`, `created_at`, `updated_at`, `deleted_at`, and `version`.
- Team is no longer directly dependent on Project in this screen.

### 3.2 `tbl_dim_member_pseudonym`

Used as the source for selecting members when adding a member to a Team.

Do not use `team_id` / `role_id` on this table to represent the new membership.

### 3.3 `tbl_dim_role`

Used as the role master for the role of a member in a Team.

### 3.4 `tbl_auth_member_project_role`

Do not use this table for Team membership because this is an authorization relationship at the Project scope, not a member relationship within a Team.

---

## 4. Changes to `tbl_dim_team`

### 4.1 Column to Remove

```sql
ALTER TABLE tbl_dim_team
DROP COLUMN IF EXISTS project_id;
```

If any foreign key/index related to `project_id` exists, the constraint/index must be dropped before dropping the column.

Example of an actual constraint name that needs to be checked in the current DB/migration:

```sql
ALTER TABLE tbl_dim_team
DROP CONSTRAINT IF EXISTS tbl_dim_team_project_id_fkey;
```

### 4.2 Recommended Target Structure

```sql
CREATE TABLE IF NOT EXISTS tbl_dim_team (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_code VARCHAR(50) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(255),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0
);
```

If some columns already exist, only add the missing columns; do not recreate the table.

### 4.3 Unique Constraint/Index

Team Code can be edited after creation but must be unique among active Teams.

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_dim_team_active_code
ON tbl_dim_team (lower(team_code))
WHERE status = 'ACTIVE';
```

Additional indexes can be created to support search:

```sql
CREATE INDEX IF NOT EXISTS idx_dim_team_search
ON tbl_dim_team (lower(team_code), lower(team_name));

CREATE INDEX IF NOT EXISTS idx_dim_team_status
ON tbl_dim_team (status);
```

---

## 5. New Table `tbl_team_member`

### 5.1 Reason for Requiring an Intermediate Table

`tbl_team_member` needs to be created because:

- One Team has many members.
- One member can belong to multiple Teams.
- Within a Team, role is an attribute of the Team-Member relationship.
- Within the same Team, one member can have only one active role.
- The Team role should not be stored in the member master.

### 5.2 Proposed DDL

```sql
CREATE TABLE IF NOT EXISTS tbl_team_member (
    team_member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES tbl_dim_team(team_id),
    member_key UUID NOT NULL REFERENCES tbl_dim_member_pseudonym(member_key),
    role_id UUID NOT NULL REFERENCES tbl_dim_role(role_id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(255),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0
);
```

### 5.3 Unique Constraint/Index

Within one Team, one member can have only one active membership.

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_team_member_active_member
ON tbl_team_member (team_id, member_key)
WHERE status = 'ACTIVE';
```

Lookup indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_team_member_team_status
ON tbl_team_member (team_id, status);

CREATE INDEX IF NOT EXISTS idx_team_member_member_status
ON tbl_team_member (member_key, status);

CREATE INDEX IF NOT EXISTS idx_team_member_role
ON tbl_team_member (role_id);
```

---

## 6. Data Rules

### 6.1 Team

| Rule | Description |
|---|---|
| TEAM-RULE-001 | `team_code` is required |
| TEAM-RULE-002 | `team_name` is required |
| TEAM-RULE-003 | `team_code` must be unique among active Teams |
| TEAM-RULE-004 | Editing `team_code` is allowed, but uniqueness must be checked |
| TEAM-RULE-005 | Deleting a Team updates `status` to inactive/deleted; it is not a hard delete |
| TEAM-RULE-006 | Deleting a Team must inactivate all active memberships of that Team in the same transaction |

### 6.2 Team Member

| Rule | Description |
|---|---|
| TEAM-MEMBER-RULE-001 | `team_id` is required |
| TEAM-MEMBER-RULE-002 | `member_key` is required |
| TEAM-MEMBER-RULE-003 | `role_id` is required |
| TEAM-MEMBER-RULE-004 | `role_id` must exist in `tbl_dim_role` |
| TEAM-MEMBER-RULE-005 | One Team + one member can have only one active record |
| TEAM-MEMBER-RULE-006 | One member can have active records in multiple different Teams |
| TEAM-MEMBER-RULE-007 | Removing a member updates `status` to inactive/deleted; it is not a hard delete |
| TEAM-MEMBER-RULE-008 | Updating a role only updates `tbl_team_member.role_id`; it does not update the member master |

---

## 7. Migration Policy

### 7.1 Do Not Migrate Old Data

Do not migrate data from:

```text
 tbl_dim_member_pseudonym.team_id
 tbl_dim_member_pseudonym.role_id
```

Reason: there is currently no old data that needs to be retained.

### 7.2 Recommended Migration Order

```text
1. Drop FK/index related to tbl_dim_team.project_id if any
2. Drop the tbl_dim_team.project_id column
3. Add missing columns to tbl_dim_team if needed
4. Create/update the unique index for active team_code
5. Create the tbl_team_member table
6. Create the unique index for active membership
7. Create indexes to support list/search/detail
```

---

## 8. Transaction

### 8.1 Delete Team

When deleting a Team:

```text
BEGIN
  update tbl_dim_team set status = 'INACTIVE', deleted_at = now(), version = version + 1
  where team_id = :teamId and status = 'ACTIVE';

  update tbl_team_member set status = 'INACTIVE', left_at = now(), deleted_at = now(), version = version + 1
  where team_id = :teamId and status = 'ACTIVE';
COMMIT
```

If either update fails, roll back the entire transaction.

### 8.2 Remove Member from Team

```text
update tbl_team_member
set status = 'INACTIVE', left_at = now(), deleted_at = now(), version = version + 1
where team_id = :teamId
  and member_key = :memberKey
  and status = 'ACTIVE';
```

---

## 9. DB-Related Business Errors

| Error Code | Condition |
|---|---|
| TEAM_CODE_DUPLICATED | Violation of unique active team_code |
| TEAM_NOT_FOUND | Team not found |
| TEAM_ALREADY_INACTIVE | Team is no longer active |
| TEAM_MEMBER_ALREADY_EXISTS | Violation of unique active `(team_id, member_key)` |
| TEAM_MEMBER_NOT_FOUND | Active membership not found |
| TEAM_MEMBER_ALREADY_INACTIVE | Membership is already inactive |
| TEAM_MEMBER_ROLE_REQUIRED | `role_id` is null |
| TEAM_MEMBER_ROLE_INVALID | `role_id` does not exist / is invalid |

---

## 10. Implementation Notes

- Do not add `project_id` to the Teams form/API.
- Do not create a Team-Project table in this phase.
- If Team assignment to Project is needed later, create a separate ticket/screen and design a separate relationship.
- A separate audit log is not required in this phase beyond the existing metadata columns.