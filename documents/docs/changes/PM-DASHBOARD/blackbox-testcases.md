# Black-box Test Cases

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: claude-sonnet-4-6
**Update date**: 2026-06-26

---

## 1. AC ↔ TC Mapping

| AC ID | BB cases | BLOCKED? |
|---|---|---|
| AC-PM-DASHBOARD-1 | BB-001, BB-002, BB-003, BB-004 | — |
| AC-PM-DASHBOARD-2 | BB-005, BB-006, BB-007, BB-050 | BB-050 BLOCKED OI-4 |
| AC-PM-DASHBOARD-3 | BB-008, BB-009, BB-010, BB-011 | — |
| AC-PM-DASHBOARD-4 | BB-012, BB-013, BB-014, BB-015, BB-016, BB-017 | — |
| AC-PM-DASHBOARD-5 | BB-018, BB-019, BB-020 | — |
| AC-PM-DASHBOARD-6 | BB-021, BB-022, BB-023, BB-051 | BB-051 BLOCKED OI-5 |
| AC-PM-DASHBOARD-7 | BB-024, BB-025, BB-026, BB-027 | BB-027 BLOCKED H-2 |
| AC-PM-DASHBOARD-8 | BB-028, BB-029 | — |
| AC-PM-DASHBOARD-9 | BB-030, BB-031, BB-032 | — |
| AC-PM-DASHBOARD-10 | BB-033, BB-034 | — |
| AC-PM-DASHBOARD-11 | BB-035, BB-036, BB-037, BB-038 | BB-038 BLOCKED OI-7 |
| AC-PM-DASHBOARD-12 | BB-039, BB-040, BB-041 | — |
| AC-PM-DASHBOARD-13 | BB-042 | — |
| Cross-cutting | BB-043, BB-044, BB-045, BB-046, BB-047, BB-048, BB-049 | — |

---

