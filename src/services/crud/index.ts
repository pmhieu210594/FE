import {
  createSlice,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { IPaginationQuery } from "@/interfaces";
import { RCurd } from "./reducer";
import { initialStateCrud, nameCrud, type StateCrud } from "./state";
import { useAppDispatch, useTypedSelector } from "../hooks";

/**
 * Represents a slice for CRUD operations.
 *
 * @remarks
 * This slice is used to handle CRUD operations in the application.
 *
 * @public
 */
export const crudSlice = createSlice({
  name: nameCrud,
  initialState: initialStateCrud,
  reducers: {
    set: (state, action: PayloadAction<Partial<StateCrud>>) => {
      const payload = action.payload;
      for (const key in payload) {
        state[key as keyof StateCrud] = payload[key as keyof StateCrud];
      }
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<StateCrud>) => {
    RCurd.get.reducer(builder);
  },
});

/**
 * SCrud is a utility function that provides CRUD operations for a specific API endpoint.
 *
 * @template T - The type of data being handled by the CRUD operations.
 * @param {string} keyApi - The key representing the API endpoint.
 * @param {string} [keyApi2] - An optional second key representing the API endpoint.
 * @returns {Object} - An object containing various CRUD operations.
 */
export const SCrud = <T>(keyApi: string) => {
  const dispatch = useAppDispatch();
  return {
    ...(useTypedSelector((state) => state[nameCrud]) as StateCrud<T>),
    set: (values: StateCrud<T>) =>
      dispatch(crudSlice.actions.set(values as StateCrud)),
    reset: () => dispatch(crudSlice.actions.set(initialStateCrud)),

    get: (
      params: IPaginationQuery<T>,
      format?: (item: T, index: number) => void,
    ) =>
      dispatch(
        RCurd.get.action({
          params: params as IPaginationQuery,
          keyApi,
          format,
        }),
      ),
  };
};
