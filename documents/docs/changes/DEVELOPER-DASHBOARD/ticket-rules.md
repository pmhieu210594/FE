# Ticket Rules

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-06-30
**Author**: OpenAI
**Update date**: 2026-06-30

## Must Follow

* Do not add specifications that are not defined in `spec-pack.md`.
* Ambiguous items must remain as Open Issues or Human Decisions.
* Read `context.md`, `spec-pack.md`, and existing dashboard implementation before coding.
* Follow existing dashboard implementation patterns.
* Dashboard must be read-only.
* Reuse existing V4 database tables.
* Do not duplicate parser, CI, or review data.
* Follow existing REST API patterns.
* Follow existing DTO patterns.
* Follow existing Repository patterns.
* Use constructor injection.
* Reuse existing logging and TraceId.
* Existing authentication and authorization must be reused.
* All aggregation logic belongs to the Service layer.
* Existing SQL conventions must be followed.
* Existing dashboard UI components should be reused where possible.
* Trace every implementation item back to the Acceptance Criteria.

---

## Must Not Do

* Do not create dashboard-specific database tables.
* Do not introduce database migration.
* Do not modify parser behavior.
* Do not modify CI execution.
* Do not modify review workflow.
* Do not duplicate existing parser outputs.
* Do not duplicate CI summaries.
* Do not duplicate review summaries.
* Do not introduce AI analytics.
* Do not introduce Evidence Quality Score.
* Do not implement CRUD.
* Do not introduce write operations.
* Do not hardcode business values.
* Do not bypass Repository layer.

---

## Stop / Ask Conditions

* Stop if existing V4 tables are unavailable.
* Stop if CI schema cannot be confirmed.
* Stop if Review schema cannot be confirmed.
* Stop if Parser Error schema cannot be confirmed.
* Stop if existing Dashboard pattern cannot be reused.
* Stop if new persistence is required.
* Stop if implementation requires modifying parser logic.
* Stop if implementation requires modifying CI execution.

---

## Review Focus

* Dashboard is read-only.
* Existing V4 tables are reused.
* Existing dashboard architecture is followed.
* Aggregation logic is correct.
* CI Failures are displayed correctly.
* Review Findings are displayed correctly.
* Parser Errors are displayed correctly.
* No duplicated persistence.
* No unnecessary complexity.

---

## Test Focus

* Dashboard rendering.
* CI Failure aggregation.
* Review Finding aggregation.
* Parser Error aggregation.
* Search.
* Filtering.
* Ticket drill-down.
* Empty state.
* Read-only behavior.
* Existing database compatibility.
