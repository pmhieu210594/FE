// @vitest-environment jsdom

import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, clearAccessToken, endpoints } from "../../lib/api";
import { queryClient } from "../../lib/queryClient";
import { logout, useAuth } from "../../hooks/useAuth";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    endpoints: {
      ...actual.endpoints,
      authMe: vi.fn(),
      authLogout: vi.fn(),
    },
    clearAccessToken: vi.fn(),
  };
});

const mockedEndpoints = vi.mocked(endpoints);
const mockedClearAccessToken = vi.mocked(clearAccessToken);

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => {
  queryClient.clear();
  vi.clearAllMocks();
  localStorage.clear();
  globalThis.location.hash = "#/en/login";
});

afterEach(() => {
  queryClient.clear();
});

describe("useAuth", () => {
  it("returns null user when authMe responds 401", async () => {
    mockedEndpoints.authMe.mockRejectedValueOnce(
      new ApiError("Unauthorized", 401, "trace-1", "UNAUTHORIZED"),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns the current user when authMe succeeds", async () => {
    mockedEndpoints.authMe.mockResolvedValueOnce({
      username: "admin",
      displayName: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
      accessScopes: ["role:1"],
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user?.username).toBe("admin");
    expect(result.current.isAuthenticated).toBe(true);
  });
});

describe("logout", () => {
  it("clears client auth state and navigates to login", async () => {
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    mockedEndpoints.authLogout.mockResolvedValueOnce(undefined);

    localStorage.setItem("i18nextLng", "vi");

    await act(async () => {
      await logout();
    });

    expect(mockedEndpoints.authLogout).toHaveBeenCalledOnce();
    expect(mockedClearAccessToken).toHaveBeenCalledOnce();
    expect(setQueryDataSpy).toHaveBeenCalledWith(["me"], null);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["me"] });
    expect(globalThis.location.hash).toBe("#/vi/login");

    setQueryDataSpy.mockRestore();
    invalidateSpy.mockRestore();
  });

  it("clears client auth state even when the backend logout call fails", async () => {
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    mockedEndpoints.authLogout.mockRejectedValueOnce(
      new ApiError("Network unavailable", 500, "trace-2", "INTERNAL_ERROR"),
    );

    localStorage.setItem("i18nextLng", "ja");

    await act(async () => {
      await logout();
    });

    expect(mockedEndpoints.authLogout).toHaveBeenCalledOnce();
    expect(mockedClearAccessToken).toHaveBeenCalledOnce();
    expect(setQueryDataSpy).toHaveBeenCalledWith(["me"], null);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["me"] });
    expect(globalThis.location.hash).toBe("#/ja/login");

    setQueryDataSpy.mockRestore();
    invalidateSpy.mockRestore();
  });
});
