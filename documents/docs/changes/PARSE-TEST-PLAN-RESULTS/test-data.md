# Test Data

**Ticket ID**: PARSE-TEST-PLAN-RESULTS  
**Create date**: 2026-06-19  
**Author**: OpenAI  
**Update date**: 2026-06-22  

## Data Policy
- Use dummy markdown files only.
- Do not use production secrets or real customer data.
- Keep samples aligned with the template headings.

## Master Data

| name | value | purpose |
|---|---|---|
| project_id | dummy-project | DB linkage |
| repository_id | dummy-repo | DB linkage |
| ticket_id | PARSE-TEST-PLAN-RESULTS | Primary lookup key |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| parser-user | developer | read/write parser artifacts | General functional testing |
| reviewer-user | qa | read-only | Review the paired view |

## Normal Data

| ID | data | purpose |
|---|---|---|
| N-01 | valid `test-plan.md` sample | Normal parse |
| N-02 | valid `test-results.md` sample | Normal parse |

## Error Data

| ID | data | expected error |
|---|---|---|
| E-01 | missing required section | `PARTIAL` / `PARSE_ERROR` |
| E-02 | placeholder-only section | parse warning |
| E-03 | invalid heading structure | parse warning / error |
| E-04 | AC missing from AC Matrix | AC_NOT_COVERED |
| E-05 | Unknown AC reference | UNKNOWN_AC_REFERENCE |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| B-01 | empty section | empty text | Section marked missing |
| B-02 | long list block | near template max size | Parse succeeds or warns safely |
| B-03 | repeated parse | same source hash | no duplicate snapshot |
| B-04 | pair view | only one artifact exists | existing artifact still visible |

## Existing Data Compatibility
- Existing parsed snapshots for other ticket artifacts remain unchanged.
- The pair-view must not break when only one artifact exists.
- Existing impl-plan parser data remains unchanged.
- Existing artifact snapshots remain queryable.
- Pair View works even when one artifact is missing.

## Data Setup Procedure
1. Create dummy ticket and repository linkage.
2. Write sample `test-plan.md` / `test-results.md`.
3. Run parser and confirm snapshot persistence.

## Data Cleanup Procedure
1. Delete test snapshots if the test DB is disposable.
2. Remove dummy files after verification.
3. Keep no sensitive artifacts.

## Sensitive Data Handling
- Do not use original production data.
- Do not save PII/secrets to artifacts.
