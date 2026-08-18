# Source Availability

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC  
**Create date**: 2026-06-23  
**Author**: OpenAI  
**Update date**: 2026-06-23  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Primary spec | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/spec-pack.md` | read | high | Product / BE | AC and scope baseline | low | always-read |
| Context map | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/context.md` | read | high | BE | Current code and table inventory | low | always-read |
| Ticket rules | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/ticket-rules.md` | read | high | BE | Stop / ask constraints | low | always-read |
| Raw requirement | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/raw/requirement.md` | read | high | Product | Functional source for matching rules | low | required |
| Raw database design | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/raw/database_design.md` | read | high | BE / DB | Approved table set and link model | low | required |
| Raw wireframe | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/raw/wireframe.md` | read | high | FE | UI intent and page layout | medium | required |
| Architecture map | `documents/docs/architecture/route-api-map.md` | read | high | BE | Existing routes and missing traceability API | low | required |
| Architecture map | `documents/docs/architecture/service-layer-map.md` | read | high | BE | Existing use-case patterns | low | required |
| Architecture map | `documents/docs/architecture/repository-db-map.md` | read | high | BE / DB | Current table and adapter map | low | required |
| Source tree | `src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | read | high | BE | Existing write-side traceability logic | low | required |
| Source tree | `src/main/java/com/sdd/platform/infrastructure/persistence/adapter/GitPrMetadataCollectorJdbcAdapter.java` | read | high | BE | Existing traceability link upsert SQL | low | required |
| Source tree | `src/main/resources/db/migration/V4__init_shema_v2.sql` | read | high | DB | Active `tbl_` schema | low | required |
| Source tree | `src/main/java/com/sdd/platform/web/rest/GitPrMetadataCollectorController.java` | read | high | BE | Controller style reference | low | required |
| Source tree | `src/test/java/com/sdd/platform/web/rest/GitPrMetadataCollectorControllerTest.java` | read | high | BE / Test | Controller test pattern | low | required |
| FE source tree | `src/App.tsx` / `src/lib/api.ts` | read | high | FE | Routing and API contract patterns | low | required |
| FE source tree | `/traceability` route | not found | high | FE | Confirms missing read screen | medium | required |

## Summary

- Existing write-side traceability persistence is available and already uses `tbl_fact_traceability_link`.
- Existing artifact, PR, CI, and evidence tables are available in V4 schema.
- No dedicated traceability read API or FE traceability page exists yet.
- No new database table is required by the current spec and raw database design.

## Unavailable / Partial Sources

- Traceability read service and controller are not found in the source tree.
- A FE route and page for `/traceability` are not found in the current FE app.
- Exact completeness and broken-link read-model implementation is not present yet.

## Risk Before Implementation

- The main risk is contract drift between FE and BE if the read API shape is invented too early.
- The second risk is completeness math drift if commit inclusion or report handling changes from the approved assumptions.
- The third risk is overreaching into schema changes even though the ticket and database design both prefer reuse.

## Required Human Decision

- Confirm the exact read API path and response shape before code.
- Confirm the final access policy for the traceability view.
- Confirm whether timeline source priority is `tbl_fact_evidence_event` only or a join across existing fact tables.
