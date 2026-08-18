# Review Checklist

**Ticket ID**: PARSER-SPEC-PACK
**Create date**: 2026-06-19
**Author**: nk_trung
**Update date**: 2026-06-19

## 1. Specification/AC Matching
| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-SPEC-PARSER-1 | `spec-pack.md` is read correctly from the standard path or synchronized input | Blocker | Pass |
| AC-SPEC-PARSER-2 | `ticket_id` is correctly identified from the path/front matter/header | Blocker | Pass |
| AC-SPEC-PARSER-3 | Front matter is prioritized when present | Major | Pass |
| AC-SPEC-PARSER-4 | All main sections are extracted completely | Blocker | Pass |
| AC-SPEC-PARSER-5 | The Terminology table and core tables are parsed into correct records | Major | Pass |
| AC-SPEC-PARSER-6 | In Scope / Out of Scope are separated properly | Blocker | Pass |
| AC-SPEC-PARSER-7 | Business Rules / Input / Output / Error / Boundary / Non-functional are parsed correctly | Blocker | Pass |
| AC-SPEC-PARSER-8 | Acceptance Criteria are extracted and counted accurately | Blocker | Pass |
| AC-SPEC-PARSER-9 | Incorrectly formatted AC creates a warning but does not lose content | Major | Pass |
| AC-SPEC-PARSER-10 | Placeholders are detected and parsing is idempotent by hash | Blocker | Partial |

## 2. General System Review

### 2.1. Number/Input Check
- [x] AC and section counts are derived from Markdown tables/headings, not from NLP inference
- [x] Empty/null/placeholder values are clearly flagged in the parser output
- [x] No sensitive arithmetic beyond AC sequence parsing

### 2.2. Character Type / Encoding / Locale

- [x] Vietnamese diacritics are preserved after normalization
- [x] Heading normalization does not distort section content
- [x] UTF-8 end-to-end, no encoding changes

### 2.3. Literal / Magic Number

- [x] `AC-<TICKET>-<n>` is validated with a clear pattern
- [x] Placeholder tokens are centrally defined in the parser core

### 2.4. Operation / Maintainability

- [x] Log-friendly fields exist in the output envelope: ticket, hash, mode, status, counts
- [x] The dev endpoint is restricted to `docs/changes/<TICKET>/spec-pack.md`
- [x] Rerun idempotence is represented by a stable `contentHash`
- [ ] Persistence-level de-dup/missing-artifact handling is not yet connected to the scanner pipeline in this change set

## 3. FE Review

- [x] No new FE component added
- [x] No FE contract changes

## 4. BE/API Review

- [x] Controller acts only as a thin wrapper
- [x] Parser core stays in the domain layer and does not touch the DB
- [x] The dev file endpoint only allows `spec-pack.md`

## 5. DB/Migration Review

- [x] No new tables added
- [x] No new migrations added
- [x] No full raw content persistence

## 6. Security/Privacy Review

- [x] No logging of secret/raw prompt/raw chat/raw source code
- [x] No generic file-read primitive
- [x] No path expansion beyond the ticket scope

## 7. Operation/Maintenance Review

- [x] Parse mode / parse status / counts / hash are included in the envelope
- [x] Warning/error structure is available for audit
- [ ] Official parse gating and DB idempotent snapshot creation are not yet connected to the runtime pipeline

## 8. Test Review

- [x] Unit tests cover front matter, section, table, AC, placeholder, and hash stability
- [x] `mvn test -Dtest=SpecPackMarkdownParserTest,SpecPackMarkdownParserControllerTest` passed
- [ ] Integration test for the scanner pipeline has not been updated in this change set

## 9. Documentation/Traceability Review

- [x] Context, rules, plan, test plan, black-box, and self-review all map to the 10 ACs
- [x] Template structure remains aligned with `_ticket-template`
- [x] A handoff file summarizing changed files exists

## 10. Release/Rollback Review

- [x] Rollback can be done by reverting this code change set
- [x] No dependency on schema rollback

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect Report | Record Reason for Rejection |
| Accepted Risk | Accepted Risk | Record Impact/Owner/Deadline |