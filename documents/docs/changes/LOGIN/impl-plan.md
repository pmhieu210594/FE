# Implementation Plan

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

## 1. Implementation Principle

- Implement only the current LOGIN MVP from `spec-pack.md`.
- Do not implement open issues without human decision.
- Prefer verification/targeted adjustment over redesign because source already contains the main auth flow.
- Keep FE auth in `src/lib/api.ts`, `src/hooks/useAuth.ts`, `LoginPage.tsx`, and route/layout boundaries.
- Keep BE controllers thin and auth rules in application services.
- Keep old Flyway migrations immutable.
- Keep passwords, hashes, tokens, JWT secrets, SQL details, stack traces, and account-existence hints out of UI/API/logs.
- Keep every step small enough to review and test independently.

## 2. Alternative Plan
| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Keep current username/password bearer JWT + token-session implementation; verify and fill gaps only. | Matches source/spec, supports logout revocation, minimal churn. | Refresh-token/localStorage policy still open. | Chosen. |
| B | Revert to older OAuth/session-cookie assumptions. | Aligns with stale docs. | Violates LOGIN spec and current code. | Rejected. |
| C | Expand now to refresh-token rotation, Remember Me, `/home`, `returnUrl`, audit logging, and token-storage redesign. | Could address future needs. | Open decisions, larger blast radius, not MVP. | Blocked. |
| D | Replace JWT with opaque tokens. | Strong server-side control. | Rework existing token service/filter/FE contract; not requested. | Rejected unless new decision. |

## 3. Reason for Choosing the Alternative Plan

Option A follows the current code and Phase 1/2 spec. It preserves the existing FE/BE contract, token-session revocation behavior, `/api/v1/me` compatibility, DB mappings, and test surfaces. It also keeps open decisions isolated rather than hiding product/security choices inside implementation.

## 4. Expected Change File
| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_FE/src/pages/LoginPage.tsx` | Verify or adjust username/password form, disabled state, password masking, safe error, redirect. | Core FE login behavior. | AC-1 to AC-9, AC-12 to AC-14, AC-19, AC-20 |
| `EDCAP_FE/src/hooks/useAuth.ts` | Verify or adjust current-user 401 handling and logout local clear. | FE auth-state boundary. | AC-15 to AC-18 |
| `EDCAP_FE/src/lib/api.ts` | Verify or adjust auth DTOs, bearer header, token set/clear, `ApiError`. | FE/BE contract boundary. | AC-6, AC-15, AC-16, AC-18, AC-19 |
| `EDCAP_FE/src/App.tsx` | Verify or adjust route guards and role redirects. | Route behavior. | AC-12 to AC-14 |
| `EDCAP_FE/src/components/Layout.tsx` | Verify logout action and authenticated user display. | Shell behavior. | AC-18 |
| `EDCAP_FE/public/locales/{en,vi,ja}/locale.json` | Verify or add login/error/logout strings. | i18n and safe messages. | AC-1 to AC-5, AC-8, AC-9, AC-19 |
| `EDCAP_FE/src/utils/variable.ts` | Review only; avoid stale `C_API.Login`. | Prevent wrong endpoint usage. | AC-20 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` | Verify or adjust login/logout endpoints. | Auth API boundary. | AC-6, AC-17 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | Verify current-user canonical/compatibility endpoints. | Contract compatibility. | AC-16 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java` | Verify or adjust credential, session, logout rules. | Main business behavior. | AC-7 to AC-11, AC-17 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthTokenService.java` | Verify token issue/parse/hash behavior. | Token security. | AC-15, AC-19 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilter.java` | Verify active token-session auth. | Protected API boundary. | AC-15 |
| `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Verify public/protected route rules. | Security chain. | AC-15, AC-20 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | Verify request/response DTO and validation. | Contract and validation. | AC-6 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Verify safe auth error mapping. | Error safety. | AC-8, AC-9, AC-19 |
| `EDCAP_BE/src/main/resources/db/migration/V4/V5/V6*.sql` | Review only; no in-place edits. | Schema mapping. | AC-6, AC-10, AC-15, AC-17 |
| FE/BE/E2E tests | Update/execute targeted tests. | AC evidence. | AC-1 to AC-20 |

