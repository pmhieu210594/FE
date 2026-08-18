# Source Availability

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25  
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| PM Dashboard Requirement | `raw/requirement.md` | read | high | codex | Primary implementation basis; AC-PM-1 through AC-PM-13 | AI-authored, no human sign-off | always-read |
| PM Dashboard Wireframe | `raw/wireframe.md` | read | high | codex | Layout: KPI cards, ticket list, detail drawer, score band thresholds | AI-authored; thresholds not confirmed | always-read |
| PM Dashboard Database Design | `raw/database_design.md` | read | **medium (STALE)** | codex | Table proposals — but 4/5 tables already exist in V4 with overlapping structure | **Do not use as authoritative schema** | verify-with-source |
| V4 DB Migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | high | Internal | Authoritative schema; ENUMs, dim tables, tbl_fact_evidence_quality_score, tbl_fact_risk | — | always-read |
| V160 DB Migration (Artifact Scanner) | `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` | read | high | Internal | Adds scan_status, need_parse to tbl_fact_artifact_snapshot; confirms vw_artifact_inventory_current | — | required-if-db |
| V161 DB Migration (Ticket Status) | `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | read | high | Internal | Migrates pr_status → ticket_status ENUM; adds MERGED, DRAFT | — | required-if-db |
| Architecture Overview | `documents/docs/architecture/overview.md` | read | high | Internal | Hexagonal layers, Flyway versions (V1–V4+), table naming convention, tech stack | Auth inconsistency: states JWT; but security.md states session cookies | verify-with-source |
| Security Standards | `documents/docs/standards/security.md` | read | high | Internal | OAuth2 session-cookie auth (authoritative), CORS rules, error response shape, no JWT in prod | — | always-read |
| Testing Standards | `documents/docs/standards/testing.md` | read | high | Internal | JUnit5/Mockito/ArchUnit (BE); Vitest/Playwright (FE); confirms no FE tests exist | — | always-read |
| Chapter 9 – SDD Evidence Platform | External (not provided) | unavailable | high | Internal | Origin of PM Dashboard concept | **All requirements are AI-derived without this verified source** | human-intake |
| Coding Standards | `documents/docs/standards/coding.md` | unavailable | medium | Internal | Coding conventions | Not read; apply at Phase 3 | verify-with-source |
| BE Source Code | `EDCAP_BE/src/main/java/…/` | unavailable | high | Internal | Pattern reference (controller/service/adapter) | No dashboard code exists | required-if-impl |
| FE Source Code | `EDCAP_FE/src/` | unavailable | high | Internal | Pattern reference; no PM dashboard page exists | No dashboard code exists | required-if-impl |
| BE Test (pattern) | `EDCAP_BE/src/test/…/ArtifactScannerServiceTest.java` | read (referenced) | medium | Internal | Pattern for testing evidence-related services | — | verify-with-source |
| FE Tests | `EDCAP_FE/src/`, `EDCAP_FE/e2e_tests/` | unavailable | — | Internal | No FE tests exist | All tests must be created from scratch | required-if-impl |
| `.env` files | `.env` | not-read | — | Internal | Contains secrets | Secrets leak | never-read |
| `raw/01_raw-input.md` | `raw/01_raw-input.md` | not-read | — | — | Empty template, no content | — | skip |
| `raw/02_reference-extracts.md` | `raw/02_reference-extracts.md` | not-read | — | — | Empty template, no content | — | skip |

## Summary

- **9 sources read**: requirement, wireframe, database_design, V4/V160/V161 migrations, architecture overview, security.md, testing.md.
- **DB design document (`raw/database_design.md`) read but STALE**: 4/5 proposed tables (tbl_fact_ticket_score, tbl_fact_ticket_risk, tbl_fact_ticket_missing_evidence, tbl_fact_ticket_attention) overlap with existing V4 tables (`tbl_fact_evidence_quality_score`, `tbl_fact_risk`, `tbl_fact_artifact_snapshot`). Must not be used as authoritative schema.
- **V4 migration is the only trusted schema source**: authoritative; confirms tbl_fact_evidence_quality_score and tbl_fact_risk already exist.
- **Chapter 9 SDD not available**: all requirements are based on AI-authored documents with no human sign-off — this is the most critical risk.
- **Auth inconsistency**: overview.md states JWT, security.md states session cookies. Must be confirmed before Phase 3.
- No binary sources (Excel/PDF). FE/BE source code not read directly.

## Unavailable / Partial Sources

| source | missing part | impact | when to fix |
|---|---|---|---|
| Chapter 9 – SDD Evidence Platform | Not provided | **Critical**: all requirements may not match the original specification | Request human to provide before Phase 3 |
| BE Source Code | Not read | Missing pattern reference; current controller/service patterns unknown | Phase 3 — read OrganizationController as pattern reference |
| FE Source Code | Not read | FE routing/page patterns unknown | Phase 3 — read AdminPage / OrganizationPage |
| Coding Standards | Not read | Coding conventions missing | Phase 3 — read before writing code |
| `raw/database_design.md` (schema part) | Stale — conflicts with V4 | Direct use would create duplicate tables | Must reconcile with V4 schema at Phase 3 |

## Risk Before Implementation

| # | risk | source gap | impact | mitigation |
|---|---|---|---|---|
| R-1 | DB design stale — table overlap | `raw/database_design.md` vs V4 schema | Creates duplicate tables causing Flyway migration conflict | **MUST reconcile with V4 before writing any new migration**: use tbl_fact_evidence_quality_score (avoid creating tbl_fact_ticket_score if possible) |
| R-2 | Requirement has no human sign-off | Chapter 9 SDD not available | All ACs may not match actual requirements | Human must review requirement.md and provide Chapter 9 |
| R-3 | Score band thresholds not confirmed | Wireframe-only (90/75/60/40) | Incorrect threshold requires rework of logic and UI | See HC-4 |
| R-4 | Auth mechanism inconsistency | overview.md (JWT) vs security.md (session cookies) | Incorrect auth layer affects entire BE security | See HC-3 — security.md treated as authoritative in the interim |
| R-5 | `tbl_fact_ticket_dashboard_snapshot` is a NEW table | Not present in V4 | Requires new Flyway migration (V162+) | Design carefully before writing migration; confirm no overlap |
| R-6 | tbl_fact_risk missing exception_flag | V4 schema: tbl_fact_risk has severity/status but no exception_flag | Exception signals need an alternative solution (new column vs separate table) | Decide at Phase 3 — see HC-5 |
| R-7 | No FE tests exist | Confirmed by testing.md | Code coverage zero; high regression risk | Create new Vitest + Playwright tests following testing.md standards |

## Required Human Decision

| HC | question | impact | blocker |
|---|---|---|---|
| HC-1 | Have the `raw/` files been reviewed and approved by a human PM/architect? | Entire spec may need revision | Yes — before starting implementation |
| HC-2 | Can Chapter 9 of the SDD Evidence Platform be provided? | Validates original requirement | Yes — should be available before Phase 3 |
| HC-3 | Actual auth mechanism: session cookie (security.md) or JWT (overview.md)? | BE security layer — SecurityConfig, filter chain | Yes — must decide before writing `DashboardController` |
| HC-4 | Score band thresholds: 90/75/60/40 as in wireframe or different values? | Core KPI display logic | Should know before Phase 3 FE |
| HC-5 | Exception signals: add `exception_flag` to `tbl_fact_risk` or create a separate table? | Schema migration scope | Yes — affects migration script |
| HC-6 | Does `waiting_review` in the dashboard map to `ticket_status = IN_REVIEW` in tbl_dim_ticket? | KPI card logic | Should know before writing aggregation query |
| HC-7 | Does `owner_display` use `tbl_dim_member_pseudonym.pseudonym` or a different column? | AC-PM-10 "no personal ranking" | Yes — privacy requirement |
