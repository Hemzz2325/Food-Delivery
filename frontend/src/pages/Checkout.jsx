// src/pages/Checkout.jsx
import React, { useMemo, useState, useCallback, memo } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import { setCurrentOrder, clearCart } from "../redux/userSlice";

// Reusable input class — keep top-level and immutable
const INPUT =
  "w-full border rounded-lg px-3 py-2 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-sm";

// Lightweight memoized controlled input/textarea to avoid full-form re-render
const TextInput = memo(function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={INPUT}
    />
  );
});

const TextArea = memo(function TextArea({ value, onChange, placeholder, rows = 3, className = "" }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`${INPUT} ${className}`}
    />
  );
});

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    cart,
    userData,
    address: savedAddress,
    city: savedCity,
    state: savedState,
  } = useSelector((s) => s.user);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // Prefilled but editable delivery details
  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [phone, setPhone] = useState(userData?.mobile || "");
  const [address, setAddress] = useState(savedAddress || "");
  const [city, setCity] = useState(savedCity || "");
  const [state, setState] = useState(savedState || "");
  const [pincode, setPincode] = useState("");

  // Stable handlers to avoid replacing input nodes
  const onFullName = useCallback((e) => setFullName(e.target.value), []);
  const onPhone = useCallback((e) => setPhone(e.target.value), []);
  const onAddress = useCallback((e) => setAddress(e.target.value), []);
  const onCity = useCallback((e) => setCity(e.target.value), []);
  const onState = useCallback((e) => setState(e.target.value), []);
  const onPincode = useCallback((e) => setPincode(e.target.value), []);

  const totalAmount = useMemo(
    () =>
      cart.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
      ),
    [cart]
  );

  const validate = () => {
    if (!userData?._id) return "Please sign in to continue.";
    if (!cart.length || totalAmount <= 0) return "Cart is empty.";
    if (!fullName.trim()) return "Enter recipient name.";
    if (!phone.trim() || phone.trim().length < 8) return "Enter a valid phone.";
    if (!address.trim()) return "Enter full address.";
    if (!city.trim()) return "Enter city.";
    if (!state.trim()) return "Enter state.";
    if (!pincode.trim() || pincode.trim().length < 4) return "Enter valid pincode.";
    return "";
  };

  const placeOrder = useCallback(async () => {
    setError("");
    const v = validate();
    if (v) return setError(v);

    setPlacing(true);
    try {
      const payload = {
        items: cart.map((c) => ({
          item: c._id,
          quantity: c.quantity || 1,
          price: Number(c.price) || 0,
        })),
        totalAmount: Math.round(totalAmount),
        deliveryAddress: { name: fullName, phone, address, city, state, pincode },
      };

      const { data: created } = await axios.post(
        `${serverUrl}/api/order/create`,
        payload,
        { withCredentials: true }
      );

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Failed to load Razorpay.");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Country Kitchen",
        description: "Food Order",
        order_id:
          created?.razorpayOrder?.id || created?.order?.razorpayOrderId,
        prefill: { name: fullName, email: userData?.email || "", contact: phone },
        notes: { appOrderId: created?.appOrder?._id || "" },
        handler: async (response) => {
          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appOrderId: created?.appOrder?._id,
            };
            const { data: verified } = await axios.post(
              `${serverUrl}/api/order/verify-payment`,
              verifyPayload,
              { withCredentials: true }
            );
            dispatch(setCurrentOrder(verified?.order || created?.appOrder));
            dispatch(clearCart());
            navigate("/");
          } catch (err) {
            console.error(err);
            setError(
              err?.response?.data?.message ||
                err?.message ||
                "Payment verification failed."
            );
          }
        },
        theme: { color: "#22c55e" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to place order."
      );
    } finally {
      setPlacing(false);
    }
  }, [address, city, state, pincode, fullName, phone, cart, totalAmount, dispatch, navigate, userData?.email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white shadow-md hover:scale-110 transition-transform"
            aria-label="Back"
          >
            <IoIosArrowBack size={22} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Delivery Address */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 space-y-4 border border-green-100">
            <h2 className="text-xl font-semibold">Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput value={fullName} onChange={onFullName} placeholder="Recipient Name" />
              <TextInput value={phone} onChange={onPhone} placeholder="Phone" />
              <TextArea
                value={address}
                onChange={onAddress}
                placeholder="House no, street, area"
                rows={3}
                className="sm:col-span-2"
              />
              <TextInput value={city} onChange={onCity} placeholder="City" />
              <TextInput value={state} onChange={onState} placeholder="State" />
              <TextInput value={pincode} onChange={onPincode} placeholder="Pincode" />
            </div>
            <p className="text-xs text-gray-500">
              Details will be shared with the restaurant and delivery partner for this order.
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-green-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                {cart.map((c) => (
                  <div
                    key={c._id}
                    className="flex justify-between text-gray-700 text-base font-medium"
                  >
                    <span>
                      {c.name} × {c.quantity || 1}
                    </span>
                    <span>
                      ₹{((Number(c.price) || 0) * (c.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900 mt-3">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              {error && (
                <div className="mt-3 text-red-600 font-medium">{error}</div>
              )}
            </div>

            <button
              disabled={placing || totalAmount <= 0}
              onClick={placeOrder}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all disabled:opacity-60"
            >
              {placing ? "Processing..." : "Pay with Razorpay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
