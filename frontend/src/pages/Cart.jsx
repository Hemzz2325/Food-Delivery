import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "../redux/userSlice";

// Uses the existing cart reducers in userSlice without changing slice/store.
// UI follows Tailwind usage already present across pages.
const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.user.cart || []);
  const hasItems = cart.length > 0;

  const subtotal = cart.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );

  const inc = (item) =>
    dispatch(
      updateCartQuantity({
        itemId: item._id,
        quantity: (item.quantity || 1) + 1,
      })
    );

  const dec = (item) =>
    dispatch(
      updateCartQuantity({
        itemId: item._id,
        quantity: (item.quantity || 1) - 1,
      })
    );

  const remove = (item) => dispatch(removeFromCart(item._id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Back"
          >
            <IoIosArrowBack size={22} />
          </button>
          <h1 className="text-2xl font-semibold">My Cart</h1>
        </div>

        {!hasItems ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <p className="text-gray-600 mb-4">
              Cart is empty. Add some delicious items to begin!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="bg-white rounded-lg shadow-sm divide-y">
              {cart.map((it) => (
                <div key={it._id} className="p-4 flex items-center gap-4">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-20 h-20 rounded object-cover bg-gray-100"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{it.name}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {it.category} • {it.foodtype}
                    </p>
                    <p className="mt-1 font-semibold">₹{Number(it.price) || 0}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => dec(it)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center">{it.quantity || 1}</span>
                    <button
                      onClick={() => inc(it)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(it)}
                    className="ml-4 text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700 mt-1">
                <span>Delivery</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between font-semibold mt-2">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => dispatch(clearCart())}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                >
                  Clear Cart
                </button>
                <button
                  disabled={subtotal <= 0}
                  onClick={() => navigate("/checkout")}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
