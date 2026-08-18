# Spec Pack

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-12  

## 1. Context / Purpose

`USER-MANAGEMENT` provides an Admin-only screen for managing internal login accounts after the `LOGIN` feature switched to username/password token authentication.

The implementation now exists in the uploaded source and the documentation must match the actual code and test scope. The feature manages login accounts, creates/updates the linked member pseudonym record for role mapping, and intentionally does not manage team assignment.

Main purpose:

- Let ADMIN users list, search, create, update, deactivate/reactivate and reset password for login accounts.
- Use `tbl_auth_user_account` as the login-account table.
- Use `tbl_dim_member_pseudonym` for the linked member identity and role mapping.
- Save `role_id` from Admin selection.
- Save `team_id = NULL` in `tbl_dim_member_pseudonym` for this MVP.
- Never expose password, password hash, token, secret or private key.

## 2. Scope

### 2.1. Within range

| Area | Scope |
|---|---|
| Access control | ADMIN-only FE route and BE API. |
| FE screen | `/:lang/admin/user-accounts` User Accounts page. |
| FE operations | List/search/filter/create/view/edit/reset password/deactivate/reactivate. |
| BE API | `/api/v1/admin/user-accounts` family and `/api/v1/admin/roles`. |
| DB write | `tbl_auth_user_account` and linked `tbl_dim_member_pseudonym`. |
| Role | `role_id` is required and saved to member pseudonym. |
| Team | Team assignment is not supported; `team_id` is intentionally saved as `NULL`. |
| Password | Admin enters password for create/reset; backend stores bcrypt hash only. |
| Delete | No hard delete; use deactivate/reactivate. |
| Safety | No sensitive value in UI/API/log evidence. |

### 2.2. Out of range

| Out of range | Reason |
|---|---|
| Team assignment / team filter / team input | User confirmed team is not managed in this screen. |
| Member CRUD full profile management | Separate Member Management scope. |
| Forgot password / self-service reset | Out of LOGIN MVP and USER-MANAGEMENT MVP. |
| Email notification for password reset | No secure delivery policy in this ticket. |
| SSO/OAuth/MFA | LOGIN MVP uses username/password token flow. |
| Formal audit log implementation | Future phase. Safe application logging only. |
| Hard delete account/member | Forbidden to preserve traceability and avoid accidental lockout. |

## 3. Terminology
| terms | meaning | notes |
|---|---|---|
| User Account | Login account stored in `tbl_auth_user_account`. | Identified by `user_account_id` and `username`. |
| Member Pseudonym | Linked identity row in `tbl_dim_member_pseudonym`. | Holds `member_key`, `role_id`, `team_id`. |
| Role | RBAC role from `tbl_dim_role`. | `ADMIN` can access this screen. |
| team_id NULL | Intentional MVP behavior. | No team input/filter/assignment. |
| Deactivate | Set account inactive. | Reversible. Not hard delete. |
| Last Admin | Last active account whose role is ADMIN. | Must not be deactivated/downgraded. |
| Sensitive fields | password, passwordHash, token, secret, private key. | Never returned/displayed/logged. |

## 4. As-Is

- `LOGIN` exists with username/password token-based authentication.
- Source already contains User Management implementation files in FE and BE.
- Previous docs were not aligned with the FE `_ticket-template` and still mentioned team filter/input in places.
- Tests created for USER-MANAGEMENT cover account + member pseudonym creation, role mapping, `team_id = NULL`, Admin-only, no sensitive-field exposure, reset password, deactivate/reactivate and last Admin guard.

## 5. To-Be

- Documentation follows `EDCAP_FE/documents/docs/standards/templates/_ticket-template` exactly: 27 files, no missing files, no extra files.
- Spec, review, self-review, test plan and report use the same AC IDs.
- Feature scope matches the code/tests:
  - Role is required.
  - Team is not input/filtered/assigned.
  - `team_id = NULL` is expected behavior.

## 6. Detailed specification

### 6.1. Business Rules

