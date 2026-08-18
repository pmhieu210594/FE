# Final Report

**Ticket ID**: THRESHOLD-CONFIG
**Feature**: Score Threshold Configuration screen
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-22
**Phase**: Phase 8 - Test Results / Final Report

## 1. Edited summary

Adds an Admin-only Score Threshold Configuration screen backed by a new `tbl_dim_score_threshold`
table, replacing what were previously 5 hardcoded score bands (Excellent/Good/Warning/Risky/
Critical) baked into BE Java (`EvidenceQualityScoreModels.ScoreBand` enum) and duplicated in two
other BE locations (`PmDashboardService.VALID_SCORE_BANDS`, `EvidenceQualityScoreMapper.
toDisplayBand`). Per HD-THRESHOLD-CONFIG-1, all three hardcoded copies were rewired to read from
the new config table at runtime, so an admin can now add/edit/soft-delete bands and have the
change reflected across scoring (`EvidenceQualityScoreService`) and PM-dashboard consumers without
a redeploy. Admin-only gating, `version`-column optimistic locking, and soft-delete follow existing
repo precedents (`AdminAuditLogController`, `CustomerService`/`OrganizationService`/`TeamService`).

## 2. Corresponding specification / AC

| ACID | status | evidence |
|---|---|---|
| AC-THRESHOLD-CONFIG-1 | PASS | `ScoreThresholdConfigControllerTest.list_returnsActiveBands`; FE list render test |
| AC-THRESHOLD-CONFIG-2 | PASS | `ThresholdConfigPage.test.tsx` (Tooltip mock fixed 2026-07-22, now 5/5) |
| AC-THRESHOLD-CONFIG-3 | PASS | Asserts zero network calls on Cancel |
| AC-THRESHOLD-CONFIG-4 | PASS | Add-band row test |
| AC-THRESHOLD-CONFIG-5 | PASS (unit-level; DB not exercised live) | `ScoreThresholdConfigServiceTest.save_insertsUpdatesAndSoftDeletesInOneBatch` |
| AC-THRESHOLD-CONFIG-6 | PASS | Gap validator unit + controller test, HTTP 400 |
| AC-THRESHOLD-CONFIG-7 | PASS | Overlap validator unit + controller test |
| AC-THRESHOLD-CONFIG-8 | PASS | Duplicate-Code validator unit + controller test |
| AC-THRESHOLD-CONFIG-9 | PASS | Lowercase/space/special-char Code rejection |
| AC-THRESHOLD-CONFIG-10 | PASS (by design; DB partial-unique-index not exercised live) | App-level uniqueness excludes soft-deleted rows; migration SQL reviewed |
| AC-THRESHOLD-CONFIG-11 | PASS | Single `@Transactional` batch upsert |
| AC-THRESHOLD-CONFIG-12 | PASS | 403 for non-ADMIN on both endpoints |
| AC-THRESHOLD-CONFIG-13 | PASS | `ScoreRangeProgressBar.test.tsx`, 4/4 |
| AC-THRESHOLD-CONFIG-14 | PASS (manual review only, no automated lint) | All text via `t("Pages.ThresholdConfig...")` |
| AC-THRESHOLD-CONFIG-15 | PASS (unit-level) | `ColorPicker.test.tsx`, 5/5; BE hex-format validator |
| AC-THRESHOLD-CONFIG-16 | PASS | Status/Actions column per mode |
| AC-THRESHOLD-CONFIG-17 | PASS (unit-level; no live-DB redeploy-free integration test) | 3 consumers all delegate to `ScoreThresholdConfigService`; full BE suite green |
| AC-THRESHOLD-CONFIG-18 | PASS | `lookupBand` unit test + cache test |

All 18 ACs from `spec-pack.md` §7 are PASS. Three carry an explicit "unit-level only"/"not
exercised live" caveat (AC-5, AC-10, AC-17) because no live Postgres instance was available this
session — see §8 Accepted Risk.

## 3. Scope of influence

**New (BE)**: `V504__create_tbl_dim_score_threshold.sql` (renamed from the originally-planned
`V503` — slot collision, see §13), `ScoreThresholdConfigModels`, `ScoreThresholdConfigService`,
`ScoreThresholdConfigRepositoryPort`/`Adapter`, `ScoreThresholdConfigDtos`,
`ScoreThresholdConfigController` (+ one test class per production class).

