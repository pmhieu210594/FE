# Source Inventory

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-21

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| BE quality domain | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModels.java` | source | BE | read | `ScoreBand` enum (lines 19-59), `fromScore` (36-51); to be replaced |
| BE quality domain | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | source | BE | read | `calculate()` (161-333), `ScoreBand.fromScore()` call site (302), recalc entry points (86-159) |
| BE pmdashboard | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardService.java` | source | BE | read | `VALID_SCORE_BANDS` (22-23), used at `normalize()` (167-172) |
| BE pmdashboard | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardModels.java` | source | BE | read | `scoreBand`/`averageScoreBand` confirmed plain `String` (lines 56, 127) — no widening needed |
| BE web/dto | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/PmDashboardDtos.java` | source | BE | read | `scoreBand`/`averageScoreBand` confirmed plain `String` (lines 48, 115) |
| BE persistence mapper | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/EvidenceQualityScoreMapper.java` | source | BE | read | `toDisplayBand` switch (256-268), dead `ScoreBand` import (line 9), call site (line 118) |
| BE governance (pattern reference) | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CustomerService.java` | source | BE | read | `create`/`update`/`softDelete` (84-192), optimistic-lock check, audit-log wiring, `requireAdmin` (194-198) |
| BE web/rest (pattern reference) | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminAuditLogController.java` | source | BE | read | `requireAdmin` gate (66-70), `@CurrentUser AppUser caller` injection, endpoint shape (24-57) |
| BE scanner (hexagonal pattern reference) | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | source | BE | read | Constructor port injection (96-162); `recalculate*` call sites (446, 602, 700, 849, 987) |
| BE port (pattern reference) | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java` | source | BE | read | Plain interface shape, `default` method convenience pattern (33-35) |
| BE adapter (pattern reference) | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/DataOpsDashboardJdbcAdapter.java` | source | BE | read | `@Repository`, `NamedParameterJdbcTemplate`, `RowMapper` lambda style |
| BE exception handler | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | source | BE | read | Exception → HTTP mapping table (32-99) |
| BE domain | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | source | BE | read | `Role` enum (line 21): `VIEWER, EDITOR, ADMIN, PM` |
| BE migrations | `EDCAP_BE/src/main/resources/db/migration/V110__alter_tbl_dim_customer_for_soft_delete_version_alias_index.sql` | migration | BE | read | Partial unique index pattern (`ux_tbl_dim_customer_alias_active ... WHERE deleted_at IS NULL`) |
| BE migrations | `EDCAP_BE/src/main/resources/db/migration/V502__pm_dashboard_snapshot_ticket_repo_fix.sql` | migration | BE | read | Confirmed highest existing migration; next free slot is `V503` |
| BE tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModelsTest.java` | test | BE | read | `score_band_thresholds_match_spec` (16-28) — stale once config-driven |
| FE pm-dashboard | `EDCAP_FE/src/pages/pm-dashboard/utils.ts` | source | FE | read | `scoreBandClasses` (5-11, zero prod consumers), `scoreBandLabel` (59-61, used only by `TicketDetailDrawer`) |
| FE pm-dashboard | `EDCAP_FE/src/pages/pm-dashboard/components/TicketDetailDrawer.tsx` | source | FE | read | Only real consumer of `scoreBandLabel` (line 11 import, line 355 usage) |
| FE pm-dashboard | `EDCAP_FE/src/pages/pm-dashboard/components/SummaryCards.tsx` | source | FE | read | Unrelated 3-tone `ACCENT_BAR_CLASS` map (6-12) — not a `scoreBandClasses` duplicate |
| FE pm-dashboard tests | `EDCAP_FE/src/__tests__/pm-dashboard/utils.test.ts` | test | FE | read | Sole consumer of `scoreBandClasses` |
| FE admin-audit-log (pattern reference) | `EDCAP_FE/src/pages/admin-audit-log/AuditLogPage.tsx` | source | FE | read | Inline `useQuery` pattern (28-47), no mutation (read-only precedent) |
| FE admin-audit-log (pattern reference) | `EDCAP_FE/src/pages/admin-audit-log/hooks/useAuditLogFilters.ts` | source | FE | read | URL-synced filters wrapper |
| FE admin-audit-log (pattern reference) | `EDCAP_FE/src/pages/admin-audit-log/types.ts` | source | FE | read | Plain `type` export shape |
| FE admin-audit-log (pattern reference) | `EDCAP_FE/src/pages/admin-audit-log/utils.ts` | source | FE | read | `parseFilters`/`buildSearchParams` pair |
| FE pages/user (pattern reference) | `EDCAP_FE/src/pages/user/UserAccountsPage.tsx` | source | FE | read | `useMutation`/`useQuery`/`useQueryClient` inline, `CDrawerForm`, `message` (antd) — better CRUD template than audit-log |
| FE lib/api | `EDCAP_FE/src/lib/api.ts` | source | FE | read | `api.get/post/put/patch/del` (192-205), `organizations` endpoint group (887-917) |
| FE components/ui | `EDCAP_FE/src/components/ui/badge.tsx` | source | FE | read | Plain function component (not `forwardRef`), CVA variants |
| FE components/ui | `EDCAP_FE/src/components/ui/table.tsx` | source | FE | read | Existing table primitive to reuse |
| FE store | `EDCAP_FE/src/store/uiStore.ts` | source | FE | read | Doc comment (4-11): server data must not be placed here |
| FE hooks | `EDCAP_FE/src/hooks/` (useAuth.ts, useDashboardHome.ts, useDebounce.ts, useLanguage.ts) | source | FE | read | Confirmed no generic list-fetching hook exists |
| FE locales | `EDCAP_FE/public/locales/en/locale.json` | config | FE | read | `AdminAuditLog` block (~1131) — title/description/filters/cards/table/detail shape |
| FE routing | `EDCAP_FE/src/App.tsx` | source | FE | read | Route table (144-278); `RequireAdmin` wrapper (43-62); admin route pattern (203-210) |
| FE nav | `EDCAP_FE/src/components/Layout.tsx` | source | FE | read | Nav entry array, `adminOnly: true` flag, entries at lines 93-106 |
| Docs (this ticket) | `docs/changes/THRESHOLD-CONFIG/spec-pack.md` | doc | Phase 1 | read | Canonical Phase 1 output, PASS-gated |
| Docs (this ticket) | `docs/changes/THRESHOLD-CONFIG/context.md` | doc | Phase 1 | read | Corrects spec-pack §2.1.12/§11.7 FE consumer claim |
| Docs (this ticket) | `docs/changes/THRESHOLD-CONFIG/ticket-rules.md` | doc | Phase 1 | read | Must Follow / Must Not Do / Stop-Ask / Review Focus / Test Focus |
| Standards | `docs/standards/database.md`, `api-contract.md`, `security.md`, `error-handling.md`, `testing.md` | doc | project | read | Two known-stale notes flagged (soft-delete note, AdminController note) — see spec-pack §20 RI-7/RI-8 |
| Architecture | `docs/architecture/overview.md` | doc | project | read | Layer diagram cross-check for hexagonal placement |

