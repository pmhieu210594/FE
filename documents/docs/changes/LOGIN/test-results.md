# Test Results

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

## 1. Execution Environment

| item | value |
|---|---|
| Scope | Phase 6 LOGIN test plan, test code additions, execution evidence, and Phase 8 final roll-up |
| Date/time | 2026-06-11 Asia/Bangkok |
| FE runtime | Node/npm project under `EDCAP_FE`; Vitest 3.2.6 observed in output |
| BE runtime | Maven project under `EDCAP_BE`; Java 21.0.10 and Spring Boot 3.4.1 observed in output |
| Browser/E2E | Playwright targeted login spec with mocked auth API |
| Rules availability | `EDCAP_FE/.claude/rules` was not present in the readable workspace |

## 2. Executed Command

| command | result | log/evidence | note |
|---|---|---|---|
| `npx vitest run src/__tests__/auth src/__tests__/lib/api.test.ts --reporter=dot` | PASS | 3 test files, 17 tests passed, duration 5.57s | Ran outside sandbox because Vite config loading is blocked inside sandbox. |
| `mvn test '-Dtest=AuthServiceTest,AuthTokenServiceTest,AuthApiIntegrationTest'` | PASS | Final run: 15 tests, 0 failures, 0 errors, build success, total time 8.172s | Ran outside sandbox because Maven/network access is required. Mockito dynamic-agent warning observed but non-failing. |
| `npm run -s build` | PASS | Vite built successfully, 3259 modules transformed, built in 4.48s | Includes `tsc && vite build`; ran outside sandbox because Vite config loading is blocked inside sandbox. |
| `npx playwright test e2e_tests/tests/login.spec.ts --reporter=line` | PASS | 3 tests passed in 4.0s | Starts local Vite server and uses mocked API routes. |

## 3. Summary of Results

Phase 6 added five focused tests and all targeted verification passed. FE auth/API unit coverage increased from 14 to 17 passing tests. BE auth/token/API targeted coverage increased from 13 to 15 passing tests. FE build/typecheck passed. Mocked Playwright login E2E passed for standard user, admin user, and invalid credentials. Phase 8 did not rerun tests because no production code or test code changed after Phase 6; this file is retained as the final test evidence roll-up.

## 4. List of Passes

| TC ID | test | result | note |
|---|---|---|---|
| TC-LOGIN-1 | Login page renders form with username and password inputs (FE UT, `LoginPage` component mount) | PASS | |
| TC-LOGIN-2 | Username field is required; submit disabled if empty (FE UT, `LoginPage` validation) | PASS | |
| TC-LOGIN-3 | Password field is required; submit disabled if empty (FE UT, `LoginPage` validation) | PASS | |
| TC-LOGIN-4 | Password masked by default; visibility toggle shows/hides (FE UT, `LoginPage` password input) | PASS | |
| TC-LOGIN-5 | Submit is disabled while login mutation is pending (FE UT, `LoginPage` mutation state) | PASS | |
| TC-LOGIN-6 | Successful login returns access token, refresh token, expiry, user, redirect (BE UT, `AuthService.login()` response) | PASS | |
| TC-LOGIN-7 | Username is trimmed before lookup; leading/trailing spaces ignored (BE UT, `AuthService.login()`) | PASS | |
| TC-LOGIN-8 | Invalid credentials return uniform `INVALID_CREDENTIALS` error code (BE UT, `AuthService.login()` exception) | PASS | |
| TC-LOGIN-9 | Inactive/disabled account returns temporary unavailable behavior (BE UT, `AuthService.login()` for inactive user) | PASS | |
| TC-LOGIN-10 | Repeated failed logins remain generic; no account lockout in MVP (BE UT, `AuthService.registerFailure()` through multiple login attempts) | PASS | |
| TC-LOGIN-11 | Successful login revokes/replaces prior active token session (BE UT, `AuthService.login()` invalidates existing session) | PASS | |
| TC-LOGIN-12 | Admin login response includes `/admin` redirect hint; FE applies redirect (FE UT + BE UT, `LoginPage` redirect logic + `AuthService.login()`) | PASS | |
| TC-LOGIN-13 | Non-admin login response includes `/:lang/` redirect hint; FE applies redirect (FE UT + BE UT, `LoginPage` redirect logic + `AuthService.login()`) | PASS | |
| TC-LOGIN-14 | Authenticated users visiting login page are redirected based on role (FE UT, `LoginPage` component guard) | PASS | |
| TC-LOGIN-15 | Bearer token validation checks signature, expiry, and active session (BE UT, `AuthTokenService.parseAndValidate()`) | PASS | |
| TC-LOGIN-15 | Tampered JWT payload (signature mismatch) is rejected (BE UT, `AuthTokenService.parseAndValidate()` tampered case) | PASS | |
| TC-LOGIN-16 | `/api/v1/auth/me` and `/api/v1/me` both map to same endpoint (API IT, `MeController` dual-path mapping) | PASS | |
| TC-LOGIN-17 | Logout returns 204 and invokes server-side token revoke (BE UT + API IT, `AuthService.logout()` + `AuthController.logout()`) | PASS | |
| TC-LOGIN-18 | Logout clears access token and cache; navigates to localized login (FE UT, `logout()` in `useAuth.ts`) | PASS | |
| TC-LOGIN-19 | No password/secret logging in auth code; generic error codes used (Source review, code inspection for log statements) | PASS | |
| TC-LOGIN-20 | No refresh-token flow, password reset, registration, or OAuth (Scope boundary, confirm absent from spec/impl) | PASS | |


## 5. List of Fails

| test | cause | action | status |
|---|---|---|---|


## 6. Bugs Fixed

| bug | fix | evidence |
|---|---|---|
| No production bug found in Phase 6 | Added test coverage only; production source was not changed. | FE tests, BE tests, FE build, and Playwright all passed. |

## 7. Not yet fixed / Pending


## 8. Test cannot be executed and reason

| test/command | reason | risk | alternative evidence |
|---|---|---|---|

## 9. Remaining risk

Remaining risk is concentrated in production security and operations policy, not in the targeted LOGIN code paths tested this phase. The largest unresolved items are refresh-token policy, localStorage token posture, email exposure, real revoked-token server integration, and audit/cleanup operations.

## 10. Final Test Verdict

- PASS_WITH_PENDING_HUMAN_SECURITY_AND_OPERATION_DECISIONS