| ID | Rule |
|---|---|
| BR-1 | Only ADMIN can access the screen and APIs. |
| BR-2 | Non-admin direct URL/API access is blocked. |
| BR-3 | Create writes both `tbl_auth_user_account` and `tbl_dim_member_pseudonym`. |
| BR-4 | `role_id` is required and must exist in `tbl_dim_role`. |
| BR-5 | `tbl_dim_member_pseudonym.team_id` is always written/kept as `NULL` in this ticket. |
| BR-6 | No team input/filter/assignment in FE or API request DTO. |
| BR-7 | Username is required, trimmed, max 100 chars and unique ignoring case. |
| BR-8 | Fullname defaults to username if blank and max 250 chars. |
| BR-9 | Email is optional and max 255 chars in BE DTO/domain; FE currently limits input to 100 chars. |
| BR-10 | Password and confirmPassword are required for create/reset and must match. |
| BR-11 | Backend rejects weak passwords without both letter and digit; FE additionally requires a special character. |
| BR-12 | Password is stored with bcrypt hash and `password_algo = bcrypt`. |
| BR-13 | Password/passwordHash/token/secret/private key must not be in response or UI. |
| BR-14 | Deactivate/reactivate replaces hard delete. |
| BR-15 | Do not deactivate or downgrade the last active ADMIN. |
| BR-16 | Formal audit is out of scope, but logs must not contain raw password/token/hash. |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| keyword | string | No | trim; search username/fullname/email/pseudonym | List API. |
| status | enum | No | ALL/ACTIVE/INACTIVE | Invalid value rejected. |
| roleId / roleIds | UUID/list | No for list, Yes for create/update | must exist in `tbl_dim_role` | FE filter uses roleIds. |
| page | number | No | min normalized to 0 | List API. |
| size | number | No | default 20; max 100 in BE | FE default is 25. |
| username | string | Yes for create | trim; unique; max 100 | Read-only after create in FE. |
| fullname | string | No | max 250 BE; display/member name | Defaults to username if blank. |
| email | string | No | max 255 BE; FE max 100; email format in FE | Can be null. |
| password | string | Yes for create/reset | min 8; confirm match; strength rule | Never persisted raw. |
| confirmPassword | string | Yes for create/reset | must match password | Not stored. |
| isActive | boolean | Yes for create/update | true/false | Drives login ability. |

### 6.3. Output
| item | type | format | notes |
|---|---|---|---|
| accountId | UUID | string | Account primary ID. |
| memberKey | UUID | string | Link to `tbl_dim_member_pseudonym`. |
| username | string | text | Login name. |
| fullname | string | text | Member/display name. |
| email | string/null | email-like | Optional. |
| roleId | UUID | string | Role selected by Admin. |
| roleName | string | text | Role display name. |
| teamId | UUID/null | null expected | `NULL` in MVP. |
| teamName | string/null | null expected | No team assignment. |
| isActive | boolean | true/false | Account login status. |
| lastLoginAt | datetime/null | ISO8601/null | Currently null from mapper. |
| createdAt / updatedAt | datetime | ISO8601 | Audit metadata columns. |

Forbidden output fields: `password`, `passwordHash`, `password_hash`, `token`, `refreshToken`, `secret`, `privateKey`.

### 6.4. Error / Exception
| case | expected behavior | message/code | notes |
|---|---|---|---|
| Non-admin caller | Reject | `Component.Permission.Denied` / 403 | FE redirects non-admin away. |
| Username missing | Reject before write | `Pages.UserAccounts.Username.Required` | Create only. |
| Username duplicate | Reject before write | `Pages.UserAccounts.Username.Duplicate` | Case-insensitive check. |
| Role missing | Reject | `Pages.UserAccounts.Role.Required` | Create/update/filter role validation. |
| Role invalid | Reject | `Pages.UserAccounts.Role.Invalid` | Must exist. |
| Password missing | Reject | `Pages.UserAccounts.Password.Required` | Create/reset. |
| Password too short | Reject | `Pages.UserAccounts.Password.MinLength` | Min 8. |
| Password weak | Reject | `Pages.UserAccounts.Password.Pattern` | FE stricter than BE. |
| Password mismatch | Reject | `Pages.UserAccounts.Password.Mismatch` | Create/reset. |
| Account not found | Reject | `Pages.UserAccounts.NotFound` | Detail/update/reset/status. |
| Last Admin deactivation/downgrade | Reject | `Pages.UserAccounts.LastAdmin` | Blocker if broken. |

