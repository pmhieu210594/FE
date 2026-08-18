# Test Data

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-18  
**Author**: nk_trung
**Update date**: 2026-06-18  

## Data Policy

- Use deterministic sandbox or stubbed GitHub data only.
- Do not use production secrets, tokens, payloads, raw diff, or raw source content in artifacts.
- Ticket key fixtures should cover title, branch, path, and commit-message inference sources.

## Master Data

| name | value | purpose |
|---|---|---|
| Active branches | `main`, `develop` | Validate supported branch policy |
| PR statuses | `open`, `closed`, `merged`, `draft` | Validate normalized PR status output |
| Review states | `approved`, `changes_requested`, `commented`, `requested`, `dismissed`, `unknown` | Validate review-state normalization |
| Trigger sources | `WEBHOOK`, `MANUAL` | Validate run/audit mapping |
| TraceId | `trace-001`, `trace-002` | Validate operation log correlation |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `admin_user` | `ADMIN` | Manual collect allowed | Positive permission test |
| `viewer_user` | `VIEWER` | Manual collect denied | Negative permission test |
| `editor_user` | `EDITOR` | Manual collect denied | Negative permission test |
| `anonymous` | none | Webhook only, no manual access | Unauthenticated/manual denial check |

## Normal Data

| ID | data | purpose |
|---|---|---|
| N-001 | Active repo + PR #1 + title `ABC-123 Improve stock shortage error` + branch `feature/ABC-123-stock-error` | Manual and webhook happy path |
| N-002 | PR title contains `ABC-123` | Ticket inference by title |
| N-003 | Branch contains `feature/ABC-123-stock-error` | Ticket inference by branch |
| N-004 | Changed file path `docs/changes/ABC-123/spec-pack.md` | Ticket inference by path |
| N-005 | Commit message `ABC-123: fix error handling` | Ticket inference by commit message |
| N-006 | Existing ticket `ARTIFACT-SCANNER` created by scanner | Ticket reuse compatibility |
| N-007 | PR with commits and changed files | Traceability and persistence graph verification |

## Error Data

| ID | data | expected error |
|---|---|---|
| E-001 | Missing webhook signature | `401` / unauthorized-safe rejection |
| E-002 | Invalid webhook signature | `401` / unauthorized-safe rejection |
| E-003 | Unknown repository | Skip or safe reject without business persistence |
| E-004 | Inactive repository | Safe rejection / not found style result |
| E-005 | GitHub API timeout | `FAILED` or `PARTIAL_SUCCESS` with safe error info |
| E-006 | GitHub API 429/5xx | `FAILED` or `PARTIAL_SUCCESS` with safe error info |
| E-007 | Missing PR number for PR-specific collect | Validation error or safe rejection |
| E-008 | Malformed JSON payload | Parse error after signature check only |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| B-001 | PR number | `1` | Minimum valid PR number is accepted |
| B-002 | PR number | large positive number | Still handled as a valid positive identifier |
| B-003 | Multiple ticket candidates same priority | `ABC-123` and `XYZ-999` in same source field | No auto-pick of ambiguous winner |
| B-004 | Empty ticket fields | title/branch/path/commit message blank | Null/unknown ticket link, run does not fail |
| B-005 | Missing evidence folder | `docs/changes/<TICKET>/` absent | Metadata still persists |

## Existing Data Compatibility

- A ticket already created by Artifact Scanner must be reused.
- The same repository/PR can be collected repeatedly without duplicates.
- A PR can be collected even when the evidence folder does not exist yet.
- Existing webhook path and scanner compatibility data must remain valid.

## Data Setup Procedure

- Seed one active repository and one inactive repository.
- Seed `ADMIN`, `VIEWER`, `EDITOR`, and an anonymous/manual-denied case.
- Seed one existing Artifact Scanner ticket for reuse checks.
- Prepare stubbed GitHub responses for PR details, commits, changed files, and reviews.
- Prepare failure stubs for invalid signature, timeout, and provider error cases.

## Data Cleanup Procedure

- Remove test repository, ticket, run, and traceability rows after integration testing if the environment uses a shared DB.
- Do not remove production or shared artifacts.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII or secrets to artifacts.
