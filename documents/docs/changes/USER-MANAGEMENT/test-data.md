# Test Data

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

## Data Policy

- Use synthetic data only.
- Do not use production data, real passwords, real bearer tokens, or secrets.
- Use deterministic prefixes such as `UM_BB_`, `UM_TEST_`, or `UM_E2E_` so cleanup can safely identify test data.
- Include at least one ADMIN account, one non-ADMIN account, one active target account, one inactive target account, and one duplicate-username case.
- Include data that proves `team_id = NULL` and role mapping behavior.
- Record boundary values exactly for username, password, and pagination cases.

## Master Data

| name | value | purpose |
|---|---|---|
| Role | `ADMIN` | Allowed to access and manage User Management. |
| Role | `EDITOR` | Non-admin negative-role test if available. |
| Role | `VIEWER` | Non-admin negative-role test. |
| Status | `ACTIVE` | Default account state for active login. |
| Status | `INACTIVE` | Used for deactivate/login-negative test. |
| Message Key | `Component.Permission.Denied` | Non-admin API denial. |
| Message Key | `Pages.UserAccounts.Username.Duplicate` | Duplicate username validation. |
| Message Key | `Pages.UserAccounts.Password.ConfirmMismatch` | Password confirmation validation. |
| Message Key | `Pages.UserAccounts.Password.Weak` | Weak password validation if surfaced by FE/BE. |
| Message Key | `Pages.UserAccounts.LastAdmin.Guard` | Last active ADMIN guard. |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `admin_bb@example.test` | ADMIN | Full User Management access | Normal create/update/reset/deactivate cases. |
| `viewer_bb@example.test` | VIEWER | No User Management access | FE logout/redirect and BE 403 cases. |
| `editor_bb@example.test` | EDITOR | No User Management access | Additional non-ADMIN negative case. |
| Unauthenticated session | N/A | No authenticated access | API 401/unauthenticated behavior. |

## Normal Data

| ID | data | purpose |
|---|---|---|
| UM-NORMAL-001 | username `um_bb_active_001`, fullname `User Management Active 001`, email `um_active_001@example.test`, role `ADMIN`, status `ACTIVE` | Default active list and login regression. |
| UM-NORMAL-002 | username `um_bb_active_002`, fullname `User Management Active 002`, email `um_active_002@example.test`, role `VIEWER`, status `ACTIVE` | List/search/filter and non-admin reference. |
| UM-NORMAL-003 | username `um_bb_inactive_001`, fullname `User Management Inactive 001`, email `um_inactive_001@example.test`, role `VIEWER`, status `INACTIVE` | Deactivate/reactivate and login-negative tests. |
| UM-NORMAL-004 | username `um_bb_role_test`, fullname `Role Test User`, email `um_role_test@example.test`, role `EDITOR`, status `ACTIVE` | Role update and role dropdown test. |

## Error Data

| ID | data | expected error |
|---|---|---|
| ERR-USERNAME-EMPTY | blank username | Required username validation. |
| ERR-USERNAME-DUP | duplicate username matching an active record | Duplicate username validation. |
| ERR-PASSWORD-MISMATCH | password and confirmPassword differ | Confirm-password validation. |
| ERR-PASSWORD-WEAK | weak password value | Weak password validation if enforced. |
| ERR-ROLE-MISSING | missing roleId | Required role validation. |
| ERR-LAST-ADMIN | only active ADMIN account | Last active ADMIN guard. |
| ERR-NONADMIN-FE | authenticated non-ADMIN opens screen | Redirect away / logout. |
| ERR-NONADMIN-API | authenticated non-ADMIN calls API directly | 403 permission error. |
| ERR-UNAUTH-API | no session/cookie/token | 401 or existing unauthenticated response. |
| ERR-NOTFOUND-ID | non-existing account ID | Not-found response. |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| BND-USERNAME-001 | username | 1 character | Accepted if otherwise valid. |
| BND-USERNAME-100 | username | 100 characters | Accepted if otherwise valid. |
| BND-USERNAME-101 | username | 101 characters | Rejected. |
| BND-FULLNAME-255 | fullname | 255 characters | Accepted if otherwise valid. |
| BND-FULLNAME-256 | fullname | 256 characters | Rejected if enforced by current contract. |
| BND-PASSWORD-MIN | password | valid dummy password, for example `UserMgmt#12345` | Accepted if it meets FE/BE rules. |
| BND-PASSWORD-WEAK | password | weak dummy password, for example `password123` | Rejected by password policy. |
| BND-PAGE-NEG | page | negative or zero | Normalized or safely rejected. |
| BND-SIZE-OVER | size | over maximum | Normalized or safely rejected. |
| BND-TEAMID-INPUT | teamId | included in request payload | Rejected/absent by design; not part of the MVP. |

## Existing Data Compatibility

- Existing account data must remain compatible with the corrected documentation and generated tests.
- Existing active accounts must continue to login.
- Existing inactive accounts must remain unable to login.
- No test should depend on production-like usernames or email addresses.

## Data Setup Procedure

1. Prepare an isolated test database or approved QA environment.
2. Create or identify synthetic ADMIN and non-ADMIN users.
3. Create active account records for list/search/create/update/reset cases.
4. Create at least one inactive/deactivated account for lifecycle and login-negative tests.
5. Confirm no active records already use the planned unique usernames.
6. For stale-version tests, read current state, perform an update in another session, then submit the stale request.
7. For double-submit tests, use unique suffixes so repeated runs do not collide with existing data.

## Data Cleanup Procedure

1. Delete or archive only synthetic data with approved test prefixes such as `UM_BB_`, `UM_TEST_`, or `UM_E2E_`.
2. Do not physically delete production or production-like data.
3. Prefer deactivation or test-database reset over hard delete.

## Sensitive Data Handling

- Do not store passwords, password hashes, tokens, secrets, or private keys in test evidence.
- Do not use real personal email addresses.
- Redact logs before saving evidence.
