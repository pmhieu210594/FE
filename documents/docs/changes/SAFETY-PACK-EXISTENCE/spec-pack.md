# Spec Pack

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## 1. Context / Purpose

This ticket defines the backend Safety Pack and CI security evidence MVP for the EDCAP platform.

The agreed MVP scope covers:

1. Safety Pack coverage from repository `.claude` content.
2. deny / ask / allow summary from `.claude/settings.json`.
3. CI/CD security evidence ingestion from GitHub Actions for Secret Scan, SAST, and SCA.

Security Exception management is deferred and out of scope for this ticket.

The objective is to remove manual copy/paste of security evidence. When a workflow runs GitHub Actions, it must push a normalized security summary to the backend so the system can store evidence directly in approved `tbl_` tables, without creating duplicate rows on retries.

High-risk human approval detection is explicitly out of scope for this ticket.

## 2. Scope

### 2.1. Within range

- Scan repository Safety Pack locally from `documents/.claude/` first, then `.claude/`.
- Resolve Safety Pack content from GitHub tree snapshots even when `.claude/` lives in a nested repository path.
- Detect `CLAUDE.md`, `settings.json`, `rules/`, and `rules/*.md`.
- Parse `deny`, `ask`, and `allow` summary counts from `.claude/settings.json`.
- Calculate Safety Pack status: `READY`, `WARNING`, `MISSING`, `PARSE_ERROR`.
- Accept normalized GitHub Actions security evidence push from workflow jobs.
- Ingest Secret Scan evidence using Gitleaks summary.
- Ingest SAST evidence using Semgrep summary.
- Ingest SCA evidence using Trivy summary.
- Store evidence only in approved `tbl_` tables.
- Provide admin APIs for Safety Pack and Security Scan data.

### 2.2. Out of range

- High-risk human approval detection from changed files / PR diff.
- Pulling raw artifacts from GitHub as the primary evidence flow.
- Reading Secret Scan / SAST / SCA reports from `_ticket-template`.
- Storing raw secret values, tokens, private keys, or raw sensitive findings.
- AI semantic scoring of `.claude` rule quality.
- Auto-fixing `.claude` files.
- Changes to LOGIN, USER-MANAGEMENT, or unrelated business modules.
- UI/page/route implementation work for this ticket.

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| Safety Pack | Repository safety guidance under `.claude`. | Includes `CLAUDE.md`, `settings.json`, and `rules/`. |
| Secret Scan | Secret leak detection using Gitleaks. | MVP tool. |
| SAST | Static application security testing using Semgrep. | MVP tool. |
| SCA | Software composition analysis using Trivy. | MVP tool. |
| Normalized summary v1 | Internal JSON payload from GitHub Actions. | Counts and metadata only. |

## 4. As-Is

- Repositories may already contain `.claude` Safety Pack files.
- The current ticket template does not define fixed Secret Scan / SAST / SCA report files.
- Security evidence often requires manual collection or external lookup.
- There is no agreed mechanism in the current docs set to push PR security evidence directly into the platform database.

## 5. To-Be

- The platform scans repository Safety Pack files directly from the repository filesystem.
- GitHub Actions pushes normalized security summary payloads to BE on PR or CI execution.
- BE validates and stores evidence in approved `tbl_` tables.
- Authenticated users can read Safety Pack status and CI security scan status through backend APIs.

## 6. Detailed specification

### 6.1. Business Rules

