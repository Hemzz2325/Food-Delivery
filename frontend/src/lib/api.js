// frontend/src/lib/api.js
import axios from "axios";
import { serverUrl } from "../config";

const api = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
  timeout: 15000,
});

// simple retry flag per request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const cfg = error.config || {};
    const status = error?.response?.status;

    // Retry once on network errors/timeouts
    if (!cfg.__retried && (error.code === "ECONNABORTED" || !error.response)) {
      cfg.__retried = true;
      return api(cfg);
    }

    // Optional: global 401 handling (redirect to signin)
    if (status === 401 && !cfg.__isAuthRoute) {
      try {
        // location-based redirect is simplest without adding router here
        window.location.href = "/signin";
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
