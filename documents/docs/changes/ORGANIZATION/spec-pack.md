# Spec Pack

**Ticket ID**: ORGANIZATION   
**Create date**: 2026-06-09  
**Author**: nk_trung          
**Update date**: 2026-06-09     

## 1. Context / Purpose

Organization Management is a new administration function for maintaining Organization master data in the EDCAP platform.

The purpose of this ticket is to provide a simple CRUD-only Organization Management screen and related backend/database support so authorized administrators can:

- View Organization list and details.
- Search Organizations by code or name.
- Filter Organizations by status.
- Create Organizations.
- Edit Organization code, name, and description.
- Soft delete Organizations.
- Ensure required validation, system-wide duplicate checks, permission control, and operation logging.

This `spec-pack.md` is the single source of truth for Phase 1 output for the `ORGANIZATION` ticket.

## 2. Scope

### 2.1. Within range

- Organization list screen.
- Search by Organization code or Organization name.
- Status filter: All / Active / Deleted.
- Create Organization.
- Organization detail view.
- Edit Organization.
- Soft delete Organization after confirmation.
- Required field validation for Organization code and Organization name.
- System-wide duplicate checks for Organization code and Organization name.
- Organization code is editable after creation, with duplicate check.
- Default status of newly created Organization is `ACTIVE`.
- Default list shows only active Organizations.
- Soft-deleted Organizations are not editable.
- ADMIN-only access for the Organization Management screen and all Organization operations.
- If an authenticated non-ADMIN user attempts to open the Organization Management screen, FE must logout the user and redirect to the current-language Login page `/:lang/login`; BE APIs must still reject direct non-ADMIN requests.
- Traceable application behavior for create/update/soft delete using existing logging/error traceId where applicable; dedicated audit log implementation is out of scope for this release.
- DB migration consideration for existing `tbl_dim_organization`, including adding `version BIGINT NOT NULL DEFAULT 0` for optimistic locking.

### 2.2. Out of range

- Customer management.
- Project management.
- Repository management.
- Team/Member management.
- Role/Permission management through a separate UI.
- Dashboard, KPI, summary cards, risk score, health score, or Organization operational statistics.
- Evidence collection.
- Connector configuration.
- SDD artifact analysis.
- Bulk import/export.
- Multilingual support for Organization names.
- Separate display code different from Organization code.
- Physical delete of Organization records.
- Cascade soft delete to Customer/Project/Repository/Ticket.
- Renaming `name_masked` in the current change scope.

## 3. Terminology
| terms | meaning | notes |
|---|---|---|
| Organization | High-level master data entity managed by the administration function. | Root entity in the platform data model. |
| Organization Code | Business identifier of an Organization. | Required, unique among non-deleted Organizations, editable after creation. Soft-deleted records do not block reuse. Maps to DB column `organization_code`. |
| Organization Name | Display name of an Organization. | Required, unique among non-deleted Organizations. Soft-deleted records do not block reuse. Maps to existing DB column `name_masked`. |
| Description | Optional free-text description of an Organization. | Max length is 500 characters. DB column may use `TEXT`, but FE/BE validation must enforce 500 characters. |
| Active | Normal usable Organization status. | DB value `ACTIVE`. |
| Deleted | Soft-deleted Organization status. | DB value `DELETED`. Excluded from default list. FE currently displays this state as `DELETED` to match the persisted value. |
| Soft delete | Logical delete by updating status and deleted metadata. | Physical `DELETE FROM tbl_dim_organization` is not allowed. |
| Active-scope unique | Uniqueness is checked among non-deleted Organization records. | Soft-deleted records do not block reuse of code/name. Current design does not distinguish tenant/environment. |
| Trace ID | Correlation ID used in errors/logging. | Current BE error response includes `traceId`; FE `ApiError` captures `X-Trace-Id`. |
| Message Key | Stable i18n key returned by BE for validation/business/system messages. | FE translates message keys to `ja` / `en` / `vi` using `public/locales/{en,ja,vi}/locale.json`. |
| Version | Numeric optimistic-locking token for Organization records. | New DB/API field required by this ticket; current `tbl_dim_organization` does not have this column. |

## 4. As-Is

- There is no dedicated Organization Management screen in the FE.
- FE router exists but no Organization route/page is currently registered.
- FE has a fetch wrapper in `EDCAP_FE/src/lib/api.ts` with `credentials: "include"`, `ApiError`, and typed endpoint helper pattern.
- FE has reusable table/button components, and `AdminPage.tsx` shows current TanStack Query mutation/query style.
- BE has no Organization-specific REST controller, DTO, use case, repository, or Organization CRUD API found in checked source.
- BE currently has REST patterns for health, current user, admin connectors, demo parser, and webhooks.
- BE global exception handling maps validation/domain/application/unknown errors to structured error responses with `traceId`.
- BE security currently authenticates `/api/**` except permitted endpoints; Organization-specific permission mapping is not implemented.
- DB table `tbl_dim_organization` already exists in `V4__init_shema_v2.sql` with:
  - `organization_id`
  - `name_masked`
  - `status`
  - `created_at`
  - `created_by`
  - `updated_at`
  - `updated_by`
- Existing `tbl_dim_organization` does not yet have:
  - `organization_code`
  - `description`
  - `deleted_at`
  - `deleted_by`
  - `version`

## 5. To-Be

