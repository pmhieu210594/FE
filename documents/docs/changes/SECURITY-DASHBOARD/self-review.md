# Self Review

**Ticket ID**: SECURITY-DASHBOARD
**Create date**: 2026-07-02
**Author**: OpenAI
**Update date**: 2026-07-03 (implementation pass by Claude)

---

## 1. Implementation Summary

Implemented a read-only Security Dashboard (BE + FE) that aggregates existing V4 metadata. No new tables, no migration, no write path.

- **Safety Pack**: repository-level KPI (READY/WARNING/MISSING counts), derived from the latest `tbl_fact_safety_pack_status.scan_status` row per repository.
- **Secret Scan**: ticket-level KPI (PASS/FAIL), derived from the latest `tbl_fact_security_scan.scan_status` row per ticket where `scanner_type = 'SECRET'`.
- **SAST/SCA**: ticket-level KPI (PASS/WARNING/FAIL), same pattern for `scanner_type IN ('SAST','SCA')`.
- **Security Checklist**: ticket-level KPI (valid/invalid section counts), derived from `tbl_fact_artifact_parsed_section` joined to the existing `REVIEW_CHECKLIST` artifact type (the same artifact type PM Dashboard snapshots already reuse) — no new artifact type or parser was introduced.
- **Security Exception**: ticket-level KPI (open/total), derived from `tbl_fact_exception.follow_up_status`.
- **Final Security Verdict**: intentionally **not calculated**. Every ticket row and detail response returns the literal `"NOT_CONFIGURED"` — see §8 below.
- Existing Dashboard components reused: `SummaryCard`, `DashboardFilterPill`, `DashboardSearchHeader`, `RoleTabs`, `Drawer`/`Card`/`Badge` UI primitives, `GlobalExceptionHandler`, `TraceIdFilter`, `SecurityConfig`, `NotFoundException`.
- Existing V4 tables reused as-is: `tbl_dim_project`, `tbl_dim_repository`, `tbl_dim_ticket`, `tbl_fact_safety_pack_status`, `tbl_fact_security_scan`, `tbl_fact_exception`, `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section`, `tbl_dim_artifact_type`.
- Existing Security modules (ingestion, scan execution, checklist parser, exception lifecycle) were not touched.
- Out-of-scope items (Secret Scan/SAST/SCA execution, Security Exception CRUD, AI Security Analytics, Security Score, export) intentionally left unimplemented, matching spec-pack §2.2 and impl-plan §13.

---

## 2. Specification / AC Matching

| AC ID | Status | Evidence |
|---|---|---|
| AC-SECURITY-DASHBOARD-1 | Done | `SecurityDashboardPage.tsx` renders via `security-dashboard` route; `npm run build` succeeds |
| AC-SECURITY-DASHBOARD-2 | Done | `SecurityDashboardJdbcAdapter.findSafetyPackCounts`; `SecuritySummaryCards` card |
| AC-SECURITY-DASHBOARD-3 | Done | `findSecretScanCounts`; ticket table `secretScanStatus` column |
| AC-SECURITY-DASHBOARD-4 | Done | `findSastScaCounts`; ticket table `sastStatus`/`scaStatus` columns |
| AC-SECURITY-DASHBOARD-5 | Done | `findChecklistCounts`; ticket table `checklistStatus` column; drawer checklist section list |
| AC-SECURITY-DASHBOARD-6 | Done | `findExceptionCounts`; ticket table `exceptionStatus` column; drawer exception list |
| AC-SECURITY-DASHBOARD-7 | Done | `SecurityFilterBar` (project/repository/safety/secret/SAST/exception filters) wired to `GET /tickets` |
| AC-SECURITY-DASHBOARD-8 | Done | `SecurityTicketDetailDrawer` + `GET /tickets/{ticketId}` |
| AC-SECURITY-DASHBOARD-9 | Done | No migration added; adapter reads only existing V4 tables (verified by compile + manual SQL review) |
| AC-SECURITY-DASHBOARD-10 | Done | No `INSERT`/`UPDATE`/`DELETE` anywhere in the new code; `@Transactional(readOnly = true)` on every service method |

Final Security Verdict is displayed (spec §6.3 output item) but always as `NOT_CONFIGURED` — see §8 Unprocessed/Accepted Risk. This is a deliberate partial implementation of AC-1, agreed with the user before implementation began, not a silent gap.

---

## 3. List of Changed Files

