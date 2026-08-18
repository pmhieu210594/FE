# Ticket Rules

**Ticket ID**: ROLE  
**Feature**: CRUD Role Management  
**Phase**: Phase 2 - Ticket Context / Rules  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-12  
**Status**: Draft / Applies From Pack 26 And Phase 3

## Must Follow

- Use `EDCAP_BE/documents/docs/changes/ROLE/spec-pack.md` as the only canonical specification.
- Run Pack 26 A-6 before Phase 3 implementation.
- ROLE uses role-based RBAC; do not define separate action authorization labels.
- FE role-based display control is not security; BE must enforce role-based authorization per API/action.
- Use `tbl_dim_role` as the official table.
- Use logical delete per accepted decisions; physical hard delete, cascade delete, and restore are out of scope.
- Do not create new role seed data in this ticket.
- Use existing `ErrorResponse` convention; do not invent a new error shape.
- FE API calls must go through `EDCAP_FE/src/lib/api.ts`.
- FE user-visible strings must use i18n keys.
- BE must follow hexagonal layering: web -> application -> ports/domain -> infrastructure.
- MyBatis dynamic identifiers must be whitelisted.
- Do not log secrets, PII, credentials, tokens, or raw request/response bodies.

## Must Not Do

- Do not implement source code during Phase 2.
- Do not create or edit migrations during Phase 2.
- Do not create or edit executable test code during Phase 2.
- Do not edit CI/settings.
- Do not edit `01_raw-input.md` as a canonical requirement.
- Do not call `fetch` directly from ROLE components/hooks.
- Do not use no-op Redux CRUD/global actions as ROLE implementation.
- Do not introduce new Ant Design components.
- Do not assume `RoleController`, `RoleService`, `RoleMapper`, `RoleDto`, or FE role endpoint helpers already exist.
- Do not physically delete `tbl_dim_role` rows or bypass FK constraints.
- Do not read `.env*`, secrets, credentials, keys, or raw production logs.

## Stop / Ask Conditions

- Stop before implementation if artifact decisions conflict with source facts discovered in Phase 3.
- Stop if only FE or only BE source can be verified for a contract-sensitive item.
- Stop if implementation attempts to add restore.
- Stop if timestamp serialization prevents reliable local-timezone display.
- Stop if source behavior conflicts with `spec-pack.md`; record Open Issue or Human Decision Required.

## Review Focus

- Spec compliance against `spec-pack.md`.
- API/DTO/error/pagination/timestamp contract after Pack 26.
- Role-based authorization enforced by BE.
- FE role-based action visibility.
- Logical delete safety and FK preservation.
- Case-insensitive duplicate role name behavior.
- i18n keys and no hardcoded labels.
- No secrets/PII in logs or docs.
- Layering and ArchUnit compliance.

## Test Focus

- AC-1 through AC-22 from `spec-pack.md`.
- Validation: trim, blank, max length, case-insensitive duplicate.
- Role authorization allowed/denied cases.
- Logical delete, list/search exclusion, and FK preservation.
- Timestamp display as `DD/MM/YYYY HH:mm:ss` in user local timezone.
- i18n label key coverage.
- Contract tests for DTO/error/pagination shape.
