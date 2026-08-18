# Raw Input

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11

## Ticket Body

Create the LOGIN ticket documentation set under `EDCAP_FE/documents/docs/changes/LOGIN` by merging all artifacts from `_ticket-template` and the existing LOGIN materials from `docs/changes/LOGIN`.

## Requirement Notes

- Primary login method: username/password.
- Login API: `POST /api/v1/auth/login`.
- Logout API: `POST /api/v1/auth/logout`.
- Current-user APIs: `GET /api/v1/auth/me` and compatibility `GET /api/v1/me`.
- Admin redirect: `/:lang/admin`.
- Non-admin redirect: temporary `/:lang/` unless a real home route is confirmed.
- Failed login should return a safe generic error without exposing account state.
- Access-token TTL: 60 minutes by default.

## Meeting Notes

No separate meeting notes were supplied in this workspace. Decisions were taken from the existing LOGIN documentation package.

## Customer Comments

The user requested that the LOGIN documents be read and that all `_ticket-template` files be combined into the FE LOGIN change folder.

## Raw References

- `docs/changes/LOGIN/raw/requirement_login.md`
- `docs/changes/LOGIN/raw/login-wireframe.md`
- `docs/changes/LOGIN/spec-pack.md`
- `docs/changes/LOGIN/impl-plan.md`
- `docs/changes/LOGIN/test-plan.md`
- `docs/changes/LOGIN/report.md`

## Notes

For files that already existed in `docs/changes/LOGIN`, the richer LOGIN-specific document was copied into the FE change folder. Template-only files were initialized with LOGIN metadata and ticket-specific summaries.