## 2. Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-PM-DASHBOARD-1 | P0 | Normal | PM user loads dashboard — screen renders with KPI cards |
| BB-002 | AC-PM-DASHBOARD-1 | P0 | Error | Unauthenticated request → HTTP 401 |
| BB-003 | AC-PM-DASHBOARD-1 | P0 | Permission | Non-PM authenticated user → HTTP 403 |
| BB-004 | AC-PM-DASHBOARD-1 | P0 | Operation | No snapshot data → HTTP 200 empty list with message |
| BB-005 | AC-PM-DASHBOARD-2 | P0 | Normal | All 8 KPI cards visible with numeric values |
| BB-006 | AC-PM-DASHBOARD-2 | P0 | Boundary | KPI cards all show 0 when filter matches no tickets |
| BB-007 | AC-PM-DASHBOARD-2 | P0 | Normal | Phase bottleneck chart visible and populated |
| BB-008 | AC-PM-DASHBOARD-3 | P0 | Normal | Each individual filter independently narrows ticket list |
| BB-009 | AC-PM-DASHBOARD-3 | P0 | Normal | Multiple filters combined show AND intersection |
| BB-010 | AC-PM-DASHBOARD-3 | P0 | Error | Invalid score_band filter value → HTTP 400 VALIDATION_ERROR |
| BB-011 | AC-PM-DASHBOARD-3 | P0 | Operation | 0-result filter shows empty state + reset filters prompt |
| BB-012 | AC-PM-DASHBOARD-4 | P0 | Normal | Search by ticket ID — case-insensitive |
| BB-013 | AC-PM-DASHBOARD-4 | P0 | Normal | Search by title — case-insensitive |
| BB-014 | AC-PM-DASHBOARD-4 | P0 | Normal | Search by repository name |
| BB-015 | AC-PM-DASHBOARD-4 | P0 | Boundary | Empty search string returns unfiltered list |
| BB-016 | AC-PM-DASHBOARD-4 | P0 | Boundary | Whitespace-only search treated as no filter |
| BB-017 | AC-PM-DASHBOARD-4 | P0 | Boundary | Search string at max 255 chars accepted |
| BB-018 | AC-PM-DASHBOARD-5 | P1 | Normal | Ticket with missing required evidence shows signal in row |
| BB-019 | AC-PM-DASHBOARD-5 | P1 | Boundary | Ticket with 0 missing evidence — row shown, no missing signal |
| BB-020 | AC-PM-DASHBOARD-5 | P1 | Boundary | Ticket with all evidence missing — count = total required for phase |
| BB-021 | AC-PM-DASHBOARD-6 | P1 | Normal | Ticket with single OPEN risk → drawer shows severity badge |
| BB-022 | AC-PM-DASHBOARD-6 | P1 | Normal | Multiple OPEN risks → badge shows highest severity only |
| BB-023 | AC-PM-DASHBOARD-6 | P1 | Boundary | No OPEN risks → badge absent or shows "None" |
| BB-024 | AC-PM-DASHBOARD-7 | P1 | Normal | EQS numeric and score_band label both visible in ticket row |
| BB-025 | AC-PM-DASHBOARD-7 | P1 | Boundary | EQS = 0 → score_band = CRITICAL |
| BB-026 | AC-PM-DASHBOARD-7 | P1 | Boundary | EQS = 100 → score_band = EXCELLENT |
| BB-027 | AC-PM-DASHBOARD-7 | P2 | Boundary | EQS on exact band boundary — BLOCKED H-PM-DASHBOARD-2 |
| BB-028 | AC-PM-DASHBOARD-8 | P1 | Normal | Detail drawer shows all sub-score labels and numeric values |
| BB-029 | AC-PM-DASHBOARD-8 | P1 | Boundary | All sub-scores = 0 — all fields present, each shows 0 |
| BB-030 | AC-PM-DASHBOARD-9 | P0 | Normal | Click ticket row → detail drawer opens with ticket metadata |
| BB-031 | AC-PM-DASHBOARD-9 | P0 | Normal | Drawer contains missing evidence list, risk, EQS breakdown, traceability link |
| BB-032 | AC-PM-DASHBOARD-9 | P0 | Error | Unknown ticket ID in detail endpoint → HTTP 404 NOT_FOUND |
| BB-033 | AC-PM-DASHBOARD-10 | P0 | Security | owner_display is pseudonym — no real name in any response field |
| BB-034 | AC-PM-DASHBOARD-10 | P0 | Security | No email, user ID, or ranking position visible anywhere |
| BB-035 | AC-PM-DASHBOARD-11 | P1 | Permission | PM without export permission → no export button rendered |
| BB-036 | AC-PM-DASHBOARD-11 | P1 | Permission | PM with export permission → export button rendered |
| BB-037 | AC-PM-DASHBOARD-11 | P1 | Error | POST /export without permission → HTTP 403 FORBIDDEN |
| BB-038 | AC-PM-DASHBOARD-11 | P1 | Audit | Export action creates audit log entry — BLOCKED OI-PM-DASHBOARD-7 |
| BB-039 | AC-PM-DASHBOARD-12 | P1 | Permission | PM without refresh permission → no refresh button rendered |
| BB-040 | AC-PM-DASHBOARD-12 | P1 | Permission | PM with refresh permission → refresh button rendered |
| BB-041 | AC-PM-DASHBOARD-12 | P1 | Error | POST /refresh without permission → HTTP 403 FORBIDDEN |
| BB-042 | AC-PM-DASHBOARD-13 | P0 | Security | No edit, upload, delete, or write control anywhere on dashboard |
| BB-043 | Cross | P0 | Audit | 4xx and 5xx responses include traceId field |
| BB-044 | Cross | P0 | Error | Upstream unavailable during refresh → HTTP 503, no raw stack trace |
| BB-045 | Cross | P0 | Operation | Last updated timestamp visible on dashboard |
| BB-046 | Cross | P1 | Operation | Stale snapshot shows staleness warning; page not blank |
| BB-047 | Cross | P0 | Boundary | age_days = 0 displayed as "0d" or "Today" |
| BB-048 | Cross | P0 | Boundary | Pagination last page — correct rows, has_next = false |
| BB-049 | Cross | P0 | Boundary | Page beyond last → empty list, total_count unchanged |
| BB-050 | AC-PM-DASHBOARD-2 | P2 | BLOCKED | Waiting Review KPI count — BLOCKED OI-PM-DASHBOARD-4 |
| BB-051 | AC-PM-DASHBOARD-6 | P2 | BLOCKED | Exception badge in drawer — BLOCKED OI-PM-DASHBOARD-5 |

---

## 3. Test Cases

### BB-001: PM user loads dashboard — screen renders with KPI cards

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | User = U-PM (authenticated, PM role); test tickets T-BLOCKED and T-MISSING present in snapshot |
| Input | `GET /api/v1/pm/dashboard/summary` — no filters |
| Steps | 1. Send request as U-PM. 2. Inspect response body. 3. Verify UI renders all sections. |
| Expected Result | HTTP 200; response contains 8 KPI fields (ticketsBlocked, missingEvidence, openIssues, waitingReview, ciFailed, eqsSummary, riskException, phaseBottleneck); dashboard renders 6 KPI cards + EQS summary card + phase bottleneck widget |
| Note | Read-only page; BR-9 |

### BB-002: Unauthenticated request → HTTP 401

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-1 |
| Priority | P0 |
| Category | Error |
| Preconditions | No active session cookie (U-ANON) |
| Input | `GET /api/v1/pm/dashboard/summary` with no session |
| Steps | 1. Send request without authentication. 2. Observe response. |
| Expected Result | HTTP 401; body: `{"status":401,"error":"Unauthorized","errorCode":"UNAUTHORIZED","traceId":"<non-empty>"}` |
| Note | Applies to all 5 PM Dashboard endpoints |

