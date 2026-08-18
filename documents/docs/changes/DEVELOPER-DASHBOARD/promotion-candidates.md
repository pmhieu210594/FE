# Promotion Candidates

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-07-01
**Author**: OpenAI
**Update date**: 2026-07-01

---

## Candidates for Living Docs

| ID                 | candidate                                  | target doc                               | reason                                                | priority |
| ------------------ | ------------------------------------------ | ---------------------------------------- | ----------------------------------------------------- | -------- |
| LD-DEV-DASHBOARD-1 | Read-only Dashboard implementation pattern | `docs/architecture/dashboard-pattern.md` | Reusable by PM / QA / Security / Executive dashboards | High     |
| LD-DEV-DASHBOARD-2 | Dashboard aggregation guideline            | `docs/architecture/dashboard-pattern.md` | Standardize aggregation from existing evidence        | High     |
| LD-DEV-DASHBOARD-3 | Existing V4 table reuse guideline          | `docs/standards/database.md`             | Prevent duplicated persistence                        | Medium   |

---

## Candidates for Rules

| ID                   | rule candidate                                                       | target                       | reason                                 | risk of rule bloat |
| -------------------- | -------------------------------------------------------------------- | ---------------------------- | -------------------------------------- | ------------------ |
| RULE-DEV-DASHBOARD-1 | Dashboards must remain read-only unless explicitly approved          | `.claude/rules/dashboard.md` | Prevent unintended write operations    | Low                |
| RULE-DEV-DASHBOARD-2 | Dashboards should reuse existing evidence rather than duplicate data | `.claude/rules/database.md`  | Align with metadata-first architecture | Low                |

---

## Candidates for Standards

| ID                  | standard candidate               | target                        | reason                        |
| ------------------- | -------------------------------- | ----------------------------- | ----------------------------- |
| STD-DEV-DASHBOARD-1 | Dashboard API response structure | `docs/standards/api.md`       | Consistent FE/BE contract     |
| STD-DEV-DASHBOARD-2 | Dashboard KPI calculation        | `docs/standards/dashboard.md` | Consistent KPI implementation |

---

## Candidates for Architecture Docs

| ID                  | update candidate           | target                                   | reason                                            |
| ------------------- | -------------------------- | ---------------------------------------- | ------------------------------------------------- |
| ARC-DEV-DASHBOARD-1 | Dashboard aggregation flow | `docs/architecture/dashboard-pattern.md` | Explain Service → Repository → Existing V4 tables |
| ARC-DEV-DASHBOARD-2 | Dashboard component reuse  | `docs/architecture/frontend.md`          | Promote reusable dashboard components             |

---

## Candidates for Failure Mode Index

| ID                 | failure mode                                     | trigger                                  | prevention                      | detection               |
| ------------------ | ------------------------------------------------ | ---------------------------------------- | ------------------------------- | ----------------------- |
| FM-DEV-DASHBOARD-1 | Dashboard KPI uses incorrect enum values         | CI / Parser / Review enum mismatch       | Reuse existing enum definitions | Unit Test + Code Review |
| FM-DEV-DASHBOARD-2 | Dashboard duplicates existing persistence        | New dashboard-specific tables introduced | Reuse existing V4 tables        | Architecture Review     |
| FM-DEV-DASHBOARD-3 | Dashboard becomes writable                       | Write API accidentally added             | Read-only architecture review   | Security Review         |
| FM-DEV-DASHBOARD-4 | Dashboard aggregation does not match source data | Incorrect SQL aggregation                | Repository Unit Test            | Black-box verification  |

**Disposition (Phase 9):** FM-DEV-DASHBOARD-1/2/3 were written pre-implementation and turned out to be hypothetical — self-review.md confirms none of these three actually occurred (enum mapping correct, no new persistence, no write endpoint added). Not promoted; see Not Promoted table below. FM-DEV-DASHBOARD-4 was reframed based on what actually happened — see FMI-DEV-DASH-002 below instead of promoting it as originally worded.

Promoted instead, based on incidents that actually occurred during Phase 5/6 (not the pre-implementation guesses above) — added to `docs/maintenance/failure-mode-index.md` under "Developer-Dashboard-Derived Failure Modes":

| ID | failure mode | source |
| --- | --- | --- |
| FMI-DEV-DASH-001 | FE E2E fixture used a role value (`"DEVELOPER"`) not recognized by the route guard, which only accepts `PM \| QA \| DEV \| ADMIN` | test-results.md §5, §6 |
| FMI-DEV-DASH-002 | Final verdict can read as an unscoped PASS while a later test round (BE aggregation) is still pending | test-results.md §9, §10 |

---

## Not Promoted

| item                      | reason                                    |
| ------------------------- | ----------------------------------------- |
| CI Failure categorization | Business decision still pending           |
| Parser Warning KPI        | Requirement not finalized                 |
| Export behavior           | Specific to current PoC                   |
| Refresh interval          | Operational decision, not a reusable rule |
| FM-DEV-DASHBOARD-1 (KPI enum mismatch) | Hypothetical — no actual incident; enum mapping was verified correct in self-review.md. Risk class already covered by hexagonal-architecture review practice. |
| FM-DEV-DASHBOARD-2 (duplicated persistence) | Hypothetical — no migration or new table was introduced (self-review.md §2, AC-8). Already covered by `FMI-PM-002`. |
| FM-DEV-DASHBOARD-3 (dashboard becomes writable) | Hypothetical — no write endpoint was added (read-only checklist all PASS in self-review.md). Read-only scope is this ticket's own product decision, not a cross-ticket engineering invariant. |
| RULE-DEV-DASHBOARD-1 / RULE-DEV-DASHBOARD-2 | Ticket-specific scope decisions (ticket-rules.md), not invariants that should bind every future dashboard (e.g. a future ops dashboard may legitimately need actions like acknowledge/dismiss). Not added to `.claude/rules/`. |
| LD/ARC/STD-DEV-DASHBOARD-* (dashboard-pattern.md, API/KPI standards) | Cross-ticket architecture/standards changes require the approvals already listed in Human Approval Required below — not written this round. |
| Playwright strict-mode collision (duplicated "Review comments" label) | Recurrence of existing `FMI-CUS-001`; no duplicate entry added, noted as a cross-reference in failure-mode-index.md instead. |

---

## Human Approval Required

| item                               | owner              | reason                     |
| ---------------------------------- | ------------------ | -------------------------- |
| Dashboard implementation guideline | Architecture Owner | Shared architecture change |
| Dashboard API standard             | BE Lead            | API convention             |
| Dashboard KPI standard             | Product Owner      | Business definition        |
| Failure Mode updates               | QA Lead            | Quality governance         |
