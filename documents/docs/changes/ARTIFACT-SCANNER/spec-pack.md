# Spec Pack

**Ticket ID**: ARTIFACT-SCANNER  
**Create date**: 2026-06-16  
**Author**: nk_trung       
**Update date**: 2026-06-16  

## 1. Context / Purpose

Artifact Scanner is a backend function used to scan evidence artifacts in the repository and create an Artifact Inventory by ticket in order to support the following goals:

- know which artifacts each ticket currently has
- know which required artifacts are still missing
- know which artifacts are new or have changed
- know which artifacts need to be reprocessed by the parser
- provide baseline data for the scanner test/operation screen

In this system, the repository and artifact files remain the Single Source of Truth. The analytics DB only stores metadata, hashes, scan statuses, and derived data. Artifact Scanner does not replace the parser, does not replace the Git/PR/CI collector, and does not directly calculate KPIs.

The goal of this ticket is to standardize the Artifact Scanner function as an independent module, with a clear boundary from the parser, and to use the correct tables in `V4__init_shema_v2.sql`.

## 2. Scope

### 2.1. Within range

- Scan artifacts under `docs/changes/<TICKET>/`
- Identify `ticket_id` from the folder path structure
- Identify `artifact_type` from filename/path based on artifact type configuration
- Check which artifacts exist and which required artifacts are missing by ticket
- Calculate and store the minimum scan metadata of artifacts
- Detect new artifacts or changed artifacts based on `content_hash`
- Set the `need_parse` flag so the parser knows which artifacts need to be reprocessed
- Scan basic metadata for `docs/maintenance/phase0/` based on the fixed file list currently available in code
- Record each scan history entry into the connector run table
- Provide data for the Scan Result / Artifact Inventory screen for testing and operation

### 2.2. Out of range

- Parse Markdown sections and extract AC, Scope, Risk, Rollback, CI Run ID
- Collect Git metadata such as author, branch, changed file path, added/deleted lines
- Collect PR metadata, review state, or labels
- Collect CI metadata or security scan metadata
- Calculate Evidence Quality Score, AC-Test Coverage, First CI Pass, or other KPIs
- Perform Traceability matching
- Scan `.claude/*`
- Store full Markdown artifact content in the DB only for parser usage

## 3. Terminology
| terms | meaning | notes |
|---|---|---|
| Artifact Scanner | Backend module that scans artifacts and creates metadata inventory | Does not parse detailed content |
| Artifact Inventory | Existing/missing status and scan metadata of artifacts by ticket | Can be retrieved from the latest snapshot |
| Artifact Snapshot | Record of an artifact status at a scan point in time | Linked to `connector_run_id` |
| Artifact Type | Artifact type defined in `tbl_dim_artifact_type` | For example `SPEC_PACK`, `REPORT` |
| Required Artifact | Artifact required by artifact type configuration | Used to determine missing artifacts |
| need_parse | Flag indicating that an artifact needs parser reprocessing | Column added directly to snapshot |
| Phase 0 artifact | Artifact under `docs/maintenance/phase0/` based on a fixed file list | Only basic metadata is scanned in this ticket |
| SSOT | Single Source of Truth | Repo/artifact files are the SSOT; DB is derived data |

## 4. As-Is

- The system already has raw requirement/database/wireframe documents for ARTIFACT-SCANNER, but there is not yet an official `sources.md`, `00_brainstorm.md`, or `spec-pack.md` for this ticket.
- Existing source code has artifact/connector-related logic, but it is tied to legacy tables or mixes scanner + parser responsibilities.
- The V4 schema already exists and has suitable tables for the new design, but it has not yet been fully finalized for the scanner according to this ticket's spec.
- `tbl_dim_artifact_type` in V4 has seeded artifact types for `docs/changes/<TICKET>/` and the 7 phase0 files currently used in code.
- There is not yet a canonical Vietnamese spec for the team to use as the single source of truth before moving to Phase 3.

## 5. To-Be

- `spec-pack.md` of ARTIFACT-SCANNER becomes the single source of truth for Phase 3.
- Artifact Scanner is an independent backend metadata inventory component, separate from the parser.
- Scanner only uses tables under `V4__init_shema_v2.sql`.
- Scanner scans `docs/changes/<TICKET>/` and `docs/maintenance/phase0/` based on the fixed file list currently supported by code.
- Scanner writes runs to `tbl_connector_run` and snapshots to `tbl_fact_artifact_snapshot`.
- Current inventory is provided through the view `vw_artifact_inventory_current`; no new inventory table is created.
- Parser rereads the original artifact from the repo based on scanner metadata, instead of relying on full content stored in the scanner DB.
- Minimal API/manual testing is available to run scans and view scan results.

