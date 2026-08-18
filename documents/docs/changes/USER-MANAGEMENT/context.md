# Context

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

## Screen / API / Batch / Related Job

| category | related item | current source status | Phase 2 decision / note |
|---|---|---|---|
| FE screen | User Management list | Implemented | Admin-only screen at `/:lang/admin/user-accounts`. Lists username, member/fullname, role, status, updated time and actions. |
| FE screen | User Management create | Implemented | Create flow requires username, fullname, email, password, confirmPassword, roleId, and isActive. No team input. |
| FE screen | User Management detail | Implemented | Detail must not expose sensitive fields. |
| FE screen | User Management edit | Implemented | Update flow edits fullname, email, roleId and isActive only. Username is not editable. |
| FE screen | Password reset action | Implemented | Resets account password and must not expose raw password. |
| FE route | `/:lang/admin/user-accounts` | Implemented | Screen is ADMIN-only. Non-ADMIN access must redirect away and the BE must reject direct API calls. |
| BE API | `GET /api/v1/admin/user-accounts` | Implemented | List/search/filter with status and role. Pagination required. |
| BE API | `GET /api/v1/admin/user-accounts/{accountId}` | Implemented | Detail endpoint. Must return safe fields only. |
| BE API | `POST /api/v1/admin/user-accounts` | Implemented | Create login account and linked member pseudonym. |
| BE API | `PUT /api/v1/admin/user-accounts/{accountId}` | Implemented | Update fullname, email, roleId and isActive. Username not editable. |
| BE API | `POST /api/v1/admin/user-accounts/{accountId}/activate` | Implemented | Reactivate account. |
| BE API | `POST /api/v1/admin/user-accounts/{accountId}/deactivate` | Implemented | Deactivate account. Must not hard delete. |
| BE API | `POST /api/v1/admin/user-accounts/{accountId}/reset-password` | Implemented | Reset password using bcrypt hash replacement. |
| BE API | `GET /api/v1/admin/roles` | Implemented | Supplies role dropdown and validation source. |
| Batch / Job | User Management batch/job | Not found | No batch/job/event is in scope. Do not add one for this ticket. |
| External IF | LOGIN flow | Existing and related | User Management must remain compatible with LOGIN. Inactive/deactivated accounts cannot login. |
| Dependent domain | Member pseudonym / role tables | Existing and affected | Create/update operations write both login account and linked member pseudonym. `team_id = NULL` is intentional. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| FE authenticated route pattern | `EDCAP_FE/src/App.tsx` -> `RequireAuth` / `RequireAdmin` | Use route-level guard and current-language redirect style. User Management must remain ADMIN-only. |
| FE auth/user source | `EDCAP_FE/src/hooks/useAuth.ts` -> `useAuth()`, `logout()` | Reuse authenticated-user lookup and logout behavior for non-ADMIN screen access. |
| FE API helper pattern | `EDCAP_FE/src/lib/api.ts` -> `api`, `endpoints`, `ApiError` | Add typed User Management endpoint helpers here; use `credentials: "include"` and avoid direct `fetch` in page/components. |
| FE page/query/mutation style | `EDCAP_FE/src/pages/AdminPage.tsx` | Use React Query `useQuery`, `useMutation`, invalidation, and `useTranslation("locale")` style. |
| FE i18n usage | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Use `useTranslation("locale")` and add `Pages.UserAccounts.*` keys to all three locale files. |
| FE table/form primitives | `EDCAP_FE/src/components/ui/table.tsx`, `EDCAP_FE/src/components/ui/form/index.tsx` | Reuse existing primitives when they fit. Do not introduce new Ant Design table/form patterns for this ticket. |
| BE REST controller style | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java`, `HealthController.java` | Use `@RestController`, `/api/v1` base route, DTO return types, and service calls rather than infrastructure access. |
| BE admin role reference | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Shows `@CurrentUser AppUser caller` and `AppUser.Role.ADMIN` guard semantics. Do not copy its ad-hoc error body pattern. |
| BE DTO style | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | Existing DTOs are Java records with static `from(...)`; User Management may follow this or split DTOs if size grows. |
| BE exception envelope | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java`, `GlobalExceptionHandler.java` | Use standard `ErrorResponse(timestamp,status,error,message,traceId)` and safe message keys. |
| BE architecture enforcement | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | Keep web -> application -> domain and infrastructure -> ports boundaries green. |
| DB existing account tables | `tbl_auth_user_account`, `tbl_dim_member_pseudonym`, `tbl_dim_role` | These tables are already present and used by the current ticket. Do not rename them. |

