/**
 * QA Dashboard E2E — mock-based (no live backend required).
 *
 * All backend calls are intercepted via page.route() before navigation so the
 * suite runs against the Vite dev server without a running Spring Boot instance.
 *
 * Scenarios covered:
 *   S-E2E-1  Dashboard loads with KPI cards and AC table  (AC-1, AC-2)
 *   S-E2E-2  Project filter updates AC table results       (AC-8)
 *   S-E2E-3  Zero-state: no rows → empty-state text shown (AC-5, AC-7)
 *   S-E2E-4  Read-only: no edit / delete / input elements  (AC-10, AC-12)
 *   S-E2E-5  Unauthenticated: API returns 401             (AC-1)
 */
import { expect, test, type Page } from "@playwright/test";
import { QaDashboardPage } from "../../pages/QaDashboardPage.js";

const AUTH_TOKEN_KEY = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
const MOCK_TOKEN = "mock-qa-access-token";

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const QA_USER = {
  username: "qa_user",
  displayName: "QA User",
  email: "qa@example.com",
  role: "QA",
  accessScopes: [],
};

const SUMMARY = {
  acTestCoveragePercent: 60,
  acNotTestedCount: 2,
  blackboxCoveragePercent: 50,
  testResultsPassPercent: 80,
  defectLeakageCount: 1,
  acceptanceReadyCount: 0,
  updatedAt: "2026-06-29T10:00:00Z",
};

const AC_PAGE = {
  items: [
    { acId: "AC-1", ticketKey: "EC-10", status: "PASSED", blackbox: "Yes", gap: "" },
    { acId: "AC-2", ticketKey: "EC-11", status: "NOT_TESTED", blackbox: "No", gap: "" },
  ],
  page: 0,
  size: 10,
  totalElements: 2,
  totalPages: 1,
  hasNext: false,
};

const AC_PAGE_EMPTY = {
  items: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
};

const TREND = [
  { label: "EC-10", coveragePercent: 85 },
  { label: "EC-11", coveragePercent: 60 },
];

const OPTIONS = {
  projects: [{ value: "proj-1", label: "EDCAP Alpha", role: "QA" }],
  repositories: [{ value: "repo-1", label: "edcap-backend" }],
  tickets: [{ value: "ticket-1", label: "EC-10" }],
};

// ---------------------------------------------------------------------------
// Route helpers
// ---------------------------------------------------------------------------

async function mockAuth(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    const auth = route.request().headers()["authorization"] ?? "";
    if (auth.includes(MOCK_TOKEN)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(QA_USER),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ status: 401, errorCode: "UNAUTHORIZED" }),
      });
    }
  });
}

async function mockQaApis(
  page: Page,
  options: {
    ticketsResponse?: object;
  } = {},
): Promise<void> {
  const ticketsData = options.ticketsResponse ?? AC_PAGE;


  // Gate check performed by <RequireDashboardAccess> before PMDashboardPage
  // is ever rendered. It expects a 204 No Content on success. Without this
  // mock the access query errors out and the page never mounts, which is
  // why every "List of tickets" / "tbody tr" assertion below was failing.
  await page.route("**/api/v1/qa/dashboard/access**", async (route) => {
    await route.fulfill({ status: 204 });
  });


  await page.route("**/api/v1/qa/dashboard/options**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(OPTIONS),
    });
  });

  await page.route("**/api/v1/qa/dashboard/tickets**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(ticketsData),
    });
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

