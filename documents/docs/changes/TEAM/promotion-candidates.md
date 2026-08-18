# Promotion Candidates

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-TEAM-001 | Final TEAM AC traceability and residual-risk summary | `docs/changes/TEAM/self-review.md` | Keeps the final implementation-to-AC mapping and open risk notes easy to reuse. | High |
| LD-TEAM-002 | Final TEAM test evidence summary | `docs/changes/TEAM/test-results.md` | Captures the record of executed commands, counts, and residual release risk in one place. | High |
| LD-TEAM-003 | TEAM black-box scenario set | `docs/changes/TEAM/blackbox-testcases.md` | Reusable AC-driven black-box coverage for later regression runs. | High |
| LD-TEAM-004 | TEAM test data policy and synthetic fixtures | `docs/changes/TEAM/test-data.md` | Reusable deterministic data policy for future TEAM verification. | Medium |
| LD-TEAM-005 | TEAM review checklist | `docs/changes/TEAM/review-checklist.md` | Helps future reviewers verify the same AC/security/DB checks consistently. | Medium |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| RL-TEAM-001 | ADMIN authorization must be enforced in both FE route guard and BE service/API | `docs/standards/` security / app guidance | TEAM reaffirms that menu hiding alone is not enough. | Low |
| RL-TEAM-002 | Team Code uniqueness must be treated as an active-scope business rule and tested explicitly | `docs/standards/database.md` / `docs/standards/testing.md` | Prevents future regressions around duplicate active Team Code handling. | Low |
| RL-TEAM-003 | Soft delete/inactivate is the default removal pattern for Team membership data | `docs/standards/database.md` | Aligns future master-data features with the TEAM deletion model. | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| ST-TEAM-001 | Clarify how admin-only CRUD pages should pair FE route guards with BE authorization checks | `docs/standards/architecture.md` or auth guidance | TEAM used the same pattern successfully and it is worth making explicit. |
| ST-TEAM-002 | Clarify test evidence expectations for combined automated + black-box verification | `docs/standards/testing.md` | This ticket now has a useful combined-pass evidence model. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| AR-TEAM-001 | Add a note for Team-Member-Role relation modeled through a dedicated join table | `docs/standards/database.md` | Reinforces the membership-relational design and one-active-role rule. |
| AR-TEAM-002 | Add a note on safe treatment of legacy columns when a new relation table supersedes them | `docs/standards/database.md` | Useful for future migrations that replace direct foreign-key fields. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-TEAM-001 | Duplicate active Team Code | Create/update attempts with an already active code | Service duplicate check plus DB active-scope uniqueness | Unit, integration, and black-box duplicate-code tests |
| FMI-TEAM-002 | Stale Team or Team-Member version conflict | Concurrent update/delete on the same Team or membership | Optimistic locking / conflict handling | Conflict tests and API error mapping |
| FMI-TEAM-003 | Invalid member/role lookup options | Add-member form loads missing/inactive members or roles | Read-only lookup validation and UI filtering | Add-member negative tests and lookup tests |
| FMI-TEAM-004 | Unsafe `tbl_dim_team.project_id` handling | Destructive migration or hidden dependency on legacy column | Dependency check before schema removal | Migration review and runtime rollout verification |
| FMI-TEAM-005 | Locale key drift or mojibake | Missing `en`/`vi`/`ja` key or encoding regression | Locale key review and UTF-8 discipline | Locale build/test and manual UI check |

## Not Promoted

| item | reason |
|---|---|
| Generic member master CRUD from Team detail | Explicitly out of scope for this ticket. |
| Team-Project assignment flow | Explicitly out of scope for this ticket. |
| Dedicated Team audit-log module | Explicitly out of scope for this ticket. |
| Full new global lookup subsystem | Team only needed minimal read-only lookup support, not a broad master-management expansion. |

## Human Approval Required

None at this phase. Final review and release sign-off remain separate from this promotion-candidate list.
