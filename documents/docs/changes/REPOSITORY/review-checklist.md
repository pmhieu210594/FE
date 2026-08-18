# Review Checklist

**Ticket ID**: REPOSITORY-CRUD  
**Create date**: 2026-06-19  
**Author**: Codex  
**Update date**: 2026-06-19

## Sources Of Truth

Use these documents as the baseline for review:

- [`spec-pack.md`](spec-pack.md)
- [`context.md`](context.md)
- [`impact-analysis.md`](impact-analysis.md)
- [`impl-plan.md`](impl-plan.md)
- [`docs/standards/api-contract.md`](../../standards/api-contract.md)
- [`docs/standards/backend.md`](../../standards/backend.md)
- [`docs/standards/database.md`](../../standards/database.md)
- [`docs/standards/error-handling.md`](../../standards/error-handling.md)
- [`docs/standards/frontend.md`](../../standards/frontend.md)
- [`docs/standards/logging.md`](../../standards/logging.md)
- [`docs/standards/maintenance.md`](../../standards/maintenance.md)
- [`docs/standards/review.md`](../../standards/review.md)
- [`docs/standards/security.md`](../../standards/security.md)
- [`docs/standards/testing.md`](../../standards/testing.md)
- [`.claude/rules/00-safety.md`](../../../.claude/rules/00-safety.md)
- [`.claude/rules/10-style.md`](../../../.claude/rules/10-style.md)
- [`.claude/rules/20-architecture.md`](../../../.claude/rules/20-architecture.md)
- [`.claude/rules/30-security.md`](../../../.claude/rules/30-security.md)
- [`.claude/rules/40-testing.md`](../../../.claude/rules/40-testing.md)

## How To Use

- Mark every item that applies to the final implementation.
- Record any failure as a concrete finding with severity.
- Prefer evidence from code, tests, migration files, or runtime output.
- If a decision remains unresolved in the spec, call it out instead of guessing.

## Severity

- `Blocker`: release-breaking, security-breaking, data-loss risk, or contract breakage that must be fixed before merge.
- `Major`: correctness, maintainability, or supportability issue that materially weakens the feature.
- `Minor`: polish, documentation, or low-risk improvement that can be scheduled later.

## 1. Spec / AC Alignment

- [X]  Implemented behavior matches `spec-pack.md` scope and out-of-scope boundaries.
- [X]  Acceptance criteria `AC-REPOSITORY-1` through `AC-REPOSITORY-8` are all traceable in code or tests.
- [X]  Repository list excludes soft-deleted rows by default.
- [X]  Repository detail behavior for soft-deleted rows matches the confirmed business rule in the spec.
- [X]  Repository name normalization, validation, and duplicate scope match the spec.
- [X]  Any unresolved item from `spec-pack.md` is surfaced explicitly, not silently assumed.

## 2. General System Review

- [X]  End-to-end data flow is consistent across FE, BE/API, and DB.
- [X]  Naming and API shape match existing platform conventions.
- [X]  No unrelated feature behavior changed as a side effect.
- [X]  Error handling follows the platform contract and preserves traceability.
- [X]  The implementation stays within the documented architecture boundaries.

## 3. FE Review

- [X]  Route, page, drawer, list, and mutation flows match the existing CRUD patterns.
- [X]  FE uses `src/lib/api.ts` helpers and does not call `fetch` directly.
- [X]  User-visible strings are localized and no hardcoded English was introduced.
- [X]  Validation is present in the UI but does not replace backend validation.
- [X]  Deleted-row UI behavior is read-only and does not expose disallowed actions.
- [X]  Success/error refresh behavior matches the user workflow in the spec.

## 4. BE/API Review

- [X]  Controller endpoints are under `/api/v1/repositories`.
- [X]  Success responses remain raw DTOs or raw DTO lists.
- [X]  Error responses use `ErrorResponse` and the global exception flow.
- [X]  Authorization is enforced on every mutating action.
- [X]  Duplicate-name and not-found behavior matches the spec.
- [X]  Soft delete is implemented without physical deletion.

