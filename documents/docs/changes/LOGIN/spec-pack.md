# Spec Pack

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

## 1. Context / Purpose

EDCAP needs a standard internal login flow before users access protected screens and APIs. The LOGIN MVP uses internal `username/password` authentication, bearer-token protected APIs, safe generic errors, current-user lookup, role-aware redirect, and logout.

This spec supersedes older OAuth/session-cookie assumptions for LOGIN. Older architecture and standards documents are useful for project context, but current LOGIN code and this pack are the source of truth for this ticket.

## 2. Scope

### 2.1. Within range

- Login screen with `username`, `password`, password masking, password visibility toggle, and primary submit action.
- Client-side required-field behavior.
- `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`, and compatibility `GET /api/v1/me`.
- Authentication against `tbl_auth_user_account.username`.
- Password verification through `password_hash` and `password_algo`; current known algorithm is bcrypt.
- Active-account check via `is_active`.
- Safe errors for invalid credentials, inactive account, missing/expired token, and server failure.
- Bearer access token issuance and protected API authentication.
- Token-session persistence/revocation using hashed access/refresh token values.
- Admin redirect to `/:lang/admin`; non-admin redirect to `/:lang/` unless product changes it.

### 2.2. Out of range

- Google login, SSO, OAuth/OIDC, social login.
- Registration, invitation, profile management, role/permission management UI.
- Self-service password reset or forgot-password flow.
- MFA.
- Remember-device behavior and active Remember Me behavior.
- Active refresh-token rotation flow.
- Dedicated `/home` route unless confirmed.
- Full audit logging beyond current attempt/session persistence unless confirmed.

## 3. Terminology
| terms | meaning | notes |
|---|---|---|
| Username | Internal login identifier. | Trimmed before backend lookup; case-sensitivity is open. |
| Password | Secret credential used for authentication. | Masked by default; never logged or returned. |
| Active account | Account with `is_active = true`. | Only active accounts can log in. |
| Access token | Bearer JWT used on protected API calls. | Default TTL is 1 hour. |
| Refresh token | Random token currently returned and stored hashed. | Refresh flow is not active unless confirmed. |
| Token session | Server-side record in `tbl_auth_token_session`. | Used to verify active tokens and revoke sessions. |
| Current user | Identity returned by `/api/v1/auth/me` or `/api/v1/me`. | Includes username, displayName, email, role, accessScopes. |

## 4. As-Is

- Requirement and wireframe define username/password login.
- FE already contains username/password login page, bearer token storage, current-user hook, and logout behavior.
- BE already contains login/logout/current-user endpoints, stateless bearer-token security, bcrypt verification, and token-session persistence.
- Some architecture/standards docs still describe older Google OAuth/session-cookie assumptions.
- Human review verdict is not supplied.

## 5. To-Be

- Anonymous users can view login and submit valid internal credentials.
- FE blocks empty username/password before calling the API.
- BE validates request shape, trims username, verifies account/password/active status, and returns safe errors.
- Successful login returns access token, refresh token, token type, TTL seconds, safe user summary, and redirect target.
- Protected APIs require a valid bearer token whose hash exists in an active token session.
- Logout revokes server token sessions when possible and always clears local FE auth state.
- Remaining product/security decisions stay in Open Issues.

## 6. Detailed specification

### 6.1. Business Rules

- `username` and `password` are required.
- Backend trims username before account lookup.
- Account source is `tbl_auth_user_account.username`.
- Only active accounts can log in.
- Password verification supports bcrypt when `password_algo` is blank or `bcrypt`; unsupported algorithms fail safely.
- Invalid username and wrong password must be indistinguishable to users.
- Successful login revokes previous active token sessions for the username.
- Protected APIs require valid JWT and active token-session hash.
- OAuth/SSO/MFA/registration/password reset are not active LOGIN paths.

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| `username` | string | Yes | `@NotBlank`, max 100 | Trim before lookup. |
| `password` | string | Yes | `@NotBlank`, max 256 | Never log or return. |
| Bearer token | string | For protected APIs | Valid JWT, not expired, active session hash | Attached by FE API helper. |
| Auth config | env/config | Yes | Runtime policy values | TTL and other auth policy flags. |

