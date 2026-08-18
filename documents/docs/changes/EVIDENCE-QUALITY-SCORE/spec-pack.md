# Spec Pack

**Ticket ID**: EVIDENCE-QUALITY-SCORE     
**Create date**: 2026-06-23  
**Author**: nk_trung     
**Update date**: 2026-06-23      

## 1. Context / Purpose

The Evidence Quality Score engine computes a explainable quality score for each SDD ticket. The score helps PM, QA, engineering, and operations identify tickets that have a complete and traceable evidence set and tickets that still have missing artifacts, missing links, or weak review/test/report coverage.

This is a BE engine feature. The dashboard is a downstream consumer and is not part of this ticket's implementation scope. The MVP goal is to provide a stable score calculation, a stable breakdown, and a safe persistence contract that can be queried later by API and dashboard consumers. The dashboard must read the latest persisted snapshot only and must not trigger a fresh calculation on open.

Parser completion only produces a temporary or partial snapshot. The authoritative score is finalized after CI completion, then persisted for later read-back.

The requirement and database design both state that the MVP must reuse existing tables and must not store raw prompt, raw chat, full source code, or raw CI logs. The output must be explainable and replayable from metadata, artifact snapshots, review metadata/comments, traceability links, and existing metric tables.

## 2. Scope

### 2.1. Within range

- Calculate Evidence Quality Score per ticket.
- Return a numeric score in the range 0 to 100.
- Return score band information.
- Return a detailed breakdown by scoring criterion.
- Read from artifact inventory, parser output, PR metadata, PR review metadata/comments, CI metadata, test results, traceability links, and report data.
- Use PR review metadata/comments as the source of truth for review state and findings.
- Persist the calculated score so it can be queried later.
- Recalculate when source data changes.
- Return missing-item and parse-error information without crashing the whole pipeline.
- Support a direct API call that can be tested by Postman or other API tools.
- Reuse the existing score table and metric tables; no new schema object is required in the MVP.

### 2.2. Out of range

- Dashboard UI implementation.
- Personal ranking or any individual performance evaluation.
- Raw prompt storage, raw chat storage, full source-code storage, or raw CI-log storage.
- Formal metric-governance UI for score-rule version management in the MVP.
- Real-time scoring on every keystroke or every tiny file update.
- AI cost analysis.
- Customer PDF/Excel reporting.

## 3. Terminology
| terms | meaning | notes |
|---|---|---|
| Ticket | A unit of work or issue to be scored | The primary scoring key |
| Artifact | Evidence file such as spec-pack, impl-plan, test-results, or report | Parsed from the ticket folder |
| Breakdown | The per-criterion explanation of the score | Must show what increased or decreased the score |
| Score band | Human-readable category for the score result | `Excellent`, `Good`, `Warning`, `Risky`, `Critical` |
| Traceability link | Link between Ticket, Spec, PR, Commit, CI, Test, and Report | Must not be broken silently |
| Source of truth | Canonical source for a given data point | For review, this is PR review metadata/comments |
| Rule version | Identifier for the score formula version | MVP uses a fixed v0 rule |
| Missing item | Required evidence or field that is absent | Must reduce the score and be reported |
| Parse error | Error raised while parsing or normalizing input data | Must be reported without crashing the run |
| Recalculation | A new score computation after source data changes | History-vs-latest policy is still open |

## 4. As-Is

- The platform already has ingest, parser, metadata, review, test, and traceability data sources.
- The database already contains `tbl_fact_evidence_quality_score` and related metric/lineage tables.
- There is no dedicated Evidence Quality Score service or controller in the current Java source tree.
- Downstream consumers still need a stable score API and a stable breakdown contract.
- The same evidence set can be interpreted manually in different ways without a single locked formula.

## 5. To-Be

- The BE exposes a read-back contract for the latest persisted result and an internal recalculation contract for CI completion or backfill.
- The engine calculates the score from the existing metadata and parsed artifact data.
- The engine persists the result in the existing score table and can be re-queried later.
- The engine handles missing data safely and still returns a partial response.
- Parser completion may create a partial snapshot, but the authoritative score is finalized only after CI completion.
- Read-back APIs must not recalculate on dashboard open.
- The engine uses a fixed v0 scoring rule in the MVP and records the rule version in the stored result.
- The engine does not attempt to manage score-rule governance in the MVP; that is a future decision.

