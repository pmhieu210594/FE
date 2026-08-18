# Phase 0 — Maintenance Records

## Purpose

Phase 0 establishes the operational foundation for the EDCAP_FULL workspace before
feature development begins.

## Sub-phases

| Phase | Name | Status | Date |
|-------|------|--------|------|
| 0-A | Safety Gate — `.claude/` skeleton + `docs/` scaffold | ✅ Completed | 2026-06-08 |
| 0-B | Common Base — architecture docs, standards, Claude rules 10–40 | ✅ Completed | 2026-06-08 |

## Files in This Directory

| File | Description |
|------|-------------|
| [phase0-plan.md](phase0-plan.md) | Approved plan (Phase 0-A) |
| [phase0-execution-log.md](phase0-execution-log.md) | Step-by-step execution log |
| [phase0-decisions.md](phase0-decisions.md) | Architecture decisions and rationale |
| [phase0-risk-register.md](phase0-risk-register.md) | Identified risks and mitigations |
| [phase0-review.md](phase0-review.md) | Self-judgement completion gate |
| [source-availability.md](source-availability.md) | Solid / missing / ambiguous codebase inventory |

## Phase 0-A Completion Gate

- [x] `.claude/settings.json` — deny/allow active
- [x] `.claude/rules/00-safety.md` — safety rules
- [x] `.claude/CLAUDE.md` — workspace entry point (English)
- [x] `docs/architecture/`, `docs/standards/`, `docs/changes/` skeleton
- [x] `docs/maintenance/phase0/` 6 files

## Phase 0-B Completion Gate

- [x] `.claude/CLAUDE.md` — updated to English, Phase 0-B current
- [x] `.claude/rules/10-style.md` — style rules (≤15 bullets)
- [x] `.claude/rules/20-architecture.md` — architecture rules
- [x] `.claude/rules/30-security.md` — security rules
- [x] `.claude/rules/40-testing.md` — testing rules
- [x] `docs/architecture/overview.md` — system context + hexagonal diagram
- [x] `docs/architecture/key-flows.md` — OAuth2, webhook, connector, API flows
- [x] `docs/standards/coding.md` — BE (Java/Spring) + FE (TS/React) standards
- [x] `docs/standards/testing.md` — JUnit/Mockito/ArchUnit + Vitest/Playwright
- [x] `docs/standards/security.md` — OAuth2, HMAC, secrets, error response
- [x] `docs/standards/templates/` — 5 templates (be-use-case, be-controller, be-adapter, fe-component, fe-hook)
- [x] `docs/maintenance/phase0/source-availability.md` — PJ1–PJ5 pending judgements
- [x] `EDCAP_FE/.husky/pre-commit` — Husky hook initialized
- [x] PJ1 resolved: `tbl_` prefix is the new convention for V5+ migrations
- [x] PJ2 resolved: Radix UI primary; Ant Design existing usages only
- [x] PJ3 resolved: Conventional Commits + feature-branch workflow — see `docs/standards/git-workflow.md`
- [x] PJ4 resolved: Semantic Versioning 2.0; current pre-1.0; release via git tag
- [x] PJ5 resolved: `no-explicit-any` on globally; override for form builder + interfaces

## Handoff to Phase 1

Phase 1 (first feature ticket) requires:
1. All Phase 0-B checkboxes above are done ✅
2. PJ1 and PJ3 resolved by team (see `source-availability.md`)
3. CI/CD pipeline established (GitHub Actions: build + test + lint)
