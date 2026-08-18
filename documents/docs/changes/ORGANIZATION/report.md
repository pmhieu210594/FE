# Final Report

**Ticket ID**: ORGANIZATION
**Create date**: 2026-06-10
**Author**: nk_trung
**Update date**: 2026-06-11

## 1. Edited summary

Organization Management was implemented end-to-end for FE, BE, and DB migration support. The screen now supports list/search/filter/create/detail/edit/soft-delete flows, ADMIN-only access, optimistic locking with `version`, localized FE error display, and locale-aware date formatting via `src/utils/dayjs`.

## 2. Corresponding specification / AC

| ACID | status | evidence |
|---|---|---|
| AC-ORGANIZATION-1 | PASS | FE route/page default active list, BE list API, and E2E list smoke passed. |
| AC-ORGANIZATION-2 | PASS | Search by code/name covered by FE unit/component tests and Playwright E2E. |
| AC-ORGANIZATION-3 | PASS | Active/Deleted/All filtering covered by FE tests and E2E. |
| AC-ORGANIZATION-4 | PASS | Create flow covered by FE, BE, and E2E tests. |
| AC-ORGANIZATION-5 | PASS | Duplicate code rejection and soft-deleted reuse covered by service/API/DB and E2E. |
| AC-ORGANIZATION-6 | PASS | Duplicate name rejection and soft-deleted reuse covered by service/API/DB and E2E. |
| AC-ORGANIZATION-7 | PASS | Update code path uses `version`; duplicate and stale conflict behavior verified. |
| AC-ORGANIZATION-8 | PASS | Update name path uses `version`; duplicate and stale conflict behavior verified. |
| AC-ORGANIZATION-9 | PASS | Soft delete uses `PATCH /api/v1/organizations/{id}/delete` and preserves the row. |
| AC-ORGANIZATION-10 | PASS | Deleted records are hidden by default and shown read-only in Deleted mode. |
| AC-ORGANIZATION-11 | PASS | FE non-ADMIN logout/redirect and BE 403 behavior verified. |
| AC-ORGANIZATION-12 | PASS | TraceId/error envelope preserved; dedicated audit log remains out of scope. |
| AC-ORGANIZATION-13 | PASS | Stale `version` returns 409 conflict and does not overwrite/delete. |

## 3. Scope of influence

- FE route, navigation, Organization page, API helpers, locale JSON, and localized date formatting.
- BE controller, service, repository port/adapter/mapper, DTOs, security/exception handling, and migration.
- DB schema for `tbl_dim_organization` with new code, description, delete metadata, version, and partial unique indexes.
- Tests and docs for Organization review, test plan, results, and black-box evidence.

## 4. Implementation content

| file | summary | reasons |
|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V5__alter_tbl_dim_organization_for_management.sql` | Additive Organization migration with new columns, indexes, and backfill policy | Preserve `tbl_dim_organization` and existing data |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Organization.java` | Organization domain model | Domain representation for the new feature |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java` | Organization business rules and optimistic locking | Centralize validation, duplicate checks, and soft delete |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/OrganizationRepositoryPort.java` | Persistence port | Keep hexagonal layering intact |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/OrganizationRepositoryAdapter.java` | MyBatis-backed port adapter | DB access implementation |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/OrganizationMapper.java` and `EDCAP_BE/src/main/resources/mapper/OrganizationMapper.xml` | Organization SQL mapping | Search, create, update, delete, and version checks |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | Organization REST API | FE/BE contract surface |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/OrganizationDtos.java` | Request/response DTOs | Contract alignment |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Standard 403/409 error handling | Preserve message-key/traceId contract |
| `EDCAP_FE/src/App.tsx` | Organization route and ADMIN guard | Screen access control |
| `EDCAP_FE/src/components/Layout.tsx` | Organization nav item | Admin navigation |
| `EDCAP_FE/src/pages/OrganizationPage.tsx` | Organization list/detail/form/delete UI | Main FE workflow |
| `EDCAP_FE/src/lib/api.ts` | Typed Organization API helpers and PATCH support | Centralized FE API access |
| `EDCAP_FE/src/lib/utils.ts` and `EDCAP_FE/src/lib/dayjs.ts` | Locale-aware date formatting | Format dates using `src/utils/dayjs` locale files |
| `EDCAP_FE/public/locales/en/locale.json`, `ja/locale.json`, `vi/locale.json` | Organization translations | FE i18n coverage |
| `EDCAP_FE/src/__tests__/App.test.tsx`, `organization-api.test.ts`, `OrganizationPage.test.tsx`, `lib/utils.test.ts` | FE automated tests | Route/auth/API/UI/date formatting verification |
| `EDCAP_BE/src/test/UnitTest/.../OrganizationServiceTest.java`, `EDCAP_BE/src/test/IntegrationTest/.../OrganizationControllerIntegrationTest.java`, `EDCAP_BE/src/test/IntegrationTest/.../OrganizationMigrationIntegrationTest.java` | BE automated tests | Service, controller, and migration verification |
| `EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Playwright E2E | CRUD, duplicate, conflict, permission, and delete flows |
| `docs/changes/ORGANIZATION/test-results.md` | Updated test evidence | Handoff artifact |
| `docs/changes/ORGANIZATION/promotion-candidates.md` | Promotion candidates | Handoff artifact |

