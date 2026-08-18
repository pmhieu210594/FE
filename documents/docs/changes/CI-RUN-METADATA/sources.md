# Sources

**Ticket ID**: CI-RUN-METADATA  
**Create date**: 2026-06-17  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| User ticket prompt | Conversation requirement for CI run metadata | Available | Defines minimum fields: CI run ID, status, workflow/job, started/completed time, URL. |
| User decision | Conversation decision | Available | Data grain is fixed as `1 row = 1 GitHub Actions job`. |
| User clarification | Conversation decision | Available | `ci_url` should be available from GitHub Actions job URL, with workflow run URL as fallback. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Safety / Security Evidence MVP requirement template reference | `/mnt/data/requirement.md` | Available | High | Used for documentation style, persistence rules, and `tbl_` table naming convention. |
| Safety / Security Evidence MVP database design template reference | `/mnt/data/database_design.md` | Available | High | Used for database design style and approved table naming convention. |
| SDD Evidence Data Collection Analysis Requirements | `/mnt/data/VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Available | High | Provides MVP scope: CI metadata, traceability, dashboard, metadata-first, no raw logs/secrets. |
| Ticket template | `EDCAP_FE/documents/docs/standards/templates/_ticket-template/spec-pack.md` | Available | High | Used as the base structure for `spec-pack.md`. |
| Sources template | `EDCAP_FE/documents/docs/standards/templates/_ticket-template/sources.md` | Available | High | Used as the base structure for this file. |
| Brainstorm template | `EDCAP_FE/documents/docs/standards/templates/_ticket-template/00_brainstorm.md` | Available | High | Used as the base structure for `00_brainstorm.md`. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| Backend source | Not inspected in this phase | Not reviewed | Phase 1 only defines specification; implementation source inspection is deferred until Phase 3 if needed. |
| Existing CI collector | Not confirmed | Unknown | Need confirmation whether a previous collector or GitHub client already exists. |
| Existing DB schema | Not confirmed | Unknown | Need confirmation of exact columns currently present in `tbl_fact_ci_run` and `tbl_connector_run`. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Unit tests | Not inspected | Unknown | Need to add parser/mapper/unit tests in later phases. |
| Integration tests | Not inspected | Unknown | Need to add collector -> DB persistence test in later phases. |
| E2E/dashboard tests | Not inspected | Unknown | Need to validate dashboard and ticket evidence detail in later phases. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| GitHub Actions API | External API | Metadata only | Used as source of truth for workflow run/job metadata. Do not persist raw logs or artifacts. |
| GitHub Actions workflow/job URL | External URL | Link only | Store only URL for traceability back to source of truth. |

## Excluded Sources

| source/path | reason |
|---|---|
| `_ticket-template` as CI evidence source | It is only a documentation template, not runtime CI evidence. |
| Raw GitHub Actions logs | Out of scope and may contain secrets or sensitive output. |
| Full CI artifacts | Out of scope for MVP; metadata-only design. |
| Raw command output | Out of scope and may contain sensitive information. |
| Secret values / tokens / private keys | Forbidden to persist. |

## Source Limitations

- Exact GitHub Actions authentication method is not yet confirmed.
- Exact existing backend schema is not yet confirmed.
- Exact repository and PR linkage implementation is not yet confirmed.
- Exact ticket ID matching rule from branch / PR title / commit message is not yet confirmed.
- GitHub Actions job API availability and permissions need confirmation.

## Assumptions from Sources

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-CI-RUN-METADATA-1 | GitHub Actions is the CI/CD provider for this MVP. | User discussion and existing Safety/Security MVP direction. | Low | Yes |
| A-CI-RUN-METADATA-2 | One workflow run can contain multiple jobs, and each job should be stored as one row. | User decision. | Low | No |
| A-CI-RUN-METADATA-3 | `tbl_fact_ci_run` can be used even though one row represents one job. | Existing approved table set includes `tbl_fact_ci_run`. | Medium | Yes |
| A-CI-RUN-METADATA-4 | Job URL is available from GitHub Actions job metadata; workflow run URL can be used as fallback. | GitHub Actions metadata model. | Low | Yes |

## Human Confirmation Required

| ID | question | owner | blocking? |
|---|---|---|---|
| H-CI-RUN-METADATA-1 | Confirm GitHub Actions authentication method: PAT, GitHub App, repository token, or internal push. | Tech lead / Admin | Yes |
| H-CI-RUN-METADATA-2 | Confirm existing DB table/column names for `tbl_fact_ci_run`, `tbl_connector_run`, `tbl_fact_pull_request`, `tbl_dim_ticket`. | Backend / DB owner | Yes |
| H-CI-RUN-METADATA-3 | Confirm ticket ID matching rule. | PM / Backend | Yes |
| H-CI-RUN-METADATA-4 | Confirm whether dashboard shows all jobs or only latest/failed jobs by default. | PM / UX | No |
