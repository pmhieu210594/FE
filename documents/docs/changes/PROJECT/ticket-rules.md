# Ticket Rules:

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16

## Must Follow

- Do not add specifications not included in `docs/changes/PROJECT/spec-pack.md`.
- Ambiguous points discovered later must be returned as Open Issues instead of guessed into the implementation.
- Before implementation, read the target source and existing tests.
- Follow existing repo patterns unless the ticket explicitly approved a Project-specific deviation.
- Do not reuse obvious errors, vulnerabilities, or known stale doc assumptions.
- Check for empty strings, nulls, trim behavior, duplicates, and case-insensitive comparisons.
- Business code values should come from enum/constant/master data instead of scattered magic strings.
- Do not export secrets or PII to logs.
- Use existing `tbl_dim_project`; do not rename, recreate, or replace it.
- Use existing `tbl_project_team` for Project-Team sync; do not reintroduce direct Team ownership by `project_id`.
- Project request contracts do not use `version`.
- Project soft delete uses `PUT /api/v1/projects/{id}/delete`.
- FE must use `EDCAP_FE/src/lib/api.ts` typed endpoint helpers for new Project API calls.
- FE must not use direct `fetch` in Project React components.
- BE must use standard `ErrorResponse` / `GlobalExceptionHandler` patterns.
- Soft delete only; never physically delete Project rows.
- `project_type` is free-text nullable user input; trim it and normalize blank/whitespace-only values to `null`.
- Keep BE hexagonal layering: web -> application -> domain/ports, infrastructure implements ports; web must not import infrastructure.
- Phase 2 must only produce context/rules/planning/skeleton artifacts; no source implementation now.

## Must Not Do

- Do not implement Project CRUD source code in Phase 2.
- Do not add `version` to create/update/delete request DTOs for Project.
- Do not use `PATCH /api/v1/projects/{id}/delete` or `DELETE /api/v1/projects/{id}` for Project delete.
- Do not physically delete Project rows or `tbl_project_team` rows as the user-facing delete behavior.
- Do not invent a separate permission-role model apart from the approved role-based direction tied to `tbl_dim_role`.
- Do not change the semantics of `project_type` free-text nullable behavior or `riskLevel` severity behavior outside the approved spec.
- Do not edit committed migrations `V4__init_shema_v2.sql`, `V120__project_management.sql`, or `V140__team_management.sql`.
- Do not introduce batch/job/import/export/restore behavior in this ticket.
- Do not copy governance optimistic-locking assumptions from Organization/Customer/Team into Project without a spec change.
- Do not copy non-standard error-body patterns from older admin endpoints.

## Stop / Ask Conditions

- Stop if later source implementation shows `tbl_dim_role` is not sufficient to encode the intended Project authorization rule and a broader auth design is needed.
- Stop if the Team runtime/schema logic conflicts with `tbl_project_team` as the approved Project-Team source of truth.
- Stop if a later requirement tries to reintroduce enum/master-data semantics for `project_type` without a ticket/spec change.
- Stop if a future requirement tries to add optimistic locking or a `version` field back into Project without changing the ticket spec.
- Stop if a solution requires renaming or recreating `tbl_dim_project`, `tbl_project_team`, `tbl_dim_customer`, `tbl_dim_team`, or `tbl_dim_role`.

## Review Focus

- Scope remains limited to Project Management.
- Project delete route is `PUT /api/v1/projects/{id}/delete`.
- No `version` is introduced anywhere in the Project request contract.
- Project-Team sync is implemented through `tbl_project_team`.
- Role-based authorization is enforced in BE and aligned with the approved `tbl_dim_role` direction.
- Duplicate alias checks follow V120 active-row normalized uniqueness semantics.
- `project_type` is treated as free-text nullable and `riskLevel` alone continues to follow the approved `severity_level` value set.
- FE uses `lib/api.ts` and existing governance/common component patterns.
- Error responses keep standard shape and traceId behavior.
- Stale docs about error envelopes or governance defaults are not copied into Project implementation blindly.

## Test Focus

- Phase 2 only creates skeleton/test planning artifacts.
- Later BE/API/DB tests must cover list/detail/create/update/delete, duplicate alias checks, Team sync, role-based authorization, soft delete, and migration/index behavior.
- Later FE tests should cover route access, list/filter/form/delete behavior, localized error handling, and Team assignment flows.
- Later black-box tests must include normal, error, boundary, duplicate, unauthorized, deleted-state, and reload/back behavior.
