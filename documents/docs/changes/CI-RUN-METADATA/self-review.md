# Self Review

**Ticket ID**: CI-RUN-METADATA  
**Phase**: Phase 5 - Implementation / AI Review / Human Review  
**Create date**: 2026-06-17  
**Author**: ChatGPT  
**Update date**: 2026-06-17

## 1. Implementation Summary

Implemented a backend-only GitHub Actions `workflow_job` webhook collector for CI job metadata.

What changed:

- one row per GitHub Actions job is persisted into `tbl_fact_ci_run`
- job identity uses `ci_provider + repository_id + external_run_id + external_job_id`
- job URL is preferred, workflow run URL is fallback
- repository linkage is mandatory
- PR linkage is best-effort from workflow run metadata
- ticket linkage is best-effort from linked PR or branch ticket key
- connector execution is logged in `tbl_connector_run` with received / inserted / updated / skipped / error counters
- raw logs, tokens, secrets, and full artifacts are not persisted

## 2. Specification/AC Matching

| AC ID | status | evidence |
|---|---|---|
| AC-CI-RUN-METADATA-1 | PASS | `GithubWorkflowJobWebhookService` handles `workflow_job` payloads |
| AC-CI-RUN-METADATA-2 | PASS | One webhook event persists exactly one CI job row |
| AC-CI-RUN-METADATA-3 | PASS | `CiRun` / migration / adapter store workflow run ID, job ID, workflow name, job name, status, started/completed time, CI URL |
| AC-CI-RUN-METADATA-4 | PASS | New work uses only `tbl_` tables |
| AC-CI-RUN-METADATA-5 | PASS | Repository lookup is mandatory before persisting CI row |
| AC-CI-RUN-METADATA-6 | PASS | Pull request linkage is resolved when PR number is present |
| AC-CI-RUN-METADATA-7 | PASS | Ticket linkage is best-effort from PR / branch ticket key |
| AC-CI-RUN-METADATA-8 | PASS | Idempotent upsert by provider + repository + workflow run + job |
| AC-CI-RUN-METADATA-9 | PASS | `completed_at` may be null and status maps to `IN_PROGRESS` / `QUEUED` |
| AC-CI-RUN-METADATA-10 | PASS | Connector run failure is recorded on processing failure |
| AC-CI-RUN-METADATA-11 | PASS | No raw CI log / token / secret / private key / full artifact persistence |
| AC-CI-RUN-METADATA-12 | N/A | FE/query scope was not confirmed for this ticket |
| AC-CI-RUN-METADATA-13 | N/A | FE/query scope was not confirmed for this ticket |

## 3. List of Changed Files

| file | summary | reason |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/CiRun.java` | Reworked CI run model to job-level fields | Match spec grain and persisted columns |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/ConnectorRun.java` | Expanded connector run counters and metadata | Match connector logging requirement |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | Updated connector DTO id type | Keep DTO compatible with UUID ids |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/CiRunRepositoryPort.java` | New persistence port | Clean boundary for CI job upsert and connector logging |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CiRunJdbcAdapter.java` | New JDBC adapter | Repository resolution, PR/ticket lookup, upsert, connector run logging |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/CiRunModels.java` | New ingestion helper records/enums | Shared CI collector data shapes |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWorkflowJobMapper.java` | New mapping helpers | Status / URL / ticket-key normalization |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWorkflowJobWebhookService.java` | New collector service | Handle `workflow_job` webhook events |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | Route `workflow_job` event to new collector | Reuse existing GitHub webhook endpoint |
| `EDCAP_BE/src/main/resources/db/migration/V200__ci_run_metadata.sql` | Additive schema reconciliation | Add required CI columns, counters, seed connector type |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWorkflowJobMapperTest.java` | Unit tests for mapping helpers | Verify status / URL / ticket extraction |

## 4. Runn Command and Results

| command | result | note |
|---|---|---|
| `mvn test -q` | PASS | Initial run blocked by sandboxed Maven network access |
| `mvn test -q` | PASS | Rerun with escalated network permission; backend build and tests passed |

## 5. Self-Check using Review Checklist

