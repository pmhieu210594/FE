import { Download, Search } from "lucide-react";

type DashboardSearchHeaderProps = {
  search: string;
  searchPlaceholder: string;
  exportLabel: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isExporting?: boolean;
};

/**
 * Top utility bar shared by every "Chapter 9" dashboard: a single global
 * search field plus Export / Refresh actions.
 */
export function DashboardSearchHeader({
  search,
  searchPlaceholder,
  exportLabel,
  onSearchChange,
  onExport,
  isExporting = false,
}: DashboardSearchHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          placeholder={searchPlaceholder}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="mr-2 inline h-4 w-4" />
          {exportLabel}
        </button>
      </div>
    </div>
  );
}
