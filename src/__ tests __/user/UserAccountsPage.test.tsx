// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
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

const userAccountApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  activate: vi.fn(),
  deactivate: vi.fn(),
  resetPassword: vi.fn(),
  roles: vi.fn(),
}));

const messageMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const drawerState = vi.hoisted(() => ({
  accountFormValue: {
    username: "new.user",
    fullname: "New User",
    email: "new.user@example.com",
    roleId: "role-user",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    password: "Password1!",
    confirmPassword: "Password1!",
  },
  resetFormValue: {
    password: "Password2!",
    confirmPassword: "Password2!",
  },
  filterFormValue: {
    status: "ACTIVE",
    roleId: ["role-user"],
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, props?: Record<string, unknown>) => {
      if (props?.from && props?.to && props?.total) {
        return `${props.from}-${props.to}/${props.total}`;
      }
      return key;
    },
  }),
}));

vi.mock("antd", () => ({
  message: messageMocks,
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {
    status: number;
    messageKey?: string;
    constructor(
      message: string,
      status: number,
      _traceId?: string,
      messageKey?: string,
    ) {
      super(message);
      this.status = status;
      this.messageKey = messageKey;
    }
  },
  endpoints: { userAccounts: userAccountApiMocks },
}));

vi.mock("@/components/ui/drawer", () => ({
  CDrawerForm: ({
    open,
    title,
    textSubmit,
    textCancel,
    onClose,
    onSubmit,
  }: {
    open: boolean;
    title: string;
    textSubmit?: string;
    textCancel?: string;
    onClose?: () => void;
    onSubmit?: (payload: { value: any }) => void;
  }) =>
    open ? (
      <section role="dialog" aria-label={title}>
        <h2>{title}</h2>
        <button
          type="button"
          onClick={() => {
            const value = title.includes("resetTitle")
              ? drawerState.resetFormValue
              : drawerState.filterFormValue;
            onSubmit?.({ value });
          }}
        >
          {textSubmit ?? "submit"}
        </button>
        <button type="button" onClick={onClose}>
          {textCancel ?? "cancel"}
        </button>
      </section>
    ) : null,
}));

