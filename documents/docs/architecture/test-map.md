# Test Map

## 1. Purpose

Documents the complete test landscape of EDCAP: what tests exist, what they cover, how to
run them, what is missing, and what is fragile.

**Scope:** Both EDCAP_BE (Java/Spring Boot) and EDCAP_FE (React/TypeScript).

**Important distinction used throughout this file:**
- *Exists* — file is present and syntactically valid
- *Confirmed run* — the test was executed and the result (pass/fail) was observed in this session

The original phase-0 test inventory below was not confirmed to pass in this session; later snapshots record implemented Organization and Team coverage that was verified in project workspaces.

---

## 2. Test Framework / Tooling

| Area | Tool / Framework | Config Path | Note |
|------|-----------------|-------------|------|
| BE unit | JUnit 5 (via `spring-boot-starter-test`) | `EDCAP_BE/pom.xml` | Included via Spring Boot BOM; no explicit version pin |
| BE mocking | Mockito (via `spring-boot-starter-test`) | `EDCAP_BE/pom.xml` | No `@MockBean` in current tests — plain `Mockito.mock()` |
| BE architecture | ArchUnit `archunit-junit5` v1.3.0 | `EDCAP_BE/pom.xml` | Enforces hexagonal layer rules at class level |
| BE security | `spring-security-test` | `EDCAP_BE/pom.xml` | Installed; not used in any current test file |
| BE assertions | JUnit 5 Assertions + AssertJ (both available) | `EDCAP_BE/pom.xml` | Current tests use `org.junit.jupiter.api.Assertions` only |
| BE test runner | Maven Surefire (Spring Boot default) | `EDCAP_BE/pom.xml` | **No Surefire plugin block configured** — uses parent default `2.x` |
| BE coverage | JaCoCo | `EDCAP_BE/pom.xml` | **Not configured** — no JaCoCo plugin found |
| FE unit/component | Vitest `^3.0.0` + jsdom `^24.1.1` | `EDCAP_FE/package.json` scripts | No `vitest.config.ts` found — uses package.json inline glob `src/**/*.{test,spec}.{ts,tsx}` |
| FE DOM assertions | `@testing-library/react` `^16.3.1` + `@testing-library/jest-dom` `^6.9.1` | `EDCAP_FE/package.json` | Installed; **no test files use it yet** |
| FE user interaction | `@testing-library/user-event` `^14.6.1` | `EDCAP_FE/package.json` | Installed; **no test files use it yet** |
| FE coverage | `@vitest/coverage-v8` `^3.0.0` | `EDCAP_FE/package.json` | Installed; no coverage thresholds configured; a `coverage/` directory exists from a prior run but source is unconfirmed |
| FE test UI | `@vitest/ui` `^3.0.0` | `EDCAP_FE/package.json` | Installed |
| FE faker | `@faker-js/faker` `^8.4.1` | `EDCAP_FE/package.json` | Installed; not used in any current test file |
| FE E2E | Playwright `@playwright/test` `^1.57.0` | `EDCAP_FE/playwright.config.ts` | Configured; 1 minimal smoke test exists |
| CI/CD | — | — | **No CI/CD pipeline found** — no `.github/workflows/`, no `.circleci/` |
| Contract tests | — | — | **Not present** — no Pact, no Spring Cloud Contract, no API schema diff tool |

---

## 3. Test Directory Map

