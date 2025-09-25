// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  city: null,
  state: null,
  address: null,
  shopsInMyCity: null,
  itemsInMyCity: null,
  currentOrder: null,
  cart: [],
  categories: [
    "breakfast","lunch","dinner","snacks","drinks","south indian","north indian",
    "punjabi","chinese","juices","desserts","sandwich","burger","pizzas"
  ]
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (s,a)=>{ s.userData=a.payload; },
    setCity: (s,a)=>{ s.city=a.payload; },
    setState: (s,a)=>{ s.state=a.payload; },
    setAddress: (s,a)=>{ s.address=a.payload; },
    setShopsInMyCity: (s,a)=>{ s.shopsInMyCity=a.payload; },
    setItemsInMyCity: (s,a)=>{ s.itemsInMyCity=a.payload; },
    setCurrentOrder: (s,a)=>{ s.currentOrder=a.payload; },

    // CART
    addToCart: (state, action) => {
      const item = action.payload; // full item doc with _id,name,image,price
      const existing = state.cart.find(ci => ci._id === item._id);
      if (existing) {
        existing.quantity = item.quantity || existing.quantity + 1;
      } else {
        state.cart.push({ ...item, quantity: item.quantity || 1 });
      }
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.cart = state.cart.filter(ci => ci._id !== itemId);
    },
    updateCartQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const it = state.cart.find(ci => ci._id === itemId);
      if (it) {
        if (quantity <= 0) state.cart = state.cart.filter(ci => ci._id !== itemId);
        else it.quantity = quantity;
      }
    },
    clearCart: (state) => { state.cart = []; },
    clearUserData: (state) => {
      state.userData = null;
      state.city = null;
      state.state = null;
      state.address = null;
      state.shopsInMyCity = null;
      state.itemsInMyCity = null;
      state.cart = [];
      state.currentOrder = null;
    },
  },
});

export const {
  setUserData,setCity,setState,setAddress,setShopsInMyCity,setItemsInMyCity,
  setCurrentOrder,addToCart,removeFromCart,updateCartQuantity,clearCart,clearUserData
} = userSlice.actions;

export default userSlice.reducer;
