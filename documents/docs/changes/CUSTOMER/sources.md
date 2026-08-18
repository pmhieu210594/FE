# Sources

**Ticket ID**: CUSTOMER     
**Create date**: 2026-06-09  
**Author**: nk_trung  
**Update date**: 2026-06-09  

## Ticket / Issue

| source | link/path | status | notes |
|---|---|---|---|
| Ticket body / Phase 1 requirement | Conversation dated 2026-06-09 | Read | User requested applying Phase 1 to Customer, with artifacts created in Vietnamese and a structure similar to the template. |
| Human clarification - Customer raw input | Conversation dated 2026-06-09 | Read | Raw `requirement.md` and `wireframe.md` must be concise like Organization; details move to `spec-pack.md`; raw requirement AC increased to 14; add `database_design.md`. |
| Human clarification - Organization parent rule | Conversation dated 2026-06-09 | Read | When creating/editing Customer, the Organization dropdown must not display deleted/disabled Organizations; Customers belonging to deleted/disabled Organizations must not appear in Customer List. |
| Organization Phase 1 decisions reused | `docs/changes/ORGANIZATION/spec-pack.md` / prior Phase 1 output | Used as convention | Apply the same conventions where appropriate: `ADMIN` only, non-ADMIN logout to login, BE returns `messageKey`, FE translates `ja/en/vi`, soft delete via `PATCH`, numeric `version` optimistic locking. |
| Ticket identifier | `docs/changes/CUSTOMER/` | Inferred from user request | Ticket ID is `CUSTOMER`. |

## Requirement / Design Documents

