import { type Page } from "@playwright/test";

export class BasePage {
  constructor(
    public readonly page: Page,
    protected readonly url: string,
  ) {}

  async navigate() {
    await this.page.goto(this.url, { waitUntil: "commit" });
  }
}
