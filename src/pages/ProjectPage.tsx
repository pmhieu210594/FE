import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { message, Modal, Popconfirm } from "antd";
import type { AnyFormApi } from "@tanstack/react-form";

import { CButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CDrawerForm } from "@/components/ui/drawer";
import { CForm } from "@/components/ui/form";
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
  type Project,
  type ProjectSeverity,
  type ProjectStatus,
  type Team,
} from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

type DrawerMode = "add" | "edit" | "view";
type ProjectStatusFilter = "ACTIVE" | "DELETED" | "ALL";

type ProjectFormState = {
  customerId: string;
  projectAlias: string;
  projectType: string;
  riskLevel: ProjectSeverity;
  teamIds: string[];
};

type ProjectSubmitValues = Omit<ProjectFormState, "projectType"> & {
  projectType: string | null;
};

type ProjectTeamFormState = {
  teamId: string;
};

type ProjectAssignedTeamRow = {
  teamId: string;
  teamCode: string;
  teamName: string;
  memberCount: number;
};

const defaultFormState: ProjectFormState = {
  customerId: "",
  projectAlias: "",
  projectType: "",
  riskLevel: "MEDIUM",
  teamIds: [],
};

const statusBadgeClass: Record<ProjectStatus, string> = {
  ACTIVE: "border-transparent bg-blue-600 text-white",
  DELETED: "border-transparent bg-red-600 text-white",
};

const severityOptions: Array<{ value: ProjectSeverity; labelKey: string }> = [
  { value: "INFO", labelKey: "Pages.Project.severity.INFO" },
  { value: "LOW", labelKey: "Pages.Project.severity.LOW" },
  { value: "MEDIUM", labelKey: "Pages.Project.severity.MEDIUM" },
  { value: "HIGH", labelKey: "Pages.Project.severity.HIGH" },
  { value: "CRITICAL", labelKey: "Pages.Project.severity.CRITICAL" },
];

function normalizeForm(values: ProjectFormState): ProjectSubmitValues {
  return {
    customerId: values.customerId.trim(),
    projectAlias: values.projectAlias.trim(),
    projectType: values.projectType.trim() || null,
    riskLevel: values.riskLevel,
    teamIds: Array.from(new Set(values.teamIds ?? [])),
  };
}

function buildFormColumns(
  mode: DrawerMode,
  customers: Customer[],
  t: (key: string, props?: Record<string, unknown>) => string,
): IForm[] {
  const isViewMode = mode === "view";

  return [
    {
      name: "customerId",
      title: t("Pages.Project.customer"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        disabled: () => isViewMode,
        rules: [{ type: EFormRuleType.required }],
        list: customers.map((customer) => ({
          value: customer.customerId,
          label: customer.customerAlias,
        })),
      },
    },
    {
      name: "projectAlias",
      title: t("Pages.Project.projectName"),
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
      name: "projectType",
      title: t("Pages.Project.projectType"),
      formItem: {
        col: 6,
        maxLength: 100,
        disabled: () => isViewMode,
        rules: [{ type: EFormRuleType.max, value: 100 }],
      },
    },
    {
      name: "riskLevel",
      title: t("Pages.Project.riskLevel"),
      formItem: {
        type: EFormType.select,
        col: 6,
        className: "w-full",
        allowClear: false,
        disabled: () => isViewMode,
        rules: [{ type: EFormRuleType.required }],
        list: severityOptions.map((option) => ({
          value: option.value,
          label: t(option.labelKey),
        })),
      },
    },
  ];
}

function buildAddTeamColumns(
  teams: Team[],
  t: (key: string, props?: Record<string, unknown>) => string,
): IForm[] {
  return [
    {
      name: "teamId",
      title: t("Pages.Project.teams"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        placeholder: t("Pages.Project.teams"),
        rules: [{ type: EFormRuleType.required }],
        list: teams.map((team) => ({
          value: team.teamId,
          label: `${team.teamCode} - ${team.teamName}`,
        })),
      },
    },
  ];
}

