# Context

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-21

## Source Basis

| source | trust | note |
|---|---|---|
| `docs/changes/THRESHOLD-CONFIG/spec-pack.md` | high | Phase 1 output, PASS-gated, all 6 Human Decisions closed/deferred |
| `docs/changes/THRESHOLD-CONFIG/sources.md` | high | Full citation table |
| BE code inventory (this Phase, verified) | high | `EvidenceQualityScoreModels.java`, `EvidenceQualityScoreService.java`, `PmDashboardModels/Service/Dtos`, `EvidenceQualityScoreMapper.java`, `AdminAuditLogController.java`, `CustomerService.java`, `GlobalExceptionHandler.java`, `ArtifactScannerService`+port+adapter, migration listing |
| FE code inventory (this Phase, verified) | high | `pm-dashboard/utils.ts`, `admin-audit-log/`, `lib/api.ts`, `pages/user/`, `components/ui/badge.tsx`, `locale.json`, `store/uiStore.ts`, `src/hooks/` |

**Correction to spec-pack §2.1.12 / §11.7 (flag for Phase 3)**: spec-pack claims `scoreBandClasses`
is consumed by `PMDashboardPage`, `TicketDetailDrawer`, `ProjectPage`, `TraceabilityPage`. Verified
against current source, this is **inaccurate**:
- `scoreBandClasses` (the CSS-class map in `pm-dashboard/utils.ts:5-11`) has **zero** production
  consumers — it is referenced only in its own test file (`src/__tests__/pm-dashboard/utils.test.ts`).
- Only `scoreBandLabel` (`utils.ts:59-61`, a plain `scoreBand ?? "-"` passthrough with **no styling**)
  is actually imported and used, and only in `TicketDetailDrawer.tsx:11`.
- `ProjectPage.tsx` and `TraceabilityPage.tsx` have **no** `scoreBand` references at all.

Phase 3 must not assume rewiring work exists in these 4 places; the real FE blast radius of
HD-THRESHOLD-CONFIG-1 is currently just `TicketDetailDrawer.tsx`'s plain-text label, unless a
follow-up grep for hardcoded copy-pasted Tailwind class strings (not going through the named
const) turns up more — not yet done, recommended before Phase 3 estimation.

## Screen / API / Batch / Related Job

| item | detail |
|---|---|
| New Admin screen | Score Threshold Configuration (View Mode / Edit Mode), no existing FE page — net new |
| `GET /api/v1/score-thresholds` | List active bands (ADMIN only) |
| `POST /api/v1/score-thresholds` | Batch save: soft-delete/update/insert (ADMIN only), single `@Transactional` |
| Runtime consumer (not a batch/job) | `EvidenceQualityScoreService.calculate()` — **the only call site** of `ScoreBand.fromScore()`, at `EvidenceQualityScoreService.java:302`, invoked from `recalculate(...)` (line 152), itself triggered by `ArtifactScannerService.recalculateFromParser(...)` (lines 601, 700, 849, 987) and `recalculateFromSourceChange(...)` (line 446) |
| No batch/cron job exists or is introduced by this ticket | — |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Admin-only controller gating | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminAuditLogController.java:26-71` | `@RestController` + per-method `requireAdmin(AppUser caller)` throwing `ForbiddenException("Component.Permission.Denied")`; `@CurrentUser AppUser caller` param injection |
| Optimistic locking + soft delete + audit log | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CustomerService.java:120-198` | `UPDATE ... WHERE id=? AND version=?`; `affected == 0` → `OptimisticLockingException`; every CRUD method wraps in try/catch calling `adminAuditLogService.logCreate/logUpdate/logDelete/logCrudFailure` |
| Hexagonal flow: web → service → port → adapter | `ArtifactScannerService.java` (constructor-injects `ArtifactScannerPersistencePort`, e.g. calls `persistence.insertSnapshot(...)` line 334) + `application/port/out/persistence/ArtifactScannerPersistencePort.java:27-60` (plain interface) + `infrastructure/persistence/adapter/DataOpsDashboardJdbcAdapter.java:17-48` (`@Repository`, `NamedParameterJdbcTemplate` + `RowMapper` lambdas) | New `ScoreThresholdConfigService` → `ScoreThresholdConfigPersistencePort` → `ScoreThresholdConfigJdbcAdapter`, same shape |
| Exception → HTTP mapping (no new handler needed) | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java:32-99` | Throw `IllegalArgumentException`/domain exception (→400), `ForbiddenException` (→403), `OptimisticLockingException` (→409) — all already wired |
| DTO shape (record + static factory) | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/PmDashboardDtos.java:48,54` | `record X(camelCaseFields...)` + `static X from(DomainModel m)` |
| FE admin screen folder shape | `EDCAP_FE/src/pages/admin-audit-log/` (`AuditLogPage.tsx` + `components/` + `hooks/useAuditLogFilters.ts` + `types.ts` + `utils.ts`) | Plain `type` exports in `types.ts`; URL-param `parseFilters`/`buildSearchParams` pair in `utils.ts`; `useQuery`/`useMutation` called directly inline in the page component (no generic query-wrapping hook exists to reuse) |
| FE endpoint group convention | `EDCAP_FE/src/lib/api.ts:887-917` (`organizations` group: `list/get/create/update/softDelete`) | New `scoreThresholds: { list, save }` (or similar) group in the same `endpoints` object, using `api.get`/`api.post` (`lib/api.ts:192-205`) |
| i18n page block | `EDCAP_FE/public/locales/en/locale.json`, `AdminAuditLog` block (~line 1131) | Top-level `Pages.<PageName>.*`, nested `filters`/`cards` sub-objects |

