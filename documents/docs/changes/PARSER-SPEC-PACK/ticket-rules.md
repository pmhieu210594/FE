# Ticket Rules:

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung
**Update date**: 2026-06-19  

## Must Follow

- Stay strictly within `spec-pack.md`, `sources.md`, `context.md`, and the requirement/database-design documents already read; do not infer any new behavior.
- Every AC must be fully mapped to the plan, checklist, test plan, and black-box test cases.
- Prefer reuse-first: use existing schema/tables and do not create new tables for the MVP.
- Treat draft parse and official parse as two separate operational states.
- When a section/heading has a minor variation, only normalize it within the template scope; do not change the meaning of the content.
- Detect placeholders such as `---`, `<...>`, `TBD`, `TODO`, `N/A`, `-`, and empty/null values in required fields.
- Keep logs/audit data sufficient to trace `ticket_id`, `source_path`, `content_hash`, `parse_mode`, `parse_status`, and `trace_id`.
- Use UTF-8 end-to-end and do not lose Vietnamese diacritics.
- Do not export secrets/PII/raw prompts/raw chats/raw source code into artifacts.

## Must Not Do

- Do not add an NLP/LLM/general text understanding parser beyond the rule-based parser.
- Do not expand this into a generic file reader or a path traversal primitive.
- Do not add new tables or new migrations for the MVP when the database design has already locked in reuse-first.
- Do not write to the DB directly from the controller/dev endpoint.
- Do not let any AC lose traceability in any Phase 2 artifact.
- Do not change the template heading/section/table names in the document files.

## Stop / Ask Conditions

- Stop and ask if the requirement/database design conflicts directly with `spec-pack.md`.
- Stop and ask if any section must be normalized but there is no source rule confirming it.
- Stop and ask if the request requires going beyond the reuse-first schema.
- Stop and ask if an AC cannot be mapped clearly to a test or checklist item.

## Review Focus

- Verify whether AC coverage is complete at 10/10.
- Verify that the context points to the correct screens/APIs/jobs and does not mix scopes.
- Verify that the rules correctly reflect reuse-first, idempotent, draft/official, warning/error behavior.
- Ensure that no Phase 2 file breaks the template.

## Test Focus

- Verify that each AC has at least one black-box test case.
- Verify that warning/error/idempotent/placeholder cases are all covered.
- Verify that the `draft` / `official` / `partial` / `failed` states are clearly stated.
- Verify that no test implicitly requires new tables or raw content storage.