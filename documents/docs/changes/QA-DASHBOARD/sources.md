# Sources

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26

---

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| QA-DASHBOARD Requirement | `raw/requirement.md` | Read – full | Primary ticket body; AC-QA-1 through AC-QA-12 defined here |

---

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| QA Dashboard Requirement | `raw/requirement.md` | Read – full | High | Functional requirements, BR, AC, data items, out-of-scope |
| QA Dashboard Database Design | `raw/database_design.md` | Read – full | High | Table mapping, suggested queries, no new tables policy |
| QA Dashboard Wireframe | `raw/wireframe.md` | Read – full | High | Screen layout, 6 cards, ticket list, detail drawer, filter panel |
| SDD Evidence Platform Requirements V02 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Read – partial (TOC + Ch.7–9) | High | Authoritative system context; Ch.9.3 defines QA Dashboard cards; Ch.8.2 defines KPIs |
| Architecture Overview | `docs/architecture/overview.md` | Read – full | High | System context, hexagonal arch layers, DB schema summary, tech stack |
| FE/BE Contract Map | `docs/architecture/fe-be-contract-map.md` | Read – full | High | Existing endpoints, DTO shapes, role values, known gaps |
| Route API Map | `docs/architecture/route-api-map.md` | Read – partial (§1–7) | High | All current HTTP routes; confirmed no dashboard endpoint exists |
| Repository DB Map | `docs/architecture/repository-db-map.md` | Read – partial (§1–4) | High | V4 table existence confirmed; most tbl_fact_* adapters missing |

---

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| Current API routes | `EDCAP_BE/web/rest/*.java` | Referenced via route-api-map | No existing `/api/v1/dashboard/**` endpoint found |
| V4 DB migration | `db/migration/V4__init_shema_v2.sql` | Referenced via repository-db-map | 40+ tbl_dim_/tbl_fact_/tbl_auth_ tables defined; column names not yet verified |
| Existing adapters | `infrastructure/persistence/adapter/` | Referenced via repository-db-map | AppUser, Artifact, CiRun, Ticket, Organization, Team implemented; tbl_fact_* fact tables NOT yet covered |
| User role enum | `EDCAP_BE/web/dto/Dtos.java` (role field) | Referenced via fe-be-contract-map | VIEWER / EDITOR / ADMIN — no QA or PM role value |
| FE API helpers | `EDCAP_FE/src/lib/api.ts` | Referenced via fe-be-contract-map | No dashboard-related endpoints defined |
| FE page routing | `EDCAP_FE/src/pages/*.tsx` | Referenced via fe-be-contract-map | No dashboard page found; AdminPage and OrganizationPage are existing page patterns |

---

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE unit / integration tests | `EDCAP_BE/**/*Test.java` | Not read (Phase 1 scope) | ArchUnit enforces layer dependency rules |
| FE tests | `EDCAP_FE/src/**/*.test.*` | Not read | Playwright installed but no existing tests |
| Contract tests | Both sides | Not available | Explicitly confirmed as gap in fe-be-contract-map |

---

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| VI_02 SDD Evidence Requirements V02 (Vietnamese) | Internal Markdown doc | Read inline only; not exported | Ch.9.3 confirms QA Dashboard card list; Ch.8.2 defines quality KPIs |

---

## Additional Sources Read (2026-06-26 — round 2)

