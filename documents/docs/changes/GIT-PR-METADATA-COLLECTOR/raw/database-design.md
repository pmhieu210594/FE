# Database Design - Git/PR Metadata Collector

**Ticket ID:** GIT-PR-METADATA-COLLECTOR  
**Created date:** 2026-06-17  
**Author:** nk_trung  
**Purpose:** Design the database for the Git/PR Metadata Collector feature within the MVP scope, prioritizing reuse of the existing schema and adding columns or tables only when necessary.

---

## 1. Design Goal

The Git/PR Metadata Collector needs to store minimal metadata from Pull Requests and Git commits to support the following MVP goals:

```text
Ticket -> Evidence Files
Ticket -> PR -> Commit -> Changed Files
```

This data is used for:

- Traceability Map.
- Ticket Evidence Detail.
- Basic Data Ops dashboard.
- Checking tickets that have evidence but are not linked to a PR yet.
- Checking PRs that have development activity but do not have matching evidence yet.
- Preparing data for the future Evidence Quality Score.

This design is not intended to store source code, raw diffs, raw patches, secrets, raw prompts, or raw AI chat logs.

---

## 2. Design Principles

| Principle | Applied content |
|---|---|
| Reuse first | Prefer existing tables in schema V4/V160/V161. |
| Metadata only | Store only metadata, URLs, paths, hashes, added/deleted line counts, and status. |
| PR as collection root | In the MVP, PR is the primary collection unit; commits and changed files are collected from the PR. |
| Idempotent | Re-running the collector must not create duplicate PR, commit, changed file, or traceability link records. |
| Artifact scanner compatible | Do not break the existing Artifact Scanner flow; only add traceability data. |
| Provider adapter friendly | The schema supports GitHub first, but should not be locked to GitHub if GitLab is added later. |
| Security by design | Do not store tokens, source content, raw diffs/patches, or secrets. Error logs must be safe. |

---

## 3. Existing Related Schema

The current codebase already contains many tables suitable for this feature.

### 3.1 Existing master/dimension tables

| Table | Current role | Used by Git/PR Collector |
|---|---|---|
| `tbl_dim_repository` | Repository master | Identify the repository to collect, host type, default branch. |
| `tbl_dim_project` | Project master | Derive the project for the ticket/repository. |
| `tbl_dim_ticket` | Ticket master | Link PR/commit back to a ticket via `ticket_id` or `external_ticket_key`. |
| `tbl_dim_member_pseudonym` | Pseudonymized member | Store author/reviewer when mapping is possible. |
| `tbl_source_connector` | Connector definition | Define the `GIT_PR_METADATA_COLLECTOR` connector. |
| `tbl_connector_run` | Connector run log | Store run logs for manual collection and webhook-triggered collection. |

### 3.2 Existing fact tables

| Table | Current role | Used by Git/PR Collector |
|---|---|---|
| `tbl_fact_pull_request` | Stores PR metadata | Reused as the main PR table. |
| `tbl_fact_commit` | Stores commit metadata | Reused as the main commit table. |
| `tbl_fact_pull_request_commit` | PR - Commit relationship | Reused. |
| `tbl_fact_commit_changed_file` | Changed files by commit | Partially reused; may need expansion if storing clear file paths. |
| `tbl_fact_traceability_link` | Traceability links | Reused to create Ticket -> PR, PR -> Commit, and PR -> Changed File links. |
| `tbl_fact_artifact_snapshot` | Evidence artifact snapshot | Not written by the Git/PR Collector directly, but used together to build Ticket Evidence Detail. |

---

## 4. Impact Assessment on Artifact Scanner

### 4.1 What the Artifact Scanner currently does

The Artifact Scanner currently scans evidence files under:

```text
docs/changes/<TICKET>/
docs/maintenance/phase0/
```

It writes data to:

```text
tbl_fact_artifact_snapshot
tbl_connector_run
vw_artifact_inventory_current
```

In addition, the current source already has a GitHub webhook. When a PR event is received, the webhook currently:

1. Verifies the GitHub signature.
2. Gets the list of changed file paths in the PR.
3. Finds paths in the form `docs/changes/<TICKET>/...`.
4. Upserts a minimal ticket.
5. Triggers the Artifact Scanner for the corresponding repository/revision.

### 4.2 Does the Git/PR Collector affect this?

The Git/PR Metadata Collector **should not replace the Artifact Scanner**.

The two features complement each other:

| Feature | Main responsibility | Main table |
|---|---|---|
| Artifact Scanner | Know which evidence files exist for a ticket, which hashes exist, and scan status | `tbl_fact_artifact_snapshot` |
| Git/PR Metadata Collector | Know which PRs, commits, and code files are related to a ticket | `tbl_fact_pull_request`, `tbl_fact_commit`, changed file tables, `tbl_fact_traceability_link` |

When combined:

```text
Artifact Scanner:
Ticket -> spec-pack.md / impl-plan.md / test-results.md / report.md

Git/PR Collector:
Ticket -> PR -> Commit -> Changed Files

Combined:
Ticket -> Evidence Files
Ticket -> PR -> Commit -> Changed Files
```

### 4.3 Conflicts to avoid

