import { useQuery } from "@tanstack/react-query";

import { endpoints } from "@/lib/api";
import { getDashboardRouteForRole } from "@/components/dashboard/dashboardRoutes";

type DashboardProjectOption = {
  value: string;
  label: string;
  role?: string | null;
};

/**
 * Resolves the single dashboard a non-admin user has access to, based on the
 * project role held on their first accessible project. Any dashboard's
 * `/options` endpoint returns the same cross-dashboard project+role list, so
 * `devDashboard.options` here is just the shared lookup, not DEV-specific.
 */
export function useDashboardHome() {
  const optionsQuery = useQuery({
    queryKey: ["dashboard-home", "projects"],
    queryFn: () => endpoints.devDashboard.options({}),
  });

  const projects: DashboardProjectOption[] = optionsQuery.data?.projects ?? [];
  const firstProject = projects[0];
  const route = firstProject
    ? getDashboardRouteForRole(firstProject.role)
    : undefined;

  return {
    isLoading: optionsQuery.isLoading,
    firstProject,
    route,
  };
}
