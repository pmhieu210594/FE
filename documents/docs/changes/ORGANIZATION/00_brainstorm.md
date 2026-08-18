# 00_brainstorm

**Ticket ID**: ORGANIZATION   
**Create date**: 2026-06-09  
**Author**: nk_trung       
**Update date**: 2026-06-09  

## Purpose

Prepare the Phase 1 investigation notes for the Organization Management ticket before promoting confirmed content into `spec-pack.md`.

This brainstorm file is not the single source of truth. Confirmed specification is promoted to:

```text
docs/changes/ORGANIZATION/spec-pack.md
```

## Known Information

- The system supports `ja/en/vi`; BE returns message keys and FE is responsible for translating messages.

- Organization Management is a new administration screen.
- Scope is limited to CRUD-only Organization management.
- Required user flows are list, search, status filter, create, detail, edit, and soft delete.
- Out of scope includes Customer, Project, Repository, Team/Member management, role/permission management UI, dashboard/KPI/summary cards, evidence collection, connector configuration, artifact analysis, bulk import/export, multilingual Organization names, and a separate display code.
- Organization code is required, editable after creation, and system-wide unique.
- Organization name is required and system-wide unique.
- Organization name maps to DB column `name_masked` in the current schema/design.
- Deleting an Organization is a soft delete, not physical delete.
- Soft-deleted Organizations are excluded from the default list and cannot be edited.
- Requirement expects create/update/soft delete operations to be logged with actor, action, target, timestamp, result, and traceId.
- Existing DB table `tbl_dim_organization` exists but lacks some required columns.
- No Organization-specific BE controller, use case, repository, DTO, FE route, FE page, or tests were found in the source sections checked.

## Undetermined Points

- Exact permission mapping between existing application roles (`ADMIN`, `EDITOR`, `VIEWER`) and Organization-specific permissions.
- Exact soft-delete endpoint style: `DELETE` versus `PATCH`.
- Exact maximum length and validation rule for `description`.
- Exact post-create navigation: Organization Detail or Organization List.
- Optimistic locking is required and will use numeric `version`.
- Whether unique checks must include soft-deleted records forever, or whether reuse after soft delete should be allowed in future.
- Whether there is existing production data requiring manual review before `organization_code` backfill and unique index creation.

## Expected Risks

- **Contract risk**: FE/BE Organization DTO and error response mapping are not implemented yet.
- **DB migration risk**: `organization_code` is required but the existing table already exists, so backfill and duplicate checks are needed before `NOT NULL` and unique indexes.
- **Permission risk**: Raw requirement defines Organization-specific permissions, but current source shows broad application roles; incorrect mapping can expose Create/Edit/Delete actions.
- **Soft-delete risk**: Need to ensure no physical delete, no editing of deleted records, and default list excludes deleted records.
- **Audit/logging risk**: Requirement asks for operation logging, but current exact audit mechanism is not confirmed from source.
- **Naming risk**: Business field "Organization Name" maps to `name_masked`, which could be misunderstood during implementation.
- **Child-data risk**: Requirement says soft-deleted Organizations cannot be used to create new child data, but child management is out of current scope. This needs at least future validation/API consideration.

## What AI Needs to Investigate

For Phase 1, AI already checked the minimum source needed for As-Is/impact:

- Raw requirement, DB design, and wireframe.
- Template structure for `sources.md`, `00_brainstorm.md`, and `spec-pack.md`.
- Architecture and standards relevant to FE/BE/DB/security/testing.
- Existing BE migration for `tbl_dim_organization`.
- Existing BE REST/error/security patterns.
- Existing FE API/router/page/UI component patterns.

For Phase 3, AI should further inspect:

- Domain/application/persistence package patterns for adding a new CRUD use case.
- MyBatis mapper conventions.
- Existing enum/type handling for `record_status`.
- FE route/layout/page integration policy.
- Testing utilities and build commands.

## What Humans Need to Ask

- Which user roles/authorities correspond to Organization View/Create/Update/Delete/Admin?
- Should soft-deleted Organizations block code/name reuse permanently?
- Which soft-delete route is preferred for API consistency?
- What is the maximum accepted description length on FE and BE?
- After create success, should the UX navigate to detail or back to list?
- Optimistic locking has been confirmed: use numeric `version` for Organization update conflict detection.
- Is there existing environment data requiring manual backfill review before applying DB constraints?

## Conditions Under Which Implementation Is Not Permitted

Implementation should not begin if any of the following remain unresolved:

- No decision on permission mapping for Create/Edit/Delete actions.
- No migration policy for existing `tbl_dim_organization` data and duplicate handling.
- No final decision on soft-delete endpoint contract.
- No FE/BE request/response DTO contract for list/detail/create/update/delete.
- No decision on whether description has a concrete length limit.
- No acceptance of risk if audit logging mechanism is not yet designed.


## Human Clarifications Received on 2026-06-09

- Only role `ADMIN` can access the Organization Management screen and perform Organization operations.
- Soft delete endpoint must be `PATCH /api/v1/organizations/{id}/delete`.
- `description` maximum length is 500 characters.
- After successful create, navigate back to Organization List.
- Optimistic locking is required; Phase 3 must define the exact token/mechanism.
- Soft-deleted records do not block reuse of Organization code/name.
- No real staging/production data review is needed before migration.
- Dedicated audit log implementation is out of scope for this release.
- Customer/Project/Repository child-data flows are cascade-soft-deleted in this release; restore is not supported.

## Phase 3 Carry-over After Clarification

- Define FE/BE contract details for numeric `version` optimistic locking.
- Define DB partial unique indexes using `deleted_at IS NULL`.
- Define Organization i18n message keys and store translations under `public/locales/{en,ja,vi}/locale.json` for `ja/en/vi`.
