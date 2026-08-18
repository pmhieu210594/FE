import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { endpoints, setAccessToken } from "@/lib/api";

describe("team API endpoint helpers", () => {
  beforeEach(() => {
    setAccessToken("team-api-test-token");
    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it("calls Team list with keyword/status/page/size query params", async () => {
    await endpoints.teams.list({
      keyword: "UI_TEAM",
      status: "ACTIVE",
      page: 1,
      size: 25,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/teams?keyword=UI_TEAM&status=ACTIVE&page=1&size=25",
      expect.objectContaining({
        credentials: "include",
        headers: expect.any(Headers),
      }),
    );
  });

  it("calls Team CRUD endpoints with the expected HTTP methods", async () => {
    await endpoints.teams.get("team-1");
    await endpoints.teams.create({
      teamCode: "UI_TEAM_001",
      teamName: "UI Team",
      description: "Desc",
    });
    await endpoints.teams.update("team-1", {
      teamCode: "UI_TEAM_002",
      teamName: "UI Team Updated",
      description: "Updated",
      status: "ACTIVE",
      version: 3,
    });
    await endpoints.teams.softDelete("team-1", { version: 4 });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "/api/v1/teams/team-1",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "/api/v1/teams",
      expect.objectContaining({ method: "POST" }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      "/api/v1/teams/team-1",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      4,
      "/api/v1/teams/team-1/delete",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("calls Team member endpoints with the expected HTTP methods", async () => {
    await endpoints.teams.listMembers("team-1");
    await endpoints.teams.addMember("team-1", {
      memberKey: "member-1",
      roleId: "role-dev",
    });
    await endpoints.teams.updateMemberRole("team-1", "team-member-1", {
      roleId: "role-qa",
      version: 7,
    });
    await endpoints.teams.removeMember("team-1", "team-member-1", {
      version: 8,
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "/api/v1/teams/team-1/members",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "/api/v1/teams/team-1/members",
      expect.objectContaining({ method: "POST" }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      "/api/v1/teams/team-1/members/team-member-1",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      4,
      "/api/v1/teams/team-1/members/team-member-1/delete",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("sends authorization and JSON body for Team create", async () => {
    await endpoints.teams.create({
      teamCode: "UI_TEAM_001",
      teamName: "UI Team",
      description: "Desc",
    });

    const [, init] = vi.mocked(global.fetch).mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer team-api-test-token");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init?.body).toBe(
      JSON.stringify({
        teamCode: "UI_TEAM_001",
        teamName: "UI Team",
        description: "Desc",
      }),
    );
  });
});
