import { expect, test, type Page } from "@playwright/test";

const UI_BASE_URL = process.env.EDCAP_E2E_UI_BASE_URL ?? "http://127.0.0.1:5173";
const MOCK_ACCESS_TOKEN = "mock-admin-audit-access-token";
const MOCK_REFRESH_TOKEN = "mock-admin-audit-refresh-token";
const KEY_TOKEN = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
const KEY_REFRESH_TOKEN = "15c665b7-592f-4b60-b31f-a252579a3bd0";

const ADMIN_USER = {
  username: "audit.admin",
  displayName: "Audit Admin",
  email: "audit.admin@example.com",
  role: "ADMIN",
  accessScopes: ["AUDIT_READ"],
};

type AuditLogFixture = {
  id: string;
  occurredAt: string;
  actorUsername: string;
  actorRoleName: string | null;
  module: string;
  entityType: string;
  entityId: string;
  operationType: string;
  changedFields: string | null;
  beforeValue: string | null;
  afterValue: string | null;
  userAgent: string | null;
  errorMessage: string | null;
  traceId: string;
};

const AUDIT_LOGS: AuditLogFixture[] = [
  {
    id: "audit-role-update",
    occurredAt: "2026-07-09T03:00:00Z",
    actorUsername: "admin@example.com",
    actorRoleName: "ADMIN",
    module: "ROLE",
    entityType: "ROLE",
    entityId: "role-001",
    operationType: "UPDATE",
    changedFields: "name, description",
    beforeValue: JSON.stringify({
      name: "Role A",
      description: "Before change",
    }),
    afterValue: JSON.stringify({
      name: "Role A+",
      description: "After change",
    }),
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    errorMessage: null,
    traceId: "trace-role-update",
  },
  {
    id: "audit-login-failed",
    occurredAt: "2026-07-09T03:05:00Z",
    actorUsername: "guest@example.com",
    actorRoleName: null,
    module: "LOGIN",
    entityType: "LOGIN_ATTEMPT",
    entityId: "attempt-001",
    operationType: "LOGIN_FAILED",
    changedFields: null,
    beforeValue: null,
    afterValue: null,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    errorMessage: "Invalid credentials",
    traceId: "trace-login-failed",
  },
  {
    id: "audit-login-success",
    occurredAt: "2026-07-09T03:10:00Z",
    actorUsername: "admin@example.com",
    actorRoleName: "ADMIN",
    module: "LOGIN",
    entityType: "LOGIN_SESSION",
    entityId: "session-001",
    operationType: "LOGIN_SUCCESS",
    changedFields: null,
    beforeValue: null,
    afterValue: JSON.stringify({
      status: "ACTIVE",
      username: "admin@example.com",
    }),
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    errorMessage: null,
    traceId: "trace-login-success",
  },
  ...Array.from({ length: 17 }, (_, index) => {
    const seq = index + 4;
    const modules = [
      "ORGANIZATION",
      "CUSTOMER",
      "PROJECT",
      "REPOSITORY",
      "TEAM",
      "MEMBER_USER",
    ];
    const module = modules[index % modules.length];
    return {
      id: `audit-${String(seq).padStart(3, "0")}`,
      occurredAt: `2026-07-09T03:${String(seq).padStart(2, "0")}:00Z`,
      actorUsername: `user${seq}@example.com`,
      actorRoleName: seq % 2 === 0 ? "EDITOR" : "ADMIN",
      module,
      entityType: module,
      entityId: `${module.toLowerCase()}-${String(seq).padStart(3, "0")}`,
      operationType: seq % 3 === 0 ? "UPDATE" : seq % 3 === 1 ? "CREATE" : "READ",
      changedFields: seq % 3 === 0 ? "name" : null,
      beforeValue: seq % 3 === 0 ? JSON.stringify({ name: "Before" }) : null,
      afterValue:
        seq % 3 === 0 ? JSON.stringify({ name: "After" }) : JSON.stringify({ status: "ACTIVE" }),
      userAgent: "Mozilla/5.0 (Playwright)",
      errorMessage: null,
      traceId: `trace-${String(seq).padStart(3, "0")}`,
    } satisfies AuditLogFixture;
  }),
  {
    id: "audit-page-two",
    occurredAt: "2026-07-09T03:22:00Z",
    actorUsername: "auditor21@example.com",
    actorRoleName: "ADMIN",
    module: "ORGANIZATION",
    entityType: "ORGANIZATION",
    entityId: "org-021",
    operationType: "READ",
    changedFields: null,
    beforeValue: null,
    afterValue: null,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    errorMessage: null,
    traceId: "trace-page-two",
  },
];