| Risk | Cause | DB mitigation |
|---|---|---|
| Duplicate ticket | Artifact Scanner and Git/PR Collector both detect the ticket key | Use `tbl_dim_ticket(project_id, external_ticket_key)` as the unique source. |
| Duplicate connector run | Both features use `tbl_connector_run` | Create a separate connector type `GIT_PR_METADATA_COLLECTOR`. |
| PR status mixed with ticket status | The current Artifact Scanner view exposes `ticket.status AS pr_status` | Git/PR Collector should store PR status in `tbl_fact_pull_request.status`; if inventory display is needed, update the view to join the latest PR. |
| Duplicate traceability link | Manual collection and webhook collection both create the link | Use the existing unique constraint `uq_traceability(source_type, source_id, target_type, target_id)`. |
| Changed file path cannot be displayed | The current table only has `file_path_hash` | Add a `file_path` column or a new PR changed file table. |

### 4.4 Conclusion on impact

The Git/PR Metadata Collector **does not negatively affect** the Artifact Scanner if the following rules are followed:

- Do not write to `tbl_fact_artifact_snapshot`.
- Do not share the `ARTIFACT_SCANNER` connector type.
- Do not create duplicate tickets.
- Do not overwrite ticket status arbitrarily.
- Only add traceability links.
- If the current webhook already triggers the Artifact Scanner, it can also be reused to call the Git/PR Collector.

### 4.5 Mandatory integration notes with Artifact Scanner

The following items are integration constraints to avoid confusion between the Artifact Scanner and the Git/PR Metadata Collector, or between their data sources.

#### 4.5.1 Responsibility boundary

The current Artifact Scanner is considered to already cover the MVP scope for **Evidence Inventory**. It is responsible for scanning the following structure:

```text
docs/changes/<TICKET>/
```

and recording the existence, path, hash, size, and status of artifacts such as `spec-pack.md`, `impl-plan.md`, `test-plan.md`, `test-results.md`, and `report.md`.

The Git/PR Metadata Collector **does not replace** the Artifact Scanner. The two features complement each other:

| Feature | Role |
|---|---|
| Artifact Scanner | Determine whether the ticket has enough evidence files |
| Git/PR Metadata Collector | Determine which PR, commit, and changed files are related to the ticket |

When combined, the system can show basic traceability:

```text
Ticket
├─ Evidence Files
│  ├─ spec-pack.md
│  ├─ impl-plan.md
│  ├─ test-results.md
│  └─ report.md
└─ Development Activity
   ├─ Pull Request
   ├─ Commit
   └─ Changed Files
```

#### 4.5.2 Shared `ticket_id` convention

- Artifact Scanner infers `ticket_id` from the folder `docs/changes/<TICKET>/`.
- Git/PR Metadata Collector infers `linked_ticket_id` from the source branch, PR title, commit message, and changed file path.
- Both features must use the same `ticket_id` / `external_ticket_key` convention.
- If the Artifact Scanner has already created a ticket, the Git/PR Metadata Collector must reuse that ticket instead of creating a duplicate.
- If the Git/PR Metadata Collector detects a PR with a `linked_ticket_id` but there is no matching evidence folder yet, the PR data should still be stored so the dashboard can warn: “PR has development activity but lacks evidence.”

#### 4.5.3 Run log and data table rules

- The two collectors should share the same ingest run-log mechanism, but use different `connector_name` or `connector_type`, for example:
  - `ARTIFACT_SCANNER`
  - `GIT_PR_METADATA_COLLECTOR`
- The Git/PR Metadata Collector must not write into `tbl_fact_artifact_snapshot`, unless there is a separate requirement in the future.
- The Git/PR Metadata Collector should only create or update PR, commit, changed file metadata, and traceability links.
- The Artifact Scanner remains the primary source for Evidence Inventory.

#### 4.5.4 Additional acceptance criteria for integration

| AC ID | Acceptance Criteria |
|---|---|
| AC-GITPR-18 | If `linked_ticket_id` already exists because it was created by the Artifact Scanner, the Git/PR Metadata Collector must reuse that ticket and must not create a duplicate ticket. |
| AC-GITPR-19 | If a PR has a `linked_ticket_id` but no matching evidence folder yet, the system must still store the PR/commit metadata so missing evidence can be flagged. |

---

## 5. Mapping requirement fields to existing tables

### 5.1 Pull Request metadata

| Requirement field | Existing table | Existing column | Proposal |
|---|---|---|---|
| repository_id | `tbl_fact_pull_request` | `repository_id` | Reuse |
| provider PR ID | `tbl_fact_pull_request` | `external_pr_id` | Reuse, but define clearly as either a provider stable ID or a PR number |
| PR number | `tbl_fact_pull_request` | Not clearly available | Add `pr_number INT` |
| title | `tbl_fact_pull_request` | `title` | Reuse |
| status | `tbl_fact_pull_request` | `status pr_status` | Reuse; add `UNKNOWN` if needed |
| source_branch | `tbl_fact_pull_request` | `source_branch` | Reuse |
| target_branch | `tbl_fact_pull_request` | `target_branch` | Reuse |
| author_pseudonym | `tbl_fact_pull_request` | `author_member_key` | Add `author_pseudonym` if the member cannot be mapped |
| provider created_at | `tbl_fact_pull_request` | `opened_at` | Reuse, meaning PR created/opened time |
| provider updated_at | `tbl_fact_pull_request` | No separate provider updated time | Add `provider_updated_at` |
| merged_at | `tbl_fact_pull_request` | `merged_at` | Reuse |
| closed_at | `tbl_fact_pull_request` | `closed_at` | Reuse |
| linked_ticket_id | `tbl_fact_pull_request` | `ticket_id`, `linked_issue_key` | Reuse `ticket_id`; add `detected_ticket_key` if the ticket does not yet exist |
| review_state | `tbl_fact_pull_request` | No aggregate state yet | Add `review_state` |
| review_count | `tbl_fact_pull_request` | Not available | Add `review_count INT` |
| comment_count | `tbl_fact_pull_request` | Not available | Add `comment_count INT` |
| match_confidence | `tbl_fact_pull_request` | Not available | Add `match_confidence_level`, `match_confidence` |
| PR URL | `tbl_fact_pull_request` | Not available | Add `pr_url` or `pr_url_hash` depending on policy |

