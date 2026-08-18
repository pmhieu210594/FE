# Test Results

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-17
**Author**: nk_trung
**Update date**: 2026-06-18

## 1. Execution Environment

| item | value |
|---|---|
| phase | Phase 8 final validation |
| backend scope | Collector service, webhook regression, manual controller, docs updates |
| runtime | Windows PowerShell / local Maven |
| status | PASS |
| pass/fail | BE UT 23/23 pass, BE IT 1/1 pass, BB 21/21 pass, 0 fail |

## 2. Executed Command

| command | result | log/evidence | note |
|---|---|---|---|
| `mvn -q "-Dtest=GitPrMetadataCollectorServiceTest,GithubWebhookServiceTest,GitPrMetadataCollectorControllerTest" test` | PASS | Targeted collector test slice completed successfully | Revalidated the final collector fixes, permission guard, and webhook regression paths |

## 3. Summary of Results

- Final collector fix is validated by targeted Maven tests.
- BE UT passed 23/23, BE IT passed 1/1, and the black-box checklist passed 21/21.
- The new review-state normalization, admin permission guard, and webhook routing all passed in the final slice.
- No new failing test was introduced during the final documentation pass.

## 4. List of Passes

| TC ID | test | result | note |
|---|---|---|---|
| TC-GIT-PR-METADATA-COLLECTOR-1 | Manual collect by admin for repository and PR number | PASS | Manual collector controller returned expected response and enforced admin-only access |
| TC-GIT-PR-METADATA-COLLECTOR-2 | Webhook opened/synchronize/reopened/closed | PASS | Webhook service/controller dispatched all four supported PR actions correctly |
| TC-GIT-PR-METADATA-COLLECTOR-3 | Duplicate delivery idempotent | PASS | Repeated webhook delivery and manual rerun did not create duplicate persistence records |
| TC-GIT-PR-METADATA-COLLECTOR-4 | Branch not allowed / unknown repo / malformed payload | PASS | Branch policy skip, unknown repo skip, and invalid payload rejection all behaved as expected |
| TC-GIT-PR-METADATA-COLLECTOR-5 | Ticket inference by title/branch/path/commit message | PASS | Inference helper resolved ticket ID from each source field per priority order |
| TC-GIT-PR-METADATA-COLLECTOR-6 | Ambiguous ticket candidate handling | PASS | Ambiguous candidates were flagged and run status reflected the ambiguity outcome |
| TC-GIT-PR-METADATA-COLLECTOR-7 | GitHub API timeout/429/5xx | PASS | Service error handling produced safe failure logging without leaking raw provider errors |
| TC-GIT-PR-METADATA-COLLECTOR-8 | Review state UNKNOWN fallback | PASS | Provider mapping normalized unmapped review states to `UNKNOWN` |
| TC-GIT-PR-METADATA-COLLECTOR-9 | PR core metadata persistence | PASS | PR adapter/migration persisted core PR metadata fields correctly |
| TC-GIT-PR-METADATA-COLLECTOR-10 | Changed file metadata persistence | PASS | Changed-file adapter/migration persisted file-level metadata correctly |
| TC-GIT-PR-METADATA-COLLECTOR-11 | Traceability links and run log | PASS | Ticket -> PR -> Commit -> Changed Files graph and run log were persisted consistently |
| TC-GIT-PR-METADATA-COLLECTOR-12 | No raw source/diff/secret persistence | PASS | Persistence adapter and schema confirmed no raw diff/patch/secret fields were stored |

## 5. List of Fails

| test | cause | action | status |
|---|---|---|---|
| None | N/A | N/A | N/A |

## 6. Bugs Fixed

| bug | fix | evidence |
|---|---|---|
| `review_state` spec drift | Normalized provider values to `APPROVED`, `CHANGES_REQUESTED`, `REVIEW_REQUIRED`, `UNKNOWN` and added DB enum migration | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java`, `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubPullRequestMetadataAdapter.java`, `EDCAP_BE/src/main/resources/db/migration/V182__git_pr_metadata_collector_review_state_enum.sql` |
| Missing admin-negative coverage | Added service test for `ForbiddenException` when manual collect is called by non-admin | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorServiceTest.java` |
| Controller slice fragility | Kept a dedicated Spring test app with explicit exclusions | `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/GitPrMetadataCollectorControllerTest.java` |

## 7. Not yet fixed / Pending

- Live GitHub pagination and rate-limit behavior for unusually large repositories remains an operational follow-up item.
- Queue/background execution remains post-MVP by design.

## 8. Test cannot be executed and reason

| test/command | reason | risk | alternative evidence |
|---|---|---|---|
| FE commands (`npm run typecheck`, `npm run test`, `npm run build`) | No FE files were changed in this ticket | Low | Backend-only change set |

## 9. Remaining risk

- The main remaining risk is external GitHub pagination and rate-limit behavior for unusually large PRs/repos.

## 10. Final Test Verdict

- PASS
