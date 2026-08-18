# Ticket Rules:

**Ticket ID**: ORGANIZATION       
**Create date**: 2026-06-10       
**Author**:  nk_trung     
**Update date**: 2026-06-10  

## Must Follow

- Do not add specifications not included in the spec-pack.
- Ambiguous points must be returned as Open Issues.
- Before implementation, read the target source and existing tests.
- Follow existing patterns.
- Do not reuse obvious errors, vulnerabilities, or existing SonarLint violations.
- Check for full-width numbers, half-width numbers, empty strings, nulls, digits, and precision.
- Business code values ​​should be in enum/constant/master format instead of magic numbers.
- Do not export secrets/PII to logs
- Use existing `tbl_dim_organization`; do not rename, recreate, or replace it with another table name.
- When schema changes are needed later, add a new Flyway migration that only adds/updates required columns/indexes while preserving existing table identity.
- Organization name maps to existing column `name_masked`; do not rename `name_masked` in this ticket.
- Organization status values are `ACTIVE` and `DELETED` from existing `record_status`; `All` is a UI/filter value only.
- Use ADMIN-only authorization for every Organization screen/API operation.
- FE authenticated non-ADMIN access to the Organization screen must logout and redirect to `/:lang/login`.
- BE direct non-ADMIN API access must return HTTP `403 Forbidden` with standard error shape/message key, not HTTP 200 with an error map.
- BE must use standard `ErrorResponse`/`GlobalExceptionHandler` patterns. For current contract, treat `ErrorResponse.message` as the i18n key unless a later contract explicitly adds `messageKey`.
- Use FE translations from `public/locales/{en,ja,vi}/locale.json`; do not hard-code user-facing Organization text.
- Use `EDCAP_FE/src/lib/api.ts` typed endpoint helpers for new Organization API calls.
- Keep BE hexagonal layering: web -> application -> domain/ports, infrastructure implements ports; web must not import infrastructure.
- Use soft delete only; set `status='DELETED'` and delete metadata; never physically delete Organization rows.
- Use numeric optimistic locking `version`; update/delete require version and stale version returns HTTP `409 Conflict`.
- Cascade soft delete to Customer/Project/Repository/Team/Ticket child data; do not add restore flow for deleted Organization.
- Phase 2 must only produce context/rules/planning/skeleton artifacts; no source implementation or FE test implementation now.

## Must Not Do

- Do not implement Organization CRUD source code in Phase 2.
- Do not implement Customer Management in this ticket/phase.
- Do not add dashboard/KPI/statistics/bulk import/export/restore-deleted features.
- Do not rename `tbl_dim_organization`, `tbl_dim_customer`, or `name_masked`.
- Do not edit existing committed migration `V4__init_shema_v2.sql`; later implementation must add a new versioned migration.
- Do not use physical `DELETE FROM tbl_dim_organization` for the delete action.
- Do not introduce direct `fetch` calls in Organization React components.
- Do not rely on `routerLinks()` for Organization because its maps are currently empty.
- Do not copy `AdminController`'s current `Map.of("error", "ADMIN role required")` pattern. It is documented as a known contract violation.
- Do not assume Organization-specific classes/methods already exist. They currently do not.
- Do not add audit-log table/storage implementation; dedicated audit log is out of scope.
- Do not add FE test code now; only skeleton/test plan artifacts are required in Phase 2.

## Stop / Ask Conditions

- Stop if a later implementation requires renaming or recreating `tbl_dim_organization`.
- Stop if Product/Tech Lead changes the permission rule away from ADMIN-only.
- Stop if BE contract is changed from `ErrorResponse.message` i18n key to a new `messageKey` field without updating FE contract and docs.
- Stop if existing data/backfill would make `organization_code NOT NULL` unsafe; ask for DBA/Tech Lead decision.
- Stop if a requirement appears to add restore support for deleted Organization or children; restore is out of scope.
- Stop if locale key naming conflicts remain unresolved before implementation, especially `Name.Eequired` vs `Name.Required`.

## Review Focus

- Scope is limited to Organization Management.
- No table rename/recreate; migration adds only required columns/indexes later.
- ADMIN-only behavior is enforced in both FE and BE.
- Non-ADMIN direct API returns 403; no 200 error body.
- Soft delete updates status/delete metadata/version and preserves row.
- Optimistic locking increments version exactly once on successful update/delete.
- Duplicate checks/indexes are case-insensitive and apply only where `deleted_at IS NULL`.
- i18n keys are consistent across BE errors, FE use, and locale files.
- Japanese/Vietnamese/English text is valid UTF-8 and free from obvious typos.
- No layer violation against `LayerEnforcementTest`.
- No direct use of infrastructure from web/application layers.
- No secrets/PII in logs or artifacts.

## Test Focus

- Phase 2 only creates skeleton/test planning artifacts.
- Later BE tests must cover validation, duplicate checks, soft delete, optimistic locking, 403 authorization, and migration/index behavior.
- Later FE tests should cover list/search/filter/form/i18n/permission behavior, but FE test implementation is deferred for now by user decision.
- Later black-box tests must include normal, error, boundary, permission, deleted-state, duplicate, non-existing ID, session-expired, and double-submit/stale-version cases.
