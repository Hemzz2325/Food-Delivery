import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config.js";
import { setUserData, clearUserData } from "../redux/userSlice.js";

function useGetCurrUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        dispatch(clearUserData());
        return;
      }

      try {
        const res = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
        dispatch(setUserData(res.data.user));
      } catch (err) {
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

  return null;
}

export default useGetCurrUser;
