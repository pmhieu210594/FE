# Testing Standards

## Backend (JUnit 5 / Mockito / ArchUnit)

### Unit Tests

Unit tests mock **port interfaces**, never domain objects or value types.

```java
class TicketServiceTest {
    private TicketRepositoryPort ticketRepo;
    private ProjectRepositoryPort projectRepo;
    private TicketService service;

    @BeforeEach
    void setUp() {
        ticketRepo  = Mockito.mock(TicketRepositoryPort.class);
        projectRepo = Mockito.mock(ProjectRepositoryPort.class);
        service     = new TicketService(ticketRepo, projectRepo);
    }

    @Test
    void createTicket_throwsNotFound_whenProjectMissing() {
        when(projectRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class,
            () -> service.createTicket(new CreateTicketCommand(99L, "T-1", TicketType.TASK)));
    }

    @Test
    void createTicket_persistsWithOpenStatus() {
        var project = Project.builder().id(1L).build();
        when(projectRepo.findById(1L)).thenReturn(Optional.of(project));
        when(ticketRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = service.createTicket(new CreateTicketCommand(1L, "T-1", TicketType.TASK));

        assertThat(result.getStatus()).isEqualTo(Ticket.Status.OPEN);
        verify(ticketRepo).save(argThat(t -> "T-1".equals(t.getTicketKey())));
    }
}
```

### Rules

- Mock port interfaces (output ports) — the boundary between layers
- Never mock domain objects — instantiate them with real data
- Never mock static utilities or value classes
- One test class per production class minimum; name: `{Subject}Test`
- Arrange–Act–Assert structure; one assertion focus per test

### Web Layer Tests (`@WebMvcTest`)

```java
@WebMvcTest(TicketController.class)
class TicketControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean  TicketService ticketService;

    @Test
    @WithMockUser
    void getById_returns404_forUnknownId() throws Exception {
        when(ticketService.findById(999L)).thenThrow(new NotFoundException("not found"));
        mockMvc.perform(get("/api/v1/tickets/999"))
               .andExpect(status().isNotFound())
               .andExpect(jsonPath("$.errorCode").value("NOT_FOUND"));
    }
}
```

### Architecture Enforcement (ArchUnit)

`ArchitectureTest.java` enforces hexagonal layer rules. **It must stay green.**

```java
@AnalyzeClasses(packages = "com.sdd.platform")
public class ArchitectureTest {
    @ArchTest
    static final ArchRule domainHasNoDependencies =
        noClasses().that().resideInAPackage("..domain..")
                   .should().dependOnClassesThat().resideInAnyPackage("..application..", "..infrastructure..", "..web..");

    @ArchTest
    static final ArchRule webDoesNotAccessInfrastructure =
        noClasses().that().resideInAPackage("..web..")
                   .should().dependOnClassesThat().resideInAPackage("..infrastructure..");
}
```

Do not add `allowedPackage` exceptions without explicit team review.

### Collector / Webhook Regression Pattern

- For backend metadata collector tickets, keep a focused Maven slice for the collector service, webhook regression, and controller API before broader suite validation.
- Black-box checklist items should be reflected in `docs/changes/<TICKET>/blackbox-review-checklist.md` and marked pass only after the matching BB scenarios are verified.
- When provider values drift from the spec-approved enum set, add a unit test for normalization plus a migration test for the enum value update.

---

## AC Closure / Release Gating (Confirmed — ADMIN-AUDIT-LOG 2026-07-10)

- **UI-mount verification**: an AC that requires a visible UI element (e.g. summary cards, a filter bar) is not "Implemented" until the component is verified mounted on the page it was built for. A component that only passes in isolated unit tests but is never composed into the actual page does not satisfy the AC. Verify via a page-level render/composition test or a manual browser walkthrough, not the component's own unit test alone.
- **DB-dependent AC tracking**: ACs that depend on DB-level enforcement (triggers, FKs, immutability constraints) and cannot be executed because no live DB harness is available must be explicitly tracked as "reviewed, not executed" in every phase's report — not left implicit until the final report.
- **PASS scope must state what it covers**: when a ticket has both an automated-suite round and a separate black-box case list, a "PASS" on the automated suite is not the same gate as black-box case completion. State which round a PASS covers; do not let an unscoped PASS imply the other round is also done (see `FMI-DEV-DASH-002`, `failure-mode-index.md`).

---

## Frontend (Vitest / Playwright)

> **Current state:** Testing infrastructure is installed but no test files exist yet.
> All new `src/` code should include a test file. Track gaps in
> [`docs/maintenance/phase0/source-availability.md`](../maintenance/phase0/source-availability.md).

### Unit / Component Tests (Vitest)

Always provide a `QueryClientProvider` wrapper for hooks that use TanStack Query:

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { vi } from "vitest";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe("useAuth", () => {
  it("returns null user on 401", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### i18n Testing

Provide a mocked `i18next` provider so `t()` calls do not throw in tests:

```typescript
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";

i18n.init({ lng: "en", resources: { en: { locale: {} } } });

const i18nWrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

// Use i18nWrapper when rendering components that call t()
render(<MyComponent />, { wrapper: i18nWrapper });
```

### File Naming and Location

- Unit/component tests: `src/<module>/__tests__/<Subject>.test.ts(x)` or `<subject>.test.ts` alongside the source
- E2E tests: `e2e_tests/<feature>.spec.ts`
- Test utilities / fixtures: `src/test-utils/`

### E2E Tests (Playwright)

```typescript
// e2e_tests/auth.spec.ts
import { test, expect } from "@playwright/test";

test("redirects to OAuth when unauthenticated", async ({ page }) => {
  await page.goto("/en/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
```

### Mocking Strategy

| Scenario | Approach |
|----------|----------|
| API calls | `vi.spyOn(global, "fetch")` or MSW (Mock Service Worker) |
| TanStack Query | Provide a fresh `QueryClient` in wrapper |
| Router | Wrap with `MemoryRouter` or `createMemoryRouter` |
| Zustand stores | Reset store state in `beforeEach` |
| Redux stores | Provide a test store with `configureStore` |
| i18n | Provide a minimal `I18nextProvider` with empty resource bundle |

---

## Coverage Gap (Candidate — pending HD4)

> **HD4:** What are the coverage targets? Unit test %? E2E coverage per journey?

No test files exist in `EDCAP_FE/src/` or `EDCAP_FE/e2e_tests/` as of Phase 0-B.
Coverage thresholds are not yet configured in `vitest.config.ts` or `pom.xml` (JaCoCo).

- **[Candidate]** Unit test coverage: ≥ 80% line coverage on `application/` package (BE) and `src/hooks/` (FE)
- **[Candidate]** E2E coverage: at least 1 test per critical user journey (auth, project create, sync trigger)
- **[Candidate]** JaCoCo configured in `pom.xml`; Vitest `coverage` reporter in `vitest.config.ts`
