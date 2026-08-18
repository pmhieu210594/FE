# Black-box Test Cases

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02  

---

## Test Case Summary

| Case ID | AC ID | Priority | Category | Title | Status |
|---|---|---|---|---|---|
| BB-001 | AC-DATAOPS-1 | P0 | Normal | Dashboard renders successfully | Planned |
| BB-002 | AC-DATAOPS-2 | P0 | Normal | Connector Status KPI displays correctly | Planned |
| BB-003 | AC-DATAOPS-3 | P0 | Normal | Parse Errors KPI displays correctly | Planned |
| BB-004 | AC-DATAOPS-4 | P0 | Normal | Missing Evidence KPI displays correctly | Planned |
| BB-005 | AC-DATAOPS-5 | P1 | Normal | Freshness KPI displays correctly | Planned |
| BB-006 | AC-DATAOPS-6 | P1 | Normal | Broken Traceability KPI displays correctly | Planned |
| BB-007 | AC-DATAOPS-7 | P1 | Normal | Dashboard filtering | Planned |
| BB-008 | AC-DATAOPS-8 | P1 | Normal | Connector Detail drill-down | Planned |
| BB-009 | AC-DATAOPS-9 | P0 | Compatibility | Existing V4 tables reused | Planned |
| BB-010 | AC-DATAOPS-10 | P0 | Permission | Dashboard is read-only | Planned |
| BB-011 | AC-DATAOPS-1 | P1 | Boundary | Empty dashboard | Planned |
| BB-012 | AC-DATAOPS-7 | P2 | Error | Invalid filter values | Planned |
| BB-013 | AC-DATAOPS-10 | P0 | Permission | Unauthorized access | Planned |
| BB-014 | AC-DATAOPS-5 | P2 | Boundary | No freshness information | Planned |

---

# Test Cases

## BB-001 : Dashboard renders successfully

| item | content |
|---|---|
| Related AC | AC-DATAOPS-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Dashboard metadata exists |
| Input | Open Data Ops Dashboard |
| Steps | Navigate to Dashboard |
| Expected Result | Dashboard page, KPI cards and connector table are displayed |
| Note | Initial dashboard verification |

---

## BB-002 : Connector Status KPI

| item | content |
|---|---|
| Related AC | AC-DATAOPS-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Connector execution history exists |
| Input | Open Dashboard |
| Steps | Observe Connector Status KPI |
| Expected Result | Connector Status KPI matches existing connector metadata |
| Note | Read-only verification |

---

## BB-003 : Parse Errors KPI

| item | content |
|---|---|
| Related AC | AC-DATAOPS-3 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Parser execution history exists |
| Input | Open Dashboard |
| Steps | Observe Parse Errors KPI |
| Expected Result | Parse Errors KPI matches parser metadata |
| Note | Existing parser metadata only |

---

## BB-004 : Missing Evidence KPI

| item | content |
|---|---|
| Related AC | AC-DATAOPS-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Missing evidence exists |
| Input | Open Dashboard |
| Steps | Observe Missing Evidence KPI |
| Expected Result | KPI matches artifact metadata |
| Note | Existing artifact metadata only |

---

## BB-005 : Freshness KPI

| item | content |
|---|---|
| Related AC | AC-DATAOPS-5 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Connector execution timestamps exist |
| Input | Open Dashboard |
| Steps | Observe Freshness KPI |
| Expected Result | KPI reflects current freshness calculation |
| Note | Business rule pending PM confirmation |

---

## BB-006 : Broken Traceability KPI

| item | content |
|---|---|
| Related AC | AC-DATAOPS-6 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Broken traceability records exist |
| Input | Open Dashboard |
| Steps | Observe Broken Traceability KPI |
| Expected Result | KPI matches traceability metadata |
| Note | Existing traceability only |

---

## BB-007 : Dashboard filtering

| item | content |
|---|---|
| Related AC | AC-DATAOPS-7 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Multiple projects and repositories exist |
| Input | Select Project / Repository / Connector |
| Steps | Apply filter |
| Expected Result | Connector table refreshes with matching records |
| Note | Existing filter component reused |

---

## BB-008 : Connector Detail drill-down

| item | content |
|---|---|
| Related AC | AC-DATAOPS-8 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Connector exists |
| Input | Click connector row |
| Steps | Open detail drawer |
| Expected Result | Read-only connector detail displayed |
| Note | Drawer component reused |

---

## BB-009 : Existing V4 table reuse

| item | content |
|---|---|
| Related AC | AC-DATAOPS-9 |
| Priority | P0 |
| Category | Compatibility |
| Preconditions | Existing V4 data available |
| Input | Open Dashboard |
| Steps | Compare KPI values with DB |
| Expected Result | Dashboard values match existing V4 metadata |
| Note | No duplicated persistence |

---

## BB-010 : Dashboard is read-only

| item | content |
|---|---|
| Related AC | AC-DATAOPS-10 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Dashboard loaded |
| Input | Browse Dashboard |
| Steps | Inspect available actions |
| Expected Result | No Create / Edit / Delete operation exists |
| Note | Read-only verification |

---

## BB-011 : Empty dashboard

| item | content |
|---|---|
| Related AC | AC-DATAOPS-1 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | No connector metadata |
| Input | Open Dashboard |
| Steps | Load page |
| Expected Result | Dashboard renders successfully with zero-value KPIs |
| Note | Empty-state verification |

---

## BB-012 : Invalid filter values

| item | content |
|---|---|
| Related AC | AC-DATAOPS-7 |
| Priority | P2 |
| Category | Error |
| Preconditions | Dashboard available |
| Input | Invalid Project / Repository / Connector |
| Steps | Submit filter |
| Expected Result | Validation message or empty result without exception |
| Note | Filter validation |

---

## BB-013 : Unauthorized access

| item | content |
|---|---|
| Related AC | AC-DATAOPS-10 |
| Priority | P0 |
| Category | Permission |
| Preconditions | User not authenticated |
| Input | Open Dashboard |
| Steps | Access Dashboard URL |
| Expected Result | Access denied (401/403) |
| Note | Existing authentication reused |

---

## BB-014 : No Freshness information

| item | content |
|---|---|
| Related AC | AC-DATAOPS-5 |
| Priority | P2 |
| Category | Boundary |
| Preconditions | No connector execution timestamp |
| Input | Open Dashboard |
| Steps | View Freshness KPI |
| Expected Result | KPI displays 0 or N/A according to specification |
| Note | Boundary verification |

---

# AC ↔ Black-box Mapping

| AC | Black-box Case |
|---|---|
| AC-DATAOPS-1 | BB-001, BB-011 |
| AC-DATAOPS-2 | BB-002 |
| AC-DATAOPS-3 | BB-003 |
| AC-DATAOPS-4 | BB-004 |
| AC-DATAOPS-5 | BB-005, BB-014 |
| AC-DATAOPS-6 | BB-006 |
| AC-DATAOPS-7 | BB-007, BB-012 |
| AC-DATAOPS-8 | BB-008 |
| AC-DATAOPS-9 | BB-009 |
| AC-DATAOPS-10 | BB-010, BB-013 |

---

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [ ] State transition (Not applicable)
- [ ] Character type input (Not applicable)
- [ ] Numeric input (Not applicable)
- [ ] Full-width number (Not applicable)
- [x] Empty/null
- [ ] Duplicate (Read-only dashboard)
- [ ] Non-existing ID (Covered by invalid filter)
- [ ] Deleted data (Not applicable)
- [ ] External IF failure
- [ ] Timeout/retry (Not applicable)
- [ ] Double submit (Read-only dashboard)
- [ ] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output