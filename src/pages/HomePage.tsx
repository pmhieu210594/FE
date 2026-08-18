import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logout, useAuth } from "@/hooks/useAuth";

export function HomePage() {
  const { t } = useTranslation("locale");
  const { user } = useAuth();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl items-center">
      <Card className="w-full border-white/10 bg-white/90 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{t("Pages.Home.title")}</CardTitle>
          <CardDescription>{t("Pages.Home.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("Pages.Home.welcome", {
              name: user?.displayName ?? user?.username,
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("Pages.Home.body")}
          </p>
          <Button variant="outline" onClick={() => void logout()}>
            {t("Layout.logout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
