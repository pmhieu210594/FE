# Black-box Test Cases

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## Test Case Summary

| Case ID | AC ID | Priority | Category | Title | Status |
|---|---|---|---|---|---|
| BB-001 | AC-SECURITY-DASHBOARD-1 | P0 | Normal | Dashboard loads successfully | |
| BB-002 | AC-SECURITY-DASHBOARD-2 | P0 | Normal | Safety Pack KPI displays correctly | |
| BB-003 | AC-SECURITY-DASHBOARD-3 | P0 | Normal | Secret Scan KPI displays correctly | |
| BB-004 | AC-SECURITY-DASHBOARD-4 | P0 | Normal | SAST / SCA KPI displays correctly | |
| BB-005 | AC-SECURITY-DASHBOARD-5 | P0 | Normal | Security Checklist displays correctly | |
| BB-006 | AC-SECURITY-DASHBOARD-6 | P0 | Normal | Security Exception status displays correctly | |
| BB-007 | AC-SECURITY-DASHBOARD-7 | P1 | Normal | Dashboard filtering | |
| BB-008 | AC-SECURITY-DASHBOARD-8 | P1 | Normal | Ticket Detail drawer | |
| BB-009 | AC-SECURITY-DASHBOARD-9 | P0 | Compatibility | Existing metadata reused | |
| BB-010 | AC-SECURITY-DASHBOARD-10 | P0 | Permission | Dashboard is read-only | |
| BB-011 | AC-SECURITY-DASHBOARD-1 | P1 | Boundary | Empty dashboard | |
| BB-012 | AC-SECURITY-DASHBOARD-7 | P2 | Error | Invalid filter values | |

---

## Test Cases

### BB-001 : Dashboard loads successfully

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Security metadata exists |
| Input | Open Security Dashboard |
| Steps | Navigate to Security Dashboard |
| Expected Result | Dashboard page, KPI cards and Ticket table are displayed |
| Note | Dashboard overview |

---

### BB-002 : Safety Pack KPI displays correctly

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Safety Pack metadata exists |
| Input | Open Dashboard |
| Steps | Observe Safety Pack KPI |
| Expected Result | KPI matches Safety Pack metadata |
| Note | Read-only verification |

---

### BB-003 : Secret Scan KPI displays correctly

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-3 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Secret Scan results exist |
| Input | Open Dashboard |
| Steps | Observe Secret Scan KPI |
| Expected Result | KPI matches Security Scan metadata |
| Note | Existing Security Scan reused |

---

### BB-004 : SAST / SCA KPI displays correctly

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | SAST/SCA metadata exists |
| Input | Open Dashboard |
| Steps | Observe SAST / SCA KPI |
| Expected Result | KPI matches existing metadata |
| Note | Existing Security Scan reused |

---

### BB-005 : Security Checklist displays correctly

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-5 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Checklist parser completed |
| Input | Open Dashboard |
| Steps | Observe Checklist column |
| Expected Result | Checklist status matches parser result |
| Note | Existing parser reused |

---

### BB-006 : Security Exception displays correctly

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-6 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Exception exists |
| Input | Open Dashboard |
| Steps | Observe Exception column |
| Expected Result | Exception status matches existing data |
| Note | Existing Exception module |

---

### BB-007 : Dashboard filtering

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-7 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Multiple Projects / Repositories exist |
| Input | Select filter |
| Steps | Apply filters |
| Expected Result | Ticket list filtered correctly |
| Note | Existing Dashboard Filter reused |

---

### BB-008 : Ticket Detail Drawer

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-8 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Ticket exists |
| Input | Click View |
| Steps | Open Detail Drawer |
| Expected Result | Drawer displays Safety Pack, Secret Scan, Checklist and Exception information |
| Note | Read-only |

---

### BB-009 : Existing metadata reused

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-9 |
| Priority | P0 |
| Category | Compatibility |
| Preconditions | Existing metadata exists |
| Input | Open Dashboard |
| Steps | Compare displayed values with database |
| Expected Result | Dashboard values match existing metadata |
| Note | No duplicated persistence |

---

### BB-010 : Dashboard is read-only

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-10 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Dashboard loaded |
| Input | Browse dashboard |
| Steps | Inspect actions |
| Expected Result | No Create / Update / Delete actions available |
| Note | Read-only verification |

---

### BB-011 : Empty Dashboard

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-1 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | No matching ticket |
| Input | Apply restrictive filters |
| Steps | Execute search |
| Expected Result | Empty state displayed without exception |
| Note | Boundary case |

---

### BB-012 : Invalid Filter

| item | content |
|---|---|
| Related AC | AC-SECURITY-DASHBOARD-7 |
| Priority | P2 |
| Category | Error |
| Preconditions | Dashboard available |
| Input | Invalid filter |
| Steps | Submit invalid value |
| Expected Result | Validation message or ignored filter |
| Note | Input validation |

---

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [ ] State transition
- [ ] Character type input
- [ ] Numeric input
- [ ] Full-width number
- [ ] Empty/null
- [ ] Duplicate
- [ ] Non-existing ID
- [ ] Deleted data
- [ ] External IF failure
- [ ] Timeout/retry
- [ ] Double submit
- [ ] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output