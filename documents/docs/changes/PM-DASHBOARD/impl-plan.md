# Implementation Plan

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: Codex
**Update date**: 2026-06-25

## 1. Implementation Principle

- Keep the dashboard read-only and operational.
- Do not guess unresolved business decisions.
- Reuse existing FE and BE patterns instead of creating a parallel design.
- Prefer small, typed contracts over ad-hoc payloads.
- Keep FE HTTP access inside `EDCAP_FE/src/lib/api.ts`.
- Keep BE controllers thin and service logic in application use cases.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Read PM Dashboard directly from existing V4 fact/dim tables | No new migration, less schema risk, easier to keep aligned with source of truth | Needs a clear query strategy and may be slower if not shaped well | Pending open issues |
| B | Add a precomputed PM Dashboard snapshot table and refresh path | Faster list rendering and simpler FE payloads | Adds migration and refresh complexity; current design decision is not confirmed | Not selected yet |

## 3. Reason for Choosing the Alternative Plan

- This ticket is still in planning, so the safe default is to avoid committing to new schema until the read-model decision is confirmed.
- The current source already contains the main evidence facts, so direct reads remain a viable fallback for a PoC.
- If later decisions require a snapshot table, the plan can be revised without changing the current Phase 2 skeleton.

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_FE/src/pages/pm-dashboard/PMDashboardPage.tsx` | New dashboard page | Main UI surface | AC-PM-DASHBOARD-1 to 13 |
| `EDCAP_FE/src/lib/api.ts` | Add PM dashboard endpoints | Typed HTTP boundary | AC-PM-DASHBOARD-1 to 12 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/PmDashboardController.java` | New controller | API entry point | AC-PM-DASHBOARD-1 to 12 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardService.java` | New application service | Business logic and read model orchestration | AC-PM-DASHBOARD-1 to 12 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/PmDashboardDtos.java` | New DTOs | Contract mapping | AC-PM-DASHBOARD-1 to 12 |
| `EDCAP_BE/src/test/...` | New tests | Contract and behavior coverage | All ACs |

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| PM dashboard page component | add | filter state, search text, user permissions | dashboard UI | FE later phase only |
| PM dashboard endpoint helpers | add | request params | typed DTOs | Keep in `lib/api.ts` |
| PM dashboard controller | add | current user, query params, ticket ID | dashboard DTOs | BE later phase only |
| PM dashboard service | add | normalized filters | summary/list/detail DTOs | No direct infrastructure calls from web |
| PM dashboard DTOs | add | domain/read model data | response payloads | Keep contract small and typed |
| PM dashboard tests | add | feature scenarios | pass/fail evidence | Must cover read-only and permission gates |

## 6. SQL / Query / Repository Policy

- Use only parameterized queries when the implementation phase starts.
- Never build SQL in the controller layer.
- Keep repository access behind application ports or existing mapper/service boundaries.
- Do not query a new snapshot table unless the ticket explicitly approves that table.
- If direct reads are used, document the table mapping and filter strategy before coding.

## 7. Validation / Error / Logging Policy

- Validation should trim strings and reject empty required values.
- Missing or invalid permissions should return the standard backend error shape.
- The dashboard must not leak raw evidence content or personal data.
- Log failures with traceId correlation.
- Keep error handling centralized; do not add ad-hoc error bodies.

## 8. Migration / Rollback Policy

- Phase 2 does not create migrations.
- If a later phase approves a snapshot table, use an additive Flyway migration only.
- Do not edit existing migrations in place.
- Rollback is not planned for Phase 2 artifacts; document any future additive migration risk separately.

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Confirm unresolved business rules from spec-pack | docs only | All open points listed | Stop if a guessed rule appears |
| 2 | Finalize contract shape for summary/list/detail | docs only | DTO plan is clear | Stop if endpoints remain ambiguous |
| 3 | Prepare FE page skeleton and endpoint helpers | future FE files | Query/search/filter pattern is defined | Stop if helper names are invented |
| 4 | Prepare BE controller/service skeleton | future BE files | Layering is clear | Stop if web imports infrastructure |
| 5 | Write tests for read-only and permission flows | future test files | Coverage matrix exists | Stop if contract is still open |

## 10. How to Verify Each Step

- Step 1: compare against `spec-pack.md` open issues.
- Step 2: ensure summary/list/detail fields match the spec and no extra personal fields are introduced.
- Step 3: check FE patterns against `ProjectPage.tsx`, `CustomerPage.tsx`, and `TraceabilityPage.tsx`.
- Step 4: check BE layering against `ProjectController.java` and `TraceabilityService.java`.
- Step 5: ensure tests cover load, filter, search, empty state, drawer, and permission gating.

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-PM-DASHBOARD-1 | Dashboard landing page visible | Page load test |
| AC-PM-DASHBOARD-2 | KPI area visible | Render test |
| AC-PM-DASHBOARD-3 | Filters applied | Filter behavior test |
| AC-PM-DASHBOARD-4 | Search works | Search behavior test |
| AC-PM-DASHBOARD-5 | Missing evidence shown | Data mapping test |
| AC-PM-DASHBOARD-6 | Risk badge shown | Data mapping test |
| AC-PM-DASHBOARD-7 | EQS and score band visible | Data mapping test |
| AC-PM-DASHBOARD-8 | EQS breakdown visible | Detail test |
| AC-PM-DASHBOARD-9 | Click opens drawer | Interaction test |
| AC-PM-DASHBOARD-10 | No personal ranking | UI review |
| AC-PM-DASHBOARD-11 | Export permission gate | Permission test |
| AC-PM-DASHBOARD-12 | Refresh permission gate | Permission test |
| AC-PM-DASHBOARD-13 | Read-only posture | UI and API review |

## 12. Stop / Ask Condition

- Any implementation step that requires unconfirmed score formula, permission matrix, open issues definition, exception semantics, or refresh strategy must stop and ask.

## 13. Do Not Do This Ticket

- Do not invent PM Dashboard runtime code in Phase 2.
- Do not add a new snapshot table just because it exists in `raw/database_design.md`.
- Do not use direct fetch in FE pages.
- Do not bypass backend error handling.
- Do not display personal names or rank people.

## 14. Open Related Issues

- EQS formula and score rule version.
- Score band threshold values.
- Required evidence list per phase.
- Waiting review definition.
- Exception definition.
- Permission matrix for view/export/refresh.
- Export format and audit policy.
- Open issues definition.
- Read-model strategy.
- Auth mechanism final decision.
