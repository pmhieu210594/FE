# Test Plan

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

## 1. Purpose

Define the verification scope for `USER-MANAGEMENT` after the documentation package was aligned with the template shape and current source/test intent.

This plan maps each acceptance criterion to the test types used for review and later runtime execution. The current pass is documentation-only, so several runtime commands remain `NOT_RUN` by design.

## 2. AC Matrix -> Test Type

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-USER-MANAGEMENT-1 | X |  |  |  |  | X | X |
| AC-USER-MANAGEMENT-2 | X | X | X | X |  | X | X |
| AC-USER-MANAGEMENT-3 | X |  | X |  |  | X | X |
| AC-USER-MANAGEMENT-4 | X | X | X |  |  | X | X |
| AC-USER-MANAGEMENT-5 | X | X | X | X | X | X | X |
| AC-USER-MANAGEMENT-6 | X | X | X | X | X | X | X |
| AC-USER-MANAGEMENT-7 |  | X | X |  | X |  | X |
| AC-USER-MANAGEMENT-8 | X | X | X | X | X | X | X |
| AC-USER-MANAGEMENT-9 |  | X | X |  | X |  | X |
| AC-USER-MANAGEMENT-10 | X | X | X |  |  | X | X |
| AC-USER-MANAGEMENT-11 |  | X | X |  | X |  | X |
| AC-USER-MANAGEMENT-12 | X |  | X | X |  | X | X |
| AC-USER-MANAGEMENT-13 | X |  | X | X |  | X | X |
| AC-USER-MANAGEMENT-14 | X | X | X | X | X | X | X |
| AC-USER-MANAGEMENT-15 |  | X | X |  | X |  | X |
| AC-USER-MANAGEMENT-16 | X | X | X | X | X | X | X |
| AC-USER-MANAGEMENT-17 |  | X | X |  | X |  | X |
| AC-USER-MANAGEMENT-18 | X | X | X | X | X | X | X |
| AC-USER-MANAGEMENT-19 |  |  | X |  |  | X | X |
| AC-USER-MANAGEMENT-20 |  | X | X |  |  |  | X |
| AC-USER-MANAGEMENT-21 | X |  | X | X |  | X | X |
| AC-USER-MANAGEMENT-22 |  |  |  |  |  |  | X |
| AC-USER-MANAGEMENT-23 |  |  |  |  |  |  | X |

## 3. Priority

| test item | priority | reason |
|---|---|---|
| ADMIN-only access and non-admin denial | P0 | Security boundary for account administration. |
| No password/passwordHash/token/secret exposure | P0 | Prevent credential and secret leakage. |
| Create account + linked member pseudonym | P0 | Core DB behavior for login identity and RBAC mapping. |
| `role_id` required and saved | P0 | Required for authorization after login. |
| `team_id = NULL` and no team payload | P0 | Explicit business decision; team assignment is out of scope. |
| Password bcrypt hash and reset password | P0 | Authentication security. |
| Last active ADMIN protection | P0 | Prevent admin lockout. |
| Duplicate username validation | P1 | Data integrity and user experience. |
| List/search/filter/pagination | P1 | Admin usability and page performance. |
| Deactivate/reactivate instead of hard delete | P1 | Reversible account lifecycle and traceability. |
| LOGIN regression with active/inactive account | P1 | Confirms created accounts are usable and deactivated accounts cannot login. |
| Formal audit verification | P3 | Formal audit is out of scope for this ticket. |

## 4. Reuse Existing Test

