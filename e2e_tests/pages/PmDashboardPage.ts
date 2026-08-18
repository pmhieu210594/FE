import { type Locator, type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class PmDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page, "/#/en/pm-dashboard");
  }

  async isAtPage(): Promise<void> {
    await expect(this.page).toHaveURL(/#\/en\/pm-dashboard/);
  }

  get searchInput(): Locator {
    return this.page.getByPlaceholder("Search");
  }

  get allTicketsHeading(): Locator {
    return this.page.getByText("List of tickets", { exact: true });
  }

  get blockedTicketsCardTitle(): Locator {
    // title is localized and may vary; match common variants used in UI
    return this.page.getByText(/tickets (are stuck|blocked)|tickets blocked/i);
  }

  get ticketRows(): Locator {
    return this.page.locator("tbody tr");
  }

  get emptyStateText(): Locator {
    // AllTicketsTable renders this in a `div.py-10.text-center`; a second
    // instance may appear elsewhere on the page so we use `.first()` to avoid
    // strict-mode violations.
    return this.page
      .getByText("No tickets match the current filters.", { exact: true })
      .first();
  }

  get drawer(): Locator {
    return this.page.locator(".ant-drawer-body");
  }

  /** The antd Drawer header title — where externalTicketKey is rendered. */
  get drawerTitle(): Locator {
    return this.page.locator(".ant-drawer-title");
  }

  get exportButton(): Locator {
    return this.page.getByRole("button", { name: /Export CSV/i });
  }

  get refreshButton(): Locator {
    return this.page.getByRole("button", { name: /Refresh/i });
  }

  async search(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }

  async clickFirstTicketRow(): Promise<void> {
    // Try common accessible button names first, then fall back to title match.
    const btnByRole = this.page.getByRole("button", { name: /view detail|view details|xem chi tiết|xem/i });
    if ((await btnByRole.count()) > 0) {
      await btnByRole.first().click();
      return;
    }

    await this.page.getByTitle(/view detail|view details|xem chi tiết/i).first().click();
  }
}
