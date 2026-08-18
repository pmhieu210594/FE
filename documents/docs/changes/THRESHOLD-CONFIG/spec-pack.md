# Spec Pack

**Ticket ID**: THRESHOLD-CONFIG
**Feature**: Score Threshold Configuration screen
**Phase**: Phase 1 - Investigation / Spec Pack
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-21
**Status**: Human Decisions Applied (2026-07-21)

## 1. Context / Purpose

THRESHOLD-CONFIG covers an Admin-facing screen that lets a **System Administrator** configure the
score-band thresholds used to classify evaluation/quality scores into labeled bands (e.g.
Excellent, Good, Warning, Risky, Critical). Access is Admin-only (HD-THRESHOLD-CONFIG-5) — the raw
input also named an Operations Manager persona, but that role does not get access to this screen
or its APIs. Today these 5 bands are hardcoded in backend Java
(`EvidenceQualityScoreModels.ScoreBand`) and mirrored in frontend styling
(`pm-dashboard/utils.ts`); this ticket makes the band definitions themselves configurable and
persisted, with soft-delete history preservation, and rewires the existing hardcoded consumers to
read the new configuration (HD-THRESHOLD-CONFIG-1).

All 6 Human Decisions raised during Phase 1 investigation were confirmed by the human owner on
2026-07-21 (see §17 Human Decision Required and §20 Resolved Issues). Notably, HD-THRESHOLD-CONFIG-1
confirmed that this ticket **does** rewire the existing hardcoded score-band logic
(`EvidenceQualityScoreModels.ScoreBand`, FE `pm-dashboard/utils.ts`) to read from the new config
table — this is no longer a CRUD-only screen. HD-THRESHOLD-CONFIG-2 was explicitly **deferred**
(not resolved) rather than closed; see BR-THRESHOLD-CONFIG-011. This file is now the canonical
Phase 1 output; see §16 Phase 1 Gate Judgment for whether Phase 3 may proceed directly.

## 2. Scope

### 2.1. Within range

1. View the list of currently active (`delete_flag = '0'`) score-threshold bands: ID, From, To,
   Label, Code, Color.
2. Toggle between View Mode (read-only, badge display) and Edit Mode (inline editable table).
3. Cancel/Revert button in Edit Mode: restores the original list in the UI and returns to View
   Mode **without calling any backend API**.
4. In Edit Mode: change From/To, rename Label, change Code (subject to
   HD-THRESHOLD-CONFIG-2/OI-THRESHOLD-CONFIG-2), change Color via a color picker.
5. Add a new band row in Edit Mode (no `id` sent to backend for new rows).
6. Soft-delete a band row in Edit Mode; on Save, backend sets `delete_flag = '1'` for removed
   rows instead of `DELETE FROM`.
7. Client-side validation mirrored by server-side re-validation before save: full 0-100
   coverage with no gaps, no overlaps, `From <= To`, required/unique/uppercase/no-special-char
   `Code`, uniqueness scoped to active rows only.
8. Batch save: soft-delete removed rows, update matched-`id` rows, insert `id`-less rows, all in
   one backend transaction.
9. Realtime 0-100 progress bar that recolors as the admin edits ranges in Edit Mode.
10. i18n for all displayed labels using the existing frontend i18n system.
11. Seeding the 5 default bands (Excellent/Good/Warning/Risky/Critical) as the system's initial
    state.
12. **(HD-THRESHOLD-CONFIG-1, Closed)** Rewiring `EvidenceQualityScoreModels.ScoreBand.fromScore()`
    (BE) and `scoreBandClasses` (FE) so both read active band definitions from
    `tbl_dim_score_threshold` at runtime instead of the hardcoded 5-value set. This includes the
    downstream consumers of that lookup: `EvidenceQualityScoreService`, `PmDashboardService` /
    `PmDashboardModels` / `PmDashboardDtos`, `EvidenceQualityScoreMapper`, and the FE pages that
    render `scoreBandClasses` (`PMDashboardPage`, `TicketDetailDrawer`, `ProjectPage`,
    `TraceabilityPage`).

### 2.2. Out of range

1. Restoring a soft-deleted band (undelete) — not described anywhere in the raw input.
2. Physical (hard) delete of any threshold row.
3. Historical/audit reporting UI beyond the raw `delete_flag`/`updated_at` columns already
   required for soft delete.
4. **(HD-THRESHOLD-CONFIG-5, Closed)** Any access for Operations Manager or any role other than
   `ADMIN` — this screen and its APIs are Admin-only, both view and edit.
5. Any new permission/role model beyond reusing the existing `AppUser.Role` + `requireAdmin`
   pattern (see §13).
6. **(HD-THRESHOLD-CONFIG-2, Deferred)** Any enforcement of a "Code editable only for new configs
   or without special constraints" rule — explicitly not implemented; Code remains freely editable
   subject only to the normal format/uniqueness rules (see BR-THRESHOLD-CONFIG-011).
