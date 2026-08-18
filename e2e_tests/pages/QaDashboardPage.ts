import { type Locator, type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class QaDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page, "/#/en/qa-dashboard");
  }

  async isAtPage(): Promise<void> {
    await expect(this.page).toHaveURL(/#\/en\/qa-dashboard/);
  }

  get pageTitle(): Locator {
    return this.page.getByRole("heading", { name: /QA Dashboard/i }).first();
  }

  get acCoverageTitle(): Locator {
    return this.page.getByRole("heading", { name: /Tickets/i });
  }

  get acTableSection(): Locator {
    return this.page.getByRole("table");
  }

  get acTableRows(): Locator {
    return this.page.getByRole("row").filter({ has: this.page.getByRole("cell") });
  }

  get emptyStateText(): Locator {
    return this.page
      .locator("table tbody tr")
      .filter({ has: this.page.getByText(/no data|no results/i) });
  }

  get exportButton(): Locator {
    return this.page.getByRole("button", { name: /Export CSV/i });
  }

  get refreshButton(): Locator {
    return this.page.getByRole("button", { name: /Refresh/i });
  }

  get projectSelect(): Locator {
    return this.page.locator("[data-testid='project-select']");
  }

  async selectProject(projectId: string): Promise<void> {
    await this.projectSelect.selectOption(projectId);
  }
}