## Allowed common components
| component | path | usage note |
|---|---|---|
| `Badge` | `EDCAP_FE/src/components/ui/badge.tsx` | CVA variant pattern for Status (ACTIVE/DELETE) display; note it is a plain function component here, not `forwardRef` — check `components/ui/button.tsx` separately if `forwardRef` is strictly required per `10-style.md` |
| `api.get/post/put/patch/del` | `EDCAP_FE/src/lib/api.ts:192-205` | All calls must go through this; never call `fetch` directly (per `20-architecture.md`) |
| TanStack Query (`useQuery`/`useMutation`) | inline per-page, e.g. `AuditLogPage.tsx:28-47` | List + save use `useQuery`/`useMutation`; no shared "useAdminCrudList" hook exists — write inline in the page component, consistent with existing precedent |

## Forbidden common components
| component | reason |
|---|---|
| Zustand store for the fetched threshold rows | `EDCAP_FE/src/store/uiStore.ts:4-11` doc-comment explicitly: "DO NOT place server data here — server data passes through TanStack Query." Edit-Mode on/off toggle may be local state or a Zustand slice, but never the server-fetched rows themselves |
| `@PreAuthorize` / Spring Security method-level role annotation | Does not exist anywhere in this codebase; `SecurityConfig.java:44-51` only gates authentication via `permitAll` list, no role-based filter-chain gating — every new controller must call `requireAdmin` manually |
| Extending `ScoreBand` Java enum with new constants | Per spec-pack §5: a fixed 5-value enum cannot represent an admin-added 6th+ band; must become a `code`-string-keyed value object/DTO instead |

## List of methods that actually exist
| method/class | path | usage |
|---|---|---|
| `requireAdmin(AppUser caller)` | Repeated per-controller/per-service (e.g. `AdminAuditLogController.java:66-70`, `CustomerService.java:194-198`) — **not a shared utility**, must be re-declared in the new controller/service | Throws `ForbiddenException("Component.Permission.Denied")` if `caller == null \|\| caller.getRole() != AppUser.Role.ADMIN` |
| `ScoreBand.fromScore(BigDecimal)` | `EvidenceQualityScoreModels.java:36-43` | Current hardcoded lookup — the exact method HD-THRESHOLD-CONFIG-1 requires replacing with a DB-driven equivalent |
| `EvidenceQualityScoreService` band call site | `EvidenceQualityScoreService.java:302` — `String band = ScoreBand.fromScore(total).displayName();` | Sole production call site to change |
| `OptimisticLockingException` | Thrown in `CustomerService.java:155,182` on `affected == 0` | Already mapped to HTTP 409 CONFLICT by `GlobalExceptionHandler.java:42-45` |
| `api.get<T>(path)` / `api.post<T>(path, body)` | `lib/api.ts:193-198` | Use for new `GET`/`POST /api/v1/score-thresholds` calls |

