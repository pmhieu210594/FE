# Implementation Plan

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC  
**Create date**: 2026-06-23  
**Author**: OpenAI  
**Update date**: 2026-06-23  

## 1. Implementation Principle

Build a read-only traceability view on top of existing persisted facts. Keep the read model isolated from the write-side collector. Reuse the current `tbl_` tables only, and do not introduce a new persistence model unless a confirmed source gap appears.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Add a dedicated traceability query service and controller over existing tables | Clear separation, read-only by design, easy to test | Requires new service/controller/DTO work | Selected |
| B | Reuse the write-side collector service as the read API | Less code initially | Mixes read/write concerns and creates security risk | Rejected |
| C | Add a new traceability aggregate table | Faster reads in some cases | Conflicts with current reuse rule and needs migration | Rejected |

## 3. Reason for Choosing the Alternative Plan

Option A is the safest fit for this ticket. It respects the read-only requirement, preserves the existing ingestion flow, and avoids schema expansion. It also lets us verify each layer independently.

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/source-availability.md` | Source readiness and gaps | Phase 3 planning artifact | All |
| `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/source-inventory.md` | Inventory of relevant files and missing pieces | Phase 3 planning artifact | All |
| `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/impact-analysis.md` | Scope and impact analysis | Phase 3 planning artifact | All |
| `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/impl-plan.md` | Implementation sequence and stop conditions | Phase 3 planning artifact | All |
| `src/main/java/com/sdd/platform/application/usecase/traceability/*` | New traceability read service and models | Read model assembly | AC-1..10 |
| `src/main/java/com/sdd/platform/infrastructure/persistence/adapter/TraceabilityJdbcAdapter.java` | Query adapter over existing tables | Data retrieval | AC-1..10 |
| `src/main/java/com/sdd/platform/web/rest/TraceabilityController.java` | Read-only controller | API exposure | AC-1..10 |
| `src/main/java/com/sdd/platform/web/dto/TraceabilityDtos.java` | Request/response DTOs | API contract | AC-1..10 |
| `src/App.tsx` | Add `/traceability` route | FE navigation | AC-1..10 |
| `src/lib/api.ts` | Add typed traceability endpoint helper | FE contract | AC-1..10 |
| `src/pages/traceability/*` | Traceability screen | FE rendering | AC-1..10 |
| `src/test/**` and `src/__ tests __/**` | BE and FE tests | Regression safety | AC-1..10 |

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| `TraceabilityController` | add | `ticketId` and optional filters | read-only traceability response | Must not expose edits. |
| `TraceabilityService` | add | `ticketId` | traceability view model | Owns completeness and broken-link rules. |
| `TraceabilityJdbcAdapter` | add | `ticketId` | joined traceability records | Uses existing `tbl_` tables only. |
| completeness calculator | add | counts of found vs expected evidence | percentage | Commits are displayed but not counted. |
| broken-link classifier | add | missing artifact/PR/CI/report | severity and reason | Use `ERROR` / `WARNING` only. |
| timeline assembler | add | evidence events | ordered timeline | Ordering must be deterministic. |

## 6. SQL / Query / Repository Policy

- Use read-only queries against `tbl_fact_traceability_link`, `tbl_fact_artifact_snapshot`, `tbl_fact_pull_request`, `tbl_fact_ci_run`, `tbl_fact_evidence_event`, and `tbl_dim_ticket`.
- Keep joins explicit and local to the traceability adapter.
- Prefer persisted facts over inferred UI data whenever both exist.
- Do not add a new table unless a confirmed source gap is documented first.
- Keep write-side upserts untouched.

## 7. Validation / Error / Logging Policy

- Validate that the ticket exists before returning a traceability view.
- Treat missing evidence as a visible broken link, not as an internal server failure.
- Preserve partial data if some evidence is missing.
- Log only `traceId`, `ticketId`, and the request scope.
- Never log raw markdown, raw webhook payloads, tokens, secrets, or source code.

## 8. Migration / Rollback Policy

- No schema migration is expected for this phase.
- If a missing column or index is discovered, stop and document the gap before adding any migration.
- Rollback is code and docs only because the design reuses existing tables.

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Confirm source-backed boundaries and open decisions | docs + source tree | Every table, method, and route referenced is confirmed | Any guessed endpoint or method appears |
| 2 | Define the traceability read model | new service / DTO design | Completeness, broken links, and timeline rules are explicit | Completeness math is ambiguous |
| 3 | Implement the persistence adapter | `TraceabilityJdbcAdapter` | Queries return complete and incomplete tickets correctly | A new table is needed unexpectedly |
| 4 | Implement the controller and FE contract | controller + `src/lib/api.ts` | API is read-only and matches FE usage | Endpoint allows writes or edits |
| 5 | Implement the FE page | `src/pages/traceability/*` | Page renders summary, timeline, and broken links | Missing links can crash the UI |
| 6 | Add tests | BE and FE test files | Success, missing evidence, and permission cases pass | AC coverage cannot be demonstrated |
| 7 | Update docs and review artifacts | ticket docs | Phase documents match code intent | Docs diverge from the plan |

## 10. How to Verify Each Step

- Step 1: cross-check every referenced method and table against the source tree and architecture docs.
- Step 2: review the read model against `spec-pack.md`, `raw/requirement.md`, and `raw/database_design.md`.
- Step 3: verify SQL returns stable rows for complete and broken traceability cases.
- Step 4: verify the API shape is read-only and permissioned correctly.
- Step 5: verify the FE page loads, handles empty data, and shows missing links visibly.
- Step 6: run targeted unit, integration, and FE tests.
- Step 7: confirm all docs preserve the same AC mapping and scope limits.

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-TRACEABILITY-MATCHING-LOGIC-1 | Artifact links are loaded into the read model | API / integration test |
| AC-TRACEABILITY-MATCHING-LOGIC-2 | PR links are loaded into the read model | API / integration test |
| AC-TRACEABILITY-MATCHING-LOGIC-3 | Commit links are displayed but excluded from completeness | unit test |
| AC-TRACEABILITY-MATCHING-LOGIC-4 | CI links are loaded into the read model | API / integration test |
| AC-TRACEABILITY-MATCHING-LOGIC-5 | Completeness calculator returns a stable percentage | unit test |
| AC-TRACEABILITY-MATCHING-LOGIC-6 | Broken links are surfaced visibly | black-box / UI test |
| AC-TRACEABILITY-MATCHING-LOGIC-7 | Timeline ordering is deterministic | unit / API test |
| AC-TRACEABILITY-MATCHING-LOGIC-8 | Existing `tbl_` tables are reused | review / integration test |
| AC-TRACEABILITY-MATCHING-LOGIC-9 | Confidence values are persisted and displayed | unit / API test |
| AC-TRACEABILITY-MATCHING-LOGIC-10 | No edit actions are exposed | black-box / permission test |

## 12. Stop / Ask Condition

- If a required read method does not exist and cannot be derived from the current source tree, stop and confirm before coding.
- If the traceability view would require schema expansion, stop and re-check the reuse rule.
- If the exact FE route or response shape is unclear, stop and add the missing contract to the implementation plan first.
- If access roles conflict with the read-only screen intent, stop and confirm the permission model.

## 13. Do Not Do This Ticket

- Do not add manual graph editing.
- Do not add auto repair.
- Do not add AI root cause analysis.
- Do not add cross-project dependency graph logic.
- Do not invent method names or endpoint paths.
- Do not count commits in completeness.
- Do not use raw payloads or markdown as the primary source of truth.

## 14. Open Related Issues

| issue | impact | note |
|---|---|---|
| Future configurable completeness rules | medium | Keep the calculator isolated so rule changes stay localized. |
| Future multi-PR support | medium | Keep the read model extensible, but do not implement it now. |
| Exact FE contract | medium | Must be confirmed before coding the controller and page. |
