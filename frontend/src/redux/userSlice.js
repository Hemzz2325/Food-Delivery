// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,       // logged in user
  city: null,
  state: null,
  address: null,
  shopInMyCity: null,   // shops in user’s city
  itemsInMyCity: null,  // items in user’s city
  currentOrder: null

};

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
    setShopInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    setCurrentOrder: (state, action) => {
  state.currentOrder = action.payload;
},

    clearUserData: (state) => {
      state.userData = null;
      state.city = null;
      state.state = null;
      state.address = null;
      state.shopInMyCity = null;
      state.itemsInMyCity = null;
    },
  },
});

export const {
  setUserData,
  setCity,
  setState,
  setAddress,
  setShopInMyCity,
  setItemsInMyCity,
  clearUserData,
   setCurrentOrder,
} = userSlice.actions;

// Backward compatibility (if older code used these names)
export const setCurrentCity = setCity;
export const setCurrentState = setState;
export const setCurrentAddress = setAddress;

export default userSlice.reducer;
