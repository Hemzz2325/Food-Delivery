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
    <div className="w-full min-h-screen pt-[100px] flex flex-col items-center bg-gradient-to-b from-orange-50 to-white relative">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-1 text-red-600 font-medium hover:text-red-700 transition-colors"
      >
        <IoIosArrowBack size={22} />
        <span>Back</span>
      </button>

      {/* Card */}
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-200 mt-12">
        {/* Icon */}
        <div className="bg-orange-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto -mt-16 shadow-md">
          <FaUtensils className="text-red-500 w-12 h-12" />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mt-6">
          Add New Food Item
        </h2>
        <p className="text-gray-500 text-center mt-2">
          Fill in the details below to add your dish
        </p>

        {/* Success & Error */}
        {success && (
          <div className="flex items-center justify-center gap-2 bg-green-100 text-green-800 p-3 rounded-lg mt-4 animate-fade-in">
            <FaCheckCircle />
            <span>Item added successfully! Redirecting...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mt-4 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5 mt-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Food Name
            </label>
            <input
              type="text"
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                formErrors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter food name"
              onChange={(e) => {
                setName(e.target.value);
                if (formErrors.name)
                  setFormErrors((prev) => ({ ...prev, name: null }));
              }}
              value={name}
              disabled={loading}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Price
            </label>
            <input
              type="number"
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                formErrors.price ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter price"
              onChange={(e) => {
                setPrice(e.target.value);
                if (formErrors.price)
                  setFormErrors((prev) => ({ ...prev, price: null }));
              }}
              value={price}
              disabled={loading}
            />
            {formErrors.price && (
              <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Select Category
            </label>
            <select
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                formErrors.category ? "border-red-500" : "border-gray-300"
              }`}
              onChange={(e) => {
                setCategory(e.target.value);
                if (formErrors.category)
                  setFormErrors((prev) => ({ ...prev, category: null }));
              }}
              value={category}
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map((cate, idx) => (
                <option value={cate} key={idx}>
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
            <label className="block text-gray-700 font-semibold mb-1">
              Select Food Type
            </label>
            <select
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
              onChange={(e) => setFoodtype(e.target.value)}
              value={foodtype}
              disabled={loading}
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
          </div>

          {/* Image */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Food Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
              onChange={handleImageChange}
              disabled={loading}
            />
            {formErrors.image && (
              <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
            )}
            {previewImage && (
              <div className="mt-4">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full font-semibold py-3 px-6 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 ${
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
