# Test Plan

**Ticket ID**: PARSE-IMPL-PLAN
**Create date**: 2026-06-18
**Author**: ChatGPT
**Update date**: 2026-06-19

## 1. Purpose

Verify that the parser can read ticket-scoped `impl-plan.md`, extract the required template sections, and persist/query the parse result safely.

## 2. AC Matrix ↔ Test Type

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-PARSE-IMPL-PLAN-1 |  | x | x |  | x |  | x |
| AC-PARSE-IMPL-PLAN-2 |  | x | x | x | x |  | x |
| AC-PARSE-IMPL-PLAN-3 |  | x | x |  |  |  | x |
| AC-PARSE-IMPL-PLAN-4 |  | x | x |  |  |  | x |
| AC-PARSE-IMPL-PLAN-5 |  | x | x |  | x |  | x |
| AC-PARSE-IMPL-PLAN-6 |  | x | x |  | x |  | x |
| AC-PARSE-IMPL-PLAN-7 |  | x | x |  | x |  | x |

## 3. Priority
| test item | priority | reason |
|---|---|---|
| File detection and section extraction | P0 | Core parser behavior |
| Missing section handling | P0 | Prevents silent failure |
| Idempotent re-parse | P0 | Avoid duplicate records |
| PARSE_ERROR path (empty source) | P0 | Explicit status for blank input |
| Safe logging / malformed markdown | P1 | Reliability and privacy |
| Read-model / API display | P1 | Later review usage |

## 4. Reuse Existing Test
| existing test | path | covers | gap |
|---|---|---|---|
| `parse_success_persists_all_sections_and_allows_detail_lookup` | `ImplPlanParseServiceTest.java` | AC-1, AC-2, AC-3, AC-4, AC-7 | None |
| `parse_missing_section_returns_partial_and_records_missing_field` | `ImplPlanParseServiceTest.java` | AC-5 (missing section → PARTIAL) | None |
| `parse_duplicate_heading_returns_partial` | `ImplPlanParseServiceTest.java` | AC-5 (duplicate heading → PARTIAL + warning) | None |
| `parse_not_found_persists_snapshot_for_ui_visibility` | `ImplPlanParseServiceTest.java` | AC-1 (NOT_FOUND — snapshot persisted for UI) | None |
| `parse_same_hash_upserts_existing_snapshot_instead_of_duplication` | `ImplPlanParseServiceTest.java` | AC-6 (idempotency) | None |

> Note: self-review.md §2 referenced an older method name `parse_not_found_skips_snapshot_storage`. The actual implementation persists the snapshot for UI visibility. Self-review will be updated separately.

## 5. Additional Test This Time
| test | type | target | related AC |
|---|---|---|---|
| `parse_empty_source_returns_parse_error` | BE UT | `parse()` empty-string path → PARSE_ERROR | AC-5 |
| `parse_malformed_markdown_safe_summary_does_not_leak_content` | BE UT | `parse()` garbled heading input — stability + no raw content leak in warnings | AC-5, non-functional security |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| Parse success scenario | Valid impl-plan exists | Run parser | Parse result is SUCCESS and all 14 sections are present | AC-1..4 |
| Missing section scenario | File missing one heading | Run parser | Parse result is PARTIAL and missing section is reported | AC-5 |

## 6. Areas intentionally left untested this time
| area | reason | risk |
|---|---|---|
| FE UT | No FE screen approved for PoC | Low |
| API IT (`ImplPlanParseController`) | Demo controller is read-only; not a PoC gate | Low |
| DB integration test (live SQL adapter) | In-memory port covers behavioral contract; live DB deferred to next cycle (self-review §8) | Medium — SQL adapter is compile-verified but not runtime-tested |
| E2E (full stack) | PoC scope; no full environment configured | Low |
| Encoding corruption path | Source text is Java String (already decoded upstream); byte-level encoding corruption would be an upstream concern | Low |

## 7. Data testing principles

- Use only inline string fixtures defined in the test class (no external files, no production data).
- Fixture content must not contain secrets, tokens, passwords, or real personal data.
- All fixtures derive from `fullMarkdown()` via substring replacement — no external fixture files needed.
- New fixtures (`parse_empty_source`, `parse_malformed_markdown`) are pure ASCII in-class literals.
- Do not use real ticket content from production tickets as fixture input.

## 8. Execution command
| command | purpose |
|---|---|
| `mvn -q -Dtest=ImplPlanParseServiceTest test` | Run all parser unit tests |
| `mvn -q -DskipTests compile` | Compile full project after wiring changes |

## 9. Stop Condition

- If the heading map is ambiguous, stop and confirm.
- If the parser needs guessed methods/APIs, stop and confirm.
- If a fixture produces raw secret logging, stop and fix.
- If empty-source PARSE_ERROR path changes semantics (e.g., reverted to NOT_FOUND), re-evaluate AC-5 coverage.

## 10. Required Human Decision

- Final table / migration name for parse result storage
- Whether a FE screen is in scope
- Whether any additional template aliases are allowed
- Whether `PARTIAL` and `PARSE_ERROR` must remain distinct enums for downstream UX (OI-PARSE-IMPL-PLAN-2)
