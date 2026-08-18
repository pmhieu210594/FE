import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { endpoints } from "@/lib/api";
import { getDashboardRouteForRole } from "@/components/dashboard/dashboardRoutes";

import { FilterBar } from "./components/FilterBar";
import { SummaryCards } from "./components/SummaryCards";
import { RoleTabs } from "@/components/dashboard/RoleTabs";
import { AllTicketsTable } from "./components/AllTicketsTable";
import { TicketDetailDrawer } from "./components/TicketDetailDrawer";
import { usePmDashboardFilters } from "./hooks/usePmDashboardFilters";

export function PMDashboardPage() {
  const { t } = useTranslation("locale");
  const { lang } = useParams();
  const navigate = useNavigate();
  const { filters, updateFilters, gotoPage, gotoPageWithSize } =
    usePmDashboardFilters();
  const [selectedTicketId, setSelectedTicketId] = useState("");

  const optionsQuery = useQuery({
    queryKey: ["pm-dashboard", "options", filters.projectId],
    queryFn: () =>
      endpoints.pmDashboard.options({
        projectId: filters.projectId || undefined,
      }),
  });
  const selectedProject = optionsQuery.data?.projects.find(
    (item) => item.value === filters.projectId,
  );
  const selectedRoute = getDashboardRouteForRole(selectedProject?.role);
  const isMatchingDashboard =
    !selectedProject || !selectedRoute || selectedRoute === "pm-dashboard";

  const handleProjectChange = (projectId: string) => {
    const nextProject = optionsQuery.data?.projects.find(
      (item) => item.value === projectId,
    );
    const nextRoute = getDashboardRouteForRole(nextProject?.role);
    if (nextProject && nextRoute && nextRoute !== "pm-dashboard") {
      navigate(`/${lang ?? "en"}/${nextRoute}?projectId=${nextProject.value}`, {
        replace: true,
      });
      return;
    }
    updateFilters({ projectId, repositoryId: "" }, true);
  };

  const summaryQuery = useQuery({
    queryKey: ["pm-dashboard", "summary", filters],
    queryFn: () =>
      endpoints.pmDashboard.summary({
        projectId: filters.projectId || undefined,
        repositoryId: filters.repositoryId || undefined,
        scoreBand: filters.scoreBand || undefined,
        riskLevel: filters.riskLevel || undefined,
        search: filters.search || undefined,
      }),
    // only run after options (projects/repositories) have loaded and a project/repository is selected
    enabled:
      optionsQuery.isSuccess &&
      Boolean(filters.projectId) &&
      Boolean(filters.repositoryId) &&
      isMatchingDashboard,
  });

  const ticketsQuery = useQuery({
    queryKey: ["pm-dashboard", "tickets", filters],
    queryFn: () =>
      endpoints.pmDashboard.tickets({
        projectId: filters.projectId || undefined,
        repositoryId: filters.repositoryId || undefined,
        scoreBand: filters.scoreBand || undefined,
        riskLevel: filters.riskLevel || undefined,
        search: filters.search || undefined,
        page: filters.page,
        size: filters.size,
      }),
    // only run after options (projects/repositories) have loaded and a project/repository is selected
    enabled:
      optionsQuery.isSuccess &&
      Boolean(filters.projectId) &&
      Boolean(filters.repositoryId) &&
      isMatchingDashboard,
  });

  const detailQuery = useQuery({
    queryKey: ["pm-dashboard", "detail", selectedTicketId],
    queryFn: () => endpoints.pmDashboard.detail(selectedTicketId),
    enabled: Boolean(selectedTicketId),
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      endpoints.pmDashboard.exportCsv({
        projectId: filters.projectId || undefined,
        repositoryId: filters.repositoryId || undefined,
        scoreBand: filters.scoreBand || undefined,
        riskLevel: filters.riskLevel || undefined,
        search: filters.search || undefined,
      }),
    onSuccess: async (blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "pm-dashboard.csv";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      message.success(t("Pages.PmDashboard.exportSuccess"));
    },
  });

  useEffect(() => {
    if (!optionsQuery.data?.projects?.length) return;
    const projectIds = new Set(
      optionsQuery.data.projects.map((item) => item.value),
    );
    if (filters.projectId && projectIds.has(filters.projectId)) return;
    updateFilters(
      { projectId: optionsQuery.data.projects[0].value, repositoryId: "" },
      true,
    );
  }, [filters.projectId, optionsQuery.data?.projects, updateFilters]);

  useEffect(() => {
    if (!filters.projectId || !optionsQuery.data?.projects?.length) return;
    const selectedProject = optionsQuery.data.projects.find(
      (item) => item.value === filters.projectId,
    );
    if (!selectedProject) return;
    const route = getDashboardRouteForRole(selectedProject.role);
    if (route && route !== "pm-dashboard") {
      navigate(`/${lang ?? "en"}/${route}?projectId=${selectedProject.value}`, {
        replace: true,
      });
    }
  }, [filters.projectId, lang, navigate, optionsQuery.data?.projects]);

  useEffect(() => {
    if (!filters.projectId || !optionsQuery.data?.repositories?.length) return;
    const repositoryIds = new Set(
      optionsQuery.data.repositories.map((option) => option.value),
    );
    if (!filters.repositoryId) {
      updateFilters(
        { repositoryId: optionsQuery.data.repositories[0].value },
        true,
      );
      return;
    }
    if (!repositoryIds.has(filters.repositoryId)) {
      updateFilters(
        { repositoryId: optionsQuery.data.repositories[0].value },
        true,
      );
    }
  }, [
    filters.projectId,
    filters.repositoryId,
    optionsQuery.data?.repositories,
    updateFilters,
  ]);

  const summary = summaryQuery.data;
  const ticketsPage = ticketsQuery.data;
  const rows = ticketsPage?.items ?? [];
  const optionData = optionsQuery.data;
  const isFilterDisabled = optionsQuery.isLoading;

  const handleOpenTicket = (ticketIdToOpen: string) => {
    setSelectedTicketId(ticketIdToOpen);
  };

  const handleCloseDetail = () => {
    setSelectedTicketId("");
  };

  const handlePerPageChange = (perPage: number) => {
    gotoPageWithSize(1, perPage);
  };

  return (
    <div className="space-y-6 pb-10">
      <FilterBar
        filters={filters}
        projectOptions={optionData?.projects ?? []}
        repositoryOptions={optionData?.repositories ?? []}
        isDisabled={isFilterDisabled}
        onChange={(next, resetPage) => {
          if (next.projectId !== undefined) {
            handleProjectChange(next.projectId);
            return;
          }
          updateFilters(next, resetPage);
        }}
      />
      <RoleTabs active="pm" />
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
          {t("Pages.PmDashboard.title")}
        </h1>
        <h2 className="mt-2 max-w-3xl text-base text-slate-500 md:text-lg">
          {t("Pages.PmDashboard.description")}
        </h2>
      </div>
      <SummaryCards summary={summary} />

      <AllTicketsTable
        items={rows}
        page={ticketsPage?.page ?? filters.page}
        perPage={ticketsPage?.size ?? filters.size}
        totalElements={ticketsPage?.totalElements ?? 0}
        searchValue={filters.search}
        onPageChange={gotoPage}
        onPerPageChange={handlePerPageChange}
        onSearchChange={(value) => updateFilters({ search: value }, true)}
        onExport={() => exportMutation.mutate()}
        isExporting={exportMutation.isPending}
        onSelect={handleOpenTicket}
        paginationDescription={(_, __, total) => `${total} total`}
      />

      <TicketDetailDrawer
        ticketId={selectedTicketId}
        detail={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        error={detailQuery.error}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
