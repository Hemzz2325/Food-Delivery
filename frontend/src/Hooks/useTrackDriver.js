// frontend/src/hooks/useTrackDriver.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Backend URL

export default function useTrackDriver(driverId) {
  const [location, setLocation] = useState({ lat: null, lon: null });

  useEffect(() => {
    socket.on("driver-location-update", (data) => {
      if (data.driverId === driverId) {
        setLocation({ lat: data.lat, lon: data.lon });
      }
    });

    return () => {
      socket.off("driver-location-update");
    };
  }, [driverId]);

  return location;
}
