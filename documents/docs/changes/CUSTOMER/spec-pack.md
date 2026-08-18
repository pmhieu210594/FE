# Spec Pack

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung                    
**Update date**: 2026-06-12  

## 1. Context / Purpose

Customer Management is a new administration function for maintaining Customer master data in the EDCAP platform.

The purpose of this ticket is to provide a Customer Management screen within a **CRUD-only** scope, allowing administrators to:

- View the Customer list.
- Search/filter Customers by Organization, customer code, name/alias, classification, and status.
- Create a new Customer under a valid Organization.
- View Customer details.
- Edit a Customer.
- Soft delete a Customer and cascade soft delete to its full child tree.

Customer is an entity under Organization. Therefore, this function must ensure that:

- When creating/editing a Customer, the Organization dropdown does not display disabled or soft-deleted Organizations.
- The BE must also enforce these rules, not only the FE filter.

This `spec-pack.md` file is the single source of truth for the Phase 1 output of the `CUSTOMER` ticket.

## 2. Scope

### 2.1. Within range

- Customer Management route/page in the administration area.
- Customer List.
- Search Customer by Customer code or alias/name.
- Filter Customer by Organization, classification, and status.
- Create Customer.
- Customer detail view.
- Edit Customer.
- Soft delete Customer after confirmation.
- Organization dropdown for create/edit only fetches active/non-soft-deleted Organizations.
- Customer List only displays Customers belonging to active/non-soft-deleted Organizations.
- Default Customer List only displays active/non-soft-deleted Customers.
- Required validation for Organization, Customer code, and Customer alias/name.
- Duplicate check for Customer code globally across all Organizations, case-insensitive, only for records not soft deleted.
- Customer code from soft-deleted Customers can be reused.
- Customer alias remains unique within the same Organization, case-insensitive, only for records not soft deleted.
- Optimistic locking using numeric `version` for update and soft delete.
- Permission rule: only role `ADMIN` can access Customer Management.
- If a non-ADMIN attempts to access Customer Management: the FE logs out the user and redirects to the Login page `/:lang/login`; direct BE API returns `403 Forbidden`.
- The BE returns `messageKey` and optional `messageArgs`; the FE translates them into `ja/en/vi` using `public/locales/{en,ja,vi}/locale.json`.
- DB migration considerations for existing `tbl_dim_customer`, including `deleted_at`, `deleted_by`, `version`, and a partial unique index.

### 2.2. Out of range

- Organization Management.
- Project Management.
- Repository Management.
- Team/Member Management.
- Role/Permission Management through a separate UI.
- Customer dashboard, KPI, score, summary card, or operational statistics.
- Evidence collection, Connector configuration, SDD artifact analysis.
- Bulk Customer import/export.
- Customer report/export.
- Multilingual Customer names/aliases.
- Physical deletion of Customer records.
- Project/Repository standalone management in Customer detail.
- Managing classification master/config through a separate UI.

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| Customer | Master data entity representing a customer belonging to an Organization. | Under Organization in the data model. |
| Organization | Parent entity of Customer. | Customer must belong to an active/non-soft-deleted Organization. |
| Customer Code | Business code of Customer. | Maps to DB column `customer_code`. |
| Customer Alias / Name | Display name/alias of Customer. | Maps to DB column `customer_alias`. |
| Classification | Customer classification. | This release uses `INTERNAL` / `EXTERNAL`; default `INTERNAL`. |
| Active Customer | Customer operating normally. | DB `status = 'ACTIVE'` and `deleted_at IS NULL`. |
| Deleted Customer | Customer that has been soft deleted. | DB `status = 'DELETED'`, has `deleted_at`; not displayed in default list. |
| Active Organization | Organization that can be used for Customer. | `status = 'ACTIVE'` and not soft deleted. |
| Soft delete | Logical delete by updating status/deleted metadata. | No physical `DELETE`. |
| Active-scope unique | Unique constraint applied only to records not soft deleted. | Use partial unique index `deleted_at IS NULL`. |
| Version | Numeric optimistic locking token. | `BIGINT NOT NULL DEFAULT 0`, incremented after successful update/delete. |
| Message Key | i18n key returned by BE. | FE translates in `public/locales/{en,ja,vi}/locale.json`. |
| Trace ID | Correlation ID for errors/logging. | Used for troubleshooting. |

## 4. As-Is

- There is currently no dedicated Customer Management screen in the FE.
- No Customer-specific FE route/page/component has been found in the checked source.
- No Customer-specific BE controller/API/use case/repository/mapper has been found in the checked source.
- FE has existing route/auth/i18n patterns:
  - The Login route according to architecture is `/:lang/login`.
  - The Admin route according to architecture is `/:lang/admin`.
  - i18n resources are under `EDCAP_FE/public/locales/{en,ja,vi}/locale.json`.
- BE has existing authentication/security/error/traceId patterns, but no Customer-specific permission mapping yet.
- DB table `tbl_dim_customer` already exists in `V4__init_shema_v2.sql` with:
  - `customer_id`
  - `organization_id`
  - `customer_alias`
  - `classification`
  - `status`
  - `created_at`
  - `created_by`
  - `updated_at`
  - `updated_by`
  - constraint `uq_customer_alias_per_org UNIQUE (organization_id, customer_alias)`
- `tbl_dim_customer` currently does not have:
  - `deleted_at`
  - `deleted_by`
  - `version`
- The DB has `tbl_dim_organization`, which is the parent table of Customer.
- The DB has `tbl_dim_project` with an FK to `tbl_dim_customer`, so Customer soft delete must cascade to its child Project tree and descendants.

