# Implementation Plan

**Ticket ID**: REPOSITORY-CRUD
**Create date**: 2026-06-19
**Author**: Codex
**Update date**: 2026-06-19

## 1. Implementation Principle

- Keep the ticket aligned to the confirmed platform patterns and the current Repository spec, not to template assumptions.
- Use `tbl_dim_repository` as the only storage target and treat the legacy `Repository` model as reference material only.
- Keep success responses raw DTOs or raw DTO lists and failures as `ErrorResponse`.
- Preserve soft delete, default exclusion of deleted rows, and backend-only authorization as the source of truth.
- Treat `project_id` as the only Repository-to-Project key and join `project_alias` from `tbl_dim_project`; do not source it from FE payloads or temporary cache.
- Implement in small slices that are individually reviewable and testable.

## 2. Alternative Approach

- Alternative: invent a new envelope / pagination contract and a separate Repository design.
- Rejected because the platform standards, FE API helpers, and adjacent CRUD patterns already prove the raw DTO contract is the right fit.
- Chosen approach: follow the existing Project / Organization / Customer CRUD shape and only add repository-specific behavior where the spec requires it.

## 3. Step-by-Step Implementation

1. Finalize BE contract surface.
   - Add Repository controller, service/use case, request/response DTOs, persistence port, and adapter.
   - Verify controller route naming and raw DTO responses before touching the FE.
2. Lock DB access semantics.
   - Wire the adapter to `tbl_dim_repository`, active-row filters, and partial uniqueness for active names within a project.
   - Confirm delete behavior is soft-only and deleted detail access follows the spec.
3. Add FE API helpers and routing.
   - Add `endpoints.repositories.*` in `src/lib/api.ts`.
   - Register the Repository route and page under the existing language-first shell.
4. Build the Repository page.
   - Implement list, detail drawer, create/edit drawer, and delete confirm flows.
   - Reuse the current CRUD stack so the page remains consistent with adjacent admin screens.
5. Add tests in lockstep.
   - Add BE unit and web tests first, then FE unit tests, then E2E coverage for the happy path and key failures.
6. Add localization and polish.
   - Fill locale keys, validation messages, labels, and deleted-row copy across `en`, `ja`, and `vi`.

## 4. Verification Per Step

- Step 1: run BE unit/web tests for controller and service contracts.
- Step 2: run DB-focused tests or schema inspection to confirm the active-row uniqueness and soft-delete columns.
- Step 3: run FE typecheck and a focused unit test for `endpoints.repositories.*`.
- Step 4: run Repository page unit tests and verify list/detail/edit/delete interactions.
- Step 5: run the Repository E2E scenario covering create, update, delete, and deleted-row behavior.
- Step 6: visually verify locale text in all supported languages and confirm no missing-key fallbacks remain on the new screen.

## 5. Rollback

- FE rollback: remove the Repository route/page wiring and its API helper calls.
- BE rollback: remove the Repository controller, service, DTOs, ports, and adapter additions in a single revert set.
- DB rollback: do not edit committed migrations; add a new corrective migration if schema needs to change again.
- Test rollback: keep only the tests that still match the remaining source surface.

## 6. AC Mapping

| AC | Implementation focus | Primary verification |
|---|---|---|
| AC-REPOSITORY-1 | List active repositories only | BE list test + FE list rendering |
| AC-REPOSITORY-2 | Repository detail by ID, including parent project name | BE detail test + FE detail drawer |
| AC-REPOSITORY-3 | Valid create flow | BE create test + FE form + E2E create |
| AC-REPOSITORY-4 | Valid update flow and duplicate rejection | BE update/duplicate tests + FE edit flow |
| AC-REPOSITORY-5 | Soft delete only | BE delete test + FE delete confirm + E2E delete |
| AC-REPOSITORY-6 | Standard error shape for invalid input, missing ID, permission failure | BE web tests for 400/403/404/409 |
| AC-REPOSITORY-7 | FE refresh and success/error handling | FE mutation tests + E2E post-mutation refresh |
| AC-REPOSITORY-8 | Trimmed name normalization | FE normalization test + BE validation test |

## 7. Stop / Ask Conditions

- Stop if the permission model changes from the currently documented backend-authoritative approach.
- Stop if the business rule for deleted-row detail visibility changes.
- Stop if the team wants a new response envelope instead of raw DTOs.
- Stop if implementation would require editing an already committed migration.
- Stop if the FE/BE contract needs a shape that is not supported by the current platform patterns.
