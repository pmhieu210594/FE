# Final Report

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-17  
**Author**: nk_trung
**Update date**: 2026-06-18  

## 1. Edited summary

- Implemented a Git/PR metadata collector for the MVP backend, covering manual collection and webhook-triggered collection behind the existing GitHub webhook flow.
- Persisted PR metadata, commit metadata, changed-file metadata, traceability links, and run logs with additive schema changes.
- Kept Artifact Scanner compatibility by reusing existing ticket records and not storing raw diff/source/prompt/secrets.
- Closed the final review gap by normalizing review state to the spec-approved set and adding the missing negative permission coverage.
- Completed black-box validation for the ticket and marked the BB checklist pass.

## 2. Corresponding specification / AC
| ACID | status | evidence |
|---|---|---|
| AC-GIT-PR-METADATA-COLLECTOR-1 | DONE | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/GitPrMetadataCollectorController.java`, `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/GitPrMetadataCollectorControllerTest.java` |
| AC-GIT-PR-METADATA-COLLECTOR-2 | DONE | Repository-level and PR-specific manual collect endpoints are implemented in `GitPrMetadataCollectorController.java` |
| AC-GIT-PR-METADATA-COLLECTOR-3 | DONE | `GitPrMetadataCollectorService.java` enforces `ADMIN` for manual collection; negative test added |
| AC-GIT-PR-METADATA-COLLECTOR-4 | DONE | `GithubWebhookService.java` delegates supported PR events into the collector flow |
| AC-GIT-PR-METADATA-COLLECTOR-5 | DONE | `GithubWebhookServiceTest.java` validates invalid/missing signature rejection |
| AC-GIT-PR-METADATA-COLLECTOR-6 | DONE | `GitPrMetadataCollectorJdbcAdapter.java` persists PR number/ID/title/status/branches/timestamps/URL |
| AC-GIT-PR-METADATA-COLLECTOR-7 | DONE | `GitPrMetadataCollectorService.java` normalizes PR status to `OPEN`, `MERGED`, `CLOSED`, `UNKNOWN` |
| AC-GIT-PR-METADATA-COLLECTOR-8 | DONE | `GitPrMetadataCollectorService.java`, `GithubPullRequestMetadataAdapter.java`, and `V182__git_pr_metadata_collector_review_state_enum.sql` align review state to `APPROVED`, `CHANGES_REQUESTED`, `REVIEW_REQUIRED`, `UNKNOWN` |
| AC-GIT-PR-METADATA-COLLECTOR-9 | DONE | `GitPrMetadataCollectorJdbcAdapter.java` persists commit hash/message hash/committed time/author pseudonym/branch/URL |
| AC-GIT-PR-METADATA-COLLECTOR-10 | DONE | `tbl_fact_pull_request_changed_file` is created and populated for PR changed-file metadata |
| AC-GIT-PR-METADATA-COLLECTOR-11 | DONE | `GitPrMetadataCollectorService.java` implements the approved ticket inference priority |
| AC-GIT-PR-METADATA-COLLECTOR-12 | DONE | Collector persists PR/commit metadata even when ticket inference fails |
| AC-GIT-PR-METADATA-COLLECTOR-13 | DONE | Existing ticket records are reused instead of duplicated |
| AC-GIT-PR-METADATA-COLLECTOR-14 | DONE | Metadata persistence is independent from evidence folder existence |
| AC-GIT-PR-METADATA-COLLECTOR-15 | DONE | Ticket -> PR traceability is written by the persistence adapter |
| AC-GIT-PR-METADATA-COLLECTOR-16 | DONE | PR -> Commit traceability is written by the persistence adapter |
| AC-GIT-PR-METADATA-COLLECTOR-17 | DONE | PR -> Changed File traceability is written by the persistence adapter |
| AC-GIT-PR-METADATA-COLLECTOR-18 | DONE | Stable upserts keep repeated deliveries and manual reruns idempotent |
| AC-GIT-PR-METADATA-COLLECTOR-19 | DONE | `tbl_connector_run` is updated with final status and counts |
| AC-GIT-PR-METADATA-COLLECTOR-20 | DONE | Safe error handling and trace ID propagation are implemented in service/webhook flow |
| AC-GIT-PR-METADATA-COLLECTOR-21 | DONE | No raw diff/source/secret storage was added |
| AC-GIT-PR-METADATA-COLLECTOR-22 | DONE | Existing Artifact Scanner flow remains compatible after collector execution |
| AC-GIT-PR-METADATA-COLLECTOR-23 | DONE | The persisted graph supports Ticket -> PR -> Commit -> Changed Files traceability |

## 3. Scope of influence

- Backend webhook flow and PR event dispatch
- Backend manual collect API for admin operations
- GitHub integration adapter and provider field mapping
- Persistence and migrations for PR metadata collector
- Test artifacts and run log handling
- Documentation artifacts for review, test, and final report

## 4. Implementation content
| file | summary | reasons |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorModels.java` | Shared collector models | Carries run, PR, commit, file, and traceability payloads |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/GithubPullRequestMetadataPort.java` | GitHub metadata port | Encapsulates provider fetch contract |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/GitPrMetadataCollectorPersistencePort.java` | Collector persistence port | Isolates database writes and idempotent upserts |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | Collector orchestration | Core use case for manual and webhook-triggered collection |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubPullRequestMetadataAdapter.java` | GitHub adapter | Fetches PR graph, commits, files, and review state |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/GitPrMetadataCollectorJdbcAdapter.java` | JDBC adapter | Writes PR, commit, file, traceability, and run records |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/GitPrMetadataCollectorDtos.java` | Manual API DTOs | Request/response contract for the admin endpoints |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/GitPrMetadataCollectorController.java` | Manual controller | Admin and repository/PR entrypoints |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | Webhook orchestration | Delegates supported PR events into collector flow and preserves scanner compatibility |
| `EDCAP_BE/src/main/resources/db/migration/V180__git_pr_metadata_collector.sql` | Migration | Adds enum values required by the collector |
| `EDCAP_BE/src/main/resources/db/migration/V181__git_pr_metadata_collector_schema.sql` | Migration | Adds collector columns and changed-file table |
| `EDCAP_BE/src/main/resources/db/migration/V182__git_pr_metadata_collector_review_state_enum.sql` | Migration | Adds `REVIEW_REQUIRED` to the review-state enum |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorServiceTest.java` | Unit tests | Collector logic, inference, idempotency, and review-state coverage |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` | Unit tests | Webhook signature and dispatch regression coverage |
| `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/GitPrMetadataCollectorControllerTest.java` | MVC test | Manual API permission and response coverage |
| `docs/changes/GIT-PR-METADATA-COLLECTOR/test-results.md` | Test results | Final validation evidence |
| `docs/changes/GIT-PR-METADATA-COLLECTOR/report.md` | Final report | Final synthesis artifact |
| `docs/changes/GIT-PR-METADATA-COLLECTOR/promotion-candidates.md` | Promotion candidates | Candidate docs/rules/architecture updates |

