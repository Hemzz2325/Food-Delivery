import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import useTrackDriver from "../Hooks/useTrackDriver";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const pipeline = ["pending", "paid", "confirmed", "preparing", "out_for_delivery", "delivered"];

const SPEED_KMPH_FALLBACK = 18;
const toRad = (v) => (v * Math.PI) / 180;
function haversineKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDlat = Math.sin(dLat / 2);
  const sinDlon = Math.sin(dLon / 2);
  const h = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
  return 2 * R * Math.asin(Math.sqrt(h)) || 0;
}

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

  const { driverPos } = useTrackDriver(orderId || null, false);

  // Leaflet refs
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const lineRef = useRef(null);

  const [dest, setDest] = useState(null); // {lat, lng}
  const [seedDriver, setSeedDriver] = useState(null); // {lat, lng} from backend if available
  const [distanceKm, setDistanceKm] = useState(null);
  const [etaMin, setEtaMin] = useState(null);

  useEffect(() => {
    if (mapRef.current || !mapElRef.current) return;
    Promise.resolve().then(() => {
      if (mapRef.current || !mapElRef.current) return;
      mapRef.current = L.map(mapElRef.current).setView([20.5937, 78.9629], 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);
    });
  }, []);

  const tryFitBounds = () => {
    if (!mapRef.current) return;
    const pts = [];
    if (driverMarkerRef.current) pts.push(driverMarkerRef.current.getLatLng());
    if (destMarkerRef.current) pts.push(destMarkerRef.current.getLatLng());
    if (pts.length >= 2) {
      mapRef.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 16, animate: true });
    }
  };

  const updateRouteOverlay = () => {
    if (!mapRef.current || !driverMarkerRef.current || !destMarkerRef.current) return;
    const a = driverMarkerRef.current.getLatLng();
    const b = destMarkerRef.current.getLatLng();
    const d = haversineKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });

    const style = d != null && d < 0.08
      ? { color: "#2563eb", weight: 5, opacity: 0.9, dashArray: null }
      : { color: "#2563eb", weight: 3, opacity: 0.7, dashArray: "6,6" };

    if (!lineRef.current) {
      lineRef.current = L.polyline([a, b], style).addTo(mapRef.current);
    } else {
      lineRef.current.setLatLngs([a, b]);
      lineRef.current.setStyle(style);
    }

    setDistanceKm(d);
    setEtaMin(d != null ? Math.max(1, Math.round((d / SPEED_KMPH_FALLBACK) * 60)) : null);
  };

  // Destination marker
  useEffect(() => {
    if (!dest || !mapRef.current) return;
    if (!destMarkerRef.current) {
      destMarkerRef.current = L.marker([dest.lat, dest.lng], { title: "Destination" }).addTo(mapRef.current);
    } else {
      destMarkerRef.current.setLatLng([dest.lat, dest.lng]);
    }
    updateRouteOverlay(); // draw even if driver arrives later
    tryFitBounds();
  }, [dest]);

  // Driver marker (live socket or seeded)
  useEffect(() => {
    const src = driverPos || seedDriver;
    if (!src || !mapRef.current) return;
    const { lat, lng } = src;
    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker([lat, lng], { title: "Delivery partner" }).addTo(mapRef.current);
    } else {
      driverMarkerRef.current.setLatLng([lat, lng]);
    }
    updateRouteOverlay();
    if (!dest) {
      mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom() || 13, 13), { animate: true });
    } else {
      tryFitBounds();
    }
  }, [driverPos, seedDriver, dest]);

  // Load order and set destination + seed driver if available
  const load = async () => {
    if (!orderId) return;
    setErr("");
    setLoading(true);
    try {
      let resp = await api.get(`/api/order/${orderId}`, { withCredentials: true });
      let o = resp?.data?.order || resp?.data?.data || resp?.data || null;
      if (!o) {
        resp = await api.get(`/api/order/owner/${orderId}`, { withCredentials: true });
        o = resp?.data?.order || resp?.data?.data || resp?.data || null;
      }
      if (o) o.items = (Array.isArray(o.items) ? o.items : []).filter((it) => it?.item);
      setOrder(o);

      const d = o?.deliveryAddress;
      if (d && typeof d.lat === "number" && typeof d.lng === "number") {
        setDest({ lat: d.lat, lng: d.lng });
      } else if (d?.address || d?.city || d?.state) {
        const query = [d?.address, d?.city, d?.state].filter(Boolean).join(", ");
        if (query) {
          try {
            const geo = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
            ).then((r) => r.json());
            if (Array.isArray(geo) && geo.length) {
              setDest({ lat: parseFloat(geo[0].lat), lng: parseFloat(geo[0].lon) });
            }
          } catch {}
        }
      }

      const last = o?.driverLastLocation;
      if (last && typeof last.lat === "number" && typeof last.lng === "number") {
        setSeedDriver({ lat: last.lat, lng: last.lng });
      }

      if (!o) setErr("Order not found");
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Failed to load order");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const items = order?.items || [];
  const totalAmount = Number(order?.totalAmount || 0);
  const status = (order?.status || "pending").toLowerCase();

  const steps = useMemo(() => {
    const idx = pipeline.indexOf(status);
    return pipeline.map((s, i) => ({ s, active: i <= (idx === -1 ? 0 : idx) }));
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Back" type="button">
            <IoIosArrowBack size={22} />
          </button>
          <h1 className="text-2xl font-semibold">Track Order</h1>
        </div>

        {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-3 text-sm">{err}</div>}

        <div className="bg-white rounded-lg p-4 shadow-sm border mb-4">
          <div className="flex items-end justify-between">
            <h2 className="font-semibold">Live map</h2>
            {distanceKm != null && (
              <div className="text-sm text-gray-700">
                {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`} away
                {etaMin != null ? ` • ~${etaMin} min` : ""}
              </div>
            )}
          </div>
          <div ref={mapElRef} className="mt-2 h-64 min-h-[16rem] rounded-lg overflow-hidden" />
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 bg-green-600 rounded-full" />
              <span>Delivery partner</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full" />
              <span>Destination</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-blue-600" />
              <span>Route</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">Loading…</div>
        ) : order ? (
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
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TrackOrder;
