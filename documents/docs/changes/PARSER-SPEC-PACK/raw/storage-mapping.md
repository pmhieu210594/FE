# Parser Spec-Pack Storage Mapping

**Created**: 2026-06-19  
**Purpose**: Detailed documentation of where data is stored and what each column means when the spec-pack parser completes

---

## Overview Flow

When a GitHub webhook triggers a PR event → `ArtifactScannerService` scans artifacts → detects `spec-pack.md` → calls `SpecPackMarkdownParser.parse()` → stores the parse result into **7 tables** in the database.

```
spec-pack.md content
        ↓
SpecPackMarkdownParser.parse()
        ↓
    [Parse Result Object]
    ├─ acceptanceCriteria[] (AC list)
    ├─ sections{} (section key→text map)
    ├─ decisions[] (decision list)
    ├─ risks[] (risk list)
    ├─ frontMatter{} (front matter fields)
    ├─ parseStatus (COMPLETE|PARTIAL|FAILED)
    ├─ warnings[] (parser warnings)
    ├─ errors[] (parser errors)
    └─ requiredFieldsMissing[] (required field list)
        ↓
    [Persist to 7 Tables]
```

---

## Table 1: tbl_fact_artifact_snapshot

**Main table** that stores metadata for the spec-pack file when it is scanned.

| Column | Type | Nullable | Meaning |
|-----|------|----------|---------|
| artifact_snapshot_id | UUID | NO | PK - unique snapshot ID |
| connector_run_id | UUID | NO | FK - scan run ID (ARTIFACT_SCANNER connector) |
| repository_id | UUID | NO | FK - repository containing the file |
| ticket_id | UUID | NO | FK - related ticket (e.g., CUSTOMER, TEAM) |
| ticket_external_key | VARCHAR | NO | Ticket key from git (e.g., "CUSTOMER") |
| artifact_type_id | UUID | NO | FK - artifact type (SPEC_PACK) |
| source_path | VARCHAR | NO | File path: `docs/changes/TICKET_KEY/spec-pack.md` |
| exists_flag | BOOLEAN | NO | true = file exists, false = file was deleted |
| content_hash | VARCHAR | NO | SHA256 hash of file content - used to detect changes |
| size_bytes | BIGINT | YES | File size (bytes) |
| source_updated_at | TIMESTAMPTZ | YES | Time the file was updated in git |
| need_parse | BOOLEAN | NO | true = file needs parsing (changed), false = unchanged |
| scan_status | VARCHAR | NO | FOUND \| MISSING \| INACCESSIBLE \| ERROR \| SKIPPED |
| scan_message | TEXT | YES | Scan message (if any error occurs) |
| collected_at | TIMESTAMPTZ | NO | Time the snapshot was created |
| parser_version | VARCHAR | YES | Parser version (e.g., "1.0-SNAPSHOT") |

**Example data:**
```
artifact_snapshot_id: 550e8400-e29b-41d4-a716-446655440001
connector_run_id: 550e8400-e29b-41d4-a716-446655440002
repository_id: 550e8400-e29b-41d4-a716-446655440003
ticket_id: 550e8400-e29b-41d4-a716-446655440004
ticket_external_key: "CUSTOMER"
source_path: "docs/changes/CUSTOMER/spec-pack.md"
content_hash: "a1b2c3d4e5f6..."
size_bytes: 5234
need_parse: true
scan_status: "FOUND"
collected_at: 2026-06-19T13:48:10+07:00
```

---

## Table 2: tbl_fact_acceptance_criteria

**AC table** - stores each Acceptance Criteria extracted from the spec-pack.

