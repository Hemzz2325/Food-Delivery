import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config.js";
import { setMyShopData } from "../redux/ownerSlice.js";

import { setUserData,clearUserData } from "../redux/userSlice.js";

function useGetMyshop() {
  const dispatch = useDispatch(); // ✅ must be at top level, not inside useEffect

  useEffect(() => {
    const fetchCurrentUser = async () => {
      // If there's no client-side token saved, skip the request and clear state.
      const token = localStorage.getItem("authToken");
      if (!token) {
        dispatch(clearUserData());
        return;
      }

      try {
        const res = await axios.get(`${serverUrl}/api/shop/get-myShop`, {
          withCredentials: true,
        });

        // save shop data
        dispatch(setMyShopData(res.data.shop || res.data));
      } catch (err) {
        // handle 401 (unauthorized) quietly, other errors as warnings
        if (err.response?.status === 401) {
          console.info("Fetch Current User: unauthorized");
        } else {
          console.warn("Fetch Current User Error:", err.response?.data || err.message);
        }
        dispatch(clearUserData());
      }
    };

    fetchCurrentUser();
  }, [dispatch]);

  return null; // hook doesn’t return anything
}

export default useGetMyshop;