| Test Type | Path | Target Area | Note |
|-----------|------|-------------|------|
| Unit — Application | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` | `GithubWebhookService` (application layer) | 8 tests; mocks `RepositoryRepositoryPort`, `PullRequestIngestionPort` |
| Unit — Architecture | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | All production classes in `com.sdd.platform` | 7 ArchUnit rules; scans bytecode at test runtime |
| Unit — Domain | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/ArtifactNormalizerTest.java` | `ArtifactNormalizer` (domain layer) | 6 tests; no mocks — pure function |
| Unit — FE | `EDCAP_FE/src/__tests__/` | (placeholder only) | `README.md` present; **no .test.ts or .spec.ts files** |
| Integration | — | — | **Not present** in either BE or FE |
| API / Web Layer | — | — | **Not present** — no `@WebMvcTest`, no `MockMvc`, no REST Assured |
| Contract | — | — | **Not present** |
| E2E | `EDCAP_FE/e2e_tests/tests/smoke.spec.ts` | FE app loads | 1 test: page title check; requires running dev server |
| E2E — pages | `EDCAP_FE/e2e_tests/pages/` | (placeholder) | `README.md` only; Page Object Model structure intended but not implemented |
| Test resources | — | — | **Not present** — no `EDCAP_BE/src/test/resources/` directory, no `application-test.yml`, no SQL fixtures |

---

## 4. Test Command Map

| Command | Purpose | Source | Confirmed Run? |
|---------|---------|--------|----------------|
| `mvn test` | Run all BE JUnit + ArchUnit tests | `EDCAP_BE/` directory | **Not confirmed** |
| `mvn clean verify` | Full BE build + tests (all lifecycle phases) | `EDCAP_BE/pom.xml` parent lifecycle | **Not confirmed** |
| `mvn clean package -DskipTests` | Build BE JAR, skip tests | `EDCAP_BE/Dockerfile` | Exists in Dockerfile — `-DskipTests` flag confirms tests are intentionally skipped in Docker build |
| `npm run test` | Run FE Vitest in interactive mode | `EDCAP_FE/package.json` `scripts.test` | **Not confirmed** — would pass immediately with `--passWithNoTests` equivalent (0 test files) |
| `npm run test:unit` | Run FE Vitest once with `--passWithNoTests` flag | `EDCAP_FE/package.json` `scripts.test:unit` | **Not confirmed** — `--passWithNoTests` means exit 0 even with zero test files |
| `npm run test:watch` | Vitest in watch mode | `EDCAP_FE/package.json` `scripts.test:watch` | **Not confirmed** |
| `npm run test:coverage` | Vitest + v8 coverage report | `EDCAP_FE/package.json` `scripts.test:coverage` | **Not confirmed** — `coverage/` directory exists from some prior run; when it was run and by whom is unknown |
| `npm run test:e2e` | Playwright E2E tests headless | `EDCAP_FE/package.json` `scripts.test:e2e` | **Not confirmed** — requires `npm run dev` to be startable and backend accessible |
| `npm run test:e2eui` | Playwright with interactive UI | `EDCAP_FE/package.json` `scripts.test:e2eui` | **Not confirmed** |

> **Note:** `npm run test:unit` uses `--passWithNoTests`. This means CI would show green for FE even with zero unit tests. This is a pipeline risk.

---

## 5. Existing Test Pattern Examples

| Pattern | Path | Use When | Note |
|---------|------|----------|------|
| Pure domain unit test — no Spring, no mocks | `ArtifactNormalizerTest.java:7` | Testing a pure function or value object in `domain/` | Instantiate class directly; use `assertEquals` / `assertTrue`; zero Spring context |
| Application layer unit test — mock ports | `GithubWebhookServiceTest.java:25` | Testing a `@Service` use case | `Mockito.mock(OutputPort.class)`; `@BeforeEach` wires service manually; no Spring context |
| HMAC test helper — compute real signature inline | `GithubWebhookServiceTest.java:151` | Testing HMAC-verified handlers | Private `hmac()` helper using real `javax.crypto.Mac`; produces valid signature for positive tests |
| ArchUnit rule — layer must not depend on layer | `LayerEnforcementTest.java:29` | Enforcing hexagonal architecture | `@AnalyzeClasses` + `@ArchTest static ArchRule`; runs on compiled bytecode; no Spring context |
| ArchUnit rule — annotation placement | `LayerEnforcementTest.java:67` | Ensuring `@Mapper`/`@RestController` live in correct packages | `classes().that().areAnnotatedWith(...).should().resideInAPackage(...)` |
| Playwright smoke test — page load | `e2e_tests/tests/smoke.spec.ts:1` | Verifying FE app starts and renders any page | `page.goto('/')` + `toHaveTitle(/.*/)`; requires dev server |
| BE negative test — SecurityException on bad input | `GithubWebhookServiceTest.java:48` | Verifying security gates reject bad inputs | `assertThrows(SecurityException.class, () -> ...)` |
| BE arrange-act-assert with mock verification | `GithubWebhookServiceTest.java:107` | Verifying a port method is called with specific args | `Mockito.when(...).thenReturn(...)` → call → `verify(mock).method(eq(...), eq(...), any())` |

