# Implementation Plan

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17
**Author**: ChatGPT
**Update date**: 2026-06-17

## 1. Implementation Principle

- Keep the collector metadata-first.
- Persist one row per GitHub Actions job.
- Prefer existing repository, adapter, mapper, and transaction patterns.
- Never store raw CI logs, raw GitHub API payloads, tokens, secrets, private keys, or full artifacts.
- Keep the external API fetch outside DB transactions.
- Treat schema reconciliation as a first-class task, not an implementation detail.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Keep the current run-level `tbl_fact_ci_run` meaning and store only one row per workflow run | Smallest schema impact | Does not satisfy job-level AC and loses job status granularity | Rejected |
| B | Reconcile schema so `tbl_fact_ci_run` stores one row per GitHub Actions job and use `tbl_connector_run` for collector execution tracking | Matches requirement exactly and supports job-level display | Requires schema decision and likely migration work | Selected, pending human confirmation of the reconciliation path |
| C | Introduce a new non-`tbl_` table or raw payload store and leave current CI tables untouched | Fastest to prototype | Violates ticket rules and persistence constraints | Rejected |

## 3. Reason for Choosing the Alternative Plan

Option B is the only path that matches the ticket requirement, the approved table set, and the requested traceability grain.

It also keeps the implementation aligned with current BE architecture:

- repository lookup stays in the persistence layer
- ingestion stays in a service/use-case class
- external API access stays outside the DB transaction
- row-level idempotency stays in the database and adapter layer

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` or a new follow-up migration | Reconcile `tbl_fact_ci_run` grain, add required keys/constraints/counters, and align `tbl_connector_run` counters | Core schema change | AC-1, AC-2, AC-3, AC-4, AC-8, AC-9, AC-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/CiRun.java` | Replace run-level fields with job-level metadata or introduce a new job-level model | Domain mapping | AC-1, AC-2, AC-3, AC-6, AC-7, AC-9 |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/ConnectorRun.java` | Extend or map counters for received / inserted / updated / skipped / error | Operation tracking | AC-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/` new service file | Add collector orchestration and validation | Business orchestration | AC-1, AC-2, AC-3, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, AC-11 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/` new adapter file | Add idempotent upsert and lookup logic | Persistence boundary | AC-2, AC-5, AC-6, AC-7, AC-8, AC-9 |
| `EDCAP_BE/src/main/resources/mapper/` new mapper file | SQL for job-level CI upsert/query | Repository implementation | AC-2, AC-5, AC-6, AC-7, AC-8, AC-9 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/` new controller file, if query API is confirmed | Expose query or trigger endpoint | API contract | AC-12 |
| `EDCAP_BE/src/test/java/com/sdd/platform/**` new tests | Cover validation, idempotency, connector logs, and schema rules | Verification | All AC |
| `EDCAP_FE/src/lib/api.ts` only if FE query scope is confirmed | Add CI endpoint helper and response types | UI contract | AC-12 |
| `EDCAP_FE/src/pages/` new page or existing evidence page extension, only if FE scope is confirmed | Render CI metadata and evidence detail | UI display | AC-12 |

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| CI metadata collector service | Add | provider payload / trigger params | normalized CI job rows | Must validate and map before persistence |
| GitHub Actions API client | Add or confirm | repository identity / workflow run scope | workflow and job metadata | Exact method names depend on current source conventions |
| Repository resolver | Add or confirm | repository key / owner-repo data | repository FK | Must fail safe when repo cannot be resolved |
| PR resolver | Add or confirm | PR metadata from GitHub | optional PR FK | Best-effort linkage only |
| Ticket resolver | Add or confirm | branch / commit / PR metadata | optional ticket FK | Best-effort linkage only |
| CI status mapper | Add | GitHub status / conclusion | normalized status enum | Unknown values need explicit approval path |
| CI URL resolver | Add | job URL, workflow URL | resolved CI URL | Job URL first, workflow URL fallback |
| CI repository adapter | Add | normalized CI job DTO/entity | inserted or updated row | Must be idempotent |
| Connector run logger | Modify | counters, status, error | `tbl_connector_run` row | Must remain safe and traceable |

## 6. SQL / Query / Repository Policy

- Use only approved `tbl_` tables.
- Reconcile the current `tbl_fact_ci_run` / `tbl_fact_ci_job` mismatch before writing service code.
- Enforce unique identity with `ci_provider + repository_id + external_run_id + external_job_id`.
- Upsert must be idempotent.
- Repository FK is mandatory.
- PR and ticket FKs remain nullable.
- `external_job_id`, `job_name`, and `ci_url` are required unless a confirmed provider exception is documented.
- Keep SQL parameterized.
- Keep any `ORDER BY` logic whitelisted if a query endpoint is added.

## 7. Validation / Error / Logging Policy

| validation | behavior |
|---|---|
| repository not resolved | Skip row, record connector error, do not create orphan CI data |
| missing workflow run ID | Reject or skip row and log validation error |
| missing job ID | Reject or skip row and log validation error |
| missing job URL and no workflow URL | Reject or skip row and log validation error |
| `completed_at < started_at` | Reject or skip row and log validation error |
| unknown status / conclusion | Map only if approved; otherwise stop and ask |
| raw payload or token content encountered | Never persist or log |

