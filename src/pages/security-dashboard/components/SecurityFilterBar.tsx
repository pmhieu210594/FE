import { useTranslation } from "react-i18next";

import { DashboardFilterPill } from "@/components/dashboard/DashboardFilterPill";
import type { SecurityDashboardOptions, SecurityFilters } from "../types";

const pillSelectClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-9 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:text-slate-400";

type SecurityFilterBarProps = Readonly<{
  filters: SecurityFilters;
  options: SecurityDashboardOptions;
  onChange: (next: Partial<SecurityFilters>) => void;
}>;

export function SecurityFilterBar({
  filters,
  options,
  onChange,
}: SecurityFilterBarProps) {
  const { t } = useTranslation("locale");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <DashboardFilterPill label={t("Pages.SecurityDashboard.projectId")}>
          <select
            data-testid="project-select"
            value={filters.projectId}
            onChange={(event) =>
              onChange({ projectId: event.target.value, repositoryId: "" })
            }
            className={pillSelectClass}
          >
            {options.projects.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </DashboardFilterPill>

        <DashboardFilterPill label={t("Pages.SecurityDashboard.repositoryId")}>
          <select
            data-testid="repository-select"
            value={filters.repositoryId}
            onChange={(event) => onChange({ repositoryId: event.target.value })}
            className={pillSelectClass}
          >
            {options.repositories.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </DashboardFilterPill>
      </div>

      <div className="flex flex-wrap gap-3">
        <DashboardFilterPill label={t("Pages.SecurityDashboard.safetyStatus")}>
          <select
            value={filters.safetyStatus}
            onChange={(event) => onChange({ safetyStatus: event.target.value })}
            className={pillSelectClass}
          >
            <option value="">{t("Pages.SecurityDashboard.allStatuses")}</option>
            <option value="READY">READY</option>
            <option value="WARNING">WARNING</option>
            <option value="MISSING">MISSING</option>
          </select>
        </DashboardFilterPill>

        <DashboardFilterPill
          label={t("Pages.SecurityDashboard.secretScanStatus")}
        >
          <select
            value={filters.secretScanStatus}
            onChange={(event) =>
              onChange({ secretScanStatus: event.target.value })
            }
            className={pillSelectClass}
          >
            <option value="">{t("Pages.SecurityDashboard.allStatuses")}</option>
            <option value="PASS">PASS</option>
            <option value="FAIL">FAIL</option>
          </select>
        </DashboardFilterPill>

        {/* <DashboardFilterPill label={t("Pages.SecurityDashboard.sastStatus")}>
          <select
            value={filters.sastStatus}
            onChange={(event) => onChange({ sastStatus: event.target.value })}
            className={pillSelectClass}
          >
            <option value="">{t("Pages.SecurityDashboard.allStatuses")}</option>
            <option value="PASS">PASS</option>
            <option value="WARNING">WARNING</option>
            <option value="FAIL">FAIL</option>
          </select>
        </DashboardFilterPill> */}

        <DashboardFilterPill
          label={t("Pages.SecurityDashboard.exceptionStatus")}
        >
          <select
            value={filters.exceptionStatus}
            onChange={(event) =>
              onChange({ exceptionStatus: event.target.value })
            }
            className={pillSelectClass}
          >
            <option value="">{t("Pages.SecurityDashboard.allStatuses")}</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </DashboardFilterPill>
      </div>
    </div>
  );
}