## 5. Class / Function / Method to Add or Modify
| target | action | input | output | note |
|---|---|---|---|---|
| `LoginPage()` | Review/modify if needed | username/password form event | login mutation, error, redirect | Do not add out-of-scope actions. |
| `useAuth()` | Review/modify if needed | bearer/current-user request | `user`, `isAuthenticated`, `isLoading` | 401 means anonymous. |
| `logout()` FE | Review/modify if needed | current auth state | local tokens cleared, login redirect | Clear local state even if API fails. |
| `request()` / `endpoints.*` | Review/modify if needed | path/body/token | DTO or `ApiError` | Single FE auth HTTP boundary. |
| `AuthController.login()` | Review/modify if needed | `AuthLoginRequest` | `AuthLoginResponse` | Thin controller. |
| `AuthController.logout()` | Review/modify if needed | principal/authentication | 204 | No sensitive body. |
| `MeController.me()` | Review/modify if needed | principal/authentication | current-user DTO | Canonical + compatibility. |
| `AuthService.login()` | Review/modify if needed | raw username/password | `AuthLoginResult` | Trim, bcrypt, active check, token session. |
| `AuthService.logout()` | Review/modify if needed | `AuthUserContext` | void | Revoke sessions and clear attempts. |
| `AuthTokenService` methods | Review/modify if needed | user/token | JWT/context/hash | Do not log token/secret. |
| `BearerTokenAuthenticationFilter.doFilterInternal()` | Review/modify if needed | HTTP auth header | security context or anonymous | Requires active token-session hash. |

## 6. SQL / Query / Repository Policy

- Use `tbl_auth_user_account.username` for login lookup after trimming.
- Verify password in application code using hash/algo; do not compare raw passwords in SQL.
- Use `tbl_auth_token_session` for access/refresh token hashes and revocation.
- Keep web layer away from persistence adapters.
- Do not modify V4/V5/V6 migrations in place.
- Add a new migration only if an approved decision requires schema change.

## 7. Validation / Error / Logging Policy

- FE blocks missing username/password before submit where possible.
- BE validates nonblank and max length for username/password.
- Unknown username and wrong password produce the same safe observable behavior.
- Inactive accounts produce safe unavailable-account behavior.
- Missing/expired/revoked token returns unauthorized and FE becomes anonymous.
- Use localized FE messages for user-facing errors.
- Preserve `traceId`.
- Never log or return password, hash, access token, refresh token, JWT secret, SQL detail, stack trace, or account-existence hint.

## 8. Migration / Rollback Policy

- No migration is planned for current Phase 3 scope.
- Existing V4/V5/V6 migrations are read-only.
- If a future decision requires DB change, create additive migration and update tests/docs.
- Rollback should preserve `/api/v1/me` compatibility until callers are migrated.
- Rollback must not require destructive DB cleanup.
- If token storage policy changes, define FE local storage cleanup/migration explicitly.

## 9. Step Implementation
| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Confirm no code changes are needed for already-satisfied AC or identify exact gaps. | Spec/context vs source | Source review checklist | Stop if gap touches open issue. |
| 2 | Verify FE API contract and token storage/clear behavior. | `src/lib/api.ts` | FE API tests/build | Stop if changing token storage policy. |
| 3 | Verify FE login form, error mapping, role redirects. | `LoginPage.tsx`, locales | LoginPage tests/E2E | Stop if adding out-of-scope UI. |
| 4 | Verify FE auth gate and logout behavior. | `useAuth.ts`, `App.tsx`, `Layout.tsx` | Hook/router tests/E2E | Stop if new `/home` or `returnUrl` is needed. |
| 5 | Verify BE login DTO/API/error shape. | `AuthController`, `Dtos`, error classes | API integration tests | Stop if response shape changes. |
| 6 | Verify BE auth service rules. | `AuthService`, auth repositories | BE unit tests | Stop if username case/audit design is needed. |
| 7 | Verify token issue/parse/session validation/logout revoke. | `AuthTokenService`, filter, token session repo | BE unit/integration tests | Stop if refresh rotation is requested. |
| 8 | Verify DB mapping only. | V4/V5/V6 migrations, mappers | Source review/integration tests | Stop if old migration edit is proposed. |
| 9 | Update tests for identified gaps. | FE/BE/E2E tests | Targeted test run | Stop if tests require real secrets. |
| 10 | Record evidence. | `test-results.md`, `self-review.md`, `report.md` | Exact command/result summary | Stop if verification contradicts spec. |