| Column | Type | Nullable | Meaning |
|-----|------|----------|---------|
| ac_id | UUID | NO | PK - unique AC ID |
| ticket_id | UUID | NO | FK - ticket containing the AC |
| artifact_snapshot_id | UUID | YES | FK - snapshot (spec-pack) from which the AC was extracted |
| ac_key | VARCHAR | NO | AC key (e.g., "AC-001", "AC-FUNCTIONAL-1") |
| ac_text_hash | VARCHAR | YES | SHA256 hash of the AC content |
| ac_summary | TEXT | YES | AC content (truncate ≤500 characters) |
| ambiguous_flag | BOOLEAN | NO | true = AC appears unclear (ambiguous) |
| status | VARCHAR | NO | ACTIVE \| ARCHIVED \| DEPRECATED |
| created_at | TIMESTAMPTZ | NO | Time the record was created |
| created_by | VARCHAR | NO | SYSTEM (the parser creates it automatically) |
| updated_at | TIMESTAMPTZ | NO | Time of last update |
| updated_by | VARCHAR | NO | SYSTEM |

**Constraint:**
- UNIQUE(ticket_id, ac_key) - Do not allow two ACs with the same key within one ticket

**Example data:**
```
ac_id: 660e8400-e29b-41d4-a716-446655440001
ticket_id: 550e8400-e29b-41d4-a716-446655440004
artifact_snapshot_id: 550e8400-e29b-41d4-a716-446655440001
ac_key: "AC-001"
ac_text_hash: "b2c3d4e5f6g7..."
ac_summary: "User must be able to login with valid email and password"
ambiguous_flag: false
status: "ACTIVE"
created_by: "SYSTEM"
```

---

## Table 3: tbl_fact_artifact_parsed_section

**Section table** - stores each section from the spec-pack (Scope, Architecture, Acceptance Criteria, etc.).

| Column | Type | Nullable | Meaning |
|-----|------|----------|---------|
| parsed_section_id | UUID | NO | PK - unique section ID |
| artifact_snapshot_id | UUID | NO | FK - snapshot (spec-pack) containing the section |
| ticket_id | UUID | YES | FK - related ticket |
| section_type | VARCHAR | NO | Standardized section type (e.g., "SCOPE", "ARCHITECTURE", "ACCEPTANCE_CRITERIA") |
| section_key | VARCHAR | YES | Original key from spec-pack (e.g., "scope", "Architecture") |
| section_text_hash | VARCHAR | YES | SHA256 hash of the section content |
| section_summary | TEXT | YES | Section content (truncate ≤500 characters) |
| required_flag | BOOLEAN | NO | true = section is required by template |
| present_flag | BOOLEAN | NO | true = section was found in the file |
| valid_flag | BOOLEAN | YES | true = section passed validation rules |
| parse_warning | TEXT | YES | Warning if the section has issues but is not fatal |
| created_at | TIMESTAMPTZ | NO | Time the record was created |
| created_by | VARCHAR | NO | SYSTEM |
| updated_at | TIMESTAMPTZ | NO | Time of last update |
| updated_by | VARCHAR | NO | SYSTEM |

**Example data:**
```
parsed_section_id: 770e8400-e29b-41d4-a716-446655440001
artifact_snapshot_id: 550e8400-e29b-41d4-a716-446655440001
ticket_id: 550e8400-e29b-41d4-a716-446655440004
section_type: "SCOPE"
section_key: "scope"
section_text_hash: "c3d4e5f6g7h8..."
section_summary: "This feature covers user authentication flow..."
required_flag: true
present_flag: true
valid_flag: true
parse_warning: null
```

---

## Table 4: tbl_fact_decision

**Decision table** - stores Decision section entries (if parsed), or null if none exists.

