# Test Plan

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-17
**Author**: nk_trung
**Update date**: 2026-06-18

## 1. Purpose

- Define the test strategy for the Git/PR Metadata Collector MVP, covering the webhook path, manual API, persistence, permissions, idempotency, branch policy, ticket inference, traceability, run logs, and regression with Artifact Scanner.
- The test code for this ticket has been implemented and is passing; this document is used to finalize the AC scope, the existing coverage, and the areas intentionally left untested.

## 2. AC Matrix ↔ Test Type
| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-GIT-PR-METADATA-COLLECTOR-1 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-2 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-3 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-4 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-5 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-6 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-7 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-8 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-9 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-10 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-11 | N/A | Added | N/A | N/A | N/A | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-12 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-13 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-14 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-15 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-16 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-17 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-18 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-19 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-20 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-21 | N/A | Added | N/A | N/A | N/A | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-22 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-GIT-PR-METADATA-COLLECTOR-23 | N/A | Added | Added | N/A | Added | N/A | Added |

## 3. Priority
| test item | priority | reason |
|---|---|---|
| Manual collect `ADMIN` only + specific PR number | P0 | Security and operational requirement |
| Webhook signature verification + supported PR event dispatch | P0 | Main entry path of the MVP |
| Idempotency / duplicate delivery / rerun safety | P0 | Webhook retries and manual reruns must be safe |
| Core PR persistence + traceability links | P0 | Required to build the Ticket -> PR -> Commit -> Changed Files graph |
| Branch skip / unknown repo / invalid payload | P0 | Important error/skip path |
| Ticket inference priority + ambiguity handling | P1 | Important business rule |
| Review state normalization + UNKNOWN fallback | P1 | MVP behavior already finalized |
| Safe error logging + traceId | P1 | Important for triage when provider/API fails |
| Artifact Scanner compatibility regression | P0 | Existing behavior must not break |
| Large PR / pagination behavior | P2 | Depends on the real GitHub API limits |

