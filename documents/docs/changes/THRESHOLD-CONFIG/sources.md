# Sources

**Ticket ID**: THRESHOLD-CONFIG
**Phase**: Phase 1 - Investigation / Spec Pack
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-21
**Status**: Draft / Phase 1 In Progress

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Raw input PRD | `docs/changes/THRESHOLD-CONFIG/01_raw-input.md` | read | Vietnamese PRD "MÀN HÌNH CẤU HÌNH NGƯỠNG ĐIỂM (SCORE THRESHOLD CONFIGURATION)"; sole existing artifact for this ticket before this Phase 1 pass |
| User task instructions | Chat request for Phase 1 THRESHOLD-CONFIG spec pack | read | Defines required outputs (sources.md, 00_brainstorm.md, spec-pack.md) and template location |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Spec-pack template | `docs/standards/templates/_ticket-template/spec-pack.md` | read | template | Section structure followed verbatim (18 sections) |
| Sources template | `docs/standards/templates/_ticket-template/sources.md` | read | template | Section structure followed verbatim |
| 00_brainstorm template | `docs/standards/templates/_ticket-template/00_brainstorm.md` | read | template | Section structure followed verbatim |
| Light ticket template | `docs/standards/templates/_light-ticket-template/` | read (listing only) | template | Not used — lacks `sources.md`/`00_brainstorm.md`, which this ticket explicitly requires |
| ROLE spec-pack (precedent example) | `docs/changes/ROLE/spec-pack.md` | read | high | Used only as a style/format precedent for section depth, ID prefixes, and Human Decision framing — not a source of THRESHOLD-CONFIG facts |
| ROLE sources.md (precedent example) | `docs/changes/ROLE/sources.md` | read | high | Style precedent for source-citation format |
| ROLE 00_brainstorm.md (precedent example) | `docs/changes/ROLE/00_brainstorm.md` | read | high | Style precedent for Conflicts/Undetermined/Risks tables |

## Human Decision Trace

| ID | decision | source | effect |
|---|---|---|---|
| HD-THRESHOLD-CONFIG-1 | Rewire `ScoreBand.fromScore()` (BE) and `scoreBandClasses` (FE) to read `tbl_dim_score_threshold` | User confirmation, 2026-07-21 | Moves §2 Scope item from Out to In; escalates §10 Complexity to Complex; adds Business Rules/ACs/Test lines for consumption in `spec-pack.md` |
| HD-THRESHOLD-CONFIG-2 | Defer the Code-editing-restriction rule; no restriction enforced for now | User confirmation, 2026-07-21 | BR-THRESHOLD-CONFIG-011 status → Deferred in `spec-pack.md` §6.1 |
| HD-THRESHOLD-CONFIG-3 | Table name is `tbl_dim_score_threshold` | User confirmation, 2026-07-21 | Closes SRC-ASM-001; finalizes `spec-pack.md` §3/§4/§5/§12 |
| HD-THRESHOLD-CONFIG-4 | Save endpoint is `POST` (not `PUT`); body/casing follows `api-contract.md` (camelCase, standard `ErrorResponse`) | User confirmation, 2026-07-21 | Closes SRC-ASM-002 and SRC-Q-004; resolves prior Open Issue on missing GET schema (adds `GET /api/v1/score-thresholds`); finalizes `spec-pack.md` §6.2/§6.3/§11 |
| HD-THRESHOLD-CONFIG-5 | Admin-only for both view and edit | User confirmation, 2026-07-21 | Closes SRC-Q-005; finalizes `spec-pack.md` §13 |
| HD-THRESHOLD-CONFIG-6 | Adopt the existing `version`-column optimistic-locking pattern | User confirmation, 2026-07-21 ("Tham khảo hệ thống hiện tại") | Closes SRC-ASM-004; finalizes `spec-pack.md` §12 (`version` column) |

## Architecture / Standards

