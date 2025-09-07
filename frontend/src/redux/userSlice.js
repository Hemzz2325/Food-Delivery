import { createSlice } from "@reduxjs/toolkit";

const initialState = { userData: null, city: null, state: null, address: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCity: (state, action) => {
      state.city = action.payload;
    },
    setState: (state, action) => {
      state.state = action.payload;
    },
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    clearUserData: (state) => {
      state.userData = null;
    },
  },
});

export const { setUserData, setCity, setState, setAddress, clearUserData } = userSlice.actions;
// Backwards-compatible aliases (some files/hooks previously used these names)
export const setCurrentCity = setCity;
export const setCurrentState = setState;
export const setCurrentAddress = setAddress;
export default userSlice.reducer;
