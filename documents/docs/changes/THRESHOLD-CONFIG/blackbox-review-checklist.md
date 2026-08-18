# Black-box Review Checklist

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-22
**Author**: Claude
**Update date**: 2026-07-22

---

## How to use

- Each reviewer marks ✅ pass / ❌ fail / ⏭ skip (with justification).
- Any ❌ fail P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Single band covering the full `0-100` range is accepted as a valid minimum active set | AC-THRESHOLD-CONFIG-11 | P1 | [ ] | Resolved by `impact-analysis.md` §8: ≥1 active band required |
| 1.2 | Adjacent bands touching at a boundary (`0-39`/`40-59`) are accepted, not treated as a gap or overlap | AC-THRESHOLD-CONFIG-6, AC-THRESHOLD-CONFIG-7 | P0 | [ ] | See BB-024 |
| 1.3 | Exact score values at a band boundary (`0`, `39`, `40`, `74`, `75`, `100`) each resolve to exactly one band | AC-THRESHOLD-CONFIG-18 | P1 | [ ] | See BB-021 |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Non-ADMIN authenticated caller is rejected with HTTP 403 on both `GET` and `POST` | AC-THRESHOLD-CONFIG-12 | P0 | [ ] | See BB-014 |
| 2.2 | Unauthenticated caller is rejected with HTTP 401 before any controller logic runs | AC-THRESHOLD-CONFIG-12 | P0 | [ ] | See BB-025 |
| 2.3 | Role gate is enforced server-side (`requireAdmin`-equivalent), not only by hiding the Edit button in the FE | AC-THRESHOLD-CONFIG-12 | P0 | [ ] | Per spec-pack §13.1 |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | New endpoints do not break any existing `/api/v1/**` consumer | AC-THRESHOLD-CONFIG-1, AC-THRESHOLD-CONFIG-11 | P0 | [ ] | Net-new endpoints; per `impact-analysis.md` §7 |
| 3.2 | `GET`/`POST` success response shape is stable: flat array of `{id, code, label, minScore, maxScore, color}`, no envelope | AC-THRESHOLD-CONFIG-1, AC-THRESHOLD-CONFIG-11 | P0 | [ ] | See BB-001, BB-012 |
| 3.3 | Validation-error responses use the standard `ErrorResponse` shape (`timestamp, status, errorCode, message, traceId`), no ad-hoc status codes | AC-THRESHOLD-CONFIG-6..9 | P0 | [ ] | Per `security.md` §Error Responses |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | An invalid payload rolls back the entire batch — no partial soft-delete/update/insert commit | AC-THRESHOLD-CONFIG-11 | P0 | [ ] | See BB-013 |
| 4.2 | Concurrent conflicting saves are detected via `version`, second writer gets HTTP 409, not a silent overwrite | — (BR-THRESHOLD-CONFIG-012) | P1 | [ ] | See BB-026 |
| 4.3 | Empty/zero-active-band state at list time is handled cleanly (empty array, no crash) | AC-THRESHOLD-CONFIG-1 | P1 | [ ] | See BB-002 |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Score-band lookup does not add a DB round-trip per scoring event (in-memory cache, invalidated on save) | AC-THRESHOLD-CONFIG-17, AC-THRESHOLD-CONFIG-18 | P1 | [ ] | Per `impact-analysis.md` §6 |
| 5.2 | List/save operations remain responsive at the expected ~5-20 row scale | AC-THRESHOLD-CONFIG-1, AC-THRESHOLD-CONFIG-11 | P1 | [ ] | Per spec-pack §6.6 Performance row |
| 5.3 | No visible UI freeze/reload loop when toggling Edit Mode or saving | AC-THRESHOLD-CONFIG-2, AC-THRESHOLD-CONFIG-11 | P1 | [ ] | FE observation |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Active bands must jointly cover exactly `[0,100]` with no gaps and no overlaps at save time | AC-THRESHOLD-CONFIG-6, AC-THRESHOLD-CONFIG-7 | P0 | [ ] | BR-THRESHOLD-CONFIG-005 |
| 6.2 | Code uniqueness is scoped to active rows only; soft-deleted rows are excluded from the check and their data preserved unmodified | AC-THRESHOLD-CONFIG-8, AC-THRESHOLD-CONFIG-10 | P0 | [ ] | BR-THRESHOLD-CONFIG-008/009 |
| 6.3 | Soft-delete never physically removes a row; `delete_flag`/`updated_at` are set correctly | AC-THRESHOLD-CONFIG-5 | P0 | [ ] | BR-THRESHOLD-CONFIG-010 |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | No hardcoded literal label/button/status strings — all text switches with the active locale | AC-THRESHOLD-CONFIG-14 | P1 | [ ] | See BB-016 |
| 7.2 | Validation/authorization error messages map consistently to documented error codes (`DOMAIN_RULE_VIOLATION`, `VALIDATION_ERROR`, `FORBIDDEN`, `CONFLICT`) | AC-THRESHOLD-CONFIG-6..9, AC-THRESHOLD-CONFIG-12 | P1 | [ ] | Per `error-handling.md` mapping |
| 7.3 | Create/update/soft-delete actions produce audit-log entries with no PII/stack traces leaked | — (spec-pack §14, `impact-analysis.md` §12) | P0 | [ ] | See BB-027 |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer |  |  |  |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
