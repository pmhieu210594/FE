# Promotion Candidates

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: claude-sonnet-4-6
**Update date**: 2026-06-26 (Phase 8 — Final Report)

---

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-1 | Add note: `docs/standards/security.md` supersedes JWT wording in `docs/architecture/overview.md`; session cookie is the confirmed auth mechanism for all current BE endpoints | `docs/architecture/overview.md` | Two authoritative docs contradict each other on auth mechanism; every new ticket that reads architecture.md without security.md will repeat this confusion. Detected in SL-5 and sources.md. | High |
| LD-2 | Document the snapshot read-model pattern: when to create a precomputed table vs. query existing fact tables directly; include V232 (`tbl_fact_ticket_dashboard_snapshot`) as the reference example | `docs/architecture/overview.md` or new `docs/patterns/read-model.md` | PM Dashboard is the first ticket to use a dashboard snapshot table; the trade-off (migration + refresh complexity vs. faster list rendering) should be captured so future tickets can apply or reject it consciously | Medium |
| LD-3 | Document `parseFilters` / `buildSearchParams` as the canonical FE filter-serialization pattern; note the `raw === null` guard requirement for numeric params (do NOT use `Number(x) \|\| default`) | `docs/standards/coding.md` or FE component guide | Pattern established in PM-DASHBOARD; the zero-falsy bug (FMI-1) is a class of bug that will recur in any other filter page unless the idiom is documented | High |

---

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| R-1 | "For any URL query param where 0 is a valid value, never use `Number(x) \|\| default` to assign a fallback. Always use an explicit `raw === null` check first." | `docs/standards/coding.md` (FE section) | Root cause of the `parseFilters` bug found during test phase (Run 1 failure). Applies to any numeric param with a meaningful minimum (page, size, count, limit). | Low — very specific to a concrete anti-pattern; not a general style rule |
| R-2 | "Before writing a Flyway migration, cross-check every proposed table against existing V4 migrations. If a table with the same semantic role already exists, use the existing table and document the mapping in spec-pack." | `docs/standards/coding.md` (DB section) or review checklist template | `raw/database_design.md` proposed three tables that already existed in V4; if this had not been caught in spec-pack, duplicate or conflicting migrations would have been applied | Low — concrete and checkable |

---

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| S-1 | "Every EQS score row stored in `tbl_fact_evidence_quality_score` must include a `score_rule_version` value. When the scoring formula changes, new rows must be inserted with the new version; old rows must not be silently overwritten." | `docs/standards/coding.md` (DB section) | V4 schema already has the column; this ticket confirmed its purpose. Without a documented standard, a future score-formula migration may overwrite historical scores and lose audit trail. |
| S-2 | "PM Dashboard and any future operational read-only screen must display `owner_display` exclusively from `tbl_dim_member_pseudonym.pseudonym`. Fallback to `created_by`, `updated_by`, or any raw user identifier is forbidden." | `docs/standards/security.md` | Bug found during implementation: snapshot fallback used `updated_by`. The rule must be explicit so code reviewers can enforce it without re-reading the whole spec. |

---

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| A-1 | Clarify that `docs/standards/security.md` is the canonical reference for auth mechanism, and that the JWT/Bearer wording in `docs/architecture/overview.md` reflects an earlier design that was superseded | `docs/architecture/overview.md` | SL-5 in sources.md: two docs contradict each other. Future architects reading only the overview will configure JWT incorrectly. |
| A-2 | Add PM Dashboard as a worked example for the hexagonal-layer rule: controller → application service → port → adapter. Include a one-paragraph note on why the controller must not import `PmDashboardJdbcAdapter` directly. | `docs/architecture/overview.md` | PM Dashboard is the cleanest example of the full hexagonal stack added to date; using it as a reference reduces the chance that future tickets violate layering |

