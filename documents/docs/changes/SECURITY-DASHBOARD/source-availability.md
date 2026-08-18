# Source Availability

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Security Dashboard Requirement | `raw/requirement.md` | Read | High | Internal | Primary business requirement | None | always-read |
| Security Dashboard Database Design | `raw/database_design.md` | Read | High | Internal | Existing V4 table mapping | None | always-read |
| Security Dashboard Wireframe | `raw/wireframe.md` | Read | High | Internal | Dashboard layout | None | always-read |
| Requirement V02 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Partial | High | Internal | Security Dashboard definition | Partial scope | verify-with-source |
| Architecture Overview | `docs/architecture/overview.md` | Partial | High | Internal | Existing Dashboard architecture | Partial | required-if-api |
| FE/BE Contract | `docs/architecture/fe-be-contract-map.md` | Partial | High | Internal | Existing REST contract | Partial | required-if-api |
| Repository DB Map | `docs/architecture/repository-db-map.md` | Partial | High | Internal | Existing Repository mapping | Partial | required-if-db |
| V4 Database Definition | `db/migration/V4__init_schema_v2.sql` | Read | High | Internal | Existing database schema | None | always-read |
| Existing PM Dashboard | Existing project | Partial | High | Internal | Dashboard reference | Low | reference |
| Existing QA Dashboard | Existing project | Partial | High | Internal | Dashboard reference | Low | reference |
| Existing Developer Dashboard | Existing project | Read | High | Internal | Ticket-based dashboard reference | Low | reference |
| Existing Data Ops Dashboard | Existing project | Read | High | Internal | Metadata aggregation reference | Low | reference |
| Safety Pack Module | Existing project | Read | High | Internal | Safety metadata | Low | reference |
| Security Scan Module | Existing project | Read | High | Internal | Secret Scan / SAST / SCA | Low | reference |
| Security Checklist Parser | Existing project | Read | High | Internal | Checklist metadata | Low | reference |
| Security Exception Module | Existing project | Read | High | Internal | Exception metadata | Low | reference |
| Existing Tests | Existing project | Partial | Medium | Internal | Dashboard testing pattern | Partial | verify-before-test |

---

## Summary

Business requirements are available.

Database design is available.

Wireframe is available.

Existing Dashboard architecture is available.

Existing Security modules are reusable.

The Security Dashboard can be implemented without introducing new persistence.

---

## Unavailable / Partial Sources

| source | missing part | impact | when to fix |
|---|---|---|---|
| Existing Dashboard APIs | Exact endpoint implementation | Medium | Before implementation |
| Existing Repository classes | Actual Repository methods | Medium | Phase 3 |
| Existing DTO classes | Existing response structure | Medium | Phase 3 |
| Existing FE Components | Internal implementation details | Low | Phase 3 |
| Final Security Verdict | Business rule | High | Before implementation |
| Security Alert | KPI calculation | High | Before implementation |

---

## Risk Before Implementation

| ID | risk | impact | mitigation |
|---|---|---|---|
| R-1 | Existing Dashboard architecture changes | Medium | Verify latest implementation |
| R-2 | Existing Security Scan schema changes | High | Verify current schema |
| R-3 | Existing Safety Pack schema changes | Medium | Verify current implementation |
| R-4 | Existing Security Checklist parser output changes | Medium | Verify parser output |
| R-5 | Existing Exception schema changes | Medium | Verify current implementation |
| R-6 | Final Security Verdict undefined | High | Human Decision before implementation |

---

## Required Human Decision

| ID | decision | impact | blocker |
|---|---|---|---|
| H-SECURITY-1 | Final Security Verdict calculation | Dashboard KPI | Yes |
| H-SECURITY-2 | Security Alert rule | Dashboard KPI | Yes |
| H-SECURITY-3 | Exception priority | Dashboard behavior | No |
| H-SECURITY-4 | Export capability | FE | No |
| H-SECURITY-5 | Checklist weighting | Dashboard calculation | Yes |