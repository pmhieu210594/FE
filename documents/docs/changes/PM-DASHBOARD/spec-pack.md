# Spec Pack

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: claude-sonnet-4-6
**Update date**: 2026-06-25

---

## 1. Context / Purpose

EDCAP is an engineering metrics platform that aggregates signals from GitHub, Jira, and CircleCI. Phase 0-B delivered the common base and artifact scanner. PM users currently have no single operational view to check whether a ticket is ready — they must open multiple artifacts manually.

This ticket delivers a **PM Dashboard PoC screen** that consolidates:
- Which tickets are blocked or stalled
- Which tickets have missing required evidence artifacts
- Which tickets carry risk or exception signals
- The Evidence Quality Score (EQS) and score band for each ticket

The dashboard is read-only and role-based. It must not expose personal performance ranking, raw evidence content, or secret/credential data. It is an operational follow-up tool for PMs, not a BI analytics workspace.

Origin reference: Chapter 9 of the SDD evidence platform (not directly read — see sources.md).

---

## 2. Scope

### 2.1. Within Scope

- PM Dashboard landing screen
- 6 KPI cards plus 2 supporting summary widgets: Tickets Blocked, Missing Evidence, Open Issues, Waiting Review, CI Failed, EQS summary card, Risk/Exception, Phase Bottleneck chart
- Primary ticket table with ticket rows: Ticket ID, Repository, Project, Status, Score band, Total score, Age (days), Owner Display; paired with the Phase Bottleneck chart in the same content row
- Filter bar: project, sprint/period, repository, phase, score band, risk level
- Search: ticket ID, title, repository, phase, keyword
- Detail drawer (read-only): ticket metadata, missing evidence list, risk/exception indicators, EQS breakdown, traceability link
- Export of visible dashboard data (permission-gated)
- Dashboard data refresh (permission-gated)
- Empty state with filter reset option

### 2.2. Out of Scope

- Editing, uploading, or deleting evidence files from the dashboard
- Managing project / repository / team master data
- QA-only AC test coverage dashboard
- Security-only secret scan review dashboard
- Executive cross-project governance report page
- Admin configuration forms
- Personal ranking, leaderboard, or individual productivity scoring
- Raw AI chat log storage or display
- Full DWH or BI administration screens

---

## 3. Terminology

| term | meaning | notes |
|---|---|---|
| EQS | Evidence Quality Score | 0-100 numeric score reflecting completeness and quality of a ticket's evidence artifacts |
| score_band | Category derived from EQS | EXCELLENT / GOOD / WARNING / RISKY / CRITICAL (DB ENUM already exists in V4) |
| Missing Evidence | Required artifact not present for a given ticket and phase | Derived from tbl_fact_artifact_snapshot.exists_flag = FALSE where required_flag = TRUE |
| Blocked | Ticket stuck in a phase | tbl_fact_ticket_phase_status.blocked_flag = TRUE |
| Waiting Review | Ticket in review state | [INFERRED — see OI-PM-DASHBOARD-4] possibly ticket_status = IN_REVIEW |
| Open Issue | Unresolved issue tied to a ticket | Derived from spec-pack issue registry; count items whose status is not `Closed` |
| Risk | Identified risk item tied to a ticket | tbl_fact_risk row with status = OPEN |
| Exception | Special exception signal tied to a ticket | Dedicated exception read model / `/exceptions`; do not reuse risk as a proxy |
| Owner Display | Role-based display label for the current assignee | Uses tbl_dim_member_pseudonym.pseudonym; never a real personal name |
| Age (days) | Days since the ticket last progressed | Computed from tbl_fact_ticket_phase_status.updated_at or tbl_dim_ticket.updated_at |
| Phase Bottleneck | The phase where the most tickets are stalled | Derived by grouping blocked tickets by phase_code |
| PM role | Application role with PM Dashboard access | PM-only access for this ticket; dashboard buttons also remain PM-only |
| score_rule_version | Version identifier for the EQS formula in use | Stored in tbl_fact_evidence_quality_score.score_rule_version |

---

## 4. As-Is

- No dedicated PM dashboard screen exists in the application.
- PM users must open each ticket folder manually to check evidence completeness.
- Missing evidence, open issues, risk, and EQS are not consolidated in any single view.
- Blocked tickets and phase bottlenecks require manual inspection of multiple artifact files.
- The dashboard concept was outlined in Chapter 9 of the SDD but was never implemented as a screen.
- The DB already holds the core data structures: EQS scores (`tbl_fact_evidence_quality_score`), risk items (`tbl_fact_risk`), phase status with blocked flag (`tbl_fact_ticket_phase_status`), and artifact existence (`tbl_fact_artifact_snapshot`).

