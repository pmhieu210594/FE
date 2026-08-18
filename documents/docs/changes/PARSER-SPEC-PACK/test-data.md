# Test Data

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung  
**Update date**: 2026-06-22  

## Data Policy

- Test data must be UTF-8 Markdown.
- Do not use real production data.
- Do not store PII/secrets/raw chat/raw prompt in test artifacts.
- Prefer data that can be reused across normal / error / boundary / audit cases.
- Test data must reflect the AC accurately and must not rely on implementation details.

## Master Data

| name | value | purpose |
|---|---|---|
| Artifact type | `SPEC_PACK` | Artifact parser identifier |
| Parse mode | `draft`, `official` | Distinguish early snapshot and official snapshot |
| Parse status | `DRAFT`, `OFFICIAL`, `PARTIAL`, `FAILED` | Processing status |
| Placeholder list | `---`, `<...>`, `TBD`, `TODO`, `N/A`, `-`, empty/null | Check incomplete fields |
| AC format | `AC-<TICKET>-<n>` | Validate AC format |
| Audit fields | `ticketId`, `sourcePath`, `parseMode`, `contentHash`, `warnings`, `errors` | Verify traceability and operations |
| Allowed path | `docs/changes/PARSER-SPEC-PACK/spec-pack.md` | Check the canonical path and prevent misreads |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `admin_user` | ADMIN | Call scan operation API if needed | Check operational / admin-only flow |
| `qa_user` | VIEWER | View report/test artifacts | Check review flow |
| `anonymous_request` | NONE | No permission | Check guard for related endpoints |

## Normal Data

| ID | data | purpose |
|---|---|---|
| N-01 | A complete `spec-pack.md` file, following the correct template, with 10 standard ACs | Normal case |
| N-02 | A file with valid front matter and a small conflict with header/path | Metadata-priority case |
| N-03 | A file with core sections but the section order is slightly rearranged | Section normalization case |
| N-04 | A file that mixes Unicode/Vietnamese/English/Japanese | Multilingual case |
| N-05 | A file that includes both short and long tables in Detailed specification | Table extraction case |

## Error Data

| ID | data | expected error |
|---|---|---|
| E-01 | Missing `Open Issues` or `Human Decision Required` section | Warning / partial parse |
| E-02 | AC format like `AC001` or missing sequence number | AC format warning |
| E-03 | Required field is `TBD`, `TODO`, `N/A`, `---` | Placeholder warning |
| E-04 | Severely broken Markdown table or missing table header | Parse error |
| E-05 | File does not exist | Missing artifact |
| E-06 | Path outside `docs/changes/<TICKET>/spec-pack.md` | Guard reject |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| B-01 | Ticket ID | Path with/without front matter conflict | Front matter wins when valid |
| B-02 | Scope section | Only In Scope or only Out of Scope | Warning, do not merge them |
| B-03 | AC count | 0 / 1 / many ACs | Count accurately |
| B-04 | Content size | Empty / very long | Parse responds clearly |
| B-05 | Placeholder density | One spot / many spots / scattered throughout the file | Flag incomplete status correctly |
| B-06 | Content hash | Same content parsed again | Do not create duplicate snapshots |

## Existing Data Compatibility

- Reuse the file `docs/changes/PARSER-SPEC-PACK/spec-pack.md` as the golden input standard.
- Existing sample ticket files in the workspace can be reused for regression comparison.
- No dependency on a new migration.
- If sample files are needed, prefer `spec-pack.md` files under `docs/changes/<TICKET>/` from sample tickets.

## Data Setup Procedure

1. Create a UTF-8 Markdown file using the standard template.
2. Add front matter if you need to test metadata precedence.
3. Add standard ACs and malformed ACs to separate warnings.
4. Add placeholders to required fields to test incomplete detection.
5. Create empty / oversized / reordered variants to cover boundary cases.

## Data Cleanup Procedure

1. Delete any test files created specifically for the test run.
2. Do not keep outputs containing PII/secrets.
3. Reset the temporary DB snapshot if one is used.
4. For reruns with the same `content_hash`, verify that no duplicate snapshot is created.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets in artifacts.