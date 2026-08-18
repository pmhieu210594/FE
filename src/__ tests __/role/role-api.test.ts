import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { endpoints } from "@/lib/api";

const jsonHeaders = { "Content-Type": "application/json" };

describe("Role API helpers", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: jsonHeaders,
        }),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists roles as a raw list with search and status parameters", async () => {
    await endpoints.roles.list({ keyword: "pm", status: "ACTIVE" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/roles?keyword=pm&status=ACTIVE",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("creates and updates roles with roleName and description", async () => {
    await endpoints.roles.create({ roleName: "PM", description: "Product" });
    await endpoints.roles.update("role-1", {
      roleName: "QA",
      description: "",
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "/api/v1/roles",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ roleName: "PM", description: "Product" }),
      }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "/api/v1/roles/role-1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ roleName: "QA", description: "" }),
      }),
    );
  });

  it("uses PUT for logical delete", async () => {
    await endpoints.roles.logicalDelete("role-1");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/roles/role-1/delete",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({}),
      }),
    );
  });
});
