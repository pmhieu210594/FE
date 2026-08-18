# Context

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung   
**Update date**: 2026-06-22  

## Screen / API / Batch / Related Job

- Existing reference parser APIs: `POST /api/v1/markdown-parser/spec-pack/parse-markdown` and `POST /api/v1/markdown-parser/spec-pack/parse-markdown-file`.
- Related job: `ArtifactScannerService.scan(...)` runs in the current ingest flow and is the closest integration point for attaching the parser to the snapshot/evidence persistence pipeline.
- Related batch / run: Artifact Scanner scan run, `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section`, `tbl_fact_evidence_event`, `tbl_fact_data_quality`.
- For this ticket, the target parser is `docs/changes/<TICKET>/self-review.md`; there is no dedicated FE screen in Phase 2.

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Shared Markdown core | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Parse front matter, headings, tables, placeholders, and hash at the core level, without ticket-specific logic |
| Strict parser envelope | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Separate the rule-specific envelope from the core, normalize aliases in a controlled way, and return warnings/errors instead of free-form inference |
| Guarded parser endpoint | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Allow only paths under `docs/changes/<TICKET>/...`, and do not turn it into a generic file reader |
| Scan orchestration | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Parse immediately after scan, persist snapshot/section/AC/event, and handle parse failures with traceability |
| Persistence adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Use the upsert + history-query pattern; do not write to the DB directly from the controller/parser |

