// frontend/src/pages/Delivery.jsx
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../lib/api";

// Local hook to emit GPS while sharing is ON
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
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="font-mono text-xs break-all">{order._id}</p>
        </div>
        <span className="px-2 py-1 rounded text-xs bg-gray-100 capitalize">
          {order.status}
        </span>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mt-3 text-sm">
        <div>
          <p className="text-gray-500">Items</p>
          <p className="font-medium">{itemsCount}</p>
        </div>
        <div>
          <p className="text-gray-500">Total</p>
          <p className="font-semibold">₹{Number(order.totalAmount || 0).toFixed(2)}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-gray-500">Deliver to</p>
          <p className="font-medium">
            {order?.deliveryAddress?.address || "—"}, {order?.deliveryAddress?.city || "—"},{" "}
            {order?.deliveryAddress?.state || "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {order.status !== "out_for_delivery" && order.status !== "delivered" && (
          <button
            onClick={() => onAccept(order._id)}
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
            type="button"
          >
            Accept
          </button>
        )}

        <button
          onClick={() => onTrack(order._id)}
          className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
          type="button"
        >
          Track
        </button>

        <button
          onClick={() => onShareToggle(order._id, !isSharing)}
          className={`px-3 py-2 rounded-lg text-sm ${
            isSharing ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"
          }`}
          type="button"
        >
          {isSharing ? "Stop sharing" : "Start sharing"}
        </button>
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-3">
        <button
          onClick={() => onSendOtp(order._id)}
          className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
          type="button"
        >
          Send OTP to customer
        </button>
        <div className="flex items-center gap-2">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={() => onVerifyOtp(order._id, otp)}
            className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
            type="button"
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

  // Emit GPS when sharingFor is set
  useTrackDriver(sharingFor);

  // Safe Back handler: if no history, go to Home (which no longer auto-redirects)
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
      alert("OTP sent to customer email");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async (orderId, otp) => {
    if (!otp) return alert("Enter OTP");
    try {
      await api.post(`/api/order/delivery/verify-otp/${orderId}`, { otp });
      if (sharingFor === orderId) setSharingFor(null);
      await load();
      alert("Delivery confirmed");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to verify OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={goBack}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Back"
            type="button"
          >
            <IoIosArrowBack size={22} />
          </button>
          <h1 className="text-2xl font-semibold">Delivery</h1>
        </div>

        {err && (
          <div className="bg-white rounded-lg p-4 text-red-600 shadow-sm mb-3">
            {err}
          </div>
        )}

        {!orders.length ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">No assigned orders.</div>
        ) : (
          <div className="grid gap-4">
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
