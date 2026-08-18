export interface IMUser {
  id?: string | number;
  email?: string;
  name?: string;
  username?: string;
  role?: string;
  avatarUrl?: string;
  [key: string]: any;
}

export interface IResetPassword {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
  [key: string]: any;
}

export interface IMChangePassword {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  [key: string]: any;
}

export interface IMHashData {
  [key: string]: any;
}
