# Requirement - Git/PR Metadata Collector

**Ticket ID:** GIT-PR-METADATA-COLLECTOR  
**Created date:** 2026-06-17  
**Author:** nk_trung  
**Updated date:** 2026-06-17  

---

## 1. Screen / Feature Overview

- **Feature name:** Git/PR Metadata Collector
- **Business purpose:** Collect minimal metadata from Git and Pull Requests to support MVP traceability, SDD evidence validation, and dashboard display.
- **Reason for the feature:** The SDD Evidence Collection & Analysis platform needs to connect evidence files such as `spec-pack.md`, `impl-plan.md`, `test-results.md`, and `report.md` with real development activity in Git and Pull Requests. Without Git/PR metadata, the system can only tell whether a ticket has evidence files, but not which PR, commit, branch, or file changes are related to that ticket.
- **MVP goal:** Provide a simple collector that can fetch PR metadata, commit metadata, changed file metadata, and `linked_ticket_id`, then store everything in the DB in an idempotent way.

---

## 2. Scope

### In scope

- Collect Pull Request metadata for the target repository in the MVP.
- Collect Git commit metadata related to the Pull Request.
- Collect changed file metadata related to the Pull Request or commit.
- Infer `linked_ticket_id` from PR title, source branch name, and commit message.
- Store PR metadata, commit metadata, and changed file metadata in the platform database.
- Create or update traceability links between Ticket, PR, Commit, and Changed File when enough information is available.
- Record ingest run logs including run status, start time, end time, result, and errors if any.
- Support manual execution by repository or by a specific Pull Request.
- Support reruns without creating duplicate records.
- Do not collect full source code, raw diff, raw patch, secrets, raw AI prompts, or raw AI chat logs.
- The Git/PR Metadata Collector supports two trigger mechanisms: webhook-based collection when the Git provider sends PR events to the system, and manual collection triggered by Admin/Data Ops for a specific repository or PR number.

### Out of scope

- Independent CI metadata collector.
- Test result parser.
- Evidence Quality Score calculation.
- AC-Test Coverage calculation.
- Scanning the entire Git history unrelated to Pull Requests.
- Real-time streaming ingestion.
- Detailed review comment analysis.
- AI review finding analysis.
- Security scan result collection.
- Source code content collection.
- Raw diff or raw patch collection.
- Supporting multiple complex Git providers within the same MVP.
- Advanced ticket matching using NLP.

> Note: In the MVP, Git metadata collector and PR metadata collector are implemented together in one feature because PR metadata, branch, commit, and changed files can all be collected from the Pull Request in the same flow.

### Flow

```text
Developer creates PR: feature/ABC-123-stock-error -> main
        ↓
GitHub/GitLab sends pull_request webhook to BE
        ↓
BE receives PR number, repo, and action
        ↓
BE calls GitHub/GitLab API to fetch PR details
        ↓
BE fetches:
  - PR metadata
  - commits in the PR
  - changed files in the PR
        ↓
BE infers ticket ID from branch/title/commit message
        ↓
BE stores the data in DB
```

---

## 3. Current State Summary

Summary based on the requirement document and the current MVP direction:

- **Current feature state**
  - The system already has an evidence inventory direction and an artifact scanner.
  - The system has SDD evidence files under `docs/changes/<TICKET>/`.
  - The DB schema already has a direction for entities related to PRs, commits, traceability, and ingest runs.
  - The MVP needs a simple way to connect ticket evidence with real PR/Git development activity.

- **Information that can currently be collected**
  - The artifact scanner can collect existence, path, hash, and basic status of evidence files.
  - Git/PR metadata collection has not yet been fully defined as an MVP requirement.

- **Current user flow**
  - Data Ops or Admin selects a repository and runs the artifact scanner.
  - The system can show whether a ticket has missing or sufficient evidence files.
  - The system cannot yet fully show which PR, commit, and changed files are related to that ticket.

- **Current strengths**
  - Ticket ID can be inferred from evidence folders such as `docs/changes/<TICKET>/`.
  - PR title, branch name, and commit message often contain the ticket ID.
  - GitHub/GitLab APIs can provide PR metadata, commit metadata, and changed files without retrieving source code.

- **Current issues / limitations**
  - Ticket evidence is not reliably connected to PRs and commits.
  - The Traceability Map cannot yet accurately show Ticket -> PR -> Commit -> Changed Files.
  - PM/Data Ops cannot check which PRs have development activity but are missing corresponding evidence.
  - Evidence Quality Score cannot yet include PR/commit linkage.

