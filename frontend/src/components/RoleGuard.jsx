import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RoleGuard = ({ allow, children }) => {
  const role = useSelector((s) => s.user?.userData?.role);
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
};

export default RoleGuard;
