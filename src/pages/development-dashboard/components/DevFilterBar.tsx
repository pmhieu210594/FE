import { useTranslation } from "react-i18next";

import {
  DashboardFilterPill,
  dashboardPillSelectClass,
} from "@/components/dashboard/DashboardFilterPill";
import type { DevDashboardOptions, DevFilters } from "../types";

type DevFilterBarProps = Readonly<{
  filters: DevFilters;
  options: DevDashboardOptions;
  isDisabled?: boolean;
  onChange: (next: Partial<DevFilters>) => void;
}>;

export function DevFilterBar({
  filters,
  options,
  isDisabled,
  onChange,
}: DevFilterBarProps) {
  const { t } = useTranslation("locale");

  return (
    <div className="flex flex-wrap gap-3">
      <DashboardFilterPill label={t("Pages.DevDashboard.projectId")}>
        <select
          data-testid="project-select"
          value={filters.projectId}
          disabled={isDisabled}
          onChange={(event) =>
            onChange({ projectId: event.target.value, repositoryId: "" })
          }
          className={dashboardPillSelectClass}
        >
          {options.projects.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </DashboardFilterPill>

      <DashboardFilterPill label={t("Pages.DevDashboard.repositoryId")}>
        <select
          data-testid="repository-select"
          value={filters.repositoryId}
          disabled={isDisabled}
          onChange={(event) => onChange({ repositoryId: event.target.value })}
          className={dashboardPillSelectClass}
        >
          {options.repositories.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </DashboardFilterPill>
    </div>
  );
}
