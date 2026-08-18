# Architecture Overview

## System Context

EDCAP aggregates engineering signals from GitHub, Jira, and CircleCI to give development
teams visibility into their SDLC metrics.

```
┌──────────────────────────────────────────────────────┐
│                    EDCAP Platform                    │
│                                                      │
│  ┌─────────────────┐      ┌─────────────────────┐   │
│  │   EDCAP_FE      │◄────►│     EDCAP_BE        │   │
│  │   React 18      │ HTTP │  Spring Boot 3.4.1  │   │
│  │   TypeScript    │      │  Java 21            │   │
│  └─────────────────┘      └──────────┬──────────┘   │
│                                      │              │
└──────────────────────────────────────┼──────────────┘
                                       │ adapters
          ┌──────────────┬─────────────┼──────────────┐
          ▼              ▼             ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  GitHub  │  │   Jira   │  │CircleCI  │  │PostgreSQL│
    │  PRs /   │  │ tickets  │  │ CI runs  │  │ (Flyway) │
    │  commits │  │          │  │          │  │          │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## Backend — Hexagonal Architecture

EDCAP_BE is structured as Hexagonal Architecture (Ports & Adapters).
Layer dependencies are enforced by `ArchitectureTest.java` (ArchUnit).

```
┌──────────────────────────────────────────────────────────────┐
│  web  (com.sdd.platform.web)                                 │
│  @RestController, DTOs, Spring Security, webhook handlers    │
└────────────────────────────┬─────────────────────────────────┘
                             │  calls application services
┌────────────────────────────▼─────────────────────────────────┐
│  application  (com.sdd.platform.application)                 │
│  @Service use cases, port interfaces, exceptions             │
└────────────────────────────┬─────────────────────────────────┘
                             │  depends on domain
┌────────────────────────────▼─────────────────────────────────┐
│  domain  (com.sdd.platform.domain)                           │
│  Entities (Lombok), enums, DomainException hierarchy         │
│  No framework dependencies                                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  infrastructure  (com.sdd.platform.infrastructure)           │
│  Implements application port interfaces                      │
│  ├── persistence/   MyBatis mappers + PostgreSQL adapters    │
│  ├── github/        WebClient → GitHub API                   │
│  ├── jira/          WebClient → Jira API                     │
│  ├── circleci/      WebClient → CircleCI API                 │
│  └── git/           Local git operations (JGit / CLI)        │
└──────────────────────────────────────────────────────────────┘
```

**Enforced dependency rules:**
- `domain` has no imports from any other layer
- `application` imports `domain` only
- `infrastructure` imports `application` (to implement ports) and `domain`
- `web` imports `application` only — never `infrastructure` directly

---

## Frontend Architecture

EDCAP_FE is a React SPA with a clear separation between server state and UI state.

```
Browser
  └── React Router (/:lang/...)
        └── Layout (Zustand: sidebar, i18n)
              └── Pages
                    └── Components
                          ├── useQuery / useMutation  ← TanStack Query (server data)
                          ├── useAppSelector / dispatch ← Redux Toolkit (global sync state)
                          └── useUiStore              ← Zustand (UI preferences)

API calls: lib/api.ts (fetch wrapper, credentials: "include")
     └── Session cookie (JSESSIONID) via Spring Security OAuth2 ← Google login flow
```

**State management split:**

| Layer | Tool | Scope |
|-------|------|-------|
| Async server ops | TanStack Query | Data fetching, caching, mutations |
| Global server-synced state | Redux Toolkit | User session, language, project context |
| UI preferences | Zustand (persisted) | Sidebar state, modal open/close |

---

## Database Schema (summary)

Managed by Flyway. Current: V1 → V4.

| Convention | Value |
|-----------|-------|
| Table naming | `snake_case` |
| Primary key | `id BIGSERIAL PRIMARY KEY` |
| Business keys | Explicit column + `UNIQUE` constraint |
| Timestamps | `TIMESTAMPTZ DEFAULT NOW()` (UTC) |
| Soft delete | Not used — hard delete with cascade |

Key tables (V1): `app_user`, `project`, `repository`, `ticket`, `artifact`, `pull_request`.
V4 adds ENUM types (`ticket_status`, `pr_status`, `run_status`, `severity_level`, etc.)
and extended schema with `score_band`, `finding_status`, `access_result`.

> **Pending (PJ1):** V4 introduces a `tbl_` table prefix in some places. Whether this
> is the new naming convention is unresolved. See `source-availability.md`.

---

## Technology Stack

| | Backend | Frontend |
|-|---------|----------|
| Language | Java 21 | TypeScript 5.7 (strict) |
| Framework | Spring Boot 3.4.1 | React 18.3 |
| Build | Maven 4.0 | Vite 6 + SWC |
| DB | PostgreSQL 16 | — |
| ORM | MyBatis 3.0 (explicit SQL) | — |
| Migrations | Flyway 10.20 | — |
| Security | Spring Security + OAuth2 (session cookie) | Session cookie (`credentials: "include"`) — see [security.md](../standards/security.md) |
| HTTP client | Spring WebFlux (WebClient) | Native fetch + TanStack Query |
| State | — | Redux Toolkit 2.12 + Zustand 5.0 |
| UI | — | Radix UI + Ant Design 6.4 + Tailwind CSS 3.4 |
| Testing | JUnit 5 + Mockito + ArchUnit | Vitest + Playwright (installed, no tests yet) |

> **Collector note:** Git/PR metadata collection is a backend-only ingestion path that reuses the existing GitHub webhook entrypoint and adds an admin-only manual API. It must stay compatible with Artifact Scanner behavior and remain additive.
