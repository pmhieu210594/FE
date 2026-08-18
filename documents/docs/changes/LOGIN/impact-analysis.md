# Impact Analysis

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

## 1. Change Content

LOGIN impact scope is the internal username/password MVP described by `spec-pack.md`: login UI, FE auth state, bearer-token API helper, role-aware routing, login/logout/current-user APIs, account/password verification, token-session validation/revocation, safe errors, and related tests.

This phase is impact analysis and implementation planning only. It does not implement code. Current source already contains much of the target behavior, so the implementation plan should primarily verify, adjust, and fill gaps rather than redesign.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_FE/src/pages/LoginPage.tsx` | Login form, validation, password toggle, login mutation, error mapping, redirect. | review/modify if needed |
| `EDCAP_FE/src/hooks/useAuth.ts` | Current-user lookup, 401 anonymous handling, logout clear. | review/modify if needed |
| `EDCAP_FE/src/lib/api.ts` | Auth DTOs, bearer token header, `ApiError`, endpoint helpers. | review/modify if needed |
| `EDCAP_FE/src/App.tsx` | Login route, home gate, admin guard. | review/modify if needed |
| `EDCAP_FE/src/components/Layout.tsx` | Logout action and authenticated shell user display. | review/modify if needed |
| `EDCAP_FE/public/locales/{en,vi,ja}/locale.json` | Login/error/logout/temporary home labels. | review/modify if needed |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` | Login/logout API. | review/modify if needed |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | Canonical and compatibility current-user API. | review/modify if needed |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java` | Credential verification, active check, session creation/revoke. | review/modify if needed |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthTokenService.java` | Access token, refresh token, token hash behavior. | review/modify if needed |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilter.java` | JWT parse plus active session validation. | review/modify if needed |
| `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Public routes and protected API security. | review/modify if needed |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | Auth request/response DTOs and validation. | review/modify if needed |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Safe auth error mapping. | review/modify if needed |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Error response shape. | review/modify if needed |
| `EDCAP_BE/src/main/resources/application.yml` | Auth/JWT config defaults. | review/modify only if needed |
| Auth tests and E2E login tests | Verification for AC. | update/execute |

## 3. Indirectly Affected Files
| file | reason | risk |
|---|---|---|
| `EDCAP_FE/src/utils/variable.ts` | Holds token keys and stale `C_API.Login`. | Future implementer may use wrong endpoint. |
| `EDCAP_FE/src/router.tsx` | Legacy/secondary router setup references `KEY_TOKEN`. | Route/auth drift if active path changes. |
| `EDCAP_FE/src/services/global/*` | Legacy global auth-looking actions may exist. | Parallel auth state risk. |
| `EDCAP_FE/src/pages/HomePage.tsx` | Temporary non-admin landing. | Route may change after HD-LOGIN-002. |
| `EDCAP_FE/src/pages/AdminPage.tsx` | Admin landing after login. | Role guard/authorization expectations. |
| BE persistence ports/adapters/mappers for auth | Used by `AuthService`. | Layer or query regression risk. |
| `EDCAP_BE/src/main/resources/mapper/Auth*Mapper.xml` | Auth persistence SQL. | Query/session behavior risk. |
| Architecture/standards docs | Some stale auth content. | Future source-of-truth confusion. |

## 4. Caller / Callee
| caller | callee | impact |
|---|---|---|
| User/browser | `LoginPage` | User submits username/password and sees validation/error/redirect. |
| `LoginPage` | `endpoints.authLogin` | Sends login request and consumes token/user/redirect response. |
| `endpoints.authLogin` | `POST /api/v1/auth/login` | FE/BE login contract. |
| `AuthController.login` | `AuthService.login` | Controller delegates auth business rules. |
| `AuthService.login` | `AuthUserAccountRepositoryPort` | Account lookup by trimmed username. |
| `AuthService.login` | `AuthTokenService` | Access/refresh token issuance and hash. |
| `AuthService.login/logout` | `AuthTokenSessionRepositoryPort` | Active session save/revoke. |
| FE API helper | `GET /api/v1/auth/me` | Current-user canonical check. |
| `MeController.me` | `AuthService.currentUser` | Current-user validation and DTO conversion. |
| Protected API request | `BearerTokenAuthenticationFilter` | JWT parse and active session check. |
| `Layout` logout button | `logout()` | Logout API and local state clear. |

## 5. FE Impact

- Login page must remain username/password primary.
- FE must not call stale `/api/v1/login` or legacy `src/utils/api.ts`.
- FE stores/clears access and refresh token keys through `lib/api.ts` behavior; security posture is open for production.
- FE treats current-user 401 as anonymous.
- Route guards must support anonymous -> login, admin -> admin, non-admin -> root.
- Locale coverage is required for login labels, loading, errors, password toggle, logout, and home/admin text.

## 6. BE Impact