## 6. Detailed specification

### 6.1. Business Rules

- The engine must calculate one score per ticket per calculation run.
- The MVP uses a fixed v0 weighting model that totals 100 points.
- The score must reflect more than file existence; it must also reflect content completeness, review quality, test linkage, CI linkage, and final report completeness.
- The engine must treat PR review metadata/comments as the source of truth for review findings and review state.
- Internal review files can be treated as supporting evidence, but they are not the canonical source when PR metadata/comments are available.
- The engine must not store or return raw prompt, raw chat, full source code, or raw CI logs.
- Missing artifacts, parse errors, or broken links must reduce the score and must be reported in the response.
- If a required artifact is present but empty or clearly template-only, it must be treated as incomplete for scoring purposes.
- The following initial score distribution is used in the MVP

| criterion | points | Note
|---|---|---|
| `spec-pack.md` exists and has numbered ACs | 15 | score = 15 * (Number of valid ACs / Total number of ACs)
| `spec-pack.md` contains Scope / Non-scope / Open Issues / Risk | 10 | score = 10 * (Number of section present / 5) (Section: SCOPE_WITHIN_RANGE, SCOPE_OUT_OF_RANGE, OPEN_ISSUES, SECURITY_PRIVACY_IMPACT, OPERATION_MAINTENANCE_IMPACT). `SCOPE` is a grouping header and does not score on its own. For `OPEN_ISSUES`, the section is counted as present only when the section exists and does not contain any row with `status = Open`; otherwise that subscore is zeroed.
| `impl-plan.md` contains impact scope, rollback, and AC mapping | 10 | score = 10 * (Number section present / 5)  (Section: Implementation Principle, Alternative Plan,  Migration / Rollback Policy, Corresponding AC Table và Step Implementation ; For the Corresponding AC Table, ensure that the AC mapping is complete; if the mapping is incomplete, that section will receive a score of 0.)
| `review-checklist.md` exists and covers security/test viewpoints | 10 | core = 10 if review-checklist.md present or score = 0 if not present
| `self-review.md` contains commands run, results, and concerns | 15 | score = 4 if review-checklist.md is present + 3 if ## 6. Security/Privacy Review contains content and the checkbox is checked + 3 if ## 8. Test Review contains content and the checkbox is checked
| AI review / human review results and handling are present | 10 | score = 10 when PR has review/comment 
| `test-plan.md` and `test-results.md` are linked to ACs | 10 | Score = 2 if test-plan.md is present + 2 if test-results.md is present + 6 if all ACs are test-covered and the latest test run is not failed.
| CI run ID or CI link is present | 5 | CI link is not present => 0 score , last new CI run is failed => 2.5 score , last new CI run is not failed => 5 score.
| `blackbox-testcases.md` covers the main ACs | 5 | score = 5 nếu if testcases.md present and score = 0 if not present
| `report.md` contains overview, impact, review, test, risk, and remaining issues | 10 | score = 1 if report.md is present + 2 if ## 1. Edited summary contains content + 2 if ## 3. Scope of influence contains content + 2 if ## 5. Review results contains content + 2 if ## 6. Test results contains content + 1 if ## 9. Open Issues contains content

- Score band thresholds are fixed for the MVP:
  - `Excellent`: 90 to 100
  - `Good`: 75 to 89
  - `Warning`: 60 to 74
  - `Risky`: 40 to 59
  - `Critical`: 0 to 39
