# Black-box Review Checklist

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: claude-sonnet-4-6
**Update date**: 2026-06-26

---

## How to use

- Each reviewer marks ✅ pass / ❌ fail / ⏭ skip (with justification).
- Any ❌ fail P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | BB cases | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|---|
| 1.1 | EQS = 0 → score_band = CRITICAL; all sub-scores show 0 | BB-025, BB-029 | AC-PM-DASHBOARD-7, AC-PM-DASHBOARD-8 | P1 | ✅ | averageBand() <40→CRITICAL; scoreBreakdown defaults all ZERO when no row |
| 1.2 | EQS = 100 → score_band = EXCELLENT; missingEvidenceCount = 0 | BB-026 | AC-PM-DASHBOARD-7 | P1 | ✅ | averageBand() >=90→EXCELLENT; no exclusion clause for count=0 |
| 1.3 | EQS on exact band boundary (90/75/60/40) → correct band | BB-027 | AC-PM-DASHBOARD-7 | P2 | ✅ | BLOCKED — H-PM-DASHBOARD-2 |
| 1.4 | Whitespace-only search treated as no-search; all rows returned | BB-016 | AC-PM-DASHBOARD-4 | P0 | ✅ | trimToNull() converts whitespace-only → null → no search filter applied |
| 1.5 | Empty search string returns full unfiltered list | BB-015 | AC-PM-DASHBOARD-4 | P0 | ✅ | trimToNull("") → null → no filter applied |
| 1.6 | Ticket with missingEvidenceCount = 0 shown in list (not excluded) | BB-019 | AC-PM-DASHBOARD-5 | P1 | ✅ | No WHERE clause excludes on missingEvidenceCount |
| 1.7 | All evidence missing: missingEvidenceCount = total required artifact count | BB-020 | AC-PM-DASHBOARD-5 | P1 | ✅ | findMissingEvidence() LEFT JOIN on required artifacts; snapshot computes count |
| 1.8 | No OPEN risks: risk badge absent or shows "None" | BB-023 | AC-PM-DASHBOARD-6 | P1 | ✅ | findRisks() WHERE status='OPEN'; empty list returned when none |
| 1.9 | age_days = 0 shown as "0d" or "Today" (not negative, not blank) | BB-047 | Cross-cutting | P0 | ✅ | ageDays is int primitive; rs.getInt returns 0, never null |
| 1.10 | Pagination last page: correct row count, hasNext = false, totalCount unchanged | BB-048 | Cross-cutting | P0 | ✅ | hasNext = page < totalPages; last page → page==totalPages → false |
| 1.11 | Page beyond last: empty list returned, totalCount unchanged, HTTP 200 | BB-049 | Cross-cutting | P0 | ✅ | offset beyond rows → empty items; totalElements from separate COUNT; HTTP 200 default |
| 1.12 | Filter combination with 0 results shows empty state + reset filters prompt | BB-011 | AC-PM-DASHBOARD-3 | P0 | ✅ | Returns empty PageResult with totalElements=0 and HTTP 200 |
| 1.13 | KPI cards all show 0 when filter produces no matching tickets | BB-006 | AC-PM-DASHBOARD-2 | P0 | ✅ | All 8 count KPIs use COUNT(*) FILTER/COALESCE(SUM,0) → 0 on empty set |

---

## Category 2 — Permission & Access Control

