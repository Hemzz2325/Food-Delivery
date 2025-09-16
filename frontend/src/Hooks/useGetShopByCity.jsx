import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../config.js";

function useGetShopByCity() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const city = useSelector(state => state.user.city); // get city from Redux

  useEffect(() => {
    if (!city || city === "Detecting...") return; // don't fetch until city is ready

    const fetchShops = async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/shop/city/${city}`);
        setShops(data.shops || []);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Shops Error:", err.message);
        setLoading(false);
      }
    };

    fetchShops();
  }, [city]);

  return { shops, loading };
}

export default useGetShopByCity;