---

## 6. Test Data / Fixture Map

| Data / Fixture | Path | Purpose | Note |
|----------------|------|---------|------|
| Inline string literals — HMAC secret | `GithubWebhookServiceTest.java:27` (`SECRET = "test-secret"`) | Provide deterministic webhook secret for HMAC tests | Hardcoded in test class; safe (test-only, not a real secret) |
| Inline JSON body — PR event payload | `GithubWebhookServiceTest.java:108` (text block) | Simulate GitHub `pull_request` webhook body | Minimal payload with `repository.full_name` and `pull_request.number` |
| Inline markdown strings | `ArtifactNormalizerTest.java` (multiple text blocks) | Exercise parser with front-matter, sections, AC | Covers YAML, `## headings`, `- AC-N:` items, Vietnamese headings |
| `usersData` — empty object | `EDCAP_FE/e2e_tests/data/user.data.ts:1` | Planned E2E user fixture (credentials, roles) | **Empty** — `const usersData = {}` — not yet populated |
| application-test.yml | — | Configure test-scoped DB, security, connectors | **Does not exist** — no `src/test/resources/` directory |
| SQL seed scripts | — | Pre-populate DB for integration/API tests | **Does not exist** |
| FE component fixtures / mock data | — | Provide typed test data to Vitest tests | **Does not exist** — `@faker-js/faker` is installed but unused |

---

## 7. Coverage / Protected Areas

| Area | Protected By | Confidence | Gap |
|------|-------------|------------|-----|
| GitHub HMAC signature validation — reject missing/wrong/empty | `GithubWebhookServiceTest` (3 rejection tests) | High | CircleCI HMAC validation not tested |
| GitHub `ping` event handling | `GithubWebhookServiceTest.accepts_valid_signature_on_ping` | Medium | Only `ping` event; no `push`, `issues`, etc. |
| GitHub `pull_request` event — known repo | `GithubWebhookServiceTest.pull_request_event_calls_ingestion_port_when_repo_known` | Medium | Port call verified; port internals (MyBatis adapter) not tested |
| GitHub `pull_request` event — unknown repo | `GithubWebhookServiceTest.pull_request_event_for_unknown_repo_returns_zero_records` | Medium | Zero records + no ingestion confirmed |
| GitHub webhook — malformed JSON | `GithubWebhookServiceTest.rejects_malformed_json_after_signature_check` | High | Only one malformed case tested |
| GitHub webhook — unknown event type | `GithubWebhookServiceTest.ignores_unknown_event_types` | Medium | Uses `"fork"` as example; other unknown types assumed equivalent |
| Hexagonal layer rules — `domain` isolation | `LayerEnforcementTest.domain_depends_on_nothing_inside_the_app` | High | Enforced via bytecode scan; runs at test time |
| Hexagonal layer rules — `infrastructure` call direction | `LayerEnforcementTest.infrastructure_does_not_call_application_usecases` | High | Same |
| Hexagonal layer rules — `application` isolation from infrastructure + web | Two rules in `LayerEnforcementTest` | High | Same |
| Hexagonal layer rules — `web` isolation from infrastructure | `LayerEnforcementTest.web_does_not_call_infrastructure_directly` | High | Same |
| `@Mapper` package placement | `LayerEnforcementTest.mybatis_mappers_stay_in_persistence_layer` | High | Same |
| `@RestController` package placement | `LayerEnforcementTest.rest_controllers_live_in_web_rest_or_webhook` | High | Same |
| `ArtifactNormalizer` — YAML front-matter parsing | `ArtifactNormalizerTest` (6 tests) | High | Edge cases: deeply nested YAML, duplicate keys |
| `ArtifactNormalizer` — SHA-256 content hash stability | `ArtifactNormalizerTest.computes_stable_sha256_hash` | High | Only same/different content tested; no collision edge case |
| `ArtifactNormalizer` — Vietnamese heading alias | `ArtifactNormalizerTest.has_section_matches_by_alias` | Medium | Only `Tổng quan` tested; other Vietnamese headings not tested |
| FE app starts and renders | `smoke.spec.ts` (1 test) | Very low | Only checks any title exists; not a meaningful page assertion |
| All other areas | — | **Not covered** | See §8 |