| source | path | status | trust level | note |
|---|---|---|---|---|
| Architecture overview | `docs/architecture/overview.md` | read | medium-high | Hexagonal layering rules; DB-conventions table states soft delete "Not used — hard delete with cascade" (see Source Limitations — contradicted by actual migrations) |
| Coding standards | `docs/standards/coding.md` | read | medium-high | Naming, no-magic-values, file organization rules |
| Testing standards | `docs/standards/testing.md` | read | medium-high | BE/FE test patterns; FE test infra installed but largely unused |
| Security standards | `docs/standards/security.md` | read | medium-high | Session-cookie auth, HMAC webhook rule, ErrorResponse shape; "AdminController inconsistency" note not found verbatim in current source (see Source Limitations) |
| API contract standards | `docs/standards/api-contract.md` | read | medium-high | `/api/v1/<resource>` REST shape, camelCase JSON examples, pagination via `limit`/`offset`, `ErrorResponse` error shape |
| Database standards | `docs/standards/database.md` | read | medium-high | Flyway naming (`V{n}__{desc}.sql`), `tbl_<category>_<name>` convention, UUID PK for V5+, `score_band` native PG enum type, soft delete listed only as Candidate |
| Error-handling standards | `docs/standards/error-handling.md` | read | medium-high | Single `GlobalExceptionHandler`, exception→status table, validation error shape |
| `.claude/rules/00-safety.md` | `.claude/rules/00-safety.md` | read | high | Secrets rule, destructive-command rule, confirmation-required actions, Phase 0 restricted-scope note |
| `.claude/rules/10-style.md` | `.claude/rules/10-style.md` | read | high | BE/FE style rules (constructor injection, named FE exports, CVA variants, etc.) |
| `.claude/rules/20-architecture.md` | `.claude/rules/20-architecture.md` | read | high | Hexagonal dependency order, FE state/data rules (TanStack Query, Redux Toolkit, Zustand, `lib/api.ts`) |
| `.claude/rules/30-security.md` | `.claude/rules/30-security.md` | read | high | Secrets, webhook HMAC, error-response, CORS/session rules |
| `.claude/rules/40-testing.md` | `.claude/rules/40-testing.md` | read | high | BE/FE test conventions |
| `docs/maintenance/phase0/README.md` | `docs/maintenance/phase0/README.md` | read | medium | Confirms Phase 0 resolved judgements: `tbl_` prefix for V5+ (PJ1), Radix UI primary (PJ2), Conventional Commits (PJ3), SemVer (PJ4), `no-explicit-any` (PJ5) |

## Existing Source Code

