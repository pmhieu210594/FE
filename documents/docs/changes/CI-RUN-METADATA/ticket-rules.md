# Ticket Rules:

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17  
**Author**: ChatGPT
**Update date**: 2026-06-17  

## Must Follow

- Do not add specifications not included in the spec-pack.
- Ambiguous points must be returned as Open Issues.
- Before implementation, read the target source and existing tests.
- Follow existing patterns.
- Do not reuse obvious errors, vulnerabilities, or existing SonarLint violations.
- Check for nulls, empty strings, invalid status, invalid URL, and invalid timestamp order.
- Business code values should be in enum/constant/master format instead of magic numbers.
- Do not export secrets/PII to logs.
- Use GitHub Actions as the source of truth for CI metadata.
- Store only normalized metadata required by this ticket.
- Persist data only into approved `tbl_` tables.
- Use `tbl_fact_ci_run` as the main persistence table.
- Use `tbl_connector_run` for connector execution tracking.
- Store one row per GitHub Actions job.
- Store GitHub workflow run ID in `external_run_id`.
- Store GitHub job ID in `external_job_id`.
- Prefer job URL for `ci_url`; fallback to workflow run URL only when job URL is unavailable.
- Ensure collector persistence is idempotent.
- Record received/inserted/updated/skipped/error counters.

## Must Not Do

- Do not store raw CI logs.
- Do not store full CI artifacts.
- Do not store raw command output.
- Do not store tokens, secrets, private keys, passwords, or raw sensitive values.
- Do not store raw GitHub API response as evidence.
- Do not use `_ticket-template` as runtime CI evidence source.
- Do not implement Secret/SAST/SCA summary in this ticket.
- Do not implement test result parsing in this ticket.
- Do not implement coverage parsing in this ticket.
- Do not implement failure category classification in this ticket.
- Do not implement flaky test detection in this ticket.
- Do not implement rerun/manual refresh button in this ticket.
- Do not create non-`tbl_` tables.
- Do not create duplicate rows for the same provider/repository/workflow run/job.
- Do not call a source method/API that has not been confirmed to exist.

## Stop / Ask Conditions

| condition | action |
|---|---|
| GitHub Actions authentication method is unclear | Stop and ask. |
| Existing BE package/migration convention is unclear | Stop and ask before adding files. |
| Repository cannot be resolved | Do not insert orphan CI job row; log connector error. |
| Time order is invalid: `completed_at < started_at` | Reject/skip row and log validation error. |
| Job ID is missing | Stop for this row; job-level grain requires `external_job_id`. |
| No job URL and no workflow run URL | Stop for this row; `ci_url` is required. |
| Status mapping is unknown | Store `UNKNOWN` only if approved by mapper rule; otherwise ask. |
| Implementation requires raw log parsing | Stop; out of scope. |
| Implementation requires storing token/secret | Stop; security violation. |

## Review Focus

- Confirm `1 row = 1 GitHub Actions job`.
- Confirm `external_job_id` is required.
- Confirm unique key prevents duplicates.
- Confirm repository FK is mandatory.
- Confirm PR/ticket FK is nullable and best-effort.
- Confirm status mapping is deterministic.
- Confirm URL preference rule is implemented.
- Confirm connector run counters are accurate.
- Confirm no raw CI log, raw command output, token, secret, private key, or full artifact is persisted.
- Confirm no out-of-scope security scan/test result/failure classification code is included.

## Test Focus

- Workflow run with multiple jobs creates multiple rows.
- Same job collected twice updates existing row and does not insert duplicate.
- Running job allows `completed_at = null`.
- Invalid time order is rejected/skipped and logged.
- Job URL is stored when available.
- Workflow run URL fallback is used when job URL is missing.
- Repository unresolved case does not create orphan data.
- GitHub API failure is visible in `tbl_connector_run`.
- Forbidden data is not persisted.