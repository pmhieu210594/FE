# Review Checklist

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-22

## 1. Specification/AC Matching
| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-THRESHOLD-CONFIG-1 | GET returns active-only (`delete_flag='0'`) bands with all 6 displayed fields (ID/From/To/Label/Code/Color) | Major | PASS |
| AC-THRESHOLD-CONFIG-2 | Edit click makes all active rows inline-editable and swaps button group to Save/Cancel/Add-band | Minor | PASS |
| AC-THRESHOLD-CONFIG-3 | Cancel/Revert restores original list, returns to View Mode, and triggers zero backend calls | Major | PASS |
| AC-THRESHOLD-CONFIG-4 | Add-band inserts a new row with no `id`, editable inline | Minor | PASS |
| AC-THRESHOLD-CONFIG-5 | Removing a row + Save sets `delete_flag='1'`/`updated_at=NOW()`; no physical delete | Blocker | PASS (unit-level; not run against live DB) |
| AC-THRESHOLD-CONFIG-6 | Gap in active-band coverage rejected (HTTP 400), no partial commit | Blocker | PASS |
| AC-THRESHOLD-CONFIG-7 | Overlap in active-band coverage rejected (HTTP 400), no partial commit | Blocker | PASS |
| AC-THRESHOLD-CONFIG-8 | Duplicate `Code` in resulting active set rejected (HTTP 400), no partial commit | Blocker | PASS |
| AC-THRESHOLD-CONFIG-9 | Lowercase/space/special-char `Code` rejected | Major | PASS |
| AC-THRESHOLD-CONFIG-10 | `Code` reused from a soft-deleted row is accepted (uniqueness excludes `delete_flag='1'`) | Major | PASS (by design; DB partial-unique-index not exercised live) |
| AC-THRESHOLD-CONFIG-11 | Valid payload commits soft-delete+update+insert atomically in one transaction | Blocker | PASS |
| AC-THRESHOLD-CONFIG-12 | Non-ADMIN rejected with HTTP 403 on both GET and POST, no data changed | Blocker | PASS |
| AC-THRESHOLD-CONFIG-13 | 0-100 progress bar recolors in realtime as From/To are edited | Minor | PASS (light coverage, no dedicated recolor assertion) |
| AC-THRESHOLD-CONFIG-14 | All displayed labels go through i18n, no hardcoded literal strings | Minor | PASS (manual review) |
| AC-THRESHOLD-CONFIG-15 | Color-picker selection is persisted and returned by save/list | Major | PASS (unit-level) |
| AC-THRESHOLD-CONFIG-16 | Row Status (ACTIVE/DELETE) matches `delete_flag`; Actions column hidden in View Mode, shown in Edit Mode | Minor | PASS |
| AC-THRESHOLD-CONFIG-17 | Label/Color/range change is reflected by `EvidenceQualityScoreService`/PM-dashboard consumers without redeploy | Major | PASS (unit-level; no live redeploy-free integration test) |
| AC-THRESHOLD-CONFIG-18 | Band lookup for a score with no gap returns exactly one band (BR-THRESHOLD-CONFIG-013) | Major | PASS |

## 2. General System Review

### 2.1. Number/Input Check
- [x] Clear Numeric Validation
- [ ] Full-width Numbers are Processed or Clearly Not Supported
- [ ] Half-width/Full-width Mixed Numbers are Considered
- [x] Empty String/Null are Processed
- [x] Clear Digit/Precision/Scale/Rounding
- [x] No Overflow/Underflow

### 2.2. Character Type / Encoding / Locale

- [ ] Full-width/half-width/emoji/surrogate pair considered
- [x] Clear trim rule
- [ ] Unicode normalization if needed
- [ ] No mojibake Shift-JIS/UTF-8
- [x] Japanese/Vietnamese/English messages are not misspelled

### 2.3. Literal / Magic Number

- [x] No hard-coded business code value
- [x] Enum/constant/master used correctly
- [x] Clear mapping display/internal value

### 2.4. Operation / Maintainability

- [x] Sufficient logs for incident investigation
- [ ] Correlation ID/request ID if needed
- [ ] Retry/double execution considered
- [x] Clear rollback/manual recovery
- [x] Configuration not hard-coded

## 3. FE Review

