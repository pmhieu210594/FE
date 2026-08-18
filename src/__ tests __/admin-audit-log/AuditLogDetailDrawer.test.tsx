import "@testing-library/jest-dom/vitest";

import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuditLogDetail } from "@/pages/admin-audit-log/types";
import { AuditLogDetailDrawer } from "@/pages/admin-audit-log/components/AuditLogDetailDrawer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("antd", () => ({
  Drawer: ({
    open,
    title,
    children,
    onClose,
  }: {
    open: boolean;
    title: string;
    children?: ReactNode;
    onClose?: () => void;
  }) =>
    open ? (
      <section role="dialog" aria-label={title}>
        <button type="button" onClick={onClose}>
          close
        </button>
        {children}
      </section>
    ) : null,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <header>{children}</header>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock("@/lib/utils", () => ({
  formatDateTime: (value: string | null | undefined) => value ?? "-",
}));

afterEach(cleanup);

describe("AuditLogDetailDrawer", () => {
  it("renders read-only diff and login context", () => {
    const detail: AuditLogDetail = {
      id: "22222222-2222-2222-2222-222222222222",
      occurredAt: "2026-07-09T10:05:00Z",
      actorUserId: "11111111-1111-1111-1111-111111111111",
      actorUsername: "admin@example.com",
      actorRoleName: "ADMIN",
      module: "ROLE",
      entityType: "ROLE",
      entityId: "role-1",
      operationType: "UPDATE",
      changedFields: "name",
      beforeValue: '{"name":"before"}',
      afterValue: '{"name":"after"}',
      userAgent: "Mozilla/5.0",
      errorMessage: null,
      traceId: "trc_detail_01",
    };

    render(<AuditLogDetailDrawer detail={detail} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("ROLE")).toBeInTheDocument();
    expect(screen.getByText("UPDATE")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com (ADMIN)")).toBeInTheDocument();
    expect(screen.getByText("trc_detail_01")).toBeInTheDocument();
    expect(screen.getByText(/"name": "before"/)).toBeInTheDocument();
    expect(screen.getByText(/"name": "after"/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /edit/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });
});
