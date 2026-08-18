import "@testing-library/jest-dom/vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
  cleanup,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const organizationApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));

const messageMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const drawerMocks = vi.hoisted(() => ({
  submitValue: {
    organizationCode: " ORG_UI ",
    organizationName: " Organization UI Test ",
    description: " Created from component test ",
    status: "ACTIVE",
  } as {
    organizationCode: string;
    organizationName: string;
    description: string;
    status: "ACTIVE" | "DELETED" | "ALL";
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
  Popconfirm: ({
    children,
    onConfirm,
  }: {
    children: React.ReactNode;
    onConfirm?: () => void;
  }) => (
    <button type="button" onClick={onConfirm}>
      {children}
    </button>
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
  endpoints: { organizations: organizationApiMocks },
}));

vi.mock("@/lib/utils", () => ({
  formatDateTime: (value: string | null | undefined) => value ?? "",
}));
vi.mock("@/components/ui/button", () => ({
  CButton: ({ text, onClick }: { text: string; onClick?: () => void }) => (
    <button onClick={onClick}>{text}</button>
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
      aria-label="organization-search"
      value={value}
      onChange={(e) => onTableChange(e.currentTarget.value)}
    />
  ),
}));
vi.mock("@/components/ui/svg-icon", () => ({
  CSvgIcon: ({ name }: { name: string }) => <span>{name}</span>,
}));
vi.mock("@/components/ui/tooltip", () => ({
  CTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/ui/pagination", () => ({
  CPagination: ({ total }: { total: number }) => <div>total:{total}</div>,
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
  }: {
    open: boolean;
    title: string;
    showSubmit?: boolean;
    textSubmit?: string;
    textCancel?: string;
    onClose?: () => void;
    onSubmit?: (payload: { value: any }) => void;
  }) =>
    open ? (
      <section role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {showSubmit ? (
          <button
            type="button"
            onClick={() =>
              onSubmit?.({
                value: drawerMocks.submitValue,
              })
            }
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
  CServerTable: React.forwardRef(
    (
      {
        data,
        leftHeader,
        action,
      }: { data: any[]; leftHeader?: React.ReactNode; action?: any },
      ref: React.ForwardedRef<{ id: string }>,
    ) => {
      React.useImperativeHandle(ref, () => ({ id: "organization-table" }));
      return (
        <div>
          <div>{leftHeader}</div>
          {action?.labelAdd ? (
            <button onClick={action.onAdd}>{action.labelAdd}</button>
          ) : null}
          <table>
            <tbody>
              {data.map((row) => (
                <tr key={row.organizationId}>
                  <td>{row.organizationCode}</td>
                  <td>{row.organizationName}</td>
                  <td>{row.status}</td>
                  <td>{action?.render?.(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  ),
}));

import { OrganizationPage } from "@/pages/OrganizationPage";

const activeOrganization = {
  organizationId: "org-1",
  organizationCode: "ORG001",
  organizationName: "Brycen Vietnam",
  description: "Main organization",
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2026-01-02T00:00:00Z",
  updatedBy: "admin",
  deletedAt: null,
  deletedBy: null,
  version: 3,
};

function renderOrganizationPage() {
  cleanup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationPage />
    </QueryClientProvider>,
  );
}

describe("OrganizationPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    drawerMocks.submitValue = {
      organizationCode: " ORG_UI ",
      organizationName: " Organization UI Test ",
      description: " Created from component test ",
      status: "ACTIVE",
    };
    organizationApiMocks.list.mockResolvedValue({
      items: [activeOrganization],
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
    });
    organizationApiMocks.get.mockResolvedValue(activeOrganization);
    organizationApiMocks.create.mockResolvedValue({
      ...activeOrganization,
      organizationId: "org-created",
      organizationCode: "ORG_UI",
      organizationName: "Organization UI Test",
      version: 1,
    });
    organizationApiMocks.update.mockResolvedValue({
      ...activeOrganization,
      organizationCode: "ORG_UI",
      organizationName: "Organization UI Test",
      version: 4,
    });
    organizationApiMocks.softDelete.mockResolvedValue({
      ...activeOrganization,
      status: "DELETED",
      version: 4,
    });
  });

  it("renders the default active organization list", async () => {
    renderOrganizationPage();

    expect(await screen.findByText("Brycen Vietnam")).toBeInTheDocument();
    expect(screen.getByText("ORG001")).toBeInTheDocument();
    expect(organizationApiMocks.list).toHaveBeenCalledWith({
      keyword: undefined,
      status: "ACTIVE",
      page: 0,
      size: 25,
    });
  });

  it("refreshes the list query when keyword search changes", async () => {
    renderOrganizationPage();

    const searchInputs = await screen.findAllByLabelText("organization-search");
    fireEvent.change(searchInputs[0], { target: { value: "Brycen" } });

    await waitFor(() =>
      expect(organizationApiMocks.list).toHaveBeenCalledWith({
        keyword: "Brycen",
        status: "ACTIVE",
        page: 0,
        size: 25,
      }),
    );
  });

  it.each([{ status: "DELETED" as const }, { status: "ALL" as const }])(
    "applies $status status filter when submitted",
    async ({ status }) => {
      drawerMocks.submitValue = {
        organizationCode: " ORG_UI ",
        organizationName: " Organization UI Test ",
        description: " Created from component test ",
        status,
      };

      renderOrganizationPage();

      const filterButtons = await screen.findAllByRole("button", {
        name: "Components.Filter",
      });
      fireEvent.click(filterButtons[0]);
      const filterDialog = screen.getByRole("dialog", {
        name: "Components.Filter",
      });
      fireEvent.click(
        within(filterDialog).getByRole("button", {
          name: "Components.Filter",
        }),
      );

      await waitFor(() =>
        expect(organizationApiMocks.list).toHaveBeenLastCalledWith({
          keyword: undefined,
          status,
          page: 0,
          size: 25,
        }),
      );
    },
  );

  it("opens create drawer and submits normalized create payload", async () => {
    renderOrganizationPage();

    const createBtns = await screen.findAllByRole("button", {
      name: "Pages.Organization.create",
    });
    fireEvent.click(createBtns[0]);
    expect(
      screen.getByRole("dialog", {
        name: "Pages.Organization.Form.CreateTitle",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Pages.Organization.Form.Save"));

    await waitFor(() =>
      expect(organizationApiMocks.create).toHaveBeenCalledWith({
        organizationCode: "ORG_UI",
        organizationName: "Organization UI Test",
        description: "Created from component test",
      }),
    );
    await waitFor(() => expect(messageMocks.success).toHaveBeenCalled());
  });

  it("opens edit drawer and submits update with the existing version", async () => {
    renderOrganizationPage();

    const editBtns = await screen.findAllByTitle("Pages.Organization.edit");
    fireEvent.click(editBtns[0]);
    expect(
      screen.getByRole("dialog", { name: "Pages.Organization.Form.EditTitle" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Pages.Organization.Form.Save"));

    await waitFor(() =>
      expect(organizationApiMocks.update).toHaveBeenCalledWith("org-1", {
        organizationCode: "ORG_UI",
        organizationName: "Organization UI Test",
        description: "Created from component test",
        status: "ACTIVE",
        version: 3,
      }),
    );
  });

  it("calls soft delete with the row version after confirmation", async () => {
    renderOrganizationPage();

    const deleteBtns = await screen.findAllByTitle("Pages.Organization.delete");
    fireEvent.click(deleteBtns[0]);

    await waitFor(() =>
      expect(organizationApiMocks.softDelete).toHaveBeenCalledWith("org-1", {
        version: 3,
      }),
    );
  });

  it("shows API errors from failed mutations", async () => {
    organizationApiMocks.create.mockRejectedValueOnce(
      new Error("Pages.Organization.Code.Duplicate"),
    );
    renderOrganizationPage();

    const createBtns2 = await screen.findAllByRole("button", {
      name: "Pages.Organization.create",
    });
    fireEvent.click(createBtns2[0]);
    fireEvent.click(screen.getByText("Pages.Organization.Form.Save"));

    await waitFor(() => expect(organizationApiMocks.create).toHaveBeenCalled());
    await waitFor(() =>
      expect(messageMocks.error).toHaveBeenCalledWith(
        "Pages.Organization.Code.Duplicate",
      ),
    );
  });

  it("shows duplicate name errors from create mutations", async () => {
    organizationApiMocks.create.mockRejectedValueOnce(
      new Error("Pages.Organization.Name.Duplicate"),
    );
    renderOrganizationPage();

    const createBtns = await screen.findAllByRole("button", {
      name: "Pages.Organization.create",
    });
    fireEvent.click(createBtns[0]);
    fireEvent.click(screen.getByText("Pages.Organization.Form.Save"));

    await waitFor(() => expect(organizationApiMocks.create).toHaveBeenCalled());
    await waitFor(() =>
      expect(messageMocks.error).toHaveBeenCalledWith(
        "Pages.Organization.Name.Duplicate",
      ),
    );
  });

  it("shows duplicate code errors from update mutations", async () => {
    organizationApiMocks.update.mockRejectedValueOnce(
      new Error("Pages.Organization.Code.Duplicate"),
    );
    renderOrganizationPage();

    const editBtns = await screen.findAllByTitle("Pages.Organization.edit");
    fireEvent.click(editBtns[0]);
    fireEvent.click(screen.getByText("Pages.Organization.Form.Save"));

    await waitFor(() => expect(organizationApiMocks.update).toHaveBeenCalled());
    await waitFor(() =>
      expect(messageMocks.error).toHaveBeenCalledWith(
        "Pages.Organization.Code.Duplicate",
      ),
    );
  });

  it("shows stale version errors from update mutations", async () => {
    organizationApiMocks.update.mockRejectedValueOnce(
      new Error(
        "Organization was updated by another user. Please reload and try again.",
      ),
    );
    renderOrganizationPage();

    const editBtns = await screen.findAllByTitle("Pages.Organization.edit");
    fireEvent.click(editBtns[0]);
    fireEvent.click(screen.getByText("Pages.Organization.Form.Save"));

    await waitFor(() => expect(organizationApiMocks.update).toHaveBeenCalled());
    await waitFor(() =>
      expect(messageMocks.error).toHaveBeenCalledWith(
        "Organization was updated by another user. Please reload and try again.",
      ),
    );
  });
});