## 5. Review results

| review type | result | notes |
|---|---|---|
| Self Review | PASS | Final self-review is aligned with the code and tests after the review-state fix |
| Independent AI Review | PASS | Previous AC gap was resolved; no remaining Blocker/Major findings |
| Human Review | APPROVED | Human review accepted the final implementation and docs |

## 6. Test results
| test type | result | evidence |
|---|---|---|
| Targeted collector slice | PASS | `mvn -q "-Dtest=GitPrMetadataCollectorServiceTest,GithubWebhookServiceTest,GitPrMetadataCollectorControllerTest" test` |
| BE UT aggregate | PASS | 23/23 BE unit tests passed, 0 failed (`GitPrMetadataCollectorServiceTest` 6 + `GithubWebhookServiceTest` 17) |
| BE IT aggregate | PASS | 1/1 BE integration/MVC test passed, 0 failed (`GitPrMetadataCollectorControllerTest`) |
| Black-box checklist | PASS | `docs/changes/GIT-PR-METADATA-COLLECTOR/blackbox-review-checklist.md` marked pass for all BB items; 21/21 passed, 0 failed |

## 7. Security / operations perspective

- GitHub webhook signatures are verified before business processing.
- Manual collection is restricted to `ADMIN`.
- No raw diff, raw source content, raw prompt/chat, secret, or token persistence was added.
- Each run writes traceable run metadata for operational debugging.
- Synchronous processing remains acceptable for the MVP, but larger PRs may still be constrained by provider limits.

## 8. Accepted Risk
| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| Queue/background processing not in MVP | Large PRs can still take longer and depend on GitHub rate limits | BE | Post-MVP | Human review |

## 9. Open Issues
| issue | impact | next action |
|---|---|---|
| Live GitHub pagination and rate-limit behavior for unusually large PRs/repos | May affect collection latency or partial success in production | Validate during rollout and operational monitoring |
| Queue/background collector execution | Could improve resilience for very large collections | Consider as a post-MVP architecture follow-up |

## 10. Human Decisions
| decision | owner | result |
|---|---|---|
| Provider MVP | Human clarified | GitHub |
| Webhook endpoint strategy | Human clarified | Reuse the existing endpoint |
| Manual API permission | Ticket rule/context | `ADMIN`-only in MVP |
| Branch policy | Human clarified | `main/develop` with backend validation |
| Review-state fallback | Spec decision | `REVIEW_REQUIRED` / `UNKNOWN` normalization applied |

## 11. Exception Record Summary

No exception signal (e.g. `NO_VERIFY`, `CI_SKIP`) was recorded for this ticket; all local checks, reviews, and tests referenced in Sections 5, 6, 8, 9, and 10 were run and closed through their normal path.

| exception_type | source_section | reason | approved_by_role | expiry | follow_up | status |
|---|---|---|---|---|---|---|
| None | N/A | N/A | N/A | N/A | N/A | N/A |

## 12. Source Analysis Limitations

- Local source and tests confirm implementation shape, but live GitHub API behavior still depends on provider limits and network conditions.
- Large-PR pagination and rate-limit behavior were not validated against a live repository in this phase.

## 13. What worked

- Existing webhook, scanner, and connector-run patterns fit the collector cleanly.
- Additive migrations made the change safe to land without rewriting existing tables.
- Targeted Maven slices were enough to validate the final fix quickly.

## 14. What failed

- The first review pass missed a spec gap in `review_state` and a negative permission test.
- That gap is now corrected, but it highlighted the need for explicit enum normalization tests when provider values and spec values differ.

## 15. Candidate updates Failure Mode Index

- Review-state enum drift between provider and DB: provider values can lag behind the spec-approved domain set.
- Spring controller slice conflict: over-broad test configuration can break MVC tests when multiple boot configs exist.
- Ticket inference false positives from generic branch tokens: stop-word filtering is required to avoid accidental ticket matches.

## 16. Candidate updates Living Docs

- `docs/standards/testing.md`: add the collector regression slice and the permission-negative API test pattern.
- `docs/architecture/data-flow-map.md`: add the final `GitHub webhook -> collector -> Artifact Scanner` handoff.
- `docs/architecture/overview.md`: note the collector as a first-class ingestion path in the MVP backend.

## 17. Final Verdict

- DONE
