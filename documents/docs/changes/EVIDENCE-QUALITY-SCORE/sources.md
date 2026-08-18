# Sources

**Ticket ID**: EVIDENCE-QUALITY-SCORE     
**Create date**: 2026-06-23   
**Author**: nk_trung        
**Update date**: 2026-06-23   

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Requirement document | `docs/changes/EVIDENCE-QUALITY-SCORE/raw/requirement.md` | Reviewed | Primary source for locking scope, AC, API shape, score bands, and MVP constraints. |
| Database design | `docs/changes/EVIDENCE-QUALITY-SCORE/raw/database-design.md` | Reviewed | Primary source for storage, reuse-first policy, and score table structure. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement definition | `docs/changes/EVIDENCE-QUALITY-SCORE/raw/requirement.md` | Reviewed | Primary | Defines the business goal, inputs, outputs, score breakdown, and acceptance criteria. |
| Database design | `docs/changes/EVIDENCE-QUALITY-SCORE/raw/database-design.md` | Reviewed | Primary | Confirms that the MVP does not require any new table or mandatory new column, and lists the existing tables that can be reused. |
| Repository DB map | `docs/architecture/repository-db-map.md` | Reviewed | Supporting | Confirms that `tbl_fact_evidence_quality_score` and related metric tables already exist in the V4 schema. |
| Architecture overview | `docs/architecture/overview.md` | Reviewed | Supporting | Provides overall context for the ingest and analytics platform. |
| Data flow map | `docs/architecture/data-flow-map.md` | Reviewed | Supporting | Helps explain the relationship between artifact ingest, parsing, and downstream analysis. |
| Service layer map | `docs/architecture/service-layer-map.md` | Reviewed | Supporting | Shows the existing service structure and the suitable place for the score engine. |
| External interface map | `docs/architecture/external-interface-map.md` | Reviewed | Supporting | Useful for API shape and ticket/artifact path conventions. |
| Backend standards | `docs/standards/backend.md` | Reviewed | Supporting | Used to keep the spec aligned with current backend conventions. |
| Database standards | `docs/standards/database.md` | Reviewed | Supporting | Reuse-first and migration conventions for the MVP. |
| Security standards | `docs/standards/security.md` | Reviewed | Supporting | Requirements for data minimization, secret handling, and access control. |
| Testing standards | `docs/standards/testing.md` | Reviewed | Supporting | Used to shape the test strategy and expected error handling. |
| Architecture rules | `.claude/rules/20-architecture.md` | Reviewed | Supporting | Dependency and layering constraints for the implementation plan. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| Score table migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Reviewed | Defines `tbl_fact_evidence_quality_score`, the score band enum, related metric tables, and indexes. |
| Score table legacy mention | `EDCAP_BE/src/main/resources/db/migration/V1__init_schema.sql` | Reviewed | Shows the legacy score cache table reference. |
| Source code search | `EDCAP_BE/src/main/java/...` | Partial | No dedicated service/controller for Evidence Quality Score was found in the current source tree. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Parser / score engine unit tests | `EDCAP_BE/src/test/...` | Not found | No dedicated unit test for the Evidence Quality Score engine was found. |
| Integration tests related to ingest and persistence | `EDCAP_BE/src/test/IntegrationTest/...` | Reviewed | Can be used as a reference pattern, but they are not specific to this score engine. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| None used in Phase 1 | N/A | Do not expand beyond the ticket pack unless the owner requests it | Internal documents are sufficient for this phase. |

## Excluded Sources

| source/path | reason |
|---|---|
| `EDCAP_BE/target/`, `EDCAP_FE/dist/`, `EDCAP_FE/node_modules/`, `EDCAP_FE/coverage/` | Build artifacts, not requirement sources. |
| Secrets, `.env`, logs, credential dump | Sensitive and unnecessary for Phase 1. |
| Raw prompt/chat logs | Out of scope and prohibited by the requirement. |
| Full source code content | Use only the minimum necessary excerpts. |

## Source Limitations

- The requirement and database design are detailed enough to lock the MVP spec, but post-MVP score-rule governance is still undecided.
- The current schema already includes the score table and related metric tables, so Phase 1 can assume storage follows a reuse-first approach.
- There is no dedicated engine implementation in the Java source tree yet, so the spec must not assume that runtime behavior already exists.
- The source of truth for review is PR review metadata/comments, not internal review files.

## Assumptions from Sources

- The MVP uses a fixed v0 score rule, stores the rule version in the result row, and finalizes the full history + current/latest snapshot model.
- The output score is written to the existing `tbl_fact_evidence_quality_score` table.
- The engine must tolerate missing or malformed input and return a partial result instead of failing hard.
- The dashboard will consume the BE output in a later phase; Phase 1 only needs the BE contract and storage contract.
- Manual score override is not allowed in v0; any exception must be recorded in a separate exception record.

## Human Confirmation Required

- Phase 1 decision already finalized: keep full history + current/latest snapshot for score results.
- Phase 1 decision already finalized: no manual score override in v0.
- Phase 1 decision already finalized: fixed score weights, not dependent on phase/ticket type for v0.