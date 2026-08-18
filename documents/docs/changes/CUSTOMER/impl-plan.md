# Implementation Plan

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung                    
**Update date**: 2026-06-12  

## 1. Implementation Principle

- Implement Customer Management as CRUD-only ADMIN master-data management.
- Do not implement Organization Management, Project Management, Repository Management, dashboards, import/export, restore, or physical delete in this ticket.
- Use existing `tbl_dim_customer`; do not rename or recreate the table.
- Do not modify old migration `V4__init_shema_v2.sql`; create a new Flyway migration.
- Preserve existing data.
- BE is the source of truth for all business rules; FE validation is only for UX.
- Enforce ADMIN-only in BE and FE.
- FE non-ADMIN behavior must logout/clear session and redirect to `/:lang/login`.
- Use soft delete by updating status/deleted metadata; no physical delete.
- Use numeric optimistic locking with `version` for update and delete.
- Use active Organization validation in create/update and list queries.
- Support Customer search by code or alias with case-insensitive keyword matching.
- Soft delete Customer must cascade to its full child tree under `tbl_dim_project`.
- Use current FE API helper `EDCAP_FE/src/lib/api.ts`; do not direct-fetch from UI.
- Keep all user-facing labels/messages translatable in `en`, `ja`, and `vi`.
- Stop/Ask on unresolved API/migration/route decisions before coding those parts.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| DB-A | Rename `tbl_dim_customer` to a new convention | Cleaner naming if conventions changed | Breaks existing schema/data/docs; user rejected table rename | Reject |
| DB-B | Recreate Customer table | Clean schema | High data-loss and FK risk; violates decision | Reject |
| DB-C | Keep `tbl_dim_customer`, add columns/index by new migration | Safe, compatible with existing DB, follows user decision | Requires careful constraint migration | Select |
| UNIQUE-A | Keep `uq_customer_alias_per_org` | No migration complexity | Does not support case-insensitive uniqueness or code reuse after soft delete | Reject |
| UNIQUE-B | Only application duplicate check | Simple initially | Race condition; DB can still allow duplicates | Reject |
| UNIQUE-C | BE check + partial unique indexes on `lower(customer_code) WHERE deleted_at IS NULL` and alias equivalent | Correct active-scope, race-safe | Requires pre-check and migration | Select candidate |
| DELETE-A | Physical delete | Simple SQL | Violates spec and FK safety | Reject |
| DELETE-B | Soft delete with child-tree cascade | Matches spec and preserves history | Needs extra queries/status handling | Select |
| API-UPDATE-A | `PATCH /api/v1/customers/{id}` | Partial-update semantics | `api.patch` not available; edit form is full update | Reject for normal edit |
| API-UPDATE-B | `PUT /api/v1/customers/{id}` | Existing FE helper, full form update | Requires full request DTO | Select candidate |
| API-DELETE-A | `PATCH /api/v1/customers/{id}/delete` | Matches Organization soft-delete pattern and spec draft | Uses existing FE `api.patch` helper | Select |
| API-DELETE-B | `DELETE /api/v1/customers/{id}` with version strategy | REST-like and FE `api.del` exists | No longer aligned with Organization convention | Reject |
| ERROR-A | Add `messageKey` and `messageArgs` to `ErrorResponse` | Matches spec and clearer i18n contract | Cross-cutting BE/FE change | Reject for this ticket |
| ERROR-B | Keep `message` as i18n key | Smaller change | Matches current FE/BE envelope convention | Select |

## 3. Reason for Choosing the Alternative Plan

The selected plan prioritizes safe incremental implementation:

- Keeping `tbl_dim_customer` avoids table rename/recreate risk and follows the user's explicit decision.
- Adding soft-delete/version columns is backward-compatible if implemented by a new migration.
- Replacing the current unique constraint with case-insensitive partial unique indexes is required to satisfy AC-CUSTOMER-15 and code/alias reuse after soft delete.
- Business validation in BE prevents FE-only integrity gaps.
- `PUT` is preferred for normal edit because the existing FE API helper supports `put` and the edit form updates the full editable Customer record.
- Delete endpoint follows the Organization pattern with `PATCH /api/v1/customers/{id}/delete`.
- Error responses keep `message` as the translated message key for this ticket, matching the current FE/BE contract.

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V111__alter_tbl_dim_customer_add_customer_code.sql` | Add `customer_code`; replace unique index strategy for code; keep soft delete/version support | Soft delete, optimistic lock, duplicate rule | AC-CUSTOMER-15,16,17 |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Customer.java` or equivalent | Add Customer model | Domain representation | AC-CUSTOMER-2..17 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/CustomerRepositoryPort.java` | Add repository port | Hexagonal architecture | AC-CUSTOMER-2..17 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CustomerRepositoryAdapter.java` | Add SQL persistence | DB operations and joins | AC-CUSTOMER-2..17 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/CustomerMapper.java` | Add row mapping | DB-to-model mapping | AC-CUSTOMER-2..17 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/.../CustomerService.java` | Add business logic | Validation/rules/transactions | AC-CUSTOMER-3,7,9,11,13,15,16,17 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` | Add Customer REST API | FE/BE contract | AC-CUSTOMER-1..18 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/...` or `Dtos.java` | Add request/response DTOs | API schema | AC-CUSTOMER-2..18 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/*` | Add/adjust standard errors if needed | `403`, `409`, message keys | AC-CUSTOMER-14,16,18 |
| `EDCAP_FE/src/lib/api.ts` or `src/services/customer/*` | Add Customer typed API helpers | FE API calls | AC-CUSTOMER-2..18 |
| `EDCAP_FE/src/router*` | Add Customer route | Screen access | AC-CUSTOMER-1,14 |
| `EDCAP_FE/src/components/Layout.tsx` or menu config | Add menu label | Administration navigation | AC-CUSTOMER-1 |
| `EDCAP_FE/src/pages/CustomerPage.tsx` or `src/pages/customers/*` | Add list/form/detail/delete UI | Customer management screen | AC-CUSTOMER-1..18 |
| `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Add Customer keys | i18n | AC-CUSTOMER-18 |
| BE tests | Add service/API/repository tests | Verification | AC-CUSTOMER-1..18 |
| docs under `docs/changes/CUSTOMER/` | Update test results/report after implementation | Traceability | All AC |

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| `CustomerController#list` | add | filters/page | Customer list/page DTO | GET `/api/v1/customers` |
| `CustomerController#get` | add | `customerId` | Customer detail DTO | GET `/api/v1/customers/{id}` |
| `CustomerController#create` | add | create request + current user | created Customer DTO | POST `/api/v1/customers` |
| `CustomerController#update` | add | `customerId`, update request with `version` | updated Customer DTO | PUT preferred |
| `CustomerController#delete/softDelete` | add | `customerId`, `version` | no body or DTO | `PATCH /api/v1/customers/{id}/delete` |
| `CustomerService#searchCustomers` | add | filter criteria | list/page | Must join active Organization |
| `CustomerService#createCustomer` | add | request + caller | Customer | Validate Organization and duplicate code/alias |
| `CustomerService#updateCustomer` | add | id + request + caller | Customer | Reject deleted, stale version, invalid org, duplicate code/alias |
| `CustomerService#softDeleteCustomer` | add | id + version + caller | void/Customer | Cascade delete child tree; update delete metadata/version |
| `CustomerRepositoryPort` | add | CRUD/query contract | persistence outputs | Names are candidates; verify with implementation style |
| `CustomerRepositoryAdapter` | add | SQL parameters | rows/update counts | Must use parameterized SQL |
| `CustomerMapper` | add | result set/row | Customer model | Follow existing mapper style |
| FE `customerApi.list` | add | filters/page | Customer list | Use `api.get` |
| FE `customerApi.create` | add | create request | Customer | Use `api.post` |
| FE `customerApi.update` | add | id + update request | Customer | Use `api.put` |
| FE `customerApi.delete/softDelete` | add | id + version | void/Customer | Use `api.patch` to call `/delete` |
| FE Customer page/components | add | UI state/events | rendered CRUD UI | Use common components where practical |

## 6. SQL / Query / Repository Policy

- All SQL must be parameterized.
- Customer list must join Organization and exclude inactive/deleted Organization records.
- Default Customer list must filter active/non-deleted Customers.
- Use `status = 'ACTIVE'` and `deleted_at IS NULL` for active Customer once migration exists.
- For Organization active check:
  - Use `o.status = 'ACTIVE' AND o.deleted_at IS NULL` as the source of truth.
- Duplicate check must use case-insensitive code comparison globally and alias comparison within the same Organization active scope.
- Database uniqueness must enforce the same rule using a global partial unique index for code and a per-Organization partial unique index for alias.
- Update/delete optimistic locking must include `version = :version` in the `WHERE` clause.
- If update/delete affected rows = 0, resolve whether not found/deleted/stale version and return the correct status/message.
- Soft delete must update `status = 'DELETED'`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, and `version = version + 1`.
- Active Project check source of truth:
  - `tbl_dim_project.status = 'ACTIVE'`.
  - The current Project source has no soft-delete column, so active Project is status-based for this ticket.

```sql
SELECT 1
FROM tbl_dim_project
WHERE customer_id = :customer_id
  AND status = 'ACTIVE'
LIMIT 1;
```

- Do not physically delete from `tbl_dim_customer`.

## 7. Validation / Error / Logging Policy

Validation:

- `organizationId` required for create/update.
- Organization must exist and be active/non-soft-deleted.
- `customerCode` required, trimmed, length 1-50.
- `customerAlias` required, trimmed, length 1-255.
- `classification` must be `INTERNAL` or `EXTERNAL` unless product expands values.
- `version` required for update/delete.
- Deleted Customer cannot be edited.
- Customer soft delete must cascade to child Projects and descendants.

Error policy candidate:

| case | status | message key candidate |
|---|---:|---|
| Missing code | `400` | `Pages.Customer.Code.Required` or normalized Customer key |
| Code too long | `400` | `Pages.Customer.Code.MaxLength` |
| Duplicate code | `409` | `Pages.Customer.Code.Duplicate` |
| Missing alias | `400` | `Pages.Customer.Alias.Required` or normalized Customer key |
| Alias too long | `400` | `Pages.Customer.Alias.MaxLength` |
| Invalid classification | `400` | `Pages.Customer.Classification.Invalid` |
| Organization missing | `400` | `Pages.Customer.Organization.Required` |
| Organization not found | `404` | `Pages.Customer.Organization.NotFound` |
| Organization inactive/deleted | `422`, `400`, or `409` | `Pages.Customer.Organization.Unavailable` |
| Duplicate alias | `409` | `Pages.Customer.Alias.Duplicate` |
| Customer not found | `404` | `Pages.Customer.NotFound` |
| Deleted cannot edit | `409` or `422` | `Pages.Customer.Deleted.CannotEdit` |
| Active Projects block delete | recommended `409` | `Pages.Customer.Delete.HasActiveProjects` |
| Stale version | `409` | `Pages.Customer.Version.Conflict` |
| Non-ADMIN | `403` | `Pages.Customer.Error.Forbidden` |

Logging:

- Log unexpected server errors with stack trace and traceId.
- Do not log secrets, OAuth/session values, or excessive Customer payloads.
- Business conflicts should be observable but not noisy at error severity.
- Audit fields should be populated from current user if available.

## 8. Migration / Rollback Policy

Migration policy:

1. Do not edit `V4__init_shema_v2.sql`.
2. Add a new versioned Flyway migration.
3. Pre-check case-insensitive duplicates before adding the new unique index.
4. Add `deleted_at`, `deleted_by`, and `version` safely.
5. Backfill existing rows with `version = 0` via default/not-null strategy.
6. Replace `uq_customer_alias_per_org` only after confirming duplicate safety.
7. Create partial unique index for active-scope case-insensitive code and alias uniqueness.
8. Preserve existing seed/demo data.

Rollback policy:

- Prefer app rollback first for additive schema changes.
- Do not immediately drop columns in rollback unless a reviewed rollback migration exists.
- Prepare rollback/remediation for unique index/constraint changes.
- Stop if migration requires destructive data changes.
- If Flyway migration fails, do not manually patch production DB without reviewed remediation.

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Confirm open decisions | `impact-analysis.md`, `impl-plan.md` | Decisions recorded and no open API blockers | Duplicate data, migration risk, or schema mismatch |
| 2 | DB duplicate pre-check | DB query/manual script | No active-scope case-insensitive duplicates | Duplicate data exists |
| 3 | Add Customer migration | New Flyway migration | Migration applies; columns/index exist; data preserved | Migration fails or needs destructive change |
| 4 | Add BE domain/DTO/repository skeleton | BE domain/application/infrastructure files | Compile | Package/style conflict |
| 5 | Implement repository SQL | Repository adapter/mapper | Repository tests/manual SQL | Query cannot satisfy active Organization/Project rules |
| 6 | Implement service/use case | Customer service | Unit/service tests | Business rule ambiguity |
| 7 | Implement controller/API/security | CustomerController + exception handling | API tests: admin/non-admin/status codes | Cannot return standard `403`/message key |
| 8 | Add FE API/types | `src/lib/api.ts` or customer service | Typecheck/build | Delete method unresolved |
| 9 | Add FE route/page/menu | router/Layout/pages/locales | Manual route test; locale JSON valid | Route/menu decision unresolved |
| 10 | Execute planned tests and update docs | test-results/report/self-review | Test evidence recorded | Blocker/Major failures |

## 10. How to Verify Each Step

| step | verification | expected result |
|---|---|---|
| Decision confirmation | Review Open Issues table | No unresolved blocker for implementation scope |
| DB pre-check | Run duplicate query grouping by `organization_id`, `lower(customer_alias)` for non-deleted/active rows | Zero duplicate groups |
| Migration | Run Flyway migration on local/test DB | `deleted_at`, `deleted_by`, `version` added; old data remains; unique index created |
| Repository | Query list/detail/create/update/delete in controlled tests | Correct filtering, duplicate, optimistic locking and Project checks |
| Service | Unit/service tests for business rules | Expected errors/status mapping decisions satisfied |
| Controller | API tests or manual calls | Admin succeeds; unauthenticated `401`; non-admin `403`; validation `400`; conflicts `409` |
| FE API | Typecheck/build and mocked/manual API calls | Uses `src/lib/api.ts`; no direct fetch; handles traceId/message key |
| FE UI | Manual blackbox tests | CRUD flows, filters, non-ADMIN redirect, i18n display work |
| Documentation | Update self-review/test-results/report | Traceability from AC to implementation/test evidence |

Candidate commands to run in later implementation phase:

```bash
cd EDCAP_BE && ./gradlew test
cd EDCAP_FE && npm run build
cd EDCAP_FE && npm run test -- --run
```

Only run commands that exist in the checked package/build files at implementation time.

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-CUSTOMER-1 | FE route/menu Customer Management for ADMIN | ADMIN opens Customer screen from admin area |
| AC-CUSTOMER-2 | BE list API + FE table | Customer list displays records |
| AC-CUSTOMER-3 | List query joins active Organization | Customer under inactive/deleted Organization is excluded |
| AC-CUSTOMER-4 | Default active/non-deleted Customer filter | Soft-deleted Customers are excluded by default |
| AC-CUSTOMER-5 | FE filters + BE query params | Search/filter by Organization, code/alias/name, classification, status |
| AC-CUSTOMER-6 | FE create action/form | ADMIN opens create screen/drawer/form |
| AC-CUSTOMER-7 | Organization options endpoint/filter | Dropdown only displays active/non-soft-deleted Organizations |
| AC-CUSTOMER-8 | Create API/service/DB insert | Valid Customer is created |
| AC-CUSTOMER-9 | BE Organization validation | Create/update with inactive/deleted Organization is rejected |
| AC-CUSTOMER-10 | Detail API + UI detail view | Customer detail opens and shows data/version |
| AC-CUSTOMER-11 | Update API/service | Non-deleted Customer can be edited |
| AC-CUSTOMER-12 | Edit Organization dropdown filter | Disabled/deleted Organizations not selectable |
| AC-CUSTOMER-13 | Soft-delete confirmation + API | ADMIN soft deletes after confirmation |
| AC-CUSTOMER-14 | FE/BE admin-only checks | Non-ADMIN FE logout redirect; direct API `403` |
| AC-CUSTOMER-15 | Duplicate check + unique index | Duplicate code rejected globally; duplicate alias rejected in the same active Organization; deleted code/alias reuse allowed |
| AC-CUSTOMER-16 | Optimistic locking | Stale update/delete returns `409 Conflict` |
| AC-CUSTOMER-17 | Child-tree cascade delete | Soft delete cascades to child Projects and descendants |
| AC-CUSTOMER-18 | i18n message key handling | FE displays messages in current `ja/en/vi` locale |

## 12. Stop / Ask Condition

Stop and ask before implementation if any of the following happens:

- Existing `tbl_dim_customer` schema differs from this analysis.
- Existing data contains duplicate active-scope codes or aliases after `lower(customer_code)` / `lower(customer_alias)` normalization.
- Customer route/menu path diverges from `/:lang/customers`.
- Delete endpoint method diverges from `PATCH /api/v1/customers/{id}/delete`.
- Error response contract diverges from reusing `message` as the translated key.
- Organization active/non-soft-deleted source is not available.
- Organization options endpoint/API is not available and no minimal replacement is approved.
- Project active status semantics differ from `status = 'ACTIVE'`.
- Classification values beyond `INTERNAL`/`EXTERNAL` are required.
- Migration requires destructive data changes.
- Standard `403 Forbidden` cannot be implemented without inconsistent response body.
- Locale key convention remains mixed and cannot be normalized.

## 13. Do Not Do This Ticket

- Do not implement Organization Management UI/CRUD.
- Do not implement Project Management or Project/Repository lists in Customer detail.
- Do not implement dashboard/KPI/statistics/import/export/restore/physical delete.
- Do not rename/recreate `tbl_dim_customer`.
- Do not edit `V4__init_shema_v2.sql`.
- Do not bypass BE validation by relying only on FE filters.
- Do not bypass `EDCAP_FE/src/lib/api.ts` with direct fetch/axios.
- Do not copy `200 OK`/ad-hoc error body patterns.
- Do not implement FE automated tests unless deferred decision changes.
- Do not touch connector ingestion/webhook/metrics flows.

## 14. Open Related Issues

| ID | issue | impact | proposed action |
|---|---|---|---|
| OI-P3-CUS-001 | Exact Customer FE route/menu label | FE UX/doc consistency | Use `/:lang/customers` and `Menu.Customer`, matching the Organization route style |
| OI-P3-CUS-002 | Soft delete endpoint method | API contract and FE helper | Use `PATCH /api/v1/customers/{id}/delete`, matching Organization soft delete |
| OI-P3-CUS-003 | API error contract | FE/BE/i18n consistency | Keep current `message` as the i18n key for this ticket |
| OI-P3-CUS-004 | Inactive/deleted Organization on create/update HTTP status | API contract/test expectation | Confirm `422`, `400`, or `409` |
| OI-P3-CUS-005 | Edit deleted Customer HTTP status | API contract/test expectation | Confirm `409 Conflict` or `422` |
| OI-P3-CUS-006 | Active Project prevents delete HTTP status | API contract/test expectation | Confirm `409 Conflict` recommended |
| OI-P3-CUS-007 | Existing duplicate alias data remediation | Migration safety | Run pre-check before migration; decide remediation if duplicates exist |
| OI-P3-CUS-008 | Organization active/non-soft-deleted schema/source | Dependency with Organization ticket | Use `status = 'ACTIVE' AND deleted_at IS NULL` from the Organization migration/source |
| OI-P3-CUS-009 | Classification source | Validation/UI options | Confirm only `INTERNAL`/`EXTERNAL` for this release |
| OI-P3-CUS-010 | DB integration test setup | Test confidence | Decide Testcontainers/local DB/manual migration verification in later phase |
