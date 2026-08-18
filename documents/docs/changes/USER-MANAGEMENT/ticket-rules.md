# Ticket Rules

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

## Must Follow

- Do not add specifications not included in `spec-pack.md`.
- Ambiguous points must be returned as open issues.
- Before implementation or documentation changes, read the target source and existing tests.
- Follow existing patterns for FE route/API helpers, BE controller/service/mapper layering, and docs template shape.
- Do not reuse obvious errors, vulnerabilities, or known bad patterns.
- Check boundary cases such as empty strings, nulls, full-width/half-width characters, digits, and pagination values.
- Use enum/constant/master data rather than magic numbers or ad-hoc strings.
- Do not export secrets or PII to logs or docs.
- Use existing `tbl_auth_user_account` and `tbl_dim_member_pseudonym`; do not rename them.
- Keep `team_id = NULL` for this ticket.
- Use ADMIN-only authorization for every User Management screen/API operation.
- FE authenticated non-ADMIN access must redirect away and deny entry.
- BE direct non-ADMIN API access must return HTTP 403 with a standard error shape.
- Use FE translations from `public/locales/{en,ja,vi}/locale.json`.
- Do not hard-code user-facing User Management text.
- Keep BE hexagonal layering intact.
- Use soft delete / deactivate-reactivate only; do not add hard delete.
- Keep bcrypt as the password storage approach.

## Must Not Do

- Do not implement team assignment or team filter/input in this ticket.
- Do not add forgot password/self-service reset.
- Do not add formal audit storage in this ticket.
- Do not add SSO/OAuth/MFA.
- Do not expose password, passwordHash, token, secret, or private key in UI/API/logs.
- Do not copy ad-hoc AdminController error patterns if they violate the standard error envelope.
- Do not rely on direct `fetch` calls in FE components.
- Do not leave template placeholders where a concrete status or decision already exists.

## Stop / Ask Conditions

- Stop if `team_id` becomes non-null in local DB or source assumptions.
- Stop if ADMIN-only semantics change.
- Stop if FE and BE password policy must be aligned but no decision is recorded.
- Stop if any response or log exposes a sensitive field.
- Stop if a future edit changes business scope rather than documentation shape.

## Review Focus

- Scope is limited to account-management documentation and source-aligned notes.
- No team assignment, hard delete, or formal audit should appear as a required implementation in this ticket.
- Password reset must not expose raw password.
- Login compatibility must remain intact for active accounts.
- Existing `team_id = NULL` behavior must stay consistent.

## Test Focus

- Test artifacts must cover normal, error, boundary, permission, state-transition, duplicate, and login-regression cases.
- Black-box tests must not rely on implementation internals.
- Runtime tests are not executed in this documentation-correction pass; record `NOT_RUN` where appropriate.
