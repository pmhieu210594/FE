# Ticket Rules:

**Ticket ID**: ADMIN-AUDIT-LOG  
**Create date**: 2026-07-09  
**Author**: Claude  
**Update date**: 2026-07-09  

## Must Follow

- Stay inside `spec-pack.md`, `sources.md`, `context.md`, the related raw documents, and the current backend code.
- Use only methods, tables, permissions, and endpoints that are confirmed in the source or explicitly marked as new work in this ticket.
- Keep the audit-log screen read-only.
- Preserve UTF-8 and Vietnamese diacritics in all docs and test artifacts.
- Use `@CurrentUser AppUser caller` where the current codebase already does so.
- Use `MDC.get("traceId")` for correlation; never generate a trace ID manually.
- Follow the existing service/controller/adapter layering.
- Keep secrets, passwords, tokens, API keys, and PII out of logs and out of audit payloads unless the spec explicitly allows a masked or redacted form.
- Treat the `tbl_dim_member` / `tbl_dim_user` mismatch as an open decision, not a fact.

## Must Not Do

- Do not add `update` / `delete` endpoints for the audit-log screen.
- Do not create a generic file-read or directory-walking API while working on audit logs.
- Do not use `@AuthenticationPrincipal` to fetch the local `AppUser` when the project already uses `@CurrentUser`.
- Do not invent table names, FK targets, or helper methods that are not present in the source.
- Do not assume `tbl_dim_member` exists because a requirement mentions it; verify against the schema before coding.
- Do not write audit persistence in the controller layer.
- Do not use `System.out.println`, string concatenation logging, or raw secret logging.
- Do not move audit writes into an async queue without a specific architecture decision.

## Stop / Ask Conditions

- Stop and ask if the user identity reference for audit actor mapping still needs a final decision before implementing the FK.
- Stop and ask if a new endpoint would broaden the audit-log screen beyond read-only GET access.
- Stop and ask if a method or table is required but cannot be found in the source or migration files.
- Stop and ask if any proposed audit payload would store a secret, password, token, or other credential value.
- Stop and ask if a change would modify the current contract of existing CRUD or auth endpoints.

## Review Focus

- Verify that the context distinguishes real code from planned code.
- Verify that all existing CRUD/auth source points are listed explicitly.
- Verify that the audit-log screen is constrained to GET-only APIs.
- Verify that masking rules block secrets and preserve the fact that a field changed.
- Verify that the mapping uses current confirmed schema names and does not assume missing tables.
- Verify that the ticket retains the current template structure without drift.

## Test Focus

- Verify CRUD success, CRUD failure, login success, login failure, and logout audit capture.
- Verify that read-only audit-log list/detail endpoints are authorized correctly.
- Verify that masking keeps passwords/tokens/secrets out of stored before/after values.
- Verify that immutable append-only behavior is enforced by DB policy.
- Verify that filter/search behavior works against the actual stored audit columns.
- Verify that `traceId` is present in the log/audit flow for correlation.
