// frontend/src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import api from "../lib/api"; // shared axios instance with baseURL/credentials/timeouts
import Skeleton from "../components/Skeleton";

// Small star rating control
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
          className={`text-xl ${((hover || value) >= n ? "text-yellow-500" : "text-gray-300")}`}
          aria-label={`Rate ${n}`}
          type="button"
        >
          ★
        </button>
      ))}
    </div>
  );
};

// Render a single order with its items and (if delivered) per-item rating
const OrderCard = ({ order, onTrack }) => {
  const created = new Date(order.createdAt).toLocaleString();
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsCount = items.reduce((n, it) => n + (it?.quantity || 0), 0);

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

      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
        <div>
          <p className="text-gray-500">Placed</p>
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
      </div>

      {/* Items list */}
      <div className="mt-4 divide-y">
        {items
          .filter((it) => it?.item) // guard against null-populated items
          .map((it, idx) => (
            <div key={it.item?._id || idx} className="py-3 flex items-center gap-3">
              <img
                src={it.item?.image}
                alt={it.item?.name || "item"}
                className="w-14 h-14 rounded object-cover bg-gray-100"
              />
              <div className="flex-1">
                <p className="font-medium">{it.item?.name || "Unavailable"}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {it.item?.category} • {it.item?.foodtype}
                </p>
                <p className="text-sm mt-1">
                  × {it.quantity || 1} • ₹{((Number(it.price) || 0) * (it.quantity || 1)).toFixed(2)}
                </p>

                {/* Show rating only for delivered orders */}
                {order.status === "delivered" && it.item?._id && (
                  <div className="mt-2 flex items-center gap-2">
                    <Stars
                      value={0}
                      onChange={async (v) => {
                        try {
                          // Rate this item (Stage 6 endpoint)
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

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onTrack(order._id)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
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
      // Use the shared API instance
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
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Back"
            type="button"
          >
            <IoIosArrowBack size={22} />
          </button>
          <h1 className="text-2xl font-semibold">My Orders</h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-24 w-full mb-2" />
            <Skeleton className="h-24 w-full mb-2" />
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