---

## 4. Target State Summary

According to the MVP direction:

- **Target structure**
  - Backend collector service for Git/PR metadata.
  - Provider adapter for GitHub or GitLab, depending on the target MVP repository.
  - Component that infers Ticket ID.
  - Persistence logic for PR, commit, changed file, traceability link, and ingest run log.
  - Manual API for MVP operations.

- **Target data flow**

```text
Repository Config
      ↓
Git/PR Metadata Collector
      ↓
Fetch Pull Requests
      ↓
Fetch PR commits and changed files
      ↓
Infer linked_ticket_id
      ↓
Save PR / Commit / Changed File metadata
      ↓
Create Traceability Links
      ↓
Record Ingest Run Log
```

- **Target data organization**
  - PR metadata is the primary collection unit.
  - Commit metadata is linked to PR metadata.
  - Changed file metadata is linked to PR or commit depending on API capabilities.
  - Ticket ID is inferred and stored in `linked_ticket_id` with confidence if possible.

- **Operational expectations**
  - Data Ops can run the collector manually for a repository.
  - Data Ops can run the collector manually for a specific Pull Request.
  - Data Ops can check whether the collector succeeded or failed.
  - PM/QA/Dev dashboards can use the collected data for traceability and ticket status.

- **Expected experience improvements**
  - Users can see which PR and commit are linked to a ticket.
  - Users can open the original PR/commit from the platform.
  - Users can identify tickets with evidence but no linked PR.
  - Users can identify PRs with code changes but no corresponding evidence.

---

## 5. Change Requirements

| Section | Current State | Target State | Requirement | Keep / Change / New | Notes |
|---|---|---|---|---|---|
| PR Metadata Collection | Not present or only partially present | Collect PR metadata for the MVP repository | Fetch PR ID/number, title, status, source branch, target branch, created/updated/merged time, review state, URL, and linked ticket ID | New | MVP scope |
| Git Commit Collection | Not present or only partially present | Collect commits related to the PR | Fetch commit hash, message, committed time, author pseudonym, branch, and URL | New | Do not fetch source code |
| Changed File Collection | Not present or only partially present | Collect changed file metadata | Fetch file path, additions, deletions, and change status if available | New | Do not fetch raw diff/patch |
| Ticket Matching | Not present or only partially present | Infer linked ticket ID | Infer ticket ID from PR title, source branch, and commit message | New | Regex-based in MVP |
| Traceability Link | Not present or only partially present | Create Ticket -> PR -> Commit links | Store traceability links with source, target, and confidence | New | Used for Traceability Map |
| Ingest Run Log | Partially present | Record collector run results | Record started_at, finished_at, status, target repository, processed count, and error message | Change | Reuse existing ingest run structure where appropriate |
| CI Metadata | Not collected | Deferred | Do not implement a CI metadata collector in this task | Keep out of scope | MVP may parse CI link/status from `test-results.md` |

---

## 6. Functional Requirements

### 6.1 Run the Git/PR Metadata Collector

- **Purpose:** Allow Data Ops or Admin to run Git/PR metadata collection for a repository or a specific Pull Request.
- **Returned information:** Run ID, repository ID, run status, start time, end time, number of PRs processed, number of commits processed, number of changed files processed, and error message if the run fails.
- **Processing rules:**
  - The collector can be run manually through the API.
  - The collector can be run by repository.
  - The collector can be run by a specific Pull Request number.
  - At the beginning of a run, the system must create an ingest run log.
  - When the run completes or fails, the system must update the ingest run log.
- **User interaction:**
  - Data Ops selects or enters a repository ID.
  - Data Ops can enter a PR number if they want to run only one PR.
  - Data Ops runs the collector.
  - Data Ops checks the result.
- **Status / behavior conditions:**
  - Only users with Data Ops, Admin, or equivalent permission can run the collector.
  - If the repository config is missing or invalid, the collector must fail safely and log the error.
  - If the provider API rate limit is reached, the collector must log the error and stop or retry according to the MVP policy.
- **Empty state:** If no PR is found, the run still succeeds with processed count = 0.
- **Error state:** Return a safe error message and `traceId`.

### 6.2 Collect Pull Request Metadata