- Add Organization Management UI with list, search, status filter, create, detail, edit, and soft delete confirmation.
- Add Organization CRUD backend API and contract.
- Use existing `tbl_dim_organization`; do not create a new Organization table.
- Add required DB columns and indexes/constraints for Organization CRUD, including `version BIGINT NOT NULL DEFAULT 0`.
- Use `organization_code` as required editable business identifier.
- Continue mapping Organization Name to `name_masked` in this change scope.
- Enforce case-insensitive uniqueness for Organization code and name among non-deleted records only; soft-deleted records do not block reuse.
- Use soft delete by setting `status = 'DELETED'`, `deleted_at`, `deleted_by`, `updated_at`, and `updated_by`.
- Exclude deleted Organizations from default list.
- Prevent edit of soft-deleted Organizations.
- Enforce optimistic locking with numeric `version`: update and soft-delete requests must include current `version`; stale versions return `409 Conflict` and do not update/delete.
- Dedicated audit logging is out of scope for this release. Use existing application logging/error traceId behavior where applicable; audit log storage/verification is not required in Phase 5/6 for this ticket.
- Return `traceId` on system errors; BE returns message keys and FE translates messages for `ja` / `en` / `vi` using `public/locales/{en,ja,vi}/locale.json`.

## 6. Detailed specification

### 6.1. Business Rules

| ID | rule | source / note |
|---|---|---|
| BR-ORGANIZATION-1 | Organization Management is CRUD-only. | Requirement / wireframe. |
| BR-ORGANIZATION-2 | Organization code is required. | Requirement / DB design / wireframe. |
| BR-ORGANIZATION-3 | Organization code must be unique among non-deleted Organizations. | Human decision on 2026-06-09: deleted records can be recreated/reused. |
| BR-ORGANIZATION-4 | Organization code can be edited after creation, but the new code must not duplicate another non-deleted Organization. | Requirement decision finalized + human clarification. |
| BR-ORGANIZATION-5 | Organization name is required. | Requirement / DB design / wireframe. |
| BR-ORGANIZATION-6 | Organization name must be unique among non-deleted Organizations. | Human decision on 2026-06-09: deleted records can be recreated/reused. |
| BR-ORGANIZATION-7 | Organization name maps to `tbl_dim_organization.name_masked`. | DB design. |
| BR-ORGANIZATION-8 | Separate display code is not required. | Requirement decision finalized. |
| BR-ORGANIZATION-9 | Multilingual Organization names are not required. | Requirement decision finalized. |
| BR-ORGANIZATION-10 | New Organizations default to `ACTIVE`. | Requirement / DB design. |
| BR-ORGANIZATION-11 | Deleting an Organization is soft delete only. | Requirement / DB design / wireframe. |
| BR-ORGANIZATION-12 | Physical delete from `tbl_dim_organization` is not allowed. | DB design. |
| BR-ORGANIZATION-13 | Soft-deleted Organizations are not displayed in the default list. | Requirement / DB design / wireframe. |
| BR-ORGANIZATION-14 | Soft-deleted Organizations can be viewed when filtered, but cannot be edited. | Requirement / wireframe. |
| BR-ORGANIZATION-15 | Only users with role `ADMIN` can access the Organization Management screen and perform view/create/update/soft-delete operations. | Human decision on 2026-06-09. |
| BR-ORGANIZATION-15a | If an authenticated non-ADMIN user attempts to open the Organization Management screen, FE must logout the user and redirect to `/:lang/login`. | Human decision on 2026-06-09. Preserve current language when possible; if language cannot be resolved, use existing FE default language behavior. BE must still reject direct non-ADMIN Organization API requests. |
| BR-ORGANIZATION-16 | Dedicated audit log implementation is out of scope for this release. | Human decision on 2026-06-09. Existing application logging/traceId may still be used for troubleshooting. |
| BR-ORGANIZATION-17 | Child-data flows are cascade-soft-deleted when Organization is soft deleted. | Human decision update on 2026-06-11. This release soft deletes the full child tree; restore is out of scope. |
| BR-ORGANIZATION-18 | Optimistic locking must use numeric `version`. | Add `version BIGINT NOT NULL DEFAULT 0`; include `version` in detail/list/update/delete contract; increment exactly once after successful update or soft delete; stale token returns `409 Conflict` with `organization.conflict.version`. |
| BR-ORGANIZATION-19 | Organization message keys are fixed in this Spec Pack and translations are stored in `public/locales/{en,ja,vi}/locale.json`. | BE returns message keys; FE owns localized text. |
| BR-ORGANIZATION-20 | Soft delete Organization must cascade soft delete to the full child tree (Customer -> Project -> Repository/Team/Ticket); restore is not supported in this release. | Human decision update on 2026-06-11. |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| `organizationId` | UUID | Required for detail/update/delete | Must identify an existing Organization. | System-generated primary key; not editable. |
| `organizationCode` | string | Yes for create/update | Required; max 50 characters; unique among non-deleted records; case-insensitive duplicate check recommended. | Maps to `organization_code`. Editable after creation. Soft-deleted records do not block reuse. |
| `organizationName` | string | Yes for create/update | Required; max 255 characters; unique among non-deleted records; case-insensitive duplicate check recommended. | Maps to `name_masked`. Soft-deleted records do not block reuse. |
| `description` | string | No | Optional; maximum 500 characters. | DB design may use `TEXT`, but FE/BE validation must enforce 500 characters. |
| `status` | enum/string | No for create/update form | List filter accepts All / Active / Deleted; records use `ACTIVE` / `DELETED`. FE label for deleted state is shown as `DELETED`. | New record defaults to `ACTIVE`. |
| `keyword` | string | No | Search by code or name. | Applies to list search. |
| `page`, `pageSize` | number | No | Positive integer. | Required if pagination is implemented; exact default can follow existing FE/BE convention in Phase 3. |
| `currentUser` | authenticated user | Yes for all Organization screen/API operations | Must have role `ADMIN`. Non-ADMIN screen access triggers FE logout and redirect to `/:lang/login`. | Used for `created_by`, `updated_by`, and `deleted_by`. Dedicated audit log is out of scope. |
| `version` | number | Yes for update and soft delete | Must match the current persisted Organization version. | Required optimistic-lock token. Create request does not send it; create response returns `version = 0`. |

