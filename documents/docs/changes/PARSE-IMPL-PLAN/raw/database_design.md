# Database design — `impl-plan.md` parser (MVP)

**Ticket ID**: PARSE-IMPL-PLAN
**Scope**: Two-phase parsing (`DRAFT` → `OFFICIAL`) for `impl-plan.md` only.
**Out of scope**: parsing other documents, code generation, full raw payload storage, automatic rollback execution.

## 1. Overview

The parser persists parse results in three logical layers:

1. Run layer — records a single parser execution (metadata, timing, counters).
2. Snapshot layer — a persisted snapshot of the artifact (ticket, source path, content hash, parser version).
3. Field layer — extracted fields (template key → value) stored for UI and audit.

Flow:

```text
PR / push / webhook -> Draft parse -> CI Gate -> Official parse -> DB snapshot -> Dashboard
```

## 2. Approved tables (PoC)

Do NOT introduce long-lived, parse-specific `tbl_fact_doc_parse_*` tables for the PoC. The implementation intentionally reuses the project's V4 artifact tables. Expected tables for the PoC:

- `tbl_dim_project`
- `tbl_dim_repository`
- `tbl_dim_ticket`
- `tbl_connector_run` (optional — connector/executor telemetry)
- `tbl_fact_artifact_snapshot` (primary parse snapshot)
- `tbl_fact_artifact_parsed_section` (per-section/field rows)
- `tbl_fact_evidence_event` (parse event log — PARSE_COMPLETED / PARSE_FAILED)
- `tbl_fact_data_quality` (missing-field and error metrics — written only when issues exist)
- `tbl_fact_ci_run` (if CI linkage is required)

## 3. Persistence responsibilities

| Table | Purpose |
|---|---|
| `tbl_fact_artifact_snapshot` | Persisted snapshot per ticket/source; holds parse metadata (`parser_name`, `parser_version`), content hash and parsed-summary JSON used by the UI |
| `tbl_fact_artifact_parsed_section` | Individual extracted fields / sections (key, label, extracted text or JSON) tied to the snapshot |
| `tbl_fact_evidence_event` | One row per parse run: records `event_type` (PARSE_COMPLETED / PARSE_FAILED), `result` (SUCCESS / PARTIAL / FAILED), and a `metadata` JSONB with counts and traceId. `source_type = IMPL_PLAN_PARSE` |
| `tbl_fact_data_quality` | Written only when `missing_count > 0 OR parse_error_count > 0 OR schema_violation_count > 0`. Tracks quality metrics for dashboard and alerting. `source_type = IMPL_PLAN_PARSE` |
| `tbl_connector_run` | Optional: if parser runs are executed as connector jobs, store run telemetry and link to snapshots via `connector_run_id` |

## 4. Table designs (summary)

### Run metadata and where it lives

Run-level telemetry (execution traceId, start/complete times, counters) is recorded either inline on the snapshot row (`tbl_fact_artifact_snapshot`) or in `tbl_connector_run` when the parse is executed as a connector job. The FE/DTOs expect `traceId`, `parserName`, `parserVersion`, `parseStatus`, timing and a small set of counters; those map directly to columns available on `tbl_fact_artifact_snapshot` in V4.

### `tbl_fact_artifact_snapshot` (summary / mapping expectations)

The PoC writes snapshot-level parse metadata into `tbl_fact_artifact_snapshot`. Representative columns already present in V4 and used by the implementation:

- `artifact_snapshot_id` UUID PK (FE: `artifactSnapshotId`)
- `project_id`, `repository_id`, `ticket_id`
- `artifact_type_id` / `document_type` (e.g. `IMPL_PLAN`)
- `source_path` VARCHAR, `content_hash` / `source_hash` VARCHAR
- `collected_at` / `snapshot_at` TIMESTAMPTZ
- `parsed_summary` JSONB (FE: `parsedSummaryJson`)
- `required_fields_missing` JSONB / TEXT
- `parser_version`, `schema_version`, `schema_valid`, `template_empty_flag`
- `parse_status` / `snapshot_status` (`DRAFT_SAVED` / `OFFICIAL_SAVED` / `BLOCKED`)
- `trace_id`, `connector_run_id` (optional), `ci_gate_status`

The FE expects `artifactSnapshotId`, `contentHash`, `parseMode`, `parseStatus`, `parsedSummaryJson`, `parserVersion`, and timestamps; those map to fields above.

### `tbl_fact_artifact_parsed_section` (summary / mapping expectations)

