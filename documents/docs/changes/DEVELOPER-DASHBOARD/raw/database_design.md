# Database Design - Developer Dashboard

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-06-30
**Author**: OpenAI
**Update date**: 2026-06-30

---

# 1. Purpose

This document describes the database design for the **Developer Dashboard**.

The dashboard is **read-only**.

No dashboard-specific persistence is introduced.

All information is aggregated from existing V4 tables.

---

# 2. Existing Tables

The Developer Dashboard reuses existing tables only.

| Table                              | Purpose                      |
| ---------------------------------- | ---------------------------- |
| `tbl_dim_project`                  | Project information          |
| `tbl_dim_repository`               | Repository information       |
| `tbl_dim_ticket`                   | Ticket information           |
| `tbl_fact_ci_run`                  | CI execution results         |
| `tbl_fact_review`                  | Review information           |
| `tbl_fact_finding`                 | Review findings              |
| `tbl_fact_data_quality`            | Parser errors / data quality |
| `tbl_fact_artifact_snapshot`       | Artifact existence           |
| `tbl_fact_artifact_parsed_section` | Parsed artifact sections     |

No new table is required.

---

# 3. Dashboard Data Sources

| Dashboard Section | Source Table                          |
| ----------------- | ------------------------------------- |
| Ticket            | `tbl_dim_ticket`                      |
| Project           | `tbl_dim_project`                     |
| Repository        | `tbl_dim_repository`                  |
| CI Failures       | `tbl_fact_ci_run`                     |
| Review Findings   | `tbl_fact_review`, `tbl_fact_finding` |
| Parser Errors     | `tbl_fact_data_quality`               |

---

# 4. Mapping Between UI and Database

| UI Field        | Source                              |
| --------------- | ----------------------------------- |
| Ticket          | `tbl_dim_ticket`                    |
| Project         | `tbl_dim_project`                   |
| Repository      | `tbl_dim_repository`                |
| CI Status       | `tbl_fact_ci_run.status`            |
| Workflow        | `tbl_fact_ci_run.workflow_name`     |
| Review Status   | `tbl_fact_review.status`            |
| Review Severity | `tbl_fact_finding.severity`         |
| Finding Count   | `tbl_fact_finding`                  |
| Parser Status   | `tbl_fact_data_quality.status`      |
| Parser Error    | `tbl_fact_data_quality.error_count` |
| Updated Date    | Latest timestamp                    |

---

# 5. CI Failures

Source table:

```text
tbl_fact_ci_run
```

Displayed information:

* Workflow
* Status
* Failure Category
* Duration
* Updated Time

The dashboard only reads existing CI results.

---

# 6. Review Findings

Source tables:

```text
tbl_fact_review

tbl_fact_finding
```

Displayed information:

* Open Findings
* Severity
* Category
* Status

Only unresolved findings are highlighted.

---

# 7. Parser Errors

Source table:

```text
tbl_fact_data_quality
```

Displayed information:

* Parse Status
* Error Count
* Error Summary
* Updated Time

No parser information is duplicated.
