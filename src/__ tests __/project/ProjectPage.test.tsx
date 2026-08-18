import "@testing-library/jest-dom/vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const projectApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));

const customerApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
}));

const teamApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
}));

const messageMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const drawerMocks = vi.hoisted(() => ({
  projectValue: {
    customerId: "customer-1",
    projectAlias: " UI Project ",
    projectType: " Internal ",
    riskLevel: "HIGH",
    teamIds: ["team-1"],
  },
  filterValue: {
    customerId: "",
    status: "DELETED",
  },
  projectTeamValue: {
    teamId: "team-2",
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, props?: { defaultValue?: string }) =>
      props?.defaultValue ?? key,
  }),
}));

vi.mock("antd", () => ({
  message: messageMocks,
  Modal: ({
    open,
    title,
    children,
    footer,
    onCancel,
  }: {
    open: boolean;
    title: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    onCancel?: () => void;
  }) =>
    open ? (
      <section
        role="dialog"
        aria-label={typeof title === "string" ? title : "modal"}
      >
        <div>{title}</div>
        <button type="button" onClick={onCancel}>
          modal-close
        </button>
        {children}
        {footer}
      </section>
    ) : null,
  Popconfirm: ({
    children,
    onConfirm,
    disabled,
  }: {
    children: React.ReactNode;
    onConfirm?: () => void;
    disabled?: boolean;
  }) => (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      data-testid={disabled ? "disabled-popconfirm" : "enabled-popconfirm"}
      onClick={() => {
        if (!disabled) onConfirm?.();
      }}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          onConfirm?.();
        }
      }}
      aria-disabled={disabled}
    >
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/form", () => ({
  CForm: React.forwardRef(
    (
      { onSubmit }: { onSubmit?: (payload: { value: any }) => void },
      ref: React.ForwardedRef<{ handleSubmit: () => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({
        handleSubmit: () => onSubmit?.({ value: drawerMocks.projectTeamValue }),
      }));
      return <div data-testid="project-team-form" />;
    },
  ),
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  endpoints: {
    projects: projectApiMocks,
    customers: customerApiMocks,
    teams: teamApiMocks,
  },
}));

vi.mock("@/lib/utils", () => ({
  formatDateTime: (value: string | null | undefined) => value ?? "",
}));

vi.mock("@/components/ui/button", () => ({
  CButton: ({
    text,
    onClick,
    disabled,
  }: {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {text}
    </button>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
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
      aria-label="project-search"
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
    columns = [],
    showSubmit,
    textSubmit,
    textCancel,
    onClose,
    onSubmit,
    children,
  }: {
    open: boolean;
    title: string;
    columns?: Array<{
      name: string;
      title: string;
      formItem?: { list?: Array<{ value: string; label: string }> };
    }>;
    showSubmit?: boolean;
    textSubmit?: string;
    textCancel?: string;
    onClose?: () => void;
    onSubmit?: (payload: { value: any }) => void;
    children?: React.ReactNode;
  }) => {
    if (!open) return null;
    const isFilter = title === "Pages.Project.filters";
    const value = isFilter ? drawerMocks.filterValue : drawerMocks.projectValue;
    return (
      <section role="dialog" aria-label={title}>
        <h2>{title}</h2>
        <div data-testid={`${title}-fields`}>
          {columns.map((column) => (
            <div key={column.name} data-testid={`field-${column.name}`}>
              <span>{column.title}</span>
              {column.formItem?.list?.map((item) => (
                <span
                  key={item.value}
                  data-testid={`option-${column.name}-${item.value}`}
                >
                  {item.label}
                </span>
              ))}
            </div>
          ))}
        </div>
        {children}
        {showSubmit ? (
          <button type="button" onClick={() => onSubmit?.({ value })}>
            {textSubmit}
          </button>
        ) : null}
        <button type="button" onClick={onClose}>
          {textCancel}
        </button>
      </section>
    );
  },
}));

