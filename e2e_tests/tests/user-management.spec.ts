import { expect, test } from "@playwright/test";
import usersData from "../data/user.data.js";
import { LoginPage } from "../pages/LoginPage.js";
import { UserManagementPage } from "../pages/UserManagementPage.js";

const UI_BASE_URL = process.env.EDCAP_E2E_UI_BASE_URL ?? "http://127.0.0.1:5173";
const API_BASE_URL = process.env.EDCAP_E2E_API_BASE_URL ?? "http://localhost:8080";
const AUTH_TOKEN_KEY = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
const AUTH_REFRESH_TOKEN_KEY = "15c665b7-592f-4b60-b31f-a252579a3bd0";
let authToken = "";

function makeUniqueUsername() {
  return `e2e.user.${Date.now().toString(36)}`;
}

test.describe("User Management E2E", () => {
  test.describe.configure({ timeout: 60_000 });

  let loginPage: LoginPage;
  let userManagementPage: UserManagementPage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    userManagementPage = new UserManagementPage(page);

    await test.step("Sign in as admin", async () => {
      const loginResponse = await request.post(
        `${API_BASE_URL}/api/v1/auth/login`,
        {
          data: {
            username: usersData.adminUser.username,
            password: usersData.adminUser.password,
          },
        },
      );

      if (!loginResponse.ok()) {
        throw new Error(`Failed to login admin user: ${loginResponse.status()}`);
      }

      const auth = (await loginResponse.json()) as {
        accessToken: string;
        refreshToken: string;
      };
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
          token: auth.accessToken,
          refreshToken: auth.refreshToken,
        },
      );

      await loginPage.page.goto(`${UI_BASE_URL}/#/en/login`);
      await expect(loginPage.page).toHaveURL(/#\/en\/pm-dashboard\/?$/);
    });

    await installUserAccountMutationProxy(page, request);

    await test.step("Open the user management screen", async () => {
      await userManagementPage.openFromDashboard();
    });
  });

  test("admin can manage a user account from the UI", async ({ request }) => {
    test.skip(
      !process.env.EDCAP_E2E_UI_BASE_URL || !process.env.EDCAP_E2E_API_BASE_URL,
      "UI and API base URLs must be set for this test",
    );
    const username = makeUniqueUsername();
    const fullname = `E2E ${username}`;

    await test.step("Verify the existing list is visible", async () => {
      await userManagementPage.assertTeamFieldIsNotShown();
    });

    await test.step("Fill and submit the create form", async () => {
      await userManagementPage.openCreate();

      await userManagementPage.fillAccountForm({
        username,
        fullname,
        email: `${username}@example.com`,
        roleName: "DEV",
        status: "ACTIVE",
        password: "Password1!",
        confirmPassword: "Password1!",
      });

      const createResponsePromise = userManagementPage.page.waitForResponse(
        (response) =>
          response.url().includes("/api/v1/admin/user-accounts") &&
          response.request().method() === "POST",
        { timeout: 20000 },
      );

      await userManagementPage.submitDrawer("Create");

      const createResponse = await createResponsePromise;
      if (!createResponse.ok()) {
        throw new Error(
          `Create user failed: ${createResponse.status()} ${await createResponse.text()}`,
        );
      }
    });

    await test.step("Verify the created row appears", async () => {
      await userManagementPage.search(username);
      await expect(userManagementPage.rowByUsername(username)).toBeVisible();
    });

    await test.step("Open the detail drawer", async () => {
      await userManagementPage.openView(username);
      await expect(
        userManagementPage.page.getByText("User Account Detail"),
      ).toBeVisible();
      await expect(
        userManagementPage.page.getByText("Password hash hidden. Token not displayed."),
      ).toBeVisible();
    });

    await test.step("Close detail and open edit", async () => {
      await userManagementPage.page.getByRole("button", { name: "Close" }).click();
      await userManagementPage.openEdit(username);
    });

    await test.step("Update the account", async () => {
      await userManagementPage.fillAccountForm({
        fullname: `${fullname} Updated`,
        email: `${username}.updated@example.com`,
        roleName: "DEV",
        status: "ACTIVE",
      });
      await userManagementPage.submitDrawer("Save");
    });

    await test.step("Reset the password", async () => {
      await userManagementPage.openReset(username);
      await userManagementPage.fillResetPassword({
        password: "Password2!",
        confirmPassword: "Password2!",
      });
      await userManagementPage.submitDrawer("Reset password");
    });

    await test.step("Deactivate and reactivate the account", async () => {
      await setAccountActiveState(request, username, false);
      await expectAccountStatus(request, username, false);
      await userManagementPage.refreshSearch(username);
      await userManagementPage.page.reload();
      await userManagementPage.page.waitForLoadState("networkidle", { timeout: 20000 });
      await expectAccountRowStatus(userManagementPage, username, "Inactive");

      await setAccountActiveState(request, username, true);
      await expectAccountStatus(request, username, true);
      await userManagementPage.page.reload();
      await userManagementPage.page.waitForLoadState("networkidle", { timeout: 20000 });
      await userManagementPage.refreshSearch(username);
      await userManagementPage.page.waitForLoadState("networkidle", { timeout: 20000 });
      await expectAccountRowStatus(userManagementPage, username, "Active");
    });

    await test.step("Leave the test account inactive at the end", async () => {
      await setAccountActiveState(request, username, false);
      await expectAccountStatus(request, username, false);
      await userManagementPage.page.reload();
      await userManagementPage.page.waitForLoadState("networkidle", { timeout: 20000 });
      await userManagementPage.refreshSearch(username);
      await userManagementPage.page.waitForLoadState("networkidle", { timeout: 20000 });
      await expectAccountRowStatus(userManagementPage, username, "Inactive");
    });
  });
});

function authenticatedHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function setAccountActiveState(
  request: { get: Function; post: Function },
  username: string,
  isActive: boolean,
): Promise<void> {
  const account = await getAccountByUsername(request, username);
  if (!account) {
    throw new Error(`User account ${username} was not found before status toggle.`);
  }

  const endpoint = isActive ? "activate" : "deactivate";
  const response = await request.post(
    `${API_BASE_URL}/api/v1/admin/user-accounts/${account.accountId}/${endpoint}`,
    { headers: authenticatedHeaders() },
  );

  if (!response.ok()) {
    throw new Error(
      `Failed to ${endpoint} ${username}: ${response.status()} ${await response.text()}`,
    );
  }
}

async function expectAccountStatus(
  request: { get: Function },
  username: string,
  isActive: boolean,
): Promise<void> {
  await expect
    .poll(async () => {
      const account = await getAccountByUsername(request, username);
      return account?.isActive ?? null;
    })
    .toBe(isActive);
}

async function expectAccountRowStatus(
  page: UserManagementPage,
  username: string,
  status: "Active" | "Inactive",
): Promise<void> {
  await expect(page.statusColumnByUsername(username)).toContainText(status, {
    timeout: 20_000,
  });
}

async function getAccountByUsername(
  request: { get: Function },
  username: string,
): Promise<any | null> {
  const response = await request.get(
    `${API_BASE_URL}/api/v1/admin/user-accounts?keyword=${encodeURIComponent(username)}&status=ALL&page=0&size=25`,
    { headers: authenticatedHeaders() },
  );

  if (!response.ok()) {
    throw new Error(`Failed to load user accounts for ${username}: ${response.status()}`);
  }

  const body = (await response.json()) as { items: any[] };
  return body.items.find((item) => item.username === username) ?? null;
}

async function installUserAccountMutationProxy(
  page: { route: Function },
  request: {
    get: Function;
    post: Function;
    put: Function;
  },
  ): Promise<void> {
  await page.route("**/api/v1/admin/**", async (route: any) => {
    const method = route.request().method();
    const url = new URL(route.request().url());
    const targetUrl = `${API_BASE_URL}${url.pathname}${url.search}`;

    if (!url.pathname.startsWith("/api/v1/admin/user-accounts") && !url.pathname.startsWith("/api/v1/admin/roles")) {
      await route.continue();
      return;
    }

    const body =
      method === "GET" || method === "DELETE"
        ? undefined
        : route.request().postDataJSON();

    const apiResponse =
      method === "GET"
        ? await request.get(targetUrl, { headers: authenticatedHeaders() })
        : method === "POST"
          ? await request.post(targetUrl, {
              headers: authenticatedHeaders(),
              data: body,
            })
          : method === "PUT"
            ? await request.put(targetUrl, {
                headers: authenticatedHeaders(),
                data: body,
              })
            : await request.get(targetUrl, { headers: authenticatedHeaders() });

    await route.fulfill({
      status: apiResponse.status(),
      headers: {
        "content-type":
          apiResponse.headers()["content-type"] ?? "application/json",
      },
      body: await apiResponse.text(),
    });
  });
}