## 4. Reuse Existing Test
| existing test | path | covers | gap |
|---|---|---|---|
| `GitPrMetadataCollectorServiceTest` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorServiceTest.java` | Ticket inference priority, status normalization, review fallback, safe failure handling, idempotency helpers | Does not replace integration checks for DB/run log |
| `GitPrMetadataCollectorControllerTest` | `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/GitPrMetadataCollectorControllerTest.java` | Manual collect API, admin permission, request/response shape | Does not cover provider fetch and detailed persistence graph |
| `GithubWebhookServiceTest` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` | Signature verification, supported PR webhook dispatch, ignored/invalid paths, scanner regression entrypoint | Does not cover internal collector persistence |
| Existing Artifact Scanner tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerServiceTest.java` and integration equivalents | Regression patterns for run/idempotency and scanner compatibility | Does not cover the new manual collect flow and PR metadata graph |

## 5. Additional Test This Time
| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-GIT-PR-METADATA-COLLECTOR-1 | Manual collect by admin for repository and PR number | API IT | manual collector controller | AC-GIT-PR-METADATA-COLLECTOR-1, AC-GIT-PR-METADATA-COLLECTOR-2, AC-GIT-PR-METADATA-COLLECTOR-3, AC-GIT-PR-METADATA-COLLECTOR-13,AC-GIT-PR-METADATA-COLLECTOR-19 |
| TC-GIT-PR-METADATA-COLLECTOR-2 | Webhook opened/synchronize/reopened/closed | BE UT / API IT | webhook service/controller | AC-GIT-PR-METADATA-COLLECTOR-4, AC-GIT-PR-METADATA-COLLECTOR-5, AC-GIT-PR-METADATA-COLLECTOR-22 |
| TC-GIT-PR-METADATA-COLLECTOR-3 | Duplicate delivery idempotent | API IT / DB IT | persistence + webhook flow | AC-GIT-PR-METADATA-COLLECTOR-18, AC-GIT-PR-METADATA-COLLECTOR-19 |
| TC-GIT-PR-METADATA-COLLECTOR-4 | Branch not allowed / unknown repo / malformed payload | BE UT / API IT | policy and error handling | AC-GIT-PR-METADATA-COLLECTOR-4, AC-GIT-PR-METADATA-COLLECTOR-5, AC-GIT-PR-METADATA-COLLECTOR-12, AC-GIT-PR-METADATA-COLLECTOR-20 |
| TC-GIT-PR-METADATA-COLLECTOR-5 | Ticket inference by title/branch/path/commit message | BE UT | inference helper | AC-GIT-PR-METADATA-COLLECTOR-11, AC-GIT-PR-METADATA-COLLECTOR-12 |
| TC-GIT-PR-METADATA-COLLECTOR-6 | Ambiguous ticket candidate handling | BE UT / API IT | inference + run status | AC-GIT-PR-METADATA-COLLECTOR-11, AC-GIT-PR-METADATA-COLLECTOR-12, AC-GIT-PR-METADATA-COLLECTOR-20 |
| TC-GIT-PR-METADATA-COLLECTOR-7 | GitHub API timeout/429/5xx | BE UT | service error handling | AC-GIT-PR-METADATA-COLLECTOR-20 |
| TC-GIT-PR-METADATA-COLLECTOR-8 | Review state UNKNOWN fallback | BE UT | provider mapping | AC-GIT-PR-METADATA-COLLECTOR-8 |
| TC-GIT-PR-METADATA-COLLECTOR-9 | PR core metadata persistence | DB IT | PR adapter/migration | AC-GIT-PR-METADATA-COLLECTOR-6, AC-GIT-PR-METADATA-COLLECTOR-7, AC-GIT-PR-METADATA-COLLECTOR-8, AC-GIT-PR-METADATA-COLLECTOR-9 |
| TC-GIT-PR-METADATA-COLLECTOR-10 | Changed file metadata persistence | DB IT | changed-file adapter/migration | AC-GIT-PR-METADATA-COLLECTOR-10, AC-GIT-PR-METADATA-COLLECTOR-17 |
| TC-GIT-PR-METADATA-COLLECTOR-11 | Traceability links and run log | DB IT | persistence graph | AC-GIT-PR-METADATA-COLLECTOR-15, AC-GIT-PR-METADATA-COLLECTOR-16, AC-GIT-PR-METADATA-COLLECTOR-17, AC-GIT-PR-METADATA-COLLECTOR-19, AC-GIT-PR-METADATA-COLLECTOR-23 |
| TC-GIT-PR-METADATA-COLLECTOR-12 | No raw source/diff/secret persistence | Data assertion / code review test | persistence adapter and schema | AC-GIT-PR-METADATA-COLLECTOR-21 |

### E2E Step-by-step Scenarios
- This feature does not include E2E

## 6. Areas intentionally left untested this time
| area | reason | risk |
|---|---|---|
| FE production UI | Out of scope for the MVP | Low |
| Multi-provider behavior | GitHub only in the MVP | Low |
| Queue/background processing | Not used in the MVP | Medium if PRs are very large |
| Live GitHub rate-limit behavior for very large PRs | Depends on token/quota and real repository size | Medium |

## 7. Data testing principles

- Do not use real production data.
- Test data must be deterministic, minimal, but still include enough fields for `repositoryId`, `prNumber`, `title`, `branch`, `commit hash`, `file path`, `action`, and `traceId`.
- Seed data for `ADMIN`, `VIEWER`, `EDITOR`, known repo, unknown repo, existing ticket, missing ticket, and missing evidence folder.
- Webhook test payloads must be minimal but sufficient to verify signature, PR action, repo full name, PR number, and branch policy.
- Use separate fixtures for title/branch/commit/path to test inference priority and ambiguity.
- Do not store secret/token/raw payload/raw diff/raw patch in artifacts or test fixtures.

## 8. Execution command
| command | purpose |
|---|---|
| `mvn clean test -Dtest=GitPrMetadataCollectorControllerTest` | Run a clean rebuild and verify the manual controller slice |
| `mvn test` | Run the full backend unit/integration suite after collector changes |
| `mvn test -Dtest=GitPrMetadataCollectorControllerTest` | Re-run the manual controller test after fixing context issues |
| `mvn test -Dtest=GitPrMetadataCollectorServiceTest,GithubWebhookServiceTest` | Run the core collector and webhook unit tests when isolation is needed |

## 9. Stop Condition

- The GitHub API field mapping is not sufficient to write deterministic tests for some special payloads.
- A large schema migration impacts DB integration test stability.
- A manual API contract change requires the controller test to be synchronized again.

## 10. Required Human Decision

- None in Phase 6. The main human decisions were already finalized in Phase 1 and reflected in the current test coverage.