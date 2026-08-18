# Test Data

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-29  
**Author**: nk_trung  
**Update date**: 2026-06-30  

## Data Policy

- Use synthetic CI metadata and synthetic markdown fixtures only.
- Do not use production logs, production markdown, or secrets.
- Keep fixtures small, explicit, and UTF-8 encoded.
- Preserve source order so idempotency and earliest-run selection remain deterministic.
- Do not store raw chat, raw prompt, or full source text in the test artifact output.

## Master Data

| name | value | purpose |
|---|---|---|
| CI run status | `SUCCESS` | First-pass success state |
| CI run status | `FAILED` | First-pass failure state |
| CI run status | `CANCELLED` | Non-success boundary state |
| Exception type | `NO_VERIFY` | Explicit exception record |
| Exception type | `CI_SKIP` | Explicit exception record |
| Exception type | `TEST_SKIP` | Explicit exception record |
| Exception type | `SECURITY_SCAN_DISABLED` | Explicit exception record |
| Exception type | `EMERGENCY_MERGE` | Explicit exception record |
| Exception type | `OTHER` | Fallback classification |
| Follow-up status | `OPEN` | Unresolved exception |
| Follow-up status | `RESOLVED` | Closed exception |
| Follow-up status | `EXPIRED` | Stale exception |
| Approval role | `PM` | Role master value |
| Approval role | `DEV` | Role master value |
| Approval role | `QA` | Role master value |
| Approval role | `ADMIN` | Role master value |
| Parse mode | `DRAFT` | Existing parse mode |
| Parse mode | `OFFICIAL` | Existing parse mode |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `pm_user` | `PM` | Read KPI result | Read-only KPI consumer |
| `admin_user` | `ADMIN` | Read CI metadata and KPI result | Administration / verification |
| `viewer_user` | `VIEWER` | Read-only scope review only | Negative permission / scope test |
| `scanner_user` | `SYSTEM` | Parse and persist artifacts | Operational ingestion path |

## Normal Data

| ID | data | purpose |
|---|---|---|
| N-01 | One PR with a single earliest CI run marked `SUCCESS` | First-pass success case for AC-FCI-2 |
| N-02 | One PR with a single earliest CI run marked `FAILED` | First-pass failure case for AC-FCI-3 |
| N-03 | Markdown artifact with one explicit exception row in the dedicated section | Exception extraction case for AC-FCI-4 |
| N-04 | Markdown artifact with one explicit exception row and approval role `PM` | Role resolution case for AC-FCI-8 |
| N-05 | KPI read scope containing one explicit exception row and one generic risk paragraph | Counts explicit records only for AC-FCI-7 |
| N-06 | Artifact with two explicit exception rows in the same source file | Multi-row persistence case for AC-FCI-5 |

### Normal fixture example: explicit exception row

```markdown
## 9. Exception Record

| exception_type | source_section | reason | approved_by_role | expiry | follow_up | owner | status |
|---|---|---|---|---|---|---|---|
| OTHER | self-review | Test coverage low due to experimental scope | PM | 2026-07-15 | Add tests after freeze | nk_trung | OPEN |
```

## Error Data

| ID | data | expected error |
|---|---|---|
| E-01 | Markdown without the dedicated exception section | `EXCEPTION_SECTION_MISSING` warning for AC-FCI-6 |
| E-02 | Exception row missing `reason` or `status` | `EXCEPTION_ROW_INCOMPLETE` warning for AC-FCI-10 |
| E-03 | Unknown approval role text | `APPROVED_ROLE_UNRESOLVED` warning for AC-FCI-8 |
| E-04 | Duplicate parse of the same source hash | No duplicate row creation for AC-FCI-9 |
| E-05 | Malformed table header in exception section | Parse warning; row not treated as synthetic exception for AC-FCI-4/10 |
| E-06 | Zero CI runs for a PR | KPI unavailable / warning state for AC-FCI-1 |

### Error fixture example: missing section

```markdown
## 9. Risk Notes

Accepted risk only. No explicit exception section is present.
```

### Error fixture example: unresolved role

```markdown
| exception_type | source_section | reason | approved_by_role | expiry | follow_up | owner | status |
|---|---|---|---|---|---|---|---|
| CI_SKIP | report | CI skipped due to maintenance window | DELIVERY_LEAD | 2026-07-10 | Resolve after maintenance | nk_trung | OPEN |
```

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| B-01 | CI runs per PR | 0 | KPI unavailable or warning state |
| B-02 | CI runs per PR | 1 | Single run becomes first-run source of truth |
| B-03 | CI runs per PR | 2 | Earliest run chosen deterministically |
| B-04 | CI run timestamps | equal started_at | Deterministic tiebreaking, no flip-flop |
| B-05 | Exception rows per artifact | 1 | One persisted row |
| B-06 | Exception rows per artifact | many | All explicit rows persisted |
| B-07 | Approval role reference | null | Persist row and warning |
| B-08 | Reason length | near max allowed | Row remains valid if within validation limit |

### Boundary fixture example: tie on earliest CI run

```text
run-001 started_at=2026-06-10T07:00:00Z status=FAILED
run-002 started_at=2026-06-10T07:00:00Z status=SUCCESS
```

Expected: the system still resolves one deterministic first run and does not alternate between re-runs.

## Existing Data Compatibility

- `tbl_fact_ci_run` already exists and should be reused for run-level KPI input.
- `tbl_fact_ci_job` already exists and should remain diagnostic only.
- `tbl_fact_exception` already exists and should store explicit exception records.
- `tbl_dim_role` already exists and should be used for approval-role resolution.
- `tbl_fact_data_quality` or the existing warning path should be reused for parse issues.
- Existing repository / ticket / PR relations should remain the join key source for KPI read paths.

## Data Setup Procedure

1. Create one repository and one ticket scope row.
2. Insert one PR row for the ticket.
3. Insert one or more CI run rows for that PR, including a boundary tie case when needed.
4. Prepare one markdown artifact with the dedicated exception section.
5. Run the parser / KPI path under test.
6. Re-run the same input once to verify idempotency.

## Data Cleanup Procedure

- Remove only synthetic test rows.
- Keep cleanup idempotent.
- Do not touch production-like fixtures or unrelated demo data.
- Reset any warnings/data-quality rows created by the synthetic fixture if the test framework does not isolate them automatically.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII or secrets to artifacts.
- Do not store raw markdown content beyond the fixture files needed for the tests.
- If a fixture must be quoted in a test note, keep it to the minimum snippet needed for reproducibility.