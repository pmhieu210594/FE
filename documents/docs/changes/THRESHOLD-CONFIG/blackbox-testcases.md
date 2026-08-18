# Black-box Test Cases

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-22

Derived purely from `spec-pack.md` §7 (Acceptance Criteria), §6.1 (Business Rules), §6.4
(Error/Exception), §6.5 (Boundary Value), and §8 (Examples) — independent of the actual
implementation. Baseline fixture: the 5 seed bands from `test-plan.md` §7
(CRITICAL 0-39 / RISKY 40-59 / WARNING 60-74 / GOOD 75-89 / EXCELLENT 90-100). See `test-data.md`
for full data sets.

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-1 | P0 | Normal | List active bands loads with ID/From/To/Label/Code/Color |
| BB-002 | AC-1 | P1 | Boundary/State | List load with zero active bands (all soft-deleted) |
| BB-003 | AC-2 | P2 | State | Enter Edit Mode from View Mode |
| BB-004 | AC-3 | P1 | State | Cancel/Revert discards edits with zero backend calls |
| BB-005 | AC-4 | P2 | Normal | Add-band row appears with no `id` |
| BB-006 | AC-5 | P0 | Normal | Soft-delete a row on Save (`delete_flag='1'`, `updated_at` set) |
| BB-007 | AC-6 | P0 | Error | Save rejected — gap in coverage (`0-39,45-100`) |
| BB-008 | AC-7 | P0 | Error | Save rejected — overlap in coverage (`0-40,40-100`) |
| BB-009 | AC-8 | P0 | Error | Save rejected — duplicate Code among active set |
| BB-010 | AC-9 | P0 | Error | Save rejected — Code lowercase/space/special char |
| BB-011 | AC-10 | P1 | Boundary | Code reused from a soft-deleted row is accepted |
| BB-012 | AC-11 | P0 | Normal | Valid batch payload commits soft-delete+update+insert atomically |
| BB-013 | AC-11 | P0 | Error/State | Rejected payload leaves no partial commit |
| BB-014 | AC-12 | P0 | Permission | Non-ADMIN caller rejected with 403 on GET and POST |
| BB-015 | AC-13 | P2 | State | Progress bar recolors in realtime on From/To edit |
| BB-016 | AC-14 | P2 | External IF/Review | All displayed labels resolve through i18n, no literals |
| BB-017 | AC-15 | P1 | Normal | Color picker selection persists and is returned |
| BB-018 | AC-15 | P1 | Error | Invalid hex color value rejected |
| BB-019 | AC-16 | P2 | State | Status/Actions column differ correctly by mode |
| BB-020 | AC-17 | P0 | Normal | Renamed/recolored/re-ranged band reflected without redeploy |
| BB-021 | AC-18 | P0 | Normal | Score lookup returns exactly one band when no gap exists |
| BB-022 | — | P0 | Error | `From > To` on a single row rejected |
| BB-023 | — | P1 | Boundary | Single band covering full `0-100` is valid |
| BB-024 | — | P1 | Boundary | Adjacent bands touching at boundary (`0-39/40-59`) accepted |
| BB-025 | — | P0 | Permission | Unauthenticated caller rejected with 401 |
| BB-026 | — | P1 | State | Concurrent conflicting save rejected with 409 (optimistic lock) |
| BB-027 | — | P2 | External IF/Log | Audit-log entry recorded for create/update/soft-delete |

## Test Cases

### BB-001: List active bands loads with ID/From/To/Label/Code/Color

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Authenticated ADMIN user; 5 seed bands exist, all `delete_flag='0'` |
| Input | `GET /api/v1/score-thresholds` |
| Steps | 1. Log in as ADMIN. 2. Open the Threshold Config screen (or call the GET endpoint directly). |
| Expected Result | HTTP 200; response is a flat list (no envelope) of 5 items, each with `id, code, label, minScore, maxScore, color`; only active rows are returned |
| Note | Baseline data per `test-data.md` Master Data |

### BB-002: List load with zero active bands (all soft-deleted)

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-1 |
| Priority | P1 |
| Category | Boundary / State |
| Preconditions | All 5 seed bands soft-deleted (`delete_flag='1'`) via a prior save |
| Input | `GET /api/v1/score-thresholds` |
| Steps | 1. Soft-delete all bands. 2. Call GET. |
| Expected Result | HTTP 200 with an empty list `[]`; no error; UI (if exercised) shows an empty-state, not a crash |
| Note | Spec-pack does not explicitly forbid an empty active set at list time (only at save time, ≥1 band per impact-analysis §8) — verify list handles it gracefully regardless |

