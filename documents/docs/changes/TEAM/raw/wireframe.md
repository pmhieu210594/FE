# Wireframe - Teams Management Feature

**Ticket ID**: TEAM  
**Created Date**: 2026-06-15  
**Created By**: nk_trung  
**Updated Date**: 2026-06-15  

---

## 1. Screen/Area List

| Screen / Area | Purpose |
|---|---|
| Team List | Search, view list, create/edit/delete Teams |
| Team Create Drawer/Dialog | Create a new Team |
| Team Detail Drawer/Page | View Team information and manage members in the Team |
| Team Edit Drawer/Dialog | Update Team information |
| Delete Team Dialog | Confirm Team deletion/inactivation |
| Add Member Dialog | Add a member to a Team and select a role |
| Update Member Role Dialog | Update a member's role in the Team |
| Remove Member Dialog | Confirm removing a member from the Team |

Notes:

- This screen is only for the `ADMIN` role.
- This screen does not provide a function to assign a Team to a Project.
- All labels/buttons/messages use i18n keys; do not hard-code text.

---

## 2. Team List

```text
+--------------------------------------------------------------------------------+
| Teams Management                                                  [+ Create Team]|
+--------------------------------------------------------------------------------+
| [ Search by Team Code / Team Name ____________________ ] [Status: Active v]    |
+--------------------------------------------------------------------------------+
| Action | Team Code | Team Name      | Members | Status   | Updated At          |
|--------|-----------|----------------|---------|----------|---------------------|
| 👁 ✎ 🗑 | TEAM-BE   | Backend Team   | 5       | Active   | 2026-06-15 10:00    |
| 👁 ✎ 🗑 | TEAM-QA   | QA Team        | 3       | Active   | 2026-06-15 10:30    |
+--------------------------------------------------------------------------------+
| < Prev                                                Page 1 / N        Next >  |
+--------------------------------------------------------------------------------+
```

### 2.1 Display Columns

| Column | Content |
|---|---|
| Action | View / Edit / Delete |
| Team Code | Team code |
| Team Name | Team name |
| Members | Number of active members in the Team |
| Status | Active / Inactive |
| Updated At | Last updated time |

### 2.2 Behavior

- By default, only active Teams are displayed.
- Can filter by status: Active / Inactive / All.
- Search by Team Code or Team Name.
- Click View to open Team details.
- Click Edit to open the Team edit form.
- Click Delete to open the confirmation dialog.
- Do not display any Project field/filter on this screen.
- If the user does not have the `ADMIN` role, do not allow access to the screen.

---

## 3. Team Create

```text
+--------------------------------------------------------------------------------+
| Create Team                                                                    |
+--------------------------------------------------------------------------------+
| Team Code *                                                                    |
| [ TEAM-BE___________________________________ ]                                  |
|                                                                                |
| Team Name *                                                                    |
| [ Backend Team______________________________ ]                                  |
|                                                                                |
| Description                                                                    |
| [ Description of the Team purpose/scope___________________________________ ]    |
| [_________________________________________________________________________ ]    |
+--------------------------------------------------------------------------------+
| [Cancel]                                                        [Save]          |
+--------------------------------------------------------------------------------+
```

### 3.1 Fields

| Field | Required | Note |
|---|---:|---|
| Team Code | Yes | Unique among active Teams |
| Team Name | Yes | Display name of the Team |
| Description | No | Short description |

### 3.2 Validation

| Case | Error Code from BE | FE Display |
|---|---|---|
| Missing Team Code | TEAM_CODE_REQUIRED | Translate by i18n |
| Missing Team Name | TEAM_NAME_REQUIRED | Translate by i18n |
| Duplicate Team Code | TEAM_CODE_DUPLICATED | Translate by i18n |

---

## 4. Team Detail

```text
+--------------------------------------------------------------------------------+
| Team Detail                                                         [Edit]      |
+--------------------------------------------------------------------------------+
| Team Code                                                                      |
| TEAM-BE                                                                        |
|                                                                                |
| Team Name                                                                      |
| Backend Team                                                                   |
|                                                                                |
| Description                                                                    |
| Description of the Team purpose/scope                                          |
|                                                                                |
| Status: Active             Version: 3                                          |
| Updated At: 2026-06-15 10:00                                                   |
+--------------------------------------------------------------------------------+
| Members                                                            [+ Member]   |
+--------------------------------------------------------------------------------+
| Action | Member              | Role | Joined At          | Updated At          |
|--------|---------------------|------|--------------------|---------------------|
| ✎ 🗑   | member_001          | DEV  | 2026-06-10 09:00   | 2026-06-12 14:20    |
| ✎ 🗑   | member_002          | QA   | 2026-06-10 09:30   | 2026-06-12 14:25    |
+--------------------------------------------------------------------------------+
| [Close]                                                                        |
+--------------------------------------------------------------------------------+
```

### 4.1 Team Information Area

| Field | Content |
|---|---|
| Team Code | Team code |
| Team Name | Team name |
| Description | Team description |
| Status | Active / Inactive |
| Version | Version used for optimistic locking if applied |
| Updated At | Last updated time |

### 4.2 Members Area

| Column | Content |
|---|---|
| Action | Update Role / Remove Member |
| Member | Pseudonym or allowed display name |
| Role | Member's role in the Team |
| Joined At | Time when the member was added to the Team |
| Updated At | Last membership update time |

