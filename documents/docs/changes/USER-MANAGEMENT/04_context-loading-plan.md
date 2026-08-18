# 04 Context Loading Plan

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-12  

## 1. Load Order

1. Read `sources.md` and this corrected `spec-pack.md`.
2. Read `context.md`, `ticket-rules.md`, `impact-analysis.md`, `impl-plan.md`.
3. Inspect FE source: `App.tsx`, `src/pages/user/*`, `src/lib/api.ts`.
4. Inspect BE source: `UserAccountAdminController`, `UserAccountAdminService`, DTO, repository port, mapper XML.
5. Inspect generated test files if validating AC coverage.

## 2. Must-not-assume Rules

- Do not assume team assignment exists.
- Do not create docs outside template.
- Do not rename AC IDs after tests are mapped.
- Do not mark tests as PASS unless actually run.

## 3. Required Context Before Future Changes

- Confirm local branch source still has same FE/BE classes and endpoints.
- Confirm test files copied into correct paths.
- Confirm local DB allows `team_id = NULL`.
