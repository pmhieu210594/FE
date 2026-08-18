# Source Inventory

**Ticket ID**: ARTIFACT-SCANNER     
**Create date**: 2026-06-16    
**Author**: nk_trung    
**Update date**: 2026-06-16  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket spec | `docs/changes/ARTIFACT-SCANNER/spec-pack.md` | document | Ticket owner | read | The single source of truth for AC/scope |
| Ticket context | `docs/changes/ARTIFACT-SCANNER/context.md` | document | Ticket owner | read | Actual implementation context |
| Ticket rules | `docs/changes/ARTIFACT-SCANNER/ticket-rules.md` | document | Ticket owner | read | Ticket-local rules |
| DB schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | sql | BE/DB | read | The only DB source allowed to be used |
| Current legacy scanner | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/gitlocal/GitLocalConnector.java` | java | BE | read | Used only to understand the as-is state, not as the new baseline |
| Current parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | java | BE | read | Used to define the parser boundary |
| Current Admin API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | java | BE | read | Reference for endpoint patterns |
| Connector orchestration | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/collection/*` | java | BE | partial | Needs further comparison during detailed implementation |
| Legacy persistence | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/*` | java | BE | partial | Used only to review adapter patterns, not directly as the baseline |
| Legacy mappers | `EDCAP_BE/src/main/resources/mapper/ArtifactMapper.xml` | xml | BE | read | Legacy, out of scope for the new design |
| Legacy mappers | `EDCAP_BE/src/main/resources/mapper/ConnectorRunMapper.xml` | xml | BE | read | Reference for the current run history |
| Current client page | `EDCAP_FE/src/pages/AdminPage.tsx` | tsx | client | read | Reference for the run connector UI/flow for manual testing |
| Current client route | `EDCAP_FE/src/router.tsx` | tsx | client | read | Route/menu placement |
| Client layout/menu | `EDCAP_FE/src/components/Layout.tsx` | tsx | client | read | Check admin/test menu placement |
| Client API helper | `EDCAP_FE/src/lib/api.ts` | ts | client | read | Typed endpoint pattern |
| Client tests | `EDCAP_FE/src/__ tests __/pages/AdminPage.test.tsx` | test | client | partial | Reference for the page test pattern |
| Architecture map | `docs/architecture/repository-db-map.md` | document | Architecture | read | Cross-check repository-to-DB mapping |
| Architecture map | `docs/architecture/route-api-map.md` | document | Architecture | read | Cross-check route-to-API mapping |
| Architecture map | `docs/architecture/source-inventory.md` | document | Architecture | read | Source context |
| Standards | `docs/standards/database.md` | document | Standards | read | Migration/view/index conventions |
| Standards | `docs/standards/backend.md` | document | Standards | read | Layering/backend conventions |
| Standards | `docs/standards/frontend.md` | document | Standards | read | Client placement/patterns |
| Standards | `docs/standards/logging.md` | document | Standards | read | Logging policy |
| Standards | `docs/standards/testing.md` | document | Standards | read | Testing policy |
| Rules | `.claude/rules/20-architecture.md` | document | Rules | read | Architecture boundary |
| Rules | `.claude/rules/30-security.md` | document | Rules | read | Security/privacy |
| Rules | `.claude/rules/40-testing.md` | document | Rules | read | Testing rules |

## Important Files

### Direct implementation targets
- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` or the next migration on the same V4 path
- New BE scanner service/use case for Artifact Scanner
- New BE persistence adapter/queries for `tbl_connector_run`, `tbl_fact_artifact_snapshot`, `vw_artifact_inventory_current`
- New or extended BE REST endpoints for scanner run/result
- Client typed endpoints in `EDCAP_FE/src/lib/api.ts`
- Client page/component for the manual test view

### Important read-only references
- `artifact-scanner-spec-pack.md`
- `artifact-scanner-context.md`
- `artifact-scanner-ticket-rules.md`
- `GitLocalConnector.java`
- `ArtifactNormalizer.java`
- `AdminController.java`
- `AdminPage.tsx`

## Generated / Excluded Files

### Generated / build outputs
- `EDCAP_BE/target/**`
- `EDCAP_FE/dist/**`
- `EDCAP_FE/coverage/**`
- `EDCAP_FE/node_modules/**`

### Excluded from implementation scope
- Legacy schema/mappers from migrations before V4 when used as the new baseline
- `.claude/*` scanner logic
- Git/PR/CI collector code outside the Artifact Scanner boundary
- KPI/traceability modules
- Parser section extraction logic

## Missing Files

- There is not yet a new source file for `ArtifactScannerService`, the scanner-specific repository adapter, or the scanner-specific manual test page; these files are expected to be created during the implementation phase.
- There is not yet a separate scanner-specific API DTO/endpoint file; a new controller should be created or the existing controller should be extended.
- `vw_artifact_inventory_current` does not exist yet; this view must be created in a migration.