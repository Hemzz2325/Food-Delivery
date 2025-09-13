import React, { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaCheckCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config";
import { setMyShopData, setLoading, setError } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const AddItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myShopData, loading, error } = useSelector((store) => store.owner);

  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [foodtype, setFoodtype] = useState("veg");
  const [frontEndImage, setFrontEndImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  const categories = [
    "breakfast", "lunch", "dinner", "snacks", "drinks",
    "south Indian", "North Indian", "panjabi", "chinees",
    "juices", "Desserts", "sandwich", "burger", "pizzas"
  ];

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
    if (!name.trim()) errors.name = "Food name is required";
    if (!category.trim()) errors.category = "Category is required";
    if (!price || price <= 0) errors.price = "Valid price is required";
    if (!foodtype) errors.foodtype = "Food type is required";
    if (!backendImage) errors.image = "Image is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontEndImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setError(null));
    setFormErrors({});

    if (!validateForm()) return;
    dispatch(setLoading(true));

    try {
      if (!myShopData?._id) {
        dispatch(setError("Shop not selected or loaded"));
        dispatch(setLoading(false));
        return;
      }

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", category);
      formData.append("foodtype", foodtype);
      formData.append("price", price);
      formData.append("shop", myShopData._id); // ✅ include shop ID
      formData.append("image", backendImage); // ✅ include File object

      const result = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(setMyShopData(result.data.shop || result.data));
      setSuccess(true);
      setName("");
      setPrice("");
      setCategory("");
      setFoodtype("veg");
      setFrontEndImage(null);
      setBackendImage(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save item. Please try again.";
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
          Add Food
        </h2>
        <p className="text-gray-600 text-center mt-2">
          Fill in your food details below.
        </p>

        {success && (
          <div className="flex items-center justify-center gap-2 bg-green-100 text-green-800 p-3 rounded-lg mt-4">
            <FaCheckCircle />
            <span>Item added successfully! Redirecting...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mt-4 text-center">
            {error}
          </div>
        )}

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          {/* Food Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Food Name
            </label>
            <input
              type="text"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                formErrors.name ? "border-red-500" : "border-neutral-300"
              }`}
              placeholder="Enter food name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              disabled={loading}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Price</label>
            <input
              type="number"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                formErrors.price ? "border-red-500" : "border-neutral-300"
              }`}
              placeholder="Enter price"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              disabled={loading}
            />
            {formErrors.price && (
              <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select Category
            </label>
            <select
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                formErrors.category ? "border-red-500" : "border-neutral-300"
              }`}
              onChange={(e) => setCategory(e.target.value)}
              value={category}
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map((cate, index) => (
                <option value={cate} key={index}>
                  {cate}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
            )}
          </div>

          {/* Food Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select Food Type
            </label>
            <select
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                formErrors.foodtype ? "border-red-500" : "border-neutral-300"
              }`}
              onChange={(e) => setFoodtype(e.target.value)}
              value={foodtype}
              disabled={loading}
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
            {formErrors.foodtype && (
              <p className="text-red-500 text-sm mt-1">{formErrors.foodtype}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Food Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none border-neutral-300"
              onChange={handleImage}
              disabled={loading}
            />
            {formErrors.image && (
              <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
            )}
            {frontEndImage && (
              <div className="mt-4">
                <img
                  src={frontEndImage}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 ${
              loading || success
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 cursor-pointer"
            } text-white`}
          >
            {loading ? (
              <>
                <ClipLoader size={18} color="#ffffff" />
                <span>Saving...</span>
              </>
            ) : success ? (
              <>
                <FaCheckCircle />
                <span>Saved!</span>
              </>
            ) : (
              <span>Add Item</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
