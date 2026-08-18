# Ticket Rules:

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung    
**Update date**: 2026-06-22  

## Must Follow

- Follow only the sources of truth: `docs/changes/PARSER-SELF-REVIEW/spec-pack.md` and `raw/self-review-template.md`.
- Keep the canonical 11 sections as the primary standard; use heading aliases only from the fixed map that has already been finalized.
- Nested subsections are allowed only up to 1 child level under a heading; deeper nesting must trigger a warning and must not be parsed into structure.
- Missing required sections must follow partial parse + warning/incomplete, not a hard fail by default.
- Section 9 is optional.
- Verdicts must be classified only as `PASS`, `NEEDS_UPDATE`, or `BLOCKED`.
- Keep the parser endpoint internal by default; do not turn it into a generic file reader.
- Do not store raw text separately unless there is a new decision; do not create a separate audit record in Phase 2.
- Do not add any new DB schema/migration unless there is a clear decision and explicit AC.
- Keep all output UTF-8 safe for Vietnamese; do not split by byte and break diacritics.
- Respect the path guard and read only files under `docs/changes/<TICKET>/self-review.md` or sanitized input.
- Avoid logging raw content, secrets, prompts, chats, or sensitive data.

## Must Not Do

- Do not infer additional sections, heading aliases, or new structures outside the canonical template.
- Do not treat placeholders (`---`, `TBD`, `TODO`, `<...>`, `N/A`, `-`, empty/null) as complete data.
- Do not expand the parser into a free-form Markdown parser for every file.
- Do not write to the database directly from the controller/parser layer.
- Do not add FE components, screens, or flows outside the backend parser scope.
- Do not change the verdict format or AC code in a way that breaks compatibility with the template.
- Do not create a new table/schema just to make Phase 2 easier.

## Stop / Ask Conditions

- If the canonical template changes or a new section appears that is not mapped.
- If the path guard needs to be loosened to read outside `docs/changes/<TICKET>/`.
- If there is a request to store raw content, create a separate audit table, or add new persistence.
- If aliases outside the finalized fixed map are required.
- If there is a request to change the nested subsection rule beyond 1 child level.

## Review Focus

- Is the canonical heading mapping stable?
- Is nested subsection handling limited correctly to 1 child level?
- Do missing required sections follow partial parse + warning?
- Is the optional Section 9 respected?
- Is verdict normalization correct for the finalized value set?
- Does the parser keep the path guard / internal default?
- Does logging/audit avoid raw content while still providing enough traceability?

## Test Focus

- 4-line header and ticket ID inference.
- Section extraction, table extraction, and subtree completeness.
- Placeholder detection in text/table.
- Verdict normalization and AC numbering.
- Missing section / malformed table / malformed verdict.
- Boundary cases for nested subsections, CRLF/LF, and Vietnamese Unicode.
- Path guard and negative tests for files outside scope.
- Idempotency by content hash.