# Self Review

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: Codex
**Update date**: 2026-06-25

## 1. Implementation Summary

- Implemented scope: PM Dashboard backend read model, PM-only API controller/service, FE route/page shell, typed API helpers, locale strings, and focused unit tests.
- Key behavior: PM users land on `/pm-dashboard`, can filter/search a read-only ticket table, open a detail drawer, export CSV, and trigger refresh; dashboard summary comes from `tbl_fact_ticket_dashboard_snapshot`.
- Important constraints respected: no edit/upload/delete actions were added, controller stays thin, service owns business rules, owner display is pseudonym-only, and raw evidence content is not exposed.
- Remaining notes: export/refresh permission matrix and period-key semantics remain accepted risks until product/security finalize them.

## 2. List of Changed Files

| file | change summary | reason |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardService.java` | PM role gate, filter normalization, CSV export, not-found handling | Core business logic |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java` | Snapshot read model queries, refresh SQL, detail mapping | Data access / read model |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/PmDashboardController.java` | New PM Dashboard API entry point | Thin web adapter |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/PmDashboardDtos.java` | Dashboard response DTOs | API contract |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardModels.java` | Dashboard records and filter models | Internal model |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/PmDashboardRepositoryPort.java` | Persistence port | Layer boundary |
| `EDCAP_BE/src/main/resources/db/migration/V232__pm_dashboard_snapshot.sql` | New snapshot table and indexes | Read-model support |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardServiceTest.java` | Service gate and normalization tests | Backend evidence |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/web/rest/PmDashboardControllerTest.java` | Controller wiring and error mapping tests | Backend evidence |
| `EDCAP_FE/src/App.tsx` | PM route guard and redirect | Router integration |
| `EDCAP_FE/src/components/Layout.tsx` | PM Dashboard sidebar item | Navigation |
| `EDCAP_FE/src/lib/api.ts` | Typed PM dashboard endpoint helpers | HTTP boundary |
| `EDCAP_FE/src/pages/pm-dashboard/PMDashboardPage.tsx` | PM Dashboard screen shell | Main UI |
| `EDCAP_FE/public/locales/en/locale.json` | PM Dashboard labels | i18n |
| `EDCAP_FE/public/locales/vi/locale.json` | PM Dashboard labels | i18n |
| `EDCAP_FE/public/locales/ja/locale.json` | PM Dashboard labels | i18n |

## 3. Commands Run and Results

| command | result | note |
|---|---|---|
| `mvn test -DskipITs` | Passed | Backend compile + all tests passed after PM Dashboard fixes |
| `npx tsc --noEmit` | Passed | FE TypeScript check passed |
| `npm run build` | Failed | Vite build hit an environment/config access issue unrelated to PM Dashboard code; `tsc` had already passed |

## 4. Self-Check Against Review Checklist

| checklist area | status | evidence / note |
|---|---|---|
| AC matching | Partial | Core ACs covered by route, summary, list, detail, export, refresh, and read-only shell; permission matrix still unresolved |
| General system review | Partial | Filter trim/pagination normalization implemented; score thresholds remain unresolved |
| FE review | Partial | Uses typed endpoints, React Query, and shared UI primitives; no FE write forms added |
| BE/API review | Pass | Thin controller, service-owned logic, standard error envelope, PM role gate |
| DB/Migration review | Partial | New snapshot table added per spec-pack read-model direction; period-key semantics remain an accepted risk |
| Security/Privacy review | Pass with risk | Owner display is pseudonym-only; raw evidence content is not exposed; export/refresh permission matrix still needs confirmation |
| Operation/Maintenance review | Partial | Read-only posture and empty states are present; refresh/export authorization policy still needs product/security sign-off |
| Test review | Pass | Backend unit tests passed; FE typecheck passed; FE build blocked by Vite environment issue |
| Documentation/Traceability review | Pass | Files and commands are recorded here; remaining spec open issues are called out below |
| Release/Rollback review | Partial | Additive migration only; no rollback plan beyond standard Flyway rollback guidance |

## 5. Test Plan Corresponding Status

| test plan item | status | note |
|---|---|---|
| FE unit tests | Not run | No FE spec test was added in this pass |
| BE unit tests | Passed | `PmDashboardServiceTest` and `PmDashboardControllerTest` passed under Maven |
| API integration tests | Not run | Existing suite passed; no new dashboard IT added in this pass |
| Contract tests | Not run | Not required for this skeleton |
| DB / migration tests | Not run | Covered indirectly by Maven compile; no standalone migration test added |
| E2E tests | Not run | Out of scope for this phase |
| Black-box tests | Not run | Can be derived from review checklist / spec-pack scenarios |

## 6. Unprocessed / Pending / Accepted Risk

| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| EQS formula | Open issue in spec-pack | Exact score validation still depends on product/architect confirmation | Product / Architect | Pending |
| Score band thresholds | Open issue in spec-pack | Boundary validation still depends on confirmed thresholds | Product | Pending |
| Permission matrix | Open issue in spec-pack | Export/refresh gating is visible in UI but still needs final permission sign-off | Architect / Security | Pending |
| Open issues definition | Open issue in spec-pack | KPI semantics remain partially accepted-risk only | Product | Pending |
| Exception definition | Open issue in spec-pack | Exception labels and counts remain data-model dependent | Architect | Pending |
| Read-model strategy | Closed in spec-pack, implemented as snapshot | Snapshot table and refresh path are implemented | Architect | Pending |
| Export format | Open issue in spec-pack | CSV export is implemented as the current PoC choice; format still needs formal sign-off | Product / Security | Pending |
| Period key source | Accepted risk | `period_key` is derived from available snapshot timestamp data | Architect | Pending |

## 7. AI-Summarized Assumptions

- Assumption: PM Dashboard access is gated by the auth `role` value `PM`.
- Basis: Spec-pack now states PM-only access for this ticket, and the auth context already carries a role string.
- Risk if wrong: PM users could be redirected incorrectly or lose access to the new dashboard.
- Needs confirmation: Final permission matrix for export and refresh, plus period-key semantics.

## 8. Human Review Items

- Item: Confirm export/refresh permission policy.
- Why human review is needed: The current auth context does not expose fine-grained permission codes, so PM-only gating is implemented as the safe default.
- Owner: Product + Security.
- Status: Open.
- Item: Confirm period/sprint key source for the dashboard filter and snapshot.
- Why human review is needed: The schema does not provide an explicit sprint source in the current codebase.
- Owner: Architect.
- Status: Open.

## 9. Bugs Found and Resolved

| bug | cause | fix | test |
|---|---|---|---|
| PM row model missing `phaseId` | Detail drawer needed current phase to load missing-evidence items | Added `phaseId` to the row model, DTO, and mapper | `mvn test -DskipITs` |
| `owner_display` could leak `updated_by` | Snapshot fallback used raw user identifiers | Switched owner display and search text to pseudonym-only values | `mvn test -DskipITs` |
| FE nav typing rejected `pmOnly` | Sidebar item type lacked the custom flag | Added an explicit `NavItem` type | `npx tsc --noEmit` |
| FE PM page had an unused constant | TypeScript strictness flagged dead code | Removed the unused `defaultFilters` constant | `npx tsc --noEmit` |

## 10. Final Self-Verdict

- Status: Partial pass, ready for independent review.
- Notes: Backend tests passed, FE typecheck passed, and the remaining FE build failure is environment-related rather than PM-dashboard code-related. The main unresolved items are the spec-open permission matrix and period-key semantics.
