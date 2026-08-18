# Test Data

**Ticket ID**: PARSE-IMPL-PLAN  
**Create date**: 2026-06-19  
**Author**: ChatGPT  
**Update date**: 2026-06-19  

## Data Policy

- Use only synthetic ticket-scoped markdown fixtures.
- Do not use production data.
- Do not store PII or secrets in artifacts.
- The goal is to validate section extraction, missing-section handling, idempotency, and safe error reporting.

## Master Data

| name | value | purpose |
|---|---|---|
| parser_name | impl-plan-parser | Idempotency and tracing |
| parser_version | v1 | Parser compatibility checks |
| parse_status | SUCCESS / PARTIAL / NOT_FOUND / PARSE_ERROR | Result normalization |
| ticket_id | PARSE-IMPL-PLAN | Ticket scope key |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| viewer_user | AUTHENTICATED | read parse result | Optional read-model exposure if enabled |
| admin_user | ADMIN | read parse result | Optional elevated read path for later UI |

## Normal Data

| ID | data | purpose |
|---|---|---|
| ND-001 | Valid `impl-plan.md` with all required headings and tables | Happy-path parse |
| ND-002 | Valid markdown with Vietnamese / English mixed text | Encoding and section detection |
| ND-003 | Valid markdown with long bullet lists | Stability under larger content |

## Error Data

| ID | data | expected error |
|---|---|---|
| ED-001 | File missing `Migration / Rollback Policy` heading | `PARTIAL` |
| ED-002 | File missing entirely | `NOT_FOUND` |
| ED-003 | Malformed heading / broken table syntax | `PARSE_ERROR` |
| ED-004 | Duplicate section heading | `PARTIAL` or `PARSE_ERROR` |
| ED-005 | Unsupported encoding / mojibake text | `PARSE_ERROR` |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| BD-001 | file length | very long markdown | Parser remains stable and safe |
| BD-002 | section count | duplicate / repeated headings | Section issue is reported explicitly |
| BD-003 | language mix | Vietnamese + English + code block | No encoding corruption |
| BD-004 | table size | many rows in AC mapping | Parser remains idempotent |

## Existing Data Compatibility

- Previous parse-result rows with the same `source_hash` should be treated as the same logical source during re-parse tests.
- Fixture content should remain compatible with the explicit template headings defined in the `impl-plan.md` template.

## Data Setup Procedure

1. Prepare synthetic `impl-plan.md` fixtures under the ticket folder.
2. Ensure each fixture follows the same ticket path convention.
3. Generate a stable source hash for idempotency tests.
4. Prepare a missing-file case by leaving the file absent.
5. Prepare a malformed case by removing one or more required headings.

## Data Cleanup Procedure

1. Remove temporary fixture files.
2. Remove generated parse-result test rows if the test uses a real database.
3. Restore the ticket folder to its original state.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets to artifacts.
- Do not put raw stack traces or raw payloads into the test dataset.
