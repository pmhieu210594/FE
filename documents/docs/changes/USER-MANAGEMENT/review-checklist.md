# Review Checklist

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

## 1. Specification / AC Matching

| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-USER-MANAGEMENT-1 | ADMIN user can open the User Management screen at `/:lang/admin/user-accounts`. | Blocker | PASS |
| AC-USER-MANAGEMENT-2 | Non-admin user cannot access the screen or ADMIN user-account APIs. | Blocker | PASS |
| AC-USER-MANAGEMENT-3 | ADMIN can list user accounts with username, member/fullname, role, status, updated time and actions. | Major | PASS |
| AC-USER-MANAGEMENT-4 | ADMIN can search accounts by keyword and filter by status and role. Team filter is not in MVP. | Major | PASS |
| AC-USER-MANAGEMENT-5 | ADMIN can create an account with username, fullname, email, password, confirmPassword, roleId and isActive. | Blocker | PASS |
| AC-USER-MANAGEMENT-6 | Create request and FE form must not include `teamId`; system stores `tbl_dim_member_pseudonym.team_id = NULL`. | Blocker | PASS |
| AC-USER-MANAGEMENT-7 | Create account writes `tbl_auth_user_account` and linked `tbl_dim_member_pseudonym`. | Blocker | PASS |
| AC-USER-MANAGEMENT-8 | `role_id` is required and saved on `tbl_dim_member_pseudonym`; invalid role is rejected. | Blocker | PASS |
| AC-USER-MANAGEMENT-9 | Username is trimmed, required, max 100 characters and duplicate username is rejected case-insensitively. | Major | PASS |
| AC-USER-MANAGEMENT-10 | Password is required for create/reset, confirmPassword must match, and weak passwords are rejected before DB write. | Major | PASS |
| AC-USER-MANAGEMENT-11 | Password is saved as bcrypt hash with `password_algo = bcrypt`; raw password is never stored. | Blocker | PASS |
| AC-USER-MANAGEMENT-12 | API responses and UI never expose password, passwordHash, token, secret or private key. | Blocker | PASS |
| AC-USER-MANAGEMENT-13 | ADMIN can view account detail without sensitive fields. | Major | PASS |
| AC-USER-MANAGEMENT-14 | ADMIN can update fullname, email, roleId and isActive; username is not updated through edit flow. | Major | PASS |
| AC-USER-MANAGEMENT-15 | Updating role changes member pseudonym `role_id` and keeps `team_id = NULL`. | Blocker | PASS |
| AC-USER-MANAGEMENT-16 | ADMIN can deactivate and reactivate accounts; system does not hard delete accounts. | Blocker | PASS |
| AC-USER-MANAGEMENT-17 | System rejects deactivation or role downgrade if it would leave no active ADMIN account. | Blocker | PASS |
| AC-USER-MANAGEMENT-18 | ADMIN can reset password; reset replaces password hash and does not return/log raw password. | Blocker | PASS |
| AC-USER-MANAGEMENT-19 | Active account created/updated by this screen can be used by LOGIN; inactive/deactivated account cannot login. | Major | PASS |
| AC-USER-MANAGEMENT-20 | Pagination uses normalized page/size; invalid page/size does not break list API. | Minor | PASS |
| AC-USER-MANAGEMENT-21 | Errors use safe message keys/traceId style where available and do not leak sensitive values. | Major | PASS |
| AC-USER-MANAGEMENT-22 | No batch/job/event is introduced by this ticket. | Minor | PASS |
| AC-USER-MANAGEMENT-23 | Formal audit, forgot password, self-service reset, SSO/OAuth/MFA and team assignment remain out of scope. | Major | PASS |

## 2. General System Review

### 2.1. Number / Input Check

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| GEN-001 | Major | Username/password/pagination inputs are bounded. | Required fields reject blank; page/size are normalized. | PASS | Documented in `spec-pack.md`, `test-plan.md`, and `test-data.md`. |
| GEN-002 | Major | Boundary lengths are explicit. | Username 100, fullname 255, password policy defined, no team field. | PASS | No placeholder status remains for documented boundaries. |
| GEN-003 | Minor | Empty string/null behavior is explicit. | Blank values are rejected or normalized consistently. | PASS | Covered by test data and review docs. |

### 2.2. Character Type / Encoding / Locale

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| GEN-004 | Major | UTF-8 and locale keys are documented. | `en/ja/vi` keys remain valid. | PASS | No mojibake requirement in docs. |
| GEN-005 | Major | FE/BE message-key naming is consistent. | Safe keys are used instead of raw text. | PASS | Password-policy mismatch remains the only open note. |

### 2.3. Literal / Magic Number

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| GEN-006 | Major | Role/status values are centralized. | `ADMIN`, `ACTIVE`, `INACTIVE` are documented and not magic values. | PASS | Consistently referenced in docs. |
| GEN-007 | Minor | Password algo constant is explicit. | bcrypt is the documented storage format. | PASS | Security docs align. |

