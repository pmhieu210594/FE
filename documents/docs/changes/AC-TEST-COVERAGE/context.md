# Context

**Ticket ID**: AC-TEST-COVERAGE
**Create date**: 2026-06-26  
**Author**: OpenAI
**Update date**: 2026-06-26  
## Screen / API / Batch / Related Job

| type | name / route | status | note |
|---|---|---|---|
| Screen | `HomePage` (`/:lang/`) | Exists | Dashboard landing surface; future AC coverage widgets should render as read-only summary here or in sibling dashboard tabs. |
| Screen | `ProjectPage` / `RepositoryPage` | Exists | Upstream context surfaces for project/repository scoped evidence. |
| Screen | `TraceabilityPage` (`/:lang/traceability`) | Exists | Existing ticket-evidence read model to mirror for AC-first coverage output. |
| API | `POST /api/v1/demo/test-plan-parses` | Exists | Parse and persist `test-plan.md`; planned coverage source. |
| API | `POST /api/v1/demo/test-results-parses` | Exists | Parse and persist `test-results.md`; executed evidence source. |
| API | `POST /api/v1/demo/parse-markdown` | Exists | General parser entrypoint used by the same markdown normalization stack. |
| API | `POST /api/v1/data-ops/artifact-scans` | Exists | Admin scan entrypoint for ticket artifact inventory and parser orchestration. |
| API | `POST /api/v1/webhooks/github` | Exists | Upstream CI/PR evidence ingress for build/test linkage. |
| API | `GET /api/v1/traceability/{ticketId}` | Exists | Existing read model for ticket evidence flow; useful reference for dashboard-style outputs. |
| Batch / Job | `ArtifactScannerService` | Exists | Orchestrates artifact parsing and evidence persistence. |
| Batch / Job | `TestPlanParseService.parseAndStore(...)` | Exists | Planned coverage ingestion. |
| Batch / Job | `TestResultsParseService.parseAndStore(...)` | Exists | Executed evidence ingestion. |
| Batch / Job | `GithubWebhookService.handle(...)` / `GithubWorkflowJobWebhookService` | Exists | CI-related evidence and workflow-job metadata. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| AC source of truth lookup | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/AcCoverageJdbcAdapter.java` | Read active AC keys from `tbl_fact_acceptance_criteria` using a narrow query and no manual mapping. |
| Coverage boundary validation | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | Compare AC IDs from spec vs matrix and emit warnings for uncovered / unknown references. |
| Planned coverage ingestion | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | Parse, persist snapshot, validate AC coverage, and recalculate downstream evidence/quality hooks. |
| Executed evidence ingestion | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Parse results, validate against AC set, persist evidence, and keep warnings visible. |
| Evidence persistence adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java` | Reuse existing `tbl_fact_ac_test_coverage` and `tbl_fact_test_run` write path. |
| Score/read-model adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | Reuse current SQL-style aggregation and read-model logic rather than computing on FE. |
| Artifact orchestrator | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Batch-style parse orchestration with explicit persistence and warning propagation. |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `SpecPackMarkdownParser` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Use only for spec-pack normalization / AC extraction if deeper spec parsing is needed later. |
| `ArtifactNormalizer` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Shared markdown normalization and section extraction pipeline. |
| `TestCoverageValidationService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | Canonical AC mismatch warning helper. |
| `AcCoveragePort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/AcCoveragePort.java` | Returns active AC keys for a ticket. |
| `TestEvidencePersistencePort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TestEvidencePersistencePort.java` | Planned/executed coverage persistence boundary. |
| `CiRunRepositoryPort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/CiRunRepositoryPort.java` | CI summary lookup and metadata reuse. |
| `EvidenceQualityScoreService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | Existing downstream read-model recomputation hook. |
| `tbl_fact_acceptance_criteria` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | AC master source. |
| `tbl_fact_ac_test_coverage` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | AC ↔ test coverage fact table. |
| `tbl_fact_test_run` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Test execution summary. |
| `tbl_fact_test_case` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Per-case AC reference and status. |
| `tbl_fact_ci_run` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | CI supporting evidence. |
| `tbl_fact_evidence_event` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Parse / validation / compute audit trail. |
| `tbl_fact_data_quality` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Parse warnings and linkage issues. |
| `TraceIdFilter` | `EDCAP_BE/src/main/java/com/sdd/platform/config/TraceIdFilter.java` | Correlation id pattern for logs and persisted metadata. |