| ID | Rule |
|---|---|
| BR-1 | Local Safety Pack scanner looks for `documents/.claude/` first, then `.claude/`. |
| BR-2 | GitHub snapshot scanner resolves the first `.claude/` subtree found in the repository tree, then falls back to root `.claude/` when no nested subtree exists. |
| BR-3 | The scanner must detect `CLAUDE.md`, `settings.json`, `rules/`, and `rules/*.md`. |
| BR-4 | The parser stores counts only, not raw command strings. |
| BR-5 | Secret Scan uses Gitleaks, SAST uses Semgrep, and SCA uses Trivy. |
| BR-6 | Only approved `tbl_` tables may be used for persistence. |
| BR-7 | Repeated normalized CI evidence pushes must update the existing row for the same repository / commit / scanner combination instead of inserting duplicates. |
| BR-8 | No raw secret, token, private key, or raw finding content may be stored or logged. |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| Repository filesystem contents | folder tree | Yes | Must be readable as UTF-8 | Safety Pack scan source. |
| GitHub Actions normalized summary v1 | JSON payload | Yes | Must contain repository, commit SHA, workflow run id, workflow job identity, and scans | CI ingest source. |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| Safety Pack status | enum/string | `READY` / `WARNING` / `MISSING` / `PARSE_ERROR` | For DB rows and API output. |
| CI security scan summary | list of records | normalized JSON and DB rows | Includes SECRET / SAST / SCA. |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| Invalid `settings.json` | Mark Safety Pack as parse error | `PARSE_ERROR` | Must not crash scan. |
| Missing CI evidence | Return safe absence state | `NOT_AVAILABLE` or equivalent | Must not store raw artifacts. |
| Missing authentication | Block access if the API requires login | `Component.Permission.Denied` or equivalent | Applies to APIs. |
| Security Exception management request | Reject as out of scope | N/A | Not part of this ticket. |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| `rules/` markdown count | 0 | many | `rules/` exists with no `.md` files | Not READY. |
| Permission arrays in settings | missing | many entries | `deny`, `ask`, or `allow` absent | Count becomes zero. |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Scan and ingest must be lightweight | Normal workflow latency only | Source review and tests | No raw artifact download. |
| Security | Do not leak secrets or PII | Zero raw sensitive values in logs/persistence | Source review and tests | Authenticated API access only. |
| Maintainability | Keep the contract backend-focused | Reuse existing controller/service/persistence patterns | Source review | No UI implementation in this ticket. |

## 7. Acceptance Criteria

| AC ID | Description | Main test coverage |
|---|---|---|
| AC-SAFETY-PACK-1 | Scan repository Safety Pack from `documents/.claude/` or `.claude/`, preferring `documents/.claude/` when both exist. | BE unit / black-box |
| AC-SAFETY-PACK-2 | Record whether `CLAUDE.md`, `settings.json`, `rules/`, and `rules/*.md` exist. | BE unit / black-box |
| AC-SAFETY-PACK-3 | Parse `.claude/settings.json` and store deny / ask / allow summary counts without raw sensitive content. | BE unit / black-box |
| AC-SAFETY-PACK-4 | Invalid JSON marks the Safety Pack result as `PARSE_ERROR` and does not crash the scan. | BE unit / black-box |
| AC-SAFETY-PACK-5 | Store Safety Pack evidence only in approved `tbl_` tables. | BE integration / review |
| AC-SAFETY-PACK-6 | GitHub Actions can push normalized summary v1 to the backend. | BE integration |
| AC-SAFETY-PACK-7 | Gitleaks summary maps unresolved findings to `FAIL`. | BE integration / black-box |
| AC-SAFETY-PACK-8 | Semgrep summary maps critical findings to `FAIL` and high findings to `WARNING`. | BE integration / black-box |
| AC-SAFETY-PACK-9 | Trivy summary maps critical findings to `FAIL` and high findings to `WARNING`. | BE integration / black-box |
| AC-SAFETY-PACK-10 | Store only normalized counts, metadata, and workflow identifiers for Secret Scan / SAST / SCA, and keep repeated pushes idempotent. | BE integration / review |
| AC-SAFETY-PACK-11 | Authenticated users of any role can access Safety Pack and Security Scan APIs. | BE integration |
| AC-SAFETY-PACK-12 | High-risk human approval detection remains out of scope. | Review |

## 8. Examples

### 8.1. Normal Case

| Case | Expected result | Related AC |
|---|---|---|
| Scan `documents/.claude/` with valid files. | Safety Pack status and counts are computed. | AC-1, AC-2, AC-3, AC-4 |
| Push normalized summary v1 from workflow. | Evidence is stored in normalized form and repeated retries update the same logical row. | AC-6, AC-7, AC-8, AC-9, AC-10 |

### 8.2. Error Case

| Case | Expected result | Related AC |
|---|---|---|
| Malformed `settings.json`. | Parse error without crash. | AC-4 |
| Malformed ingest payload. | Safe rejection, no partial evidence. | AC-6, AC-10 |

