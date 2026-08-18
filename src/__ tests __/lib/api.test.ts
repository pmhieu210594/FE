import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  api,
  clearAccessToken,
  endpoints,
  getAccessToken,
  hasAccessToken,
  setAccessToken,
} from "@/lib/api";
import { KEY_REFRESH_TOKEN, KEY_TOKEN } from "@/utils/variable";

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

beforeEach(() => {
  clearAccessToken();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("api", () => {
  it("adds authorization headers when an access token is set", async () => {
    setAccessToken("token-123");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        username: "alice",
        displayName: "Alice",
        email: "alice@example.com",
        role: "ADMIN",
        accessScopes: [],
      }),
    );

    await endpoints.authMe();

    const requestInit = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/auth/me",
      expect.any(Object),
    );
    expect(requestInit.credentials).toBe("include");
    expect((requestInit.headers as Headers).get("Authorization")).toBe(
      "Bearer token-123",
    );
  });

  it("returns undefined for 204 responses and sends JSON bodies", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await api.post<void>("/api/v1/auth/logout", {
      reason: "test",
    });

    expect(result).toBeUndefined();
    const requestInit = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/auth/logout",
      expect.any(Object),
    );
    expect(requestInit.method).toBe("POST");
    expect(requestInit.body).toBe(JSON.stringify({ reason: "test" }));
    expect((requestInit.headers as Headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("throws ApiError with messageKey and traceId when the server responds with an error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        { message: "Denied", error: "DENIED" },
        {
          status: 403,
          headers: { "X-Trace-Id": "trace-99" },
        },
      ),
    );

    await expect(api.get("/api/v1/health")).rejects.toMatchObject({
      status: 403,
      traceId: "trace-99",
      messageKey: "Denied",
    });
  });

  it("keeps ApiError instanceof checks working in the browser", () => {
    const error = new ApiError("Denied", 401, "trace-1", "INVALID_CREDENTIALS");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it("tracks access token state helpers", () => {
    expect(hasAccessToken()).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem(KEY_TOKEN)).toBeNull();

    setAccessToken("abc");
    localStorage.setItem(KEY_REFRESH_TOKEN, "refresh-abc");
    expect(hasAccessToken()).toBe(true);
    expect(getAccessToken()).toBe("abc");
    expect(localStorage.getItem(KEY_TOKEN)).toBe("abc");
    expect(localStorage.getItem(KEY_REFRESH_TOKEN)).toBe("refresh-abc");

    clearAccessToken();
    expect(hasAccessToken()).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem(KEY_TOKEN)).toBeNull();
    expect(localStorage.getItem(KEY_REFRESH_TOKEN)).toBeNull();
  });

  it("serializes user account role filters as repeated roleIds parameters", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        items: [],
        page: 0,
        size: 25,
        totalElements: 0,
        totalPages: 0,
      }),
    );

    await endpoints.userAccounts.list({
      keyword: "admin",
      status: "ACTIVE",
      roleIds: ["role-admin", "role-dev"],
      page: 0,
      size: 25,
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/admin/user-accounts?keyword=admin&status=ACTIVE&roleIds=role-admin&roleIds=role-dev&page=0&size=25",
      expect.any(Object),
    );
  });

  it("restores the stored access token after the module is reloaded", async () => {
    localStorage.setItem(KEY_TOKEN, "persisted-token");
    vi.resetModules();

    const reloadedApi = await import("@/lib/api");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        username: "alice",
        displayName: "Alice",
        email: "alice@example.com",
        role: "ADMIN",
        accessScopes: [],
      }),
    );

    expect(reloadedApi.getAccessToken()).toBe("persisted-token");

    await reloadedApi.endpoints.authMe();

    const requestInit = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect((requestInit.headers as Headers).get("Authorization")).toBe(
      "Bearer persisted-token",
    );
  });
});
