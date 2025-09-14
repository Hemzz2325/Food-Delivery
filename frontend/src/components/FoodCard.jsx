import React, { useState } from "react";
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaPlus, FaShoppingCart, FaMinus } from "react-icons/fa";

/**
 * Render star rating
 */
const renderStars = (rating = 0) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= rating ? (
        <FaStar key={i} className="text-yellow-500 text-lg" />
      ) : (
        <FaRegStar key={i} className="text-yellow-500 text-lg" />
      )
    );
  }
  return stars;
};

const FoodCard = ({ data }) => {
  const [quantity, setQuantity] = useState(0);

  const handleIncrease = () => setQuantity((q) => q + 1);
  const handleDecrease = () => setQuantity((q) => Math.max(0, q - 1));

  return (
    <div className="w-[250px] bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Food Image */}
      <div className="relative w-full h-[170px] flex justify-center items-center bg-white">
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md">
          {data.foodtype === "veg" ? (
            <FaLeaf className="text-green-600 text-lg" />
          ) : (
            <FaDrumstickBite className="text-red-600 text-lg" />
          )}
        </div>
        <img
          src={data.image || "/assets/food-default.jpg"}
          alt={data.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Food Details */}
      <div className="flex-1 flex flex-col p-4 gap-2">
        <h1 className="font-semibold text-gray-900 text-base truncate">{data.name}</h1>
        <div className="flex items-center gap-1">
          {renderStars(Math.round(data.rating?.average || 0))}
          <span className="text-gray-500 text-xs">({data.rating?.count || 0})</span>
        </div>
      </div>

      {/* Price & Counter */}
      <div className="flex items-center justify-between px-4 pb-4">
        <span className="font-bold text-gray-700 text-lg">₹{data.price}</span>

        {/* Counter */}
        <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
          <button
            onClick={handleDecrease}
            className="px-3 py-1 hover:bg-gray-100 transition-colors"
          >
            <FaMinus size={12} />
          </button>
          <span className="px-4 font-medium text-gray-800">{quantity}</span>
          <button
            onClick={handleIncrease}
            className="px-3 py-1 hover:bg-gray-100 transition-colors"
          >
            <FaPlus size={12} />
          </button>
        </div>

        {/* Add to cart */}
        <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-2 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
          <FaShoppingCart />
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