## Important Files

Files that will actually be **edited** in Phase 3 implementation (not just referenced as pattern):

- `EDCAP_BE/.../quality/EvidenceQualityScoreModels.java` (modify — enum → value object)
- `EDCAP_BE/.../quality/EvidenceQualityScoreService.java` (modify — line 302 call site)
- `EDCAP_BE/.../pmdashboard/PmDashboardService.java` (modify — `VALID_SCORE_BANDS`)
- `EDCAP_BE/.../mapper/EvidenceQualityScoreMapper.java` (modify — `toDisplayBand`, dead import)
- `EDCAP_BE/src/test/.../EvidenceQualityScoreModelsTest.java` (modify — replace stale test)
- New: `V503__create_tbl_dim_score_threshold.sql`, `ScoreThresholdConfigModels.java`,
  `ScoreThresholdConfigService.java`, `ScoreThresholdConfigRepositoryPort.java`,
  `ScoreThresholdConfigRepositoryAdapter.java`, `ScoreThresholdConfigDtos.java`,
  `ScoreThresholdConfigController.java` (+ associated test classes)
- `EDCAP_FE/src/lib/api.ts` (modify — new `scoreThresholds` endpoint group)
- `EDCAP_FE/public/locales/en/locale.json` (+ `vi`/`ja` locales — modify, new `Pages.ThresholdConfig.*` block)
- `EDCAP_FE/src/App.tsx` (modify — new admin route)
- `EDCAP_FE/src/components/Layout.tsx` (modify — new nav entry)
- New: `EDCAP_FE/src/pages/threshold-config/ThresholdConfigPage.tsx` + `components/` + `types.ts` + `utils.ts`
- `EDCAP_FE/src/pages/pm-dashboard/components/TicketDetailDrawer.tsx` (verify only — likely no change needed since `scoreBandLabel` already passes through a dynamic string)

## Generated / Excluded Files

None — no generated code or excluded binary artifacts are part of this ticket's source basis.

## Missing Files

- No color-picker component exists anywhere in `EDCAP_FE/src/components/` (grepped for
  `HexColorPicker|react-colorful|input type="color"|colorPicker` — zero matches). Must be built
  new or a library added in Phase 3.
- No Progress/ProgressBar component exists under `EDCAP_FE/src/components/ui/` (glob for
  `*progress*` — zero matches). Must be built new for AC-THRESHOLD-CONFIG-13.
- No FE/BE contract artifact, OpenAPI spec, or prior test exists for this feature area (per
  spec-pack §9.4) — the impl-plan's DTO shape is new and unverified against a running system.
