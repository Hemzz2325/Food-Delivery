// src/components/UserDashboard.jsx
import React, { useRef, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { FaArrowCircleLeft, FaArrowCircleRight, FaShoppingCart, FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import FoodCard from "./FoodCard";
import CategoryCard from "./CategoryCard";
import TrackDelivery from "./TrackDelivery";
import ShopCard from "./ShopCard";
import useCurrentOrder from "../Hooks/useCurrentOrder.js";
import useGetCity from "../Hooks/useGetCity.jsx";
import { addToCart, removeFromCart, updateCartQuantity, clearCart, setShopsInMyCity } from "../redux/userSlice";
import axios from "axios";
import { serverUrl } from "../config";

// Import menu images
import menu_1 from "../assets/menu_1.png";
import menu_2 from "../assets/menu_2.png";
import menu_3 from "../assets/menu_3.png";
import menu_4 from "../assets/menu_4.png";
import menu_5 from "../assets/menu_5.png";
import menu_6 from "../assets/menu_6.png";
import menu_7 from "../assets/menu_7.png";
import menu_8 from "../assets/menu_8.png";

const UserDashboard = () => {
  useCurrentOrder();
  useGetCity();

  const dispatch = useDispatch();
  const {
    city: currentCity,
    shopsInMyCity = [],
    itemsInMyCity = [],
    categories = [],
    currentOrder,
    cart = [],
  } = useSelector((state) => state.user || {});

  const [showCart, setShowCart] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [filteredItems, setFilteredItems] = useState(itemsInMyCity || []);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userOrders, setUserOrders] = useState([]);

  const driverId = currentOrder?.driverId;

  const cateScroll = useRef(null);
  const shopScroll = useRef(null);

  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);

  const categoryImages = {
    breakfast: menu_1,
    lunch: menu_6,
    dinner: menu_7,
    snacks: menu_2,
    drinks: menu_8,
    "south indian": menu_6,
    "north indian": menu_5,
    punjabi: menu_6,
    chinese: menu_8,
    juices: menu_3,
    desserts: menu_3,
    sandwich: menu_4,
    burger: menu_2,
    pizzas: menu_7,
  };

  // Filter items by category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = (itemsInMyCity || []).filter(
        (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(itemsInMyCity || []);
    }
  }, [selectedCategory, itemsInMyCity]);

  // Fetch shops in current city
  useEffect(() => {
    const fetchShops = async () => {
      if (!currentCity || currentCity === "Detecting..." || currentCity === "Location unavailable") return;
      try {
        const { data } = await axios.get(`${serverUrl}/api/shop/city/${currentCity}`);
        dispatch(setShopsInMyCity(data.shops || []));
      } catch (err) {
        console.error("Failed to fetch shops:", err);
        dispatch(setShopsInMyCity([]));
      }
    };
    fetchShops();
  }, [currentCity, dispatch]);

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/order/my-orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        withCredentials: true,
      });
      setUserOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cart handlers
  const handleAddToCart = (item) => dispatch(addToCart(item));
  const handleRemoveFromCart = (itemId) => dispatch(removeFromCart(itemId));
  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) dispatch(removeFromCart(itemId));
    else dispatch(updateCartQuantity({ itemId, quantity }));
  };

  const cartTotal = (cart || []).reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  const cartItemsCount = (cart || []).reduce((count, item) => count + item.quantity, 0);

  // Scroll button logic
  const updateButtons = (ref, setLeft, setRight) => {
    const el = ref.current;
    if (!el) return;
    setLeft(el.scrollLeft > 0);
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollHandler = (ref, direction) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
  };

  useEffect(() => {
    const c = cateScroll.current;
    const s = shopScroll.current;

    const onCateScroll = () => updateButtons(cateScroll, setShowLeftButton, setShowRightButton);
    const onShopScroll = () => updateButtons(shopScroll, setShowLeftShopButton, setShowRightShopButton);

    updateButtons(cateScroll, setShowLeftButton, setShowRightButton);
    updateButtons(shopScroll, setShowLeftShopButton, setShowRightShopButton);

    if (c) c.addEventListener("scroll", onCateScroll);
    if (s) s.addEventListener("scroll", onShopScroll);

    return () => {
      if (c) c.removeEventListener("scroll", onCateScroll);
      if (s) s.removeEventListener("scroll", onShopScroll);
    };
  }, [categories, shopsInMyCity]);

  // Razorpay payment
  const initializeRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleCheckout = async () => {
    if ((cart || []).length === 0) return;
    setIsProcessingPayment(true);

    try {
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) {
        alert("Razorpay SDK failed to load.");
        setIsProcessingPayment(false);
        return;
      }

      const orderData = {
        items: (cart || []).map((item) => ({ itemId: item._id, quantity: item.quantity, price: item.price })),
        totalAmount: cartTotal,
      };

      const { data } = await axios.post(`${serverUrl}/api/order/create`, orderData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Country Kitchen",
        description: "Food Order Payment",
        order_id: data.id,
        handler: async (response) => {
          try {
            await axios.post(
              `${serverUrl}/api/order/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
              }
            );

            dispatch(clearCart());
            setShowCart(false);
            await fetchOrders(); // refresh orders after payment
            alert("Payment successful!");
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: currentOrder?.userName || "",
          email: currentOrder?.userEmail || "",
          contact: currentOrder?.userPhone || "",
        },
        theme: { color: "#ff4d2d" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to initiate payment.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCategoryClick = (category) => setSelectedCategory(selectedCategory === category ? "" : category);

  return (
    <div className="w-full min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6]">
      <Navbar cartItemsCount={cartItemsCount} onCartClick={() => setShowCart(true)} />

      {/* Categories */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">Inspiration for your first Order</h1>
        <div className="w-full relative">
          {showLeftButton && (
            <button
              onClick={() => scrollHandler(cateScroll, "left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition z-10"
            >
              <FaArrowCircleLeft />
            </button>
          )}
          <div className="w-full flex overflow-x-auto gap-4 pb-2" ref={cateScroll}>
            {(categories || []).map((cate, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(cate)}
                className={`cursor-pointer ${selectedCategory === cate ? "ring-2 ring-red-500" : ""}`}
              >
                <CategoryCard name={cate} image={categoryImages[cate.toLowerCase()] || menu_1} />
              </div>
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

      {/* Shops */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">Best Shops in {currentCity || "your city"}</h1>
        <div className="w-full relative">
          {showLeftShopButton && (
            <button
              onClick={() => scrollHandler(shopScroll, "left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition z-10"
            >
              <FaArrowCircleLeft />
            </button>
          )}
          <div className="w-full flex overflow-x-auto gap-4 pb-2" ref={shopScroll}>
            {(shopsInMyCity || []).map((shop, index) => (
              <ShopCard key={shop._id || index} shop={shop} />
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

      {/* Food Items */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-gray-800 text-2xl sm:text-3xl">
            {selectedCategory ? `${selectedCategory} Items` : "Suggested Food Items"}
          </h1>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory("")}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
          {(filteredItems || []).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {selectedCategory ? `No ${selectedCategory} items found` : "No items available"}
            </div>
          ) : (
            (filteredItems || []).map((item, index) => (
              <FoodCard
                key={item._id || index}
                data={item}
                onAddToCart={handleAddToCart}
                cartItem={(cart || []).find((cartItem) => cartItem._id === item._id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Track Delivery */}
      {driverId && (
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
          <h1 className="text-gray-800 text-2xl sm:text-3xl">Track Your Delivery</h1>
          <TrackDelivery driverId={driverId} />
        </div>
      )}

      {/* My Orders */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">My Orders</h1>
        {userOrders.length === 0 ? (
          <p className="text-gray-500 py-4">You have no orders yet.</p>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            {userOrders.map((order) => (
              <div key={order._id} className="p-4 border rounded-lg bg-white shadow-sm">
                <p className="font-semibold">Order ID: {order._id}</p>
                <p>
                  Status:{" "}
                  <span className={`font-bold ${order.status === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                    {order.status}
                  </span>
                </p>
                <p>Total: ₹{order.totalAmount}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {order.items.map(({ item, quantity }) => (
                    <div key={item._id} className="border p-2 rounded">
                      {item.name} x {quantity}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Cart ({cartItemsCount})</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-4">
              {(cart || []).length === 0 ? (
                <div className="text-center py-8">
                  <FaShoppingCart className="mx-auto text-gray-400 text-4xl mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {(cart || []).map((item) => (
                      <div key={item._id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" loading="lazy" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-red-500 font-bold">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            className="bg-gray-200 p-1 rounded"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="px-2">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            className="bg-gray-200 p-1 rounded"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                        <button onClick={() => handleRemoveFromCart(item._id)} className="text-red-500 hover:text-red-700">
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg flex flex-col gap-2">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total: ₹{cartTotal}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={isProcessingPayment}
                      className={`w-full mt-4 py-3 rounded-lg font-semibold ${
                        isProcessingPayment ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                      } text-white`}
                    >
                      {isProcessingPayment ? "Processing..." : "Proceed to Payment"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
