import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { RoleTabs } from "@/components/dashboard/RoleTabs";
import { getDashboardRouteForRole } from "@/components/dashboard/dashboardRoutes";
import { endpoints } from "@/lib/api";

import { DevFilterBar } from "./components/DevFilterBar";
import { DevSummaryCards } from "./components/DevSummaryCards";
import { DevTicketTable } from "./components/DevTicketTable";
import { DevTicketDetailDrawer } from "./components/DevTicketDetailDrawer";
import type {
  DevFilters,
  DevDashboardSummary,
  DevDashboardOptions,
} from "./types";

const INITIAL_FILTERS: DevFilters = {
  projectId: "",
  repositoryId: "",
  ciStatus: "",
  reviewStatus: "",
  search: "",
};

const INITIAL_PAGE_SIZE = 25;

const EMPTY_SUMMARY: DevDashboardSummary = {
  ciFailureCount: 0,
  reviewCommentCount: 0,
  parserErrorCount: 0,
};

const EMPTY_OPTIONS: DevDashboardOptions = {
  projects: [],
  repositories: [],
};

export function DevelopmentDashboardPage() {
  const { t } = useTranslation("locale");
  const { lang } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<DevFilters>({
    ...INITIAL_FILTERS,
    projectId: searchParams.get("projectId") ?? "",
  });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(INITIAL_PAGE_SIZE);
  const [selectedTicketId, setSelectedTicketId] = useState("");

  const updateFilters = (next: Partial<DevFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
    setPage(1);
  };

  const apiParams = {
    projectId: filters.projectId || undefined,
    repositoryId: filters.repositoryId || undefined,
    ciStatus: filters.ciStatus || undefined,
    reviewStatus: filters.reviewStatus || undefined,
    search: filters.search || undefined,
  };

  const { data: options = EMPTY_OPTIONS, isLoading: isOptionsLoading } =
    useQuery({
      queryKey: ["devDashboard", "options", filters.projectId],
      queryFn: () =>
        endpoints.devDashboard.options({
          projectId: filters.projectId || undefined,
        }),
    });

  const { data: summary = EMPTY_SUMMARY } = useQuery({
    queryKey: ["devDashboard", "summary", apiParams],
    queryFn: () => endpoints.devDashboard.summary(apiParams),
    enabled: Boolean(filters.projectId) && Boolean(filters.repositoryId),
  });

  const { data: ticketsPage, isFetching: isTicketsFetching } = useQuery({
    queryKey: ["devDashboard", "tickets", apiParams, page, size],
    queryFn: () => endpoints.devDashboard.tickets({ ...apiParams, page, size }),
    enabled: Boolean(filters.projectId) && Boolean(filters.repositoryId),
  });

  const uniqueRows = useMemo(() => {
    if (!ticketsPage?.items) return [];
    const seen = new Set<string>();
    return ticketsPage.items
      .filter((item) => {
        if (seen.has(item.ticketId)) return false;
        seen.add(item.ticketId);
        return true;
      })
      .map((item) => ({ ...item, id: item.ticketId }));
  }, [ticketsPage]);

  const detailQuery = useQuery({
    queryKey: ["devDashboard", "detail", selectedTicketId],
    queryFn: () => endpoints.devDashboard.detail(selectedTicketId),
    enabled: Boolean(selectedTicketId),
  });

  const exportMutation = useMutation({
    mutationFn: () => endpoints.devDashboard.exportCsv(apiParams),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dev-dashboard.csv";
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const handleProjectChange = (projectId: string) => {
    const nextProject = options.projects.find(
      (item) => item.value === projectId,
    );
    const nextRoute = getDashboardRouteForRole(nextProject?.role);
    if (nextProject && nextRoute && nextRoute !== "development-dashboard") {
      navigate(`/${lang ?? "en"}/${nextRoute}?projectId=${nextProject.value}`, {
        replace: true,
      });
      return;
    }
    updateFilters({ projectId, repositoryId: "" });
  };

  useEffect(() => {
    if (!options.projects.length) return;
    const projectIds = new Set(options.projects.map((item) => item.value));
    if (filters.projectId && projectIds.has(filters.projectId)) return;
    updateFilters({ projectId: options.projects[0].value, repositoryId: "" });
  }, [filters.projectId, options.projects]);

  useEffect(() => {
    if (!filters.projectId || !options.projects.length) return;
    const selectedProject = options.projects.find(
      (item) => item.value === filters.projectId,
    );
    if (!selectedProject) return;
    const route = getDashboardRouteForRole(selectedProject.role);
    if (route && route !== "development-dashboard") {
      navigate(`/${lang ?? "en"}/${route}?projectId=${selectedProject.value}`, {
        replace: true,
      });
    }
  }, [filters.projectId, lang, navigate, options.projects]);

  useEffect(() => {
    if (!filters.projectId || !options.repositories.length) return;
    const repositoryIds = new Set(options.repositories.map((o) => o.value));
    if (!filters.repositoryId) {
      updateFilters({ repositoryId: options.repositories[0].value });
      return;
    }
    if (!repositoryIds.has(filters.repositoryId)) {
      updateFilters({ repositoryId: options.repositories[0].value });
    }
  }, [filters.projectId, filters.repositoryId, options.repositories]);

  const handleRowClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handlePerPageChange = (perPage: number) => {
    setSize(perPage);
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4">
        <DevFilterBar
          filters={filters}
          options={options}
          isDisabled={isOptionsLoading}
          onChange={(next) => {
            if (next.projectId !== undefined) {
              handleProjectChange(next.projectId);
              return;
            }
            updateFilters(next);
          }}
        />
        <RoleTabs active="development" />
      </div>

      <div>
        <h1 className="text-[28px] font-bold leading-tight text-slate-900">
          {t("Pages.DevDashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("Pages.DevDashboard.description")}
        </p>
      </div>

      <DevSummaryCards summary={summary} />

      <DevTicketTable
        rows={uniqueRows}
        totalElements={ticketsPage?.totalElements ?? 0}
        page={ticketsPage?.page ?? page}
        perPage={ticketsPage?.size ?? size}
        searchValue={filters.search}
        onPageChange={setPage}
        onPerPageChange={handlePerPageChange}
        onSearchChange={(value) => updateFilters({ search: value ?? "" })}
        onSelect={handleRowClick}
        onExport={() => exportMutation.mutate()}
        isExporting={exportMutation.isPending}
        isLoading={isTicketsFetching}
      />

      <DevTicketDetailDrawer
        ticketId={selectedTicketId}
        detail={detailQuery.data ?? null}
        onClose={() => setSelectedTicketId("")}
      />
    </div>
  );
}
