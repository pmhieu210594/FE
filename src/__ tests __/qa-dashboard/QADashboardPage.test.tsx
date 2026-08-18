/**
 * QA Dashboard — FE integration unit tests (Vitest + React Testing Library).
 *
 * All backend calls are mocked via vi.spyOn so no live server is required.
 * Covers AC-1 (options/tickets APIs called), AC-3 (ticket table rows rendered,
 * empty state), AC-8 (filter options rendered), AC-10/AC-12 (read-only: no
 * write controls).
 */
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { endpoints } from "@/lib/api";
import { QADashboardPage } from "@/pages/qa-dashboard/QADashboardPage";

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

const TICKET_PAGE = {
  items: [
    {
      ticketId: "ticket-1",
      projectId: "proj-1",
      projectAlias: "EDCAP Alpha",
      repositoryId: "repo-1",
      externalTicketKey: "EC-10",
      title: "Add login flow",
      status: "OPEN",
      priority: "HIGH",
      ownerDisplay: "Jane Doe",
      acCoveragePercent: 85,
      testResultPercent: 70,
      createdAt: "2026-06-01T10:00:00Z",
      updatedAt: "2026-06-29T10:00:00Z",
      artifactVersion: 1,
    },
    {
      ticketId: "ticket-2",
      projectId: "proj-1",
      projectAlias: "EDCAP Alpha",
      repositoryId: "repo-1",
      externalTicketKey: "EC-11",
      title: "Fix logout bug",
      status: "CLOSED",
      priority: "LOW",
      ownerDisplay: "Unknown",
      acCoveragePercent: 60,
      testResultPercent: 40,
      createdAt: "2026-06-02T10:00:00Z",
      updatedAt: "2026-06-28T10:00:00Z",
      artifactVersion: 1,
    },
  ],
  page: 0,
  size: 10,
  totalElements: 2,
  totalPages: 1,
  hasNext: false,
};

const TICKET_PAGE_EMPTY = {
  items: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
};

const OPTIONS = {
  projects: [{ value: "proj-1", label: "EDCAP Alpha", role: "QA" }],
  repositories: [{ value: "repo-1", label: "edcap-backend" }],
  tickets: [{ value: "ticket-1", label: "EC-10" }],
};

const TICKET_DETAIL = {
  row: {
    ticketId: "ticket-1",
    projectId: "proj-ticket",
    projectAlias: "EDCAP Ticket",
    repositoryId: "repo-ticket",
    externalTicketKey: "EC-10",
    title: "Add login flow",
    status: "OPEN",
    priority: "HIGH",
    ownerDisplay: "Jane Doe",
    acCoveragePercent: 85,
    testResultPercent: 70,
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-29T10:00:00Z",
    artifactVersion: 1,
  },
  description: null,
  sprint: null,
  latestCiRunUrl: null,
};

// ---------------------------------------------------------------------------
// Spy setup — reset in beforeEach
// ---------------------------------------------------------------------------

function mockEndpoints() {
  vi.spyOn(endpoints.qaDashboard, "tickets").mockResolvedValue(TICKET_PAGE);
  vi.spyOn(endpoints.qaDashboard, "options").mockResolvedValue(OPTIONS);
  vi.spyOn(endpoints.qaDashboard, "ticketDetail").mockResolvedValue(
    TICKET_DETAIL,
  );
}

mockEndpoints();

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/qa-dashboard"]}>
        <QADashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("QADashboardPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpoints();
  });

  it("calls options API on mount (AC-1)", async () => {
    renderPage();
    await waitFor(() =>
      expect(endpoints.qaDashboard.options).toHaveBeenCalled(),
    );
  });

  it("calls tickets API on mount", async () => {
    renderPage();
    await waitFor(() =>
      expect(endpoints.qaDashboard.tickets).toHaveBeenCalled(),
    );
  });

  it("renders ticket table rows after data loads (AC-3)", async () => {
    renderPage();
    // "Add login flow" is unique — only in the ticket table
    await waitFor(() =>
      expect(screen.getByText("Add login flow")).toBeInTheDocument(),
    );
    // EC-10 appears in table cell AND in SVG trend chart label — use getAllByText
    expect(screen.getAllByText("EC-10").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("zero-state: renders no ticket rows when the ticket page is empty (AC-3)", async () => {
    vi.spyOn(endpoints.qaDashboard, "tickets").mockResolvedValue(
      TICKET_PAGE_EMPTY,
    );
    renderPage();
    await waitFor(() =>
      expect(endpoints.qaDashboard.tickets).toHaveBeenCalled(),
    );
    expect(screen.queryByText("Add login flow")).not.toBeInTheDocument();
  });

  it("renders project option in filter dropdown (AC-8)", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("EDCAP Alpha")).toBeInTheDocument(),
    );
  });

  it("renders repository option in filter dropdown (AC-8)", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("edcap-backend")).toBeInTheDocument(),
    );
  });

  it("never renders a ticket filter dropdown", async () => {
    renderPage();

    await waitFor(() =>
      expect(endpoints.qaDashboard.options).toHaveBeenCalled(),
    );

    expect(screen.queryByTestId("ticket-select")).not.toBeInTheDocument();
  });

  it("no edit / delete / create / add buttons visible (AC-10, AC-12)", async () => {
    const { container } = renderPage();
    await waitFor(() =>
      expect(endpoints.qaDashboard.tickets).toHaveBeenCalled(),
    );
    const writeButtons = container.querySelectorAll(
      "button[aria-label*='edit' i], button[aria-label*='delete' i], button[aria-label*='create' i]",
    );
    expect(writeButtons.length).toBe(0);
  });
});
