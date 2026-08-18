# Test Data

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## Data Policy

- Existing V4 metadata only.
- Existing Security modules only.
- No production data.
- Dashboard is read-only.
- Existing Security Scan data reused.
- Existing Safety Pack data reused.
- Existing Security Checklist parser output reused.
- Existing Security Exception data reused.

---

## Master Data

| name | value | purpose |
|---|---|---|
| Safety Pack | READY | Normal case |
| Safety Pack | WARNING | Warning verification |
| Safety Pack | MISSING | Boundary verification |
| Secret Scan | PASS | Normal case |
| Secret Scan | FAIL | Failed scan |
| SAST | PASS | Normal case |
| SAST | WARNING | Warning verification |
| SAST | FAIL | Failed scan |
| SCA | PASS | Normal case |
| SCA | WARNING | Warning verification |
| Exception | OPEN | Active exception |
| Exception | APPROVED | Approved exception |
| Exception | EXPIRED | Expired exception |
| Checklist | PASS | Parser success |
| Checklist | WARNING | Parser warning |
| Checklist | FAIL | Parser failure |
| Verdict | PASS | Dashboard summary |
| Verdict | WARNING | Dashboard summary |
| Verdict | FAIL | Dashboard summary |

---

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| Security Reviewer | SECURITY | Read Dashboard | Normal case |
| Security Lead | SECURITY_ADMIN | Read Dashboard | Administration |
| Administrator | ADMIN | Read Dashboard | Compatibility |
| Developer | DEVELOPER | No Access | Permission verification |
| Anonymous | NONE | No Access | Unauthorized access |

---

## Normal Data

| ID | data | purpose |
|---|---|---|
| ND-001 | Ticket with Safety Pack READY | Verify Safety KPI |
| ND-002 | Ticket with Secret Scan FAIL | Verify Secret KPI |
| ND-003 | Ticket with SAST WARNING | Verify SAST KPI |
| ND-004 | Ticket with Checklist WARNING | Verify Checklist |
| ND-005 | Ticket with OPEN Exception | Verify Exception |
| ND-006 | Repository containing multiple tickets | Ticket-based table verification |

---

## Error Data

| ID | data | expected error |
|---|---|---|
| ED-001 | Unknown Project | Empty dashboard |
| ED-002 | Unknown Repository | Empty dashboard |
| ED-003 | Unknown Ticket | Empty dashboard |
| ED-004 | Invalid Filter | Validation or ignored filter |
| ED-005 | Missing Checklist | Display default status |
| ED-006 | Database unavailable | Existing error handler |

---

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| BD-001 | Safety Pack | 0 | KPI displays 0 |
| BD-002 | Secret Scan | 0 | KPI displays 0 |
| BD-003 | Exception | 0 | KPI displays 0 |
| BD-004 | Ticket Count | 0 | Empty state |
| BD-005 | Ticket Count | Large dataset | Dashboard remains usable |

---

## Existing Data Compatibility

- Existing Safety Pack metadata reused.
- Existing Security Scan metadata reused.
- Existing Checklist parser output reused.
- Existing Security Exception reused.
- Existing V4 tables reused.
- No duplicated persistence.

---

## Data Setup Procedure

1. Prepare Project.
2. Prepare Repository.
3. Execute Safety Pack Scan.
4. Execute Security Scan.
5. Execute Security Checklist Parser.
6. Prepare Security Exception.
7. Verify Dashboard.

---

## Data Cleanup Procedure

1. Remove temporary Security test data.
2. Restore test environment.
3. Verify no temporary metadata remains.

---

## Sensitive Data Handling

- Do not use production repositories.
- Do not expose repository secrets.
- Do not expose API Tokens.
- Do not expose Security Scan raw findings.
- Do not expose Security Exception confidential comments.
- Do not store PII inside test artifacts.