import { Drawer } from "antd";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogDetail } from "../types";

type AuditLogDetailDrawerProps = Readonly<{
  detail: AuditLogDetail | null;
  isLoading?: boolean;
  onClose: () => void;
}>;

function parseJson(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function DiffPanel({
  title,
  value,
}: Readonly<{ title: string; value: string | null }>) {
  const parsed = parseJson(value);
  return (
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        {parsed ? JSON.stringify(parsed, null, 2) : "-"}
      </pre>
    </div>
  );
}

export function AuditLogDetailDrawer({
  detail,
  isLoading = false,
  onClose,
}: AuditLogDetailDrawerProps) {
  const { t } = useTranslation("locale");
  const hasContent = Boolean(detail) || isLoading;

  return (
    <Drawer
      open={hasContent}
      onClose={onClose}
      size={720}
      title={t("Pages.AdminAuditLog.detail.title")}
      destroyOnHidden
    >
      {isLoading || !detail ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          {t("Pages.AdminAuditLog.detail.loading")}
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-base">
                  {[detail.module].filter(Boolean).join(" / ")}
                </CardTitle>
                <Badge variant="outline">{detail.operationType ?? "-"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("Pages.AdminAuditLog.detail.actor")}
                </p>
                <p className="mt-1">
                  {detail.actorUsername ?? "-"}
                  {detail.actorRoleName ? ` (${detail.actorRoleName})` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("Pages.AdminAuditLog.detail.time")}
                </p>
                <p className="mt-1">{formatDateTime(detail.occurredAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("Pages.AdminAuditLog.detail.changedFields")}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {detail.changedFields ? (
                    detail.changedFields
                      .split(",")
                      .map((field) => field.trim())
                      .filter(Boolean)
                      .map((field) => (
                        <Badge
                          key={field}
                          variant="secondary"
                          className="rounded-md border-slate-200 bg-slate-100 font-medium text-slate-800 hover:bg-slate-100"
                        >
                          {field}
                        </Badge>
                      ))
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("Pages.AdminAuditLog.detail.traceId")}
                </p>
                <p className="mt-1 font-mono text-xs">
                  {detail.traceId ?? "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {detail.errorMessage ? (
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-800">
                  {t("Pages.AdminAuditLog.detail.errorMessage")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap break-words text-sm text-amber-900">
                  {detail.errorMessage}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("Pages.AdminAuditLog.detail.diffTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <DiffPanel
                  title={t("Pages.AdminAuditLog.detail.before")}
                  value={detail.beforeValue}
                />
                <DiffPanel
                  title={t("Pages.AdminAuditLog.detail.after")}
                  value={detail.afterValue}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Drawer>
  );
}
