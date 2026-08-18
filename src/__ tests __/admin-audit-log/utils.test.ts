import { describe, expect, it } from "vitest";

import { buildSearchParams, parseFilters } from "@/pages/admin-audit-log/utils";

describe("admin-audit-log utils", () => {
  it("parses all filter params from URLSearchParams", () => {
    const filters = parseFilters(
      new URLSearchParams(
        "module=ROLE&operationType=UPDATE&actor=admin&dateFrom=2026-07-09T00%3A00%3A00Z&dateTo=2026-07-09T23%3A59%3A59Z&search=khoa",
      ),
    );

    expect(filters).toEqual({
      module: "ROLE",
      operationType: "UPDATE",
      actor: "admin",
      dateFrom: "2026-07-09T00:00:00Z",
      dateTo: "2026-07-09T23:59:59Z",
      search: "khoa",
    });
  });

  it("omits empty values when building search params", () => {
    const params = buildSearchParams({
      module: "",
      operationType: "",
      actor: "",
      dateFrom: "",
      dateTo: "",
      search: "",
    });

    expect(params.toString()).toBe("");
  });

  it("serializes only non-empty values when building search params", () => {
    const params = buildSearchParams({
      module: "LOGIN",
      operationType: "LOGIN_FAILED",
      actor: "unknown.user",
      dateFrom: "2026-07-09T00:00:00Z",
      dateTo: "2026-07-09T23:59:59Z",
      search: "unknown",
    });

    expect(params.get("module")).toBe("LOGIN");
    expect(params.get("operationType")).toBe("LOGIN_FAILED");
    expect(params.get("actor")).toBe("unknown.user");
    expect(params.get("dateFrom")).toBe("2026-07-09T00:00:00Z");
    expect(params.get("dateTo")).toBe("2026-07-09T23:59:59Z");
    expect(params.get("search")).toBe("unknown");
  });
});
