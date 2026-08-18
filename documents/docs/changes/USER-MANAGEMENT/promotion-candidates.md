# Promotion Candidates

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| L-USER-MANAGEMENT-1 | Template source selection rule | docs standards / ticket template notes | Avoid FE vs BE template mismatch in future tickets. | High |
| L-USER-MANAGEMENT-2 | Password policy parity note | security / testing docs | FE and BE password rules can drift. | Medium |
| L-USER-MANAGEMENT-3 | Team-scope exclusion note | ticket rules / source map | Prevent `team_id` drift from reappearing. | High |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| R-USER-MANAGEMENT-1 | Do not leave placeholder statuses where a closed decision exists. | ticket review/self-review docs | Keeps docs reviewable and reduces ambiguity. | Low |
| R-USER-MANAGEMENT-2 | Mark runtime work as `NOT_RUN` when docs-only correction is done. | test-results/report | Makes status explicit. | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| S-USER-MANAGEMENT-1 | Use the same template family across a ticket folder. | doc standards | Prevent partial template drift. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| A-USER-MANAGEMENT-1 | Add account-management route/API source map note | architecture docs | Helpful if USER-MANAGEMENT implementation is referenced later. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| F-USER-MANAGEMENT-1 | Template drift between folders | Copying from the wrong base file | Always compare against template/reference docs first | File diff check against template |
| F-USER-MANAGEMENT-2 | Password policy mismatch | FE and BE rules diverge | Record open issue and confirm policy early | Review `open-issues.md` / test failures |
| F-USER-MANAGEMENT-3 | Team scope regression | Reintroducing team fields | Keep `team_id = NULL` in rules and tests | Review and AC mismatch |

## Not Promoted

| item | reason |
|---|---|
| Any runtime code change | This pass is documentation-only. |
| Any schema migration | No code/schema change requested in this step. |

## Human Approval Required

- Confirm whether the remaining docs in `USER-MANAGEMENT` should also be normalized to the same template style.
