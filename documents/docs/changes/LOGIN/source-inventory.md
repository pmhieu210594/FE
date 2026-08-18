# Source Inventory

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Spec | `EDCAP_FE/documents/docs/changes/LOGIN/spec-pack.md` | Markdown | Ticket owner | read | Canonical AC and scope. |
| Context | `EDCAP_FE/documents/docs/changes/LOGIN/context.md` | Markdown | Ticket owner | read | Implementation map and method boundaries. |
| Rules | `EDCAP_FE/documents/docs/changes/LOGIN/ticket-rules.md` | Markdown | Ticket owner | read | Stop/ask and forbidden paths. |
| FE page | `EDCAP_FE/src/pages/LoginPage.tsx` | TSX | FE | read | Directly affected; login UI and mutation. |
| FE auth | `EDCAP_FE/src/hooks/useAuth.ts` | TS | FE | read | Directly affected; current-user/logout auth state. |
| FE API | `EDCAP_FE/src/lib/api.ts` | TS | FE | read | Directly affected; endpoint DTOs and bearer token. |
| FE route | `EDCAP_FE/src/App.tsx` | TSX | FE | read | Directly affected; route guards and landing. |
| FE shell | `EDCAP_FE/src/components/Layout.tsx` | TSX | FE | read | Indirect/direct; logout and user display. |
| FE constants | `EDCAP_FE/src/utils/variable.ts` | TS | FE | read | Indirect; token keys and legacy `C_API.Login`. |
| FE router legacy | `EDCAP_FE/src/router.tsx` | TSX | FE | read | Indirect; avoid stale auth assumptions. |
| FE locales | `EDCAP_FE/public/locales/{en,vi,ja}/locale.json` | JSON | FE/i18n | referenced | Direct if user-visible text changes. |
| BE auth API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` | Java | BE | read | Direct; login/logout endpoints. |
| BE current user | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | Java | BE | read | Direct; `/auth/me` and `/me`. |
| BE service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java` | Java | BE | read | Direct; auth business rules. |
| BE token | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthTokenService.java` | Java | BE | read | Direct; JWT/refresh/hash behavior. |
| BE security | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Java | BE | read | Direct; stateless bearer security. |
| BE filter | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilter.java` | Java | BE | read | Direct; active token-session check. |
| BE DTO | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | Java | BE/API | read | Direct; request/response validation. |
| BE errors | `GlobalExceptionHandler.java`, `ErrorResponse.java` | Java | BE/API | read | Direct; safe error shape/codes. |
| DB account | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | SQL | DB | read targeted | Direct mapping; do not edit. |
| DB token session | `EDCAP_BE/src/main/resources/db/migration/V6__auth_token_session.sql` | SQL | DB | read | Direct mapping; do not edit. |
| FE tests | `EDCAP_FE/src/__tests__/auth/*.test.tsx`, `src/__tests__/lib/api.test.ts` | Test | QA/FE | read | Direct verification target. |
| E2E tests | `EDCAP_FE/e2e_tests/tests/login.spec.ts` | Test | QA/FE | read | Direct verification target. |
| BE tests | `AuthServiceTest.java`, `AuthTokenServiceTest.java`, `AuthApiIntegrationTest.java` | Test | QA/BE | read | Direct verification target. |
| Architecture | `EDCAP_FE/documents/docs/architecture/`, `EDCAP_BE/documents/docs/architecture/` | Markdown | Architecture | partial | Use for context only; stale auth parts exist. |
| Standards | `EDCAP_FE/documents/docs/standards/`, `EDCAP_BE/documents/docs/standards/` | Markdown | Engineering | partial | Use with stale-auth warning. |

## Important Files

- `EDCAP_FE/documents/docs/changes/LOGIN/spec-pack.md`
- `EDCAP_FE/documents/docs/changes/LOGIN/context.md`
- `EDCAP_FE/documents/docs/changes/LOGIN/ticket-rules.md`
- `EDCAP_FE/src/pages/LoginPage.tsx`
- `EDCAP_FE/src/hooks/useAuth.ts`
- `EDCAP_FE/src/lib/api.ts`
- `EDCAP_FE/src/App.tsx`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthTokenService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/security/BearerTokenAuthenticationFilter.java`
- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`
- `EDCAP_BE/src/main/resources/db/migration/V6__auth_token_session.sql`

## Generated / Excluded Files

- `node_modules`, build outputs, coverage reports, Maven/Java build outputs.
- `.env`, production logs, secrets, real credentials.
- Unrelated change folders except where used as template examples.
- OAuth provider internals are excluded from implementation scope.

## Missing Files

- `.claude/rules/` and `EDCAP_FE/.claude/rules/` not found.
- No standalone meeting memo found.
- No final human review verdict found.
- No template file named `source-availability.md`; template uses `03_source-availability.md`.
