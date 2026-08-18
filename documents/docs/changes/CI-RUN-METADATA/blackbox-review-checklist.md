# Black-box Review Checklist

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17  
**Author**: ChatGPT
**Update date**: 2026-06-18  

---

## How to use

- Each reviewer marks OK / FAIL / SKIP with justification.
- Any FAIL P0 item blocks the release of the test-design artifact.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.
- This checklist reviews the black-box test design and test data, not implementation internals.

---

## Category 1 - Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Workflow run with exactly one job still stores exactly one CI row | AC-CI-RUN-METADATA-1 | P0 | OK | |
| 1.2 | Running or queued job keeps `completed_at` null | AC-CI-RUN-METADATA-9 | P0 | OK | |
| 1.3 | `completed_at` earlier than `started_at` is rejected or skipped | AC-CI-RUN-METADATA-2 | P1 | OK | |

---

## Category 2 - Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Authorized user can see CI metadata in ticket evidence detail | AC-CI-RUN-METADATA-12 | P0 | OK | |
| 2.2 | Unauthorized user cannot see CI metadata or CI URL | AC-CI-RUN-METADATA-12 | P0 | OK | |
| 2.3 | Repository or project scope is enforced before showing evidence | AC-CI-RUN-METADATA-12 | P0 | OK | |

---

## Category 3 - Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Job URL is preferred when present | AC-CI-RUN-METADATA-3 | P0 | OK | |
| 3.2 | Workflow run URL is used as fallback when job URL is missing | AC-CI-RUN-METADATA-4 | P0 | OK | |
| 3.3 | Ticket detail shows workflow name, job name, status, timestamps, and URL in stable shape | AC-CI-RUN-METADATA-12 | P0 | OK | |

---

## Category 4 - Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Repository unresolved case does not create orphan CI rows | AC-CI-RUN-METADATA-5 | P0 | OK | |
| 4.2 | GitHub API failure is recorded in connector run | AC-CI-RUN-METADATA-10 | P0 | OK | |
| 4.3 | Same job collected twice updates or skips without duplicate insert | AC-CI-RUN-METADATA-8 | P0 | OK | |

---

## Category 5 - Performance / Degradation Signals

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Workflow run with multiple jobs creates one row per job | AC-CI-RUN-METADATA-1 | P0 | OK | |
| 5.2 | Connector run counters remain visible when the run fails | AC-CI-RUN-METADATA-10 | P1 | OK | |
| 5.3 | Ticket evidence detail can render without visible missing-field breakdowns | AC-CI-RUN-METADATA-12 | P1 | OK | |

---

## Category 6 - Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Exactly one row is stored per GitHub Actions job | AC-CI-RUN-METADATA-1 | P0 | OK | |
| 6.2 | Required metadata fields are stored on each CI row | AC-CI-RUN-METADATA-2 | P0 | OK | |
| 6.3 | PR and ticket linkage remain nullable when not resolvable | AC-CI-RUN-METADATA-6, AC-CI-RUN-METADATA-7 | P1 | OK | |

---

## Category 7 - i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Forbidden raw logs, secrets, tokens, private keys, and artifacts are not persisted | AC-CI-RUN-METADATA-11 | P0 | OK | |
| 7.2 | Connector run records failure without exposing sensitive provider data | AC-CI-RUN-METADATA-10, AC-CI-RUN-METADATA-11 | P0 | OK | |
| 7.3 | CI job metadata remains visible through operational evidence output | AC-CI-RUN-METADATA-12 | P1 | OK | |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer |  |  |  |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
