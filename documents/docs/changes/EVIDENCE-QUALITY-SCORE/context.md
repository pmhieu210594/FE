# Context

**Ticket ID**: EVIDENCE-QUALITY-SCORE
**Create date**: 2026-06-23
**Author**: nk_trung   
**Update date**: 2026-06-23

## Screen / API / Batch / Related Job

### Current screens related to this ticket

| screen | path | relation |
|---|---|---|
| HomePage | `EDCAP_FE/src/pages/HomePage.tsx` | Downstream consumer area for summary dashboards; no dedicated Evidence Quality Score page exists yet. |
| ProjectPage | `EDCAP_FE/src/pages/ProjectPage.tsx` | Project-level admin page that may later show evidence score summaries. |
| OrganizationPage | `EDCAP_FE/src/pages/OrganizationPage.tsx` | Higher-level admin context for later score rollups. |
| CustomerPage | `EDCAP_FE/src/pages/CustomerPage.tsx` | Customer-level context for future reporting. |
| TeamPage | `EDCAP_FE/src/pages/TeamPage.tsx` | Role/team scope context for future rollups. |
| RolePage | `EDCAP_FE/src/pages/RolePage.tsx` | RBAC context for score visibility. |
| UserAccountsPage | `EDCAP_FE/src/pages/user/UserAccountsPage.tsx` | Admin-only context; useful for ownership and audit-related navigation. |

### Current API / batch / job entry points that are relevant

| endpoint / job | path | relation |
|---|---|---|
| Parse spec pack | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Existing parsing entrypoint for `spec-pack.md`; primary input shape for the score engine. |
| Parse impl plan | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ImplPlanParseController.java` | Existing parse-and-store flow for implementation plan evidence. |
| Parse test plan | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TestPlanParseController.java` | Existing parse-and-store flow for test-plan evidence. |
| Parse test results | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TestResultsParseController.java` | Existing parse-and-store flow for test-results evidence. |
| Scan artifacts | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | Existing inventory/scanning flow for `docs/changes/<ticket>/` artifacts. |
| Collect PR metadata | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/GitPrMetadataCollectorController.java` | Existing PR / commit / traceability collection entrypoint. |
| CI run metadata | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CiRunMetadataController.java` | Existing CI metadata listing endpoint; authoritative finalization signal for the score engine, not a dashboard-open scoring hook. |
| Safety evidence | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SecurityEvidenceController.java` | Existing safety-pack and security-scan admin APIs. |
| Internal security ingest | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/InternalSecurityEvidenceController.java` | Incoming webhook flow for security evidence. |
| Markdown parsing job | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Existing batch-style orchestration over artifact parsing and inventory persistence; parser completion may produce only a partial snapshot. |
| PR collector job | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | Existing collection flow for PR metadata / traceability input. |
| Safety pack scan job | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/SafetyPackService.java` | Existing repository scan / status flow for `.claude/` evidence. |

### Downstream contract that will consume this BE result later

