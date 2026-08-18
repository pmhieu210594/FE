# Database Design - QA Dashboard

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: OpenAI
**Update date**: 2026-06-26

---

## 1. Purpose

This document describes the database design for the **QA Dashboard** feature.

The QA Dashboard is a **read-only operational dashboard**.

This document **does not introduce any new dashboard-specific tables**.

Instead, the dashboard aggregates information from existing SDD Evidence Platform tables.

The dashboard provides:

* AC-Test Coverage
* Acceptance Criteria not yet tested
* Black-box Coverage
* Test Results
* Defect Leakage
* Release Readiness

---

## 2. Existing Tables

The QA Dashboard reuses existing tables.

| Table                              | Purpose                           |
| ---------------------------------- | --------------------------------- |
| `tbl_dim_project`                  | Project information               |
| `tbl_dim_repository`               | Repository information            |
| `tbl_dim_ticket`                   | Ticket information                |
| `tbl_fact_artifact_snapshot`       | Artifact existence and metadata   |
| `tbl_fact_artifact_parsed_section` | Parsed markdown sections          |
| `tbl_fact_traceability_link`       | Traceability relationships        |
| `tbl_fact_test_run`                | Test execution summary            |
| `tbl_fact_ci_run`                  | CI execution summary              |
| `tbl_fact_review`                  | Review information                |
| `tbl_fact_finding`                 | Review findings                   |
| `tbl_fact_exception`               | Exceptions                        |
| `tbl_fact_metric_value`            | Calculated metrics (if available) |

No dashboard-specific persistence is required.

---

## 3. Artifact Sources

The dashboard consumes parser outputs from existing artifacts.

| Artifact              | Source Table               |
| --------------------- | -------------------------- |
| spec-pack.md          | tbl_fact_artifact_snapshot |
| test-plan.md          | tbl_fact_artifact_snapshot |
| test-results.md       | tbl_fact_artifact_snapshot |
| blackbox-testcases.md | tbl_fact_artifact_snapshot |
| report.md             | tbl_fact_artifact_snapshot |
| review-checklist.md   | tbl_fact_artifact_snapshot |

Each artifact detail is retrieved from:

```text
tbl_fact_artifact_parsed_section
```

---

## 4. Mapping Between Business/UI Fields and DB

| Business / UI Field | Source                           |
| ------------------- | -------------------------------- |
| Ticket              | tbl_dim_ticket                   |
| Project             | tbl_dim_project                  |
| Repository          | tbl_dim_repository               |
| Phase               | tbl_dim_ticket                   |
| AC Count            | tbl_fact_artifact_parsed_section |
| Covered AC          | tbl_fact_traceability_link       |
| Uncovered AC        | Derived                          |
| AC Coverage         | Derived                          |
| Black-box Coverage  | tbl_fact_artifact_parsed_section |
| PASS Count          | tbl_fact_test_run                |
| FAIL Count          | tbl_fact_test_run                |
| NOT_RUN Count       | tbl_fact_test_run                |
| Latest CI           | tbl_fact_ci_run                  |
| Defect Leakage      | tbl_fact_finding                 |
| Exception           | tbl_fact_exception               |
| Release Readiness   | Derived                          |

---

## 5. AC-Test Coverage

Coverage is calculated using:

* Acceptance Criteria parsed from Spec Pack.
* Test mappings parsed from Test Plan.
* Execution results parsed from Test Results.

No duplicated storage is required.

Coverage is calculated dynamically.

---

## 6. Black-box Coverage

Coverage is calculated from:

```text
blackbox-testcases.md
```

Parser outputs stored in:

```text
tbl_fact_artifact_parsed_section
```

Supported viewpoints:

* Normal
* Error
* Boundary
* Permission
* State
* Audit
* Operation

Dashboard aggregates existing parsed data only.
## 7. Test Result Summary

The dashboard summarizes existing test execution data.

### Source Table

```text
tbl_fact_test_run
```

Expected information:

* Total Test Cases
* PASS
* FAIL
* NOT_RUN
* Execution Date
* Linked CI Run

The dashboard aggregates these values without storing duplicate records.

---

## 8. Defect Leakage

