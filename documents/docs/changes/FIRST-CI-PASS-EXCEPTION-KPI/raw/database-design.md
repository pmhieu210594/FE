# Database Design - First CI Pass / Exception KPI

**Feature**: `First CI Pass / Exception KPI`
**Scope**: MVP, backend only, one project / 1-2 repositories, ingest + parse + persist + API foundation, no FE.
**Principles**:
- Reuse the existing schema first.
- Store metadata, not raw prompt/chat/full source code/raw CI logs.
- Keep the design explainable from DB tables and metric lineage.

---

## 1. Design Goals

This database design must support:

1. Ingesting CI run metadata and exception metadata from the existing collectors/parsers.
2. Storing the normalized facts needed to compute:
   - `FIRST_CI_PASS_RATE`
   - `EXCEPTION_RATE`
3. Reusing the current warehouse schema as much as possible.
4. Keeping the result queryable by backend APIs later without requiring FE work now.
5. Preserving traceability, lineage, and data-quality handling.

---

## 2. Design Conclusions

### 2.1 Do we need new tables for the MVP?

**No new table is required for the MVP.**

The existing schema already contains the objects needed for this KPI:

- `tbl_fact_ci_run` for CI run metadata and run-level first-pass evaluation
- `tbl_fact_ci_job` for job-level CI detail, failure attribution, and debugging
- `tbl_fact_exception` for exceptions and approvals
- `tbl_dim_metric_definition` for metric definitions
- `tbl_fact_metric_value` for KPI results
- `tbl_fact_metric_input_lineage` for input lineage
- `tbl_fact_evidence_event` for compute / parse / validation events
- `tbl_fact_data_quality` for missing or invalid data tracking
- `tbl_fact_artifact_snapshot` and `tbl_fact_artifact_parsed_section` for source evidence linkage
- `tbl_dim_ticket`, `tbl_fact_pull_request`, `tbl_dim_repository`, `tbl_dim_project` for scope and joins

### 2.2 Do we need new columns for the MVP?

**No mandatory new column is required for the MVP.**

Reason:

- `tbl_fact_ci_run.first_run_flag` already exists to mark the first run at run-level.
- `tbl_fact_ci_run.rerun_count` already exists to support rerun-based analysis.
- `tbl_fact_ci_run.failure_category` already exists to categorize run-level failures.
- `tbl_fact_ci_job` already exists to retain job-level failure attribution without introducing a new schema object.
- `tbl_fact_exception.reason_present`, `reason`, `approved`, `approved_by_role_id`, `approved_at`, `expiry_date`, and `follow_up_status` already cover exception governance.
- `tbl_fact_metric_value.breakdown` already supports explainable KPI output.

### 2.3 Future extensions

If the team later needs more explainability or faster dashboard queries, the following could be added **after the MVP**:

- A dedicated read model view for KPI queries, e.g. a materialized or plain view for `FIRST_CI_PASS_RATE` / `EXCEPTION_RATE`
- A helper column on `tbl_fact_ci_run` such as `first_pass_reason` or `first_pass_calculated_flag`
- A helper column on `tbl_fact_exception` such as `exception_origin` (for example `REPORT`, `SELF_REVIEW`, `MANUAL`)

These are **not required now** because the current schema can already compute the KPI using:

- `tbl_fact_ci_run`
- `tbl_fact_exception`
- `tbl_fact_metric_value`
- `tbl_fact_metric_input_lineage`

---

## 3. Accepted Table Set for the MVP

### 3.1 Master / dimension tables

| Table | Role |
|---|---|
| `tbl_dim_organization` | Org scope for future filtering |
| `tbl_dim_customer` | Customer scope |
| `tbl_dim_project` | Project scope |
| `tbl_dim_repository` | Repository scope |
| `tbl_dim_ticket` | Ticket scope |
| `tbl_dim_role` | Role for approval and governance |
| `tbl_dim_metric_definition` | Metric master for KPI definitions |

### 3.2 Fact / event tables

