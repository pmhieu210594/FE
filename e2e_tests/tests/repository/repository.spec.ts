import {
  expect,
  test,
  type APIRequestContext,
  type Locator,
  type Page,
} from "@playwright/test";
import usersData from "../../data/user.data.js";

const UI_BASE_URL =
  process.env.EDCAP_E2E_UI_BASE_URL ?? "http://localhost:5173";
const API_BASE_URL =
  process.env.EDCAP_E2E_API_BASE_URL ?? "http://localhost:8080";

const AUTH_TOKEN_KEY = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
const AUTH_REFRESH_TOKEN_KEY = "15c665b7-592f-4b60-b31f-a252579a3bd0";

let authToken = "";
let projectId: string;
let projectAlias: string;

type Repository = {
  repositoryId: string;
  projectId: string;
  projectAlias: string;
  repoNameMasked: string;
  status: "ACTIVE" | "DELETED";
};

test.describe("Repository Management - real UI E2E", () => {
  test.beforeEach(async ({ page, request }) => {
    const loginResponse = await request.post(
      `${API_BASE_URL}/api/v1/auth/login`,
      {
        data: {
          username: usersData.adminUser.username,
          password: usersData.adminUser.password,
        },
      },
    );

    const auth = await loginResponse.json();
    authToken = auth.accessToken;

    await page.addInitScript(
      ({ tokenKey, refreshKey, token, refreshToken }) => {
        localStorage.setItem(tokenKey, token);
        localStorage.setItem(refreshKey, refreshToken);
        localStorage.setItem("i18nextLng", "en");
      },
      {
        tokenKey: AUTH_TOKEN_KEY,
        refreshKey: AUTH_REFRESH_TOKEN_KEY,
        token: authToken,
        refreshToken: auth.refreshToken,
      },
    );

    await cleanupRepositories(request, "E2E_REPO_");

    // 🔥 đảm bảo có project
    const project = await ensureProject(request);

    projectId = project.projectId;
    projectAlias = project.projectAlias;

    await page.goto(`${UI_BASE_URL}/#/en/repositories`);
    await expect(page.locator("#repository-list-table")).toBeVisible({
      timeout: 15000,
    });
  });

  test.afterAll(async ({ request }) => {
    await cleanupRepositories(request, "E2E_REPO_");
  });

  test("1-6. creates Repository from UI", async ({ page, request }) => {
    const project = await getFirstProject(request);
    const name = makeName();

    try {
      await test.step("1. Click Create", async () => {
        await clickCreate(page);
      });

      await test.step("2. Fill form", async () => {
        await fillRepositoryForm(page, {
          projectAlias: project.projectAlias,
          name,
        });
      });

      await test.step("3. Submit", async () => {
        await submitForm(page);
      });

      await test.step("4. Verify appears in list", async () => {
        await waitForRepositoryPersisted(request, name, "ACTIVE");
        await search(page, name);
        await expectRow(page, name);
      });
    } finally {
      await cleanupRepositories(request, name);
    }
  });

  test("9-12. searches Repository by name", async ({ page, request }) => {
    const project = await getFirstProject(request);
    const name = makeName();

    try {
      await createRepositoryViaApi(request, project.projectId, name);

      await page.reload();
      await expect(page.locator("#repository-list-table")).toBeVisible();

      await test.step("9. Search Repository", async () => {
        await search(page, name);
      });

      await test.step("10. Verify row visible", async () => {
        await expectRow(page, name);
      });

      await test.step("11. Search non-existing", async () => {
        await search(page, `${name}_NOT_FOUND`);
      });

      await test.step("12. Verify row disappears", async () => {
        await expectRowNotVisible(page, name);
      });
    } finally {
      await cleanupRepositories(request, name);
    }
  });

  test("13-18. edits Repository", async ({ page, request }) => {
    const project = await getFirstProject(request);
    const name = makeName();
    const updated = `${name}_UPDATED`;

    try {
      await createRepositoryViaApi(request, project.projectId, name);

      await page.reload();

      await test.step("13. Click Edit", async () => {
        await search(page, name);
        await clickEdit(page, name);
      });

      await test.step("14. Update name", async () => {
        await fillRepositoryForm(page, {
          projectAlias: project.projectAlias,
          name: updated,
        });
      });

      await test.step("15. Submit", async () => {
        await submitForm(page);
      });

      await test.step("16. Search updated", async () => {
        await search(page, updated);
      });

      await test.step("17. Verify updated row", async () => {
        await expectRow(page, updated);
      });

      await test.step("18. Verify API", async () => {
        const repo = await findRepository(request, updated);
        expect(repo).not.toBeNull();
        expect(repo?.repoNameMasked).toBe(updated);
      });
    } finally {
      await cleanupRepositories(request, name);
      await cleanupRepositories(request, updated);
    }
  });

  test("20-24. rejects duplicate Repository name", async ({
    page,
    request,
  }) => {
    const project = await getFirstProject(request);
    const name = makeName();

    try {
      await createRepositoryViaApi(request, project.projectId, name);

      await page.reload();

      await test.step("20. Click Create", async () => {
        await clickCreate(page);
      });

      await test.step("21. Fill duplicate name", async () => {
        await fillRepositoryForm(page, {
          projectAlias: project.projectAlias,
          name,
        });
      });

      await test.step("22. Submit duplicate", async () => {
        await submitForm(page);
      });

      await test.step("23. Verify rejected", async () => {
        await expect(page.getByRole("dialog")).toBeVisible();
      });

      await test.step("24. Verify only 1 exists", async () => {
        const repos = await findRepositoriesByKeyword(request, name);
        expect(repos.filter((r) => r.repoNameMasked === name)).toHaveLength(1);
      });
    } finally {
      await cleanupRepositories(request, name);
    }
  });

  test("25-31. deletes Repository", async ({ page, request }) => {
    const project = await getFirstProject(request);
    const name = makeName();

    try {
      await createRepositoryViaApi(request, project.projectId, name);

      await page.reload();
      await search(page, name);

      await test.step("25. Click Delete", async () => {
        await clickDelete(page, name);
      });

      await test.step("26. Confirm delete", async () => {
        await confirmDelete(page);
      });

      await test.step("27. Verify removed from active", async () => {
        await page.reload();

        await search(page, name);

        await expectRowNotVisible(page, name);
      });

      await test.step("28. Switch to deleted", async () => {
        await filterStatus(page, "DELETED");
        await search(page, name);
      });

      await test.step("29. Verify appears in deleted", async () => {
        await expectRow(page, name);
      });

      await test.step("30. Open detail", async () => {
        await clickDetail(page, name);
      });

      await test.step("31. Verify API", async () => {
        const repo = await findRepository(request, name, "DELETED");
        expect(repo?.status).toBe("DELETED");
      });
    } finally {
      await cleanupRepositories(request, name);
    }
  });
});