## 5. To-Be

- Add Customer Management UI with list, search/filter, create, detail, edit, and soft delete confirmation.
- Add backend API and contract for Customer CRUD.
- Use the existing `tbl_dim_customer`; do not create a new Customer table.
- Customer must belong to a valid Organization.
- The Organization dropdown in create/edit only displays active/non-soft-deleted Organizations.
- BE create/update must reject if `organizationId` does not exist or the Organization is inactive/deleted.
- The default Customer List only displays active/non-soft-deleted Customers.
- Customer alias is unique within the same Organization, case-insensitive, only for Customers not soft deleted.
- Soft-deleted Customers do not block alias reuse within the same Organization.
- Soft delete by updating `status = 'DELETED'`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, and incrementing `version`, while cascade soft deleting the full child tree.
- Do not allow editing a soft-deleted Customer.
- Soft delete Customer must cascade to its full child tree under `tbl_dim_project` and descendants.
- FE logs out and redirects to the Login page if a non-ADMIN attempts to access Customer Management.
- BE returns message keys; FE translates them into `ja/en/vi` in `public/locales/{en,ja,vi}/locale.json`.

### 5.1. Customer child-tree cascade map

When Customer is soft deleted, the implementation must cascade soft delete through the following child-tree branches:

| branch | direct table | downstream tables / examples | note |
|---|---|---|---|
| Customer branch | `tbl_dim_project` | `tbl_dim_repository`, `tbl_dim_team`, `tbl_dim_ticket` | Direct child tree under Customer. |
| Project-scoped access branch | `tbl_auth_member_project_role` | `tbl_auth_member_access_scope` rows with `project_id` | Project-scoped authorization data should be deactivated with the project branch. |
| Repository branch | `tbl_source_connector` rows scoped by `project_id` / `repository_id` | `tbl_fact_pull_request`, `tbl_fact_commit`, `tbl_fact_ci_run`, `tbl_fact_test_run`, `tbl_fact_security_scan`, `tbl_fact_artifact_snapshot`, `tbl_fact_evidence_event` | Repository-linked operational/fact descendants follow the repository branch. |
| Ticket branch | `tbl_fact_ticket_phase_status`, `tbl_fact_artifact_snapshot`, `tbl_fact_acceptance_criteria` | `tbl_fact_review`, `tbl_fact_review_comment`, `tbl_fact_finding`, `tbl_fact_test_case`, `tbl_fact_ac_test_coverage`, `tbl_fact_security_finding`, `tbl_fact_exception`, `tbl_fact_ai_usage`, `tbl_fact_decision` | Ticket-linked operational/fact descendants follow the ticket branch. |
| Scope rows | `tbl_auth_member_access_scope` rows with `customer_id` | `project_id` / `repository_id` scoped rows under the same Customer | Scope rows should be disabled when any parent branch is soft deleted. |

## 6. Detailed specification

### 6.1. Business Rules

