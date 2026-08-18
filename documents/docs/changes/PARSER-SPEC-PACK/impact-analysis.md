# Impact Analysis

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: Codex  
**Update date**: 2026-06-19  

## 1. Change Content

This ticket does not change the business scope of spec-pack; it clarifies the impact area for implementing a strict parser for `spec-pack.md` according to the standard template, wiring the parse output into the existing scan flow, and keeping a reuse-first approach for DB/schema. The main impact is on BE domain/parser, scanner orchestration, persistence adapter, and test coverage. FE is expected to remain unchanged.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Add strict spec-pack parsing, front matter precedence, section/table/AC extraction, placeholder detection | modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Attach parser to scan flow, handle draft/official, idempotent parse rerun | modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java` | Extend the port to persist parsed section/AC/decision/risk/event/data quality | modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Add SQL write/read for parse output into the reuse tables | modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Keep/adjust the parse endpoint for spec-pack without reading arbitrary files | modify |
| `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/ArtifactNormalizerTest.java` | New unit test for strict parser, AC, placeholder, hash | add |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerServiceTest.java` | Test parse orchestration + idempotency + missing artifact | add |
| `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapterTest.java` | Test persistence mapping for parsed output | add |
| `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SpecPackMarkdownParserControllerTest.java` | Test path/extension guard and parse summary response | add |

