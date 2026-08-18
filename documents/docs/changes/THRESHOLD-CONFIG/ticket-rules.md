# Ticket Rules:

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-21

## Must Follow

- Do not add specifications not included in the spec-pack.
- Ambiguous points must be returned as Open Issues.
- Before implementation, read the target source and existing tests.
- Follow existing patterns.
- Do not reuse obvious errors, vulnerabilities, or existing SonarLint violations.
- Check for full-width numbers, half-width numbers, empty strings, nulls, digits, and precision.
- Business code values should be in enum/constant/master format instead of magic numbers.
- Do not export secrets/PII to logs.
- Reuse the existing `requireAdmin(AppUser caller)` → `ForbiddenException("Component.Permission.Denied")` pattern for both `GET` and `POST /api/v1/score-thresholds` — do not introduce a new authorization mechanism (`context.md` → Allowed common components).
- Reuse the existing `version`-column optimistic-locking pattern (`CustomerService`/`OrganizationService`/`TeamService`) for concurrent-save conflict detection, per HD-THRESHOLD-CONFIG-6.
- Reuse the existing soft-delete (`delete_flag`) convention, not hard delete, per `V92`/`V110` precedent.
- Follow the hexagonal flow `web (thin controller) → application (@Service, @Transactional) → application port → infrastructure (@Repository JDBC adapter)`, matching `ArtifactScannerService`/`ArtifactScannerPersistencePort`/`DataOpsDashboardJdbcAdapter`.
- FE must call through `EDCAP_FE/src/lib/api.ts` only; use TanStack Query for list/save; Edit-Mode on/off toggle is local/Zustand UI state only, never the fetched threshold rows.
- All three existing hardcoded duplicate copies of the 5 band names (`ScoreBand` enum, `PmDashboardService.VALID_SCORE_BANDS`, `EvidenceQualityScoreMapper.toDisplayBand`) must be addressed together when implementing HD-THRESHOLD-CONFIG-1 — do not fix only one and leave the others stale.
- Wrap every create/update/soft-delete in the new service with the same audit-log calls (`adminAuditLogService.logCreate/logUpdate/logDelete/logCrudFailure`) used by `CustomerService`.

## Must Not Do

- Do not implement any Code-editing-restriction rule ("only for new configs or without special constraints") — explicitly deferred by HD-THRESHOLD-CONFIG-2 (BR-THRESHOLD-CONFIG-011). Code remains freely editable subject only to BR-THRESHOLD-CONFIG-007/008/009.
- Do not implement restore/undelete of soft-deleted bands, physical (hard) delete, or any historical/audit reporting UI beyond `delete_flag`/`updated_at` — out of scope per spec-pack §2.2.
- Do not grant any access (view or edit) to Operations Manager or any non-`ADMIN` role — closed by HD-THRESHOLD-CONFIG-5.
- Do not extend the `ScoreBand` Java enum with new constants, and do not add any new exhaustive `switch`/pattern-match over the fixed 5 constants — per spec-pack §5, the enum must be replaced by a dynamic `code`-string-keyed representation.
- Do not add a Spring Security `@PreAuthorize` annotation expecting it to work — `SecurityConfig` has no role-based filter-chain gating; role checks must be explicit in code.
- Do not place fetched threshold rows in a Zustand store — server data must go through TanStack Query only (`store/uiStore.ts` doc-comment).
- Do not call `fetch` directly from any FE component — all calls go through `lib/api.ts`.
- Do not make the Cancel/Revert button call any backend API — it must be a pure client-side state revert (BR-THRESHOLD-CONFIG-004).

## Stop / Ask Conditions

- If the follow-up FE grep (context.md Assumption A-CTX-1) finds hardcoded Tailwind class strings duplicating `scoreBandClasses` outside `pm-dashboard/utils.ts` — stop and confirm the real FE blast radius before estimating rewiring work, since spec-pack's original consumer list (`PMDashboardPage`, `ProjectPage`, `TraceabilityPage`) was found inaccurate.
- If `PmDashboardModels`/`PmDashboardDtos` `scoreBand`-typed fields are found to need widening beyond their current plain `String` type — ask before proceeding (OI-THRESHOLD-CONFIG-9); current inventory suggests this may not be needed at all.
- If Open Issues OI-THRESHOLD-CONFIG-1 (integer vs decimal scores), OI-THRESHOLD-CONFIG-2 (min/max band count), or OI-THRESHOLD-CONFIG-3 (single-band validity) affect a concrete implementation decision (e.g. column type choice) — raise as a Human Decision before committing the migration, since these are currently open.
- If a caching strategy for the score-band lookup (OI-THRESHOLD-CONFIG-8) is not trivial to add without measurable risk to the `EvidenceQualityScoreService` hot path — stop and confirm the approach (in-memory cache with save-triggered invalidation vs. direct DB read) before implementing.

## Review Focus

- Verify all 3 hardcoded band-name copies (`ScoreBand` enum, `PmDashboardService.VALID_SCORE_BANDS`, `EvidenceQualityScoreMapper.toDisplayBand`) are consistently reconciled, not just one.
- Verify `requireAdmin` gating is present on **both** `GET` and `POST` endpoints, server-side (not FE-only).
- Verify gap/overlap/duplicate-Code/uppercase-Code validation runs server-side even if FE also validates client-side (BR-THRESHOLD-CONFIG-007/008/009, per spec-pack "client-side validation mirrored by server-side re-validation").
- Verify the save endpoint is atomic (single `@Transactional`, no partial commit on validation failure).
- Verify soft-delete uniqueness exclusion (`delete_flag='1'` rows excluded from Code uniqueness check) is implemented and tested (AC-THRESHOLD-CONFIG-10).
- Verify optimistic-locking conflict path returns HTTP 409, not a silent overwrite.

## Test Focus

- BE unit tests: gap/overlap/`From<=To`/duplicate-Code validation as pure functions (no DB).
- BE service tests mocking the persistence port: soft-delete/update/insert batch orchestration atomicity.
- BE `@WebMvcTest`: role-gating 403 for non-ADMIN callers on both endpoints; 400 on validation failure.
- BE integration test: partial unique index actually rejects duplicate active `Code` at the DB layer.
- BE test replacing the now-stale `EvidenceQualityScoreModelsTest.score_band_thresholds_match_spec` with a config-driven equivalent.
- BE optimistic-locking conflict test: two concurrent saves against the same `version`, second gets HTTP 409.
- FE hook/component tests: View/Edit mode toggle, Cancel with **zero** network calls, Add-band row insertion, realtime progress-bar recoloring, i18n review for no hardcoded literal strings.
- Integration test confirming a Label/Color/range change is reflected by `EvidenceQualityScoreService`/PM-dashboard consumers without redeploy (AC-THRESHOLD-CONFIG-17).