### 5.2 Commit metadata

| Requirement field | Existing table | Existing column | Proposal |
|---|---|---|---|
| repository_id | `tbl_fact_commit` | `repository_id` | Reuse |
| commit_hash | `tbl_fact_commit` | `commit_hash` | Reuse |
| related PR | `tbl_fact_pull_request_commit` | `pr_id`, `commit_id` | Reuse |
| branch_name | `tbl_fact_commit` | `branch_name` | Reuse |
| commit message | `tbl_fact_commit` | `message_hash` | Add `commit_message` or `commit_message_summary` |
| author_pseudonym | `tbl_fact_commit` | `author_pseudonym` | Reuse |
| committed_at | `tbl_fact_commit` | `committed_at` | Reuse |
| linked_ticket_id | `tbl_fact_commit` | `ticket_id` | Reuse; add `detected_ticket_key` if the ticket does not yet exist |
| commit URL | `tbl_fact_commit` | Not available | Add `commit_url` or `commit_url_hash` |
| total additions/deletions | `tbl_fact_commit` | `added_lines`, `deleted_lines` | Reuse |
| changed file count | `tbl_fact_commit` | `changed_file_count` | Reuse |

### 5.3 Changed file metadata

There is already `tbl_fact_commit_changed_file`, but that table stores changed files by commit and only has `file_path_hash`, not a displayable `file_path`.

| Requirement field | Existing table | Existing column | Proposal |
|---|---|---|---|
| commit_id | `tbl_fact_commit_changed_file` | `commit_id` | Reuse if collecting files by commit |
| repository_id | `tbl_fact_commit_changed_file` | `repository_id` | Reuse |
| file path | `tbl_fact_commit_changed_file` | `file_path_hash` | Add `file_path` if policy allows storing the path |
| additions | `tbl_fact_commit_changed_file` | `added_lines` | Reuse |
| deletions | `tbl_fact_commit_changed_file` | `deleted_lines` | Reuse |
| change status | `tbl_fact_commit_changed_file` | `change_type` | Reuse |
| file type | `tbl_fact_commit_changed_file` | `file_extension` | Optionally add `file_type` |
| PR-level changed file | Not available | Not available | Add a new table if collecting by PR files API |

---

## 6. Overall design proposal

### 6.1 Reuse existing tables

The following tables are reused and not recreated:

```text
tbl_dim_repository
tbl_dim_project
tbl_dim_ticket
tbl_dim_member_pseudonym
tbl_source_connector
tbl_connector_run
tbl_fact_pull_request
tbl_fact_commit
tbl_fact_pull_request_commit
tbl_fact_commit_changed_file
tbl_fact_traceability_link
```

### 6.2 Existing tables that need new columns

#### 6.2.1 `tbl_fact_pull_request`

Proposed new columns:

| Column | Type | Reason |
|---|---|---|
| `provider_pr_id` | `VARCHAR(100)` | Distinguish the provider stable PR ID from the PR number. |
| `pr_number` | `INT` | GitHub/GitLab PR number used by APIs and URLs. |
| `author_pseudonym` | `VARCHAR(255)` | Store the author when the member cannot be mapped. |
| `provider_updated_at` | `TIMESTAMPTZ` | Store the provider's PR updated time. |
| `review_state` | `review_state` | Aggregate review state for dashboard/query efficiency. |
| `review_count` | `INT DEFAULT 0` | Number of reviews from the provider. |
| `comment_count` | `INT DEFAULT 0` | Number of comments from the provider. |
| `detected_ticket_key` | `VARCHAR(100)` | Store the detected ticket key even when there is no ticket row yet. |
| `match_confidence` | `NUMERIC(5,2)` | Matching confidence from 0 to 100. |
| `match_confidence_level` | `link_confidence_level` | HIGH/MEDIUM/LOW/UNKNOWN. |
| `match_source` | `VARCHAR(50)` | SOURCE_BRANCH / PR_TITLE / COMMIT_MESSAGE / CHANGED_FILE_PATH. |
| `pr_url` | `TEXT` | Allow clicking through to the source PR. |
| `last_collected_run_id` | `UUID` | Link to the most recent collection run. |

Notes:

- `external_pr_id` can be kept for compatibility. In the MVP, the convention should be:
  - `external_pr_id`: provider stable PR ID if the provider has one.
  - `pr_number`: the visible PR number, for example `#123`.
- If you do not want to store the URL as plain text, you can store `pr_url_hash`, but MVP dashboards usually need the URL to open the source.

#### 6.2.2 `tbl_fact_commit`

Proposed new columns:

| Column | Type | Reason |
|---|---|---|
| `commit_message` | `TEXT` | The requirement needs the commit message for matching and traceability debugging. |
| `detected_ticket_key` | `VARCHAR(100)` | Store the detected ticket key when there is no ticket row yet. |
| `match_confidence` | `NUMERIC(5,2)` | Matching confidence from 0 to 100. |
| `match_confidence_level` | `link_confidence_level` | HIGH/MEDIUM/LOW/UNKNOWN. |
| `commit_url` | `TEXT` | Allow clicking through to the source commit. |
| `last_collected_run_id` | `UUID` | Link to the most recent collection run. |

