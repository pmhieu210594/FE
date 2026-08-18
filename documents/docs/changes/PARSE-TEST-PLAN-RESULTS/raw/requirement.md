# Requirement — Parser `test-plan.md` / `test-results.md` MVP

**Ticket ID**: `PARSE-TEST-PLAN-RESULTS`  
**Feature name**: Parser `test-plan.md` / `test-results.md`  
**Goal**: Parse the two test documents of each ticket, persist the parsed snapshot immediately, and allow viewing them as a paired artifact set for the same ticket.

## 1. Purpose

This feature enables the system to:

1. Read `docs/changes/{{TICKET}}/test-plan.md` and `docs/changes/{{TICKET}}/test-results.md`.
2. Extract the fields defined by each template.
3. Persist parsed snapshots into the platform’s shared database.
4. Allow independent viewing of each file and paired viewing for the same ticket.
5. Detect missing sections, placeholders, invalid structure, or unclear AC/test mapping.
6. Record parse status so reviewers know which file is complete and which needs fixes.

This parser does **not** depend on CI. CI does not decide whether parsing is saved to the DB.

## 2. PoC Scope

### In Scope
- Parse `test-plan.md`
- Parse `test-results.md`
- Persist snapshot immediately after parsing
- Store fields/sections according to the standard template
- Store source path, source hash, parser version, and parse status
- Display parse result list and parse detail
- Display the two files as a pair for the same ticket

### Out of Scope
- Parse other artifacts such as `spec-pack.md` or `impl-plan.md`
- Generate test code automatically
- Execute CI / gate / rollback logic
- Store full raw markdown in the DB
- Store secrets, tokens, passwords, or private keys
- Store full raw test runner logs

## 3. Input

- `docs/changes/{{TICKET}}/test-plan.md`
- `docs/changes/{{TICKET}}/test-results.md`
- `docs/changes/{{TICKET}}/spec-pack.md` for AC reference if needed
- `docs/changes/{{TICKET}}/context.md` if implementation context is needed
- `docs/standards/testing.md`

## 4. Output

Each parsed file returns:

- ticket ID
- artifact type (`TEST_PLAN` or `TEST_RESULTS`)
- source path
- source hash
- parse status
- parsed summary JSON
- extracted sections / fields
- parse error summary if any

## 5. Functional Requirements

### FR-1 Parse `test-plan.md`
The system must read the target ticket’s `test-plan.md`.

### FR-2 Parse `test-results.md`
The system must read the target ticket’s `test-results.md`.

### FR-3 Extract fields by template
The system must extract the fields defined by each template.

### FR-4 Persist snapshot immediately after parse
The system must save the snapshot immediately after parsing completes. No separate official parse step is required.

### FR-5 Pair view support
The system must allow the UI to view `test-plan.md` and `test-results.md` as a pair for the same ticket.

### FR-6 Parse status
The system must record parse status for each file:

- `SUCCESS`
- `PARTIAL`
- `NOT_FOUND`
- `PARSE_ERROR`

### FR-7 Detect missing sections / placeholders
If the file is missing sections, contains placeholders, or has invalid structure, the system must mark that in the snapshot.

### FR-8 Idempotency
If the same file with the same hash is parsed again, the system must update the existing snapshot instead of creating duplicates.

### FR-9 Data safety
The system must not store the full raw markdown or unnecessary sensitive data beyond what is needed for snapshot and audit.

## 6. Acceptance Criteria

- AC-1: The system can parse `test-plan.md`.
- AC-2: The system can parse `test-results.md`.
- AC-3: The system stores a snapshot immediately after parsing.
- AC-4: The system extracts the correct fields for `test-plan.md`.
- AC-5: The system extracts the correct fields for `test-results.md`.
- AC-6: The system allows both files to be viewed as a pair for the same ticket.
- AC-7: The system correctly marks missing sections / placeholders / invalid structure.
- AC-8: Re-parsing the same file does not create duplicate records.
- AC-9: The system does not store full raw markdown or sensitive data.

## 7. Field Set to Extract

### 7.1 `test-plan.md`
- `purpose`
- `ac_matrix_test_type`
- `priority`
- `reuse_existing_test`
- `additional_test_this_time`
- `e2e_step_by_step_scenarios`
- `areas_intentionally_left_untested_this_time`
- `data_testing_principles`
- `execution_command`
- `stop_condition`
- `required_human_decision`

### 7.2 `test-results.md`
- `execution_environment`
- `executed_command`
- `summary_of_results`
- `list_of_passes`
- `list_of_fails`
- `bugs_fixed`
- `not_yet_fixed_pending`
- `test_cannot_be_executed_and_reason`
- `remaining_risk`
- `final_test_verdict`

## 8. Non-goals for PoC
- No draft/official split
- No CI dependency for snapshot persistence
- No code generation
- No complex dashboard for multiple artifacts at once

## 9. Open Questions
- Should `tbl_connector_run` be stored for each parser execution, or is snapshot-only enough?
- Should `template_empty_flag` be shown separately, or is parse status enough?
- Should `priority` in `test-plan.md` be normalized into an internal enum or kept as source text?
