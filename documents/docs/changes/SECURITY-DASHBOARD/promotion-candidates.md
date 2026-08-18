# Promotion Candidates

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-SECURITY-001 | Read-only Dashboard Pattern | docs/architecture/dashboard-pattern.md | Shared by PM / QA / Developer / Data Ops / Security dashboards | High |
| LD-SECURITY-002 | Ticket-based Dashboard Table Pattern | docs/architecture/dashboard-pattern.md | Repository may contain multiple tickets; ticket-level review is reusable | High |
| LD-SECURITY-003 | Existing Metadata Aggregation Pattern | docs/architecture/dashboard-pattern.md | Dashboard should aggregate existing metadata instead of creating new persistence | High |
| LD-SECURITY-004 | Dashboard KPI + Detail Drawer UX Pattern | docs/architecture/frontend-dashboard.md | Consistent Dashboard UX across modules | Medium |
| LD-SECURITY-005 | Existing Dashboard Component Reuse | docs/architecture/frontend-dashboard.md | Avoid duplicated FE implementation | Medium |

---

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| RULE-SECURITY-001 | Dashboard shall remain read-only | .claude/rules/dashboard.md | Applies to every operational dashboard | Low |
| RULE-SECURITY-002 | Dashboard shall aggregate existing metadata only | .claude/rules/dashboard.md | Prevent duplicated persistence | Low |
| RULE-SECURITY-003 | Dashboard shall not execute operational modules | .claude/rules/dashboard.md | Dashboard is consumer only | Low |

> These rules are generic enough to benefit every Dashboard implementation.

---

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| STD-SECURITY-001 | Dashboard KPI naming convention | docs/standards/dashboard.md | Consistent KPI naming |
| STD-SECURITY-002 | Dashboard REST response structure | docs/standards/api.md | Consistent FE / BE contract |
| STD-SECURITY-003 | Ticket Detail Drawer layout | docs/standards/frontend.md | Common UX |
| STD-SECURITY-004 | Dashboard Filter layout | docs/standards/frontend.md | Shared Dashboard component |

---

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| ARC-SECURITY-001 | Dashboard aggregation architecture | docs/architecture/dashboard-pattern.md | Metadata-first Dashboard architecture |
| ARC-SECURITY-002 | Dashboard data flow | docs/architecture/dashboard-pattern.md | Browser → Controller → Service → Repository → Existing Metadata |
| ARC-SECURITY-003 | Ticket-based Dashboard design | docs/architecture/frontend-dashboard.md | Applicable to future dashboards |

---

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-SECURITY-001 | Dashboard introduces duplicated persistence | Developer creates dashboard-specific table | Always aggregate existing metadata | Code Review / Migration Review |
| FMI-SECURITY-002 | Dashboard accidentally becomes writable | POST / PUT / DELETE endpoint added | Dashboard APIs remain GET-only | API Review |
| FMI-SECURITY-003 | Dashboard aggregates incorrect enum values | Different modules use inconsistent status values | Reuse existing enums/constants | Unit Test |
| FMI-SECURITY-004 | Repository-level dashboard hides ticket-level issues | Dashboard grouped only by Repository | Review at Ticket level while aggregating KPI by Repository | Black-box Test |

---

## Not Promoted

| item | reason |
|---|---|
| Final Security Verdict calculation | Business rule specific to Security Dashboard |
| Security Alert calculation | Product decision pending |
| Exception Priority | Business rule |
| Checklist Weighting | Business rule |
| Export capability | Feature-specific requirement |
| Security Score | PoC-specific, not reusable |
| Safety Pack status values | Existing module-specific implementation |

These items should remain inside the Security Dashboard specification and **must not** become global project rules.

---

## Human Approval Required

| item | owner | reason |
|---|---|---|
| Dashboard Pattern | Architecture Owner | Shared architecture update |
| Dashboard Rule | Tech Lead | New global engineering rule |
| Dashboard Standard | Frontend Lead | Shared FE convention |
| Failure Mode | QA Lead | Organization-wide reusable lesson |
| Living Docs | Architecture Board | Prevent documentation drift |