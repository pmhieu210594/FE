# Human Review

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-26
**Author**: pd_khoa
**Update date**: 2026-06-26

## Reviewer

pd_khoa

## Review Date

2026-06-26

## Review Scope

Backend implementation only (controller, service, adapter, DTOs). Frontend components and E2E tests deferred to a separate pass. Migration file V330 not reviewed in this pass — see Q-1 action below.

## Review Result

| item | result | note |
|---|---|---|
| Controller thinness (AC pattern) | PASS | Controller delegates entirely to service; no business logic leaks |
| Role-based access (PM/ADMIN only) | PASS | `requirePm()` is called at the top of every public service method |
| Input validation — search length | PASS | 255-char cap enforced in `normalize()` |
| Input validation — enum values | PASS | `scoreBand` and `riskLevel` validated against allow-lists; case-insensitive |
| Pagination boundaries | PASS | `page` floored at 1; `size` floored at 1 in service, capped at 100 in adapter |
| CSV escaping | PASS | `csv()` helper double-quotes fields containing commas, newlines, or quotes |
| No PII in owner display | PASS | `owner_display` sourced from `tbl_dim_member_pseudonym.pseudonym` |
| Read-only transactions on GET paths | PASS | `@Transactional(readOnly = true)` on summary, insights, tickets, detail, options, exportCsv |
| Hexagonal architecture compliance | PASS | Web layer → Service → Port → Adapter; no cross-layer leakage observed |
| `IllegalArgumentException` HTTP mapping | NEEDS_CHECK | Depends on GlobalExceptionHandler; not verified in this pass |

## AI Review Finding Triage

| finding ID | decision | reason | action |
|---|---|---|---|
| M-1 | CONFIRMED — must fix | Clicking Refresh does nothing; a PM relying on fresh data after a sync will see stale KPIs | Read V330 migration to determine snapshot type, then implement correct REFRESH or ETL logic |
| M-2 | CONFIRMED — must fix | Silent 100-row cap breaks export completeness; PMs cannot trust the exported file | Remove the `size=100` cap from `exportCsv` call to `findAllTickets`, or add truncation signal |
| M-3 | ACCEPTED RISK (monitor) | In current schema, `tbl_fact_artifact_parsed_section` has no conflicting column names so column resolution is unambiguous; adding a qualifier is a hardening improvement, not an immediate fix | Add table alias prefix in a follow-up cleanup; document in Accepted Risk below |
| M-4 | CONFIRMED — must fix | Sending an invalid filter value should return 400, not 500; user-facing error is unacceptable | Verify `GlobalExceptionHandler`; add `@ExceptionHandler(IllegalArgumentException.class)` → 400 if missing |
| m-1 | DEFERRED | POST with `@RequestParam` is non-standard but functional; export is behind auth and not a security risk | Track as tech debt for next sprint |
| m-2 | ACCEPTED | Dummy page/size in normalize() for summary/insights is cosmetic; no behavioral impact | No action |
| m-3 | NEEDS_DECISION | Hardcoded thresholds (90/75/60/40) must match the approved decision; cannot accept without confirming | Owner to confirm thresholds in the decision log (Q-3) |
| m-4 | FIXED by adapter | Adapter already enforces the 100 cap; service-level enforcement is defense-in-depth only | Add as minor clean-up in M-2 fix PR |
| m-5 | NEEDS_CHECK | Trigram index on `search_text` must be confirmed in V330 migration; if absent, add to the fix PR | Read V330; add `CREATE INDEX IF NOT EXISTS ... USING gin(search_text gin_trgm_ops)` if missing |
| FP-1 | AGREED — false positive | Schema drift risk is real but low probability now; accepted as M-3 risk above | No immediate action |

## Blocker / Major Remaining

After triage, two Majors must be resolved before promotion:

**M-1 — Refresh is a no-op**
- `PmDashboardJdbcAdapter.rebuildSnapshot()` must execute the correct refresh statement once the snapshot type is confirmed.

**M-2 — Export silently truncates**
- `PmDashboardService.exportCsv()` must either remove the 100-row cap or signal truncation to the caller.

**M-4 — Invalid filter returns 500**
- `GlobalExceptionHandler` must map `IllegalArgumentException` to HTTP 400 before this API is reachable from the production UI.

## Accepted Risk

| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| M-3: `filterParams()` unqualified column names in JOIN context | If `tbl_fact_artifact_parsed_section` gains a column with the same name as a snapshot filter column, `countMissingTraceabilitySections` silently uses the wrong table; impact is wrong KPI count, not a crash | pd_khoa | Next schema-change PR touching `tbl_fact_artifact_parsed_section` | pd_khoa |
| m-1: POST /export uses query params | Non-standard REST style; no security impact since endpoint is auth-gated | pd_khoa | Next API version cleanup | pd_khoa |

## Human Decisions

- **Q-1 (Snapshot type)**: Read `V330__pm_dashboard_snapshot.sql` to determine if `tbl_fact_ticket_dashboard_snapshot` is a materialized view, regular view, or physical table. Assign correct refresh logic for M-1.
- **Q-2 (Export permission)**: Confirm whether export requires a separate permission flag beyond PM/ADMIN role. Update `requirePm()` or add a `requireExport()` check in the fix PR.
- **Q-3 (Score band thresholds)**: Confirm whether thresholds ≥90/75/60/40 are the officially approved values. If so, document the reference in `averageBand()`. If not, update to approved values.
- **Q-4 (Trigram index)**: Confirm whether `search_text` has a GIN trigram index in the migration. If absent, add to M-1/M-2 fix PR.

## Final Human Verdict

- NEEDS_UPDATE

Must-fix before promotion: M-1 (refresh no-op), M-2 (export truncation), M-4 (invalid filter returns 500). Human decisions Q-1 through Q-4 must be resolved in the fix PR. Re-review required after fixes.
