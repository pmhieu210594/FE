# Changes

This directory stores changelogs and release notes for EDCAP.

## Planned Structure

```
changes/
├── README.md           (this file)
├── CHANGELOG.md        (consolidated changelog, semantic versioning)
└── releases/
    ├── v0.1.0.md
    └── ...
```

## Conventions

- Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- Versioning: [Semantic Versioning 2.0](https://semver.org/)
- Each entry must include: date, author, change type (Added/Changed/Fixed/Removed), PR link

> **Note (PJ4):** Release and versioning strategy is a pending judgement — no CI/CD pipeline
> or semantic versioning process has been established yet. See
> [docs/maintenance/phase0/source-availability.md](../maintenance/phase0/source-availability.md).

## Phase 0 Changes

| Phase | Date | Summary |
|-------|------|---------|
| 0-A | 2026-06-08 | Initialized `.claude/` safety gate and `docs/` skeleton |
| 0-B | 2026-06-08 | Architecture docs, coding/testing/security standards, Claude rules 10–40 |
