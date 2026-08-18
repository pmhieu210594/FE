# Open Issues

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11

## Blockers

- None for documentation merge.

## Questions

| ID | Question | Impact |
|---|---|---|
| OI-LOGIN-006 | Logout also revokes JWTs server-side for MVP. | May require token revocation storage or blacklist behavior. |
| OI-LOGIN-007 | The temporary `/:lang/` non-admin landing stays in scope. | Affects FE routing and E2E expectations. |
| OI-LOGIN-008 | The login/me response exposes email in auth payloads for MVP. | Affects API payload and privacy rules. |

## Pending Human Decisions

- None. The three LOGIN MVP decisions are finalized.

## Accepted but Unresolved Items

- Some black-box boundary cases may remain planned rather than directly evidenced, including overlength username handling.

## Resolution Log

- 2026-06-11: Created FE change-folder open-issues artifact from the existing LOGIN report and implementation plan.
- 2026-06-17: Human review finalized logout revoke, non-admin landing, email exposure, and canonical documentation sync policy.
