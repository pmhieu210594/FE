import { Download } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  CServerTable,
  type IServerTableColumn,
} from "@/components/ui/server-table";
import { ETableAlign } from "@/enums";
import { cn } from "@/lib/utils";
import { acStatusClasses, acStatusLabel } from "../utils";
import type { AcceptanceCriteriaRow, AcStatus } from "../types";

type AcceptanceCriteriaTableProps = Readonly<{
  rows: AcceptanceCriteriaRow[];
  totalElements: number;
  page: number;
  perPage: number;
  searchValue?: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSearchChange?: (value?: string) => void;
  onExport?: () => void;
  isExporting?: boolean;
  isLoading?: boolean;
}>;

export function AcceptanceCriteriaTable({
  rows,
  totalElements,
  page,
  perPage,
  searchValue,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onExport,
  isExporting,
  isLoading = false,
}: AcceptanceCriteriaTableProps) {
  const { t } = useTranslation("locale");

  const columns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "acId",
        title: t("Pages.QaDashboard.acceptanceCriteria.ac"),
      },
      {
        name: "ticketKey",
        title: t("Pages.QaDashboard.acceptanceCriteria.ticket"),
      },
      {
        name: "status",
        title: t("Pages.QaDashboard.acceptanceCriteria.status"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: AcStatus) => (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                acStatusClasses[value],
              )}
            >
              {acStatusLabel[value]}
            </span>
          ),
        },
      },
    ],
    [t],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        {t("Pages.QaDashboard.acceptanceCriteria.title")}
      </h2>

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
                {t("Pages.QaDashboard.export")}
              </Button>
            ) : undefined
          }
          columns={columns}
          data={rows}
          sort={{}}
          onSortChange={() => {}}
          isLoading={isLoading}
          isPagination
          pagination={{
            total: totalElements,
            page: page + 1,
            perPage,
            onChange: ({ page: nextPage, perPage: nextPerPage }) => {
              if (nextPerPage !== perPage) {
                onPerPageChange(nextPerPage);
              } else {
                onPageChange(nextPage - 1);
              }
            },
          }}
          showSearch={true}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />
      </div>
    </div>
  );
}
