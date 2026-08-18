# Test Plan

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-22

## 1. Purpose

Verify THRESHOLD-CONFIG's CRUD screen and the ScoreBand-consumption rewiring (HD-THRESHOLD-CONFIG-1)
meet all Acceptance Criteria in `spec-pack.md` §7 without regressing existing consumers
(`EvidenceQualityScoreService`, `PmDashboardService`, PM-dashboard FE pages).

## 2. AC Matrix ↔ Test Type
| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-1 | | | X | | | X | X |
| AC-2 | X | | | | | | X |
| AC-3 | X | | | | | | X |
| AC-4 | X | | | | | | X |
| AC-5 | | | X | | X | | X |
| AC-6 | | X | X | | | | X |
| AC-7 | | X | X | | | | X |
| AC-8 | | X | X | | | | X |
| AC-9 | | X | X | | | | X |
| AC-10 | | X | | | X | | X |
| AC-11 | | | X | | X | X | X |
| AC-12 | | | X | | | | X |
| AC-13 | X | | | | | | X |
| AC-14 | X | | | | | | X |
| AC-15 | X | | X | | | | X |
| AC-16 | X | | | | | | X |
| AC-17 | | X | X | | | X | X |
| AC-18 | | X | | | | | X |

## 3. Priority
| test item | priority | reason |
|---|---|---|
| Gap/overlap/duplicate-Code validation | P0 | Blocker-severity per review-checklist §1 |
| Atomic transaction (AC-11) | P0 | Data integrity |
| ADMIN-only gating (AC-12) | P0 | Security |
| ScoreBand rewiring (AC-17, AC-18) | P0 | Primary complexity driver, HD-THRESHOLD-CONFIG-1 |
| Optimistic locking conflict | P1 | Concurrent-edit correctness |
| FE realtime progress bar / i18n | P2 | UX polish, lower risk |

## 4. Reuse Existing Test

**Updated 2026-07-22, post-implementation**: `EvidenceQualityScoreModelsTest` (the stale test
originally listed here) was deleted in Phase 5, not revised — it covered the now-removed `ScoreBand`
enum directly and has no config-driven equivalent to "reuse"; its coverage is superseded by
`ScoreThresholdConfigModelsTest`. The actual reused/updated existing tests are the four downstream
consumer tests, each updated in Phase 5 to construct/mock `ScoreThresholdConfigService` instead of
the old enum:

| existing test | path | covers | gap |
|---|---|---|---|
| `EvidenceQualityScoreServiceTest` | `EDCAP_BE/src/test/java/.../quality/EvidenceQualityScoreServiceTest.java` | Score calculation still resolves the correct band label after the rewire | None — updated in Phase 5, real `ScoreThresholdConfigService` backed by seeded default bands |
| `PmDashboardServiceTest` | `EDCAP_BE/src/test/UnitTest/.../pmdashboard/PmDashboardServiceTest.java` | `VALID_SCORE_BANDS` filter behavior via `getActiveCodes()` | None — updated in Phase 5, mocked `ScoreThresholdConfigService` |
| `EvidenceQualityScoreMapperContractTest` | `EDCAP_BE/src/test/.../quality/EvidenceQualityScoreMapperContractTest.java` | `toDisplayBand` → `displayNameForCode` rewire | None — updated in Phase 5, mocked `ScoreThresholdConfigService` |
| `EvidenceQualityScoreRepositoryAdapterTest` | `EDCAP_BE/src/test/.../persistence/adapter/EvidenceQualityScoreRepositoryAdapterTest.java` | Adapter still wires the mapper correctly with the new service dependency | None — updated in Phase 5, mocked `ScoreThresholdConfigService` |

No existing FE tests were found for `pm-dashboard` or any `threshold-config` area prior to Phase 5
(confirmed at Phase 1). This remains accurate — the FE tests listed in §5 below are all net-new.

## 5. Additional Test This Time

**Status column added 2026-07-22** against what actually exists in the repo (verified via Explore
agent passes over BE `src/test` and FE `src/__ tests __`):