| source | path | status | confidence | notes |
|---|---|---|---|---|
| Requirement - Customer Management | `docs/changes/CUSTOMER/raw/requirement.md` | Created/read | high | Vietnamese raw requirement for CRUD Customer, concise scope, 14 ACs, active/non-soft-deleted parent Organization rule. |
| Wireframe - Customer Management | `docs/changes/CUSTOMER/raw/wireframe.md` | Created/read | high | Vietnamese raw wireframe for Customer List, Create/Edit, Detail, Delete confirmation, Empty State. |
| Database Design - Customer Management | `docs/changes/CUSTOMER/raw/database_design.md` | Created/read | high | Vietnamese raw DB design for `tbl_dim_customer`, relation with Organization, soft delete, unique alias per Organization, migration checklist. |
| Overall requirement for SDD Evidence platform | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Read | high | Confirms that administration functions need to manage Organization, Customer, Project, Repository, Team, and the `Organization → Customer → Project → Repository` model. |
| Core Phase 1 procedure | `21_SDD_1st-Step-Pack_02_Cu-the-thu-tuc_Core_Ver.04_Vietnamese.md` | Read | high | Defines Phase 1 outputs as `sources.md`, `00_brainstorm.md`, `spec-pack.md`; requires separating assumptions, open issues, and human decisions. |
| Ticket template - sources | `docs/standards/templates/_ticket-template/sources.md` | Read | high | Template structure for this file. |
| Ticket template - 00_brainstorm | `docs/standards/templates/_ticket-template/00_brainstorm.md` | Read | high | Template structure for brainstorm. |
| Ticket template - spec-pack | `docs/standards/templates/_ticket-template/spec-pack.md` | Read | high | Template structure for Spec Pack, including section `## 8. Examples` with `8.1 Normal Case`, `8.2 Error Case`, `8.3 Boundary Case`. |
| Organization Phase 1 Spec Pack | `docs/changes/ORGANIZATION/spec-pack.md` / generated Phase 1 artifacts | Referenced | medium | Used to keep style and convention similar to Organization for Customer. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| BE DB migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Relevant part read | Confirm `tbl_dim_customer`, `tbl_dim_organization`, `tbl_dim_project`, and existing `record_status`. |
| Current Customer table | `tbl_dim_customer` in the existing migration | Read | Confirm existing columns: `customer_id`, `organization_id`, `customer_alias`, `classification`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`; unique constraint `uq_customer_alias_per_org`. |
| Current Organization table | `tbl_dim_organization` in the existing migration | Read | Confirm Organization is Customer's parent; Organization Phase 1 already required soft-delete metadata and `version`. |
| Current Project table | `tbl_dim_project` in the existing migration | Read | Confirm Project has an FK to Customer, so Customer soft delete must cascade through the child tree. |
| FE route/auth source | `EDCAP_FE/src/router.tsx`, `docs/architecture/entrypoint-map.md` | Read/referenced | Confirm language-first route and Login page route `/:lang/login`. |
| FE i18n resources | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Read/referenced | Confirm FE translation resource location. |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | Read/referenced | Confirm existing auth/current user and error/trace behavior patterns. |
| Customer-specific BE/FE implementation | BE/FE source tree | Not found | No specific Customer controller/use case/repository/page/route/i18n/test exists yet. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE architecture/unit tests | `EDCAP_BE/src/test/java/...` | Available | Test framework/reference style exists, but there are no Customer-specific tests yet. |
| FE tests | `EDCAP_FE/src/__ tests __/README.md` and package config | Partially available | FE test stack/reference exists, but there are no Customer-specific tests yet. |
| Customer-specific tests | BE/FE source trees | Not available | A test plan must be created in Phase 3 and implemented in Phase 5/6. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| External Web / Office / PDF | N/A | Not used | No web/office/pdf source is needed for Phase 1 Customer. |

## Excluded Sources

| source/path | reason |
|---|---|
| `.env`, credentials, keys, production logs | Excluded for safety/security; do not read or copy raw secrets/PII/credentials/logs. |
| `.git/` detailed history | Not needed for Phase 1; history analysis is out of scope. |
| `node_modules`, `target`, coverage detail, generated build output | Not needed for Phase 1; high noise. |
| Full source tree outside relevant architecture/DB/template files | Phase 1 only needs enough information to determine As-Is/To-Be; detailed impact analysis belongs to Phase 3. |

## Source Limitations

- Raw Customer requirement/wireframe/database design exists but is raw input, not final implementation design.
- Source DB confirms `tbl_dim_customer` already exists, but it lacks `deleted_at`, `deleted_by`, and `version` if soft-delete metadata and optimistic locking are applied.
- Existing unique constraint `uq_customer_alias_per_org` is a normal unique constraint on `(organization_id, customer_alias)`; if alias reuse after soft delete is allowed, it must be replaced with a partial unique index using `deleted_at IS NULL`.
- Customer-specific BE API/use case/repository/mapper, FE route/page/API client/i18n keys, and tests do not yet exist.
- No clear enum/master for `classification` has been found in source; raw input uses `INTERNAL` / `EXTERNAL` as initial candidates.
- This phase does not run build/test/lint because it is only Phase 1 investigation/specification.

## Assumptions from Sources

- `CUSTOMER` is the ticket ID because the user requested creating raw/Phase 1 for Customer.
- Customer is master data under Organization, based on the overall requirement and existing DB relationship.
- Customer Management applies conventions similar to Organization: `ADMIN` only, non-ADMIN logout to login, direct BE API returns `403 Forbidden`.
- Customer soft delete uses `PATCH /api/v1/customers/{customerId}/delete`, similar to Organization.
- Customer uses numeric `version` for optimistic locking because it is CRUD master data with update/delete.
- Customer alias is unique within the same Organization, case-insensitive, only for records not soft deleted.
- The Organization dropdown in create/edit only displays active/non-soft-deleted Organizations.
- Customer soft delete should cascade through the child tree to avoid leaving descendant records active after the parent is deleted softly.

## Human Confirmation Required

There are no remaining Phase 1 blocking questions before moving to Phase 3. The following points need Phase 3 mapping to concrete source:

| ID | item | status | note |
|---|---|---|---|
| HC-CUSTOMER-1 | Organization dropdown only displays active/non-deleted Organizations. | Decided | User clarified. |
| HC-CUSTOMER-2 | Customer List only displays active/non-soft-deleted Customers. | Decided | User clarified. |
| HC-CUSTOMER-3 | Raw requirement/wireframe remains concise like Organization. | Decided | User clarified. |
| HC-CUSTOMER-4 | Raw requirement uses around 14 ACs. | Decided | User clarified. |
| HC-CUSTOMER-5 | Include `database_design.md` for Customer, with structure similar to Organization. | Decided | User clarified. |
| HC-CUSTOMER-6 | Exact class/file/migration/test names. | Phase 3 task | Not a Phase 1 blocker. |