- The engine must be idempotent for the same source state and rule version.
- The engine should keep enough lineage to explain where the score came from.
- The exact policy for history rows versus latest-only storage is an open issue and must not be invented by implementation.

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| ticketId | string | Yes | Must be a valid ticket key or UUID in the system | Primary lookup key |
| ticketIds | array[string] | No | If present, each item must be valid | Batch calculation mode |
| forceRecalculate | boolean | No | Defaults to `false` | Used only for internal CI-triggered reruns or operator backfill; dashboard reads must not use it |
| scoreRuleVersion | string | No | Must match an available rule version when provided | MVP defaults to v0 |
| requestedBy | string | No | Must map to an authenticated actor when provided | For audit and traceability |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| ticketId | string | Ticket key or UUID | Primary result key |
| score | number | 0 to 100 | Final score |
| band | string | `Excellent` / `Good` / `Warning` / `Risky` / `Critical` | Score classification |
| breakdown | array | List of scoring items | Each item should include criterionId, label, score, maxScore, status, and sourceRefs |
| missing | array | List of missing artifacts or fields | Should be empty only when all required input exists |
| parseErrors | array | List of parse/normalize errors | Must not crash the whole run |
| traceIds | array | List of PR / CI / test / report / artifact references | Used for audit and drill-down |
| scoreRuleVersion | string | Rule version tag | Persisted for replay and audit |
| snapshotState | string | `partial` / `final` / `stale` | Indicates whether the persisted result is provisional or authoritative |
| calculatedAt | datetime | ISO 8601 with timezone | Time of calculation |

### 6.4. Error / Exception
| case | expected behavior | message/code | notes |
|---|---|---|---|
| Invalid ticket identifier | Reject the request with a validation error | `invalid_ticket_id` | No partial score for the invalid key |
| Missing artifact | Return a score with the missing item listed | `missing_artifact` | Do not crash |
| Parse error in one artifact | Return a score with parse error details | `parse_error` | Partial result is acceptable |
| Broken traceability link | Reduce the score and include the broken link in the breakdown | `traceability_broken` | Must be visible in the response |
| PR review data unavailable | Return a partial score with review-related items marked missing | `review_source_unavailable` | PR review metadata/comments remain canonical |
| Downstream storage unavailable | Return calculation result if possible and record persistence failure separately | `storage_unavailable` | No silent data loss |

### 6.5. Boundary Value
| item | min | max | special cases | expected |
|---|---|---|---|---|
| score | 0 | 100 | Exactly 0, 39, 40, 59, 60, 74, 75, 89, 90, and 100 must map to the correct band | The boundary classification must match the fixed thresholds |
| artifact completeness | 0 required items | all required items present | Template-only or empty artifact | Empty or placeholder-only content must count as incomplete |
| parse result | 0 successful parses | all required parses successful | One section missing, one file malformed | Partial result with warnings/errors, not a crash |
| traceability chain | no links | full chain Ticket -> Spec -> PR -> CI -> Test -> Report | One broken link | Score reduced and broken link reported |

### 6.6. Non-functional
| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Single-ticket scoring must be responsive for dashboard/API usage | Exact SLA to be confirmed by owner | API/integration test | Batch scoring can be slower than single-ticket scoring |
| Security | Must not collect or persist disallowed raw data | 0 raw prompt/chat/full source/raw CI log retention | Security test and code review | Review metadata/comments are canonical for review |
| Availability / Reliability | Missing input or parser errors must not crash the whole pipeline | Partial result returned with missing/parseErrors | Failure-path integration test | Fail safe, not fail open |
| Maintainability | The rule version must be explicitly recorded | `scoreRuleVersion` persisted for each result | Schema and API contract review | Governance UI/API is out of scope in MVP |
| Observability / Logging | Calculation must be explainable after the fact | trace IDs, source refs, and error details available | Log and API response review | No secret content in logs |
| Compatibility | The engine must reuse existing score and metric tables | No new schema object required in MVP | DB review | Future JSONB breakdown is optional, not mandatory |

