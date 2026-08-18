/**
 * Security Dashboard E2E - mock-based (no live backend required).
 *
 * The suite follows the same mock-first pattern as the existing dashboard
 * Playwright tests in this repo. It verifies:
 *   S-E2E-1  Dashboard loads with summary cards and default filters
 *   S-E2E-2  Project filter syncs the repository and refreshes ticket requests
 *   S-E2E-3  Ticket detail drawer opens and stays read-only
 *   S-E2E-4  No write controls are exposed
 */
import { expect, test, type Page } from "@playwright/test";
import { SecurityDashboardPage } from "../../pages/SecurityDashboardPage.js";

const AUTH_TOKEN_KEY = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
const AUTH_REFRESH_TOKEN_KEY = "15c665b7-592f-4b60-b31f-a252579a3bd0";
const MOCK_ACCESS_TOKEN = "mock-security-access-token";

const SECURITY_USER = {
  username: "security_user",
  displayName: "Security Reviewer",
  email: "security@example.com",
  role: "SECURITY",
  accessScopes: [],
};

// SecurityDashboardPage reads its filter options from
// `endpoints.securityDashboard.options()`, i.e. GET
// /api/v1/security/dashboard/options — NOT the generic /api/v1/projects or
// /api/v1/repositories endpoints (those back the admin Project page). The
// shape it expects is `{ projects: {value,label,role}[], repositories:
// {value,label}[] }`, keyed/refetched by the selected projectId.
//
// `role: "SECURITY"` on the project options is required: SecurityDashboardPage
// auto-selects the first project whose normalized role matches "SECURITY"
// (see `allowedProject` in SecurityDashboardPage.tsx). Without it neither
// projectId nor repositoryId ever populate.
const SECURITY_OPTIONS_BY_PROJECT: Record<
  string,
  { projects: { value: string; label: string; role: string }[]; repositories: { value: string; label: string }[] }
> = {
  "": {
    projects: [
      { value: "proj-1", label: "EDCAP Alpha", role: "SECURITY" },
      { value: "proj-2", label: "EDCAP Beta", role: "SECURITY" },
    ],
    repositories: [{ value: "repo-1", label: "edcap-alpha-api" }],
  },
  "proj-1": {
    projects: [
      { value: "proj-1", label: "EDCAP Alpha", role: "SECURITY" },
      { value: "proj-2", label: "EDCAP Beta", role: "SECURITY" },
    ],
    repositories: [{ value: "repo-1", label: "edcap-alpha-api" }],
  },
  "proj-2": {
    projects: [
      { value: "proj-1", label: "EDCAP Alpha", role: "SECURITY" },
      { value: "proj-2", label: "EDCAP Beta", role: "SECURITY" },
    ],
    repositories: [{ value: "repo-2", label: "edcap-beta-api" }],
  },
};

const SUMMARY_RESPONSE = {
  safetyPack: { readyCount: 1, warningCount: 1, missingCount: 0 },
  secretScan: { passCount: 2, failCount: 1 },
  sastSca: { passCount: 1, warningCount: 1, failCount: 1 },
  exception: { openCount: 1, totalCount: 1 },
  updatedAt: "2026-07-03T00:00:00Z",
};

const TICKET_ROW = {
  ticketId: "ticket-1",
  ticketKey: "SEC-001",
  projectAlias: "EDCAP Alpha",
  repositoryName: "edcap-alpha-api",
  safetyStatus: "READY",
  secretScanStatus: "PASS",
  sastStatus: "WARNING",
  scaStatus: "FAIL",
  exceptionStatus: "OPEN",
  finalVerdict: "NOT_CONFIGURED",
};

const TICKETS_RESPONSE = {
  items: [TICKET_ROW],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
};

const TICKET_DETAIL_RESPONSE = {
  ticketId: "ticket-1",
  ticketKey: "SEC-001",
  projectAlias: "EDCAP Alpha",
  repositoryName: "edcap-alpha-api",
  safetyStatus: "READY",
  scans: [
    {
      scannerType: "SECRET",
      scanStatus: "PASS",
      severity: "LOW",
      findingCount: 3,
      unresolvedCount: 0,
    },
  ],
  checklistSections: [
    {
      sectionType: "README",
      presentFlag: true,
      validFlag: true,
    },
  ],
  exceptions: [
    {
      exceptionType: "Temporary waiver",
      approved: true,
      followUpStatus: "OPEN",
      expiryDate: "2026-12-31",
    },
  ],
  finalVerdict: "NOT_CONFIGURED",
};

async function initLocalStorage(page: Page): Promise<void> {
  await page.addInitScript(
    ({ tokenKey, refreshKey, token }) => {
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(refreshKey, "mock-security-refresh-token");
      localStorage.setItem("i18nextLng", "en");
    },
    {
      tokenKey: AUTH_TOKEN_KEY,
      refreshKey: AUTH_REFRESH_TOKEN_KEY,
      token: MOCK_ACCESS_TOKEN,
    },
  );
}

