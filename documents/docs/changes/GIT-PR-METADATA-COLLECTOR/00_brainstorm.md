# 00_brainstorm

**Ticket ID**: GIT-PR-METADATA-COLLECTOR  
**Create date**: 2026-06-17  
**Author**: nk_trung  
**Update date**: 2026-06-17  

## Purpose

Prepare the Phase 1 investigation notes for the Git/PR Metadata Collector ticket before promoting confirmed content into `spec-pack.md`.

This brainstorm file is not the single source of truth. Confirmed specification is promoted to:

```text
docs/changes/GIT-PR-METADATA-COLLECTOR/spec-pack.md
```

## Known Information

- This ticket is for MVP only.
- Git metadata collector and PR metadata collector are implemented together in one MVP function.
- PR is the main collection unit because a PR can provide PR metadata, source/target branches, commits, and changed files in one flow.
- CI metadata collector is out of scope for this ticket.
- Parser test result, Evidence Quality Score, AC-Test Coverage, security scan collection, AI review finding analysis, and NLP-based matching are out of scope.
- The collector must support two trigger paths:
  - webhook-based collection when Git provider sends PR events;
  - manual collection by Admin/Data Ops by repository or by PR number.
- Existing source already has `POST /api/v1/webhooks/github` and a `GithubWebhookService` that verifies HMAC signature before parsing payload.
- Existing webhook service supports PR actions `opened`, `synchronize`, `reopened`, and `closed`.
- Existing webhook service currently triggers Artifact Scanner when target branch is the repository default branch and action is scan-triggering.
- Existing Artifact Scanner scans `docs/changes/<TICKET>/` and records evidence file snapshots.
- Artifact Scanner is sufficient for MVP Evidence Inventory.
- Git/PR Metadata Collector must not replace Artifact Scanner.
- The combined traceability target is:

```text
Ticket
├─ Evidence Files from Artifact Scanner
└─ Development Activity from Git/PR Metadata Collector
   ├─ Pull Request
   ├─ Commit
   └─ Changed Files
```

- Existing DB migration already has:
  - `tbl_dim_ticket`
  - `tbl_fact_pull_request`
  - `tbl_fact_commit`
  - `tbl_fact_commit_changed_file`
  - `tbl_fact_pull_request_commit`
  - `tbl_fact_traceability_link`
  - `tbl_connector_run`
- `tbl_dim_ticket` stores ticket/change-unit metadata. It should not be treated as the PR table.
- One ticket may usually have one main PR in MVP operation, but the design must not hard-code `1 ticket = 1 PR`.
- A ticket can have multiple PRs, and a PR can also exist before evidence folder is created.
- The collector must be idempotent because manual rerun and webhook retry can happen.
- The collector must not store source code content, raw diff, raw patch, secrets, raw prompt, or raw chat logs.

## Undetermined Points

- First provider for MVP is not finally confirmed: GitHub or GitLab.
- Existing source strongly suggests GitHub first because GitHub webhook and GitHub adapters already exist.
- It is not yet confirmed whether to reuse and extend the existing `GithubWebhookService` or split Git/PR metadata collection into a separate use case called from the webhook service.
- Target branch policy is not fully confirmed: default branch only, `main`/`develop`, or configurable list.
- Review state source is not fully confirmed: PR reviews API, branch protection/checks, or initially `UNKNOWN` in MVP.
- DB design choice for changed files is not fully confirmed:
  - use existing commit-level changed-file table only; or
  - add PR-level changed-file table for PR summary granularity.
- Official ticket ID regex is not fully confirmed.
- Manual collect UI is not confirmed; API-only may be sufficient for MVP.
- Retry/backoff policy for provider API rate limit is not finalized.
- Whether webhook processing should be synchronous or queued is not finalized. Existing webhook is synchronous and comments say heavy work should be enqueued if needed.

## Expected Risks

- **Duplicate ticket risk**: Artifact Scanner and Git/PR Collector can both infer ticket IDs. The collector must reuse existing tickets when they exist.
- **Duplicate traceability risk**: Webhook retries and manual reruns can create duplicate Ticket-PR or PR-Commit links if unique constraints/upsert logic are not used.
- **Wrong matching risk**: Branch, PR title, and commit message may contain no ticket ID or multiple ticket IDs.
- **Provider contract risk**: GitHub/GitLab API fields and pagination may differ from current assumptions.
- **Webhook compatibility risk**: Existing webhook currently triggers Artifact Scanner. Extending it must not break scanner behavior.
- **DB granularity risk**: PR-level changed files and commit-level changed files have different granularity. Mixing them in one table can create unclear semantics.
- **Security risk**: Webhook signature, provider token handling, and error logs must not leak token/secret/payload detail.
- **Privacy risk**: Author information must be pseudonymized/hash/mapped member ID, not used for personal ranking.
- **Operational risk**: Partial provider API failure should become `PARTIAL_SUCCESS` or safe failure with run log and traceId.
- **Scope creep risk**: CI metadata, Evidence Quality Score, AC-Test Coverage, AI review analysis, and security scan collection must not be pulled into this MVP task.

