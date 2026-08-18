# Black-box Review Checklist

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## How to use

- Each reviewer marks:
  - ✅ Pass
  - ❌ Fail
  - ⏭ Skip (with justification)
- Any **P0** failure blocks release.
- P1/P2 findings require either:
  - Accepted Risk
  - Follow-up Ticket

---

# Category 1 — Boundary & Edge Cases

| # | Check Item | AC | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Dashboard loads when no Connector execution exists | AC-DATAOPS-1 | P0 | ✅ | Empty dashboard |
| 1.2 | All KPI cards display **0** when metadata does not exist | AC-DATAOPS-2~6 | P0 | ✅ | Boundary case |
| 1.3 | Invalid filter values do not crash dashboard | AC-DATAOPS-7 | P1 | ✅ | Validation |
| 1.4 | Unknown Connector ID returns Not Found | AC-DATAOPS-8 | P1 | ✅ | Existing handler |

---

# Category 2 — Permission & Security

| # | Check Item | AC | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Anonymous user cannot access Dashboard | AC-DATAOPS-10 | P0 | ✅ | 401 / 403 |
| 2.2 | DATA_OPS user can access Dashboard | AC-DATAOPS-1 | P0 | ✅ | Normal case |
| 2.3 | Dashboard exposes no Create / Edit / Delete operation | AC-DATAOPS-10 | P0 | ✅ | Read-only |
| 2.4 | Existing authentication reused | AC-DATAOPS-10 | P0 | ✅ | Existing Security |

---

# Category 3 — Compatibility

| # | Check Item | AC | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Existing PM Dashboard unaffected | AC-DATAOPS-9 | P0 | ✅ | Regression |
| 3.2 | Existing QA Dashboard unaffected | AC-DATAOPS-9 | P0 | ✅ | Regression |
| 3.3 | Existing Developer Dashboard unaffected | AC-DATAOPS-9 | P0 | ✅ | Regression |
| 3.4 | Existing V4 metadata reused | AC-DATAOPS-9 | P0 | ✅ | No duplication |

---

# Category 4 — Exception Handling

| # | Check Item | AC | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Missing Connector execution handled gracefully | AC-DATAOPS-2 | P0 | ✅ | KPI=0 |
| 4.2 | Missing Parser metadata handled gracefully | AC-DATAOPS-3 | P0 | ✅ | KPI=0 |
| 4.3 | Missing Evidence handled gracefully | AC-DATAOPS-4 | P0 | ✅ | KPI=0 |
| 4.4 | Missing Broken Link handled gracefully | AC-DATAOPS-6 | P0 | ✅ | KPI=0 |
| 4.5 | Database unavailable handled by existing Error Handler | AC-DATAOPS-1 | P1 | ✅ | Error page |

---

# Category 5 — Performance

| # | Check Item | AC | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Dashboard loads within expected response time | AC-DATAOPS-1 | P1 | ✅ | Manual |
| 5.2 | Filter operation remains responsive | AC-DATAOPS-7 | P1 | ✅ | Manual |
| 5.3 | Dashboard handles large Connector list | AC-DATAOPS-7 | P2 | ✅ | Manual |

---

# Category 6 — Business Rules

| # | Check Item | AC | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Connector Status KPI matches Connector metadata | AC-DATAOPS-2 | P0 | ✅ | Aggregation |
| 6.2 | Parse Errors KPI matches Parser metadata | AC-DATAOPS-3 | P0 | ✅ | Aggregation |
| 6.3 | Missing Evidence KPI matches Artifact metadata | AC-DATAOPS-4 | P0 | ✅ | Aggregation |
| 6.4 | Freshness KPI follows agreed calculation | AC-DATAOPS-5 | P1 | ✅ | PM decision |
| 6.5 | Broken Link KPI matches Traceability metadata | AC-DATAOPS-6 | P0 | ✅ | Aggregation |
| 6.6 | Dashboard never writes metadata | AC-DATAOPS-10 | P0 | ✅ | Read-only |

---

# Category 7 — Logging / Audit / Operation

| # | Check Item | AC | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Existing TraceId available | AC-DATAOPS-10 | P0 | ✅ | Existing logging |
| 7.2 | Existing logging reused | AC-DATAOPS-10 | P0 | ✅ | Existing framework |
| 7.3 | Existing monitoring unaffected | AC-DATAOPS-10 | P1 | ✅ | Existing operation |
| 7.4 | No additional audit record created | AC-DATAOPS-10 | P1 | ✅ | Read-only |

---

# Category 8 — Known Accepted Risks

| # | Risk | Status | Owner |
|---|---|---|---|
| 8.1 | Freshness threshold not finalized | Accepted Risk | PM |
| 8.2 | Connector Health calculation | Accepted Risk | PM |
| 8.3 | Security Alert KPI | Accepted Risk | PM |
| 8.4 | Processing Cost KPI | Accepted Risk | PM |

---

# Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| Developer | | | |
| QA | | | |
| PM | | | |

---

### Release Gate

Release is allowed only when:

- All **P0** checklist items are ✅
- No unresolved Blocker exists
- Accepted Risks are documented
- Human Decisions are recorded