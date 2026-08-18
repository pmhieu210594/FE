# Database Design for `self-review.md` Parser

**Function**: `self-review.md` Parser  
**Input template**: legacy 11-section self-review template  
**Design principle**: follow `spec-pack.md` in parsing structure, but reuse the existing schema as much as possible; do not add new tables and do not add required columns in the MVP unless they are truly needed.

---

## 1. Design Goals

The `self-review.md` parser is a structured metadata parser. It does not store the full document as a document store for later re-reading; instead, it converts content into queryable data for inventory, traceability, quality, and downstream scoring.

This design must achieve four goals:

1. Parse against a fixed template, following the spirit of `spec-pack.md`.
2. Clearly separate the file-level snapshot layer from the section-detail layer.
3. Reuse existing tables as much as possible.
4. If an important section is missing, downgrade the parse status, but do not break the entire pipeline if only an extended section is missing.

---

## 2. Parsing Rules Similar to `spec-pack.md`

### 2.1 Legacy 11-section template

1. Implementation Summary  
2. Specification/AC Matching  
3. List of Changed Files  
4. Run Commands and Results  
5. Self-Check using Review Checklist  
6. Test Plan Corresponding Status  
7. Bugs Found and Resolved  
8. Unprocessed / Pending / Accepted Risk  
9. AI-generated predictions  
10. Items reviewed by humans  
11. Final Self-Verdict

### 2.2 Required level

To make the parser strict like `spec-pack.md`, split the sections into three groups:

| Group | Section | Meaning |
|---|---|---|
| **Required** | 1, 2, 4, 5, 6, 8, 11 | The core evidence needed for the system to understand what was done, what was checked, what risks remain, and what the final verdict is |
| **Recommended** | 3, 7 | Very useful for traceability and bug analytics, but should not hard-fail if absent |
| **Extended** | 9, 10 | Used to increase the value of AI and human review analysis; missing sections should only trigger warnings |

### 2.3 Parse status rules

- **COMPLETE**: all required sections are present and contain valid data.
- **PARTIAL**: one or more required sections are missing, but the file can still be partially parsed.
- **FAILED**: the template cannot be recognized, the ticket cannot be identified, or the file is empty / severely malformed.

---

## 3. Storage Principles

### 3.1 `tbl_fact_artifact_snapshot` is only the file-level snapshot layer

The snapshot table is not the place to store the entire parser output. It should only keep file-level information and the high-level parse result, for example:

- `ticket_id`
- `repository_id`
- `artifact_type_id`
- `phase_id`
- `source_path`
- `content_hash`
- `schema_version`
- `schema_valid`
- `template_empty_flag`
- `parse_status`
- `artifact_status`
- `warning_count`
- `error_count`
- `required_fields_missing`
- short `parsed_summary`
- `privacy_classification`
- `contains_customer_data`
- `contains_personal_data`
- `contains_secret_detected`
- `collected_at`
- `parser_version`
- `connector_run_id`

**Do not** put the full text of each section into the snapshot. If detailed data is needed, it must go into the section/detail tables below.

### 3.2 `parsed_summary` should be short

If `parsed_summary` already exists in the schema, it should only be a short JSONB summary, for example:

- number of recognized sections
- number of missing required sections
- number of command records
- number of AC rows
- final verdict
- warning/error count
- whether human review exists
- whether pending risk exists

`parsed_summary` is **not** the place to store the details of every command, every bug, or every risk item.

### 3.3 Detailed data must go into normalized tables

The detail layer should go through:

- `tbl_fact_artifact_parsed_section`
- `tbl_fact_evidence_event`
- `tbl_fact_data_quality`
- `tbl_fact_traceability_link`
- `tbl_fact_acceptance_criteria` (only for joining the AC master already used by `spec-pack.md`)
- downstream tables such as coverage / score / exception if the business needs them

---

## 4. Existing Tables Used by the `self-review.md` Parser

### 4.1 `tbl_source_connector`
Used to identify the connector/job that parses `self-review.md`.

**Reason**: we need to know which source the parser ran from and with what configuration.

### 4.2 `tbl_connector_run`
Used to store each parse run.

**Reason**: supports rerun, retry, idempotency, and runtime audit.

### 4.3 `tbl_dim_repository`
Links the `self-review.md` file to the corresponding repository.

**Reason**: the repository is the root scope of the artifact.

### 4.4 `tbl_dim_ticket`
Links `self-review.md` to the corresponding ticket.

**Reason**: the ticket is the primary business key for traceability and dashboards.

### 4.5 `tbl_dim_phase`
Maps the artifact to the corresponding SDD phase.

**Reason**: self-review usually belongs to the review / verify phase, but the value should still come from the existing seed data.

### 4.6 `tbl_dim_artifact_type`
Uses artifact type `SELF_REVIEW`.

**Reason**: to keep inventory and rule lookup consistent.

### 4.7 `tbl_artifact_required_field_rule`
Used to seed the sections and their required levels.

**Reason**: the parser needs to know which sections are core and which are extended.

### 4.8 `tbl_fact_artifact_snapshot`
The file-level snapshot table described above.

### 4.9 `tbl_fact_artifact_parsed_section`
Stores section-level parse results.

### 4.10 `tbl_fact_acceptance_criteria`
Shared AC master used with `spec-pack.md`.

### 4.11 `tbl_fact_evidence_event`
Stores parse events, warnings, partial parses, failed parses, and human confirmations.

### 4.12 `tbl_fact_data_quality`
Stores parse errors, missing sections, and schema violations.

### 4.13 `tbl_fact_traceability_link`
Stores strong links such as PRs, CI runs, test runs, commit hashes, and report paths.

### 4.14 `tbl_fact_ac_test_coverage`
Downstream engine used to calculate coverage from section 6.

