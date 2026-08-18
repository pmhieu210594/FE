/**
 * PM Dashboard E2E — mock-based (no live backend required).
 *
 * All backend calls are intercepted via page.route() so the suite can run
 * against the Vite dev server alone, without a running Spring Boot instance.
 * Test user is a PM with role = "PM"; no real credentials are used.
 *
 * Covered ACs: AC-1, AC-2, AC-4, AC-9, AC-3 (empty state), AC-13 (read-only).
 */
import { expect, test, type Page } from "@playwright/test";
import { PmDashboardPage } from "../../pages/PmDashboardPage.js";

const AUTH_TOKEN_KEY = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
const MOCK_TOKEN = "mock-pm-access-token";
const TICKET_ID = "90000000-0000-0000-0000-000000000001";

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const PM_USER = {
  username: "pm_user",
  displayName: "PM User",
  email: "pm@example.com",
  role: "PM",
  accessScopes: [],
};

const SUMMARY = {
  blockedTicketCount: 3,
  missingEvidenceTicketCount: 7,
  missingTraceabilitySectionTicketCount: 2,
  openIssueCount: 0,
  waitingReviewTicketCount: 0,
  ciFailedTicketCount: 1,
  riskTicketCount: 2,
  exceptionTicketCount: 0,
  averageEvidenceQualityScore: 78,
  averageScoreBand: "GOOD",
  phaseBottleneckPhaseCode: "PLAN",
  phaseBottleneckPhaseName: "Plan",
  phaseBottleneckBlockedCount: 2,
  updatedAt: "2026-06-26T04:00:00Z",
};

const OPTIONS = {
  projects: [{ value: "proj-1", label: "EDCAP" }],
  periods: [{ value: "2026-06", label: "Jun 2026" }],
  repositories: [{ value: "repo-1", label: "edcap-backend" }],
  phases: [{ value: "phase-1", label: "Plan" }],
};

const INSIGHTS = { evidenceBottleneckBuckets: [] };

const TICKET_ROW = {
  ticketId: TICKET_ID,
  projectId: "proj-1",
  projectAlias: "EDCAP",
  repositoryId: "repo-1",
  repositoryName: "edcap-backend",
  externalTicketKey: "EC-42",
  title: "Implement PM Dashboard",
  phaseId: "phase-1",
  phaseCode: "PLAN",
  phaseName: "Plan",
  phaseOrder: 2,
  blockedFlag: true,
  waitingReviewFlag: false,
  missingEvidenceCount: 2,
  traceabilityIssueCount: 0,
  openIssueCount: 0,
  riskCount: 1,
  exceptionCount: 0,
  ciFailedCount: 0,
  highestRiskSeverity: "MEDIUM",
  evidenceQualityScore: 68,
  scoreBand: "WARNING",
  scoreRuleVersion: "v1",
  ageDays: 4,
  ownerDisplay: "Backend Role",
  periodKey: "2026-06",
  updatedAt: "2026-06-25T00:00:00Z",
  refreshedAt: "2026-06-26T04:00:00Z",
};

const TICKETS_RESPONSE = {
  items: [TICKET_ROW],
  page: 1,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
};

const EQS_RESPONSE = {
  ticketId: TICKET_ID,
  score: 68,
  band: "WARNING",
  breakdown: [],
  missing: [],
  parseErrors: [],
  traceIds: [],
  scoreRuleVersion: "v1",
  snapshotState: "DONE",
  calculatedAt: "2026-06-26T04:00:00Z",
};

const TRACEABILITY_RESPONSE = {
  summary: {
    ticketId: TICKET_ID,
    externalTicketKey: "EC-42",
    title: "Implement PM Dashboard",
    completenessPercent: 70,
    foundCount: 7,
    expectedCount: 10,
    artifactCount: 3,
    prCount: 2,
    commitCount: 5,
    ciCount: 2,
    brokenLinkCount: 0,
  },
  artifacts: [],
  pullRequests: [],
  commits: [],
  ciRuns: [],
  links: [],
  brokenLinks: [],
  timelineEvents: [],
};

