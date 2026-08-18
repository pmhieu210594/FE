# EDCAP_FULL — Workspace Entry Point

## Project Overview

**EDCAP** (Engineering Development Capability Platform) — a platform that aggregates engineering
metrics from GitHub, Jira, and CircleCI to track software development lifecycle outcomes.

| Component | Path | Technology |
|-----------|------|-----------|
| Backend | `EDCAP_BE/` | Java 21, Spring Boot 3.4.1, PostgreSQL 16, MyBatis, Flyway |
| Frontend | `EDCAP_FE/` | React 18, TypeScript 5.7, Vite 6, Redux Toolkit, TanStack Query |

## Backend Architecture

EDCAP_BE follows Hexagonal Architecture, enforced by ArchUnit:
- `domain/` — pure entities, enums, `DomainException` hierarchy (no framework deps)
- `application/` — `@Service` use cases + port interfaces + exceptions
- `infrastructure/` — adapters: PostgreSQL (MyBatis), GitHub, Jira, CircleCI, local Git
- `web/` — thin `@RestController`, DTOs, Spring Security (OAuth2), webhooks

## Frontend Architecture

```
src/
├── components/     Reusable UI components (forwardRef, CVA variants)
├── hooks/          Custom hooks (wrap TanStack Query)
├── interfaces/     TypeScript types and enums
├── lib/            api.ts (fetch wrapper), queryClient.ts
├── pages/          Route-level components
├── services/       Redux slices
├── store/          Store configuration + Zustand stores
└── utils/          Pure utility functions
```

## Documentation

| Document | Location |
|----------|----------|
| Architecture | [docs/architecture/overview.md](../docs/architecture/overview.md) |
| Coding Standards | [docs/standards/coding.md](../docs/standards/coding.md) |
| Testing Standards | [docs/standards/testing.md](../docs/standards/testing.md) |
| Security Standards | [docs/standards/security.md](../docs/standards/security.md) |
| Change log | [docs/changes/](../docs/changes/) |
| Phase 0 maintenance | [docs/maintenance/phase0/](../docs/maintenance/phase0/) |

## Operating Rules — read before doing anything

**Full safety rules**: [`.claude/rules/00-safety.md`](rules/00-safety.md)

Required summary:
1. **Never read `.env`** or any secrets file — see `rules/00-safety.md §1`
2. **Never run destructive commands** (`rm -rf`, `DROP TABLE`, force-push, etc.)
3. **Ask the user first** before `git push`, `git commit`, or DB migrations
4. **Respect layer boundaries** — see `rules/20-architecture.md`

## Environment

- Dev DB: PostgreSQL 16 via Docker Compose (`EDCAP_BE/docker-compose.yml`)
- FE dev server: Vite proxies `/api`, `/oauth2`, `/login`, `/logout` → backend
- Build BE: `mvn clean verify` (inside `EDCAP_BE/`)
- Build FE: `npm run build` (inside `EDCAP_FE/`)
- FE type-check: `npm run typecheck`

## Current Phase

**Phase 0-B** (Common Base / Source Intelligence) — completed 2026-06-08.
See: [docs/maintenance/phase0/README.md](../docs/maintenance/phase0/README.md)