| contract | path | note |
|---|---|---|
| Evidence score response | not implemented yet | The dashboard should render BE output only; it must not recompute score locally. |
| Ticket evidence detail | not implemented yet | Future consumer for `score`, `band`, `breakdown`, `missing`, and `traceIds`. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Safe file parsing for a single artifact type | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Restrict file input to `docs/changes/<TICKET>/spec-pack.md`, normalize the path, whitelist `.md/.markdown`, and reject path traversal. |
| Parse + persist pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | Parse, persist a provisional snapshot, record data-quality when missing/parse errors exist, and keep the run stable. |
| Inventory scanning pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Reuse existing parsers, collect inventory, persist run status, and fail safe on partial source issues; do not make this the final score trigger. |
| PR collection pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | Infer ticket key, map to repository/ticket data, persist traceability, and keep idempotency by source key. |
| Admin-only evidence listing | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CiRunMetadataController.java` | Protect read endpoints with `@CurrentUser` and role checks instead of putting authorization in the FE. |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `MarkdownParserCore` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Base Markdown parsing utility for all document parsers. |
| `SpecPackMarkdownParser` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Use for spec artifact normalization, AC extraction, and section validation. |
| `SelfReviewMarkdownParser` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | Use for self-review evidence extraction. |
| `ImplPlanParseService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | Reuse for impl-plan snapshot / data-quality behavior. |
| `TestPlanParseService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | Reuse for AC-to-test linkage behavior. |
| `TestResultsParseService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Reuse for test-run parsing, result persistence, and error isolation. |
| `TestCoverageValidationService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | Reuse for AC coverage gap detection. |
| `ArtifactScannerService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Reuse for artifact inventory, source hash, and run tracking patterns. |
| `GitPrMetadataCollectorService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | Reuse for PR / commit / traceability collection patterns. |
| `CiRunMetadataService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java` | Reuse for admin-scoped CI evidence access. |
| `SafetyPackService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/SafetyPackService.java` | Reuse for `.claude/` evidence collection and scan-status handling. |
| `CurrentUser` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentUser.java` | Reuse for authenticated actor injection. |
| `ForbiddenException` | `EDCAP_BE/src/main/java/com/sdd/platform/application/exception/ForbiddenException.java` | Reuse for role/policy rejection. |
| `NotFoundException` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/exception/NotFoundException.java` | Reuse for missing entity lookup. |

## Forbidden common components

| component | reason |
|---|---|
| Generic file-read primitive outside `docs/changes/<TICKET>/` | This would create an unsafe file-read surface and can leak arbitrary local files. |
| FE-local score recomputation | The FE must render BE output only to preserve a single source of truth. |
| Legacy V1 score cache tables | V3 dropped the legacy `evidence_quality_score`/`traceability_link` tables; the MVP must use the current V4 schema. |
| Raw prompt / raw chat storage | Explicitly out of scope and disallowed by the spec. |
| Full source code persistence in the score result | The score result should stay metadata-first and not store raw code. |
| Hard-coded band labels in multiple layers | Use one canonical `score_band` mapping and one response contract. |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `SpecPackMarkdownParser.parse(String, String, String)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Parse spec-pack content and validate sections / ACs. |
| `SpecPackMarkdownParser.hasSection(...)` | same | Lightweight section presence check for downstream logic. |
| `SelfReviewMarkdownParser.parse(String, String, String)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | Parse self-review evidence for commands, concerns, and verdict. |
| `ImplPlanParseService.parseAndStore(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | Parse and persist impl-plan snapshots. |
| `ImplPlanParseService.recentSnapshots(...)` | same | Return latest snapshots for ticket drill-down. |
| `ImplPlanParseService.detail(...)` | same | Return a single parsed snapshot by ID. |
| `TestPlanParseService.parseAndStore(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | Parse and persist test-plan snapshots. |
| `TestResultsParseService.parseAndStore(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Parse and persist test-results snapshots. |
| `TestCoverageValidationService.validateCoverage(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | Detect AC coverage gaps between spec and matrix. |
| `ArtifactScannerService.scan(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Scan ticket/repository evidence and persist run status. |
| `ArtifactScannerService.getRun(...)` | same | Read a scan run by ID. |
| `ArtifactScannerService.getRunArtifacts(...)` | same | Read artifacts collected by scan run. |
| `ArtifactScannerService.getCurrentInventory(...)` | same | Read current artifact inventory by repository. |
| `GitPrMetadataCollectorService.collectPullRequest(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | Collect one PR and its traceability metadata. |
| `GitPrMetadataCollectorService.collectRepository(...)` | same | Collect a repository range of PRs. |
| `GitPrMetadataCollectorService.collectManual(...)` | same | Admin-scoped manual collection entrypoint. |
| `CiRunMetadataService.recent(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java` | Read recent CI runs for admin/dashboard usage. |
| `SafetyPackService.recent(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/SafetyPackService.java` | Read recent safety-pack status rows. |
| `SafetyPackService.scanFromRoot(...)` | same | Scan repository root and persist safety-pack status. |
| `SafetyPackService.scan(...)` | same | Build a safety-pack status object from repository files. |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `EvidenceQualityScoreService` | No dedicated score-engine service exists yet in the source tree. | Create a new application use-case service for this ticket. |
| `EvidenceQualityScoreController` | No dedicated controller exists yet. | Add a new REST controller for the BE score contract. |
| `DemoController.parseFile()` | No such controller exists in the current source tree. | Use the dedicated parser controllers or add a dedicated controller. |
| FE-local score calculation hook | Not present and not allowed by the contract. | Render the BE response from a dedicated API. |
| Generic repo-wide parser for arbitrary local files | Not present and unsafe. | Restrict reads to the scoped `docs/changes/<TICKET>/` files. |
| Manual score override endpoint in v0 | Explicitly finalized as out of scope for MVP. | Record exceptions separately instead of overriding the score. |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| Domain entity | `Ticket` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Ticket.java` | Primary ticket identity / AC count / phase source. |
| Domain entity | `Artifact` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Artifact.java` | Artifact inventory and required-field completeness source. |
| Domain entity | `PullRequest` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/PullRequest.java` | Review / diff / traceability source. |
| Domain entity | `CiRun` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/CiRun.java` | CI run / status / URL source. |
| Domain entity | `AcceptanceCriterion` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AcceptanceCriterion.java` | AC linkage source for test coverage. |
| Domain entity | `SafetyPackStatus` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/SafetyPackStatus.java` | Safety evidence source. |
| V4 result table | `tbl_fact_evidence_quality_score` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Main persisted output store for the MVP. |
| V4 artifact snapshot | `tbl_fact_artifact_snapshot` | same | Source for existence, hash, template-only, and parsed summary. |
| V4 parsed section | `tbl_fact_artifact_parsed_section` | same | Section-level evidence for score criteria. |
| V4 AC table | `tbl_fact_acceptance_criterion` | same | AC extraction and test-coverage source. |
| V4 traceability link | `tbl_fact_traceability_link` | same | Link-chain evidence source. |
| V4 review tables | `tbl_fact_review`, `tbl_fact_review_comment`, `tbl_fact_finding` | same | Canonical review state and findings source. |
| V4 test tables | `tbl_fact_test_run`, `tbl_fact_test_case`, `tbl_fact_ac_test_coverage` | same | Test/coverage source for score calculation. |
| V4 CI table | `tbl_fact_ci_run` | same | CI run status and URL source. |
| V4 report table | `tbl_fact_evidence_report` | same | Final report completeness source. |
| V4 data quality table | `tbl_fact_data_quality` | same | Parse / missing-data / schema-violation telemetry. |
| V4 lineage table | `tbl_fact_metric_input_lineage` | same | Score provenance / replay / audit support. |
| V4 metric table | `tbl_fact_metric_value` | same | If score trend reporting is added later. |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| Score band | `EXCELLENT` | `score_band` enum in V4 schema | Must map to `Excellent` in API response. |
| Score band | `GOOD` | `score_band` enum in V4 schema | Must map to `Good`. |
| Score band | `WARNING` | `score_band` enum in V4 schema | Must map to `Warning`. |
| Score band | `RISKY` | `score_band` enum in V4 schema | Must map to `Risky`. |
| Score band | `CRITICAL` | `score_band` enum in V4 schema | Must map to `Critical`. |
| Criterion ID | `criterionId` | score contract / spec-pack | Use canonical machine-readable IDs only; do not invent free-text values. |
| Parse status | `SUCCESS / PARTIAL / NOT_FOUND / PARSE_ERROR` | parser model | Use parser status codes, not localized strings, in persistence and logs. |
| Review status | `approved / rejected / changes_requested / missing` | PR review metadata/comments | Canonical source is PR review metadata/comments. |

## Multilingual Note

- UI text may be localized in `en / vi / ja`, but the contract values for `score`, `band`, `criterionId`, and parser status codes must stay stable and language-neutral.
- Do not localize database enum values; only localize labels in the FE layer.
- When the same business meaning appears in multiple locales, keep the English machine code as the source of truth.

## Encoding / Mojibake Note

- Read and write Markdown as UTF-8.
- Accept LF and CRLF inputs; do not normalize the content in a way that changes hashes unexpectedly.
- Avoid mojibake when parsing Vietnamese or Japanese text in evidence files.
- Preserve canonical section keys and content hashes so repeated scoring remains idempotent.

## Log / Audit / Operation Note

- Log by `traceId`, `ticketId`, `scoreRuleVersion`, and `calculatedAt`; do not log raw prompt/chat/source code/raw CI logs.
- Persist enough lineage for replay: source refs, missing items, parse errors, and result timestamps.
- Recalculation must be idempotent for the same source state and rule version.
- If persistence fails after calculation, keep the calculation result observable and log the storage failure separately.
- Follow the existing admin/read-role pattern for score access; do not bypass security with ad-hoc endpoints.

## Ticket-Specific Constraints

- MVP must use the existing V4 score table and related metric/lineage tables; do not introduce a new required table or column.
- The score engine is BE-only; the FE must only render the BE result.
- PR review metadata/comments are the canonical review source; internal review files are supporting evidence only.
- Full history + current/latest snapshot is the finalized storage approach for score results.
- Manual score override is not allowed in v0; exceptions must be recorded separately.
- Score weights are fixed and phase-agnostic in v0.
- The response contract must include `ticketId`, `score`, `band`, `breakdown`, `missing`, `parseErrors`, `traceIds`, `scoreRuleVersion`, and `calculatedAt`.
- AC mapping must cover all 10 ACs from the finalized spec-pack; do not silently drop any AC from the implementation plan.

### AC Coverage Mapping

| AC ID | current code path | status | note |
|---|---|---|---|
| AC-EVIDENCE-QUALITY-SCORE-1 | `SpecPackMarkdownParser`, `ArtifactScannerService`, future score engine service | mapped | Core score range contract. |
| AC-EVIDENCE-QUALITY-SCORE-2 | `SpecPackMarkdownParser`, `SelfReviewMarkdownParser`, `ArtifactScannerService` | mapped | Breakdown must explain the contributing items. |
| AC-EVIDENCE-QUALITY-SCORE-3 | future score engine service / band mapper | mapped | Boundary classification must match fixed bands. |
| AC-EVIDENCE-QUALITY-SCORE-4 | score engine service + artifact inventory / traceability readers | mapped | Missing artifacts or broken links must reduce score, not crash. |
| AC-EVIDENCE-QUALITY-SCORE-5 | parser adapters + `tbl_fact_data_quality` | mapped | Parse errors must be isolated and returned. |
| AC-EVIDENCE-QUALITY-SCORE-6 | `GitPrMetadataCollectorService` / PR review ingestion | mapped | PR review metadata/comments are canonical. |
| AC-EVIDENCE-QUALITY-SCORE-7 | `tbl_fact_evidence_quality_score` + future repository adapter | mapped | Persisted score must be queryable later. |
| AC-EVIDENCE-QUALITY-SCORE-8 | response serializer / DTO contract | mapped | No raw prompt/chat/full source/raw CI logs in response. |
| AC-EVIDENCE-QUALITY-SCORE-9 | score engine calculator + rule version lock | mapped | Same source state + same rule version must be idempotent. |
| AC-EVIDENCE-QUALITY-SCORE-10 | score API DTO / future controller | mapped | Response shape must be downstream-ready. |


## Score Timing Note

- Parser completion may create a partial snapshot or provisional evidence state.
- CI completion is the authoritative trigger for finalizing the Evidence Quality Score.
- Dashboard consumers must read the latest persisted snapshot only and must not run scoring when the page opens.