vi.mock("@/components/ui/server-table", () => ({
  CServerTable: ({
    columns = [],
    data,
    leftHeader,
    action,
    showSearch,
  }: {
    columns?: any[];
    data: any[];
    leftHeader?: React.ReactNode;
    action?: any;
    showSearch?: boolean;
  }) => (
    <div>
      {leftHeader ? <div>{leftHeader}</div> : null}
      {action?.labelAdd ? (
        <button type="button" onClick={action.onAdd}>
          {action.labelAdd}
        </button>
      ) : null}
      <table
        aria-label={
          showSearch === false && data.every((row) => "teamId" in row)
            ? "project-team-assignment-table"
            : "project-list-table"
        }
      >
        <thead>
          <tr>
            {action ? <th>{action.label}</th> : null}
            {columns.map((column) => (
              <th key={column.name ?? column.title}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.projectId ?? row.teamId}>
              {action ? <td>{action.render?.(row)}</td> : null}
              {columns.map((column, index) => {
                const value = column.name ? row[column.name] : undefined;
                return (
                  <td key={column.name ?? index}>
                    {column.tableItem?.render
                      ? column.tableItem.render(value, row)
                      : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

import { ProjectPage } from "@/pages/ProjectPage";
import { ApiError } from "@/lib/api";

const activeCustomer = {
  customerId: "customer-1",
  customerAlias: "Customer One",
};

const activeTeam = {
  teamId: "team-1",
  teamCode: "TEAM001",
  teamName: "Platform Team",
  memberCount: 5,
};

const activeTeamTwo = {
  teamId: "team-2",
  teamCode: "TEAM002",
  teamName: "Delivery Team",
  memberCount: 8,
};

const activeProject = {
  projectId: "project-1",
  customerId: "customer-1",
  customerName: "Customer One",
  projectAlias: "Project Active",
  projectType: "Internal",
  riskLevel: "MEDIUM",
  status: "ACTIVE",
  deleteFlag: false,
  createdAt: "2026-06-16T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2026-06-16T00:00:00Z",
  updatedBy: "admin",
  deletedAt: null,
  deletedBy: null,
  teamAssignments: [
    {
      projectTeamId: "pta-1",
      teamId: "team-1",
      teamCode: "TEAM001",
      teamName: "Platform Team",
      status: "ACTIVE",
      createdAt: "2026-06-16T00:00:00Z",
      createdBy: "admin",
      updatedAt: "2026-06-16T00:00:00Z",
      updatedBy: "admin",
      deletedAt: null,
      deletedBy: null,
    },
  ],
};

const deletedProject = {
  ...activeProject,
  projectId: "project-deleted",
  projectAlias: "Project Deleted",
  status: "DELETED",
  deleteFlag: true,
  deletedAt: "2026-06-17T00:00:00Z",
};

function renderProjectPage() {
  cleanup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectPage />
    </QueryClientProvider>,
  );
}

describe("ProjectPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    drawerMocks.projectValue = {
      customerId: "customer-1",
      projectAlias: " UI Project ",
      projectType: " Internal ",
      riskLevel: "HIGH",
      teamIds: ["team-1"],
    };
    drawerMocks.filterValue = {
      customerId: "",
      status: "DELETED",
    };
    drawerMocks.projectTeamValue = {
      teamId: "team-2",
    };

    customerApiMocks.list.mockResolvedValue({
      items: [activeCustomer],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1,
    });
    teamApiMocks.list.mockResolvedValue({
      items: [activeTeam, activeTeamTwo],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1,
    });
    projectApiMocks.list.mockResolvedValue({
      items: [activeProject],
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
    });
    projectApiMocks.get.mockResolvedValue(activeProject);
    projectApiMocks.create.mockResolvedValue({
      ...activeProject,
      projectId: "project-created",
      projectAlias: "UI Project",
      projectType: "Internal",
      riskLevel: "HIGH",
    });
    projectApiMocks.update.mockResolvedValue({
      ...activeProject,
      projectAlias: "UI Project",
      projectType: "Internal",
      riskLevel: "HIGH",
    });
    projectApiMocks.softDelete.mockResolvedValue({
      ...activeProject,
      status: "DELETED",
      deleteFlag: true,
      deletedAt: "2026-06-17T00:00:00Z",
    });
  });

  it("opens detail drawer for active project and still fetches detail API", async () => {
    renderProjectPage();

    const detailButtons = await screen.findAllByTitle(
      "Pages.Project.detailTitle",
    );
    fireEvent.click(detailButtons[0]);

    const dialog = await screen.findByRole("dialog", {
      name: "Pages.Project.detailTitle",
    });
    expect(
      await within(dialog).findByText("Project Active"),
    ).toBeInTheDocument();
    const table = await within(dialog).findByRole("table", {
      name: "project-team-assignment-table",
    });
    const headers = within(table).getAllByRole("columnheader");
    expect(headers.map((header) => header.textContent)).toEqual([
      "Pages.Team.teamCode",
      "Pages.Team.teamName",
      "Pages.Team.memberCount",
    ]);
    expect(within(table).getByText("TEAM001")).toBeInTheDocument();
    expect(within(table).getByText("Platform Team")).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Add team" }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(projectApiMocks.get).toHaveBeenCalledWith("project-1"),
    );
  });

  it("opens detail drawer for deleted project immediately without calling detail API", async () => {
    projectApiMocks.list.mockResolvedValueOnce({
      items: [deletedProject],
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
    });

    renderProjectPage();

    const detailButtons = await screen.findAllByTitle(
      "Pages.Project.detailTitle",
    );
    fireEvent.click(detailButtons[0]);

    const dialog = await screen.findByRole("dialog", {
      name: "Pages.Project.detailTitle",
    });
    expect(within(dialog).getByText("Project Deleted")).toBeInTheDocument();
    expect(within(dialog).getByText("Customer One")).toBeInTheDocument();
    const table = within(dialog).getByRole("table", {
      name: "project-team-assignment-table",
    });
    expect(within(table).getByText("Platform Team")).toBeInTheDocument();
    expect(
      within(dialog).queryByText("Pages.Project.loading"),
    ).not.toBeInTheDocument();
    expect(projectApiMocks.get).not.toHaveBeenCalled();
  });

  it("does not show not found error when viewing deleted project", async () => {
    projectApiMocks.list.mockResolvedValueOnce({
      items: [deletedProject],
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
    });
    projectApiMocks.get.mockRejectedValueOnce(
      new ApiError("Pages.Project.NotFound", 404),
    );

    renderProjectPage();

    const detailButtons = await screen.findAllByTitle(
      "Pages.Project.detailTitle",
    );
    fireEvent.click(detailButtons[0]);

    await screen.findByRole("dialog", { name: "Pages.Project.detailTitle" });
    await waitFor(() => expect(projectApiMocks.get).not.toHaveBeenCalled());
    expect(messageMocks.error).not.toHaveBeenCalledWith(
      "Pages.Project.NotFound",
    );
  });

  it("opens edit drawer and submits normalized update payload for active project", async () => {
    renderProjectPage();

    const editButtons = await screen.findAllByTitle("Pages.Project.edit");
    fireEvent.click(editButtons[0]);

    const dialog = screen.getByRole("dialog", {
      name: "Pages.Project.editTitle",
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Pages.Project.save" }),
    );

    await waitFor(() =>
      expect(projectApiMocks.update).toHaveBeenCalledWith("project-1", {
        customerId: "customer-1",
        projectAlias: "UI Project",
        projectType: "Internal",
        riskLevel: "HIGH",
        teamIds: ["team-1"],
      }),
    );
  });

  it("shows assigned teams in table with the required columns", async () => {
    renderProjectPage();

    const editButtons = await screen.findAllByTitle("Pages.Project.edit");
    fireEvent.click(editButtons[0]);

    const dialog = screen.getByRole("dialog", {
      name: "Pages.Project.editTitle",
    });

    const table = within(dialog).getByRole("table", {
      name: "project-team-assignment-table",
    });
    const headers = within(table).getAllByRole("columnheader");
    expect(headers.map((header) => header.textContent)).toEqual([
      "Components.Action",
      "Pages.Team.teamCode",
      "Pages.Team.teamName",
      "Pages.Team.memberCount",
    ]);
    expect(within(table).getByText("TEAM001")).toBeInTheDocument();
    expect(within(table).getByText("Platform Team")).toBeInTheDocument();
    expect(within(table).getByText("5")).toBeInTheDocument();
  });

  it("adds a team from modal and includes it in project update payload", async () => {
    renderProjectPage();

    const editButtons = await screen.findAllByTitle("Pages.Project.edit");
    fireEvent.click(editButtons[0]);

    const dialog = screen.getByRole("dialog", {
      name: "Pages.Project.editTitle",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add team" }));
    const addTeamDialog = await screen.findByRole("dialog", {
      name: "modal",
    });
    fireEvent.click(
      within(addTeamDialog).getByRole("button", { name: "Pages.Project.save" }),
    );
    const table = await within(dialog).findByRole("table", {
      name: "project-team-assignment-table",
    });
    expect(within(table).getByText("TEAM001")).toBeInTheDocument();
    expect(within(table).getByText("5")).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Pages.Project.save" }),
    );

    await waitFor(() =>
      expect(projectApiMocks.update).toHaveBeenCalledWith("project-1", {
        customerId: "customer-1",
        projectAlias: "UI Project",
        projectType: "Internal",
        riskLevel: "HIGH",
        teamIds: ["team-1"],
      }),
    );
  });

  it("removes a team from the drawer and excludes it from project update payload", async () => {
    renderProjectPage();

    const editButtons = await screen.findAllByTitle("Pages.Project.edit");
    fireEvent.click(editButtons[0]);

    const dialog = screen.getByRole("dialog", {
      name: "Pages.Project.editTitle",
    });
    fireEvent.click(within(dialog).getByLabelText("remove-team-team-1"));
    expect(
      within(dialog).queryByRole("table", {
        name: "project-team-assignment-table",
      }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByText("Pages.Project.emptyValue"),
    ).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Pages.Project.save" }),
    );

    await waitFor(() =>
      expect(projectApiMocks.update).toHaveBeenCalledWith("project-1", {
        customerId: "customer-1",
        projectAlias: "UI Project",
        projectType: "Internal",
        riskLevel: "HIGH",
        teamIds: [],
      }),
    );
  });

  it("does not render duplicate team after attempting to add an already assigned team", async () => {
    drawerMocks.projectTeamValue = { teamId: "team-1" };
    renderProjectPage();

    const editButtons = await screen.findAllByTitle("Pages.Project.edit");
    fireEvent.click(editButtons[0]);

    const dialog = screen.getByRole("dialog", {
      name: "Pages.Project.editTitle",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add team" }));
    const addTeamDialog = await screen.findByRole("dialog", {
      name: "modal",
    });
    fireEvent.click(
      within(addTeamDialog).getByRole("button", { name: "Pages.Project.save" }),
    );

    expect(within(dialog).getAllByText("Platform Team")).toHaveLength(1);
  });
});
