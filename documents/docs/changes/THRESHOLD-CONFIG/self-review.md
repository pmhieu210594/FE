# Self Review

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-22

## 1. Implementation Summary

Implemented Option B from `impl-plan.md` §2/§3 in full: `tbl_dim_score_threshold` is the new
single source of truth for score-band configuration, replacing the hardcoded `ScoreBand` enum and
its two other duplicate copies. Followed all 13 steps of `impl-plan.md` §9 in order:

- **BE**: new `ScoreThresholdConfigModels` (record + pure validators), `ScoreThresholdConfigService`
  (list/save/lookupBand/getActiveCodes/displayNameForCode, in-memory cache invalidated on save,
  `requireAdmin`, audit-log wrapping), `ScoreThresholdConfigRepositoryPort` +
  `ScoreThresholdConfigRepositoryAdapter` (`NamedParameterJdbcTemplate`), `ScoreThresholdConfigDtos`,
  `ScoreThresholdConfigController` (`GET`/`POST /api/v1/score-thresholds`).
- **BE rewire**: `EvidenceQualityScoreModels.ScoreBand` enum removed entirely;
  `EvidenceQualityScoreService` line ~302 now calls
  `scoreThresholdConfigService.lookupBand(total).label()`; `PmDashboardService.VALID_SCORE_BANDS`
  replaced by `scoreThresholdConfigService.getActiveCodes()`;
  `EvidenceQualityScoreMapper.toDisplayBand` switch removed, `scoreResultRowMapper` now takes the
  service and calls `displayNameForCode(...)`.
- **FE**: net-new `pages/threshold-config/` (`ThresholdConfigPage.tsx` +
  `components/{ThresholdTable,ColorPicker,ScoreRangeProgressBar}.tsx` + `types.ts` + `utils.ts`),
  new `endpoints.scoreThresholds` group in `lib/api.ts`, new `admin/score-thresholds` route
  (`App.tsx`) and nav entry (`Layout.tsx`), new `Pages.ThresholdConfig.*` / `Layout.scoreThresholds`
  i18n keys in `en`/`vi`/`ja`.

**Deviation from `impl-plan.md`**: migration file is `V504__create_tbl_dim_score_threshold.sql`,
not `V503` as the plan assumed — `V503` was already taken by
`V503__artifact_snapshot_schema_version_numeric.sql`, merged after `impl-plan.md` was authored.
Flagged and corrected before implementation began (see the approved Phase-5 plan). No other
deviation.

**Not implemented (by design, per ticket-rules.md "Must Not Do")**: Code-editing restriction
(BR-011, deferred), undelete/hard-delete, Operations Manager access, `@PreAuthorize` usage.

