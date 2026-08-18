# Spec Pack

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung  
**Update date**: 2026-06-19  

## 1. Context / Purpose

`spec-pack.md` is the central specification document for each ticket in the SDD Evidence Collection & Analysis flow. This parser function is responsible for reading the file according to the standard template, normalizing it into structured data, and providing input for Artifact Inventory, Evidence Quality Score, AC-Test Coverage, Traceability Map, and Data Quality Dashboard.

The original requirement source used in this phase names the function `SPEC-PACK-PARSER`, while the repository working folder currently uses `PARSER-SPEC-PACK`. In this document, `PARSER-SPEC-PACK` is the operational ticket key used in the repository.

The goal of the spec pack is to lock a single source of truth so the development team does not need to reinterpret the requirement again when moving into Phase 3. The parser must prioritize stability, repeatability, auditability, and the ability to detect incomplete data.

## 2. Scope

### 2.1. Within range

- Read the file `docs/changes/<TICKET>/spec-pack.md` or content already synchronized into the system.
- Identify `ticket_id` from the path, front matter, or header when available.
- Prefer reading YAML front matter when the file contains it.
- Extract the main sections according to the standard template; do not accept heading variants.
- Extract the following tables: Terminology, Input, Output, Error / Exception, Boundary Value, Non-functional, Acceptance Criteria, Human Decision Required, Assumptions and Inference Log, Open Issues.
- Normalize Acceptance Criteria, count the number of AC items, and recognize ACs in the standard format `AC-<TICKET>-<n>`.
- Detect leftover placeholders such as `---`, `<...>`, `TBD`, `TODO`, `N/A`, `-`, empty strings, or null values in required fields.
- Emit warnings when sub-sections are missing or when headings/tables have minor variants but the core data is still sufficient.
- Emit errors when the file structure is seriously broken or the parse is no longer trustworthy.
- Support draft parse when the file changes and official parse when PR + CI pass.
- Ensure idempotent reruns based on `content_hash`.
- Record missing artifact when `spec-pack.md` does not exist in the PR.
- Output normalized parse results for database storage and downstream consumption.

### 2.2. Out of range

- General natural language understanding beyond the `spec-pack.md` template.
- Parsing other specification files such as `impl-plan.md`, `test-plan.md`, and `report.md`.
- Direct calculation of Evidence Quality Score, AC-Test Coverage, or Traceability Map.
- Ticket ↔ PR ↔ Commit ↔ CI matching.
- Parsing source code, test logs, coverage reports, JUnit XML, SAST/SCA/secret scan outputs.
- Dedicated UI handling for the parser.
- Storing raw source code, raw prompt, raw chat, or secrets.

## 3. Terminology
| terms | meaning | notes |
|---|---|---|
| Spec Pack | Specification document per ticket, used as the source of truth for requirements | The target file is `spec-pack.md` |
| Front matter | YAML block at the top of a Markdown file | If present, it is read first |
| Standard heading | Heading name that matches the template exactly | The parser accepts only the standard template headings |
| AC | Acceptance Criteria | Must have a standard code for test mapping |
| Placeholder | Temporary value such as `---`, `TBD`, `<...>` | Must not be treated as complete data |
| Draft parse | Early parse performed as soon as the file changes | Used for early warning, not final approval |
| Official parse | Final parse after PR + CI pass | Used for the official snapshot |
| Snapshot | Parse result record at a given point in time | Used for audit and reruns |
| Required field | Field that must contain real data | Missing values trigger warning/error depending on severity |
| Open issue | Unresolved point that requires a human decision | Must be separated from the core spec |

## 4. As-Is

- `spec-pack.md` already has a standard template and is used as the central document for each ticket.
- Readers currently have to inspect each file manually, which makes standardization and reuse difficult.
- There may be minor variants in headings, section order, or table formatting across tickets.
- There is no dedicated parser layer for `spec-pack.md` in the official ingest flow.
- Downstream consumers such as Evidence Quality Score, AC-Test Coverage, and Traceability Map need normalized data, but today still depend heavily on manual reading or separate processing.

## 5. To-Be

- The parser reads `spec-pack.md` from the standard path and/or from content already synchronized into the system.
- The parser extracts sections, tables, and AC lists according to the standard template.
- The parser normalizes the result into JSON/records for database storage.
- The parser attaches `ticket_id`, `content_hash`, `schema_version`, `parse_mode`, `parse_status`, and missing-file status.
- The parser clearly distinguishes warnings from errors, and draft parse from official parse.
- The parser can run multiple times without creating duplicate data if the content does not change.
- The parser produces clean enough input for downstream score, coverage, and traceability processing.
- In the MVP, the parser runs inside the existing Artifact Scanner ingest flow; the default connector type is `ARTIFACT_SCANNER`. If a separate runner is introduced later, adding a `MARKDOWN_PARSER` seed is sufficient and the schema does not need to change.

