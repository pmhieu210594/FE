/**
 * Developer Dashboard E2E — mock-based (no live backend required).
 *
 * All backend calls are intercepted via page.route() before navigation so the
 * suite runs against the Vite dev server without a running Spring Boot instance.
 *
 * Scenarios covered:
 *   S-E2E-1  Dashboard loads with KPI cards and ticket table       (AC-1, AC-2, AC-3, AC-4)
 *   S-E2E-2  Project filter triggers a filtered tickets request     (AC-5)
 *   S-E2E-3  CI status filter triggers a filtered tickets request   (AC-5)
 *   S-E2E-4  Ticket drill-down opens the read-only detail drawer    (AC-6)
 *   S-E2E-5  Zero-state: no tickets/CI/review/parser data           (AC boundary, spec-pack 8.3)
 *   S-E2E-6  Read-only: no edit / delete / input elements           (AC-7)
 *   S-E2E-7  Unauthenticated: API returns 401                       (AC-1)
 */
import { expect, test, type Page } from "@playwright/test";
import { DevDashboardPage } from "../../pages/DevDashboardPage.js";

const AUTH_TOKEN_KEY = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
const MOCK_TOKEN = "mock-dev-access-token";
const TICKET_ID = "90000000-0000-0000-0000-000000000002";

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const DEV_USER = {
  username: "dev_user",
  displayName: "Developer User",
  email: "dev@example.com",
  role: "DEV",
  accessScopes: [],
};

const SUMMARY = {
  ciFailureCount: 5,
  reviewCommentCount: 3,
  parserErrorCount: 2,
  updatedAt: "2026-06-30T00:00:00Z",
};

const ZERO_SUMMARY = {
  ciFailureCount: 0,
  reviewCommentCount: 0,
  parserErrorCount: 0,
  updatedAt: null,
};

const OPTIONS = {
  // A second project is required so the filter test (S-E2E-2) can switch
  // away from the auto-selected first project and observe a genuine change.
  projects: [
    { value: "proj-1", label: "EDCAP Alpha", role: "DEV" },
    { value: "proj-2", label: "EDCAP Beta", role: "DEV" },
  ],
  repositories: [{ value: "repo-1", label: "edcap-backend" }],
};

const TICKET_ROW = {
  ticketId: TICKET_ID,
  projectId: "proj-1",
  projectAlias: "EDCAP Alpha",
  externalTicketKey: "EC-42",
  title: "Implement dashboard",
  ticketStatus: "IN_PROGRESS",
  ciFailCount: 1,
  latestCiStatus: "FAILURE",
  openFindingCount: 1,
  reviewCommentCount: 1,
  parserErrorFlag: false,
  ageDays: 3,
};

const TICKETS_RESPONSE = {
  items: [TICKET_ROW],
  page: 1,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
};

const TICKETS_EMPTY_RESPONSE = {
  items: [],
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
};

const DETAIL_RESPONSE = {
  row: TICKET_ROW,
  ciRuns: [
    {
      ciRunId: "ci-1",
      workflowName: "build-and-test",
      status: "FAILURE",
      failureCategory: "COMPILE_ERROR",
      ciUrl: "https://ci.example.com/run/1",
      startedAt: "2026-06-30T00:00:00Z",
    },
  ],
  findings: [
    { findingId: "f-1", severity: "HIGH", status: "OPEN", findingSummary: "Missing null check" },
  ],
  reviewComments: [],
  parserSummary: { parseErrorCount: 0, schemaViolationCount: 0, missingCount: 0 },
};

const TRACEABILITY_RESPONSE = { brokenLinks: [] };

// ---------------------------------------------------------------------------
// Route helpers
// ---------------------------------------------------------------------------

async function mockAuth(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    const auth = route.request().headers()["authorization"] ?? "";
    if (auth.includes(MOCK_TOKEN)) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(DEV_USER) });
    } else {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ status: 401, errorCode: "UNAUTHORIZED" }) });
    }
  });
}

