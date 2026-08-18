# Reference Extracts

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11

## Source List

| ID | Source | Notes |
|---|---|---|
| SRC-01 | `docs/changes/LOGIN/raw/requirement_login.md` | Primary requirement for username/password login. |
| SRC-02 | `docs/changes/LOGIN/raw/login-wireframe.md` | Login screen layout and interaction notes. |
| SRC-03 | `docs/changes/LOGIN/spec-pack.md` | Accepted scope, AC, API, and security behavior. |
| SRC-04 | `docs/changes/LOGIN/impl-plan.md` | Planned FE/BE files, policy, and verification approach. |
| SRC-05 | `docs/changes/LOGIN/test-plan.md` | UT/IT/E2E mapping. |
| SRC-06 | `docs/changes/LOGIN/report.md` | Final package summary and remaining risks. |

## Extracted Facts

- Internal username/password login replaces the current OAuth/session-centered behavior for this MVP.
- `tbl_auth_user_account` is the source for username, password hash/algo, and active status.
- Backend must issue bearer access tokens and protect APIs via bearer auth.
- Login failures must use safe generic errors and preserve traceability without leaking secrets.
- Remember Me and forgot-password are not active MVP functions.

## Extracted Questions

- Should logout revoke JWTs server-side?
- Should a dedicated `/home` route be created for non-admin users?
- Should email be included in all login/me payloads?

## Items Not Promoted to Spec

- Google/SSO/OAuth login.
- MFA.
- Refresh-token flow.
- Formal audit logging.
- Self-service password reset.

## Human Review Notes

No separate human review note was provided in this workspace. The open decisions remain documented in `open-issues.md`.
