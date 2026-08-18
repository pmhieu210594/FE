# Spec Pack

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-29  
**Author**: nk_trung      
**Update date**: 2026-06-29  

## 1. Context / Purpose

The purpose of this ticket is to define the backend-only MVP for two related KPIs:

1. **First CI Pass** — whether the first CI run associated with a PR passes.
2. **Exception KPI** — whether a ticket/PR contains explicit exception records captured in `report.md` or `self-review.md`.

This feature is metadata-first. It does not collect raw CI logs, raw chat, raw prompt, full source text, or secrets. The feature reuses the existing V4 schema and makes the parse source explicit by requiring a dedicated exception-record section in the report/self-review templates.

## 2. Scope

### 2.1. Within range

- Parse CI run metadata into the existing CI fact tables.
- Use `tbl_fact_ci_run` as the run-level KPI source.
- Use `tbl_fact_ci_job` as the diagnostic/job-level detail source.
- Parse explicit exception records from the updated `report.md` / `self-review.md` templates.
- Persist exception rows into `tbl_fact_exception`.
- Compute First CI Pass from the first CI run associated with the PR.
- Compute Exception KPI from explicit exception records, not from generic risk text.
- Record parse warnings and data-quality issues when exception sections are missing or malformed.
- Expose read-side backend endpoints / read models for future consumers.
- Keep the phase BE-only; no FE screens are part of this scope.

### 2.2. Out of range

- FE dashboard implementation.
- Raw CI log storage.
- Raw chat / prompt storage.
- Full source text storage in analytics tables.
- Cross-project benchmarking.
- New collector providers beyond the current CI metadata path.
- New tables or migrations if the existing V4 schema remains sufficient.
- Automatic generation of exception records from free text when no explicit record exists.

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| First CI Run | The earliest CI run associated with a PR within the repository scope. | Used to evaluate First CI Pass. |
| First CI Pass | The first CI run has normalized status `SUCCESS`. | Primary KPI signal. |
| CI Run | One CI workflow execution stored in `tbl_fact_ci_run`. | Run-level record. |
| CI Job | One job inside a CI run stored in `tbl_fact_ci_job`. | Diagnostic detail only. |
| Exception Record | A parseable row explicitly recorded in `report.md` or `self-review.md`. | Source of truth for Exception KPI. |
| Follow-up Status | Current follow-up state of an exception. | Typically `OPEN`, `RESOLVED`, `EXPIRED`. |
| Approval Role | Role that approved the exception. | Stored as role reference when resolvable. |
| Supporting Evidence | Metadata that helps explain a KPI but is not the KPI source itself. | Example: job-level CI rows, dashboard detail links. |
| Idempotency | Re-running the parser/collector must not create duplicate KPI rows. | Required for safe reruns. |

## 4. As-Is

- CI metadata already exists in the backend and can be read from the database.
- The PM dashboard already shows `ci_failed_count` and open `exception_items`.
- The schema already contains `tbl_fact_ci_run`, `tbl_fact_ci_job`, and `tbl_fact_exception`.
- The report/self-review templates previously relied on generic risk/pending sections and did not provide a canonical exception-record structure.
- There is no canonical spec-pack for this KPI yet, so first-pass logic and exception parsing are still easy to interpret inconsistently.

## 5. To-Be

- The backend stores CI run/job metadata in the existing tables.
- The backend stores explicit exception records in `tbl_fact_exception`.
- The templates provide a dedicated exception section so the parser can extract records deterministically.
- The First CI Pass KPI is computed at PR grain from the earliest CI run for that PR.
- The Exception KPI is computed from distinct PRs/tickets that contain at least one explicit exception record.
- The read model exposes the KPI values without requiring FE changes in this phase.

## 6. Detailed specification

### 6.1. Business Rules

