# 00_brainstorm

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: claude-sonnet-4-6
**Update date**: 2026-06-25

---

## Purpose

Create a PM Dashboard PoC screen that consolidates blocked tickets, missing evidence, risk / exception signals, and Evidence Quality Score (EQS) into a single PM-facing operational view. This is the first dedicated PM screen in the platform. It is read-only and role-based, and must not surface personal performance ranking.

---

## Known Information

**From requirement.md (AI-authored, unconfirmed by human sign-off):**
- Screen name: PM Dashboard
- Business purpose: PM quick-view for blocked tickets, phase bottleneck, missing evidence, open issues, risk, exception, EQS trending
- 13 ACs defined (AC-PM-1 through AC-PM-13)
- 8 open points explicitly called out in requirement §9
- Out of scope: editing evidence, master data management, QA/Security/Executive dashboards, personal ranking

**From wireframe.md (AI-authored):**
- 8 KPI cards: Tickets Blocked, Missing Evidence, Open Issues, Waiting Review, CI Failed, Risk/Exception, Evidence Quality Score, Phase Bottleneck
- Main ticket table: Ticket | Repository | Project | Status | Score band | Score | Age | Owner Display
- Score bands proposed: 90-100 Excellent, 75-89 Good, 60-74 Warning, 40-59 Risky, 0-39 Critical
- Detail drawer: read-only, shows missing evidence list, risk/exception, score breakdown
- Empty state: shows filter reset option, no raw internal error messages

**From V4 DB migration (confirmed — authoritative):**
- `score_band` ENUM exists: EXCELLENT, GOOD, WARNING, RISKY, CRITICAL
- `tbl_fact_evidence_quality_score` exists with: score, score_band, score_rule_version, spec_score, plan_score, review_score, self_review_score, test_score, ci_score, blackbox_score, report_score, missing_items (JSONB), ticket_id
- `tbl_fact_risk` exists with: severity (severity_level ENUM: INFO/LOW/MEDIUM/HIGH/CRITICAL), status, ticket_id, risk_summary, mitigation_present
- `tbl_fact_ticket_phase_status` exists with: blocked_flag, block_reason, dwell_time_minutes, phase_id, ticket_id
- `tbl_fact_artifact_snapshot` exists with: exists_flag, required_fields_missing (JSONB), artifact_type_id, ticket_id
- `tbl_dim_artifact_type` exists with: required_flag, artifact_type_code, artifact_name, phase_id
- `tbl_fact_quality_gate` exists with: gate_type, gate_status (run_status ENUM), passed_flag, ticket_id (CI failure info source)
- `tbl_dim_member_pseudonym` exists: pseudonym field — intended for role-based owner display
- `ticket_status` ENUM: OPEN, IN_PROGRESS, IN_REVIEW, DONE, CLOSED, CANCELLED, MERGED, DRAFT

**Confirmed DB design conflicts vs. database_design.md proposals:**
- `tbl_fact_ticket_score` PROPOSED → `tbl_fact_evidence_quality_score` ALREADY EXISTS (overlaps score breakdown)
- `tbl_fact_ticket_risk` PROPOSED → `tbl_fact_risk` ALREADY EXISTS (overlaps risk data)
- `tbl_fact_ticket_missing_evidence` PROPOSED → derivable from `tbl_fact_artifact_snapshot` (exists_flag=FALSE, required_flag=TRUE via dim join)
- `tbl_fact_ticket_dashboard_snapshot` PROPOSED → NO equivalent exists; this is the only genuinely new table
- `tbl_fact_ticket_attention` PROPOSED → NO equivalent exists; described as optional precomputed table

---

## Undetermined Points

| # | point | where it blocks |
|---|---|---|
| U-1 | EQS formula and score_rule_version not defined anywhere in the codebase | Cannot compute or re-compute score; AC-PM-7 and AC-PM-8 untestable |
| U-2 | Score band numeric thresholds are wireframe proposals only (90/75/60/40); not seeded in tbl_dim_metric_definition | Cannot validate score_band assignment; AC-PM-7 partially untestable |
| U-3 | Required artifact list per phase is not confirmed; tbl_dim_artifact_type.required_flag exists but the actual set of required artifacts per phase per PoC is unknown | AC-PM-5 untestable |
| U-4 | "waiting review" concept: no waiting_review_flag in DB; may map to ticket_status=IN_REVIEW, or needs new column | KPI card "Waiting Review" count logic undefined |
| U-5 | "exception" concept: no exception_flag or exception_status in tbl_fact_risk or any existing table | Risk/Exception KPI card and drawer exception section have no data source |
| U-6 | Permission matrix for PM, Admin, read-only viewer: which roles can export? which can refresh? | AC-PM-11 and AC-PM-12 untestable; export/refresh feature cannot be guarded |
| U-7 | Export format (CSV? PDF? XLSX?) and whether export creates an audit log entry | Export feature cannot be designed |
| U-8 | Definition of "open issues" for this dashboard: does it map to tbl_fact_risk with status=OPEN, a separate open_issue table (does not exist), or something else? | "Open Issues" KPI card count logic undefined |
| U-9 | Whether PM Dashboard should query existing tables directly or use a new precomputed snapshot table (tbl_fact_ticket_dashboard_snapshot) | Determines DB migration scope and read performance strategy |
| U-10 | Auth mechanism inconsistency: architecture.md says JWT/Bearer token; security.md says OAuth2 session cookies. Which is active? | Affects how PM Dashboard API endpoints are secured |

