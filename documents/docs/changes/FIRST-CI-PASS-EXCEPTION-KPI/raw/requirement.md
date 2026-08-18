# Requirement: First CI Pass / Exception KPI (MVP, BE-only)

## 1. Objective
This feature is used to collect, standardize, and store data for two KPIs within the MVP scope:

- **First CI Pass Rate**: the percentage of PRs whose CI passes on the first run.
- **Exception Rate**: the percentage of exceptions that occur in the development flow, such as `--no-verify`, CI skip, test skip, security scan disabled, or emergency merge.

The goal of this phase is **BE-only**: ingest data, parse data, and store it in the database. Internal APIs can be prepared for later use, but **no FE / dashboard** work is required yet.

## 2. MVP Scope
In the MVP, this feature only needs to:

- collect CI run metadata;
- extract exceptions from `report.md` and `self-review.md`;
- standardize the data and store it in the DB;
- expose a base API for later data querying;
- record warnings if data is missing or inconsistent.

Not required:

- build an FE / dashboard;
- auto-generate test cases from AC;
- advanced black-box parsing;
- manual mapping/pinning;
- a dedicated workflow UI for this KPI.

## 3. Input Data
### 3.1 CI Metadata
The system must be able to store at least:

- `status`
- `duration`
- `workflow`
- `job`
- `failure_category`
- `run_id`
- linkage to `PR` or `ticket`

### 3.2 Markdown Artifacts
The system must be able to read:

- `test-plan.md`
- `test-results.md`
- `report.md`
- `self-review.md`

From these, it must extract information related to CI pass/fail and exceptions.

## 4. Business Rules
### 4.1 First CI Pass Rate
A PR is counted as a **First CI Pass** if the first CI run for that PR has status PASS.

Formula:

```text
First CI Pass Rate = number of PRs that passed CI on the first run / total number of PRs with CI
```

Additional requirements:

- calculated by **PR**;
- stored by **project** and **ticket** for later querying;
- includes classification of the failure reason for the first run.

### 4.2 Exception Rate
A ticket/PR is counted as having an **exception** if `report.md` or `self-review.md` records one of the following cases:

- `--no-verify`
- CI skip
- test skip
- security scan disabled
- emergency merge
- equivalent process bypass

Each exception must include at least:

- `reason`
- `approved_by_role`
- `expiry`
- `follow_up`

If any required field is missing, the system must create a warning and record a data-quality issue.

Suggested formula:

```text
Exception Rate = number of tickets/PRs with exceptions / total tickets/PRs in scope
```

## 5. Data to Store in the DB
### 5.1 Minimum Tables/Records
The system should store at least the following entities:

- `ci_run`
- `ci_run_attempt`
- `ci_failure_category`
- `exception_event`
- `ticket_kpi_summary`
- `project_kpi_summary`
- `data_quality_issue`

### 5.2 Suggested Data Fields
#### `ci_run`
- `id`
- `project_id`
- `repository_id`
- `ticket_id` or `pr_id`
- `run_id`
- `workflow`
- `job`
- `status`
- `started_at`
- `finished_at`
- `duration_seconds`
- `failure_category`
- `is_first_attempt`

#### `exception_event`
- `id`
- `project_id`
- `ticket_id`
- `pr_id`
- `exception_type`
- `reason`
- `approved_by_role`
- `expiry`
- `follow_up`
- `source_artifact_type`
- `source_artifact_path`
- `detected_at`

#### `ticket_kpi_summary`
- `ticket_id`
- `first_ci_pass_flag`
- `exception_flag`
- `ci_first_run_status`
- `exception_count`
- `last_calculated_at`

## 6. Internal API (optional for now, useful later)
No FE is being built yet, but a base API should exist to make later data querying easier.

### 6.1 Suggested APIs
- `GET /api/v1/kpi/ci-first-pass`
- `GET /api/v1/kpi/exceptions`
- `GET /api/v1/tickets/{ticketId}/kpi`
- `GET /api/v1/projects/{projectId}/kpi`

### 6.2 Purpose
These APIs are only for querying data already stored in the DB, and there is no UI requirement in the MVP phase.

## 7. Acceptance Criteria
The feature is considered complete when:

1. The system can retrieve the required CI metadata from PR/CI runs.
2. The system can store CI data in the DB.
3. The system can extract exceptions from report/self-review.
4. Each exception can be validated for reason / approval / expiry / follow-up.
5. Data can be queried via internal APIs or DB queries.
6. FE is not required to verify the feature in this phase.

## 8. Out of Scope
- No FE / dashboard.
- No raw prompt/chat storage.
- No source full-text storage.
- No manual AC-to-test pinning.
- No dedicated workflow UI for this KPI.

## 9. Implementation Notes
This feature should be implemented together with the following foundational pieces:

- DB schema v0
- Git/PR/CI metadata collector
- Basic Markdown parser
- Parse error handling
- Exception normalization
- KPI summary persistence
- Base API for later querying