Security note:

- A commit message is metadata, not source code.
- However, a commit message may still contain sensitive information entered by mistake. If this is a concern, you can store `commit_message_summary` or `commit_message_hash` and only keep the message in memory for matching. For the MVP, the current requirement asks for `commit_message`, so the proposal is to store it, but a light DLP/secret scan may be needed if available.

#### 6.2.3 `tbl_fact_commit_changed_file`

Proposed new columns:

| Column | Type | Reason |
|---|---|---|
| `file_path` | `TEXT` | The requirement needs the changed file path to show impact and traceability. |
| `file_type` | `VARCHAR(50)` | Classify as backend/frontend/config/test/docs/unknown. |
| `old_file_path` | `TEXT` | Support renamed files if the provider returns them. |
| `last_collected_run_id` | `UUID` | Link to the most recent collection run. |

Notes:

- The current `file_path_hash` should be kept for safe search/uniqueness.
- Do not store file content, raw diffs, or patches.

#### 6.2.4 `tbl_connector_run`

Proposed additional columns for shared use by the Artifact Scanner and Git/PR Collector:

| Column | Type | Reason |
|---|---|---|
| `target_repository_id` | `UUID` | Easier querying by repository, since the connector can be global. |
| `target_ref` | `VARCHAR(255)` | Store the branch/ref if available. |
| `target_pr_number` | `INT` | Store the PR number when running PR-specific collection. |
| `trigger_type` | `VARCHAR(50)` | MANUAL / WEBHOOK / SCHEDULED. |
| `processed_pr_count` | `INT DEFAULT 0` | As required. |
| `processed_commit_count` | `INT DEFAULT 0` | As required. |
| `processed_changed_file_count` | `INT DEFAULT 0` | As required. |
| `failure_count` | `INT DEFAULT 0` | As required. |
| `metadata` | `JSONB DEFAULT '{}'` | Store extra details such as deliveryId, provider action, rate limit info. |

Notes:

- The existing `records_read` and `records_written` fields should remain for compatibility.
- The new columns help the Data Ops dashboard display the correct counts without parsing JSON.

#### 6.2.5 `tbl_fact_traceability_link`

This table is already sufficient. No mandatory new columns are needed.

You may optionally consider adding:

| Column | Type | Reason |
|---|---|---|
| `last_collected_run_id` | `UUID` | Know which run created or updated the link. |

If you do not want to add it, you can store the run ID in the existing `evidence` JSONB field.

---

## 7. New table proposal

### 7.1 Do we need a new table?

Yes, **one new table should be added** if the collector retrieves changed files through the PR files API:

```text
tbl_fact_pull_request_changed_file
```

### 7.2 Why a new table is needed

The current source already has `GithubPullRequestFilesPort.listChangedFilePaths(repositoryFullName, pullRequestNumber)`, which means changed files are being retrieved at the Pull Request level.

The existing `tbl_fact_commit_changed_file` table is a commit-level table and requires `commit_id`.

These two data types are different:

| Data type | Common API source | Granularity | Suitable table |
|---|---|---|---|
| PR changed files | `/pulls/{number}/files` | PR x file | `tbl_fact_pull_request_changed_file` |
| Commit changed files | `/commits/{sha}` | Commit x file | `tbl_fact_commit_changed_file` |

If PR-level files are forced into `tbl_fact_commit_changed_file`, the system would have to attach the file to a fake commit or to the last commit, which would make the data semantics incorrect.

Therefore, adding a PR-level changed file table is reasonable for the MVP.

### 7.3 `tbl_fact_pull_request_changed_file` design

| Column | Type | Required | Description |
|---|---|---:|---|
| `pr_changed_file_id` | `UUID` | Yes | Primary key. |
| `pr_id` | `UUID` | Yes | FK to `tbl_fact_pull_request`. |
| `repository_id` | `UUID` | Yes | FK to `tbl_dim_repository`. |
| `file_path` | `TEXT` | Yes | Path of the changed file. |
| `file_path_hash` | `VARCHAR(128)` | Yes | Hash of the file path for uniqueness/indexing. |
| `old_file_path` | `TEXT` | No | Old path if renamed. |
| `change_type` | `VARCHAR(50)` | No | added/modified/removed/renamed/unknown. |
| `file_extension` | `VARCHAR(50)` | No | Extension. |
| `file_type` | `VARCHAR(50)` | No | backend/frontend/config/test/docs/unknown. |
| `added_lines` | `INT` | No | Number of lines added. |
| `deleted_lines` | `INT` | No | Number of lines deleted. |
| `last_collected_run_id` | `UUID` | No | Most recent collection run. |
| `created_at` | `TIMESTAMPTZ` | Yes | Audit timestamp. |
| `created_by` | `VARCHAR(100)` | Yes | Audit user/source. |
| `updated_at` | `TIMESTAMPTZ` | Yes | Audit timestamp. |
| `updated_by` | `VARCHAR(100)` | Yes | Audit user/source. |

Unique key:

```text
uq_pr_changed_file = (pr_id, file_path_hash)
```

Reason:

- A PR should have only one current row for each file path.
- When the collector runs again, update additions/deletions/change_type instead of creating duplicates.

---

## 8. Required enum additions

The existing schema uses PostgreSQL enums.

