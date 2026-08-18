# Requirement Document - PM Dashboard

**Ticket ID**: PM-DASHBOARD  
**Create date**: 2026-06-25  
**Author**: codex  
**Update date**: 2026-06-25  

---

## 1. Screen Overview

- **Screen name:** PM Dashboard
- **Business purpose:** Help PM users quickly see which tickets are blocked, where the phase bottleneck is, which evidence items are missing, which tickets carry risk or exception signals, and how the Evidence Quality Score is trending.
- **Reason for creating the screen:** Chapter 9 of the SDD evidence platform defines a PM dashboard view that focuses on missing evidence, phase delay, open issues, risk, exception, and score-based decision support.
- **Goal of this version:** Deliver a PoC dashboard that is clear, role-based, and focused on `missing evidence`, `risk`, and `score` without turning it into a full BI or admin screen.

---

## 2. Scope

### 2.1 In Scope

- Display the PM Dashboard landing view.
- Show KPI cards for blocked tickets, missing evidence, open issues, waiting review, CI failure, risk / exception, and Evidence Quality Score.
- Search tickets by ticket ID, title, phase, repository, or keyword.
- Filter dashboard data by project, sprint / period, repository, phase, status, score band, and risk level.
- Show a ticket table of tickets that need PM follow-up.
- Show missing evidence details per ticket, including spec / plan / test / report gaps.
- Show risk / exception indicators per ticket.
- Show Evidence Quality Score and score band per ticket.
- Support drill-down from KPI card or ticket row to a detail drawer / popup.
- Support export of visible dashboard data if permission allows.
- Support data refresh from the current source of truth.

### 2.2 Out of Scope

- Editing source evidence files from the dashboard.
- Managing project / repository / team master data.
- QA-only dashboards such as AC-Test Coverage.
- Security-only dashboards such as secret scan review.
- Executive-only reporting and cross-project governance screens.
- Raw AI chat log storage or display.
- Personal performance ranking, leaderboards, or individual scoring.
- Full DWH / analytics platform administration.

> Note: This feature is a PM-facing operational dashboard, not a replacement for the full evidence platform or a general-purpose BI workspace.

---

## 3. Current State Summary

- PM users may need to inspect multiple artifacts manually to understand whether a ticket is ready.
- Missing evidence, open issues, risk, and score are not consolidated into a single PM-focused view.
- The dashboard concept already exists in Chapter 9, but the PoC scope must explicitly emphasize `missing evidence`, `risk`, and `score`.
- There is no standard PM dashboard spec in the current raw ticket folder for this feature.

---

## 4. Target State Summary

- A PM Dashboard screen is available.
- PM users can immediately see blocked items and the main bottleneck phase.
- PM users can identify tickets with missing evidence in one place.
- PM users can see risk and exception indicators tied to each ticket.
- PM users can see an Evidence Quality Score plus a score band and breakdown.
- PM users can drill down from summary cards to ticket detail.
- The dashboard remains role-based and avoids personal ranking.

---

## 5. Change Requirements

| Section | Current State | Target State | Requirement | Keep / Change / New | Notes |
|---|---|---|---|---|---|
| PM Overview | Not available as a dedicated PM dashboard spec | PM dashboard landing page | Show a concise operational dashboard for PM follow-up | New | Focus on missing evidence, risk, score |
| KPI Cards | Not standardized | KPI card strip | Show blocked tickets, missing evidence, open issues, waiting review, CI fail, risk / exception, and score | New | PoC metrics only |
| Attention List | Not available | Ticket attention table | Show tickets that need action with phase, reason, age, owner display, and score | New | Drill-down required |
| Missing Evidence | Not consolidated | Missing evidence panel | Show which artifacts are missing for each ticket | New | Spec / Plan / Test / Report at minimum |
| Risk / Exception | Not consolidated | Risk indicators | Show ticket risk, exception, and blocker signals | New | No personal ranking |
| Score | Not shown in PM view | Score summary and band | Show Evidence Quality Score and score band | New | Breakdown must be explainable |
| Export / Refresh | Not standardized | Supported if allowed | Export visible data and refresh dashboard state | New | Permission-based |

---

## 6. Functional Requirements

### 6.1 PM Dashboard Overview

- Display a PM dashboard landing screen.
- Show the main operational summary at the top.
- Show the current update timestamp.
- Allow PM users to understand status without opening every ticket.

### 6.2 Dashboard Filters and Search

