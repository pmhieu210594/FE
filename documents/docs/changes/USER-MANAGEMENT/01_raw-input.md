# 01 Raw Input

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-12  

## 1. User Request

User reported that `docs/changes/USER-MANAGEMENT` is wrong against template:

`C:\Users\pd_khoa.BRYCENVN\Documents\EDCAP\EDCAP_FE\documents\docs\standards\templates\_ticket-template`

Required work:

- Fix documents to match template.
- Make content suitable.
- Ensure AC in code tests and documentation are accurate.

## 2. Confirmed Product Decisions

- `tbl_dim_member_pseudonym.team_id` may be NULL.
- In USER-MANAGEMENT, role is selected and saved; team assignment is not handled.
- Account create/update touches `tbl_auth_user_account` and `tbl_dim_member_pseudonym`.

## 3. Test Package Basis

Test files previously generated:

- `UserAccountAdminServicePhase6Test.java`
- `UserAccountAdminApiIntegrationTest.java`
- `UserAccountFormConfig.test.ts`
- `UserAccountsPage.test.tsx`
- `UserManagementPage.ts`
- `user-management.spec.ts`

These tests are now reflected in AC mapping.
