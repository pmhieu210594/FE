# Source Availability

**Ticket ID**: REPOSITORY-CRUD  
**Update date**: 2026-06-19

## Confirmed

- Repository CRUD is not yet implemented as live FE/BE source, so this ticket starts from planning artifacts and adjacent feature patterns.
- `tbl_dim_repository` is the authoritative storage target for the feature.
- `project_alias` for Repository responses is expected to be joined from `tbl_dim_project` by `project_id`, not supplied by FE.
- Existing platform contracts use raw DTO success responses and `ErrorResponse` failures.
- Soft delete is the intended delete behavior; default list responses must exclude deleted rows.
- The FE already has matching admin CRUD patterns in `ProjectPage`, `OrganizationPage`, and `CustomerPage`.
- The BE already has matching thin-controller / service / adapter patterns in `ProjectController`, `OrganizationController`, and related use cases.
- The repository legacy domain model exists only as background context.

## Partial

- Repository-specific DTO shape is only partially confirmed from spec, migration, and legacy domain model.
- Permission naming is unresolved; the spec records it as an open issue.
- Deleted-row detail visibility is documented in the spec, but the implementation should still stop if the business rule changes.
- Raw repository URL display versus AES-256-GCM persistence is specified, but the final UI wording still needs confirmation if product decides to change labels.
- `project_alias` display is expected to follow the same DB-joined source-of-truth pattern as Project list/detail screens.
- BE and FE test coverage exists for adjacent features, but Repository-specific tests are not yet present.

## Missing

- Repository controller, service, port, adapter, mapper, and request/response DTO implementations.
- Repository FE page, route registration, API helper, locale keys, drawer flow, and unit/E2E tests.
- Repository-specific BE web tests, service unit tests, and DB integration tests.
- A fresh repository-specific contract test suite.
- Any batch/job/event processing for Repository CRUD.

## Out of Scope

- Restore flow.
- Bulk delete or bulk update.
- Import/export.
- Audit history UI.
- Any unrelated Project, Organization, Customer, Team, Role, auth, webhook, or connector work.
- Editing committed migrations as part of this documentation phase.

## Evidence Summary

- `docs/changes/REPOSITORY/spec-pack.md` defines scope, AC, validation, and soft-delete expectations.
- `docs/changes/REPOSITORY/context.md` confirms the source surface and example patterns to reuse.
- `docs/changes/REPOSITORY/ticket-rules.md` forbids code implementation in this phase and preserves the current contract assumptions.
- `docs/architecture/route-api-map.md`, `service-layer-map.md`, and `fe-be-contract-map.md` confirm the platform patterns and current gaps.
- `EDCAP_BE/src/main/resources/db/migration/V130__repository_management.sql` confirms the repository table shape and active-row uniqueness strategy.
- `EDCAP_FE/src/pages/ProjectPage.tsx`, `OrganizationPage.tsx`, and `CustomerPage.tsx` confirm the FE CRUD pattern baseline.
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` confirms the thin-controller pattern baseline.