## 6. Detailed specification

### 6.1. Business Rules

- The parser must accept input from the standard path `docs/changes/<TICKET>/spec-pack.md` or from synchronized content.
- If the file contains YAML front matter, the parser must read it first and prioritize primary values such as `ticket_id`, `schema_version`, `artifact_type`, `created_at`, and `updated_at`.
- If `ticket_id` exists in front matter, that value wins over the path/header unless the front matter is clearly invalid.
- The parser must recognize the main sections of the template, even when headings have minor variants in dashes, spaces, or capitalization.
- The parser must extract the tables in the template correctly and preserve the meaning of each data row.
- Acceptance Criteria must be normalized to the format `AC-<TICKET>-<n>`, where `n` starts from `1` and increases continuously within a ticket.
- If an AC is not in the standard format, the parser must emit a warning but still retain the content for correction.
- Placeholders in required fields must be marked as incomplete and must not be treated as complete data.
- When a sub-section is missing but the core information is still sufficient, the parser may return a warning and a partial result; if the structure is severely broken, it must return an error.
- When the PR does not contain `spec-pack.md`, the system must record a missing artifact instead of continuing to parse.
- Official parse may only be finalized when PR + CI pass; if CI fails, only the draft result is kept.
- The parser must be idempotent based on `content_hash`; identical content must not create duplicate snapshots.

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| source_path | string | Yes | Must belong to `docs/changes/<TICKET>/spec-pack.md` or valid synchronized input | Used to derive ticket when needed |
| content | string | Yes | Valid UTF-8 Markdown at a level sufficient for parsing | Raw file content |
| ticket_id | string | No | If present, it must match the path or front matter | The parser can infer it automatically |
| parse_mode | string | Yes | Accepts only `draft` or `official` | Used to differentiate snapshots |
| trigger_source | string | Yes | Example values: `github_webhook`, `pr_update`, `push`, `batch` | Used for audit |
| content_hash | string | Yes | Valid non-empty hash string | Used for idempotent reruns |
| ci_status_at_parse | string | No | `pass`, `fail`, `pending`, `unknown` | Affects official parse only |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| ticket_id | string | `PARSER-SPEC-PACK` or value read from file | Primary linkage key |
| artifact_exists | boolean | `true/false` | Indicates whether the file exists |
| artifact_status | string | `present`, `missing`, `invalid` | Used for dashboard and audit |
| parse_status | string | `DRAFT`, `OFFICIAL`, `PARTIAL`, `FAILED` | Reflects processing state |
| parse_mode | string | `draft` or `official` | Preserves input semantics |
| sections | object/array | List of extracted sections | Includes reduced content by section |
| acceptance_criteria | array | List of normalized AC items | Each AC has a code and description |
| warnings | array | Structured warnings | Does not break the whole parse |
| errors | array | Structured errors | Used for debug and audit |
| required_fields_missing | array | List of missing fields/sections | Used by the rule engine |
| parsed_summary | object | Summary JSON | Input for DB/downstream |
| parser_version | string | Semver or build tag | Used for audit and reruns |

### 6.4. Error / Exception
| case | expected behavior | message/code | notes |
|---|---|---|---|
| File does not exist | Record a missing artifact and do not attempt official parse | `artifact_missing` | Not a system failure |
| File cannot be read | Return an error and mark FAILED | `file_unreadable` | May be due to permissions or encoding |
| Markdown structure is severely broken | Return an error and do not finalize an official snapshot | `markdown_invalid` | For example, a badly broken table |
| Required section is missing | Return a warning or partial parse depending on severity | `section_missing` | Missing core sections must be treated as more severe |
| AC format is invalid | Return a warning but keep the AC content | `ac_format_invalid` | Must not alter meaning automatically |
| Placeholder in a required field | Return a warning and mark as incomplete | `placeholder_detected` | Must not count as complete data |
| CI fails for official parse | Keep only the draft result | `ci_not_passed` | Do not finalize the official snapshot |
| Same content hash already parsed | Do not create duplicate records | `idempotent_skip` | Update metadata only if needed |

### 6.5. Boundary Value
| item | min | max | special cases | expected |
|---|---|---|---|---|
| Content size | 0 byte | No fixed upper bound in the requirement; use a config threshold if the system defines one | Empty file | Parse returns a clear warning/error |
| Number of AC items | 0 | Many ACs in one file | Empty AC list or only 1 AC | Count accurately, do not merge incorrectly |
| Number of sections | 0 | Many sections following the standard template | Section order is swapped | Still detect the core sections |
| Multilingual content | One language | Mixed Vietnamese, English, Japanese | Unicode / Vietnamese diacritics | Parse without encoding errors |
| Placeholder | None | Many placeholders scattered across the file | Placeholder inside tables | Mark incomplete, do not treat as complete |

