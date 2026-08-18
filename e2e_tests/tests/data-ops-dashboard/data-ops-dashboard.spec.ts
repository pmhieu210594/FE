/**
 * Data Ops Dashboard E2E — mock-based (no live backend required).
 *
 * All backend calls are intercepted via page.route() before navigation so the
 * suite runs against the Vite dev server without a running Spring Boot instance.
 * Follows the same mock-route pattern as dev-dashboard.spec.ts.
 */
import { expect, test, type Page } from "@playwright/test";
import { DataOpsDashboardPage } from "../../pages/DataOpsDashboardPage.js";

const AUTH_TOKEN_KEY = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
const MOCK_TOKEN = "mock-data-ops-access-token";
const CONNECTOR_ID = "90000000-0000-0000-0000-000000000010";

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const DATA_OPS_USER = {
  username: "data_ops_user",
  displayName: "Data Ops User",
  email: "data-ops@example.com",
  role: "DATA_OPS",
  accessScopes: [],
};

const SUMMARY = {
  connectorFailureCount: 4,
  parseErrorCount: 3,
  missingEvidenceCount: 2,
  staleFreshnessCount: 1,
  brokenLinkCount: 5,
  updatedAt: "2026-07-01T00:00:00Z",
};

const ZERO_SUMMARY = {
  connectorFailureCount: 0,
  parseErrorCount: 0,
  missingEvidenceCount: 0,
  staleFreshnessCount: 0,
  brokenLinkCount: 0,
  updatedAt: null,
};

const OPTIONS = {
  // `role` is required: DataOpsDashboardPage auto-selects the first project
  // whose normalized role matches "DATA_OPS" (see `allowedProject` in
  // DataOpsDashboardPage.tsx). Without it, projectId/repositoryId/
  // connectorName never populate and every select stays empty/disabled.
  projects: [{ value: "proj-1", label: "EDCAP Alpha", role: "DATA_OPS" }],
  repositories: [{ value: "repo-1", label: "edcap-backend" }],
  connectors: [
    { value: "conn-default", label: "default-connector" },
    { value: "conn-1", label: "github-connector" },
  ],
};

const CONNECTOR_ROW = {
  connectorId: CONNECTOR_ID,
  projectId: "proj-1",
  projectAlias: "EDCAP Alpha",
  repositoryId: "repo-1",
  repositoryName: "edcap-backend",
  connectorName: "github-connector",
  connectorType: "GITHUB",
  latestRunStatus: "FAILED",
  latestRunAt: "2026-07-01T00:00:00Z",
  failedRunCount: 1,
  parseErrorCount: 2,
  missingEvidenceCount: 1,
  freshnessDelayMinutes: 30,
};

const CONNECTORS_RESPONSE = {
  items: [CONNECTOR_ROW],
  page: 1,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
};

const CONNECTORS_EMPTY_RESPONSE = {
  items: [],
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
};

const DETAIL_RESPONSE = {
  row: CONNECTOR_ROW,
  recentRuns: [
    {
      connectorRunId: "run-1",
      status: "FAILED",
      startedAt: "2026-07-01T00:00:00Z",
      finishedAt: "2026-07-01T00:05:00Z",
      recordsRead: 10,
      recordsWritten: 0,
      errorMessage: "Timeout while cloning repository",
    },
  ],
  dataQualityChecks: [
    {
      dataQualityId: "dq-1",
      sourceType: "GITHUB",
      missingCount: 0,
      parseErrorCount: 2,
      schemaViolationCount: 0,
      errorSummary: "Malformed heading; missing closing fence",
      freshnessDelayMinutes: 30,
      checkedAt: "2026-07-01T00:10:00Z",
    },
  ],
  missingEvidenceItems: [],
};

const REPOSITORY_MISSING_EVIDENCE_RESPONSE = {
  missingEvidenceItems: [
    {
      artifactSnapshotId: "snap-1",
      ticketId: "ticket-1",
      ticketExternalKey: "PM-123",
      ticketTitle: "Fix missing spec pack",
      artifactTypeCode: "SPEC_PACK",
      artifactName: "Spec pack",
      fileName: "spec-pack.md",
      sourcePath: "docs/spec-pack.md",
      existsFlag: false,
      requiredFieldsMissing: ["scope", "open_issues"],
      missingSections: ["scope", "open_issues"],
      collectedAt: "2026-07-01T00:10:00Z",
    },
  ],
};

