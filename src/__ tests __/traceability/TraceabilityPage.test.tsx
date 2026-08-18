import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TraceabilityPage } from "@/pages/traceability/TraceabilityPage";
import { endpoints, type TraceabilityResponse } from "@/lib/api";

afterEach(cleanup);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

vi.mock("@/lib/utils", () => ({
  formatDateTime: (value: string | null | undefined) =>
    value ? `formatted:${value}` : "-",
  cn: (
    ...classes: Array<string | undefined | false | Record<string, boolean>>
  ) =>
    classes
      .flatMap((c) =>
        typeof c === "string"
          ? c
          : c
            ? Object.entries(c)
                .filter(([, v]) => v)
                .map(([k]) => k)
            : [],
      )
      .filter(Boolean)
      .join(" "),
}));

const traceabilityResponse = {
  summary: {
    ticketId: "8bb0b3c7-90ce-4b1b-82c0-1bbf9c17ef61",
    externalTicketKey: "ABC-123",
    title: "Traceability ticket",
    completenessPercent: 89,
    foundCount: 8,
    expectedCount: 9,
    artifactCount: 6,
    prCount: 1,
    commitCount: 1,
    ciCount: 1,
    brokenLinkCount: 1,
    reviewRoundCount: 2,
  },
  artifacts: [
    {
      artifactSnapshotId: "11111111-1111-1111-1111-111111111111",
      artifactTypeCode: "SPEC_PACK",
      artifactName: "Spec Pack",
      defaultFileName: "spec-pack.md",
      requiredFlag: true,
      sourcePath: "/docs/spec-pack.md",
      existsFlag: true,
      collectedAt: "2026-06-20T09:00:00Z",
      schemaVersion: 1,
    },
    {
      artifactSnapshotId: null,
      artifactTypeCode: "IMPL_PLAN",
      artifactName: "Implementation Plan",
      defaultFileName: "impl-plan.md",
      requiredFlag: true,
      sourcePath: null,
      existsFlag: false,
      collectedAt: null,
      schemaVersion: 1,
    },
    {
      artifactSnapshotId: null,
      artifactTypeCode: "REVIEW_CHECKLIST",
      artifactName: "Review Checklist",
      defaultFileName: "review-checklist.md",
      requiredFlag: true,
      sourcePath: null,
      existsFlag: false,
      collectedAt: null,
      schemaVersion: 1,
    },
    {
      artifactSnapshotId: null,
      artifactTypeCode: "SELF_REVIEW",
      artifactName: "Self Review",
      defaultFileName: "self-review.md",
      requiredFlag: true,
      sourcePath: null,
      existsFlag: false,
      collectedAt: null,
      schemaVersion: 1,
    },
    {
      artifactSnapshotId: null,
      artifactTypeCode: "TEST_PLAN",
      artifactName: "Test Plan",
      defaultFileName: "test-plan.md",
      requiredFlag: true,
      sourcePath: null,
      existsFlag: false,
      collectedAt: null,
      schemaVersion: 1,
    },
    {
      artifactSnapshotId: null,
      artifactTypeCode: "TEST_RESULTS",
      artifactName: "Test Results",
      defaultFileName: "test-results.md",
      requiredFlag: true,
      sourcePath: null,
      existsFlag: false,
      collectedAt: null,
      schemaVersion: 1,
    },
    {
      artifactSnapshotId: null,
      artifactTypeCode: "REPORT",
      artifactName: "Report",
      defaultFileName: "report.md",
      requiredFlag: true,
      sourcePath: null,
      existsFlag: false,
      collectedAt: null,
      schemaVersion: 1,
    },
  ],
  pullRequests: [
    {
      prId: "22222222-2222-2222-2222-222222222222",
      externalPrId: "145",
      externalPrUrl: "https://github.com/org/repo/pull/145",
      title: "ABC-123 traceability",
      status: "OPEN",
      sourceBranch: "feature/ABC-123",
      targetBranch: "main",
      openedAt: "2026-06-20T10:00:00Z",
      mergedAt: null,
      closedAt: null,
      collectedAt: "2026-06-20T10:05:00Z",
    },
  ],
  commits: [
    {
      commitId: "33333333-3333-3333-3333-333333333333",
      commitHash: "0123456789abcdef0123456789abcdef01234567",
      branchName: "feature/ABC-123",
      messageHash: "hash-1",
      commitUrl: null,
      committedAt: "2026-06-20T11:00:00Z",
      collectedAt: "2026-06-20T11:05:00Z",
    },
  ],
  ciRuns: [
    {
      ciRunId: "44444444-4444-4444-4444-444444444444",
      externalCiRunId: "ci-1",
      ciUrl: "https://github.com/org/repo/actions/runs/1",
      workflowName: "workflow",
      status: "SUCCESS",
      startedAt: "2026-06-20T12:00:00Z",
      finishedAt: "2026-06-20T12:10:00Z",
      collectedAt: "2026-06-20T12:11:00Z",
    },
  ],
  links: [
    {
      traceabilityLinkId: "55555555-5555-5555-5555-555555555555",
      sourceType: "TICKET",
      sourceId: "8bb0b3c7-90ce-4b1b-82c0-1bbf9c17ef61",
      targetType: "REPORT",
      targetId: "report-1",
      confidence: 100,
      confidenceLevel: "HIGH",
      ruleName: "ticket-inference",
      evidenceJson: "{}",
      createdAt: "2026-06-20T13:00:00Z",
    },
  ],
  brokenLinks: [
    {
      code: "REPORT",
      item: "Report",
      severity: "WARNING" as const,
      message: "Report is missing for this ticket.",
    },
  ],
  timelineEvents: [
    {
      eventId: "66666666-6666-6666-6666-666666666666",
      eventType: "REPORT_CREATED",
      sourceType: "REPORT",
      sourceRefId: "report-1",
      result: "PASS",
      summary: "Report created",
      eventTimestamp: "2026-06-20T13:05:00Z",
    },
  ],
  reviewComments: [],
} satisfies TraceabilityResponse;

