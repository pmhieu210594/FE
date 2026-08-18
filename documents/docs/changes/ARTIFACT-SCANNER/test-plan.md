# Test Plan

**Ticket ID**: ARTIFACT-SCANNER     
**Create date**: 2026-06-16   
**Author**: nk_trung   
**Update date**: 2026-06-17  

## 1. Purpose

Confirm that Artifact Scanner works correctly according to the backend-centric spec: it scans the correct scope under `docs/changes/<TICKET>/` and the fixed file set under `docs/maintenance/phase0/`, correctly identifies `ticket_id` and `artifact_type`, reflects existing/missing status correctly, sets `need_parse` based on `content_hash`, writes run/snapshot/current inventory through the V4 path, and exposes an API that supports review/operation without pulling the scanner into FE scope.

Black-box artifacts for this ticket have been completed and confirmed as passing in `blackbox-testcases.md`, `test-data.md`, and `blackbox-review-checklist.md`.

The scope of the current test phase:

- Backend unit tests for scanner core logic, validation, hash-change detection, and repository/ticket-scope guards.
- Backend integration tests for scanner API contract, permission, request validation, and static persistence/migration verification.
- Manual/API black-box verification for run summary, artifact result, current inventory, missing artifact behavior, permission, and the operation viewpoint.
- No additional FE automated tests because the scanner is a BE-centric function, and FE is only a surface for test/operation.

## 2. AC Matrix ↔ Test Type
| AC ID | API/Manual | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-ARTIFACT-SCANNER-01 | N/A | Added | Added | N/A | N/A | N/A | Passed |
| AC-ARTIFACT-SCANNER-02 | N/A | Added | N/A | N/A | N/A | N/A | Passed |
| AC-ARTIFACT-SCANNER-03 | N/A | Added | N/A | N/A | Added | N/A | Passed |
| AC-ARTIFACT-SCANNER-04 | N/A | Added | N/A | N/A | N/A | N/A | Passed |
| AC-ARTIFACT-SCANNER-05 | Passed | Added | Added | N/A | Added | N/A | Passed |
| AC-ARTIFACT-SCANNER-06 | N/A | Added | N/A | N/A | N/A | N/A | Passed |
| AC-ARTIFACT-SCANNER-07 | N/A | Added | N/A | N/A | N/A | N/A | Passed |
| AC-ARTIFACT-SCANNER-08 | N/A | Added | N/A | N/A | Added | N/A | Passed |
| AC-ARTIFACT-SCANNER-09 | Passed | Added | Added | N/A | Added | N/A | Passed |
| AC-ARTIFACT-SCANNER-10 | N/A | Added | N/A | N/A | Added | N/A | Passed |
| AC-ARTIFACT-SCANNER-11 | Passed | N/A | Added | N/A | N/A | N/A | Passed |

Notes:

- `API IT = Added` because this phase adds `ArtifactScannerControllerIntegrationTest` and `ArtifactScannerPersistenceIntegrationTest` to prove the API contract and persistence path at the integration/static verification level.
- `DB/Migration = Added` means there is static verification for migration SQL, snapshot columns, phase0 seed, current inventory view, and the policy of not storing full markdown content.
- `API/Manual = Passed` for AC-05/09/11 because manual black-box verification has been executed and confirmed as passing for run summary, artifact result, current inventory, and permission.
- `Black-box = Passed` because `blackbox-testcases.md`, `test-data.md`, and `blackbox-review-checklist.md` have been completed and all black-box cases were confirmed as passing.

## 3. Priority
| test item | priority | reason |
|---|---|---|
| Ticket scan with complete/missing 8 required files | P0 | Core value of scanner inventory |
| Correctly identifying `ticket_id` from path `docs/changes/<TICKET>/` | P0 | Incorrect ticket mapping makes the entire inventory wrong |
| Hash changed/new -> `need_parse` | P0 | Handoff rule to parser |
| Unknown ticket -> auto-create minimal ticket | P0 | Behavior finalized in the spec/impl plan |
| V4 run log + current inventory read model | P1 | Required for operation and review |
| Phase0 metadata-only scan | P1 | Additional scope of the ticket |
| API run/result/current inventory | P1 | Supports test/operation, not FE core |
| FE rendering automated test | P3 | Not the focus of this BE-centric ticket |

