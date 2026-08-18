# Ticket Rules

**Ticket ID**: REPOSITORY-CRUD
**Create date**: 2026-06-19
**Author**: Codex
**Update date**: 2026-06-19

## Must Follow

- Keep `tbl_dim_repository` as the authoritative storage target.
- Do not rename `tbl_dim_repository` or switch to a new table name.
- Treat the legacy `Repository` domain model as background context only.
- Keep the API contract under `/api/v1/repositories`.
- Keep success responses raw DTOs or raw DTO lists.
- Use `ErrorResponse` + `GlobalExceptionHandler` for failures.
- Preserve `traceId` handling in logs and error responses.
- Use soft delete only; do not physically delete repository rows.
- Default list must exclude soft-deleted rows.
- Keep detail behavior for deleted rows aligned with the spec-pack decision.
- Repository name uniqueness is scoped to active rows in the same project.
- Use `EDCAP_FE/src/lib/api.ts` for all new FE API calls.
- Use `useAuth` / `logout` for auth-state handling in FE routes.
- Do not add direct `fetch` calls in FE pages/components.
- Keep BE hexagonal layering intact: web -> application -> domain, with infrastructure implementing ports.
- Do not introduce a restore flow in this ticket.
- Do not implement FE or BE source code in this Phase 2 documentation task.

## Must Not Do

- Do not implement Repository CRUD source code in this Phase 2 step.
- Do not implement Customer, Project, Team, or Role management here.
- Do not add dashboard, KPI, export, import, or audit UI features.
- Do not edit existing committed migrations as part of this documentation task.
- Do not change route style away from the platform `/api/v1/...` convention.
- Do not copy `AdminController`'s ad-hoc error-map pattern.
- Do not add a new API envelope contract for this ticket.
- Do not assume a `RepositoryController`, `RepositoryService`, or `RepositoryMapper` already exists.
- Do not rely on `routerLinks()` as an authoritative API map.
- Do not add audit-log storage/table integration.
- Do not invent `formItemNm`, `SEQNO`, master-data, or code-value mappings not proven by source.

## Stop / Ask Conditions

- Stop if a later implementation requires renaming `tbl_dim_repository`.
- Stop if the business rule for repository detail visibility after soft delete changes.
- Stop if the permission model is clarified and differs from the currently assumed admin-only pattern.
- Stop if the response shape changes from raw DTOs to an envelope.
- Stop if a later phase wants to replace the current soft-delete behavior with hard delete.
- Stop if the DB contract would require editing an already committed migration instead of adding a new one.

## Review Focus

- Current source evidence is enough to plan Repository CRUD, but not to implement it yet.
- The ticket must stay aligned with the established FE/BE/DB patterns from Project, Organization, and Customer features.
- `tbl_dim_repository` soft-delete indexes and active-row uniqueness rules must remain reflected in docs.
- Any unresolved permission naming or detail-visibility wording should remain documented as open items.

## Test Focus

- Phase 2 only prepares test skeletons and test planning artifacts.
- Later BE tests should cover list/detail/create/update/delete, validation, duplicate handling, soft delete, and error shape.
- Later FE tests should cover API helper shape, drawer/list interactions, and route/auth behavior.
- Later black-box tests should cover normal, duplicate, not-found, deleted-row, and permission scenarios.
