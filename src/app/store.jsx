import { configureStore } from '@reduxjs/toolkit';
import TenantsSlice from '../features/Tenants/TenantsSlice';

export const store = configureStore({
  reducer: {
    tenantsData: TenantsSlice,
  },
});