---

## 5. To-Be

- A PM Dashboard screen is accessible to authenticated users with the PM role (or appropriate permission).
- PM users can immediately see the count of blocked tickets, missing evidence items, open issues, waiting-review tickets, CI failures, and risk/exception signals on the landing page.
- PM users can identify which tickets have missing required evidence without opening any artifact file.
- PM users can see ticket health, score band, and EQS per row in the main ticket table; risk and exception details are still available in the drawer.
- PM users can see EQS and score band for each ticket, and can drill into the breakdown.
- PM users can filter and search the dashboard by project, sprint/period, repository, phase, score band, risk level, and keyword.
- Clicking any KPI card or ticket row opens a read-only detail drawer.
- Export and refresh are available to users with the appropriate permission.
- No personal ranking, real names, or individual performance metric is ever shown.

---

## 6. Detailed Specification

### 6.1. Business Rules

| BR-ID | rule |
|---|---|
| BR-1 | owner_display must display only the role-based pseudonym from tbl_dim_member_pseudonym; never a real name, email, or user identifier |
| BR-2 | EQS and score_band must come from tbl_fact_evidence_quality_score; the score displayed must match score_rule_version currently in use |
| BR-3 | A ticket is counted as "Blocked" when tbl_fact_ticket_phase_status.blocked_flag = TRUE for any active phase |
| BR-4 | Missing Evidence count equals the number of tbl_fact_artifact_snapshot rows where exists_flag = FALSE and the artifact_type has required_flag = TRUE for the ticket's current phase |
| BR-5 | Risk count equals the number of tbl_fact_risk rows with status = OPEN for the ticket |
| BR-6 | CI Failed count for a ticket equals the number of tbl_fact_quality_gate rows with passed_flag = FALSE for that ticket |
| BR-7 | Export is only available when the authenticated user has the export permission; no export button is rendered otherwise |
| BR-8 | Refresh is only available when the authenticated user has the refresh permission; no refresh button is rendered otherwise |
| BR-9 | The dashboard is read-only; no edit, upload, or delete action is exposed |
| BR-10 | Waiting Review definition: [PENDING — see OI-PM-DASHBOARD-4] — parse review-checklist first |
| BR-11 | Exception definition: [PENDING — see OI-PM-DASHBOARD-5] — use a dedicated exception read model |
| BR-12 | Open Issues definition: derived from spec-pack issue registry; count unresolved items only |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| project_id | UUID | No | Must be a valid project_id if provided | Filter |
| sprint_key / period_key | String | No | Format TBD | Filter; maps to period_key in snapshot |
| repository_id | UUID | No | Must be a valid repository_id if provided | Filter |
| phase_code | String | No | Must match a value in tbl_dim_phase.phase_code | Filter |
| score_band | Enum | No | Must be one of EXCELLENT, GOOD, WARNING, RISKY, CRITICAL | Filter |
| risk_level | Enum | No | Must be one of INFO, LOW, MEDIUM, HIGH, CRITICAL | Filter; maps to tbl_fact_risk.severity |
| search | String | No | Max 255 chars; leading/trailing whitespace trimmed | Searches ticket_id, title, repository, phase, keyword |
| page | Integer | No | Min 1; default 1 | Pagination |
| size | Integer | No | Min 1, max 100; default 20 | Pagination |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| KPI summary | Object | JSON | 8 KPI card values; aggregated for the current filter context |
| Ticket list | Array of TicketRow | Paginated JSON | ticket_id, external_ticket_key, title, repository_name, project_alias, phase_code, blocked_flag, waiting_review_flag, missing_evidence_count, traceability_issue_count, evidence_quality_score, score_band, age_days, owner_display |
| Ticket detail | Object | JSON | ticket metadata + missing evidence list + risk list + score breakdown |
| Export file | File | TBD — see OI-PM-DASHBOARD-7 | Only returned when user has export permission |
| Updated timestamp | DateTime | ISO 8601 UTC | Last time the underlying data was refreshed |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| Unauthenticated request | HTTP 401 | UNAUTHORIZED | Session expired or no session cookie |
| Authenticated user without PM Dashboard permission | HTTP 403 | FORBIDDEN | Role check at controller entry point |
| Unknown ticket_id in detail endpoint | HTTP 404 | NOT_FOUND | OI-PM-DASHBOARD-6 affects what "PM Dashboard permission" means |
| Invalid filter value (e.g. unknown score_band) | HTTP 400 | VALIDATION_ERROR | Use GlobalExceptionHandler; do not return 500 |
| Export requested without permission | HTTP 403 | FORBIDDEN | Same error response shape |
| Refresh requested without permission | HTTP 403 | FORBIDDEN | Same error response shape |
| Dashboard data not yet computed (no snapshot) | HTTP 200 with empty list + message | — | Empty state; do not return 404 or 500 |
| Upstream data source unavailable during refresh | HTTP 503 or async error | INTERNAL_ERROR | Do not expose raw exception to client |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| evidence_quality_score | 0 | 100 | Exactly 0 (all evidence missing) | Show CRITICAL band; all sub-scores 0 |
| evidence_quality_score | 0 | 100 | Exactly 100 (all evidence present and valid) | Show EXCELLENT band |
| score_band threshold | — | — | Score on exact boundary (e.g. 90, 75, 60, 40) | [BLOCKED — see OI-PM-DASHBOARD-2] |
| missing_evidence_count | 0 | unbounded | 0 missing | Row shown with green/neutral indicator; not excluded from list |
| risk_count | 0 | unbounded | 0 risks | Risk badge not shown or shows "None" |
| age_days | 0 | unbounded | 0 days (updated today) | Show "Today" or "0d" |
| Ticket list result | 0 rows | — | No tickets match filters | Show empty state with reset filters prompt |
| Search string | 1 char | 255 chars | Whitespace-only string | Treated as no search (ignore or trim to empty) |
| pagination page | 1 | — | Page beyond last result | Return empty list, total count unchanged |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Dashboard list endpoint response time | < 2 s at p95 for up to 500 tickets in the filter set | Load test with representative dataset | Precomputed snapshot table recommended to avoid runtime aggregation |
| Performance | KPI summary aggregation | < 1 s at p95 | Load test | Indexed queries on period_key + project_id |
| Security | Role-based access | Only users with the PM role (or equivalent) can access dashboard endpoints | Integration test + manual verification | Role definition pending OI-PM-DASHBOARD-6 |
| Security | No PII / real names in response | owner_display must be pseudonym only | Code review + data test | BR-1 |
| Security | Export permission gate | Export endpoint returns 403 without export permission | Integration test | BR-7 |
| Availability | Degraded-mode behavior | If snapshot data is stale, show data with a staleness warning; do not show blank page | Manual test | Refresh mechanism pending OI-PM-DASHBOARD-9 |
| Maintainability | Score versioning | score_rule_version must be stored with each score row | Verified in tbl_fact_evidence_quality_score | Score formula changes must not silently overwrite old values |
| Observability | API error logging | All 4xx/5xx must be logged with traceId at WARN/ERROR level | Code review | Use existing TraceIdFilter + MDC pattern |
| Compatibility | Browser support | Chrome, Firefox, Edge (latest 2 versions) | Manual / Playwright E2E | No IE11 requirement |

---

## 7. Acceptance Criteria

| AC-ID | description | testable? | notes |
|---|---|---|---|
| AC-PM-DASHBOARD-1 | Given an authenticated user with PM role, when navigating to the PM Dashboard route, then the dashboard screen loads and the 6 KPI cards plus the EQS summary card and phase bottleneck widget are visible | Yes | Role definition pending OI-PM-DASHBOARD-6 |
| AC-PM-DASHBOARD-2 | Given the dashboard is loaded, when viewing the KPI area, then the following are shown with numeric counts or summary values: Tickets Blocked, Missing Evidence, Open Issues, Waiting Review, CI Failed, EQS summary card, Phase Bottleneck widget, and Risk/Exception | Yes — Partially | Open Issues (OI-8), Waiting Review (OI-4), Exception (OI-5) counts may be 0 or incorrect until those open issues are resolved |
| AC-PM-DASHBOARD-3 | Given the ticket table is loaded, when the user applies a project filter, sprint/period filter, repository filter, phase filter, score band filter, or risk level filter, then the table updates to show only rows matching all applied filters | Yes | Each filter tested independently and in combination |
| AC-PM-DASHBOARD-4 | Given the ticket table is loaded, when the user types in the search box, then the table shows only tickets whose ticket ID, title, repository name, phase code, or any keyword field contains the search string (case-insensitive) | Yes | Empty search string returns unfiltered list |
| AC-PM-DASHBOARD-5 | Given a ticket that has at least one required artifact with exists_flag = FALSE in tbl_fact_artifact_snapshot, when the ticket is shown in the table, then the Missing Evidence signal is reflected in the status badge and score context | Yes | Requires confirmed required artifact list per phase (OI-PM-DASHBOARD-3) |
| AC-PM-DASHBOARD-6 | Given a ticket with at least one tbl_fact_risk row with status = OPEN, when the user opens the detail drawer, then the Risk section shows a badge with the highest severity level | Yes | Exception badge pending OI-PM-DASHBOARD-5 |
| AC-PM-DASHBOARD-7 | Given a ticket in the table, when viewing the row, then the EQS numeric value (0-100) and score_band label (EXCELLENT/GOOD/WARNING/RISKY/CRITICAL) are both visible | Yes | Score value must come from tbl_fact_evidence_quality_score for the latest score_rule_version |
| AC-PM-DASHBOARD-8 | Given the user clicks the EQS value in the detail drawer, when the breakdown section is shown, then each sub-score component (spec_score, plan_score, review_score, test_score, ci_score, report_score, etc.) is displayed with its label and numeric value | Yes | Breakdown columns are confirmed in tbl_fact_evidence_quality_score |
| AC-PM-DASHBOARD-9 | Given the user clicks a KPI card or a ticket row, when the action completes, then a read-only detail drawer opens showing: ticket metadata, missing evidence list, risk/exception indicators, EQS breakdown, and traceability link | Yes | |
| AC-PM-DASHBOARD-10 | Given any state of the PM Dashboard, when the UI is inspected, then no personal name, email address, user identifier, or ranking position is displayed anywhere; owner_display shows only a role-based pseudonym | Yes | Confirmed against tbl_dim_member_pseudonym usage |
| AC-PM-DASHBOARD-11 | Given an authenticated user without the export permission, when the dashboard is loaded, then no export button or export option is visible | Yes | Permission definition pending OI-PM-DASHBOARD-6 |
| AC-PM-DASHBOARD-12 | Given an authenticated user without the refresh permission, when the dashboard is loaded, then no refresh button or refresh trigger is visible | Yes | Permission definition pending OI-PM-DASHBOARD-6 |
| AC-PM-DASHBOARD-13 | Given any state of the PM Dashboard, when the user examines all visible controls, then no edit, upload, delete, or write action is available for source evidence files | Yes | |

