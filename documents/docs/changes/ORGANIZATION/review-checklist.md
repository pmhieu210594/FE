# Review Checklist

**Ticket ID**: ORGANIZATION  
**Create date**: 2026-06-10  
**Author**: nk_trung  
**Update date**: 2026-06-10  

## 1. Specification/AC Matching

Review result values: `PASS` / `FAIL` / `N/A` / `PASS` / `Accepted Risk`.

| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-ORGANIZATION-1 | ADMIN user can open Organization Management screen; default list shows active Organizations only. | Major | PASS |
| AC-ORGANIZATION-2 | Search by Organization code/name returns matching records and excludes non-matches. | Major | PASS |
| AC-ORGANIZATION-3 | Status filter `All` / `Active` / `Deleted` returns the correct record set. | Major | PASS |
| AC-ORGANIZATION-4 | ADMIN can create a valid active Organization with unique code/name and return to the Organization list. | Major | PASS |
| AC-ORGANIZATION-5 | Duplicate active Organization code is rejected with localized duplicate-code error; same code as soft-deleted record is allowed. | Blocker | PASS |
| AC-ORGANIZATION-6 | Duplicate active Organization name is rejected with localized duplicate-name error; same name as soft-deleted record is allowed. | Blocker | PASS |
| AC-ORGANIZATION-7 | Edit Organization code requires valid numeric `version`; unique update succeeds and stale/duplicate update is rejected. | Blocker | PASS |
| AC-ORGANIZATION-8 | Edit Organization name requires valid numeric `version`; unique update succeeds and stale/duplicate update is rejected. | Blocker | PASS |
| AC-ORGANIZATION-9 | Soft delete uses `PATCH /api/v1/organizations/{id}/delete` and never physically deletes the DB record. | Blocker | PASS |
| AC-ORGANIZATION-10 | Soft-deleted Organizations are hidden by default and visible read-only via `Deleted` filter. | Major | PASS |
| AC-ORGANIZATION-11 | FE logs out authenticated non-ADMIN users and redirects to `/:lang/login`; direct BE API access returns `403 Forbidden`. | Blocker | PASS |
| AC-ORGANIZATION-12 | Dedicated audit log is not implemented; existing traceId/error logging behavior is preserved. | Major | PASS |
| AC-ORGANIZATION-13 | Stale edit/delete version returns `409 Conflict` with `Pages.Organization.Conflict.Version`; no overwrite/delete occurs. | Blocker | PASS |

### 1.1. AC Traceability Table

| AC ID | Specification summary | Design / implementation area | Required evidence | Related review items | Status |
|---|---|---|---|---|---|
| AC-ORGANIZATION-1 | ADMIN opens list with active default | FE route/page, BE list API, status filter default | Screenshot/manual result, API response, test result | FE-001, FE-002, BE-001, TEST-001 | PASS |
| AC-ORGANIZATION-2 | Search by code/name | FE search form, BE query, repository SQL | Search test for code/name/non-match | FE-005, BE-006, DB-008, TEST-002 | PASS |
| AC-ORGANIZATION-3 | All/Active/Deleted filter | FE filter state, BE list query, deleted handling | Filter test for each status | FE-006, BE-007, DB-008, TEST-003 | PASS |
| AC-ORGANIZATION-4 | Create unique Organization | FE create form, POST API, service validation, insert SQL | Create success test and DB row verification | FE-007, BE-002, BE-008, DB-006, TEST-004 | PASS |
| AC-ORGANIZATION-5 | Duplicate code rejection | Service duplicate check, partial unique index on `LOWER(organization_code)` | Duplicate active rejected; soft-deleted reuse allowed | BE-009, DB-009, TEST-005 | PASS |
| AC-ORGANIZATION-6 | Duplicate name rejection | Service duplicate check, partial unique index on `LOWER(name_masked)` | Duplicate active rejected; soft-deleted reuse allowed | BE-010, DB-010, TEST-006 | PASS |
| AC-ORGANIZATION-7 | Edit code with version | PUT API, service version check, update SQL | Valid update increments version; stale/duplicate rejected | FE-008, BE-011, BE-012, TEST-007 | PASS |
| AC-ORGANIZATION-8 | Edit name with version | PUT API, service version check, update SQL | Valid update increments version; stale/duplicate rejected | FE-008, BE-011, BE-012, TEST-008 | PASS |
| AC-ORGANIZATION-9 | Soft delete only | DELETE/PATCH delete UI, PATCH soft-delete API, update SQL | DB record remains; `deleted_at`/status updated | FE-009, BE-013, DB-011, TEST-009 | PASS |
| AC-ORGANIZATION-10 | Deleted default/read-only behavior | FE default filter/read-only UI, BE list/detail behavior | Deleted excluded by default; read-only in Deleted view | FE-010, BE-014, TEST-010 | PASS |
| AC-ORGANIZATION-11 | ADMIN-only access | FE guard/logout, BE authorization, error response | Non-admin FE and API tests | FE-002, SEC-001, SEC-002, TEST-011 | PASS |
| AC-ORGANIZATION-12 | No dedicated audit log; traceId preserved | Error handling/logging only; no audit table implementation | Error response/log evidence; no audit table added | OP-001, OP-002, DOC-004 | PASS |
| AC-ORGANIZATION-13 | Stale version conflict | Version column, atomic update/delete, 409 handler, FE localized error | Concurrent/stale test returns 409 and no data overwrite | BE-012, DB-012, FE-011, TEST-012 | PASS |

