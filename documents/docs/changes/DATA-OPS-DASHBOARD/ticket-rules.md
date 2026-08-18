# Ticket Rules:

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02  

## Must Follow

- Do not add specifications not included in the Spec Pack.
- Ambiguous points must be documented as Open Issues or Human Decisions.
- Read the existing Dashboard implementation before coding.
- Reuse existing Dashboard architecture (PM / QA / Developer Dashboard).
- Reuse existing V4 database tables only.
- Dashboard must remain read-only.
- Existing Connector metadata must be reused.
- Existing Parser metadata must be reused.
- Existing Traceability metadata must be reused.
- Existing Logging and TraceId must be reused.
- Follow existing Repository pattern.
- Follow existing REST Controller pattern.
- Follow existing DTO pattern.
- Business code values shall use existing enums/constants.
- Validate filter parameters before processing.
- Keep aggregation logic inside the Service layer.
- Do not export secrets or PII into logs.

---

## Must Not Do

- Do not create dashboard-specific database tables.
- Do not create Flyway migrations.
- Do not duplicate Connector metadata.
- Do not duplicate Parser metadata.
- Do not duplicate Traceability metadata.
- Do not modify Connector execution.
- Do not modify Parser execution.
- Do not implement CRUD operations.
- Do not implement manual retry.
- Do not introduce AI Analytics.
- Do not introduce write operations.
- Do not bypass Repository layer.
- Do not hardcode status values.

---

## Stop / Ask Conditions

- Stop if Connector schema cannot be confirmed.
- Stop if Parser schema cannot be confirmed.
- Stop if Traceability schema cannot be confirmed.
- Stop if existing Dashboard architecture cannot be reused.
- Stop if implementation requires additional persistence.
- Stop if migration becomes necessary.
- Stop if required metadata is unavailable.
- Stop if API contract conflicts with existing Dashboard conventions.

---

## Review Focus

- Dashboard remains read-only.
- Existing V4 tables are reused.
- Existing Dashboard architecture is reused.
- Aggregation logic is correct.
- Connector Status aggregation is correct.
- Parser Health aggregation is correct.
- Missing Evidence aggregation is correct.
- Broken Traceability aggregation is correct.
- No duplicated persistence.
- Existing performance characteristics are maintained.

---

## Test Focus

- Dashboard rendering.
- Connector Status KPI.
- Parser Health KPI.
- Missing Evidence KPI.
- Broken Traceability KPI.
- Search.
- Filtering.
- Connector Detail drawer.
- Empty-state behavior.
- Existing data compatibility.
- Read-only verification.
```