---

## 8. Examples

### 8.1. Normal Case

**Scenario: PM views dashboard with active tickets**

Filter: project = EDCAP, sprint = 2026-S12

KPI cards display:
- Tickets Blocked: 3 (3 rows in tbl_fact_ticket_phase_status with blocked_flag = TRUE)
- Missing Evidence: 7 (7 tickets have at least one required artifact missing)
- Evidence Quality Score: 78 / GOOD (average of all visible ticket scores)

Ticket row example:
```
ABC-124 | Repo Alpha | Project Alpha | Traceability issues (10) | WARNING | 68 | 4d | Backend Role
```

Detail drawer for ABC-124:
```
Ticket ID:   ABC-124
Phase:       Plan
EQS:         68 / WARNING

Missing Evidence:
  - impl-plan.md (required, PLAN phase)
  - report.md (required, REPORT phase)

Risk:
  - MEDIUM severity — "Missing rollback plan" — status: OPEN

Score Breakdown:
  spec_score: 15 | plan_score: 5 | review_score: 8
  test_score: 9  | ci_score: 12  | report_score: 4
  missing_items: ["impl-plan.md", "report.md"]
```

### 8.2. Error Case

**Scenario: Unauthenticated user hits dashboard API**
- Request: `GET /api/v1/pm/dashboard/summary` (no session cookie)
- Response: HTTP 401
```json
{
  "timestamp": "2026-06-25T10:00:00Z",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "UNAUTHORIZED",
  "message": "Authentication required",
  "traceId": "abc-123"
}
```

**Scenario: PM user requests export without export permission**
- Request: `POST /api/v1/pm/dashboard/export`
- Response: HTTP 403
```json
{
  "status": 403,
  "error": "Forbidden",
  "errorCode": "FORBIDDEN",
  "message": "Export permission required",
  "traceId": "def-456"
}
```

**Scenario: Unknown ticket ID in detail endpoint**
- Request: `GET /api/v1/pm/dashboard/tickets/nonexistent-id/detail`
- Response: HTTP 404 with NOT_FOUND errorCode

### 8.3. Boundary Case

