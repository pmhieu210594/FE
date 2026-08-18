# Ticket Rules

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02  

## Must Follow

- Do not add specifications not included in the Spec Pack.
- Ambiguous points must be returned as Open Issues.
- Read existing Dashboard implementation before coding.
- Reuse the existing Dashboard architecture (PM / QA / Developer / Data Ops Dashboard).
- Dashboard must remain read-only.
- Reuse existing V4 database tables only.
- Reuse existing Safety Pack metadata.
- Reuse existing Security Scan metadata.
- Reuse existing Security Checklist parser results.
- Reuse existing Security Exception metadata.
- Follow existing REST Controller pattern.
- Follow existing Service pattern.
- Follow existing Repository pattern.
- Follow existing DTO mapping pattern.
- Use existing enum / constant / master data instead of hard-coded values.
- Keep aggregation logic inside the Service layer.
- Existing TraceId and Logging must be reused.
- Existing Authentication and Authorization must be reused.
- Existing Dashboard UI components should be reused whenever possible.
- Every implementation item must be traceable to an Acceptance Criterion.

---

## Must Not Do

- Do not create dashboard-specific database tables.
- Do not create Flyway migration.
- Do not duplicate Safety Pack data.
- Do not duplicate Security Scan data.
- Do not duplicate Security Checklist data.
- Do not duplicate Security Exception data.
- Do not execute Secret Scan.
- Do not execute SAST.
- Do not execute SCA.
- Do not modify Security Exception lifecycle.
- Do not implement CRUD.
- Do not introduce write operations.
- Do not bypass Repository layer.
- Do not hard-code Security Status values.
- Do not implement AI Security Analytics.
- Do not introduce Security Score.

---

## Stop / Ask Conditions

- Stop if Safety Pack schema cannot be confirmed.
- Stop if Security Scan schema cannot be confirmed.
- Stop if Security Checklist parser schema cannot be confirmed.
- Stop if Security Exception schema cannot be confirmed.
- Stop if existing Dashboard architecture cannot be reused.
- Stop if implementation requires additional persistence.
- Stop if migration becomes necessary.
- Stop if Final Security Verdict calculation cannot be confirmed.
- Stop if Security Alert calculation requires undefined business rules.

---

## Review Focus

- Dashboard remains read-only.
- Existing V4 tables are reused.
- Existing Dashboard architecture is reused.
- Safety Pack aggregation is correct.
- Secret Scan aggregation is correct.
- SAST/SCA aggregation is correct.
- Security Checklist aggregation is correct.
- Security Exception aggregation is correct.
- Final Security Verdict calculation follows approved rule.
- No duplicated persistence.
- Existing performance characteristics remain unchanged.

---

## Test Focus

- Dashboard rendering.
- Safety Pack KPI.
- Secret Scan KPI.
- SAST KPI.
- SCA KPI.
- Security Checklist KPI.
- Security Exception KPI.
- Dashboard filtering.
- Ticket Detail drawer.
- Empty-state behavior.
- Existing data compatibility.
- Read-only verification.
- Existing regression tests remain green.