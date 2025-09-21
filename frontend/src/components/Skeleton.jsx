// frontend/src/components/Skeleton.jsx
import React from "react";

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export default Skeleton;
