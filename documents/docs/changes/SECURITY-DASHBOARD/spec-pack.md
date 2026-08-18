# Spec Pack

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## 1. Context / Purpose

The SDD Evidence Platform collects security-related metadata from repository scans, GitHub Actions security scans, Security Checklist parser results and Security Exception management.

Currently, Security reviewers must inspect multiple modules independently to determine the security posture of repositories and tickets.

The purpose of the Security Dashboard is to provide a centralized operational dashboard that visualizes:

- Safety Pack readiness
- Secret Scan result
- SAST result
- SCA result
- Security Checklist result
- Security Exceptions
- Final Security Verdict

The dashboard is operational, read-only and does not modify any source data.

---

## 2. Scope

### 2.1. Within range

- Security Dashboard
- Safety Pack
- Secret Scan
- SAST
- SCA
- Security Checklist
- Security Exception
- Final Security Verdict
- Search
- Filter
- Ticket Detail
- Read-only dashboard

---

### 2.2. Out of range

- Secret Scan execution
- SAST execution
- SCA execution
- Security approval workflow
- Security Exception CRUD
- AI Security Analytics
- Security Score
- Dashboard administration
- Database migration

---

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| Safety Pack | Repository security baseline | Existing implementation |
| Secret Scan | GitHub Actions secret detection | Existing implementation |
| SAST | Static Application Security Testing | Existing implementation |
| SCA | Software Composition Analysis | Existing implementation |
| Security Checklist | Parsed security review artifact | Existing parser |
| Security Exception | Approved security exception | Existing module |
| Final Security Verdict | Overall ticket security status | Calculated |

---

## 4. As-Is

Current security review requires manual inspection of:

- Safety Pack
- Secret Scan
- SAST
- SCA
- Security Checklist
- Security Exceptions

No unified Security Dashboard currently exists.

---

## 5. To-Be

Security reviewers open a single dashboard.

The dashboard immediately displays:

- Safety Pack
- Secret Scan
- SAST
- SCA
- Security Checklist
- Security Exceptions
- Final Security Verdict

The dashboard provides ticket-level visibility without modifying source data.

---

## 6. Detailed specification

### 6.1. Business Rules

**BR-1**

Dashboard is read-only.

---

**BR-2**

Safety Pack information is obtained from existing Safety Pack metadata.

---

**BR-3**

Secret Scan, SAST and SCA information is obtained from existing GitHub Actions security evidence.

---

**BR-4**

Security Checklist information is obtained from parsed Security Checklist artifacts.

---

**BR-5**

Security Exception information is obtained from existing Exception metadata.

---

**BR-6**

Dashboard reuses existing V4 tables only.

No dashboard-specific persistence.

---

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| Project | UUID | No | Existing Project | Filter |
| Repository | UUID | No | Existing Repository | Filter |
| Ticket | String | No | Existing Ticket | Search |
| Safety Status | Enum | No | READY / WARNING / MISSING | Filter |
| Secret Scan | Enum | No | PASS / FAIL | Filter |
| SAST | Enum | No | PASS / WARNING / FAIL | Filter |
| Exception | Enum | No | OPEN / CLOSED / EXPIRED | Filter |

---

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| Safety Pack | KPI | Integer | Dashboard |
| Secret Scan | KPI | Integer | Dashboard |
| SAST/SCA | KPI | Integer | Dashboard |
| Open Exception | KPI | Integer | Dashboard |
| Ticket List | Table | Read-only | Dashboard |
| Ticket Detail | Drawer | Read-only | Drill-down |

---

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| No Safety Pack | Display zero | INFO | No exception |
| No Security Scan | Display zero | INFO | No exception |
| No Checklist | Display zero | INFO | No exception |
| Unauthorized | Access denied | 401 / 403 | Existing security |
| Database unavailable | Error page | 500 | Existing handler |

---

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| Safety Pack | 0 | Unlimited | No repository | Display zero |
| Secret Scan | 0 | Unlimited | No scan | Display zero |
| Exception | 0 | Unlimited | No exception | Display zero |
| Ticket List | 0 | Unlimited | Empty | Empty state |