### 6.3. Output
| item | type | format | notes |
|---|---|---|---|
| `organizationId` | UUID | string UUID | Returned in list/detail/create/update responses. |
| `organizationCode` | string | plain text | Business identifier. |
| `organizationName` | string | plain text | Display name, sourced from `name_masked`. |
| `description` | string/null | plain text | May be null/empty. |
| `status` | string | `ACTIVE` / `DELETED` | FE display labels: Active / Deleted. |
| `createdAt` | timestamp | system date-time format | Displayed in detail and may be included in list. |
| `createdBy` | string | user identifier/email | Displayed in detail. |
| `updatedAt` | timestamp | system date-time format | Default sorting by latest updated time. |
| `updatedBy` | string | user identifier/email | Displayed in detail. |
| `deletedAt` | timestamp/null | system date-time format | Display only for deleted records. |
| `deletedBy` | string/null | user identifier/email | Display only for deleted records. |
| `version` | number | optimistic locking token | Returned by list/detail/create/update responses. Create response returns `0`; successful update/delete increments by `1`; stale request versions return `409 Conflict`. |
| `traceId` | string | correlation ID | Returned/displayed for errors. |
| `messageKey` | string | i18n key | BE returns this for errors/validation/business messages; FE translates to `ja` / `en` / `vi` using resources under `public/locales/{en,ja,vi}/locale.json`. |
| `messageArgs` | object/array | optional values | Optional interpolation values for FE translation, e.g. field name or max length. |

### 6.4. Error / Exception 
| case | expected behavior | BE message key / code | FE display responsibility / notes |
|---|---|---|---|
| Missing Organization code | Do not save; show field-level validation error. | `Pages.Organization.Code.Required` | FE translates key to `ja` / `en` / `vi` using `public/locales/{en,ja,vi}/locale.json`. |
| Missing Organization name | Do not save; show field-level validation error. | `Pages.Organization.Name.Eequired` | FE translates key to `ja` / `en` / `vi` using `public/locales/{en,ja,vi}/locale.json`. |
| Duplicate Organization code on create | Do not create record. | `Pages.Organization.Code.Duplicate` | Case-insensitive check among non-deleted records. Soft-deleted records do not block reuse. FE translates key. |
| Duplicate Organization code on edit | Do not update record. | `Pages.Organization.Code.DuplicateOnUpdate` | Exclude same `organization_id` and soft-deleted records from duplicate check. FE translates key. |
| Duplicate Organization name | Do not create/update record. | `Pages.Organization.Name.Duplicate` | Case-insensitive check among non-deleted records. Soft-deleted records do not block reuse. FE translates key. |
| Edit soft-deleted Organization | Do not update record. | `Pages.Organization.Deleted.EditNotAllowed` | Applies to detail/edit/update. FE translates key. |
| Delete already deleted Organization | Do not update again. | `Pages.Organization.Deleted.AlreadyDeleted` | FE translates key. |
| Non-ADMIN screen access | Authenticated non-ADMIN user attempts to open Organization Management screen. | N/A for screen redirect; direct API uses `Component.Permission.Denied`. | FE must logout and redirect to `/:lang/login`; BE direct API access returns `403 Forbidden` with message key. |
| Not found | Display appropriate not-found message. | `Pages.Organization.NotFound` | Current BE has `NotFoundException` -> 404 pattern. FE translates key. |
| Optimistic locking conflict | Do not overwrite newer record; show conflict message. | `Pages.Organization.Conflict.Version` | Use numeric `version` token. FE sends current version in update/delete; BE rejects stale versions with `409 Conflict`. |
| System error | Display general error with traceId. | `Component.Error.Unexpected` + `traceId` | Current BE error body includes `traceId`; FE captures response header traceId and translates key. |


#### 6.4.1. Message keys and translations

Translation resource files are fixed as:

```text
public/locales/en/locale.json
public/locales/ja/locale.json
public/locales/vi/locale.json
```

Suggested keys under `Pages.Organization`:

| messageKey | en | ja | vi |
|---|---|---|---|
| `Pages.Organization.Code.Required` | Organization code is required. | 組織コードは必須です。 | Mã Organization là bắt buộc. |
| `Pages.Organization.Name.Required` | Organization name is required. | 組織名は必須です。 | Tên Organization là bắt buộc. |
| `Pages.Organization.Description.MaxLength` | Description must be 500 characters or less. | 説明は500文字以内で入力してください。 | Mô tả phải có tối đa 500 ký tự. |
| `Pages.Organization.Code.Duplicate` | Organization code already exists. | 組織コードは既に存在します。 | Mã Organization đã tồn tại. |
| `Pages.Organization.Name.Duplicate` | Organization name already exists. | 組織名は既に存在します。 | Tên Organization đã tồn tại. |
| `Pages.Organization.Deleted.EditNotAllowed` | Deleted Organization cannot be edited. | 削除済みの組織は編集できません。 | Organization đã xóa không thể chỉnh sửa. |
| `Pages.Organization.Deleted.AlreadyDeleted` | Organization has already been deleted. | 組織は既に削除されています。 | Organization đã được xóa trước đó. |
| `Pages.Organization.NotFound` | Organization was not found. | 組織が見つかりません。 | Không tìm thấy Organizationc. |
| `Pages.Organization.Conflict.Version` | Organization was updated by another user. Please reload and try again. | 他のユーザーにより組織が更新されました。再読み込みして再度お試しください。 | Organization đã được người dùng khác cập nhật. Vui lòng tải lại và thử lại. |
| `Pages.Organization.Message.Created` | Organization was created. | 組織を作成しました。 | Đã tạo Organization. |
| `Pages.Organization.Message.Updated` | Organization was updated. | 組織を更新しました。 | Đã cập nhật Organizationc. |
| `Pages.Organization.Message.Deleted` | Organization was deleted. | 組織を削除しました。 | Đã xóa Organization. |
| `Pages.Organization.List.Empty` | No Organizations found. | 組織がありません。 | Không có Organizationc nào. |
| `Component.Permission.Denied` | You do not have permission. | 権限がありません。 | Bạn không có quyền thực hiện thao tác này. |
| `Component.Error.Unexpected` | An unexpected error occurred. | 予期しないエラーが発生しました。 | Đã xảy ra lỗi không mong muốn. |

### 6.5. Boundary Value
| item | min | max | special cases | expected |
|---|---|---|---|---|
| Organization code | 1 character | 50 characters | Empty, whitespace-only, different case duplicate among non-deleted records, code matching soft-deleted record | Empty invalid; duplicate among non-deleted records invalid; reuse from soft-deleted record allowed. |
| Organization name | 1 character | 255 characters | Empty, whitespace-only, different case duplicate among non-deleted records, name matching soft-deleted record | Empty invalid; duplicate among non-deleted records invalid; reuse from soft-deleted record allowed. |
| Description | 0 characters | 500 characters | Empty/null, 501 characters, multi-line text | Optional; FE/BE must reject values over 500 characters. |
| Status filter | N/A | N/A | All / Active / Deleted | Default is Active. All includes Active and Deleted. Deleted shows only deleted records. |
| Pagination | 1 | TBD | No data, exactly page size, more than page size, last page | Pagination displayed when number of records exceeds page size. |
| Soft delete state | N/A | N/A | Delete active record, delete already deleted record | Active can be soft deleted; already deleted cannot be deleted again. |
| Version | 0 | N/A | Missing version, stale version, successful update/delete | Update/delete require version; stale version returns `409 Conflict`; successful update/delete increments version exactly once. |

### 6.6. Non-functional
| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Organization list should support search/filter/pagination without loading unnecessary data. | Exact SLA not defined. | API/integration test and manual list behavior check. | Add indexes for status, created_at, updated_at; consider search indexes if needed. |
| Security | All Organization APIs require authentication and role `ADMIN`. | Non-ADMIN users cannot access screen/API. | Authorization tests, FE route guard test, session cleanup test. | Screen access by authenticated non-ADMIN logs out and redirects to `/:lang/login`; direct API returns `403`. |
| Availability / Reliability | Soft delete must not physically remove data. | No physical delete SQL for Organization deletion. | DB integration test / SQL review. | Update status/deleted fields only. |
| Maintainability | Follow BE Hexagonal Architecture and FE API/page patterns. | New source should respect existing layer rules and route/API conventions. | ArchUnit/build/lint in later phase. | No implementation in Phase 1. |
| Observability / Logging | Dedicated audit log implementation is out of scope for this release. | Existing traceId/error logging should remain usable for troubleshooting. | Verify no new audit-log requirement is implemented in this release. | Audit log can be handled in a later ticket if required. |
| Compatibility | Existing Organization table must be migrated safely. | No real staging/production data review is needed for this release. | Migration review/test. | Unique indexes must apply only to records where `deleted_at IS NULL`. |

