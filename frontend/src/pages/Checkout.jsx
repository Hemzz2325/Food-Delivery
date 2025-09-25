import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/userSlice";
import { serverUrl } from "../config";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.user.cart) || [];

  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const items = useMemo(() => cart, [cart]);
  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
        0
      ),
    [items]
  );
  const delivery = useMemo(() => (subtotal > 499 ? 0 : 29), [subtotal]);
  const total = useMemo(() => subtotal + delivery, [subtotal, delivery]);

  async function handlePlaceOrder() {
    try {
      setPlacing(true);
      setErr("");
      if (!items.length) throw new Error("Cart is empty");

      // just simulating
      dispatch(clearCart());
      navigate("/orders", { replace: true });
    } catch (e) {
      setErr(e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F1FAEE] flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 py-10">
        {/* Cart Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#A8DADC]">
          <h2 className="font-bold text-2xl mb-4 text-[#1D3557]">Your Cart</h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-[#457B9D]">No items in cart.</p>
            ) : (
              items.map((ci) => (
                <div
                  key={ci._id}
                  className="flex items-center gap-3 border border-[#A8DADC] rounded-lg p-3"
                >
                  <img
                    src={ci.image}
                    alt={ci.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-[#1D3557]">{ci.name}</p>
                    <p className="text-sm text-[#457B9D]">
                      Qty: {ci.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-[#E63946]">
                    ₹{(ci.price * ci.quantity).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#A8DADC] space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-2xl text-[#1D3557]">
              Order Summary
            </h2>
            <Link
              to="/"
              className="text-[#457B9D] hover:underline text-sm font-medium"
            >
              Continue shopping
            </Link>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#1D3557]">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#1D3557]">Delivery</span>
              <span>{delivery === 0 ? "Free" : `₹${delivery}`}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2 text-[#E63946]">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-semibold mb-2 text-[#1D3557]">
              Delivery Address
            </h3>
            <AddressForm
              initial={deliveryAddress}
              onUpdate={setDeliveryAddress}
            />
          </div>

          {/* Payment Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              className={`flex-1 py-2 rounded-lg font-semibold ${
                paymentMethod === "online"
                  ? "bg-[#457B9D] text-white"
                  : "bg-gray-100 text-[#1D3557]"
              }`}
            >
              Online
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`flex-1 py-2 rounded-lg font-semibold ${
                paymentMethod === "cod"
                  ? "bg-[#E63946] text-white"
                  : "bg-gray-100 text-[#1D3557]"
              }`}
            >
              COD
            </button>
          </div>

          {/* Place Order */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={items.length === 0 || placing}
            className="w-full rounded-lg bg-[#1D3557] hover:bg-[#457B9D] text-white font-semibold py-3 disabled:opacity-60"
          >
            {placing
              ? "Processing..."
              : paymentMethod === "cod"
              ? "Place COD Order"
              : "Go to Payment"}
          </button>

          {err && (
            <div className="mt-2 text-sm text-[#E63946] bg-red-50 border border-[#E63946] p-2 rounded">
              {err}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddressForm({ initial, onUpdate }) {
  const [address, setAddress] = useState(initial?.address || "");
  const [city, setCity] = useState(initial?.city || "");
  const [state, setState] = useState(initial?.state || "");
  const [pincode, setPincode] = useState(initial?.pincode || "");

  useEffect(() => {
    onUpdate?.({ address, city, state, pincode });
  }, [address, city, state, pincode]);

  return (
    <div className="space-y-4">
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#A8DADC]"
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#A8DADC]"
        />
        <input
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="State"
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#A8DADC]"
        />
      </div>
      <input
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        placeholder="Pincode"
        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#A8DADC]"
      />
    </div>
  );
}
