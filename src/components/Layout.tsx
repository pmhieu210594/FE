import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";
import { useEffect, useRef, type ComponentType } from "react";
import {
  Building2,
  FolderKanban,
  FolderGit2,
  ShieldCheck,
  UsersRound,
  Settings,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  UserRoundSearch,
  History,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth, logout } from "@/hooks/useAuth";
import { useDashboardHome } from "@/hooks/useDashboardHome";
import { useLanguage } from "@/hooks/useLanguage";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
  end: boolean;
  adminOnly?: boolean;
  pmOnly?: boolean;
  qaOnly?: boolean;
  devOnly?: boolean;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  {
    to: "system-admin",
    labelKey: "Layout.systemAdmin",
    icon: Settings,
    end: false,
    adminOnly: true,
    children: [
      {
        to: "roles",
        labelKey: "Layout.roles",
        icon: ShieldCheck,
        end: false,
        adminOnly: true,
      },
      {
        to: "organizations",
        labelKey: "Layout.organization",
        icon: Building2,
        end: false,
        adminOnly: true,
      },
      {
        to: "projects",
        labelKey: "Layout.projects",
        icon: FolderKanban,
        end: false,
        adminOnly: true,
      },
      {
        to: "repositories",
        labelKey: "Layout.repositories",
        icon: FolderGit2,
        end: false,
        adminOnly: true,
      },
      {
        to: "customers",
        labelKey: "Layout.customers",
        icon: Users,
        end: false,
        adminOnly: true,
      },
      {
        to: "teams",
        labelKey: "Layout.teams",
        icon: UsersRound,
        end: false,
        adminOnly: true,
      },
      {
        to: "admin/user-accounts",
        labelKey: "Layout.userAccounts",
        icon: UserRoundSearch,
        end: false,
        adminOnly: true,
      },
      {
        to: "admin/audit-logs",
        labelKey: "Layout.auditLogs",
        icon: History,
        end: false,
        adminOnly: true,
      },
      {
        to: "admin/score-thresholds",
        labelKey: "Layout.scoreThresholds",
        icon: SlidersHorizontal,
        end: false,
        adminOnly: true,
      },
    ],
  },
];

export function Layout() {
  const { t } = useTranslation("locale");
  const { user } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { lang } = useParams();
  const location = useLocation();
  const mainRef = useRef<HTMLElement | null>(null);
  const role = user?.role?.trim().toUpperCase() ?? "";
  const isAdmin = role === "ADMIN";
  const isPm = role === "PM";
  const isQa = role === "QA";
  const isDev = role === "DEV";
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { route: dashboardHomeRoute } = useDashboardHome();

  const dashboardTo = isAdmin
    ? "pm-dashboard"
    : (dashboardHomeRoute ?? "dashboard");
  const isDashboardUser = !!role;
  const isDashboardActive =
    location.pathname.includes("/pm-dashboard") ||
    location.pathname.includes("/qa-dashboard") ||
    location.pathname.includes("/development-dashboard") ||
    location.pathname.includes("/data-ops-dashboard") ||
    location.pathname.includes("/dashboard");

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  return (
    <div className="flex h-screen min-h-0">
      <aside
        className={cn(
          "border-r bg-card flex flex-col transition-[width] duration-200",
          sidebarCollapsed ? "w-14" : "w-60",
        )}
      >
        <div className="p-4 border-b flex items-center justify-between gap-2">
          {!sidebarCollapsed && (
            <Link
              to={`/${lang ?? currentLanguage}/${
                isAdmin ? "admin" : "dashboard"
              }`}
              className="font-semibold text-lg truncate"
            >
              {t("Layout.appName")}
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            title={
              sidebarCollapsed
                ? t("Layout.openSidebar")
                : t("Layout.closeSidebar")
            }
            aria-label={
              sidebarCollapsed
                ? t("Layout.openSidebar")
                : t("Layout.closeSidebar")
            }
            className="shrink-0 text-slate-500 hover:text-blue-700"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {isDashboardUser && (
            <NavLink
              to={`/${lang ?? currentLanguage}/${dashboardTo}`}
              title={sidebarCollapsed ? t("Layout.dashboard") : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                sidebarCollapsed && "justify-center px-2",
                isDashboardActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-blue-700",
              )}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && t("Layout.dashboard")}
            </NavLink>
          )}
          {navItems
            .filter(
              (item) =>
                (!item.adminOnly || isAdmin) &&
                (!item.pmOnly || isPm || isAdmin) &&
                (!item.qaOnly || isQa || isAdmin) &&
                (!item.devOnly || isDev || isAdmin),
            )
            .map((item) => (
              <div key={item.to}>
                {item.children ? (
                  <button
                    title={sidebarCollapsed ? t(item.labelKey) : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors w-full",
                      sidebarCollapsed && "justify-center px-2",
                      "text-slate-500 hover:bg-slate-100 hover:text-blue-700",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && t(item.labelKey)}
                  </button>
                ) : (
                  <NavLink
                    to={`/${lang ?? currentLanguage}/${item.to}`}
                    end={item.end}
                    title={sidebarCollapsed ? t(item.labelKey) : undefined}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        sidebarCollapsed && "justify-center px-2",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-500 hover:bg-slate-100 hover:text-blue-700",
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && t(item.labelKey)}
                  </NavLink>
                )}

                {!sidebarCollapsed && item.children && (
                  <div className="ml-2 space-y-1 mt-1">
                    {item.children
                      .filter(
                        (child) =>
                          (!child.adminOnly || isAdmin) &&
                          (!child.pmOnly || isPm || isAdmin) &&
                          (!child.qaOnly || isQa || isAdmin) &&
                          (!child.devOnly || isDev || isAdmin),
                      )
                      .map((child) => (
                        <NavLink
                          key={child.to}
                          to={`/${lang ?? currentLanguage}/${child.to}`}
                          end={child.end}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-500 hover:bg-slate-100 hover:text-blue-700",
                            )
                          }
                        >
                          <child.icon className="h-4 w-4 shrink-0" />
                          {t(child.labelKey)}
                        </NavLink>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </nav>

        <div
          className={cn(
            "p-3 border-t flex items-center gap-2",
            sidebarCollapsed && "flex-col",
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {(user?.displayName ?? user?.email ?? t("Layout.guest"))
              .slice(0, 1)
              .toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                {user?.displayName ?? user?.email ?? t("Layout.guest")}
              </p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void logout()}
            title={t("Layout.logout")}
            className="text-slate-500 hover:text-blue-700"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      <main ref={mainRef} className="flex-1 min-h-0 overflow-auto bg-muted/30">
        <div className="border-b bg-background/80 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-end gap-4">
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="h-9 text-sm rounded-md border px-3 bg-background"
              title={t("Layout.language")}
            >
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
        <div key={location.pathname} className="min-h-full p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
