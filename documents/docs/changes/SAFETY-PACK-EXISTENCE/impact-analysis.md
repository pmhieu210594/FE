# Impact Analysis

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## 1. Change Content

Safety Pack filesystem scan and normalized GitHub Actions security summary ingestion are being documented and aligned to backend-only scope. Security Exception management stays deferred and out of scope for this ticket. The current code also supports `.claude` discovery in nested repository paths for GitHub tree snapshots and uses idempotent upsert keys to avoid duplicate evidence rows.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| BE admin/internal controller files | Add new admin/internal endpoints | Additive |
| BE connector / service files | Add `safety_pack_local` and related scan logic | Additive |
| BE parser / ingest service files | Parse normalized GitHub Actions summary v1 | Additive |
| BE repository / mapper / persistence files | Persist approved `tbl_` fact tables with upsert dedupe keys | Additive |
| BE migration files | Create additive schema changes | Additive |
| BE config/security files | Internal CI push auth validation | Additive |
| `.github/workflows/*` | Post normalized summary v1 to backend | Modify if workflow exists |
| Ticket docs under `documents/docs/changes/SAFETY-PACK-EXISTENCE` | Remove frontend/browser E2E scope from documentation | Documentation update |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| Existing connector run display | Safety Pack scan may reuse it | Medium |
| Existing project/repository mapping | Evidence records may reference it | Medium |
| Existing error handling / trace id display | New ingest errors must follow current pattern | Low |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| GitHub Actions workflow | Internal BE ingest API | Pushes normalized security summary v1 |
| Internal BE ingest API | Security Scan ingest service | Validates and stores CI evidence |
| Safety Pack service | Safety Pack scanner | Reads repository `.claude` content |
| Services | `tbl_fact_safety_pack_status`, `tbl_fact_security_scan` | Persisted evidence summaries |

## 5. Frontend Impact

No frontend runtime code change is in scope for this ticket.

## 6. BE Impact

- New scanner/parser logic for filesystem Safety Pack and GitHub tree `.claude` resolution.
- New normalized summary v1 parser for GitHub Actions push.
- New internal endpoint auth validation.
- New endpoints for Safety Pack and Security Scan.
- New DB persistence logic using only `tbl_` tables.
- New idempotent upsert logic for repeated GitHub Actions workflow retries and duplicate webhook deliveries.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `POST /api/v1/internal/security-evidence/github-actions` | New normalized summary v1 payload | Returns ingest result / status | No |
| `GET /api/v1/admin/safety-packs` | New evidence query params if needed | Returns Safety Pack list/status | No |
| `GET /api/v1/admin/security-scans` | New evidence query params if needed | Returns CI security summary | No |

## 8. DTO / Schema / Validation Impact

- SafetyPackStatus DTO/model.
- SecurityScanSummary DTO/model.
- GitHubActionsNormalizedSecuritySummaryV1 request DTO.

Validation:

- repository key / commit sha / workflow run id required for CI push
- scan type must be `SECRET`, `SAST`, or `SCA`
- scan status must be a valid enum
- counts must be zero or positive
- no prohibited raw sensitive fields allowed

## 9. DB / Migration Impact

The ticket requires additive schema work using only approved `tbl_` tables and migration conventions. Required tables: `tbl_fact_safety_pack_status`, `tbl_fact_security_scan`. Referenced tables: `tbl_dim_project`, `tbl_dim_repository`, `tbl_dim_ticket`, `tbl_connector_run`, `tbl_fact_pull_request`, `tbl_fact_ci_run`, `tbl_dim_role`.

Deduplication keys now matter in the persistence layer:

- `tbl_fact_safety_pack_status` uses `(repository_id, commit_sha)` as the logical upsert key.
- `tbl_fact_security_scan` uses `(repository_id, commit_sha, scanner_type)` as the logical upsert key.

## 10. Batch / Job / Event Impact

- `safety_pack_local` scan acts like connector/job.
- GitHub Actions workflow pushes evidence to BE.
- No separate event bus is required in MVP unless existing source already mandates it.

## 11. Test Impact

- BE Unit Test: Safety Pack path resolution, settings parser, status calculation, normalized summary validation, secret / SAST / SCA status policy, duplicate-safe persistence keys.
- BE Integration Test: internal push endpoint, admin read APIs, DB persistence into `tbl_` tables, access checks, duplicate retry handling.
- Black-box tests: authenticated API access, parse error handling, normalized policy mapping, no raw-sensitive leakage, idempotent ingest retry behavior.

## 12. Operation / Monitoring Impact

- Need monitoring for failed internal GitHub Actions pushes.
- Need safe logs for ingestion success/failure.
- Need idempotent handling for repeated CI retries.
- Need an operational procedure when GitHub Actions evidence is unavailable.

## 13. Rollout / Rollback Impact

1. Apply additive DB migrations.
2. Deploy backend internal evidence APIs.
3. Configure GitHub Actions secrets/auth and normalized summary push.
4. Run Safety Pack scan and CI evidence flow for a controlled repo/PR first.

Rollback:

- Disable the ingest endpoint and read APIs.
- Revert the additive backend migration if needed.

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| Frontend runtime behavior | Unaffected | No frontend source changes are in this ticket scope. |
| DB schema outside approved `tbl_` tables | Unaffected | Ticket rules forbid non-`tbl_` tables. |
| LOGIN behavior | Unaffected | No login/auth feature change requested. |
| Security Exception management | Unaffected | Explicitly out of scope. |

## 15. Required Options

- Decide whether workflow/job correlation rules for retries need to be pinned now.
- Decide whether internal ingest auth/signature details are final.
- Decide whether detailed security findings are needed in MVP.

## 16. Human Decision Required

- Confirm whether documentation-only normalization is sufficient for this round.
- Confirm whether runtime backend tests should be executed before sign-off.

## 17. Risk Summary

- Main risk is stale or inconsistent documentation.
- Secondary risk is the open workflow/auth contract.
- Low risk that future implementers misread the `tbl_`-only persistence boundary if these docs are not treated as the source of truth.
