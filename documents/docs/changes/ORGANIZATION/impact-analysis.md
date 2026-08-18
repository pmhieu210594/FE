# Impact Analysis

**Ticket ID**: ORGANIZATION        
**Create date**: 2026-06-10        
**Author**: nk_trung            
**Update date**: 2026-06-10 

## 1. Change Content

Implement the Organization Management feature described by `docs/changes/ORGANIZATION/spec-pack.md` in a later implementation phase. Phase 3 does not implement code; it defines the affected surface and concrete implementation plan.

Functional change content from AC-ORGANIZATION-1..13:

- Add an ADMIN-only Organization Management screen.
- Display Organization list with active records by default.
- Support search by Organization code and Organization name.
- Support status filter `All`, `Active`, `Deleted`.
- Create Organizations with required code/name and optional description.
- Show Organization detail.
- Edit Organization code, name, and description for non-deleted records only.
- Soft delete Organizations through `PATCH /api/v1/organizations/{id}/delete`; physical delete is forbidden.
- Show soft-deleted Organizations as read-only when filtered by `Deleted`.
- Enforce system-wide, case-insensitive duplicate checks for code/name among records where `deleted_at IS NULL`.
- Allow reuse of code/name from soft-deleted records.
- Enforce optimistic locking with numeric `version`; stale update/delete returns HTTP `409 Conflict` with `Pages.Organization.Conflict.Version`.
- Enforce ADMIN-only access in both FE and BE. FE authenticated non-ADMIN access to the screen logs out and redirects to `/:lang/login`; direct BE API calls return `403 Forbidden`.
- Preserve existing traceId/error logging behavior. Dedicated audit-log storage is out of scope.
- Use existing `tbl_dim_organization`; do not rename, drop, recreate, or rename `name_masked`.

Required DB changes in a later implementation phase:

- Add `organization_code VARCHAR(50)` with safe backfill and final `NOT NULL`.
- Add `description` with max 500 enforced in FE/BE.
- Add `deleted_at TIMESTAMPTZ NULL`.
- Add `deleted_by VARCHAR(100) NULL`.
- Add `version BIGINT NOT NULL DEFAULT 0`.
- Add partial unique indexes:
  - `LOWER(organization_code)` where `deleted_at IS NULL`.
  - `LOWER(name_masked)` where `deleted_at IS NULL`.
- Add recommended indexes for list/filter/sort if agreed: `status`, `created_at`, `updated_at`.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V{next}__alter_tbl_dim_organization_for_management.sql` | Add Organization required columns, backfill, constraints/indexes | new |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Organization.java` | Domain model for Organization master data | new |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/OrganizationRepositoryPort.java` | Application output port for Organization persistence | new |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java` or equivalent use-case package | Implement list/search/filter/create/update/soft-delete business rules | new |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/OrganizationRepositoryAdapter.java` | MyBatis-backed implementation of repository port | new |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/OrganizationMapper.java` | MyBatis mapper interface | new |
| `EDCAP_BE/src/main/resources/mapper/OrganizationMapper.xml` | SQL for list/search/detail/create/update/soft-delete/version checks | new |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | Organization REST API endpoints under `/api/v1/organizations` | new |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` or dedicated DTO file/package | Add Organization request/response DTOs if following current DTO pattern | modify or new |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | May need a specific 403 authorization handler and clear 409 conflict mapping | modify if needed |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/exception/AuthorizationException.java` or equivalent | Standard way to return 403 instead of ad-hoc `Map` | new if chosen |
| `EDCAP_FE/src/lib/api.ts` | Add Organization types and typed endpoint helpers | modify |
| `EDCAP_FE/src/App.tsx` | Add Organization route and ADMIN guard | modify |
| `EDCAP_FE/src/components/Layout.tsx` | Add Organization navigation item for ADMIN users | modify |
| `EDCAP_FE/src/pages/OrganizationPage.tsx` or `EDCAP_FE/src/pages/organizations/*` | Organization list/search/filter/create/edit/detail/delete UI | new |
| `EDCAP_FE/public/locales/en/locale.json` | Add `Pages.Organization` and related message keys | modify |
| `EDCAP_FE/public/locales/ja/locale.json` | Add Japanese Organization translations | modify |
| `EDCAP_FE/public/locales/vi/locale.json` | Add Vietnamese Organization translations | modify |
| `docs/changes/ORGANIZATION/test-plan.md` | Update with concrete verification steps after implementation | modify later |
| `docs/changes/ORGANIZATION/test-results.md` | Fill execution result after test phase | modify later |
| `docs/changes/ORGANIZATION/report.md` | Final implementation report after code/test completion | modify later |

