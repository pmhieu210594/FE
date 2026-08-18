# Black-box Test Cases

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-07-14  


## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-LOGIN-001 | AC-LOGIN-1 | P0 | Normal | Anonymous user can open login page and see required controls |
| BB-LOGIN-002 | AC-LOGIN-2 | P0 | Error | Empty username blocks login submission |
| BB-LOGIN-003 | AC-LOGIN-3 | P0 | Error | Empty password blocks login submission |
| BB-LOGIN-004 | AC-LOGIN-4 | P0 | Normal | Password is masked by default and can be toggled |
| BB-LOGIN-005 | AC-LOGIN-5 | P0 | State | Pending login prevents duplicate submit |
| BB-LOGIN-006 | AC-LOGIN-6, AC-LOGIN-12 | P0 | Normal | Active admin login succeeds and redirects to admin |
| BB-LOGIN-007 | AC-LOGIN-6, AC-LOGIN-13 | P0 | Normal | Active non-admin login succeeds and redirects to root landing |
| BB-LOGIN-008 | AC-LOGIN-7 | P1 | Boundary | Username with leading/trailing spaces authenticates after trim |
| BB-LOGIN-009 | AC-LOGIN-8, AC-LOGIN-19 | P0 | Error | Wrong password returns generic invalid-credential behavior |
| BB-LOGIN-010 | AC-LOGIN-8, AC-LOGIN-19 | P0 | Error | Unknown username returns same generic invalid-credential behavior |
| BB-LOGIN-011 | AC-LOGIN-8, AC-LOGIN-19 | P0 | Error | Existing and unknown users are indistinguishable on failure |
| BB-LOGIN-012 | AC-LOGIN-9, AC-LOGIN-19 | P0 | Error | Inactive account is rejected safely and receives no token |
| BB-LOGIN-013 | AC-LOGIN-10 | P1 | Boundary | Repeated wrong passwords remain generic and safe |
| BB-LOGIN-014 | AC-LOGIN-10 | P0 | Error | Repeated failures do not expose account state |
| BB-LOGIN-015 | AC-LOGIN-10 | P0 | State | Login still succeeds normally after prior failures |
| BB-LOGIN-016 | AC-LOGIN-11 | P0 | State | Successful login revokes prior active token sessions |
| BB-LOGIN-017 | AC-LOGIN-14 | P1 | Permission | Authenticated user opening login is redirected by role |
| BB-LOGIN-018 | AC-LOGIN-15 | P0 | Permission | Missing bearer token is rejected and FE becomes anonymous |
| BB-LOGIN-019 | AC-LOGIN-15 | P0 | Permission | Malformed or tampered bearer token is rejected |
| BB-LOGIN-020 | AC-LOGIN-15 | P0 | Permission | Expired bearer token is rejected |
| BB-LOGIN-021 | AC-LOGIN-15, AC-LOGIN-17 | P0 | State | Revoked token cannot be reused after logout |
| BB-LOGIN-022 | AC-LOGIN-16 | P0 | External IF | `/api/v1/auth/me` and `/api/v1/me` return compatible payloads |
| BB-LOGIN-023 | AC-LOGIN-17, AC-LOGIN-18 | P0 | State | Logout revokes server state and clears FE local auth state |
| BB-LOGIN-024 | AC-LOGIN-18 | P1 | External IF | Logout API failure still clears FE local auth state |
| BB-LOGIN-025 | AC-LOGIN-19 | P0 | Error | Auth responses never expose password/hash/token/stack/SQL details |
| BB-LOGIN-026 | AC-LOGIN-20 | P0 | Normal | Out-of-scope auth features are not active login paths |
| BB-LOGIN-027 | AC-LOGIN-6, AC-LOGIN-7 | P1 | Boundary | Username length 100 is accepted when otherwise valid |
| BB-LOGIN-028 | AC-LOGIN-6, AC-LOGIN-7 | P1 | Boundary | Username length 101 is rejected safely |
| BB-LOGIN-029 | AC-LOGIN-3 | P1 | Boundary | Password length over schema limit is rejected safely |
| BB-LOGIN-030 | AC-LOGIN-19 | P1 | External IF | Backend/network failure shows generic safe error and no stale auth |
| BB-LOGIN-031 | AC-LOGIN-19 | P1 | Log/audit | Login/logout observable logs and trace IDs contain no secrets |
| BB-LOGIN-032 | AC-LOGIN-20 | P2 | Operation | Helpdesk unlock, cleanup, audit, and refresh-token policies are reviewed as open decisions |

