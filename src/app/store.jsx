import { configureStore } from '@reduxjs/toolkit';
import TenantsSlice from '../features/Tenants/TenantsSlice';
import adminSlice from '../features/Admin/adminSlice';
import LandLordSlice from '../features/Landlords/LandLordSlice';

export const store = configureStore({
  reducer: {
    tenantsData: TenantsSlice,
    landlordsData: LandLordSlice,
    adminData: adminSlice,
  },
});
