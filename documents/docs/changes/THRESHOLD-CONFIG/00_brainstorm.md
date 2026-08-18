# 00 Brainstorm

**Ticket ID**: THRESHOLD-CONFIG
**Phase**: Phase 1 - Investigation / Spec Pack
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-21
**Status**: Draft / Investigation Notes

## Purpose

Collect investigation findings, conflicts, risks, and questions before freezing
THRESHOLD-CONFIG behavior in `spec-pack.md`. This file is not an implementation plan and must
not override `spec-pack.md`.

## Known Information

### Source-Verified Facts

1. `EvidenceQualityScoreModels.ScoreBand` (`EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModels.java:19-45`)
   is a Java enum hardcoding the same 5 bands as the raw input's default table (`EXCELLENT`
   ≥90, `GOOD` ≥75, `WARNING` ≥60, `RISKY` ≥40, else `CRITICAL`), consumed by
   `EvidenceQualityScoreService`, `PmDashboardService`/`PmDashboardModels`/`PmDashboardDtos`,
   `EvidenceQualityScoreMapper`, and asserted in `EvidenceQualityScoreModelsTest`
   (`score_band_thresholds_match_spec`).
2. `database.md` §"ENUM Types (Confirmed — from V4)" lists a PostgreSQL native enum type
   `score_band` with values `EXCELLENT, GOOD, WARNING, RISKY, CRITICAL` — the same fixed set,
   at the database layer. PostgreSQL native enums require `ALTER TYPE … ADD VALUE` (a migration)
   to add a value; they cannot accept an admin-added arbitrary code at runtime.
3. `pm-dashboard/utils.ts` (`EDCAP_FE/src/pages/pm-dashboard/utils.ts`) hardcodes
   `scoreBandClasses` for the same 5 codes as Tailwind class strings, consumed by
   `PMDashboardPage`, `TicketDetailDrawer`, `ProjectPage`, `TraceabilityPage`.
4. No `tbl_score_threshold*` table, migration, DTO, controller, or FE page exists yet anywhere
   in the repository (confirmed by grep across `EDCAP_BE/src/main` and `EDCAP_FE/src`).
5. `database.md` states the table-naming convention for V5+ is `tbl_<category>_<name>`
   (`tbl_dim_*` for master/dimension data, `tbl_fact_*` for events). A score-threshold config
   table is dimension/master data, so `tbl_dim_score_threshold` fits the convention better than
   the raw input's own `tbl_score_thresholds` spelling.
6. `database.md` "Candidate Rules" lists soft delete as only a **candidate** rule
   (`record_status = 'DELETED'`), not confirmed — but real, merged migrations already establish
   a **different**, actually-used soft-delete convention: `delete_flag` boolean/char flag plus a
   `version BIGINT NOT NULL DEFAULT 0` column for optimistic locking, e.g.
   `V110__alter_tbl_dim_customer_for_soft_delete_version_alias_index.sql` (adds `delete_flag`,
   `version`) and `V92__alter_tbl_role_for_soft_delete.sql`. Services such as
   `CustomerService`, `OrganizationService`, `TeamService` all follow this pattern: `UPDATE ...
   WHERE id = ? AND version = ?`; if `affected == 0`, throw `OptimisticLockingException` →
   HTTP 409 `CONFLICT` (mapped in `GlobalExceptionHandler`).
7. A partial unique index scoped to active rows already has precedent:
   `V110__...sql` creates `ux_tbl_dim_customer_alias_active` as a unique index filtered on the
   active condition — directly matching the raw input's requirement that `Code` uniqueness is
   checked only among `delete_flag = '0'` rows.
