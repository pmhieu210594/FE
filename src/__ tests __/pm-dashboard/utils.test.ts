import { describe, it, expect } from "vitest";
import type { PmDashboardTicketRow } from "@/lib/api";
import {
  scoreBandClasses,
  riskClasses,
  formatScore,
  ageLabel,
  buildEvidenceBottleneck,
  parseFilters,
  buildSearchParams,
  scoreBandLabel,
} from "@/pages/pm-dashboard/utils";

function makeRow(
  overrides: Partial<PmDashboardTicketRow> & {
    ticketId: string;
    externalTicketKey: string;
  },
): PmDashboardTicketRow {
  return {
    projectId: "proj-1",
    projectAlias: "PROJ",
    repositoryId: "repo-1",
    repositoryName: "repo-alpha",
    title: null,
    status: null,
    phaseCode: null,
    phaseName: null,
    phaseDescription: null,
    phaseCreatedAt: null,
    phaseOrder: 1,
    blockedFlag: false,
    waitingReviewFlag: false,
    missingEvidenceCount: 0,
    traceabilityIssueCount: 0,
    openIssueCount: 0,
    riskCount: 0,
    exceptionCount: 0,
    ciFailedCount: 0,
    highestRiskSeverity: null,
    evidenceQualityScore: null,
    scoreBand: null,
    scoreRuleVersion: null,
    ageDays: 0,
    ownerDisplay: "Backend Role",
    periodKey: "2026-06",
    createdAt: "2026-06-25T00:00:00Z",
    updatedAt: null,
    refreshedAt: "2026-06-25T00:00:00Z",
    artifactVersion: null,
    mergedAt: null,
    ...overrides,
  };
}

describe("scoreBandClasses", () => {
  it("maps all five score bands to a non-empty Tailwind class string", () => {
    const bands = ["EXCELLENT", "GOOD", "WARNING", "RISKY", "CRITICAL"];
    for (const band of bands) {
      expect(scoreBandClasses[band]).toBeTruthy();
    }
  });

  it("maps EXCELLENT to emerald and CRITICAL to rose", () => {
    expect(scoreBandClasses["EXCELLENT"]).toContain("emerald");
    expect(scoreBandClasses["CRITICAL"]).toContain("rose");
  });
});

describe("riskClasses", () => {
  it("maps HIGH to orange and CRITICAL to rose", () => {
    expect(riskClasses["HIGH"]).toContain("orange");
    expect(riskClasses["CRITICAL"]).toContain("rose");
  });

  it("maps INFO to slate and LOW to sky", () => {
    expect(riskClasses["INFO"]).toContain("slate");
    expect(riskClasses["LOW"]).toContain("sky");
  });
});

describe("formatScore", () => {
  it("returns the integer as a string without decimals", () => {
    expect(formatScore(0)).toBe("0");
    expect(formatScore(100)).toBe("100");
    expect(formatScore(68)).toBe("68");
  });

  it("returns two decimal places for non-integer values", () => {
    expect(formatScore(78.25)).toBe("78.25");
  });

  it("returns dash for null", () => {
    expect(formatScore(null)).toBe("-");
  });
});

describe("ageLabel", () => {
  it("returns '0d' for zero or negative days", () => {
    expect(ageLabel(0)).toBe("0d");
    expect(ageLabel(-1)).toBe("0d");
  });

  it("appends 'd' suffix for positive values", () => {
    expect(ageLabel(1)).toBe("1d");
    expect(ageLabel(14)).toBe("14d");
  });
});

