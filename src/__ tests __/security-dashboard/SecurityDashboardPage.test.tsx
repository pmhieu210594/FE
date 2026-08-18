import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { endpoints } from "@/lib/api";
import { SecurityDashboardPage } from "@/pages/security-dashboard/SecurityDashboardPage";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const PROJECTS_RESPONSE = {
  items: [
    { projectId: "proj-1", projectAlias: "EDCAP Alpha", role: "SECURITY" },
    { projectId: "proj-2", projectAlias: "EDCAP Beta", role: "DEV" },
  ],
  page: 0,
  size: 100,
  totalElements: 2,
  totalPages: 1,
  hasNext: false,
} as const;

const REPOSITORIES_BY_PROJECT: Record<
  string,
  Awaited<ReturnType<typeof endpoints.repositories.list>>
> = {
  "": {
    items: [
      {
        repositoryId: "repo-1",
        repoNameMasked: "edcap-alpha-api",
        projectId: "",
        projectAlias: "",
        hostType: "",
        defaultBranch: null,
        repoUrlHash: null,
        status: "",
        deleteFlag: false,
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null,
        deletedAt: null,
        deletedBy: null,
      },
    ],
    page: 0,
    size: 100,
    totalElements: 1,
    totalPages: 1,
  },
  "proj-1": {
    items: [
      {
        repositoryId: "repo-1",
        repoNameMasked: "edcap-alpha-api",
        projectId: "",
        projectAlias: "",
        hostType: "",
        defaultBranch: null,
        repoUrlHash: null,
        status: "",
        deleteFlag: false,
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null,
        deletedAt: null,
        deletedBy: null,
      },
    ],
    page: 0,
    size: 100,
    totalElements: 1,
    totalPages: 1,
  },
  "proj-2": {
    items: [
      {
        repositoryId: "repo-2",
        repoNameMasked: "edcap-beta-api",
        projectId: "",
        projectAlias: "",
        hostType: "",
        defaultBranch: null,
        repoUrlHash: null,
        status: "",
        deleteFlag: false,
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null,
        deletedAt: null,
        deletedBy: null,
      },
    ],
    page: 0,
    size: 100,
    totalElements: 1,
    totalPages: 1,
  },
};

const SUMMARY_RESPONSE = {
  safetyPack: { readyCount: 2, warningCount: 1, missingCount: 0 },
  secretScan: { passCount: 3, failCount: 1 },
  sastSca: { passCount: 2, warningCount: 1, failCount: 1 },
  exception: { openCount: 1, totalCount: 1 },
  updatedAt: "2026-07-01T00:00:00Z",
};