function TeamAssignmentsSection({
  teamIds,
  teams,
  readOnly,
  disabled,
  onAdd,
  onRemove,
}: Readonly<{
  teamIds: string[];
  teams: Team[];
  readOnly?: boolean;
  disabled: boolean;
  onAdd: () => void;
  onRemove: (teamId: string) => void;
}>) {
  const { t } = useTranslation("locale");
  const selectedTeams = useMemo<ProjectAssignedTeamRow[]>(
    () =>
      teamIds.map((teamId) => {
        const matchedTeam = teams.find((team) => team.teamId === teamId);
        return matchedTeam
          ? {
              teamId: matchedTeam.teamId,
              teamCode: matchedTeam.teamCode,
              teamName: matchedTeam.teamName,
              memberCount: matchedTeam.memberCount ?? 0,
            }
          : {
              teamId,
              teamCode: "",
              teamName: teamId,
              memberCount: 0,
            };
      }),
    [teamIds, teams],
  );
  const teamColumns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "teamCode",
        title: t("Pages.Team.teamCode"),
        tableItem: {
          render: (value: string) => value || "-",
        },
      },
      {
        name: "teamName",
        title: t("Pages.Team.teamName"),
      },
      {
        name: "memberCount",
        title: t("Pages.Team.memberCount"),
        tableItem: {
          align: ETableAlign.center,
        },
      },
    ],
    [t],
  );

  return (
    <div className="space-y-3 rounded-lg border border-border/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{t("Pages.Project.teams")}</p>
          <p className="text-xs text-muted-foreground">
            {readOnly
              ? t("Pages.Project.teamAssignmentDetailHint", {
                  defaultValue: "Assigned teams for this project.",
                })
              : t("Pages.Project.teamAssignmentHint", {
                  defaultValue: "Manage assigned teams for this project.",
                })}
          </p>
        </div>
        {readOnly ? null : (
          <CButton
            text="Add team"
            icon={<CSvgIcon name={EIcon.plus} size={12} />}
            className="h-10 px-4 !bg-primary text-primary-foreground"
            onClick={onAdd}
            disabled={disabled}
          />
        )}
      </div>

      {selectedTeams.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          {t("Pages.Project.emptyValue")}
        </div>
      ) : (
        <div className="team-assignment-table">
          <CServerTable
            columns={teamColumns}
            data={selectedTeams}
            sort={{}}
            onSortChange={() => {}}
            showSearch={false}
            isPagination={false}
            heightCell={28}
            scaleColumns
            action={
              readOnly
                ? undefined
                : {
                    label: t("Components.Action"),
                    name: (row: ProjectAssignedTeamRow) => row.teamName,
                    width: 72,
                    fixed: "left",
                    render: (team: ProjectAssignedTeamRow) => (
                      <button
                        type="button"
                        title={`remove-team-${team.teamId}`}
                        aria-label={`remove-team-${team.teamId}`}
                        onClick={() => onRemove(team.teamId)}
                        disabled={disabled}
                        className={
                          disabled ? "cursor-not-allowed opacity-50" : ""
                        }
                      >
                        <CSvgIcon name={EIcon.trash} className="error" />
                      </button>
                    ),
                  }
            }
          />
        </div>
      )}
    </div>
  );
}

function AddProjectTeamModal({
  open,
  teams,
  submitting,
  onClose,
  onSubmit,
}: Readonly<{
  open: boolean;
  teams: Team[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectTeamFormState) => void;
}>) {
  const { t } = useTranslation("locale");
  const columns = useMemo(() => buildAddTeamColumns(teams, t), [teams, t]);
  const formRef = useRef<AnyFormApi | null>(null);

  return (
    <Modal
      open={open}
      width={520}
      centered
      title={<div className="py-0.5 !text-[18px] font-semibold">Add team</div>}
      onCancel={onClose}
      destroyOnHidden
      maskClosable={false}
      footer={
        <div className="flex items-center justify-end gap-3">
          <CButton
            text={t("Pages.Project.cancel")}
            className="w-full border border-border !bg-white !text-black shadow-none sm:w-auto sm:min-w-36"
            onClick={onClose}
          />
          <CButton
            text={t("Pages.Project.save")}
            className="w-full !bg-primary text-primary-foreground sm:w-auto sm:min-w-36"
            isLoading={submitting}
            onClick={() => formRef.current?.handleSubmit()}
          />
        </div>
      }
    >
      <CForm
        ref={formRef}
        columns={columns}
        values={{ teamId: teams[0]?.teamId ?? "" }}
        isLoading={submitting}
        onSubmit={({
          value,
        }: {
          value: ProjectTeamFormState;
          formApi: AnyFormApi;
        }) => onSubmit({ teamId: value.teamId })}
      />
    </Modal>
  );
}