| checklist area | result | note |
|---|---|---|
| Specification / AC Review | PASS / N/A | FE/query items left N/A because scope was not confirmed |
| General System Review | PASS | Required fields, null handling, and timestamp order checked in code |
| FE Review | N/A | No FE work implemented in this ticket |
| BE / API Review | PASS | Collector, controller routing, and safe error handling are in place |
| DB / Migration Review | PASS | Additive migration reconciles CI job grain and connector counters |
| Security / Privacy Review | PASS | No raw logs, tokens, secrets, or artifacts are persisted |
| Performance / Compatibility Review | PASS | Webhook handler is synchronous and small; DB work is per-job and bounded |
| Operation / Maintenance Review | PASS | Connector run counters and traceable failures are persisted |
| Test Review | PASS | `mvn test -q` passed |
| Documentation / Traceability Review | PASS | Self-review and report updated |
| Release / Rollback Review | PASS / ACCEPTED_RISK | Migration is additive; rollback is forward-fix or restore-based |

## 6. Test Plan Corresponding Status

| test area | execution status | result | note |
|---|---|---|---|
| Status normalization | DONE | PASS | Verified in `GithubWorkflowJobMapperTest` |
| URL fallback | DONE | PASS | Verified in `GithubWorkflowJobMapperTest` |
| Validation | DONE | PASS | Timestamp / required field validation implemented in service |
| DB upsert | DONE | PASS | Identity lookup plus insert/update path implemented |
| Multi-job workflow | DONE | PASS | One `workflow_job` event persists one job row; multiple jobs produce multiple events / rows |
| Connector failure | DONE | PASS | Failure path updates `tbl_connector_run` |
| Security guard | DONE | PASS | Raw payload / secret / log content are not persisted |
| FE display | N/A | N/A | Scope not confirmed for this ticket |

## 7. Bugs Found and Resolved

| bug | cause | fix | test |
|---|---|---|---|
| Update path had no CI row id | Upsert update branch did not carry existing `ci_run_id` | Fetched existing id and set it before update | `mvn test -q` |
| Repository access used record-style getters | `EvidenceRepository` is a Lombok bean, not a record | Switched to `getRepositoryId()` / `getProjectId()` | `mvn test -q` |
| Migration used unsupported constraint syntax | `ADD CONSTRAINT IF NOT EXISTS` is not valid in this flow | Replaced with standard constraint statements | `mvn test -q` |
| Timestamp parser could bubble raw parse exceptions | Parser accepted raw `OffsetDateTime.parse` failure | Converted to `IllegalArgumentException` for bad payloads | `mvn test -q` |

## 8. Unprocessed / Pending / Accepted Risk

| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| FE/query surface for AC-12 / AC-13 | Product scope not confirmed | Dashboard and ticket-detail display remain follow-up work | PM / FE | Next planning slot |
| Legacy CI rows in `tbl_fact_ci_run` | Migration is additive and preserves compatibility columns | Old rows may still use legacy columns, but new ingestion uses the reconciled columns | BE / DB | Accepted for MVP |
| Ticket-key inference heuristics | Branch-based inference is best-effort | Some CI rows may remain unlinked to ticket when metadata is insufficient | BE / PM | Accepted for MVP |

## 9. Exception Record

| exception_type | source_section | reason | approved_by_role | expiry | follow_up | owner | status |
|---|---|---|---|---|---|---|---|
| `AC_SCOPE_MARKED_NA` | Section 2 (AC-CI-RUN-METADATA-12, AC-CI-RUN-METADATA-13), Section 8 | FE/query display scope for CI job metadata was not confirmed before this ticket started, so both ACs are marked N/A instead of PASS/FAIL | PM | N/A | Confirm scope; either close AC-12/AC-13 as out-of-scope or open a follow-up ticket for FE/query work | PM / FE | OPEN |
| `LEGACY_COLUMN_RETAINED` | Section 3 (`V200__ci_run_metadata.sql`), Section 8 | Migration `V200__ci_run_metadata.sql` is additive; legacy columns `external_ci_run_id`, `pr_id`, `finished_at` were kept for backward compatibility instead of being dropped or renamed | Tech Lead | Next planning slot | Decide whether to formally deprecate/remove the legacy columns in a later migration | BE / DB | OPEN |
| `BEST_EFFORT_TICKET_LINKAGE` | Section 1, Section 8 | Ticket linkage is inferred best-effort from linked PR or branch ticket key; no guaranteed source of truth exists for this mapping | Tech Lead | N/A | Monitor the unlinked-CI-row rate after rollout; revisit heuristic if too many rows remain unlinked | BE / PM | ACK |

- The webhook-based collector should be easy to extend to additional GitHub CI payloads later if the product decides to add scheduled sync.

## 10. Items reviewed by humans

- Human review still needed for FE/query scope confirmation.
- Human review still needed for whether legacy CI columns should be cleaned up in a follow-up migration.

## 11. Final Self-Verdict

- PASS