## Forbidden methods / methods that do not exist
| method/API | reason | alternative |
|---|---|---|
| Any shared `requireAdmin` utility class | Does not exist as a shared helper — every service/controller declares its own private method | Copy the same private-method pattern into the new controller/service |
| `ScoreBand` as an exhaustive `switch`/pattern-match target anywhere new | The enum is being replaced by a dynamic `code` string per spec-pack §5; new code must not add new exhaustive-switch dependents on the fixed 5 constants | Match against the active config set by `code` string |
| A generic `useAdminCrudList`/similar FE query-wrapping hook | Does not exist in `EDCAP_FE/src/hooks/` (`useAuth.ts`, `useDashboardHome.ts`, `useDebounce.ts`, `useLanguage.ts` only) | Inline `useQuery`/`useMutation` in the page component, per `AuditLogPage.tsx`/`UserAccountsPage.tsx` precedent |
| XML MyBatis mapper files | The `infrastructure/persistence/mapper` folder name is misleading — this codebase uses Spring `NamedParameterJdbcTemplate` + plain Java `RowMapper` classes, not classic MyBatis XML | Follow `DataOpsDashboardJdbcAdapter.java` / `EvidenceQualityScoreMapper.java` style |

## DTO / Entity / Table / Migration mapping
| layer | name | path | Note |
|---|---|---|---|
| Migration | `V503__create_tbl_dim_score_threshold.sql` (name illustrative) | `EDCAP_BE/src/main/resources/db/migration/` | Next free slot confirmed — highest existing is `V502__pm_dashboard_snapshot_ticket_repo_fix.sql` |
| Table | `tbl_dim_score_threshold` | new | Closed by HD-THRESHOLD-CONFIG-3; columns per spec-pack §12: `id UUID PK`, `code VARCHAR NOT NULL`, `label VARCHAR NOT NULL`, `min_score INTEGER NOT NULL`, `max_score INTEGER NOT NULL`, `color VARCHAR NOT NULL`, `delete_flag`, `version BIGINT NOT NULL DEFAULT 0`, `created_at`/`updated_at TIMESTAMPTZ` |
| Index | `ux_tbl_dim_score_threshold_code_active` | new, partial unique index `WHERE delete_flag = <active>` | Direct precedent: `V110__alter_tbl_dim_customer_for_soft_delete_version_alias_index.sql`'s `ux_tbl_dim_customer_alias_active` |
| BE domain container | `ScoreThresholdConfigModels` (illustrative name) | new, likely `application/usecase/quality/` or new `usecase/scorethreshold/` package | Follows `EvidenceQualityScoreModels`/`PmDashboardModels` single-container-class-with-records shape |
| BE DTO | `ScoreThresholdConfigDto` (illustrative) | new, `web/dto/` | `record` + static `from(...)` factory, per `PmDashboardDtos.java:48,54` |
| **Three existing hardcoded duplicate copies of the 5 band names** — all must be reconciled in Phase 3 | 1) `EvidenceQualityScoreModels.ScoreBand` enum (lines 19-59, incl. hardcoded thresholds 90/75/60/40) 2) `PmDashboardService.VALID_SCORE_BANDS` (`Set.of("EXCELLENT",...)`, lines 22-23, used at 167-171 for filter validation) 3) `EvidenceQualityScoreMapper.toDisplayBand` switch (lines 256-268; **plus a dead unused `ScoreBand` import at line 9**) | `EDCAP_BE/.../quality/EvidenceQualityScoreModels.java`, `.../pmdashboard/PmDashboardService.java`, `.../persistence/mapper/EvidenceQualityScoreMapper.java` | Flag for Phase 3 impl-plan §5: all three must either read the same config source or be removed in favor of it — leaving any one hardcoded defeats HD-THRESHOLD-CONFIG-1 |
| FE type widening | `PmDashboardModels`/`PmDashboardDtos` `scoreBand`/`averageScoreBand` fields | already plain `String`, not enum-typed | No FE/BE type-widening work is actually needed here (OI-THRESHOLD-CONFIG-9 may be smaller than spec-pack assumed) — confirm in Phase 3 |

