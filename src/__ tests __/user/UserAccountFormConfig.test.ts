import { describe, expect, it } from "vitest";
import {
  buildAccountFormColumns,
  buildFilterColumns,
  buildResetColumns,
} from "@/pages/user/form-config";
import { normalizeAccountForm, validatePassword } from "@/pages/user/types";

const t = (key: string) => key;
const roles = [
  { roleId: "role-admin", roleName: "ADMIN" },
  { roleId: "role-user", roleName: "USER" },
];

describe("User Management form config", () => {
  it("requires role but intentionally does not expose team assignment fields", () => {
    const names = buildAccountFormColumns("add", roles, t).map(
      (item) => item.name,
    );

    expect(names).toContain("username");
    expect(names).toContain("roleId");
    expect(names).toContain("password");
    expect(names).toContain("confirmPassword");
    expect(names).not.toContain("teamId");
    expect(names).not.toContain("teamName");
  });

  it("keeps username read-only and password outside edit mode", () => {
    const columns = buildAccountFormColumns("edit", roles, t);
    const names = columns.map((item) => item.name);
    const username = columns.find((item) => item.name === "username");

    expect(names).toContain("roleId");
    expect(names).not.toContain("password");
    expect(names).not.toContain("confirmPassword");
    expect(username?.formItem?.disabled?.({ value: "user01" })).toBe(true);
  });

  it("builds reset password fields only for password and confirmation", () => {
    const names = buildResetColumns(t).map((item) => item.name);

    expect(names).toEqual(["password", "confirmPassword"]);
  });

  it("supports filtering by status and role without team filters", () => {
    const names = buildFilterColumns(roles, t).map((item) => item.name);

    expect(names).toEqual(["status", "roleId"]);
    expect(names).not.toContain("teamId");
  });

  it("validates password strength and confirmation", () => {
    expect(validatePassword("short", "short", t)).toBe(
      "Pages.UserAccounts.validation.passwordMin",
    );
    expect(validatePassword("Password1", "Password1", t)).toBe(
      "Pages.UserAccounts.validation.passwordPattern",
    );
    expect(validatePassword("Password1!", "Password2!", t)).toBe(
      "Pages.UserAccounts.validation.passwordMismatch",
    );
    expect(validatePassword("Password1!", "Password1!", t)).toBeNull();
  });

  it("normalizes account form input before submit", () => {
    expect(
      normalizeAccountForm({
        username: " user01 ",
        fullname: " User One ",
        email: " user01@example.com ",
        roleId: "role-user",
        status: "ACTIVE",
        password: "Password1!",
        confirmPassword: "Password1!",
      }),
    ).toMatchObject({
      username: "user01",
      fullname: "User One",
      email: "user01@example.com",
      roleId: "role-user",
    });
  });
});