### 6.3. Output
| item | type | format | notes |
|---|---|---|---|
| `accessToken` | string | JWT bearer token | Login success only; never log. |
| `refreshToken` | string | random token | Current implementation returns it; policy is open. |
| `tokenType` | string | `Bearer` | Fixed current value. |
| `expiresInSeconds` | number | default `3600` | Derived from `app.jwt.expiration-hours`. |
| `user` | object | AuthCurrentUserDto | username, displayName, email, role, accessScopes. |
| `redirectTo` | string | `/admin` or `/` | FE prefixes `/:lang`. |
| Error response | object | `timestamp`, `status`, `error`, `message`, `traceId` | Safe `ErrorResponse`; no secrets. |

### 6.4. Error / Exception
| case | expected behavior | message/code | notes |
|---|---|---|---|
| Empty username/password | FE blocks or BE validates | `VALIDATION_ERROR` if BE reached | No auth service call for invalid request body. |
| Unknown username | 401 safe rejection | `INVALID_CREDENTIALS` | Same as wrong password. |
| Wrong password | 401 safe rejection | `INVALID_CREDENTIALS` | No account-existence leak. |
| Inactive account | 401 safe rejection | `ACCOUNT_TEMPORARILY_UNAVAILABLE` | No token issued. |
| Missing/expired/revoked token | 401 | Unauthorized/security response | FE treats current user as anonymous. |
| Server failure | 500 | `INTERNAL_ERROR` | Safe generic UI error. |

### 6.5. Boundary Value
| item | min | max | special cases | expected |
|---|---|---|---|---|
| Username length | 1 trimmed char | 100 chars | 101 chars | 100 accepted if valid; 101 rejected by validation. |
| Password length | 1 char | 256 chars | empty or too long | Empty/too long rejected safely. |
| Token age | 0 seconds | configured TTL | at/past expiry | Expired token rejected. |
| Submit attempts | 1 in-flight | 1 in-flight | rapid click/Enter | Duplicate submit blocked. |

### 6.6. Non-functional
| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Login/current-user checks responsive. | Normal API latency. | Smoke/perf sanity if needed. | bcrypt cost may dominate. |
| Security | No secret leakage or account enumeration. | Password/hash/token never exposed. | Review/tests. | Release blocker. |
| Availability / Reliability | 401/auth failures do not create route loops. | FE becomes anonymous safely. | FE/E2E tests. | |
| Maintainability | Auth code follows FE and BE boundaries. | `useAuth`/`lib/api`, controller -> service -> port. | Review/build/tests. | |
| Observability / Logging | Traceable without secrets. | `traceId` preserved. | Error/log review. | Formal audit open. |
| Compatibility | `/api/v1/me` remains compatible. | Same current-user shape. | Integration tests. | |

