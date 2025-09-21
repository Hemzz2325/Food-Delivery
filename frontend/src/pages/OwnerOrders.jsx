// frontend/src/pages/OwnerOrders.jsx
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

// Allowed owner transitions
const allowed = ["confirmed", "preparing", "out_for_delivery", "cancelled"];

const OwnerOrderRow = ({ order, onUpdate, onAssign, onTrack }) => {
  const [status, setStatus] = useState(order.status);
  const [eta, setEta] = useState(
    order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toISOString().slice(0, 16) : ""
  );
  const [email, setEmail] = useState("");

  return (
    <div className="p-5 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-400">Order ID</p>
          <p className="font-mono text-sm text-gray-700 break-all">{order._id}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 capitalize shadow-sm">
          {order.status}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-4">
        <div className="text-sm">
          <p className="text-gray-500">Customer</p>
          <p className="font-semibold text-gray-800">{order.user?.fullName || "—"}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-500">Total</p>
          <p className="font-bold text-green-600">₹{Number(order.totalAmount || 0).toFixed(2)}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-500">Delivery Partner</p>
          <p className="font-semibold text-gray-800">{order.deliveryBoy?.fullName || "Unassigned"}</p>
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-3 gap-4">
        {/* Status & ETA */}
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            {allowed.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <button
            onClick={() => onUpdate(order._id, status, eta)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md text-sm transition"
          >
            Update
          </button>
        </div>

        {/* Assign Delivery */}
        <div className="flex items-center gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Assign by delivery email"
            className="w-full border rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
          <button
            onClick={() => onAssign(order._id, email)}
            className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-md text-sm transition"
          >
            Assign
          </button>
        </div>

        {/* Track Button */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => onTrack(order._id)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm text-sm transition"
          >
            Track
          </button>
        </div>
      </div>
    </div>
  );
};

const OwnerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.get("/api/order/owner/my");
      setOrders(data?.orders || []);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Failed to load owner orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (orderId, status, estimatedDeliveryTime) => {
    try {
      await api.patch(`/api/order/owner/status/${orderId}`, { status, estimatedDeliveryTime });
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  const assignDelivery = async (orderId, deliveryBoyEmail) => {
    if (!deliveryBoyEmail) return alert("Enter delivery email");
    try {
      await api.patch(`/api/order/owner/assign/${orderId}`, { deliveryBoyEmail });
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to assign delivery");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Back"
          >
            <IoIosArrowBack size={22} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">📦 Owner Orders</h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-md">Loading…</div>
        ) : err ? (
          <div className="bg-white rounded-2xl p-6 text-red-600 shadow-md">{err}</div>
        ) : !orders?.length ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-md">No orders yet.</div>
        ) : (
          <div className="grid gap-6">
            {orders.map((o) => (
              <OwnerOrderRow
                key={o._id}
                order={o}
                onUpdate={updateStatus}
                onAssign={assignDelivery}
                onTrack={(id) => navigate(`/track/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerOrders;
