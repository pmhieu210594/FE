# 00_brainstorm

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC
**Create date**: 2026-06-23
**Author**: OpenAI
**Update date**: 2026-06-23

## Purpose

Define how Ticket, Artifact, PR, Commit, CI, Test and Report relationships should be matched and displayed.

## Known Information

* `tbl_fact_traceability_link` already exists.
* Artifact parsers already generate snapshots.
* PR ingestion already exists.
* CI ingestion already exists.
* Traceability Map is one of the core MVP functions.

## Undetermined Points

* Exact confidence scoring thresholds.
* Exact broken-link severity rules for future expansion.
* Timeline event ordering edge cases.

## Expected Risks

* Incorrect matching may create false traceability links.
* Missing ingestion data may reduce completeness score.
* Multiple PR handling may require future enhancement.

## What AI Needs to Investigate

* Existing artifact snapshot usage.
* Existing PR ingestion model.
* Existing CI linkage model.
* Existing evidence event model.

## What Humans Need to Ask

* Should one ticket always map to one PR?
* Should future versions support multiple PRs?
* Should completeness thresholds be configurable?

## Conditions Under Which Implementation Is Not Permitted

* Existing traceability table is unavailable.
* Ticket identifier cannot be reliably determined.
* Required ingestion sources are unavailable.
* Matching rules conflict with existing architecture.
    