### 4.15 `tbl_fact_evidence_quality_score`
Downstream engine used to calculate scores from snapshot + section data.

---

## 5. Mapping the 11 Sections to Storage

### 5.1 Section 1 - Implementation Summary

**Data to extract**
- summary of what was done
- main change scope
- related module / file / area

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_artifact_snapshot.parsed_summary`

**Storage level**
- short summary + section hash

---

### 5.2 Section 2 - Specification/AC Matching

**Data to extract**
- AC ID
- status
- evidence
- degree of match with the spec

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_artifact_snapshot.parsed_summary`
- join with `tbl_fact_acceptance_criteria`

**Notes**
- self-review does **not** create new AC master records
- if an AC key does not exist in the AC master, emit a warning

---

### 5.3 Section 3 - List of Changed Files

**Data to extract**
- file path
- change summary
- reason

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_artifact_snapshot.parsed_summary`

**Storage level**
- MVP stores it as summary / row-group
- no separate file-detail table is needed yet

---

### 5.4 Section 4 - Run Commands and Results

**Data to extract**
- command
- result
- note

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_artifact_snapshot.parsed_summary`
- `tbl_fact_evidence_event` if command evidence events need to be recorded

**Storage level**
- summary + normalized row-group

---

### 5.5 Section 5 - Self-Check using Review Checklist

**Data to extract**
- checklist area
- result
- note

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_artifact_snapshot.parsed_summary`

**Storage level**
- summary + checklist status

---

### 5.6 Section 6 - Test Plan Corresponding Status

**Data to extract**
- test plan status
- which ACs have tests
- which ACs are still untested
- links to test results / CI if available

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_traceability_link` (if the link is strong)
- `tbl_fact_ac_test_coverage` (downstream)

**Notes**
- the parser only provides evidence
- the coverage engine is what calculates the coverage percentage

---

### 5.7 Section 7 - Bugs Found and Resolved

**Data to extract**
- bug
- cause
- fix
- test

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_artifact_snapshot.parsed_summary`

**Storage level**
- summary + row-group
- no separate bug entity is needed in the MVP

---

### 5.8 Section 8 - Unprocessed / Pending / Accepted Risk

**Data to extract**
- item
- reason
- impact
- owner
- deadline

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_artifact_snapshot.parsed_summary`
- can be promoted to `tbl_fact_exception` downstream if this is a formally approved exception

**Notes**
- pending risk is not necessarily an exception
- only move it to exception when there is explicit approval / exception workflow

---

### 5.9 Section 9 - AI-generated predictions

**Data to extract**
- AI prediction
- prediction type
- confidence level, if available

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_artifact_snapshot.parsed_summary`

**Storage level**
- short summary

---

### 5.10 Section 10 - Items reviewed by humans

**Data to extract**
- item reviewed by a human
- reviewer / status / note, if available
- whether it was confirmed

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_evidence_event` if a human confirmation event needs to be recorded

**Storage level**
- short summary + event trace

---

### 5.11 Section 11 - Final Self-Verdict

**Data to extract**
- PASS / NEEDS_UPDATE / BLOCKED
- reason, if available
- final verdict

**Where to store it**
- `tbl_fact_artifact_parsed_section`
- `tbl_fact_artifact_snapshot.parsed_summary`

**Storage level**
- snapshot summary + section result

---

## 6. Recommended Standard Parser Output

The parser should normalize output into the following groups of fields:

| Group | Fields |
|---|---|
| Identification | `ticket_id`, `repository_id`, `artifact_type_id`, `phase_id` |
| File | `source_path`, `content_hash`, `schema_version`, `parser_version` |
| Status | `schema_valid`, `template_empty_flag`, `parse_status`, `artifact_status` |
| Quality | `required_fields_missing`, `warning_count`, `error_count` |
| Security | `privacy_classification`, `contains_customer_data`, `contains_personal_data`, `contains_secret_detected` |
| Summary | `parsed_summary` (short JSONB) |
| Trace | `connector_run_id`, `collected_at`, `source_updated_at` |

---

## 7. Validation Rules

### 7.1 Mandatory rules

1. If `Ticket ID` cannot be identified, emit a warning or fail.
2. If any required section is missing, set `parse_status = PARTIAL`.
3. If the template cannot be recognized or the file is empty, set `parse_status = FAILED`.
4. If an AC ID in section 2 does not exist in the AC master, emit a warning.
5. If the file changes but `content_hash` does not change, do not create a new snapshot.

### 7.2 Recommended rules

1. Normalize `PASS / NEEDS_UPDATE / BLOCKED` into an enum.
2. Table sections should be normalized into row-groups in the section table.
3. Pending risk should only become a downstream exception when there is explicit approval.

---

## 8. Do We Need New Tables or Columns in the Future?

### 8.1 Not needed for the MVP
If the goal is only:
- inventory
- section parsing
- basic traceability
- data quality
- score input

then **no new tables and no required new columns are needed**.

### 8.2 Consider expansion only when SQL-level detail is needed
For example:
- query each command row
- query each checklist item
- query each bug row
- query each risk row

Only then should schema expansion be considered.

### 8.3 Why the schema should stay small
Adding tables/columns too early will make:
- ETL heavier
- the parser more complex
- maintenance harder
- the MVP slower

---

## 9. Conclusion

The database design for the `self-review.md` parser should follow the same spirit as `spec-pack.md`:

- **1 file → 1 main snapshot**
- **section details → normalized tables behind it**
- **shared AC master**
- **events / quality / traceability / score are downstream**
- **no new tables and no required new columns in the MVP**

The most important point is that **`tbl_fact_artifact_snapshot` should only store the file-level snapshot and a short summary**, while detailed data must go through `tbl_fact_artifact_parsed_section` and the normalized tables behind it.