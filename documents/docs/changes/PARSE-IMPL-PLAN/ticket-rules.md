# Ticket Rules:

**Ticket ID**: PARSE-IMPL-PLAN  
**Create date**: 2026-06-18  
**Author**: ChatGPT  
**Update date**: 2026-06-19  

## Must Follow

- Parse only `docs/changes/PARSE-IMPL-PLAN/impl-plan.md`.
- Use the template headings from `documents/docs/standards/templates/_ticket-template/impl-plan.md` as the source of truth.
- Read the relevant source code before changing parsing or persistence behavior.
- Reuse the existing `tbl_fact_artifact_snapshot` and `tbl_fact_artifact_parsed_section` tables instead of adding new parse tables.
- Keep parsing deterministic and reproducible for the same source content.
- Treat missing sections explicitly instead of silently inferring them.
- Keep logs sanitized and do not write raw Markdown content, secrets, or unnecessary personal data.

## Must Not Do

- Do not parse `impact-analysis.md` in this ticket.
- Do not broaden scope to unrelated ticket artifacts.
- Do not guess section aliases without a confirmed rule.
- Do not invent parser methods, DTOs, table names, or API paths that are not confirmed by source.
- Do not add `tbl_fact_doc_parse_*` tables for this ticket.
- Do not store raw source content in logs.

## Stop / Ask Conditions

- The `impl-plan.md` template headings change or become ambiguous.
- A required section cannot be mapped deterministically.
- The team wants alias handling but has not confirmed the policy.
- The persistence target appears to require a new table beyond the existing artifact snapshot schema.
- A FE screen becomes necessary and is not yet approved.

## Review Focus

- Template-to-field mapping is explicit and matches the current `impl-plan.md` template.
- Storage uses the existing artifact snapshot and parsed-section tables.
- Missing and duplicated headings are handled consistently.
- Logging stays safe and does not expose raw source content.
- The code does not drift into `impact-analysis.md` or other out-of-scope artifacts.

## Test Focus

- Happy path: all 14 template sections are parsed successfully.
- Missing heading: the parse result is explicitly `PARTIAL` or `PARSE_ERROR`.
- Duplicate heading: the parser reports the issue consistently.
- File missing: the parser returns `NOT_FOUND` without crashing.
- Hash change: re-parse updates the same snapshot key rather than duplicating it.
- Storage regression: snapshot rows land in `tbl_fact_artifact_snapshot` and section rows land in `tbl_fact_artifact_parsed_section`.