| Column | Type | Nullable | Meaning |
|-----|------|----------|---------|
| decision_id | UUID | NO | PK - unique decision ID |
| ticket_id | UUID | YES | FK - ticket |
| repository_id | UUID | YES | FK - repository |
| artifact_snapshot_id | UUID | YES | FK - snapshot (spec-pack) |
| decision_key | VARCHAR | YES | Decision key (e.g., "DECISION-001") |
| decision_summary | TEXT | YES | Decision content (truncate ≤500 characters) |
| reason_present | BOOLEAN | NO | true = the decision includes a reason/explanation, false = no |
| impact_summary | TEXT | YES | Summary of the decision’s impact |
| decided_by_role_id | UUID | YES | FK - role of the decision maker |
| decided_at | TIMESTAMPTZ | YES | Time the decision was made |
| created_at | TIMESTAMPTZ | NO | Time the record was created |
| created_by | VARCHAR | NO | SYSTEM |
| updated_at | TIMESTAMPTZ | NO | Time of last update |
| updated_by | VARCHAR | NO | SYSTEM |

**Example data:**
```
decision_id: 880e8400-e29b-41d4-a716-446655440001
ticket_id: 550e8400-e29b-41d4-a716-446655440004
repository_id: 550e8400-e29b-41d4-a716-446655440003
artifact_snapshot_id: 550e8400-e29b-41d4-a716-446655440001
decision_key: "DECISION-ARCH-001"
decision_summary: "Use microservices architecture"
reason_present: true
impact_summary: "Enables independent scaling"
```

---

## Table 5: tbl_fact_risk

**Risk table** - stores Risk section entries (if parsed).

| Column | Type | Nullable | Meaning |
|-----|------|----------|---------|
| risk_id | UUID | NO | PK - unique risk ID |
| ticket_id | UUID | YES | FK - ticket |
| repository_id | UUID | YES | FK - repository |
| artifact_snapshot_id | UUID | YES | FK - snapshot (spec-pack) |
| risk_key | VARCHAR | YES | Risk key (e.g., "RISK-001") |
| risk_summary | TEXT | YES | Risk description (truncate ≤500 characters) |
| severity | VARCHAR | NO | LOW \| MEDIUM \| HIGH \| CRITICAL |
| mitigation_present | BOOLEAN | NO | true = the risk has a mitigation plan |
| mitigation_summary | TEXT | YES | Summary of the mitigation plan |
| status | VARCHAR | NO | OPEN \| MITIGATED \| CLOSED |
| created_at | TIMESTAMPTZ | NO | Time the record was created |
| created_by | VARCHAR | NO | SYSTEM |
| updated_at | TIMESTAMPTZ | NO | Time of last update |
| updated_by | VARCHAR | NO | SYSTEM |
| resolved_at | TIMESTAMPTZ | YES | Time the risk was resolved |

**Example data:**
```
risk_id: 990e8400-e29b-41d4-a716-446655440001
ticket_id: 550e8400-e29b-41d4-a716-446655440004
repository_id: 550e8400-e29b-41d4-a716-446655440003
artifact_snapshot_id: 550e8400-e29b-41d4-a716-446655440001
risk_key: "RISK-PERF-001"
risk_summary: "Database query performance degradation"
severity: "HIGH"
mitigation_present: true
mitigation_summary: "Add caching layer and optimize queries"
status: "OPEN"
```

---

## Table 6: tbl_fact_evidence_event

**Evidence Event table** - stores parse event logs (PARSE_STARTED, PARSE_COMPLETED, PARSE_FAILED).

| Column | Type | Nullable | Meaning |
|-----|------|----------|---------|
| evidence_event_id | UUID | NO | PK - unique event ID |
| ticket_id | UUID | YES | FK - ticket |
| repository_id | UUID | YES | FK - repository |
| artifact_snapshot_id | UUID | YES | FK - snapshot (spec-pack) |
| event_type | VARCHAR | NO | PARSE_STARTED \| PARSE_COMPLETED \| PARSE_FAILED \| PARSE_WARNING |
| result | VARCHAR | YES | SUCCESS \| PARTIAL \| FAILED |
| summary | TEXT | YES | Event summary (e.g., "Spec-pack parsed: PARTIAL") |
| metadata | JSONB | NO | JSON object containing additional details |
| event_timestamp | TIMESTAMPTZ | NO | Time the event occurred |
| source_type | VARCHAR | YES | SPEC_PACK_PARSE (source type of the event) |
| source_ref_id | VARCHAR | YES | Reference ID (artifact_snapshot_id) |
| created_at | TIMESTAMPTZ | NO | Time the record was created |
| created_by | VARCHAR | NO | SYSTEM |
| updated_at | TIMESTAMPTZ | NO | Time of last update |
| updated_by | VARCHAR | NO | SYSTEM |