### 8.3. Boundary Case

| Case | Expected result | Related AC |
|---|---|---|
| `rules/` exists but contains no markdown files. | Not READY. | AC-2 |
| Missing permission arrays. | Missing arrays count as zero. | AC-3 |

## 9. Source Availability Summary

| Source | Status | Notes |
|---|---|---|
| BE source | read | `SafetyPackService`, ingest service, controller exist. |
| DB migration/schema | read | Approved `tbl_` tables are the persistence boundary. |
| Workflow source | read | GitHub Actions normalized summary v1 flow is the evidence source. |
| Template docs | read | This corrected pack follows the shared structure. |

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: BE + DB + Batch
- Primary risk: Security / DB / Contract / Test
- Review mode: Heavy for security-sensitive evidence handling
- Required options: Source Analysis / BE-API Contract / DB Mapping / Full Security
```

## 11. BE/API Contract Impact

| Contract | Actual source |
|---|---|
| GET `/api/v1/admin/safety-packs` | list Safety Pack results and counts |
| GET `/api/v1/admin/security-scans` | list normalized security scan summaries |
| POST `/api/v1/internal/security-evidence/github-actions` | ingest normalized summary v1 |

Request DTOs do not include raw findings. Response DTOs expose only normalized evidence fields.

## 12. DB/Migration Impact

| Table | Impact |
|---|---|
| `tbl_fact_safety_pack_status` | store Safety Pack scan status and file coverage |
| `tbl_fact_security_scan` | store normalized CI security scan summaries |
| `tbl_dim_project`, `tbl_dim_repository`, `tbl_dim_ticket`, `tbl_fact_pull_request`, `tbl_fact_ci_run`, `tbl_connector_run`, `tbl_dim_role` | referenced for relationships and metadata |

No non-`tbl_` table may be introduced.

The persistence layer now treats the following as the deduplication keys:

- `tbl_fact_safety_pack_status`: `(repository_id, commit_sha)`
- `tbl_fact_security_scan`: `(repository_id, commit_sha, scanner_type)`

## 13. Security/Privacy Impact

- Authenticated API access only.
- Never expose or log raw secrets, tokens, private keys, or finding bodies.
- Security Exception management remains out of scope.
- Only normalized evidence and safe metadata may be persisted.

## 14. Operation/Maintenance Impact

- No batch/job/event.
- Rollback can disable the ingest endpoint and hide the read APIs.
- Data created by this feature should not be deleted automatically.
- Workflow pushes require secure, traceable operation because no raw artifact pull is the primary flow.
- Repeated workflow retries must not create duplicate evidence rows.

## 15. Test Strategy Summary

| Type | Coverage |
|---|---|
| BE UT | Safety Pack source-dir precedence, settings parsing, status calculation, ingest validation. |
| BE IT | Internal push endpoint, admin read APIs, safe response fields, persistence into `tbl_` tables. |
| Black-box | Authenticated API access, parse error handling, normalized policy mapping, no raw-sensitive leakage. |
| Security review | Admin-only behavior, no raw findings, no hard-coded secrets. |

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| H-1 | Confirm GitHub Actions workflow/job correlation rules for retries | Needed to pin the CI contract | BE/QA | Open |
| H-2 | Confirm internal auth/signature rule for the ingest endpoint | Needed for backend verification | BE/Security | Open |
| H-3 | Confirm whether detailed security findings are needed in MVP | Affects DB and ingest scope | BE/Data | Open |

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-1 | GitHub Actions is the CI/CD provider for the MVP | Current workflow source | Low | No |
| A-2 | Gitleaks, Semgrep, and Trivy are the selected tools | Existing workflow source | Low | No |
| A-3 | The implementation must use only `tbl_` tables for persistence | Ticket rules and user guidance | Low | No |

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-1 | GitHub Actions workflow/job correlation rules for retries | CI contract may remain ambiguous | BE/QA | Open |
| OI-2 | Internal endpoint auth/signature scheme | Backend verification may be incomplete | BE/Security | Open |
| OI-3 | Whether `tbl_fact_security_finding` detail storage is MVP or later | DB and ingest scope may change | BE/Data | Open |