- [x] Edit Mode toggle is local/Zustand UI state only, not the fetched rows (Zustand never holds server data — `store/uiStore.ts` doc-comment)
- [x] All API calls go through `lib/api.ts` — no direct `fetch` anywhere (ticket-rules.md Must Not Do)
- [x] No hardcoded label strings (i18n coverage, AC-14)
- [x] Cancel/Revert makes zero network calls (BR-THRESHOLD-CONFIG-004, AC-3)
- [x] Color-picker hex value validated client-side (`^#[0-9A-Fa-f]{6}$`) mirroring server validation
- [x] Progress bar recolor logic is pure UI state, no side effects/API calls (AC-13)
- [x] Status column (`ACTIVE`/`DELETE`) shown in both modes; Actions column hidden in View Mode, shown with delete control in Edit Mode (AC-16)
- [x] Any new reusable component (`ColorPicker`, `ScoreRangeProgressBar`, table row) uses `React.forwardRef` + `displayName`, CVA for variants, `cn()` for class merging (`10-style.md`)
- [x] No `any` types; no unchecked `as` cast without a `// reason:` comment (`10-style.md`)

## 4. BE/API Review

- [x] `requireAdmin` gating present on both GET and POST, re-declared locally (no shared utility exists) (BR-THRESHOLD-CONFIG-001/015)
- [x] Server-side re-validation of gap/overlap/`From<=To`/Code-format/uniqueness runs independent of FE validation (spec-pack §6.1 note)
- [x] All 3 hardcoded band-name copies reconciled consistently: `ScoreBand` enum removed, `PmDashboardService.VALID_SCORE_BANDS`, `EvidenceQualityScoreMapper.toDisplayBand` — none left stale (impact-analysis §17 primary risk)
- [x] `ScoreBand` enum is not extended and no new exhaustive `switch`/pattern-match over the 5 constants was added (ticket-rules.md Must Not Do)
- [x] Save is a single `@Transactional` boundary covering soft-delete+update+insert (BR-THRESHOLD-CONFIG-010, AC-11)
- [x] DTOs are `record` + static `from(...)` factory, matching `PmDashboardDtos` convention (`10-style.md`/context.md)
- [x] Constructor injection only; no `@Autowired` field injection (`10-style.md`)
- [x] `@Transactional` only on the `@Service` method, never on the repository adapter or controller (`10-style.md`)
- [x] Infrastructure exceptions translated to domain exceptions before leaving the adapter layer (`10-style.md`)
- [x] Optimistic-locking conflict (`version` mismatch, 0 rows affected) throws `OptimisticLockingException` → HTTP 409, not a silent overwrite (BR-THRESHOLD-CONFIG-012)

## 5. DB/Migration Review

