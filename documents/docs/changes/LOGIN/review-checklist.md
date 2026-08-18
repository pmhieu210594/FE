# Review Checklist

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

## 1. Specification/AC Matching
| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-LOGIN-1 | Anonymous user can open `/:lang/login` and see username, password, password toggle, and login button. | Blocker | PASS |
| AC-LOGIN-2 | Empty username prevents login API submission. | Blocker | PASS |
| AC-LOGIN-3 | Empty password prevents login API submission. | Blocker | PASS |
| AC-LOGIN-4 | Password is masked by default. | Blocker | PASS |
| AC-LOGIN-5 | Pending login disables duplicate submit. | Major | PASS |
| AC-LOGIN-6 | Valid active credentials return `accessToken`, `refreshToken`, `tokenType`, `expiresInSeconds`, `user`, and `redirectTo`. | Blocker | PASS |
| AC-LOGIN-7 | Backend trims username before lookup. | Major | PASS |
| AC-LOGIN-8 | Unknown username and wrong password show indistinguishable generic invalid-credential behavior. | Blocker | PASS |
| AC-LOGIN-9 | Inactive account is rejected safely with no token issued. | Blocker | PASS |
| AC-LOGIN-10 | Inactive account is rejected safely with no token issued. | Blocker | PASS |
| AC-LOGIN-11 | Successful login revokes previous active token sessions. | Major | PASS |
| AC-LOGIN-12 | Admin login redirects to `/:lang/admin`. | Major | PASS |
| AC-LOGIN-13 | Non-admin login redirects to `/:lang/`. | Major | PASS |
| AC-LOGIN-14 | Authenticated user opening login is redirected away by role. | Major | PASS |
| AC-LOGIN-15 | Missing, invalid, expired, or revoked token is rejected and FE becomes anonymous. | Blocker | PASS |
| AC-LOGIN-16 | `/api/v1/auth/me` and `/api/v1/me` return compatible current-user payloads. | Blocker | PASS |
| AC-LOGIN-17 | Logout revokes server token sessions when principal exists and returns 204. | Blocker | PASS |
| AC-LOGIN-18 | FE logout clears local access/refresh tokens and auth query state even if API fails. | Blocker | PASS |
| AC-LOGIN-19 | Auth errors never expose passwords, hashes, tokens, stack traces, SQL details, or account-existence hints. | Blocker | REVIEW_REQUIRED |
| AC-LOGIN-20 | OAuth/SSO/social/MFA/register/password-reset/active Remember Me/refresh flow are not active LOGIN paths. | Blocker | PASS |

## 2. General System Review

### 2.1. Number/Input Check
- [X] Clear Numeric Validation: `APP_JWT_EXPIRATION_HOURS` is positive/configured safely.
- [X] Full-width Numbers are Processed or Clearly Not Supported: numeric auth policy is config-only, not user input.
- [X] Half-width/Full-width Mixed Numbers are Considered: not applicable to login form except username as opaque string.
- [X] Empty String/Null are Processed: username, password, bearer token, and auth principal null cases are handled safely.
- [X] Clear Digit/Precision/Scale/Rounding: token TTL seconds are interpreted consistently.
- [X] No Overflow/Underflow: policy values cannot cause overflow or unusable token TTL.

### 2.2. Character Type / Encoding / Locale

- [X] Full-width/half-width/emoji/surrogate pair considered for username input as string data.
- [X] Clear trim rule: backend trims username before account lookup.
- [X] Unicode normalization if needed: no normalization is added while username case/normalization is open.
- [X] No mojibake Shift-JIS/UTF-8 in docs or locale JSON files.
- [X] Japanese/Vietnamese/English messages are not misspelled and all user-visible LOGIN strings are localized.

### 2.3. Literal / Magic Number

- [X] No hard-coded business code value: token TTL, refresh-token enablement, and Remember Me enablement come from config.
- [X] Enum/constant/master used correctly: auth error codes and role values are stable and mapped intentionally.
- [X] Clear mapping display/internal value: backend error codes map to safe localized FE messages.

### 2.4. Operation / Maintainability

- [X] Sufficient logs for incident investigation without passwords, hashes, tokens, secrets, SQL details, or account-existence hints.
- [X] Correlation ID/request ID if needed: `traceId` is preserved for API errors/log lookup.
- [X] Retry/double execution considered: login double submit is prevented and logout remains safe on API failure.
- [X] Clear rollback/manual recovery: `/api/v1/me` compatibility and DB immutability are preserved.
- [X] Configuration not hard-coded: JWT secret and auth policy are runtime configuration.

## 3. FE Review

- [X] `EDCAP_FE/src/pages/LoginPage.tsx` uses username/password as the primary login path.
- [X] Login page does not expose active OAuth/SSO/register/password-reset/MFA/Remember Me/refresh-flow UI.
- [X] Login submit uses `endpoints.authLogin()` from `src/lib/api.ts`, not `C_API.Login` or `src/utils/api.ts`.
- [X] Button is disabled when username/password is missing and while mutation is pending.
- [X] Password input is masked by default and visibility toggle remains accessible.
- [X] 401 auth errors are localized through safe message keys.
- [X] Success stores current auth state according to current implementation and redirects using `/:lang` + `redirectTo`.
- [X] `useAuth()` treats current-user 401 as anonymous.
- [X] `logout()` calls `authLogout()`, clears local access/refresh token state, clears `["me"]`, and redirects to login even if API fails.
- [X] `App.tsx` guards route anonymous/admin/non-admin behavior without redirect loops.
- [X] `Layout.tsx` logout uses `logout()` from `useAuth.ts`.
- [X] `public/locales/{en,vi,ja}/locale.json` contains all user-visible LOGIN strings.

