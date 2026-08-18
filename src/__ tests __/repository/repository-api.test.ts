import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  endpoints,
  setAccessToken,
  clearAccessToken,
  ApiError,
} from "@/lib/api";

const jsonHeaders = { "Content-Type": "application/json" };

describe("Repository API helpers (FULL)", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockImplementation(() => {
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: jsonHeaders,
        }),
      );
    });
    clearAccessToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========================
  // LIST
  // ========================
  it("lists repositories with full query params", async () => {
    await endpoints.repositories.list({
      projectId: "project-1",
      status: "ACTIVE",
      keyword: "repo",
      page: 0,
      size: 20,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/repositories?projectId=project-1&status=ACTIVE&keyword=repo&page=0&size=20",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("lists repositories with empty params (no query string)", async () => {
    await endpoints.repositories.list({});

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/repositories",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("lists repositories with partial params", async () => {
    await endpoints.repositories.list({ keyword: "abc" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/repositories?keyword=abc",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  // ========================
  // GET
  // ========================
  it("gets repository by id", async () => {
    await endpoints.repositories.get("repo-1");

    const calls = (global.fetch as any).mock.calls;
    const [url, options] = calls[calls.length - 1];

    expect(url).toBe("/api/v1/repositories/repo-1");

    expect(options.credentials).toBe("include");
  });

  // ========================
  // CREATE
  // ========================
  it("creates repository with correct payload", async () => {
    const body = {
      projectId: "project-1",
      repo_name_masked: "repo-test",
      host_type: "GITHUB",
      default_branch: "main",
      repo_url_hash: "encrypted-value",
    };

    await endpoints.repositories.create(body);

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/repositories",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  });

  it("creates repository with null optional fields", async () => {
    const body = {
      projectId: "project-1",
      repo_name_masked: "repo-test",
      host_type: "GITHUB",
      default_branch: null,
      repo_url_hash: null,
    };

    await endpoints.repositories.create(body);

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/repositories",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  });

  // ========================
  // UPDATE
  // ========================
  it("updates repository with correct payload", async () => {
    const body = {
      projectId: "project-1",
      repo_name_masked: "repo-updated",
      host_type: "GITHUB",
      default_branch: "develop",
      repo_url_hash: "encrypted-value",
    };

    await endpoints.repositories.update("repo-1", body);

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/repositories/repo-1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(body),
      }),
    );
  });

  // ========================
  // DELETE
  // ========================
  it("uses PUT for soft delete", async () => {
    await endpoints.repositories.softDelete("repo-1");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/repositories/repo-1/delete",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({}),
      }),
    );
  });

  // ========================
  // AUTH HEADER
  // ========================
  it("attaches Authorization header when token exists", async () => {
    setAccessToken("test-token");

    await endpoints.repositories.get("repo-1");

    const [, options] = (global.fetch as any).mock.calls.at(-1);

    const headers = Object.fromEntries(options.headers.entries());

    expect(headers.authorization).toBe("Bearer test-token");

    // const [, options] = (global.fetch as any).mock.calls.at(-1);

    // expect(global.fetch).toHaveBeenCalledWith(
    //   "/api/v1/repositories/repo-1",
    //   expect(options.headers.get("Authorization")).toBe("Bearer test-token"),
    //   // expect.objectContaining({
    //   //   headers: expect.objectContaining({
    //   //     Authorization: "Bearer test-token",
    //   //   }),
    //   // }),
    // );
  });

  it("does not attach Authorization header when token is absent", async () => {
    clearAccessToken();

    await endpoints.repositories.get("repo-1");

    const call = (global.fetch as any).mock.calls[0][1];
    expect(call.headers?.Authorization).toBeUndefined();
  });

  // ========================
  // CONTENT TYPE
  // ========================
  it("sets Content-Type automatically when body exists", async () => {
    const body = {
      projectId: "project-1",
      repo_name_masked: "repo-test",
      host_type: "GITHUB",
      default_branch: "main",
      repo_url_hash: "encrypted-value",
    };

    await endpoints.repositories.create(body);

    const call = (global.fetch as any).mock.calls[0][1];
    expect(call.headers.get("Content-Type")).toBe("application/json");
  });

  // ========================
  // ERROR HANDLING
  // ========================
  it("throws ApiError on non-200 response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Components.Error" }), {
        status: 400,
        headers: jsonHeaders,
      }),
    );

    await expect(endpoints.repositories.get("repo-1")).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it("maps 401 to Unauthorized message key", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("", { status: 401 }),
    );

    try {
      await endpoints.repositories.get("repo-1");
    } catch (e: any) {
      expect(e.messageKey).toContain("Unauthorized");
    }
  });

  it("handles empty response body (204)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    const res = await endpoints.repositories.softDelete("repo-1");
    expect(res).toBeUndefined();
  });

  // ========================
  // SECURITY / DATA
  // ========================
  it("does not mutate request body (immutability)", async () => {
    const body = {
      projectId: "project-1",
      repo_name_masked: "repo-test",
      host_type: "GITHUB",
      default_branch: "main",
      repo_url_hash: "encrypted-value",
    };

    const original = { ...body };

    await endpoints.repositories.create(body);

    expect(body).toEqual(original);
  });

  it("allows different encrypted values for same logical URL (AES behavior)", async () => {
    const body1 = {
      projectId: "project-1",
      repo_name_masked: "repo-test",
      host_type: "GITHUB",
      default_branch: "main",
      repo_url_hash: "enc-1",
    };

    const body2 = {
      ...body1,
      repo_url_hash: "enc-2",
    };

    await endpoints.repositories.create(body1);
    await endpoints.repositories.create(body2);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