## Allowed common components
| component | path | usage note |
|---|---|---|
| `Layout` | `EDCAP_FE/src/components/Layout.tsx` | Existing authenticated layout. |
| `Button` | `EDCAP_FE/src/components/ui/button.tsx` | Suitable for page actions and dialogs. |
| `CButton` | `EDCAP_FE/src/components/ui/button/index.tsx` | Existing custom button family; use consistently if matching existing `C*` components. |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | `EDCAP_FE/src/components/ui/table.tsx` | Safe simple table primitives for the account list. |
| `CServerTable` | `EDCAP_FE/src/components/ui/server-table/index.tsx` | Allowed if the final implementation needs server-side sorting/filter UI. |
| `CSearch` | `EDCAP_FE/src/components/ui/search/index.tsx` | Allowed for keyword search; it trims and debounces input. |
| `CForm` | `EDCAP_FE/src/components/ui/form/index.tsx` | Allowed for form scaffolding if validation mapping fits. |
| `Badge` | `EDCAP_FE/src/components/ui/badge.tsx` | Allowed for `ACTIVE` / `INACTIVE` display. |
| `Card` components | `EDCAP_FE/src/components/ui/card.tsx` | Allowed for detail/create/edit layout. |
| `useAuth`, `logout` | `EDCAP_FE/src/hooks/useAuth.ts` | Required reference for auth checks and logout behavior. |
| `api`, `endpoints`, `ApiError` | `EDCAP_FE/src/lib/api.ts` | Preferred API helper for User Management. |
| `formatDateTime` | `EDCAP_FE/src/lib/utils.ts` | Allowed for timestamps if null-safe. |

## Forbidden common components
| component | reason |
|---|---|
| Direct `fetch` inside User Management page/component | Architecture rules require API calls to go through `lib/api.ts`. |
| `EDCAP_FE/src/utils/api.ts` for new User Management endpoint helpers | This legacy wrapper uses a different envelope/token model and should not be mixed into the current ticket. |
| `routerLinks()` generated API map | `router-links.ts` currently has empty maps and should not be treated as the source of truth. |
| New Ant Design `Table`/`Form` introduction | Do not introduce new AntD Table/Form for this ticket unless explicitly approved. |
| `AdminController` ad-hoc error body pattern | Current ad-hoc error response is not the desired contract. Use standard error handling. |
| Hard delete for accounts | Forbidden. Use deactivate/reactivate only. |
| Team input/assignment flow | Out of scope for this ticket; `team_id = NULL` is intentional. |

## List of methods that actually exist
| method/class | path | usage |
|---|---|---|
| `endpoints.me()` | `EDCAP_FE/src/lib/api.ts` | Calls `GET /api/v1/me`; source of current user and role through `useAuth()`. |
| `endpoints.health()` | `EDCAP_FE/src/lib/api.ts` | Health endpoint reference only. |
| `api.get<T>(path)` | `EDCAP_FE/src/lib/api.ts` | Preferred GET helper for new User Management endpoint helpers. |
| `api.post<T>(path, body)` | `EDCAP_FE/src/lib/api.ts` | Preferred POST helper. |
| `api.put<T>(path, body)` | `EDCAP_FE/src/lib/api.ts` | Preferred PUT helper. |
| `api.del<T>(path)` | `EDCAP_FE/src/lib/api.ts` | Existing DELETE helper; User Management does not use hard delete. |
| `useAuth()` | `EDCAP_FE/src/hooks/useAuth.ts` | Provides `{ user, isAuthenticated, isLoading, ... }`. |
| `logout()` | `EDCAP_FE/src/hooks/useAuth.ts` | POSTs `/logout`, clears React Query `me`, redirects to `/#/{lang}/login`. |
| `RequireAuth` / `RequireAdmin` | `EDCAP_FE/src/App.tsx` | Existing route guards; User Management should reuse the Admin guard pattern. |
| `AdminPage()` | `EDCAP_FE/src/pages/AdminPage.tsx` | Page pattern for React Query + i18n only. |
| `HealthController.health()` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/HealthController.java` | REST + DTO pattern reference. |
| `MeController.me(OAuth2User principal)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | REST + application service pattern reference. |
| `AdminController.connectors()` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Admin endpoint reference; not a User Management implementation. |
| `AdminController.runConnector(String, Long, AppUser)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Shows `@CurrentUser` role check semantics. |
| `CurrentAppUserResolver` / `@CurrentUser` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/` | Existing way to resolve local `AppUser` for role/actor metadata. |
| `AppUser.Role` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Existing enum: `VIEWER`, `EDITOR`, `ADMIN`. User Management authorization uses `ADMIN`. |
| `GlobalExceptionHandler.*` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Existing exception-to-HTTP mapping. |
| `LayerEnforcementTest` | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | Existing architecture test that future User Management code must satisfy. |

## Forbidden methods / methods that do not exist
| method/API | reason | alternative |
|---|---|---|
| Hard delete account API | Not part of the ticket and would violate release scope. | Use deactivate/reactivate/reset-password flows. |
| Team assignment create/update methods | Out of scope for this ticket. | Keep `team_id = NULL`. |
| Expose passwordHash/token/secret in any DTO | Security violation. | Return safe DTO fields only. |
| Self-service forgot password | Out of scope. | Separate auth-support ticket. |
| Formal audit implementation | Future phase / not required here. | Use existing trace and operation logs only. |

