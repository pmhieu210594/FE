# Database Design - Evidence Quality Score Engine

**Ticket ID**: EVIDENCE-QUALITY-SCORE
**Create date**: 2026-06-23
**Author**: nk_trung
**Update date**: 2026-06-23

---

**Feature**: Evidence Quality Score Engine  
**Goal**: Calculate an evidence quality score for each SDD ticket based on data ingested and parsed from the repository / PR / CI / test / traceability sources.  
**Principles**: reuse-first, metadata-first, do not store raw chat / raw prompt / full source code / raw CI logs, and prefer reusing the existing schema before adding new objects.

---

## 1. Design Objectives

The database for this feature must support four main tasks:

1. Store the score result for each ticket.
2. Store the score breakdown so it is possible to explain why the ticket received that score.
3. Trace the input data sources that were used to calculate the score.
4. Support dashboard / API / audit / score recalculation when source data changes.

---

## 2. Design Conclusion

### 2.1 Do we need new tables?

**No new tables are needed in the MVP.**

Reasons:

- The current schema already has a dedicated score table: `tbl_fact_evidence_quality_score`.
- The input data needed for the score engine already exists in the artifact, review, CI, test, traceability, metric, and data quality tables.
- The detailed breakdown can be aggregated from the existing tables; a separate table is not required for the MVP.

### 2.2 Do we need new required columns?

**No new required columns are needed in the MVP.**

Reasons:

- `tbl_fact_evidence_quality_score` already has `score`, `score_band`, `score_rule_version`, component score columns (`spec_score`, `plan_score`, `review_score`, `self_review_score`, `test_score`, `ci_score`, `blackbox_score`, `report_score`), and `missing_items`.
- `tbl_fact_metric_value` already has `breakdown JSONB` for storing a breakdown at the metric layer if needed.
- `tbl_fact_metric_input_lineage` is sufficient to store lineage for the inputs used in scoring.

### 2.3 Do we need new columns / tables in the future?

**Only consider this in a post-MVP phase if detailed criterion-level breakdowns need to be stored persistently as JSONB.**

Possible extensions (not required in the MVP):

- `score_breakdown JSONB` in `tbl_fact_evidence_quality_score`
- or continue using `tbl_fact_metric_value.breakdown`

**Reason for considering this**: if later we need to store each sub-criterion, each source reference, or replay a more complex scoring formula history, then a dedicated JSONB breakdown would be more convenient. But for the MVP, the existing component columns are already sufficient.

---

## 3. Existing Tables to Use

### 3.1 `tbl_fact_evidence_quality_score`

| Item | Content |
|---|---|
| Role | Main result table of the engine |
| Used to store | `ticket_id`, `score`, `score_band`, `score_rule_version`, component scores, `missing_items`, `calculated_at` |
| Assessment | **Sufficient for the MVP** |
| Schema change needed? | **No** |
| Reason | This is the correct table for storing the final engine output |

### 3.2 `tbl_fact_metric_value`

| Item | Content |
|---|---|
| Role | General metric layer for analytics |
| Used to store | `metric_id`, `metric_code`, `definition_version`, scope by org/customer/project/repository/ticket/team, `value`, `score_band`, `breakdown` |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Supports storing metric values and a general breakdown if needed for dashboard / BI |

### 3.3 `tbl_dim_metric_definition`

| Item | Content |
|---|---|
| Role | Metric definition, version, and formula |
| Used to store | `metric_code`, `metric_name`, `formula`, `version`, `owner_role_id`, `valid_from`, `valid_to` |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Metric definitions and versions can be managed without a dedicated score table for the MVP |

### 3.4 `tbl_fact_metric_input_lineage`

| Item | Content |
|---|---|
| Role | Stores the lineage of inputs used to calculate a metric |
| Used to store | source table, source record, source hash, contribution type |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Helps trace why a score was produced and which source data was used |

### 3.5 `tbl_artifact_required_field_rule`

| Item | Content |
|---|---|
| Role | Configuration rules for required fields / sections and weights |
| Used to store | `artifact_type_id`, `schema_version`, `field_code`, `field_name`, `section_type`, `required_flag`, `score_weight`, time validity |
| Assessment | **Sufficient for artifact scoring rules** |
| Schema change needed? | **No** |
| Reason | Can be reused as rule weights for items such as spec-pack, impl-plan, review-checklist, self-review, test-plan, and report |

### 3.6 `tbl_fact_artifact_snapshot`

| Item | Content |
|---|---|
| Role | Snapshot of artifact files that were ingested / parsed |
| Used to store | file path, hash, schema_valid, template_empty_flag, required_fields_missing, parsed_summary, parser_version, connector_run_id |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Used to check whether the artifact exists, whether parsing succeeded, and which fields are missing |

### 3.7 `tbl_fact_artifact_parsed_section`

| Item | Content |
|---|---|
| Role | Stores each parsed section |
| Used to store | `section_type`, `section_key`, `section_summary`, `required_flag`, `present_flag`, `valid_flag`, `parse_warning` |
| Assessment | **Sufficient for the MVP** |
| Schema change needed? | **No** |
| Reason | Used to check Scope / Non-scope / AC / Risk / Open Issues / rollback / review summary / report summary |

### 3.8 `tbl_fact_acceptance_criteria`

| Item | Content |
|---|---|
| Role | Stores each Acceptance Criteria item |
| Used to store | `ac_key`, `ac_summary`, `ambiguous_flag`, `status` |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Main source for scoring AC numbering / AC completeness / AC-Test coverage |

