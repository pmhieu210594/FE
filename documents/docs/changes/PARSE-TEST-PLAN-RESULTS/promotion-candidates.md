# Promotion Candidates

**Ticket ID**: PARSE-TEST-PLAN-RESULTS
**Create date**: 2026-06-22
**Author**: OpenAI
**Update date**: 2026-06-22

## Candidates for Living Docs

| ID     | candidate                       | target doc        | reason                      | priority |
| ------ | ------------------------------- | ----------------- | --------------------------- | -------- |
| LD-001 | Generic Document Parser Pattern | Architecture Docs | Reusable for future parsers | High     |
| LD-002 | Pair View Pattern               | Architecture Docs | Reusable UI pattern         | Medium   |
| LD-003 | AC Coverage Validation Pattern  | Standards         | Reusable validation logic   | High     |
| LD-004 | Evidence Event Pattern          | Operations Docs   | Consistent observability    | Medium   |
| LD-005 | Data Quality Pattern            | Operations Docs   | Consistent quality tracking | Medium   |

## Candidates for Rules

| ID    | rule candidate                                      | target       | reason                    | risk of rule bloat |
| ----- | --------------------------------------------------- | ------------ | ------------------------- | ------------------ |
| R-001 | Parser must persist warnings                        | Parser Rules | Improves traceability     | Low                |
| R-002 | Parser must support idempotent re-parse             | Parser Rules | Consistent behavior       | Low                |
| R-003 | AC extraction utility must support long-form AC IDs | Coding Rules | Prevent regex regressions | Low                |

## Candidates for Standards

| ID     | standard candidate             | target    | reason                |
| ------ | ------------------------------ | --------- | --------------------- |
| ST-001 | Canonical parser warning codes | Standards | Consistent reporting  |
| ST-002 | Evidence Event generation      | Standards | Consistent operations |
| ST-003 | Data Quality generation        | Standards | Consistent monitoring |

## Candidates for Architecture Docs

| ID     | update candidate           | target       | reason                    |
| ------ | -------------------------- | ------------ | ------------------------- |
| AD-001 | GenericDocParseJdbcAdapter | Architecture | Shared parser persistence |
| AD-002 | Pair View Service          | Architecture | Shared retrieval pattern  |
| AD-003 | Artifact Snapshot Reuse    | Architecture | Prevent table duplication |

## Candidates for Failure Mode Index

| ID     | failure mode                            | trigger                  | prevention                   | detection         |
| ------ | --------------------------------------- | ------------------------ | ---------------------------- | ----------------- |
| FM-001 | Constructor dependency drift            | New dependency added     | Constructor update checklist | Compile failure   |
| FM-002 | AC regex mismatch                       | New AC naming convention | Shared extractor utility     | Coverage warnings |
| FM-003 | Interface evolution breaks test doubles | Port method added        | Contract review checklist    | Compile failure   |

## Not Promoted

| item                           | reason               |
| ------------------------------ | -------------------- |
| Pair View UX details           | Product-specific     |
| PostgreSQL deployment settings | Environment-specific |

## Human Approval Required

* Living Docs promotion approval
* Architecture update approval
* Standards update approval
