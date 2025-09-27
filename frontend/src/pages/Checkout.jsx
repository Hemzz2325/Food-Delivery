import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/userSlice";
import api from "../lib/api"; // uses withCredentials baseURL
import toast from "react-hot-toast";

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

  // Load Razorpay SDK lazily
  async function loadRazorpay() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

async function createAppOrder(mode) {
  const payload = {
    items: items.map((it) => ({
      itemId: it._id,
      quantity: Number(it.quantity),
      price: Number(it.price),
    })),
    deliveryAddress,
    totalAmount: Number(total),                 // REQUIRED by backend
  };

  if (mode === "cod") {
    // COD endpoint
    const { data } = await api.post("/api/order/cod", payload);
    return data?.order; // { _id, totalAmount, paymentMethod: 'COD', status: 'cod_pending' }
  } else {
    // Online endpoint (creates Razorpay order server-side)
    const { data } = await api.post("/api/order/create", payload);
    return data?.order; // contains razorpayOrderId, pending status
  }
}


async function startOnlinePayment(razorMeta, appOrder) {
  const loaded = await loadRazorpay();
  if (!loaded) throw new Error("Razorpay SDK failed to load");

  const { id: razorpayOrderId, amount, currency } = razorMeta || {};
  if (!razorpayOrderId) throw new Error("Failed to initialize payment");

  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID, // or supply from backend
    amount: String(amount),
    currency: currency || "INR",
    name: "Country Kitchen",
    description: `Payment for order ${appOrder._id}`,
    order_id: razorpayOrderId,
    handler: async function (response) {
      try {
        await api.post("/api/order/verify-payment", {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
        toast.success("Payment successful. Order placed!");
        dispatch(clearCart());
        navigate("/orders", { replace: true });
      } catch (e) {
        toast.error(e?.response?.data?.message || "Payment verification failed");
      }
    },
    modal: { ondismiss: function () { toast("Payment cancelled"); } },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}


  async function handlePlaceOrder() {
  try {
    setPlacing(true);
    setErr("");
    if (!items.length) throw new Error("Cart is empty");
    if (!deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
      throw new Error("Please complete delivery address");
    }

    if (paymentMethod === "cod") {
      const order = await createAppOrder("cod");
      toast.success("Order placed (COD). Pay full amount on delivery");
      dispatch(clearCart());
      navigate("/orders", { replace: true });
    } else {
      // Online path: createOrder returns both order and razorpay metadata
      const res = await api.post("/api/order/create", {
        items: items.map((it) => ({
          itemId: it._id,
          quantity: Number(it.quantity),
          price: Number(it.price),
        })),
        deliveryAddress,
        totalAmount: Number(total),
      });
      const { order, id, amount, currency } = res?.data || {};
      await startOnlinePayment({ id, amount, currency }, order);
    }
  } catch (e) {
    setErr(e?.message || "Failed to place order");
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
              className={`flex-1 py-2 rounded-lg font-semibold ${
                paymentMethod === "online" ? "bg-[#457B9D] text-white" : "bg-gray-100 text-[#1D3557]"
              }`}
            >
              Online
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`flex-1 py-2 rounded-lg font-semibold ${
                paymentMethod === "cod" ? "bg-[#E63946] text-white" : "bg-gray-100 text-[#1D3557]"
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
            {placing ? "Processing..." : paymentMethod === "cod" ? "Place COD Order" : "Go to Payment"}
          </button>

          {err && (
            <div className="mt-2 text-sm text-[#E63946] bg-red-50 border border-[#E63946] p-2 rounded">{err}</div>
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
  }, [address, city, state, pincode]); // eslint-disable-line

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
