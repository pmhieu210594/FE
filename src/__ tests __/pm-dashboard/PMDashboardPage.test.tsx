import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { endpoints } from "@/lib/api";

import { PMDashboardPage } from "@/pages/pm-dashboard/PMDashboardPage";

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

const summaryResponse = {
  blockedTicketCount: 0,
  missingEvidenceTicketCount: 1,
  missingTraceabilitySectionTicketCount: 1,
  openIssueCount: 0,
  waitingReviewTicketCount: 0,
  ciFailedTicketCount: 0,
  firstCiPassTicketCount: 0,
  ticketWithCiCount: 0,
  riskTicketCount: 0,
  exceptionTicketCount: 0,
  averageEvidenceQualityScore: 88,
  averageScoreBand: "GOOD",
  phaseBottleneckPhaseCode: null,
  phaseBottleneckPhaseName: null,
  phaseBottleneckBlockedCount: 0,
  updatedAt: "2026-06-25T10:00:00Z",
};

const optionsResponse = {
  projects: [{ value: "project-1", label: "Project Alpha" }],
  periods: [],
  repositories: [{ value: "repo-1", label: "Repo Alpha" }],
  phases: [],
};

const insightsResponse = {
  evidenceBottleneckBuckets: [
    {
      bucketKey: "repo-1",
      bucketName: "Repo Alpha",
      missingEvidenceCount: 1,
    },
  ],
};

const ticketsResponse = {
  items: [
    {
      ticketId: "ticket-1",
      projectId: "project-1",
      projectAlias: "Project Alpha",
      repositoryId: "repo-1",
      repositoryName: "Repo Alpha",
      externalTicketKey: "PM-1",
      title: "PM Dashboard ticket",
      phaseId: "phase-1",
      phaseCode: "DONE",
      phaseName: "Done",
      phaseDescription: "Done phase",
      phaseCreatedAt: "2026-06-20T00:00:00Z",
      phaseOrder: 4,
      blockedFlag: false,
      waitingReviewFlag: false,
      missingEvidenceCount: 1,
      traceabilityIssueCount: 1,
      openIssueCount: 0,
      riskCount: 0,
      exceptionCount: 0,
      ciFailedCount: 0,
      highestRiskSeverity: null,
      evidenceQualityScore: 88,
      scoreBand: "GOOD",
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
  ],
  page: 1,
  size: 100,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
};

const detailResponse = {
  row: ticketsResponse.items[0],
  createdAt: "2026-06-24T10:00:00Z",
  ownerDisplay: "Owner A",
  reviewCount: 0,
  missingEvidenceItems: [],
  riskItems: [],
  exceptionItems: [],
  issueItems: [],
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
};

vi.spyOn(endpoints.pmDashboard, "summary").mockResolvedValue(summaryResponse);
vi.spyOn(endpoints.pmDashboard, "options").mockResolvedValue(optionsResponse);
vi.spyOn(endpoints.pmDashboard, "insights").mockResolvedValue(insightsResponse);
vi.spyOn(endpoints.pmDashboard, "tickets").mockResolvedValue(ticketsResponse);
vi.spyOn(endpoints.pmDashboard, "detail").mockResolvedValue(detailResponse);
vi.spyOn(endpoints.evidenceQualityScores, "getLatest").mockResolvedValue({
  ticketId: "ticket-1",
  score: 88,
  band: "GOOD",
  breakdown: [],
  missing: [],
  parseErrors: [],
  traceIds: [],
  scoreRuleVersion: "v1",
  snapshotState: "READY",
  calculatedAt: "2026-06-25T10:00:00Z",
});
vi.spyOn(endpoints.traceability, "get").mockResolvedValue({
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
    brokenLinkCount: 0,
    reviewRoundCount: 0,
  },
  artifacts: [],
  pullRequests: [],
  commits: [],
  ciRuns: [],
  links: [],
  brokenLinks: [],
  timelineEvents: [],
  reviewComments: [],
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/pm-dashboard"]}>
        <PMDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("PMDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads dashboard data first and fetches detail only after clicking a ticket", async () => {
    renderPage();

    await screen.findByText("All tickets");
    await screen.findByText("Phase");
    await waitFor(() =>
      expect(screen.getByTitle("Xem chi tiết")).toBeInTheDocument(),
    );

    expect(endpoints.pmDashboard.detail).not.toHaveBeenCalled();
    expect(endpoints.evidenceQualityScores.getLatest).not.toHaveBeenCalled();
    expect(endpoints.traceability.get).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTitle("Xem chi tiết"));

    await waitFor(() =>
      expect(endpoints.pmDashboard.detail).toHaveBeenCalledWith("ticket-1"),
    );
    await waitFor(() =>
      expect(endpoints.evidenceQualityScores.getLatest).toHaveBeenCalledWith(
        "ticket-1",
      ),
    );
    await waitFor(() =>
      expect(endpoints.traceability.get).toHaveBeenCalledWith("ticket-1"),
    );
  });
});
