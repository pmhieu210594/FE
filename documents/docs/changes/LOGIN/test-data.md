# Test Data

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

## Data Policy

Use only synthetic, staging, or transaction-scoped test data. Do not use production users, production passwords, production tokens, production JWT secrets, real password hashes, or copied production logs. Test reports may use fixture labels such as `validAdminPassword` and `validAccessToken`, but must not store raw secrets. Clear browser storage and token-session rows between test groups.

## Master Data

| name | value | purpose |
|---|---|---|
| `APP_JWT_EXPIRATION_HOURS` | `1` for default-like test, shorter only in isolated token tests | Verify `expiresInSeconds` and token expiry behavior |
| `APP_AUTH_ENABLE_REFRESH_TOKEN` | `false` | Confirm active refresh flow is out of scope |
| `APP_AUTH_ENABLE_REMEMBER_ME` | `false` | Confirm Remember Me is inactive |
| `locales` | `en`, `vi`, `ja` | Verify visible login/error text and UTF-8 display |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `TD-USER-ACTIVE-ADMIN` | `ADMIN` | Can authenticate and access admin landing | Admin success, redirect, current-user payload |
| `TD-USER-ACTIVE-NONADMIN` | `EDITOR` or `VIEWER` | Can authenticate but is not admin | Non-admin success and root landing |
| `TD-USER-INACTIVE` | Any role | `is_active = false` | Inactive account safe rejection |
| `TD-USER-FAILURE` | Non-admin preferred | Active account used for repeated-failure scenarios | Repeated failures remain generic and safe |
| `TD-USER-UNKNOWN` | None | No account row | Unknown username/no enumeration |
| `TD-USER-AUTHENTICATED` | Admin and non-admin variants | Valid current-user state | Authenticated user opening login is redirected by role |

## Normal Data

| ID | data | purpose |
|---|---|---|
| TD-NOR-001 | Active admin valid username/password fixture | Login success and `/:lang/admin` redirect |
| TD-NOR-002 | Active non-admin valid username/password fixture | Login success and `/:lang/` redirect |
| TD-NOR-003 | Valid bearer access token with active token session | `/api/v1/auth/me`, `/api/v1/me`, protected API access |
| TD-NOR-004 | Logged-in browser state with access token and query cache | Logout local-state clearing |
| TD-NOR-005 | Username with leading/trailing spaces around an active username | Username trim behavior |
| TD-NOR-006 | Locales `en`, `vi`, `ja` | Login page and safe error message display |

## Error Data

| ID | data | expected error |
|---|---|---|
| TD-ERR-001 | Existing active username + wrong password | 401 generic `INVALID_CREDENTIALS`; no token |
| TD-ERR-002 | Unknown username + any password | Same 401 generic invalid-credential behavior |
| TD-ERR-003 | Inactive account + correct password | 401 safe `ACCOUNT_TEMPORARILY_UNAVAILABLE`; no token |
| TD-ERR-004 | Blank username + nonblank password | FE no-submit or BE `VALIDATION_ERROR` if reached |
| TD-ERR-005 | Nonblank username + blank password | FE no-submit or BE `VALIDATION_ERROR` if reached |
| TD-ERR-006 | Missing bearer token | 401; FE anonymous |
| TD-ERR-007 | Malformed/tampered bearer token | 401/safe unauthorized; FE anonymous |
| TD-ERR-008 | Expired bearer token | 401/safe unauthorized; FE anonymous |
| TD-ERR-009 | Revoked bearer token after logout | 401/safe unauthorized; FE anonymous |
| TD-ERR-010 | Backend 500 or network failure during login | Generic safe login failure; no stored token |
| TD-ERR-011 | Backend failure during logout | FE still clears local auth state |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| TD-BND-001 | Username trim | `" alice "` where `alice` is active fixture username | Authenticates as trimmed username |
| TD-BND-002 | Username max length | 100 characters | Accepted by validation if account exists; otherwise safe invalid credentials |
| TD-BND-003 | Username over max | 101 characters | Safe validation rejection |
| TD-BND-004 | Password empty | empty string | FE no-submit or safe validation rejection |
| TD-BND-005 | Password over max | 257 characters | Safe validation rejection; no secret echo |
| TD-BND-006 | Repeated failures | Multiple wrong passwords in a row | Failure remains generic and safe |
| TD-BND-007 | Repeated failures with success | Wrong password then correct password | Success is accepted; no special failure state appears |
| TD-BND-008 | Failure streak vs success | Correct password after prior failures | Login succeeds normally and session is refreshed/replaced |
| TD-BND-009 | Token expiry edge | Token at/past expiry | Rejected as unauthorized |
| TD-BND-010 | Double submit | Rapid click and Enter while login pending | One in-flight login request |

## Existing Data Compatibility

- `tbl_auth_user_account` must provide username, full name, email, password hash, password algorithm, active flag, and role/member mapping for LOGIN tests.
- `tbl_auth_token_session` must support active and revoked token states.
- `/api/v1/me` compatibility must be tested alongside canonical `/api/v1/auth/me`.
- Existing seeded demo users may be used only in local/staging environments when the password and privacy policy are explicitly approved for test use. Prefer synthetic fixtures over named personal accounts.

## Data Setup Procedure

1. Create or mock active admin, active non-admin, and inactive users.
2. Use bcrypt-compatible password hashes generated for test-only passwords.
3. Configure auth policy values for the target environment and record them in the test evidence.
4. Clear `tbl_auth_token_session` for test users before each black-box run.
5. Clear browser localStorage/session state before each FE/E2E scenario.
6. For E2E without BE dependency, mock `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/me`, and `/api/v1/auth/logout` with the same response shape.

## Data Cleanup Procedure

1. Revoke or delete token-session rows created during tests.
2. Remove transaction-scoped test users if they were inserted.
3. Restore auth config to environment defaults if changed.
4. Clear browser localStorage, session storage, cookies, and test caches.
5. Confirm logs attached to evidence are redacted.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets to artifacts.
- Do not paste raw access tokens, refresh tokens, JWT secrets, password hashes, SQL connection strings, or stack traces containing sensitive data.
- Use placeholder labels such as `<valid-access-token-redacted>` in screenshots or reports.
- Screenshots must not display raw tokens or browser storage values.
- Email exposure in auth payloads remains human/security review required.
