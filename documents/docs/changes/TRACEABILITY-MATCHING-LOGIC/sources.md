# Sources

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC
**Create date**: 2026-06-23
**Author**: OpenAI
**Update date**: 2026-06-23

## Ticket / Issue

| source                      | link/path                                    | status    | note                  |
| --------------------------- | -------------------------------------------- | --------- | --------------------- |
| TRACEABILITY-MATCHING-LOGIC | docs/changes/TRACEABILITY-MATCHING-LOGIC/raw | Available | Primary ticket source |

## Requirement / Design Documents

| source                   | path                              | status    | trust level | note                                                  |
| ------------------------ | --------------------------------- | --------- | ----------- | ----------------------------------------------------- |
| Requirement              | raw/requirement.md                | Available | High        | Primary requirement source                            |
| Database Design          | raw/database_design.md            | Available | High        | Primary DB source                                     |
| Wireframe                | raw/wireframe.md                  | Available | High        | Primary UI source                                     |
| SDD Platform Requirement | SDD Evidence Platform Requirement | Available | Medium      | Background architecture and traceability requirements |
| V4 Schema                | V4__init_shema_v2.sql             | Available | High        | Existing DB schema                                    |

## Existing Source Code

| area               | path                          | status    | purpose                       |
| ------------------ | ----------------------------- | --------- | ----------------------------- |
| Artifact Parser    | application/usecase/docparse  | Available | Artifact snapshot generation  |
| GitHub Ingestion   | application/usecase/ingestion | Available | PR / CI linkage               |
| Persistence Layer  | infrastructure/persistence    | Available | Existing DB adapters          |
| Traceability Logic | TBD                           | Not Found | Candidate implementation area |

## Existing Tests

| test type          | path               | status    | note                      |
| ------------------ | ------------------ | --------- | ------------------------- |
| Parser Unit Tests  | test/.../docparse  | Available | Artifact generation tests |
| Ingestion Tests    | test/.../ingestion | Available | PR / CI ingestion         |
| Traceability Tests | TBD                | Not Found | To be created             |

## External / Office / PDF / Web References

| source          | type              | handling policy | note                             |
| --------------- | ----------------- | --------------- | -------------------------------- |
| SDD Requirement | Internal Document | Reference only  | Defines Traceability Map concept |

## Excluded Sources

| source/path                    | reason                               |
| ------------------------------ | ------------------------------------ |
| Runtime production data        | Out of scope for specification phase |
| Future AI Root Cause features  | Explicitly out of scope              |
| Cross-project dependency graph | Explicitly out of scope              |

## Source Limitations

* Existing traceability implementation was not found.
* FE implementation does not yet exist.
* Confidence scoring implementation does not exist.

## Assumptions from Sources

* Existing artifact snapshots are available.
* Existing PR ingestion is available.
* Existing CI ingestion is available.
* Existing traceability table is available.

## Human Confirmation Required

* One Ticket = One PR.
* Commit is excluded from completeness calculation.
* Broken links use ERROR / WARNING severity.