| ID | rule | source / note |
|---|---|---|
| BR-1 | Customer Management is CRUD-only. | Raw requirement/wireframe. |
| BR-2 | Only role `ADMIN` can access Customer Management and perform view/create/update/soft-delete. | Apply Organization convention. |
| BR-3 | If a logged-in non-ADMIN attempts to access Customer Management, the FE logs out and redirects to `/:lang/login`. | Apply Organization convention. |
| BR-4 | BE Customer API must reject direct access from non-ADMIN with `403 Forbidden`. | Security requirement. |
| BR-5 | Customer must belong to an Organization. | Raw requirement/database design. |
| BR-6 | The Organization dropdown in create/edit only displays active/non-soft-deleted Organizations. | User clarification. |
| BR-7 | BE create/update must validate that the Organization is still active/non-soft-deleted. | Not only FE filtering. |
| BR-8 | Customer List does not display soft-deleted Customers. | Raw requirement. |
| BR-9 | Default Customer List does not display Customers that have been soft deleted. | Raw requirement. |
| BR-10 | Customer code and alias/name are required. | Raw requirement/wireframe. |
| BR-11 | Customer code is unique globally across all Organizations, case-insensitive, only for records not soft deleted. Soft-deleted Customer codes may be reused. | New business code rule. |
| BR-12 | Customer alias is unique within the same Organization, case-insensitive, only for records not soft deleted. | Existing DB per-org unique + soft-delete policy. |
| BR-13 | Soft-deleted Customers do not block code reuse globally or alias reuse within the same Organization. | Consistent with active-scope unique. |
| BR-14 | This release uses `INTERNAL` / `EXTERNAL` for Classification; default `INTERNAL`. | Wireframe + existing DB default. |
| BR-15 | New Customers default to `ACTIVE`. | Current DDL/default. |
| BR-16 | Deleting a Customer is a soft delete; no physical delete. | Raw database design. |
| BR-17 | Do not allow editing a soft-deleted Customer. | Raw requirement. |
| BR-18 | Soft deleting a Customer must cascade soft delete to the full child tree under `tbl_dim_project`. | Human decision update on 2026-06-11. |
| BR-19 | Update and soft delete Customer must use optimistic locking with numeric `version`. | Apply Organization convention. |
| BR-20 | Stale `version` returns `409 Conflict`. | Optimistic locking rule. |
| BR-21 | BE returns `messageKey` and optional `messageArgs`; FE translates into `ja/en/vi`. | i18n convention. |
| BR-22 | Do not display dashboard/KPI/summary cards in Customer Management. | Raw requirement/wireframe. |
| BR-23 | Do not display Project/Repository lists in Customer detail in this release. | Out of scope. |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| `customerId` | UUID | Required for detail/update/delete | Must identify an existing Customer. | System-generated primary key; not editable. |
| `organizationId` | UUID | Required for create/update/list filter | Organization must exist, be `ACTIVE`, and not be soft deleted. | Dropdown only displays active Organizations. |
| `customerCode` | string | Required for create/update | Trim; 1-50 characters; unique case-insensitive across all Organizations for records where `deleted_at IS NULL`. | Maps to `customer_code`. |
| `customerAlias` | string | Required for create/update | Trim; 1-255 characters; unique case-insensitive within the same Organization for records where `deleted_at IS NULL`. | Maps to `customer_alias`. |
| `classification` | enum/string | Required or default | Only accepts `INTERNAL` / `EXTERNAL` in this release. | Default `INTERNAL`. |
| `status` | enum/string | Optional for list filter | `ACTIVE` / `DELETED`; default filter `ACTIVE`. `ALL` shows both active and deleted Customers, including Customers under deleted Organizations. | Cannot be set directly in create/edit form. |
| `keyword` | string | Optional | Search by `customerCode` or `customerAlias`. | Trim; max length follows FE/BE search convention. |
| `page`, `pageSize` | number | Optional | Positive integer. | Used for pagination. |
| `version` | number | Required for update/delete | Must equal the current record version. | Numeric optimistic locking token. |
| `currentUser` | authenticated principal | Required | Must have role `ADMIN`. | Used for created/updated/deleted by if user id source exists. |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| `customerId` | UUID | string | Primary key. |
| `organizationId` | UUID | string | Parent Organization ID. |
| `organizationName` | string | text | Retrieved from `tbl_dim_organization.name_masked` or the corresponding name field after Organization migration. |
| `customerCode` | string | text | Business code, searchable and displayed in list/detail. |
| `customerAlias` | string | text | Display/search field. |
| `classification` | enum/string | `INTERNAL` / `EXTERNAL` | Display/filter field. |
| `status` | enum/string | `ACTIVE` / `DELETED` | Display/filter field. |
| `createdAt` | datetime | ISO 8601 | Detail/list if needed. |
| `createdBy` | string | text | Detail if needed. |
| `updatedAt` | datetime | ISO 8601 | List/detail. |
| `updatedBy` | string | text | Detail if needed. |
| `deletedAt` | datetime/null | ISO 8601 | Present when soft deleted. |
| `deletedBy` | string/null | text | Present when soft deleted. |
| `version` | number | integer | Required for update/delete conflict check. |
| `traceId` | string | text | Error response. |
| `messageKey` | string | i18n key | Error/success/business messages. |
| `messageArgs` | object/array | JSON | Optional args for FE translation. |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| User not logged in | Existing redirect/login flow. | `401` or frontend redirect | According to current auth convention. |
| Non-`ADMIN` user accesses FE Customer route | FE clears session/logs out and redirects to `/:lang/login`. | `customer.error.adminRequired` | Do not keep the user on Customer page. |
| Non-ADMIN calls Customer API directly | BE returns `403 Forbidden`. | `customer.error.forbidden` | Includes `traceId`. |
| Missing Organization | Do not allow save. | `customer.validation.organizationRequired` | Field-level validation. |
| Organization does not exist | Reject create/update. | `customer.error.organizationNotFound` | `404` or `422` depending on Phase 3 contract. |
| Organization inactive/deleted | Reject create/update; dropdown also does not display it. | `customer.error.organizationUnavailable` | `422 Unprocessable Entity` recommended. |
| Missing Customer code | Do not allow save. | `customer.validation.codeRequired` | Field-level validation. |
| Customer code > 50 characters | Do not allow save. | `customer.validation.codeMaxLength` | Boundary validation. |
| Duplicate code anywhere in active-scope | Do not allow create/update. | `customer.error.codeDuplicate` | `409 Conflict` recommended. |
| Missing Customer alias | Do not allow save. | `customer.validation.aliasRequired` | Field-level validation. |
| Customer alias > 255 characters | Do not allow save. | `customer.validation.aliasMaxLength` | Boundary validation. |
| Duplicate alias within the same Organization active-scope | Do not allow create/update. | `customer.error.aliasDuplicate` | `409 Conflict` recommended. |
| Invalid Classification | Do not allow save. | `customer.validation.classificationInvalid` | Only `INTERNAL` / `EXTERNAL`. |
| Customer does not exist | Detail/update/delete returns not found. | `customer.error.notFound` | `404`. |
| Edit Customer that has been deleted | Do not allow update. | `customer.error.deletedCannotEdit` | `409` or `422`. |
| Delete Customer that has already been deleted | Idempotency must be finalized in Phase 3; recommended to return a business error. | `customer.error.alreadyDeleted` | No physical delete. |
| Customer has child Projects | Cascade soft delete. | `customer.error.cascadeSoftDelete` | Full child tree is deleted softly. |
| Stale version | Do not update/delete; request reload. | `customer.conflict.version` | `409 Conflict`. |
| System error | Display general error with traceId. | `common.error.unexpected` | Do not expose stack trace/secret/PII. |

#### 6.4.1. Message keys and translations

Translation files:

```text
public/locales/en/locale.json
public/locales/ja/locale.json
public/locales/vi/locale.json
```

Suggested keys under `Pages.Customer`:

| key | en | vi | ja |
|---|---|---|---|
| `Pages.Customer.title` | Customer Management | Quản lý Customer | Customer管理 |
| `Pages.Customer.createTitle` | Create Customer | Tạo Customer | Customer作成 |
| `Pages.Customer.editTitle` | Edit Customer | Chỉnh sửa Customer | Customer編集 |
| `Pages.Customer.detailTitle` | Customer Detail | Chi tiết Customer | Customer詳細 |
| `Pages.Customer.customerCode` | Customer Code | Mã Customer | Customerコード |
| `Pages.Customer.customerAlias` | Customer Name / Alias | Tên/Alias Customer | Customer名 / エイリアス |
| `Pages.Customer.organization` | Organization | Organization | Organization |
| `Pages.Customer.classification` | Classification | Phân loại | 分類 |
| `Pages.Customer.status` | Status | Trạng thái | ステータス |
| `Pages.Customer.createSuccess` | OK | OK | OK |
| `Pages.Customer.updateSuccess` | OK | OK | OK |
| `Pages.Customer.deleteSuccess` | OK | OK | OK |
| `customer.validation.codeRequired` | Please enter a customer code. | Vui lòng nhập mã Customer. | Customerコードを入力してください。 |
| `customer.validation.codeMaxLength` | Customer code must be 50 characters or less. | Mã Customer tối đa 50 ký tự. | Customerコードは50文字以内で入力してください。 |
| `customer.error.codeDuplicate` | Customer code already exists. | Mã Customer đã tồn tại. | 同じCustomerコードが既に存在します。 |
| `customer.validation.organizationRequired` | Please select an organization. | Vui lòng chọn Organization. | Organizationを選択してください。 |
| `customer.validation.aliasRequired` | Please enter a customer name or alias. | Vui lòng nhập tên/alias Customer. | Customer名またはエイリアスを入力してください。 |
| `customer.validation.aliasMaxLength` | Customer name / alias must be 255 characters or less. | Tên/alias Customer tối đa 255 ký tự. | Customer名 / エイリアスは255文字以内で入力してください。 |
| `customer.validation.classificationInvalid` | Classification is invalid. | Phân loại Customer không hợp lệ. | 分類が不正です。 |
| `customer.error.forbidden` | You do not have permission to access Customer Management. | Bạn không có quyền truy cập Quản lý Customer. | Customer管理にアクセスする権限がありません。 |
| `customer.error.adminRequired` | Administrator permission is required. | Cần quyền Administrator. | 管理者権限が必要です。 |
| `customer.error.organizationNotFound` | Organization was not found. | Không tìm thấy Organization. | Organizationが見つかりません。 |
| `customer.error.organizationUnavailable` | The selected Organization is inactive or deleted. | Organization đã bị vô hiệu hóa hoặc xóa mềm, không thể sử dụng. | 選択されたOrganizationは無効または削除済みです。 |
| `customer.error.aliasDuplicate` | Customer name / alias already exists in this Organization. | Tên/alias Customer đã tồn tại trong Organization này. | このOrganizationには同じCustomer名 / エイリアスが既に存在します。 |
| `customer.error.notFound` | Customer was not found. | Không tìm thấy Customer. | Customerが見つかりません。 |
| `customer.error.deletedCannotEdit` | Deleted Customer cannot be edited. | Customer đã xóa không thể chỉnh sửa. | 削除済みCustomerは編集できません。 |
| `customer.error.alreadyDeleted` | Customer has already been deleted. | Customer đã bị xóa trước đó. | Customerは既に削除されています。 |
| `customer.error.cascadeSoftDelete` | Customer and all child records are deleted softly. | Customer và toàn bộ dữ liệu con được xóa mềm. | Customerと全ての子データが削除されました。 |
| `customer.conflict.version` | Customer was updated by another user. Please reload and try again. | Customer đã được người khác cập nhật. Vui lòng tải lại và thử lại. | 他のユーザーによりCustomerが更新されました。再読み込みして再試行してください。 |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---:|---:|---|---|
| `customerAlias` | 1 char after trim | 255 chars | Empty/blank only; duplicate differing only by case. | Blank rejected; 255 accepted; 256 rejected; duplicate rejected in same Organization active-scope. |
| `organizationId` | N/A | N/A | Missing, not found, inactive/deleted. | Missing rejected; inactive/deleted rejected. |
| `classification` | N/A | N/A | Unknown value. | Only `INTERNAL` / `EXTERNAL` accepted. |
| `version` | 0 | BIGINT max | Missing, stale, negative. | Missing/stale rejected; successful update increments by 1. |
| Pagination `page` | 1 | TBD | 0/negative/non-number. | Invalid rejected or normalized by common contract. |
| Search `keyword` | 0 chars | TBD | Leading/trailing spaces; no match. | Trim; search code/alias; no match shows empty state. |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Customer List must respond fast enough for admin CRUD. | API p95 within 1 second with MVP/standard internal data. | BE/API test or performance smoke. | Consider indexes for organization/status/code/alias. |
| Security | Only `ADMIN` can access FE route and BE API. | 100% of non-ADMIN users blocked; FE logout redirect login. | Security/route guard/API tests. | Not only hiding buttons in FE. |
| Availability / Reliability | Update/delete must avoid lost updates. | Stale version returns `409`. | BE integration tests. | Requires `version`. |
| Maintainability | Clearly separate Customer CRUD from Organization/Project/Repository flows. | Do not pull dashboard/KPI/child list into this ticket. | Review. | Scope control. |
| Observability / Logging | Errors include `traceId`; operations use existing logging if applicable. | TraceId appears in error. | API/error tests/log review. | Dedicated audit log is out of scope for this release. |
| Compatibility | Follow i18n `public/locales/{en,ja,vi}/locale.json` and API `/api/v1`. | No hardcoded localized BE message. | FE/BE review. | BE returns message key. |
| Privacy | Do not display unnecessary data beyond Customer master. | No dashboard/export/report. | UI review. | Customer alias may be sensitive depending on tenant. |

