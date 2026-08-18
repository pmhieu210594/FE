# Requirement — Artifact Scanner

## 1. Purpose

Artifact Scanner is a backend component used to scan the repository and create an Artifact Inventory for SDD evidence artifacts. This function helps the system know, by ticket:

- Which artifacts currently exist
- Which required artifacts are missing
- Which artifacts are newly created or have changed
- Which artifacts need to be processed again by the parser

Artifact Scanner does not interpret detailed Markdown content, does not calculate KPIs, does not retrieve PR/CI metadata, and does not perform traceability matching.

---

## 2. Functional Scope

### 2.1 Primary scan scope

Artifact Scanner scans artifacts under the directory:

- `docs/changes/<TICKET>/`

Files to recognize in the MVP:

- `spec-pack.md`
- `impl-plan.md`
- `review-checklist.md`
- `self-review.md`
- `test-plan.md`
- `test-results.md`
- `report.md`
- `blackbox-testcases.md`

In this ticket, all eight files above are considered Artifact Scanner targets and must be checked for existence/missing status by ticket.

### 2.2 Additional scan scope

Artifact Scanner scans basic metadata under:

- `docs/maintenance/phase0/**/*`

For `docs/maintenance/phase0/`, the MVP only records existence, artifact type inferred from path/file name, hash, size, updated time, and re-parse-needed status. It does not parse decision, risk, review, or execution log content in this module.

---

## 3. Out of Scope

Artifact Scanner does not perform the following:

- Parse Markdown sections and extract AC, Scope, Risk, Rollback, CI Run ID
- Sync Acceptance Criteria
- Collect Git metadata such as author, branch, changed file path, added/deleted lines
- Collect PR metadata such as title, status, review state, labels
- Collect CI metadata such as workflow run, status, duration, failure summary
- Calculate Evidence Quality Score
- Calculate AC-Test Coverage
- Perform traceability matching
- Analyze reviews, findings, security scans, or exceptions

---

## 4. Actors and Usage

### 4.1 System actors
- Scheduler / batch job
- Webhook orchestration layer
- Data Ops operator
- Admin or developer with permission to run scans manually

### 4.2 Trigger methods
Artifact Scanner can run in the following modes:

- Full scan by repository + branch
- Scoped scan by repository + ticket_id
- Rerun scan by previous scan request

Note: `CHANGED_FILES_SCOPED` has not been prioritized for MVP v1 of this ticket.

---

## 5. Input

Artifact Scanner receives the following inputs:

- `repository_id` required
- `branch_or_ref` required
- `scan_mode` required: `FULL`, `TICKET_SCOPED`
- `ticket_ids` optional
- `requested_by` required
- `trigger_type` required: `MANUAL`, `BATCH`, `WEBHOOK`
- `request_id` or `trace_id` optional

---

## 6. Main Processing

### 6.1 Processing steps
1. Determine the file scope to scan
2. Filter paths that match artifact patterns
3. Infer `ticket_id` from the path `docs/changes/<TICKET>/`
4. Identify `artifact_type` from the filename
5. Check required artifacts by ticket
6. Read file metadata
7. Calculate `content_hash`
8. Compare with the latest snapshot
9. Determine `need_parse`
10. Write Artifact Inventory / Artifact Snapshot
11. Write Scan Run Summary

### 6.2 Artifact identification rules
Examples:
- `docs/changes/ABC-123/spec-pack.md` → `ticket_id=ABC-123`, `artifact_type=SPEC_PACK`
- `docs/changes/ABC-123/test-results.md` → `ticket_id=ABC-123`, `artifact_type=TEST_RESULTS`
- `docs/maintenance/phase0/phase0-risk-register.md` → `ticket_id=NULL`, `artifact_type=PHASE0_RISK_REGISTER`

### 6.3 `need_parse` rule
`need_parse = true` when:
- The artifact has never existed in inventory before
- `content_hash` changed compared with the latest snapshot
- The previous `scan_status` was an error and the file can now be read again

### 6.4 Template warning rule
Artifact Scanner may produce a basic warning when:
- The file is empty
- The file is very short under a configured threshold
- The file only contains simple headings/template placeholders

---

## 7. Output

### 7.1 Detailed output
Artifact Scanner creates or updates inventory/snapshot records with the following data:

- organization_id
- customer_id
- project_id
- repository_id
- ticket_id
- artifact_type
- source_path
- exists_flag
- content_hash
- size_bytes
- source_updated_at
- template_empty_flag
- need_parse
- scan_status
- scan_message
- scan_run_id

### 7.2 Summary output
Artifact Scanner creates a scan summary:

- total_tickets_scanned
- total_artifacts_found
- total_required_missing
- total_changed
- total_need_parse
- total_warnings
- total_errors
- status

---

## 8. Functional Requirements

### FR-AS-001
The system must be able to scan artifact files under `docs/changes/<TICKET>/`.

### FR-AS-002
The system must be able to identify `ticket_id` from the path structure.

### FR-AS-003
The system must be able to identify `artifact_type` from the filename according to configuration.

### FR-AS-004
The system must record the existing or missing status of required artifacts by ticket.

### FR-AS-005
The system must store minimum artifact metadata, including path, hash, size, updated time, and scan status.

### FR-AS-006
The system must detect new artifacts or changed artifacts based on content hash.

### FR-AS-007
The system must flag `need_parse` for new or changed artifacts.

### FR-AS-008
The system must scan basic metadata for files under `docs/maintenance/phase0/**/*`.

### FR-AS-009
The system must record scan run logs and scan summaries for each run.

### FR-AS-010
The system must support `FULL` and `TICKET_SCOPED` in MVP v1.

### FR-AS-011
The system must not store full source code, raw prompt/chat, secrets, or raw CI logs in Artifact Scanner.

### FR-AS-012
The system must allow an API or manual query to view the scan summary and artifact result list for testing and operations. If there is a UI, that UI is only a supporting tool.

---

### FR-AS-013
When a path is valid under `docs/changes/<TICKET>/` but `ticket_id` does not exist in `tbl_dim_ticket`, the system must handle it with the `skip + warning` policy, not fail the entire scan run, and not automatically create a placeholder ticket.

## 9. Non-functional Requirements

### NFR-AS-001
Batch rerun must be idempotent. If the source hash is the same, duplicate snapshot logic must not be created.

### NFR-AS-002
Artifact Scanner must support changing artifact patterns through configuration.

### NFR-AS-003
Artifact Scanner must write structured logs with `trace_id` and `scan_run_id`.

### NFR-AS-004
Artifact Scanner must handle errors per file and must not break the entire scan run if one file has an error.

### NFR-AS-005
Artifact Scanner must separate the permission to run scans from the permission to view scan results.

---

## 10. Acceptance Criteria

1. The system can scan the target repository and detect the eight Artifact Scanner targets under `docs/changes/<TICKET>/`, including `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `report.md`, `blackbox-testcases.md`.
2. For a ticket with complete evidence, the system displays the correct present/missing status for required artifacts, including `blackbox-testcases.md`.
3. For a ticket with missing evidence, the system displays the correct missing artifacts.
4. When an artifact file's content changes, `content_hash` changes and `need_parse` is enabled.
5. The system can scan basic metadata for `docs/maintenance/phase0/**/*`.
6. The scan run summary and artifact result can be viewed from an API or operations screen.
7. No Markdown content parsing is performed inside the Artifact Scanner module.