import React, { useMemo, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import { setCurrentOrder, clearCart } from "../redux/userSlice";

// Loads Razorpay script only when needed to keep initial bundle light
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cart, userData, address, city, state } = useSelector((s) => s.user);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = useMemo(
    () =>
      cart.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
      ),
    [cart]
  );

  const placeOrder = async () => {
    setError("");
    if (!userData?._id) {
      setError("Please sign in to continue.");
      return;
    }
    if (!cart || cart.length === 0 || totalAmount <= 0) {
      setError("Cart is empty.");
      return;
    }

    setPlacing(true);
    try {
      // 1) Create backend order
      const deliveryAddress = {
        address: address || "",
        city: city || "",
        state: state || "",
        pincode: "",
      };

      const payload = {
        items: cart.map((c) => ({
          item: c._id,
          quantity: c.quantity || 1,
          price: Number(c.price) || 0,
        })),
        totalAmount: Math.round(totalAmount),
        deliveryAddress,
      };

      const { data: created } = await axios.post(
        `${serverUrl}/api/order/create`,
        payload,
        { withCredentials: true }
      );

      // 2) Load Razorpay
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Failed to load Razorpay.");

      // 3) Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Country Kitchen",
        description: "Food Order",
        order_id: created?.razorpayOrder?.id || created?.order?.razorpayOrderId,
        prefill: {
          name: userData?.fullName || "",
          email: userData?.email || "",
          contact: userData?.mobile || "",
        },
        notes: { appOrderId: created?.appOrder?._id || "" },
        handler: async function (response) {
          try {
            // 4) Verify payment on server
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
            navigate("/"); // can change to /orders or /track later
          } catch (err) {
            console.error(err);
            setError(
              err?.response?.data?.message ||
                err?.message ||
                "Payment verification failed."
            );
          }
        },
        theme: { color: "#16a34a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to place order."
      );
    } finally {
      setPlacing(false);
    }
  };

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
          <h1 className="text-2xl font-semibold">Checkout</h1>
        </div>

        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold mb-2">Delivery address</h2>
            <p className="text-gray-700">
              {address || "Address not set"}, {city || "City"}, {state || "State"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Update address from Profile or location prompt before paying.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold mb-3">Order summary</h2>
            <div className="space-y-2">
              {cart.map((c) => (
                <div key={c._id} className="flex justify-between text-sm">
                  <span>
                    {c.name} × {c.quantity || 1}
                  </span>
                  <span>₹{((Number(c.price) || 0) * (c.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              disabled={placing || totalAmount <= 0}
              onClick={placeOrder}
              className="mt-4 w-full px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {placing ? "Processing..." : "Pay with Razorpay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