### 8.1 `pr_status`

Current values:

```text
OPEN, MERGED, CLOSED, DRAFT
```

The requirement includes `UNKNOWN`. Proposal:

```sql
ALTER TYPE pr_status ADD VALUE IF NOT EXISTS 'UNKNOWN';
```

### 8.2 `review_state`

Current values:

```text
REQUESTED, COMMENTED, CHANGES_REQUESTED, APPROVED, DISMISSED
```

The requirement includes:

```text
APPROVED, CHANGES_REQUESTED, REVIEW_REQUIRED, UNKNOWN
```

Proposal:

```sql
ALTER TYPE review_state ADD VALUE IF NOT EXISTS 'REVIEW_REQUIRED';
ALTER TYPE review_state ADD VALUE IF NOT EXISTS 'UNKNOWN';
```

Notes:

- `REQUESTED` can be mapped to `REVIEW_REQUIRED` in the UI, but adding the enum makes the requirement clearer.

### 8.3 `run_status`

Current values:

```text
SUCCESS, FAILED, CANCELLED, SKIPPED, RUNNING, PENDING, UNKNOWN
```

The requirement includes `PARTIAL_SUCCESS`. Proposal:

```sql
ALTER TYPE run_status ADD VALUE IF NOT EXISTS 'PARTIAL_SUCCESS';
```

### 8.4 `link_confidence_level`

Current values:

```text
HIGH, MEDIUM, LOW
```

The requirement includes `UNKNOWN`. Proposal:

```sql
ALTER TYPE link_confidence_level ADD VALUE IF NOT EXISTS 'UNKNOWN';
```

---

## 9. Data relationships

### 9.1 Core relationships

```text
tbl_dim_repository
  -> tbl_fact_pull_request
       -> tbl_fact_pull_request_commit
            -> tbl_fact_commit
                 -> tbl_fact_commit_changed_file
       -> tbl_fact_pull_request_changed_file

 tbl_dim_ticket
  -> tbl_fact_pull_request.ticket_id
  -> tbl_fact_commit.ticket_id
  -> tbl_fact_traceability_link.ticket_id

 tbl_fact_traceability_link
  Ticket -> PR
  PR -> Commit
  PR -> PR_CHANGED_FILE
  Commit -> COMMIT_CHANGED_FILE
```

### 9.2 Traceability link source/target convention

| Link | source_type | source_id | target_type | target_id |
|---|---|---|---|---|
| Ticket -> PR | `TICKET` | `tbl_dim_ticket.ticket_id` | `PR` | `tbl_fact_pull_request.pr_id` |
| PR -> Commit | `PR` | `tbl_fact_pull_request.pr_id` | `COMMIT` | `tbl_fact_commit.commit_id` |
| PR -> Changed File | `PR` | `tbl_fact_pull_request.pr_id` | `PR_CHANGED_FILE` | `tbl_fact_pull_request_changed_file.pr_changed_file_id` |
| Commit -> Changed File | `COMMIT` | `tbl_fact_commit.commit_id` | `COMMIT_CHANGED_FILE` | `tbl_fact_commit_changed_file.commit_changed_file_id` |
| Ticket -> Commit | `TICKET` | `tbl_dim_ticket.ticket_id` | `COMMIT` | `tbl_fact_commit.commit_id` |

Notes:

- `source_id` and `target_id` in the current table are `VARCHAR(255)`, so UUIDs are stored as strings.
- The existing unique constraint `uq_traceability(source_type, source_id, target_type, target_id)` is enough to prevent duplicates.

---

## 10. Ticket matching and linked ticket storage

### 10.1 Matching sources

MVP priority order:

```text
source_branch -> PR title -> commit message -> changed file path
```

### 10.2 How to store when the ticket exists

If `external_ticket_key` is found and the ticket exists in `tbl_dim_ticket`:

- Set `tbl_fact_pull_request.ticket_id`.
- Set `tbl_fact_commit.ticket_id` if the commit matches the same ticket.
- Create a `TICKET -> PR` traceability link.
- Create a `TICKET -> COMMIT` traceability link if needed.

### 10.3 How to store when the ticket does not exist yet

If a ticket key is detected but there is no row in `tbl_dim_ticket` yet:

- Store `detected_ticket_key` in the PR/commit.
- It is not mandatory to auto-create a ticket from the Git/PR Collector.
- Reconciliation can happen later after the Artifact Scanner or ticket sync creates the ticket.

Reason:

- The Artifact Scanner already has logic to auto-create a minimal ticket from `docs/changes/<TICKET>/`.
- If the Git/PR Collector also auto-creates tickets from branch/title, the risk of creating noisy tickets is higher.

MVP recommendation:

- The Git/PR Collector should only auto-create a ticket if the rule has been confirmed by PM.
- By default: detect and store `detected_ticket_key`, then link it if the ticket already exists.

---

## 11. Idempotency design

### 11.1 Pull Request

Existing unique key:

```text
uq_pr_per_repo(repository_id, external_pr_id)
```

Recommended additional unique key by PR number:

```text
uq_pr_number_per_repo(repository_id, pr_number)
```

Reason:

- Manual collection often uses the PR number.
- GitHub webhook events also send the PR number.
- Provider stable ID and PR number should not be mixed.

### 11.2 Commit

Existing unique key:

```text
uq_commit_per_repo(repository_id, commit_hash)
```

Keep as is.

### 11.3 PR - Commit

Existing primary key:

```text
(pr_id, commit_id)
```

