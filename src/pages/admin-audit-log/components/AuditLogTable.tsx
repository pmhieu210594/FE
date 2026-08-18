import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  CServerTable,
  type IServerTableColumn,
} from "@/components/ui/server-table";
import { CSvgIcon } from "@/components/ui/svg-icon";
import { CTooltip } from "@/components/ui/tooltip";
import { EIcon, ETableAlign } from "@/enums";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogListItem } from "../types";
type AuditLogTableProps = Readonly<{
  rows: AuditLogListItem[];
  totalElements: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onViewDetail: (row: AuditLogListItem) => void;
}>;

export function AuditLogTable({
  rows,
  totalElements,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  onViewDetail,
}: AuditLogTableProps) {
  const { t } = useTranslation("locale");

  const columns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "occurredAt",
        title: t("Pages.AdminAuditLog.table.time"),
        tableItem: {
          width: 200,
          align: ETableAlign.center,
          render: (value: string | null) => formatDateTime(value),
        },
      },
      {
        name: "actorUsername",
        title: t("Pages.AdminAuditLog.table.actor"),
        tableItem: {
          width: 280,
          render: (value: string | null) => value ?? "-",
        },
      },
      {
        name: "module",
        title: t("Pages.AdminAuditLog.table.module"),
        tableItem: { width: 150 },
      },
      {
        name: "entityType",
        title: t("Pages.AdminAuditLog.table.entity"),
        tableItem: {
          render: (value: string | null, row: AuditLogListItem) =>
            [value, row.entityId].filter(Boolean).join(" / ") || "-",
        },
      },
      {
        name: "operationType",
        title: t("Pages.AdminAuditLog.table.operation"),
        tableItem: { width: 250 },
      },
    ],
    [t],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <CServerTable
        showSearch={false}
        columns={columns}
        data={rows}
        sort={{}}
        onSortChange={() => {}}
        isPagination
        pagination={{
          total: totalElements,
          page,
          perPage,
          pageSizeOptions: [perPage, 25, 50, 75, 100],
          onChange: ({ page: nextPage, perPage: nextPerPage }) => {
            if (nextPerPage !== perPage) {
              onPerPageChange(nextPerPage);
              return;
            }
            onPageChange(nextPage);
          },
        }}
        action={{
          width: 100,
          fixed: "left",
          label: t("Pages.AdminAuditLog.table.detail"),
          name: (row: AuditLogListItem) => row.id,
          render: (row: AuditLogListItem) => (
            <CTooltip title={t("Pages.AdminAuditLog.table.detail")}>
              <button
                type="button"
                title={t("Pages.AdminAuditLog.table.detail")}
                aria-label={t("Pages.AdminAuditLog.table.detail")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => onViewDetail(row)}
              >
                <CSvgIcon name={EIcon.eye} size={25} className="primary" />
              </button>
            </CTooltip>
          ),
        }}
        onRow={(row: AuditLogListItem) => ({
          onClick: () => onViewDetail(row),
        })}
      />
    </div>
  );
}