---

## 8. Known Test Gaps

| Gap | Risk | Suggested Test Type |
|-----|------|---------------------|
| No `@WebMvcTest` for any controller (`MeController`, `AdminController`, `HealthController`) | High — HTTP routing, status codes, ADMIN role gate behavior, error response shape untested | BE `@WebMvcTest` + `MockMvc` + `@WithMockUser` |
| No test for `AdminController` ADMIN 403 returning `200 + Map` (not `ErrorResponse`) | High — known contract bug (HD2); no regression test prevents it from being silently kept | BE `@WebMvcTest`, assert response shape is `ErrorResponse` with 403 |
| No test for `GlobalExceptionHandler` exception→HTTP mapping | High — single source of truth for all error responses; untested | BE `@WebMvcTest` with mock throwing each exception type |
| No CircleCI webhook service test | High — HMAC format differs (`v1=<hex>` header prefix); signature parsing untested | BE unit test mirroring `GithubWebhookServiceTest` pattern |
| No `ConnectorOrchestrationService` test | High — main sync path for all 4 connectors; no test for `ConnectorRun` lifecycle (RUNNING→SUCCESS/FAILED) | BE unit test; mock all 4 connector ports |
| No `OAuthUserService` / `TraceIdFilter` test | Medium — OAuth2 user upsert logic; first-user ADMIN bootstrap | BE unit test (pure logic), `@WebMvcTest` slice for filter |
| No MyBatis mapper / repository adapter test | Medium — SQL correctness untested; `findByStatus` full-scan, ORDER BY whitelist | BE integration test with embedded/real PostgreSQL (`@SpringBootTest`) |
| No DB migration integration test | Medium — V3 drops 5 tables irreversibly; V4 adds 40+ tables; no test that Flyway applies all migrations cleanly | BE `@SpringBootTest` with Flyway running against test DB |
| No FE unit/component tests (0 files) | High — all components, hooks, services, utils are untested | Vitest + Testing Library; start with `useAuth`, `AdminPage`, `lib/api.ts` |
| No FE `useAuth` test — 401 handling, logout flow | High — core auth path; 401→null conversion, `queryClient.setQueryData` on logout | Vitest; mock `endpoints.me()` to return 401 `ApiError` |
| No FE `lib/api.ts` test — `ApiError` construction, `body.message` extraction | High — all FE error handling depends on this | Vitest; mock `fetch`; assert `ApiError` fields |
| No meaningful E2E test beyond smoke | High — login flow, connector trigger, session expiry, OAuth2 error redirect untested | Playwright; requires test Google OAuth2 credentials or mock OAuth2 server |
| No contract test (FE ↔ BE shape parity) | Medium — `ConnectorRunDto`, `UserDto`, `ErrorResponse` shape changes could silently break FE | Pact consumer contract or snapshot test against OpenAPI spec |
| No test for pagination behavior (`limit` param, LIMIT/OFFSET in SQL) | Medium — `AdminController.runHistory` `limit` param; SQL LIMIT/OFFSET | BE `@WebMvcTest` + integration test |
| No test for `DemoController` / `GitLocalArtifactService` filesystem reading | Medium — reads from filesystem; path traversal risk untested | BE unit test; mock filesystem; assert path normalization |
| No security test for `permitAll` routes vs protected routes | Medium — route authorization matrix not tested | BE `@WebMvcTest` + `@WithAnonymousUser` / `@WithMockUser` |
| `--passWithNoTests` flag in `npm run test:unit` | Pipeline risk — CI would show green with zero FE test files | Remove flag once first FE test is written |
| No CI/CD pipeline | Pipeline risk — no automated test gate on commit/PR | Add GitHub Actions or CircleCI workflow running `mvn verify` + `npm run test:unit` + `npm run test:e2e` |

