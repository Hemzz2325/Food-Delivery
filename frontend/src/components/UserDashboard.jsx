import React, { useRef, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";
import CategoryCard from "./CategoryCard";
import useCurrentOrder from "../Hooks/useCurrentOrder.js";
import TrackDelivery from "./TrackDelivery";

import menu_1 from "../assets/menu_1.png";
import menu_2 from "../assets/menu_2.png";
import menu_3 from "../assets/menu_3.png";
import menu_4 from "../assets/menu_4.png";
import menu_5 from "../assets/menu_5.png";
import menu_6 from "../assets/menu_6.png";
import menu_7 from "../assets/menu_7.png";
import menu_8 from "../assets/menu_8.png";

const UserDashboard = () => {
  // Fetch current order for driverId
  useCurrentOrder();

  const {
    city: currentCity,
    shopInMyCity: shopsInMyCity = [],
    itemsInMyCity = [],
    categories = [],
    currentOrder,
  } = useSelector((state) => state.user);

  const driverId = currentOrder?.driverId;

  const cateScroll = useRef(null);
  const shopScroll = useRef(null);

  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);

  // ✅ Create category images mapping using imported images
  const categoryImages = {
    "breakfast": menu_1,
    "lunch": menu_6,
    "dinner": menu_7,
    "snacks": menu_2,
    "drinks": menu_8,
    "south indian": menu_6,
    "north indian": menu_5,
    "punjabi": menu_6,
    "chinese": menu_8,
    "juices": menu_3,
    "desserts": menu_3,
    "sandwich": menu_4,
    "burger": menu_2,
    "pizzas": menu_7
  };

  const updateButtons = (ref, setLeft, setRight) => {
    const el = ref.current;
    if (!el) return;
    setLeft(el.scrollLeft > 0);
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollHandler = (ref, direction) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const c = cateScroll.current;
    const s = shopScroll.current;
    const onCateScroll = () =>
      updateButtons(cateScroll, setShowLeftButton, setShowRightButton);
    const onShopScroll = () =>
      updateButtons(shopScroll, setShowLeftShopButton, setShowRightShopButton);

    updateButtons(cateScroll, setShowLeftButton, setShowRightButton);
    updateButtons(shopScroll, setShowLeftShopButton, setShowRightShopButton);

    if (c) c.addEventListener("scroll", onCateScroll);
    if (s) s.addEventListener("scroll", onShopScroll);

    return () => {
      if (c) c.removeEventListener("scroll", onCateScroll);
      if (s) s.removeEventListener("scroll", onShopScroll);
    };
  }, [categories, shopsInMyCity]);

  return (
    <div className="w-full min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6]">
      <Navbar />

      {/* Categories Section */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Inspiration for your first Order
        </h1>

        <div className="w-full relative">
          {showLeftButton && (
            <button
              onClick={() => scrollHandler(cateScroll, "left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition z-10"
            >
              <FaArrowCircleLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={cateScroll}
          >
            {categories.map((cate, index) => (
              <CategoryCard
                name={cate}
                image={categoryImages[cate.toLowerCase()] || menu_1}
                key={index}
              />
            ))}
          </div>

          {showRightButton && (
            <button
              onClick={() => scrollHandler(cateScroll, "right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition z-10"
            >
              <FaArrowCircleRight />
            </button>
          )}
        </div>
      </div>

      {/* Shops Section */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Best Shop in {currentCity || "your city"}
        </h1>

        <div className="w-full relative">
          {showLeftShopButton && (
            <button
              onClick={() => scrollHandler(shopScroll, "left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition z-10"
            >
              <FaArrowCircleLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={shopScroll}
          >
            {(shopsInMyCity || []).map((shop, index) => (
              <CategoryCard
                name={shop.name}
                image={shop.image || "/assets/shop-default.jpg"}
                key={shop._id || index}
              />
            ))}
          </div>

          {showRightShopButton && (
            <button
              onClick={() => scrollHandler(shopScroll, "right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition z-10"
            >
              <FaArrowCircleRight />
            </button>
          )}
        </div>
      </div>

      {/* Food Items Section */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">Suggested Food Items</h1>
        <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
          {(itemsInMyCity || []).map((item, index) => (
            <FoodCard key={item._id || index} data={item} />
          ))}
        </div>
      </div>

      {/* Track Delivery Section */}
      {driverId && (
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
          <h1 className="text-gray-800 text-2xl sm:text-3xl">Track Your Delivery</h1>
          <TrackDelivery driverId={driverId} />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;