### 2.4. Operation / Maintainability

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| GEN-008 | Major | No sensitive values in logs/docs. | Password/hash/token/secret/private key are excluded. | PASS | Repeated across docs. |
| GEN-009 | Major | No hidden team assignment side effect. | `team_id = NULL` is intentional and documented. | PASS | Team scope is closed. |

## 3. FE Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| FE-001 | Major | `/:lang/admin/user-accounts` is ADMIN-only. | Non-admin cannot use the screen. | PASS | Route and guard are documented. |
| FE-002 | Blocker | Non-admin route access redirects away. | Redirect/logout behavior is defined. | PASS | Black-box cases cover this. |
| FE-003 | Major | List shows required columns. | Username, full name, role, status, updated time, actions. | PASS | Covered in test plan and test data. |
| FE-004 | Major | Create/edit/reset forms are aligned. | No team field; password is only for create/reset. | PASS | Documented repeatedly. |
| FE-005 | Blocker | API calls go through the shared helper. | No direct component fetch. | PASS | Template/source rules match. |
| FE-006 | Major | Sensitive values never appear in UI. | No password/hash/token/secret. | PASS | Security docs consistent. |

## 4. BE/API Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| BE-001 | Major | Admin endpoints are named and scoped. | `/api/v1/admin/user-accounts` family and `/api/v1/admin/roles`. | PASS | Source inventory and source map align. |
| BE-002 | Blocker | Create writes account + pseudonym. | Dual write is required. | PASS | Documented in AC/test plan. |
| BE-003 | Blocker | role_id validation exists. | Invalid role is rejected. | PASS | Documented. |
| BE-004 | Blocker | Password hashing is bcrypt. | Raw password never stored. | PASS | Security docs align. |
| BE-005 | Blocker | Last active ADMIN guard exists. | Cannot deactivate/downgrade last Admin. | PASS | Review and tests align. |

## 5. DB / Migration Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| DB-001 | Blocker | `tbl_auth_user_account` and `tbl_dim_member_pseudonym` remain the tables in scope. | No rename/recreate. | PASS | Source/docs aligned. |
| DB-002 | Blocker | `team_id` remains `NULL`. | Team assignment is not introduced. | PASS | Documented as intentional. |
| DB-003 | Major | No hard delete SQL. | Lifecycle is deactivate/reactivate. | PASS | Scope rule. |
| DB-004 | Major | Migration is not required in this correction pass. | Docs-only correction should not imply schema change. | PASS | Runtime work deferred. |

## 6. Security / Privacy Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| SEC-001 | Blocker | ADMIN-only enforcement is documented for FE and BE. | Defense in depth. | PASS | Docs align. |
| SEC-002 | Blocker | Sensitive values are excluded. | No password/hash/token/secret/private key. | PASS | Strongly repeated. |
| SEC-003 | Major | Password policy mismatch is visible. | Open issue recorded. | PASS | Intentionally left open. |
| SEC-004 | Major | No audit log storage requirement is implied. | Out of scope is explicit. | PASS | No hidden requirement. |

## 7. Operation / Maintenance Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| OP-001 | Major | Template normalization is complete. | No placeholder status remains in corrected core files. | PASS | Remaining runtime evidence files are still `NOT_RUN` by design. |
| OP-002 | Major | Rollback is documentation-only for this step. | No runtime code rollback is needed. | PASS | This pass did not change source. |

## 8. Test Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| TEST-001 | Major | Black-box cases exist for AC-1..23. | Mapping and cases are documented. | PASS | See `blackbox-testcases.md`. |
| TEST-002 | Major | Test plan uses a traceable AC matrix. | FE/BE/API/DB/E2E/black-box mapping exists. | PASS | See `test-plan.md`. |
| TEST-003 | Major | Runtime results are not fabricated. | `NOT_RUN` where execution did not occur. | PASS | See `test-results.md`. |

## 9. Documentation / Traceability Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| DOC-001 | Major | Corrected files follow the template shape. | No outline-only placeholder files remain in the corrected set. | PASS | Core files normalized. |
| DOC-002 | Major | AC IDs match across docs. | Consistent `AC-USER-MANAGEMENT-*` references. | PASS | Verified across the rewritten docs. |
| DOC-003 | Major | Extra legacy file names are not promoted. | No `03_source-availability.md` etc. | PASS | Legacy mismatch noted as excluded. |

## 10. Release / Rollback Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| REL-001 | Major | Documentation-only release is safe. | No code change implied. | PASS | This step is non-runtime. |
| REL-002 | Major | Open issues are tracked. | Password policy mismatch is documented. | PASS | See `open-issues.md`. |

## Severity Definition

| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released / merged because it can break core AC, security, data safety, or rollback safety. | Must fix before release, or explicitly stop. |
| Major | High probability of becoming a bug or operational issue. | Fix before release or record as accepted risk with owner/deadline. |
| Minor | Minor improvement, wording, maintainability, or polish. | Optional, but record decision if not fixed. |
