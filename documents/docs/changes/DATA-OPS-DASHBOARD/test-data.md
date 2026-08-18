# Test Data

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## Data Policy

- Test data only.
- Existing V4 metadata only.
- No production data.
- Dashboard is read-only.
- Existing Connector / Parser metadata reused.
- No sensitive information stored.
- No duplicated persistence.

---

## Master Data

| name | value | purpose |
|---|---|---|
| Project | Project-A | Dashboard filter |
| Project | Project-B | Dashboard filter |
| Repository | repo-a | Repository filter |
| Repository | repo-b | Repository filter |
| Connector | GitHub | Connector filter |
| Connector | Azure DevOps | Connector filter |
| Parser Status | SUCCESS | Parser KPI |
| Parser Status | WARNING | Parser KPI |
| Parser Status | ERROR | Parser KPI |
| Connector Status | SUCCESS | Connector KPI |
| Connector Status | FAILURE | Connector KPI |
| Broken Link Status | BROKEN | Traceability KPI |

---

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| DataOps | DATA_OPS | Read Dashboard | Normal case |
| Admin | ADMIN | Read Dashboard | Compatibility |
| PM | PM | Read Dashboard | Cross-role verification |
| Anonymous | None | No Access | Permission test |

---

## Normal Data

| ID | data | purpose |
|---|---|---|
| ND-001 | Connector execution history | Connector Status KPI |
| ND-002 | Parser execution history | Parse Errors KPI |
| ND-003 | Missing artifact snapshot | Missing Evidence KPI |
| ND-004 | Broken Traceability records | Broken Link KPI |
| ND-005 | Fresh connector execution | Freshness KPI |
| ND-006 | Multiple repositories | Filter verification |
| ND-007 | Connector detail exists | Detail Drawer |

---

## Error Data

| ID | data | expected error |
|---|---|---|
| ED-001 | Unknown Project | Empty dashboard |
| ED-002 | Unknown Repository | Empty dashboard |
| ED-003 | Unknown Connector | Empty dashboard |
| ED-004 | Invalid Parser Status | Validation message |
| ED-005 | Database unavailable | Existing error page |
| ED-006 | Unauthorized user | 401 / 403 |

---

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| BD-001 | Connector Runs | 0 | KPI displays 0 |
| BD-002 | Parse Errors | 0 | KPI displays 0 |
| BD-003 | Missing Evidence | 0 | KPI displays 0 |
| BD-004 | Broken Links | 0 | KPI displays 0 |
| BD-005 | Freshness | No execution history | KPI displays 0 / N/A |
| BD-006 | Connector List | Empty | Empty State |
| BD-007 | Connector List | Very Large Dataset | Dashboard still usable |

---

## Existing Data Compatibility

- Existing Connector execution reused.
- Existing Parser metadata reused.
- Existing Traceability metadata reused.
- Existing V4 schema reused.
- Existing Dashboard components reused.
- No duplicated persistence.

---

## Data Setup Procedure

1. Create Project metadata.
2. Create Repository metadata.
3. Create Connector execution history.
4. Create Parser execution history.
5. Create Artifact Snapshot metadata.
6. Create Traceability metadata.
7. Verify Dashboard KPIs.
8. Execute Black-box scenarios.

---

## Data Cleanup Procedure

1. Remove temporary test metadata.
2. Restore original testing environment.
3. Verify no temporary Connector metadata remains.
4. Verify no temporary Parser metadata remains.
5. Verify Traceability metadata restored.

---

## Sensitive Data Handling

- Do not use production repositories.
- Do not expose GitHub tokens.
- Do not expose Azure DevOps PATs.
- Do not expose database credentials.
- Do not expose customer repository names.
- Do not expose secrets in Connector logs.
- Do not store PII in Dashboard artifacts.