### BB-003: Non-PM authenticated user → HTTP 403

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-1 |
| Priority | P0 |
| Category | Permission |
| Preconditions | User = U-OTHER (authenticated, non-PM role) |
| Input | `GET /api/v1/pm/dashboard/summary` |
| Steps | 1. Send request as U-OTHER. 2. Observe response. |
| Expected Result | HTTP 403; body: `{"status":403,"errorCode":"FORBIDDEN","traceId":"<non-empty>"}` |
| Note | Applies to all 5 PM Dashboard endpoints |

### BB-004: No snapshot data → HTTP 200 empty list with message

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-1 |
| Priority | P0 |
| Category | Operation |
| Preconditions | U-PM; snapshot table empty — no computed ticket rows |
| Input | `GET /api/v1/pm/dashboard/tickets` — no filters |
| Steps | 1. Ensure no snapshot rows exist. 2. Send request as U-PM. 3. Observe response and UI. |
| Expected Result | HTTP 200; `{"data":[],"totalCount":0,"page":1,"hasNext":false}`; UI shows empty state (no 404, no 500, no indefinite spinner) |
| Note | Spec-pack §6.4: "Dashboard data not yet computed → HTTP 200 with empty list + message" |

### BB-005: All 8 KPI cards visible with numeric values

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | U-PM; T-ALL-OK, T-MISSING, T-BLOCKED, T-ZERO, T-RISK-MULTI present in snapshot |
| Input | `GET /api/v1/pm/dashboard/summary` — no filters |
| Steps | 1. Load summary. 2. Inspect each KPI field in response. |
| Expected Result | Non-null numeric values for: ticketsBlocked (≥1), missingEvidence (≥1), openIssues (integer), waitingReview (integer), ciFailed (integer), riskException (≥1); EQS summary shows a numeric average; phase bottleneck shows ≥1 phase entry |
| Note | waitingReview may be 0 until OI-PM-DASHBOARD-4 resolved |

### BB-006: KPI cards all show 0 when filter matches no tickets

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-2 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | U-PM; any dataset |
| Input | `GET /api/v1/pm/dashboard/summary?projectId=<uuid-with-no-tickets>` |
| Steps | 1. Apply filter for a project with no tickets. 2. Inspect KPI values. |
| Expected Result | All KPI count fields = 0; EQS summary = null or 0; phase bottleneck shows empty state; no error page |
| Note | KPI summary must reflect the current filter context |

### BB-007: Phase bottleneck chart visible and populated

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | U-PM; T-BLOCKED present (blocked_flag = true, phase = PLAN) |
| Input | Dashboard summary response |
| Steps | 1. Load dashboard with T-BLOCKED in data. 2. Inspect phase bottleneck section. |
| Expected Result | Phase bottleneck contains ≥1 entry with a phase_code label and count ≥ 1; PLAN phase appears in the chart |
| Note | Spec-pack §2.1: "Phase Bottleneck chart" paired with ticket table |

### BB-008: Each individual filter independently narrows ticket list

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-3 |
| Priority | P0 |
| Category | Normal |
| Preconditions | U-PM; T-ALL-OK (project=EDCAP), T-MISSING (project=ALPHA) present |
| Input | Apply each filter separately: (a) projectId=EDCAP, (b) repositoryId=EDCAP_BE, (c) phaseCode=PLAN, (d) scoreBand=WARNING, (e) riskLevel=HIGH |
| Steps | 1. For each filter, send GET /tickets with that filter. 2. Observe row count. |
| Expected Result | Each filter reduces the visible list to rows matching that filter only; rows from other values are absent |
| Note | Test each filter independently per AC-PM-DASHBOARD-3 |

### BB-009: Multiple filters combined show AND intersection

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-3 |
| Priority | P0 |
| Category | Normal |
| Preconditions | U-PM; T-BLOCKED (project=EDCAP, scoreBand=WARNING), T-MISSING (project=ALPHA, scoreBand=RISKY) |
| Input | `GET /api/v1/pm/dashboard/tickets?projectId=<EDCAP>&scoreBand=WARNING` |
| Steps | 1. Apply two filters simultaneously. 2. Observe rows. |
| Expected Result | Only rows matching BOTH conditions appear; T-MISSING (wrong project) excluded; T-ALL-OK (wrong band) excluded |
| Note | Filters are AND-combined per spec-pack AC-PM-DASHBOARD-3 |

### BB-010: Invalid score_band filter value → HTTP 400 VALIDATION_ERROR

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-3 |
| Priority | P0 |
| Category | Error |
| Preconditions | U-PM |
| Input | `GET /api/v1/pm/dashboard/tickets?scoreBand=INVALID_VALUE` |
| Steps | 1. Send request with unknown scoreBand. 2. Observe response. |
| Expected Result | HTTP 400; body: `{"status":400,"errorCode":"VALIDATION_ERROR","traceId":"<non-empty>"}`; no 500 response |
| Note | GlobalExceptionHandler must handle; spec-pack §6.4 |

