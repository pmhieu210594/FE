# 00_brainstorm

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22   
**Author**: nk_trung     
**Update date**: 2026-06-22  

## Purpose

This parser reads `docs/changes/<TICKET>/self-review.md` and transforms the fixed 11-section template into structured data. The goal is not to understand Markdown in general, but to reliably extract evidence, commands, test status, risks, human review content, and the final verdict.

## Known Information

- The 4-line header at the top of the file is metadata: Ticket ID, Create date, Author, and Update date.
- Sections 1, 6, 9, 10, and 11 are free text with minimal structure.
- Sections 2, 3, 4, 5, 7, and 8 are tables.
- Completeness must be evaluated per subtree, not just by the visible heading.
- A required section is mandatory; a recommended section improves quality; section 9 has been finalized as optional.
- Nested subsections are accepted only up to one child level under a heading; anything deeper will trigger a warning and will not be parsed into structure.
- Missing required sections will result in a partial parse with warnings/incomplete status, not a hard failure by default.
- The parser endpoint is internal by default and must not be publicly exposed in production unless separately approved.
- The verdict must be normalized to `PASS`, `NEEDS_UPDATE`, or `BLOCKED`.
- Placeholders and broken tables must be recorded as warnings or errors depending on severity.

## Undetermined Points

- Should the parser support heading aliases beyond the canonical text? Decided: only aliases in a fixed map are supported.
- Should the parser store raw section text, or only normalized rows and summaries? Decided: do not store raw text separately in the normalized output.
- Should the parser output only write to the existing reuse table, or also require a separate audit record? Decided: no separate audit record is needed; use the existing warnings/errors/summary.

## Expected Risks

- Some tickets may be missing the recommended section but still be acceptable.
- Some rows may be written as bullets instead of a Markdown table.
- Verdict text may differ in capitalization or format.
- The parser must avoid inventing missing evidence.
- Nested subsections deeper than one child level may break the standard structure if not clearly warned about.

## What AI Needs to Investigate

- There are no open questions left for Phase 1 within the current parser spec pack.
- Remaining decisions will only appear if the template or contract changes in a later phase.

## What Humans Need to Ask

- There are no new open questions for Phase 1 after alias, raw text, and audit record have been finalized.
- If the template changes, the canonical heading map and parse scope must be confirmed again.

## Conditions Under Which Implementation Is Not Permitted

- When the input template has not been confirmed as the single correct version.
- When the heading alias rules have not been finalized.
- When the output requirements are unclear regarding raw text, normalized rows, and audit records.