| rule | detail |
|---|---|
| BR-FCI-1 | First CI Pass is computed from the earliest CI run linked to a PR within the repository scope. |
| BR-FCI-2 | If the earliest CI run has normalized status `SUCCESS`, the PR counts as a First CI Pass. |
| BR-FCI-3 | CI job rows are diagnostic only and must not override the run-level KPI. |
| BR-FCI-4 | Exception KPI must be derived from explicit exception records only. |
| BR-FCI-5 | Generic `Accepted Risk`, `Open Issues`, or other free-text sections must not be treated as exception records unless they are explicitly mapped by the parser through the dedicated exception section. |
| BR-FCI-6 | A missing exception section produces a warning/data-quality issue; it does not create synthetic exceptions. |
| BR-FCI-7 | An exception record may link to ticket, repository, PR, and CI run when resolvable. |
| BR-FCI-8 | Approved role should be persisted via role reference when the role can be resolved; otherwise the row remains valid with a warning. |
| BR-FCI-9 | Re-running the collector/parser must be idempotent. |
| BR-FCI-10 | Raw logs, raw chat, raw prompt, and secret values must not be stored. |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| `ticket_id` | UUID | Yes | Must resolve to a ticket row. | KPI scope. |
| `repository_id` | UUID | Yes | Must resolve to a repository row. | Repository scope. |
| `pull_request_id` | UUID | No | Nullable when PR cannot be resolved. | Primary grain for First CI Pass. |
| `ci_run` metadata | structured metadata | Yes | Must have run identity and status. | Source for First CI Pass. |
| `ci_job` metadata | structured metadata | No | Valid job-level fields if available. | Diagnostic only. |
| `report.md` | markdown | No | Must parse explicitly recorded exception rows if present. | One source of exception input. |
| `self-review.md` | markdown | No | Must parse explicitly recorded exception rows if present. | One source of exception input. |
| `source_path` | string | Yes | Must point to the expected ticket artifact path when parsing markdown. | Provenance. |
| `parser_version` | string | No | Semantic version or parser id. | Traceability. |
| `trace_id` | string | No | Per system standard. | Logging/audit. |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| `ci_run_id` | UUID | UUID | Existing run-level fact row. |
| `ci_job_id` | UUID | UUID | Existing job-level fact row. |
| `exception_id` | UUID | UUID | Existing exception fact row. |
| `first_ci_pass_flag` | boolean | true/false | KPI signal. |
| `first_ci_run_status` | string | enum | Normalized status of the earliest CI run. |
| `exception_record_count` | integer | number | Count of explicit exception records. |
| `exception_present_flag` | boolean | true/false | Whether at least one explicit exception exists in scope. |
| `follow_up_status` | string | enum/text | OPEN / RESOLVED / EXPIRED or equivalent. |
| `warnings` | array | list | Parse/data-quality warnings. |
| `read_model_ref` | string | path or endpoint name | Future consumer reference. |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| No CI run exists for the PR | Do not compute First CI Pass for that PR; mark as unavailable in read model. | `CI_RUN_NOT_FOUND` | Warning, not fatal. |
| CI run exists but status is unknown | Keep the row and mark KPI as unknown/partial. | `CI_STATUS_UNKNOWN` | Do not fabricate pass/fail. |
| Multiple CI runs exist for a PR | Use the earliest run by started time / collected order. | `CI_RUN_AMBIGUOUS` warning | Deterministic ordering required. |
| Exception section missing | Record warning / data-quality issue and do not create synthetic exception rows. | `EXCEPTION_SECTION_MISSING` | Critical for parser trust. |
| Exception row missing required fields | Store what is valid, mark warning, and keep a data-quality issue. | `EXCEPTION_ROW_INCOMPLETE` | Do not silently drop. |
| Approved role cannot be resolved | Store row with null role reference and warning. | `APPROVED_ROLE_UNRESOLVED` | Non-blocking. |
| Duplicate exception row detected | Upsert or de-duplicate by source identity. | `EXCEPTION_DUPLICATE` | Idempotent rerun behavior. |
| Invalid time ordering | Reject the malformed row or mark as invalid. | `INVALID_TIME_RANGE` | Preserve DB integrity. |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| CI runs per PR | 0 | Many | No CI run found | KPI unavailable or zero-coverage state. |
| Jobs per CI run | 1 | Many | One workflow run with many jobs | Store one run row and many job rows. |
| Exception records per artifact | 0 | Many | Multiple exception records in one report/self-review file | Store all explicit records. |
| Approved role reference | null | Valid role UUID | Role text cannot be resolved | Keep null and warn. |
| Follow-up status | 0 states | Finite enum | Missing follow-up status | Default/normalize to OPEN with warning if source explicitly implies an open issue. |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Read model must be usable for dashboard/API queries. | Internal MVP scale. | Integration test / smoke test. | BE-only. |
| Security | No raw logs, raw chat, raw prompt, secrets, or full source text. | 0 forbidden persistence. | Code review / security checklist. | Metadata only. |
| Availability / Reliability | Collector/parser reruns are idempotent. | No duplicate KPI rows on rerun. | Regression test. | Critical for batch reruns. |
| Maintainability | Source extraction rules must be centralized and versioned. | Parser version + spec-pack. | Review / regression. | Avoid scattered logic. |
| Observability / Logging | Warnings, parse issues, and trace IDs must be available. | Always available. | Log review. | Data Ops support. |
| Compatibility | Reuse existing schema and controller/service boundaries. | No new table required for MVP. | DB review / source review. | Reuse-first. |