## 3. Indirectly Affected Files
| file | reason | risk |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | The API contract may not change, but the controller will reflect parsed data if the service returns additional summary | low |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ArtifactScannerDtos.java` | May need additional fields if the result surface should expose parse metadata | low |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | Webhook will continue to trigger a scan flow with the parser inside | low |
| `EDCAP_BE/src/main/java/com/sdd/platform/config/DomainConfig.java` | Changes only if a new parser/service bean is split out; if `ArtifactNormalizer` is reused, no change | low |
| `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` | Only touched if the target branch lacks the ARTIFACT_SCANNER seed; the current repo already has the seed | very low |
| `EDCAP_FE/src/**` | No FE caller was found for the current parser/scanner; no change is expected | very low |

## 4. Caller / Callee
| caller | callee | impact |
|---|---|---|
| `GithubWebhookService.handle(...)` | `ArtifactScannerService.scan(...)` | The webhook remains the source trigger; the parser runs inside the scan flow if the spec-pack file changes |
| `ArtifactScannerController.run(...)` | `ArtifactScannerService.scan(...)` | The admin scan API will indirectly trigger the parser |
| `ArtifactScannerController.getRun(...)` / `getRunArtifacts(...)` / `getCurrentInventory(...)` | `ArtifactScannerService.getRun* / getCurrentInventory(...)` | The existing read model may need to reflect the new parse result |
| `SpecPackMarkdownParserController.parseInline(...)` / `parseFile(...)` | `SpecPackMarkdownParser.parse(String)` | The parser endpoint uses the new strict parser |
| `ArtifactScannerService.scan(...)` | `ArtifactScannerSourcePort` | Needs bytes/tree/ref to read the file and compute the content hash |
| `ArtifactScannerService.scan(...)` | `ArtifactScannerPersistencePort` | Needs to persist snapshot + parsed section/AC/decision/risk/event |
| `ArtifactScannerJdbcAdapter` | `tbl_fact_artifact_snapshot` / `tbl_fact_artifact_parsed_section` / `tbl_fact_acceptance_criteria` / `tbl_fact_decision` / `tbl_fact_risk` / `tbl_fact_evidence_event` / `tbl_fact_data_quality` | Persistence read/write uses the existing schema |

## 5. FE Impact

- No FE caller was found for the current parser/scanner.
- `EDCAP_FE/src/**` has no route/component/API helper calling `/api/v1/markdown-parser/spec-pack/parse-markdown`, `/api/v1/markdown-parser/spec-pack/parse-markdown-file`, or `/api/v1/data-ops/artifact-scans`.
- Therefore, this Phase 3 work is expected to **require no FE changes**; if the response changes, it would be internal/dev-only and should remain backward compatible.

## 6. BE Impact

- `ArtifactNormalizer` needs to move from a general Markdown parser to a strict spec-pack parser, keeping pure domain logic while tightening section/template/AC/placeholder rules.
- `ArtifactScannerService` will be the orchestration point for parsing after the scan obtains the file/bytes and decides draft/official / idempotent rerun.
- The persistence adapter and port need to be extended to write parsed section, AC, decision, risk, event, and data quality into the existing reuse tables.
- `SpecPackMarkdownParserController` should remain only an internal parser tool; the response must use the same parser logic and must not allow a generic file-read primitive.
- `ArtifactScannerController` can keep the same contract if only the internals change, but its scan/current inventory responses must still be checked for sufficient metadata for Data Ops.

## 7. API Contract Impact
| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `POST /api/v1/markdown-parser/spec-pack/parse-markdown` | Request remains unchanged; if the parser becomes stricter, error/warning semantics change in the response body map | Response map may add normalized warnings/sections/AC if needed | Yes, additive |
| `POST /api/v1/markdown-parser/spec-pack/parse-markdown-file` | Request remains unchanged; the path guard is still required | Response map may add parse summary and warning details | Yes, additive |
| `POST /api/v1/data-ops/artifact-scans` | Current request remains unchanged | The run/artifacts response may reflect the new parse status, but the required shape does not change | Yes, if only internal fields are added |
| `GET /api/v1/data-ops/artifact-scans/{runId}` | No request change | The artifact/scan run DTO can remain unchanged | Yes |
| `GET /api/v1/data-ops/artifact-scans/{runId}/artifacts` | No request change | The artifact scan result may add parse metadata if the DTO is extended | Yes, additive |
| `GET /api/v1/data-ops/artifact-scans/current` | No request change | The current inventory may reflect the existing need_parse/scan_status fields | Yes |

## 8. DTO / Schema / Validation Impact

- The current scanner request DTO does not need to change if the parser is inserted inside the service.
- The scanner response DTO can remain as-is; if parse summary/warnings need to be exposed in more detail, only additional fields should be added, and the meaning of existing fields should not change.
- New validation is mainly inside the parser: standard template, front matter precedence, AC format, placeholder detection, and warning/error classification.
- Schema/DB validation does not require new columns; it only needs to ensure row writes into the reuse tables use the correct keys and the correct JSONB payload.

## 9. DB / Migration Impact

- **No new tables.**
- **No new mandatory columns.**
- **No new schema migration for MVP** if the current branch already has `SPEC_PACK`, `ARTIFACT_SCANNER`, and the rule seeds.
- Parse data should be written into the existing reuse tables: `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section`, `tbl_fact_acceptance_criteria`, `tbl_fact_decision`, `tbl_fact_risk`, `tbl_fact_evidence_event`, `tbl_fact_data_quality`.
- If the target branch is missing any seed, use a forward fix / reseed from the existing migration instead of creating a separate schema.

## 10. Batch / Job / Event Impact

- `GithubWebhookService` remains the indirect source trigger; the parser does not change the webhook contract.
- `ArtifactScannerService.scan(...)` will be the main entrypoint for parse execution in batch / run / webhook-triggered flows.
- It may be necessary to record parse events such as `PARSE_STARTED`, `PARSE_COMPLETED`, `PARSE_FAILED`, and `PARSE_WARNING` in `tbl_fact_evidence_event` if the service does not already do so.
- No independent new job should be added unless needed; reusing the existing run lifecycle will reduce operational risk.

## 11. Test Impact

- Add unit tests for the strict parser: front matter precedence, section extraction, table parsing, AC normalization, placeholder detection, and error/warning split.
- Add service/integration tests for `ArtifactScannerService` to prove idempotency by `content_hash`, draft/official logic, and missing artifact handling.
- Add adapter tests to ensure parse output is written into the reuse tables with the correct keys/JSONB.
- Add or update tests for `SpecPackMarkdownParserController` if the endpoint remains.
- There is no direct FE test impact.

## 12. Operation / Monitoring Impact

- Logs must be sufficient to trace `ticket_id`, `source_path`, `content_hash`, `parse_mode`, `parse_status`, `trace_id`, and warning/error counts.
- Draft parse and official parse must be clearly distinguished in logs/audit so Data Ops knows which snapshot is the final one.
- Do not log full raw content; only log the summary, hash, section key, and short errors.
- If the parser returns many warnings for the same corpus, that is a signal of template drift and requires operational review.

## 13. Rollout / Rollback Impact

- Rollout should be additive: the strict parser is enabled in the scan flow, but the contract/DB shape does not change.
- If the strict parser causes too many false positives, the fastest rollback is to disable parser invocation in `ArtifactScannerService` and revert to the old scan status.
- Because there is no new migration, rollback does not require a complicated schema rollback; code revert / feature toggle / integration disable is sufficient.
- Data already written in the snapshot/section/AC tables can remain for audit.

## 14. Areas Determined to be Unaffected and Based on
| area | judgment | evidence |
|---|---|---|
| FE app / router / components | Unaffected | No FE caller was found for the parser/scanner; `rg` on `EDCAP_FE/src` did not return artifact-scans/parse-markdown/spec-pack |
| Auth/session/OAuth flow | Unaffected | No changes to `SecurityConfig`, login, me, or refresh/session |
| Webhook payload format | Unaffected | GitHub/CircleCI HMAC contracts do not change; the parser runs only after the scan has obtained the file |
| DB schema / migration shape | Unaffected | The requirement + database design have already locked in reuse-first; the repo already has sufficient tables/views/seeds |
| Connector type `ARTIFACT_SCANNER` | Unaffected | The seed already exists in `V160__artifact_scanner.sql`; no new seed is needed for the MVP |
| `SPEC_PACK` artifact type / required-field rule | Unaffected | Already present in `V4__init_shema_v2.sql` and the existing rule seed |

## 15. Required Options

- Reuse-first schema path.
- Strict parser, template only.
- No new FE surface.
- No new DB table.
- Keep the DEV-only parse endpoint isolated.
- AC coverage 1:1 from spec-pack to test artifacts.

## 16. Human Decision Required

No new manual decision is needed before implementing Phase 4. The standard template and heading policy are already locked: the parser only accepts the standard template and does not accept aliases outside the template.

## 17. Risk Summary

- The main risk is that the parser is either too strict or not strict enough compared to the real ticket corpus, causing warning/error drift.
- The second risk is that the persistence adapter does not map all reuse tables, causing the parsed output trace to break.
- The third risk is that test coverage does not reach all 10 ACs, causing Phase 4 to go in the wrong direction even if the code works.
- Operational risk is low because there is no new schema/migration and no new FE surface.