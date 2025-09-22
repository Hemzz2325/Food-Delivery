// src/components/FoodCard.jsx
import React from "react";
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaPlus, FaShoppingCart, FaMinus } from "react-icons/fa";

/**
 * Render star rating
 */
const renderStars = (rating = 0) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= rating ? (
        <FaStar key={i} className="text-yellow-400 text-sm" />
      ) : (
        <FaRegStar key={i} className="text-yellow-400 text-sm" />
      )
    );
  }
  return stars;
};

const FoodCard = ({ data, onAddToCart, cartItem }) => {
  const handleAddToCart = () => {
    onAddToCart({ ...data, quantity: 1 });
  };

  const handleIncreaseQuantity = () => {
    onAddToCart({ ...data, quantity: (cartItem?.quantity || 0) + 1 });
  };

  const handleDecreaseQuantity = () => {
    if (cartItem && cartItem.quantity > 1) {
      onAddToCart({ ...data, quantity: cartItem.quantity - 1 });
    } else {
      onAddToCart({ ...data, quantity: 0 });
    }
  };

  const currentQuantity = cartItem?.quantity || 0;

  return (
    <div className="w-[200px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Food Image */}
      <div className="relative w-full h-[140px] flex justify-center items-center bg-white overflow-hidden rounded-t-2xl transform transition-transform duration-300 group-hover:scale-105">
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md z-10">
          {data.foodtype === "veg" ? (
            <FaLeaf className="text-green-600 text-sm" />
          ) : (
            <FaDrumstickBite className="text-red-600 text-sm" />
          )}
        </div>
        <img
          src={data.image || "/assets/food-default.jpg"}
          alt={data.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>

      {/* Food Details */}
      <div className="flex-1 flex flex-col p-3 gap-1">
        <h1 className="font-semibold text-gray-900 text-sm truncate">{data.name}</h1>
        <div className="flex items-center gap-1">
          {renderStars(Math.round(data.rating?.average || 0))}
          <span className="text-gray-500 text-[10px]">({data.rating?.count || 0})</span>
        </div>
        <p className="text-xs text-gray-600 capitalize truncate">{data.category}</p>

        {/* Shop Name */}
        {data.shop && (
          <div className="mt-1 text-gray-700 text-[10px]">
            <p className="font-semibold text-gray-800 truncate">{data.shop.name}</p>
          </div>
        )}
      </div>

      {/* Price & Counter */}
      <div className="flex items-center justify-between px-3 pb-3">
        <span className="font-bold text-gray-700 text-sm">₹{data.price}</span>

        <div className="flex items-center gap-1">
          {currentQuantity === 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-1 text-xs"
            >
              <FaShoppingCart size={12} />
              Add
            </button>
          ) : (
            <div className="flex items-center border rounded-full overflow-hidden shadow-sm bg-white">
              <button
                onClick={handleDecreaseQuantity}
                className="px-2 py-1 hover:bg-gray-100 transition-colors text-red-500"
              >
                <FaMinus size={10} />
              </button>
              <span className="px-3 py-1 font-medium text-gray-800 bg-gray-50 text-xs">
                {currentQuantity}
              </span>
              <button
                onClick={handleIncreaseQuantity}
                className="px-2 py-1 hover:bg-gray-100 transition-colors text-red-500"
              >
                <FaPlus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
