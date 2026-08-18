import type { EStatusState } from "@/enums";
import type { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import type { StateGlobal } from "./state";

/**
 * RReducer class represents a reducer for global state.
 * It handles pending, fulfilled, and rejected actions.
 */
/**
 * RGlobal is an object that contains various service methods for global functionality.
 * Each property represents a specific service method.
 */
type RGlobalReducerHook = {
  reducer: (builder: ActionReducerMapBuilder<StateGlobal>) => void;
  action: (...args: any[]) => any;
};

const noopReducer = () => {};
const noopAction = (_payload?: any) => ({ type: "noop" });

export const RGlobal: Record<string, RGlobalReducerHook> = {
  getProfile: { reducer: noopReducer, action: noopAction },
  putProfile: { reducer: noopReducer, action: noopAction },
  postLogin: { reducer: noopReducer, action: noopAction },
  postRegister: { reducer: noopReducer, action: noopAction },
  patchForgottenPassword: { reducer: noopReducer, action: noopAction },
  postOtpConfirmation: { reducer: noopReducer, action: noopAction },
  patchResetPassword: { reducer: noopReducer, action: noopAction },
  getHardData: { reducer: noopReducer, action: noopAction },
  patchActivateAccount: { reducer: noopReducer, action: noopAction },
  patchChangePassword: { reducer: noopReducer, action: noopAction },
  getCurrentRole: { reducer: noopReducer, action: noopAction },
};
/**
 * Represents the global state of the application.
 */
export interface GlobalState {
  isLoading?: boolean;
  status?: EStatusState;
}