## 7. Acceptance Criteria
| ACID | description | testable? | notes |
|---|---|---|---|
| AC-ORGANIZATION-1 | Given an ADMIN user opens the Organization Management screen, then the system displays the Organization list with active Organizations by default. | Yes | Non-ADMIN users cannot access this screen. |
| AC-ORGANIZATION-2 | Given Organizations exist, when the user searches by Organization code or Organization name, then matching Organizations are displayed and non-matching records are excluded. | Yes | Maps from AC-ORG-02. |
| AC-ORGANIZATION-3 | Given Organizations have Active and Deleted statuses, when the user selects All / Active / Deleted filter, then the list displays records matching the selected status filter. | Yes | Maps from AC-ORG-03. |
| AC-ORGANIZATION-4 | Given an ADMIN user enters a valid unique code and name, when the user saves, then a new active Organization is created and the screen returns to the Organization List. | Yes | Post-create navigation decided by human owner. |
| AC-ORGANIZATION-5 | Given an existing non-deleted Organization has the same code, when an ADMIN creates an Organization with that code, then the system shows a duplicate-code error and does not create the record. | Yes | Same code as a soft-deleted record is allowed. |
| AC-ORGANIZATION-6 | Given an existing non-deleted Organization has the same name, when an ADMIN creates an Organization with that name, then the system shows a duplicate-name error and does not create the record. | Yes | Same name as a soft-deleted record is allowed. |
| AC-ORGANIZATION-7 | Given an ADMIN edits an Organization code to a value unique among records where `deleted_at IS NULL`, when the user saves with a valid numeric `version`, then the code is updated and version increments; if the submitted version is stale or the code already exists in another non-deleted Organization, then an error is shown and the update is not saved. | Yes | Same code as a soft-deleted record is allowed. |
| AC-ORGANIZATION-8 | Given an ADMIN edits an Organization name to a value unique among records where `deleted_at IS NULL`, when the user saves with a valid numeric `version`, then the name is updated and version increments; if the submitted version is stale or the name already exists in another non-deleted Organization, then an error is shown and the update is not saved. | Yes | Same name as a soft-deleted record is allowed. |
| AC-ORGANIZATION-9 | Given an ADMIN views an active Organization, when the user confirms deletion, then the system soft deletes the Organization via `PATCH /api/v1/organizations/{id}/delete` and does not physically delete the DB record. | Yes | Soft delete endpoint decided by human owner. |
| AC-ORGANIZATION-10 | Given an Organization is soft deleted, when the default list is displayed, then the Organization is not shown; when the status filter is `Deleted`, then it can be viewed read-only. | Yes | Child-data flows are cascade-soft-deleted by this release; restore is out of scope. |
| AC-ORGANIZATION-11 | Given an authenticated non-ADMIN user, when the user attempts to open the Organization Management screen, then FE logs the user out and redirects to `/:lang/login`; when the same user calls Organization APIs directly, BE returns `403 Forbidden`. | Yes | ADMIN-only access and logout-to-login behavior decided by human owner. |
| AC-ORGANIZATION-12 | Dedicated audit log is not implemented in this release. Existing traceId/error logging behavior must not be broken by Organization CRUD changes. | Yes | Audit log mechanism out of scope by human decision. |
| AC-ORGANIZATION-13 | Given an ADMIN opens an edit/delete target with version N and another update/delete changes the same Organization first, when the ADMIN submits version N, then BE returns `409 Conflict` with `Pages.Organization.Conflict.Version`, no overwrite/delete occurs, and FE shows the localized conflict message. | Yes | Requires new `version BIGINT NOT NULL DEFAULT 0` column. |

## 8. Examples

### 8.1. Normal Case

| ID | scenario | input / action | expected result |
|---|---|---|---|
| N-ORGANIZATION-1 | Default Organization list | User with view permission opens Organization Management. | Active Organizations are displayed, sorted by latest updated time by default. |
| N-ORGANIZATION-2 | Search by code | Search keyword `ORG-BVN`. | Organizations whose code matches are displayed. |
| N-ORGANIZATION-3 | Search by name | Search keyword `Brycen`. | Organizations whose name matches are displayed. |
| N-ORGANIZATION-4 | Filter Deleted | User selects status filter `Deleted`. | Only soft-deleted Organizations are displayed. |
| N-ORGANIZATION-5 | Create Organization | Code `ORG-BVN`, name `Brycen Vietnam`, description optional. | Organization is created with status `ACTIVE`. |
| N-ORGANIZATION-6 | Edit Organization code | Change `ORG-BVN` to `ORG-BVN-HQ` with no duplicate. | Organization code is updated. |
| N-ORGANIZATION-7 | Soft delete Organization | Confirm delete for active Organization. | Record status becomes `DELETED`; deleted metadata is set. |
| N-ORGANIZATION-8 | View deleted detail | Open detail for a deleted Organization from Deleted filter. | Read-only detail is shown with Deleted By and Deleted Date. |

### 8.2. Error Case

| ID | scenario | input / action | expected result |
|---|---|---|---|
| E-ORGANIZATION-1 | Missing code | Save create form with empty Organization code. | BE returns `Pages.Organization.Code.Required`; FE shows localized message and does not save. |
| E-ORGANIZATION-2 | Missing name | Save create form with empty Organization name. | BE returns `Pages.Organization.Name.Eequired`; FE shows localized message and does not save. |
| E-ORGANIZATION-3 | Duplicate code on create | Create with an existing code. | BE returns `Pages.Organization.Code.Duplicate`; FE shows localized message and does not create. |
| E-ORGANIZATION-4 | Duplicate code on edit | Edit code to another Organization's code. | BE returns `Pages.Organization.Code.DuplicateOnUpdate`; FE shows localized message and does not update. |
| E-ORGANIZATION-5 | Duplicate name | Create/update with an existing Organization name. | BE returns `Pages.Organization.Name.Duplicate`; FE shows localized message and does not save. |
| E-ORGANIZATION-6 | Edit deleted record | User attempts to edit a soft-deleted Organization. | Show `This Organization has been deleted and cannot be edited.` and do not update. |
| E-ORGANIZATION-7 | Non-ADMIN screen access | Authenticated non-ADMIN user opens Organization Management URL. | FE logs out the user and redirects to `/:lang/login`; direct API call returns `403` with `common.permission.denied`. |
| E-ORGANIZATION-8 | Stale version conflict | ADMIN submits update/delete with stale `version`. | BE returns `409 Conflict` with `Pages.Organization.conflict.version`; no data is overwritten/deleted. |
| E-ORGANIZATION-9 | System error | List/detail/save/delete API fails unexpectedly. | BE returns `Component.Error.Unexpected` and `traceId`; FE shows localized general error with traceId. |

