# Ticket Rules:

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung                    
**Update date**: 2026-06-10  

## Must Follow

- Do not add specifications not included in the `CUSTOMER/spec-pack.md`.
- Ambiguous points must be returned as Open Issues in later phases instead of silently deciding.
- Before implementation, read target source and existing tests again.
- Follow existing FE/BE/DB architecture patterns.
- Do not reuse obvious errors, vulnerabilities, or inconsistent patterns such as inline `200/403` ad-hoc error bodies.
- Check empty strings, nulls, max length, duplicate aliases, stale version, inactive/deleted Organization, and deleted Customer state.
- Business code values such as `INTERNAL`, `EXTERNAL`, `ACTIVE`, `DELETED` should be handled through enum/constant/master-like code, not scattered magic strings.
- Do not export secrets/PII/customer-sensitive data to logs.
- Use existing `tbl_dim_customer`; do not rename/recreate it.
- Use new migration for schema changes; do not edit existing `V4__init_shema_v2.sql` during implementation.
- Customer create/update must validate Organization is active/non-soft-deleted in BE.
- Customer list must exclude Customers under inactive/deleted Organizations.
- Soft delete only; no physical delete.
- Soft delete Customer must cascade to its full child tree under `tbl_dim_project`.
- Use optimistic locking with numeric `version` for update and soft delete once implemented.
- ADMIN-only access must be enforced in both FE and BE.
- FE non-ADMIN behavior: logout/clear session and redirect to `/:lang/login` as specified.
- BE non-ADMIN behavior: return `403 Forbidden`.
- BE messages must be translatable message keys or otherwise aligned with the agreed API error contract.
- FE locale updates must cover `en`, `ja`, and `vi`.

## Must Not Do

- Do not implement Organization Management as part of Customer.
- Do not implement Project/Repository list/detail in Customer detail.
- Do not implement Customer dashboard, KPI, statistics, import/export, restore, or physical delete.
- Do not add separate classification master/config UI.
- Do not call Customer-specific classes/methods as if they already exist; they are not in current source.
- Do not call `api.patch` in FE unless it is added/verified.
- Do not bypass `EDCAP_FE/src/lib/api.ts` with direct `fetch`/axios in Customer UI.
- Do not use inactive/deleted Organizations in Customer create/edit dropdown.
- Do not allow code duplicate globally in active scope; do not allow alias duplicate within the same active Organization scope.
- Do not rely only on FE filtering for security or data integrity.
- Do not modify connector sync, GitHub/Jira/CircleCI webhooks, evidence ingestion, or metrics flows.

## Stop / Ask Conditions

- Stop if `tbl_dim_customer` schema in the implementation source differs from the Phase 2 finding.
- Stop if exact Customer route must diverge from `/:lang/customers`.
- Stop if API error contract must diverge from reusing `message` as the translated key.
- Stop if the old unique constraint cannot be safely migrated to case-insensitive active-scope uniqueness.
- Stop if existing Customer data violates the future case-insensitive unique rule.
- Stop if Organization active/non-deleted source of truth is unavailable when implementing Customer.
- Stop if active Project detection rule is ambiguous because Project status values or deleted semantics differ.
- Stop if authorization pattern cannot produce standard `403 Forbidden` without inconsistent response shape.
- Stop if locale key convention remains mixed between `Pages.Customer.*` and lowercase `customer.*`.

## Review Focus

- Scope control: only Customer CRUD master data.
- Organization dependency: active/non-soft-deleted parent enforcement in FE and BE.
- Security: ADMIN-only route/API, no `200 OK` permission errors.
- API contract: endpoints, status codes, error message keys, traceId.
- DB migration: no table rename/recreate; safe soft-delete/version columns and partial unique index.
- Data correctness: active-scope, case-insensitive duplicate code globally and alias in same Organization.
- Operation: audit fields, traceability, rollback/migration safety.
- i18n: all user-facing messages translatable in `en/ja/vi`.

## Test Focus

- ADMIN can access Customer Management; non-ADMIN cannot.
- Default list excludes soft-deleted Customers and Customers under inactive/deleted Organizations.
- Search/filter by Organization, alias/name, classification, and status.
- Create requires active Organization and alias/name.
- Create/update rejects inactive/deleted Organization.
- Duplicate code anywhere is rejected case-insensitively for non-deleted Customers.
- Duplicate alias in same Organization is rejected case-insensitively for non-deleted Customers.
- Same alias in different Organization is allowed if valid.
- Alias reuse after soft delete is allowed.
- Edit deleted Customer is rejected.
- Soft delete cascades to child Projects and descendants.
- Stale version update/delete returns conflict.
- Message keys are translated in `ja/en/vi`.
- FE automated tests are not implemented in Phase 2; only skeleton/planning artifacts are prepared.
