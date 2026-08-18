# Source Availability

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-06-30
**Author**: OpenAI
**Update date**: 2026-06-30

| source                              | path                                                              | read_status | trust_level | owner    | purpose                            | risk               | action             |
| ----------------------------------- | ----------------------------------------------------------------- | ----------- | ----------- | -------- | ---------------------------------- | ------------------ | ------------------ |
| Developer Dashboard Requirement     | `raw/requirement.md`                                              | read        | high        | Internal | Primary business requirement       | —                  | always-read        |
| Developer Dashboard Database Design | `raw/database_design.md`                                          | read        | high        | Internal | Database mapping                   | —                  | always-read        |
| Developer Dashboard Wireframe       | `raw/wireframe.md`                                                | read        | high        | Internal | Screen layout                      | —                  | always-read        |
| SDD Evidence Requirement V02        | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | partial     | high        | Internal | FR-DSH-003, Dashboard 9.4          | Partial scope only | verify-with-source |
| Architecture Overview               | `docs/architecture/overview.md`                                   | partial     | high        | Internal | Hexagonal architecture             | Partial            | required-if-api    |
| FE/BE Contract                      | `docs/architecture/fe-be-contract-map.md`                         | partial     | high        | Internal | Existing REST/API pattern          | Partial            | required-if-api    |
| Repository DB Map                   | `docs/architecture/repository-db-map.md`                          | partial     | high        | Internal | Existing database mapping          | Partial            | required-if-db     |
| V4 Database Definition              | `db/migration/V4__init_shema_v2.sql`                              | read        | high        | Internal | Verify existing tables             | None               | always-read        |
| Existing PM Dashboard               | Existing source                                                   | partial     | high        | Internal | Dashboard implementation reference | Partial            | reference          |
| Existing QA Dashboard               | Existing source                                                   | partial     | high        | Internal | Dashboard implementation reference | Partial            | reference          |
| Existing CI Parser                  | Existing source                                                   | partial     | high        | Internal | CI aggregation                     | Partial            | reference          |
| Existing Review Parser              | Existing source                                                   | partial     | high        | Internal | Review aggregation                 | Partial            | reference          |
| Existing Parser Error               | Existing source                                                   | partial     | high        | Internal | Parser status                      | Partial            | reference          |
| Existing Tests                      | Existing project                                                  | partial     | medium      | Internal | Reuse testing pattern              | Partial            | verify-before-test |

---

## Summary

Primary functional requirements are available.

Database structure is available.

Existing dashboard implementation patterns are available.

Developer Dashboard can reuse the existing architecture.

---

## Unavailable / Partial Sources

| source                      | missing part                    | impact | when to fix           |
| --------------------------- | ------------------------------- | ------ | --------------------- |
| Existing Dashboard APIs     | Exact endpoint implementation   | Medium | Before implementation |
| Existing Repository classes | Actual repository methods       | Medium | Phase 3               |
| Existing DTO classes        | Existing response structure     | Medium | Phase 3               |
| Existing FE Components      | Internal implementation details | Low    | Phase 3               |

---

## Risk Before Implementation

| ID  | risk                                      | impact | mitigation                           |
| --- | ----------------------------------------- | ------ | ------------------------------------ |
| R-1 | Existing dashboard implementation differs | Medium | Verify existing source               |
| R-2 | Repository schema differs                 | High   | Read V4 schema before implementation |
| R-3 | Existing REST contract changes            | Medium | Verify FE/BE contract                |
| R-4 | CI status mapping changes                 | Medium | Verify current enum                  |
| R-5 | Parser status mapping changes             | Medium | Verify parser implementation         |

---

## Required Human Decision

| ID                | decision                  | impact | blocker |
| ----------------- | ------------------------- | ------ | ------- |
| H-DEV-DASHBOARD-1 | Export scope              | FE     | No      |
| H-DEV-DASHBOARD-2 | Refresh interval          | FE     | No      |
| H-DEV-DASHBOARD-3 | CI Failure categorization | BE     | Yes     |
| H-DEV-DASHBOARD-4 | Parser Warning handling   | BE     | Yes     |