- **Purpose:** Fetch the minimum Pull Request metadata needed for MVP traceability.
- **Collected information:** PR ID, PR number, repository ID, title, status, source branch, target branch, author pseudonym, created_at, updated_at, merged_at, linked_ticket_id, review_state, review_count, comment_count, and PR URL.
- **Collection rules:**
  - PR status must be normalized to `OPEN`, `MERGED`, `CLOSED`, or `UNKNOWN`.
  - Review state must be normalized to `APPROVED`, `CHANGES_REQUESTED`, `REVIEW_REQUIRED`, or `UNKNOWN`.
  - Author information must be stored as a pseudonym, hash, or mapped member ID according to the privacy policy.
  - PR URL must point to the original source system.
- **Status / behavior conditions:**
  - If the same PR is collected again, the system updates existing data instead of creating duplicates.
  - If the PR has been merged, the system stores `merged_at` when the provider returns it.
  - If the ticket ID cannot be inferred, store `linked_ticket_id = null` and set confidence to low/unknown.
- **Error state:** If PR metadata cannot be fetched, log the error in the ingest run log.

### 6.3 Collect Git Commit Metadata

- **Purpose:** Fetch commit metadata related to the Pull Request.
- **Collected information:** Commit hash, repository ID, branch name if available, commit message, author pseudonym, committed_at, linked_ticket_id, commit URL, and related PR number.
- **Collection rules:**
  - The collector fetches commits belonging to the target PR.
  - Commit hash is the stable key.
  - Commit message can be used to infer the ticket ID.
  - Do not store full source code, raw diff, raw patch, or secret values.
- **Status / behavior conditions:**
  - If the same commit is collected again, update the existing data instead of creating duplicates.
  - If one commit is related to multiple PRs, do not create duplicate commit records; instead, create multiple PR-Commit links.
- **Error state:** If commit metadata cannot be fetched, the collector logs the error and continues with other PRs if possible.

### 6.4 Collect Changed File Metadata

- **Purpose:** Fetch file-level metadata for impact analysis and traceability.
- **Collected information:** Repository ID, PR number or commit hash, changed file path, additions, deletions, change status if available, and simple file extension or file type if needed.
- **Collection rules:**
  - Store only the file path; do not store file content.
  - Store additions and deletions as numbers.
  - If the provider API returns raw diff or patch, the collector must ignore it.
  - File paths may later be classified as backend, frontend, config, test, docs, or unknown.
- **Status / behavior conditions:**
  - If the same file metadata is collected again for the same PR/commit, update or replace it according to the idempotent design.
  - If the file path is under `docs/changes/<TICKET>/`, it may be used to increase ticket matching confidence.
- **Error state:** If changed file metadata cannot be fetched, log the error and continue if possible.

### 6.5 Infer Linked Ticket ID

- **Purpose:** Automatically connect PRs/commits with SDD tickets.
- **Input sources:** PR title, source branch name, commit message, and changed file path if available.
- **Matching rules:**
  - Use regex-based matching in the MVP.
  - Support ticket ID patterns such as uppercase letters + hyphen + numbers, for example `ABC-123`, `LOGIN-001`, `ARTIFACT-SCANNER-01`.
  - Priority order: source branch -> PR title -> commit message -> changed file path.
  - If multiple ticket IDs are found, choose the one from the highest-priority source and record ambiguity if possible.
- **Status / behavior conditions:**
  - If a ticket ID is found, store it in `linked_ticket_id`.
  - If no ticket ID is found, leave `linked_ticket_id` empty and set confidence to `NONE` or `UNKNOWN`.
  - If the ticket exists in the platform, create a traceability link to that ticket.
  - If the ticket does not exist yet, still store the detected ticket ID for later reconciliation.
- **Error state:** Ticket matching errors must not fail the entire collector run.

### 6.6 Store Traceability Links

- **Purpose:** Store the relationships needed for the Traceability Map.
- **Links created:** Ticket -> PR, PR -> Commit, PR -> Changed File, and optionally Ticket -> Commit depending on the case.
- **Link rules:**
  - Each link includes source type, source ID, target type, target ID, confidence, and creation source.
  - Links created by the collector must be marked as auto-created.
  - Rerunning the collector must not create duplicate links.
- **Status / behavior conditions:**
  - If the linked ticket ID is missing, PR -> Commit and PR -> Changed File links can still be created.
  - Ticket -> PR links are created only when a ticket ID is inferred or provided.
- **Error state:** Link creation errors must be logged with `traceId`.

### 6.7 Record the Ingest Run Log

