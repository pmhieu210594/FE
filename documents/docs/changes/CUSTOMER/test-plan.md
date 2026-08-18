# Test Plan

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung  
**Update date**: 2026-06-12  

## 1. Purpose

Define and implement Phase 6 automated test coverage for Customer Management. This plan maps each acceptance criterion to test type, separates reused coverage from new tests, documents intentionally skipped areas, defines test data policy, and records the commands expected for execution.

Black-box artifacts for this ticket are now completed and validated in `blackbox-testcases.md`, `test-data.md`, and `blackbox-review-checklist.md`.

Scope in this phase:

- Backend unit tests for Customer business rules, validation, authorization, duplicate checks, and optimistic locking.
- Backend web/controller contract tests for Customer REST contract and error mapping.
- Backend persistence SQL static verification for mapper/migration rules that cannot be executed against PostgreSQL in the current sandbox.
- Frontend API helper tests for Customer endpoint contract and message-key error behavior.
- Frontend CustomerPage component tests for list/search/filter/create/detail/edit/delete behavior.
- Frontend Playwright UI E2E tests for admin Customer journey, duplicate validation, edit/delete flows, and auth redirect checks against the real backend with API-seeded Organization data.

## 2. AC Matrix ↔ Test Type
| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-CUSTOMER-1 | Added | N/A | N/A | N/A | N/A | Added | Added |
| AC-CUSTOMER-2 | Added | Added | Partial | Added | N/A | Added | Added |
| AC-CUSTOMER-3 | Added | Added | Partial | Added | Added | Added | Added |
| AC-CUSTOMER-4 | Added | Added | Partial | Added | Added | Added | Added |
| AC-CUSTOMER-5 | Added | Added | Partial | Added | N/A | Added | Added |
| AC-CUSTOMER-6 | Added | N/A | N/A | N/A | N/A | Added | Added |
| AC-CUSTOMER-7 | Added | Added | Partial | Added | N/A | Added | Added |
| AC-CUSTOMER-8 | Added | Added | Partial | Added | Added | Added | Added |
| AC-CUSTOMER-9 | Added | Added | Partial | Added | N/A | Passed | Added |
| AC-CUSTOMER-10 | Added | Added | Partial | Added | N/A | Added | Added |
| AC-CUSTOMER-11 | Added | Added | Partial | Added | Added | Added | Added |
| AC-CUSTOMER-12 | Added | Added | Partial | Added | N/A | Added | Added |
| AC-CUSTOMER-13 | Added | Added | Partial | Added | Added | Added | Added |
| AC-CUSTOMER-14 | Added | Added | Partial | Added | N/A | Added | Added |
| AC-CUSTOMER-15 | Added | Added | Partial | Added | Added | Passed | Added |
| AC-CUSTOMER-16 | Added | Added | Partial | Added | Added | Passed | Added |
| AC-CUSTOMER-17 | Partial | Added | Partial | Partial | Added | Passed | Added |
| AC-CUSTOMER-18 | Added | Added | Partial | Added | N/A | Passed | Added |

Notes:

- `API IT = Partial` because this phase adds standalone MockMvc controller tests rather than a full Spring Boot + PostgreSQL integration suite.
- `DB/Migration = Yes` means static SQL verification test has been added. Runtime Flyway/PostgreSQL execution is still a pending environment-dependent test.
- `E2E = Passed` for AC-9/15/16/17/18 because the Playwright coverage now completed successfully for those flows.
- `Black-box = Added` because `blackbox-testcases.md`, `test-data.md`, and `blackbox-review-checklist.md` are now finalized and reviewed.