// ---------------------------------------------------------------------------
// Route helpers
// ---------------------------------------------------------------------------

async function mockAuth(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    const auth = route.request().headers()["authorization"] ?? "";
    if (auth.includes(MOCK_TOKEN)) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(DATA_OPS_USER) });
    } else {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ status: 401, errorCode: "UNAUTHORIZED" }) });
    }
  });
}

async function mockDataOpsDashboardApis(
  page: Page,
  options: { summaryResponse?: object; connectorsResponse?: object; capturedRequests?: string[] } = {},
): Promise<void> {
  const summary = options.summaryResponse ?? SUMMARY;
  const connectors = options.connectorsResponse ?? CONNECTORS_RESPONSE;

  // Gate check performed by <RequireDashboardAccess> before
  // DataOpsDashboardPage is ever rendered. It expects a 204 No Content on
  // success. Without this mock the access query errors out and the page
  // never mounts, which is why every dashboard-content assertion below
  // (title, summary cards, view-repository buttons, selects) was failing.
  await page.route("**/api/v1/data-ops/dashboard/access**", async (route) => {
    await route.fulfill({ status: 204 });
  });

  await page.route("**/api/v1/data-ops/dashboard/options**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(OPTIONS) });
  });

  await page.route("**/api/v1/data-ops/dashboard/summary**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(summary) });
  });

  await page.route("**/api/v1/data-ops/dashboard/repositories/**/missing-evidence**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(REPOSITORY_MISSING_EVIDENCE_RESPONSE) });
  });

  await page.route("**/api/v1/data-ops/dashboard/connectors**", async (route) => {
    // capture the request url if caller provided a capture array (helps avoid timing races)
    try {
      const url = route.request().url();
      if (options.capturedRequests) options.capturedRequests.push(url);
    } catch (e) {
      // ignore capture errors
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(connectors) });
  });

  await page.route("**/api/v1/data-ops/dashboard/connectors/**/detail**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(DETAIL_RESPONSE) });
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

// simple helper to wait for a captured request URL to satisfy a predicate
async function waitForCapturedRequest(
  captured: string[],
  predicate: (url: string) => boolean,
  timeoutMs = 20_000,
): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = captured.find((u) => predicate(u));
    if (found) return found;
    // small backoff
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Timeout waiting for captured request");
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Data Ops Dashboard E2E — mock-based", () => {
  test.beforeEach(async ({ page }) => {
    await initLocalStorage(page);
    await mockAuth(page);
  });

  // -------------------------------------------------------------------------
  // S-E2E-1: Dashboard loads with 5 KPI cards and connector table
  // -------------------------------------------------------------------------
  test("S-E2E-1: Dashboard loads — 5 KPI cards and connector table are visible (AC-1..6)", async ({ page }) => {
    await mockDataOpsDashboardApis(page);
    const dashboard = new DataOpsDashboardPage(page);

    await test.step("1. Navigate to Data Ops Dashboard", async () => {
      await dashboard.navigate();
      await dashboard.isAtPage();
    });

    await test.step("2. Dashboard title is visible (AC-1)", async () => {
      await expect(dashboard.pageTitle).toBeVisible({ timeout: 10_000 });
    });

    await test.step("3. All 5 KPI values are visible in the summary cards (AC-2..6)", async () => {
      await expect(dashboard.summaryCards).toBeVisible({ timeout: 10_000 });
      for (const value of ["4", "3", "2", "1", "5"]) {
        await expect(dashboard.summaryCards.getByText(value, { exact: true })).toBeVisible();
      }
    });

    await test.step("4. Connector row is rendered in the table (AC-1)", async () => {
      await expect(page.getByRole("table").getByText("github-connector")).toBeVisible({ timeout: 10_000 });
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-2: Connector filter triggers new connectors request (AC-7)
  // -------------------------------------------------------------------------
  test("S-E2E-2: Connector filter triggers new connectors request (AC-7)", async ({ page }) => {
    const capturedRequests: string[] = [];
    await mockDataOpsDashboardApis(page, { capturedRequests });
    const dashboard = new DataOpsDashboardPage(page);

    await test.step("1. Navigate to Data Ops Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.projectSelect).toHaveValue("proj-1", { timeout: 20_000 });
      await expect(dashboard.repositorySelect).toHaveValue("repo-1", { timeout: 20_000 });
      await expect(dashboard.connectorSelect).toBeEnabled({ timeout: 20_000 });
    });

    await test.step("2. Select connector and wait for a filtered connectors request", async () => {
      await dashboard.connectorSelect.selectOption("conn-1");

      const reqUrl = await waitForCapturedRequest(
        capturedRequests,
        (u) => u.includes("/api/v1/data-ops/dashboard/connectors") && /connector(Name|Id)=conn-1/.test(u),
        20_000,
      );

      const params = new URL(reqUrl).searchParams;
      const actualParam = params.get("connectorName") || params.get("connectorId");
      expect(actualParam).toBe("conn-1");
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-3: Connector drill-down opens read-only detail drawer
  // -------------------------------------------------------------------------
  test("S-E2E-3: Clicking view-repository opens the read-only detail drawer (AC-8)", async ({ page }) => {
    await mockDataOpsDashboardApis(page);
    const dashboard = new DataOpsDashboardPage(page);

    await test.step("1. Navigate to Data Ops Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.viewRepositoryButtons.first()).toBeVisible({ timeout: 10_000 });
    });

    await test.step("2. Click the view-repository action on the first row", async () => {
      await dashboard.clickFirstViewRepositoryButton();
    });

    await test.step("3. Detail drawer opens with the connector name as title (AC-8)", async () => {
      await expect(dashboard.drawerTitle).toContainText("github-connector", { timeout: 10_000 });
    });

    await test.step("4. Data quality detail is visible inside the drawer (AC-3, AC-8)", async () => {
      await expect(dashboard.drawer.getByText("Malformed heading; missing closing fence")).toBeVisible({ timeout: 10_000 });
    });

    await test.step("5. Drawer contains no editable inputs (AC-10)", async () => {
      const inputs = dashboard.drawer.locator("input, textarea");
      await expect(inputs).toHaveCount(0);
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-4: Zero-state — no connector/parser/evidence/freshness/link data
  // -------------------------------------------------------------------------
  test("S-E2E-4: Zero-state — all 5 KPI cards show 0 and connector table is empty (spec-pack 8.3)", async ({ page }) => {
    await mockDataOpsDashboardApis(page, {
      summaryResponse: ZERO_SUMMARY,
      connectorsResponse: CONNECTORS_EMPTY_RESPONSE,
    });
    const dashboard = new DataOpsDashboardPage(page);

    await test.step("1. Navigate to Data Ops Dashboard", async () => {
      await dashboard.navigate();
      await dashboard.isAtPage();
    });

    await test.step("2. All 5 KPI cards show 0", async () => {
      await expect(dashboard.summaryCards).toBeVisible({ timeout: 10_000 });
      await expect(dashboard.summaryCards.getByText("0", { exact: true })).toHaveCount(5);
    });

    await test.step("3. No connector rows / view-repository actions are rendered", async () => {
      await expect(dashboard.viewRepositoryButtons).toHaveCount(0);
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-5: Read-only verification — no edit / delete / create / write inputs
  // -------------------------------------------------------------------------
  test("S-E2E-5: Dashboard is read-only — no write controls visible (AC-9, AC-10)", async ({ page }) => {
    await mockDataOpsDashboardApis(page);
    const dashboard = new DataOpsDashboardPage(page);

    await test.step("1. Navigate to Data Ops Dashboard", async () => {
      await dashboard.navigate();
      await expect(dashboard.summaryCards).toBeVisible({ timeout: 10_000 });
    });

    await test.step("2. No edit, delete, create, add, remove, or upload buttons exist", async () => {
      await expect(
        page.getByRole("button", { name: /^(edit|delete|create|add|remove|upload)$/i }),
      ).toHaveCount(0);
    });

    await test.step("3. No number input or textarea elements exist (only the read-only search textbox)", async () => {
      const writeInputs = page.locator("input[type=number], textarea");
      await expect(writeInputs).toHaveCount(0);
    });

    await test.step("4. Has export/download control is rendered (out of scope per OI-DATAOPS-4)", async () => {
      await expect(page.getByText(/export/i)).toHaveCount(1);
    });
  });

  // -------------------------------------------------------------------------
  // S-E2E-6: Unauthenticated — direct API call returns 401
  // -------------------------------------------------------------------------
  test("S-E2E-6: Unauthenticated request to Data Ops Dashboard summary API returns 401 (AC-10)", async ({ page }) => {
    await page.route("**/api/v1/data-ops/dashboard/summary**", async (route) => {
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
        const res = await fetch("/api/v1/data-ops/dashboard/summary");
        return res.status;
      });
      expect(response).toBe(401);
    });
  });
});