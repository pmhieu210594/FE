# Wireframe - PM Dashboard

**Ticket ID**: PM-DASHBOARD  
**Create date**: 2026-06-25  
**Author**: codex  
**Update date**: 2026-06-25  

---

## 1. Screen Objective

The PM Dashboard screen allows PM users to quickly review:

- blocked tickets
- phase bottlenecks
- missing evidence
- open issues
- risk / exception signals
- Evidence Quality Score

The screen is operational and read-only. It is not a customer-facing report and not a personal performance ranking page.

---

## 2. Overall Layout

```text
+--------------------------------------------------------------------------------------------------+
| Search ticket, PR, AC, phase, connector, finding...                 [Export] [Refresh]         |
+--------------------------------------------------------------------------------------------------+

+-----------------------------+  +-----------------------------+  +-----------------------------+
| Project                     |  | Sprint / Period             |  | Repository                  |
| All Projects                |  | Last 7 days                 |  | All Repos                   |
+-----------------------------+  +-----------------------------+  +-----------------------------+

+-----------------------------+  +-----------------------------+  +-----------------------------+
| Privacy                     |  | Updated                     |  |                             |
| Role-based                  |  | 2026-06-09 09:30            |  |                             |
+-----------------------------+  +-----------------------------+  +-----------------------------+

Tabs: [PM] [QA] [Development] [Security] [Executive] [Data Ops]

Dashboard PM
Ticket bi dung, phase tre, thieu evidence, Open Issues, Risk va Exception.

+-----------------------------+  +-----------------------------+  +-----------------------------+
| Tien do ticket              |  | Thieu Evidence              |  | Open Issues                 |
| 12                          |  | 9                           |  | 36                          |
| So luong theo phase,        |  | Chua tao spec / plan /      |  | Issue chua giai quyet,      |
| so ngay tri tre, qua han    |  | test / report               |  | han, role phu trach         |
+-----------------------------+  +-----------------------------+  +-----------------------------+

+-----------------------------+  +-----------------------------+  +-----------------------------+
| Cho review                  |  | CI that bai                 |  | EQS                         |
| 8                           |  | 6                           |  | 9.2 / Good                  |
| PR review requested,        |  | Phan loai nguyen nhan,      |  | Score tong hop cua ticket   |
| cho phe duyet               |  | so lan chay lai             |  | va score band               |
+-----------------------------+  +-----------------------------+  +-----------------------------+

+----------------------------------------------------------------------------------+  +--------------------------------------+
| All tickets                                                                       |  | Phase Bottleneck                     |
| Ticket | Repository | Project | Status | Quality Band | Total Score | Age | Owner |  |                                      |
| ABC-124 | Repo Alpha | Project Alpha | Traceability issues (10) | WARNING | 68 | 4d | Backend Role |  |  4                                   |
| ABC-130 | Repo Beta | Project Beta | Missing evidence (3) | CRITICAL | 42 | 2d | Reviewer Role |  |      7                               |
|                                                                                  |  |          9                           |
|                                                                                  |  |      6                               |
+----------------------------------------------------------------------------------+  +--------------------------------------+
```

There is no personal ranking widget on this screen.

---

## 3. PM Dashboard Main View

```text
+------------------------------------------------------------------------------------------------------+
| Dashboard PM                                                                                         |
| Ticket bi dung, phase tre, thieu evidence, Open Issues, Risk va Exception.                          |
| EQS 9.2 / Good                                                                                       |
+------------------------------------------------------------------------------------------------------+

+----------------------+ +----------------------+ +----------------------+ +----------------------+ +----------------------+ +----------------------+
| Tien do ticket       | | Thieu Evidence       | | Open Issues          | | Cho review           | | CI that bai          | | EQS                  |
| 12                   | | 9                    | | 36                   | | 8                    | | 6                    | | 9.2 / Good           |
+----------------------+ +----------------------+ +----------------------+ +----------------------+ +----------------------+ +----------------------+

+------------------------------------------------------------------------------------------------------+  +--------------------------------------+
| All tickets                                                                                          |  | Phase Bottleneck                     |
| TICKET   | REPOSITORY | PROJECT | STATUS | Q.BAND | SCORE | AGE | OWNER DISPLAY                       |  |                                      |
| ABC-124  | Repo Alpha | Project Alpha | Traceability issues (10) | WARNING | 68 | 4d  | Backend Role                          |  |              Spec  4                 |
| ABC-130  | Repo Beta  | Project Beta  | Missing evidence (3)      | CRITICAL | 42 | 2d | Reviewer Role                         |  |         Plan   7                     |
|          |         |                   |     |                                                       |  |               Test   9               |
|          |         |                   |     |                                                       |  |           Report   6                 |
+------------------------------------------------------------------------------------------------------+  +--------------------------------------+
```

### Notes

- The top search field is the primary entry point for ticket lookup.
- Export and refresh sit at the far right of the toolbar to match the reference layout.
- Project, sprint, repository, privacy, and updated metadata are shown as compact filter cards.
- The six KPI cards are arranged in two rows of three.
- The score indicator can be shown as a compact badge beside the title, not necessarily as a full card.
- The lower section combines the main ticket table and the phase bottleneck chart.
- The All tickets table should support click-through to detail.

---

## 4. Empty State

```text
+--------------------------------------------------------------------------------------+
| PM Dashboard                                                                         |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| No tickets found for the current filters.                                             |
| Try changing project, sprint, repository, phase, score band, or risk filters.        |
|                                                                                      |
| [Reset Filters]                                                                      |
+--------------------------------------------------------------------------------------+
```

### Notes

- The empty state should explain why no data is shown.
- It should not expose raw evidence data or internal technical errors.

---

## 5. Ticket Detail Drawer

```text
+----------------------------------------------------------------------------------------------+
| Ticket Detail                                                                [Close]        |
+----------------------------------------------------------------------------------------------+
| Ticket ID                ABC-124                                                          |
| Ticket Title             Improve order validation                                          |
| Project                  EDCAP                                                              |
| Repository               EDCAP_BE                                                           |
| Phase                    Plan                                                               |
| Evidence Quality Score   68 / Warning                                                       |
| Updated At               2026-06-25 09:30                                                  |
+----------------------------------------------------------------------------------------------+
| Missing Evidence                                                                          |
| - impl-plan.md missing                                                                    |
| - report.md missing                                                                       |
|                                                                                            |
| Risk / Exception                                                                          |
| - High risk due to missing rollback                                                        |
| - No exception recorded                                                                   |
|                                                                                            |
| Score Breakdown                                                                           |
| Spec 15 | Scope 10 | AC 12 | Plan 5 | Review 8 | Test 9 | Report 4 | Penalty -5        |
+----------------------------------------------------------------------------------------------+
| [View Traceability]                                              [Export if permitted]     |
+----------------------------------------------------------------------------------------------+
```

### Notes

- The drawer is read-only.
- The score explanation must be human-readable.
- The traceability view should help PM understand what is missing.

---

## 6. Score / Risk Visual Guidance

### Score Bands

```text
90-100  Excellent
75-89   Good
60-74   Warning
40-59   Risky
0-39    Critical
```

### Risk Styling

- `Low` risk can use a neutral or amber badge.
- `Medium` risk can use a warning badge.
- `High` risk can use a red badge.
- `Exception` rows should be visually distinct from normal rows.

---

## 7. Out of Scope UI

The following UI items will not be created in this ticket:

- QA-specific AC coverage widgets.
- Developer-specific CI failure categories.
- Security-specific secret scan detail.
- Executive summary report export page.
- Admin configuration forms.
- Personal ranking or leaderboard views.
