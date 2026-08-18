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

const teamApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  listMembers: vi.fn(),
  addMember: vi.fn(),
  updateMemberRole: vi.fn(),
  removeMember: vi.fn(),
}));

const messageMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const formMocks = vi.hoisted(() => ({
  teamSubmitValue: {
    teamCode: " UI_TEAM_CREATED ",
    teamName: " UI Team Created ",
    description: " Created by Vitest ",
    status: "ACTIVE",
  },
  filterSubmitValue: { status: "DELETED" },
  memberSubmitValue: {
    memberKey: "member-1",
    roleId: "role-dev",
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
  Modal: ({ open, title, children, footer, onCancel }: any) =>
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
  Popconfirm: ({ children, onConfirm, disabled }: any) => (
    <button type="button" disabled={disabled} onClick={onConfirm}>
      {children}
    </button>
  ),
  Table: ({ dataSource, columns }: any) => (
    <table aria-label="team-members-table">
      <tbody>
        {dataSource.map((row: any) => (
          <tr key={row.teamMemberId}>
            <td>{row.pseudonym}</td>
            <td>{row.roleName}</td>
            <td>{row.status}</td>
            <td>{columns[0].render(null, row)}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
  endpoints: { teams: teamApiMocks },
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
    <button type="button" disabled={disabled} onClick={onClick}>
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
      aria-label="team-search"
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
vi.mock("@/components/ui/drawer", () => ({
  CDrawerForm: ({
    open,
    title,
    showSubmit,
    textSubmit,
    textCancel,
    onClose,
    onSubmit,
  }: any) => {
    if (!open) return null;
    const isFilter = String(title).includes("filters");
    return (
      <section role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {showSubmit ? (
          <button
            type="button"
            onClick={() =>
              onSubmit?.({
                value: isFilter
                  ? formMocks.filterSubmitValue
                  : formMocks.teamSubmitValue,
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
    );
  },
}));
vi.mock("@/components/ui/form", () => ({
  CForm: React.forwardRef(
    (
      { onSubmit }: any,
      ref: React.ForwardedRef<{ handleSubmit: () => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({
        handleSubmit: () => onSubmit?.({ value: formMocks.memberSubmitValue }),
      }));
      return <div data-testid="team-member-form" />;
    },
  ),
}));
vi.mock("@/components/ui/server-table", () => ({
  CServerTable: ({ data, leftHeader, action }: any) => (
    <div>
      <div>{leftHeader}</div>
      {action?.labelAdd ? (
        <button type="button" onClick={action.onAdd}>
          {action.labelAdd}
        </button>
      ) : null}
      <table id="team-list-table-inner">
        <tbody>
          {data.map((row: any) => (
            <tr key={row.teamId}>
              <td>{row.teamCode}</td>
              <td>{row.teamName}</td>
              <td>{row.memberCount}</td>
              <td>{row.status}</td>
              <td>{action?.render?.(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

import { TeamPage } from "@/pages/TeamPage";

const activeTeam = {
  teamId: "team-1",
  teamCode: "UI_TEAM_001",
  teamName: "UI Team One",
  description: "Team description",
  status: "ACTIVE",
  createdAt: "2026-06-15T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2026-06-15T00:00:00Z",
  updatedBy: "admin",
  deletedAt: null,
  deletedBy: null,
  version: 3,
  memberCount: 1,
};

const member = {
  teamMemberId: "team-member-1",
  teamId: "team-1",
  teamName: "UI Team One",
  memberKey: "member-1",
  pseudonym: "dev-001",
  roleId: "role-dev",
  roleName: "Developer",
  status: "ACTIVE",
  joinedAt: "2026-06-15T00:00:00Z",
  createdAt: "2026-06-15T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2026-06-15T00:00:00Z",
  updatedBy: "admin",
  deletedAt: null,
  deletedBy: null,
  version: 7,
};

const detail = {
  team: activeTeam,
  members: [member],
  memberOptions: [
    { memberKey: "member-1", pseudonym: "dev-001", fullname: "Developer One" },
    { memberKey: "member-2", pseudonym: "qa-001", fullname: "QA One" },
  ],
  roleOptions: [
    { roleId: "role-dev", roleName: "Developer" },
    { roleId: "role-qa", roleName: "QA" },
  ],
};

function renderTeamPage() {
  cleanup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TeamPage />
    </QueryClientProvider>,
  );
}

describe("TeamPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    formMocks.teamSubmitValue = {
      teamCode: " UI_TEAM_CREATED ",
      teamName: " UI Team Created ",
      description: " Created by Vitest ",
      status: "ACTIVE",
    };
    formMocks.filterSubmitValue = { status: "DELETED" };
    formMocks.memberSubmitValue = { memberKey: "member-1", roleId: "role-dev" };
    teamApiMocks.list.mockResolvedValue({
      items: [activeTeam],
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
    });
    teamApiMocks.get.mockResolvedValue(detail);
    teamApiMocks.create.mockResolvedValue({
      ...activeTeam,
      teamId: "team-created",
      teamCode: "UI_TEAM_CREATED",
      teamName: "UI Team Created",
      version: 0,
    });
    teamApiMocks.update.mockResolvedValue({
      ...activeTeam,
      teamCode: "UI_TEAM_UPDATED",
      teamName: "UI Team Updated",
      version: 4,
    });
    teamApiMocks.softDelete.mockResolvedValue({
      ...activeTeam,
      status: "DELETED",
      version: 4,
      deletedAt: "2026-06-15T00:00:00Z",
    });
    teamApiMocks.addMember.mockResolvedValue({
      ...member,
      teamMemberId: "team-member-created",
    });
    teamApiMocks.updateMemberRole.mockResolvedValue({
      ...member,
      roleId: "role-qa",
      roleName: "QA",
      version: 8,
    });
    teamApiMocks.removeMember.mockResolvedValue({
      ...member,
      status: "INACTIVE",
      deletedAt: "2026-06-15T00:00:00Z",
      version: 8,
    });
  });

  it("renders the active Team list and searches by keyword", async () => {
    renderTeamPage();

    expect(await screen.findByText("UI Team One")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("team-search"), {
      target: { value: "UI_TEAM_001" },
    });

    await waitFor(() => {
      expect(teamApiMocks.list).toHaveBeenLastCalledWith({
        keyword: "UI_TEAM_001",
        status: "ACTIVE",
        page: 0,
        size: 25,
      });
    });
  });

  it("opens Create Team form and submits normalized Team data", async () => {
    renderTeamPage();
    await screen.findByText("UI Team One");

    fireEvent.click(screen.getByText("Pages.Team.create"));
    expect(
      screen.getByRole("dialog", { name: "Pages.Team.createTitle" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Pages.Team.save"));

    await waitFor(() => {
      expect(teamApiMocks.create).toHaveBeenCalledWith({
        teamCode: "UI_TEAM_CREATED",
        teamName: "UI Team Created",
        description: "Created by Vitest",
      });
      expect(messageMocks.success).toHaveBeenCalledWith(
        "Pages.Team.createSuccess",
      );
    });
  });

  it("opens Edit Team form and allows changing Team Code", async () => {
    formMocks.teamSubmitValue = {
      teamCode: " UI_TEAM_UPDATED ",
      teamName: " UI Team Updated ",
      description: " Updated by Vitest ",
      status: "ACTIVE",
    };
    renderTeamPage();
    const row = await screen.findByText("UI_TEAM_001");

    fireEvent.click(
      within(row.closest("tr") as HTMLElement).getByTitle("Pages.Team.edit"),
    );
    expect(
      screen.getByRole("dialog", { name: "Pages.Team.editTitle" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Pages.Team.save"));

    await waitFor(() => {
      expect(teamApiMocks.update).toHaveBeenCalledWith("team-1", {
        teamCode: "UI_TEAM_UPDATED",
        teamName: "UI Team Updated",
        description: "Updated by Vitest",
        status: "ACTIVE",
        version: 3,
      });
      expect(messageMocks.success).toHaveBeenCalledWith(
        "Pages.Team.updateSuccess",
      );
    });
  });

  it("shows duplicate Team Code error from API", async () => {
    teamApiMocks.create.mockRejectedValue(
      new Error("Pages.Team.Code.Duplicate"),
    );
    renderTeamPage();
    await screen.findByText("UI Team One");

    fireEvent.click(screen.getByText("Pages.Team.create"));
    fireEvent.click(screen.getByText("Pages.Team.save"));

    await waitFor(() => {
      expect(messageMocks.error).toHaveBeenCalled();
    });
  });

  it("opens detail modal and displays member list with role", async () => {
    renderTeamPage();
    const row = await screen.findByText("UI_TEAM_001");

    fireEvent.click(
      within(row.closest("tr") as HTMLElement).getByTitle(
        "Pages.Team.detailTitle",
      ),
    );

    expect(
      await screen.findByRole("dialog", { name: "modal" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("dev-001")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
  });

  it("adds an existing member with a role from Team detail", async () => {
    renderTeamPage();
    const row = await screen.findByText("UI_TEAM_001");
    fireEvent.click(
      within(row.closest("tr") as HTMLElement).getByTitle(
        "Pages.Team.detailTitle",
      ),
    );
    await screen.findByText("dev-001");

    fireEvent.click(screen.getByText("Pages.Team.addMember"));
    fireEvent.click(screen.getByText("Pages.Team.save"));

    await waitFor(() => {
      expect(teamApiMocks.addMember).toHaveBeenCalledWith("team-1", {
        memberKey: "member-1",
        roleId: "role-dev",
      });
      expect(messageMocks.success).toHaveBeenCalledWith(
        "Pages.Team.memberAddSuccess",
      );
    });
  });

  it("updates a member role without creating a new membership", async () => {
    formMocks.memberSubmitValue = { memberKey: "member-1", roleId: "role-qa" };
    renderTeamPage();
    const row = await screen.findByText("UI_TEAM_001");
    fireEvent.click(
      within(row.closest("tr") as HTMLElement).getByTitle(
        "Pages.Team.detailTitle",
      ),
    );
    await screen.findByText("dev-001");

    const memberRow = screen.getByText("dev-001").closest("tr") as HTMLElement;
    fireEvent.click(within(memberRow).getByTitle("Pages.Team.editMember"));
    fireEvent.click(screen.getByText("Pages.Team.save"));

    await waitFor(() => {
      expect(teamApiMocks.updateMemberRole).toHaveBeenCalledWith(
        "team-1",
        "team-member-1",
        { roleId: "role-qa", version: 7 },
      );
      expect(teamApiMocks.addMember).not.toHaveBeenCalled();
      expect(messageMocks.success).toHaveBeenCalledWith(
        "Pages.Team.memberUpdateSuccess",
      );
    });
  });

  it("removes a member and soft deletes a Team through UI actions", async () => {
    renderTeamPage();
    const row = await screen.findByText("UI_TEAM_001");

    fireEvent.click(
      within(row.closest("tr") as HTMLElement).getByTitle(
        "Pages.Team.detailTitle",
      ),
    );
    await screen.findByText("dev-001");
    const memberRow = screen.getByText("dev-001").closest("tr") as HTMLElement;
    fireEvent.click(within(memberRow).getByTitle("Pages.Team.removeMember"));

    await waitFor(() => {
      expect(teamApiMocks.removeMember).toHaveBeenCalledWith(
        "team-1",
        "team-member-1",
        { version: 7 },
      );
      expect(messageMocks.success).toHaveBeenCalledWith(
        "Pages.Team.memberRemoveSuccess",
      );
    });

    fireEvent.click(screen.getByText("modal-close"));
    const listRow = screen
      .getByText("UI_TEAM_001")
      .closest("tr") as HTMLElement;
    fireEvent.click(within(listRow).getByTitle("Pages.Team.delete"));

    await waitFor(() => {
      expect(teamApiMocks.softDelete).toHaveBeenCalledWith("team-1", {
        version: 3,
      });
      expect(messageMocks.success).toHaveBeenCalledWith(
        "Pages.Team.deleteSuccess",
      );
    });
  });

  it("applies Deleted status filter for deleted Teams", async () => {
    renderTeamPage();
    await screen.findByText("UI Team One");

    fireEvent.click(screen.getByText("Pages.Team.filters"));
    fireEvent.click(screen.getByText("Pages.Team.apply"));

    await waitFor(() => {
      expect(teamApiMocks.list).toHaveBeenLastCalledWith({
        keyword: undefined,
        status: "DELETED",
        page: 0,
        size: 25,
      });
    });
  });
});
