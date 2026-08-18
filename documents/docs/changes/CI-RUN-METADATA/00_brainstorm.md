# 00_brainstorm

**Ticket ID**: CI-RUN-METADATA  
**Create date**: 2026-06-17  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## Purpose

Define the Phase 1 understanding for the CI Run Job Metadata Collector MVP.

The goal is to collect the minimum GitHub Actions job-level CI metadata needed for SDD evidence traceability and dashboard display.

This artifact is brainstorming only. The final specification source of truth is `spec-pack.md`.

## Known Information

- The feature target is CI run metadata collection.
- Required metadata is limited to:
  - workflow run ID
  - job ID
  - status
  - workflow name
  - job name
  - started time
  - completed time
  - URL
- The data grain is decided as `1 row = 1 GitHub Actions job`.
- `external_run_id` represents the GitHub Actions workflow run ID.
- `external_job_id` represents the GitHub Actions job ID.
- `ci_url` should store job URL if available, otherwise workflow run URL.
- CI source of truth is GitHub Actions.
- `_ticket-template` is only a documentation template and must not be used as runtime CI evidence.
- Raw CI logs, full artifacts, secret values, tokens, private keys, and raw command output must not be persisted.

## Undetermined Points

| ID | point | impact | proposed handling |
|---|---|---|---|
| U-CI-RUN-METADATA-1 | GitHub Actions API authentication method is not confirmed. | Collector cannot be implemented safely. | Ask human before implementation. |
| U-CI-RUN-METADATA-2 | Existing DB schema compatibility is not confirmed. | DDL/entity may conflict with existing schema. | Validate schema before migration. |
| U-CI-RUN-METADATA-3 | Ticket ID matching rule is not confirmed. | Ticket linkage may be incomplete. | Define regex/rule before implementation. |
| U-CI-RUN-METADATA-4 | Dashboard display rule is not confirmed. | UI may show too much/too little data. | Decide all jobs vs failed/latest jobs. |

## Expected Risks

| risk | description | mitigation |
|---|---|---|
| Duplicate CI rows | Same job may be collected multiple times. | Use unique key on provider + repository + external run ID + external job ID. |
| Orphan records | Repository/PR/ticket cannot be resolved. | Repository is mandatory; PR/ticket can be nullable. Log unresolved linkage. |
| Status mismatch | GitHub status/conclusion may not map cleanly. | Normalize to limited status set with `UNKNOWN` fallback. |
| Sensitive data leakage | Raw logs may contain secrets. | Do not collect or persist raw logs/artifacts/output. |
| Dashboard confusion | Workflow run and job distinction may be unclear. | Display both workflow name and job name. |

## What AI Needs to Investigate

- Existing backend package structure for connector/service/repository/entity patterns.
- Existing DB migration tool: Flyway, Liquibase, or custom SQL.
- Existing `tbl_fact_ci_run` table, if already present.
- Existing `tbl_connector_run` structure and status values.
- Existing dashboard API shape for CI status.

## What Humans Need to Ask

| ID | question | target person/team |
|---|---|---|
| Q-CI-RUN-METADATA-1 | Which GitHub authentication method should the collector use? | Admin / Backend lead |
| Q-CI-RUN-METADATA-2 | Should the collector be batch, webhook, or internal API push? | Architect / Backend lead |
| Q-CI-RUN-METADATA-3 | What is the official ticket ID pattern? | PM / Project owner |
| Q-CI-RUN-METADATA-4 | Should PM dashboard show all jobs or only latest failed jobs? | PM / UX |
| Q-CI-RUN-METADATA-5 | Are existing table names and primary keys exactly as assumed? | DB owner |

## Conditions Under Which Implementation Is Not Permitted

Implementation must not start if any of the following is true:

- GitHub Actions authentication method is not approved.
- Existing DB schema and migration strategy are not confirmed.
- The implementation requires storing raw CI logs or full artifacts.
- The implementation stores secret values, tokens, private keys, or raw sensitive command output.
- Repository linkage cannot be guaranteed.
- Idempotency rule is not implemented.
- The data grain is changed from job-level without human approval.