## 3. Indirectly Affected Files
| file | reason | risk |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Existing `/api/**` authentication covers Organization endpoints; role authorization may remain in controller/service or be added here | Medium: do not accidentally expose endpoint publicly |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentAppUserResolver.java` | Organization controller should use `@CurrentUser AppUser` for role/actor | Low: resolver already exists |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Source of `Role.ADMIN` | Low: no change expected |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Reference for current admin behavior and known bad error pattern | Medium: do not copy `Map.of("error", ...)` authorization failure |
| `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | New packages/classes must pass layer rules | Medium: web must not depend on infrastructure; application must not depend on web/infrastructure |
| Existing MyBatis mapper XML files | Reference SQL style and namespace/result mapping | Low: no direct modification expected |
| `EDCAP_FE/src/hooks/useAuth.ts` | Existing logout behavior required by non-ADMIN screen access | Medium: logout redirects to hash route `/#/{lang}/login`; preserve current language |
| `EDCAP_FE/src/i18n.ts` | Locale load behavior and language persistence | Low: no direct change expected |
| `EDCAP_FE/src/components/ui/*` | Reusable UI components for form/table/card/button/badge | Low: use if suitable, do not force if component cannot satisfy behavior |
| `EDCAP_FE/src/router-links.ts` | Empty generated link/API maps exist | Low: ticket rules say do not rely on `routerLinks()` for Organization |
| `EDCAP_FE/src/utils/api.ts` | Legacy/general API wrapper also translates messages | Medium: do not mix with selected `src/lib/api.ts` unless project decision changes |
| `EDCAP_FE/e2e_tests/tests/smoke.spec.ts` | Existing FE E2E only smoke test | Low: FE test implementation deferred; can be a future reference only |
| `docs/architecture/fe-be-contract-map.md` | Contract docs should be updated after implementation | Medium: avoid stale contract docs after adding endpoints |
| `docs/architecture/route-api-map.md` | Route/API map should be updated after implementation | Medium: avoid stale route documentation |
| `docs/architecture/repository-db-map.md` | Repository/DB map should be updated after adding Organization repository | Medium: avoid stale repository docs |

