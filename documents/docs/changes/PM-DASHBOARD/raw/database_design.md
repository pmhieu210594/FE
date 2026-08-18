# Database Design - PM Dashboard

**Ticket ID**: PM-DASHBOARD  
**Create date**: 2026-06-25  
**Author**: codex  
**Update date**: 2026-06-25  

---

## 1. Purpose

This document describes the database design for the **PM Dashboard** PoC.

The goal is to support dashboard rendering for:

- missing evidence
- risk / exception visibility
- Evidence Quality Score
- PM ticket table and drill-down

This document follows a `tbl_`-only naming rule for proposed persistence objects.

---

## 2. Data Model Overview

The dashboard should be built from ticket-level summary facts rather than raw chat or raw UI state.

Suggested persistence areas:

| Table | Purpose |
|---|---|
| `tbl_dim_project` | Project master data |
| `tbl_dim_repository` | Repository master data |
| `tbl_dim_ticket` | Ticket master data |
| `tbl_dim_phase` | Phase master data, if already present |
| `tbl_fact_ticket_dashboard_snapshot` | Main PM dashboard snapshot per ticket and period |
| `tbl_fact_ticket_missing_evidence` | Missing evidence detail rows per ticket |
| `tbl_fact_ticket_risk` | Risk and exception summary rows per ticket |
| `tbl_fact_ticket_score` | Evidence Quality Score snapshot and breakdown |
| `tbl_fact_ticket_attention` | Optional precomputed ticket table for fast dashboard load |

If the project already has existing shared metric tables, the Spec Pack may map these concepts onto them instead of adding all new objects.

---

## 3. Main Snapshot Table

### 3.1 Proposed Table: `tbl_fact_ticket_dashboard_snapshot`

This table is the main read model for the PM Dashboard.

Suggested fields:

- snapshot_id
- project_id
- repository_id
- ticket_id
- period_key
- sprint_key
- phase_code
- ticket_status
- blocked_flag
- waiting_review_flag
- open_issue_count
- missing_evidence_count
- risk_count
- exception_count
- ci_fail_count
- evidence_quality_score
- score_band
- age_days
- owner_display
- reason_summary
- updated_at
- created_at
- definition_version

This table should be optimized for listing and filtering.

---

## 4. Missing Evidence Detail

### 4.1 Proposed Table: `tbl_fact_ticket_missing_evidence`

This table stores the missing evidence items that explain why a ticket is not ready.

Suggested fields:

- missing_evidence_id
- ticket_id
- project_id
- repository_id
- phase_code
- artifact_type
- artifact_name
- required_flag
- status
- missing_reason
- source_path
- evidence_scope
- detected_at
- updated_at

Rules:

- Store the missing item category, not raw sensitive content.
- Keep the table suitable for drill-down and PM follow-up.
- Do not store raw code, raw prompts, or raw secret content.

---

## 5. Risk / Exception Detail

### 5.1 Proposed Table: `tbl_fact_ticket_risk`

This table stores PM-visible risk and exception signals.

Suggested fields:

- risk_id
- ticket_id
- project_id
- repository_id
- phase_code
- risk_type
- severity
- status
- blocker_flag
- reason
- exception_flag
- exception_status
- due_date
- owner_display
- created_at
- updated_at

Rules:

- The dashboard should be able to show `risk` and `exception` together.
- The design should support overdue follow-up and blocked state analysis.
- No personal ranking data should be derived from this table.

---

## 6. Score Detail

### 6.1 Proposed Table: `tbl_fact_ticket_score`

This table stores the score snapshot and the score breakdown used by the dashboard.

Suggested fields:

- score_id
- ticket_id
- project_id
- repository_id
- period_key
- sprint_key
- evidence_quality_score
- score_band
- score_version
- spec_score
- scope_score
- ac_score
- plan_score
- review_score
- test_score
- report_score
- risk_adjustment_score
- missing_evidence_penalty
- computed_at
- updated_at

Rules:

- Keep the score explainable through breakdown columns or a linked breakdown table.
- Store the score version so changes in formula remain traceable.
- Do not store score as a personal productivity measure.

---

## 7. Optional Attention List Table

### 7.1 Proposed Table: `tbl_fact_ticket_attention`

