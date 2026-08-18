import { useEffect, useMemo, useRef, useState } from "react";
import type { AnyFormApi } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message, Modal, Popconfirm, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { CButton } from "@/components/ui/button";
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
  type Team,
  type TeamDetail,
  type TeamMember,
  type TeamMemberOption,
  type TeamRoleOption,
  type TeamStatus,
} from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

type DrawerMode = "add" | "edit" | "view";
type MemberDrawerMode = "add" | "edit";
type TeamStatusFilter = "ACTIVE" | "DELETED" | "ALL";

type TeamFormState = {
  teamCode: string;
  teamName: string;
  description: string;
  status: TeamStatus;
};

type TeamMemberFormState = {
  memberKey: string;
  roleId: string;
};

const defaultTeamFormState: TeamFormState = {
  teamCode: "",
  teamName: "",
  description: "",
  status: "ACTIVE",
};

const defaultMemberFormState: TeamMemberFormState = {
  memberKey: "",
  roleId: "",
};

const statusBadgeClass: Record<string, string> = {
  ACTIVE: "border-transparent bg-blue-600 text-white",
  DELETED: "border-transparent bg-red-600 text-white",
  INACTIVE: "border-transparent bg-red-600 text-white",
};

function getTeamStatusClass(status: string) {
  return statusBadgeClass[status] ?? statusBadgeClass.ACTIVE;
}

function normalizeMemberForm(
  values: Partial<TeamMemberFormState>,
): TeamMemberFormState {
  return {
    memberKey: values.memberKey?.trim() ?? "",
    roleId: values.roleId?.trim() ?? "",
  };
}

function buildTeamColumns(
  t: (key: string, props?: Record<string, unknown>) => string,
): IForm[] {
  return [
    {
      name: "teamCode",
      title: t("Pages.Team.teamCode"),
      formItem: {
        col: 12,
        maxLength: 50,
        placeholder: t("PleaseEnter"),
        disabled: () => false,
        rules: [
          { type: EFormRuleType.required },
          { type: EFormRuleType.max, value: 50 },
          { type: EFormRuleType.noXss },
        ],
      },
    },
    {
      name: "teamName",
      title: t("Pages.Team.teamName"),
      formItem: {
        col: 12,
        maxLength: 255,
        placeholder: t("PleaseEnter"),
        disabled: () => false,
        rules: [
          { type: EFormRuleType.required },
          { type: EFormRuleType.max, value: 255 },
          { type: EFormRuleType.noXss },
        ],
      },
    },
    {
      name: "description",
      title: t("Pages.Team.description"),
      formItem: {
        col: 12,
        maxLength: 500,
        placeholder: t("PleaseEnter"),
        disabled: () => false,
        rules: [
          { type: EFormRuleType.max, value: 500 },
          { type: EFormRuleType.noXss },
        ],
      },
    },
  ];
}

function buildMemberColumns(
  mode: MemberDrawerMode,
  memberOptions: TeamMemberOption[],
  roleOptions: TeamRoleOption[],
  currentMemberKeys: string[],
  t: (key: string, props?: Record<string, unknown>) => string,
): IForm[] {
  const columns: IForm[] = [];
  const activeRoleOptions = roleOptions.filter(
    (option) => option.roleName.toUpperCase() !== "ADMIN",
  );
  const availableMemberOptions = memberOptions.filter(
    (option) => !currentMemberKeys.includes(option.memberKey),
  );

  if (mode === "add") {
    columns.push({
      name: "memberKey",
      title: t("Pages.Team.member"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "w-full",
        allowClear: false,
        placeholder: t("Pages.Team.selectMember"),
        rules: [{ type: EFormRuleType.required }],
        list: availableMemberOptions.map((option) => ({
          value: option.memberKey,
          label: option.pseudonym,
        })),
      },
    });
  }

  columns.push({
    name: "roleId",
    title: t("Pages.Team.role"),
    formItem: {
      type: EFormType.select,
      col: 12,
      className: "w-full",
      allowClear: false,
      placeholder: t("Pages.Team.selectRole"),
      rules: [{ type: EFormRuleType.required }],
      list: activeRoleOptions.map((option) => ({
        value: option.roleId,
        label: option.roleName,
      })),
    },
  });

  return columns;
}

