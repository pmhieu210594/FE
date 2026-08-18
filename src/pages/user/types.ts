import type { UserAccount } from "@/lib/api";

export type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
export type AccountStatus = "ACTIVE" | "INACTIVE";
export type DrawerMode = "add" | "edit" | "view";

export type AccountFormState = {
  username: string;
  fullname: string;
  email: string;
  roleId: string;
  status: AccountStatus;
  password: string;
  confirmPassword: string;
};

export type ResetFormState = {
  password: string;
  confirmPassword: string;
};

export const defaultAccountForm: AccountFormState = {
  username: "",
  fullname: "",
  email: "",
  roleId: "",
  status: "ACTIVE",
  password: "",
  confirmPassword: "",
};

export const defaultResetForm: ResetFormState = {
  password: "",
  confirmPassword: "",
};

export const statusBadgeClass: Record<AccountStatus, string> = {
  ACTIVE: "border-transparent bg-blue-600 text-white",
  INACTIVE: "border-transparent bg-slate-600 text-white",
};

export function toStatus(account: UserAccount): AccountStatus {
  return account.isActive ? "ACTIVE" : "INACTIVE";
}

export function validatePassword(
  password: string,
  confirmPassword: string,
  t: (key: string, props?: any) => string,
) {
  if (password.length < 8) {
    return t("Pages.UserAccounts.validation.passwordMin");
  }
  if (
    !/[A-Za-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[#?!@$%)(^&*+_-]/.test(password)
  ) {
    return t("Pages.UserAccounts.validation.passwordPattern");
  }
  if (password !== confirmPassword) {
    return t("Pages.UserAccounts.validation.passwordMismatch");
  }
  return null;
}

export function normalizeAccountForm(
  values: AccountFormState,
): AccountFormState {
  return {
    ...values,
    username: values.username.trim(),
    fullname: values.fullname.trim(),
    email: values.email.trim(),
  };
}