| Table | Role |
|---|---|
| `tbl_fact_pull_request` | PR metadata and PR-to-ticket linkage |
| `tbl_fact_ci_run` | CI run metadata, first-run signal, rerun signal, failure summary |
| `tbl_fact_ci_job` | CI job-level breakdown and failure attribution |
| `tbl_fact_exception` | Exception record and governance fields |
| `tbl_fact_quality_gate` | Optional supporting gate evidence |
| `tbl_fact_metric_value` | Calculated KPI values |
| `tbl_fact_metric_input_lineage` | Input lineage for KPI computation |
| `tbl_fact_evidence_event` | Parse/compute/validation events |
| `tbl_fact_data_quality` | Parse and data-quality errors |
| `tbl_fact_artifact_snapshot` | Artifact source anchor |
| `tbl_fact_artifact_parsed_section` | Parsed section summaries |

---

## 4. Data Flow

```text
Git / PR / CI source
  -> collector
  -> tbl_connector_run
  -> tbl_fact_pull_request
  -> tbl_fact_ci_run
  -> tbl_fact_ci_job
  -> tbl_fact_exception
  -> tbl_fact_evidence_event
  -> tbl_fact_data_quality (if needed)

KPI engine
  -> reads tbl_fact_ci_run + tbl_fact_exception + scope tables
  -> calculates FIRST_CI_PASS_RATE / EXCEPTION_RATE
  -> writes tbl_fact_metric_value
  -> writes tbl_fact_metric_input_lineage
```

---

## 5. Table-by-Table Design

### 5.1 `tbl_fact_ci_run`

**Purpose**: store one CI run record.

**Columns used for this KPI**:

- `ci_run_id`
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

- `first_run_flag = true` means this CI run is the first run for that PR scope.
- `rerun_count` is used to explain why a run is not first-pass.
- `failure_category` should be used to group failure reasons for API output and future dashboard use.
- `ticket_id` and `pr_id` should be filled whenever the upstream source can resolve them.

**Why this table is sufficient**:

- It already stores the first-run signal.
- It already stores rerun information.
- It already stores the PR relationship needed to compute first-pass rate.
- It is the run-level anchor for job-level detail held in `tbl_fact_ci_job`.

---

### 5.2 `tbl_fact_ci_job`

**Purpose**: store job-level CI details under a CI run.

**Columns used**:

- `ci_job_id`
- `ci_run_id`
- `external_job_id`
- `job_name`
- `status`
- `duration_seconds`
- `failure_category`
- `failure_summary`
- `started_at`
- `finished_at`

**Usage rules**:

- Use this table when a CI run has multiple jobs and failure attribution is needed.
- It is not required for the run-level First CI Pass calculation itself, but it is important for debugging, failure attribution, and explainability.
- When multiple jobs exist in a single run, the KPI engine may use the worst job state to enrich the run-level breakdown.

**Why this table is sufficient**:

- It gives the backend a stable place to break down CI failures without adding new schema.
- It already exists in schema v2 and should be reused rather than reintroduced as a new object.

---

### 5.3 `tbl_fact_exception`

**Purpose**: store an operational exception for a ticket / PR / CI run.

**Columns used**:

- `exception_id`
- `ticket_id`
- `repository_id`
- `pr_id`
- `ci_run_id`
- `exception_type`
- `reason_present`
- `reason`
- `alternative_check`
- `approved`
- `approved_by_role_id`
- `approved_at`
- `expiry_date`
- `follow_up_status`
- `linked_report_path`

**Usage rules**:

- An exception row is considered valid when it has a meaningful `exception_type` and the reason / approval fields are populated according to policy.
- `follow_up_status = 'OPEN'` should be used for unresolved exceptions.
- `expiry_date` is used to surface stale exceptions.

**Why this table is sufficient**:

- It already stores the governance data required by the MVP.
- It already supports the BE-only requirement to persist the information first and expose APIs later.

---

### 5.4 `tbl_dim_metric_definition`

**Purpose**: store metric master definitions.

**Metric codes already seeded in the current schema**:

- `FIRST_CI_PASS_RATE`
- `EXCEPTION_RATE`

**Columns used**:

- `metric_id`
- `metric_code`
- `metric_name`
- `formula`
- `version`
- `owner_role_id`
- `valid_from`
- `valid_to`
- `description`

**Usage rules**:

- The KPI engine must resolve the metric by `metric_code` and `version`.
- The formula and description are kept here for reproducibility and governance.

**Why this table is sufficient**:

- The metric definitions already exist in the migration seed.
- No new metric-definition table is necessary.

---

### 5.5 `tbl_fact_metric_value`

**Purpose**: store the computed KPI result.

**Columns used**:

- `metric_value_id`
- `metric_id`
- `metric_code`
- `definition_version`
- `organization_id`
- `customer_id`
- `project_id`
- `repository_id`
- `ticket_id`
- `team_id`
- `period_type`
- `period_start`
- `period_end`
- `value`
- `score_band`
- `breakdown`
- `calculated_at`
- `lineage_id`

**Usage rules**:

- `FIRST_CI_PASS_RATE` should typically be stored at PR, repository, or project scope depending on the API query.
- `EXCEPTION_RATE` should typically be stored at project or repository scope for the same period.
- `breakdown` should contain a JSON summary of numerator, denominator, excluded rows, and basic reason categories.

**Why this table is sufficient**:

- It already supports metric versioning.
- It already supports scope-based aggregation.
- It already supports explainable output through `breakdown`.

---

### 5.6 `tbl_fact_metric_input_lineage`

**Purpose**: record which records contributed to a metric value.

**Columns used**:

- `metric_input_lineage_id`
- `metric_value_id`
- `input_table`
- `input_record_id`
- `input_hash`
- `contribution_type`

**Usage rules**:

- Store at least the CI run IDs and exception IDs that contributed to the KPI value.
- This table is what makes the KPI explainable later when users ask, “Why is this metric different today?”

**Why this table is sufficient**:

- It provides traceability without storing raw CI logs.

---

### 5.7 `tbl_fact_evidence_event`

**Purpose**: track parse / compute / validation events.

**Columns used**:

- `ticket_id`
- `repository_id`
- `artifact_snapshot_id`
- `event_type`
- `actor_type_id`
- `actor_member_key`
- `event_summary`
- `event_status`
- `metadata`
- `occurred_at`
- `created_at`

**Usage rules**:

- Use this table to record KPI calculation runs, parse results, and validation warnings.
- Do not store raw log payloads here.

---

### 5.8 `tbl_fact_data_quality`

**Purpose**: store missing / invalid / stale source data conditions.

**Columns used**:

- `connector_run_id`
- `project_id`
- `repository_id`
- `source_type`
- `source_ref`
- `missing_count`
- `invalid_count`
- `duplicate_count`
- `freshness_delay_minutes`
- `issue_summary`
- `severity`
- `resolved_flag`

**Usage rules**:

- Create a data-quality row when CI data or exception data cannot be linked properly.
- This is especially important for edge cases like missing PR linkage or missing approval details.

---

## 6. KPI Computation Rules

### 6.1 First CI Pass Rate

**Definition**:

- A PR is considered a first-pass success when its first CI run is `PASS`.
- The KPI is calculated at PR scope first, then can be aggregated to repository / project / period scopes.

**Suggested numerator**:

- count of PRs where the first CI run has `status = 'PASS'`

**Suggested denominator**:

- count of PRs that have at least one CI run in scope

**Suggested supporting fields**:

- `tbl_fact_ci_run.first_run_flag`
- `tbl_fact_ci_run.pr_id`
- `tbl_fact_ci_run.status`
- `tbl_fact_ci_run.collected_at`
- `tbl_fact_ci_job.status` for per-job enrichments

**Handling reruns**:

- Later reruns do not change the first-pass result.
- `rerun_count` is kept for explainability and debugging.
- Job-level failures are used to explain why a run-level first pass was not achieved.

---

### 6.2 Exception Rate