## Allowed common components
| component | path | usage note |
|---|---|---|
| `MarkdownParserCore` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Common foundation for Markdown parsing, front matter, table, placeholder, and content hash |
| `SpecPackMarkdownParser` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Reference pattern for a rule-based parser, AC normalization, and the warning/error model |
| `ArtifactScannerService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Attach the parser to the ingest pipeline and snapshot persistence |
| `ArtifactScannerModels` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | Use records for snapshot, parsed section, AC, evidence, and data quality |
| `ArtifactScannerJdbcAdapter` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Use as the persistence / history lookup / idempotent upsert pattern |
| `jakarta.validation` | Existing backend validation foundation | Block empty / invalid input early |
| Spring Web MVC + SLF4J | Existing backend stack | Use for controller, trace, warning, error, and audit logging |

## Forbidden common components
| component | reason |
|---|---|
| Generic unrestricted file reader | It can easily turn the parser into a file-read primitive outside the ticket scope |
| External NLP/LLM parser | The requirement is rule-based, stable, and auditable |
| FE common UI components | This ticket is in the backend/doc parser context, not UI reuse |
| New DB schema for MVP | The design is reuse-first; schema churn is not needed in Phase 2 |
| Raw content persistence | Do not store raw prompts/raw chats/source code/secrets in artifact output |

## List of methods that actually exist
| method/class | path | usage |
|---|---|---|
| `MarkdownParserCore.parse(String)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Parse Markdown content with the default `sourcePath = null` |
| `MarkdownParserCore.parse(String, String)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Parse content together with `sourcePath` for traceability |
| `SpecPackMarkdownParser.parse(String)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Parse in-memory content using the default parse mode |
| `SpecPackMarkdownParser.parse(String, String)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Parse with `sourcePath` |
| `SpecPackMarkdownParser.parse(String, String, String)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Parse with `draft` / `official` parseMode |
| `SpecPackMarkdownParser.hasSection(ParsedArtifact, String...)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Controlled helper for alias section checks |
| `SpecPackMarkdownParserController.parseInline(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | API for parsing inline content |
| `SpecPackMarkdownParserController.parseFile(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | API for parsing files with extension/path guard |
| `ArtifactScannerService.scan(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Entry point for scan / ticket ingest |
| `ArtifactScannerService.getRun(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Retrieve the status of a scan run |
| `ArtifactScannerService.getRunArtifacts(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Retrieve the artifact list for a run |
| `ArtifactScannerService.getCurrentInventory(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Retrieve the current inventory for a repository |
| `ArtifactScannerJdbcAdapter.insertSnapshot(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Persist parse / scanner snapshots |
| `ArtifactScannerJdbcAdapter.updateSnapshotParsedSummary(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Update `parsed_summary` JSONB |
| `ArtifactScannerJdbcAdapter.insertParsedAcceptanceCriteria(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Persist AC rows |
| `ArtifactScannerJdbcAdapter.insertParsedSection(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Persist section rows |
| `ArtifactScannerJdbcAdapter.insertEvidenceEvent(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Persist audit / event rows |
| `ArtifactScannerJdbcAdapter.insertDataQualityRecord(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Persist data quality / warning summary |

## Forbidden methods / methods that do not exist
| method/API | reason | alternative |
|---|---|---|
| `SelfReviewMarkdownParser.parseMarkdown(...)` | Does not exist in the current source | Build a new parser following the shared core + envelope pattern |
| `SelfReviewMarkdownParserController.readAnyFile(...)` | The parser must not become a generic file reader | Keep the path guard within the ticket scope |
| `SpecPackMarkdownParserController` writes to the DB directly | Wrong boundary, hard to audit | The controller should only call the service/parser; persistence should go through use case / adapter |
| `MarkdownParserCore` infers free-form language | Not suitable for a rule-based requirement | Keep normalization based on heading / table / placeholder rules |
| `ArtifactScannerService` exposes raw source content in logs | Privacy / security risk | Log only path / hash / status / count |

## DTO / Entity / Table / Migration mapping
| layer | name | path | Note |
|---|---|---|---|
| DTO | `SpecPackMarkdownParserController.ParseRequest` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Pattern for parse-inline input |
| DTO | `SpecPackMarkdownParserController.ParseFileRequest` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Pattern for parse-file input |
| Domain model | `MarkdownParserCore.MarkdownDocument` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Core parse envelope |
| Domain model | `MarkdownParserCore.MarkdownSection` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Section tree / nesting |
| Domain model | `MarkdownParserCore.MarkdownTable` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Parsed Markdown table |
| Domain model | `MarkdownParserCore.MarkdownPlaceholder` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Placeholder detection |
| Domain model | `SpecPackMarkdownParser.ParsedArtifact` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Output envelope / parse summary |
| Domain model | `SpecPackMarkdownParser.ParsingIssue` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Warning / error shape |
| Domain model | `SpecPackMarkdownParser.AcceptanceCriterion` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | AC record |
| Domain model | `ArtifactScannerModels.ParsedSummaryPatch` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | Snapshot summary update payload |
| Domain model | `ArtifactScannerModels.ParsedSection` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | Section persistence record |
| Domain model | `ArtifactScannerModels.ParsedAcceptanceCriteria` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | AC persistence record |
| Domain model | `ArtifactScannerModels.EvidenceEvent` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | Evidence / audit event record |
| Entity / model | `Artifact` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Artifact.java` | Artifact type seed comparison |
| Table | `tbl_dim_artifact_type` | DB schema | Artifact type code mapping (`SELF_REVIEW`) |
| Table | `tbl_fact_artifact_snapshot` | DB schema / migration `V4__init_shema_v2.sql` | Snapshot metadata + `parsed_summary` |
| Table | `tbl_fact_artifact_parsed_section` | DB schema / migration `V4__init_shema_v2.sql` | Section rows |
| Table | `tbl_fact_evidence_event` | DB schema / migration `V4__init_shema_v2.sql` | Evidence / audit event |
| Table | `tbl_fact_data_quality` | DB schema / migration `V4__init_shema_v2.sql` | Warning / error summary |
| Migration | `V1__init_schema.sql`, `V4__init_shema_v2.sql`, `V160__artifact_scanner.sql`, `V161__artifact_scanner_ticket_status.sql` | `EDCAP_BE/src/main/resources/db/migration/` | Existing schema path for scanner / parser outputs |

## formItemNm / SEQNO / Master Data / Code Value Mapping
| display/item | internal value | source | note |
|---|---|---|---|
| Artifact type | `SELF_REVIEW` | `tbl_dim_artifact_type` | Target artifact type for this ticket |
| Parse mode | `draft` / `official` | Parser/controller/scanner pattern | Used to separate draft parse and official snapshot |
| Parse status | `DRAFT` / `OFFICIAL` / `PARTIAL` / `FAILED` | Parser/controller/scanner pattern | Aggregate status for downstream consumers |
| Verdict | `PASS` / `NEEDS_UPDATE` / `BLOCKED` | `self-review.md` template | Must be normalized to this value set |
| Canonical section key | e.g. `IMPLEMENTATION_SUMMARY`, `TEST_RESULTS`, `OPEN_ISSUES` | Template + parser rule | Used for heading normalization |
| Section order | 1..11 | `self-review.md` template | No separate SEQNO master; preserve document order |
| AC sequence | `AC-<TICKET>-<n>` | Requirement | `n` starts at 1 and increments sequentially within the ticket |
| Placeholder marker | `---`, `<...>`, `TBD`, `TODO`, `N/A`, `-`, empty/null | Requirement | Must not be treated as complete data |

## Multilingual Note

- Ticket files may be written in Vietnamese, English, or a mix of both; the parser must preserve Unicode and not lose diacritics.
- Canonical headings may vary in spacing, hyphenation, and case, but normalization is allowed only through the fixed alias map.
- Free-form text must keep its original meaning; it must not be auto-translated or inferred beyond the source.

## Encoding / Mojibake Note

- Input must be handled as UTF-8 Markdown.
- Do not slice strings by byte; operate on characters only to avoid breaking Vietnamese accents.
- Support LF / CRLF line endings consistently so the content hash remains stable.
- If headings are normalized, only the title text should be normalized; the content and table cells must preserve the original characters.

## Log / Audit / Operation Note

- Logs must contain at least: `ticket_id`, `source_path`, `content_hash`, `parser_version`, `parse_status`, `warning_count`, `error_count`.
- Do not log raw content, raw prompts, raw chats, or any sensitive data that is not required for traceability.
- When parse fails, warnings / errors must be explicit so data quality and run audit can trace them.
- The file-parse endpoint must keep the path guard; files outside `docs/changes/<TICKET>/...` must not be read.
- If the parser is later connected to the scanner pipeline, evidence / event records must follow the existing pattern instead of introducing a new audit table.

## Ticket-Specific Constraints

- This is the parser ticket for `self-review.md`, not the spec-pack parser.
- The canonical 11-section template is the single source of truth for Phase 2.
- Only heading aliases in the fixed map are supported; do not infer freely from natural language.
- Nested subsections are limited to one child level; anything deeper must trigger a warning and must not be parsed into structure.
- Missing required sections must follow partial parse + warning / incomplete handling.
- Section 9 is optional.
- The parser endpoint is internal by default; do not expand it into a generic file-reader or public surface without approval.
- Do not add raw-text persistence or a separate audit table within the Phase 2 scope.