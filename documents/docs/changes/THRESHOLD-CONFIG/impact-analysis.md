# Impact Analysis

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-21

## 1. Change Content

Introduce a new persisted, admin-configurable score-threshold table (`tbl_dim_score_threshold`)
and a net-new Admin-only screen (View Mode / Edit Mode) to manage its rows (batch soft-delete +
update + insert, atomic, optimistic-locked). Per HD-THRESHOLD-CONFIG-1, rewire the three existing
hardcoded copies of the 5 score-band names on the BE side to read from this new config instead of
being fixed at compile time:

1. `EvidenceQualityScoreModels.ScoreBand` enum + `fromScore()` (BE domain lookup)
2. `PmDashboardService.VALID_SCORE_BANDS` (BE dashboard filter validation)
3. `EvidenceQualityScoreMapper.toDisplayBand` (BE persistence-mapper display formatting)

On the FE side, the real (verified, not spec-pack-assumed) blast radius is limited to
`TicketDetailDrawer.tsx`'s use of `scoreBandLabel` — see §5.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V503__create_tbl_dim_score_threshold.sql` | New table + partial unique index + seed data | new |
| `EDCAP_BE/.../application/usecase/quality/ScoreThresholdConfigModels.java` | Domain value object (`ScoreThreshold` record) + pure validation functions (gap/overlap/coverage/code format) | new |
| `EDCAP_BE/.../application/usecase/quality/ScoreThresholdConfigService.java` | `@Service`, `@Transactional` list/save/lookupBand/getActiveCodes/displayNameForCode, in-memory cache, `requireAdmin`, audit-log wiring | new |
| `EDCAP_BE/.../application/port/out/persistence/ScoreThresholdConfigRepositoryPort.java` | Port interface (list active, batch soft-delete/update/insert) | new |
| `EDCAP_BE/.../infrastructure/persistence/adapter/ScoreThresholdConfigRepositoryAdapter.java` | `@Repository`, `NamedParameterJdbcTemplate`, `RowMapper` | new |
| `EDCAP_BE/.../web/dto/ScoreThresholdConfigDtos.java` | `record` DTOs + `from(...)` static factories | new |
| `EDCAP_BE/.../web/rest/ScoreThresholdConfigController.java` | `GET`/`POST /api/v1/score-thresholds`, `requireAdmin` gate | new |
| `EDCAP_BE/src/test/.../ScoreThresholdConfigModelsTest.java` (+ service/adapter/controller test classes) | Coverage per ticket-rules.md Test Focus | new |
| `EDCAP_BE/.../application/usecase/quality/EvidenceQualityScoreModels.java` | Replace `ScoreBand` enum with config-driven lookup (lines 19-59) | modify |
| `EDCAP_BE/.../application/usecase/quality/EvidenceQualityScoreService.java` | Line 302 call site: `ScoreBand.fromScore(total).displayName()` → `scoreThresholdConfigService.lookupBand(total).label()` | modify |
| `EDCAP_BE/.../application/usecase/pmdashboard/PmDashboardService.java` | Lines 22-23/167-172: `VALID_SCORE_BANDS` → `scoreThresholdConfigService.getActiveCodes()` | modify |
| `EDCAP_BE/.../infrastructure/persistence/mapper/EvidenceQualityScoreMapper.java` | Lines 256-268 switch → config-driven `displayNameForCode`; drop dead import (line 9) | modify |
| `EDCAP_BE/src/test/.../EvidenceQualityScoreModelsTest.java` | Replace `score_band_thresholds_match_spec` (lines 16-28) with a config-driven equivalent | modify |
| `EDCAP_FE/src/lib/api.ts` | New `scoreThresholds: { list, save }` endpoint group, modeled on `organizations` (887-917) | modify |
| `EDCAP_FE/public/locales/en/locale.json` (+ `vi`, `ja`) | New `Pages.ThresholdConfig.*` block, modeled on `AdminAuditLog` (~1131) | modify |
| `EDCAP_FE/src/App.tsx` | New `admin/score-thresholds` route wrapped in `RequireAdmin` (pattern at lines 203-210) | modify |
| `EDCAP_FE/src/components/Layout.tsx` | New nav entry, `adminOnly: true` (pattern at lines 93-106) | modify |
| `EDCAP_FE/src/pages/threshold-config/ThresholdConfigPage.tsx` + `components/` (table, edit-row, progress bar, color picker) + `types.ts` + `utils.ts` | Net-new admin screen, View/Edit mode | new |
| `EDCAP_FE/src/__tests__/threshold-config/**` | FE test coverage per ticket-rules.md Test Focus | new |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `EDCAP_BE/.../application/usecase/scanner/ArtifactScannerService.java` (call sites at lines 446, 602, 700, 849, 987) | Calls `EvidenceQualityScoreService.recalculate*`, which now resolves bands via the new service instead of the enum | Low — method signatures unchanged, only internal band-lookup implementation changes downstream |
| `EDCAP_BE/.../application/usecase/pmdashboard/PmDashboardModels.java`, `EDCAP_BE/.../web/dto/PmDashboardDtos.java` | `scoreBand`/`averageScoreBand` fields | None — confirmed already plain `String` (lines 56/127 and 48/115 respectively); resolves OI-THRESHOLD-CONFIG-9 as "no widening needed" |
| `EDCAP_FE/src/pages/pm-dashboard/utils.ts` (`scoreBandClasses`) | Dead code, zero production consumers (only its own test file) | Low — no functional change required; may be left as-is or removed as a separate follow-up, not part of this ticket's scope |
| `EDCAP_FE/src/pages/pm-dashboard/components/SummaryCards.tsx` | Independently verified NOT to duplicate the 5-band palette (its `ACCENT_BAR_CLASS` is an unrelated 3-tone KPI accent map) | None — ruled out, documented to prevent re-investigation |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| `ArtifactScannerService.recalculateFromParser`/`recalculateFromSourceChange` | `EvidenceQualityScoreService.recalculate(...)` → `calculate(...)` → `ScoreBand.fromScore(total)` | Callee body changes to `scoreThresholdConfigService.lookupBand(total)`; caller unaffected |
| `PmDashboardService.normalize(...)` | `VALID_SCORE_BANDS.contains(normalizedScoreBand)` | Becomes `scoreThresholdConfigService.getActiveCodes().contains(normalizedScoreBand)` |
| `EvidenceQualityScoreMapper.scoreResultRowMapper` (line 118) | `toDisplayBand(String)` | Becomes `scoreThresholdConfigService.displayNameForCode(String)`; dead `ScoreBand` import removed |
| `ThresholdConfigPage.tsx` (new) | `endpoints.scoreThresholds.list()` / `.save(...)` (new, `lib/api.ts`) | New caller/callee pair, no existing code affected |
| `ScoreThresholdConfigController` (new) | `ScoreThresholdConfigService.list()`/`.save(...)` (new) | New; follows `AdminAuditLogController` → service shape |
| `ScoreThresholdConfigService` (new) | `ScoreThresholdConfigRepositoryPort` (new) → `ScoreThresholdConfigRepositoryAdapter` (new) | New hexagonal chain, mirrors `ArtifactScannerService` → `ArtifactScannerPersistencePort` → `DataOpsDashboardJdbcAdapter` |

