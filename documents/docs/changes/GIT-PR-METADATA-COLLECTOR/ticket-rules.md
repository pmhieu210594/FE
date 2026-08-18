# Ticket Rules:

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-17  
**Author**:  nk_trung
**Update date**: 2026-06-17  

## Must Follow

- Implement only what is already defined in `spec-pack.md`. Any unclear point must be captured as an open issue; do not expand scope on your own.
- Reuse `POST /api/v1/webhooks/github`; do not create a new GitHub webhook endpoint in MVP.
- The webhook flow must verify `X-Hub-Signature-256` before parsing JSON.
- Webhook-triggered collection must not check any currently logged-in EDCAP user role. Authorization is based on webhook signature plus repository/branch/config rules.
- The manual collect API must be authenticated and `ADMIN`-only, following the existing `ArtifactScannerController` pattern.
- Because `AppUser.Role` does not currently include `DATA_OPS`, MVP uses `ADMIN` as the authorized role for manual collect.
- PR is the primary collection unit in MVP.
- The collector must call GitHub API to fetch authoritative PR/commit/changed-file metadata; it must not rely only on webhook payload.
- Every webhook/manual execution must create a connector run record in `tbl_connector_run`.
- The implementation must be idempotent for PR, commit, PR-commit link, PR changed files, traceability link, and run handling when deliveries are retried or rerun.
- Reuse an existing ticket when `external_ticket_key` already exists; do not create duplicate tickets.
- PR-level changed files must be stored using a new table; do not reuse `tbl_fact_commit_changed_file` for PR-level file lists.
- Do not reuse `tbl_dim_ticket.status` as PR status or as the source of truth for the new collector.
- Review state must come from provider data if the API supports it; otherwise store `UNKNOWN`.
- Ticket inference must follow the approved priority exactly: PR title -> source branch -> changed file path folder -> commit message.
- If multiple ticket candidates remain at the same priority, do not auto-pick one. Persist ambiguity or warning information for manual review.
- Branch policy must follow the approved two-layer model: GitHub webhook config filters first, backend still validates `target_branch` using repository config, and MVP processes `main` / `develop` by default while other branches are `SKIPPED` or ignored.
- Do not persist source code content, raw diff, raw patch, raw payload, secret, token, raw AI prompt, or raw AI chat log.
- MVP error handling uses `FAILED` plus `error_code` / `reason`; do not introduce a new retryable enum unless a later decision requires it.
- Webhook processing remains synchronous in MVP; code must still be isolated cleanly enough to move to queue/background execution in a later phase if needed.

## Must Not Do

- Do not commit a manual test-only UI as an official deliverable.
- Do not add full provider abstraction for GitLab or multi-provider support in MVP.
- Do not place collector business logic in controllers.
- Do not call adapters directly or hard-code HTTP client logic in controllers; keep the existing usecase/port/adapter layering.
- Do not modify Artifact Scanner so that it becomes a PR metadata collector.
- Do not change schema in a way that breaks compatibility with the current Artifact Scanner inventory.
- Do not scatter magic strings or code values if an enum/constant/master value already exists.
- Do not log PII, secrets, webhook secret, access token, raw webhook body, or source content.

## Stop / Ask Conditions

- A required field is missing from GitHub API and the existing port/adapter does not support it, forcing a major contract change.
- Existing tables cannot hold MVP data with the intended semantics and migration would exceed the assumptions in the spec.
- A semantic conflict is found between the existing `tbl_fact_pull_request` model and the new PR metadata collector model.
- MVP requires a new role beyond `ADMIN` for manual collect.
- The team is asked to ship a manual FE UI as an official feature rather than a local/test-only tool.
- Actual repository branch policy is significantly different from `main/develop` and cannot be represented using current repository configuration.

## Review Focus

- Correct endpoint and authorization model: webhook does not check user role, manual API does check `ADMIN`.
- HMAC verification happens before parsing, and raw payload is never logged.
- PR status and review state are not mixed with `tbl_dim_ticket.status`.
- PR-level changed files have a dedicated table and remain idempotent.
- Ticket inference follows the approved priority, and ambiguity is not auto-resolved incorrectly.
- Run logging is sufficient for webhook/manual/skip/fail/partial-success cases.
- Existing Artifact Scanner flow is not broken.
- Migration is additive and does not damage current data or screens.

## Test Focus

- Webhook happy path for `opened`, `synchronize`, `reopened`, and `closed`.
- Unknown repo, invalid signature, missing PR number, and missing base ref.
- Branch outside target policy results in correct `SKIPPED` / ignored behavior.
- Duplicate delivery / rerun does not create duplicate rows.
- GitHub API timeout/429/5xx results in `FAILED` or `PARTIAL_SUCCESS` according to policy.
- Manual API permission: `ADMIN` passes, non-admin fails.
- Ticket inference from title/branch/path/commit message, including ambiguity cases.
- PR without evidence folder still persists development activity metadata as required by the spec.