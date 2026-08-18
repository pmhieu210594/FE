import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class LoginPage extends BasePage {
  readonly usernameInputSelector = 'input[placeholder="Enter your username"]';
  readonly passwordInputSelector = 'input[placeholder="Enter your password"]';
  readonly submitButtonSelector = 'button:has-text("Sign in")';

  constructor(page: Page) {
    super(page, "/#/en/login");
  }

  async isAtPage(): Promise<boolean> {
    await expect(this.page).toHaveURL(/#\/en\/login\/?$/);
    return true;
  }

  async login(
    username: string,
    password: string,
    options?: {
      expectSuccess?: boolean;
      successUrl?: RegExp | string;
      timeoutMs?: number;
    },
  ): Promise<number> {
    const usernameInput = await this.getUsernameInput();
    const passwordInput = await this.getPasswordInput();
    const submitBtn = await this.getSubmitButton();

    await usernameInput.fill(username);
    await passwordInput.fill(password);
    const loginResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/auth/login") &&
        response.request().method() === "POST",
    );
    await submitBtn.click();
    const response = await loginResponse;

    if (options?.expectSuccess === false) return response.status();

    const successUrl = options?.successUrl ?? /#\/en\/pm-dashboard\/?$/;
    const timeoutMs = options?.timeoutMs ?? 15_000;
    await expect(this.page).toHaveURL(successUrl, { timeout: timeoutMs });
    return response.status();
  }

  async isErrorVisible(message?: string): Promise<boolean> {
    const errorMessage = this.page.getByText(
      message ?? "Invalid username or password.",
      {
        exact: true,
      },
    );
    await expect(errorMessage).toBeVisible();
    return await errorMessage.isVisible();
  }

  private async getUsernameInput(): Promise<Locator> {
    await this.page.waitForSelector(this.usernameInputSelector, {
      state: "visible",
    });
    return this.page.locator(this.usernameInputSelector);
  }

  private async getPasswordInput(): Promise<Locator> {
    await this.page.waitForSelector(this.passwordInputSelector, {
      state: "visible",
    });
    return this.page.locator(this.passwordInputSelector);
  }

  private async getSubmitButton(): Promise<Locator> {
    await this.page.waitForSelector(this.submitButtonSelector, {
      state: "visible",
    });
    return this.page.locator(this.submitButtonSelector);
  }
}