## 2. General System Review

### 2.1. Number/Input Check

- [x] `version` is required for edit/delete operations that need optimistic locking.  Missing/non-numeric/stale version is rejected safely.
- [x] Pagination parameters, if implemented, are validated. Invalid page/size cannot cause server error or excessive query.
- [x] Empty string/null handling for code/name/description is explicit. Required fields reject blank after trim; optional fields are normalized consistently.
- [x] umeric overflow/underflow for `version` is considered.Very large/invalid numeric input does not crash BE.

### 2.2. Character Type / Encoding / Locale

- [x] Code/name/description max lengths follow spec. Code max 50, name max 255, description max 500 are enforced.
- [x] Trim and blank rules are consistent. Leading/trailing spaces do not bypass required/duplicate checks.
- [x] Locale JSON remains valid UTF-8. English/Japanese/Vietnamese messages render without mojibake.
- [x] Message keys are normalized. Use `Pages.Organization.*.*`; do not introduce `Name.Eequired`, lowercase variants, or `Organizationc`.
- [x] Full-width/half-width/emoji/surrogate pairs are considered. Inputs are stored/displayed safely or rejected per validation. 

### 2.3. Literal / Magic Number

- [x] Status values are centralized or clearly mapped. `ACTIVE`, `DELETED`, and `All` filter semantics are not scattered as magic literals.
- [x] API paths are defined consistently. Use `/api/v1/organizations`; normal edit uses `PUT /api/v1/organizations/{id}`.
- [x] Max length values are constants or shared validation metadata where practical. No inconsistent code/name/description limits between FE and BE.

### 2.4. Operation / Maintainability

- [x] Implementation follows existing architecture. Controller has no business logic; use case/service and repository/adapter are separated.
- [x] Double-submit/update conflict is safe. Version conflict prevents duplicate overwrite/delete.
- [x] Configuration is not hard-coded. No environment-specific constants in source.
- [x] No out-of-scope implementation is added. Customer, connector ingestion, and dedicated audit log are not implemented by this ticket.

