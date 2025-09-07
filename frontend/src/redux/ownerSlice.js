import { createSlice } from "@reduxjs/toolkit";

const initialState = { userData: null, city: null };

const ownerSlice = createSlice({
  name: "owner",
  initialState:{
    myShopData:null,
    
  },
  reducers: {
    setmyShopData: (state, action) => {
      state.myShopData = action.payload;
    },
    
    clearUserData: (state) => {
      state.userData = null;
    },
  },
});

export const { setUserData, setCity, clearUserData } = ownerSlice.actions;
export default  ownerSlice.reducer;