- Use structured, parameterized logging.
- Include connector name, repository scope, workflow run ID, and job ID in safe logs.
- Do not log full response bodies.

## 8. Migration / Rollback Policy

- Prefer a new additive Flyway migration over editing a committed one.
- If the team chooses to repurpose the existing CI tables, capture the change in a new migration and keep backward compatibility in mind.
- Add or adjust constraints for time order and uniqueness.
- Add indexes that support repository / ticket / PR / status / time queries.
- Rollback should be forward-repair or restore-based, not destructive, because Flyway Community has no down migration support.

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Confirm the schema reconciliation path for current CI tables | `documents/docs/changes/CI-RUN-METADATA/impact-analysis.md` and DB migration scope | Human confirmation recorded | Stop if the team does not confirm whether `tbl_fact_ci_run` is repurposed or migrated |
| 2 | Add or adjust DB migration for job-level CI storage and connector counters | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` or new migration | Migration review against requirement | Stop if the table grain would still be ambiguous |
| 3 | Add the normalized CI model / DTO | new BE model file | Compile and unit test | Stop if field names cannot be aligned with the requirement |
| 4 | Add GitHub job metadata collector service | new BE use-case file | Service unit tests for validation and mapping | Stop if GitHub auth or trigger mode is still undecided |
| 5 | Add repository adapter / mapper with idempotent upsert | new BE adapter + mapper files | Duplicate-ingest integration test | Stop if the unique key cannot be enforced |
| 6 | Add connector run counter logging | collector service + connector run adapter | Counter assertions in tests | Stop if the current counter mapping is unclear |
| 7 | Add query surface only if product confirms it | new controller / FE API helper / FE page | API and UI tests | Stop if FE scope is not confirmed |
| 8 | Run the targeted test suite | new and existing test files | Green unit / integration / FE tests as applicable | Stop if any critical AC test fails |

## 10. How to Verify Each Step

- Verify the migration matches the requirement grain and unique key.
- Verify a workflow run with two jobs creates two persisted rows.
- Verify re-ingesting the same job updates the existing row instead of creating a duplicate.
- Verify `completed_at` can be null for running jobs.
- Verify invalid time order is rejected or skipped.
- Verify connector run counters are populated correctly.
- Verify no raw payload or secret content is persisted.
- Verify any query endpoint returns normalized metadata only.

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-CI-RUN-METADATA-1 | Collector service + provider fetch | Integration test with GitHub metadata fixture |
| AC-CI-RUN-METADATA-2 | One-row-per-job persistence model | Multi-job workflow test |
| AC-CI-RUN-METADATA-3 | Column mapping for run/job/status/time/url | Entity / repository assertion |
| AC-CI-RUN-METADATA-4 | Approved-table-only migration and adapter plan | DB schema review |
| AC-CI-RUN-METADATA-5 | Repository resolution logic | Known repository test |
| AC-CI-RUN-METADATA-6 | PR linkage logic | Metadata-driven PR test |
| AC-CI-RUN-METADATA-7 | Ticket linkage logic | Best-effort ticket test |
| AC-CI-RUN-METADATA-8 | Unique key + idempotent upsert | Re-ingest duplicate job test |
| AC-CI-RUN-METADATA-9 | Running job handling | Null `completed_at` test |
| AC-CI-RUN-METADATA-10 | Connector run counters / error logging | Failure simulation test |
| AC-CI-RUN-METADATA-11 | Forbidden persistence guard | Code review plus negative test |
| AC-CI-RUN-METADATA-12 | Query display and evidence detail integration | API / UI test if FE scope is approved |

## 12. Stop / Ask Condition

- GitHub Actions auth method is not decided.
- The current CI schema reconciliation path is not decided.
- Trigger mode is not decided.
- Status mapping for ambiguous GitHub conclusions is not approved.
- A job-level API is required but no route shape has been approved.
- Implementing the plan would require raw log parsing or token storage.

## 13. Do Not Do This Ticket

- Do not store raw CI logs.
- Do not store raw GitHub API responses.
- Do not store tokens, secrets, private keys, or passwords.
- Do not implement test result parsing.
- Do not implement coverage parsing.
- Do not implement failure categorization or flaky detection.
- Do not add rerun or manual refresh UI.
- Do not invent a new non-`tbl_` table.

## 14. Open Related Issues

| issue | impact | next action |
|---|---|---|
| GitHub auth method not finalized | Blocks collector implementation | Confirm with BE / Security |
| Trigger mode not finalized | Blocks service entrypoint design | Confirm with PM / BE / Data Ops |
| `tbl_fact_ci_run` grain conflict | Blocks schema and adapter design | Confirm migration strategy |
| Connector run counter mapping not finalized | Blocks operational tracking | Confirm whether existing fields are reused or expanded |
| FE dashboard/detail scope not finalized | Blocks UI tasks | Confirm whether AC-12 covers both CI query and evidence detail display |