## 3. FE Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| FE-001 | Major | Organization route is implemented as `/:lang/organizations`. | Route works without breaking `/:lang/login` or existing routes. | PASS | Resolved OI-P3-ORG-006. |
| FE-002 | Blocker | Authenticated non-ADMIN screen access logs out and redirects. | Non-ADMIN is sent to `/:lang/login`; direct URL cannot access the page. | PASS | AC-ORGANIZATION-11. |
| FE-003 | Major | Menu label uses i18n key `Menu.Organization`. | No hard-coded label; visible to intended ADMIN users. | PASS | Unless stronger existing convention is verified. |
| FE-004 | Blocker | Organization API calls go through `EDCAP_FE/src/lib/api.ts`. | No direct `fetch`/raw axios in page/component code. | PASS | Selected helper in Phase 3. |
| FE-005 | Major | Search UI supports code/name. | Search request maps correctly to API parameters. | PASS | AC-ORGANIZATION-2. |
| FE-006 | Major | Filter UI supports `All` / `Active` / `Deleted`. | Default filter is active; deleted view is available. | PASS | AC-ORGANIZATION-3, 10. |
| FE-007 | Major | Create form validation matches spec. | Required/max length/duplicate error display is correct. | PASS | Duplicate is BE 409; FE shows localized key. |
| FE-008 | Blocker | Edit form sends current `version`. | Valid update succeeds; stale update shows localized 409 conflict. | PASS | AC-ORGANIZATION-7, 8, 13. |
| FE-009 | Blocker | Delete action requires confirmation and calls soft-delete endpoint. | Uses `PATCH /api/v1/organizations/{id}/delete` through API helper. | PASS | AC-ORGANIZATION-9. |
| FE-010 | Major | Deleted Organization view is read-only. | Edit/save/delete controls are hidden/disabled as specified. | PASS | AC-ORGANIZATION-10. |
| FE-011 | Major | API errors display localized messages. | Uses current project i18n convention; raw backend stack/error text is not shown. | PASS | Include duplicate/validation/version/forbidden. |
| FE-012 | Major | Locale files contain Organization keys in `en`, `ja`, `vi`. | Same keys exist across languages; JSON remains valid. | PASS | `Pages.Organization.*.*`, `Menu.Organization`. |
| FE-013 | Minor | Loading/empty/success/error states are implemented. | User can understand API progress and outcome. | PASS | UX quality. |
| FE-014 | Minor | No unapproved UI library/pattern is introduced. | Reuse current common components/patterns unless justified. | PASS | Based on `context.md`. |

## 4. BE/API Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| BE-001 | Major | List endpoint supports default active list and filters. | `GET /api/v1/organizations` supports search/status filter per spec. | PASS | AC-ORGANIZATION-1..3. |
| BE-002 | Major | Create endpoint uses `POST /api/v1/organizations`. | Valid create returns expected success response/status. | PASS | `201 Created` preferred unless project convention differs. |
| BE-003 | Major | Detail endpoint uses `GET /api/v1/organizations/{id}`. | Existing active/deleted records can be retrieved as allowed by spec. | PASS | Deleted detail is read-only at FE. |
| BE-004 | Blocker | Update endpoint uses `PUT /api/v1/organizations/{id}`. | No normal edit via PATCH. | PASS | Resolved OI-P3-ORG-003. |
| BE-005 | Blocker | Soft delete endpoint uses `PATCH /api/v1/organizations/{id}/delete`. | Row is updated, not deleted physically. | PASS | AC-ORGANIZATION-9. |
| BE-006 | Major | Search uses organization code/name correctly. | Code and `name_masked`/Organization name mapping is correct. | PASS | AC-ORGANIZATION-2. |
| BE-007 | Major | Status filter maps to `deleted_at`/active state correctly. | Active excludes deleted; Deleted includes soft-deleted; All includes both. | PASS | AC-ORGANIZATION-3, 10. |
| BE-008 | Major | Validation returns `400 Bad Request`. | Required/max length/invalid version errors use stable message keys. | PASS | Do not leak Java exception text. |
| BE-009 | Blocker | Duplicate code returns `409 Conflict`. | Duplicate among non-deleted rows rejects create/update; soft-deleted reuse allowed. | PASS | Resolved OI-P3-ORG-002. |
| BE-010 | Blocker | Duplicate name returns `409 Conflict`. | Duplicate among non-deleted rows rejects create/update; soft-deleted reuse allowed. | PASS | Resolved OI-P3-ORG-002. |
| BE-011 | Blocker | Optimistic locking is atomic. | Update/delete includes `organization_id` + `version`; version increments on update. | PASS | AC-ORGANIZATION-7, 8, 13. |
| BE-012 | Blocker | Stale version returns `409 Conflict`. | Message key is `Pages.Organization.Conflict.Version`; no overwrite/delete. | PASS | AC-ORGANIZATION-13. |
| BE-013 | Blocker | ADMIN authorization is enforced on every endpoint. | Non-ADMIN direct API returns standard `403 Forbidden`. | PASS | Resolved OI-P3-ORG-005. |
| BE-014 | Blocker | Do not copy `200 OK { error: ... }` authorization pattern. | Permission failures use standard error response/status. | PASS | Known bad AdminController pattern. |
| BE-015 | Major | Not found returns `404 Not Found`. | Missing/deleted edit/not-allowed states are distinct where required. | PASS | API contract clarity. |
| BE-016 | Major | Error response preserves traceId behavior. | Existing `ErrorResponse` shape and traceId logging are not broken. | PASS | AC-ORGANIZATION-12. |
| BE-017 | Major | Controller is thin. | No DB/infrastructure import or business logic in controller. | PASS | Architecture rule. |
| BE-018 | Major | Service/use case owns business rules. | Duplicate, soft delete, version, validation orchestration are centralized. | PASS | Maintainability. |

