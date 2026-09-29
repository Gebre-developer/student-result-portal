// client/src/services/api.js

// ✅ FIXED: Safely handles any malformed environment variables and trailing slashes
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Clean up any literal variable prefixes if Vercel copy-pasted the key name into the input value box
  if (url.startsWith("VITE_API_URL=")) {
    url = url.replace("VITE_API_URL=", "");
  }

  // ✅ CORRECTION: This removes trailing slashes cleanly without breaking string structures
  url = url.replace(/\/\$/, "");

  // If the URL doesn't already end with /api, append it to match backend route mount points
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }

  return url;
};
