// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "@/pages/HomePage";
import { useAuth, logout } from "@/hooks/useAuth";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) => {
      const dict: Record<string, string> = {
        "Pages.Home.title": "Workspace home",
        "Pages.Home.description": "This is the home page.",
        "Pages.Home.welcome": `Welcome, ${options?.name ?? "Guest"}!`,
        "Pages.Home.body": "Home body text.",
        "Layout.logout": "Logout",
      };
      return dict[key] ?? key;
    },
  }),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedLogout = vi.mocked(logout);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("HomePage", () => {
  it("renders the current user's display name and logs out on click", async () => {
    mockedUseAuth.mockReturnValue({
      user: {
        username: "alice",
        displayName: "Alice Example",
        email: "alice@example.com",
        role: "EDITOR",
        accessScopes: [],
      },
      isAuthenticated: true,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<HomePage />);

    expect(screen.getByText("Workspace home")).toBeInTheDocument();
    expect(screen.getByText("Welcome, Alice Example!")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(mockedLogout).toHaveBeenCalledOnce();
  });

  it("falls back to username when display name is missing", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        username: "editor",
        displayName: null,
        email: "editor@example.com",
        role: "EDITOR",
        accessScopes: [],
      },
      isAuthenticated: true,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<HomePage />);

    expect(screen.getByText("Welcome, editor!")).toBeInTheDocument();
  });
});
