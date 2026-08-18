import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  getDashboardRouteForRole,
  normalizeDashboardRole,
} from "@/components/dashboard/dashboardRoutes";
import { RoleTabs } from "@/components/dashboard/RoleTabs";
import { endpoints } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

import { SecurityFilterBar } from "./components/SecurityFilterBar";
import { SecuritySummaryCards } from "./components/SecuritySummaryCards";
import { SecurityTicketTable } from "./components/SecurityTicketTable";
import { SecurityTicketDetailDrawer } from "./components/SecurityTicketDetailDrawer";
import type {
  SecurityDashboardOptions,
  SecurityDashboardSummary,
  SecurityFilters,
} from "./types";

const INITIAL_FILTERS: SecurityFilters = {
  projectId: "",
  repositoryId: "",
  search: "",
  safetyStatus: "",
  secretScanStatus: "",
  sastStatus: "",
  exceptionStatus: "",
};

const DEFAULT_TICKET_PAGE_SIZE = 25;

const DEFAULT_SUMMARY: SecurityDashboardSummary = {
  safetyPack: { readyCount: 0, warningCount: 0, missingCount: 0 },
  secretScan: { passCount: 0, failCount: 0 },
  sastSca: { passCount: 0, warningCount: 0, failCount: 0 },
  exception: { openCount: 0, totalCount: 0 },
  updatedAt: "",
};

const EMPTY_OPTIONS: SecurityDashboardOptions = {
  projects: [],
  repositories: [],
};

const REQUIRED_ROLE = "SECURITY";