| existing test | path | covers | gap |
|---|---|---|---|
| Login/auth tests if present | `EDCAP_BE/src/test/**` and `EDCAP_FE/src/**/__tests__/**` | Existing LOGIN/current-user behavior | Need regression that active account created by USER-MANAGEMENT can login and inactive account cannot login. |
| Organization CRUD tests if present | `EDCAP_FE/src/**/Organization*.test.*` or equivalent | Table/form/modal CRUD UI pattern | Does not cover user-account security, role mapping, password reset, or `team_id = NULL`. |
| Existing API/controller/service tests | `EDCAP_BE/src/test/**` | Test style, mocking style, Spring/API conventions | Does not cover new admin user-account endpoints. |
| Existing E2E route tests if present | `EDCAP_FE/e2e_tests/**` | Login/navigation/test framework setup | Does not cover User Management route and ADMIN-only access. |

## 5. Additional Test This Time

| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-USER-MANAGEMENT-1 | `UserAccountAdminServicePhase6Test` | BE UT | Service validation, create/update/status, bcrypt, last-admin guard, `team_id = NULL` | AC-USER-MANAGEMENT-5, AC-USER-MANAGEMENT-7, AC-USER-MANAGEMENT-9, AC-USER-MANAGEMENT-11, AC-USER-MANAGEMENT-14, AC-USER-MANAGEMENT-15, AC-USER-MANAGEMENT-16, AC-USER-MANAGEMENT-17 |
| TC-USER-MANAGEMENT-2 | `UserAccountAdminApiIntegrationTest` | API IT | Admin API contract, security, no sensitive fields, detail/reset, safe error messages | AC-USER-MANAGEMENT-2, AC-USER-MANAGEMENT-12, AC-USER-MANAGEMENT-13, AC-USER-MANAGEMENT-18, AC-USER-MANAGEMENT-21 |
| TC-USER-MANAGEMENT-3 | `UserAccountFormConfig.test.ts` | FE UT | Form validation, no team field, role required, password/confirmPassword behavior | AC-USER-MANAGEMENT-6, AC-USER-MANAGEMENT-8, AC-USER-MANAGEMENT-10 |
| TC-USER-MANAGEMENT-4 | `UserAccountsPage.test.tsx` | FE UT / Component | User list page, role/status filters, pagination | AC-USER-MANAGEMENT-3, AC-USER-MANAGEMENT-4, AC-USER-MANAGEMENT-20 |
| TC-USER-MANAGEMENT-5 | `user-management.spec.ts` | E2E | Admin route visibility, LOGIN regression for active/inactive account | AC-USER-MANAGEMENT-1, AC-USER-MANAGEMENT-19 |
| TC-USER-MANAGEMENT-6 | Black-box scenario set | Black-box | Explicitly out-of-scope areas (no batch/job/event, formal audit/forgot-password/SSO/team assignment) | AC-USER-MANAGEMENT-22, AC-USER-MANAGEMENT-23 |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| Admin opens User Management | ADMIN account exists and can login | Login as ADMIN -> open `/:lang/admin/user-accounts` | User Management page is visible and list API is called | AC-1, AC-3 |
| Non-admin is blocked | Non-admin account exists and can login | Login as non-admin -> directly open `/:lang/admin/user-accounts` | User is redirected or permission-denied page is shown; admin API is not usable | AC-2 |
| Create active user account | ADMIN logged in; role `USER` exists | Open create drawer/modal -> enter username/fullname/email/password/confirmPassword/role/isActive -> submit | Account is created; request contains no `teamId`; response shows no sensitive fields | AC-5, AC-6, AC-7, AC-8, AC-11, AC-12 |
| Create duplicate username | Existing username already exists | Try to create same username with different case/spaces | UI/API shows duplicate error and no account is created | AC-9, AC-21 |
| Missing or invalid role | ADMIN logged in | Submit create/update without role or with invalid role if API-level test | Request is rejected with safe validation error | AC-8, AC-21 |
| Reset password | Existing active account | Open reset password action -> enter password/confirmPassword -> submit | Password reset succeeds; no raw password/hash/token displayed or returned | AC-10, AC-11, AC-12, AC-18 |
| Deactivate/reactivate user | Existing non-last-admin account | Click deactivate -> confirm -> click reactivate -> confirm | Account status changes; row is not hard-deleted | AC-16 |
| Last Admin cannot be deactivated | Only one active ADMIN exists | Try to deactivate or downgrade that ADMIN | Operation is rejected | AC-17 |
| Created active user can login | Created user is active and has password | Logout Admin -> login using created user | Login succeeds and user lands in allowed area | AC-19 |
| Deactivated user cannot login | Created user is deactivated | Try login with that user | Login is rejected according to LOGIN inactive-account behavior | AC-16, AC-19 |
| Team assignment absent | ADMIN opens create/edit/filter UI | Inspect fields and outgoing request payload | No team input/filter exists; payload has no `teamId`; backend stores `team_id = NULL` | AC-6, AC-15, AC-23 |