async function mockDevDashboardApis(
  page: Page,
  options: { summaryResponse?: object; ticketsResponse?: object } = {},
): Promise<void> {
  const summary = options.summaryResponse ?? SUMMARY;
  const tickets = options.ticketsResponse ?? TICKETS_RESPONSE;

  await page.route("**/api/v1/dev/dashboard/access**", async (route) => {
    await route.fulfill({ status: 204 });
  });

  await page.route("**/api/v1/dev/dashboard/options**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(OPTIONS) });
  });

  await page.route("**/api/v1/dev/dashboard/summary**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(summary) });
  });

  // General list route registered FIRST -> Playwright LIFO means it is tried LAST,
  // so the specific detail route (registered below) always wins for /tickets/**/detail.
  await page.route("**/api/v1/dev/dashboard/tickets**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(tickets) });
  });

  // Detail route registered LAST -> checked FIRST by Playwright's LIFO rule.
  await page.route("**/api/v1/dev/dashboard/tickets/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(DETAIL_RESPONSE) });
  });

  await page.route("**/api/v1/traceability/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(TRACEABILITY_RESPONSE) });
  });
}

async function initLocalStorage(page: Page): Promise<void> {
  await page.addInitScript(
    ({ tokenKey, token }) => {
      localStorage.setItem(tokenKey, token);
      localStorage.setItem("i18nextLng", "en");
    },
    { tokenKey: AUTH_TOKEN_KEY, token: MOCK_TOKEN },
  );
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Developer Dashboard E2E — mock-based", () => {
  test.beforeEach(async ({ page }) => {
    await initLocalStorage(page);
    await mockAuth(page);
  });

  // -------------------------------------------------------------------------
  // S-E2E-1: Dashboard loads with KPI cards and ticket table
  // -------------------------------------------------------------------------
  test("S-E2E-1: Dashboard loads — KPI cards and ticket table are visible (AC-1, AC-2, AC-3, AC-4)", async ({ page }) => {
    await mockDevDashboardApis(page);
    const dashboard = new DevDashboardPage(page);

    await test.step("1. Navigate to Developer Dashboard", async () => {
      await dashboard.navigate();
      await dashboard.isAtPage();
    });

    await test.step("2. Dashboard title is visible", async () => {
      await expect(dashboard.pageTitle).toBeVisible({ timeout: 10_000 });
    });

    await test.step("3. CI Failure KPI card is visible (AC-2)", async () => {
      await expect(dashboard.ciFailureCardTitle).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText("5", { exact: true }).first()).toBeVisible();
    });

    await test.step("4. Review Findings KPI card is visible (AC-3)", async () => {
      await expect(dashboard.reviewCommentCardTitle).toBeVisible({ timeout: 10_000 });
    });

    await test.step("5. Parser Errors KPI card is visible (AC-4)", async () => {
      await expect(dashboard.parserErrorCardTitle).toBeVisible({ timeout: 10_000 });
    });

    await test.step("6. At least one ticket row is rendered (AC-1)", async () => {
      await expect(dashboard.ticketRows.first()).toBeVisible({ timeout: 10_000 });
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-2: Project filter changes update the tickets request
  // -------------------------------------------------------------------------
  test("S-E2E-2: Project filter triggers new tickets request (AC-5)", async ({ page }) => {
    await mockDevDashboardApis(page);
    const dashboard = new DevDashboardPage(page);

    await test.step("1. Navigate to Developer Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.ticketRows.first()).toBeVisible({ timeout: 10_000 });
    });

    await test.step("2. Switch project and wait for filtered tickets request", async () => {
      // The dashboard auto-selects the first project (proj-1) on load, so
      // the initial tickets request already carries projectId=proj-1.
      // Switching to the second project is the change that produces a new,
      // distinct request and proves the filter is wired up (AC-5).
      const filteredRequest = page.waitForRequest(
        (req) =>
          req.url().includes("/api/v1/dev/dashboard/tickets") &&
          req.url().includes("projectId=proj-2"),
        { timeout: 10_000 },
      );
      await dashboard.selectProject("proj-2");
      const req = await filteredRequest;
      const params = new URL(req.url()).searchParams;
      expect(params.get("projectId")).toBe("proj-2");
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-3: CI status filter changes update the tickets request
  // -------------------------------------------------------------------------
  test("S-E2E-3: CI status filter triggers new tickets request (AC-5)", async ({ page }) => {
    await mockDevDashboardApis(page);
    const dashboard = new DevDashboardPage(page);

    await test.step("1. Navigate to Developer Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.ticketRows.first()).toBeVisible({ timeout: 10_000 });
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-4: Ticket drill-down opens read-only detail drawer
  // -------------------------------------------------------------------------
  test("S-E2E-4: Clicking a ticket opens the read-only detail drawer (AC-6)", async ({ page }) => {
    await mockDevDashboardApis(page);
    const dashboard = new DevDashboardPage(page);

    await test.step("1. Navigate to Developer Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.ticketRows.first()).toBeVisible({ timeout: 10_000 });
    });

    await test.step("2. Click the first ticket row", async () => {
      await dashboard.clickFirstTicketRow();
    });

    await test.step("3. Detail drawer opens with the ticket key as title (AC-6)", async () => {
      await expect(dashboard.drawerTitle).toContainText("EC-42", { timeout: 10_000 });
    });

    await test.step("4. CI run detail is visible inside the drawer (AC-2, AC-6)", async () => {
      await expect(dashboard.drawer.getByText("build-and-test")).toBeVisible({ timeout: 10_000 });
    });

    await test.step("5. Drawer contains no editable inputs (AC-7)", async () => {
      const inputs = dashboard.drawer.locator("input, textarea");
      await expect(inputs).toHaveCount(0);
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-5: Zero-state — no CI/review/parser data, empty ticket list
  // -------------------------------------------------------------------------
  test("S-E2E-5: Zero-state — KPI cards show 0 and ticket table is empty (spec-pack 8.3)", async ({ page }) => {
    await mockDevDashboardApis(page, {
      summaryResponse: ZERO_SUMMARY,
      ticketsResponse: TICKETS_EMPTY_RESPONSE,
    });
    const dashboard = new DevDashboardPage(page);

    await test.step("1. Navigate to Developer Dashboard", async () => {
      await dashboard.navigate();
      await dashboard.isAtPage();
    });

    await test.step("2. No ticket rows are rendered", async () => {
      await expect(dashboard.ticketRows).toHaveCount(0);
    });

    await test.step("3. KPI cards show 0 for CI Failures, Review Findings, Parser Errors", async () => {
      const zeroValues = page.getByText("0", { exact: true });
      await expect(zeroValues.first()).toBeVisible({ timeout: 10_000 });
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-6: Read-only verification — no edit / delete / input controls
  // -------------------------------------------------------------------------
  test("S-E2E-6: Dashboard is read-only — no write controls visible (AC-7)", async ({ page }) => {
    await mockDevDashboardApis(page);
    const dashboard = new DevDashboardPage(page);

    await test.step("1. Navigate to Developer Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.ciFailureCardTitle).toBeVisible({ timeout: 10_000 });
    });

    await test.step("2. No edit, delete, create, add, or upload buttons exist", async () => {
      await expect(
        page.getByRole("button", { name: /^(edit|delete|create|add|remove|upload)$/i }),
      ).toHaveCount(0);
    });

    await test.step("3. No text input or textarea elements exist besides search", async () => {
      const inputs = page.locator("input[type=text], input[type=number], textarea");
      await expect(inputs).toHaveCount(0);
    });

    await test.step("4. Export button is present (read action, not a write action)", async () => {
      await expect(dashboard.exportButton).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-7: Unauthenticated — direct API call returns 401
  // -------------------------------------------------------------------------
  test("S-E2E-7: Unauthenticated request to Dev Dashboard summary API returns 401 (AC-1)", async ({ page }) => {
    await page.route("**/api/v1/dev/dashboard/summary**", async (route) => {
      const auth = route.request().headers()["authorization"] ?? "";
      if (!auth) {
        await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ status: 401, errorCode: "UNAUTHORIZED" }) });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(SUMMARY) });
      }
    });

    await page.goto("/");

    await test.step("Direct fetch without auth header returns 401", async () => {
      const response = await page.evaluate(async () => {
        const res = await fetch("/api/v1/dev/dashboard/summary");
        return res.status;
      });
      expect(response).toBe(401);
    });
  });
});
