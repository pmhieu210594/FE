# Sources

**Ticket ID**: PARSE-IMPL-PLAN  
**Create date**: 2026-06-18  
**Author**: ChatGPT  
**Update date**: 2026-06-19  

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| User request in IDE | conversation | read | Asked to align docs and code to existing DB tables instead of adding too many tables. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Spec Pack | `documents/docs/changes/PARSE-IMPL-PLAN/spec-pack.md` | read | high | Primary requirement source. |
| Context | `documents/docs/changes/PARSE-IMPL-PLAN/context.md` | read | high | Confirms backend-only parser flow. |
| Implementation Plan | `documents/docs/changes/PARSE-IMPL-PLAN/impl-plan.md` | read | high | Defines the section contract to parse. |
| Ticket Rules | `documents/docs/changes/PARSE-IMPL-PLAN/ticket-rules.md` | read | high | Guardrails and stop conditions. |
| Template - Impl Plan | `documents/docs/standards/templates/_ticket-template/impl-plan.md` | read | high | Canonical section headings. |
| Existing DB schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | high | Confirms `tbl_fact_artifact_snapshot` and `tbl_fact_artifact_parsed_section`. |
| Phase 5 inputs | `documents/docs/standards/templates/_ticket-template/*.md` | read | high | Used to keep generated docs in template shape. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| Generic Markdown parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | read | Parses headings and computes a content hash. |
| Parse service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | read | Orchestrates parse, status, and storage payloads. |
| Persistence port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/DocParsePersistencePort.java` | read | Snapshot and section persistence contract. |
| JDBC adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/ImplPlanParseJdbcAdapter.java` | read | Maps parser output into existing DB tables. |
| API DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ImplPlanParseDtos.java` | read | Request/response mapping. |
| API controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ImplPlanParseController.java` | read | Demo parse/query endpoints. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Parser unit tests | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseServiceTest.java` | read | Covers success, missing section, duplicate heading, not-found, and idempotent upsert. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| None | - | not used | No external reference was required. |

## Excluded Sources

| source/path | reason |
|---|---|
| `documents/docs/changes/PARSE-IMPL-PLAN/raw/database_design.md` | Outdated draft for a custom parse schema; not the storage shape being implemented now. |
| Build outputs such as `target/` | Generated artifacts are not source truth. |
| `node_modules/` and similar caches | Not relevant. |

## Source Limitations

- The repo already provides reusable artifact snapshot and parsed-section tables, so a dedicated parse table is unnecessary.
- No live DB run was executed in this pass, so SQL is compile-verified only.

## Assumptions from Sources

- `tbl_fact_artifact_snapshot` is the main persistence unit for parsed documents.
- `tbl_fact_artifact_parsed_section` stores the per-section output.
- `parseMode` can be carried in `parsed_summary` JSON until a dedicated column is needed.

## Human Confirmation Required

- Confirm whether the current API response shape is sufficient.
- Confirm whether parse error snapshots should always be stored.
- Confirm whether additional summary fields belong in `parsed_summary`.
