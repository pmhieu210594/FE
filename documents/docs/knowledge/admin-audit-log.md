# Admin Audit Log — Reusable Pattern

**Source ticket:** ADMIN-AUDIT-LOG (2026-07-10)

## What this is

A centralized, best-effort audit trail for admin/governance actions (CRUD + auth events), built by
reusing an existing dormant table instead of creating a new one. This doc is the quick-reference
entry point; see the linked living docs for the full standard/architecture write-up.

## Key decisions and where they're documented

| Decision | Detail | Living doc |
|---|---|---|
| Table reuse | Extended `tbl_fact_access_log` (found dormant during Phase 5 source verification) instead of creating `tbl_admin_audit_log` | `docs/architecture/repository-db-map.md` §14 |
| Transaction boundary | `NESTED` for hooks inside a business transaction (CRUD), `REQUIRES_NEW` for hooks outside one (login/logout) — audit-write failure never blocks the business operation | `docs/architecture/service-layer-map.md` §7 "Best-Effort Audit Write Pattern" |
| Masking | Whitelist-drop sensitive field names from the JSON payload entirely, rather than value-level redact | `docs/standards/security.md` "Audit / Log Payload Masking" |
| Error-message sanitization | Redact secret-pattern substrings before truncating exception messages destined for audit/log fields | `docs/standards/security.md`, `.claude/rules/30-security.md` |
| Immutability | `BEFORE UPDATE OR DELETE` trigger, not `REVOKE`/`GRANT` — this codebase has a single DB role that must also migrate the table | `docs/standards/database.md` "Append-Only Table Enforcement" |
| API surface | GET-only controller (list + detail); no write endpoints | `AdminAuditLogController.java` |

## Components (for future audit-like tickets)

- `AdminAuditLogService` — central write/read orchestration
- `AdminAuditLogWriter` — transaction-boundary wrapper (see pattern above)
- `AuditMaskingHelper` — whitelist-drop masking
- `AdminAuditLogPersistencePort` / `AdminAuditLogJdbcAdapter` — persistence port/adapter
- `AdminAuditLogController` — GET-only list/detail

## Known gaps at time of writing (do not treat as resolved)

- DB-level append-only trigger not yet verified against a live Postgres instance.
- Summary-card counts are computed client-side from the current page only; no dedicated BE aggregate endpoint exists yet.
- See `docs/changes/ADMIN-AUDIT-LOG/report.md` and `test-results.md` for the authoritative, current status — this file will drift as the ticket closes; treat it as the pattern reference, not the live status.
