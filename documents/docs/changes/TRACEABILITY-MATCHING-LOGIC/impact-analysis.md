# Impact Analysis

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC  
**Create date**: 2026-06-23  
**Author**: OpenAI  
**Update date**: 2026-06-23  

## 1. Change Content

- Add a read-only traceability view that links Ticket, Artifact, PR, Commit, CI, Test, and Report evidence.
- Add a BE read model for traceability completeness, broken-link detection, and chronological timeline rendering.
- Add a FE route and page for `/traceability` that consumes the new read API.
- Reuse the existing `tbl_` schema, especially `tbl_fact_traceability_link`, `tbl_fact_artifact_snapshot`, `tbl_fact_pull_request`, `tbl_fact_ci_run`, `tbl_fact_evidence_event`, and `tbl_dim_ticket`.
- Keep write-side collector behavior intact and idempotent.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `src/main/java/com/sdd/platform/web/rest/TraceabilityController.java` | New read-only endpoint | add |
| `src/main/java/com/sdd/platform/application/usecase/traceability/TraceabilityService.java` | New read orchestration and business rules | add |
| `src/main/java/com/sdd/platform/infrastructure/persistence/adapter/TraceabilityJdbcAdapter.java` | New query adapter over existing `tbl_` tables | add |
| `src/main/java/com/sdd/platform/web/dto/TraceabilityDtos.java` | New request/response DTOs | add |
| `src/main/java/com/sdd/platform/application/usecase/traceability/TraceabilityModels.java` | New view model / calculator models | add |
| `src/main/java/com/sdd/platform/config/SecurityConfig.java` | May need route permission update for read access | modify if access differs |
| `src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | May need stable error mapping for new endpoint | modify if new error code is required |
| `src/main/java/com/sdd/platform/config/TraceIdFilter.java` | May need trace logging fields for the new endpoint | verify only |
| `src/App.tsx` | Add `/traceability` route | add |
| `src/lib/api.ts` | Add typed endpoint helper | add |
| `src/pages/traceability/TraceabilityPage.tsx` | New screen implementation | add |
| `src/pages/traceability/components/*` | New UI composition | add |
| `src/__ tests __/**` and `src/test/**` | Add/extend BE and FE tests | add |
| `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/test-plan.md` | Align tests to AC | modify if needed |
| `documents/docs/changes/TRACEABILITY-MATCHING-LOGIC/review-checklist.md` | Review checklist alignment | modify if needed |

## 3. Indirectly Affected Files
| file | reason | risk |
|---|---|---|
| `src/main/resources/db/migration/V4__init_shema_v2.sql` | Read model depends on active schema columns | low, verify-only |
| `src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | Source of truth for link semantics | low, should remain unchanged |
| `src/main/java/com/sdd/platform/infrastructure/persistence/adapter/GitPrMetadataCollectorJdbcAdapter.java` | Existing upsert semantics influence read interpretation | low |
| `src/main/java/com/sdd/platform/web/rest/GitPrMetadataCollectorController.java` | Reference for controller shape and test style | low |
| `src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | Possible reuse for admin/read patterns | low |
| `src/lib/queryClient.ts` | FE data-fetch behavior may be reused | low |
| `src/components/Layout.tsx` | Navigation/menu placement for traceability entry point | low |
| `documents/docs/architecture/route-api-map.md` | Must be updated if traceability route becomes real | low |
| `documents/docs/architecture/service-layer-map.md` | Must be updated if new service lands | low |
| `documents/docs/architecture/repository-db-map.md` | Must be updated if new query adapter lands | low |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| FE Traceability page | FE API client | consumes new read helper |
| FE API client | BE traceability controller | new GET contract |
| BE controller | BE traceability service | orchestrates view assembly |
| BE traceability service | traceability JDBC adapter | reads existing tables only |
| traceability service | completeness calculator | produces score and visible gaps |
| traceability service | broken-link classifier | produces severity and reason |
| traceability service | timeline assembler | produces ordered evidence list |
| write-side collector | existing traceability upsert path | should remain unchanged |

## 5. FE Impact

- Add a new route for `/traceability` and expose it through the existing layout/navigation pattern.
- Add a dedicated page for traceability summary, timeline, and broken-link tabs or sections.
- Add typed client methods and response types in `src/lib/api.ts`.
- Add FE states for loading, empty data, partial data, and read-only permissions.
- Ensure missing links render as visible warnings rather than crashes.

## 6. BE Impact

- Add a read-only service that queries existing tables and shapes the view model.
- Add completeness calculation that excludes commits from the completeness denominator, per ticket rule.
- Add broken-link detection for missing artifact, PR, CI, and report evidence.
- Add deterministic timeline ordering using existing event data and stable sort keys.
- Keep the write-side collector untouched except for read model reuse of link semantics.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `GET /api/v1/traceability/{ticketId}` | New path and optional filter params if needed | New traceability view DTO with links, completeness, broken links, timeline | yes, additive |
| `GET /api/v1/traceability/{ticketId}/timeline` | optional, if split endpoint is chosen | timeline-only DTO | yes, additive |
| `GET /api/v1/traceability/{ticketId}/broken-links` | optional, if split endpoint is chosen | broken-link-only DTO | yes, additive |

## 8. DTO / Schema / Validation Impact

- Add request validation for `ticketId` as a required UUID/path variable.
- Add response DTOs for traceability summary, link items, completeness, broken links, and timeline events.
- Add enums or string unions for confidence and severity, restricted to approved values only.
- Reuse existing schema columns from `tbl_fact_traceability_link`, `tbl_fact_artifact_snapshot`, `tbl_fact_pull_request`, `tbl_fact_ci_run`, `tbl_fact_evidence_event`, and `tbl_dim_ticket`.
- Do not add new DB schema objects unless a missing source column is confirmed by implementation review.

## 9. DB / Migration Impact

- No new table is expected.
- No migration is expected for the current phase.
- Read queries should join the existing `tbl_` tables only.
- If a missing column or index blocks the query shape, stop and confirm before adding migration work.

## 10. Batch / Job / Event Impact

- No new batch or scheduled job is required for the read-only traceability view.
- Existing evidence events remain the source for timeline display if present.
- Existing write-side collector jobs remain the producer of traceability link rows.
- No new queue or async event pipeline is in scope for this ticket.

## 11. Test Impact

- Add BE unit tests for completeness math, missing-link classification, and timeline ordering.
- Add BE controller tests for the new read endpoint and permission behavior.
- Add BE integration tests that verify queries against existing `tbl_` tables.
- Add FE tests for route rendering, loading, empty state, and broken-link visibility.
- Add regression coverage to ensure write-side collector tests still pass unchanged.

## 12. Operation / Monitoring Impact

- Ensure the new endpoint logs `traceId`, `ticketId`, and request scope only.
- Keep logs free of raw payloads, source code blobs, tokens, secrets, and PII.
- If an endpoint is added, include it in existing access/error monitoring and trace correlation.
- Confirm read latency stays within the spec target of under 2 seconds where practical.

## 13. Rollout / Rollback Impact

- Rollout can be done code-first because no schema migration is expected.
- FE and BE can be deployed together or behind a feature flag if the app supports that pattern.
- Rollback is code-only: remove the new read API, service, DTOs, FE route, and UI.
- Since the write-side collector is unchanged, rollback should not disturb existing ingestion.

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| DB table creation | unaffected | spec-pack and raw database design both say reuse existing tables only. |
| Write-side traceability upsert | unaffected | `GitPrMetadataCollectorService` and `GitPrMetadataCollectorJdbcAdapter` already own the write path. |
| Artifact parser pipeline | unaffected | current scope is read-only traceability view, not parser redesign. |
| PR ingestion and CI ingestion write logic | unaffected | existing ingestion is already in scope as source data, not to be rewritten. |
| Manual graph editing | unaffected | explicitly out of scope in spec, requirement, and ticket rules. |
| Auto repair / AI root-cause / cross-project graph | unaffected | explicitly out of scope. |
| Existing admin features for organization/team/project/customer/role | unaffected | no dependency in traceability scope. |

## 15. Required Options

- Reuse existing `tbl_` tables only.
- Keep the view read-only.
- Preserve missing links in the response.
- Exclude commits from completeness, but still display them.
- Use approved confidence values only: `HIGH`, `MEDIUM`, `LOW`.
- Use approved broken-link severity only: `ERROR`, `WARNING`.

## 16. Human Decision Required

| id | decision item | reason | owner | status |
|---|---|---|---|---|
| H-TRACEABILITY-MATCHING-LOGIC-1 | One Ticket = One PR | MVP simplification already approved in spec | User | Approved |
| H-TRACEABILITY-MATCHING-LOGIC-2 | Commit excluded from completeness | Business rule already approved in spec | User | Approved |
| H-TRACEABILITY-MATCHING-LOGIC-3 | Broken link severity uses ERROR/WARNING | Business rule already approved in spec | User | Approved |
| H-TRACEABILITY-MATCHING-LOGIC-4 | Final traceability read API path and response split | Needed before code to avoid contract drift | User | Pending |
| H-TRACEABILITY-MATCHING-LOGIC-5 | Final access role mapping for traceability view | Needed before FE and security wiring | User | Pending |

## 17. Risk Summary

- Highest risk: inventing a read API contract that later conflicts with FE or security expectations.
- Medium risk: completeness math drifting from the approved assumption set.
- Medium risk: query shape needing extra columns or indexes not yet confirmed.
- Low risk: write-side collector regression if we keep read concerns isolated.