**Scenario: Ticket with EQS = 0**
- All required artifacts missing
- expected score_band: CRITICAL
- Missing Evidence count equals the total count of required artifact types for the phase
- Ticket row shows: Score: 0 / CRITICAL, all sub-scores show 0

**Scenario: No tickets match current filter combination**
- Ticket table returns 0 rows
- Empty state renders: "No tickets found for the current filters. Try changing project, sprint, repository, phase, score band, or risk filters. [Reset Filters]"
- KPI cards show 0 for all counts
- No error page or spinner shown indefinitely

**Scenario: Ticket with all evidence present (EQS = 100 or near-max)**
- All required artifacts exist
- expected score_band: EXCELLENT
- Missing Evidence count: 0
- Ticket row shows: Score: 100 / EXCELLENT, no missing indicator
- Detail drawer: missing evidence section shows empty list, not hidden section

**Scenario: Score exactly on a band boundary (e.g. exactly 75)**
- Expected score_band: GOOD (if 75 is the lower bound of GOOD) or WARNING (if 75 is exclusive upper bound of WARNING)
- [BLOCKED — band boundary treatment requires human confirmation; see OI-PM-DASHBOARD-2]

**Scenario: Pagination at last page**
- 23 total tickets, page size = 20, request page = 2
- Returns 3 rows, total_count = 23, has_next = false

---

## 9. Source Availability Summary

| source | available | read | trust | impact if missing |
|---|---|---|---|---|
| raw/requirement.md | Yes | Yes | High | Primary functional spec; missing would block all ACs |
| raw/wireframe.md | Yes | Yes | High | UI layout; missing would require redesign of screen structure |
| raw/database_design.md | Yes | Yes | Medium | Proposed schema; does NOT match actual DB — must not be applied directly |
| V4 DB migration (actual schema) | Yes | Yes | Very High | Authoritative schema; critical for DB impact section |
| docs/architecture/overview.md | Yes | Yes | High | Hexagonal layer rules; critical for API design |
| docs/standards/security.md | Yes | Yes | High | Auth, error response patterns |
| EQS formula | Not available | — | — | Blocks AC-PM-DASHBOARD-7, AC-PM-DASHBOARD-8, score implementation |
| Permission matrix | Not available | — | — | Blocks AC-PM-DASHBOARD-11, AC-PM-DASHBOARD-12, access control |
| Chapter 9 of SDD | Not provided | No | Unknown | Conceptual origin; absence does not block PoC scope |
| "Open issues" definition | Not available | — | — | Blocks AC-PM-DASHBOARD-2 (Open Issues KPI card) |

---

## 10. Complexity Classification

```text
Complexity:        Complex
System shape:      FE+BE+DB
Primary risks:     Spec (EQS formula undefined, open-issues definition missing)
                   Contract (new REST API surface — 5 new endpoints)
                   DB (schema overlap between proposed and existing tables)
Review mode:       Heavy
Required packs:    Source Analysis (done), FE-BE Contract, DB Migration
```

Rationale:
- New screen with 5+ new API endpoints
- New DB read model (tbl_fact_ticket_dashboard_snapshot) required
- Existing DB tables partially overlap with proposed new tables — must resolve before migration
- EQS formula and permission model are undefined — 2 hard blockers
- No FE tests exist yet; new test files must be created alongside the screen
- Role-based access control requires new or extended role configuration

---

## 11. FE/BE Contract Impact

New endpoints required (all under `/api/v1/pm/dashboard`):

| endpoint | method | description | auth |
|---|---|---|---|
| `/summary` | GET | Returns 8 KPI card values aggregated for the current filter | PM role |
| `/tickets` | GET | Returns paginated ticket rows with filter + search params | PM role |
| `/tickets/{ticketId}/detail` | GET | Returns detail drawer data for one ticket | PM role |
| `/export` | POST | Returns exported file of visible data | PM role + export permission |
| `/refresh` | POST | Triggers snapshot refresh | PM role + refresh permission |

Query parameters for `/summary` and `/tickets`:
`projectId`, `sprintKey`, `periodKey`, `repositoryId`, `phaseCode`, `scoreBand`, `riskLevel`, `search`, `page`, `size`

Response shapes (to be designed in FE-BE Contract pack):
- `DashboardSummaryResponse` — 8 KPI fields
- `TicketAttentionRow` — ticket_id, external_ticket_key, title, phase_code, missing_evidence_count, risk_count, evidence_quality_score, score_band, age_days, owner_display
- `TicketDetailResponse` — ticket metadata + missing evidence list + risk list + score breakdown
- Pagination envelope — total_count, page, size, has_next

