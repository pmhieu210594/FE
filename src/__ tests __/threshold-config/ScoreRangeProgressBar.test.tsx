// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScoreRangeProgressBar } from "@/pages/threshold-config/components/ScoreRangeProgressBar";
import type { EditableThresholdRow } from "@/pages/threshold-config/types";

function row(overrides: Partial<EditableThresholdRow> = {}): EditableThresholdRow {
  return {
    rowKey: "k1",
    code: "EXCELLENT",
    label: "Excellent",
    minScore: 90,
    maxScore: 100,
    color: "#10B981",
    status: "ACTIVE",
    ...overrides,
  };
}

function segmentDivs(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLDivElement>("[style*='width']"));
}

describe("ScoreRangeProgressBar", () => {
  afterEach(() => cleanup());

  it("renders one segment per active row, sized and colored from its range", () => {
    const rows = [
      row({ rowKey: "1", minScore: 0, maxScore: 39, color: "#F43F5E" }),
      row({ rowKey: "2", minScore: 40, maxScore: 100, color: "#10B981" }),
    ];
    const { container } = render(<ScoreRangeProgressBar rows={rows} />);

    const segments = segmentDivs(container);
    expect(segments).toHaveLength(2);
    expect(segments[0].style.width).toBe("40%");
    expect(segments[0].style.backgroundColor).toBe("rgb(244, 63, 94)");
    expect(segments[1].style.width).toBe("61%");
    expect(segments[1].style.backgroundColor).toBe("rgb(16, 185, 129)");
  });

  it("recolors and resizes in realtime as the underlying rows change", () => {
    const initialRows = [row({ rowKey: "1", minScore: 0, maxScore: 49, color: "#F43F5E" })];
    const { container, rerender } = render(<ScoreRangeProgressBar rows={initialRows} />);

    expect(segmentDivs(container)[0].style.width).toBe("50%");
    expect(segmentDivs(container)[0].style.backgroundColor).toBe("rgb(244, 63, 94)");

    const editedRows = [row({ rowKey: "1", minScore: 0, maxScore: 79, color: "#10B981" })];
    rerender(<ScoreRangeProgressBar rows={editedRows} />);

    expect(segmentDivs(container)[0].style.width).toBe("80%");
    expect(segmentDivs(container)[0].style.backgroundColor).toBe("rgb(16, 185, 129)");
  });

  it("excludes pending-delete rows from the rendered segments", () => {
    const rows = [
      row({ rowKey: "1", minScore: 0, maxScore: 100 }),
      row({ rowKey: "2", status: "DELETE", minScore: 50, maxScore: 60 }),
    ];
    const { container } = render(<ScoreRangeProgressBar rows={rows} />);

    expect(segmentDivs(container)).toHaveLength(1);
  });

  it("falls back to a neutral gray segment for a row with an invalid color", () => {
    const rows = [row({ minScore: 0, maxScore: 100, color: "not-a-color" })];
    const { container } = render(<ScoreRangeProgressBar rows={rows} />);

    expect(segmentDivs(container)[0].style.backgroundColor).toBe("rgb(209, 213, 219)");
  });
});
