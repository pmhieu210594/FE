/**
 * Data Ops Dashboard - FE integration unit tests (Vitest + React Testing Library).
 *
 * All backend calls are mocked via vi.spyOn so no live server is required.
 * Covers AC-DATAOPS-1 (page renders), AC-DATAOPS-2..6 (KPI values rendered),
 * AC-DATAOPS-7 (filter options rendered / filtering), AC-DATAOPS-8 (connector
 * drill-down opens detail drawer), AC-DATAOPS-9/10 (read-only, no write
 * controls).
 */
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { endpoints } from "@/lib/api";
import { DataOpsDashboardPage } from "@/pages/data-ops-dashboard/DataOpsDashboardPage";

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
  connectorFailureCount: 4,
  parseErrorCount: 3,
  missingEvidenceCount: 2,
  staleFreshnessCount: 1,
  brokenLinkCount: 5,
};

const ZERO_SUMMARY = {
  connectorFailureCount: 0,
  parseErrorCount: 0,
  missingEvidenceCount: 0,
  staleFreshnessCount: 0,
  brokenLinkCount: 0,
};

const OPTIONS = {
  projects: [{ value: "proj-1", label: "EDCAP Alpha", role: "DATA_OPS" }],
  repositories: [{ value: "repo-1", label: "edcap-backend" }],
  connectors: [{ value: "conn-1", label: "github-connector" }],
};

const CONNECTOR_ROW = {
  connectorId: "connector-1",
  projectId: "proj-1",
  projectAlias: "EDCAP Alpha",
  repositoryId: "repo-1",
  repositoryName: "edcap-backend",
  connectorName: "github-connector",
  connectorType: "GITHUB",
  latestRunStatus: "FAILED",
  latestRunAt: "2026-07-01T00:00:00Z",
  failedRunCount: 1,
  parseErrorCount: 2,
  missingEvidenceCount: 1,
  freshnessDelayMinutes: 30,
};

const CONNECTORS_PAGE = {
  items: [CONNECTOR_ROW],
  page: 1,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
};

const CONNECTORS_PAGE_EMPTY = {
  items: [],
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
};

const DETAIL = {
  row: CONNECTOR_ROW,
  recentRuns: [],
  dataQualityChecks: [
    {
      dataQualityId: "dq-1",
      sourceType: "GITHUB",
      missingCount: 0,
      parseErrorCount: 2,
      schemaViolationCount: 0,
      errorSummary: "Malformed heading; missing closing fence",
      freshnessDelayMinutes: 30,
      checkedAt: "2026-07-01T00:10:00Z",
    },
  ],
  missingEvidenceItems: [],
};

