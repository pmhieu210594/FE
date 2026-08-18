# Test Data

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-22

## Data Policy

Use only synthetic seed/test data derived from `spec-pack.md`/`test-plan.md` §7. No production
data at any point, consistent with `impact-analysis.md` §13.2 ("no secrets, PII, or credentials
involved").

## Master Data

The 5 seed bands defined in `V504__create_tbl_dim_score_threshold.sql`, reused verbatim as the
baseline fixture across BE and FE tests (per `test-plan.md` §7 Test data policy):

| name | value | purpose |
|---|---|---|
| Default band: CRITICAL | `0-39` | Seed data, baseline fixture |
| Default band: RISKY | `40-59` | Seed data |
| Default band: WARNING | `60-74` | Seed data |
| Default band: GOOD | `75-89` | Seed data |
| Default band: EXCELLENT | `90-100` | Seed data |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| test-admin | ADMIN | Full view/edit | Positive-path tests |
| test-nonadmin | non-ADMIN (e.g. regular user) | None | AC-12 permission-rejection tests |

## Normal Data

| ID | data | purpose |
|---|---|---|
| ND-1 | 5 default bands (CRITICAL/RISKY/WARNING/GOOD/EXCELLENT), gap-free, non-overlapping, unique codes | Happy-path save/list (BB-001, BB-012) |
| ND-2 | Single new row, no `id`, `code:"BONUS"`, valid range/color | Add-band happy path (BB-005) |
| ND-3 | WARNING row with Label changed to `"Needs Attention"`, `color:"#F59E0B"`, range `55-74` (RISKY compensated to `40-54`) | Rename/recolor/re-range round-trip (BB-020) |
| ND-4 | `color:"#FF5733"` selected on an existing band | Color picker round-trip (BB-017) |

## Error Data

| ID | data | expected error |
|---|---|---|
| ED-1 | `0-39, 45-100` (gap) | 400 DOMAIN_RULE_VIOLATION |
| ED-2 | `0-40, 40-100` (overlap) | 400 DOMAIN_RULE_VIOLATION |
| ED-3 | Two rows both `code: "WARNING"` | 400 DOMAIN_RULE_VIOLATION |
| ED-4 | `code: "excellent score"` (lowercase, space) | 400 |
| ED-5 | `code: "warn-ing"` (special char) | 400 |
| ED-6 | `code: ""` (empty) | 400 |
| ED-7 | `{minScore: 80, maxScore: 60}` (From > To) | 400 DOMAIN_RULE_VIOLATION |
| ED-8 | `color: "red"` (not hex) | 400 |
| ED-9 | `color: "#ZZZZZZ"` (invalid hex digits) | 400 |
| ED-10 | Non-ADMIN caller on `GET`/`POST` | 403 FORBIDDEN |
| ED-11 | Unauthenticated caller on `GET`/`POST` | 401 |
| ED-12 | Second save using a stale `version` after a concurrent first save | 409 CONFLICT |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| BD-1 | Single-band configuration | One row `0-100` | Accept — resolved by `impact-analysis.md` §8: save requires ≥1 active band |
| BD-2 | Adjacent bands | `0-39` / `40-59` | Accept (not an overlap) |
| BD-3 | Reused Code from soft-deleted row | `code` matching a `delete_flag='1'` row | Accept |
| BD-4 | Code single-char uppercase | `code: "A"` | Accept per A-THRESHOLD-CONFIG-4 |
| BD-5 | Score exactly at a band boundary | `minScore`/`maxScore` values `0, 39, 40, 74, 75, 100` | Each resolves to exactly one band (BR-013) |

## Existing Data Compatibility

No pre-existing `tbl_dim_score_threshold` rows exist (net-new table); no backward-compatibility
migration concern besides the seed-data migration itself remaining reproducible for fresh
environments (also required at runtime by `EvidenceQualityScoreService`, not just admin-screen
demo data — per spec-pack §14 item 3).

## Data Setup Procedure

Baseline fixture is created by `V504__create_tbl_dim_score_threshold.sql`'s seed data (the 5
default bands), which runs automatically via Flyway on a fresh environment/test DB — no separate
manual setup step needed for the happy-path baseline. Error/boundary payloads are constructed
in-test as literal request bodies (see Error Data / Boundary Data above); they are not
pre-seeded rows.

## Data Cleanup Procedure

No hard-delete cleanup is required or performed — rows created/soft-deleted during test runs stay
as soft-deleted (`delete_flag='1'`) history, consistent with BR-THRESHOLD-CONFIG-010. Tests that
need a clean baseline should run against an isolated/rolled-back transaction or a fresh seeded DB
rather than physically deleting rows.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets to artifacts.
