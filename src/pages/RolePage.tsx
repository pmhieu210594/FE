import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";

import { CButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CDrawerForm } from "@/components/ui/drawer";
import { CSearch } from "@/components/ui/search";
import {
  CServerTable,
  type IServerTableColumn,
} from "@/components/ui/server-table";
import { CSvgIcon } from "@/components/ui/svg-icon";
import { CTooltip } from "@/components/ui/tooltip";
import { EFormRuleType, EFormType, EIcon, ETableAlign } from "@/enums";
import type { IForm } from "@/interfaces";
import { useAuth } from "@/hooks/useAuth";
import {
  ApiError,
  endpoints,
  type CreateRoleRequest,
  type RoleDto,
  type RoleStatus,
  type UpdateRoleRequest,
} from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

type DrawerMode = "add" | "edit" | "view";
type RoleStatusFilter = "ACTIVE" | "DELETED" | "ALL";

type RoleFormState = {
  roleName: string;
  description: string;
};

const defaultFormState: RoleFormState = {
  roleName: "",
  description: "",
};

const statusBadgeClass: Record<RoleStatus, string> = {
  ACTIVE: "border-transparent bg-blue-600 text-white",
  DELETED: "border-transparent bg-red-600 text-white",
};

function normalizeForm(values: RoleFormState): RoleFormState {
  return {
    roleName: values.roleName.trim(),
    description: values.description.trim(),
  };
}

function buildFormColumns(
  mode: DrawerMode,
  t: (key: string, props?: any) => string,
): IForm[] {
  const isViewMode = mode === "view";

  return [
    {
      name: "roleName",
      title: t("Pages.RoleManagement.Form.Name"),
      formItem: {
        col: 12,
        maxLength: 100,
        disabled: () => isViewMode,
        rules: [
          {
            type: EFormRuleType.required,
          },
          {
            type: EFormRuleType.max,
            value: 100,
          },
          {
            type: EFormRuleType.noXss,
          },
        ],
      },
    },
    {
      name: "description",
      title: t("Pages.RoleManagement.Form.Description"),
      formItem: {
        type: EFormType.textarea,
        col: 12,
        disabled: () => isViewMode,
        rules: [{ type: EFormRuleType.noXss }],
      },
    },
  ];
}

function buildFilterColumns(t: (key: string, props?: any) => string): IForm[] {
  return [
    {
      name: "status",
      title: t("Pages.RoleManagement.status"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        list: [
          {
            value: "ACTIVE",
            label: t("Pages.RoleManagement.statusValues.ACTIVE"),
          },
          {
            value: "DELETED",
            label: t("Pages.RoleManagement.statusValues.DELETED"),
          },
          { value: "ALL", label: t("Pages.RoleManagement.all") },
        ],
      },
    },
  ];
}

