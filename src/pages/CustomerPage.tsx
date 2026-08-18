import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { message, Popconfirm } from "antd";
import type { AnyFormApi } from "@tanstack/react-form";

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
  ApiError,
  endpoints,
  type Customer,
  type CustomerClassification,
  type CustomerStatus,
  type Organization,
} from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

type DrawerMode = "add" | "edit" | "view";
type CustomerStatusFilter = "ACTIVE" | "DELETED" | "ALL";
type CustomerClassificationFilter = CustomerClassification | "ALL";

type CustomerFormState = {
  organizationId: string;
  customerCode: string;
  customerAlias: string;
  classification: CustomerClassification;
};

const defaultFormState: CustomerFormState = {
  organizationId: "",
  customerCode: "",
  customerAlias: "",
  classification: "INTERNAL",
};

const statusBadgeClass: Record<CustomerStatus, string> = {
  ACTIVE: "border-transparent bg-blue-600 text-white",
  DELETED: "border-transparent bg-red-600 text-white",
};

const classificationBadgeClass: Record<CustomerClassification, string> = {
  INTERNAL: "border-transparent bg-blue-600 text-white",
  EXTERNAL: "border-transparent bg-green-600 text-white",
};

function getCustomerStatusClass(status: string) {
  return statusBadgeClass[status as CustomerStatus];
}

function getCustomerClassificationClass(classification: string) {
  return classificationBadgeClass[classification as CustomerClassification];
}

function normalizeForm(values: CustomerFormState): CustomerFormState {
  return {
    organizationId: values.organizationId.trim(),
    customerCode: values.customerCode.trim(),
    customerAlias: values.customerAlias.trim(),
    classification: values.classification,
  };
}

function buildFormColumns(
  mode: DrawerMode,
  organizations: Organization[],
  t: (key: string, props?: Record<string, unknown>) => string,
): IForm[] {
  const isViewMode = mode === "view";

  return [
    {
      name: "organizationId",
      title: t("Pages.Customer.organization"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        placeholder: t("PleaseEnter"),
        allowClear: false,
        disabled: () => isViewMode,
        rules: [{ type: EFormRuleType.required }],
        list: organizations.map((organization) => ({
          value: organization.organizationId,
          label: organization.organizationName,
        })),
      },
    },
    {
      name: "customerCode",
      title: t("Pages.Customer.customerCode"),
      formItem: {
        col: 12,
        maxLength: 50,
        placeholder: t("PleaseEnter"),
        disabled: () => isViewMode,
        rules: [
          { type: EFormRuleType.required },
          { type: EFormRuleType.max, value: 50 },
          { type: EFormRuleType.noXss },
        ],
      },
    },
    {
      name: "customerAlias",
      title: t("Pages.Customer.customerAlias"),
      formItem: {
        col: 12,
        maxLength: 255,
        placeholder: t("PleaseEnter"),
        disabled: () => isViewMode,
        rules: [
          { type: EFormRuleType.required },
          { type: EFormRuleType.max, value: 255 },
          { type: EFormRuleType.noXss },
        ],
      },
    },
    {
      name: "classification",
      title: t("Pages.Customer.classification"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        disabled: () => isViewMode,
        rules: [{ type: EFormRuleType.required }],
        list: [
          {
            value: "INTERNAL",
            label: t("Pages.Customer.classificationValues.INTERNAL"),
          },
          {
            value: "EXTERNAL",
            label: t("Pages.Customer.classificationValues.EXTERNAL"),
          },
        ],
      },
    },
  ];
}

function buildFilterColumns(
  organizations: Organization[],
  t: (key: string, props?: Record<string, unknown>) => string,
): IForm[] {
  return [
    {
      name: "organizationId",
      title: t("Pages.Customer.organization"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        list: [
          { value: "", label: t("Pages.Customer.all") },
          ...organizations.map((organization) => ({
            value: organization.organizationId,
            label: organization.organizationName,
          })),
        ],
      },
    },
    {
      name: "classification",
      title: t("Pages.Customer.classification"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        list: [
          { value: "ALL", label: t("Pages.Customer.all") },
          {
            value: "INTERNAL",
            label: t("Pages.Customer.classificationValues.INTERNAL"),
          },
          {
            value: "EXTERNAL",
            label: t("Pages.Customer.classificationValues.EXTERNAL"),
          },
        ],
      },
    },
    {
      name: "status",
      title: t("Pages.Customer.status"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        list: [
          { value: "ACTIVE", label: t("Pages.Customer.statusValues.ACTIVE") },
          { value: "DELETED", label: t("Pages.Customer.statusValues.DELETED") },
          { value: "ALL", label: t("Pages.Customer.all") },
        ],
      },
    },
  ];
}