## 6. Detailed specification

### 6.1. Business Rules

| ID | rule | detail |
|---|---|---|
| BR-AS-1 | Scanner only scans evidence artifacts within the ticket scope | Main scope is `docs/changes/<TICKET>/`; phase0 only scans the fixed file set currently supported by code |
| BR-AS-2 | Scanner does not parse Markdown | All detailed content parsing belongs to the parser module |
| BR-AS-3 | Scanner does not collect Git/PR/CI metadata | Those metadata belong to other collectors |
| BR-AS-4 | Scanner must identify `ticket_id` from the path `docs/changes/<TICKET>/` | This is the primary key for ticket-level inventory |
| BR-AS-5 | Scanner must map filename/path to `artifact_type` using artifact type configuration | Avoid scattering hard-coded logic in multiple places where possible |
| BR-AS-6 | Scanner must determine whether required artifacts exist or are missing by ticket | Based on `required_flag` of artifact type in scope |
| BR-AS-7 | Scanner must detect new or changed artifacts using `content_hash` | Used to determine whether re-parsing is needed |
| BR-AS-8 | Scanner must not store full Markdown content in the DB only for parser use | Repo remains the SSOT |
| BR-AS-9 | Parser must reread the original file from the repository based on scanner metadata | At minimum, it needs `repository_id`, `source_path`, and suitable version context |
| BR-AS-10 | For `docs/maintenance/phase0/` based on the fixed file list, scanner only records basic metadata | Does not parse decision/risk/review/execution content |
| BR-AS-11 | Scanner only uses tables under the V4 schema | Does not use legacy tables/migrations as the standard |
| BR-AS-12 | Scanner API/manual test only serves testing/operation | Does not change the fact that Artifact Scanner is a BE-centric function |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| `repository_id` | UUID | Yes | Must exist in `tbl_dim_repository` | Repo scope of the scan |
| `branch_or_ref` | string | Yes | Must not be empty | Used to determine the scan version context |
| `scan_mode` | enum | Yes | `FULL`, `TICKET_SCOPED` | Scan mode in MVP v1 |
| `ticket_ids` | array<string/UUID> | No | Only used with `TICKET_SCOPED` | Target ticket list |
| `trigger_type` | enum | Yes | `MANUAL`, `BATCH`, `WEBHOOK` | For audit/operation |
| `requested_by` | string | Yes | Must not be empty | Person or system requesting the scan |
| `trace_id` | string | No | Follows system standard | For logging/tracing |

### 6.3. Output
| item | type | format | notes |
|---|---|---|---|
| `connector_run_id` | UUID | UUID | ID of the scan run |
| `ticket_id` | UUID/null | UUID | Null for phase0 artifacts not linked to a ticket |
| `artifact_type_id` | UUID | UUID | Looked up from `tbl_dim_artifact_type` |
| `artifact_type_code` | string | enum-like | Can be returned for UI/debug |
| `source_path` | string | path | File path in repo |
| `exists_flag` | boolean | true/false | Whether the artifact exists |
| `content_hash` | string/null | hash | Content hash if readable |
| `size_bytes` | number/null | integer | Practical scan metadata, finalized as an added snapshot column |
| `source_updated_at` | datetime/null | ISO datetime | Source file update time if readable |
| `template_empty_flag` | boolean | true/false | Basic warning for empty/template file |
| `need_parse` | boolean | true/false | Used for parser handoff, finalized as an added snapshot column |
| `scan_status` | string | `FOUND`/`MISSING`/... | Detailed scan status, finalized as an added snapshot column |
| `scan_message` | string/null | text | Debug/operation message, finalized as an added snapshot column |