## DTO / Entity / Table / Migration mapping
| layer | name | path | Note |
|---|---|---|---|
| FE route | User Management route | `EDCAP_FE/src/App.tsx` | Implemented at `/:lang/admin/user-accounts`; must remain ADMIN-only. |
| FE API helper | User Management endpoint helpers | `EDCAP_FE/src/lib/api.ts` | Implemented or expected to be implemented as typed helpers. |
| FE types | `CreateUserAccountRequest`, `UpdateUserAccountRequest`, `ResetPasswordRequest`, `UserAccountDto` | To be defined in implementation phase | Must match BE payloads and safe response fields. |
| FE locale | `Pages.UserAccounts.*` | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Add keys for list, form, detail, validation, and error states. |
| BE controller | User Management REST controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/` | Implemented in current source. Must call application services. |
| BE request DTO | Create/update/reset request records | `web.dto` or existing DTO grouping | Must exclude `teamId` and sensitive fields. |
| BE response DTO | User account list/detail DTO | `web.dto` or existing DTO grouping | Must return safe fields only. |
| BE application service/use case | User account admin service | application layer | Implements list/search/create/update/activate/deactivate/reset-password. |
| BE persistence port | User account repository port | application port | Used by service for account/member persistence. |
| BE domain model | App user / member role model | domain model | Used for auth and guard semantics. |
| BE adapter | Repository adapter / mapper implementation | infrastructure layer | Handles account/member writes and lookup queries. |
| DB table | `tbl_auth_user_account` | existing DB | Primary login-account table. |
| DB table | `tbl_dim_member_pseudonym` | existing DB | Linked member identity/role table. |
| DB table | `tbl_dim_role` | existing DB | Role master for dropdown and validation. |
| DB column | `team_id` | existing DB column | Must remain `NULL` for this ticket. |
| DB column | `role_id` | existing DB column | Required and must be updated with role changes. |
| DB column | `password_hash` | existing DB column | Must store bcrypt hash only. |
| DB column | `is_active` | existing DB column | Drives active/inactive login behavior. |

## formItemNm / SEQNO / Master Data / Code Value Mapping
| display/item | internal value | source | note |
|---|---|---|---|
| Username | `username` | `spec-pack.md` / current source | Required, trimmed, unique, max 100. |
| Full name | `fullname` | `spec-pack.md` / current source | Editable on create/update. |
| Email | `email` | `spec-pack.md` / current source | Editable on create/update. |
| Password | `password` | `spec-pack.md` / current source | Create/reset only; never returned. |
| Confirm password | `confirmPassword` | `spec-pack.md` / current source | Must match password. |
| Role | `roleId` | `tbl_dim_role` / `/api/v1/admin/roles` | Required for create/update. |
| Status | `isActive` | current source | `true` / `false` maps to active/inactive behavior. |
| `teamId` | N/A | source inspection | Not used by this ticket. Do not invent one. |
| `formItemNm` | N/A | source inspection | No ticket-specific `formItemNm` mapping found. |
| `SEQNO` | N/A | source inspection | No ticket-specific SEQNO field found. |
| Master Data table | `tbl_dim_role` | DB source | Role source for dropdown/validation. |
| Code Value | `ADMIN`, `EDITOR`, `VIEWER` | `AppUser.Role` | Use existing role semantics; `ADMIN` is the guard for this ticket. |

## Multilingual Note

- FE translation resources are fixed at `EDCAP_FE/public/locales/{en,ja,vi}/locale.json`.
- User-facing User Management labels/messages must be translated through `useTranslation("locale")`; do not hard-code English/Japanese/Vietnamese UI text in components.
- BE currently has `ErrorResponse.message`, not a dedicated `messageKey` field. For this ticket, treat `message` as the i18n key unless the contract is formally changed later.
- Ensure all create/update/reset/permission error keys are added consistently across `en`, `ja`, and `vi`.
- Keep UTF-8 encoding and verify diacritics / Japanese text render correctly.

## Encoding / Mojibake Note

- Preserve UTF-8 for all Markdown and locale files.
- Do not convert locale files to Shift-JIS or other encodings.
- Keep JSON valid; do not leave trailing commas or duplicate keys.

## Log / Audit / Operation Note

- Dedicated audit log implementation is out of scope for this release.
- Use existing request trace behavior: `TraceIdFilter` sets MDC `traceId` and `X-Trace-Id`; `ErrorResponse` includes `traceId`.
- Do not log raw passwords, password hashes, secrets, or unnecessary personal data.
- Create/update/deactivate/reactivate/reset-password should remain traceable through normal application logs and existing actor fields.
- No batch/job/event output is expected for this ticket.

## Ticket-Specific Constraints

- User Management is ADMIN-only.
- FE non-ADMIN screen access must redirect away and log out or otherwise deny access according to the current auth flow.
- BE direct API access from non-ADMIN users must return HTTP 403.
- `team_id = NULL` is intentional and must be preserved.
- Hard delete is forbidden.
- Optimistic locking / versioning should follow the current source contract if present in implementation; do not invent a separate team-based flow.
