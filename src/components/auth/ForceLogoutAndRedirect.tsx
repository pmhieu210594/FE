import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { logout } from "@/hooks/useAuth";

export function ForceLogoutAndRedirect() {
  const { lang } = useParams();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    void Promise.resolve(logout()).finally(() => {
      setRedirected(true);
    });
  }, []);

  if (redirected) {
    return <Navigate to={`/${lang ?? "en"}/login`} replace />;
  }

  return (
    <div className="flex h-screen items-center justify-center text-muted-foreground">
      Redirecting...
    </div>
  );
}
