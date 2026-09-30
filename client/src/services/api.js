// client/src/services/api.js

// ✅ FIXED: Dynamically appends /api to the base URL and sanitizes trailing slashes safely
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Clean up any literal variable prefixes if copied into the dashboard input box
  if (url.startsWith("VITE_API_URL=")) {
    url = url.replace("VITE_API_URL=", "");
  }

  // ✅ FIXED: Correct regex pattern without escaping $ to match end of string
  url = url.replace(/\/$/, "");

  // ✅ Append /api if not present
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

  // Combines into your server address
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