### 6.6. Non-functional
| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Parsing must be suitable for batch processing and repeated reruns | Must not block the pipeline; runtime must remain stable for normal markdown files | Unit + integration smoke tests | No numeric threshold is defined in the original requirement |
| Security | Must not read/write secrets, raw prompts, raw chat, or source code outside scope | Only process valid spec-pack content and allowed paths | Security review + path-guard tests | Must avoid file-read primitives |
| Availability / Reliability | Partial or broken files must not crash the entire job | Partial parse or warning when core data is still present | Negative tests + rerun tests | Draft and official must remain separate |
| Maintainability | Heading/section mapping must be easy to update when the template changes | Clear configuration or mapping | Code review + regression tests | Avoid ambiguous hard-coding |
| Observability / Logging | Must log/audit parse runs, status, warnings, and errors | Trace by ticket/file/hash/run | Integration tests + log checks | Supports Data Ops |
| Compatibility | Must support UTF-8 Markdown and near-standard heading variants | Handle CommonMark/YAML front matter | Parser unit tests | Prefer read first, normalize later |

## 7. Acceptance Criteria
| ACID | description | testable? | notes |
|---|---|---|---|
| AC-PARSER-SPEC-PACK-1 | When `spec-pack.md` is provided via the standard path, the parser reads the file and identifies the correct `ticket_id` | Yes | `ticket_id` may come from path or front matter |
| AC-PARSER-SPEC-PACK-2 | When the file contains valid YAML front matter, the parser prioritizes front matter values for the main fields | Yes | At minimum `ticket_id`, `schema_version`, `artifact_type`, `created_at`, `updated_at` |
| AC-PARSER-SPEC-PACK-3 | The parser extracts the main sections of the spec-pack template | Yes | Includes scope, AC, examples, impacts, and open issues |
| AC-PARSER-SPEC-PACK-4 | The parser extracts the Terminology table and the Input/Output/Error/Boundary/Non-functional tables | Yes | Each row is stored as a structured record |
| AC-PARSER-SPEC-PACK-5 | The parser extracts Acceptance Criteria and counts them correctly | Yes | Each AC has a standard code and description |
| AC-PARSER-SPEC-PACK-6 | If an AC is not in the standard format, the parser emits a warning but keeps the content for review | Yes | Must not lose data |
| AC-PARSER-SPEC-PACK-7 | If a required field still contains a placeholder, the parser marks it incomplete and emits a warning | Yes | Placeholders must not be counted as complete data |
| AC-PARSER-SPEC-PACK-8 | If the file is missing a section or has a severely broken table, the parser emits a clear error with the related section/file | Yes | Distinguish warnings from errors |
| AC-PARSER-SPEC-PACK-9 | When the same content is parsed again, the parser does not create duplicate records based on `content_hash` | Yes | Idempotent rerun |
| AC-PARSER-SPEC-PACK-10 | When the PR does not contain `spec-pack.md`, the system records a missing artifact instead of attempting an official parse | Yes | Do not finalize an official snapshot |

## 8. Examples

### 8.1. Normal Case

A `docs/changes/PARSER-SPEC-PACK/spec-pack.md` file contains all required sections, all tables, and ACs named `AC-PARSER-SPEC-PACK-1`, `AC-PARSER-SPEC-PACK-2`, and so on. The parser reads `ticket_id`, extracts `Scope`, `Non-functional`, and `Open Issues`, returns `parse_status = OFFICIAL` when PR + CI pass, and stores a structured `parsed_summary`.

### 8.2. Error Case

The file has an `Acceptance Criteria` section, but the table is broken, with missing columns or header rows. The parser still records the input file, emits `markdown_invalid` or `section_missing`, returns `parse_status = FAILED` or `PARTIAL` depending on severity, and does not finalize an official snapshot.

### 8.3. Boundary Case

A very short file contains only a title and a few placeholder lines, or a file contains many AC items and many sub-sections while the main sections still exist. The parser must mark the file incomplete, count ACs accurately, and not crash when handling empty content or multilingual Unicode text.

## 9. Source Availability Summary

