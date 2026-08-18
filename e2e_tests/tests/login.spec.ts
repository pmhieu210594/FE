import { expect, test } from "@playwright/test";
import usersData from "../data/user.data.js";
import { LoginPage } from "../pages/LoginPage.js";

const AUTH_TOKEN_KEY = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
const AUTH_REFRESH_TOKEN_KEY = "15c665b7-592f-4b60-b31f-a252579a3bd0";
const MOCK_ACCESS_TOKEN = "mock-access-token";
const MOCK_REFRESH_TOKEN = "mock-refresh-token";

test.describe("Login Page E2E", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    await page.addInitScript(
      ({ tokenKey, refreshKey }) => {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(refreshKey);
        localStorage.setItem("i18nextLng", "en");
      },
      {
        tokenKey: AUTH_TOKEN_KEY,
        refreshKey: AUTH_REFRESH_TOKEN_KEY,
      },
    );

    await page.route("**/api/v1/auth/login", async (route) => {
      const body = route.request().postDataJSON() as {
        username?: string;
        password?: string;
      };

      if (
        body.username === usersData.adminUser.username &&
        body.password === usersData.adminUser.password
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          json: {
            accessToken: MOCK_ACCESS_TOKEN,
            refreshToken: MOCK_REFRESH_TOKEN,
            tokenType: "Bearer",
            expiresInSeconds: 43200,
            user: {
              username: usersData.adminUser.username,
              displayName: "Nguyen Khac Trung",
              email: "nk_trung@brycen.com.vn",
              role: "ADMIN",
              accessScopes: [],
            },
            redirectTo: "/pm-dashboard",
          },
        });
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: "application/json",
        json: {
          timestamp: new Date().toISOString(),
          status: 401,
          error: "INVALID_CREDENTIALS",
          message: "auth.invalid_credentials",
          traceId: "e2e-login-trace",
        },
      });
    });

    const mockCurrentUser = {
      username: usersData.adminUser.username,
      displayName: "Nguyen Khac Trung",
      email: "nk_trung@brycen.com.vn",
      role: "ADMIN",
      accessScopes: [],
    };

    await page.route("**/api/v1/auth/me", async (route) => {
      const authHeader = route.request().headers()["authorization"] ?? "";

      if (authHeader === `Bearer ${MOCK_ACCESS_TOKEN}`) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          json: mockCurrentUser,
        });
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: "application/json",
        json: {
          timestamp: new Date().toISOString(),
          status: 401,
          error: "UNAUTHORIZED",
          message: "Unauthorized",
          traceId: "e2e-login-trace",
        },
      });
    });

    await page.route("**/api/v1/me", async (route) => {
      const authHeader = route.request().headers()["authorization"] ?? "";

      if (authHeader === `Bearer ${MOCK_ACCESS_TOKEN}`) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          json: mockCurrentUser,
        });
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: "application/json",
        json: {
          timestamp: new Date().toISOString(),
          status: 401,
          error: "UNAUTHORIZED",
          message: "Unauthorized",
          traceId: "e2e-login-trace",
        },
      });
    });

    await test.step("Open the login page", async () => {
      await loginPage.navigate();
      await loginPage.isAtPage();
    });
  });

  test("logs in with seeded credentials through the UI", async () => {
    await test.step("Fill the login form", async () => {
      const status = await loginPage.login(
        usersData.adminUser.username,
        usersData.adminUser.password,
        { expectSuccess: false },
      );
      expect(status).toBe(200);
    });

    await test.step("Wait for redirect after submit", async () => {
      await expect(loginPage.page).toHaveURL(/#\/en\/pm-dashboard\/?$/);
    });
  });

  test("shows a safe error for invalid credentials", async () => {
    await test.step("Submit invalid credentials", async () => {
      const status = await loginPage.login(
        usersData.invalidUser.username,
        usersData.invalidUser.password,
        { expectSuccess: false },
      );
      expect(status).toBe(401);
    });

    await test.step("Verify the error message", async () => {
      await loginPage.isErrorVisible();
    });
  });
});
