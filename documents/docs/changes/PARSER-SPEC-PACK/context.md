# Context

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung  
**Update date**: 2026-06-19  

## Screen / API / Batch / Related Job

- Spec-pack parser read API: `POST /api/v1/markdown-parser/spec-pack/parse-markdown`
- Spec-pack parser file read API: `POST /api/v1/markdown-parser/spec-pack/parse-markdown-file`
- Artifact scan operation API: `POST /api/v1/data-ops/artifact-scans`
- View scan run API: `GET /api/v1/data-ops/artifact-scans/{runId}`
- View run artifacts API: `GET /api/v1/data-ops/artifact-scans/{runId}/artifacts`
- View current inventory API: `GET /api/v1/data-ops/artifact-scans/current`
- Related job/flow: `ArtifactScannerService.scan(...)` runs in the existing ingest flow and is the backend entrypoint closest to the Markdown parser
- Supporting job/flow: GitHub webhook / Git local ingest / connector run lifecycle used to push Markdown files into the scanner

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Pure Markdown parser without DB access | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Parse content into structure, keep domain logic pure, do not call persistence |
| Connector run / scan flow with audit | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Create run, handle idempotency, save success/failed state, write lifecycle logs |
| Spec-pack parse API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Use only for spec-pack parser, guard path/extension, must not become a generic file reader |
| Scan operation API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | Admin only, clearly separate run / artifacts / current inventory |

