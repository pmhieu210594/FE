export type DashboardRouteRole = "PM" | "QA" | "DEV" | "SECURITY" | "DATA_OPS";

const DASHBOARD_ROUTES: Record<DashboardRouteRole, string> = {
  PM: "pm-dashboard",
  QA: "qa-dashboard",
  DEV: "development-dashboard",
  SECURITY: "security-dashboard",
  DATA_OPS: "data-ops-dashboard",
};

export function normalizeDashboardRole(role: string | null | undefined) {
  return (role ?? "").trim().toUpperCase().replace(/\s+/g, "_");
}

export function getDashboardRouteForRole(role: string | null | undefined) {
  const normalized = normalizeDashboardRole(role) as DashboardRouteRole;
  return DASHBOARD_ROUTES[normalized];
}
