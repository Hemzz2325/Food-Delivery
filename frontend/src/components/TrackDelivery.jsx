// src/components/TrackDelivery.jsx
import React from "react";
import useTrackDriver from "../Hooks/useTrackDriver";

function TrackDelivery({ driverId }) {
  const location = useTrackDriver(driverId);

  if (!driverId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">No delivery in progress</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Track Your Delivery</h3>
      <div className="space-y-2">
        <p><strong>Driver ID:</strong> {driverId}</p>
        <p><strong>Current Location:</strong></p>
        <div className="ml-4 text-sm text-gray-600">
          <p>Latitude: {location.lat || "Loading..."}</p>
          <p>Longitude: {location.lon || "Loading..."}</p>
        </div>
      </div>
    </div>
  );
}

export default TrackDelivery;