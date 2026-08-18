# Source Availability

**Ticket ID**: ADMIN-AUDIT-LOG
**Create date**: 2026-07-09
**Author**: Claude (Phase 3 Impact Analysis)
**Update date**: 2026-07-09

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Spec pack | `docs/changes/ADMIN-AUDIT-LOG/spec-pack.md` | read | high | Ticket owner | Single source of truth for scope, AC, complexity, DB/security impact | drift if a stale export is used | always-read |
| Ticket context | `docs/changes/ADMIN-AUDIT-LOG/context.md` | read | high | Ticket owner | Confirms real screens/APIs/methods/DTOs/tables in scope | wrong context distorts implementation scope | always-read |
| Ticket rules | `docs/changes/ADMIN-AUDIT-LOG/ticket-rules.md` | read | high | Ticket owner | Must-follow / must-not-do / Stop-Ask constraints | ignoring rules breaks scope or leaks secrets | always-read |
| Raw requirement | `docs/changes/ADMIN-AUDIT-LOG/raw/requirement.md` | referenced (not re-read this phase) | high | BA/Owner | Canonical AC/FR-AUD/FR-LGN/FR-MSK/FR-SCR source | already folded into spec-pack.md | verify-with-source if AC conflict appears |
| Raw database design | `docs/changes/ADMIN-AUDIT-LOG/raw/database_design.md` | referenced (not re-read this phase) | high | DB/Backend | Table schema, immutability DDL, masking rule, indexes | already folded into spec-pack.md §12 | verify-with-source before migration write |
| Raw wireframe | `docs/changes/ADMIN-AUDIT-LOG/raw/wireframe.md` | referenced (not re-read this phase) | high | Designer/Owner | Screen layout, filters, search, detail drawer | already folded into spec-pack.md §2/§6 | required-if-FE-implemented |
| Architecture overview | `docs/architecture/overview.md` | read | medium-high | Architecture | Confirms hexagonal layering, 7 CRUD services exist | stale mapping vs current source | verify-with-source |
| Architecture ADR-001 | `docs/architecture/ADR-001-clean-hexagonal.md` | read | high | Architecture | Confirms layer dependency direction (domain←application←infrastructure/web) | violating direction breaks ArchUnit gate | always-read |
| Standards: backend | `docs/standards/backend.md` | referenced | high | Standards owner | Service/adapter/controller conventions | n/a | verify-with-source |
| Standards: database | `docs/standards/database.md` | referenced | high | Standards owner | Flyway migration + `tbl_*` naming + MyBatis conventions | n/a | required-if-db |
| Standards: security | `docs/standards/security.md` | referenced | high | Standards owner | Masking/PII/error-response rules | n/a | always-read |
| Standards: logging | `docs/standards/logging.md` | referenced | medium-high | Standards owner | SLF4J + traceId via MDC conventions | n/a | always-read |
| Standards: testing | `docs/standards/testing.md` | referenced | high | Standards owner | Unit/integration/black-box test patterns | n/a | always-read |
| Rules: 00-safety | `EDCAP_BE/documents/.claude/rules/00-safety.md` | read | high | Rule owner | No destructive ops, no secret reads, confirm before commit/migrate | violating breaks safety gate | always-read |
| Rules: 20-architecture | `EDCAP_BE/documents/.claude/rules/20-architecture.md` | read | high | Rule owner | Layer boundaries, external calls outside DB transactions | cross-layer violation | always-read |
| Rules: 30-security | `EDCAP_BE/documents/.claude/rules/30-security.md` | read | high | Rule owner | Error response shape, no ad-hoc status codes | inconsistent error handling | always-read |
| Rules: 40-testing | `EDCAP_BE/documents/.claude/rules/40-testing.md` | read | high | Rule owner | Mock ports not domain objects; ArchUnit must stay green | missing coverage/layer violation | always-read |
| Existing source-inventory | `docs/changes/ADMIN-AUDIT-LOG/source-inventory.md` | read | high | Ticket owner (Phase 1) | Full file-level list of 7 CRUD controllers/services, Auth, security, DTO, adapter patterns | superset already covers this phase's file list | always-read |
| Existing impl-plan | `docs/changes/ADMIN-AUDIT-LOG/impl-plan.md` | read | high | Ticket owner (Phase 3, prior pass) | Already selected Option A (explicit service-layer audit calls); step plan and AC mapping exist | must stay consistent with impact-analysis.md | always-read |
| V4 migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | referenced (confirmed in source-inventory.md) | high | DB | Confirms 6 dimension tables + `tbl_auth_user_account` (not `tbl_dim_member`) | FK target mismatch is the critical open risk | verify-with-source before migration write |

## Summary

Sources are sufficient to produce `impact-analysis.md` for this phase. `source-inventory.md` (Phase 1) already enumerates every relevant backend file at path level; this phase reuses that inventory rather than re-reading each Java file, per low-cost-mode policy (do not re-read entire files already indexed unless content is in question).

## Unavailable / Partial Sources

- `tbl_dim_member` / `tbl_dim_user` do not exist in the schema; `tbl_auth_user_account` is the only confirmed identity table (see V4 migration, `source-inventory.md` line 71-73).
- No FE component/route currently calls any audit-log endpoint — confirmed absent, not partially available.
- No existing test file targets audit logging; test patterns are inferred from sibling `@WebMvcTest`/Mockito-based tests only.

## Risk Before Implementation

1. FK target (`tbl_auth_user_account`) is a working assumption, not a final human-confirmed decision — user confirmed proceeding with this assumption for planning purposes (see Human Decision Log below), but migration DDL must not be written until re-confirmed at Phase 4 start.
2. Interception strategy (Option A: explicit service calls) is now confirmed by the user for this phase.
3. READ logging scope and FK nullability (spec-pack §16 items 3-4) remain open; impact-analysis.md marks these as pending.

## Human Decision Log (this phase)

| decision | resolution | date |
|---|---|---|
| Actor identity FK target | Proceed with `tbl_auth_user_account` as working assumption; re-confirm before Phase 4 migration write | 2026-07-09 |
| Audit interception strategy | Confirmed Option A — explicit `AdminAuditLogService` calls from each CRUD/auth service | 2026-07-09 |
| READ logging scope | Still open — carried into impact-analysis.md as unresolved | 2026-07-09 |
| FK nullability | Still open — carried into impact-analysis.md as unresolved | 2026-07-09 |
