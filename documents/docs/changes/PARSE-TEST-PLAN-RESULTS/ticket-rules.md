# Ticket Rules - PARSE-TEST-PLAN-RESULTS

## 1. Scope Rules
- Parse only `test-plan.md` and `test-results.md`.
- Do not expand into other ticket artifacts in this task.
- Do not require CI to determine whether parsing runs.
- Keep parser output to structured snapshot + parsed sections.

## 2. Data Grain Rules
- One snapshot row per parsed artifact file version.
- `test-plan.md` and `test-results.md` are stored independently.
- UI may display them as a pair for one ticket, but storage remains per artifact.

## 3. Persistence Rules
- Reuse existing project DB tables.
- Do not introduce long-lived parse-specific tables that duplicate artifact snapshot responsibilities.
- Persist only parsed summaries and extracted sections.
- Do not store raw markdown as primary persisted data.

## 4. Parsing Rules
- Use canonical keys from the template sections.
- Missing required sections must be marked explicitly.
- Placeholder text must be detected and recorded as a parse warning or partial status.
- Invalid structure must produce `PARSE_ERROR` or `PARTIAL` depending on recoverability.

## 5. Idempotency Rules
- Same `ticket_id + source_path + source_hash + parser_version` must not create duplicate logical snapshots.
- Re-parse of the same hash must update or replace the snapshot atomically.

## 6. UI Rules
- Show `test-plan.md` and `test-results.md` in a paired ticket view.
- Allow independent snapshot history per file.
- Do not require CI to render the parser UI.

## 7. Forbidden Rules
- Do not invent methods or APIs that are not confirmed in source.
- Do not add draft/official CI-gated parse branches.
- Do not store raw payloads, secrets, or tokens.
- Do not change the template field names without explicit approval.
