// frontend/src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import Skeleton from "../components/Skeleton";

// ⭐ Star rating control (kept as-is, just slightly styled)
const Stars = ({ value = 0, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={`text-xl transition-colors ${
            (hover || value) >= n ? "text-yellow-500" : "text-gray-300"
          }`}
          aria-label={`Rate ${n}`}
          type="button"
        >
          ★
        </button>
      ))}
    </div>
  );
};

// Order card with Zomato-style design
const OrderCard = ({ order, onTrack }) => {
  const created = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsCount = items.reduce((n, it) => n + (it?.quantity || 0), 0);
  const isCOD = order.paymentMethod === "COD" && order.status === "cod_pending";

  // Map statuses to styles
  const statusStyles = {
    delivered: "bg-green-100 text-green-700",
    preparing: "bg-yellow-100 text-yellow-700",
    "out for delivery": "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    cod_pending: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <div>
          <p className="text-xs text-gray-500">Order ID</p>
          <p className="font-mono text-sm">{order._id}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            statusStyles[order.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Details */}
      <div className="px-4 py-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Placed on</p>
          <p className="font-medium">{created}</p>
        </div>
        <div>
          <p className="text-gray-500">Items</p>
          <p className="font-medium">{itemsCount}</p>
        </div>
        <div>
          <p className="text-gray-500">Total</p>
          <p className="font-semibold">₹{Number(order.totalAmount || 0).toFixed(2)}</p>
        </div>
        {isCOD && (
          <div className="col-span-2">
            <p className="text-orange-600 font-semibold">
              Pay ₹{Number(order.totalAmount || 0).toFixed(2)} on delivery
            </p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="divide-y">
        {items
          .filter((it) => it?.item)
          .map((it, idx) => (
            <div key={it.item?._id || idx} className="flex items-center gap-3 px-4 py-3">
              <img
                src={it.item?.image}
                alt={it.item?.name || "item"}
                className="w-16 h-16 rounded-lg object-cover bg-gray-100"
              />
              <div className="flex-1">
                <p className="font-medium">{it.item?.name || "Unavailable"}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {it.item?.category} • {it.item?.foodtype}
                </p>
                <p className="text-sm mt-1 text-gray-700">
                  × {it.quantity || 1} • ₹
                  {((Number(it.price) || 0) * (it.quantity || 1)).toFixed(2)}
                </p>

                {order.status === "delivered" && it.item?._id && (
                  <div className="mt-2 flex items-center gap-2">
                    <Stars
                      value={0}
                      onChange={async (v) => {
                        try {
                          await api.post(`/api/item/rate/${it.item._id}`, { rating: v });
                          alert("Thanks for rating!");
                        } catch (e) {
                          alert(e?.response?.data?.message || "Failed to rate");
                        }
                      }}
                    />
                    <span className="text-xs text-gray-500">Tap to rate</span>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex justify-end border-t">
        <button
          onClick={() => onTrack(order._id)}
          className="px-4 py-2 rounded-lg bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
          type="button"
        >
          Track order
        </button>
      </div>
    </div>
  );
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.get("/api/order/my-orders");
      setOrders(data?.orders || []);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Back"
            type="button"
          >
            <IoIosArrowBack size={22} />
          </button>
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        {/* Loading / Error / Empty */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : err ? (
          <div className="bg-white rounded-lg p-4 text-red-600 shadow-sm">{err}</div>
        ) : !orders?.length ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            No orders yet. Start by adding items to cart.
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => (
              <OrderCard key={o._id} order={o} onTrack={(id) => navigate(`/track/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
