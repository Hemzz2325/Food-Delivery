import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config.js";
import { setCurrentOrder } from "../redux/userSlice.js";

function useCurrentOrder() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const res = await axios.get(`${serverUrl}/api/order/current`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(setCurrentOrder(res.data.order));
      } catch (err) {
        console.warn("Fetch current order failed:", err.response?.data || err.message);
      }
    };

    fetchOrder();
  }, [dispatch]);
}

export default useCurrentOrder;