## 6. Areas intentionally left untested this time

| area | reason | risk |
|---|---|---|
| Formal audit log | Explicitly out of scope for USER-MANAGEMENT MVP | Future compliance gap if admin actions need formal audit before production. |
| Email notification after password reset | Out of scope; no delivery/security policy yet | Admin must communicate password through a separate approved process. |
| Team assignment / team filter / team validation | Explicitly out of scope; `team_id = NULL` is intended | Team-based access behavior is not validated here. |
| Forgot password / self-service reset | Out of scope and belongs to a future LOGIN/account recovery function | User cannot recover password without Admin reset. |
| SSO/OAuth/MFA | LOGIN MVP uses username/password token flow | Enterprise auth requirements may need future work. |
| Production monitoring/dashboard | No batch/job/event and formal operation dashboard in this ticket | Operational visibility is limited to safe application logs. |

## 7. Data testing principles

- Use only dummy accounts, dummy email addresses and dummy passwords.
- Never commit real password, token, password hash, secret, private key or customer/user PII into test data or evidence files.
- Test passwords must be clearly dummy values, for example `UserMgmt#12345`.
- Test accounts created by E2E/IT should be cleaned up by deactivation or test transaction rollback, not hard delete.

## 8. Execution command

| command | purpose |
|---|---|
| `cd EDCAP_BE && mvn -Dtest=UserAccountAdminServicePhase6Test test` | Run BE unit tests for service/business rules. |
| `cd EDCAP_BE && mvn -Dit.test=UserAccountAdminApiIntegrationTest verify` | Run BE API integration tests for admin endpoints and security behavior. |
| `cd EDCAP_FE && npm run test:unit -- src/__tests__/user/UserAccountFormConfig.test.ts src/__tests__/user/UserAccountsPage.test.tsx` | Run FE unit/component tests for form/page behavior. |
| `cd EDCAP_FE && npm run test:e2e -- e2e_tests/tests/user-management.spec.ts` | Run FE E2E scenarios for Admin/non-admin and major user flows. |
| `cd EDCAP_FE && npm run build` | Confirm FE compiles after adding route/page/tests. |

## 9. Stop Condition

- Non-admin can access the User Management screen or admin API.
- API response or UI exposes `password`, `passwordHash`, `password_hash`, `token`, `refreshToken`, `secret` or `privateKey`.
- Raw password is stored or logged.
- Password is not hashed with bcrypt.
- Create account does not create/link `tbl_dim_member_pseudonym`.
- `role_id` is missing, invalid, or not saved for the member pseudonym.
- `teamId` is accepted from FE/API request or `tbl_dim_member_pseudonym.team_id` is not `NULL` for this ticket.
- The last active ADMIN can be deactivated or downgraded.

## 10. Required Human Decision

| decision | current status | required before release? |
|---|---|---|
| Should BE password strength match FE special-character rule? | Open issue in docs; FE is stricter than BE | Yes, if release requires identical FE/BE validation. |
| Exact cleanup policy for accounts created by E2E in shared environments | Deactivate/manual cleanup proposed | Yes, before running E2E against shared DB. |
| Whether formal audit is required before production release | Out of scope for MVP | Yes, if production policy requires audit for admin account actions. |
