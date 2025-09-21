// frontend/src/hooks/useTrackDriver.js

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { serverUrl } from "../config";

/**
 * useTrackDriver(orderId, canSend = false)
 * - If canSend=false: joins an order room and listens for 'order:location' updates from the driver.
 * - If canSend=true: also starts a high-accuracy geolocation watch and emits 'driver_location' for that order.
 *
 * This hook does NOT persist or touch Redux; it is completely local and safe for reuse in TrackOrder and Delivery pages.
 */
export default function useTrackDriver(orderId, canSend = false) {
  const [driverPos, setDriverPos] = useState(null);
  const socketRef = useRef(null);
  const watchRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;

    // Create a socket connection to the same origin used by REST (with credentials enabled)
    const socket = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // Join the order-specific room
    socket.emit("join_order", { orderId });

    // Receive live driver locations
    socket.on("order:location", (loc) => {
      setDriverPos(loc); // { lat, lng, ts }
    });

    // Optionally publish device location for the room (delivery role)
    if (canSend && "geolocation" in navigator) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords || {};
          if (typeof latitude === "number" && typeof longitude === "number") {
            socket.emit("driver_location", {
              orderId,
              lat: latitude,
              lng: longitude,
            });
          }
        },
        // Ignore errors silently; UI can choose to show its own prompt
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    }

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      socket.off("order:location");
      socket.disconnect();
    };
  }, [orderId, canSend]);

  return { driverPos };
}
