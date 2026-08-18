# Database Design - Parser `spec-pack.md`

**Function**: Parser `spec-pack.md`  
**Goal**: Maximize reuse of the current schema; do not add new tables in MVP; use only configuration / seed / JSONB / existing columns.  
**Principles**: reuse-first, metadata-first, no raw content store, idempotent, able to parse both the standard file and lightly deviated formats.

---

## 1. Design Goals

The `spec-pack.md` parser is responsible for reading a specification file that follows the standard template and normalizing the data into:

- artifact snapshot
- parsed sections
- acceptance criteria list
- human decision items
- assumptions / inferences
- open issues
- parse warnings / data quality issues
- evidence events for each parse run

The database design must support 3 groups of screens / logic:

1. **Ticket Evidence Detail**: quickly check whether the spec-pack file is complete.
2. **AC / Traceability / Score**: use structured data to support downstream functions.
3. **Data Ops / Quality**: know where the parser failed, why it failed, and support idempotent re-runs.

---

## 2. Design Conclusion

### 2.1 Do we need new tables?

**No new tables are needed in v1.**

Reasons:

- `tbl_fact_artifact_snapshot` already has enough fields to store parse results at the artifact level.
- `tbl_fact_artifact_parsed_section` is sufficient to store each parsed section of the spec-pack.
- `tbl_fact_acceptance_criteria` is sufficient to store each AC.
- `tbl_fact_decision`, `tbl_fact_risk`, `tbl_fact_evidence_event`, and `tbl_fact_data_quality` are sufficient to store decision / issue / event / parse error data.
- `tbl_artifact_required_field_rule` is sufficient to configure rules / scoring for the spec-pack.

### 2.2 Do we need new mandatory columns?

**No mandatory new columns are needed in v1.**

The current columns are enough to run the parser at MVP level. If later we need more detailed reporting by line or by Markdown table row, we can extend via JSONB in `parsed_summary` / `section_summary` / `ac_summary` instead of creating new tables.

---

## 3. Principles for Using the Current Schema

| Principle | Application |
|---|---|
| Reuse first | Prefer existing tables in V4/V160/V181. |
| Metadata only | Do not store raw prompt/chat/source code; store only metadata, hash, summary, and line pointers. |
| Idempotent | Re-parsing the same file / same hash must not create duplicate records. |
| Section-level trace | Store section-level parse results in `tbl_fact_artifact_parsed_section`. |
| AC-level trace | Store each AC in `tbl_fact_acceptance_criteria`. |
| Quality-first | Parse errors must go into `tbl_fact_data_quality` and `tbl_fact_evidence_event`. |
| Downstream-friendly | Output must be sufficient to feed score, traceability, and dashboard layers. |

---

## 4. Existing Tables Used

### 4.1 `tbl_source_connector`

| Item | Content |
|---|---|
| Role | Defines the connector / job that runs the parser. |
| Usage | Seed connector types for the parser, for example `ARTIFACT_SCANNER` or `MARKDOWN_PARSER` if the system separates the runner. |
| Schema change? | No. |
| Reason | This table is already enough to identify the connector and its runtime configuration. |

> Recommendation: if the parser runs in the same flow as the Artifact Scanner, just use `ARTIFACT_SCANNER`. If operational separation is desired, add a **data seed** `MARKDOWN_PARSER`; no new table is needed.

### 4.2 `tbl_connector_run`

| Item | Content |
|---|---|
| Role | Stores one parser run. |
| Usage | Record `RUNNING/SUCCESS/FAILED`, `records_read`, `records_written`, `error_message`, `trace_id`. |
| Schema change? | No. |
| Reason | Enough to track parse lifecycle and re-runs. |

### 4.3 `tbl_dim_repository`

| Item | Content |
|---|---|
| Role | Identifies the repository being parsed. |
| Usage | `repository_id` is the main scoping key for the parser. |
| Schema change? | No. |
| Reason | The parser needs repository scope to support multi-repo use cases. |

### 4.4 `tbl_dim_ticket`

| Item | Content |
|---|---|
| Role | Links the spec-pack to a ticket. |
| Usage | `ticket_id` is inferred from `docs/changes/<TICKET>/spec-pack.md`. |
| Schema change? | No. |
| Reason | This is the central link key for traceability and dashboards. |