export function SecurityDashboardPage() {
  const { t } = useTranslation("locale");
  const { lang } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<SecurityFilters>({
    ...INITIAL_FILTERS,
    projectId: searchParams.get("projectId") ?? "",
  });
  const [ticketPage, setTicketPage] = useState(0);
  const [ticketPageSize, setTicketPageSize] = useState(
    DEFAULT_TICKET_PAGE_SIZE,
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");

  const updateFilters = useCallback((next: Partial<SecurityFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
    setTicketPage(0);
  }, []);

  const { data: options = EMPTY_OPTIONS } = useQuery({
    queryKey: ["security-dashboard", "options", filters.projectId],
    queryFn: () =>
      endpoints.securityDashboard.options({
        projectId: filters.projectId || undefined,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const allowedProject =
    options.projects.find(
      (item) => normalizeDashboardRole(item.role) === REQUIRED_ROLE,
    ) ?? options.projects[0];
  const displayProjectId = filters.projectId || allowedProject?.value || "";

  const repositoriesData = options.repositories;

  const displayRepositoryId =
    filters.repositoryId ||
    (displayProjectId ? repositoriesData[0]?.value || "" : "");

  useEffect(() => {
    if (options.projects.length === 0) return;

    if (filters.projectId) {
      const selectedProject = options.projects.find(
        (item) => item.value === filters.projectId,
      );
      if (!selectedProject) {
        if (allowedProject) {
          updateFilters({
            projectId: allowedProject.value,
            repositoryId: "",
          });
        }
        return;
      }
      const route = getDashboardRouteForRole(selectedProject.role);
      if (route && route !== "security-dashboard") {
        navigate(
          `/${lang ?? "en"}/${route}?projectId=${selectedProject.value}`,
          {
            replace: true,
          },
        );
      }
    } else if (allowedProject) {
      updateFilters({
        projectId: allowedProject.value,
        repositoryId: "",
      });
    }
  }, [
    allowedProject,
    filters.projectId,
    lang,
    navigate,
    options.projects,
    updateFilters,
  ]);

  useEffect(() => {
    if (!filters.projectId || repositoriesData.length === 0) return;

    const repositoryIds = new Set(repositoriesData.map((item) => item.value));
    if (!filters.repositoryId || !repositoryIds.has(filters.repositoryId)) {
      updateFilters({ repositoryId: displayRepositoryId });
    }
  }, [
    displayRepositoryId,
    filters.projectId,
    filters.repositoryId,
    repositoriesData,
    updateFilters,
  ]);

  const debouncedSearch = useDebounce(filters.search, 300);

  const sharedParams = {
    projectId: displayProjectId || undefined,
    repositoryId: displayRepositoryId || undefined,
    search: debouncedSearch || undefined,
  };

  const statusParams = {
    safetyStatus: filters.safetyStatus || undefined,
    secretScanStatus: filters.secretScanStatus || undefined,
    sastStatus: filters.sastStatus || undefined,
    exceptionStatus: filters.exceptionStatus || undefined,
  };

  const summaryQuery = useQuery({
    queryKey: ["security-dashboard-summary", sharedParams, statusParams],
    queryFn: () =>
      endpoints.securityDashboard.summary({ ...sharedParams, ...statusParams }),
    enabled: Boolean(displayProjectId) && Boolean(displayRepositoryId),
  });

  const ticketsQuery = useQuery({
    queryKey: [
      "security-dashboard-tickets",
      sharedParams,
      statusParams,
      ticketPage,
      ticketPageSize,
    ],
    queryFn: () =>
      endpoints.securityDashboard.tickets({
        ...sharedParams,
        ...statusParams,
        page: ticketPage,
        size: ticketPageSize,
      }),
    placeholderData: (prev) => prev,
    enabled: Boolean(displayProjectId) && Boolean(displayRepositoryId),
  });

  const detailQuery = useQuery({
    queryKey: ["security-dashboard-ticket-detail", selectedTicketId],
    queryFn: () => endpoints.securityDashboard.ticketDetail(selectedTicketId),
    enabled: Boolean(selectedTicketId),
  });

  const summary = summaryQuery.data ?? DEFAULT_SUMMARY;
  const ticketData = ticketsQuery.data;

  const handleProjectChange = (projectId: string) => {
    const nextProject = options.projects.find(
      (item) => item.value === projectId,
    );
    const nextRoute = getDashboardRouteForRole(nextProject?.role);
    if (nextProject && nextRoute && nextRoute !== "security-dashboard") {
      navigate(`/${lang ?? "en"}/${nextRoute}?projectId=${nextProject.value}`, {
        replace: true,
      });
      return;
    }
    updateFilters({ projectId, repositoryId: "" });
  };

  const handlePerPageChange = (perPage: number) => {
    setTicketPageSize(perPage);
    setTicketPage(0);
  };

  const exportMutation = useMutation({
    mutationFn: () =>
      endpoints.securityDashboard.exportCsv({
        ...sharedParams,
        ...statusParams,
      }),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "security-dashboard.csv";
      anchor.click();
      URL.revokeObjectURL(url);
      message.success(t("Pages.SecurityDashboard.exportSuccess"));
    },
    onError: () => {
      message.error(t("Pages.SecurityDashboard.exportFailed"));
    },
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4">
        <SecurityFilterBar
          filters={filters}
          options={{
            projects: options.projects,
            repositories: repositoriesData,
          }}
          onChange={(next) => {
            if (next.projectId !== undefined) {
              handleProjectChange(next.projectId);
              return;
            }
            updateFilters(next);
          }}
        />
        <RoleTabs active="security" />
      </div>

      <div>
        <h1 className="text-[28px] font-bold leading-tight text-slate-900">
          {t("Pages.SecurityDashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("Pages.SecurityDashboard.description")}
        </p>
      </div>

      <SecuritySummaryCards summary={summary} />

      <SecurityTicketTable
        rows={ticketData?.items ?? []}
        totalElements={ticketData?.totalElements ?? 0}
        page={ticketPage}
        perPage={ticketData?.size ?? ticketPageSize}
        searchValue={filters.search}
        onPageChange={setTicketPage}
        onPerPageChange={handlePerPageChange}
        onSearchChange={(value) => updateFilters({ search: value ?? "" })}
        onExport={() => {
          exportMutation.mutate();
        }}
        isExporting={exportMutation.isPending}
        onSelectTicket={setSelectedTicketId}
        isLoading={ticketsQuery.isFetching}
      />

      <SecurityTicketDetailDrawer
        ticketId={selectedTicketId}
        detail={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        error={detailQuery.error}
        onClose={() => setSelectedTicketId("")}
      />
    </div>
  );
}
