# Source Availability

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: Claude
**Update date**: 2026-07-21

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Phase 1 spec pack | `docs/changes/THRESHOLD-CONFIG/spec-pack.md` | read | high | Phase 1 | Căn cứ implement — canonical AC/BR source | none — PASS-gated | always-read |
| Phase 1 context | `docs/changes/THRESHOLD-CONFIG/context.md` | read | high | Phase 1 | Corrects spec-pack FE-consumer claim; DTO/method inventory | spec-pack §2.1.12/§11.7 known-inaccurate, superseded by this file | always-read |
| Ticket rules | `docs/changes/THRESHOLD-CONFIG/ticket-rules.md` | read | high | Phase 1 | Must Follow / Must Not Do / Stop-Ask / Review/Test Focus | none | always-read |
| BE source tree | `EDCAP_BE/src/main/java/com/sdd/platform/**` | read | high | BE | Căn cứ implement — verified line-by-line for every directly affected file | none — verified against current merged source, not docs | always-read |
| BE migrations | `EDCAP_BE/src/main/resources/db/migration/**` | read | high | BE | Căn cứ SQL/Repository — confirms `V502` highest, `V110` index pattern | none | required-if-db |
| BE tests | `EDCAP_BE/src/test/java/com/sdd/platform/**` | partial | high | BE | Existing test coverage baseline (`EvidenceQualityScoreModelsTest`) | Only the directly relevant test class was read; full BE test suite not exhaustively enumerated | verify-with-source |
| FE source tree | `EDCAP_FE/src/**` | read | high | FE | Căn cứ implement — verified pm-dashboard, admin-audit-log, pages/user, lib/api, components/ui, store, hooks, App.tsx, Layout.tsx | none | always-read |
| FE locales | `EDCAP_FE/public/locales/en/locale.json` | read | high | FE | i18n key convention for new `Pages.ThresholdConfig.*` block | `vi`/`ja` locale files not individually re-verified — assumed to mirror `en` structure per existing convention | verify-with-source |
| `docs/architecture/overview.md` | `docs/architecture/overview.md` | read | medium | project | Hexagonal layer diagram cross-check | Known-stale "soft delete not used" note (spec-pack §20 RI-7) — actual merged code is authoritative, not this doc | verify-with-source |
| `docs/standards/security.md` / `error-handling.md` | `docs/standards/*.md` | read | medium | project | Error-mapping / security convention cross-check | Known-stale "AdminController ad-hoc Map" note (spec-pack §20 RI-8) — actual merged `ForbiddenException` pattern is authoritative | verify-with-source |
| `docs/standards/database.md` | `docs/standards/database.md` | read | high | project | Table naming (`tbl_dim_*`), timestamp/soft-delete/version-column conventions | none | verify-with-source |
| `docs/standards/api-contract.md` | `docs/standards/api-contract.md` | read | high | project | camelCase field casing, no-wrapper response convention, GET-list convention | none | verify-with-source |
| `docs/standards/testing.md` | `docs/standards/testing.md` | read | high | project | Test structure/naming/mock conventions | none | verify-with-source |
| No wireframe / meeting memo / prior spec | — | not-read | — | — | — | Does not exist for this ticket per spec-pack §9.1 | n/a |
| No FE/BE contract artifact / OpenAPI spec | — | not-read | — | — | — | Does not exist per spec-pack §9.4; the proposed contract in spec-pack §11 is new and unverified against a running system | human-intake (recommend Pack-26 review, not mandatory per spec-pack §16) |

## Summary

Phase 1 Gate Status = **PASS** (spec-pack §16). All sources needed to write `impact-analysis.md`
and `impl-plan.md` were read directly from current merged BE/FE source, not from potentially-stale
documentation — the two known-stale doc notes (soft-delete, AdminController) are recorded above
and do not block Phase 3 since the actual code was verified independently. No source is
unavailable; nothing blocks proceeding to Phase 3.

## Unavailable / Partial Sources

- No wireframe, meeting memo, or prior spec exists for this ticket (spec-pack §9.1) — not a
  blocker; the raw input + Human Decisions are the sole product-requirement basis.
- No FE/BE contract artifact or OpenAPI spec exists (spec-pack §9.4) — the DTO/endpoint shape
  proposed in `impl-plan.md` is new and unverified against a running system. A Pack-26-style
  contract deep dive is recommended but not mandatory (spec-pack §16).
- `vi`/`ja` locale files were not individually re-read; assumed to mirror `en/locale.json`'s
  structure per existing repo convention — verify when adding the new i18n block.
- Full BE test suite was not exhaustively enumerated; only the one directly-stale test class
  (`EvidenceQualityScoreModelsTest`) was confirmed.

## Risk Before Implementation

- Two standards docs (`architecture/overview.md`, `security.md`/`error-handling.md`) contain notes
  that are stale relative to actual merged source (already flagged as Resolved Issues RI-7/RI-8 in
  spec-pack §20) — mitigated by treating verified current source as authoritative throughout this
  ticket, not the stale doc text.
- No precedent exists in this repo for a `POST` batch-upsert (soft-delete+update+insert) endpoint
  shape — the closest analogue (`organizations` group in `lib/api.ts`) is single-resource CRUD, not
  batch. This is a contract-design risk carried into `impl-plan.md`, not a source-availability gap.

## Required Human Decision

None outstanding. The four Open Issues remaining after Phase 1 (OI-THRESHOLD-CONFIG-1 integer vs
decimal scores, OI-2/3 min/single-band validity, OI-7 color validation strictness, OI-8 cache
strategy) were resolved as Phase 3 implementation decisions with the human owner on 2026-07-21,
per spec-pack §16's classification of these as non-blocking implementation details rather than new
Human Decisions:

- Scores are `INTEGER` (min_score/max_score).
- Save requires ≥1 active band; a single `0-100` row is valid.
- `color` is validated server-side against `^#[0-9A-Fa-f]{6}$`.
- Score-band lookup uses an in-memory cache in the new service, invalidated synchronously on
  successful save.

See `impl-plan.md` §12 Stop/Ask Condition for the remaining lower-risk open item (OI-9, FE/DTO
widening) carried forward for confirmation during implementation.