## 5. DB/Migration Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| DB-001 | Blocker | Do not rename `tbl_dim_organization`. | Existing table name remains unchanged. | PASS | User decision. |
| DB-002 | Blocker | Do not recreate `tbl_dim_organization`. | Migration is additive/backward-compatible. | PASS | Data safety. |
| DB-003 | Blocker | Do not edit existing committed migration `V4__init_shema_v2.sql`. | Add a new Flyway migration. | PASS | Migration history safety. |
| DB-004 | Blocker | Add/backfill `organization_code` safely. | Generate uppercase slug from `name_masked`; duplicate slugs get `_2`, `_3`, etc. | PASS | Resolved OI-P3-ORG-001. |
| DB-005 | Blocker | Add `NOT NULL`/unique constraints only after backfill. | Migration cannot fail due to null existing rows. | PASS | Migration safety. |
| DB-006 | Major | Add required columns if missing. | `organization_code`, `description`, `deleted_at`, `deleted_by`, `version` exist with intended types/defaults. | PASS | Based on Phase 2/3 inventory. |
| DB-007 | Major | Preserve existing `name_masked` mapping. | Do not rename `name_masked`; Organization name maps to it. | PASS | Existing schema compatibility. |
| DB-008 | Major | Query filters use deleted state consistently. | Default active query excludes rows with `deleted_at IS NOT NULL`; Deleted filter includes them. | PASS | Match final SQL design. |
| DB-009 | Blocker | Add partial unique index for code. | Unique on `LOWER(organization_code)` where `deleted_at IS NULL`. | PASS | Duplicate code among active rows rejected. |
| DB-010 | Blocker | Add partial unique index for name. | Unique on `LOWER(name_masked)` where `deleted_at IS NULL`. | PASS | Duplicate name among active rows rejected. |
| DB-011 | Blocker | Soft delete is an update. | `deleted_at`/`deleted_by`/status are updated; row remains. | PASS | AC-ORGANIZATION-9. |
| DB-012 | Blocker | Version column supports optimistic locking. | `version BIGINT NOT NULL DEFAULT 0`; atomic update/delete checks version. | PASS | AC-ORGANIZATION-13. |
| DB-013 | Major | Rollback/manual recovery notes exist. | DB rollback limitations and remediation are documented. | PASS | Release safety. |

## 6. Security/Privacy Review

- [x] BE enforces ADMIN-only access
- [x] Unauthorized and unauthenticated statuses are correct
- [x] Errors do not leak stack traces or internals
- [x] Logs do not expose secrets/tokens/OAuth raw attributes
- [x] CSRF/session-cookie assumptions are not broken
- [x] Organization name privacy semantics are unchanged
- [x] Non-ADMIN cannot bypass by direct URL/API manipulation