No existing controller handles PM Dashboard. A new `PmDashboardController` must be created in the `web` layer. The corresponding service must be in the `application` layer. It must not call infrastructure adapters directly from the controller.

---

## 12. DB/Migration Impact

### Tables Already Existing (Confirmed in V4)

| table | relevant to dashboard | how used |
|---|---|---|
| tbl_dim_ticket | Yes | Ticket metadata (title, external_ticket_key, status) |
| tbl_dim_project | Yes | Project filter |
| tbl_dim_repository | Yes | Repository filter |
| tbl_dim_phase | Yes | Phase filter, phase bottleneck |
| tbl_dim_artifact_type | Yes | required_flag for missing evidence logic |
| tbl_dim_member_pseudonym | Yes | owner_display pseudonym |
| tbl_fact_ticket_phase_status | Yes | blocked_flag, dwell_time_minutes (age proxy) |
| tbl_fact_artifact_snapshot | Yes | exists_flag + required artifact join for missing evidence |
| tbl_fact_evidence_quality_score | Yes | score, score_band, breakdown sub-scores |
| tbl_fact_risk | Yes | risk count, severity, status |
| tbl_fact_quality_gate | Yes | CI failure count (passed_flag = FALSE) |
| score_band (ENUM) | Yes | Already defined; use as-is |

### New Tables / Migrations Required

| table | status | purpose | decision required |
|---|---|---|---|
| tbl_fact_ticket_dashboard_snapshot | NEW | Precomputed read model for fast PM list load | Confirm: build new or query existing tables directly? — OI-PM-DASHBOARD-9 |
| waiting_review_flag | NEW column or derived | Source for Waiting Review KPI count | Confirm: add column to snapshot, or derive from ticket_status = IN_REVIEW? — OI-PM-DASHBOARD-4 |
| exception_flag | NEW column or new table | Source for Exception count | Confirm: how is "exception" defined and stored? — OI-PM-DASHBOARD-5 |
| open_issue storage | NEW column or new table | Source for Open Issues KPI count | Confirm: definition of "open issue" — OI-PM-DASHBOARD-8 |

### Conflict: Proposed vs Existing

database_design.md must **not** be used directly as migration input. The following mapping replaces its proposed tables:

| Proposed in database_design.md | Actual approach |
|---|---|
| tbl_fact_ticket_score | Use tbl_fact_evidence_quality_score (already exists) |
| tbl_fact_ticket_risk | Use tbl_fact_risk (already exists) |
| tbl_fact_ticket_missing_evidence | Derive from tbl_fact_artifact_snapshot JOIN tbl_dim_artifact_type |
| tbl_fact_ticket_dashboard_snapshot | Create new — only genuinely new table needed |
| tbl_fact_ticket_attention | Evaluate after snapshot table design; likely not needed |

All new tables must follow existing naming: `tbl_` prefix, snake_case, UUID primary keys, `TIMESTAMPTZ` timestamps, `created_by` / `updated_by` VARCHAR(100).

Flyway version: next available V number after V231 (currently highest confirmed: V231__dedupe_security_evidence_upsert.sql).

---

## 13. Security/Privacy Impact

| concern | rule | source |
|---|---|---|
| owner_display must never be a real name | Use tbl_dim_member_pseudonym.pseudonym only | BR-1; requirement §6.4 |
| EQS must not be used as a personal productivity metric | Score is a ticket-level evidence signal, not a developer score | requirement §6.5 |
| No personal ranking shown anywhere | Explicitly out of scope per requirement §2.2 | AC-PM-DASHBOARD-10 |
| Export creates a data egress event | Export must be permission-gated; audit log entry recommended | OI-PM-DASHBOARD-7 |
| Role-based access | PM Dashboard endpoints require PM role authentication | OI-PM-DASHBOARD-6 |
| Error responses must not leak stack traces | Use GlobalExceptionHandler with ErrorResponse shape | security.md |
| Auth mechanism | Spring Security session cookie (per security.md); no JWT for this screen | Inconsistency with architecture.md — confirm with human |
| No raw AI chat logs, raw prompts, or secrets may appear in dashboard responses | DB rule from V4 comment: "Do not store raw AI chat, raw prompt, full source code, secrets or raw CI logs" | V4 migration header |

---

## 14. Operation/Maintenance Impact