## 4. Caller / Callee
| caller | callee | impact |
|---|---|---|
| Browser route `/:lang/organizations` | `OrganizationPage` / Organization route component | New screen entry point; ADMIN-only guard required |
| `OrganizationPage` | `useAuth()` | Determine current user and ADMIN role; non-ADMIN calls `logout()` |
| `OrganizationPage` | `endpoints.organizations.*` in `src/lib/api.ts` | Fetch list/detail and perform create/update/soft-delete |
| `OrganizationPage` | `useTranslation("locale")` | Render localized labels/messages |
| `OrganizationPage` | common UI components (`Button`, `Card`, table/form components) | Render list, filters, form, status, actions |
| `endpoints.organizations.list` | `GET /api/v1/organizations` | Search/filter/pagination contract |
| `endpoints.organizations.get` | `GET /api/v1/organizations/{id}` | Detail/read-only view contract |
| `endpoints.organizations.create` | `POST /api/v1/organizations` | Create contract |
| `endpoints.organizations.update` | `PUT /api/v1/organizations/{id}` or selected update method | Edit contract with `version` |
| `endpoints.organizations.softDelete` | `PATCH /api/v1/organizations/{id}/delete` | Soft-delete contract with `version` |
| `OrganizationController` | `OrganizationService` | Controller delegates business rules; no SQL in web layer |
| `OrganizationController` | `@CurrentUser AppUser` | Role/actor enforcement and created_by/updated_by/deleted_by values |
| `OrganizationService` | `OrganizationRepositoryPort` | Persistence operations and duplicate/version checks |
| `OrganizationRepositoryAdapter` | `OrganizationMapper` | Adapter delegates SQL to MyBatis mapper |
| `OrganizationMapper` | `tbl_dim_organization` | DB reads/writes/search/filter/indexed uniqueness |
| `OrganizationService` | `DomainException` / `NotFoundException` / conflict exception | Standard error mapping with i18n message keys |
| `GlobalExceptionHandler` | `ErrorResponse` | Standard error envelope with `traceId` |
| `TraceIdFilter` | MDC / response header | Existing operation troubleshooting path must remain intact |

## 5. FE Impact

- Add Organization route under the existing language-scoped React Router structure in `App.tsx`.
- Add an Organization navigation item in `Layout.tsx`, visible only to ADMIN users following the existing `adminOnly` nav filtering style.
- Add an Organization ADMIN guard. Existing `RequireAuth` only checks authentication; Organization requires role `ADMIN`. If authenticated non-ADMIN opens the Organization screen, call existing `logout()` and redirect to the current-language login route.
- Add Organization page/components for:
  - list,
  - search by code/name,
  - status filter All/Active/Deleted,
  - detail/read-only deleted state,
  - create,
  - edit,
  - soft-delete confirmation.
- Add Organization typed API helpers and types in `EDCAP_FE/src/lib/api.ts`; do not introduce direct fetch calls in components.
- Add i18n keys under `Pages.Organization` and related `Component.*` keys in `public/locales/{en,ja,vi}/locale.json`.
- Normalize spec typo variants before adding locale keys; do not add `Pages.Organization.Name.Eequired`, `Pages.Organization.conflict.version`, or `Organizationc` copy.
- FE validation impact:
  - code required, max 50,
  - name required, max 255,
  - description optional, max 500,
  - version required for update/delete,
  - status filter limited to All/Active/Deleted.
- FE error impact:
  - display localized duplicate/validation/not-found/conflict/permission messages from BE i18n keys,
  - handle HTTP 409 stale version,
  - handle HTTP 403 from direct API calls if a non-admin path is reached.
- FE automated test implementation remains deferred by user decision. Manual/black-box and future test plan remain affected.

## 6. BE Impact

- Add Organization endpoint handlers under `/api/v1/organizations`.
- Implement ADMIN authorization for every Organization endpoint. Direct non-ADMIN calls must return HTTP `403 Forbidden` with standard error shape/message key, not `200 OK` with error map.
- Add Organization business rules in application/use-case layer:
  - required validation,
  - duplicate code/name among non-deleted records,
  - default status `ACTIVE`,
  - exclude deleted from default list,
  - deleted records read-only,
  - soft delete only,
  - optimistic locking with numeric `version`.
- Add Organization persistence port/adapter/mapper following existing Hexagonal Architecture and MyBatis patterns.
- Add SQL using `tbl_dim_organization` and existing `name_masked` mapping.
- Do not call infrastructure directly from web/application layers; `LayerEnforcementTest` must continue passing.
- Error handling impact:
  - `NotFoundException` can map to 404 with i18n key message.
  - `DomainException` can map business validation/duplicate/deleted-state errors to 400 if current convention is retained.
  - A conflict-specific exception or `ApplicationException` can map stale version to 409.
  - A dedicated authorization exception/handler may be needed for 403 because current generic mappings do not provide 403.
