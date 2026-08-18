import { useEffect, useMemo, useState } from "react";
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
  ApiError,
  endpoints,
  type CreateRepositoryRequest,
  type Project,
  type Repository,
  type RepositoryHostType,
  type RepositoryStatus,
  type UpdateRepositoryRequest,
} from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

type DrawerMode = "add" | "edit" | "view";

type RepositoryFormState = {
  projectId: string;
  repo_name_masked: string;
  host_type: RepositoryHostType;
  default_branch: string;
  repo_url_hash: string;
};

const defaultFormState: RepositoryFormState = {
  projectId: "",
  repo_name_masked: "",
  host_type: "GITHUB",
  default_branch: "",
  repo_url_hash: "",
};

const statusBadgeClass: Record<RepositoryStatus, string> = {
  ACTIVE: "border-transparent bg-blue-600 text-white",
  DELETED: "border-transparent bg-red-600 text-white",
};

function normalizeForm(values: RepositoryFormState): RepositoryFormState {
  return {
    projectId: values.projectId.trim(),
    repo_name_masked: values.repo_name_masked.trim(),
    host_type: values.host_type,
    default_branch: values.default_branch.trim(),
    repo_url_hash: values.repo_url_hash.trim(),
  };
}

function buildFormColumns(
  mode: DrawerMode,
  projects: Project[],
  t: (key: string, props?: Record<string, unknown>) => string,
): IForm[] {
  const isViewMode = mode === "view";
  return [
    {
      name: "projectId",
      title: t("Pages.Repository.project"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        disabled: () => isViewMode,
        rules: [{ type: EFormRuleType.required }],
        list: projects.map((project) => ({
          value: project.projectId,
          label: project.projectAlias,
        })),
      },
    },
    {
      name: "repo_name_masked",
      title: t("Pages.Repository.name"),
      formItem: {
        col: 12,
        maxLength: 255,
        disabled: () => isViewMode,
        rules: [
          { type: EFormRuleType.required },
          { type: EFormRuleType.max, value: 255 },
          { type: EFormRuleType.noXss },
        ],
      },
    },
    {
      name: "host_type",
      title: t("Pages.Repository.hostType"),
      formItem: {
        type: EFormType.select,
        col: 6,
        className: "w-full",
        allowClear: false,
        disabled: () => isViewMode,
        rules: [{ type: EFormRuleType.required }],
        list: [{ value: "GITHUB", label: "GITHUB" }],
      },
    },
    {
      name: "default_branch",
      title: t("Pages.Repository.defaultBranch"),
      formItem: {
        col: 6,
        maxLength: 100,
        disabled: () => isViewMode,
        rules: [
          { type: EFormRuleType.max, value: 100 },
          { type: EFormRuleType.noXss },
        ],
      },
    },
    {
      name: "repo_url_hash",
      title: t("Pages.Repository.repoUrl"),
      formItem: {
        col: 12,
        maxLength: 2048,
        disabled: () => isViewMode,
        rules: [
          { type: EFormRuleType.max, value: 2048 },
          { type: EFormRuleType.noXss },
        ],
      },
    },
  ];
}

