# Source Inventory

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26  
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Requirement | `EDCAP_BE/documents/docs/changes/QA-DASHBOARD/raw/requirement.md` | Markdown | OpenAI | Read – full | Primary ticket body; AC-QA-1 through AC-QA-12; scope, BR, data items |
| Database Design | `EDCAP_BE/documents/docs/changes/QA-DASHBOARD/raw/database_design.md` | Markdown | OpenAI | Read – full | Table mapping, suggested queries, no-new-tables policy, index recommendations |
| Wireframe | `EDCAP_BE/documents/docs/changes/QA-DASHBOARD/raw/wireframe.md` | Markdown | OpenAI | Read – full | Screen layout: 6 KPI cards, ticket list, detail drawer, filter panel |
| Architecture Overview | `EDCAP_BE/documents/docs/architecture/overview.md` | Markdown | Internal | Read – full | Hexagonal arch layers, tech stack, DB schema summary |
| FE/BE Contract Map | `EDCAP_BE/documents/docs/architecture/fe-be-contract-map.md` | Markdown | Internal | Read – full | All existing endpoints, DTO shapes, role enum: VIEWER/EDITOR/ADMIN |
| Route API Map | `EDCAP_BE/documents/docs/architecture/route-api-map.md` | Markdown | Internal | Partial (§1–7) | All current HTTP routes; no dashboard endpoint found |
| Repository DB Map | `EDCAP_BE/documents/docs/architecture/repository-db-map.md` | Markdown | Internal | Partial (§1–4) | V4 table list; AppUser/Artifact/CiRun/Ticket/Org/Team adapters exist; tbl_fact_* adapters missing |
| SDD Evidence V02 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Markdown | Internal | Partial (Ch.7–9) | Ch.9.3 QA Dashboard card definitions; Ch.8.2 quality KPI definitions |
| V4 DB Migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | SQL | Internal | **Read – full (Phase 3)** | tbl_fact_test_run, tbl_fact_artifact_parsed_section, tbl_fact_artifact_snapshot, tbl_fact_traceability_link, tbl_fact_ac_test_coverage, tbl_fact_acceptance_criteria — tất cả columns xác nhận |
| Service Layer Map | `EDCAP_BE/documents/docs/architecture/service-layer-map.md` | Markdown | Internal | Not read | Service mapping detail; deferred to Phase 3 |
| Data Flow Map | `EDCAP_BE/documents/docs/architecture/data-flow-map.md` | Markdown | Internal | Not read | Data pipeline / refresh triggers; deferred to Phase 3 |
| Coding Standards | `EDCAP_BE/documents/docs/standards/*.md` | Markdown | Internal | Not read | Convention reference; apply at Phase 3 |
| BE REST layer | `EDCAP_BE/web/rest/*.java` | Java | Internal | Not read (referenced) | No DashboardController exists; OrganizationController is the pattern to follow |
| BE DTO | `EDCAP_BE/web/dto/Dtos.java` | Java | Internal | Not read (referenced) | Role enum VIEWER/EDITOR/ADMIN; verify before adding new role |
| BE Adapters (existing) | `EDCAP_BE/infrastructure/persistence/adapter/` | Java | Internal | Not read (referenced) | AppUserAdapter, ArtifactAdapter, CiRunAdapter, TicketAdapter, OrgAdapter, TeamAdapter |
| FE API helpers | `EDCAP_FE/src/lib/api.ts` | TypeScript | Internal | Not read (referenced) | No dashboard endpoints; modify at Phase 3 |
| FE Page routing | `EDCAP_FE/src/pages/*.tsx` | TypeScript | Internal | Not read (referenced) | No dashboard page; AdminPage / OrganizationPage are the patterns to follow |
| BE Tests | `EDCAP_BE/**/*Test.java` | Java | Internal | Not read | ArchUnit layer rules enforced; not in Phase 1 scope |
| FE Tests | `EDCAP_FE/src/**/*.test.*` | TypeScript | Internal | Not read | Playwright installed; no existing tests |

## Important Files

Files that **must be read before starting implementation** (Phase 3):

| priority | file | reason |
|---|---|---|
| P0 | `EDCAP_BE/db/migration/V4__init_shema_v2.sql` | Verify column names before writing any JPA/SQL mapper |
| P0 | `EDCAP_BE/web/rest/OrganizationController.java` | Pattern reference for the new DashboardController |
| P0 | `EDCAP_BE/application/service/OrganizationService.java` | Pattern reference for the new DashboardService |
| P1 | `EDCAP_BE/documents/docs/architecture/route-api-map.md` §8+ | Verify no route conflicts |
| P1 | `EDCAP_BE/documents/docs/architecture/repository-db-map.md` §5+ | Verify no existing adapter already covers this |
| P1 | `EDCAP_BE/web/dto/Dtos.java` | Read directly to verify role enum before adding access guard |
| P2 | `EDCAP_BE/documents/docs/architecture/service-layer-map.md` | Service boundaries before designing UseCase interface |
| P2 | `EDCAP_BE/documents/docs/standards/*.md` | Coding conventions before writing code |

## Generated / Excluded Files

| path | reason |
|---|---|
| `.env` | Contains secrets; must not be read under any circumstances |
| `EDCAP_BE/target/` | Build output; generated |
| `EDCAP_FE/node_modules/` | Dependencies; generated |
| `EDCAP_FE/dist/` | FE build output; generated |
| CI logs / DB dumps | Not available in the repository |

## Missing Files

Files that **do not yet exist** and must be created at Phase 3:

| file | layer | note |
|---|---|---|
| `EDCAP_BE/web/rest/DashboardController.java` | Controller (Web) | Expose `GET /api/v1/dashboard/qa` |
| `EDCAP_BE/application/port/in/GetQaDashboardUseCase.java` | Port In | Use case interface |
| `EDCAP_BE/application/port/out/DashboardQueryPort.java` | Port Out | DB query interface |
| `EDCAP_BE/application/service/DashboardService.java` | Service | Aggregate KPIs; implement business logic |
| `EDCAP_BE/infrastructure/persistence/adapter/DashboardQueryAdapter.java` | Adapter (DB) | Implement DashboardQueryPort; query tbl_fact_* |
| `EDCAP_BE/web/dto/DashboardDtos.java` (or extend Dtos.java) | DTO | Response DTOs for dashboard API |
| `EDCAP_FE/src/pages/DashboardPage.tsx` | FE Page | QA Dashboard landing page |
| `EDCAP_FE/src/components/dashboard/` | FE Components | KPI cards, ticket list, detail drawer, filter panel |
| `EDCAP_FE/src/lib/dashboard-api.ts` (or extend api.ts) | FE API | Dashboard endpoint helpers |