## Forbidden common components

| component | reason |
|---|---|
| Manual AC ↔ test mapping UI or pinning logic | MVP is parser-only; manual mapping is explicitly out of scope. |
| FE-side coverage recomputation | Dashboard must render a BE read model, not duplicate business rules. |
| New table for coverage fact data | Reuse-first rule applies; schema already has the needed tables. |
| Raw chat / raw prompt / full source storage | Prohibited by design and by ticket scope. |
| Direct SQL in FE or non-port persistence bypass | Breaks layering and makes the flow non-testable. |
| Nonexistent endpoints such as `/api/v1/ac-test-coverage` | No such API exists in current source. |
| Hard-coded status labels outside canonical enums / constants | Keeps coverage semantics drift-free. |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `AcCoveragePort.findActiveAcKeys(UUID)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/AcCoveragePort.java` | Returns active AC keys for a ticket. |
| `AcCoverageJdbcAdapter.findActiveAcKeys(UUID)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/AcCoverageJdbcAdapter.java` | JDBC implementation of AC lookup. |
| `TestCoverageValidationService.validateCoverage(List<String>, List<String>)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | Emits `AC_NOT_COVERED` and `UNKNOWN_AC_REFERENCE` warnings. |
| `TestPlanParseService.parseAndStore(ParseRequest)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | Parses planned coverage and persists snapshot/evidence. |
| `TestPlanParseService.detail(UUID)` | same | Returns parsed snapshot detail for a prior parse. |
| `TestPlanParseService.recentSnapshots(UUID, ParseMode, int)` | same | Lists ticket snapshots for plan history. |
| `TestResultsParseService.parseAndStore(ParseRequest)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Parses executed evidence and persists result/test run data. |
| `TestResultsParseService.detail(UUID)` | same | Returns parsed test results snapshot detail. |
| `TestResultsParseService.recentSnapshots(UUID, ParseMode, int)` | same | Lists ticket snapshots for result history. |
| `TestEvidencePersistencePort.replacePlannedCoverage(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TestEvidencePersistencePort.java` | Replaces planned AC coverage rows for a ticket snapshot. |
| `TestEvidencePersistencePort.upsertTestRun(...)` | same | Persists parsed test-run summary. |
| `TestEvidenceJdbcAdapter.replacePlannedCoverage(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java` | Writes `PLANNED` rows into `tbl_fact_ac_test_coverage`. |
| `TestEvidenceJdbcAdapter.upsertTestRun(...)` | same | Upserts `tbl_fact_test_run` rows. |
| `EvidenceQualityScoreRepositoryAdapter.loadTestSignal(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | Reads AC coverage / test-run counts for downstream read models. |
| `EvidenceQualityScoreRepositoryAdapter.loadAcceptanceCriteriaStats(...)` | same | Reads AC counts and format-valid counts. |
| `ArtifactScannerService.scan(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Batch orchestration and parser triggering. |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `manualMapAcToTestCase(...)` | Violates parser-only rule and user decision. | Use `TestPlanParseService` + `TestResultsParseService` + existing DB linkage. |
| `pinCoverageStatus(...)` | Manual override is out of scope. | Let persisted evidence and validation determine status. |
| `POST /api/v1/ac-test-coverage` | No such API in source. | Use existing parser / read-model endpoints. |
| `getCoverageFromFrontend()` | FE should only render BE data. | Read the BE response model. |
| `writeCoverageTableDirectly()` | Bypasses port/adapters and audit trail. | Use `TestEvidencePersistencePort` or existing service flow. |
| `parseSpecPackWithoutSnapshot()` | Snapshot/audit is required for traceability. | Use parser services that persist snapshots. |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| BE DTO | `TestDocParseDtos.*` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/TestDocParseDtos.java` | Parse request/result DTOs for test-plan and test-results routes. |
| BE model | `DocParseModels.ParseRequest` / `ParseResult` / `ParseSnapshot` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/DocParseModels.java` | Canonical parse data for docs. |
| Domain/service | `ArtifactNormalizer.ParsedArtifact` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Markdown normalization result. |
| Fact table | `tbl_fact_acceptance_criteria` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | AC master per ticket. |
| Fact table | `tbl_fact_ac_test_coverage` | same | AC ↔ test coverage fact table. |
| Fact table | `tbl_fact_test_run` | same | Parsed test run summary. |
| Fact table | `tbl_fact_test_case` | same | Parsed test case / AC reference. |
| Fact table | `tbl_fact_ci_run` | same | CI metadata used as supporting evidence. |
| Fact table | `tbl_fact_evidence_event` | same | Parse/audit/event trail. |
| Fact table | `tbl_fact_data_quality` | same | Parser warnings and linkage issues. |
| Fact table | `tbl_fact_metric_value` | same | KPI storage for dashboard/read-model usage. |
| Dimension | `tbl_dim_ticket` / `tbl_dim_repository` | same | Scope keys for all coverage rows. |
| Migration | `V4__init_shema_v2.sql` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Canonical schema for the MVP; do not edit in place. |
| Migration | `V200__ci_run_metadata.sql` | `EDCAP_BE/src/main/resources/db/migration/V200__ci_run_metadata.sql` | CI metadata extension, if supporting evidence needs additional columns. |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| AC status | `ACTIVE` / non-`ACTIVE` | `tbl_fact_acceptance_criteria.status` | Only `ACTIVE` ACs are used for coverage calculation. |
| Coverage status | `PLANNED`, `PASSED`, `FAILED`, `UNTESTED`, `PARTIAL`, `MISSING`, `UNKNOWN` | `tbl_fact_ac_test_coverage.coverage_status` and read-model logic | Canonical status vocabulary for this ticket. |
| Test run status | `SUCCESS`, `FAILED`, `CANCELLED`, `SKIPPED`, `RUNNING`, `PENDING`, `UNKNOWN` | `run_status` enum | Used by `tbl_fact_test_run` / `tbl_fact_test_case`. |
| Parse mode | `DRAFT` / `PUBLISHED` | `ParseMode` enum | Do not invent additional modes. |
| CI status | `SUCCESS` / `FAILED` / `RUNNING` / `UNKNOWN` | `tbl_fact_ci_run.status` | Supporting evidence only. |
| `formItemNm` | N/A | Current implementation | Not used in this ticket. |
| `SEQNO` | N/A | Current implementation | Not used in this ticket. |
| Master data key | `ticket_id`, `repository_id`, `ac_key` | Current schema | Stable identity fields for lookup and reporting. |

## Multilingual Note

- The ticket source and artifact templates contain Vietnamese, English, and some Japanese terms in the wider repo.
- Preserve UTF-8 end-to-end; do not normalize away Vietnamese diacritics in documentation or parser warnings.
- AC extraction must preserve the exact `ac_key` and normalized markdown section order; only the summary text can be shortened.
- User-facing labels may be multilingual later, but ticket identity, AC keys, and status enums must stay stable and language-neutral.

## Encoding / Mojibake Note

- Repository docs are UTF-8; maintain UTF-8 when writing or parsing `spec-pack.md`, `test-plan.md`, and `test-results.md`.
- Do not introduce Shift-JIS / mojibake assumptions when validating text content.
- Preserve code values exactly as ASCII tokens even when surrounding prose is localized.

## Log / Audit / Operation Note

- Every parse or recompute flow should log `traceId`, `ticketId`, and the artifact snapshot identity.
- Persist parse warnings and linkage issues through existing evidence/data-quality tables instead of hiding them in memory.
- Do not log raw prompt/chat text, secrets, token values, or full source text.
- Operation troubleshooting should rely on `tbl_fact_evidence_event`, `tbl_fact_data_quality`, and existing traceable snapshot/run IDs.
- This ticket remains parser-only and reuse-first: auditability matters more than adding new runtime surfaces.

## Ticket-Specific Constraints

- AC-Test Coverage is a Dashboard read-model concern, not a standalone business screen.
- AC must come from `spec-pack.md`; test case planning must come from `test-plan.md`.
- Manual mapping, pinning, and FE-side recomputation are forbidden in MVP.
- Prefer existing tables and services; do not add a new coverage table unless a later phase proves it is unavoidable.