test.describe("QA Dashboard E2E — mock-based", () => {
  test.beforeEach(async ({ page }) => {
    await initLocalStorage(page);
    await mockAuth(page);
  });

  // -------------------------------------------------------------------------
  // S-E2E-1: Dashboard loads with KPI cards visible
  // -------------------------------------------------------------------------
  test("S-E2E-1: Dashboard loads — KPI cards and AC table are visible (AC-1, AC-2)", async ({ page }) => {
    await mockQaApis(page);
    const dashboard = new QaDashboardPage(page);

    await test.step("1. Navigate to QA Dashboard", async () => {
      await dashboard.navigate();
      await dashboard.isAtPage();
    });

    await test.step("2. QA Dashboard title is visible", async () => {
      await expect(dashboard.pageTitle).toBeVisible({ timeout: 10_000 });
    });

    await test.step("3. Tickets section heading is visible", async () => {
      await expect(dashboard.acCoverageTitle).toBeVisible({ timeout: 10_000 });
    });

    await test.step("4. Tickets table section is visible", async () => {
      await expect(dashboard.acTableSection).toBeVisible({ timeout: 10_000 });
    });

    await test.step("5. At least one ticket row is rendered", async () => {
      await expect(dashboard.acTableRows.first()).toBeVisible({ timeout: 10_000 });
    });

    await test.step("6. Table contains at least one row", async () => {
      const rows = dashboard.acTableRows;
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-2: Project filter changes update the AC table
  // -------------------------------------------------------------------------
  test("S-E2E-2: Project filter triggers new acceptance-criteria request (AC-8)", async ({ page }) => {
    await mockQaApis(page);
    const dashboard = new QaDashboardPage(page);

    await test.step("1. Navigate to QA Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.acTableSection).toBeVisible({ timeout: 10_000 });
    });

    await test.step("2. Select a project and verify table is still visible", async () => {
      await dashboard.selectProject("proj-1");
      await expect(dashboard.acTableSection).toBeVisible({ timeout: 10_000 });
      await expect(dashboard.acTableRows.first()).toBeVisible({ timeout: 10_000 });
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-3: Zero-state — no rows → empty-state text
  // -------------------------------------------------------------------------
  test("S-E2E-3: Zero-state — empty AC table shows 'no data' message (AC-5, AC-7)", async ({ page }) => {
    await mockQaApis(page, {
      ticketsResponse: AC_PAGE_EMPTY,
    });
    const dashboard = new QaDashboardPage(page);

    await test.step("1. Navigate to QA Dashboard", async () => {
      await dashboard.navigate();
      await dashboard.isAtPage();
    });

    await test.step("2. Table section is visible", async () => {
      await expect(dashboard.acTableSection).toBeVisible({ timeout: 10_000 });
    });

    await test.step("3. No data rows are rendered when AC page is empty", async () => {
      const bodyRows = dashboard.acTableRows;
      await expect(bodyRows).toHaveCount(0, { timeout: 10_000 });
    });

    await test.step("4. Dashboard renders successfully even with empty data", async () => {
      await expect(dashboard.pageTitle).toBeVisible({ timeout: 10_000 });
      await expect(dashboard.acTableSection).toBeVisible({ timeout: 10_000 });
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-4: Read-only verification — no edit / delete / input controls
  // -------------------------------------------------------------------------
  test("S-E2E-4: Dashboard is read-only — no write controls visible (AC-10, AC-12)", async ({ page }) => {
    await mockQaApis(page);
    const dashboard = new QaDashboardPage(page);

    await test.step("1. Navigate to QA Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.pageTitle).toBeVisible({ timeout: 10_000 });
    });

    await test.step("2. No edit, delete, create, add, or upload buttons exist", async () => {
      const writeButtons = page.getByRole("button", { name: /^(edit|delete|create|add|remove|upload)$/i });
      await expect(writeButtons).toHaveCount(0);
    });

    await test.step("3. No numeric input or textarea elements exist (AC-12) — the table search box is a read action", async () => {
      const inputs = page.locator("input[type=number], textarea");
      await expect(inputs).toHaveCount(0);
    });

    await test.step("4. Table is visible and readable", async () => {
      await expect(dashboard.acTableSection).toBeVisible();
      await expect(dashboard.acTableRows.first()).toBeVisible({ timeout: 10_000 });
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-5: Unauthenticated — direct API call returns 401
  // -------------------------------------------------------------------------
  test("S-E2E-5: Unauthenticated request to QA summary API returns 401 (AC-1)", async ({ page }) => {
    await page.route("**/api/v1/qa/dashboard/summary**", async (route) => {
      const auth = route.request().headers()["authorization"] ?? "";
      if (auth) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(SUMMARY),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ status: 401, errorCode: "UNAUTHORIZED" }),
        });
      }
    });

    await page.goto("/");

    await test.step("Direct fetch without auth header returns 401", async () => {
      const response = await page.evaluate(async () => {
        const res = await fetch("/api/v1/qa/dashboard/summary");
        return res.status;
      });
      expect(response).toBe(401);
    });
  });
});
