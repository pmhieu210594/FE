# Black-box Test Cases

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-18  
**Author**: nk_trung
**Update date**: 2026-06-18  

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-GIT-PR-METADATA-COLLECTOR-1 | P0 | Normal | Manual collect by ADMIN for an active repository |
| BB-002 | AC-GIT-PR-METADATA-COLLECTOR-2 | P0 | Normal | Manual collect for a specific PR number |
| BB-003 | AC-GIT-PR-METADATA-COLLECTOR-3 | P0 | Permission | Non-admin cannot start manual collection |
| BB-004 | AC-GIT-PR-METADATA-COLLECTOR-4, AC-GIT-PR-METADATA-COLLECTOR-22 | P0 | External IF | Valid PR webhook triggers collector and keeps scanner compatible |
| BB-005 | AC-GIT-PR-METADATA-COLLECTOR-5 | P0 | Error | Missing or invalid signature is rejected before payload processing |
| BB-006 | AC-GIT-PR-METADATA-COLLECTOR-6, AC-GIT-PR-METADATA-COLLECTOR-7 | P0 | State | PR core metadata is stored and PR status is normalized |
| BB-007 | AC-GIT-PR-METADATA-COLLECTOR-8 | P1 | State | Review state is normalized to approved/requested/unknown domain |
| BB-008 | AC-GIT-PR-METADATA-COLLECTOR-9, AC-GIT-PR-METADATA-COLLECTOR-21 | P0 | Normal | Commit metadata is stored without raw prohibited content |
| BB-009 | AC-GIT-PR-METADATA-COLLECTOR-10, AC-GIT-PR-METADATA-COLLECTOR-21 | P0 | Normal | Changed-file metadata is stored without raw diff or patch |
| BB-010 | AC-GIT-PR-METADATA-COLLECTOR-11 | P1 | Boundary | Ticket inference priority follows title, branch, path, then commit message |
| BB-011 | AC-GIT-PR-METADATA-COLLECTOR-12 | P1 | Error | No ticket inference still stores metadata and does not fail the run |
| BB-012 | AC-GIT-PR-METADATA-COLLECTOR-13 | P0 | Compatibility | Existing Artifact Scanner ticket is reused instead of duplicated |
| BB-013 | AC-GIT-PR-METADATA-COLLECTOR-14 | P1 | Boundary | Missing evidence folder still allows metadata persistence |
| BB-014 | AC-GIT-PR-METADATA-COLLECTOR-15 | P0 | State | Ticket -> PR traceability link is created or updated |
| BB-015 | AC-GIT-PR-METADATA-COLLECTOR-16 | P0 | State | PR -> Commit traceability link is created or updated |
| BB-016 | AC-GIT-PR-METADATA-COLLECTOR-17 | P0 | State | PR -> Changed File traceability link is created or updated |
| BB-017 | AC-GIT-PR-METADATA-COLLECTOR-18 | P0 | Duplicate | Re-running the same PR does not create duplicate business rows |
| BB-018 | AC-GIT-PR-METADATA-COLLECTOR-19, AC-GIT-PR-METADATA-COLLECTOR-20 | P0 | Operation | Run log captures final status, counts, traceId, and safe error info |
| BB-019 | AC-GIT-PR-METADATA-COLLECTOR-21 | P0 | Error | Raw source, raw diff, raw patch, secrets, and prompts are not persisted |
| BB-020 | AC-GIT-PR-METADATA-COLLECTOR-23 | P0 | Compatibility | End-to-end traceability graph Ticket -> PR -> Commit -> Changed Files is visible |
| BB-021 | AC-GIT-PR-METADATA-COLLECTOR-1 | P1 | Error | Manual collect for an inactive repository is rejected |

## Test Cases

### BB-001: Manual collect by ADMIN for an active repository

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-1 |
| Priority | P0 |
| Category | Normal / Operation |
| Preconditions | Active repository exists in DB; ADMIN user exists; repository is eligible for collection. |
| Input | `repositoryId` of the active repo and optional repository-level manual collect request. |
| Steps | Call the manual collect API as ADMIN. |
| Expected Result | Request succeeds; a run record is created; collector starts and returns run summary with counts. |
| Note | This is the primary happy path for manual collection. |

### BB-002: Manual collect for a specific PR number

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-2 |
| Priority | P0 |
| Category | Normal / Boundary |
| Preconditions | Active repository exists; PR number is known and positive, including boundary value `1`. |
| Input | Repository ID + PR number request. |
| Steps | Call the PR-specific manual collect API as ADMIN. |
| Expected Result | Only the specified PR is collected; metadata is persisted for that PR. |
| Note | Use at least one minimal valid PR number such as `1`. |

