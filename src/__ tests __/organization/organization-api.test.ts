import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { endpoints, type ApiError } from "@/lib/api";

const jsonHeaders = { "Content-Type": "application/json" };

describe("Organization API helpers", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: jsonHeaders,
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists organizations with default active status omitted only when caller omits it", async () => {
    await endpoints.organizations.list({
      keyword: "Acme",
      status: "ACTIVE",
      page: 1,
      size: 10,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/organizations?keyword=Acme&status=ACTIVE&page=1&size=10",
      expect.objectContaining({
        credentials: "include",
        headers: new Headers(),
      }),
    );
  });

  it("gets organization detail by id", async () => {
    await endpoints.organizations.get("org-1");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("creates an organization with request body", async () => {
    await endpoints.organizations.create({
      organizationCode: "ORG-NEW",
      organizationName: "New Organization",
      description: "Description",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/organizations",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          organizationCode: "ORG-NEW",
          organizationName: "New Organization",
          description: "Description",
        }),
      }),
    );
  });

  it("updates an organization with status and optimistic-lock version", async () => {
    await endpoints.organizations.update("org-1", {
      organizationCode: "ORG-UPD",
      organizationName: "Updated Organization",
      description: null,
      status: "ACTIVE",
      version: 3,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          organizationCode: "ORG-UPD",
          organizationName: "Updated Organization",
          description: null,
          status: "ACTIVE",
          version: 3,
        }),
      }),
    );
  });

  it("soft-deletes an organization with version", async () => {
    await endpoints.organizations.softDelete("org-1", { version: 4 });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/delete",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ version: 4 }),
      }),
    );
  });

  it("surfaces backend message key and trace id on conflict", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "Pages.Organization.Conflict.Version" }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
            "X-Trace-Id": "trace-123",
          },
        },
      ),
    );

    await expect(
      endpoints.organizations.update("org-1", {
        organizationCode: "ORG-UPD",
        organizationName: "Updated Organization",
        description: null,
        status: "ACTIVE",
        version: 1,
      }),
    ).rejects.toMatchObject({
      status: 409,
      messageKey: "Pages.Organization.Conflict.Version",
      traceId: "trace-123",
    } satisfies Partial<ApiError>);
  });
});
