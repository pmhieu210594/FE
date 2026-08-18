# Database Design - Security Dashboard

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

# 1. Purpose

The Security Dashboard is a **read-only operational dashboard**.

It consolidates existing Security metadata from:

- Safety Pack
- GitHub Actions Security Scan
- Security Checklist Parser
- Security Exceptions

No dashboard-specific persistence is introduced.

---

# 2. Existing Tables

The Security Dashboard reuses existing V4 tables only.

| Table | Purpose |
|---|---|
| tbl_dim_project | Project |
| tbl_dim_repository | Repository |
| tbl_dim_ticket | Ticket |
| tbl_fact_safety_pack_status | Safety Pack |
| tbl_fact_security_scan | Secret Scan / SAST / SCA |
| tbl_fact_exception | Security Exceptions |
| tbl_fact_artifact_snapshot | Security Checklist snapshot |
| tbl_fact_artifact_parsed_section | Parsed checklist sections |
| tbl_fact_data_quality | Parser execution status |

No new table is required.

---

# 3. Dashboard Data Sources

| Dashboard Section | Source |
|---|---|
| Safety Pack | tbl_fact_safety_pack_status |
| Secret Scan | tbl_fact_security_scan |
| SAST | tbl_fact_security_scan |
| SCA | tbl_fact_security_scan |
| Security Checklist | tbl_fact_artifact_snapshot + tbl_fact_artifact_parsed_section |
| Security Exception | tbl_fact_exception |

---

# 4. Mapping Between UI and Database

| UI Field | Source |
|---|---|
| Project | tbl_dim_project |
| Repository | tbl_dim_repository |
| Ticket | tbl_dim_ticket |
| Safety Pack | tbl_fact_safety_pack_status |
| Secret Scan | tbl_fact_security_scan |
| SAST | tbl_fact_security_scan |
| SCA | tbl_fact_security_scan |
| Checklist Status | tbl_fact_artifact_snapshot |
| Checklist Sections | tbl_fact_artifact_parsed_section |
| Exception | tbl_fact_exception |
| Final Verdict | Calculated |

---

# 5. Safety Pack

Source table

```text
tbl_fact_safety_pack_status
```

Displayed values

- READY
- WARNING
- MISSING
- PARSE_ERROR

No duplicated persistence.

---

# 6. Security Scan

Source table

```text
tbl_fact_security_scan
```

Supported scan types

- SECRET
- SAST
- SCA

Displayed values

- PASS
- WARNING
- FAIL
- NOT_AVAILABLE

No raw findings are displayed.

---

# 7. Security Checklist

Source artifact

```text
security-checklist.md
```

Snapshot

```text
tbl_fact_artifact_snapshot
```

Sections

```text
tbl_fact_artifact_parsed_section
```

Displayed sections

- Permission Review
- Privacy Review
- High Risk Review
- Final Security Verdict

---

# 8. Security Exceptions

Source table

```text
tbl_fact_exception
```

Displayed status

- OPEN
- APPROVED
- EXPIRED
- CLOSED

Dashboard does not modify exception lifecycle.

---

# 9. Suggested Query

Dashboard Summary

```sql
SELECT
    t.ticket_key,
    r.repository_name,
    sp.safety_pack_status,
    ss.secret_scan_status,
    ss.sast_status,
    ss.sca_status,
    ex.status AS exception_status
FROM tbl_dim_ticket t
JOIN tbl_dim_repository r
    ON r.repository_id = t.repository_id
LEFT JOIN tbl_fact_safety_pack_status sp
    ON sp.repository_id = r.repository_id
LEFT JOIN tbl_fact_security_scan ss
    ON ss.ticket_id = t.ticket_id
LEFT JOIN tbl_fact_exception ex
    ON ex.ticket_id = t.ticket_id;
```

---

# 10. Application Layer Aggregation

The Service layer calculates:

- Final Security Verdict
- Open Exception Count
- Safety Pack READY Count
- Secret Scan FAIL Count
- SAST WARNING Count

No calculated values are persisted.

---

# 11. Index Recommendation

Reuse existing indexes.

Recommended indexed fields

```text
project_id

repository_id

ticket_id

status

scan_type

updated_at
```

No additional index is mandatory.

---

# 12. Data Refresh Rules

Dashboard refreshes after

- Safety Pack Scan
- Security Scan completed
- Security Checklist Parser completed
- Security Exception updated

Dashboard never becomes the source of truth.

---

# 13. Implementation Notes

- Read-only dashboard.
- Existing Dashboard architecture reused.
- Existing V4 tables reused.
- Existing Security modules reused.
- Existing parser outputs reused.
- No duplicated persistence.
- No migration.

---

# 14. Ticket-level View

Although Safety Pack is repository-level information, the dashboard displays **ticket-level rows**.

One repository may contain multiple tickets.

Example

| Repository | Ticket | Safety | Secret | SAST | Checklist | Exception |
|---|---|---|---|---|---|---|
| EDCAP_BE | PARSER-SPEC | READY | PASS | WARNING | WARNING | OPEN |
| EDCAP_BE | REPORT-PARSER | READY | PASS | PASS | PASS | NONE |
| EDCAP_BE | TEST-PLAN | READY | FAIL | PASS | FAIL | OPEN |

This allows Security reviewers to identify which ticket requires action.

---

# 15. Migration Checklist

| No | Task | Required |
|---:|---|---:|
| 1 | Verify existing Safety Pack table | Yes |
| 2 | Verify Security Scan table | Yes |
| 3 | Verify Security Exception table | Yes |
| 4 | Verify Security Checklist parser | Yes |
| 5 | No new table | Yes |
| 6 | No migration | Yes |
| 7 | No duplicated persistence | Yes |