## 7. Acceptance Criteria
| ACID | description | testable? | notes |
|---|---|---|---|
| AC-LOGIN-1 | Anonymous user can open `/:lang/login` and see username, password, password toggle, and login button. | Yes | FE/E2E. |
| AC-LOGIN-2 | Empty username prevents login API submission. | Yes | FE. |
| AC-LOGIN-3 | Empty password prevents login API submission. | Yes | FE. |
| AC-LOGIN-4 | Password is masked by default. | Yes | FE/BB. |
| AC-LOGIN-5 | Pending login disables duplicate submit. | Yes | FE/BB. |
| AC-LOGIN-6 | Valid active credentials return token response and user summary. | Yes | BE/IT/E2E. |
| AC-LOGIN-7 | Backend trims username before lookup. | Yes | BE. |
| AC-LOGIN-8 | Unknown username and wrong password show generic invalid-credential behavior. | Yes | FE/BE/BB. |
| AC-LOGIN-9 | Inactive account is rejected safely with no token. | Yes | BE/IT. |
| AC-LOGIN-10 | Inactive account is rejected safely with no token issued. | Yes | BE/BB. |
| AC-LOGIN-11 | Successful login revokes previous active token sessions. | Yes | BE. |
| AC-LOGIN-12 | Admin login redirects to `/:lang/admin`. | Yes | FE/E2E. |
| AC-LOGIN-13 | Non-admin login redirects to `/:lang/`. | Yes | FE/E2E. |
| AC-LOGIN-14 | Authenticated user opening login is redirected by role. | Yes | FE. |
| AC-LOGIN-15 | Missing/invalid/expired/revoked token is rejected and FE becomes anonymous. | Yes | FE/BE/IT. |
| AC-LOGIN-16 | `/api/v1/auth/me` and `/api/v1/me` return compatible current-user payloads. | Yes | IT/contract. |
| AC-LOGIN-17 | Logout revokes server token sessions when principal exists and returns 204. | Yes | BE/IT. |
| AC-LOGIN-18 | FE logout clears local access/refresh tokens and auth query state even if API fails. | Yes | FE. |
| AC-LOGIN-19 | Auth errors never expose passwords, hashes, tokens, stack traces, SQL details, or account-existence hints. | Yes | Security review/BB. |
| AC-LOGIN-20 | Out-of-scope auth features are not active LOGIN paths. | Yes | FE/BB. |

## 8. Examples

### 8.1. Normal Case

- Active admin logs in -> 200 response -> FE stores tokens -> redirects to `/:lang/admin`.
- Active non-admin logs in -> 200 response -> FE stores tokens -> redirects to `/:lang/`.
- Valid active bearer token calls `/api/v1/auth/me` -> receives current-user payload.
- Logout with principal -> server revokes sessions -> FE clears local auth state.

### 8.2. Error Case

- Empty username/password -> no login request or safe validation response.
- Unknown username/wrong password -> same generic invalid-credential message.
- Inactive account -> safe unavailable-account message.
- Expired/revoked token -> 401 and FE anonymous.

### 8.3. Boundary Case

- `" alice "` trims to `alice`.
- 100-character username is accepted if otherwise valid; 101-character username is rejected.
- Repeated failed attempts remain generic and do not create a lock state.
- Token at/past expiry is rejected.
- Rapid submit creates only one in-flight request.

## 9. Source Availability Summary

Available: requirement, wireframe, FE source, BE source, DB migrations, auth tests, architecture and standards docs. Not available: `.claude/rules`, meeting memo, final human review, production logs/secrets. Stale/conflicting sources: architecture/standards docs with OAuth/session text. Drift risk exists between root and FE LOGIN doc trees.

## 10. Complexity Classification

```text
- Complexity: Critical
- System shape: FE+BE / DB / Security
- Primary risk: Contract / DB / Security / Operation / Test / Translation
- Review mode: Heavy
- Required options: Source Analysis / FE-BE Contract / DB Migration / Full Security
```

## 11. FE/BE Contract Impact

- FE depends on `accessToken`, `refreshToken`, `tokenType`, `expiresInSeconds`, `user`, and `redirectTo`.
- Canonical current-user endpoint is `/api/v1/auth/me`; `/api/v1/me` remains compatibility.
- FE expects `ErrorResponse.error` codes such as `INVALID_CREDENTIALS`, `ACCOUNT_TEMPORARILY_UNAVAILABLE`, and `VALIDATION_ERROR`.
- BE returns `redirectTo` without language prefix; FE adds `/:lang`.

## 12. DB/Migration Impact

- Uses `tbl_auth_user_account` and `tbl_auth_token_session`.
- No existing migration should be edited in place.
- Future refresh-token, username normalization, audit logging, cleanup/unlock changes may need additive migrations.