### 8.3. Boundary Case

| ID | scenario | input / action | expected result |
|---|---|---|---|
| B-ORGANIZATION-1 | Code at max length | 50-character Organization code. | Accepted if unique and valid. |
| B-ORGANIZATION-2 | Code over max length | 51-character Organization code. | Rejected. |
| B-ORGANIZATION-3 | Name at max length | 255-character Organization name. | Accepted if unique and valid. |
| B-ORGANIZATION-4 | Name over max length | 256-character Organization name. | Rejected. |
| B-ORGANIZATION-5 | Case-insensitive duplicate | Existing `BRYCEN`; input `brycen`. | Treated as duplicate if case-insensitive rule is adopted. |
| B-ORGANIZATION-6 | Empty list | No Organizations match filter/search. | FE shows localized empty-state message such as key `Pages.Organization.List.Empty`; show Create button only if user has create permission. |
| B-ORGANIZATION-7 | Soft-deleted duplicate reuse | Create new Organization with same code/name as a soft-deleted record. | Allowed, as long as no non-deleted Organization has the same code/name. |
| B-ORGANIZATION-8 | Delete already deleted | Attempt delete on already deleted Organization. | Rejected with already-deleted message. |

## 9. Source Availability Summary

| category | status | summary |
|---|---|---|
| Requirement source | Available | `requirement.md`, `database_design.md`, and `wireframe.md` are available and consistent on core CRUD behavior. |
| Template source | Available | `sources.md`, `00_brainstorm.md`, and `spec-pack.md` templates are available and used. |
| Architecture/standards | Available | Architecture and standards are available for FE/BE/DB/security/testing guidance. |
| Existing BE implementation | Partial | BE framework/patterns exist, but Organization-specific controller/use case/repository/DTO is not implemented. |
| Existing FE implementation | Partial | FE framework/patterns exist, but Organization-specific route/page/API helper is not implemented. |
| Existing DB | Partial | Organization table exists, but required columns/indexes for this ticket are missing. |
| Existing tests | Partial | Test framework and some BE tests exist, but no Organization-specific tests found. |
| External references | Not used | No external/Office/PDF/Web references were needed. |

## 10. Complexity Classification

```text
- Complexity: Complex
- System shape: FE+BE / DB
- Primary risk: Contract / DB / Security / Operation / Test
- Review mode: Heavy
- Required options: FE-BE Contract / DB Migration / Source Analysis / Security Review
```

Reason:

- This is not only a UI change; it requires FE screen/route/API client, BE API/use case/repository/DTO, DB migration, validation, ADMIN authorization, soft delete, optimistic locking, i18n message keys, and tests. Dedicated audit log is out of scope.
- Existing Organization DB table already exists, so migration must handle current data/backfill/duplicates safely.
- Permission model is not yet fully mapped to existing source roles.
- FE/BE contract does not exist yet and must be defined before implementation.

## 11. FE/BE Contract Impact

Contract impact exists.

Candidate APIs from requirement:

| method | endpoint | purpose | decision status |
|---|---|---|---|
| GET | `/api/v1/organizations` | List/search/filter Organizations. | Candidate, needs Phase 3 contract. |
| GET | `/api/v1/organizations/{organizationId}` | Get Organization detail. | Candidate, needs Phase 3 contract. |
| POST | `/api/v1/organizations` | Create Organization. | Candidate, needs Phase 3 contract. |
| PUT | `/api/v1/organizations/{organizationId}` | Update Organization. | Candidate, needs Phase 3 contract. |
| PATCH | `/api/v1/organizations/{organizationId}/delete` | Soft delete Organization. | Human decision on 2026-06-09: use PATCH because deletion is logical/soft delete. |

Specification-level FE/BE contract decisions:

- Create request fields: `organizationCode`, `organizationName`, optional `description`.
- Update request fields: `organizationCode`, `organizationName`, optional `description`, required `version`.
- Soft-delete request fields: required `version`.
- Response DTO fields include `organizationId`, `organizationCode`, `organizationName`, `description`, `status`, timestamps, actors, and `version`.
- Optimistic-lock conflict status: `409 Conflict`; messageKey: `Pages.Organization.Conflict.Version`.
- Non-ADMIN direct Organization API access status: `403 Forbidden`; messageKey: `Component.Permission.Denied`.
- Non-ADMIN screen access: FE logs out and redirects to `/:lang/login`.
- Post-create navigation: return to Organization List.
- FE translations are stored in `public/locales/{en,ja,vi}/locale.json` with the keys listed in section 6.4.1.

Phase 3 only needs to map these decisions to concrete files/classes/hooks/components and final DTO type names.

## 12. DB/Migration Impact

DB/migration impact exists.

Existing table:

```sql
CREATE TABLE IF NOT EXISTS tbl_dim_organization (
    organization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_masked VARCHAR(255) NOT NULL,
    status record_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM'
);
```