| concern | impact | notes |
|---|---|---|
| Score formula versioning | When EQS formula changes, old scores stored under the previous score_rule_version must not be silently overwritten | tbl_fact_evidence_quality_score.score_rule_version handles this — score must be recomputed and stored with new version |
| Snapshot refresh strategy | How and when tbl_fact_ticket_dashboard_snapshot is populated is undefined | OI-PM-DASHBOARD-9 — could be webhook-triggered, scheduled batch, or on-demand via the refresh endpoint |
| Dashboard data staleness | If refresh is not running, data may be stale; UI must show last updated timestamp | Required by requirement §6.1 "Show the current update timestamp" |
| vw_artifact_inventory_current | If new columns are added to tbl_fact_artifact_snapshot, the view must be updated | V161 already has one view recreation precedent |
| Index maintenance | New snapshot table will need composite indexes on period_key + project_id + score_band + blocked_flag | Index guidance in database_design.md §10 is still valid as a starting point |

---

## 15. Test Strategy Summary

| layer | type | scope | tool | notes |
|---|---|---|---|---|
| BE domain | Unit | EQS band assignment logic (score → score_band mapping) | JUnit 5 | Must be tested once EQS formula is confirmed (OI-PM-DASHBOARD-1) |
| BE application | Unit | PmDashboardService: filter logic, permission check, KPI aggregation | JUnit 5 + Mockito | Mock port interfaces; test each filter param independently |
| BE web | Slice | PmDashboardController: route, request validation, 401/403/404 responses | @WebMvcTest | Use @WithMockUser with PM role; test export/refresh permission gates |
| BE integration | Integration | DB query correctness: KPI counts match expected rows in test data | @SpringBootTest + test DB | Requires confirmed EQS formula and evidence list (OI-1, OI-3) |
| FE component | Unit | KPI card render, main ticket table, detail drawer open/close | Vitest + Testing Library | No FE tests exist yet; new files required alongside new components |
| FE E2E | E2E | Full dashboard journey: load → filter → click row → open drawer → verify read-only | Playwright | At minimum one happy-path test and one empty-state test |

Test data required:
- At least 3 tickets: one with all evidence, one with missing evidence, one blocked
- At least 1 ticket with EQS = 0 and 1 with EQS = 100 (boundary test)
- At least 1 risk row with severity = HIGH for the blocked ticket

---

## 16. Human Decision Required

| ID | decision item | reason | owner | status |
|---|---|---|---|---|
| H-PM-DASHBOARD-1 | Confirm EQS formula and score_rule_version for PoC | No formula is defined; tbl_fact_evidence_quality_score stores scores but no formula row exists in tbl_dim_metric_definition | Product Owner / Architect | Open |
| H-PM-DASHBOARD-2 | Confirm score band numeric thresholds (90/75/60/40 or different) | Wireframe proposes these values; they are not documented in the DB or any confirmed spec | Product Owner | Open |
| H-PM-DASHBOARD-3 | Confirm required artifact list per phase for the PoC | tbl_dim_artifact_type.required_flag exists but the full list has not been confirmed for all phases | Architect / PM | Open |
| H-PM-DASHBOARD-4 | Define "waiting review" — is it ticket_status = IN_REVIEW or a new concept? | No waiting_review_flag exists in DB; KPI card count cannot be computed without this | Architect | Open |
| H-PM-DASHBOARD-5 | Define "exception" — is it a sub-type of risk, a new column, or a new table? | No exception_flag in tbl_fact_risk or anywhere in V4 schema | Architect | Open |
| H-PM-DASHBOARD-6 | Define permission matrix — which roles can view, export, and refresh the PM Dashboard? | No PM role defined; no permission table mapping visible | Architect / Security | Open |
| H-PM-DASHBOARD-7 | Define export format (CSV, XLSX, PDF) and whether export events are audit-logged | No export format defined; audit log table not present for dashboard exports | Product Owner / Security | Open |
| H-PM-DASHBOARD-8 | Define "open issues" — is it tbl_fact_risk.status = OPEN, a new table, or another concept? | No open_issue table exists; KPI card "Open Issues" has no data source | Product Owner / Architect | Open |
| H-PM-DASHBOARD-9 | Decide DB read strategy — new precomputed snapshot table vs. runtime queries on existing tables | Affects migration scope, query performance, and refresh mechanism design | Architect | Open |
| H-PM-DASHBOARD-10 | Confirm active auth mechanism — session cookie (security.md) vs JWT Bearer (architecture.md) | Inconsistency between two authoritative docs; affects API security configuration | Architect / Tech Lead | Open |

