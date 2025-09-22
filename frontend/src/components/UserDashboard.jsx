import React, { useRef, useEffect, useState, useMemo, useCallback, memo } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaShoppingCart,
  FaTimes,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import FoodCard from "./FoodCard";
import CategoryCard from "./CategoryCard";
import TrackDelivery from "./TrackDelivery";
import ShopCard from "./ShopCard";
import useCurrentOrder from "../Hooks/useCurrentOrder.js";
import useGetCity from "../Hooks/useGetCity.jsx";
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  setShopsInMyCity,
} from "../redux/userSlice";
import axios from "axios";
import { serverUrl } from "../config";

import menu_1 from "../assets/menu_1.png";
import menu_2 from "../assets/menu_2.png";
import menu_3 from "../assets/menu_3.png";
import menu_4 from "../assets/menu_4.png";
import menu_5 from "../assets/menu_5.png";
import menu_6 from "../assets/menu_6.png";
import menu_7 from "../assets/menu_7.png";
import menu_8 from "../assets/menu_8.png";

// Robust Razorpay loader (loads once and resolves when ready)
let razorpayPromise;
function loadRazorpayOnce() {
  if (window.Razorpay && typeof window.Razorpay === "function") return Promise.resolve(true);
  if (razorpayPromise) return razorpayPromise;
  razorpayPromise = new Promise((resolve) => {
    const src = "https://checkout.razorpay.com/v1/checkout.js";
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      if (window.Razorpay && typeof window.Razorpay === "function") resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return razorpayPromise;
}

// Memoized address form to keep focus stable
const AddressFormPreview = memo(function AddressFormPreview({
  fullName, phone, addr, addrCity, addrState, pincode,
  onFullName, onPhone, onAddr, onAddrCity, onAddrState, onPincode,
  totalDisplay, addrError
}) {
  return (
    <div className="hidden md:flex flex-col w-[60%] h-full bg-white">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
        <p className="text-sm text-gray-500 mt-1">Add delivery address and review your order</p>
      </div>

      <div className="p-6 overflow-y-auto space-y-6">
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-800">Delivery Address</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Recipient Name</label>
              <input value={fullName} onChange={onFullName}
                     className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Phone</label>
              <input value={phone} onChange={onPhone}
                     className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Address</label>
              <textarea rows={3} value={addr} onChange={onAddr}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none"
                        placeholder="House no, street, area" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">City</label>
              <input value={addrCity} onChange={onAddrCity}
                     className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">State</label>
              <input value={addrState} onChange={onAddrState}
                     className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Pincode</label>
              <input value={pincode} onChange={onPincode}
                     className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none" />
            </div>
          </div>

          {addrError && <div className="text-red-600 text-sm">{addrError}</div>}
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Order Summary</h3>
          <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
            <span>Total</span><span>₹{totalDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

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
    address: savedAddress,
    state: savedState,
    userData,
  } = useSelector((state) => state.user || {});

  const [showCart, setShowCart] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [filteredItems, setFilteredItems] = useState(itemsInMyCity || []);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userOrders, setUserOrders] = useState([]);

  const [selectedShop, setSelectedShop] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [isLoadingShopItems, setIsLoadingShopItems] = useState(false);
  const [shopError, setShopError] = useState("");

  // Address form state for overlay
  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [phone, setPhone] = useState(userData?.mobile || "");
  const [addr, setAddr] = useState(savedAddress || "");
  const [addrCity, setAddrCity] = useState(currentCity || "");
  const [addrState, setAddrState] = useState(savedState || "");
  const [pincode, setPincode] = useState("");
  const [addrError, setAddrError] = useState("");

  // Stable handlers (prevent input node replacement)
  const onFullName = useCallback((e)=>setFullName(e.target.value),[]);
  const onPhone = useCallback((e)=>setPhone(e.target.value),[]);
  const onAddr = useCallback((e)=>setAddr(e.target.value),[]);
  const onAddrCity = useCallback((e)=>setAddrCity(e.target.value),[]);
  const onAddrState = useCallback((e)=>setAddrState(e.target.value),[]);
  const onPincode = useCallback((e)=>setPincode(e.target.value),[]);

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

  const cartTotalNum = useMemo(
    () => (cart || []).reduce((t, i) => t + (Number(i.price) || 0) * (i.quantity || 1), 0),
    [cart]
  );
  const cartTotal = cartTotalNum.toFixed(2);
  const cartItemsCount = (cart || []).reduce((c, i) => c + (i.quantity || 0), 0);

  useEffect(() => {
    if (selectedShop) return;
    if (selectedCategory) {
      const filtered = (itemsInMyCity || []).filter(
        (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(itemsInMyCity || []);
    }
  }, [selectedCategory, itemsInMyCity, selectedShop]);

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

  const handleAddToCart = (item) => dispatch(addToCart(item));
  const handleRemoveFromCart = (itemId) => dispatch(removeFromCart(itemId));
  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) dispatch(removeFromCart(itemId));
    else dispatch(updateCartQuantity({ itemId, quantity }));
  };

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

  const validateAddress = () => {
    if (!fullName.trim()) return "Enter name";
    if (!phone.trim() || phone.trim().length < 8) return "Enter valid phone";
    if (!addr.trim()) return "Enter address";
    if (!addrCity.trim()) return "Enter city";
    if (!addrState.trim()) return "Enter state";
    if (!pincode.trim() || pincode.trim().length < 4) return "Enter valid pincode";
    return "";
  };

  const handleCheckout = async () => {
    if ((cart || []).length === 0) return;
    setIsProcessingPayment(true);
    setAddrError("");

    const v = validateAddress();
    if (v) {
      setAddrError(v);
      setIsProcessingPayment(false);
      return;
    }

    try {
      // Create order on backend
      const orderData = {
        items: (cart || []).map((item) => ({
          itemId: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: cartTotal,
        deliveryAddress: {
          name: fullName,
          phone,
          address: addr,
          city: addrCity,
          state: addrState,
          pincode,
        },
      };

      const { data } = await axios.post(`${serverUrl}/api/order/create`, orderData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      // Load SDK once
      const ok = await loadRazorpayOnce();
      if (!ok || !window.Razorpay || typeof window.Razorpay !== "function") {
        alert("Unable to load Razorpay. Check network/ad-blockers and try again.");
        setIsProcessingPayment(false);
        return;
      }

      // Validate server fields
      const rzpOrderId = data?.id || data?.razorpayOrder?.id || data?.order?.razorpayOrderId;
      const amountPaise = Number(data?.amount || Math.round(Number(cartTotal) * 100));
      const currency = data?.currency || "INR";
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!keyId) {
        alert("Payment key missing. Set VITE_RAZORPAY_KEY_ID.");
        setIsProcessingPayment(false);
        return;
      }
      if (!rzpOrderId || !amountPaise) {
        alert("Invalid order response from server.");
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amountPaise,
        currency,
        name: "Country Kitchen",
        description: "Food Order Payment",
        order_id: rzpOrderId,
        prefill: {
          name: fullName || currentOrder?.userName || "",
          email: userData?.email || currentOrder?.userEmail || "",
          contact: phone || currentOrder?.userPhone || "",
        },
        theme: { color: "#ff4d2d" },
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
            await fetchOrders();
            alert("Payment successful!");
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessingPayment(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to initiate payment.");
      setIsProcessingPayment(false);
    }
  };

  const handleCategoryClick = (category) =>
    setSelectedCategory(selectedCategory === category ? "" : category);

  const handleShopClick = async (shop) => {
    try {
      setSelectedShop(shop);
      setShopItems([]);
      setShopError("");
      setIsLoadingShopItems(true);

      try {
        const { data } = await axios.get(`${serverUrl}/api/item/by-shop/${shop._id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        const list = data?.items || data?.data || [];
        setShopItems(Array.isArray(list) ? list : []);
      } catch {
        const list = (itemsInMyCity || []).filter(
          (it) => String(it?.shop?._id || it?.shopId || it?.shopIdRef) === String(shop._id)
        );
        setShopItems(list);
      }

      setSelectedCategory("");
    } catch (err) {
      setShopError("Failed to load shop items");
    } finally {
      setIsLoadingShopItems(false);
    }
  };

  const clearSelectedShop = () => {
    setSelectedShop(null);
    setShopItems([]);
    setShopError("");
  };

  const totalDisplay = useMemo(()=>cartTotal, [cartTotal]);

  return (
    <div className="w-full min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6]">
      <Navbar cartItemsCount={cartItemsCount} onCartClick={() => setShowCart(true)} />
      <Header />

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
              <div key={shop._id || index} onClick={() => handleShopClick(shop)} className="cursor-pointer">
                <ShopCard shop={shop} />
              </div>
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
            {selectedShop
              ? `Items of ${selectedShop?.name || "Shop"}`
              : selectedCategory
              ? `${selectedCategory} Items`
              : "Suggested Food Items"}
          </h1>

          <div className="flex gap-3">
            {selectedShop && (
              <button onClick={clearSelectedShop} className="text-red-500 hover:text-red-700 font-medium">
                Clear Shop
              </button>
            )}
            {!selectedShop && selectedCategory && (
              <button onClick={() => setSelectedCategory("")} className="text-red-500 hover:text-red-700 font-medium">
                Clear Filter
              </button>
            )}
          </div>
        </div>

        <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
          {selectedShop ? (
            isLoadingShopItems ? (
              <div className="text-center text-gray-500 py-8">Loading items...</div>
            ) : shopError ? (
              <div className="text-center text-red-500 py-8">{shopError}</div>
            ) : (shopItems || []).length === 0 ? (
              <div className="text-center text-gray-500 py-8">No items found for this shop</div>
            ) : (
              (shopItems || []).map((item, index) => (
                <FoodCard
                  key={item._id || index}
                  data={item}
                  onAddToCart={handleAddToCart}
                  cartItem={(cart || []).find((cartItem) => cartItem._id === item._id)}
                />
              ))
            )
          ) : (filteredItems || []).length === 0 ? (
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

      {/* Overlay: left address form + right cart drawer */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          {/* LEFT: Address + summary */}
          <AddressFormPreview
            fullName={fullName}
            phone={phone}
            addr={addr}
            addrCity={addrCity}
            addrState={addrState}
            pincode={pincode}
            onFullName={onFullName}
            onPhone={onPhone}
            onAddr={onAddr}
            onAddrCity={onAddrCity}
            onAddrState={onAddrState}
            onPincode={onPincode}
            totalDisplay={cartTotal}
            addrError={addrError}
          />

          {/* RIGHT: Cart drawer */}
          <div className="ml-auto bg-white w-full max-w-md h-full overflow-y-auto">
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
                          <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} className="bg-gray-200 p-1 rounded">
                            <FaMinus size={12} />
                          </button>
                          <span className="px-2">{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} className="bg-gray-200 p-1 rounded">
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

      <Footer />
    </div>
  );
};

export default UserDashboard;
