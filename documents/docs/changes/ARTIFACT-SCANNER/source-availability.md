# Source Availability

**Ticket ID**: ARTIFACT-SCANNER   
**Create date**: 2026-06-16    
**Author**: nk_trung  
**Update date**: 2026-06-16    

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Latest source | `docs/changes/ARTIFACT-SCANNER/spec-pack.md` | read | high | Ticket owner | Basis for the scanner AC, scope, and boundary | implementation may drift if the spec is older than the real source | always-read |
| Ticket context | `docs/changes/ARTIFACT-SCANNER/context.md` | read | high | Ticket owner | Identify the actual source/files/routes/tables related to the ticket | may miss newly added files after Phase 2 | always-read |
| Ticket rules | `docs/changes/ARTIFACT-SCANNER/ticket-rules.md` | read | high | Ticket owner | Implementation constraints for the ticket | skipping this can easily mix the scanner scope with the parser | always-read |
| DB definition | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | high | BE / DB | Basis for SQL, repository, migration, and view | conflict with newer migrations on the actual branch must be checked | required-if-db |
| Current BE source | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/gitlocal/GitLocalConnector.java` | read | medium | BE | Understand the as-is state and the legacy area to avoid reusing directly | mixes scanner + parser + legacy persistence | verify-with-source |
| Current BE source | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | read | medium | BE | Identify the parser boundary so it is not pulled into the scanner | scope can easily be mixed if misunderstood | verify-with-source |
| Current BE source | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | read | medium | BE | Review the existing admin/run history endpoint pattern | final placement may need to change when adding the Data Ops view | verify-with-source |
| Current BE persistence | `EDCAP_BE/src/main/resources/mapper/ArtifactMapper.xml` | read | medium | BE | Identify the legacy tables currently in use to avoid reusing them as the new baseline | legacy drift | verify-with-source |
| Current BE persistence | `EDCAP_BE/src/main/resources/mapper/ConnectorRunMapper.xml` | read | medium | BE | Understand the existing run history pattern | may not map correctly to V4 | verify-with-source |
| Current client source | `EDCAP_FE/src/pages/AdminPage.tsx` | read | medium | client | Reference the run connector and run history pattern for manual testing | final UI placement for the scanner does not necessarily reuse it as-is | verify-with-source |
| Current client source | `EDCAP_FE/src/lib/api.ts` | read | medium | client | Reference the typed endpoint helper pattern | no dedicated scanner endpoint exists yet | verify-with-source |
| Current client source | `EDCAP_FE/src/components/Layout.tsx` | read | medium | client | Identify admin menu/placement and the possibility of placing the test view | route/menu may need adjustment | verify-with-source |
| Architecture docs | `docs/architecture/repository-db-map.md` | read | medium | Architecture | Compare the source against the DB and repository mapping | may not reflect the latest ticket | verify-with-source |
| Architecture docs | `docs/architecture/route-api-map.md` | read | medium | Architecture | Compare client routes with the API | may be missing the new scanner route | verify-with-source |
| Architecture docs | `docs/architecture/source-inventory.md` | read | medium | Architecture | Build the source inventory for impact analysis | may be stale | verify-with-source |
| Standards | `docs/standards/database.md` | read | high | Standards owner | Migration/view/index constraints | skipping this can drift from convention | always-read |
| Standards | `docs/standards/backend.md` | read | high | Standards owner | Package/service/adapter constraints | skipping this can drift from system style | always-read |
| Standards | `docs/standards/frontend.md` | read | high | Standards owner | Route/page/API helper constraints for client/manual testing | skipping this can drift from the current pattern | always-read |
| Standards | `docs/standards/logging.md` | read | high | Standards owner | Logging/audit/trace policy | scanner operational logs may be insufficient | always-read |
| Standards | `docs/standards/testing.md` | read | high | Standards owner | Test strategy for implementation steps | missing test evidence | always-read |
| Internal rule | `.claude/rules/20-architecture.md` | read | high | Rule owner | Architecture boundary / layering | skipping this can easily cross the parser boundary | always-read |
| Internal rule | `.claude/rules/30-security.md` | read | high | Rule owner | Metadata-only, no full content persistence, secret hygiene | security/privacy risk | always-read |
| Internal rule | `.claude/rules/40-testing.md` | read | high | Rule owner | Constraints on test evidence | missing implementation-step coverage | always-read |
| API spec | No scanner-specific API spec yet | partial | medium | BE/client | Basis for the manual test view contract | contract is not final | verify-with-source |
| Original Excel/PPT/PDF | None | unavailable | low | N/A | Not a main source for this ticket | not applicable | not-read |
| External web/repo | Not used | not-read | low | N/A | Internal ticket, no external source needed | injection/outdated | not-read |

## Summary

The required sources for moving into Phase 3 are available at the necessary level. `spec-pack.md`, `context.md`, `ticket-rules.md`, and `V4__init_shema_v2.sql` are the authoritative source group for the implementation plan. Existing BE/client sources are mainly used to identify the as-is state, the legacy areas to avoid, and the insertion points for the new functionality. There is no scanner-specific API spec yet, but the current endpoint/admin run history pattern is sufficient to create a Phase 3 implementation plan.

## Unavailable / Partial Sources

- There is no dedicated API spec for the Artifact Scanner yet; it must be derived from the existing pattern and finalized in the implementation plan.
- There is no dedicated page in the current client yet; placement will be based on the existing route/menu and may need to be extended if truly necessary.
- There is no new source for the V4-only scanner yet; most of the current source is still legacy-oriented.

## Risk Before Implementation

- If `GitLocalConnector` or `ArtifactMapper.xml` is reused directly as the new baseline, scanner and parser responsibilities will be mixed and the V4-only requirement will be violated.
- If the actual client route/menu does not have a suitable place for the test view, the plan may need slight adjustment before implementation.
- If a newer migration on the actual branch has already changed `tbl_fact_artifact_snapshot`, it must be rechecked before adding columns and the view.

## Required Human Decision

- There are no remaining major architectural blockers in Phase 3. The main decisions were already finalized in Phase 1/2.
- Final confirmation is needed during actual implementation: whether the scanner test view should be placed under the existing Admin area or separated into a Data Ops sub-item when the route/menu is extended.