// src/components/ShopCard.jsx
import React from "react";

const ShopCard = ({ shop }) => {
  return (
    <div className="w-[160px] perspective">
      <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 hover:rotate-y-6 transition-all duration-500">
        {/* Shop Image */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
          <img
            src={shop.image || "/assets/shop-default.jpg"}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Shop Name */}
        <h3
          className="text-sm font-semibold text-gray-800 text-center line-clamp-1 w-full"
          title={shop.name}
        >
          {shop.name}
        </h3>

        {/* Shop Address */}
        <p
          className="text-xs text-gray-500 text-center line-clamp-2 w-full"
          title={shop.address || `${shop.city || ""}, ${shop.state || ""}`}
        >
          {shop.address || `${shop.city || ""}, ${shop.state || ""}`}
        </p>
      </div>
    </div>
  );
};

export default ShopCard;