## 10. How to Verify Each Step

- Step 1: compare AC table with source and existing tests.
- Step 2: run FE API/helper tests and inspect Authorization/header behavior.
- Step 3: run LoginPage tests and Playwright login scenarios.
- Step 4: run useAuth/logout tests and route guard tests.
- Step 5: run `AuthApiIntegrationTest`.
- Step 6: run `AuthServiceTest` including invalid, inactive, and trim.
- Step 7: run `AuthTokenServiceTest` and integration tests for missing/expired/revoked tokens.
- Step 8: inspect schema/mappers; rely on integration tests for runtime behavior.
- Step 9: run targeted suites only after changes.
- Step 10: record exact commands in `test-results.md`.

## 11. Corresponding AC Table
| AC ID | implementation point | verification |
|---|---|---|
| AC-LOGIN-1 | `LoginPage` route/render | FE unit/E2E |
| AC-LOGIN-2 | Username required/disabled submit | FE unit |
| AC-LOGIN-3 | Password required/disabled submit | FE unit |
| AC-LOGIN-4 | Password input type/toggle | FE unit/BB |
| AC-LOGIN-5 | Pending state/double submit | FE unit/BB |
| AC-LOGIN-6 | Login API/service/DTO | BE unit/API IT/E2E |
| AC-LOGIN-7 | Username trim | BE unit/API IT |
| AC-LOGIN-8 | Invalid credentials safe behavior | BE unit/API IT/FE error test |
| AC-LOGIN-9 | Inactive account safe behavior | BE unit/API IT |
| AC-LOGIN-10 | Repeated failures remain safe | BE unit/BB |
| AC-LOGIN-11 | Successful reset | BE unit |
| AC-LOGIN-12 | Admin redirect | FE unit/E2E |
| AC-LOGIN-13 | Non-admin redirect | FE unit/E2E |
| AC-LOGIN-14 | Authenticated login redirect | FE unit |
| AC-LOGIN-15 | Missing/invalid/expired/revoked token | BE IT/FE hook test |
| AC-LOGIN-16 | `/auth/me` and `/me` compatibility | BE IT/contract |
| AC-LOGIN-17 | Logout server revoke/204 | BE IT |
| AC-LOGIN-18 | FE logout local clear | FE hook test |
| AC-LOGIN-19 | Secret/account-existence leakage prevention | Review/BB/tests |
| AC-LOGIN-20 | Out-of-scope feature absence/config | Review/FE tests/BB |

## 12. Stop / Ask Condition

- Stop if implementation must resolve any open human decision.
- Stop if login response/current-user shape changes beyond `spec-pack.md`.
- Stop if refresh-token rotation, Remember Me, `/home`, `returnUrl`, username case normalization, email policy, audit logging, or token-storage redesign is requested.
- Stop if any code path exposes secrets or account-existence hints.
- Stop if old Flyway migrations would need in-place edits.
- Stop if verification requires production secrets or real credentials.

## 13. Do Not Do This Ticket

- Do not add OAuth/SSO/social/MFA/register/password-reset/refresh-flow/Remember Me behavior.
- Do not introduce `/api/v1/login` or use legacy `src/utils/api.ts` for LOGIN.
- Do not add `/home` unless HD-LOGIN-002 is resolved.
- Do not implement `returnUrl` unless HD-LOGIN-004 is resolved.
- Do not change email exposure, username case behavior, audit logging, or token storage policy without decision.
- Do not change old migrations.

## 14. Open Related Issues

- OI-LOGIN-001 refresh-token field/session storage while refresh flow disabled.
- OI-LOGIN-002 final non-admin landing route.
- OI-LOGIN-003 email exposure in auth payload/JWT.
- OI-LOGIN-004 `returnUrl` behavior and allowlist.
- OI-LOGIN-005 username case-sensitivity.
- OI-LOGIN-006 formal login audit logging.
- OI-LOGIN-007 localStorage token persistence and production security posture.
- OI-LOGIN-008 root vs FE LOGIN documentation drift.