### BB-011: 0-result filter shows empty state + reset filters prompt

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-3 |
| Priority | P0 |
| Category | Operation |
| Preconditions | U-PM; filter combination with no matching rows |
| Input | `GET /api/v1/pm/dashboard/tickets?projectId=<EDCAP>&scoreBand=EXCELLENT` where no EDCAP tickets are EXCELLENT |
| Steps | 1. Apply filter producing 0 rows. 2. Observe UI. |
| Expected Result | Ticket table shows 0 rows; empty state message visible ("No tickets found for the current filters…"); [Reset Filters] button visible; no error page, no spinner |
| Note | Spec-pack §8.3 empty state example |

### BB-012: Search by ticket ID — case-insensitive

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | U-PM; T-BLOCKED (external_ticket_key = "ABC-124") present |
| Input | `GET /api/v1/pm/dashboard/tickets?search=abc-124` |
| Steps | 1. Send lowercase version of the ticket ID. 2. Observe rows. |
| Expected Result | Row for ABC-124 appears; unrelated rows hidden; result identical to search=ABC-124 |
| Note | AC-PM-DASHBOARD-4: case-insensitive match |

### BB-013: Search by title — case-insensitive

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | U-PM; T-MISSING (title = "Missing Evidence Case") present |
| Input | `GET /api/v1/pm/dashboard/tickets?search=missing evidence` |
| Steps | 1. Send lowercase partial title. 2. Observe rows. |
| Expected Result | T-MISSING row appears; unrelated rows hidden |
| Note | — |

### BB-014: Search by repository name

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | U-PM; T-ALL-OK (repository=EDCAP_BE), T-MISSING (repository=EDCAP_FE) present |
| Input | `GET /api/v1/pm/dashboard/tickets?search=EDCAP_BE` |
| Steps | 1. Search by repository name. 2. Observe rows. |
| Expected Result | Only rows with repository_name = EDCAP_BE appear; EDCAP_FE rows hidden |
| Note | — |

### BB-015: Empty search string returns unfiltered list

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-4 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | U-PM; T-ALL-OK, T-MISSING, T-BLOCKED present |
| Input | `GET /api/v1/pm/dashboard/tickets?search=` |
| Steps | 1. Submit empty search. 2. Observe rows. |
| Expected Result | All tickets visible (unfiltered); no rows hidden by search |
| Note | Spec-pack AC-PM-DASHBOARD-4: "Empty search string returns unfiltered list" |

### BB-016: Whitespace-only search treated as no filter

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-4 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | U-PM |
| Input | `GET /api/v1/pm/dashboard/tickets?search=%20%20%20` (URL-encoded spaces) |
| Steps | 1. Send whitespace-only search. 2. Observe rows. |
| Expected Result | Server trims to empty string; response identical to no-search request; all rows returned |
| Note | Spec-pack §6.2: "leading/trailing whitespace trimmed"; §6.5: whitespace-only = no search |

### BB-017: Search string at max 255 chars accepted

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-4 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | U-PM |
| Input | `GET /api/v1/pm/dashboard/tickets?search=<255-char string>` |
| Steps | 1. Send 255-char search string. 2. Observe response status. |
| Expected Result | HTTP 200; request accepted (0 rows if no match is acceptable); no HTTP 400 |
| Note | Spec-pack §6.2: max 255 chars |

### BB-018: Ticket with missing required evidence shows signal in row

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-5 |
| Priority | P1 |
| Category | Normal |
| Preconditions | U-PM; T-MISSING: 3 required artifact types with exists_flag=FALSE in PLAN phase |
| Input | `GET /api/v1/pm/dashboard/tickets` |
| Steps | 1. Load ticket list. 2. Find T-MISSING row. 3. Inspect missingEvidenceCount and badge. |
| Expected Result | `missingEvidenceCount` = 3; row shows a visual signal (badge or indicator) for missing evidence; score context reflects the gap |
| Note | BR-4: count rows where exists_flag=FALSE AND required_flag=TRUE |

### BB-019: Ticket with 0 missing evidence — row shown, no missing signal

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-5 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | U-PM; T-ALL-OK: all required artifacts have exists_flag=TRUE |
| Input | `GET /api/v1/pm/dashboard/tickets` |
| Steps | 1. Load ticket list. 2. Find T-ALL-OK row. 3. Inspect missingEvidenceCount. |
| Expected Result | `missingEvidenceCount` = 0; T-ALL-OK row is present in the list (not excluded); no missing signal shown; green or neutral indicator |
| Note | Spec-pack §6.5: "0 missing → shown with green/neutral indicator; not excluded from list" |