### BB-003: Enter Edit Mode from View Mode

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-2 |
| Priority | P2 |
| Category | State |
| Preconditions | Screen open in View Mode with active bands loaded |
| Input | Click `[Chỉnh sửa]`/Edit |
| Steps | 1. Click Edit button. |
| Expected Result | All active rows become inline-editable; button group changes to Save/Cancel/Add-band |
| Note | FE-observable state transition |

### BB-004: Cancel/Revert discards edits with zero backend calls

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-3 |
| Priority | P1 |
| Category | State |
| Preconditions | Edit Mode active; user has changed at least one Label/Color/range value locally |
| Input | Click `[Hủy bỏ]`/Cancel |
| Steps | 1. Make local edits. 2. Click Cancel. |
| Expected Result | UI reverts to the original (pre-edit) list; screen returns to View Mode; **no HTTP request is sent** (assert zero network calls) |
| Note | BR-THRESHOLD-CONFIG-004; test must assert absence of any API call, not just UI state |

### BB-005: Add-band row appears with no `id`

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-4 |
| Priority | P2 |
| Category | Normal |
| Preconditions | Edit Mode active |
| Input | Click Add-band button |
| Steps | 1. Click Add band. 2. Inspect the new row. |
| Expected Result | A new empty/blank row appears, editable, carrying no `id` value; can be filled in with Code/Label/From/To/Color |
| Note | On save, this row is sent to the backend without an `id` (insert path) |

### BB-006: Soft-delete a row on Save

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-5 |
| Priority | P0 |
| Category | Normal |
| Preconditions | 5 seed bands active; Edit Mode active |
| Input | Payload omitting one previously-active row's `id`/data (e.g. removing RISKY) from `thresholds[]`, remaining 4 bands re-ranged to still cover 0-100 with no gap/overlap |
| Steps | 1. Remove the RISKY row in Edit Mode. 2. Adjust remaining ranges to keep full coverage. 3. Save. |
| Expected Result | HTTP 200; RISKY row's `delete_flag` becomes `'1'` and `updated_at` is set to the save time; row is **not** physically deleted (still queryable, excluded from GET); remaining 4 rows updated per BR-010 |
| Note | Verify via a follow-up query/DB check that the row still exists with `delete_flag='1'` |

### BB-007: Save rejected — gap in coverage

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-6 |
| Priority | P0 |
| Category | Error |
| Preconditions | Authenticated ADMIN |
| Input | `thresholds: [{minScore:0,maxScore:39,...}, {minScore:45,maxScore:100,...}]` (gap 40-44) |
| Steps | 1. Submit `POST /api/v1/score-thresholds` with the gapped payload. |
| Expected Result | HTTP 400, `errorCode: DOMAIN_RULE_VIOLATION`; no data changed (verify via GET before/after) |
| Note | Per `test-data.md` Error Data |

### BB-008: Save rejected — overlap in coverage

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-7 |
| Priority | P0 |
| Category | Error |
| Preconditions | Authenticated ADMIN |
| Input | `thresholds: [{minScore:0,maxScore:40,...}, {minScore:40,maxScore:100,...}]` (both claim 40) |
| Steps | 1. Submit the overlapping payload. |
| Expected Result | HTTP 400, `errorCode: DOMAIN_RULE_VIOLATION`; no data changed |
| Note | Distinguishes overlap from the valid adjacent case in BB-024 |

### BB-009: Save rejected — duplicate Code among active set

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-8 |
| Priority | P0 |
| Category | Error |
| Preconditions | Authenticated ADMIN |
| Input | Two rows in payload both with `code: "WARNING"` |
| Steps | 1. Submit a payload with duplicate Code within the same request. |
| Expected Result | HTTP 400, `errorCode: DOMAIN_RULE_VIOLATION`; rejected before touching DB; no data changed |
| Note | Spec-pack §4.3 step 1 explicitly requires checking duplicates within the payload itself |

### BB-010: Save rejected — Code lowercase/space/special char

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-9 |
| Priority | P0 |
| Category | Error |
| Preconditions | Authenticated ADMIN |
| Input | Three sub-cases: `code: "excellent score"` (lowercase+space), `code: "warn-ing"` (special char), `code: ""` (empty) |
| Steps | 1. Submit each invalid-Code payload variant separately. |
| Expected Result | Each rejected with HTTP 400 (`VALIDATION_ERROR` or `DOMAIN_RULE_VIOLATION`); no data changed |
| Note | Covers BR-007 (required) and BR-008 (format) together — treat as 3 sub-cases under one BB entry |