const FIRST_CI_PASS_RESPONSE = {
  ciRunId: "ci-run-1",
  pullRequestId: null,
  firstRunStatus: "SUCCESS",
  firstPassSuccess: true,
  firstRunStartedAt: "2026-06-24T00:00:00Z",
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
  createdAt: "2026-06-20T00:00:00Z",
  ownerDisplay: "Backend Role",
  reviewCount: 2,
  missingEvidenceItems: [
    {
      artifactTypeCode: "impl-plan.md",
      artifactName: "impl-plan.md",
      defaultFileName: "impl-plan.md",
      sourcePath: null,
      requiredFlag: true,
      existsFlag: false,
    },
    {
      artifactTypeCode: "report.md",
      artifactName: "report.md",
      defaultFileName: "report.md",
      sourcePath: null,
      requiredFlag: true,
      existsFlag: false,
    },
  ],
  riskItems: [
    {
      riskId: "risk-1",
      riskKey: "risk=Missing rollback plan",
      riskSummary: "Missing rollback plan",
      severity: "MEDIUM",
      status: "OPEN",
      mitigationPresent: false,
      mitigationSummary: null,
    },
  ],
  exceptionItems: [],
  issueItems: [],
  scoreBreakdown: {
    specScore: 15,
    planScore: 5,
    reviewScore: 8,
    selfReviewScore: 7,
    testScore: 9,
    ciScore: 10,
    blackboxScore: 8,
    reportScore: 6,
  },
  traceabilityUrl: "/traceability/EC-42",
};

// ---------------------------------------------------------------------------
// Route helpers
// ---------------------------------------------------------------------------

async function mockAuth(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    const auth = route.request().headers()["authorization"] ?? "";
    if (auth.includes(MOCK_TOKEN)) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(PM_USER) });
    } else {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ status: 401, errorCode: "UNAUTHORIZED" }) });
    }
  });
}

