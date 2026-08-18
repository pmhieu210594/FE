# Final Report

**Ticket ID**: CI-RUN-METADATA  
**Create date**: 2026-06-17  
**Author**: ChatGPT  
**Update date**: 2026-06-18

## 1. Edited summary

Implemented the CI Run Metadata MVP backend path for GitHub Actions `workflow_job` events.

The implementation keeps the ticket metadata-first:

- one row per GitHub Actions job
- `external_run_id` stores workflow run ID
- `external_job_id` stores job ID
- job URL is preferred, workflow run URL is fallback
- repository linkage is mandatory
- PR and ticket linkage are best-effort
- connector execution is recorded with explicit counters

## 2. Corresponding specification / AC

| ACID | status | evidence |
|---|---|---|
| AC-CI-RUN-METADATA-1 | PASS | `GithubWorkflowJobWebhookService` handles `workflow_job` payloads |
| AC-CI-RUN-METADATA-2 | PASS | One webhook event persists one CI job row |
| AC-CI-RUN-METADATA-3 | PASS | Required workflow/job/status/time/url fields are persisted |
| AC-CI-RUN-METADATA-4 | PASS | Only approved `tbl_` tables are used |
| AC-CI-RUN-METADATA-5 | PASS | Repository must resolve before the CI row is written |
| AC-CI-RUN-METADATA-6 | PASS | PR linkage is resolved when PR number is present |
| AC-CI-RUN-METADATA-7 | PASS | Ticket linkage is best-effort through PR or branch inference |
| AC-CI-RUN-METADATA-8 | PASS | Upsert is keyed by provider + repository + workflow run + job |
| AC-CI-RUN-METADATA-9 | PASS | Running jobs allow `completed_at = null` and map to `IN_PROGRESS` / `QUEUED` |
| AC-CI-RUN-METADATA-10 | PASS | Connector run failure is recorded on bad payload / processing failure |
| AC-CI-RUN-METADATA-11 | PASS | No raw log / token / secret / private key / full artifact is persisted |
| AC-CI-RUN-METADATA-12 | N/A | FE/query scope was not confirmed |
| AC-CI-RUN-METADATA-13 | N/A | FE/query scope was not confirmed |

## 3. Scope of influence

- Backend ingestion path for GitHub webhook events
- CI persistence schema and connector-run logging
- Existing GitHub webhook controller routing
- Unit tests for CI mapping helpers
- No FE pages or FE API helpers were added

## 4. Implementation content

| file | summary | reasons |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/CiRun.java` | Converted CI model to job-level fields | Match required persistence grain |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/ConnectorRun.java` | Expanded connector logging counters | Capture received / inserted / updated / skipped / error |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | UUID connector run DTO id | Align DTO with UUID persistence ids |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/CiRunRepositoryPort.java` | New persistence port | Clean boundary for CI lookup/upsert/logging |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CiRunJdbcAdapter.java` | JDBC persistence implementation | Resolve repository/PR/ticket and upsert CI rows |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/CiRunModels.java` | Shared ingestion shapes | Keep service/adapter code small |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWorkflowJobMapper.java` | Mapping helpers | Normalize status, URL, ticket-key extraction |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWorkflowJobWebhookService.java` | New collector service | Handle `workflow_job` webhook ingestion |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | Routed workflow_job to new collector | Reuse existing GitHub webhook endpoint |
| `EDCAP_BE/src/main/resources/db/migration/V200__ci_run_metadata.sql` | Additive migration for job-level CI schema | Reconcile table grain and connector counters |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWorkflowJobMapperTest.java` | Helper unit tests | Verify status / URL / ticket extraction |
| `EDCAP_BE/documents/docs/changes/CI-RUN-METADATA/self-review.md` | Filled self-review | Required review artifact |

## 5. Review results

| review type | result | notes |
|---|---|---|
| Self Review | PASS | Filled with AC mapping, risks, and test evidence |
| Independent AI Review | PASS | Current implementation matches spec-pack scope, with FE/query left N/A |
| Human Review | APPROVED | Human review recorded in `human-review.md`; FE/query stays N/A and residual delivery risk is accepted |