- Logging/trace impact:
  - Keep `TraceIdFilter` behavior intact.
  - Do not add dedicated audit-log storage.
  - Use actor fields from current user for created/updated/deleted metadata.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `GET /api/v1/organizations` | New query params: search/code/name keyword, status filter, pagination/sort if chosen | New list response containing organization rows and pagination if implemented | Yes, new endpoint |
| `GET /api/v1/organizations/{id}` | New path param `id` UUID | New Organization detail response; deleted records can be viewed read-only | Yes, new endpoint |
| `POST /api/v1/organizations` | New body: `organizationCode`, `organizationName`, `description` | New Organization response or success message key; created record has `status=ACTIVE`, `version=0` | Yes, new endpoint |
| `PUT /api/v1/organizations/{id}` or equivalent update method | New body: editable fields and required `version` | Updated Organization response; version increments once | Yes, new endpoint |
| `PATCH /api/v1/organizations/{id}/delete` | New body or query containing required `version`; path UUID | Soft-deleted Organization response or success status/message; version increments once | Yes, new endpoint |
| Organization error responses | Validation, duplicate, not-found, deleted-state, stale-version, permission errors | Standard `ErrorResponse(timestamp,status,error,message,traceId)` where `message` is i18n key under current contract | Yes, but must not copy current AdminController map error pattern |

API status code impact:

| scenario | expected status | expected message key / behavior |
|---|---|---|
| Missing/blank code/name | 400 | `Pages.Organization.Code.Required` / `Pages.Organization.Name.Required` |
| Description > 500 | 400 | Organization description length key from normalized i18n list |
| Duplicate code among non-deleted rows | 400 or 409 by final BE policy | `Pages.Organization.Code.Duplicate` |
| Duplicate name among non-deleted rows | 400 or 409 by final BE policy | `Pages.Organization.Name.Duplicate` |
| Not found | 404 | `Pages.Organization.NotFound` |
| Edit/delete soft-deleted row | 400 or 409 by final BE policy | Deleted/read-only state key |
| Stale version | 409 | `Pages.Organization.Conflict.Version` |
| Direct non-ADMIN API request | 403 | `Component.Permission.Denied` or normalized permission key |
| Unauthenticated API request | 401 | Spring Security behavior; no Organization-specific override required unless needed |

## 8. DTO / Schema / Validation Impact

| logical field | FE/API DTO impact | BE/domain impact | DB impact | validation impact |
|---|---|---|---|---|
| `organizationId` | Response/path field as UUID string | Domain identifier | Existing `organization_id UUID PRIMARY KEY` | Required for detail/update/delete path |
| `organizationCode` | Required in create/update; shown in list/detail/search | Business key | New `organization_code VARCHAR(50)` | Required, trim, max 50, case-insensitive active-scope unique |
| `organizationName` | Required in create/update; shown in list/detail/search | Maps to domain display name | Existing `name_masked VARCHAR(255) NOT NULL` | Required, trim, max 255, case-insensitive active-scope unique |
| `description` | Optional create/update/detail field | Optional description | New `description TEXT NULL` | Max 500 enforced in FE/BE |
| `status` | List/detail field and filter value | `ACTIVE`/`DELETED` state | Existing `status record_status` | New records default `ACTIVE`; soft delete sets `DELETED`; All is filter only |
| `version` | Response field; required in update/delete request | Optimistic locking token | New `version BIGINT NOT NULL DEFAULT 0` | Missing/stale invalid; successful update/delete increments once |
| `createdAt`, `createdBy` | Response metadata if included | Actor/timestamp metadata | Existing columns | Set on create; avoid exposing unnecessary actor details if not required |
| `updatedAt`, `updatedBy` | Response metadata if included | Actor/timestamp metadata | Existing columns + existing trigger for `updated_at` | Set/update on create/update/delete |
| `deletedAt`, `deletedBy` | Response metadata for deleted detail if included | Delete metadata | New nullable columns | Set only on soft delete; null for active rows |

Schema/migration impact:

- Existing V4 table must not be edited. Add a new Flyway migration after the current latest migration.
- Existing seed rows must be handled before `organization_code` becomes `NOT NULL`.
- Partial unique indexes must use `WHERE deleted_at IS NULL` to allow reuse from soft-deleted records.
- Because `deleted_at` is null for any non-deleted status, uniqueness applies to `ACTIVE`, `INACTIVE`, and `ARCHIVED` if they exist. This is consistent with the current predicate but should be noted.

Validation impact:

- FE validation improves UX but BE validation is authoritative.
- DB unique indexes protect against race conditions and double-submit duplicates.
- Version check must be atomic in update/delete SQL, for example by including `WHERE organization_id = ? AND version = ? AND deleted_at IS NULL` and checking affected row count.

## 9. DB / Migration Impact

Direct DB impact exists.

Current table from `V4__init_shema_v2.sql`:

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

Required later migration policy:

1. Do not modify `V4__init_shema_v2.sql`.
2. Create a new versioned Flyway migration.
3. Preserve `tbl_dim_organization` identity and existing data.
4. Add missing columns safely.
5. Backfill `organization_code` for existing rows before enforcing `NOT NULL`.
6. Add partial unique indexes after duplicate/backfill safety is verified.
7. Do not use physical delete SQL for Organization soft delete.

Candidate safe migration sequence:

```sql
ALTER TABLE tbl_dim_organization
  ADD COLUMN organization_code VARCHAR(50),
  ADD COLUMN description TEXT NULL,
  ADD COLUMN deleted_at TIMESTAMPTZ NULL,
  ADD COLUMN deleted_by VARCHAR(100) NULL,
  ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Backfill strategy must be deterministic and approved before implementation.
-- Example only: derive from name + short id, or set approved seed code for known seed rows.

ALTER TABLE tbl_dim_organization
  ALTER COLUMN organization_code SET NOT NULL;

CREATE UNIQUE INDEX ux_tbl_dim_organization_code_active
  ON tbl_dim_organization (LOWER(organization_code))
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_tbl_dim_organization_name_active
  ON tbl_dim_organization (LOWER(name_masked))
  WHERE deleted_at IS NULL;
```

Rollback/migration risks are covered in section 13.

## 10. Batch / Job / Event Impact

No direct Batch / Job / Event impact found.

| area | impact | evidence |
|---|---|---|
| GitHub webhook | No direct impact | Organization CRUD does not change `GithubWebhookController` or ingestion flow |
| CircleCI webhook | No direct impact | Organization CRUD does not change `CircleCiWebhookController` |
| Connector orchestrator | No direct impact | Organization CRUD is master-data admin, not connector run execution |
| Scheduled jobs | No direct impact | No scheduled/batch Organization job found in source/spec |
| Application events | No direct impact | No event bus/publisher requirement in spec; dedicated audit log out of scope |

Indirect operational note: Organization table is referenced by downstream dimension tables such as `tbl_dim_customer`; Organization soft delete now cascades through the full child tree, so downstream rows are marked deleted/inactive rather than left active.

## 11. Test Impact

| test area | impact | expected later coverage |
|---|---|---|
| BE architecture test | Existing `LayerEnforcementTest` must continue passing | Run `mvn test`; ensure new packages comply with hexagonal rules |
| BE domain/service tests | New tests needed | Required validation, duplicate checks, soft delete, deleted-state, version conflict |
| BE repository/mapper tests | New tests recommended | SQL list/search/filter, partial unique behavior, atomic version update/delete |
| BE API/controller tests | New tests needed | HTTP status, request/response DTO, 403, 404, 400, 409, traceId/error response |
| DB migration tests/review | New validation needed | Required columns, indexes, backfill, existing row preservation |
| FE unit/component tests | Impact exists but implementation deferred | Plan for route/admin guard/list/form/i18n; do not implement now unless decision changes |
| FE E2E/black-box tests | Manual/future automated tests needed | Admin and non-admin flows, search/filter/create/edit/delete/stale version |
| Contract tests | New tests recommended | FE `src/lib/api.ts` types and BE DTO/status/message-key alignment |
| Regression tests | Existing auth/admin routes must still work | `/:lang/login`, `/:lang/admin`, `/api/v1/me`, `/api/v1/admin/connectors` unaffected |

