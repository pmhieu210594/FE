# Black-box Review Checklist

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-18  
**Author**: nk_trung
**Update date**: 2026-06-18  

---

## How to use

- Each reviewer marks ✅ pass / ❌ fail / ⏭ skip with a short justification.
- Any ❌ fail P0 item blocks release.
- P1/P2 gaps should be linked to a follow-up ticket or an accepted risk note.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Active repository and PR number `1` are accepted for manual collect | AC-GIT-PR-METADATA-COLLECTOR-1, AC-GIT-PR-METADATA-COLLECTOR-2 | P0 | ✅ pass | |
| 1.2 | Missing ticket inference still persists metadata and does not fail the run | AC-GIT-PR-METADATA-COLLECTOR-12 | P1 | ✅ pass | |
| 1.3 | Multiple ticket candidates at the same priority are not auto-picked | AC-GIT-PR-METADATA-COLLECTOR-11 | P1 | ✅ pass | |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Non-admin manual collect is rejected | AC-GIT-PR-METADATA-COLLECTOR-3 | P0 | ✅ pass | |
| 2.2 | Unauthenticated manual collect is rejected | AC-GIT-PR-METADATA-COLLECTOR-3 | P0 | ✅ pass | |
| 2.3 | Manual collect API remains admin-only and is not exposed as public access | AC-GIT-PR-METADATA-COLLECTOR-3 | P0 | ✅ pass | |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Existing GitHub webhook endpoint remains the same entrypoint | AC-GIT-PR-METADATA-COLLECTOR-4 | P0 | ✅ pass | |
| 3.2 | Success response shape stays small and usable for webhook/manual flows | AC-GIT-PR-METADATA-COLLECTOR-4, AC-GIT-PR-METADATA-COLLECTOR-19 | P0 | ✅ pass | |
| 3.3 | Validation and signature errors stay safe and machine-readable | AC-GIT-PR-METADATA-COLLECTOR-5, AC-GIT-PR-METADATA-COLLECTOR-20 | P0 | ✅ pass | |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Invalid signature is rejected before payload processing | AC-GIT-PR-METADATA-COLLECTOR-5 | P0 | ✅ pass | |
| 4.2 | Provider failure is recorded safely without leaking raw content | AC-GIT-PR-METADATA-COLLECTOR-20, AC-GIT-PR-METADATA-COLLECTOR-21 | P0 | ✅ pass | |
| 4.3 | Empty or no-ticket state is handled clearly and does not stop the run | AC-GIT-PR-METADATA-COLLECTOR-12, AC-GIT-PR-METADATA-COLLECTOR-14 | P1 | ✅ pass | |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Large PR collection stays usable and completes or fails safely | AC-GIT-PR-METADATA-COLLECTOR-19, AC-GIT-PR-METADATA-COLLECTOR-20 | P2 | ✅ pass | |
| 5.2 | Repeated delivery does not create visible duplicate behavior | AC-GIT-PR-METADATA-COLLECTOR-18 | P0 | ✅ pass | |
| 5.3 | No visible freeze or retry loop is observed in the synchronous flow | AC-GIT-PR-METADATA-COLLECTOR-4, AC-GIT-PR-METADATA-COLLECTOR-20 | P1 | ✅ pass | |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Ticket inference priority follows title, branch, path, then commit message | AC-GIT-PR-METADATA-COLLECTOR-11 | P1 | ✅ pass | |
| 6.2 | PR status is normalized to OPEN/MERGED/CLOSED/UNKNOWN | AC-GIT-PR-METADATA-COLLECTOR-7 | P0 | ✅ pass | |
| 6.3 | Review state is normalized to APPROVED/CHANGES_REQUESTED/REVIEW_REQUIRED/UNKNOWN | AC-GIT-PR-METADATA-COLLECTOR-8 | P0 | ✅ pass | |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Success and error logs do not leak secrets, raw diffs, or source content | AC-GIT-PR-METADATA-COLLECTOR-21 | P0 | ✅ pass | |
| 7.2 | Error handling exposes traceId for triage | AC-GIT-PR-METADATA-COLLECTOR-20 | P0 | ✅ pass | |
| 7.3 | Run log / report output is sufficient for manual operations review | AC-GIT-PR-METADATA-COLLECTOR-19, AC-GIT-PR-METADATA-COLLECTOR-23 | P1 | ✅ pass | |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | nk_trung | 2026-06-12 | Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
