import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuditLogListItem } from "@/pages/admin-audit-log/types";
import { AuditLogSummaryCards } from "@/pages/admin-audit-log/components/AuditLogSummaryCards";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/dashboard/SummaryCard", () => ({
  SummaryCard: ({
    title,
    description,
    value,
    tone,
  }: {
    title: string;
    description: string;
    value: string | number;
    tone: string;
  }) => (
    <article data-testid={`summary-card-${title}`} data-tone={tone}>
      <h2>{title}</h2>
      <p>{description}</p>
      <strong>{value}</strong>
    </article>
  ),
}));

afterEach(cleanup);

describe("AuditLogSummaryCards", () => {
  it("computes current-page totals and module count", () => {
    const items: AuditLogListItem[] = [
      {
        id: "1",
        occurredAt: "2026-07-09T10:00:00Z",
        actorUsername: "admin@example.com",
        module: "ROLE",
        entityType: "ROLE",
        entityId: "role-1",
        operationType: "CREATE",
      },
      {
        id: "2",
        occurredAt: "2026-07-09T10:05:00Z",
        actorUsername: "admin@example.com",
        module: "ROLE",
        entityType: "ROLE",
        entityId: "role-2",
        operationType: "UPDATE",
      },
      {
        id: "3",
        occurredAt: "2026-07-09T10:10:00Z",
        actorUsername: "audit@example.com",
        module: "LOGIN",
        entityType: "LOGIN_SESSION",
        entityId: null,
        operationType: "LOGIN_SUCCESS",
      },
    ];

    render(<AuditLogSummaryCards items={items} totalElements={17} />);

    expect(
      screen.getByTestId("summary-card-Pages.AdminAuditLog.cards.total.title"),
    ).toHaveTextContent("17");
    expect(
      screen.getByTestId(
        "summary-card-Pages.AdminAuditLog.cards.modules.title",
      ),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId(
        "summary-card-Pages.AdminAuditLog.cards.modules.title",
      ),
    ).toHaveAttribute("data-tone", "purple");
  });
});
