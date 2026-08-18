# 00_brainstorm

**Ticket ID**: PARSE-IMPL-PLAN  
**Create date**: 2026-06-18  
**Author**: ChatGPT  
**Update date**: 2026-06-19  

## Purpose

Capture the implementation notes for a parser that reads `docs/changes/PARSE-IMPL-PLAN/impl-plan.md` and stores the parsed result in existing DB tables instead of creating a dedicated parse schema.

## Known Information

- The `impl-plan.md` template defines 14 headings.
- `ArtifactNormalizer` already parses Markdown headings and computes a content hash.
- `tbl_fact_artifact_snapshot` already has reusable columns for parse status metadata, JSON summary, and idempotency by `(repository_id, source_path, content_hash)`.
- `tbl_fact_artifact_parsed_section` already exists for section-level storage.
- The parser scope excludes `impact-analysis.md`.

## Undetermined Points

- Whether renamed headings should be accepted as aliases.
- Whether `PARTIAL` and `PARSE_ERROR` should remain distinct.
- How much summary data should be kept in `parsed_summary`.
- Whether any additional review UI is needed later.

## Expected Risks

- Template drift can break section-key mapping.
- Duplicate headings may produce ambiguous section states.
- Using the wrong table would create unnecessary migration debt.
- Mixed-language markdown can still be parsed incorrectly if headings are changed.

## What AI Needs to Investigate

- Confirm the template headings in `_ticket-template/impl-plan.md`.
- Confirm the existing DB columns available in `tbl_fact_artifact_snapshot` and `tbl_fact_artifact_parsed_section`.
- Confirm current parser/service code paths before modifying storage behavior.
- Confirm safe logging patterns for parse failures.

## What Humans Need to Ask

- Should renamed headings be treated as aliases?
- Should parse errors be persisted or only returned?
- Is a new review screen needed or is backend storage enough?
- Should any extra metadata be added beyond the existing DB columns?

## Conditions Under Which Implementation Is Not Permitted

- The parser guesses headings instead of following the template contract.
- The implementation expands to `impact-analysis.md`.
- The design creates new parser tables without a clear need, which we are explicitly avoiding.
- The code logs raw source content or sensitive data.
- The persistence model cannot support idempotent re-parse by source hash.