| source | path | status | trust level | note |
|---|---|---|---|---|
| V4 DB Migration SQL | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Read – grep + targeted reads | High | tbl_dim_ticket, tbl_fact_finding, tbl_fact_ac_test_coverage columns confirmed; no Sprint column |
| PM Dashboard FE page | `EDCAP_FE/src/pages/pm-dashboard/PMDashboardPage.tsx` | Read – partial (first 60 lines) | High | Confirms PM Dashboard endpoint pattern; no role check in page |
| QA Dashboard FE page | `EDCAP_FE/src/pages/qa-dashboard/QADashboardPage.tsx` | Read – full | High | Already built with mock data; all sub-components exist |
| QA Dashboard types | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | Read – full | High | `QaSummary`, `AcceptanceCriteriaRow`, `AcCoverageTrendPoint`, `QaDashboardData` — authoritative API shape |
| RoleTabs component | `EDCAP_FE/src/components/dashboard/RoleTabs.tsx` | Read – full | High | All 6 tabs shown to all authenticated users; PM + QA are functional routes |
| PM Dashboard api.ts endpoints | `EDCAP_FE/src/lib/api.ts` (pmDashboard section) | Read – partial | High | Pattern: `GET /api/v1/pm/dashboard/{summary|insights|options|tickets}` |
| VI_02 SDD Ch. 2–3 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` (offset 400-600) | Read – partial | High | Design principles P-01..P-12; As-Is / To-Be context |

---

## Excluded Sources

| source/path | reason |
|---|---|
| `.env` | Contains secrets; must not be read |
| `docs/architecture/service-layer-map.md` | Lower priority for Phase 1; read in Phase 3 when implementing |
| `docs/architecture/data-flow-map.md` | Lower priority for Phase 1 |
| `docs/standards/*.md` | Not read in Phase 1; apply at Phase 3 via coding conventions |
| `db/migration/V4__init_shema_v2.sql` (full) | Not read directly; referenced via repository-db-map summary only — must read at Phase 3 to verify column names |
| CI logs / DB dumps | Not available in repo |

---

## Source Limitations

1. **V4 adapter gap**: Most `tbl_fact_*` tables (test_run, artifact_parsed_section, traceability_link, finding, ci_run, exception) have no Java adapters. Column names confirmed only from migration SQL summary in repository-db-map, not from direct SQL read.
2. **No existing dashboard endpoint**: Contract is entirely new; no existing pattern to reference for dashboard API design.
3. **Role gap**: `app_user.role` has VIEWER / EDITOR / ADMIN only. "QA user" and "PM user" from requirement have no current mapping.
4. **Sprint field**: Mentioned as a filter in requirement and wireframe but not confirmed as a column in any V4 table from sources read.
5. **VI_02 SDD read partially**: Chapters 1–6 and 10–20 not read. Chapter 9.3 and Chapter 8 confirmed relevant; earlier chapters not verified.

---

## Assumptions from Sources

- [INFERRED] `tbl_dim_ticket`, `tbl_dim_project`, `tbl_dim_repository`, `tbl_fact_test_run`, `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section`, `tbl_fact_traceability_link`, `tbl_fact_finding`, `tbl_fact_ci_run`, `tbl_fact_exception` from the V4 migration are the actual tables to query. Column names must be verified against `V4__init_shema_v2.sql` before writing any mapper.
- [INFERRED] Admin role in the current system corresponds to the user who sees both QA and PM dashboard tabs per user-provided clarification (2026-06-26).
- [INFERRED] The dashboard page will be added to the existing FE routing structure following the pattern established by `TeamPage` / `OrganizationPage`.
- [INFERRED] New BE endpoints will follow the hexagonal architecture pattern: Controller → UseCase (Service) → Port → Adapter, consistent with `OrganizationController` / `OrganizationService` pattern.

---

## Human Confirmation Required

| # | question | impact |
|---|---|---|
| HC-1 | Which existing role maps to "QA user"? New role value or existing VIEWER/EDITOR? | Access control gate on FE route and BE endpoint |
| HC-2 | Admin tab behavior: PM Dashboard tab visible-but-disabled, or completely hidden until PM ticket? | FE tab container scope |
| HC-3 | Is Sprint a stored column in tbl_dim_ticket, or a derived date-range filter? | Filter implementation |
| HC-4 | Release Readiness: exact threshold distinguishing PARTIAL from NOT_READY? | Core KPI logic |
| HC-5 | Coverage Trend chart (visible in wireframe): in scope for this ticket? | FE component scope |
| HC-6 | Export button: in scope, visible-disabled, or hidden? | FE button scope |
| HC-7 | Defect Leakage: what defines a "production defect" vs "QA defect" in the finding/review tables? | KPI calculation |