### BB-003: Non-admin cannot start manual collection

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-3 |
| Priority | P0 |
| Category | Permission |
| Preconditions | ADMIN, VIEWER, and EDITOR users exist. |
| Input | The same manual collect request executed by ADMIN and by a non-admin user. |
| Steps | Call the API as ADMIN, then call it again as VIEWER or EDITOR. |
| Expected Result | ADMIN succeeds; non-admin is rejected and no collector run is started. |
| Note | There is no `DATA_OPS` role in MVP. |

### BB-004: Valid PR webhook triggers collector and keeps scanner compatible

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-4, AC-GIT-PR-METADATA-COLLECTOR-22 |
| Priority | P0 |
| Category | External IF / Compatibility |
| Preconditions | Webhook secret is valid; repository is known; PR targets a supported branch. |
| Input | GitHub `pull_request` event with a valid signature and supported action such as `opened`. |
| Steps | POST the webhook to the existing GitHub endpoint. |
| Expected Result | Webhook is accepted; collector flow starts; existing scanner behavior remains compatible. |
| Note | This must reuse the existing webhook endpoint. |

### BB-005: Missing or invalid signature is rejected before payload processing

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-5 |
| Priority | P0 |
| Category | Error / Security |
| Preconditions | GitHub webhook endpoint is enabled. |
| Input | Webhook payload with missing signature or invalid `X-Hub-Signature-256`. |
| Steps | Send the webhook request to the endpoint. |
| Expected Result | Request is rejected before business processing; raw payload is not processed or logged. |
| Note | No secret or payload leakage in logs. |

### BB-006: PR core metadata is stored and PR status is normalized

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-6, AC-GIT-PR-METADATA-COLLECTOR-7 |
| Priority | P0 |
| Category | State / Normal |
| Preconditions | GitHub returns a PR graph with number, ID, title, branches, timestamps, URL, and raw status values. |
| Input | A valid PR metadata response from provider. |
| Steps | Trigger collection for that PR. |
| Expected Result | PR number/ID/title/status/branches/timestamps/URL are stored; status is normalized to `OPEN`, `MERGED`, `CLOSED`, or `UNKNOWN`. |
| Note | Validate both merged and non-merged states. |

### BB-007: Review state is normalized to approved/requested/unknown domain

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-8 |
| Priority | P1 |
| Category | State |
| Preconditions | GitHub review data includes approved, changes requested, pending/requested, commented, or absent review states. |
| Input | PR review graph response from provider. |
| Steps | Trigger collection with different review-state fixtures. |
| Expected Result | Persisted review state is `APPROVED`, `CHANGES_REQUESTED`, `REVIEW_REQUIRED`, or `UNKNOWN` only. |
| Note | This checks the spec-approved domain, not provider raw values. |

### BB-008: Commit metadata is stored without raw prohibited content

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-9, AC-GIT-PR-METADATA-COLLECTOR-21 |
| Priority | P0 |
| Category | Normal / Security |
| Preconditions | PR contains one or more commits. |
| Input | Commit hash, safe message representation, committed time, author pseudonym/hash, branch, and commit URL. |
| Steps | Trigger collection for the PR. |
| Expected Result | Commit metadata is persisted using safe fields only; raw source, raw diff, secret, prompt, or chat content is not stored. |
| Note | Verify message is stored as hash or safe representation per DB design. |

### BB-009: Changed-file metadata is stored without raw diff or patch

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-10, AC-GIT-PR-METADATA-COLLECTOR-21 |
| Priority | P0 |
| Category | Normal / Security |
| Preconditions | PR contains changed files with additions/deletions/status. |
| Input | File path or file-path hash, additions, deletions, and change status. |
| Steps | Trigger collection for the PR. |
| Expected Result | Changed-file metadata is persisted and no raw diff/patch/file content is stored. |
| Note | File path hash may be used depending on final DB design. |

### BB-010: Ticket inference priority follows title, branch, path, then commit message

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-11 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Fixtures exist for ticket key in PR title, source branch, changed file path, and commit message. |
| Input | PR payloads that expose multiple possible ticket candidates. |
| Steps | Trigger collection with priority-specific fixtures. |
| Expected Result | The collector resolves the ticket by the spec priority order and does not break on unrelated text. |
| Note | Include ambiguous same-priority candidates as a separate fixture. |

### BB-011: No ticket inference still stores metadata and does not fail the run

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-12 |
| Priority | P1 |
| Category | Error / Boundary |
| Preconditions | PR title, branch, commit message, and file path do not contain a valid ticket key. |
| Input | Collector input with no inferable ticket key. |
| Steps | Trigger collection for the PR. |
| Expected Result | PR/commit metadata is still stored; ticket link is null or unknown; the run does not fail because of missing ticket inference. |
| Note | This covers the safe fallback path. |