## 5. Review results

| review type | result | notes |
|---|---|---|
| Self Review | PASS | Implementation and automated checks are in place, and local execution confirms the BE migration IT now passes in this workspace. |
| Independent AI Review | PASS | Local source inspection, docs, and test evidence are coherent. |
| Human Review | APPROVED | Human sign-off was confirmed on 2026-06-15. |

## 6. Test results

| test type | result | evidence |
|---|---|---|
| BE unit tests | PASS | `mvn test -Dtest=OrganizationServiceUnitTest` and related BE unit coverage. |
| BE controller integration tests | PASS | `mvn verify "-Dit.test=OrganizationControllerIntegrationTest"`. |
| BE migration integration test | PASS | `mvn verify "-Dit.test=OrganizationMigrationIntegrationTest"` passed in this workspace. |
| FE unit/component tests | PASS | Vitest passed for `App.test.tsx`, `organization-api.test.ts`, `OrganizationPage.test.tsx`, and `lib/utils.test.ts`. |
| FE E2E | PASS | Playwright Organization E2E passed with the ADMIN session cookie. |
| Black-box tests | PASS with deferred audit/log scope | 31 executable cases passed, 2 audit/log cases marked N/A. |

## 7. Security / operations perspective

- Organization access is ADMIN-only in both FE and BE.
- Direct non-ADMIN API calls are rejected with standard `403 Forbidden`.
- FE translates backend message keys before display; raw backend errors are not shown.
- The DB migration is additive and keeps `tbl_dim_organization` and `name_masked` intact.
- Dedicated audit-log storage remains out of scope for this ticket.
- E2E and cleanup flows use synthetic `E2E_ORG_` test data prefixes to avoid contaminating real data.

## 8. Accepted Risk

| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| No additional accepted risk remains for the Organization implementation in this workspace | All required local checks now passed, including migration IT | Dev/CI | N/A | Tech Lead |

## 9. Open Issues

| issue | impact | next action |
|---|---|---|

## 10. Human Decisions

| decision | owner | result |
|---|---|---|
| Keep `tbl_dim_organization` and `name_masked` unchanged | User | Preserved |
| Use PATCH for soft delete | Human / Tech Lead | Implemented |
| Use numeric optimistic locking with `version` | Human / Tech Lead | Implemented |
| Allow reuse of code/name from soft-deleted records | Human / PM / Tech Lead | Implemented |
| Treat dedicated audit log as out of scope | Human / Tech Lead | Implemented as accepted risk |
| Non-ADMIN FE access should logout and redirect to `/:lang/login` | Human / PM / FE Lead | Implemented |
| Keep FE translations in `public/locales/{en,ja,vi}/locale.json` | Human / FE Lead | Implemented |

## 11. Source Analysis Limitations

- The final review is based on local source inspection, command output, and existing docs rather than a separate human sign-off record.

## 12. What worked

- Additive migration and partial unique indexes matched the soft-delete reuse requirement.
- FE route/auth/API tests passed, including the locale-aware date formatting helper.
- Playwright E2E covered the main CRUD, duplicate, delete, conflict, and permission flows.
- Black-box cases gave a usable end-to-end validation story for the Organization UI.

## 13. What failed

- No separate human sign-off record is needed beyond the signed human-review artifact in this workspace.

## 14. Candidate updates Failure Mode Index

- Locale key typos or missing `Pages.Organization.*` entries can surface raw keys in the UI.
- Stale `version` handling can regress if update/delete SQL is not atomic.
- Soft-delete reuse can break if partial unique indexes stop filtering on `deleted_at IS NULL`.
- Non-admin route logout/redirect can loop if the guard is not idempotent.

## 15. Candidate updates Living Docs

- `docs/architecture/route-api-map.md`: add Organization route and API entries.
- `docs/architecture/fe-be-contract-map.md`: add Organization DTO/error contract mapping.
- `docs/architecture/repository-db-map.md`: add `tbl_dim_organization` mapping and partial unique indexes.
- `docs/architecture/test-map.md`: add Organization BE/FE/E2E/black-box coverage summary.

## 16. Final Verdict

- DONE