function CustomerDrawer({
  mode,
  open,
  detail,
  initialValue,
  loading,
  submitting,
  organizations,
  onClose,
  onSubmit,
}: {
  mode: DrawerMode;
  open: boolean;
  detail: Customer | null | undefined;
  initialValue: CustomerFormState;
  loading: boolean;
  submitting: boolean;
  organizations: Organization[];
  onClose: () => void;
  onSubmit: (values: CustomerFormState) => void;
}) {
  const { t } = useTranslation("locale");
  const columns = useMemo(
    () => buildFormColumns(mode, organizations, t),
    [mode, organizations, t],
  );

  return (
    <CDrawerForm
      open={open}
      width={640}
      title={
        mode === "add"
          ? t("Pages.Customer.createTitle")
          : mode === "edit"
            ? t("Pages.Customer.editTitle")
            : t("Pages.Customer.detailTitle")
      }
      columns={mode === "view" ? [] : columns}
      values={initialValue}
      isLoading={loading || submitting}
      showSubmit={mode !== "view"}
      textSubmit={t("Pages.Customer.save")}
      textCancel={t("Pages.Customer.cancel")}
      onClose={onClose}
      onSubmit={({
        value,
      }: {
        value: CustomerFormState;
        formApi: AnyFormApi;
      }) => onSubmit(normalizeForm(value))}
    >
      {mode === "view" ? (
        <>
          {loading && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.Customer.loading")}
            </div>
          )}
          {!loading && !detail && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.Customer.detailEmpty")}
            </div>
          )}
          {!loading && detail && (
            <div className="grid gap-3 text-sm">
              <div className="rounded-md bg-muted/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("Pages.Customer.customerCode")}
                    </p>
                    <p className="font-medium">{detail.customerCode}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={getCustomerStatusClass(detail.status)}
                  >
                    {t(`Pages.Customer.statusValues.${detail.status}`)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {detail.customerAlias}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Customer.classification")}
                  </p>
                  <p>
                    {t(
                      `Pages.Customer.classificationValues.${detail.classification}`,
                    )}
                  </p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Customer.organization")}
                  </p>
                  <p>{detail.organizationName}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Customer.createdAt")}
                  </p>
                  <p>{formatDateTime(detail.createdAt)}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Customer.createdBy")}
                  </p>
                  <p>{detail.createdBy}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Customer.updatedAt")}
                  </p>
                  <p>{formatDateTime(detail.updatedAt)}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Customer.updatedBy")}
                  </p>
                  <p>{detail.updatedBy}</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </CDrawerForm>
  );
}

export function CustomerPage() {
  const { t } = useTranslation("locale");
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<CustomerStatusFilter>("ACTIVE");
  const [classification, setClassification] =
    useState<CustomerClassificationFilter>("ALL");
  const [organizationId, setOrganizationId] = useState("");
  const [statusDraft, setStatusDraft] =
    useState<CustomerStatusFilter>("ACTIVE");
  const [classificationDraft, setClassificationDraft] =
    useState<CustomerClassificationFilter>("ALL");
  const [organizationDraft, setOrganizationDraft] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);

  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<Customer | null>(null);
  const [drawerDraft, setDrawerDraft] =
    useState<CustomerFormState>(defaultFormState);

  const organizationListQuery = useQuery({
    queryKey: ["customer-organizations"],
    queryFn: () =>
      endpoints.organizations.list({ status: "ACTIVE", page: 0, size: 100 }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const listQuery = useQuery({
    queryKey: [
      "customers",
      keyword,
      status,
      classification,
      organizationId,
      page,
      size,
    ],
    queryFn: () =>
      endpoints.customers.list({
        keyword: keyword || undefined,
        status,
        classification,
        organizationId: organizationId || undefined,
        page,
        pageSize: size,
      }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const selectedQuery = useQuery({
    queryKey: ["customer", selectedId],
    queryFn: () => endpoints.customers.get(selectedId!),
    enabled: !!selectedId,
  });

  const activeOrganizations: Organization[] =
    organizationListQuery.data?.items ?? [];

  const selectedFromList = useMemo(
    () =>
      listQuery.data?.items.find((item) => item.customerId === selectedId) ??
      null,
    [listQuery.data?.items, selectedId],
  );

  const detail = selectedQuery.data ?? selectedFromList ?? editingTarget;

  const createMutation = useMutation({
    mutationFn: (body: CustomerFormState) => endpoints.customers.create(body),
    onSuccess: async (created) => {
      message.success(t("Pages.Customer.createSuccess"));
      setDrawerMode(null);
      setEditingTarget(null);
      setSelectedId(created.customerId);
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await queryClient.invalidateQueries({
        queryKey: ["customer", created.customerId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["customer-organizations"],
      });
    },
    onError: (error: unknown) => {
      message.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("Pages.Customer.unknownError"),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      customerId,
      body,
    }: {
      customerId: string;
      body: CustomerFormState & { version: number };
    }) => endpoints.customers.update(customerId, body),
    onSuccess: async (updated) => {
      message.success(t("Pages.Customer.updateSuccess"));
      setDrawerMode(null);
      setEditingTarget(null);
      setSelectedId(updated.customerId);
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await queryClient.invalidateQueries({
        queryKey: ["customer", updated.customerId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["customer-organizations"],
      });
    },
    onError: (error: unknown) => {
      message.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("Pages.Customer.unknownError"),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      customerId,
      version,
    }: {
      customerId: string;
      version: number;
    }) => endpoints.customers.softDelete(customerId, { version }),
    onSuccess: async (deleted) => {
      message.success(t("Pages.Customer.deleteSuccess"));
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await queryClient.invalidateQueries({
        queryKey: ["customer", deleted.customerId],
      });
    },
    onError: (error: unknown) => {
      message.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("Pages.Customer.unknownError"),
      );
    },
  });

  const filterColumns = useMemo(
    () => buildFilterColumns(activeOrganizations, t),
    [activeOrganizations, t],
  );

  const customerTableColumns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "customerCode",
        title: t("Pages.Customer.customerCode"),
        sortKey: "customerCode",
      },
      {
        name: "customerAlias",
        title: t("Pages.Customer.customerAlias"),
        sortKey: "customerAlias",
      },
      {
        name: "organizationName",
        title: t("Pages.Customer.organization"),
        sortKey: "organizationName",
      },
      {
        name: "classification",
        title: t("Pages.Customer.classification"),
        sortKey: "classification",
        tableItem: {
          align: ETableAlign.center,
          render: (_value: string, customer: Customer) => (
            <Badge
              variant="outline"
              className={getCustomerClassificationClass(
                customer.classification,
              )}
            >
              {t(
                `Pages.Customer.classificationValues.${customer.classification}`,
              )}
            </Badge>
          ),
        },
      },
      {
        name: "status",
        title: t("Pages.Customer.status"),
        sortKey: "status",
        tableItem: {
          align: ETableAlign.center,
          render: (_value: string, customer: Customer) => (
            <Badge
              variant="outline"
              className={getCustomerStatusClass(customer.status)}
            >
              {t(`Pages.Customer.statusValues.${customer.status}`)}
            </Badge>
          ),
        },
      },
      {
        name: "updatedAt",
        title: t("Pages.Customer.updatedAt"),
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
    listQuery.error ?? selectedQuery.error ?? organizationListQuery.error;

  const openCreateForm = () => {
    setDrawerDraft(defaultFormState);
    setEditingTarget(null);
    setSelectedId(null);
    setDrawerMode("add");
  };

  const openViewDrawer = (customer: Customer) => {
    setDrawerDraft({
      organizationId: customer.organizationId,
      customerCode: customer.customerCode,
      customerAlias: customer.customerAlias,
      classification: customer.classification as CustomerClassification,
    });
    setEditingTarget(null);
    setSelectedId(customer.customerId);
    setDrawerMode("view");
  };

  const openEditDrawer = (customer: Customer) => {
    setDrawerDraft({
      organizationId: customer.organizationId,
      customerCode: customer.customerCode,
      customerAlias: customer.customerAlias,
      classification: customer.classification as CustomerClassification,
    });
    setEditingTarget(customer);
    setSelectedId(customer.customerId);
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingTarget(null);
    setSelectedId(null);
    setDrawerDraft(defaultFormState);
  };

  const submitDrawer = (values: CustomerFormState) => {
    if (drawerMode === "add") {
      createMutation.mutate(values);
      return;
    }

    if (drawerMode === "edit" && editingTarget) {
      updateMutation.mutate({
        customerId: editingTarget.customerId,
        body: {
          ...values,
          version: editingTarget.version,
        },
      });
    }
  };

  const handleDelete = (customer: Customer) => {
    deleteMutation.mutate({
      customerId: customer.customerId,
      version: customer.version,
    });
  };

  useEffect(() => {
    if (!currentError) return;
    const toastMessage =
      currentError instanceof ApiError
        ? t(currentError.message, { defaultValue: currentError.message })
        : t("Pages.Customer.unknownError");
    message.error(toastMessage);
  }, [currentError, t]);

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
                    {t("Pages.Customer.title")}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2" />
            </div>

            <hr className="my-4 border-border/70" />

            <CDrawerForm
              open={filterOpen}
              width={380}
              title={t("Pages.Customer.filters")}
              columns={filterColumns}
              values={{
                organizationId: organizationDraft,
                classification: classificationDraft,
                status: statusDraft,
              }}
              showSubmit
              textSubmit={t("Pages.Customer.apply")}
              textCancel={t("Pages.Customer.cancel")}
              onClose={() => {
                setOrganizationDraft(organizationId);
                setClassificationDraft(classification);
                setStatusDraft(status);
                setFilterOpen(false);
              }}
              onSubmit={({ value }) => {
                const nextOrganizationId = (value.organizationId ??
                  "") as string;
                const nextClassification = (value.classification ??
                  "ALL") as CustomerClassificationFilter;
                const nextStatus = (value.status ??
                  "ACTIVE") as CustomerStatusFilter;
                setOrganizationId(nextOrganizationId);
                setClassification(nextClassification);
                setStatus(nextStatus);
                setOrganizationDraft(nextOrganizationId);
                setClassificationDraft(nextClassification);
                setStatusDraft(nextStatus);
                setPage(0);
                setFilterOpen(false);
              }}
            />

            <CustomerDrawer
              mode={drawerMode ?? "view"}
              open={drawerMode !== null}
              detail={detail}
              initialValue={drawerDraft}
              loading={selectedQuery.isLoading}
              submitting={createMutation.isPending || updateMutation.isPending}
              organizations={activeOrganizations}
              onClose={closeDrawer}
              onSubmit={submitDrawer}
            />

            <div className="mt-4" />

            <div id="customer-list-table">
              <CServerTable
                columns={customerTableColumns}
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
                      text={t("Pages.Customer.filters")}
                      className="h-11 min-w-[110px] whitespace-nowrap px-6 text-base !bg-primary text-primary-foreground"
                      onClick={() => {
                        setOrganizationDraft(organizationId);
                        setClassificationDraft(classification);
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
                  labelAdd: t("Pages.Customer.create"),
                  onAdd: () => openCreateForm(),
                  name: (row: Customer) => row.customerAlias,
                  render: (customer: Customer) => (
                    <div className="flex items-center gap-2">
                      <CTooltip title={t("Pages.Customer.detailTitle")}>
                        <button
                          type="button"
                          title={t("Pages.Customer.detailTitle")}
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewDrawer(customer);
                          }}
                        >
                          <CSvgIcon name={EIcon.eye} className="primary" />
                        </button>
                      </CTooltip>

                      <CTooltip title={t("Pages.Customer.edit")}>
                        <button
                          type="button"
                          title={t("Pages.Customer.edit")}
                          disabled={customer.status === "DELETED"}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDrawer(customer);
                          }}
                          className={
                            customer.status === "DELETED"
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }
                        >
                          <CSvgIcon name={EIcon.edit} className="primary" />
                        </button>
                      </CTooltip>

                      <CTooltip title={t("Pages.Customer.delete")}>
                        <Popconfirm
                          destroyOnHidden={true}
                          title={t("Pages.Customer.deleteConfirm")}
                          onConfirm={() => handleDelete(customer)}
                          disabled={customer.status === "DELETED"}
                        >
                          <button
                            type="button"
                            title={t("Pages.Customer.delete")}
                            disabled={
                              customer.status === "DELETED" ||
                              deleteMutation.isPending
                            }
                            className={
                              customer.status === "DELETED" ||
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
    </div>
  );
}
