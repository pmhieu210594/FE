# Database Design — `test-plan.md` / `test-results.md` Parser (MVP)

**Ticket ID**: `PARSE-TEST-PLAN-RESULTS`  
**Scope**: Snapshot parsing for `test-plan.md` and `test-results.md` only.  
**Out of scope**: other documents, code generation, full raw markdown storage, CI gate, automatic rollback.

## 1. Overview

The parser stores results in two logical layers:

1. Snapshot layer — one snapshot for each parsed source file (ticket, artifact type, source path, content hash, parser version).
2. Field layer — extracted sections / fields for UI and audit.

Flow:

```text
PR / push / webhook -> Parser -> DB snapshot -> Dashboard
```

The parser does **not** depend on CI. CI does not affect whether a snapshot is stored.

## 2. Approved tables (PoC)

Do not create long-lived parse-specific tables like `tbl_fact_doc_parse_*` for the PoC. Reuse the platform’s existing artifact snapshot pattern.

Expected tables for the PoC:

- `tbl_dim_project`
- `tbl_dim_repository`
- `tbl_dim_ticket`
- `tbl_fact_artifact_snapshot` (primary snapshot)
- `tbl_fact_artifact_parsed_section` (per-field rows)
- `tbl_fact_evidence_event` (parse event log — PARSE_COMPLETED / PARSE_FAILED)
- `tbl_fact_data_quality` (missing-field and error metrics — written only when issues exist)
- `tbl_connector_run` (optional — parser run telemetry)

## 3. Persistence responsibilities

| Table | Purpose |
|---|---|
| `tbl_fact_artifact_snapshot` | Stores parse snapshot per ticket/source; keeps metadata such as `parser_name`, `parser_version`, `source_hash`, `parse_status`, `artifact_type`, `parsed_summary_json` |
| `tbl_fact_artifact_parsed_section` | Stores extracted sections / fields (key, label, text/JSON) linked to the snapshot |
| `tbl_fact_evidence_event` | One row per parse run: records `event_type` (PARSE_COMPLETED / PARSE_FAILED), `result` (SUCCESS / PARTIAL / FAILED), and a `metadata` JSONB with counts and traceId. `source_type = TEST_PLAN_PARSE` or `TEST_RESULTS_PARSE` |
| `tbl_fact_data_quality` | Written only when `missing_count > 0 OR parse_error_count > 0 OR schema_violation_count > 0`. Tracks quality metrics for dashboard and alerting. `source_type = TEST_PLAN_PARSE` or `TEST_RESULTS_PARSE` |
| `tbl_connector_run` | Optional: telemetry for each parser run if the parser is run as a job/connector |

## 4. Table designs (summary)

### 4.1 Run / snapshot metadata
Run-level metadata (traceId, start/complete times, counters) may be stored:

- inline in `tbl_fact_artifact_snapshot`, or
- in `tbl_connector_run` if the parser is run as a separate job/connector.

For the PoC, the snapshot must at least return `traceId`, `parser_name`, `parser_version`, `parse_status`, parse time, and a short summary for the UI.

### 4.2 `tbl_fact_artifact_snapshot` (summary / mapping expectations)
Recommended snapshot columns:

- `artifact_snapshot_id` UUID PK
- `project_id`, `repository_id`, `ticket_id`
- `artifact_type` (e.g. `TEST_PLAN`, `TEST_RESULTS`)
- `source_path` VARCHAR
- `source_hash` VARCHAR
- `parser_name` VARCHAR
- `parser_version` VARCHAR
- `parse_status` (`SUCCESS` / `PARTIAL` / `NOT_FOUND` / `PARSE_ERROR`)
- `parsed_summary_json` JSONB
- `required_fields_missing` JSONB / TEXT
- `schema_valid_flag`
- `template_empty_flag`
- `trace_id`
- `parsed_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

### 4.3 `tbl_fact_artifact_parsed_section` (summary / mapping expectations)
Recommended section rows:

- `parsed_section_id` UUID PK
- `artifact_snapshot_id` UUID FK
- `ticket_id`
- `repository_id`
- `section_key` / `field_key` (canonical key)
- `section_label`
- `section_type`
- `section_value_text` TEXT
- `section_value_json` JSONB
- `section_text_hash`
- `required_flag`
- `present_flag`
- `valid_flag`
- `parse_warning`
- `display_order`
- `created_at`
- `updated_at`

Behavior: section rows for the same `artifact_snapshot_id` are atomically replaced on re-parse to keep snapshot and section data consistent.

## 5. Canonical keys for `test-plan.md`

1. `purpose`
2. `ac_matrix_test_type`
3. `priority`
4. `reuse_existing_test`
5. `additional_test_this_time`
6. `e2e_step_by_step_scenarios`
7. `areas_intentionally_left_untested_this_time`
8. `data_testing_principles`
9. `execution_command`
10. `stop_condition`
11. `required_human_decision`

## 6. Canonical keys for `test-results.md`

1. `execution_environment`
2. `executed_command`
3. `summary_of_results`
4. `list_of_passes`
5. `list_of_fails`
6. `bugs_fixed`
7. `not_yet_fixed_pending`
8. `test_cannot_be_executed_and_reason`
9. `remaining_risk`
10. `final_test_verdict`

## 7. DDL & migration guidance

Reuse the existing artifact snapshot and parsed section tables. If needed for the PoC, add nullable columns or JSONB summary fields using additive migrations only. Do not create parse-specific tables unless a real product need appears.

## 8. Idempotency / upsert behavior

Recommended unique key logic:

- `(repository_id, source_path, source_hash, artifact_type, parser_version)`

Upsert semantics:

- re-parse the same file/hash with the same parser_version => update the existing snapshot and replace its parsed section rows
- if source hash changes => create a new snapshot to preserve history

## 9. Parse statuses

- `SUCCESS`
- `PARTIAL`
- `NOT_FOUND`
- `PARSE_ERROR`

## 10. Data rules

- Store snapshot immediately after parse.
- Do not store full raw markdown in the DB.
- Store only short extracts, parsed JSON summary, hash, traceId, and required section rows.
- `test-plan.md` and `test-results.md` are parsed independently but queried together by ticket for paired display.

## 11. Query patterns

- By ticket: list snapshots for both `TEST_PLAN` and `TEST_RESULTS` for the same ticket.
- By artifact type: filter snapshots by `artifact_type`.
- By parse status: filter snapshots by success / partial / error.
- By source hash: find the canonical snapshot for a file.

Example: get the latest `test-plan.md` snapshot for a ticket:

```sql
SELECT s.*
FROM tbl_fact_artifact_snapshot s
WHERE s.ticket_id = :ticketId
  AND s.artifact_type = 'TEST_PLAN'
ORDER BY s.parsed_at DESC
LIMIT 1;
```

Then query `tbl_fact_artifact_parsed_section` by `artifact_snapshot_id` for section details.
