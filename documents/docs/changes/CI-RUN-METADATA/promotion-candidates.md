# Promotion Candidates

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17
**Author**: ChatGPT
**Update date**: 2026-06-18

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-CI-001 | GitHub Actions `workflow_job` is job-granular CI metadata, keyed by provider + repository + run + job | documents/docs/architecture/route-api-map.md | This is the durable data-grain decision behind the ticket: one job event becomes one persisted CI row, with job URL preferred and workflow URL fallback. | High |
| LD-CI-002 | Connector run counters are explicit operational evidence | documents/docs/knowledge/ci-run-metadata.md | `recordsReceived/Inserted/Updated/Skipped/Error` are reusable diagnostics for collector-style flows. | High |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| RL-CI-001 | Keep `workflow_job` handling job-granular only | documents/docs/standards/ticket-rules.md | Prevents future ambiguity between workflow-level and job-level ingestion. | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| ST-CI-001 | Add a reusable pattern for webhook-ingested operational counters | documents/docs/standards/logging.md | This ticket surfaced a repeatable way to log success, failure, and skipped counts for connector work. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| AR-CI-001 | Document the CI run metadata read/write path | documents/docs/architecture/data-flow.md | The ticket adds a new backend ingestion path that should be visible in the architecture flow. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-CI-001 | Missing existing CI row id on update path | Upsert update branch does not carry the persisted CI identifier | Read the existing row id before update and reuse it in the save path | Duplicate ingest integration test |
| FMI-CI-002 | Invalid getter usage on Lombok bean repositories | Adapter assumes record-style accessors on bean-based repositories | Match repository accessors to the actual bean type | Compile + unit test |
| FMI-CI-003 | Unsupported SQL constraint syntax in migration | Migration uses a constraint form the target path does not support | Use additive DDL that matches the active Flyway / PostgreSQL path | Migration review or migration test |
| FMI-CI-004 | Raw timestamp parse errors bubble as 500 | Webhook timestamp parsing is not normalized into a controlled validation error | Convert parse failures to a validation error and keep time-order normalization local | Negative payload test |

## Not Promoted

| item | reason |
|---|---|
| CI persistence exclusions | Already covered by documents/docs/standards/security.md and documents/docs/standards/logging.md; duplicating it here would add rule bloat. |
| Missing repository resolution must stop CI row write | Already expressed by the architecture / service flow and should stay an implementation check, not a new general rule. |
| Ticket-specific class names and field names | Keep exact names in architecture docs and code; do not turn them into cross-ticket rules. |
| Live GitHub delivery checklist | Not exercised in this run, so it is not a reusable pattern yet. |

## Human Approval Required

- Confirm whether `route-api-map.md` / `repository-db-map.md` is the preferred home for CI job-grain documentation.
- Confirm whether connector-run counter semantics should live in `documents/docs/standards/logging.md` or a connector-operations knowledge doc.