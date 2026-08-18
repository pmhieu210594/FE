# Review Checklist

**Ticket ID**: PARSE-IMPL-PLAN  
**Create date**: 2026-06-19  
**Author**: ChatGPT  
**Update date**: 2026-06-19  

## 1. Specification / AC Matching

| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-PARSE-IMPL-PLAN-1 | Parser detects ticket-scoped `impl-plan.md` and marks missing-file cases (`NOT_FOUND`). | Blocker | PASS |
| AC-PARSE-IMPL-PLAN-2 | Extract `implementation_principle` from the template section reliably. | Major | PASS |
| AC-PARSE-IMPL-PLAN-3 | Extract `alternative_plan` and `reason_for_chosen_plan` correctly. | Major | PASS |
| AC-PARSE-IMPL-PLAN-4 | Extract full required section set (all 14 canonical sections) without drift. | Blocker | PASS |
| AC-PARSE-IMPL-PLAN-5 | Missing sections are flagged `PARTIAL` or `PARSE_ERROR` (no silent ignores). | Blocker | PASS |
| AC-PARSE-IMPL-PLAN-6 | Re-parse idempotency for same `source_hash` + `parser_version` (upsert behavior). | Blocker | PASS |
| AC-PARSE-IMPL-PLAN-7 | Parsed result is queryable/displayable without re-reading raw markdown (snapshot + fields). | Minor | PASS |

### 1.1. AC Traceability Table

| AC ID | Specification summary | Design / implementation area | Required evidence | Related review items | Status |
|---|---|---|---|---|---|
| AC-PARSE-IMPL-PLAN-1 | File detection and NOT_FOUND handling | `GithubWebhookService` + `ImplPlanParseService` | Unit tests for NOT_FOUND | BE ingest tests | PASS |
| AC-PARSE-IMPL-PLAN-2 | `implementation_principle` extraction | `ArtifactNormalizer` | Unit test coverage | Parser unit tests | PASS |
| AC-PARSE-IMPL-PLAN-3 | `alternative_plan` & `reason_for_chosen_plan` extraction | `ArtifactNormalizer` / `ImplPlanParseService` | Unit tests | Parser unit tests | PASS |
| AC-PARSE-IMPL-PLAN-4 | All 14 template sections extracted | `FieldSpec` + extraction mapping | Unit tests, parsed snapshot examples | Parser tests + sample snapshots | PASS |
| AC-PARSE-IMPL-PLAN-5 | Missing-section marking semantics | `ImplPlanParseService` parseStatus handling | Unit tests for PARTIAL / PARSE_ERROR | Parser tests | PASS |
| AC-PARSE-IMPL-PLAN-6 | Idempotency (same-hash upsert) | `ImplPlanParseJdbcAdapter` behaviour | Idempotency test (same-hash) | Unit tests | PASS |
| AC-PARSE-IMPL-PLAN-7 | Query/display via snapshot API | `ImplPlanParseController` + DTOs | Demo API responses in tests | API DTO mapping | PASS |

## 2. BE Review

The backend controller, parser, ingest service, and persistence documentation should align with the BE scope for this ticket.

| item | result | note |
|---|---|---|
| BE controller/API scope | PASS | `ImplPlanParseController` provides demo read-only endpoints and DTOs. |
| BE parser/normalizer | PASS | `ArtifactNormalizer` implements heading normalization and section extraction. |
| BE persistence adapter | PASS | `ImplPlanParseJdbcAdapter` maps snapshots/sections to artifact tables (additive). |
| BE ingest integration | PASS | `GithubWebhookService` triggers draft parse flows; unit tests present. |

### 2.1. Operational / Maintainability checks

| check | result | note |
|---|---|---|
| Logging discipline | PASS | Logs include traceId, parseStatus; no raw markdown logged. |
| Correlation IDs | PASS | `traceId` propagated through DTOs. |
| Parser version recorded | PASS | `parserVersion` persisted on snapshot. |


## 3. DB / Migration Review

The docs and adapter keep storage model additive and reuse approved artifact snapshot tables.

| item | result | note |
|---|---|---|
| Table naming / reuse | PASS | Uses existing `tbl_fact_artifact_snapshot` / `tbl_fact_artifact_parsed_section` where possible. |
| Unique key / idempotency | PASS | Upsert strategy by `ticketId` + `contentHash` + `parserVersion`. |
| Additive migration | PASS | `V230__doc_parse_impl_plan.sql` avoids destructive changes. |


## 4. Security / Privacy Review

| item | result | note |
|---|---|---|
| Sensitive-field exposure | PASS | No secrets or tokens persisted in parse results. |
| Raw payload retention | PASS | Parser persists structured fields only. |
| Safe logging | PASS | Error summaries sanitized. |
| Access control | PASS | Demo API is read-only; production access to be gated. |


## 5. Operation / Maintenance Review

| item | result | note |
|---|---|---|
| Observability | PASS | Failures and PARTIAL states are logged and visible in test output. |
| Recoverability | PASS | Missing-file and malformed-file are recoverable states. |
| Rollback strategy | PASS | Additive DB changes and ability to disable parse job if needed. |


## 6. Test Review

| item | result | note |
|---|---|---|
| Unit test coverage | PASS | `ImplPlanParseServiceTest` covers happy path, missing sections, idempotency, duplicate headings. |
| Integration test (DB) | NOT RUN / MANUAL | Live DB integration not executed in this pass — recommended before promotion. |
| Black-box / API tests | PASS | Demo controller exercised by tests. |


## 7. Documentation / Traceability Review

| item | result | note |
|---|---|---|
| Spec / AC mapping | PASS | AC mapping present in `report.md` and this checklist. |
| Changed files listed | PASS | `report.md`, `test-results.md`, `promotion-candidates.md`, `raw/database_design.md` updated. |
| Template-to-field mapping | PASS | Field spec documented in `raw/database_design.md`. |
| Open issues visible | PASS | Open issues and failure-mode candidates listed in report. |


## 8. Release / Rollback Review

| item | result | note |
|---|---|---|
| Release risk | PASS | Backend-only scope and unit-tested code reduce risk. |
| Rollback path | PASS | Additive DB changes and safe-disable of parser job. |
| Stop / ask conditions | PASS | Template mismatch stops official snapshot promotion. |


## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect report | Record reason for rejection |
| Accepted Risk | Accepted risk | Record impact / owner / deadline |