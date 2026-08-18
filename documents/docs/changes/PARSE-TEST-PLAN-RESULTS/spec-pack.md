# Spec Pack

**Ticket ID**: PARSE-TEST-PLAN-RESULTS  
**Create date**: 2026-06-19  
**Author**: ChatGPT  
**Update date**: 2026-06-19

## 1. Context / Purpose

This ticket defines a PoC parser for two test artifacts used in the project’s ticket-template flow:

- `test-plan.md`
- `test-results.md`

The parser extracts template-defined sections into structured snapshot data so the UI can display the parsed test plan and test results for one ticket as a pair.

The parser is independent of CI gate state. The snapshot is written when parsing succeeds, partially succeeds, or fails with a parse status. CI does not gate whether parsing is persisted.

## 2. Scope

### 2.1. Within range

- Parse `test-plan.md`.
- Parse `test-results.md`.
- Extract the canonical sections defined by the ticket-template.
- Persist parse snapshots and section-level outputs.
- Mark parse status such as success, partial, not found, and parse error.
- Support pair-based UI viewing for the same ticket.
- Detect missing sections, placeholders, and obvious structure mismatches.
- Keep parse output stable and idempotent for the same source hash.

### 2.2. Out of range

- Parsing other document types.
- Code generation.
- CI gating logic.
- Automatic execution of tests.
- Automatic rollback execution.
- Raw markdown blob storage as the primary persisted form.
- Release orchestration or deployment automation.

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| test-plan.md | The ticket-level test plan template. | Parsed independently. |
| test-results.md | The ticket-level test execution/result template. | Parsed independently. |
| snapshot | Persisted parse result for one source file and hash. | Used for UI and audit. |
| canonical field | A template section mapped to a stable parser key. | Must remain stable across re-parses. |
| pair view | UI view that shows `test-plan.md` and `test-results.md` together for one ticket. | Convenience view only. |
| parse status | Parser outcome such as success or parse error. | Independent of CI. |

## 4. As-Is

- Test-plan and test-result documents exist as separate ticket artifacts.
- Reviewers read them manually or jump between files.
- The team has no consistent snapshot view that shows extracted fields and validation flags for both documents together.
- Re-parsing the same artifact can be hard to compare if output is not normalized.

## 5. To-Be

- When a ticket’s `test-plan.md` or `test-results.md` changes, the parser runs and persists a snapshot.
- The parser stores the extracted fields in a structured form.
- The UI can display the parsed `test-plan.md` and `test-results.md` as a pair for a ticket.
- The parser exposes missing-section and structural warnings without depending on CI.

## 6. Detailed specification

### 6.1. Business Rules

- `test-plan.md` and `test-results.md` are parsed independently.
- The UI must support viewing both artifacts together for one ticket.
- Parsing is triggered by PR, push, or webhook depending on repository integration.
- The parser writes snapshot rows immediately after parsing.
- The parser must not rely on CI pass/fail to decide whether parsing is persisted.
- The parser must preserve idempotency by source hash and parser version.

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| ticket id | string | yes | must be present in the ticket context | Used to resolve ticket scope. |
| source path | string | yes | must point to `test-plan.md` or `test-results.md` | Template-specific path. |
| source content | markdown text | yes | must be parseable markdown | Raw content should not be the primary persisted form. |
| source hash | string | yes | must be stable for the file revision | Used for idempotency. |
| parser version | string | yes | must be known | Used for lineage and replay. |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| parse status | enum | `SUCCESS / PARTIAL / NOT_FOUND / PARSE_ERROR` | Outcome for each parsed file. |
| parsed summary | json | normalized JSON | UI-friendly summary for the file. |
| parsed sections | rows/json | canonical key/value rows or equivalent JSON | Must map to the template field set. |
| warnings | list | structured notes | Missing sections or placeholder detection. |
| pair view readiness | boolean | true/false | Indicates both files are available for the ticket view. |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| file not found | mark `NOT_FOUND` and persist the snapshot status | `NOT_FOUND` | No crash. |
| markdown malformed | mark `PARSE_ERROR` | `PARSE_ERROR` | Do not write a fake success. |
| missing template section | mark `PARTIAL` and flag missing sections | `MISSING_SECTION` | Still persist the snapshot. |
| placeholder remains in source | mark `PARTIAL` or warning state | `PLACEHOLDER_FOUND` | Parser should not silently treat placeholders as complete data. |
| source hash unchanged | update or reuse existing snapshot idempotently | `DUPLICATE_SOURCE_HASH` | No duplicate snapshot rows. |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| empty file | 0 chars | 0 chars | blank file | `PARSE_ERROR` or `NOT_FOUND` depending on source existence. |
| minimal valid markdown | one valid section | all required sections present | very short content | `SUCCESS` if sections are complete. |
| long list section | single item | many items | `AC Matrix`, pass/fail lists, bug lists | Parse must remain stable and readable. |
| repeated re-parse | 1 re-parse | N re-parses | same `source_hash` | Idempotent update, not duplicate insert. |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Parse should complete quickly for small markdown tickets. | PoC target: seconds, not minutes. | Measure parse time in test logs. | Exact SLA can be refined later. |
| Security | Do not persist raw secrets or unrelated sensitive payloads. | 0 secret persistence. | Review persisted fields. | Metadata-first design. |
| Availability / Reliability | Parsing should not block the whole system on one malformed file. | Partial failure allowed. | Failure-path tests. | Independent file parsing. |
| Maintainability | Canonical field map must be stable and easy to extend. | Field keys remain versioned. | Template mapping review. | Use explicit section keys. |
| Observability / Logging | Parse status, warnings, and trace metadata must be visible. | Traceable parse execution. | Log/snapshot inspection. | No raw payload dumps. |
| Compatibility | Pair UI must work for one ticket with two separate files. | Side-by-side or tabbed pair view. | UI test / manual review. | No CI dependency. |