### 6.4. Error / Exception
| case | expected behavior | message/code | notes |
|---|---|---|---|
| Repository does not exist | Reject scan execution | `REPOSITORY_NOT_FOUND` | Do not open a run, or fail early |
| Invalid branch/ref | Reject or fail the run | `INVALID_REF` | Depends on the source file retrieval mechanism |
| File cannot be read | Write snapshot with error status or update run error | `ARTIFACT_READ_ERROR` | Should not break the entire scan if the error is local to one file |
| Artifact type cannot be mapped | Skip or write warning according to configuration | `ARTIFACT_TYPE_UNMAPPED` | Clear policy is needed for optional unknown files |
| Ticket does not exist in dimension | Auto-create a minimal ticket to continue scanning | `TICKET_PLACEHOLDER_CREATED` | Current code behavior is auto-create minimal ticket |
| No connector row for scanner | Configuration failure | `CONNECTOR_NOT_CONFIGURED` | Need seed/upsert `tbl_source_connector` |
| Snapshot write fails | Fail run or partial fail | `ARTIFACT_SNAPSHOT_WRITE_FAILED` | Depends on error count and transaction policy |

### 6.5. Boundary Value
| item | min | max | special cases | expected |
|---|---|---|---|---|
| Artifact file count | 0 | Many files per repo | Repo has no tickets | Run remains valid, inventory is empty |
| Ticket artifact set | 0 files | Full file set in scope | Ticket has only part of the artifacts | Missing required artifacts must be reflected |
| File size | 0 bytes | Depends on actual source | Empty or near-template file | `template_empty_flag = true` or equivalent warning |
| `content_hash` | null | valid hash | File read error or missing | Do not incorrectly set changed logic |
| `scan_mode` | 1 mode | 2 supported modes | Mode outside `FULL`, `TICKET_SCOPED` | Reject request in MVP v1 |
| phase0 artifact | 0 files | many files | file has not been seeded as artifact type | This ticket must add seed so scanner maps artifact type correctly |

### 6.6. Non-functional
| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Scanner must be fast enough for MVP repo scope | Full scan of one target repo is acceptable for internal operations | Integration test / manual run | No complete realtime requirement in this ticket |
| Security | Do not store full Markdown content, raw prompt/chat, secrets, or raw CI logs | 0 violations in Artifact Scanner | Code review / security review | Aligns with Metadata First |
| Availability / Reliability | File-local errors should not break the entire scan when avoidable | Support reasonable partial success | Manual test / integration test | Depends on run/error policy |
| Maintainability | Artifact type mapping and required rules should be based on V4 configuration | Reduce hard-coding | Design review / code review | Artifact type seeds must be complete |
| Observability / Logging | Every scan must have a connector run and suitable trace/logs | Debuggable by `connector_run_id` and `trace_id` | Manual test / logs | Follow internal logging standard |
| Compatibility | Only use V4 schema and do not break old code outside ticket scope | Additive, clear boundary | DB review / migration review | Legacy tables are not the standard source |

### 6.7. Scanner target files

Artifact Scanner in this ticket must scan the following files under `docs/changes/<TICKET>/`:

- `spec-pack.md`
- `impl-plan.md`
- `review-checklist.md`
- `self-review.md`
- `test-plan.md`
- `test-results.md`
- `report.md`
- `blackbox-testcases.md`

In MVP v1 of this ticket, all eight files above are considered artifact scanner targets and must be checked as existing/missing by ticket.

In addition, the scanner also scans basic metadata for `docs/maintenance/phase0/` based on the fixed file list.

## 7. Acceptance Criteria
| ACID | description | testable? | notes |
|---|---|---|---|
| AC-ARTIFACT-SCANNER-1 | Scanner can scan artifact files under `docs/changes/<TICKET>/` for the target repository | Yes | Main scope |
| AC-ARTIFACT-SCANNER-2 | Scanner can identify `ticket_id` from the path structure `docs/changes/<TICKET>/` | Yes | For a valid ticket |
| AC-ARTIFACT-SCANNER-3 | Scanner can identify `artifact_type` from filename/path according to artifact type configuration | Yes | Includes MVP-scope files |
| AC-ARTIFACT-SCANNER-4 | Scanner can reflect whether required artifacts exist or are missing by ticket | Yes | Based on `required_flag` |
| AC-ARTIFACT-SCANNER-5 | Scanner can store the minimum artifact metadata including path, hash, size, updated time, scan status, and scan message | Yes | Follows the finalized snapshot column decisions |
| AC-ARTIFACT-SCANNER-6 | Scanner can detect new artifacts or changed artifacts based on `content_hash` | Yes | Supports parser handoff |
| AC-ARTIFACT-SCANNER-7 | Scanner marks `need_parse = true` for new artifacts or artifacts with changed `content_hash` | Yes | Rule finalized in this ticket |
| AC-ARTIFACT-SCANNER-8 | Scanner can scan basic metadata for files under `docs/maintenance/phase0/` based on the fixed file set | Yes | Does not parse content |
| AC-ARTIFACT-SCANNER-9 | Scanner can write a run log for each run into the V4 connector run mechanism | Yes | Uses `tbl_connector_run` |
| AC-ARTIFACT-SCANNER-10 | Parser does not need full content stored by scanner in DB, and can reread the original file from the repo using scanner metadata | Yes | Mandatory architectural principle |
| AC-ARTIFACT-SCANNER-11 | Scan summary and artifact result can be viewed from API or manual query for review/operation | Yes | Test-support contract |

