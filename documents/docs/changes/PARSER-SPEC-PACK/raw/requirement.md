# Requirement — `spec-pack.md` Parser

## 0. Ticket Information

| Item | Content |
|---|---|
| Ticket | SPEC-PACK-PARSER |
| Feature name | `spec-pack.md` Parser |
| Purpose | Extract structured data from `spec-pack.md` to support Artifact Inventory, Evidence Quality Score, AC-Test Coverage, Traceability Map, and data quality control |
| Primary users | Backend / Data Ops / QA / PM |
| Access rights | People who can configure the ingest pipeline, parser, or operate Data Ops |
| Main entities | `spec-pack.md`, `artifact_snapshot`, `artifact_parse_result`, `artifact_parse_error` |
| Related | Artifact Scanner, Evidence Quality Score, AC-Test Coverage, Traceability Map, Data Quality Dashboard |

## 1. Background / Purpose

Within the SDD Evidence Collection & Analysis system, `spec-pack.md` is the central specification file for each ticket. It contains context, objectives, scope, acceptance criteria, assumptions, risks, open issues, and other supporting information for development, review, and testing.

At present, the data in `spec-pack.md` is written using a fixed template, but there can still be small variations between tickets. Therefore, the system needs a dedicated parser to:

- read `spec-pack.md` according to the standard template,
- extract structured data,
- detect missing sections, empty sections, and unfinished placeholders,
- record parse errors and quality warnings,
- produce input for downstream features such as Evidence Quality Score, AC-Test Coverage, and Traceability Map.

This feature is not a general-purpose natural language analysis capability. It is a rule-based parser that prioritizes stability, repeatability, and auditability.

The operating flow is finalized as follows:
- GitHub webhook (push/PR update) is the trigger that lets the system know a file changed.
- `Artifact Scanner` and `Git/PR metadata collector` run first to determine which files changed and which files are missing.
- `spec-pack.md` is parsed in two states: `draft parse` when the file has just changed to detect format issues early, and `official parse` when PR + CI pass to finalize the official snapshot.
- If CI fails, only the draft result is kept; no KPI or official snapshot is finalized.
- If `spec-pack.md` does not exist in the PR, the system records a missing artifact instead of attempting to parse further.

## 2. Scope

### 2.1 In Scope

| Group | Content |
|---|---|
| File reading | Read `spec-pack.md` from `docs/changes/<TICKET>/` |
| File identification | Determine the ticket ID from the path or from front matter/header if present |
| Front matter | Prefer YAML front matter if the file has it |
| Section parsing | Extract the main sections in the spec-pack template |
| Table parsing | Extract tables in Acceptance Criteria, Human Decision Required, Assumptions and Inference Log, Open Issues, Terminology, Input/Output/Error/Boundary/Non-functional |
| AC normalization | Detect AC lists, normalize AC codes, count the number of ACs |
| Placeholder detection | Detect `---`, `<...>`, `TBD`, `TODO`, `N/A`, or empty content in required fields |
| Warning / error | Record warnings when sections are missing, fields are missing, or the format is non-standard; record errors when the file structure is severely broken |
| Re-parse support | When the file changes, the parser can rerun without creating duplicate data |
| Draft parse | Analyze immediately after the file is created/edited to detect format issues, missing sections, non-standard ACs, and leftover placeholders |
| Official parse | Finalize the official snapshot only after PR + CI pass |
| Missing artifact handling | If `spec-pack.md` is not present in the PR, store a missing-file state instead of attempting to parse |
| Parse result output | Produce standardized JSON/records for DB storage and dashboard display |
| Audit / logging | Record parser runs, success/failure status, runtime, and errors |

### 2.2 Out of Scope

