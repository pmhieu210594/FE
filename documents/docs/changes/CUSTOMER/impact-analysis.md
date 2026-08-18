# Impact Analysis

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung                    
**Update date**: 2026-06-10  

## 1. Change Content

Implement Customer Management as an ADMIN-only CRUD master-data function.

Expected functional changes from AC/spec:

- Add Customer Management screen in the administration area.
- Allow ADMIN to list, search, filter, create, view detail, edit, and soft delete Customers.
- Filter/search by Organization, Customer alias/name, classification, and status.
- Customer belongs to Organization.
- Create/edit must only allow active/non-soft-deleted Organizations.
- Default Customer list must exclude soft-deleted Customers.
- Enforce Customer alias uniqueness within the same Organization, case-insensitive, only for non-soft-deleted records.
- Allow alias reuse after soft delete.
- Soft delete only; no physical delete.
- Reject edit of soft-deleted Customer.
- Cascade soft delete to the Customer's full child tree under `tbl_dim_project`.
- Use optimistic locking with numeric `version` on update/delete.
- FE non-ADMIN access must logout/clear session and redirect to `/:lang/login`.
- Direct BE API access by non-ADMIN must return `403 Forbidden`.
- BE returns translatable message keys; FE displays messages in `ja/en/vi`.
- Use existing `tbl_dim_customer`; do not rename/recreate the table.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V*__alter_customer_soft_delete_version_alias_index.sql` | Add `deleted_at`, `deleted_by`, `version`; replace unique constraint with active-scope case-insensitive unique index | new |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Customer.java` or equivalent | Customer domain model needed for use case/repository | new candidate |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/CustomerRepositoryPort.java` | Persistence abstraction for Customer list/detail/create/update/soft delete/duplicate/cascade checks | new candidate |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CustomerRepositoryAdapter.java` | SQL implementation against `tbl_dim_customer`, `tbl_dim_organization`, `tbl_dim_project` and descendants | new candidate |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/CustomerMapper.java` | Map DB rows to Customer model/DTO | new candidate |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/.../CustomerService.java` or equivalent | Enforce business rules and transaction boundaries | new candidate |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` | New REST API endpoints under `/api/v1/customers` | new candidate |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/...` or `Dtos.java` | Customer request/response/page/error DTOs | add/update candidate |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Keep current `message`-as-key contract for this ticket | update candidate |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Need standard mappings for `403`, `409`, validation and message key behavior | update candidate |
| `EDCAP_FE/src/lib/api.ts` or Customer API service file | Add typed Customer endpoints; soft-delete uses existing `api.patch` | update/new candidate |
| `EDCAP_FE/src/router.tsx`, `src/router.ts`, `src/router-links.ts`, or equivalent | Add Customer route | update candidate |
| `EDCAP_FE/src/components/Layout.tsx` or menu/sidebar source | Add Customer navigation/menu label if needed | update candidate |
| `EDCAP_FE/src/pages/CustomerPage.tsx` or `src/pages/customers/*` | Customer list/search/filter/create/edit/detail/delete UI | new candidate |
| `EDCAP_FE/src/interfaces/*` or Customer type file | Customer FE types | new/update candidate |
| `EDCAP_FE/public/locales/en/locale.json` | English Customer labels/messages | update |
| `EDCAP_FE/public/locales/ja/locale.json` | Japanese Customer labels/messages | update |
| `EDCAP_FE/public/locales/vi/locale.json` | Vietnamese Customer labels/messages | update |
| BE tests under `EDCAP_BE/src/test/...` | Verify API/service/repository/migration rules | new/update candidate |
| FE/manual test artifacts under `docs/changes/CUSTOMER/*` | Reflect implemented verification results | update in later phase |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Global auth already covers `/api/**`; may not require change if controller-level admin check is used | Low/Medium: avoid weakening global security |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentAppUserResolver.java` | Used to resolve `@CurrentUser` for audit/admin checks | Low: only affected if audit/current user behavior changes |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Role enum source for `ADMIN` | Low: should not need changes |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing schema source | Medium: must not edit; only referenced for compatibility |
| `tbl_dim_organization` and future Organization migration | Customer needs active/non-soft-deleted Organization validation | Medium/High: Customer depends on Organization soft-delete schema if introduced |
| `tbl_dim_project` | Cascade soft delete target | Medium: child-tree cascade must follow schema FK path |
| `EDCAP_FE/src/hooks/useAuth.ts` | FE non-ADMIN logout/redirect behavior | Medium: may need reuse, not broad refactor |
| `EDCAP_FE/src/components/ui/*` | Table/form/search/select/button reuse | Low: avoid breaking shared components |
| `EDCAP_FE/src/i18n.ts` and locale loader | Customer i18n keys | Low: avoid global i18n behavior changes |
| `docs/architecture/fe-be-contract-map.md` | New Customer API contract may need doc sync after implementation | Low: documentation traceability |
| `docs/architecture/repository-db-map.md` | New repository/table mapping may need doc sync after implementation | Low: documentation traceability |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| ADMIN user | Customer route/page | New UI entry point; must be admin-only |
| Non-ADMIN user | Customer route/page | FE must logout/clear session and redirect to `/:lang/login` |
| Customer page | FE Customer API helper | New typed functions for list/detail/create/update/delete/options |
| FE Customer API helper | `EDCAP_FE/src/lib/api.ts` | Must use existing credentials/error behavior; no direct fetch/axios |
| CustomerController | Customer service/use case | Controller should not contain business logic |
| Customer service/use case | CustomerRepositoryPort | Business rules call persistence abstractions |
| CustomerRepositoryAdapter | `tbl_dim_customer` | CRUD, soft delete, optimistic locking, duplicate checks |
| CustomerRepositoryAdapter | `tbl_dim_organization` | Validate active/non-soft-deleted Organization; join for list/detail |
| CustomerRepositoryAdapter | `tbl_dim_project` | Cascade soft delete Projects and descendants |
| CustomerController/service | `@CurrentUser AppUser` | Admin authorization and audit user source |
| Exceptions | `GlobalExceptionHandler` | Standard HTTP status/error body/message key/traceId |
| FE error display | locale files | Translate message keys in `en`, `ja`, `vi` |

## 5. FE Impact

- Add Customer route using the Organization style: `/:lang/customers`.
- Add menu/navigation label, `Menu.Customer`.
- Add Customer list table.
- Add keyword search by alias/name.
- Add filters for Organization, classification, and status.
- Add Organization dropdown/options source for create/edit; must only include active/non-soft-deleted Organizations.
- Add create/edit/detail UI.
- Add soft-delete confirmation.
- Handle API states: loading, empty, validation error, duplicate conflict, stale version conflict, forbidden, active Project delete conflict, general error with traceId.
- Use `EDCAP_FE/src/lib/api.ts`. Current helper has `get`, `post`, `put`, `del`, and `patch`.
- Add Customer i18n labels and messages to `public/locales/{en,ja,vi}/locale.json`.
- Do not add FE automated tests in this phase unless user changes the deferred decision; manual/blackbox cases are planned.

## 6. BE Impact

- Add Customer REST API.
- Add Customer application/use case logic.
- Add Customer persistence port/adapter/mapper.
- Implement list query joining active Organization.
- Implement create/update validation for Organization existence and active/non-soft-deleted status.
- Implement duplicate alias check and database uniqueness protection.
- Implement edit rejection for soft-deleted Customer.
- Implement soft delete with cascade to child Projects and descendants.
- Implement optimistic locking using `version`.
- Implement ADMIN-only authorization and standard `403 Forbidden` response.
- Align error response with the current `message`-as-key contract for this ticket.
- Avoid copying `AdminController` ad-hoc `Map.of("error", ...)` body.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `GET /api/v1/customers` | Add query params: `organizationId`, `keyword`, `classification`, `status`, `page`, `pageSize` | Return paged/list Customer DTO including `version` and Organization name | New endpoint; no existing compatibility risk |
| `GET /api/v1/customers/{customerId}` | Path UUID | Return detail DTO including `version` | New endpoint |
| `POST /api/v1/customers` | Body: `organizationId`, `customerAlias`, `classification` | `200 OK` with Customer DTO or project standard success body | New endpoint |
| `PUT /api/v1/customers/{customerId}` | Body: `organizationId`, `customerAlias`, `classification`, `version` | `200 OK` with updated DTO | New endpoint; preferred for full edit because `api.put` exists |
| `PATCH /api/v1/customers/{customerId}/delete` | Needs `version`; matches Organization soft delete and FE helper supports `patch` | `200 OK` with DTO or project standard response | New endpoint |
| `GET /api/v1/organizations/options` or equivalent | Used by Customer create/edit dropdown | Active/non-soft-deleted Organization options | Dependency endpoint; may belong to Organization ticket |

Status code policy candidates:

| case | proposed status | note |
|---|---:|---|
| Create success | `200 OK` | Aligns with current Customer controller behavior |
| List/detail/update success | `200 OK` | Return DTO/page |
| Soft delete success | `200 OK` with DTO or project standard response | Uses PATCH delete pattern and cascade soft delete |
| Validation error | `400 Bad Request` | Required fields, max length, invalid classification |
| Organization not found | `404 Not Found` | If ID truly missing |
| Organization inactive/deleted | `422`, `400`, or `409` | Keep the implementation aligned with the Organization contract |
| Duplicate alias active-scope | `409 Conflict` | Recommended and consistent with uniqueness conflict |
| Edit deleted Customer | Open: `409` or `422` | Recommended `409` because record state conflicts with edit |
| Soft delete with child Projects | `200 OK` | Cascade soft delete completes the whole child tree |
| Stale version | `409 Conflict` | Required by spec |
| Unauthenticated | `401 Unauthorized` | Existing security behavior |
| Non-ADMIN | `403 Forbidden` | Required by spec |

## 8. DTO / Schema / Validation Impact

### DTO impact

| DTO field | request | response | validation/notes |
|---|---|---|---|
| `customerId` | path for detail/update/delete | yes | UUID, generated by DB |
| `organizationId` | create/update/filter | yes | Required for create/update; Organization must be active/non-soft-deleted |
| `organizationName` | no | yes | From `tbl_dim_organization.name_masked` or future Organization name field |
| `customerAlias` | create/update/search | yes | Required, trim, 1-255, case-insensitive unique within Organization active-scope |
| `classification` | create/update/filter | yes | `INTERNAL`/`EXTERNAL`; default `INTERNAL` |
| `status` | list filter only | yes | `ACTIVE`/`DELETED`; default filter `ACTIVE`; not direct create/edit input |
| `createdAt`, `createdBy`, `updatedAt`, `updatedBy` | no | yes/as needed | Audit fields |
| `deletedAt`, `deletedBy` | no | yes for deleted/status detail | Requires migration |
| `version` | update/delete | yes | Required for optimistic locking |
| `message`, `traceId` | errors | errors | Current BE/FE contract uses `message` as the translated key |

### Validation impact

- FE and BE validate required Organization and Customer alias/name.
- BE is final authority for Organization active/non-soft-deleted validation using `status = 'ACTIVE' AND deleted_at IS NULL`.
- BE rejects duplicate alias case-insensitively within same Organization for records where `deleted_at IS NULL`.
- BE rejects invalid classification outside `INTERNAL`/`EXTERNAL` unless product expands values.
- BE rejects update/delete when `version` mismatches.
- BE rejects update of deleted Customer.
- BE cascade-soft-deletes the full child tree when soft deleting Customer.

## 9. DB / Migration Impact

Existing table `tbl_dim_customer` in V4:

```text
customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
organization_id UUID NOT NULL REFERENCES tbl_dim_organization(organization_id)
customer_alias VARCHAR(255) NOT NULL
classification VARCHAR(50) NOT NULL DEFAULT 'INTERNAL'
status record_status NOT NULL DEFAULT 'ACTIVE'
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM'
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM'
CONSTRAINT uq_customer_alias_per_org UNIQUE (organization_id, customer_alias)
```

Required migration impact:

- Create a new Flyway migration; do not edit V4.
- Add `deleted_at TIMESTAMPTZ NULL`.
- Add `deleted_by VARCHAR(100) NULL`.
- Add `version BIGINT NOT NULL DEFAULT 0`.
- Drop/replace `uq_customer_alias_per_org` safely.
- Add active-scope case-insensitive unique index, candidate:

```sql
CREATE UNIQUE INDEX ...
ON tbl_dim_customer (organization_id, lower(customer_alias))
WHERE deleted_at IS NULL;
```

- Consider including `status <> 'DELETED'` in query predicates, but `deleted_at IS NULL` is the key active-scope index condition per spec.
- Add/adjust indexes for list performance if needed:
  - `organization_id`, `status`, `deleted_at`
  - `lower(customer_alias)` for search/duplicate checks
  - Child-tree cascade may benefit from `(customer_id, status)` if not already covered.
- Pre-check existing data for duplicates before creating new unique index.
- Preserve existing seed row `Customer Demo`.

## 10. Batch / Job / Event Impact

No direct Batch / Job / Event impact found.

- No scheduled job is required by Customer CRUD.
- No GitHub/Jira/CircleCI webhook or connector flow changes are required.
- No evidence ingestion or metric recalculation flow changes are required.
- No domain event publication is required by the current spec.

## 11. Test Impact

| test area | impact | note |
|---|---|---|
| BE validation tests | Required | Required fields, max length, invalid classification, Organization invalid/inactive/deleted |
| BE business rule tests | Required | Duplicate alias, deleted edit rejection, cascade soft delete, optimistic locking |
| BE API/security tests | Required | ADMIN success, unauthenticated `401`, non-ADMIN `403`, status codes |
| Repository/migration tests | Recommended | Columns, unique index, alias reuse after soft delete, duplicate pre-check |
| FE manual tests | Required | Route, list/filter/create/edit/delete, i18n, non-ADMIN logout redirect |
| FE automated tests | Deferred by current decision | Keep skeleton/test plan; implement later if decision changes |
| Blackbox tests | Required in documentation | Use `blackbox-testcases.md` as basis |
| Regression tests | Recommended | Ensure connector/metrics/admin pages unaffected |

## 12. Operation / Monitoring Impact

- Migration must be monitored for constraint/index failures.
- Duplicate alias conflicts should produce clear business errors, not database stack traces.
- Soft delete cascade should be observable through a message key and traceId.
- Error responses should include traceId per existing backend convention.
- Do not log secrets, tokens, session IDs, or full customer-sensitive payloads.
- Audit fields (`created_by`, `updated_by`, `deleted_by`) should use the current user source when available; otherwise follow existing project convention.
- Monitor after rollout:
  - `4xx`/`5xx` on `/api/v1/customers`
  - `403` spikes
  - duplicate `409` rate
  - migration/index failure
  - unexpected active Project delete conflict rate

## 13. Rollout / Rollback Impact

Rollout:

1. Run duplicate pre-check against existing `tbl_dim_customer`.
2. Stop before migration if duplicates would break the new case-insensitive unique index.
3. Deploy backward-compatible DB migration adding nullable soft-delete audit columns and non-null `version DEFAULT 0`.
4. Replace old unique constraint only after verifying/index strategy.
5. Deploy BE API.
6. Deploy FE route/page/i18n.
7. Run smoke/manual tests.

Rollback:

- App rollback should be possible if DB migration is additive/backward-compatible.
- Do not drop Customer data.
- If new unique index causes rollout issues, prepare explicit rollback/remediation script to drop the new index and restore old constraint if necessary.
- Dropping columns is not recommended in immediate rollback; leave unused additive columns in place unless a reviewed rollback migration is approved.
- If migration partially fails, use Flyway repair only after human review.

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| Organization Management UI/CRUD | Unaffected except dependency/options/read validation | CUSTOMER spec says Organization Management is out of range |
| Project Management UI/CRUD | Unaffected except active Project existence check | CUSTOMER spec says Project Management/detail lists are out of range |
| Repository Management | Unaffected | No AC requires repository changes |
| Connector sync / GitHub / Jira / CircleCI | Unaffected | Customer CRUD does not change ingestion/webhook flows |
| Metrics/KPI/dashboard | Unaffected | Spec explicitly excludes dashboard/KPI/statistics |
| Role/Permission Management UI | Unaffected | Customer only consumes ADMIN role; no permission UI changes |
| Bulk import/export/report | Unaffected | Explicitly out of scope |
| Physical delete | Unaffected / forbidden | Spec requires soft delete only |
| Existing table names | Unaffected | User/project decision: keep `tbl_dim_customer` and `tbl_dim_organization` |
| FE automated test implementation | Deferred | Prior decision: prepare skeleton/plan, do not implement FE automated tests now |

## 15. Required Options

| option area | selected / proposed option | rationale |
|---|---|---|
| Table strategy | Keep `tbl_dim_customer`, add/update columns/index only | Existing table already exists; user decision forbids rename/recreate |
| Duplicate alias enforcement | DB partial unique index on `(organization_id, lower(customer_alias)) WHERE deleted_at IS NULL` plus BE check | Prevents race conditions and supports soft-delete alias reuse |
| Update method | Proposed `PUT /api/v1/customers/{customerId}` | Full edit and `api.put` exists |
| Soft-delete method | `PATCH /api/v1/customers/{id}/delete` | Matches Organization soft-delete pattern |
| Error contract | Current `message` field as translated key | Spec and current project convention aligned for this ticket |
| Classification | Proposed `INTERNAL`/`EXTERNAL` only | Spec says this release uses these values |
| Organization options | Prefer Organization API/options endpoint if available; otherwise minimal active Organization options endpoint | Customer UI needs active/non-deleted Organization choices |

## 16. Human Decision Required

| ID | issue | impact | proposed action |
|---|---|---|---|
| OI-P3-CUS-001 | Exact Customer FE route/menu label | FE UX/doc consistency | Done: use `/:lang/customers` and `Menu.Customer`, matching the Organization route style |
| OI-P3-CUS-002 | Soft delete endpoint method | API contract and FE helper | Done: use `PATCH /api/v1/customers/{id}/delete`, matching Organization soft delete |
| OI-P3-CUS-003 | API error contract | FE/BE/i18n consistency | Done: keep current `message` as the i18n key for this ticket |
| OI-P3-CUS-004 | Inactive/deleted Organization status | API contract/test expectation | Confirm `422`, `400`, or `409` |
| OI-P3-CUS-005 | Cascade delete scope and success response | API contract/test expectation | Confirm full child-tree cascade behavior and success code |
| OI-P3-CUS-006 | Existing duplicate alias data remediation | Migration safety | Run pre-check before migration; decide remediation if duplicates exist |
| OI-P3-CUS-007 | Organization active/non-soft-deleted schema source | Dependency with Organization ticket | Done: use `status = 'ACTIVE' AND deleted_at IS NULL` from Organization migration/source |
| OI-P3-CUS-008 | Classification source | Validation/UI options | Confirm only `INTERNAL`/`EXTERNAL` for this release |
| OI-P3-CUS-009 | DB integration test setup | Test confidence | Decide Testcontainers/local DB/manual migration verification in later phase |

## 17. Risk Summary

| risk | severity | mitigation |
|---|---|---|
| Migration fails because existing data violates new case-insensitive active-scope unique rule | Blocker | Pre-check duplicates; Stop/Ask before index creation |
| FE/BE contract diverges on delete method (`PATCH` vs `DELETE`) | Low | Convention now aligns on PATCH |
| Error response does not contain `messageKey` despite spec | Low | Ticket intentionally keeps `message` as the translated key |
| Organization dependency not ready | Major | Block Customer create/edit dropdown and BE validation until active Organization source is available |
| Cascade scope under-specified | Major | Define the full child tree explicitly in implementation if additional descendants exist |
| Current `GlobalExceptionHandler` lacks `422` mapping | Major/Minor depending decision | Use supported status or add explicit exception mapping |
| FE automated tests deferred | Accepted risk | Cover with manual/API tests and document deferred status |