## Test Cases

### BB-LOGIN-001: Anonymous user can open login page and see required controls

| item | content |
|---|---|
| Related AC | AC-LOGIN-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Anonymous state; no token in browser storage |
| Input | Login page URL `/:lang/login` |
| Steps | Open the login page |
| Expected Result | Username input, password input, password visibility control, and login button are visible; no redirect loop |
| Note | Evidence: FE/E2E/manual. Status: Planned |

### BB-LOGIN-002: Empty username blocks login submission

| item | content |
|---|---|
| Related AC | AC-LOGIN-2 |
| Priority | P0 |
| Category | Error |
| Preconditions | Anonymous state |
| Input | Password only, empty username |
| Steps | Enter password only and attempt submit |
| Expected Result | Login request is not sent, or BE returns safe validation error if reached |
| Note | Evidence: FE/manual/network observation. Status: Planned |

### BB-LOGIN-003: Empty password blocks login submission

| item | content |
|---|---|
| Related AC | AC-LOGIN-3 |
| Priority | P0 |
| Category | Error |
| Preconditions | Anonymous state |
| Input | Username only, empty password |
| Steps | Enter username only and attempt submit |
| Expected Result | Login request is not sent, or BE returns safe validation error if reached |
| Note | Evidence: FE/manual/network observation. Status: Planned |

### BB-LOGIN-004: Password is masked by default and can be toggled

| item | content |
|---|---|
| Related AC | AC-LOGIN-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Anonymous state |
| Input | Password value |
| Steps | Type password, click show/hide control |
| Expected Result | Password is masked by default; toggle changes visibility and accessible label |
| Note | Evidence: FE/E2E/manual. Status: Planned |

### BB-LOGIN-005: Pending login prevents duplicate submit

| item | content |
|---|---|
| Related AC | AC-LOGIN-5 |
| Priority | P0 |
| Category | State |
| Preconditions | Valid input; delayed login response |
| Input | Valid credentials, delayed response |
| Steps | Submit repeatedly by click/Enter while pending |
| Expected Result | Only one in-flight login is observable; submit remains disabled while pending |
| Note | Evidence: FE/E2E/manual. Status: Planned |

### BB-LOGIN-006: Active admin login succeeds and redirects to admin

| item | content |
|---|---|
| Related AC | AC-LOGIN-6, AC-LOGIN-12 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Active admin test account |
| Input | Valid admin credentials |
| Steps | Login with valid admin credentials |
| Expected Result | 200 response, token response, safe user summary, FE route `/:lang/admin` |
| Note | Evidence: BE IT/E2E/manual. Status: Planned |

### BB-LOGIN-007: Active non-admin login succeeds and redirects to root landing

| item | content |
|---|---|
| Related AC | AC-LOGIN-6, AC-LOGIN-13 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Active non-admin test account |
| Input | Valid non-admin credentials |
| Steps | Login with valid non-admin credentials |
| Expected Result | 200 response, token response, safe user summary, FE route `/:lang/` |
| Note | Evidence: BE IT/E2E/manual. Status: Planned |

### BB-LOGIN-008: Username with leading/trailing spaces authenticates after trim

| item | content |
|---|---|
| Related AC | AC-LOGIN-7 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Active test account exists |
| Input | Username with leading/trailing spaces |
| Steps | Login with username containing leading/trailing spaces |
| Expected Result | Authentication behaves as trimmed username |
| Note | Evidence: BE/API/manual. Status: Planned |

### BB-LOGIN-009: Wrong password returns generic invalid-credential behavior

| item | content |
|---|---|
| Related AC | AC-LOGIN-8, AC-LOGIN-19 |
| Priority | P0 |
| Category | Error |
| Preconditions | Existing active test user |
| Input | Correct username, wrong password |
| Steps | Login with wrong password |
| Expected Result | 401 generic invalid-credential behavior; no token; no account detail |
| Note | Evidence: BE/API/E2E/manual. Status: Planned |

### BB-LOGIN-010: Unknown username returns same generic invalid-credential behavior

| item | content |
|---|---|
| Related AC | AC-LOGIN-8, AC-LOGIN-19 |
| Priority | P0 |
| Category | Error |
| Preconditions | Unknown username |
| Input | Unknown username, any password |
| Steps | Login with unknown username and any password |
| Expected Result | Same generic invalid-credential behavior as wrong password; no token |
| Note | Evidence: BE/API/E2E/manual. Status: Planned |

