import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config.js";

import { setShopInMyCity, clearUserData } from "../redux/userSlice.js";
//           ^^^^^^^^^^^^
//           Fixed: uppercase 'C' in "City"

function useGetShopByCity() {
  const dispatch = useDispatch();
  const { city: currentCity } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentCity) return;

    const fetchShops = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        dispatch(clearUserData());
        return;
      }

      try {
        const res = await axios.get(`${serverUrl}/api/shop/get-by-city/${encodeURIComponent(currentCity)}`, { withCredentials: true });
        dispatch(setShopInMyCity(res.data.shops || res.data));
      } catch (err) {
        console.warn("Fetch Shops Error:", err.response?.data || err.message);
        dispatch(clearUserData());
      }
    };

    fetchShops();
  }, [dispatch, currentCity]);
}

export default useGetShopByCity;
