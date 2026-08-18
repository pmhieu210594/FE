import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataOpsConnectorTable } from "@/pages/data-ops-dashboard/components/DataOpsConnectorTable";
import type { DataOpsConnectorRow } from "@/pages/data-ops-dashboard/types";

afterEach(cleanup);
afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
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

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count !== undefined ? `${key}:${options.count}` : key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const ROW: DataOpsConnectorRow = {
  connectorId: "connector-1",
  projectId: "proj-1",
  projectAlias: "EDCAP Alpha",
  repositoryId: "repo-1",
  repositoryName: "edcap-backend",
  connectorName: "github-connector",
  connectorType: "GITHUB",
  latestRunStatus: "FAILED",
  latestRunAt: "2026-07-01T00:00:00Z",
  failedRunCount: 2,
  parseErrorCount: 3,
  missingEvidenceCount: 1,
  freshnessDelayMinutes: 30,
};

const ROW_2: DataOpsConnectorRow = {
  ...ROW,
  connectorId: "connector-2",
  connectorName: "jira-connector",
  latestRunStatus: "SUCCESS",
  failedRunCount: 0,
  parseErrorCount: 0,
  missingEvidenceCount: 0,
};

const REPO_ONLY_ROW: DataOpsConnectorRow = {
  connectorId: null,
  projectId: "proj-1",
  projectAlias: "EDCAP Alpha",
  repositoryId: "repo-2",
  repositoryName: "edcap-mobile",
  connectorName: null,
  connectorType: null,
  latestRunStatus: null,
  latestRunAt: null,
  failedRunCount: 0,
  parseErrorCount: 0,
  missingEvidenceCount: 3,
  freshnessDelayMinutes: null,
};

describe("DataOpsConnectorTable", () => {
  it("renders a row per connector (AC-DATAOPS-8)", () => {
    render(
      <DataOpsConnectorTable
        rows={[ROW, ROW_2]}
        totalElements={2}
        page={1}
        perPage={20}
        totalPages={1}
        searchValue=""
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
        onRepositoryClick={vi.fn()}
      />,
    );
    expect(screen.getByText("github-connector")).toBeInTheDocument();
    expect(screen.getByText("jira-connector")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", {
        name: "Pages.DataOpsDashboard.connectorTable.viewRepository",
      }),
    ).toHaveLength(2);
  });

  it("shows an empty table state when there are no rows (AC-DATAOPS boundary case)", () => {
    render(
      <DataOpsConnectorTable
        rows={[]}
        totalElements={0}
        page={1}
        perPage={20}
        totalPages={1}
        searchValue=""
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
        onRepositoryClick={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", {
        name: "Pages.DataOpsDashboard.connectorTable.viewRepository",
      }),
    ).not.toBeInTheDocument();
  });

  it("renders latest run status badge", () => {
    render(
      <DataOpsConnectorTable
        rows={[ROW]}
        totalElements={1}
        page={1}
        perPage={20}
        totalPages={1}
        searchValue=""
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
        onRepositoryClick={vi.fn()}
      />,
    );
    expect(screen.getByText("FAILED")).toBeInTheDocument();
  });

  it("hides pagination controls when there is a single page", () => {
    render(
      <DataOpsConnectorTable
        rows={[ROW]}
        totalElements={1}
        page={1}
        perPage={20}
        totalPages={1}
        searchValue=""
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
        onRepositoryClick={vi.fn()}
      />,
    );
    expect(
      screen.queryByText("Pages.DataOpsDashboard.connectorTable.next"),
    ).not.toBeInTheDocument();
  });

  it("pagination Next button calls onPageChange with page + 1", () => {
    const onPageChange = vi.fn();
    render(
      <DataOpsConnectorTable
        rows={[ROW]}
        totalElements={2}
        page={1}
        perPage={20}
        totalPages={2}
        searchValue=""
        onSearchChange={vi.fn()}
        onPageChange={onPageChange}
        onPerPageChange={vi.fn()}
        onRepositoryClick={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "next" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders the search box like PM dashboard", () => {
    render(
      <DataOpsConnectorTable
        rows={[ROW]}
        totalElements={1}
        page={1}
        perPage={20}
        totalPages={1}
        searchValue="github"
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
        onRepositoryClick={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("github");
  });

  it("renders repository-only rows for missing evidence even without a connector id", () => {
    render(
      <DataOpsConnectorTable
        rows={[REPO_ONLY_ROW]}
        totalElements={1}
        page={1}
        perPage={20}
        totalPages={1}
        searchValue=""
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
        onRepositoryClick={vi.fn()}
      />,
    );
    const row = screen.getByText("edcap-mobile").closest("tr");
    if (!row) {
      throw new Error("Could not find repository-only table row");
    }
    expect(within(row).getByText("edcap-mobile")).toBeInTheDocument();
    expect(within(row).getByText("3")).toBeInTheDocument();
  });

  it("clicking the eye icon calls onRepositoryClick with the full row", () => {
    const onRepositoryClick = vi.fn();
    render(
      <DataOpsConnectorTable
        rows={[ROW]}
        totalElements={1}
        page={1}
        perPage={20}
        totalPages={1}
        searchValue=""
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
        onRepositoryClick={onRepositoryClick}
      />,
    );
    fireEvent.click(
      within(
        screen.getByText("github-connector").closest("tr") as HTMLElement,
      ).getByRole("button", {
        name: "Pages.DataOpsDashboard.connectorTable.viewRepository",
      }),
    );
    expect(onRepositoryClick).toHaveBeenCalledWith(ROW);
  });

  it("hovering the eye icon calls onRepositoryHover with the full row", () => {
    const onRepositoryHover = vi.fn();
    render(
      <DataOpsConnectorTable
        rows={[ROW]}
        totalElements={1}
        page={1}
        perPage={20}
        totalPages={1}
        searchValue=""
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
        onRepositoryHover={onRepositoryHover}
        onRepositoryClick={vi.fn()}
      />,
    );
    fireEvent.mouseEnter(
      within(
        screen.getByText("github-connector").closest("tr") as HTMLElement,
      ).getByRole("button", {
        name: "Pages.DataOpsDashboard.connectorTable.viewRepository",
      }),
    );
    expect(onRepositoryHover).toHaveBeenCalledWith(ROW);
  });
});