**Modified (BE)**: `EvidenceQualityScoreModels` (`ScoreBand` enum removed), `EvidenceQualityScoreService`
(call site rewired to `scoreThresholdConfigService.lookupBand(total).label()`), `PmDashboardService`
(`VALID_SCORE_BANDS` → `getActiveCodes()`), `EvidenceQualityScoreMapper` (`toDisplayBand` →
`displayNameForCode`, dead import removed), plus their corresponding test files updated for the new
constructor/dependency.

**New (FE)**: `pages/threshold-config/` (page + `ThresholdTable`/`ColorPicker`/
`ScoreRangeProgressBar` components + `types.ts`/`utils.ts`), FE component/unit tests, a Playwright
E2E spec (authored, not executed).

**Modified (FE)**: `lib/api.ts` (new `scoreThresholds: { list, save }` endpoint group),
`locale.json` (en/vi/ja), `App.tsx` (new `admin/score-thresholds` route), `Layout.tsx` (new nav
entry).

**Indirect / verified unaffected**: `ArtifactScannerService` call sites (method signatures
unchanged, only downstream band-lookup implementation changed), `PmDashboardModels`/
`PmDashboardDtos` (`scoreBand` fields already plain `String`, no widening needed — resolves
OI-THRESHOLD-CONFIG-9), `SecurityConfig`'s `permitAll` list (no new entry needed — new endpoints
inherit the default authenticated-session rule).

**Corrected FE scope**: per spec-pack §2.1.12: `EvidenceQualityScoreModels.ScoreBand`,
`EvidenceQualityScoreService`, `PmDashboardService`/`PmDashboardModels`/`PmDashboardDtos`,
`EvidenceQualityScoreMapper` were named as in-scope, plus the new admin CRUD screen/API/table. The
FE consumer list in that same spec-pack section claimed `scoreBandClasses` was consumed by 4
pages; independently re-verified in `context.md`/`impact-analysis.md` §5 this was **inaccurate** —
`scoreBandClasses` has zero production consumers; the real (and only) FE touch point is
`TicketDetailDrawer.tsx`'s plain-text `scoreBandLabel` passthrough, which required no code change
since it already renders whatever string it's given. `PMDashboardPage`/`ProjectPage`/
`TraceabilityPage` are confirmed not to reference `scoreBand` at all.

No existing table or migration is altered — purely additive. Migration and BE code must ship
together in one atomic deploy (enum removal breaks compilation/runtime without the new table).

## 4. Implementation content

| file | summary | reason |
|---|---|---|
| `V504__create_tbl_dim_score_threshold.sql` | New table + partial unique index + 5-band seed data | Persistence for config; renamed from planned V503 (slot collision) |
| `ScoreThresholdConfigModels.java` | `ScoreThreshold` record + pure gap/overlap/coverage/Code-format validators + `lookupBand` | Domain logic, DB-free unit testable |
| `ScoreThresholdConfigService.java` | list/save/lookupBand/getActiveCodes/displayNameForCode + in-memory cache + `requireAdmin` + audit-log wrapping | Application orchestration, atomicity, caching |
| `ScoreThresholdConfigRepositoryPort.java` / `RepositoryAdapter.java` | Port interface + `NamedParameterJdbcTemplate` implementation | Hexagonal boundary |
| `ScoreThresholdConfigDtos.java` / `Controller.java` | `record` DTOs + `GET`/`POST /api/v1/score-thresholds`, `requireAdmin` gate | Web-layer shape and entry point |
| `EvidenceQualityScoreModels.java` | `ScoreBand` enum removed | Retire enum per spec-pack §5 |
| `EvidenceQualityScoreService.java` | Call site rewired to the new service | Sole production call site |
| `PmDashboardService.java` | `VALID_SCORE_BANDS` → `scoreThresholdConfigService.getActiveCodes()` | Retire hardcoded copy #2 |
| `EvidenceQualityScoreMapper.java` | `toDisplayBand` switch → `displayNameForCode`; dead import removed | Retire hardcoded copy #3 |
| `EvidenceQualityScoreModelsTest.java` | Deleted (covered removed enum; superseded by `ScoreThresholdConfigModelsTest`) | Test currency |
| `lib/api.ts` | New `scoreThresholds: { list, save }` group | FE API access via `20-architecture.md` convention |
| `locale.json` (en/vi/ja) | New `Pages.ThresholdConfig.*` + `Layout.scoreThresholds` | i18n |
| `App.tsx` / `Layout.tsx` | New Admin-gated route + nav entry | Discoverability, Admin-only routing |
| `pages/threshold-config/**` | Full View/Edit-mode screen (page + 3 components + types/utils) | Primary FE deliverable |

