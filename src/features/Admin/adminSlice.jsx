import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'adminSlice',
  initialState: {
    adminDataValue: null,
  },
  reducers: {
    setAdmin: (state, action) => {
      state.adminDataValue = action.payload;
    },
    resetAdmin: (state) => {
      state.adminDataValue = null;
    },
  },
});
export const { setAdmin, resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;