---

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk if wrong | needs confirmation? |
|---|---|---|---|---|
| A-PM-DASHBOARD-1 | tbl_fact_evidence_quality_score is the intended score data source for the PM Dashboard | V4 schema — table exists with all breakdown columns; database_design.md proposed a duplicate | Medium — may need mapping or denormalization | Confirm with H-PM-DASHBOARD-9 |
| A-PM-DASHBOARD-2 | tbl_fact_risk is the intended risk data source | V4 schema — table exists; database_design.md proposed a duplicate | Low — tables are compatible | Confirm with H-PM-DASHBOARD-5 |
| A-PM-DASHBOARD-3 | Blocking = tbl_fact_ticket_phase_status.blocked_flag = TRUE | V4 schema — blocked_flag exists on this table | Low | — |
| A-PM-DASHBOARD-4 | Missing Evidence = tbl_fact_artifact_snapshot rows where exists_flag = FALSE AND required_flag = TRUE via dim join | V4 schema inference | Medium — required_flag may not be set correctly for all artifact types | Confirm with H-PM-DASHBOARD-3 |
| A-PM-DASHBOARD-5 | owner_display = tbl_dim_member_pseudonym.pseudonym | V4 schema + "no personal ranking" requirement | Low | — |
| A-PM-DASHBOARD-6 | score_band ENUM values (EXCELLENT/GOOD/WARNING/RISKY/CRITICAL) in the DB match the wireframe display labels | V4 ENUM definition matches wireframe §6 | Low — labels may need i18n mapping | — |
| A-PM-DASHBOARD-7 | age_days is computed from tbl_fact_ticket_phase_status.updated_at of the current active phase | V4 schema inference; dwell_time_minutes is available as an alternative | Medium — dwell_time may be a better source | Discuss with H-PM-DASHBOARD-9 |
| A-PM-DASHBOARD-8 | CI Failed count uses tbl_fact_quality_gate.passed_flag = FALSE | V4 schema — tbl_fact_quality_gate has passed_flag and ticket_id | Low | — |
| A-PM-DASHBOARD-9 | Auth is session cookie (no JWT) based on security.md as the more recent and detailed source | security.md vs architecture.md inconsistency | Medium — if JWT is active, all API calls need Authorization header instead of session cookie | Confirm with H-PM-DASHBOARD-10 |
| A-PM-DASHBOARD-10 | Score band numeric thresholds 90/75/60/40 are proposals from wireframe, not confirmed values | wireframe.md §6 only | High — wrong thresholds mean wrong band displayed | Confirm with H-PM-DASHBOARD-2 |

---

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-PM-DASHBOARD-1 | EQS formula and score_rule_version not defined — no formula exists in tbl_dim_metric_definition | Blocks: AC-PM-DASHBOARD-7, AC-PM-DASHBOARD-8, all score computation | Product Owner | Pending |
| OI-PM-DASHBOARD-2 | Score band numeric thresholds not confirmed — wireframe proposes 90/75/60/40 but this is unverified | Blocks: score_band assignment logic, boundary test cases | Product Owner | Pending |
| OI-PM-DASHBOARD-3 | Required evidence list per phase not confirmed — FR-INV-004 and Artifact Inventory should be the source | Blocks: AC-PM-DASHBOARD-5, missing evidence KPI count | Architect / PM | Closed |
| OI-PM-DASHBOARD-4 | "Waiting review" definition absent — parse review-checklist first | Blocks: Waiting Review KPI card implementation | Architect | Pending |
| OI-PM-DASHBOARD-5 | "Exception" concept should use a dedicated exception read model | Blocks: Exception indicator in KPI card and drawer | Architect | Pending |
| OI-PM-DASHBOARD-6 | Permission matrix narrowed to PM-only access for this ticket | Blocks: AC-PM-DASHBOARD-11, AC-PM-DASHBOARD-12, role-based access control | Architect / Security | Closed |
| OI-PM-DASHBOARD-7 | Export format is CSV and export audit fields follow the PoC template | Blocks: export feature design | Product Owner | Pending |
| OI-PM-DASHBOARD-8 | Open issues are unresolved items in the spec-pack issue registry | Blocks: Open Issues KPI card count | Product Owner | Closed |
| OI-PM-DASHBOARD-9 | DB read strategy fixed to snapshot/read-model approach | Blocks: DB migration design, refresh mechanism, performance strategy | Architect | Closed |
| OI-PM-DASHBOARD-10 | Auth mechanism fixed to session cookie for this ticket | Blocks: API security configuration | Tech Lead | Closed |