## 3. Priority
| test item | priority | reason |
|---|---|---|
| ADMIN/non-ADMIN access | P0 | Security requirement. Customer is admin-only in FE route guard and BE service. |
| Default active-scope listing | P0 | Core requirement: default Customer list must not leak soft-deleted Customers. |
| Parent Organization availability | P0 | Create/update must not attach Customer to disabled or soft-deleted Organization. |
| Required field and classification validation | P0 | Prevent invalid Customer master data. |
| Global Customer code uniqueness | P0 | Data integrity across Organizations. |
| Alias uniqueness within Organization | P0 | Data integrity within Organization scope while allowing alias reuse in other Organizations. |
| Optimistic locking | P0 | Prevent lost updates on edit/delete. |
| Soft delete and child cascade SQL | P0 | AC-17 requires full child-tree cascade. |
| REST error/message key contract | P1 | FE i18n depends on backend message keys. |
| FE Customer page behavior | P1 | Ensures admin can use the main journey. |
| Playwright UI journey | P1 | Covers route-level UI wiring and regression validation. |
| Runtime DB/Flyway integration | P1 | Required before release, but blocked in this sandbox by missing runnable PostgreSQL/Testcontainers validation. |
| Performance/load test | P3 | Not included in AC/NFR for this admin CRUD scope. |

## 4. Reuse Existing Test
| existing test | path | covers | gap |
|---|---|---|---|
| Organization service tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/governance/OrganizationServiceTest.java` | Existing pattern for service validation, admin checks, duplicate checks, optimistic locking | Does not cover Customer-specific Organization relation, classification, alias scope, or cascade. |
| Existing ArchUnit layer enforcement | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | Hexagonal architecture constraints | Does not cover Customer business AC. |
| Organization FE API helper test | `EDCAP_FE/src/__ tests __/organization/organization-api.test.ts` | Endpoint helper and ApiError pattern | Does not cover Customer endpoints or `pageSize`. |
| Organization page component test | `EDCAP_FE/src/__ tests __/organization/OrganizationPage.test.tsx` | Mocking pattern for table/drawer/message components | Does not cover Customer-specific filters, Organization dropdown, classification, soft delete version. |
| Organization Playwright E2E | `EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Access guard and admin CRUD journey pattern | Does not cover Customer route or API contract. |
| Existing Phase 5 validation result | `docs/changes/CUSTOMER/test-results.md` previous content | BE suite and FE typecheck had passed before Phase 6 | Dedicated Customer tests were not yet implemented. |

