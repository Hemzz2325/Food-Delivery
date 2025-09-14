// src/config.js
export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

// Debug log to verify the URL is correct
console.log("🔗 Backend URL:", serverUrl);