// frontend/src/pages/Checkout.jsx - FIXED VERSION
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/userSlice";
import api from "../lib/api";
import toast from "react-hot-toast";

// Robust Razorpay loader with error handling
let razorpayPromise = null;
function loadRazorpaySDK() {
  if (window.Razorpay && typeof window.Razorpay === "function") {
    console.log("✅ Razorpay already loaded");
    return Promise.resolve(true);
  }
  
  if (razorpayPromise) {
    console.log("⏳ Razorpay loading in progress...");
    return razorpayPromise;
  }

  console.log("📦 Loading Razorpay SDK...");
  razorpayPromise = new Promise((resolve) => {
    const src = "https://checkout.razorpay.com/v1/checkout.js";
    const existing = document.querySelector(`script[src="${src}"]`);
    
    if (existing) {
      console.log("📦 Razorpay script tag exists, waiting for load...");
      existing.addEventListener("load", () => {
        console.log("✅ Razorpay loaded from existing script");
        resolve(true);
      });
      existing.addEventListener("error", () => {
        console.error("❌ Razorpay failed to load from existing script");
        resolve(false);
      });
      // Check if already loaded
      if (window.Razorpay && typeof window.Razorpay === "function") {
        resolve(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      console.log("✅ Razorpay SDK loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load Razorpay SDK");
      toast.error("Failed to load payment gateway. Check your internet connection.");
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayPromise;
}

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
    () => items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1), 0),
    [items]
  );
  const delivery = useMemo(() => (subtotal > 499 ? 0 : 29), [subtotal]);
  const total = useMemo(() => subtotal + delivery, [subtotal, delivery]);

  // Get Razorpay key from environment
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // Debug: Log configuration on mount
  useEffect(() => {
    console.log("🔍 Checkout Configuration:");
    console.log("- Backend URL:", import.meta.env.VITE_SERVER_URL);
    console.log("- Razorpay Key ID:", razorpayKeyId ? `${razorpayKeyId.substring(0, 8)}...` : "NOT SET");
    console.log("- Cart items:", items.length);
    console.log("- Total amount:", total);
  }, []);

  async function createAppOrder(mode) {
    const payload = {
      items: items.map((it) => ({
        itemId: it._id,
        quantity: Number(it.quantity),
        price: Number(it.price),
      })),
      deliveryAddress,
      totalAmount: Number(total),
    };

    console.log("📦 Creating order:", mode, payload);

    if (mode === "cod") {
      const { data } = await api.post("/api/order/cod", payload);
      console.log("✅ COD order created:", data);
      return data?.order;
    } else {
      const { data } = await api.post("/api/order/create", payload);
      console.log("✅ Online order created:", data);
      return data;
    }
  }

  async function startOnlinePayment(orderResponse) {
    console.log("💳 Starting online payment with response:", orderResponse);

    // Validate Razorpay key
    if (!razorpayKeyId) {
      const msg = "Payment configuration missing. Please contact support.";
      console.error("❌", msg);
      toast.error(msg);
      throw new Error(msg);
    }

    // Load Razorpay SDK
    const loaded = await loadRazorpaySDK();
    if (!loaded || !window.Razorpay || typeof window.Razorpay !== "function") {
      const msg = "Payment gateway failed to load. Please check your internet connection and try again.";
      console.error("❌", msg);
      toast.error(msg);
      throw new Error(msg);
    }

    // Extract Razorpay order details
    const razorpayOrderId = orderResponse?.id || orderResponse?.order?.razorpayOrderId;
    const amount = orderResponse?.amount || Math.round(Number(total) * 100);
    const currency = orderResponse?.currency || "INR";
    const dbOrder = orderResponse?.order;

    console.log("💳 Payment details:", {
      razorpayOrderId,
      amount,
      currency,
      keyId: razorpayKeyId
    });

    if (!razorpayOrderId) {
      const msg = "Invalid order response from server";
      console.error("❌", msg, orderResponse);
      toast.error(msg);
      throw new Error(msg);
    }

    const options = {
      key: razorpayKeyId,
      amount: String(amount),
      currency: currency,
      name: "Country Kitchen",
      description: `Payment for order ${dbOrder?._id || ''}`,
      order_id: razorpayOrderId,
      handler: async function (response) {
        console.log("✅ Payment successful:", response);
        try {
          const verifyRes = await api.post("/api/order/verify-payment", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          
          console.log("✅ Payment verified:", verifyRes.data);
          toast.success("Payment successful! Order placed.");
          dispatch(clearCart());
          navigate("/orders", { replace: true });
        } catch (e) {
          console.error("❌ Payment verification failed:", e);
          const msg = e?.response?.data?.message || "Payment verification failed";
          toast.error(msg);
        }
      },
      modal: {
        ondismiss: function () {
          console.log("⚠️ Payment cancelled by user");
          toast("Payment cancelled");
          setPlacing(false);
        },
      },
      theme: {
        color: "#EF233C"
      },
    };

    console.log("💳 Opening Razorpay checkout with options:", options);
    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response) {
      console.error("❌ Payment failed:", response.error);
      toast.error(`Payment failed: ${response.error.description}`);
      setPlacing(false);
    });

    rzp.open();
  }

  async function handlePlaceOrder() {
    try {
      setPlacing(true);
      setErr("");

      // Validate cart
      if (!items.length) {
        throw new Error("Cart is empty");
      }

      // Validate address
      if (!deliveryAddress.address || !deliveryAddress.city || 
          !deliveryAddress.state || !deliveryAddress.pincode) {
        throw new Error("Please complete delivery address");
      }

      console.log("🚀 Placing order:", paymentMethod);

      if (paymentMethod === "cod") {
        const order = await createAppOrder("cod");
        toast.success("Order placed (COD). Pay full amount on delivery");
        dispatch(clearCart());
        navigate("/orders", { replace: true });
      } else {
        const orderResponse = await createAppOrder("online");
        await startOnlinePayment(orderResponse);
      }
    } catch (e) {
      console.error("❌ Order placement error:", e);
      const msg = e?.response?.data?.message || e?.message || "Failed to place order";
      setErr(msg);
      toast.error(msg);
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
                <div key={ci._id} className="flex items-center gap-3 border border-[#A8DADC] rounded-lg p-3">
                  <img src={ci.image} alt={ci.name} className="h-12 w-12 rounded object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-[#1D3557]">{ci.name}</p>
                    <p className="text-sm text-[#457B9D]">Qty: {ci.quantity}</p>
                  </div>
                  <p className="font-semibold text-[#E63946]">₹{(ci.price * ci.quantity).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#A8DADC] space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-2xl text-[#1D3557]">Order Summary</h2>
            <Link to="/" className="text-[#457B9D] hover:underline text-sm font-medium">
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
            <h3 className="font-semibold mb-2 text-[#1D3557]">Delivery Address</h3>
            <AddressForm initial={deliveryAddress} onUpdate={setDeliveryAddress} />
          </div>

          {/* Payment Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                paymentMethod === "online" 
                  ? "bg-[#457B9D] text-white" 
                  : "bg-gray-100 text-[#1D3557] hover:bg-gray-200"
              }`}
            >
              Online Payment
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                paymentMethod === "cod" 
                  ? "bg-[#E63946] text-white" 
                  : "bg-gray-100 text-[#1D3557] hover:bg-gray-200"
              }`}
            >
              Cash on Delivery
            </button>
          </div>

          {/* Place Order */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={items.length === 0 || placing}
            className="w-full rounded-lg bg-[#1D3557] hover:bg-[#457B9D] text-white font-semibold py-3 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {placing 
              ? "Processing..." 
              : paymentMethod === "cod" 
                ? "Place COD Order" 
                : "Proceed to Payment"}
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
  }, [address, city, state, pincode, onUpdate]);

  return (
    <div className="space-y-4">
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#A8DADC]"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#A8DADC]"
          required
        />
        <input
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="State"
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#A8DADC]"
          required
        />
      </div>
      <input
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        placeholder="Pincode"
        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#A8DADC]"
        required
      />
    </div>
  );
}