### 6.5. Boundary Value
| item | min | max | special cases | expected |
|---|---|---|---|---|
| username | 1 char after trim | 100 chars | spaces trimmed | reject blank/>100. |
| fullname | fallback username | 250 chars | blank -> username | reject >250. |
| email | null | 255 BE / 100 FE | null allowed | reject too long / invalid FE format. |
| password | 8 chars | 100 FE | create/reset only | reject weak/mismatch. |
| page | 0 | n/a | negative -> 0 | normalized. |
| size | 1 | 100 BE | <=0 -> 20 | normalized. |
| roleIds | 0 | n/a | nulls filtered/distinct | invalid role rejected. |
| teamId | n/a | n/a | absent in request; null in DB/response | must not be set by UI. |

### 6.6. Non-functional
| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Admin list should paginate. | default size 20 BE / 25 FE, max 100 BE. | BE UT/IT. | Avoid loading all accounts. |
| Security | ADMIN-only and no sensitive fields. | 100% protected endpoints. | BE IT / review. | BE guard is mandatory. |
| Availability / Reliability | No batch/job dependency. | CRUD works synchronously. | Review. | No async event. |
| Maintainability | Follow existing controller/service/repository/UI patterns. | Same package/component style. | Review. | Exact files listed in source inventory. |
| Observability / Logging | Safe errors and logs. | no raw password/hash/token. | Review/source scan. | Formal audit out of scope. |
| Compatibility | Do not redesign LOGIN. | Active/inactive status remains compatible. | Regression test. | Login linkage must be preserved. |

## 7. Acceptance Criteria
| AC ID | Description | Main test coverage |
|---|---|---|
| AC-USER-MANAGEMENT-1 | ADMIN user can open the User Management screen at `/:lang/admin/user-accounts`. | FE E2E / FE component |
| AC-USER-MANAGEMENT-2 | Non-admin user cannot access the screen or ADMIN user-account APIs. | FE E2E / BE IT / BE UT |
| AC-USER-MANAGEMENT-3 | ADMIN can list user accounts with username, member/fullname, role, status, updated time and actions. | FE component / BE IT |
| AC-USER-MANAGEMENT-4 | ADMIN can search accounts by keyword and filter by status and role. Team filter is not in MVP. | FE unit / BE UT / BE IT |
| AC-USER-MANAGEMENT-5 | ADMIN can create an account with username, fullname, email, password, confirmPassword, roleId and isActive. | BE UT / BE IT / FE unit / E2E |
| AC-USER-MANAGEMENT-6 | Create request and FE form must not include `teamId`; system stores `tbl_dim_member_pseudonym.team_id = NULL`. | BE UT / BE IT / FE unit / E2E |
| AC-USER-MANAGEMENT-7 | Create account writes `tbl_auth_user_account` and linked `tbl_dim_member_pseudonym`. | BE UT / BE IT |
| AC-USER-MANAGEMENT-8 | `role_id` is required and saved on `tbl_dim_member_pseudonym`; invalid role is rejected. | BE UT / BE IT / FE unit |
| AC-USER-MANAGEMENT-9 | Username is trimmed, required, max 100 characters and duplicate username is rejected case-insensitively. | BE UT / BE IT |
| AC-USER-MANAGEMENT-10 | Password is required for create/reset, confirmPassword must match, and weak passwords are rejected before DB write. | BE UT / FE unit |
| AC-USER-MANAGEMENT-11 | Password is saved as bcrypt hash with `password_algo = bcrypt`; raw password is never stored. | BE UT / BE IT / Security review |
| AC-USER-MANAGEMENT-12 | API responses and UI never expose password, passwordHash, token, secret or private key. | BE IT / FE unit / Security review |
| AC-USER-MANAGEMENT-13 | ADMIN can view account detail without sensitive fields. | BE IT / FE component |
| AC-USER-MANAGEMENT-14 | ADMIN can update fullname, email, roleId and isActive; username is not updated through edit flow. | BE UT / BE IT / FE unit |
| AC-USER-MANAGEMENT-15 | Updating role changes member pseudonym `role_id` and keeps `team_id = NULL`. | BE UT / BE IT |
| AC-USER-MANAGEMENT-16 | ADMIN can deactivate and reactivate accounts; system does not hard delete accounts. | BE UT / BE IT / FE component / E2E |
| AC-USER-MANAGEMENT-17 | System rejects deactivation or role downgrade if it would leave no active ADMIN account. | BE UT / BE IT |
| AC-USER-MANAGEMENT-18 | ADMIN can reset password; reset replaces password hash and does not return/log raw password. | BE UT / BE IT / FE unit |
| AC-USER-MANAGEMENT-19 | Active account created/updated by this screen can be used by LOGIN; inactive/deactivated account cannot login. | Regression IT / E2E |
| AC-USER-MANAGEMENT-20 | Pagination uses normalized page/size; invalid page/size does not break list API. | BE UT / BE IT |
| AC-USER-MANAGEMENT-21 | Errors use safe message keys/traceId style where available and do not leak sensitive values. | BE IT / FE unit |
| AC-USER-MANAGEMENT-22 | No batch/job/event is introduced by this ticket. | Review |
| AC-USER-MANAGEMENT-23 | Formal audit, forgot password, self-service reset, SSO/OAuth/MFA and team assignment remain out of scope. | Review |