**Example data:**
```
evidence_event_id: aa0e8400-e29b-41d4-a716-446655440001
ticket_id: 550e8400-e29b-41d4-a716-446655440004
repository_id: 550e8400-e29b-41d4-a716-446655440003
artifact_snapshot_id: 550e8400-e29b-41d4-a716-446655440001
event_type: "PARSE_COMPLETED"
result: "PARTIAL"
summary: "Spec-pack parsed: PARTIAL"
metadata: {
  "parseStatus": "PARTIAL",
  "warnings": 2,
  "errors": 0,
  "ac_count": 18,
  "section_count": 41,
  "required_fields_missing": 0
}
event_timestamp: 2026-06-19T13:48:15+07:00
source_type: "SPEC_PACK_PARSE"
source_ref_id: "550e8400-e29b-41d4-a716-446655440001"
```

---

## Table 7: tbl_fact_data_quality

**Data Quality table** - stores metrics about parse quality (missing fields, errors, violations).

| Column | Type | Nullable | Meaning |
|-----|------|----------|---------|
| data_quality_id | UUID | NO | PK - unique quality record ID |
| connector_run_id | UUID | YES | FK - scan run ID |
| project_id | UUID | YES | FK - project |
| repository_id | UUID | YES | FK - repository |
| source_type | VARCHAR | NO | SPEC_PACK_PARSE (source type) |
| source_ref | VARCHAR | YES | Reference (artifact_snapshot_id or file path) |
| missing_count | INT | NO | Number of missing required fields |
| parse_error_count | INT | NO | Number of parse errors encountered |
| schema_violation_count | INT | NO | Number of schema rule violations |
| freshness_delay_minutes | INT | YES | Delay between latest commit and scan (minutes) |
| error_summary | TEXT | YES | Summary of errors (text joined with "; ") |
| checked_at | TIMESTAMPTZ | NO | Time the check was performed |
| created_at | TIMESTAMPTZ | NO | Time the record was created |
| created_by | VARCHAR | NO | SYSTEM |
| updated_at | TIMESTAMPTZ | NO | Time of last update |
| updated_by | VARCHAR | NO | SYSTEM |

**Example data:**
```
data_quality_id: bb0e8400-e29b-41d4-a716-446655440001
connector_run_id: 550e8400-e29b-41d4-a716-446655440002
repository_id: 550e8400-e29b-41d4-a716-446655440003
source_type: "SPEC_PACK_PARSE"
source_ref: "docs/changes/CUSTOMER/spec-pack.md"
missing_count: 0
parse_error_count: 0
schema_violation_count: 0
error_summary: null
checked_at: 2026-06-19T13:48:15+07:00
```

---

## When Is Data Stored?

| Table | Recorded When | Condition |
|-----|---------|-----------|
| tbl_fact_artifact_snapshot | Always when scanner scans | One row per artifact file |
| tbl_fact_acceptance_criteria | Parser completes successfully | One row per AC from the spec-pack |
| tbl_fact_artifact_parsed_section | Parser completes successfully | One row per found section |
| tbl_fact_decision | Parser extracts a Decision section | If none exists → do not write |
| tbl_fact_risk | Parser extracts a Risk section | If none exists → do not write |
| tbl_fact_evidence_event | After parse completes (or fails) | 1 event per parse run |
| tbl_fact_data_quality | When there are missing fields or errors | Write only if issues exist |