## formItemNm / SEQNO / Master Data / Code Value Mapping
| display/item | internal value | source | note |
|---|---|---|---|
| Band display label | `label` (translatable) | `tbl_dim_score_threshold.label` | Editable without affecting backend logic (spec-pack §3) |
| Band machine key | `code` (uppercase, e.g. `EXCELLENT`) | `tbl_dim_score_threshold.code` | Master-data key; uniqueness scoped to active rows only |
| SEQNO | N/A | — | No SEQNO concept found anywhere in this repo's conventions for this feature |

## Multilingual Note
- New i18n keys under `Pages.ThresholdConfig.*`, following the existing `Pages.<PageName>.*` convention (e.g. `Pages.AdminAuditLog.*` in `locale.json`, nested `filters`/`cards` sub-objects).
- Only `label` is translatable display text; `code` is not translated (spec-pack §3).

## Encoding / Mojibake Note
- No non-ASCII/CJK-specific encoding concern identified for this feature — `code`/`label`/`color` are all Latin-charset fields (`code`: uppercase `[A-Z0-9_]`-style per BR-THRESHOLD-CONFIG-008; `color`: hex string).
- Standard UTF-8 handling applies to `label` if a translator later enters non-English text; no special normalization logic is required beyond what the existing i18n system already does.

## Log / Audit / Operation Note
- New `ScoreThresholdConfigService` must wrap create/update/soft-delete in try/catch calling `adminAuditLogService.logCreate/logUpdate/logDelete/logCrudFailure`, matching `CustomerService.java:111-117,160-165,186-191`.
- Authorization/validation failures must be logged per `error-handling.md`/`security.md` — no stack traces or SQL to the client.
- Per spec-pack §6.6/§14: score-band lookup is on a per-scoring-event hot path — a caching strategy with save-triggered invalidation is a Phase 3 concern (OI-THRESHOLD-CONFIG-8), not optional if a naive per-lookup DB query would add unacceptable load; must be documented once implemented.

## Ticket-Specific Constraints
1. Admin-only for both view and edit — no Operations Manager access (HD-THRESHOLD-CONFIG-5).
2. `POST /api/v1/score-thresholds` (not `PUT`), camelCase fields (HD-THRESHOLD-CONFIG-4).
3. `version`-column optimistic locking required (HD-THRESHOLD-CONFIG-6).
4. BR-THRESHOLD-CONFIG-011 (Code-editing-restriction) is explicitly **deferred** — do not implement.
5. Cancel/Revert in Edit Mode must trigger **zero** backend calls (BR-THRESHOLD-CONFIG-004).
6. Save must be atomic — single `@Transactional` covering soft-delete + update + insert.
7. All three hardcoded band-name copies (enum, `VALID_SCORE_BANDS`, `toDisplayBand`) must be addressed together, not just one.

## Assumptions
| ID | assumption | risk |
|---|---|---|
| A-CTX-1 | `EDCAP_FE/src/pages/pm-dashboard/components/*.tsx` may contain copy-pasted Tailwind class strings duplicating `scoreBandClasses` that grep for the identifier missed | Medium — recommend a follow-up check before Phase 3 estimation |
| A-CTX-2 | New BE package for score-threshold domain code is `application/usecase/quality/` (co-located with `EvidenceQualityScoreModels`) rather than a new `usecase/scorethreshold/` package | Low — either is consistent with repo convention; final choice is a Phase 3 implementation detail |

## Open Issues Carried Forward (from spec-pack §19)
OI-THRESHOLD-CONFIG-1 (integer vs decimal scores), OI-THRESHOLD-CONFIG-2 (min/max band count),
OI-THRESHOLD-CONFIG-3 (single-band 0-100 validity), OI-THRESHOLD-CONFIG-7 (color validation
strictness), OI-THRESHOLD-CONFIG-8 (cache/invalidation strategy), OI-THRESHOLD-CONFIG-9 (FE/DTO
type widening — likely smaller than assumed, see DTO mapping section above) — all remain open for
Phase 3, none block starting implementation per spec-pack §16 Gate Judgment.