8. Admin-only gating already has an established, current pattern:
   `AdminAuditLogController.requireAdmin(AppUser caller)` throws
   `ForbiddenException("Component.Permission.Denied")` when `caller.getRole() != AppUser.Role.ADMIN`;
   `GlobalExceptionHandler.handleForbidden` maps `ForbiddenException` → HTTP 403 /
   `errorCode: FORBIDDEN`. The same `requireAdmin`-in-service-or-controller pattern repeats in
   `RoleService`, `PmDashboardService`, `OrganizationService`, `CustomerService`, and others. This
   is a more current/correct pattern than the "AdminController ad-hoc Map" inconsistency
   described in `security.md`/`error-handling.md` — no file named `AdminController.java` was
   found in current source; that description in the standards docs appears stale.
9. `api-contract.md` documents per-resource REST shapes (`PUT /api/v1/<resource>/{id}` for a
   single full update) and camelCase JSON field examples (`ticketKey`, `errorCode`). The raw
   input's endpoint is a **collection-level batch upsert** (`PUT /api/v1/score-thresholds`, no
   `{id}`) with a JSON payload using **snake_case** field names (`min_score`, `max_score`) —
   both deviate from the documented/observed convention.
10. `SecurityConfig` (`EDCAP_BE/.../config/SecurityConfig.java`) permits only a fixed list of
    routes (`/api/v1/health`, actuator, openapi/swagger, auth login/logout, `/error`, webhook
    POST endpoints, `/api/v1/markdown-parser/**`) without authentication; every other
    `/api/v1/**` route requires an authenticated session but is **not** role-gated at the
    Spring Security filter-chain level — role gating happens inline in controllers/services
    (see fact 8), so a new `score-thresholds` controller must add its own `requireAdmin` check;
    nothing does this automatically.
11. `01_raw-input.md` names both **System Administrator** and **Operations Manager** as target
    users (§1.2) but only ever describes an "Admin" actor performing edits in the functional
    requirements (§3) — it never states whether Operations Manager also gets edit rights or
    view-only access.
12. `EvidenceQualityScoreModelsTest` (`EDCAP_BE/src/test/.../EvidenceQualityScoreModelsTest.java`)
    currently unit-tests the hardcoded band boundaries; if `ScoreBand.fromScore()` is later
    switched to read from the new config table, this existing test's assumptions change.

### Raw Input Claims

1. Feature: an Admin screen to configure score-band thresholds (range/label/code/color),
   currently backing "system/result classification."
2. 5 default bands: 90-100 Excellent, 75-89 Good, 60-74 Warning, 40-59 Risky, 0-39 Critical.
3. View Mode (read-only) / Edit Mode (inline editing) toggle; Cancel reverts all local edits
   with **no backend API call**.
4. Add row (no `id` sent) / soft-delete row (`delete_flag = '1'` on save, not `DELETE FROM`).
5. Validation: full 0-100 coverage with no gaps, no overlaps, `From <= To`, unique uppercase
   `Code` with no spaces/special characters (scoped to active rows), both FE and BE.
6. Code editing is described as "only for new configs or ones without special constraints" —
   the PRD never defines what a "special constraint" is or which existing codes (if any) would
   be protected from renaming.
7. Backend flow: validate payload → fetch active rows → soft-delete rows missing from payload →
   update matched-`id` rows / insert `id`-less rows → commit in one `@Transactional`.
8. Endpoint: `PUT /api/v1/score-thresholds`, payload `{ "thresholds": [...] }` with
   `min_score`/`max_score` in snake_case; sample DB table name is `tbl_score_thresholds`.
9. UI: header with mode-dependent button group, a realtime 0-100 progress bar colored per band,
   and a 6-column table (actions / label / code / range / color / status).
10. All display labels must use the existing i18n system.

## Conflicts / Tensions

