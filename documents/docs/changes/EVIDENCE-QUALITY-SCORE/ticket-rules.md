# Ticket Rules:

**Ticket ID**: EVIDENCE-QUALITY-SCORE         
**Create date**: 2026-06-23       
**Author**: nk_trung             
**Update date**: 2026-06-23

## Must Follow

- Do not add any scoring criteria that are not present in the finalized spec-pack.
- Keep PR review metadata/comments as the canonical review source whenever they are available.
- Reuse the existing V4 score table and lineage/data-quality tables; do not invent a new schema object for MVP.
- Keep the engine BE-only; do not move score logic into FE, UI, or ad-hoc scripts.
- Treat missing artifacts, parse errors, and broken links as score-reducing signals, not as fatal pipeline failures.
- Store the rule version with every calculation result.
- Keep the score calculation idempotent for the same source state and rule version.
- Do not store raw prompt, raw chat, full source code, or raw CI logs in score artifacts or logs.
- Use canonical enum/code values for score band and parser statuses; avoid magic strings spread across the codebase.
- Check boundary values carefully (0, 39, 40, 59, 60, 74, 75, 89, 90, 100).

## Must Not Do

- Do not introduce manual score override logic in v0.
- Do not change the finalized storage approach (full history + current/latest snapshot).
- Do not recompute the score locally in FE.
- Do not treat internal review files as the canonical review source when PR review metadata/comments exist.
- Do not create a new required migration or a new required table for the MVP.
- Do not return a response that omits `missing`, `parseErrors`, `traceIds`, or `calculatedAt`.
- Do not log sensitive content or raw evidence payloads.

## Stop / Ask Conditions

- Stop and ask if a change would alter score bands, score weights, or the rule-version policy.
- Stop and ask if a requested source is outside the scoped evidence files or if file access would become a generic file-read primitive.
- Stop and ask if the implementation would need a schema object that is not already present in the V4 schema.
- Stop and ask if the review source would switch away from PR metadata/comments as the canonical source.

## Review Focus

- AC coverage and boundary values.
- Source-of-truth correctness for review data.
- Idempotency and replayability.
- Error isolation for missing data and parse errors.
- Security / privacy redaction in API responses and logs.
- Traceability chain completeness.
- Storage behavior for current/latest snapshot plus full history.

## Test Focus

- Score range and band mapping.
- Missing artifact / broken link reduction.
- Parse-error isolation.
- Canonical review source behavior.
- Persist-and-read-back behavior.
- No raw prompt/chat/source/raw CI leakage.
- Boundary-value classification.
- Same source state + same rule version idempotency.
