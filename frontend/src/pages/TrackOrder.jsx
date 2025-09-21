// frontend/src/pages/TrackOrder.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api"; // shared axios instance (baseURL, withCredentials, timeout)
import useTrackDriver from "../hooks/useTrackDriver";
import L from "leaflet";

// If Leaflet CSS is not imported in index.css, uncomment the next line:
// import "leaflet/dist/leaflet.css";

// Ensure marker icons work under Vite
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Order status pipeline
const pipeline = ["pending", "paid", "confirmed", "preparing", "out_for_delivery", "delivered"];

const Step = ({ label, active }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${active ? "bg-green-600" : "bg-gray-300"}`} />
    <span className={`text-sm ${active ? "text-gray-900" : "text-gray-400"} capitalize`}>{label}</span>
  </div>
);

const TrackOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // sockets → driver location (receive only for users)
  const { driverPos } = useTrackDriver(orderId, false);

  // Leaflet refs
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markerRef = useRef(null);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      // Switched to shared API instance
      const { data } = await api.get(`/api/order/${orderId}`);
      // Guard missing populated items
      const o = data?.order || null;
      if (o) o.items = (o.items || []).filter((it) => it?.item);
      setOrder(o);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  // Initialize the map once
  useEffect(() => {
    if (mapRef.current || !mapElRef.current) return;
    mapRef.current = L.map(mapElRef.current).setView([20.5937, 78.9629], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(mapRef.current);
  }, []);

  // Update marker and viewport on driverPos
  useEffect(() => {
    if (!driverPos || !mapRef.current) return;
    const { lat, lng } = driverPos;
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    mapRef.current.setView([lat, lng], mapRef.current.getZoom() || 15, { animate: true });
  }, [driverPos]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const items = order?.items || [];
  const totalAmount = Number(order?.totalAmount || 0);
  const status = order?.status || "pending";

  const steps = useMemo(() => {
    const idx = pipeline.indexOf(status);
    return pipeline.map((s, i) => ({ s, active: i <= (idx === -1 ? 0 : idx) }));
  }, [status]);

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
          <h1 className="text-2xl font-semibold">Track Order</h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">Loading…</div>
        ) : err ? (
          <div className="bg-white rounded-lg p-4 text-red-600 shadow-sm">{err}</div>
        ) : !order ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">Order not found</div>
        ) : (
          <div className="grid gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono text-xs break-all">{order._id}</p>
                </div>
                <span className="px-2 py-1 rounded text-xs bg-gray-100 capitalize">{status}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Delivery address</p>
                  <p className="font-medium">
                    {order?.deliveryAddress?.address || "—"}, {order?.deliveryAddress?.city || "—"},{" "}
                    {order?.deliveryAddress?.state || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-semibold">₹{totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h2 className="font-semibold mb-3">Status</h2>
              <div className="grid gap-2">
                {steps.map((st) => (
                  <Step key={st.s} label={st.s} active={st.active} />
                ))}
              </div>
              <div ref={mapElRef} className="mt-3 h-64 rounded-lg overflow-hidden" />
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h2 className="font-semibold mb-3">Items</h2>
              <div className="divide-y">
                {items.map((it, idx) => (
                  <div key={it?.item?._id || idx} className="py-2 flex items-center gap-3">
                    <img
                      src={it?.item?.image}
                      alt={it?.item?.name || "item"}
                      className="w-14 h-14 rounded object-cover bg-gray-100"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{it?.item?.name || "Unavailable"}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {it?.item?.category} • {it?.item?.foodtype}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">× {it?.quantity || 1}</p>
                      <p className="font-semibold">
                        ₹{((Number(it?.price) || 0) * (it?.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate("/orders")} className="px-4 py-2 rounded-lg border hover:bg-gray-50" type="button">
                Back to orders
              </button>
              <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" type="button">
                Go to home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
