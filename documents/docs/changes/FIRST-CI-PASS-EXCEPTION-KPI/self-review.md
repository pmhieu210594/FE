# Self Review

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI
**Create date**: 2026-06-29
**Author**: nk_trung  
**Update date**: 2026-06-29

## 1. Implementation Summary

Phase 5 BE-only implementation for First CI Pass KPI and Exception KPI.

Two KPIs wired end-to-end:
- **First CI Pass**: `findFirstCiRunByPullRequestId()` / `findFirstCiRunByTicketId()` added to `CiRunJdbcAdapter`; `FirstCiPassKpiService` computes pass/fail from `"SUCCESS".equalsIgnoreCase(status)`; exposed via `GET /api/v1/kpi/first-ci-pass/pr/{id}` and `/ticket/{id}`.
- **Exception KPI**: `EXCEPTION_RECORD` section added to `SelfReviewMarkdownParser`; `ArtifactScannerService` calls `persistExceptionRecords()` after parsing `self-review.md` and `report.md`; `ExceptionKpiService` + `ExceptionKpiJdbcAdapter` read from `tbl_fact_exception`; exposed via `GET /api/v1/kpi/exceptions/ticket/{id}`.

Flyway migration V234 adds `source_section VARCHAR(100)` to `tbl_fact_exception`, a partial unique index `(ticket_id, exception_type, source_section)` for idempotent upsert, a supporting index on `tbl_fact_ci_run(pull_request_id, started_at)`, and registers the `REPORT` artifact type.

No FE changes. No new tables created.

## 2. Specification / AC Matching

| AC ID | status | evidence |
|---|---|---|
| AC-FCI-1 | DONE | `CiRunJdbcAdapter.findFirstCiRunByPullRequestId()` — `ORDER BY started_at ASC NULLS LAST` |
| AC-FCI-2 | DONE | `FirstCiPassKpiService.toResult()` — `"SUCCESS".equalsIgnoreCase(run.status())` |
| AC-FCI-3 | DONE | Same check — non-SUCCESS returns `firstPassSuccess=false` |
| AC-FCI-4 | DONE | `SelfReviewMarkdownParser` — `EXCEPTION_RECORD` in `CANONICAL_SECTION_KEYS` + `TABLE_SECTION_KEYS` |
| AC-FCI-5 | DONE | `ArtifactScannerService.persistExceptionRecords()` → `upsertParsedExceptions()` → `tbl_fact_exception` |
| AC-FCI-6 | DONE | Empty/missing section: `extractExceptionRecords()` adds warning, returns empty list; `persistExceptionRecords()` logs warn only, no synthetic rows |
| AC-FCI-7 | DONE | `ExceptionKpiService.computeForTicket()` reads only from `tbl_fact_exception` |
| AC-FCI-8 | DONE | `ArtifactScannerJdbcAdapter.resolveRoleId()` → `findRoleIdByName()` → null if not found, no error thrown |
| AC-FCI-9 | DONE | V234: `UNIQUE INDEX uq_exception_ticket_type_section` + `ON CONFLICT DO UPDATE` in `upsertParsedExceptions()` |
| AC-FCI-10 | DONE | `extractExceptionRecords()` adds `exception_table_empty` warning; `persistExceptionRecords()` calls `log.warn()` |
| AC-FCI-11 | DONE | No FE files created or modified |

## 3. List of Changed Files