- **Purpose:** Allow Data Ops to check collector run status.
- **Logged information:** Connector name, repository ID, target PR number if any, started_at, finished_at, status, processed count, success count, failure count, error message, and traceId.
- **Status values:** `RUNNING`, `SUCCESS`, `PARTIAL_SUCCESS`, `FAILED`.
- **Status / behavior conditions:**
  - The run starts with status `RUNNING`.
  - The run changes to `SUCCESS` when all target data is collected successfully.
  - The run changes to `PARTIAL_SUCCESS` when some records fail but the collector continues.
  - The run changes to `FAILED` when the collector cannot continue.
- **Error state:** If an unexpected error occurs, the run must be marked `FAILED` with a safe error message.

#### State Matrix - Pull Request

| State | Normalized value | Display condition |
|---|---|---|
| Open | OPEN | PR is open and not merged |
| Merged | MERGED | PR has been merged |
| Closed | CLOSED | PR has been closed but not merged |
| Unknown | UNKNOWN | Provider status cannot be mapped |

#### State Matrix - Review

| State | Normalized value | Display condition |
|---|---|---|
| Approved | APPROVED | PR has a valid approval review |
| Changes requested | CHANGES_REQUESTED | PR has requested changes that are not yet resolved |
| Review required | REVIEW_REQUIRED | PR does not yet have the required approval |
| Unknown | UNKNOWN | Review state cannot be fetched or mapped |

#### State Matrix - Ingest Run

| State | Normalized value | Display condition |
|---|---|---|
| Running | RUNNING | Collector is running |
| Success | SUCCESS | Collector completed without errors |
| Partial success | PARTIAL_SUCCESS | Some records failed but the run still produced results |
| Failed | FAILED | Collector could not complete |

---

## 7. Business Rules

- Git/PR Metadata Collector is a metadata collection feature for MVP traceability.
- In the MVP, Git metadata and PR metadata are collected in the same flow.
- PR is the primary collection unit; commits and changed files are fetched from the PR.
- Only collect the metadata that is necessary; do not collect source code content.
- Do not store raw diff, raw patch, secrets, raw prompts, or raw AI chat logs.
- `linked_ticket_id` is inferred by a simple rule, not NLP, in the MVP.
- Ticket ID matching must prioritize source branch, then PR title, commit message, and changed file path.
- The collector must be idempotent: rerunning it must not create duplicate PRs, commits, changed files, or traceability links.
- PR/commit URLs must point to the original source system so users can verify them.
- Authors must be stored as pseudonyms/hashes/mapped member IDs, not for individual ranking.
- If the ticket ID cannot be inferred, PR/commit data must still be stored for later reconciliation.
- Errors in individual PRs or commits should not fail the whole run if the collector can continue.
- Git/PR Metadata Collector does not replace Artifact Scanner. Artifact Scanner is the source for evidence files, while Git/PR Metadata Collector is the source for development activity. The two features are connected only through `ticket_id` and `traceability_link`.
- If `linked_ticket_id` already exists because it was created by Artifact Scanner or an existing ticket source, Git/PR Metadata Collector must reuse that ticket and not create a duplicate.
- If a PR has `linked_ticket_id` but no matching evidence folder yet, the collector must still store PR/commit metadata so the dashboard can warn about missing evidence.
- Every collector run must have an ingest run log.

---

## 8. Validation Rules

| Field | Required | Rule | Error message |
|---|---:|---|---|
| repository_id | Yes | Must exist and be active | Invalid or inactive repository. |
| provider_type | Yes | Only target MVP providers are supported | Provider is not supported in the MVP. |
| access_token/config | Yes | Must have permission to read PRs, commits, and changed files | Repository config does not have sufficient access rights. |
| pr_number | No | If provided, must be a valid number | Invalid Pull Request number. |
| commit_hash | Yes | Cannot be empty when saving a commit | Invalid commit hash. |
| changed_file_path | Yes | Cannot be empty when saving a changed file | Invalid changed file path. |
| additions/deletions | No | If provided, must be >= 0 | Invalid additions/deletions. |
| linked_ticket_id | No | If provided, must match the ticket ID pattern | Ticket ID format is invalid. |

---

## 9. Data Requirements

### 9.1 Pull Request Metadata

| Field | Description |
|---|---|
| repository_id | Internal repository in the platform |
| provider_pr_id | PR ID from the provider |
| pr_number | Pull Request number |
| title | PR title |
| status | Normalized status |
| source_branch | Source branch |
| target_branch | Target branch |
| author_pseudonym | Pseudonymized author |
| created_at | PR creation time |
| updated_at | PR update time |
| merged_at | Merge time if any |
| review_state | Normalized review state |
| review_count | Number of reviews if available |
| comment_count | Number of comments if available |
| linked_ticket_id | Inferred ticket ID |
| match_confidence | Matching confidence |
| pr_url | Original PR URL |