## 8. Examples

### 8.1. Normal Case

Repository `repo-A`, ticket `ARTIFACT-SCANNER` has all of the following files:
- `spec-pack.md`
- `impl-plan.md`
- `review-checklist.md`
- `self-review.md`
- `test-plan.md`
- `test-results.md`
- `report.md`
- `blackbox-testcases.md`

Scanner runs a full scan:
- correctly identifies `ticket_id`
- correctly maps artifact type
- writes a snapshot for each file
- `exists_flag = true` for existing files
- `need_parse = true` for new files or files with changed hash
- `blackbox-testcases.md` exists and is reflected as a required artifact in this ticket
- run ends in success or partial success according to the actual error policy

### 8.2. Error Case

Ticket `ABC-123` is missing `review-checklist.md` and `report.md`.

Expected result:
- scanner still completes the run
- inventory reflects the two missing required artifacts
- scanner does not parse content of existing files
- parser only receives existing artifacts that need parsing

### 8.3. Boundary Case

`docs/maintenance/phase0/phase0-risk-register.md` exists and is one of the phase0 targets currently scanned by code.

Expected result:
- scanner must not silently treat it as a normal ticket artifact
- scanner must warn or record a clear operational open issue according to policy
- this is a signal to seed/update artifact type, not a reason to expand scanner into parser logic

## 9. Source Availability Summary