### 4.5 `tbl_dim_phase`

| Item | Content |
|---|---|
| Role | Classifies the artifact phase. |
| Usage | `SPEC_PACK` belongs to phase 1 in the SDD flow. |
| Schema change? | No. |
| Reason | The parser only reads and normalizes; it does not manage phase logic. |

### 4.6 `tbl_dim_artifact_type`

| Item | Content |
|---|---|
| Role | Artifact type master. |
| Usage | Identifies `SPEC_PACK`, default file name `spec-pack.md`, phase mapping, and required flag. |
| Schema change? | No. |
| Reason | This table is enough as the basis for inventory / parser rules. |

### 4.7 `tbl_artifact_required_field_rule`

| Item | Content |
|---|---|
| Role | Configures required fields/sections and scoring weights. |
| Usage | Stores rules for all spec-pack sections; used for validation and quality scoring. |
| Schema change? | No. |
| Reason | This table fits the role of the parser's rule engine. |

### 4.8 `tbl_fact_artifact_snapshot`

| Item | Content |
|---|---|
| Role | Main table storing scan/parse results for the spec-pack file. |
| Usage | Store `ticket_id`, `repository_id`, `artifact_type_id`, `source_path`, `content_hash`, `schema_version`, `schema_valid`, `template_empty_flag`, `required_fields_missing`, `parsed_summary`, `parser_version`, `connector_run_id`. |
| Schema change? | No. |
| Reason | Existing JSONB fields are enough to keep structured output at the artifact level. |

### 4.9 `tbl_fact_artifact_parsed_section`

| Item | Content |
|---|---|
| Role | Stores each parsed section/subsection. |
| Usage | Each spec-pack section creates one row: Context/Purpose, Scope, As-Is, To-Be, Input, Output, Error, Boundary, Non-functional, Examples, Human Decision Required, Assumptions, Open Issues... |
| Schema change? | Not required. |
| Reason | Existing fields (`section_type`, `section_key`, `section_summary`, `required_flag`, `present_flag`, `valid_flag`, `parse_warning`) are enough for MVP. |

### 4.10 `tbl_fact_acceptance_criteria`

| Item | Content |
|---|---|
| Role | Stores each AC in the spec-pack. |
| Usage | 1 row = 1 AC; `ac_key` follows the standard format `AC-<TICKET>-n`. |
| Schema change? | Not required. |
| Reason | Existing columns are enough to store AC key, hash, and summary; `ambiguous_flag` helps identify unclear ACs. |

### 4.11 `tbl_fact_decision`

| Item | Content |
|---|---|
| Role | Stores items from the Human Decision Required section. |
| Usage | `decision_key`, `decision_summary`, `reason_present`, `impact_summary`, `decided_by_role_id`. |
| Schema change? | No. |
| Reason | Human decisions have their own lifecycle and already have a dedicated table. |

### 4.12 `tbl_fact_risk`

| Item | Content |
|---|---|
| Role | Stores risks / open issues with impact. |
| Usage | Used to materialize open issues when the issue has a clear impact or needs dashboard tracking. |
| Schema change? | No. |
| Reason | This table already has `risk_key`, `risk_summary`, `severity`, `mitigation_present`, `status`, `resolved_at`. |

### 4.13 `tbl_fact_evidence_event`

| Item | Content |
|---|---|
| Role | Stores parser events. |
| Usage | `PARSE_STARTED`, `PARSE_SECTION_EXTRACTED`, `PARSE_AC_EXTRACTED`, `PARSE_COMPLETED`, `PARSE_FAILED`, `PARSE_WARNING`. |
| Schema change? | No. |
| Reason | Enables audit and debugging without a separate log table. |

### 4.14 `tbl_fact_data_quality`

| Item | Content |
|---|---|
| Role | Stores parse quality and parse errors. |
| Usage | Record `missing_count`, `parse_error_count`, `schema_violation_count`, `freshness_delay_minutes`, `error_summary`. |
| Schema change? | No. |
| Reason | Enough for Data Ops dashboards and error statistics by connector run. |

### 4.15 `tbl_fact_traceability_link`

| Item | Content |
|---|---|
| Role | Stores links extracted from the spec-pack. |
| Usage | Create links from the ticket/spec-pack to source refs (ticket, PR, doc, contract, issue, source availability item). |
| Schema change? | No. |
| Reason | Used to support the Traceability Map; no separate parser table is needed. |

