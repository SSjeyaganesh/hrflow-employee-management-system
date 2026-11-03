import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : undefined);

if (!apiBaseUrl) {
  throw new Error("VITE_API_URL must be configured for production.");
}

const api = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/, ""),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;