## 7. Acceptance Criteria

| ACID | description | testable? | notes |
|---|---|---|---|
| AC-PARSE-TEST-PLAN-RESULTS-1 | The system can parse `test-plan.md` independently. | Yes |  |
| AC-PARSE-TEST-PLAN-RESULTS-2 | The system can parse `test-results.md` independently. | Yes |  |
| AC-PARSE-TEST-PLAN-RESULTS-3 | The system extracts the canonical sections defined by the template for both files. | Yes |  |
| AC-PARSE-TEST-PLAN-RESULTS-4 | The system persists snapshot rows for parse results immediately after parsing. | Yes | CI does not gate parse persistence. |
| AC-PARSE-TEST-PLAN-RESULTS-5 | The system detects missing sections, placeholders, and parse errors. | Yes |  |
| AC-PARSE-TEST-PLAN-RESULTS-6 | The system keeps parse results idempotent for the same source hash and parser version. | Yes |  |
| AC-PARSE-TEST-PLAN-RESULTS-7 | The UI can show `test-plan.md` and `test-results.md` as a pair for one ticket. | Yes | Pair view only; files remain independently parsed. |

## 8. Examples

### 8.1. Normal Case

- A ticket has valid `test-plan.md` and `test-results.md` files.
- The parser extracts all canonical fields.
- The snapshot is persisted with `SUCCESS` status.
- The UI shows both files as a pair for the same ticket.

### 8.2. Error Case

- `test-results.md` exists but is malformed.
- The parser records `PARSE_ERROR` and stores a safe error summary.
- The system does not mark the parse as success.

### 8.3. Boundary Case

- `test-plan.md` contains only one valid section and the rest are placeholders.
- The parser records `PARTIAL` and flags missing/placeholder sections.
- The snapshot still exists for traceability.

## 9. Source Availability Summary

- The ticket-template definitions for `test-plan.md` and `test-results.md` are available from the template source.
- No verified implementation source was attached in this Phase 1 input.
- The exact persistence schema is intentionally deferred to later phases.

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: BE only / DB / Batch
- Primary risk: Spec / Source / DB / Test
- Review mode: Standard
- Required options: Source Analysis / DB Migration
```

## 11. FE/BE Contract Impact

- The backend must expose parse status and extracted field data in a structured response.
- The UI must support a pair view for `test-plan.md` and `test-results.md`.
- The UI must not assume CI-gated official parsing.
- The pair view should be driven by ticket ID plus parsed artifact type.

## 12. DB/Migration Impact

- Persist parse snapshots for both artifact types.
- Reuse the project’s existing artifact snapshot pattern if available.
- Avoid storing raw markdown as the primary persisted form.
- Use idempotent upsert behavior keyed by ticket, source path, source hash, and parser version.
- Keep future schema evolution additive.

## 13. Security/Privacy Impact

- Do not persist secrets, tokens, passwords, or private keys.
- Store only the fields needed for traceability, UI, and audit.
- Avoid logging raw payloads.
- Avoid leaking unrelated source content.

## 14. Operation/Maintenance Impact

- Parse status must be visible for troubleshooting.
- Idempotent re-parse behavior is required for maintenance.
- The parser should allow reprocessing when the source hash changes.
- The UI should keep the pair view stable even when one file is partial or malformed.

## 15. Test Strategy Summary

- Unit test the section extraction rules for both templates.
- Test independent parsing of each file.
- Test partial, missing, and malformed markdown cases.
- Test idempotent re-parse behavior for the same source hash.
- Test the pair-view data retrieval by ticket ID.

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
|H-PARSE-TEST-PLAN-RESULTS-1| Confirm whether the persistence model should store per-section rows, summary JSON, or both. | Impacts DB schema and UI query patterns. | BE / DB | Open |
|H-PARSE-TEST-PLAN-RESULTS-2| Confirm whether the pair view should be the default UI view. | Impacts UX and data retrieval behavior. | PM / FE | Open |

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
|A-PARSE-TEST-PLAN-RESULTS-1| The parser should persist snapshots immediately after parsing. | User clarified the parser is independent of CI. | Low | No |
|A-PARSE-TEST-PLAN-RESULTS-2| `test-plan.md` and `test-results.md` are parsed independently but paired in the UI. | User explicitly requested pair viewing for one ticket. | Low | No |
|A-PARSE-TEST-PLAN-RESULTS-3| The parser should be metadata-first, not raw-markdown-first. | Ticket-template style and earlier parser design pattern. | Medium | Yes |

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
|OI-PARSE-TEST-PLAN-RESULTS-1| Final persistence shape: per-section rows vs summary JSON vs both. | DB design and query implementation. | BE / DB | Open |
|OI-PARSE-TEST-PLAN-RESULTS-2| Default UI presentation for paired artifacts. | UX and query optimization. | FE / PM | Open |
