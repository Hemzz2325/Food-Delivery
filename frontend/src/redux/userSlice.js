// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,       // logged in user
  city: null,
  state: null,
  address: null,
  shopsInMyCity: null,   // shops in user's city
  itemsInMyCity: null,  // items in user's city
  currentOrder: null,
  cart: [],             // cart items
  // Categories array that UserDashboard expects
  categories: [
    "breakfast",
    "lunch", 
    "dinner",
    "snacks",
    "drinks",
    "south indian",
    "north indian",
    "punjabi",
    "chinese",
    "juices",
    "desserts",
    "sandwich",
    "burger",
    "pizzas"
  ]
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
  // src/redux/userSlice.js
setShopsInMyCity: (state, action) => {
  state.shopsInMyCity = action.payload;
},




    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    // Cart functionality
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.cart.find(cartItem => cartItem._id === item._id);
      
      if (existingItem) {
        existingItem.quantity = item.quantity || existingItem.quantity + 1;
      } else {
        state.cart.push({
          ...item,
          quantity: item.quantity || 1
        });
      }
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.cart = state.cart.filter(item => item._id !== itemId);
    },
    updateCartQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.cart.find(cartItem => cartItem._id === itemId);
      
      if (item) {
        if (quantity <= 0) {
          state.cart = state.cart.filter(cartItem => cartItem._id !== itemId);
        } else {
          item.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
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
  setUserData,
  setCity,
  setState,
  setAddress,
  setShopsInMyCity,
  setItemsInMyCity,
  setCurrentOrder,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  clearUserData,
} = userSlice.actions;

// Backward compatibility (if older code used these names)
export const setCurrentCity = setCity;
export const setCurrentState = setState;
export const setCurrentAddress = setAddress;

export default userSlice.reducer;