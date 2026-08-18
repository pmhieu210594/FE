# Black-box Review Checklist

**Ticket ID**: ROLE  
**Feature**: CRUD Role Management  
**Phase**: Phase 7 - Black-box Test / Test Data  
**Create date**: 2026-06-15  
**Author**: Codex  
**Update date**: 2026-06-15  
**Status**: Ready for reviewer and QA use

## Purpose

Use this checklist to review whether the Phase 7 black-box package is decision-complete and aligned with the canonical ROLE specification.

## Checklist

| ID | review item | expected review outcome | status |
|---|---|---|---|
| BRC-ROLE-001 | Every AC in `spec-pack.md` is mapped to at least one black-box case | No AC is unmapped | Pending Review |
| BRC-ROLE-002 | Every `P0` case includes explicit preconditions, steps/input, and expected result | `P0` cases are executable without design guesswork | Pending Review |
| BRC-ROLE-003 | Permission coverage includes `ADMIN`, `EDITOR`, `VIEWER`, and unauthenticated access where applicable | RBAC matrix is fully represented | Pending Review |
| BRC-ROLE-004 | Create/update/delete black-box cases reflect the currently approved ROLE contract | No stale delete-response or pagination assumptions remain | Pending Review |
| BRC-ROLE-005 | Duplicate checks include both active-role rejection and logically deleted-role allowance | Active-scope duplicate behavior is observable in the suite | Pending Review |
| BRC-ROLE-006 | Boundary cases cover blank, whitespace-only, max-length accepted, and over-limit rejected inputs | Role name boundaries are visible to QA | Pending Review |
| BRC-ROLE-007 | Search, sort, and FE-side pagination are represented as externally observable behavior | The suite avoids server-internal assumptions | Pending Review |
| BRC-ROLE-008 | Timestamp cases explicitly verify `DD/MM/YYYY HH:mm:ss` and local-time display behavior | Timestamp requirement is reviewable from black-box evidence | Pending Review |
| BRC-ROLE-009 | Audit / operation viewpoints are included where the spec makes them externally visible | Logical delete and post-delete visibility are covered | Pending Review |
| BRC-ROLE-010 | Test data is synthetic and non-sensitive | No production data, secret, credential, or PII is included | Pending Review |
| BRC-ROLE-011 | Expected results are externally observable and do not require code inspection | Cases remain black-box | Pending Review |
| BRC-ROLE-012 | `test-data.md` references are sufficient for QA to set up personas, baseline roles, boundary inputs, and deleted-role fixtures | Test data package is reusable | Pending Review |
| BRC-ROLE-013 | Any uncertainty is separated into `Assumptions` or `Human Decisions Required` instead of being presented as fact | Documentation discipline is preserved | Pending Review |

## Review Completion Gate

Phase 7 black-box artifacts can be considered review-complete when all items above are marked acceptable and:

1. `blackbox-testcases.md` contains stable case IDs and AC mapping.
2. `test-data.md` contains reusable synthetic datasets and persona definitions.
3. No `Blocker` or `Major` remains open inside the black-box artifact set itself.

## Assumptions

| ID | assumption | reason |
|---|---|---|
| BRC-ROLE-ASM-001 | Reviewers may use environment-approved observation paths for operational confirmation as long as testcase expectations stay implementation-independent | Keeps the checklist black-box while allowing practical review |

## Human Decisions Required

| ID | decision | reason |
|---|---|---|
| BRC-ROLE-HDR-001 | None currently identified for Phase 7 checklist completion | Canonical spec already resolves the main ROLE contract decisions |