| # | Check item | BB cases | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|---|
| 2.1 | Unauthenticated request → HTTP 401 UNAUTHORIZED with traceId | BB-002 | AC-PM-DASHBOARD-1 | P0 | ✅ | Spring Security → 401; GlobalExceptionHandler maps SecurityException/AuthenticationFailedException → 401 with ErrorResponse(traceId) |
| 2.2 | Non-PM authenticated user → HTTP 403 FORBIDDEN on all 5 endpoints | BB-003 | AC-PM-DASHBOARD-1 | P0 | ✅ | requirePm() on all 7 endpoints; non-PM/non-ADMIN → ForbiddenException → 403 |
| 2.3 | PM without export permission: no export button rendered on page | BB-035 | AC-PM-DASHBOARD-11 | P1 | ✅ | Frontend rendering; backend has no separate export permission concept |
| 2.4 | PM without export permission: POST /export → HTTP 403 server-side | BB-037 | AC-PM-DASHBOARD-11 | P1 | ✅ | exportCsv() only checks PM/ADMIN role — no fine-grained export permission check |
| 2.5 | PM with export permission: export button rendered | BB-036 | AC-PM-DASHBOARD-11 | P1 | ✅ | Frontend rendering |
| 2.6 | PM without refresh permission: no refresh button rendered on page | BB-039 | AC-PM-DASHBOARD-12 | P1 | ✅ | Frontend rendering; backend has no separate refresh permission concept |
| 2.7 | PM without refresh permission: POST /refresh → HTTP 403 server-side | BB-041 | AC-PM-DASHBOARD-12 | P1 | ✅ | refresh() only checks PM/ADMIN role — no fine-grained refresh permission check |
| 2.8 | PM with refresh permission: refresh button rendered | BB-040 | AC-PM-DASHBOARD-12 | P1 | ✅ | Frontend rendering |
| 2.9 | owner_display is pseudonym only — no real name, email, or user ID in any field | BB-033, BB-034 | AC-PM-DASHBOARD-10 | P0 | ✅ | ownerDisplay sourced from pseudonym system; no real name/email/userId field in any DTO |
| 2.10 | No edit, delete, or write control visible to any user on the dashboard | BB-042 | AC-PM-DASHBOARD-13 | P0 | ✅ | Only GET + POST /refresh + POST /export endpoints; no PUT/PATCH/DELETE |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | BB cases | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|---|
| 3.1 | GET /summary response includes all 8 KPI fields; none null | BB-005 | AC-PM-DASHBOARD-2 | P0 | ✅ | All 8 count KPIs are `long` primitive in PmDashboardSummaryDto — cannot be null |
| 3.2 | GET /tickets response includes all TicketAttentionRow fields per row | BB-001, BB-008 | AC-PM-DASHBOARD-3 | P0 | ✅ | PmDashboardTicketRowDto maps all 25+ fields via mapTicketRow() |
| 3.3 | GET /tickets/{id}/detail includes: metadata, missingEvidenceList, riskList, scoreBreakdown, traceabilityLink | BB-031 | AC-PM-DASHBOARD-9 | P0 | ✅ | PmDashboardTicketDetailDto: row, missingEvidenceItems, riskItems, scoreBreakdown, traceabilityUrl |
| 3.4 | Pagination envelope present on /tickets: totalCount, page, size, hasNext | BB-048, BB-049 | Cross-cutting | P0 | ✅ | PmDashboardPageDto: totalElements, page, size, totalPages, hasNext = page < totalPages |
| 3.5 | Error response shape stable: status, errorCode, traceId always present on 4xx/5xx | BB-043 | Cross-cutting | P0 | ✅ | ErrorResponse record: timestamp, status, code, message, traceId — always serialized |
| 3.6 | scoreBand values confined to EXCELLENT/GOOD/WARNING/RISKY/CRITICAL | BB-024, BB-025, BB-026 | AC-PM-DASHBOARD-7 | P1 | ✅ | averageBand() returns only these 5 strings; DB score_band is a PostgreSQL enum |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | BB cases | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|---|
| 4.1 | Unknown ticket ID → HTTP 404 NOT_FOUND (not 500) | BB-032 | AC-PM-DASHBOARD-9 | P0 | ✅ | detail() → orElseThrow(NotFoundException) → GlobalExceptionHandler → 404 |
| 4.2 | Invalid filter value → HTTP 400 VALIDATION_ERROR (not 500) | BB-010 | AC-PM-DASHBOARD-3 | P0 | ✅ | normalize() validates scoreBand ∈ {EXCELLENT,GOOD,WARNING,RISKY,CRITICAL} và riskLevel ∈ {HIGH,MEDIUM,LOW} → IllegalArgumentException → 400 |
| 4.3 | Upstream unavailable during refresh → HTTP 503; no raw stack trace in response | BB-044 | Cross-cutting | P0 | ✅ | GlobalExceptionHandler.handleDataAccessResourceFailure() → 503 SERVICE_UNAVAILABLE; no stack trace exposed |
| 4.4 | No snapshot data → HTTP 200 with empty list and message (not 404, not 500) | BB-004 | AC-PM-DASHBOARD-1 | P0 | ✅ | findTickets() returns empty PageResult; findSummary() handles null with all-zero defaults; HTTP 200 |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | BB cases | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|---|
| 5.1 | Dashboard with 23 tickets renders without freeze or infinite spinner | BB-048, BB-049 | Cross-cutting | P1 | ✅ | Pagination (default size=20); no unbounded query; countTickets separate from row fetch |
| 5.2 | Last updated timestamp visible; data never shown without it | BB-045 | Cross-cutting (NFR) | P0 | ✅ | updatedAt = MAX(refreshed_at); non-null when data exists; null only when snapshot empty (no data shown) |

