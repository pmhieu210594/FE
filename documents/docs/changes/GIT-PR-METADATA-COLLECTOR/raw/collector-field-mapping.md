# Git/PR Metadata Collector Field Mapping

**Ticket ID**: GIT-PR-METADATA-COLLECTOR  
**Create date**: 2026-06-18  
**Author**: nk_trung  
**Update date**: 2026-06-18  

## 1. Purpose

This document explains the meaning of each group of information collected by the GitHub collector and shows which database table/column each data field is stored in.

## 2. Run Metadata

| information | meaning | stored in table | column |
|---|---|---|---|
| `runId` | Identifier of one collector run | `tbl_connector_run` | `connector_run_id` |
| `status` | Final status of the run: `SUCCESS`, `PARTIAL_SUCCESS`, `FAILED` | `tbl_connector_run` | `status` |
| `processedPrCount` | Number of PRs successfully processed in the run | `tbl_connector_run` | `records_read` |
| `processedCommitCount + processedChangedFileCount` | Total number of records written for commits and changed files | `tbl_connector_run` | `records_written` |
| `failureCount` | Number of failed PRs/subflows in the run | `tbl_connector_run` | `failure_count` |
| `traceId` | Trace ID for log and error tracing | `tbl_connector_run` | `trace_id` |
| `startedAt` | Run start time | `tbl_connector_run` | `started_at` |
| `finishedAt` | Run end time | `tbl_connector_run` | `finished_at` |

## 3. PR Metadata

| information | meaning | stored in table | column |
|---|---|---|---|
| `repositoryId` | Internal repository being collected | `tbl_fact_pull_request` | `repository_id` |
| `external_pr_number` | PR number on GitHub | `tbl_fact_pull_request` | `external_pr_number` |
| `external_pr_id` | Source-side PR ID/key used for stable upsert | `tbl_fact_pull_request` | `external_pr_id` |
| `title` | PR title | `tbl_fact_pull_request` | `title` |
| `description_hash` | Hash of the PR description, used to avoid storing long raw text | `tbl_fact_pull_request` | `description_hash` |
| `status` | Normalized PR status: `OPEN`, `MERGED`, `CLOSED`, `UNKNOWN` | `tbl_fact_pull_request` | `status` |
| `source_branch` | PR source branch | `tbl_fact_pull_request` | `source_branch` |
| `target_branch` | PR target/base branch | `tbl_fact_pull_request` | `target_branch` |
| `opened_at` | Time the PR was opened | `tbl_fact_pull_request` | `opened_at` |
| `merged_at` | Time the PR was merged, if any | `tbl_fact_pull_request` | `merged_at` |
| `closed_at` | Time the PR was closed, if any | `tbl_fact_pull_request` | `closed_at` |
| `authorDisplayName` | Human-readable author name resolved from the internal account if available, otherwise a safe fallback such as the GitHub login | `tbl_fact_pull_request` | `author_display_name` |
| `external_pr_url` | Public GitHub URL of the PR | `tbl_fact_pull_request` | `external_pr_url` |
| `external_updated_at` | Time the PR was last updated on GitHub | `tbl_fact_pull_request` | `external_updated_at` |
| `review_state` | Normalized review state, fallback `UNKNOWN` | `tbl_fact_pull_request` | `review_state` |
| `labels` | List of PR labels in JSON format | `tbl_fact_pull_request` | `labels` |
| `linkedIssueKey` | Ticket key inferred from branch/title/commit/path | `tbl_fact_pull_request` | `linked_issue_key` |
| `ticketId` | Internal ticket matched from `linkedIssueKey` | `tbl_fact_pull_request` | `ticket_id` |
| `collectedAt` | Time the collector recorded this PR | `tbl_fact_pull_request` | `collected_at` |

When the collector creates or refreshes a ticket row, it uses the PR author display name for `tbl_dim_ticket.created_by` and `tbl_dim_ticket.updated_by`. If the author cannot be resolved, the collector falls back to `SYSTEM`.

## 4. Commit Metadata

