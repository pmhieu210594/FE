# Promotion Candidates

**Ticket ID**: ROLE  
**Phase**: Phase 9 - Living Docs / Failure Mode Update  
**Create date**: 2026-06-10  
**Author**: Codex  
**Update date**: 2026-06-15  
**Status**: Recommendation ledger only; no permanent-doc update without human approval

## 1. Candidates That Should Be Permanentized

| ID | candidate | recommended destination | why it is worth keeping | approval needed |
|---|---|---|---|---|
| PC-ROLE-001 | Verify FE route/nav gating against canonical RBAC during review, not only BE authorization | `documents/docs/standards/security.md` and/or SDD review guidance | This has repeat-prevention value across admin/master-data tickets and directly guards against UX/security drift | Yes |
| PC-ROLE-002 | Preserve final review/CI/manual-evidence references locally when Phase 8 depends on them | `documents/docs/standards/testing.md` | This is a cross-ticket reporting reliability issue, not a ROLE-only detail | Yes |
| PC-ROLE-003 | Treat raw list + FE-side pagination as an explicit contract pattern when selected by spec | `documents/docs/knowledge/` or architecture contract map | Useful as a reusable FE/BE contract pattern for admin CRUD screens | Yes |
| PC-ROLE-004 | Require explicit evidence for logical-delete duplicate-candidate exclusion, not just list exclusion | `documents/docs/standards/testing.md` and `failure-mode-index.md` | Prevents a subtle recurrence where soft-delete appears correct but duplicate logic is still wrong | Yes |
| PC-ROLE-005 | Clarify logical-delete success-response policy for CRUD master-data endpoints | `documents/docs/standards/api-contract.md` | ROLE needed explicit alignment on delete returning updated DTO rather than an implicit success-message convention | Yes |

## 2. Candidates That Should Not Be Permanentized

| ID | item | reason not to permanentize |
|---|---|---|
| NP-ROLE-001 | ROLE-specific copy strings and wording | Too ticket-local; not a general reusable rule or standard |
| NP-ROLE-002 | The one-time recovery sequence for missing review artifacts | This was a process correction, not a stable general rule worth encoding permanently |
| NP-ROLE-003 | The exact ROLE endpoint family or field names as a generic rule | That belongs to ROLE ticket docs or approved architecture maps, not a global standard by default |
| NP-ROLE-004 | The fact that review evidence matured late in this ticket | One occurrence is not enough to justify a permanent process rule by itself |
| NP-ROLE-005 | Long procedural detail about how to backfill ticket artifacts | Too detailed for rules; if reused later, it belongs in knowledge, not standards/rules |

## 3. Failure Mode Candidates

| ID | failure mode | trigger | prevention | detection | destination |
|---|---|---|---|---|---|
| FM-ROLE-001 | FE route/nav behavior drifts from canonical RBAC while BE enforcement remains correct | FE route or menu changes are made without a matching RBAC verification pass | Add explicit FE route/nav vs canonical RBAC checks in review and tests | Route/nav tests and review checklist catch mismatch | `documents/docs/maintenance/failure-mode-index.md` |
| FM-ROLE-002 | Logical-delete behavior looks correct in list queries but duplicate checks still consider deleted rows | Soft-delete is implemented incompletely across query paths | Require explicit duplicate-ignore-deleted evidence in service/persistence tests | Create/update duplicate tests fail only when deleted-row candidate is exercised | `documents/docs/maintenance/failure-mode-index.md` |
| FM-ROLE-003 | Final-report confidence is overstated because hosted CI / PR / manual black-box evidence is not preserved locally | Phase 8 relies on memory or external systems instead of local artifacts | Preserve evidence references locally or state the limitation explicitly | Final report or review artifacts cannot cite local evidence | `documents/docs/maintenance/failure-mode-index.md` |
| FM-ROLE-004 | Skeleton artifacts create a false green signal after implementation/test work has moved on | Placeholder docs are left untouched while source and evidence evolve | Require evidence-based refresh before phase close | Review finds skeleton wording or stale placeholders in late phases | `documents/docs/maintenance/failure-mode-index.md` |

## 4. Knowledge / Pattern Candidates

| ID | pattern | why it matters | where to reuse | destination |
|---|---|---|---|---|
| KP-ROLE-001 | Raw list response with FE-side pagination must be called out explicitly in both contract and tests | Prevents FE/BE mismatch over `totalCount`, page metadata, and slicing ownership | Admin/master-data list features | `documents/docs/knowledge/` |
| KP-ROLE-002 | Logical delete needs two separate proofs: active-list exclusion and duplicate-candidate exclusion | Teams often verify only one half of soft-delete correctness | Any soft-delete master-data feature | `documents/docs/knowledge/` |
| KP-ROLE-003 | Final reporting is stronger when test evidence, self-review, AI review, and human review form an explicit artifact chain | Reduces ambiguity at release/signoff time | Any SDD ticket closing flow | `documents/docs/knowledge/` or `documents/docs/standards/testing.md` |
| KP-ROLE-004 | FE UX gating and BE security enforcement should be reviewed together, not separately | Prevents "secure but broken UX" or "visible but unauthorized" drift | Any role-gated FE/BE feature | `documents/docs/knowledge/` or `documents/docs/standards/security.md` |

## 5. Next-Time Improvement Actions

| ID | action | expected benefit | promote now? |
|---|---|---|---|
| AI-ROLE-001 | Add local references to hosted CI / PR discussion when they materially affect final reporting | Stronger Phase 8 traceability | Recommendation only |
| AI-ROLE-002 | Record manual execution outcomes for Phase 7 black-box package when they exist | Better closure between black-box readiness and real execution | Recommendation only |
| AI-ROLE-003 | Refresh `self-review.md` before final report instead of recovering it later | Cleaner review chain and less report rework | Recommendation only |
| AI-ROLE-004 | Keep failure-mode candidates short and move explanation into knowledge/standards only if reused | Avoids rule bloat | Recommendation only |

## 6. Destination Guidance

| destination | what belongs there | what should not go there |
|---|---|---|
| `documents/docs/maintenance/failure-mode-index.md` | Short recurring incident-prevention rows | Ticket history or long explanations |
| `documents/docs/knowledge/` | Reusable patterns and examples | Hard requirements or long process scripts |
| `documents/docs/standards/` | Stable team expectations with repeated value | One-off ticket fixes |
| `documents/.claude/rules/` | Short high-signal rules only | Detailed examples or long rationale |
| `documents/docs/architecture/` | Durable FE/BE/DB contract or mapping knowledge | Temporary ticket state |

## Assumptions

| ID | assumption | reason |
|---|---|---|
| PC-ROLE-ASM-001 | Recommendation-first is the correct Phase 9 default unless a human has already approved permanent-doc edits | Matches the "do not rewrite permanent docs without approval" constraint |
| PC-ROLE-ASM-002 | Existing permanent docs already provide suitable destinations, so no new permanent-doc file is needed for ROLE lessons | Keeps the knowledge surface minimal |

## Human Approval Required

- No permanent-doc update should be applied from this ticket until the relevant owner approves the selected candidates.
- Phase 9 for ROLE is complete as a recommendation ledger without directly editing standards, architecture docs, rules, failure-mode index, or knowledge docs.
