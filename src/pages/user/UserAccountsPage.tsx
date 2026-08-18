import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { message } from "antd";

import { CDrawerForm } from "@/components/ui/drawer";
import {
  ApiError,
  endpoints,
  type CreateUserAccountRequest,
  type UpdateUserAccountRequest,
  type UserAccount,
} from "@/lib/api";
import { buildFilterColumns, buildResetColumns } from "./form-config";
import { UserAccountDrawer } from "./UserAccountDrawer";
import { UserAccountsTable } from "./UserAccountsTable";
import {
  defaultAccountForm,
  defaultResetForm,
  toStatus,
  validatePassword,
  type AccountFormState,
  type DrawerMode,
  type ResetFormState,
  type StatusFilter,
} from "./types";
import "./UserAccountsPage.css";

export function UserAccountsPage() {
  const { t } = useTranslation("locale");
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [statusDraft, setStatusDraft] = useState<StatusFilter>("ALL");
  const [roleDraft, setRoleDraft] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);

  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [editingTarget, setEditingTarget] = useState<UserAccount | null>(null);
  const [drawerDraft, setDrawerDraft] =
    useState<AccountFormState>(defaultAccountForm);
  const [resetTarget, setResetTarget] = useState<UserAccount | null>(null);
  const [resetDraft, setResetDraft] =
    useState<ResetFormState>(defaultResetForm);

  const lastErrorToastKeyRef = useRef<string | null>(null);

  const rolesQuery = useQuery({
    queryKey: ["user-account-roles"],
    queryFn: endpoints.userAccounts.roles,
  });

  const roles = rolesQuery.data ?? [];
  const filterColumns = useMemo(() => buildFilterColumns(roles, t), [roles, t]);
  const resetColumns = useMemo(() => buildResetColumns(t), [t]);

  const listQuery = useQuery({
    queryKey: ["user-accounts", keyword, status, roleIds, page, size],
    queryFn: () =>
      endpoints.userAccounts.list({
        keyword: keyword || undefined,
        status,
        roleIds: roleIds.length ? roleIds : undefined,
        page,
        size,
      }),
  });

  const selectedAccount = useQuery({
    queryKey: ["user-account", selectedAccountId],
    queryFn: () => endpoints.userAccounts.get(selectedAccountId!),
    enabled: !!selectedAccountId,
  });

  const selectedFromList = useMemo(
    () =>
      listQuery.data?.items.find(
        (item) => item.accountId === selectedAccountId,
      ) ?? null,
    [listQuery.data?.items, selectedAccountId],
  );

  const detail = selectedAccount.data ?? selectedFromList ?? editingTarget;

  const invalidateAccounts = async (accountId?: string) => {
    await queryClient.invalidateQueries({ queryKey: ["user-accounts"] });
    if (accountId) {
      await queryClient.invalidateQueries({
        queryKey: ["user-account", accountId],
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: (body: CreateUserAccountRequest) =>
      endpoints.userAccounts.create(body),
    onSuccess: async (created) => {
      message.success(t("Components.OK"));
      setDrawerMode(null);
      setSelectedAccountId(created.accountId);
      await invalidateAccounts(created.accountId);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      accountId,
      body,
    }: {
      accountId: string;
      body: UpdateUserAccountRequest;
    }) => endpoints.userAccounts.update(accountId, body),
    onSuccess: async (updated) => {
      message.success(t("Components.OK"));
      setDrawerMode(null);
      setEditingTarget(null);
      setSelectedAccountId(updated.accountId);
      await invalidateAccounts(updated.accountId);
    },
  });

  const activateMutation = useMutation({
    mutationFn: endpoints.userAccounts.activate,
    onSuccess: async (updated) => {
      message.success(t("Components.OK"));
      await invalidateAccounts(updated.accountId);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: endpoints.userAccounts.deactivate,
    onSuccess: async (updated) => {
      message.success(t("Components.OK"));
      await invalidateAccounts(updated.accountId);
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({
      accountId,
      body,
    }: {
      accountId: string;
      body: ResetFormState;
    }) => endpoints.userAccounts.resetPassword(accountId, body),
    onSuccess: async (updated) => {
      message.success(t("Components.OK"));
      setResetTarget(null);
      setResetDraft(defaultResetForm);
      await invalidateAccounts(updated.accountId);
    },
  });

  const openCreateForm = () => {
    setDrawerDraft(defaultAccountForm);
    setEditingTarget(null);
    setSelectedAccountId(null);
    setDrawerMode("add");
  };

  const openViewDrawer = (account: UserAccount) => {
    setDrawerDraft(toFormState(account));
    setEditingTarget(null);
    setSelectedAccountId(account.accountId);
    setDrawerMode("view");
  };

  const openEditDrawer = (account: UserAccount) => {
    setDrawerDraft(toFormState(account));
    setEditingTarget(account);
    setSelectedAccountId(account.accountId);
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingTarget(null);
    setSelectedAccountId(null);
    setDrawerDraft(defaultAccountForm);
  };

  const submitDrawer = (values: AccountFormState) => {
    if (!values.roleId) {
      message.error(t("Pages.UserAccounts.validation.roleRequired"));
      return;
    }

    if (drawerMode === "add") {
      if (!values.username) {
        message.error(t("Pages.UserAccounts.validation.usernameRequired"));
        return;
      }
      const passwordError = validatePassword(
        values.password,
        values.confirmPassword,
        t,
      );
      if (passwordError) {
        message.error(passwordError);
        return;
      }
      createMutation.mutate({
        username: values.username,
        fullname: values.fullname || values.username,
        email: values.email || null,
        password: values.password,
        confirmPassword: values.confirmPassword,
        roleId: values.roleId,
        isActive: values.status === "ACTIVE",
      });
      return;
    }

    if (drawerMode === "edit" && editingTarget) {
      updateMutation.mutate({
        accountId: editingTarget.accountId,
        body: {
          fullname: values.fullname || values.username,
          email: values.email || null,
          roleId: values.roleId,
          isActive: values.status === "ACTIVE",
        },
      });
    }
  };

  const submitReset = (values: ResetFormState) => {
    if (!resetTarget) return;
    const passwordError = validatePassword(
      values.password,
      values.confirmPassword,
      t,
    );
    if (passwordError) {
      message.error(passwordError);
      return;
    }
    resetMutation.mutate({
      accountId: resetTarget.accountId,
      body: values,
    });
  };

  const openFilter = () => {
    setStatusDraft(status);
    setRoleDraft(roleIds);
    setFilterOpen(true);
  };

  const currentError =
    createMutation.error ??
    updateMutation.error ??
    activateMutation.error ??
    deactivateMutation.error ??
    resetMutation.error ??
    listQuery.error ??
    rolesQuery.error ??
    selectedAccount.error;

  useEffect(() => {
    if (!currentError) return;

    const toastMessage =
      currentError instanceof ApiError && currentError.status === 500
        ? t("Components.SomethingWentWrong")
        : currentError instanceof Error
          ? currentError.message
          : t("Components.SomethingWentWrong");

    const toastKey =
      currentError instanceof ApiError
        ? `${currentError.status}:${toastMessage}`
        : toastMessage;

    if (lastErrorToastKeyRef.current === toastKey) return;
    lastErrorToastKeyRef.current = toastKey;
    message.error(toastMessage);
  }, [currentError, t]);

  useEffect(() => {
    if (!currentError) {
      lastErrorToastKeyRef.current = null;
    }
  }, [currentError]);

  return (
    <div className="wrapper-grid user-accounts-page">
      <div className="intro-x right">
        <div className="card overflow-hidden">
          <div className="body">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="space-y-1">
                  <h1
                    className="text-lg font-semibold"
                    style={{ fontSize: "18px" }}
                  >
                    {t("Pages.UserAccounts.title")}
                  </h1>
                </div>
              </div>
            </div>

            <hr className="my-4 border-border/70" />

            <CDrawerForm
              open={filterOpen}
              width={350}
              title={t("Components.Filter")}
              columns={filterColumns}
              values={{ status: statusDraft, roleId: roleDraft }}
              showSubmit
              textSubmit={t("Components.Filter")}
              textCancel={t("Pages.UserAccounts.form.close")}
              onClose={() => {
                setStatusDraft(status);
                setRoleDraft(roleIds);
                setFilterOpen(false);
              }}
              onSubmit={({ value }) => {
                setStatus(value.status as StatusFilter);
                setRoleIds(Array.isArray(value.roleId) ? value.roleId : []);
                setStatusDraft(value.status as StatusFilter);
                setRoleDraft(Array.isArray(value.roleId) ? value.roleId : []);
                setPage(0);
                setFilterOpen(false);
              }}
            />

            <CDrawerForm
              open={resetTarget !== null}
              width={420}
              title={t("Pages.UserAccounts.form.resetTitle")}
              columns={resetColumns}
              values={resetDraft}
              isLoading={resetMutation.isPending}
              showSubmit
              textSubmit={t("Pages.UserAccounts.actions.resetPassword")}
              textCancel={t("Pages.UserAccounts.form.cancel")}
              onClose={() => {
                setResetTarget(null);
                setResetDraft(defaultResetForm);
              }}
              onSubmit={({ value }) => submitReset(value)}
            />

            <div className="mt-4" />

            <UserAccountsTable
              data={listQuery.data?.items ?? []}
              isLoading={listQuery.isLoading}
              keyword={keyword}
              actionsPending={
                activateMutation.isPending || deactivateMutation.isPending
              }
              setKeyword={(value) => {
                setKeyword(value);
                setPage(0);
              }}
              total={listQuery.data?.totalElements ?? 0}
              page={page + 1}
              perPage={size}
              paginationDescription={(
                from: number,
                to: number,
                total: number,
              ) =>
                t("Pages.UserAccounts.paginationDescription", {
                  from,
                  to,
                  total,
                })
              }
              onPageChange={(params) => {
                setPage(params.page - 1);
                setSize(params.perPage);
              }}
              openFilter={openFilter}
              openCreate={openCreateForm}
              openView={openViewDrawer}
              openEdit={openEditDrawer}
              openReset={(account) => {
                setResetTarget(account);
                setResetDraft(defaultResetForm);
              }}
              activate={activateMutation.mutate}
              deactivate={deactivateMutation.mutate}
            />
          </div>
        </div>
      </div>

      <UserAccountDrawer
        mode={drawerMode ?? "view"}
        open={drawerMode !== null}
        detail={detail}
        roles={roles}
        values={drawerDraft}
        loading={selectedAccount.isLoading}
        submitting={createMutation.isPending || updateMutation.isPending}
        onClose={closeDrawer}
        onSubmit={submitDrawer}
      />
    </div>
  );
}

function toFormState(account: UserAccount): AccountFormState {
  return {
    username: account.username,
    fullname: account.fullname,
    email: account.email ?? "",
    roleId: account.roleId,
    status: toStatus(account),
    password: "",
    confirmPassword: "",
  };
}
