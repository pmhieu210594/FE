# Standards

This directory stores coding standards and conventions for EDCAP.

## Core Standards

| File | Description |
|------|-------------|
| [coding.md](coding.md) | Cross-cutting conventions index — naming, file organization, general principles |
| [backend.md](backend.md) | BE (Java/Spring Boot) — domain, application, infrastructure, web layers, MyBatis |
| [frontend.md](frontend.md) | FE (TypeScript/React) — components, hooks, state management, i18n, error display |
| [database.md](database.md) | Flyway migrations, table naming, ENUMs, HikariCP, MyBatis config |
| [logging.md](logging.md) | SLF4J/Logback, TraceIdFilter, MDC traceId, log levels, parameterized logging |
| [error-handling.md](error-handling.md) | GlobalExceptionHandler, ErrorResponse shape, exception mapping, FE ApiError |
| [api-contract.md](api-contract.md) | URL structure, pagination, response shape, auth, webhook endpoints |
| [security.md](security.md) | OAuth2, HMAC webhook validation, secrets management, error response security |
| [testing.md](testing.md) | JUnit5/Mockito/ArchUnit (BE) + Vitest/Playwright (FE), mocking strategy |
| [git-workflow.md](git-workflow.md) | Branch naming, Conventional Commits, PR process, SemVer |
| [review.md](review.md) | PR checklist, review focus areas, merge requirements |
| [maintenance.md](maintenance.md) | Dependency updates, Flyway maintenance, source availability review |

## Templates

| File | Description |
|------|-------------|
| [templates/be-use-case.md](templates/be-use-case.md) | Template: `@Service` use case with port injection |
| [templates/be-controller.md](templates/be-controller.md) | Template: `@RestController` |
| [templates/be-adapter.md](templates/be-adapter.md) | Template: adapter + MyBatis mapper + XML |
| [templates/fe-component.md](templates/fe-component.md) | Template: `forwardRef` + CVA component |
| [templates/fe-hook.md](templates/fe-hook.md) | Template: TanStack Query hook + Zustand store |

## Automation (Claude Code Policies)

| File | Description |
|------|-------------|
| [automation/context-loading-policy.md](automation/context-loading-policy.md) | What Claude loads, when, and in what order |
| [automation/repo-intake-checklist.md](automation/repo-intake-checklist.md) | Checklist before Claude Code operates on a new repo |
| [automation/external-content-intake.md](automation/external-content-intake.md) | Ingesting GitHub PRs, Jira tickets, webhook payloads safely |
| [automation/source-availability-template.md](automation/source-availability-template.md) | Reusable template for source-availability.md in any project |

## Existing Lint Tooling

| Component | Tool | Status |
|-----------|------|--------|
| FE | ESLint 8 (TypeScript, Prettier, SonarJS, case-police, jsx-a11y) | Active |
| FE | Husky 9 + lint-staged (pre-commit) | Config present; hook file added in Phase 0-B |
| BE | Checkstyle / PMD | Not yet configured — planned for Phase 1 |

## Open Human Decisions

See [`docs/maintenance/phase0/source-availability.md`](../maintenance/phase0/source-availability.md)
for HD1–HD7 — pending decisions that affect Candidate rules in several files above.
