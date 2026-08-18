 00_brainstorm

**Ticket ID**: EVIDENCE-QUALITY-SCORE        
**Create date**: 2026-06-23         
**Author**: nk_trung      
**Update date**: 2026-06-23           

## Purpose

Record investigation notes before locking `spec-pack.md` as the single source of truth for the Evidence Quality Score engine. This file is only for reasoning, assumptions, risks, and points that still require human decision.

## Known Information

- This feature calculates a score from 0 to 100 for each ticket.
- The source documents have already defined the main input set: spec-pack, impl-plan, review checklist, self-review, test plan, test results, black-box test cases, CI metadata, PR metadata, traceability links, and report.
- The database design already provides a score table, metric tables, and a lineage table, so the MVP should reuse the existing schema.
- PR review metadata/comments are the source of truth for review status and findings.
- There is currently no dedicated score engine service in the repository.
- The requirement clearly says the engine must not store raw prompts, raw chat, full source code, or raw CI logs.

## Undetermined Points

- The MVP is finalized as full history plus current/latest snapshot for each ticket.
- V0 does not allow manual score override; exceptions must be recorded in a separate exception record.
- The score weights in v0 are fixed for all ticket types and phases.
- Governance UI/API for score rule versioning is deferred to a later version; the MVP only needs a fixed v0 rule and version stored in the result.

## Expected Risks

- If the score rule is too rigid, different ticket types may not be compared fairly; this is accepted in v0 in exchange for simplicity and auditability.
- If the score rule is too loose, the score will be difficult to explain and difficult to test.
- If history handling is unclear, the same ticket may show multiple values without a latest-vs-history convention; therefore Phase 1 finalizes full history plus current/latest snapshot.
- If missing data is treated as a hard error, the pipeline may become fragile.
- If the engine starts relying on internal review files instead of PR review metadata/comments, the source of truth will be inconsistent.

## What AI Needs to Investigate

- Pin down the exact score bands and fixed initial weights from the requirement and database design.
- Confirm the minimum response shape for dashboard and Postman usage.
- Confirm whether there is any existing service or adapter that already expects the score to be stored in a specific table or metric layer.
- Confirm whether the score engine should return only one latest result or a result history.

## What Humans Need to Ask

- Phase 1 decision already finalized: full history plus current/latest snapshot.
- Phase 1 decision already finalized: no manual score override in v0.
- Phase 1 decision already finalized: fixed phase-agnostic weights for v0.

## Conditions Under Which Implementation Is Not Permitted

- Do not implement any rule that stores or processes raw prompts, raw chat, full source code, or raw CI logs.
- Do not use internal review files as the canonical source for review state when PR review metadata/comments are already available.
- Do not add any new schema object in the MVP unless the owner explicitly approves a migration.
- Do not enable manual score override directly in v0.