### 4.16 Downstream tables (not written directly by the parser)

| Table | Role |
|---|---|
| `tbl_fact_evidence_quality_score` | Score engine uses parser output to calculate the score. The parser does not write to it directly in v1. |
| `tbl_fact_metric_value` | Metric layer aggregates score / coverage / quality. |
| `tbl_fact_data_lineage` | Lineage for parse and metric jobs. |

---

## 5. Mapping `spec-pack.md` Sections to the Current DB

### 5.1 Snapshot-level output

`tbl_fact_artifact_snapshot.parsed_summary` should store a normalized high-level JSON object including:

- file information
- ticket_id
- schema_version
- parser_version
- parsed sections
- list of ACs
- decisions
- risks / open issues
- warnings / errors

### 5.2 Section-level output

`tbl_fact_artifact_parsed_section` should store the following sections as rows:

- `CONTEXT_PURPOSE`
- `SCOPE`
- `SCOPE_WITHIN`
- `SCOPE_OUT_OF_RANGE`
- `TERMINOLOGY`
- `AS_IS`
- `TO_BE`
- `BUSINESS_RULES`
- `INPUT`
- `OUTPUT`
- `ERROR_EXCEPTION`
- `BOUNDARY_VALUE`
- `NON_FUNCTIONAL`
- `EXAMPLES_NORMAL`
- `EXAMPLES_ERROR`
- `EXAMPLES_BOUNDARY`
- `SOURCE_AVAILABILITY_SUMMARY`
- `COMPLEXITY_CLASSIFICATION`
- `FE_BE_CONTRACT_IMPACT`
- `DB_MIGRATION_IMPACT`
- `SECURITY_PRIVACY_IMPACT`
- `OPERATION_MAINTENANCE_IMPACT`
- `TEST_STRATEGY_SUMMARY`
- `HUMAN_DECISION_REQUIRED`
- `ASSUMPTIONS_INFERENCE_LOG`
- `OPEN_ISSUES`

### 5.3 AC-level output

`tbl_fact_acceptance_criteria` stores each AC with the following rules:

- `ac_key = AC-<TICKET>-n`
- `ambiguous_flag = true` if the AC lacks testable criteria or is described ambiguously
- `status = ACTIVE` for ACs that are still valid
- `ac_summary` contains a short interpretation, and long raw text should not be stored if not needed

### 5.4 Decision / Risk / Issue mapping

- Human Decision Required -> `tbl_fact_decision`
- Open Issues -> prefer `tbl_fact_risk` if the issue has impact or needs dashboard tracking
- Assumptions and Inference Log -> storing it in `parsed_summary` and `tbl_fact_artifact_parsed_section` is enough

---

## 6. Required Seed / Configuration

### 6.1 `tbl_dim_artifact_type`

Make sure there is an artifact type for:

- `SPEC_PACK`

### 6.2 `tbl_artifact_required_field_rule`

Add a rule set for `SPEC_PACK` to reflect the new template. The current system already has rules for AC / Scope / Non-scope / Risk / Open Issues; for the spec-pack parser, expand with the following fields:

| field_code | section_type | Purpose |
|---|---|---|
| CONTEXT_PURPOSE | CONTEXT_PURPOSE | Context / purpose |
| TERMINOLOGY | TERMINOLOGY | Glossary |
| AS_IS | AS_IS | Current state |
| TO_BE | TO_BE | Desired state |
| BUSINESS_RULES | BUSINESS_RULES | Business rules |
| INPUT | INPUT | Input |
| OUTPUT | OUTPUT | Output |
| ERROR_EXCEPTION | ERROR_EXCEPTION | Errors / exceptions |
| BOUNDARY_VALUE | BOUNDARY_VALUE | Boundary conditions |
| NON_FUNCTIONAL | NON_FUNCTIONAL | Non-functional requirements |
| EXAMPLES | EXAMPLES | Examples |
| SOURCE_AVAILABILITY_SUMMARY | SOURCE_AVAILABILITY_SUMMARY | Source availability |
| COMPLEXITY_CLASSIFICATION | COMPLEXITY_CLASSIFICATION | Complexity classification |
| FE_BE_CONTRACT_IMPACT | FE_BE_CONTRACT_IMPACT | FE/BE impact |
| DB_MIGRATION_IMPACT | DB_MIGRATION_IMPACT | DB impact |
| SECURITY_PRIVACY_IMPACT | SECURITY_PRIVACY_IMPACT | Security / privacy impact |
| OPERATION_MAINTENANCE_IMPACT | OPERATION_MAINTENANCE_IMPACT | Operations impact |
| TEST_STRATEGY_SUMMARY | TEST_STRATEGY_SUMMARY | Test strategy |
| HUMAN_DECISION_REQUIRED | HUMAN_DECISION_REQUIRED | Human decision |
| ASSUMPTIONS_INFERENCE_LOG | ASSUMPTIONS_INFERENCE_LOG | Assumptions / inferences |
| OPEN_ISSUES | OPEN_ISSUES | Open issues |
| AC | AC | Acceptance Criteria |

