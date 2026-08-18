# Sources

**Ticket ID**: ARTIFACT-SCANNER  
**Create date**: 2026-06-16  
**Author**: nk_trung       
**Update date**: 2026-06-16  

## Ticket / Issue

| source | link/path | status | trust level | note |
|---|---|---|---|---|
| Ticket body from the current conversation | Chat request for Phase 1 ARTIFACT-SCANNER | read | high | Identifies the Phase 1 objective, required outputs, and rules for using templates |
| User decisions in chat | Chat decisions for Artifact Scanner scope | read | high | Confirms that the scanner only performs metadata inventory, the parser rereads source files, and the DB only uses V4 |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Artifact Scanner raw requirement | `docs/changes/ARTIFACT-SCANNER/raw/requirement.md` | read | high | Current main source for functional scope, input/output, non-scope, and parser handoff |
| Artifact Scanner raw database design | `docs/changes/ARTIFACT-SCANNER/raw/database-design.md` | read | high | Current main source for the V4 schema direction and minimum updates |
| Artifact Scanner raw wireframe | `docs/changes/ARTIFACT-SCANNER/raw/wireframe.md` | read | medium | Reference source for the scanner test screen; should be reviewed again because the top of the file currently appears mixed with database design content |
| Overall requirement definition V02 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02(7).md` | read earlier | high | Foundational source document for File Evidence First, Repo as SSOT, Artifact Inventory, Traceability, and Metadata First |
| SDD Sources template | `docs/standards/templates/_ticket-template/sources.md` | read | template | Template format for `sources.md` |
| SDD Brainstorm template | `docs/standards/templates/_ticket-template/00_brainstorm.md` | read | template | Template format for brainstorm |
| SDD Spec Pack template | `docs/standards/templates/_ticket-template/spec-pack.md` | read | template | Template format for spec-pack |
| ROLE sources | `docs/changes/ROLE/sources.md` | read | medium | Recent Phase 1 implementation sample, used as a reference for presentation style |
| ROLE brainstorm | `docs/changes/ROLE/00_brainstorm.md` | read | medium | Brainstorm presentation sample |
| TEAM spec-pack | `docs/changes/TEAM/spec-pack.md` | read | medium | Detailed spec-pack sample and reference for AC/impact wording |

| Architecture overview | `docs/architecture/overview.md` | read selectively | medium-high | Overall system context |
| Repository DB map | `docs/architecture/repository-db-map.md` | read | high | Confirms that the V4 schema exists, `tbl_fact_artifact_snapshot` is V4-only, and old code is not fully mapped yet |
| Source inventory | `docs/architecture/source-inventory.md` | read selectively | medium | Supports identification of related source/docs |
| API/client contract map | `docs/architecture/fe-be-contract-map.md` | read selectively | medium | Reference if API/view is needed for scan results |
| Test map | `docs/architecture/test-map.md` | read selectively | medium | Reference for the existing test strategy |
| Backend standard | `docs/standards/backend.md` | read selectively | medium-high | Layering, adapter/service/controller principles |
| Database standard | `docs/standards/database.md` | read selectively | medium-high | Flyway, naming, and migration principles |
| Logging standard | `docs/standards/logging.md` | read selectively | medium | Reference for scanner observability |
| Security standard | `docs/standards/security.md` | read selectively | medium-high | Principles for not storing secrets/raw content outside the intended scope |
| Maintenance standard | `docs/standards/maintenance.md` | read selectively | medium | Reference for scan operations and run logs |
| `.claude` rules | `.claude/rules/*.md`, `.claude/settings.json` | read | medium-high | Style, safety, architecture, and testing constraints |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| V4 migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | The only standard source for the DB scope of Artifact Scanner |
| Legacy artifact persistence | `ArtifactRepositoryAdapter` / `ArtifactMapper.xml` / old tables | read selectively | Used to understand the As-Is state of the old code; not used as the standard for the new design |
| Legacy connector logic | `GitLocalConnector` and related mappers | read selectively | Used to understand where scanner/parser responsibilities are currently mixed in old code |
| Client/admin/data ops related screens | Related client pages, if any | not fully read | Read only when needed to confirm the minimum test-view placement |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE integration/unit tests related to artifact/connector | Related source tree | not fully read | Only the necessary parts need to be read when moving to Phase 3 / Pack test |
| Client tests for admin/data ops | Related source tree | not fully read | Not a deciding source in Phase 1 |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| No external web source | N/A | Not used in Phase 1 | Phase 1 is sufficiently covered by internal documents and source code |

## Excluded Sources

| source/path | reason |
|---|---|
| Tables/migrations before V4 | Not aligned with the new requirement; the user has confirmed that only `V4__init_shema_v2.sql` should be used |
| Old code mapped to legacy tables | Used only to understand the As-Is state; not used as the standard design |
| Full markdown artifact content in the repo | No need to mirror the full text into the scanner DB; the repo remains the SSOT |
| `.claude/*` artifacts | Not within the current Artifact Scanner scope; this is a different scanner |

## Source Limitations

- The official ticket body outside the conversation has not been seen as a separate file in the repo.
- `raw/wireframe.md` of ARTIFACT-SCANNER appears to contain mixed database design content at the top, so its trust level is lower than the raw requirement/database-design documents.
- The full BE/client source has not been read; Phase 1 only read the parts needed to finalize As-Is and impact.
- There were no official `sources.md`, `00_brainstorm.md`, or `spec-pack.md` files for ARTIFACT-SCANNER at the beginning of Phase 1.

## Assumptions from Sources

- `docs/changes/ARTIFACT-SCANNER/raw/requirement.md` is the latest and most reliable raw requirement source for the current functional scope.
- The V4 schema is the only canonical DB source for Phase 1, and legacy tables must not be used to finalize the new design.
- Artifact Scanner is currently defined as a backend metadata inventory component; the parser is a separate module that runs after the scanner.
- The client scanner test view only supports operation/testing and does not expand the scanner scope into a client-first feature.
- The eight required artifact scanner targets have been confirmed as `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `report.md`, and `blackbox-testcases.md`.

## Human Confirmation Required

- Whether the standard ticket key to write into documentation and DB is `ARTIFACT-SCANNER`, or whether another external ticket key is still needed.
- Confirmed that phase0 artifact types are seeded in this ticket.
- Confirmed that `size_bytes`, `scan_status`, `scan_message`, and `need_parse` are added to `tbl_fact_artifact_snapshot`.
- Confirmed that the test view only needs to support manual use if UI is truly needed.