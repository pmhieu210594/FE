# 00_brainstorm

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-12  

## Purpose

Prepare the Phase 1 investigation notes for the User Management ticket before promoting confirmed content into `spec-pack.md`.

This brainstorm file is not the single source of truth. Confirmed specification is promoted to:

```text
docs/changes/USER-MANAGEMENT/spec-pack.md
```

## Known Information

- The system supports `ja/en/vi`; BE returns message keys and FE is responsible for translating messages.
- User Management is an Admin-only administration screen for internal login accounts.
- The feature manages login accounts and the linked member pseudonym record used for role mapping.
- The feature intentionally does not manage team assignment.
- The primary DB table for login accounts is `tbl_auth_user_account`.
- The linked identity/role table is `tbl_dim_member_pseudonym`.
- `role_id` is required and is saved from the Admin selection.
- `team_id = NULL` is intentional in this MVP.
- The supported flows are list, search, detail, create, update, deactivate, reactivate, and reset password.
- The screen does not support hard delete.
- Inactive or deactivated accounts cannot login.
- Sensitive values such as password, password hash, token, secret, and private key must not be exposed in UI or API responses.
- Username is trimmed, required, and must be unique.
- Password is stored as a bcrypt hash and raw password is never stored.
- Updating an account does not update the username through the edit flow.
- The system must block deactivation or role downgrade if it would leave no active Admin account.
- Pagination is required for the list API.

## Undetermined Points

- Exact FE and BE password policy alignment, especially whether both layers should require the same special-character rule.
- Exact error-message key and locale behavior for create/update/reset-password validation failures.
- Exact UI presentation for deactivated accounts and last-Admin guard errors.
- Whether the account detail screen should show read-only linked member information beyond role and status.
- Whether future releases will introduce formal audit logging for account administration operations.

## Expected Risks

- **Contract risk**: FE and BE account DTOs can drift, especially around create/update/reset-password payloads and safe response fields.
- **Security risk**: Password, password hash, token, secret, and private key fields must stay out of every response, log, and UI state.
- **Authorization risk**: The screen is Admin-only, so route guards and API guards must stay aligned.
- **Data integrity risk**: Create/update flows write both the login account row and the linked member pseudonym row, so partial writes would corrupt account state.
- **Scope creep risk**: Team management, hard delete, audit expansion, and self-service password recovery must stay out of this ticket.
- **Operational risk**: The last-active-Admin guard can block deactivate or role-change operations if it is not implemented consistently.
- **Login regression risk**: Changes to activate/deactivate or password reset must remain compatible with the LOGIN flow.

## What AI Needs to Investigate

For Phase 1, AI should verify the minimum source needed for As-Is and impact:

- Raw requirement and wireframe for the account-management UX.
- Existing BE controller, service, repository, mapper, and DTO patterns for account administration.
- Existing FE route, page, form, table, and modal patterns used by the User Management screen.
- Password hashing, validation, and sensitive-field filtering behavior.
- Authorization guard patterns for Admin-only routes and APIs.
- DB schema and mapper behavior for `tbl_auth_user_account` and `tbl_dim_member_pseudonym`.
- Test coverage for create/update/deactivate/reactivate/reset-password and last-Admin guard cases.

For Phase 3, AI should further inspect:

- Exact FE and BE request/response contracts for create, update, list, detail, activate, deactivate, and reset-password.
- Validation parity between FE and BE, especially username and password rules.
- How `role_id` is resolved and displayed in the UI.
- How `team_id = NULL` is enforced in the mapper and confirmed by tests.
- Whether response shaping already strips sensitive fields everywhere it needs to.

## What Humans Need to Ask

- Should FE and BE share exactly the same password policy, or is the FE allowed to be stricter?
- Is formal audit logging required in a later phase for Admin account actions?
- Should the detail screen expose any additional member-pseudonym data beyond the current Admin view?
- Are there any legacy integration constraints that require preserving the current route or API naming exactly?

## Conditions Under Which Implementation Is Not Permitted

Implementation should not begin if any of the following remain unresolved:

- No final decision on Admin-only access for both FE route and BE API.
- No agreement on the password policy and bcrypt storage contract.
- No confirmation that sensitive fields are removed from every response and log path.
- No confirmed behavior for deactivate/reactivate and the last active Admin guard.
- No stable contract for writing both the login account and the linked member pseudonym row.
- No decision on whether future audit logging is intentionally out of scope.
- No confirmed enforcement of `team_id = NULL` for this ticket.