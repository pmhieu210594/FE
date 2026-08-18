# Database Design - CI Run Job Metadata MVP

**Ticket ID**: CI-RUN-METADATA  
**Scope**: GitHub Actions job-level CI metadata collection and persistence.  
**Out of scope**: Raw CI logs, test result detail, coverage, failure classification, flaky test detection, security scan summary.

---

## 1. Overview

This ticket may use only `tbl_` tables.

Approved table set:

```text
tbl_dim_project
tbl_dim_repository
tbl_dim_ticket
tbl_connector_run
tbl_fact_pull_request
tbl_fact_ci_run
```

Do not use non-`tbl_` table names.

The main persistence table for this ticket is:

```text
tbl_fact_ci_run
```

`tbl_connector_run` is used for collector execution tracking.

---

## 2. Main Persistence Areas

| Table | Purpose |
|---|---|
| `tbl_fact_ci_run` | Stores GitHub Actions job-level CI metadata |
| `tbl_connector_run` | Stores collector/job execution tracking |
| `tbl_fact_pull_request` | Optional PR linkage for CI job |
| `tbl_dim_ticket` | Optional ticket linkage for CI job |
| `tbl_dim_repository` | Repository dimension |
| `tbl_dim_project` | Project dimension |

---

## 3. Data Grain

The data grain of `tbl_fact_ci_run` is:

```text
1 row = 1 GitHub Actions job
```

A workflow run can have multiple jobs.

Example:

| Workflow Run ID | Job ID | Workflow Name | Job Name | Status |
|---|---|---|---|---|
| `27660577827` | `77123456789` | `CI` | `build` | `SUCCESS` |
| `27660577827` | `77123456790` | `CI` | `test` | `FAILURE` |

Both rows belong to the same workflow run, but each row represents a different job.

---

## 4. CI Job Metadata Data

Suggested fields on `tbl_fact_ci_run` should support:

- project reference
- repository reference
- ticket reference if resolved
- PR reference if resolved
- connector run reference
- CI provider
- external workflow run ID
- external job ID
- workflow name
- job name
- status
- started time
- completed time
- CI URL
- created time
- updated time

---

## 5. Table Design

### 5.1 `tbl_fact_ci_run`

| Column | Type | Required | Description |
|---|---:|---:|---|
| `ci_run_id` | UUID | Yes | Internal primary key. Despite the name, one row represents one CI job. |
| `project_id` | UUID | Yes | FK to `tbl_dim_project` |
| `repository_id` | UUID | Yes | FK to `tbl_dim_repository` |
| `ticket_id` | UUID | No | FK to `tbl_dim_ticket`, nullable when unresolved |
| `pull_request_id` | UUID | No | FK to `tbl_fact_pull_request`, nullable when unresolved |
| `connector_run_id` | UUID | No | FK to `tbl_connector_run` |
| `ci_provider` | VARCHAR(50) | Yes | Example: `GITHUB_ACTIONS` |
| `external_run_id` | VARCHAR(100) | Yes | GitHub Actions workflow run ID |
| `external_job_id` | VARCHAR(100) | Yes | GitHub Actions job ID |
| `workflow_name` | VARCHAR(255) | Yes | Workflow name |
| `job_name` | VARCHAR(255) | Yes | Job name |
| `status` | VARCHAR(50) | Yes | Normalized CI job status |
| `started_at` | TIMESTAMPTZ | No | CI job started timestamp |
| `completed_at` | TIMESTAMPTZ | No | CI job completed timestamp |
| `ci_url` | TEXT | Yes | GitHub Actions job URL. Fallback to workflow run URL if job URL is not available. |
| `created_at` | TIMESTAMPTZ | Yes | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | Record update timestamp |

---

## 6. Status Values

Allowed values for `tbl_fact_ci_run.status`:

```text
SUCCESS
FAILURE
CANCELLED
SKIPPED
IN_PROGRESS
QUEUED
UNKNOWN
```

---

## 7. SQL DDL

```sql
CREATE TABLE IF NOT EXISTS tbl_fact_ci_run (
    ci_run_id UUID PRIMARY KEY,

    project_id UUID NOT NULL,
    repository_id UUID NOT NULL,
    ticket_id UUID NULL,
    pull_request_id UUID NULL,
    connector_run_id UUID NULL,

    ci_provider VARCHAR(50) NOT NULL,
    external_run_id VARCHAR(100) NOT NULL,
    external_job_id VARCHAR(100) NOT NULL,

    workflow_name VARCHAR(255) NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,

    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    ci_url TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ci_run_project
        FOREIGN KEY (project_id)
        REFERENCES tbl_dim_project(project_id),

    CONSTRAINT fk_ci_run_repository
        FOREIGN KEY (repository_id)
        REFERENCES tbl_dim_repository(repository_id),

    CONSTRAINT fk_ci_run_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tbl_dim_ticket(ticket_id),

    CONSTRAINT fk_ci_run_pull_request
        FOREIGN KEY (pull_request_id)
        REFERENCES tbl_fact_pull_request(pull_request_id),

    CONSTRAINT fk_ci_run_connector_run
        FOREIGN KEY (connector_run_id)
        REFERENCES tbl_connector_run(connector_run_id),

    CONSTRAINT chk_ci_run_status
        CHECK (status IN (
            'SUCCESS',
            'FAILURE',
            'CANCELLED',
            'SKIPPED',
            'IN_PROGRESS',
            'QUEUED',
            'UNKNOWN'
        )),

    CONSTRAINT chk_ci_run_time_order
        CHECK (
            completed_at IS NULL
            OR started_at IS NULL
            OR started_at <= completed_at
        )
);
```