- Allow search by ticket ID, ticket title, repository, phase, or keyword.
- Allow filtering by project.
- Allow filtering by sprint / period.
- Allow filtering by repository.
- Allow filtering by phase.
- Allow filtering by score band.
- Allow filtering by risk level or exception state.

### 6.3 Missing Evidence View

- Show whether a ticket is missing spec, plan, test, report, or other required evidence.
- Highlight the missing items clearly.
- Allow drill-down to see the exact missing artifact names or categories.
- Show missing evidence as a PM action signal, not as a hidden internal detail.

### 6.4 Risk and Exception View

- Show tickets with risk or exception signals.
- Surface blocker, major risk, overdue follow-up, or exception status.
- Keep the presentation focused on project/process risk.
- Do not present the dashboard as a personal scoring or surveillance tool.

### 6.5 Evidence Quality Score

- Show an Evidence Quality Score for each ticket.
- Show the score band, such as `Excellent`, `Good`, `Warning`, `Risky`, or `Critical`.
- Show a short breakdown explaining why the score is high or low.
- Allow PM users to drill into the components used to compute the score.

### 6.6 Attention List

- Show a ranked or ordered list of tickets that need PM attention.
- Each row should show ticket ID, phase, reason, age, owner display, and score.
- The list should support click-through to detail.

### 6.7 Detail Drill-Down

- Show a ticket detail drawer or popup when a KPI card or row is clicked.
- Show missing evidence, risk, score, and traceability summary in the detail view.
- Show the detail in a read-only mode.

### 6.8 Export / Refresh

- Allow export of visible data if the user has permission.
- Allow dashboard refresh if the user has permission.
- Do not require a reset action in the PoC scope.

---

## 7. Data Items

| Field | Meaning | Notes |
|---|---|---|
| Project | Project scope | Used for filter and grouping |
| Sprint / Period | Time window | Used for PM follow-up |
| Repository | Source repository | Used for grouping and drill-down |
| Ticket ID | Ticket identifier | Primary row key |
| Ticket Title | Ticket title / summary | Displayed in list and detail |
| Phase | Current phase | Used for bottleneck analysis |
| Missing Evidence Count | Count of missing required artifacts | Shown on cards and list |
| Missing Evidence Items | Missing artifact types or names | Spec / plan / test / report etc. |
| Open Issues Count | Count of unresolved issues | PM follow-up signal |
| Risk Count | Count of risk items | Risk / exception signal |
| Exception Count | Count of exceptions | Optional separate indicator |
| Evidence Quality Score | 0-100 score | Must be explainable |
| Score Band | Score category | Example: Good / Warning / Critical |
| Age / Delay | Days since last progress | Used for bottleneck view |
| Owner Display | Role-based owner display | Do not use personal ranking |
| Updated Date | Last refresh timestamp | Shown in list/detail |

---

## 8. Acceptance Criteria

- **AC-PM-1:** PM users can access the PM Dashboard screen.
- **AC-PM-2:** The dashboard shows KPI cards for blocked tickets, missing evidence, open issues, waiting review, CI fail, risk / exception, and score.
- **AC-PM-3:** Users can filter the dashboard by project, sprint / period, repository, phase, score band, and risk level.
- **AC-PM-4:** Users can search tickets by ticket ID, title, repository, phase, or keyword.
- **AC-PM-5:** The dashboard shows tickets with missing evidence clearly.
- **AC-PM-6:** The dashboard shows risk and exception indicators clearly.
- **AC-PM-7:** The dashboard shows Evidence Quality Score and score band for each visible ticket.
- **AC-PM-8:** The score is explainable through a breakdown or drill-down.
- **AC-PM-9:** Clicking a KPI card or ticket row opens a detail view.
- **AC-PM-10:** The dashboard does not display personal ranking or individual performance scoring.
- **AC-PM-11:** Export is available only if the user has permission.
- **AC-PM-12:** Refresh is available only if the user has permission.
- **AC-PM-13:** The dashboard remains read-only for source evidence.

---

## 9. Open Points for Spec Pack

The following points are not fully finalized in the raw requirement and should be organized in `spec-pack.md`:

- Exact formula and versioning for Evidence Quality Score.
- Exact score band thresholds.
- Required evidence list per ticket phase.
- Whether `waiting review` is separate from `blocked` in the PM dashboard model.
- Whether risk and exception are stored in one summary table or multiple fact tables.
- Permission matrix for PM, Admin, and other role-based viewers.
- Export format and audit logging rules.
- Exact definition of `open issues` for this dashboard.
