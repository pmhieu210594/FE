# Implementation Plan

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

## 1. Implementation Principle

- Implement only documentation normalization in this pass; do not change runtime FE/BE/DB code.
- Keep the USER-MANAGEMENT scope centered on login accounts, linked member pseudonym data, and ADMIN-only access.
- Keep `team_id = NULL` intentional and documented.
- Keep hard delete out of scope.
- Keep bcrypt, sensitive-field suppression, and last active ADMIN protection documented consistently.
- Use the template family already used by `ORGANIZATION` and `_ticket-template`.
- Preserve traceability between `spec-pack.md`, black-box files, review docs, and source inventory.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| DOC-A | Leave USER-MANAGEMENT files in mixed outline format | Less immediate edit work | Continues template drift and makes review harder | Reject |
| DOC-B | Rewrite only a few high-visibility docs | Faster partial fix | Leaves inconsistent folder shape | Reject |
| DOC-C | Normalize the key USER-MANAGEMENT docs to the shared template family | Clear, consistent, reviewable | Requires editing many files | Select |

## 3. Reason for Choosing the Alternative Plan

The selected approach matches the user request and minimizes future confusion:

- The folder now reads like the `ORGANIZATION` folder and the shared ticket template family.
- Template drift is reduced, which improves review and handoff clarity.
- The current source/test intent is preserved without changing business scope.

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `00_brainstorm.md` | Template-normalized brainstorm | Match folder structure | AC-USER-MANAGEMENT-1..23 |
| `context.md` | Template-normalized context | Match folder structure | AC-USER-MANAGEMENT-1..23 |
| `blackbox-review-checklist.md` | Template-normalized review checklist | Review traceability | AC-USER-MANAGEMENT-1..23 |
| `blackbox-testcases.md` | Template-normalized black-box cases | Test traceability | AC-USER-MANAGEMENT-1..23 |
| `sources.md` | Template-normalized sources inventory | Source traceability | AC-USER-MANAGEMENT-1..23 |
| `source-inventory.md` | Template-normalized source inventory | Source traceability | AC-USER-MANAGEMENT-1..23 |
| `source-map.md` | Template-normalized source map | Traceability | AC-USER-MANAGEMENT-1..23 |
| `test-data.md` | Template-normalized test data | Test traceability | AC-USER-MANAGEMENT-1..23 |
| `test-plan.md` | Template-normalized test plan | Coverage traceability | AC-USER-MANAGEMENT-1..23 |
| `test-results.md` | Template-normalized test results | Evidence tracking | AC-USER-MANAGEMENT-1..23 |
| `review-checklist.md` | PASS/PENDING replacement | Remove placeholder statuses | AC-USER-MANAGEMENT-1..23 |
| `self-review.md` | Template-normalized self review | Review traceability | AC-USER-MANAGEMENT-1..23 |
| `human-review.md` | Template-normalized human review | Final review traceability | AC-USER-MANAGEMENT-1..23 |
| `impact-analysis.md` | Template-normalized impact analysis | Impact traceability | AC-USER-MANAGEMENT-1..23 |
| `impl-plan.md` | Template-normalized implementation plan | Documentation plan | AC-USER-MANAGEMENT-1..23 |
| `open-issues.md` | Template-normalized open issues | Issue tracking | AC-USER-MANAGEMENT-1..23 |
| `phase-status.md` | Template-normalized phase status | Progress tracking | AC-USER-MANAGEMENT-1..23 |
| `promotion-candidates.md` | Template-normalized promotion candidates | Future doc candidates | AC-USER-MANAGEMENT-1..23 |
| `report.md` | Template-normalized report | Final wrap-up | AC-USER-MANAGEMENT-1..23 |
| `ticket-rules.md` | Template-normalized ticket rules | Guardrails | AC-USER-MANAGEMENT-1..23 |

## 5. Class / Function / Method to Add or Modify

No runtime classes or functions are added in this pass.

## 6. SQL / Query / Repository Policy

- No SQL changes are part of this pass.
- No repository or mapper changes are part of this pass.
- Documentation should continue to describe `team_id = NULL` and no hard delete.

## 7. Validation / Error / Logging Policy

- Keep ADMIN-only, bcrypt, and sensitive-field rules documented.
- Keep safe error/traceId wording documented.
- Keep FE/BE password-policy mismatch recorded as an open issue if unresolved.

## 8. Migration / Rollback Policy

- No migration is required for this pass.
- Rollback is a documentation revert only.

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Normalize high-level structure | `context.md`, `sources.md`, `source-map.md` | Files use template shape | Stop if scope changes |
| 2 | Normalize review/test artifacts | `blackbox-*`, `review-checklist.md`, `self-review.md` | ACs and statuses align | Stop if placeholder remains where a decision is already known |
| 3 | Normalize tracking/docs | `open-issues.md`, `phase-status.md`, `promotion-candidates.md` | Statuses are explicit | Stop if template shape diverges |
| 4 | Normalize closure docs | `report.md`, `human-review.md`, `test-results.md` | Final status is explicit | Stop if runtime evidence is fabricated |

## 10. How to Verify Each Step

| step | verification | expected result |
|---|---|---|
| 1 | Read back files | Headers/sections match the template family. |
| 2 | Cross-check AC IDs | `AC-USER-MANAGEMENT-*` are consistent. |
| 3 | Check placeholders | Closed decisions replaced with explicit statuses. |
| 4 | Check evidence status | Runtime work is not claimed as executed. |

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-USER-MANAGEMENT-1..23 | Documentation only in this pass | Cross-file consistency and explicit status notes |

## 12. Stop / Ask Condition

- Stop if any edit would change the business scope rather than the documentation shape.
- Stop if a file would require a runtime claim that was not executed.
- Ask if password-policy parity should be promoted from open issue to release blocker.

## 13. Do Not Do This Ticket

- Do not change runtime FE/BE/DB source in this pass.
- Do not imply runtime tests were executed when they were not.
- Do not reintroduce team assignment or hard delete.
- Do not remove the password-policy open issue without a decision.

## 14. Open Related Issues

| ID | issue | impact | proposed action |
|---|---|---|---|
| OI-USER-MANAGEMENT-1 | FE and BE password policy mismatch | Possible direct API/UI divergence | Decide before release |
| OI-USER-MANAGEMENT-2 | Formal audit logging out of scope | Future compliance enhancement | Keep deferred unless promoted |
