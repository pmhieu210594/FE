# Test Data

**Ticket ID**: EVIDENCE-QUALITY-SCORE  
**Create date**: 2026-06-23  
**Author**: nk_trung  
**Update date**: 2026-06-25  

## Data Policy

- Use only synthetic ticket IDs, synthetic PR numbers, synthetic CI run IDs, and synthetic repository IDs.
- Do not use original production data.
- Do not save PII, secrets, raw prompts, raw chat, or raw CI logs to artifacts.
- Keep all fixtures explainable from metadata and redacted references only.

## Master Data

| name | value | purpose |
|---|---|---|
| Score band | `Critical`, `Risky`, `Warning`, `Good`, `Excellent` | Band mapping and boundary-value checks. |
| Band thresholds | `0-39`, `40-59`, `60-74`, `75-89`, `90-100` | Boundary / off-by-one checks. |
| Rule version | `v0` | MVP default calculation rule. |
| Missing item state | `missing` | Verifies safe degradation when evidence is absent. |
| Parse error state | `parseErrors[]` | Verifies partial-result behavior. |
| Review source of truth | PR review metadata/comments | Canonical review-source checks. |
| Output fields | `ticketId`, `score`, `band`, `breakdown`, `missing`, `parseErrors`, `traceIds`, `scoreRuleVersion`, `calculatedAt` | Response-shape verification. |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `qa-reader` | VIEWER | Read-only score lookup | Verify read-back behavior from a consumer perspective. |
| `qa-operator` | ADMIN | Recalculate / backfill when supported | Verify operator-scoped access if the controller is role-gated. |
| `ci-bot` | SYSTEM | Non-human caller for automated refresh | Verify CI-triggered recalculation path when available. |

## Normal Data

| ID | data | purpose |
|---|---|---|
| N-001 | Ticket with complete `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `blackbox-testcases.md`, and `report.md`, plus linked PR / CI / traceability records | Happy-path score calculation. |
| N-002 | Ticket whose evidence set produces a score in the middle range, with non-empty breakdown entries | Score/band and breakdown explanation check. |
| N-003 | Ticket with a persisted score snapshot and unchanged source state | Read-back and idempotency checks. |
| N-004 | Ticket whose PR review metadata/comments contain the authoritative review outcome while internal review notes disagree | Canonical review-source check. |
| N-005 | Ticket with full downstream-ready response fields but no raw source payloads | Response-shape and privacy check. |

## Error Data

| ID | data | expected error |
|---|---|---|
| E-001 | Missing `test-results.md` | Score still returns, missing item is listed, score decreases appropriately. |
| E-002 | Missing `blackbox-testcases.md` | Score still returns, black-box evidence is marked missing. |
| E-003 | Broken Ticket -> PR link | Score decreases and the broken link is reported. |
| E-004 | Broken Ticket -> CI link | Score decreases and traceability is reduced. |
| E-005 | Malformed `test-results.md` | `parseErrors[]` is returned and a partial result is produced when possible. |
| E-006 | Malformed `review-checklist.md` | `parseErrors[]` is returned and review-related fields remain explainable. |
| E-007 | Non-existing ticketId | Safe validation / not-found response; no crash. |
| E-008 | Missing review metadata/comments | Review-related fields are marked missing or partial. |
| E-009 | Raw prompt / raw chat text injected into a fixture by mistake | Response must not echo or persist the raw content. |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| B-001 | score | 0 | `Critical` |
| B-002 | score | 39 | `Critical` |
| B-003 | score | 40 | `Risky` |
| B-004 | score | 59 | `Risky` |
| B-005 | score | 60 | `Warning` |
| B-006 | score | 74 | `Warning` |
| B-007 | score | 75 | `Good` |
| B-008 | score | 89 | `Good` |
| B-009 | score | 90 | `Excellent` |
| B-010 | score | 100 | `Excellent` |
| B-011 | rule version | same `ticketId`, same `v0` | identical persisted result |
| B-012 | rule version | same `ticketId`, different version label if supported | version is reflected without changing the current contract shape |

## Existing Data Compatibility

- Reuse the existing V4 score table and related metric / lineage tables.
- Do not depend on any dropped legacy schema.
- Keep history rows intact if the repository already stores multiple score calculations.
- The read-back contract must remain compatible with downstream consumers that expect the latest persisted snapshot only.

## Data Setup Procedure

1. Create a synthetic ticket and assign a synthetic repository / PR / CI identity.
2. Attach dummy artifacts for all required SDD documents and traceability records.
3. Prepare one variant with a missing artifact, one variant with a broken link, and one variant with a malformed input file.
4. Prepare a boundary fixture set that yields the threshold scores in `Boundary Data`.
5. Save the persisted score snapshot for the read-back case before running repeated reads.

## Data Cleanup Procedure

1. Delete or roll back the synthetic ticket and related evidence rows from the test dataset.
2. Remove any temporary fixture files created for parse-error or boundary scenarios.
3. Clear cached persisted-score snapshots created for black-box execution.
4. Confirm no raw prompt/chat/source/raw CI log data was captured in test artifacts.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets to artifacts.
- Do not paste raw prompts, raw chat, raw CI logs, passwords, tokens, or source code into the test data file.
- Use placeholder labels such as `<redacted>` when an evidence reference must be shown in a report.
- Keep screenshots and log excerpts redacted so only metadata is visible.