### 4.3 Behavior

- Member management is only placed on the Team detail screen.
- If the Team is inactive, disable Add Member / Update Role / Remove Member.
- Removed/inactive members are not displayed by default.
- An active member in a Team has only one role.
- A member can still belong to another Team.

---

## 5. Team Edit

```text
+--------------------------------------------------------------------------------+
| Edit Team                                                                      |
+--------------------------------------------------------------------------------+
| Team Code *                                                                    |
| [ TEAM-BE-NEW_______________________________ ]                                  |
|                                                                                |
| Team Name *                                                                    |
| [ Backend Team______________________________ ]                                  |
|                                                                                |
| Description                                                                    |
| [ Description of the Team purpose/scope___________________________________ ]    |
| [_________________________________________________________________________ ]    |
+--------------------------------------------------------------------------------+
| [Cancel]                                                        [Save]          |
+--------------------------------------------------------------------------------+
```

### 5.1 Behavior

- Allow editing Team Code after creation.
- When saving a new Team Code, BE must check uniqueness among active Teams.
- There is no Project field.
- Do not allow editing an inactive Team.
- If BE returns `TEAM_CODE_DUPLICATED`, FE translates the message by i18n.

---

## 6. Delete Team Dialog

```text
+------------------------------------------------------------+
| Delete Team                                                |
+------------------------------------------------------------+
| Are you sure you want to delete this Team?                 |
|                                                            |
| Team: TEAM-BE - Backend Team                               |
|                                                            |
| When deleting the Team, all active members in this Team    |
| will be changed to inactive.                               |
+------------------------------------------------------------+
| [Cancel]                                      [Delete]     |
+------------------------------------------------------------+
```

### 6.1 Behavior

- Deleting a Team is soft delete/inactivation.
- After deleting the Team, BE automatically inactivates all active memberships.
- After successful deletion, return to the Team List or refresh the list.
- FE displays a success message by i18n.

---

## 7. Add Member Dialog

```text
+--------------------------------------------------------------------------------+
| Add Member to Team                                                              |
+--------------------------------------------------------------------------------+
| Member *                                                                       |
| [ Select member v___________________________ ]                                  |
|                                                                                |
| Role *                                                                         |
| [ Select role v_____________________________ ]                                  |
+--------------------------------------------------------------------------------+
| [Cancel]                                                        [Add]           |
+--------------------------------------------------------------------------------+
```

### 7.1 Fields

| Field | Required | Note |
|---|---:|---|
| Member | Yes | Retrieved from the existing member master |
| Role | Yes | Retrieved from `tbl_dim_role` |

### 7.2 Validation

| Case | Error Code from BE | FE Display |
|---|---|---|
| Member is already active in the Team | TEAM_MEMBER_ALREADY_EXISTS | Translate by i18n |
| Role is not selected | TEAM_MEMBER_ROLE_REQUIRED | Translate by i18n |
| Invalid role | TEAM_MEMBER_ROLE_INVALID | Translate by i18n |

---

## 8. Update Member Role Dialog

```text
+--------------------------------------------------------------------------------+
| Update Role                                                                    |
+--------------------------------------------------------------------------------+
| Member                                                                         |
| member_001                                                                     |
|                                                                                |
| Role *                                                                         |
| [ DEV v____________________________________ ]                                   |
+--------------------------------------------------------------------------------+
| [Cancel]                                                        [Save]          |
+--------------------------------------------------------------------------------+
```

### 8.1 Behavior

- Only update the role on `tbl_team_member`.
- Do not update the role in the member master.
- Do not affect the member's membership in other Teams.
- Role is required.

---

## 9. Remove Member Dialog

```text
+------------------------------------------------------------+
| Remove Member                                              |
+------------------------------------------------------------+
| Are you sure you want to remove this member from the Team? |
|                                                            |
| Member: member_001                                         |
| Role: DEV                                                  |
+------------------------------------------------------------+
| [Cancel]                                      [Remove]     |
+------------------------------------------------------------+
```

### 9.1 Behavior

- Removing a member means inactivating the membership.
- Do not delete the member master.
- Do not affect the member's membership in other Teams.
- After successful removal, refresh the Members list.

---

## 10. No Access Permission

```text
+------------------------------------------------------------+
| No Access Permission                                       |
+------------------------------------------------------------+
| You do not have permission to access Teams management.     |
+------------------------------------------------------------+
```

### 10.1 Behavior

- Users without the `ADMIN` role cannot access the Teams screen.
- FE may redirect to Home or display a no-permission page depending on the existing convention.

---

## 11. i18n

- Support `ja`, `vi`, `en`.
- Do not hard-code text.
- BE returns error codes, for example `TEAM_MEMBER_ALREADY_EXISTS`.
- FE maps error codes to messages based on the current language.
- Labels/buttons/placeholders/validation/confirmation dialogs/empty states/toasts all use i18n keys.

---

## 12. Empty State

### 12.1 No Team

```text
+------------------------------------------------------------+
| No Teams yet                                               |
| [Create Team]                                              |
+------------------------------------------------------------+
```

### 12.2 Team Has No Members Yet

```text
+------------------------------------------------------------+
| This Team has no members yet                              |
| [+ Member]                                                 |
+------------------------------------------------------------+
```