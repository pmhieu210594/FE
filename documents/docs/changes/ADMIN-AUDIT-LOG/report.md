# Final Report

**Ticket ID**: ADMIN-AUDIT-LOG
**Create date**: 2026-07-09
**Author**: Claude
**Update date**: 2026-07-10 (Phase 8)

## 1. Edited summary

Added a centralized, append-only Admin Audit Log capability for the 7 existing admin/master-data screens (Role, Organization, Customer, Project, Repository, Team, Member/User) plus login/logout/login-failure events. Mid-implementation, the design was changed (human-confirmed) to extend the existing, previously-unused `tbl_fact_access_log` table via `V500__admin_audit_log.sql` instead of creating a new `tbl_admin_audit_log` table. A centralized `AdminAuditLogService` + `AuditMaskingHelper` writes best-effort audit rows (business transaction never rolled back by an audit-write failure), and a new GET-only `AdminAuditLogController` exposes list/detail APIs. FE scope, originally deferred, was pulled in mid-ticket: a read-only "Admin Audit Log" screen (filter bar, table, detail drawer) was added under `EDCAP_FE/src/pages/admin-audit-log/`.

**Current status: NEEDS_UPDATE, not release-ready.** BE/FE regression suites are green and the core write/read paths are implemented for all 10 ACs, but the independent human review (`human-review.md`, 2026-07-10) found that the summary-card UI required by AC-ADMIN-AUDIT-LOG-9 is implemented as a component but **not mounted on `AuditLogPage`**, so it is not actually visible to users. The Phase 7 black-box test case set (20 cases) also has zero recorded executions — only unit/controller/FE-unit tests have run.

## 2. Corresponding specification / AC

| ACID | status | evidence |
|---|---|---|
| AC-ADMIN-AUDIT-LOG-1 (CREATE audit) | Implemented, unit-tested | `AdminAuditLogService.logCreate` wired into all 7 CRUD services; `AdminAuditLogServiceTest` PASS |
| AC-ADMIN-AUDIT-LOG-2 (UPDATE audit, before/after) | Implemented, unit-tested | `logUpdate` hook; `AdminAuditLogServiceTest` PASS |
| AC-ADMIN-AUDIT-LOG-3 (DELETE audit, null after_value) | Implemented, unit-tested | `logDelete` hook; `AdminAuditLogServiceTest` PASS |
| AC-ADMIN-AUDIT-LOG-4 (no raw secrets) | Implemented, unit-tested | `AuditMaskingHelperTest` PASS; whitelist drops password/token/secret/apiKey/credential fields |
| AC-ADMIN-AUDIT-LOG-5 (FAILED CRUD row, safe message) | Implemented, unit-tested (fix applied) | `logCrudFailure`; sanitizer regex fix applied and verified (see §5) |
| AC-ADMIN-AUDIT-LOG-6 (login success audit) | Implemented, unit-tested | `logLoginSuccess` in `AuthService.login()`; `AdminAuditLogServiceTest` PASS |
| AC-ADMIN-AUDIT-LOG-7 (login failure audit) | Implemented, unit-tested (fix applied) | `logLoginFailure`; sanitizer fix verified |
| AC-ADMIN-AUDIT-LOG-8 (read-only paginated list API) | Implemented, unit/controller-tested | `AdminAuditLogControllerTest` PASS; FE `AuditLogTable` renders |
| AC-ADMIN-AUDIT-LOG-9 (filters/search/summary counts) | **Partially implemented — Open finding M1** | List/search implemented and tested; summary-card component exists but is **not rendered on `AuditLogPage`** (Human Review, 2026-07-10) |
| AC-ADMIN-AUDIT-LOG-10 (read-only detail API + diff view) | Implemented, unit/controller-tested | `AdminAuditLogControllerTest` PASS; FE `AuditLogDetailDrawer.test.tsx` PASS |

## 3. Scope of influence

- **Directly changed**: new `AdminAuditLogService`, `AdminAuditLogWriter`, `AuditMaskingHelper`, `AdminAuditLogPersistencePort`/JDBC adapter, `AdminAuditLogController`, `AdminAuditLogDtos`; audit hooks added to `RoleService`, `OrganizationService`, `CustomerService`, `ProjectService`, `RepositoryService`, `TeamService`, `UserAccountAdminService`, `AuthService`; new migration `V500__admin_audit_log.sql` (`ALTER TABLE tbl_fact_access_log`, append-only trigger).
- **FE (scope-expanded)**: new `EDCAP_FE/src/pages/admin-audit-log/**` (page, filter bar, table, summary cards, detail drawer, hooks, utils, types), `App.tsx` route (admin-gated), `Layout.tsx` nav entry, locale keys for en/vi/ja.
- **Not touched / unaffected**: all 7 existing CRUD API contracts, `/api/v1/auth/login`/`logout` contracts, the 6 existing dimension tables, `V4__init_shema_v2.sql` (no edit), batch/job/event infrastructure, session/token management. See `impact-analysis.md` §14 for full evidence table.
- **Full detail**: `impact-analysis.md`.

## 4. Implementation content

| file | summary | reasons |
|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V500__admin_audit_log.sql` | `ALTER TABLE tbl_fact_access_log` — rename/add columns, indexes, append-only trigger | Reuse dormant table instead of creating `tbl_admin_audit_log` (human-confirmed mid-implementation) |
| `.../governance/AuditMaskingHelper.java` | Whitelist-based secret masking | AC-4 |
| `.../governance/AdminAuditLogModels.java` | Entry/filter/list-item/detail records | Shared shape for port/service/DTOs |
| `.../port/out/persistence/AdminAuditLogPersistencePort.java` | Persistence contract | Decouple service from SQL |
| `.../infrastructure/persistence/adapter/AdminAuditLogJdbcAdapter.java` | JDBC insert/search/detail | AC-1..10 |
| `.../governance/AdminAuditLogWriter.java` | `NESTED`/`REQUIRES_NEW` transaction boundary | Best-effort writes never roll back the business transaction |
| `.../governance/AdminAuditLogService.java` | Central write/read orchestration | AC-1..10 |
| `{Role,Organization,Customer,Project,Repository,Team,UserAccountAdmin}Service.java` | Added create/update/delete/read/failure audit hooks | AC-1..5 |
| `AuthService.java` | Added login-success/login-failure/logout hooks | AC-6..7 |
| `.../web/rest/AdminAuditLogController.java` | GET-only list/detail controller | AC-8..10 |
| `.../web/dto/AdminAuditLogDtos.java` | New DTOs | AC-8..10 |
| 8 existing unit/integration test files | Updated to inject `AdminAuditLogService` mock | Keep existing regression suite compiling/green |
| `EDCAP_FE/src/lib/api.ts` | `endpoints.adminAuditLogs.list()`/`.detail()` | AC-8..10 |
| `EDCAP_FE/src/pages/admin-audit-log/**` (types, utils, hooks, `AuditLogFilterBar`, `AuditLogSummaryCards`, `AuditLogTable`, `AuditLogDetailDrawer`, `AuditLogPage`) | New read-only screen | AC-8..10, but see AC-9 gap in §2 |
| `EDCAP_FE/src/App.tsx`, `Layout.tsx`, `public/locales/{en,vi,ja}/locale.json` | Route, nav, i18n | Admin-gated discoverability |

Full list with reasons: `self-review.md` §3.

## 5. Review results

| review type | result | notes |
|---|---|---|
| Self Review | Implemented, NOT verified (own verdict) | `self-review.md` §12: "NOT yet ready for a 'verified' release verdict" — flagged `TEST_COVERAGE_GAP` (later closed by Phase 6 unit tests) and `FE_VERIFICATION_GAP` (browser E2E now exists but is mock-based only, see below) |
| Independent AI Review (Codex) | **未確認 for this ticket** | `codex-review.md` present in this ticket folder is for a **different ticket (PARSER-SPEC-PACK)** — it is stale/misplaced, not an ADMIN-AUDIT-LOG review. No independent AI review artifact exists for this ticket as of this report. Treat as a documentation gap, not as an approval. |
| Human Review (Codex acting as reviewer) | **NEEDS_UPDATE** | `human-review.md`, 2026-07-10: read-only journey (list/filter/detail/pagination) confirmed via Playwright E2E (mock-based). Finding **M1 (Major, Open)**: `AuditLogSummaryCards` is not rendered on `AuditLogPage`, so AC-ADMIN-AUDIT-LOG-9's summary-count requirement is not actually exposed on screen. Finding M2 (Closed): E2E spec covers the read-only journey correctly. |

## 6. Test results

- **BE unit/controller** (`AuditMaskingHelperTest`, `AdminAuditLogServiceTest`, `AdminAuditLogControllerTest`): PASS, after one remediation (sanitizer redaction fix, see §7).
- **BE full regression** (`mvn test`, self-review §4): PASS, 125/125 + 134/134 relevant suites, no regressions.
- **FE unit** (`npm run test:unit`): PASS, 275/275 tests including new admin-audit-log utility/summary-card/detail-drawer tests.
- **FE typecheck/lint/build** (`tsc`, `eslint`, `vite build`): PASS.
- **Black-box test cases** (`blackbox-testcases.md`, 20 cases): **0 executed** — still `Draft` status. Automated tests only partially overlap the black-box scenarios (see `test-results.md` §11 for the reconciliation table).
- **DB migration / append-only trigger**: not executed against a live Postgres instance in this workspace phase.
- **Browser E2E**: a Playwright spec exists (`admin-audit-log.spec.ts`) and passes, but only against **mocked** API responses, not a live/staging backend.
- Full detail: `test-results.md`.

## 7. Security / operations perspective

- Masking is centralized in `AuditMaskingHelper` (whitelist-drop of password/token/secret/apiKey/credential-named fields); verified at unit level only, not yet against a live DB round-trip.
- Append-only enforced via a `BEFORE UPDATE OR DELETE` trigger rather than the originally planned `REVOKE`/`GRANT` — the single app DB role (`sdd`) owns the table so `REVOKE` would not work. This is a documented deviation from the spec's literal wording (self-review §5, §10) and has **not been executed against a live database** (BB-013 not run).
- Audit-write failures are best-effort (`NESTED`/`REQUIRES_NEW` propagation) and must never block the business operation — implemented, but BB-014 (forced-failure scenario) has not been executed.
- `traceId` read from MDC on every audit entry for correlation; audit-write failures are logged via SLF4J only, never surfaced to the caller.
- Read-only API access is intended to be restricted to `AUDIT_READ` permission, but the 401/403 negative-path black-box cases (BB-011, BB-012) have not been executed.
- No PII/secret values are intended to appear in error messages (BB-020); verified only for the specific sanitizer-fix case, not the full scenario matrix.

## 8. Accepted risk

| risk | impact | owner | deadline | status | approver |
|---|---|---|---|---|---|
| DB-level append-only trigger unexercised against a live Postgres instance | Medium — immutability guarantee not confirmed end-to-end | Ticket owner | Before release | OPEN | Tech Lead |
| Black-box case set (BB-001..020) has zero recorded executions | Medium — permission, immutability, idempotency, boundary, and Unicode behavior are unverified beyond unit level | Ticket owner | Before release | OPEN | Tech Lead |
| FE E2E is mock-based only, not run against a live/staging backend | Medium — real integration behavior (auth headers, real pagination, real filter semantics) unconfirmed | Ticket owner | Before merge | OPEN | Tech Lead |
| Summary-card counts (AC-9) computed client-side from current page only, no BE aggregate endpoint | Medium — does not fully satisfy AC-9's literal "summary cards for the current filter" wording, even once mounted | Ticket owner | Before release / follow-up ticket | OPEN | Tech Lead |
| Table reuse (`tbl_fact_access_log` instead of new `tbl_admin_audit_log`) | Low — resolved via human decision, docs updated | Ticket owner | N/A | RESOLVED | User (session decision) |

## 9. Open Issues

| issue | impact | next action |
|---|---|---|
| **AC-ADMIN-AUDIT-LOG-9 summary cards not mounted on `AuditLogPage`** (Human Review M1, Major) | Users cannot see summary counts at all in the current build | Mount `AuditLogSummaryCards` on `AuditLogPage`, or get explicit human decision to defer AC-9's summary-card requirement to a follow-up ticket |
| No independent AI review artifact exists for this ticket | `codex-review.md` in this folder belongs to a different ticket; a proper ADMIN-AUDIT-LOG independent review has not been produced | Run/record a dedicated independent AI review for ADMIN-AUDIT-LOG before human sign-off |
| Black-box case execution (20 cases, `blackbox-testcases.md`) | Release-readiness for permission, immutability, idempotency, and boundary behavior is unconfirmed | Execute BB-011..020 at minimum (P0 permission + immutability + audit-write-failure cases) before release |
| DB migration/trigger not run against live Postgres | Cannot confirm append-only enforcement works as designed | Run migration + BB-013 against a disposable Postgres instance |
| Summary-count endpoint gap (self-review §8) | FE summary cards, once mounted, only reflect the current page, not the full filtered set | Decide whether a dedicated `GET /api/v1/admin/audit-logs/summary` endpoint is required for AC-9 |

## 10. Human Decisions

| decision | owner | result |
|---|---|---|
| Reuse `tbl_fact_access_log` instead of creating `tbl_admin_audit_log` | User (session decision) | Locked — RESOLVED |
| READ logging scope limited to detail views of Role/Member-User/Organization only | Ticket owner | Locked |
| `actor_user_id` FK is nullable | Ticket owner | Locked |
| Pull FE scope into this ticket (originally deferred) | User (session decision) | Locked |
| **Whether AC-ADMIN-AUDIT-LOG-9 must be implemented (summary cards mounted + possibly a BE aggregate endpoint) in this phase, or explicitly deferred** | Ticket owner / Tech Lead | **Pending** — required before Phase 8 can close as DONE |

## 11. Exception Record Summary

| exception_type | source_section | reason | approved_by_role | expiry | follow_up | status |
|---|---|---|---|---|---|---|
| `NO_VERIFY` | Section 6, Section 8 | Black-box case set (`blackbox-testcases.md`, 20 cases) has zero recorded executions; DB append-only trigger not run against a live Postgres instance | Tech Lead | Before release | Execute at minimum BB-011/012 (permission), BB-013 (immutability), BB-014 (audit-write-failure), BB-015 (READ-scope) | OPEN |
| `NO_VERIFY` | Section 5, Section 9 | No independent AI review artifact exists for this ticket; `codex-review.md` found in the folder belongs to a different ticket (PARSER-SPEC-PACK) | Tech Lead | Before human sign-off | Run/record a dedicated independent AI review for ADMIN-AUDIT-LOG | OPEN |
| `CI_SKIP` | Section 6 | Browser E2E (`admin-audit-log.spec.ts`) passes only against mocked API responses, not a live/staging backend | Tech Lead / QA Lead | Before merge | Re-run E2E against a live/staging backend | OPEN |
| `NO_VERIFY` | Section 2 (AC-9), Section 9 | `AuditLogSummaryCards` implemented and unit-tested but not mounted on `AuditLogPage`; AC-ADMIN-AUDIT-LOG-9 not actually visible to users | Tech Lead / Ticket owner | Before release | Mount the component, or get explicit human decision to defer AC-9 to a follow-up ticket | OPEN |

## 12. Source Analysis Limitations

- `codex-review.md` and `promotion-candidates.md` found in this ticket's folder at the start of Phase 8 were content from a **different ticket (PARSER-SPEC-PACK)** — they were not used as evidence for ADMIN-AUDIT-LOG. `promotion-candidates.md` has been rewritten below/as a separate file for this ticket; a proper independent AI review for ADMIN-AUDIT-LOG is still 未確認 (missing).
- No live database was available in this workspace phase; DB-level claims (trigger enforcement, FK behavior under real constraints) rely on DDL review only, not execution evidence.
- No live/staging backend was available for a real browser E2E run; the Playwright spec result reflects mocked-API behavior only.

## 13. What worked

- Reading current source before writing docs kept every artifact grounded (e.g., discovering `tbl_auth_user_account` instead of the assumed `tbl_dim_member`/`tbl_dim_user`, and discovering the dormant `tbl_fact_access_log` table in Phase 5).
- Centralizing masking and audit-write orchestration (`AuditMaskingHelper`, `AdminAuditLogWriter`) kept the security-critical logic in one reviewable place instead of scattered per-service.
- Treating unresolved schema mismatches as explicit open issues (rather than guessing) avoided a wrong FK design being written into a migration.
- Keeping CRUD/auth audit hooks additive (no existing endpoint contract changes) meant zero regression risk to the 7 existing CRUD + auth flows, confirmed by the full regression suite staying green.

## 14. What failed

- A component (`AuditLogSummaryCards`) being implemented and unit-tested was treated as equivalent to the AC being satisfied, but it was never wired into the page that ships to users — the self-review's "Implemented (BE+FE)" status for AC-9 was optimistic ahead of actual UI composition verification.
- The Phase 7 black-box test case list (20 cases, several P0) was authored but never executed; test-results.md previously read as "PASS" for Phase 6 without making clear that black-box execution was a separate, still-open gate.
- No independent AI review was actually produced for this ticket; a leftover file from a prior ticket sat in the folder without being flagged until Phase 8 reconciliation.

## 15. Candidate updates Failure Mode Index

| candidate | trigger | prevention | detection |
|---|---|---|---|
| Component built + unit-tested but never mounted on the page | A new UI component is added and tested in isolation, then the composing page is not updated in the same change | Require a page-level "renders X" test (or manual click-through) whenever an AC explicitly requires a visible UI element | Human/browser review of the actual composed screen, not just component-level test pass |
| "PASS" test-results read as full release readiness when black-box cases are still Draft | Test-results.md reports Phase 6 automated-suite PASS without a companion black-box execution-status section | Always include a black-box execution reconciliation table before declaring a test phase "done" | Phase 8 report synthesis cross-checking `test-results.md` against `blackbox-testcases.md` case statuses |
| Stale artifact from a prior ticket left in a new ticket's folder and silently treated as this ticket's review | Ticket folders are created by copying a template/previous ticket structure without clearing prior content | Verify the Ticket ID header of every artifact matches the current ticket before treating it as evidence | Phase 8 synthesis reading each input file's own Ticket ID field |
| DB-level enforcement (append-only trigger) undocumented as unverified until final report | Spec/design docs describe a DDL mechanism but no execution environment exists in the workspace | Explicitly track DB-dependent ACs as "reviewed, not executed" through every phase, not just at Phase 8 | Cross-check `impact-analysis.md`/`review-checklist.md` DB items against actual test execution logs |

## 16. Candidate updates Living Docs

| candidate | target doc | reason |
|---|---|---|
| `tbl_fact_access_log` reuse pattern (rename/extend a dormant table instead of creating a new one) | `docs/architecture/repository-db-map.md` | Prevents a future ticket from re-discovering this table from scratch or creating a duplicate audit table |
| Append-only enforcement via `BEFORE UPDATE OR DELETE` trigger (not `REVOKE`/`GRANT`) when a single DB role owns all tables | `docs/standards/database.md` | This codebase's single-role setup makes `REVOKE` ineffective; worth codifying as the standard pattern |
| Best-effort audit write via `NESTED`/`REQUIRES_NEW` transaction propagation | `docs/architecture/service-layer-map.md` | Reusable pattern for any future "side-effect write must never roll back the main transaction" requirement |
| AC-to-UI-mount verification step | `docs/standards/testing.md` | This ticket's AC-9 gap shows unit tests + component existence is not sufficient evidence a UI requirement is met |

## 17. Final Verdict

- **NEEDS_UPDATE** — not ready to close Phase 8. Blocking items before DONE: (1) resolve AC-ADMIN-AUDIT-LOG-9 summary-card mounting (Human Review M1), (2) produce a real independent AI review for this ticket, (3) execute at minimum the P0 black-box cases (permission BB-011/012, immutability BB-013, audit-write-failure BB-014, READ-scope BB-015) before release sign-off.
