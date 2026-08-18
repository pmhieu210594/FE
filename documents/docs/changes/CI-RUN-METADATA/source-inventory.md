# Source Inventory

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17
**Author**: ChatGPT
**Update date**: 2026-06-17

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Requirement input | `documents/docs/changes/CI-RUN-METADATA/raw/requirement.md` | doc | PM / BE | read | Primary AC source for scope and success criteria |
| Database input | `documents/docs/changes/CI-RUN-METADATA/raw/database_design.md` | doc | BE / DB | read | Defines job-level grain and approved tables |
| Ticket rules | `documents/docs/changes/CI-RUN-METADATA/ticket-rules.md` | doc | BE / QA | read | Stop / ask conditions and forbidden behavior |
| Architecture routes | `documents/docs/architecture/route-api-map.md` | doc | BE / FE | read | Confirms no CI-specific API route exists yet |
| Architecture DB map | `documents/docs/architecture/repository-db-map.md` | doc | BE / DB | read | Confirms current CI model/table gap and legacy schema history |
| Architecture service map | `documents/docs/architecture/service-layer-map.md` | doc | BE | read | Shows existing collector / ingestion patterns to reuse |
| Architecture test map | `documents/docs/architecture/test-map.md` | doc | QA | read | Shows current test gaps and reusable test patterns |
| Database standards | `documents/docs/standards/database.md` | doc | DB | read | Migration naming, table naming, constraints, rollback notes |
| Logging standards | `documents/docs/standards/logging.md` | doc | BE | read | TraceId, logger, and sensitive logging rules |
| Testing standards | `documents/docs/standards/testing.md` | doc | QA / BE | read | Unit / integration / FE testing patterns |
| Backend standards | `documents/docs/standards/backend.md` | doc | BE | read | Service / adapter / transaction conventions |
| API contract standards | `documents/docs/standards/api-contract.md` | doc | BE / FE | read | Success vs error response shape and route rules |
| Security standards | `documents/docs/standards/security.md` | doc | BE / Sec | read | HMAC and secret handling rules |
| Legacy CI schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | sql | DB | read / partial | Contains `tbl_fact_ci_run`, `tbl_fact_ci_job`, and `tbl_connector_run` definitions |
| CI domain model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/CiRun.java` | java | BE | read | Existing run-level CI model, not job-level |
| Connector run model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/ConnectorRun.java` | java | BE | read | Existing connector run log model |
| Ingestion pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/SecurityEvidenceIngestService.java` | java | BE | read / partial | Best current pattern for safe ingestion, validation, and logging |
| Run logging adapter pattern | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | java | BE | read / partial | Shows connector run insert/update, per-item transaction pattern, and JDBC style |
| Existing mapper pattern | `EDCAP_BE/src/main/resources/mapper/SecurityScanMapper.xml` | xml | BE | read | MyBatis column and upsert style reference |
| Existing repository adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/SecurityScanRepositoryAdapter.java` | java | BE | read | Simple adapter pattern for save/findRecent |
| Existing repository port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/SecurityScanRepositoryPort.java` | java | BE | read | Port shape reference |
| Existing FE evidence page | `EDCAP_FE/src/pages/SafetyEvidencePage.tsx` | tsx | FE | read | Closest current table-based evidence UI pattern |
| Existing FE API layer | `EDCAP_FE/src/lib/api.ts` | ts | FE | read / partial | Central place for future CI endpoint helpers |
| Existing FE tests | `EDCAP_FE/src/__ tests __/pages/SafetyEvidencePage.test.tsx` | tsx | FE | read | Existing UI test style reference |

## Important Files

- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/CiRun.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/ConnectorRun.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/SecurityEvidenceIngestService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java`
- `EDCAP_BE/src/main/resources/mapper/SecurityScanMapper.xml`
- `EDCAP_FE/src/lib/api.ts`
- `EDCAP_FE/src/pages/SafetyEvidencePage.tsx`

## Generated / Excluded Files

- `EDCAP_BE/target/`
- `EDCAP_FE/dist/`
- `EDCAP_FE/node_modules/`
- `EDCAP_FE/coverage/`
- `**/*.log`
- `**/*.tmp`
- Archive content under temporary extraction folders

## Missing Files

- `documents/docs/changes/CI-RUN-METADATA/spec-pack.md`
- CI-specific BE controller file
- CI-specific BE service / use-case file
- CI-specific repository port / adapter file
- CI-specific mapper or SQL file
- CI-specific DTO file
- CI-specific FE page or hook
- CI-specific BE integration test package
- `src/test/resources/application-test.yml`