## 7. Operation/Maintenance Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| OP-001 | Major | Existing traceId/error logging is preserved. | Errors can be correlated between FE response and BE logs. | PASS | AC-ORGANIZATION-12. |
| OP-002 | Major | No dedicated audit log is added. | Scope remains aligned with AC-ORGANIZATION-12. | PASS | Dedicated audit out of scope. |
| OP-003 | Major | Create/update/delete operations are diagnosable. | Logs include enough context without leaking sensitive data. | PASS | Operation support. |
| OP-004 | Major | Migration pre-check/post-check is documented. | Existing duplicates/nulls can be detected before adding constraints. | PASS | DB rollout safety. |
| OP-005 | Major | Monitoring points are documented. | Watch Organization 4xx/5xx, migration failure, duplicate conflicts, permission denied spikes. | PASS | Release monitoring. |
| OP-006 | Minor | Manual recovery notes exist for failed migration/backfill. | Operations know how to stop/ask or remediate. | PASS | Link to rollback section/report later. |

## 8. Test Review

- [x] Active default list is verified
- [x] Search behavior is verified
- [x] Status filters are verified
- [x] Create success is verified
- [x] Duplicate code behavior is verified
- [x] Organization name privacy semantics are unchanged
- [x] Edit code with version is verified
- [x] Edit name with version is verified.
- [x] Soft delete behavior is verified
- [x] Deleted read-only behavior is verified
- [x] Authorization behavior is verified
- [x] Stale version conflict is verified
- [x] Migration/backfill is verified
- [x] i18n rendering is verified
- [x] FE automated tests are deferred if still approved
- [x] DB integration test setup is decided later

## 9. Documentation/Traceability Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| DOC-001 | Major | `context.md` remains accurate after implementation. | Existing/new/non-existing methods and components are updated if changed. | PASS | Avoid stale source inventory. |
| DOC-002 | Major | `impact-analysis.md` matches actual changed files. | Direct/indirect impact sections are updated for real changes. | PASS | Phase 3 artifact. |
| DOC-003 | Major | `impl-plan.md` deviations are documented. | Any deviation from selected approach has rationale. | PASS | Traceability. |
| DOC-004 | Major | Resolved/deferred issues remain reflected. | OI-P3-ORG-001..006 resolved; OI-P3-ORG-007 deferred unless decided later. | PASS | Decision tracking. |
| DOC-005 | Major | `test-results.md` records executed commands/tests. | Evidence is not left blank after implementation. | PASS | Closure evidence. |
| DOC-006 | Major | `report.md` is updated for final ticket closure. | Completed/deferred/risk summary is available. | PASS | Final artifact. |
| DOC-007 | Minor | API/route architecture docs are updated if required by workflow. | Route/API map does not become stale. | PASS | Follow project doc standards. |

## 10. Release/Rollback Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| REL-001 | Blocker | Migration rollout order is safe. | Backfill occurs before NOT NULL/unique indexes; deployment order is clear. | PASS | DB safety. |
| REL-002 | Blocker | Rollback does not require destructive data loss. | App rollback is clear; DB rollback limitations are documented. | PASS | No drop table. |
| REL-003 | Major | Unique index failure has a stop/remediation path. | Duplicate pre-check or stop/ask condition exists. | PASS | OI-P3-ORG-001. |
| REL-004 | Major | Feature rollback is documented. | Reverting FE route/page and BE API is safe if migration remains additive. | PASS | Rollback plan. |
| REL-005 | Major | Release notes mention new Organization API/route/migration. | Operators know what changed. | PASS | Final report/release note. |
| REL-006 | Major | Post-release monitoring is specified. | API errors, duplicate conflicts, permission errors, and migration issues are watched. | PASS | Operation. |

## Severity Definition

| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released / merged because it can break core AC, security, data safety, or rollback safety. | Must fix before release, or explicitly stop. |
| Major | High probability of becoming a bug or operational issue. | Fix before release or record as accepted risk with owner/deadline. |
| Minor | Minor improvement, wording, maintainability, or polish. | Optional, but record decision if not fixed. |
| Question | Specification or implementation confirmation required. | Open/resolve issue before affected implementation/test is finalized. |
| False Positive | Incorrect review finding. | Record reason for rejection. |
| Accepted Risk | Known issue intentionally accepted. | Record impact, owner, follow-up, and deadline. |
