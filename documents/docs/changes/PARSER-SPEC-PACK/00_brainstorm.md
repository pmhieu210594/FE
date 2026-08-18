# 00_brainstorm

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung  
**Update date**: 2026-06-19  

## Purpose

Record Phase 1 observations before locking `spec-pack.md` as the single source of truth. This file is only for collecting reasoning, assumptions, risks, and points that require human decision; the official contract must live in `spec-pack.md`.

## Known Information

- `spec-pack.md` is the central specification file for each ticket.
- The original requirement defines that the parser must read the file according to the standard template, extract sections/tables/AC, detect placeholders, and support both draft parse and official parse.
- The database design has already decided to reuse the existing schema for snapshot, parsed section, AC, decision, risk, event, and data quality.
- Architecture docs show that the system already has an Artifact Scanner and a base Markdown parser, so the spec-pack parser can align with the existing ingest flow.
- The current source includes `ArtifactNormalizer` and `SpecPackMarkdownParserController`, but there does not appear to be a dedicated parser class specifically for `spec-pack.md` yet.
- The standard ticket template is clear enough to parse by headings/tables, but small variations across real tickets still need to be handled.

## Undetermined Points

- There are no remaining mandatory unknowns in Phase 1 after comparing the requirement and the database design.

## Expected Risks

- If headings do not match the standard template, the parser will issue warnings or errors depending on the severity of the missing parts.
- If the template deviates from the standard too much, the parser may skip sections and reduce downstream quality.
- If the demo endpoint remains too broad, the attack surface and maintenance cost will increase.
- If the seed/rule configuration for `SPEC_PACK` is not synchronized, snapshot and quality output may be incomplete even if the parsing code is correct.

## What AI Needs to Investigate

- Review the existing source code to confirm how the base parser and ingest entrypoint operate.
- Compare the sections in the raw requirement with the template to ensure nothing is missed in the spec-pack.
- Check the architecture/test docs to see whether any part describes the parser or snapshot flow differently from the raw pack.
- Confirm which source is canonical when there is a conflict: the raw pack or the general architecture/standards.

## What Humans Need to Ask

- There are no required questions remaining for Phase 1.

## Conditions Under Which Implementation Is Not Permitted

- Do not expand this into a general NLP parser beyond the `spec-pack.md` template.
- Do not add new tables or change existing migrations unless there is an official decision.
- Do not write logs, outputs, or tests in a way that stores raw secrets, raw prompts, or raw source code.