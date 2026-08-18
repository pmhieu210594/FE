/**
 * Development Dashboard — FE integration unit tests (Vitest + React Testing Library).
 *
 * All backend calls are mocked via vi.spyOn so no live server is required.
 * Covers AC-1 (page renders), AC-2/3/4 (KPI values rendered), AC-5 (filter
 * options rendered), AC-6 (ticket drill-down opens detail drawer),
 * AC-7 (read-only: no write controls).
 */
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { endpoints } from "@/lib/api";
import { DevelopmentDashboardPage } from "@/pages/development-dashboard/DevelopmentDashboardPage";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

// ---------------------------------------------------------------------------
// Mock fixture data
// ---------------------------------------------------------------------------

const SUMMARY = {
  ciFailureCount: 5,
  reviewCommentCount: 3,
  parserErrorCount: 2,
  updatedAt: "2026-06-30T00:00:00Z",
};

const ZERO_SUMMARY = {
  ciFailureCount: 0,
  reviewCommentCount: 0,
  parserErrorCount: 0,
  updatedAt: null,
};

const OPTIONS = {
  projects: [{ value: "proj-1", label: "EDCAP Alpha" }],
  repositories: [{ value: "repo-1", label: "edcap-backend" }],
};

const TICKET_ROW = {
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

const TICKETS_PAGE = {
  items: [TICKET_ROW],
  page: 1,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
};

const TICKETS_PAGE_EMPTY = {
  items: [],
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
};

const DETAIL = {
  row: TICKET_ROW,
  ciRuns: [],
  findings: [],
  reviewComments: [],
  parserSummary: {
    parseErrorCount: 0,
    schemaViolationCount: 0,
    missingCount: 0,
  },
};

const EMPTY_TRACEABILITY = { brokenLinks: [] } as unknown as Awaited<
  ReturnType<typeof endpoints.traceability.get>
>;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/development-dashboard"]}>
        <DevelopmentDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockAllApis() {
  vi.spyOn(endpoints.devDashboard, "options").mockResolvedValue(OPTIONS);
  vi.spyOn(endpoints.devDashboard, "summary").mockResolvedValue(SUMMARY);
  vi.spyOn(endpoints.devDashboard, "tickets").mockResolvedValue(TICKETS_PAGE);
  vi.spyOn(endpoints.devDashboard, "detail").mockResolvedValue(DETAIL);
  vi.spyOn(endpoints.traceability, "get").mockResolvedValue(EMPTY_TRACEABILITY);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DevelopmentDashboardPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mockAllApis();
  });

  it("calls summary API on mount (AC-1)", async () => {
    renderPage();
    await waitFor(() =>
      expect(endpoints.devDashboard.summary).toHaveBeenCalled(),
    );
  });

  it("calls options and tickets APIs on mount (AC-1, AC-5)", async () => {
    renderPage();
    await waitFor(() =>
      expect(endpoints.devDashboard.options).toHaveBeenCalled(),
    );
    await waitFor(() =>
      expect(endpoints.devDashboard.tickets).toHaveBeenCalled(),
    );
  });

  it("renders CI Failure count from summary (AC-2)", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("5")).toBeInTheDocument());
  });

  it("renders Review Finding count from summary (AC-3)", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
  });

  it("renders Parser Error count from summary (AC-4)", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());
  });

  it("renders the ticket row after tickets load (AC-1)", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("EC-42")).toBeInTheDocument());
  });

  it("zero-state: shows 0 for all KPI cards when summary is empty (AC-2, AC-3, AC-4)", async () => {
    vi.spyOn(endpoints.devDashboard, "summary").mockResolvedValue(ZERO_SUMMARY);
    vi.spyOn(endpoints.devDashboard, "tickets").mockResolvedValue(
      TICKETS_PAGE_EMPTY,
    );
    renderPage();
    await waitFor(() => expect(screen.getAllByText("0")).toHaveLength(3));
  });

  it("zero-state: renders no ticket rows when the tickets page is empty", async () => {
    vi.spyOn(endpoints.devDashboard, "tickets").mockResolvedValue(
      TICKETS_PAGE_EMPTY,
    );
    renderPage();
    await waitFor(() =>
      expect(endpoints.devDashboard.tickets).toHaveBeenCalled(),
    );
    expect(screen.queryByText("EC-42")).not.toBeInTheDocument();
  });

  it("renders project option in filter dropdown (AC-5)", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("EDCAP Alpha")).toBeInTheDocument(),
    );
  });

  it("renders repository option in filter dropdown (AC-5)", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("edcap-backend")).toBeInTheDocument(),
    );
  });

  it("clicking the view-detail action opens the detail drawer and loads detail (AC-6)", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("EC-42")).toBeInTheDocument());
    // The virtualized table re-measures and re-renders its rows shortly after
    // mount, so re-query the live button on every retry instead of clicking a
    // reference that may already be detached.
    await waitFor(() => {
      fireEvent.click(screen.getByTitle("View detail"));
      expect(endpoints.devDashboard.detail).toHaveBeenCalledWith("ticket-1");
    });
  });

  it("no numeric <input> or <textarea> forms visible besides search — read-only dashboard (AC-7)", async () => {
    const { container } = renderPage();
    await waitFor(() =>
      expect(endpoints.devDashboard.summary).toHaveBeenCalled(),
    );
    const editInputs = container.querySelectorAll(
      "input[type=number], textarea",
    );
    expect(editInputs.length).toBe(0);
  });

  it("no edit / delete / create buttons visible (AC-7)", async () => {
    const { container } = renderPage();
    await waitFor(() =>
      expect(endpoints.devDashboard.summary).toHaveBeenCalled(),
    );
    const writeButtons = container.querySelectorAll(
      "button[aria-label*='edit' i], button[aria-label*='delete' i], button[aria-label*='create' i]",
    );
    expect(writeButtons.length).toBe(0);
  });
});
