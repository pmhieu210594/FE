# Architecture

This directory stores architecture documentation for the EDCAP platform.

## Contents

| File | Description |
|------|-------------|
| [overview.md](overview.md) | System context, hexagonal architecture diagram, tech stack |
| [key-flows.md](key-flows.md) | JWT auth flow, webhook processing flow, connector sync flow |
| `decision-records/` | ADR (Architecture Decision Records) — planned for Phase 1 |

## Planned (Phase 1+)

- `data-model.md` — Full ERD derived from Flyway migrations
- `integrations.md` — GitHub, Jira, CircleCI adapter design detail
- `frontend.md` — Component tree, state management topology

## Source References

- BE source: [`EDCAP_BE/src/main/java/com/sdd/platform/`](../../EDCAP_BE/src/main/java/com/sdd/platform/)
- FE source: [`EDCAP_FE/src/`](../../EDCAP_FE/src/)
- DB migrations: [`EDCAP_BE/src/main/resources/db/migration/`](../../EDCAP_BE/src/main/resources/db/migration/)
- Architecture enforcement: [`EDCAP_BE/src/test/…/ArchitectureTest.java`](../../EDCAP_BE/src/test/)
