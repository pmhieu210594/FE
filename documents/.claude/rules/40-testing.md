# 40 — Testing Rules

## Backend (JUnit 5 / Mockito / ArchUnit)

- Unit tests mock **port interfaces** (Mockito); never mock domain entities or value types
- Do not mock what you own: domain objects must be instantiated with real data
- `ArchitectureTest` must stay green — it enforces hexagonal layer rules; do not add exceptions
- Minimum: one test class per production class
- Web layer tests use `@WebMvcTest` slice (Spring context partial); not full `@SpringBootTest`
- No production DB in unit tests; integration tests with real DB are tracked separately

## Frontend (Vitest / Playwright)

- Unit/component tests: Vitest + Testing Library (`*.test.ts` alongside source or in `__tests__/`)
- E2E tests: Playwright (`e2e_tests/` directory)
- Tests are currently absent — new code added to `src/` should include a test file
- Track untested modules in `docs/maintenance/phase0/source-availability.md`

→ See [docs/standards/testing.md](../docs/standards/testing.md) for test structure, naming
conventions, and mock patterns.