### BB-LOGIN-011: Existing and unknown users are indistinguishable on failure

| item | content |
|---|---|
| Related AC | AC-LOGIN-8, AC-LOGIN-19 |
| Priority | P0 |
| Category | Error |
| Preconditions | One existing user and one unknown username |
| Input | One existing user, one unknown username |
| Steps | Compare failure UI/status/payload/timing envelope at black-box level |
| Expected Result | No account-existence hint in visible error, code, route, or response body |
| Note | Evidence: Security/BB review. Status: Planned |

### BB-LOGIN-012: Inactive account is rejected safely and receives no token

| item | content |
|---|---|
| Related AC | AC-LOGIN-9, AC-LOGIN-19 |
| Priority | P0 |
| Category | Error |
| Preconditions | Inactive test account |
| Input | Correct password for inactive account |
| Steps | Login with correct inactive account password |
| Expected Result | 401 safe unavailable-account behavior; no access/refresh token returned |
| Note | Evidence: BE/API/manual. Status: Planned |

### BB-LOGIN-013: Repeated wrong passwords remain generic and safe

| item | content |
|---|---|
| Related AC | AC-LOGIN-10 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Active test account |
| Input | Repeated wrong passwords |
| Steps | Perform repeated failed logins |
| Expected Result | Failure responses remain generic and do not create a special state |
| Note | Evidence: BE/API/manual. Status: Planned |

### BB-LOGIN-014: Repeated failures do not expose account state

| item | content |
|---|---|
| Related AC | AC-LOGIN-10 |
| Priority | P0 |
| Category | Error |
| Preconditions | Active test account |
| Input | Repeated wrong-password attempts |
| Steps | Compare repeated wrong-password attempts |
| Expected Result | Failure responses remain indistinguishable and safe |
| Note | Evidence: BE/API/manual. Status: Planned |

### BB-LOGIN-015: Login still succeeds normally after prior failures

| item | content |
|---|---|
| Related AC | AC-LOGIN-10 |
| Priority | P0 |
| Category | State |
| Preconditions | Active test account with prior failures |
| Input | Valid credentials after prior failures |
| Steps | Login successfully |
| Expected Result | Login succeeds normally and revokes/replaces prior active session |
| Note | Evidence: BE/API/manual. Status: Planned |

### BB-LOGIN-016: Successful login revokes prior active token sessions

| item | content |
|---|---|
| Related AC | AC-LOGIN-11 |
| Priority | P0 |
| Category | State |
| Preconditions | Test account with prior active session |
| Input | Valid credentials with existing session |
| Steps | Login successfully |
| Expected Result | Prior active token session is revoked/replaced |
| Note | Evidence: BE/API/manual. Status: Planned |

### BB-LOGIN-017: Authenticated user opening login is redirected by role

| item | content |
|---|---|
| Related AC | AC-LOGIN-14 |
| Priority | P1 |
| Category | Permission |
| Preconditions | Browser has valid authenticated current-user state |
| Input | Authenticated session, login page URL |
| Steps | Open `/:lang/login` |
| Expected Result | User is redirected away by role: admin to admin, non-admin to root landing |
| Note | Evidence: FE/E2E/manual. Status: Planned |

### BB-LOGIN-018: Missing bearer token is rejected and FE becomes anonymous

| item | content |
|---|---|
| Related AC | AC-LOGIN-15 |
| Priority | P0 |
| Category | Permission |
| Preconditions | No bearer token |
| Input | Request with no bearer token |
| Steps | Call `/api/v1/auth/me` or protected API |
| Expected Result | 401; FE treats user as anonymous and does not loop |
| Note | Evidence: BE IT/FE/manual. Status: Planned |

### BB-LOGIN-019: Malformed or tampered bearer token is rejected

| item | content |
|---|---|
| Related AC | AC-LOGIN-15 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Malformed/tampered token |
| Input | Malformed/tampered token |
| Steps | Call current-user/protected API with token |
| Expected Result | 401; token is rejected; FE becomes anonymous |
| Note | Evidence: BE unit/API/manual. Status: Planned |

### BB-LOGIN-020: Expired bearer token is rejected

| item | content |
|---|---|
| Related AC | AC-LOGIN-15 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Expired token |
| Input | Expired token |
| Steps | Call current-user/protected API with expired token |
| Expected Result | 401; FE becomes anonymous/login required |
| Note | Evidence: BE unit/API/manual. Status: Planned |

### BB-LOGIN-021: Revoked token cannot be reused after logout

| item | content |
|---|---|
| Related AC | AC-LOGIN-15, AC-LOGIN-17 |
| Priority | P0 |
| Category | State |
| Preconditions | Login succeeded, then logout revoked session |
| Input | Old access token after logout |
| Steps | Reuse old access token against current-user/protected API |
| Expected Result | 401 or equivalent unauthorized behavior; token cannot authenticate |
| Note | Evidence: API/manual. Status: Planned |

### BB-LOGIN-022: `/api/v1/auth/me` and `/api/v1/me` return compatible payloads

| item | content |
|---|---|
| Related AC | AC-LOGIN-16 |
| Priority | P0 |
| Category | External IF |
| Preconditions | Valid token |
| Input | Valid token |
| Steps | Call `/api/v1/auth/me` and `/api/v1/me` |
| Expected Result | Both return compatible current-user payload: username, displayName, email, role, accessScopes |
| Note | Evidence: BE IT/API/manual. Status: Planned |

### BB-LOGIN-023: Logout revokes server state and clears FE local auth state

| item | content |
|---|---|
| Related AC | AC-LOGIN-17, AC-LOGIN-18 |
| Priority | P0 |
| Category | State |
| Preconditions | Logged-in state |
| Input | Logged-in session |
| Steps | Trigger logout |
| Expected Result | Backend returns 204 when reachable; server session revoked; FE clears tokens/cache and returns to login/anonymous |
| Note | Evidence: FE/BE IT/E2E/manual. Status: Planned |

### BB-LOGIN-024: Logout API failure still clears FE local auth state

| item | content |
|---|---|
| Related AC | AC-LOGIN-18 |
| Priority | P1 |
| Category | External IF |
| Preconditions | Logged-in FE state; backend logout fails/network error |
| Input | Logged-in FE state, failing backend logout |
| Steps | Trigger logout |
| Expected Result | FE still clears local auth state and navigates to login/anonymous state |
| Note | Evidence: FE/manual. Status: Planned |

### BB-LOGIN-025: Auth responses never expose password/hash/token/stack/SQL details

| item | content |
|---|---|
| Related AC | AC-LOGIN-19 |
| Priority | P0 |
| Category | Error |
| Preconditions | Any auth failure/success |
| Input | Auth failure/success responses |
| Steps | Inspect UI, API body, headers, visible logs allowed for test |
| Expected Result | No password, hash, raw access token, raw refresh token, stack trace, SQL detail, or secret is exposed |
| Note | Evidence: Security/BB review. Status: Planned |

### BB-LOGIN-026: Out-of-scope auth features are not active login paths

| item | content |
|---|---|
| Related AC | AC-LOGIN-20 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Anonymous login page |
| Input | Anonymous login page |
| Steps | Inspect visible auth options and network calls |
| Expected Result | OAuth/SSO/MFA/register/password reset/Remember Me/refresh flow are not active login paths |
| Note | Evidence: FE/manual/source-assisted review. Status: Planned |

### BB-LOGIN-027: Username length 100 is accepted when otherwise valid

| item | content |
|---|---|
| Related AC | AC-LOGIN-6, AC-LOGIN-7 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Test account with 100-character username, if supported by fixture |
| Input | 100-character username |
| Steps | Submit valid credentials |
| Expected Result | Request is accepted by validation and then follows normal account outcome |
| Note | Evidence: API/manual. Status: Planned |

### BB-LOGIN-028: Username length 101 is rejected safely

| item | content |
|---|---|
| Related AC | AC-LOGIN-6, AC-LOGIN-7 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Username string length 101 |
| Input | 101-character username |
| Steps | Submit login request |
| Expected Result | 400 validation or safe FE block; auth service is not observably executed |
| Note | Evidence: BE IT/API/manual. Status: Planned |

### BB-LOGIN-029: Password length over schema limit is rejected safely

| item | content |
|---|---|
| Related AC | AC-LOGIN-3 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Password string length over 256 |
| Input | Password longer than schema limit (>256 chars) |
| Steps | Submit login request |
| Expected Result | 400 validation or safe FE block; no secret echo |
| Note | Evidence: API/manual. Status: Planned |