## 7. Acceptance Criteria

| ACID | description | testable? | notes |
|---|---|---|---|
| AC-CUSTOMER-1 | Administrator can access the Customer Management screen from the administration area. | Yes | Non-ADMIN cannot access. |
| AC-CUSTOMER-2 | Administrator can view the Customer list. | Yes | Table list. |
| AC-CUSTOMER-3 | The Customer list only displays active/non-soft-deleted Customers. | Yes | Enforced in BE query and FE display. |
| AC-CUSTOMER-4 | Soft-deleted Customers are not displayed in the default list. | Yes | Default status Active. |
| AC-CUSTOMER-5 | Administrator can search/filter Customers by Organization, code, name/alias, classification, and status. | Yes | Search/filter. |
| AC-CUSTOMER-6 | Administrator can open the screen to create a new Customer. | Yes | Create action. |
| AC-CUSTOMER-7 | When creating a Customer, the Organization dropdown only displays active/non-soft-deleted Organizations. | Yes | Inactive/deleted Organization does not appear. |
| AC-CUSTOMER-8 | Administrator can create a new Customer with valid required information. | Yes | Organization + code + alias required. |
| AC-CUSTOMER-9 | The system does not allow creating a Customer if the selected Organization has been disabled or soft deleted. | Yes | BE validation. |
| AC-CUSTOMER-10 | Administrator can view Customer details. | Yes | Detail view/drawer. |
| AC-CUSTOMER-11 | Administrator can edit information of a Customer that has not been soft deleted. | Yes | Edit form. |
| AC-CUSTOMER-12 | When editing a Customer, the Organization dropdown does not display disabled or soft-deleted Organizations. | Yes | Prevent moving to invalid org. |
| AC-CUSTOMER-13 | Administrator can soft delete a Customer after confirmation. | Yes | Soft delete confirmation. |
| AC-CUSTOMER-14 | Users without Administrator permission cannot access the Customer function. | Yes | FE logout redirect login + BE 403. |
| AC-CUSTOMER-15 | The system does not allow creating/updating a Customer with a code duplicated anywhere against a Customer that has not been soft deleted; aliases remain unique within the same Organization, and codes or aliases from soft-deleted Customers may be reused. | Yes | Case-insensitive active-scope duplicate. |
| AC-CUSTOMER-16 | Update/soft delete with stale `version` is rejected with `409 Conflict`. | Yes | Optimistic locking. |
| AC-CUSTOMER-17 | Soft deleting a Customer cascades to its full child tree. | Yes | Delete confirmation and cascade behavior. |
| AC-CUSTOMER-18 | BE returns message key; FE displays the message in the current language `ja/en/vi`. | Yes | i18n behavior. |

## 8. Examples

### 8.1. Normal Case

| ID | scenario | input / action | expected result |
|---|---|---|---|
| N-CUSTOMER-1 | Default Customer list | ADMIN opens Customer Management. | The list only displays active/non-deleted Customers belonging to active/non-deleted Organizations. |
| N-CUSTOMER-2 | Search Customer | ADMIN enters a keyword by Customer code or alias/name. | The list displays Customers matching the keyword within the valid Organization scope. |
| N-CUSTOMER-3 | Filter by Organization | ADMIN selects an active Organization in the filter. | Only Customers belonging to the selected Organization are displayed. |
| N-CUSTOMER-4 | Filter by classification | ADMIN selects a classification, for example `INTERNAL`. | Only Customers with the corresponding classification are displayed. |
| N-CUSTOMER-5 | Create Customer | ADMIN selects an active Organization, enters a valid Customer code, alias, and classification. | Customer is created with status `ACTIVE`, `version = 0`, and the user returns to Customer List. |
| N-CUSTOMER-6 | Edit Customer | ADMIN opens detail/edit for an active Customer and updates code/alias/classification/status with the current `version`. | Customer is updated, and `version` increments by 1. |
| N-CUSTOMER-7 | Soft delete Customer | ADMIN confirms delete for a Customer with child Projects. | Customer and all child rows are soft deleted, `deleted_at`/`deleted_by` are set, `version` increments by 1, and Customer disappears from the default list. |
| N-CUSTOMER-8 | Organization dropdown | ADMIN opens create/edit Customer. | Organization dropdown only displays active/non-deleted Organizations. |

### 8.2. Error Case

| ID | scenario | input / action | expected result |
|---|---|---|---|
| E-CUSTOMER-1 | Missing Organization | Save create/update without selecting Organization. | BE returns validation message key, FE displays translated error and does not save. |
| E-CUSTOMER-2 | Organization unavailable | Create/update request uses inactive/deleted Organization. | BE rejects, FE displays Organization unavailable error. |
| E-CUSTOMER-3 | Missing Customer code | Save form with empty Customer code. | BE returns `customer.code.required`, FE displays translated message. |
| E-CUSTOMER-4 | Duplicate code globally | Create/update code duplicated with another active Customer anywhere. | BE returns duplicate message key and does not save. |
| E-CUSTOMER-5 | Missing Customer alias | Save form with empty Customer alias. | BE returns `customer.alias.required`, FE displays translated message. |
| E-CUSTOMER-6 | Duplicate alias within the same Organization | Create/update alias duplicated with another active Customer in the same Organization. | BE returns duplicate message key and does not save. |
| E-CUSTOMER-7 | Non-ADMIN access | Logged-in user without `ADMIN` accesses Customer page. | FE logs out the user and redirects to `/:lang/login`; direct API is rejected by BE with `403 Forbidden`. |
| E-CUSTOMER-8 | Stale version | Update/delete with a `version` older than the current DB version. | BE returns `409 Conflict` and conflict message key; FE does not overwrite newer data. |
| E-CUSTOMER-9 | Delete Customer with child Projects | ADMIN confirms delete for a Customer that has child Projects. | BE cascade-soft-deletes the full child tree and FE displays translated success feedback. |
| E-CUSTOMER-10 | System error | API list/detail/save/delete unexpectedly fails. | BE returns common error with `traceId`; FE displays translated general error with traceId. |