## 5. FE Impact

Net-new Admin screen (`ThresholdConfigPage.tsx`) plus a new route (`App.tsx`) and nav entry
(`Layout.tsx`), following the `admin-audit-log`/`pages/user` folder shape.

**Correction to spec-pack §2.1.12/§11.7** (already flagged in `context.md`, re-verified this
session by an independent FE exploration pass): the spec-pack's claim that `scoreBandClasses` is
consumed by `PMDashboardPage`, `TicketDetailDrawer`, `ProjectPage`, `TraceabilityPage` is
**inaccurate**. Verified facts:
- `scoreBandClasses` (`pm-dashboard/utils.ts:5-11`) has **zero production consumers** — referenced
  only by its own test file (`src/__tests__/pm-dashboard/utils.test.ts`).
- Only `scoreBandLabel` (`utils.ts:59-61`, a plain `scoreBand ?? "-"` passthrough with no styling)
  is actually imported and used, and only in `TicketDetailDrawer.tsx:11,355`.
- `ProjectPage.tsx` and `TraceabilityPage.tsx` have no `scoreBand` references at all.
- A broader grep of `pm-dashboard/**` for hardcoded band-tied Tailwind classes (to catch
  copy-pasted duplicates that a `scoreBandClasses`-identifier grep would miss) found only
  `SummaryCards.tsx:6-12`'s `ACCENT_BAR_CLASS` — an unrelated 3-tone KPI accent map
  (blue/red/orange), not a duplicate of the 5-band EXCELLENT/GOOD/WARNING/RISKY/CRITICAL palette.

