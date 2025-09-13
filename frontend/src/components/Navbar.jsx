import React, { useState } from "react";
import { FaLocationDot, FaPlus } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { serverUrl } from "../config.js";
import { FaReceipt } from "react-icons/fa";
import { setUserData, clearUserData } from "../redux/userSlice.js";

const Navbar = () => {
  const { userData, city } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);

  const [showinfo, setShowinfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("authToken");
      dispatch(clearUserData());
      await axios.post(`${serverUrl}/api/auth/signout`, {}, { withCredentials: true });
      window.location.href = "/signin";
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  return (
    <div className="w-full fixed top-0 z-[50] bg-[#fff9f6] shadow">
      {/* Top navbar row */}
      <div className="h-[70px] flex items-center justify-between px-4 md:px-8">
        {/* Left - Logo */}
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-500">
          Country-Kitchen
        </h1>

        {/* Middle - Search (desktop only) */}
        <div className="hidden md:flex items-center w-[300px] md:w-[400px] lg:w-[500px] h-[50px] bg-white border border-gray-300 rounded-lg shadow px-3 gap-3">
          <div className="flex items-center gap-2 border-r pr-3 text-gray-600 shrink-0">
            <FaLocationDot className="text-red-500" size={20} />
            <span className="truncate text-sm">{city || "Select location"}</span>
          </div>

          {userData?.role === "user" && (
            <div className="flex items-center flex-1 gap-2">
              <FiSearch className="text-red-500" size={20} />
              <input
                className="flex-1 text-sm px-2 outline-none text-gray-600 placeholder-gray-400"
                type="text"
                placeholder="Search delicious foods"
              />
            </div>
          )}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Search Toggle (only for user) */}
          {userData?.role === "user" && (
            <div className="md:hidden">
              {showSearch ? (
                <RxCross2
                  size={22}
                  className="cursor-pointer text-red-500"
                  onClick={() => setShowSearch(false)}
                />
              ) : (
                <FiSearch
                  size={22}
                  className="cursor-pointer text-red-500"
                  onClick={() => setShowSearch(true)}
                />
              )}
            </div>
          )}

          {/* Add Food Item (only for owner) */}
          {userData?.role === "owner" && myShopData && (
            <>
              {/* Desktop Buttons */}
              <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600">
                <FaPlus size={18} />
                <span className="text-sm">Add Food Item</span>
              </button>

              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg text-white bg-[#ff4d2d] relative">
                <FaReceipt />
                <span>Pending Orders</span>
                <span className="absolute -right-2 -top-2 text-xs font-semibold text-white bg-red-600 rounded-full px-[6px] py-[1px]">
                  0
                </span>
              </div>

              {/* Mobile Button */}
              <button className="md:hidden flex items-center gap-2 px-3 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600">
                <FaPlus size={18} />
              </button>
            </>
          )}

          {/* Cart & Orders (only for user) */}
          {userData?.role === "user" && (
            <>
              <div className="relative cursor-pointer">
                <FaShoppingCart size={22} className="text-red-500" />
                <span className="absolute -right-2 -top-2 text-xs font-semibold text-red-600">
                  0
                </span>
              </div>
              <button className="hidden sm:block bg-red-200 hover:bg-red-300 text-red-600 font-medium text-sm py-1.5 px-3 rounded-lg">
                My Orders
              </button>
            </>
          )}

          {/* Avatar + Dropdown */}
          <div className="relative">
            <div
              onClick={() => setShowinfo((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center text-base font-semibold cursor-pointer"
            >
              {userData?.fullName?.slice(0, 1).toUpperCase() || "U"}
            </div>

            {showinfo && (
              <div className="absolute right-0 mt-2 w-[180px] bg-white shadow-2xl rounded-lg p-4 border border-gray-300 z-[9999] flex flex-col gap-4">
                {userData?.fullName && (
                  <h2 className="text-lg font-semibold text-gray-700">
                    Hello, {userData.fullName}
                  </h2>
                )}
                <div className="text-red-600 font-semibold">My Orders</div>
                <div
                  className="text-red-600 font-semibold cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && userData?.role === "user" && (
        <div className="md:hidden w-[90%] mx-auto mt-2 h-[50px] bg-white border border-gray-300 rounded-lg shadow flex items-center px-3 gap-3">
          <div className="flex items-center gap-2 border-r pr-3 text-gray-600 shrink-0">
            <FaLocationDot className="text-red-500" size={20} />
            <span className="truncate text-sm">{city || "Select location"}</span>
          </div>
          <div className="flex items-center flex-1 gap-2">
            <FiSearch className="text-red-500" size={20} />
            <input
              className="flex-1 text-sm px-2 outline-none text-gray-600 placeholder-gray-400"
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
