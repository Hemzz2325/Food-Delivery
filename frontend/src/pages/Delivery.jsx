// frontend/src/pages/Delivery.jsx
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../lib/api";
import toast from "react-hot-toast";


// Track driver GPS
function useTrackDriver(orderId) {
  useEffect(() => {
    if (!orderId || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await api.post("/api/location/emit", {
            orderId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            ts: Date.now(),
          });
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [orderId]);
}

const DeliveryOrderCard = ({
  order,
  onAccept,
  onTrack,
  onShareToggle,
  onSendOtp,
  onVerifyOtp,
  isSharing,
}) => {
  const [otp, setOtp] = useState("");
  const itemsCount = (order.items || []).reduce((n, it) => n + (it?.quantity || 0), 0);

  return (
    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-md transform transition duration-300 hover:scale-[1.01] hover:shadow-xl animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 font-semibold">Order ID</p>
          <p className="font-mono text-gray-900 break-all">{order._id}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            order.status === "delivered"
              ? "bg-green-100 text-green-700"
              : order.status === "out_for_delivery"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          } capitalize`}
        >
          {order.status}
        </span>
      </div>

      {/* Details */}
      <div className="grid md:grid-cols-4 gap-4 mt-3 text-sm text-gray-700">
        <div>
          <p className="text-gray-500 font-semibold text-sm">Items</p>
          <p className="font-medium">{itemsCount}</p>
        </div>
        <div>
          <p className="text-gray-500 font-semibold text-sm">Total</p>
          <p className="font-bold text-gray-900">₹{Number(order.totalAmount || 0).toFixed(2)}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-gray-500 font-semibold text-sm">Deliver to</p>
          <p className="font-medium text-gray-800">
            {order?.deliveryAddress?.address || "—"}, {order?.deliveryAddress?.city || "—"},{" "}
            {order?.deliveryAddress?.state || "—"}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-3">
        {order.status !== "out_for_delivery" && order.status !== "delivered" && (
          <button
            onClick={() => onAccept(order._id)}
            className="px-4 py-2 rounded-lg bg-[#EF233C] hover:bg-red-700 text-white font-medium text-sm transition"
          >
            Accept
          </button>
        )}

        <button
          onClick={() => onTrack(order._id)}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium text-sm transition"
        >
          Track
        </button>

        <button
          onClick={() => onShareToggle(order._id, !isSharing)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            isSharing
              ? "bg-[#EF233C] hover:bg-red-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
        >
          {isSharing ? "Stop sharing" : "Start sharing"}
        </button>
      </div>

      {/* OTP */}
      <div className="mt-4 grid md:grid-cols-3 gap-3">
        <button
          onClick={() => onSendOtp(order._id)}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm transition"
        >
          Send OTP
        </button>
        <div className="flex items-center gap-2 md:col-span-2">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EF233C]"
          />
          <button
            onClick={() => onVerifyOtp(order._id, otp)}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition"
          >
            Verify & Deliver
          </button>
        </div>
      </div>
    </div>
  );
};

const Delivery = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  const [sharingFor, setSharingFor] = useState(null);

  useTrackDriver(sharingFor);

  const goBack = () => {
    if (window.history.length > 1) return navigate(-1);
    navigate("/");
  };

  const load = async () => {
    setErr("");
    try {
      const { data } = await api.get("/api/order/delivery/my");
      setOrders(data?.orders || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load deliveries");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const accept = async (orderId) => {
    try {
      await api.patch(`/api/order/delivery/accept/${orderId}`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to accept order");
    }
  };

  const onShareToggle = (orderId, shouldShare) => {
    setSharingFor(shouldShare ? orderId : null);
  };

 const sendOtp = async (orderId) => {
  try {
    await api.post(`/api/order/delivery/send-otp/${orderId}`);
    toast.success("OTP sent to customer email");
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to send OTP");
  }
};

const verifyOtp = async (orderId, otp) => {
  if (!otp) return toast.error("Enter OTP");
  try {
    await api.post(`/api/order/delivery/verify-otp/${orderId}`, { otp });
    if (sharingFor === orderId) setSharingFor(null);
    await load();
    toast.success("Delivery confirmed");
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to verify OTP");
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            aria-label="Back"
          >
            <IoIosArrowBack size={22} />
          </button>
          <h1 className="text-3xl font-bold text-[#EF233C]">Delivery</h1>
        </div>

        {/* Error */}
        {err && (
          <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-4 border border-red-200">
            {err}
          </div>
        )}

        {/* Orders */}
        {!orders.length ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-700 shadow-md">
            No assigned orders.
          </div>
        ) : (
          <div className="grid gap-5">
            {orders.map((o) => (
              <DeliveryOrderCard
                key={o._id}
                order={o}
                onAccept={accept}
                onTrack={(id) => navigate(`/track/${id}`)}
                onShareToggle={onShareToggle}
                onSendOtp={sendOtp}
                onVerifyOtp={verifyOtp}
                isSharing={sharingFor === o._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Delivery;
