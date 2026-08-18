# Test Data

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung     
**Update date**: 2026-06-23  

## Data Policy

- Use small, reproducible UTF-8 Markdown fixtures.
- Do not use real production data.
- Do not store PII, secrets, raw prompt, raw chat, or other sensitive content in artifacts.
- Prefer fixtures that can be reused across normal, error, boundary, permission, and observability checks.
- Test data must reflect the ACs and must not depend on internal implementation details.

## Master Data

| name | value | purpose |
|---|---|---|
| Artifact type | `SELF_REVIEW` | Target artifact identifier |
| Parse mode | `draft`, `official` | Distinguish parse context |
| Verdict | `PASS`, `NEEDS_UPDATE`, `BLOCKED` | Normalized final verdict values |
| Canonical section order | `1..11` | Required template order |
| Placeholder list | `---`, `<...>`, `TBD`, `TODO`, `N/A`, empty/null | Detect incomplete fields |
| Audit fields | `ticket_id`, `source_path`, `parse_mode`, `content_hash`, `warnings`, `errors` | Verify traceability and operational observability |
| Allowed path | `docs/changes/PARSER-SELF-REVIEW/self-review.md` | Canonical path for guarded parse |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| Data Ops tester | internal | run guarded parse endpoint | Verify path guard and parse output |
| QA tester | internal | execute black-box cases | Validate contract and warnings |
| PM reviewer | internal | read review artifacts | Confirm ticket closure artifacts |
| unauthorised caller | none / out of scope | no access to guarded parse | Verify rejection path |

## Normal Data

| ID | data | purpose |
|---|---|---|
| N-001 | Canonical `self-review.md` fixture with all 11 sections present | Baseline success case |
| N-002 | Canonical file with verdict text variations such as `pass` or `Needs_Update` | Verdict normalization case |
| N-003 | File with complete tables in sections 2, 3, 4, 5, 7, and 8 | Table extraction case |
| N-004 | UTF-8 file with Vietnamese / English mixed text in free-text sections | Encoding and text preservation case |
| N-005 | File with stable content parsed twice | Idempotency / content-hash case |

## Error Data

| ID | data | expected error |
|---|---|---|
| E-001 | Missing required section | Partial parse + warning |
| E-002 | Malformed table separator or bullet-list replacement | Table parse warning/error |
| E-003 | Verdict text outside supported set | Invalid verdict warning/error |
| E-004 | Path outside `docs/changes/PARSER-SELF-REVIEW/self-review.md` | Path guard rejection |
| E-005 | Placeholder-only field | Incomplete warning |
| E-006 | Missing file / deleted artifact | Missing artifact semantics |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| B-001 | Nested subsection depth | 2+ levels | Warning and no structured node beyond the allowed depth |
| B-002 | Line endings | CRLF vs LF | Same semantic parse and stable hash |
| B-003 | Unicode | Vietnamese accents / mixed English / Japanese | No mojibake or parse break |
| B-004 | Empty content | blank file | Error or warning with incomplete/missing-artifact semantics |
| B-005 | Very long free-text | long command / risk / note text | Parse remains stable and readable |
| B-006 | Section order drift | heading order changed but content present | Warning with preserved content |

## Existing Data Compatibility

- Reuse the canonical `docs/changes/PARSER-SELF-REVIEW/self-review.md` fixture as the golden baseline.
- Existing sample ticket files may be used only for regression comparison when they follow the same ticket scope.
- No migration or schema change is required for this phase.
- If temporary scratch fixtures are needed, place them under a test-only directory and remove them after execution.

## Data Setup Procedure

1. Create a UTF-8 Markdown fixture using the standard self-review template.
2. Add a variant with mixed verdict casing to test normalization.
3. Add a variant with one missing required section to test partial parse.
4. Add a variant with malformed table syntax to test error handling.
5. Add a variant with placeholder-only fields and nested subsection overflow.
6. Use the canonical path and an out-of-scope path to verify permission behavior.

## Data Cleanup Procedure

1. Delete any temporary fixtures created for the test run.
2. Do not keep outputs containing PII, secrets, raw prompts, or raw chat.
3. Reset any temporary snapshot or scratch state if it was used.
4. Verify reruns with the same content hash do not create duplicate semantic results.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets to artifacts.