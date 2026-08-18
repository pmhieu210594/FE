# Source Inventory

## 1. Purpose

This document provides a comprehensive map of EDCAP_FULL source code and assets to guide developers and AI agents:
- **What to read** for core functionality
- **What to skip** (generated code, build output, dependencies, templates)
- **Where things are** (entry points, config, database, tests)
- **What is restricted** (secrets, credentials, private logs)
- **Recommended reading order** to understand the system

This inventory is a living document. Update it whenever new major folders, modules, or restrictions are introduced.

---

## 2. Repository Overview

| Area | Path | Type | Description | Read Priority |
|---|---|---|---|---|
| Backend Source | `EDCAP_BE/src/main/java/` | Source (Java 21) | Hexagonal architecture: domain, application, infrastructure, web layers | 🔴 **High** |
| Frontend Source | `EDCAP_FE/src/` | Source (TypeScript 5.7 + React 18) | SPA with Redux Toolkit, TanStack Query, Zustand, Radix UI + Tailwind | 🔴 **High** |
| Database Migrations | `EDCAP_BE/src/main/resources/db/migration/` | Source (SQL) | Flyway versioned migrations (V1–V4 legacy, V5+ uses `tbl_` prefix) | 🟡 **Medium** |
| Backend Config | `EDCAP_BE/src/main/resources/` | Config (YAML, properties) | application.yml, MyBatis mappers, i18n bundles | 🟡 **Medium** |
| Frontend Config | `EDCAP_FE/` root | Config (JSON, TypeScript) | package.json, vite.config.ts, tsconfig.json, eslint.config.js, tailwind.config.js | 🟡 **Medium** |
| i18n Assets | `EDCAP_FE/public/locales/` | Assets (JSON) | Multilingual strings (en/, ja/, vi/) | 🟢 **Low** |
| Documentation | `docs/` | Docs (Markdown) | Architecture, standards, testing, security, phase0 maintenance | 🟡 **Medium** |
| Docker/Deployment | `EDCAP_BE/Dockerfile`, `docker-compose.yml` | DevOps | Backend containerization and compose setup | 🟢 **Low** |
| Build Output | `EDCAP_BE/target/`, `EDCAP_FE/dist/`, `node_modules/` | Excluded | Maven/npm build artifacts and dependencies | 🔵 **Excluded** |
| Test Coverage Reports | `EDCAP_FE/coverage/` | Excluded | Generated coverage reports | 🔵 **Excluded** |

---

## 3. Application Source Areas

### Backend (Hexagonal Architecture)

