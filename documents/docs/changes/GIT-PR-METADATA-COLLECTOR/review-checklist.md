# Review Checklist

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-17 
**Author**: nk_trung
**Update date**: 2026-06-18 

## 1. Specification/AC Matching
| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-GIT-PR-METADATA-COLLECTOR-1 | Manual collection API is available for a valid active repository and follows the approved admin/data-ops flow. | Blocker | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-2 | Manual collection API supports a specific PR number without breaking repository-level collection. | Blocker | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-3 | Unauthorized users cannot start manual collector runs. | Blocker | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-4 | Supported PR webhook events with a valid signature trigger the collector flow for the target repository/PR. | Blocker | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-5 | Webhook requests with missing or invalid signature are rejected before payload processing. | Blocker | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-6 | PR core metadata is persisted with the expected fields and normalized values. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-7 | PR status normalization matches `OPEN`, `MERGED`, `CLOSED`, `UNKNOWN`. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-8 | Review state persistence matches the allowed values and falls back to `UNKNOWN` when unavailable. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-9 | Commit metadata is stored using the safe representation rules in the DB design. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-10 | Changed-file metadata is stored with additions/deletions/status and without raw file content. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-11 | Ticket inference follows the approved priority order across branch/title/commit/path. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-12 | Unknown ticket inference does not fail the whole run and still persists collector data. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-13 | Existing tickets created by Artifact Scanner are reused and not duplicated. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-14 | PR/commit metadata is persisted even when the evidence folder does not exist yet. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-15 | `Ticket -> PR` traceability links are created or updated correctly. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-16 | `PR -> Commit` traceability links are created or updated correctly. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-17 | `PR -> Changed File` traceability links or the final equivalent design are created or updated correctly. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-18 | Collector re-runs are idempotent for PR, commit, changed file, ticket, and traceability records. | Blocker | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-19 | Each manual collector run creates and updates an ingest run log with final status and processed/failure counts. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-20 | Provider/config errors are recorded safely and `traceId` is returned where applicable. | Major | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-21 | Prohibited data such as source code, raw diff, raw patch, secret value, raw AI prompt, and raw AI chat log are never persisted. | Blocker | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-22 | Existing Artifact Scanner Evidence Inventory behavior stays compatible after integration. | Blocker | TBD |
| AC-GIT-PR-METADATA-COLLECTOR-23 | Persisted data is sufficient for basic `Ticket -> PR -> Commit -> Changed Files` traceability display. | Major | TBD |

## 2. General System Review

### 2.1. Number/Input Check
- [X] Repository ID, PR number, and run counters are validated explicitly (`> 0` where applicable)
- [X] Full-width numbers are processed or clearly not supported
- [X] Half-width/full-width mixed numbers are considered in manual inputs and inference helpers
- [X] Empty string/null cases are handled for branch/title/ticket candidates and optional PR number
- [X] Precision/scale/rounding rules are not misapplied to counters or timestamps
- [X] No overflow/underflow risk exists for additions/deletions/count fields

### 2.2. Character Type / Encoding / Locale

- [X] Branch names, repo names, commit messages, and file paths handle Unicode/full-width/emoji safely
- [X] Clear trim rules exist for ticket inference and manual request parameters
- [X] Unicode normalization is used only when necessary and does not break exact path matching
- [X] No Shift-JIS/UTF-8 mojibake risk in logs, responses, or persisted values
- [X] Japanese/Vietnamese/English messages are not misspelled

### 2.3. Literal / Magic Number

- [X] No hard-coded business code value for provider state, PR state, review state, or role values
- [X] Enum/constant/master values are used correctly (`OPEN`, `MERGED`, `CLOSED`, `UNKNOWN`, `ADMIN`)
- [X] Display/internal value mapping is clear and documented
- [X] Default branch policy values are centralized and not scattered as literals

### 2.4. Operation / Maintainability

