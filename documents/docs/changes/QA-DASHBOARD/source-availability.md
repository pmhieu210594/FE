# Source Availability

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26  
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| QA Dashboard Requirement | `raw/requirement.md` | read | high | OpenAI | Primary implementation basis; AC-QA-1 through AC-QA-12 | — | always-read |
| QA Dashboard Database Design | `raw/database_design.md` | read | high | OpenAI | Table mapping, no-new-tables policy, suggested queries | — | always-read |
| QA Dashboard Wireframe | `raw/wireframe.md` | read | high | OpenAI | Layout: 6 KPI cards, ticket list, detail drawer, filter panel | — | always-read |
| Architecture Overview | `docs/architecture/overview.md` | read | high | Internal | System context, hexagonal arch layers, tech stack | — | always-read |
| FE/BE Contract Map | `docs/architecture/fe-be-contract-map.md` | read | high | Internal | Existing endpoints, DTO shapes, role enum values | — | always-read |
| Route API Map | `docs/architecture/route-api-map.md` | partial (§1–7) | high | Internal | Confirms no `/api/v1/dashboard/**`; all current HTTP routes | §8+ not read | required-if-api |
| Repository DB Map | `docs/architecture/repository-db-map.md` | partial (§1–4) | high | Internal | V4 table list; confirms tbl_fact_* adapters do not exist | §5+ not read | required-if-db |
| V4 DB Migration SQL | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | **read — full (Phase 3)** | high | Internal | 40+ tbl_dim_/tbl_fact_/tbl_auth_ tables; column names | Tất cả columns đã xác nhận cho tbl_fact_test_run, tbl_fact_artifact_parsed_section, tbl_fact_artifact_snapshot, tbl_fact_traceability_link, tbl_fact_ac_test_coverage, tbl_fact_acceptance_criteria | confirmed |
| SDD Evidence V02 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | partial (Ch.7–9) | high | Internal | Ch.9.3 QA Dashboard cards; Ch.8.2 quality KPIs | Ch.1–6 and Ch.10+ not read | verify-with-source |
| Service Layer Map | `docs/architecture/service-layer-map.md` | unavailable | medium | Internal | Service mapping detail | Not read (deferred to Phase 3) | verify-with-source |
| Data Flow Map | `docs/architecture/data-flow-map.md` | unavailable | medium | Internal | Data flow detail | Not read (deferred to Phase 3) | verify-with-source |
| Coding Standards | `docs/standards/*.md` | unavailable | medium | Internal | Convention reference | Not read; apply at Phase 3 | verify-with-source |
| BE Source Code (REST/DTO/Adapter) | `EDCAP_BE/web/rest/*.java`, `web/dto/Dtos.java`, `infrastructure/persistence/adapter/` | **read — partial (Phase 3)** | high | Internal | PmDashboardController, PmDashboardService, PmDashboardRepositoryPort, PmDashboardJdbcAdapter, PmDashboardDtos đã read — phát hiện JDBC pattern (không MyBatis) | PM Dashboard dùng NamedParameterJdbcTemplate; QA Dashboard follow JDBC pattern | confirmed |
| FE Source Code | `EDCAP_FE/src/lib/api.ts`, `src/pages/qa-dashboard/*.tsx` | **read — partial (Phase 3)** | high | Internal | QADashboardPage.tsx, types.ts, api.ts (pmDashboard section) đã read | FE components xác nhận đã built; field names khớp spec-pack §11; mock data import confirmed | confirmed |
| BE Tests | `EDCAP_BE/**/*Test.java` | unavailable | low | Internal | ArchUnit rules; existing test patterns | Not in Phase 1 scope | skip-phase1 |
| FE Tests | `EDCAP_FE/src/**/*.test.*` | unavailable | low | Internal | Playwright installed; no existing tests | Not in Phase 1 scope | skip-phase1 |
| `.env` | `.env` | not-read | — | Internal | Contains secrets | Secrets leak | never-read |

## Summary (Updated Phase 3 — 2026-06-26)