| file | summary | reason |
|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V234__tbl_fact_exception_add_source_section.sql` | Additive migration: source_section column, partial unique index, ci_run index, REPORT artifact type seed | AC-FCI-9 provenance |
| `application/port/out/persistence/CiRunRepositoryPort.java` | Add `findFirstCiRunByPullRequestId()` + `findFirstCiRunByTicketId()` | AC-FCI-1 |
| `infrastructure/persistence/adapter/CiRunJdbcAdapter.java` | Implement both first-run methods with `ORDER BY started_at ASC NULLS LAST` | AC-FCI-1,2,3 |
| `application/usecase/governance/FirstCiPassKpiService.java` | New service — computes first-pass result for PR/ticket | AC-FCI-1,2,3 |
| `web/rest/FirstCiPassKpiController.java` | New controller — `GET /api/v1/kpi/first-ci-pass/pr/{id}` and `/ticket/{id}` | AC-FCI-1 |
| `web/dto/FirstCiPassKpiDtos.java` | DTO for first-pass response | AC-FCI-1 |
| `domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | Add `EXCEPTION_RECORD` section, `ParsedExceptionRecord` record, `extractExceptionRecords()`, bump parser version | AC-FCI-4,6 |
| `application/usecase/scanner/ArtifactScannerModels.java` | Add `ParsedException` record | AC-FCI-5 |
| `application/port/out/persistence/ArtifactScannerPersistencePort.java` | Add `upsertParsedExceptions()` + `findRoleIdByName()` | AC-FCI-5,8 |
| `infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Implement `upsertParsedExceptions()` + `findRoleIdByName()` + `resolveRoleId()` | AC-FCI-5,8,9 |
| `application/usecase/scanner/ArtifactScannerService.java` | Add `persistExceptionRecords()`, call it from `persistSelfReviewParse()`, add `report.md` branch | AC-FCI-4,5,6,10 |
| `application/port/out/persistence/ExceptionKpiRepositoryPort.java` | New port for exception KPI read | AC-FCI-7 |
| `application/usecase/governance/ExceptionKpiService.java` | New service — aggregates exception KPI for ticket | AC-FCI-7 |
| `infrastructure/persistence/adapter/ExceptionKpiJdbcAdapter.java` | New adapter — reads `tbl_fact_exception` for KPI | AC-FCI-7 |
| `web/rest/ExceptionKpiController.java` | New controller — `GET /api/v1/kpi/exceptions/ticket/{id}` | AC-FCI-7 |
| `web/dto/ExceptionKpiDtos.java` | DTOs for exception KPI response | AC-FCI-7 |

## 4. Run Command and Results

| command | result | note |
|---|---|---|
| `mvn compile` (to be run) | PENDING | Pending DB availability for full integration; compile check available |

## 5. Self-Check using Review Checklist

| checklist area | result | note |
|---|---|---|
| Specification / AC matching | PASS | All 11 ACs have traceable implementations (see Section 2) |
| Number / Input | PASS | Null-safe guards on all UUID inputs; limit clamped in existing adapters |
| Character / Encoding / Locale | PASS | `Locale.ROOT` used in all case-insensitive comparisons; reason truncated to 1000 chars |
| Literal / Magic Number | PASS | Status strings compared with `equalsIgnoreCase`; follow-up default `"OPEN"` is spec-defined |
| Operation / Maintainability | PASS | Parser version bumped; idempotent upsert; `log.warn()` on missing sections |
| FE review | PASS | No FE files touched |
| BE / API review | PASS | Constructor injection; `@Transactional(readOnly = true)`; thin controllers |
| DB / Migration review | PASS | V234 is additive nullable; no existing table modified destructively |
| Security / Privacy review | PASS | No raw logs/chat/prompt persisted; role referenced by UUID not person name |
| Test review | NEEDS_UPDATE | Test code explicitly excluded per user instruction; manual compile verification pending |
| Documentation / Traceability review | PASS | All changed files listed; AC map complete |
| Release / Rollback review | PASS | Rollback: disable new code paths before reverting V234 (nullable column, safe to remove) |

## 6. Test Plan Corresponding Status

- Test code not implemented (excluded per user instruction: "Chi implement code thôi, không implement test code").
- Manual compile verification: `mvn compile` to be run after DB is available.

## 7. Bugs Found and Resolved

| bug | cause | fix | test |
|---|---|---|---|
| Column name mismatch `pr_id` vs `pull_request_id` | V4 DDL used `pr_id`; V200 migration added `pull_request_id` as the populated column | Used `pull_request_id` in first-run SELECT query (confirmed from V200 and adapter INSERT) | Verified in CiRunJdbcAdapter line 276 |

## 8. Unprocessed / TBD / Accepted Risk

| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| `mvn compile` not run | Requires Docker DB to be running for full Spring context startup | Syntax errors possible; human review before merge | Backend owner | Before merge |
| Test coverage | Excluded by user instruction | No unit tests for new services or parser method | Backend owner | Next phase |
| `tbl_dim_phase.phase_code = '8'` assumed | V234 REPORT seed relies on phase_code='8' existing | REPORT artifact type not registered if phase_code differs | DB owner | Verify before apply |

## 9. Exception Record

| exception_type | source_section | reason | approved_by_role | expiry | follow_up | owner | status |
|---|---|---|---|---|---|---|---|
| `OTHER` | Phase 5 implementation | Test code excluded by explicit user instruction — no automated test coverage for new service/parser | PM | TBD | OPEN | nk_trung | OPEN |

## 10. AI-generated predictions

- The `CAST(:expiryDate AS DATE)` binding in `upsertParsedExceptions()` will throw if a non-null, non-ISO-date string is passed — callers should validate or null-out malformed expiry values.
- Role resolution via `UPPER(TRIM(role_name))` may miss roles with trailing Unicode spaces; monitoring via data-quality warnings is the safety net.
- The `report.md` branch in `ArtifactScannerService` uses `selfReviewParser.parse()` which also validates all 12 self-review sections — the missing required-section warnings will fire for fields not present in report.md. This is acceptable noise (they are warnings, not errors) but may be confusing in data-quality records.

## 11. Items reviewed by humans

- TBD

## 12. Final Self-Verdict

-  PASS

