# Source Inventory

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Requirement | `raw/requirement.md` | Markdown | Internal | Read | Business requirement |
| Database Design | `raw/database_design.md` | Markdown | Internal | Read | Existing V4 table mapping |
| Wireframe | `raw/wireframe.md` | Markdown | Internal | Read | Dashboard layout |
| Requirement V02 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Markdown | Internal | Partial | Security Dashboard definition |
| Architecture | `docs/architecture/` | Markdown | Internal | Partial | Existing Dashboard architecture |
| Dashboard Standards | `docs/standards/` | Markdown | Internal | Partial | Existing coding pattern |
| PM Dashboard | Existing project | Source | Internal | Read | Dashboard reference |
| QA Dashboard | Existing project | Source | Internal | Read | Dashboard reference |
| Developer Dashboard | Existing project | Source | Internal | Read | Ticket-based Dashboard reference |
| Data Ops Dashboard | Existing project | Source | Internal | Read | Metadata aggregation reference |
| Safety Pack Module | Existing project | Source | Internal | Read | Safety metadata |
| Security Scan Module | Existing project | Source | Internal | Read | Secret Scan / SAST / SCA |
| Security Checklist Parser | Existing project | Source | Internal | Read | Parsed checklist |
| Security Exception Module | Existing project | Source | Internal | Read | Exception metadata |
| Existing Tests | Existing project | Test | Internal | Partial | Existing dashboard testing pattern |
| Existing Database | `V4__init_schema_v2.sql` | SQL | Internal | Read | Existing V4 schema |

---

## Important Files

Priority files to verify before implementation.

| priority | file | reason |
|---|---|---|
| P0 | Existing Dashboard Controller | REST implementation pattern |
| P0 | Existing Dashboard Service | Aggregation pattern |
| P0 | Existing Dashboard Repository | Read-only SQL pattern |
| P0 | Existing Dashboard DTO | Existing response contract |
| P0 | Existing Dashboard Components | FE reuse |
| P0 | Safety Pack implementation | KPI aggregation |
| P0 | Security Scan implementation | Secret / SAST / SCA |
| P0 | Security Checklist Parser | Checklist aggregation |
| P0 | Security Exception implementation | Exception aggregation |
| P0 | Existing V4 Schema | Existing database |

---

## Generated / Excluded Files

| path | reason |
|---|---|
| `.env` | Secret |
| `target/` | Generated |
| `dist/` | Generated |
| `node_modules/` | Dependency |
| Runtime logs | Runtime only |
| Build artifacts | Generated output |

---

## Missing Files

Files expected to be created during implementation.

| file | layer | note |
|---|---|---|
| SecurityDashboardController | Backend | REST Controller |
| SecurityDashboardService | Backend | Aggregation Service |
| SecurityDashboardRepository | Backend | Read-only Repository |
| SecurityDashboardDtos | Backend | Response DTO |
| SecurityDashboardPage | Frontend | Dashboard Page |
| SecuritySummaryCards | Frontend | KPI Cards |
| SecurityFilterBar | Frontend | Filter Component |
| SecurityTicketTable | Frontend | Ticket Table |
| SecurityTicketDetailDrawer | Frontend | Drawer |
| Dashboard API Helper | Frontend | API endpoints |
| Dashboard Tests | FE / BE | Unit & Integration Tests |