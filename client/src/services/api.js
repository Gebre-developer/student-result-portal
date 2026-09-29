// client/src/services/api.js

// ✅ FIXED: Dynamically appends /api to the base URL and sanitizes trailing slashes safely
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Clean up any trailing slashes
  url = url.replace(/\/\$/, "");

  // If the URL doesn't already end with /api, append it to match backend route mount points
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }

  return url;
};

const BASE_URL = getBaseUrl();

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Format the endpoint string so it always guarantees a single leading slash
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  // Combines perfectly into: https://onrender.com
  const response = await fetch(`${BASE_URL}${formattedEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        "Something went wrong with the network request handling pipeline.",
    );
  }

  return response.json();
};