function RepositoryDrawer({
  mode,
  open,
  detail,
  initialValue,
  loading,
  submitting,
  projects,
  onClose,
  onSubmit,
}: Readonly<{
  mode: DrawerMode;
  open: boolean;
  detail: Repository | null | undefined;
  initialValue: RepositoryFormState;
  loading: boolean;
  submitting: boolean;
  projects: Project[];
  onClose: () => void;
  onSubmit: (values: RepositoryFormState) => void;
}>) {
  const { t } = useTranslation("locale");
  const columns = useMemo(
    () => buildFormColumns(mode, projects, t),
    [mode, projects, t],
  );

  return (
    <CDrawerForm
      open={open}
      width={680}
      title={
        mode === "add"
          ? t("Pages.Repository.createTitle")
          : mode === "edit"
            ? t("Pages.Repository.editTitle")
            : t("Pages.Repository.detailTitle")
      }
      columns={mode === "view" ? [] : columns}
      values={initialValue}
      isLoading={loading || submitting}
      showSubmit={mode !== "view"}
      textSubmit={t("Pages.Repository.save")}
      textCancel={
        mode === "view"
          ? t("Pages.Repository.close")
          : t("Pages.Repository.cancel")
      }
      onClose={onClose}
      onSubmit={({ value }) => onSubmit(normalizeForm(value))}
    >
      {mode === "view" ? (
        <>
          {loading && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.Repository.loading")}
            </div>
          )}
          {!loading && !detail && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.Repository.detailEmpty")}
            </div>
          )}
          {!loading && detail && (
            <div className="grid gap-3 text-sm">
              <div className="rounded-md bg-muted/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("Pages.Repository.name")}
                    </p>
                    <p className="font-medium">{detail.repoNameMasked}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      statusBadgeClass[detail.status as RepositoryStatus]
                    }
                  >
                    {t(`Pages.Repository.statusValues.${detail.status}`)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {detail.projectAlias ?? detail.projectId}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Repository.hostType")}
                  </p>
                  <p>{detail.hostType}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Repository.defaultBranch")}
                  </p>
                  <p>
                    {detail.defaultBranch || t("Pages.Repository.emptyValue")}
                  </p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Repository.repoUrl")}
                  </p>
                  <p className="break-all">
                    {detail.repoUrlHash || t("Pages.Repository.emptyValue")}
                  </p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Repository.project")}
                  </p>
                  <p>{detail.projectAlias ?? detail.projectId}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Repository.createdAt")}
                  </p>
                  <p>{formatDateTime(detail.createdAt)}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Repository.updatedAt")}
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

function buildFilterColumns(
  projects: Project[],
  t: (key: string, props?: Record<string, unknown>) => string,
): IForm[] {
  return [
    {
      name: "projectId",
      title: t("Pages.Repository.project"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        list: [
          { value: "", label: t("Pages.Repository.all") },
          ...projects.map((project) => ({
            value: project.projectId,
            label: project.projectAlias,
          })),
        ],
      },
    },
    {
      name: "status",
      title: t("Pages.Repository.status"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        list: [
          { value: "ACTIVE", label: t("Pages.Repository.statusValues.ACTIVE") },
          {
            value: "DELETED",
            label: t("Pages.Repository.statusValues.DELETED"),
          },
          { value: "ALL", label: t("Pages.Repository.all") },
        ],
      },
    },
  ];
}

export function RepositoryPage() {
  const { t } = useTranslation("locale");
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "DELETED" | "ALL">("ACTIVE");
  const [projectDraft, setProjectDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState<"ACTIVE" | "DELETED" | "ALL">(
    "ACTIVE",
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<Repository | null>(null);
  const [drawerDraft, setDrawerDraft] =
    useState<RepositoryFormState>(defaultFormState);

  const projectListQuery = useQuery({
    queryKey: ["repository-projects"],
    queryFn: () =>
      endpoints.projects.list({ status: "ACTIVE", page: 0, size: 100 }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const listQuery = useQuery({
    queryKey: ["repositories", keyword, projectId, status, page, size],
    queryFn: () =>
      endpoints.repositories.list({
        keyword: keyword || undefined,
        projectId: projectId || undefined,
        status,
        page,
        size,
      }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const selectedFromList = useMemo(
    () =>
      listQuery.data?.items.find((item) => item.repositoryId === selectedId) ??
      null,
    [listQuery.data?.items, selectedId],
  );

  const shouldFetchSelectedDetail =
    !!selectedId &&
    (!selectedFromList || selectedFromList.status !== "DELETED");
  const selectedQuery = useQuery({
    queryKey: ["repository", selectedId],
    queryFn: () => endpoints.repositories.get(selectedId!),
    enabled: shouldFetchSelectedDetail,
  });

  const detail = selectedQuery.data ?? selectedFromList ?? editingTarget;
  const projects = projectListQuery.data?.items ?? [];

  const createMutation = useMutation({
    mutationFn: (body: CreateRepositoryRequest) =>
      endpoints.repositories.create(body),
    onSuccess: async (created) => {
      message.success(t("Pages.Repository.createSuccess"));
      setDrawerMode(null);
      setEditingTarget(null);
      setSelectedId(created.repositoryId);
      await queryClient.invalidateQueries({ queryKey: ["repositories"] });
      await queryClient.invalidateQueries({
        queryKey: ["repository", created.repositoryId],
      });
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      repositoryId,
      body,
    }: {
      repositoryId: string;
      body: UpdateRepositoryRequest;
    }) => endpoints.repositories.update(repositoryId, body),
    onSuccess: async (updated) => {
      message.success(t("Pages.Repository.updateSuccess"));
      setDrawerMode(null);
      setEditingTarget(null);
      setSelectedId(updated.repositoryId);
      await queryClient.invalidateQueries({ queryKey: ["repositories"] });
      await queryClient.invalidateQueries({
        queryKey: ["repository", updated.repositoryId],
      });
    },
    onError: handleError,
  });

  const deleteMutation = useMutation({
    mutationFn: (repositoryId: string) =>
      endpoints.repositories.softDelete(repositoryId),
    onSuccess: async (deleted) => {
      message.success(t("Pages.Repository.deleteSuccess"));
      if (selectedId === deleted.repositoryId) {
        setDrawerMode(null);
        setEditingTarget(null);
        setSelectedId(null);
      }
      await queryClient.invalidateQueries({ queryKey: ["repositories"] });
      queryClient.removeQueries({
        queryKey: ["repository", deleted.repositoryId],
        exact: true,
      });
    },
    onError: handleError,
  });

  function handleError(error: unknown) {
    message.error(
      error instanceof ApiError
        ? t(error.message, { defaultValue: error.message })
        : t("Pages.Repository.unknownError"),
    );
  }

  useEffect(() => {
    const currentError =
      listQuery.error ?? selectedQuery.error ?? projectListQuery.error;
    if (currentError) handleError(currentError);
  }, [listQuery.error, selectedQuery.error, projectListQuery.error]);

  const openCreateForm = () => {
    setDrawerDraft(defaultFormState);
    setEditingTarget(null);
    setSelectedId(null);
    setDrawerMode("add");
  };

  const openViewDrawer = (repository: Repository) => {
    setDrawerDraft({
      projectId: repository.projectId,
      repo_name_masked: repository.repoNameMasked,
      host_type: (repository.hostType as RepositoryHostType) ?? "GITHUB",
      default_branch: repository.defaultBranch ?? "",
      repo_url_hash: repository.repoUrlHash ?? "",
    });
    setEditingTarget(null);
    setSelectedId(repository.repositoryId);
    setDrawerMode("view");
  };

  const openEditDrawer = (repository: Repository) => {
    setDrawerDraft({
      projectId: repository.projectId,
      repo_name_masked: repository.repoNameMasked,
      host_type: (repository.hostType as RepositoryHostType) ?? "GITHUB",
      default_branch: repository.defaultBranch ?? "",
      repo_url_hash: repository.repoUrlHash ?? "",
    });
    setEditingTarget(repository);
    setSelectedId(repository.repositoryId);
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingTarget(null);
    setSelectedId(null);
    setDrawerDraft(defaultFormState);
  };

  const submitDrawer = (values: RepositoryFormState) => {
    if (drawerMode === "add") {
      createMutation.mutate(values);
      return;
    }
    if (drawerMode === "edit" && editingTarget) {
      updateMutation.mutate({
        repositoryId: editingTarget.repositoryId,
        body: values,
      });
    }
  };

  const columns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "repoNameMasked",
        title: t("Pages.Repository.name"),
        sortKey: "repoNameMasked",
      },
      {
        name: "projectAlias",
        title: t("Pages.Repository.project"),
        sortKey: "projectAlias",
      },
      {
        name: "hostType",
        title: t("Pages.Repository.hostType"),
        sortKey: "hostType",
        tableItem: { align: ETableAlign.center },
      },
      {
        name: "defaultBranch",
        title: t("Pages.Repository.defaultBranch"),
        tableItem: {
          render: (value: string | null) =>
            value || t("Pages.Repository.emptyValue"),
        },
      },
      {
        name: "status",
        title: t("Pages.Repository.status"),
        tableItem: {
          align: ETableAlign.center,
          render: (_value: string, row: Repository) => (
            <Badge
              variant="outline"
              className={statusBadgeClass[row.status as RepositoryStatus]}
            >
              {t(`Pages.Repository.statusValues.${row.status}`)}
            </Badge>
          ),
        },
      },
      {
        name: "updatedAt",
        title: t("Pages.Repository.updatedAt"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string) => formatDateTime(value),
        },
      },
    ],
    [t],
  );

  const filterColumns = useMemo(
    () => buildFilterColumns(projects, t),
    [projects, t],
  );

  const processedData = useMemo(() => {
    return (listQuery.data?.items ?? []).map((item) => ({
      ...item,
      key: item.repositoryId, // Tạo thuộc tính key ngầm định để CServerTable nhận diện
      id: item.repositoryId, // Dự phòng nếu Table wrapper ưu tiên trường 'id'
    }));
  }, [listQuery.data?.items]);

  return (
    <div className="wrapper-grid">
      <div className="intro-x right">
        <div className="card overflow-hidden">
          <div className="body">
            <div className="space-y-1">
              <h1
                className="text-lg font-semibold"
                style={{ fontSize: "18px" }}
              >
                {t("Pages.Repository.title")}
              </h1>
            </div>
            <hr className="my-4 border-border/70" />
            <CDrawerForm
              open={filterOpen}
              width={380}
              title={t("Pages.Repository.filters")}
              columns={filterColumns}
              values={{ projectId: projectDraft, status: statusDraft }}
              showSubmit
              textSubmit={t("Pages.Repository.apply")}
              textCancel={t("Pages.Repository.cancel")}
              onClose={() => {
                setProjectDraft(projectId);
                setStatusDraft(status);
                setFilterOpen(false);
              }}
              onSubmit={({ value }) => {
                const nextProjectId = (value.projectId ?? "") as string;
                const nextStatus = (value.status ?? "ACTIVE") as
                  | "ACTIVE"
                  | "DELETED"
                  | "ALL";
                setProjectId(nextProjectId);
                setStatus(nextStatus);
                setProjectDraft(nextProjectId);
                setStatusDraft(nextStatus);
                setPage(0);
                setFilterOpen(false);
              }}
            />
            <RepositoryDrawer
              mode={drawerMode ?? "view"}
              open={drawerMode !== null}
              detail={detail}
              initialValue={drawerDraft}
              loading={shouldFetchSelectedDetail && selectedQuery.isLoading}
              submitting={createMutation.isPending || updateMutation.isPending}
              projects={projects}
              onClose={closeDrawer}
              onSubmit={submitDrawer}
            />
            <div id="repository-list-table">
              <CServerTable
                columns={columns}
                data={processedData}
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
                      text={t("Pages.Repository.filters")}
                      className="h-11 min-w-[110px] whitespace-nowrap px-6 text-base !bg-primary text-primary-foreground"
                      onClick={() => {
                        setProjectDraft(projectId);
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
                  labelAdd: t("Pages.Repository.create"),
                  onAdd: openCreateForm,
                  name: (row: Repository) => row.repoNameMasked,
                  render: (repository: Repository) => (
                    <div className="flex items-center gap-2">
                      <CTooltip title={t("Pages.Repository.detailTitle")}>
                        <button
                          type="button"
                          title={t("Pages.Repository.detailTitle")}
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewDrawer(repository);
                          }}
                        >
                          <CSvgIcon name={EIcon.eye} className="primary" />
                        </button>
                      </CTooltip>
                      <CTooltip title={t("Pages.Repository.edit")}>
                        <button
                          type="button"
                          title={t("Pages.Repository.edit")}
                          disabled={repository.status === "DELETED"}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDrawer(repository);
                          }}
                          className={
                            repository.status === "DELETED"
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }
                        >
                          <CSvgIcon name={EIcon.edit} className="primary" />
                        </button>
                      </CTooltip>
                      <CTooltip title={t("Pages.Repository.delete")}>
                        <Popconfirm
                          destroyOnHidden
                          title={t("Pages.Repository.deleteConfirm", {
                            repositoryName: repository.repoNameMasked,
                          })}
                          onConfirm={() =>
                            deleteMutation.mutate(repository.repositoryId)
                          }
                          disabled={repository.status === "DELETED"}
                        >
                          <button
                            type="button"
                            title={t("Pages.Repository.delete")}
                            disabled={
                              repository.status === "DELETED" ||
                              deleteMutation.isPending
                            }
                            className={
                              repository.status === "DELETED" ||
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