/* ================= helpers ================= */

function makeName() {
  return `E2E_REPO_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

async function fillRepositoryForm(
  page: Page,
  values: { projectAlias: string; name: string },
) {
  const dialog = page.getByRole("dialog").last();

  const projectSelect = firstExisting(dialog, [
    dialog.locator("#projectId"),
    dialog.getByRole("combobox").first(),
    dialog.locator('input[aria-haspopup="listbox"]').first(),
  ]);

  await projectSelect.click();
  await chooseDropdownOption(page, values.projectAlias);

  await firstExisting(dialog, [
    dialog.locator('input[id="repo_name_masked"]'),
  ]).fill(values.name);
}

async function submitForm(page: Page) {
  const dialog = page.getByRole("dialog").last();

  await firstExisting(dialog, [
    dialog.getByRole("button", { name: /save/i }),
    dialog.locator("button").filter({ hasText: /save/i }),
  ]).click();

  await expect(dialog)
    .not.toBeVisible({ timeout: 15000 })
    .catch(() => {});
}

async function search(page: Page, keyword: string) {
  const input = firstExisting(page, [
    page.getByRole("textbox", { name: /search/i }),
    page.locator("#repository-list-table input").first(),
  ]);

  await input.fill(keyword);
  await input.press("Enter").catch(() => {});
}

async function expectRow(page: Page, name: string) {
  await expect(repositoryRow(page, name)).toBeVisible({ timeout: 15000 });
}

function repositoryRow(page: Page | Locator, name: string) {
  return firstExisting(page, [
    page.getByRole("row").filter({ hasText: name }),
    page.locator("tr").filter({ hasText: name }),
  ]);
}

async function waitForRepositoryPersisted(
  request: APIRequestContext,
  name: string,
  status: "ACTIVE" | "DELETED",
) {
  await expect
    .poll(async () => {
      const repo = await findRepository(request, name);
      return repo?.status ?? null;
    })
    .toBe(status);
}

async function findRepository(
  request: APIRequestContext,
  keyword: string,
  status: "ACTIVE" | "DELETED" = "ACTIVE",
): Promise<Repository | null> {
  const res = await request.get(
    `${API_BASE_URL}/api/v1/repositories?keyword=${keyword}&status=${status}&page=0&size=10`,
    { headers: authHeaders() },
  );
  const body = await res.json();
  return (
    body.items.find((r: Repository) => r.repoNameMasked === keyword) ?? null
  );
}

async function cleanupRepositories(request: APIRequestContext, prefix: string) {
  const res = await request.get(
    `${API_BASE_URL}/api/v1/repositories?keyword=${prefix}&status=ALL&page=0&size=100`,
    { headers: authHeaders() },
  );
  const body = await res.json();

  await Promise.all(
    body.items
      .filter((r: Repository) => r.repoNameMasked.startsWith(prefix))
      .map((r: Repository) =>
        request.put(
          `${API_BASE_URL}/api/v1/repositories/${r.repositoryId}/delete`,
          {
            headers: authHeaders(),
          },
        ),
      ),
  );
}

async function getFirstProject(request: APIRequestContext) {
  const res = await request.get(
    `${API_BASE_URL}/api/v1/projects?status=ACTIVE&page=0&size=10`,
    { headers: authHeaders() },
  );
  const body = await res.json();
  return body.items[0];
}

function authHeaders() {
  return { Authorization: `Bearer ${authToken}` };
}

async function clickCreate(page: Page) {
  await firstExisting(page, [
    page.getByRole("button", { name: /create|add/i }),
    page.locator("button").filter({ hasText: /create|add/i }),
  ]).click();
}

async function chooseDropdownOption(page: Page, text: string) {
  const option = firstExisting(page, [
    page.getByRole("option", { name: new RegExp(text, "i") }),
    page.locator(".ant-select-item-option").filter({ hasText: text }),
  ]).first();

  await option.click();
}

function firstExisting(_page: Page | Locator, locators: Locator[]): Locator {
  return locators.slice(1).reduce((acc, l) => acc.or(l), locators[0]);
}

async function createRepositoryViaApi(request, projectId, name) {
  await request.post(`${API_BASE_URL}/api/v1/repositories`, {
    headers: authHeaders(),
    data: {
      projectId,
      repo_name_masked: name,
      host_type: "GITHUB",
      default_branch: "main",
      repo_url_hash: "",
    },
  });
}

async function findRepositoriesByKeyword(request, keyword) {
  const res = await request.get(
    `${API_BASE_URL}/api/v1/repositories?keyword=${keyword}&status=ALL&page=0&size=100`,
    { headers: authHeaders() },
  );
  const body = await res.json();
  return body.items;
}

async function expectRowNotVisible(page: Page, name: string): Promise<void> {
  await expect(page.getByRole("row").filter({ hasText: name })).toHaveCount(0, {
    timeout: 15000,
  });
}

async function clickDetail(page: Page, name: string): Promise<void> {
  const row = repositoryRow(page, name);
  await expect(row).toBeVisible();

  await firstExisting(row, [
    row.getByRole("button", { name: /detail|view|chi tiết|詳細/i }),
    row.locator('button[title*="detail" i]'),
    row.locator('button[title*="view" i]'),
  ]).click();
}

async function clickEdit(page: Page, name: string): Promise<void> {
  const row = repositoryRow(page, name);
  await expect(row).toBeVisible();

  await firstExisting(row, [
    row.getByRole("button", { name: /edit|sửa|chỉnh sửa|編集/i }),
    row.locator('button[title*="Edit" i]'),
    row.locator('button[title*="edit" i]'),
  ]).click();
}

async function clickDelete(page: Page, name: string): Promise<void> {
  const row = repositoryRow(page, name);
  await expect(row).toBeVisible();

  await firstExisting(row, [
    row.getByRole("button", { name: /delete|xóa|削除/i }),
    row.locator('button[title*="Delete" i]'),
    row.locator('button[title*="delete" i]'),
  ]).click();
}

async function confirmDelete(page: Page): Promise<void> {
  const popconfirm = page.locator(".ant-popconfirm, .ant-popover").last();

  await firstExisting(popconfirm, [
    popconfirm.getByRole("button", { name: /^OK$/i }),
    popconfirm.getByRole("button", { name: /ok|yes|delete|xóa|削除/i }),
  ]).click();
}

async function filterStatus(
  page: Page,
  status: "ACTIVE" | "DELETED" | "ALL",
): Promise<void> {
  await firstExisting(page, [
    page.getByRole("button", { name: /filter|bộ lọc|フィルタ/i }),
    page.locator("button").filter({ hasText: /filter|bộ lọc|フィルタ/i }),
  ]).click();

  const dialog = page.getByRole("dialog").last();

  if (status !== "ACTIVE") {
    const statusSelect = dialog.getByRole("combobox").nth(1);

    await statusSelect.click();

    const arrowDownCount = status === "DELETED" ? 1 : 2;
    for (let i = 0; i < arrowDownCount; i++) {
      await statusSelect.press("ArrowDown");
    }

    await statusSelect.press("Enter");
  }

  await firstExisting(dialog, [
    dialog.getByRole("button", { name: /apply|filter|áp dụng|適用/i }),
    dialog.locator("button").filter({ hasText: /apply|filter|áp dụng|適用/i }),
  ]).click();
}

async function ensureProject(request: APIRequestContext) {
  // 1. tìm project active trước
  const res = await request.get(
    `${API_BASE_URL}/api/v1/projects?status=ACTIVE&page=0&size=10`,
    { headers: authHeaders() },
  );

  const body = await res.json();
  if (body.items.length > 0) {
    return body.items[0];
  }

  // 2. nếu không có → tạo mới
  const customer = await getFirstActiveCustomer(request);

  const alias = `E2E_PROJECT_${Date.now()}`;

  const createRes = await request.post(`${API_BASE_URL}/api/v1/projects`, {
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    data: {
      customerId: customer.customerId,
      projectAlias: alias,
      projectType: "E2E",
      riskLevel: "LOW",
      teamIds: "",
    },
  });

  if (!createRes.ok()) {
    throw new Error(`Failed to create project: ${createRes.status()}`);
  }

  return await createRes.json();
}

async function getFirstActiveCustomer(request: APIRequestContext) {
  const response = await request.get(
    `${API_BASE_URL}/api/v1/customers?status=ACTIVE&page=0&pageSize=100`,
    { headers: authHeaders() },
  );

  if (!response.ok()) {
    throw new Error(`Failed to load active Customers: ${response.status()}`);
  }

  const body = await response.json();
  const customer = body.items[0];

  if (!customer) {
    throw new Error("No active Customer available for E2E.");
  }

  return customer;
}