Section / field rows are written into `tbl_fact_artifact_parsed_section`. Representative columns:

- `parsed_section_id` UUID PK (FE: `parsedSectionId`)
- `artifact_snapshot_id` UUID FK (FE: `artifactSnapshotId`)
- `ticket_id`, `repository_id` (denormalized for query convenience)
- `section_key` / `field_key` (canonical key)
- `section_type` / `section_type` (grouping)
- `section_text` / `field_value_text` (TEXT)
- `section_text_hash` (content hash)
- `required_flag`, `present_flag`, `valid_flag`
- `parse_warning` / `notes`
- `display_order`, `created_at`, `updated_at`

Behavior: parsed sections for an upserted snapshot are replaced atomically for that `artifact_snapshot_id` (delete old sections then insert new) to keep snapshot ↔ sections consistent.

## 5. Field set for `impl-plan.md` (canonical keys)

The parser extracts the following canonical keys (template sections) which map to `field_key`:

1. `implementation_principle`
2. `alternative_plan`
3. `reason_for_chosen_plan`
4. `expected_change_file`
5. `class_function_method_to_add_or_modify`
6. `sql_query_repository_policy`
7. `validation_error_logging_policy`
8. `migration_rollback_policy`
9. `step_implementation`
10. `how_to_verify_each_step`
11. `corresponding_ac_table`
12. `stop_ask_condition`
13. `do_not_do_this_ticket`
14. `open_related_issues`

Each extracted field becomes one row in `tbl_fact_doc_parse_field` tied to the `artifactSnapshotId`.

## 6. Representative DDL & migration guidance

Do NOT add parse-specific persistent tables unless a clear product need appears. For PoC and near-term work, update `tbl_fact_artifact_snapshot` / `tbl_fact_artifact_parsed_section` with additive migrations if needed (new nullable columns, JSONB summaries, indexes). Keep migrations additive and reversible. The project already includes V4 migrations that create and index these tables (see `src/main/resources/db/migration/V4__init_shema_v2.sql`).

## 7. Idempotency / upsert behavior

The implemented adapter ensures idempotent persistence using the artifact tables and a deterministic source hash. Recommendation / observed behavior:

- Unique key (enforced logically or via DB): `(repository_id, source_path, content_hash, artifact_type_id, parser_version)`
- Upsert semantics: re-parsing the same file/hash (same `content_hash` and `parser_version`) performs an update of the existing `tbl_fact_artifact_snapshot` row and replaces its `tbl_fact_artifact_parsed_section` rows.
- A change in content hash creates a new snapshot row (history preserved) and inserts new parsed sections.

This aligns with the FE expectations of snapshot history and the PoC JDBC adapter implementation.

## 8. Parse & snapshot statuses

Parse statuses used by service and FE:

- `SUCCESS`, `PARTIAL`, `NOT_FOUND`, `PARSE_ERROR`

Snapshot statuses:

- `DRAFT_SAVED`, `OFFICIAL_SAVED`, `BLOCKED`

## 9. Data rules

- Draft parse: persisted as a `DRAFT` snapshot (saved into `tbl_fact_artifact_snapshot.parsed_summary` and `tbl_fact_artifact_parsed_section`) when the source changes.
- Official parse: persisted/marked `OFFICIAL` only after CI/gate `PASS` — snapshot `snapshot_status` becomes `OFFICIAL_SAVED` and may be promoted to `is_current`.
- Do not persist full raw markdown content in the DB. Persist short extracts, parsed JSON summaries and content hashes only. Avoid logging or storing secrets and large raw files.
- Include `trace_id`, `parser_version`, and `parser_name` in the snapshot row for traceability.

## 10. Suggested query patterns

- By ticket: list snapshots and current/official snapshot for a ticket (`tbl_fact_artifact_snapshot` filtered by `ticket_id`).
- By parse mode / status: filter snapshots by `snapshot_status` / `parse_status`.
- By CI gate: find blocked/failed snapshots using `ci_gate_status`.
- By source hash: identify canonical snapshot for this content and retrieve its parsed sections.

Example: find latest official snapshot and its fields for a ticket:

SELECT s.* FROM tbl_fact_artifact_snapshot s WHERE s.ticket_id = :ticketId AND s.snapshot_status = 'OFFICIAL_SAVED' ORDER BY s.collected_at DESC LIMIT 1;

Then query `tbl_fact_artifact_parsed_section` by `artifact_snapshot_id` for section details.