### BB-011: Code reused from a soft-deleted row is accepted

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-10 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | A row with `code: "LEGACY"` exists with `delete_flag='1'` (soft-deleted in a prior save) |
| Input | New/edited active row reusing `code: "LEGACY"` |
| Steps | 1. Soft-delete a row with Code `LEGACY`. 2. Submit a new payload where an active row uses `code: "LEGACY"` again. |
| Expected Result | HTTP 200; save accepted; the new active row has `code: "LEGACY"`; the old soft-deleted row's data is preserved unmodified |
| Note | BR-009 — uniqueness check excludes `delete_flag='1'` rows |

### BB-012: Valid batch payload commits soft-delete+update+insert atomically

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-11 |
| Priority | P0 |
| Category | Normal |
| Preconditions | 5 seed bands active |
| Input | Payload: remove 1 row (no `id` sent = becomes soft-deleted by omission), update 3 rows (`id` present, Label/Color changed), add 1 new row (no `id`) — coverage/gap/overlap/Code rules all satisfied |
| Steps | 1. Build the mixed payload. 2. Submit `POST`. |
| Expected Result | HTTP 200; response reflects the new active set; DB shows: 1 row `delete_flag='1'`, 3 rows updated, 1 new row inserted — all committed together |
| Note | Verifies BR-010 batch orchestration |

### BB-013: Rejected payload leaves no partial commit

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-11 |
| Priority | P0 |
| Category | Error / State |
| Preconditions | 5 seed bands active |
| Input | A mixed payload (delete+update+insert) where the *insert* row has an invalid Code, while delete/update portions are individually valid |
| Steps | 1. Submit the payload. 2. Query GET afterward. |
| Expected Result | HTTP 400; none of the delete/update/insert operations are applied — GET shows the original, unchanged 5-band state |
| Note | Confirms `@Transactional` atomicity — validation failure anywhere rolls back the whole batch |

### BB-014: Non-ADMIN caller rejected with 403

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-12 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Authenticated user with a non-ADMIN role (see `test-data.md` User/Permission Data) |
| Input | `GET /api/v1/score-thresholds` and `POST /api/v1/score-thresholds` (valid payload) |
| Steps | 1. Log in as non-ADMIN. 2. Call GET. 3. Call POST with a valid payload. |
| Expected Result | Both calls rejected with HTTP 403, `ErrorResponse` with `errorCode: FORBIDDEN`; no data changes from the POST attempt |
| Note | Per HD-THRESHOLD-CONFIG-5, no Operations Manager or other role gets access |

### BB-015: Progress bar recolors in realtime on From/To edit

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-13 |
| Priority | P2 |
| Category | State |
| Preconditions | Edit Mode active |
| Input | Change a band's From/To value in an inline input |
| Steps | 1. Edit a row's From/To field. 2. Observe the 0-100 progress bar. |
| Expected Result | The progress bar recolors immediately to reflect the in-progress edit, without requiring Save |
| Note | FE component-level, client-side only |

### BB-016: All displayed labels resolve through i18n, no literals

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-14 |
| Priority | P2 |
| Category | External IF / Review |
| Preconditions | Screen rendered in at least 2 locales (e.g. `en`, `vi`) |
| Input | Switch app language while the screen is open |
| Steps | 1. Load screen in `en`. 2. Switch to `vi`/`ja`. 3. Inspect all visible text. |
| Expected Result | All button/column/status labels change with the locale; no hardcoded literal English/Vietnamese string remains fixed across locale switch |
| Note | Manual review supplements this per `test-plan.md` §5 — no automated i18n-lint exists |

### BB-017: Color picker selection persists and is returned

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-15 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Edit Mode active; existing band with color `#10B981` |
| Input | New color `#FF5733` selected via the color picker |
| Steps | 1. Open color picker on a band row. 2. Select `#FF5733`. 3. Save. |
| Expected Result | HTTP 200; persisted/returned `color` value for that band is `#FF5733`; subsequent GET reflects the new color |
| Note | Round-trip: FE selection → BE persistence → BE response |

### BB-018: Invalid hex color value rejected

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-15 |
| Priority | P1 |
| Category | Error |
| Preconditions | Authenticated ADMIN |
| Input | `color: "red"` and `color: "#ZZZZZZ"` (two sub-cases) |
| Steps | 1. Submit payload with each invalid color value. |
| Expected Result | HTTP 400; rejected before persisting; no data changed |
| Note | Validation regex `^#[0-9A-Fa-f]{6}$` per `impact-analysis.md` §8 |

