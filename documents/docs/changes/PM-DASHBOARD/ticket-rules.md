# Ticket Rules

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: Codex
**Update date**: 2026-06-25

## Must Follow

* Keep Phase 2 limited to context, rules, planning, and skeleton artifacts.
* Follow `docs/changes/PM-DASHBOARD/sources.md` and `docs/changes/PM-DASHBOARD/spec-pack.md` as the source of truth for this ticket.
* Treat `raw/database_design.md` as non-authoritative and do not use it as direct migration input.
* Before any later implementation, read the target source and the existing tests again.
* Reuse existing FE helper patterns from `EDCAP_FE/src/lib/api.ts`.
* Reuse existing BE hexagonal patterns: web -> application -> domain/ports -> infrastructure.
* Keep PM Dashboard read-only.
* Treat `EQS` as a numeric aggregate score and `score_band` as the label/status.
* Use standard backend error handling with `ErrorResponse` and `traceId`.
* Keep logs free of PII, raw evidence content, secrets, and internal paths.
* Preserve i18n and UTF-8 safety in all FE-facing text.
* If a method/API/table is not confirmed in source, treat it as unavailable.
* If a decision is still open in spec-pack, do not guess it into the artifact.

## Must Not Do

* Do not implement PM Dashboard runtime code in Phase 2.
* Do not invent `PmDashboardController`, `PmDashboardService`, or `endpoints.pmDashboard.*`.
* Do not create a new PM Dashboard snapshot table or migration unless a later phase explicitly approves it.
* Do not add direct `fetch` calls in page components.
* Do not import infrastructure classes from the web layer.
* Do not use ad-hoc backend error bodies.
* Do not copy the stale JWT wording from `documents/docs/architecture/overview.md` as the final auth decision.
* Do not treat `open issues`, `exception`, or refresh behavior as implemented facts.
* Do not hardcode score thresholds, permissions, or refresh/export rules that are still open.
* Do not display personal names or personal ranking in the dashboard.

## Stop / Ask Conditions

* EQS formula or score rule version is still undefined.
* Score band threshold values are still undefined.
* Permission matrix for view/export/refresh is still undefined.
* `open issues` definition is still undefined.
* `exception` storage or meaning is still undefined.
* Read-model strategy is still undefined.
* A new API route, DTO, migration, or worker is requested without a spec update.
* A proposed solution depends on a method or helper that does not exist in source.

## Review Focus

* Scope fidelity to PM Dashboard only.
* No hallucinated APIs, DTOs, jobs, or migrations.
* FE uses typed endpoint helpers and existing UI primitives.
* BE respects hexagonal layering.
* Read-only posture is preserved.
* PII and raw evidence content stay out of logs and UI.
* Ticket rules and context stay aligned with spec-pack and sources.

## Test Focus

* Later phases should cover landing page load, empty state, search, filters, row click, read-only drawer, permission gating, and export/refresh entry points if they become real.
* Later BE/API tests should cover summary/list/detail error handling and standard traceId behavior.
* Later FE tests should cover query state, filter state, and no-write-action behavior.
