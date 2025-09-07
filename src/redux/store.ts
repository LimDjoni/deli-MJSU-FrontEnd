import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import sidebarReducer from './features/setSidebarMenu';
import backlogReducer from './features/backlogSlice';

const persistConfig = {
  key: 'auth',
  storage,
};

const persistedAuth = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuth,
    sidebar: sidebarReducer, // 👈 Add this line
    backlog: backlogReducer, // ✅ register the new slice here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch;