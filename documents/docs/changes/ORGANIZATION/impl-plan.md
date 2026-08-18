# Implementation Plan

**Ticket ID**: ORGANIZATION            
**Create date**: 2026-06-10      
**Author**: nk_trung        
**Update date**: 2026-06-10 

## 1. Implementation Principle

- Implement only Organization Management scope from `spec-pack.md`; do not implement Customer/Project/Repository/Role management.
- Use the existing table `tbl_dim_organization`; do not rename, drop, recreate, or replace it.
- Keep Organization Name mapped to existing `name_masked`; do not rename `name_masked` in this ticket.
- Add DB changes through a new Flyway migration only; do not edit `V4__init_shema_v2.sql`.
- Follow BE Hexagonal Architecture:
  - web/controller -> application/use case -> persistence port -> infrastructure adapter/mapper -> DB.
  - web/application must not directly depend on infrastructure.
- Enforce ADMIN-only behavior in both FE and BE:
  - FE authenticated non-ADMIN Organization screen access calls existing `logout()` and redirects to `/:lang/login`.
  - BE direct non-ADMIN API access returns HTTP `403 Forbidden` with standard error shape/message key.
- Use soft delete only; never physically delete Organization rows.
- Use numeric optimistic locking with `version`; update/delete require submitted version and stale version returns `409 Conflict`.
- Use FE translations from `public/locales/{en,ja,vi}/locale.json`; do not hard-code user-facing Organization text.
- For current API error contract, treat `ErrorResponse.message` as the i18n key unless a later approved contract introduces `messageKey`.
- Use `EDCAP_FE/src/lib/api.ts` typed endpoint helpers for Organization API calls. Do not add direct `fetch` calls in Organization React components.
- Preserve existing traceId/error logging behavior. Dedicated audit-log storage is out of scope.
- FE automated test implementation remains deferred by user decision; BE/API/DB test planning still applies.

## 2. Alternative Plan
| option | summary | pros | cons | decision |
|---|---|---|---|---|
| DB-A | Rename `tbl_dim_organization` to a new convention | Cleaner if naming convention changed globally | Violates user decision; high migration/data risk; affects FKs | Reject |
| DB-B | Recreate Organization table | Simple clean schema | Data loss risk; violates user decision; breaks existing FKs/seed | Reject |
| DB-C | Keep `tbl_dim_organization` and add required columns/indexes | Preserves existing schema identity; lowest risk; matches user decision | Requires careful backfill/index migration | Select |
| NAME-A | Rename `name_masked` to `organization_name` | Clearer domain name | Explicitly out of scope; migration ripple | Reject |
| NAME-B | Keep `name_masked` and map to Organization Name | Matches spec/current DB | Slight semantic mismatch remains | Select |
| API-A | Use raw English BE messages | Easy to implement | Breaks i18n and locale consistency | Reject |
| API-B | Use existing `ErrorResponse.message` as i18n key | Compatible with current BE/FE docs and rules | Field name is ambiguous | Select for this ticket |
| API-C | Add separate `messageKey` field now | Clearer long-term contract | Requires broader FE/BE contract change | Defer/future option |
| AUTH-A | Copy `AdminController` inline `Map.of("error", ...)` pattern | Quick | Known contract violation; FE cannot reliably handle | Reject |
| AUTH-B | Add/standardize 403 exception/handler or response path | Correct HTTP status and standard shape | Requires small BE error-handling design | Select |
| FEAPI-A | Add Organization calls to `src/lib/api.ts` | Typed helpers, matches current auth/session style | `ApiError.message` is raw key and call sites must translate | Select |
| FEAPI-B | Use `src/utils/api.ts` | Existing message translation wrapper | Different auth style (`Authorization` token) and not selected by ticket rule | Reject |
| FEAPI-C | Direct `fetch` in components | Simple locally | Bypasses shared error/session handling | Reject |
| TEST-A | Implement FE automated tests immediately | Better regression safety | User decided not needed now | Reject/defer |
| TEST-B | Prepare FE test plan/black-box coverage only | Matches user decision | Lower automated FE coverage now | Select |

## 3. Reason for Choosing the Alternative Plan

The selected approach minimizes schema and contract risk while matching the explicit ticket decisions:

- Keeping `tbl_dim_organization` and `name_masked` avoids table/column rename risk and preserves existing foreign keys from `tbl_dim_customer` and other schema areas.
- A new additive Flyway migration is safer than modifying committed V4 migration and aligns with database standards.
- Service-level duplicate checks plus DB partial unique indexes give both user-friendly validation and race-condition protection.
- A standard 403 error path is required because Organization's permission behavior is part of AC-ORGANIZATION-11 and the existing AdminController non-admin pattern is documented as a known violation.
- Using `src/lib/api.ts` keeps Organization aligned with the current React app/auth/session pattern used by `AdminPage` and `useAuth`.
- Deferring FE automated test implementation follows the user's current priority while preserving test planning and black-box coverage for later.

## 4. Expected Change File
| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V{next}__alter_tbl_dim_organization_for_management.sql` | Add/backfill Organization columns and indexes | Required schema for code/description/delete metadata/version/uniqueness | AC-4..10, AC-13 |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Organization.java` | Add Organization domain model | Domain representation for use case/repository | AC-1..10, AC-13 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/OrganizationRepositoryPort.java` | Add persistence port | Preserve hexagonal architecture | AC-1..10, AC-13 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java` | Add business rules/use case | Centralize validation, duplicate checks, soft delete, version handling | AC-1..13 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/OrganizationRepositoryAdapter.java` | Add persistence adapter | Implement repository port | AC-1..10, AC-13 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/OrganizationMapper.java` | Add MyBatis mapper interface | DB access abstraction | AC-1..10, AC-13 |
| `EDCAP_BE/src/main/resources/mapper/OrganizationMapper.xml` | Add SQL for Organization operations | Query/filter/create/update/delete/version checks | AC-1..10, AC-13 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | Add REST endpoints | FE/BE contract surface | AC-1..13 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` or dedicated DTO files | Add request/response records | API contract | AC-1..13 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Add/adjust 403 and conflict handling if needed | Standard error shape/status | AC-11, AC-13 |
| `EDCAP_FE/src/lib/api.ts` | Add Organization types and endpoint helpers | FE API contract | AC-1..13 |
| `EDCAP_FE/src/App.tsx` | Add Organization route and ADMIN guard | Screen access and non-admin logout | AC-1, AC-11 |
| `EDCAP_FE/src/components/Layout.tsx` | Add Organization nav item for ADMIN | Screen discoverability | AC-1, AC-11 |
| `EDCAP_FE/src/pages/OrganizationPage.tsx` or `src/pages/organizations/*` | Add list/form/detail/delete UI | Main FE implementation | AC-1..11, AC-13 |
| `EDCAP_FE/public/locales/en/locale.json` | Add Organization English keys | i18n | AC-1..13 |
| `EDCAP_FE/public/locales/ja/locale.json` | Add Organization Japanese keys | i18n | AC-1..13 |
| `EDCAP_FE/public/locales/vi/locale.json` | Add Organization Vietnamese keys | i18n | AC-1..13 |
| `EDCAP_BE/src/test/java/...` | Add BE tests if in scope | Verify backend/DB/API behavior | AC-1..13 |
| `docs/changes/ORGANIZATION/test-results.md` | Record executed tests later | Ticket evidence | AC-1..13 |
| `docs/changes/ORGANIZATION/report.md` | Record final implementation summary later | Ticket closure | AC-1..13 |

## 5. Class / Function / Method to Add or Modify
| target | action | input | output | note |
|---|---|---|---|---|
| `OrganizationController.list` | add | query params: keyword/code/name/status/page/size/sort | list/page of Organization responses | Exact pagination shape to follow chosen FE/BE convention |
| `OrganizationController.get` | add | `id` UUID | Organization response | Deleted records may be returned read-only |
| `OrganizationController.create` | add | create request DTO | Organization response or success response | Requires ADMIN |
| `OrganizationController.update` | add | `id` UUID + update request DTO with `version` | updated Organization response | Requires ADMIN and non-deleted target |
| `OrganizationController.softDelete` | add | `id` UUID + version | deleted Organization response or no-content/success response | Endpoint fixed by spec: `PATCH /api/v1/organizations/{id}/delete` |
| `OrganizationService.search/list` | add | filter criteria | organizations | Default active filter; All/Deleted handling |
| `OrganizationService.create` | add | code/name/description/caller | created Organization | Required and duplicate validation |
| `OrganizationService.update` | add | id, fields, version, caller | updated Organization | Duplicate + stale-version + deleted-state validation |
| `OrganizationService.softDelete` | add | id, version, caller | deleted Organization or result | Soft delete only; version increments once |
| `OrganizationRepositoryPort` | add | repository method signatures | domain models/results | Do not expose MyBatis types to application layer |
| `OrganizationRepositoryAdapter` | add | port inputs | domain models/results | Delegates to mapper only |
| `OrganizationMapper` / XML | add | MyBatis params | rows/affected count | Include atomic version predicates for update/delete |
| `GlobalExceptionHandler` | modify if needed | authorization/conflict exceptions | `ErrorResponse` with 403/409 | Keep existing traceId behavior |
| `endpoints.organizations.list` | add | filter params | typed list/page response | Use `api.get` from `src/lib/api.ts` |
| `endpoints.organizations.get` | add | id | Organization type | New helper |
| `endpoints.organizations.create` | add | create request | Organization type or success response | New helper |
| `endpoints.organizations.update` | add | id + update request | Organization type | New helper |
| `endpoints.organizations.softDelete` | add | id + version | response | New helper |
| `OrganizationAdminGuard` or equivalent | add | user/loading state | route element or logout side effect | Must avoid repeated logout loops |
| Organization page handlers | add | UI events | API calls/mutations | Use TanStack Query pattern from `AdminPage` |

## 6. SQL / Query / Repository Policy

- New SQL must use `tbl_dim_organization`.
- Do not use `DELETE FROM tbl_dim_organization` for user-facing delete.
- Do not edit existing migration `V4__init_shema_v2.sql`.
- Add a new versioned migration after the latest existing migration.
- Use `organization_id` UUID as primary identifier.
- Use `name_masked` for Organization Name.
- Use `organization_code` for Organization Code.
- Default list should filter non-deleted/active Organizations. Prefer explicit `status = 'ACTIVE'` for default list to match AC wording.
- Status filter mapping:
  - `Active` -> `status = 'ACTIVE'` and `deleted_at IS NULL`.
  - `Deleted` -> `status = 'DELETED'` or `deleted_at IS NOT NULL`, consistent with implementation invariant.
  - `All` -> include active and deleted records allowed by spec.
- Duplicate checks and indexes:
  - code: `LOWER(organization_code)` where `deleted_at IS NULL`.
  - name: `LOWER(name_masked)` where `deleted_at IS NULL`.
- Update should use atomic version condition, e.g. update by `organization_id`, current `version`, and non-deleted state, then check affected row count.
- Soft delete should update `status`, `deleted_at`, `deleted_by`, `updated_by`, increment `version`, and check affected row count.
- Existing trigger updates `updated_at` on update; still set `updated_by` explicitly.
- SQL should support pagination/search/filter without loading all rows.

## 7. Validation / Error / Logging Policy

Validation policy:

- Code required, trimmed non-empty, max 50.
- Name required, trimmed non-empty, max 255.
- Description optional, max 500.
- Status filter must be one of All/Active/Deleted.
- Update/delete require numeric `version`.
- Deleted Organization cannot be edited or deleted again.
- Duplicate code/name among `deleted_at IS NULL` records is invalid; reuse from soft-deleted records is allowed.

Error policy:

- Use standard `ErrorResponse(timestamp,status,error,message,traceId)`.
- For current contract, `message` is the i18n key.
- Permission denied must be HTTP 403, not HTTP 200.
- Stale version must be HTTP 409 with `Pages.Organization.Conflict.Version`.
- Not found should be HTTP 404.
- Validation and duplicate errors should use normalized message keys.
- Do not expose stack traces or internal SQL details to clients.

Logging/operation policy:

- Preserve existing `TraceIdFilter` and MDC behavior.
- Log enough information to troubleshoot create/update/delete outcomes with traceId.
- Do not log secrets, OAuth tokens, or unnecessary PII.
- Dedicated audit log table/storage is out of scope.
- Use actor fields (`created_by`, `updated_by`, `deleted_by`) from current user where available.

## 8. Migration / Rollback Policy

Migration policy:

1. Add new Flyway migration, do not edit V4.
2. Add new columns in a safe order.
3. Backfill `organization_code` for existing rows before `NOT NULL`.
4. Add final `NOT NULL` only after backfill.
5. Add partial unique indexes after duplicate check/backfill.
6. Keep migration additive where possible.
7. Do not drop table/column in this ticket.

Rollback policy:

- App rollback should be possible because DB changes are additive.
- If a new unique index blocks rollout, use a DBA-approved corrective migration/script to drop only the new index or fix data.
- Do not drop added columns immediately unless explicitly approved because they may contain user-entered Organization data.
- If FE rollout fails, revert FE route/nav/page/API changes while leaving BE/DB deployed.
- If BE rollout fails, revert BE Organization source while keeping additive DB migration.
- If data was soft-deleted incorrectly, manual recovery requires business/operation approval because restore deleted Organization is not in functional scope.

## 9. Step Implementation
| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Confirm final API route/update method/message keys/backfill policy | `spec-pack.md`, `ticket-rules.md`, this plan | Decisions recorded before coding | Stop if route, duplicate status, or backfill is not approved |
| 2 | Add Flyway migration for `tbl_dim_organization` | `EDCAP_BE/src/main/resources/db/migration/V{next}__alter_tbl_dim_organization_for_management.sql` | Migration applies; columns/indexes exist; existing rows preserved | Stop if NOT NULL/unique backfill fails or duplicates exist |
| 3 | Add BE domain/port/repository/mapper skeleton | BE domain/application/infrastructure files | Compile; ArchUnit still passes | Stop if layer dependency violation appears |
| 4 | Implement BE repository SQL | `OrganizationMapper.java`, `OrganizationMapper.xml`, adapter | Repository behavior verified by review/test; affected-row counts available | Stop if SQL requires physical delete or table rename |
| 5 | Implement BE use case/service rules | `OrganizationService.java` | Unit/service tests or manual API tests cover validation/duplicates/version/soft delete | Stop if any extra restore flow is introduced |
| 6 | Implement BE controller and authorization | `OrganizationController.java`, exception handling as needed | Admin requests succeed; non-admin direct API returns 403 ErrorResponse | Stop if 403 cannot use standard error shape |
| 7 | Add FE API types/helpers | `EDCAP_FE/src/lib/api.ts` | Typecheck; helpers match BE DTO/endpoint paths | Stop if contract mismatch remains unresolved |
| 8 | Add FE route/admin guard/nav | `App.tsx`, `Layout.tsx` | Admin can enter route; authenticated non-admin triggers logout to `/:lang/login` | Stop if logout loops or language route is lost |
| 9 | Add FE Organization UI | Organization page/components | Manual list/search/filter/create/edit/delete flows work | Stop if common components cannot satisfy required UX and new component approval is needed |
| 10 | Add locale keys | `public/locales/{en,ja,vi}/locale.json` | JSON valid; keys resolve in all languages | Stop if message-key typo/copy cannot be resolved |
| 11 | Execute BE/API/DB tests and manual FE checks | BE tests, black-box checks | AC table can be marked verified where tested | Stop if any blocker AC fails |
| 12 | Update documentation artifacts | `test-results.md`, `report.md`, architecture maps if required | Evidence and known gaps recorded | Stop if source and docs diverge |

## 10. How to Verify Each Step

| step | verification | expected result |
|---|---|---|
| 1 | Review decisions table and open items | No unresolved blocker for route/migration/message keys |
| 2 | Run Flyway migration against test/local DB; inspect table | `tbl_dim_organization` has required columns/indexes; existing rows remain |
| 3 | Run Maven compile and ArchUnit test | No package/layer violation |
| 4 | Exercise mapper queries with sample rows or integration test | Search/filter/detail/update/delete SQL behaves as designed |
| 5 | Service-level tests or API tests for validation/business rules | Required, duplicate, deleted, and stale-version errors are returned correctly |
| 6 | API calls with ADMIN, non-ADMIN, anonymous sessions | ADMIN succeeds; non-ADMIN 403; unauthenticated 401/session behavior preserved |
| 7 | FE typecheck/build | Organization endpoint helpers compile and match API shape |
| 8 | Manual browser route checks | Admin route renders; non-admin route logs out and redirects current language login |
| 9 | Manual black-box UI flow | List/search/filter/create/edit/delete/read-only deleted state meet AC |
| 10 | Load each locale and inspect UI/errors | No raw keys or mojibake; `en`, `ja`, `vi` all contain same key set |
| 11 | Run planned backend tests and manual black-box cases | Test results recorded; no blocker AC failure |
| 12 | Review docs/artifacts | Implementation, tests, gaps, rollback notes are traceable |

## 11. Corresponding AC Table
| AC ID | implementation point | verification |
|---|---|---|
| AC-ORGANIZATION-1 | FE route/page, Organization list API default active filter, ADMIN guard | Admin opens screen and sees active Organizations by default |
| AC-ORGANIZATION-2 | List API search query and FE search input | Search by code/name returns matching records only |
| AC-ORGANIZATION-3 | Status filter mapping in FE/API/SQL | All/Active/Deleted filters return expected status set |
| AC-ORGANIZATION-4 | Create API/service/SQL + FE create form/navigation | Valid unique code/name creates active row and returns to list |
| AC-ORGANIZATION-5 | Duplicate code service check + unique index | Duplicate active/non-deleted code rejected; soft-deleted code reusable |
| AC-ORGANIZATION-6 | Duplicate name service check + unique index | Duplicate active/non-deleted name rejected; soft-deleted name reusable |
| AC-ORGANIZATION-7 | Update code API/service/SQL with version | Unique code updates and increments version; stale/duplicate rejected |
| AC-ORGANIZATION-8 | Update name API/service/SQL with version | Unique name updates and increments version; stale/duplicate rejected |
| AC-ORGANIZATION-9 | Soft-delete endpoint and SQL update only | `PATCH /api/v1/organizations/{id}/delete` sets deleted state; no physical delete |
| AC-ORGANIZATION-10 | Default/deleted filter and read-only deleted detail/edit state | Deleted excluded by default; visible read-only when filtered Deleted |
| AC-ORGANIZATION-11 | FE admin guard/logout + BE 403 authorization | Non-admin screen access logs out to `/:lang/login`; direct API returns 403 |
| AC-ORGANIZATION-12 | Logging/error traceId preservation; no audit table | Existing traceId/error behavior remains; no dedicated audit-log implementation |
| AC-ORGANIZATION-13 | Version column, atomic update/delete, 409 handler, FE error display | Stale version returns 409 `Pages.Organization.Conflict.Version`; no overwrite/delete |

## 12. Stop / Ask Condition

Stop and ask before or during implementation if any of the following occur:

- A solution requires renaming, dropping, or recreating `tbl_dim_organization`.
- A solution requires renaming `name_masked`.
- The migration cannot safely backfill `organization_code` for existing rows.
- Existing rows violate the planned unique indexes on `LOWER(organization_code)` or `LOWER(name_masked)` where `deleted_at IS NULL`.
- The final duplicate error HTTP status is unclear between 400 and 409.
- The final update method is unclear between `PUT` and `PATCH` for non-delete updates.
- Message-key typo/case variants are not resolved before implementation.
- ADMIN role source or non-admin logout behavior conflicts with current authentication flow.
- Standard 403 `ErrorResponse` cannot be implemented without a broader error-handling decision.
- A requirement emerges to add restore support for deleted Organization or its children; restore is out of scope.
- Implementation would require FE automated tests now despite the current deferral decision.
- Layer rules fail and require architecture decision beyond the Organization scope.
- Runtime DB/OpenAPI behavior conflicts with source/spec assumptions.

## 13. Do Not Do This Ticket

- Do not implement Customer Management.
- Do not implement Project/Repository/Team/Member management.
- Do not implement role/permission management UI.
- Do not add dashboard/KPI/statistics/bulk import/export/restore-deleted features.
- Do not rename `tbl_dim_organization`, `tbl_dim_customer`, or `name_masked`.
- Do not edit `V4__init_shema_v2.sql`.
- Do not physically delete Organization rows.
- Do not add dedicated audit-log storage/table integration.
- Do not copy `AdminController`'s `Map.of("error", "ADMIN role required")` pattern.
- Do not add direct `fetch` calls in Organization React components.
- Do not rely on `routerLinks()` maps for Organization because the maps are currently empty.
- Do not introduce `messageKey` as a new API field unless the FE/BE contract is explicitly updated.
- Do not implement FE automated tests now unless the user changes the decision.
- Do not assume Organization-specific methods/classes already exist.

## 14. Open Related Issues

| ID | issue | impact | proposed action |
|---|---|---|---|
| OI-P3-ORG-001 | Exact backfill value/policy for existing `organization_code` rows | Migration safety | Decide before writing migration |
| OI-P3-ORG-002 | Duplicate code/name error HTTP status | API contract/test expectation | Confirm 400 vs 409 before API tests |
| OI-P3-ORG-003 | Update endpoint method for normal edit | FE/BE contract | Confirm `PUT /api/v1/organizations/{id}` or `PATCH /api/v1/organizations/{id}` |
| OI-P3-ORG-004 | Message key normalization | i18n correctness | Normalize typos/case variants before locale/code update |
| OI-P3-ORG-005 | Standard 403 implementation pattern | Security/error consistency | Add dedicated authorization exception/handler or agreed equivalent |
| OI-P3-ORG-006 | Organization route path/menu label | FE UX/doc consistency | Confirm before FE route/nav implementation |
| OI-P3-ORG-007 | DB integration test setup | Test confidence | Decide Testcontainers/local DB/manual migration verification in later phase |
