// src/components/ShopCard.jsx
import React from "react";

const ShopCard = ({ shop }) => {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-[160px]">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
        <img
          src={shop.image || "/assets/shop-default.jpg"}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-sm font-semibold text-gray-800 text-center truncate">{shop.name}</h3>
      <p className="text-xs text-gray-500 text-center truncate">
        {shop.address || `${shop.city || ""}, ${shop.state || ""}`}
      </p>
    </div>
  );
};

export default ShopCard;
