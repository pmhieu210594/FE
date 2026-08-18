# 00_brainstorm

**Ticket ID**: CUSTOMER     
**Create date**: 2026-06-09  
**Author**: nk_trung       
**Update date**: 2026-06-09  

## Purpose

Initial investigation notes for the **Customer Management** ticket in Phase 1.

The goal is to consolidate information from the raw requirement/wireframe/database design, the existing base source, and decisions already finalized from Organization, in order to create a `spec-pack.md` that is ready to move to Phase 3 Impact Analysis / Impl Plan.

This file is only a working note. The single source of truth for Phase 1 is `spec-pack.md`.

## Known Information

- Customer Management is a master data administration function.
- The scope is CRUD-only Customer, excluding dashboard/KPI/report/statistics.
- Customer is under Organization in the overall data model.
- The DB currently has `tbl_dim_customer` and an FK to `tbl_dim_organization`.
- The DB currently has `tbl_dim_project` with an FK to `tbl_dim_customer`, so soft deleting a Customer must cascade through the child tree.
- The raw Customer requirement/wireframe/database design has been created in Vietnamese.
- The raw requirement/wireframe must be concise, similar to Organization; contract/API/DB/test details should be placed in `spec-pack.md` and Phase 3.
- Customer List must display Customers that belong to active/non-soft-deleted Organizations.
- Create/Edit Customer requires selecting an Organization.
- The Organization dropdown in Create/Edit only displays active/non-soft-deleted Organizations.
- Soft-deleted Customers are not displayed in the default list.
- Deleting a Customer is a soft delete, not a physical delete.
- Only the `ADMIN` role can access Customer Management, following the convention from Organization.
- If a non-ADMIN attempts to access it, the FE logs out the user and redirects to the Login page `/:lang/login`.
- Direct BE API access from a non-ADMIN must still be rejected with `403 Forbidden`.
- The BE returns `messageKey` and optional `messageArgs`; the FE translates them in `public/locales/{en,ja,vi}/locale.json`.
- The soft delete endpoint uses `PATCH /api/v1/customers/{customerId}/delete`.
- Optimistic locking uses numeric `version`.
- Current `tbl_dim_customer` does not have `deleted_at`, `deleted_by`, or `version`.
- Current `tbl_dim_customer` has a normal unique constraint on `(organization_id, customer_alias)`.
- Customer-specific BE controller/use case/repository/mapper and FE route/page/API/i18n/test do not yet exist.

## Undetermined Points

- Exact FE route file/component/constant for Customer Management.
- Exact BE controller/use case/repository/mapper/DTO class names.
- Exact Flyway migration filename/version.
- Exact implementation strategy to replace the current unique constraint with a partial unique index.
- Exact list/value source for `classification`; initial candidates are `INTERNAL` / `EXTERNAL`.
- Exact cascade scope for Customer child data: the spec now expects soft delete to cascade through the child tree, and Phase 3 must map the concrete query/source.
- Whether a special view is needed to see deleted Customers; the current default scope is to not display them.

## Expected Risks

- If the parent Organization filter is implemented only on the FE, the API can still return data that violates the rule.
- The existing normal unique constraint may not support alias reuse after soft delete.
- Without adding `version`, optimistic locking cannot check conflicts.
- If the non-ADMIN guard is implemented only in the UI, direct API access may still be unauthorized.
- If cascade rules are implemented incorrectly, descendant Projects may remain visible after Customer soft delete.
- If the BE returns localized text instead of message keys, it will be inconsistent with `ja/en/vi` i18n.
- The scope may drift into Project/Repository/KPI/dashboard if it is not kept strictly CRUD-only.

## What AI Needs to Investigate

- Current FE router pattern and admin navigation to add the Customer Management route.
- Existing login/logout/session clear flow to use for non-ADMIN access behavior.
- FE i18n file structure under `public/locales/{en,ja,vi}/locale.json`.
- BE security role-check pattern for `ADMIN`.
- BE controller/use case/repository/MyBatis/DTO/error conventions.
- Current DB migration convention and how to alter/drop constraints/indexes in PostgreSQL/Flyway.
- Current `record_status` usage and classification usage in the source.
- Existing BE/FE test/style references to prepare the Phase 3 test strategy.

## What Humans Need to Ask

There are no remaining Phase 1 blocking questions. The following points should be reviewed in Phase 3 before implementation:

- Confirm the exact child-tree cascade scope for Customer soft delete.
- Confirm the official `classification` list if it differs from `INTERNAL` / `EXTERNAL`.
- Confirm whether a special screen/view is needed to see deleted Customers.
- Confirm whether alias reuse after soft delete is allowed, similar to Organization, if the business expects different behavior.

## Conditions Under Which Implementation Is Not Permitted

Implementation must not begin until Phase 3 is complete:

- Impact analysis for FE route/page/API client/i18n/logout guard.
- Impact analysis for BE controller/use case/repository/mapper/security/error handling.
- Migration plan for `deleted_at`, `deleted_by`, `version`, and a partial unique index using `deleted_at IS NULL`.
- Plan for handling the existing `uq_customer_alias_per_org`.
- Test plan for Organization parent filter, non-ADMIN logout/login redirect, optimistic locking conflict, duplicate alias, soft delete, and child Project active restriction.
