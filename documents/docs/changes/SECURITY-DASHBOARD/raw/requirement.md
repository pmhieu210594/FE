# Requirement Document - Security Dashboard

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

# 1. Screen Overview

- **Screen name:** Security Dashboard
- **Business purpose:** Provide Security, Admin and Data Ops users with a centralized operational view of repository security posture and ticket-level security evidence.
- **Reason for creating the screen:** Security evidence is currently distributed across Safety Pack scans, GitHub Actions security scans, Security Checklist parser results and Security Exceptions.
- **Goal of this version:** Provide a read-only operational dashboard for monitoring security evidence across repositories and tickets.

---

# 2. Scope

## 2.1 In Scope

- Display Security Dashboard.
- Display Safety Pack status.
- Display Secret Scan result.
- Display SAST result.
- Display SCA result.
- Display Security Checklist result.
- Display Security Exception status.
- Display Final Security Verdict.
- Search.
- Filter.
- Ticket drill-down.
- Read-only dashboard.

---

## 2.2 Out of Scope

- Secret Scan execution.
- SAST execution.
- SCA execution.
- Security approval workflow.
- Security Exception CRUD.
- AI Security Analysis.
- Security Score.
- Dashboard administration.
- Manual retry.
- Database migration.

---

# 3. Current State Summary

Current situation:

Security reviewers inspect multiple locations independently.

Information exists in:

- Safety Pack Scanner
- GitHub Actions
- Secret Scan
- Semgrep
- Trivy
- Security Exceptions
- Security Checklist

There is no unified Security Dashboard.

---

# 4. Target State Summary

Security users open one dashboard.

The dashboard immediately displays:

- Safety Pack
- Secret Scan
- SAST
- SCA
- Security Exceptions
- Security Checklist
- Final Security Verdict

Ticket-level drill-down is available.

---

# 5. Change Requirements

| Section | Current State | Target State | Requirement | Keep / Change / New | Notes |
|---|---|---|---|---|---|
| Dashboard | None | Security Dashboard | New operational dashboard | New | |
| Safety Pack | Separate page | Dashboard KPI | Reuse | Change | |
| Secret Scan | GitHub Actions | Dashboard KPI | Reuse | Change | |
| SAST | GitHub Actions | Dashboard KPI | Reuse | Change | |
| Security Checklist | Parsed artifact | Dashboard | Reuse | Change | |
| Exception | Separate module | Dashboard summary | Reuse | Change | |

---

# 6. Functional Requirements

## 6.1 Dashboard Overview

The system shall:

- Display Security Dashboard.
- Display last refresh time.
- Display active filters.
- Display security KPI cards.

---

## 6.2 Safety Pack

Display:

- READY
- WARNING
- MISSING
- PARSE_ERROR

using existing Safety Pack status.

---

## 6.3 Secret Scan

Display:

- PASS
- FAIL
- NOT_AVAILABLE

using existing Security Scan evidence.

---

## 6.4 SAST / SCA

Display:

- PASS
- WARNING
- FAIL
- NOT_AVAILABLE

using existing Security Scan evidence.

---

## 6.5 Security Checklist

Display parser result from:

```text
security-checklist.md
```

including:

- Permission Review
- Privacy Review
- High Risk Review
- Final Verdict

---

## 6.6 Security Exception

Display:

- OPEN
- APPROVED
- EXPIRED
- CLOSED

using existing Exception data.

---

## 6.7 Dashboard Filters

Supported filters:

- Project
- Repository
- Ticket
- Safety Pack Status
- Secret Scan Status
- SAST Status
- Exception Status

---

## 6.8 Search

Search by:

- Ticket
- Repository
- Project

---

## 6.9 Ticket Detail

The detail drawer shall display:

- Safety Pack summary
- Secret Scan
- SAST
- SCA
- Security Checklist
- Security Exceptions
- Final Security Verdict

The drawer is read-only.

---

# 7. Data Items

| Field | Meaning |
|---|---|
| Ticket | Ticket identifier |
| Repository | Repository |
| Safety Pack | READY / WARNING / MISSING |
| Secret Scan | PASS / FAIL |
| SAST | PASS / WARNING / FAIL |
| SCA | PASS / WARNING / FAIL |
| Security Checklist | PASS / WARNING / FAIL |
| Exception | OPEN / APPROVED / EXPIRED |
| Final Verdict | PASS / WARNING / FAIL |

---

# 8. Acceptance Criteria

- AC-SECURITY-DASHBOARD-1 Dashboard is displayed successfully.
- AC-SECURITY-DASHBOARD-2 Safety Pack status is displayed.
- AC-SECURITY-DASHBOARD-3 Secret Scan result is displayed.
- AC-SECURITY-DASHBOARD-4 SAST result is displayed.
- AC-SECURITY-DASHBOARD-5 SCA result is displayed.
- AC-SECURITY-DASHBOARD-6 Security Checklist result is displayed.
- AC-SECURITY-DASHBOARD-7 Security Exception status is displayed.
- AC-SECURITY-DASHBOARD-8 Ticket drill-down is available.
- AC-SECURITY-DASHBOARD-9 Existing V4 tables are reused.
- AC-SECURITY-DASHBOARD-10 Dashboard is read-only.

---

# 9. Open Points

- Final Security Verdict calculation.
- Security Checklist weighting.
- Security Alert calculation.
- Export format.
- Refresh interval.
- Exception priority.