## 7. Acceptance Criteria

| ACID | description | testable? | notes |
|---|---|---|---|
| AC-FCI-1 | Given CI metadata for a PR, the system can determine the earliest CI run and compute First CI Pass at PR grain. | Yes | Core KPI. |
| AC-FCI-2 | Given the earliest CI run is successful, the system marks the PR as First CI Pass. | Yes | Success path. |
| AC-FCI-3 | Given the earliest CI run fails, the system marks the PR as not First CI Pass. | Yes | Failure path. |
| AC-FCI-4 | Given the updated templates contain a dedicated exception section, the parser can extract explicit exception records from `report.md` and `self-review.md`. | Yes | Canonical input. |
| AC-FCI-5 | Given an explicit exception record is present, the system persists it into `tbl_fact_exception`. | Yes | DB persistence. |
| AC-FCI-6 | Given no explicit exception record exists, the system does not invent one and records a warning/data-quality issue. | Yes | Trust boundary. |
| AC-FCI-7 | Given a ticket or PR has at least one explicit exception record, the system can compute Exception KPI for that scope. | Yes | KPI output. |
| AC-FCI-8 | Given an exception row has a resolvable approval role, the row persists the role reference. | Yes | Role linkage. |
| AC-FCI-9 | Given a parser rerun on the same source hash, the system does not create duplicate CI or exception rows. | Yes | Idempotency. |
| AC-FCI-10 | Given there are warnings or parse errors, the system records them for Data Ops instead of failing silently. | Yes | Operability. |
| AC-FCI-11 | Given the feature is BE-only, no FE screen implementation is required in this phase. | Yes | Scope guard. |

## 8. Examples

### 8.1. Normal Case

A PR has one earliest CI run with status `SUCCESS`. The report contains one explicit exception record with a clear reason, approval role, expiry, and follow-up status.

Expected result:
- First CI Pass is `true`.
- The exception row is stored once.
- KPI read model counts one PR/ticket with exception.

### 8.2. Error Case

A ticket has `Accepted Risk` text, but no dedicated exception section and no explicit exception row.

Expected result:
- The parser records a warning.
- No synthetic exception row is created.
- Exception KPI does not treat the risk text as an exception record.

### 8.3. Boundary Case

A PR has one workflow run and five jobs; three jobs pass and two jobs fail, but the workflow run itself is marked failed.

Expected result:
- The run-level KPI follows the earliest run status.
- Job rows are retained for diagnostics only.
- First CI Pass is `false`.

## 9. Source Availability Summary

