# Sources

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung  
**Update date**: 2026-06-19  

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Ticket folder | `docs/changes/PARSER-SPEC-PACK/` | Active | The ticket folder is being standardized as the single source of truth for Phase 1. |
| Raw requirement pack | `docs/changes/PARSER-SPEC-PACK/raw/requirement.md` | Reviewed | Primary requirement source, containing scope, AC, operating flow, and open points. |
| Raw database design | `docs/changes/PARSER-SPEC-PACK/raw/database-design.md` | Reviewed | Primary source for table mapping, reuse rules, and operational data. |
| Raw template | `docs/changes/PARSER-SPEC-PACK/raw/spec-pack-template.md` | Reviewed | Standard template for the `spec-pack.md` file. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement definition | `docs/changes/PARSER-SPEC-PACK/raw/requirement.md` | Reviewed | Primary | Describes the parser objective, scope, AC, NFR, and the draft/official parse flow. |
| Database design | `docs/changes/PARSER-SPEC-PACK/raw/database-design.md` | Reviewed | Primary | Defines reuse tables, section mapping, and the idempotent strategy. |
| Spec pack template | `docs/changes/PARSER-SPEC-PACK/raw/spec-pack-template.md` | Reviewed | Primary | The backbone of the heading/table structure that must be parsed. |
| Architecture overview | `docs/architecture/overview.md` | Reviewed | Supporting | Context for ingest flow and related collectors. |
| Data flow map | `docs/architecture/data-flow-map.md` | Reviewed | Supporting | Confirms the Artifact Scanner / GitHub webhook / collector flow. |
| Repository DB map | `docs/architecture/repository-db-map.md` | Reviewed | Supporting | Confirms snapshot tables and schema reuse mechanics. |
| Service layer map | `docs/architecture/service-layer-map.md` | Reviewed | Supporting | Confirms the parser-related service pattern and current layer state. |
| External interface map | `docs/architecture/external-interface-map.md` | Reviewed | Supporting | Confirms the `spec-pack.md` path and related artifact type. |
| Test map | `docs/architecture/test-map.md` | Reviewed | Supporting | Confirms parser test availability and the remaining gaps. |
| Backend standards | `docs/standards/backend.md` | Reviewed | Supporting | Backend package/layer/adapter/controller conventions. |
| Database standards | `docs/standards/database.md` | Reviewed | Supporting | Reuse-first, migration, and data quality conventions. |
| Security standards | `docs/standards/security.md` | Reviewed | Supporting | Path guard, secret handling, and data minimization conventions. |
| Testing standards | `docs/standards/testing.md` | Reviewed | Supporting | Unit/integration/regression conventions for the parser. |
| Architecture rules | `.claude/rules/20-architecture.md` | Reviewed | Supporting | Dependency rule and API/state/DB usage constraints. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| Markdown parser domain service | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Reviewed | Existing baseline Markdown parser: front matter, section, AC line, hash. |
| Spec-pack parse controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Reviewed | Dev-only endpoint for parsing `spec-pack.md` with path guard. |
| Artifact scanner service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Reviewed | Existing artifact ingest flow, useful for parser integration mapping. |
| Artifact scanner controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | Reviewed | Existing entry point for artifact scanning. |
| Artifact model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Artifact.java` | Reviewed | Existing artifact model and type mapping. |
| Scanner persistence adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Reviewed | Persistence pattern for artifact snapshot/use cases. |
| Source code search | `EDCAP_BE/src/main/java/...` | Partial | No dedicated parser for `spec-pack.md` has been found in the current source. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Backend integration | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/infrastructure/persistence/ArtifactScannerPersistenceIntegrationTest.java` | Reviewed | Verifies persistence for the artifact scanner. |
| Backend integration | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/ArtifactScannerControllerIntegrationTest.java` | Reviewed | Verifies the scanner controller. |
| Backend unit | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ArtifactScannerServiceTest.java` | Reviewed | Verifies scanner service logic. |
| Parser unit test | `EDCAP_BE/src/test/...` | Not found | No dedicated test for the `spec-pack.md` parser was found. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| External office docs, PDFs, slides if any | Local workspace attachment | Use only if they appear in the raw pack or are clearly attached to the ticket | Do not expand to the web. |
| Public web sources | Web | Do not use in this phase unless explicitly requested | Internal documents are sufficient for Phase 1. |

## Excluded Sources

| source/path | reason |
|---|---|
| `EDCAP_BE/target/`, `EDCAP_FE/dist/`, `EDCAP_FE/node_modules/`, `EDCAP_FE/coverage/` | Generated artifacts, not requirement sources. |
| Secrets, `.env`, logs, credential dump | Sensitive and unnecessary for Phase 1. |
| Sources outside `docs/changes/PARSER-SPEC-PACK/raw/` | Not needed when the raw pack and supporting source/standards are available. |

## Source Limitations

- The raw requirement and database design are detailed enough to lock the spec, but some operational decisions still depend on the technical owner.
- No dedicated parser for `spec-pack.md` has been found in the current source; the current implementation only has a baseline Markdown parser and a demo controller.
- Existing tests cover the artifact scanner well, but there is no dedicated test for the spec-pack parser yet.
- Architecture/standards docs are useful, but some parts are general guidance, so the raw pack should take priority when there is a conflict.

## Assumptions from Sources

- `spec-pack.md` is a mandatory artifact and must be parsed according to the standard template.
- The parse output must be sufficient to feed downstream score, coverage, traceability, and quality dashboard workflows.
- The current schema should be reused first; no new tables are needed for the MVP if the seed/rules are sufficient.
- Draft parse and official parse are two different operational states and must be kept separate.

## Human Confirmation Required

- No remaining mandatory questions in Phase 1 after cross-checking the requirement and database design.