## 6. Test results

| test type | result | evidence |
|---|---|---|
| Backend build/test | PASS | `mvn test -q` completed successfully |
| Unit tests | PASS | `GithubWebhookControllerTest`, `GithubWorkflowJobWebhookServiceTest`, `ArtifactScannerServiceTest`, and `SecurityEvidenceIngestService` logs were present in the Maven run |
| Migration review | PASS | Additive migration added `tbl_fact_ci_run` / `tbl_connector_run` reconciliation and connector seed |

## 7. Security / operations perspective

- Raw CI logs, tokens, secrets, private keys, and full artifacts are not stored.
- Connector failures are recorded in `tbl_connector_run` with explicit counters and error message.
- Webhook signature verification is preserved through the existing GitHub HMAC secret flow.
- The migration is additive, so rollback is forward-fix or restore-based rather than destructive.

## 8. Accepted Risk

| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| FE/query surface not implemented | AC-12 and AC-13 remain outside the current backend-only scope | PM / FE | Follow-up ticket | Pending |
| Legacy CI columns remain present for compatibility | Old columns stay in the table until a future cleanup migration | BE / DB | Follow-up planning | Pending |
| Ticket linkage is best-effort | Some rows may remain unlinked when metadata is insufficient | BE / PM | MVP acceptance | Pending |

## 9. Open Issues

| issue | impact | next action |
|---|---|---|
| FE/query scope not confirmed | UI work is intentionally deferred | Confirm whether AC-12 / AC-13 should become a separate ticket or remain N/A |
| Legacy CI column cleanup preference not confirmed | Future schema cleanup decision remains open | Decide whether `external_ci_run_id`, `pr_id`, and `finished_at` should be deprecated later |

## 10. Human Decisions

| decision | owner | result |
|---|---|---|
| FE/query scope | PM / FE | Accepted as N/A for this ticket |
| Legacy CI column cleanup | BE / DB | Deferred for follow-up planning |

## 11. Exception Record Summary

| exception_type | source_section | reason | approved_by_role | expiry | follow_up | status |
|---|---|---|---|---|---|---|
| `SCOPE_DEFERRED` | Section 2 (AC-12, AC-13), Section 8, Section 9, Section 10 | FE/query surface was intentionally left out of this MVP; backend-only ingestion path was the agreed scope | PM / FE | Follow-up ticket | Confirm whether AC-12 / AC-13 become a separate ticket or remain N/A | ACK |
| `TECH_DEBT_DEFERRED` | Section 8, Section 9, Section 10 | Legacy CI columns (`external_ci_run_id`, `pr_id`, `finished_at`) were kept for compatibility instead of being removed in this migration | BE / DB | Follow-up planning | Decide whether legacy columns should be deprecated in a future cleanup migration | ACK |

## 12. Source Analysis Limitations

- GitHub Actions workflow_job payload shape was implemented from the current project/webhook pattern and documented MVP requirements.
- Backend tests passed, but live GitHub webhook delivery was not exercised in this environment.

## 13. What worked

- Reusing the existing GitHub webhook controller kept the diff small.
- The additive migration avoided destructive schema changes.
- Helper extraction made status and URL logic easy to unit test.

## 14. What failed

- The first Maven run was blocked by sandboxed network access to Maven Central.
- The first compile attempt exposed a getter mismatch on `EvidenceRepository`, which was fixed immediately.

## 15. Candidate updates Failure Mode Index

- Missing existing CI row id on update path
- Invalid getter usage on Lombok beans
- Unsupported SQL constraint syntax in migration
- Raw timestamp parsing bubbling as 500
- Live GitHub delivery not exercised in local test run

## 16. Candidate updates Living Docs

- `documents/docs/changes/CI-RUN-METADATA/self-review.md`
- `documents/docs/changes/CI-RUN-METADATA/report.md`
- `documents/docs/changes/CI-RUN-METADATA/impl-plan.md`
- `documents/docs/changes/CI-RUN-METADATA/promotion-candidates.md`

## 17. Final Verdict

- DONE
