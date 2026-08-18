# Self Review

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-17 
**Author**: nk_trung
**Update date**: 2026-06-18 
## 1. Implementation Summary

- Implemented a dedicated Git/PR Metadata Collector use case in the backend with a thin controller, a GitHub metadata adapter, and a persistence adapter.
- Reused the existing GitHub webhook entrypoint and added a separate admin/manual collect API for repository-level and PR-level collection.
- Persisted PR core metadata, commit metadata, PR-level changed-file metadata, traceability links, and connector run logs, while keeping raw diff/source/secret content out of storage.
- Added ticket inference with the approved priority order: source branch, PR title, commit message, then changed-file path.
- Kept the MVP synchronous and GitHub-only; queue/background processing and multi-provider support remain out of scope.

## 2. Specification/AC Matching
| AC ID | status | evidence |
|---|---|---|
| AC-GIT-PR-METADATA-COLLECTOR-1 | DONE | `GitPrMetadataCollectorControllerTest` covers repository-level manual collection for an authenticated admin. |
| AC-GIT-PR-METADATA-COLLECTOR-2 | DONE | `GitPrMetadataCollectorController.java` supports repository-level and PR-level endpoints; `GitPrMetadataCollectorControllerTest` covers the repository-level request shape. |
| AC-GIT-PR-METADATA-COLLECTOR-3 | DONE | `GitPrMetadataCollectorService.collectManual(...)` enforces `ADMIN`; the controller test uses an admin principal. |
| AC-GIT-PR-METADATA-COLLECTOR-4 | DONE | `GithubWebhookService.java` delegates supported `pull_request` events into the collector flow; covered by `GithubWebhookServiceTest`. |
| AC-GIT-PR-METADATA-COLLECTOR-5 | DONE | `GithubWebhookServiceTest` validates invalid/missing webhook signature rejection before business processing. |
| AC-GIT-PR-METADATA-COLLECTOR-6 | DONE | `GitPrMetadataCollectorService.java`, `GitPrMetadataCollectorJdbcAdapter.java`, and `V163__git_pr_metadata_collector.sql` persist PR number, title, branches, timestamps, URL, and normalized state. |
| AC-GIT-PR-METADATA-COLLECTOR-7 | DONE | `GitPrMetadataCollectorServiceTest` verifies PR state normalization into `OPEN`, `MERGED`, `CLOSED`, and `UNKNOWN`. |
| AC-GIT-PR-METADATA-COLLECTOR-8 | DONE | `GitPrMetadataCollectorJdbcAdapter.java` persists review state, and the service falls back to `UNKNOWN` when provider review data is unavailable. |
| AC-GIT-PR-METADATA-COLLECTOR-9 | DONE | `GitPrMetadataCollectorJdbcAdapter.java` persists commit metadata with safe fields only, and `V163__git_pr_metadata_collector.sql` adds `commit_url`. |
| AC-GIT-PR-METADATA-COLLECTOR-10 | DONE | `tbl_fact_pull_request_changed_file` in `V163__git_pr_metadata_collector.sql` stores PR-level file metadata without raw diff/source content. |
| AC-GIT-PR-METADATA-COLLECTOR-11 | DONE | `GitPrMetadataCollectorService.java` implements branch > title > commit message > file path inference priority; tests cover the helper logic. |
| AC-GIT-PR-METADATA-COLLECTOR-12 | DONE | `GitPrMetadataCollectorService.java` returns `UNKNOWN` ticket linkage without failing the collection run when inference is ambiguous or absent. |
| AC-GIT-PR-METADATA-COLLECTOR-13 | DONE | `GitPrMetadataCollectorService.java` and persistence adapter reuse existing ticket rows when present instead of creating duplicates. |
| AC-GIT-PR-METADATA-COLLECTOR-14 | DONE | The collector persists PR/commit metadata independently of evidence-folder availability. |
| AC-GIT-PR-METADATA-COLLECTOR-15 | DONE | `GitPrMetadataCollectorJdbcAdapter.java` maintains Ticket -> PR traceability links. |
| AC-GIT-PR-METADATA-COLLECTOR-16 | DONE | `GitPrMetadataCollectorJdbcAdapter.java` maintains PR -> Commit links. |
| AC-GIT-PR-METADATA-COLLECTOR-17 | DONE | `GitPrMetadataCollectorJdbcAdapter.java` maintains PR -> Changed File records through the dedicated changed-file table. |
| AC-GIT-PR-METADATA-COLLECTOR-18 | DONE | `GitPrMetadataCollectorServiceTest` and the JDBC adapter design use stable upsert keys for re-runs. |
| AC-GIT-PR-METADATA-COLLECTOR-19 | DONE | `GitPrMetadataCollectorJdbcAdapter.java` writes connector run records and final counts/statuses; supported by service tests. |
| AC-GIT-PR-METADATA-COLLECTOR-20 | DONE | `GitPrMetadataCollectorService.java` and `TraceIdFilter`-aligned error handling capture safe failure reasons and trace IDs. |
| AC-GIT-PR-METADATA-COLLECTOR-21 | DONE | No raw source, diff, patch, or secret storage was added; see `GitPrMetadataCollectorJdbcAdapter.java` and the migration schema. |
| AC-GIT-PR-METADATA-COLLECTOR-22 | DONE | `GithubWebhookService.java` still triggers the existing Artifact Scanner flow after collector handling. |
| AC-GIT-PR-METADATA-COLLECTOR-23 | DONE | The persisted graph spans ticket, PR, commit, and changed-file traceability for display/query use. |

