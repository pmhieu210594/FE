# Ticket Rules

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI
**Create date**: 2026-06-29
**Author**: nk_trung    
**Update date**: 2026-06-29

## Must Follow

- Follow `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/spec-pack.md` and `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/sources.md` as the primary source of truth.
- Keep the phase BE-only; no FE screen work is part of this ticket phase.
- Reuse the existing V4 schema first; do not add a new table unless the spec-pack explicitly requires a minimal additive migration.
- Keep First CI Pass at PR grain and keep CI job rows diagnostic only.
- Treat explicit exception records as the only source for Exception KPI; do not infer exceptions from generic risk or open-issue text.
- Keep all logs, evidence rows, and artifacts free from raw CI logs, raw chat, raw prompt text, secrets, and full source content.
- Use role references and master data when approval roles can be resolved; otherwise persist a warning and keep the row minimal.
- Keep parser and read-model logic deterministic and rerunnable.
- Before implementation, re-read the target source files and existing tests for the exact methods, DTOs, and table shapes that are available.
- If a method, route, or column is not confirmed in source, treat it as unavailable until later phases confirm it.
- Preserve UTF-8 and multilingual text without mojibake.

## Must Not Do

- Do not invent a FE dashboard for this ticket.
- Do not invent a raw-log warehouse or prompt/chat archive.
- Do not treat `Accepted Risk` or `Open Issues` text as an exception unless it is an explicit exception record.
- Do not create a new KPI summary table by default.
- Do not invent controller, service, repository, or parser method names that are not confirmed in source.
- Do not store approval person names when a role reference is sufficient.
- Do not expose secrets, tokens, stack traces, or raw markdown in logs.
- Do not use job-level CI status as the KPI source.
- Do not silently drop warnings or malformed exception rows.

## Stop / Ask Conditions

| condition | action |
|---|---|
| KPI denominator still needs a non-PR fallback | Stop and confirm; spec-pack currently resolves the grain to PR-only. |
| A dedicated source_section column is required but the schema has no nullable place for it | Stop and confirm the smallest additive migration. |
| Approval role mapping needs values outside the current `tbl_dim_role` master | Stop and confirm the mapping rules before coding. |
| A new API route is needed for the KPI but the controller contract is not locked | Stop and define the contract in `impl-plan.md` first. |
| The parser would have to infer exception rows from free text | Stop; this violates the explicit-record rule. |
| The implementation would require raw CI logs or raw prompt/chat storage | Stop; this is forbidden by spec-pack and security policy. |
| A method or repository function appears to be guessed rather than read from source | Stop and record the evidence needed in `context.md` / `impl-plan.md`. |

## Review Focus

- Verify that the KPI grain stays at PR level and that job rows remain diagnostic only.
- Verify that explicit exception parsing is deterministic and idempotent.
- Verify that missing or malformed exception sections produce warnings / data-quality records instead of fabricated rows.
- Verify that the implementation stays on the reuse-first path with the current V4 schema.
- Verify that role resolution is master-data based and does not leak personal names.
- Verify that logs and audit records stay metadata-only.
- Verify that the ticket remains BE-only in this phase.

## Test Focus

- First CI run selection by repository / PR scope.
- First-pass success and failure boundaries.
- Exception record extraction from `report.md` and `self-review.md` dedicated sections.
- Missing exception section behavior.
- Duplicate rerun idempotency by source hash / parser version.
- Approval role resolution and unresolved-role warning behavior.
- No raw CI logs, raw prompt/chat, or secrets persisted anywhere.
- No FE route or screen introduced during this phase.
