import { useTranslation } from "react-i18next";

import {
  DashboardFilterPill,
  dashboardPillSelectClass,
} from "@/components/dashboard/DashboardFilterPill";
import type { QaDashboardOptions, QaFilters } from "../types";

type QaFilterBarProps = Readonly<{
  filters: QaFilters;
  options: QaDashboardOptions;
  isDisabled: boolean;
  onChange: (next: Partial<QaFilters>) => void;
}>;

export function QaFilterBar({
  filters,
  options,
  isDisabled,
  onChange,
}: QaFilterBarProps) {
  const { t } = useTranslation("locale");

  return (
    <div className="flex flex-wrap gap-3">
      <DashboardFilterPill label={t("Pages.QaDashboard.projectId")}>
        <select
          data-testid="project-select"
          value={filters.projectId}
          disabled={isDisabled}
          onChange={(event) =>
            onChange({
              projectId: event.target.value,
              repositoryId: "",
              ticketId: "",
            })
          }
          className={dashboardPillSelectClass}
        >
          {options.projects.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </DashboardFilterPill>

      <DashboardFilterPill label={t("Pages.QaDashboard.repositoryId")}>
        <select
          data-testid="repository-select"
          value={filters.repositoryId}
          disabled={isDisabled}
          onChange={(event) =>
            onChange({ repositoryId: event.target.value, ticketId: "" })
          }
          className={dashboardPillSelectClass}
        >
          {options.repositories.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </DashboardFilterPill>
    </div>
  );
}
