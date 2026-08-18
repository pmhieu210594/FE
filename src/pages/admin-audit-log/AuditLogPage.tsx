import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { endpoints } from "@/lib/api";

import { AuditLogFilterBar } from "./components/AuditLogFilterBar";
import { AuditLogTable } from "./components/AuditLogTable";
import { AuditLogDetailDrawer } from "./components/AuditLogDetailDrawer";
import { useAuditLogFilters } from "./hooks/useAuditLogFilters";
import type { AuditLogFilters, AuditLogListItem } from "./types";

export function AuditLogPage() {
  const { t } = useTranslation("locale");
  const { filters, updateFilters } = useAuditLogFilters();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedId, setSelectedId] = useState("");

  const updateFiltersAndResetPage = useCallback(
    (next: Partial<AuditLogFilters>) => {
      updateFilters(next);
      setPage(1);
    },
    [updateFilters],
  );

  const listQuery = useQuery({
    queryKey: ["adminAuditLogs", "list", filters, page, perPage],
    queryFn: () =>
      endpoints.adminAuditLogs.list({
        module: filters.module || undefined,
        operationType: filters.operationType || undefined,
        actor: filters.actor || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        search: filters.search || undefined,
        page: page - 1,
        size: perPage,
      }),
  });

  const detailQuery = useQuery({
    queryKey: ["adminAuditLogs", "detail", selectedId],
    queryFn: () => endpoints.adminAuditLogs.detail(selectedId),
    enabled: Boolean(selectedId),
  });

  const items = listQuery.data?.items ?? [];

  const handleViewDetail = (row: AuditLogListItem) => {
    setSelectedId(row.id);
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-slate-900">
          {t("Pages.AdminAuditLog.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("Pages.AdminAuditLog.description")}
        </p>
      </div>

      <AuditLogFilterBar
        filters={filters}
        onChange={(next) => updateFiltersAndResetPage(next)}
      />

      <AuditLogTable
        rows={items}
        totalElements={listQuery.data?.totalElements ?? 0}
        page={
          listQuery.data?.page !== undefined ? listQuery.data.page + 1 : page
        }
        perPage={listQuery.data?.size ?? perPage}
        onPageChange={setPage}
        onPerPageChange={(nextPerPage) => {
          setPage(1);
          setPerPage(nextPerPage);
        }}
        onViewDetail={handleViewDetail}
      />

      <AuditLogDetailDrawer
        detail={detailQuery.data ?? null}
        isLoading={Boolean(selectedId) && detailQuery.isLoading}
        onClose={() => setSelectedId("")}
      />
    </div>
  );
}
