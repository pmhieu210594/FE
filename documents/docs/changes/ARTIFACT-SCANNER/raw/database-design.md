# Database Design

## 1. Design Principles

This document uses only the tables created in `V4__init_shema_v2.sql`.

Artifact Scanner **does not create a separate new table set**. This function must reuse the existing V4 schema, in which:

- `tbl_source_connector` and `tbl_connector_run` are used to manage scanner runs
- `tbl_dim_artifact_type` is used to define artifact types and basic inventory rules
- `tbl_fact_artifact_snapshot` is the main table for storing scan results
- parser, phase tracking, and rule validation tables are not in the scanner's direct scope

Artifact Scanner is a metadata inventory module, so the database design needs to support the following goals:

1. Record each scanner run
2. Record artifact snapshots for each scan run
3. Know which artifacts exist, which are missing, and which have changed
4. Know which artifacts need to be processed again by the parser
5. Support the Scan Result and Ticket Evidence Inventory screens

---

## 2. Artifact Scanner Data Scope

Artifact Scanner scans the following sources:

### 2.1 Primary source

```text
/docs/changes/<TICKET>/
```

### 2.2 Additional source

```text
/docs/maintenance/phase0/**/*
```

For `docs/maintenance/phase0/`, Artifact Scanner only scans basic metadata and does not parse content.

---

## 3. V4 Tables Used

## 3.1 `tbl_dim_repository`

### Role
Used to identify the repository that Artifact Scanner is scanning.

### How the scanner uses it
- input `repository_id`
- limit the scan scope by repository
- join to project/customer if needed for UI or API

### Is a schema change needed?
- No

### Reason
This table is already sufficient as the root entity for scan runs and artifact snapshots.

---

## 3.2 `tbl_dim_ticket`

### Role
Used to associate artifacts with tickets.

### How the scanner uses it
- infer `ticket_id` from the path `docs/changes/<TICKET>/`
- store `ticket_id` in the snapshot
- support the inventory screen by ticket

### Is a schema change needed?
- No

### Reason
The current table satisfies the inventory need. For artifacts in `docs/maintenance/phase0/`, `ticket_id` can be `NULL`.

---

## 3.3 `tbl_dim_phase`

### Role
Used indirectly to associate `phase_id` with artifacts.

### How the scanner uses it
The scanner does not need to query this table frequently if `phase_id` is already set in `tbl_dim_artifact_type`. However, from a data model perspective, the scanner still depends on the artifact type's phase.

### Is a schema change needed?
- No

### Reason
Artifact Scanner is not a phase management module. This table is already sufficient to support phase mapping for artifact types.

---

## 3.4 `tbl_dim_artifact_type`

### Role
This is the most important configuration table for Artifact Scanner.

### How the scanner uses it
- map filename to artifact type
- determine which phase the artifact belongs to
- determine which artifacts are required or optional
- support ticket-level inventory logic

### Artifact types currently suitable for the scanner
Artifact group in `docs/changes/<TICKET>/`:
- `SPEC_PACK`
- `SOURCES`
- `IMPL_PLAN`
- `REVIEW_CHECKLIST`
- `SELF_REVIEW`
- `TEST_PLAN`
- `TEST_RESULTS`
- `BLACKBOX_TESTCASES`
- `TEST_DATA`
- `REPORT`

The `.claude/*` group exists in V4 but is not part of the current Artifact Scanner scope:
- `CLAUDE_MD`
- `CLAUDE_SETTINGS`
- `CLAUDE_RULE`

### Is a change needed?
- Yes, **additional seed data is needed**
- No table structure change is needed

### Proposed additional seed data
To support metadata scanning for `docs/maintenance/phase0/**/*`, the following artifact types should be added:

- `PHASE0_DECISIONS`
- `PHASE0_EXECUTION_LOG`
- `PHASE0_PLAN`
- `PHASE0_REVIEW`
- `PHASE0_RISK_REGISTER`
- `PHASE0_SOURCE_AVAILABILITY`

### Reason
V4 currently does not cover artifact types for Phase 0, while the agreed Artifact Scanner scope includes basic metadata scanning for `docs/maintenance/phase0/**/*`.

---

## 3.5 `tbl_source_connector`

### Role
Identifies Artifact Scanner as a connector in the system.

### How the scanner uses it
- each scanner run must be associated with a `connector_id`
- `tbl_connector_run` has an FK to this table

### Is a schema change needed?
- No

### Is a data update needed?
- Yes

### Proposed seed data
At least one connector record is needed for Artifact Scanner, for example:

- `connector_type = 'ARTIFACT_SCANNER'`
- `connector_name = 'artifact-scanner-local'`

Or use the system's naming convention, as long as it is stable for BE reuse.

### Reason
Without a corresponding connector row, the scanner cannot write runs into `tbl_connector_run` according to the V4 design.

---

## 3.6 `tbl_connector_run`

### Role
This table stores information for each Artifact Scanner run.

### How the scanner uses it
For each scanner run:
- create a new row with `status = RUNNING`
- update `started_at`, `finished_at`
- update `records_read`, `records_written`
- update `error_message`, `trace_id` if an error occurs

### Proposed mapping
- `records_read` = number of paths/files the scanner evaluated
- `records_written` = number of snapshot rows successfully written by the scanner

### Is a schema change needed?
- Not required

### Reason
The current table is sufficient for the Artifact Scanner scan-run lifecycle in the MVP.

### Notes
Aggregated numbers such as:
- number of tickets scanned
- number of missing artifacts
- number of changed artifacts
- number of artifacts needing parse

are not necessarily stored immediately in `tbl_connector_run`, because they can be calculated from `tbl_fact_artifact_snapshot` by `connector_run_id`.

---

## 3.7 `tbl_fact_artifact_snapshot`

### Role
This is the **main table** of Artifact Scanner in the V4 schema.

Artifact Scanner must write scan results into this table.

### Existing columns suitable for the scanner
- `ticket_id`
- `repository_id`
- `artifact_type_id`
- `phase_id`
- `source_path`
- `exists_flag`
- `content_hash`
- `schema_version`
- `schema_valid`
- `template_empty_flag`
- `required_fields_missing`
- `parsed_summary`
- `source_created_at`
- `source_updated_at`
- `collected_at`
- `parser_version`
- `connector_run_id`

### How the scanner uses it
Artifact Scanner writes each artifact scan as one snapshot. Each snapshot reflects the artifact state at the `collected_at` time of a `connector_run_id`.

### What is missing for the scanner scope
The current table is almost sufficient, but it is missing several practical metadata fields for the scanner.

#### Proposed update 1: add `size_bytes`
```sql
size_bytes bigint null
```

**Reason**
- better display in the scan result view
- supports empty/template file checks
- useful for scan debugging

#### Proposed update 2: add `scan_status`
```sql
scan_status varchar(32) not null default 'FOUND'
```

**Proposed values**
- `FOUND`
- `MISSING`
- `INACCESSIBLE`
- `ERROR`
- `SKIPPED`

**Reason**
`exists_flag` alone is not enough to represent the actual scan state.

#### Proposed update 3: add `scan_message`
```sql
scan_message varchar(1000) null
```

**Reason**
Helps display and debug cases such as:
- required artifact is missing
- file cannot be read
- phase0 is metadata-only
- content hash changed

### Is a schema change needed?
- Yes, a **light update** with the three columns above is recommended

### Does any column need to be removed?
- No

### Notes on existing columns not deeply used by the scanner yet
- `schema_version`: can be null in scanner if front matter is not parsed yet
- `schema_valid`: scanner is not responsible for deep schema validation yet
- `required_fields_missing`: scanner should not use it for required field logic yet
- `parsed_summary`: scanner does not populate it; parser uses it later
- `parser_version`: scanner can leave it null or use a separate constant if the system wants to track producer

---

## 4. V4 Tables Not Directly in Artifact Scanner Scope

## 4.1 `tbl_fact_artifact_parsed_section`

### Is it used?
- No

### Reason
This table is for the parser after the scanner. Artifact Scanner does not parse Markdown sections.

---

## 4.2 `tbl_artifact_required_field_rule`

### Is it used?
- Not in the scanner MVP

### Reason
This table serves the parser / validation / score engine. Artifact Scanner should only perform metadata inventory and should not check detailed required fields.

---

## 4.3 `tbl_fact_ticket_phase_status`

### Is it used?
- No

### Reason
This table belongs to the phase tracking and dashboard layer, not the inventory layer.

---

## 5. Proposed View

Artifact Scanner should not create a new current-state table. Instead, it should create a view to retrieve the latest snapshot.

## 5.1 `vw_artifact_inventory_current`

### Purpose
Support API/manual query to retrieve the current artifact state without rewriting complex queries each time.

### Proposed logic
Get the latest snapshot by:
- `repository_id + source_path`

Or, if the UI wants ticket-type grouping:
- `repository_id + ticket_id + artifact_type_id`

### Reason
- avoids duplicating data
- follows the V4 snapshot model
- convenient for the Scan Result view and Ticket Evidence Detail