| Module/Layer | Path | Language/Stack | Responsibility | Owner/Unknown |
|---|---|---|---|---|
| **Domain** | `EDCAP_BE/src/main/java/com/sdd/platform/domain/` | Java 21 (no framework deps) | Pure business logic: entities (Lombok), enums, `DomainException` hierarchy, service contracts | Known: @Builder @Getter @Setter @NoArgsConstructor |
| Domain Models | `domain/model/` | Java | Core entities (app user, project, finding, score, ticket, etc.) — Lombok pattern enforced | Known |
| Domain Exceptions | `domain/exception/` | Java | `DomainException` base, `NotFoundException`, `ApplicationException` subtypes | Known |
| Domain Services | `domain/service/` | Java | Domain-level business rules (e.g., scoring logic) | Unknown (may exist) |
| **Application** | `EDCAP_BE/src/main/java/com/sdd/platform/application/` | Java 21 + Spring (@Service) | Use cases, orchestration, port interfaces (inbound/outbound), application exceptions | Known |
| Use Cases | `application/usecase/` | Java | Service layer methods (public operations like "create project", "fetch metrics") | Known |
| Port Interfaces | `application/port/` | Java | Inbound ports (API contracts), outbound ports (persistence, GitHub, Jira, CircleCI, Git) | Known |
| Application Exceptions | `application/exception/` | Java | Non-domain exceptions (validation, conflict, etc.) | Known |
| **Infrastructure** | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/` | Java 21 + Spring | Adapter implementations of application ports; external integrations | Known |
| PostgreSQL Adapter | `infrastructure/persistence/` | Java + MyBatis | JDBC + MyBatis mappers, SQL queries, transactions (`@Transactional` on adapter methods) | Known |
| GitHub Adapter | `infrastructure/github/` | Java + WebClient | GitHub API integration, PR/commit fetch via GitHub API | Known |
| Jira Adapter | `infrastructure/jira/` | Java + WebClient | Jira API integration (ticket fetch, link to PR) | Known |
| CircleCI Adapter | `infrastructure/circleci/` | Java + WebClient | CircleCI API integration (CI run data) | Known |
| Git Local Adapter | `infrastructure/gitlocal/` | Java + JGit/CLI | Local git operations (clone, fetch, parse history) | Known |
| **Web Layer** | `EDCAP_BE/src/main/java/com/sdd/platform/web/` | Java 21 + Spring | Thin controllers, DTOs, Spring Security, webhook handlers | Known |
| REST Controllers | `web/rest/` | Java + @RestController | HTTP endpoints for API (GET /api/projects, POST /api/tickets, etc.) | Known |
| DTOs | `web/dto/` | Java | Data Transfer Objects (request/response payloads) | Known |
| Security / Auth | `web/security/` | Java + Spring Security | Login/session auth, token handling, user principal extraction | Known |
| Webhook Handlers | `web/webhook/` | Java | GitHub, Jira webhook receivers; HMAC-SHA256 signature validation | Known |
| Exceptions (Web) | `web/exception/` | Java | Web layer exceptions, `GlobalExceptionHandler` (centralized HTTP status mapping) | Known |
| **Entry Point** | `EDCAP_BE/src/main/java/com/sdd/platform/SddPlatformApplication.java` | Java | Spring Boot `@SpringBootApplication` main class | Known |

### Frontend (React SPA)

| Module/Layer | Path | Language/Stack | Responsibility | Owner/Unknown |
|---|---|---|---|---|
| **Components** | `EDCAP_FE/src/components/` | TypeScript + React 18 | Reusable UI building blocks (forwardRef + displayName, CVA variants, named exports) | Known |
| UI Library | `components/ui/` | TypeScript + Radix UI + Tailwind | Radix-based buttons, dialogs, dropdowns, tabs, tooltips, etc. | Known |
| Layout | `components/Layout.tsx` | TypeScript + React | Main app layout (header, sidebar, language toggle) | Known |
| **Hooks** | `EDCAP_FE/src/hooks/` | TypeScript | Custom React hooks (wrap TanStack Query data fetching and mutations) | Known |
| **Interfaces** | `EDCAP_FE/src/interfaces/` | TypeScript | Type definitions, DTOs, API response shapes, enums | Known |
| **Pages** | `EDCAP_FE/src/pages/` | TypeScript + React | Route-level components (layout children for each page) | Known |
| **State Management** | `EDCAP_FE/src/store/` + `services/` | TypeScript + Redux Toolkit + Zustand | Redux slices (user session, language), Zustand stores (UI ephemeral state) | Known |
| **API Layer** | `EDCAP_FE/src/lib/api.ts` | TypeScript | Centralized fetch wrapper, `ApiError` type, `credentials: "include"` for sessions | Known |
| Query Client | `lib/queryClient.ts` | TypeScript + TanStack Query | TanStack Query configuration and cache settings | Known |
| **Utils** | `EDCAP_FE/src/utils/` | TypeScript | Pure utility functions (formatters, parsers, validators) | Known |
| **Entry Point** | `EDCAP_FE/src/main.tsx` | TypeScript + React | App initialization, TanStack Query setup, store initialization | Known |
| **Router** | `EDCAP_FE/src/App.tsx`, `router-*.ts` | TypeScript + React Router | Route configuration, guards, language-first URL segment (/:lang/...) | Known |
| **i18n** | `EDCAP_FE/src/i18n.ts` | TypeScript | react-i18next setup, language persistence | Known |
| **Root App** | `EDCAP_FE/src/App.tsx` | TypeScript + React | Root component wrapper | Known |

---

## 4. Entry Points

| Entrypoint | Path | Type | Note |
|---|---|---|---|
| **Backend Startup** | `EDCAP_BE/src/main/java/com/sdd/platform/SddPlatformApplication.java` | Java Main | Spring Boot application entry point; port 8080 by default |
| **Frontend SPA** | `EDCAP_FE/src/main.tsx` | TypeScript Main | Vite entry point; mounts React app in `#root` (index.html) |
| **Frontend Router** | `EDCAP_FE/src/App.tsx` | TypeScript | React Router v6 configuration; language-first URL scheme |
| **Backend API Gateway** | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/` | Spring Controllers | REST API entry points (each controller is a separate endpoint module) |
| **Auth Flow** | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java`, `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthService.java` | Spring Security | Username/password login, JWT issuance, session/token handling |
| **Webhook Receivers** | `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/` | Spring Controllers | GitHub, Jira webhook endpoints; HMAC validation before processing |

