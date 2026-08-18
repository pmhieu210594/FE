import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DevTicketTable } from "@/pages/development-dashboard/components/DevTicketTable";
import type { DevTicketRow } from "@/pages/development-dashboard/types";

afterEach(cleanup);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number; defaultValue?: string }) => {
      if (options?.count !== undefined) return `${key}:${options.count}`;
      return options?.defaultValue ?? key;
    },
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const ROW = {
  ticketId: "ticket-1",
  projectId: "proj-1",
  projectAlias: "EDCAP Alpha",
  externalTicketKey: "EC-42",
  title: "Implement dashboard",
  ticketStatus: "IN_PROGRESS",
  ciFailCount: 1,
  latestCiStatus: "FAILURE",
  openFindingCount: 2,
  reviewCommentCount: 2,
  reviewRoundCount: 4,
  parserErrorFlag: true,
  ageDays: 3,
  artifactVersion: 1,
} as DevTicketRow;

const ROW_2 = {
  ...ROW,
  ticketId: "ticket-2",
  externalTicketKey: "EC-43",
  latestCiStatus: "SUCCESS",
  reviewCommentCount: 0,
  reviewRoundCount: 0,
  parserErrorFlag: false,
} as DevTicketRow;

function renderTable(
  overrides: Partial<Parameters<typeof DevTicketTable>[0]> = {},
) {
  const onSelect = vi.fn();
  const onPageChange = vi.fn();
  const onPerPageChange = vi.fn();
  render(
    <DevTicketTable
      rows={[ROW, ROW_2]}
      totalElements={2}
      page={1}
      perPage={20}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      onSelect={onSelect}
      {...overrides}
    />,
  );
  return { onSelect, onPageChange, onPerPageChange };
}

describe("DevTicketTable", () => {
  it("renders a row per ticket (AC-1)", () => {
    renderTable();
    expect(screen.getByText("EC-42")).toBeInTheDocument();
    expect(screen.getByText("EC-43")).toBeInTheDocument();
  });

  it("renders no ticket rows when the rows list is empty (AC boundary case)", () => {
    renderTable({ rows: [], totalElements: 0 });
    expect(screen.queryByText("EC-42")).not.toBeInTheDocument();
    expect(screen.queryByTitle("View detail")).not.toBeInTheDocument();
  });

  it("clicking the view-detail action calls onSelect with the ticketId (AC-6)", () => {
    const { onSelect } = renderTable({ rows: [ROW], totalElements: 1 });
    fireEvent.click(screen.getByTitle("View detail"));
    expect(onSelect).toHaveBeenCalledWith("ticket-1");
  });

  it("renders CI failure badge for FAILURE status", () => {
    renderTable({ rows: [ROW], totalElements: 1 });
    expect(screen.getByText("FAILURE")).toBeInTheDocument();
  });

  it("renders parser error indicator per row (AC-4)", () => {
    renderTable();
    expect(
      screen.getByText("Pages.DevDashboard.ticketTable.parserErrorYes"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pages.DevDashboard.ticketTable.parserErrorNo"),
    ).toBeInTheDocument();
  });

  it("renders the rework rounds column as reviewRoundCount - 1, and 0 when there are none", () => {
    renderTable({ rows: [ROW, ROW_2], totalElements: 2 });
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });

  it("renders the review rounds column as the raw reviewRoundCount", () => {
    renderTable({ rows: [ROW], totalElements: 1 });
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