---

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-1 | Falsy-zero clamp bug — numeric URL param where 0 is valid, `Number(x) \|\| default` silently returns the default for `?param=0` | Any filter page with a numeric `page`, `size`, `limit`, `count` param using the `\|\|` idiom | Use explicit `raw === null` guard before `Number()` coercion (see R-1) | Unit test with `param=0` as an explicit test input |
| FMI-2 | DB design document drift — proposed tables in `raw/database_design.md` applied as Flyway migrations without checking V4 schema; creates duplicate or conflicting tables | Developer reads `raw/` documents and writes migrations without reading actual V4 migration files | Pre-migration review step: list all proposed tables and compare against `src/main/resources/db/migration/V*.sql`; spec-pack must document the mapping explicitly | Review checklist item: "proposed tables cross-checked against V4 authoritative schema?" |
| FMI-3 | Auth mechanism confusion — stale `architecture.md` JWT/Bearer wording overrides the confirmed session-cookie decision | New developer reads `docs/architecture/overview.md` and adds `Authorization: Bearer` headers to a new endpoint | Update `architecture.md` to explicitly point to `security.md` as the override (see A-1) | Code review: any new endpoint or FE helper that adds an `Authorization` header triggers a question |
| FMI-4 | Owner display PII leak — `updated_by` or `created_by` raw user identifier surfaced in API response when pseudonym join fails or is omitted | Snapshot query falls back to a user-identifier column instead of joining `tbl_dim_member_pseudonym` | Explicit rule: never use `updated_by`/`created_by` as display values; always join pseudonym table (see S-2) | Integration test: assert `ownerDisplay` does not match email pattern `*@*.*`; code review of any new snapshot query |

---

## Not Promoted

| item | reason |
|---|---|
| Score band thresholds (90/75/60/40) | Not confirmed by human decision (H-2 open); promoting an unconfirmed threshold would freeze a guess as a standard |
| Waiting Review definition | Not confirmed (OI-4 open); definition may change to a new concept other than `ticket_status = IN_REVIEW` |
| Export CSV column list | Not formally signed off (OI-7 open); column list is PoC only and may change |
| `buildAttentionItems` JSDoc stub | Function was never implemented; should not be promoted as a pattern |
| E2E mock-route LIFO ordering | This is a Playwright implementation detail specific to the test setup; too narrow to promote as a general standard |

---

## Human Approval Required

| candidate | approver | reason |
|---|---|---|
| LD-1 (auth doc update) | Tech Lead / Architect | Requires decision on which doc wins and how to update both consistently |
| LD-2 (read-model pattern) | Architect | Pattern should be reviewed before being documented as canonical |
| R-1 (null guard rule) | Tech Lead | Code standard change requires team agreement |
| R-2 (migration cross-check rule) | Architect | Affects process for all future DB work |
| FMI-1 through FMI-4 | Tech Lead / Architect | Failure Mode Index additions require review for accuracy and relevance |

---

## Phase 9 Verdict (2026-06-26)

### Promoted — executed

| candidate | action taken | target |
|---|---|---|
| FMI-1 (falsy-zero clamp) | Added as FMI-PM-001 | `docs/maintenance/failure-mode-index.md` |
| FMI-2 (DB design doc drift) | Added as FMI-PM-002 | `docs/maintenance/failure-mode-index.md` |
| FMI-3 (auth doc inconsistency) | Added as FMI-PM-003 | `docs/maintenance/failure-mode-index.md` |
| FMI-4 (owner display PII leak) | Added as FMI-PM-004 | `docs/maintenance/failure-mode-index.md` |
| LD-1 / A-1 (auth doc cross-reference) | Fixed stale JWT wording in diagram and tech stack table; added link to `security.md` | `docs/architecture/overview.md` |
| LD-3 / R-1 (numeric URL param guard) | Added "URL Search Param Parsing" subsection with correct pattern and reference to `parseFilters` | `docs/standards/frontend.md` |
| S-2 (pseudonym-only owner display) | Added "Owner / Author Display — Pseudonym Only" section | `docs/standards/security.md` |
| ARCH-1 (PM Dashboard service map entries) | Added `PmDashboardService` to §3, `PmDashboardController` to §4, `PmDashboardJdbcAdapter` to §5 | `docs/architecture/service-layer-map.md` |

### Not Promoted — deferred

| candidate | reason |
|---|---|
| LD-2 (snapshot read-model pattern) | PM-DASHBOARD is the first ticket to use this; insufficient evidence from a single use case — re-evaluate after a second ticket adopts the pattern |
| A-2 (PM Dashboard as hexagonal example in overview) | Content would be PM-Dashboard-specific and could become stale; general hexagonal rules already documented |
| R-2 (migration cross-check as an explicit rule) | FMI-PM-002 prevention column covers this; a second rule would duplicate it |
| S-1 (score_rule_version standard) | Tied to unconfirmed EQS formula (OI-PM-DASHBOARD-1 open); do not canonicalize an unconfirmed formula |