function TeamFormDrawer({
  mode,
  open,
  initialValue,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: Exclude<DrawerMode, "view">;
  open: boolean;
  initialValue: TeamFormState;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: TeamFormState) => void;
}) {
  const { t } = useTranslation("locale");
  const columns = useMemo(() => buildTeamColumns(t), [t]);

  return (
    <CDrawerForm
      open={open}
      width={560}
      title={
        mode === "add" ? t("Pages.Team.createTitle") : t("Pages.Team.editTitle")
      }
      columns={columns}
      values={initialValue}
      isLoading={submitting}
      showSubmit
      textSubmit={t("Pages.Team.save")}
      textCancel={t("Pages.Team.cancel")}
      onClose={onClose}
      onSubmit={({ value }: { value: TeamFormState; formApi: AnyFormApi }) =>
        onSubmit({
          teamCode: value.teamCode.trim(),
          teamName: value.teamName.trim(),
          description: value.description.trim(),
          status: value.status,
        })
      }
    />
  );
}

function TeamDetailModal({
  open,
  detail,
  loading,
  onClose,
  onOpenAddMember,
  onOpenEditMember,
  onRemoveMember,
}: {
  open: boolean;
  detail: TeamDetail | null | undefined;
  loading: boolean;
  onClose: () => void;
  onOpenAddMember: () => void;
  onOpenEditMember: (member: TeamMember) => void;
  onRemoveMember: (member: TeamMember) => void;
}) {
  const { t } = useTranslation("locale");

  const memberColumns = useMemo<ColumnsType<TeamMember>>(
    () => [
      {
        title: t("Components.Action"),
        key: "actions",
        width: 140,
        align: "center",
        render: (_value: unknown, member: TeamMember) => (
          <div className="action flex w-full items-center justify-center gap-2">
            <CTooltip title={t("Pages.Team.editMember")}>
              <button
                type="button"
                title={t("Pages.Team.editMember")}
                onClick={() => onOpenEditMember(member)}
              >
                <CSvgIcon name={EIcon.edit} className="primary" />
              </button>
            </CTooltip>
            <CTooltip title={t("Pages.Team.removeMember")}>
              <Popconfirm
                destroyOnHidden={true}
                title={t("Pages.Team.removeMemberConfirm")}
                onConfirm={() => onRemoveMember(member)}
                disabled={member.status !== "ACTIVE"}
              >
                <button
                  type="button"
                  title={t("Pages.Team.removeMember")}
                  disabled={member.status !== "ACTIVE"}
                  className={
                    member.status !== "ACTIVE"
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
      },
      {
        title: (
          <div className="w-full text-center">{t("Pages.Team.member")}</div>
        ),
        dataIndex: "pseudonym",
        key: "pseudonym",
        render: (_value: string, member: TeamMember) => (
          <div className="space-y-1">
            <p className="font-medium">{member.pseudonym}</p>
          </div>
        ),
      },
      {
        title: t("Pages.Team.role"),
        dataIndex: "roleName",
        key: "roleName",
        align: "center",
      },
      {
        title: t("Pages.Team.status"),
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (_value: string, member: TeamMember) => (
          <Badge
            variant="outline"
            className={getTeamStatusClass(member.status as string)}
          >
            {t(`Pages.Team.statusValues.${member.status}`)}
          </Badge>
        ),
      },
      {
        title: t("Pages.Team.updatedAt"),
        dataIndex: "updatedAt",
        key: "updatedAt",
        align: "center",
        render: (value: string | null) => formatDateTime(value),
      },
    ],
    [onOpenEditMember, onRemoveMember, t],
  );

  return (
    <Modal
      open={open}
      width={920}
      centered
      styles={{
        body: {
          height: "75vh",
          overflow: "hidden",
        },
      }}
      title={
        <div className="!text-[18px] !font-semibold !leading-none">
          {t("Pages.Team.detailTitle")}
        </div>
      }
      onCancel={onClose}
      destroyOnHidden
      footer={
        <div className="flex items-center justify-center gap-3">
          <CButton
            text={t("Pages.Team.cancel")}
            className="w-full border border-border !bg-white !text-black shadow-none sm:w-auto sm:min-w-36"
            onClick={onClose}
          />
        </div>
      }
      maskClosable={false}
    >
      <div className="flex h-full min-h-0 flex-col gap-4">
        {loading && (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            {t("Pages.Team.loading")}
          </div>
        )}
        {!loading && !detail && (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            {t("Pages.Team.detailEmpty")}
          </div>
        )}
        {!loading && detail && (
          <>
            <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.Team.teamCode")}
                </p>
                <p className="font-medium">{detail.team.teamCode}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.Team.teamName")}
                </p>
                <p className="font-medium">{detail.team.teamName}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.Team.description")}
                </p>
                <p>{detail.team.description || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.Team.status")}
                </p>
                <Badge
                  variant="outline"
                  className={getTeamStatusClass(detail.team.status)}
                >
                  {t(`Pages.Team.statusValues.${detail.team.status}`)}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.Team.memberCount")}
                </p>
                <p>{detail.team.memberCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.Team.createdAt")}
                </p>
                <p>{formatDateTime(detail.team.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.Team.createdBy")}
                </p>
                <p>{detail.team.createdBy || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.Team.updatedAt")}
                </p>
                <p>{formatDateTime(detail.team.updatedAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("Pages.Team.updatedBy")}
                </p>
                <p>{detail.team.updatedBy || "-"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="!text-[18px] !font-semibold !leading-none">
                  {t("Pages.Team.members")}
                </h3>
              </div>
              <CButton
                text={t("Pages.Team.addMember")}
                icon={<CSvgIcon name={EIcon.plus} size={12} />}
                className="h-10 px-5 !bg-primary text-primary-foreground"
                onClick={onOpenAddMember}
                disabled={detail.team.status !== "ACTIVE"}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <Table
                rowKey="teamMemberId"
                dataSource={detail.members}
                columns={memberColumns}
                pagination={false}
                size="middle"
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function TeamMemberModal({
  mode,
  open,
  detail,
  initialValue,
  loading,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: MemberDrawerMode;
  open: boolean;
  detail: TeamDetail | null | undefined;
  initialValue: TeamMemberFormState;
  loading: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: TeamMemberFormState) => void;
}) {
  const { t } = useTranslation("locale");
  const currentMemberKeys = useMemo(
    () => detail?.members.map((member) => member.memberKey) ?? [],
    [detail?.members],
  );
  const columns = useMemo(
    () =>
      buildMemberColumns(
        mode,
        detail?.memberOptions ?? [],
        detail?.roleOptions ?? [],
        currentMemberKeys,
        t,
      ),
    [currentMemberKeys, detail?.memberOptions, detail?.roleOptions, mode, t],
  );
  const formRef = useRef<AnyFormApi | null>(null);

  return (
    <Modal
      open={open}
      width={520}
      centered
      title={
        <div className="py-0.5 !text-[18px] font-semibold">
          {mode === "add"
            ? t("Pages.Team.addMemberTitle")
            : t("Pages.Team.updateMemberTitle")}
        </div>
      }
      onCancel={onClose}
      destroyOnHidden
      maskClosable={false}
      footer={
        <div className="flex items-center justify-end gap-3">
          <CButton
            text={t("Pages.Team.cancel")}
            className="w-full border border-border !bg-white !text-black shadow-none sm:w-auto sm:min-w-36"
            onClick={onClose}
          />
          <CButton
            text={t("Pages.Team.save")}
            className="w-full !bg-primary text-primary-foreground sm:w-auto sm:min-w-36"
            isLoading={loading || submitting}
            onClick={() => formRef.current?.handleSubmit()}
          />
        </div>
      }
    >
      <CForm
        ref={formRef}
        columns={columns}
        values={initialValue}
        isLoading={loading || submitting}
        onSubmit={({ value }: { value: any; formApi: AnyFormApi }) =>
          onSubmit(normalizeMemberForm(value))
        }
      />
    </Modal>
  );
}

export function TeamPage() {
  const { t } = useTranslation("locale");
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<TeamStatusFilter>("ACTIVE");
  const [statusDraft, setStatusDraft] = useState<TeamStatusFilter>("ACTIVE");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);

  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<Team | null>(null);
  const [drawerDraft, setDrawerDraft] =
    useState<TeamFormState>(defaultTeamFormState);

  const [memberDrawerMode, setMemberDrawerMode] =
    useState<MemberDrawerMode | null>(null);
  const [memberTarget, setMemberTarget] = useState<TeamMember | null>(null);
  const [memberDraft, setMemberDraft] = useState<TeamMemberFormState>(
    defaultMemberFormState,
  );

  const listQuery = useQuery({
    queryKey: ["teams", keyword, status, page, size],
    queryFn: () =>
      endpoints.teams.list({
        keyword: keyword || undefined,
        status,
        page,
        size,
      }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const selectedQuery = useQuery({
    queryKey: ["team", selectedId],
    queryFn: () => endpoints.teams.get(selectedId!),
    enabled: detailOpen && !!selectedId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const detail = selectedQuery.data;

  const createMutation = useMutation({
    mutationFn: (body: {
      teamCode: string;
      teamName: string;
      description: string;
    }) => endpoints.teams.create(body),
    onSuccess: async () => {
      message.success(t("Pages.Team.createSuccess"));
      setDrawerMode(null);
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: unknown) => {
      message.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("Pages.Team.unknownError"),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      teamId,
      body,
    }: {
      teamId: string;
      body: {
        teamCode: string;
        teamName: string;
        description: string;
        status: TeamStatus | string;
        version: number;
      };
    }) => endpoints.teams.update(teamId, body),
    onSuccess: async (updated) => {
      message.success(t("Pages.Team.updateSuccess"));
      setDrawerMode(null);
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      await queryClient.invalidateQueries({
        queryKey: ["team", updated.teamId],
      });
    },
    onError: (error: unknown) => {
      message.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("Pages.Team.unknownError"),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ teamId, version }: { teamId: string; version: number }) =>
      endpoints.teams.softDelete(teamId, { version }),
    onSuccess: async (deleted) => {
      message.success(t("Pages.Team.deleteSuccess"));
      if (selectedId === deleted.teamId) {
        setDetailOpen(false);
        setSelectedId(null);
      }
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      await queryClient.invalidateQueries({
        queryKey: ["team", deleted.teamId],
      });
    },
    onError: (error: unknown) => {
      message.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("Pages.Team.unknownError"),
      );
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({
      teamId,
      body,
    }: {
      teamId: string;
      body: { memberKey: string; roleId: string };
    }) => endpoints.teams.addMember(teamId, body),
    onSuccess: async (created) => {
      message.success(t("Pages.Team.memberAddSuccess"));
      setMemberDrawerMode(null);
      setMemberTarget(null);
      setMemberDraft(defaultMemberFormState);
      await queryClient.invalidateQueries({
        queryKey: ["team", created.teamId],
      });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: unknown) => {
      message.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("Pages.Team.unknownError"),
      );
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({
      teamId,
      teamMemberId,
      body,
    }: {
      teamId: string;
      teamMemberId: string;
      body: { roleId: string; version: number };
    }) => endpoints.teams.updateMemberRole(teamId, teamMemberId, body),
    onSuccess: async (updated) => {
      message.success(t("Pages.Team.memberUpdateSuccess"));
      setMemberDrawerMode(null);
      setMemberTarget(null);
      setMemberDraft(defaultMemberFormState);
      await queryClient.invalidateQueries({
        queryKey: ["team", updated.teamId],
      });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: unknown) => {
      message.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("Pages.Team.unknownError"),
      );
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({
      teamId,
      teamMemberId,
      version,
    }: {
      teamId: string;
      teamMemberId: string;
      version: number;
    }) => endpoints.teams.removeMember(teamId, teamMemberId, { version }),
    onSuccess: async (deleted) => {
      message.success(t("Pages.Team.memberRemoveSuccess"));
      await queryClient.invalidateQueries({
        queryKey: ["team", deleted.teamId],
      });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: unknown) => {
      message.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("Pages.Team.unknownError"),
      );
    },
  });

  const filterColumns = useMemo<IForm[]>(
    () => [
      {
        name: "status",
        title: t("Pages.Team.status"),
        formItem: {
          type: EFormType.select,
          col: 12,
          className: "w-full",
          allowClear: false,
          list: [
            { value: "ACTIVE", label: t("Pages.Team.statusValues.ACTIVE") },
            { value: "DELETED", label: t("Pages.Team.statusValues.DELETED") },
            { value: "ALL", label: t("Pages.Team.all") },
          ],
        },
      },
    ],
    [t],
  );

  const teamTableColumns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "teamCode",
        title: t("Pages.Team.teamCode"),
        sortKey: "teamCode",
      },
      {
        name: "teamName",
        title: t("Pages.Team.teamName"),
        sortKey: "teamName",
      },
      {
        name: "memberCount",
        title: t("Pages.Team.memberCount"),
        sortKey: "memberCount",
        tableItem: {
          align: ETableAlign.center,
        },
      },
      {
        name: "status",
        title: t("Pages.Team.status"),
        sortKey: "status",
        tableItem: {
          align: ETableAlign.center,
          render: (_value: string, team: Team) => (
            <Badge
              variant="outline"
              className={getTeamStatusClass(team.status)}
            >
              {t(`Pages.Team.statusValues.${team.status}`)}
            </Badge>
          ),
        },
      },
      {
        name: "updatedAt",
        title: t("Pages.Team.updatedAt"),
        sortKey: "updatedAt",
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => formatDateTime(value),
        },
      },
    ],
    [t],
  );

  const currentError = listQuery.error ?? selectedQuery.error;

  const openCreateForm = () => {
    setDrawerDraft(defaultTeamFormState);
    setEditingTarget(null);
    setDrawerMode("add");
    setDetailOpen(false);
    setSelectedId(null);
    setMemberDrawerMode(null);
    setMemberTarget(null);
  };

  const openViewDrawer = (team: Team) => {
    setEditingTarget(null);
    setSelectedId(team.teamId);
    setDetailOpen(true);
    setDrawerMode(null);
    setMemberDrawerMode(null);
    setMemberTarget(null);
  };

  const openEditDrawer = (team: Team) => {
    setDrawerDraft({
      teamCode: team.teamCode,
      teamName: team.teamName,
      description: team.description ?? "",
      status: (team.status as TeamStatus) ?? "ACTIVE",
    });
    setEditingTarget(team);
    setSelectedId(team.teamId);
    setDrawerMode("edit");
    setDetailOpen(false);
    setMemberDrawerMode(null);
    setMemberTarget(null);
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingTarget(null);
    setDrawerDraft(defaultTeamFormState);
  };

  const closeDetailDrawer = () => {
    setDetailOpen(false);
    setSelectedId(null);
    setMemberDrawerMode(null);
    setMemberTarget(null);
    setMemberDraft(defaultMemberFormState);
  };

  const submitDrawer = (values: TeamFormState) => {
    const normalizedValues: TeamFormState = {
      teamCode: values.teamCode.trim(),
      teamName: values.teamName.trim(),
      description: values.description.trim(),
      status: values.status,
    };

    if (drawerMode === "add") {
      createMutation.mutate({
        teamCode: normalizedValues.teamCode,
        teamName: normalizedValues.teamName,
        description: normalizedValues.description,
      });
      return;
    }

    if (drawerMode === "edit" && editingTarget) {
      updateMutation.mutate({
        teamId: editingTarget.teamId,
        body: {
          teamCode: normalizedValues.teamCode,
          teamName: normalizedValues.teamName,
          description: normalizedValues.description,
          status: normalizedValues.status,
          version: editingTarget.version,
        },
      });
    }
  };

  const openAddMemberDrawer = () => {
    if (!selectedId) return;
    setMemberDraft(defaultMemberFormState);
    setMemberTarget(null);
    setMemberDrawerMode("add");
  };

  const openEditMemberDrawer = (member: TeamMember) => {
    setMemberDraft({
      memberKey: member.memberKey,
      roleId: member.roleId,
    });
    setMemberTarget(member);
    setMemberDrawerMode("edit");
  };

  const closeMemberDrawer = () => {
    setMemberDrawerMode(null);
    setMemberTarget(null);
    setMemberDraft(defaultMemberFormState);
  };

  const submitMemberDrawer = (values: TeamMemberFormState) => {
    if (!selectedId) return;
    if (memberDrawerMode === "add") {
      const normalizedValues = normalizeMemberForm(values);
      addMemberMutation.mutate({
        teamId: selectedId,
        body: {
          memberKey: normalizedValues.memberKey,
          roleId: normalizedValues.roleId,
        },
      });
      return;
    }

    if (memberDrawerMode === "edit" && memberTarget) {
      const normalizedValues = normalizeMemberForm(values);
      updateMemberMutation.mutate({
        teamId: selectedId,
        teamMemberId: memberTarget.teamMemberId,
        body: {
          roleId: normalizedValues.roleId,
          version: memberTarget.version,
        },
      });
    }
  };

  const handleDelete = (team: Team) => {
    deleteMutation.mutate({
      teamId: team.teamId,
      version: team.version,
    });
  };

  const handleRemoveMember = (member: TeamMember) => {
    if (!selectedId) return;
    removeMemberMutation.mutate({
      teamId: selectedId,
      teamMemberId: member.teamMemberId,
      version: member.version,
    });
  };

  useEffect(() => {
    if (!currentError) return;
    const toastMessage =
      currentError instanceof ApiError
        ? t(currentError.message, { defaultValue: currentError.message })
        : t("Pages.Team.unknownError");
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
                    {t("Pages.Team.title")}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2" />
            </div>

            <hr className="my-4 border-border/70" />

            <CDrawerForm
              open={filterOpen}
              width={380}
              title={t("Pages.Team.filters")}
              columns={filterColumns}
              values={{ status: statusDraft }}
              showSubmit
              textSubmit={t("Pages.Team.apply")}
              textCancel={t("Pages.Team.cancel")}
              onClose={() => {
                setStatusDraft(status);
                setFilterOpen(false);
              }}
              onSubmit={({ value }) => {
                const nextStatus = (value.status ??
                  "ACTIVE") as TeamStatusFilter;
                setStatus(nextStatus);
                setStatusDraft(nextStatus);
                setPage(0);
                setFilterOpen(false);
              }}
            />

            <TeamFormDrawer
              mode={drawerMode === "edit" ? "edit" : "add"}
              open={drawerMode !== null}
              initialValue={drawerDraft}
              submitting={createMutation.isPending || updateMutation.isPending}
              onClose={closeDrawer}
              onSubmit={submitDrawer}
            />

            <TeamDetailModal
              open={detailOpen}
              detail={detail}
              loading={selectedQuery.isLoading}
              onClose={closeDetailDrawer}
              onOpenAddMember={openAddMemberDrawer}
              onOpenEditMember={openEditMemberDrawer}
              onRemoveMember={handleRemoveMember}
            />

            <TeamMemberModal
              mode={memberDrawerMode ?? "add"}
              open={memberDrawerMode !== null}
              detail={detail}
              initialValue={memberDraft}
              loading={selectedQuery.isLoading}
              submitting={
                addMemberMutation.isPending || updateMemberMutation.isPending
              }
              onClose={closeMemberDrawer}
              onSubmit={submitMemberDrawer}
            />

            <div className="mt-4" />

            <div id="team-list-table">
              <CServerTable
                columns={teamTableColumns}
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
                      text={t("Pages.Team.filters")}
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
                  labelAdd: t("Pages.Team.create"),
                  onAdd: () => openCreateForm(),
                  name: (row: Team) => row.teamName,
                  render: (team: Team) => (
                    <div className="flex items-center gap-2">
                      <CTooltip title={t("Pages.Team.detailTitle")}>
                        <button
                          type="button"
                          title={t("Pages.Team.detailTitle")}
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewDrawer(team);
                          }}
                        >
                          <CSvgIcon name={EIcon.eye} className="primary" />
                        </button>
                      </CTooltip>

                      <CTooltip title={t("Pages.Team.edit")}>
                        <button
                          type="button"
                          title={t("Pages.Team.edit")}
                          disabled={team.status === "DELETED"}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDrawer(team);
                          }}
                          className={
                            team.status === "DELETED"
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }
                        >
                          <CSvgIcon name={EIcon.edit} className="primary" />
                        </button>
                      </CTooltip>

                      <CTooltip title={t("Pages.Team.delete")}>
                        <Popconfirm
                          destroyOnHidden={true}
                          title={t("Pages.Team.deleteConfirm")}
                          onConfirm={() => handleDelete(team)}
                          disabled={team.status === "DELETED"}
                        >
                          <button
                            type="button"
                            title={t("Pages.Team.delete")}
                            disabled={
                              team.status === "DELETED" ||
                              deleteMutation.isPending
                            }
                            className={
                              team.status === "DELETED" ||
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