### 3.9 `tbl_fact_review` and `tbl_fact_review_comment`

| Item | Content |
|---|---|
| Role | Source of PR review information |
| Used to store | reviewer, review state, comment count, comment summary, severity, resolved flag |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | This is the source of truth for review; the engine reads PR review metadata/comments and normalizes them through these tables |

### 3.10 `tbl_fact_finding`

| Item | Content |
|---|---|
| Role | Stores normalized findings |
| Used to store | category, severity, status, accepted_flag, false_positive_reason, finding_summary |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Supports the “review remaining findings and handling” part of the score breakdown |

### 3.11 `tbl_fact_ci_run`

| Item | Content |
|---|---|
| Role | Stores CI run metadata |
| Used to store | status, duration, workflow, job, failure category, started_at, finished_at |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Used to score CI link / first CI pass / reruns / failure category |

### 3.12 `tbl_fact_test_run`, `tbl_fact_test_case`, `tbl_fact_ac_test_coverage`

| Item | Content |
|---|---|
| Role | Stores test runs, test cases, and AC-Test mapping |
| Used to store | test count, pass/fail, coverage, flaky candidate, AC mapping |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Used to score `test_score` and AC-Test coverage |

### 3.13 `tbl_fact_traceability_link`

| Item | Content |
|---|---|
| Role | Stores Ticket / Spec / PR / Commit / CI / Test / Report links |
| Used to store | source_type, source_id, target_type, target_id, confidence, evidence |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Used to score traceability and demonstrate that the link chain is not broken |

### 3.14 `tbl_fact_risk`, `tbl_fact_decision`, `tbl_fact_exception`

| Item | Content |
|---|---|
| Role | Stores risks, decisions, and exceptions |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Supports Risk / Open Issues / rollback / exception tracking in the score and helps explain low scores |

### 3.15 `tbl_fact_data_quality`

| Item | Content |
|---|---|
| Role | Stores ingest / parse / schema violation errors |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Used to record parse errors and missing data without breaking the pipeline |

### 3.16 `tbl_fact_evidence_report`

| Item | Content |
|---|---|
| Role | Stores the final report per ticket |
| Assessment | **Sufficient** |
| Schema change needed? | **No** |
| Reason | Used to score `report_score` and store the final report output link |

---

## 4. Mapping Score Requirements -> Data Tables

| Scoring group | Main data source | Notes |
|---|---|---|
| `spec-pack.md` exists and has numbered ACs | `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section`, `tbl_fact_acceptance_criteria` | Used to verify existence, parse success, and ACs |
| Has Scope / Non-scope / Open Issues / Risk | `tbl_fact_artifact_parsed_section`, `tbl_fact_risk`, `tbl_fact_decision` | Can be inferred from parsed sections plus risk/decision records |
| `impl-plan.md` has impact scope, rollback, AC mapping | `tbl_fact_artifact_parsed_section`, `tbl_fact_traceability_link` | Supports `plan_score` |
| `review-checklist.md` exists and includes security/test items | `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section` | Scores review checklist coverage |
| `self-review.md` includes commands, results, and concerns | `tbl_fact_artifact_parsed_section` | Scores `self_review_score` |
| AI review / human review results and handling | `tbl_fact_review`, `tbl_fact_review_comment`, `tbl_fact_finding` | **Source of truth is PR review metadata/comments** |
| `test-plan.md` and `test-results.md` are linked to ACs | `tbl_fact_test_run`, `tbl_fact_test_case`, `tbl_fact_ac_test_coverage` | Scores `test_score` |
| CI run ID or link exists | `tbl_fact_ci_run`, `tbl_fact_traceability_link` | Scores `ci_score` |
| `blackbox-testcases.md` covers main ACs | `tbl_fact_artifact_parsed_section`, `tbl_fact_ac_test_coverage` | Scores `blackbox_score` |
| `report.md` includes overview / impact / review / test / risks / remaining issues | `tbl_fact_artifact_parsed_section`, `tbl_fact_evidence_report` | Scores `report_score` |

---

## 5. Result Storage Rules

### 5.1 Data that should be stored in `tbl_fact_evidence_quality_score`

This table is sufficient to store:

- `ticket_id`
- `score`
- `score_band`
- `score_rule_version`
- component scores
- `missing_items`
- `calculated_at`

### 5.2 Data that should not be forced into the score table

Do not store raw content, raw prompt, raw chat, full source code, or raw CI logs in the score table.

If more detail is needed for debugging:

- use `tbl_fact_metric_input_lineage` to trace inputs
- use `tbl_fact_data_quality` to store parse / missing-data errors
- use `tbl_fact_traceability_link` to preserve the link chain

---

## 6. Conclusion

### 6.1 Current schema assessment

**The current schema is sufficient for the MVP of the Evidence Quality Score Engine.**

No new tables and no new required columns are needed.

### 6.2 When should the schema be expanded?

Schema expansion should only be considered when one of the following becomes necessary:

1. Store detailed breakdowns by individual criterion in JSONB for replay or deeper audit.
2. Version the formula and track version history under separate metric governance.
3. Store multiple score calculations over time for trend comparison without relying entirely on the metric layer.

### 6.3 Final recommendation for the MVP

- Keep `tbl_fact_evidence_quality_score` as the main output table.
- Use the existing tables as inputs and lineage.
- Do not add new tables or columns during the MVP phase.
- If a more detailed breakdown is needed later, prefer adding JSONB before creating a new table.