# Test Data

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC  
**Create date**: 2026-06-23  
**Author**: OpenAI  
**Update date**: 2026-06-23  

## Data Policy

- Use only synthetic or already-approved internal test data.
- Do not use production markdown, payloads, or secrets.
- Keep traceability fixtures minimal, deterministic, and reusable across cases.
- Use the same seeded ticket family for normal, error, boundary, permission, and observability checks whenever possible.

## Master Data

| name | value | purpose |
|---|---|---|
| Link source type | `TICKET` / `ARTIFACT` / `PULL_REQUEST` / `COMMIT` / `CI` / `REPORT` | Traceability evidence categories |
| Confidence | `HIGH` / `MEDIUM` / `LOW` | Link confidence display and storage |
| Severity | `ERROR` / `WARNING` | Broken-link display |
| Timeline ordering rule | `event_time asc, then stable seeded order` | Deterministic tie-break behavior for the black-box timeline test |
| Completeness target | `0-100 percent` | Summary output expected by the UI |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| viewer-readonly | `VIEWER` | read-only | Verify the screen does not expose edit, delete, or repair actions. |
| admin-reader | `ADMIN` | read-only for this feature | Confirm the view is still read-only even for a higher-privilege user. |
| anonymous | none | unauthenticated | Verify expired-session or no-session access behavior. |

## Normal Data

| ID | data | purpose |
|---|---|---|
| N-001 | `T-TRACE-FULL-001`: ticket with artifact, one PR, one or more commits, CI, report, and timeline events | Happy-path traceability view |
| N-002 | `T-TRACE-CONFIDENCE-001`: ticket with confidence values HIGH, MEDIUM, LOW on different links | Confidence rendering check |
| N-003 | `T-TRACE-TIMELINE-001`: ticket with multiple events, including two events with the same timestamp | Timeline order check |
| N-004 | `T-TRACE-COMPAT-001`: seed rows stored only in approved `tbl_` tables | Existing data compatibility check |

## Error Data

| ID | data | expected error |
|---|---|---|
| E-001 | `T-TRACE-MISSING-PR-001`: artifact exists, PR missing | Broken PR link visible |
| E-002 | `T-TRACE-MISSING-CI-001`: PR exists, CI missing | Broken CI link visible |
| E-003 | `T-TRACE-MISSING-REPORT-001`: PR exists, report missing | Broken report link visible |
| E-004 | Empty ticket ID | Validation error or rejected request |
| E-005 | Non-existing ticket ID `T-TRACE-NOT-FOUND-999` | Not found result or empty state, no crash |
| E-006 | Malformed ticket ID `abc` | Validation error or rejected request |
| E-007 | Anonymous or expired session | Access rejected or redirected cleanly |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| B-001 | Completeness upper boundary | Full fixture with all required links | Completeness displays as 100 percent or full-complete state |
| B-002 | Completeness lower boundary | Partial fixture with one required link removed | Completeness is lower than the full case |
| B-003 | Timeline tie boundary | Two events with identical timestamps | Stable deterministic order |
| B-004 | Empty evidence boundary | Ticket with no PR and no CI | Broken links visible, no crash |

## Existing Data Compatibility

- Existing `tbl_fact_traceability_link` rows created by the collector should be readable by the traceability view.
- Existing `tbl_fact_artifact_snapshot`, `tbl_fact_pull_request`, `tbl_fact_ci_run`, `tbl_fact_evidence_event`, and `tbl_dim_ticket` rows should be sufficient for the black-box scenario set.
- No production-only fixture shape should be required for the traceability screen to render.

## Data Setup Procedure

- Create or reuse a small synthetic ticket family: full, partial, missing-PR, missing-CI, missing-report, timeline-tie, and confidence fixtures.
- Seed only the minimal artifact, PR, CI, report, commit, and evidence-event rows needed for each case.
- Keep identifiers stable so the same test data can be replayed across runs.

## Data Cleanup Procedure

- Remove only the synthetic rows created for the traceability test family.
- Do not touch shared seed data or other ticket fixtures.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII or secrets to artifacts.
- Do not store raw payloads or log dumps in the test data file.