## 12. Operation / Monitoring Impact

- Deployment must include DB migration and application code in a safe order.
- Monitor Flyway migration result, especially backfill and unique-index creation.
- Monitor `/api/v1/organizations` HTTP 4xx/5xx after rollout.
- Pay attention to:
  - 403 spike from non-admin access,
  - 409 stale version conflicts,
  - 400 duplicate/validation errors,
  - DB unique constraint violations,
  - unexpected 500 errors with traceId.
- Existing `TraceIdFilter` / `ErrorResponse.traceId` behavior must remain intact.
- Dedicated audit log storage/table is out of scope and must not be added.
- Actor fields (`created_by`, `updated_by`, `deleted_by`) support operational traceability but are not a full audit log.
- Do not log secrets, OAuth token attributes, unnecessary PII, stack traces to clients, or raw sensitive payloads.

## 13. Rollout / Rollback Impact

Rollout impact:

1. Apply DB migration in a controlled environment.
2. Verify `tbl_dim_organization` has new columns and indexes.
3. Deploy BE with Organization API.
4. Deploy FE with Organization route/page/i18n keys.
5. Smoke-check admin and non-admin behavior.
6. Monitor errors and DB constraint failures.

Rollback impact:

| rollback item | approach | limitation |
|---|---|---|
| FE rollback | Revert FE route/page/nav/API/i18n changes | Safe if BE remains deployed; new API becomes unused |
| BE rollback | Revert Organization controller/service/repository code | Safe if DB migration is additive and compatible |
| DB rollback | Prefer not to drop columns immediately; use forward migration if needed | Flyway Community has no automatic down migration; dropping columns/indexes can lose data |
| Unique index rollback | Drop only the new Organization unique indexes if they block rollout unexpectedly | Requires DBA-approved corrective migration/script |
| Data rollback | For mistaken soft delete, manual update may be possible if allowed by business owner | Restore deleted Organization is out of functional scope; operational recovery requires approval |

Rollback plan must avoid destructive actions unless DBA/Tech Lead approves.

## 14. Areas Determined to be Unaffected and Based on
| area | judgment | evidence |
|---|---|---|
| Customer Management implementation | Affected by cascade soft delete | Child Customer rows are soft deleted together with Organization; restoration is not supported |
| Project/Repository/Team/Member management | Affected by cascade soft delete | Child Project/Repository/Team rows are soft deleted together with Organization; restoration is not supported |
| GitHub/Jira/CircleCI connector ingestion | Unaffected | Organization CRUD does not change connector ports/controllers; no AC mentions connector flows |
| Webhook endpoints | Unaffected | No AC changes `/api/v1/webhooks/**` |
| Demo parser endpoint | Unaffected | BE-only dev tool unrelated to Organization |
| Existing `tbl_dim_customer` name | Unaffected | User confirmed current table names stay; Organization ticket does not modify Customer implementation |
| `tbl_dim_organization` table name | Must not change | User confirmed and ticket rules forbid rename/recreate |
| `name_masked` column name | Must not change | Spec says Organization Name maps to `name_masked`; ticket rules forbid rename |
| Dedicated audit log storage | Unaffected / not implemented | AC-ORGANIZATION-12 and spec out-of-scope decision |
| Physical delete behavior | Forbidden | Spec and ticket rules require soft delete only |
| FE automated test implementation | Deferred | User decision: test artifacts only; no FE test code now |
| Batch / Job / Event | No direct impact | No source/spec dependency found |
| Role/Permission management UI | Unaffected / out of scope | Spec excludes separate role/permission UI |
| Bulk import/export | Unaffected / out of scope | Spec excludes bulk import/export |
| Restore deleted Organization | Unaffected / out of scope | Spec excludes restore deleted Organization; no restore flow is implemented |

