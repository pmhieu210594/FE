import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataOpsConnectorDetailDrawer } from "@/pages/data-ops-dashboard/components/DataOpsConnectorDetailDrawer";
import type {
  DataOpsConnectorDetail,
  DataOpsConnectorRow,
} from "@/pages/data-ops-dashboard/types";

afterEach(cleanup);

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
  failedRunCount: 1,
  parseErrorCount: 2,
  missingEvidenceCount: 1,
  freshnessDelayMinutes: 30,
};

const DETAIL: DataOpsConnectorDetail = {
  row: ROW,
  recentRuns: [
    {
      connectorRunId: "run-1",
      status: "FAILED",
      startedAt: "2026-07-01T00:00:00Z",
      finishedAt: "2026-07-01T00:05:00Z",
      recordsRead: 10,
      recordsWritten: 0,
      errorMessage: "Timeout",
    },
  ],
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

function renderDrawer(
  detail: DataOpsConnectorDetail | null,
  connectorId = "connector-1",
) {
  return render(
    <DataOpsConnectorDetailDrawer
      connectorId={connectorId}
      detail={detail}
      repository={null}
      onClose={vi.fn()}
    />,
  );
}

describe("DataOpsConnectorDetailDrawer", () => {
  it("renders the connector name in the drawer title (AC-DATAOPS-8)", () => {
    renderDrawer(DETAIL);
    expect(screen.getByText("github-connector")).toBeInTheDocument();
  });

  it("renders recent run status (AC-DATAOPS-8)", () => {
    renderDrawer(DETAIL);
    expect(screen.getByText("FAILED")).toBeInTheDocument();
  });

  it("renders data quality checks (AC-DATAOPS-3, AC-DATAOPS-8)", () => {
    renderDrawer(DETAIL);
    expect(screen.getByText("GITHUB")).toBeInTheDocument();
    expect(
      screen.getByText("Pages.DataOpsDashboard.detail.parseErrorCount:2"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Malformed heading; missing closing fence"),
    ).toBeInTheDocument();
  });

  it("renders missing evidence details for each missing file or section", () => {
    renderDrawer(DETAIL);
    expect(screen.getByText("spec-pack.md")).toBeInTheDocument();
    expect(screen.getByText("scope")).toBeInTheDocument();
    expect(screen.getByText("open_issues")).toBeInTheDocument();
  });

  it("shows no-runs message when recentRuns is empty (AC boundary case)", () => {
    renderDrawer({ ...DETAIL, recentRuns: [] });
    expect(
      screen.getByText("Pages.DataOpsDashboard.detail.noRuns"),
    ).toBeInTheDocument();
  });

  it("shows no-data-quality-issues message when dataQualityChecks is empty (AC boundary case)", () => {
    renderDrawer({ ...DETAIL, dataQualityChecks: [] });
    expect(
      screen.getByText("Pages.DataOpsDashboard.detail.noDataQualityIssues"),
    ).toBeInTheDocument();
  });

  it("shows empty state text when detail is null (AC boundary case)", () => {
    renderDrawer(null);
    expect(
      screen.getByText("Pages.DataOpsDashboard.emptyState"),
    ).toBeInTheDocument();
  });

  it("renders no editable form fields — drawer is read-only (AC-DATAOPS-10)", () => {
    const { container } = renderDrawer(DETAIL);
    expect(container.querySelectorAll("input, textarea").length).toBe(0);
  });
});
