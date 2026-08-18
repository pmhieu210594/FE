# Promotion Candidates

**Ticket ID**: ADMIN-AUDIT-LOG
**Create date**: 2026-07-10
**Author**: Claude (Phase 8)
**Update date**: 2026-07-10

> Note: this file replaces a prior version that contained content copied from a different ticket (`PARSER-SPEC-PACK`); that content has been removed as out of scope for ADMIN-AUDIT-LOG.

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-AAL-001 | Reuse a dormant existing table (`tbl_fact_access_log`) instead of creating a near-duplicate audit table | `docs/architecture/repository-db-map.md` | Prevents future tickets from re-discovering or duplicating this table | High |
| LD-AAL-002 | Append-only enforcement via `BEFORE UPDATE OR DELETE` trigger when a single DB role owns all tables (REVOKE/GRANT does not work here) | `docs/standards/database.md` | Codifies the correct immutability pattern for this codebase's DB role setup | High |
| LD-AAL-003 | Best-effort side-effect write via `NESTED`/`REQUIRES_NEW` transaction propagation | `docs/architecture/service-layer-map.md` | Reusable pattern whenever a side-effect write must never roll back the main business transaction | Medium |
| LD-AAL-004 | Centralized masking helper (whitelist-drop pattern) for any audit/log payload | `docs/standards/security.md` | Reusable boundary for future audit/logging features handling sensitive fields | Medium |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| RL-AAL-001 | An AC that requires a visible UI element is not "Implemented" until the component is verified mounted on the actual composing page (not just unit-tested in isolation) | `docs/standards/testing.md` | This ticket's AC-9 gap (summary cards built + tested but never mounted) was only caught at Phase 8 human review | Low |
| RL-AAL-002 | Every artifact read as ticket evidence must have its own Ticket ID header checked against the current ticket before being treated as review/promotion input | `docs/standards/templates/_ticket-template/*` | Prevents a leftover file from a prior ticket being silently treated as current-ticket evidence (happened with `codex-review.md`/`promotion-candidates.md` in this ticket) | Low |
| RL-AAL-003 | "Test phase PASS" in `test-results.md` must be paired with an explicit black-box case execution-status reconciliation before being read as release-ready | `docs/standards/testing.md` | Automated-suite PASS and black-box-case PASS are different gates; conflating them nearly masked an open gate in this ticket | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| ST-AAL-001 | Any ticket whose scope expands mid-implementation (e.g., FE pulled in after being deferred) must update `spec-pack.md`/`impl-plan.md`/`context.md` in the same pass, not just note it in `self-review.md` | `docs/standards/testing.md` | This ticket did this correctly; worth keeping as the expected baseline for future scope-expansion tickets |
| ST-AAL-002 | DB-dependent ACs (immutability, trigger behavior) must be tracked as "reviewed, not executed" through every phase when no live DB is available, not left implicit until the final report | `docs/standards/testing.md` | Prevents a DDL-only review from being mistaken for execution evidence at closure time |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| AD-AAL-001 | Document the `tbl_fact_access_log` rename/extend plan and its final column mapping | `docs/architecture/repository-db-map.md` | Makes the audit-log persistence shape discoverable without re-reading `spec-pack.md` §12 |
| AD-AAL-002 | Document the audit hook injection point (`AdminAuditLogService` as a constructor dependency of all 7 governance services + `AuthService`) | `docs/architecture/service-layer-map.md` | Future services added to governance package need to know they may also need this dependency if audit coverage should extend to them |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-AAL-001 | UI component implemented and unit-tested but never mounted on the page it was built for | New component added, page composition not updated in the same change | Require a page-level render/composition test for any AC that specifies a visible UI element | Human/browser review of the actual composed screen |
| FMI-AAL-002 | Automated-suite "PASS" conflated with black-box case completion | Test-results only reports the automated suite, omitting black-box case execution status | Always pair automated-suite results with a black-box case reconciliation table | Phase 8 report synthesis cross-checking `test-results.md` vs `blackbox-testcases.md` |
| FMI-AAL-003 | Leftover artifact from a prior ticket silently treated as current-ticket review/promotion evidence | Ticket folder created from a template/previous ticket without clearing prior content | Check each artifact's own Ticket ID header before use | Phase 8 synthesis reading Ticket ID fields |
| FMI-AAL-004 | DB-level enforcement mechanism (trigger, FK) never executed against a live database before release | No disposable DB harness available in the workspace across every phase | Track DB-dependent ACs as "reviewed, not executed" explicitly in every phase's report, not just Phase 8 | Cross-check impact-analysis/review-checklist DB items against actual execution logs |

## Not Promoted

| item | reason |
|---|---|
| A dedicated `GET /api/v1/admin/audit-logs/summary` BE aggregate endpoint | Still an open decision (see `report.md` §9/§10), not yet implemented — nothing to promote until built and reviewed |
| Generic "audit everything" READ logging | Explicitly rejected by the READ-scope human decision (detail views of Role/Member-User/Organization only) |

## Human Approval Required

- Whether to promote RL-AAL-001 (UI-mount verification) and ST-AAL-002 (DB-dependent AC tracking) as binding rules, or keep them as informal guidance, is a Tech Lead decision — not yet approved.