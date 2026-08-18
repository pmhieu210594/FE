import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { DataOpsDashboardOptions, DataOpsFilters } from "../types";

type DataOpsFilterPillProps = Readonly<{
  label: string;
  children: ReactNode;
}>;

function DataOpsFilterPill({ label, children }: DataOpsFilterPillProps) {
  return (
    <div className="flex min-w-[180px] flex-1 flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
    </div>
  );
}

const dataOpsPillSelectClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-9 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:text-slate-400";

type DataOpsFilterBarProps = Readonly<{
  filters: DataOpsFilters;
  options: DataOpsDashboardOptions;
  isDisabled?: boolean;
  onChange: (next: Partial<DataOpsFilters>) => void;
}>;

export function DataOpsFilterBar({
  filters,
  options,
  isDisabled = false,
  onChange,
}: DataOpsFilterBarProps) {
  const { t } = useTranslation("locale");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <DataOpsFilterPill label={t("Pages.DataOpsDashboard.projectId")}>
          <select
            data-testid="project-select"
            value={filters.projectId}
            disabled={isDisabled}
            onChange={(event) =>
              onChange({
                projectId: event.target.value,
                repositoryId: "",
                connectorName: "",
              })
            }
            className={dataOpsPillSelectClass}
          >
            <option value="" disabled hidden>
              {t("Pages.DataOpsDashboard.selectProject", {
                defaultValue: "Select project",
              })}
            </option>
            {options.projects.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </DataOpsFilterPill>

        <DataOpsFilterPill label={t("Pages.DataOpsDashboard.repositoryId")}>
          <select
            data-testid="repository-select"
            value={filters.repositoryId}
            disabled={isDisabled}
            onChange={(event) =>
              onChange({ repositoryId: event.target.value, connectorName: "" })
            }
            className={dataOpsPillSelectClass}
          >
            <option value="" disabled hidden>
              {t("Pages.DataOpsDashboard.selectRepository", {
                defaultValue: "Select repository",
              })}
            </option>
            {options.repositories.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </DataOpsFilterPill>

        <DataOpsFilterPill label={t("Pages.DataOpsDashboard.connectorName")}>
          <select
            data-testid="connector-select"
            value={filters.connectorName}
            onChange={(event) =>
              onChange({ connectorName: event.target.value })
            }
            disabled={isDisabled || !filters.repositoryId}
            className={dataOpsPillSelectClass}
          >
            <option value="">
              {t("Pages.DataOpsDashboard.allConnectors", {
                defaultValue: "All connectors",
              })}
            </option>
            {options.connectors.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </DataOpsFilterPill>

        <DataOpsFilterPill
          label={t("Pages.DataOpsDashboard.parserStatus", {
            defaultValue: "Parser status",
          })}
        >
          <select
            data-testid="parser-status-select"
            value={filters.parserStatus}
            disabled={isDisabled}
            onChange={(event) => onChange({ parserStatus: event.target.value })}
            className={dataOpsPillSelectClass}
          >
            <option value="">
              {t("Pages.DataOpsDashboard.allParserStatuses", {
                defaultValue: "All statuses",
              })}
            </option>
            {(["SUCCESS", "WARNING", "ERROR"] as const).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </DataOpsFilterPill>
      </div>
    </div>
  );
}
