# Source Inventory

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: Codex  
**Update date**: 2026-06-19  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket spec | `docs/changes/PARSER-SPEC-PACK/spec-pack.md` | document | Ticket owner | read | Single source of truth for this ticket's AC/scope/impact |
| Ticket context | `docs/changes/PARSER-SPEC-PACK/context.md` | document | Ticket owner | read | Correctly maps the APIs/jobs/methods/files involved |
| Ticket rules | `docs/changes/PARSER-SPEC-PACK/ticket-rules.md` | document | Ticket owner | read | Must-follow and must-not-do rules |
| Raw requirement | `docs/changes/PARSER-SPEC-PACK/raw/requirement.md` | markdown | BA/Owner | read | Canonical source for AC, draft/official flow, and scope |
| Raw database design | `docs/changes/PARSER-SPEC-PACK/raw/database-design.md` | markdown | DB/Backend | read | Canonical source for reuse schema, seed, JSONB, and no-new-table rule |
| Raw template | `docs/changes/PARSER-SPEC-PACK/raw/spec-pack-template.md` | markdown | Ticket owner | read | Standard template for the parser and Phase 1 documents |
| Architecture overview | `docs/architecture/overview.md` | markdown | Architecture | read | General repository context |
| Data flow map | `docs/architecture/data-flow-map.md` | markdown | Architecture | read | GitHub webhook / scanner / parser flow |
| Service layer map | `docs/architecture/service-layer-map.md` | markdown | Architecture | read | Defines parser/scanner/domain boundaries |
| Repository DB map | `docs/architecture/repository-db-map.md` | markdown | Architecture | read | Confirms snapshot/view/reuse schema |
| Route API map | `docs/architecture/route-api-map.md` | markdown | Architecture | read | Confirms existing endpoints and current contracts |
| External interface map | `docs/architecture/external-interface-map.md` | markdown | Architecture | read | Cross-checks file paths, Markdown input, and DEV-only parsing |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | markdown | Architecture | read | Confirms there is no current FE caller for the parser |
| Test map | `docs/architecture/test-map.md` | markdown | QA/Architecture | read | Confirms the parser test gap |
| Backend standards | `docs/standards/backend.md` | markdown | Standards | read | Rules for package/layer/adapter/controller |
| Database standards | `docs/standards/database.md` | markdown | Standards | read | Reuse-first, seed-first, idempotent rules |
| Security standards | `docs/standards/security.md` | markdown | Standards | read | Path guard, secret hygiene, data minimization |
| Logging standards | `docs/standards/logging.md` | markdown | Standards | read | traceId / audit / warning / error logging rules |
| Testing standards | `docs/standards/testing.md` | markdown | Standards | read | Unit / integration / regression rules + AC traceability |
| Architecture rules | `.claude/rules/20-architecture.md` | markdown | Rules | read | Layer dependency and boundary rules |
| Security rule | `.claude/rules/30-security.md` | markdown | Rules | read | No raw sensitive data / no file-read primitive |
| Testing rule | `.claude/rules/40-testing.md` | markdown | Rules | read | AC-to-test mapping rule |
| BE parser source | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | java | BE | read | Baseline parser class |
| BE scanner service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | java | BE | read | Runner/use-case flow and idempotent scan |
| BE scanner persistence | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | java | BE | Persistence pattern for snapshot/run/current inventory |
| BE scanner port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java` | java | BE | Port to expand if parsed output is persisted |
| BE scanner models | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | java | BE | Existing domain records for run/snapshot |
| BE controllers | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | java | BE | DEV-only parse endpoint pattern |
| BE controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | java | BE | Admin scan API pattern |
| BE DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ArtifactScannerDtos.java` | java | BE | Existing scanner request/response DTO pattern |
| DB migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | sql | DB | read | Base schema / base seed |
| DB migration | `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` | sql | DB | read | Additive scanner seed / view migration |
| DB migration | `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | sql | DB | read | Current inventory view support |
| Current parser tests | `EDCAP_BE/src/test/java/com/sdd/platform/...` | test | QA | partial | No dedicated spec-pack parser test found yet |

## Important Files

- `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` — the baseline Markdown parser, and the nearest place to tighten strict spec-pack logic.
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` — where the scan flow is connected to parser and persistence.
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` — the persistence pattern that should be expanded to store parsed output.
- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java` — the contract that must expand if parsed sections / AC / decision / risk / event are written.
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` — DEV-only parser endpoint; it must not become a generic file reader.
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` — the existing admin scan API; it can stay unchanged if only internals change.
- `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ArtifactScannerDtos.java` — the current scanner request/response shape.
- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` — the base schema and seed rules/artifact types.
- `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` — additive scanner seed / view migration.
- `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` — current inventory view support.
- `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` — existing test for the webhook-triggered scan flow.
- `EDCAP_BE/src/test/java/com/sdd/platform/web/exception/GlobalExceptionHandlerTest.java` — HTTP error mapping test pattern.
- `EDCAP_BE/documents/docs/architecture/test-map.md` — gap map showing that parser-specific tests are still missing.
- `EDCAP_BE/documents/docs/architecture/route-api-map.md` — confirms the current demo / scanner routes.
- `EDCAP_BE/documents/docs/architecture/service-layer-map.md` — confirms the domain / service / use-case boundary.

## Generated / Excluded Files

- `EDCAP_BE/target/` — build output; not a source.
- `EDCAP_FE/dist/` — FE build output; not a source.
- `EDCAP_FE/node_modules/` — dependency cache; not a source.
- `EDCAP_FE/coverage/` — generated report; not a source.
- `docs/changes/PARSER-SPEC-PACK/export*/` — supplementary exports for sharing; not the canonical source for implementation.
- `docs/changes/PARSER-SPEC-PACK/*.zip` — user-supplied archives; only use them to inspect original source if needed.

## Missing Files

- `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/ArtifactNormalizerTest.java`
- `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerServiceTest.java`
- `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapterTest.java`
- `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SpecPackMarkdownParserControllerTest.java`
- FE caller/screen for parser/scanner: no corresponding file found under `EDCAP_FE/src/**`
- Dedicated parser service/class for spec-pack: not found in the current source