| source | available? | confidence | impact |
|---|---|---|---|
| `tbl_fact_ci_run` | Yes | High | Sufficient for First CI Pass run-level source. |
| `tbl_fact_ci_job` | Yes | High | Diagnostic job-level detail. |
| `tbl_fact_exception` | Yes | High | Sufficient for exception storage. |
| `CiRunMetadataService` / `CiRunJdbcAdapter` | Yes | High | Reusable CI metadata read path. |
| `PmDashboardJdbcAdapter` exception read path | Yes | High | Existing read model already consumes exception rows. |
| `report.md` / `self-review.md` template structure | Yes, updated | High | Now has an explicit exception-record section. |
| Dedicated exception parser service | Not yet canonicalized | Medium | Needs spec-pack lock-in before implementation. |

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: BE only / DB / Batch
- Primary risk: Source / DB / Contract / Test
- Review mode: Standard
- Required options: Source Analysis / DB reuse
```

## 11. FE/BE Contract Impact

- No FE changes are required in this phase.
- The backend may expose or extend read-only endpoints for future consumers, but the phase-1 ticket is not a UI ticket.
- Existing CI metadata and PM dashboard read paths can be reused for backend verification.
- If a dedicated KPI summary endpoint is added later, it should remain read-only and compatible with the current JSON conventions.

## 12. DB/Migration Impact

- **No new table is required for the MVP.**
- Reuse existing `tbl_fact_ci_run` for run-level First CI Pass data.
- Reuse existing `tbl_fact_ci_job` for job-level diagnostics.
- Reuse existing `tbl_fact_exception` for exception records.
- Reuse existing `tbl_connector_run` for collector execution status.
- Persist `source_section` provenance on each exception row so the backend can trace whether the exception came from `report.md` or `self-review.md` and from which section within the template.
- If the current table definition does not yet have a dedicated provenance column, add the minimal nullable migration needed to store it without changing the MVP grain.

## 13. Security/Privacy Impact

- Do not store raw CI logs.
- Do not store raw prompt or raw chat.
- Do not store full source text in analytics tables.
- Do not store secrets, tokens, private keys, or command output.
- Store only metadata, normalized KPI rows, and traceable links to the canonical repository documents.
- Exception approval data should be stored by role reference only when resolvable; avoid personal data beyond the minimum needed for governance.

## 14. Operation/Maintenance Impact

- The parser must be rerunnable without creating duplicate KPI rows.
- Warnings and data-quality issues must be visible to Data Ops.
- The exception section in the templates becomes part of the operating contract; changing that section requires parser-version awareness.
- The KPI logic should remain explainable to PM, QA, and Data Ops without opening raw logs.
- Feature flags or phased rollout are not required in Phase 1, but the logic should be isolated enough to allow them later.

## 15. Test Strategy Summary

- Unit test the CI-run selection logic for earliest-run / first-pass determination.
- Unit test the exception parser against the dedicated exception sections in `report.md` and `self-review.md`.
- Unit test idempotent upsert behavior for CI and exception rows.
- Integration test the parser-to-DB flow using the existing schema.
- Integration test the read model for first-pass and exception counts.
- Security test to verify no raw logs, raw prompt, or secrets are persisted.
- Regression test template updates to ensure exception section parsing remains stable.

## 16. Human Decision Required
| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| H-FCI-1 | KPI denominator grain is PR only; if PR metadata is missing, the record is excluded from the KPI and moved to data-quality handling. | This keeps the KPI deterministic and avoids ticket-level fallback distortion. | PM / Backend | Resolved |
| H-FCI-2 | Add a dedicated KPI summary endpoint now. | This simplifies future consumers and avoids duplicating aggregation logic. | PM / Backend | Resolved |
| H-FCI-3 | Store source-section provenance in the DB. | This improves auditability and parser traceability. | Backend / DB owner | Resolved |

## 17. Assumptions and Inference Log
| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-FCI-1 | The existing V4 schema is sufficient for MVP. | Current DB schema already includes the necessary fact tables and columns. | Low | No |
| A-FCI-2 | First CI Pass is computed from the earliest CI run associated with a PR. | User requirement and current CI metadata model. | Low | No |
| A-FCI-3 | Exception KPI is based on explicit exception records in the updated templates. | User clarification and template update. | Low | No |
| A-FCI-4 | CI job rows are not the KPI source; they are diagnostic detail only. | Existing run/job table separation. | Low | No |
| A-FCI-5 | No FE work is required in Phase 1. | User clarification. | Low | No |

## 18. Open Issues
There are no open issues remaining for Phase 1 after the current decisions were confirmed.