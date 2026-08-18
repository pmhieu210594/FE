# Artifact Scanner Knowledge

## Purpose

Capture the smallest reusable lessons from the Artifact Scanner ticket.
This file is for durable patterns, not for full report history.

---

## Reusable Patterns

| Pattern | Why it matters | Where to reuse |
|---|---|---|
| Keep the scanner metadata-only | Prevents the scanner from becoming a parser or content warehouse | Future evidence inventory / scanner tickets |
| Treat unknown tickets as recoverable | The run can continue without blocking the whole inventory pass | Any scanner that discovers new paths dynamically |
| Read current inventory from a view | Avoids stale answers when multiple scans exist | Any latest-snapshot read model |
| Derive `need_parse` from hash comparison | Gives parser handoff a simple and deterministic signal | Metadata-first parser pipelines |
| Keep black-box cases as the external contract | Makes it easy to verify behavior without overfitting to implementation | Backend features with review / ops surfaces |
| Separate execution evidence from closure evidence | Keeps `test-results.md` factual while `report.md` stays concise | Ticket phase-8 and phase-9 handoff docs |
| Preserve phase0 file lists and artifact-type seeds together | Prevents seed/config drift when phase0 scope changes | Any fixed-file inventory scanner |

---

## When Not to Promote

- Do not turn ticket-specific file names into a global rule unless they recur across multiple tickets.
- Do not add a new standard if the same point is already covered by a short failure mode or architecture note.
- Keep this file short; if a pattern grows, move the detailed explanation into `docs/standards/`.