| area | path | status | trust level | purpose |
|---|---|---|---|---|
| Hardcoded score-band enum | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModels.java` | read (verified lines 19-45) | high | Current `ScoreBand` enum + `fromScore()` — the exact logic THRESHOLD-CONFIG would make configurable if consumption is in scope |
| Score consumer service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | read (via agent report) | medium | Calls `ScoreBand.fromScore(total).displayName()` |
| PM dashboard service/models/DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardService.java` (+ `PmDashboardModels`, `PmDashboardDtos`, `EvidenceQualityScoreMapper`) | read (via agent report) | medium | Downstream consumers of the hardcoded band enum |
| FE score-band styling | `EDCAP_FE/src/pages/pm-dashboard/utils.ts` | read (via agent report) | medium | `scoreBandClasses` — FE mirror of the hardcoded 5 bands, consumed by `PMDashboardPage`, `TicketDetailDrawer`, `ProjectPage`, `TraceabilityPage` |
| Reference BE flow (parser pattern) | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` + `application/port/out/persistence/ArtifactScannerPersistencePort.java` + `infrastructure/persistence/adapter/DataOpsDashboardJdbcAdapter.java` | read (via agent report) | medium | Reference hexagonal flow: web → `@Service` orchestration → persistence port interface → `@Repository` JDBC adapter |
| Admin-gating precedent | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminAuditLogController.java` | read (verified lines 1-71) | high | Current, real `requireAdmin(AppUser caller)` pattern throwing `ForbiddenException("Component.Permission.Denied")` — the precedent to follow for THRESHOLD-CONFIG's admin gating |
| Forbidden/error mapping | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | read (verified lines 1-60) | high | Confirms `ForbiddenException`→403/`FORBIDDEN`, `DomainException`→400/`DOMAIN_RULE_VIOLATION`, `ApplicationException`→409/`CONFLICT`, `OptimisticLockingException`→409/`CONFLICT`, `NotFoundException`→404/`NOT_FOUND` |
| Security filter chain | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | read (verified lines 44-51) | high | Confirms the fixed `permitAll` list; no method-level/role-based gating at the filter-chain level — every new controller must add its own role check |
| Optimistic-locking + soft-delete precedent (service) | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CustomerService.java`, `OrganizationService.java`, `TeamService.java` | read (verified `OptimisticLockingException` usage) | high | `UPDATE ... WHERE id = ? AND version = ?`; `affected == 0` → `OptimisticLockingException` → HTTP 409 — precedent for THRESHOLD-CONFIG's concurrent-save handling |
| Soft-delete + version migration precedent | `EDCAP_BE/src/main/resources/db/migration/V110__alter_tbl_dim_customer_for_soft_delete_version_alias_index.sql` | read (verified `version` column, partial unique index) | high | Adds `delete_flag`, `version BIGINT NOT NULL DEFAULT 0`, and a partial unique index scoped to active rows (`ux_tbl_dim_customer_alias_active`) — direct precedent for the Code-uniqueness-among-active-rows rule |
| Soft-delete precedent (role) | `EDCAP_BE/src/main/resources/db/migration/V92__alter_tbl_role_for_soft_delete.sql` | read (via agent report) | medium | Earlier soft-delete precedent |
| Latest migration versions | `EDCAP_BE/src/main/resources/db/migration/V500__admin_audit_log.sql`, `V501__pm_dashboard_snapshot_ticket_repo_fix.sql`, `V502__pm_dashboard_snapshot_ticket_repo_fix.sql` | read (glob listing) | high | Confirms highest existing migration version is V502; V503+ free for a new THRESHOLD-CONFIG migration |
| FE admin-page reference pattern | `EDCAP_FE/src/pages/admin-audit-log/` (`AuditLogPage.tsx` + `components/` + `hooks/useAuditLogFilters.ts` + `types.ts` + `utils.ts`) | read (via agent report) | medium | Closest existing FE "admin list screen" folder shape to model a new `pages/threshold-config/` page on |
| FE CRUD-with-drawer reference pattern | `EDCAP_FE/src/pages/user/` (`UserAccountsPage.tsx`, `UserAccountsTable.tsx`, `UserAccountDrawer.tsx`) | read (via agent report) | medium | Alternate FE pattern (TanStack Query + drawer form); less structurally modern than `admin-audit-log/` |
| FE central API/type definitions | `EDCAP_FE/src/lib/api.ts` | read (via agent report) | medium | Central `endpoints` object and shared request/response types; new score-threshold endpoints would be added here |
| FE locale files | `EDCAP_FE/public/locales/en/locale.json` | read (via agent report) | medium | Existing i18n key shape (`Pages.<PageName>.*`) to follow for new labels |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE unit test on hardcoded bands | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModelsTest.java` (`score_band_thresholds_match_spec`) | read (via agent report) | Currently asserts the hardcoded boundaries; would need revisiting if `ScoreBand.fromScore()` is later made config-driven |
| FE unit/component tests | `EDCAP_FE/src/**/*.test.*`, `EDCAP_FE/src/**/*.spec.*` | not found for this area | No existing tests for `pm-dashboard` or any prospective `threshold-config` page |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| None | — | — | No external/binary references were provided or used for this ticket |

## Excluded Sources

| source/path | reason |
|---|---|
| `.env*`, `*.pem`, `*.key`, `*.p12`, `*.jks`, `*.keystore`, `*id_rsa*` | Secrets — never read, per `.claude/rules/00-safety.md §1` |
| Any file with `credential`, `secret`, or `token` in its name | Secrets — never read |
| `.git/**`, `node_modules/**`, `target/**`, build/coverage output | Repo internals / generated output, not needed |

## Source Limitations

