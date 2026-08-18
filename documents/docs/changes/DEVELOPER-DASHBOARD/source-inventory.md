# Source Inventory

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-06-30
**Author**: OpenAI
**Update date**: 2026-06-30

| area                   | path                                                              | type        | owner    | read status | note                        |
| ---------------------- | ----------------------------------------------------------------- | ----------- | -------- | ----------- | --------------------------- |
| Requirement            | `raw/requirement.md`                                              | Markdown    | Internal | Read – full | Primary requirement         |
| Database Design        | `raw/database_design.md`                                          | Markdown    | Internal | Read – full | Existing table mapping      |
| Wireframe              | `raw/wireframe.md`                                                | Markdown    | Internal | Read – full | Dashboard UI                |
| Requirement V02        | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Markdown    | Internal | Partial     | FR-DSH-003, Dashboard 9.4   |
| Architecture Overview  | `docs/architecture/overview.md`                                   | Markdown    | Internal | Partial     | Existing architecture       |
| FE/BE Contract         | `docs/architecture/fe-be-contract-map.md`                         | Markdown    | Internal | Partial     | Existing REST contract      |
| Repository DB Map      | `docs/architecture/repository-db-map.md`                          | Markdown    | Internal | Partial     | Existing repositories       |
| V4 Database            | `db/migration/V4__init_shema_v2.sql`                              | SQL         | Internal | Read        | Existing V4 schema          |
| Existing Dashboard     | Existing project                                                  | Source Code | Internal | Partial     | PM / QA Dashboard reference |
| Existing CI Parser     | Existing project                                                  | Source Code | Internal | Partial     | Existing aggregation        |
| Existing Review Parser | Existing project                                                  | Source Code | Internal | Partial     | Existing aggregation        |
| Existing Parser Error  | Existing project                                                  | Source Code | Internal | Partial     | Existing parser result      |
| Existing Tests         | Existing project                                                  | Source Code | Internal | Partial     | Existing testing pattern    |

---

## Important Files

Files that must be confirmed before implementation.

| priority | file                              | reason                     |
| -------- | --------------------------------- | -------------------------- |
| P0       | Existing Dashboard implementation | Dashboard architecture     |
| P0       | Existing REST Controller          | REST pattern               |
| P0       | Existing Service                  | Business pattern           |
| P0       | Existing Repository               | Read-only query pattern    |
| P0       | `V4__init_shema_v2.sql`           | Existing tables            |
| P1       | Existing DTO                      | Existing response contract |
| P1       | Existing FE Dashboard             | UI reuse                   |
| P1       | Existing Logging                  | Existing TraceId           |

---

## Generated / Excluded Files

| path            | reason       |
| --------------- | ------------ |
| `.env`          | Secret       |
| `target/`       | Generated    |
| `dist/`         | Generated    |
| `node_modules/` | Dependency   |
| Build output    | Generated    |
| Runtime log     | Runtime only |

---

## Missing Files

Files expected to be created during implementation.

| file                         | layer | note               |
| ---------------------------- | ----- | ------------------ |
| DeveloperDashboardController | BE    | REST Controller    |
| DeveloperDashboardService    | BE    | Aggregation        |
| DeveloperDashboardRepository | BE    | Read-only queries  |
| DeveloperDashboardDtos       | BE    | Response DTO       |
| DeveloperDashboardPage       | FE    | Dashboard page     |
| Dashboard API                | FE    | API helper         |
| Dashboard Types              | FE    | Response model     |
| Dashboard Tests              | FE/BE | Unit & Integration |
