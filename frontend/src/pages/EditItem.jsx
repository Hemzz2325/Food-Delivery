import React, { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { FaUtensils, FaCheckCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config";
import { setMyShopData, setLoading, setError } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

/**
 * EditItem page
 * - fetches item by id and pre-fills the form
 * - calls PUT /api/item/edit-item/:itemId
 */
const EditItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { itemId } = useParams();
  const { myShopData } = useSelector((store) => store.owner);

  const [currentItem, setCurrentItem] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [name, setName] = useState("");
  const [frontEndImage, setFrontEndImage] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [foodtype, setFoodtype] = useState("veg");
  const [previewImage, setPreviewImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const categories = [
    "breakfast", "lunch", "dinner", "snacks", "drinks",
    "south Indian", "North Indian", "panjabi", "chinees",
    "juices", "Desserts", "sandwich", "burger", "pizzas"
  ];

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { withCredentials: true });
        setCurrentItem(res.data.item);
      } catch (err) {
        console.error("Get item error:", err);
      }
    };
    if (itemId) fetchItem();
  }, [itemId]);

  useEffect(() => {
    if (!currentItem) return;
    setName(currentItem.name || "");
    setFoodtype(currentItem.foodtype || "veg");
    setCategory(currentItem.category || "");
    setFrontEndImage(currentItem.image || "");
    setPrice(currentItem.price || "");
    setPreviewImage(currentItem.image || "");
  }, [currentItem]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => { setSuccess(false); navigate("/"); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Food name is required";
    if (!category.trim()) errors.category = "Category is required";
    if (!price || Number(price) <= 0) errors.price = "Valid price is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      if (formErrors.image) setFormErrors((prev) => ({ ...prev, image: null }));
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
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.put(`${serverUrl}/api/item/edit-item/${itemId}`, formData, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });
      // Update redux shop items (backend returns updated item)
      const updatedItem = res.data.item;
      if (myShopData) {
        const updatedItems = (myShopData.items || []).map((it) => (String(it._id) === String(updatedItem._id) ? updatedItem : it));
        dispatch(setMyShopData({ ...myShopData, items: updatedItems }));
      }

      setSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to update item. Please try again.";
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

        <h2 className="text-2xl font-bold text-center text-gray-800 mt-6">Edit Food</h2>
        <p className="text-gray-600 text-center mt-2">Update your food details below.</p>

        {success && <div className="flex items-center justify-center gap-2 bg-green-100 text-green-800 p-3 rounded-lg mt-4"><FaCheckCircle /><span>Item updated successfully! Redirecting...</span></div>}
        {/* error area is shown by global state */}

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Food Name</label>
            <input type="text" className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${formErrors.name ? "border-red-500" : "border-neutral-300"}`} placeholder="Enter food name" onChange={(e) => { setName(e.target.value); if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: null })); }} value={name} />
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Price</label>
            <input type="number" className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${formErrors.price ? "border-red-500" : "border-neutral-300"}`} placeholder="Enter price" onChange={(e) => { setPrice(e.target.value); if (formErrors.price) setFormErrors((prev) => ({ ...prev, price: null })); }} value={price} />
            {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Select Category</label>
            <select className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${formErrors.category ? "border-red-500" : "border-neutral-300"}`} onChange={(e) => { setCategory(e.target.value); if (formErrors.category) setFormErrors((prev) => ({ ...prev, category: null })); }} value={category}>
              <option value="">Select category</option>
              {categories.map((cate, idx) => <option value={cate} key={idx}>{cate}</option>)}
            </select>
            {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Select Food Type</label>
            <select className="w-full border rounded-lg px-3 py-2 focus:outline-none border-neutral-300" onChange={(e) => setFoodtype(e.target.value)} value={foodtype}>
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Food Image</label>
            <input type="file" accept="image/*" className="w-full border rounded-lg px-3 py-2 focus:outline-none border-neutral-300" onChange={handleImageChange} />
            {previewImage && <div className="mt-4"><img src={previewImage} alt="Preview" className="w-full h-48 object-cover rounded-lg border" /></div>}
          </div>

          <button type="submit" className="w-full font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md bg-red-500 hover:bg-red-600 text-white">
            Update Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