- Raw requirement and raw database design for ARTIFACT-SCANNER are strong enough to finalize the current functional scope.
- V4 migration is available and is the standard DB source for this ticket.
- `_ticket-template` is available and sufficient for Phase 1.
- Existing legacy source only needs to be read to confirm As-Is and must not be used as the design standard.
- Key DB/API/operation policy decisions for this ticket have been finalized; the rest is mainly implementation according to the spec.

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: BE only + DB + small API/manual test support
- Primary risk: DB / Contract / Operation / Test
- Review mode: Standard
- Required options: Source Analysis / DB Migration / API Contract
```

## 11. FE/BE Contract Impact

- No dedicated FE screen is required for MVP; any dev/QA endpoint is a support tool only, not a primary product contract (aligned with the same principle used in `PARSER-SPEC-PACK` §11).
- Response payloads must use stable keys matching the finalized snapshot output in §6.3: `connector_run_id`, `ticket_id`, `artifact_type_id`, `artifact_type_code`, `source_path`, `exists_flag`, `content_hash`, `size_bytes`, `source_updated_at`, `template_empty_flag`, `need_parse`, `scan_status`, `scan_message`. Any consumer (manual test UI, future FE, or the parser trigger) must rely on these keys, not on internal DB column names.
- Scanner is also an upstream contract for `PARSER-SPEC-PACK`: per BR-AS-9 / AC-ARTIFACT-SCANNER-10, the parser does not receive full content from scanner, only enough metadata to reread the original file from the repo (`repository_id`, `source_path`, `branch_or_ref`/version context, `content_hash`, `need_parse`). This metadata contract must stay stable since `PARSER-SPEC-PACK` is designed to run inside the same Artifact Scanner ingest flow (see `PARSER-SPEC-PACK` §5, §9) with `ARTIFACT_SCANNER` as the default connector type.
- If `PARSER-SPEC-PACK` is wired to consume scanner output directly (rather than a separate ingest trigger), the handoff fields (`need_parse`, `content_hash`, `source_path`, `ticket_id`) become a de facto internal contract between Scanner and Parser, even though neither exposes a new FE screen for this ticket.
- Any future FE consumer of scan results should follow the same "stable key" discipline that `PARSER-SPEC-PACK` §11 applies to its own output (`ticket_id`, `parse_status`, `parse_mode`, `acceptance_criteria`), so both Scanner and Parser contracts evolve consistently for shared dashboards (e.g. Artifact Inventory view combined with parse status).

## 12. DB/Migration Impact

- Only tables under `V4__init_shema_v2.sql` are used.
- Scanner directly uses the following tables:
  - `tbl_dim_repository`
  - `tbl_dim_ticket`
  - `tbl_dim_phase`
  - `tbl_dim_artifact_type`
  - `tbl_source_connector`
  - `tbl_connector_run`
  - `tbl_fact_artifact_snapshot`
- Tables not directly under scanner scope:
  - `tbl_fact_artifact_parsed_section`
  - `tbl_artifact_required_field_rule`
  - `tbl_fact_ticket_phase_status`
- Phase0 artifact types have been seeded in the current migration.
- Need to add `size_bytes`, `scan_status`, `scan_message`, and `need_parse` to `tbl_fact_artifact_snapshot`.
- Do not use legacy tables before V4 as the basis for the new design.

## 13. Security/Privacy Impact

- Do not store full Markdown content in the scanner DB.
- Do not store raw prompt/chat, secrets, or raw CI logs.
- Scanner only stores scan metadata and the minimum derived data needed.
- When displaying scan results, do not expose information beyond what is necessary for testing/operation.

## 14. Operation/Maintenance Impact

- Need a connector row for Artifact Scanner in `tbl_source_connector`.
- Need clear run logs so Data Ops can debug each scan.
- If phase0 artifact types have not been fully seeded, scanner operation will produce a warning or open issue.
- Need a clear rule when local scan errors happen: fail the whole run or allow partial success.
- Need a clear rule when `ticket_id` in path cannot be mapped to `tbl_dim_ticket`.

## 15. Test Strategy Summary

- Unit test for mapping path -> ticket_id -> artifact_type.
- Unit test for required/missing artifact rule.
- Unit test for changed hash -> need_parse rule.
- Integration test for scanner run -> snapshot write -> summary query.
- Integration test for phase0 metadata scan.
- Integration test for parser handoff using metadata, without full content in DB.
- API/manual test for Run Scan + Scan Result view.

## 16. Human Decision Required

There is no open Human Decision Required at the time Phase 1 is finalized.
The key decisions confirmed by the user are:

- add `size_bytes`, `scan_status`, `scan_message`, and `need_parse` to snapshot
- policy `unknown ticket = auto-create minimal ticket`
- current inventory uses `vw_artifact_inventory_current`
- scan results can be viewed through API/manual query
- seed phase0 artifact types within this ticket
- `CHANGED_FILES_SCOPED` is not prioritized for MVP v1
- the eight required artifact scanner targets are `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `report.md`, and `blackbox-testcases.md`

## 17. Assumptions and Inference Log
| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
|A-ARTIFACT-SCANNER-1|`docs/changes/ARTIFACT-SCANNER/raw/requirement.md` is the latest raw requirement source|User provided an updated zip and raw requirement reflects the finalized scope|If there is a newer unread source, the spec may miss updates|Yes|
|A-ARTIFACT-SCANNER-2|Current Artifact Scanner does not include `.claude/*`|User previously finalized the scope|If a different scanner is merged later, the current spec will be incomplete|Yes|
|A-ARTIFACT-SCANNER-3|Parser will reread the original file from the repo instead of reading from the scanner DB|Confirmed by the user in discussion and raw requirement|If the implementation platform cannot reread by ref/path, the design needs adjustment|Yes|
|A-ARTIFACT-SCANNER-4|Phase0 artifact types can be seeded in the scope of this ticket|Aligned with current raw DB design|Already confirmed by the user for this ticket|No|
|A-ARTIFACT-SCANNER-5|Scan mode `CHANGED_FILES_SCOPED` will receive changed files from upstream; scanner will not collect Git metadata by itself|Aligned with scanner non-scope|If upstream does not exist yet, this mode may not be implementable in MVP|Yes|

## 18. Open Issues

There is no blocker-level Open Issue remaining after Phase 1 finalization.

The remaining work belongs to Phase 3 implementation and should not be treated as specification ambiguity:
- create migration updating `tbl_fact_artifact_snapshot`
- seed phase0 artifact types in `tbl_dim_artifact_type`
- create view `vw_artifact_inventory_current`
- implement API/BE test flow according to the finalized spec