### BB-020: Ticket with all evidence missing — count = total required for phase

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-5 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | U-PM; T-ZERO: EQS=0, all required artifacts missing in PLAN phase |
| Input | `GET /api/v1/pm/dashboard/tickets/{T-ZERO-id}/detail` |
| Steps | 1. Open detail for T-ZERO. 2. Inspect missingEvidenceCount and missingEvidenceList. |
| Expected Result | `missingEvidenceCount` = total required artifact types for T-ZERO's phase; each required artifact name in missingEvidenceList; evidenceQualityScore = 0; scoreBand = CRITICAL |
| Note | Spec-pack §8.3 boundary case |

### BB-021: Ticket with single OPEN risk → drawer shows severity badge

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-6 |
| Priority | P1 |
| Category | Normal |
| Preconditions | U-PM; T-BLOCKED: 1 tbl_fact_risk row, status=OPEN, severity=HIGH |
| Input | Open detail drawer for T-BLOCKED |
| Steps | 1. Click T-BLOCKED row. 2. Inspect Risk section in drawer. |
| Expected Result | Risk section shows badge with severity = HIGH; risk description shown; status = OPEN; riskCount = 1 |
| Note | BR-5: risk count = number of tbl_fact_risk rows with status=OPEN |

### BB-022: Multiple OPEN risks → badge shows highest severity only

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-6 |
| Priority | P1 |
| Category | Normal |
| Preconditions | U-PM; T-RISK-MULTI: 3 risks — CRITICAL, HIGH, LOW — all status=OPEN |
| Input | Open detail drawer for T-RISK-MULTI |
| Steps | 1. Click T-RISK-MULTI row. 2. Inspect Risk section. |
| Expected Result | Highest severity badge = CRITICAL; badge does not show LOW or HIGH when CRITICAL is present; all 3 risks may be listed beneath the badge |
| Note | AC-PM-DASHBOARD-6: "badge with the highest severity level" |

### BB-023: No OPEN risks → badge absent or shows "None"

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-6 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | U-PM; T-ALL-OK: 0 tbl_fact_risk rows with status=OPEN |
| Input | Open detail drawer for T-ALL-OK |
| Steps | 1. Click T-ALL-OK row. 2. Inspect Risk section. |
| Expected Result | Risk section shows "None" label or risk badge is absent; riskCount = 0 in response |
| Note | Spec-pack §6.5: "0 risks → Risk badge not shown or shows 'None'" |

### BB-024: EQS numeric and score_band label both visible in ticket row

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-7 |
| Priority | P1 |
| Category | Normal |
| Preconditions | U-PM; T-BLOCKED: evidenceQualityScore=68, scoreBand=WARNING |
| Input | `GET /api/v1/pm/dashboard/tickets` |
| Steps | 1. Find T-BLOCKED row in response. 2. Inspect evidenceQualityScore and scoreBand fields. |
| Expected Result | `evidenceQualityScore` = 68; `scoreBand` = "WARNING"; both are visible in the ticket row UI |
| Note | BR-2: score must come from tbl_fact_evidence_quality_score for latest score_rule_version |

### BB-025: EQS = 0 → score_band = CRITICAL

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-7 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | U-PM; T-ZERO: evidenceQualityScore=0 |
| Input | `GET /api/v1/pm/dashboard/tickets` |
| Steps | 1. Find T-ZERO row. 2. Inspect score fields. |
| Expected Result | `evidenceQualityScore` = 0; `scoreBand` = "CRITICAL"; all sub-scores = 0 visible in detail drawer |
| Note | Spec-pack §8.3 and §6.5 boundary case |

### BB-026: EQS = 100 → score_band = EXCELLENT

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-7 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | U-PM; T-ALL-OK: evidenceQualityScore=100 |
| Input | `GET /api/v1/pm/dashboard/tickets` |
| Steps | 1. Find T-ALL-OK row. 2. Inspect score fields. |
| Expected Result | `evidenceQualityScore` = 100; `scoreBand` = "EXCELLENT"; missingEvidenceCount = 0 |
| Note | Spec-pack §8.3 boundary case |

### BB-027: EQS on exact band boundary — BLOCKED

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-7 |
| Priority | P2 |
| Category | Boundary |
| Preconditions | T-BOUNDARY-90, T-BOUNDARY-75, T-BOUNDARY-60, T-BOUNDARY-40 (placeholder records) |
| Input | Ticket rows with EQS = 90, 75, 60, 40 |
| Steps | Inspect scoreBand for each boundary value |
| Expected Result | **BLOCKED — H-PM-DASHBOARD-2.** Thresholds 90/75/60/40 are not confirmed. Placeholder records exist in test-data.md but expected band cannot be asserted until H-2 is resolved. |
| Note | Re-activate once H-PM-DASHBOARD-2 is closed |

### BB-028: Detail drawer shows all sub-score labels and numeric values

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-8 |
| Priority | P1 |
| Category | Normal |
| Preconditions | U-PM; T-BLOCKED: all sub-score columns populated in tbl_fact_evidence_quality_score |
| Input | `GET /api/v1/pm/dashboard/tickets/{T-BLOCKED-id}/detail` |
| Steps | 1. Open T-BLOCKED detail. 2. Inspect scoreBreakdown section. |
| Expected Result | Response contains: specScore, planScore, reviewScore, testScore, ciScore, reportScore — each with a label and a non-null numeric value |
| Note | AC-PM-DASHBOARD-8: "each sub-score component displayed with its label and numeric value" |