---

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Dashboard loads quickly | Existing platform target | Manual | |
| Security | Read-only | No write | Code Review | |
| Availability / Reliability | Existing platform | Existing SLA | Existing monitoring | |
| Maintainability | Existing components reused | No duplicated logic | Review | |
| Observability / Logging | Existing logging | TraceId | Existing framework | |
| Compatibility | Existing browsers | Existing UI | Manual | |

---

## 7. Acceptance Criteria

| AC ID | description | testable? | notes |
|---|---|---|---|
| AC-SECURITY-DASHBOARD-1 | Dashboard is displayed successfully | Yes | |
| AC-SECURITY-DASHBOARD-2 | Safety Pack status is displayed | Yes | |
| AC-SECURITY-DASHBOARD-3 | Secret Scan result is displayed | Yes | |
| AC-SECURITY-DASHBOARD-4 | SAST/SCA result is displayed | Yes | |
| AC-SECURITY-DASHBOARD-5 | Security Checklist result is displayed | Yes | |
| AC-SECURITY-DASHBOARD-6 | Security Exception is displayed | Yes | |
| AC-SECURITY-DASHBOARD-7 | Dashboard filtering works | Yes | |
| AC-SECURITY-DASHBOARD-8 | Ticket Detail drawer is available | Yes | |
| AC-SECURITY-DASHBOARD-9 | Existing V4 tables are reused | Yes | |
| AC-SECURITY-DASHBOARD-10 | Dashboard is read-only | Yes | |

---

## 8. Examples

### 8.1. Normal Case

Security reviewer opens the dashboard.

Expected:

- Safety Pack displayed.
- Secret Scan displayed.
- Security Checklist displayed.
- Exception displayed.

---

### 8.2. Error Case

Database temporarily unavailable.

Expected:

- Existing error page displayed.
- Existing exception handler reused.

---

### 8.3. Boundary Case

No Safety Pack.

No Security Scan.

No Exception.

Expected:

Dashboard loads successfully.

All KPI cards display **0**.

No exception is thrown.

---

## 9. Source Availability Summary

- Requirement: Available
- Database Design: Available
- Wireframe: Available
- Existing Safety Pack: Available
- Existing Security Scan: Available
- Existing Dashboard: Partial

---

## 10. Complexity Classification

```text
Complexity : Standard

System Shape : FE + BE

Primary Risk : Source Integration

Review Mode : Standard

Required Options :
- Source Analysis
- FE-BE Contract
```

---

## 11. FE/BE Contract Impact

New Security Dashboard APIs are required.

Existing Safety Pack, Security Scan, Security Checklist and Exception modules are reused.

No existing API is modified.

---

## 12. DB/Migration Impact

- Existing V4 tables only.
- No migration.
- No new table.
- No duplicated persistence.

---

## 13. Security/Privacy Impact

- Dashboard is read-only.
- Existing authentication reused.
- Existing authorization reused.
- No sensitive security evidence persisted.
- Existing security policies reused.

---

## 14. Operation/Maintenance Impact

- Existing monitoring reused.
- Existing logging reused.
- Existing parser lifecycle reused.
- Existing Security Scan lifecycle reused.

---

## 15. Test Strategy Summary

- FE rendering.
- BE aggregation.
- API integration.
- Dashboard filtering.
- Ticket Detail drawer.
- Black-box verification.
- Empty-state verification.

---

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| H-SECURITY-1 | Final Security Verdict calculation | Dashboard KPI | PM | Open |
| H-SECURITY-2 | Security Alert rule | Dashboard KPI | PM | Open |
| H-SECURITY-3 | Exception priority | Dashboard behavior | PM | Open |

---

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-SECURITY-1 | Existing Safety Pack metadata is reusable | Current implementation | Low | No |
| A-SECURITY-2 | Existing Security Scan metadata is reusable | Current implementation | Low | No |
| A-SECURITY-3 | Existing Security Checklist parser is reusable | Current implementation | Low | No |
| A-SECURITY-4 | Existing Security Exception metadata is reusable | Current implementation | Low | No |

---

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-SECURITY-1 | Final Security Verdict calculation | Dashboard KPI | PM | Open |
| OI-SECURITY-2 | Security Alert calculation | Dashboard KPI | PM | Open |
| OI-SECURITY-3 | Export capability | FE | PM | Open |
| OI-SECURITY-4 | Exception priority | Dashboard | PM | Open |