---

## 6. Proposed Additional Indexes

On `tbl_fact_artifact_snapshot`, the following indexes should be added:

### 6.1 Latest snapshot by path
```sql
create index idx_artifact_snapshot_repo_path_latest
  on tbl_fact_artifact_snapshot(repository_id, source_path, collected_at desc);
```

### 6.2 Latest snapshot by ticket + artifact type
```sql
create index idx_artifact_snapshot_repo_ticket_type_latest
  on tbl_fact_artifact_snapshot(repository_id, ticket_id, artifact_type_id, collected_at desc);
```

### Reason
Artifact Scanner UI and API queries often need to:
- find the latest snapshot by path
- find the current inventory by ticket and artifact type

---

## 7. Artifact Scanner DB Data Flow

## 7.1 When starting a scan
1. Find Artifact Scanner's `connector_id` from `tbl_source_connector`
2. Create a new row in `tbl_connector_run` with `status = RUNNING`

## 7.2 When scanning each file
1. Determine `repository_id`
2. Determine `ticket_id` if the path belongs to `docs/changes/<TICKET>/`
3. Determine `artifact_type_id` from `tbl_dim_artifact_type`
4. Write a snapshot into `tbl_fact_artifact_snapshot`

## 7.3 When the scan finishes
1. Update `tbl_connector_run.status`
2. Update `records_read`, `records_written`, `finished_at`

---

## 8. Data Rules for the Scanner

### 8.1 `exists_flag` rule
- `true` if the file is found and basic metadata can be read
- `false` if a required artifact is not found

### 8.2 `need_parse` rule
V4 does not yet have a `need_parse` column in `tbl_fact_artifact_snapshot`.

### Recommendation
**Do not add `need_parse` to the snapshot table at this stage** if the goal is to minimize schema changes.

Instead, the parser can identify candidates by query:
- artifact has never been parsed
- or the `content_hash` of the latest snapshot differs from the most recent parsed snapshot

### Reason
`need_parse` is derived state and does not necessarily need to be persisted at the scanner layer.

If orchestration needs optimization later, it can be added afterward.

---

## 9. Proposed SQL Updates

## 9.1 Seed additional artifact types for Phase 0
```sql
insert into tbl_dim_artifact_type (artifact_type_code, artifact_type_name, phase_id, is_required, is_active)
values
  ('PHASE0_DECISIONS', 'Phase0 Decisions', null, false, true),
  ('PHASE0_EXECUTION_LOG', 'Phase0 Execution Log', null, false, true),
  ('PHASE0_PLAN', 'Phase0 Plan', null, false, true),
  ('PHASE0_REVIEW', 'Phase0 Review', null, false, true),
  ('PHASE0_RISK_REGISTER', 'Phase0 Risk Register', null, false, true),
  ('PHASE0_SOURCE_AVAILABILITY', 'Phase0 Source Availability', null, false, true);
```

## 9.2 Add scan metadata columns to snapshot
```sql
alter table tbl_fact_artifact_snapshot
  add column size_bytes bigint null,
  add column need_parse boolean not null default false,
  add column scan_status varchar(32) not null default 'FOUND',
  add column scan_message varchar(1000) null;
```

## 9.3 Add indexes for latest snapshot queries
```sql
create index idx_artifact_snapshot_repo_path_latest
  on tbl_fact_artifact_snapshot(repository_id, source_path, collected_at desc);

create index idx_artifact_snapshot_repo_ticket_type_latest
  on tbl_fact_artifact_snapshot(repository_id, ticket_id, artifact_type_id, collected_at desc);
```

## 9.4 Seed connector for Artifact Scanner
```sql
insert into tbl_source_connector (connector_code, connector_name, connector_type, is_active)
values ('ARTIFACT_SCANNER', 'Artifact Scanner', 'ARTIFACT_SCANNER', true);
```

---

## 10. Design Conclusion

Artifact Scanner in the V4 schema should be designed as follows:

- use `tbl_source_connector` to identify the scanner
- use `tbl_connector_run` to store each run
- use `tbl_dim_artifact_type` to map filenames and manage artifact types
- use `tbl_fact_artifact_snapshot` as the main table for storing scan results and `need_parse` state
- do not directly use parser/validation/phase tracking tables
- do not create new tables outside V4
- only add Phase 0 seed data and several practical scan metadata columns to the snapshot table

This design follows the principles of:
- using only tables in `V4__init_shema_v2.sql`
- matching the agreed Artifact Scanner scope
- not mixing responsibilities with the parser, score engine, traceability logic, or other collectors