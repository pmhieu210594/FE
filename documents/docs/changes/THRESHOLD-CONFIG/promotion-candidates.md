# Promotion Candidates

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-22
**Author**: Claude
**Update date**: 2026-07-22 (Phase 9 — Living Docs update)

Patterns and follow-ups from this ticket worth promoting into team standards, templates, or a
future ticket, distinct from `report.md`'s per-ticket outcome record.

## Phase 9 Outcomes (human-confirmed 2026-07-22)

| item | outcome | detail |
|---|---|---|
| §1.1 soft-delete contradiction (overview.md vs database.md) | **Promoted** | `docs/architecture/overview.md` DB-conventions row corrected; `docs/standards/database.md` soft-delete rule promoted from `[Candidate]` to Confirmed |
| §1.2 config-table batch upsert pattern | **Promoted** | New `docs/knowledge/threshold-config.md`, pointed to from `docs/standards/coding.md` |
| §1.2 in-memory cache + save-invalidation pattern | **Promoted** | Same file as above |
| §4.4 stale "AdminController ad-hoc Map" note | **Deferred** | Left as-is in `security.md`/`error-handling.md` this round; still flagged as stale below |
| §4.4 `ArchitectureTest.java` absence | **Deferred** | Flagged as a standing decision item for the repo owner; no rule/standards text edited |
| FE toggle-to-DELETE-with-Undo UX | **Not promoted** | Ticket-specific implementation choice; revisit if a second ticket reuses it |
| Testcontainers/live-Postgres convention gap | **Not promoted (this ticket)** | Recommended as a separate follow-up ticket, not a doc edit |
| Migration-slot-collision failure mode | **Promoted** | Added as `FMI-TC-001` in `docs/maintenance/failure-mode-index.md` |
| Antd mock drift failure mode | **Promoted** | Added as `FMI-TC-002` in `docs/maintenance/failure-mode-index.md` |

## 1. Reusable patterns confirmed (reaffirm, no new work)

| pattern | where used this ticket | note |
|---|---|---|
| `requireAdmin(AppUser caller)` → `ForbiddenException("Component.Permission.Denied")` per-service | `ScoreThresholdConfigService`/`Controller` | Already the repo standard (`AdminAuditLogController`); no shared utility exists — confirmed this remains the intended shape, not an oversight to fix |
| `version BIGINT` optimistic-locking column + `OptimisticLockingException` on 0-row-affected update | `ScoreThresholdConfigRepositoryAdapter` | Matches `CustomerService`/`OrganizationService`/`TeamService`; confirmed reusable for any new admin-editable config table |
| Hexagonal `web → @Service/@Transactional → port interface → @Repository JDBC adapter` | Full `ScoreThresholdConfig*` slice | Mirrors `ArtifactScannerService`/`ArtifactScannerPersistencePort`/`DataOpsDashboardJdbcAdapter`; confirmed as the default shape for new BE features |

## 2. New pattern worth promoting

**Batch soft-delete + update + insert in one `@Transactional` method, driven by presence/absence of
`id` in a payload array** (`ScoreThresholdConfigService.save()`). This is a distinct shape from the
existing single-resource CRUD precedent (`organizations` group in `lib/api.ts`/`CustomerService`):
rows missing from the payload are soft-deleted, rows with a matching `id` are updated, rows without
an `id` are inserted — all atomically. Recommend documenting this as a named pattern (e.g.
"config-table batch upsert") in `docs/standards/coding.md` or `api-contract.md`, since any future
admin-configurable list-of-rows screen (thresholds, categories, mappings) will likely need the same
shape, and it wasn't previously codified.

**In-memory cache + save-triggered invalidation for a hot-path config lookup**
(`ScoreThresholdConfigService.lookupBand`/`getActiveCodes`/`displayNameForCode`). Recommend
documenting the pattern (single-node in-memory cache, invalidated synchronously inside the same
`save()` transaction that changes the underlying data) as the default answer for "how do I avoid a
DB round-trip on every read of a low-cardinality, admin-editable config table," since this
question will recur for any similar config-table feature.

## 3. Repo-wide gap surfaced (not fixed by this ticket, candidate for separate follow-up)

**No Testcontainers / live-Postgres integration-test convention exists anywhere in this repo.**
`pom.xml` already declares `testcontainers:junit-jupiter`/`testcontainers:postgresql` and
`flyway-database-postgresql`, but every existing `*IntegrationTest.java` is a file-content
assertion test (`Files.readString` + substring checks) — none opens a real JDBC connection. This
ticket needed a live-DB test for AC-10 (partial unique index rejection) and could not write one
that could be verified in this environment (Docker daemon not running). Recommend a small,
dedicated follow-up ticket to establish this convention (a base test class + `application-test.yml`
+ one worked example), so future tickets don't hit the same wall.

## 4. Stale documentation surfaced (candidate fixes, non-blocking)

1. `docs/architecture/overview.md`'s DB-conventions table states soft delete is "Not used — hard
   delete with cascade" — contradicted by real, merged migrations (`V92`, `V110`) and services
   (`CustomerService`, `OrganizationService`, `TeamService`). Recommend correcting.
2. `docs/standards/database.md` lists soft delete only as an unconfirmed "Candidate" — recommend
   promoting to a confirmed, documented convention given (1).
3. `docs/standards/security.md`/`docs/standards/error-handling.md` describe a "Known
   inconsistency" (an `AdminController` returning ad-hoc `Map.of("error", ...)` for 403s) that does
   not match any file in current source — the real, correct pattern
   (`AdminAuditLogController.requireAdmin` → `ForbiddenException` → standard `ErrorResponse`) is
   already what every service does. Recommend removing or correcting this stale note.
4. `ArchitectureTest.java` (ArchUnit) does not exist anywhere in this repo, despite being referenced
   as an enforcement mechanism across multiple ticket templates/docs (`review-checklist.md`,
   `testing.md`, `impl-plan.md`). Recommend either authoring it or removing references to it as an
   enforced gate until it exists.

## 5. Not recommended for promotion

- The FE "toggle-to-DELETE-with-Undo" row-removal UX (this ticket's implementation choice, not
  spec-mandated) — worth confirming with the human owner (see `report.md` §10) before treating it
  as a reusable FE pattern for future admin screens.