## 7. Acceptance Criteria
| ACID | description | testable? | notes |
|---|---|---|---|
| AC-EVIDENCE-QUALITY-SCORE-1 | Given a valid ticket with the required source data, when the engine runs, then it returns a score between 0 and 100. | Yes | Core contract. |
| AC-EVIDENCE-QUALITY-SCORE-2 | Given a valid ticket, when the engine runs, then it returns a breakdown with at least the configured scoring criteria. | Yes | Each item must be explainable. |
| AC-EVIDENCE-QUALITY-SCORE-3 | Given a calculated result, when the score is returned, then the score band matches the configured thresholds. | Yes | `Excellent` / `Good` / `Warning` / `Risky` / `Critical`. |
| AC-EVIDENCE-QUALITY-SCORE-4 | Given missing artifacts or broken links, when the engine runs, then the result still returns with the missing items and a reduced score. | Yes | The pipeline must not crash. |
| AC-EVIDENCE-QUALITY-SCORE-5 | Given parse errors in one or more inputs, when the engine runs, then it records parseErrors and still returns a partial result if possible. | Yes | Error isolation is required. |
| AC-EVIDENCE-QUALITY-SCORE-6 | Given PR review metadata/comments exist, when review data is consumed, then the engine treats that data as the canonical review source. | Yes | Internal review files are supporting evidence only. |
| AC-EVIDENCE-QUALITY-SCORE-7 | Given a persisted score result exists, when queried again by ticketId, then the same result can be retrieved later. | Yes | Storage and read-back contract. |
| AC-EVIDENCE-QUALITY-SCORE-8 | Given a ticket result is stored, when the response is inspected, then it does not contain raw prompt, raw chat, full source code, or raw CI logs. | Yes | Security and privacy gate. |
| AC-EVIDENCE-QUALITY-SCORE-9 | Given the same source state and rule version, when the engine is rerun, then the result is idempotent. | Yes | Same inputs, same result. |
| AC-EVIDENCE-QUALITY-SCORE-10 | Given a dashboard consumer, when it reads the BE response, then the response contains ticketId, score, band, breakdown, missing, parseErrors, traceIds, snapshotState, and calculatedAt, and the read path does not trigger a fresh calculation. | Yes | Downstream-ready response shape. |

## 8. Examples

### 8.1. Normal Case