Required additions:

| column / index | requirement | note |
|---|---|---|
| `organization_code VARCHAR(50)` | Required business code. | Needs backfill before `NOT NULL` if data exists. |
| `description TEXT` | Optional description. | FE/BE validation max length is 500 characters. |
| `deleted_at TIMESTAMPTZ` | Soft delete timestamp. | Nullable. |
| `deleted_by VARCHAR(100)` | Soft delete actor. | Nullable. |
| `version BIGINT NOT NULL DEFAULT 0` | Numeric optimistic locking token. | New column required because current table has no `version`; create initializes `0`; successful update/delete increments by `1`. |
| `record_status` value `DELETED` | Needed for soft delete. | Confirm enum/type already supports it. |
| Partial unique index on `LOWER(organization_code)` where `deleted_at IS NULL` | Case-insensitive code uniqueness among active/non-deleted records only. | Soft-deleted records do not block reuse. |
| Partial unique index on `LOWER(name_masked)` where `deleted_at IS NULL` | Case-insensitive name uniqueness among active/non-deleted records only. | Soft-deleted records do not block reuse. |
| Index on `status` | Filter by Active/Deleted. | Recommended. |
| Index on `created_at`, `updated_at` | Sorting/list performance. | Recommended. |


Concrete migration design:

```sql
ALTER TABLE tbl_dim_organization
  ADD COLUMN organization_code VARCHAR(50) NOT NULL,
  ADD COLUMN description TEXT NULL,
  ADD COLUMN deleted_at TIMESTAMPTZ NULL,
  ADD COLUMN deleted_by VARCHAR(100) NULL,
  ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX ux_tbl_dim_organization_code_active
  ON tbl_dim_organization (LOWER(organization_code))
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_tbl_dim_organization_name_active
  ON tbl_dim_organization (LOWER(name_masked))
  WHERE deleted_at IS NULL;
```

Migration risks:

- No staging/production data review is required because there is no real existing data to preserve for this feature.
- Migration can create the new schema/constraints directly for this release.
- Unique indexes must allow reuse of code/name from soft-deleted records by applying uniqueness only to records where `deleted_at IS NULL`.
- Rollback consideration is still required in Phase 3, but the schema intent above is fixed by Phase 1.

## 13. Security/Privacy Impact

Security/privacy impact exists.

| item | impact | note |
|---|---|---|
| Authentication | Required for Organization APIs. | Current `/api/**` is authenticated by default. |
| Authorization | Required for all Organization screen/API operations. | Only role `ADMIN` can access this screen and perform actions. |
| UI permission display | Non-ADMIN users must not access the Organization Management screen. | FE must logout and redirect to `/:lang/login`; backend must still enforce authorization. |
| Audit/logging | Dedicated audit log implementation is out of scope for this release. | Keep existing traceId/error logging behavior where applicable. |
| Privacy | Organization name currently maps to `name_masked`. | Avoid renaming/changing masking semantics in this ticket. |
| Error leakage | Do not expose stack traces. | Current global exception handler already returns generic 500 with traceId. |

## 14. Operation/Maintenance Impact

Operation/maintenance impact exists.

- Migration should still be reviewed, but no staging/production data review is needed because there is no real existing data for this feature.
- Rollback plan is needed for DB migration, especially `NOT NULL` and unique indexes.
- Dedicated audit log records are not required in this release; existing application traceId/error logging should remain usable for troubleshooting.
- TraceId should be visible in errors and logs for troubleshooting.
- Default list and status indexes should prevent unnecessary load.
- Customer/Project/Repository/Ticket child-data flows are cascade-soft-deleted by this release; restore is out of scope.

## 15. Test Strategy Summary

| AC | recommended test level | focus |
|---|---|---|
| AC-ORGANIZATION-1 | FE component/page + API integration | Default active list and view permission. |
| AC-ORGANIZATION-2 | BE API integration + FE behavior | Search by code/name. |
| AC-ORGANIZATION-3 | BE API integration + FE behavior | All/Active/Deleted filter. |
| AC-ORGANIZATION-4 | BE API integration + FE form test | Successful create with required fields. |
| AC-ORGANIZATION-5 | BE service/API test + DB constraint/migration test | Duplicate code rejection among non-deleted records; reuse from soft-deleted records allowed. |
| AC-ORGANIZATION-6 | BE service/API test + DB constraint/migration test | Duplicate name rejection among non-deleted records; reuse from soft-deleted records allowed. |
| AC-ORGANIZATION-7 | BE API test + FE form test | Editable code and duplicate update error. |
| AC-ORGANIZATION-8 | BE API test + FE form test | Editable name and duplicate update error. |
| AC-ORGANIZATION-9 | BE API integration + DB verification | Soft delete without physical delete. |
| AC-ORGANIZATION-10 | BE API integration + black-box | Deleted excluded from default list and visible read-only via Deleted filter; child-data tree cascade-soft-deleted. |
| AC-ORGANIZATION-11 | Authorization test + FE route/session test + BE API authorization test | Authenticated non-ADMIN screen access logs out and redirects to `/:lang/login`; direct API call returns `403`. |
| AC-ORGANIZATION-12 | Scope verification | Dedicated audit log is not implemented in this release; verify existing traceId/error behavior is not broken. |
| AC-ORGANIZATION-13 | BE API integration + DB test + FE error display | Stale numeric `version` returns `409 Conflict` with `Pages.Organization.Conflict.Version` and does not overwrite/delete. |

