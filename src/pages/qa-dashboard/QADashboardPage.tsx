import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { RoleTabs } from "@/components/dashboard/RoleTabs";
import { getDashboardRouteForRole } from "@/components/dashboard/dashboardRoutes";
import type { IServerTableSort } from "@/components/ui/server-table";
import { endpoints } from "@/lib/api";

import { QaFilterBar } from "./components/QaFilterBar";
import { QaTicketsTable } from "./components/QaTicketsTable";
import type { QaDashboardOptions, QaFilters } from "./types";
import { QaTicketDetailModal } from "./QaTicketDetailPage";

const TICKETS_INITIAL_PAGE_SIZE = 25;

const EMPTY_OPTIONS: QaDashboardOptions = {
  projects: [],
  repositories: [],
  tickets: [],
};

function readFilters(searchParams: URLSearchParams): QaFilters {
  return {
    projectId: searchParams.get("projectId") ?? "",
    repositoryId: searchParams.get("repositoryId") ?? "",
    ticketId: searchParams.get("ticketId") ?? "",
    search: searchParams.get("search") ?? "",
  };
}

export function QADashboardPage() {
  const { t } = useTranslation("locale");
  const { lang } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const filters = readFilters(searchParams);
  const page = Number(searchParams.get("page") ?? "0") || 0;
  const size =
    Number(searchParams.get("size") ?? String(TICKETS_INITIAL_PAGE_SIZE)) ||
    TICKETS_INITIAL_PAGE_SIZE;
  const sortBy = searchParams.get("sortBy") ?? undefined;
  const sortDir =
    (searchParams.get("sortDir") as "asc" | "desc" | null) ?? undefined;

  const patchParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    setSearchParams(next);
  };

  const updateFilters = (next: Partial<QaFilters>) => {
    patchParams({ ...next, page: "0" });
  };

  const sharedParams = {
    projectId: filters.projectId || undefined,
    repositoryId: filters.repositoryId || undefined,
    search: filters.search || undefined,
  };

  const optionsQuery = useQuery({
    queryKey: ["qa-dashboard-options", filters.projectId, filters.repositoryId],
    queryFn: () =>
      endpoints.qaDashboard.options({
        projectId: filters.projectId || undefined,
        repositoryId: filters.repositoryId || undefined,
      }),
  });

  const ticketsQuery = useQuery({
    queryKey: [
      "qa-dashboard-tickets",
      sharedParams,
      page,
      size,
      sortBy,
      sortDir,
    ],
    queryFn: () =>
      endpoints.qaDashboard.tickets({
        ...sharedParams,
        page,
        size,
        ...(sortBy ? { sortBy, sortDir } : {}),
      }),
    placeholderData: (prev) => prev,
    enabled:
      optionsQuery.isSuccess &&
      Boolean(filters.projectId) &&
      Boolean(filters.repositoryId),
  });

  const options = optionsQuery.data ?? EMPTY_OPTIONS;
  const isFilterDisabled = optionsQuery.isLoading;
  const selectedProject = options.projects.find(
    (item) => item.value === filters.projectId,
  );

  useEffect(() => {
    if (!options.projects.length) return;
    const projectIds = new Set(options.projects.map((item) => item.value));
    if (filters.projectId && projectIds.has(filters.projectId)) return;
    updateFilters({
      projectId: options.projects[0].value,
      repositoryId: "",
      ticketId: "",
    });
  }, [
    filters.projectId,
    options.projects.length,
    selectedProject,
    updateFilters,
  ]);

  useEffect(() => {
    if (!filters.projectId || !options.projects.length) return;
    const project = options.projects.find(
      (item) => item.value === filters.projectId,
    );
    if (!project) return;
    const route = getDashboardRouteForRole(project.role);
    if (route && route !== "qa-dashboard") {
      navigate(`/${lang ?? "en"}/${route}?projectId=${project.value}`, {
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
  }, [
    filters.projectId,
    filters.repositoryId,
    options.repositories,
    updateFilters,
  ]);

  const ticketsData = ticketsQuery.data;
  const ticketsRows = useMemo(() => {
    const seen = new Set<string>();
    return (
      (ticketsData?.items ?? [])
        .filter((row) => {
          if (seen.has(row.ticketId)) return false;
          seen.add(row.ticketId);
          return true;
        })
        // CGridVirtualizer's getRowId falls back to `projectId` when there's no
        // `id`, and every row here shares the same projectId — give it a
        // unique `id` so row keys don't collide.
        .map((row) => ({ ...row, id: row.ticketId }))
    );
  }, [ticketsData?.items]);

  const handleProjectChange = (projectId: string) => {
    const nextProject = options.projects.find(
      (item) => item.value === projectId,
    );
    const route = getDashboardRouteForRole(nextProject?.role);
    if (nextProject && route && route !== "qa-dashboard") {
      navigate(`/${lang ?? "en"}/${route}?projectId=${nextProject.value}`, {
        replace: true,
      });
      return;
    }
    updateFilters({ projectId, repositoryId: "", ticketId: "" });
  };

  const handlePerPageChange = (perPage: number) => {
    patchParams({ size: String(perPage), page: "0" });
  };

  const sort: IServerTableSort = {
    sortBy,
    sortDir: sortDir,
  };

  const handleViewDetail = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4">
        <QaFilterBar
          filters={filters}
          options={options}
          isDisabled={isFilterDisabled}
          onChange={(next) => {
            if (next.projectId !== undefined) {
              handleProjectChange(next.projectId);
              return;
            }
            updateFilters(next);
          }}
        />
        <RoleTabs active="qa" />
      </div>

      <div>
        <h1 className="text-[28px] font-bold leading-tight text-slate-900">
          {t("Pages.QaDashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("Pages.QaDashboard.description")}
        </p>
      </div>

      <QaTicketsTable
        rows={ticketsRows}
        totalElements={ticketsData?.totalElements ?? 0}
        page={page}
        perPage={size}
        searchValue={filters.search}
        sort={sort}
        onSortChange={(next) =>
          patchParams({
            sortBy: next.sortBy,
            sortDir: next.sortDir,
            page: "0",
          })
        }
        onPageChange={(nextPage) => patchParams({ page: String(nextPage) })}
        onPerPageChange={handlePerPageChange}
        onSearchChange={(value) => updateFilters({ search: value ?? "" })}
        onSelect={handleViewDetail}
        isLoading={ticketsQuery.isFetching}
      />

      <QaTicketDetailModal
        ticketId={selectedTicketId}
        open={selectedTicketId !== null}
        onClose={() => setSelectedTicketId(null)}
      />
    </div>
  );
}