---

## 8. Unique Key / Idempotency

The same CI job should not be inserted multiple times.

Recommended unique key:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_tbl_fact_ci_run_provider_repo_run_job
ON tbl_fact_ci_run (
    ci_provider,
    repository_id,
    external_run_id,
    external_job_id
);
```

Rule:

- If the unique key already exists, update `status`, `started_at`, `completed_at`, `ci_url`, `connector_run_id`, and `updated_at`.
- If the unique key does not exist, insert a new row.

---

## 9. Recommended Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_tbl_fact_ci_run_repository
ON tbl_fact_ci_run(repository_id);

CREATE INDEX IF NOT EXISTS idx_tbl_fact_ci_run_ticket
ON tbl_fact_ci_run(ticket_id);

CREATE INDEX IF NOT EXISTS idx_tbl_fact_ci_run_pull_request
ON tbl_fact_ci_run(pull_request_id);

CREATE INDEX IF NOT EXISTS idx_tbl_fact_ci_run_external_run_id
ON tbl_fact_ci_run(external_run_id);

CREATE INDEX IF NOT EXISTS idx_tbl_fact_ci_run_external_job_id
ON tbl_fact_ci_run(external_job_id);

CREATE INDEX IF NOT EXISTS idx_tbl_fact_ci_run_status
ON tbl_fact_ci_run(status);

CREATE INDEX IF NOT EXISTS idx_tbl_fact_ci_run_started_at
ON tbl_fact_ci_run(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_tbl_fact_ci_run_completed_at
ON tbl_fact_ci_run(completed_at DESC);
```

---

## 10. Example Records

### 10.1 Workflow Run with Two Jobs

```json
[
  {
    "ciRunId": "8b2a8d33-4ad3-4dd2-84f5-3de4f7df42a1",
    "projectId": "PROJECT_UUID",
    "repositoryId": "REPOSITORY_UUID",
    "ticketId": "TICKET_UUID",
    "pullRequestId": "PR_UUID",
    "connectorRunId": "CONNECTOR_RUN_UUID",
    "ciProvider": "GITHUB_ACTIONS",
    "externalRunId": "27660577827",
    "externalJobId": "77123456789",
    "workflowName": "CI",
    "jobName": "build",
    "status": "SUCCESS",
    "startedAt": "2026-06-17T01:56:39Z",
    "completedAt": "2026-06-17T01:58:20Z",
    "ciUrl": "https://github.com/org/repo/actions/runs/27660577827/job/77123456789"
  },
  {
    "ciRunId": "4d1f6bd7-f6c1-4ccf-8b7d-7b45f7ff0e22",
    "projectId": "PROJECT_UUID",
    "repositoryId": "REPOSITORY_UUID",
    "ticketId": "TICKET_UUID",
    "pullRequestId": "PR_UUID",
    "connectorRunId": "CONNECTOR_RUN_UUID",
    "ciProvider": "GITHUB_ACTIONS",
    "externalRunId": "27660577827",
    "externalJobId": "77123456790",
    "workflowName": "CI",
    "jobName": "test",
    "status": "FAILURE",
    "startedAt": "2026-06-17T01:56:40Z",
    "completedAt": "2026-06-17T01:59:20Z",
    "ciUrl": "https://github.com/org/repo/actions/runs/27660577827/job/77123456790"
  }
]
```

---

## 11. Query Examples

### 11.1 Latest CI Jobs by PR

```sql
SELECT
    c.external_run_id,
    c.external_job_id,
    c.workflow_name,
    c.job_name,
    c.status,
    c.started_at,
    c.completed_at,
    c.ci_url
FROM tbl_fact_ci_run c
WHERE c.pull_request_id = :pull_request_id
ORDER BY c.started_at DESC, c.job_name ASC;
```

### 11.2 Failed CI Jobs by Ticket

```sql
SELECT
    c.external_run_id,
    c.external_job_id,
    c.workflow_name,
    c.job_name,
    c.status,
    c.completed_at,
    c.ci_url
FROM tbl_fact_ci_run c
WHERE c.ticket_id = :ticket_id
  AND c.status = 'FAILURE'
ORDER BY c.completed_at DESC;
```

### 11.3 Workflow Run Summary

```sql
SELECT
    c.external_run_id,
    c.workflow_name,
    COUNT(*) AS job_count,
    SUM(CASE WHEN c.status = 'SUCCESS' THEN 1 ELSE 0 END) AS success_count,
    SUM(CASE WHEN c.status = 'FAILURE' THEN 1 ELSE 0 END) AS failure_count,
    MAX(c.completed_at) AS latest_completed_at
FROM tbl_fact_ci_run c
WHERE c.repository_id = :repository_id
GROUP BY c.external_run_id, c.workflow_name
ORDER BY latest_completed_at DESC;
```

---

## 12. Key Rules

- CI source is GitHub Actions.
- The system stores one row per GitHub Actions job.
- `external_run_id` stores the workflow run ID.
- `external_job_id` stores the job ID and is required.
- `ci_url` stores the job URL when available.
- Raw CI logs must not be persisted.
- Full CI artifacts must not be persisted.
- CI URL is stored as a reference to source of truth.
- The collector must be idempotent.
- `tbl_connector_run` must record collector execution result.
- No non-`tbl_` table names may be introduced.
