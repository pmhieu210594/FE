# Source Inventory

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25  
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Requirement | `EDCAP_BE/documents/docs/changes/PM-DASHBOARD/raw/requirement.md` | Markdown | codex | Read – full | 13 ACs; scope, BR, data items; AI-authored, no human sign-off |
| Wireframe | `EDCAP_BE/documents/docs/changes/PM-DASHBOARD/raw/wireframe.md` | Markdown | codex | Read – full | KPI cards, ticket list, detail drawer, score band thresholds; AI-authored |
| Database Design | `EDCAP_BE/documents/docs/changes/PM-DASHBOARD/raw/database_design.md` | Markdown | codex | Read – full (STALE) | 5 proposed tables; 4/5 overlap with existing V4 tables — do not use as authoritative schema |
| V4 DB Migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | SQL | Internal | Read – full | Authoritative schema; ENUMs, tbl_fact_evidence_quality_score, tbl_fact_risk, tbl_dim_* |
| V160 DB Migration | `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` | SQL | Internal | Read – full | Adds scan_status, need_parse to tbl_fact_artifact_snapshot; vw_artifact_inventory_current |
| V161 DB Migration | `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | SQL | Internal | Read – full | ticket_status ENUM; adds MERGED, DRAFT; migrates from pr_status |
| Architecture Overview | `EDCAP_BE/documents/docs/architecture/overview.md` | Markdown | Internal | Read – full | Hexagonal arch layers, Flyway versions, table naming convention; auth inconsistency vs security.md |
| Security Standards | `EDCAP_BE/documents/docs/standards/security.md` | Markdown | Internal | Read – full | OAuth2 session-cookie (authoritative); CORS rules; error response shape; no JWT in prod |
| Testing Standards | `EDCAP_BE/documents/docs/standards/testing.md` | Markdown | Internal | Read – full | JUnit5/Mockito/ArchUnit (BE); Vitest/Playwright (FE); no FE tests exist |
| Coding Standards | `EDCAP_BE/documents/docs/standards/coding.md` | Markdown | Internal | Not read | Apply at Phase 3 |
| Chapter 9 – SDD | External (not provided) | External | Internal | Not read | Origin of PM Dashboard concept; requirement.md cites this as origin |
| BE REST layer | `EDCAP_BE/src/main/java/…/web/rest/` | Java | Internal | Not read | No PM dashboard controller exists; OrganizationController is the pattern reference |
| BE Services | `EDCAP_BE/src/main/java/…/application/service/` | Java | Internal | Not read | No PM dashboard service exists |
| BE Adapters | `EDCAP_BE/src/main/java/…/infrastructure/persistence/adapter/` | Java | Internal | Not read | Existing adapters for reference |
| FE Pages | `EDCAP_FE/src/pages/` | TypeScript | Internal | Not read | No PM dashboard page; AdminPage/OrganizationPage are the pattern reference |
| FE API helpers | `EDCAP_FE/src/lib/api.ts` | TypeScript | Internal | Not read | No PM dashboard endpoints |
| BE Test (pattern) | `EDCAP_BE/src/test/…/ArtifactScannerServiceTest.java` | Java | Internal | Referenced | Pattern for testing evidence-related services |
| FE Tests | `EDCAP_FE/src/`, `EDCAP_FE/e2e_tests/` | TypeScript | Internal | No tests exist | Vitest + Playwright installed; all tests must be created from scratch |
| raw/01_raw-input.md | `EDCAP_BE/documents/docs/changes/PM-DASHBOARD/raw/01_raw-input.md` | Markdown | — | Not read (empty) | Empty template, no content |
| raw/02_reference-extracts.md | `EDCAP_BE/documents/docs/changes/PM-DASHBOARD/raw/02_reference-extracts.md` | Markdown | — | Not read (empty) | Empty template, no content |

## Important Files

Files that **must be read before starting implementation** (Phase 3):

| priority | file | reason |
|---|---|---|
| P0 | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Verify column names of tbl_fact_evidence_quality_score and tbl_fact_risk before use |
| P0 | `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` | Verify tbl_fact_artifact_snapshot columns before querying missing evidence |
| P0 | `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | Verify ticket_status ENUM values before writing filter query |
| P0 | `EDCAP_BE/documents/docs/standards/security.md` | Confirms auth mechanism (session cookie) — use as basis for SecurityConfig |
| P1 | `EDCAP_BE/src/main/java/…/web/rest/OrganizationController.java` | Pattern reference for the new DashboardController |
| P1 | `EDCAP_BE/src/main/java/…/application/service/OrganizationService.java` | Pattern reference for the new DashboardService |
| P1 | `EDCAP_BE/src/test/…/ArtifactScannerServiceTest.java` | Pattern reference for the new DashboardServiceTest |
| P2 | `EDCAP_BE/documents/docs/standards/coding.md` | Coding conventions before writing code |
| P2 | `EDCAP_FE/src/pages/AdminPage.tsx` or `OrganizationPage.tsx` | FE page pattern reference |

## Generated / Excluded Files

| path | reason |
|---|---|
| `.env` / `.env.*` | Contains secrets; must not be read under any circumstances |
| `raw/01_raw-input.md` | Empty template, no useful content |
| `raw/02_reference-extracts.md` | Empty template, no useful content |
| `EDCAP_BE/target/` | Build output; generated |
| `EDCAP_FE/node_modules/` | Dependencies; generated |
| `EDCAP_FE/dist/` | FE build output; generated |
| CI logs / DB dumps | Not available in the repository |

## Missing Files

Files that **do not yet exist** and must be created at Phase 3:

| file | layer | note |
|---|---|---|
| `db/migration/V162__pm_dashboard_snapshot.sql` | DB Migration | Creates `tbl_fact_ticket_dashboard_snapshot` (new — does not overlap V4) |
| `db/migration/V163__pm_dashboard_missing_evidence.sql` | DB Migration | Creates `tbl_fact_ticket_missing_evidence` after confirming no overlap with tbl_fact_artifact_snapshot |
| `db/migration/V16x__pm_dashboard_attention.sql` | DB Migration | Creates `tbl_fact_ticket_attention` if a precomputed list is needed |
| `EDCAP_BE/web/rest/PmDashboardController.java` | Controller (Web) | Expose `GET /api/v1/dashboard/pm` and drill-down endpoints |
| `EDCAP_BE/application/port/in/GetPmDashboardUseCase.java` | Port In | Use case interface |
| `EDCAP_BE/application/port/out/PmDashboardQueryPort.java` | Port Out | DB query interface |
| `EDCAP_BE/application/service/PmDashboardService.java` | Service | Aggregate KPIs; score / missing evidence / risk logic |
| `EDCAP_BE/infrastructure/persistence/adapter/PmDashboardQueryAdapter.java` | Adapter (DB) | Implement PmDashboardQueryPort; query V4 tables + new snapshot |
| `EDCAP_BE/web/dto/PmDashboardDtos.java` | DTO | Response DTOs for PM dashboard API |
| `EDCAP_FE/src/pages/PmDashboardPage.tsx` | FE Page | PM Dashboard landing page |
| `EDCAP_FE/src/components/pm-dashboard/` | FE Components | KPI cards, attention list, detail drawer, filter panel, score breakdown |
| `EDCAP_FE/src/lib/pm-dashboard-api.ts` (or extend api.ts) | FE API | PM Dashboard endpoint helpers |
| `EDCAP_BE/src/test/…/PmDashboardServiceTest.java` | BE Test | Unit test following ArtifactScannerServiceTest pattern |