- BE must keep stateless bearer auth for protected APIs.
- Login verifies account, password hash/algo, active status, and session state.
- Logout revokes token sessions when principal exists.
- Current-user endpoint must remain available at `/api/v1/auth/me` and `/api/v1/me`.
- Error handler must keep safe codes and avoid secret/account-existence leaks.
- Controllers must not call infrastructure directly.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `POST /api/v1/auth/login` | `{ username, password }`; nonblank, username max 100, password max 256. | `accessToken`, `refreshToken`, `tokenType`, `expiresInSeconds`, `user`, `redirectTo`. | New/canonical for LOGIN; FE depends on current shape. |
| `POST /api/v1/auth/logout` | Bearer token optional from security perspective but principal needed for server revoke. | 204 No Content. | Yes for current implementation. |
| `GET /api/v1/auth/me` | Bearer token required for 200. | current-user payload. | Canonical. |
| `GET /api/v1/me` | Bearer token required for 200. | compatible current-user payload. | Yes; compatibility endpoint. |
| Protected APIs | `Authorization: Bearer <accessToken>`. | 401 if missing/invalid/expired/revoked. | Changes older session assumptions. |

## 8. DTO / Schema / Validation Impact

- FE `AuthLoginRequest`, `AuthLoginResponse`, and `AuthUser` must match BE DTOs.
- BE `Dtos.AuthLoginRequest` enforces nonblank and size constraints.
- BE `Dtos.AuthLoginResponse` includes `refreshToken` even though refresh flow policy is open.
- `ErrorResponse` implementation uses `timestamp`, `status`, `error`, `message`, `traceId`.
- Email is currently included in current-user payload/JWT; privacy decision remains open.
- Username case-sensitivity and normalization are open; do not change validation/query behavior until decided.

## 9. DB / Migration Impact

- Current MVP reads `tbl_auth_user_account` from V4.
- Repeated-failure lock state handling is not part of the current LOGIN implementation.
- Current token-session validation/revocation uses `tbl_auth_token_session` from V6.
- No new migration is planned for Phase 3 unless open decisions change scope.
- Do not edit V4/V5/V6 in place.
- Future migrations may be required for refresh-token rotation, token cleanup, audit logging, username normalization, or unlock/support operations.

## 10. Batch / Job / Event Impact

No batch, scheduled job, background worker, webhook, or event stream is in current LOGIN MVP scope. Future token-session cleanup or audit export would be a separate decision/ticket.

## 11. Test Impact

- FE unit tests should cover login rendering, disabled submit, error localization, redirects, authenticated redirect, logout local clear, and API helper behavior.
- BE unit tests should cover successful login, invalid credentials, inactive account, token issue/parse/expiry, and session revoke behavior.
- BE integration tests should cover login, validation, `/auth/me`, `/me`, logout 204, missing/expired/revoked token paths.
- E2E should cover anonymous login screen, admin login, non-admin login, invalid credential, logout if in scope.
- Black-box should cover account enumeration, secret leakage, username length, server/network failure, out-of-scope feature absence, and repeated-failure safety.

## 12. Operation / Monitoring Impact

- Auth errors must preserve trace ID without exposing sensitive detail.
- JWT secret and auth policy values must come from runtime config.
- Token-session table growth/cleanup is not specified and should be tracked.
- Token cleanup/support process is not specified and should be tracked if session growth affects users.
- Formal login audit logging is open and must not be assumed.

## 13. Rollout / Rollback Impact

- `/api/v1/me` compatibility reduces rollout risk.
- Rollback should not require destructive DB changes because current DB impact is existing V4/V5/V6 mappings.
- If production token-storage policy changes, FE rollout may require coordinated migration of stored auth state.
- If non-admin route changes to `/home`, FE route and E2E expectations must roll out together.
- If refresh-token policy changes, FE/BE contract and token-session behavior must roll out together.

## 14. Areas Determined to be Unaffected and Based on
| area | judgment | evidence |
|---|---|---|
| Batch/job/event processing | Unaffected | `spec-pack.md` out of scope and no LOGIN batch/job in `context.md`. |
| OAuth/SSO/social login | Unaffected / forbidden | `spec-pack.md` out of range and `ticket-rules.md` Must Not Do. |
| Registration/invitation/profile/role-management UI | Unaffected | Out of range in `spec-pack.md`. |
| Password reset/forgot-password | Unaffected / forbidden | Out of range in `spec-pack.md`. |
| MFA/Remember Device/active Remember Me | Unaffected / forbidden | Out of range and open policy. |
| Existing V4/V5/V6 migration content | Not to be changed | `ticket-rules.md` forbids editing old migrations. |
| External provider/webhook integrations | Unaffected | No caller/callee relation to LOGIN MVP. |
| Production secrets/logs/env | Not read/touched | `03_source-availability.md` excludes them. |

## 15. Required Options

- Source Analysis: required and completed for planning.
- FE-BE Contract: required due login/current-user/logout DTOs.
- DB Migration: required for mapping review, but no new migration planned without decision.
- Full Security: required due password, token, enumeration, logout, privacy.
- Translation: required due login/user-visible error strings.

## 16. Human Decision Required

- Refresh-token MVP contract and whether refresh token should remain returned/stored.
- Final non-admin landing route.
- Email exposure in auth payloads and JWT.
- `returnUrl` requirement and allowlist.
- Username case-sensitivity.
- Formal audit logging.
- Production token-storage posture.
- Documentation canonical location/sync rule.

## 17. Risk Summary

The highest risks are security and contract drift: refresh-token ambiguity, localStorage token posture, account enumeration, stale OAuth/session documentation, and current-user/login payload changes. Implementation should stay within current MVP scope and stop on open decisions.
