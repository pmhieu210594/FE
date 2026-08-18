# Promotion Candidates

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC
**Create date**: 2026-06-23
**Author**: OpenAI
**Update date**: 2026-06-23

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-01 | Final traceability contract | `context.md` | The implemented route, API shape, and read-only behavior are now confirmed by code and tests. | High |
| LD-02 | Completion flow and stop conditions | `impl-plan.md` | The phase ended with a working contract, so the implementation sequence can be tightened for the next similar ticket. | Medium |
| LD-03 | Traceability test matrix | `test-plan.md` | The BE/FE/black-box coverage pattern is now reusable for similar read-only evidence screens. | High |
| LD-04 | Stable black-box coverage set | `blackbox-testcases.md` | The normal/error/boundary/permission matrix is reusable as a template for future traceability-like tickets. | High |
| LD-05 | Final implementation learnings | `self-review.md` | The resolved assertion and SQL issues are useful examples for future implementation reviews. | High |
| LD-06 | Final release evidence | `report.md` | The final report should remain the single-entry summary for future explainability. | High |
| LD-07 | Execution evidence | `test-results.md` | The exact commands and outcomes are valuable as a reusable release evidence pattern. | High |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| R-01 | Do not count commits in completeness | `ticket-rules.md` | This rule was central to the ticket and should be easy to find in future traceability work. | Low |
| R-02 | Traceability view must stay read-only | `ticket-rules.md` | Prevents regression into edit/delete/repair behavior. | Low |
| R-03 | Missing evidence must remain visible | `ticket-rules.md` | Keeps partial traceability explicit instead of hidden. | Low |
| R-04 | Use approved severity values only | `ticket-rules.md` | Avoids enum drift for broken-link handling. | Low |
| R-05 | Reuse existing `tbl_` tables only | `ticket-rules.md` | Reinforces the no-schema-expansion constraint. | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| S-01 | Final report structure for read-only FE/BE tickets | `_ticket-template/report.md` | This ticket shows a good pattern for overview, AC mapping, impact, risk, and learning capture. |
| S-02 | Test-results evidence layout | `_ticket-template/test-results.md` | The final command/result format is reusable for release evidence. |
| S-03 | Review-to-bug-triage loop | `_ticket-template/self-review.md` | Capturing small implementation fixes in a dedicated table helps future audits. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| A-01 | Traceability route and API map | `route-api-map.md` | `/traceability` and `GET /api/v1/traceability/{ticketId}` are now real and should be recorded. |
| A-02 | Traceability read service boundary | `service-layer-map.md` | The dedicated read service and adapter are now implemented and should be visible in the layer map. |
| A-03 | Traceability table reuse | `repository-db-map.md` | The read model now proves the approved `tbl_` reuse pattern in practice. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| F-01 | Invented traceability API contract | Finalizing the read endpoint before the source-backed contract is confirmed | Keep the contract in `context.md` and `impl-plan.md` until implementation is verified | Review checklist and controller test |
| F-02 | Completeness denominator drift | Accidental inclusion of commit evidence as a required item | Keep the completeness formula isolated in the service and write a dedicated unit test | `TraceabilityServiceTest` |
| F-03 | Hidden missing evidence | Rendering missing PR/CI/artifact rows as empty state instead of explicit warning/error | Force broken-link rendering in the read model and FE page | Black-box missing-evidence cases |
| F-04 | SQL table drift | A query starts using a non-approved table or legacy table name | Pin adapter tests to the exact `tbl_` SQL fragments | `TraceabilityJdbcAdapterTest` |
| F-05 | Timeline instability | Equal timestamps reorder between runs | Add stable tie-break sorting by ID | Timeline ordering unit test |
| F-06 | Read-only regression | A future edit/delete/repair action sneaks into the UI | Keep a route/page review checklist item for read-only enforcement | FE route and page test |
| F-07 | Enum drift | Confidence or severity values expand without agreement | Keep enum values explicit in docs and DTOs | DTO and FE assertions |

## Not Promoted

| item | reason |
|---|---|
| Browser-only full E2E as a permanent standard | Useful for some releases, but not necessary as a universal default for every read-only evidence ticket. |
| Separate migration standard | Not needed here because the ticket explicitly reused existing tables only. |

## Human Approval Required

- Confirm whether `route-api-map.md` and `service-layer-map.md` should be updated immediately or as part of the next architecture sweep.
- Confirm whether the new rule candidates should be merged into `ticket-rules.md` or kept as ticket-specific guidance only.
