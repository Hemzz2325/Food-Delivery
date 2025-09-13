import { useEffect } from "react";
import { io } from "socket.io-client";

// Connect to backend Socket.io
const socket = io("http://localhost:5000"); // replace with your backend URL

function useDriverLocation(driverId) {
  useEffect(() => {
    if (!navigator.geolocation) return;

    // Watch driver location
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

    // Clean up on unmount
    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverId]);
}

export default useDriverLocation;
