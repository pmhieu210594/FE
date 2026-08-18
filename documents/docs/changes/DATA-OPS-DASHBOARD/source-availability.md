# Source Availability

**Ticket ID**: DATA-OPS-DASHBOARD
**Create date**: 2026-07-02
**Author**: Claude
**Update date**: 2026-07-02

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Spec Pack | `docs/changes/DATA-OPS-DASHBOARD/spec-pack.md` | read | high | Internal | AC / scope / BR | Spec has an internal gap (see below) | always-read |
| Context | `docs/changes/DATA-OPS-DASHBOARD/context.md` | read | high | Internal | Allowed/forbidden components, table mapping | — | always-read |
| Ticket Rules | `docs/changes/DATA-OPS-DASHBOARD/ticket-rules.md` | read | high | Internal | Must/must-not, stop conditions | — | always-read |
| V4 Database Schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read (targeted grep) | high | Internal | Verify existing tables/columns | None — confirmed | always-read |
| Developer Dashboard (BE) | `EDCAP_BE/src/main/java/com/sdd/platform/**/devdashboard/*`, `DevDashboardJdbcAdapter.java` | partial | high | Internal | Primary pattern reference — live aggregation, no snapshot table | Low | required-before-implementation |
| PM Dashboard (BE) | `EDCAP_BE/src/main/java/com/sdd/platform/**/pmdashboard/*` | partial | high | Internal | Secondary reference — uses a snapshot table, **not** the pattern to copy | Medium (misleading if followed literally) | reference-only |
| QA Dashboard (BE) | `EDCAP_BE/src/main/java/com/sdd/platform/**/qadashboard/*` | not read | medium | Internal | Secondary reference | Low | reference-only |
| Developer Dashboard (FE) | `EDCAP_FE/src/pages/development-dashboard/**` | partial | high | Internal | Page/component/hook pattern | Low | required-before-implementation |
| API helper | `EDCAP_FE/src/lib/api.ts` | partial | high | Internal | Existing `endpoints.*Dashboard` convention | Low | required-before-implementation |
| Dashboard shell / routing | `EDCAP_FE/src/components/dashboard/RoleTabs.tsx`, `EDCAP_FE/src/components/Layout.tsx` | not read | medium | Internal | Tab/route registration point | Medium | required-before-implementation |
| Architecture — FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | not read | high | Internal | Confirm contract conventions | Medium | required-if-api |
| Architecture — route/API map | `docs/architecture/route-api-map.md` | not read | high | Internal | Confirm no endpoint prefix collision | Medium | required-if-api |
| Architecture — repository/DB map | `docs/architecture/repository-db-map.md` | not read | high | Internal | Confirm repository layering conventions | Low | required-if-db |
| Standards (backend/frontend/api-contract/testing/security) | `docs/standards/*.md` | not read | high | Internal | Coding/testing/security conventions | Low | required-during-implementation |
| Existing BE test pattern | `QaDashboardServiceTest.java` (`src/test/java`), `PmDashboardServiceTest.java` (`src/test/UnitTest/java`) | not read | medium | Internal | Confirm correct test source root | Medium | verify-before-test |
| Existing FE test pattern | `EDCAP_FE/src/__ tests __/dev-dashboard/*.test.tsx` | not read | medium | Internal | Confirm Vitest pattern | Low | verify-before-test |

---

## Summary

Spec, context, and ticket-rules for DATA-OPS-DASHBOARD are complete and internally consistent, **except** for one gap noted below. The database schema is fully verified — all 6 tables named in `context.md` exist with the expected columns. A concrete, already-implemented precedent exists (Developer Dashboard) that satisfies the "no migration / no new persistence" constraint; this should be the pattern followed, not PM Dashboard (which relies on a snapshot table requiring Flyway migrations).

---

## Unavailable / Partial Sources

| source | missing part | impact | when to fix |
|---|---|---|---|
| Dev Dashboard Service/Controller/DTO — full body | Only greped/summarized, not fully read | Medium | Before writing Step 2–4 of impl-plan (Phase 4 implementation) |
| `RoleTabs.tsx` / `Layout.tsx` | Not read — exact tab registration mechanism unconfirmed | Medium | Before FE Step 5 |
| `docs/architecture/route-api-map.md`, `fe-be-contract-map.md` | Not read — endpoint prefix collision unconfirmed | Medium | Before finalizing Controller `@RequestMapping` |
| Security Alerts data source | Spec-pack scope (2.1) lists "Security Alerts" as in-range, but Output table (6.3) and AC list (7) do not define it. `tbl_fact_artifact_snapshot.contains_secret_detected` is a candidate source but unconfirmed | High — blocks 1 of 7 scoped KPIs | Before implementation — **Human Decision required** |
| Cost Summary data source | Same gap as above — scope lists it, no Output/AC/table maps it. H-DATAOPS-3 already flags this as Open | High — blocks 1 of 7 scoped KPIs | Before implementation — **Human Decision required** |

---

## Risk Before Implementation

| ID | risk | impact | mitigation |
|---|---|---|---|
| R-1 | Confusing PM Dashboard's snapshot-table pattern with the required no-migration pattern | High | Follow Developer Dashboard's live-aggregation JDBC adapter, not PM Dashboard's |
| R-2 | Security Alerts / Cost Summary KPIs are in scope but undefined in Output/AC | High | Raise as Human Decision before implementing those 2 KPIs; implement the other 5 KPIs first |
| R-3 | Two BE test source roots exist (`src/test/java` vs `src/test/UnitTest/java`) | Medium | Confirm with existing build config (`pom.xml` test source paths) before adding new test class |
| R-4 | Endpoint prefix collision with an existing dashboard route | Low | Verify `docs/architecture/route-api-map.md` before finalizing `@RequestMapping` |
| R-5 | Aggregation query performance across 6 tables without a snapshot, at higher data volume | Low | Existing Dev Dashboard already aggregates 5+ fact tables live; reuse its indexing assumptions |

---

## Required Human Decision

| ID | decision | impact | blocker |
|---|---|---|---|
| H-DATAOPS-1 | Freshness threshold (from spec-pack §16) | BE KPI | No |
| H-DATAOPS-2 | Connector Health calculation (from spec-pack §16) | BE KPI | No |
| H-DATAOPS-3 | Cost calculation (from spec-pack §16) | BE KPI | Yes — no data source mapped |
| H-DATAOPS-4 (new) | Security Alerts data source/definition — scope says in-range, Output/AC do not define it | BE KPI | Yes — no data source mapped |
