import "@testing-library/jest-dom/vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const roleApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  logicalDelete: vi.fn(),
}));

const messageMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  useAuthState: {
    user: { role: "ADMIN" as "VIEWER" | "EDITOR" | "ADMIN" },
  },
}));

const drawerMocks = vi.hoisted(() => ({
  submitValue: {
    roleName: " PM_UI ",
    description: " Product management role ",
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, props?: { roleName?: string; defaultValue?: string }) => {
      if (props?.defaultValue) return props.defaultValue;
      if (key === "Pages.RoleManagement.DeleteConfirm" && props?.roleName) {
        return `Delete role ${props.roleName}?`;
      }
      return key;
    },
  }),
}));

vi.mock("antd", () => ({
  message: messageMocks,
  Popconfirm: ({
    children,
    title,
    onConfirm,
  }: {
    children: React.ReactNode;
    title?: string;
    onConfirm?: () => void;
  }) => (
    <div>
      <span role="note">{title}</span>
      {children}
      <button type="button" onClick={onConfirm}>
        confirm-delete
      </button>
    </div>
  ),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authMocks.useAuthState,
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  endpoints: { roles: roleApiMocks },
}));

const utilsMocks = vi.hoisted(() => ({
  formatDateTime: vi.fn((value: string | null | undefined) =>
    value ? `formatted:${value}` : "",
  ),
}));

vi.mock("@/lib/utils", () => ({
  formatDateTime: utilsMocks.formatDateTime,
  cn: (...classes: Array<string | undefined | false>) =>
    classes.filter(Boolean).join(" "),
}));

