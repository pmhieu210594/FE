import type { ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CustomerPage } from "@/pages/CustomerPage";
import { DashboardLandingPage } from "@/pages/DashboardLandingPage";
import { OrganizationPage } from "@/pages/OrganizationPage";
import { PMDashboardPage } from "@/pages/pm-dashboard/PMDashboardPage";
import { QADashboardPage } from "@/pages/qa-dashboard/QADashboardPage";
import { DevelopmentDashboardPage } from "@/pages/development-dashboard/DevelopmentDashboardPage";
import { DataOpsDashboardPage } from "@/pages/data-ops-dashboard/DataOpsDashboardPage";
import { SecurityDashboardPage } from "@/pages/security-dashboard/SecurityDashboardPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { RepositoryPage } from "@/pages/RepositoryPage";
import { TeamPage } from "@/pages/TeamPage";
import { RolePage } from "@/pages/RolePage";
import { TraceabilityPage } from "@/pages/traceability/TraceabilityPage";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { ForceLogoutAndRedirect } from "@/components/auth/ForceLogoutAndRedirect";
import { RequireDashboardAccess } from "@/components/auth/RequireDashboardAccess";
import { LoginPage } from "@/pages/login/LoginPage";
import { UserAccountsPage } from "@/pages/user/UserAccountsPage";
import { AuditLogPage } from "@/pages/admin-audit-log/AuditLogPage";
import { ThresholdConfigPage } from "@/pages/threshold-config/ThresholdConfigPage";

const supportedLanguages = new Set(["en", "vi", "ja"]);

function getLanguageFromPathname(pathname: string) {
  const lang = pathname.split("/").filter(Boolean)[0] ?? "";
  return supportedLanguages.has(lang) ? lang : "";
}

function normalizeRole(role: string | null | undefined) {
  return role?.trim().toUpperCase() ?? "";
}

function RequireAdmin({ children }: { readonly children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { lang } = useParams();
  const role = normalizeRole(user?.role);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to={`/${lang ?? "en"}/login`} replace />;
  }
  if (role !== "ADMIN") {
    return <ForceLogoutAndRedirect />;
  }
  return <>{children}</>;
}

function RequireAuthenticated({ children }: { readonly children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { lang } = useParams();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to={`/${lang ?? "en"}/login`} replace />;
  }
  return <>{children}</>;
}

function RequireRoleViewer({ children }: { readonly children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { lang } = useParams();
  const role = normalizeRole(user?.role);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to={`/${lang ?? "en"}/login`} replace />;
  }
  if (
    role !== "ADMIN" &&
    role !== "EDITOR" &&
    role !== "VIEWER" &&
    role !== "PM"
  ) {
    return <ForceLogoutAndRedirect />;
  }
  return <>{children}</>;
}

function HomeGate() {
  const { lang } = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const role = normalizeRole(user?.role);

  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to={`/${lang ?? "en"}/login`} replace />;
  }
  if (role === "ADMIN") {
    return <Navigate to={`/${lang ?? "en"}/pm-dashboard`} replace />;
  }
  return <DashboardLandingPage />;
}

function DefaultLanguageRedirect() {
  const storedLang = localStorage.getItem("i18nextLng");
  const lang = supportedLanguages.has(storedLang ?? "") ? storedLang : "en";

  return <Navigate to={`/${lang}/`} replace />;
}

export default function App() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const lang = getLanguageFromPathname(location.pathname);

  useEffect(() => {
    if (!lang || lang === i18n.language) {
      return;
    }

    localStorage.setItem("i18nextLng", lang);
    document.documentElement.setAttribute("lang", lang);
    void i18n.changeLanguage(lang);
  }, [i18n, lang]);

  return (
    <Routes>
      <Route path=":lang/login" element={<LoginPage />} />
      <Route path=":lang" element={<Layout />}>
        <Route index element={<HomeGate />} />
        <Route
          path="dashboard"
          element={
            <RequireAuthenticated>
              <DashboardLandingPage />
            </RequireAuthenticated>
          }
        />
        <Route
          path="admin"
          element={
            <Navigate to={`/${lang ?? "en"}/admin/user-accounts`} replace />
          }
        />
        <Route
          path="organizations"
          element={
            <RequireAdmin>
              <OrganizationPage />
            </RequireAdmin>
          }
        />
        <Route
          path="projects"
          element={
            <RequireAdmin>
              <ProjectPage />
            </RequireAdmin>
          }
        />
        <Route
          path="repositories"
          element={
            <RequireAdmin>
              <RepositoryPage />
            </RequireAdmin>
          }
        />
        <Route
          path="customers"
          element={
            <RequireAdmin>
              <CustomerPage />
            </RequireAdmin>
          }
        />
        <Route
          path="admin/user-accounts"
          element={
            <RequireAdmin>
              <UserAccountsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="admin/audit-logs"
          element={
            <RequireAdmin>
              <AuditLogPage />
            </RequireAdmin>
          }
        />
        <Route
          path="admin/score-thresholds"
          element={
            <RequireAdmin>
              <ThresholdConfigPage />
            </RequireAdmin>
          }
        />
        <Route
          path="teams"
          element={
            <RequireAdmin>
              <TeamPage />
            </RequireAdmin>
          }
        />
        <Route
          path="roles"
          element={
            <RequireRoleViewer>
              <RolePage />
            </RequireRoleViewer>
          }
        />
        <Route
          path="traceability"
          element={
            <RequireRoleViewer>
              <TraceabilityPage />
            </RequireRoleViewer>
          }
        />
        <Route
          path="pm-dashboard"
          element={
            <RequireDashboardAccess dashboardKey="pm">
              <PMDashboardPage />
            </RequireDashboardAccess>
          }
        />
        <Route
          path="qa-dashboard"
          element={
            <RequireDashboardAccess dashboardKey="qa">
              <QADashboardPage />
            </RequireDashboardAccess>
          }
        />
        <Route
          path="development-dashboard"
          element={
            <RequireDashboardAccess dashboardKey="dev">
              <DevelopmentDashboardPage />
            </RequireDashboardAccess>
          }
        />
        <Route
          path="data-ops-dashboard"
          element={
            <RequireDashboardAccess dashboardKey="dataOps">
              <DataOpsDashboardPage />
            </RequireDashboardAccess>
          }
        />
        <Route
          path="security-dashboard"
          element={
            <RequireDashboardAccess dashboardKey="security">
              <SecurityDashboardPage />
            </RequireDashboardAccess>
          }
        />
      </Route>
      <Route path="*" element={<DefaultLanguageRedirect />} />
    </Routes>
  );
}