Keep as is.

### 11.4 Commit changed file

Recommended additional unique key:

```text
uq_commit_changed_file(commit_id, file_path_hash)
```

### 11.5 PR changed file

If a new table is added, the unique key should be:

```text
uq_pr_changed_file(pr_id, file_path_hash)
```

### 11.6 Traceability link

Existing unique key:

```text
uq_traceability(source_type, source_id, target_type, target_id)
```

Keep as is.

---

## 12. Proposed MVP view

### 12.1 `vw_git_pr_traceability_current`

Purpose: support Ticket Evidence Detail and the Traceability Map.

Suggested output:

| Field | Description |
|---|---|
| `ticket_id` | Internal ticket ID. |
| `external_ticket_key` | Ticket key. |
| `repository_id` | Repository. |
| `repo_name_masked` | Masked repository name. |
| `pr_id` | Internal PR ID. |
| `pr_number` | PR number. |
| `pr_status` | PR status. |
| `review_state` | Aggregate review state. |
| `source_branch` | Source branch. |
| `target_branch` | Target branch. |
| `opened_at` | PR opened time. |
| `merged_at` | PR merged time. |
| `commit_id` | Internal commit ID. |
| `commit_hash` | Commit hash. |
| `committed_at` | Commit time. |
| `changed_file_count` | Changed file count. |
| `pr_url` | PR URL. |
| `commit_url` | Commit URL. |

### 12.2 Do we need to update `vw_artifact_inventory_current`?

Not required for this task.

However, the current view exposes `ticket.status AS pr_status`. Once the Git/PR Collector has an official PR table, consider updating the view so it gets the latest PR status from `tbl_fact_pull_request` instead of using the ticket status.

If the current Artifact Inventory UI depends on `pr_status`, handle this as a separate task.

---

## 13. Migration proposal

Suggested migration name:

```text
V170__git_pr_metadata_collector_schema.sql
```

### 13.1 Enum changes

```sql
ALTER TYPE pr_status ADD VALUE IF NOT EXISTS 'UNKNOWN';
ALTER TYPE review_state ADD VALUE IF NOT EXISTS 'REVIEW_REQUIRED';
ALTER TYPE review_state ADD VALUE IF NOT EXISTS 'UNKNOWN';
ALTER TYPE run_status ADD VALUE IF NOT EXISTS 'PARTIAL_SUCCESS';
ALTER TYPE link_confidence_level ADD VALUE IF NOT EXISTS 'UNKNOWN';
```

### 13.2 Connector seed

```sql
INSERT INTO tbl_source_connector (
    project_id,
    repository_id,
    connector_type,
    connector_name,
    config_hash,
    enabled,
    created_by,
    updated_by
)
SELECT NULL, NULL, 'GIT_PR_METADATA_COLLECTOR', 'Git/PR Metadata Collector', NULL, TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1
    FROM tbl_source_connector
    WHERE connector_type = 'GIT_PR_METADATA_COLLECTOR'
);
```

### 13.3 Alter `tbl_connector_run`

```sql
ALTER TABLE tbl_connector_run
    ADD COLUMN IF NOT EXISTS target_repository_id UUID REFERENCES tbl_dim_repository(repository_id),
    ADD COLUMN IF NOT EXISTS target_ref VARCHAR(255),
    ADD COLUMN IF NOT EXISTS target_pr_number INT,
    ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS processed_pr_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS processed_commit_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS processed_changed_file_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS failure_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE tbl_connector_run
    ADD CONSTRAINT ck_connector_run_gitpr_counts
    CHECK (
        processed_pr_count >= 0
        AND processed_commit_count >= 0
        AND processed_changed_file_count >= 0
        AND failure_count >= 0
    );
```

### 13.4 Alter `tbl_fact_pull_request`

```sql
ALTER TABLE tbl_fact_pull_request
    ADD COLUMN IF NOT EXISTS provider_pr_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS pr_number INT,
    ADD COLUMN IF NOT EXISTS author_pseudonym VARCHAR(255),
    ADD COLUMN IF NOT EXISTS provider_updated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS review_state review_state DEFAULT 'UNKNOWN',
    ADD COLUMN IF NOT EXISTS review_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS comment_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS detected_ticket_key VARCHAR(100),
    ADD COLUMN IF NOT EXISTS match_confidence NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS match_confidence_level link_confidence_level DEFAULT 'UNKNOWN',
    ADD COLUMN IF NOT EXISTS match_source VARCHAR(50),
    ADD COLUMN IF NOT EXISTS pr_url TEXT,
    ADD COLUMN IF NOT EXISTS last_collected_run_id UUID REFERENCES tbl_connector_run(connector_run_id);

ALTER TABLE tbl_fact_pull_request
    ADD CONSTRAINT ck_pr_review_counts
    CHECK (review_count >= 0 AND comment_count >= 0);

ALTER TABLE tbl_fact_pull_request
    ADD CONSTRAINT ck_pr_match_confidence
    CHECK (match_confidence IS NULL OR (match_confidence >= 0 AND match_confidence <= 100));

CREATE UNIQUE INDEX IF NOT EXISTS uq_pr_number_per_repo
    ON tbl_fact_pull_request(repository_id, pr_number)
    WHERE pr_number IS NOT NULL;
```

### 13.5 Alter `tbl_fact_commit`