---

## 5. Configuration Files

| File | Purpose | Safe to Read? | Note |
|---|---|---|---|
| **EDCAP_BE/pom.xml** | Maven build config, dependencies, Java version, plugins | ✅ Yes | Java 21, Spring Boot 3.4.1, MyBatis, Flyway, JUnit 5, Mockito, ArchUnit |
| **EDCAP_BE/Dockerfile** | Backend container image definition | ✅ Yes | Multi-stage build (Maven 3.9.9 + temurin-21 JRE); exposes port 8080 |
| **EDCAP_BE/docker-compose.yml** | Local dev environment orchestration | ✅ Yes | PostgreSQL 16 + backend service setup for local development |
| **EDCAP_BE/src/main/resources/application.yml** | Spring Boot application config | ✅ Yes | Datasource, Flyway, JWT settings, Actuator settings (secrets read from env vars) |
| **EDCAP_FE/package.json** | npm dependencies, build/lint scripts | ✅ Yes | React 18, TypeScript 5.7, Vite 6, Redux Toolkit, TanStack Query, ESLint, Prettier, Vitest, Playwright |
| **EDCAP_FE/vite.config.ts** | Vite bundler configuration | ✅ Yes | React SWC plugin, path alias `@/`, dev server proxy (API → backend) |
| **EDCAP_FE/tsconfig.json** | TypeScript compiler options | ✅ Yes | strict: true, noUnusedLocals, noUnusedParameters, path alias `@/*` |
| **EDCAP_FE/eslint.config.js** | ESLint linting rules | ✅ Yes | no-explicit-any enabled globally (targeted overrides in form/, interfaces/) |
| **EDCAP_FE/tailwind.config.js** | Tailwind CSS customization | ✅ Yes | Extended colors, spacing, responsive breakpoints |
| **EDCAP_FE/postcss.config.js** | PostCSS plugins (Tailwind) | ✅ Yes | Tailwind CSS plugin |
| **EDCAP_FE/playwright.config.ts** | Playwright E2E test config | ✅ Yes | Chrome headless, timeout 30s, screenshots on failure |
| **EDCAP_FE/.husky/pre-commit** | Git pre-commit hook | ✅ Yes | Runs lint-staged (ESLint, Prettier) before commit |
| **EDCAP_BE/src/main/resources/db/migration/** | Flyway SQL migrations | ✅ Yes | Versioned: V1–V4 (legacy), V5+ (tbl_ prefix convention). No secrets embedded. |
| **EDCAP_BE/src/main/resources/mapper/** | MyBatis XML mappers | ✅ Yes | SQL queries parameterized; no hardcoded credentials |
| **EDCAP_FE/public/locales/{en,ja,vi}/** | i18n translation files | ✅ Yes | JSON bundles for multilingual UI strings |

### Restricted Configuration

| File | Reason | Policy |
|---|---|---|
| `.env`, `.env.production`, `.env.local` | Secrets: database passwords, OAuth2 client secrets, API keys | ⛔ **Never read or commit** — use `.env.example` as template |
| `application-prod.yml` | Production-specific secrets and credentials | ⛔ **Never read or commit** |
| AWS/GCP service account keys (`*.json`) | Cloud provider authentication | ⛔ **Never read or commit** — stored in CI/CD secrets manager only |
| Private SSH keys (`id_rsa*`, `*.pem`, `*.p12`) | Git/registry authentication | ⛔ **Never read or commit** |

---

## 6. Test Areas

| Test Area | Path | Test Type | Note |
|---|---|---|---|
| **Frontend E2E Tests** | `EDCAP_FE/e2e_tests/` | Playwright (end-to-end) | Smoke tests for critical user workflows; currently minimal coverage |
| E2E Test Data | `e2e_tests/data/` | YAML/JSON fixtures | Test data fixtures and mocks |
| E2E Page Objects | `e2e_tests/pages/` | Playwright Page Objects | Reusable Playwright page helpers |
| E2E Test Cases | `e2e_tests/tests/` | Playwright spec files | Actual test cases (test_*.ts or *.spec.ts pattern) |
| **Frontend Unit Tests** | `EDCAP_FE/src/__tests__/` | Vitest + React Testing Library | Component and hook unit tests — **currently empty; Phase 1+ must add tests** |
| **Backend Unit Tests** | `EDCAP_BE/src/test/java/` | JUnit 5 + Mockito | Package structure mirrors src/main/java; ArchUnit layer tests | **Minimal** |
| **Integration Tests** | N/A | TestContainers + Spring Boot Test | **Currently absent; Phase 1+ prerequisite** for critical flows (auth, webhook) |

### Test Execution

```bash
# Frontend unit tests (Vitest)
npm run test

# Frontend E2E tests (Playwright)
npm run test:e2e
npm run test:e2eui  # UI mode

# Frontend coverage (Vitest)
npm run test:coverage

# Backend tests (Maven)
mvn clean verify  # Runs all tests + ArchUnit layer checks
```

---

## 7. Generated / Vendor / Build Output

| Path | Reason to Exclude | Note |
|---|---|---|
| **EDCAP_BE/target/** | Maven build output, compiled .class files, JAR archives | Generated; rebuild with `mvn clean` |
| **EDCAP_FE/dist/**, **build/** | Vite production bundle output | Generated; rebuild with `npm run build` |
| **EDCAP_FE/node_modules/** | npm package cache (thousands of files) | Vendor; reinstall with `npm install` if needed |
| **EDCAP_FE/coverage/** | Vitest/Playwright coverage reports (HTML) | Generated reports; rebuild with `npm run test:coverage` |
| **EDCAP_BE/src/test/generated-sources/**, **generated-test-sources/** | Maven Annotation Processing output | Generated by compiler (stale) |
| **.git/**, **.gitignore** | Git metadata and ignore rules | Meta; not source code |
| **node_modules/.cache/**, **node_modules/.bin/** | npm internal caches | Vendor; not readable |

---

## 8. Sensitive / Restricted Areas

| Path/Pattern | Reason | Policy |
|---|---|---|
| `**/.env*` | Environment-specific secrets (DB password, OAuth client secret, API keys) | ⛔ Never read; use `.env.example` template |
| `**/application-*.yml` with `password:`, `secret:` fields | Production secrets in YAML files | ⛔ Never read production configs |
| `**/*.pem`, `**/*.key`, `**/*_rsa*`, `**/*.p12`, `**/*.jks` | Private cryptographic keys | ⛔ Never read or extract |
| `**/src/test/resources/secrets/` (if exists) | Test fixture credentials | ⛔ Never commit real secrets; use dummy values |
| `docs/maintenance/phase0/phase0-review.md` → "PII / Restricted" section | Personally identifiable data or confidential decisions | ⛔ Read only if context requires; handle with care |
| Production logs (CloudWatch, Stackdriver, etc.) | Raw logs may contain PII, tokens, user data | ⛔ Never extract raw logs; aggregate/redact before analysis |

---

## 9. Recommended Reading Order

### Phase 1 — Onboarding / Understanding the System

1. **[.claude/CLAUDE.md](../../.claude/CLAUDE.md)** — Project overview, tech stack, current phase, safety rules summary
2. **[docs/architecture/overview.md](./overview.md)** — System context diagram, hexagonal architecture, layers
3. **[docs/architecture/key-flows.md](./key-flows.md)** — JWT login, webhook processing, metric sync flows
4. **[docs/standards/coding.md](../standards/coding.md)** — Code style (Java/Spring, TypeScript/React), component patterns, test patterns
5. **[docs/standards/security.md](../standards/security.md)** — auth, HMAC validation, error responses, secrets policy
6. **[.claude/rules/00-safety.md](../../.claude/rules/00-safety.md)** — Safety rules (don't read .env, don't force-push, ask first)

### Phase 2 — Backend Implementation

7. **EDCAP_BE/pom.xml** — Understand dependencies (Spring Boot, MyBatis, Flyway, test frameworks)
8. **EDCAP_BE/src/main/java/com/sdd/platform/domain/** — Study entity model (Lombok patterns, enums, DomainException hierarchy)
9. **EDCAP_BE/src/main/java/com/sdd/platform/application/port/** — Port interfaces (what adapters must implement)
10. **EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/** — MyBatis mappers and SQL queries
11. **EDCAP_BE/src/main/resources/db/migration/** — Flyway schema; understand V1–V4 legacy, V5+ naming (tbl_ prefix)
12. **EDCAP_BE/src/main/java/com/sdd/platform/web/rest/** — REST controller examples
13. **[docs/standards/templates/be-use-case.md](../standards/templates/be-use-case.md)** — When creating a new use case

### Phase 3 — Frontend Implementation

14. **EDCAP_FE/package.json** — Dependencies (React 18, TypeScript 5.7, Vite, Redux Toolkit, TanStack Query)
15. **EDCAP_FE/tsconfig.json**, **vite.config.ts** — Build setup and path aliases
16. **EDCAP_FE/src/lib/api.ts** — API fetch wrapper and error handling
17. **EDCAP_FE/src/App.tsx** — React Router setup and URL language segment
18. **EDCAP_FE/src/pages/** — Example page structure
19. **EDCAP_FE/src/components/ui/** — Example Radix UI + Tailwind components
20. **EDCAP_FE/src/store/** — Redux Toolkit slices for global state
21. **[docs/standards/templates/fe-component.md](../standards/templates/fe-component.md)** — When creating a new component
22. **[docs/standards/templates/fe-hook.md](../standards/templates/fe-hook.md)** — When creating a new custom hook

### Phase 4 — Testing & CI/CD

23. **[docs/standards/testing.md](../standards/testing.md)** — JUnit 5 + Mockito + ArchUnit (BE); Vitest + Playwright (FE)
24. **EDCAP_BE/src/test/java/** — Example test structure
25. **EDCAP_FE/e2e_tests/tests/** — Example E2E test cases

### Phase 5 — Database & Migration

26. **[docs/standards/database.md](../standards/database.md)** — Naming conventions (snake_case, tbl_ prefix V5+, UNIQUE constraints)
27. **EDCAP_BE/src/main/resources/db/migration/** — Study migration patterns (V001__Create_initial_schema.sql, etc.)

---

## 10. Unknown / Need Confirmation

| Item | Reason | Required Action |
|---|---|---|
| Full extent of existing adapters (GitHub, Jira, CircleCI) | Infrastructure layer may have incomplete/partial implementations | Audit `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/{github,jira,circleci}/` with team |
| Test coverage baseline | No existing unit or integration tests visible in src/test/java/ | Phase 1 prerequisite: add test suite with SonarQube integration |
| CI/CD pipeline config | No GitHub Actions or GitLab CI files visible | Phase 1 prerequisite: design and implement CI/CD workflow |
| Frontend feature completeness | src/__tests__/ is empty; unknown which components are production-ready | Audit EDCAP_FE/src/pages/ and components/ with PM / design team |
| Database migration V4 state | schema may be incomplete or under active development | Verify `EDCAP_BE/src/main/resources/db/migration/V4__*` is final or work-in-progress |
| Jira/GitHub webhook secret rotation policy | HMAC signing documented but rotation schedule unknown | Document secret rotation procedure in Phase 1+ ops runbook |
| i18n completeness | Locales exist (en/, ja/, vi/) but translation coverage unknown | Audit translation keys against UI with i18n team |
| Build performance (Maven, Vite) | No explicit metrics on build times | Profile build times in Phase 1+ CI/CD setup (target: <5min for BE, <2min for FE) |
| Docker image size | No metrics on final container size for backend | Optimize Dockerfile if needed; target <300MB |

---

## 11. Maintenance Notes

### Last Updated
- **Date:** 2026-06-08
- **Phase:** 0-B completion (Common Base / Source Intelligence)
- **Maintainer:** Tech Lead / Architecture Team

### Key Decisions Recorded
- PJ1: Database `tbl_` prefix for V5+ migrations (legacy V1–V4 unchanged)
- PJ2: Radix UI is primary; Ant Design for existing usage only (no new components)
- PJ3: Conventional Commits + feature-branch git workflow
- PJ4: Semantic Versioning (0.x.x pre-1.0)
- PJ5: `no-explicit-any` enabled globally; targeted overrides in form/ and interfaces/

### How to Maintain This Document
1. When adding a new module, layer, or major component → add row to **§3 Application Source Areas**
2. When adding a new configuration file → add row to **§5 Configuration Files**
3. When onboarding a new team member → walk them through §9 Recommended Reading Order
4. When architecture changes → update **§9** and review **§8 Sensitive Areas**
5. When moving to Phase 1 → resolve items in **§10 Unknown / Need Confirmation** and update status

### Known Limitations & Future Improvements
- No API documentation (Swagger/OpenAPI) — Phase 1+ prerequisite
- No centralized logging aggregation — Phase 1+ prerequisite
- E2E test coverage minimal — Phase 1+ to expand
- No performance monitoring / APM — Phase 1+ to add
- No automated rollback procedure — Phase 1+ ops runbook

---

## Quick Reference — File Lookup Guide

| Looking for… | Look in… |
|---|---|
| **How to add a new REST endpoint?** | `docs/standards/templates/be-controller.md`, then `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/` |
| **How to add a new database table?** | `docs/standards/database.md`, `docs/standards/templates/be-adapter.md`, then create Flyway migration in `EDCAP_BE/src/main/resources/db/migration/` |
| **How to add a new React component?** | `docs/standards/templates/fe-component.md`, then place in `EDCAP_FE/src/components/` |
| **How to add a new custom hook?** | `docs/standards/templates/fe-hook.md`, then place in `EDCAP_FE/src/hooks/` |
| **What are the security rules?** | `.claude/rules/30-security.md`, `docs/standards/security.md` |
| **What is hexagonal architecture?** | `docs/architecture/overview.md` §Backend — Hexagonal Architecture |
| **How to run tests?** | `docs/standards/testing.md`, then use `mvn clean verify` (BE) or `npm run test:e2e` (FE) |
| **How do I authenticate?** | `docs/architecture/key-flows.md` §JWT Authentication, `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` |
| **What about database migrations?** | `docs/standards/database.md`, `EDCAP_BE/src/main/resources/db/migration/` |
| **Where are i18n translations?** | `EDCAP_FE/public/locales/{en,ja,vi}/`, configured in `EDCAP_FE/src/i18n.ts` |
| **What should I NOT read?** | `.env*`, `application-prod.yml`, `*.pem`, `*.key` — see **§8 Sensitive / Restricted Areas** |

