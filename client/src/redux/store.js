import { configureStore } from "@reduxjs/toolkit";
import { AuthSlice } from "./slice/auth.slice";

export const store = configureStore({
  reducer: {
    [AuthSlice.name]: AuthSlice.reducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
