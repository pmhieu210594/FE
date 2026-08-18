import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

type DashboardHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

/**
 * Top utility bar of the dashboard: a single global search field.
 */
export function DashboardHeader({
  search,
  onSearchChange,
}: DashboardHeaderProps) {
  const { t } = useTranslation("locale");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          placeholder={t("Pages.PmDashboard.searchPlaceholder")}
        />
      </label>
    </div>
  );
}
