import React from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate=useNavigate();

  return (
    <div className="w-[100vw] min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6]">
      <Navbar />

      {/* Empty State - No Restaurant Added */}
      {!myShopData && (
        <div className="flex justify-center items-center w-full px-4 md:px-6">
          <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-200 text-center">
            <FaUtensils className="text-red-500 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
              Add Your Restaurant
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              Join our food delivery app and serve thousands of hungry customers every day.  
              Grow your business with <span className="text-red-500 font-semibold">Country-Kitchen</span>!
            </p>
            <button onClick={()=>navigate("/create-edit-shop")} className="mt-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md">
              Get Started
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;
