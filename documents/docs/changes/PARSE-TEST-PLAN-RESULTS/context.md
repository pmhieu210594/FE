# Context

**Ticket ID**: PARSE-TEST-PLAN-RESULTS  
**Create date**: 2026-06-19  
**Author**: OpenAI  
**Update date**: 2026-06-19  

## Screen / API / Batch / Related Job

- Parser screen for `test-plan.md` and `test-results.md`
- Snapshot list view for the parsed artifacts
- Ticket-level paired view showing `test-plan.md` and `test-results.md` together
- Parser execution job triggered from PR / push / webhook or equivalent ingest entrypoint

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Artifact snapshot persistence | `EDCAP_BE/src/main/java/...` | Reuse artifact snapshot + parsed section pattern for parse results |
| Pair-view display | `EDCAP_FE/src/pages/...` | Render one ticket with multiple parsed artifacts as tabs/sections |
| Upsert / idempotent parse | `EDCAP_BE/src/main/java/...` | Replace sections atomically for one source hash |
| Safe parse error handling | `EDCAP_BE/src/main/java/...` | Return parse status + error summary only |

## Allowed common components
| component | path | usage note |
|---|---|---|
| Artifact snapshot repository / adapter | `EDCAP_BE/src/main/java/...` | Persist snapshot metadata |
| Parsed section repository / adapter | `EDCAP_BE/src/main/java/...` | Persist extracted field rows |
| Existing parser service pattern | `EDCAP_BE/src/main/java/...` | Reuse parse / validate / save flow |
| Existing evidence table UI pattern | `EDCAP_FE/src/pages/...` | Display parsed field tables and statuses |

## Forbidden common components
| component | reason |
|---|---|
| Raw markdown storage as primary source of truth | Snapshot + parsed sections are the source of truth for UI |
| CI-gated official parse flow | Parser for test-plan/test-results is independent from CI |
| Non-existing helper methods | Must not be invented from assumptions |
| New non-`tbl_` parse tables | PoC should reuse existing project DB tables |

## List of methods that actually exist
| method/class | path | usage |
|---|---|---|
| Existing parse service pattern | `EDCAP_BE/src/main/java/...` | Parse one artifact, validate, persist snapshot |
| Existing MyBatis / repository adapter pattern | `EDCAP_BE/src/main/java/...` | Idempotent upsert and section replacement |
| Existing FE table rendering pattern | `EDCAP_FE/src/pages/...` | Show snapshot list and detail view |

## Forbidden methods / methods that do not exist
| method/API | reason | alternative |
|---|---|---|
| `officialParse()` | Not part of the required flow | Use direct parse snapshot persistence |
| CI-dependent parse gate | Parser should not depend on CI | Persist snapshot immediately after parse |
| Raw payload dump methods | Violates PoC data policy | Store parsed summary + extracted fields only |

## DTO / Entity / Table / Migration mapping
| layer | name | path | Note |
|---|---|---|---|
| DTO | Parsed snapshot DTO | BE DTO package | Carries status, summary, source info |
| Entity | Artifact snapshot entity | BE domain/persistence | Snapshot metadata per ticket/file |
| Entity | Parsed section entity | BE domain/persistence | One row per extracted field/section |
| Table | `tbl_dim_project` | DB | Project dimension |
| Table | `tbl_dim_repository` | DB | Repository dimension |
| Table | `tbl_dim_ticket` | DB | Ticket dimension |
| Table | `tbl_fact_artifact_snapshot` | DB | Persist snapshot per parsed file |
| Table | `tbl_fact_artifact_parsed_section` | DB | Persist parsed fields/sections |
| Table | `tbl_connector_run` | DB | Optional parser execution telemetry |

## formItemNm / SEQNO / Master Data / Code Value Mapping
| display/item | internal value | source | note |
|---|---|---|---|
| `test-plan.md` purpose | `purpose` | Template section | Required |
| AC matrix | `ac_matrix_test_type` | Template section | Usually JSON/list |
| Priority | `priority` | Template section | P0/P1/P2 or structured value |
| Reuse existing test | `reuse_existing_test` | Template section | Text / list |
| Additional test this time | `additional_test_this_time` | Template section | Text / list |
| E2E scenarios | `e2e_step_by_step_scenarios` | Template section | Structured list |
| Areas left untested | `areas_intentionally_left_untested_this_time` | Template section | Text / list |
| Data testing principles | `data_testing_principles` | Template section | Text |
| Execution command | `execution_command` | Template section | Text / list |
| Stop condition | `stop_condition` | Template section | Text |
| Required human decision | `required_human_decision` | Template section | Text / list |
| `test-results.md` execution environment | `execution_environment` | Template section | Required |
| Executed command | `executed_command` | Template section | Required |
| Summary of results | `summary_of_results` | Template section | Required |
| List of passes | `list_of_passes` | Template section | List |
| List of fails | `list_of_fails` | Template section | List |
| Bugs fixed | `bugs_fixed` | Template section | List |
| Not yet fixed / pending | `not_yet_fixed_pending` | Template section | List / text |
| Test cannot be executed and reason | `test_cannot_be_executed_and_reason` | Template section | Text / list |
| Remaining risk | `remaining_risk` | Template section | Text |
| Final test verdict | `final_test_verdict` | Template section | Enum / text |

## Multilingual Note
- Keep field names in canonical English keys.
- UI labels may be localized, but stored keys must remain stable.
- Avoid mixing Japanese/Vietnamese/English inside the stored canonical key.

## Encoding / Mojibake Note
- Read/write Markdown as UTF-8.
- Preserve code fences and table alignment.
- Avoid mojibake when parsing full-width punctuation or bullet markers.

## Log / Audit / Operation Note
- Store parse status and parse summary only.
- Record `traceId`, source hash, parser version, and timestamp.
- Do not store raw secrets, tokens, or arbitrary full source dumps.
- If parser fails, persist a safe error summary for operator review.

## Ticket-Specific Constraints
- `test-plan.md` and `test-results.md` are parsed independently.
- UI must support viewing them as a pair for the same ticket.
- Parser logic must not depend on CI.
- Snapshot rows are written immediately after parse.