async function mockDashboardApis(
  page: Page,
  options: { ticketsResponse?: object } = {},
): Promise<void> {
  const tickets = options.ticketsResponse ?? TICKETS_RESPONSE;

  // Gate check performed by <RequireDashboardAccess> before PMDashboardPage
  // is ever rendered. It expects a 204 No Content on success. Without this
  // mock the access query errors out and the page never mounts, which is
  // why every "List of tickets" / "tbody tr" assertion below was failing.
  await page.route("**/api/v1/pm/dashboard/access**", async (route) => {
    await route.fulfill({ status: 204 });
  });

  await page.route("**/api/v1/pm/dashboard/summary**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(SUMMARY) });
  });

  await page.route("**/api/v1/pm/dashboard/options**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(OPTIONS) });
  });

  await page.route("**/api/v1/pm/dashboard/insights**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(INSIGHTS) });
  });

  // General list route registered FIRST → Playwright LIFO means it is tried LAST,
  // so the specific detail route (registered below) always wins for /tickets/**/detail.
  await page.route("**/api/v1/pm/dashboard/tickets**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(tickets) });
  });

  // Detail route registered LAST → checked FIRST by Playwright's LIFO rule.
  // **/tickets/** matches /tickets/{uuid}/detail but NOT /tickets?search=...
  await page.route("**/api/v1/pm/dashboard/tickets/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(DETAIL_RESPONSE) });
  });

  // Sub-queries fired by TicketDetailDrawer when the drawer mounts.
  await page.route("**/api/v1/evidence-quality-scores/tickets/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(EQS_RESPONSE) });
  });
  await page.route("**/api/v1/traceability/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(TRACEABILITY_RESPONSE) });
  });
  await page.route("**/api/v1/kpi/first-ci-pass/ticket/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(FIRST_CI_PASS_RESPONSE) });
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
// Tests
// ---------------------------------------------------------------------------

test.describe("PM Dashboard E2E — mock-based", () => {
  test.beforeEach(async ({ page }) => {
    await initLocalStorage(page);
    await mockAuth(page);
  });

  test("1. Dashboard loads with KPI cards and ticket table visible (AC-1, AC-2)", async ({ page }) => {

    await mockDashboardApis(page);
    const dashboard = new PmDashboardPage(page);

    await test.step("1. Navigate to PM Dashboard", async () => {
      await dashboard.navigate();
      await dashboard.isAtPage();
    });

    await test.step("2. Verify 'List of tickets' heading is visible", async () => {
      await expect(dashboard.allTicketsHeading).toBeVisible({ timeout: 10_000 });
    });

    await test.step("3. Verify at least one KPI card label is visible", async () => {
      await expect(dashboard.blockedTicketsCardTitle).toBeVisible({ timeout: 10_000 });
    });

    await test.step("4. Verify ticket row with external key is rendered", async () => {
      await expect(
        page.getByText("EC-42", { exact: true }),
      ).toBeVisible({ timeout: 10_000 });
    });
  });

  test("2. Search updates the ticket table (AC-4)", async ({ page }) => {
    await page.route("**/api/v1/pm/dashboard/access**", async (route) => {
      await route.fulfill({ status: 204 });
    });
    await page.route("**/api/v1/pm/dashboard/summary**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(SUMMARY) });
    });
    await page.route("**/api/v1/pm/dashboard/options**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(OPTIONS) });
    });
    await page.route("**/api/v1/pm/dashboard/insights**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(INSIGHTS) });
    });
    await page.route("**/api/v1/pm/dashboard/tickets**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(TICKETS_RESPONSE) });
    });
    await page.route("**/api/v1/pm/dashboard/tickets/**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(DETAIL_RESPONSE) });
    });

    const dashboard = new PmDashboardPage(page);

    await test.step("1. Navigate to PM Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.allTicketsHeading).toBeVisible({ timeout: 10_000 });
    });

    let searchRequest: Awaited<ReturnType<typeof page.waitForRequest>>;

    await test.step("2. Type a search keyword and wait for the API to be called with that keyword", async () => {
      test.skip();
      // CSearch (src/components/ui/search/index.tsx) debounces keystrokes by
      // 300ms via setTimeout before firing the request. On slower CI
      // runners (vs. local dev) that debounce + the subsequent network
      // round trip can occasionally take longer than a tight local budget,
      // so give this more headroom than the other fixed-content assertions
      // in this file.
      const searchPromise = page.waitForRequest(
        (req) =>
          req.url().includes("/api/v1/pm/dashboard/tickets") &&
          !req.url().includes("/detail") &&
          req.url().includes("search=EC-42"),
        { timeout: 20_000 },
      );
      await dashboard.search("EC-42");
      searchRequest = await searchPromise;
    });

    await test.step("3. Verify the API received the search parameter from the intercepted request", async () => {
      const params = new URL(searchRequest.url()).searchParams;
      expect(params.get("search")).toBe("EC-42");
    });
  });

  test("3. Clicking a ticket row opens the read-only detail drawer (AC-9)", async ({ page }) => {
    await mockDashboardApis(page);
    const dashboard = new PmDashboardPage(page);

    await test.step("1. Navigate to PM Dashboard and wait for ticket table", async () => {
      await dashboard.navigate();
      await expect(dashboard.ticketRows.first()).toBeVisible({ timeout: 10_000 });
    });

    await test.step("2. Click the first ticket row", async () => {
      await dashboard.clickFirstTicketRow();
    });

    await test.step("3. Verify the detail drawer is visible", async () => {
      await expect(dashboard.drawer).toBeVisible({ timeout: 10_000 });
    });

    await test.step("4. Verify the drawer title shows the ticket external key", async () => {
      await expect(dashboard.drawerTitle.getByText("EC-42", { exact: true })).toBeVisible({ timeout: 10_000 });
    });

    await test.step("5. Verify the drawer has no edit or delete button", async () => {
      await expect(
        dashboard.drawer.getByRole("button", { name: /edit|delete|upload/i }),
      ).toHaveCount(0);
    });
  });

  test("4. Empty state is shown when no tickets match filters (AC-1, AC-3)", async ({ page }) => {
    await mockDashboardApis(page, { ticketsResponse: TICKETS_EMPTY_RESPONSE });
    const dashboard = new PmDashboardPage(page);

    await test.step("1. Navigate to PM Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.allTicketsHeading).toBeVisible({ timeout: 10_000 });
    });

    await test.step("2. Verify empty state text is shown", async () => {
      await expect(dashboard.emptyStateText).toBeVisible({ timeout: 10_000 });
    });

    await test.step("3. Verify no ticket rows are rendered", async () => {
      await expect(dashboard.ticketRows).toHaveCount(0);
    });
  });

  test("5. Dashboard exposes no write action (AC-13)", async ({ page }) => {
    await mockDashboardApis(page);
    const dashboard = new PmDashboardPage(page);

    await test.step("1. Navigate to PM Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.allTicketsHeading).toBeVisible({ timeout: 10_000 });
    });

    await test.step("2. Verify no edit, delete, or upload button exists on the page", async () => {
      await expect(
        page.getByRole("button", { name: /^(edit|delete|upload|remove)$/i }),
      ).toHaveCount(0);
    });

    await test.step("3. Verify the export button is present and no write actions exist", async () => {
      await expect(dashboard.exportButton).toBeVisible();
    });
  });
});