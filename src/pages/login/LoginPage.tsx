import { useMemo, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ApiError,
  endpoints,
  setAccessToken,
  type AuthLoginRequest,
} from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { KEY_REFRESH_TOKEN } from "@/utils/variable";

function normalizeLoginErrorKey(messageKey: string) {
  if (!messageKey) return "INVALID_CREDENTIALS";
  if (messageKey.startsWith("auth.")) {
    return messageKey.slice("auth.".length).replaceAll(".", "_").toUpperCase();
  }
  return messageKey;
}

function normalizeRole(role: string | null | undefined) {
  return role?.trim().toUpperCase() ?? "";
}

export function LoginPage() {
  const { t } = useTranslation("locale");
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { lang } = useParams();
  const [form, setForm] = useState<AuthLoginRequest>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: () => endpoints.authLogin(form),
    onSuccess: (response) => {
      setAccessToken(response.accessToken);
      localStorage.setItem(KEY_REFRESH_TOKEN, response.refreshToken);
      queryClient.removeQueries({ queryKey: ["dashboard-home"] });
      queryClient.removeQueries({ queryKey: ["dashboard-access"] });
      queryClient.setQueryData(["me"], response.user);
      const redirectPath =
        normalizeRole(response.user.role) === "ADMIN"
          ? "/pm-dashboard"
          : "/dashboard";
      navigate(`/${lang ?? "en"}${redirectPath}`, { replace: true });
    },
  });

  const errorMessage = useMemo(() => {
    if (!loginMutation.error) return null;
    if (
      loginMutation.error instanceof ApiError &&
      (loginMutation.error.status === 401 || loginMutation.error.status === 403)
    ) {
      const messageKey = normalizeLoginErrorKey(
        loginMutation.error.messageKey ?? "INVALID_CREDENTIALS",
      );
      return t(`Pages.Errors.${messageKey}`, {
        defaultValue: loginMutation.error.message,
      });
    }
    return t("Pages.Login.loginFailed");
  }, [loginMutation.error, t]);

  if (isLoading) return null;
  if (isAuthenticated) {
    const role = normalizeRole(user?.role);
    const redirectPath = role === "ADMIN" ? "/pm-dashboard" : "/dashboard";

    return <Navigate to={`/${lang ?? "en"}${redirectPath}`} replace />;
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.92),_rgba(2,6,23,0.98)_60%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="flex flex-col justify-center space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-cyan-200/80">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              {t("Pages.Login.brandLabel")}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {t("Pages.Login.title")}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                {t("Pages.Login.description")}
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="font-medium text-slate-100">
                  {t("Pages.Login.secureAccessTitle")}
                </p>
                <p className="mt-1">{t("Pages.Login.secureAccessBody")}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="font-medium text-slate-100">
                  {t("Pages.Login.temporaryLandingTitle")}
                </p>
                <p className="mt-1">{t("Pages.Login.temporaryLandingBody")}</p>
              </div>
            </div>
          </section>

          <Card className="border-white/10 bg-white/95 text-slate-950 shadow-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">
                {t("Pages.Login.formTitle")}
              </CardTitle>
              <CardDescription>
                {t("Pages.Login.formDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submit}>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    {t("Pages.Login.username")}
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-slate-400">
                    <UserRound className="h-4 w-4 text-slate-400" />
                    <input
                      autoComplete="username"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder={t("Pages.Login.usernamePlaceholder")}
                      value={form.username}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          username: e.target.value,
                        }))
                      }
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    {t("Pages.Login.password")}
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-slate-400">
                    <LockKeyhole className="h-4 w-4 text-slate-400" />
                    <input
                      autoComplete="current-password"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder={t("Pages.Login.passwordPlaceholder")}
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          password: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword
                          ? t("Pages.Login.hidePassword")
                          : t("Pages.Login.showPassword")
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>

                {errorMessage && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errorMessage}
                  </p>
                )}

                <Button
                  className="h-11 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                  type="submit"
                  disabled={
                    loginMutation.isPending || !form.username || !form.password
                  }
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loginMutation.isPending
                    ? t("Pages.Login.signingIn")
                    : t("Pages.Login.signIn")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