vi.spyOn(endpoints.traceability, "get").mockResolvedValue(traceabilityResponse);

function renderPage(initialPath = "/en/traceability?ticketId=ABC-123") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/:lang/traceability" element={<TraceabilityPage />} />
          <Route path="/:lang/pm-dashboard" element={<div>PM Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TraceabilityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads traceability data for the ticket id in the query string", async () => {
    renderPage();

    expect(
      await screen.findByText("Pages.Traceability.title"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(endpoints.traceability.get).toHaveBeenCalledWith("ABC-123"),
    );
    expect(screen.getByText("89%")).toBeInTheDocument();
    expect(screen.getAllByText("Report").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "PR #145" })).toHaveAttribute(
      "href",
      "https://github.com/org/repo/pull/145",
    );
    expect(screen.getByRole("link", { name: "Run #ci-1" })).toHaveAttribute(
      "href",
      "https://github.com/org/repo/actions/runs/1",
    );
    expect(
      screen.queryByRole("button", { name: /edit|delete|repair/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Pages.Traceability.linksTitle"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Pages.Traceability.timelineTitle"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Pages.Traceability.ticketIdPlaceholder"),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("button", {
        name: "Pages.Traceability.backToDashboard",
      }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("Pages.Traceability.noReviewComments"),
    ).toBeInTheDocument();
  });

  it("renders review comments with author, state badge and markdown body", async () => {
    vi.spyOn(endpoints.traceability, "get").mockResolvedValue({
      ...traceabilityResponse,
      reviewComments: [
        {
          reviewCommentId: "rc-1",
          filePathHash: "hash-abc",
          lineNumber: 10,
          commentSummary: "Please fix this, cc @octocat",
          state: "CHANGES_REQUESTED",
          submittedAt: "2026-07-01T10:00:00Z",
          submittedBy: "octocat",
        },
      ],
    });

    renderPage();

    expect(
      await screen.findByText("Pages.Traceability.reviewComments"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("CHANGES_REQUESTED")).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === "octocat - formatted:2026-07-01T10:00:00Z",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("CHANGES_REQUESTED")).toBeInTheDocument();
    expect(screen.getByText(/Please fix this/)).toBeInTheDocument();
    const mentionLink = screen.getByRole("link", { name: "@octocat" });
    expect(mentionLink).toHaveAttribute("href", "https://github.com/octocat");
    expect(
      screen.queryByText("Pages.Traceability.noReviewComments"),
    ).not.toBeInTheDocument();
  });

  it("shows the empty state when no ticket id is present", async () => {
    renderPage("/en/traceability");

    expect(
      await screen.findByText("Pages.Traceability.emptyState"),
    ).toBeInTheDocument();
    expect(endpoints.traceability.get).not.toHaveBeenCalled();
    expect(
      screen.getAllByRole("button", {
        name: "Pages.Traceability.backToDashboard",
      }).length,
    ).toBeGreaterThan(0);
  });

  it("navigates directly to the PM dashboard when back button is clicked", async () => {
    renderPage();

    const backButtons = await screen.findAllByRole("button", {
      name: "Pages.Traceability.backToDashboard",
    });
    fireEvent.click(backButtons[0]);

    expect(await screen.findByText("PM Dashboard")).toBeInTheDocument();
  });
});