test.describe("Admin Audit Log E2E - mock-based", () => {
  test.beforeEach(async ({ page }) => {
    await initAuthState(page);
    await mockAuthApis(page);
    await mockAuditLogApis(page);
  });

  test("loads the read-only audit log screen and opens a detail drawer", async ({ page }) => {
    await page.goto(`${UI_BASE_URL}/#/en/admin/audit-logs`);

    await expect(page.getByRole("heading", { name: "Admin Audit Log" })).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(20);
    await expect(
      page.getByRole("button", {
        name: /^(create|edit|delete|remove|upload)$/i,
      }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Detail" }).first().click();

    const drawer = page.getByRole("dialog", { name: "Audit Log Detail" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("admin@example.com (ADMIN)")).toBeVisible();
    await expect(drawer.getByText("trace-role-update")).toBeVisible();
    await expect(drawer.getByText("Changed Fields")).toBeVisible();
  });

  test("filters by module, operation type and actor", async ({ page }) => {
    const requests: string[] = [];
    await page.route("**/api/v1/admin/audit-logs**", async (route) => {
      requests.push(route.request().url());
      await fulfillAuditLogRoute(route);
    });

    await page.goto(`${UI_BASE_URL}/#/en/admin/audit-logs`);
    await expect(page.locator("table tbody tr")).toHaveCount(20);

    await page.getByTestId("module-select").selectOption("LOGIN");
    await expect(page).toHaveURL(/module=LOGIN/);
    await expect(page).toHaveURL(/module=LOGIN/);
    await page.getByTestId("actor-input").fill("guest@example.com");

    await expect.poll(
      () => requests[requests.length - 1] ?? "",
      { timeout: 10_000 },
    ).toContain("module=LOGIN");
    await expect.poll(
      () => requests[requests.length - 1] ?? "",
      { timeout: 10_000 },
    ).toContain("actor=guest%40example.com");

    await expect(page.locator("table tbody tr")).toHaveCount(1);
    await expect(page.getByText("guest@example.com")).toBeVisible();
    await expect(page.getByRole("table").getByText("LOGIN_ATTEMPT / attempt-001")).toBeVisible();
  });

  test("paginates to the second page of audit logs", async ({ page }) => {
    await page.goto(`${UI_BASE_URL}/#/en/admin/audit-logs`);
    await expect(page.locator("table tbody tr")).toHaveCount(20);

    await page.getByRole("button", { name: "next", exact: true }).click();

    await expect(page.locator("table tbody tr")).toHaveCount(1);
    await expect(page.getByText("auditor21@example.com")).toBeVisible();
    await expect(page.getByText("ORGANIZATION / org-021")).toBeVisible();
    await expect(page.getByRole("button", { name: "prev", exact: true })).toBeEnabled();
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

async function mockAuditLogApis(page: Page): Promise<void> {
  await page.route("**/api/v1/admin/audit-logs**", async (route) => {
    await fulfillAuditLogRoute(route);
  });
}

async function fulfillAuditLogRoute(route: Parameters<Page["route"]>[1]) {
  const url = new URL(route.request().url());
  const { pathname } = url;

  if (pathname.startsWith("/api/v1/admin/audit-logs/") && pathname !== "/api/v1/admin/audit-logs") {
    const id = pathname.split("/").at(-1) ?? "";
    const item = AUDIT_LOGS.find((entry) => entry.id === id);

    if (!item) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ status: 404, message: "Pages.AdminAuditLog.NotFound" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: item.id,
        occurredAt: item.occurredAt,
        actorUserId: `user-${item.actorUsername}`,
        actorUsername: item.actorUsername,
        actorRoleName: item.actorRoleName,
        module: item.module,
        entityType: item.entityType,
        entityId: item.entityId,
        operationType: item.operationType,
        changedFields: item.changedFields,
        beforeValue: item.beforeValue,
        afterValue: item.afterValue,
        userAgent: item.userAgent,
        errorMessage: item.errorMessage,
        traceId: item.traceId,
      }),
    });
    return;
  }

  const module = url.searchParams.get("module") ?? "";
  const operationType = url.searchParams.get("operationType") ?? "";
  const actor = url.searchParams.get("actor") ?? "";
  const dateFrom = url.searchParams.get("dateFrom") ?? "";
  const dateTo = url.searchParams.get("dateTo") ?? "";
  const pageIndex = Number(url.searchParams.get("page") ?? "0");
  const size = Number(url.searchParams.get("size") ?? "20");

  const filtered = AUDIT_LOGS.filter((item) => {
    if (module && item.module !== module) return false;
    if (operationType && item.operationType !== operationType) return false;
    if (actor && !item.actorUsername.toLowerCase().includes(actor.toLowerCase())) return false;
    if (dateFrom && new Date(item.occurredAt) < new Date(dateFrom)) return false;
    if (dateTo && new Date(item.occurredAt) > new Date(dateTo)) return false;
    return true;
  });

  const start = pageIndex * size;
  const pageItems = filtered.slice(start, start + size).map((item) => ({
    id: item.id,
    occurredAt: item.occurredAt,
    actorUsername: item.actorUsername,
    module: item.module,
    entityType: item.entityType,
    entityId: item.entityId,
    operationType: item.operationType,
  }));

  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      items: pageItems,
      page: pageIndex,
      size,
      totalElements: filtered.length,
      totalPages: filtered.length === 0 ? 0 : Math.ceil(filtered.length / size),
    }),
  });
}
