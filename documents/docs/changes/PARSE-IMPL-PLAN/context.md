# Context

**Ticket ID**: PARSE-IMPL-PLAN  
**Create date**: 2026-06-18  
**Author**: ChatGPT  
**Update date**: 2026-06-18  

## Screen / API / Batch / Related Job

- Backend parser service for ticket-scoped `docs/changes/{{TICKET}}/impl-plan.md`
- Optional read-only review/query API for parsed results
- No FE screen is required in the PoC unless explicitly added later
- The parser should run as a safe backend job or service action, not as a code-generation step

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Safe markdown section parsing | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Read file content, detect template headings, extract section text, keep source hash |
| Idempotent parse result persistence | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/ImplPlanParseJdbcAdapter.java` | Upsert by repository_id + source_path + content_hash |
| Safe error logging | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | Log only sanitized parse errors and correlation data |

## Allowed common components

| component | path | usage note |
|---|---|---|
| Markdown section parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Parse headings and content blocks |
| File hash helper | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Compute source hash for idempotency |
| Structured logger | existing project logging | Log parse status without raw secret content |
| Safe result DTO | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ImplPlanParseDtos.java` | Hold extracted sections and parse status |

## Forbidden common components

| component | reason |
|---|---|
| `impact-analysis.md` parser | Out of scope for this ticket |
| Raw payload logger | Could leak sensitive content |
| Guess-based API/method calls | Must not invent non-existing methods |
| Auto-code-generation component | Not part of the parser PoC |
| No new `tbl_fact_doc_parse_*` tables | Existing artifact snapshot tables already cover the storage need |

## List of methods and classes that actually exist

| method/class | path | usage |
|---|---|---|
| `ArtifactNormalizer` (helper) | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Normalize markdown, detect template headings, compute source hash, extract sections |
| `ImplPlanParseService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | Orchestrates parse flow and persistence via ports (parseAndStore()) |
| `ImplPlanParseJdbcAdapter` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/ImplPlanParseJdbcAdapter.java` | Persistence adapter — upsert snapshot and parsed-section rows into existing artifact tables |
| `ImplPlanParseController` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ImplPlanParseController.java` | REST endpoints for parse request and snapshot listing/getting |
| `GithubWebhookService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | Ingestion entrypoint that triggers draft parse flows (draftParseImplPlan()) |
| `ImplPlanParseDtos` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ImplPlanParseDtos.java` | DTOs used by controller and FE mapping (request/result/snapshot/field)

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `parseImpactAnalysis()` | Ticket excludes `impact-analysis.md` | Parse only `impl-plan.md` sections |
| `saveRawPayload()` | Unsafe | Persist only normalized parse result |
| `guessSectionBySimilarity()` | Too brittle for template-driven docs | Explicit heading mapping |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| DTO | `ImplPlanParseRequestDto` / `ImplPlanParseResultDto` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ImplPlanParseDtos.java` | Controller ↔ service DTOs (maps to `DocParseModels.ParseRequest` / `ParseResult`) |
| Domain model | `DocParseModels.ParseSnapshot` / `ParseField` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/DocParseModels.java` | Core parse models used by service and tests |
| Persistence adapter | `ImplPlanParseJdbcAdapter` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/ImplPlanParseJdbcAdapter.java` | Maps domain models to existing artifact snapshot tables |
| Tables (PoC) | reuse `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section` | existing schema | The PoC maps parsed snapshots/sections into existing artifact tables rather than creating `tbl_fact_impl_plan_parse` |
| Migration | additive Flyway migration (if required) | `EDCAP_BE/src/main/resources/db/migration/` | Only add columns/tables when necessary; prefer additive migrations that reuse artifact snapshot tables |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| N/A | N/A | N/A | This ticket is parser-focused; no master-data mapping is required in PoC |

## Multilingual Note

- The parser must tolerate Vietnamese, English, and mixed-language markdown content.
- Section extraction must rely on template headings, not on language-specific keywords in the body.

## Encoding / Mojibake Note

- Source files must be treated as UTF-8 unless a confirmed exception exists.
- Parser logs must avoid mojibake by preserving the source encoding contract.

## Log / Audit / Operation Note

- Log file path, source hash, parser version, parse status, and safe error summary.
- Do not log raw markdown content beyond what is already extracted into the parsed result.
- Keep parse operations idempotent and traceable.

## Ticket-Specific Constraints

- Parse only `impl-plan.md`.
- Do not parse `impact-analysis.md` in this ticket.
- Do not implement code generation.
- Do not invent methods or APIs that are not confirmed in source.