| test | type | target | related AC | status |
|---|---|---|---|---|
| Gap/overlap/duplicate-Code/uppercase-Code validation | BE unit | `ScoreThresholdConfigModelsTest` (16 cases) | AC-6,7,8,9 | Done (Phase 5) |
| Batch soft-delete/update/insert orchestration | BE service (mocked port) | `ScoreThresholdConfigServiceTest` (7 cases) | AC-5,11 | Done (Phase 5) |
| Role-gating 403 | BE controller test | `ScoreThresholdConfigControllerTest` (6 cases) | AC-12 | Done (Phase 5) |
| Partial unique index rejection | BE integration (real Postgres) | — | AC-8,10 | **Not done** — investigated 2026-07-22: no Testcontainers convention exists in this repo yet (every existing `*IntegrationTest.java` is a file-content assertion test, not a real-DB test), and the Docker daemon is not running in this environment, so a Testcontainers-backed test could not be authored *and verified* this session. Intentionally deferred, see §6 |
| Optimistic-locking conflict → 409 | BE service/controller test | `ScoreThresholdConfigServiceTest.save_throwsConflictOnZeroRowsAffected`, `ScoreThresholdConfigControllerTest.save_returnsConflictOnOptimisticLockFailure` | — | Done (Phase 5) |
| Config-driven band lookup | BE unit | `ScoreThresholdConfigModelsTest.lookupBand_returnsExactlyOneMatchingBand`, `ScoreThresholdConfigServiceTest.lookupBand_usesCacheAfterFirstAccessWithoutDbRoundTrip` | AC-17,18 | Done (Phase 5) |
| Rewiring reflected without redeploy | BE+FE integration | Unit-level only — all 3 consumers delegate to `ScoreThresholdConfigService`, no live save→reread test | AC-17 | Unit-level only — no live-DB integration test (same DB constraint as above) |
| List/save TanStack Query hooks | FE component (via page) | `ThresholdConfigPage.test.tsx` | AC-1,11 | Done (Phase 5); the stale `antd` mock (missing `Tooltip` export, causing 4/5 cases to fail) was fixed 2026-07-22 — all 5 cases now pass, see `test-results.md` §11 |
| View/Edit toggle, Cancel zero-network-calls, Add-band | FE component | `ThresholdConfigPage.test.tsx` | AC-2,3,4 | Same file — now fully green, see above |
| Color picker round-trip | FE component | `ColorPicker.test.tsx` (5 cases) | AC-15 | **Done this phase (2026-07-22)** |
| Progress bar recolor | FE component | `ScoreRangeProgressBar.test.tsx` (4 cases) | AC-13 | **Done this phase (2026-07-22)** |
| i18n literal-string review | FE review | Manual review of `ThresholdConfigPage.tsx`/`components/*` | AC-14 | Done (Phase 5, manual review only, no automated lint test) |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| Full view→edit→save cycle | Admin logged in, 5 seed bands exist | Open screen → Edit → change a Label/Color → Save | Change persisted and visible in View Mode | AC-1,2,15,17 |

## 6. Areas intentionally left untested this time
| area | reason | risk |
|---|---|---|
| Decimal score support | OI-THRESHOLD-CONFIG-1 open — integer-only assumed | Low if resolved before Phase 3 |
| >20 band performance | Spec-pack §6.6: not a high-volume table | Low |
| BE adapter/integration test against a real Postgres instance for the partial unique index (AC-10) | Confirmed 2026-07-22: no other test in this repo uses the declared-but-unused Testcontainers dependency (every existing `*IntegrationTest.java` reads migration/mapper files as text, none opens a JDBC connection), and the Docker daemon is not running in this environment, so a Testcontainers-based test could not be run/verified even if authored. Establishing this convention is a repo-wide decision, out of this ticket's scope to force through unverified | Medium — AC-10 stays verified at the unit level (`ScoreThresholdConfigModelsTest` active-set validation) plus migration-SQL code review only |
| Playwright E2E execution | Requires starting a dev server/browser — an execution action, not a code-authoring one; the spec is already authored (Phase 5) | Medium — flows are covered by `ThresholdConfigPage.test.tsx`'s Vitest/RTL equivalents instead (4/5 of which are currently failing on an unrelated stale mock, see `test-results.md`) |
| ArchUnit `ArchitectureTest` | The file does not exist anywhere in this repo (confirmed 2026-07-22) — a pre-existing, repo-wide gap unrelated to this ticket; multiple ticket docs claim it "stays green," which is aspirational, not actual, today | Low for this ticket specifically; flagged as a repo-wide follow-up, not a THRESHOLD-CONFIG action item |

## 7. Data testing principles

Use the 5 seed default bands (Excellent/Good/Warning/Risky/Critical) as the baseline fixture; no
production data. See `test-data.md`.

**Test data policy (added 2026-07-22):**
- Baseline fixture: the 5 seed bands defined in `V504__create_tbl_dim_score_threshold.sql`
  (CRITICAL 0-39, RISKY 40-59, WARNING 60-74, GOOD 75-89, EXCELLENT 90-100) are reused verbatim
  across BE unit/service/controller tests and FE `utils.test.ts`/`ThresholdConfigPage.test.tsx`
  fixtures wherever the seed set already fits the scenario — no ad-hoc per-test band literals for
  cases the seed data already covers.
- No production or PII data is used anywhere in this test suite — pure synthetic config data only,
  consistent with `impact-analysis.md §13.2` ("no secrets, PII, or credentials involved").
- Mutation-payload test cases always pair a boundary-valid case (adjacent bands touching at a
  boundary, a single band covering the full `0-100` range) with a boundary-invalid case
  (gap/overlap) per `spec-pack.md` §8.3 — never only the "one happy path" case per validator.

## 8. Execution command
| command | purpose |
|---|---|
| `mvn clean verify` (in `EDCAP_BE/`) | Run BE unit/integration tests (no `ArchitectureTest` exists in this repo — see §6) |
| `npx vitest run` (in `EDCAP_FE/`) | Run FE Vitest suite (`npm run test` script does not exist in this repo per `self-review.md` §4) |
| `npx tsc --noEmit` (in `EDCAP_FE/`) | FE type-check (no `typecheck` npm script exists in this repo) |

## 9. Stop Condition

If the partial unique index (AC-8/10) fails to reject a duplicate active Code at the DB layer,
stop — this is a Blocker per `review-checklist.md`.

## 10. Required Human Decision

None outstanding for test strategy — all 6 Phase 1 Human Decisions are Closed/Deferred.
