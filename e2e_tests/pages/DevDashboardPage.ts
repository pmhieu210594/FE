import { type Locator, type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class DevDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page, "/#/en/development-dashboard");
  }

  async isAtPage(): Promise<void> {
    await expect(this.page).toHaveURL(/#\/en\/development-dashboard/);
  }

  get pageTitle(): Locator {
    return this.page.getByText("Development Dashboard", { exact: true });
  }

  get ciFailureCardTitle(): Locator {
    return this.page.getByText("CI failures", { exact: true });
  }

  get reviewCommentCardTitle(): Locator {
    // "Review comments" also appears as a ticket-table column header, so scope to the first match.
    return this.page.getByText("Review comments", { exact: true }).first();
  }

  get parserErrorCardTitle(): Locator {
    return this.page.getByText("Parser errors", { exact: true });
  }

  get ticketRows(): Locator {
    return this.page.locator("table tbody tr");
  }

  get exportButton(): Locator {
    return this.page.getByRole("button", { name: /Export CSV/i });
  }

  get projectSelect(): Locator {
    return this.page.getByTestId("project-select");
  }

  get repositorySelect(): Locator {
    return this.page.getByTestId("repository-select");
  }

  get ciStatusSelect(): Locator {
    return this.page.getByTestId("ci-status-select");
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

  async selectCiStatus(status: string): Promise<void> {
    await this.ciStatusSelect.selectOption(status);
  }

  async clickFirstTicketRow(): Promise<void> {
    await this.ticketRows
      .first()
      .getByRole("button", { name: /view detail/i })
      .click();
  }
}