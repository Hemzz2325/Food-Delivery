import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaCheckCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config";
import { setMyShopData, setLoading, setError } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const Createeditshop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData, loading, error } = useSelector((store) => store.owner);
  const { city: CurrentCity, state: CurrentState, address: CurrentAddress } = useSelector((store) => store.user);

  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(myShopData?.address || CurrentAddress || "");
  const [city, setCity] = useState(myShopData?.city || CurrentCity || "");
  const [shopState, setShopState] = useState(myShopData?.state || CurrentState || "");
  const [frontEndImage, setFrontEndImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);

  // Debug: Log the server URL and route
  useEffect(() => {
    console.log("🔍 Debug Info:");
    console.log("Server URL:", serverUrl);
    console.log("Shop route:", `${serverUrl}/api/shop/create-edit`);
    console.log("Current user city:", CurrentCity);
    console.log("Existing shop data:", myShopData);
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => { 
        setSuccess(false); 
        navigate("/"); 
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Shop name is required";
    if (!address.trim()) errors.address = "Address is required";
    if (!city.trim()) errors.city = "City is required";
    if (!shopState.trim()) errors.state = "State is required";
    if (!myShopData && !backendImage) errors.image = "Shop image is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("📷 Image selected:", file.name, file.size, "bytes");
      setBackendImage(file);
      setFrontEndImage(URL.createObjectURL(file));
    }
  };

  // Test backend connection first
  const testBackendConnection = async () => {
    try {
      console.log("🔍 Testing backend connection...");
      const response = await axios.get(`${serverUrl}/health`, {
        timeout: 5000,
        withCredentials: true,
      });
      console.log("✅ Backend is running:", response.data);
      return true;
    } catch (error) {
      console.error("❌ Backend connection failed:", error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setError(null));
    setApiError(null);
    setFormErrors({});

    if (!validateForm()) return;

    // Test backend connection first
    const isBackendRunning = await testBackendConnection();
    if (!isBackendRunning) {
      const errorMsg = "Backend server is not running. Please start the backend server on port 8000.";
      setApiError(errorMsg);
      dispatch(setError(errorMsg));
      return;
    }

    dispatch(setLoading(true));
    
    try {
      console.log("📝 Form data being sent:");
      console.log("- Name:", name.trim());
      console.log("- City:", city.trim());
      console.log("- State:", shopState.trim());
      console.log("- Address:", address.trim());
      console.log("- Has Image:", !!backendImage);
      console.log("- Auth Token:", !!localStorage.getItem("authToken"));

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("city", city.trim());
      formData.append("state", shopState.trim());
      formData.append("address", address.trim());
      
      if (backendImage) {
        formData.append("image", backendImage, backendImage.name || "upload.jpg");
        console.log("📷 Image appended to FormData");
      }

      // Log FormData contents
      for (let pair of formData.entries()) {
        console.log("FormData:", pair[0], pair[1]);
      }

      console.log("🚀 Making request to:", `${serverUrl}/api/shop/create-edit`);

      const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, {
        withCredentials: true,
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        timeout: 30000, // 30 second timeout
      });

      console.log("✅ Shop created/updated successfully:", result.data);

      dispatch(setMyShopData(result.data.shop || result.data));
      setSuccess(true);
      
      // Don't navigate immediately, let success message show
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      console.error("❌ Shop creation error:", err);
      
      let errorMessage = "Failed to save shop. Please try again.";
      
      if (err.code === "ECONNREFUSED") {
        errorMessage = "Cannot connect to server. Please make sure the backend is running on port 8000.";
      } else if (err.response?.status === 404) {
        errorMessage = "Shop creation endpoint not found. Please check backend routes.";
      } else if (err.response?.status === 401) {
        errorMessage = "You are not authorized. Please sign in again.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setApiError(errorMessage);
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="w-full min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6] relative">
      <button 
        onClick={() => navigate("/")} 
        className="absolute top-6 left-6 flex items-center gap-1 text-red-600 font-medium hover:text-red-700"
      >
        <IoIosArrowBack size={22} />
        <span>Back</span>
      </button>

      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100 mt-12">
        <div className="bg-orange-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto -mt-16 shadow-md">
          <FaUtensils className="text-red-500 w-12 h-12" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mt-6">
          {myShopData ? "Edit Shop" : "Add Shop"}
        </h2>
        <p className="text-gray-600 text-center mt-2">
          {myShopData ? "Update your restaurant details below." : "Fill in your restaurant details to get started."}
        </p>

        {/* Debug Info */}
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div>Backend: {serverUrl}</div>
          <div>Route: /api/shop/create-edit</div>
          <div>Auth Token: {localStorage.getItem("authToken") ? "Present" : "Missing"}</div>
        </div>

        {success && (
          <div className="flex items-center justify-center gap-2 bg-green-100 text-green-800 p-3 rounded-lg mt-4">
            <FaCheckCircle />
            <span>Shop {myShopData ? "updated" : "created"} successfully! Redirecting...</span>
          </div>
        )}

        {(error || apiError) && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mt-4 text-center">
            {apiError || error}
          </div>
        )}

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Shop Name</label>
            <input 
              type="text" 
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                formErrors.name ? "border-red-500 focus:border-red-600" : "border-neutral-300 focus:border-red-600"
              }`}
              placeholder="Enter your shop name" 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              disabled={loading} 
            />
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Shop Image</label>
            <input 
              type="file" 
              accept="image/*" 
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                formErrors.image ? "border-red-500 focus:border-red-600" : "border-neutral-300 focus:border-red-600"
              }`}
              onChange={handleImage} 
              disabled={loading} 
            />
            {formErrors.image && <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>}
            {frontEndImage && (
              <div className="mt-4">
                <img src={frontEndImage} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">State</label>
              <input 
                type="text" 
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                  formErrors.state ? "border-red-500 focus:border-red-600" : "border-neutral-300 focus:border-red-600"
                }`}
                placeholder="State" 
                onChange={(e) => setShopState(e.target.value)} 
                value={shopState} 
                disabled={loading} 
              />
              {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">City</label>
              <input 
                type="text" 
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                  formErrors.city ? "border-red-500 focus:border-red-600" : "border-neutral-300 focus:border-red-600"
                }`}
                placeholder="City" 
                onChange={(e) => setCity(e.target.value)} 
                value={city} 
                disabled={loading} 
              />
              {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Address</label>
            <input 
              type="text" 
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                formErrors.address ? "border-red-500 focus:border-red-600" : "border-neutral-300 focus:border-red-600"
              }`}
              placeholder="Enter your shop address" 
              onChange={(e) => setAddress(e.target.value)} 
              value={address} 
              disabled={loading} 
            />
            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading || success} 
            className={`w-full font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 ${
              loading || success ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 cursor-pointer"
            } text-white`}
          >
            {loading ? (
              <>
                <ClipLoader size={18} color="#ffffff" />
                <span>Saving...</span>
              </>
            ) : success ? (
              <>

Saved</>
) : myShopData ? (
"Update Shop"
) : (
"Create Shop"
)}
</button>
</form>
</div>
</div>
);
};

export default Createeditshop;