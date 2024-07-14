import { createSlice } from '@reduxjs/toolkit';

const landLordSlice = createSlice({
  name: 'landLord',
  initialState: {
    landLords: [],
  },
  reducers: {
    setLandLord: (state, action) => {
      state.landLords = action.payload;
    },
    resetLandLord: (state) => {
      state.landLords = [];
    },
  },
});
export const { setLandLord, resetLandLord } = landLordSlice.actions;
export default landLordSlice.reducer;
