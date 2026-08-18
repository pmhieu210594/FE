# Database Design - AC-Test Coverage Logic

**Ticket / Feature**: `AC-Test Coverage Logic`  
**Scope**: MVP, 1 project, 1-2 repositories, ticket-level coverage for AC ↔ test, and dashboard support.  
**Principles**: reuse existing tables as much as possible, prefer metadata, do not store raw prompts / raw chat / full source code / raw CI logs.

---

## 1. Design Goals

The database design for AC-Test Coverage logic must support the following:

1. Store the original AC list extracted from `spec-pack.md`.
2. Store planned test evidence and actual test evidence linked to each AC.
3. Store the final AC-test mapping so dashboard and KPI services can query efficiently.
4. Store parse / validation / compute events and data quality errors.
5. Reuse the current schema as much as possible.

---

## 2. Design Conclusions

### 2.1 Does the MVP need new tables?

**No new tables are needed for the MVP.**

The current schema already has all the core objects required for AC-Test Coverage logic:

- AC master table: `tbl_fact_acceptance_criteria`
- Artifact snapshot / section parse tables: `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section`
- Test evidence tables: `tbl_fact_test_run`, `tbl_fact_test_case`
- AC coverage table: `tbl_fact_ac_test_coverage`
- CI run table: `tbl_fact_ci_run`
- Traceability table: `tbl_fact_traceability_link`
- Evidence event table: `tbl_fact_evidence_event`
- Data quality table: `tbl_fact_data_quality`
- Metric tables: `tbl_dim_metric_definition`, `tbl_fact_metric_value`, `tbl_fact_metric_input_lineage`

### 2.2 Does the MVP need new columns?

**No mandatory new columns are needed for the MVP.**

Reason:

- `tbl_fact_ac_test_coverage` already has fields sufficient to store ticket-level AC mapping, test case references, test run references, and coverage status.
- `tbl_fact_test_case.ac_reference` can hold the AC reference extracted from test evidence.
- `tbl_fact_ci_run.summary`, `failure_category`, `first_run_flag`, and `rerun_count` are enough for CI-summary-based signals.
- `tbl_fact_artifact_snapshot.parsed_summary` and `tbl_fact_artifact_parsed_section` already support artifact-level output.

### 2.3 Future extensions

If more explicit rule-mapping explainability is needed later, consider **after the MVP**:

- `mapping_reason` / `rule_name` on `tbl_fact_ac_test_coverage`
- `coverage_evidence_json` on `tbl_fact_ac_test_coverage`

These fields are **not needed yet** because the current schema can still explain results through:

- `tbl_fact_test_case.ac_reference`
- `tbl_fact_traceability_link.evidence`
- `tbl_fact_evidence_event.metadata`
- `tbl_fact_artifact_parsed_section.section_summary`

---

## 3. Accepted Table Set for the MVP

### 3.1 Master / dimension tables

| Table | Role |
|---|---|
| `tbl_dim_project` | Project scope for dashboard filtering and queries |
| `tbl_dim_repository` | Repository scope for ingest and evidence lookup |
| `tbl_dim_ticket` | Primary business key for AC coverage |
| `tbl_dim_artifact_type` | Artifact classification for `SPEC_PACK`, `TEST_PLAN`, `TEST_RESULTS`, `REPORT`, ... |
| `tbl_dim_metric_definition` | Metric definition for `AC_TEST_COVERAGE`, `FIRST_CI_PASS_RATE`, `EXCEPTION_RATE` |

### 3.2 Fact / event tables

