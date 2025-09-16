// src/Hooks/useGetCity.jsx - FIXED VERSION
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
      if (cached && cached.city && cached.city !== "Detecting..." && cached.timestamp) {
        // Check if cache is less than 1 hour old
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - cached.timestamp < oneHour) {
          dispatch(setCity(cached.city));
          if (cached.state) dispatch(setState(cached.state));
          if (cached.address) dispatch(setAddress(cached.address));
          console.log("✅ Using cached location:", cached.city);
          return; // Use cached data and skip API calls
        }
      }
    } catch (e) {
      console.warn("Failed to load cached location:", e);
    }

    // Show detecting state if no valid cache
    dispatch(setCity("Detecting..."));

    const applyLocation = async (city, stateName, address) => {
      console.log("📍 Applying location:", { city, stateName, address });

      if (city) dispatch(setCity(city));
      if (stateName) dispatch(setState(stateName));
      if (address) dispatch(setAddress(address));

      // Cache the location with timestamp
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
        const token = localStorage.getItem("authToken");
        if (token) {
          await axios.post(
            `${serverUrl}/api/user/location`,
            { city, state: stateName, address },
            { 
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log("✅ Location updated on backend");
        }
      } catch (err) {
        console.warn("Backend location update failed:", err.message);
      }
    };

    const getIPLocation = async () => {
      if (!apiKey) {
        console.warn("❌ VITE_GEOAPIKEY not found in environment");
        dispatch(setCity("Location unavailable"));
        return;
      }

      try {
        console.log("🌐 Fetching IP-based location...");
        const ipRes = await axios.get(
          `https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`,
          { timeout: 10000 }
        );
        
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
        console.error("❌ IP location failed:", error.message);
        dispatch(setCity("Location unavailable"));
      }
    };

    const getGPSLocation = () => {
      if (!navigator?.geolocation) {
        console.warn("❌ Geolocation not supported");
        getIPLocation();
        return;
      }

      if (!apiKey) {
        console.warn("❌ VITE_GEOAPIKEY not found, skipping GPS");
        dispatch(setCity("Location unavailable"));
        return;
      }

      console.log("🛰️ Requesting GPS location...");
      
      const timeoutId = setTimeout(() => {
        console.warn("⏰ GPS timeout, falling back to IP location");
        getIPLocation();
      }, 15000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId);
          
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("📍 GPS coordinates:", { latitude, longitude });

            const res = await axios.get(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`,
              { timeout: 10000 }
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
            console.error("❌ GPS geocoding failed:", err.message);
            getIPLocation();
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn("❌ GPS location denied/failed:", error.message);
          getIPLocation();
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 1000 * 60 * 5  // 5 minutes
        }
      );
    };

    // Start location detection
    getGPSLocation();
  }, [dispatch, apiKey]);
}

export default useGetCity;