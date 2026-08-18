import { EStatusState } from "@/enums";
import type { IResponses } from "@/interfaces";
import type { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import type { StateCrud } from "./state";

/**
 * RReducer class represents a reducer for handling actions in the application.
 * It provides methods for handling pending, fulfilled, and rejected actions.
 */
export class RCrudReducer {
  public action: any;
  public reducer: (builder: ActionReducerMapBuilder<StateCrud>) => void;
  public pending = (_state: StateCrud, _action: any) => {};
  public fulfilled = (_state: StateCrud, _action: any) => {};
  public rejected = (_state: StateCrud, _action: any) => {};
  public constructor() {
    this.reducer = (builder: ActionReducerMapBuilder<StateCrud>) => {
      builder
        .addCase(this.action.pending, (state, action) => {
          state.isLoading = true;
          state.status = EStatusState.idle;
          this.pending(state, action);
        })

        .addCase(this.action.fulfilled, (state, action) => {
          state.isLoading = false;
          this.fulfilled(state, action);
        })

        .addCase(this.action.rejected, (state, action) => {
          state.isLoading = false;
          this.rejected(state, action);
        });
    };
  }
}

/**
 * RCurd is an object that contains various CRUD operations for a specific resource.
 * Each property represents a CRUD operation with a corresponding method.
 */
const noopReducer = (_builder: ActionReducerMapBuilder<StateCrud>) => {};
const noopAction = (_payload?: any) => ({ type: "noop" });

export const RCurd = {
  get: {
    reducer: noopReducer,
    action: noopAction,
  },
};
/**
 * Represents the state of a CRUD operation.
 *
 * @template T - The type of data being operated on.
 */
export interface CurdState<T> {
  isLoading?: boolean;
  status?: EStatusState;
  time?: number;
  keepUnusedDataFor?: number;
  queryParams?: string;
  result?: IResponses<T[]>;
  data?: T;
  isVisible?: boolean;
}
