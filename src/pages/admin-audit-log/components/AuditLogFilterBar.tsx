import type { ReactNode } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import type { AuditLogFilters } from "../types";

const { RangePicker } = DatePicker;

const MODULE_OPTIONS = [
  "LOGIN",
  "ROLE",
  "ORGANIZATION",
  "CUSTOMER",
  "PROJECT",
  "REPOSITORY",
  "TEAM",
  "MEMBER_USER",
] as const;

const OPERATION_TYPE_OPTIONS = [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "LOGOUT",
] as const;

type AuditLogFilterPillProps = Readonly<{
  label: string;
  children: ReactNode;
}>;

function AuditLogFilterPill({ label, children }: AuditLogFilterPillProps) {
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

const pillInputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400";

type AuditLogFilterBarProps = Readonly<{
  filters: AuditLogFilters;
  onChange: (next: Partial<AuditLogFilters>) => void;
}>;

export function AuditLogFilterBar({
  filters,
  onChange,
}: AuditLogFilterBarProps) {
  const { t } = useTranslation("locale");

  return (
    <div className="flex flex-wrap gap-3">
      <AuditLogFilterPill label={t("Pages.AdminAuditLog.filters.module")}>
        <select
          data-testid="module-select"
          value={filters.module}
          onChange={(event) => onChange({ module: event.target.value })}
          className={pillSelectClass}
        >
          <option value="">{t("Pages.AdminAuditLog.filters.all")}</option>
          {MODULE_OPTIONS.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>
      </AuditLogFilterPill>

      <AuditLogFilterPill
        label={t("Pages.AdminAuditLog.filters.operationType")}
      >
        <select
          data-testid="operation-type-select"
          value={filters.operationType}
          onChange={(event) => onChange({ operationType: event.target.value })}
          className={pillSelectClass}
        >
          <option value="">{t("Pages.AdminAuditLog.filters.all")}</option>
          {OPERATION_TYPE_OPTIONS.map((operationType) => (
            <option key={operationType} value={operationType}>
              {operationType}
            </option>
          ))}
        </select>
      </AuditLogFilterPill>

      <AuditLogFilterPill label={t("Pages.AdminAuditLog.filters.actor")}>
        <input
          data-testid="actor-input"
          type="text"
          value={filters.actor}
          onChange={(event) => onChange({ actor: event.target.value })}
          className={pillInputClass}
          placeholder={t("Pages.AdminAuditLog.filters.actorPlaceholder")}
        />
      </AuditLogFilterPill>

      <AuditLogFilterPill label={t("Pages.AdminAuditLog.filters.dateRange")}>
        <RangePicker
          data-testid="date-range-picker"
          className="w-full"
          value={[
            filters.dateFrom ? dayjs(filters.dateFrom) : null,
            filters.dateTo ? dayjs(filters.dateTo) : null,
          ]}
          onChange={(values) => {
            onChange({
              dateFrom: values?.[0]
                ? values[0].startOf("day").toISOString()
                : "",
              dateTo: values?.[1] ? values[1].endOf("day").toISOString() : "",
            });
          }}
        />
      </AuditLogFilterPill>
    </div>
  );
}
