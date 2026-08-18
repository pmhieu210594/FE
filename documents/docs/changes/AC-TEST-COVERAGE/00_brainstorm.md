# 00_brainstorm

**Ticket ID**: AC-TEST-COVERAGE  
**Create date**: 2026-06-26  
**Author**: OpenAI  
**Update date**: 2026-06-26

## Purpose

Record the initial investigation for AC-Test Coverage logic to create the canonical spec for Phase 1. The goal is to lock down the test case source, coverage states, Dashboard display behavior, and MVP boundaries before implementation.

## Known Information

- This module is part of the MVP and is a component of the Dashboard, not a standalone business screen.
- `spec-pack.md` is the official source of ACs.
- `test-plan.md` is the only source of test cases.
- `test-results.md` and `CI summary` are supporting evidence only for confirming pass/fail.
- AC-to-test mapping is many-to-many.
- Coverage states remain: `MISSING`, `UNTESTED`, `PARTIAL`, `PASSED`, `FAILED`.
- Ticket-level coverage may be partial.
- The Dashboard is displayed in an `AC -> test cases` orientation.
- The API/read model prioritizes ACs.
- Manual mapping/pinning is out of scope for the MVP.
- First CI Pass and Exception KPIs are included in the MVP spec-pack.
- Confidence score is only an internal score for handling weak linkage; if it is too weak, the output remains `UNKNOWN`.

## Undetermined Points

No undetermined points remain for the current Phase 1 decisions.

## Expected Risks

- Planned coverage may be mistaken for executed coverage if rule precedence is not clear.
- If the parser is too permissive, the `UNKNOWN` state will appear too often and reduce user trust.
- If parse warnings are not recorded clearly, Data Ops will have difficulty distinguishing parser issues from genuinely missing data.
- If unnecessary new tables are added, the MVP will take longer and be harder to maintain.

## What AI Needs to Investigate

- Confirm whether the current parse rules are stable enough for the canonical spec.
- Check whether the current DB usage is sufficient for the Dashboard read model without a new migration.
- Align evidence quality score with coverage to avoid semantic conflicts.
- Ensure the Dashboard response shape prioritizes ACs and nested test cases.

## What Humans Need to Ask

None.

## Conditions Under Which Implementation Is Not Permitted

- Do not add black-box parsing to this ticket.
- Do not store raw prompt, raw chat, or full source text in the analytics DB.
- Do not create a new table if the current V4 schema is already sufficient.
- Do not treat planned coverage as executed coverage unless there is clear evidence.
- ACs without a test case in `test-plan.md` must be marked `MISSING`.
- Manual mapping/pinning is not supported in the MVP.
- Do not implement inference that is too weak to be explainable to QA.