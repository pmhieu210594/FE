import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { message, Popconfirm } from "antd";

import { CButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CDrawerForm } from "@/components/ui/drawer";
import { CSearch } from "@/components/ui/search";
import { CSvgIcon } from "@/components/ui/svg-icon";
import {
  CServerTable,
  type IServerTableColumn,
} from "@/components/ui/server-table";
import { CTooltip } from "@/components/ui/tooltip";
import { EFormRuleType, EFormType, EIcon, ETableAlign } from "@/enums";
import type { IForm } from "@/interfaces";
import {
  endpoints,
  ApiError,
  type CreateOrganizationRequest,
  type Organization,
  type OrganizationStatus,
  type UpdateOrganizationRequest,
} from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

type DrawerMode = "add" | "edit" | "view";
type OrganizationStatusFilter = "ACTIVE" | "DELETED" | "ALL";

type OrganizationFormState = {
  organizationCode: string;
  organizationName: string;
  description: string;
  status: OrganizationStatus;
};

const defaultFormState: OrganizationFormState = {
  organizationCode: "",
  organizationName: "",
  description: "",
  status: "ACTIVE",
};

const statusBadgeClass: Record<OrganizationStatus, string> = {
  ACTIVE: "border-transparent bg-blue-600 text-white",
  DELETED: "border-transparent bg-red-600 text-white",
};

function normalizeForm(values: OrganizationFormState): OrganizationFormState {
  return {
    organizationCode: values.organizationCode.trim(),
    organizationName: values.organizationName.trim(),
    description: values.description.trim(),
    status: values.status,
  };
}

function buildFormColumns(
  mode: DrawerMode,
  t: (key: string, props?: any) => string,
): IForm[] {
  const isViewMode = mode === "view";

  const columns: IForm[] = [
    {
      name: "organizationCode",
      title: t("Pages.Organization.Form.Code"),
      formItem: {
        col: 6,
        maxLength: 50,
        disabled: () => isViewMode,
        rules: [
          {
            type: EFormRuleType.required,
          },
          {
            type: EFormRuleType.max,
            value: 50,
          },
          {
            type: EFormRuleType.noXss,
          },
        ],
      },
    },
    {
      name: "organizationName",
      title: t("Pages.Organization.Form.Name"),
      formItem: {
        col: 6,
        maxLength: 255,
        disabled: () => isViewMode,
        rules: [
          {
            type: EFormRuleType.required,
          },
          {
            type: EFormRuleType.max,
            value: 255,
          },
          {
            type: EFormRuleType.noXss,
          },
        ],
      },
    },
  ];

  columns.push({
    name: "description",
    title: t("Pages.Organization.Form.Description"),
    formItem: {
      type: EFormType.textarea,
      col: 12,
      maxLength: 500,
      disabled: () => isViewMode,
      rules: [
        {
          type: EFormRuleType.max,
          value: 500,
        },
        {
          type: EFormRuleType.noXss,
        },
      ],
    },
  });

  return columns;
}

function buildFilterColumns(t: (key: string, props?: any) => string): IForm[] {
  return [
    {
      name: "status",
      title: t("Pages.Organization.status"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        list: [
          { value: "ACTIVE", label: t("Pages.Organization.Filter.Active") },
          { value: "DELETED", label: t("Pages.Organization.Filter.Deleted") },
          { value: "ALL", label: t("Pages.Organization.Filter.All") },
        ],
      },
    },
  ];
}

