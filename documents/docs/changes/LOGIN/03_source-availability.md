# Source Availability

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Source mới nhất | `EDCAP_FE/documents/docs/changes/LOGIN/spec-pack.md` | read | high | Ticket owner | Canonical AC, scope, open issues | Drift if root docs differ | always-read |
| Ticket context/rules | `EDCAP_FE/documents/docs/changes/LOGIN/context.md`, `ticket-rules.md` | read | high | Ticket owner | Implementation boundary, allowed/forbidden methods | Must stay template-aligned | always-read |
| Requirement/wireframe | `docs/changes/LOGIN/raw/requirement_login.md`, `docs/changes/LOGIN/raw/login-wireframe.md` | read | high | Product/BA | Original intent and UI states | Raw docs can be less precise than spec-pack | verify-with-spec |
| FE source | `EDCAP_FE/src/pages/LoginPage.tsx`, `src/hooks/useAuth.ts`, `src/lib/api.ts`, `src/App.tsx`, `src/components/Layout.tsx`, `src/utils/variable.ts` | read | high | FE | Target implementation impact | `router.tsx`/legacy constants may confuse future edits | always-read |
| BE source | `EDCAP_BE/src/main/java/com/sdd/platform/...` auth/security/rest/dto/exception files | read | high | BE | API, auth business rules, security filter, errors | Must follow layer boundaries | always-read |
| DB definition | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`, `V6__auth_token_session.sql` | read | high | BE/DB | Account and token-session mapping | Do not edit old migrations | required-if-db |
| API spec | Source controllers + `Dtos.java` | read | high | BE/API | Contract source of truth | Generated OpenAPI not verified at runtime | verify-with-source |
| Existing tests | FE auth tests, Playwright login test, BE auth service/token/API tests | read | high | QA/Dev | Coverage and future verification targets | Tests not rerun in Phase 3 docs | always-read |
| Architecture docs | `EDCAP_FE/documents/docs/architecture/`, `EDCAP_BE/documents/docs/architecture/` | partial | medium | Architecture | System/layer context | Some stale OAuth/session content | use-with-warning |
| Standards docs | `EDCAP_FE/documents/docs/standards/`, `EDCAP_BE/documents/docs/standards/` | partial | medium | Engineering | Security/API/testing rules | Some auth guidance stale | use-with-warning |
| `.claude/rules` | `.claude/rules/`, `EDCAP_FE/.claude/rules/` | unavailable | low | N/A | Local agent rules | Not found | note-unavailable |
| Nguyên bản Excel/PPT/PDF | IDE-tab local download path | not-read | medium | External doc owner | Possible supporting SDD details | Outside workspace/source pack | extract-first-if-needed |
| Web/Repo ngoài | N/A | not-read | variable | N/A | Not required | Network/currentness risk | human-intake |

## Summary

Sources are sufficient for Phase 3 impact analysis and implementation planning. The canonical source for LOGIN is `spec-pack.md`, supported by `context.md` and `ticket-rules.md`. Current FE/BE/DB source confirms the username/password bearer-token MVP already has concrete implementation surfaces.

The requested artifact name `source-availability.md` does not exist in `_ticket-template`; the template-equivalent file is `03_source-availability.md`, so this file is updated.

## Unavailable / Partial Sources

- `.claude/rules/` and `EDCAP_FE/.claude/rules/` were not found.
- No final human review verdict or meeting memo is supplied.
- Generated OpenAPI was not verified at runtime; controllers and DTOs are used as API source of truth.
- Production secrets, `.env`, production logs, and real credentials were intentionally not read.
- Architecture/standards docs are partially stale around OAuth/session-cookie auth; use LOGIN source and spec-pack first.

## Risk Before Implementation

- Refresh-token response/storage exists, but active refresh flow policy is open.
- FE localStorage token persistence conflicts with older security guidance and needs security decision before production hardening.
- Non-admin landing, email exposure, `returnUrl`, username case-sensitivity, and audit logging remain open.
- Future implementers may read stale root or architecture docs unless they follow source-of-truth order.

## Required Human Decision

- HD-LOGIN-001 refresh-token MVP policy.
- HD-LOGIN-002 non-admin landing route.
- HD-LOGIN-003 email exposure in auth payload/JWT.
- HD-LOGIN-004 `returnUrl` requirement and allowlist.
- HD-LOGIN-005 username case-sensitivity.
- HD-LOGIN-006 formal audit logging.
- HD-LOGIN-007 production token storage posture.
- Documentation owner decision on root vs FE LOGIN canonical sync.