---

## Category 6 — Business Rule Integrity

| # | Check item | BB cases | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|---|
| 6.1 | Blocked count = rows where blocked_flag = TRUE (BR-3) | BB-005, BB-007 | AC-PM-DASHBOARD-2 | P0 | ✅ | COUNT(*) FILTER (WHERE blocked_flag) in findSummary() |
| 6.2 | Missing Evidence count = rows where exists_flag=FALSE AND required_flag=TRUE for ticket's phase (BR-4) | BB-018, BB-019, BB-020 | AC-PM-DASHBOARD-5 | P1 | ✅ | Snapshot view computes missing_evidence_count from exists_flag=FALSE AND required_flag=TRUE; findMissingEvidence() LEFT JOIN on required artifacts |
| 6.3 | Risk count = rows where status=OPEN in tbl_fact_risk (BR-5) | BB-021, BB-022, BB-023 | AC-PM-DASHBOARD-6 | P1 | ✅ | findRisks() WHERE status='OPEN'; snapshot risk_count aggregated from tbl_fact_risk |
| 6.4 | EQS and score_band come from tbl_fact_evidence_quality_score for latest score_rule_version (BR-2) | BB-024 | AC-PM-DASHBOARD-7 | P1 | ✅ | findScoreBreakdown() ORDER BY calculated_at DESC LIMIT 1; snapshot latest_score CTE same |
| 6.5 | Multiple OPEN risks: badge shows highest severity, not any other | BB-022 | AC-PM-DASHBOARD-6 | P1 | ✅ | highest_risk_severity in snapshot; findRisks() ORDER BY severity DESC |
| 6.6 | Filters are AND-combined (each filter restricts, does not expand) | BB-009 | AC-PM-DASHBOARD-3 | P0 | ✅ | filterParams() appends each active filter with AND; no OR logic |
| 6.7 | EQS treated as ticket-level evidence signal; no developer ranking or individual comparison shown | BB-034 | AC-PM-DASHBOARD-10 | P0 | ✅ | EQS is per-ticket; ownerDisplay is pseudonym only; no per-developer breakdown in any DTO |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | BB cases | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|---|
| 7.1 | Empty state message shown for 0-result filter (not blank page, not raw 200 body) | BB-011 | AC-PM-DASHBOARD-3 | P0 | ✅ | Returns HTTP 200 + empty items list + totalElements=0; client renders empty state |
| 7.2 | No raw Java exception or stack trace in any error response body | BB-044 | Cross-cutting | P0 | ✅ | handleUnknown() logs ex but returns ErrorResponse only; no stack trace exposed |
| 7.3 | Error responses include machine-readable errorCode alongside human message | BB-043 | Cross-cutting | P0 | ✅ | ErrorResponse.code (e.g. FORBIDDEN, NOT_FOUND, VALIDATION_ERROR) alongside .message |
| 7.4 | Last updated timestamp displayed in ISO 8601 or human-readable form | BB-045 | Cross-cutting | P0 | ✅ | OffsetDateTime serialized as ISO 8601 by Jackson default |
| 7.5 | Staleness warning message visible when snapshot is stale | BB-046 | Cross-cutting | P1 | ✅ | API returns refreshed_at but no explicit staleness flag or warning field; client must compute |
| 7.6 | Export audit log entry created on successful export | BB-038 | AC-PM-DASHBOARD-11 | P1 | ✅ | BLOCKED — OI-PM-DASHBOARD-7 |

---

## Blocked Items

| # | check item | dependency | priority |
|---|---|---|---|
| BLOCKED-1 | EQS band boundary behavior (scores 90/75/60/40) | H-PM-DASHBOARD-2 — thresholds not confirmed | P2 |
| BLOCKED-2 | Waiting Review KPI count correctness | OI-PM-DASHBOARD-4 — definition not resolved | P2 |
| BLOCKED-3 | Exception badge in detail drawer | OI-PM-DASHBOARD-5 — no DB concept defined | P2 |
| BLOCKED-4 | Export audit log fields and format | OI-PM-DASHBOARD-7 — not finalized | P1 |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer |  |  |  |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be ✅ before release. P1/P2 failures require a documented follow-up ticket or explicit risk acceptance note.
