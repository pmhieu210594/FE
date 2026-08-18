# Requirement - CI Run Job Metadata MVP

**Ticket ID**: CI-RUN-METADATA  
**Feature name**: CI Run Job Metadata Collector MVP  
**Scope note**: This ticket collects minimum GitHub Actions job-level CI metadata for traceability and dashboard display. Each record represents one GitHub Actions job. Raw CI log ingestion, test result parsing, failure analysis, and security scan evidence are out of scope.

---

## 1. Purpose

This feature helps PM, Developer, QA, and Data Ops users answer these questions without manually opening GitHub Actions:

1. Did CI run for the target repository / branch / PR?
2. Which workflow run contains the CI job?
3. Which job ran inside the workflow?
4. What is the status of each CI job?
5. When did the CI job start and complete?
6. Where can the user open the original GitHub Actions job or workflow run?

This feature supports the PoC traceability chain:

```text
Ticket -> PR -> Commit -> CI Workflow Run -> CI Job -> Evidence Detail / Dashboard
```

---

## 2. Agreed MVP Direction

### 2.1 CI Source

CI metadata is collected from GitHub Actions.

The source of truth is GitHub Actions. The system stores only metadata required for evidence traceability and dashboard display.

### 2.2 Data Grain

The data grain of `tbl_fact_ci_run` is:

```text
1 row = 1 GitHub Actions job
```

A workflow run may contain multiple jobs.

Example:

```text
Workflow: CI
Workflow Run ID: 27660577827
  Job ID: 77123456789, Job Name: build, Status: SUCCESS
  Job ID: 77123456790, Job Name: test, Status: FAILURE
```

This should produce two rows in `tbl_fact_ci_run`.

### 2.3 Minimum Collected Data

The MVP collects only:

- workflow run ID
- job ID
- status
- workflow name
- job name
- started time
- completed time
- job URL or workflow run URL

### 2.4 URL Rule

The system should store the most specific available URL:

1. If GitHub Actions job URL is available, store job URL.
2. If job URL is not available, fallback to workflow run URL.

### 2.5 Persistence Rule

The implementation may use only tables with `tbl_` prefix. Non-`tbl_` tables are not allowed in this ticket.

Approved table set:

- `tbl_dim_project`
- `tbl_dim_repository`
- `tbl_dim_ticket`
- `tbl_connector_run`
- `tbl_fact_pull_request`
- `tbl_fact_ci_run`

### 2.6 CI/CD Provider

- CI/CD provider: GitHub Actions

---

## 3. Scope

### In Scope

- GitHub Actions job metadata collection
- Persisting one row per GitHub Actions job into `tbl_fact_ci_run`
- Storing workflow run ID as parent run reference
- Storing job ID as job-level external identifier
- Linking CI job to repository
- Linking CI job to PR if PR number is available
- Linking CI job to ticket if ticket can be inferred
- Recording collector execution in `tbl_connector_run`
- Displaying CI job status and CI URL in dashboard / ticket evidence detail

### Out of Scope

- Raw CI log storage
- Full CI artifact storage
- Test result parsing
- Coverage parsing
- Failure category classification
- Flaky test detection
- Secret / SAST / SCA scan summary
- Security finding detail
- Re-run button / manual refresh button
- Real-time webhook handling, unless already available in the project foundation

---

## 4. Functional Requirements

### FR-1 CI Job Metadata Collection

The system must collect GitHub Actions job-level metadata for the target repository.

The collected metadata must include:

- workflow run ID
- job ID
- workflow name
- job name
- status
- started time
- completed time
- CI URL

### FR-2 One Row per Job

The system must persist one row per GitHub Actions job.

If a workflow run contains three jobs, the system must create or update three rows in `tbl_fact_ci_run`.

### FR-3 Workflow Run Reference

Each CI job row must store the workflow run ID.

The workflow run ID is stored in `external_run_id`.

### FR-4 Job Reference

