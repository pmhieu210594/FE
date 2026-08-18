# Test Results

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-22

## 1. Execution Environment

| item | value |
|---|---|
| OS | Windows 10 (Git Bash) |
| BE | Java 21, Maven, Spring Boot 3.4.1 |
| FE | Node/npm, Vitest 3.2.6, Vite 6 |
| DB | None — no Postgres instance started this session; `V504` migration not applied |

## 2. Executed Command

| command | result | log/evidence | note |
|---|---|---|---|
| `npx vitest run "src/__ tests __/threshold-config/ColorPicker.test.tsx"` (in `EDCAP_FE/`) | PASS — 5/5 | Terminal output this session | New file authored this phase |
| `npx vitest run "src/__ tests __/threshold-config/ScoreRangeProgressBar.test.tsx"` (in `EDCAP_FE/`) | PASS — 4/4 | Terminal output this session | New file authored this phase |
| `npx tsc --noEmit` (in `EDCAP_FE/`) | PASS — no errors | Terminal output this session | Full project type-check |
| `npx vitest run` (in `EDCAP_FE/`) | 45 files: 44 passed / 1 failed; 293 tests: 289 passed / 4 failed | Terminal output this session | The 4 failures are pre-existing, in `ThresholdConfigPage.test.tsx` (Phase 5 artifact) — see §5/§7 |
| `mvn clean verify` (in `EDCAP_BE/`) | BUILD SUCCESS | Terminal output this session | 489 unit tests + 89 integration tests, 0 failures/errors; no BE files changed this phase — run as a regression sanity check |
| `mvn flyway:migrate` | NOT RUN | — | Requires explicit user confirmation per `00-safety.md §3`; not requested this session |
| `npx playwright test threshold-config` | NOT RUN | — | Requires a live dev server/browser; execution action, spec already authored in Phase 5 |

## 3. Summary of Results

Phase 6 scope was to close two FE component-test gaps identified by exploring the current repo
state: `ColorPicker.tsx` and `ScoreRangeProgressBar.tsx` (backing AC-15 and AC-13) had no dedicated
component tests — only indirect coverage via `utils.test.ts`'s pure-function tests. Both gaps are
now closed with 9 new passing tests across 2 new files. `tsc` and the BE full suite (`mvn clean
verify`) are both green with no BE changes made this phase. The full FE suite run surfaced one
pre-existing failure set (4 tests in `ThresholdConfigPage.test.tsx`, confirmed via `git status`/
`git diff --stat` to predate this phase's changes) — see §5/§7.

## 4. List of Passes

| test | result | note |
|---|---|---|
| `ColorPicker.test.tsx` — renders current hex value with valid-looking border | PASS | |
| `ColorPicker.test.tsx` — marks input invalid when value doesn't match hex pattern | PASS | |
| `ColorPicker.test.tsx` — onChange fires with raw typed value | PASS | |
| `ColorPicker.test.tsx` — onChange fires with uppercase hex from widget pick | PASS | |
| `ColorPicker.test.tsx` — disabled propagates to widget and input | PASS | |
| `ScoreRangeProgressBar.test.tsx` — one segment per active row, sized/colored from range | PASS | |
| `ScoreRangeProgressBar.test.tsx` — recolors/resizes in realtime on rerender | PASS | AC-13 |
| `ScoreRangeProgressBar.test.tsx` — excludes pending-delete rows | PASS | |
| `ScoreRangeProgressBar.test.tsx` — invalid color falls back to neutral gray | PASS | |
| `mvn clean verify` (BE) | PASS | 489 unit + 89 integration, all green, no regressions from this phase (no BE files touched) |
| `npx tsc --noEmit` (FE) | PASS | No type errors introduced |
| Remaining 40 pre-existing FE test files (of 45 total) | PASS | Unaffected by this phase's additions |

## 5. List of Fails

| test | cause | action | status |
|---|---|---|---|
| `ThresholdConfigPage.test.tsx` — "Edit click switches to Edit Mode with Save/Cancel/Add-band controls" | `vi.mock("antd", ...)` in this test file doesn't export `Tooltip`, which `ThresholdTable.tsx` now imports transitively via `src/components/ui/tooltip/index.tsx` | Not fixed this phase — pre-existing (confirmed via `git status`; file predates this session's changes), outside the two named gaps (AC-13/AC-15) this phase scoped to close | Open — flagged for FE owner before merge |
| `ThresholdConfigPage.test.tsx` — "Cancel reverts to View Mode and makes zero network calls" | Same root cause | Same | Open |
| `ThresholdConfigPage.test.tsx` — "Add band inserts a new row with no id, editable inline" | Same root cause | Same | Open |
| `ThresholdConfigPage.test.tsx` — "blocks Save and shows a toast when the active set has a gap" | Same root cause | Same | Open |