### BB-LOGIN-030: Backend/network failure shows generic safe error and no stale auth

| item | content |
|---|---|
| Related AC | AC-LOGIN-19 |
| Priority | P1 |
| Category | External IF |
| Preconditions | Backend returns 500 or network unavailable |
| Input | Backend 500 or network failure |
| Steps | Submit login |
| Expected Result | Generic safe error; no stale authenticated state or token storage |
| Note | Evidence: FE/API/manual. Status: Planned |

### BB-LOGIN-031: Login/logout observable logs and trace IDs contain no secrets

| item | content |
|---|---|
| Related AC | AC-LOGIN-19 |
| Priority | P1 |
| Category | Log/audit |
| Preconditions | Test logging/trace access available |
| Input | Login success, invalid credential, logout events |
| Steps | Trigger login success, invalid credential, logout |
| Expected Result | Logs/trace evidence contain traceable events without passwords/tokens/hashes |
| Note | Evidence: Ops/security review. Status: Planned |

### BB-LOGIN-032: Helpdesk unlock, cleanup, audit, and refresh-token policies are reviewed as open decisions

| item | content |
|---|---|
| Related AC | AC-LOGIN-20 |
| Priority | P2 |
| Category | Operation |
| Preconditions | Product/security/ops review session |
| Input | Refresh-token/token storage/audit/cleanup/unlock/non-admin route policy items |
| Steps | Review refresh-token, token storage, audit, cleanup, unlock, non-admin route decisions |
| Expected Result | Open decisions are accepted, rejected, or ticketed before release |
| Note | Evidence: Human review. Status: Planned |

| AC ID | Black-box cases | coverage note |
|---|---|---|
| AC-LOGIN-1 | BB-LOGIN-001 | Login screen visibility. |
| AC-LOGIN-2 | BB-LOGIN-002 | Empty username. |
| AC-LOGIN-3 | BB-LOGIN-003, BB-LOGIN-029 | Empty/invalid password. |
| AC-LOGIN-4 | BB-LOGIN-004 | Mask/toggle. |
| AC-LOGIN-5 | BB-LOGIN-005 | Duplicate submit. |
| AC-LOGIN-6 | BB-LOGIN-006, BB-LOGIN-007, BB-LOGIN-027, BB-LOGIN-028 | Success response and validation boundary. |
| AC-LOGIN-7 | BB-LOGIN-008, BB-LOGIN-027, BB-LOGIN-028 | Username trim and length. |
| AC-LOGIN-8 | BB-LOGIN-009, BB-LOGIN-010, BB-LOGIN-011 | Invalid credential/no enumeration. |
| AC-LOGIN-9 | BB-LOGIN-012 | Inactive account. |
| AC-LOGIN-10 | BB-LOGIN-013, BB-LOGIN-014, BB-LOGIN-015 | Repeated failures stay generic and non-locking. |
| AC-LOGIN-11 | BB-LOGIN-016 | Successful login revokes prior session. |
| AC-LOGIN-12 | BB-LOGIN-006 | Admin redirect. |
| AC-LOGIN-13 | BB-LOGIN-007 | Non-admin redirect. |
| AC-LOGIN-14 | BB-LOGIN-017 | Authenticated login redirect. |
| AC-LOGIN-15 | BB-LOGIN-018, BB-LOGIN-019, BB-LOGIN-020, BB-LOGIN-021 | Missing/invalid/expired/revoked token. |
| AC-LOGIN-16 | BB-LOGIN-022 | Current-user compatibility. |
| AC-LOGIN-17 | BB-LOGIN-021, BB-LOGIN-023 | Logout revoke and 204. |
| AC-LOGIN-18 | BB-LOGIN-023, BB-LOGIN-024 | FE local clear. |
| AC-LOGIN-19 | BB-LOGIN-009, BB-LOGIN-010, BB-LOGIN-011, BB-LOGIN-025, BB-LOGIN-030, BB-LOGIN-031 | Secret/noise leakage and safe errors. |
| AC-LOGIN-20 | BB-LOGIN-026, BB-LOGIN-032 | Out-of-scope features and open policy decisions. |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [x] Character type input
- [x] Numeric input
- [x] Full-width number
- [x] Empty/null
- [x] Duplicate
- [x] Non-existing ID
- [x] Deleted data
- [x] External IF failure
- [x] Timeout/retry
- [x] Double submit
- [x] Back/reload
- [x] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output
