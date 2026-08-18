# Promotion Candidates

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI
**Create date**: 2026-06-29  
**Author**: nk_trung  
**Update date**: 2026-06-30  

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| L-01 | Explicit exception section rules | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/spec-pack.md` | The dedicated exception section is now the canonical source for exception KPI parsing. | High |
| L-02 | First CI Pass PR-grain rule | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/context.md` | Keep the grain decision visible so later phases do not drift to job-level logic. | High |
| L-03 | Warning-first behavior for missing sections | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/ticket-rules.md` | The no-synthetic-row rule should remain easy to reuse in future tickets. | High |
| L-04 | Idempotent rerun guidance | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impl-plan.md` | Rerun behavior is a recurring operational requirement and should be easy to find. | Medium |
| L-05 | Test fixture catalog | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/test-data.md` | The synthetic fixtures are reusable examples for later parser / KPI tickets. | Medium |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| R-01 | Treat explicit exception records as the only KPI input | Ticket rules | Prevents later free-text inference from reappearing. | Low |
| R-02 | Keep job rows diagnostic only for CI pass computation | Ticket rules | Prevents KPI drift to job-level logic. | Low |
| R-03 | Missing exception sections must create warnings, not synthetic rows | Ticket rules | Makes failure behavior explicit and testable. | Low |
| R-04 | Approval roles resolve from master data only | Ticket rules | Avoids person-name leakage and ambiguity. | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| S-01 | Document build-verification gaps when Maven is unavailable | `docs/standards/testing.md` | The archived evidence needed a clear way to record compile recheck limitations. |
| S-02 | Keep metadata-only wording explicit in KPI / parser tickets | `docs/standards/security.md` | This ticket reaffirms the no-raw-content policy and should be easy to reuse. |
| S-03 | Add a reusable note for idempotent persistence checks | `docs/standards/maintenance.md` | Duplicate rerun handling is an ongoing maintenance concern. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| A-01 | Add the final First CI Pass / Exception KPI read path | `docs/architecture/route-api-map.md` | The new read-side path should be reflected once the controller contract is fixed. |
| A-02 | Add the KPI service placement | `docs/architecture/service-layer-map.md` | The new application use case should be visible in the service map. |
| A-03 | Add the exception / CI fact read model flow | `docs/architecture/repository-db-map.md` | The existing fact tables are now used together by a ticket-specific KPI flow. |
| A-04 | Add the warning / provenance flow | `docs/architecture/data-flow-map.md` | Operators need a clear map of parse warnings and idempotent reruns. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| F-01 | Missing exception section is silently treated as success | Parser sees a report / self-review without the dedicated exception section | Enforce explicit-only parsing and warning emission | Black-box BB-006 / test parser warning tests |
| F-02 | Duplicate facts are created on rerun | Same source hash is parsed more than once | Unique / idempotent upsert logic | Rerun / idempotency tests |
| F-03 | Approval role is stored as person text instead of role master | Role resolution falls back to display text | Resolve from `tbl_dim_role` first and warn when unresolved | Role-resolution test and data-quality warning |
| F-04 | First CI Pass uses job-level status instead of run-level status | Query logic accidentally follows CI jobs | Keep job rows diagnostic only | Earliest-run boundary tests |
| F-05 | Build verification cannot be reproduced in the current environment | Maven CLI or DB tooling is unavailable | Record the limitation in report and require a later recheck | Final report / test-results limitation section |

## Not Promoted

| item | reason |
|---|---|
| FE screen / route for this ticket | This phase is BE-only and the scope explicitly excludes FE. |
| Raw CI log storage | Forbidden by the metadata-only policy. |
| Raw prompt / chat storage | Forbidden by the metadata-only policy. |
| New KPI summary table | The reuse-first schema path is sufficient for the MVP. |
| Free-text exception inference | Violates the explicit-record rule and would weaken trust in the KPI. |

## Human Approval Required

- Confirm whether the final runtime build verification should be re-run in a Maven-enabled environment before merge.
- Confirm whether any future FE exposure should reuse an existing dashboard read model or introduce a new screen in a later phase.