# Test Plan

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-17

## 1. Purpose

Define the Phase 6 test strategy for Project Management based on the current implementation state, the current existing automated tests, and the added Playwright E2E coverage patterned after `EDCAP_FE/e2e_tests/tests/team/team.spec.ts`.

## 2. AC Matrix ↔ Coverage Status

| AC ID | Existing BE coverage | Existing FE component coverage | New E2E coverage now | Intentionally skipped / note |
|---|---|---|---|---|
| AC-PROJECT-1 | Yes | Partial | Added now | No DB integration unless runtime evidence is disputed |
| AC-PROJECT-2 | No | Partial | Added now | Empty-state UX remains UI-focused |
| AC-PROJECT-3 | Yes | Partial | Added now | DB integration still optional |
| AC-PROJECT-4 | Yes | Partial | Not adding E2E now | BE/FE component evidence is sufficient for minimum scope |
| AC-PROJECT-5 | Yes | Partial | Added now | Focus on same-customer duplicate rejection |
| AC-PROJECT-6 | Yes | Yes | Added now | E2E confirms real detail screen wiring |
| AC-PROJECT-7 | Yes | Yes | Added now | E2E validates no-regression on edit flow |
| AC-PROJECT-8 | Yes | Partial | Added now | Covered through deleted-list behavior |
| AC-PROJECT-9 | Yes | Partial | Added now | Core Project-specific contract |
| AC-PROJECT-10 | Partial | No | Added now | Still partial unless FE guard and backend auth both run cleanly |
| AC-PROJECT-11 | Yes | Yes | Optional if stable | Not added to dedicated E2E because persisted team-sync selectors were not stable enough |
| AC-PROJECT-12 | Yes | Partial | Not adding E2E now | Controller and shared API-client evidence remain primary |

## 3. Existing Coverage Already Present

| coverage source | path | current evidence |
|---|---|---|
| Backend service tests | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ProjectServiceTest.java` | List default-active behavior, validation, duplicate rejection, detail, update, soft delete, auth denial, team sync, `project_type` normalization |
| Backend controller tests | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/web/rest/ProjectControllerTest.java` | List/detail/create/update/delete routes, no-`version` request shape, `PUT /delete`, exception mapping |
| Frontend component tests | `EDCAP_FE/src/__ tests __/project/ProjectPage.test.tsx` | Detail drawer, deleted detail behavior, update payload normalization, add/remove team behavior |

## 4. Additional Coverage To Add This Phase

| test | type | target | related AC |
|---|---|---|---|
| Project access guard redirect | Playwright E2E | `/#/en/projects` with non-admin token | AC-PROJECT-10 |
| Project create + detail | Playwright E2E | create flow and detail screen | AC-PROJECT-1, AC-PROJECT-3, AC-PROJECT-6 |
| Project search + safe empty state | Playwright E2E | list search behavior | AC-PROJECT-2 |
| Project edit flow | Playwright E2E | update alias/type set | AC-PROJECT-7 |
| Duplicate Project alias rejection | Playwright E2E | create conflict in same Customer | AC-PROJECT-5 |
| Project soft delete + deleted filter | Playwright E2E | active/deleted list behavior | AC-PROJECT-8, AC-PROJECT-9 |

## 5. Project E2E Plan

### 5.1. Implementation Template

- Create `EDCAP_FE/e2e_tests/tests/project/project.spec.ts`.
- Follow the Team E2E conventions:
  - API login in `beforeEach`
  - localStorage token bootstrap
  - unique fixture generator with `E2E_PROJECT_` prefix
  - backend cleanup helpers
  - mixed UI assertions and backend API verification
  - numbered `test.step(...)` blocks

### 5.2. E2E Scenarios

| scenario | precondition | expected | related AC |
|---|---|---|---|
| Project access guard - UI E2E | Non-admin token in browser | Redirect to login and logout invoked | AC-PROJECT-10 |
| Create Project from UI and verify detail | Active Customer available | New active Project appears in list and detail shows core fields | AC-PROJECT-1, AC-PROJECT-3, AC-PROJECT-6 |
| Search Project and verify safe empty state | At least one created Project exists | Matching row remains, nonexistent keyword removes row without breaking page | AC-PROJECT-2 |
| Edit Project and verify updated values | Existing active Project exists | Updated alias/type set persists | AC-PROJECT-7 |
| Reject duplicate Project alias in same Customer | Existing active Project in same Customer | Error toast shown and only one active Project remains | AC-PROJECT-5 |
| Delete Project and verify deleted-list behavior | Existing active Project exists | Active list hides Project, deleted filter shows it, API state is soft-deleted | AC-PROJECT-8, AC-PROJECT-9 |

## 6. Intentionally Skipped This Phase

| area | reason | risk |
|---|---|---|
| Full locale E2E parity | Lower priority than CRUD, auth guard, duplicate, and soft delete proof | Low |
| Broad regression E2E outside Project | Outside ticket scope | Low |
| DB integration test | Only needed if runtime behavior is disputed after BE/E2E evidence | Medium |
| Full `tbl_dim_role` semantic proof | Current implementation evidence is still ADMIN-gated rather than full role-table mapping | Medium |

## 7. Test Data Policy

- Use synthetic Project aliases with `E2E_PROJECT_` prefix.
- Prefer reusing existing active Customer and Team records discovered by API rather than depending on named business fixtures.
- Keep all E2E-created Projects soft-deleted during cleanup via `PUT /api/v1/projects/{id}/delete`.
- Include create/update paths with:
  - non-empty trimmed alias
  - duplicate alias under same Customer
  - optional Team assignment
  - active/deleted visibility cases
- Do not add `version` to any Project request.
- Keep `project_type` as free-text test data and keep `riskLevel` within supported severity values.

## 8. Execution Commands

| command | purpose |
|---|---|
| `cd EDCAP_BE && mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | Targeted backend Project tests |
| `cd EDCAP_FE && npx vitest run "src/__ tests __/project/ProjectPage.test.tsx"` | Targeted frontend Project component tests |
| `cd EDCAP_FE && npx playwright test e2e_tests/tests/project/project.spec.ts` | Targeted frontend Project E2E tests |

## 9. Stop Conditions

- Stop if Project tests or code introduce `version` into create/update requests.
- Stop if delete changes from `PUT /api/v1/projects/{id}/delete` to `PATCH` or `DELETE`.
- Stop if Team assignment stops using `tbl_project_team` semantics.
- Stop if E2E implementation must rely on unstable app-specific selectors that cannot be kept deterministic without unrelated UI rewrites.

## 10. Required Human Review

| decision | status | note |
|---|---|---|
| Exact auth-to-`tbl_dim_role` mapping | Open | E2E guard coverage still does not fully prove role-table semantics |
| FE workspace cleanup for unrelated backup/conflict files | Open | May still block broader FE verification outside targeted tests |