> Note: this is **data seed**, not a schema change.

---

## 7. Data Write Flow

### 7.1 When parsing starts

1. Create / obtain `tbl_connector_run`.
2. Write `PARSE_STARTED` to `tbl_fact_evidence_event`.
3. Create / refresh `tbl_fact_artifact_snapshot` for the `spec-pack.md` file.

### 7.2 When parsing succeeds

1. Update `tbl_fact_artifact_snapshot`:
   - `schema_valid = true`
   - `template_empty_flag` based on the template empty check result
   - `required_fields_missing` based on the rule engine
   - `parsed_summary` containing normalized JSON output
2. Insert multiple rows into `tbl_fact_artifact_parsed_section`.
3. Insert multiple rows into `tbl_fact_acceptance_criteria`.
4. Insert `tbl_fact_decision` rows for Human Decision Required.
5. Insert `tbl_fact_risk` rows for risks / open issues that must be tracked.
6. Insert `PARSE_COMPLETED` into `tbl_fact_evidence_event`.

### 7.3 When parsing fails

1. Update `tbl_fact_artifact_snapshot`:
   - `schema_valid = false`
   - `required_fields_missing` records the missing parts
   - `parsed_summary` records the aggregated parse error
2. Insert into `tbl_fact_data_quality`.
3. Insert `PARSE_FAILED` into `tbl_fact_evidence_event`.
4. Keep idempotency: the same `content_hash` must not create duplicate records.

---

## 8. Index / Performance

### 8.1 Existing indexes are enough

The current indexes are already good enough for the parser in MVP:

- `idx_artifact_ticket` on `tbl_fact_artifact_snapshot(ticket_id)`
- `idx_artifact_repo_path` on `tbl_fact_artifact_snapshot(repository_id, source_path)`
- `idx_artifact_type` on `tbl_fact_artifact_snapshot(artifact_type_id)`
- `idx_artifact_collected_at` on `tbl_fact_artifact_snapshot(collected_at DESC)`
- `idx_artifact_parsed_ticket_type` on `tbl_fact_artifact_parsed_section(ticket_id, section_type)`
- `idx_ac_ticket` on `tbl_fact_acceptance_criteria(ticket_id, ac_key)`
- `idx_data_quality_repo_time` on `tbl_fact_data_quality(repository_id, checked_at DESC)`

### 8.2 When should new indexes be considered?

Only consider adding indexes later if we need deep queries by:

- `artifact_snapshot_id + section_key`
- `artifact_snapshot_id + ac_key`
- `connector_run_id + parse_status`

In v1, this is not needed yet.

---

## 9. Why No New Tables

No new tables are needed because:

1. The current schema already has artifact snapshot, parsed section, AC, decision, risk, event, and data quality tables.
2. The parser only normalizes data; it does not need a dedicated parser entity.
3. Adding tables would increase complexity, migration cost, and test surface without proportional MVP value.
4. `spec-pack.md` is a clearly structured artifact and fits the existing snapshot + section + AC + decision/risk model.

---

## 10. Conclusion

The database design for the `spec-pack.md` parser in v1 should follow this direction:

- **0 new tables**
- **0 new mandatory columns**
- **100% reuse of the current schema**
- **add rule data seeds for `SPEC_PACK`**
- **use the existing JSONB fields to keep structured output**

This approach is enough for an MVP parser, enough to power Evidence Inventory / Traceability / AC-Test Coverage / Evidence Quality Score, and does not break the current DB architecture.