# Organization Management Knowledge

## Purpose

Capture the smallest reusable lessons from the Organization ticket.
This file is for durable patterns, not for full report history.

---

## Reusable Patterns

| Pattern | Why it matters | Where to reuse |
|---|---|---|
| Separate test evidence from final report | Keeps `test-results.md` focused on commands, outputs, and evidence while `report.md` stays on closure, risk, and open issues | Future ticket handoff docs |
| Save clean verification logs before sign-off | A clean `mvn clean verify` / FE clean run provides a reproducible end-state artifact for review | Pre-release verification and sign-off flows |
| Attach a short Playwright summary with trace files | Traces help debugging, but a brief summary is faster to review and archive | E2E test evidence packaging |
| Scope Playwright option clicks to the active popup container | Prevents strict-mode collisions when the same label also appears in the list row or in the drawer | E2E tests with searchable select/dropdown options |
| Use partial unique indexes for soft-delete reuse | Prevents duplicate active rows while allowing reuse after delete | DB migration design for soft-delete entities |
| Keep `version` checks atomic on update/delete | Avoids lost updates and stale overwrite/delete behavior | Any mutable entity with concurrent edits |
| Enforce admin-only behavior in both service and UI | Backend checks protect the contract; UI gating improves feedback | Admin-only screens and mutations |

---

## When Not to Promote

- Do not generalize a process issue into a global rule if it only happened once.
- Do not add new standards unless multiple tickets are likely to reuse the pattern.
- Keep this file short; if a pattern grows, move the detailed explanation into `docs/standards/`.
