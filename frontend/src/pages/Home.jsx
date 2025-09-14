// src/pages/Home.jsx
import React from "react";
import UserDashboard from "../components/UserDashboard";
import DeliveryBoy from "../components/DeliveryBoy";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import OwnerItemcard from "../components/OwnerItemcard";
import { useNavigate } from "react-router-dom";
import { FaStore, FaPlus, FaEdit, FaUtensils } from "react-icons/fa";

// Inline OwnerDashboard component to avoid file conflicts
const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { myShopData, loading } = useSelector((state) => state.owner);
  const { userData } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="w-full min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6]">
        <Navbar />
        <div className="flex items-center justify-center mt-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6]">
      <Navbar />

      <div className="w-full max-w-6xl p-4 space-y-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-4 rounded-full">
              <FaStore className="text-red-500 text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {userData?.fullName}!
              </h1>
              <p className="text-gray-600">Manage your restaurant and menu items</p>
            </div>
          </div>
        </div>

        {/* Shop Management Section */}
        {!myShopData ? (
          // No Shop Created Yet
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-200 text-center">
            <div className="bg-orange-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FaStore className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Create Your First Restaurant
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by setting up your restaurant profile. Add your restaurant details, 
              upload photos, and start adding delicious menu items.
            </p>
            <button
              onClick={() => navigate("/create-edit-shop")}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <FaPlus />
              Create Restaurant
            </button>
          </div>
        ) : (
          // Shop Exists - Show Shop Details and Items
          <>
            {/* Shop Details Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-200">
              <div className="relative h-48 bg-gradient-to-r from-red-500 to-pink-500">
                {myShopData.image && (
                  <img
                    src={myShopData.image}
                    alt={myShopData.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute bottom-4 left-6 text-white">
                  <h2 className="text-3xl font-bold">{myShopData.name}</h2>
                  <p className="text-white/90">
                    {myShopData.address}, {myShopData.city}, {myShopData.state}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/create-edit-shop")}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <FaEdit />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">
                      {myShopData.items?.length || 0}
                    </div>
                    <div className="text-gray-600">Menu Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">0</div>
                    <div className="text-gray-600">Orders Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">₹0</div>
                    <div className="text-gray-600">Revenue Today</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FaUtensils className="text-red-500 text-2xl" />
                  <h3 className="text-2xl font-bold text-gray-800">Your Menu Items</h3>
                </div>
                <button
                  onClick={() => navigate("/add-item")}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <FaPlus />
                  Add Item
                </button>
              </div>

              {!myShopData.items || myShopData.items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <FaUtensils className="text-gray-400 text-2xl" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    No Menu Items Yet
                  </h4>
                  <p className="text-gray-500 mb-6">
                    Start building your menu by adding your first food item.
                  </p>
                  <button
                    onClick={() => navigate("/add-item")}
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Add First Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myShopData.items.map((item, index) => (
                    <OwnerItemcard key={item._id || index} data={item} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Home = () => {
  const { userData } = useSelector((state) => state.user);

  if (!userData) return null; // loader can be added

  const role = String(userData.role || "").toLowerCase().trim();

  // Each role gets its own specialized dashboard
  if (role === "user") return <UserDashboard />;
  if (role === "owner") return <OwnerDashboard />;
  if (role === "delivery boy") return <DeliveryBoy />;

  return (
    <div className="w-[100vw] min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6]">
      <div className="text-gray-600 mt-8">No dashboard available for role: {userData.role}</div>
    </div>
  );
};

export default Home;