# Artifact Scanner Field Mapping

**Ticket ID**: GIT-PR-METADATA-COLLECTOR  
**Create date**: 2026-06-18  
**Author**: nk_trung  
**Update date**: 2026-06-18  

## 1. Purpose

This document explains the values extracted by the **Artifact Scanner**, which columns they are stored in, and the business meaning of each column.

Main scope:

- Evidence artifact snapshots in `tbl_fact_artifact_snapshot`
- Run logs in `tbl_connector_run`
- The columns shown in `vw_artifact_inventory_current` are join-derived columns from the tables above and related dimensions

## 2. High-level flow

The Artifact Scanner works as follows:

1. Receive `repositoryId`, `branchOrRef`, `scanMode`, `ticketIds`, `triggerType`, `requestedBy`, `traceId`
2. Resolve repository + connector
3. Fetch the Git tree for the target revision
4. Scan evidence files within the ticket scope
5. If `scanMode = FULL`, also scan `docs/maintenance/phase0/...`
6. Write the run log to `tbl_connector_run`
7. Write each artifact snapshot to `tbl_fact_artifact_snapshot`

## 3. Run log mapping

| scanner value | stored column | table | meaning |
|---|---|---|---|
| `connectorId` | `connector_id` | `tbl_connector_run` | Connector that performed the scan, for example `ARTIFACT_SCANNER`. |
| `startedAt` | `started_at` | `tbl_connector_run` | Run start time. |
| `finishedAt` | `finished_at` | `tbl_connector_run` | Run end time. |
| `status` | `status` | `tbl_connector_run` | Run status such as `RUNNING`, `SUCCESS`, `FAILED`. |
| `recordsRead` | `records_read` | `tbl_connector_run` | Number of artifacts read/processed in the run. |
| `recordsWritten` | `records_written` | `tbl_connector_run` | Number of snapshots successfully written. |
| `errorMessage` | `error_message` | `tbl_connector_run` | Safe error message if the run fails. |
| `traceId` | `trace_id` | `tbl_connector_run` | Trace ID used to correlate logs/APIs. |

## 4. Artifact snapshot mapping

### 4.1 Core identity and linkage

| scanner value | stored column | table | meaning |
|---|---|---|---|
| `ticketId` | `ticket_id` | `tbl_fact_artifact_snapshot` | Internal ticket linked to the artifact; `null` if no ticket match is found. |
| `repositoryId` | `repository_id` | `tbl_fact_artifact_snapshot` | Repository that contains the artifact. |
| `artifactTypeId` | `artifact_type_id` | `tbl_fact_artifact_snapshot` | Artifact type, for example `SPEC_PACK`, `TEST_PLAN`, `REPORT`. |
| `phaseId` | `phase_id` | `tbl_fact_artifact_snapshot` | Artifact phase in the workflow. |
| `sourcePath` | `source_path` | `tbl_fact_artifact_snapshot` | Actual file path in the repository tree, for example `docs/changes/ABC-123/spec-pack.md`. |
| `connectorRunId` | `connector_run_id` | `tbl_fact_artifact_snapshot` | Run that created this snapshot. |

### 4.2 File existence and content state

| scanner value | stored column | table | meaning |
|---|---|---|---|
| `existsFlag` | `exists_flag` | `tbl_fact_artifact_snapshot` | Whether the file exists in the revision tree. |
| `contentHash` | `content_hash` | `tbl_fact_artifact_snapshot` | SHA-256 of the file content used to detect changes. |
| `sizeBytes` | `size_bytes` | `tbl_fact_artifact_snapshot` | File size in bytes. |
| `sourceUpdatedAt` | `source_updated_at` | `tbl_fact_artifact_snapshot` | Time the source/revision was last updated. |
| `sourceCreatedAt` | `source_created_at` | `tbl_fact_artifact_snapshot` | Source creation date if provided by the system/source port; the scanner core does not always populate it today. |
| `collectedAt` | `collected_at` | `tbl_fact_artifact_snapshot` | Time the scanner wrote the snapshot. |
| `templateEmptyFlag` | `template_empty_flag` | `tbl_fact_artifact_snapshot` | File exists but the content is empty/whitespace only. |
| `needParse` | `need_parse` | `tbl_fact_artifact_snapshot` | Whether this file needs to be parsed again compared with the previous snapshot. |

### 4.3 Scan status and message

| scanner value | stored column | table | meaning |
|---|---|---|---|
| `scanStatus` | `scan_status` | `tbl_fact_artifact_snapshot` | Artifact read result: `FOUND`, `MISSING`, `INACCESSIBLE`, `SKIPPED`, `ERROR`. |
| `scanMessage` | `scan_message` | `tbl_fact_artifact_snapshot` | Short detailed message such as `REQUIRED_ARTIFACT_MISSING`, `OPTIONAL_ARTIFACT_MISSING`, `TEMPLATE_EMPTY`, `ARTIFACT_READ_ERROR`. |