## 13. Security/Privacy Impact

- High impact due to password handling, bearer tokens, session revocation, account enumeration, and current-user data.
- Email is currently in auth responses/JWT payloads; privacy approval is open.
- Access/refresh token storage in localStorage needs security review.
- Refresh token is issued/stored despite disabled refresh-flow flags; architecture/security decision required.

## 14. Operation/Maintenance Impact

- Runtime config must provide secure JWT secret and auth policy values.
- Operators need trace IDs without secrets.
- Token-session cleanup and helpdesk unlock policy are not yet specified.
- Stale OAuth/session docs should be updated or marked historical later.

## 15. Test Strategy Summary

Use FE unit/component tests, BE auth/token unit tests, BE API integration tests, Playwright E2E, and black-box security/boundary cases. Record actual commands/results in `test-results.md` in later phases.

## 16. Human Decision Required
| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| HD-LOGIN-001 | Keep current refresh-token field/session storage in MVP or defer/remove? | Contract/security ambiguity. | Product/Architecture/Security | Open |
| HD-LOGIN-002 | Keep non-admin landing `/:lang/` or add `/:lang/home`? | Route/test impact. | Product/UX | Open |
| HD-LOGIN-003 | Permit `email` in auth responses and JWT payloads? | Privacy/API contract. | Product/Security | Open |
| HD-LOGIN-004 | Implement `returnUrl` in MVP? | UX and open-redirect risk. | Product/Security | Open |
| HD-LOGIN-005 | Username matching case-sensitive or case-insensitive? | DB/query/user support. | Product/BE | Open |
| HD-LOGIN-006 | Is formal login audit logging required? | Compliance/ops design. | Product/Security/Ops | Open |
| HD-LOGIN-007 | Is localStorage acceptable for token storage in production? | XSS/token theft risk. | Security/FE | Open |

## 17. Assumptions and Inference Log
| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-LOGIN-001 | Username/password is primary MVP login. | Requirement/current source. | Low | No |
| A-LOGIN-002 | Bearer JWT plus token-session persistence is current auth strategy. | BE source. | Low | No |
| A-LOGIN-003 | `/api/v1/auth/me` canonical, `/api/v1/me` compatibility. | FE/BE source. | Low | No |
| A-LOGIN-004 | Non-admin route `/:lang/` is acceptable for MVP. | Current source/tests. | Medium | Yes |
| A-LOGIN-005 | Refresh token is current response field but active refresh flow is out. | DTO/config. | High | Yes |
| A-LOGIN-006 | Email exposure remains acceptable until policy changes. | Current DTO/token. | Medium | Yes |

## 18. Open Issues
| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-LOGIN-001 | Refresh token returned/stored while refresh flow disabled. | Security/contract ambiguity. | Product/Architecture/Security | Open |
| OI-LOGIN-002 | Final non-admin landing route not confirmed. | FE routing/E2E. | Product/UX | Open |
| OI-LOGIN-003 | Email exposure not confirmed. | Privacy/API. | Product/Security | Open |
| OI-LOGIN-004 | `returnUrl` behavior and allowlist not confirmed. | UX/security. | Product/Security | Open |
| OI-LOGIN-005 | Username case-sensitivity not confirmed. | DB/query behavior. | Product/BE | Open |
| OI-LOGIN-006 | Audit logging requirement not confirmed. | Compliance/ops. | Product/Security/Ops | Open |
| OI-LOGIN-007 | localStorage token persistence needs security decision. | Production security. | Security/FE | Open |
| OI-LOGIN-008 | Root and FE LOGIN docs can drift. | Future stale source risk. | Documentation owner | Open |
| Phase 3 readiness | Conditionally yes for current MVP only; no expansion into open issues without decisions. | Implementation gating. | Product/Architecture | Open |