function RoleDrawer({
  mode,
  open,
  detail,
  initialValue,
  loading,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: DrawerMode;
  open: boolean;
  detail: RoleDto | null;
  initialValue: RoleFormState;
  loading: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: RoleFormState) => void;
}) {
  const { t } = useTranslation("locale");

  const columns = useMemo(() => buildFormColumns(mode, t), [mode, t]);

  return (
    <CDrawerForm
      open={open}
      width={640}
      title={
        mode === "add"
          ? t("Pages.RoleManagement.Form.CreateTitle")
          : mode === "edit"
            ? t("Pages.RoleManagement.Form.EditTitle")
            : t("Pages.RoleManagement.detailTitle")
      }
      columns={mode === "view" ? [] : columns}
      values={initialValue}
      isLoading={loading || submitting}
      showSubmit={mode !== "view"}
      textSubmit={t("Pages.RoleManagement.Form.Save")}
      textCancel={
        mode === "view"
          ? t("Pages.RoleManagement.Form.Close")
          : t("Pages.RoleManagement.Form.Cancel")
      }
      onClose={onClose}
      onSubmit={({ value }) => onSubmit(normalizeForm(value))}
    >
      {mode === "view" && open ? (
        <>
          {loading && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.RoleManagement.loading")}
            </div>
          )}
          {!loading && !detail && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.RoleManagement.empty")}
            </div>
          )}
          {!loading && detail && (
            <div className="grid gap-3 text-sm">
              <div className="rounded-md bg-muted/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("Pages.RoleManagement.table.name")}
                    </p>
                    <p className="font-medium">{detail.roleName}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusBadgeClass[detail.status as RoleStatus]}
                  >
                    {t(`Pages.RoleManagement.statusValues.${detail.status}`)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {detail.description || "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.RoleManagement.detail.createdAt")}
                  </p>
                  <p>{formatDateTime(detail.createdAt)}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.RoleManagement.detail.updatedAt")}
                  </p>
                  <p>{formatDateTime(detail.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </CDrawerForm>
  );
}

export function RolePage() {
  const { t } = useTranslation("locale");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<RoleStatusFilter>("ACTIVE");
  const [statusDraft, setStatusDraft] = useState<RoleStatusFilter>("ACTIVE");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<RoleDto | null>(null);
  const [drawerDraft, setDrawerDraft] =
    useState<RoleFormState>(defaultFormState);
  const lastErrorToastKeyRef = useRef<string | null>(null);

  const canCreateOrUpdate = user?.role === "ADMIN" || user?.role === "EDITOR";
  const canDelete = user?.role === "ADMIN";

  const filterColumns = useMemo(() => buildFilterColumns(t), [t]);

  const listQuery = useQuery({
    queryKey: ["roles", keyword, status],
    queryFn: () =>
      endpoints.roles.list({
        keyword: keyword || undefined,
        status,
      }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const selectedRoleQuery = useQuery({
    queryKey: ["role", selectedId],
    queryFn: () => endpoints.roles.get(selectedId!),
    enabled: !!selectedId,
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateRoleRequest) => endpoints.roles.create(body),
    onSuccess: async () => {
      message.success(t("Pages.RoleManagement.Message.Created"));
      closeDrawer();
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      roleId,
      body,
    }: {
      roleId: string;
      body: UpdateRoleRequest;
    }) => endpoints.roles.update(roleId, body),
    onSuccess: async () => {
      message.success(t("Pages.RoleManagement.Message.Updated"));
      closeDrawer();
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (roleId: string) => endpoints.roles.logicalDelete(roleId),
    onSuccess: async () => {
      message.success(t("Pages.RoleManagement.Message.Deleted"));
      if (selectedId) {
        closeDrawer();
      }
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const selectedFromList = useMemo(
    () => listQuery.data?.find((item) => item.roleId === selectedId) ?? null,
    [listQuery.data, selectedId],
  );

  const detail = selectedRoleQuery.data ?? selectedFromList ?? editingTarget;
  const pagedRoles = useMemo(() => {
    const roles = listQuery.data ?? [];
    const start = (page - 1) * perPage;
    return roles.slice(start, start + perPage);
  }, [listQuery.data, page, perPage]);

  const currentError =
    createMutation.error ??
    updateMutation.error ??
    deleteMutation.error ??
    listQuery.error ??
    selectedRoleQuery.error;

  useEffect(() => {
    if (!currentError) return;

    const toastMessage =
      currentError instanceof ApiError && currentError.status === 500
        ? t("Components.SomethingWentWrong", {
            defaultValue: "Something went wrong, please try again!",
          })
        : currentError instanceof Error
          ? currentError.message
          : t("Pages.RoleManagement.error");

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

  useEffect(() => {
    setPage(1);
  }, [keyword, status, perPage]);

  useEffect(() => {
    const total = listQuery.data?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [listQuery.data, page, perPage]);

  const openCreateForm = () => {
    setDrawerDraft(defaultFormState);
    setEditingTarget(null);
    setSelectedId(null);
    setDrawerMode("add");
  };

  const openViewDrawer = (role: RoleDto) => {
    setDrawerDraft({
      roleName: role.roleName,
      description: role.description ?? "",
    });
    setEditingTarget(null);
    setSelectedId(role.roleId);
    setDrawerMode("view");
  };

  const openEditDrawer = (role: RoleDto) => {
    setDrawerDraft({
      roleName: role.roleName,
      description: role.description ?? "",
    });
    setEditingTarget(role);
    setSelectedId(role.roleId);
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingTarget(null);
    setSelectedId(null);
    setDrawerDraft(defaultFormState);
  };

  const submitDrawer = (values: RoleFormState) => {
    if (!values.roleName) {
      message.error(t("Pages.RoleManagement.RoleName.Required"));
      return;
    }

    if (drawerMode === "add") {
      createMutation.mutate(values);
      return;
    }

    if (drawerMode === "edit" && editingTarget) {
      updateMutation.mutate({
        roleId: editingTarget.roleId,
        body: values,
      });
    }
  };

  const roleTableColumns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "roleName",
        title: t("Pages.RoleManagement.table.name"),
        sortKey: "roleName",
      },
      {
        name: "description",
        title: t("Pages.RoleManagement.table.description"),
        tableItem: {
          render: (value: string) =>
            value || t("Pages.RoleManagement.emptyValue"),
        },
      },
      {
        name: "status",
        title: t("Pages.RoleManagement.status"),
        tableItem: {
          align: ETableAlign.center,
          render: (_value: string, role: RoleDto) => (
            <Badge
              variant="outline"
              className={statusBadgeClass[role.status as RoleStatus]}
            >
              {t(`Pages.RoleManagement.statusValues.${role.status}`)}
            </Badge>
          ),
        },
      },
      {
        name: "createdAt",
        title: t("Pages.RoleManagement.table.createdAt"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string) => formatDateTime(value),
        },
      },
      {
        name: "updatedAt",
        title: t("Pages.RoleManagement.table.updatedAt"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string) => formatDateTime(value),
        },
      },
    ],
    [t],
  );

  return (
    <div className="wrapper-grid">
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
                    {t("Pages.RoleManagement.title")}
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
              values={{ status: statusDraft }}
              showSubmit
              textSubmit={t("Components.Filter")}
              textCancel={t("Pages.RoleManagement.Form.Close")}
              onClose={() => {
                setStatusDraft(status);
                setFilterOpen(false);
              }}
              onSubmit={({ value }) => {
                const nextStatus = value.status as RoleStatusFilter;
                setStatus(nextStatus);
                setStatusDraft(nextStatus);
                setFilterOpen(false);
              }}
            />

            <div className="mt-4" />

            <div id="role-list-table">
              <CServerTable
                columns={roleTableColumns}
                data={pagedRoles}
                sort={{}}
                onSortChange={() => {}}
                isLoading={listQuery.isLoading}
                isPagination
                showSearch={false}
                pagination={{
                  total: listQuery.data?.length ?? 0,
                  page,
                  perPage,
                  onChange: ({
                    page: nextPage,
                    perPage: nextPerPage,
                  }: {
                    page: number;
                    perPage: number;
                  }) => {
                    setPage(nextPage);
                    setPerPage(nextPerPage);
                  },
                }}
                leftHeader={
                  <div className="flex items-center gap-3">
                    <CSearch
                      value={keyword}
                      onTableChange={(value) => {
                        setKeyword((value ?? "").trim());
                      }}
                    />
                    <CButton
                      text={t("Components.Filter")}
                      className="h-11 min-w-[110px] whitespace-nowrap px-6 text-base !bg-primary text-primary-foreground"
                      onClick={() => {
                        setStatusDraft(status);
                        setFilterOpen(true);
                      }}
                    />
                  </div>
                }
                action={{
                  width: 160,
                  fixed: "left",
                  label: t("Components.Action"),
                  labelAdd: canCreateOrUpdate
                    ? t("Pages.RoleManagement.create")
                    : undefined,
                  onAdd: canCreateOrUpdate ? () => openCreateForm() : undefined,
                  name: (row: RoleDto) => row.roleName,
                  render: (role: RoleDto) => (
                    <div className="flex items-center gap-2">
                      <CTooltip title={t("Pages.RoleManagement.detailTitle")}>
                        <button
                          type="button"
                          title={t("Pages.RoleManagement.detailTitle")}
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewDrawer(role);
                          }}
                        >
                          <CSvgIcon name={EIcon.eye} className="primary" />
                        </button>
                      </CTooltip>

                      {canCreateOrUpdate && (
                        <CTooltip title={t("Pages.RoleManagement.edit")}>
                          <button
                            type="button"
                            title={t("Pages.RoleManagement.edit")}
                            disabled={role.status === "DELETED"}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDrawer(role);
                            }}
                            className={
                              role.status === "DELETED"
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }
                          >
                            <CSvgIcon name={EIcon.edit} className="primary" />
                          </button>
                        </CTooltip>
                      )}

                      {canDelete && (
                        <CTooltip title={t("Pages.RoleManagement.delete")}>
                          <Popconfirm
                            destroyOnHidden={true}
                            title={t("Pages.RoleManagement.DeleteConfirm", {
                              roleName: role.roleName,
                            })}
                            onConfirm={() => deleteMutation.mutate(role.roleId)}
                            disabled={role.status === "DELETED"}
                          >
                            <button
                              type="button"
                              title={t("Pages.RoleManagement.delete")}
                              disabled={
                                role.status === "DELETED" ||
                                deleteMutation.isPending
                              }
                              className={
                                role.status === "DELETED" ||
                                deleteMutation.isPending
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }
                            >
                              <CSvgIcon name={EIcon.trash} className="error" />
                            </button>
                          </Popconfirm>
                        </CTooltip>
                      )}
                    </div>
                  ),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <RoleDrawer
        mode={drawerMode ?? "view"}
        open={drawerMode !== null}
        detail={detail}
        initialValue={drawerDraft}
        loading={selectedRoleQuery.isLoading}
        submitting={createMutation.isPending || updateMutation.isPending}
        onClose={closeDrawer}
        onSubmit={submitDrawer}
      />
    </div>
  );
}
