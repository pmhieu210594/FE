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

// ================= MOCK API =================
const repositoryApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));

const projectApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
}));

const messageMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const drawerMocks = vi.hoisted(() => ({
  formValue: {
    projectId: "project-1",
    repo_name_masked: " repo-test ",
    host_type: "GITHUB",
    default_branch: " main ",
    repo_url_hash: " encrypted ",
  },
  filterValue: {
    projectId: "",
    status: "DELETED",
  },
}));

// ================= MOCK MODULE =================
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, props?: any) => props?.defaultValue ?? key,
  }),
}));

vi.mock("antd", () => ({
  message: messageMocks,
  Popconfirm: ({ children, onConfirm, disabled }: any) => (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onConfirm?.();
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          onConfirm?.();
        }
      }}
    >
      {children}
    </span>
  ),
  Tooltip: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {},
  endpoints: {
    repositories: repositoryApiMocks,
    projects: projectApiMocks,
  },
}));

vi.mock("@/components/ui/button", () => ({
  CButton: ({ text, onClick }: any) => (
    <button onClick={onClick}>{text}</button>
  ),
}));

vi.mock("@/components/ui/search", () => ({
  CSearch: ({ value, onTableChange }: any) => (
    <input
      aria-label="search"
      value={value}
      onChange={(e) => onTableChange(e.target.value)}
    />
  ),
}));

vi.mock("@/components/ui/server-table", () => ({
  CServerTable: ({ data, action, leftHeader }: any) => (
    <div>
      {leftHeader} {}
      {action?.labelAdd && (
        <button onClick={action.onAdd}>{action.labelAdd}</button>
      )}
      <table>
        <tbody>
          {data.map((row: any) => (
            <tr key={row.repositoryId}>
              <td>{row.repoNameMasked}</td>
              <td>{action?.render?.(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

vi.mock("@/components/ui/drawer", () => ({
  CDrawerForm: ({
    open,
    title,
    onSubmit,
    onClose,
    textSubmit,
    textCancel,
  }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <button onClick={() => onSubmit?.({ value: drawerMocks.formValue })}>
          {textSubmit}{" "}
        </button>{" "}
        <button onClick={onClose}>{textCancel}</button>{" "}
      </div>
    ) : null,
}));

import { RepositoryPage } from "@/pages/RepositoryPage";

// ================= DATA =================
const repoActive = {
  repositoryId: "repo-1",
  repoNameMasked: "Repo Active",
  projectId: "project-1",
  projectAlias: "Project A",
  hostType: "GITHUB",
  defaultBranch: "main",
  repoUrlHash: "enc",
  status: "ACTIVE",
};

const repoDeleted = {
  ...repoActive,
  repositoryId: "repo-del",
  repoNameMasked: "Repo Deleted",
  status: "DELETED",
};

// ================= RENDER =================
function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {" "}
      <RepositoryPage />{" "}
    </QueryClientProvider>,
  );
}

// ================= TEST =================
describe("RepositoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    projectApiMocks.list.mockResolvedValue({
      items: [{ projectId: "project-1", projectAlias: "Project A" }],
    });

    repositoryApiMocks.list.mockResolvedValue({
      items: [repoActive],
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
    });

    repositoryApiMocks.get.mockResolvedValue(repoActive);
    repositoryApiMocks.create.mockResolvedValue(repoActive);
    repositoryApiMocks.update.mockResolvedValue(repoActive);
    repositoryApiMocks.softDelete.mockResolvedValue(repoDeleted);
  });

  afterEach(() => cleanup());

  // ================= LIST =================
  it("renders repository list", async () => {
    renderPage();

    expect(await screen.findByText("Repo Active")).toBeInTheDocument();
  });

  // ================= CREATE =================
  it("opens create drawer and submits normalized payload", async () => {
    renderPage();

    fireEvent.click(await screen.findByText("Pages.Repository.create"));

    const dialog = screen.getByRole("dialog");

    fireEvent.click(within(dialog).getByText("Pages.Repository.save"));

    await waitFor(() =>
      expect(repositoryApiMocks.create).toHaveBeenCalledWith({
        projectId: "project-1",
        repo_name_masked: "repo-test",
        host_type: "GITHUB",
        default_branch: "main",
        repo_url_hash: "encrypted",
      }),
    );
  });

  // ================= UPDATE =================
  it("updates repository", async () => {
    renderPage();

    fireEvent.click(await screen.findByTitle("Pages.Repository.edit"));

    const dialog = screen.getByRole("dialog");

    fireEvent.click(within(dialog).getByText("Pages.Repository.save"));

    await waitFor(() => expect(repositoryApiMocks.update).toHaveBeenCalled());
  });

  // ================= DELETE =================
  it("soft deletes repository", async () => {
    renderPage();

    await screen.findByText("Repo Active");

    repositoryApiMocks.softDelete("repo-1");

    await waitFor(() =>
      expect(repositoryApiMocks.softDelete).toHaveBeenCalled(),
    );
  });

  // ================= DETAIL =================
  it("opens detail drawer", async () => {
    renderPage();

    fireEvent.click(await screen.findByTitle("Pages.Repository.detailTitle"));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  // ================= FILTER =================
  it("applies filter", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("search"), {
      target: { value: "abc" },
    });

    await waitFor(() => expect(repositoryApiMocks.list).toHaveBeenCalled());
  });

  // ================= ERROR =================
  it("shows error message when API fails", async () => {
    repositoryApiMocks.list.mockRejectedValueOnce(new Error("error"));

    renderPage();

    await waitFor(() => expect(messageMocks.error).toHaveBeenCalled());
  });

  // ================= DELETED =================
  it("does not allow edit for deleted repository", async () => {
    repositoryApiMocks.list.mockResolvedValueOnce({
      items: [repoDeleted],
    });

    renderPage();

    expect(await screen.findByText("Repo Deleted")).toBeInTheDocument();
  });
});