const activeAccount = {
  accountId: "account-1",
  memberKey: "member-1",
  username: "user01",
  fullname: "User One",
  email: "user01@example.com",
  roleId: "role-user",
  roleName: "USER",
  teamId: null,
  teamName: null,
  isActive: true,
  lastLoginAt: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

vi.mock("@/pages/user/UserAccountsTable", () => ({
  UserAccountsTable: ({
    data,
    openCreate,
    openEdit,
    openReset,
    activate,
    deactivate,
    openFilter,
    setKeyword,
  }: {
    data: (typeof activeAccount)[];
    openCreate: () => void;
    openEdit: (account: typeof activeAccount) => void;
    openReset: (account: typeof activeAccount) => void;
    activate: (accountId: string) => void;
    deactivate: (accountId: string) => void;
    openFilter: () => void;
    setKeyword: (value: string) => void;
  }) => (
    <div>
      <button type="button" onClick={openCreate}>
        create-account
      </button>
      <button type="button" onClick={openFilter}>
        open-filter
      </button>
      <button type="button" onClick={() => setKeyword("admin")}>
        search-admin
      </button>
      {data.map((account) => (
        <div key={account.accountId}>
          <span>{account.username}</span>
          <span>{account.roleName}</span>
          <span>{account.teamId ?? "team-null"}</span>
          <button type="button" onClick={() => openEdit(account)}>
            edit-account
          </button>
          <button type="button" onClick={() => openReset(account)}>
            reset-password
          </button>
          <button type="button" onClick={() => deactivate(account.accountId)}>
            deactivate-account
          </button>
          <button type="button" onClick={() => activate(account.accountId)}>
            activate-account
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/pages/user/UserAccountDrawer", () => ({
  UserAccountDrawer: ({
    mode,
    open,
    onSubmit,
    onClose,
  }: {
    mode: "add" | "edit" | "view";
    open: boolean;
    onSubmit: (value: typeof drawerState.accountFormValue) => void;
    onClose: () => void;
  }) =>
    open ? (
      <section role="dialog" aria-label={`account-${mode}`}>
        <button
          type="button"
          onClick={() => onSubmit(drawerState.accountFormValue)}
        >
          submit-account-drawer
        </button>
        <button type="button" onClick={onClose}>
          close-account-drawer
        </button>
      </section>
    ) : null,
}));

import { UserAccountsPage } from "@/pages/user/UserAccountsPage";

function renderPage() {
  cleanup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UserAccountsPage />
    </QueryClientProvider>,
  );
}

describe("UserAccountsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    drawerState.accountFormValue = {
      username: "new.user",
      fullname: "New User",
      email: "new.user@example.com",
      roleId: "role-user",
      status: "ACTIVE",
      password: "Password1!",
      confirmPassword: "Password1!",
    };
    drawerState.resetFormValue = {
      password: "Password2!",
      confirmPassword: "Password2!",
    };
    drawerState.filterFormValue = {
      status: "ACTIVE",
      roleId: ["role-user"],
    };
    userAccountApiMocks.roles.mockResolvedValue([
      { roleId: "role-admin", roleName: "ADMIN" },
      { roleId: "role-user", roleName: "USER" },
    ]);
    userAccountApiMocks.list.mockResolvedValue({
      items: [activeAccount],
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
    });
    userAccountApiMocks.get.mockResolvedValue(activeAccount);
    userAccountApiMocks.create.mockResolvedValue({
      ...activeAccount,
      accountId: "account-created",
      memberKey: "member-created",
      username: "new.user",
      fullname: "New User",
      roleId: "role-user",
      roleName: "USER",
      teamId: null,
      teamName: null,
    });
    userAccountApiMocks.update.mockResolvedValue({
      ...activeAccount,
      fullname: "New User",
      roleId: "role-user",
      roleName: "USER",
      teamId: null,
    });
    userAccountApiMocks.activate.mockResolvedValue({
      ...activeAccount,
      isActive: true,
    });
    userAccountApiMocks.deactivate.mockResolvedValue({
      ...activeAccount,
      isActive: false,
    });
    userAccountApiMocks.resetPassword.mockResolvedValue(activeAccount);
  });

  afterEach(() => cleanup());

  it("loads roles and accounts and renders team assignment as null/out of scope", async () => {
    renderPage();

    expect(await screen.findByText("user01")).toBeInTheDocument();
    expect(screen.getByText("USER")).toBeInTheDocument();
    expect(screen.getByText("team-null")).toBeInTheDocument();
    expect(userAccountApiMocks.roles).toHaveBeenCalledOnce();
    expect(userAccountApiMocks.list).toHaveBeenCalledWith({
      keyword: undefined,
      status: "ALL",
      roleIds: undefined,
      page: 0,
      size: 25,
    });
  });

  it("creates a user account with role but without team input", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("create-account"));
    fireEvent.click(await screen.findByText("submit-account-drawer"));

    await waitFor(() =>
      expect(userAccountApiMocks.create).toHaveBeenCalledOnce(),
    );
    expect(userAccountApiMocks.create).toHaveBeenCalledWith({
      username: "new.user",
      fullname: "New User",
      email: "new.user@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      roleId: "role-user",
      isActive: true,
    });
    expect(messageMocks.success).toHaveBeenCalledWith("Components.OK");
  });

  it("does not call create when role is missing", async () => {
    drawerState.accountFormValue = {
      ...drawerState.accountFormValue,
      roleId: "",
    };

    renderPage();
    fireEvent.click(await screen.findByText("create-account"));
    fireEvent.click(await screen.findByText("submit-account-drawer"));

    await waitFor(() =>
      expect(messageMocks.error).toHaveBeenCalledWith(
        "Pages.UserAccounts.validation.roleRequired",
      ),
    );
    expect(userAccountApiMocks.create).not.toHaveBeenCalled();
  });

  it("updates account role/status through the admin update endpoint", async () => {
    drawerState.accountFormValue = {
      ...drawerState.accountFormValue,
      fullname: "Updated User",
      status: "INACTIVE",
    };

    renderPage();
    fireEvent.click(await screen.findByText("edit-account"));
    fireEvent.click(await screen.findByText("submit-account-drawer"));

    await waitFor(() =>
      expect(userAccountApiMocks.update).toHaveBeenCalledOnce(),
    );
    expect(userAccountApiMocks.update).toHaveBeenCalledWith("account-1", {
      fullname: "Updated User",
      email: "new.user@example.com",
      roleId: "role-user",
      isActive: false,
    });
  });

  it("resets password only through the reset password endpoint", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("reset-password"));
    fireEvent.click(
      await screen.findByText("Pages.UserAccounts.actions.resetPassword"),
    );

    await waitFor(() =>
      expect(userAccountApiMocks.resetPassword).toHaveBeenCalledOnce(),
    );
    expect(userAccountApiMocks.resetPassword).toHaveBeenCalledWith(
      "account-1",
      {
        password: "Password2!",
        confirmPassword: "Password2!",
      },
    );
    expect(userAccountApiMocks.update).not.toHaveBeenCalled();
  });

  it("calls deactivate and activate actions without hard delete", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("deactivate-account"));
    fireEvent.click(await screen.findByText("activate-account"));

    await waitFor(() =>
      expect(userAccountApiMocks.deactivate).toHaveBeenCalledWith(
        "account-1",
        expect.anything(),
      ),
    );
    await waitFor(() =>
      expect(userAccountApiMocks.activate).toHaveBeenCalledWith(
        "account-1",
        expect.anything(),
      ),
    );
    expect((userAccountApiMocks as any).delete).toBeUndefined();
  });

  it("applies role/status filter and sends roleIds query state", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("open-filter"));
    const filterDialog = await screen.findByRole("dialog", {
      name: "Components.Filter",
    });
    fireEvent.click(
      within(filterDialog).getByRole("button", { name: "Components.Filter" }),
    );

    await waitFor(() =>
      expect(userAccountApiMocks.list).toHaveBeenLastCalledWith({
        keyword: undefined,
        status: "ACTIVE",
        roleIds: ["role-user"],
        page: 0,
        size: 25,
      }),
    );
  });
});