### BB-019: Status/Actions column differ correctly by mode

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-16 |
| Priority | P2 |
| Category | State |
| Preconditions | Screen has both active and (if visible) soft-deleted-in-progress rows |
| Input | Toggle between View Mode and Edit Mode |
| Steps | 1. View the table in View Mode. 2. Switch to Edit Mode. |
| Expected Result | Each row shows a Status value (`ACTIVE`/`DELETE`) consistent with its `delete_flag`; Actions column is hidden in View Mode and shows a delete control in Edit Mode |
| Note | FE component test |

### BB-020: Renamed/recolored/re-ranged band reflected without redeploy

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-17 |
| Priority | P0 |
| Category | Normal |
| Preconditions | 5 seed bands active; a scoring event and a PM dashboard view are both exercisable without redeploying |
| Input | Rename `WARNING` band's Label to "Needs Attention", change its Color, adjust its range from `60-74` to `55-74` (with a compensating adjustment to the adjacent band to avoid a gap) |
| Steps | 1. Edit and save the WARNING band's Label/Color/range. 2. Trigger a score evaluation landing in the new range. 3. View the PM dashboard for a ticket in that range. |
| Expected Result | The updated label/color/range is reflected immediately in both the scoring result and the PM dashboard — with no code deployment between save and observation |
| Note | Closed by HD-THRESHOLD-CONFIG-1; validates the cache-invalidation-on-save behavior noted in `impact-analysis.md` §6 |

### BB-021: Score lookup returns exactly one band when no gap exists

| item | content |
|---|---|
| Related AC | AC-THRESHOLD-CONFIG-18 |
| Priority | P0 |
| Category | Normal |
| Preconditions | 5 seed bands active, full 0-100 coverage guaranteed |
| Input | Scores: `0`, `39`, `40`, `74`, `75`, `100` (boundary and mid-range values across all 5 bands) |
| Steps | 1. Trigger a score evaluation for each input value. |
| Expected Result | For each score, exactly one band is returned, matching the band whose `[minScore, maxScore]` contains it |
| Note | BR-013 |

### BB-022: `From > To` on a single row rejected

| item | content |
|---|---|
| Related AC | — (spec-pack §6.4/§8.2, BR-006) |
| Priority | P0 |
| Category | Error |
| Preconditions | Authenticated ADMIN |
| Input | `{minScore: 80, maxScore: 60, ...}` |
| Steps | 1. Submit a payload containing this row alongside otherwise-valid rows. |
| Expected Result | HTTP 400, `errorCode: DOMAIN_RULE_VIOLATION`; no data changed |
| Note | Per spec-pack §8.2 explicit example |

### BB-023: Single band covering full `0-100` is valid

| item | content |
|---|---|
| Related AC | — (spec-pack §6.5/§8.3, OI-THRESHOLD-CONFIG-3 resolved per `impact-analysis.md` §8) |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Authenticated ADMIN |
| Input | `thresholds: [{code:"ALL", label:"All", minScore:0, maxScore:100, color:"#000000"}]`, all other bands removed |
| Steps | 1. Submit a payload with only this single row, deleting all others. |
| Expected Result | HTTP 200; accepted — a single row is a valid minimum active set (≥1 active band rule) |
| Note | Resolved by this session's decision in `impact-analysis.md` §8: save requires ≥1 active band |

### BB-024: Adjacent bands touching at boundary accepted

| item | content |
|---|---|
| Related AC | — (spec-pack §6.5/§8.3) |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Authenticated ADMIN |
| Input | `thresholds: [{minScore:0,maxScore:39,...}, {minScore:40,maxScore:59,...}, ...remaining bands re-ranged to keep 0-100 coverage]` |
| Steps | 1. Submit a payload where two bands touch at a boundary value without overlapping. |
| Expected Result | HTTP 200; accepted — touching at a boundary (one band ending where the next begins) is not an overlap |
| Note | Contrasts directly with BB-008's `0-40/40-100` overlap example from spec-pack §8.3 |

### BB-025: Unauthenticated caller rejected with 401

| item | content |
|---|---|
| Related AC | — (spec-pack §6.4) |
| Priority | P0 |
| Category | Permission |
| Preconditions | No session cookie / not logged in |
| Input | `GET /api/v1/score-thresholds`, `POST /api/v1/score-thresholds` |
| Steps | 1. Call both endpoints without an authenticated session. |
| Expected Result | HTTP 401 for both; no data changes |
| Note | Standard Spring Security session-cookie behavior, no feature-specific logic |

