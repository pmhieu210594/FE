# Ticket Rules:

**Ticket ID**: ARTIFACT-SCANNER   
**Create date**: 2026-06-16    
**Author**:  nk_trung    
**Update date**: 2026-06-16    

## Must Follow

- Use `docs/changes/ARTIFACT-SCANNER/spec-pack.md` as the only canonical specification.
- Implement Artifact Scanner as a metadata inventory component only.
- Use only the tables defined in `V4__init_shema_v2.sql`.
- Use `tbl_fact_artifact_snapshot` as the main scan result table.
- Use `tbl_connector_run` to record scan lifecycle.
- Use `tbl_dim_artifact_type` to map file name/path to artifact type; do not hard-code business rules in many places.
- Add/seed Phase 0 artifact types in this ticket.
- Add the agreed snapshot columns: `size_bytes`, `scan_status`, `scan_message`, `need_parse`.
- Use `vw_artifact_inventory_current` as the read model for current inventory.
- Unknown ticket policy must be `auto-create minimal ticket`.
- The required scanner target files in MVP are: `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `report.md`, `blackbox-testcases.md`.
- Bộ file cố định trong `docs/maintenance/phase0/` là metadata-only trong ticket này.
- Parser must read the source file again from repository/path/ref; scanner must not store full Markdown content for parser.
- If a UI is needed for manual verification, keep it minimal and test-only.
- API calls must go through a client helper if one is used.
- Use i18n keys for client labels and messages when UI text is shown.
- Logs must not contain secrets, raw Markdown content, tokens, or unnecessary personal data.

## Must Not Do

- Do not parse Markdown sections inside Artifact Scanner.
- Do not sync Acceptance Criteria inside Artifact Scanner.
- Do not use legacy tables/mappers/repositories as the new design baseline.
- Do not create a new physical inventory table outside V4 just to represent current state.
- Do not store full artifact content in scanner DB tables.
- Do not include `.claude/*` in Artifact Scanner scope for this ticket.
- Do not include Git/PR/CI collector logic in Artifact Scanner.
- Do not prioritize `CHANGED_FILES_SCOPED` in MVP v1.
- Do not create client/BE contracts that depend on direct `fetch` or ad-hoc JSON shapes.
- Do not fail the whole run only because one ticket path maps to an unknown ticket.

## Stop / Ask Conditions

- Stop if source facts in V4 conflict with the spec-pack.
- Stop if a required V4 table/column is missing and no agreed migration path exists.
- Stop if a proposed implementation starts parsing Markdown in scanner scope.
- Stop if a design tries to reuse legacy persistence for scanner core logic.
- Stop if client placement cannot be reconciled with the current route/menu structure.
- Stop if a decision requires `CHANGED_FILES_SCOPED` as MVP-critical before upstream collector context is ready.

## Review Focus

- Scanner boundary vs parser boundary.
- Correct use of V4-only schema.
- Snapshot write/read consistency.
- Unknown ticket handling (`auto-create minimal ticket`).
- Correct required artifact coverage for all 8 files.
- Phase0 metadata-only behavior.
- No full content persistence.
- Correct read model via `vw_artifact_inventory_current`.
- Client/Data Ops view usability for manual verification.

## Test Focus

- Full scan with all 8 required artifacts present.
- Ticket-scoped scan with missing required artifacts.
- Unknown ticket path handling.
- Hash change leading to `need_parse = true`.
- Phase0 metadata-only scan.
- Current inventory view returning latest snapshot.
- Run trigger and run result display for manual verification.
