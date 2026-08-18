# Source Availability

**Ticket ID**: PARSE-IMPL-PLAN  
**Create date**: 2026-06-18  
**Author**: ChatGPT  
**Update date**: 2026-06-19  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Ticket spec pack | `documents/docs/changes/PARSE-IMPL-PLAN/spec-pack.md` | read | high | Ticket author | Scope, AC, and storage constraints | Spec drift if implementation diverges | always-read |
| Ticket context | `documents/docs/changes/PARSE-IMPL-PLAN/context.md` | read | high | Ticket author | Confirms backend-only parser flow | May still leave decisions open | always-read |
| Ticket rules | `documents/docs/changes/PARSE-IMPL-PLAN/ticket-rules.md` | read | high | Ticket author | Guardrails for implementation | Rule drift if not updated with code | always-read |
| Impl-plan template | `documents/docs/standards/templates/_ticket-template/impl-plan.md` | read | high | Standards owner | Heading contract for parsing | Template drift affects extraction mapping | always-read |
| Markdown parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | read | high | BE | Generic heading parser and content hash helper | H2/H3 parsing may miss odd formatting | always-read |
| Parser service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | read | high | BE | Parse orchestration and storage payload assembly | Service may drift from DB schema if not kept in sync | always-read |
| Parser persistence port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/DocParsePersistencePort.java` | read | high | BE | Contract for snapshot/section persistence | Port can drift from adapter if not updated together | always-read |
| Parser JDBC adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/ImplPlanParseJdbcAdapter.java` | read | high | BE | Maps parser output to existing DB tables | SQL must match live schema exactly | always-read |
| Existing DB schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | high | DB | Confirms reusable tables and columns | Wrong column mapping would break persistence | required-if-db |
| Parser unit tests | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseServiceTest.java` | read | high | QA / BE | Covers parser behavior and persistence fake | No live DB integration in unit-only coverage | verify-with-source |

## Summary

- The template contract is available and stable enough to implement against.
- Existing DB tables already cover snapshot and parsed-section storage.
- The parser can reuse current Markdown parsing code and persist without adding a dedicated `doc_parse_*` schema.

## Unavailable / Partial Sources

- No separate parser migration is needed for this ticket after the refactor.
- No live DB integration run has been confirmed in this pass.

## Risk Before Implementation

- Storage fields must stay aligned with the existing artifact snapshot schema.
- Query filters for `parseMode` rely on JSON summary fields rather than a dedicated parse table column.

## Required Human Decision

- Confirm whether parse errors should always be persisted.
- Confirm whether any extra summary metadata is needed in `parsed_summary`.
- Confirm whether the current API shape is sufficient for review.
