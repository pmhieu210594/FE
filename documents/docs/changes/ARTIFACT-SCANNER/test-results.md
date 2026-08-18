# Test Results

**Ticket ID**: ARTIFACT-SCANNER   
**Create date**: 2026-06-16  
**Author**: nk_trung  
**Update date**: 2026-06-17   

## 1. Execution Environment

| item | value |
|---|---|
| Backend | User-confirmed local development environment with Maven available |
| Scope | Artifact Scanner BE unit tests, BE integration tests, manual/API verification, and black-box coverage |
| Source baseline | `EDCAP_FULL` workspace snapshot with Phase 6 and Phase 7 artifacts applied |
| DB/migration review | `V160__artifact_scanner.sql` and `V161__artifact_scanner_ticket_status.sql` reviewed together with scanner persistence code |

## 2. Executed Commands

| command | result | log/evidence | note |
|---|---|---|---|
| `cd EDCAP_BE && mvn test -Dtest=ArtifactScannerServiceTest,GithubWebhookServiceTest` | PASS | User confirmed all targeted backend unit tests passed | Confirms scanner service logic and webhook-triggered scanner coverage are green. |
| `cd EDCAP_BE && mvn verify -Dit.test=ArtifactScannerControllerIntegrationTest,ArtifactScannerPersistenceIntegrationTest` | PASS | User confirmed all targeted backend integration tests passed | Confirms scanner API contract, permission, validation, and persistence/static migration verification are green. |
| `POST /api/v1/data-ops/artifact-scans` + `GET /api/v1/data-ops/artifact-scans/{runId}` + `GET /api/v1/data-ops/artifact-scans/{runId}/artifacts` + `GET /api/v1/data-ops/artifact-scans/current?repositoryId=...` | PASS | User confirmed manual/API verification completed successfully | Confirms run summary, artifact result, current inventory, and permission behavior are correct from the operation-view perspective. |
| Execute `BB-ARTIFACT-SCANNER-01` -> `BB-ARTIFACT-SCANNER-12` in `blackbox-testcases.md` | PASS | User confirmed all black-box test cases passed | Confirms spec/AC-based external behavior is validated independently from implementation detail. |
| Review `V160__artifact_scanner.sql`, `V161__artifact_scanner_ticket_status.sql`, `ArtifactScannerJdbcAdapter.java` | PASS | Static review completed | Confirms the V4-only run/snapshot/view path and no intentional full-content persistence. |

## 3. Summary of Results

Artifact Scanner Phase 6 and Phase 7 have been completed in the agreed BE-centric direction. Backend unit tests, backend integration tests, manual/API verification, and all black-box cases have been executed and confirmed as passing. The test plan and test results have been updated to accurately reflect the current execution status.

## 4. List of Passes

| TC ID || test | result | note |
|---|---|---|---|
| TC-ARTIFACT-SCANNER-1 | Backend Artifact Scanner unit tests | PASS | 1/1 passed (`ArtifactScannerServiceTest` 8 + `GithubWebhookServiceTest` 15). |
| TC-ARTIFACT-SCANNER-2 | Backend Artifact Scanner unit tests | PASS | 1/1 passed (`ArtifactScannerServiceTest` 8 + `GithubWebhookServiceTest` 15). |
| TC-ARTIFACT-SCANNER-3 | Backend Artifact Scanner unit tests | PASS | 1/1 passed (`ArtifactScannerServiceTest` 8 + `GithubWebhookServiceTest` 15). |
| TC-ARTIFACT-SCANNER-4 | Manual/API verification scenarios | PASS | 4/4 passed (run scanner, read current inventory, missing artifact review, operation-view verification). |
| TC-ARTIFACT-SCANNER-5 | Backend Artifact Scanner integration tests | PASS | 2/2 passed (`ArtifactScannerControllerIntegrationTest` 3 + `ArtifactScannerPersistenceIntegrationTest` 2). |
| TC-ARTIFACT-SCANNER-6 | Backend Artifact Scanner integration tests | PASS | 3/3 passed (`ArtifactScannerControllerIntegrationTest` 3 + `ArtifactScannerPersistenceIntegrationTest` 2). |
| TC-ARTIFACT-SCANNER-7 | DB/Migration static verification | PASS | 1/1 passed (`scannerJdbcAdapter_uses_v4_run_snapshot_and_current_inventory_view_without_full_content_columns`, `scannerMigrations_add_snapshot_columns_phase0_seed_and_current_inventory_view`). |
| TC-ARTIFACT-SCANNER-8 | DB/Migration static verification | PASS | 1/1 passed (`scannerJdbcAdapter_uses_v4_run_snapshot_and_current_inventory_view_without_full_content_columns`, `scannerMigrations_add_snapshot_columns_phase0_seed_and_current_inventory_view`). |
| TC-ARTIFACT-SCANNER-9 | Black-box tests | PASS | 12/12 passed. Coverage is documented in `blackbox-testcases.md`. |

## 5. List of Fails

| test | cause | action | status |
|---|---|---|---|
| None | All planned Artifact Scanner test execution completed successfully. | No further action required for this phase. | PASS |

## 6. Bugs Fixed

| bug | fix | evidence |
|---|---|---|
| The test plan did not reflect black-box coverage and the latest execution status | Updated `test-plan.md` to add black-box completion, AC matrix notes, execution scope, and required human decision status | Updated `docs/changes/ARTIFACT-SCANNER/test-plan.md` |
| The previous test results still recorded `PARTIAL` and `NOT_RUN` | Updated `test-results.md` to reflect that execution has completed and passed | Updated `docs/changes/ARTIFACT-SCANNER/test-results.md` |
| Missing pass/fail summary by test type similar to CUSTOMER documentation | Added pass-count summary for BE UT, BE IT, manual/API, black-box, and DB/migration verification | Updated `docs/changes/ARTIFACT-SCANNER/test-results.md` |

## 7. Not Yet Fixed / Pending

- None.

## 8. Tests That Cannot Be Executed and Reason

| test/command | reason | risk | alternative evidence |
|---|---|---|---|
| None | No Artifact Scanner test execution is blocked in this pass. | Low | Maven tests, manual/API verification, and black-box test cases all passed. |

## 9. Remaining Risk

- No known Artifact Scanner test execution risk remains in this pass.

## 10. Final Test Verdict

- PASS