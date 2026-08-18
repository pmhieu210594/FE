# Source Inventory

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC  
**Create date**: 2026-06-23  
**Author**: OpenAI  
**Update date**: 2026-06-23  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Spec / AC | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/spec-pack.md` | markdown | BE / Product | read | Primary AC source. |
| Context | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/context.md` | markdown | BE | read | Lists existing and missing source areas. |
| Rules | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/ticket-rules.md` | markdown | BE | read | Contains stop / ask conditions. |
| Requirement | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/raw/requirement.md` | markdown | Product | read | Functional rules and AC. |
| Database design | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/raw/database_design.md` | markdown | DB | read | Approved tables and link model. |
| Wireframe | `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/raw/wireframe.md` | markdown | FE | read | Read-only traceability screen concept. |
| Architecture | `documents/docs/architecture/route-api-map.md` | markdown | BE | read | Confirms traceability route is missing. |
| Architecture | `documents/docs/architecture/service-layer-map.md` | markdown | BE | read | Confirms current service-layer patterns. |
| Architecture | `documents/docs/architecture/repository-db-map.md` | markdown | BE / DB | read | Confirms V4 table reuse and no current traceability read model. |
| Write-side service | `src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | java | BE | read | Existing collector writes traceability links. |
| Write-side adapter | `src/main/java/com/sdd/platform/infrastructure/persistence/adapter/GitPrMetadataCollectorJdbcAdapter.java` | java | BE | read | Existing `tbl_fact_traceability_link` upsert. |
| Write-side controller | `src/main/java/com/sdd/platform/web/rest/GitPrMetadataCollectorController.java` | java | BE | read | Controller style reference. |
| DB schema | `src/main/resources/db/migration/V4__init_shema_v2.sql` | sql | DB | read | Active `tbl_` schema for read model. |
| FE app shell | `src/App.tsx` | tsx | FE | read | Route registration pattern. |
| FE API client | `src/lib/api.ts` | ts | FE | read | Existing API helper and contract style. |
| FE traceability route | `/traceability` | route | FE | missing | Must be added if view is implemented. |
| Traceability test | `src/test/**` and `src/__ tests __/**` | test | BE / FE | partial | General controller and page test patterns exist, but traceability-specific tests do not. |

## Important Files

- `src/main/resources/db/migration/V4__init_shema_v2.sql`
- `src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java`
- `src/main/java/com/sdd/platform/infrastructure/persistence/adapter/GitPrMetadataCollectorJdbcAdapter.java`
- `src/App.tsx`
- `src/lib/api.ts`
- `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/spec-pack.md`
- `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/raw/requirement.md`
- `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/raw/database_design.md`
- `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/raw/wireframe.md`

## Generated / Excluded Files

- Generated file expected: `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/impact-analysis.md`
- Generated file expected: `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/impl-plan.md`
- Generated file expected: `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/source-availability.md`
- Generated file expected: `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/source-inventory.md`
- Excluded from this phase: runtime data, secrets, build artifacts, and production-only config.

## Missing Files

- No traceability read controller or service exists yet.
- No FE traceability page or route exists yet.
- No traceability-specific unit or integration test exists yet.