**Real FE blast radius of HD-THRESHOLD-CONFIG-1 is therefore just `TicketDetailDrawer.tsx`** — and
since `scoreBandLabel` already passes through whatever string it's given, no code change is
strictly required there; `scoreBand` values returned by the BE (already plain `String`, see §3)
will continue to render whatever `label`/`code` the admin configures, with zero FE changes needed
at that call site beyond what's already inline.

No color-picker or Progress/ProgressBar component exists anywhere in `EDCAP_FE/src/components/` —
both must be built new for AC-THRESHOLD-CONFIG-13/15.

## 6. BE Impact

New hexagonal slice added to `application/usecase/quality/` (co-located with
`EvidenceQualityScoreModels`/`EvidenceQualityScoreService` per `context.md` A-CTX-2):
`ScoreThresholdConfigModels` → `ScoreThresholdConfigService` → `ScoreThresholdConfigRepositoryPort`
→ `ScoreThresholdConfigRepositoryAdapter`, plus `ScoreThresholdConfigDtos` in `web/dto/` and
`ScoreThresholdConfigController` in `web/rest/` — mirroring the
`ArtifactScannerService`/`ArtifactScannerPersistencePort`/`DataOpsDashboardJdbcAdapter` shape
required by ticket-rules.md.

The `ScoreBand` Java enum is retired (per spec-pack §5 and ticket-rules.md's explicit prohibition
on extending it) and replaced by a `code`-string-keyed value object looked up against the active,
ordered config set. This is a compile-time-breaking change for the two other hardcoded copies
(`PmDashboardService.VALID_SCORE_BANDS`, `EvidenceQualityScoreMapper.toDisplayBand`), which must be
migrated in the same change (ticket-rules.md: "must be addressed together, not just one").

