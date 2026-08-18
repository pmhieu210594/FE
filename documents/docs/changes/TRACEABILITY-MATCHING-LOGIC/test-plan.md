# Test Plan

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC  
**Create date**: 2026-06-23  
**Author**: OpenAI  
**Update date**: 2026-06-23  

## 1. Purpose

Verify the read-only traceability view, completeness calculation, missing-link visibility, timeline ordering, and the reuse of existing `tbl_` tables.

## 2. AC Matrix -> Test Type

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-TRACEABILITY-MATCHING-LOGIC-1 | Yes | Yes | Yes | No | No | No | Yes |
| AC-TRACEABILITY-MATCHING-LOGIC-2 | Yes | Yes | Yes | No | No | No | Yes |
| AC-TRACEABILITY-MATCHING-LOGIC-3 | No | Yes | Yes | No | No | No | Yes |
| AC-TRACEABILITY-MATCHING-LOGIC-4 | Yes | Yes | Yes | No | No | No | Yes |
| AC-TRACEABILITY-MATCHING-LOGIC-5 | Yes | Yes | Yes | No | No | No | Yes |
| AC-TRACEABILITY-MATCHING-LOGIC-6 | Yes | Yes | Yes | No | No | No | Yes |
| AC-TRACEABILITY-MATCHING-LOGIC-7 | Yes | Yes | Yes | No | No | No | Yes |
| AC-TRACEABILITY-MATCHING-LOGIC-8 | No | Yes | No | No | Yes | No | No |
| AC-TRACEABILITY-MATCHING-LOGIC-9 | No | Yes | Yes | No | No | No | No |
| AC-TRACEABILITY-MATCHING-LOGIC-10 | Yes | Yes | Yes | No | No | No | Yes |

## 3. Priority

| test item | priority | reason |
|---|---|---|
| Completeness calculation | P0 | Core business rule of the ticket. |
| Missing link visibility | P0 | Broken evidence must stay visible. |
| Read-only access | P0 | Permission and safety constraint. |
| Traceability join correctness | P1 | Required for accurate rendering. |
| Timeline ordering | P1 | Important for evidence review. |
| Existing table reuse | P1 | Avoid schema drift. |

## 4. Reuse Existing Test

| existing test | path | covers | gap |
|---|---|---|---|
| `TraceabilityServiceTest` | `src/test/java/com/sdd/platform/application/usecase/traceability/TraceabilityServiceTest.java` | Completeness math, broken-link visibility, confidence preservation, and timeline ordering | Does not exercise the JDBC SQL layer. |
| `TraceabilityControllerTest` | `src/test/java/com/sdd/platform/web/rest/TraceabilityControllerTest.java` | GET endpoint shape and response serialization | Does not verify table reuse. |
| `TraceabilityPage.test.tsx` | `src/pages/traceability/TraceabilityPage.test.tsx` | Query-string loading, empty state, and read-only UI behavior | Does not prove backend table reuse. |
| `App.test.tsx` | `src/__ tests __/App.test.tsx` | Route wiring for viewer users | Does not cover traceability payload or SQL reuse. |

## 5. Additional Test This Time

| test | type | target | related AC |
|---|---|---|---|
| Read-only traceability summary returns artifact/PR/CI/timeline data | API IT | controller payload and response serialization | AC-1,2,4,7 |
| Completeness excludes commits and preserves confidence/severity | BE UT | completeness calculator and broken-link classifier | AC-3,5,6,9 |
| Timeline events remain deterministically ordered | BE UT | evidence-event ordering | AC-7 |
| Existing table reuse is preserved | BE UT / DB-Migration check | JDBC adapter SQL strings | AC-8 |
| Read-only permission path exposes no edit action | FE UT / Black-box | UI behavior | AC-10 |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| Complete ticket | Ticket has artifact, PR, commit, CI, and report facts | Open traceability screen and inspect summary | Completeness is 100 percent, no broken links | AC-1,2,4,5,7 |
| Missing PR | Ticket has artifacts but no PR | Open traceability screen | Broken link is visible and completeness is reduced | AC-2,5,6 |
| Missing CI | Ticket has artifact and PR but no CI | Open traceability screen | CI is flagged as missing and completeness is reduced | AC-4,5,6 |
| Read-only interaction | Traceability view is loaded | Try to edit or delete a link | No edit action exists | AC-10 |

## 6. Areas intentionally left untested this time

| area | reason | risk |
|---|---|---|
| Manual graph editing | Out of scope | None for MVP |
| Auto repair | Out of scope | None for MVP |
| AI root cause analysis | Out of scope | None for MVP |
| Cross-project dependency graph | Out of scope | None for MVP |
| Multi-PR support | Explicitly out of scope | Future product risk |
| Full browser E2E journey | FE UT, BE UT, API IT, and black-box checks were sufficient for this phase | Browser-only regressions may still slip through |

## 7. Data testing principles

- Use one synthetic ticket as the anchor fixture for all traceability cases.
- Keep timestamps, UUIDs, and ticket keys deterministic so ordering assertions are stable.
- Use existing `tbl_` shapes only; do not create production-like payload dumps.
- Prefer the smallest fixture that proves the AC instead of large scenario bundles.

## 8. Execution command

| command | purpose |
|---|---|
| `mvn -q "-Dtest=TraceabilityServiceTest,TraceabilityJdbcAdapterTest,TraceabilityControllerTest" test` | Run the targeted BE unit/controller/adapter verification. |
| `npx vitest run src/pages/traceability/TraceabilityPage.test.tsx "src/__ tests __/App.test.tsx" --reporter=dot` | Run the targeted FE traceability and route tests. |
| `npx tsc --noEmit` | Verify FE type safety. |
| `npx eslint src/App.tsx src/components/Layout.tsx src/lib/api.ts src/pages/traceability/TraceabilityPage.tsx src/pages/traceability/TraceabilityPage.test.tsx "src/__ tests __/App.test.tsx"` | Verify FE lint and formatting. |
| `npm run -s build` | Verify the FE production bundle still builds. |

## 9. Stop Condition

- Stop if the implementation introduces a new table instead of reusing existing ones.
- Stop if the traceability endpoint is not read-only.
- Stop if a method or API is referenced without source confirmation.
- Stop if the FE traceability screen exposes edit/delete/repair actions.

## 10. Required Human Decision

| item | decision |
|---|---|
| Exact FE route and accessibility rules | `/traceability` is exposed to viewer users through the existing layout/navigation pattern. |
| Whether completeness is displayed as percentage only or percentage plus raw counts | Percentage plus raw counts. |
