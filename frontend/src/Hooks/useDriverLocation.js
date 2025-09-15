import { useEffect } from "react";
import { io } from "socket.io-client";
import { serverUrl } from "../config";

// ✅ CORRECT - Use serverUrl instead of hardcoded port
const socket = io(serverUrl);

function useDriverLocation(driverId) {
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        socket.emit("driver-location", {
          driverId,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => console.warn("Driver location error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverId]);
}

export default useDriverLocation;