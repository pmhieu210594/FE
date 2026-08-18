# Sources

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| SECURITY-DASHBOARD | `docs/changes/SECURITY-DASHBOARD` | Read | Ticket working directory |
| Requirement V02 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Read | Security Dashboard requirements |

---

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement | `raw/requirement.md` | Read | High | Business requirement |
| Database Design | `raw/database_design.md` | Read | High | Existing V4 table mapping |
| Wireframe | `raw/wireframe.md` | Read | High | Dashboard UI |
| Requirement V02 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Read | High | Security Dashboard definition |
| Existing Dashboard Standard | `docs/architecture/` | Partial | High | Existing dashboard architecture |
| Existing Coding Standards | `docs/standards/` | Partial | High | Existing implementation rules |

---

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| PM Dashboard | Existing project | Read | Dashboard implementation reference |
| QA Dashboard | Existing project | Read | Dashboard implementation reference |
| Developer Dashboard | Existing project | Read | Dashboard implementation reference |
| Data Ops Dashboard | Existing project | Read | Dashboard implementation reference |
| Safety Pack Module | Existing project | Read | Safety Pack status |
| Security Scan Module | Existing project | Read | Secret Scan / SAST / SCA |
| Security Checklist Parser | Existing project | Read | Checklist parser |
| Security Exception Module | Existing project | Read | Exception summary |
| Existing Dashboard Components | Existing FE | Read | Reusable UI |

---

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Backend Unit Tests | Existing project | Partial | Existing dashboard tests |
| Frontend Tests | Existing project | Partial | Existing dashboard pattern |
| Integration Tests | Existing project | Partial | Existing API pattern |

---

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| Requirement V02 | Internal | Read only | Primary requirement |
| Existing Dashboard Designs | Internal | Reference only | PM / QA / Dev / Data Ops Dashboard |

---

## Excluded Sources

| source/path | reason |
|---|---|
| `.env` | Secret |
| `target/` | Generated output |
| `dist/` | Generated output |
| `node_modules/` | Dependency |
| Runtime log | Operational only |

---

## Source Limitations

- Existing Security Checklist implementation may evolve.
- Existing Security Scan schema may change.
- Existing Dashboard APIs are partially available.
- Final Security Verdict calculation is not defined.
- Security Alert rule is not defined.
- Exception priority rule is not finalized.

---

## Assumptions from Sources

| ID | assumption | basis | risk |
|---|---|---|---|
| A-SECURITY-1 | Existing V4 schema is sufficient | Current architecture | Low |
| A-SECURITY-2 | Existing Safety Pack module is reusable | Existing implementation | Low |
| A-SECURITY-3 | Existing Security Scan module is reusable | Existing implementation | Low |
| A-SECURITY-4 | Existing Dashboard layout is reusable | PM / QA / Dev Dashboard | Low |
| A-SECURITY-5 | Existing Security Checklist parser is reusable | Parser implementation | Low |

---

## Human Confirmation Required

| ID | question | impact |
|---|---|---|
| H-SECURITY-1 | Final Security Verdict calculation | Dashboard KPI |
| H-SECURITY-2 | Security Alert calculation | Dashboard KPI |
| H-SECURITY-3 | Exception priority rule | Dashboard behavior |
| H-SECURITY-4 | Export requirement | FE scope |
| H-SECURITY-5 | Should Security Checklist Warning affect Final Verdict? | Business Rule |