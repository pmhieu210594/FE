import { Download } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  CServerTable,
  type IServerTableColumn,
} from "@/components/ui/server-table";
import { CSvgIcon } from "@/components/ui/svg-icon";
import { CTooltip } from "@/components/ui/tooltip";
import { EIcon, ETableAlign } from "@/enums";
import type { PmDashboardTicketRow } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { formatScore } from "../utils";

type AllTicketsTableProps = {
  items: PmDashboardTicketRow[];
  page: number;
  perPage: number;
  totalElements: number;
  searchValue?: string;
  onSelect: (ticketId: string) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSearchChange?: (value?: string) => void;
  onExport?: () => void;
  isExporting?: boolean;
  paginationDescription?: (from: number, to: number, total: number) => string;
};

/**
 * Full ticket inventory table. This complements the attention list by keeping
 * clean tickets visible while still surfacing issue states with badges.
 */
export function AllTicketsTable({
  items,
  page,
  perPage,
  totalElements,
  searchValue,
  onSelect,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onExport,
  isExporting,
  paginationDescription,
}: Readonly<AllTicketsTableProps>) {
  const { t } = useTranslation("locale");

  const columns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "externalTicketKey",
        title: t("Pages.PmDashboard.ticket"),
      },
      {
        name: "title",
        title: t("Pages.PmDashboard.titleTicket", {
          defaultValue: "Title ticket",
        }),
        tableItem: {
          render: (value: string | null) => value ?? "-",
        },
      },
      {
        name: "phaseName",
        title: t("Pages.PmDashboard.phase", { defaultValue: "Phase" }),
        tableItem: {
          align: ETableAlign.center,
          render: (_value: string | null, row: PmDashboardTicketRow) => {
            return row.phaseName ?? "-";
          },
        },
      },
      {
        name: "status",
        title: t("Pages.PmDashboard.status"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => value ?? "-",
        },
      },
      {
        name: "evidenceQualityScore",
        title: t("Pages.PmDashboard.totalScore", { defaultValue: "Score" }),
        tableItem: {
          align: ETableAlign.center,
          render: (value: number | null) => formatScore(value),
        },
      },
      {
        name: "artifactVersion",
        title: t("Pages.PmDashboard.version", { defaultValue: "Version" }),
        tableItem: {
          align: ETableAlign.center,
          render: (value: number | null) => String(value ?? "-"),
        },
      },
      {
        name: "createdAt",
        title: t("Pages.PmDashboard.createAt", { defaultValue: "Create At" }),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => formatDateTime(value),
        },
      },
      {
        name: "ownerDisplay",
        title: t("Pages.PmDashboard.ownerDisplay", { defaultValue: "Creator" }),
      },
    ],
    [t],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {t("Pages.PmDashboard.allTicketsTitle", {
              defaultValue: "All tickets",
            })}
          </h2>
        </div>
      </div>

      <div className="mt-4">
        <CServerTable
          leftHeader={
            onExport ? (
              <Button
                onClick={onExport}
                disabled={isExporting}
                className="h-9 rounded-lg bg-blue-600 px-3 font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                {t("Pages.PmDashboard.export")}
              </Button>
            ) : undefined
          }
          columns={columns}
          data={items}
          sort={{}}
          onSortChange={() => {}}
          isPagination
          pagination={{
            total: totalElements,
            page,
            perPage,
            onChange: ({ page: nextPage, perPage: nextPerPage }) => {
              if (nextPerPage !== perPage) {
                onPerPageChange(nextPerPage);
              } else {
                onPageChange(nextPage);
              }
            },
          }}
          paginationDescription={paginationDescription}
          showSearch={true}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          action={{
            width: 130,
            fixed: "left",
            label: t("Components.Action"),
            name: (row: PmDashboardTicketRow) => row.externalTicketKey,
            render: (row: PmDashboardTicketRow) => (
              <CTooltip
                title={t("Pages.PmDashboard.viewDetail", {
                  defaultValue: "Xem chi tiết",
                })}
              >
                <button
                  type="button"
                  title={t("Pages.PmDashboard.viewDetail", {
                    defaultValue: "Xem chi tiết",
                  })}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(row.ticketId);
                  }}
                >
                  <CSvgIcon name={EIcon.eye} size={25} className="primary" />
                </button>
              </CTooltip>
            ),
          }}
        />
        {items.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            {t("Pages.PmDashboard.emptyState")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