| ID | conflict | source A | source B | impact |
|---|---|---|---|---|
| C-THRESHOLD-CONFIG-001 | Fixed vs. dynamic code set | `01_raw-input.md` §3.1.5 lets Admin add a brand-new `Code` at will | `database.md`'s existing native PostgreSQL enum `score_band` (fixed 5 values, requires a migration to extend) and Java `ScoreBand` enum (fixed 5 constants) | Blocks column typing for `code`: must be free-text `VARCHAR`, not the existing `score_band` PG enum, unless the existing enum consumers are also redesigned |
| C-THRESHOLD-CONFIG-002 | Scope of "make bands configurable" | Raw input only specifies a CRUD screen + `PUT` endpoint | `ScoreBand.fromScore()` and FE `scoreBandClasses` are the actual runtime consumers of these bands today, and are never mentioned in the raw input | Blocks whether this ticket also rewires classification logic, or is CRUD-only with consumption deferred |
| C-THRESHOLD-CONFIG-003 | Soft-delete convention status | `architecture/overview.md` DB-conventions table says "Soft delete — Not used, hard delete with cascade" and `database.md` lists soft delete only as a **Candidate** rule | Merged migrations (`V92`, `V110`) and services (`CustomerService`, `TeamService`, `OrganizationService`) already implement `delete_flag` + `version` soft delete in production | Documentation is stale relative to actual practice; raw input's soft-delete requirement matches real precedent, not the stale doc |
| C-THRESHOLD-CONFIG-004 | API shape convention | `api-contract.md` documents per-resource `PUT /api/v1/<resource>/{id}` and camelCase JSON | Raw input specifies collection-level `PUT /api/v1/score-thresholds` (batch upsert, no `{id}`) with snake_case (`min_score`/`max_score`) field names | Blocks whether to follow the raw input verbatim or adapt it to documented/observed conventions |
| C-THRESHOLD-CONFIG-005 | Code-editing restriction is undefined | Raw input §3.1.4: Code editable "only for new configs or those without special constraints" | Raw input §5.1.3 shows Code as a plain, always-editable input field in Edit Mode with no such restriction drawn in the UI | Ambiguous whether Code becomes immutable once a band is saved/active, and if so, which rule decides |
| C-THRESHOLD-CONFIG-006 | Table naming | Raw input SQL sample uses `tbl_score_thresholds` | `database.md` convention for new dimension/master tables is `tbl_dim_<name>` | Minor; likely just an informal name in the PRD, but needs an explicit decision before writing the migration |

## Undetermined Points

| ID | point | type | current handling |
|---|---|---|---|
| U-THRESHOLD-CONFIG-001 | Is migrating `ScoreBand.fromScore()` / FE `scoreBandClasses` to read the new config in scope for this ticket? | Human Decision Required | Default to Out of Scope in spec-pack draft; flagged as HD |
| U-THRESHOLD-CONFIG-002 | What exactly is a "special constraint" that blocks Code renaming, and which codes (if any) are protected? | Human Decision Required | Keep as Open Issue; do not invent a rule |
| U-THRESHOLD-CONFIG-003 | Are scores integer-only, or can `From`/`To` be decimal? | Human Decision Required | Assume integer 0-100 inclusive per examples; flag as Assumption |
| U-THRESHOLD-CONFIG-004 | Is there a minimum (≥1 active band) or maximum band count? | Human Decision Required | Keep as Open Issue |
| U-THRESHOLD-CONFIG-005 | Who exactly may edit — Admin only, or also Operations Manager (both named as users in §1.2)? | Human Decision Required | Keep as Human Decision; default assumption is Admin-only edit, both roles can view |
| U-THRESHOLD-CONFIG-006 | Should the API/table follow the raw input verbatim (snake_case body, `tbl_score_thresholds`) or the repo's documented conventions (camelCase body, `tbl_dim_score_threshold`)? | Human Decision Required | Recommend repo convention in spec-pack draft; flag as HD |
| U-THRESHOLD-CONFIG-007 | Should concurrent edits be protected with the existing `version`-column optimistic-locking pattern? | Human Decision Required | Recommend adopting existing pattern; flag as HD |
| U-THRESHOLD-CONFIG-008 | Is there a GET endpoint/response schema, or does the same list only ever come from page-load via an implied `GET /api/v1/score-thresholds`? | Human Decision Required | Assume a matching `GET` is needed for View Mode; flag as Open Issue since raw input never states it |