const TICKETS_RESPONSE = {
  items: [
    {
      ticketId: "ticket-1",
      ticketKey: "SEC-1",
      projectAlias: "EDCAP Alpha",
      repositoryName: "edcap-alpha-api",
      safetyStatus: "READY",
      secretScanStatus: "PASS",
      sastStatus: "PASS",
      scaStatus: "PASS",
      exceptionStatus: "OPEN",
      finalVerdict: "NOT_CONFIGURED",
    },
  ],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/security-dashboard"]}>
        <Routes>
          <Route
            path="/:lang/security-dashboard"
            element={<SecurityDashboardPage />}
          />
          <Route
            path="/:lang/development-dashboard"
            element={
              <div data-testid="dev-dashboard">Development Dashboard</div>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SecurityDashboardPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(endpoints.securityDashboard, "options").mockResolvedValue({
      projects: PROJECTS_RESPONSE.items.map((item) => ({
        value: item.projectId,
        label: item.projectAlias,
        role: item.role,
      })),
      repositories: REPOSITORIES_BY_PROJECT["proj-1"].items.map((item) => ({
        value: item.repositoryId,
        label: item.repoNameMasked,
        role: "SECURITY",
      })),
    } as Awaited<ReturnType<typeof endpoints.securityDashboard.options>>);
    vi.spyOn(endpoints.repositories, "list").mockImplementation(
      async (params) => {
        const projectId = params?.projectId ?? "";
        return (
          REPOSITORIES_BY_PROJECT[projectId] ?? REPOSITORIES_BY_PROJECT[""]
        );
      },
    );
    vi.spyOn(endpoints.securityDashboard, "summary").mockResolvedValue(
      SUMMARY_RESPONSE as Awaited<
        ReturnType<typeof endpoints.securityDashboard.summary>
      >,
    );
    vi.spyOn(endpoints.securityDashboard, "tickets").mockResolvedValue(
      TICKETS_RESPONSE as Awaited<
        ReturnType<typeof endpoints.securityDashboard.tickets>
      >,
    );
    vi.spyOn(endpoints.securityDashboard, "ticketDetail").mockResolvedValue({
      ticketId: "ticket-1",
      ticketKey: "SEC-1",
      projectAlias: "EDCAP Alpha",
      repositoryName: "edcap-alpha-api",
      safetyStatus: "READY",
      scans: [],
      checklistSections: [],
      exceptions: [],
      finalVerdict: "NOT_CONFIGURED",
      artifactVersion: 1,
      resolutionTime: "27:30:00",
    } as Awaited<ReturnType<typeof endpoints.securityDashboard.ticketDetail>>);
  });

  it("auto-selects the first project and repository after options load", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("project-select")).toHaveValue("proj-1"),
    );
    await waitFor(() =>
      expect(screen.getByTestId("repository-select")).toHaveValue("repo-1"),
    );

    await waitFor(() =>
      expect(endpoints.securityDashboard.summary).toHaveBeenLastCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          repositoryId: "repo-1",
        }),
      ),
    );

    await waitFor(() =>
      expect(endpoints.securityDashboard.tickets).toHaveBeenLastCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          repositoryId: "repo-1",
          page: 0,
          size: 25,
        }),
      ),
    );
  });

  it("renders the summary cards and ticket table shell", async () => {
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByText("Pages.SecurityDashboard.cards.safetyPack.title"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText("Pages.SecurityDashboard.cards.secretScan.title"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pages.SecurityDashboard.cards.exception.title"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pages.SecurityDashboard.table.title"),
    ).toBeInTheDocument();
  });

  it("changing project follows the dashboard for the selected project role", async () => {
    renderPage();
    const user = userEvent.setup();

    await waitFor(() =>
      expect(screen.getByTestId("repository-select")).toHaveValue("repo-1"),
    );
    await screen.findByRole("option", { name: "EDCAP Beta" });

    await user.selectOptions(screen.getByTestId("project-select"), "proj-2");

    await waitFor(() =>
      expect(screen.getByTestId("dev-dashboard")).toBeInTheDocument(),
    );
  });

  it("does not expose edit / delete / create controls", async () => {
    const { container } = renderPage();

    await waitFor(() =>
      expect(endpoints.securityDashboard.summary).toHaveBeenCalled(),
    );

    const writeButtons = container.querySelectorAll(
      "button[aria-label*='edit' i], button[aria-label*='delete' i], button[aria-label*='create' i]",
    );
    expect(writeButtons).toHaveLength(0);
  });

  it("shows the security finding resolution time in the ticket detail drawer", async () => {
    const { container } = renderPage();

    // Wait for the real ticket row (not a loading skeleton) to render first,
    // then grab the view button from the now-settled DOM.
    await screen.findByText("SEC-1");

    const viewButton = container.querySelector<HTMLButtonElement>(
      'button[title="Pages.SecurityDashboard.drawer.title"]',
    );
    expect(viewButton).not.toBeNull();
    fireEvent.click(viewButton as HTMLButtonElement);

    await waitFor(() =>
      expect(endpoints.securityDashboard.ticketDetail).toHaveBeenCalledWith(
        "ticket-1",
      ),
    );

    expect(await screen.findByText("27:30:00")).toBeInTheDocument();
  });

  it("renders the dash placeholder when no cycle has closed yet (BR-5)", async () => {
    vi.spyOn(endpoints.securityDashboard, "ticketDetail").mockResolvedValue({
      ticketId: "ticket-1",
      ticketKey: "SEC-1",
      projectAlias: "EDCAP Alpha",
      repositoryName: "edcap-alpha-api",
      safetyStatus: "READY",
      scans: [],
      checklistSections: [],
      exceptions: [],
      finalVerdict: "NOT_CONFIGURED",
      artifactVersion: 1,
      resolutionTime: "-",
    } as Awaited<ReturnType<typeof endpoints.securityDashboard.ticketDetail>>);

    const { container } = renderPage();

    await screen.findByText("SEC-1");
    const viewButton = container.querySelector<HTMLButtonElement>(
      'button[title="Pages.SecurityDashboard.drawer.title"]',
    );
    fireEvent.click(viewButton as HTMLButtonElement);

    await waitFor(() =>
      expect(endpoints.securityDashboard.ticketDetail).toHaveBeenCalledWith(
        "ticket-1",
      ),
    );

    // Exact match on "-" (hyphen, BR-5 placeholder) is distinct from the
    // "—" (em dash) used elsewhere in the drawer for null severity/follow-up.
    expect(await screen.findByText("-", { exact: true })).toBeInTheDocument();
  });

  it("falls back to the dash placeholder when resolutionTime is missing from the API response (ai-review.md F5: BE/FE deploy skew)", async () => {
    const { resolutionTime: _omitted, ...detailWithoutResolutionTime } = {
      ticketId: "ticket-1",
      ticketKey: "SEC-1",
      projectAlias: "EDCAP Alpha",
      repositoryName: "edcap-alpha-api",
      safetyStatus: "READY",
      scans: [],
      checklistSections: [],
      exceptions: [],
      finalVerdict: "NOT_CONFIGURED",
      artifactVersion: 1,
      resolutionTime: "27:30:00",
    };

    vi.spyOn(endpoints.securityDashboard, "ticketDetail").mockResolvedValue(
      // Simulates an older BE that has not deployed the resolutionTime field
      // yet — the field is entirely absent from the JSON payload, not just
      // null, which is what a real rolling deploy would produce.
      detailWithoutResolutionTime as unknown as Awaited<
        ReturnType<typeof endpoints.securityDashboard.ticketDetail>
      >,
    );

    const { container } = renderPage();

    await screen.findByText("SEC-1");
    const viewButton = container.querySelector<HTMLButtonElement>(
      'button[title="Pages.SecurityDashboard.drawer.title"]',
    );
    fireEvent.click(viewButton as HTMLButtonElement);

    await waitFor(() =>
      expect(endpoints.securityDashboard.ticketDetail).toHaveBeenCalledWith(
        "ticket-1",
      ),
    );

    expect(await screen.findByText("-", { exact: true })).toBeInTheDocument();
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
  });
});