### 8.3. Boundary Case

| ID | scenario | input / action | expected result |
|---|---|---|---|
| B-CUSTOMER-1 | Code at max length | Customer code is exactly the max length finalized in DB/spec. | Accepted if valid and not duplicated. |
| B-CUSTOMER-2 | Code exceeds max length | Customer code exceeds max length by 1 character. | Rejected with validation message key. |
| B-CUSTOMER-3 | Case-insensitive code duplicate | Existing code `ABC`, input `abc` anywhere in the system. | Treated as duplicate if the case-insensitive rule is applied. |
| B-CUSTOMER-4 | Code reuse after soft delete | Create a new Customer with the code of a soft-deleted Customer. | Allowed if no non-deleted Customer anywhere has the same code. |
| B-CUSTOMER-5 | Alias at max length | Customer alias is exactly the max length finalized in DB/spec. | Accepted if valid and not duplicated. |
| B-CUSTOMER-6 | Alias exceeds max length | Customer alias exceeds max length by 1 character. | Rejected with validation message key. |
| B-CUSTOMER-7 | Case-insensitive alias duplicate | Existing alias `ABC`, input `abc` in the same Organization. | Treated as duplicate if the case-insensitive rule is applied. |
| B-CUSTOMER-8 | Alias reuse after soft delete | Create a new Customer with the alias of a soft-deleted Customer in the same Organization. | Allowed if no non-deleted Customer has the same alias. |
| B-CUSTOMER-5 | Empty list | No Customer matches the filter/search. | FE displays translated empty state and still allows create if the user is ADMIN. |
| B-CUSTOMER-6 | Organization becomes inactive after opening form | User opens form while Organization is active, then Organization becomes inactive before save. | Save is rejected by BE; FE displays Organization unavailable error. |
| B-CUSTOMER-7 | Delete already deleted | Attempt to delete a Customer that has already been soft deleted. | Rejected or returns already-deleted status according to Phase 3 contract; no physical delete. |
| B-CUSTOMER-8 | Pagination boundary | The list has more Customers than page size. | Pagination/sort preserves the active/non-deleted Organization filter and has no duplicate/missing rows. |

## 9. Source Availability Summary

| category | status | summary |
|---|---|---|
| Raw requirement | Available | `CUSTOMER/raw/requirement.md` exists with 14 ACs and CRUD-only scope. |
| Raw wireframe | Available | `CUSTOMER/raw/wireframe.md` describes list/create/detail/edit/delete. |
| Raw database design | Available | `CUSTOMER/raw/database_design.md` describes `tbl_dim_customer`, soft delete, and Organization parent rule. |
| Base DB source | Available | `tbl_dim_customer` already exists in `V4__init_shema_v2.sql`. |
| Existing Customer API | Not found | No Customer-specific controller/use case/repository yet. |
| Existing Customer FE | Not found | No Customer-specific route/page yet. |
| i18n source | Available | `public/locales/{en,ja,vi}/locale.json`. |
| Auth/route source | Available | Login route `/:lang/login`; admin route `/:lang/admin`. |
| Test source | Partial | Test infrastructure exists, but there are no Customer tests yet. |

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: FE+BE+DB
- Primary risk: Contract / DB / Security / Translation / Test
- Review mode: Standard
- Required options: Source Analysis / FE-BE Contract / DB Migration / Security/Privacy / Test/QA
```

Rationale:

- Not FE-only because BE API, DB migration, security, i18n, and optimistic locking are required.
- Not Critical because the scope is CRUD-only and there is no new batch/microservice/real-time/data pipeline.
- DB risk is notable because existing unique constraint handling and new columns are required.

## 11. FE/BE Contract Impact

### 11.1. Proposed API endpoints

| method | endpoint | purpose | notes |
|---|---|---|---|
| `GET` | `/api/v1/customers` | List/search/filter Customer | Join/filter active Organization. |
| `GET` | `/api/v1/customers/{customerId}` | Customer detail | Return `version`. |
| `POST` | `/api/v1/customers` | Create Customer | Validate active Organization. |
| `PUT` | `/api/v1/customers/{customerId}` | Update Customer | Require `version`. |
| `PATCH` | `/api/v1/customers/{customerId}/delete` | Soft delete Customer | Require `version`; cascade soft delete child tree. |
| `GET` | `/api/v1/organizations/options` or equivalent | Active Organization dropdown | Phase 3 maps this to the existing Organization API design. |

### 11.2. Request examples

```json
POST /api/v1/customers
{
  "organizationId": "<uuid>",
  "customerCode": "CUS-001",
  "customerAlias": "Customer A",
  "classification": "INTERNAL"
}
```

```json
PUT /api/v1/customers/<customerId>
{
  "organizationId": "<uuid>",
  "customerCode": "CUS-001",
  "customerAlias": "Customer A Updated",
  "classification": "EXTERNAL",
  "version": 3
}
```

```json
PATCH /api/v1/customers/<customerId>/delete
{
  "version": 3
}
```

### 11.3. Response example

```json
{
  "customerId": "<uuid>",
  "organizationId": "<uuid>",
  "organizationName": "Brycen Vietnam",
  "customerCode": "CUS-001",
  "customerAlias": "Customer A",
  "classification": "INTERNAL",
  "status": "ACTIVE",
  "createdAt": "2026-06-09T00:00:00Z",
  "updatedAt": "2026-06-09T00:00:00Z",
  "version": 0
}
```

### 11.4. FE route/navigation

| route | purpose | notes |
|---|---|---|
| `/:lang/admin/customers` | Customer List | Exact nesting/file to finalize in Phase 3. |
| `/:lang/admin/customers/new` or modal/drawer | Create Customer | UI pattern based on existing FE. |
| `/:lang/admin/customers/:customerId` or drawer | Detail Customer | Exact pattern finalized in Phase 3. |
| `/:lang/admin/customers/:customerId/edit` or modal/drawer | Edit Customer | Exact pattern finalized in Phase 3. |
| `/:lang/login` | Redirect after non-ADMIN access/logout | Finalized in Phase 1. |

## 12. DB/Migration Impact

### 12.1. Existing table

`tbl_dim_customer` already exists. Do not create a new table.

Current columns:

| column | current status | action |
|---|---|---|
| `customer_id` | Exists | Keep. |
| `organization_id` | Exists | Keep FK to Organization. |
| `customer_code` | Missing | Add; business Customer code. |
| `customer_alias` | Exists | Keep; business Customer Alias/Name. |
| `classification` | Exists | Keep; default `INTERNAL`. |
| `status` | Exists | Keep; `record_status`. |
| `created_at`, `created_by`, `updated_at`, `updated_by` | Exists | Keep. |
| `deleted_at` | Missing | Add. |
| `deleted_by` | Missing | Add. |
| `version` | Missing | Add. |

### 12.2. Proposed migration design

```sql
ALTER TABLE tbl_dim_customer
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100),
    ADD COLUMN IF NOT EXISTS customer_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
