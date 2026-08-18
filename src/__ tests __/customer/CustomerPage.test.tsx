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

const customerApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));

const organizationApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
}));

const messageMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const drawerMocks = vi.hoisted(() => ({
  customerValue: {
    organizationId: "org-1",
    customerCode: " CUS_UI ",
    customerAlias: " UI Customer ",
    classification: "EXTERNAL",
  },
  filterValue: {
    organizationId: "org-1",
    classification: "EXTERNAL",
    status: "ALL",
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
    disabled,
  }: {
    children: React.ReactNode;
    onConfirm?: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      data-testid={disabled ? "disabled-popconfirm" : "enabled-popconfirm"}
      onClick={() => {
        if (!disabled) onConfirm?.();
      }}
    >
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
  endpoints: {
    customers: customerApiMocks,
    organizations: organizationApiMocks,
  },
}));

vi.mock("@/lib/utils", () => ({
  formatDateTime: (value: string | null | undefined) => value ?? "",
}));

vi.mock("@/components/ui/button", () => ({
  CButton: ({ text, onClick }: { text: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
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
      aria-label="customer-search"
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

vi.mock("@/components/ui/pagination", () => ({
  CPagination: ({ total }: { total: number }) => <div>total:{total}</div>,
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
    const isFilter = title === "Pages.Customer.filters";
    const value = isFilter
      ? drawerMocks.filterValue
      : drawerMocks.customerValue;
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
  CServerTable: React.forwardRef(
    (
      {
        data,
        leftHeader,
        action,
      }: { data: any[]; leftHeader?: React.ReactNode; action?: any },
      ref: React.ForwardedRef<{ id: string }>,
    ) => {
      React.useImperativeHandle(ref, () => ({ id: "customer-table" }));
      return (
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
                <tr key={row.customerId}>
                  <td>{row.customerCode}</td>
                  <td>{row.customerAlias}</td>
                  <td>{row.organizationName}</td>
                  <td>{row.classification}</td>
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

import { CustomerPage } from "@/pages/CustomerPage";
import { ApiError } from "@/lib/api";

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
  version: 1,
};

const activeCustomer = {
  customerId: "customer-1",
  organizationId: "org-1",
  organizationName: "Brycen Vietnam",
  customerCode: "CUS001",
  customerAlias: "Brycen Customer",
  classification: "INTERNAL",
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2026-01-02T00:00:00Z",
  updatedBy: "admin",
  deletedAt: null,
  deletedBy: null,
  version: 3,
};

const deletedCustomer = {
  ...activeCustomer,
  customerId: "customer-deleted",
  customerCode: "CUSDEL",
  customerAlias: "Deleted Customer",
  status: "DELETED",
  deletedAt: "2026-01-03T00:00:00Z",
  version: 5,
};

function renderCustomerPage() {
  cleanup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CustomerPage />
    </QueryClientProvider>,
  );
}

describe("CustomerPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    drawerMocks.customerValue = {
      organizationId: "org-1",
      customerCode: " CUS_UI ",
      customerAlias: " UI Customer ",
      classification: "EXTERNAL",
    };
    drawerMocks.filterValue = {
      organizationId: "org-1",
      classification: "EXTERNAL",
      status: "ALL",
    };
    organizationApiMocks.list.mockResolvedValue({
      items: [activeOrganization],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1,
    });
    customerApiMocks.list.mockResolvedValue({
      items: [activeCustomer],
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
    });
    customerApiMocks.get.mockResolvedValue(activeCustomer);
    customerApiMocks.create.mockResolvedValue({
      ...activeCustomer,
      customerId: "customer-created",
      customerCode: "CUS_UI",
      customerAlias: "UI Customer",
      classification: "EXTERNAL",
      version: 0,
    });
    customerApiMocks.update.mockResolvedValue({
      ...activeCustomer,
      customerCode: "CUS_UI",
      customerAlias: "UI Customer",
      classification: "EXTERNAL",
      version: 4,
    });
    customerApiMocks.softDelete.mockResolvedValue({
      ...activeCustomer,
      status: "DELETED",
      version: 4,
    });
  });

  it("renders the default active customer list and active organization lookup", async () => {
    renderCustomerPage();

    expect(await screen.findByText("Brycen Customer")).toBeInTheDocument();
    expect(screen.getByText("CUS001")).toBeInTheDocument();
    expect(customerApiMocks.list).toHaveBeenCalledWith({
      keyword: undefined,
      status: "ACTIVE",
      classification: "ALL",
      organizationId: undefined,
      page: 0,
      pageSize: 25,
    });
    expect(organizationApiMocks.list).toHaveBeenCalledWith({
      status: "ACTIVE",
      page: 0,
      size: 100,
    });
  });

  it("refreshes the list query when keyword search changes", async () => {
    renderCustomerPage();

    const searchInputs = await screen.findAllByLabelText("customer-search");
    fireEvent.change(searchInputs[0], { target: { value: "Brycen" } });

    await waitFor(() =>
      expect(customerApiMocks.list).toHaveBeenCalledWith({
        keyword: "Brycen",
        status: "ACTIVE",
        classification: "ALL",
        organizationId: undefined,
        page: 0,
        pageSize: 25,
      }),
    );
  });

  it("applies organization, classification, and status filters", async () => {
    renderCustomerPage();

    const filterButtons = await screen.findAllByRole("button", {
      name: "Pages.Customer.filters",
    });
    fireEvent.click(filterButtons[0]);
    const filterDialog = screen.getByRole("dialog", {
      name: "Pages.Customer.filters",
    });
    fireEvent.click(
      within(filterDialog).getByRole("button", {
        name: "Pages.Customer.apply",
      }),
    );

    await waitFor(() =>
      expect(customerApiMocks.list).toHaveBeenCalledWith({
        keyword: undefined,
        status: "ALL",
        classification: "EXTERNAL",
        organizationId: "org-1",
        page: 0,
        pageSize: 25,
      }),
    );
  });

  it("opens create drawer with only active organization options and submits normalized create payload", async () => {
    renderCustomerPage();

    const createButtons = await screen.findAllByRole("button", {
      name: "Pages.Customer.create",
    });
    fireEvent.click(createButtons[0]);
    const dialog = screen.getByRole("dialog", {
      name: "Pages.Customer.createTitle",
    });
    expect(
      within(dialog).getByTestId("option-organizationId-org-1"),
    ).toHaveTextContent("Brycen Vietnam");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Pages.Customer.save" }),
    );

    await waitFor(() =>
      expect(customerApiMocks.create).toHaveBeenCalledWith({
        organizationId: "org-1",
        customerCode: "CUS_UI",
        customerAlias: "UI Customer",
        classification: "EXTERNAL",
      }),
    );
    await waitFor(() => expect(messageMocks.success).toHaveBeenCalled());
  });

  it("opens detail drawer and displays customer information", async () => {
    renderCustomerPage();

    const detailButtons = await screen.findAllByTitle(
      "Pages.Customer.detailTitle",
    );
    fireEvent.click(detailButtons[0]);

    const dialog = await screen.findByRole("dialog", {
      name: "Pages.Customer.detailTitle",
    });
    expect(await within(dialog).findByText("CUS001")).toBeInTheDocument();
    expect(
      await within(dialog).findByText("Brycen Customer"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(customerApiMocks.get).toHaveBeenCalledWith("customer-1"),
    );
  });

  it("opens edit drawer and submits update with the selected row version", async () => {
    renderCustomerPage();

    const editButtons = await screen.findAllByTitle("Pages.Customer.edit");
    fireEvent.click(editButtons[0]);
    const dialog = screen.getByRole("dialog", {
      name: "Pages.Customer.editTitle",
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Pages.Customer.save" }),
    );

    await waitFor(() =>
      expect(customerApiMocks.update).toHaveBeenCalledWith("customer-1", {
        organizationId: "org-1",
        customerCode: "CUS_UI",
        customerAlias: "UI Customer",
        classification: "EXTERNAL",
        version: 3,
      }),
    );
  });

  it("calls soft delete with the selected row version after confirmation", async () => {
    renderCustomerPage();

    const deleteButtons = await screen.findAllByTitle("Pages.Customer.delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() =>
      expect(customerApiMocks.softDelete).toHaveBeenCalledWith("customer-1", {
        version: 3,
      }),
    );
  });

  it("disables edit and delete actions for deleted customers", async () => {
    customerApiMocks.list.mockResolvedValueOnce({
      items: [deletedCustomer],
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
    });

    renderCustomerPage();

    expect(await screen.findByText("Deleted Customer")).toBeInTheDocument();
    const editButton = screen.getByTitle("Pages.Customer.edit");
    const deleteButton = screen.getByTitle("Pages.Customer.delete");
    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
    fireEvent.click(deleteButton);
    expect(customerApiMocks.softDelete).not.toHaveBeenCalled();
  });

  it("shows translated API error message keys from failed mutations", async () => {
    customerApiMocks.create.mockRejectedValueOnce(
      new ApiError("Pages.Customer.Code.Duplicate", 400),
    );
    renderCustomerPage();

    const createButtons = await screen.findAllByRole("button", {
      name: "Pages.Customer.create",
    });
    fireEvent.click(createButtons[0]);
    fireEvent.click(
      screen.getByRole("button", { name: "Pages.Customer.save" }),
    );

    await waitFor(() => expect(customerApiMocks.create).toHaveBeenCalled());
    await waitFor(() =>
      expect(messageMocks.error).toHaveBeenCalledWith(
        "Pages.Customer.Code.Duplicate",
      ),
    );
  });
});
