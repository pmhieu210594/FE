# 00_brainstorm

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## Purpose

Capture the initial understanding of the Data Ops Dashboard before implementation.

The purpose of this dashboard is to provide operational visibility into the SDD Evidence Platform by monitoring connector execution, parser health, evidence quality, freshness, and traceability.

This document is an investigation artifact only and shall not be treated as the final specification.

---

## Known Information

### Requirement

Requirement V02 defines a dedicated **Data Ops Dashboard**.

The dashboard should allow Data Ops personnel to monitor:

- Connector status
- Data Quality
- Parse Errors
- Missing Evidence
- Freshness
- Lineage
- Security
- Cost

---

### Current PoC Scope

Current implementation already contains:

- Connector execution
- Markdown parser
- Artifact Snapshot
- Traceability
- Data Quality

These become the primary sources for this dashboard.

---

### Existing Data Sources

Existing V4 tables are expected to be reused.

Candidate tables:

- tbl_connector_run
- tbl_dim_project
- tbl_dim_repository
- tbl_dim_ticket
- tbl_fact_artifact_snapshot
- tbl_fact_artifact_parsed_section
- tbl_fact_data_quality
- tbl_fact_traceability_link
- tbl_fact_metric_value

No dashboard-specific persistence is planned.

---

### Dashboard Characteristics

The dashboard:

- is operational
- is read-only
- does not execute connectors
- does not execute parsers
- does not modify evidence
- only visualizes existing metadata

---

## Undetermined Points

| ID | Point | Status |
|---|---|---|
| UD-1 | Freshness threshold | Open |
| UD-2 | Connector Health calculation | Open |
| UD-3 | Cost calculation | Open |
| UD-4 | Export scope | Open |
| UD-5 | Security Alert calculation | Open |

---

## Expected Risks

| Risk | Probability | Impact | Note |
|---|---|---|---|
| Connector schema changes | Medium | High | Dashboard aggregation affected |
| Parser schema changes | Medium | Medium | KPI calculation changes |
| Traceability schema changes | Medium | Medium | Broken Link calculation affected |
| Large metadata volume | Low | Medium | Dashboard query performance |

---

## What AI Needs to Investigate

- Existing Connector implementation
- Existing Parser implementation
- Existing Dashboard implementation
- Existing Data Quality implementation
- Existing Traceability implementation
- Existing Dashboard components
- Existing repository patterns

---

## What Humans Need to Ask

- What is the freshness threshold?
- Should Security Alerts be included in MVP?
- Should Cost be estimated or calculated?
- Is Export required for MVP?
- Should Broken Link severity have Warning/Error levels?

---

## Conditions Under Which Implementation Is Not Permitted

1. Do not create dashboard-specific tables.
2. Do not duplicate parser metadata.
3. Do not duplicate connector metadata.
4. Do not duplicate traceability data.
5. Do not introduce write operations.
6. Do not execute connectors from the dashboard.
7. Do not execute parsers from the dashboard.
8. Do not modify existing parser behavior.
9. Stop implementation if existing V4 tables are unavailable.
10. Stop implementation if dashboard requires schema changes.