---

## 9. Brittle / Risky Tests

| Test / Path | Risk | Note |
|-------------|------|------|
| `smoke.spec.ts` — `toHaveTitle(/.*/);` | Very low assertion quality | Matches any title including empty string; will pass even if the app loads an error page with a title. Replace with `toHaveTitle(/EDCAP/)` or a meaningful page element check |
| `smoke.spec.ts` — depends on `npm run dev` | Environment dependency | If dev server fails (port conflict, env var missing, Vite compile error), the test fails with a misleading timeout error, not a test assertion failure |
| `GithubWebhookServiceTest` — `AppProperties` constructed with `null` fields | Fragile wiring | `new AppProperties(null, null, null, connectors)` — if `AppProperties` adds non-null validation or required fields, all 8 tests break at construction time |
| `GithubWebhookServiceTest.pull_request_event_calls_ingestion_port_when_repo_known` — uses `any()` for payload arg | Weak arg verification | `verify(ingestion).upsertPullRequest(eq(10L), eq(repo), any())` — the actual parsed `PullRequestPayload` content is not asserted; a wrong payload would still pass |
| `ArtifactNormalizerTest` — text block indentation sensitivity | Latent formatting risk | JVM text blocks strip consistent leading whitespace; a change in indentation of test strings could subtly change the input to the parser |
| `LayerEnforcementTest` — `@AnalyzeClasses` scope is entire `com.sdd.platform` | Scope creep | If new packages outside the intended hexagonal structure are added, they may not be caught unless `LayerEnforcementTest` rules are updated to cover them |
| `npm run test:coverage` output in `coverage/` | Stale report | The `coverage/` directory exists from a prior run with no associated timestamp or commit reference; the report may not reflect current code state |

---

## 10. Test Execution Notes

### Backend

Run tests from `EDCAP_BE/` directory:
```
mvn test
```

- Requires Java 21 and Maven on PATH
- Does **not** require a running database — all 3 existing tests run without DB (no Spring context loaded)
- `LayerEnforcementTest` requires compiled production classes to exist; `mvn test` compiles them automatically
- The Docker build skips tests (`-DskipTests`); tests must be run separately before building the image

### Frontend — Unit Tests

Run from `EDCAP_FE/` directory:
```
npm run test:unit
```

- Returns exit 0 immediately because `--passWithNoTests` is set and zero test files exist
- This is **not** a meaningful test run — no assertions execute

### Frontend — E2E Tests

Run from `EDCAP_FE/` directory:
```
npm run test:e2e
```