## Expected Risks

| ID | risk | severity | why |
|---|---|---|---|
| R-THRESHOLD-CONFIG-001 | Building the new `code` column as the existing `score_band` PG enum type | Major | Blocks admin-added arbitrary codes; PG enums need a migration per new value |
| R-THRESHOLD-CONFIG-002 | Treating this ticket as "just CRUD" while dashboards keep reading the hardcoded `ScoreBand` enum | Major | Admin edits would have zero visible effect on PM/QA/Dev dashboards, defeating the ticket's stated purpose ("phục vụ việc đánh giá, phân loại hệ thống/kết quả tự động") |
| R-THRESHOLD-CONFIG-003 | Implementing the batch soft-delete/upsert without optimistic locking | Major | Two admins editing concurrently could silently clobber each other's changes; existing `version`-column pattern exists specifically to prevent this |
| R-THRESHOLD-CONFIG-004 | Copying the raw input's snake_case JSON body verbatim into the DTO | Medium | Breaks from the documented/observed camelCase convention used by every other endpoint in the codebase |
| R-THRESHOLD-CONFIG-005 | Allowing Code edits on bands already referenced by historical/soft-deleted evidence records without resolving C-THRESHOLD-CONFIG-005 | Medium | Could silently break traceability between old data and the renamed code if consumption (U-001) is later brought in-scope |
| R-THRESHOLD-CONFIG-006 | No FE unit/E2E test currently exists for this area; realtime progress-bar and Cancel-with-no-API-call behavior are easy to break silently | Medium | `testing.md` notes FE test infra exists but is not yet used on most pages |

## What AI Needs to Investigate

1. Whether `EvidenceQualityScoreMapper` / `PmDashboardModels` have any other hardcoded assumption
   about exactly 5 bands (e.g. array sizing, switch exhaustiveness) that would break if the
   admin adds a 6th band, in case consumption (U-001) is later brought into scope.
2. Whether any other `@RestController` currently implements a batch upsert body shape (collection
   PUT with a list payload) to use as a closer precedent than per-id `PUT`.
3. Whether `PmDashboardService`/similar services' existing `requireAdmin`-style checks assume a
   single `ADMIN` role, or whether an `OPS_MANAGER`-equivalent role already exists in
   `AppUser.Role` for the second named persona.

## What Humans Need to Ask

1. Is rewiring `ScoreBand.fromScore()` and FE `scoreBandClasses` to consume the new config table
   in scope for THRESHOLD-CONFIG, or a separate follow-up ticket?
2. What does "Code editable only for new configs or those without special constraints" mean in
   practice — is Code immutable once a band has been saved at least once, or only once it has
   been referenced elsewhere?
3. Should `From`/`To` accept decimals, or are scores always whole numbers 0-100?
4. Is there a minimum number of active bands (e.g. must always cover 0-100 with at least 1 row) or
   a maximum band count?
5. Should Operations Manager be able to edit, or only view?
6. Should the table be named `tbl_score_thresholds` (as in the PRD) or `tbl_dim_score_threshold`
   (per the `tbl_dim_*` convention for master data)?
7. Should the API request/response use camelCase (`minScore`/`maxScore`) to match every other
   endpoint, or snake_case as literally shown in the PRD sample?
8. Should concurrent edits be protected by the existing `version`-column optimistic-locking
   pattern, surfacing a 409 conflict to the Admin on stale save?

## Conditions Under Which Implementation Is Not Permitted

1. Scope of ScoreBand-consumption migration (U-THRESHOLD-CONFIG-001) remains undecided.
2. Meaning of "Code editable only for new configs/without special constraints" remains undecided.
3. Table name and API field-casing convention remain undecided.
4. Whether concurrent-edit protection (optimistic locking) is required remains undecided.
5. Admin-vs-Operations-Manager edit permission remains undecided.
6. `spec-pack.md` remains unapproved by a human owner.
