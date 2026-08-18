import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { PmDashboardOption } from "@/lib/api";
import type { DashboardFilters } from "../types";

type FilterPillProps = {
  label: string;
  children: ReactNode;
};

/** A single labeled dropdown "pill" (PROJECT / SPRINT / REPOSITORY / ...). */
function FilterPill({ label, children }: Readonly<FilterPillProps>) {
  return (
    <div className="flex min-w-[180px] flex-1 flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
    </div>
  );
}

const pillSelectClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-9 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:text-slate-400";

type FilterBarProps = {
  filters: DashboardFilters;
  projectOptions: PmDashboardOption[];
  repositoryOptions: PmDashboardOption[];
  isDisabled: boolean;
  onChange: (next: Partial<DashboardFilters>, resetPage?: boolean) => void;
};

/**
 * Filter row: project / repository pills.
 */
export function FilterBar({
  filters,
  projectOptions,
  repositoryOptions,
  isDisabled,
  onChange,
}: Readonly<FilterBarProps>) {
  const { t } = useTranslation("locale");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <FilterPill label={t("Pages.PmDashboard.projectId")}>
          <select
            value={filters.projectId}
            disabled={isDisabled}
            onChange={(event) =>
              onChange(
                { projectId: event.target.value, repositoryId: "" },
                true,
              )
            }
            className={pillSelectClass}
          >
            <option value="" disabled hidden>
              {t("Pages.PmDashboard.selectProject", {
                defaultValue: "Select project",
              })}
            </option>
            {projectOptions.map((project) => (
              <option key={project.value} value={project.value}>
                {project.label}
              </option>
            ))}
          </select>
        </FilterPill>

        <FilterPill label={t("Pages.PmDashboard.repositoryId")}>
          <select
            value={filters.repositoryId}
            disabled={isDisabled}
            onChange={(event) =>
              onChange({ repositoryId: event.target.value }, true)
            }
            className={pillSelectClass}
          >
            <option value="" disabled hidden>
              {t("Pages.PmDashboard.selectRepository", {
                defaultValue: "Select repository",
              })}
            </option>
            {repositoryOptions.map((repository) => (
              <option key={repository.value} value={repository.value}>
                {repository.label}
              </option>
            ))}
          </select>
        </FilterPill>
      </div>
    </div>
  );
}