**Pre-requisites (not configured automatically):**
1. Backend must be running (or the smoke test will fail when the dev server's API proxy tries to connect)
2. `npm install` + `npx playwright install` must have been run at least once to install browser binaries
3. Dev server starts automatically via `playwright.config.ts` `webServer` command; if port 5173 is already occupied and `CI=false`, Playwright reuses the existing server

**E2E test result against a non-running backend:**
- `smoke.spec.ts` may still pass because it only checks the page title — Vite serves the HTML shell even without a backend. Whether it passes depends on whether the React app itself errors before setting a title.

### No Test Database Configuration

No `application-test.yml` or test-scoped data source exists. If integration tests are added in the future, they will need:
- A test PostgreSQL instance (Docker Compose `test` profile, or Testcontainers)
- `application-test.yml` in `src/test/resources/` with test DB URL + credentials

---

## 11. Unknown / Need Confirmation

| Item | Reason | Action |
|------|--------|--------|
| BE test suite: does `mvn test` currently pass? | Tests exist but have not been run in this session; `AppProperties` null-field construction may fail at runtime | Run `mvn test` and record results |
| FE `coverage/` directory: when was it generated, against which commit? | Directory exists but there is no timestamp, no `.gitignore` exclusion, and no CI artifact metadata | Run `npm run test:coverage` on current source; verify the report is current |
| `spring-security-test` is in `pom.xml` but not used | Suggests `@WebMvcTest` with `@WithMockUser` was planned; never implemented | Confirm if planned; if not, dependency can remain as it adds no runtime overhead |
| `@faker-js/faker` installed but unused | Planned for FE unit test fixtures | Confirm scope: FE fixtures for Vitest, or E2E data generation, or both |
| `usersData` in `e2e_tests/data/user.data.ts` is empty | Planned E2E fixture for authenticated user tests | Populate with test user structure when OAuth2 mock is set up |
| No `vitest.config.ts` separate file | Configuration is inline in `package.json` scripts only; no `test.environment`, `setupFiles`, `coverage.thresholds` configured | Create `vitest.config.ts` before writing FE tests to set jsdom, setup files, and coverage thresholds |
| HD4 — coverage thresholds | Documented as open decision in `source-availability.md`; no thresholds set | Decide minimum coverage % for BE application layer and FE hooks/components |
| Dockerfile `-DskipTests` is intentional? | May have been added temporarily during early development | Confirm if tests should be run as part of the Docker image build; if not, remove skip |

---

## 12. Source Files Read

| File | Purpose |
|------|---------|
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` | 8 unit tests for GitHub webhook service |
| `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | 7 ArchUnit architecture rules |
| `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/ArtifactNormalizerTest.java` | 6 unit tests for markdown/YAML artifact parser |
| `EDCAP_BE/pom.xml` (lines 1–120) | Test dependency versions, missing plugin configuration |
| `EDCAP_FE/e2e_tests/tests/smoke.spec.ts` | 1 Playwright smoke test |
| `EDCAP_FE/e2e_tests/data/user.data.ts` | E2E user fixture (empty) |
| `EDCAP_FE/e2e_tests/pages/README.md` | Placeholder for Page Object Model |
| `EDCAP_FE/e2e_tests/tests/README.md` | Placeholder |
| `EDCAP_FE/e2e_tests/tsconfig.json` | TypeScript config for E2E tests |
| `EDCAP_FE/playwright.config.ts` | Playwright configuration — webServer, baseURL, timeout |
| `EDCAP_FE/package.json` (scripts + devDependencies) | All test commands and test library versions |
| `EDCAP_FE/vite.config.ts` | Confirmed no Vitest config present |
| `docs/standards/testing.md` | Testing standards and patterns already documented |

Files intentionally NOT read: `.env*`, secrets files, `coverage/coverage-final.json` (production coverage data), logs, PII.

---

## 13. Organization Management Snapshot

This snapshot records the implemented Organization test coverage that was added after the original phase-0 map.

### Confirmed Organization tests

| Test Type | Path | Target Area | Note |
|---|---|---|---|
| BE unit | `EDCAP_BE/src/test/UnitTest/com/sdd/platform/application/usecase/governance/OrganizationServicePhase6Test.java` | `OrganizationService` | Search defaults, create/update/delete, duplicate checks, stale version, and ADMIN-only guard |
| BE integration | `EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/web/rest/OrganizationControllerIntegrationTest.java` | `OrganizationController` | List/detail/create/update/delete JSON contracts, 400/403/404/409 mappings |
| BE migration IT | `EDCAP_BE/src/test/IntegrationTest/com/sdd/platform/infrastructure/persistence/migration/OrganizationMigrationIntegrationTest.java` | Flyway + PostgreSQL | Confirms Organization columns, indexes, version default, and soft-delete reuse |
| FE unit | `EDCAP_FE/src/__tests__/organization/organization-api.test.ts` | `src/lib/api.ts` | Organization endpoint URLs, request bodies, and `ApiError` behavior |
| FE component | `EDCAP_FE/src/__tests__/organization/OrganizationPage.test.tsx` | `OrganizationPage` | List render, search, filter, create, edit, delete, and error toast behavior |
| FE route/auth | `EDCAP_FE/src/__tests__/App.test.tsx` | `App.tsx` | Non-admin redirect/logout and admin route access |
| FE utility | `EDCAP_FE/src/__tests__/lib/utils.test.ts` | `formatDateTime` | Locale-aware date formatting via `src/utils/dayjs` |
| E2E | `EDCAP_FE/e2e_tests/tests/organization/organization.spec.ts` | Full Organization journey | CRUD, duplicate rejection, stale-version conflict, delete, deleted list, non-admin redirect |

### Coverage summary

- The Organization suite now covers the full user journey from list/search/filter through create/update/delete.
- The most important regression guards are duplicate detection, stale version protection, and deleted-row reuse.
- Clean verification logs and Playwright evidence are recorded in `docs/changes/ORGANIZATION/test-results.md`.

### Reuse note

- Keep this appendix as the canonical place to point future Organization-related test additions.
- If a new Organization test is added, update this snapshot before expanding broader test-map sections.

---

## 14. Team Management Snapshot

This snapshot records the implemented Team test coverage that was added after the original phase-0 map.

### Confirmed Team tests

| Test Type | Path | Target Area | Note |
|---|---|---|---|
| BE unit | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/TeamServiceTest.java` | `TeamService` | Search defaults, create/update/delete, duplicate code, duplicate member, multi-Team membership, role validation, and ADMIN-only guard |
| BE integration | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/TeamControllerIntegrationTest.java` | `TeamController` | List/detail/create/update/delete JSON contracts, add/update/remove member flows, and error mappings |
| BE migration IT | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/infrastructure/persistence/migration/TeamMigrationIntegrationTest.java` | Flyway + PostgreSQL | Confirms Team columns, `tbl_team_member`, active-scope uniqueness, and no legacy backfill |
| FE unit | `EDCAP_FE/src/__tests__/team/team-api.test.ts` | `src/lib/api.ts` | Team endpoint URLs, request bodies, and `ApiError` behavior |
| FE component | `EDCAP_FE/src/__tests__/team/TeamPage.test.tsx` | `TeamPage` | List render, search, create, edit, detail, member drawer, delete, and error behavior |
| FE route/auth | `EDCAP_FE/src/__tests__/App.test.tsx` | `App.tsx` | Non-admin redirect/logout and admin route access |
| FE E2E | `EDCAP_FE/e2e_tests/tests/team/team.spec.ts` | Full Team journey | CRUD, duplicate rejection, member add/update/remove, multi-Team membership, and i18n |

### Coverage summary

- The Team suite now covers the full user journey from list/search through create/update/delete and membership management.
- The most important regression guards are duplicate Team Code, duplicate active membership, soft-delete cascade, and multi-Team membership behavior.
- Clean verification logs and Playwright evidence are recorded in `docs/changes/TEAM/test-results.md`.

### Reuse note

- Keep this appendix as the canonical place to point future Team-related test additions.
- If a new Team test is added, update this snapshot before expanding broader test-map sections.