| Group | Content |
|---|---|
| Git metadata | Do not collect commit hash, branch, changed files, or author from Git (handled by a different collector) |
| PR metadata | Do not collect PR title, status, review state, or labels (handled by a different collector) |
| CI metadata | Do not collect workflow run, job, duration, or failure summary (handled by a different collector) |
| Test result parsing | Do not parse JUnit XML, coverage reports, or test runner logs |
| KPI calculation | Do not calculate Evidence Quality Score, AC-Test Coverage, or other KPIs |
| Traceability matching | Do not perform Ticket ↔ PR ↔ Commit ↔ CI matching |
| Security scan | Do not parse SAST/SCA/secret scan outputs |
| Deep semantic understanding | Do not infer requirements beyond the defined sections/tables |
| UI/Screen | Do not handle a dedicated UI screen for the parser |
| Raw source storage | Do not store raw source code, raw prompt, raw chat, or secrets |

> Note: This parser only processes `spec-pack.md` according to the standard template and near-standard variants. Other data-source collection features are handled by other collectors/parsers in the system.

## 3. Source of Truth / Related Sources

| ID | Source | Role |
|---|---|---|
| SRC-01 | The project’s standard `spec-pack.md` template | Primary basis for section and table structure |
| SRC-02 | The SDD Evidence Collection & Analysis foundation requirements document | Basis for the role of spec-pack in the system |
| SRC-03 | `Artifact Scanner` requirements | Basis for the `docs/changes/<TICKET>/` path and re-scan mechanism |
| SRC-04 | `Evidence Quality Score` requirements | Basis for the fields used in scoring |
| SRC-05 | `AC-Test Coverage` requirements | Basis for AC extraction and test mapping |
| SRC-06 | `Traceability Map` requirements | Basis for extracting traceability references |
| SRC-07 | Platform data quality / logging rules | Basis for parse errors, warnings, and audit |

## 4. As-Is / To-Be

### 4.1 As-Is

- `spec-pack.md` already exists as a Markdown file in each ticket.
- The current template is fairly clear, but reading it manually takes time and makes standardization difficult.
- The same type of information may be written slightly differently across tickets.
- Some sections may contain placeholders or remain empty during drafting.
- The system does not yet have a dedicated parser layer to reliably split sections and tables.
- There is no clear separation between **draft parse** and **official parse** based on GitHub / PR / CI events.

### 4.2 To-Be

- The parser reads `spec-pack.md` from the repository or from a file synced into the system.
- The parser extracts the main sections according to the standard template.
- The parser normalizes ACs, detects placeholders, and detects missing or invalid sections.
- The parser outputs structured records for DB storage and downstream screens.
- When the file changes, the parser can rerun idempotently and update only the new snapshot.
- The parser distinguishes draft results from the official snapshot.
- The official snapshot is finalized only when PR + CI pass.
- If `spec-pack.md` is missing from the PR, the system stores a missing artifact instead of attempting an official parse.

### 4.3 Processing Flow / Rule

#### 4.3.1 Standard operating flow

1. **PR/push/webhook from GitHub** triggers the system.
2. **Git/PR metadata collector** and **Artifact Scanner** run first to identify changed and missing files.
3. If the PR **does not contain `spec-pack.md`**:
   - store metadata as `missing artifact`,
   - create a warning/finding,
   - do not run official parse,
   - do not finalize KPI or official snapshot.
4. If `spec-pack.md` exists:
   - run **draft parse** immediately after the event to detect format issues, missing sections, non-standard ACs, and leftover placeholders;
   - draft parse is only for early warning and is not used to finalize KPI.
5. When **CI passes**:
   - switch to **official parse**,
   - store the normalized snapshot in the DB,
   - use this data for Traceability / AC-Test Coverage / Evidence Quality Score.
6. When **CI fails**:
   - keep only the draft result,
   - do not finalize the official snapshot,
   - do not calculate official KPI.
7. When the file changes again:
   - rerun the parser using the new content hash,
   - do not create a duplicate old record if the hash has not changed.

#### 4.3.2 Mandatory rules

- `spec-pack.md` is a mandatory artifact for the target ticket.
- The parser must prefer YAML front matter if the file has it.
- The parser must parse according to the standard template and tolerate minor heading variations.
- The official AC format is finalized as `AC-<TICKET>-<n>`, where `n` starts from `1` and increases continuously within the ticket scope; for example `AC-ABC-123-1`, `AC-ABC-123-2`.
- The `status` fields in `Human Decision Required` and `Open Issues` must be real values and must not remain long-term placeholders.
- Placeholders `---`, `<...>`, `TBD`, `TODO`, `N/A`, `-`, empty strings, or null values in required fields must be marked as incomplete.
- If a subsection is missing, the parser may warn; if the structure is severely broken, it must error.
- When CI fails, the parser keeps only the draft result and does not create an official snapshot or finalize KPI.
- The parser must be idempotent by `content_hash`.
- Official parse is finalized only when PR + CI pass; if CI fails, only the draft result is kept.