## 6. Bugs Fixed

None — this phase only added test code; no production code was modified.

## 7. Not yet fixed / Pending

- `ThresholdConfigPage.test.tsx`'s `antd` mock needs a `Tooltip: (props) => props.children`-style
  stub added so `ThresholdTable.tsx`'s `Tooltip` import resolves in tests. This affects AC-2/3/4/16
  (currently marked PASS in `review-checklist.md`/`self-review.md` on the strength of this file) —
  should be triaged and fixed before merge, but is outside this phase's two named gaps.
- Migration `V504` still not applied to any database (carried from Phase 5).
- Playwright E2E spec still not executed (carried from Phase 5).
- BE adapter/integration test against a live Postgres instance for the partial unique index
  (AC-10) still not written/run — no Testcontainers convention exists anywhere in this repo to
  follow yet (dependency declared in `pom.xml`, unused everywhere), and writing one would require
  a schema-apply step gated by `00-safety.md §3`.
- `ArchitectureTest.java` does not exist anywhere in this repo (confirmed this phase) — a
  pre-existing, repo-wide gap; ArchUnit enforcement referenced across ticket docs
  (`review-checklist.md §8`, `testing.md`) is aspirational, not real, today. Out of scope for
  THRESHOLD-CONFIG to fix.

## 8. Test cannot be executed and reason

| test/command | reason | risk | alternative evidence |
|---|---|---|---|
| `mvn flyway:migrate` | Requires explicit user confirmation per `00-safety.md §3` | `tbl_dim_score_threshold` doesn't exist in any running DB; BE code depends on it at runtime | Migration SQL reviewed by code inspection (`V504__create_tbl_dim_score_threshold.sql`) |
| BE adapter test vs. real Postgres (AC-10 partial unique index) | No live DB; no existing Testcontainers convention in this repo to reuse | Partial-unique-index rejection behavior unverified beyond code review | `ScoreThresholdConfigModelsTest`'s active-set validators (app-level uniqueness logic) + migration SQL review |
| `npx playwright test threshold-config` | Requires a live dev server/browser, not started this session | View→edit→save and Cancel-zero-network flows unverified in a real browser | `ThresholdConfigPage.test.tsx`'s Vitest/RTL coverage of the same flows (4 of 5 currently failing — see §5) |

## 9. Remaining risk

Same three items carried from `self-review.md` §8 (migration not applied, no live-DB adapter test,
E2E not executed), plus two new items surfaced this phase: the `ThresholdConfigPage.test.tsx`
Tooltip-mock regression (§5/§7) and the confirmed absence of `ArchitectureTest.java` repo-wide.
None of the new items are defects in the code added this phase (`ColorPicker.test.tsx`,
`ScoreRangeProgressBar.test.tsx` are both fully green); they are pre-existing gaps this phase's
exploration surfaced while verifying the suite.

## 10. Final Test Verdict

- PASS / PARTIAL / FAIL / NOT_RUN — **superseded by §11 below** (session 2, same date)

This phase's own scope (AC-13/AC-15 component-test gaps) is fully closed and green. Held at
PARTIAL, not PASS, because: (1) `ThresholdConfigPage.test.tsx` has 4 pre-existing failures that
should be fixed before merge though they predate this phase, and (2) the migration/live-DB/E2E
verification items carried from Phase 5 remain open pending explicit user action.

## 11. Update — 2026-07-22 (session 2)

Continuation of Phase 6 in the same day: fixed the `ThresholdConfigPage.test.tsx` regression
flagged in §5/§7 above, and investigated (but did not author) the AC-10 live-Postgres adapter test.

### 11.1. Executed Command (session 2)

| command | result | note |
|---|---|---|
| `npx vitest run "src/__ tests __/threshold-config/ThresholdConfigPage.test.tsx"` (before fix) | 1/5 passed, 4/5 failed | Reproduced the exact failure from §5: `No "Tooltip" export is defined on the "antd" mock` |
| `npx vitest run "src/__ tests __/threshold-config/ThresholdConfigPage.test.tsx"` (after fix) | PASS — 5/5 | Fix: added `Tooltip: ({ children }) => children` to the file's `vi.mock("antd", ...)` factory |
| `npx vitest run` (in `EDCAP_FE/`, full suite) | PASS — 45 files / 293 tests, all green | Confirms the fix has no other regressions; AC-2/3/4/16 now fully covered by a passing file |
| `docker version` / `docker info` | Docker CLI present (Desktop 25.0.3) but daemon not running (`open //./pipe/docker_engine: The system cannot find the file specified`) | Checked before attempting the AC-10 Testcontainers test |

### 11.2. Bug Fixed