## Allowed common components
| component | path | usage note |
|---|---|---|
| `ArtifactNormalizer` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Use as the Markdown parsing foundation for front matter, sections, and AC hashing |
| `ArtifactScannerService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Use when attaching the parser to the existing ingest/run flow |
| `ArtifactScannerJdbcAdapter` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Use as a persistence/idempotent upsert pattern reference |
| `jakarta.validation` | Existing validation foundation | Use to block empty / invalid input instead of ad hoc checks |
| Standard Spring/SLF4J logging | Entire backend | Use to record traceId, ticket_id, parse_status, warning/error count |

## Forbidden common components
| component | reason |
|---|---|
| External NLP/LLM parser | Requirement demands a rule-based parser, not general natural-language understanding |
| FE common UI components | This ticket is backend/doc parser context, not shared UI components |
| Generic unrestricted file reader | Risk of path traversal and reading files outside ticket scope |
| New table/schema for MVP | Database design is reuse-first and does not add new tables in v1 |
| Raw content persistence | Do not store raw prompt/raw chat/raw source code/secret |

## List of methods that actually exist
| method/class | path | usage |
|---|---|---|
| `ArtifactNormalizer.parse(String)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Parse front matter, sections, AC line, and content hash |
| `ArtifactNormalizer.hasSection(ParsedArtifact, String...)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Check section aliases using substring matching |
| `ArtifactScannerService.scan(ArtifactScanRequest)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Run the scan/ingest flow and write run audit logs |
| `ArtifactScannerService.getRun(UUID)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Retrieve the status of one run |
| `ArtifactScannerService.getRunArtifacts(UUID)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Retrieve the artifact list for a run |
| `ArtifactScannerService.getCurrentInventory(UUID)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Retrieve current inventory by repository |
| `ArtifactScannerController.run(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | Admin API to start a scan |
| `ArtifactScannerController.getRun(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | Admin API to view a run |
| `ArtifactScannerController.getRunArtifacts(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | Admin API to view run artifacts |
| `ArtifactScannerController.getCurrentInventory(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | Admin API to view current inventory |
| `SpecPackMarkdownParserController.parseInline(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | API to parse from raw content |
| `SpecPackMarkdownParserController.parseFile(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | API to parse from file with extension/path guard |

## Forbidden methods / methods that do not exist
| method/API | reason | alternative |
|---|---|---|
| `ArtifactNormalizer.parseMarkdown(...)` | Does not exist in the current source | Use `ArtifactNormalizer.parse(String)` |
| `ArtifactNormalizer.parseSpecPack(...)` | Not present in the source yet | Create a wrapper/service in Phase 3 if needed |
| `SpecPackMarkdownParserController` reading files outside `.md/.markdown` whitelist | Must not become a generic file-read primitive | Keep the current extension/path guard |
| Writing directly to DB from `SpecPackMarkdownParserController` | Wrong boundary, hard to audit | Move to service/use case + repository adapter |
| Using `ArtifactNormalizer.hasSection(...)` as the only validation | It is only an alias helper and is not enough to determine completeness | Combine section map parsing with the rule engine |

## DTO / Entity / Table / Migration mapping
| layer | name | path | Note |
|---|---|---|---|
| DTO | `ArtifactScanRequestDto` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ArtifactScannerDtos.java` | Input for the scan API |
| DTO | `ArtifactScanResultDto`, `ArtifactScanRunDto`, `ArtifactScanArtifactDto` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ArtifactScannerDtos.java` | Output for admin APIs |
| Domain model | `ArtifactScannerModels.ArtifactSnapshot` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | Existing snapshot mapping pattern |
| Domain model | `ArtifactScannerModels.ScanRun` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | Existing connector run mapping pattern |
| Entity/model | `Artifact` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Artifact.java` | Legacy model, useful for artifact type comparison |
| Table | `tbl_fact_artifact_snapshot` | DB design | Stores snapshot metadata + parsed_summary JSONB |
| Table | `tbl_fact_artifact_parsed_section` | DB design | Stores each parsed section |
| Table | `tbl_fact_acceptance_criteria` | DB design | Stores each AC |
| Table | `tbl_fact_decision` | DB design | Stores Human Decision Required |
| Table | `tbl_fact_risk` | DB design | Stores open issues / risks with impact |
| Table | `tbl_fact_evidence_event` | DB design | Stores parse/audit events |
| Table | `tbl_fact_data_quality` | DB design | Stores warning/error/data quality data |
| Table | `tbl_artifact_required_field_rule` | DB design | Configures required fields / score weights |
| Migration | No new migration required for MVP | DB design | Prefer reusing existing tables; only seed/configure when needed |

## formItemNm / SEQNO / Master Data / Code Value Mapping
| display/item | internal value | source | note |
|---|---|---|---|
| Artifact type | `SPEC_PACK` | `tbl_dim_artifact_type` | Used to identify the target parser artifact |
| Parse mode | `draft` / `official` | Requirement | Distinguishes early snapshot and final snapshot |
| Parse status | `DRAFT` / `OFFICIAL` / `PARTIAL` / `FAILED` | Requirement | Used for dashboard and audit |
| AC number | `AC-<TICKET>-<n>` | Requirement | `n` starts at 1 and increases continuously within the ticket |
| Canonical section key | Examples: `CONTEXT_PURPOSE`, `SCOPE`, `OPEN_ISSUES` | Spec-pack template + DB design | Used to normalize heading aliases |
| Placeholder marker | `---`, `<...>`, `TBD`, `TODO`, `N/A`, `-`, empty/null | Requirement | Marks incomplete data; must not be treated as complete |

## Multilingual Note

- The document content is written in Vietnamese, but the heading and table names must keep the English template used by the ticket template.
- The parser must accept Markdown written in Vietnamese, English, or a mix, as long as the logical template is still present.
- Headings may vary slightly in hyphenation, spacing, and letter case; the parser must normalize them to canonical keys.

## Encoding / Mojibake Note

- The input file must be treated as standard UTF-8 Markdown.
- Vietnamese characters with accents must not be corrupted when reading, writing, or previewing.
- Do not change the encoding or slice strings by bytes in a way that could break multi-byte characters.
- If heading normalization is needed, normalize only the title text; section content must be preserved as-is.

## Log / Audit / Operation Note

- Must record `ticket_id`, `source_path`, `content_hash`, `parse_mode`, `parse_status`, `warning_count`, `error_count`, `parser_version`, and `trace_id`.
- If parsing from the scan/run flow, it must be linked to `connector_run_id` for audit tracing.
- Do not log the full raw content unless necessary; prefer summary, section key, line pointer, and hash.
- Never log secrets, raw prompt, raw chat, or unnecessary PII.

## Ticket-Specific Constraints

- All requirement ACs must be mapped 1:1 to `impl-plan`, `review-checklist`, `test-plan`, and `blackbox-testcases`.
- Do not add behavior beyond the requirement/database design just to make implementation easier.
- Do not add new tables for the MVP; any expansion should be considered only after an official decision.
- If there is a conflict between the real template and the spec pack, prioritize the raw requirement + database design.
- If an AC or section does not yet have a clear rule, record it as a phase open issue instead of inferring it yourself.