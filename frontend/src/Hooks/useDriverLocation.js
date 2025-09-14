import { useEffect } from "react";
import { io } from "socket.io-client";
import { serverUrl } from "../config";

// Use the same server URL as backend
const socket = io(serverUrl); // Changed from "http://localhost:5000"

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