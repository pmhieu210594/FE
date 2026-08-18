import { createSlice } from "@reduxjs/toolkit";
import i18n from "i18next";

import { RGlobal } from "./reducer";
import {
  checkLanguage,
  initialStateGlobal,
  nameGlobal,
  type StateGlobal,
} from "./state";
import { useAppDispatch, useTypedSelector } from "../hooks";

/**
 * Represents the global slice of the application state.
 * @name globalSlice
 * @type {Slice<StateGlobal, SliceCaseReducers<StateGlobal>, string>}
 */
export const globalSlice = createSlice({
  name: nameGlobal,
  initialState: initialStateGlobal,
  reducers: {
    set: (state, action) => {
      Object.keys(action.payload).forEach((key) => {
        state[key] = action.payload[key as keyof StateGlobal];
      });
    },
    setLanguage: (state, action) => {
      if (action.payload !== state.language) {
        const { language, locale, localeDate } = checkLanguage(action.payload);
        i18n.changeLanguage(language);
        state.locale = locale;
        state.language = language;
        state.localeDate = localeDate;
      }
    },
  },
  extraReducers: (builder) => {
    RGlobal.getCurrentRole.reducer(builder);
  },
});

/**
 * Returns an object with methods for interacting with the global state.
 *
 * @returns An object with methods for interacting with the global state.
 */
export const SGlobal = () => {
  const dispatch = useAppDispatch();
  return {
    ...(useTypedSelector((state) => state[nameGlobal]) as StateGlobal),
    set: (values: StateGlobal) => dispatch(globalSlice.actions.set(values)),
    setLanguage: (value: string) =>
      dispatch(globalSlice.actions.setLanguage(value)),
    reset: () => dispatch(globalSlice.actions.set(initialStateGlobal)),
    logout: () => {
      localStorage.clear();
      dispatch(globalSlice.actions.set(initialStateGlobal));
    },

    getCurrentRole: () => dispatch(RGlobal.getCurrentRole.action()),
  };
};
