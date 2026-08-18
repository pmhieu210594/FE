# Source Availability

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17
**Author**: ChatGPT
**Update date**: 2026-06-17

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Latest source | `documents/docs/changes/CI-RUN-METADATA/raw/requirement.md` | read | high | PM / BE | Baseline functional scope and AC | low | always-read |
| DB definition | `documents/docs/changes/CI-RUN-METADATA/raw/database_design.md` | read | high | BE / DB | Canonical table intent for this ticket | high | required-if-db |
| Ticket rules | `documents/docs/changes/CI-RUN-METADATA/ticket-rules.md` | read | high | BE / QA | Stop / ask conditions and scope guards | medium | always-read |
| Architecture map | `documents/docs/architecture/*.md` | read | high | BE / FE | Caller / callee and affected area mapping | medium | always-read |
| Standards | `documents/docs/standards/*.md` | read | high | BE / FE / DB | Coding, logging, test, security, API rules | medium | always-read |
| Current BE source | `EDCAP_BE/src/main/java/com/sdd/platform/**` | read / partial | high | BE | Reuse existing service, adapter, model, and test patterns | medium | always-read |
| Current DB migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read / partial | high | DB | Existing CI table shape and constraints | high | verify-with-source |
| Current FE source | `EDCAP_FE/src/lib/api.ts`, `EDCAP_FE/src/pages/SafetyEvidencePage.tsx` | read | medium | FE | Closest current table-based evidence UI pattern | medium | verify-with-source |
| Existing tests | `EDCAP_BE/src/test/java/com/sdd/platform/**`, `EDCAP_FE/src/__ tests __/**` | read / partial | medium | QA | Pattern source for unit/integration coverage | medium | verify-with-source |
| Spec pack | `documents/docs/changes/CI-RUN-METADATA/spec-pack.md` | unavailable | medium | PM / BE | Expected Phase 3 input | high | human-intake |
| CI-specific BE endpoint | not found in current route map | unavailable | medium | BE | Query / ingest API for CI metadata | medium | human-intake |

## Summary

- Requirement and database-design raw inputs are available and consistent on the MVP intent: GitHub Actions job-level metadata, one row per job, approved `tbl_` tables only.
- The current codebase already contains CI-related legacy schema and models, but they do not match the ticket grain exactly.
- No confirmed CI-specific controller, service, or FE page exists yet in the current source tree.

## Unavailable / Partial Sources

- `spec-pack.md` is missing from the ticket folder.
- The exact CI trigger mode is still open: scheduled batch, manual admin trigger, or webhook-based collection.
- The exact GitHub Actions auth method is still open.
- The exact status mapping for ambiguous GitHub conclusions is still open.
- The current `tbl_fact_ci_run` schema in V4 is run-level, while the ticket requirement is job-level.

## Risk Before Implementation

- Schema drift risk is high because existing DB objects already use the `tbl_fact_ci_run` name with a different grain.
- Counter naming risk is high because `tbl_connector_run` currently exposes `records_read` and `records_written`, not the full `received / inserted / updated / skipped / error` set.
- FE scope risk is medium because no CI-specific page or API contract is currently present.
- Test risk is medium because there is no existing CI metadata test suite.

## Required Human Decision

- Confirm the GitHub Actions authentication method.
- Confirm the collection trigger mode.
- Confirm whether the ticket must deliver FE dashboard/detail work now or only backend persistence plus query support.
- Confirm whether the current V4 CI tables should be altered in place or a new migration should reconcile the schema gap.
- Confirm the exact mapping for ambiguous GitHub conclusions such as `neutral`, `timed_out`, and `action_required`.
