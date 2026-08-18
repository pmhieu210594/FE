import type { ReactNode } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { ApiError, endpoints } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ForceLogoutAndRedirect } from "@/components/auth/ForceLogoutAndRedirect";

export type DashboardAccessKey = "pm" | "qa" | "dev" | "dataOps" | "security";

// endpoints.*.access() resolves to `undefined` (204 No Content) — TanStack
// Query treats a queryFn resolving to undefined as invalid and the query
// never reaches a "success" state, so map it to a real value.
// When projectId is given, the backend checks the caller's role *at that
// project specifically* — holding the role on a different project is not
// enough. Without projectId it falls back to "does the caller hold this
// role on any project" (used before a project is selected).
const ACCESS_QUERY_BY_KEY: Record<
  DashboardAccessKey,
  (projectId?: string) => Promise<boolean>
> = {
  pm: (projectId) =>
    endpoints.pmDashboard.access({ projectId }).then(() => true),
  qa: (projectId) =>
    endpoints.qaDashboard.access({ projectId }).then(() => true),
  dev: (projectId) =>
    endpoints.devDashboard.access({ projectId }).then(() => true),
  dataOps: (projectId) =>
    endpoints.dataOpsDashboard.access({ projectId }).then(() => true),
  security: (projectId) =>
    endpoints.securityDashboard.access({ projectId }).then(() => true),
};

export function RequireDashboardAccess({
  dashboardKey,
  children,
}: {
  readonly dashboardKey: DashboardAccessKey;
  readonly children: ReactNode;
}) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { lang } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") ?? undefined;

  const accessQuery = useQuery({
    queryKey: ["dashboard-access", dashboardKey, projectId],
    queryFn: () => ACCESS_QUERY_BY_KEY[dashboardKey](projectId),
    enabled: isAuthenticated,
    retry: false,
  });

  if (isAuthLoading || (isAuthenticated && accessQuery.isLoading)) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${lang ?? "en"}/login`} replace />;
  }

  if (accessQuery.isError) {
    const error = accessQuery.error;
    // 401/403 both mean "not allowed to be here" — force a real logout so
    // isAuthenticated flips to false. Otherwise LoginPage sees an still-
    // authenticated user and bounces them straight back to this same
    // dashboard, causing an infinite redirect loop against /access.
    if (
      error instanceof ApiError &&
      (error.status === 403 || error.status === 401)
    ) {
      return <ForceLogoutAndRedirect />;
    }
    // Transient/network/server error — show a retry state instead of
    // redirecting, since redirecting while still authenticated loops forever.
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <p>Unable to verify dashboard access. Please try again.</p>
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          onClick={() => accessQuery.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