function buildFilterColumns(
  customers: Customer[],
  t: (key: string, props?: Record<string, unknown>) => string,
): IForm[] {
  return [
    {
      name: "customerId",
      title: t("Pages.Project.customer"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        list: [
          { value: "", label: t("Pages.Project.all") },
          ...customers.map((customer) => ({
            value: customer.customerId,
            label: customer.customerAlias,
          })),
        ],
      },
    },
    {
      name: "status",
      title: t("Pages.Project.status"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        list: [
          { value: "ACTIVE", label: t("Pages.Project.statusValues.ACTIVE") },
          { value: "DELETED", label: t("Pages.Project.statusValues.DELETED") },
          { value: "ALL", label: t("Pages.Project.all") },
        ],
      },
    },
  ];
}

function ProjectDrawer({
  mode,
  open,
  detail,
  initialValue,
  loading,
  submitting,
  customers,
  teams,
  teamIds,
  onOpenAddTeam,
  onRemoveTeam,
  onClose,
  onSubmit,
}: Readonly<{
  mode: DrawerMode;
  open: boolean;
  detail: Project | null | undefined;
  initialValue: ProjectFormState;
  loading: boolean;
  submitting: boolean;
  customers: Customer[];
  teams: Team[];
  teamIds: string[];
  onOpenAddTeam: () => void;
  onRemoveTeam: (teamId: string) => void;
  onClose: () => void;
  onSubmit: (values: ProjectSubmitValues) => void;
}>) {
  const { t } = useTranslation("locale");
  const columns = useMemo(
    () => buildFormColumns(mode, customers, t),
    [mode, customers, t],
  );

  return (
    <CDrawerForm
      open={open}
      width={720}
      title={
        mode === "add"
          ? t("Pages.Project.createTitle")
          : mode === "edit"
            ? t("Pages.Project.editTitle")
            : t("Pages.Project.detailTitle")
      }
      columns={mode === "view" ? [] : columns}
      values={initialValue}
      isLoading={loading || submitting}
      showSubmit={mode !== "view"}
      textSubmit={t("Pages.Project.save")}
      textCancel={
        mode === "view" ? t("Pages.Project.close") : t("Pages.Project.cancel")
      }
      onClose={onClose}
      onSubmit={({ value }: { value: ProjectFormState; formApi: AnyFormApi }) =>
        onSubmit(
          normalizeForm({
            ...value,
            teamIds,
          }),
        )
      }
    >
      {mode === "view" ? (
        <>
          {loading && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.Project.loading")}
            </div>
          )}
          {!loading && !detail && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("Pages.Project.detailEmpty")}
            </div>
          )}
          {!loading && detail && (
            <div className="grid gap-3 text-sm">
              <div className="rounded-md bg-muted/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("Pages.Project.projectName")}
                    </p>
                    <p className="font-medium">{detail.projectAlias}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusBadgeClass[detail.status as ProjectStatus]}
                  >
                    {t(`Pages.Project.statusValues.${detail.status}`)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {detail.customerName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Project.projectType")}
                  </p>
                  <p>{detail.projectType ?? t("Pages.Project.emptyValue")}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Project.riskLevel")}
                  </p>
                  <p>
                    {detail.riskLevel
                      ? t(`Pages.Project.severity.${detail.riskLevel}`)
                      : t("Pages.Project.emptyValue")}
                  </p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Project.createdAt")}
                  </p>
                  <p>{formatDateTime(detail.createdAt)}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("Pages.Project.updatedAt")}
                  </p>
                  <p>{formatDateTime(detail.updatedAt)}</p>
                </div>
              </div>

              <div className="rounded-md bg-muted/40 p-3">
                <TeamAssignmentsSection
                  teamIds={detail.teamAssignments.map(
                    (assignment) => assignment.teamId,
                  )}
                  teams={teams}
                  readOnly
                  disabled
                  onAdd={() => {}}
                  onRemove={() => {}}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <TeamAssignmentsSection
          teamIds={teamIds}
          teams={teams}
          readOnly={false}
          disabled={submitting}
          onAdd={onOpenAddTeam}
          onRemove={onRemoveTeam}
        />
      )}
    </CDrawerForm>
  );
}

