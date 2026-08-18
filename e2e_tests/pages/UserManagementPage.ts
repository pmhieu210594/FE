import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class UserManagementPage extends BasePage {
  private readonly listEndpoint = "/api/v1/admin/user-accounts";

  constructor(page: Page) {
    super(page, "/#/en/admin/user-accounts");
  }

  async openFromDashboard(): Promise<void> {
    const expandSidebarButton = this.page.getByRole("button", {
      name: "Expand sidebar",
    });

    if (await expandSidebarButton.isVisible().catch(() => false)) {
      await expandSidebarButton.click();
    }

    const userAccountsLink = this.page.locator(
      'a[href="#/en/admin/user-accounts"]',
    );
    await expect(userAccountsLink).toBeVisible({ timeout: 20000 });
    await userAccountsLink.click();
    await expect(this.page).toHaveURL(/#\/en\/admin\/user-accounts\/?$/);
  }

  rowByUsername(username: string): Locator {
    return this.page.locator("#user-account-list-table tbody tr", {
      hasText: username,
    }).first();
  }

  statusColumnByUsername(username: string): Locator {
    const row = this.rowByUsername(username);
    return row.locator("td").filter({ hasText: /Active|Inactive/ }).first();
  }

  async expectAccountVisible(username: string, roleName: string) {
    const row = this.rowByUsername(username);
    await expect(row).toBeVisible({ timeout: 20000 });
    await expect(row).toContainText(roleName);
  }

  async assertTeamFieldIsNotShown() {
    await expect(this.page.getByLabel("Team", { exact: true })).toHaveCount(0);
    await expect(this.page.getByText("Team", { exact: true })).toHaveCount(0);
  }

  async openCreate(): Promise<void> {
    // Try multiple selectors using .or() for robustness
    const createButton = this.page
      .getByTestId("user-account-create-button")
      .or(this.page.getByRole("button", { name: /create|add|new|tạo mới|thêm/i }))
      .or(this.page.locator("button").filter({ hasText: /create|add|new|tạo mới|thêm/i }));

    await expect(createButton).toBeVisible({ timeout: 20000 });
    await createButton.click();
  }

  async search(keyword: string) {
    const searchInput = this.page.getByRole("textbox", { name: "Search" });
    await expect(searchInput).toBeVisible({ timeout: 20000 });
    await searchInput.fill(keyword);
    await searchInput.press("Enter");
  }

  async refreshSearch(keyword: string) {
    const searchInput = this.page.getByRole("textbox", { name: "Search" });
    await expect(searchInput).toBeVisible({ timeout: 20000 });
    await searchInput.fill("");
    await searchInput.press("Enter");
    await searchInput.fill(keyword);
    await searchInput.press("Enter");
  }

  async openView(username: string) {
    const row = this.rowByUsername(username);
    await expect(row).toBeVisible({ timeout: 20000 });
    await row.getByRole("button", { name: "View" }).click();
  }

  async openEdit(username: string) {
    const row = this.rowByUsername(username);
    await expect(row).toBeVisible({ timeout: 20000 });
    await row.getByRole("button", { name: "Edit" }).click();
  }

  async openReset(username: string) {
    const row = this.rowByUsername(username);
    await expect(row).toBeVisible({ timeout: 20000 });
    await row.getByRole("button", { name: "Reset password" }).click();
  }

  async toggleActive(username: string) {
    const row = this.rowByUsername(username);
    await expect(row).toBeVisible({ timeout: 20000 });
    await row.getByRole("button", { name: /Deactivate|Reactivate/ }).click();
    const popconfirm = this.page
      .getByRole("tooltip")
      .filter({ hasText: /Deactivate this account\?|Reactivate this account\?/i })
      .last();
    await expect(popconfirm).toBeVisible();
    await popconfirm.getByRole("button", { name: /^OK$/i }).dispatchEvent("click");
  }

  async fillAccountForm(input: {
    username?: string;
    fullname?: string;
    email?: string;
    roleName: string;
    status: "ACTIVE" | "INACTIVE";
    password?: string;
    confirmPassword?: string;
  }) {
    const drawer = await this.waitForAccountDrawer();

    if (input.username !== undefined) {
      const usernameField = await this.firstExisting(drawer, [
        drawer.locator("#username"),
        drawer.getByLabel(/username/i),
        drawer.getByPlaceholder(/username/i),
        drawer.locator('input[name="username"]'),
      ]);
      await expect(usernameField).toBeVisible({ timeout: 20000 });
      await usernameField.fill(input.username);
    }
    if (input.fullname !== undefined) {
      const fullnameField = await this.firstExisting(drawer, [
        drawer.locator("#fullname"),
        drawer.getByLabel(/fullname|member/i),
        drawer.getByPlaceholder(/fullname|member/i),
        drawer.locator('input[name="fullname"]'),
      ]);
      await expect(fullnameField).toBeVisible({ timeout: 20000 });
      await fullnameField.fill(input.fullname);
    }
    if (input.email !== undefined) {
      const emailField = await this.firstExisting(drawer, [
        drawer.locator("#email"),
        drawer.getByLabel(/email/i),
        drawer.getByPlaceholder(/email/i),
        drawer.locator('input[name="email"]'),
      ]);
      await expect(emailField).toBeVisible({ timeout: 20000 });
      await emailField.fill(input.email);
    }
    await this.selectOptionInDrawer(drawer, "#roleId", input.roleName);
    await this.selectOptionInDrawer(
      drawer,
      "#status",
      input.status === "ACTIVE" ? "Active" : "Inactive",
    );
    if (input.password !== undefined) {
      const passwordField = await this.firstExisting(drawer, [
        drawer.locator("#password"),
        drawer.getByLabel(/password/i),
        drawer.getByPlaceholder(/password/i),
        drawer.locator('input[name="password"]'),
      ]);
      await expect(passwordField).toBeVisible({ timeout: 20000 });
      await passwordField.fill(input.password);
    }
    if (input.confirmPassword !== undefined) {
      const confirmPasswordField = await this.firstExisting(drawer, [
        drawer.locator("#confirmPassword"),
        drawer.getByLabel(/confirm password/i),
        drawer.getByPlaceholder(/confirm password/i),
        drawer.locator('input[name="confirmPassword"]'),
      ]);
      await expect(confirmPasswordField).toBeVisible({ timeout: 20000 });
      await confirmPasswordField.fill(input.confirmPassword);
    }
  }

  async fillResetPassword(input: { password: string; confirmPassword: string }) {
    const drawer = await this.waitForAccountDrawer();
    const passwordField = await this.firstExisting(drawer, [
      drawer.locator("#password"),
      drawer.getByLabel(/new password|password/i),
      drawer.getByPlaceholder(/new password|password/i),
      drawer.locator('input[name="password"]'),
    ]);
    await expect(passwordField).toBeVisible({ timeout: 20000 });
    await passwordField.fill(input.password);
    const confirmPasswordField = await this.firstExisting(drawer, [
      drawer.locator("#confirmPassword"),
      drawer.getByLabel(/confirm password/i),
      drawer.getByPlaceholder(/confirm password/i),
      drawer.locator('input[name="confirmPassword"]'),
    ]);
    await expect(confirmPasswordField).toBeVisible({ timeout: 20000 });
    await confirmPasswordField.fill(input.confirmPassword);
  }

  async submitDrawer(action: string) {
    const drawer = await this.waitForAccountDrawer();
    const button = await this.firstExisting(drawer, [
      drawer.getByRole("button", { name: action }),
      drawer.locator("button").filter({ hasText: action }),
      drawer.locator(`button[title="${action}"]`),
    ]);
    await expect(button).toBeVisible({ timeout: 20000 });
    await button.click();
  }

  private async selectOption(selector: string, optionText: string) {
    const select = this.page.locator(selector);
    await expect(select).toBeVisible({ timeout: 20000 });
    await select.click();
    const dropdown = this.page.locator(".ant-select-dropdown").last();
    await expect(dropdown).toBeVisible({ timeout: 20000 });

    const option = dropdown.getByText(optionText, { exact: true }).first();
    await expect(option).toBeVisible({ timeout: 20000 });
    await option.click();
  }

  private async selectOptionInDrawer(
    drawer: Locator,
    selector: string,
    optionText: string,
  ) {
    const select = drawer.locator(selector);
    await expect(select).toBeVisible({ timeout: 20000 });
    await select.click();
    const dropdown = this.page.locator(".ant-select-dropdown").last();
    await expect(dropdown).toBeVisible({ timeout: 20000 });

    const option = dropdown.getByText(optionText, { exact: true }).first();
    await expect(option).toBeVisible({ timeout: 20000 });
    await option.click();
  }

  private async waitForAccountDrawer(): Promise<Locator> {
    const drawer = this.page.locator(".cdrawer-form").last();
    await expect(drawer).toBeVisible({ timeout: 20000 });
    return drawer;
  }

  private async firstExisting(scope: Locator, candidates: Locator[]): Promise<Locator> {
    for (const candidate of candidates) {
      if (await candidate.count().catch(() => 0)) {
        return candidate;
      }
    }
    return scope;
  }
}