## 5. Terminology

| Term | Explanation |
|---|---|
| Spec Pack | The ticket-level specification document containing context, scope, ACs, risks, and related information |
| Section | A content block separated by a Markdown heading |
| Front matter | A YAML block at the top of a Markdown file, if present |
| Placeholder | A temporary value such as `---`, `TBD`, `<...>`, or empty content |
| AC | Acceptance Criteria |
| Parse result | The parser’s extracted output |
| Warning | A data-quality warning; the file may still be usable |
| Error | A parse error that makes the result unreliable or unusable |
| Snapshot | A parse result record at a specific point in time |

## 6. Current State Summary

- The `spec-pack.md` feature is currently written according to a standard template, but there is no dedicated parser to convert it into structured data.
- The main file sections are clearly named, but the actual contents may still contain placeholders during drafting.
- Completeness checks currently depend on manual reading or manual verification.
- Downstream features such as Evidence Quality Score, AC-Test Coverage, and Traceability Map need normalized data from this parser.
- There is no standard mechanism yet for counting ACs, detecting whether ACs are numbered, or identifying placeholders in important fields.

## 7. Target State Summary

- The parser reads `spec-pack.md` according to the project’s standard template.
- The parser extracts all required sections, tables, and supporting information.
- The parser produces normalized JSON including:
  - file metadata,
  - section content,
  - AC list,
  - human decision list,
  - assumptions/inferences,
  - open issues,
  - warnings/errors,
  - a basic completeness score.
- The parser supports front matter if present.
- The parser can rerun when the file changes without creating duplicate records.
- The parser provides sufficient data for scoring and traceability features downstream.

## 8. Change Requirements

| Section | Current State | Target State | Requirement | Keep / Change / New | Notes |
|---|---|---|---|---|---|
| File reader | No dedicated parser yet | Read `spec-pack.md` by standard path | Must identify the correct input file | New | Support runs by ticket or by batch |
| Event trigger | No clear rule yet | Accept only GitHub PR/push/webhook events | The system only knows a file changed when a GitHub event occurs | New | Local changes that are not pushed do not trigger the parser |
| Missing artifact handling | None | If the PR lacks `spec-pack.md`, store a missing state | Do not attempt parsing when the file does not exist | New | Create a warning/finding for Artifact Inventory |
| Front matter | No priority reader | If YAML front matter exists, read it first | Prefer structured data | New | Not required for every file in MVP |
| Section parser | Not standardized | Split the main template headings | Must read sections and subsections correctly | New | Tolerate minor heading variants |
| Table parser | None | Read tables in the file | Parse Markdown tables into records | New | Especially for AC, decisions, assumptions, open issues |
| Draft parse | None | Parse immediately after file creation/edit | Detect format issues, missing sections, non-standard ACs, leftover placeholders | New | Only for early warnings |
| Official parse | None | Finalize only after PR + CI pass | Write the normalized snapshot to the DB | New | Used for downstream KPI/traceability |
| AC normalization | None | Normalize AC codes | Count ACs and verify format | New | Detect ACs that are not numbered |
| Placeholder detection | None | Detect placeholders and empty content | Warn on unfinished fields | New | Do not treat placeholders as complete data |
| Error handling | Not standardized | Clear warnings/errors | Record reason, location, and severity | New | Supports the Data Quality dashboard |
| Snapshot output | None | Return normalized parse results | Can be stored in DB and displayed | New | Idempotent by content hash |
| Downstream data | None | Data sufficient for score/coverage/traceability | Provide required fields | New | Parser does not calculate KPIs itself |

## 9. Functional Requirements

### 9.1 PARSER-SPEC-001 — Read input file

