# Source Inventory

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung  
**Update date**: 2026-06-23  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket spec | `docs/changes/PARSER-SELF-REVIEW/spec-pack.md` | document | Ticket owner | read | Single source of truth for AC, scope, and phase constraints |
| Ticket context | `docs/changes/PARSER-SELF-REVIEW/context.md` | document | Ticket owner | read | Maps the parser/controller/scanner boundaries and allowed reuse |
| Ticket rules | `docs/changes/PARSER-SELF-REVIEW/ticket-rules.md` | document | Ticket owner | read | Must-follow and must-not-do constraints for this ticket |
| Raw requirement | `docs/changes/PARSER-SELF-REVIEW/raw/requirement.md` | markdown | BA/Owner | read | Defines the legacy 11-section template and AC-style expectations |
| Raw database design | `docs/changes/PARSER-SELF-REVIEW/raw/database-design.md` | markdown | DB/Backend | read | Defines reuse-first storage and no-new-table guidance |
| Raw template | `docs/changes/PARSER-SELF-REVIEW/raw/self-review-template.md` | markdown | Ticket owner | read | Canonical legacy self-review structure for parsing |
| Architecture overview | `docs/architecture/overview.md` | markdown | Architecture | read | General repository context |
| Service layer map | `docs/architecture/service-layer-map.md` | markdown | Architecture | read | Confirms parser / scanner / domain boundaries |
| Route API map | `docs/architecture/route-api-map.md` | markdown | Architecture | read | Confirms existing endpoints and contract shape |
| Repository DB map | `docs/architecture/repository-db-map.md` | markdown | Architecture | read | Confirms snapshot, section, and evidence reuse pattern |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | markdown | Architecture | read | Confirms there is no FE caller for this backend parser |
| Test map | `docs/architecture/test-map.md` | markdown | QA/Architecture | read | Confirms the parser coverage gap and test placement |
| Backend standards | `docs/standards/backend.md` | markdown | Standards | read | Layer, package, and controller / service boundaries |
| Database standards | `docs/standards/database.md` | markdown | Standards | read | Reuse-first, seed-first, idempotent storage policy |
| Security standards | `docs/standards/security.md` | markdown | Standards | read | Path guard, secret hygiene, and data minimization |
| Logging standards | `docs/standards/logging.md` | markdown | Standards | read | traceId, audit, warning, and error logging rules |
| Testing standards | `docs/standards/testing.md` | markdown | Standards | read | Unit / integration / regression rules and AC traceability |
| Architecture rules | `.claude/rules/20-architecture.md` | markdown | Rules | read | Layer dependency and boundary rules |
| Security rule | `.claude/rules/30-security.md` | markdown | Rules | read | No raw sensitive data and no file-read primitive |
| Testing rule | `.claude/rules/40-testing.md` | markdown | Rules | read | AC-to-test mapping rule |
| BE shared core | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | java | BE | read | Common Markdown parsing core used by the self-review envelope |
| BE self-review parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | java | BE | read | Dedicated self-review parsing envelope and verdict normalization |
| BE self-review controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SelfReviewMarkdownParserController.java` | java | BE | read | Internal parse-inline / parse-file API with path guard |
| BE scanner service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | java | BE | read | Scan flow and parse hook for snapshot / evidence persistence |
| BE scanner models | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | java | BE | read | Domain records for snapshot, section, AC, and evidence payloads |
| BE scanner persistence | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | java | BE | read | Persistence adapter reused for parsed output |
| BE scanner controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | java | BE | read | Admin scan API pattern and authorization guard |
| BE scanner DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ArtifactScannerDtos.java` | java | BE | read | Request / response DTO pattern for scan APIs |
| Self-review fixture | `EDCAP_BE/src/test/resources/test-fixtures/PARSER-SELF-REVIEW/self-review.md` | test fixture | QA | read | Canonical file used for parser regression tests |
| Self-review parser tests | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SelfReviewMarkdownParserTest.java` | test | QA | read | Parser unit regression coverage |
| Self-review controller tests | `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SelfReviewMarkdownParserControllerTest.java` | test | QA | read | Controller path-guard and response regression coverage |
| Scanner service tests | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ArtifactScannerServiceTest.java` | test | QA | partial | Scanner orchestration reference and integration pattern |
| Scanner integration tests | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/ArtifactScannerControllerIntegrationTest.java` | test | QA | partial | Operational scan API coverage pattern |

## Important Files

- `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` — shared Markdown primitives: front matter, headings, tables, placeholders, content hash, and subtree extraction.
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` — dedicated self-review envelope; fixed 11-section mapping, verdict normalization, and required-section detection.
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SelfReviewMarkdownParserController.java` — internal parse endpoints with path guard and file-scope validation.
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` — orchestration entry point where parser output is persisted into the existing scan flow.
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` — reuse-first persistence adapter for snapshot / section / evidence / data-quality writes.
- `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SelfReviewMarkdownParserTest.java` — parser regression coverage for canonical, boundary, and negative cases.
- `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SelfReviewMarkdownParserControllerTest.java` — controller guard and response regression coverage.
- `EDCAP_BE/src/test/resources/test-fixtures/PARSER-SELF-REVIEW/self-review.md` — canonical fixture used by the parser tests.

## Generated / Excluded Files

- `EDCAP_BE/target/**` — build output; not source.
- `EDCAP_FE/dist/**` — build output; not source.
- `EDCAP_FE/node_modules/**` — dependency cache; not source.
- `EDCAP_FE/coverage/**` — generated report; not source.
- `docs/changes/PARSER-SELF-REVIEW/*.zip` — user-supplied archive; inspect only when needed.

## Missing Files

- No FE screen or route was found under `EDCAP_FE/src/**`; this ticket remains backend/document focused.
- No new DB migration file is required for the current reuse-first scope.
- No dedicated raw-text persistence table is required; parsed output reuses the existing scan persistence pattern.