- `docs/changes/PARSER-SPEC-PACK/raw/requirement.md`: the main requirement source, describing scope, AC, and operating flow. High trust.
- `docs/changes/PARSER-SPEC-PACK/raw/database-design.md`: the main source for storage direction, table mapping, and reuse strategy. High trust.
- `docs/changes/PARSER-SPEC-PACK/raw/spec-pack-template.md`: the standard source for the `spec-pack.md` structure. High trust.
- `docs/architecture/data-flow-map.md`, `repository-db-map.md`, `service-layer-map.md`, `external-interface-map.md`, `test-map.md`: supporting sources for flow, DB, and parser-related readiness. Medium-high trust.
- `.claude/rules/20-architecture.md`, `docs/standards/backend.md`, `docs/standards/database.md`, `docs/standards/security.md`, `docs/standards/testing.md`: constraints for architecture, security, testing, and DB. Medium-high trust.
- Existing source code: `ArtifactNormalizer`, `SpecPackMarkdownParserController`, `ArtifactScannerService`, `ArtifactScannerController`, and related artifact scanner tests. High trust for current implementation state.
- Current gap: no dedicated parser class for `spec-pack.md`, and no parser-specific test is visible in the current source.

## 10. Complexity Classification

```text
- Complexity: Complex
- System shape: BE only / DB / Batch / Legacy
- Primary risk: Source / Contract / DB / Test
- Review mode: Heavy
- Required options: Source Analysis / DB Migration / Full Security
```

## 11. FE/BE Contract Impact

- The core parser is backend-only, so no new FE screen is needed for the MVP.
- If a dev/QA endpoint remains, it should only act as a support tool, not as a primary product contract.
- Downstream dashboards or APIs that read parse results must use a stable schema for `parsed_summary`, `sections`, `acceptance_criteria`, `warnings`, and `errors`.
- If new FE consumers are added later, the contract should use stable keys for `ticket_id`, `parse_status`, `parse_mode`, and the normalized AC list.

## 12. DB/Migration Impact

- The current design favors reusing existing schema and does not require new tables for the MVP.
- Parse results should be written into the existing snapshot/section/AC/decision/risk/event/data quality tables as defined by the design source.
- Additional `SPEC_PACK` seed data is needed for `tbl_dim_artifact_type` and the corresponding rule in `tbl_artifact_required_field_rule`; this is data seed, not a schema change.
- Do not modify existing production migrations directly.

## 13. Security/Privacy Impact

- The parser may only read files from allowed paths or valid synchronized content; it must not become a generic file-read primitive.
- Do not store raw prompts, raw chats, secrets, or source code outside the scope of `spec-pack.md`.
- If the file contains placeholders, the parser must mark them as incomplete instead of guessing the real content.
- Logs must avoid printing unnecessary sensitive data; keep trace, path, hash, status, and short error reasons only, enough for audit.
- Downstream output may contain internal project information, so access to parse results must follow the role permissions configured for the pipeline or Data Ops operations.

## 14. Operation/Maintenance Impact

- The parser must rerun idempotently based on `content_hash` to avoid duplicate snapshots.
- Logs must include the parse time, input file, ticket, mode, parser version, and final status.
- When the `spec-pack.md` template changes, section/table mapping must be easy to update without rewriting the entire parser.
- Separating draft and official parse helps operations detect issues early without breaking the official snapshot.
- If a file is missing, the system must record a missing artifact instead of silently skipping it.

## 15. Test Strategy Summary

- Unit tests for front matter parsing, section parsing, table parsing, AC normalization, placeholder detection, and idempotent hash behavior.
- Integration tests for receiving files from the Artifact Scanner/ingest job and storing parse results.
- Data quality tests for missing sections, broken tables, invalid AC formats, and leftover placeholders.
- Regression tests for multiple real-world `spec-pack.md` variants from sample tickets.
- Smoke tests for draft parse and official parse to verify `DRAFT` / `OFFICIAL` / `FAILED` states.

## 16. Human Decision Required
No manual decision remains to be finalized for Phase 1/2.

## 17. Assumptions and Inference Log
| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
|A-PARSER-SPEC-PACK-1|The parser will prioritize normalization based on the existing template and will not attempt to infer meaning beyond defined sections/tables|The requirement emphasizes a rule-based parser rather than a general NLP system|Low|No|
|A-PARSER-SPEC-PACK-2|Tables in the spec pack can be stored as normalized JSON/records in snapshot and section-level output|The database design already points to reusing the existing schema and JSONB in snapshots|Low|No|
|A-PARSER-SPEC-PACK-3|Official parse is finalized only after PR + CI pass|The requirement explicitly describes draft/official flow|Low|No|
|A-PARSER-SPEC-PACK-4|No new schema is needed for the MVP if rules/seeds are sufficient|The database design locks in the current reuse-schema approach|Low|No|

## 18. Open Issues
| ID | issue | impact | owner | status |
|---|---|---|---|---|
|OI-PARSER-SPEC-PACK-1|No open issue remains after aligning the requirement and database design for Phase 1|None|N/A|Closed|