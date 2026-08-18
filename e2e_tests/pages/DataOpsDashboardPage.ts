import { type Locator, type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class DataOpsDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page, "/#/en/data-ops-dashboard");
  }

  async isAtPage(): Promise<void> {
    await expect(this.page).toHaveURL(/#\/en\/data-ops-dashboard/);
  }

  get pageTitle(): Locator {
    return this.page.getByText("Data Ops Dashboard", { exact: true });
  }

  get summaryCards(): Locator {
    return this.page.getByTestId("data-ops-summary-cards");
  }

  get projectSelect(): Locator {
    return this.page.getByTestId("project-select");
  }

  get repositorySelect(): Locator {
    return this.page.getByTestId("repository-select");
  }

  get connectorSelect(): Locator {
    return this.page.getByTestId("connector-select");
  }

  get viewRepositoryButtons(): Locator {
    return this.page.getByRole("button", { name: /view repository/i });
  }

  get searchBox(): Locator {
    return this.page.getByRole("textbox").first();
  }

  get drawer(): Locator {
    return this.page.locator(".ant-drawer-body");
  }

  get drawerTitle(): Locator {
    return this.page.locator(".ant-drawer-title");
  }

  async selectProject(projectId: string): Promise<void> {
    await this.projectSelect.selectOption(projectId);
  }

  async selectRepository(repositoryId: string): Promise<void> {
    await this.repositorySelect.selectOption(repositoryId);
  }

  async clickFirstViewRepositoryButton(): Promise<void> {
    await this.viewRepositoryButtons.first().click();
  }
}
