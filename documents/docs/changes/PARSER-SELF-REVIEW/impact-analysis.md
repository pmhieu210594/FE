# Impact Analysis

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung  
**Update date**: 2026-06-23  

## 1. Change Content

This ticket adds a dedicated parser envelope for `self-review.md` on top of the shared Markdown core. The scope includes strict 11-section parsing, header metadata extraction, fixed alias normalization, placeholder / malformed-table detection, internal parse endpoints, and reuse-first scan persistence when the parser output is wired into the existing scanner flow. The ticket does not introduce a FE surface and does not require a new database migration.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Shared parsing primitives are reused by the self-review envelope | modify / reuse |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | Dedicated self-review parser, verdict normalization, issue reporting, and subtree completeness checks | add / modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SelfReviewMarkdownParserController.java` | Internal parse-inline / parse-file endpoint with path guard | add / modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Hook parser output into scan flow and persistence when scanner integration is enabled | modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | Parsed summary / section / evidence records reused by the scan flow | modify / reuse |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Reuse existing upsert / insert pattern for parsed output | modify / reuse |
| `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SelfReviewMarkdownParserTest.java` | Parser unit regression coverage | add / modify |
| `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SelfReviewMarkdownParserControllerTest.java` | Controller guard and contract coverage | add / modify |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `docs/architecture/*.md` | Used to confirm boundaries, route patterns, and reuse-first contracts | low |
| `docs/standards/*.md` | Used to enforce backend, security, logging, database, and testing rules | low |
| `.claude/rules/*` | Ticket-local guardrails for architecture, security, and testing | low |
| `EDCAP_BE/src/test/resources/test-fixtures/PARSER-SELF-REVIEW/self-review.md` | Canonical regression fixture for parser tests | low |
| `EDCAP_FE/**` | No FE work is required; any FE change would be out of scope | none |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| Manual / QA parse request | `SelfReviewMarkdownParserController.parseInline(...)` | Direct |
| Manual / QA file parse request | `SelfReviewMarkdownParserController.parseFile(...)` | Direct |
| Controller | `SelfReviewMarkdownParser.parse(...)` | Direct |
| Self-review parser | `MarkdownParserCore.parse(...)` | Direct |
| Scanner service | `SelfReviewMarkdownParser.parse(...)` | Direct when scan hook is enabled |
| Scanner service | `ArtifactScannerJdbcAdapter` persistence methods | Direct when scan hook is enabled |
| Parser tests / controller tests | Parser and controller classes | Direct |
| Later dashboards / data consumers | Parsed summary / section / evidence tables | Indirect |

## 5. FE Impact

- None in the current scope.
- No FE route, page, or shared UI component is required for the parser itself.
- If an admin-facing test harness is added later, that must be treated as a separate FE ticket.

## 6. BE Impact

- Add a dedicated `self-review.md` parsing envelope rather than extending the parser into a generic Markdown reader.
- Keep the shared `MarkdownParserCore` as the low-level parser and move ticket-specific semantics into `SelfReviewMarkdownParser`.
- Preserve the fixed alias map and strict verdict normalization (`PASS`, `NEEDS_UPDATE`, `BLOCKED`).
- Keep the parse file endpoint internal and path-guarded to `docs/changes/<TICKET>/self-review.md`.
- Reuse the existing scanner service / persistence pattern when parsed output is written downstream.
- Emit warnings instead of hard failures for partial documents, malformed tables, placeholders, and missing optional sections.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `POST /api/v1/markdown-parser/self-review/parse-markdown` | Internal request body with content, sourcePath, and parseMode | Returns the parsed artifact envelope with warnings / errors / summary | yes |
| `POST /api/v1/markdown-parser/self-review/parse-markdown-file` | Internal request body with a path guarded to `docs/changes/<TICKET>/self-review.md` | Returns the parsed artifact envelope plus filePath wrapper | yes |
| `POST /api/v1/data-ops/artifact-scans` | No contract change required unless scanner wiring is enabled in the same phase | No contract change required | yes |

## 8. DTO / Schema / Validation Impact

- Request DTOs must reject blank content/path inputs and must preserve the parse mode as an explicit input.
- The parse response should expose source path, ticket ID, parse mode, parse status, artifact status, section lists, tables, warnings, errors, missing sections, verdict, content hash, and parser version.
- Validation must keep the file endpoint inside the ticket scope and inside the working directory.
- No new domain entity is required for the parser-only path; the current scanner model objects are reused when downstream persistence is enabled.

## 9. DB / Migration Impact

- No new migration is required for the current reuse-first scope.
- Existing scan persistence tables are sufficient if the parser output is later written through the scanner flow.
- The implementation must avoid introducing a new table just to store self-review parser output.
- If scanner persistence is enabled, reuse the existing snapshot / parsed section / evidence / data-quality pattern instead of adding schema churn.

## 10. Batch / Job / Event Impact

- No new batch or scheduled job is introduced by the parser itself.
- If the parser is wired into the scanner service, the existing scan run and evidence event flow can be reused.
- No new event bus or queue is required for this ticket.

## 11. Test Impact

- BE unit tests are needed for canonical parsing, missing sections, malformed tables, verdict normalization, nested subsection warnings, placeholder detection, and hash stability.
- BE controller tests are needed for the internal file path guard and parse response shape.
- Integration / API tests are only needed if the parser is wired into the scanner service in the same phase.
- Black-box tests should cover normal, error, boundary, permission, and operational viewpoints.

## 12. Operation / Monitoring Impact

- Logs should include ticket ID, source path, content hash, parse mode, parse status, warning count, and error count.
- Path-guard failures should be visible as explicit validation errors, not silent misses.
- Raw content, secrets, and other sensitive values must not be logged.
- The parser should emit enough summary data for downstream audit and quality dashboards without exposing the full raw document.

## 13. Rollout / Rollback Impact

- Rollout is additive because the parser is backend-only and internal.
- Rollback can be done by disabling the parse endpoint or the scanner hook without changing schema.
- Because no migration is required, rollback does not need DDL reversal.

## 14. Areas Determined to be Unaffected and Based on
| area | judgment | evidence |
|---|---|---|
| FE routes/pages/components | Unaffected | No FE caller or screen exists for this backend parser in the current source inventory |
| Authentication / role model | Unaffected | Parser access is internal/admin-only and reuses the existing caller guard pattern |
| Public API surface | Unaffected | The parse endpoint is internal and path-guarded |
| DB schema / migration | Unaffected | Reuse-first design; no new table or migration is required |
| Other ticket parsers | Unaffected | The self-review envelope is separate from the spec-pack parser |

## 15. Required Options

- Keep the parser rule-based and template-driven.
- Keep the endpoint internal-only and path-guarded.
- Reuse the shared Markdown core.
- Reuse the existing scan persistence pattern if downstream storage is enabled.
- Do not introduce new schema or FE work for the parser itself.

## 16. Human Decision Required

No blocking human decision remains for Phase 3. If a future phase wants the parser exposed publicly or wants a new persistence model, that must be decided explicitly as a separate change.

## 17. Risk Summary

The dominant risks are scope drift and compatibility drift: the parser must not become a generic Markdown reader, and the alias / section map must remain stable. Operational risk is low because the change is backend-only, the endpoint is internal, and the current design reuses existing persistence when downstream storage is needed.