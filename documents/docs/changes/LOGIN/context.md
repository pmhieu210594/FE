# Context

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  
## Screen / API / Batch / Related Job

| type | name / route | status | note |
|---|---|---|---|
| Screen | `/:lang/login` | Exists | `LoginPage` username/password form. |
| Screen | `/:lang/` | Exists | Temporary non-admin landing through `HomeGate`/`HomePage`. |
| Screen | `/:lang/admin` | Exists | Admin-only route guarded by `RequireAdmin`. |
| API | `POST /api/v1/auth/login` | Exists | Username/password login. |
| API | `POST /api/v1/auth/logout` | Exists | Logout and session revocation when principal exists. |
| API | `GET /api/v1/auth/me` | Exists | Canonical current-user endpoint. |
| API | `GET /api/v1/me` | Exists | Compatibility current-user endpoint. |
| Batch / Job | N/A | None | No LOGIN batch/job in MVP. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| FE login screen | `EDCAP_FE/src/pages/LoginPage.tsx` | Controlled username/password form, disabled submit, password toggle, localized safe error, role redirect. |
| FE auth state | `EDCAP_FE/src/hooks/useAuth.ts` | `authMe()` query, 401 becomes anonymous, logout clears local/query state. |
| FE API helper | `EDCAP_FE/src/lib/api.ts` | Typed auth endpoints, bearer header attachment, `ApiError` parsing. |
| FE route guards | `EDCAP_FE/src/App.tsx` | `HomeGate` and `RequireAdmin` protect routes. |
| FE shell logout | `EDCAP_FE/src/components/Layout.tsx` | Uses `logout()` from auth hook. |
| BE auth API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` | Thin controller delegating to `AuthService`. |
| BE current user | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | One handler for `/me` and `/auth/me`. |
| BE auth service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java` | Trim, password, token/session, logout rules. |
| BE bearer auth | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilter.java` | Validates JWT and active token-session hash. |

## Allowed common components
| component | path | usage note |
|---|---|---|
| UI `Button` | `EDCAP_FE/src/components/ui/button.tsx` | Primary login/logout actions. |
| UI `Card` | `EDCAP_FE/src/components/ui/card.tsx` | Current login form container. |
| TanStack Query client | `EDCAP_FE/src/lib/queryClient.ts` | `["me"]` auth cache updates/invalidation. |
| API helper | `EDCAP_FE/src/lib/api.ts` | All LOGIN API calls. |
| Auth hook | `EDCAP_FE/src/hooks/useAuth.ts` | Single FE auth state source. |
| Locale files | `EDCAP_FE/public/locales/{en,vi,ja}/locale.json` | User-visible LOGIN strings. |
| `ErrorResponse` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Error shape: `timestamp`, `status`, `error`, `message`, `traceId`. |

## Forbidden common components
| component | reason |
|---|---|
| Google/OAuth login CTA or `/oauth2/authorization/google` | Out of LOGIN MVP. |
| `EDCAP_FE/src/utils/api.ts` | Avoid parallel/legacy auth client. |
| `C_API.Login = "/api/v1/login"` | Does not match current contract. |
| Redux/global no-op login actions | Not current implementation. |
| Direct auth `fetch` in components | Duplicates `lib/api.ts` token/error behavior. |

## List of methods that actually exist
| method/class | path | usage |
|---|---|---|
| `LoginPage()` | `EDCAP_FE/src/pages/LoginPage.tsx` | Login UI and success redirect. |
| `useAuth()` | `EDCAP_FE/src/hooks/useAuth.ts` | Current-user query and auth booleans. |
| `logout()` | `EDCAP_FE/src/hooks/useAuth.ts` | Logout API, local clear, login redirect. |
| `setAccessToken()` / `clearAccessToken()` | `EDCAP_FE/src/lib/api.ts` | Token local storage management. |
| `endpoints.authLogin()` | `EDCAP_FE/src/lib/api.ts` | `POST /api/v1/auth/login`. |
| `endpoints.authLogout()` | `EDCAP_FE/src/lib/api.ts` | `POST /api/v1/auth/logout`. |
| `endpoints.authMe()` / `endpoints.me()` | `EDCAP_FE/src/lib/api.ts` | Current-user canonical/compatibility calls. |
| `RequireAdmin()` / `HomeGate()` | `EDCAP_FE/src/App.tsx` | Route guards. |
| `AuthController.login()` / `logout()` | `EDCAP_BE/.../web/rest/AuthController.java` | Login/logout endpoints. |
| `MeController.me()` | `EDCAP_BE/.../web/rest/MeController.java` | `/api/v1/me` and `/api/v1/auth/me`. |
| `AuthService.login()` / `currentUser()` / `logout()` | `EDCAP_BE/.../AuthService.java` | Auth business rules. |
| `AuthTokenService.issueToken()` / `parseAndValidate()` / `hashToken()` | `EDCAP_BE/.../AuthTokenService.java` | JWT and token hash behavior. |

## Forbidden methods / methods that do not exist
| method/API | reason | alternative |
|---|---|---|
| `POST /api/v1/login` | Not current LOGIN API | `POST /api/v1/auth/login`. |
| `POST /api/v1/auth/refresh` | Does not exist; refresh flow open | No active refresh flow. |
| `POST /api/v1/auth/forgot-password` | Out of scope | Future ticket. |
| `POST /api/v1/auth/register` | Out of scope | Future ticket. |
| `POST /api/v1/auth/mfa/*` | Out of scope | Future ticket. |
| `loginWithGoogle()` | Legacy/commented idea | Username/password login. |

## DTO / Entity / Table / Migration mapping
| layer | name | path | Note |
|---|---|---|---|
| FE type | `AuthLoginRequest` / `AuthLoginResponse` / `AuthUser` | `EDCAP_FE/src/lib/api.ts` | FE auth contract. |
| BE DTO | `Dtos.AuthLoginRequest` / `AuthLoginResponse` / `AuthCurrentUserDto` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | BE request/response contract. |
| Domain | `AuthUserAccount` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AuthUserAccount.java` | Account data. |
| Domain | `AuthTokenSession` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AuthTokenSession.java` | Token session state. |
| Domain | `AuthTokenSession` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AuthTokenSession.java` | Token session state. |
| Migration | `V4__init_shema_v2.sql` | `EDCAP_BE/src/main/resources/db/migration` | `tbl_auth_user_account`. |
| Migration | `V6__auth_token_session.sql` | `EDCAP_BE/src/main/resources/db/migration` | token session state. |
| Migration | `V6__auth_token_session.sql` | `EDCAP_BE/src/main/resources/db/migration` | `tbl_auth_token_session`. |

## formItemNm / SEQNO / Master Data / Code Value Mapping
| display/item | internal value | source | note |
|---|---|---|---|
| `formItemNm` | N/A | Current LOGIN implementation | Not used. |
| `SEQNO` | N/A | Current LOGIN implementation | Not used. |
| Auth error | `INVALID_CREDENTIALS`, `ACCOUNT_TEMPORARILY_UNAVAILABLE`, `VALIDATION_ERROR`, `UNAUTHORIZED`, `INTERNAL_ERROR` | BE `GlobalExceptionHandler` / FE i18n | Map to safe localized messages. |
| Role | `ADMIN` | Current-user payload | Redirects to `/admin`. |
| Role | non-`ADMIN` | Current-user payload | Redirects to `/`. |
| Config | `APP_JWT_EXPIRATION_HOURS`, `APP_AUTH_*` | `application.yml` / `AppProperties` | TTL, refresh, Remember Me policy. |

## Multilingual Note

Login labels, button text, loading text, password toggle labels, safe auth errors, layout logout, and temporary home text must exist in `en`, `vi`, and `ja` locale files. Do not hardcode new user-visible strings.

## Encoding / Mojibake Note

Keep source and docs in UTF-8. Some terminal output shows mojibake for Vietnamese/Japanese strings; verify in an UTF-8-aware editor before changing translations.

## Log / Audit / Operation Note

Preserve `traceId` for troubleshooting. Never log passwords, password hashes, access tokens, refresh tokens, JWT secrets, SQL details, or account-existence hints. Formal audit logging, token-session cleanup, support unlock, and token-storage production posture remain follow-up/open decision areas.

## Ticket-Specific Constraints

- Follow `spec-pack.md` and this context over stale OAuth/session paragraphs in architecture/standards docs.
- Treat localStorage token storage as current implementation reality plus open security issue.
- Do not implement open issues without human decision.
- Do not edit existing Flyway migrations in place.
