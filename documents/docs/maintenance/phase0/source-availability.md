# Source Availability Summary

**Date:** 2026-06-08
**Scope:** EDCAP_BE + EDCAP_FE as of Phase 0-B Standards Expansion

This document records what is solid, what is missing, and what is ambiguous in the codebase.
It is the primary input for Phase 1 kick-off and team alignment sessions.

---

## Solid — evidence-backed, safe to build on

| Area | Evidence | Notes |
|------|----------|-------|
| BE Hexagonal Architecture | ArchUnit test enforces layer rules | `ArchitectureTest.java` must stay green |
| BE Domain model | Lombok + plain Java, no framework deps | Enums, builder pattern consistent |
| BE Exception hierarchy | `DomainException` → `NotFoundException`, `ApplicationException` | `GlobalExceptionHandler` maps to HTTP |
| BE MyBatis patterns | `<sql id="columns">`, `useGeneratedKeys`, pagination | 9 mappers, consistent pattern |
| BE OAuth2 security | Spring Security, Google, session cookie | HMAC webhook validation present |
| BE Error response format | `ErrorResponse(OffsetDateTime, status, errorCode, message, traceId)` | OffsetDateTime confirmed; no stack traces to client |
| BE Logging | SLF4J + Logback; `TraceIdFilter` injects `trc_` + 12-char hex; `X-Trace-Id` response header | MDC key `traceId` |
| BE Pagination | `?limit=N` (default 20) + LIMIT/OFFSET; no Spring Pageable | Consistent across Admin, Me controllers |
| BE URL pattern | `/api/v1/<resource>[/<id>]` | Health check at `/health` (not versioned) |
| FE TypeScript strict | `strict: true`, `noUnusedLocals/Params` in tsconfig | Path alias `@/` configured |
| FE API layer | `lib/api.ts` fetch wrapper, `ApiError`, `credentials: "include"` | No Axios dependency |
| FE State split | TanStack Query / Redux Toolkit / Zustand — clear ownership | Pattern established in layout |
| FE Component pattern | `forwardRef` + `displayName`, CVA variants, `cn()`, named exports | Consistent in UI library |
| FE Lint tooling | ESLint 8, SonarJS, Prettier, jsx-a11y, case-police | Pre-commit via Husky (fixed Phase 0-B) |
| FE i18n | `public/locales/{lang}/locale.json`; `Pages.{Feature}.{Key}` key pattern; `useTranslation("locale")` | `{{interpolation}}` syntax |
| FE error handling | `useAuth` returns null on 401; component `isError` checks; no global ErrorBoundary | Inline per-component pattern |
| DB naming conventions | `snake_case`, `BIGSERIAL id`, UNIQUE on business keys, `TIMESTAMPTZ` | V1–V3; V4+ adds `tbl_` prefix (PJ1 resolved) |
| DB V4 schema | `tbl_dim_*` / `tbl_fact_*` / `tbl_auth_*`; UUID PKs; idx_*/uq_*/ck_* naming; `set_updated_at()` trigger | 10 ENUM types defined |
| Flyway migration chain | V1 → V4 linear, no gaps | V4 partial schema rebuild |
| HikariCP config | max-pool-size 10; min-idle 2; `SET TIME ZONE 'UTC'` | `connection-init-sql` |

---

## Missing — gaps to address before or during Phase 1

| Area | Impact | Recommended Action |
|------|--------|-------------------|
| FE test files | Zero tests in `src/__tests__/` or `e2e_tests/` | Add tests for every new component and hook from Phase 1 onward |
| BE integration tests | No DB-backed tests | Add `@SpringBootTest` + Testcontainers for critical flows (auth, webhook) |
| CI/CD pipeline | No automated checks on push | Phase 1 prerequisite: GitHub Actions with build + test + lint |
| BE linting | No Checkstyle or PMD | Add as Maven plugin in Phase 1 |
| OpenAPI / Swagger | No API documentation | Add `springdoc-openapi` in Phase 1 |
| PR template | No `.github/PULL_REQUEST_TEMPLATE.md` | Create during Phase 1 setup |
| Coverage thresholds | Not configured in `vitest.config.ts` or `pom.xml` | Depends on HD4 decision |
| Log rotation config | No `logback-spring.xml` | Using Spring Boot default stdout; depends on HD6 |
| Rate limiting | No Spring or gateway config | Depends on Phase 1 scope |

---

## Open Human Decisions (HD1–HD7)

