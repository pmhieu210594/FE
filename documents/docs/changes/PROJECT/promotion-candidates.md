# Promotion Candidates

**Ticket ID**: PROJECT  
**Create date**: 2026-06-17  
**Author**: Codex  
**Update date**: 2026-06-17

## 1. Purpose

Record the Phase 9 promotion-triage decision for PROJECT. This file keeps only the smallest durable lessons worth considering for permanent docs and explicitly rejects ticket-local or one-off items that would create rule bloat.

## 2. Candidates to Make Durable

| Candidate ID | Candidate | Why promote | Minimum durable target | Status |
|---|---|---|---|---|
| PROJ-PROMOTE-01 | Separate executed evidence from artifact-only conclusions in closure docs | Prevents overstated verification claims and is clearly reusable across tickets | `docs/knowledge/` pattern | Promote |
| PROJ-PROMOTE-02 | Treat coarse auth denial proof as different from full auth-semantic proof | Prevents false closure when product intent references role data but runtime proof is narrower | `docs/maintenance/failure-mode-index.md` + `docs/knowledge/` | Promote |
| PROJ-PROMOTE-03 | Repeat ticket-specific contract deviations across spec, tests, review, and report artifacts | Prevents drift back toward nearby module defaults | `docs/maintenance/failure-mode-index.md` + `docs/knowledge/` | Promote |
| PROJ-PROMOTE-04 | Report missing external PR/CI evidence explicitly instead of implying it exists | Reusable closure hygiene for local-only evidence sets | `docs/knowledge/` pattern | Promote |

## 3. Candidates Not to Make Durable

| Candidate ID | Candidate | Reason not to promote | Keep where |
|---|---|---|---|
| PROJ-REJECT-01 | Unrelated FE backup/conflict files blocked build verification | Too environment-specific and too close to a one-off workspace hygiene issue to become a general rule | Ticket-local report and test-results only |
| PROJ-REJECT-02 | Playwright browser binaries were initially missing | Common environment setup issue, not a meaningful durable PROJECT lesson | Ticket-local test evidence only |
| PROJ-REJECT-03 | Project UI default page size `25` | Ticket-specific product/config detail, not a reusable cross-ticket standard | Ticket-local docs only |
| PROJ-REJECT-04 | No PROJECT-specific hosted PR/CI artifact existed locally | The reusable lesson is explicit absence reporting, not the absence itself | Promote the reporting pattern only |
| PROJ-REJECT-05 | Locale duplicate keys as a broad new rule | The durable part is validation awareness, not a large new localization rule set | Mention as knowledge note, avoid global rule expansion |

## 4. Failure Mode Candidates

| FMI candidate | Failure mode | Trigger | Prevention | Detection | Decision |
|---|---|---|---|---|---|
| FMI-PROJ-001 | Authorization is marked complete from coarse role-gate proof even though intended role-data semantics were not verified | Tests prove forbidden behavior for one runtime role shape, but product intent expects finer role-data semantics | Require an explicit auth-semantic review note when ticket intent references role tables or role-derived action policy | Final report/test-results show `PARTIAL` auth evidence or a pending human auth review item | Promote |
| FMI-PROJ-002 | Exception tickets drift back to nearby governance defaults during implementation or review | A feature intentionally deviates from neighboring modules, but later code/tests/docs copy the default pattern back in | Repeat approved deviations in spec, impl plan, tests, review checklist, and final report | Review/test artifacts show hidden `version`, wrong delete verb, or borrowed default contract shapes | Promote |
| FMI-PROJ-003 | Ticket closure implies external review/CI proof that is not locally available | Final report cites PR/CI confidence without a local artifact or explicit limitation note | Require closure docs to say "not found locally" when external review/CI evidence is absent | Final report lacks local evidence references for claimed PR/CI results | Promote |
| FMI-PROJ-004 | Workspace hygiene blocks feature verification | Unrelated local conflict or backup files break clean verification of the current feature | Keep as a candidate only, not yet durable, until recurrence is seen across more tickets | Build/test failure is unrelated to changed feature paths | Defer |

