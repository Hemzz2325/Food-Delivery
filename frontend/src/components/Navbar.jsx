// src/components/Navbar.jsx
import React, { useState } from "react";
import { FaMapMarkerAlt, FaPlus, FaReceipt, FaShoppingCart } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config";
import { clearUserData } from "../redux/userSlice";
import { Link, useNavigate } from "react-router-dom"; // add Link

const Navbar = ({ cartItemsCount = 0, onCartClick = () => { } }) => { // safe default
  const { userData, city } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  const [showinfo, setShowinfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dispatch = useDispatch();

  const displayLocation = city && city !== "Detecting..." ? city : "Detecting location...";

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
    <div className="w-full fixed top-0 z-[50] bg-[#fff9f6] shadow-md">
      <div className="h-[70px] flex items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <h1
          className="text-xl md:text-2xl lg:text-3xl font-bold text-red-500 select-none cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => navigate("/")}
        >
          Country-Kitchen
        </h1>

        {/* Search & Location */}
        <div className="hidden md:flex items-center w-[300px] md:w-[400px] lg:w-[500px] h-[50px] bg-white border border-gray-300 rounded-xl shadow-md hover:shadow-xl px-3 gap-3 transition-all duration-300">
          <div className="flex items-center gap-2 border-r pr-3 text-gray-600 shrink-0">
            <FaMapMarkerAlt className="text-red-500" size={20} />
            <span className="truncate text-sm" title={displayLocation}>
              {displayLocation}
            </span>
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

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Search Toggle */}
          {userData?.role === "user" && (
            <div className="md:hidden">
              {showSearch ? (
                <RxCross2
                  size={22}
                  className="cursor-pointer text-red-500 hover:scale-110 transition-transform duration-300"
                  onClick={() => setShowSearch(false)}
                />
              ) : (
                <FiSearch
                  size={22}
                  className="cursor-pointer text-red-500 hover:scale-110 transition-transform duration-300"
                  onClick={() => setShowSearch(true)}
                />
              )}
            </div>
          )}

          {/* Owner Actions */}
          {userData?.role === "owner" && myShopData && (
            <>
              <button
                onClick={() => navigate("/add-item")}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <FaPlus size={18} />
                <span className="text-sm">Add Food Item</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/owner/orders")}
                className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg text-white bg-[#ff4d2d] relative shadow-md hover:shadow-xl transition"
              >
                <FaReceipt />
                <span>Pending Orders</span>
                <span className="absolute -right-2 -top-2 text-xs font-semibold text-white bg-red-600 rounded-full px-[6px] py-[1px]">
                  0
                </span>
              </button>



              <button
                onClick={() => navigate("/add-item")}
                className="md:hidden flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <FaPlus size={18} />
              </button>
            </>
          )}

          {/* User Actions */}
          {userData?.role === "user" && (
            <>
              <div className="relative cursor-pointer group" onClick={onCartClick}>
                <FaShoppingCart size={22} className="text-red-500 hover:scale-110 transition-transform duration-300" />
                {cartItemsCount > 0 && (
                  <span className="absolute -right-2 -top-2 text-xs font-semibold text-white bg-red-600 rounded-full px-[6px] py-[1px] group-hover:scale-110 transition-transform duration-300">
                    {cartItemsCount}
                  </span>
                )}
              </div>

              {/* Use Link (recommended) */}
              <Link
                to="/orders"
                className="hidden sm:block bg-red-200 hover:bg-red-300 text-red-600 font-medium text-sm py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                My Orders
              </Link>

              {/* Or, use a button:
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="hidden sm:block bg-red-200 hover:bg-red-300 text-red-600 font-medium text-sm py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                My Orders
              </button>
              */}
            </>
          )}

          {/* User Avatar */}
          <div className="relative">
            <div
              onClick={() => setShowinfo((p) => !p)}
              className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center text-base font-semibold cursor-pointer select-none hover:scale-110 transition-transform duration-300"
            >
              {userData?.fullName?.slice(0, 1).toUpperCase() || "U"}
            </div>

            {showinfo && (
              <div className="absolute right-0 mt-2 w-[180px] bg-white shadow-2xl rounded-lg p-4 border border-gray-300 z-[9999] flex flex-col gap-4 transition-all duration-300">
                {userData?.fullName && (
                  <h2 className="text-lg font-semibold text-gray-700">Hello, {userData.fullName}</h2>
                )}
                {userData?.role === "user" && (
                  <button
                    type="button"
                    onClick={() => navigate("/orders")}
                    className="text-red-600 font-semibold hover:underline text-left"
                  >
                    My Orders
                  </button>
                )}
                <button
                  type="button"
                  className="text-red-600 font-semibold hover:underline text-left"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && userData?.role === "user" && (
        <div className="md:hidden w-[90%] mx-auto mt-2 mb-2 h-[50px] bg-white border border-gray-300 rounded-xl shadow-md flex items-center px-3 gap-3 transition-all duration-300">
          <div className="flex items-center gap-2 border-r pr-3 text-gray-600 shrink-0">
            <FaMapMarkerAlt className="text-red-500" size={20} />
            <span className="truncate text-sm" title={displayLocation}>
              {displayLocation}
            </span>
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