```sql
ALTER TABLE tbl_fact_commit
    ADD COLUMN IF NOT EXISTS commit_message TEXT,
    ADD COLUMN IF NOT EXISTS detected_ticket_key VARCHAR(100),
    ADD COLUMN IF NOT EXISTS match_confidence NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS match_confidence_level link_confidence_level DEFAULT 'UNKNOWN',
    ADD COLUMN IF NOT EXISTS commit_url TEXT,
    ADD COLUMN IF NOT EXISTS last_collected_run_id UUID REFERENCES tbl_connector_run(connector_run_id);

ALTER TABLE tbl_fact_commit
    ADD CONSTRAINT ck_commit_match_confidence
    CHECK (match_confidence IS NULL OR (match_confidence >= 0 AND match_confidence <= 100));
```

### 13.6 Alter `tbl_fact_commit_changed_file`

```sql
ALTER TABLE tbl_fact_commit_changed_file
    ADD COLUMN IF NOT EXISTS file_path TEXT,
    ADD COLUMN IF NOT EXISTS old_file_path TEXT,
    ADD COLUMN IF NOT EXISTS file_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS last_collected_run_id UUID REFERENCES tbl_connector_run(connector_run_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_commit_changed_file
    ON tbl_fact_commit_changed_file(commit_id, file_path_hash);
```

### 13.7 Create `tbl_fact_pull_request_changed_file`

```sql
CREATE TABLE IF NOT EXISTS tbl_fact_pull_request_changed_file (
    pr_changed_file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID NOT NULL REFERENCES tbl_fact_pull_request(pr_id) ON DELETE CASCADE,
    repository_id UUID NOT NULL REFERENCES tbl_dim_repository(repository_id),
    file_path TEXT NOT NULL,
    file_path_hash VARCHAR(128) NOT NULL,
    old_file_path TEXT,
    change_type VARCHAR(50),
    file_extension VARCHAR(50),
    file_type VARCHAR(50),
    added_lines INT NOT NULL DEFAULT 0,
    deleted_lines INT NOT NULL DEFAULT 0,
    last_collected_run_id UUID REFERENCES tbl_connector_run(connector_run_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    CONSTRAINT uq_pr_changed_file UNIQUE (pr_id, file_path_hash),
    CONSTRAINT ck_pr_changed_file_stats CHECK (added_lines >= 0 AND deleted_lines >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pr_changed_file_pr
    ON tbl_fact_pull_request_changed_file(pr_id);

CREATE INDEX IF NOT EXISTS idx_pr_changed_file_repo
    ON tbl_fact_pull_request_changed_file(repository_id);

CREATE INDEX IF NOT EXISTS idx_pr_changed_file_path_hash
    ON tbl_fact_pull_request_changed_file(file_path_hash);

DROP TRIGGER IF EXISTS trg_fact_pull_request_changed_file_updated_at ON tbl_fact_pull_request_changed_file;
CREATE TRIGGER trg_fact_pull_request_changed_file_updated_at
    BEFORE UPDATE ON tbl_fact_pull_request_changed_file
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### 13.8 Optional view

```sql
CREATE OR REPLACE VIEW vw_git_pr_traceability_current AS
SELECT
    ticket.ticket_id,
    ticket.external_ticket_key,
    repo.repository_id,
    repo.repo_name_masked,
    pr.pr_id,
    pr.pr_number,
    pr.external_pr_id,
    pr.status AS pr_status,
    pr.review_state,
    pr.source_branch,
    pr.target_branch,
    pr.opened_at,
    pr.provider_updated_at,
    pr.merged_at,
    pr.closed_at,
    pr.detected_ticket_key,
    pr.match_confidence,
    pr.match_confidence_level,
    pr.pr_url,
    commit.commit_id,
    commit.commit_hash,
    commit.committed_at,
    commit.changed_file_count,
    commit.added_lines,
    commit.deleted_lines,
    commit.commit_url
FROM tbl_fact_pull_request pr
JOIN tbl_dim_repository repo ON repo.repository_id = pr.repository_id
LEFT JOIN tbl_dim_ticket ticket ON ticket.ticket_id = pr.ticket_id
LEFT JOIN tbl_fact_pull_request_commit pr_commit ON pr_commit.pr_id = pr.pr_id
LEFT JOIN tbl_fact_commit commit ON commit.commit_id = pr_commit.commit_id;
```

---

## 14. Query examples

### 14.1 Ticket -> PR -> Commit

```sql
SELECT
    ticket.external_ticket_key,
    pr.pr_number,
    pr.status,
    pr.review_state,
    commit.commit_hash,
    commit.committed_at
FROM tbl_dim_ticket ticket
JOIN tbl_fact_pull_request pr ON pr.ticket_id = ticket.ticket_id
LEFT JOIN tbl_fact_pull_request_commit pr_commit ON pr_commit.pr_id = pr.pr_id
LEFT JOIN tbl_fact_commit commit ON commit.commit_id = pr_commit.commit_id
WHERE ticket.external_ticket_key = :ticketKey
ORDER BY pr.opened_at DESC, commit.committed_at DESC;
```

### 14.2 PRs with changed files but no ticket link

```sql
SELECT
    repo.repo_name_masked,
    pr.pr_number,
    pr.title,
    pr.source_branch,
    pr.detected_ticket_key,
    pr.match_confidence_level,
    COUNT(file.pr_changed_file_id) AS changed_file_count
