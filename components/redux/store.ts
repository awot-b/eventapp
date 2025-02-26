import { configureStore } from "@reduxjs/toolkit";

import eventReducer from "./eventSlice"; // Ensure correct path

export const store = configureStore({
  reducer: {
    events: eventReducer, // Ensure eventSlice has a valid default export
  },
});

// Infer types for better TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