| Table | Role |
|---|---|
| `tbl_fact_artifact_snapshot` | File-level snapshot for parser output of spec/test/report |
| `tbl_fact_artifact_parsed_section` | Structured content stored by section |
| `tbl_fact_acceptance_criteria` | AC master extracted from `spec-pack.md` |
| `tbl_fact_test_run` | Summary of a test execution |
| `tbl_fact_test_case` | Individual test cases and AC references |
| `tbl_fact_ac_test_coverage` | Canonical mapping between AC ↔ test and its status |
| `tbl_fact_ci_run` | CI run metadata / summary |
| `tbl_fact_traceability_link` | Trace links between ticket ↔ artifact ↔ test ↔ CI |
| `tbl_fact_evidence_event` | Parse / compute / validation events |
| `tbl_fact_data_quality` | Parse and validation errors |
| `tbl_fact_metric_value` | Calculated KPI results |
| `tbl_fact_metric_input_lineage` | Input lineage used for KPIs |

---

## 4. Data Flow

```text
spec-pack.md
  -> parser
  -> tbl_fact_artifact_snapshot
  -> tbl_fact_artifact_parsed_section
  -> tbl_fact_acceptance_criteria

 test-plan.md
  -> parser
  -> tbl_fact_artifact_snapshot
  -> tbl_fact_artifact_parsed_section
  -> tbl_fact_test_run (planned / parsed summary)
  -> tbl_fact_test_case
  -> tbl_fact_ac_test_coverage (PLANNED rows)

 test-results.md
  -> parser
  -> tbl_fact_artifact_snapshot
  -> tbl_fact_artifact_parsed_section
  -> tbl_fact_test_run (execution summary)
  -> tbl_fact_test_case (execution detail)
  -> tbl_fact_ac_test_coverage (executed / resolved rows)

 CI summary
  -> collector
  -> tbl_fact_ci_run
  -> tbl_fact_evidence_event

 coverage engine
  -> reads AC master + test run/test case + CI summary
  -> writes tbl_fact_ac_test_coverage / tbl_fact_metric_value
  -> writes tbl_fact_evidence_event / tbl_fact_data_quality when needed
```

---

## 5. Design and Usage of Existing Tables

### 5.1 `tbl_fact_acceptance_criteria`

**Purpose**: store the ticket’s AC master.

**Columns in use**:

- `ticket_id`
- `artifact_snapshot_id`
- `ac_key`
- `ac_text_hash`
- `ac_summary`
- `ambiguous_flag`
- `status`

**Usage rules**:

- A ticket may have multiple AC rows.
- `ac_key` must be stable within the scope of a ticket.
- Only rows with `status = 'ACTIVE'` are used for coverage calculation.
- `ambiguous_flag = true` should be shown as a data-quality warning or review warning, not as a hard failure.

**Why this table is sufficient**:

- It already stores AC identity and a short summary.
- The current code flow already reads AC keys from this table.
- No extra AC master table is needed.

---

### 5.2 `tbl_fact_artifact_snapshot`

**Purpose**: file-level snapshot for `spec-pack.md`, `test-plan.md`, `test-results.md`, and `report.md`.

**Columns in use**:

- `ticket_id`
- `repository_id`
- `artifact_type_id`
- `phase_id`
- `source_path`
- `content_hash`
- `schema_version`
- `schema_valid`
- `template_empty_flag`
- `required_fields_missing`
- `parsed_summary`
- `parser_version`
- `connector_run_id`
- `collected_at`

**Usage rules**:

- Keep file-level metadata here.
- Do not store full sections in this table; section details belong in `tbl_fact_artifact_parsed_section`.
- The snapshot is the stable anchor for re-parsing and audit.

**Why this table is sufficient**:

- It tracks whether the file exists, its hash, parse result, and source path.
- It supports idempotent re-parsing from the snapshot.

---

### 5.3 `tbl_fact_artifact_parsed_section`

**Purpose**: store structured content by section for parsed artifacts.

**Columns in use**:

- `artifact_snapshot_id`
- `ticket_id`
- `section_type`
- `section_key`
- `section_text_hash`
- `section_summary`
- `required_flag`
- `present_flag`
- `valid_flag`
- `parse_warning`

**Usage rules**:

- Store only section-level summaries.
- Do not store long raw text if the parser does not normalize it into a short summary.
- Use it for cross-checking sections in spec, test plan, test results, and report.

**Why this table is sufficient**:

- It is enough to verify whether a section exists and to query its summary.
- It is enough for inventory, quality, and dashboard use cases.

---

### 5.4 `tbl_fact_test_run`

**Purpose**: store a summary of one test execution.

**Columns in use**:

- `repository_id`
- `ticket_id`
- `pr_id`
- `ci_run_id`
- `external_test_run_id`
- `test_type`
- `status`
- `test_count`
- `passed_count`
- `failed_count`
- `skipped_count`
- `duration_seconds`
- `coverage_percent`
- `started_at`
- `finished_at`
- `collected_at`

**Usage rules**:

- A ticket may have multiple test runs.
- A test run can be linked to a PR / CI run when metadata is available.
- The parser should store test-run summaries in this table, not in the snapshot table.

**Why this table is sufficient**:

- It stores run status and numeric summary data.
- It can be used for dashboards and first-pass CI / test analysis.

---

### 5.5 `tbl_fact_test_case`

**Purpose**: store evidence by test case and the AC reference.

**Columns in use**:

- `test_run_id`
- `ticket_id`
- `test_case_key`
- `test_case_name_hash`
- `ac_reference`
- `status`
- `duration_ms`
- `failure_summary`
- `flaky_candidate_flag`

**Usage rules**:

- `ac_reference` is the main bridge between the test case and the AC key.
- `status` reflects the test execution result.
- `failure_summary` is enough for dashboard display; raw logs do not need to be stored.

**Why this table is sufficient**:

- It provides enough detail to connect ACs with test evidence.
- It supports one AC being mapped to multiple test cases.

---

### 5.6 `tbl_fact_ac_test_coverage`

**Purpose**: the canonical coverage-mapping table for this feature.

**Columns in use**:

- `ticket_id`
- `ac_id`
- `artifact_snapshot_id`
- `ac_key`
- `ac_text_hash`
- `test_case_id`
- `test_run_id`
- `coverage_status`
- `calculated_at`

**Usage rules**:

- This is the primary output table for AC-Test Coverage logic.
- Store both planned coverage and confirmed coverage.
- `PLANNED` rows are written when `test-plan.md` shows AC-to-test mapping.
- `PASSED` / `FAILED` / `UNKNOWN` rows are written when `test-results.md` or CI summary confirms execution.
- In the MVP, `coverage_status` should be normalized by code into a small set of statuses.

**Recommended standard statuses for the MVP**:

| Status | Meaning |
|---|---|
| `PLANNED` | The AC has a planned test mapping in `test-plan.md` |
| `PASSED` | The AC has test evidence and the corresponding test passed |
| `FAILED` | The AC has test evidence but the corresponding test failed |
| `UNKNOWN` | A mapping exists, but confidence is low or evidence is incomplete |

**Important inference rule**:

- `UNTESTED` is usually **derived** with a left join when an AC has no row in `tbl_fact_ac_test_coverage`.
- It does not have to be physically materialized as a separate row in the MVP database.

**Why this table is sufficient**:

- It supports the required ticket / AC / test run / test case granularity.
- The current code already uses this table to store planned coverage.
- The unique constraint `(ticket_id, ac_key, test_case_id)` helps prevent duplicate mappings.

---

### 5.7 `tbl_fact_ci_run`

**Purpose**: CI summary input for coverage and first-pass KPI calculations.

**Columns in use**:

- `repository_id`
- `ticket_id`
- `pr_id`
- `external_ci_run_id`
- `workflow_name`
- `status`
- `duration_seconds`
- `first_run_flag`
- `rerun_count`
- `failure_category`
- `artifact_link_hash`
- `summary`
- `started_at`
- `finished_at`
- `collected_at`

**Usage rules**:

- Treat CI summary as supporting evidence, not as the only source of truth.
- Link CI runs with test runs when the collector can resolve the relationship.
- `first_run_flag` and `rerun_count` can be used for the `FIRST_CI_PASS_RATE` KPI.

**Why this table is sufficient**:

- It already contains run summaries and the fields needed for first-pass / exception KPIs.
- No separate CI-summary table is required.

---

### 5.8 `tbl_fact_traceability_link`

**Purpose**: store trace relationships among ticket, artifact, PR, CI, and test evidence.

**Columns in use**:

- `ticket_id`
- `source_type`
- `source_id`
- `target_type`
- `target_id`
- `confidence`
- `confidence_level`
- `created_by_source`
- `rule_name`
- `evidence`

**Usage rules**:

- Use this table for the traceability-map view.
- Use it to link ticket -> spec pack -> test plan -> test results -> CI run when possible.
- Do not create a separate graph table for the MVP.

**Why this table is sufficient**:

- It stores source, target, confidence, and evidence.
- It is enough to calculate traceability completeness.

---

### 5.9 `tbl_fact_evidence_event`

**Purpose**: store lifecycle and audit events for parser / coverage computation.

**Columns in use**:

- `ticket_id`
- `repository_id`
- `artifact_snapshot_id`
- `event_type`
- `actor_type_id`
- `actor_member_key`
- `source_type`
- `source_ref_id`
- `event_timestamp`
- `result`
- `summary`
- `metadata`

**Recommended event types**:

- `AC_COVERAGE_PARSE_STARTED`
- `AC_COVERAGE_PARSE_COMPLETED`
- `AC_COVERAGE_PARSE_FAILED`
- `AC_COVERAGE_COMPUTED`
- `AC_COVERAGE_COMPUTE_FAILED`

**Why this table is sufficient**:

- It records what happened, when it happened, and the outcome.
- It supports audit and debugging without raw logs.

---

### 5.10 `tbl_fact_data_quality`

**Purpose**: store parse errors, missing ACs, invalid references, and schema violations.

**Columns in use**:

- `project_id`
- `repository_id`
- `source_type`
- `source_path`
- `missing_count`
- `parse_error_count`
- `schema_violation_count`
- `error_summary`
- `checked_at`

**Usage rules**:

- Write only when the parser / coverage engine detects an issue.
- Use it to warn about missing `spec-pack.md`, broken AC numbering, invalid AC references in tests, or parse failures.

**Why this table is sufficient**:

- It supports issue counts and a short error summary.
- It is enough for a Data Ops screen.

---

### 5.11 Metric tables

#### `tbl_dim_metric_definition`

This table already has seed metric codes suitable for the MVP, including:

- `AC_TEST_COVERAGE`
- `FIRST_CI_PASS_RATE`
- `EXCEPTION_RATE`

#### `tbl_fact_metric_value`

**Purpose**: store calculated KPIs.

**Columns in use**:

- `metric_id` / `metric_code`
- `definition_version`
- `project_id`
- `repository_id`
- `ticket_id`
- `value`
- `score_band`
- `breakdown`
- `calculated_at`

#### `tbl_fact_metric_input_lineage`

**Purpose**: store lineage of input data used for KPIs.

**Usage rules**:

- Use it when writing `AC_TEST_COVERAGE` results or related KPIs.
- Record input rows from AC master, test run, test case, and CI run.

**Why these tables are sufficient**:

- The metric layer already exists in the schema.
- No separate KPI table is needed for the MVP.

---

## 6. Recommended Data Writing Model

### 6.1 When parsing `spec-pack.md`

Write to:

- `tbl_fact_artifact_snapshot`
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_acceptance_criteria`
- `tbl_fact_evidence_event`
- `tbl_fact_data_quality` if there are errors

### 6.2 When parsing `test-plan.md`

Write to:

- `tbl_fact_artifact_snapshot`
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_test_run` (if a planned test summary is parsed)
- `tbl_fact_test_case`
- `tbl_fact_ac_test_coverage` with status `PLANNED`
- `tbl_fact_traceability_link` if a clear link can be inferred
- `tbl_fact_evidence_event`
- `tbl_fact_data_quality` if there are errors

### 6.3 When parsing `test-results.md`

Write to:

- `tbl_fact_artifact_snapshot`
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_test_run`
- `tbl_fact_test_case`
- `tbl_fact_ac_test_coverage` with status `PASSED`, `FAILED`, or `UNKNOWN`
- `tbl_fact_traceability_link` if a clear link can be inferred
- `tbl_fact_evidence_event`
- `tbl_fact_data_quality` if there are errors

### 6.4 When ingesting CI summary

Write to:

- `tbl_fact_ci_run`
- `tbl_fact_evidence_event`
- `tbl_fact_traceability_link` if it can be resolved to a ticket / test run
- `tbl_fact_data_quality` if the summary is missing or malformed

### 6.5 When running the coverage engine

Read from:

- `tbl_fact_acceptance_criteria`
- `tbl_fact_test_case`
- `tbl_fact_test_run`
- `tbl_fact_ci_run`
- `tbl_fact_traceability_link`

Write to:

- `tbl_fact_ac_test_coverage`
- `tbl_fact_metric_value`
- `tbl_fact_metric_input_lineage`
- `tbl_fact_evidence_event`
- `tbl_fact_data_quality`

---

## 7. Coverage Calculation Rules in the Database

### 7.1 Data granularity

- **AC level**: each AC is one logical unit.
- **Test case level**: each test case can map to one or more ACs.
- **Test run level**: multiple test cases executed within one run.
- **Ticket level**: aggregated coverage for the dashboard.

### 7.2 Minimum mapping rules

- An AC is considered **covered** when at least one test case references that AC.
- An AC is considered **passed** when the related test case passes and there is no overriding failure evidence.
- An AC is considered **failed** when the related test case fails.
- An AC is considered **untested** when there are no coverage rows for that AC.

### 7.3 Deriving `UNTESTED`

`UNTESTED` should be derived in the query layer or service layer, and does not have to be physically stored in the MVP database.

Reason:

- Reduces duplicate writes.
- Makes it easy to recalculate when the parser or rules change.
- Still allows the dashboard to show all statuses.

---

## 8. Metrics Directly Affected by AC-Test Coverage

### 8.1 `AC_TEST_COVERAGE`

- Source: `tbl_fact_acceptance_criteria`, `tbl_fact_test_case`, `tbl_fact_test_run`, `tbl_fact_ci_run`
- Purpose: measure the percentage of ACs with valid test evidence
- Result: stored in `tbl_fact_metric_value`

### 8.2 `FIRST_CI_PASS_RATE`

- Source: `tbl_fact_ci_run`
- Purpose: measure the rate of CI success on the first attempt
- Result: stored in `tbl_fact_metric_value`

### 8.3 `EXCEPTION_RATE`

- Source: `tbl_fact_evidence_event`, `tbl_fact_ci_run`, `tbl_fact_test_run`
- Purpose: measure skip, no-verify, emergency merge, or similar exception cases
- Result: stored in `tbl_fact_metric_value`

---

## 9. Data Quality Checks

### 9.1 When to write `tbl_fact_data_quality`

Write when any of the following issues occur:

- `spec-pack.md` is not found
- AC numbering is missing or unstable
- The test plan contains an AC reference in the wrong format
- Test results cannot be mapped to the test plan
- CI summary cannot be parsed
- The coverage engine cannot resolve the ticket / AC / test run

### 9.2 Minimum error-summary information

- Error source
- Error type
- Related ticket / repository
- Number of affected records
- Parser version
- Check time

---

## 10. Design Conclusion

### 10.1 Is a schema change needed immediately?

**No**, not for the MVP.

### 10.2 If something is missing after UAT?

Only if higher explainability is truly needed should you consider adding columns such as:

- `mapping_reason`
- `rule_name`
- `coverage_evidence_json`

But only do this after reviewing the actual flow and proving that the current schema is insufficient.

### 10.3 Final conclusion

The MVP for AC-Test Coverage logic can run on the current schema, with focus on:

- AC master
- test run
- test case
- CI summary
- coverage mapping
- metric value
- data quality
- traceability

No new tables or columns are needed in the initial phase.