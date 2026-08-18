import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import i18next from "i18next";
import { endpoints, type ApiError } from "@/lib/api";

const jsonHeaders = { "Content-Type": "application/json" };

describe("Customer API helpers", () => {
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

  it("lists customers with organization, keyword, classification, status, page, and pageSize", async () => {
    await endpoints.customers.list({
      organizationId: "org-1",
      keyword: "Brycen",
      classification: "INTERNAL",
      status: "ACTIVE",
      page: 2,
      pageSize: 25,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/customers?organizationId=org-1&keyword=Brycen&classification=INTERNAL&status=ACTIVE&page=2&pageSize=25",
      expect.objectContaining({
        credentials: "include",
        headers: expect.any(Headers),
      }),
    );
  });

  it("omits empty optional list query parameters", async () => {
    await endpoints.customers.list({ status: "ACTIVE", page: 0, pageSize: 25 });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/customers?status=ACTIVE&page=0&pageSize=25",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("gets customer detail by id", async () => {
    await endpoints.customers.get("customer-1");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/customers/customer-1",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("creates a customer with request body", async () => {
    await endpoints.customers.create({
      organizationId: "org-1",
      customerCode: "CUS-001",
      customerAlias: "Brycen VN",
      classification: "INTERNAL",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/customers",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          organizationId: "org-1",
          customerCode: "CUS-001",
          customerAlias: "Brycen VN",
          classification: "INTERNAL",
        }),
      }),
    );
  });

  it("updates a customer with optimistic-lock version", async () => {
    await endpoints.customers.update("customer-1", {
      organizationId: "org-1",
      customerCode: "CUS-001",
      customerAlias: "Brycen VN Updated",
      classification: "EXTERNAL",
      version: 7,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/customers/customer-1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          organizationId: "org-1",
          customerCode: "CUS-001",
          customerAlias: "Brycen VN Updated",
          classification: "EXTERNAL",
          version: 7,
        }),
      }),
    );
  });

  it("soft-deletes a customer with optimistic-lock version", async () => {
    await endpoints.customers.softDelete("customer-1", { version: 8 });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/customers/customer-1/delete",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ version: 8 }),
      }),
    );
  });

  it("surfaces backend message key and trace id on conflict", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "Pages.Customer.Conflict.Version" }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
            "X-Trace-Id": "trace-customer-123",
          },
        },
      ),
    );

    await expect(
      endpoints.customers.update("customer-1", {
        organizationId: "org-1",
        customerCode: "CUS-001",
        customerAlias: "Brycen VN",
        classification: "INTERNAL",
        version: 1,
      }),
    ).rejects.toMatchObject({
      status: 409,
      messageKey: "Pages.Customer.Conflict.Version",
      traceId: "trace-customer-123",
    } satisfies Partial<ApiError>);
  });

  it("translates customer error keys before throwing", async () => {
    vi.spyOn(i18next, "t").mockImplementation(((key: string | string[]) => {
      if (Array.isArray(key)) {
        return key[0] ?? "";
      }
      if (key === "Pages.Customer.Conflict.Version") {
        return "Customer was updated by another user. Please reload and try again.";
      }
      return key;
    }) as typeof i18next.t);
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "Pages.Customer.Conflict.Version" }),
        {
          status: 409,
          headers: jsonHeaders,
        },
      ),
    );

    await expect(
      endpoints.customers.update("customer-1", {
        organizationId: "org-1",
        customerCode: "CUS-001",
        customerAlias: "Brycen VN",
        classification: "INTERNAL",
        version: 1,
      }),
    ).rejects.toMatchObject({
      message:
        "Customer was updated by another user. Please reload and try again.",
      messageKey: "Pages.Customer.Conflict.Version",
    } satisfies Partial<ApiError>);
  });
});
