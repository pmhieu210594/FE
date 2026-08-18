import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QaSummaryCards } from "@/pages/qa-dashboard/components/QaSummaryCards";
import type { QaSummary } from "@/pages/qa-dashboard/types";

afterEach(cleanup);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const ZERO_SUMMARY: QaSummary = {
  acTestCoveragePercent: 0,
  acNotTestedCount: 0,
  blackboxCoveragePercent: 0,
  testResultsPassPercent: 0,
  defectLeakageCount: 0,
  acceptanceReadyCount: 0,
  updatedAt: "",
};

const FULL_SUMMARY: QaSummary = {
  acTestCoveragePercent: 60,
  acNotTestedCount: 2,
  blackboxCoveragePercent: 50,
  testResultsPassPercent: 80,
  defectLeakageCount: 1,
  acceptanceReadyCount: 0,
  updatedAt: "2026-06-29T00:00:00Z",
};

describe("QaSummaryCards", () => {
  it("renders AC-test coverage as a percentage string (AC-2)", () => {
    render(<QaSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("renders AC not-tested count (AC-3)", () => {
    render(<QaSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders test-results pass percent (AC-5)", () => {
    render(<QaSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("zero-state: all displayed values are 0 / 0% (AC-2, AC-5)", () => {
    render(<QaSummaryCards summary={ZERO_SUMMARY} />);
    const zeroPercent = screen.getAllByText("0%");
    expect(zeroPercent.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders exactly 3 KPI cards in the grid", () => {
    const { container } = render(<QaSummaryCards summary={FULL_SUMMARY} />);
    const grid = container.querySelector(".grid");
    expect(grid?.children).toHaveLength(3);
  });

  it("renders title i18n keys for all 3 cards", () => {
    const { container } = render(<QaSummaryCards summary={FULL_SUMMARY} />);
    expect(container.textContent).toContain(
      "Pages.QaDashboard.cards.acTestCoverage.title",
    );
    expect(container.textContent).toContain(
      "Pages.QaDashboard.cards.acNotTested.title",
    );
    expect(container.textContent).toContain(
      "Pages.QaDashboard.cards.testResults.title",
    );
  });
});
