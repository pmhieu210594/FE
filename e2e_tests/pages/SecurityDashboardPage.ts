import { type Locator, type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class SecurityDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page, "/#/en/security-dashboard");
  }

  async isAtPage(): Promise<void> {
    await expect(this.page).toHaveURL(/#\/en\/security-dashboard/);
  }

  get pageTitle(): Locator {
    return this.page.getByText("Security Dashboard", { exact: true });
  }

  get summaryCardTitles(): Locator {
    return this.page.getByText(/Safety Pack Unready|Secret Scan Failures|SAST\/SCA Failures|Open Exceptions/);
  }

  get ticketTableTitle(): Locator {
    return this.page.getByText("Ticket Security Review", { exact: true });
  }

  get projectSelect(): Locator {
    return this.page.getByTestId("project-select");
  }

  get repositorySelect(): Locator {
    return this.page.getByTestId("repository-select");
  }

  get searchBox(): Locator {
    return this.page.getByRole("textbox", { name: "Search" });
  }

  get drawer(): Locator {
    return this.page.locator(".ant-drawer-body");
  }

  get drawerTitle(): Locator {
    return this.page.locator(".ant-drawer-title");
  }

  get openDetailButtons(): Locator {
    return this.page.getByTitle("Ticket detail");
  }

  get exportButton(): Locator {
    return this.page.getByRole("button", { name: /Export CSV/i });
  }

  async selectProject(projectId: string): Promise<void> {
    await this.projectSelect.selectOption(projectId);
  }

  async selectRepository(repositoryId: string): Promise<void> {
    await this.repositorySelect.selectOption(repositoryId);
  }

  async search(value: string): Promise<void> {
    await this.searchBox.fill(value);
    await this.searchBox.press("Enter");
  }

  async openFirstTicketDetail(): Promise<void> {
    await this.openDetailButtons.first().click();
  }
}