```

Existing constraint:

```sql
CONSTRAINT uq_customer_alias_per_org UNIQUE (organization_id, customer_alias)
```

If Customer code and alias reuse after soft delete is allowed, replace them with active-scope partial unique indexes:

```sql
ALTER TABLE tbl_dim_customer
    DROP CONSTRAINT IF EXISTS uq_customer_alias_per_org;

CREATE UNIQUE INDEX IF NOT EXISTS ux_tbl_dim_customer_code_active
ON tbl_dim_customer (LOWER(customer_code))
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_tbl_dim_customer_org_alias_active
ON tbl_dim_customer (organization_id, LOWER(customer_alias))
WHERE deleted_at IS NULL;
```

Indexes for list/filter/search:

```sql
CREATE INDEX IF NOT EXISTS idx_tbl_dim_customer_org_status
ON tbl_dim_customer (organization_id, status);

CREATE INDEX IF NOT EXISTS idx_tbl_dim_customer_status_updated
ON tbl_dim_customer (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_tbl_dim_customer_alias_lower
ON tbl_dim_customer (LOWER(customer_alias));

CREATE INDEX IF NOT EXISTS idx_tbl_dim_customer_code_lower
ON tbl_dim_customer (LOWER(customer_code));
```

### 12.3. Query rule

Customer List must join Organization:

```sql
SELECT c.*
FROM tbl_dim_customer c
JOIN tbl_dim_organization o
  ON o.organization_id = c.organization_id
WHERE c.status = 'ACTIVE'
  AND c.deleted_at IS NULL
  AND o.status = 'ACTIVE'
  -- If tbl_dim_organization has deleted_at after Organization migration:
  -- AND o.deleted_at IS NULL;
```

Phase 3 should adjust the Organization predicate to the actual Organization schema after Organization migration. Intended rule:

```text
Organization is usable only when status = ACTIVE and not soft deleted in ACTIVE/default list mode.
When the Customer status filter is ALL, the list can include Customers under deleted Organizations.
```

### 12.4. Optimistic locking

- Initial `version = 0`.
- Successful update increments `version = version + 1`.
- Successful soft delete increments `version = version + 1`.
- Update/delete WHERE clause must include the current version.
- If affected row count = 0 because of version mismatch, return `409 Conflict`.

Example update pattern:

```sql
UPDATE tbl_dim_customer
SET
    organization_id = :organization_id,
    customer_alias = :customer_alias,
    classification = :classification,
    updated_at = now(),
    updated_by = :current_user,
    version = version + 1
WHERE customer_id = :customer_id
  AND status <> 'DELETED'
  AND deleted_at IS NULL
  AND version = :version;
```

### 12.5. Child-data safety

Before soft deleting Customer, cascade soft delete the child tree listed in section 5.1:

```sql
SELECT 1
FROM tbl_dim_project
WHERE customer_id = :customer_id
  AND status = 'ACTIVE'
LIMIT 1;
```

Soft delete the Customer and all child records in the tree.

## 13. Security/Privacy Impact

| area | impact | requirement |
|---|---|---|
| Authentication | Customer screen/API require login. | Use existing auth/session mechanism. |
| Authorization | Only `ADMIN`. | FE route guard + BE server-side enforcement. |
| Non-ADMIN behavior | FE logout + redirect login. | Target `/:lang/login`. |
| Direct API access | Non-ADMIN blocked. | `403 Forbidden` with message key. |
| Data exposure | Customer list should not expose child Project/Repository details. | Keep CRUD-only. |
| Parent Organization status | Customer under inactive/deleted Organization must not leak in default list. | Enforce in BE query. |
| Error response | No stack trace/secret/PII. | Include `traceId`, message key. |
| Audit/logging | Dedicated audit log is out of scope unless the platform already has it. | Keep application logging/traceId if available. |

## 14. Operation/Maintenance Impact

- Migration must be reviewed because it changes existing table `tbl_dim_customer`.
- Dropping the existing unique constraint requires checking duplicate data before creating the case-insensitive partial unique index.
- Backfilling `version = 0` via default is straightforward, but Phase 3 should confirm existing rows.
- Adding `deleted_at`/`deleted_by` is backward-compatible for existing rows.
- Customer List query depends on Organization soft-delete columns after Organization migration; Phase 3 must align migration order.
- Rollback plan should cover:
  - Recreating the old unique constraint if partial index rollback is needed.
  - Dropping newly added indexes if needed.
  - Do not casually drop data columns if production data has started using them.
- No new batch/job/connector operation in this ticket.

## 15. Test Strategy Summary

| test area | required cases |
|---|---|
| FE route/security | ADMIN can access; non-ADMIN logout + redirect `/:lang/login`; unauthenticated uses existing login flow. |
| Customer List | Shows active Customer under active Organization; hides deleted Customer; hides Customer under inactive/deleted Organization. |
| Search/filter | Organization filter, keyword alias search, classification filter, status filter. |
| Organization dropdown | Create/edit dropdown only contains active/not-deleted Organizations. |
| Create | Required validation, create success, Organization unavailable rejection, duplicate alias rejection. |
| Detail | Shows Customer data and version. |
| Edit | Update success, cannot edit deleted Customer, Organization inactive rejection, stale version conflict. |
| Soft delete | Confirmation required, status/deleted metadata set, version increments, deleted Customer hidden by default. |
| Child-data safety | Soft delete Customer cascades to child Projects and descendants. |
| DB migration | Columns added, unique partial index works, old constraint replaced safely, list indexes exist. |
| i18n | BE messageKey translated in `en/ja/vi`; no BE localized display text. |
| API error | 403/404/409/422/system error include messageKey/traceId. |

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| HD-CUSTOMER-1 | Customer raw requirement/wireframe/database design uses Vietnamese and is concise like Organization. | User requested. | nk_trung                   | Decided |
| HD-CUSTOMER-2 | Customer raw requirement AC increased to 14 ACs. | User requested more than 8 ACs. | nk_trung                   | Decided |
| HD-CUSTOMER-3 | Create/Edit Organization dropdown does not display inactive/deleted Organizations. | User clarified. | nk_trung                   | Decided |
| HD-CUSTOMER-4 | Customer List only displays active/non-soft-deleted Customers. | User clarified. | nk_trung                   | Decided |
| HD-CUSTOMER-5 | Customer applies `ADMIN` only + non-ADMIN logout redirect login. | Consistency with Organization admin functions. | nk_trung                   / Phase 3 reviewer | Decided by convention; review in Phase 3 |
| HD-CUSTOMER-6 | Customer uses numeric `version` for optimistic locking. | Consistency with Organization CRUD master. | nk_trung                   / Phase 3 reviewer | Decided by convention; review in Phase 3 |
| HD-CUSTOMER-7 | Soft delete Customer cascades to child Projects and descendants. | Data safety preserved through soft delete cascade. | nk_trung                   / Phase 3 reviewer | Spec decision; review in Phase 3 |

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-CUSTOMER-1 | Customer route is under admin area, proposed as `/:lang/admin/customers`. | Customer is an admin function; source has `/:lang/admin`. | Low | Phase 3 mapping only |
| A-CUSTOMER-2 | FE translation files are `public/locales/{en,ja,vi}/locale.json`. | Source inventory/i18n source. | Low | No |
| A-CUSTOMER-3 | Initial Classification values are only `INTERNAL` / `EXTERNAL`. | Existing default `INTERNAL`, wireframe has Internal/External. | Medium | Review in Phase 3 if more values exist |
| A-CUSTOMER-4 | Duplicate Customer alias is unique per Organization, not global. | Existing DB constraint `(organization_id, customer_alias)`. | Low | No unless business changes |
| A-CUSTOMER-5 | Deleted Customer can reuse alias in the same Organization. | Organization convention and partial unique design. | Medium | Review in Phase 3 |
| A-CUSTOMER-6 | Customer with active Project cannot be soft deleted. | FK from Project to Customer and data safety. | Medium | Review in Phase 3 |
| A-CUSTOMER-7 | Organization active means `status = 'ACTIVE'` and not soft deleted. | Organization Phase 1 and DB design. | Low | Phase 3 align schema |

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-CUSTOMER-1 | Exact FE file/component/route constant names for Customer. | Needed for implementation plan. | Phase 3 | Open for Phase 3 mapping |
| OI-CUSTOMER-2 | Exact BE class/DTO/mapper names. | Needed for implementation plan. | Phase 3 | Open for Phase 3 mapping |
| OI-CUSTOMER-3 | Exact Flyway migration filename/order relative to Organization migration. | Needed for safe DB rollout. | Phase 3 | Open for Phase 3 mapping |
| OI-CUSTOMER-4 | Existing data duplicate check before replacing `uq_customer_alias_per_org`. | Needed before migration. | Phase 3 | Open for Phase 3 analysis |
| OI-CUSTOMER-5 | Whether classification needs values beyond `INTERNAL` / `EXTERNAL`. | Could affect UI/API validation. | Phase 3 / Product | Open, not blocking Phase 1 |
