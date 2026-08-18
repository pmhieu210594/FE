# Spec Pack

**Ticket ID**: PARSE-IMPL-PLAN  
**Create date**: 2026-06-18  
**Author**: ChatGPT  
**Update date**: 2026-06-19  

## 1. Context / Purpose

This ticket defines a PoC parser for `docs/changes/{{TICKET}}/impl-plan.md`.

The purpose is to convert the template-based implementation plan into structured data so that later phases can display, validate, and store the parsed result consistently.

The parser is limited to the `impl-plan.md` artifact and does not include `impact-analysis.md`.

## 2. Scope

### 2.1. Within range

- Read `docs/changes/{{TICKET}}/impl-plan.md`.
- Parse the template sections defined for `impl-plan.md`.
- Extract structured fields for each required section.
- Track parsing status and source hash.
- Support later display, review, and persistence.

### 2.2. Out of range

- Parsing `impact-analysis.md`
- Generating implementation code from the plan
- Executing the described implementation steps
- Rewriting or auto-fixing the source file
- Parsing unrelated ticket artifacts in this ticket

## 3. Terminology
| terms | meaning | notes |
|---|---|---|
| impl-plan.md | Implementation plan artifact | Ticket-scoped markdown file |
| template section | A named section defined by `_ticket-template/impl-plan.md` | Primary parse target |
| parse result | Normalized output produced by the parser | May be stored and displayed later |
| source hash | Hash of the source file content | Used for idempotency |
| parse status | Status of parsing result | SUCCESS / PARTIAL / NOT_FOUND / PARSE_ERROR |

## 4. As-Is

- The implementation plan exists as a markdown file, but it is not yet available as structured data.
- Reviewers must read the file manually to understand implementation principle, rollback, AC mapping, and open issues.
- Missing sections can easily be overlooked during review.

## 5. To-Be

- The parser reads the ticket-scoped `impl-plan.md`.
- The parser extracts the template-driven sections into structured fields.
- The parser records the file source, hash, and parse status.
- The parsed result can be reviewed without re-reading the whole markdown file.

## 6. Detailed specification

### 6.1. Business Rules

1. The parser target is only `impl-plan.md`.
2. The parser output must align with the template-defined sections.
3. If a section is missing, the parser must record that explicitly.
4. If the file is missing, parsing must not silently succeed.
5. Parse results should be reproducible for the same source hash.

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| ticket_id | string | yes | must be present | Ticket scope key |
| source_path | string | yes | must point to `impl-plan.md` | Example: `docs/changes/ABC-123/impl-plan.md` |
| source_text | markdown | yes | non-empty unless missing-file case | Input artifact |
| source_hash | string | yes | stable hash format | Used for idempotency |
| parser_version | string | yes | version string required | Helps future rerun / compatibility |

### 6.3. Output
| item | type | format | notes |
|---|---|---|---|
| implementation_principle | text | parsed section | Section 1 |
| alternative_plan | table/text | parsed section | Section 2 |
| reason_for_chosen_plan | text | parsed section | Section 3 |
| expected_change_file | table | parsed section | Section 4 |
| class_function_method_to_add_or_modify | table | parsed section | Section 5 |
| sql_query_repository_policy | text/table | parsed section | Section 6 |
| validation_error_logging_policy | text/table | parsed section | Section 7 |
| migration_rollback_policy | text/table | parsed section | Section 8 |
| step_implementation | table | parsed section | Section 9 |
| how_to_verify_each_step | text | parsed section | Section 10 |
| corresponding_ac_table | table | parsed section | Section 11 |
| stop_ask_condition | text | parsed section | Section 12 |
| do_not_do_this_ticket | text | parsed section | Section 13 |
| open_related_issues | table/text | parsed section | Section 14 |
| parse_status | enum | normalized | SUCCESS / PARTIAL / NOT_FOUND / PARSE_ERROR |
| parse_error_summary | text | optional | Safe summary only |

### 6.4. Error / Exception
| case | expected behavior | message/code | notes |
|---|---|---|---|
| file not found | mark `NOT_FOUND` | file_missing | Do not crash |
| missing one or more sections | mark `PARTIAL` | section_missing | Record missing section names |
| malformed markdown | mark `PARSE_ERROR` | parse_failed | Safe summary only |
| duplicated section heading | mark `PARTIAL` or `PARSE_ERROR` | duplicate_section | Decision should be consistent |
| unsupported encoding | mark `PARSE_ERROR` | encoding_unsupported | No mojibake leak |

### 6.5. Boundary Value
| item | min | max | special cases | expected |
|---|---|---|---|---|
| file length | empty | very long | truncated file | parse status reflects reality |
| section count | 0 | all sections present | duplicated sections | section-level result recorded |
| text language | ASCII only | mixed multilingual | Vietnamese/Japanese/English mix | no encoding corruption |
| tables | empty | many rows | malformed table syntax | safe parse result |

### 6.6. Non-functional
| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Parse a single file quickly | PoC target: near-instant / under 1s on normal file | Unit/integration test | Do not over-optimize |
| Security | No secret/raw payload persistence | 0 raw secret retained | Review + negative test | Metadata only |
| Availability / Reliability | Parsing must not crash the flow | Errors become explicit statuses | Failure-path test | Safe failure |
| Maintainability | Sections must map clearly to template | Versioned mapping | Code review | Template-driven parser |
| Observability / Logging | Parser issues must be traceable | Safe parse error summary | Log review | No sensitive logs |
| Compatibility | Should tolerate minor markdown formatting differences | Stable across valid template variants | Fixture test | Avoid brittle regex only |