**Not run in this session**: the migration was written but **not applied** (no `mvn flyway:migrate`
run, per `00-safety.md §3` and the plan's stop condition — requires explicit user confirmation).
Consequently, no test in this session hit a real Postgres instance; the partial-unique-index
DB-level rejection (AC-10) and the live save→reread integration behavior (AC-17) are verified by
unit/mock tests and code inspection only, not a running database. The authored Playwright E2E spec
(`e2e_tests/tests/threshold-config/threshold-config.spec.ts`) was also not executed (no dev server
was started this session) — it follows the same mock-route pattern as the merged
`admin-audit-log.spec.ts` and should run as-is in CI/manual verification.

## 2. Specification/AC Matching
| AC ID | status | evidence |
|---|---|---|
| AC-THRESHOLD-CONFIG-1 | PASS | `ScoreThresholdConfigControllerTest.list_returnsActiveBands`; `ScoreThresholdConfigRepositoryAdapter.findActiveOrderedByMinScore` (`WHERE delete_flag='0'`) |
| AC-THRESHOLD-CONFIG-2 | PASS | `ThresholdConfigPage.test.tsx` — "Edit click switches to Edit Mode with Save/Cancel/Add-band controls" |
| AC-THRESHOLD-CONFIG-3 | PASS | `ThresholdConfigPage.test.tsx` — "Cancel reverts to View Mode and makes zero network calls" (asserts `save`/`list` call counts) |
| AC-THRESHOLD-CONFIG-4 | PASS | `ThresholdConfigPage.test.tsx` — "Add band inserts a new row with no id, editable inline" |
| AC-THRESHOLD-CONFIG-5 | PASS (unit-level) | `ScoreThresholdConfigServiceTest.save_insertsUpdatesAndSoftDeletesInOneBatch` (verifies `repository.softDelete` called); `ScoreThresholdConfigRepositoryAdapter.softDelete` sets `delete_flag='1'`, `updated_at`, never `DELETE FROM`. DB-level not exercised (no live Postgres this session) |
| AC-THRESHOLD-CONFIG-6 | PASS | `ScoreThresholdConfigModelsTest.validateActiveSet_rejectsGap`; `ScoreThresholdConfigControllerTest.save_rejectsInvalidPayloadWith400` (400 `DOMAIN_RULE_VIOLATION`) |
| AC-THRESHOLD-CONFIG-7 | PASS | `ScoreThresholdConfigModelsTest.validateActiveSet_rejectsOverlap` |
| AC-THRESHOLD-CONFIG-8 | PASS | `ScoreThresholdConfigModelsTest.validateActiveSet_rejectsDuplicateCodeWithinPayload` |
| AC-THRESHOLD-CONFIG-9 | PASS | `ScoreThresholdConfigModelsTest.validateRow_rejectsLowercaseCode` / `validateRow_rejectsCodeWithSpacesOrSpecialChars` |
| AC-THRESHOLD-CONFIG-10 | PASS (by design, DB not exercised) | Partial unique index `ux_tbl_dim_score_threshold_code_active ... WHERE delete_flag='0'` (V504 migration) scopes uniqueness to active rows only; app-level `validateActiveSet` only checks the payload's own resulting active set, never soft-deleted history |
| AC-THRESHOLD-CONFIG-11 | PASS | `ScoreThresholdConfigService.save()` is a single `@Transactional` method covering soft-delete+update+insert; `ScoreThresholdConfigServiceTest.save_insertsUpdatesAndSoftDeletesInOneBatch` |
| AC-THRESHOLD-CONFIG-12 | PASS | `ScoreThresholdConfigControllerTest.list_rejectsNonAdminWith403` / `save_rejectsNonAdminWith403`; `ScoreThresholdConfigServiceTest.list_rejectsNonAdmin` / `save_rejectsNonAdmin` |
| AC-THRESHOLD-CONFIG-13 | PASS (light coverage) | `ScoreRangeProgressBar` renders segments derived purely from in-progress edit rows (`toProgressSegments`); no dedicated recolor-on-edit assertion written — visual/manual check recommended |
| AC-THRESHOLD-CONFIG-14 | PASS (manual review) | All page/component text goes through `t("Pages.ThresholdConfig...")`; no automated "no hardcoded string" lint test written for this page |
| AC-THRESHOLD-CONFIG-15 | PASS (unit-level) | `ColorPicker` component + BE `^#[0-9A-Fa-f]{6}$` validation (`ScoreThresholdConfigModelsTest.validateRow_rejectsInvalidColor`); no live save→reread round-trip run |
| AC-THRESHOLD-CONFIG-16 | PASS | `ThresholdConfigPage.test.tsx` — "renders active bands in View Mode with Actions column hidden" |
| AC-THRESHOLD-CONFIG-17 | PASS (unit-level) | `EvidenceQualityScoreService`/`PmDashboardService`/`EvidenceQualityScoreMapper` all now delegate to `ScoreThresholdConfigService`; full BE suite (`mvn clean verify`) green after rewire. No live DB integration test confirming a save is reflected without redeploy |
| AC-THRESHOLD-CONFIG-18 | PASS | `ScoreThresholdConfigModelsTest.lookupBand_returnsExactlyOneMatchingBand`; `ScoreThresholdConfigServiceTest.lookupBand_usesCacheAfterFirstAccessWithoutDbRoundTrip` |

## 3. List of Changed Files
| file | summary | reason |
|---|---|---|
| `V504__create_tbl_dim_score_threshold.sql` | New table + partial unique index + seed data (renamed from planned V503 — collision) | Persistence for config |
| `ScoreThresholdConfigModels.java` | `ScoreThreshold`/`UpsertScoreThreshold` records + pure gap/overlap/coverage/format validators + `lookupBand` | Domain logic, DB-free unit testable |
| `ScoreThresholdConfigModelsTest.java` | Unit tests for all validators + lookup boundaries | New |
| `ScoreThresholdConfigService.java` | list/save/lookupBand/getActiveCodes/displayNameForCode + in-memory cache + requireAdmin + audit-log | Application orchestration, atomicity, caching |
| `ScoreThresholdConfigServiceTest.java` | Mocked-port service tests incl. batch atomicity, conflict, cache | New |
| `ScoreThresholdConfigRepositoryPort.java` | Port interface | Hexagonal boundary |
| `ScoreThresholdConfigRepositoryAdapter.java` | `NamedParameterJdbcTemplate` implementation | Persistence adapter |
| `ScoreThresholdConfigDtos.java` | `record` DTOs + `toModel()`/`from(...)` | Web-layer shape |
| `ScoreThresholdConfigController.java` | `GET`/`POST /api/v1/score-thresholds` | Web entry |
| `ScoreThresholdConfigControllerTest.java` | Standalone MockMvc tests: 200/403/400/409 | New |
| `EvidenceQualityScoreModels.java` | `ScoreBand` enum removed | Retire enum per spec-pack §5 |
| `EvidenceQualityScoreService.java` | Constructor + call site rewired to `scoreThresholdConfigService.lookupBand(total).label()` | Sole production call site |
| `EvidenceQualityScoreServiceTest.java` | Constructor updated with a real `ScoreThresholdConfigService` backed by seeded default bands | Keep passing |
| `PmDashboardService.java` | `VALID_SCORE_BANDS` → `scoreThresholdConfigService.getActiveCodes()` | Retire hardcoded copy #2 |
| `PmDashboardServiceTest.java` | Constructor + mock updated | Keep passing |
| `EvidenceQualityScoreMapper.java` | `toDisplayBand` removed; `scoreResultRowMapper` takes `ScoreThresholdConfigService` | Retire hardcoded copy #3 |
| `EvidenceQualityScoreMapperContractTest.java` | Updated to stub `displayNameForCode` | Keep passing |
| `EvidenceQualityScoreRepositoryAdapter.java` | Injects and forwards `ScoreThresholdConfigService` to the mapper | Wiring |
| `EvidenceQualityScoreRepositoryAdapterTest.java` | Constructor updated | Keep passing |
| `EvidenceQualityScoreModelsTest.java` | Deleted (covered `ScoreBand`, now removed; superseded by `ScoreThresholdConfigModelsTest`) | Test currency |
| `lib/api.ts` | New `scoreThresholds: { list, save }` group | FE API access |
| `locale.json` (en/vi/ja) | New `Pages.ThresholdConfig.*` block + `Layout.scoreThresholds` | i18n |
| `App.tsx` | New `admin/score-thresholds` route, `RequireAdmin`-wrapped | Admin-only routing |
| `Layout.tsx` | New nav entry, `adminOnly: true` | Discoverability |
| `pages/threshold-config/ThresholdConfigPage.tsx` + `components/{ThresholdTable,ColorPicker,ScoreRangeProgressBar}.tsx` + `types.ts` + `utils.ts` | Full View/Edit-mode screen | Primary FE deliverable |
| `__tests__/threshold-config/{utils,ThresholdConfigPage}.test.tsx` | FE unit + component tests | New |
| `e2e_tests/tests/threshold-config/threshold-config.spec.ts` | Playwright happy-path + Cancel-zero-network test | New, not executed this session |

## 4. Run Command and Results
| command | result | note |
|---|---|---|
| `mvn clean verify` (in `EDCAP_BE/`) | PASS (exit 0) | Includes ArchUnit `ArchitectureTest`; full suite, no failures |
| `npx tsc --noEmit` (in `EDCAP_FE/`) | PASS | No `typecheck` npm script exists in this repo; used `tsc --noEmit` directly |
| `npm run build` (in `EDCAP_FE/`) | PASS | `tsc && vite build`; only a pre-existing chunk-size warning, unrelated to this change |
| `npx vitest run` (in `EDCAP_FE/`) | PASS | 43 test files / 284 tests, all green |
| `npx playwright test threshold-config` | NOT RUN | Authored but not executed this session — no dev server/browser run; recommend running before merge |
| `mvn flyway:migrate` | NOT RUN | Per `00-safety.md §3`, requires explicit user confirmation before executing against any DB |

## 5. Self-Check using Review Checklist
| checklist area | result | note |
|---|---|---|
| 2. General System Review | PASS | Integer scores, trim rules, no magic numbers (constants in `ScoreThresholdConfigModels`) — see §9 for open scope items (decimal scores, i18n mojibake) not applicable here |
| 3. FE Review | PASS | Zustand not used for fetched rows (TanStack Query only); all calls via `lib/api.ts`; Cancel is zero-network (tested); `forwardRef`+`displayName` on all 3 new components; no `any` |
| 4. BE/API Review | PASS | `requireAdmin` in service (both endpoints); server-side re-validation independent of FE; single `@Transactional` in `save()`; DTOs are `record`+factory; constructor injection only; `@Transactional` only on service |
| 5. DB/Migration Review | PASS (not applied) | `V504` next-free; partial unique index; `version BIGINT DEFAULT 0`; seed data matches existing 90/75/60/40 boundaries; purely additive |
| 6. Security/Privacy Review | PASS | 403 enforced server-side in `ScoreThresholdConfigService.requireAdmin`; no `@PreAuthorize` relied upon; no PII; no new `permitAll` entry |
| 7. Operation/Maintenance Review | PASS | Stale `EvidenceQualityScoreModelsTest` replaced (deleted, superseded); cache + save-triggered invalidation implemented in `ScoreThresholdConfigService`; audit-log calls wired for create/update/delete/failure |
| 8. Test Review | PASS (DB-adapter/integration tests not run against live Postgres) | Pure-function, service-mock, and `@WebMvcTest`-equivalent standalone MockMvc tests all present and green; no test hit a real DB this session |
| 9. Documentation/Traceability Review | PASS | This file + `review-checklist.md` updated; `context.md`'s FE-blast-radius correction respected (no changes made to `pm-dashboard/utils.ts`, `ProjectPage.tsx`, `TraceabilityPage.tsx`) |
| 10. Release/Rollback Review | PASS (documented, not executed) | Migration is additive-only; rollback-as-single-unit constraint restated here and in `impl-plan.md` §8 |

## 6. Test Plan Corresponding Status

All 13 `impl-plan.md` §9 steps completed. Verification methods matched what was specified per step
(unit / service-mock / standalone-MockMvc / component / hook-equivalent), **except**: step 3's
"adapter test against local Docker Postgres" and step 13's "E2E... if auth/test-user strategy
available" were both authored to the same standard as existing precedent but **not executed**
against a running database or browser in this session (no Docker Postgres instance was started; no
Playwright browser run). Everything else matches its stated verification exactly.

## 7. Bugs Found and Resolved
| bug | cause | fix | test |
|---|---|---|---|
| Migration slot collision | `impl-plan.md`/`impact-analysis.md` assumed `V503` was free; `V503__artifact_snapshot_schema_version_numeric.sql` was merged after those docs were authored | Renamed to `V504__create_tbl_dim_score_threshold.sql` before writing any code | N/A — caught by `ls` of the migration directory before Step 1 |
| `EvidenceQualityScoreMapperContractTest` / `EvidenceQualityScoreRepositoryAdapterTest` / `EvidenceQualityScoreServiceTest` / `PmDashboardServiceTest` compile failures | These pre-existing tests constructed the rewired classes with the old (pre-`ScoreThresholdConfigService`) constructor signatures | Updated each test's setup to inject a `ScoreThresholdConfigService` (real instance backed by seeded default bands for `EvidenceQualityScoreServiceTest`; mocks elsewhere) | `mvn clean verify` — full suite green |

## 8. Unprocessed / Pending / Accepted Risk

| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| Migration not applied | Per `00-safety.md §3`, DB-affecting commands require explicit user confirmation; not requested this session | `tbl_dim_score_threshold` does not exist in any running DB yet — BE code will fail at runtime against a real DB until applied | User / next session | Before deploy |
| Adapter test against live Postgres (impl-plan.md step 3) not run | No local Docker Postgres instance started this session | Partial unique index behavior (AC-10) and JDBC SQL correctness verified by code review only, not executed | BE owner | Before merge |
| Playwright E2E spec not executed | No dev server/browser run this session | View→edit→save and Cancel-zero-network flows verified by Vitest component tests only, not a real browser | FE owner | Before merge |
| Realtime progress-bar recolor (AC-13) has no dedicated assertion | Component test coverage focused on mode toggle/Cancel/Add-band/gap-validation; progress bar rendering verified structurally via `utils.test.ts`'s `toProgressSegments`-adjacent coverage only | Low — logic is a pure function of already-tested `validateActiveRows` inputs | FE owner | Optional follow-up |
| OI-THRESHOLD-CONFIG-8 (cache strategy) | Resolved this session as in-memory cache + save-triggered invalidation, implemented in `ScoreThresholdConfigService` | None — implemented, not open | BE owner / Tech Lead | Closed |

## 9. AI-generated predictions

- `lookupBand`'s defensive fallback for an unexpected coverage gap at lookup time
  (BR-THRESHOLD-CONFIG-014) was implemented as "clamp to the nearest band below the score" rather
  than throwing or returning an "unclassified" sentinel — spec-pack left this as a Phase 3
  implementation detail (OI-THRESHOLD-CONFIG-8 note); this choice was not re-confirmed with the
  human owner.
- Used `BusinessRuleException` (existing `DomainException` subtype) for all BR violations rather
  than introducing a new subtype — matches `GlobalExceptionHandler`'s existing 400 mapping without
  new handler code, but the exact exception class was an implementation choice, not spec-mandated.
- `color` validation regex `^#[0-9A-Fa-f]{6}$` (6-digit hex only, no 3-digit shorthand, no alpha)
  was this session's OI-7 resolution, carried through to both BE and FE validation.
- FE "delete" in Edit Mode was implemented as a local pending-status toggle (row stays visible,
  grayed, with a Status badge and an Undo action) rather than immediately removing the row from the
  list — chosen to satisfy AC-16's "Actions column shows a delete control" together with BR-004's
  zero-network Cancel semantics; the exact UX (toggle-with-undo vs. immediate removal) was not
  explicitly specified in spec-pack.

## 10. Items reviewed by humans

**Confirmed by the human owner, 2026-07-22 — all 4 approved as implemented:**
1. The `lookupBand` defensive-fallback behavior described in §9 (nearest-band clamping). Approved.
2. That applying `V504` and deploying the rewired BE code together, as a single atomic unit, is
   scheduled correctly (impact-analysis.md §13). Approved — sequencing itself remains a pending
   execution action (migration not yet applied to any DB), but the plan/sequencing is confirmed
   correct.
3. The FE "toggle-to-DELETE-with-Undo" interaction for row removal in Edit Mode, as an
   implementation choice not explicit in spec-pack. Approved.
4. OI-1/2/3/7/8 resolutions (INTEGER scores, ≥1 active band, single-band 0-100 valid, 6-digit hex
   color, in-memory cache) confirmed to match the human owner's expectations.

## 11. Final Self-Verdict

**NEEDS_UPDATE** (not BLOCKED) — all code compiles, all authored tests pass, `mvn clean verify` and
`npm run build` are both green. Held back from PASS only because: (1) the migration has not been
applied to any database, (2) no test in this session exercised a live Postgres instance, and
(3) the Playwright E2E spec was authored but not executed. None of these are code defects — they are
verification steps that require an explicit follow-up action (running the migration, starting a
local DB, running Playwright) before this ticket can be marked fully verified and handed to human
review.