- [X] Logs are sufficient for incident investigation
- [X] Correlation ID / request ID / `traceId` / `deliveryId` / `runId` are available where needed
- [X] Retry / duplicate execution is considered and handled idempotently
- [X] Rollback / manual recovery path is clear
- [X] Configuration is not hard-coded (secret/token/repo/branch/provider settings)

## 3. FE Review

- [X] No committed production FE feature exists outside the approved scope
- [X] If a temporary/manual test UI exists, it is excluded from the committed release path
- [X] Routing, language handling, and store changes remain unaffected unless explicitly required
- [X] FE API usage stays behind the shared API layer and does not bypass established patterns

## 4. BE/API Review

- [X] Webhook verifies HMAC before JSON parsing and before business logic
- [X] Webhook remains reusable at `POST /api/v1/webhooks/github` and does not introduce an unnecessary new webhook endpoint
- [X] Manual collection API checks `ADMIN` only and does not use a fake `DATA_OPS` role
- [X] Controllers stay thin and business logic stays in usecase/service layers
- [X] API response/error does not expose secret, raw payload, raw diff, or other prohibited data
- [X] Supported PR event handling, branch filtering, and fallback behavior are aligned with spec and rules

## 5. DB/Migration Review

- [X] PR-level changed files use a dedicated table or equivalent final schema, not a commit-only table
- [X] `tbl_dim_ticket.status` is not reused as the source of truth for PR status
- [X] Unique key / idempotency key is clear for PR, commit, changed file, traceability, and run records
- [X] Migration is additive and does not break the current scanner or existing webhook flow
- [X] Indexes support lookup by repo / PR / ticket / run / traceability path
- [X] Safe message/hash representation rules match the migration and entity design

## 6. Security/Privacy Review

- [X] No webhook secret/token/raw payload is logged
- [X] No source code/raw diff/raw patch is persisted
- [X] No secret value, raw AI prompt, or raw AI chat log is persisted
- [X] Author/reviewer data is handled only at the minimum metadata level required by the spec
- [X] Manual endpoint is not open to non-admin users
- [X] Error handling uses safe messages and does not leak provider internals

## 7. Operation/Maintenance Review

- [X] Run log contains sufficient status/count/error information
- [X] Branch skip / unknown repo / missing PR / pagination failure cases are logged clearly
- [X] Partial success / failure policy is consistent and documented
- [X] Duplicate delivery or repeated manual execution does not create duplicate business data
- [X] Rollback or feature disable path is defined for regression recovery
- [X] Monitoring / audit fields are enough to trace who triggered the collection and when

## 8. Test Review

- [X] Tests exist for normal webhook path
- [X] Tests exist for invalid / missing signature
- [X] Tests exist for manual API permission checks
- [X] Tests exist for idempotency / duplicate delivery
- [X] Tests exist for ticket inference priority and ambiguity
- [X] Tests exist for review-state fallback `UNKNOWN`
- [X] Tests exist for compatibility with existing Artifact Scanner behavior
- [X] Tests exist for prohibited-data non-persistence

## 9. Documentation/Traceability Review

- [X] `impl-plan.md`, `test-plan.md`, `self-review.md`, and `report.md` are updated to match the real implementation
- [X] Mapping from AC -> code -> test is clear
- [X] Open issues / accepted risks are recorded with owner and deadline
- [X] Any divergence from spec/AC is explicitly called out and not hidden
- [X] Any assumptions made during implementation are written down for human review

## 10. Release/Rollback Review

- [X] No FE production UI release is required for this ticket
- [X] A method exists to disable the new collector path if issues appear after release
- [X] Existing webhook-to-scanner behavior can be restored if a regression is detected
- [X] Migration order is safe: schema first, then code using the new fields/tables
- [X] No manual data rollback is required for a normal successful rollout

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect report | Record reason for rejection |
| Accepted Risk | Accepted risk | Record impact / owner / deadline |