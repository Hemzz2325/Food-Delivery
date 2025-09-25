// src/components/AddItem.jsx
import React, { useEffect, useState } from "react";
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
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const categories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
    "Drinks",
    "South Indian",
    "North Indian",
    "Punjabi",
    "Chinese",
    "Juices",
    "Desserts",
    "Sandwich",
    "Burger",
    "Pizzas",
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
    if (!price || Number(price) <= 0) errors.price = "Valid price is required";
    if (!imageFile) errors.image = "Image is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      if (formErrors.image)
        setFormErrors((prev) => ({ ...prev, image: null }));
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
      formData.append("price", Number(price));
      formData.append("shop", myShopData._id);
      formData.append("image", imageFile);

      const result = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(
        setMyShopData({
          ...myShopData,
          items: [...(myShopData.items || []), result.data.item],
        })
      );
      setSuccess(true);

      setName("");
      setPrice("");
      setCategory("");
      setFoodtype("veg");
      setPreviewImage(null);
      setImageFile(null);
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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <img
        src="/additem_img1.png"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 object-cover" />

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-1 text-white font-medium hover:text-red-300 transition-colors z-10"
      >
        <IoIosArrowBack size={20} />
        <span>Back</span>
      </button>

      {/* Centered Card */}
      < div className="relative z-10 w-[90%] max-w-md mx-auto mt-12 mb-12 
  bg-white/25 backdrop-blur-md border border-white/50 
  rounded-2xl p-6 shadow-lg transition-all duration-300 
  hover:shadow-2xl hover:scale-[1.01]">

        {/* Icon */}
        <div className="flex justify-center -mt-10">
          <div className="bg-gradient-to-tr p-4 rounded-2xl shadow-md">
         
            <img className="text-white w-8 h-8" src="/cutlery.png" alt="" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-gray-800 mt-4">
          Add New Item
        </h2>
        <p className="text-gray-600 text-center text-sm mt-1">
          Fill in the details below
        </p>
      

      {/* Success & Error */}
      {success && (
        <div className="flex items-center justify-center gap-2 bg-green-500/20 text-green-200 p-2 rounded-lg mt-3 animate-pulse text-sm">
          <FaCheckCircle />
          <span>Item added! Redirecting...</span>
        </div>
      )}
      {error && (
        <div className="bg-red-500/20 text-red-200 p-2 rounded-lg mt-3 text-center text-sm animate-shake">
          {error}
        </div>
      )}

      {/* Form */}
      <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Food Name"
          className="w-full border border-white/30 rounded-lg px-4 py-3 shadow-sm bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full border border-white/30 rounded-lg px-4 py-3 shadow-sm bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={loading}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-white/30 rounded-lg px-4 py-3 shadow-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
          disabled={loading}
        >
          <option value="" className="text-gray-700">
            Select Category
          </option>
          {categories.map((c, i) => (
            <option value={c} key={i} className="text-black">
              {c}
            </option>
          ))}
        </select>
        <select
          value={foodtype}
          onChange={(e) => setFoodtype(e.target.value)}
          className="w-full border border-white/30 rounded-lg px-4 py-3 shadow-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
          disabled={loading}
        >
          <option value="veg" className="text-black">
            Veg
          </option>
          <option value="non-veg" className="text-black">
            Non-Veg
          </option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-white/30 rounded-lg px-4 py-3 shadow-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
          disabled={loading}
        />
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg border border-white/30 mt-2 shadow-lg"
          />
        )}

        <button
          type="submit"
          disabled={loading || success}
          className={`w-full font-semibold py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 text-white text-sm ${loading || success
              ? "bg-gray-400/50 cursor-not-allowed"
              : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 cursor-pointer"
            }`}
        >
          {loading ? <ClipLoader size={16} color="#fff" /> : "Add Item"}
        </button>
      </form>
    </div>
    </div >
  );
};

export default AddItem;
