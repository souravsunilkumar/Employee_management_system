import { configureStore } from "@reduxjs/toolkit";
import { AuthSlice } from "./slice/auth.slice";
import taskReducer from "./taskSlice";
import aiReducer from "./aiSlice";

export const store = configureStore({
  reducer: {
    [AuthSlice.name]: AuthSlice.reducer,
    tasks: taskReducer,
    ai: aiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
