import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { endpoints } from "@/lib/api";

const jsonHeaders = { "Content-Type": "application/json" };

describe("Project API helpers", () => {
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

  it("lists projects with customer, keyword, status, page and size parameters", async () => {
    await endpoints.projects.list({
      customerId: "customer-1",
      keyword: "alpha",
      status: "ACTIVE",
      page: 0,
      size: 25,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/projects?customerId=customer-1&keyword=alpha&status=ACTIVE&page=0&size=25",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("gets, creates and updates projects with the expected payloads", async () => {
    const body = {
      customerId: "customer-1",
      projectAlias: "Project Alpha",
      projectType: "Internal",
      riskLevel: "HIGH" as const,
      teamIds: ["team-1", "team-2"],
    };

    await endpoints.projects.get("project-1");
    await endpoints.projects.create(body);
    await endpoints.projects.update("project-1", {
      ...body,
      projectAlias: "Project Beta",
      teamIds: ["team-2"],
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "/api/v1/projects/project-1",
      expect.objectContaining({
        credentials: "include",
      }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "/api/v1/projects",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      "/api/v1/projects/project-1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          ...body,
          projectAlias: "Project Beta",
          teamIds: ["team-2"],
        }),
      }),
    );
  });

  it("uses PUT for soft delete", async () => {
    await endpoints.projects.softDelete("project-1");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/projects/project-1/delete",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({}),
      }),
    );
  });
});
