// frontend/src/components/TrackDelivery.jsx
import React from "react";
import useTrackDriver from "../Hooks/useTrackDriver";

function TrackDelivery({ driverId }) {
  const location = useTrackDriver(driverId);

  return (
    <div>
      Driver Location: {location.lat || "-"}, {location.lon || "-"}
    </div>
  );
}

export default TrackDelivery;
