# 02 Reference Extracts

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-12  

## 1. Source Code Extracts Used

| Area | File | Relevant behavior |
|---|---|---|
| FE route | `EDCAP_FE/src/App.tsx` | `RequireAdmin` guards `:lang/admin/user-accounts`. |
| FE page | `EDCAP_FE/src/pages/user/UserAccountsPage.tsx` | List/filter/create/edit/reset/deactivate/reactivate. |
| FE form | `EDCAP_FE/src/pages/user/form-config.ts` | No team field; role field required; password fields create/reset only. |
| FE table | `EDCAP_FE/src/pages/user/UserAccountsTable.tsx` | Columns: username, fullname, role, status, updatedAt, actions. |
| FE API | `EDCAP_FE/src/lib/api.ts` | `endpoints.userAccounts` maps to `/api/v1/admin/user-accounts`. |
| BE controller | `UserAccountAdminController.java` | Admin API endpoints. |
| BE service | `UserAccountAdminService.java` | Admin guard, create/update/reset/deactivate, bcrypt, last Admin guard. |
| BE DTO | `UserAccountAdminDtos.java` | Safe DTO without password/hash/token fields. |
| BE mapper | `UserAccountAdminMapper.xml` | Inserts/updates `tbl_dim_member_pseudonym.team_id = NULL`. |

## 2. Template Extract

FE template requires these 27 files exactly and includes `source-availability.md`, not `03_source-availability.md`.

## 3. AC/Test Extract

The test package asserts:

- role required and roleId sent.
- teamId not present in create payload.
- teamId null in API response.
- passwordHash absent from API response.
- non-admin forbidden/redirected.
- last active Admin cannot be deactivated.