## 8. Examples

### 8.1. Normal Case

| Case | Expected result | Related AC |
|---|---|---|
| ADMIN opens `/:lang/admin/user-accounts`. | Page loads and list API is called. | AC-1, AC-3 |
| ADMIN creates `user01` with role USER and active=true. | Account row and member pseudonym row are created; `team_id = NULL`; account can login. | AC-5, AC-6, AC-7, AC-8, AC-19 |
| ADMIN resets password. | New bcrypt hash replaces old hash; response has no sensitive field. | AC-11, AC-12, AC-18 |
| ADMIN deactivates then reactivates a non-last-admin user. | `is_active` changes; no hard delete. | AC-16 |

### 8.2. Error Case

| Case | Expected result | Related AC |
|---|---|---|
| Non-admin opens route/API. | Redirect/403. | AC-2 |
| Duplicate username. | Reject with duplicate message and no DB write. | AC-9 |
| Missing/invalid role. | Reject. | AC-8 |
| Password mismatch. | Reject. | AC-10 |
| Deactivate last active ADMIN. | Reject with last Admin message. | AC-17 |

### 8.3. Boundary Case

| Case | Expected result | Related AC |
|---|---|---|
| Username has leading/trailing spaces. | Trim before unique check/write. | AC-9 |
| List size > 100. | Normalize to max 100 in BE. | AC-20 |
| `teamId` passed from FE create flow. | Should not happen; tests assert payload has no `teamId`. | AC-6 |
| roleIds contains duplicates/null. | Service filters distinct non-null role IDs. | AC-4 |

## 9. Source Availability Summary