### BB-012: Existing Artifact Scanner ticket is reused instead of duplicated

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-13 |
| Priority | P0 |
| Category | Compatibility |
| Preconditions | Artifact Scanner already created the matching ticket. |
| Input | PR payload whose inferred ticket key matches the existing ticket. |
| Steps | Trigger collection for that PR. |
| Expected Result | Collector reuses the existing ticket and does not create a duplicate ticket row. |
| Note | Use the exact same external key as the scanner-created ticket. |

### BB-013: Missing evidence folder still allows metadata persistence

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-14 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | A valid ticket key exists but no `docs/changes/<TICKET>/` evidence folder is present yet. |
| Input | PR payload that maps to that ticket key. |
| Steps | Trigger collection for the PR. |
| Expected Result | Metadata is persisted anyway; missing evidence state can be detected later. |
| Note | The absence of the evidence folder must not block metadata ingestion. |

### BB-014: Ticket -> PR traceability link is created or updated

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-15 |
| Priority | P0 |
| Category | State |
| Preconditions | A ticket can be inferred or matched. |
| Input | PR payload that resolves to an existing ticket. |
| Steps | Trigger collection for the PR. |
| Expected Result | Traceability link `Ticket -> PR` exists and is updated on rerun if needed. |
| Note | Link should not be duplicated. |

### BB-015: PR -> Commit traceability link is created or updated

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-16 |
| Priority | P0 |
| Category | State |
| Preconditions | PR contains at least one commit. |
| Input | PR metadata plus commit list. |
| Steps | Trigger collection for the PR. |
| Expected Result | Traceability link `PR -> Commit` exists for each commit and remains idempotent on rerun. |
| Note | Each commit must be linkable back to the PR. |

### BB-016: PR -> Changed File traceability link is created or updated

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-17 |
| Priority | P0 |
| Category | State |
| Preconditions | PR contains at least one changed file. |
| Input | PR metadata plus changed-file list. |
| Steps | Trigger collection for the PR. |
| Expected Result | Traceability link `PR -> Changed File` exists for each changed file and remains idempotent on rerun. |
| Note | Verify the final DB design equivalent link type. |

### BB-017: Re-running the same PR does not create duplicate business rows

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-18 |
| Priority | P0 |
| Category | Duplicate / State |
| Preconditions | The same PR has already been collected once. |
| Input | Same repository and PR number collected again. |
| Steps | Trigger collection twice with the same business data. |
| Expected Result | No duplicate PR, commit, changed-file, ticket, or traceability rows are created. |
| Note | A new run log entry may still exist. |

### BB-018: Run log captures final status, counts, traceId, and safe error info

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-19, AC-GIT-PR-METADATA-COLLECTOR-20 |
| Priority | P0 |
| Category | Operation / Error |
| Preconditions | Provider or repository config failure can be simulated safely. |
| Input | Failure fixture such as timeout, 429/5xx, or missing repository config. |
| Steps | Trigger collection and capture the response/run log. |
| Expected Result | Run record ends with a final status and counts; error details are safe; traceId is present in the response or log evidence. |
| Note | Verify safe truncation or safe error code behavior. |

### BB-019: Raw source, raw diff, raw patch, secrets, and prompts are not persisted

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-21 |
| Priority | P0 |
| Category | Security |
| Preconditions | Provider payloads contain body text, raw diff, and commit message text. |
| Input | Normal PR collection payload with provider fields that could be sensitive if copied verbatim. |
| Steps | Trigger collection and inspect persisted data. |
| Expected Result | Stored artifacts do not contain raw source code, raw diff, raw patch, secret values, raw AI prompt, or raw AI chat log. |
| Note | This is a data assertion test. |

### BB-020: End-to-end traceability graph is visible

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-23 |
| Priority | P0 |
| Category | Compatibility / State |
| Preconditions | A ticket, PR, commit, and changed-file data exist for the same collection flow. |
| Input | One complete successful collection run. |
| Steps | Inspect the persisted graph after collection. |
| Expected Result | Ticket -> PR -> Commit -> Changed Files traceability is visible and consistent end to end. |
| Note | This validates the final graph completeness. |

### BB-021: Manual collect for an inactive repository is rejected

| item | content |
|---|---|
| Related AC | AC-GIT-PR-METADATA-COLLECTOR-1 |
| Priority | P1 |
| Category | Error |
| Preconditions | Repository exists but is not active. |
| Input | Manual collect request for the inactive repository. |
| Steps | Call the manual collect API. |
| Expected Result | Request is rejected and no run is started for an inactive repository. |
| Note | This is the negative counterpart of the valid active repository case. |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [ ] Character type input
- [ ] Numeric input
- [ ] Full-width number
- [x] Empty/null
- [x] Duplicate
- [x] Non-existing ID
- [x] Deleted data
- [x] External IF failure
- [x] Timeout/retry
- [x] Double submit
- [ ] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output
