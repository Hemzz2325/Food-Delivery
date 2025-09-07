import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setCity, setState, setAddress } from "../redux/userSlice.js";

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    console.log("useGetCity: Hook started, API Key:", apiKey ? "Present" : "Missing");
    
    // If we previously resolved location, use cached value for instant UI on refresh
    try {
      const cached = JSON.parse(localStorage.getItem("user_location"));
      console.log("useGetCity: Cached location:", cached);
      if (cached) {
        if (cached.city) {
          console.log("useGetCity: Setting cached city:", cached.city);
          dispatch(setCity(cached.city));
        }
        if (cached.state) dispatch(setState(cached.state));
        if (cached.address) dispatch(setAddress(cached.address));
      }
    } catch (e) {
      console.error("useGetCity: Error parsing cached location:", e);
    }

    // Helper to persist and dispatch
    const applyLocation = (city, stateName, address) => {
      console.log("useGetCity: Applying location:", { city, stateName, address });
      if (city) dispatch(setCity(city));
      if (stateName) dispatch(setState(stateName));
      if (address) dispatch(setAddress(address));
      try {
        localStorage.setItem(
          "user_location",
          JSON.stringify({ city: city || null, state: stateName || null, address: address || null })
        );
        console.log("useGetCity: Location saved to localStorage");
      } catch (e) {
        console.error("useGetCity: Error saving to localStorage:", e);
      }
    };

    // Check if API key is available
    if (!apiKey) {
      console.error("useGetCity: API key is missing. Please check VITE_GEOAPIKEY environment variable.");
      return;
    }

    // Try browser geolocation first
    if (navigator?.geolocation) {
      console.log("useGetCity: Requesting geolocation permission...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log("useGetCity: Got coordinates:", { latitude, longitude });
            
            const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`;
            console.log("useGetCity: Making reverse geocoding request to:", url.replace(apiKey, "***"));
            
            const res = await axios.get(url);
            console.log("useGetCity: Reverse geocoding response:", res.data);
            
            const props = res.data?.features?.[0]?.properties || {};
            console.log("useGetCity: Extracted properties:", props);
            
            const city = props.city || props.town || props.village || props.municipality || props.county || null;
            const stateName = props.state || props.state_code || null;
            const address = props.formatted || props.display_name || props.address_line2 || props.address_line1 || null;
            
            console.log("useGetCity: Parsed location data:", { city, stateName, address });
            
            if (city || stateName || address) {
              applyLocation(city, stateName, address);
            } else {
              console.warn("useGetCity: No usable location data found in response");
              // Try IP fallback
              await tryIPFallback();
            }
          } catch (err) {
            console.error("useGetCity: Reverse geocoding error:", err?.response?.data || err?.message || err);
            // fallback to IP-based lookup
            await tryIPFallback();
          }
        },
        async (err) => {
          console.warn("useGetCity: Geolocation failed:", err?.message || err);
          console.log("useGetCity: Error code:", err?.code, "- Message:", err?.message);
          // On permission denied or other errors, try IP-based lookup
          await tryIPFallback();
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, // Increased timeout
          maximumAge: 1000 * 60 * 5 
        }
      );
    } else {
      console.log("useGetCity: Geolocation not available in this browser");
      // No geolocation available; fallback to IP lookup
      await tryIPFallback();
    }

    // IP fallback function
    async function tryIPFallback() {
      try {
        console.log("useGetCity: Trying IP-based location...");
        const ipUrl = `https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`;
        console.log("useGetCity: Making IP request to:", ipUrl.replace(apiKey, "***"));
        
        const ipRes = await axios.get(ipUrl);
        console.log("useGetCity: IP response:", ipRes.data);
        
        const p = ipRes.data?.location || ipRes.data?.ip || {};
        console.log("useGetCity: IP location data:", p);
        
        const city = p.city || null;
        const stateName = p.state || p.region || null;
        const address = p.formatted || `${p.city}, ${p.state}` || null;
        
        console.log("useGetCity: IP parsed location:", { city, stateName, address });
        
        if (city || stateName) {
          applyLocation(city, stateName, address);
        } else {
          console.error("useGetCity: No location data available from IP lookup either");
        }
      } catch (ipErr) {
        console.error("useGetCity: IP lookup error:", ipErr?.response?.data || ipErr?.message || ipErr);
      }
    }
  }, [dispatch, apiKey]);

  // Return nothing, this hook just manages side effects
  return null;
}

export default useGetCity;