## 4. Reuse Existing Test
| existing test | path | covers | gap |
|---|---|---|---|
| `ArtifactScannerServiceTest.full_scan_creates_snapshots_and_detects_hash_changes` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerServiceTest.java` | FULL scan, 8 change-scope files + 7 phase0 files, hash change, `need_parse`, run success | Does not separately cover missing required artifacts, invalid request, or unknown repository |
| `ArtifactScannerServiceTest.ticket_scoped_scan_auto_creates_missing_ticket_and_continues` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerServiceTest.java` | `TICKET_SCOPED`, unknown ticket auto-create minimal ticket, phase0 does not run in ticket-scoped mode | Does not cover validation error for empty `ticket_ids` |
| `GithubWebhookServiceTest.pull_request_opened_triggers_artifact_scan_and_ticket_upsert` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` | Trigger scanner from webhook and upsert ticket from changed files | Does not prove scanner API/current inventory |
| Existing scanner UI/manual support | `EDCAP_FE/src/pages/ArtifactScanResultPage.tsx` and the existing API flow | Provides a path for users to view scan results | Not used as the main automated evidence for ticket Phase 6 |

## 5. Additional Test This Time
| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-ARTIFACT-SCANNER-1 |`full_scan_marks_missing_required_artifacts_and_optional_phase0_as_skipped`| BE UT | Missing required artifact + optional phase0 missing status/message | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-04, AC-ARTIFACT-SCANNER-08 |
| TC-ARTIFACT-SCANNER-2 | `ticket_scoped_scan_requires_non_empty_ticket_ids` | BE UT | Request validation for `TICKET_SCOPED` | AC-ARTIFACT-SCANNER-01 |
| TC-ARTIFACT-SCANNER-3 | `scan_rejects_unknown_repository` | BE UT | Repository validation / fail fast | AC-ARTIFACT-SCANNER-09 |
| TC-ARTIFACT-SCANNER-4 | `run_returns_scan_summary_and_artifact_result_for_admin` | API IT | Run scanner API contract returns run summary + artifact result | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-11 |
| TC-ARTIFACT-SCANNER-5 | `current_inventory_requires_admin_role` | API IT | Security/permission for current inventory endpoint | AC-ARTIFACT-SCANNER-11 |
| TC-ARTIFACT-SCANNER-6 | `run_rejects_blank_branch_before_service_call` | API IT | DTO validation for API request | AC-ARTIFACT-SCANNER-11 |
| TC-ARTIFACT-SCANNER-7 | `scannerJdbcAdapter_uses_v4_run_snapshot_and_current_inventory_view_without_full_content_columns` | DB/Migration IT | Persistence path uses only V4 run/snapshot/view and has no full-content persistence | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-09, AC-ARTIFACT-SCANNER-10 |
| TC-ARTIFACT-SCANNER-8 | `scannerMigrations_add_snapshot_columns_phase0_seed_and_current_inventory_view` | DB/Migration IT | Migration evidence for snapshot columns, phase0 seed, and current inventory view | AC-ARTIFACT-SCANNER-03, AC-ARTIFACT-SCANNER-08, AC-ARTIFACT-SCANNER-09, AC-ARTIFACT-SCANNER-10 |
| TC-ARTIFACT-SCANNER-9 | `BB-ARTIFACT-SCANNER-01` to `BB-ARTIFACT-SCANNER-12` | Black-box / API Manual | External behavior according to spec and AC, without relying on implementation details | AC-ARTIFACT-SCANNER-01 to AC-ARTIFACT-SCANNER-11 |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|

## 6. Areas intentionally left untested this time
| area | reason | risk |
|---|---|---|
| FE automated test code for Artifact Scan Result | Spec and BR-AS-12 define the scanner as BE-centric; FE is only a surface for test/operation | Low: remaining FE rendering risk is covered by manual/API verification |
| Parser behavior reading the original file again from repo | Outside the scope of the scanner ticket; scanner only hands off metadata/path/hash | Low/Medium: actual handoff needs additional verification in the parser ticket |
| `.claude/*` scanning | Explicitly out of scope in the spec | Low |
| Non-MVP modes beyond `FULL`, `TICKET_SCOPED` | Not part of MVP v1 | Low |

## 7. Data testing principles

- Use synthetic data only; do not use real customer data or real production repositories.
- Use stable ticket keys such as `ARTIFACT-SCANNER`, `UNKNOWN-TICKET`, and `MISSING-CHECK` so assertions are easy to read and deterministic.
- Each test seeds only the minimum artifacts required for the scenario; do not depend on execution order.
- For change-scope tickets, always treat the standard MVP file set as 8 files: `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `report.md`, and `blackbox-testcases.md`.
- For phase0, use exactly the fixed set of 7 files currently in code; assert only metadata/status, not parsed content.
- Missing artifact tests must distinguish between required artifacts (`MISSING`) and optional phase0 artifacts (`SKIPPED`).
- Hash-change tests must use different but deterministic content to compare `content_hash` and `need_parse`.
- Do not store or assert any full markdown content in persistence integration tests; assert only path/hash/status/message/size/time/flags.
- API/manual and black-box tests only confirm the contract needed for review/operation: request validation, permission, run summary, artifact result/current inventory, and expected results at an observable level.

## 8. Execution command
| command | purpose |
|---|---|
| `cd EDCAP_BE && mvn test -Dtest=ArtifactScannerServiceTest,GithubWebhookServiceTest` | Run scanner backend unit tests |
| `cd EDCAP_BE && mvn verify -Dit.test=ArtifactScannerControllerIntegrationTest,ArtifactScannerPersistenceIntegrationTest` | Run scanner backend integration/static persistence tests |
| `POST /api/v1/data-ops/artifact-scans` + `GET /api/v1/data-ops/artifact-scans/{runId}` + `GET /api/v1/data-ops/artifact-scans/{runId}/artifacts` + `GET /api/v1/data-ops/artifact-scans/current?repositoryId=...` | Manual/API verification sequence |
| Execute `BB-ARTIFACT-SCANNER-01` → `BB-ARTIFACT-SCANNER-12` in `blackbox-testcases.md` | Run black-box validation against the spec and AC |
| Review `V160__artifact_scanner.sql` and `V161__artifact_scanner_ticket_status.sql` together with `ArtifactScannerJdbcAdapter.java` | Verify the V4-only persistence path, snapshot columns, current inventory view, and no full-content persistence |

## 9. Stop Condition

- Stop if the scanner starts parsing Markdown or adds a dependency on parser responsibility.
- Stop if the scanner reads/writes through legacy tables instead of `tbl_connector_run`, `tbl_fact_artifact_snapshot`, and `vw_artifact_inventory_current`.
- Stop if the scanner API can no longer return the minimum run summary/artifact result needed for review/operation.
- Stop if test evidence requires adding a new FE automated test solely to prove a BE business rule.

## 10. Required Human Decision

- There are no open required human decisions for the current test phase because BE UT, BE IT, manual/API verification, and black-box tests have all been run and passed.