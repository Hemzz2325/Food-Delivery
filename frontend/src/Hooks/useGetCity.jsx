import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setCity, setState, setAddress } from "../redux/userSlice.js";
import { serverUrl } from "../config.js"; // your backend server

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("user_location"));
      if (cached) {
        if (cached.city) dispatch(setCity(cached.city));
        if (cached.state) dispatch(setState(cached.state));
        if (cached.address) dispatch(setAddress(cached.address));
      }
    } catch (e) {}

    dispatch(setCity("Detecting..."));

    const applyLocation = async (city, stateName, address) => {
      if (city) dispatch(setCity(city));
      if (stateName) dispatch(setState(stateName));
      if (address) dispatch(setAddress(address));
      try {
        localStorage.setItem(
          "user_location",
          JSON.stringify({ city: city || null, state: stateName || null, address: address || null })
        );
      } catch (e) {}

      // Send to backend (added without changing your existing logic)
      try {
        await axios.post(
          `${serverUrl}/api/user/update-location`,
          { city, state: stateName, address },
          { withCredentials: true }
        );
      } catch (err) {
        console.warn("Backend update location failed:", err.message);
      }
    };

    const getIPLocation = async () => {
      try {
        const ipRes = await axios.get(`https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`);
        const p = ipRes.data?.ip || {};
        const city = p.city || null;
        const stateName = p.state || null;
        const address = p.formatted || null;
        applyLocation(city, stateName, address);
      } catch (_) {}
    };

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const res = await axios.get(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
            );
            const props = res.data?.features?.[0]?.properties || {};
            const city = props.city || props.town || props.village || null;
            const stateName = props.state || null;
            const address = props.formatted || null;
            applyLocation(city, stateName, address);
          } catch (err) {
            getIPLocation();
          }
        },
        async (err) => {
          getIPLocation();
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 1000 * 60 * 5 }
      );
    } else {
      getIPLocation();
    }
  }, [dispatch, apiKey]);
}

export default useGetCity;