### 4.4 Schema / parse / privacy metadata

| scanner value | stored column | table | meaning |
|---|---|---|---|
| `schemaVersion` | `schema_version` | `tbl_fact_artifact_snapshot` | Parsed schema version for the artifact; stored as an integer that starts at `1` and increments when the file changes. |
| `schemaValid` | `schema_valid` | `tbl_fact_artifact_snapshot` | Whether the parsed schema is valid; the scanner core does not always set it today. |
| `requiredFieldsMissing` | `required_fields_missing` | `tbl_fact_artifact_snapshot` | List of missing required fields, stored as JSON. |
| `parsedSummary` | `parsed_summary` | `tbl_fact_artifact_snapshot` | Summary of parse results, stored as JSON. |
| `privacyClassification` | `privacy_classification` | `tbl_fact_artifact_snapshot` | Sensitive data classification after parsing, if any. |
| `containsCustomerData` | `contains_customer_data` | `tbl_fact_artifact_snapshot` | Whether the artifact contains customer data. |
| `containsPersonalData` | `contains_personal_data` | `tbl_fact_artifact_snapshot` | Whether the artifact contains personal data. |
| `containsSecretDetected` | `contains_secret_detected` | `tbl_fact_artifact_snapshot` | Whether the artifact shows signs of a secret. |
| `parserVersion` | `parser_version` | `tbl_fact_artifact_snapshot` | Parser version that produced the snapshot, if any. |

### 4.5 Ticket-related values copied into snapshot

| scanner value | stored column | table | meaning |
|---|---|---|---|
| `ticketExternalKey` | `external_ticket_key` | `vw_artifact_inventory_current` / joined from `tbl_dim_ticket` | Business key for the ticket, for example `ABC-123`. |
| `ticketStatus` | `pr_status` in the view, source is `tbl_dim_ticket.status` | `vw_artifact_inventory_current` | Current ticket/PR status in the view. This is not the scan status. |
| `ticketLastCommitAt` | `last_commit_at` | `vw_artifact_inventory_current` / joined from `tbl_dim_ticket` | Time of the latest commit related to the ticket. |

## 5. Dimension-derived values shown in the view

The following values are not written directly by `ArtifactScanner` into the snapshot, but they appear in the view and UI:

| value | source | meaning |
|---|---|---|
| `artifactTypeCode` | `tbl_dim_artifact_type.artifact_type_code` | Artifact type code, for example `SPEC_PACK`, `TEST_RESULTS`. |
| `artifactName` | `tbl_dim_artifact_type.artifact_name` | Display name of the artifact type. |
| `defaultFileName` | `tbl_dim_artifact_type.default_file_name` | Default file name expected by the scanner, for example `spec-pack.md`. |
| `requiredFlag` | `tbl_dim_artifact_type.required_flag` | Whether the artifact is required. |
| `phaseCode` | `tbl_dim_phase.phase_code` | Phase code, for example `1`, `3`, `4`, `5`, `6`, `7`, `8`, `0-A`. |

## 6. Important behavior notes

- `tbl_fact_artifact_snapshot` is the main table for storing evidence snapshots.
- `tbl_connector_run` is the run-log table for the scanner.
- `source_path` is an important business key used to identify which file was scanned.
- `content_hash` is used to detect file changes between runs.
- `need_parse = true` when the snapshot is new or `content_hash` differs from the latest snapshot.
- `scanStatus = MISSING` when a required artifact is not present in the tree.
- `scanStatus = SKIPPED` when a non-required artifact is not present in the tree, especially phase0 files in a `FULL` scan.
- `scanStatus = FOUND` when the file exists and its content can be read.
- `scanStatus = INACCESSIBLE` when the file exists in the tree but the blob cannot be read.
- `scanStatus = ERROR` is the general error state for the adapter / persistence layer if any.

## 7. Scan mode notes

| scan mode | behavior |
|---|---|
| `TICKET_SCOPED` | Scan only the ticket folders passed in from PR scope or manual input. |
| `FULL` | Scan all ticket folders in the revision, and also `docs/maintenance/phase0/...`. |

## 8. Summary

From a storage perspective, `ArtifactScanner` has two main groups:

1. **Run log**: tells us which scan ran, on which repository, and whether it succeeded or failed
2. **Artifact snapshot**: tells us which file was scanned, whether the file exists, what the hash is, whether it needs to be parsed again, and what the scan status is

This document describes the current scanner only. If a deeper parser is added later, the `schema_*`, `required_fields_missing`, `parsed_summary`, and `privacy_classification` columns can be populated in more detail.
