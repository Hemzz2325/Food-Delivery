import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config.js";
import { setItemsInMyCity, clearUserData } from "../redux/userSlice.js";

function useGetItemsInMyCity() {
  const dispatch = useDispatch();
  const { city: currentCity } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentCity) return;

    const fetchItems = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        dispatch(clearUserData());
        return;
      }

      try {
        const res = await axios.get(`${serverUrl}/api/item/city/${city}`, { withCredentials: true });
        // backend returns { items }
        dispatch(setItemsInMyCity(res.data.items || res.data));
      } catch (err) {
        if (err.response?.status === 401) {
          console.info("Fetch Items: unauthorized");
        } else {
          console.warn("Fetch Items Error:", err.response?.data || err.message);
        }
        dispatch(clearUserData());
      }
    };

    fetchItems();
  }, [dispatch, currentCity]);
}

export default useGetItemsInMyCity;