New in-memory cache inside `ScoreThresholdConfigService`, invalidated synchronously within the
same `save()` transaction, avoids a DB round-trip on the `EvidenceQualityScoreService.calculate()`
hot path (resolves OI-THRESHOLD-CONFIG-8 per this session's decision).

New audit-log integration: every create/update/soft-delete wrapped in try/catch calling
`adminAuditLogService.logCreate/logUpdate/logDelete/logCrudFailure`, matching
`CustomerService.java:111-117,160-165,186-191`.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `GET /api/v1/score-thresholds` | New — no request body, ADMIN-only | New — returns `[{ id, code, label, minScore, maxScore, color }]`, active rows only, no envelope | Yes — net new, no existing consumer |
| `POST /api/v1/score-thresholds` | New — `{ thresholds: [{ id?, code, label, minScore, maxScore, color }] }`, ADMIN-only | New — returns the resulting active list in the same shape as `GET` | Yes — net new, no existing consumer |

No existing `/api/v1/**` endpoint changes; this is purely additive. Internal BE refactor
(`ScoreBand` enum removal) is not itself an API contract change since `PmDashboardDtos` fields
were already `String`-typed.

## 8. DTO / Schema / Validation Impact

New `ScoreThresholdConfigDtos` records (`ScoreThresholdDto`, `SaveScoreThresholdsRequest`,
`SaveScoreThresholdsResponse` or equivalent), each a `record` + static `from(...)` factory per
`PmDashboardDtos.java:48,54` convention.

New server-side validation (mirroring required client-side validation per spec-pack §6.1):
- Full `[0,100]` coverage, no gaps, no overlaps (BR-005) — pure domain function, unit-testable
  without DB.
- `From <= To` per row (BR-006).
- `Label`/`Code` required, non-empty after trim (BR-007).
- `Code` uppercase, `[A-Z0-9_]`-style charset, no spaces/special characters (BR-008).
- `Code` uniqueness scoped to the resulting active set, excluding soft-deleted rows and checked
  within the payload itself before touching the DB (BR-008/009).
- **This session's decisions**: `minScore`/`maxScore` are `INTEGER`; save requires ≥1 active band
  (a single `0-100` row is valid); `color` validated against `^#[0-9A-Fa-f]{6}$`.
- No Code-editing restriction is implemented (BR-011 explicitly deferred per HD-THRESHOLD-CONFIG-2
  — must not be added).

## 9. DB / Migration Impact

New migration `V503__create_tbl_dim_score_threshold.sql` (next free slot, confirmed `V502` is
currently highest). Creates:

- `tbl_dim_score_threshold`: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
  `code VARCHAR NOT NULL`, `label VARCHAR NOT NULL`, `min_score INTEGER NOT NULL`,
  `max_score INTEGER NOT NULL`, `color VARCHAR NOT NULL`, `delete_flag` (matching existing
  precedent's type/values), `version BIGINT NOT NULL DEFAULT 0`,
  `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- Partial unique index `ux_tbl_dim_score_threshold_code_active ON tbl_dim_score_threshold (code)
  WHERE delete_flag = '0'`, directly modeled on `V110`'s
  `ux_tbl_dim_customer_alias_active ... WHERE deleted_at IS NULL` (adapted for this table's
  `delete_flag` convention rather than `deleted_at`).
- Seed data for the 5 default bands (Excellent 90-100 / Good 75-89 / Warning 60-74 / Risky 40-59 /
  Critical 0-39 — matching `EvidenceQualityScoreModelsTest`'s existing boundary contract), in the
  same migration or a companion seed migration.

No existing table or migration is altered.

## 10. Batch / Job / Event Impact

None. Confirmed by `context.md`: no batch/cron job exists or is introduced by this ticket. The
sole runtime consumer, `EvidenceQualityScoreService.calculate()`, is invoked synchronously from
`ArtifactScannerService`, not from a scheduled job.

## 11. Test Impact

- BE unit tests: gap/overlap/`From<=To`/duplicate-Code/format validation as pure functions (no
  DB), replacing `EvidenceQualityScoreModelsTest.score_band_thresholds_match_spec`.
- BE service tests (mock the persistence port): soft-delete/update/insert batch orchestration
  atomicity, cache invalidation on save, audit-log call verification.
- BE `@WebMvcTest`: `requireAdmin` 403 on both `GET`/`POST` for non-ADMIN callers; 400 on
  validation failure; 409 on optimistic-lock conflict.
- BE integration test: partial unique index actually rejects duplicate active `Code` at the DB
  layer; soft-deleted rows don't collide (AC-10).
- BE integration test: renaming/recoloring a band via the admin screen changes what
  `EvidenceQualityScoreService`/PM-dashboard consumers return without redeploy (AC-17).
- ArchUnit `ArchitectureTest` must stay green with the new controller/service/port/adapter/DTO
  classes in their correct hexagonal layers.
- FE hook/component tests: View/Edit mode toggle, zero-network-call Cancel (AC-3), Add-band row
  insertion (AC-4), realtime progress-bar recoloring (AC-13), i18n review for no hardcoded literal
  strings (AC-14), color picker round-trip (AC-15).
- E2E (Playwright) happy-path view→edit→save cycle, once auth/test-user strategy is confirmed
  available for this screen.

## 12. Operation / Monitoring Impact

New audit-log entries for every create/update/soft-delete on threshold rows
(`adminAuditLogService.logCreate/logUpdate/logDelete/logCrudFailure`). Cache-invalidation events
logged at INFO/DEBUG with no PII/stack traces, per `error-handling.md`/`security.md`. No CI or
settings changes are part of this ticket.

## 13. Rollout / Rollback Impact

The migration itself is purely additive (new table + index + seed data only) — no existing table
is altered, so the migration alone is safely revertible by dropping the new table.

However, **BE code and migration must ship together in one atomic deploy**, not incrementally:
once `ScoreBand.fromScore()` is removed and its 3 call sites are rewired to
`ScoreThresholdConfigService`, the code will not compile/run correctly without the new table and
seed data present. Rollback of a bad deploy must revert both the code and the migration as a single
unit — a code-only or migration-only partial rollback would leave the system in a broken state
(either compile failure or a runtime NPE/empty-lookup on the hot path).

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| `PmDashboardModels`/`PmDashboardDtos` `scoreBand` typing | No FE/DTO widening needed | Confirmed plain `String` at `PmDashboardModels.java:56,127` and `PmDashboardDtos.java:48,115` — resolves OI-THRESHOLD-CONFIG-9 |
| `ArtifactScannerService` call sites (lines 446, 602, 700, 849, 987) | Unaffected beyond downstream behavior | `recalculate*` method signatures are unchanged; only `EvidenceQualityScoreService`'s internal band-lookup implementation changes |
| Any batch/cron job | None exists, none introduced | Confirmed in `context.md` — "No batch/cron job exists or is introduced by this ticket" |
| `SecurityConfig.java` `permitAll` list | No new entry needed | New endpoints inherit the default "authenticated session required" rule automatically per `context.md` §13.4; role-gating is feature-specific `requireAdmin` code, not filter-chain config |
| `ProjectPage.tsx`, `TraceabilityPage.tsx` | No `scoreBand` references, unaffected | Verified via grep — spec-pack's original consumer claim was inaccurate (see §5) |
| `EDCAP_FE/src/store/uiStore.ts` | No change needed | Fetched threshold rows go through TanStack Query only, per the store's own doc comment (lines 4-11); Edit-Mode toggle uses local/Zustand UI state, not this rule |

## 15. Required Options

- DB Migration (new table `tbl_dim_score_threshold`, partial unique index, seed data)
- Source Analysis (enum-to-value-object refactor across 3 hardcoded copies)
- FE-BE Contract review — recommended (Pack-26-style deep dive on the non-standard `POST`
  batch-upsert shape) but not mandatory per spec-pack §16

## 16. Human Decision Required

None new. All 6 Human Decisions from Phase 1 are Closed or explicitly Deferred
(HD-THRESHOLD-CONFIG-2). The 4 remaining Open Issues (OI-1/2/3/7/8) were resolved as Phase 3
implementation decisions this session (2026-07-21) — see `source-availability.md` for the record.
OI-THRESHOLD-CONFIG-9 (FE/DTO widening) is resolved by §3/§14 above: no widening needed.

## 17. Risk Summary

1. **Primary risk — enum-to-config refactor blast radius**: three hardcoded copies
   (`ScoreBand` enum, `VALID_SCORE_BANDS`, `toDisplayBand`) must be fixed together in one change;
   leaving any one stale defeats HD-THRESHOLD-CONFIG-1 and reintroduces a second source of truth.
2. **Atomic-deploy constraint**: migration and BE code changes cannot ship independently (§13) —
   requires careful release coordination, not a simple "run migration, deploy later" sequence.
3. **Contract-shape risk**: the `POST` batch-upsert (soft-delete+update+insert-in-one-call) has no
   direct precedent in this repo (`organizations` group is single-resource CRUD) — mitigated by
   following `CustomerService`'s per-operation atomicity pattern inside one `@Transactional`
   method, but the exact request/response shape should still get a lightweight review before wide
   FE/BE parallel implementation.
4. **Low residual risk**: FE blast radius is smaller than the spec-pack originally assumed (1 file,
   not 4) — reduces effort/risk versus the original estimate, not an increase.