### BB-029: All sub-scores = 0 — all fields present, each shows 0

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-8 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | U-PM; T-ZERO: EQS=0, all sub-scores = 0 |
| Input | `GET /api/v1/pm/dashboard/tickets/{T-ZERO-id}/detail` |
| Steps | 1. Open T-ZERO detail. 2. Inspect each sub-score field. |
| Expected Result | All sub-score fields present (not null, not hidden); each shows value = 0 |
| Note | Spec-pack §8.3: "all sub-scores show 0" |

### BB-030: Click ticket row → detail drawer opens with ticket metadata

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-9 |
| Priority | P0 |
| Category | Normal |
| Preconditions | U-PM; T-BLOCKED in ticket list |
| Input | Click on T-BLOCKED row in the UI |
| Steps | 1. Click T-BLOCKED row. 2. Wait for drawer to open. |
| Expected Result | Detail drawer opens; shows ticketId, externalTicketKey (ABC-124), phase (PLAN), EQS (68), scoreBand (WARNING); no edit controls visible |
| Note | AC-PM-DASHBOARD-9 |

### BB-031: Drawer contains missing evidence list, risk, EQS breakdown, traceability link

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-9 |
| Priority | P0 |
| Category | Normal |
| Preconditions | U-PM; T-BLOCKED: 2 missing artifacts, 1 HIGH risk, sub-scores populated, traceability link set |
| Input | `GET /api/v1/pm/dashboard/tickets/{T-BLOCKED-id}/detail` |
| Steps | 1. Call detail API. 2. Verify each section of the response. |
| Expected Result | Response contains: missingEvidenceList (2 items with artifact names), riskList (1 item, severity=HIGH, status=OPEN), scoreBreakdown (all sub-scores), traceabilityLink (non-empty string) |
| Note | Spec-pack §6.3 Ticket detail output |

### BB-032: Unknown ticket ID in detail endpoint → HTTP 404 NOT_FOUND

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-9 |
| Priority | P0 |
| Category | Error |
| Preconditions | U-PM |
| Input | `GET /api/v1/pm/dashboard/tickets/00000000-0000-0000-0000-000000000999/detail` |
| Steps | 1. Send request with a nonexistent ticket UUID. 2. Observe response. |
| Expected Result | HTTP 404; body: `{"status":404,"errorCode":"NOT_FOUND","traceId":"<non-empty>"}` |
| Note | Spec-pack §6.4 |

### BB-033: owner_display is pseudonym — no real name in any response field

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-10 |
| Priority | P0 |
| Category | Security |
| Preconditions | U-PM; all test tickets seeded with ownerDisplay from tbl_dim_member_pseudonym |
| Input | `GET /api/v1/pm/dashboard/tickets` |
| Steps | 1. Load ticket list. 2. Inspect ownerDisplay field in each row of response JSON. |
| Expected Result | ownerDisplay = role-based label ("Backend Role", "QA Role", etc.); no email address, real name, or user UUID in ownerDisplay |
| Note | BR-1; tbl_dim_member_pseudonym.pseudonym |