## 7. Acceptance Criteria
| ACID | description | testable? | notes |
|---|---|---|---|
| AC-PARSE-IMPL-PLAN-1 | System can detect `impl-plan.md` in a ticket folder | Yes | File existence test |
| AC-PARSE-IMPL-PLAN-2 | System extracts `implementation_principle` | Yes | Section parse test |
| AC-PARSE-IMPL-PLAN-3 | System extracts `alternative_plan` and `reason_for_chosen_plan` | Yes | Section parse test |
| AC-PARSE-IMPL-PLAN-4 | System extracts all required template sections from a valid file | Yes | Full parse test |
| AC-PARSE-IMPL-PLAN-5 | Missing sections produce `PARTIAL` or `PARSE_ERROR` explicitly | Yes | Negative test |
| AC-PARSE-IMPL-PLAN-6 | Same source hash does not create duplicate parse result | Yes | Idempotency test |
| AC-PARSE-IMPL-PLAN-7 | Parse result is available for later query/display | Yes | Storage/query test |

## 8. Examples

### 8.1. Normal Case

A valid `impl-plan.md` contains all required template headings.  
The parser extracts:
- implementation principle
- alternative plan
- reason for chosen plan
- expected change file
- class/function/method changes
- SQL/query/repository policy
- validation/error/logging policy
- migration/rollback policy
- implementation steps
- verification steps
- AC mapping
- stop/ask conditions
- prohibited actions
- open related issues

### 8.2. Error Case

The file exists but the `Migration / Rollback Policy` section is missing.

Expected behavior:
- parse status becomes `PARTIAL`
- missing section is recorded
- parse still returns other extracted sections if possible

### 8.3. Boundary Case

The file exists but contains:
- extremely long bullet lists
- empty tables
- mixed Vietnamese and English text
- duplicate section headings

Expected behavior:
- parser remains stable
- status reflects the parse quality
- no sensitive data is leaked in logs

## 9. Source Availability Summary

| source | availability | note |
|---|---|---|
| `impl-plan.md` template | available | Primary source for headings and field names |
| Template field map file | available | Confirms section-to-field mapping |
| Existing parser implementation | not confirmed | Not assumed |
| Existing tests | not confirmed | Not assumed |
| Example `impl-plan.md` content | partially available | Enough for phase-1 specification work |

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: BE only / DB
- Primary risk: Spec / Source / Parsing / DB
- Review mode: Standard
- Required options: Source Analysis / DB Migration
```

## 11. FE/BE Contract Impact

The parser may expose a backend response for:
- parse result list
- parse result detail
- parse status by ticket

If a FE screen is added later, it should display the parsed sections as read-only text and tables.

## 12. DB/Migration Impact

The parser must reuse existing DB tables:
- `tbl_fact_artifact_snapshot` for the main parse snapshot
- `tbl_fact_artifact_parsed_section` for per-section records

The snapshot row must capture:
- ticket linkage
- repository linkage
- artifact type linkage
- source path
- source hash / content hash
- parser version
- parse status metadata in JSON or existing columns

The DB design already supports idempotent re-parse by `(repository_id, source_path, content_hash)`.

## 13. Security/Privacy Impact

- Do not store raw secret material.
- Do not log sensitive file contents unnecessarily.
- Parse result storage should be limited to the sections needed for the ticket.
- Error logging must be sanitized.

## 14. Operation/Maintenance Impact

- Parser should be rerunnable.
- Parser version should be tracked.
- Parse failures should be visible via explicit status.
- Maintenance should not require editing the raw source file to recover.

## 15. Test Strategy Summary

- Unit test: section extraction for valid template files.
- Unit test: missing section handling.
- Unit test: duplicate heading handling.
- Integration test: source file -> parser -> result storage.
- Negative test: missing file / malformed markdown / unsupported encoding.
- Idempotency test: re-parse same hash does not duplicate records.

## 16. Human Decision Required
| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| H-PARSE-IMPL-PLAN-1 | Whether to store raw section text or only normalized fields | Affects storage shape and UI | Product/BE | Open |
| H-PARSE-IMPL-PLAN-2 | Whether `PARTIAL` should be distinct from `PARSE_ERROR` | Affects status semantics | Product/QA | Open |
| H-PARSE-IMPL-PLAN-3 | Whether any extra JSON metadata beyond the existing snapshot columns is needed | Impacts the summary payload | BE/DB | Open |

## 17. Assumptions and Inference Log
| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-PARSE-IMPL-PLAN-1 | Template section names are stable enough to parse | Template definition file | Medium | Yes |
| A-PARSE-IMPL-PLAN-2 | The parser target is only `impl-plan.md` | User clarification | Low | Confirmed |
| A-PARSE-IMPL-PLAN-3 | Parse result needs idempotent storage by source hash | PoC operation need | Medium | Yes |

## 18. Open Issues
| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-PARSE-IMPL-PLAN-1 | Decide raw section retention policy | Storage / privacy | Product/BE | Open |
| OI-PARSE-IMPL-PLAN-2 | Decide exact parse status enum behavior | UX / test logic | QA/BE | Open |
| OI-PARSE-IMPL-PLAN-3 | Confirm whether JSON summary fields are sufficient for review queries | Implementation blocker | BE/DB | Open |
