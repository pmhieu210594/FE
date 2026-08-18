// @vitest-environment jsdom

import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "../../pages/login/LoginPage";
import { ApiError, endpoints } from "../../lib/api";
import { queryClient } from "../../lib/queryClient";
import { useAuth } from "../../hooks/useAuth";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    endpoints: {
      ...actual.endpoints,
      authLogin: vi.fn(),
    },
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string; name?: string }) => {
      const dict: Record<string, string> = {
        "Pages.Login.title": "Sign in to EDCAP",
        "Pages.Login.description":
          "Use your EDCAP account to access the workspace.",
        "Pages.Login.formTitle": "Welcome back",
        "Pages.Login.formDescription":
          "Enter your username and password to continue.",
        "Pages.Login.username": "Username",
        "Pages.Login.usernamePlaceholder": "Enter your username",
        "Pages.Login.password": "Password",
        "Pages.Login.passwordPlaceholder": "Enter your password",
        "Pages.Login.showPassword": "Show password",
        "Pages.Login.hidePassword": "Hide password",
        "Pages.Login.signIn": "Sign in",
        "Pages.Login.signingIn": "Signing in...",
        "Pages.Login.loginFailed": "Login failed. Please try again.",
        "Pages.Login.secureAccessTitle": "Secure access",
        "Pages.Login.secureAccessBody":
          "Signed-in users receive a short-lived bearer token for the current session.",
        "Pages.Login.temporaryLandingTitle": "Temporary landing",
        "Pages.Login.temporaryLandingBody":
          "Non-admin users are routed here while the dedicated home route is being finalized.",
        "Pages.Home.title": "Workspace home",
        "Pages.Home.description":
          "This is the temporary landing page for non-admin users.",
        "Pages.Home.body":
          "The dedicated home route will be introduced in a later phase.",
        "Layout.logout": "Logout",
        "Layout.guest": "Guest",
        "Pages.Errors.INVALID_CREDENTIALS": "Invalid username or password.",
        "Pages.Errors.ACCOUNT_TEMPORARILY_UNAVAILABLE":
          "This account is temporarily unavailable.",
        "Pages.Errors.auth.account_temporarily_unavailable":
          "This account is temporarily unavailable.",
        "Pages.Errors.VALIDATION_ERROR":
          "Validation failed. Please check the highlighted fields.",
      };
      return dict[key] ?? options?.defaultValue ?? key;
    },
  }),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedEndpoints = vi.mocked(endpoints);

function renderLogin() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/en/login"]}>
        <Routes>
          <Route path="/:lang/login" element={<LoginPage />} />
          <Route path="/:lang/admin" element={<div>PM_DASHBOARD_PAGE</div>} />
          <Route path="/:lang/dashboard" element={<div>DASHBOARD_PAGE</div>} />
          <Route
            path="/:lang/pm-dashboard"
            element={<div>PM_DASHBOARD_PAGE</div>}
          />
          <Route path="/:lang" element={<div>HOME_PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  queryClient.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  queryClient.clear();
});

describe("LoginPage", () => {
  it("keeps submit disabled until both fields are filled", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderLogin();
    const user = userEvent.setup();

    const submit = screen.getByRole("button", { name: "Sign in" });
    expect(submit).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "alice",
    );
    expect(submit).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "secret",
    );
    expect(submit).toBeEnabled();
  });

  it("masks password by default and toggles visibility", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderLogin();
    const user = userEvent.setup();

    const password = screen.getByPlaceholderText("Enter your password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("disables duplicate submit while login is pending", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockedEndpoints.authLogin.mockReturnValue(new Promise(() => undefined));

    renderLogin();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "alice",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "secret",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByRole("button", { name: "Signing in..." }),
    ).toBeDisabled();
    expect(mockedEndpoints.authLogin).toHaveBeenCalledOnce();
  });

  it("localizes backend 401 error codes", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockedEndpoints.authLogin.mockRejectedValueOnce(
      new ApiError(
        "INVALID_CREDENTIALS",
        401,
        "trace-1",
        "INVALID_CREDENTIALS",
      ),
    );

    renderLogin();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "alice",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "wrong",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await screen.findByText("Invalid username or password.");
  });

  it("normalizes lowercase auth error keys from the backend", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockedEndpoints.authLogin.mockRejectedValueOnce(
      new ApiError(
        "auth.account_temporarily_unavailable",
        401,
        "trace-2",
        "auth.account_temporarily_unavailable",
      ),
    );

    renderLogin();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "alice",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "wrong",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await screen.findByText("This account is temporarily unavailable.");
  });

  it("redirects admin users to admin home after success", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockedEndpoints.authLogin.mockResolvedValueOnce({
      accessToken: "token-admin",
      refreshToken: "refresh-admin",
      tokenType: "Bearer",
      expiresInSeconds: 3600,
      user: {
        username: "admin",
        displayName: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
        accessScopes: [],
      },
      redirectTo: "/admin",
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "admin",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "secret",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await screen.findByText("PM_DASHBOARD_PAGE");
  });

  it("redirects non-admin users to the temporary home page", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockedEndpoints.authLogin.mockResolvedValueOnce({
      accessToken: "token-user",
      refreshToken: "refresh-user",
      tokenType: "Bearer",
      expiresInSeconds: 3600,
      user: {
        username: "editor",
        displayName: "Editor User",
        email: "editor@example.com",
        role: "EDITOR",
        accessScopes: [],
      },
      redirectTo: "/",
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "editor",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "secret",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await screen.findByText("DASHBOARD_PAGE");
  });

  it("redirects PM users to the PM dashboard after success", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockedEndpoints.authLogin.mockResolvedValueOnce({
      accessToken: "token-pm",
      refreshToken: "refresh-pm",
      tokenType: "Bearer",
      expiresInSeconds: 3600,
      user: {
        username: "pm",
        displayName: "PM User",
        email: "pm@example.com",
        role: "PM",
        accessScopes: [],
      },
      redirectTo: "/pm-dashboard",
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Enter your username"), "pm");
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "secret",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await screen.findByText("DASHBOARD_PAGE");
  });

  it("redirects authenticated users before rendering the form", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        username: "admin",
        displayName: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
        accessScopes: [],
      },
      isAuthenticated: true,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderLogin();

    return waitFor(() => {
      expect(screen.getByText("PM_DASHBOARD_PAGE")).toBeInTheDocument();
    });
  });
});