A ticket has a complete `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `blackbox-testcases.md`, and `report.md`. The ticket is linked to PR, CI, test, and report data, and PR review metadata/comments show resolved findings. Parser completion may already have created a partial snapshot, but the engine returns a finalized Good or Excellent score only after CI completion, with a detailed breakdown and an empty or near-empty missing list.

### 8.2. Error Case

`spec-pack.md` is missing AC numbering and `test-results.md` cannot be parsed because the file is malformed. The engine still returns a score, includes the missing artifact and parse error in the response, and reduces the score accordingly instead of crashing.

### 8.3. Boundary Case

A ticket scores exactly 39, 40, 59, 60, 74, 75, 89, 90, or 100. The engine must map each boundary value to the correct score band and must not misclassify the threshold values.

## 9. Source Availability Summary

- Requirement document: available and primary.
- Database design document: available and primary.
- Repository DB map and V4 migration: available and confirm that the score table and related metric tables already exist.
- Architecture and standards documents: available and supporting.
- Dedicated Evidence Quality Score runtime service: not found in the current Java source tree.
- Dedicated tests for this engine: not found in the current test tree.

## 10. Complexity Classification

```text
- Complexity: Complex
- System shape: BE + DB + API
- Primary risk: Contract / Source / DB / Test / Operation
- Review mode: Heavy
- Required options: Source Analysis / DB / Full Security
```

## 11. FE/BE Contract Impact

The feature is a BE engine, but it defines the contract that downstream dashboard consumers will read later. The BE response must stay stable and must include the score, band, breakdown, missing list, parse errors, trace IDs, snapshotState, rule version, and calculation time. The FE should not recompute the score locally; it should render the BE result and the explanation breakdown. The dashboard must only read the latest persisted snapshot and must not trigger calculation on open.

No FE implementation is required in this ticket, but the response shape must already be safe for future dashboard binding.

## 12. DB/Migration Impact

The MVP does not require a new table or a required column change.

The current schema already includes the following reusable objects:

- `tbl_fact_evidence_quality_score` as the result table.
- `tbl_fact_metric_value` with `breakdown` support.
- `tbl_fact_metric_input_lineage` for input lineage.
- `tbl_dim_metric_definition` for metric identity and version metadata.
- `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section`, `tbl_fact_acceptance_criteria`, `tbl_fact_review`, `tbl_fact_review_comment`, `tbl_fact_finding`, `tbl_fact_ci_run`, `tbl_fact_test_run`, `tbl_fact_test_case`, `tbl_fact_ac_test_coverage`, `tbl_fact_traceability_link`, `tbl_fact_risk`, `tbl_fact_decision`, `tbl_fact_exception`, `tbl_fact_data_quality`, and `tbl_fact_evidence_report` as reusable input or lineage sources.

If future audit needs require a durable JSON breakdown per criterion, that can be added later, but it is not required for the MVP.

## 13. Security/Privacy Impact

This feature must follow metadata-first and reuse-first principles.

- Do not store raw prompt text.
- Do not store raw chat logs.
- Do not store full source code.
- Do not store raw CI logs.
- Do not store secrets or tokens.
- Do not use the score for personal ranking.
- Do not treat internal review files as the canonical source when PR review metadata/comments are available.
- Pseudonymize actor identity where possible and keep access scoped by role/project/customer policy.
- Ensure logs and API responses contain only traceable metadata, not sensitive content.

## 14. Operation/Maintenance Impact

The engine should be safe to rerun when source data changes. A failed parse or a missing artifact must create a partial result or a missing-data record instead of stopping the whole pipeline. The result must remain explainable by source references and lineage.

The score-rule version must be stored with the result. The exact policy for history rows versus latest-only rows is still open and must be decided before implementation freezes the storage contract.

Operationally, the engine should support CI-triggered finalization, partial parser snapshots, and batch recalculation/backfill as needed; direct API lookup by ticketId must be read-only and must not calculate on dashboard open. The implementation must be idempotent for identical source state and rule version.

## 15. Test Strategy Summary

- Unit tests for score calculation, score banding, and boundary values.
- Unit tests for missing-item handling and parse-error handling.
- Integration tests for reading from the existing tables and producing a persisted result.
- API contract tests for the response shape and required fields.
- Idempotency tests for repeated runs with the same source state.
- Security tests to ensure no raw prompt, raw chat, full source, or raw CI logs are stored or returned.
- Negative-path tests for invalid ticket IDs, missing artifacts, malformed parse output, and unavailable downstream storage.

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
|H-EVIDENCE-QUALITY-SCORE-1|Should I keep only the most recent result or keep the full history of all recalculations? | MVP closes the model with full history + current/latest snapshot.|Product owner / technical owner|Closed|
|H-EVIDENCE-QUALITY-SCORE-2|Is it possible to manually override the score in the event of an exception?|V0 does not allow manual override of score; exceptions must be recorded using a separate exception record.|Product owner / security owner|Closed|
|H-EVIDENCE-QUALITY-SCORE-3|Keep the v0 score weights fixed regardless of phase, or allow weighting by ticket type/phase in later versions.|Version V0 fixed phase-agnostic weights; later versions considered weighting by group.|Product owner / QA / engineering lead|Closed|

## 17. Assumptions and Inference Log
| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
|A-EVIDENCE-QUALITY-SCORE-1|The MVP uses the existing `tbl_fact_evidence_quality_score` table as the output store.|Database design and repository DB map already show the table exists.|Low|No|
|A-EVIDENCE-QUALITY-SCORE-2|The MVP uses a fixed v0 score rule and persists the rule version in each result row.|Requirement says MVP can use a fixed formula and defer governance.|Medium|No|
|A-EVIDENCE-QUALITY-SCORE-3|PR review metadata/comments are the canonical review source and internal review files are supporting evidence only.|Requirement explicitly says so.|Low|No|
|A-EVIDENCE-QUALITY-SCORE-4|The score weights in this spec are the initial v0 calibration and may be adjusted later only through a formal rule update.|Source documents define the weighted model but do not define a formal governance workflow for MVP.|Medium|Yes|
|A-EVIDENCE-QUALITY-SCORE-5|The dashboard will consume the BE contract later and will not compute the score locally.|Ticket scope says BE engine only; dashboard is downstream.|Low|No|

## 18. Open Issues
| ID | issue | impact | owner | status |
|---|---|---|---|---|
|OI-EVIDENCE-QUALITY-SCORE-1|The system saves the full history and current/latest snapshot for each ticket.|The storage model has been finalized, enabling fast audits and queries.|Product owner / technical owner|Closed|
|OI-EVIDENCE-QUALITY-SCORE-2|V0 does not allow manual override of score; exceptions must be recorded using a separate exception record.|Governance has been finalized for v0 to maintain score consistency.|Product owner / security owner|Closed|
|OI-EVIDENCE-QUALITY-SCORE-3|Score weights in version v0 are fixed for all ticket types and phases; later versions will consider weighting by phase or ticket type.|The simple implementation path for MVP has been finalized, while maintaining the comparability between tickets.|Product owner / QA / engineering lead|Closed|
