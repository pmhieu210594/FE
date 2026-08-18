# 00_brainstorm

**Ticket ID**: ARTIFACT-SCANNER  
**Create date**: 2026-06-16  
**Author**: nk_trung  
**Update date**: 2026-06-16  

## Purpose

Record the initial investigation thoughts for the `ARTIFACT-SCANNER` ticket before finalizing them into `spec-pack.md`. This document is used to separate reasoning, unclear points, risks, and conditions that are not yet sufficient for implementation, avoiding the inclusion of raw assumptions directly in the official specification.

## Known Information

- Artifact Scanner is a backend component used to scan evidence artifacts in the repository and generate an Artifact Inventory by ticket.
- The main scope is `docs/changes/<TICKET>/`, including the following artifacts: `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `report.md`, `blackbox-testcases.md`.
- The additional scope is a fixed set of files in `docs/maintenance/phase0/`, but only basic metadata is scanned; content is not parsed.
- The Scanner does not parse Markdown, does not collect Git/PR/CI metadata, does not calculate KPIs, and does not perform traceability matching.
- The Scanner must support `need_parse` for handoff to the parser.
- The repository is the SSOT; the DB only stores scan metadata and derived data, and does not store full Markdown text solely for parser usage.
- The DB scope has been confirmed by the user to use only the tables in `V4__init_shema_v2.sql`.
- V4 already has suitable tables for reuse: `tbl_dim_repository`, `tbl_dim_ticket`, `tbl_dim_phase`, `tbl_dim_artifact_type`, `tbl_source_connector`, `tbl_connector_run`, `tbl_fact_artifact_snapshot`.
- `tbl_fact_artifact_parsed_section` belongs to the parser and is not directly part of Artifact Scanner.
- V4 has already seeded artifact types for ticket artifacts and `.claude/*`, and the current implementation also has a fixed set of phase0 artifact types.

## Undetermined Points

- `tbl_connector_run.records_read` and `records_written` need to be clearly described in the Phase 3 technical design, but they are no longer blockers for Phase 1.
- The mechanism for preserving `branch/ref` so that the parser can re-read the original file will be reflected in the Phase 3 technical design, based on the request/run context.

## Expected Risks

- The scanner scope can easily expand into parser responsibilities if the boundary is not clearly finalized in `spec-pack`.
- If `tbl_fact_artifact_snapshot` is kept as-is without adding practical scan metadata, the scanner test UI and operations may lack sufficient debugging information.
- If the scanner is allowed to store full Markdown content, it will violate the Metadata First direction and distort the role of the repository as the SSOT.
- If `phase0` artifact types are not seeded in V4, the scanner will have to hard-code or temporarily map them, reducing extensibility.
- If the auto-create behavior for a minimal ticket when encountering an unknown ticket is not clearly reflected in the API/UI, Data Ops may find it difficult to distinguish real tickets from internal placeholders.
- If the scanner test API/view is not finalized early, Phase 3 may complete the backend but still be difficult to review or operationally test.

## What AI Needs to Investigate

- Review the `_ticket-template` to ensure that `sources.md`, `00_brainstorm.md`, and `spec-pack.md` follow the standard internal structure.
- Compare the raw requirements, database, and wireframe for ARTIFACT-SCANNER to consolidate them into the canonical specification.
- Compare the V4 schema to determine which tables the scanner uses and what it should actually update.
- Confirm the As-Is state of the old source: how much the scanner and parser responsibilities are currently mixed, only to describe the current state, not to use it as the standard for the new design.
- Define the minimum contract between the scanner and parser.
- Define the minimum contract between the scanner backend and the scan-result API/manual test view.

## What Humans Need to Ask

- How `tbl_connector_run.records_read` and `records_written` will be defined in terms of implementation units.
- Whether the parser will be triggered immediately after scanning in the same flow, or whether the scanner will only mark `need_parse` for another batch process to handle.

## Conditions Under Which Implementation Is Not Permitted

- Phase 3 must not start until it is clearly finalized whether the scanner stores full content or not; the current answer must be no.
- Implementation must not be based on legacy tables before V4.
- Parser logic must not be merged into Artifact Scanner.
- The scanner scope must not be expanded to `.claude/*`, Git metadata, PR metadata, or CI metadata in this ticket.
- `CHANGED_FILES_SCOPED` must not be finalized as a mandatory part of MVP v1 in this ticket.
- The API/view must not be finalized until the client goal is agreed to be only supporting scanner testing/operations.