export function ProjectPage() {
  const { t } = useTranslation("locale");
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState<ProjectStatusFilter>("ACTIVE");
  const [customerDraft, setCustomerDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState<ProjectStatusFilter>("ACTIVE");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);

  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<Project | null>(null);
  const [drawerDraft, setDrawerDraft] =
    useState<ProjectFormState>(defaultFormState);
  const [addTeamOpen, setAddTeamOpen] = useState(false);

  const customerListQuery = useQuery({
    queryKey: ["project-customers"],
    queryFn: () =>
      endpoints.customers.list({ status: "ACTIVE", page: 0, pageSize: 100 }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const teamListQuery = useQuery({
    queryKey: ["project-teams"],
    queryFn: () =>
      endpoints.teams.list({ status: "ACTIVE", page: 0, size: 100 }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const listQuery = useQuery({
    queryKey: ["projects", keyword, customerId, status, page, size],
    queryFn: () =>
      endpoints.projects.list({
        keyword: keyword || undefined,
        customerId: customerId || undefined,
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
      listQuery.data?.items.find((item) => item.projectId === selectedId) ??
      null,
    [listQuery.data?.items, selectedId],
  );

  const shouldFetchSelectedDetail =
    !!selectedId &&
    (!selectedFromList || selectedFromList.status !== "DELETED");

  const selectedQuery = useQuery({
    queryKey: ["project", selectedId],
    queryFn: () => endpoints.projects.get(selectedId!),
    enabled: shouldFetchSelectedDetail,
  });

  useEffect(() => {
    if (drawerMode === "edit" && selectedQuery.data) {
      const project = selectedQuery.data;

      setDrawerDraft({
        customerId: project.customerId,
        projectAlias: project.projectAlias,
        projectType: project.projectType ?? "",
        riskLevel: (project.riskLevel as ProjectSeverity) ?? "MEDIUM",
        teamIds: project.teamAssignments.map((a) => a.teamId),
      });
    }
  }, [drawerMode, selectedQuery.data]);

  const activeCustomers = customerListQuery.data?.items ?? [];
  const activeTeams = teamListQuery.data?.items ?? [];
  const availableTeams = useMemo(
    () =>
      activeTeams.filter((team) => !drawerDraft.teamIds.includes(team.teamId)),
    [activeTeams, drawerDraft.teamIds],
  );

  const detail = selectedQuery.data ?? selectedFromList ?? editingTarget;
  const isDetailLoading = shouldFetchSelectedDetail && selectedQuery.isLoading;

  const createMutation = useMutation({
    mutationFn: (body: ProjectSubmitValues) => endpoints.projects.create(body),
    onSuccess: async (created) => {
      message.success(t("Pages.Project.createSuccess"));
      setDrawerMode(null);
      setEditingTarget(null);
      setSelectedId(created.projectId);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({
        queryKey: ["project", created.projectId],
      });
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      projectId,
      body,
    }: {
      projectId: string;
      body: ProjectSubmitValues;
    }) => endpoints.projects.update(projectId, body),
    onSuccess: async (updated) => {
      message.success(t("Pages.Project.updateSuccess"));
      setDrawerMode(null);
      setEditingTarget(null);
      setSelectedId(updated.projectId);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({
        queryKey: ["project", updated.projectId],
      });
    },
    onError: handleError,
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => endpoints.projects.softDelete(projectId),
    onSuccess: async (deleted) => {
      message.success(t("Pages.Project.deleteSuccess"));
      if (selectedId === deleted.projectId) {
        setDrawerMode(null);
        setEditingTarget(null);
        setSelectedId(null);
        setDrawerDraft(defaultFormState);
      }
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.removeQueries({
        queryKey: ["project", deleted.projectId],
        exact: true,
      });
    },
    onError: handleError,
  });

  function handleError(error: unknown) {
    message.error(
      error instanceof ApiError
        ? t(error.message, { defaultValue: error.message })
        : t("Pages.Project.unknownError"),
    );
  }

  const filterColumns = useMemo(
    () => buildFilterColumns(activeCustomers, t),
    [activeCustomers, t],
  );

  const projectTableColumns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "projectAlias",
        title: t("Pages.Project.projectName"),
        sortKey: "projectAlias",
      },
      {
        name: "customerName",
        title: t("Pages.Project.customer"),
        sortKey: "customerName",
      },
      {
        name: "projectType",
        title: t("Pages.Project.projectType"),
        sortKey: "projectType",
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) =>
            value || t("Pages.Project.emptyValue"),
        },
      },
      {
        name: "riskLevel",
        title: t("Pages.Project.riskLevel"),
        sortKey: "riskLevel",
        tableItem: {
          align: ETableAlign.center,
          render: (value: string) => t(`Pages.Project.severity.${value}`),
        },
      },
      {
        name: "status",
        title: t("Pages.Project.status"),
        sortKey: "status",
        tableItem: {
          align: ETableAlign.center,
          render: (_value: string, project: Project) => (
            <Badge
              variant="outline"
              className={statusBadgeClass[project.status as ProjectStatus]}
            >
              {t(`Pages.Project.statusValues.${project.status}`)}
            </Badge>
          ),
        },
      },
      {
        name: "updatedAt",
        title: t("Pages.Project.updatedAt"),
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
    listQuery.error ??
    (shouldFetchSelectedDetail ? selectedQuery.error : null) ??
    customerListQuery.error ??
    teamListQuery.error;

  useEffect(() => {
    if (!currentError) return;
    handleError(currentError);
  }, [currentError]);

  const openCreateForm = () => {
    setDrawerDraft(defaultFormState);
    setEditingTarget(null);
    setSelectedId(null);
    setDrawerMode("add");
  };

  const openViewDrawer = (project: Project) => {
    setDrawerDraft({
      customerId: project.customerId,
      projectAlias: project.projectAlias,
      projectType: project.projectType ?? "",
      riskLevel: (project.riskLevel as ProjectSeverity) ?? "MEDIUM",
      teamIds: project.teamAssignments.map((assignment) => assignment.teamId),
    });
    setEditingTarget(null);
    setSelectedId(project.projectId);
    setDrawerMode("view");
  };

  const openEditDrawer = (project: Project) => {
    setDrawerDraft({
      customerId: project.customerId,
      projectAlias: project.projectAlias,
      projectType: project.projectType ?? "",
      riskLevel: (project.riskLevel as ProjectSeverity) ?? "MEDIUM",
      teamIds: project.teamAssignments.map((assignment) => assignment.teamId),
    });
    setEditingTarget(project);
    setSelectedId(project.projectId);
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingTarget(null);
    setSelectedId(null);
    setDrawerDraft(defaultFormState);
    setAddTeamOpen(false);
  };

  const openAddTeamModal = () => {
    if (drawerMode === "view" || availableTeams.length === 0) return;
    setAddTeamOpen(true);
  };

  const addTeamToDraft = ({ teamId }: ProjectTeamFormState) => {
    setDrawerDraft((current) => ({
      ...current,
      teamIds: current.teamIds.includes(teamId)
        ? current.teamIds
        : [...current.teamIds, teamId],
    }));
    setAddTeamOpen(false);
  };

  const removeTeamFromDraft = (teamId: string) => {
    setDrawerDraft((current) => ({
      ...current,
      teamIds: current.teamIds.filter((id) => id !== teamId),
    }));
  };

  const submitDrawer = (values: ProjectSubmitValues) => {
    if (drawerMode === "add") {
      createMutation.mutate(values);
      return;
    }
    if (drawerMode === "edit" && editingTarget) {
      updateMutation.mutate({
        projectId: editingTarget.projectId,
        body: values,
      });
    }
  };

  const processedData = useMemo(() => {
    return (listQuery.data?.items ?? []).map((item) => ({
      ...item,
      key: item.projectId, // Tạo thuộc tính key ngầm định để CServerTable nhận diện
      id: item.projectId, // Dự phòng nếu Table wrapper ưu tiên trường 'id'
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
                {t("Pages.Project.title")}
              </h1>
            </div>

            <hr className="my-4 border-border/70" />

            <CDrawerForm
              open={filterOpen}
              width={380}
              title={t("Pages.Project.filters")}
              columns={filterColumns}
              values={{ customerId: customerDraft, status: statusDraft }}
              showSubmit
              textSubmit={t("Pages.Project.apply")}
              textCancel={t("Pages.Project.cancel")}
              onClose={() => {
                setCustomerDraft(customerId);
                setStatusDraft(status);
                setFilterOpen(false);
              }}
              onSubmit={({ value }) => {
                const nextCustomerId = (value.customerId ?? "") as string;
                const nextStatus = (value.status ??
                  "ACTIVE") as ProjectStatusFilter;
                setCustomerId(nextCustomerId);
                setStatus(nextStatus);
                setCustomerDraft(nextCustomerId);
                setStatusDraft(nextStatus);
                setPage(0);
                setFilterOpen(false);
              }}
            />

            <ProjectDrawer
              mode={drawerMode ?? "view"}
              open={drawerMode !== null}
              detail={detail}
              initialValue={drawerDraft}
              loading={isDetailLoading}
              submitting={createMutation.isPending || updateMutation.isPending}
              customers={activeCustomers}
              teams={activeTeams}
              teamIds={drawerDraft.teamIds}
              onOpenAddTeam={openAddTeamModal}
              onRemoveTeam={removeTeamFromDraft}
              onClose={closeDrawer}
              onSubmit={submitDrawer}
            />
            <AddProjectTeamModal
              open={addTeamOpen}
              teams={availableTeams}
              submitting={false}
              onClose={() => setAddTeamOpen(false)}
              onSubmit={addTeamToDraft}
            />

            <div id="project-list-table">
              <CServerTable
                columns={projectTableColumns}
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
                      text={t("Pages.Project.filters")}
                      className="h-11 min-w-[110px] whitespace-nowrap px-6 text-base !bg-primary text-primary-foreground"
                      onClick={() => {
                        setCustomerDraft(customerId);
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
                  labelAdd: t("Pages.Project.create"),
                  onAdd: () => openCreateForm(),
                  name: (row: Project) => row.projectAlias,
                  render: (project: Project) => (
                    <div className="flex items-center gap-2">
                      <CTooltip title={t("Pages.Project.detailTitle")}>
                        <button
                          type="button"
                          title={t("Pages.Project.detailTitle")}
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewDrawer(project);
                          }}
                        >
                          <CSvgIcon name={EIcon.eye} className="primary" />
                        </button>
                      </CTooltip>

                      <CTooltip title={t("Pages.Project.edit")}>
                        <button
                          type="button"
                          title={t("Pages.Project.edit")}
                          disabled={project.status === "DELETED"}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDrawer(project);
                          }}
                          className={
                            project.status === "DELETED"
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }
                        >
                          <CSvgIcon name={EIcon.edit} className="primary" />
                        </button>
                      </CTooltip>

                      <CTooltip title={t("Pages.Project.delete")}>
                        <Popconfirm
                          destroyOnHidden={true}
                          title={t("Pages.Project.deleteConfirm", {
                            projectName: project.projectAlias,
                          })}
                          onConfirm={() =>
                            deleteMutation.mutate(project.projectId)
                          }
                          disabled={project.status === "DELETED"}
                        >
                          <button
                            type="button"
                            title={t("Pages.Project.delete")}
                            disabled={
                              project.status === "DELETED" ||
                              deleteMutation.isPending
                            }
                            className={
                              project.status === "DELETED" ||
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