7. CI, settings, or living-doc changes as part of this artifact-authoring step.
8. Source code, migration, controller, service, UI, or test implementation in this Phase 1 step.

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| Threshold / Band | A scored range (`From`-`To`) with a Label, Code, and Color | Rows of the new config table |
| Code | Fixed, machine-readable identifier for a band (e.g. `EXCELLENT`) | Decoupled from `Label`; used in backend logic/DB, not shown as the primary display text |
| Label | Human-readable, translatable display name for a band (e.g. "Excellent") | Editable without affecting backend logic |
| `delete_flag` | Soft-delete marker; `'0'` = active, `'1'` = soft-deleted | Precedent: `V92`, `V110` migrations; see §12 |
| View Mode | Default, read-only display state of the screen | Badges/text only |
| Edit Mode | Editable state entered via `[Chỉnh sửa]` (Edit) | Inline inputs; Save/Cancel/Add-band buttons appear |
| Cancel & Revert | Discards all in-progress Edit Mode changes, returns to View Mode | Explicitly **no backend API call** |
| Gap | A score value 0-100 not covered by any active band | Must never occur among active bands after save |
| Overlap | Two active bands both claiming the same score value | Must never occur among active bands after save |
| Optimistic locking / `version` | Existing repo pattern to detect concurrent conflicting writes | See `CustomerService`/`OrganizationService`/`TeamService`; **adopted for THRESHOLD-CONFIG per HD-THRESHOLD-CONFIG-6** |
| `tbl_dim_score_threshold` | Final table name for score-threshold config | Closed by HD-THRESHOLD-CONFIG-3 |

## 4. As-Is

1. `EvidenceQualityScoreModels.ScoreBand` (`EDCAP_BE/.../application/usecase/quality/EvidenceQualityScoreModels.java:19-45`)
   is a fixed Java enum with a hardcoded `fromScore(BigDecimal)` if/else chain implementing
   exactly the 5 bands in the raw input's default table.
2. `pm-dashboard/utils.ts` hardcodes the same 5 codes as Tailwind badge classes
   (`scoreBandClasses`), consumed by `PMDashboardPage`, `TicketDetailDrawer`, `ProjectPage`,
   `TraceabilityPage`.
3. `database.md` documents a native PostgreSQL enum type `score_band` (from V4) with the same
   fixed 5 values — a second, DB-level place the same fixed set is hardcoded.
4. No `tbl_score_threshold*`/`tbl_dim_score_threshold` table, migration, DTO, controller, or
   FE page exists anywhere in the repository today.
5. There is no admin screen anywhere in the frontend for configuring domain thresholds; the
   closest existing analogues are `pages/admin-audit-log/` (page + `components/` + `hooks/` +
   `types.ts` + `utils.ts` shape, read-only) and `pages/user/` (CRUD + drawer).
6. Admin-only gating is implemented per-controller/per-service today via a `requireAdmin(AppUser
   caller)` helper that throws `ForbiddenException("Component.Permission.Denied")`
   (`AdminAuditLogController.java:66-70`, repeated across `RoleService`, `PmDashboardService`,
   `OrganizationService`, `CustomerService`, and others) — there is no Spring Security
   method-level role annotation (`@PreAuthorize`) in use, and `SecurityConfig` only gates
   authentication, not role.
7. Optimistic locking via a `version BIGINT` column exists as an established pattern for
   update/soft-delete conflict detection (`CustomerService`, `OrganizationService`, `TeamService`
   + `V110` migration), throwing `OptimisticLockingException` → HTTP 409 on a zero-row-affected
   update.
8. Soft delete via `delete_flag` (not the "hard delete with cascade" stated in
   `architecture/overview.md`) is the actual, already-merged convention for several tables
   (`V92`, `V110`).

## 5. To-Be

