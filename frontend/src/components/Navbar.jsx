// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaPlus, FaReceipt, FaShoppingCart } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config";
import { clearUserData } from "../redux/userSlice";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

const Navbar = ({ cartItemsCount = 0 }) => {
  const { userData, city } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showinfo, setShowinfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const displayLocation = city && city !== "Detecting..." ? city : "Detecting location...";
  const BASE_URL = import.meta.env.VITE_SERVER_URL || serverUrl || "http://localhost:8000";

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.get("/api/order/owner/pending-count", {
        baseURL: BASE_URL,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
        validateStatus: () => true,
      });
      if (res.status === 200 && typeof res.data?.count !== "undefined") {
        setPendingCount(Number(res.data.count) || 0);
        return;
      }
      setPendingCount(0);
    } catch {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    if (userData?.role === "owner" && myShopData) {
      fetchPending();
      const t = setInterval(fetchPending, 60_000);
      return () => clearInterval(t);
    } else {
      setPendingCount(0);
    }
  }, [userData?.role, myShopData]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("authToken");
      dispatch(clearUserData());
      await axios.post(`${BASE_URL}/api/auth/signout`, {}, { withCredentials: true });
      window.location.href = "/signin";
    } catch {}
  };

  return (
    <div className="w-full fixed top-0 z-[50] bg-white shadow-md">
      <div className="h-[70px] flex items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <h1
          className="text-xl md:text-2xl lg:text-3xl font-bold text-[#EF233C] select-none cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => navigate("/")}
        >
          Country-Kitchen
        </h1>

        {/* Search & Location */}
        <div className="hidden md:flex items-center w-[300px] md:w-[400px] lg:w-[500px] h-[50px] bg-white border border-gray-300 rounded-xl shadow-md px-3 gap-3">
          <div className="flex items-center gap-2 border-r pr-3 text-gray-600 shrink-0">
            <FaMapMarkerAlt className="text-[#EF233C]" size={20} />
            <span className="truncate text-sm" title={displayLocation}>
              {displayLocation}
            </span>
          </div>

          {userData?.role === "user" && (
            <div className="flex items-center flex-1 gap-2">
              <FiSearch className="text-[#EF233C]" size={20} />
              <input
                className="flex-1 text-sm px-2 outline-none text-gray-700 placeholder-gray-400"
                type="text"
                placeholder="Search delicious foods"
              />
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {userData?.role === "user" && (
            <>
              {/* Cart */}
              <div className="relative cursor-pointer group" onClick={() => navigate("/checkout")}>
                <FaShoppingCart size={22} className="text-[#EF233C] hover:scale-110 transition-transform duration-300" />
                {cartItemsCount > 0 && (
                  <span className="absolute -right-2 -top-2 text-xs font-semibold text-white bg-[#EF233C] rounded-full px-[6px] py-[1px] group-hover:scale-110 transition-transform duration-300">
                    {cartItemsCount}
                  </span>
                )}
              </div>

              {/* Orders */}
              <Link
                to="/orders"
                className="hidden sm:block bg-[#EF233C] hover:bg-red-700 text-white font-medium text-sm py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                My Orders
              </Link>
            </>
          )}

          {/* Avatar */}
          <div className="relative">
            <div
              onClick={() => setShowinfo((p) => !p)}
              className="w-9 h-9 rounded-full bg-[#EF233C] text-white flex items-center justify-center text-base font-semibold cursor-pointer select-none hover:scale-110 transition-transform duration-300 shadow-lg"
              style={{ perspective: "600px" }}
            >
              {userData?.fullName?.slice(0, 1).toUpperCase() || "U"}
            </div>

            {showinfo && (
              <div
                className="absolute right-0 mt-2 w-[200px] bg-white shadow-2xl rounded-xl p-4 border border-gray-200 z-[9999] flex flex-col gap-3 transform transition-all duration-500 ease-out"
                style={{
                  transformOrigin: "top right",
                  animation: "dropdownPop 0.5s forwards",
                }}
              >
                {userData?.fullName && (
                  <h2 className="text-lg font-semibold text-gray-700">
                    Hello, {userData.fullName}
                  </h2>
                )}
                {userData?.role === "user" && (
                  <button
                    type="button"
                    onClick={() => navigate("/orders")}
                    className="text-[#EF233C] font-semibold hover:underline text-left"
                  >
                    My Orders
                  </button>
                )}
                <button
                  type="button"
                  className="text-[#EF233C] font-semibold hover:underline text-left"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {showSearch && userData?.role === "user" && (
        <div className="md:hidden w-[90%] mx-auto mt-2 mb-2 h-[50px] bg-white border border-gray-300 rounded-xl shadow-md flex items-center px-3 gap-3">
          <div className="flex items-center gap-2 border-r pr-3 text-gray-600 shrink-0">
            <FaMapMarkerAlt className="text-[#EF233C]" size={20} />
            <span className="truncate text-sm">{displayLocation}</span>
          </div>
          <div className="flex items-center flex-1 gap-2">
            <FiSearch className="text-[#EF233C]" size={20} />
            <input
              className="flex-1 text-sm px-2 outline-none text-gray-700 placeholder-gray-400"
              type="text"
              placeholder="Search delicious foods"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