---

## Expected Risks

| risk | likelihood | impact | mitigation |
|---|---|---|---|
| DB design document proposes tables that duplicate existing ones | Confirmed | High — schema conflicts will block Flyway migration | Must map proposed tables to existing tables before writing migrations; do not apply database_design.md directly |
| EQS formula undefined → implementation of score computation blocked | High | High — AC-PM-7 and AC-PM-8 cannot be tested | Block on U-1 until formula is confirmed |
| No permission model defined → export/refresh feature cannot be safely implemented | High | Medium — features must be left out or guarded by placeholder | Block on U-6; implement permission stub only |
| "waiting review" and "exception" concepts have no DB representation → KPI card counts will be zero or incorrect | High | Medium — 2 of 8 KPI cards will be non-functional | Define DB representation in open issues before implementation |
| Score band thresholds from wireframe may differ from intended business values | Medium | Medium — score band displayed incorrectly | Confirm thresholds with human before seeding |
| vw_artifact_inventory_current view may become stale if new columns are added to fact tables | Low | Medium — dashboard queries may not see new data | Add new columns to view definition when adding snapshot table |

---

## What AI Needs to Investigate

The following were already investigated during Phase 1 and results are incorporated above:
- [x] Existing Flyway migrations for schema conflicts
- [x] Existing score_band ENUM and tbl_fact_evidence_quality_score structure
- [x] Existing risk, phase status, artifact snapshot table structures
- [x] Architecture layers (hexagonal — web/application/infrastructure/domain)
- [x] Auth mechanism (session cookie, no JWT per security.md)
- [x] Testing strategy (JUnit5/Mockito BE; Vitest/Playwright FE, no tests exist yet)

Remaining investigation (blocked by missing human input):
- [ ] Confirm the EQS formula (needs human/product owner)
- [ ] Confirm the `open issues` definition (needs human/PM)
- [ ] Confirm the permission matrix (needs human/architect)

---

## What Humans Need to Ask

1. **EQS formula**: What is the exact formula for Evidence Quality Score? What weight does each sub-score have? What version label should be used for the PoC?
2. **Score band thresholds**: Are the wireframe thresholds (90/75/60/40) correct, or are different values intended?
3. **Required evidence list per phase**: For each phase (spec, plan, review, test, report, etc.) what is the required artifact list? Is the current tbl_dim_artifact_type.required_flag set correctly for all phases?
4. **"Waiting review" definition**: Does "waiting review" mean `ticket_status = IN_REVIEW`? Or a separate state? Should a new column be added to the snapshot table?
5. **"Exception" definition**: What is an "exception"? Is it a separate concept from risk? Does it need a new table column or a new table?
6. **"Open issues" definition**: For this dashboard, what does "open issue" mean? Is it `tbl_fact_risk.status = 'OPEN'`? Or a different table/concept?
7. **Permission matrix**: Which application roles can view the PM Dashboard? Which can export? Which can trigger refresh? Is there a `PM` role in the system already?
8. **Export format and audit**: What file format should export produce? Does export need to be logged for audit purposes?
9. **Auth mechanism**: Confirm whether the PM Dashboard API should use session cookies (as per security.md) or JWT Bearer tokens (as per architecture.md).
10. **DB design document intent**: Should the dashboard build new snapshot tables or query existing tables (tbl_fact_evidence_quality_score, tbl_fact_risk, etc.) directly?

---

## Conditions Under Which Implementation Is Not Permitted

The following conditions must be resolved before any implementation work begins:

1. **EQS formula undefined (U-1).** Score computation cannot be implemented. `tbl_fact_evidence_quality_score` has a `score_rule_version` column that requires a versioned formula. Without the formula, the score value will be arbitrary and AC-PM-7 / AC-PM-8 cannot be verified.

2. **Permission matrix absent (U-6).** Export and refresh endpoints cannot be implemented without knowing which roles are permitted. Implementing them without permission guards would be a security gap.

3. **Required evidence list per phase not confirmed (U-3).** The "Missing Evidence" KPI card and the missing evidence detail section of the drawer cannot show correct data. AC-PM-5 cannot be verified.

4. **DB schema conflict between proposed tables and existing tables (U-9).** Writing Flyway migrations based on `database_design.md` as-is would produce duplicate or conflicting schema objects. Migration must only proceed after the overlap is resolved and the final schema is agreed.

5. **"Open issues" definition absent (U-8).** The "Open Issues" KPI card cannot be implemented correctly. If implemented with an incorrect assumption (e.g. counting tbl_fact_risk status=OPEN as "open issues") and the definition changes later, data already displayed will be wrong.