- [x] Migration number is next-free (V503+) and does not collide with an existing file
- [x] Partial unique index (`ux_tbl_dim_score_threshold_code_active`) scoped to active rows only (`WHERE delete_flag='0'`)
- [x] `version BIGINT NOT NULL DEFAULT 0` column present for optimistic locking (HD-THRESHOLD-CONFIG-6)
- [x] Seed data for the 5 default bands (Excellent/Good/Warning/Risky/Critical, matching existing boundary contract 90/75/60/40) included and reproducible for fresh environments
- [x] No existing table or migration is altered — purely additive (impact-analysis §9)
- [x] `code`/`label`/`color`/`min_score`/`max_score` columns are `NOT NULL`; `min_score`/`max_score` are `INTEGER` (this session's OI-1 decision)

## 6. Security/Privacy Review

- [x] Both endpoints reject non-ADMIN with HTTP 403, enforced server-side, not FE-only (BR-THRESHOLD-CONFIG-015)
- [x] No `@PreAuthorize` relied upon — role check is explicit in code (`requireAdmin`), consistent with `SecurityConfig` having no role-based filter-chain gating
- [x] No PII/secrets in this feature (pure config data)
- [x] No stack traces/SQL/internal class names leak to the client (`error-handling.md`)
- [x] No new `permitAll` entry added for these endpoints — default authenticated-session rule applies unchanged

## 7. Operation/Maintenance Review

- [x] `EvidenceQualityScoreModelsTest.score_band_thresholds_match_spec` replaced with a config-driven equivalent using seeded defaults, no longer asserting stale hardcoded boundaries
- [x] Cache-invalidation strategy for the band lookup (in-memory cache, save-triggered invalidation) is implemented and documented, given the per-scoring-event hot path (OI-THRESHOLD-CONFIG-8)
- [x] Every create/update/soft-delete wrapped in try/catch calling `adminAuditLogService.logCreate/logUpdate/logDelete/logCrudFailure`, matching `CustomerService` precedent
- [x] Migration and BE code changes are documented as a single atomic-deploy unit in the release/rollback runbook (impact-analysis §13) — no incremental migration-then-code-later sequencing

## 8. Test Review

- [x] Gap/overlap/`From<=To`/duplicate-Code/Code-format unit tests present as pure functions (no DB)
- [x] BE service tests (mocking the persistence port) cover soft-delete/update/insert batch atomicity and cache invalidation on save
- [x] BE `@WebMvcTest` covers 403 (non-ADMIN), 400 (validation failure), 409 (optimistic-lock conflict), 200 (happy path) for both endpoints
- [ ] BE integration test confirms the partial unique index rejects duplicate active `Code` at the DB layer and soft-deleted rows don't collide (AC-10)
- [x] Optimistic-locking conflict test: two concurrent saves against the same `version`, second gets HTTP 409
- [x] FE test asserts zero network calls on Cancel (AC-3)
- [x] FE component/i18n tests present for View/Edit toggle, Add-band, progress bar, color picker, no hardcoded literal strings
- [x] ArchUnit `ArchitectureTest` stays green with the new controller/service/port/adapter/DTO classes in their correct hexagonal layers

## 9. Documentation/Traceability Review

- [x] `context.md`'s `scoreBandClasses`-consumer correction (real FE blast radius = `TicketDetailDrawer.tsx` only, not the 4 pages spec-pack originally claimed) is acknowledged and not over-implemented
- [x] `review-checklist.md`/`self-review.md` are updated post-implementation, not left as the Phase-1-era skeleton
- [x] Any newly discovered `ScoreBand` usage beyond the 3 documented call sites was raised as a question before removing the enum (impl-plan §12 Stop/Ask)

## 10. Release/Rollback Review

- [x] New migration is additive only (new table + index + seed data), safely rollback-able pre-release by dropping the new table
- [x] Rollback plan explicitly states migration+code must revert together as a single unit, not independently — a migration-only rollback leaves incompatible code deployed, a code-only rollback leaves an orphaned table (impact-analysis §13)
- [x] Deploy sequencing confirmed: steps 4-6 (service, controller, 3-hardcoded-copy rewire) ship together, not partially (impl-plan §12 Stop/Ask)

## 11. AC ↔ Implementation Cross-Reference

| AC ID | impl-plan step | checklist section |
|---|---|---|
| AC-THRESHOLD-CONFIG-1 | Step 5 (GET endpoint) + Step 8 (FE list render) | §4, §3 |
| AC-THRESHOLD-CONFIG-2 | Step 8-9 (mode toggle) | §3 |
| AC-THRESHOLD-CONFIG-3 | Step 9 (Cancel/Revert) | §3 |
| AC-THRESHOLD-CONFIG-4 | Step 9 (Add-band row) | §3 |
| AC-THRESHOLD-CONFIG-5 | Step 1 (migration) + Step 4 (save soft-delete path) | §5, §4 |
| AC-THRESHOLD-CONFIG-6 | Step 2 (gap validator) | §4, §8 |
| AC-THRESHOLD-CONFIG-7 | Step 2 (overlap validator) | §4, §8 |
| AC-THRESHOLD-CONFIG-8 | Step 2 (duplicate-Code validator) | §4, §8 |
| AC-THRESHOLD-CONFIG-9 | Step 2 (Code format validator) | §4, §8 |
| AC-THRESHOLD-CONFIG-10 | Step 3 (partial unique index scoping) | §5, §8 |
| AC-THRESHOLD-CONFIG-11 | Step 3-4 (atomic batch upsert) | §4, §8 |
| AC-THRESHOLD-CONFIG-12 | Step 5 (`requireAdmin` on both endpoints) | §4, §6 |
| AC-THRESHOLD-CONFIG-13 | Step 9 (`ScoreRangeProgressBar`) | §3 |
| AC-THRESHOLD-CONFIG-14 | Step 11 (i18n) | §3, §9 |
| AC-THRESHOLD-CONFIG-15 | Step 9 (`ColorPicker`) + Step 4 (color persistence) | §3, §4 |
| AC-THRESHOLD-CONFIG-16 | Step 8 (Status/Actions column) | §3 |
| AC-THRESHOLD-CONFIG-17 | Step 6 (rewire 3 hardcoded copies) | §4, §7 |
| AC-THRESHOLD-CONFIG-18 | Step 4 (`lookupBand`) | §4, §8 |

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect Report | Record Reason for Rejection |
| Accepted Risk | Accepted Risk | Record Impact/Owner/Deadline |