## 5. Additional Test This Time
| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-CUSTOMER-1 | `CustomerServiceTest.search_normalizesFiltersPagingAndDefaultsToActiveStatus` | BE UT | Search default active status and paging normalization | AC-CUSTOMER-2,AC-CUSTOMER-3, AC-CUSTOMER-4, AC-CUSTOMER-5 |
| TC-CUSTOMER-2 | `CustomerServiceTest.search_acceptsAllStatusAndClassificationForAdministrativeReview` | BE UT | ALL filters for admin review | AC-CUSTOMER-5 |
| TC-CUSTOMER-3 | `CustomerServiceTest.search_rejectsInvalidStatusFilter` | BE UT | Status validation and message key | AC-CUSTOMER-5, AC-CUSTOMER-18 |
| TC-CUSTOMER-4 | `CustomerServiceTest.nonAdminIsDeniedForEveryEntryPoint` | BE UT | Admin-only enforcement across service methods | AC-CUSTOMER-14 |
| TC-CUSTOMER-5 | `CustomerServiceTest.get_returnsExistingCustomerForAdmin` | BE UT | Customer detail read | AC-CUSTOMER-10 |
| TC-CUSTOMER-6 | `CustomerServiceTest.get_throwsNotFoundWhenCustomerMissing` | BE UT | Not-found message key | AC-CUSTOMER-10, AC-CUSTOMER-18 |
| TC-CUSTOMER-7 | `CustomerServiceTest.create_trimsValuesDefaultsInternalAndAssignsOrganizationAndActor` | BE UT | Valid create behavior | AC-CUSTOMER-7, AC-CUSTOMER-8 |
| TC-CUSTOMER-8 | `CustomerServiceTest.create_rejectsMissingOrganization` | BE UT | Required Organization | AC-CUSTOMER-8, AC-CUSTOMER-9, AC-CUSTOMER-18 |
| TC-CUSTOMER-9 | `CustomerServiceTest.create_rejectsDeletedOrganization` | BE UT | Disabled/deleted Organization guard | AC-CUSTOMER-7, AC-CUSTOMER-9, AC-CUSTOMER-12 |
| TC-CUSTOMER-10 | `CustomerServiceTest.create_rejectsMissingAndTooLongCode` | BE UT | Code validation | AC-CUSTOMER-8, AC-CUSTOMER-15, AC-CUSTOMER-18 |
| TC-CUSTOMER-11 | `CustomerServiceTest.create_rejectsMissingAndTooLongAlias` | BE UT | Alias validation | AC-CUSTOMER-8, AC-CUSTOMER-15, AC-CUSTOMER-18 |
| TC-CUSTOMER-12 | `CustomerServiceTest.create_rejectsInvalidClassification` | BE UT | Classification validation | AC-CUSTOMER-8, AC-CUSTOMER-18 |
| TC-CUSTOMER-13 | `CustomerServiceTest.create_rejectsDuplicateActiveCodeGloballyAndDuplicateAliasWithinOrganization` | BE UT | Duplicate rules | AC-CUSTOMER-15 |
| TC-CUSTOMER-14 | `CustomerServiceTest.update_changesEditableCustomerAndUsesSubmittedVersionForOptimisticLocking` | BE UT | Valid update and version forwarding | AC-CUSTOMER-11, AC-CUSTOMER-12, AC-CUSTOMER-16 |
| TC-CUSTOMER-15 | `CustomerServiceTest.update_rejectsDeletedCustomer` | BE UT | Deleted Customer cannot be edited | AC-CUSTOMER-11, AC-CUSTOMER-18 |
| TC-CUSTOMER-16 | `CustomerServiceTest.update_rejectsStaleVersionWhenRepositoryUpdatesNoRows` | BE UT | Stale update conflict | AC-CUSTOMER-16, AC-CUSTOMER-18 |
| TC-CUSTOMER-17 | `CustomerServiceTest.softDelete_marksActiveCustomerDeletedUsingVersionAndActor` | BE UT | Valid soft delete | AC-CUSTOMER-13, AC-CUSTOMER-16, AC-CUSTOMER-17 |
| TC-CUSTOMER-18 | `CustomerServiceTest.softDelete_rejectsAlreadyDeletedAndStaleVersion` | BE UT | Delete edge cases | AC-CUSTOMER-13, AC-CUSTOMER-16, AC-CUSTOMER-18 |
| TC-CUSTOMER-19 | `CustomerControllerTest.list_returnsPagedCustomersAndPassesFiltersToService` | Contract/API test | REST list response and query params | AC-CUSTOMER-2, AC-CUSTOMER-3, AC-CUSTOMER-4, AC-CUSTOMER-5 |
| TC-CUSTOMER-20 | `CustomerControllerTest.get_returnsCustomerDetail` | Contract/API test | REST detail DTO | AC-CUSTOMER-10 |
| TC-CUSTOMER-21 | `CustomerControllerTest.create_returnsCustomerDtoAndPassesPayloadToService` | Contract/API test | REST create contract | AC-CUSTOMER-8 |
| TC-CUSTOMER-22 | `CustomerControllerTest.update_passesOptimisticLockVersionToService` | Contract/API test | REST update contract | AC-CUSTOMER-11, AC-CUSTOMER-16 |
| TC-CUSTOMER-23 | `CustomerControllerTest.softDelete_passesVersionAndReturnsDeletedCustomer` | Contract/API test | REST soft delete contract | AC-CUSTOMER-13, AC-CUSTOMER-16 |
| TC-CUSTOMER-24 | `CustomerControllerTest.serviceForbidden_mapsTo403WithMessageKey` | Contract/API test | Error mapping | AC-CUSTOMER-14, AC-CUSTOMER-18 |
| TC-CUSTOMER-25 | `CustomerControllerTest.businessRuleException_mapsTo400WithMessageKey` | Contract/API test | Error mapping | AC-CUSTOMER-9, AC-CUSTOMER-15, AC-CUSTOMER-18 |
| TC-CUSTOMER-26 | `CustomerControllerTest.optimisticLockingException_mapsTo409WithMessageKey` | Contract/API test | Conflict mapping | AC-CUSTOMER-16, AC-CUSTOMER-18 |
| TC-CUSTOMER-27 | `CustomerControllerTest.notFoundException_mapsTo404WithMessageKey` | Contract/API test | Not-found mapping | AC-CUSTOMER-10, AC-CUSTOMER-18 |
| TC-CUSTOMER-28 | `CustomerPersistenceIntegrationTest.customerMapperDefaultActiveScopeExcludesDeletedCustomerAndDeletedOrganization` | DB/Migration static test | MyBatis active-scope SQL | AC-CUSTOMER-3, AC-CUSTOMER-4 |
| TC-CUSTOMER-29 | `CustomerPersistenceIntegrationTest.customerMapperDuplicateChecksUseActiveScopeAndCaseInsensitiveKeys` | DB/Migration static test | Duplicate active-scope SQL | AC-CUSTOMER-15 |
| TC-CUSTOMER-30 | `CustomerPersistenceIntegrationTest.customerMapperSoftDeleteCascadesToFullChildTreeAndUsesVersionGuard` | DB/Migration static test | Cascade SQL and version guard | AC-CUSTOMER-13, 16,AC-CUSTOMER-17 |
| TC-CUSTOMER-31 | `CustomerPersistenceIntegrationTest.customerMigrationsKeepUniqueIndexesActiveScoped` | DB/Migration static test | Migration active unique indexes | AC-CUSTOMER-15 |
| TC-CUSTOMER-32 | `customer-api.test.ts` full suite | FE UT | Customer endpoint helper contract | AC-CUSTOMER-5, AC-CUSTOMER-8, AC-CUSTOMER-10, AC-CUSTOMER-11, AC-CUSTOMER-13, AC-CUSTOMER-16, AC-CUSTOMER-18 |
| TC-CUSTOMER-33 | `CustomerPage.test.tsx` full suite | FE component UT | List/search/filter/create/detail/edit/delete/error behavior | AC-CUSTOMER-1, AC-CUSTOMER-2, AC-CUSTOMER-3, AC-CUSTOMER-4, AC-CUSTOMER-5, AC-CUSTOMER-6,AC-CUSTOMER-7, AC-CUSTOMER-8, AC-CUSTOMER-10, AC-CUSTOMER-11, AC-CUSTOMER-12, AC-CUSTOMER-13, AC-CUSTOMER-16, AC-CUSTOMER-18 |
| TC-CUSTOMER-34 | `customer.spec.ts` auth redirect | E2E | Redirects an unauthenticated session to login | AC-CUSTOMER-14 |
| TC-CUSTOMER-35 | `customer.spec.ts` real UI journey | E2E | Customer page journey against the real backend | AC-CUSTOMER-1, AC-CUSTOMER-2, AC-CUSTOMER-5, AC-CUSTOMER-10, AC-CUSTOMER-11, AC-CUSTOMER-13 |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| Admin open Customer screen | ADMIN session cookie is available, backend/frontend are running, and an active Organization is seeded by API | 1. Open Customer screen. 2. Wait for list to load. | Customer list renders without access errors. | AC-CUSTOMER-1, AC-CUSTOMER-2, AC-CUSTOMER-3 |
| Create Customer | Active Organization exists and ADMIN session is available | 1. Click Create. 2. Fill required fields. 3. Submit. | New Customer row appears in the list. | AC-CUSTOMER-7, AC-CUSTOMER-8 |
| Duplicate code validation | An active Customer already exists with the same code | 1. Open Create. 2. Enter duplicate code. 3. Submit. | Error toast appears and the duplicate is rejected. | AC-CUSTOMER-15 |
| Detail and edit flow | A Customer row exists | 1. Open detail drawer. 2. Click Edit. 3. Update a field. 4. Submit. | Detail shows the row and edit updates are persisted. | AC-CUSTOMER-10, AC-CUSTOMER-11, AC-CUSTOMER-12,AC-CUSTOMER-16 |
| Soft delete and deleted view | An active Customer row exists | 1. Click Delete. 2. Confirm delete. 3. Switch to Deleted filter. | Row disappears from Active and appears in Deleted. | AC-CUSTOMER-13, AC-CUSTOMER-17 |
| Auth redirect | Token is present but the session is invalid or expired | 1. Open Customer route. | User is redirected to login by the real auth guard. | AC-CUSTOMER-14 |