## What AI Needs to Investigate

For Phase 1, AI checked the minimum source needed for As-Is/impact:

- Requirement definition for Git/PR Metadata Collector.
- Database design draft for Git/PR Metadata Collector.
- Template structure for `sources.md`, `00_brainstorm.md`, and `spec-pack.md`.
- Existing Artifact Scanner service, persistence port, and migration.
- Existing GitHub webhook controller/service.
- Existing DB migration for ticket, PR, commit, traceability, and connector run tables.
- Architecture and standards related to backend, API, DB, security, logging, and testing.

For Phase 3, AI should further inspect:

- Existing MyBatis/JDBC adapter patterns for writing PR/commit/traceability data.
- Existing enum definitions for `pr_status`, `review_state`, `run_status`, and `ticket_status`.
- Existing DB constraints and whether new indexes are needed for idempotency.
- Existing tests for webhook and scanner.
- Exact provider adapter implementation and available GitHub API methods.
- API security conventions for Admin/Data Ops authorization.

## What Humans Need to Ask

- Is the first MVP provider GitHub?
- Should the collector reuse the existing GitHub webhook endpoint and service, or introduce a separate collector service invoked by that webhook?
- Which target branches should trigger collection: default branch only, `main`, `develop`, or config per repository?
- Should PR changed files be stored at PR granularity in a new table, or should MVP use existing commit changed-file data only?
- What is the official ticket ID pattern? For example: `ABC-123`, `LOGIN-001`, `ARTIFACT-SCANNER-01`, and current folder-style IDs such as `ORGANIZATION`.
- Is API-only manual collection acceptable for MVP, or is a Data Ops UI required now?
- Should review state be collected in MVP or stored as `UNKNOWN` when provider review API is not yet implemented?
- What retry policy should be used for provider API rate limit and temporary failure?

## Conditions Under Which Implementation Is Not Permitted

Implementation should not begin if any of the following remain unresolved:

- No decision on MVP provider or provider adapter target.
- No decision on webhook integration approach with the existing Artifact Scanner webhook flow.
- No decision on changed-file persistence granularity if DB migration is required.
- No agreed ticket ID pattern for MVP inference.
- No clear idempotency strategy for PR, commit, changed file, and traceability link persistence.
- No security decision for webhook signature verification and provider token storage/use.
- No decision on required Admin/Data Ops authorization for manual collect APIs.
- No acceptance that CI metadata collector, Evidence Quality Score, AC-Test Coverage, AI review analysis, and security scan collection are out of scope for this task.

## Human Clarifications Received on 2026-06-17

- MVP provider is GitHub.
- The existing `POST /api/v1/webhooks/github` endpoint will be reused; collector logic can be extended/delegated behind the same endpoint.
- Target branch is controlled in two layers: GitHub webhook configuration should prioritize PR events for the target branches, and backend must still validate `target_branch` against repository configuration. MVP default target branches are `main` and `develop`; other branches are `SKIPPED` or ignored.
- Ticket ID inference must support both `[A-Z][A-Z0-9]+-[A-Z0-9-]+` and existing folder IDs under `docs/changes/<TICKET>`.
- Changed files are stored at PR level and require a new table.
- Basic review state is read from GitHub when API support is available; otherwise `UNKNOWN` is stored.
- Manual collect UI may exist only for local/testing purposes and will not be committed as an MVP deliverable.
- Webhook-triggered collection must create connector run records.
- MVP retry/rate-limit policy does not require complex automatic background retry. `429`, `5xx`, timeout, and transient I/O failures are treated as retryable failures; business/client validation failures are not retried automatically.
- MVP uses synchronous webhook processing; future queue/background processing remains a later enhancement.
- PR status/state must be stored in PR metadata storage and must not reuse `tbl_dim_ticket.status`.

## Phase 3 Carry-over After Clarification

- Define exact BE service boundary, likely `GitPrMetadataCollectorService` plus provider adapter.
- Decide whether the existing `GithubWebhookService` invokes the collector directly or publishes/delegates to another use case.
- Define final DB migration strategy after comparing current schema and database-design.md.
- Define exact manual collect endpoints, request DTOs, and response DTOs.
- Define exact `TicketIdInferenceService` regex and priority rules.
- Define integration tests for manual collection, webhook collection, idempotency, and Artifact Scanner compatibility.