# 00_brainstorm

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## Purpose

Capture the initial understanding, assumptions, risks and unknown information before formalizing the Security Dashboard specification.

The Security Dashboard provides a centralized operational view of repository and ticket security posture by aggregating existing security metadata.

This document is a brainstorming artifact only and must not be treated as the final specification.

---

## Known Information

### Requirement

Security Dashboard shall provide visibility of:

- Safety Pack
- Secret Scan
- SAST
- SCA
- Security Checklist
- Security Exceptions

Dashboard is operational and read-only.

---

### Existing Modules

Current implementation already contains or plans to contain:

- Safety Pack Scanner
- GitHub Actions Security Scan
- Security Checklist Parser
- Security Exception
- Existing Dashboard Framework

---

### Existing Data Sources

Candidate V4 tables

- tbl_dim_project
- tbl_dim_repository
- tbl_dim_ticket
- tbl_fact_safety_pack_status
- tbl_fact_security_scan
- tbl_fact_exception
- tbl_fact_artifact_snapshot
- tbl_fact_artifact_parsed_section

No additional dashboard persistence should be introduced.

---

### Dashboard Characteristics

The dashboard

- is read-only
- does not execute security scans
- does not update exceptions
- aggregates existing metadata
- reuses existing Dashboard architecture

---

## Undetermined Points

| ID | Point | Status |
|---|---|---|
| UD-1 | Final Security Verdict calculation | Open |
| UD-2 | Security Alert rule | Open |
| UD-3 | Export format | Open |
| UD-4 | Refresh interval | Open |
| UD-5 | Exception severity display | Open |

---

## Expected Risks

| Risk | Probability | Impact | Note |
|---|---|---|---|
| Existing Security Scan schema changes | Medium | High | Dashboard mapping affected |
| Existing Safety Pack structure changes | Medium | Medium | KPI mapping changes |
| Parser output changes | Medium | Medium | Checklist mapping changes |
| Multiple tickets per repository | High | High | Dashboard must be ticket-oriented |

---

## What AI Needs to Investigate

- Existing Dashboard implementation
- Existing Safety Pack module
- Existing Security Scan implementation
- Existing Exception implementation
- Existing Security Checklist parser
- Existing Dashboard components
- Existing V4 schema

---

## What Humans Need to Ask

- How is Final Security Verdict calculated?
- Should Security Alert become a KPI?
- Should Parser Warning affect Security Verdict?
- Should Export be included in PoC?
- Should Expired Exception override PASS?

---

## Conditions Under Which Implementation Is Not Permitted

1. Do not create dashboard-specific database tables.
2. Do not duplicate Security metadata.
3. Do not execute Secret Scan.
4. Do not execute SAST.
5. Do not execute SCA.
6. Do not edit Security Exceptions.
7. Do not implement approval workflow.
8. Do not introduce AI Security Analytics.
9. Do not modify existing Security modules.
10. Stop implementation if required metadata is unavailable.