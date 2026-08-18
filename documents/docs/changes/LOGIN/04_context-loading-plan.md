# Context Loading Plan

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11

## Purpose

Tell future agents which LOGIN files to read first so they can continue work without loading the whole repository.

## Read First

- `spec-pack.md`
- `impl-plan.md`
- `test-plan.md`
- `test-results.md`
- `open-issues.md`
- `handoff.md`

## Read If Needed

- `sources.md`
- `context.md`
- `source-map.md`
- `review-checklist.md`
- `blackbox-testcases.md`
- `blackbox-review-checklist.md`
- `report.md`

## Do Not Read

- Generated build outputs, coverage outputs, dependency folders, and unrelated change folders unless a failing test or source reference requires them.

## Reading Order

1. Confirm scope and AC from `spec-pack.md`.
2. Confirm target files and policies from `impl-plan.md`.
3. Confirm coverage and commands from `test-plan.md` and `test-results.md`.
4. Confirm unresolved decisions from `open-issues.md`.
5. Load source code only for the files listed in `source-map.md` and `context.md`.

## Token / Cost Consideration

Prefer targeted reads of the files named in `impl-plan.md`; avoid broad recursive reads unless source drift is suspected.

## Context Risks

The root `docs/changes/LOGIN` package and the FE `documents/docs/changes/LOGIN` package should stay aligned if either is edited later.