Minimum test types for later phases:

- BE unit/service tests for validation and state rules.
- BE API integration tests for request/response/status/error mapping.
- DB migration test or migration review for added columns, backfill, indexes, and enum value.
- FE component/page tests for list, form validation, permission-based buttons, error display, and i18n translation of BE message keys from `public/locales/{en,ja,vi}/locale.json`.
- Contract tests or typed contract verification for FE/BE DTO alignment.
- Black-box tests for normal/error/boundary cases.

## 16. Human Decision Required
| ID | decision item | decision / result | owner | status |
|---|---|---|---|---|
| HD-ORGANIZATION-1 | Permission mapping for Organization screen/actions. | Only role `ADMIN` can access the Organization Management screen and perform view/create/update/soft-delete operations. | Human / PM / Tech Lead | Decided |
| HD-ORGANIZATION--2 | Soft-delete endpoint. | Use `PATCH /api/v1/organizations/{id}/delete` because deletion is logical/soft delete. | Human / Tech Lead | Decided |
| HD-ORGANIZATION--3 | Description maximum length. | `description` max length is 500 characters. | Human / PM / Tech Lead | Decided |
| HD-ORGANIZATION--4 | Post-create navigation. | After successful create, navigate back to Organization List. | Human / UX | Decided |
| HD-ORGANIZATION--5 | Optimistic locking. | Required. Use numeric `version`; DB column is `version BIGINT NOT NULL DEFAULT 0`; update/delete require version and stale token returns `409 Conflict`. | Human / Tech Lead | Decided |
| HD-ORGANIZATION--6 | Reuse of code/name from soft-deleted records. | Allowed. Soft-deleted records do not block reuse of Organization code/name. | Human / PM / Tech Lead | Decided |
| HD-ORGANIZATION--7 | Existing staging/production data review before migration. | Not required. There is no real data; migration can proceed for new schema. | Human / DBA / Tech Lead | Decided |
| HD-ORGANIZATION--8 | Audit log mechanism. | Dedicated audit log is out of scope for this release. | Human / Tech Lead / Operation | Decided |
| HD-ORGANIZATION--9 | Child-data restriction scope. | Customer/Project/Repository/Ticket are cascade-soft-deleted when Organization is soft deleted; restore is out of scope. | Human / PM / Tech Lead | Updated |
| HD-ORGANIZATION--10 | FE translation resource location and keys for Organization messages. | FE translations are stored in `public/locales/{en,ja,vi}/locale.json`; exact keys/translations are defined in section 6.4.1. | Human / FE Lead / Tech Lead | Decided |
| HD-ORGANIZATION--11 | Non-ADMIN screen access behavior. | Authenticated non-ADMIN access logs out the user and redirects to `/:lang/login`. | Human / PM / FE Lead / Security | Decided |

## 17. Assumptions and Inference Log
| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-ORGANIZATION-1 | Ticket ID is `ORGANIZATION`. | Existing raw folder path `docs/changes/ORGANIZATION/raw/`. | Low. | No |
| A-ORGANIZATION-2 | Organization Name maps to `name_masked` for this ticket. | DB design explicitly states the mapping and says not to rename column. | Medium if masking semantics change later. | No for this ticket; Yes for future privacy redesign. |
| A-ORGANIZATION-3 | Organization APIs use `/api/v1/organizations`. | Requirement proposes these endpoints and current route convention uses `/api/v1`; Spec Pack fixes this as the Organization API base path. | Low. | No |
| A-ORGANIZATION-4 | Case-insensitive uniqueness is adopted. | DB design recommends `LOWER(...)` unique indexes; Spec Pack fixes partial unique indexes on `LOWER(...) WHERE deleted_at IS NULL`. | Medium if implementation misses the index expression. | No |
| A-ORGANIZATION-5 | Soft-deleted records are excluded from uniqueness checks using `deleted_at IS NULL`. | Human decision on 2026-06-09 says deleted records can be created again/reused; follow-up confirmed predicate. | Medium DB/index design impact. | No |
| A-ORGANIZATION-6 | Organization-specific page should follow existing FE `api.ts` and TanStack Query pattern. | Existing `AdminPage.tsx` and `api.ts`. | Low. | No |
| A-ORGANIZATION-7 | New BE code should follow Hexagonal Architecture. | Architecture overview and ArchUnit test. | Low. | No |
| A-ORGANIZATION-8 | Login route is language-scoped as `/:lang/login`. | Architecture entrypoint map documents `/:lang/login`; user confirmed redirect should be Login page. | Low. | No |
| A-ORGANIZATION-9 | `version` is a new DB/API field, not an existing column. | Source check of `V4__init_shema_v2.sql` and human follow-up. | Medium if migration misses it. | No |

## 18. Open Issues
| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-ORGANIZATION-1 | None blocking for Phase 1. | Spec-level decisions for permission, redirect, i18n, optimistic locking, and unique predicate are complete. | Human / Tech Lead | Closed for Phase 1 |
| OI-ORGANIZATION-2 | Phase 3 implementation mapping remains. | Phase 3 must map this Spec Pack to concrete files/classes/routes/tests, but must not re-open the business/design decisions fixed here. | Tech Lead / Dev | Phase 3 task |
