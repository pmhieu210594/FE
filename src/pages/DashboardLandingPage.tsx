import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useDashboardHome } from "@/hooks/useDashboardHome";

export function DashboardLandingPage() {
  const { t } = useTranslation("locale");
  const { lang } = useParams();
  const navigate = useNavigate();

  const { isLoading, firstProject, route } = useDashboardHome();

  useEffect(() => {
    if (!firstProject || !route) return;
    navigate(`/${lang ?? "en"}/${route}?projectId=${firstProject.value}`, {
      replace: true,
    });
  }, [lang, navigate, firstProject, route]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/90 p-8 shadow-xl">
          {t("Pages.Home.loading", { defaultValue: "Loading dashboard..." })}
        </div>
      </div>
    );
  }

  if (!firstProject) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/90 p-8 shadow-xl">
          {t("Pages.Home.body", {
            defaultValue:
              "You do not have access to any project dashboards yet.",
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl items-center">
      <div className="w-full rounded-3xl border border-white/10 bg-white/90 p-8 shadow-xl">
        {t("Pages.Home.loading", { defaultValue: "Opening your dashboard..." })}
      </div>
    </div>
  );
}