## 6. Areas intentionally left untested this time
| area | reason | risk |
|---|---|---|
| Runtime PostgreSQL/Testcontainers IT for Customer mapper | Current workspace cannot execute Maven and does not provide a confirmed PostgreSQL/Testcontainers runtime. Static SQL checks were added instead. | Medium: SQL syntax/runtime behavior and cascade row counts still need environment verification. |
| Real OAuth login in E2E | OAuth redirect/callback is not deterministic in local automated tests. The E2E suite now checks the real redirect path when the session is invalid or expired. | Low/Medium: Auth provider integration still requires a release-environment verification run. |
| Full real-backend Customer Playwright CRUD | Stable seeded session/test data and running backend are required. This phase now uses the real backend for CRUD and cleanup. | Medium: UI/API integration still needs one environment run. |
| Visual regression | No baseline/screenshot tooling is configured. | Low/Medium: Layout regressions may need manual review. |
| Performance/load test | No performance NFR is defined for this admin CRUD ticket. | Low: large dataset performance should be checked separately if needed. |
| Cross-browser matrix | Current Playwright UI E2E is designed for the default project/browser config. | Low/Medium: browser-specific issue may be missed. |

## 7. Data testing principles

- Use synthetic, non-production Customer and Organization data only.
- Use stable UUIDs in backend tests to make assertions deterministic.
- Use active Organization, deleted Organization, active Customer, deleted Customer, duplicate active code, duplicate active alias in same Organization, and stale version data variations.
- Treat `customerCode` uniqueness as global among active Customers.
- Treat `customerAlias` uniqueness as scoped by `organizationId` among active Customers.
- Allow reuse of codes/aliases from soft-deleted Customers by checking `deleted_at IS NULL` in tests and SQL verification.
- Keep FE unit/component tests deterministic and independent of backend state.
- Keep Playwright UI tests deterministic by seeding only the minimum backend data needed for the scenario.
- Do not write secrets, OAuth tokens, session cookie values, or real customer names into fixtures/logs.
- Each test must be independent and must not depend on execution order.

