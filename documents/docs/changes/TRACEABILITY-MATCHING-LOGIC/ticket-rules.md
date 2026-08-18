# Ticket Rules

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC  
**Create date**: 2026-06-23  
**Author**: OpenAI  
**Update date**: 2026-06-23  

## Must Follow

- Follow only `spec-pack.md`, `sources.md`, and the approved raw sources in `raw/`.
- Use the current `tbl_` tables only, especially `tbl_fact_traceability_link`, `tbl_fact_artifact_snapshot`, `tbl_fact_pull_request`, `tbl_fact_ci_run`, `tbl_fact_evidence_event`, and `tbl_dim_ticket`.
- Treat the traceability view as read-only.
- Reuse the existing write-side collector patterns instead of inventing a new persistence style.
- Confirm that any method, class, DTO, controller, or repository method actually exists before calling it in later phases.
- If a needed method does not exist, record it in `impl-plan.md` first instead of guessing the API.
- Keep link generation idempotent.
- Preserve broken links in the response; do not silently hide missing evidence.
- Use approved confidence values only: `HIGH`, `MEDIUM`, `LOW`.
- Keep severity values aligned with the ticket assumptions: `ERROR` and `WARNING`.
- Prefer persisted source facts over UI guesses or text-only inference.
- Keep all logs free of raw payloads, source content, secrets, tokens, and PII.

## Must Not Do

- Do not create a manual graph editor.
- Do not create auto-repair behavior.
- Do not add AI root-cause analysis.
- Do not add cross-project dependency graph logic.
- Do not introduce a new table for traceability if the current `tbl_` tables are sufficient.
- Do not use the legacy dropped `traceability_link` name.
- Do not invent `/api/v1/traceability` controller methods without confirming the BE contract.
- Do not add methods like `getTraceabilityMapByTicketId(...)` or `findTraceabilityLinksByTicketId(...)` unless they are explicitly added in the implementation plan and confirmed in source.
- Do not store raw markdown, raw diffs, raw webhook payloads, or source code blobs as the primary traceability source.
- Do not alter commit inclusion rules: commits are displayed but not counted in completeness.
- Do not change the One Ticket = One PR MVP assumption.
- Do not create UI flows that allow editing traceability links.

## Stop / Ask Conditions

| condition | action |
|---|---|
| A required read method is missing from the source tree | Stop and confirm the contract before implementation. |
| A new table seems required to satisfy the view | Stop and verify against `spec-pack.md`; prefer existing tables first. |
| The planned endpoint would expose a write operation | Stop; the view must stay read-only. |
| A method name is unclear or appears to be guessed | Stop and record the exact source evidence needed in `impl-plan.md`. |
| A rule conflicts with One Ticket = One PR | Stop and ask. |
| Completeness math conflicts with the ticket assumptions | Stop and ask. |
| A confidence or severity value outside the approved set is needed | Stop and ask. |

## Review Focus

- Correct use of existing tables and existing write-side patterns.
- No invented method/API names.
- Read-only behavior for the traceability view.
- Completeness math matches the approved scope.
- Missing links remain visible.
- Timeline ordering is deterministic.
- Logs and response payloads avoid secret/raw content.
- Existing collector flows remain intact and idempotent.

## Test Focus

- Full traceability chain renders correctly for a complete ticket.
- Missing artifact / PR / CI / report states render as broken links.
- Completeness excludes commits.
- Traceability data is still readable when some links are missing.
- Read-only permissions do not expose edit actions.
- Ordering of timeline events is stable.
- Existing write-side upserts remain idempotent.
- No raw payload or secret appears in logs or persisted traceability data.
