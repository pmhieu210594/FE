# Sources

**Ticket ID**: DEVELOPER-DASHBOARD  
**Create date**: 2026-07-01  
**Author**: OpenAI  
**Update date**: 2026-07-01  

---

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Developer Dashboard | `docs/changes/DEVELOPER-DASHBOARD/` | Read | Ticket working directory |
| Requirement V02 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Read | FR-DSH-003 Developer Dashboard |

---

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement | `raw/requirement.md` | Read | High | Business requirement |
| Database Design | `raw/database_design.md` | Read | High | Existing V4 table mapping |
| Wireframe | `raw/wireframe.md` | Read | High | Dashboard UI |
| Spec Pack | `docs/changes/DEVELOPER-DASHBOARD/spec-pack.md` | Read | High | Primary specification |
| Context | `docs/changes/DEVELOPER-DASHBOARD/context.md` | Read | High | Implementation context |
| Impact Analysis | `docs/changes/DEVELOPER-DASHBOARD/impact-analysis.md` | Read | High | Impact scope |
| Implementation Plan | `docs/changes/DEVELOPER-DASHBOARD/impl-plan.md` | Read | High | Implementation strategy |
| Ticket Rules | `docs/changes/DEVELOPER-DASHBOARD/ticket-rules.md` | Read | High | Ticket constraints |

---

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| PM Dashboard | Existing project | Read | Dashboard implementation reference |
| QA Dashboard | Existing project | Read | Dashboard implementation reference |
| Dashboard Components | Existing FE | Read | Reuse layout and UI |
| Existing REST Controllers | Existing BE | Read | REST implementation pattern |
| Existing Service Layer | Existing BE | Read | Business logic pattern |
| Existing Repository Layer | Existing BE | Read | Read-only query pattern |
| CI Parser | Existing project | Read | CI aggregation |
| Review Parser | Existing project | Read | Review aggregation |
| Parser Error | Existing project | Read | Parser aggregation |
| Existing Logging | Existing project | Read | TraceId / logging reuse |

---

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Existing BE Unit Tests | `src/test/**` | Read | Existing regression suite |
| Existing FE Unit Tests | `src/__tests__/**` | Read | Dashboard testing pattern |
| Existing E2E Tests | `e2e_tests/**` | Read | Dashboard E2E pattern |
| Architecture Test | Existing project | Read | Hexagonal architecture validation |

---

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| Requirement V02 | Internal Markdown | Read only | Primary business specification |
| Existing Dashboard Design | Internal | Reference only | Architecture consistency |
| V4 Database Schema | SQL | Read only | Existing table verification |

---

## Excluded Sources

| source/path | reason |
|---|---|
| `.env` | Secret |
| `target/` | Generated output |
| `dist/` | Generated output |
| `node_modules/` | Dependency only |
| Runtime logs | Not implementation source |
| Production database | Not used for design |

---

## Source Limitations

- Existing Dashboard implementation was partially analyzed.
- Existing Repository implementation may evolve.
- Existing API contract may change during implementation.
- Existing parser implementation is reused without modification.
- Business rules for CI Failure categorization remain open.
- Parser Warning KPI behavior remains undecided.

---

## Assumptions from Sources

| ID | assumption | basis | risk |
|---|---|---|---|
| A-DEV-DASHBOARD-1 | Existing dashboard architecture is reusable | PM / QA Dashboard | Low |
| A-DEV-DASHBOARD-2 | Existing V4 schema satisfies dashboard requirements | V4 SQL Schema | Low |
| A-DEV-DASHBOARD-3 | Existing parser outputs can be aggregated | Parser implementation | Low |
| A-DEV-DASHBOARD-4 | Existing Review/Finding model is reusable | Review implementation | Low |
| A-DEV-DASHBOARD-5 | Existing REST conventions remain unchanged | Existing controllers | Low |

---

## Human Confirmation Required

| ID | question | reason |
|---|---|---|
| H-DEV-DASHBOARD-1 | CI Failure should be grouped by Ticket or Workflow? | Dashboard aggregation |
| H-DEV-DASHBOARD-2 | Parser Warning should be included in KPI? | Dashboard behavior |
| H-DEV-DASHBOARD-3 | Export required for PoC? | FE scope |
| H-DEV-DASHBOARD-4 | Refresh interval? | Operation |
| H-DEV-DASHBOARD-5 | Ticket Detail should use Drawer or separate page? | UX |