import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useSelector } from "react-redux";

const Createeditshop = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { city: CurrentCity, state: CurrentState, address: CurrentAddress } = useSelector((state) => state.user);

  const [name, setname] = useState(myShopData?.name || "");
  const [address, setaddress] = useState(myShopData?.address || CurrentAddress || "");
  const [city, setcity] = useState(myShopData?.city || CurrentCity || "");
  const [state, setstate] = useState(myShopData?.state || CurrentState || "");
  const [image, setimage] = useState(null);

  return (
    <div className="w-full min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6] relative">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-1 text-red-600 font-medium hover:text-red-700"
      >
        <IoIosArrowBack size={22} />
        <span>Back</span>
      </button>

      {/* Card */}
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100 mt-12">
        {/* Icon */}
        <div className="bg-orange-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto -mt-16 shadow-md">
          <FaUtensils className="text-red-500 w-12 h-12" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mt-6">
          {myShopData ? "Edit Shop" : "Add Shop"}
        </h2>

        {/* Subtitle / Instruction */}
        <p className="text-gray-600 text-center mt-2">
          {myShopData
            ? "Update your restaurant details below."
            : "Fill in your restaurant details to get started."}
        </p>

        {/* Form */}
        <form className="space-y-4 mt-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Shop Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 border-neutral-300"
              placeholder="Enter your shop name"
              onChange={(e) => setname(e.target.value)}
              value={name}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Shop Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 border-neutral-300"
              onChange={(e) => setimage(e.target.files[0])}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">State</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 border-neutral-300"
                placeholder="State"
                onChange={(e) => setstate(e.target.value)}
                value={state}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">City</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 border-neutral-300"
                placeholder="City"
                onChange={(e) => setcity(e.target.value)}
                value={city}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Address</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 border-neutral-300"
              placeholder="Enter your shop address"
              onChange={(e) => setaddress(e.target.value)}
              value={address}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md cursor-pointer"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default Createeditshop;
