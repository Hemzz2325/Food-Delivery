// src/redux/ownerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  myShopData: null,   // holds shop info + items
  loading: false,
  error: null,
};

const ownerSlice = createSlice({
  name: "owner",
  initialState,
  reducers: {
    setMyShopData: (state, action) => {
      state.myShopData = action.payload;
      state.error = null;
    },
    addItemToShop: (state, action) => {
      if (state.myShopData) {
        state.myShopData.items = state.myShopData.items
          ? [...state.myShopData.items, action.payload]
          : [action.payload];
      }
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearShopData: (state) => {
      state.myShopData = null;
      state.error = null;
    },
  },
});

export const { setMyShopData, addItemToShop, setLoading, setError, clearShopData } =
  ownerSlice.actions;

export default ownerSlice.reducer;
