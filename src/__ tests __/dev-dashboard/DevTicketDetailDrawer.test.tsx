import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { endpoints } from "@/lib/api";
import { DevTicketDetailDrawer } from "@/pages/development-dashboard/components/DevTicketDetailDrawer";
import type {
  DevTicketDetail,
  DevTicketRow,
} from "@/pages/development-dashboard/types";

afterEach(cleanup);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
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

const ROW: DevTicketRow = {
  ticketId: "ticket-1",
  projectId: "proj-1",
  projectAlias: "EDCAP Alpha",
  externalTicketKey: "EC-42",
  title: "Implement dashboard",
  ticketStatus: "IN_PROGRESS",
  ciFailCount: 1,
  latestCiStatus: "FAILURE",
  openFindingCount: 1,
  reviewCommentCount: 1,
  parserErrorFlag: false,
  ageDays: 3,
  artifactVersion: 1,
};

const DETAIL: DevTicketDetail = {
  row: ROW,
  ciRuns: [
    {
      ciRunId: "ci-1",
      workflowName: "build-and-test",
      status: "FAILURE",
      failureCategory: "COMPILE_ERROR",
      ciUrl: "https://ci.example.com/run/1",
      startedAt: "2026-06-30T00:00:00Z",
    },
  ],
  findings: [
    {
      findingId: "f-1",
      severity: "HIGH",
      status: "OPEN",
      findingSummary: "Missing null check",
    },
  ],
  reviewComments: [
    {
      reviewCommentId: "rc-1",
      filePathHash: "hash-abc",
      lineNumber: 42,
      severity: "MEDIUM",
      commentSummary: "Consider extracting method, cc @octocat",
      resolvedFlag: false,
      commitUrl: "https://github.com/example/commit/abc",
      state: "CHANGES_REQUESTED",
      submittedAt: "2026-07-01T10:00:00Z",
      submittedBy: "octocat",
    },
  ],
  parserSummary: {
    parseErrorCount: 0,
    schemaViolationCount: 0,
    missingCount: 0,
  },
};

const EMPTY_TRACEABILITY = { brokenLinks: [] } as unknown as Awaited<
  ReturnType<typeof endpoints.traceability.get>
>;

function renderDrawer(detail: DevTicketDetail | null, ticketId = "ticket-1") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/development-dashboard"]}>
        <DevTicketDetailDrawer
          ticketId={ticketId}
          detail={detail}
          onClose={vi.fn()}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("DevTicketDetailDrawer", () => {
  beforeEach(() => {
    vi.spyOn(endpoints.traceability, "get").mockResolvedValue(
      EMPTY_TRACEABILITY,
    );
  });

  it("renders the ticket key in the drawer title (AC-6)", async () => {
    renderDrawer(DETAIL);
    await waitFor(() => expect(screen.getByText("EC-42")).toBeInTheDocument());
  });

  it("renders CI run status (AC-2, AC-6)", async () => {
    renderDrawer(DETAIL);
    await waitFor(() =>
      expect(screen.getByText("build-and-test")).toBeInTheDocument(),
    );
    expect(screen.getByText("FAILURE")).toBeInTheDocument();
  });

  it("shows no-parser-errors message when there are no broken links (AC-4)", async () => {
    renderDrawer(DETAIL);
    await waitFor(() =>
      expect(
        screen.getByText("Pages.DevDashboard.detail.noParserErrors"),
      ).toBeInTheDocument(),
    );
  });

  it("renders broken-link parser errors when present (AC-4)", async () => {
    vi.spyOn(endpoints.traceability, "get").mockResolvedValue({
      brokenLinks: [
        {
          code: "MISSING_ARTIFACT",
          item: "impl-plan.md",
          message: "File missing",
          severity: "ERROR",
        },
      ],
    } as unknown as Awaited<ReturnType<typeof endpoints.traceability.get>>);
    renderDrawer(DETAIL);
    await waitFor(() =>
      expect(screen.getByText("impl-plan.md")).toBeInTheDocument(),
    );
    expect(screen.getByText("ERROR")).toBeInTheDocument();
  });

  it("shows empty state text when detail is null (AC boundary case)", () => {
    renderDrawer(null);
    expect(
      screen.getByText("Pages.DevDashboard.emptyState"),
    ).toBeInTheDocument();
  });

  it("renders no editable form fields — drawer is read-only (AC-7)", async () => {
    const { container } = renderDrawer(DETAIL);
    await waitFor(() => expect(screen.getByText("EC-42")).toBeInTheDocument());
    expect(container.querySelectorAll("input, textarea").length).toBe(0);
  });

  it("renders review comment author, timestamp and state badge", async () => {
    renderDrawer(DETAIL);
    await waitFor(() =>
      expect(
        screen.getByText(
          (_, element) =>
            element?.textContent === "octocat - formatted:2026-07-01T10:00:00Z",
        ),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("CHANGES_REQUESTED")).toBeInTheDocument();
  });

  it("renders review comment markdown body and @mentions as GitHub links", async () => {
    renderDrawer(DETAIL);
    await waitFor(() =>
      expect(
        screen.getByText(/Consider extracting method/),
      ).toBeInTheDocument(),
    );
    const mentionLink = screen.getByRole("link", { name: "@octocat" });
    expect(mentionLink).toHaveAttribute("href", "https://github.com/octocat");
  });

  it("shows the no-review-comments message when there are none", async () => {
    renderDrawer({ ...DETAIL, reviewComments: [] });
    await waitFor(() =>
      expect(
        screen.getByText("Pages.DevDashboard.detail.noReviewComments"),
      ).toBeInTheDocument(),
    );
  });
});
