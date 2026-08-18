# Promotion Candidates

**Ticket ID**: AC-TEST-COVERAGE  
**Create date**: 2026-06-26  
**Author**: OpenAI  
**Update date**: 2026-06-29  

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-ACC-001 | AC-first coverage read model and status vocabulary | `docs/architecture/test-map.md` | Preserve the `AC -> test cases` surface, the coverage statuses, and the difference between planned and executed evidence. | High |
| LD-ACC-002 | Executed coverage materialization from test-run junction | `docs/architecture/repository-db-map.md` | Capture how executed coverage is written into `tbl_fact_ac_test_coverage` and why `PLANNED` rows are excluded from score counts. | High |
| LD-ACC-003 | Test-results parser as executed evidence source | `docs/standards/testing.md` | Keep `test-plan.md` as the planned source and `test-results.md` as executed evidence, not as interchangeable inputs. | High |
| LD-ACC-004 | Metadata-only evidence handling | `docs/standards/security.md` | Preserve the no-raw-prompt / no-raw-chat / no-raw-CI-log boundary for parser-driven tickets. | High |
| LD-ACC-005 | CI metadata as supporting evidence only | `docs/standards/maintenance.md` | Make the supporting role of CI summaries explicit so future tickets do not turn KPI metadata into coverage overrides. | Medium |

## Candidates for Rules

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-ACC-001 | Executed coverage is never materialized | The parse flow persists test runs but skips the executed-coverage write step | Keep `updateExecutedCoverageFromJunction(...)` in the parse path and cover it with adapter tests | Integration test comparing `tbl_fact_test_run` and `tbl_fact_ac_test_coverage` |
| FMI-ACC-002 | `PLANNED` rows pollute executed counts | The read model counts all AC coverage rows without filtering | Exclude `PLANNED` in the score/read-model query | Score test that seeds planned-only rows |
| FMI-ACC-003 | Fail-only ACs are treated as uncovered noise | Validation reads only pass rows | Decide and document whether fail rows count as executed evidence or warning-only support | Parser test with AC present only in fail rows |
| FMI-ACC-004 | Manual mapping/pinning returns | A later UI/API change adds an override path | Keep the ticket parser-only and reject manual override flows | Review diff for write endpoints or override controls |
| FMI-ACC-005 | Raw source text leaks into metadata artifacts | Warning generation echoes source snippets | Sanitize warnings and persist only structured metadata | Test for raw-text absence in warnings/logs |
| FMI-ACC-006 | KPI signals are mistaken for coverage overrides | `First CI Pass` or `Exception` is used as a coverage status | Keep KPIs separated from coverage status in the read model | Read-model assertion that KPI fields do not change coverage state |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| ST-ACC-001 | Separate planned coverage from executed coverage in the testing standard | `docs/standards/testing.md` | This ticket benefits from an explicit contract for planned vs executed evidence and the associated warning semantics. |
| ST-ACC-002 | Treat warning persistence as part of the observable contract | `docs/standards/testing.md` | The ticket closes best when warnings and data-quality output are testable and auditable. |
| ST-ACC-003 | Keep metadata-only parser flows as a standard security boundary | `docs/standards/security.md` | Prevents raw source and raw CI-log persistence from creeping into future tickets. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| AD-ACC-001 | AC coverage materialization flow | `docs/architecture/route-api-map.md` | Make the parse-to-read-model path easy to rediscover for future contributors. |
| AD-ACC-002 | Reuse-first coverage persistence path | `docs/architecture/repository-db-map.md` | Document the existing fact-table path and the executed-coverage write step. |
| AD-ACC-003 | Test and black-box coverage pattern | `docs/architecture/test-map.md` | Preserve the regression slice and the observable contract for similar parser-heavy tickets. |

## Candidates for Failure Mode Index
- None

## Not Promoted

| item | reason |
|---|---|
| Manual mapping or pinning UI | Explicitly out of scope for this ticket. |
| Raw CI log persistence | Contradicts the metadata-only boundary. |
| FE-side coverage recomputation | Would duplicate backend business rules. |
| New coverage tables | Reuse-first is sufficient for the current MVP scope. |

## Human Approval Required

None at this time.