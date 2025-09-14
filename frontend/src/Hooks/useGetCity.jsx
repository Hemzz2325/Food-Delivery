// src/Hooks/useGetCity.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setCity, setState, setAddress } from "../redux/userSlice.js";
import { serverUrl } from "../config.js";

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    // Load cached location first
    try {
      const cached = JSON.parse(localStorage.getItem("user_location"));
      if (cached && cached.city && cached.city !== "Detecting...") {
        if (cached.city) dispatch(setCity(cached.city));
        if (cached.state) dispatch(setState(cached.state));
        if (cached.address) dispatch(setAddress(cached.address));
        console.log("✅ Loaded cached location:", cached.city);
      }
    } catch (e) {
      console.warn("Failed to load cached location:", e);
    }

    // Show detecting state only if we don't have cached data
    const cachedData = localStorage.getItem("user_location");
    if (!cachedData) {
      dispatch(setCity("Detecting..."));
    }

    const applyLocation = async (city, stateName, address) => {
      console.log("📍 Applying location:", { city, stateName, address });
      
      if (city) dispatch(setCity(city));
      if (stateName) dispatch(setState(stateName));
      if (address) dispatch(setAddress(address));
      
      // Cache the location
      try {
        localStorage.setItem(
          "user_location",
          JSON.stringify({ 
            city: city || null, 
            state: stateName || null, 
            address: address || null,
            timestamp: Date.now()
          })
        );
      } catch (e) {
        console.warn("Failed to cache location:", e);
      }

      // Send to backend
      try {
        await axios.post(
          `${serverUrl}/api/user/update-location`,
          { city, state: stateName, address },
          { withCredentials: true }
        );
        console.log("✅ Location updated on backend");
      } catch (err) {
        console.warn("Backend location update failed:", err.message);
      }
    };

    const getIPLocation = async () => {
      try {
        console.log("🌐 Fetching IP-based location...");
        const ipRes = await axios.get(`https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`);
        const locationData = ipRes.data?.location || ipRes.data?.ip || {};
        
        const city = locationData.city || null;
        const stateName = locationData.state || null;
        const address = locationData.formatted || null;
        
        if (city) {
          console.log("✅ IP location found:", city);
          applyLocation(city, stateName, address);
        } else {
          console.warn("❌ No city found in IP location");
          dispatch(setCity("Location unavailable"));
        }
      } catch (error) {
        console.error("❌ IP location failed:", error);
        dispatch(setCity("Location unavailable"));
      }
    };

    const getGPSLocation = () => {
      if (!navigator?.geolocation) {
        console.warn("❌ Geolocation not supported");
        getIPLocation();
        return;
      }

      console.log("🛰️ Requesting GPS location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            console.log("📍 GPS coordinates:", { latitude, longitude });
            
            const res = await axios.get(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
            );
            
            const result = res.data?.results?.[0] || {};
            const city = result.city || result.town || result.village || null;
            const stateName = result.state || null;
            const address = result.formatted || null;
            
            if (city) {
              console.log("✅ GPS location found:", city);
              applyLocation(city, stateName, address);
            } else {
              console.warn("❌ No city found in GPS location, falling back to IP");
              getIPLocation();
            }
          } catch (err) {
            console.error("❌ GPS geocoding failed:", err);
            getIPLocation();
          }
        },
        (error) => {
          console.warn("❌ GPS location denied/failed:", error.message);
          getIPLocation();
        },
        { 
          enableHighAccuracy: false, 
          timeout: 10000, 
          maximumAge: 1000 * 60 * 5  // 5 minutes
        }
      );
    };

    // Start location detection
    getGPSLocation();
  }, [dispatch, apiKey]);
}

export default useGetCity;