## 4. BE/API Review

- [X] `POST /api/v1/auth/login` accepts only documented username/password request and validates nonblank/size constraints.
- [X] Login response matches FE/BE DTO contract, including `accessToken`, `refreshToken`, `tokenType`, `expiresInSeconds`, `user`, and `redirectTo`.
- [X] `POST /api/v1/auth/logout` returns 204 and does not expose token/session internals.
- [X] `GET /api/v1/auth/me` is canonical current-user endpoint.
- [X] `GET /api/v1/me` remains compatible with `/api/v1/auth/me`.
- [X] Protected APIs require valid JWT and active token-session hash.
- [X] `AuthController` and `MeController` delegate to application services and do not call infrastructure directly.
- [X] `GlobalExceptionHandler` maps auth failures to safe `ErrorResponse` values.
- [X] `ErrorResponse` shape remains `timestamp`, `status`, `error`, `message`, `traceId`.

## 5. DB/Migration Review

- [X] `tbl_auth_user_account` remains the source for username, hash, algorithm, active flag, and user metadata.
- [X] Password verification uses `password_hash` and `password_algo`; raw passwords are not compared in SQL.
- [X] Token-session behavior is handled safely.
- [X] `tbl_auth_token_session` supports token hashes, active-session validation, and logout revocation.
- [X] Existing V4/V5/V6 migrations are not edited in place.
- [X] Any new DB change is additive and tied to an approved human decision.
- [X] Token/session cleanup gaps are documented if not implemented.

## 6. Security/Privacy Review

- [X] Passwords, password hashes, access tokens, refresh tokens, JWT secrets, SQL details, and stack traces are never exposed.
- [X] Unknown username and wrong password are indistinguishable to users and API consumers.
- [X] Inactive accounts use safe unavailable-account behavior.
- [X] Bearer token authentication verifies JWT signature/expiry and active token-session hash.
- [X] Logout revocation behavior is verified and any limitations are documented.
- [X] Email exposure is checked against HD-LOGIN-003 and not expanded silently.
- [X] localStorage token posture is checked against HD-LOGIN-007 and not silently approved for production.
- [X] Refresh-token behavior is checked against HD-LOGIN-001 and no refresh rotation is added silently.
- [X] `returnUrl` is not implemented unless HD-LOGIN-004 is resolved.

## 7. Operation/Maintenance Review

- [X] Runtime config documents JWT secret, TTL, refresh-token flag, and Remember Me flag.
- [X] Trace IDs are available for support without secret leakage.
- [X] Server/network failure on login shows safe FE fallback and does not leave stale auth.
- [X] Token-session table growth/cleanup is documented as follow-up if not implemented.
- [X] Support behavior is documented as follow-up if not implemented.
- [X] Formal audit logging remains open unless approved.
- [X] Stale OAuth/session documentation is not treated as authoritative for LOGIN.

## 8. Test Review

- [X] FE unit tests cover login render, required fields, password mask/toggle, loading/double submit, error localization, admin/non-admin redirects, authenticated redirect, and logout local clear.
- [X] FE API/helper tests cover bearer header, token set/clear, error parsing, and 401 handling.
- [X] BE unit tests cover successful login, username trim, invalid credentials, inactive account, reset on success, token issue/parse/expiry/hash.
- [X] BE integration tests cover login validation, login success, `/api/v1/auth/me`, `/api/v1/me`, logout 204, missing/expired/revoked tokens.
- [X] E2E tests cover anonymous login, admin login, non-admin login, invalid credential, and logout if in scope.
- [X] Black-box tests cover account enumeration, secret leakage, username length boundary, network/server failure, and out-of-scope feature absence.
- [X] `test-results.md` records exact commands and results; no PASS is claimed without execution evidence.

## 9. Documentation/Traceability Review

- [X] `spec-pack.md`, `context.md`, `impact-analysis.md`, and `impl-plan.md` agree on scope and open issues.
- [X] AC mapping is present in `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `test-plan.md`, and later `self-review.md`.
- [X] Source availability and source inventory are current.
- [X] Open issues remain visible and are not implemented silently.
- [X] Template headings remain aligned with `_ticket-template`.
- [X] `.claude/rules` absence is recorded and no missing local rule is assumed.

## 10. Release/Rollback Review

- [X] `/api/v1/me` compatibility is preserved during rollout.
- [X] Rollback avoids destructive DB changes.
- [X] Existing migrations are not modified in place.
- [X] Token storage changes, if any, include browser-state cleanup/migration.
- [X] Route changes, if any, update FE route guards and E2E expectations together.
- [X] Release is blocked or accepted-risk documented for unresolved refresh-token, email exposure, token storage, audit logging, and non-admin landing decisions.

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect Report | Record Reason for Rejection |
| Accepted Risk | Accepted Risk | Record Impact/Owner/Deadline |