| bug | cause | fix | test |
|---|---|---|---|
| `ThresholdConfigPage.test.tsx` 4/5 failures | Stale `vi.mock("antd", ...)` missing a `Tooltip` export; `ThresholdTable.tsx` transitively imports `Tooltip` via `src/components/ui/tooltip/index.tsx` (added after the mock was originally written) | Added `Tooltip: ({ children }) => children` to the mock factory | `npx vitest run` on the file — 5/5 pass; full suite — 293/293 pass |

### 11.3. AC-10 Testcontainers adapter test — investigated, not authored

Per the approved Phase 6 plan, decided explicitly rather than left silently open:

- `pom.xml` already declares `testcontainers:junit-jupiter` and `testcontainers:postgresql` (test
  scope, BOM-managed versions via Spring Boot 3.4.1), plus `flyway-database-postgresql`
  (`10.20.1`) — so the dependencies to write this test exist.
- However, every existing `*IntegrationTest.java` in this repo (`CustomerPersistenceIntegrationTest`,
  `ArtifactScannerPersistenceIntegrationTest`, `ExceptionKpiJdbcAdapterIntegrationTest`,
  `RolePersistenceIntegrationTest`, and the migration-folder tests) is actually a plain
  file-content assertion test (`Files.readString` + substring checks) — **none opens a real JDBC
  connection**. There is no precedent anywhere in the repo for a Testcontainers-backed,
  real-Postgres test, no `application-test.yml`, and no datasource test config to build on.
- `docker version`/`docker info` confirm the Docker CLI is installed in this environment but the
  daemon is **not running** — Testcontainers requires a live daemon to spin up
  `PostgreSQLContainer`, so any such test authored right now could not actually be executed or
  verified in this session.
- Per the plan's explicit stop condition ("If establishing this Testcontainers convention from
  scratch turns out to be non-trivial... stop and report back rather than forcing it"), this test
  was **not authored** this session — writing an unverifiable, never-run new test file would
  violate the "no half-finished implementations" principle and would introduce a new repo-wide
  testing convention (real-DB integration tests) without being able to confirm it works.
- AC-10 remains verified at the application level only: `ScoreThresholdConfigModelsTest`'s
  active-set uniqueness validators, plus code review of the `ux_tbl_dim_score_threshold_code_active`
  partial unique index in `V504__create_tbl_dim_score_threshold.sql`. This is unchanged from §8/§9
  above — carried forward, not newly resolved.

### 11.4. Final Test Verdict (session 2)

- PASS / PARTIAL / FAIL / NOT_RUN — **PARTIAL**

FE regression from §5/§7 is now fixed (293/293 FE tests green, BE suite already green from
session 1). Held at PARTIAL, not PASS, because the following remain open, none of which are code
defects — all require an environment/infra action not available in this session: (1) migration
`V504` not applied to any DB, (2) AC-10 live-Postgres adapter test not written (blocked on a
running Docker daemon, see §11.3), (3) Playwright E2E spec authored but not executed.

## 12. Final Consolidated Verdict — Phase 8, 2026-07-22

This closes out the test-results record for the whole ticket (not just Phase 6's scope), as the
authoritative final state referenced by `report.md`.

**Ticket-wide test status: PARTIAL.**

Everything code-authored and executable in this environment is green:
- BE: `mvn clean verify` — 489 unit + 89 integration tests, 0 failures (all `ScoreThresholdConfig*`
  classes plus the 3 rewired hardcoded-copy call sites and their existing tests).
- FE: `npx vitest run` — 45 files / 293 tests, all green (includes the Phase 6 `ThresholdConfigPage.test.tsx`
  Tooltip-mock fix, and the new `ColorPicker.test.tsx`/`ScoreRangeProgressBar.test.tsx` files).
- FE type-check (`tsc --noEmit`) and FE build (`npm run build`) both green.

Held at PARTIAL rather than PASS solely due to three infra-gated verification steps that require an
explicit user/environment action not available in any session so far, none of which reflect a code
defect:
1. **Migration `V504` not applied** to any database — requires `mvn flyway:migrate`, which needs
   explicit user confirmation per `00-safety.md §3`.
2. **AC-10's partial-unique-index behavior not verified against a live Postgres instance** — no
   Testcontainers convention exists anywhere in this repo to build on, and the Docker daemon was
   not running in this environment; verified at the application level only
   (`ScoreThresholdConfigModelsTest`'s active-set uniqueness validators + migration SQL review).
3. **Playwright E2E spec authored but never executed** — requires a live dev server/browser, not
   started in any session; the same user flows are covered by `ThresholdConfigPage.test.tsx`'s
   Vitest/RTL equivalents.

No further test-authoring action is recommended for this ticket; the three remaining items are
follow-up execution/infra actions to complete before merge/deploy, tracked in `report.md` §8
Accepted Risk and §16 Final Verdict.
