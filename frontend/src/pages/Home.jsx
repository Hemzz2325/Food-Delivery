import React from "react";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoy from "../components/DeliveryBoy";
import { useSelector } from "react-redux";

const Home = () => {
  const { userData } = useSelector((state) => state.user);

  if (!userData) return null; // loader can be added

  const role = String(userData.role || "").toLowerCase().trim();

  return (
    <div className="w-[100vw] min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6]">
      {role === "user" && <UserDashboard />}
      {role === "owner" && <OwnerDashboard />}
      {role === "delivery boy" && <DeliveryBoy />}
      {!["user", "owner", "delivery boy"].includes(role) && <div className="text-gray-600 mt-8">No dashboard available for role: {userData.role}</div>}
    </div>
  );
};

export default Home;
