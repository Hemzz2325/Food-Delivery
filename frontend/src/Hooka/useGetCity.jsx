import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setCity, setState, setAddress } from "../redux/userSlice.js";

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    // If we previously resolved location, use cached value for instant UI on refresh
    try {
      const cached = JSON.parse(localStorage.getItem("user_location"));
      if (cached) {
        if (cached.city) dispatch(setCity(cached.city));
        if (cached.state) dispatch(setState(cached.state));
        if (cached.address) dispatch(setAddress(cached.address));
      }
    } catch (e) {
      // ignore JSON parse errors
    }

    // Indicate we're attempting to detect location (gives immediate feedback)
    try {
      dispatch(setCity("Detecting..."));
    } catch (e) {
      /* ignore */
    }

    // Check permissions API for diagnostics
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((perm) => console.debug("Geolocation permission state:", perm.state))
        .catch((err) => console.debug("Permission query error:", err));
    }

    // Helper to persist and dispatch
    const applyLocation = (city, stateName, address) => {
      if (city) dispatch(setCity(city));
      if (stateName) dispatch(setState(stateName));
      if (address) dispatch(setAddress(address));
      try {
        localStorage.setItem(
          "user_location",
          JSON.stringify({ city: city || null, state: stateName || null, address: address || null })
        );
      } catch (e) {
        // ignore storage errors
      }
    };

    // Try browser geolocation first
  if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
      console.debug("Geolocation success, coords:", position.coords);
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.debug("Calling Geoapify reverse with:", latitude, longitude);
            const res = await axios.get(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
            );
            console.debug("Geoapify reverse response:", res?.data?.features?.[0]);
            const props = res.data?.features?.[0]?.properties || {};
            const city = props.city || props.town || props.village || null;
            const stateName = props.state || null;
            const address = props.formatted || props.address_line2 || props.address_line1 || null;
            applyLocation(city, stateName, address);
          } catch (err) {
            console.error("Get City (reverse) error:", err?.message || err, err);
            // fallback to IP-based lookup
            try {
              console.debug("Attempting IP fallback");
              const ipRes = await axios.get(`https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`);
              console.debug("Geoapify IP response:", ipRes?.data);
              const p = ipRes.data?.ip || {};
              const city = p.city || null;
              const stateName = p.state || null;
              const address = p.formatted || null;
              applyLocation(city, stateName, address);
            } catch (ipErr) {
              console.error("IP fallback error:", ipErr?.message || ipErr, ipErr);
            }
          }
        },
        async (err) => {
          console.warn("Geolocation failed:", err?.message || err, err);
          // On permission denied or other errors, try IP-based lookup
          try {
            console.debug("Attempting IP fallback after geolocation failure");
            const ipRes = await axios.get(`https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`);
            console.debug("Geoapify IP response:", ipRes?.data);
            const p = ipRes.data?.ip || {};
            const city = p.city || null;
            const stateName = p.state || null;
            const address = p.formatted || null;
            applyLocation(city, stateName, address);
          } catch (ipErr) {
            console.error("IP lookup error:", ipErr?.message || ipErr, ipErr);
          }
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 1000 * 60 * 5 }
      );
    } else {
      // No geolocation available; fallback to IP lookup
      (async () => {
        try {
          console.debug("No navigator.geolocation; using IP lookup");
          const ipRes = await axios.get(`https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`);
          console.debug("Geoapify IP response:", ipRes?.data);
          const p = ipRes.data?.ip || {};
          const city = p.city || null;
          const stateName = p.state || null;
          const address = p.formatted || null;
          applyLocation(city, stateName, address);
        } catch (ipErr) {
          console.error("IP lookup error:", ipErr?.message || ipErr, ipErr);
        }
      })();
    }
  }, [dispatch, apiKey]);
}

export default useGetCity;