## 5. Knowledge / Pattern Candidates

| Knowledge candidate | Pattern | Why it matters | Target | Decision |
|---|---|---|---|---|
| KP-PROJ-001 | Closure docs should classify evidence as executed, artifact-based, or code-reading-only | Improves honesty and review speed in final handoff docs | New `docs/knowledge/project-management.md` entry | Promote |
| KP-PROJ-002 | Missing external PR/CI evidence should be stated explicitly in local final reports | Prevents accidental overclaiming during local-only review closure | New `docs/knowledge/project-management.md` entry | Promote |
| KP-PROJ-003 | Contract-deviation protection should appear in every major ticket artifact, not only the original spec | Reusable for exception tickets that intentionally diverge from adjacent modules | New `docs/knowledge/project-management.md` entry | Promote |
| KP-PROJ-004 | Auth proof should distinguish "denial behavior proved" from "full role semantics proved" | Useful in tickets where auth intent and runtime proof are not equivalent | New `docs/knowledge/project-management.md` entry | Promote |
| KP-PROJ-005 | Large rule/standards rewrites should be avoided when the evidence only supports a small corrective note | Prevents living-doc bloat | Keep as Phase 9 operating principle only | Keep local |

## 6. Permanent-doc Targets and Limits

| Destination | Proposed action | Why limited |
|---|---|---|
| `docs/maintenance/failure-mode-index.md` | Add only the three promoted failure modes that are clearly reusable | Small additive update fits the current index style |
| `docs/knowledge/` | Add one compact PROJECT knowledge note with reusable closure/auth/contract-drift patterns | Good fit for short durable lessons without changing repo-wide rules |
| `docs/standards/` | Do not edit in this ticket | Evidence does not justify broad permanent standards change |
| `.claude/rules/` | Do not edit in this ticket | Rules should stay very short and human approval bar is higher |
| `docs/architecture/` | Do not edit in this ticket | PROJECT surfaced closure/reporting lessons, not new architectural topology |

## 7. Stale Permanent-doc Areas to Flag

| Area | Observation | Proposed handling |
|---|---|---|
| `.claude/rules/30-security.md` | Still documents `ErrorResponse(... errorCode ...)`, which conflicts with observed current code and PROJECT reporting | Flag for targeted correction in a separate approved doc-maintenance pass |
| `docs/standards/testing.md` | Still contains older repo-state wording that new FE tests now partially supersede | Flag for later standards cleanup only if a broader testing-doc pass is approved |
| `docs/standards/review.md` | Assumes CI presence more strongly than some local ticket evidence can support | Flag for later review-doc cleanup if multiple tickets show the same mismatch |

## 8. Next-time Improvement Actions

| Action | Why | Target phase / owner |
|---|---|---|
| Add an explicit auth-semantic checkpoint to future ticket closure reviews | Would have made the AC-PROJECT-10 partial status easier to classify earlier | Future review/test/report phases |
| Add a compact closure-doc pattern for evidence classification and missing external evidence reporting | Reusable across future tickets with local-only evidence | Future docs process improvement |
| Recheck whether workspace-hygiene verification blockers recur on later tickets before promoting them permanently | Avoids turning one-off local issues into bloated general rules | Future ticket retrospectives |
| Run a separate approved cleanup pass for stale permanent docs such as `.claude/rules/30-security.md` | Important correction, but broader than PROJECT-only living-doc promotion | Human-approved docs maintenance follow-up |

## 9. Phase 9 Decision Summary

- Promote now:
  - auth-proof-vs-auth-semantic failure mode
  - contract-deviation drift failure mode
  - explicit absence-of-external-evidence failure mode
  - compact knowledge patterns for evidence classification, missing external evidence, contract-drift protection, and auth-proof framing
- Do not promote now:
  - one-off workspace conflict blocker
  - browser-install environment hiccup
  - ticket-specific page-size setting
- Defer for separate approval:
  - stale permanent-doc corrections in `.claude/rules/` and `docs/standards/`
