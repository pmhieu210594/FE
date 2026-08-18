# Test Plan

**Ticket ID**: ADMIN-AUDIT-LOG  
**Create date**: 2026-07-09  
**Author**: Claude  
**Update date**: 2026-07-09  

## 1. Purpose

Prepare the Phase 6 test strategy for audit-log capture, read-only query APIs, masking, and immutability.

## 2. AC Matrix ↔ Test Type

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-ADMIN-AUDIT-LOG-1 | N/A | Yes | Yes | N/A | N/A | N/A | Planned |
| AC-ADMIN-AUDIT-LOG-2 | N/A | Yes | Yes | N/A | N/A | N/A | Planned |
| AC-ADMIN-AUDIT-LOG-3 | N/A | Yes | Yes | N/A | N/A | N/A | Planned |
| AC-ADMIN-AUDIT-LOG-4 | Yes | Yes | Yes | N/A | N/A | N/A | Planned |
| AC-ADMIN-AUDIT-LOG-5 | N/A | Yes | Yes | N/A | N/A | N/A | Planned |
| AC-ADMIN-AUDIT-LOG-6 | N/A | Yes | Yes | N/A | N/A | N/A | Planned |
| AC-ADMIN-AUDIT-LOG-7 | N/A | Yes | Yes | N/A | N/A | N/A | Planned |
| AC-ADMIN-AUDIT-LOG-8 | Yes | N/A | Yes | N/A | Skipped this phase | Yes | Planned |
| AC-ADMIN-AUDIT-LOG-9 | Yes | N/A | Yes | N/A | Skipped this phase | Planned | Planned |
| AC-ADMIN-AUDIT-LOG-10 | Yes | N/A | Yes | N/A | Skipped this phase | Yes | Planned |

## 3. Priority

| test item | priority | reason |
|---|---|---|
| Audit masking | P0 | Security-critical; no secret leakage allowed |
| Append-only immutability | P0 | DB policy must block UPDATE/DELETE on the log table |
| CRUD audit capture | P0 | Core business requirement |
| Login success/failure/logout capture | P0 | Security and compliance requirement |
| List/detail read-only APIs | P0 | User-facing audit screen requirement |
| Filter/search correctness | P1 | Important for practical use |
| Summary counts | P1 | Useful but secondary to core capture correctness |

## 4. Reuse Existing Test

| existing test | path | covers | gap |
|---|---|---|---|
| `GlobalExceptionHandlerTest` | `EDCAP_BE/src/test/java/com/sdd/platform/web/exception/GlobalExceptionHandlerTest.java` | Error response and traceId behavior | Does not cover audit flows |
| CRUD controller tests in the existing admin areas | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/web/rest/*.java` | Thin-controller pattern | Need audit-specific assertions |
| Service tests in governance package | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/*.java` | Transactional service logic pattern | Need audit hooks and masking assertions |
| FE component and utility tests | `EDCAP_FE/src/__ tests __/**` | Component/utility testing pattern | Need audit-log screen coverage |

## 5. Additional Test This Time

| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-ADMIN-AUDIT-LOG-1 | CREATE audit is written for audited CRUD actions | BE UT | `AdminAuditLogService` | AC-ADMIN-AUDIT-LOG-1 |
| TC-ADMIN-AUDIT-LOG-2 | UPDATE audit includes masked before/after and changed fields | BE UT | `AdminAuditLogService` | AC-ADMIN-AUDIT-LOG-2 |
| TC-ADMIN-AUDIT-LOG-3 | DELETE audit writes null `after_value` | BE UT | `AdminAuditLogService` | AC-ADMIN-AUDIT-LOG-3 |
| TC-ADMIN-AUDIT-LOG-4 | Secret fields are removed before persistence | FE UT / BE UT | `AuditMaskingHelper`, audit detail rendering | AC-ADMIN-AUDIT-LOG-4 |
| TC-ADMIN-AUDIT-LOG-5 | Failed CRUD operation writes FAILED audit row with safe message | BE UT | failure path | AC-ADMIN-AUDIT-LOG-5 |
| TC-ADMIN-AUDIT-LOG-6 | Successful login writes audit row | BE UT | `AuthService.login()` hook | AC-ADMIN-AUDIT-LOG-6 |
| TC-ADMIN-AUDIT-LOG-7 | Failed login writes audit row with attempted username | BE UT | auth failure path | AC-ADMIN-AUDIT-LOG-7 |
| TC-ADMIN-AUDIT-LOG-8 | Audit-log list endpoint is GET-only and paginated | API IT | `GET /api/v1/admin/audit-logs` | AC-ADMIN-AUDIT-LOG-8 |
| TC-ADMIN-AUDIT-LOG-9 | Filters/search and summary counts work on the list endpoint and FE summary cards | FE UT / API IT | list filter pipeline | AC-ADMIN-AUDIT-LOG-9 |
| TC-ADMIN-AUDIT-LOG-10 | Detail endpoint shows diff/context and stays read-only | FE UT / API IT | `GET /api/v1/admin/audit-logs/{id}` and drawer | AC-ADMIN-AUDIT-LOG-10 |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| CRUD success audit | Admin user available | Create, update, and delete one master-data item | Three audit rows are written with correct operation types | AC-ADMIN-AUDIT-LOG-1..3 |
| Login audit | Valid and invalid login accounts available | Perform success and failure login attempts and logout | Audit rows are written for each auth event | AC-ADMIN-AUDIT-LOG-6..7 |
| Screen review | Audit rows exist | Open list, apply filters, open detail | Read-only behavior and detail diff are shown | AC-ADMIN-AUDIT-LOG-8..10 |

## 6. Areas intentionally left untested this time

| area | reason | risk |
|---|---|---|
| DB migration / append-only trigger execution | No disposable Postgres harness is available in this workspace phase | Medium; DDL is reviewed but not executed end-to-end |
| Contract tests | No contract-test harness exists in the current repo | Low |
| Browser E2E | FE screen list/filter/detail/pagination is covered by the Playwright audit-log spec in `EDCAP_FE/e2e_tests/tests/admin-audit-log/admin-audit-log.spec.ts`; live backend-driven browser run is still out of scope for this phase | Medium |
| Export / alerting / retention | Out of scope for this ticket | Low |
| Non-read audit mutations | They are forbidden by design | Low |

## 7. Data testing principles

- Use UTF-8 test payloads.
- Do not use production data.
- Do not store secrets, passwords, or raw tokens in the test fixtures.
- Cover normal, error, boundary, permission, and immutability cases.

## 8. Execution command

| command | purpose |
|---|---|
| `mvn -q -o test -Dtest="com.sdd.platform.application.usecase.governance.AuditMaskingHelperTest,com.sdd.platform.application.usecase.governance.AdminAuditLogServiceTest,com.sdd.platform.web.rest.AdminAuditLogControllerTest"` | Targeted BE unit/controller verification for audit masking, write-path behavior, and read-only API |
| `npx vitest run "src/__ tests __/admin-audit-log/**/*.test.ts*"` | Targeted FE unit verification for audit-log utilities, summary cards, and detail drawer |
| `npx playwright test e2e_tests/tests/admin-audit-log/admin-audit-log.spec.ts` | Browser E2E for audit-log list, filtering, detail drawer, and pagination |

## 9. Stop Condition

- Stop if any AC does not have at least one test path.
- Stop if audit masking cannot be validated.
- Stop if immutability cannot be validated at DB level.

## 10. Required Human Decision

- Confirm the actor identity table reference before any DB migration execution.
