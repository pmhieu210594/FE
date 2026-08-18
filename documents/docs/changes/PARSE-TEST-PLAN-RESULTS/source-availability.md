# Source Availability

**Ticket ID**: PARSE-TEST-PLAN-RESULTS
**Create date**: 2026-06-19
**Author**: OpenAI
**Update date**: 2026-06-19

## Available sources

| source | path | status | note |
|---|---|---|---|
| Spec Pack | `docs/changes/PARSE-TEST-PLAN-RESULTS/spec-pack.md` | available | Primary source of truth for AC and scope. |
| Context | `docs/changes/PARSE-TEST-PLAN-RESULTS/context.md` | available | Confirms implementation context and allowed components. |
| Ticket Rules | `docs/changes/PARSE-TEST-PLAN-RESULTS/ticket-rules.md` | available | Parser-specific constraints. |
| Test Plan Template | `_ticket-template/test-plan.md` | available | Canonical source of test-plan fields. |
| Test Results Template | `_ticket-template/test-results.md` | available | Canonical source of test-results fields. |
| Testing Standards | `docs/standards/testing.md` | available | Test design / evidence / execution conventions. |
| Architecture Notes | `docs/architecture/` | partial | Use only the parts relevant to reusable artifact snapshot storage and pair-view UI. |
| Existing Source Code | project source tree | partial | Only read the current artifact snapshot / parser patterns that already exist. |

## Missing / not confirmed yet

| item | status | impact |
|---|---|---|
| Exact artifact snapshot table mapping | not confirmed | Needs discovery before final DB implementation. |
| Exact pair-view UI scope | not confirmed | May stay backend-only if not approved. |
| Exact API/query exposure | not confirmed | May be omitted from PoC if no endpoint is required. |

## Summary

The sources are sufficient to define the parser behavior and field mapping. Exact reusable DB table wiring still needs a final confirmation from the current project schema.
