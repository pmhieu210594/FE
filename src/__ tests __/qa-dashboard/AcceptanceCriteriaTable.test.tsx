import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AcceptanceCriteriaTable } from "@/pages/qa-dashboard/components/AcceptanceCriteriaTable";
import type { AcceptanceCriteriaRow } from "@/pages/qa-dashboard/types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === "Pages.QaDashboard.acceptanceCriteria.totalItems") {
        return `${String(options?.count ?? 0)} items`;
      }
      return key;
    },
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const AC_ROWS: AcceptanceCriteriaRow[] = [
  {
    acId: "AC-1",
    ticketKey: "EC-10",
    status: "PASSED",
    blackbox: "Yes",
    gap: "",
  },
  {
    acId: "AC-2",
    ticketKey: "EC-10",
    status: "PARTIAL",
    blackbox: "Partial",
    gap: "partial gap",
  },
  {
    acId: "AC-3",
    ticketKey: "EC-11",
    status: "NOT_TESTED",
    blackbox: "No",
    gap: "no coverage",
  },
];

afterEach(cleanup);

type TableProps = Parameters<typeof AcceptanceCriteriaTable>[0];

function renderTable(
  rows: AcceptanceCriteriaRow[],
  overrides: Partial<TableProps> = {},
) {
  const onPageChange = vi.fn();
  const onPerPageChange = vi.fn();
  render(
    <AcceptanceCriteriaTable
      rows={rows}
      totalElements={rows.length}
      page={0}
      perPage={10}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      {...overrides}
    />,
  );
  return { onPageChange, onPerPageChange };
}

describe("AcceptanceCriteriaTable", () => {
  it("renders acId, ticketKey and status badge for each row (AC-3)", () => {
    renderTable(AC_ROWS);
    expect(screen.getByText("AC-1")).toBeInTheDocument();
    expect(screen.getByText("AC-2")).toBeInTheDocument();
    expect(screen.getByText("AC-3")).toBeInTheDocument();
    expect(screen.getAllByText("EC-10")).toHaveLength(2);
    expect(screen.getByText("EC-11")).toBeInTheDocument();
    expect(screen.getByText("Passed")).toBeInTheDocument();
    expect(screen.getByText("Partial")).toBeInTheDocument();
    expect(screen.getByText("Not Tested")).toBeInTheDocument();
  });

  it("renders the section title", () => {
    renderTable(AC_ROWS);
    expect(
      screen.getByText("Pages.QaDashboard.acceptanceCriteria.title"),
    ).toBeInTheDocument();
  });
});
