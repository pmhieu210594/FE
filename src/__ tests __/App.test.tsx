import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  logout: vi.fn(),
  useAuthState: {
    isAuthenticated: true,
    isLoading: false,
    user: {
      role: "VIEWER",
    },
  } as {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: { role: "VIEWER" | "EDITOR" | "ADMIN" } | null;
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authMocks.useAuthState,
  logout: authMocks.logout,
}));

vi.mock("@/components/Layout", () => ({
  Layout: () => (
    <div data-testid="layout">
      <Outlet />
    </div>
  ),
}));

vi.mock("@/pages/login/LoginPage", () => ({
  LoginPage: () => <div>login-page</div>,
}));

vi.mock("@/pages/OrganizationPage", () => ({
  OrganizationPage: () => <div>organization-page</div>,
}));

vi.mock("@/pages/user/UserAccountsPage", () => ({
  UserAccountsPage: () => <div>user-accounts-page</div>,
}));

vi.mock("@/pages/RolePage", () => ({
  RolePage: () => <div>role-page</div>,
}));

vi.mock("@/pages/traceability/TraceabilityPage", () => ({
  TraceabilityPage: () => <div>traceability-page</div>,
}));

import App from "@/App";

function renderApp(initialPath = "/en/organizations") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.useAuthState = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        role: "VIEWER",
      },
    };
  });

  it("redirects a non-admin user away from organizations", async () => {
    renderApp();

    expect(await screen.findByText("login-page")).toBeInTheDocument();
    expect(screen.queryByText("organization-page")).not.toBeInTheDocument();
  });

  it("renders the organizations route for an admin user", async () => {
    authMocks.useAuthState = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        role: "ADMIN",
      },
    };

    renderApp();

    expect(await screen.findByText("organization-page")).toBeInTheDocument();
  });

  it("renders the user accounts route for an admin user", async () => {
    authMocks.useAuthState = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        role: "ADMIN",
      },
    };

    renderApp("/en/admin/user-accounts");

    expect(await screen.findByText("user-accounts-page")).toBeInTheDocument();
  });
  it("renders the role route for a viewer user", async () => {
    renderApp("/en/roles");

    expect(await screen.findByText("role-page")).toBeInTheDocument();
    expect(authMocks.logout).not.toHaveBeenCalled();
  });

  it("renders the traceability route for a viewer user", async () => {
    renderApp("/en/traceability");

    expect(await screen.findByText("traceability-page")).toBeInTheDocument();
  });
});
