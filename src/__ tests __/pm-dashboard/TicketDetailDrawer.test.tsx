import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  endpoints,
  type PmDashboardTicketDetail,
  type TraceabilityResponse,
} from "@/lib/api";

import { TicketDetailDrawer } from "@/pages/pm-dashboard/components/TicketDetailDrawer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

const detail = {
  row: {
    ticketId: "ticket-1",
    projectId: "project-1",
    projectAlias: "Project Alpha",
    repositoryId: "repo-1",
    repositoryName: "Repo Alpha",
    externalTicketKey: "PM-1",
    title: "PM Dashboard ticket",
    phaseCode: "DONE",
    phaseName: "Done",
    phaseDescription: "Done phase",
    phaseCreatedAt: "2026-06-20T00:00:00Z",
    phaseOrder: 4,
    blockedFlag: false,
    waitingReviewFlag: false,
    missingEvidenceCount: 0,
    traceabilityIssueCount: 0,
    openIssueCount: 2,
    riskCount: 0,
    exceptionCount: 0,
    ciFailedCount: 0,
    highestRiskSeverity: null,
    evidenceQualityScore: 88,
    scoreBand: "A",
    scoreRuleVersion: "v1",
    ageDays: 2,
    ownerDisplay: "Owner A",
    periodKey: "2026-06",
    status: "DONE",
    createdAt: "2026-06-25T10:00:00Z",
    updatedAt: "2026-06-25T10:00:00Z",
    refreshedAt: "2026-06-25T10:00:00Z",
    artifactVersion: 1,
    mergedAt: "2026-06-25T10:00:00Z",
  },
  createdAt: "2026-06-24T10:00:00Z",
  ownerDisplay: "Owner A",
  reviewCount: 2,
  missingEvidenceItems: [],
  riskItems: [],
  exceptionItems: [],
  issueItems: [
    {
      ticketIssueId: "issue-1",
      ticketId: "ticket-1",
      repositoryId: "repo-1",
      sourceType: "SPEC_PACK",
      issueOrder: 1,
      issueKey: "OI-PARSER-SPEC-PACK-1",
      issueTitle:
        "No open issue remains after aligning the requirement and database design for Phase 1",
      issueImpact: "None",
      issueOwner: "N/A",
      issueStatus: "Closed",
      issueSummary:
        "OI-PARSER-SPEC-PACK-1 | No open issue remains after aligning the requirement and database design for Phase 1 | impact=None | owner=N/A | status=Closed",
      sourcePath: "docs/changes/PARSER-SPEC-PACK/spec-pack.md",
      collectedAt: "2026-06-25T10:00:00Z",
    },
    {
      ticketIssueId: "issue-2",
      ticketId: "ticket-1",
      repositoryId: "repo-1",
      sourceType: "REPORT",
      issueOrder: 1,
      issueKey: null,
      issueTitle: "Need to confirm rollback note before release",
      issueImpact: "Medium",
      issueOwner: "PM",
      issueStatus: "Open",
      issueSummary:
        "Need to confirm rollback note before release | impact=Medium | owner=PM | status=Open",
      sourcePath: "docs/changes/PARSER-REPORT/report.md",
      collectedAt: "2026-06-25T10:00:00Z",
    },
  ],
  scoreBreakdown: {
    specScore: 10,
    planScore: 10,
    reviewScore: 10,
    selfReviewScore: 10,
    testScore: 10,
    ciScore: 10,
    blackboxScore: 10,
    reportScore: 8,
  },
  traceabilityUrl: "/traceability/ticket-1",
} satisfies PmDashboardTicketDetail;

const traceabilityResponse = {
  summary: {
    ticketId: "ticket-1",
    externalTicketKey: "PM-1",
    title: "PM Dashboard ticket",
    completenessPercent: 42,
    foundCount: 1,
    expectedCount: 2,
    artifactCount: 1,
    prCount: 0,
    commitCount: 0,
    ciCount: 0,
    brokenLinkCount: 1,
    reviewRoundCount: 0,
  },
  artifacts: [],
  pullRequests: [],
  commits: [],
  ciRuns: [],
  links: [],
  brokenLinks: [
    {
      code: "SELF_REVIEW-PARSER",
      item: "Self Review",
      severity: "ERROR" as const,
      message:
        "Self Review is missing required section(s): additional_test_this_time, phase_validation_summary, release_readiness, rollback_notes, reviewer_signoff, trace_id",
    },
  ],
  timelineEvents: [],
  reviewComments: [],
} satisfies TraceabilityResponse;

vi.spyOn(endpoints.evidenceQualityScores, "getLatest").mockResolvedValue({
  ticketId: "ticket-1",
  score: 88,
  band: "A",
  breakdown: [],
  missing: [],
  parseErrors: [],
  traceIds: [],
  scoreRuleVersion: "v1",
  snapshotState: "READY",
  calculatedAt: "2026-06-25T10:00:00Z",
});

vi.spyOn(endpoints.traceability, "get").mockResolvedValue(traceabilityResponse);

function renderDrawer() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/pm-dashboard"]}>
        <Routes>
          <Route
            path="/:lang/pm-dashboard"
            element={
              <TicketDetailDrawer
                ticketId="ticket-1"
                detail={detail}
                isLoading={false}
                isError={false}
                onClose={vi.fn()}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TicketDetailDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows only the missing sections summary for parser traceability errors", async () => {
    renderDrawer();

    expect(await screen.findByText("Self Review")).toBeInTheDocument();
    await waitFor(() =>
      expect(endpoints.traceability.get).toHaveBeenCalledWith("ticket-1"),
    );

    expect(
      screen.getByText("Traceability issues (1)", {
        selector: ".inline-flex",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Open issues (1)", {
        selector: ".inline-flex",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryAllByText((_, element) =>
        Boolean(
          element?.textContent?.includes("Create at") &&
          element?.textContent?.includes("24/06/2026 17:00:00"),
        ),
      ),
    ).not.toHaveLength(0);
    expect(
      screen.queryAllByText((_, element) =>
        Boolean(
          element?.textContent?.includes("Phase") &&
          element?.textContent?.includes("Done"),
        ),
      ),
    ).not.toHaveLength(0);
    expect(
      screen.queryAllByText((_, element) =>
        Boolean(
          element?.textContent?.includes("Description") &&
          element?.textContent?.includes("Done phase"),
        ),
      ),
    ).not.toHaveLength(0);
    expect(screen.getByText("Open issues")).toBeInTheDocument();
    expect(screen.getByText("Reviews (2)")).toBeInTheDocument();
    expect(screen.getByText("1 items")).toBeInTheDocument();
    expect(screen.getByText("REPORT")).toBeInTheDocument();
    expect(screen.queryByText("SPEC_PACK")).not.toBeInTheDocument();
    expect(
      screen.queryAllByText((_, element) =>
        Boolean(
          element?.textContent?.includes("Owner") &&
          element?.textContent?.includes("Owner A"),
        ),
      ),
    ).not.toHaveLength(0);
    expect(
      screen.getByText(
        "Additional Test This Time, Phase Validation Summary, Release Readiness, Rollback Notes, Reviewer Signoff, +1 more",
        {
          selector: ".mt-1.text-xs.leading-5.text-slate-600.break-words",
        },
      ),
    ).toBeInTheDocument();
    // The missing-sections summary is rendered elsewhere; we only check key items here.
    expect(
      screen.queryByText(
        /Self Review is missing required section\(s\): additional_test_this_time, phase_validation_summary, release_readiness, rollback_notes, reviewer_signoff, trace_id/i,
      ),
    ).not.toBeInTheDocument();
  });
});