| Item | Content |
|---|---|
| Requirement | The parser must read `spec-pack.md` from the standard path `docs/changes/<TICKET>/spec-pack.md` or from synced input |
| Priority | Must |
| Acceptance | When given a standard file, the parser identifies the correct ticket and reads the content |

### 9.2 PARSER-SPEC-002 — Identify ticket ID

| Item | Content |
|---|---|
| Requirement | The parser must identify `ticket_id` from the path, front matter, or the file header |
| Priority | Must |
| Acceptance | The parse result contains the correct `ticket_id` for the input file |

### 9.3 PARSER-SPEC-003 — Prefer front matter

| Item | Content |
|---|---|
| Requirement | If the file has YAML front matter, the parser must read it and prioritize values from it |
| Priority | Should |
| Acceptance | Fields such as `ticket_id`, `schema_version`, `artifact_type`, `created_at`, and `updated_at` are taken from front matter if present |

### 9.4 PARSER-SPEC-004 — Extract main sections

| Item | Content |
|---|---|
| Requirement | The parser must extract the main sections: Context/Purpose, Scope, Terminology, As-Is, To-Be, Detailed specification, Acceptance Criteria, Examples, Source Availability Summary, Complexity Classification, impact sections, Human Decision Required, Assumptions and Inference Log, Open Issues |
| Priority | Must |
| Acceptance | The parse result is clearly structured by section |

### 9.5 PARSER-SPEC-005 — Extract Terminology table

| Item | Content |
|---|---|
| Requirement | The parser must extract the Terminology table into a record list |
| Priority | Should |
| Acceptance | Each term row is split into `term`, `meaning`, and `notes` |

### 9.6 PARSER-SPEC-006 — Extract Scope

| Item | Content |
|---|---|
| Requirement | The parser must separate `In Scope` and `Out of Scope` |
| Priority | Must |
| Acceptance | The result contains two separate fields and does not mix them together |

### 9.7 PARSER-SPEC-007 — Extract Detailed specification

| Item | Content |
|---|---|
| Requirement | The parser must extract Business Rules, Input, Output, Error/Exception, Boundary Value, and Non-functional sections |
| Priority | Must |
| Acceptance | The Input/Output/Error/Boundary/Non-functional tables are converted into record lists |

### 9.8 PARSER-SPEC-008 — Extract Acceptance Criteria

| Item | Content |
|---|---|
| Requirement | The parser must extract the AC list from the Acceptance Criteria table |
| Priority | Must |
| Acceptance | Each AC has `acid`, `description`, `testable`, `notes`, and the parser can count the total number of ACs |

### 9.9 PARSER-SPEC-009 — Check AC format

| Item | Content |
|---|---|
| Requirement | The parser must check whether ACs follow the unified format |
| Priority | Must |
| Acceptance | If an AC does not match the standard pattern, the parser records a warning |

### 9.10 PARSER-SPEC-010 — Detect placeholders

| Item | Content |
|---|---|
| Requirement | The parser must detect placeholders such as `---`, `<...>`, `TBD`, `TODO`, and `N/A` in required fields |
| Priority | Must |
| Acceptance | Placeholder fields are marked incomplete and are not treated as complete data |

### 9.11 PARSER-SPEC-011 — Extract Human Decision Required

| Item | Content |
|---|---|
| Requirement | The parser must extract the Human Decision Required table and retain the columns ID, decision item, reasons, owner, and status |
| Priority | Must |
| Acceptance | Open decisions and the status of each decision can be identified |

### 9.12 PARSER-SPEC-012 — Extract Assumptions and Inference Log

| Item | Content |
|---|---|
| Requirement | The parser must extract the assumptions and inference table |
| Priority | Must |
| Acceptance | Assumptions, basis, risk, and confirmation needs can be distinguished |

### 9.13 PARSER-SPEC-013 — Extract Open Issues

| Item | Content |
|---|---|
| Requirement | The parser must extract the Open Issues table and retain the issue, impact, owner, and status columns |
| Priority | Must |
| Acceptance | Open issues can be displayed by owner and status |

### 9.14 PARSER-SPEC-014 — Handle parse errors