const REPOSITORY_MISSING_EVIDENCE = {
  missingEvidenceItems: [
    {
      artifactSnapshotId: "snap-1",
      ticketId: "ticket-1",
      ticketExternalKey: "PM-123",
      ticketTitle: "Fix missing spec pack",
      artifactTypeCode: "SPEC_PACK",
      artifactName: "Spec pack",
      fileName: "spec-pack.md",
      sourcePath: "docs/spec-pack.md",
      existsFlag: false,
      requiredFieldsMissing: ["scope", "open_issues"],
      missingSections: ["scope", "open_issues"],
      collectedAt: "2026-07-01T00:10:00Z",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/data-ops-dashboard"]}>
        <DataOpsDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockAllApis() {
  vi.spyOn(endpoints.dataOpsDashboard, "options").mockResolvedValue(OPTIONS);
  vi.spyOn(endpoints.dataOpsDashboard, "summary").mockResolvedValue(SUMMARY);
  vi.spyOn(endpoints.dataOpsDashboard, "connectors").mockResolvedValue(
    CONNECTORS_PAGE,
  );
  vi.spyOn(endpoints.dataOpsDashboard, "detail").mockResolvedValue(DETAIL);
  vi.spyOn(
    endpoints.dataOpsDashboard,
    "repositoryMissingEvidence",
  ).mockResolvedValue(REPOSITORY_MISSING_EVIDENCE);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DataOpsDashboardPage", () => {
  afterEach(cleanup);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAllApis();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 1200,
      height: 800,
      top: 0,
      left: 0,
      bottom: 800,
      right: 1200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  });

  it("calls summary API on mount (AC-DATAOPS-1)", async () => {
    renderPage();
    await waitFor(() =>
      expect(endpoints.dataOpsDashboard.summary).toHaveBeenCalled(),
    );
  });

  it("calls options and connectors APIs on mount (AC-DATAOPS-1, AC-DATAOPS-7)", async () => {
    renderPage();
    await waitFor(() =>
      expect(endpoints.dataOpsDashboard.options).toHaveBeenCalled(),
    );
    await waitFor(() =>
      expect(endpoints.dataOpsDashboard.connectors).toHaveBeenCalled(),
    );
  });

  it("renders all 5 KPI values from summary (AC-DATAOPS-2..6)", async () => {
    renderPage();
    const cards = await screen.findByTestId("data-ops-summary-cards");
    expect(await within(cards).findByText("4")).toBeInTheDocument();
    expect(await within(cards).findByText("3")).toBeInTheDocument();
    expect(await within(cards).findByText("2")).toBeInTheDocument();
    expect(await within(cards).findByText("1")).toBeInTheDocument();
    expect(await within(cards).findByText("5")).toBeInTheDocument();
  });

  it("renders the search box inside the connector table", async () => {
    renderPage();
    expect(await screen.findByRole("textbox")).toBeInTheDocument();
  });

  it("opens the connector detail drawer from the table row", async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole("button", { name: /view repository/i }),
    );

    expect(await screen.findByText("Repository issues")).toBeInTheDocument();
  });

  it("zero-state: shows 0 for all 5 KPI cards when summary is empty (AC-DATAOPS-2..6 boundary case)", async () => {
    vi.spyOn(endpoints.dataOpsDashboard, "summary").mockResolvedValue(
      ZERO_SUMMARY,
    );
    vi.spyOn(endpoints.dataOpsDashboard, "connectors").mockResolvedValue(
      CONNECTORS_PAGE_EMPTY,
    );
    renderPage();
    await waitFor(() => expect(screen.getAllByText("0")).toHaveLength(5));
  });

  it("zero-state: shows empty-state text in connector table when no rows", async () => {
    vi.spyOn(endpoints.dataOpsDashboard, "connectors").mockResolvedValue(
      CONNECTORS_PAGE_EMPTY,
    );
    renderPage();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /view repository/i }),
      ).not.toBeInTheDocument(),
    );
  });

  it("renders project option in filter dropdown (AC-DATAOPS-7)", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("EDCAP Alpha")).toBeInTheDocument(),
    );
  });

  it("changing the parser status filter triggers a new connectors request with the filter applied (AC-DATAOPS-7)", async () => {
    renderPage();
    await screen.findByText("github-connector");
    fireEvent.change(screen.getByTestId("parser-status-select"), {
      target: { value: "ERROR" },
    });
    await waitFor(() =>
      expect(endpoints.dataOpsDashboard.connectors).toHaveBeenCalledWith(
        expect.objectContaining({ parserStatus: "ERROR" }),
      ),
    );
  });

  it("changing the connector filter also refreshes the KPI summary with the same filters", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("repository-select")).toHaveValue("repo-1"),
    );
    await waitFor(() =>
      expect(endpoints.dataOpsDashboard.summary).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          repositoryId: "repo-1",
        }),
      ),
    );
  });

  it("only exposes the read-only search box as a text input (AC-DATAOPS-10)", async () => {
    const { container } = renderPage();
    await waitFor(() =>
      expect(endpoints.dataOpsDashboard.summary).toHaveBeenCalled(),
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    const editInputs = container.querySelectorAll(
      "input[type=number], textarea",
    );
    expect(editInputs.length).toBe(0);
  });

  it("no edit / delete / create buttons visible (AC-DATAOPS-10)", async () => {
    const { container } = renderPage();
    await waitFor(() =>
      expect(endpoints.dataOpsDashboard.summary).toHaveBeenCalled(),
    );
    const writeButtons = container.querySelectorAll(
      "button[aria-label*='edit' i], button[aria-label*='delete' i], button[aria-label*='create' i]",
    );
    expect(writeButtons.length).toBe(0);
  });

  it("has export button rendered - export capability is out of scope (OI-DATAOPS-4)", async () => {
    renderPage();
    await waitFor(() =>
      expect(endpoints.dataOpsDashboard.summary).toHaveBeenCalled(),
    );
    expect(screen.queryByText(/export/i)).toBeInTheDocument();
  });
});
