// src/components/CategoryCard.jsx
import React, { useState } from "react";
import { assets } from "../assets/assets.js";

const CategoryCard = ({ name, image, onClick }) => {
  const [imgSrc, setImgSrc] = useState(image || assets?.bag_icon);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center w-[80px] h-[100px] p-2 rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none"
      aria-label={name ? `Open ${name}` : "Open category"}
    >
      {/* Circular Icon */}
      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 shadow-sm transition-transform duration-300 group-hover:scale-110">
        <img
          src={imgSrc}
          alt={name || "Category"}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(assets?.bag_icon)}
          draggable="false"
          loading="lazy"
        />
        {/* Small glow dot */}
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
      </div>

      {/* Name */}
      <p className="mt-1 text-[12px] text-center font-semibold text-gray-900 truncate">
        {name || "Category"}
      </p>
    </button>
  );
};

export default CategoryCard;