describe("buildEvidenceBottleneck", () => {
  it("excludes rows with no missing evidence", () => {
    const rows = [
      makeRow({
        ticketId: "t1",
        externalTicketKey: "T-1",
        missingEvidenceCount: 0,
      }),
    ];
    expect(buildEvidenceBottleneck(rows)).toHaveLength(0);
  });

  it("groups rows by repositoryId and sums missing evidence counts", () => {
    const rows = [
      makeRow({
        ticketId: "t1",
        externalTicketKey: "T-1",
        repositoryId: "repo-1",
        repositoryName: "Repo Alpha",
        missingEvidenceCount: 2,
      }),
      makeRow({
        ticketId: "t2",
        externalTicketKey: "T-2",
        repositoryId: "repo-1",
        repositoryName: "Repo Alpha",
        missingEvidenceCount: 3,
      }),
      makeRow({
        ticketId: "t3",
        externalTicketKey: "T-3",
        repositoryId: "repo-2",
        repositoryName: "Repo Beta",
        missingEvidenceCount: 1,
      }),
    ];
    const buckets = buildEvidenceBottleneck(rows);
    expect(buckets).toHaveLength(2);
    const alpha = buckets.find((b) => b.bucketName === "Repo Alpha");
    expect(alpha?.missingEvidenceCount).toBe(5);
  });

  it("sorts by descending missing evidence count", () => {
    const rows = [
      makeRow({
        ticketId: "t1",
        externalTicketKey: "T-1",
        repositoryId: "repo-small",
        repositoryName: "Small",
        missingEvidenceCount: 1,
      }),
      makeRow({
        ticketId: "t2",
        externalTicketKey: "T-2",
        repositoryId: "repo-large",
        repositoryName: "Large",
        missingEvidenceCount: 9,
      }),
    ];
    const buckets = buildEvidenceBottleneck(rows);
    expect(buckets[0].bucketName).toBe("Large");
  });
});

describe("parseFilters", () => {
  it("parses all filter params from URLSearchParams", () => {
    const params = new URLSearchParams(
      "projectId=proj-1&repositoryId=repo-1&scoreBand=GOOD&riskLevel=HIGH&search=abc&page=2&size=50",
    );
    const filters = parseFilters(params);
    expect(filters.projectId).toBe("proj-1");
    expect(filters.repositoryId).toBe("repo-1");
    expect(filters.scoreBand).toBe("GOOD");
    expect(filters.riskLevel).toBe("HIGH");
    expect(filters.search).toBe("abc");
    expect(filters.page).toBe(2);
    expect(filters.size).toBe(50);
  });

  it("defaults to empty strings and page=1 size=20 when params are absent", () => {
    const filters = parseFilters(new URLSearchParams(""));
    expect(filters.projectId).toBe("");
    expect(filters.repositoryId).toBe("");
    expect(filters.scoreBand).toBe("");
    expect(filters.riskLevel).toBe("");
    expect(filters.search).toBe("");
    expect(filters.page).toBe(1);
    expect(filters.size).toBe(25);
  });

  it("clamps page to minimum 1 for zero, negative, or non-numeric values", () => {
    expect(parseFilters(new URLSearchParams("page=0")).page).toBe(1);
    expect(parseFilters(new URLSearchParams("page=-5")).page).toBe(1);
    expect(parseFilters(new URLSearchParams("page=abc")).page).toBe(1);
  });

  it("clamps size to range 1–100", () => {
    expect(parseFilters(new URLSearchParams("size=0")).size).toBe(1);
    expect(parseFilters(new URLSearchParams("size=150")).size).toBe(100);
    expect(parseFilters(new URLSearchParams("size=50")).size).toBe(50);
  });
});

describe("buildSearchParams", () => {
  it("omits default values (empty strings, page=1, size=20) from output", () => {
    const params = buildSearchParams({
      projectId: "",
      repositoryId: "",
      scoreBand: "",
      riskLevel: "",
      search: "",
      page: 1,
      size: 20,
    });
    expect(params.toString()).toBe("");
  });

  it("includes non-default values in output", () => {
    const params = buildSearchParams({
      projectId: "proj-1",
      repositoryId: "repo-1",
      scoreBand: "GOOD",
      riskLevel: "HIGH",
      search: "auth",
      page: 3,
      size: 50,
    });
    expect(params.get("projectId")).toBe("proj-1");
    expect(params.get("repositoryId")).toBe("repo-1");
    expect(params.get("scoreBand")).toBe("GOOD");
    expect(params.get("riskLevel")).toBe("HIGH");
    expect(params.get("search")).toBe("auth");
    expect(params.get("page")).toBe("3");
    expect(params.get("size")).toBe("50");
  });
});

describe("scoreBandLabel", () => {
  it("returns the band string when provided", () => {
    expect(scoreBandLabel("GOOD")).toBe("GOOD");
    expect(scoreBandLabel("CRITICAL")).toBe("CRITICAL");
  });

  it("returns dash for null", () => {
    expect(scoreBandLabel(null)).toBe("-");
  });
});