FROM tbl_fact_pull_request pr
JOIN tbl_dim_repository repo ON repo.repository_id = pr.repository_id
LEFT JOIN tbl_fact_pull_request_changed_file file ON file.pr_id = pr.pr_id
WHERE pr.ticket_id IS NULL
GROUP BY repo.repo_name_masked, pr.pr_number, pr.title, pr.source_branch, pr.detected_ticket_key, pr.match_confidence_level
ORDER BY pr.provider_updated_at DESC NULLS LAST;
```

### 14.3 Tickets with evidence but no PR

```sql
SELECT DISTINCT
    ticket.external_ticket_key,
    repo.repo_name_masked
FROM tbl_fact_artifact_snapshot snapshot
JOIN tbl_dim_ticket ticket ON ticket.ticket_id = snapshot.ticket_id
JOIN tbl_dim_repository repo ON repo.repository_id = snapshot.repository_id
LEFT JOIN tbl_fact_pull_request pr ON pr.ticket_id = ticket.ticket_id
WHERE snapshot.exists_flag = TRUE
  AND pr.pr_id IS NULL;
```

---

## 15. Data retention and privacy

| Data | Stored? | Notes |
|---|---:|---|
| PR title | Yes | Needed metadata for dashboards and matching. |
| PR description | No raw storage | `description_hash` is kept as-is. |
| Commit message | Yes, per MVP requirement | Consider light secret scanning or storing only a summary/hash if policy requires it. |
| Changed file path | Yes | Not source code content; needed for impact analysis. |
| Raw diff/patch | No | Must not be stored. |
| Source code content | No | Must not be stored. |
| Token/secret | No | Must not be stored. |
| Real author name/email | No | Store pseudonym/hash/member mapping only. |
| PR/commit URL | Yes | Used to open the source, not as a source of truth. |

---

## 16. Backend implementation notes

### 16.1 Service/adapter

Suggested service:

```text
GitPrMetadataCollectorService
  collectRepository(repositoryId, fromDate, toDate, includeClosed, triggerType)
  collectPullRequest(repositoryId, prNumber, triggerType)
```

Provider adapter:

```text
GitPrProviderPort
  fetchPullRequests(...)
  fetchPullRequest(...)
  fetchPullRequestCommits(...)
  fetchPullRequestFiles(...)
  fetchPullRequestReviews(...)
```

GitHub implementation:

```text
GithubGitPrProviderAdapter
```

### 16.2 Webhook integration

The current source already has:

```text
POST /api/v1/webhooks/github
GithubWebhookService
```

Proposal:

- Keep the current GitHub signature validation.
- After receiving a `pull_request` event, call `GitPrMetadataCollectorService.collectPullRequest(...)`.
- If the action is `opened`, `synchronize`, or `reopened`, the Artifact Scanner can continue to be triggered as it is today.
- If the action is `closed`, update the PR status/merged_at; it is not necessarily needed to trigger the Artifact Scanner.

### 16.3 Manual API

Required APIs:

```text
POST /api/v1/repositories/{repositoryId}/git-pr-metadata/collect
POST /api/v1/repositories/{repositoryId}/pull-requests/{prNumber}/git-pr-metadata/collect
GET  /api/v1/ingest-runs/{runId}
```

These should share `tbl_connector_run` with the connector type `GIT_PR_METADATA_COLLECTOR`.

---

## 17. Open questions

| No. | Question | Recommendation |
|---:|---|---|
| 1 | Is storing plain `file_path` allowed? | Yes, for the MVP, because the requirement needs the changed file path to be displayed; do not store file content. |
| 2 | Is storing plain `commit_message` allowed? | The current requirement needs it. If security is a concern, also store `message_hash` and check for secrets before storing the message. |
| 3 | Should `external_pr_id` mean the PR number or the provider ID? | Add `pr_number` to remove ambiguity; keep `external_pr_id` for compatibility. |
| 4 | Should the Git/PR Collector auto-create tickets? | Not by default; only link if the ticket already exists, and store `detected_ticket_key` for later reconciliation. |
| 5 | Should `tbl_dim_ticket.status` be updated according to PR status? | No, not in the new design; PR status should live in `tbl_fact_pull_request.status`. If the old UI needs it, handle it through a view. |
| 6 | Is a PR-level changed file table needed? | Yes, if the source uses the PR files API, as it currently does; if only commit-level files are collected, this can be postponed. |

---

## 18. Design conclusion

The database design for the Git/PR Metadata Collector should follow this direction:

1. **Reuse most of the existing schema**: repository, ticket, connector run, PR, commit, PR-commit, and traceability.
2. **Add columns to existing tables** to satisfy the MVP requirements: PR number, URL, review state, ticket matching confidence, commit URL, commit message, and file path.
3. **Add one new table, `tbl_fact_pull_request_changed_file`,** because the current source already has a PR-level changed file adapter and the existing commit-level table does not represent that granularity correctly.
4. **Do not write to artifact snapshot** from the Git/PR Collector, so the Artifact Scanner remains unaffected.
5. **Reuse tickets created by the Artifact Scanner** and do not create duplicate tickets when `external_ticket_key` is matched.
6. **Store PR/commit metadata even when no evidence folder exists yet,** so the dashboard can warn that a PR has development activity but no evidence.
7. **Create a separate connector type** `GIT_PR_METADATA_COLLECTOR` so the run logs stay separate from `ARTIFACT_SCANNER`.
8. **Do not use ticket status as PR status in the new design**; PR status should live in the PR fact table.

With this design, the new feature can run alongside the Artifact Scanner and provide the MVP traceability data needed for:

```text
Ticket -> Evidence Files
Ticket -> PR -> Commit -> Changed Files
```