Followed `impl-plan.md` Option B (fully replace the `ScoreBand` enum with a `code`-string-keyed
value object) across all 13 planned steps in order, ending with an authored-but-not-executed
Playwright E2E spec.

**Explicitly not implemented** (per ticket-rules.md "Must Not Do", all intentional): Code-editing
restriction (BR-011, deferred by HD-2), undelete/hard-delete, Operations Manager access,
`@PreAuthorize` usage.

**Implementation choices not spec-mandated** (flagged for human confirmation, see §10 items 1/3/4):
`lookupBand`'s defensive fallback on an unexpected coverage gap clamps to the nearest band below
the score (rather than throwing/returning "unclassified"); FE row-removal in Edit Mode is a local
pending-status toggle with Undo rather than immediate removal; `color` validated as strict 6-digit
hex (`^#[0-9A-Fa-f]{6}$`, no 3-digit shorthand/alpha).

## 5. Review results

| review type | result | notes |
|---|---|---|
| Self Review | Done — NEEDS_UPDATE (infra items only, no code defects) | `self-review.md` §11 |
| Independent AI Review (review-checklist) | Done — all sections PASS | `review-checklist.md`; 1 unchecked item: BE integration test vs. live Postgres for the partial unique index |
| Human Review | Pending | 4 items flagged in `self-review.md` §10 need explicit human confirmation — see §10 below |

## 6. Test results

| test type | result | evidence |
|---|---|---|
| BE unit + service + controller tests | PASS | `mvn clean verify` — 489 unit + 89 integration tests, 0 failures |
| FE unit/component tests | PASS | `npx vitest run` — 45 files / 293 tests, all green (after fixing a stale `antd` Tooltip mock) |
| FE type-check | PASS | `npx tsc --noEmit` |
| FE build | PASS | `npm run build` |
| DB migration apply | NOT RUN | Requires explicit user confirmation per `00-safety.md §3` |
| BE live-Postgres adapter test (AC-10) | NOT AUTHORED | No Testcontainers convention exists in this repo; Docker daemon not running this session |
| Playwright E2E | NOT RUN | Spec authored; no dev server/browser started this session |

One test bug was found and fixed this session: `ThresholdConfigPage.test.tsx`'s
`vi.mock("antd", ...)` was missing a `Tooltip` export that `ThresholdTable.tsx` transitively
needed; fixed by adding `Tooltip: ({ children }) => children` to the mock factory (4/5 → 5/5
passing, full suite confirmed unaffected — 293/293 green).

**Test verdict: PARTIAL** — all authored/executable tests are green; held below PASS only by three
infra-gated, non-code items (migration not applied, no live-DB adapter test, E2E not executed).

## 7. Security / operations perspective