Each CI job row must store the GitHub Actions job ID.

The job ID is stored in `external_job_id`.

`external_job_id` is required for this ticket because the data grain is job-level.

### FR-5 Repository Linkage

The system must link each CI job to a repository.

The repository must be resolved from existing `tbl_dim_repository`.

If repository resolution fails, the collector must record the error in `tbl_connector_run` and must not create orphan CI job records.

### FR-6 PR Linkage

If PR number or PR reference is available from GitHub Actions metadata, the system should link the CI job to `tbl_fact_pull_request`.

If PR linkage cannot be resolved, the CI job may still be stored with repository linkage only.

### FR-7 Ticket Linkage

If ticket ID can be inferred from PR title, branch name, commit message, or existing PR metadata, the system should link the CI job to `tbl_dim_ticket`.

If ticket linkage cannot be resolved, the CI job may still be stored with repository linkage only.

### FR-8 Status Normalization

The system must normalize GitHub Actions status / conclusion into a simple CI status value.

Allowed MVP status values:

- `SUCCESS`
- `FAILURE`
- `CANCELLED`
- `SKIPPED`
- `IN_PROGRESS`
- `QUEUED`
- `UNKNOWN`

### FR-9 Time Handling

The system must store CI job started and completed timestamps.

Rules:

- Timestamps must be stored in UTC or as `timestamptz`.
- If the CI job is still running, `completed_at` may be null.
- `started_at` must not be later than `completed_at` when both values exist.

### FR-10 URL Storage

The system must store a URL for opening the original CI evidence.

Rules:

- Prefer GitHub Actions job URL.
- Fallback to GitHub Actions workflow run URL.
- URL is stored only as a reference to source of truth.

### FR-11 Idempotent Persistence

The collector must be idempotent.

If the same provider, repository, workflow run ID, and job ID are collected again, the system must update the existing record instead of inserting a duplicate record.

### FR-12 Connector Run Logging

Each collector execution must create or update a `tbl_connector_run` record.

The connector run log should record:

- connector name
- provider
- repository
- started time
- completed time
- status
- records received
- records inserted
- records updated
- records skipped
- error message if failed

### FR-13 Privacy / Security

The system must never store:

- raw CI logs
- secret values
- tokens
- private keys
- full build artifacts
- raw command output

---

## 5. Acceptance Criteria

- AC-CI-RUN-1: The system can collect GitHub Actions job metadata.
- AC-CI-RUN-2: The system stores one row per GitHub Actions job.
- AC-CI-RUN-3: The system stores workflow run ID, job ID, workflow name, job name, status, started time, completed time, and CI URL.
- AC-CI-RUN-4: The system persists CI metadata only in approved `tbl_` tables.
- AC-CI-RUN-5: The system links CI job to repository.
- AC-CI-RUN-6: The system links CI job to PR when PR metadata is available.
- AC-CI-RUN-7: The system links CI job to ticket when ticket ID can be inferred.
- AC-CI-RUN-8: Running the same collector twice for the same CI job does not create duplicate records.
- AC-CI-RUN-9: If a CI job is still running, the system stores status as `IN_PROGRESS` and allows `completed_at` to be null.
- AC-CI-RUN-10: If GitHub Actions API fails, the system records failure in `tbl_connector_run`.
- AC-CI-RUN-11: No raw CI log, token, secret, private key, or full artifact content is stored.
- AC-CI-RUN-12: PM Dashboard can show latest CI job status per ticket or PR.
- AC-CI-RUN-13: Ticket Evidence Detail can show workflow run ID, job ID, workflow/job, status, time, and URL.

---

## 6. Open Items

- Exact GitHub Actions API authentication method.
- Whether collection is triggered by scheduled batch, webhook, or manual backend job.
- Exact mapping rule from GitHub Actions conclusion to normalized CI status.
- Exact ticket ID matching rule from branch / PR title / commit message.
- Whether dashboard should show all jobs or only failed/latest jobs by default.