## 5. DB/Migration Review

- [X]  Storage uses `tbl_dim_repository` and V5+ naming conventions.
- [X]  Migration changes are additive only and do not edit committed migration files.
- [X]  Soft-delete columns and active-row filtering are present and correct.
- [X]  Uniqueness enforcement matches the active-row project-scoped rule.
- [X]  Any DB constraint or index change is covered by tests or migration evidence.

## 6. Security/Privacy Review

- [X]  No secrets, tokens, or credentials were added to code, docs, logs, or tests.
- [X]  Permission checks are backend-enforced and not replaced by FE-only hiding.
- [X]  Error messages do not leak stack traces or sensitive internal state.
- [X]  Trace/correlation handling is preserved without exposing unnecessary PII.
- [X]  Any repository URL handling follows the documented raw-display / encoded-storage rule.

## 7. Operation/Maintenance Review

- [X]  Soft delete preserves history and does not create maintenance surprises.
- [X]  Logging and traceability are sufficient for support and incident diagnosis.
- [X]  The implementation aligns with existing admin CRUD maintenance patterns.
- [X]  Rollback/recovery considerations are documented or evident from the implementation.
- [X]  Future backfill or cleanup work would still respect active-row uniqueness.

## 8. Test Review

- [X]  FE unit tests cover API helper behavior, validation, and screen interactions.
- [X]  BE unit tests cover core business rules and duplicate detection.
- [X]  BE web tests cover permission, validation, not-found, and error-shape behavior.
- [X]  DB or migration tests cover schema and uniqueness behavior where applicable.
- [X]  E2E tests cover the main CRUD journey and deleted-row behavior.
- [X]  Test names and assertions map back to the AC table below.

## 9. Documentation / Traceability Review

- [X]  The implementation links back to the ticket docs and current standards.
- [X]  File names, paths, and route names are documented consistently.
- [X]  Decisions and assumptions are separated from confirmed facts.
- [X]  Any gap between spec and implementation is called out explicitly.
- [X]  The self-review template can be completed from the actual work artifacts.

## 10. Release / Rollback Review

- [X]  The change can be released incrementally without breaking unrelated features.
- [X]  Rollback steps are feasible for FE, BE, and DB separately.
- [X]  No committed migration was edited in place.
- [X]  Any deployment or feature-flag dependency is identified if applicable.
- [X]  The release path preserves current platform behavior for unaffected routes.

## 11. AC Mapping

| AC | What to verify | Evidence to look for | Severity if missing |
|---|---|---|---|
| AC-REPOSITORY-1 | `GET /api/v1/repositories` returns only active rows in the expected page shape | List API response, FE list view, list test | Blocker |
| AC-REPOSITORY-2 | Detail API returns repository payload including parent project name | Detail API, FE drawer/detail view, detail test | Major |
| AC-REPOSITORY-3 | Valid create request persists a repository and returns created payload | Create form, API response, create test | Blocker |
| AC-REPOSITORY-4 | Valid update request persists changes and rejects duplicates in the same project | Update flow, duplicate rule test | Blocker |
| AC-REPOSITORY-5 | Soft delete only, with removal from default list results | Delete endpoint, list refresh, delete test | Blocker |
| AC-REPOSITORY-6 | Invalid input, missing ID, or missing permission returns platform-standard error shape | Web/API tests, error handling evidence | Blocker |
| AC-REPOSITORY-7 | FE refreshes list/detail state and shows expected messaging after mutation | FE mutation tests, E2E journey | Major |
| AC-REPOSITORY-8 | Name trimming is applied before validation and persistence | Form normalization, backend trim/validation test | Major |

## 12. Review Findings Log

| ID | Area | Severity | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| F-001 |  |  |  |  |  |
| F-002 |  |  |  |  |  |
| F-003 |  |  |  |  |  |