function OrganizationDrawer({
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
  detail: Organization | null | undefined;
  initialValue: OrganizationFormState;
  loading: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: OrganizationFormState) => void;
}) {
  const { t } = useTranslation("locale");

  const columns = useMemo(() => buildFormColumns(mode, t), [mode, t]);

  return (
    <CDrawerForm
      open={open}
      width={640}
      title={
        mode === "add"
          ? t("Pages.Organization.Form.CreateTitle")
          : mode === "edit"
            ? t("Pages.Organization.Form.EditTitle")
            : t("Pages.Organization.detailTitle")
      }
      columns={mode === "view" ? [] : columns}
      values={initialValue}
      isLoading={loading || submitting}
      showSubmit={mode !== "view"}
      textSubmit={t("Pages.Organization.Form.Save")}
      textCancel={
        mode === "view"
          ? t("Pages.Organization.Form.Close")
          : t("Pages.Organization.Form.Cancel")
      }
      onClose={onClose}
      onSubmit={({ value }) => onSubmit(normalizeForm(value))}
    >
      {mode === "view" ? (
        <>
          {loading && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.Organization.loading")}
            </div>
          )}
          {!loading && !detail && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.Organization.detailEmpty")}
            </div>
          )}
          {!loading && detail && (
            <div className="grid gap-3 text-sm">
              <div className="rounded-md bg-muted/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("Pages.Organization.table.code")}
                    </p>
                    <p className="font-medium">{detail.organizationCode}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusBadgeClass[detail.status]}
                  >
                    {t(`Pages.Organization.Status.${detail.status}`)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {detail.organizationName}
                </p>
              </div>

              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.Organization.detail.description")}
                </p>
                <p>{detail.description || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Organization.detail.createdAt")}
                  </p>
                  <p>{formatDateTime(detail.createdAt)}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Organization.detail.createdBy")}
                  </p>
                  <p>{detail.createdBy}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Organization.detail.updatedAt")}
                  </p>
                  <p>{formatDateTime(detail.updatedAt)}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Organization.detail.updatedBy")}
                  </p>
                  <p>{detail.updatedBy}</p>
                </div>
              </div>

              {detail.deletedAt && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("Pages.Organization.detail.deletedAt")}
                    </p>
                    <p>{formatDateTime(detail.deletedAt)}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("Pages.Organization.detail.deletedBy")}
                    </p>
                    <p>{detail.deletedBy || "—"}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </CDrawerForm>
  );
}

export function OrganizationPage() {
  const { t } = useTranslation("locale");
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<OrganizationStatusFilter>("ACTIVE");
  const [statusDraft, setStatusDraft] =
    useState<OrganizationStatusFilter>("ACTIVE");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);

  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<Organization | null>(null);
  const [drawerDraft, setDrawerDraft] =
    useState<OrganizationFormState>(defaultFormState);
  // flashMessage removed; success toasts are shown via Ant Design message
  const lastErrorToastKeyRef = useRef<string | null>(null);

  const filterColumns = useMemo(() => buildFilterColumns(t), [t]);

  const listQuery = useQuery({
    queryKey: ["organizations", keyword, status, page, size],
    queryFn: () =>
      endpoints.organizations.list({
        keyword: keyword || undefined,
        status,
        page,
        size,
      }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const selectedOrganization = useQuery({
    queryKey: ["organization", selectedId],
    queryFn: () => endpoints.organizations.get(selectedId!),
    enabled: !!selectedId,
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateOrganizationRequest) =>
      endpoints.organizations.create(body),
    onSuccess: async (created) => {
      message.success("OK");
      setDrawerMode(null);
      setEditingTarget(null);
      setSelectedId(created.organizationId);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({
        queryKey: ["organization", created.organizationId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      organizationId,
      body,
    }: {
      organizationId: string;
      body: UpdateOrganizationRequest;
    }) => endpoints.organizations.update(organizationId, body),
    onSuccess: async (updated) => {
      message.success("OK");
      setDrawerMode(null);
      setEditingTarget(null);
      setSelectedId(updated.organizationId);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({
        queryKey: ["organization", updated.organizationId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      organizationId,
      version,
    }: {
      organizationId: string;
      version: number;
    }) => endpoints.organizations.softDelete(organizationId, { version }),
    onSuccess: async (deleted) => {
      message.success("OK");
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({
        queryKey: ["organization", deleted.organizationId],
      });
    },
  });

  const selectedFromList = useMemo(
    () =>
      listQuery.data?.items.find(
        (item) => item.organizationId === selectedId,
      ) ?? null,
    [listQuery.data?.items, selectedId],
  );

  const detail = selectedOrganization.data ?? selectedFromList ?? editingTarget;

  const openCreateForm = () => {
    setDrawerDraft(defaultFormState);
    setEditingTarget(null);
    setSelectedId(null);
    setDrawerMode("add");
  };

  const openViewDrawer = (organization: Organization) => {
    setDrawerDraft({
      organizationCode: organization.organizationCode,
      organizationName: organization.organizationName,
      description: organization.description ?? "",
      status: organization.status,
    });
    setEditingTarget(null);
    setSelectedId(organization.organizationId);
    setDrawerMode("view");
  };

  const openEditDrawer = (organization: Organization) => {
    setDrawerDraft({
      organizationCode: organization.organizationCode,
      organizationName: organization.organizationName,
      description: organization.description ?? "",
      status: organization.status,
    });
    setEditingTarget(organization);
    setSelectedId(organization.organizationId);
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingTarget(null);
    setSelectedId(null);
    setDrawerDraft(defaultFormState);
  };

  const submitDrawer = (values: OrganizationFormState) => {
    if (drawerMode === "add") {
      createMutation.mutate({
        organizationCode: values.organizationCode,
        organizationName: values.organizationName,
        description: values.description || null,
      });
      return;
    }

    if (drawerMode === "edit" && editingTarget) {
      updateMutation.mutate({
        organizationId: editingTarget.organizationId,
        body: {
          organizationCode: values.organizationCode,
          organizationName: values.organizationName,
          description: values.description || null,
          status: values.status,
          version: editingTarget.version,
        },
      });
    }
  };

  const handleDelete = (organization: Organization) => {
    deleteMutation.mutate({
      organizationId: organization.organizationId,
      version: organization.version,
    });
  };

  const organizationTableColumns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "organizationCode",
        title: t("Pages.Organization.table.code"),
        sortKey: "organizationCode",
      },
      {
        name: "organizationName",
        title: t("Pages.Organization.table.name"),
        sortKey: "organizationName",
      },
      {
        name: "status",
        title: t("Pages.Organization.table.status"),
        sortKey: "status",
        tableItem: {
          align: ETableAlign.center,
          render: (_value: string, organization: Organization) => (
            <Badge
              variant="outline"
              className={statusBadgeClass[organization.status]}
            >
              {t(`Pages.Organization.Status.${organization.status}`)}
            </Badge>
          ),
        },
      },
      {
        name: "updatedAt",
        title: t("Pages.Organization.table.updatedAt"),
        sortKey: "updatedAt",
        tableItem: {
          align: ETableAlign.center,
          render: (value: string) => formatDateTime(value),
        },
      },
    ],
    [t],
  );

  const currentError =
    createMutation.error ??
    updateMutation.error ??
    deleteMutation.error ??
    listQuery.error ??
    selectedOrganization.error;

  useEffect(() => {
    if (!currentError) return;

    const toastMessage =
      currentError instanceof ApiError && currentError.status === 500
        ? t("Components.SomethingWentWrong", {
            defaultValue: "Something went wrong, please try again!",
          })
        : currentError instanceof Error
          ? currentError.message
          : t("Pages.Organization.error");

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
                    {t("Pages.Organization.title")}
                  </h1>
                </div>
              </div>
            </div>

            <hr className="my-4 border-border/70" />

            <CDrawerForm
              open={statusFilterOpen}
              width={350}
              title={t("Components.Filter")}
              columns={filterColumns}
              values={{ status: statusDraft }}
              showSubmit
              textSubmit={t("Components.Filter")}
              textCancel={t("Pages.Organization.Form.Close")}
              onClose={() => {
                setStatusDraft(status);
                setStatusFilterOpen(false);
              }}
              onSubmit={({ value }) => {
                const nextStatus = value.status as OrganizationStatusFilter;
                setStatus(nextStatus);
                setStatusDraft(nextStatus);
                setPage(0);
                setStatusFilterOpen(false);
              }}
            />

            <div className="mt-4" />

            <div id="organization-list-table">
              <CServerTable
                columns={organizationTableColumns}
                data={listQuery.data?.items ?? []}
                sort={{}}
                onSortChange={() => {}}
                isLoading={listQuery.isLoading}
                isPagination
                showSearch={false}
                pagination={{
                  total: listQuery.data?.totalElements ?? 0,
                  page: page + 1,
                  perPage: size,
                  onChange: ({
                    page: nextPage,
                    perPage,
                  }: {
                    page: number;
                    perPage: number;
                  }) => {
                    setPage(nextPage - 1);
                    setSize(perPage);
                  },
                }}
                leftHeader={
                  <div className="flex items-center gap-3">
                    <CSearch
                      value={keyword}
                      onTableChange={(value) => {
                        setKeyword((value ?? "").trim());
                        setPage(0);
                      }}
                    />
                    <CButton
                      text={t("Components.Filter")}
                      className="h-11 min-w-[110px] whitespace-nowrap px-6 text-base !bg-primary text-primary-foreground"
                      onClick={() => {
                        setStatusDraft(status);
                        setStatusFilterOpen(true);
                      }}
                    />
                  </div>
                }
                action={{
                  width: 160,
                  fixed: "left",
                  label: t("Components.Action"),
                  labelAdd: t("Pages.Organization.create"),
                  onAdd: () => openCreateForm(),
                  name: (row: Organization) => row.organizationCode,
                  render: (organization: Organization) => (
                    <div className="flex items-center gap-2">
                      <CTooltip title={t("Pages.Organization.detailTitle")}>
                        <button
                          type="button"
                          title={t("Pages.Organization.detailTitle")}
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewDrawer(organization);
                          }}
                        >
                          <CSvgIcon name={EIcon.eye} className="primary" />
                        </button>
                      </CTooltip>

                      <CTooltip title={t("Pages.Organization.edit")}>
                        <button
                          type="button"
                          title={t("Pages.Organization.edit")}
                          disabled={organization.status === "DELETED"}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDrawer(organization);
                          }}
                          className={
                            organization.status === "DELETED"
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }
                        >
                          <CSvgIcon name={EIcon.edit} className="primary" />
                        </button>
                      </CTooltip>

                      <CTooltip title={t("Pages.Organization.delete")}>
                        <Popconfirm
                          destroyOnHidden={true}
                          title={t("Pages.Organization.DeleteConfirm")}
                          onConfirm={() => handleDelete(organization)}
                          disabled={organization.status === "DELETED"}
                        >
                          <button
                            type="button"
                            title={t("Pages.Organization.delete")}
                            disabled={
                              organization.status === "DELETED" ||
                              deleteMutation.isPending
                            }
                            className={
                              organization.status === "DELETED" ||
                              deleteMutation.isPending
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }
                          >
                            <CSvgIcon name={EIcon.trash} className="error" />
                          </button>
                        </Popconfirm>
                      </CTooltip>
                    </div>
                  ),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* flashMessage removed; success toasts shown via Ant Design message */}

      <OrganizationDrawer
        mode={drawerMode ?? "view"}
        open={drawerMode !== null}
        detail={detail}
        initialValue={drawerDraft}
        loading={selectedOrganization.isLoading}
        submitting={createMutation.isPending || updateMutation.isPending}
        onClose={closeDrawer}
        onSubmit={submitDrawer}
      />
    </div>
  );
}
