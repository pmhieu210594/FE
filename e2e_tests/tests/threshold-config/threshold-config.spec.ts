import { expect, test, type Page } from "@playwright/test";

const UI_BASE_URL =
  process.env.EDCAP_E2E_UI_BASE_URL ?? "http://127.0.0.1:5173";
const MOCK_ACCESS_TOKEN = "mock-threshold-config-access-token";
const MOCK_REFRESH_TOKEN = "mock-threshold-config-refresh-token";
const KEY_TOKEN = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
const KEY_REFRESH_TOKEN = "15c665b7-592f-4b60-b31f-a252579a3bd0";

const ADMIN_USER = {
  username: "threshold.admin",
  displayName: "Threshold Admin",
  email: "threshold.admin@example.com",
  role: "ADMIN",
  accessScopes: [],
};

type ScoreThresholdFixture = {
  id: string;
  code: string;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
  version: number;
};

let activeBands: ScoreThresholdFixture[] = [
  {
    id: "band-critical",
    code: "CRITICAL",
    label: "Critical",
    minScore: 0,
    maxScore: 39,
    color: "#F43F5E",
    version: 0,
  },
  {
    id: "band-risky",
    code: "RISKY",
    label: "Risky",
    minScore: 40,
    maxScore: 59,
    color: "#F97316",
    version: 0,
  },
  {
    id: "band-warning",
    code: "WARNING",
    label: "Warning",
    minScore: 60,
    maxScore: 74,
    color: "#F59E0B",
    version: 0,
  },
  {
    id: "band-good",
    code: "GOOD",
    label: "Good",
    minScore: 75,
    maxScore: 89,
    color: "#0EA5E9",
    version: 0,
  },
  {
    id: "band-excellent",
    code: "EXCELLENT",
    label: "Excellent",
    minScore: 90,
    maxScore: 100,
    color: "#10B981",
    version: 0,
  },
];

test.describe("Score Threshold Configuration E2E - mock-based", () => {
  test.beforeEach(async ({ page }) => {
    activeBands = activeBands.map((band) => ({ ...band }));
    await initAuthState(page);
    await mockAuthApis(page);
    await mockScoreThresholdApis(page);
  });

  test("view -> edit -> save cycle updates the active band list", async ({
    page,
  }) => {
    await page.goto(`${UI_BASE_URL}/#/en/admin/score-thresholds`);

    await expect(
      page.getByRole("heading", { name: "Score Threshold Configuration" }),
    ).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(5);

    // 1. Bấm nút Edit
    await page.getByRole("button", { name: "Edit" }).click();

    // 2. Tìm thẳng ô input đang hiển thị chữ "Excellent"
    const labelInput = page.locator('input[value="Excellent"]');

    // 3. Điền giá trị mới
    await labelInput.fill("Outstanding");

    // 4. Lưu lại
    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByRole("heading", { name: "Score Threshold Configuration" }),
    ).toBeVisible();
    await expect(page.getByText("Outstanding")).toBeVisible();
  });

  test("Cancel reverts local edits without calling the save API", async ({
    page,
  }) => {
    let saveCalled = false;
    await page.route("**/api/v1/score-thresholds", async (route) => {
      if (route.request().method() === "POST") {
        saveCalled = true;
      }
      await fulfillScoreThresholdRoute(route);
    });

    await page.goto(`${UI_BASE_URL}/#/en/admin/score-thresholds`);
    await expect(page.locator("table tbody tr")).toHaveCount(5);

    // 1. Bấm nút Edit
    await page.getByRole("button", { name: "Edit" }).click();

    // 2. Tìm thẳng ô input đang hiển thị chữ "Good"
    const labelInput = page.locator('input[value="Good"]');

    // 3. Điền giá trị mới
    await labelInput.fill("Should not persist");

    // 4. Click button cancel
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByText("Should not persist")).not.toBeVisible();
    expect(saveCalled).toBe(false);
  });
});

async function initAuthState(page: Page): Promise<void> {
  await page.addInitScript(
    ({ tokenKey, refreshKey, token, refreshToken }) => {
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(refreshKey, refreshToken);
      localStorage.setItem("i18nextLng", "en");
    },
    {
      tokenKey: KEY_TOKEN,
      refreshKey: KEY_REFRESH_TOKEN,
      token: MOCK_ACCESS_TOKEN,
      refreshToken: MOCK_REFRESH_TOKEN,
    },
  );
}

async function mockAuthApis(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    const authHeader = route.request().headers().authorization ?? "";
    if (authHeader !== `Bearer ${MOCK_ACCESS_TOKEN}`) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ status: 401, errorCode: "UNAUTHORIZED" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(ADMIN_USER),
    });
  });
}

async function mockScoreThresholdApis(page: Page): Promise<void> {
  await page.route("**/api/v1/score-thresholds", async (route) => {
    await fulfillScoreThresholdRoute(route);
  });
}

async function fulfillScoreThresholdRoute(route: Parameters<Page["route"]>[1]) {
  const method = route.request().method();

  if (method === "POST") {
    const body = route.request().postDataJSON() as {
      thresholds: Array<
        Omit<ScoreThresholdFixture, "version"> & {
          id?: string;
          version?: number;
        }
      >;
    };
    activeBands = body.thresholds.map((row) => ({
      id: row.id ?? `band-${row.code.toLowerCase()}`,
      code: row.code,
      label: row.label,
      minScore: row.minScore,
      maxScore: row.maxScore,
      color: row.color,
      version: (row.version ?? 0) + 1,
    }));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(activeBands),
    });
    return;
  }

  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(activeBands),
  });
}