The system persists score-threshold bands in `tbl_dim_score_threshold` (closed by
HD-THRESHOLD-CONFIG-3). An Admin-only (HD-THRESHOLD-CONFIG-5) screen lists active bands in View
Mode and allows batch add/edit/soft-delete in Edit Mode, saved through a `POST
/api/v1/score-thresholds` endpoint (HD-THRESHOLD-CONFIG-4 — changed from the raw input's `PUT`)
that validates full 0-100 coverage, no gaps/overlaps, and Code uniqueness among active rows, then
commits soft-delete + update + insert in a single backend transaction, protected by `version`-column
optimistic locking (HD-THRESHOLD-CONFIG-6) — mirroring the hexagonal flow `web (thin controller) →
application (@Service, @Transactional) → application port (persistence interface) →
infrastructure (@Repository JDBC adapter)` already used by
`ArtifactScannerService`/`ArtifactScannerPersistencePort`/`DataOpsDashboardJdbcAdapter`.

Per HD-THRESHOLD-CONFIG-1, `ScoreBand.fromScore()` (BE) and `scoreBandClasses` (FE) are rewired to
read active bands from `tbl_dim_score_threshold` rather than a hardcoded set. Because an admin can
add an arbitrary 6th+ band with a new `Code`, a fixed 5-value Java `enum ScoreBand` can no longer
represent the full domain — the BE representation must become a plain value object/DTO keyed by a
string `code` (e.g. a `ScoreThreshold` record with `code`, `label`, `minScore`, `maxScore`,
`color`), with band lookup performed against the active, ordered config set rather than a
compile-time `if/else` chain. Existing callers that currently depend on `ScoreBand` as a fixed Java
enum (`PmDashboardModels`, `EvidenceQualityScoreMapper`, and any exhaustive `switch`/pattern match
over the 5 constants) must be reviewed and adapted in Phase 3 to work against the dynamic `code`
string instead. This refactor is the primary driver of the escalated Complexity Classification in
§10.

## 6. Detailed specification

### 6.1. Business Rules

| ID | rule | status |
|---|---|---|
| BR-THRESHOLD-CONFIG-001 | Only authenticated users with the required role may call the threshold-config APIs | Pending HD-THRESHOLD-CONFIG-5 (exact role set) |
| BR-THRESHOLD-CONFIG-002 | List/View shows only active bands (`delete_flag = '0'`), orderable ascending or descending | Draft from raw input |
| BR-THRESHOLD-CONFIG-003 | Edit Mode opens inline inputs only for active bands | Draft from raw input |
| BR-THRESHOLD-CONFIG-004 | Cancel/Revert discards all local edits and returns to View Mode with **zero** backend API calls | Draft from raw input |
| BR-THRESHOLD-CONFIG-005 | Active bands must cover exactly the closed interval [0, 100] with no gaps and no overlaps | Draft from raw input |
| BR-THRESHOLD-CONFIG-006 | `From <= To` for every band | Draft from raw input |
| BR-THRESHOLD-CONFIG-007 | `Label` and `Code` are required (non-empty) for every band | Draft from raw input |
| BR-THRESHOLD-CONFIG-008 | `Code` must be uppercase, contain no spaces or special characters, and be unique among active bands only | Draft from raw input |
| BR-THRESHOLD-CONFIG-009 | Uniqueness/duplicate checks for `Code` exclude soft-deleted (`delete_flag = '1'`) rows; historical data on soft-deleted rows is preserved unmodified | Draft from raw input |
| BR-THRESHOLD-CONFIG-010 | On Save: rows present in DB (active) but absent from payload are soft-deleted (`delete_flag = '1'`, `updated_at = NOW()`); rows with a matching `id` are updated; rows without an `id` are inserted as new active rows; all in one `@Transactional` | Draft from raw input |
| BR-THRESHOLD-CONFIG-011 | Code renaming restriction ("only for new configs or without special constraints") | **Deferred by HD-THRESHOLD-CONFIG-2 — no restriction is implemented; Code remains freely editable subject only to BR-THRESHOLD-CONFIG-007/008/009** |
| BR-THRESHOLD-CONFIG-012 | Concurrent save conflict detection via `version` column, consistent with `CustomerService`/`OrganizationService`/`TeamService` | Closed by HD-THRESHOLD-CONFIG-6 — adopted |
| BR-THRESHOLD-CONFIG-013 | Score-band lookup (`ScoreBand.fromScore()`-equivalent) reads the current active band set from `tbl_dim_score_threshold`, ordered by `minScore`, and returns the band whose `[minScore, maxScore]` contains the given score | Closed by HD-THRESHOLD-CONFIG-1 |
| BR-THRESHOLD-CONFIG-014 | If the active band set has a gap at lookup time (should be prevented by BR-005 at save time, but must be handled defensively), lookup must not silently return an incorrect band or throw an unhandled exception | Closed by HD-THRESHOLD-CONFIG-1; exact fallback behavior (e.g. nearest band vs. explicit "unclassified" state) is a Phase 3 implementation detail — see OI-THRESHOLD-CONFIG-8 |
| BR-THRESHOLD-CONFIG-015 | All threshold-config endpoints (list and save) are restricted to the `ADMIN` role | Closed by HD-THRESHOLD-CONFIG-5 |

### 6.2. Input

Per HD-THRESHOLD-CONFIG-4, request bodies use camelCase per `api-contract.md`, and the save
operation is `POST /api/v1/score-thresholds` (not `PUT`).

| item | type | required | validation | notes |
|---|---|---|---|---|
| `id` | UUID (per V5+ convention in `database.md`) | no (absent = new row) | must reference an existing active row if present | Omitted for newly added bands |
| `code` | string | yes | uppercase, no spaces/special chars, unique among active rows in the resulting active set; freely editable (BR-THRESHOLD-CONFIG-011 deferred) | camelCase per HD-THRESHOLD-CONFIG-4 |
| `label` | string | yes | non-empty after trim (assumption — raw input doesn't state trim explicitly) | Translatable display text |
| `minScore` | integer (assumption — see A-THRESHOLD-CONFIG-3) | yes | `0 <= minScore <= maxScore` | camelCase per HD-THRESHOLD-CONFIG-4 |
| `maxScore` | integer | yes | `maxScore <= 100`, `minScore <= maxScore` | camelCase per HD-THRESHOLD-CONFIG-4 |
| `color` | string (hex, e.g. `#10B981`) | yes | valid CSS hex color | From color picker |
| `thresholds` (payload wrapper) | array of the above | yes | Full active set must satisfy BR-THRESHOLD-CONFIG-005/006/008 as a whole | Batch payload, not per-item |

### 6.3. Output

Per HD-THRESHOLD-CONFIG-4, a `GET /api/v1/score-thresholds` list endpoint is included (resolves
the previously open "no GET schema" question), following the standard `GET
/api/v1/<resource>` — list convention from `api-contract.md`.

| item | type | format | notes |
|---|---|---|---|
| Threshold list item | object | `{ id, code, label, minScore, maxScore, color }` (camelCase, active rows only) | Returned by `GET /api/v1/score-thresholds` and the `POST` save response |
| Save result | raw list of the above | No envelope, per `api-contract.md`'s documented "no wrapper" convention | Exact shape to be pinned down in a Pack-26-style FE/BE contract review before Phase 3 |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| Gap in active-band coverage | Reject save, no partial commit | HTTP 400, `errorCode: DOMAIN_RULE_VIOLATION` (via a `DomainException` subtype) | Matches `error-handling.md` mapping |
| Overlap in active-band coverage | Reject save, no partial commit | HTTP 400, `errorCode: DOMAIN_RULE_VIOLATION` | Same as above |
| Duplicate `Code` among active rows (including within the payload itself) | Reject save | HTTP 400, `errorCode: DOMAIN_RULE_VIOLATION` | Raw input §4.3 step 1 explicitly requires checking duplicates within the payload before touching the DB |
| `Code` empty, lowercase, containing spaces/special chars | Reject save | HTTP 400, `errorCode: VALIDATION_ERROR` (if bean validation) or `DOMAIN_RULE_VIOLATION` (if domain check) | Exact exception type pending implementation, not a spec blocker |
| `From > To` on any row | Reject save | HTTP 400, `errorCode: DOMAIN_RULE_VIOLATION` | |
| Caller is not `ADMIN` | Reject request before any validation | HTTP 403, `errorCode: FORBIDDEN` | Follows `ForbiddenException` precedent (`AdminAuditLogController`); applies to both `GET` and `POST` per HD-THRESHOLD-CONFIG-5 |
| Concurrent conflicting save | Reject with conflict | HTTP 409, `errorCode: CONFLICT` | Follows `OptimisticLockingException` precedent; adopted per HD-THRESHOLD-CONFIG-6 |
| Unauthenticated caller | Reject before controller logic | HTTP 401 | Standard Spring Security session-cookie behavior; no new logic needed |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| Global score range | 0 | 100 | Active bands must jointly cover exactly this closed interval | Reject any save leaving a gap above 100 or below 0 |
| Adjacent bands | — | — | e.g. `0-39` then `40-59` (touching at the boundary but not overlapping) | Accept; this is the *only* way two integer bands can be "adjacent" without overlapping, per raw input's own overlap example (`0-40`/`40-100` is invalid) |
| Single-band configuration | — | — | One row `0-100` | Not explicitly disallowed by raw input; needs OI-THRESHOLD-CONFIG-3 (min band count) resolved |
| `Code` length/charset | 1 char | unspecified | uppercase, `[A-Z0-9_]`-style only per "no spaces or special characters" (assumption on exact charset — raw input doesn't give a regex) | Reject empty; accept alnum/underscore uppercase (assumption, needs confirmation) |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Threshold list/save operate on a small row count (≈5-20 bands) | No explicit target given; expect sub-second response | Manual/API test | Not a high-volume table |
| Security | `ADMIN`-only gating on both `GET` and `POST` endpoints; role-check must not be FE-only | Enforced server-side via `requireAdmin`-equivalent | BE web-layer test | See §13; closed by HD-THRESHOLD-CONFIG-5 |
| Availability / Reliability | Save is atomic — no partial soft-delete/update/insert on validation failure | Single `@Transactional` boundary | Integration test | Per raw input §4.3 |
| Maintainability | Follow hexagonal layering; no direct DB access from `web` | ArchUnit `ArchitectureTest` stays green | ArchUnit test suite | Per `20-architecture.md` |
| Performance | Score-band lookup (BR-THRESHOLD-CONFIG-013) is called per scoring event by `EvidenceQualityScoreService`, not just from the admin screen | Lookup should avoid a DB round-trip per evaluation (e.g. in-memory cache invalidated on save) | Phase 3 load/perf check | New concern introduced by HD-THRESHOLD-CONFIG-1; caching strategy itself is a Phase 3 implementation decision, not a new Human Decision — see OI-THRESHOLD-CONFIG-8 |
| Observability / Logging | Validation/authorization failures logged appropriately; no PII/stack traces to client | Per `error-handling.md`/`security.md` | Log review | Standard project-wide rule |
| Compatibility | New endpoint(s) must not break existing `/api/v1/**` consumers; existing `ScoreBand` callers must be updated in lockstep, not left half-migrated | N/A — net-new endpoint, but non-trivial internal refactor | Code review + `EvidenceQualityScoreModelsTest` update | See §14 |

## 7. Acceptance Criteria

| ACID | description | testable? | notes |
|---|---|---|---|
| AC-THRESHOLD-CONFIG-1 | Given an authenticated user with the required role, when they open the screen, then the active (`delete_flag = '0'`) threshold list loads showing ID/From/To/Label/Code/Color | Yes | Requires GET endpoint per OI-THRESHOLD-CONFIG-4 |
| AC-THRESHOLD-CONFIG-2 | Given View Mode, when the user clicks `[Chỉnh sửa]`/Edit, then all active rows become inline-editable and the button group changes to Save/Cancel/Add-band | Yes | FE state test |
| AC-THRESHOLD-CONFIG-3 | Given Edit Mode with unsaved local changes, when the user clicks `[Hủy bỏ]`/Cancel, then the UI reverts to the original list and returns to View Mode, and **no HTTP request is sent** | Yes | FE test asserting zero network calls on cancel |
| AC-THRESHOLD-CONFIG-4 | Given Edit Mode, when the user clicks Add band, then a new row with no `id` appears and can be filled in | Yes | FE test |
| AC-THRESHOLD-CONFIG-5 | Given Edit Mode, when the user removes a row and saves, then the backend sets `delete_flag = '1'` and `updated_at = NOW()` for that row's `id`, and the row is not physically deleted | Yes | BE integration test |
| AC-THRESHOLD-CONFIG-6 | Given a save payload whose active bands leave a gap (e.g. `0-39`, `45-100`), when saved, then the request is rejected with HTTP 400 and no data is changed | Yes | BE unit + API test |
| AC-THRESHOLD-CONFIG-7 | Given a save payload whose active bands overlap (e.g. `0-40`, `40-100`), when saved, then the request is rejected with HTTP 400 and no data is changed | Yes | BE unit + API test |
| AC-THRESHOLD-CONFIG-8 | Given a save payload with a duplicate `Code` among the resulting active set, when saved, then the request is rejected with HTTP 400 and no data is changed | Yes | BE unit + API test |
| AC-THRESHOLD-CONFIG-9 | Given a save payload with `Code` lowercase or containing spaces/special characters, when saved, then the request is rejected | Yes | BE unit + API test |
| AC-THRESHOLD-CONFIG-10 | Given a `Code` that only exists on a soft-deleted (`delete_flag='1'`) row, when a new/edited active row reuses that same `Code`, then the save is accepted (soft-deleted rows are excluded from the uniqueness check) | Yes | BE unit + DB test |
| AC-THRESHOLD-CONFIG-11 | Given a valid, gap-free, non-overlapping, uniquely-coded payload, when saved, then soft-deletes/updates/inserts all commit atomically in one transaction | Yes | BE integration test |
| AC-THRESHOLD-CONFIG-12 | Given a user whose role is not `ADMIN`, when they call `GET` or `POST /api/v1/score-thresholds` directly, then the backend rejects with HTTP 403 `ErrorResponse` and no data changes | Yes | BE security/API test |
| AC-THRESHOLD-CONFIG-13 | Given Edit Mode, when the user changes a From/To value, then the 0-100 progress bar recolors in realtime to reflect the in-progress edit | Yes | FE component test |
| AC-THRESHOLD-CONFIG-14 | Given the screen in any mode, when labels are rendered, then all displayed text goes through the existing i18n system (no hardcoded literal strings) | Yes | FE i18n review/test |
| AC-THRESHOLD-CONFIG-15 | Given Edit Mode, when the user picks a new color for a band via the color picker and saves, then the persisted/returned `color` value reflects the new selection | Yes | FE component test + BE integration test |
| AC-THRESHOLD-CONFIG-16 | Given the data table in either mode, when rows are rendered, then each row shows a Status value (`ACTIVE`/`DELETE`) consistent with its `delete_flag`, and the Actions column is hidden in View Mode and shows a delete control in Edit Mode | Yes | FE component test |
| AC-THRESHOLD-CONFIG-17 | Given an Admin renames a band's Label, changes its Color, or adjusts its From/To range and saves, when a score is subsequently evaluated by `EvidenceQualityScoreService` or a PM dashboard page is viewed, then the updated label/color/range is reflected without any code deployment | Yes | BE integration test + FE test; closed by HD-THRESHOLD-CONFIG-1 |
| AC-THRESHOLD-CONFIG-18 | Given a score value with no band gap in the active config (guaranteed by BR-THRESHOLD-CONFIG-005 at save time), when `EvidenceQualityScoreService` looks up the band for that score, then exactly one band is returned, matching BR-THRESHOLD-CONFIG-013 | Yes | BE unit test; closed by HD-THRESHOLD-CONFIG-1 |

## 8. Examples

### 8.1. Normal Case

Save payload with the 5 default bands (all fields present, coverage 0-100, no gaps/overlaps,
unique uppercase codes) → accepted, persisted, returns success.

### 8.2. Error Case

```text
Gap:      0-39, 45-100                       -> reject (missing 40-44)
Overlap:  0-40, 40-100                       -> reject (both claim 40)
Duplicate Code: two rows both "WARNING"      -> reject
Invalid Code:   "excellent score" (lowercase, space) -> reject
From > To:      { minScore: 80, maxScore: 60 } -> reject
Unauthorized:   non-ADMIN user calls POST /api/v1/score-thresholds -> HTTP 403
```

### 8.3. Boundary Case

```text
Single band 0-100                              -> accept if min-band-count rule allows (OI-THRESHOLD-CONFIG-3)
Adjacent bands touching at boundary: 0-39/40-59 -> accept (not an overlap)
Reused Code from a soft-deleted row             -> accept (uniqueness excludes delete_flag='1' rows)
Code exactly at charset boundary (all uppercase, single char) -> accept per assumption A-THRESHOLD-CONFIG-4
```

## 9. Source Availability Summary

See `sources.md` for the full citation table. Key Phase 1 availability:

1. The raw input (`01_raw-input.md`) is the only product-requirement source; no wireframe,
   meeting memo, or prior spec exists for this ticket.
2. The concrete backend/frontend hardcoded score-band implementation was located and verified
   line-by-line (`EvidenceQualityScoreModels.java`, `pm-dashboard/utils.ts`).
3. Admin-gating (`ForbiddenException`/`requireAdmin`), optimistic-locking (`version` column +
   `OptimisticLockingException`), and soft-delete + partial-unique-index (`V110` migration)
   precedents were all located and verified in current merged source — these de-risk what would
   otherwise be open architectural questions.
4. No FE/BE contract artifact, OpenAPI spec, or existing test for this specific feature area
   exists; the proposed contract in §11 is new and unverified against any running system.
5. Several standards docs (`architecture/overview.md`'s soft-delete note,
   `security.md`/`error-handling.md`'s "AdminController" inconsistency note) were found to be
   stale relative to actual merged source — see `sources.md` Source Limitations.

## 10. Complexity Classification

```text
- Complexity: Complex (escalated by HD-THRESHOLD-CONFIG-1: this ticket now also rewires ScoreBand
  consumption across BE quality-scoring and PM-dashboard code, plus FE pm-dashboard styling)
- System shape: FE+BE / API / DB
- Primary risk: Source (enum-to-config refactor blast radius) / Contract (POST batch-upsert shape
  is non-standard) / DB (soft-delete + uniqueness scoping)
- Review mode: Heavy
- Required options: DB Migration, Source Analysis (ScoreBand consumer refactor), FE-BE Contract
  (recommend a Pack-26-style deep dive before Phase 3 to pin the exact DTO/response shape)
```

## 11. FE/BE Contract Impact

1. Endpoints, closed by HD-THRESHOLD-CONFIG-4: `GET /api/v1/score-thresholds` (list active bands)
   and `POST /api/v1/score-thresholds` (batch save — soft-delete/update/insert). `POST` was chosen
   over the raw input's `PUT` because this is a collection-level batch action with mixed
   create/update/soft-delete semantics rather than a single-resource full replace, and because the
   human owner explicitly directed the change.
2. Field casing: camelCase (`minScore`/`maxScore`, not the raw input's literal snake_case),
   per `api-contract.md` and HD-THRESHOLD-CONFIG-4.
3. Error responses follow the standard `ErrorResponse` shape and `GlobalExceptionHandler` mapping
   table (§6.4) — no new error format introduced.
4. FE must call through `lib/api.ts` (per `20-architecture.md`), use TanStack Query for the
   list/save operations, and Zustand (or local component state) only for the ephemeral
   View/Edit-mode toggle — Edit Mode is UI-only state, not server-synced.
5. FE screen should follow the `pages/admin-audit-log/` folder shape
   (`ThresholdConfigPage.tsx` + `components/` + `hooks/` + `types.ts` + `utils.ts`) as the closest
   existing precedent for an admin-gated config screen.
6. New i18n keys under `Pages.ThresholdConfig.*` (or similar), following the existing
   `Pages.<PageName>.*` locale-key convention.
7. **New per HD-THRESHOLD-CONFIG-1**: `PmDashboardDtos`/`PmDashboardModels` and any FE type
   currently typed against the 5-value `ScoreBand` enum must be reviewed — their `scoreBand`-typed
   fields likely need to widen from a fixed union/enum to an open `string` (the dynamic `code`),
   which is a breaking-ish change to any FE type currently declared as a closed union of the 5
   literal band codes. Must be confirmed in the Pack-26-style contract review before Phase 3.
8. Recommend a Pack-26-style FE/BE contract deep dive before Phase 3 implementation, given the
   `POST` batch-upsert shape and the consumer-widening question in point 7.

## 12. DB/Migration Impact

1. New table required — no existing table can be repurposed. Name **closed by
   HD-THRESHOLD-CONFIG-3**: `tbl_dim_score_threshold` (not the raw input's literal
   `tbl_score_thresholds`), matching the `tbl_dim_<name>` convention for new dimension/master
   tables.
2. Next free migration slot: `V503` onward (highest existing merged migration is
   `V502__pm_dashboard_snapshot_ticket_repo_fix.sql`); exact number is a Phase 3 concern, not a
   Phase 1 decision.
3. Recommended columns, based on directly observed precedent (`V110` migration +
   `CustomerService`/`OrganizationService`/`TeamService` pattern):
   - `id` — PK, type per V5+ convention (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
   - `code VARCHAR NOT NULL` — **not** the existing `score_band` PG enum type, since admin-added
     codes must not be constrained to a fixed enum (see C-THRESHOLD-CONFIG-001)
   - `label VARCHAR NOT NULL`
   - `min_score INTEGER NOT NULL`, `max_score INTEGER NOT NULL` (assuming integer scores — see
     A-THRESHOLD-CONFIG-3)
   - `color VARCHAR NOT NULL`
   - `delete_flag` (soft-delete marker, matching existing precedent's type/values)
   - `version BIGINT NOT NULL DEFAULT 0` — **closed by HD-THRESHOLD-CONFIG-6**, adopted for
     optimistic-locking conflict detection on save
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT
     NOW()` per `database.md`'s universal timestamp rule
4. A partial unique index scoped to active rows is required for the Code-uniqueness rule, directly
   precedented by `V110`'s `ux_tbl_dim_customer_alias_active` (e.g.
   `ux_tbl_dim_score_threshold_code_active ... WHERE delete_flag = <active-value>`).
5. Seed data for the 5 default bands is in scope (raw input §2) — following the
   `V2__seed_demo_data.sql`-style pattern noted as acceptable in `database.md`, or as part of the
   same table-creation migration; exact seeding mechanism is a Phase 3 implementation detail.
6. No existing table or migration is altered by this feature besides the new table itself.

## 13. Security/Privacy Impact

1. All endpoints (`GET` and `POST /api/v1/score-thresholds`) must be gated server-side to
   `ADMIN` only, following the established `requireAdmin(AppUser caller)` →
   `ForbiddenException("Component.Permission.Denied")` pattern (`AdminAuditLogController.java`) —
   FE hiding the Edit button is not sufficient security on its own. **Closed by
   HD-THRESHOLD-CONFIG-5**: no Operations Manager or other role gets access.
2. No secrets, PII, or credentials are involved in this feature — threshold bands are pure
   configuration data.
3. Error responses must never leak stack traces, SQL, or internal class names, per
   `error-handling.md`'s universal 500-error policy — no feature-specific deviation needed.
4. `SecurityConfig`'s `permitAll` list does not include this new endpoint — it inherits the
   default "authenticated session required" rule automatically; the `ADMIN`-role gating is
   feature-specific work layered on top.

## 14. Operation/Maintenance Impact

1. No CI/settings changes are part of this Phase 1 artifact-authoring step.
2. **Per HD-THRESHOLD-CONFIG-1**, existing `EvidenceQualityScoreModelsTest.score_band_thresholds_match_spec`
   must be revised in Phase 3, since it currently asserts hardcoded boundaries that are no longer
   the source of truth once `ScoreBand.fromScore()` reads `tbl_dim_score_threshold`.
3. Seed-data migration (the 5 default bands) must remain reproducible for fresh environments,
   consistent with how other seed migrations in this repo are structured — and now doubles as the
   fixture that `EvidenceQualityScoreService` depends on at runtime, not just admin-screen demo
   data.
4. Soft-deleted rows accumulate indefinitely (no restore/purge described) — acceptable per raw
   input, but worth noting for future data-volume awareness given this is a low-cardinality table.
5. Cache-invalidation strategy for the band lookup (per the new Non-functional/Performance row in
   §6.6) must be documented once implemented, since a stale cache would cause visible
   classification errors across dashboards — tracked as OI-THRESHOLD-CONFIG-8.

## 15. Test Strategy Summary

Required later-phase test scenarios (per `40-testing.md` conventions — BE mocks port interfaces
only, one test class per production class; FE uses Vitest/Testing Library with `QueryClientProvider`
and i18n providers):

1. BE domain/unit tests for gap/overlap/`From<=To`/duplicate-Code validation logic (pure functions,
   no DB).
2. BE service tests (mocking the persistence port) for the soft-delete/update/insert batch
   orchestration and its `@Transactional` atomicity.
3. BE `@WebMvcTest` controller tests for the mutating endpoint's role-gating (403 for
   non-permitted roles) and validation-error responses (400).
4. BE integration test verifying the partial unique index actually rejects duplicate active
   `Code` values at the DB layer, and that soft-deleted rows don't collide.
5. FE hook tests for the list query and save mutation (TanStack Query), including error-state
   handling.
6. FE component tests: View/Edit mode toggle, realtime progress bar recoloring, Cancel-with-
   zero-network-calls behavior, Add-band row insertion.
7. FE i18n test/review confirming no hardcoded literal label strings.
8. ArchUnit `ArchitectureTest` must stay green with the new controller/service/port/adapter/DTO
   classes added in their correct hexagonal layers.
9. E2E happy-path test (Playwright) for the full view → edit → save cycle, once auth/test-user
   strategy for this screen is settled.
10. **New per HD-THRESHOLD-CONFIG-1**: BE unit test for `ScoreBand`-equivalent lookup reading the
    active band set from `tbl_dim_score_threshold` instead of the hardcoded enum, replacing the
    now-stale `EvidenceQualityScoreModelsTest.score_band_thresholds_match_spec`.
11. **New per HD-THRESHOLD-CONFIG-1**: integration test confirming that renaming/recoloring a band
    via the admin screen changes what `EvidenceQualityScoreService` and PM-dashboard consumers
    return/render, without a redeploy (verifies AC-THRESHOLD-CONFIG-17).
12. **New per HD-THRESHOLD-CONFIG-6**: BE test for the optimistic-locking conflict path — two
    concurrent saves against the same `version`, second one gets HTTP 409.

## 16. Phase 1 Gate Judgment

| item | judgment |
|---|---|
| Phase 1 Gate Status | PASS |
| Can proceed to Pack 26 A-6 (FE/BE contract deep dive) | Recommended, not mandatory |
| Can proceed to Phase 3 directly | Yes |
| Reason | All 6 Human Decisions raised in Phase 1 are Closed or explicitly Deferred (HD-THRESHOLD-CONFIG-2); remaining Open Issues (§19) are Phase 3 implementation details (integer-vs-decimal scores, band-count limits, color validation strictness, cache-invalidation strategy), not product/spec blockers |

## 17. Human Decision Required

| ID | decision item | decision | owner/date | status |
|---|---|---|---|---|
| HD-THRESHOLD-CONFIG-1 | Is rewiring `ScoreBand.fromScore()` (BE) and `scoreBandClasses` (FE) to consume the new config table in scope for this ticket? | Yes — read active bands from `tbl_dim_score_threshold` at runtime; `EvidenceQualityScoreService`, `PmDashboardService`/`PmDashboardModels`/`PmDashboardDtos`, `EvidenceQualityScoreMapper`, and FE `pm-dashboard` consumers are all in scope for this rewiring | Human Owner / 2026-07-21 | Closed |
| HD-THRESHOLD-CONFIG-2 | What does "Code editable only for new configs or without special constraints" mean, and which codes (if any) are protected from renaming? | Deferred — no restriction rule is implemented; Code remains freely editable subject only to the normal format/uniqueness rules | Human Owner / 2026-07-21 | Deferred |
| HD-THRESHOLD-CONFIG-3 | Table name: `tbl_score_thresholds` (literal PRD) or `tbl_dim_score_threshold` (per `tbl_dim_*` convention)? | Use `tbl_dim_score_threshold` | Human Owner / 2026-07-21 | Closed |
| HD-THRESHOLD-CONFIG-4 | API field casing/shape: literal PRD (snake_case, `PUT`) or repo convention (camelCase)? | Use `POST /api/v1/score-thresholds` (changed from the PRD's `PUT`) with camelCase fields, following `api-contract.md`; a matching `GET /api/v1/score-thresholds` list endpoint follows the same convention | Human Owner / 2026-07-21 | Closed |
| HD-THRESHOLD-CONFIG-5 | Exact role(s) permitted to view vs. edit | Admin-only — no Operations Manager access, for either view or edit | Human Owner / 2026-07-21 | Closed |
| HD-THRESHOLD-CONFIG-6 | Should concurrent-edit protection use the existing `version`-column optimistic-locking pattern? | Yes — follow the existing system's pattern (`CustomerService`/`OrganizationService`/`TeamService` + `V110`-style `version` column) | Human Owner / 2026-07-21 | Closed |

## 18. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-THRESHOLD-CONFIG-1 | ScoreBand-consumption migration is in scope | Superseded — closed by HD-THRESHOLD-CONFIG-1 | Low | No |
| A-THRESHOLD-CONFIG-2 | New table is `tbl_dim_score_threshold` | Superseded — closed by HD-THRESHOLD-CONFIG-3 | Low | No |
| A-THRESHOLD-CONFIG-3 | Scores (`From`/`To`) are whole integers 0-100 inclusive | All raw-input examples are integers; no decimal example given | Medium | Yes — OI-THRESHOLD-CONFIG-1 |
| A-THRESHOLD-CONFIG-4 | `Code` charset is uppercase letters/digits/underscore, no explicit length cap | Raw input says "uppercase, no spaces or special characters" but gives no regex or max length | Low | Yes — Phase 3 confirmation |
| A-THRESHOLD-CONFIG-5 | API JSON uses camelCase, not the PRD's literal snake_case sample | Superseded — closed by HD-THRESHOLD-CONFIG-4 | Low | No |
| A-THRESHOLD-CONFIG-6 | Admin gating reuses the existing `requireAdmin`/`ForbiddenException` pattern | Verified current precedent in `AdminAuditLogController` and many services; confirmed by HD-THRESHOLD-CONFIG-5's Admin-only decision | Low | No |
| A-THRESHOLD-CONFIG-7 | A `GET` endpoint (list) exists alongside the save endpoint | Superseded — closed by HD-THRESHOLD-CONFIG-4 | Low | No |
| A-THRESHOLD-CONFIG-8 | `Label` is trimmed before the non-empty validation | Consistent with existing repo convention seen in ROLE's `role_name` trim rule; not explicitly stated in raw input | Low | Phase 3 confirmation |
| A-THRESHOLD-CONFIG-9 | Score-band lookup (BR-THRESHOLD-CONFIG-013) should be cached in-memory rather than hitting the DB on every scoring event | `EvidenceQualityScoreService` runs per scoring event; a bare DB round-trip per lookup would be a new performance cost not present in the current hardcoded-enum implementation | Medium | Yes — OI-THRESHOLD-CONFIG-8, Phase 3 |

## 19. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-THRESHOLD-CONFIG-1 | Raw input never states whether scores are integer-only or can be decimal | Affects column type (`INTEGER` vs `NUMERIC`) and boundary/gap-detection logic | BE owner / PO | Open for Phase 3 |
| OI-THRESHOLD-CONFIG-2 | No minimum (≥1 active band) or maximum band-count rule is stated | Affects whether an empty or single-row save is valid | PO | Open for Phase 3 |
| OI-THRESHOLD-CONFIG-3 | Whether a single band covering the full `0-100` range is valid | Boundary case with no explicit rule either way | PO | Open for Phase 3 |
| OI-THRESHOLD-CONFIG-7 | No statement on whether a color value must be validated as a hex code, a palette-restricted choice, or free text | Affects FE color-picker component choice and BE validation strictness | FE owner / PO | Open for Phase 3 |
| OI-THRESHOLD-CONFIG-8 | Cache/staleness strategy for the score-band lookup now that it reads `tbl_dim_score_threshold` at runtime (HD-THRESHOLD-CONFIG-1) | A naive per-lookup DB query adds load to a per-scoring-event hot path; a cache needs an invalidation trigger tied to the save endpoint | BE owner / Tech Lead | Open for Phase 3 |
| OI-THRESHOLD-CONFIG-9 | Whether FE/DTO types currently declaring `scoreBand` as a closed union of the 5 literal codes need to widen to `string` | Raised by HD-THRESHOLD-CONFIG-1's consumer-rewiring; affects `PmDashboardDtos`/`PmDashboardModels` and any FE type reuse | FE/BE owners | Open for Pack 26 / Phase 3 |

## 20. Resolved Issues

| ID | resolved issue | resolution |
|---|---|---|
| RI-THRESHOLD-CONFIG-1 | Scope of ScoreBand-consumption migration undecided | Resolved by HD-THRESHOLD-CONFIG-1: in scope |
| RI-THRESHOLD-CONFIG-2 | Code-editing-restriction rule undefined | Resolved by HD-THRESHOLD-CONFIG-2: deferred, no restriction implemented |
| RI-THRESHOLD-CONFIG-3 | Table naming undecided (`tbl_score_thresholds` vs `tbl_dim_score_threshold`) | Resolved by HD-THRESHOLD-CONFIG-3: `tbl_dim_score_threshold` |
| RI-THRESHOLD-CONFIG-4 | API endpoint verb and field casing undecided | Resolved by HD-THRESHOLD-CONFIG-4: `POST` (not `PUT`), camelCase, plus a companion `GET` list endpoint |
| RI-THRESHOLD-CONFIG-5 | Exact permitted role(s) undecided (Admin vs. Admin + Operations Manager) | Resolved by HD-THRESHOLD-CONFIG-5: Admin-only |
| RI-THRESHOLD-CONFIG-6 | Concurrent-edit protection strategy undecided | Resolved by HD-THRESHOLD-CONFIG-6: adopt existing `version`-column optimistic-locking pattern |
| RI-THRESHOLD-CONFIG-7 | `architecture/overview.md`'s stale "soft delete not used" note vs. actual merged practice | Non-blocking; actual merged code (`V92`, `V110`) is treated as authoritative; recommend a documentation fix as a separate follow-up, not part of this ticket |
| RI-THRESHOLD-CONFIG-8 | `security.md`/`error-handling.md`'s stale "AdminController ad-hoc Map" note vs. actual `ForbiddenException` pattern | Non-blocking; actual merged code (`AdminAuditLogController`) is treated as authoritative; recommend a documentation fix as a separate follow-up, not part of this ticket |