## 15. Required Options

| option area | options | selected / recommended | reason |
|---|---|---|---|
| DB table strategy | Rename table / recreate table / keep existing table and alter columns | Keep existing `tbl_dim_organization` and add columns/indexes | User decision; avoids data loss and naming churn |
| Organization name column | Rename `name_masked` / keep mapping to `name_masked` | Keep `name_masked` | Spec explicitly maps name to existing column and excludes rename |
| Soft delete marker | `status='DELETED'` only / `deleted_at` only / both status and delete metadata | Both status and delete metadata | Spec requires `status='DELETED'`, `deleted_at`, `deleted_by`; partial uniqueness uses `deleted_at IS NULL` |
| Duplicate enforcement | Service-only / DB-only / service + DB unique indexes | Service + DB unique indexes | Good UX plus race-condition protection |
| API message field | Add `messageKey` now / use existing `message` as i18n key | Use existing `message` as i18n key for now | Ticket rules align with current `ErrorResponse` contract |
| Authorization implementation | Copy AdminController inline check / add standard guard/exception pattern | Standard 403 error pattern | Must not copy known contract violation |
| FE API helper | `src/lib/api.ts` / `src/utils/api.ts` / direct fetch | `src/lib/api.ts` | Ticket rule selects typed endpoint helpers |
| FE test timing | Implement now / defer with plan | Defer with plan | User decision |

## 16. Human Decision Required

| ID | decision | needed before | impact if not decided |
|---|---|---|---|
| HD-P3-ORG-005 | Exact backfill strategy for `organization_code` on existing rows | DB migration implementation | Migration can fail or create bad business codes |
| HD-P3-ORG-006 | Confirm normalized message keys and copy fixes | FE/BE i18n implementation | Raw keys/typos may appear in UI |
| HD-P3-ORG-007 | Confirm final HTTP status for duplicate code/name: 400 vs 409 | BE API implementation | FE/BE tests and contract may diverge |
| HD-P3-ORG-008 | Confirm route path label: e.g. `/:lang/organizations` and nav text | FE implementation | Route/docs/menu may diverge from UX expectation |
| HD-P3-ORG-009 | Confirm whether update uses `PUT /api/v1/organizations/{id}` or `PATCH /api/v1/organizations/{id}` | BE/FE contract implementation | API helper/controller mismatch risk |

## 17. Risk Summary

| risk | severity | mitigation |
|---|---|---|
| Unsafe DB migration/backfill for `organization_code NOT NULL` | high | Use multi-step migration and stop/ask for backfill value/policy |
| Authorization returns wrong shape/status | high | Add standard 403 handling; do not copy AdminController map response |
| Layer violation in BE | high | Follow web -> application -> port -> infrastructure; run ArchUnit test |
| Stale version update not atomic | high | Use SQL affected-row count with `version` in WHERE clause; test 409 path |
| Duplicate check race condition | high | Use DB partial unique indexes in addition to service pre-check |
| i18n key typo copied from spec | medium | Normalize keys before code/locale implementation; review all locale files |
| FE route logs out non-admin too late or loops | medium | Implement explicit Organization admin guard using `useAuth()` loading state and `logout()` once |
| Existing tests insufficient | medium | Add BE tests later; record FE test deferral and manual black-box coverage |
| Runtime OpenAPI/DB unavailable in planning phase | medium | Verify during implementation/test phase before marking AC complete |
