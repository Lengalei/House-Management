import { createSlice } from '@reduxjs/toolkit';

const tenantSlice = createSlice({
  name: 'tenants',
  initialState: {
    tenants: [],
  },
  reducers: {
    setTenants: (state, action) => {
      state.tenants = action.payload;
    },
  },
});
export const { setTenants } = tenantSlice.actions;
export default tenantSlice.reducer;