| file | summary | reason |
|---|---|---|
| `EDCAP_BE/.../application/usecase/securitydashboard/SecurityDashboardModels.java` | New domain records (filter, counts, ticket row/page, ticket detail) | AC-2~10 |
| `EDCAP_BE/.../application/port/out/persistence/SecurityDashboardRepositoryPort.java` | New read-only repository port | AC-9, AC-10 |
| `EDCAP_BE/.../infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java` | New JDBC adapter, read-only SQL over existing V4 tables | AC-2~10 |
| `EDCAP_BE/.../application/usecase/securitydashboard/SecurityDashboardService.java` | New service: filter validation/normalization, zero-value KPI on empty data | AC-7, AC-10 |
| `EDCAP_BE/.../web/dto/SecurityDashboardDtos.java` | New REST response DTOs | AC-1 |
| `EDCAP_BE/.../web/rest/SecurityDashboardController.java` | New REST controller: `/api/v1/security/dashboard/{summary,tickets,tickets/{id}}` | AC-1, AC-7, AC-8 |
| `EDCAP_BE/src/test/.../securitydashboard/SecurityDashboardServiceTest.java` | New unit tests (12 cases: zero-state, pass-through, not-found, filter validation) | AC-2~10 |
| `EDCAP_FE/src/pages/security-dashboard/types.ts` | New FE types mirroring BE DTOs | — |
| `EDCAP_FE/src/pages/security-dashboard/utils.ts` | Status → badge color/label mapping | — |
| `EDCAP_FE/src/pages/security-dashboard/SecurityDashboardPage.tsx` | New page (filters, summary, table, drawer wiring) | AC-1 |
| `EDCAP_FE/src/pages/security-dashboard/components/SecuritySummaryCards.tsx` | KPI cards | AC-2~6 |
| `EDCAP_FE/src/pages/security-dashboard/components/SecurityFilterBar.tsx` | Project/repository/status filters | AC-7 |
| `EDCAP_FE/src/pages/security-dashboard/components/SecurityTicketTable.tsx` | Ticket-level table | AC-8 |
| `EDCAP_FE/src/pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx` | Read-only ticket detail drawer | AC-8 |
| `EDCAP_FE/src/lib/api.ts` | Modify: added `endpoints.securityDashboard.{summary,tickets,ticketDetail}` | FE-BE contract |
| `EDCAP_FE/src/App.tsx` | Modify: registered `security-dashboard` route | AC-1 |
| `EDCAP_FE/src/components/dashboard/RoleTabs.tsx` | Modify: activated the existing (previously inert) "security" tab | AC-1 |
| `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Modify: added `Pages.SecurityDashboard.*` translation keys | i18n policy |

No existing Security module file was modified.

---

## 4. Run Command and Results

| command | result | note |
|---|---|---|
| `mvn -o compile` | PASS | BUILD SUCCESS, no errors |
| `mvn -o test -Dtest=SecurityDashboardServiceTest` | PASS | 12/12 tests, 0 failures |
| `npx tsc --noEmit` (FE) | PASS | no type errors |
| `npx eslint src/pages/security-dashboard/** src/App.tsx src/components/dashboard/RoleTabs.tsx` | PASS | 0 errors after `--fix` (formatting only) |
| `npm run build` (FE) | PASS | `tsc && vite build` succeeded; pre-existing chunk-size warning only |

Not run: full `mvn test` (whole BE suite) and full FE `vitest` suite were not executed in this pass — only the new test class was run in isolation, plus compile/build for the rest of the codebase. Recommend running the full suites before merge to catch any incidental interaction; scope of this change is additive-only so risk is assessed as low (see §8).

---

## 5. Self-Check using Review Checklist

| checklist area | result | note |
|---|---|---|
| Specification / AC Matching | Pass (with 1 accepted risk) | Final Security Verdict shipped as `NOT_CONFIGURED`, see §8 |
| General System Review | Pass | Filter validation (enum allow-lists, search length, page/size clamps) in `SecurityDashboardService.normalize` |
| FE Review | Pass | Reused `SummaryCard`, `DashboardFilterPill`, `DashboardSearchHeader`, `Drawer`, `Card`, `Badge`; empty-state and loading rows in table |
| BE / API Review | Pass | Thin controller, aggregation in service, read-only repository, existing exception handler/DTO pattern reused |
| DB / Migration Review | Pass | No new table, no Flyway migration, no write SQL anywhere in the adapter |
| Security / Privacy Review | Pass | Reuses existing `SecurityConfig`/auth; no new persistence; no raw secrets exposed (only aggregate counts/statuses) |
| Operation / Maintenance Review | Pass | Reuses `TraceIdFilter`, existing logging, existing Safety Pack/Scan/Checklist/Exception modules untouched |
| Test Review | Partial | Unit tests added for service layer (12 cases); no repository/controller integration test added in this pass (see §8) |
| Documentation / Traceability Review | Pass | This file + AC table above |
| Release / Rollback Review | Pass | Rollback = revert this diff only; no DB rollback needed |

---

## 6. Test Plan Corresponding Status

- Backend Unit Tests: Done (`SecurityDashboardServiceTest`, 12 cases covering zero-state, pass-through, not-found, and all four enum validations).
- Repository Tests: Not done — no `*IntegrationTest` added for `SecurityDashboardJdbcAdapter` in this pass (see §8).
- Controller Tests: Not done — no `SecurityDashboardControllerTest` added in this pass (see §8).
- API Integration Tests: Not done (requires a running DB fixture; deferred).
- Frontend Unit Tests: Not done — no `*.test.tsx` added in this pass.
- Frontend Integration Tests: Not done.
- Black-box Tests: Not done — recommend adding to `blackbox-testcases.md` before independent review.
- Manual Verification: Not done — dev server was not started/clicked through in this pass; recommend before human review (per skill `/run` or manual `npm run dev`).
- Regression Tests: `mvn -o compile` and full FE `tsc`/`build` confirm no compile-time regression; existing Security/Dashboard modules were not modified.

---

## 7. Bugs Found and Resolved

| bug | cause | fix | test |
|---|---|---|---|
| Would-be 500 instead of 404 on missing ticket | `ResponseStatusException` is swallowed by the catch-all `@ExceptionHandler(Exception.class)` in `GlobalExceptionHandler` (no explicit handler for it) | Used existing `com.sdd.platform.domain.exception.NotFoundException` instead, which the handler already maps to 404 | `getTicketDetail_throwsNotFound_whenMissing` |

---

## 8. Unprocessed / Pending / Accepted Risk

| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| Final Security Verdict | H-SECURITY-1 / OI-SECURITY-1 still Open; impl-plan §12 explicitly lists this as a Stop condition. Implemented as literal `"NOT_CONFIGURED"` placeholder (not a fabricated formula) so the dashboard ships without inventing an unapproved business rule. Agreed with requester before implementation. | Medium — AC-1's "Final Security Verdict" output is visibly a placeholder, not a real calculation | PM | TBD |
| Security Alert rule | H-SECURITY-2 / OI-SECURITY-2 still Open | Medium — no Security Alert KPI was added to the dashboard at all (out of scope until rule is defined) | PM | TBD |
| Exception Priority | H-SECURITY-3 / OI-SECURITY-4 still Open | Low — exception rows are shown unordered by priority | PM | TBD |
| Checklist Weighting | OI-SECURITY-5 still Open | Medium — checklist KPI is a simple valid/invalid section count, not a weighted score | PM | TBD |
| Export Capability | OI-SECURITY-3 still Open | Low — Export button shows a "not available yet" message instead of producing a CSV | PM | TBD |
| Security Score | Explicitly out of scope (spec §2.2, impl-plan §13) | None | PM | N/A |
| Repository/Controller/FE test coverage | Not added in this implementation pass due to time-boxing | Medium — recommend adding before/during independent review | Reviewer | Before merge |
| Manual UI verification | Dev server not exercised in this pass | Medium — recommend a manual click-through before human review | Reviewer | Before human review |

---

## 9. AI-generated Predictions

- Existing Dashboard architecture (QA/PM/Dev/DataOps pattern: Controller → Service → Port → JDBC Adapter → DTO) was directly reusable with no structural changes needed.
- Ticket → repository linkage required a derived CTE (`ticket_repo`) since `tbl_dim_ticket` has no `repository_id` column; this is inferred from `tbl_fact_security_scan`, `tbl_fact_artifact_snapshot`, and `tbl_fact_exception`, in that priority order. This is a reasonable but unverified assumption — worth confirming with a human reviewer that this priority order matches how other dashboards resolve the same ticket→repository relationship.
- Security Checklist = the existing `REVIEW_CHECKLIST` artifact type/parser (same one PM Dashboard snapshots reuse), not a new checklist concept. Confirmed by grepping migration history (`V4`, `V330`, `V391`, `V394`) — no separate "security checklist" artifact type exists in the schema.
- Safety Pack/Secret Scan/SAST/SCA status enums (`READY`/`WARNING`/`MISSING`, `PASS`/`FAIL`, `PASS`/`WARNING`/`FAIL`) were confirmed directly from `SecurityEvidenceIngestService`/`GithubSecurityEvidenceSnapshotService` source code, not guessed.

---

## 10. Items Reviewed by Humans

> Fill after Human Review.

- Final Security Verdict placeholder acceptance (`NOT_CONFIGURED`).
- `ticket_repo` derivation priority order (security_scan → artifact_snapshot → exception).
- Security Checklist KPI definition (valid/invalid section count vs. a future weighted score).
- Whether repository/controller/FE tests must be added before this can proceed to independent review.

---

## 11. Final Self Verdict

NEEDS_UPDATE — implementation matches spec-pack and impl-plan for all in-scope ACs, compiles and passes the tests that were written, but repository/controller/FE test coverage and manual UI verification are still outstanding (§8), and the Final Security Verdict placeholder needs explicit human sign-off before this proceeds to independent/human review.
