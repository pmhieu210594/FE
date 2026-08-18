# Promotion Candidates

**Ticket ID**: PARSE-IMPL-PLAN
**Create date**: 2026-06-19  
**Author**: ChatGPT
**Update date**: 2026-06-19

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| L1 | Heading canonicalization guidance | `documents/docs/standards/templates/_ticket-template/context.md` | Prevents parse drift and improves mapping | High |
| L2 | Parser status taxonomy (`SUCCESS`/`PARTIAL`/`NOT_FOUND`/`PARSE_ERROR`) | `documents/docs/standards/templates/_ticket-template/test-results.md` | Clarify reporting semantics for reviewers and CI | High |
| L3 | Parser integration checklist (DB run preflight) | `documents/docs/standards/templates/_ticket-template/phase-status.md` | Ensure integration tests run before promotion | Medium |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| R1 | Require `source_hash` persisted for any parsed artifact | Backend rules | Ensures idempotency and safe re-parsing | Low |
| R2 | Enforce `NOT_FOUND` vs `PARTIAL` decision matrix in reviews | Review checklist | Avoids ambiguous test outcomes | Medium |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| S1 | Canonical heading key list for `impl-plan.md` template | `documents/docs/standards/templates/_ticket-template/spec-pack.md` | Makes parser mapping explicit and reviewable |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| A1 | Add `docparse` flow diagram & DB adapter contract | `documents/docs/architecture/` | Improves handoff for DB & infra teams |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| F1 | Heading normalization mismatch | Template change / heading rename | Canonical heading list + validation | Unit test + CI gating |
| F2 | Missing-file snapshot write | Unexpected empty source or I/O error | Skip snapshot on NOT_FOUND + safe logging | Unit test + log alerting |

## Not Promoted

| item | reason |
|---|---|
| Live DB migration policy enforcement | Requires infra sign-off; defer to DB owners |

## Human Approval Required

- Approve `PARTIAL` vs `PARSE_ERROR` decision matrix (owner: Product/QA)
- Confirm integration testing sweep for `ImplPlanParseJdbcAdapter` (owner: BE/QA)
