# Requirement — `impl-plan.md` parser (MVP)

**Ticket ID**: PARSE-IMPL-PLAN
**Feature**: `impl-plan.md` parser (MVP)
**Goal (PoC)**: Two-phase parsing (`DRAFT` → `OFFICIAL`) to extract structured fields from `docs/changes/{{TICKET}}/impl-plan.md` for review, traceability, dashboarding and snapshot persistence.

## 1. Purpose

This PoC only normalizes and parses the ticket `impl-plan.md`. Objectives:

1. Detect whether the file conforms to the template.
2. Extract defined fields from the `impl-plan.md` template reliably.
3. Separate `DRAFT` vs `OFFICIAL` parse modes.
4. Persist official snapshot only when CI/gate passes.
5. Store structured parse results for UI and downstream phases.

## 2. Required flow (PoC)

The parser flow must follow:

1. PR / push / webhook triggers parsing.
2. Draft parse runs immediately and detects missing sections, placeholders or invalid structure.
3. If CI/gate passes, run official parse and persist a canonical snapshot.
4. Official parse writes snapshot rows to the DB.
5. Dashboard shows draft/official status and extracted fields.
6. If CI fails, only the draft parse is retained; do not create an official snapshot.

## 3. Scope

In scope:

- Parse `impl-plan.md` using the template section map.
- Persist parse mode, source path, source hash, parse status and error summary.
- Expose parse results for authorized users.
- Filter and query by ticket, parse mode, and status.

Out of scope:

- Parsing other document types in this PoC.
- Generating code from the document.
- Automatic rollback execution.
- Mutating source files automatically.
- Persisting unnecessary raw payloads.

## 4. Inputs

- `docs/changes/{{TICKET}}/impl-plan.md`
- `docs/changes/{{TICKET}}/spec-pack.md` (for AC/context)
- `docs/changes/{{TICKET}}/context.md` (optional)
- `docs/changes/{{TICKET}}/sources.md` (optional)
- CI gate result to determine whether to persist official snapshot

## 5. Outputs

The parser must produce standardized output:

- `ticketId`
- `parseMode` (`DRAFT` / `OFFICIAL`)
- `sourcePath`
- `sourceHash`
- `parseStatus`
- extracted `field` values per `impl-plan.md` template
- `parseErrorSummary` (if any)
- `isOfficialSnapshot` flag when official parse completes

## 6. Fields to extract (template)

Canonical `field_key` list (maps to `field_key` in persistence and FE):

1. `implementation_principle`
2. `alternative_plan`
3. `reason_for_chosen_plan`
4. `expected_change_file`
5. `class_function_method_to_add_or_modify`
6. `sql_query_repository_policy`
7. `validation_error_logging_policy`
8. `migration_rollback_policy`
9. `step_implementation`
10. `how_to_verify_each_step`
11. `corresponding_ac_table`
12. `stop_ask_condition`
13. `do_not_do_this_ticket`
14. `open_related_issues`

Each extracted section is stored as one parsed-field row linked to a snapshot.

## 7. Functional requirements (selected)

- FR-1: The system must parse the artifact identified as `impl-plan.md`.
- FR-2: Draft parse runs automatically on source change.
- FR-3: Official parse is persisted only after CI/gate `PASS`.
- FR-4: Extract all fields defined in the `impl-plan.md` template.
- FR-5: Missing required sections must yield `PARTIAL` or `PARSE_ERROR` status.
- FR-6: Re-parsing the same source/hash should upsert (idempotency).
- FR-7: The system must present list and detail views for parse results.
- FR-8: If CI fails, do not persist an official snapshot.
- FR-9: Persist only metadata and extracted fields; avoid storing raw payloads.

## 8. Acceptance criteria

- AC-1: Parser extracts `impl-plan.md` according to the template.
- AC-2: Draft vs Official parse modes are distinguishable and persisted.
- AC-3: All template fields are extracted and stored.
- AC-4: Missing/invalid sections are reflected in parse status.
- AC-5: Official snapshot written only when CI/gate `PASS`.
- AC-6: Re-parse of same content does not create duplicate snapshots.
- AC-7: Authorized users can view parse list and details.

## 9. Non-goals (PoC)

- No generic document parsing beyond `impl-plan.md`.
- No code generation.
- No automatic rollback execution.
- No persistence of unnecessary raw payloads or logs.
