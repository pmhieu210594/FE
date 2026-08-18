import { EFormRuleType, EFormType } from "@/enums";
import type { IForm } from "@/interfaces";
import type { RoleOption } from "@/lib/api";
import type { DrawerMode } from "./types";

type TFunction = (key: string, props?: any) => string;

export function buildAccountFormColumns(
  mode: DrawerMode,
  roles: RoleOption[],
  t: TFunction,
): IForm[] {
  const isViewMode = mode === "view";
  const isCreateMode = mode === "add";
  const roleOptions = roles.map((role) => ({
    value: role.roleId,
    label: role.roleName,
  }));

  const columns: IForm[] = [
    {
      name: "username",
      title: t("Pages.UserAccounts.fields.username"),
      formItem: {
        col: 12,
        type: EFormType.text,
        maxLength: 100,
        disabled: () => !isCreateMode || isViewMode,
        rules: [
          { type: EFormRuleType.required },
          { type: EFormRuleType.max, value: 100 },
          { type: EFormRuleType.noXss },
        ],
      },
    },
    {
      name: "roleId",
      title: t("Pages.UserAccounts.fields.role"),
      formItem: {
        type: EFormType.select,
        col: 6,
        maxLength: 50,
        className: "user-account-select",
        list: roleOptions,
        allowClear: false,
        disabled: () => isViewMode,
        rules: [
          { type: EFormRuleType.required },
          { type: EFormRuleType.max, value: 50 },
        ],
      },
    },
    {
      name: "status",
      title: t("Pages.UserAccounts.fields.status"),
      formItem: {
        type: EFormType.select,
        col: 6,
        maxLength: 50,
        className: "user-account-select",
        allowClear: false,
        disabled: () => isViewMode,
        list: [
          { value: "ACTIVE", label: t("Pages.UserAccounts.status.ACTIVE") },
          {
            value: "INACTIVE",
            label: t("Pages.UserAccounts.status.INACTIVE"),
          },
        ],
        rules: [{ type: EFormRuleType.max, value: 50 }],
      },
    },
    {
      name: "fullname",
      title: t("Pages.UserAccounts.fields.member"),
      formItem: {
        col: 6,
        type: EFormType.text,
        maxLength: 250,
        disabled: () => isViewMode,
        rules: [
          { type: EFormRuleType.max, value: 250 },
          { type: EFormRuleType.noXss },
        ],
      },
    },
    {
      name: "email",
      title: t("Pages.UserAccounts.fields.email"),
      formItem: {
        col: 6,
        type: EFormType.text,
        maxLength: 100,
        validateDebounceMs: 3000,
        text: {
          normalizeInput: (value) => value.slice(0, 100),
        },
        disabled: () => isViewMode,
        rules: [
          { type: EFormRuleType.email },
          { type: EFormRuleType.max, value: 100 },
        ],
      },
    },
  ];

  if (isCreateMode) {
    columns.push(
      {
        name: "password",
        title: t("Pages.UserAccounts.fields.password"),
        formItem: {
          type: EFormType.password,
          col: 6,
          maxLength: 100,
          rules: [
            { type: EFormRuleType.required },
            { type: EFormRuleType.max, value: 100 },
          ],
        },
      },
      {
        name: "confirmPassword",
        title: t("Pages.UserAccounts.fields.confirmPassword"),
        formItem: {
          type: EFormType.password,
          col: 6,
          maxLength: 100,
          rules: [
            { type: EFormRuleType.required },
            { type: EFormRuleType.max, value: 100 },
          ],
        },
      },
    );
  }

  return columns;
}

export function buildFilterColumns(roles: RoleOption[], t: TFunction): IForm[] {
  return [
    {
      name: "status",
      title: t("Pages.UserAccounts.fields.status"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "user-account-select",
        allowClear: false,
        list: [
          { value: "ALL", label: t("Pages.UserAccounts.filter.all") },
          { value: "ACTIVE", label: t("Pages.UserAccounts.status.ACTIVE") },
          {
            value: "INACTIVE",
            label: t("Pages.UserAccounts.status.INACTIVE"),
          },
        ],
      },
    },
    {
      name: "roleId",
      title: t("Pages.UserAccounts.fields.role"),
      formItem: {
        type: EFormType.select,
        col: 12,
        className: "user-account-select",
        allowClear: true,
        isMultiple: true,
        list: roles.map((role) => ({
          value: role.roleId,
          label: role.roleName,
        })),
      },
    },
  ];
}

export function buildResetColumns(t: TFunction): IForm[] {
  return [
    {
      name: "password",
      title: t("Pages.UserAccounts.fields.newPassword"),
      formItem: {
        type: EFormType.password,
        col: 12,
        rules: [{ type: EFormRuleType.required }],
      },
    },
    {
      name: "confirmPassword",
      title: t("Pages.UserAccounts.fields.confirmPassword"),
      formItem: {
        type: EFormType.password,
        col: 12,
        rules: [{ type: EFormRuleType.required }],
      },
    },
  ];
}
