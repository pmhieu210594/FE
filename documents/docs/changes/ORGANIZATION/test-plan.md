# Test Plan

**Ticket ID**: ORGANIZATION      
**Create date**: 2026-06-10       
**Author**: nk_trung        
**Update date**: 2026-06-11 

## 1. Purpose

Define the Phase 6 test strategy for the implemented Organization Management feature and keep the plan traceable to the actual source shape.

This plan maps each acceptance criterion to the test type used in Phase 6, separates reused coverage from new test code, records the remaining runtime prerequisites, and documents test data rules. The latest uploaded archive contains backend source and E2E files, but does not contain the normal `EDCAP_FE/src` application source tree or FE `package.json`. Therefore FE unit/component test files are provided for the expected project paths and must be copied into the full FE source checkout before execution.

## 2. AC Matrix ↔ Test Type

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-ORGANIZATION-1 | Added | Added | Added | N/A | N/A | Added* | Added |
| AC-ORGANIZATION-2 | Added | Added | Added | N/A | N/A | Added* | Added |
| AC-ORGANIZATION-3 | Added | Added | Added | N/A | N/A | Added* | Added |
| AC-ORGANIZATION-4 | Added | Added | Added | N/A | Added | Added* | Added |
| AC-ORGANIZATION-5 | Added | Added | Added | N/A | Added | Added* | Added |
| AC-ORGANIZATION-6 | Added | Added | Added | N/A | Added | Added* | Added |
| AC-ORGANIZATION-7 | Added | Added | Added | N/A | N/A | Added* | Added |
| AC-ORGANIZATION-8 | Added | Added | Added | N/A | N/A | Added* | Added |
| AC-ORGANIZATION-9 | Added | Added | Added | N/A | Added | Added* | Added |
| AC-ORGANIZATION-10 | Added | Added | Added | N/A | Added | Added* | Added |
| AC-ORGANIZATION-11 | Added | Added | Added | N/A | N/A | Added* | Added |
| AC-ORGANIZATION-12 | Added | Added | Added | N/A | N/A | N/A | Added |
| AC-ORGANIZATION-13 | Added | Added | Added | N/A | Added | Added* | Added |

### Status Legend

| Status | Meaning |
|---|---|
| Added | Test code was added in Phase 6 for this test type. |
| Added* | Executable E2E code was added, but runtime execution requires a running BE/FE/DB and an authenticated ADMIN `JSESSIONID` via `EDCAP_E2E_SESSION_COOKIE`. |
| Existing | Already covered before Phase 6. |
| Partial | Only part of the AC is covered. Phase 6 now avoids this status for the target AC matrix except where environment execution is explicitly required. |
| Planned | Manual black-box verification remains planned because it needs a real browser session and environment evidence. |
| N/A | This test type is not applicable for the AC. |

Phase 6 detail:

| AC ID | Phase 6 coverage summary | Test added this phase | Location | Status |
|---|---|---|---|---|
| AC-ORGANIZATION-1 | Default active list, list endpoint, FE list render, E2E default-list check after soft delete. | BE service search default, controller list JSON, FE API list, UI list render, E2E list verification. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-2 | Search by keyword/code/name forwarding and result filtering contract. | BE service keyword normalization, controller search params, FE search query, UI search input, E2E keyword search. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-3 | All/Active/Deleted status filtering. | BE status normalization, FE/API status param, FE filter drawer query, E2E active/deleted/all filter after soft delete. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-4 | Valid create creates ACTIVE organization. | BE create default ACTIVE, controller 201 response, FE create request body, component create drawer submit, E2E create flow, DB default version check. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/infrastructure/persistence/migration/OrganizationMigrationIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-5 | Duplicate active code rejected and soft-deleted code can be reused at DB level. | BE duplicate-code rule, controller 400 mapping, DB partial unique index check, FE create/update error handling, E2E duplicate-code create/update checks. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/infrastructure/persistence/migration/OrganizationMigrationIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-6 | Duplicate active name rejected and soft-deleted name can be reused at DB level. | BE duplicate-name rule, controller 400 mapping, DB partial unique index check, FE create/update error handling, E2E duplicate-name create/update checks. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/infrastructure/persistence/migration/OrganizationMigrationIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-7 | Edit code with version; duplicate/stale rejected. | BE update success/duplicate/stale tests, controller update/409 tests, FE update error handling, E2E duplicate-code update and stale-version conflict. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-8 | Edit name with version; duplicate/stale rejected. | BE update duplicate-name/stale tests, controller update 400/409 tests, FE update error handling, E2E duplicate-name update and stale-version conflict. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-9 | Soft delete through PATCH and no physical delete expectation. | BE soft-delete metadata rule, controller PATCH test, DB active/deleted partial-index behavior, E2E soft-delete flow. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/infrastructure/persistence/migration/OrganizationMigrationIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-10 | Deleted organizations are excluded by default and visible through Deleted filter/read-only path. | BE default ACTIVE search and DELETED filter, FE/API status param, FE filter drawer query, E2E default/deleted/all filter comparison. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-11 | Non-ADMIN access denied at service/API level; full UI auth redirect is covered by a route-intercepted Playwright path and FE route-level unit test. | BE service forbidden test, controller 403 mapping test, FE app redirect/logout test, E2E protected-route redirect and logout interception. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/App.test.tsx`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |
| AC-ORGANIZATION-12 | Error envelope and trace/message-key propagation. | Controller error mapping tests, FE `ApiError` trace-id/message-key test. | `EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts` | Test code added |
| AC-ORGANIZATION-13 | Stale version returns 409 and does not overwrite/update/delete. | BE stale update/delete tests, controller 409 test, FE conflict error mapping, E2E stale update conflict with backend verification. | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java`<br>`EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java`<br>`EDCAP_FE/src/__tests__/organization/organization-api.test.ts`<br>`EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Test code added |

## 3. Priority

| test item | priority | reason |
|---|---|---|
| ADMIN-only FE/BE access | P0 | Security requirement. Phase 6 adds BE service/API 403 tests and an E2E route-intercepted protected journey. A real provider-backed login flow is still excluded. |
| Soft delete no physical delete | P0 | Data preservation requirement. Phase 6 adds BE service/API tests plus PostgreSQL migration/partial-index verification. |
| Optimistic locking stale version | P0 | Prevents lost updates/deletes. Phase 6 adds service, controller, FE API, and E2E stale-version tests. |
| Duplicate code/name active-scope uniqueness | P0 | Core master-data integrity. Phase 6 adds service/controller tests and PostgreSQL partial unique-index migration test. |
| Migration columns/indexes/backfill | P0 | Feature cannot work without schema changes. Phase 6 adds a Testcontainers PostgreSQL Flyway migration test. |
| Create/update validation | P1 | Required user-facing behavior. Phase 6 adds required/max-length service tests and request-body tests. |
| List/search/filter | P1 | Main screen behavior. Phase 6 adds BE, FE, and E2E coverage. |
| i18n message display | P1 | FE error-message behavior is covered through API error key propagation; full visual localization remains manual/runtime verification. |
| Empty state and deleted read-only view | P2 | Deleted visibility is covered by API/E2E; visual read-only state remains a browser black-box item. |

## 4. Reuse Existing Test

| existing test/check | path | covers | gap |
|---|---|---|---|
| `LayerEnforcementTest` | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | Hexagonal layer boundaries | Does not test Organization behavior. |
| Existing Organization implementation evidence | `docs/changes/ORGANIZATION/self-review.md`, `report.md`, previous test evidence | Prior compile/build/manual evidence recorded by implementation phase | Phase 6 adds explicit automated tests instead of relying on evidence-only claims. |
| Playwright smoke | `EDCAP_FE/e2e_tests/tests/smoke.spec.ts` | App boot smoke | Does not cover Organization CRUD/auth. Replaced by real Organization E2E file with env-gated admin session. |
| FE coverage artifact | `EDCAP_FE/coverage/...OrganizationPage.tsx.html` | Confirms OrganizationPage existed in the source used for coverage generation | Latest uploaded archive is missing `EDCAP_FE/src`, so FE UT files must be applied to the complete FE checkout. |

## 5. Additional Test This Time
| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-ORGANIZATION-1 | Search defaults, keyword/status normalization, page-size cap | BE UT | `OrganizationService.search` | AC-ORGANIZATION-1, AC-ORGANIZATION-2, AC-ORGANIZATION-3, AC-ORGANIZATION-10 |
| TC-ORGANIZATION-2 | ADMIN-only role guard | BE UT/API IT | `OrganizationService.requireAdmin`, controller 403 mapping | AC-ORGANIZATION-11 |
| TC-ORGANIZATION-3 | Get/detail and not-found mapping | BE UT/API IT | `get`, `GET /api/v1/organizations/{id}` | AC-ORGANIZATION-1, AC-ORGANIZATION-10, AC-ORGANIZATION-12 |
| TC-ORGANIZATION-4 | Create validation/default ACTIVE/duplicate code/name | BE UT/API IT/FE UT/E2E | Service, controller, FE helper/component, E2E API | AC-ORGANIZATION-4, AC-ORGANIZATION-5, AC-ORGANIZATION-6 |
| TC-ORGANIZATION-5 | Update success, duplicate code/name, deleted edit block, stale version | BE UT/API IT/FE UT/E2E | Service/controller/API helper | AC-ORGANIZATION-7, AC-ORGANIZATION-8, AC-ORGANIZATION-13 |
| TC-ORGANIZATION-6 | Soft delete active/already-deleted/stale version | BE UT/API IT/FE UT/E2E | Service/controller/API helper | AC-ORGANIZATION-9, AC-ORGANIZATION-10,AC-ORGANIZATION-13 |
| TC-ORGANIZATION-7 | Flyway migration on PostgreSQL | DB/Migration IT | `V1..V5` migrations, columns, indexes, version default, partial unique indexes | AC-ORGANIZATION-5, AC-ORGANIZATION-6, AC-ORGANIZATION-9, AC-ORGANIZATION-10, AC-ORGANIZATION-13 |
| TC-ORGANIZATION-8 | Organization API helper | FE UT | `endpoints.organizations.*`, `ApiError` trace/message key | AC-ORGANIZATION-1, AC-ORGANIZATION-2, AC-ORGANIZATION-3, AC-ORGANIZATION-4, AC-ORGANIZATION-5, AC-ORGANIZATION-6, AC-ORGANIZATION-7, AC-ORGANIZATION-8, AC-ORGANIZATION-9, AC-ORGANIZATION-10, AC-ORGANIZATION-11, AC-ORGANIZATION-12, AC-ORGANIZATION-13 |
| TC-ORGANIZATION-9 | OrganizationPage component | FE Component UT | List render, search, status filter, create, edit, delete, duplicate-name/code, stale-version, error toast | AC-ORGANIZATION-1, AC-ORGANIZATION-2, AC-ORGANIZATION-3, AC-ORGANIZATION-4, AC-ORGANIZATION-5, AC-ORGANIZATION-6, AC-ORGANIZATION-7, AC-ORGANIZATION-8, AC-ORGANIZATION-9, AC-ORGANIZATION-10, AC-ORGANIZATION-13 |
| TC-ORGANIZATION-10 | App auth routing | FE UT | Non-admin redirect/logout and admin route access | AC-ORGANIZATION-11 |
| TC-ORGANIZATION-11 | Playwright Organization E2E | E2E | Step-by-step UI flow: 1) open Organization screen, 2) click Create, 3) fill form, 4) submit, 5) verify row, 6) click Create again, 7) fill duplicate code/name, 8) submit, 9) verify error toast, 10) click Edit, 11) modify form, 12) submit, 13) verify table update, 14) search, 15) filter Active, 16) click Delete, 17) confirm delete, 18) verify row disappears from Active, 19) switch Deleted filter, 20) verify row appears in Deleted, 21) verify backend keeps the row in `DELETED` status. The same file also covers duplicate-name create/update, duplicate-code update, stale-version conflict, and non-admin redirect/logout via route interception. | AC-ORGANIZATION-1, AC-ORGANIZATION-2, AC-ORGANIZATION-3, AC-ORGANIZATION-4, AC-ORGANIZATION-5, AC-ORGANIZATION-6, AC-ORGANIZATION-7, AC-ORGANIZATION-8, AC-ORGANIZATION-9, AC-ORGANIZATION-10, AC-ORGANIZATION-11, AC-ORGANIZATION-13 |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| Admin create organization | ADMIN session cookie is available and backend/frontend/DB are running | 1. Open Organization screen. 2. Click Create. 3. Fill the form. 4. Submit. | New row appears in the table and the created organization is visible. | AC-ORGANIZATION-4 |
| Duplicate code validation | An active organization already exists with the same code | 1. Open Create. 2. Fill duplicate code/name values. 3. Submit. | Error toast appears and the duplicate is rejected. | AC-ORGANIZATION-5 |
| Duplicate name validation | An active organization already exists with the same name | 1. Open Create or Edit. 2. Enter duplicate name values. 3. Submit. | Error toast appears and the duplicate is rejected. | AC-ORGANIZATION-6 |
| Edit and stale version conflict | A row exists and an older version is available | 1. Click Edit. 2. Modify the form. 3. Submit. 4. Retry with stale version. | Update succeeds once and stale submission returns conflict. | AC-ORGANIZATION-7, AC-ORGANIZATION-8, AC-ORGANIZATION-13 |
| Soft delete and deleted view | An active organization exists | 1. Click Delete. 2. Confirm delete. 3. Switch to Deleted filter. | Row disappears from Active and appears in Deleted as `DELETED`. | AC-ORGANIZATION-9, AC-ORGANIZATION-10 |
| Non-admin access guard | Non-admin session or no session is available | 1. Open Organization route. | User is redirected or logged out according to the route guard. | AC-ORGANIZATION-11 |

Backend Unit Test files added:

```text
EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java
```

Backend Integration Test files added:

```text
EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java
EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/infrastructure/persistence/migration/OrganizationMigrationIntegrationTest.java
```

Frontend Unit/Component Test files added:

```text
EDCAP_FE/src/__tests__/App.test.tsx
EDCAP_FE/src/__tests__/organization/organization-api.test.ts
EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx
```

E2E test file updated:

```text
EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts
```

Maven test dependency/configuration updates:

```text
EDCAP_BE/pom.xml
```

## 6. Areas intentionally left untested this time

| area | reason | risk |
|---|---|---|
| Manual black-box evidence | Needs a real QA/browser run with screenshots or tester notes | Remains `Planned` until a human executes and records evidence. |
| FE non-ADMIN logout/redirect visual assertion | Covered by the new route-intercepted Playwright test path | A real provider-backed login flow is still out of scope for deterministic CI. |
| OAuth2 login itself | External provider dependent and not appropriate for deterministic CI without test identity setup | E2E uses `EDCAP_E2E_SESSION_COOKIE` rather than automating real OAuth login. |
| Dedicated audit-log storage | Out of scope by spec | Existing error/trace behavior is tested; no audit table assertion is expected. |
| Customer/Project child data restrictions | Out of scope by spec | Later tickets must cover child-data constraints. |
| Bulk import/export/restore | Out of scope by spec | None for this release. |

## 7. Data testing principles

- Use synthetic Organization codes/names only, with prefixes such as `ORG_TEST_`, `ORG_E2E_`, or `PHASE6_ORG_`.
- Do not use production data, real OAuth credentials, real tokens, or secrets.
- Automated BE unit/controller tests use deterministic IDs and timestamps.
- PostgreSQL migration tests create their own Testcontainers database and must not depend on local/dev DB state.
- E2E tests generate unique codes using a timestamp suffix to avoid collisions.
- Duplicate tests must include case-insensitive duplicates and soft-deleted reuse cases.
- Boundary cases must include code 50/51, name 255/256, and description 500/501.
- Stale version tests must submit an old numeric version and expect `409 Conflict` with `Pages.Organization.Conflict.Version`.
- Soft-delete tests must assert logical deletion/status/filtering and must not expect physical row deletion.
- Unit tests must mock output ports only; domain objects are real instances.

## 8. Execution command

| command | purpose |
|---|---|
| `cd EDCAP_BE && mvn test` | Runs BE unit tests and existing Surefire tests. |
| `cd EDCAP_BE && mvn test -Dtest=OrganizationServicePhase6Test` | Runs Organization service unit tests only. |
| `cd EDCAP_BE && mvn verify` | Runs Failsafe integration tests, including controller and PostgreSQL migration tests. Requires Docker for Testcontainers. |
| `cd EDCAP_BE && mvn verify -Dit.test=OrganizationControllerIntegrationTest` | Runs Organization controller integration/slice test only. |
| `cd EDCAP_BE && mvn verify -Dit.test=OrganizationMigrationIntegrationTest` | Runs Flyway/PostgreSQL migration test only. Requires Docker. |
| `cd EDCAP_FE && npx vitest run src/__tests__/App.test.tsx` | Runs FE route/auth unit tests. Requires full FE source checkout. |
| `cd EDCAP_FE && npx vitest run src/__tests__/organization/organization-api.test.ts` | Runs Organization FE API helper tests. Requires full FE source checkout. |
| `cd EDCAP_FE && npx vitest run src/__tests__/organization/OrganizationPage.test.tsx` | Runs OrganizationPage component tests. Requires full FE source checkout. |
| `cd EDCAP_FE && npx playwright test e2e_tests/tests/organization/organization.spec.ts` | Runs Organization E2E. Requires BE/FE/DB running and `EDCAP_E2E_SESSION_COOKIE`. |
| `cd EDCAP_FE && EDCAP_E2E_SESSION_COOKIE=<admin-jsessionid> npx playwright test e2e_tests/tests/organization/organization.spec.ts` | Example Organization E2E execution with authenticated ADMIN session. |

## 9. Stop Condition

- Stop if Maven cannot compile BE test sources.
- Stop if `LayerEnforcementTest` fails after adding Organization tests.
- Stop if Organization service allows non-ADMIN read/write.
- Stop if BE returns success for duplicate active Organization code/name where rejection is expected.
- Stop if PostgreSQL migration does not create required Organization columns/indexes or allows duplicate active code/name.
- Stop if stale version update/delete does not return conflict.
- Stop if soft delete expects or performs physical deletion.
- Stop if FE typed API helper no longer sends expected endpoints/body.
- Stop if OrganizationPage no longer calls create/update/delete with the row version.
- Stop if E2E cannot authenticate as ADMIN in the target environment.

## 10. Required Human Decision

| decision | status | note |
|---|---|---|
| FE source availability | Required | Latest uploaded archive is missing `EDCAP_FE/src` and `package.json`. Apply FE test files to the complete FE checkout before running FE UT. |
| E2E admin session | Required | Provide `EDCAP_E2E_SESSION_COOKIE` for a real ADMIN session. |
| E2E runtime URLs | Required | Provide `EDCAP_E2E_API_BASE_URL` and `EDCAP_E2E_UI_BASE_URL` if not using defaults `http://localhost:8080` and `http://localhost:5173`. |
| Docker availability for DB migration IT | Required | `OrganizationMigrationIntegrationTest` uses Testcontainers PostgreSQL. CI/local must have Docker available. |
| Manual black-box sign-off | Required before release | Execute browser test cases and record evidence in `test-results.md`. |

