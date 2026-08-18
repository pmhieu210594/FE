# 00_brainstorm

**Ticket ID**: PARSE-TEST-PLAN-RESULTS  
**Create date**: 2026-06-19  
**Author**: ChatGPT  
**Update date**: 2026-06-19

## Purpose

Build a PoC parser for `test-plan.md` and `test-results.md` that extracts the template-defined sections into structured snapshot data.

## Known Information

- The parser target is only `test-plan.md` and `test-results.md`.
- The UI must support viewing both artifacts as a pair for one ticket.
- The parser does not depend on CI gate state.
- Snapshot rows are written immediately after parse.
- Canonical fields for both templates are already agreed in the conversation.

## Undetermined Points

- Whether the persistence layer should store both JSON summary and per-section rows.
- Whether parsed sections should be normalized into field rows, snapshot JSON, or both.
- Whether the parser should attach `traceId` and run telemetry in a shared connector-run table or inside snapshot metadata.
- Whether the UI should show a merged pair view by default or via a toggle.

## Expected Risks

- Template drift between `test-plan.md` and `test-results.md`.
- Parsing list/table-heavy sections such as AC matrix, test cases, passes/fails, and bugs fixed.
- Mismatch between the template section names and the eventual parser keys.
- Idempotency problems when the same file is parsed multiple times.

## What AI Needs to Investigate

- The exact canonical field names from the template for both files.
- Common pattern for snapshot persistence in the current platform.
- The best way to represent list-like sections for UI and audit.
- How to keep parsed snapshots stable when the same source hash is re-parsed.

## What Humans Need to Ask

- Whether the parser should preserve both parsed summary and parsed section detail.
- Whether the paired UI view should default to showing `test-plan.md` and `test-results.md` side-by-side.
- Whether the parser should support re-parse history or only the latest snapshot.

## Conditions Under Which Implementation Is Not Permitted

- The target template fields are not aligned with the agreed field map.
- The parser would need to store raw markdown blobs instead of structured snapshot data.
- The implementation would depend on undocumented CI or release flow.
- The implementation would introduce parsing logic for unrelated artifact types.
