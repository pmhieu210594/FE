# Source Inventory

**Ticket ID**: PARSE-TEST-PLAN-RESULTS
**Create date**: 2026-06-19
**Author**: OpenAI
**Update date**: 2026-06-19

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket body | `docs/changes/PARSE-TEST-PLAN-RESULTS/spec-pack.md` | doc | PM / BE | read | Primary AC and scope source. |
| Context | `docs/changes/PARSE-TEST-PLAN-RESULTS/context.md` | doc | BE / QA | read | Confirms existing patterns and boundaries. |
| Ticket rules | `docs/changes/PARSE-TEST-PLAN-RESULTS/ticket-rules.md` | doc | BE / QA | read | Parser-specific constraints and forbidden behavior. |
| Testing standards | `docs/standards/testing.md` | doc | QA / BE | read | Test design, evidence, and result conventions. |
| Architecture routes | `docs/architecture/route-api-map.md` | doc | BE / FE | partial | Needed only if a pair-view endpoint is added. |
| Architecture DB map | `docs/architecture/repository-db-map.md` | doc | BE / DB | partial | Needed to confirm reusable artifact snapshot tables. |
| Architecture service map | `docs/architecture/service-layer-map.md` | doc | BE | partial | Needed to find existing parser / repository patterns. |
| Architecture test map | `docs/architecture/test-map.md` | doc | QA | partial | Needed to align parser tests and evidence style. |
| DB migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | sql | DB | partial | Likely defines reusable artifact snapshot tables. |
| Existing artifact snapshot model | project source tree | java/sql | BE / DB | partial | Needed to reuse existing DB tables instead of inventing parse-specific ones. |
| Existing FE page pattern | project source tree | tsx | FE | partial | Needed only if a pair-view UI is added. |
| Existing tests | project source tree | test | QA / BE | partial | Needed to reuse assertion style and fixture patterns. |

## Excluded sources

| source/path | reason |
|---|---|
| Raw markdown contents outside `test-plan.md` / `test-results.md` | Out of scope for this parser ticket. |
| CI execution logs | Parser is independent of CI and should not depend on it. |
| Parse-specific long-lived tables | PoC should reuse existing project tables. |

## Human confirmation required

- Confirm the final DB mapping to existing artifact snapshot tables.
- Confirm whether the UI needs a combined ticket pair-view in the current ticket or a follow-up ticket.
- Confirm whether a query endpoint is required.
