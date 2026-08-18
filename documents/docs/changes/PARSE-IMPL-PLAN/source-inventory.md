# Source Inventory

**Ticket ID**: PARSE-IMPL-PLAN
**Create date**: 2026-06-18
**Author**: ChatGPT
**Update date**: 2026-06-18

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Requirement input | `docs/changes/PARSE-IMPL-PLAN/spec-pack.md` | doc | PM / BE | read | Main specification source |
| Context input | `docs/changes/PARSE-IMPL-PLAN/context.md` | doc | BE / QA | read | Confirms allowed methods and patterns |
| Ticket rules | `docs/changes/PARSE-IMPL-PLAN/ticket-rules.md` | doc | BE / QA | read | Ticket constraints |
| Target source | `docs/changes/PARSE-IMPL-PLAN/impl-plan.md` | doc | BE / QA | read | File to parse |
| Template definition | `_ticket-template/impl-plan.md` | doc | BE | read | Field source and section shape |
| General standards | `docs/standards/` | doc | BE / QA / DB | read | Template and technical standards |
| Rules | `.claude/rules/` | doc | BE | read | Ticket execution rules |
| Existing parser code | repository parser modules | code | BE | partial | Read only if needed for implementation pattern |
| Existing parser tests | repository test modules | test | QA / BE | partial | Read only if needed for expected style |

## Important Files

- `docs/changes/PARSE-IMPL-PLAN/spec-pack.md`
- `docs/changes/PARSE-IMPL-PLAN/context.md`
- `docs/changes/PARSE-IMPL-PLAN/ticket-rules.md`
- `docs/changes/PARSE-IMPL-PLAN/impl-plan.md`
- `_ticket-template/impl-plan.md`

## Generated / Excluded Files

- `docs/changes/PARSE-IMPL-PLAN/output/` (generated parser outputs if any)
- raw logs
- secrets
- temporary scratch files

## Missing Files

- `docs/changes/PARSE-IMPL-PLAN/database_design.md`
- `docs/changes/PARSE-IMPL-PLAN/wireframe.md`
- parser implementation source files
- parser unit / integration test files
