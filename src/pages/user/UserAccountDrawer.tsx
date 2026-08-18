import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { CDrawerForm } from "@/components/ui/drawer";
import type { RoleOption, UserAccount } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { buildAccountFormColumns } from "./form-config";
import {
  normalizeAccountForm,
  statusBadgeClass,
  toStatus,
  type AccountFormState,
  type DrawerMode,
} from "./types";

export function UserAccountDrawer({
  mode,
  open,
  detail,
  roles,
  values,
  loading,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: DrawerMode;
  open: boolean;
  detail: UserAccount | null | undefined;
  roles: RoleOption[];
  values: AccountFormState;
  loading: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: AccountFormState) => void;
}) {
  const { t } = useTranslation("locale");
  const columns = useMemo(
    () => buildAccountFormColumns(mode, roles, t),
    [mode, roles, t],
  );
  const drawerTitle =
    mode === "add"
      ? t("Pages.UserAccounts.form.createTitle")
      : mode === "edit"
        ? t("Pages.UserAccounts.form.editTitle")
        : t("Pages.UserAccounts.form.detailTitle");

  return (
    <CDrawerForm
      open={open}
      width={720}
      title={drawerTitle}
      columns={mode === "view" ? [] : columns}
      values={values}
      isLoading={loading || submitting}
      showSubmit={mode !== "view"}
      textSubmit={
        mode === "add"
          ? t("Pages.UserAccounts.form.create")
          : t("Pages.UserAccounts.form.save")
      }
      textCancel={
        mode === "view"
          ? t("Pages.UserAccounts.form.close")
          : t("Pages.UserAccounts.form.cancel")
      }
      onClose={onClose}
      onSubmit={({ value }) => onSubmit(normalizeAccountForm(value))}
    >
      {mode === "view" ? (
        <>
          {loading && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.UserAccounts.loading")}
            </div>
          )}
          {!loading && !detail && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.UserAccounts.empty.detail")}
            </div>
          )}
          {!loading && detail && (
            <div className="grid gap-3 text-sm">
              <div className="rounded-md bg-muted/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("Pages.UserAccounts.fields.username")}
                    </p>
                    <p className="font-medium">{detail.username}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detail.fullname ||
                        t("Pages.UserAccounts.empty.unmapped")}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusBadgeClass[toStatus(detail)]}
                  >
                    {t(`Pages.UserAccounts.status.${toStatus(detail)}`)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Info
                  label={t("Pages.UserAccounts.fields.email")}
                  value={detail.email || "-"}
                />
                <Info
                  label={t("Pages.UserAccounts.fields.role")}
                  value={detail.roleName || "-"}
                />
                <Info
                  label={t("Pages.UserAccounts.fields.createdAt")}
                  value={formatDateTime(detail.createdAt)}
                />
                <Info
                  label={t("Pages.UserAccounts.fields.updatedAt")}
                  value={formatDateTime(detail.updatedAt)}
                />
              </div>

              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.UserAccounts.security.title")}
                </p>
                <p>{t("Pages.UserAccounts.security.description")}</p>
              </div>
            </div>
          )}
        </>
      ) : null}
    </CDrawerForm>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words">{value}</p>
    </div>
  );
}
