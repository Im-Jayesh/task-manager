import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tasksReducer from './taskSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      tasks: tasksReducer,
    },
  });
};