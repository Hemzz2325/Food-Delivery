import React from "react";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";

/**
 * OwnerItemcard
 * - data: item object
 */
const OwnerItemcard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await axios.delete(`${serverUrl}/api/item/delete/${itemId}`, { withCredentials: true });
      // server returns shop after deletion in our backend
      if (res.data?.shop) dispatch(setMyShopData(res.data.shop));
    } catch (error) {
      console.error("Delete item error:", error);
    }
  };

  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl">
      <div className="w-36 h-full flex-shrink-0 bg-gray-50">
        <img src={data.image || "/assets/food-default.jpg"} className="w-full h-full object-cover" alt={data.name} />
      </div>
      <div className="flex flex-col justify-between p-3 flex-1">
        <div>
          <h2 className="text-base font-semibold text-red-500">{data.name}</h2>
          <p><span className="font-medium text-gray-500">category</span>: {data.category}</p>
          <p><span className="font-medium text-gray-500">Food Type</span>: {data.foodtype}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-red-600 font-bold">₹ {data.price}</p>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full hover:bg-[#ff4d2d]/10 text-red-500 cursor-pointer" onClick={() => navigate(`/edit-item/${data._id}`)}><FaPen size={16} /></div>
            <div className="p-2 rounded-full hover:bg-[#ff4d2d]/10 text-red-500 cursor-pointer" onClick={() => handleDeleteItem(data._id)}><FaTrashAlt size={16} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemcard;
