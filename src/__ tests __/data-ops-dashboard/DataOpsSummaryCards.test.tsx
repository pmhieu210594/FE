import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataOpsSummaryCards } from "@/pages/data-ops-dashboard/components/DataOpsSummaryCards";
import type { DataOpsDashboardSummary } from "@/pages/data-ops-dashboard/types";

afterEach(cleanup);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const ZERO_SUMMARY: DataOpsDashboardSummary = {
  connectorFailureCount: 0,
  parseErrorCount: 0,
  missingEvidenceCount: 0,
  staleFreshnessCount: 0,
  brokenLinkCount: 0,
};

const FULL_SUMMARY: DataOpsDashboardSummary = {
  connectorFailureCount: 4,
  parseErrorCount: 3,
  missingEvidenceCount: 2,
  staleFreshnessCount: 1,
  brokenLinkCount: 5,
};

describe("DataOpsSummaryCards", () => {
  it("renders Connector Status KPI (AC-DATAOPS-2)", () => {
    render(<DataOpsSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders Parse Errors KPI (AC-DATAOPS-3)", () => {
    render(<DataOpsSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders Missing Evidence KPI (AC-DATAOPS-4)", () => {
    render(<DataOpsSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders Freshness KPI (AC-DATAOPS-5)", () => {
    render(<DataOpsSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders Broken Links KPI (AC-DATAOPS-6)", () => {
    render(<DataOpsSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("zero-state: all 5 KPI cards display 0 (AC-DATAOPS-2..6 boundary case)", () => {
    render(<DataOpsSummaryCards summary={ZERO_SUMMARY} />);
    expect(screen.getAllByText("0")).toHaveLength(5);
  });

  it("renders exactly 5 KPI cards in the grid (AC-DATAOPS-1)", () => {
    const { container } = render(
      <DataOpsSummaryCards summary={FULL_SUMMARY} />,
    );
    const grid = container.querySelector(".grid");
    expect(grid?.children).toHaveLength(5);
  });
});
