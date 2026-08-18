# Test Plan

**Ticket ID**: ROLE  
**Feature**: CRUD Role Management  
**Phase**: Phase 6 - Test Planning / Execution Alignment  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-15  
**Status**: Updated from skeleton using current source and latest Phase 6 execution evidence

## Objective

Define the minimum reliable Phase 6 test coverage for the current ROLE implementation and map actual executable coverage to the canonical specification in `EDCAP_BE/documents/docs/changes/ROLE/spec-pack.md`.

This plan records what is already covered by source and tests, what was executed in this workspace on 2026-06-15, and what currently satisfies the Phase 6 gate.

## Source Basis

| source | purpose | status |
|---|---|---|
| `EDCAP_BE/documents/docs/changes/ROLE/spec-pack.md` | Canonical spec and AC source | Read |
| `EDCAP_BE/documents/docs/changes/ROLE/impl-plan.md` | Phase 3 implementation expectations | Read |
| `EDCAP_BE/documents/docs/changes/ROLE/review-checklist.md` | Review gate reference | Read |
| `EDCAP_FE/src/App.tsx` | FE route and auth guard behavior | Read |
| `EDCAP_FE/src/components/Layout.tsx` | FE navigation visibility | Read |
| `EDCAP_FE/src/pages/RolePage.tsx` | ROLE FE screen behavior | Read |
| `EDCAP_FE/src/lib/api.ts` | FE API helper contract | Read |
| `EDCAP_FE/src/__ tests __/Layout.test.tsx` | FE navigation RBAC evidence added in this pass | Read |
| `EDCAP_FE/src/__ tests __/App.test.tsx` | FE route/access test evidence | Read |
| `EDCAP_FE/src/__ tests __/role/role-api.test.ts` | FE API test evidence | Read |
| `EDCAP_FE/src/__ tests __/role/RolePage.test.tsx` | FE page/component evidence added in this Phase 6 pass | Read |
| `EDCAP_FE/src/__ tests __/lib/utils.test.ts` | Shared FE timestamp formatter evidence | Read |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/RoleController.java` | BE API behavior | Read |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/RoleService.java` | BE rules and RBAC behavior | Read |
| `EDCAP_BE/src/main/resources/mapper/RoleMapper.xml` | SQL/filter/delete behavior | Read |
| `EDCAP_BE/src/main/resources/db/migration/V90__alter_tbl_role_for_management.sql` | `delete_flag` migration evidence | Read |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/RoleServiceUnitTest.java` | BE unit coverage evidence | Read |
| `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/RoleControllerIntegrationTest.java` | BE controller integration coverage evidence | Read |
| `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/infrastructure/persistence/RolePersistenceIntegrationTest.java` | BE persistence/logical-delete evidence added in this pass | Read |

## Coverage Legend

| status | meaning |
|---|---|
| Executed PASS | Test exists and passed in this workspace during Phase 6 verification |
| Exists Not Run | Test exists in source but was not executed successfully in this pass |
| Missing | Required coverage is not present in readable source |
| Blocked | Intended verification exists but the command/build state prevented a clean run |

## Phase 6 Coverage Matrix

| AC ID | requirement summary | current coverage | evidence | status |
|---|---|---|---|---|
| AC-1 | `ADMIN` / `EDITOR` / `VIEWER` can open `/roles` and load raw list | FE route test, FE nav test, and BE list authorization exist | `EDCAP_FE/src/__ tests __/App.test.tsx`, `EDCAP_FE/src/__ tests __/Layout.test.tsx`, `RoleServiceUnitTest`, `RoleControllerIntegrationTest` | Executed PASS |
| AC-2 | Disallowed users cannot view roles | BE returns 403 when service rejects | `RoleControllerIntegrationTest.directApiReturns403WhenServiceRejectsRole` | Executed PASS |
| AC-3 | `ADMIN` / `EDITOR` can create valid role | BE service and controller create paths covered | `RoleServiceUnitTest.create_trimsFieldsAndAllowsEditor`, `RoleControllerIntegrationTest.create_returns201AndRoleBody` | Executed PASS |
| AC-4 | Duplicate create against an active role returns HTTP 400 `ErrorResponse` | BE duplicate path is covered for active-row collision, and active-scope duplicate candidates are explicitly verified | `RoleServiceUnitTest.create_rejectsDuplicateAsBusinessRule`, `RoleServiceUnitTest.create_allowsNameThatOnlyMatchesLogicallyDeletedRows`, `RoleControllerIntegrationTest.create_returns400ForDuplicateRoleName`, `RolePersistenceIntegrationTest` | Executed PASS |
| AC-5 | Blank or whitespace role name is rejected | BE unit validation path is explicitly covered | `RoleServiceUnitTest.create_rejectsBlankRoleName` | Executed PASS |
| AC-6 | `ADMIN` / `EDITOR` can update existing role | BE update path covered | `RoleServiceUnitTest.update_persistsTrimmedValues`, `RoleControllerIntegrationTest.update_returnsUpdatedRoleBody` | Executed PASS |
| AC-7 | Duplicate update against another active role returns HTTP 400 | BE service duplicate-on-update/self-exclusion and deleted-row exclusion are explicitly covered | `RoleServiceUnitTest.update_rejectsDuplicateExcludingSelf`, `RoleServiceUnitTest.update_allowsNameThatOnlyMatchesLogicallyDeletedRows`, `RolePersistenceIntegrationTest` | Executed PASS |
| AC-8 | `ADMIN` logical delete returns updated `RoleDto` and updates delete metadata | BE delete behavior is covered and aligned to current canonical spec | `RoleServiceUnitTest.logicalDelete_allowsAdminAndUpdatesFlagThroughRepository`, `RoleControllerIntegrationTest.logicalDelete_usesPutEndpointAndReturnsDeletedRoleBody` | Executed PASS |
| AC-9 | Deleted roles are excluded from list/search/query and from duplicate-check candidate sets | Mapper/persistence evidence covers active-scope filtering, duplicate-candidate exclusion, and logical-delete columns | `RolePersistenceIntegrationTest`, `RoleServiceUnitTest.create_allowsNameThatOnlyMatchesLogicallyDeletedRows`, `RoleServiceUnitTest.update_allowsNameThatOnlyMatchesLogicallyDeletedRows` | Executed PASS |
| AC-10 | `EDITOR` / `VIEWER` direct delete API calls are rejected | BE service deny path covered | `RoleServiceUnitTest.logicalDelete_rejectsEditorAndViewer` | Executed PASS |
| AC-11 | `VIEWER` direct create/update API calls are rejected | BE create and update deny paths are explicitly covered | `RoleServiceUnitTest.create_rejectsViewer`, `RoleServiceUnitTest.update_rejectsViewer` | Executed PASS |
| AC-12 | Search by `role_name` works and excludes deleted rows | FE helper query string plus FE page search trigger and BE normalization are covered; deleted-row exclusion still lacks DB execution proof | `role-api.test.ts`, `RolePage.test.tsx`, `RoleServiceUnitTest.list_allowsViewerAndNormalizesSearchAndSort` | Exists Not Run |
| AC-13 | Sort by `role_name` works | FE helper and BE normalization covered | `role-api.test.ts`, `RoleServiceUnitTest.list_allowsViewerAndNormalizesSearchAndSort` | Executed PASS |
| AC-14 | FE paginates client-side and BE returns no pagination wrapper | FE page test now covers wired pagination control over a raw list; FE helper expects raw array | `RolePage.test.tsx`, `role-api.test.ts` | Executed PASS |
| AC-15 | Role screen shows search, table, pagination, permitted controls | FE page and nav tests cover rendered list/search, controls, and role-based visibility | `RolePage.test.tsx`, `Layout.test.tsx` | Executed PASS |
| AC-16 | Detail dialog shows `role_name` and `description` | FE detail-dialog path now covered | `RolePage.test.tsx.opens detail view for a viewer...` | Executed PASS |
| AC-17 | Edit dialog exposes `role_name` and `description` | FE update flow is covered through edit open and trimmed submit | `RolePage.test.tsx.allows an editor to open edit dialog and submit trimmed values` | Executed PASS |
| AC-18 | Delete requires confirmation before API call | FE component test asserts delete API is not called until explicit confirmation action | `RolePage.test.tsx.calls logical delete only for admin actions` | Executed PASS |
| AC-19 | Delete confirmation includes target role name | FE component test asserts confirmation copy contains target `role_name` | `RolePage.test.tsx.calls logical delete only for admin actions` | Executed PASS |
| AC-20 | Create dialog contains `role_name`, description, create, close/cancel | FE create path now covered partially through dialog open and submit | `RolePage.test.tsx.allows an admin to create...` | Exists Not Run |
| AC-21 | `createdAt` / `updatedAt` display as `DD/MM/YYYY HH:mm:ss` | FE utility test proves formatter output and FE page test proves ROLE uses the shared formatter in table/detail rendering | `EDCAP_FE/src/__ tests __/lib/utils.test.ts`, `EDCAP_FE/src/__ tests __/role/RolePage.test.tsx`, `RolePage.tsx` | Executed PASS |
| AC-22 | ROLE labels use i18n keys | FE source and locale entries exist; test mocks prove key-based rendering path without hardcoded copy | `RolePage.tsx`, `RolePage.test.tsx`, locale files | Exists Not Run |

## Commands Planned For Phase 6 Verification

| command | purpose | latest result |
|---|---|---|
| `npm run test:unit -- --run "src/__ tests __/App.test.tsx" "src/__ tests __/Layout.test.tsx" "src/__ tests __/role/role-api.test.ts" "src/__ tests __/role/RolePage.test.tsx" "src/__ tests __/lib/utils.test.ts"` | FE ROLE route, nav, API helper, page/component, and timestamp formatter tests | Executed; passed |
| `npm run build` | FE compile/build gate | Executed; passed |
| `mvn test "-Dtest=RoleServiceUnitTest"` | Targeted BE ROLE unit test | Executed; passed |
| `mvn verify "-Dit.test=RoleControllerIntegrationTest,RolePersistenceIntegrationTest"` | BE integration gate for ROLE plus persistence evidence | Executed; passed |

## Tests Added In This Pass

| test file | added coverage | note |
|---|---|---|
| `EDCAP_FE/src/__ tests __/role/RolePage.test.tsx` | FE list/search/create/detail/delete visibility, confirmation behavior, and timestamp-render wiring | Minimal Phase 6 component coverage |
| `EDCAP_FE/src/__ tests __/Layout.test.tsx` | FE navigation RBAC coverage for ROLE visibility | Added to close route/nav blocker |
| `EDCAP_FE/src/__ tests __/lib/utils.test.ts` | FE timestamp formatter evidence for `DD/MM/YYYY HH:mm:ss` behavior | Added to close AC-21 gap |
| `EDCAP_FE/src/__ tests __/App.test.tsx` | Removed unused import so FE build reflects product state instead of test-file hygiene failure | No behavior change to the assertion itself |
| `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/infrastructure/persistence/RolePersistenceIntegrationTest.java` | Persistence evidence for `delete_flag` filtering and logical-delete columns | Added to close BE persistence gap |

## Intentionally Skipped Tests And Reasons

| area | skipped item | reason |
|---|---|---|
| FE component | Real Ant Design portal behavior for delete confirmation | Current test harness uses a stable mock to prove confirmation-before-delete semantics; it does not attempt full Ant Design portal behavior |
| E2E | ROLE happy path browser journey | Auth/test-user role switching strategy is still not defined for ROLE |

## Test Data Policy

- Use only synthetic role names in tests.
- Do not use production data, `.env*`, secrets, credentials, or raw production logs.
- Reuse existing sample names only as test literals where needed: `PM`, `QA`, `ADMIN`.
- Any future E2E seed/setup data must be explicitly marked as synthetic and disposable.

## Assumptions

| ID | assumption | basis | risk |
|---|---|---|---|
| TP-ROLE-ASM-001 | `mvn verify "-Dit.test=RoleControllerIntegrationTest"` is acceptable evidence for `RoleServiceUnitTest` because the lifecycle output shows that test class ran and passed | Maven output from 2026-06-15 | Medium |
| TP-ROLE-ASM-002 | Missing dedicated FE ROLE component tests means those behaviors are not yet validated, even if source appears to implement them | Readable test inventory | Low |

## Human Decisions Required

| ID | decision | reason |
|---|---|---|
| HDR-ROLE-P6-001 | No additional human decision required for route/nav RBAC in this pass | Source and tests have been aligned to the current canonical spec |
| HDR-ROLE-P6-002 | No additional human decision required for delete response shape in this pass | Canonical spec defines delete success response as `RoleDto` |

## Completion Gate Input

Phase 6 can be judged PASS in this pass because:

1. FE route/access behavior for `/roles` is aligned with canonical RBAC/view rules and covered by focused tests.
2. Delete success contract is aligned between source and canonical spec.
3. FE interaction coverage now includes create, edit, detail, delete confirmation, route, and nav evidence.
4. BE persistence evidence now covers logical-delete filtering, duplicate-candidate exclusion, and required mapper/migration signals.
5. FE timestamp formatter evidence now covers the canonical `DD/MM/YYYY HH:mm:ss` display requirement.
