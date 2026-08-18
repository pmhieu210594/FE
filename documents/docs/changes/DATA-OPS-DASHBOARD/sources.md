# Sources

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| DATA-OPS-DASHBOARD | docs/changes/DATA-OPS-DASHBOARD | Read | Ticket working directory |
| Requirement V02 | VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md | Read | FR-DSH-006 Data Ops Dashboard |

---

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement | raw/requirement.md | Read | High | Dashboard business requirement |
| Database Design | raw/database_design.md | Read | High | Existing V4 table mapping |
| Wireframe | raw/wireframe.md | Read | High | Dashboard UI |
| Requirement V02 | VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md | Read | High | Dashboard definition |
| Existing Dashboard Standard | docs/architecture | Partial | High | Dashboard architecture |
| Existing Coding Standards | docs/standards | Partial | High | Existing implementation pattern |

---

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| PM Dashboard | Existing project | Read | Dashboard implementation reference |
| QA Dashboard | Existing project | Read | Dashboard implementation reference |
| Developer Dashboard | Existing project | Read | Dashboard implementation reference |
| Connector Module | Existing project | Read | Connector execution |
| Parser Module | Existing project | Read | Parser execution |
| Traceability Module | Existing project | Read | Broken link information |
| Data Quality Module | Existing project | Read | Parser quality |
| Existing Dashboard Components | Existing FE | Read | Reusable UI |

---

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Backend Unit Tests | Existing project | Partial | Existing parser tests |
| Frontend Tests | Existing project | Partial | Existing dashboard pattern |
| Integration Tests | Existing project | Partial | Existing API tests |

---

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| Requirement V02 | Internal | Read only | Primary requirement |
| Existing Dashboard Designs | Internal | Reference only | PM / QA / Developer Dashboard |

---

## Excluded Sources

| source/path | reason |
|---|---|
| .env | Secret |
| target/ | Generated output |
| dist/ | Generated output |
| node_modules/ | Dependency |
| Runtime log | Operational only |

---

## Source Limitations

- Existing connector implementation may evolve.
- Existing parser implementation may change.
- Existing dashboard APIs are partially available.
- Cost calculation is not yet defined.
- Freshness threshold has not been finalized.

---

## Assumptions from Sources

| ID | assumption | basis | risk |
|---|---|---|---|
| A-DATAOPS-1 | Existing V4 schema is sufficient | Current architecture | Low |
| A-DATAOPS-2 | Existing connectors provide execution history | Connector implementation | Low |
| A-DATAOPS-3 | Existing parser provides Data Quality metadata | Parser implementation | Low |
| A-DATAOPS-4 | Existing dashboard layout is reusable | PM/QA Dashboard | Low |
| A-DATAOPS-5 | Existing Traceability implementation can be reused | Existing module | Low |

---

## Human Confirmation Required

| ID | question | impact |
|---|---|---|
| H-DATAOPS-1 | Freshness threshold | Dashboard KPI |
| H-DATAOPS-2 | Connector Health calculation | Dashboard KPI |
| H-DATAOPS-3 | Cost calculation | Dashboard KPI |
| H-DATAOPS-4 | Export requirement | FE scope |
| H-DATAOPS-5 | Broken Link severity rule | Dashboard behavior |