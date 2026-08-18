# Test Data

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## Data Policy

- Use synthetic data only.
- Do not use production data, real passwords, real bearer tokens, or secrets.
- Use deterministic prefixes so cleanup can safely identify test data.
- Include at least one repository fixture with preferred and fallback `.claude` locations, plus at least one fixture where `.claude` lives in a nested repository path for GitHub tree snapshot testing.
- Include boundary fixtures for `settings.json`, counts, and malformed JSON.

## Master Data

| name | value | purpose |
|---|---|---|
| Scan status | `READY` | Expected status for valid Safety Pack scans. |
| Scan status | `WARNING` | Expected status for partial coverage or policy warnings. |
| Scan status | `MISSING` | Expected status when required content is absent. |
| Scan status | `PARSE_ERROR` | Expected status for malformed `settings.json`. |
| Scan type | `SECRET` | Secret Scan policy tests. |
| Scan type | `SAST` | Static analysis policy tests. |
| Scan type | `SCA` | Dependency analysis policy tests. |

## Repository / Permission Data

| fixture | purpose | note |
|---|---|---|
| Repository with `documents/.claude/` | Precedence test | Preferred local source-dir case. |
| Repository with only `.claude/` | Fallback test | Backward-compatible local case. |
| Repository with nested `.claude` subtree | GitHub tree test | Snapshot resolution case for repo tree scanning. |
| Repository with malformed `settings.json` | Error test | Parse failure case. |
| Authenticated caller | Access test | Role-agnostic API access. |

## Normal Data

| ID | data | purpose |
|---|---|---|
| SAFE-001 | valid `CLAUDE.md`, `settings.json`, and `rules/*.md` | Default scan success case. |
| SAFE-002 | `settings.json` with empty permission arrays | Count-zero boundary case. |
| SAFE-003 | normalized summary v1 with SECRET/SAST/SCA records | Ingest happy-path case. |
| SAFE-004 | normalized summary v1 repeated twice for same repository / commit / scanner | Retry-safe dedupe case. |

## Error Data

| ID | data | expected error |
|---|---|---|
| ERR-SETTINGS-JSON | malformed `settings.json` | Parse error |
| ERR-PAYLOAD-MISSING | missing repository / commit SHA / workflow run id | Ingest rejection |
| ERR-PAYLOAD-INVALID | invalid scan type or status value | Ingest rejection |
| ERR-PAYLOAD-DUPLICATE | duplicate payload delivered twice | Upsert update, not new row |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| BND-RULES-EMPTY | rules markdown count | 0 | Not READY |
| BND-COUNT-ZERO | permission counts | empty or missing arrays | zero counts |

## Existing Data Compatibility

- Existing Safety Pack and CI evidence rows should remain readable through the backend APIs.
- Existing authenticated users should continue to access the APIs.
- No test should depend on production-like secrets or raw findings.

## Data Setup Procedure

1. Prepare an isolated test database or approved QA environment.
2. Create or identify synthetic repository fixtures.
3. Prepare a valid normalized summary v1 payload.
4. Create malformed fixtures for negative-path checks.

## Data Cleanup Procedure

1. Delete or archive only synthetic data with approved test prefixes.
2. Do not physically delete production or production-like data.
3. Prefer deactivation or test-database reset over hard delete.

## Sensitive Data Handling

- Do not store passwords, password hashes, tokens, secrets, or private keys in test evidence.
- Do not use real personal email addresses.
- Redact logs before saving evidence.