vi.mock("@/components/ui/button", () => ({
  CButton: ({ text, onClick }: { text: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {text}
    </button>
  ),
}));

vi.mock("@/components/ui/search", () => ({
  CSearch: ({
    value,
    onTableChange,
  }: {
    value: string;
    onTableChange: (value: string) => void;
  }) => (
    <input
      aria-label="role-search"
      value={value}
      onChange={(event) => onTableChange(event.currentTarget.value)}
    />
  ),
}));

vi.mock("@/components/ui/svg-icon", () => ({
  CSvgIcon: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  CTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/drawer", () => ({
  CDrawerForm: ({
    open,
    title,
    showSubmit,
    textSubmit,
    textCancel,
    onClose,
    onSubmit,
    children,
  }: {
    open: boolean;
    title: string;
    showSubmit?: boolean;
    textSubmit?: string;
    textCancel?: string;
    onClose?: () => void;
    onSubmit?: (payload: { value: unknown }) => void;
    children?: React.ReactNode;
  }) =>
    open ? (
      <section role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
        {showSubmit ? (
          <button
            type="button"
            onClick={() => onSubmit?.({ value: drawerMocks.submitValue })}
          >
            {textSubmit}
          </button>
        ) : null}
        <button type="button" onClick={onClose}>
          {textCancel}
        </button>
      </section>
    ) : null,
}));

vi.mock("@/components/ui/server-table", () => ({
  CServerTable: ({
    data,
    leftHeader,
    columns,
    pagination,
    action,
  }: {
    data: Array<Record<string, string>>;
    columns?: Array<{
      name: string;
      tableItem?: {
        render?: (
          value: string,
          row: Record<string, string>,
        ) => React.ReactNode;
      };
    }>;
    leftHeader?: React.ReactNode;
    pagination?: {
      total: number;
      page: number;
      perPage: number;
      onChange: (payload: { page: number; perPage: number }) => void;
    };
    action?: {
      labelAdd?: string;
      onAdd?: () => void;
      render?: (row: Record<string, string>) => React.ReactNode;
    };
  }) => (
    <div>
      <div>{leftHeader}</div>
      {action?.labelAdd ? (
        <button type="button" onClick={action.onAdd}>
          {action.labelAdd}
        </button>
      ) : null}
      <table>
        <tbody>
          {data.map((row) => (
            <tr key={row.roleId}>
              {columns?.map((column) => (
                <td key={`${row.roleId}-${column.name}`}>
                  {column.tableItem?.render
                    ? column.tableItem.render(row[column.name], row)
                    : row[column.name]}
                </td>
              ))}
              <td>{action?.render?.(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagination ? (
        <>
          <button
            type="button"
            onClick={() =>
              pagination.onChange({
                page: 1,
                perPage: 1,
              })
            }
          >
            set-per-page-1
          </button>
          <button
            type="button"
            onClick={() =>
              pagination.onChange({
                page: 2,
                perPage: 1,
              })
            }
          >
            next-page
          </button>
        </>
      ) : null}
    </div>
  ),
}));

import { RolePage } from "@/pages/RolePage";

const roleRow = {
  roleId: "role-1",
  roleName: "PM",
  description: "Product Manager",
  status: "ACTIVE",
  createdAt: "2026-06-11T00:00:00Z",
  updatedAt: "2026-06-12T00:00:00Z",
};

const secondRoleRow = {
  roleId: "role-2",
  roleName: "QA",
  description: "Quality Assurance",
  status: "ACTIVE",
  createdAt: "2026-06-13T00:00:00Z",
  updatedAt: "2026-06-14T00:00:00Z",
};

function renderRolePage() {
  cleanup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RolePage />
    </QueryClientProvider>,
  );
}

describe("RolePage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.useAuthState = {
      user: { role: "ADMIN" },
    };
    drawerMocks.submitValue = {
      roleName: " PM_UI ",
      description: " Product management role ",
    };
    roleApiMocks.list.mockResolvedValue([roleRow, secondRoleRow]);
    roleApiMocks.get.mockResolvedValue(roleRow);
    roleApiMocks.create.mockResolvedValue({
      ...roleRow,
      roleId: "role-created",
      roleName: "PM_UI",
      description: "Product management role",
    });
    roleApiMocks.update.mockResolvedValue({
      ...roleRow,
      roleName: "PM_UI",
      description: "Product management role",
    });
    roleApiMocks.logicalDelete.mockResolvedValue(roleRow);
  });

  it("renders the role list and uses raw list parameters for search and status", async () => {
    renderRolePage();

    expect((await screen.findAllByText("PM")).length).toBeGreaterThan(0);
    expect(roleApiMocks.list).toHaveBeenCalledWith({
      keyword: undefined,
      status: "ACTIVE",
    });

    fireEvent.change(screen.getByLabelText("role-search"), {
      target: { value: "qa" },
    });

    await waitFor(() =>
      expect(roleApiMocks.list).toHaveBeenLastCalledWith({
        keyword: "qa",
        status: "ACTIVE",
      }),
    );
  });

  it("keeps pagination controls wired without triggering a refetch-only flow", async () => {
    renderRolePage();

    const listCallCount = roleApiMocks.list.mock.calls.length;
    fireEvent.click(screen.getByText("set-per-page-1"));
    fireEvent.click(screen.getByText("next-page"));

    expect((await screen.findAllByText("PM")).length).toBeGreaterThan(0);
    expect(roleApiMocks.list).toHaveBeenCalledTimes(listCallCount);
  });

  it("allows an admin to create a role with trimmed payload", async () => {
    renderRolePage();

    const createButtons = await screen.findAllByRole("button", {
      name: "Pages.RoleManagement.create",
    });
    fireEvent.click(createButtons[0]);
    fireEvent.click(screen.getByText("Pages.RoleManagement.Form.Save"));

    await waitFor(() =>
      expect(roleApiMocks.create).toHaveBeenCalledWith({
        roleName: "PM_UI",
        description: "Product management role",
      }),
    );
    expect(messageMocks.success).toHaveBeenCalledWith(
      "Pages.RoleManagement.Message.Created",
    );
  });

  it("allows an editor to open edit dialog and submit trimmed values", async () => {
    authMocks.useAuthState = {
      user: { role: "EDITOR" },
    };

    renderRolePage();

    expect((await screen.findAllByText("PM")).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByTitle("Pages.RoleManagement.edit")[0]);
    fireEvent.click(screen.getByText("Pages.RoleManagement.Form.Save"));

    await waitFor(() =>
      expect(roleApiMocks.update).toHaveBeenCalledWith("role-1", {
        roleName: "PM_UI",
        description: "Product management role",
      }),
    );
    expect(messageMocks.success).toHaveBeenCalledWith(
      "Pages.RoleManagement.Message.Updated",
    );
  });

  it("opens detail view for a viewer without edit and delete actions", async () => {
    authMocks.useAuthState = {
      user: { role: "VIEWER" },
    };

    renderRolePage();

    expect((await screen.findAllByText("PM")).length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("button", { name: "Pages.RoleManagement.create" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle("Pages.RoleManagement.edit"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle("Pages.RoleManagement.delete"),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getAllByTitle("Pages.RoleManagement.detailTitle")[0],
    );

    expect(
      await screen.findByRole("dialog", {
        name: "Pages.RoleManagement.detailTitle",
      }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(roleApiMocks.get).toHaveBeenCalledWith("role-1"),
    );
    expect(
      screen.getAllByText(`formatted:${roleRow.createdAt}`).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(`formatted:${roleRow.updatedAt}`).length,
    ).toBeGreaterThan(0);
  });

  it("calls logical delete only for admin actions", async () => {
    renderRolePage();

    fireEvent.click(
      (await screen.findAllByTitle("Pages.RoleManagement.delete"))[0],
    );

    expect(roleApiMocks.logicalDelete).not.toHaveBeenCalled();
    expect(screen.getAllByRole("note")[0]).toHaveTextContent("Delete role PM?");
    fireEvent.click(screen.getAllByText("confirm-delete")[0]);

    await waitFor(() =>
      expect(roleApiMocks.logicalDelete).toHaveBeenCalledWith("role-1"),
    );
    expect(messageMocks.success).toHaveBeenCalledWith(
      "Pages.RoleManagement.Message.Deleted",
    );
  });
});
