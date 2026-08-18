# Sources

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| LOGIN | `EDCAP_FE/documents/docs/changes/LOGIN` | Active | Internal username/password login MVP. |
| Root raw package | `docs/changes/LOGIN/raw` | Reviewed | Requirement and wireframe source. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement definition | `docs/changes/LOGIN/raw/requirement_login.md` | Reviewed | Primary | Business purpose, scope, validation, redirects, logout, safe errors, AC. |
| Wireframe | `docs/changes/LOGIN/raw/login-wireframe.md` | Reviewed | Primary | Login layout, fields, password toggle, optional Remember Me, error/status area. |
| Spec pack | `EDCAP_FE/documents/docs/changes/LOGIN/spec-pack.md` | Updated | Canonical | Normalized single source of truth. |
| Existing open issues | `EDCAP_FE/documents/docs/changes/LOGIN/open-issues.md` | Reviewed | Supporting | Prior unresolved decisions. |
| Human review | `EDCAP_FE/documents/docs/changes/LOGIN/human-review.md` | Reviewed | Supporting | No human verdict supplied. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| FE login page | `EDCAP_FE/src/pages/LoginPage.tsx` | Reviewed | Login form, disabled submit, password toggle, error mapping, redirect. |
| FE auth hook | `EDCAP_FE/src/hooks/useAuth.ts` | Reviewed | Current-user query and logout behavior. |
| FE API helper | `EDCAP_FE/src/lib/api.ts` | Reviewed | Auth DTOs, bearer token handling, endpoint helpers. |
| FE routing/layout | `EDCAP_FE/src/App.tsx`, `EDCAP_FE/src/components/Layout.tsx` | Reviewed | Route guards, landing, logout shell. |
| BE auth API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java`, `MeController.java` | Reviewed | Login/logout/current-user endpoints. |
| BE auth service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java`, `AuthTokenService.java` | Reviewed | Auth rules, token issue/parse, session behavior. |
| BE security | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java`, `web/security/BearerTokenAuthenticationFilter.java` | Reviewed | Stateless bearer auth and protected API behavior. |
| BE DTO/error | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java`, `web/exception/*` | Reviewed | Request/response/error contract. |
| DB migrations | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`, `V6__auth_token_session.sql` | Reviewed | Account and token-session schema. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| FE unit | `EDCAP_FE/src/__tests__/auth/LoginPage.test.tsx` | Reviewed | Login UI, errors, redirects. |
| FE hook | `EDCAP_FE/src/__tests__/auth/useAuth.test.tsx` | Reviewed | `authMe` and logout behavior. |
| FE E2E | `EDCAP_FE/e2e_tests/tests/login.spec.ts` | Reviewed | Mocked login journeys. |
| BE unit | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/governance/AuthServiceTest.java` | Reviewed | Login, inactive, failure. |
| BE unit | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/governance/AuthTokenServiceTest.java` | Reviewed | JWT issue/parse/expiry. |
| BE integration | `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/AuthApiIntegrationTest.java` | Reviewed | Login DTO, current-user compatibility, logout. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Local office/reference markdown | Use only for platform-level assumptions | No web lookup performed. |
| Downloaded Vietnamese SDD file | Local external file | Not read in Phase 1/2 because not in workspace source pack | Mentioned in IDE tabs only. |

## Excluded Sources

| source/path | reason |
|---|---|
| `.claude/rules/`, `EDCAP_FE/.claude/rules/` | Not found in workspace. |
| Production secrets, `.env`, logs | Sensitive and not required. |
| OAuth provider implementation details | Out of LOGIN MVP except as stale-context warning. |

## Source Limitations

- Some architecture/standards docs still describe older OAuth/session-cookie assumptions.
- Terminal output may show mojibake for Vietnamese/Japanese strings; verify with UTF-8-aware editor.
- Human review verdict and meeting memo are not supplied.
- FE and root LOGIN documentation trees can drift.

## Assumptions from Sources

- Username/password is the primary MVP method.
- Bearer JWT plus token-session persistence is the current auth implementation.
- `/api/v1/auth/me` is canonical and `/api/v1/me` is compatibility.
- Current refresh token behavior exists but policy is still open.

## Human Confirmation Required

- Refresh-token MVP policy.
- Non-admin landing route.
- Email exposure policy.
- `returnUrl` requirement and allowlist.
- Username case-sensitivity.
- Audit logging requirement.
- Production token-storage posture.
