# Sources

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: claude-sonnet-4-6
**Update date**: 2026-06-25

---

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Ticket body | — | Missing | No raw Jira/GitHub ticket body was provided; requirement.md is the closest substitute |

---

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement document | `raw/requirement.md` | Read | High | AI-authored; contains scope, functional requirements, 13 ACs, 8 open points; no human sign-off recorded |
| Wireframe | `raw/wireframe.md` | Read | High | AI-authored; detailed screen layout, empty state, drawer, score band thresholds |
| Database design | `raw/database_design.md` | Read | Medium | AI-proposed; 5 new tables described — but 4 of them overlap with tables that already exist in V4 migration; must NOT be taken as authoritative schema |

---

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| DB migration — base schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Read | Confirms existing ENUMs, dimension tables, and fact tables; authoritative schema source |
| DB migration — artifact scanner additions | `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` | Read | Adds scan_status, need_parse to tbl_fact_artifact_snapshot; confirms vw_artifact_inventory_current |
| DB migration — ticket status merge | `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | Read | Migrates pr_status into ticket_status enum; adds MERGED, DRAFT values |
| Architecture overview | `documents/docs/architecture/overview.md` | Read | Confirms hexagonal layers, Flyway version (V1–V4+), table naming convention, technology stack |
| Security standards | `documents/docs/standards/security.md` | Read | Confirms OAuth2 session-cookie auth, CORS rules, error response shape, no JWT in prod |
| Testing standards | `documents/docs/standards/testing.md` | Read | Confirms JUnit5/Mockito/ArchUnit (BE), Vitest/Playwright (FE), no tests exist yet in FE |

---

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| FE unit / E2E | `EDCAP_FE/src/`, `EDCAP_FE/e2e_tests/` | No tests exist | Confirmed by testing.md — all new code must add test files |
| BE unit — artifact scanner | `EDCAP_BE/src/test/…/ArtifactScannerServiceTest.java` | Exists | Relevant as a model for testing evidence-related services |

---

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| SDD evidence platform Chapter 9 | Referenced in requirement §1 | Not read — document not provided | Requirement states the PM dashboard concept originates here; contents unknown |

---

## Excluded Sources

| source/path | reason |
|---|---|
| `.env` files | Safety rule — never read |
| `raw/01_raw-input.md` | Empty template, no content |
| `raw/02_reference-extracts.md` | Empty template, no content |
| `documents/docs/standards/coding.md` | Not read — relevant for implementation phase only, not spec |

---

## Source Limitations

1. **Chapter 9 of SDD not available.** The requirement cites it as the origin of the PM dashboard concept. Its full content was not provided. All specification content is derived from the raw/ folder files only.

2. **DB design document is stale relative to actual schema.** `raw/database_design.md` proposes `tbl_fact_ticket_score`, `tbl_fact_ticket_risk`, and `tbl_fact_ticket_missing_evidence` as new tables — but `tbl_fact_evidence_quality_score`, `tbl_fact_risk`, and `tbl_fact_artifact_snapshot` already exist in V4 with overlapping data. The proposed tables cannot be created as-is without resolving the overlap.

3. **`score_band` ENUM confirmed but numeric thresholds are not.** V4 defines `ENUM ('EXCELLENT', 'GOOD', 'WARNING', 'RISKY', 'CRITICAL')`. The wireframe proposes numeric thresholds (90/75/60/40). These thresholds do NOT appear in any migration or metric definition seed — they are wireframe-only proposals.

4. **No ticket body / Jira content available.** The raw-input template is empty. All requirement content comes from AI-authored `raw/` documents.

5. **Auth mechanism inconsistency between docs.** `docs/architecture/overview.md` lists "Spring Security + JWT auth" for BE and "Bearer token" for FE. `docs/standards/security.md` states "Spring Security OAuth2 with session cookies (no JWT)." The security.md entry is more detailed and recent; treat it as authoritative, but flag for human confirmation.

---

## Assumptions from Sources

| ID | assumption | source basis |
|---|---|---|
| AS-1 | `tbl_fact_evidence_quality_score` is the intended score storage for the PM Dashboard | V4 schema — table exists with the exact breakdown columns (spec_score, plan_score, test_score, etc.) |
| AS-2 | `tbl_fact_risk` is the intended risk storage; exception signals would need a new column or separate table | V4 schema — `tbl_fact_risk` has severity and status but no exception_flag |
| AS-3 | `waiting_review` maps to `ticket_status = IN_REVIEW` in `tbl_dim_ticket` | ticket_status ENUM includes IN_REVIEW; no explicit waiting_review_flag in schema |
| AS-4 | Score band thresholds from wireframe (90/75/60/40) are proposals, not confirmed values | wireframe.md §6 only |
| AS-5 | `owner_display` should use `tbl_dim_member_pseudonym.pseudonym` to avoid exposing real names | V4 schema design intent + requirement §6.4 "no personal ranking" |

---

## Human Confirmation Required

- Confirm whether `raw/` documents have been reviewed and approved by a human PM/architect.
- Confirm whether Chapter 9 of the SDD should be provided as an additional input source.
- Confirm the authoritative auth mechanism (session cookie vs JWT) for the PM Dashboard API.
- Confirm the score band numeric thresholds (90/75/60/40 as in wireframe, or different values).
