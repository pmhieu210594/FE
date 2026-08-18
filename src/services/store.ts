import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { crudSlice } from "./crud";
import { globalSlice } from "./global";

export const rootReducer = combineReducers({
  [globalSlice.name]: globalSlice.reducer,
  [crudSlice.name]: crudSlice.reducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};

export type AppStore = ReturnType<typeof setupStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