This table can be used as a precomputed dashboard list for faster UI response.

Suggested fields:

- attention_id
- ticket_id
- project_id
- repository_id
- phase_code
- attention_type
- attention_priority
- attention_reason
- age_days
- owner_display
- score_band
- updated_at

This table is optional if the dashboard can query directly from the snapshot table.

---

## 8. Mapping Between Business / UI Fields and DB

| Business / UI Field | DB Column | Notes |
|---|---|---|
| Project | `project_id` | Filter / grouping key |
| Sprint / Period | `period_key`, `sprint_key` | Dashboard window |
| Repository | `repository_id` | Filter / grouping key |
| Ticket ID | `ticket_id` | Main row key |
| Phase | `phase_code` | Bottleneck analysis |
| Missing Evidence Count | `missing_evidence_count` | Main KPI and list column |
| Missing Evidence Items | `artifact_type`, `artifact_name` | Detail view |
| Open Issues Count | `open_issue_count` | Main KPI |
| Risk Count | `risk_count` | Main KPI and row signal |
| Exception Count | `exception_count` | Row signal |
| Evidence Quality Score | `evidence_quality_score` | 0-100 value |
| Score Band | `score_band` | Example: Good / Warning / Critical |
| Age / Delay | `age_days` | Used for attention ranking |
| Owner Display | `owner_display` | Role-based display value |
| Updated Date | `updated_at` | Last refresh timestamp |

---

## 9. Suggested Queries

### 9.1 Default PM Dashboard List

```sql
SELECT
    s.ticket_id,
    t.ticket_title,
    s.project_id,
    s.repository_id,
    s.phase_code,
    s.blocked_flag,
    s.waiting_review_flag,
    s.open_issue_count,
    s.missing_evidence_count,
    s.risk_count,
    s.exception_count,
    s.evidence_quality_score,
    s.score_band,
    s.age_days,
    s.owner_display,
    s.reason_summary,
    s.updated_at
FROM tbl_fact_ticket_dashboard_snapshot s
JOIN tbl_dim_ticket t
  ON t.ticket_id = s.ticket_id
WHERE s.period_key = :period_key
  AND (:project_id IS NULL OR s.project_id = :project_id)
  AND (:repository_id IS NULL OR s.repository_id = :repository_id)
  AND (:phase_code IS NULL OR s.phase_code = :phase_code)
  AND (:score_band IS NULL OR s.score_band = :score_band)
  AND (:risk_level IS NULL OR s.risk_count > 0)
ORDER BY s.age_days DESC, s.updated_at DESC;
```

### 9.2 Missing Evidence Drill-Down

```sql
SELECT
    m.ticket_id,
    m.phase_code,
    m.artifact_type,
    m.artifact_name,
    m.status,
    m.missing_reason,
    m.source_path,
    m.detected_at
FROM tbl_fact_ticket_missing_evidence m
WHERE m.ticket_id = :ticket_id
ORDER BY m.artifact_type, m.artifact_name;
```

### 9.3 Score Breakdown

```sql
SELECT
    s.ticket_id,
    s.evidence_quality_score,
    s.score_band,
    s.score_version,
    s.spec_score,
    s.scope_score,
    s.ac_score,
    s.plan_score,
    s.review_score,
    s.test_score,
    s.report_score,
    s.risk_adjustment_score,
    s.missing_evidence_penalty,
    s.computed_at
FROM tbl_fact_ticket_score s
WHERE s.ticket_id = :ticket_id
ORDER BY s.computed_at DESC
LIMIT 1;
```

---

## 10. Indexing Guidance

Suggested indexes:

- `(period_key, project_id, repository_id)`
- `(ticket_id, period_key)`
- `(score_band, evidence_quality_score)`
- `(phase_code, age_days DESC)`
- `(blocked_flag, waiting_review_flag)`
- `(ticket_id, computed_at DESC)` on score and risk tables

The actual index list should be finalized with the implementation team and the existing schema.

---

## 11. Key Rules

- The dashboard should be read-model friendly.
- The dashboard should not depend on raw chat logs or raw prompt text.
- Missing evidence must be explainable through detail rows.
- Risk / exception must be visible as PM operational signals.
- Score must be versioned and reproducible.
- No non-`tbl_` table names may be introduced in the ticket design.
