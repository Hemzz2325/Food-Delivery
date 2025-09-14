import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { serverUrl } from "../config";

const socket = io(serverUrl); // Changed from "http://localhost:5000"

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