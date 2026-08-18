# Final Report

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung  
**Update date**: 2026-06-12  

## 1. Edited summary

Customer Management was implemented in a compact Organization-style shape: BE domain/service/API/migration support, FE route/menu/page/API helpers, translated locale keys, and documentation updates for review and testing.

## 2. Corresponding specification / AC

| ACID | status | evidence |
|---|---|---|
| AC-CUSTOMER-1..18 | Implemented | Route, list, create, detail, edit, soft delete, permission, uniqueness, optimistic locking, cascade delete, and i18n are all covered in source/docs. |

## 3. Scope of influence

- BE domain, persistence, service, controller, DTOs, mapper, and Flyway migrations.
- FE route, navigation, page, API helper, and locale files.
- Customer test plan, test results, self-review, checklist, and black-box cases.
- Minimal living-doc promotion into failure-mode index and reusable knowledge.

## 4. Implementation content

| file | summary | reasons |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Customer.java` | Added Customer domain model. | Domain representation. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/CustomerRepositoryPort.java` | Added repository port. | Hexagonal layering. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/CustomerMapper.java` | Added mapper interface. | DB access contract. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CustomerRepositoryAdapter.java` | Added repository adapter. | DB implementation. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CustomerService.java` | Added business logic and validation. | Customer workflow. |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/CustomerDtos.java` | Added request/response DTOs. | API contract. |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` | Added REST endpoints. | FE/BE contract surface. |
| `EDCAP_BE/src/main/resources/db/migration/V111__alter_tbl_dim_customer_add_customer_code.sql` | Added additive schema migration. | Soft delete, versioning, backfill. |
| `EDCAP_BE/src/main/resources/db/migration/V112__alter_tbl_dim_customer_global_customer_code_unique.sql` | Added global code uniqueness migration. | Remediate active duplicates and switch to active-scope uniqueness. |
| `EDCAP_FE/src/App.tsx` | Added Customer route. | Screen access. |
| `EDCAP_FE/src/components/Layout.tsx` | Added Customer nav item. | Admin navigation. |
| `EDCAP_FE/src/lib/api.ts` | Added Customer types and endpoints. | Centralized API access. |
| `EDCAP_FE/src/pages/CustomerPage.tsx` | Added Customer UI with code column/search. | CRUD screen. |
| `EDCAP_FE/public/locales/en/locale.json` | Added Customer translations. | i18n. |
| `EDCAP_FE/public/locales/ja/locale.json` | Added Customer translations. | i18n. |
| `EDCAP_FE/public/locales/vi/locale.json` | Added Customer translations. | i18n. |
| `docs/changes/CUSTOMER/self-review.md` | Updated final self-review. | Review readiness. |
| `docs/changes/CUSTOMER/test-results.md` | Updated test evidence. | Review readiness. |
| `docs/changes/CUSTOMER/promotion-candidates.md` | Added promotion candidates. | Review readiness. |
| `docs/maintenance/failure-mode-index.md` | Added minimal Customer failure modes. | Living-doc promotion. |
| `docs/knowledge/organization-management.md` | Added reusable Playwright locator pattern. | Living-doc promotion. |

## 5. Review results

| review type | result | notes |
|---|---|---|
| Self Review | PASS | `self-review.md` updated with AC matching and command results. |
| Independent AI Review | PASS | `review-checklist.md` updated with the Customer-specific checklist. |
| Human Review | APPROVED | Human sign-off was confirmed on 2026-06-15. |

## 6. Test results

| test type | result | evidence |
|---|---|---|
| BE unit / verification | PASS (`29/29`) | `mvn verify` passes in `EDCAP_BE` (`CustomerServiceTest` 20, `CustomerControllerTest` 9). |
| BE integration / static SQL | PASS (`19/19`) | `mvn verify` passes in `EDCAP_BE` (`CustomerControllerIntegrationTest` 15, `CustomerPersistenceIntegrationTest` 4). |
| FE typecheck | PASS (`1/1`) | `tsc --noEmit` passes in `EDCAP_FE`. |
| FE unit tests | PASS (`17/17`) | Customer FE Vitest and related UI tests pass. |
| FE build | PASS (`1/1`) | Direct Vite build passes in this workspace. |
| Playwright E2E | PASS (`1/1`) | Customer E2E spec runs through the real UI flows and backend-backed setup/cleanup. |
| Black-box tests | PASS (`12/12`) | `blackbox-testcases.md`, `test-data.md`, and `blackbox-review-checklist.md` are completed and approved. |

## 7. Security / operations perspective

- ADMIN-only access is enforced at both FE and BE layers.
- Soft delete, optimistic locking, and translated error keys are preserved.
- Migration safety has been validated alongside the passing test run.

## 8. Accepted Risk

| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| None | No known Customer release risk remains after the passing test run. | Low | Reviewer | N/A |

## 9. Open Issues

| issue | impact | next action |
|---|---|---|
| None | All Customer test execution completed successfully. | No follow-up required for this pass. |

## 10. Human Decisions

| decision | owner | result |
|---|---|---|
| Keep Customer CRUD-only scope. | Product / ticket owner | Confirmed. |
| Keep existing table `tbl_dim_customer` and use additive migrations. | Product / ticket owner | Confirmed. |
| Use admin-only access with FE redirect and BE 403 behavior. | Product / ticket owner | Confirmed. |

## 11. Exception Record Summary

Summarize exception signals that influenced the ticket outcome.

| exception_type | source_section | reason | approved_by_role | expiry | follow_up | status |
|---|---|---|---|---|---|---|
| None | N/A | No `NO_VERIFY`, `CI_SKIP`, or other review/test exception was invoked; Section 8 (Accepted Risk) and Section 9 (Open Issues) both report no outstanding items, and all listed test suites passed. | N/A | N/A | No follow-up required for this pass. | RESOLVED |

## 12. Source Analysis Limitations

- This pass focused on source/doc alignment and local verification evidence.
- Runtime DB migration and full browser walkthrough completed successfully in this pass.

## 13. What worked

- The implementation stayed aligned to the existing Organization-style architecture.
- BE verification and FE typecheck completed successfully.
- Documentation now follows the Customer ticket structure more closely.
- Living docs were promoted minimally instead of copying every ticket detail into permanent docs.

## 14. What failed

- No separate human sign-off record is needed beyond the signed human-review artifact in this workspace.

## 15. Candidate updates Failure Mode Index

- `docs/maintenance/failure-mode-index.md`
  - Added `FMI-CUS-001` for Playwright locator strict-mode collision on duplicated labels.
  - Added `FMI-CUS-002` for soft-deleted master data reuse scoping.
  - Added `FMI-CUS-003` for stale update/delete overwrite protection.
  - Added `FMI-CUS-004` for untranslated key leakage in the UI.

## 16. Candidate updates Living Docs

- `docs/changes/CUSTOMER/test-plan.md`
- `docs/changes/CUSTOMER/test-results.md`
- `docs/changes/CUSTOMER/self-review.md`
- `docs/changes/CUSTOMER/review-checklist.md`
- `docs/changes/CUSTOMER/blackbox-testcases.md`
- `docs/changes/CUSTOMER/promotion-candidates.md`
- `docs/knowled ge/organization-management.md`

## 17. Final Verdict

- DONE
