# Database Design - Safety / Security Evidence MVP

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Scope**: Safety Pack status, GitHub Actions security scan summary, Security Exception management.  
**Out of scope**: High-risk human approval.

---

## 1. Overview

This ticket may use only `tbl_` tables.

Approved table set:

```text
tbl_dim_project
tbl_dim_repository
tbl_dim_ticket
tbl_connector_run
tbl_fact_pull_request
tbl_fact_ci_run
tbl_fact_safety_pack_status
tbl_fact_security_scan
tbl_fact_security_finding
tbl_fact_exception
tbl_dim_role
```

Do not use non-`tbl_` table names.

---

## 2. Main Persistence Areas

| Table | Purpose |
|---|---|
| `tbl_fact_safety_pack_status` | Stores Safety Pack scan summary per repository / commit / scan run |
| `tbl_fact_security_scan` | Stores Secret / SAST / SCA summary from GitHub Actions push |
| `tbl_fact_security_finding` | Optional detail-level finding storage if approved for MVP |
| `tbl_fact_exception` | Stores Security Exceptions lifecycle and expiry |
| `tbl_connector_run` | Existing connector/job execution tracking |
| `tbl_fact_ci_run` | Existing CI run linkage if available in current schema |
| `tbl_fact_pull_request` | PR linkage for evidence association |
| `tbl_dim_project` | Project dimension |
| `tbl_dim_repository` | Repository dimension |
| `tbl_dim_ticket` | Ticket dimension |
| `tbl_dim_role` | Role / approver mapping |

---

## 3. Safety Pack Status Data

Suggested fields on `tbl_fact_safety_pack_status` should support:

- project reference
- repository reference
- ticket reference if applicable
- connector run reference
- commit SHA
- branch
- claude_md_exists
- settings_json_exists
- rules_dir_exists
- rules_count
- allow_count
- ask_count
- deny_count
- settings_parse_status
- safety_pack_status
- scanned_at
- content_hash
- missing_items_summary

---

## 4. Security Scan Summary Data

Suggested fields on `tbl_fact_security_scan` should support:

- project reference
- repository reference
- ticket reference
- PR reference
- CI run reference
- workflow run id
- job name
- commit SHA
- branch
- scan type
- scan tool
- scan status
- critical_count
- high_count
- medium_count
- low_count
- info_count
- total_findings
- unresolved_count
- scanned_at

Do not store raw secret values or raw sensitive findings.

---

## 5. Security Exception Data

Suggested fields on `tbl_fact_exception` should support:

- project reference
- repository reference
- ticket reference
- exception type
- target type
- target id
- reason
- approved role id
- approver id or approver display value according to existing pattern
- expiry date
- alternative control
- status
- created_at
- updated_at
- closed_at

---

## 6. Key Rules

- Secret / SAST / SCA source is GitHub Actions push-to-BE.
- Safety Pack source is repository filesystem scan.
- `tbl_fact_security_finding` is optional in MVP and must not be assumed mandatory unless approved.
- No non-`tbl_` table names may be introduced.
- No raw sensitive data may be persisted.