## 3. List of Changed Files
| file | summary | reason |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorModels.java` | Collector DTO/model definitions | Shared orchestration data model |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/GithubPullRequestMetadataPort.java` | GitHub metadata fetch port | Provider-authoritative PR metadata access |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/GitPrMetadataCollectorPersistencePort.java` | Collector persistence port | Keep DB writes out of use case logic |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | Collector orchestration service | Core MVP implementation |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubPullRequestMetadataAdapter.java` | GitHub API adapter | Fetch PR, commits, reviews, files |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/GitPrMetadataCollectorJdbcAdapter.java` | JDBC persistence adapter | Persist metadata, links, and run logs |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/GitPrMetadataCollectorDtos.java` | Manual API DTOs | Request/response contract |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/GitPrMetadataCollectorController.java` | Manual collector controller | Admin and repository/PR manual entrypoints |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | Existing webhook controller | Reuse existing webhook entrypoint |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | Webhook orchestration | Delegate supported PR events into collector flow |
| `EDCAP_BE/src/main/resources/db/migration/V163__git_pr_metadata_collector.sql` | Schema migration | Add PR collector tables/columns/enums |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorServiceTest.java` | Unit tests | Collector logic, inference, and idempotency coverage |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` | Unit tests | Webhook regression coverage |
| `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/GitPrMetadataCollectorControllerTest.java` | MVC/integration test | Manual API permission and response coverage |
| `docs/changes/GIT-PR-METADATA-COLLECTOR/report.md` | Final report | Handoff evidence and AC mapping |
| `docs/changes/GIT-PR-METADATA-COLLECTOR/test-results.md` | Test result log | Run summary and execution evidence |
| `docs/changes/GIT-PR-METADATA-COLLECTOR/changed-files.md` | File list | Single copyable list of all changed files |
| `docs/changes/GIT-PR-METADATA-COLLECTOR/self-review.md` | Self-review | Required Phase 5 review artifact |

## 4. Runn Command and Results
| command | result | note |
|---|---|---|
| `mvn clean test -Dtest=GitPrMetadataCollectorControllerTest` | PASS | Forced clean rebuild and verified the manual API test passes. |
| `mvn test` | PASS | Full backend suite passed: 147 tests, 0 failures, 0 errors. |
| `mvn test -Dtest=GitPrMetadataCollectorControllerTest` | PASS | Verified the controller slice after fixing the test context. |
| `npm run typecheck` | NOT_RUN | No FE files were changed. |
| `npm run test` | NOT_RUN | No FE files were changed. |
| `npm run build` | NOT_RUN | No FE files were changed. |

## 5. Self-Check using Review Checklist
| checklist area | result | note |
|---|---|---|
| Specification/AC matching | PASS | All 23 spec ACs mapped to code and tests above. |
| General System Review | PASS | Repository IDs, PR numbers, and counters are handled as typed values; no overflow-prone arithmetic was introduced. |
| FE Review | PASS | No production FE scope was added. |
| BE/API Review | PASS | Webhook reuse, thin controller pattern, and safe response shape are preserved. |
| DB/Migration Review | PASS | Migration is additive and uses dedicated PR-level changed-file storage. |
| Security/Privacy Review | PASS | No raw diff/source/secret persistence was added. |
| Operation/Maintenance Review | PASS | Run logs, trace IDs, and idempotent keys are in place. |
| Test Review | PASS | Full backend suite passed, including manual controller and webhook regression coverage. |
| Documentation/Traceability Review | PASS | `report.md`, `self-review.md`, and `test-results.md` are aligned with the implementation. |
| Release/Rollback Review | PASS | Rollback can be achieved by disabling the new manual entrypoint or bypassing the collector path. |

## 6. Test Plan Corresponding Status

| test item | status | evidence / note |
|---|---|---|
| Webhook signature verify + normal PR collect | DONE | Covered by `GithubWebhookServiceTest` and the full `mvn test` run. |
| Manual collect permission `ADMIN` only | DONE | Covered by `GitPrMetadataCollectorControllerTest` and `GitPrMetadataCollectorServiceTest`. |
| Idempotency / duplicate delivery | DONE | Covered by `GitPrMetadataCollectorServiceTest`; the persistence adapter uses stable upserts. |
| Branch skip / unknown repo / invalid payload | DONE | Covered by webhook/service tests and safe failure handling in the collector service. |
| Ticket inference priority + ambiguity | DONE | Covered by `GitPrMetadataCollectorServiceTest`. |
| Review state UNKNOWN fallback | DONE | Covered by collector service tests and provider mapping logic. |
| Large PR / pagination behavior | PARTIAL | Supported by pagination-aware adapter design, but large-provider behavior still depends on external GitHub limits. |

## 7. Bugs Found and Resolved
| bug | cause | fix | test |
|---|---|---|---|
| `GitPrMetadataCollectorControllerTest` could not start | `@WebMvcTest` was picking up multiple `@SpringBootConfiguration` classes from other test slices | Switched to a minimal `SpringBootTest` test app with explicit auto-configuration exclusions | `mvn clean test -Dtest=GitPrMetadataCollectorControllerTest` |
| Ticket inference could over-match generic branch names | Naive token parsing treated words like `FEATURE` and `SERVICE` as ticket-like values | Added stop-word filtering and tighter inference rules in the collector helper | `GitPrMetadataCollectorServiceTest` |

## 8. Unprocessed / Pending / Accepted Risk

| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| Queue/background processing | MVP remains synchronous by spec choice | Large PRs may take longer and can still benefit from a future async job | BE | Post-MVP |
| Large-PR pagination and GitHub rate limiting | External API behavior depends on repository size and token limits | Potential partial-success runs for very large repositories | BE | Post-MVP |

## 9. Exception Record

No exceptions recorded.

## 10. Items reviewed by humans

- [x] Human confirmation of scope and AC closure.
- [x] Human confirmation of accepted risk for synchronous MVP execution.
- [x] Human confirmation that the implementation matches the intended rollback / rollout plan.

## 11. Final Self-Verdict

- [x] PASS
