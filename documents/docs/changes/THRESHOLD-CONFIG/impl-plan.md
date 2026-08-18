# Implementation Plan

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-21

## 1. Implementation Principle

Ship the new BE config source-of-truth and all 3 hardcoded-copy fixes
(`EvidenceQualityScoreModels`, `PmDashboardService`, `EvidenceQualityScoreMapper`) in **one atomic
deploy** together with the `V503` migration (see impact-analysis.md §13 — the enum removal breaks
compilation/runtime if the config read path isn't in place). Build the FE screen against the new
`GET`/`POST /api/v1/score-thresholds` API following the `admin-audit-log` folder shape and
`pages/user`'s inline-mutation pattern. Follow the hexagonal flow `web → application (@Service,
@Transactional) → application port → infrastructure (@Repository JDBC adapter)` exactly as
`ArtifactScannerService`/`ArtifactScannerPersistencePort`/`DataOpsDashboardJdbcAdapter` do. Do not
implement anything on ticket-rules.md's "Must Not Do" list.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A. Keep `ScoreBand` enum, add a parallel dynamic lookup for admin-added bands only | Enum handles the 5 defaults, a fallback path handles anything beyond | Smaller initial diff | Leaves two sources of truth; violates ticket-rules.md's explicit "do not extend enum" / "do not add new exhaustive switch" prohibition; an admin editing a *default* band's range wouldn't take effect | Rejected |
| B. Fully replace `ScoreBand` enum with a `code`-string-keyed value object read from `tbl_dim_score_threshold` | Single source of truth for all bands, default or admin-added | Matches spec-pack §5's explicit direction; no dual-maintenance risk | Larger refactor touching 3 call sites in one change | **Selected** |
| C. Keep `ScoreBand` enum but make its thresholds mutable at runtime (static config re-assignment) | Minimal type changes | Enum instances can't represent an arbitrary 6th+ band with a new `code` — a fixed enum's `values()` set is closed at compile time | Rejected — technically infeasible for admin-added bands |

## 3. Reason for Choosing the Alternative Plan

Option B is the only one that satisfies HD-THRESHOLD-CONFIG-1's explicit closure ("a fixed
5-value Java enum ScoreBand can no longer represent the full domain" — spec-pack §5) and avoids
the two-sources-of-truth risk flagged in `context.md`'s DTO/Entity mapping section. Options A and C
were ruled out because they either leave a stale hardcoded fallback or are structurally impossible
given Java enums are closed at compile time.

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `V503__create_tbl_dim_score_threshold.sql` | New table, partial unique index, seed 5 default bands | Persistence for config | AC-1, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, AC-11 |
| `ScoreThresholdConfigModels.java` | `ScoreThreshold` record + pure gap/overlap/coverage/format validators | Domain logic, DB-free unit testable | AC-6, AC-7, AC-8, AC-9 |
| `ScoreThresholdConfigService.java` | `list()`, `save(request, caller)`, `lookupBand(score)`, `getActiveCodes()`, `displayNameForCode(code)`, cache + invalidation, `requireAdmin`, audit-log wrapping | Application orchestration, atomicity, caching | AC-1, AC-5–AC-12, AC-17, AC-18 |
| `ScoreThresholdConfigRepositoryPort.java` | Port interface: `findActive()`, `batchUpsert(soft-deletes, updates, inserts)` | Hexagonal boundary | AC-5, AC-11 |
| `ScoreThresholdConfigRepositoryAdapter.java` | `NamedParameterJdbcTemplate` + `RowMapper` implementation | Persistence adapter | AC-5, AC-10, AC-11 |
| `ScoreThresholdConfigDtos.java` | `record` DTOs + `from(...)` factories | Web-layer shape | AC-1, AC-15 |
| `ScoreThresholdConfigController.java` | `GET`/`POST /api/v1/score-thresholds`, `requireAdmin` | Web entry, ADMIN-only gate | AC-1, AC-12 |
| `EvidenceQualityScoreModels.java` | Remove `ScoreBand` enum; add lookup delegating to `ScoreThresholdConfigService` | Retire enum per §5 | AC-17, AC-18 |
| `EvidenceQualityScoreService.java` | Line 302: `ScoreBand.fromScore(total).displayName()` → `scoreThresholdConfigService.lookupBand(total).label()` | Sole production call site | AC-17, AC-18 |
| `PmDashboardService.java` | Lines 22-23/167-172: `VALID_SCORE_BANDS` → `scoreThresholdConfigService.getActiveCodes()` | Retire hardcoded copy #2 | AC-17 |
| `EvidenceQualityScoreMapper.java` | Lines 256-268: `toDisplayBand` switch → `scoreThresholdConfigService.displayNameForCode(code)`; drop dead import (line 9) | Retire hardcoded copy #3 | AC-17 |
| `EvidenceQualityScoreModelsTest.java` | Replace `score_band_thresholds_match_spec` with config-driven equivalent using seeded defaults | Test currency | AC-18 |
| `lib/api.ts` | New `scoreThresholds: { list, save }` group | FE API access, per `20-architecture.md` | AC-1, AC-11 |
| `locale.json` (en/vi/ja) | New `Pages.ThresholdConfig.*` block | i18n | AC-14 |
| `App.tsx` | New `admin/score-thresholds` route, `RequireAdmin`-wrapped | Admin-only routing | AC-12 |
| `Layout.tsx` | New nav entry, `adminOnly: true` | Discoverability | — |
| `ThresholdConfigPage.tsx` + `components/` (`ThresholdTable`, `ThresholdEditRow`, `ScoreRangeProgressBar`, `ColorPicker`) + `types.ts` + `utils.ts` | Full View/Edit-mode screen | Primary FE deliverable | AC-1–AC-4, AC-13–AC-16 |

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| `ScoreThresholdConfigModels.ScoreThreshold` | add | `id, code, label, minScore, maxScore, color, version` | record | Replaces `ScoreBand` enum constants |
| `ScoreThresholdConfigModels.validateCoverage(List<ScoreThreshold>)` | add | active set | throws `DomainException` on gap/overlap | Pure function, no DB; BR-005 |
| `ScoreThresholdConfigModels.validateCode(String, Set<String> existingActiveCodes)` | add | code, existing codes | throws on format/duplicate | BR-008/009 |
| `ScoreThresholdConfigService.list()` | add | — | `List<ScoreThreshold>` | Active rows only (BR-002) |
| `ScoreThresholdConfigService.save(SaveRequest, AppUser caller)` | add | payload, caller | `List<ScoreThreshold>` | `requireAdmin` → validate → `@Transactional` batch upsert → cache invalidate → audit-log |
| `ScoreThresholdConfigService.lookupBand(BigDecimal score)` | add | score | `ScoreThreshold` | Replaces `ScoreBand.fromScore(BigDecimal)` (`EvidenceQualityScoreModels.java:36-43`); defensive fallback per BR-014 if a gap is ever found at lookup time |
| `ScoreThresholdConfigService.getActiveCodes()` | add | — | `Set<String>` | Replaces `PmDashboardService.VALID_SCORE_BANDS` (lines 22-23) |
| `ScoreThresholdConfigService.displayNameForCode(String code)` | add | code | `String` | Replaces `EvidenceQualityScoreMapper.toDisplayBand` (lines 256-268) |
| `ScoreThresholdConfigService.requireAdmin(AppUser caller)` | add | caller | throws `ForbiddenException("Component.Permission.Denied")` | Private, re-declared per-service — no shared utility exists (context.md) |
| `EvidenceQualityScoreModels.ScoreBand` | remove | — | — | Enum deleted entirely (lines 19-59) |
| `EvidenceQualityScoreService.calculate(...)` line 302 | modify | — | — | Replace `ScoreBand.fromScore(total).displayName()` call |
| `PmDashboardService.normalize(...)` lines 167-172 | modify | — | — | Replace `VALID_SCORE_BANDS.contains(...)` check |
| `EvidenceQualityScoreMapper.scoreResultRowMapper` line 118 | modify | — | — | Replace `toDisplayBand(...)` call; remove line-9 import |
| `ScoreThresholdConfigController.list(AppUser caller)` | add | `@CurrentUser AppUser caller` | `List<ScoreThresholdDto>` | `GET /api/v1/score-thresholds` |
| `ScoreThresholdConfigController.save(SaveScoreThresholdsRequest, AppUser caller)` | add | body, caller | `List<ScoreThresholdDto>` | `POST /api/v1/score-thresholds` |

## 6. SQL / Query / Repository Policy

`ScoreThresholdConfigRepositoryAdapter` uses `NamedParameterJdbcTemplate` + plain `RowMapper`
lambdas, per `DataOpsDashboardJdbcAdapter.java` style — no MyBatis XML (that folder name is
misleading in this codebase per `context.md`). The batch save runs as three separate statement
groups (soft-delete removed rows, `UPDATE` matched-`id` rows with `version` check, `INSERT`
`id`-less rows) inside **one** `ScoreThresholdConfigService.save()` `@Transactional` method — this
mirrors `CustomerService`'s single-transaction-per-operation shape, not
`ArtifactScannerService`'s per-external-item `TransactionTemplate` (that pattern is for
independent per-item commits during a multi-item external scan; this is one cohesive batch, so a
single shared transaction is correct and required by BR-010/AC-11).

## 7. Validation / Error / Logging Policy

- Gap/overlap/`From<=To`/duplicate-Code/format checks are pure functions in
  `ScoreThresholdConfigModels`, tested without a DB (ticket-rules.md Test Focus).
- `IllegalArgumentException` / a `DomainException` subtype → HTTP 400 `DOMAIN_RULE_VIOLATION`, via
  existing `GlobalExceptionHandler` mapping (lines 47-50/79-82) — no new handler code.
- `ForbiddenException("Component.Permission.Denied")` → HTTP 403, existing mapping (lines 37-40).
- `OptimisticLockingException` → HTTP 409, existing mapping (lines 42-45), thrown when a
  version-checked `UPDATE`/soft-delete affects 0 rows, per `CustomerService.java:155-157,181-183`.
- Color validated server-side against `^#[0-9A-Fa-f]{6}$` (this session's OI-7 decision).
- ≥1-active-band-after-save check (this session's OI-2/3 decision) — reject an empty resulting
  active set.
- Every create/update/soft-delete wrapped in try/catch calling
  `adminAuditLogService.logCreate/logUpdate/logDelete/logCrudFailure`, matching
  `CustomerService.java:111-117,160-165,186-191`. No PII/stack traces logged; failures logged at
  WARN per `error-handling.md`/`security.md`.

## 8. Migration / Rollback Policy

`V503__create_tbl_dim_score_threshold.sql` is additive-only (new table + index + seed data; no
existing table altered). **Rollback is a single unit**: reverting a bad deploy means reverting both
the migration and the BE code change together, not the migration alone — because once
`ScoreBand.fromScore()` is removed, the compiled code depends on `tbl_dim_score_threshold`
existing and being seeded; a migration-only rollback would leave incompatible code deployed, and a
code-only rollback would leave an orphaned unused table (harmless, but inconsistent). Document this
constraint in the release/rollback runbook when this ticket ships.

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Write `V503` migration (table, partial unique index, seed 5 defaults) | `V503__create_tbl_dim_score_threshold.sql` | Manual `SELECT` after applying locally; **ask before running `mvn flyway:migrate`** per `00-safety.md §3` | If OI-1/2/3 turn out to affect the column type/constraint decision beyond what was resolved this session — ask before committing |
| 2 | BE domain models + pure validators (no DB) | `ScoreThresholdConfigModels.java` | Unit tests: gap/overlap/`From<=To`/duplicate-Code/format cases | — |
| 3 | BE port interface + JDBC adapter | `ScoreThresholdConfigRepositoryPort.java`, `ScoreThresholdConfigRepositoryAdapter.java` | Adapter test against local Docker Postgres; confirm partial unique index rejects duplicate active Code | — |
| 4 | BE service: list/save/lookupBand/getActiveCodes/displayNameForCode + cache + audit-log + requireAdmin | `ScoreThresholdConfigService.java` | Service tests mocking the port; cache-invalidation-on-save test | If a naive per-lookup DB read appears risky under load — stop and confirm caching approach (already decided this session as in-memory + save-invalidation; re-confirm only if implementation reveals a complication) |
| 5 | BE controller | `ScoreThresholdConfigController.java` | `@WebMvcTest`: 403 non-ADMIN, 400 validation, 200 happy path, 409 conflict | — |
| 6 | Rewire the 3 hardcoded copies in the **same PR** as steps 4-5 | `EvidenceQualityScoreModels.java`, `PmDashboardService.java`, `EvidenceQualityScoreMapper.java` | Replace `EvidenceQualityScoreModelsTest.score_band_thresholds_match_spec`; run ArchUnit `ArchitectureTest` | Must not ship partially — leaving any one hardcoded copy stale violates ticket-rules.md; if any additional unexpected `ScoreBand` usage is found beyond these 3 call sites, ask before removing the enum |
| 7 | FE types/utils/api endpoint group | `types.ts`, `utils.ts`, `lib/api.ts` | `npm run typecheck` | — |
| 8 | FE View Mode (list, badges, Status column, i18n) | `ThresholdConfigPage.tsx`, `components/ThresholdTable.tsx` | Component test (Vitest + Testing Library) | — |
| 9 | FE Edit Mode: inline edit, Add-band row, progress bar, color picker (2 net-new components) | `components/ThresholdEditRow.tsx`, `ScoreRangeProgressBar.tsx`, `ColorPicker.tsx` | Component tests incl. zero-network-call Cancel assertion (AC-3) | — |
| 10 | FE Save mutation wiring + error-state handling | `ThresholdConfigPage.tsx` | Hook test for `useMutation` error path | — |
| 11 | i18n keys | `locale.json` (en/vi/ja) | i18n review — no hardcoded literal strings | — |
| 12 | Admin route + nav entry | `App.tsx:203-210`-style route, `Layout.tsx:93-106`-style nav entry | Manual smoke test: navigate as ADMIN vs non-ADMIN | — |
| 13 | E2E happy path (Playwright), if auth/test-user strategy available | `e2e_tests/` | Full view→edit→save cycle | If no test-user strategy exists for this screen — flag as a follow-up, not a blocker for merging steps 1-12 |

## 10. How to Verify Each Step

Each step above states its own verification method (unit / adapter-integration /
service-mock / `@WebMvcTest` / ArchUnit / component / hook / manual smoke / E2E). Before merging,
additionally re-check ticket-rules.md's Review Focus checklist:

- All 3 hardcoded band-name copies consistently reconciled (step 6).
- `requireAdmin` gating present on both `GET` and `POST`, server-side (steps 4-5).
- Gap/overlap/duplicate-Code/uppercase-Code validation runs server-side regardless of FE
  client-side validation (step 2).
- Save endpoint is atomic — single `@Transactional`, no partial commit on validation failure
  (step 3-4, per §6 SQL policy).
- Soft-delete uniqueness exclusion tested (step 3, AC-10).
- Optimistic-locking conflict path returns HTTP 409, not a silent overwrite (step 4-5).

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-THRESHOLD-CONFIG-1 | Step 5 (`GET` endpoint) + Step 8 (FE list render) | BE `@WebMvcTest` + FE component test |
| AC-THRESHOLD-CONFIG-2 | Step 8-9 (mode toggle) | FE state test |
| AC-THRESHOLD-CONFIG-3 | Step 9 (Cancel/Revert) | FE test asserting zero network calls |
| AC-THRESHOLD-CONFIG-4 | Step 9 (Add-band row) | FE test |
| AC-THRESHOLD-CONFIG-5 | Step 1 (migration), Step 4 (save soft-delete path) | BE integration test |
| AC-THRESHOLD-CONFIG-6 | Step 2 (gap validator) | BE unit + API test |
| AC-THRESHOLD-CONFIG-7 | Step 2 (overlap validator) | BE unit + API test |
| AC-THRESHOLD-CONFIG-8 | Step 2 (duplicate-Code validator) | BE unit + API test |
| AC-THRESHOLD-CONFIG-9 | Step 2 (Code format validator) | BE unit + API test |
| AC-THRESHOLD-CONFIG-10 | Step 3 (partial unique index scoping) | BE unit + DB test |
| AC-THRESHOLD-CONFIG-11 | Step 3-4 (atomic batch upsert) | BE integration test |
| AC-THRESHOLD-CONFIG-12 | Step 5 (`requireAdmin` on both endpoints) | BE security/API test |
| AC-THRESHOLD-CONFIG-13 | Step 9 (`ScoreRangeProgressBar`) | FE component test |
| AC-THRESHOLD-CONFIG-14 | Step 11 (i18n) | FE i18n review/test |
| AC-THRESHOLD-CONFIG-15 | Step 9 (`ColorPicker`) + Step 4 (color persistence) | FE component + BE integration test |
| AC-THRESHOLD-CONFIG-16 | Step 8 (Status/Actions column) | FE component test |
| AC-THRESHOLD-CONFIG-17 | Step 6 (rewire 3 hardcoded copies) | BE integration test + FE test |
| AC-THRESHOLD-CONFIG-18 | Step 4 (`lookupBand`) | BE unit test |

## 12. Stop / Ask Condition

Carried forward from `ticket-rules.md` (verbatim, with current status noted):

- If the FE grep for hardcoded Tailwind class strings duplicating `scoreBandClasses` had found
  matches outside `pm-dashboard/utils.ts` — **already checked this session, zero matches found
  beyond the ruled-out `SummaryCards.tsx` accent map; condition satisfied, not open.**
- If `PmDashboardModels`/`PmDashboardDtos` `scoreBand`-typed fields needed widening beyond plain
  `String` — **already confirmed this session: no widening needed; condition satisfied.**
- If OI-1 (integer vs decimal scores), OI-2 (min band count), OI-3 (single-band validity) affected
  a concrete implementation decision — **resolved this session (INTEGER, ≥1 band, single-band
  valid); condition satisfied, decisions recorded in `source-availability.md`.**
- If a caching strategy for the score-band lookup (OI-8) were not trivial to add without
  measurable risk to the hot path — **resolved this session (in-memory + save-triggered
  invalidation); re-open only if step 4's implementation reveals an unforeseen complication.**

New conditions for this implementation phase:
- Ask before running any Flyway migration or other DB-affecting command, per `00-safety.md §3`.
- Ask before removing the `ScoreBand` enum if any additional unexpected usage turns up beyond the
  3 documented call sites (step 6).
- Ask before merging steps 4-6 partially — they must ship together per the atomic-deploy
  constraint (impact-analysis.md §13).

## 13. Do Not Do This Ticket

Carried forward from `ticket-rules.md` "Must Not Do" (verbatim):

- Do not implement any Code-editing-restriction rule — explicitly deferred by
  HD-THRESHOLD-CONFIG-2 (BR-011). Code remains freely editable subject only to BR-007/008/009.
- Do not implement restore/undelete of soft-deleted bands, physical (hard) delete, or any
  historical/audit reporting UI beyond `delete_flag`/`updated_at`.
- Do not grant any access (view or edit) to Operations Manager or any non-`ADMIN` role.
- Do not extend the `ScoreBand` Java enum with new constants, and do not add any new exhaustive
  `switch`/pattern-match over the fixed 5 constants.
- Do not add a Spring Security `@PreAuthorize` annotation expecting it to work — role checks must
  be explicit in code (`requireAdmin`).
- Do not place fetched threshold rows in a Zustand store — server data must go through TanStack
  Query only.
- Do not call `fetch` directly from any FE component — all calls go through `lib/api.ts`.
- Do not make the Cancel/Revert button call any backend API.

## 14. Open Related Issues

- OI-THRESHOLD-CONFIG-9 (FE/DTO type widening): resolved this session as "not needed" (see §16 of
  `impact-analysis.md`) — carried here only as a final confirmation point during step 6/7
  implementation, in case a field is discovered that wasn't part of the verified inventory.
- OI-1/2/3/7/8: resolved this session (2026-07-21) as Phase 3 implementation decisions — no longer
  open; recorded in `source-availability.md` and reflected throughout this plan.
- Recommend (not mandatory) a Pack-26-style FE/BE contract deep dive on the `POST` batch-upsert
  shape before wide parallel FE/BE implementation, per spec-pack §16 — tracked as a suggestion,
  not a blocker.
