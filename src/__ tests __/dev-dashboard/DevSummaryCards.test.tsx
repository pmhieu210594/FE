import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DevSummaryCards } from "@/pages/development-dashboard/components/DevSummaryCards";
import type { DevDashboardSummary } from "@/pages/development-dashboard/types";

afterEach(cleanup);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const ZERO_SUMMARY: DevDashboardSummary = {
  ciFailureCount: 0,
  reviewCommentCount: 0,
  parserErrorCount: 0,
};

const FULL_SUMMARY: DevDashboardSummary = {
  ciFailureCount: 5,
  reviewCommentCount: 3,
  parserErrorCount: 2,
};

describe("DevSummaryCards", () => {
  it("renders CI Failure count (AC-2)", () => {
    render(<DevSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders Review Finding count (AC-3)", () => {
    render(<DevSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders Parser Error count (AC-4)", () => {
    render(<DevSummaryCards summary={FULL_SUMMARY} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("zero-state: all three KPI cards display 0 (AC-2, AC-3, AC-4)", () => {
    render(<DevSummaryCards summary={ZERO_SUMMARY} />);
    expect(screen.getAllByText("0")).toHaveLength(3);
  });

  it("renders exactly 3 KPI cards in the grid (AC-1)", () => {
    const { container } = render(<DevSummaryCards summary={FULL_SUMMARY} />);
    const grid = container.querySelector(".grid");
    expect(grid?.children).toHaveLength(3);
  });

  it("renders title i18n keys for all 3 cards", () => {
    const { container } = render(<DevSummaryCards summary={FULL_SUMMARY} />);
    expect(container.textContent).toContain(
      "Pages.DevDashboard.cards.ciFailure.title",
    );
    expect(container.textContent).toContain(
      "Pages.DevDashboard.cards.reviewComment.title",
    );
    expect(container.textContent).toContain(
      "Pages.DevDashboard.cards.parserError.title",
    );
  });
});
