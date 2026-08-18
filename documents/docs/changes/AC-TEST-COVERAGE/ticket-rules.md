# Ticket Rules:

**Ticket ID**: AC-TEST-COVERAGE
**Create date**: 2026-06-26  
**Author**: OpenAI
**Update date**: 2026-06-26  

## Must Follow

- Do not add specifications that are not present in `spec-pack.md`.
- Treat `spec-pack.md` as the single source of truth for AC keys.
- Treat `test-plan.md` as the only source of planned test case coverage.
- Treat `test-results.md` and CI summary as supporting evidence only.
- Read the existing source and tests before changing anything.
- Reuse existing parser, validation, persistence, and read-model patterns first.
- Keep warnings and data-quality issues visible; do not fail silently.
- Preserve UTF-8, AC keys, code values, and exact status labels.
- Use enums / constants / master data instead of magic values.
- Do not log or persist raw chat, raw prompt, secrets, or full source text.
- Keep the feature parser-only; do not introduce manual mapping or pinning.

## Must Not Do

- Do not create a standalone business screen for AC-Test Coverage in this ticket.
- Do not add FE-side coverage recomputation or duplicate business rules in the client.
- Do not introduce a new coverage table in the MVP unless reuse-first is proven insufficient.
- Do not invent new AC IDs, test-case IDs, or status codes.
- Do not add manual override controls for coverage linkage.
- Do not depend on nonexistent endpoints such as `/api/v1/ac-test-coverage`.
- Do not use raw SQL bypasses or direct persistence outside the existing ports/adapters.
- Do not store raw CI logs or raw markdown text beyond the current parser metadata model.

## Stop / Ask Conditions

- `spec-pack.md` lacks numbered ACs or a stable AC key mapping.
- `test-plan.md` does not contain usable AC-to-test references.
- `test-results.md` or CI summary behavior would require a new source contract.
- A new table, new API, or a manual mapping workflow becomes necessary.
- The ticket scope expands from dashboard read model into a new user-facing workflow.
- The code path would need to persist raw source text, prompt text, or secrets.

## Review Focus

- AC traceability back to `spec-pack.md`.
- Planned coverage comes only from `test-plan.md`.
- Executed evidence and CI are supporting inputs, not canonical inputs.
- Status semantics stay stable: `MISSING`, `UNTESTED`, `PARTIAL`, `PASSED`, `FAILED`, `UNKNOWN`.
- Warnings / data-quality issues remain visible and auditable.
- No manual mapping, pinning, or FE-side recompute.
- No raw text leakage in logs, DB, or artifacts.

## Test Focus

- AC extraction stability from `spec-pack.md`.
- Planned coverage lookup from `test-plan.md`.
- Executed evidence linkage from `test-results.md`.
- CI summary is only a weak supporting signal.
- Missing / empty / partial / conflicting evidence handling.
- Idempotency of parse / recompute operations.
- Dashboard response remains read-only and AC-first.