async function mockAuth(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    const authHeader = route.request().headers().authorization ?? "";
    if (authHeader === `Bearer ${MOCK_ACCESS_TOKEN}`) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SECURITY_USER),
      });
      return;
    }

    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ status: 401, errorCode: "UNAUTHORIZED" }),
    });
  });

  await page.route("**/api/v1/me", async (route) => {
    const authHeader = route.request().headers().authorization ?? "";
    if (authHeader === `Bearer ${MOCK_ACCESS_TOKEN}`) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SECURITY_USER),
      });
      return;
    }

    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ status: 401, errorCode: "UNAUTHORIZED" }),
    });
  });
}

async function mockSecurityDashboardApis(page: Page): Promise<void> {
  // Gate check performed by <RequireDashboardAccess> before
  // SecurityDashboardPage is ever rendered. It expects a 204 No Content on
  // success; without this mock the access query errors out and the page
  // never mounts.
  await page.route("**/api/v1/security/dashboard/access**", async (route) => {
    await route.fulfill({ status: 204 });
  });

  await page.route("**/api/v1/security/dashboard/options**", async (route) => {
    const url = new URL(route.request().url());
    const projectId = url.searchParams.get("projectId") ?? "";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        SECURITY_OPTIONS_BY_PROJECT[projectId] ?? SECURITY_OPTIONS_BY_PROJECT[""],
      ),
    });
  });

  await page.route("**/api/v1/security/dashboard/summary**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SUMMARY_RESPONSE),
    });
  });

  await page.route("**/api/v1/security/dashboard/tickets**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(TICKETS_RESPONSE),
    });
  });

  await page.route(/.*\/api\/v1\/security\/dashboard\/tickets\/[^/?#]+$/, async (route) => {
    const pathParts = new URL(route.request().url()).pathname.split("/").filter(Boolean);
    const ticketId = pathParts[pathParts.length - 1] ?? "";
    if (ticketId === "ticket-1") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(TICKET_DETAIL_RESPONSE),
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ status: 404, errorCode: "NOT_FOUND" }),
    });
  });
}

test.describe("Security Dashboard E2E - mock-based", () => {
  test.beforeEach(async ({ page }) => {
    await initLocalStorage(page);
    await mockAuth(page);
    await mockSecurityDashboardApis(page);
  });

  test("S-E2E-1: Dashboard loads with default project/repository filters and summary cards (AC-SECURITY-DASHBOARD-1, AC-SECURITY-DASHBOARD-2..6, AC-SECURITY-DASHBOARD-7)", async ({
    page,
  }) => {
    const dashboard = new SecurityDashboardPage(page);

    const defaultTicketsRequest = page.waitForRequest(
      (request) =>
        request.url().includes("/api/v1/security/dashboard/tickets") &&
        request.url().includes("projectId=proj-1") &&
        request.url().includes("repositoryId=repo-1"),
      { timeout: 15_000 },
    );

    await dashboard.navigate();
    await defaultTicketsRequest;
    await dashboard.isAtPage();

    await expect(dashboard.pageTitle).toBeVisible({ timeout: 15_000 });
    await expect(dashboard.summaryCardTitles.first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(dashboard.ticketTableTitle).toBeVisible({ timeout: 15_000 });
    await expect(dashboard.projectSelect).toHaveValue("proj-1");
    await expect(dashboard.repositorySelect).toHaveValue("repo-1");
    await expect(dashboard.exportButton).toBeVisible();
  });

  test("S-E2E-2: Changing project syncs repository and refreshes the dashboard query (AC-SECURITY-DASHBOARD-7)", async ({
    page,
  }) => {
    const dashboard = new SecurityDashboardPage(page);
    await dashboard.navigate();
    await expect(dashboard.projectSelect).toHaveValue("proj-1");

    const filteredTicketsRequest = page.waitForRequest(
      (request) =>
        request.url().includes("/api/v1/security/dashboard/tickets") &&
        request.url().includes("projectId=proj-2") &&
        request.url().includes("repositoryId=repo-2"),
      { timeout: 15_000 },
    );

    await dashboard.selectProject("proj-2");
    await filteredTicketsRequest;

    await expect(dashboard.projectSelect).toHaveValue("proj-2");
    await expect(dashboard.repositorySelect).toHaveValue("repo-2");
  });

  test("S-E2E-3: Opening a ticket shows the read-only detail drawer (AC-SECURITY-DASHBOARD-8)", async ({
    page,
  }) => {
    const dashboard = new SecurityDashboardPage(page);
    await dashboard.navigate();

    await expect(dashboard.openDetailButtons.first()).toBeVisible({
      timeout: 15_000,
    });
    await dashboard.openFirstTicketDetail();

    await expect(dashboard.drawerTitle).toContainText("SEC-001", {
      timeout: 15_000,
    });
    await expect(dashboard.drawer.getByText("Security Scans")).toBeVisible();
    await expect(dashboard.drawer.getByText("Security Checklist")).toBeVisible();
    await expect(dashboard.drawer.getByText("Security Exceptions")).toBeVisible();
    await expect(dashboard.drawer.getByText("SECRET")).toBeVisible();
  });

  test("S-E2E-4: Dashboard does not expose write controls (AC-SECURITY-DASHBOARD-10)", async ({
    page,
  }) => {
    const dashboard = new SecurityDashboardPage(page);
    await dashboard.navigate();

    await expect(
      page.getByRole("button", {
        name: /^(edit|delete|create|add|remove|upload)$/i,
      }),
    ).toHaveCount(0);
    await expect(dashboard.exportButton).toBeVisible();
  });
});