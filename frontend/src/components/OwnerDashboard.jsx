import React from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaPen } from "react-icons/fa";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();

  return (
    <div className="w-[100vw] min-h-screen pt-[80px] flex flex-col items-center bg-[#fff9f6]">
      <Navbar />

      {/* Empty State - No Restaurant Added */}
      {!myShopData && (
        <div className="flex justify-center items-center w-full px-3">
          <div className="w-full max-w-sm bg-white shadow-md rounded-lg p-5 border border-gray-200 text-center">
            <FaUtensils className="text-red-500 w-12 h-12 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-gray-800 mb-2">
              Add Your Restaurant
            </h1>
            <p className="text-gray-600 text-xs mb-4">
              Join our food delivery app and serve thousands of hungry customers
              every day. Grow your business with{" "}
              <span className="text-red-500 font-semibold">Country-Kitchen</span>!
            </p>
            <button
              onClick={() => navigate("/create-edit-shop")}
              className="mt-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-4 rounded-md transition-colors shadow-sm text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {myShopData && (
        <div className="w-full flex flex-col items-center gap-4 px-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mt-5 text-center">
            <FaUtensils className="text-red-500 w-6 h-6" />
            Welcome to {myShopData.name || "Your Restaurant"}
          </h2>

          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-orange-200 hover:shadow-lg transition-all duration-300 w-full max-w-md relative">
            <div
              className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-full shadow-sm hover:bg-orange-600 transition-colors cursor-pointer"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={14} />
            </div>

            {myShopData.image ? (
              <img
                className="w-full h-32 object-cover"
                src={myShopData.image}
                alt={myShopData.name || "Shop Image"}
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center bg-gray-100 text-gray-400">
                No Image
              </div>
            )}

            <div className="p-3">
              <h1 className="text-base font-bold text-gray-800 mb-1">
                {myShopData.name || "Your Restaurant"}
              </h1>
              <p className="text-gray-500 text-sm mb-1">
                {myShopData.city || "City"}, {myShopData.state || "State"}
              </p>
              <p className="text-gray-500 text-sm">{myShopData.address || ""}</p>
            </div>
          </div>

          {(myShopData.items?.length ?? 0) === 0 && (
            <div className="flex justify-center items-center w-full px-3">
              <div className="w-full max-w-sm bg-white shadow-md rounded-lg p-5 border border-gray-200 text-center">
                <FaUtensils className="text-red-500 w-12 h-12 mx-auto mb-4" />
                <h1 className="text-lg font-bold text-gray-800 mb-2">
                  Add Your Food Items
                </h1>
                <p className="text-gray-600 text-xs mb-4">
                  Add items <span className="text-red-500 font-semibold">Country-Kitchen</span>!
                </p>
                <button
                  onClick={() => navigate("/add-item")}
                  className="mt-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-4 rounded-md transition-colors shadow-sm text-sm"
                >
                  Add Food
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