### 9.2 Commit Metadata

| Field | Description |
|---|---|
| repository_id | Internal repository in the platform |
| commit_hash | Commit hash |
| related_pr_number | Related PR number |
| branch_name | Branch if available |
| commit_message | Commit message |
| author_pseudonym | Pseudonymized author |
| committed_at | Commit time |
| linked_ticket_id | Inferred ticket ID |
| commit_url | Original commit URL |

### 9.3 Changed File Metadata

| Field | Description |
|---|---|
| repository_id | Internal repository in the platform |
| related_pr_number | Related PR number |
| commit_hash | Commit hash if stored per commit |
| file_path | Changed file path |
| change_status | added / modified / removed / renamed / unknown |
| additions | Number of added lines |
| deletions | Number of deleted lines |
| file_type | backend / frontend / config / test / docs / unknown if classified |

### 9.4 Traceability Link

| Field | Description |
|---|---|
| source_type | TICKET / PR / COMMIT / CHANGED_FILE |
| source_id | Source ID |
| target_type | TICKET / PR / COMMIT / CHANGED_FILE |
| target_id | Target ID |
| confidence | HIGH / MEDIUM / LOW / UNKNOWN |
| created_by_source | GIT_PR_METADATA_COLLECTOR |
| created_at | Link creation time |

---

## 10. API Requirements

### 10.1 Run collector by repository

```http
POST /api/v1/repositories/{repositoryId}/git-pr-metadata/collect
```

#### Request body

```json
{
  "fromDate": "2026-06-01",
  "toDate": "2026-06-17",
  "includeClosed": true
}
```

#### Response

```json
{
  "runId": "run_001",
  "repositoryId": "repo_001",
  "status": "RUNNING",
  "traceId": "trc_abc123"
}
```

### 10.2 Run collector by Pull Request

```http
POST /api/v1/repositories/{repositoryId}/pull-requests/{prNumber}/git-pr-metadata/collect
```

#### Response

```json
{
  "runId": "run_002",
  "repositoryId": "repo_001",
  "prNumber": 123,
  "status": "RUNNING",
  "traceId": "trc_def456"
}
```

### 10.3 View ingest run result

```http
GET /api/v1/ingest-runs/{runId}
```

#### Response

```json
{
  "runId": "run_001",
  "connectorName": "GIT_PR_METADATA_COLLECTOR",
  "repositoryId": "repo_001",
  "status": "SUCCESS",
  "processedPrCount": 10,
  "processedCommitCount": 25,
  "processedChangedFileCount": 120,
  "failureCount": 0,
  "startedAt": "2026-06-17T10:00:00+07:00",
  "finishedAt": "2026-06-17T10:01:30+07:00",
  "traceId": "trc_abc123"
}
```

---

## 11. Security / Privacy Requirements

- Do not store source code content.
- Do not store raw diff or raw patch.
- Do not store secrets, tokens, passwords, or private keys.
- Do not store raw AI prompts or raw AI chat logs.
- Authors must be pseudonymized or mapped to internal member IDs.
- Only users with appropriate permission can run the collector.
- Error messages must not contain tokens, secrets, or sensitive information.
- API tokens used to call the Git provider must be stored and used according to the platform security policy.
- Every collector run must have an audit/ingest log.

---

## 12. Acceptance Criteria

