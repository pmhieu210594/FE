# Source Map

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11

## Target Area

Internal username/password login, bearer-token authentication, protected route handling, and current-user lookup.

## Entry Points

| Area | Entry point |
|---|---|
| FE login | `EDCAP_FE/src/pages/LoginPage.tsx` |
| FE auth state | `EDCAP_FE/src/hooks/useAuth.ts` |
| FE HTTP | `EDCAP_FE/src/lib/api.ts` |
| FE routing | `EDCAP_FE/src/App.tsx`, `EDCAP_FE/src/router.tsx` |
| BE security | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` |
| BE auth API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` |
| BE current user | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` |

## Call Flow

1. User opens login route.
2. `LoginPage` validates username/password and calls login API through FE API helper.
3. Backend verifies account, password, and active state.
4. Backend returns access token and safe user summary.
5. FE resolves current user and redirects admin users to `/:lang/admin`; non-admin users to `/:lang/`.
6. Protected API calls attach bearer token.
7. Logout clears FE auth state and calls logout endpoint.

## Data Flow

- Input: username and password.
- Persistence: `tbl_auth_user_account` plus token session state.
- Output: access token, current-user summary, role/scope data, safe error response.

## Test Map

- FE unit: `EDCAP_FE/src/__tests__/auth/LoginPage.test.tsx`, `EDCAP_FE/src/__tests__/auth/useAuth.test.tsx`.
- E2E: `e2e_tests/tests/login.spec.ts`.
- BE unit/integration: auth service, token service, global error handler, and auth API integration tests.
- Black-box: `blackbox-testcases.md`.

## Unknown Source Areas

- Final production token storage policy should be reviewed before release hardening.
- Server-side JWT revocation is still an open issue.