| information | meaning | stored in table | column |
|---|---|---|---|
| `commitHash` | Commit SHA | `tbl_fact_commit` | `commit_hash` |
| `authorPseudonym` | Hashed pseudonym derived from author login/name to avoid storing raw identity | `tbl_fact_commit` | `author_pseudonym` |
| `committedAt` | Time the commit was created | `tbl_fact_commit` | `committed_at` |
| `branchName` | Branch associated with the commit in the collector | `tbl_fact_commit` | `branch_name` |
| `messageHash` | Hash of the commit message; raw message is not stored | `tbl_fact_commit` | `message_hash` |
| `changedFileCount` | Number of files changed in the commit according to collector data | `tbl_fact_commit` | `changed_file_count` |
| `addedLines` | Number of lines added | `tbl_fact_commit` | `added_lines` |
| `deletedLines` | Number of lines deleted | `tbl_fact_commit` | `deleted_lines` |
| `commitUrl` | Commit URL on GitHub | `tbl_fact_commit` | `commit_url` |
| `ticketId` | Internal ticket if inferred or matched | `tbl_fact_commit` | `ticket_id` |
| `collectedAt` | Time the collector recorded the commit | `tbl_fact_commit` | `collected_at` |

## 5. PR Commit Link

| information | meaning | stored in table | column |
|---|---|---|---|
| `prId` | Internal PR key | `tbl_fact_pull_request_commit` | `pr_id` |
| `commitId` | Internal commit key | `tbl_fact_pull_request_commit` | `commit_id` |

Meaning:
- This table represents the many-to-many relationship between PRs and commits.
- The collector uses `ON CONFLICT (pr_id, commit_id)` to avoid duplicates when rerunning.

## 6. Changed File Metadata

| information | meaning | stored in table | column |
|---|---|---|---|
| `prId` | Internal PR that owns the changed file | `tbl_fact_pull_request_changed_file` | `pr_id` |
| `repositoryId` | Internal repository | `tbl_fact_pull_request_changed_file` | `repository_id` |
| `filePath` | File path within the PR | `tbl_fact_pull_request_changed_file` | `file_path` |
| `filePathHash` | Hash of the file path used as an idempotent key | `tbl_fact_pull_request_changed_file` | `file_path_hash` |
| `fileExtension` | File extension, if any | `tbl_fact_pull_request_changed_file` | `file_extension` |
| `changeType` | Type of file change: added/modified/removed/renamed... according to source data | `tbl_fact_pull_request_changed_file` | `change_type` |
| `additions` | Number of lines added in this file | `tbl_fact_pull_request_changed_file` | `additions` |
| `deletions` | Number of lines deleted in this file | `tbl_fact_pull_request_changed_file` | `deletions` |
| `collectedAt` | Time the collector recorded the file | `tbl_fact_pull_request_changed_file` | `collected_at` |

## 7. Traceability Links

| information | meaning | stored in table | column |
|---|---|---|---|
| `ticketId` | Internal ticket inferred or matched | `tbl_fact_traceability_link` | `ticket_id` |
| `sourceType` = `TICKET` | Source is a ticket | `tbl_fact_traceability_link` | `source_type` |
| `sourceId` | Source key, usually the ticket key | `tbl_fact_traceability_link` | `source_id` |
| `targetType` = `PULL_REQUEST` | Target is a PR | `tbl_fact_traceability_link` | `target_type` |
| `targetId` | Target key, for example `repositoryId#PR-<number>` | `tbl_fact_traceability_link` | `target_id` |
| `ruleName` = `ticket-inference` | Rule used to create the ticket -> PR relationship | `tbl_fact_traceability_link` | `rule_name` |
| `evidenceJson` | Minimal JSON evidence for the link | `tbl_fact_traceability_link` | `evidence` |

Other links are also written to the same table:

| relationship | sourceType | targetType | sourceId / targetId |
|---|---|---|---|
| PR -> Commit | `PULL_REQUEST` | `COMMIT` | `repositoryId#PR-<number>` -> commit SHA |
| PR -> Changed File | `PULL_REQUEST` | `CHANGED_FILE` | `repositoryId#PR-<number>` -> hash(filePath) |

## 8. Data Not Persisted

The collector does not store the following data:

- raw diff
- raw patch
- raw source code
- secret value
- raw AI prompt
- raw AI chat log

## 9. Quick DB Check

```sql
select connector_run_id, status, records_read, records_written, failure_count, trace_id
from tbl_connector_run
order by created_at desc
limit 10;

select pr_id, repository_id, external_pr_number, title, status, review_state, linked_issue_key
from tbl_fact_pull_request
order by created_at desc
limit 10;

select commit_id, repository_id, commit_hash, branch_name, commit_url
from tbl_fact_commit
order by created_at desc
limit 10;

select pull_request_changed_file_id, pr_id, file_path, file_extension, change_type, additions, deletions
from tbl_fact_pull_request_changed_file
order by created_at desc
limit 10;

select traceability_link_id, source_type, source_id, target_type, target_id, rule_name
from tbl_fact_traceability_link
order by created_at desc
limit 20;
```
