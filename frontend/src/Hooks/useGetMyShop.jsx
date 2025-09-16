import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config.js";
import { setMyShopData, clearShopData, setLoading, setError } from "../redux/ownerSlice.js";

function useGetMyshop() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMyShop = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        dispatch(clearShopData());
        return;
      }

      try {
        dispatch(setLoading(true));
        const res = await axios.get(`${serverUrl}/api/shop/my`, { withCredentials: true });

        dispatch(setMyShopData(res.data.shop || res.data));
      } catch (err) {
        console.warn("Fetch MyShop Error:", err.response?.data || err.message);
        dispatch(setError(err.response?.data?.message || "Failed to fetch shop"));
        dispatch(clearShopData());
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMyShop();
    // run once on mount
  }, [dispatch]);
}

export default useGetMyshop;
