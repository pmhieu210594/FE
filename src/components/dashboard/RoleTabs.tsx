import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export type DashboardRoleView =
  | "pm"
  | "qa"
  | "development"
  | "security"
  | "executive"
  | "data-ops";

/**
 * Route each role tab points to. Roles without a dashboard yet (no entry
 * here) render as a tab the user can see, but it's inert — placeholder for
 * a screen that hasn't been built.
 */
const ROLE_TAB_ROUTES: Partial<Record<DashboardRoleView, string>> = {
  pm: "pm-dashboard",
  qa: "qa-dashboard",
  development: "development-dashboard",
  security: "security-dashboard",
  "data-ops": "data-ops-dashboard",
};

const ROLE_TABS: Array<{ value: DashboardRoleView; labelKey: string }> = [
  { value: "pm", labelKey: "Pages.Dashboard.roleTabs.pm" },
  { value: "qa", labelKey: "Pages.Dashboard.roleTabs.qa" },
  { value: "development", labelKey: "Pages.Dashboard.roleTabs.development" },
  { value: "security", labelKey: "Pages.Dashboard.roleTabs.security" },
  { value: "data-ops", labelKey: "Pages.Dashboard.roleTabs.dataOps" },
];

type RoleTabsProps = {
  active: DashboardRoleView;
  onReset?: () => void;
};

/**
 * Role-based view switcher shared by every "Chapter 9" dashboard
 * (PM / QA / Development / Security / Executive / Data Ops). Tabs with a
 * built dashboard navigate to the real route; the rest are inert
 * placeholders until their page exists.
 */
export function RoleTabs({ active, onReset }: RoleTabsProps) {
  const { t } = useTranslation("locale");
  const navigate = useNavigate();
  const { lang } = useParams();
  const { user } = useAuth();

  const handleSelect = (role: DashboardRoleView) => {
    const route = ROLE_TAB_ROUTES[role];
    if (!route || role === active) return;
    navigate(`/${lang ?? "en"}/${route}`);
  };

  // The tab switcher lets you jump between every role dashboard (PM / QA /
  // Development / Security / Data Ops). That is only meaningful for a
  // system-level ADMIN, who is allowed to view all of them. Non-admin users
  // only ever have one dashboard relevant to them (their role on the
  // selected project), so the switcher is hidden for them entirely.
  const isSystemAdmin = (user?.role ?? "").trim().toUpperCase() === "ADMIN";
  if (!isSystemAdmin) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        {ROLE_TABS.map((tab) => {
          const isActive = tab.value === active;
          const isBuilt = Boolean(ROLE_TAB_ROUTES[tab.value]);
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleSelect(tab.value)}
              disabled={!isBuilt && !isActive}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                !isBuilt &&
                  !isActive &&
                  "cursor-not-allowed opacity-50 hover:bg-white",
              )}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
        >
          {t("Pages.Dashboard.reset")}
        </button>
      ) : null}
    </div>
  );
}
