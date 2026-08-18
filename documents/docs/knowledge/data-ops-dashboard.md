# Data Ops Dashboard Knowledge

## Purpose

Capture the smallest reusable lessons from the Data Ops Dashboard ticket.
This file is for durable patterns, not for full report history.

---

## Reusable Patterns

| Pattern | Why it matters | Where to reuse |
|---|---|---|
| Keep operational dashboards read-only and read-model driven | Prevents dashboard work from drifting into writes or new persistence when the feature only summarizes existing platform data | Future operational dashboard tickets |
| Aggregate from existing V4 metadata before adding schema | Keeps dashboard implementation aligned with the existing warehouse tables and avoids duplicate persistence | Any dashboard that only needs operational metadata |
| Keep provisional KPI values in open issues, not rules | Product-owned thresholds and proxies can change; documenting them as temporary avoids freezing a guess into permanent guidance | KPI tickets with pending product decisions |

---

## When Not to Promote

- Do not turn a one-ticket KPI proxy into a permanent business rule.
- Do not add a new standard when the same point is already captured by architecture or a short failure mode.
- Keep this file short; if a pattern grows, move the detail into `docs/architecture/` or `docs/standards/`.
