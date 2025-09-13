import React from "react";
import { assets } from "../assets/assets";

/**
 * CategoryCard
 * Props:
 *  - name: string
 *  - image: url string
 */
function CategoryCard({ name, image }) {
  return (
    <div className="group w-[130px] h-[130px] md:w-[180px] md:h-[180px] rounded-2xl border-2 border-[#ff4d2d] relative shrink-0 overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer">
      {/* Category Image */}
      <img
        src={image || assets.logo}
        alt={name || "category"}
        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition duration-300"></div>

      {/* Category Name */}
      <div className="absolute bottom-0 left-0 w-full px-2 py-2 text-center">
        <span className="text-sm md:text-base font-semibold text-white drop-shadow-md group-hover:text-yellow-300 transition-colors duration-300">
          {name}
        </span>
      </div>
    </div>
  );
}

export default CategoryCard;