### BB-034: No email, user ID, or ranking position visible anywhere

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-10 |
| Priority | P0 |
| Category | Security |
| Preconditions | U-PM; full page load including detail drawer |
| Input | Full dashboard UI + all API responses |
| Steps | 1. Load dashboard. 2. Open detail drawer for any ticket. 3. Inspect all visible text and response JSON. |
| Expected Result | No email pattern (*@*.*) found; no user UUID associated with a person; no ranking position (1st, #1, "rank N") anywhere on screen or in API payload |
| Note | AC-PM-DASHBOARD-10; spec-pack §2.2 |

### BB-035: PM without export permission → no export button rendered

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-11 |
| Priority | P1 |
| Category | Permission |
| Preconditions | U-PM (view-only; no export permission) |
| Input | Dashboard page load |
| Steps | 1. Log in as U-PM. 2. Load dashboard. 3. Inspect toolbar and action area. |
| Expected Result | No export button, export link, or export menu item rendered anywhere on the page |
| Note | BR-7: "no export button is rendered otherwise" |

### BB-036: PM with export permission → export button rendered

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-11 |
| Priority | P1 |
| Category | Permission |
| Preconditions | U-PM-EXP (PM role + export permission) |
| Input | Dashboard page load |
| Steps | 1. Log in as U-PM-EXP. 2. Load dashboard. 3. Inspect toolbar. |
| Expected Result | Export button or export trigger is visible and clickable |
| Note | Contrast with BB-035 |

### BB-037: POST /export without permission → HTTP 403 FORBIDDEN

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-11 |
| Priority | P1 |
| Category | Error |
| Preconditions | U-PM (no export permission) |
| Input | `POST /api/v1/pm/dashboard/export` |
| Steps | 1. Send POST export as U-PM. 2. Observe response. |
| Expected Result | HTTP 403; body: `{"status":403,"errorCode":"FORBIDDEN","message":"Export permission required","traceId":"<non-empty>"}` |
| Note | Spec-pack §8.2 example; server-side gate must exist even when UI hides the button |

### BB-038: Export action creates audit log entry — BLOCKED

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-11 |
| Priority | P1 |
| Category | Audit |
| Preconditions | U-PM-EXP; successful export |
| Input | `POST /api/v1/pm/dashboard/export` |
| Steps | 1. Execute export as U-PM-EXP. 2. Check audit log for the event. |
| Expected Result | **BLOCKED — OI-PM-DASHBOARD-7 not finalized.** Placeholder: expect audit record with userId (pseudonymized), timestamp, action=EXPORT, and filter context. |
| Note | Spec-pack §13: "Export creates a data egress event; audit log entry recommended" |

### BB-039: PM without refresh permission → no refresh button rendered

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-12 |
| Priority | P1 |
| Category | Permission |
| Preconditions | U-PM (view-only; no refresh permission) |
| Input | Dashboard page load |
| Steps | 1. Log in as U-PM. 2. Load dashboard. 3. Inspect toolbar. |
| Expected Result | No refresh button or refresh trigger rendered on the page |
| Note | BR-8; AC-PM-DASHBOARD-12 |

### BB-040: PM with refresh permission → refresh button rendered

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-12 |
| Priority | P1 |
| Category | Permission |
| Preconditions | U-PM-REF (PM role + refresh permission) |
| Input | Dashboard page load |
| Steps | 1. Log in as U-PM-REF. 2. Load dashboard. 3. Inspect toolbar. |
| Expected Result | Refresh button or refresh trigger is visible and clickable |
| Note | Contrast with BB-039 |

### BB-041: POST /refresh without permission → HTTP 403 FORBIDDEN

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-12 |
| Priority | P1 |
| Category | Error |
| Preconditions | U-PM (no refresh permission) |
| Input | `POST /api/v1/pm/dashboard/refresh` |
| Steps | 1. Send POST refresh as U-PM. 2. Observe response. |
| Expected Result | HTTP 403; body: `{"status":403,"errorCode":"FORBIDDEN","traceId":"<non-empty>"}` |
| Note | Same error envelope shape as BB-037 |

### BB-042: No edit, upload, delete, or write control anywhere on dashboard

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-13 |
| Priority | P0 |
| Category | Security |
| Preconditions | U-PM-EXP (broadest permission set) |
| Input | Full dashboard including detail drawer open for T-BLOCKED |
| Steps | 1. Load dashboard. 2. Open detail drawer. 3. Inspect every visible button, link, and form element. |
| Expected Result | No edit button, no delete button, no file upload input, no form submission for evidence found anywhere; PUT / DELETE / PATCH routes not registered (return 404 or 405) |
| Note | BR-9; AC-PM-DASHBOARD-13 |

### BB-043: 4xx and 5xx responses include traceId field

| item | content |
|---|---|
| Related AC | Cross-cutting (NFR Observability) |
| Priority | P0 |
| Category | Audit |
| Preconditions | Any error-inducing request |
| Input | Trigger BB-002 (401), BB-003 (403), BB-010 (400), BB-032 (404) |
| Steps | 1. Execute each error scenario. 2. Parse response JSON. 3. Check traceId field. |
| Expected Result | All 4xx/5xx responses include `"traceId":"<non-empty string>"`; field is not null, not empty string |
| Note | Spec-pack §6.6: "All 4xx/5xx must be logged with traceId at WARN/ERROR level" |

### BB-044: Upstream unavailable during refresh → HTTP 503, no raw stack trace

| item | content |
|---|---|
| Related AC | Cross-cutting |
| Priority | P0 |
| Category | Error |
| Preconditions | U-PM-REF; upstream data source unavailable (mock or test double) |
| Input | `POST /api/v1/pm/dashboard/refresh` when upstream fails |
| Steps | 1. Simulate upstream failure. 2. Trigger refresh. 3. Observe response. |
| Expected Result | HTTP 503; body: `{"status":503,"errorCode":"INTERNAL_ERROR","traceId":"<non-empty>"}`; no Java stack trace, no raw exception class name in response body |
| Note | Spec-pack §6.4: "do not expose raw exception to client" |

### BB-045: Last updated timestamp visible on dashboard

| item | content |
|---|---|
| Related AC | Cross-cutting (NFR Availability) |
| Priority | P0 |
| Category | Operation |
| Preconditions | U-PM; snapshot data present |
| Input | Dashboard page load |
| Steps | 1. Load dashboard. 2. Look for a timestamp field or label. |
| Expected Result | A last-updated timestamp is visible on the dashboard; format is ISO 8601 UTC or human-readable equivalent (e.g., "Data as of 2026-06-25 10:00 UTC") |
| Note | Spec-pack §6.3 "Updated timestamp" output; §14: "UI must show last updated timestamp" |

### BB-046: Stale snapshot shows staleness warning; page not blank

| item | content |
|---|---|
| Related AC | Cross-cutting (NFR Availability) |
| Priority | P1 |
| Category | Operation |
| Preconditions | U-PM; snapshot timestamp set to > 24 hours ago (T-STALE fixture) |
| Input | Dashboard page load with stale snapshot |
| Steps | 1. Set snapshot update time to significantly in the past. 2. Load dashboard. 3. Observe warning. |
| Expected Result | Page loads with data; staleness warning or banner visible (e.g., "Data last refreshed N hours ago"); page is not blank or in error state |
| Note | Spec-pack §6.6 Availability: "show data with a staleness warning; do not show blank page" |

### BB-047: age_days = 0 displayed as "0d" or "Today"

| item | content |
|---|---|
| Related AC | Cross-cutting (spec-pack §6.5) |
| Priority | P0 |
| Category | Boundary |
| Preconditions | U-PM; T-ALL-OK updated today (age_days = 0) |
| Input | `GET /api/v1/pm/dashboard/tickets` |
| Steps | 1. Find T-ALL-OK row. 2. Inspect ageDays in response and UI label. |
| Expected Result | Response: `ageDays` = 0; UI shows "0d" or "Today" (not negative, not blank, not null) |
| Note | Spec-pack §6.5: "0 days (updated today) → Show 'Today' or '0d'" |

### BB-048: Pagination last page — correct rows, has_next = false

| item | content |
|---|---|
| Related AC | Cross-cutting (spec-pack §6.5) |
| Priority | P0 |
| Category | Boundary |
| Preconditions | U-PM; 23 total tickets seeded (pagination dataset, section 9 of test-data.md), page size = 20 |
| Input | `GET /api/v1/pm/dashboard/tickets?page=2&size=20` |
| Steps | 1. Request page 2. 2. Inspect response. |
| Expected Result | 3 rows returned; `totalCount` = 23; `page` = 2; `hasNext` = false |
| Note | Spec-pack §8.3: "23 total tickets, page size = 20, request page = 2 → Returns 3 rows" |

### BB-049: Page beyond last → empty list, total_count unchanged

| item | content |
|---|---|
| Related AC | Cross-cutting (spec-pack §6.5) |
| Priority | P0 |
| Category | Boundary |
| Preconditions | U-PM; 23 total tickets seeded, page size = 20 |
| Input | `GET /api/v1/pm/dashboard/tickets?page=99&size=20` |
| Steps | 1. Request page 99. 2. Inspect response. |
| Expected Result | HTTP 200; `data` = []; `totalCount` = 23; `hasNext` = false; no error |
| Note | Spec-pack §6.5: "Page beyond last result → Return empty list, total count unchanged" |

### BB-050: Waiting Review KPI count — BLOCKED

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-2 |
| Priority | P2 |
| Category | BLOCKED |
| Preconditions | — |
| Input | — |
| Steps | — |
| Expected Result | **BLOCKED — OI-PM-DASHBOARD-4.** "Waiting review" definition not resolved. Cannot write test until H-PM-DASHBOARD-4 is answered (ticket_status = IN_REVIEW vs. new concept). |
| Note | Re-activate after OI-4 is closed |

### BB-051: Exception badge in drawer — BLOCKED

| item | content |
|---|---|
| Related AC | AC-PM-DASHBOARD-6 |
| Priority | P2 |
| Category | BLOCKED |
| Preconditions | — |
| Input | — |
| Steps | — |
| Expected Result | **BLOCKED — OI-PM-DASHBOARD-5.** "Exception" concept has no DB backing in V4. Cannot write test until H-PM-DASHBOARD-5 is answered. |
| Note | Re-activate after OI-5 is closed |

---

## 4. Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition (filter/search state changes)
- [x] Numeric input (EQS 0/100, age_days 0, pagination bounds)
- [x] Empty/null (empty search, 0 counts, no snapshot data)
- [x] Non-existing ID (BB-032)
- [x] Session expired / unauthenticated (BB-002)
- [x] Log/audit/traceId output (BB-038, BB-043)
- [x] Operation observability (BB-045, BB-046)
- [x] Existing data compatibility (score_rule_version, V4 tables)
- [ ] Duplicate — not applicable (read-only dashboard)
- [ ] Deleted data — not applicable (no delete action on dashboard)
- [ ] Timeout/retry — deferred (refresh mechanism pending OI-9; now closed to snapshot approach)
- [ ] Double submit — deferred (export/refresh not in final E2E scope)
- [ ] Back/reload — deferred (E2E scope)
