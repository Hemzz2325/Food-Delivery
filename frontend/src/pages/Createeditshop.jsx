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

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => { setSuccess(false); navigate("/"); }, 2000);
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
      setBackendImage(file);
      setFrontEndImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setError(null));
    setApiError(null);
    setFormErrors({});

    if (!validateForm()) return;

    dispatch(setLoading(true));
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("city", city.trim());
      formData.append("state", shopState.trim());
      formData.append("address", address.trim());
      if (backendImage) formData.append("image", backendImage, backendImage.name || "upload.jpg");

      const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(setMyShopData(result.data.shop || result.data));
      setSuccess(true);
      navigate("/");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to save shop. Please try again.";
      setApiError(errorMessage);
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="w-full min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6] relative">
      <button onClick={() => navigate("/")} className="absolute top-6 left-6 flex items-center gap-1 text-red-600 font-medium hover:text-red-700">
        <IoIosArrowBack size={22} /><span>Back</span>
      </button>

      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100 mt-12">
        <div className="bg-orange-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto -mt-16 shadow-md">
          <FaUtensils className="text-red-500 w-12 h-12" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mt-6">{myShopData ? "Edit Shop" : "Add Shop"}</h2>
        <p className="text-gray-600 text-center mt-2">{myShopData ? "Update your restaurant details below." : "Fill in your restaurant details to get started."}</p>

        {success && <div className="flex items-center justify-center gap-2 bg-green-100 text-green-800 p-3 rounded-lg mt-4"><FaCheckCircle /><span>Shop {myShopData ? "updated" : "created"} successfully! Redirecting...</span></div>}

        {(error || apiError) && <div className="bg-red-100 text-red-800 p-3 rounded-lg mt-4 text-center">{apiError || error}</div>}

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Shop Name</label>
            <input type="text" className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${formErrors.name ? "border-red-500 focus:border-red-600" : "border-neutral-300 focus:border-red-600"}`} placeholder="Enter your shop name" onChange={(e) => setName(e.target.value)} value={name} disabled={loading} />
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Shop Image</label>
            <input type="file" accept="image/*" className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${formErrors.image ? "border-red-500 focus:border-red-600" : "border-neutral-300 focus:border-red-600"}`} onChange={handleImage} disabled={loading} />
            {formErrors.image && <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>}
            {frontEndImage && <div className="mt-4"><img src={frontEndImage} alt="Preview" className="w-full h-48 object-cover rounded-lg border" /></div>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">State</label>
              <input type="text" className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${formErrors.state ? "border-red-500 focus:border-red-600" : "border-neutral-300 focus:border-red-600"}`} placeholder="State" onChange={(e) => setShopState(e.target.value)} value={shopState} disabled={loading} />
              {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">City</label>
              <input type="text" className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${formErrors.city ? "border-red-500 focus:border-red-600" : "border-neutral-300 focus:border-red-600"}`} placeholder="City" onChange={(e) => setCity(e.target.value)} value={city} disabled={loading} />
              {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Address</label>
            <input type="text" className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${formErrors.address ? "border-red-500 focus:border-red-600" : "border-neutral-300 focus:border-red-600"}`} placeholder="Enter your shop address" onChange={(e) => setAddress(e.target.value)} value={address} disabled={loading} />
            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
          </div>

          <button type="submit" disabled={loading || success} className={`w-full font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 ${loading || success ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 cursor-pointer"} text-white`}>
            {loading ? <><ClipLoader size={18} color="#ffffff" /><span>Saving...</span></> : success ? <><FaCheckCircle /><span>Saved!</span></> : <span>{myShopData ? "Update Shop" : "Create Shop"}</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Createeditshop;