| Item | Content |
|---|---|
| Requirement | When the file is missing sections, has broken tables, or has an invalid structure, the parser must record clear errors/warnings |
| Priority | Must |
| Acceptance | The error log includes at least the file, section, reason, and severity |

### 9.15 PARSER-SPEC-015 — Output standardized parse results

| Item | Content |
|---|---|
| Requirement | The parser must return standardized JSON/records for DB storage |
| Priority | Must |
| Acceptance | The result can be stored and used by downstream dashboards without re-parsing the raw file |

### 9.16 PARSER-SPEC-016 — Idempotent re-parse

| Item | Content |
|---|---|
| Requirement | The same file content must not create duplicate records when parsed again |
| Priority | Must |
| Acceptance | If the hash does not change, the parser records that no new snapshot needs to be created |

## 10. Data / Database Requirement

### 10.1 Main tables

| Table | Purpose |
|---|---|
| `tbl_artifact_inventory` | Store the list of artifacts by ticket and existence status |
| `tbl_artifact_snapshot` | Store file snapshot metadata, hash, update time, parse status, and official/draft status |
| `tbl_artifact_parse_result` | Store the structured parse result of `spec-pack.md` |
| `tbl_artifact_parse_error` | Store parse errors, warnings, and related metadata |
| `tbl_artifact_inventory` | Store the present/missing state of `spec-pack.md` in the PR |

### 10.2 Expected fields

| Field | Required | Description |
|---|---:|---|
| `artifact_id` | Yes | Artifact identifier |
| `ticket_id` | Yes | Ticket ID of the spec-pack |
| `artifact_type` | Yes | Artifact type, for example `SPEC_PACK` |
| `source_path` | Yes | Original file path |
| `content_hash` | Yes | Content hash for idempotent reruns |
| `schema_version` | Should | Schema/front matter version |
| `parse_status` | Yes | `DRAFT`, `OFFICIAL`, `PARTIAL`, `FAILED` |
| `parse_mode` | Yes | `draft` or `official` |
| `trigger_source` | Yes | `github_webhook`, `pr_update`, `push`, `batch` |
| `artifact_exists` | Yes | Whether `spec-pack.md` exists |
| `artifact_status` | Yes | `present`, `missing`, `invalid` |
| `warning_count` | Yes | Number of warnings |
| `error_count` | Yes | Number of errors |
| `ac_count` | Yes | Number of ACs |
| `ac_numbered` | Yes | Whether ACs are numbered |
| `parsed_at` | Yes | Parse time |
| `official_parsed_at` | Could | Time when the official snapshot was finalized |
| `ci_status_at_parse` | Could | CI status at official parse time |
| `parser_version` | Yes | Parser version |
| `updated_at_source` | Could | Time of the latest update in the source file |
| `missing_reason` | Could | Reason for missing file if `artifact_status = missing` |

### 10.3 Related tables

| Table | Purpose |
|---|---|
| `tbl_metric_definition` | Used for Evidence Quality Score and related KPIs |
| `tbl_metric_value` | Stores future KPI results |
| `tbl_traceability_link` | Stores links extracted from spec-pack if any |
| `tbl_data_quality_event` | Stores data error and warning events |
| `tbl_artifact_inventory` | Stores the missing artifact if the PR does not contain `spec-pack.md` |

## 11. Non-functional Requirements

### 11.1 Performance

| Item | Requirement |
|---|---|
| Parse a single file | Complete quickly enough for daily batch processing |
| Batch many files | Can process many spec-packs in one run without blocking the system |
| Re-parse | When the content hash does not change, processing is fast and no duplicate data is written |

### 11.2 Reliability

- The parser must handle files missing some sections without crashing the entire job.
- The parser must clearly distinguish between `warning` and `error`.
- The parser must be able to rerun after a partial failure.

### 11.3 Logging / Audit

- Record the parser run time.
- Record the input file, ticket ID, parser version, and result.
- Record the cause of parse errors by section.

### 11.4 Maintainability

- The parser structure should be easy to update when the `spec-pack.md` template changes.
- Headings, patterns, and tables should be defined clearly in configuration or mappings.

### 11.5 Compatibility