Both `GET`/`POST /api/v1/score-thresholds` are gated server-side via `requireAdmin` →
`ForbiddenException` → HTTP 403, following the existing `AdminAuditLogController` precedent — FE
hiding the Edit button is not relied upon as the security boundary (HD-THRESHOLD-CONFIG-5). No
`@PreAuthorize` used (does not exist in this codebase's `SecurityConfig`). No PII/secrets involved
— pure config data. No new `permitAll` entry added; endpoints inherit the default
authenticated-session rule. Standard `ErrorResponse` shape used throughout, no new error format.

Every create/update/soft-delete is wrapped in try/catch calling
`adminAuditLogService.logCreate/logUpdate/logDelete/logCrudFailure`, matching `CustomerService`
precedent. In-memory cache for `lookupBand`/`getActiveCodes`/`displayNameForCode` is invalidated
synchronously inside the same `save()` transaction, avoiding a DB round-trip on the per-scoring-
event hot path (resolves OI-THRESHOLD-CONFIG-8). Soft-deleted rows accumulate indefinitely (no
restore/purge) — acceptable per spec, flagged for future data-volume awareness given this is a
low-cardinality table.

## 8. Accepted Risk

| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| Migration `V504` not applied to any DB | BE code depends on `tbl_dim_score_threshold` at runtime — will fail until migration runs | User / next session | Before deploy | Pending |
| BE adapter/integration test vs. live Postgres (AC-10) not authored | Partial-unique-index rejection behavior verified by code review + app-level validators only | BE owner | Before merge | Pending |
| Playwright E2E spec authored but not executed | View→edit→save and Cancel-zero-network flows verified via Vitest/RTL equivalents only | FE owner | Before merge | Pending |
| `lookupBand` defensive-fallback (nearest-band clamping) | Low — only triggers if BR-005 coverage validation is somehow bypassed at save time | Tech Lead | Confirmed 2026-07-22 | Approved |
| FE "toggle-to-DELETE-with-Undo" interaction is an implementation choice, not spec-explicit | Low — UX-only, functionally satisfies AC-16 | FE owner | Confirmed 2026-07-22 | Approved |
| `ArchitectureTest.java` does not exist anywhere in this repo (confirmed 2026-07-22) | Low for this ticket; multiple ticket docs assert ArchUnit "stays green," which is aspirational not actual today | Repo-wide follow-up | N/A | N/A |

## 9. Open Issues

| issue | impact | next action |
|---|---|---|
| OI-THRESHOLD-CONFIG-1 | Integer vs decimal scores | **Resolved 2026-07-21**: INTEGER, recorded in `impact-analysis.md` §16 |
| OI-THRESHOLD-CONFIG-2 | Min/max band count | **Resolved**: ≥1 active band required |
| OI-THRESHOLD-CONFIG-3 | Single-band 0-100 validity | **Resolved**: valid |
| OI-THRESHOLD-CONFIG-7 | Color validation strictness | **Resolved**: `^#[0-9A-Fa-f]{6}$` |
| OI-THRESHOLD-CONFIG-8 | Cache/invalidation strategy | **Resolved**: in-memory cache + save-triggered invalidation, implemented |
| OI-THRESHOLD-CONFIG-9 | FE/DTO type-widening | **Resolved**: not needed — fields already plain `String` |
| No Testcontainers convention in this repo | AC-10's DB-level guarantee stays unverified beyond code review | Repo-wide decision, out of this ticket's scope — see §15 candidate |
| `ArchitectureTest.java` absent repo-wide | Aspirational-not-actual ArchUnit claims across ticket docs | Repo-wide follow-up, not a THRESHOLD-CONFIG action item |

All Phase 1 Open Issues are now closed as this-session Phase 3 implementation decisions. The two
remaining items are repo-wide gaps surfaced by this ticket, not blockers for THRESHOLD-CONFIG
itself.

## 10. Human Decisions

| decision | owner | result |
|---|---|---|
| HD-THRESHOLD-CONFIG-1 to 6 | Human Owner, 2026-07-21 | All Closed or Deferred — see `spec-pack.md` §17 |

**Implementation-choice items confirmed by the human owner, 2026-07-22** (per `self-review.md`
§10, all 4 approved as implemented):
1. `lookupBand`'s nearest-band-clamping fallback behavior — Approved.
2. That applying `V504` and deploying the rewired BE code together as a single atomic unit is the
   correct sequencing — Approved (the migration itself has still not been applied to any DB; that
   remains an execution action, not an open design question — see §8 Accepted Risk).
3. The FE "toggle-to-DELETE-with-Undo" interaction for row removal in Edit Mode — Approved.
4. OI-1/2/3/7/8 resolutions (INTEGER scores, ≥1 active band, single-band 0-100 valid, 6-digit hex
   color, in-memory cache) — Confirmed to match the human owner's expectations.

## 11. Source Analysis Limitations

See `sources.md` → Source Limitations for the full list. Notably:
- `docs/architecture/overview.md`'s soft-delete note ("not used — hard delete with cascade") and
  `docs/standards/database.md`'s "Candidate" labeling of soft delete are both stale relative to
  actual merged code (`V92`, `V110`, `CustomerService` et al.) — this ticket followed the real
  merged pattern, not the stale docs (see §15 candidate).
- `docs/standards/security.md`/`error-handling.md`'s "AdminController ad-hoc Map" inconsistency note
  does not match any file found in current source; the real pattern (`AdminAuditLogController.
  requireAdmin` → `ForbiddenException`) is correct and was followed instead (see §15 candidate).
- `spec-pack.md` §2.1.12's FE-consumer list for `scoreBandClasses` was found inaccurate against
  current source during Phase 2 (see `context.md`) — corrected before FE implementation began,
  preventing over-implementation of 3 pages that don't actually reference the band concept.
- No FE/BE contract artifact, OpenAPI spec, or Pact-style test existed to verify the proposed API
  shape against — the contract in spec-pack §11 was a proposal, implemented as designed.

## 12. What worked

- Reusing existing, verified precedents (`requireAdmin`/`ForbiddenException`, `version`-column
  optimistic locking, hexagonal port/adapter shape from `ArtifactScannerService`) let a
  Complex-classified ticket ship without inventing any new architectural pattern.
- Catching the spec-pack's inaccurate FE-consumer claim (4 pages vs. actual 0-1) *before*
  implementation, via an independent verification pass in `context.md`, avoided real
  over-implementation work.
- Deferring the Code-editing-restriction rule (HD-2) rather than guessing at its meaning kept scope
  honest instead of shipping a speculative, possibly-wrong constraint.
- Checking the migration directory before writing code caught the `V503` slot collision early,
  avoiding a later merge conflict.

## 13. What failed

- `impl-plan.md`/`impact-analysis.md` assumed `V503` was the next-free migration slot; it had
  already been taken by a migration merged after those docs were authored. Caught before
  implementation, but signals these planning docs can go stale between Phase 3 planning and Phase 5
  implementation on a fast-moving repo.
- A stale `vi.mock("antd", ...)` in a Phase-5-authored FE test file broke 4/5 cases once
  `ThresholdTable.tsx` started transitively importing `Tooltip` — not caught until a later
  full-suite run in Phase 6, meaning the test file passed in isolation at original authorship but
  not against the full mock surface it actually exercised.
- No repo-wide Testcontainers convention exists, and this ticket could not establish one
  unverified (Docker daemon unavailable this session) — leaves AC-10's DB-level guarantee
  unverified beyond code review.
- The Playwright E2E spec and the Flyway migration application were both scoped correctly to
  "author but do not execute" (per safety rules and no dev server), meaning the ticket's full loop
  (migrate → deploy → run) has never been executed end-to-end in this engagement.

## 14. Candidate updates Failure Mode Index

1. **"Migration slot planned before checking the latest merged migration directory"** — a planning
   doc named a specific migration number without re-verifying it at implementation time. Recommend
   the Failure Mode Index note: always re-check the migration directory immediately before
   creating a new migration file, even if a plan already named a slot.
2. **"Test mock drift when a shared UI primitive gains a new transitive import"** — a component
   test's hand-rolled library mock (`vi.mock("antd", ...)`) silently desynced from the real module
   surface once a shared component started importing an export the mock didn't provide; failure
   only surfaced on a full-suite run, not the file's own isolated run at authorship time. Recommend
   flagging hand-rolled library mocks as a recurring drift risk, especially for widely-shared UI
   primitives.

## 15. Candidate updates Living Docs

Recommend fixing `docs/architecture/overview.md`'s stale "soft delete not used" note and
`security.md`/`error-handling.md`'s stale "AdminController ad-hoc Map" note as a separate,
non-blocking follow-up (RI-THRESHOLD-CONFIG-7, RI-THRESHOLD-CONFIG-8 in `spec-pack.md` §20).
Additionally:
- Fix `docs/standards/database.md` — promote soft delete from "Candidate" to a confirmed,
  documented convention.
- Consider documenting a repo-wide Testcontainers/live-DB integration-test convention — currently
  the dependency is declared (`pom.xml`) but unused everywhere; every `*IntegrationTest.java` is a
  file-content assertion test only. This ticket's AC-10 verification gap is a direct symptom of
  this missing convention.
- If `spec-pack.md`/precedent templates ever cite this ticket's FE-consumer analysis as an example,
  cite the corrected version in `context.md`/`impact-analysis.md` §5, not the original (inaccurate)
  spec-pack §2.1.12 text.

## 16. Final Verdict

**NEEDS_UPDATE** (not BLOCKED) — all code compiles, all authored tests pass (`mvn clean verify` and
FE suite both green). All 4 implementation-choice items in §10 have been reviewed and approved by
the human owner (2026-07-22), resolving that prior blocker. Held back from DONE only because three
infra-gated verification steps remain outstanding, none of which are code defects: (1) the
migration has not been applied to any database, (2) no test in this session exercised a live
Postgres instance (AC-10 partial-unique-index behavior unverified beyond code review), and (3) the
Playwright E2E spec was authored but not executed. These require an environment action (running
`mvn flyway:migrate` with explicit confirmation per `00-safety.md §3`, a running Docker daemon, and
a live dev server/browser respectively) before this ticket can be marked fully DONE and merged.