- All **primary requirement sources** (requirement, database_design, wireframe) read in full.
- **V4 migration SQL** read in full at Phase 3 — all columns confirmed for target tables.
- **PM Dashboard BE pattern** read in full — key finding: uses JDBC (NamedParameterJdbcTemplate), NOT MyBatis. Decision: QA Dashboard adapter follows JDBC pattern.
- **FE source files** read: QADashboardPage.tsx, types.ts, api.ts (pmDashboard section) — FE wire-up requirements confirmed.
- **Remaining gap**: `section_type` value cho blackbox viewpoints in `tbl_fact_artifact_parsed_section` — must confirm from parser source before writing adapter SQL (Stop condition).

## Unavailable / Partial Sources

| source | missing part | impact | when to fix |
|---|---|---|---|
| Route API Map | §8+ not read | Unknown route conflicts may exist | Phase 3 — before creating DashboardController |
| Repository DB Map | §5+ not read | Unknown adapters may already exist | Phase 3 — before creating DashboardQueryAdapter |
| V4 Migration SQL | Not read directly | Column names unverified — cannot write JPA/SQL mapper | Phase 3 — **required before writing any mapper** |
| SDD V02 | Ch.1–6, Ch.10+ not read | Additional KPI or business rules may be missing | Phase 3 — read when KPI logic verification is needed |
| Service Layer Map | Not read | Missing service boundary details | Phase 3 — before designing service interface |
| Data Flow Map | Not read | Missing understanding of data pipeline triggers | Phase 3 — when designing the refresh mechanism |
| BE/FE Source Code | Not read directly | Column names and method signatures not verified | Phase 3 — read each file during implementation |

## Risk Before Implementation

| # | risk | source gap | impact | mitigation |
|---|---|---|---|---|
| R-1 | V4 adapter gap | tbl_fact_test_run, tbl_fact_finding, tbl_fact_traceability_link, tbl_fact_artifact_parsed_section, tbl_fact_ci_run, tbl_fact_exception have no Java adapters | Must create many new adapters — higher effort than expected | Read V4 SQL + repository-db-map §5+ at Phase 3 before estimating |
| R-2 | Column names not verified | V4 migration SQL not read directly | Incorrect mapper causes compile/runtime error | **MUST read V4__init_shema_v2.sql before writing any JPQL/SQL** |
| R-3 | No dashboard endpoint exists | fe-be-contract-map confirms no `/api/v1/dashboard/**` | Entirely new contract — no direct pattern to follow | Follow OrganizationController / OrganizationService pattern |
| R-4 | Role gap | Dtos.java has only VIEWER / EDITOR / ADMIN | QA user and PM user do not map to any existing role | See HC-1 (Required Human Decision) |
| R-5 | Sprint field unconfirmed | Requirement and wireframe mention Sprint filter but it is absent from DB docs | May need to implement as date-range instead of sprint column | See HC-3 |

## Required Human Decision

| HC | question | impact | blocker |
|---|---|---|---|
| HC-1 | Which role does QA user map to? New role value or existing VIEWER/EDITOR? | Access control gate on FE route and BE endpoint | Yes — must know before implementing auth guard |
| HC-2 | Admin PM Dashboard tab: visible-but-disabled or completely hidden until PM ticket exists? | FE tab container scope | Should know before Phase 3 FE |
| HC-3 | Is Sprint a stored column in tbl_dim_ticket or a derived date-range filter? | Filter implementation | Yes — must know before writing SQL filter |
| HC-4 | Release Readiness: what is the exact threshold distinguishing PARTIAL from NOT_READY? | Core KPI logic | Should know before implementing readiness service |
| HC-5 | Coverage Trend chart (visible in wireframe): is it in scope for this ticket? | FE component scope | Yes — affects estimate |
| HC-6 | Export button: in scope, visible-disabled, or hidden? | FE button scope | Should know before Phase 3 FE |
| HC-7 | Defect Leakage: how are "production defects" vs "QA defects" distinguished in the finding/review tables? | KPI calculation | Yes — must know before writing the leakage query |