| Source | Status | Notes |
|---|---|---|
| FE template `_ticket-template` | read | This corrected pack follows its 27-file structure. |
| USER-MANAGEMENT docs before correction | read | Had extra/missing template files and team references. |
| FE source | read | `UserAccountsPage`, drawer/table/form-config/types/API/App route exist. |
| BE source | read | Controller/service/DTO/repository port/mapper XML exist. |
| DB migration/schema | read | `team_id` is written as `NULL` by mapper. |
| Test files generated earlier | read | AC mapping updated to match tests. |

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: FE+BE+DB
- Primary risk: Security / DB / Contract / Test
- Review mode: Heavy for security-sensitive account management
- Required options: Source Analysis / FE-BE Contract / DB Mapping / Full Security / E2E
```

## 11. FE/BE Contract Impact

| Contract | Actual source |
|---|---|
| GET `/api/v1/admin/user-accounts` | list with keyword/status/roleId/roleIds/page/size. |
| GET `/api/v1/admin/user-accounts/{accountId}` | detail. |
| POST `/api/v1/admin/user-accounts` | create. |
| PUT `/api/v1/admin/user-accounts/{accountId}` | update. |
| POST `/api/v1/admin/user-accounts/{accountId}/activate` | activate. |
| POST `/api/v1/admin/user-accounts/{accountId}/deactivate` | deactivate. |
| POST `/api/v1/admin/user-accounts/{accountId}/reset-password` | reset password. |
| GET `/api/v1/admin/roles` | role dropdown. |

Request DTOs do not include `teamId`. Response DTO includes `teamId`/`teamName`, expected to be `null` for this MVP.

## 12. DB/Migration Impact

| Table | Impact |
|---|---|
| `tbl_auth_user_account` | insert/update active/password/fullname/email; no hard delete. |
| `tbl_dim_member_pseudonym` | insert/update role_id; set/keep `team_id = NULL`. |
| `tbl_dim_role` | read/validate roles. |

No migration is required for the current source because the mapper writes `team_id = NULL`. If local DB has `team_id NOT NULL`, implementation must stop and fix schema before running.

## 13. Security/Privacy Impact

- ADMIN-only at FE route and BE service/API.
- Never expose or log password/hash/token/secret/private key.
- Password hashing uses bcrypt.
- Last active ADMIN protection is mandatory.
- Formal audit is not implemented in this ticket; safe logs only.

## 14. Operation/Maintenance Impact

- No batch/job/event.
- Rollback can hide route/menu and disable API.
- Data created by this feature should not be deleted automatically; use deactivate/manual cleanup if needed.
- Password reset requires secure human operation because no email/self-service reset exists.

## 15. Test Strategy Summary

| Type | Coverage |
|---|---|
| BE UT | Service validation, bcrypt, role, duplicate, last Admin, paging/status. |
| BE IT | Controller/API contract, non-admin forbidden, safe response, `teamId = null`. |
| FE unit/component | Form config, role required, no team field, API calls. |
| E2E | Admin opens page, non-admin blocked, create payload has no teamId. |
| Security review | Sensitive field exposure, ADMIN-only, no hard delete. |

## 16. Human Decision Required
| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| H-USER-MANAGEMENT-1 | `team_id = NULL` allowed in `tbl_dim_member_pseudonym` | Needed to keep team assignment out of scope | Product/DB owner | Decided: allowed |
| H-USER-MANAGEMENT-2 | Team assignment out of scope | Avoid scope creep | Product owner | Decided |
| H-USER-MANAGEMENT-3 | Formal audit out of scope | Align with LOGIN MVP | Product owner | Decided |

## 17. Assumptions and Inference Log
| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-USER-MANAGEMENT-1 | ADMIN is represented by `AppUser.Role.ADMIN` and role name `ADMIN`. | Source code `RequireAdmin`, service and last Admin guard. | Role naming drift. | No for current source. |
| A-USER-MANAGEMENT-2 | FE password rule is stricter than BE because FE requires special character. | `validatePassword` in FE and service code in BE. | Inconsistent UX/API validation. | Should review later. |
| A-USER-MANAGEMENT-3 | `lastLoginAt` is currently null from mapper. | Mapper uses `NULL::timestamptz`. | UI may display blank. | No blocker. |

## 18. Open Issues
| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-USER-MANAGEMENT-1 | Align FE/BE password policy exactly, especially special character requirement. | Minor/Major depending UX requirement. | FE/BE owner | Open, non-blocking for current tests. |
| OI-USER-MANAGEMENT-2 | Add formal audit log for account admin operations in future phase. | Compliance improvement. | Product/Security | Future. |
