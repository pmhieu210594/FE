import { useMemo } from "react";
import { Popconfirm } from "antd";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { CButton } from "@/components/ui/button";
import { CSearch } from "@/components/ui/search";
import {
  CServerTable,
  type IServerTableColumn,
} from "@/components/ui/server-table";
import { CSvgIcon } from "@/components/ui/svg-icon";
import { CTooltip } from "@/components/ui/tooltip";
import { EIcon, ETableAlign } from "@/enums";
import type { UserAccount } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { statusBadgeClass, toStatus } from "./types";

export function UserAccountsTable({
  data,
  isLoading,
  keyword,
  actionsPending,
  setKeyword,
  total,
  page,
  perPage,
  paginationDescription,
  onPageChange,
  openFilter,
  openCreate,
  openView,
  openEdit,
  openReset,
  activate,
  deactivate,
}: {
  data: UserAccount[];
  isLoading: boolean;
  keyword: string;
  actionsPending: boolean;
  setKeyword: (value: string) => void;
  total: number;
  page: number;
  perPage: number;
  paginationDescription: (from: number, to: number, total: number) => string;
  onPageChange: (params: { page: number; perPage: number }) => void;
  openFilter: () => void;
  openCreate: () => void;
  openView: (account: UserAccount) => void;
  openEdit: (account: UserAccount) => void;
  openReset: (account: UserAccount) => void;
  activate: (accountId: string) => void;
  deactivate: (accountId: string) => void;
}) {
  const { t } = useTranslation("locale");
  const accountTableColumns = useMemo<IServerTableColumn[]>(
    () => [
      {
        width: 200,
        name: "username",
        title: t("Pages.UserAccounts.table.username"),
        sortKey: "username",
      },
      {
        width: 200,
        name: "fullname",
        title: t("Pages.UserAccounts.table.member"),
        sortKey: "fullname",
        tableItem: {
          render: (value: string) =>
            value || t("Pages.UserAccounts.empty.unmapped"),
        },
      },
      {
        width: 100,
        name: "roleName",
        title: t("Pages.UserAccounts.table.role"),
        sortKey: "roleName",
        tableItem: {
          align: ETableAlign.center,
          render: (value: string) => <Badge variant="outline">{value}</Badge>,
        },
      },
      {
        width: 100,
        name: "isActive",
        title: t("Pages.UserAccounts.table.status"),
        sortKey: "isActive",
        tableItem: {
          align: ETableAlign.center,
          render: (_value: boolean, account: UserAccount) => (
            <Badge
              variant="outline"
              className={statusBadgeClass[toStatus(account)]}
            >
              {t(
                account.isActive
                  ? "Pages.UserAccounts.status.ACTIVE"
                  : "Pages.UserAccounts.status.INACTIVE",
              )}
            </Badge>
          ),
        },
      },
      {
        name: "updatedAt",
        title: t("Pages.UserAccounts.table.updatedAt"),
        sortKey: "updatedAt",
        tableItem: {
          align: ETableAlign.center,
          render: (value: string) => formatDateTime(value),
        },
      },
    ],
    [t],
  );

  return (
    <div id="user-account-list-table">
      <CServerTable
        columns={accountTableColumns}
        data={data}
        sort={{}}
        onSortChange={() => {}}
        isLoading={isLoading}
        isPagination
        pagination={{
          total,
          page,
          perPage,
          onChange: onPageChange,
        }}
        paginationDescription={paginationDescription}
        showSearch={false}
        leftHeader={
          <div className="flex items-center gap-3">
            <CSearch
              value={keyword}
              onTableChange={(value) => setKeyword((value ?? "").trim())}
            />
            <CButton
              text={t("Components.Filter")}
              className="h-11 min-w-[110px] whitespace-nowrap px-6 text-base !bg-primary text-primary-foreground"
              onClick={openFilter}
            />
          </div>
        }
        action={{
          width: 190,
          fixed: "left",
          label: t("Components.Action"),
          labelAdd: t("Pages.UserAccounts.actions.create"),
          onAdd: openCreate,
          name: (row: UserAccount) => row.username,
          render: (account: UserAccount) => (
            <div className="flex items-center gap-2">
              <CTooltip title={t("Pages.UserAccounts.actions.view")}>
                <button
                  type="button"
                  title={t("Pages.UserAccounts.actions.view")}
                  onClick={(e) => {
                    e.stopPropagation();
                    openView(account);
                  }}
                >
                  <CSvgIcon name={EIcon.eye} className="primary" />
                </button>
              </CTooltip>

              <CTooltip title={t("Pages.UserAccounts.actions.edit")}>
                <button
                  type="button"
                  title={t("Pages.UserAccounts.actions.edit")}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(account);
                  }}
                >
                  <CSvgIcon name={EIcon.edit} className="primary" />
                </button>
              </CTooltip>

              <CTooltip title={t("Pages.UserAccounts.actions.resetPassword")}>
                <button
                  type="button"
                  title={t("Pages.UserAccounts.actions.resetPassword")}
                  onClick={(e) => {
                    e.stopPropagation();
                    openReset(account);
                  }}
                >
                  <CSvgIcon name={EIcon.key} className="primary" />
                </button>
              </CTooltip>

              <CTooltip
                title={t(
                  account.isActive
                    ? "Pages.UserAccounts.actions.deactivate"
                    : "Pages.UserAccounts.actions.reactivate",
                )}
              >
                <Popconfirm
                  destroyOnHidden
                  title={
                    account.isActive
                      ? t("Pages.UserAccounts.confirm.deactivate")
                      : t("Pages.UserAccounts.confirm.reactivate")
                  }
                  onConfirm={() =>
                    account.isActive
                      ? deactivate(account.accountId)
                      : activate(account.accountId)
                  }
                >
                  <button
                    type="button"
                    title={t(
                      account.isActive
                        ? "Pages.UserAccounts.actions.deactivate"
                        : "Pages.UserAccounts.actions.reactivate",
                    )}
                    disabled={actionsPending}
                    className={
                      actionsPending ? "cursor-not-allowed opacity-50" : ""
                    }
                  >
                    <CSvgIcon
                      name={account.isActive ? EIcon.disable : EIcon.check}
                      className={account.isActive ? "error" : "primary"}
                    />
                  </button>
                </Popconfirm>
              </CTooltip>
            </div>
          ),
        }}
      />
    </div>
  );
}