**Definition**:

- Exception Rate measures how often the team had to deviate from normal policy.
- The KPI is calculated at ticket / repository / project scope depending on the query.

**Suggested numerator**:

- count of valid exception rows in scope

**Suggested denominator**:

- count of tickets or PRs in the same scope and period

**Suggested supporting fields**:

- `tbl_fact_exception.exception_type`
- `tbl_fact_exception.reason_present`
- `tbl_fact_exception.approved`
- `tbl_fact_exception.follow_up_status`
- `tbl_fact_exception.expiry_date`
- `tbl_fact_exception.ticket_id`
- `tbl_fact_exception.pr_id`

**Exception validity rule**:

- An exception is valid only when policy-required fields are present.
- Missing reason or missing approval should be treated as a data-quality problem, not as a normal exception.

---

## 7. Index Usage

The current schema already has indexes that support this KPI well:

- `idx_ci_ticket_status` on `tbl_fact_ci_run(ticket_id, status)`
- `idx_ci_pr_status` on `tbl_fact_ci_run(pr_id, status)`
- `idx_ci_run_time` on `tbl_fact_ci_run(started_at DESC)`
- `idx_exception_ticket` on `tbl_fact_exception(ticket_id)`
- `idx_exception_expiry` on `tbl_fact_exception(expiry_date, follow_up_status)`
- `idx_metric_scope_period` on `tbl_fact_metric_value(project_id, repository_id, ticket_id, period_start, period_end)`
- `idx_metric_code_period` on `tbl_fact_metric_value(metric_code, period_start, period_end)`

### 7.1 Do we need new indexes?

**No mandatory new index is needed for the MVP.**

Reason:

- The existing indexes already cover the most likely filter paths.
- The MVP scope is small: one project and 1-2 repositories.
- Query performance should be adequate before adding new physical structures.

### 7.2 Optional future indexes

If the KPI volume grows later, consider adding:

- a composite index on `tbl_fact_ci_run(pr_id, first_run_flag, status)`
- a composite index on `tbl_fact_exception(repository_id, follow_up_status, expiry_date)`

These are not required now.

---

## 8. API-Oriented Read Pattern

The backend can expose read APIs later without changing the physical model.

### Suggested API read targets

- `GET /api/v1/metrics?metricCode=FIRST_CI_PASS_RATE`
- `GET /api/v1/metrics?metricCode=EXCEPTION_RATE`
- `GET /api/v1/tickets/{ticketId}/ci-summary`
- `GET /api/v1/tickets/{ticketId}/exceptions`

### Suggested DB query sources

- `tbl_fact_metric_value` for final KPI output
- `tbl_fact_metric_input_lineage` for explanation
- `tbl_fact_ci_run` for CI evidence
- `tbl_fact_exception` for exception evidence

---

## 9. Migration Impact

### 9.1 Required migration work for MVP

**None required for schema structure.**

Only data seeding / code wiring may be needed if the current environment has not yet loaded the metric definitions.

### 9.2 What must be verified in migration/data seed

- `FIRST_CI_PASS_RATE` exists in `tbl_dim_metric_definition`
- `EXCEPTION_RATE` exists in `tbl_dim_metric_definition`
- `tbl_fact_ci_run.first_run_flag` exists and is populated correctly by collectors
- `tbl_fact_exception` is populated from report/self-review parsing

---

## 10. What Is Not in Scope

- No raw CI log storage
- No raw prompt/chat storage
- No full source code storage
- No FE-specific table
- No new reporting warehouse for MVP
- No dedicated exception-history table

---

## 11. Final Recommendation

For the MVP, implement this KPI using the existing schema only:

- persist CI runs in `tbl_fact_ci_run`
- persist exceptions in `tbl_fact_exception`
- persist metric results in `tbl_fact_metric_value`
- persist lineage in `tbl_fact_metric_input_lineage`
- persist warnings in `tbl_fact_evidence_event` and `tbl_fact_data_quality`

This keeps the design simple, explainable, and aligned with the reuse-first principle.