1. `01_raw-input.md` is a Vietnamese-language PRD; some Vietnamese business terms (e.g. "ràng buộc
   đặc biệt" / "special constraint" in §3.1.4) have no defined technical meaning in the document
   itself — translated literally in `00_brainstorm.md` and flagged as an open question rather than
   guessed at.
2. `docs/architecture/overview.md`'s DB-conventions table states soft delete is "Not used — hard
   delete with cascade," and `docs/standards/database.md` lists soft delete only as an unconfirmed
   "Candidate" rule. Both statements are contradicted by real, merged migrations
   (`V92`, `V110`) and services (`CustomerService`, `OrganizationService`, `TeamService`) that
   already implement `delete_flag` + `version` soft delete in production. This spec pack treats
   the actual merged code as authoritative over the stale architecture/standards text, per this
   ticket's instruction to "bám sát với source hiện tại" (stay close to current source).
3. `docs/standards/security.md` and `docs/standards/error-handling.md` describe a "Known
   inconsistency": an `AdminController` returning an ad-hoc `Map.of("error", "ADMIN role
   required")` for 403s instead of the standard `ErrorResponse` shape. No file named
   `AdminController.java` was found in current source; the actual current pattern
   (`AdminAuditLogController.requireAdmin` → `ForbiddenException` → proper `ErrorResponse` via
   `GlobalExceptionHandler`) does not exhibit this inconsistency. This doc note appears stale;
   the spec pack follows the current, correct `ForbiddenException` pattern instead.
4. Deep-dive reads of `PmDashboardService.java`, `PmDashboardModels.java`, `PmDashboardDtos.java`,
   `EvidenceQualityScoreMapper.java`, `EDCAP_FE/src/lib/api.ts`, and the FE locale JSON files were
   performed by a research subagent and reported in summarized form rather than independently
   re-verified line-by-line by the author of this file; treat these as medium-trust until
   directly re-confirmed in Phase 3.
5. No FE/BE contract test, OpenAPI spec, or Pact-style contract artifact exists in the repo to
   verify the proposed API shape against; the API contract in `spec-pack.md` §11 is a proposal,
   not a verified existing contract.

## Assumptions from Sources

| ID | assumption | basis | risk |
|---|---|---|---|
| SRC-ASM-001 | New table should be named `tbl_dim_score_threshold`, not the PRD's literal `tbl_score_thresholds` | `database.md` `tbl_<category>_<name>` convention for V5+ dimension/master tables | Medium — needs Human Decision |
| SRC-ASM-002 | API request/response JSON should use camelCase (`minScore`/`maxScore`), not the PRD's literal snake_case sample | Every other DTO example in `api-contract.md`/`error-handling.md` uses camelCase | Medium — needs Human Decision |
| SRC-ASM-003 | Admin gating should reuse the existing `requireAdmin`/`ForbiddenException` pattern rather than introduce a new authorization mechanism | Verified in `AdminAuditLogController.java`, repeated across many `application/usecase/*` services | Low |
| SRC-ASM-004 | Concurrent-edit protection should reuse the existing `version`-column optimistic-locking pattern | Verified in `CustomerService`, `OrganizationService`, `TeamService` + `V110` migration | Medium — needs Human Decision on whether it's required for this ticket |
| SRC-ASM-005 | Scores (`From`/`To`) are whole integers 0-100 inclusive | All PRD examples use integers; no decimal example given | Medium — needs Human Decision |

## Human Confirmation Required

| ID | question | reason |
|---|---|---|
| SRC-Q-001 | Is migrating `ScoreBand.fromScore()` (BE) and `scoreBandClasses` (FE) to read from the new config table in scope for this ticket? | Determines whether this is a CRUD-only ticket or also touches `EvidenceQualityScoreService`/`PmDashboardService`/FE `pm-dashboard` |
| SRC-Q-002 | What does "Code editable only for new configs or without special constraints" mean, and which codes (if any) are protected from renaming? | Raw input never defines this; UI in the same document shows Code as always-editable |
| SRC-Q-003 | Should the table be `tbl_score_thresholds` (as literally written in the PRD) or `tbl_dim_score_threshold` (per the documented naming convention)? | Affects the migration filename and all downstream references |
| SRC-Q-004 | Should the API body use camelCase or the PRD's literal snake_case? | Affects DTO field names and FE type definitions |
| SRC-Q-005 | Should Operations Manager (named as a user in §1.2) have edit rights, or view-only? | Raw input never assigns an explicit permission to this second persona |
| SRC-Q-006 | Are scores integer-only, and is there a minimum/maximum band count? | Raw input's examples are all integers with exactly 5 bands, but no explicit rule is stated either way |