---

## End-to-End Example

**Scenario:** A PR is pushed → webhook triggers → scanner detects a new `docs/changes/CUSTOMER/spec-pack.md`

### Step 1: Snapshot is created
```sql
INSERT INTO tbl_fact_artifact_snapshot
VALUES (snap-id-001, run-001, repo-001, ticket-001, 'CUSTOMER', ..., 'FOUND')
```

### Step 2: Parser runs and extracts 18 ACs
```sql
INSERT INTO tbl_fact_acceptance_criteria
VALUES (ac-001, ticket-001, snap-id-001, 'AC-001', 'hash1', 'First acceptance criteria...', false, 'ACTIVE'),
       (ac-002, ticket-001, snap-id-001, 'AC-002', 'hash2', 'Second acceptance criteria...', false, 'ACTIVE'),
       ...
       (ac-018, ticket-001, snap-id-001, 'AC-018', 'hash18', '...', false, 'ACTIVE')
```

### Step 3: Parser extracts 41 sections
```sql
INSERT INTO tbl_fact_artifact_parsed_section
VALUES (sec-001, snap-id-001, ticket-001, 'SCOPE', 'scope', 'hash_scope', 'This covers...', true, true, true, null),
       (sec-002, snap-id-001, ticket-001, 'ARCHITECTURE', 'architecture', 'hash_arch', 'Architecture is...', true, true, true, null),
       ...
```

### Step 4: Parser records an event
```sql
INSERT INTO tbl_fact_evidence_event
VALUES (event-001, ticket-001, repo-001, snap-id-001, 'PARSE_COMPLETED', 'PARTIAL', 
        'Spec-pack parsed: PARTIAL', 
        '{"parseStatus":"PARTIAL","warnings":2,"errors":0,"ac_count":18,"section_count":41}',
        now(), 'SPEC_PACK_PARSE', 'snap-id-001')
```

### Step 5: Write quality metrics if issues exist
```sql
INSERT INTO tbl_fact_data_quality
VALUES (qual-001, run-001, proj-001, repo-001, 'SPEC_PACK_PARSE', 'docs/changes/CUSTOMER/spec-pack.md',
        0, 0, 0, null, null, now())
```

---

## Common Queries

**1. View all ACs for one ticket:**
```sql
SELECT ac_key, ac_summary, ambiguous_flag, status
FROM tbl_fact_acceptance_criteria
WHERE ticket_id = 'ticket-001'
ORDER BY ac_key;
```

**2. View parse event log for one snapshot:**
```sql
SELECT event_type, result, summary, metadata, event_timestamp
FROM tbl_fact_evidence_event
WHERE artifact_snapshot_id = 'snap-id-001'
ORDER BY event_timestamp DESC;
```

**3. View which sections are missing:**
```sql
SELECT section_type, section_key, required_flag, present_flag
FROM tbl_fact_artifact_parsed_section
WHERE artifact_snapshot_id = 'snap-id-001' AND required_flag = true AND present_flag = false;
```

**4. View data quality issues:**
```sql
SELECT source_ref, missing_count, parse_error_count, error_summary
FROM tbl_fact_data_quality
WHERE source_type = 'SPEC_PACK_PARSE' AND (missing_count > 0 OR parse_error_count > 0);
```

---

## Notes

- **Primary Key**: Each table has an automatically generated UUID PK
- **Timestamps**: Always store `created_at`, `updated_at` using UTC+7 (application level)
- **Idempotency**: `tbl_fact_acceptance_criteria` has a UNIQUE constraint `(ticket_id, ac_key)` → if the parser reruns with the same content hash, update instead of duplicate
- **Soft Delete**: Do not delete old records; only update `status` from ACTIVE → ARCHIVED if an AC no longer exists in the new parse
- **Audit Trail**: `created_by`, `updated_by` are always 'SYSTEM' in the parser flow; if manually edited, they may be another user