The dashboard visualizes defect leakage using existing review and finding data.

### Source Tables

```text
tbl_fact_finding
tbl_fact_review
```

Displayed information:

* Ticket ID
* Severity
* Status
* Root Cause Phase
* Resolution Status

No additional persistence is required.

---

## 9. Release Readiness

Release readiness is a derived value.

The dashboard combines:

* Required artifact existence
* AC Coverage
* Test Results
* Black-box Coverage
* Open Issues
* Exception
* Report existence

Status values:

```text
READY
PARTIAL
NOT_READY
```

No status is stored permanently.

The value is calculated when the dashboard is loaded.

---

## 10. Suggested Queries

### 10.1 Dashboard Ticket List

```sql
SELECT
    t.ticket_id,
    t.ticket_code,
    p.project_name,
    r.repository_name,
    t.phase,
    ts.pass_count,
    ts.fail_count,
    ts.not_run_count,
    ci.status AS ci_status
FROM tbl_dim_ticket t
JOIN tbl_dim_project p
    ON p.project_id = t.project_id
JOIN tbl_dim_repository r
    ON r.repository_id = t.repository_id
LEFT JOIN tbl_fact_test_run ts
    ON ts.ticket_id = t.ticket_id
LEFT JOIN tbl_fact_ci_run ci
    ON ci.ticket_id = t.ticket_id;
```

---

### 10.2 Missing Required Artifacts

```sql
SELECT
    ticket_id,
    artifact_type_code,
    parse_status
FROM tbl_fact_artifact_snapshot
WHERE parse_status <> 'SUCCESS';
```

---

### 10.3 Test Result Summary

```sql
SELECT
    ticket_id,
    SUM(pass_count) AS pass_count,
    SUM(fail_count) AS fail_count,
    SUM(not_run_count) AS not_run_count
FROM tbl_fact_test_run
GROUP BY ticket_id;
```

---

### 10.4 Latest CI Result

```sql
SELECT
    ticket_id,
    workflow_name,
    status,
    finished_at
FROM tbl_fact_ci_run
ORDER BY finished_at DESC;
```

---

### 10.5 Open Findings

```sql
SELECT
    ticket_id,
    severity,
    status
FROM tbl_fact_finding
WHERE status <> 'RESOLVED';
```

---

## 11. Application-layer Aggregation

The dashboard performs aggregation in the application layer.

Examples:

### AC Coverage

```text
Covered AC
÷
Total AC
×100
```

---

### Black-box Coverage

```text
Completed Viewpoints
÷
Required Viewpoints
×100
```

---

### Release Readiness

```text
Required Artifacts
+
Test Status
+
Coverage
+
Report
+
No Blocking Findings
```

↓

```text
READY
PARTIAL
NOT_READY
```

---

## 12. Index Recommendation

Existing indexes should support:

```sql
ticket_id
repository_id
project_id
artifact_type_id
updated_at
status
severity
```

No new indexes are mandatory for the PoC.

Performance tuning should be based on production workload after the dashboard is implemented.

---

## 13. Data Refresh Rules

Dashboard data is refreshed from existing sources.

Recommended refresh triggers:

* Artifact parser completed.
* Test results updated.
* CI completed.
* Review completed.
* Exception updated.

The dashboard never becomes the source of truth.

---

## 14. Implementation Notes

* Do not create dashboard-specific tables.
* Do not duplicate parser results.
* Do not duplicate test summaries.
* Do not duplicate CI summaries.
* Reuse parser outputs as the primary source.
* Perform aggregation in the service layer.
* Keep the dashboard completely read-only.

---

## 15. Migration Checklist

| No | Task                                    |    Required |
| -: | --------------------------------------- | ----------: |
|  1 | Verify existing parser tables           |         Yes |
|  2 | Verify test summary table               |         Yes |
|  3 | Verify CI summary table                 |         Yes |
|  4 | Verify review/finding tables            |         Yes |
|  5 | Verify exception table                  |         Yes |
|  6 | No new dashboard tables                 |         Yes |
|  7 | No migration SQL required               |         Yes |
|  8 | Performance review after implementation | Recommended |