### BB-026: Concurrent conflicting save rejected with 409

| item | content |
|---|---|
| Related AC | — (spec-pack §6.4, BR-012, HD-THRESHOLD-CONFIG-6) |
| Priority | P1 |
| Category | State |
| Preconditions | Two ADMIN sessions load the same active band list (same `version`) |
| Input | Session A saves a valid change first; Session B then saves a valid change against the stale `version` it originally loaded |
| Steps | 1. Both sessions GET the list. 2. Session A submits a valid save. 3. Session B submits a valid save using its original (now-stale) version. |
| Expected Result | Session A's save succeeds (HTTP 200); Session B's save is rejected with HTTP 409, `errorCode: CONFLICT` |
| Note | Mirrors `OptimisticLockingException` precedent from `CustomerService`/`OrganizationService`/`TeamService` |

### BB-027: Audit-log entry recorded for create/update/soft-delete

| item | content |
|---|---|
| Related AC | — (spec-pack §14, `impact-analysis.md` §6/§12) |
| Priority | P2 |
| Category | External IF / Log |
| Preconditions | Authenticated ADMIN; audit log accessible for review |
| Input | A save that inserts 1 new row, updates 1 row, and soft-deletes 1 row |
| Steps | 1. Submit the mixed save. 2. Inspect the audit log for this action. |
| Expected Result | One audit-log entry each for the create, the update, and the soft-delete, with no PII/stack traces logged |
| Note | Matches `CustomerService`-style `adminAuditLogService.logCreate/logUpdate/logDelete` wiring described in `impact-analysis.md` §6 |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [ ] Character type input — not applicable beyond Code charset, covered under Error case (BB-010)
- [x] Numeric input
- [ ] Full-width number — not applicable; UI is Latin-numeral only, no full-width/localized digit input path exists for this feature
- [x] Empty/null
- [x] Duplicate
- [ ] Non-existing ID — not applicable; payload rows are matched by presence/absence of `id`, there is no single-resource "get/update by ID" lookup that can 404
- [x] Deleted data
- [ ] External IF failure — not applicable; this feature has no outbound external integration (GitHub/Jira/CircleCI) dependency
- [ ] Timeout/retry — not applicable; no external IF, and no explicit retry requirement stated in spec-pack
- [ ] Double submit — not covered this phase; recommended as a Phase 3 FE debounce/disable-button check, not a spec-level AC
- [ ] Back/reload — not covered this phase; Edit Mode is local-only UI state per spec-pack §11.4, browser back/reload behavior is not specified
- [ ] Session expired — not applicable beyond standard 401 handling already covered by BB-025
- [x] Existing data compatibility — see `test-data.md` Existing Data Compatibility (n/a, net-new table)
- [x] Log/audit/notification/report output

## AC ↔ Black-box Case Mapping

| AC ID | Black-box case(s) |
|---|---|
| AC-THRESHOLD-CONFIG-1 | BB-001, BB-002 |
| AC-THRESHOLD-CONFIG-2 | BB-003 |
| AC-THRESHOLD-CONFIG-3 | BB-004 |
| AC-THRESHOLD-CONFIG-4 | BB-005 |
| AC-THRESHOLD-CONFIG-5 | BB-006 |
| AC-THRESHOLD-CONFIG-6 | BB-007 |
| AC-THRESHOLD-CONFIG-7 | BB-008 |
| AC-THRESHOLD-CONFIG-8 | BB-009 |
| AC-THRESHOLD-CONFIG-9 | BB-010 |
| AC-THRESHOLD-CONFIG-10 | BB-011 |
| AC-THRESHOLD-CONFIG-11 | BB-012, BB-013 |
| AC-THRESHOLD-CONFIG-12 | BB-014 |
| AC-THRESHOLD-CONFIG-13 | BB-015 |
| AC-THRESHOLD-CONFIG-14 | BB-016 |
| AC-THRESHOLD-CONFIG-15 | BB-017, BB-018 |
| AC-THRESHOLD-CONFIG-16 | BB-019 |
| AC-THRESHOLD-CONFIG-17 | BB-020 |
| AC-THRESHOLD-CONFIG-18 | BB-021 |
| (cross-cutting, not AC-scoped) | BB-022, BB-023, BB-024, BB-025, BB-026, BB-027 |