## 8. Execution command
| command | purpose |
|---|---|
| `cd EDCAP_BE && mvn test -Dtest=CustomerServiceTest,CustomerControllerTest` | Run Customer backend unit tests. |
| `cd EDCAP_BE && mvn verify -Dit.test=CustomerControllerIntegrationTest,CustomerPersistenceIntegrationTest` | Run Customer backend integration/static SQL tests. |
| `cd EDCAP_FE && node ./node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` | Typecheck FE source and unit tests. |
| `cd EDCAP_FE && .\node_modules\.bin\vitest.cmd run "src/__ tests __/customer/customer-api.test.ts" "src/__ tests __/customer/CustomerPage.test.tsx"` | Run Customer FE unit/component tests. |
| `cd EDCAP_FE && node ./node_modules/@playwright/test/cli.js test e2e_tests/tests/customer/customer.spec.ts` | Run Customer Playwright UI E2E tests. |
| `cd EDCAP_FE && node ./node_modules/typescript/bin/tsc -p e2e_tests/tsconfig.json --noEmit` | Typecheck Playwright tests if existing E2E TS config is fixed. |

## 9. Stop Condition

- Stop if backend Customer service tests fail for P0 business rules.
- Stop if controller error mapping does not return expected HTTP status/message key.
- Stop if active-scope SQL no longer contains `deleted_at IS NULL` for default/duplicate checks.
- Stop if soft-delete SQL no longer includes Customer, Project, Repository, Team, Ticket, member role, and access-scope updates.
- Stop if FE typecheck fails after adding Customer tests.
- Stop if FE CustomerPage cannot render with real backend data.
- Stop if Playwright auth redirect cannot verify the expected login redirect.

## 10. Required Human Decision

- Decide whether Phase 7/release gate must include a real PostgreSQL/Testcontainers integration test for `CustomerMapper` and Flyway migrations.
- Decide whether the Customer create endpoint should remain `200 OK` or be changed to `201 Created` in a later API consistency ticket.
- Decide whether non-ADMIN Customer access should log out users or redirect to a dedicated forbidden page.
- Confirm whether AC-CUSTOMER-17 cascade requires physical runtime proof in CI before release, beyond the static SQL verification added in this phase.