These decisions block related standard rules from becoming confirmed. Rules that depend on
them are marked `[Candidate]` in the relevant standards files.

| ID | Question | Blocks | Status |
|----|----------|--------|--------|
| HD1 | Should success responses use a standard envelope `{ data, meta, error }`? Currently raw DTO. | [api-contract.md](../../standards/api-contract.md) | Open |
| HD2 | Fix `AdminController` 403 inconsistency: return `ErrorResponse` or keep `Map.of()`? | [error-handling.md](../../standards/error-handling.md), [api-contract.md](../../standards/api-contract.md) | Open |
| HD3 | Dependency update cadence: monthly? quarterly? Renovate auto-PR? PR review SLA? | [maintenance.md](../../standards/maintenance.md), [review.md](../../standards/review.md) | Open |
| HD4 | Code coverage targets: unit test %? E2E per-journey coverage? | [testing.md](../../standards/testing.md) | Open |
| HD5 | Add global React `<ErrorBoundary>` at app root? Or keep inline error handling? | [frontend.md](../../standards/frontend.md) | Open |
| HD6 | Log retention policy and infrastructure: CloudWatch? ELK? Loki? stdout only? | [logging.md](../../standards/logging.md) | Open |
| HD7 | API v2 strategy: new `/api/v2/` path? Header versioning? Deprecation window? | [api-contract.md](../../standards/api-contract.md) | Open |

To resolve an HD: discuss with the team, record the decision in the **Resolved Decisions** section below,
and update the relevant standards file to promote the Candidate rule to Confirmed.

---

## Resolved Decisions

### PJ1 — Database table naming (✅ Resolved 2026-06-08)

**Decision:** `tbl_` prefix is the new convention. All tables created in V5+ migrations must use the `tbl_` prefix (e.g., `tbl_finding`, `tbl_score`).
V1–V4 legacy tables (`app_user`, `project`, `ticket`, …) are **not** renamed retroactively.

**Impact:** Updated in `docs/standards/coding.md` §Database Conventions and `docs/standards/database.md`.

---

### PJ2 — UI library strategy: Ant Design vs Radix UI (✅ Resolved 2026-06-08)

**Decision:** Radix UI + Tailwind CSS is the **primary UI system** for all new components.
Ant Design is retained for existing usages only (complex `<Table>`, date pickers, upload).
No new Ant Design components may be introduced in Phase 1+.
When a Radix-based equivalent is ready, migrate existing Ant Design components.

**Impact:** Updated in `docs/standards/frontend.md` §UI Library Policy.

---

### PJ3 — Git workflow (✅ Resolved 2026-06-08)

**Decision:** Conventional Commits + feature-branch workflow.
See `docs/standards/git-workflow.md` for full detail.

Summary:
- Branch: `feat/<ticket-key>-<desc>`, `fix/<ticket-key>-<desc>`, `chore/<desc>`, `docs/<desc>`
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`)
- PR: 1 reviewer required; CI must be green before merge (once CI exists)

---

### PJ4 — Semantic versioning and release process (✅ Resolved 2026-06-08)

**Decision:** Semantic Versioning 2.0 (`MAJOR.MINOR.PATCH`).
Current state is pre-1.0 (`0.x.x`). First production-ready release = `1.0.0`.

Release process:
1. Merge to `main` triggers CI build + tests
2. Manual: create git tag `vX.Y.Z` → triggers release GitHub Action (Phase 1+)
3. CHANGELOG updated in `docs/changes/CHANGELOG.md` per release

---

### PJ5 — ESLint `no-explicit-any` scope (✅ Resolved 2026-06-08)

**Decision:** Re-enable `no-explicit-any` globally. Add targeted ESLint overrides for:
- `src/components/ui/form/**` — `generateForm()` dynamic config legitimately needs `any`
- `src/interfaces/**` — generic response wrappers with unresolved type parameters

All other `any` usage requires an inline disable with a justification comment:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- reason: <why>
```

**Impact:** Updated in `docs/standards/frontend.md` §TypeScript Conventions.

---

## Ambiguous — needs verification before relying on

| Area | Observation | Action |
|------|-------------|--------|
| Husky `.husky/` directory | Was missing; added in Phase 0-B | Verify: stage a TS file and run `git commit` to confirm hook fires |
| GitHub connector auth | WebClient calls GitHub API — token vs OAuth app unclear | Read `infrastructure/github/` closely in Phase 1 |
| FE `generateForm()` test coverage | Central to data entry but zero tests | High risk; first candidate for Vitest tests |