- The parser must be compatible with standard UTF-8 Markdown files.
- If there are small heading variations, the parser should still read the file and warn instead of failing hard when the core information is still present.

## 12. Test Strategy Summary

### 12.1 Unit test

- Can read a full sample file.
- Can read a file with front matter.
- Correctly extracts `Scope`, `Acceptance Criteria`, and `Open Issues`.
- Correctly counts the number of ACs.
- Correctly detects placeholders.

### 12.2 Integration test

- The parser receives files from the Artifact Scanner or ingest job.
- The parse result is stored in the DB using the correct schema.
- When a file changes, rerunning creates exactly one new snapshot.

### 12.3 Data quality test

- A missing section should produce a warning.
- A table with invalid format should produce an error or partial parse.
- ACs that do not follow the format should trigger a warning.

### 12.4 Regression test

- Use multiple real `spec-pack.md` files from sample tickets.
- Ensure the parser still works when the section order stays the same but the contents change.

### 12.5 UAT

- PM/QA/Data Ops can view the parse result and confirm it matches the source file.
- Business users can confirm that important fields were extracted correctly.

## 13. Acceptance Criteria

| ID | Criteria | Testable? | Notes |
|---|---|---|---|
| AC-SPEC-PARSER-1 | The parser reads `spec-pack.md` from the standard path | Yes | Supports ticket-based or batch processing |
| AC-SPEC-PARSER-2 | The parser identifies `ticket_id` | Yes | From path/front matter/header |
| AC-SPEC-PARSER-3 | The parser extracts the main sections | Yes | At least the core sections of the template |
| AC-SPEC-PARSER-4 | The parser extracts the Acceptance Criteria table | Yes | Can count the number of ACs |
| AC-SPEC-PARSER-5 | The parser detects ACs that do not follow the format | Yes | Produces a warning |
| AC-SPEC-PARSER-6 | The parser detects placeholders in required fields | Yes | Placeholders are not treated as complete data |
| AC-SPEC-PARSER-7 | The parser extracts Open Issues and Human Decision Required | Yes | Includes owner and status |
| AC-SPEC-PARSER-8 | The parser records warnings/errors when the file structure is broken | Yes | Includes file/section/reason |
| AC-SPEC-PARSER-9 | The parser outputs standardized parse results | Yes | Can be stored in the DB |
| AC-SPEC-PARSER-10 | The parser reruns idempotently by content hash | Yes | No duplicate data is created |

## 14. Open Points

| ID | Issue | Impact | Owner | Status |
|---|---|---|---|---|
| OP-01 | The official AC pattern is finalized as `AC-<TICKET>-<n>`, where `n` starts from `1` and increases continuously within the ticket scope | Affects parser, score, and test mapping | PM / Data / QA | Closed |
| OP-02 | The placeholder list is finalized as `---`, `<...>`, `TBD`, `TODO`, `N/A`, `-`, empty strings, and null in required fields | Affects warning logic | Data Ops | Closed |
| OP-03 | YAML front matter is preferred if present, but it is not mandatory for every file in the MVP | Affects the level of standardization | PM / Tech Lead | Closed |
| OP-04 | The parser tolerates empty sections or section reordering as a warning if core information is still present | Affects parser robustness | Backend / Data | Closed |
| OP-05 | The official DB schema for parse results uses the existing tables; columns are added only when truly necessary | Affects downstream services | Backend / Data | Closed |

## 15. Definition of Done

- The parser reads `spec-pack.md` according to the standard template.
- The parser returns structured data in the correct schema.
- Unit tests cover the main cases: standard file, file with front matter, incorrect AC format, placeholders, and missing sections.
- Integration tests prove the parser can write to the DB and rerun idempotently.
- Data quality logs clearly show warnings/errors.
- PM/QA/Data Ops confirm the parse result is usable for downstream screens.
- There is no requirement to collect raw prompt, raw chat, raw source code, or secrets.

## 16. Implementation Notes

- This feature should be implemented before score calculation and traceability matching.
- The parser should be resilient and not fail the whole job just because one subsection is missing data.
- The section mapping should remain explicit so that future template changes can be adjusted quickly.