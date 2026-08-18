# 00_brainstorm

**Ticket ID**: REPOSITORY-CRUD  
**Create date**: 2026-06-19  
**Author**: Codex  
**Update date**: 2026-06-19

## Purpose

Create a single, testable specification source for Repository CRUD and separate confirmed facts from unresolved intent.

## Known Information

- The ticket requests list, create, detail, update, and soft delete for Repository.
- Validation must exist on both FE and BE.
- Soft delete should hide records from default lists while still allowing detail display when required.
- Permission checks must occur on the backend, not only via disabled UI controls.
- Current codebase already uses a consistent CRUD pattern for other managed entities.
- The authoritative repository table is `tbl_dim_repository`.
- `project_alias` should be joined from `tbl_dim_project` by `project_id`, not taken from FE input or cache.
- Repository URLs are displayed raw in the UI and stored in the database as AES-256-GCM encoded values.

## Undetermined Points

- Whether Repository names are unique per project, per customer, or globally.
- Which fields are editable on update versus create.
- Whether deleted Repository records remain detail-viewable.
- Whether list screens must exclude deleted rows by default only or always.

## Expected Risks

- The requirement text contains mixed Project/Repository terminology and several stale field names.
- There is no current Repository CRUD source to copy behavior from.
- If contract assumptions are wrong, FE and BE may diverge immediately at implementation time.
- Soft-delete and uniqueness semantics can easily become inconsistent without one authoritative spec.

## What AI Needs to Investigate

- Confirm current route and error conventions from architecture and standards.
- Confirm DB naming, PK, timestamp, and soft-delete conventions from schema docs and migrations.
- Confirm FE API helper and CRUD screen patterns from existing Project, Organization, and Customer features.
- Confirm whether any hidden or unlisted Repository implementation exists in source.

## What Humans Need to Ask

- What is the exact business meaning of `repo_name_masked` beyond the display label?
- Is detail view for soft-deleted records required or optional?
- Which role(s) can access Repository CRUD actions?

## Conditions Under Which Implementation Is Not Permitted

- Schema target remains ambiguous.
- Permission model is not confirmed.
- Duplicate rule scope is not confirmed.
- Required API response shape differs from current architecture standards and has not been approved.
