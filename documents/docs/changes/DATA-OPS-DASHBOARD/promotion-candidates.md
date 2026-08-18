# Promotion Candidates

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-DATAOPS-1 | Read-only operational dashboard pattern | docs/knowledge/data-ops-dashboard.md | Small reusable lesson from this ticket; keeps the read-model pattern separate from product-specific KPI rules | High |
| LD-DATAOPS-2 | Live aggregation over existing V4 metadata | docs/architecture/service-layer-map.md | Reusable controller -> service -> port -> adapter shape for read-only dashboards | High |

---

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| RULE-DATAOPS-1 | None promoted from this ticket | - | The read-only and service-layer patterns are already covered by architecture / knowledge notes; adding a rule here would duplicate existing guidance | - |

---

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| STD-DATAOPS-1 | None promoted from this ticket | - | Existing API and database standards already cover the needed contract shape and V4 reuse policy | - |

---

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| ARC-DATAOPS-1 | Data Ops Dashboard service map entry | docs/architecture/service-layer-map.md | Make the live read-model path visible in the existing service map |
| ARC-DATAOPS-2 | Data Ops Dashboard repository map entry | docs/architecture/repository-db-map.md | Record the V4 tables and read-only adapter used by this ticket |

---

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-DATAOPS-001 | Operational dashboard becomes writable or creates new persistence | A dashboard implementation adds POST/PUT endpoints or a snapshot table instead of staying read-only | Keep dashboard endpoints GET-only and aggregate from existing tables through the service/repository layer | API review or migration review catches a write surface or new table |

---

## Not Promoted

| item | reason |
|---|---|
| Freshness threshold | Business decision pending; keep in open issues and accepted risk until Product confirms |
| Connector Health calculation | Business decision pending; do not freeze a provisional formula into a permanent rule |
| Broken Traceability KPI | Definition still provisional; the current proxy is ticket-specific, not a general policy |
| Security Alert KPI | Data source not finalized |
| Cost Summary KPI | Data source not finalized |
| Export capability | Future enhancement |
| Performance optimization | Project-specific |

---

## Human Approval Required

| item | owner | reason |
|---|---|---|
| Dashboard Architecture Guideline | Architecture Owner | Shared architecture |
| KPI Aggregation Standard | Product Owner | Business rule |
| Existing Metadata Reuse Standard | Technical Lead | Database standard |
| Failure Mode additions | QA Lead | Quality governance |
| Dashboard API Standard | Backend Lead | API consistency |

---

## Promotion Recommendation

### Ready to Promote

- Read-only operational dashboard pattern
- Live aggregation over existing V4 metadata
- Architecture map entries for the Data Ops read model

### Promote After Product Decision

- Freshness KPI
- Connector Health KPI
- Broken Traceability KPI
- Security Alert KPI
- Cost Summary KPI

### Do Not Promote

- Ticket-specific implementation details
- Temporary proxy values and PoC assumptions
- Future enhancement items
- Any rule that duplicates an existing architecture or knowledge note
