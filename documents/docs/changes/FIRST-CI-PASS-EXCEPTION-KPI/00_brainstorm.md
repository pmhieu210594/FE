# 00_brainstorm

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-29  
**Author**: nk_trung   
**Update date**: 2026-06-29  

## Purpose

Lock down the canonical specification for the BE-only MVP of First CI Pass / Exception KPI before any implementation work starts. The goal is to fix the source-of-truth rules, the parse sources, the stored fields, the KPI grain, and the edge cases that would otherwise be implemented inconsistently.

## Known Information

- The backend already has `tbl_fact_ci_run`, `tbl_fact_ci_job`, and `tbl_fact_exception` in the canonical V4 schema.
- The backend already exposes CI metadata via `GET /api/v1/admin/ci-run-metadata`.
- The PM dashboard read model already exposes `exception_count` and open `exception_items`.
- First CI Pass is a CI-run signal; Exception KPI is a parsed artifact signal.
- The current MVP is BE-only; no FE work is part of this phase.
- The templates for `report.md` and `self-review.md` now include a dedicated exception-record section so the parser does not need to infer exception rows from generic risk text.

## Undetermined Points

- Should the KPI denominator be distinct PRs only, or should it fall back to tickets when a PR cannot be resolved?
- Should the implementation store a source-section key in the DB, or keep source-section provenance only in parser metadata and logs?
- Should the phase-1 backend expose a dedicated KPI summary endpoint now, or should the existing dashboard/read endpoints be reused first?
- Should `Exception Rate` count all exception records, or only records whose follow-up status is still open?

## Expected Risks

- If the first-run concept is not pinned to a single CI row, the KPI will drift across re-runs and job-level rows.
- If exception text is inferred from generic Open Issues / Accepted Risk sections, the KPI will be unstable and hard to explain to users.
- If the parser stores no provenance for exception rows, later troubleshooting will be difficult.
- If a new DB table is added unnecessarily, the MVP will lose the reuse-first advantage that the existing schema already provides.

## What AI Needs to Investigate

- Compare the CI run table grain with the job table grain and define the KPI at the correct level.
- Confirm how `first_run_flag`, `rerun_count`, `status`, and `pr_id` should be used in the KPI calculation.
- Confirm which exception fields are already representable in the existing schema and which are only parse-time metadata.
- Verify how the existing parser framework should be extended for the new exception section in `report.md` and `self-review.md`.

## What Humans Need to Ask

- Do you want the KPI to be displayed and queried by PR grain, ticket grain, or both?
- Do you want to keep provenance minimal in the DB, or should we make source-section tracking explicit later?
- Do you want a dedicated API surface for this KPI in phase 1, or only the persisted read model?

## Conditions Under Which Implementation Is Not Permitted

- Do not store raw CI logs, raw chat, raw prompt, or secret values.
- Do not invent exception records from generic risk text when a dedicated exception record is missing.
- Do not add a new table if the existing schema can store the result.
- Do not introduce FE changes in this phase.
- Do not define the KPI grain ambiguously; first-pass logic must be deterministic and repeatable.