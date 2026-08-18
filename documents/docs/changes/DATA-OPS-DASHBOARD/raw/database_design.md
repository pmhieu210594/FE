# Database Design - Data Ops Dashboard

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

# 1. Purpose

The Data Ops Dashboard provides operational visibility into data ingestion, parser execution and evidence quality.

The dashboard is **read-only**.

No dashboard-specific persistence is introduced.

All information is aggregated from existing V4 tables.

---

# 2. Existing Tables

The Data Ops Dashboard reuses existing tables only.

| Table | Purpose |
|---|---|
| `tbl_connector_run` | Connector execution history |
| `tbl_dim_project` | Project |
| `tbl_dim_repository` | Repository |
| `tbl_dim_ticket` | Ticket |
| `tbl_fact_artifact_snapshot` | Artifact existence |
| `tbl_fact_artifact_parsed_section` | Parsed artifact sections |
| `tbl_fact_data_quality` | Parser quality |
| `tbl_fact_traceability_link` | Traceability |
| `tbl_fact_metric_value` | Existing metrics |

No new table is required.

---

# 3. Dashboard Data Sources

| Dashboard Section | Source Table |
|---|---|
| Connector Status | `tbl_connector_run` |
| Parse Errors | `tbl_fact_data_quality` |
| Missing Evidence | `tbl_fact_artifact_snapshot` |
| Freshness | `tbl_fact_artifact_snapshot` |
| Traceability | `tbl_fact_traceability_link` |
| Project | `tbl_dim_project` |
| Repository | `tbl_dim_repository` |
| Ticket | `tbl_dim_ticket` |

---

# 4. Mapping Between UI and Database

| UI Field | Source |
|---|---|
| Project | `tbl_dim_project.project_name` |
| Repository | `tbl_dim_repository.repository_name` |
| Connector | `tbl_connector_run.connector_name` |
| Connector Status | `tbl_connector_run.status` |
| Latest Execution | `tbl_connector_run.finished_at` |
| Successful Runs | `tbl_connector_run.success_count` |
| Failed Runs | `tbl_connector_run.failure_count` |
| Parser Success | `tbl_fact_data_quality.success_count` |
| Parser Warning | `tbl_fact_data_quality.warning_count` |
| Parser Error | `tbl_fact_data_quality.error_count` |
| Missing Evidence | Derived from Artifact Snapshot |
| Last Updated | Latest timestamp |

---

# 5. Connector Status

Source table:

```text
tbl_connector_run
```

Displayed information:

- Connector Name
- Status
- Last Execution
- Successful Runs
- Failed Runs
- Latest Error

Dashboard does not execute connectors.

---

# 6. Parser Health

Source table:

```text
tbl_fact_data_quality
```

Displayed information:

- Successful Parses
- Parser Warnings
- Parser Errors
- Failed Artifacts

Dashboard aggregates parser metadata only.

---

# 7. Missing Evidence

Source table:

```text
tbl_fact_artifact_snapshot
```

Displayed information:

- Missing Artifacts
- Placeholder Artifacts
- Invalid Templates
- Parse Status

No additional persistence.

---

# 8. Freshness

Source table:

```text
tbl_fact_artifact_snapshot
```

Displayed information:

- Last Updated
- Updated Today
- Outdated
- Never Parsed

Freshness is calculated from the latest artifact update timestamp.

---

# 9. Traceability

Source table:

```text
tbl_fact_traceability_link
```

Displayed information:

- Broken Links
- Missing Ticket
- Missing Report
- Missing CI
- Missing Review

Dashboard only visualizes existing links.

---

# 10. Suggested Queries

### 10.1 Connector Status

```sql
SELECT
    connector_name,
    status,
    started_at,
    finished_at
FROM tbl_connector_run
ORDER BY finished_at DESC;
```

---

### 10.2 Parser Summary

```sql
SELECT
    SUM(success_count) AS success_count,
    SUM(warning_count) AS warning_count,
    SUM(error_count) AS error_count
FROM tbl_fact_data_quality;
```

---

### 10.3 Missing Evidence

```sql
SELECT
    artifact_type_code,
    COUNT(*)
FROM tbl_fact_artifact_snapshot
WHERE parse_status <> 'SUCCESS'
GROUP BY artifact_type_code;
```

---

### 10.4 Broken Traceability

```sql
SELECT
    source_type,
    target_type,
    confidence
FROM tbl_fact_traceability_link
WHERE confidence < 1.0;
```

---

# 11. Application-layer Aggregation

The service layer calculates:

### Connector Health

```text
Successful Runs
÷
Total Runs
×100
```

---

### Parser Health

```text
Parser Success
Parser Warning
Parser Error
```

---

### Freshness

```text
Current Time
-
Last Updated
```

↓

- Fresh
- Warning
- Outdated

---

### Missing Evidence

Calculated from:

- Missing artifact
- Parse failure
- Placeholder artifact

---

# 12. Index Recommendation

Existing indexes should support:

```sql
connector_name

status

project_id

repository_id

ticket_id

updated_at
```

No additional indexes are required for the PoC.

---

# 13. Refresh Rules

Dashboard refreshes automatically after:

- Connector completed.
- Parser completed.
- Artifact updated.
- Traceability updated.

Dashboard is not the source of truth.

---

# 14. Implementation Notes

- Existing V4 tables only.
- No dashboard-specific table.
- No duplicated persistence.
- Existing parser reused.
- Existing connector reused.
- Existing traceability reused.
- Read-only implementation.

---

# 15. Migration Checklist

| No | Task | Required |
|---:|---|---:|
| 1 | Verify existing connector tables | Yes |
| 2 | Verify parser tables | Yes |
| 3 | Verify artifact snapshot | Yes |
| 4 | Verify traceability table | Yes |
| 5 | No migration required | Yes |
| 6 | No new dashboard table | Yes |
| 7 | Performance review after implementation | Recommended |