// src/Hooks/useGetItemByCity.jsx - FIXED
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config.js";
import { setItemsInMyCity } from "../redux/userSlice.js";

function useGetItemsInMyCity() {
  const dispatch = useDispatch();
  const { city: currentCity } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentCity || currentCity === "Detecting...") return;

    const fetchItems = async () => {
      try {
        console.log("🍽️ Fetching items for city:", currentCity);
        const res = await axios.get(`${serverUrl}/api/item/city/${currentCity}`, { 
          withCredentials: true 
        });
        
        console.log("✅ Items fetched:", res.data);
        dispatch(setItemsInMyCity(res.data.items || []));
      } catch (err) {
        console.warn("❌ Fetch Items Error:", err.response?.data || err.message);
        // Don't clear user data on item fetch failure
        dispatch(setItemsInMyCity([]));
      }
    };

    fetchItems();
  }, [dispatch, currentCity]);
}

export default useGetItemsInMyCity;