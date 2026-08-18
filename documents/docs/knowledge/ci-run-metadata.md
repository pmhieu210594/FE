# CI Run Metadata Knowledge

## Purpose

Capture the smallest reusable lessons from the CI Run Metadata ticket.
This file is for durable patterns, not full ticket history.

---

## Reusable Patterns

| Pattern | Why it matters | Where to reuse |
|---|---|---|
| Job-granular CI ingestion | One `workflow_job` event maps cleanly to one persisted CI row, so identity must include provider + repository + run + job | Webhook or sync flows that ingest CI evidence |
| Job URL fallback chain | Prefer the job URL, fall back to the workflow run URL, and derive a URL only when both are missing | Any CI event mapper that needs a stable link to the source run |
| Explicit connector counters | `recordsReceived`, `recordsInserted`, `recordsUpdated`, `recordsSkipped`, and `recordsError` are better as operational evidence than as a single success flag | Collector / connector-run flows that need traceable outcomes |
| Hard stop on missing repository | Do not persist a CI row if repository resolution fails; treat PR/ticket linkage as best-effort instead | Webhook-backed fact ingestion |

---

## When Not to Promote

- Do not turn ticket-specific class names or payload keys into a global rule.
- Do not duplicate a pattern if it is already short and clear in architecture or standards.
- Keep this file short; if a pattern grows, move the detail into `docs/architecture/`.