| AC ID | Acceptance Criteria |
|---|---|
| AC-GITPR-01 | Admin/Data Ops can run the Git/PR Metadata Collector for a valid repository. |
| AC-GITPR-02 | Admin/Data Ops can run the collector for a specific Pull Request number. |
| AC-GITPR-03 | The system can fetch and store PR ID/number, title, status, source branch, target branch, created_at, updated_at, and merged_at if available. |
| AC-GITPR-04 | The system can normalize PR status to `OPEN`, `MERGED`, `CLOSED`, or `UNKNOWN`. |
| AC-GITPR-05 | The system can fetch and store basic review_state: `APPROVED`, `CHANGES_REQUESTED`, `REVIEW_REQUIRED`, or `UNKNOWN`. |
| AC-GITPR-06 | The system can fetch and store commit hash, commit message, committed_at, author pseudonym, and commit URL for commits in the PR. |
| AC-GITPR-07 | The system can fetch and store changed file path, additions, deletions, and change status if the provider supports it. |
| AC-GITPR-08 | The system does not store source code content, raw diff, or raw patch. |
| AC-GITPR-09 | The system can infer `linked_ticket_id` from source branch, PR title, or commit message using the MVP regex rules. |
| AC-GITPR-10 | If the ticket ID cannot be inferred, the collector still stores PR/commit metadata and marks confidence as `UNKNOWN` or `NONE`. |
| AC-GITPR-11 | The system can create a Ticket -> PR traceability link when `linked_ticket_id` is available. |
| AC-GITPR-12 | The system can create PR -> Commit and PR -> Changed File traceability links. |
| AC-GITPR-13 | The collector can be rerun without creating duplicate PRs, commits, changed files, or traceability links. |
| AC-GITPR-14 | Every collector run creates and updates an ingest run log with the final status. |
| AC-GITPR-15 | When the provider API fails or the repository config is invalid, the system writes a safe error message to the ingest run log and returns `traceId`. |
| AC-GITPR-16 | Only users with Admin/Data Ops permission or equivalent can run the collector. |
| AC-GITPR-17 | The collected data can be used to show the basic traceability chain: Ticket -> PR -> Commit -> Changed Files. |
| AC-GITPR-18 | If `linked_ticket_id` already exists because it was created by Artifact Scanner, Git/PR Metadata Collector must reuse that ticket and not create a duplicate ticket. |
| AC-GITPR-19 | If a PR has `linked_ticket_id` but no matching evidence folder yet, the system still stores PR/commit metadata to support missing-evidence warnings. |

---

## 13. Open Questions

| No | Question | Proposed status |
|---:|---|---|
| 1 | Should the MVP use GitHub or GitLab as the first provider? | Must be confirmed based on the target MVP repository |
| 2 | Should we scan by time range or only by PR number/manual trigger? | The MVP should support both repository scan and PR-specific scan |
| 3 | What is the official ticket ID pattern? | Proposed regex supports `ABC-123`, `LOGIN-001`, `ARTIFACT-SCANNER-01` |
| 4 | Should review state be taken from the review API or branch protection status? | The MVP should use the review API if supported by the provider |
| 5 | Should CI status be included in this task? | No. Parse it temporarily from `test-results.md` or `report.md` |
| 6 | Do we need a separate UI for the collector? | For the MVP, API only plus a later Data Ops dashboard is enough |

---

## 14. Notes for MVP Implementation

- The service should be implemented as `GitPrMetadataCollectorService`.
- The provider adapter should be separated, for example `GitHubGitPrProviderAdapter`, so GitLab can be added later.
- A separate `TicketIdInferenceService` should be introduced so it can be reused by the artifact scanner, PR collector, and parser.
- Collection should prioritize PRs because branch, commit, and changed files can all be fetched from the PR.
- CI metadata collector is not needed in this task.
- A complex dashboard is not needed in this task; the data only needs to be ready for Traceability Map and Ticket Evidence Detail.
- Priority should be given to idempotency and error handling rather than advanced analysis.

### 14.1 Integration notes with Artifact Scanner

- The current Artifact Scanner is considered the primary source for Evidence Inventory in the MVP.
- Artifact Scanner scans `docs/changes/<TICKET>/` and stores artifact snapshots; Git/PR Metadata Collector does not write to artifact snapshots.
- Git/PR Metadata Collector only adds development activity: PRs, commits, changed files, and traceability links.
- Both features must use the same `ticket_id` / `external_ticket_key` standard to avoid duplicate tickets.
- When a PR has development activity but no evidence folder yet, the collector must still store the data so the dashboard/Data Ops can detect missing evidence.
- Both collectors may share the same ingest run log mechanism, but they must use different connector types: `ARTIFACT_SCANNER` and `GIT_PR_METADATA_COLLECTOR`.

---

## 15. Definition of Done

- The requirement is reviewed and approved.
- The repository-based collector API is implemented.
- The PR-number-based collector API is implemented.
- PR metadata is stored in the DB.
- Commit metadata is stored in the DB.
- Changed file metadata is stored in the DB.
- Ticket ID inference works with the MVP pattern.
- Basic traceability links are created.
- Ingest run logs are recorded completely.
- No source code, raw diff, raw patch, raw prompt/chat, or secrets are stored.
- Unit tests exist for ticket ID inference.
- There is at least one integration test for collector -> DB.
- There is a rerun test to confirm no duplicates are created.
- There is a test to confirm no duplicate ticket is created when the ticket already exists from Artifact Scanner.
- There is a test to confirm PR/commit metadata is still stored when the PR matches a ticket key but no evidence folder exists.