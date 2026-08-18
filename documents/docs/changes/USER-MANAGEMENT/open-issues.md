# Open Issues

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

| ID | issue | phase | impact | severity | owner | due date | status |
|---|---|---|---|---|---|---|---|
| OI-USER-MANAGEMENT-1 | FE password policy is stricter than BE validation. | Documentation / Release | Potential UX/API mismatch if direct API calls are used. | Major | FE/BE/Security | Current release | Accepted Risk |
| OI-USER-MANAGEMENT-2 | Formal audit log for account admin operations. | Future phase | Compliance/operation enhancement only. | Minor | Product/Security | Future phase | Deferred |

## Blockers

- None recorded in the corrected documentation set.

## Questions

- Should FE and BE password validation be made identical before release?

## Pending Human Decisions

- None. Password policy parity is accepted as a risk for the current MVP.
- No additional documentation rewrite is required for this ticket.

## Accepted but Unresolved Items

- Formal audit logging remains out of scope for this ticket.
- Team assignment remains out of scope and `team_id = NULL` is intentional.

## Resolution Log

- 2026-06-15: Template normalization completed for core USER-MANAGEMENT docs.
